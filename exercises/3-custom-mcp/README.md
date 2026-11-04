# Hands-on 3: your own MCP server

Time: 10 minutes. You need:

- [Hands-on 2A](../2a-mcp/README.md) done: the Gloamwick share attached in your MotherDuck account
  (its step 3 does it), and your agent connected to the MotherDuck MCP server (the bonus uses it).
- git, and Claude Code, Codex or Cursor. uv from hands-on 0.
- A MotherDuck token and your OpenRouter key (the workshop key, for level 4), in `.env`.

[`server.py`](server.py) is a small MCP server that sits in front of MotherDuck's, following the
[MotherDuck white-label guide](https://motherduck.com/docs/key-tasks/ai-and-motherduck/mcp-workflows/white-label-mcp-server/).
Three things to look for:

- **A tool only your server has.** `live_ops_impact` holds the SQL for a question the business asks
  every week. No other MCP server has it. The other tools forward MotherDuck's under your names.
- **The token is yours to pick.** The server calls MotherDuck with whatever is in
  `MOTHERDUCK_TOKEN` in your `.env`, and the agent never sees it. Start it with a
  [service account](https://motherduck.com/docs/key-tasks/service-accounts-guide/create-and-configure-service-accounts/)'s
  token and every user of your server gets exactly that account's rights: only the databases and
  shares it was granted, read-only with a read scaling token, and with a
  [secure view](https://motherduck.com/docs/key-tasks/sharing-data/secure-views/) on the share, only
  the rows and columns it allows.
- **Every question is logged** with its SQL in `questions.jsonl`.

The server runs on your laptop and serves MCP on `http://127.0.0.1:8000/mcp`. Agents on your laptop
can reach it (Claude Code, Codex, Cursor). claude.ai on the web and ChatGPT cannot reach your laptop:
you would deploy the server first.

## Steps

The prompts are the same as on the slide. Paste them as they are.

1. Clone the repo and fill in `.env` ([token](https://app.motherduck.com/settings/tokens),
   [OpenRouter key](https://motherduck.com/minter/w/next-data-stack-has-no-ui/)). Then ask about the server.
   The commands clone the repo into your workshop folder and create `.env` from the example. Open
   it and fill in `MOTHERDUCK_TOKEN` (in MotherDuck: **Settings**, **Integrations**, **Access
   tokens**) and `OPENROUTER_API_KEY` (your key from the minter).

   ```sh
   cd ~/gloamwick && git clone https://github.com/motherduckdb/agentic-analytics-workshop-dataoutpost.git
   cd agentic-analytics-workshop-dataoutpost && cp .env.example .env
   ```

   Paste:

   > Explain agentic-analytics-workshop-dataoutpost/exercises/3-custom-mcp/server.py in five lines: its tools, the one that only exists here, where the token comes from, what it logs.

2. Start the server in a second terminal. It reads `.env` and serves `http://127.0.0.1:8000/mcp`.
   Leave it running.

   ```sh
   cd ~/gloamwick/agentic-analytics-workshop-dataoutpost/exercises/3-custom-mcp && uv run server.py
   ```

3. Add it to your agent (Claude Code, then Codex), and restart the agent:

   ```sh
   claude mcp add --scope user --transport http company-data http://127.0.0.1:8000/mcp
   codex mcp add company-data --url http://127.0.0.1:8000/mcp
   ```

   The first line is for Claude Code (`/mcp` should then show `company-data` connected), the second
   for Codex (`codex mcp list` should then show it). Other agents: add an HTTP MCP server with that URL.

4. Ask with your tools only. Watch for `live_ops_impact`: only your server has it. It is the
   workshop question again. Paste:

   > Use only the company-data tools. Which live-ops changes since spring 2025 moved day-7 retention or revenue per daily active user, and on which platform? Show the SQL.

5. Look at what your server logged, with DuckDB. Paste:

   > Use the DuckDB CLI to show agentic-analytics-workshop-dataoutpost/exercises/3-custom-mcp/questions.jsonl as a table: time, question and outcome.

6. Bonus: restart the server with traces, ask again, then build a Dive over them. Stop the server
   with Ctrl-C and start it with tracing on:

   ```sh
   TRACE_TO_MOTHERDUCK=1 uv run server.py
   ```

   Paste, in an agent that also has the MotherDuck MCP server from 2A:

   > Build a Dive over workshop_traces like the Agent observability Dive in the MotherDuck Dive gallery: the traces from agent_traces, and the run tree of one trace from spans.

## Done when

Your agent answered with your tools only, it called `live_ops_impact`, and you saw your question log
as a table.

## About the bonus

[`traces.py`](traces.py) turns each tool call into an
[OpenTelemetry GenAI](https://opentelemetry.io/docs/specs/semconv/gen-ai/) span (`execute_tool`, the
tool name, the question, the SQL, the duration, the status) and writes it as a row to
`workshop_traces.spans` in your MotherDuck account, with the same columns as the data behind the
[Agent observability Dive](https://motherduck.com/dive-gallery/dives/agent-observability). The
`agent_traces` view has one row per trace. It is off unless `TRACE_TO_MOTHERDUCK=1`.

Here you only get tool spans: the model runs inside your agent, out of the server's sight. Level 4
traces the whole run, with tokens and cost. You can also query the spans yourself:

```sh
motherduck query "FROM workshop_traces.spans ORDER BY start_time DESC LIMIT 10"
```

## If you finish early

- Add your own tool: copy `live_ops_impact` into a `starter_conversion` tool with the SQL from
  level 2, restart the server, and ask the 2B question.
- Create a [service account](https://motherduck.com/docs/key-tasks/service-accounts-guide/create-and-configure-service-accounts/)
  (the free plan allows two), give it the Gloamwick share, and start your server with its token
  instead of yours. Same tools, other rights.

## Notes

- `server.py` and `agent.py` read the `.env` at the root of the repo, whatever folder they run in.
  A variable already set in your environment wins over `.env`. The server only takes the MotherDuck
  values from it: your OpenRouter key never reaches the server.
- `--scope user` makes Claude Code see the server in every folder, not only the one you ran the
  command in.
- `PORT` changes the port (default 8000), `COMPANY_DB` the database (default
  `gaming_gloamwick_liveops`), `QUESTION_LOG` the log file. They can go in `.env` too.
- `uv run server.py --stdio` speaks MCP on stdin and stdout instead. Level 4's `agent.py` starts it
  that way.
- `how_we_count` and `read_definition` forward `get_query_guide` and `get_guide`, so the guide you
  wrote in 2B still reaches the agent.
- Read scaling (read-only) tokens and secure views need a paid plan (secure views: Business or
  Enterprise, trials count). On the free plan the token story stops at the service account: it only
  reaches the shares you grant it.
