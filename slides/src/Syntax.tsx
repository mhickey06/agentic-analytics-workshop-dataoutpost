import React from 'react'

// Tiny highlighters, same classes as the other decks (.kw, .str, .fn, .comment).
const sqlTokens =
  /('(?:[^']|'')*'|--[^\n]*|\b(?:SELECT|FROM|WHERE|AS|WITH|CREATE|SHARE|SECURE|VIEW|REPLACES|ACCESS|RESTRICTED|GRANT|READ|ON|TO|ROLE|TABLE|GROUP|BY|ORDER|LIMIT|JOIN|AND|OR|NOT|IN|SET|VARIABLE|CASE|WHEN|THEN|ELSE|END)\b|\b(?:read_parquet|getvariable|current_user|current_email|is_role_in_session|sum|count|round)\b)/g
const sqlFunctions =
  /^(read_parquet|getvariable|current_user|current_email|is_role_in_session|sum|count|round)$/

const loopTokens = /(#[^\n]*|\b(?:loop|if|else|return)\b|\b(?:model|run)\b)/g
const loopKeywords = /^(loop|if|else|return)$/
const loopFunctions = /^(model|run)$/

export function Syntax({
  line,
  lang
}: {
  line: string
  lang?: 'sql' | 'loop' | 'md'
}) {
  if (lang === 'md')
    return (
      <span className={line.startsWith('#') ? 'kw' : undefined}>{line}</span>
    )
  if (lang === 'loop')
    return (
      <>
        {line.split(loopTokens).map((t, i) => (
          <span
            key={i}
            className={
              t.startsWith('#')
                ? 'comment'
                : loopKeywords.test(t)
                  ? 'kw'
                  : loopFunctions.test(t)
                    ? 'fn'
                    : undefined
            }
          >
            {t}
          </span>
        ))}
      </>
    )
  return (
    <>
      {line.split(sqlTokens).map((t, i) => (
        <span
          key={i}
          className={
            t.startsWith("'")
              ? 'str'
              : t.startsWith('--')
                ? 'comment'
                : /^[A-Z]+$/.test(t)
                  ? 'kw'
                  : sqlFunctions.test(t)
                    ? 'fn'
                    : undefined
          }
        >
          {t}
        </span>
      ))}
    </>
  )
}
