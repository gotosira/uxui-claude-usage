import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  applyFilters,
  aggregateByDomain,
  aggregateByModel,
  aggregateByProduct,
  comparePeriods,
  computeStats,
  rosterSpend,
  topSpendRows,
  uniqueValues,
} from './aggregate'
import { loadPeriodCsv } from './parseCsv'
import { ALL_PERIOD_IDS, PERIODS } from './periods'
import { ACTIVE_GROUP, inActiveGroup } from './groups'
import type {
  DomainSpend,
  EnrichedRow,
  FilterState,
  ModelSpend,
  PeriodComparison,
  PeriodId,
  ProductSpend,
  UserRank,
} from './types'

interface FilterContextValue {
  allRows: EnrichedRow[]
  scopedRows: EnrichedRow[]
  filteredRows: EnrichedRow[]
  filters: FilterState
  loading: boolean
  maskEmails: boolean
  stats: ReturnType<typeof computeStats>
  byModel: ModelSpend[]
  byProduct: ProductSpend[]
  byDomain: DomainSpend[]
  topUsers: UserRank[]
  topRows: EnrichedRow[]
  periodCompare: PeriodComparison[]
  groupName: string
  groupSize: number
  groupPresent: number
  groupMissing: string[]
  models: string[]
  products: string[]
  domains: string[]
  setMaskEmails: (v: boolean) => void
  togglePeriod: (id: PeriodId) => void
  setAllPeriods: (active: boolean) => void
  setModel: (model: string | null) => void
  setProduct: (product: string | null) => void
  setDomain: (domain: string | null) => void
  setUserEmail: (email: string | null) => void
  setEmailSearch: (q: string) => void
  setPeriods: (ids: PeriodId[]) => void
  clearFilters: () => void
}

const defaultFilters: FilterState = {
  periods: new Set<PeriodId>(ALL_PERIOD_IDS),
  model: null,
  product: null,
  domain: null,
  emailSearch: '',
  userEmail: null,
}

const FilterContext = createContext<FilterContextValue | null>(null)

export function FilterProvider({ children }: { children: ReactNode }) {
  const [allRows, setAllRows] = useState<EnrichedRow[]>([])
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [loading, setLoading] = useState(true)
  const [maskEmails, setMaskEmails] = useState(false)

  useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        const batches = await Promise.all(
          PERIODS.map((p) => loadPeriodCsv(p.id, p.file)),
        )
        setAllRows(batches.flat().filter((row) => inActiveGroup(row.user_email)))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const scopedRows = useMemo(
    () => applyFilters(allRows, { ...filters, userEmail: null }),
    [allRows, filters],
  )
  const filteredRows = useMemo(
    () => applyFilters(allRows, filters),
    [allRows, filters],
  )

  const stats = useMemo(() => computeStats(filteredRows), [filteredRows])
  const byModel = useMemo(() => aggregateByModel(filteredRows), [filteredRows])
  const byProduct = useMemo(() => aggregateByProduct(filteredRows), [filteredRows])
  const byDomain = useMemo(() => aggregateByDomain(filteredRows), [filteredRows])
  const topUsers = useMemo(
    () => rosterSpend(scopedRows, ACTIVE_GROUP.emails),
    [scopedRows],
  )
  const groupPresent = useMemo(
    () => new Set(allRows.map((row) => row.user_email.toLowerCase())).size,
    [allRows],
  )
  const groupMissing = useMemo(() => {
    const present = new Set(allRows.map((row) => row.user_email.toLowerCase()))
    return ACTIVE_GROUP.emails.filter((email) => !present.has(email))
  }, [allRows])
  const topRows = useMemo(() => topSpendRows(filteredRows), [filteredRows])
  const periodCompare = useMemo(
    () => comparePeriods(filteredRows, filters.periods),
    [filteredRows, filters.periods],
  )

  const models = useMemo(
    () => uniqueValues(applyFilters(allRows, { ...filters, model: null, userEmail: null }), 'model'),
    [allRows, filters],
  )
  const products = useMemo(
    () => uniqueValues(applyFilters(allRows, { ...filters, product: null, userEmail: null }), 'product'),
    [allRows, filters],
  )
  const domains = useMemo(
    () => uniqueValues(applyFilters(allRows, { ...filters, domain: null, userEmail: null }), 'domain'),
    [allRows, filters],
  )

  const togglePeriod = useCallback((id: PeriodId) => {
    setFilters((prev) => {
      const next = new Set(prev.periods)
      if (next.has(id)) {
        if (next.size > 1) next.delete(id)
      } else {
        next.add(id)
      }
      return { ...prev, periods: next }
    })
  }, [])

  const setAllPeriods = useCallback((active: boolean) => {
    setFilters((prev) => ({
      ...prev,
      periods: active ? new Set<PeriodId>(ALL_PERIOD_IDS) : prev.periods,
    }))
  }, [])

  const setModel = useCallback((model: string | null) => {
    setFilters((prev) => ({ ...prev, model }))
  }, [])

  const setProduct = useCallback((product: string | null) => {
    setFilters((prev) => ({ ...prev, product }))
  }, [])

  const setDomain = useCallback((domain: string | null) => {
    setFilters((prev) => ({ ...prev, domain }))
  }, [])

  const setUserEmail = useCallback((userEmail: string | null) => {
    setFilters((prev) => ({ ...prev, userEmail }))
  }, [])

  const setEmailSearch = useCallback((emailSearch: string) => {
    setFilters((prev) => ({ ...prev, emailSearch }))
  }, [])

  const setPeriods = useCallback((ids: PeriodId[]) => {
    setFilters((prev) => ({
      ...prev,
      periods: new Set<PeriodId>(ids.length ? ids : ALL_PERIOD_IDS),
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({
      ...defaultFilters,
      periods: prev.periods,
    }))
  }, [])

  const value: FilterContextValue = {
    allRows,
    scopedRows,
    filteredRows,
    filters,
    loading,
    maskEmails,
    stats,
    byModel,
    byProduct,
    byDomain,
    topUsers,
    topRows,
    periodCompare,
    groupName: ACTIVE_GROUP.name,
    groupSize: ACTIVE_GROUP.emails.length,
    groupPresent,
    groupMissing,
    models,
    products,
    domains,
    setMaskEmails,
    togglePeriod,
    setAllPeriods,
    setModel,
    setProduct,
    setDomain,
    setUserEmail,
    setEmailSearch,
    setPeriods,
    clearFilters,
  }

  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
}

export function useFilters() {
  const ctx = useContext(FilterContext)
  if (!ctx) throw new Error('useFilters must be used within FilterProvider')
  return ctx
}
