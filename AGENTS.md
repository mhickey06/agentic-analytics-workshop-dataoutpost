# Working on this repo

This repo prepares a workshop. It is not the participant repo yet. Read [PLAN.md](PLAN.md) first.

## Writing

- No em dashes or en dashes in prose. Use a period, a comma or a colon.
- Plain declarative sentences. No "it's not X, it's Y" punchlines, no filler intros.
- Slide text stays short. Details go in the speaker notes.

## Slides

- Content: `slides/src/slides.json`. Visuals for `custom` slides: `slides/src/Visuals.tsx`.
- `slides/src/deck.css` is copied unchanged from the Jev for analytics deck on mehdio.com. Do not
  edit it. Put workshop styles in `slides/src/workshop.css`.
- Build with `npm run build` in `slides/`, then open `slides/dist/index.html`.
- `slides/` is the source of truth. The mehdio.com copy (`src/talks/no-ui-data-stack/` in
  mehdio-website) hosts it: after edits, copy `slides/src/` and `slides/assets/` there. Its
  `Deck.tsx` imports `../jev-analytics/deck.css` instead of `./deck.css`.

## Exercises

- One dataset for every exercise: Gloamwick Studios (`gaming-gloamwick-liveops`, S tier).
- Each hands-on slide (`ho-*` in `slides.json`) names its folder in `exercise`. That folder's
  README has the same numbered steps, every `prompt` and `cmd` on the slide word for word, the
  same time ("Time: N minutes") and the same "Done when". `npm run build` fails when they
  disagree. Change both together.
- No answers, answer keys or duckgen `guide.md` under `exercises/`: agents run there and can read
  it. Expected answers live in the speaker notes and PLAN.md.

## Facts

- When a slide or PLAN.md states a product fact (tool names, limits, plans, versions), it must come
  from the code, the docs or a query we ran. List anything untested in PLAN.md, under "Not tested
  yet".

## Secrets

- Never print or commit a MotherDuck token or an AI key. `.env` files are ignored.
