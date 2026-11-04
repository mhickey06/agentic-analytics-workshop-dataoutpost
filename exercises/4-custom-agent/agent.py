# /// script
# requires-python = ">=3.11"
# dependencies = ["fastmcp==4.0.3", "httpx", "opentelemetry-sdk==1.45.2", "duckdb==1.5.6", "python-dotenv==1.2.4"]
# ///
"""Level 4: the whole agent. Your loop, your model, your tools.

The model is any OpenRouter model (OPENROUTER_API_KEY, MODEL, from your environment or the repo's
.env, see .env.example). The workshop key allows
openai/gpt-6-luna (default), anthropic/claude-haiku-5.5 and anthropic/claude-sonnet-5.5.
The tools come from your level 3 MCP server, started as a subprocess.

    uv run agent.py "Which live-ops changes moved retention and ARPDAU?"

Bonus: TRACE_TO_MOTHERDUCK=1 writes the run as OpenTelemetry GenAI spans to MotherDuck:
invoke_agent, then chat (tokens, cost) and execute_tool (see ../3-custom-mcp/traces.py).
"""

import asyncio
import json
import os
import sys
from pathlib import Path

import httpx
from dotenv import find_dotenv, load_dotenv
from fastmcp import Client
from fastmcp.client.transports import StdioTransport

load_dotenv(find_dotenv(usecwd=True) or find_dotenv())  # the repo's .env; the environment wins

MODEL = os.environ.get("MODEL", "openai/gpt-6-luna")
MAX_STEPS = int(os.environ.get("MAX_STEPS", "12"))
SERVER = Path(__file__).parent.parent / "3-custom-mcp" / "server.py"
SYSTEM = "You answer business questions with the tools you have. Show the numbers and the SQL you relied on."

sys.path.insert(0, str(SERVER.parent))
import traces  # noqa: E402  (the bonus tracing, shared with the level 3 server)

TRACER = traces.setup("gloamwick-agent")


def as_openai_tool(tool) -> dict:
    return {
        "type": "function",
        "function": {"name": tool.name, "description": tool.description or "", "parameters": tool.inputSchema},
    }


async def model(messages: list, tools: list) -> dict:
    with TRACER.start_as_current_span(f"chat {MODEL}") as span:
        span.set_attribute("gen_ai.operation.name", "chat")
        span.set_attribute("gen_ai.request.model", MODEL)
        async with httpx.AsyncClient(timeout=120) as http:
            r = await http.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={"Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}"},
                json={"model": MODEL, "messages": messages, "tools": tools},
            )
            r.raise_for_status()
            data = r.json()
        traces.usage(span, data)  # tokens and cost, from OpenRouter's usage object
        traces.ok(span)
        return data["choices"][0]["message"]


async def main(question: str) -> None:
    # The server gets the MotherDuck token. The model never sees it.
    # The agent traces the whole run, so the server does not trace a second time.
    env = {k: v for k, v in os.environ.items() if k != "OPENROUTER_API_KEY"}
    env["TRACE_TO_MOTHERDUCK"] = "0"
    server = StdioTransport(command="uv", args=["run", "-q", str(SERVER), "--stdio"], env=env)
    with traces.agent_span(TRACER, "gloamwick-agent", MODEL, question) as run:
        async with Client(server) as mcp:
            tools = [as_openai_tool(t) for t in await mcp.list_tools()]
            messages = [{"role": "system", "content": SYSTEM}, {"role": "user", "content": question}]
            for step in range(MAX_STEPS):
                reply = await model(messages, tools)
                messages.append(reply)
                if not reply.get("tool_calls"):
                    print(reply.get("content"))
                    traces.ok(run)
                    return
                for call in reply["tool_calls"]:
                    name, args = call["function"]["name"], json.loads(call["function"]["arguments"] or "{}")
                    print(f"[step {step + 1}] {name}({json.dumps(args)[:120]})", file=sys.stderr)
                    with traces.tool_span(TRACER, name, question, args.get("sql"), call["id"]) as span:
                        result = await mcp.call_tool(name, args, raise_on_error=False)
                        traces.finish_tool(span, not getattr(result, "is_error", False))
                    text = "\n".join(c.text for c in result.content if hasattr(c, "text"))
                    messages.append({"role": "tool", "tool_call_id": call["id"], "content": text[:20000]})
            print(f"Stopped after {MAX_STEPS} steps without an answer.")
            traces.fail(run, "max_steps")


if __name__ == "__main__":
    asyncio.run(main(" ".join(sys.argv[1:]) or "What tables do we have?"))
