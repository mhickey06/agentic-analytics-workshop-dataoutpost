# Plan

Last updated 2026-11-03. Owners: Mehdi Ouazza and Jacob Matson (MotherDuck).

This file holds the original abstract, what we changed and why, the current agenda, the facts we
checked, the decisions taken and what is still open. The deck in `slides/` follows the same
agenda, and its speaker notes (press N) carry the same details per slide.

## The original abstract

> **The Next Data Stack Has No UI: Building End-to-End Analytics with Agents and Ducks**
> Mehdi Ouazza (MotherDuck) · Jacob Matson (MotherDuck)
>
> What if your next data platform is a conversation instead of a pile of dashboards and config
> screens? I'm not talking about a simple agent that runs SQL queries and returns answers.
>
> Today an agent can do much more: look at raw files, design a schema, deploy infrastructure, ingest
> the data, write transformations, run quality checks, answer questions, publish results, and tear
> down the infrastructure when it's done. So what are we actually building here: a data agent
> sitting on top of an existing stack, or a data stack that an agent builds and operates itself?
>
> In this hands-on workshop, you'll test that distinction yourself by getting an agent to build a
> working analytics stack from scratch, on your own laptop. No slides-only sections. You bring a
> terminal, an agent (Claude Code or similar), and a MotherDuck account. I bring the raw data, the
> prompts, and the failure modes.
>
> We'll work through it in four blocks:
>
> - **Local first.** Point the agent at a few raw files and DuckDB. Let it profile the data, propose
>   a schema, and ingest it. We'll compare what it came up with across the room.
> - **Transform and test.** Have the agent write the transformation layer and its own quality
>   checks, then break the data on purpose and watch how it recovers (or doesn't).
> - **Go to the cloud.** Move the data and workloads to MotherDuck when you need persistence or
>   collaboration, without opening a traditional data platform UI.
> - **Ship and tear down.** Publish something useful, then have the agent discard the
>   infrastructure it created.
>
> Between blocks we'll step back and look at why the DuckDB ecosystem works well for agentic
> workflows and where it falls apart: state, context, reproducibility, permissions, and
> observability. Each of these will show up in your own session, so we'll discuss them from what
> just happened on your screen rather than in the abstract.
>
> You'll leave with a working end-to-end stack you built through conversation, a repo of the
> prompts and guardrails that worked, and a clear opinion on which parts of the stack humans should
> still operate directly, and which parts can become an implementation detail the agent takes care
> of.

## What changed, and why

- **The slot is 90 minutes.** Four build blocks with an agent building ingestion, transforms and
  tests do not fit, and setup alone would eat a third of it.
- **Text to SQL is solved.** Every model writes valid SQL. What breaks analytics agents is
  context, access and trust. So the workshop teaches the fundamentals of an analytics agent and maps
  each one to a MotherDuck feature, with a short hands-on per fundamental.
- **The dataset comes from duckgen** (public S3, with answer keys) instead of the Duckoffee raw
  files built earlier. The Duckoffee kit was removed from the repo on 2026-11-03; it stays in the git
  history for a longer data engineering format.
- **Hands-on runs in a hosted generator** after chapter 1, so nobody installs or deploys anything
  past the first 15 minutes. People tweak the components of their agent, paste a temporary key and
  get a unique link.
- **Access and risk management gets a full chapter.** When MotherDuck's isolated compute and shares
  with row and column security come up, people who were hesitant about AI on their data get
  interested. That reaction is the hook.

What still matches the abstract: local first with DuckDB, MotherDuck without a traditional UI,
shipping something (the agent link), teardown, the discussion themes (state, context,
reproducibility, permissions, observability) and the closing question about what humans should
still operate.

What no longer matches: "no slides-only sections" (each chapter opens with about 4 minutes of
talk), and the agent no longer builds the pipeline itself (Flights get one slide). The abstract can
change; a proposed version is at the end of this file.

## Agenda (90 minutes)

Two ideas first (what an agent is, what an analytics agent has to do), then four levels. At each
level one more part of the agent becomes the participant's own. Every level ends with a hands-on.

| Time | Part | What becomes yours | MotherDuck / DuckDB features | Hands-on |
|---|---|---|---|---|
| 0:00 | Intro | | duckgen, the minter | 0. Setup: a coding agent, a MotherDuck token, one prompt installs the rest (send before the day) |
| 0:06 | 01 The agent | | | Talk only. Sourced definitions, loop, anatomy, levels map |
| 0:18 | 02 The analytics job | | Flights, Dives, Guides, storage, MCP apps | Guess slides |
| 0:26 | Level 1 · Local | a skill file, data on your laptop | DuckDB CLI (agent mode in 2.0, shown) | 1. Load Gloamwick from S3 into local DuckDB, answer the workshop question, local HTML dashboard |
| 0:40 | Level 2 · MotherDuck | data and compute in MotherDuck, anyone can query | remote MCP, Guides, Dives, Flights, Ducklings, shares, secure views | 2A. Connect your agent to the MotherDuck MCP, ask with the share in the prompt. 2B. Add a guide, ask again. 2C. A Dive, restyled from the theme gallery. Outro: can we manage permissions? (secure views) |
| 1:00 | Level 3 · Your tools | the tool surface | white-label MCP pattern | 3. FastMCP proxy: forwarded tools, a domain tool, a question log, add your own tool |
| 1:12 | Level 4 · Your agent | the loop and the model | traces in MotherDuck | 4. `agent.py` on the workshop key: run, read the steps, swap the model, change the harness. Or Agent Builder in the browser (Dive Keeper). Red team is a presenter demo |
| 1:24 | Wrap | | | Recap, discussion, references |

Every hands-on slide mirrors the README of its `exercises/` folder: same numbered steps, same
prompts word for word. The slide build checks it.

Between level 1 and level 2, two slides adapted from the self-hosting DuckDB talk: the boxes you
build to let anyone query (storage, compute, identity, access, context, pipelines, apps,
observability), then the same boxes run by MotherDuck.

| Level | Harness | Model | Tools | Data + compute | Who can use it |
|---|---|---|---|---|---|
| 1 Local | Claude Code (or opencode + workshop key) | managed | DuckDB CLI + skill | laptop | you |
| 2 MotherDuck | managed | managed | A: MotherDuck remote MCP + skill. B: MotherDuck CLI + skill | MotherDuck | anyone you share with |
| 3 Your tools | managed | managed | your MCP server in front of MotherDuck's | MotherDuck | your users |
| 4 Your agent | your loop | GPT-6 Luna, Haiku 5.5 or Sonnet 5.5 on the workshop key | your tools | MotherDuck | anyone you give the script to |

The six fundamentals from the previous plan are covered inside the levels: pipelines and storage in
level 1, context, data apps and access in level 2 (sharing is what makes them necessary),
observability in levels 3 and 4.

### One dataset: Gloamwick Studios

Decided 2026-11-03: everyone works on the same duckgen dataset, Gloamwick Studios
(`gaming-gloamwick-liveops`, S tier, release `20261023-82cb146b-s-r1`). No draw. It is the dataset
all four levels were run on, and it ships four answer keys: `retention_shift`,
`starter_conversion`, `arpdau_monthly`, `placement_revenue`.

- A fictional free-to-play squad battler (Vanguard of Vellmark), iOS and Android, 2024-10-01 to
  2025-09-30. 8 tables, 12.4M rows. Parquet on public S3 for level 1, a MotherDuck share for levels
  2 to 4.
- Six live-ops events: winter festival (2024-12-15), level 12 boss rework (2025-04-10), starter
  pack 4.99 to 1.99 (2025-05-01), rewarded chest video (2025-06-15), summer solstice event
  (2025-07-01), harvest rally (2025-09-05).
- Two questions. The workshop question at every level: "Which live-ops changes since spring 2025
  moved day-7 retention or revenue per daily active user, and on which platform? Show the SQL."
  The guide question at level 2: "Did the starter pack price cut lift payer conversion? Split by
  acquisition channel, before and after. Show the SQL."
- Expected answers, from the answer keys: the boss rework cut Android D7 retention from about 14.8%
  to 10.9% in every channel, iOS flat at about 16.7%. The chest video raised ad ARPDAU (May to July
  2025: Android 1.60 to 3.69 cents, iOS 2.07 to 4.79 cents) and cut iOS sessions from 600 s to
  491 s. The starter pack reprice lifted paid_social conversion from 2.49% to 6.27%, other channels
  flat at about 2.5%.
- `exercises/2b-guide/GUIDE.md` holds definitions only. Checked 2026-11-03 on the S tier
  Parquet: SQL written with its rules returns `retention_shift`, `starter_conversion` and
  `arpdau_monthly` exactly. The traps it fixes: unmatured day-7 cohorts carry `d7_retained = 0`
  (Android after the boss reads 10.45% instead of 10.89% if left in), ad revenue is in millicents,
  averaging `d7_retention_pct` across rows, starter pack cohorts need 7 full days, open-ended events
  end on 9999-12-31.

Rule: the agent never sees the answer key URL, duckgen's `guide.md` or the expected answers. Keep
them out of `exercises/`, where agents run.

### Workshop keys: the minter

<https://motherduck.com/minter/w/next-data-stack-has-no-ui/> gives each participant an OpenRouter
key with $5 of credit, valid Nov 3 to Nov 30 2026, for three models: `anthropic/claude-sonnet-5.5`
($2 / $10 per Mtok, Claude Code's main model), `anthropic/claude-haiku-5.5` and `openai/gpt-6-luna`
($0.10 / $0.50, the level 4 default). Other models return 403, so `agent.py` now defaults to
`openai/gpt-6-luna` instead of the tested Gemini 3.8 Flash.

### Where things live

This repo (`motherduckdb/agentic-analytics-workshop-dataoutpost`) is the source of truth for the
plan, the exercises and the slides. The mehdio-website deck (`src/talks/no-ui-data-stack/`, output
at `/talks/next-data-stack-has-no-ui`, PR #38 for previews) is a copy for hosting: edit
`slides/` here, then copy it over. Last synced 2026-11-03.

## Exercise runs

### Measured on 2026-11-02

All four levels were run end to end on Gloamwick with the workshop question, before the prompts
were rewritten for the slides.

| Level | Run | Measured |
|---|---|---|
| 1 Local | `claude` in `1-local/`, with the skill. DuckDB 1.4 CLI. | 16 turns, 3.4 min, $0.38 |
| 2 MotherDuck | Claude Code on the remote MCP with a token header (`mcp.json`, since removed) and a skill | 18 turns, 67 s, $0.22 |
| 3 Custom MCP | `uv run server.py` as a stdio MCP server | 5 turns, 28 s, $0.07 |
| 4 Custom agent | `uv run agent.py "..."` on Gemini 3.8 Flash | 5 steps, 62 s |

#### Findings

- All four levels found the same two changes: the level 12 boss rework cut Android D7 retention
  (about 14.5% to 10.7%, iOS flat), and the rewarded chest video raised ARPDAU (about +2 cents).
  The answer key `retention_shift` agrees on the boss rework.
- The domain tool at level 3 cut turns from 16 to 18 down to 5, and cost by 3 to 5 times.
- The level 4 run read the guide written by the level 2 run and returned the same numbers.
- Without the MotherDuck token, the level 4 model invented table names instead of stopping.
- DuckDB in the Claude Code sandbox cannot parse the sandbox proxy URL. Run these outside it.

### Level 2 prompt, without and with the guide (2026-11-03)

Same prompt (the 2A prompt, share in the prompt), a Sonnet agent on the MotherDuck MCP tools each
time, in the MotherDuck production East org.

| Run | Payer conversion meant | paid_social before to after | Other channels |
|---|---|---|---|
| No guide (guide tools off, to simulate a fresh account) | any purchase within 7 days of install | 3.90% to 7.59% | flat, about 3.9% |
| With "Gloamwick: how we count" (private, deleted after the run) | starter pack buyers / installs, by install cohort, 7 full days | 2.49% to 6.27% | flat, about 2.5% |

The answer key `starter_conversion` says 2.49% to 6.27%. Both runs found the price cut in
`live_ops_events` and that only paid_social moved. Without the guide the headline number uses
another definition. With it, the agent called `get_query_guide` first and matched the key exactly.
That org also holds a private "workshop-test gloamwick metrics" guide from the 2026-11-02 run; the
guided run read it too but did not use it for conversion.

### Runs on 2026-11-03

- Level 3 server over HTTP (`uv run server.py`, `http://127.0.0.1:8000/mcp`) with a FastMCP client:
  six tools listed, `live_ops_impact` returned real Gloamwick rows from MotherDuck, the question log
  was written, and with `TRACE_TO_MOTHERDUCK=1` the call became an `execute_tool` span (932 ms).
- Level 4 `agent.py` on `openai/gpt-6-luna`, the workshop key's default: the workshop question in
  38 s, 3 steps, 7 tool calls, right answer (boss rework: Android D7 14.48% to 10.68%; chest video:
  ARPDAU +2 cents). Traced to a local DuckDB file: 12 spans, 20.6k input and 3.1k output tokens,
  $0.0028. Fix found on the way: spans are flushed every second, since a server stopped with
  SIGTERM skips atexit.

- `.env` at the repo root (2026-11-03): with no key in the environment, `server.py` read the
  MotherDuck token from `.env` (over HTTP on another port, `live_ops_impact` returned rows), kept
  the OpenRouter key out of its environment, and `agent.py` ran end to end from `.env` (52 s, 7 tool
  calls, right answer).

- Full flow in herdr (2026-11-03), Claude Code (Opus) in a fresh `~/gloamwick` clone, with only a
  lowercase `motherduck_token` in the environment and an empty `.env`. The server read the
  lowercase token. Level 3 steps 1, 4 and 5 worked, with the server added by
  `claude mcp add --transport http` (local scope). Step 4 first ignored `live_ops_impact` (9
  `ask_data` calls); after the server instructions and the tool description said to call it first
  for live-ops questions, it did, and gave the right answer. 2C built the Dive and restyled it in
  FT Salmon. Level 4 on Luna: right answer, `live_ops_impact` first. With
  `TRACE_TO_MOTHERDUCK=1`, spans landed in `md:workshop_traces`, and the bonus prompt built a
  traces Dive (not yet checked in the browser, and not yet on a traced level 4 run).

### Not tested yet

- The rewritten prompt at level 1, and the setup prompt run by an agent on a clean machine
  (uv script, MotherDuck installer without its token prompt, PATH line in the profile).
- Level 1 on the DuckDB 1.5.6 CLI. The tested run used the 1.4 CLI.
- `claude mcp add --scope user`. Only local scope was run.
- A Codex session on the level 3 server. `codex mcp add --url` adds it (checked 2026-11-03 in a
  throwaway `CODEX_HOME`, `codex mcp list` shows it).
- Codex skills in `.agents/skills`: from the Codex docs.
- The traces Dive on a traced level 4 run (nested agent, chat and tool spans).
- The Agent Builder path of hands-on 4. Not deployed yet (motherduck-website PR #3448 open,
  /labs/agent-builder returns 404 on 2026-11-03), and not run from this repo: its steps come from
  the session that built it. The slides and README no longer say it is not live: if it is not
  live by the workshop date, skip the "Build your agent" demo and path B.
- The Flight stretch in level 2.
- The secure view share on Gloamwick (slide "Channel leads see their channel").
- Service account tokens on the level 3 server ("If you finish early").
- The Flight Explainer MCP app (`view_flight_run`).
- Agent signup at `new.motherduck.com`: running it would create a real account.

## Chapter 1 in detail: what an agent is

Chapter 1 takes 16 minutes (about 9 of talk, 7 of hands-on) because it builds the
vocabulary the rest of the workshop uses. Slide order: chatbot vs workflow vs agent, the loop, the
loop in pseudo code, the parts of an agent, the context window, MCP, the five places to put
instructions, a skill example, the harness, a hook example, what makes a full agent, DuckDB agent
mode, then two hands-on.

**Chatbot, workflow, agent.** The question that separates them: who decides the next step? A chatbot
is one model call and the human acts. A workflow is code with fixed steps that calls a model for
some of them. An agent lets the model pick the next step, call a tool, read the result and loop
until it is done. Anthropic's
[Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) uses the
same split.

**The parts of an agent.**

| Part | What it is | In Claude Code | In the generator |
|---|---|---|---|
| Model | Writes the next message: text, or a tool call | Opus, Sonnet, Haiku | Model knob |
| Loop | Runs the tool call, sends the result back, repeats until the model answers | built in | the app server |
| Tools | Functions with a name, a description and an input schema | Bash, Read, Edit, MCP tools | MotherDuck MCP tools you enable |
| System prompt | Instructions sent first on every call | its own, plus CLAUDE.md | Prompt knob |
| Context | Everything in the window this turn | `/context` shows it | prompt, guide, chat, results |
| Harness | The program around the loop: permissions, hooks, sandbox, memory, compaction, subagents | Claude Code itself | the generator |
| Interface | Where a human talks to it | terminal, IDE, web | a chat page with a link |

**The context window.** The model is stateless. Each turn the harness sends the system prompt, the
tool definitions (every MCP tool adds its name, description and schema), memory files, skill
descriptions, the conversation and every tool result so far. Tool results are usually the biggest
part, which is why returning 10,000 rows hurts and why DuckDB's agent mode matters.

**MCP.** The Model Context Protocol is a standard way for a server to expose tools (plus resources
and prompts) to any client. The client lists the tools, puts their definitions in the context and
calls them when the model asks. MotherDuck's remote server (`api.motherduck.com/mcp`) works from
Claude Code, claude.ai, ChatGPT, Cursor or your own app. It also sends instructions at connect time,
with client-specific dive guides in the server code.

**Five places to tell an agent something.**

| Where you write it | Lives | Loaded | Written by |
|---|---|---|---|
| System prompt | in the app | every turn | the app builder |
| AGENTS.md / CLAUDE.md | in the repo | at session start | the team |
| Skill (`SKILL.md` folder, optional scripts) | in the harness | description always, body when needed | you, or a plugin |
| MCP server instructions | in the tool server | when the client connects | the tool vendor |
| Guide | in MotherDuck, next to the data | when the agent asks | the data owners |

Only the guide travels with the data to every agent that can query it. A skill is procedure (how to
work), a guide is meaning (what the data says). Skill plus guide is the smallest useful context
layer. Rules written in any of these five are text the model can ignore, which sets up chapter 5.

**The harness.** Permissions (allow, ask, deny), hooks (code before and after each tool call that
can block it), sandbox, memory files, context compaction, subagents. Same model, different harness,
different agent. Example on the slides: a PreToolUse guard from the earlier Duckoffee kit that blocks
cloud deletes until a human unlocks teardown (exit code 2 blocks the call and the model reads why).

**What makes a full agent.** Six checks, one per chapter: it picks its next step and acts through
tools; it knows what your business means; it lives where your users are; it can't slow down or break
anyone else; it only sees what it should; it leaves a trace you can check. A demo has the first one.
Production needs all six.

**Hands-on.** First the DuckDB CLI on the café Parquet from S3. Then in Claude Code: `/context`,
add the MotherDuck MCP (`claude mcp add MotherDuck --transport http
https://api.motherduck.com/mcp`), `/mcp` to sign in, `/context` again to see the tool definitions
grow, and ask the café question through MotherDuck. Check `/context` and `/mcp` on the Claude Code
version used on the day.

## Chapter 2 in detail: the analytics job and "no UI"

This chapter keeps the workshop about analytics, and it carries the title's thesis. Guess slides:
the room answers first, then the presenter presses R (or clicks REVEAL).

**Six tasks of an analytics agent, mapped to MotherDuck.**

| Task | What it covers | MotherDuck feature |
|---|---|---|
| Pipelines | Ingest and transform, on a schedule | Flights (Python runs on MotherDuck, scheduled or on demand; free plan is on demand only) |
| Data apps | Dashboards, charts, small tools | Dives |
| Context | What the data means | Guides |
| Storage | Where the data lives | MotherDuck databases, fully managed DuckLake, local DuckDB |
| Permissions & sandbox | What it can see, touch and break | Per-agent Ducklings, service accounts, read-only tokens, shares with secure views. Each Flight run gets its own isolated runtime |
| Observability | Covers all five | Flight Explainer, query history, traces stored in MotherDuck |

**The next data stack has no UI.** Each layer of the modern data stack ships two UIs: one to build
(connector screens, model editors, DAG editors, dashboard editors) and one to watch (sync status,
run history, dashboards, lineage). When an agent builds, the build UIs collapse into chat: in data,
describing the connector, the SQL, the schedule or the chart is enough. Some domains still need a
custom builder (video editing, visual design). The watch UIs stay, and three matter: dashboards,
pipeline runs (DAG style) and agent traces.

**MotherDuck's answer: chat to build, MCP apps to watch.** The MotherDuck MCP server ships MCP apps,
UIs rendered inside the chat client: the Dive viewer (`view_dive`) and the Flight Explainer run
viewer (`view_flight_run`, opened from `run_flight`, enabled for everyone in prod per the mono
history). Agent traces have no dedicated app: we store them in MotherDuck and read them with a Dive
(chapter 6). Demo idea: run a Flight from chat, watch it in the Flight Explainer, then open a Dive.

## How guides reach an agent today

Read from `mcp-server` on `origin/main` of the mono repo (fetched 2026-10-26).

- A guide is a markdown document stored in MotherDuck, with an optional topic folder. Private by
  default, shared with `set_guide_access` or `grant_access`. Underneath it is SQL:
  `MD_CREATE_GUIDE`, `MD_LIST_GUIDES` and friends.
- Nothing is injected into the agent's context. The agent has to ask, and the server points it
  there in four places:
  - `get_query_guide`: its description says "Call this before writing SQL to answer a data
    question". It returns the catalog of guides.
  - The `query` tool's description starts with a nudge toward guides.
  - `list_tables` returns `relatedGuides` (guides that reference objects in that database).
    `search_catalog` returns guides that match the search.
  - `get_flight_guide` and `get_dive_guide` include guides under the reserved `flights` and `dives`
    topics.
- The guide tools sit behind a feature flag. It is on for Mehdi's account (the claude.ai MotherDuck
  connector lists them). To confirm for the devrel org and participant accounts.
- Consequences for the workshop: whether a guide is read depends on the model following the nudge,
  which the trace shows live. A guide under `flights` is procedure ("how we ingest here"), which
  answers "can a guide act as a harness?" for ingestion. A custom app can load guides with SQL and
  put them in its system prompt, which the generator's Context knob demonstrates.

## DuckDB 2.0 agent mode

Source: [Agent Mode in the DuckDB CLI](https://duckdb.org/2026/10/09/agent-mode),
[docs](https://duckdb.org/docs/2.0/clients/cli/agent_mode).

- The 2.0 CLI detects an agent (Claude Code, Codex, Cursor, Gemini CLI, Copilot, or `AI_AGENT`
  set) and switches to compact Markdown tables, JSON errors, explicit truncation notices and a cost
  estimate before long queries. `-agent` and `-no-agent` force it, `DUCKDB_AGENT_MODE` also works.
- DuckDB's TPC-H test: 123.6k to 50.8k tokens of DuckDB output read by the agent (59% less), all 132
  runs correct, slightly more turns.
- Needs a 2.0 binary. Checked 2026-11-03: MotherDuck rejects 2.0 clients ("not yet supported by
  MotherDuck. The latest supported version is v1.5.6"). So every hands-on uses the 1.5.6 CLI, and
  agent mode is not in the hands-on.
- Setup installs 1.5.6 with `curl -s https://install.motherduck.com | sh`. That script reads
  `api.motherduck.com/latest_supported_duckdb_version.txt` (1.5.6 on 2026-11-03), installs that
  DuckDB CLI, the MotherDuck extension and the `motherduck` CLI, and checks the connection when a
  token is set. Because 1.5.6 is not DuckDB's latest stable (2.0.0), the DuckDB installer leaves it
  in `~/.duckdb/cli/1.5.6` without touching PATH, so setup adds an `export PATH` line.
- The guide and Dive SQL functions (`MD_LIST_GUIDES`, `MD_CREATE_GUIDE`, `MD_GET_GUIDE`,
  `MD_CREATE_DIVE` and friends) exist on the 1.5.6 CLI. The 1.5.2 CLI has no guide functions.

## The generator

One hosted app where each participant builds an analytics agent and gets a unique link. Nobody
deploys anything. Hands-on 4 runs `exercises/4-custom-agent/agent.py` on the workshop key, which
exists and is tested. Since 2026-11-03 the generator exists as Agent Builder, the second path of
hands-on 4.

### Agent Builder

A web app in the website repo (`packages/agent-builder`, branch `feat/agent-builder`, PR #3448,
not merged). Once deployed: `https://motherduck.com/labs/agent-builder`, proxied by the marketing
site. For learning, not for production. The facts below come from the session that built it.

- You pick the model, prompt, tools, checks, limits and schedule. One template: Dive Keeper, an
  agent that looks after one Dive.
- Same loop as `agent.py`, with a harness: it pre-checks every query of the Dive, keeps edits in a
  draft, blocks writes to any other Dive, enforces step, token, cost and time limits, verifies the
  draft and asks a human to approve. Every run is a MotherDuck Flight in the participant's account
  (a Python port of the harness), so the traces and the run view live there.
- Sign in with MotherDuck (OAuth, no token to paste). The OpenRouter key (the workshop key works)
  is stored as a MotherDuck secret for the agent's Flight.
- "Prepare the simulation" copies Gloamwick into `agent_builder_sim_<id>` with data through
  2025-03-30, shares it, and saves the Dive "Dive Keeper simulation <id>": 4 KPIs, 3 charts
  (weekly D7 retention by platform, weekly installs by platform, daily revenue) and a "Flagged by
  Dive Keeper" panel. The first healthy run is the baseline and publishes up to 3 insights.
- "Move the data forward" adds a week. What the agent should do, for the presenters (the
  participant README does not list it):

  | Date | What changes | What the agent should do |
  |---|---|---|
  | 2025-04-10 | Harder level 12 boss: Android D7 drops about 2.4 points (in the data) | Healthy run with a flag on the drop (under the 25% key-number threshold). Some models report it |
  | 2025-05-01 | Starter-pack price drop | |
  | 2025-05-12 | Web version launches (scripted) | The retention chart only lists Android and iOS: propose adding web |
  | 2025-06-23 | `d7_retained` renamed to `d7_retained_players` (scripted) | Queries break: propose a fixed draft |
  | 2025-07-01 | Summer event | |
  | 2025-08-04 | A reload drops the last three weeks | Report that the latest date went back, no edit |
  | 2025-09-01 | A week is loaded twice | Report +100% installs, no edit |

- The first change to review is expected at the web launch (2025-05-12): nothing is scripted
  before it, and in the Agent Builder session's end-to-end tests no change came earlier. A model
  could still propose one sooner; the harness verifies it like any other.
- A proposed change waits on the History tab ("Review the change", then approve); approving
  re-runs every query before publishing.
  "Start agent" runs every 5 minutes and stops after 2 hours. "Start over" makes a fresh
  simulation and deletes the previous one.
- About $0.002 to $0.005 per run on `openai/gpt-6-luna`.
- It creates in the participant's account: databases `agent_builder` (traces, insights, flight
  steps) and `agent_builder_sim_<id>`, a share, a Dive, a Flight `agent-builder-<agent>-<id>` and
  a secret `agent_builder_openrouter_<id>`. Deleting the agent removes its Flight and secret.

### The original spec

- **Built from /try patterns** (`packages/try-motherduck` in the website repo): server-side loop
  with a per-session MotherDuck MCP client authed by a bearer token, secrets in an encrypted cookie
  or encrypted in Postgres, seven-day share links backed by an encrypted capability, a live panel
  built from streamed tool calls, temporary orgs via `new.motherduck.com`.
- **Knobs**, one per component:

  | Component | Knob | What people learn |
  |---|---|---|
  | Model | Haiku, Sonnet, Opus | Cost and speed vs answer quality |
  | Data | Which database or share | The agent only knows what it can reach |
  | Context | No guide, guide as a tool, guide in the system prompt | Why guides change the number |
  | Tools | query, list_tables, dives, query_rw | What the agent can do is set by its tool list |
  | Harness | Max steps, row cap, read-only, confirm before writes | Limits enforced by the app |
  | Identity | HQ or shop manager | Who it runs as decides what it sees |
  | Interface | Name, starter questions, look | What the end user sees |
  | Prompt | Editable, final assembled prompt shown | What the model actually receives |

- **Preview** next to the editor, with a trace panel showing every turn of the loop.
- **Deploy**: save the config, create a service account for the agent in the devrel org, a token,
  and a grant on the café share. The agent gets its own Duckling and its own kill switch.
- **Link security**: the model key is pasted once and stored encrypted on the server, never in the
  URL or the browser. Read-only by default, step cap per question, daily cap per link, 7-day expiry,
  revoke button. Temporary keys are revoked after the workshop.
- **Traces** go to a MotherDuck table (the way duckgen and /try write to `llm_obs`), with a Dive
  over them for chapter 6.
- **First version**: editor, preview with trace, deploy to link, caps and expiry, traces.
  **Later**: embed snippet, Slack, custom domains.

## Access and risk chapter

| The fear | MotherDuck control | Enforced by |
|---|---|---|
| The agent slows everyone down or runs up a bill | Hypertenancy: its own Duckling | Compute |
| The agent writes or drops something | Read scaling tokens are read-only | Token |
| The agent sees data it shouldn't, or sends it to the model provider | Shares with secure views | MotherDuck servers |
| The agent shows one user another user's rows | `current_user`, `current_email()`, `is_role_in_session()` | MotherDuck servers |
| Nobody knows which agent did what | One service account per agent | Identity |

Four places to put a rule, weakest to strongest: the prompt, a guide, the harness, the database.
The message: guides for correctness, the database for safety.

Secure view facts (from the docs page, Oct 27 branch):

- Row filter, hidden columns and masked values in one `SELECT`, attached to a share and enforced on
  MotherDuck's servers. Hidden columns fail as missing, `EXPLAIN` hides the filter, copies stay
  filtered.
- Business or Enterprise plan, trials included. We run it in the devrel org; participants only
  query the share.
- Managing secure views with SQL needs DuckDB 1.5.6 or later. Consumers need 1.5.5 or later for
  every query shape.
- Service accounts have no email, so agent filters use `current_user`. Usernames are unique only
  within an org, so agent service accounts live in the devrel org.

A share on Gloamwick, written from the docs and not run. Column names are from the `purchases` table;
`channel_access` is a table we would add:

```sql
CREATE SHARE gloamwick_channel_leads FROM gloamwick (ACCESS RESTRICTED)
WITH SECURE VIEW REPLACES purchases AS (
    SELECT purchase_id, player_id, platform, acquisition_channel,
           sku, purchase_date, price_cents   -- no store fees, no net revenue
    FROM purchases
    WHERE acquisition_channel IN (
        SELECT acquisition_channel FROM channel_access WHERE member = current_user
    )
);
```

Red team (presenter demo): agent A has "never show other channels or store fees" in its system
prompt, agent B runs as a channel lead through the secure view. The room shouts attacks at both.

## Decisions taken

- 90 minutes, fundamentals mapped to MotherDuck features, short hands-on per chapter.
- We hand out temporary AI keys.
- The generator is one hosted app with unique links. No per-participant deploy.
- The devrel org holds the shares, secure views and agent service accounts.
- The café dataset stays as duckgen ships it. No extra personal data table.
- Duckoffee and the Dive copy of the deck were removed on 2026-11-03 (both in the git history).
- The abstract can change.
- One dataset for every exercise: Gloamwick Studios. No draw (2026-11-03).
- Workshop keys come from the minter (OpenRouter, three models, $5 each).
- Level 2 is two short hands-on on the remote MCP server: 2A without a guide, 2B with one. No skill file at level 2: the server's tools and instructions are enough, and it works in claude.ai and ChatGPT too.
- Bonus after level 3 and in level 4: `exercises/3-custom-mcp/traces.py` writes OpenTelemetry
  GenAI spans (invoke_agent, chat, execute_tool) to `workshop_traces.spans` in the participant's
  MotherDuck account, with the columns of the duckgen `insurance_brightholm_agent_ops` spans table
  behind the gallery's Agent observability Dive, plus question and sql, and an `agent_traces` view.
  Off unless `TRACE_TO_MOTHERDUCK=1`. Same pattern as /try and duckgen writing to `llm_obs`.
- Secure views close level 2 as a talk outro ("Can we manage permissions?"). Level 3 then shows the custom MCP server: a tool only it has (`live_ops_impact`), a local stdio server (Claude Code, Codex, Cursor; claude.ai and ChatGPT need a remote one), and the token it runs with, which can be a service account carrying those rules.
- Agent-neutral exercises: people bring the agent they use. Skills ship in `skills/` and are
  copied into the agent's folder (`.claude/skills`, `.agents/skills`) as the first step.
- DuckDB 1.5.6 everywhere in the hands-on. Agent mode (2.0) is no longer a slide.
- Hands-on 4 is `agent.py`, with Agent Builder in the browser as a second path (2026-11-03). The
  red team is a presenter demo.
- Each hands-on slide mirrors its exercise README, checked by the slide build.

## Open questions

1. Generator inside /try or as a separate package that reuses its patterns? Answered: Agent
   Builder, a separate package (`packages/agent-builder`) in the website repo.
2. Model provider: answered, OpenRouter keys from the minter.
3. Can the Admin API create one service account per participant agent, and how many people do we
   expect?
4. Do MotherDuck clients support DuckDB 2.0 by the workshop date? Not on 2026-11-03 (latest
   supported 1.5.6). Recheck the week before. The MotherDuck installer follows the supported
   version by itself, but the `export PATH` line in setup names 1.5.6.
5. Is the guides flag on for the devrel org and participant accounts?
6. Workshop date, venue, headcount and wifi.
7. Role split between Mehdi and Jacob.
8. Fonts: `slides/assets/mono.woff2` is AeonikMono, copied from the mehdio.com talk assets. Check
   the license before this repo goes public.
9. Screenshots of the MCP apps for the "Chat to build. MCP apps to watch." slide: the Dive viewer and
   the Flight Explainer inside Claude, and a traces Dive. Slots wait in `slides/assets/`
   (`mcp-app-dive.png`, `mcp-app-flight.png`, `mcp-app-traces.png`).
10. Is Agent Builder live at `motherduck.com/labs/agent-builder` by the workshop date? PR #3448 is
    not merged yet.

## Next steps

- [ ] One-page generator spec, agreed before any code.
- [ ] Generator prototype.
- [ ] Run the four café questions with a bare agent and record the spread.
- [ ] Write the café guide and check every line against `answer-keys.json`.
- [ ] Create the shop-manager share with secure views in the devrel org and test the red team.
- [ ] Script the noisy neighbor demo.
- [ ] Traces table and the Dive over it.
- [ ] Replace the pseudo code on slide 6 with the real loop once the generator code exists.
- [ ] Exercise notes per chapter.
- [ ] Demo for chapter 2: a small café ingestion Flight run from chat, shown in the Flight Explainer.
- [ ] Rerun every hands-on with the 2026-11-03 prompts on a workshop key, including `agent.py` on
      GPT-6 Luna, and 2A/2B in claude.ai and in Claude Code on the workshop key.
- [ ] Run the Agent Builder path of hands-on 4 on a fresh account with a workshop key once it is
      deployed, and time it against the 10 minutes.
- [ ] Capture the traces screenshot for the MCP apps slide (the Dive and Flight ones are in).
- [ ] Sync the mehdio.com copy with the new slides.
- [ ] Full dry run with timings.
- [ ] Update the abstract.

## Proposed abstract

> **The Next Data Stack Has No UI: Building Analytics Agents with Ducks**
> Mehdi Ouazza (MotherDuck) · Jacob Matson (MotherDuck)
>
> Text to SQL is solved. Any model can write a query. Getting the right number, for the right
> person, without putting your warehouse at risk is where analytics agents still fail.
>
> In this 90-minute hands-on workshop you build an analytics agent end to end and look at each
> piece it needs: the loop, context, an interface, isolated compute, access control and
> observability. For each one we show what MotherDuck gives you, then you try it.
>
> You start local, with DuckDB and a coding agent on a public dataset. You move to MotherDuck,
> write a guide that fixes your agent's answers, and turn it into your own chat agent with a link
> you can share. Then you try to break your neighbor's agent and see which rules hold: the ones in
> the prompt, or the ones in the database.
>
> Bring a laptop. We bring the data, the API keys and the failure modes. You leave with a working
> agent, the guide and guardrails that worked, and an opinion on what humans should still operate.
