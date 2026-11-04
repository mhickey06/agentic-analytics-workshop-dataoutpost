// Deck engine ported from the talks on mehdio.com (src/talks/system-one-models/Deck.tsx).
// Kept: 1600 x 900 canvas, keyboard and touch navigation, notes, slide chooser, line focus.
// Dropped: Dive embeds, quiz and the Jev-specific visuals.
import React, { useCallback, useEffect, useRef, useState } from 'react'
import rawSlides from './slides.json'
import type { Slide } from './types'
import { SlidesBadge, Visual } from './Visuals'
import { Syntax } from './Syntax'
import './deck.css'
import './workshop.css'

const slides = rawSlides as Slide[]
const clamp = (n: number) =>
  Math.min(slides.length - 1, Math.max(0, Number.isFinite(n) ? n : 0))
const DEFAULT_SECTION = 'THE NEXT DATA STACK HAS NO UI'

function Code({ slide, focus }: { slide: Slide; focus: number }) {
  const [copied, setCopied] = useState(false)
  const code = slide.code ?? ''
  return (
    <div className="codeframe">
      <div className="codebar">
        <span>{slide.codeLabel ?? 'SQL / DUCKDB'}</span>
        <span className="hint">H · focus line</span>
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(code)
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1500)
            } catch {
              setCopied(false)
            }
          }}
        >
          {copied ? 'COPIED' : 'COPY'}
        </button>
      </div>
      <pre>
        <code>
          {code.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              <span
                className={
                  'code-line ' +
                  (focus < 0 ? '' : focus === i ? 'focus' : 'dim')
                }
              >
                <Syntax line={line} lang={slide.language} />
              </span>
              {'\n'}
            </React.Fragment>
          ))}
        </code>
      </pre>
    </div>
  )
}

