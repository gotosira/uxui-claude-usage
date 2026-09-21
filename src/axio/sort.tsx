import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react'
import { interpolate } from './i18n'
import { useLanguage } from './LanguageContext'

export type SortDir = 'asc' | 'desc'

export interface SortState<K extends string> {
  key: K
  dir: SortDir
}

export function useSort<T, K extends string>(
  rows: readonly T[],
  getValue: (row: T, key: K) => string | number,
  initial: { key: NoInfer<K>; dir: SortDir },
) {
  const [sort, setSort] = useState<SortState<K>>(initial)

  const sorted = useMemo(() => {
    const copy = rows.slice()
    copy.sort((a, b) => {
      const av = getValue(a, sort.key)
      const bv = getValue(b, sort.key)
      const cmp =
        typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv), 'th', { numeric: true, sensitivity: 'base' })
      return sort.dir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [getValue, rows, sort])

  const toggle = useCallback((key: K, prefer: SortDir = 'desc') => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: prefer },
    )
  }, [])

  return { sorted, sort, toggle }
}

interface SortThProps<K extends string> {
  label: string
  column: K
  sort: SortState<K>
  onSort: (key: K, prefer?: SortDir) => void
  numeric?: boolean
}

export function SortTh<K extends string>({ label, column, sort, onSort, numeric }: SortThProps<K>) {
  const { t } = useLanguage()
  const active = sort.key === column
  const prefer: SortDir = numeric ? 'desc' : 'asc'
  const nextDir: SortDir = active ? (sort.dir === 'asc' ? 'desc' : 'asc') : prefer
  const hint = nextDir === 'asc' ? t.sortAsc : t.sortDesc

  return (
    <th className={numeric ? 'is-num' : undefined} scope="col" aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button
        type="button"
        className={`axio-th-btn${active ? ' is-active' : ''}${numeric ? ' is-num' : ''}`}
        onClick={() => onSort(column, prefer)}
        aria-label={`${label}, ${hint}`}
        title={t.tableClickSort}
      >
        <span>{label}</span>
        <span className="axio-th-dir" aria-hidden="true">
          {active ? (
            sort.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
          ) : (
            <ChevronsUpDown size={14} />
          )}
        </span>
      </button>
    </th>
  )
}

interface TableShellProps {
  count: number
  sortLabel: string
  dir: SortDir
  children: ReactNode
}

export function TableShell({ count, sortLabel, dir, children }: TableShellProps) {
  const { t } = useLanguage()
  return (
    <div className="axio-table-shell">
      <div className="axio-table-meta">
        <span>{interpolate(t.tableRows, { n: count })}</span>
        <span className="axio-table-sort-pill" title={t.tableClickSort}>
          {dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {interpolate(t.sortedBy, { col: sortLabel })}
        </span>
      </div>
      <div className="axio-table-wrap">{children}</div>
    </div>
  )
}
