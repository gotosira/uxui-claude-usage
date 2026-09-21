import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { CircleHelp } from 'lucide-react'
import { useLanguage } from './LanguageContext'

const OPEN_EVENT = 'axio-hint-open'

interface AxioHintProps {
  title: string
  body: string
  column?: string
}

export function AxioHint({ title, body, column }: AxioHintProps) {
  const { t } = useLanguage()
  const id = useId()
  const btnRef = useRef<HTMLButtonElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, place: 'below' as 'below' | 'above' })

  const place = () => {
    const btn = btnRef.current
    if (!btn) return
    const rect = btn.getBoundingClientRect()
    const width = 380
    const left = Math.min(Math.max(12, rect.left - 8), window.innerWidth - width - 12)
    const below = rect.bottom + 8
    const placeAbove = below + 280 > window.innerHeight && rect.top > 260
    setPos({
      top: placeAbove ? rect.top - 8 : below,
      left,
      place: placeAbove ? 'above' : 'below',
    })
  }

  useEffect(() => {
    if (!open) return
    place()
    const close = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail
      if (detail !== id) setOpen(false)
    }
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node
      if (btnRef.current?.contains(target) || popRef.current?.contains(target)) return
      setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener(OPEN_EVENT, close)
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener(OPEN_EVENT, close)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [id, open])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        className={`axio-hint-btn${open ? ' is-open' : ''}`}
        aria-label={t.helpLabel}
        aria-expanded={open}
        aria-describedby={open ? `${id}-pop` : undefined}
        onClick={(event) => {
          event.stopPropagation()
          const next = !open
          setOpen(next)
          if (next) window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }))
        }}
      >
        <CircleHelp size={14} />
      </button>
      {open &&
        createPortal(
          <div
            ref={popRef}
            id={`${id}-pop`}
            className={`axio-hint-pop is-${pos.place}`}
            role="tooltip"
            style={{
              top: pos.top,
              left: pos.left,
              transform: pos.place === 'above' ? 'translateY(-100%)' : undefined,
            }}
          >
            <p className="axio-hint-pop-title">{title}</p>
            <p className="axio-hint-pop-body">{body}</p>
            {column && (
              <p className="axio-hint-pop-col">
                {t.csvColumn} <code>{column}</code>
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  )
}

export function AxioHintLabel({
  children,
  title,
  body,
  column,
}: {
  children: ReactNode
  title?: string
  body?: string
  column?: string
}) {
  return (
    <span className="axio-hint-label">
      {children}
      {body && <AxioHint title={title ?? String(children)} body={body} column={column} />}
    </span>
  )
}
