import { createContext, useContext, type ReactNode, useMemo, useState, useCallback } from 'react'
import type { EntityKind, PeopleRankId } from '../data/types'

export interface EntityDrill {
  kind: EntityKind
  id: string
}

interface LayoutContextValue {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean | ((prev: boolean) => boolean)) => void
  mobileNavOpen: boolean
  setMobileNavOpen: (v: boolean) => void
  searchOpen: boolean
  setSearchOpen: (v: boolean) => void
  openSearch: () => void
  closeSearch: () => void
  personEmail: string | null
  personQueue: string[]
  openPerson: (email: string, queue?: string[]) => void
  closePerson: () => void
  stepPerson: (delta: number) => void
  entity: EntityDrill | null
  openEntity: (kind: EntityKind, id: string) => void
  closeEntity: () => void
  rankId: PeopleRankId
  setRankId: (id: PeopleRankId) => void
}

const LayoutContext = createContext<LayoutContextValue | null>(null)

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [personEmail, setPersonEmail] = useState<string | null>(null)
  const [personQueue, setPersonQueue] = useState<string[]>([])
  const [entity, setEntity] = useState<EntityDrill | null>(null)
  const [rankId, setRankId] = useState<PeopleRankId>('spend')

  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => setSearchOpen(false), [])
  const closePerson = useCallback(() => setPersonEmail(null), [])
  const closeEntity = useCallback(() => setEntity(null), [])

  const openPerson = useCallback((email: string, queue?: string[]) => {
    setSearchOpen(false)
    setPersonEmail(email)
    if (queue) setPersonQueue(queue)
  }, [])

  const openEntity = useCallback((kind: EntityKind, id: string) => {
    setSearchOpen(false)
    setEntity({ kind, id })
  }, [])

  const stepPerson = useCallback(
    (delta: number) => {
      setPersonEmail((current) => {
        if (!current || personQueue.length === 0) return current
        const index = personQueue.indexOf(current)
        if (index < 0) return current
        const next = personQueue[index + delta]
        return next ?? current
      })
    },
    [personQueue],
  )

  const value = useMemo<LayoutContextValue>(
    () => ({
      sidebarCollapsed,
      setSidebarCollapsed,
      mobileNavOpen,
      setMobileNavOpen,
      searchOpen,
      setSearchOpen,
      openSearch,
      closeSearch,
      personEmail,
      personQueue,
      openPerson,
      closePerson,
      stepPerson,
      entity,
      openEntity,
      closeEntity,
      rankId,
      setRankId,
    }),
    [
      sidebarCollapsed,
      mobileNavOpen,
      searchOpen,
      openSearch,
      closeSearch,
      personEmail,
      personQueue,
      openPerson,
      closePerson,
      stepPerson,
      entity,
      openEntity,
      closeEntity,
      rankId,
    ],
  )

  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}

export function useLayout() {
  const ctx = useContext(LayoutContext)
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider')
  return ctx
}
