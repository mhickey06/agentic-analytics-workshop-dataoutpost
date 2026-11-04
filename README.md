# Agentic analytics workshop

**The Next Data Stack Has No UI: Building End-to-End Analytics with Agents and Ducks.** A 90-minute
hands-on workshop by Mehdi Ouazza and Jacob Matson (MotherDuck), prepared for Data Outpost.

Text to SQL is solved. Any model writes a valid query. What breaks analytics agents is context,
access and trust. In this workshop you build an analytics agent in four levels, and at each level
you control more of it.

## The hands-on

| Hands-on | Folder | Time | What you do |
|---|---|---|---|
| 0 Setup | [`exercises/0-setup/`](exercises/0-setup/) | 5 min | Install a coding agent, create a MotherDuck account, one prompt installs the rest |
| 1 Local | [`exercises/1-local/`](exercises/1-local/) | 10 min | Your agent adds a skill, loads Parquet from S3 with the DuckDB CLI, answers the question, builds a local HTML dashboard |
| 2A MotherDuck | [`exercises/2a-mcp/`](exercises/2a-mcp/) | 5 min | Connect your agent to the MotherDuck MCP server, ask with the share in the prompt |
| 2B Guide | [`exercises/2b-guide/`](exercises/2b-guide/) | 5 min | Add a MotherDuck guide, ask again, compare |
| 2C Dive | [`exercises/2c-dive/`](exercises/2c-dive/) | 5 min | Build a Dive and restyle it from the theme gallery |
| 3 Custom MCP | [`exercises/3-custom-mcp/`](exercises/3-custom-mcp/) | 10 min | Your own MCP server in front of MotherDuck's: a tool only it has, a question log, the token it runs with. Bonus: traces in MotherDuck |
| 4 Custom agent | [`exercises/4-custom-agent/`](exercises/4-custom-agent/) | 10 min | Two paths: a 60-line agent loop on the model you pick, using your level 3 tools, or Agent Builder in the browser on a simulated Dive |

Each folder has a README with the same numbered steps, prompts, commands, time and "done when" as
its slide. The slide build fails if they disagree. Dataset and questions:
[`exercises/README.md`](exercises/README.md).

## What you need

- The coding agent of your choice, for example
  [Claude Code](https://code.claude.com/docs/en/setup) or [Codex](https://developers.openai.com/codex/cli).
- A free [MotherDuck](https://motherduck.com) account. Levels 3 and 4 also need an access token.
- No AI subscription? A workshop key from the [minter](https://motherduck.com/minter/w/next-data-stack-has-no-ui/):
  an OpenRouter key with $5 of credit for Claude Sonnet 5.5, Claude Haiku 5.5 and GPT-6 Luna. It
  also runs the level 4 agent.

Your agent installs the rest in hands-on 0: [uv](https://docs.astral.sh/uv/) (it brings Python),
the [DuckDB CLI](https://duckdb.org/docs/installation/) 1.5.6 and the MotherDuck CLI. MotherDuck does
not accept DuckDB 2.0 clients yet, so do not use Homebrew's DuckDB. Levels 3 and 4 read
`MOTHERDUCK_TOKEN` and `OPENROUTER_API_KEY` from a `.env` at the repo root (`cp .env.example .env`).
Git ignores `.env`. Never commit a key.

## The data

Everyone works on one fictional company from [duckgen](https://motherduck.com/duckgen/api/v1):
Gloamwick Studios (`gaming-gloamwick-liveops`, S tier), a mobile game with a year of installs,
sessions, purchases, ads and live-ops events. It ships four answer keys for grading. It comes as
Parquet on public S3 (level 1) and as a MotherDuck share (levels 2 to 4).

## Slides

**View the slides:** [symmetrical-barnacle-rkwr531.pages.github.io](https://symmetrical-barnacle-rkwr531.pages.github.io/)
(GitHub Pages, private: you need access to this repo). Every push to `main` that touches
`slides/` or `exercises/` rebuilds it. The public copy will be
[mehdio.com/talks/next-data-stack-has-no-ui](https://mehdio.com/talks/next-data-stack-has-no-ui)
once the deck is merged on mehdio.com.

The source of truth is [`slides/`](slides/) in this repo. The mehdio.com deck
(`src/talks/no-ui-data-stack/` in the mehdio-website repo) is a copy: edit here, then copy
`slides/src/` and `slides/assets/` over.

```bash
cd slides
npm install
npm run build        # or: npm run watch
open dist/index.html
```

Keys: arrows to navigate, N for speaker notes, G to pick a slide, F for full screen, H to step
through code lines, R to reveal the guess slides. Slide text is in `slides/src/slides.json`,
visuals in `slides/src/Visuals.tsx`.

## Repo layout

| Path | What it is |
|---|---|
| [`exercises/`](exercises/) | One folder per hands-on, with the same steps as its slide |
| [`slides/`](slides/) | The workshop deck (React + esbuild, 1600 x 900) |
| [`.env.example`](.env.example) | The keys levels 3 and 4 read: copy it to `.env` and fill it in |
| [`PLAN.md`](PLAN.md) | Organizers: agenda, checked facts, test runs, decisions, open questions |
| [`AGENTS.md`](AGENTS.md) | How to work on this repo (people and coding agents) |
