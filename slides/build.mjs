// Bundles the deck into dist/: index.html, deck.js, deck.css and assets/.
// Same setup as the talks on mehdio.com (React + esbuild, 1600 x 900 canvas).
//   npm run build     one build
//   npm run watch     rebuild on change
import { context } from 'esbuild'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(root, 'dist')
const watch = process.argv.includes('--watch')

const title = 'The Next Data Stack Has No UI · MotherDuck workshop'
const description =
  'Build an analytics agent end to end, and map each fundamental to MotherDuck. Mehdi Ouazza and Jacob Matson.'

// Hands-on slides and exercise READMEs must agree: same number of steps, each README step opens
// with the slide's step text, and every prompt and command on the slide appears word for word in
// the README. The slide is the source of truth; the README adds detail.
async function checkExercises() {
  const slides = JSON.parse(await fs.readFile(path.join(root, 'src/slides.json'), 'utf8'))
  const problems = []
  for (const s of slides.filter(x => x.exercise)) {
    const readme = await fs
      .readFile(path.join(root, '..', s.exercise, 'README.md'), 'utf8')
      .catch(() => null)
    if (!readme) {
      problems.push(`${s.id}: ${s.exercise}/README.md not found`)
      continue
    }
    // A slide follows "## Steps", or the README section it names in readmeSection (a second path
    // of the same exercise). There, "Done when:" is a paragraph of the section.
    const heading = s.readmeSection ?? 'Steps'
    const esc = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const section = readme.split(new RegExp(`^## ${esc}$`, 'm'))[1]?.split(/^## /m)[0] ?? ''
    if (!section) problems.push(`${s.id}: no "## ${heading}" section in ${s.exercise}/README.md`)
    const count = (section.match(/^\d+\. /gm) ?? []).length
    if (count !== (s.steps ?? []).length) {
      problems.push(`${s.id}: ${s.steps?.length ?? 0} steps on the slide, ${count} in the README`)
    }
    // The slide is the source of truth: each README step opens with the slide's step text, word for
    // word (links compare by label; backticks, bold, curly quotes, case and line breaks aside).
    // The README adds detail after it.
    const plain = t =>
      t
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/`|\*\*/g, '')
        .replace(/[\u201c\u201d]/g, '"')
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase()
    const items = section.split(/^\d+\. /m).slice(1)
    ;(s.steps ?? []).forEach((st, i) => {
      const want = plain(typeof st === 'string' ? st : st.text).replace(/[.:]$/, '')
      const got = plain((items[i] ?? '').split(/\n\s*\n/)[0])
      if (!got.startsWith(want)) {
        problems.push(`${s.id}: step ${i + 1} differs:\n    slide:  ${want}\n    README: ${got.slice(0, want.length + 30)}`)
      }
    })
    for (const st of s.steps ?? []) {
      if (typeof st === 'string') continue
      for (const text of [st.prompt, ...(st.cmd ?? [])].filter(Boolean)) {
        if (!readme.includes(text)) problems.push(`${s.id}: not in the README: ${text}`)
      }
    }
    // Same time box, and the same "done when" (case, backticks and line breaks aside).
    const time = readme.match(/^Time: (\d+) minutes/m)?.[1]
    if (s.minutes && Number(time) !== s.minutes) {
      problems.push(`${s.id}: ${s.minutes} min on the slide, ${time ?? 'no time'} in the README`)
    }
    const norm = t => t.replace(/`/g, '').replace(/\s+/g, ' ').trim().replace(/\.$/, '').toLowerCase()
    const done = s.readmeSection
      ? (section.match(/^Done when: ([\s\S]*?)(?:\n\s*\n|(?![\s\S]))/m)?.[1] ?? '')
      : (readme.split(/^## Done when$/m)[1]?.split(/^## /m)[0] ?? '')
    if (s.doneWhen && norm(done) !== norm(s.doneWhen)) {
      problems.push(`${s.id}: "done when" differs:\n    slide:  ${s.doneWhen}\n    README: ${done.trim()}`)
    }
  }
  if (problems.length) {
    console.error('Hands-on slides and exercise READMEs disagree:\n  ' + problems.join('\n  '))
    process.exit(1)
  }
}
await checkExercises()

await fs.mkdir(out, { recursive: true })
await fs.cp(path.join(root, 'assets'), path.join(out, 'assets'), { recursive: true })
await fs.writeFile(
  path.join(out, 'index.html'),
  `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="stylesheet" href="deck.css"></head><body><div id="root"></div><script defer src="deck.js"></script></body></html>
`
)

const ctx = await context({
  absWorkingDir: root,
  entryPoints: ['src/main.tsx'],
  bundle: true,
  outfile: path.join(out, 'deck.js'),
  minify: !watch,
  format: 'iife',
  target: ['es2020'],
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': watch ? '"development"' : '"production"' },
  external: ['assets/*'],
  legalComments: 'eof',
  logLevel: 'info'
})

if (watch) {
  await ctx.watch()
  console.log('Watching. Open dist/index.html and reload after edits.')
} else {
  await ctx.rebuild()
  await ctx.dispose()
  console.log('Built deck at', path.relative(process.cwd(), out) || '.')
}
