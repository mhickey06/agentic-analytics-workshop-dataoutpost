# Hands-on 2C: build a Dive, give it a style

Time: 5 minutes. You need hands-on [2A](../2a-mcp/README.md) and [2B](../2b-guide/README.md) done, in the
same conversation or a new one.

A Dive is a small interactive app over your live data, a React component saved in MotherDuck. Your
agent writes it, MotherDuck runs the queries. In clients that show MCP apps, like Claude on the web
or the desktop app, the Dive opens right in the chat.

## Steps

The prompts are the same as on the slide. Paste them as they are.

1. Ask for a Dive. Paste:

   > Save a Dive that charts weekly starter pack conversion by acquisition channel, with a marker on the price cut. Give me the link.

2. Open it, in the chat if your client shows it there, or with the link.

3. Pick a theme in the [Dive theme gallery](https://motherduck.com/docs/key-tasks/dives/dive-theme-gallery/)
   (Tufte Minimal, FT Salmon, Du Bois…). Paste this line, then the theme's prompt from the gallery
   under it:

   > Restyle my Dive with the theme below. Keep the same data and charts.

4. Open the new version and compare. Every save is a new version of the same Dive.

## Done when

Your Dive opens in MotherDuck with the new style.

## Notes

- A Dive is private to you until you share it. The data it reads stays where it is: the Dive
  queries the share live.
- The gallery has 15 themes, each one a prompt you can reuse on any Dive.
