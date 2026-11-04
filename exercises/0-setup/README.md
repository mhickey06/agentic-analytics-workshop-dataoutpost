# Hands-on 0: set up

Time: 5 minutes. Do it before the workshop if you can.

Everyone works on the same data: **Gloamwick Studios**, a fictional mobile game from duckgen. See
[the exercises index](../README.md) for the dataset and the questions.

What you need: a coding agent (Claude Code, Codex…) and a free MotherDuck account. You create a
MotherDuck token later, at level 3, in a `.env` file. Your agent installs the rest for you: [uv](https://docs.astral.sh/uv/) (it brings Python), the
[DuckDB CLI](https://duckdb.org/docs/installation/) at version 1.5.6 (the latest version MotherDuck
supports) and the [MotherDuck CLI](https://motherduck.com/docs/getting-started/interfaces/connect-query-from-duckdb-cli/).

## Steps

The prompt is the same as on the slide. Paste it as it is.

1. Install a coding agent, any one you like, for example
   [Claude Code](https://code.claude.com/docs/en/setup) or
   [Codex](https://developers.openai.com/codex/cli).

2. Create a free [MotherDuck account](https://app.motherduck.com). No token yet: level 2 signs your
   agent in through the browser, and level 3 puts the token in a `.env` file.

3. No AI subscription? Claim a workshop key at
   [the minter](https://motherduck.com/minter/w/next-data-stack-has-no-ui/) and paste its exports in
   the terminal you will start your agent from. The key is an OpenRouter key with $5 of credit, for three models only: Claude
   Sonnet 5.5, Claude Haiku 5.5 and GPT-6 Luna. The minter page shows the exports for Claude Code:

   ```sh
   export ANTHROPIC_BASE_URL=https://openrouter.ai/api
   export ANTHROPIC_AUTH_TOKEN=<your workshop key>
   export ANTHROPIC_API_KEY=""
   export ANTHROPIC_MODEL=anthropic/claude-sonnet-5.5
   export ANTHROPIC_SMALL_FAST_MODEL=anthropic/claude-haiku-5.5
   export ANTHROPIC_DEFAULT_HAIKU_MODEL=anthropic/claude-haiku-5.5
   ```

4. Make a folder for the workshop, start your agent in it, and let it install and check everything:

   ```sh
   mkdir -p ~/gloamwick && cd ~/gloamwick
   ```

   Paste:

   > Set up my laptop for the MotherDuck workshop. Install uv with: curl -LsSf https://astral.sh/uv/install.sh | sh. Install DuckDB 1.5.6 and the MotherDuck CLI with: curl -s https://install.motherduck.com | sh. Add this line to my shell profile: export PATH="$HOME/.duckdb/cli/1.5.6:$PATH". Then check that ~/.duckdb/cli/1.5.6/duckdb --version says 1.5.6, and that uv --version and motherduck --version work. Tell me what is missing.

## Done when

Your agent reports DuckDB v1.5.6 and finds uv and the MotherDuck CLI.

## Prefer to run the commands yourself?

```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
curl -s https://install.motherduck.com | sh
echo 'export PATH="$HOME/.duckdb/cli/1.5.6:$PATH"' >> ~/.zshrc
```

On bash, write the last line to `~/.bashrc`. On Windows, run the MotherDuck installer from
PowerShell: `irm https://install.motherduck.com | iex`. With Homebrew, `brew install uv` works, but
do not `brew install duckdb`: Homebrew ships DuckDB 2.0, and MotherDuck does not accept 2.0 clients
yet.

## Why the PATH line goes in your profile

`export` only lasts for the terminal you type it in. Coding agents run commands in shells they
start themselves, from your shell profile, so a PATH set by hand may not reach them. The installer
needs it because 1.5.6 is not DuckDB's latest release: it lands in `~/.duckdb/cli/1.5.6` and is not
put on your PATH. Restart your agent after setup so it picks the new PATH up.

The workshop key exports are different: the agent reads them itself when it starts, so the terminal
you start it from is enough. The MotherDuck token goes in a `.env` file at level 3, where the
scripts that need it read it.

## Notes

- Never paste a key into a prompt or a file in this repo. Keys stay in environment variables.
- The MotherDuck installer, run by an agent, skips its interactive token prompt. That is fine: no
  step before level 3 needs a token.
- Your agent may ask before it runs the installers. Allow it.
- Sonnet 5.5 costs 20 times more than Haiku 5.5 and GPT-6 Luna. If your credit runs low, switch
  `ANTHROPIC_MODEL` to `anthropic/claude-haiku-5.5`.
- Keys expire when the workshop window ends. Save your work.
