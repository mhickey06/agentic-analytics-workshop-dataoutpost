# Exercises

One folder per hands-on. Each folder has a README with the same numbered steps, prompts,
commands, time and "done when" as its slide. Follow the README: you can copy from it, not from the projector.

You do not need to clone this repo before level 3. Levels 1 and 2 link to the two files they use
(the level 1 skill and the level 2 guide). Level 3 clones it for the MCP server and the agent loop.

| Hands-on | Folder | Time | You build |
|---|---|---|---|
| 0 Setup | [`0-setup/`](0-setup/README.md) | 5 min | a coding agent and a MotherDuck account; one prompt installs uv, DuckDB 1.5.6 and the MotherDuck CLI |
| 1 Local | [`1-local/`](1-local/README.md) | 10 min | a local agent: your coding agent adds a skill, loads Parquet with the DuckDB CLI, builds a dashboard |
| 2A MotherDuck | [`2a-mcp/`](2a-mcp/README.md) | 5 min | your agent on the MotherDuck MCP server, one question with the share in the prompt |
| 2B Guide | [`2b-guide/`](2b-guide/README.md) | 5 min | a MotherDuck guide, the same question again |
| 2C Dive | [`2c-dive/`](2c-dive/README.md) | 5 min | a Dive over the answer, restyled from the theme gallery |
| 3 Custom MCP | [`3-custom-mcp/`](3-custom-mcp/README.md) | 10 min | your own MCP server in front of MotherDuck's, a tool only it has; bonus: traces in MotherDuck |
| 4 Custom agent | [`4-custom-agent/`](4-custom-agent/README.md) | 10 min | two paths: your own loop on the model you pick, or Agent Builder in the browser on a simulated Dive |

## The data

Everyone works on **Gloamwick Studios**, a fictional mobile game from duckgen
(`gaming-gloamwick-liveops`, S tier). It is the dataset all four levels were tested on.

- The game: Vanguard of Vellmark, a free-to-play squad battler on iOS and Android.
- One year: 2024-10-01 to 2025-09-30. 8 tables: `players`, `sessions`, `purchases`,
  `ad_impressions`, `ad_placements`, `daily_player_metrics`, `live_ops_events`,
  `battle_pass_seasons`.
- Level 1 reads it as Parquet on public S3:
  `s3://us-prd-motherduck-open-datasets/duckgen/gaming-gloamwick-liveops/20261023-82cb146b-s-r1/tables/`
- Levels 2 to 4 read it as a MotherDuck share:
  `ATTACH 'md:_share/dg_gaming_gloamwick_liveops_s_82cb146b_r1/936b62ca-cd54-41a6-987d-f7b64215a773' AS gaming_gloamwick_liveops;`

## The questions

The workshop question, asked at every level so you can compare:

> Which live-ops changes since spring 2025 moved day-7 retention or revenue per daily active user, and on which platform? Show the SQL.

The guide question, asked before and after you write the guide at level 2:

> Did the starter pack price cut lift payer conversion? Split by acquisition channel, before and after. Show the SQL.

duckgen ships answer keys for both. The presenters grade against them. Do not point your agent at
duckgen's `guide.md` or answer keys: they contain the answers.

## Keys

- The workshop key comes from the minter:
  <https://motherduck.com/minter/w/next-data-stack-has-no-ui/>. $5 of credit, three models:
  `anthropic/claude-sonnet-5.5`, `anthropic/claude-haiku-5.5`, `openai/gpt-6-luna`.
- Levels 3 and 4 read `MOTHERDUCK_TOKEN` and `OPENROUTER_API_KEY` from a `.env` at the root of the
  repo: `cp .env.example .env`, then fill it in. Git ignores `.env`. The workshop key exports for
  Claude Code stay in your terminal. No key ever reaches the model.