export default function Deck() {
  const [current, setCurrent] = useState(() =>
    clamp(Number(location.hash.slice(1) || 1) - 1)
  )
  const [scale, setScale] = useState(1)
  const [focus, setFocus] = useState(-1)
  const [notes, setNotes] = useState(false)
  const [overview, setOverview] = useState(false)
  const touch = useRef<{ x: number; y: number }>()
  const slide = slides[current]

  const navigate = useCallback((next: number) => {
    const n = clamp(next)
    setCurrent(n)
    setFocus(-1)
    setOverview(false)
    history.replaceState(null, '', '#' + (n + 1))
  }, [])
  const jump = useCallback(
    (id: string) => {
      const i = slides.findIndex(s => s.id === id)
      if (i >= 0) navigate(i)
    },
    [navigate]
  )

  useEffect(() => {
    const resize = () =>
      setScale(Math.min(innerWidth / 1600, innerHeight / 900))
    const hash = () => navigate(Number(location.hash.slice(1) || 1) - 1)
    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('hashchange', hash)
    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('hashchange', hash)
    }
  }, [navigate])

  const fullscreen = () =>
    document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen()

  const [isFullscreen, setIsFullscreen] = useState(false)
  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  useEffect(() => {
    const keyboard = (e: KeyboardEvent) => {
      const target = e.target instanceof Element ? e.target : null
      if (target?.closest('input,textarea,select,[contenteditable="true"]'))
        return
      if (
        [' ', 'Enter'].includes(e.key) &&
        target?.closest('button,a,[role="button"]')
      )
        return
      if (['ArrowRight', 'PageDown', ' '].includes(e.key)) {
        e.preventDefault()
        navigate(current + 1)
      }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        navigate(current - 1)
      }
      if (e.key === 'Home') navigate(0)
      if (e.key === 'End') navigate(slides.length - 1)
      if (e.key.toLowerCase() === 'n') setNotes(v => !v)
      if (e.key.toLowerCase() === 'g') setOverview(v => !v)
      if (e.key.toLowerCase() === 'f') fullscreen().catch(() => {})
      if (e.key === 'Escape') {
        setOverview(false)
        setNotes(false)
      }
      if (e.key.toLowerCase() === 'h' && slide.kind === 'code') {
        const lines = (slide.code ?? '')
          .split('\n')
          .map((line, i) => (line.trim() ? i : -1))
          .filter(i => i >= 0)
        setFocus(f => lines[lines.indexOf(f) + 1] ?? -1)
      }
    }
    window.addEventListener('keydown', keyboard)
    return () => window.removeEventListener('keydown', keyboard)
  }, [current, navigate, slide])

  return (
    <div className="deck-app">
      <main
        className="deck-stage"
        style={{ transform: 'translate(-50%, -50%) scale(' + scale + ')' }}
        onTouchStart={e => {
          if (!(e.target as HTMLElement).closest('button,a,svg'))
            touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
        }}
        onTouchEnd={e => {
          if (!touch.current) return
          const dx = e.changedTouches[0].clientX - touch.current.x
          const dy = e.changedTouches[0].clientY - touch.current.y
          if (Math.abs(dx) > 80 && Math.abs(dx) > Math.abs(dy) * 2)
            navigate(current + (dx < 0 ? 1 : -1))
          touch.current = undefined
        }}
      >
        <section
          key={current}
          className={
            'slide ' +
            slide.theme +
            ' ' +
            slide.kind +
            (slide.kind === 'custom' ? ' ws-slide' : '') +
            (slide.id === 'hero' ? ' hero-slide' : '')
          }
          aria-label={
            'Slide ' + (current + 1) + ': ' + slide.title.replaceAll('\n', ' ')
          }
        >
          <div className="eyebrow">{slide.section ?? DEFAULT_SECTION}</div>
          <h1>{slide.title}</h1>
          {slide.kind === 'custom' && slide.id && (
            <Visual id={slide.id} slide={slide} onJump={jump} />
          )}
          {slide.kind === 'code' && <Code slide={slide} focus={focus} />}
          {slide.body && <p className="body">{slide.body}</p>}
          {slide.id !== 'house-rules' && <SlidesBadge />}
          <footer>
            {slide.source ? (
              <a href={slide.source} target="_blank" rel="noopener noreferrer">
                {slide.sourceLabel ?? 'MOTHERDUCK'} ↗
              </a>
            ) : (
              <span>MOTHERDUCK · WORKSHOP</span>
            )}
            <span>
              {String(current + 1).padStart(2, '0')} / {slides.length}
            </span>
          </footer>
        </section>
      </main>
      {/* One control: full screen. Esc exits it. Arrows, G (slides), N (notes) and F stay on the keyboard. */}
      {!isFullscreen && (
        <nav className="controls" aria-label="Presentation controls">
          <button
            className="ws-fullscreen"
            aria-label="Full screen (F). Esc to exit."
            title="Full screen (F). Esc to exit."
            onClick={() => fullscreen().catch(() => {})}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
            </svg>
          </button>
        </nav>
      )}
      {notes && (
        <aside className="notes" aria-label="Speaker notes">
          <button className="close" onClick={() => setNotes(false)}>
            ×
          </button>
          <strong>
            {current + 1}. {slide.title.replaceAll('\n', ' ')}
          </strong>
          <p>{slide.notes}</p>
        </aside>
      )}
      {overview && (
        <div className="overlay" role="dialog" aria-label="Choose a slide">
          <button className="close" onClick={() => setOverview(false)}>
            CLOSE · ESC
          </button>
          <div className="overview">
            {slides.map((s, i) => (
              <button
                key={i}
                aria-current={current === i ? 'step' : undefined}
                onClick={() => navigate(i)}
              >
                <span>{String(i + 1).padStart(2, '0')}</span>
                {s.title.replaceAll('\n', ' ')}
              </button>
            ))}
          </div>
        </div>
      )}
      <div
        className="progress"
        style={{ width: ((current + 1) / slides.length) * 100 + '%' }}
      />
    </div>
  )
}
