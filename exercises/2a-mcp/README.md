# Hands-on 2A: connect to MotherDuck

Time: 5 minutes. You need a [MotherDuck account](https://app.motherduck.com) (free) and an AI client.

The data and the compute move to MotherDuck, so anyone you share with can query. Your agent reaches
it through the MotherDuck remote MCP server, `https://api.motherduck.com/mcp`. No skill file, no
local data: the server's tools and instructions tell the agent what to do.

## Steps

The prompts are the same as on the slide. Paste them as they are.

1. Connect your agent to the MotherDuck MCP server and sign in with your MotherDuck account. Pick
   your client:

   - Claude, on the web or in the desktop app: [add MotherDuck to Claude](https://claude.ai/directory/motherduck),
     or go to **Customize**, **Connectors**, **+**, find **MotherDuck**, click **Connect** and
     authorize.
   - Claude Code: add the server, start `claude`, type `/mcp`, select **MotherDuck** and choose
     **Authenticate**. Claude Code on an API key, like the workshop key, does not see your
     claude.ai connectors, so add it here even if Claude already has it.

     ```sh
     claude mcp add --transport http MotherDuck https://api.motherduck.com/mcp
     ```

   - ChatGPT or Codex: install the
     [MotherDuck plugin](https://chatgpt.com/plugins/plugin_asdk_app_696a54f1c91c81919002b9153ce0e336)
     and connect your account.
   - Cursor, VS Code, Gemini CLI and others: follow the
     [MotherDuck MCP setup](https://motherduck.com/docs/key-tasks/ai-and-motherduck/mcp-setup/).

2. Check the connection. Paste:

   > List all my databases on MotherDuck.

3. Ask the question. The share is in the prompt, so the agent attaches it first. Paste:

   > ATTACH 'md:_share/dg_gaming_gloamwick_liveops_s_82cb146b_r1/936b62ca-cd54-41a6-987d-f7b64215a773' AS gaming_gloamwick_liveops; This is fictional data for Gloamwick Studios, a free-to-play mobile game on iOS and Android. Did the starter pack price cut lift payer conversion? Split by acquisition channel, before and after. Show the SQL.

4. Write down the conversion per channel, before and after, and how your agent defined "payer
   conversion". Compare with your neighbor.

## Done when

Your agent answered with a number per channel, and you know which definition it picked.

## Notes

- Your account has no guide yet, so the agent has to decide what "payer conversion" means. Keep
  your numbers: hands-on 2B adds a guide and asks again.
- If the agent asks to run a write query for the `ATTACH`, allow it. Attaching a share does not
  copy or change any data.
- The agent should never read duckgen's own `guide.md` or answer keys: they contain the answers.
