# Hands-on 4: your own agent

Time: 10 minutes. Two paths, pick one:

- **Path A, your own loop in Python** (the steps below). You need the `.env` from level 3
  (MotherDuck token and OpenRouter key) and the level 3 server (this agent starts it for you).
- **Path B, [Agent Builder in the browser](#path-b-agent-builder-in-the-browser)**, no code. You
  need your MotherDuck account and your OpenRouter key. Good if level 3 did not run for you, or to
  see a bigger harness at work.

[`agent.py`](agent.py) is the whole agent in about 60 lines: a loop, a model on OpenRouter, and
the tools from your level 3 MCP server. No permissions, no hooks, no memory: that harness is now
yours to write.

## Steps

Path A. The prompt is the same as on the slide. Paste it as it is.

1. Go to the level 4 folder of the repo you cloned at level 3. `agent.py` reads your OpenRouter key
   and the model from the same `.env` (`MODEL` defaults to `openai/gpt-6-luna`).

   ```sh
   cd ~/gloamwick/agentic-analytics-workshop-dataoutpost/exercises/4-custom-agent
   ```

2. Run your agent on the workshop question:

   ```sh
   uv run agent.py "Which live-ops changes since spring 2025 moved day-7 retention or revenue per daily active user, and on which platform? Show the SQL."
   ```

3. Read the `[step N]` lines. Which tools did it call? Did it call `how_we_count` before writing
   SQL?

4. Swap the model and run the same question again. Compare the steps and the numbers.

   ```sh
   MODEL=anthropic/claude-haiku-5.5 uv run agent.py "Which live-ops changes since spring 2025 moved day-7 retention or revenue per daily active user, and on which platform? Show the SQL."
   ```

5. Change the harness. Run with `MAX_STEPS=2`, or edit `SYSTEM` in `agent.py`. What breaks first?

## Done when

Your agent answers the question on the model you picked, and you can say which tools it called.

## Notes

- The workshop key only allows `openai/gpt-6-luna`, `anthropic/claude-haiku-5.5` and
  `anthropic/claude-sonnet-5.5`. Other models return 403.
- The OpenRouter key never reaches the MCP server, and the MotherDuck token never reaches the
  model.
- The bonus below writes every step to MotherDuck.

## Bonus: the whole run in MotherDuck

`agent.py` uses the same [`traces.py`](../3-custom-mcp/traces.py) as the level 3 server, and here it
sees everything: one `invoke_agent` span per question, a `chat` span per model call with its tokens
and cost (from OpenRouter's usage), and an `execute_tool` span per tool call, nested in one trace.
The rows land in `workshop_traces.spans`, with the same columns as the data behind the
[Agent observability Dive](https://motherduck.com/dive-gallery/dives/agent-observability).

1. Run the agent with tracing on:

   ```sh
   TRACE_TO_MOTHERDUCK=1 uv run agent.py "Which live-ops changes since spring 2025 moved day-7 retention or revenue per daily active user, and on which platform? Show the SQL."
   ```

2. Run it again with another model, so you have two traces to compare.

3. In an agent connected to the MotherDuck MCP server, build the Dive:

   > Build a Dive over workshop_traces like the Agent observability Dive in the MotherDuck Dive gallery: a list of traces from agent_traces with model, latency, tool calls, tokens and cost, and the run tree of one trace from spans.

   Or open the gallery Dive, choose **Copy Dive to My Account**, and ask your agent to point it at
   `workshop_traces`. Its other tables (cases, tools, handoffs) do not exist here, so expect to drop
   those parts.

Tested on 2026-11-03 on `openai/gpt-6-luna`, with the traces in a local DuckDB file
(`TRACES_DB=traces.duckdb`): one run gave 12 spans, about 20k input tokens and $0.003. Not yet
written to MotherDuck itself.

## Path B: Agent Builder in the browser

[Agent Builder](https://motherduck.com/labs/agent-builder) is a web app to build an analytics
agent: you pick the model, the prompt, the tools, the checks, the limits and the schedule. It is
for learning, not for production.

It runs the same loop as `agent.py`: the model picks each step and calls MotherDuck MCP tools. The
harness around it is bigger. It pre-checks every query of the Dive, keeps edits in a draft, blocks
writes to any other Dive, caps steps, tokens, cost and time, verifies the draft and asks you to
approve it. Each run is a MotherDuck Flight in your own account, so its traces stay there.

The template is Dive Keeper, an agent that looks after one Dive. You simulate the data, look at the
Dive, then let the agent run on it.

1. Sign in with MotherDuck, choose **New agent**, then the **Dive Keeper** template.
2. Build, step 1 Access: paste your OpenRouter key. Agent Builder saves it as a MotherDuck secret
   for the agent's Flight.
3. Simulate the data. Build, step 2 Target Dive: click **Prepare the simulation**. It copies
   Gloamwick into a new database in your account, with data up to 2025-03-30, and saves a Dive on
   it as the agent's target.
4. Look at the Dive before the agent runs: click its title to open it in MotherDuck. Note the KPIs,
   the charts and the empty "Flagged by Dive Keeper" panel.
5. Run the agent: click **Preview run**, next to Save, and watch the trace, every harness, model and
   tool step. The first healthy run is the baseline and flags up to 3 findings: open the Dive again
   to see them on its charts. **Open the run in MotherDuck** shows the Flight run, one row per
   model step and tool call.
6. Click **Move the data forward**. It adds a week and says what happened. Click **Preview run**
   again: did the agent see it? Repeat for a few weeks. When it proposes a change, the History tab
   has it: click **Review the change**, then approve it.
7. Compare with `agent.py`. Which of these checks would you add to your loop first?

Done when: you looked at the Dive before the first run, the agent's findings are on it, and the
agent ran again on a week you moved forward.

**Start agent** runs it on its own every 5 minutes for 2 hours, and the Live tab streams each run.
**Start over** makes a fresh simulation from week 1 and deletes the previous one.

- A run costs about $0.002 to $0.005 on the default model, `openai/gpt-6-luna`.
- In your MotherDuck account it creates the databases `agent_builder` (traces, insights, Flight
  steps) and `agent_builder_sim_<id>`, a share, a Dive, a Flight and a secret. Deleting the agent
  removes its Flight and its secret.
