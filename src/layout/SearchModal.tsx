import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CalendarRange,
  LayoutDashboard,
  Search,
  Sparkles,
  User,
  Box,
  Cpu,
} from 'lucide-react'
import { interpolate } from '../axio/i18n'
import { useLanguage } from '../axio/LanguageContext'
import { personInitials } from '../data/display'
import { useFilters } from '../data/FilterContext'
import { uniqueValues } from '../data/aggregate'
import { ACTIVE_GROUP } from '../data/groups'
import {
  buildSearchIndex,
  groupHits,
  kindLabel,
  searchIndex,
  type SearchItem,
  type SearchKind,
} from '../data/searchIndex'
import { rankQueue } from '../data/rankings'
import { useLayout } from './LayoutContext'

const RECENT_KEY = 'axio-search-recent'
const MAX_RECENT = 6

function readRecent(): string[] {
  try {
    const raw = sessionStorage.getItem(RECENT_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

function writeRecent(id: string) {
  const next = [id, ...readRecent().filter((item) => item !== id)].slice(0, MAX_RECENT)
  sessionStorage.setItem(RECENT_KEY, JSON.stringify(next))
}

function isMacPlatform() {
  return /Mac|iPhone|iPad/.test(navigator.platform) || navigator.userAgent.includes('Mac')
}

const KIND_ICON: Record<SearchKind, typeof Search> = {
  page: LayoutDashboard,
  person: User,
  product: Box,
  model: Cpu,
  month: CalendarRange,
}

export function SearchModal() {
  const { t } = useLanguage()
  const { searchOpen, closeSearch, openSearch, openPerson, openEntity, rankId } = useLayout()
  const {
    allRows,
    topUsers,
    setEmailSearch,
    setPeriods,
    maskEmails,
  } = useFilters()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [isMac, setIsMac] = useState(true)
  const [recentIds, setRecentIds] = useState<string[]>([])

  const catalog = useMemo(() => {
    const products = uniqueValues(allRows, 'product')
    const models = uniqueValues(allRows, 'model')
    return buildSearchIndex({
      t,
      emails: ACTIVE_GROUP.emails,
      products,
      models,
      users: topUsers,
    })
  }, [allRows, t, topUsers])

  const byId = useMemo(() => new Map(catalog.map((item) => [item.id, item])), [catalog])

  const hits = useMemo(() => searchIndex(catalog, query), [catalog, query])
  const grouped = useMemo(() => groupHits(hits), [hits])

  const recentItems = useMemo(
    () => recentIds.map((id) => byId.get(id)).filter((item): item is SearchItem => Boolean(item)),
    [byId, recentIds],
  )

  const suggestionPages = useMemo(
    () => catalog.filter((item) => item.kind === 'page'),
    [catalog],
  )
  const suggestionMonths = useMemo(
    () => catalog.filter((item) => item.kind === 'month'),
    [catalog],
  )
  const suggestionPeople = useMemo(
    () => catalog.filter((item) => item.kind === 'person').slice(0, 6),
    [catalog],
  )
  const suggestionRecent = useMemo(() => {
    const shown = new Set(
      [...suggestionPages, ...suggestionMonths, ...suggestionPeople].map((item) => item.id),
    )
    return recentItems.filter((item) => !shown.has(item.id))
  }, [recentItems, suggestionMonths, suggestionPages, suggestionPeople])

  const visibleItems: SearchItem[] = useMemo(() => {
    if (query.trim()) return grouped.flatMap((group) => group.hits.map((hit) => hit.item))
    return [...suggestionPages, ...suggestionRecent, ...suggestionMonths, ...suggestionPeople]
  }, [grouped, query, suggestionMonths, suggestionPages, suggestionPeople, suggestionRecent])

  useEffect(() => {
    setIsMac(isMacPlatform())
  }, [])

  useEffect(() => {
    if (!searchOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [searchOpen])

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (searchOpen) closeSearch()
        else openSearch()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeSearch, openSearch, searchOpen])

  useEffect(() => {
    if (!searchOpen) return
    setQuery('')
    setActive(0)
    setRecentIds(readRecent())
    const id = window.setTimeout(() => inputRef.current?.focus(), 20)
    const onEsc = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeSearch()
      }
    }
    window.addEventListener('keydown', onEsc)
    return () => {
      window.clearTimeout(id)
      window.removeEventListener('keydown', onEsc)
    }
  }, [closeSearch, searchOpen])

  useEffect(() => {
    setActive(0)
  }, [query])

  useEffect(() => {
    const node = document.getElementById(`search-${visibleItems[active]?.id}`)
    node?.scrollIntoView({ block: 'nearest' })
  }, [active, visibleItems])

  const applyItem = (item: SearchItem) => {
    writeRecent(item.id)
    if (item.kind === 'person' && item.email) {
      openPerson(item.email, rankQueue(topUsers, rankId))
      closeSearch()
      return
    }
    if (item.kind === 'product' && item.product) {
      setEmailSearch('')
      openEntity('product', item.product)
      closeSearch()
      return
    }
    if (item.kind === 'model' && item.model) {
      setEmailSearch('')
      openEntity('model', item.model)
      closeSearch()
      return
    }
    if (item.kind === 'month' && item.period) {
      setPeriods([item.period])
    } else {
      setEmailSearch('')
    }
    navigate(item.to)
    closeSearch()
  }

  const onInputKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((i) => Math.min(i + 1, Math.max(visibleItems.length - 1, 0)))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const item = visibleItems[active]
      if (item) applyItem(item)
    }
  }

  if (!searchOpen) return null

  const shortcut = isMac ? t.searchShortcut : t.searchShortcutWin
  const typed = query.trim()
  const hasHits = typed ? hits.length > 0 : visibleItems.length > 0

  return (
    <div className="axio-search-root">
      <button type="button" className="axio-search-scrim" aria-label={t.searchFooterClose} onClick={closeSearch} />
      <div
        className="axio-search-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="axio-search-title"
      >
        <div className="axio-search-bar">
          <Search size={20} />
          <input
            ref={inputRef}
            id="axio-search-title"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder={t.searchCommand}
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="axio-search-list"
            aria-activedescendant={visibleItems[active] ? `search-${visibleItems[active].id}` : undefined}
          />
          <kbd className="axio-kbd">ESC</kbd>
        </div>

        <div className="axio-search-body" id="axio-search-list" role="listbox">
          {!hasHits && typed ? (
            <p className="axio-search-empty">{interpolate(t.searchEmpty, { q: typed })}</p>
          ) : typed ? (
            grouped.map((group) => (
              <SearchGroup key={group.kind} label={kindLabel(group.kind, t)}>
                {group.hits.map((hit) => {
                  const index = visibleItems.findIndex((item) => item.id === hit.item.id)
                  return (
                    <SearchRow
                      key={hit.item.id}
                      item={hit.item}
                      active={index === active}
                      query={typed}
                      maskEmails={maskEmails}
                      onHover={() => setActive(index)}
                      onSelect={() => applyItem(hit.item)}
                    />
                  )
                })}
              </SearchGroup>
            ))
          ) : (
            <>
              <SearchGroup label={t.searchSuggestions}>
                {suggestionPages.map((item) => {
                    const index = visibleItems.findIndex((row) => row.id === item.id)
                    return (
                      <SearchRow
                        key={item.id}
                        item={item}
                        active={index === active}
                        query=""
                        maskEmails={maskEmails}
                        onHover={() => setActive(index)}
                        onSelect={() => applyItem(item)}
                      />
                    )
                  })}
              </SearchGroup>
              {suggestionRecent.length > 0 && (
                <SearchGroup label={t.searchRecent}>
                  {suggestionRecent.map((item) => {
                    const index = visibleItems.findIndex((row) => row.id === item.id)
                    return (
                      <SearchRow
                        key={`recent-${item.id}`}
                        item={item}
                        active={index === active}
                        query=""
                        maskEmails={maskEmails}
                        onHover={() => setActive(index)}
                        onSelect={() => applyItem(item)}
                      />
                    )
                  })}
                </SearchGroup>
              )}
              <SearchGroup label={t.searchMonths}>
                {suggestionMonths.map((item) => {
                    const index = visibleItems.findIndex((row) => row.id === item.id)
                    return (
                      <SearchRow
                        key={item.id}
                        item={item}
                        active={index === active}
                        query=""
                        maskEmails={maskEmails}
                        onHover={() => setActive(index)}
                        onSelect={() => applyItem(item)}
                      />
                    )
                  })}
              </SearchGroup>
              <SearchGroup label={t.searchPeople}>
                {suggestionPeople.map((item) => {
                    const index = visibleItems.findIndex((row) => row.id === item.id)
                    return (
                      <SearchRow
                        key={item.id}
                        item={item}
                        active={index === active}
                        query=""
                        maskEmails={maskEmails}
                        onHover={() => setActive(index)}
                        onSelect={() => applyItem(item)}
                      />
                    )
                  })}
              </SearchGroup>
            </>
          )}
        </div>

        <div className="axio-search-footer">
          <span>
            <kbd className="axio-kbd">↑</kbd>
            <kbd className="axio-kbd">↓</kbd> {t.searchFooterNav}
          </span>
          <span>
            <kbd className="axio-kbd">↵</kbd> {t.searchFooterSelect}
          </span>
          <span>
            <kbd className="axio-kbd">ESC</kbd> {t.searchFooterClose}
          </span>
          <span className="axio-search-foot-right">{shortcut}</span>
        </div>
      </div>
    </div>
  )
}

function SearchGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="axio-search-group">
      <p className="axio-search-group-label">{label}</p>
      {children}
    </div>
  )
}

function SearchRow({
  item,
  active,
  query,
  maskEmails,
  onHover,
  onSelect,
}: {
  item: SearchItem
  active: boolean
  query: string
  maskEmails: boolean
  onHover: () => void
  onSelect: () => void
}) {
  const Icon = item.kind === 'page' && item.to === '/products' ? Sparkles : KIND_ICON[item.kind]
  const subtitle =
    item.kind === 'person' && maskEmails
      ? item.subtitle.replace(item.email ?? '', maskLocal(item.email ?? ''))
      : item.subtitle

  return (
    <button
      type="button"
      id={`search-${item.id}`}
      role="option"
      aria-selected={active}
      className={`axio-search-row${active ? ' is-active' : ''}`}
      onMouseEnter={onHover}
      onClick={onSelect}
    >
      <span className="axio-search-row-icon">
        {item.kind === 'person' && item.email ? (
          <span className="axio-avatar axio-avatar-sm">{personInitials(item.email)}</span>
        ) : (
          <Icon size={18} />
        )}
      </span>
      <span className="axio-search-row-copy">
        <strong>{highlight(item.title, query)}</strong>
        <small>{highlight(subtitle, query)}</small>
      </span>
    </button>
  )
}

function maskLocal(email: string) {
  const [name, domain] = email.split('@')
  if (!domain) return email
  if (name.length <= 2) return `*@${domain}`
  return `${name[0]}***${name[name.length - 1]}@${domain}`
}

function highlight(text: string, query: string) {
  const q = query.trim()
  if (!q) return text
  const index = text.toLowerCase().indexOf(q.toLowerCase())
  if (index < 0) return text
  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + q.length)}</mark>
      {text.slice(index + q.length)}
    </>
  )
}
