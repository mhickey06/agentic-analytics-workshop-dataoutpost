# Hands-on 1: a local analytics agent

Time: 10 minutes. You need the setup from [hands-on 0](../0-setup/README.md): your coding agent and
the DuckDB CLI 1.5.6.

Everything runs on your laptop: your coding agent, the DuckDB CLI as its tool, and one skill file
([`skills/company-analytics/SKILL.md`](skills/company-analytics/SKILL.md)) that tells it how to work
and where the Gloamwick data lives: Parquet on S3, about 100 MB. You copy the prompts and watch
what the agent does.

## Steps

The prompts are the same as on the slide. Paste them as they are.

1. Start your agent in your `gloamwick` folder and ask it to add the [skill file](https://github.com/motherduckdb/agentic-analytics-workshop-dataoutpost/blob/main/exercises/1-local/skills/company-analytics/SKILL.md) itself.
   Then restart your agent so it loads the skill. Paste:

   > Add the skill at https://raw.githubusercontent.com/motherduckdb/agentic-analytics-workshop-dataoutpost/main/exercises/1-local/skills/company-analytics/SKILL.md to this project's skills folder, as company-analytics/SKILL.md. Then tell me in one line what it does.

2. Load the data. Paste:

   > Use the DuckDB CLI to load every Gloamwick table from S3 into company.duckdb, then tell me what each table holds.

3. Ask the workshop question. Write down the numbers and keep the SQL. Paste:

   > Which live-ops changes since spring 2025 moved day-7 retention or revenue per daily active user, and on which platform? Show the SQL.

4. Ask for a dashboard. Paste:

   > Build dashboard.html, one file I open locally: weekly day-7 retention and revenue per daily active user by platform, with a marker on each live-ops change.

5. Open the dashboard in your browser. Then ask yourself: who else can open it?

   ```sh
   open dashboard.html
   ```

## Done when

`dashboard.html` opens on your laptop and shows your answer.

## If you finish early

- Ask your agent what is in its context window (in Claude Code, type `/context`). Find the skill,
  the tool definitions and your conversation.
- Open `company.duckdb` yourself with `duckdb company.duckdb` and rerun the agent's SQL.

## Notes

- If the agent asks for permission to run `duckdb` or to download the skill, allow it.
- Prefer to add the skill yourself? Claude Code reads `.claude/skills`, Codex reads `.agents/skills`:

  ```sh
  mkdir -p .claude/skills/company-analytics && curl -fsSL -o .claude/skills/company-analytics/SKILL.md https://raw.githubusercontent.com/motherduckdb/agentic-analytics-workshop-dataoutpost/main/exercises/1-local/skills/company-analytics/SKILL.md
  ```
- If loading from S3 fails inside your agent's sandbox, run the agent without the sandbox for this
  exercise. DuckDB could not parse the Claude Code sandbox proxy URL in our tests.
- Your numbers go on the spread slide later. Keep them.
