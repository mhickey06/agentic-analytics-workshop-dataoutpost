# Hands-on 2B: add a guide, ask again

Time: 5 minutes. You need hands-on [2A](../2a-mcp/README.md) done: your agent connected to MotherDuck
and your first numbers written down.

A guide is a markdown document stored in MotherDuck, next to the data. Every agent that can query
the data can read it: the MCP server tells agents to call `get_query_guide` before writing SQL.
[`GUIDE.md`](GUIDE.md) holds the definitions for Gloamwick. Definitions only, no answers.

## Steps

The prompts are the same as on the slide. Paste them as they are.

1. Read [`GUIDE.md`](https://github.com/motherduckdb/agentic-analytics-workshop-dataoutpost/blob/main/exercises/2b-guide/GUIDE.md) on GitHub. Which line would have
   changed your 2A answer?

2. Create the guide. Paste this line, then the whole content of `GUIDE.md` under it (GitHub's copy
   button on the file, or the [raw file](https://raw.githubusercontent.com/motherduckdb/agentic-analytics-workshop-dataoutpost/main/exercises/2b-guide/GUIDE.md)):

   > Create a private MotherDuck guide titled "Gloamwick: how we count" with the text below, word for word.

3. Start a new conversation (a new chat, or `/clear` in Claude Code), then ask the 2A question
   again. Paste:

   > ATTACH 'md:_share/dg_gaming_gloamwick_liveops_s_82cb146b_r1/936b62ca-cd54-41a6-987d-f7b64215a773' AS gaming_gloamwick_liveops; This is fictional data for Gloamwick Studios, a free-to-play mobile game on iOS and Android. Did the starter pack price cut lift payer conversion? Split by acquisition channel, before and after. Show the SQL.

4. Compare with 2A. Did the number change? Did the agent read your guide before writing SQL?

## Done when

You can say whether the guide changed your number, and which line of the guide did it.

## If you finish early

- Go on to [2C](../2c-dive/README.md): build a Dive and give it a style.
- Ask the workshop question from level 1 and compare with your local answer:

  > Which live-ops changes since spring 2025 moved day-7 retention or revenue per daily active user, and on which platform? Show the SQL.

## Notes

- The guide is private (`user` access). Only agents that run as you can read it.
- You do not need to clone the repo for level 2: the guide is the only file, and you paste it.
