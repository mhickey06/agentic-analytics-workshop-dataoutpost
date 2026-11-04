// A hands-on step. `prompt` is pasted into the agent, `cmd` runs in the terminal. Both must appear
// word for word in the README of the slide's `exercise` folder (the build checks it).
export type Step = string | { text: string; prompt?: string; cmd?: string[] }

export type Slide = {
  id?: string
  title: string
  body?: string
  kind: 'title' | 'statement' | 'custom' | 'code'
  theme: 'sand' | 'ink' | 'duck'
  section?: string
  notes: string
  source?: string
  sourceLabel?: string
  code?: string
  codeLabel?: string
  language?: 'sql' | 'loop' | 'md'
  // Hands-on slides (id starts with ho-): a time box, steps, an exit check, what to install.
  minutes?: number
  steps?: Step[]
  doneWhen?: string
  needs?: string[]
  // Repo folder whose README.md carries the same steps, for example exercises/1-local.
  exercise?: string
  // The README section this hands-on slide follows, when not "## Steps" (a second path).
  readmeSection?: string
}
