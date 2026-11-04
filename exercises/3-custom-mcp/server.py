# /// script
# requires-python = ">=3.11"
# dependencies = ["fastmcp==4.0.3", "opentelemetry-sdk==1.45.2", "duckdb==1.5.6", "python-dotenv==1.2.4"]
# ///
"""Level 3 starter: your own MCP server in front of MotherDuck's.

It follows the MotherDuck white-label guide: forward a few tools, rename them,
rewrite their descriptions, add your own tool, and log every question.

Run it:   uv run server.py      serves MCP on http://127.0.0.1:8000/mcp (PORT changes the port)
          uv run server.py --stdio   speaks MCP on stdin/stdout instead (level 4's agent.py uses this)
The MotherDuck token comes from MOTHERDUCK_TOKEN, in your environment or in the repo's .env (see
.env.example). It never reaches the agent.
Bonus: TRACE_TO_MOTHERDUCK=1 writes one OpenTelemetry span per tool call to MotherDuck (traces.py).
"""

import json
import os
import sys
import time
from typing import Any

from dotenv import dotenv_values, find_dotenv
from fastmcp import Client, FastMCP
from fastmcp.client.transports import StreamableHttpTransport

# Settings from the nearest .env (see .env.example), without overriding the environment. Only these
# keys: the OpenRouter key in the same file never reaches the server.
SERVER_KEYS = {"MOTHERDUCK_TOKEN", "motherduck_token", "COMPANY_DB", "QUESTION_LOG", "PORT",
               "TRACE_TO_MOTHERDUCK", "TRACES_DB"}
for key, value in dotenv_values(find_dotenv(usecwd=True) or find_dotenv()).items():
    if key in SERVER_KEYS and value and key not in os.environ:
        os.environ[key] = value

import traces  # noqa: E402  (reads TRACE_TO_MOTHERDUCK, so it comes after the .env)

UPSTREAM = "https://api.motherduck.com/mcp"
DATABASE = os.environ.get("COMPANY_DB", "gaming_gloamwick_liveops")
LOG = os.environ.get("QUESTION_LOG", "questions.jsonl")
TRACER = traces.setup("company-data-mcp")

mcp = FastMCP(
    "company-data",
    instructions=(
        "Data for Gloamwick Studios. For any question about which live-ops changes moved retention "
        "or revenue, call live_ops_impact first: it is the company's standard analysis. "
        "Call how_we_count before writing your own SQL with ask_data. "
        "Every ask_data and live_ops_impact call needs the user's question in plain words."
    ),
)


async def upstream(tool: str, args: dict[str, Any], as_tool: str, question: str | None = None,
                   sql: str | None = None) -> Any:
    # One session per call, so no client is shared between users.
    # One span per call too, named after your tool (bonus, off unless TRACE_TO_MOTHERDUCK=1).
    with traces.tool_span(TRACER, as_tool, question=question, sql=sql) as span:
        try:
            transport = StreamableHttpTransport(
                url=UPSTREAM,
                headers={"Authorization": f"Bearer {motherduck_token()}"},
            )
            async with Client(transport) as client:
                result = (await client.call_tool_mcp(tool, args)).model_dump(by_alias=True, exclude_none=True)
        except Exception as error:
            traces.finish_tool(span, False, type(error).__name__)
            raise
        traces.finish_tool(span, not result.get("isError"))
        return result


def motherduck_token() -> str:
    token = os.environ.get("MOTHERDUCK_TOKEN") or os.environ.get("motherduck_token")
    if not token:
        raise RuntimeError("No MotherDuck token: set MOTHERDUCK_TOKEN in your .env (see .env.example).")
    return token


def log(question: str, sql: str, outcome: str) -> None:
    with open(LOG, "a") as f:
        f.write(json.dumps({"ts": time.time(), "question": question, "sql": sql, "outcome": outcome}) + "\n")


@mcp.tool
async def ask_data(question: str, sql: str) -> Any:
    """Run one read-only DuckDB SQL query on the company database.

    question: the user's question, in their words. It is logged with the SQL.
    sql: DuckDB SQL. Money columns are integer cents.
    """
    result = await upstream("query", {"database": DATABASE, "sql": sql}, "ask_data", question, sql)
    log(question, sql, "error" if result.get("isError") else "ok")
    return result


@mcp.tool
async def list_company_tables() -> Any:
    """List the company's tables and what they hold."""
    return await upstream("list_tables", {"database": DATABASE}, "list_company_tables")


@mcp.tool
async def describe_table(table: str) -> Any:
    """List the columns of one company table."""
    return await upstream("list_columns", {"database": DATABASE, "table": table}, "describe_table")


@mcp.tool
async def how_we_count() -> Any:
    """Read the company's metric definitions before writing SQL."""
    return await upstream("get_query_guide", {}, "how_we_count")


@mcp.tool
async def read_definition(guide_uuid: str) -> Any:
    """Read one guide listed by how_we_count, by its UUID."""
    return await upstream("get_guide", {"uuid": guide_uuid}, "read_definition")


# Your own tool: the SQL for a question the business asks every week.
@mcp.tool
async def live_ops_impact(question: str, days: int = 14) -> Any:
    """The company's standard live-ops analysis. Call it first for any question about which live-ops
    changes moved day-7 retention or revenue per daily active user.

    Returns D7 retention and ARPDAU in the N days before and after each live-ops change, by platform.
    question: the user's question, in their words. It is logged.
    """
    sql = f"""
    SELECT e.event_name, e.start_date, m.platform,
           CASE WHEN m.metric_date < e.start_date THEN 'before' ELSE 'after' END AS period,
           round(100.0 * sum(d7_retained) FILTER (WHERE d7_matured)
                 / nullif(sum(installs) FILTER (WHERE d7_matured), 0), 2) AS d7_retention_pct,
           round((sum(iap_gross_cents) + sum(ad_revenue_millicents) / 1000.0) / sum(dau), 2) AS arpdau_cents
    FROM live_ops_events e
    JOIN daily_player_metrics m
      ON m.metric_date >= e.start_date - {int(days)} AND m.metric_date < e.start_date + {int(days)}
    GROUP BY ALL
    ORDER BY e.start_date, m.platform, period DESC
    """
    result = await upstream("query", {"database": DATABASE, "sql": sql}, "live_ops_impact", question, sql)
    log(question, sql, "error" if result.get("isError") else "ok")
    return result


if __name__ == "__main__":
    if "--stdio" in sys.argv:
        mcp.run(transport="stdio", show_banner=False)
    else:
        port = int(os.environ.get("PORT", "8000"))
        print(f"company-data MCP server on http://127.0.0.1:{port}/mcp, database {DATABASE}", file=sys.stderr)
        mcp.run(transport="http", host="127.0.0.1", port=port, path="/mcp")
