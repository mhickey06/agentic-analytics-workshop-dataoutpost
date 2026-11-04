import React from 'react'

// Line icons on a 64 x 64 grid. The first ten come from the Jev for analytics deck.
export type IconName =
  | 'write'
  | 'target'
  | 'filter'
  | 'check'
  | 'search'
  | 'bolt'
  | 'layers'
  | 'loop'
  | 'book'
  | 'chat'
  | 'box'
  | 'lock'
  | 'eye'
  | 'user'
  | 'model'
  | 'tool'
  | 'doc'
  | 'window'
  | 'plug'
  | 'shield'
  | 'db'
  | 'hook'
  | 'flag'
  | 'branch'
  | 'pipeline'
  | 'id'

const paths: Record<IconName, React.ReactNode> = {
  write: (
    <>
      <path d="M13 47l4-15L43 6l15 15-26 26-19 4zM36 13l15 15M17 32l15 15" />
      <path d="M9 59h48" />
    </>
  ),
  target: (
    <>
      <circle cx="32" cy="32" r="25" />
      <circle cx="32" cy="32" r="13" />
      <circle cx="32" cy="32" r="3" />
    </>
  ),
  filter: <path d="M7 10h50L38 33v20l-12 5V33z" />,
  check: (
    <>
      <circle cx="32" cy="32" r="25" />
      <path d="M18 32l10 10 19-21" />
    </>
  ),
  search: (
    <>
      <circle cx="27" cy="27" r="18" />
      <path d="M40 40l17 17" />
    </>
  ),
  bolt: <path d="M36 5L12 36h17l-2 23 25-32H35z" />,
  layers: (
    <path d="M5 20L32 6l27 14-27 14zM5 32l27 14 27-14M5 44l27 14 27-14" />
  ),
  loop: (
    <>
      <path d="M52 26A21 21 0 1 0 53 40" />
      <path d="M54 10v16H38" />
    </>
  ),
  book: (
    <>
      <path d="M32 16c-6-5-15-6-24-4v40c9-2 18-1 24 4 6-5 15-6 24-4V12c-9-2-18-1-24 4z" />
      <path d="M32 16v40" />
    </>
  ),
  chat: <path d="M8 12h48v30H28L16 53V42H8z" />,
  box: (
    <>
      <rect x="9" y="13" width="46" height="38" rx="3" />
      <path d="M9 25h46M17 19h4M25 19h4" />
    </>
  ),
  lock: (
    <>
      <rect x="13" y="28" width="38" height="28" rx="3" />
      <path d="M21 28v-8a11 11 0 0 1 22 0v8M32 39v7" />
    </>
  ),
  eye: (
    <>
      <path d="M4 32s10-17 28-17 28 17 28 17-10 17-28 17S4 32 4 32z" />
      <circle cx="32" cy="32" r="8" />
    </>
  ),
  user: (
    <>
      <circle cx="32" cy="21" r="11" />
      <path d="M11 57c2-12 10-19 21-19s19 7 21 19" />
    </>
  ),
  model: (
    <>
      <rect x="14" y="14" width="36" height="36" rx="5" />
      <rect x="24" y="24" width="16" height="16" rx="2" />
      <path d="M24 6v8M32 6v8M40 6v8M24 50v8M32 50v8M40 50v8M6 24h8M6 32h8M6 40h8M50 24h8M50 32h8M50 40h8" />
    </>
  ),
  tool: (
    <path d="M41 7a14 14 0 0 0-13 19L8 46a6 6 0 0 0 9 9l20-20A14 14 0 0 0 56 22l-9 9-9-3-3-9 9-9a14 14 0 0 0-3-3z" />
  ),
  doc: (
    <>
      <path d="M14 6h25l12 12v40H14z" />
      <path d="M39 6v12h12M22 30h20M22 39h20M22 48h12" />
    </>
  ),
  window: (
    <>
      <rect x="6" y="10" width="52" height="44" rx="3" />
      <path d="M6 20h52M14 29h14M14 37h28M14 45h20" />
    </>
  ),
  plug: (
    <>
      <path d="M22 6v14M42 6v14M14 20h36v10a18 18 0 0 1-36 0z" />
      <path d="M32 48v10" />
    </>
  ),
  shield: (
    <>
      <path d="M32 5l23 9v16c0 15-10 25-23 29C19 55 9 45 9 30V14z" />
      <path d="M21 31l8 8 14-15" />
    </>
  ),
  db: (
    <>
      <ellipse cx="32" cy="13" rx="22" ry="7" />
      <path d="M10 13v38c0 4 10 7 22 7s22-3 22-7V13M10 26c0 4 10 7 22 7s22-3 22-7M10 39c0 4 10 7 22 7s22-3 22-7" />
    </>
  ),
  hook: <path d="M40 6v30a14 14 0 0 1-28 0v-4l-6 6M12 32l6 6" />,
  flag: (
    <>
      <path d="M12 58V6" />
      <path d="M12 9h36l-8 11 8 11H12" />
    </>
  ),
  branch: (
    <>
      <circle cx="16" cy="12" r="6" />
      <circle cx="16" cy="52" r="6" />
      <circle cx="48" cy="30" r="6" />
      <path d="M16 18v28M16 30c0-8 8-10 16-10h4a6 6 0 0 1 6 4" />
    </>
  ),
  pipeline: (
    <>
      <rect x="4" y="24" width="14" height="16" rx="2" />
      <rect x="25" y="24" width="14" height="16" rx="2" />
      <rect x="46" y="24" width="14" height="16" rx="2" />
      <path d="M18 32h7M39 32h7" />
    </>
  ),
  id: (
    <>
      <rect x="5" y="13" width="54" height="38" rx="4" />
      <circle cx="22" cy="29" r="6" />
      <path d="M12 43c2-5 6-7 10-7s8 2 10 7M38 26h14M38 34h10" />
    </>
  )
}

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      className="concept-icon"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
