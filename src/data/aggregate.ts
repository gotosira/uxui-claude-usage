import type {
  DashboardStats,
  DomainSpend,
  EnrichedRow,
  FilterState,
  ModelSpend,
  PeriodComparison,
  PeriodId,
  ProductSpend,
  UserRank,
} from './types'
import { PERIODS } from './periods'
import { normalizeEmail } from './groups'

export function applyFilters(rows: EnrichedRow[], filters: FilterState): EnrichedRow[] {
  return rows.filter((row) => {
    if (!filters.periods.has(row.periodId)) return false
    if (filters.model && row.model !== filters.model) return false
    if (filters.product && row.product !== filters.product) return false
    if (filters.domain && row.domain !== filters.domain) return false
    if (filters.userEmail && row.user_email !== filters.userEmail) return false
    if (filters.emailSearch) {
      const q = filters.emailSearch.toLowerCase()
      if (!row.user_email.toLowerCase().includes(q)) return false
    }
    return true
  })
}

export function computeStats(rows: EnrichedRow[]): DashboardStats {
  const users = new Set<string>()
  let netSpend = 0
  let requests = 0
  let promptTokens = 0
  let completionTokens = 0
  let cacheRead = 0
  let uncached = 0
  let cacheWrite5m = 0
  let cacheWrite1h = 0
  let webSearch = 0

  for (const row of rows) {
    users.add(row.user_email)
    netSpend += row.total_net_spend_usd
    requests += row.total_requests
    promptTokens += row.total_prompt_tokens
    completionTokens += row.total_completion_tokens
    cacheRead += row.total_cache_read_tokens
    uncached += row.total_uncached_input_tokens
    cacheWrite5m += row.total_cache_write_5m_tokens
    cacheWrite1h += row.total_cache_write_1h_tokens
    webSearch += row.total_web_search_count
  }

  return {
    netSpend,
    requests,
    uniqueUsers: users.size,
    rows: rows.length,
    promptTokens,
    completionTokens,
    cacheRead,
    uncached,
    cacheWrite5m,
    cacheWrite1h,
    webSearch,
  }
}

export function aggregateByModel(rows: EnrichedRow[]): ModelSpend[] {
  const map = new Map<string, ModelSpend>()
  for (const row of rows) {
    const existing = map.get(row.model) ?? { model: row.model, spend: 0, requests: 0 }
    existing.spend += row.total_net_spend_usd
    existing.requests += row.total_requests
    map.set(row.model, existing)
  }
  return [...map.values()].sort((a, b) => b.spend - a.spend)
}

export function aggregateByProduct(rows: EnrichedRow[]): ProductSpend[] {
  const map = new Map<string, ProductSpend & { userSet: Set<string> }>()
  for (const row of rows) {
    const existing = map.get(row.product) ?? {
      product: row.product,
      spend: 0,
      requests: 0,
      users: 0,
      rows: 0,
      userSet: new Set<string>(),
    }
    existing.spend += row.total_net_spend_usd
    existing.requests += row.total_requests
    existing.rows += 1
    existing.userSet.add(row.user_email)
    map.set(row.product, existing)
  }
  return [...map.values()]
    .map(({ userSet, ...rest }) => ({ ...rest, users: userSet.size }))
    .sort((a, b) => b.spend - a.spend)
}

export function aggregateByDomain(rows: EnrichedRow[]): DomainSpend[] {
  const map = new Map<string, DomainSpend & { userSet: Set<string> }>()
  for (const row of rows) {
    const existing = map.get(row.domain) ?? {
      domain: row.domain,
      spend: 0,
      requests: 0,
      users: 0,
      userSet: new Set<string>(),
    }
    existing.spend += row.total_net_spend_usd
    existing.requests += row.total_requests
    existing.userSet.add(row.user_email)
    map.set(row.domain, existing)
  }
  return [...map.values()]
    .map(({ userSet, ...rest }) => ({ ...rest, users: userSet.size }))
    .sort((a, b) => b.spend - a.spend)
}

function emptyPeriodSpend(): Record<PeriodId, number> {
  return { jul: 0, aug: 0, sep: 0 }
}

export function emptyUserRank(email: string): UserRank {
  return {
    email,
    spend: 0,
    requests: 0,
    rows: 0,
    promptTokens: 0,
    completionTokens: 0,
    cacheRead: 0,
    uncached: 0,
    cacheWrite5m: 0,
    cacheWrite1h: 0,
    webSearch: 0,
    spendPerRequest: 0,
    julToAug: 0,
    topProduct: '—',
    topModel: '—',
    periods: [],
    spendByPeriod: emptyPeriodSpend(),
    userId: '',
    accountUuid: '',
  }
}

export function aggregateTopUsers(rows: EnrichedRow[]): UserRank[] {
  const map = new Map<
    string,
    UserRank & { products: Map<string, number>; models: Map<string, number> }
  >()
  for (const row of rows) {
    const existing = map.get(row.user_email) ?? {
      ...emptyUserRank(row.user_email),
      topProduct: row.product,
      topModel: row.model,
      userId: row.user_id,
      accountUuid: row.account_uuid,
      products: new Map<string, number>(),
      models: new Map<string, number>(),
    }
    existing.spend += row.total_net_spend_usd
    existing.requests += row.total_requests
    existing.rows += 1
    existing.promptTokens += row.total_prompt_tokens
    existing.completionTokens += row.total_completion_tokens
    existing.cacheRead += row.total_cache_read_tokens
    existing.uncached += row.total_uncached_input_tokens
    existing.cacheWrite5m += row.total_cache_write_5m_tokens
    existing.cacheWrite1h += row.total_cache_write_1h_tokens
    existing.webSearch += row.total_web_search_count
    existing.spendByPeriod[row.periodId] += row.total_net_spend_usd
    existing.products.set(row.product, (existing.products.get(row.product) ?? 0) + row.total_net_spend_usd)
    existing.models.set(row.model, (existing.models.get(row.model) ?? 0) + row.total_net_spend_usd)
    if (!existing.periods.includes(row.periodId)) existing.periods.push(row.periodId)
    if (!existing.userId) existing.userId = row.user_id
    if (!existing.accountUuid) existing.accountUuid = row.account_uuid
    map.set(row.user_email, existing)
  }
  return [...map.values()]
    .map(({ products, models, ...rest }) => {
      const topProduct = [...products.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? rest.topProduct
      const topModel = [...models.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? rest.topModel
      return {
        ...rest,
        topProduct,
        topModel,
        spendPerRequest: rest.requests > 0 ? rest.spend / rest.requests : 0,
        julToAug: rest.spendByPeriod.aug - rest.spendByPeriod.jul,
      }
    })
    .sort((a, b) => b.spend - a.spend)
}

export function rosterSpend(rows: EnrichedRow[], emails: readonly string[]): UserRank[] {
  const ranked = aggregateTopUsers(rows)
  const byEmail = new Map(ranked.map((row) => [normalizeEmail(row.email), row]))
  return emails
    .map((email) => {
      const hit = byEmail.get(normalizeEmail(email))
      return hit ?? emptyUserRank(email)
    })
    .sort((a, b) => b.spend - a.spend || a.email.localeCompare(b.email))
}

export function topSpendRows(rows: EnrichedRow[], limit = 25): EnrichedRow[] {
  return [...rows].sort((a, b) => b.total_net_spend_usd - a.total_net_spend_usd).slice(0, limit)
}

export function comparePeriods(rows: EnrichedRow[], activePeriods: Set<PeriodId>): PeriodComparison[] {
  return PERIODS.filter((p) => activePeriods.has(p.id)).map((period) => {
    const periodRows = rows.filter((r) => r.periodId === period.id)
    const users = new Set(periodRows.map((r) => r.user_email))
    return {
      periodId: period.id,
      label: period.label,
      range: period.range,
      days: period.days,
      color: period.color,
      spend: periodRows.reduce((s, r) => s + r.total_net_spend_usd, 0),
      requests: periodRows.reduce((s, r) => s + r.total_requests, 0),
      users: users.size,
      rows: periodRows.length,
    }
  })
}

export function uniqueValues(rows: EnrichedRow[], key: 'model' | 'product' | 'domain'): string[] {
  return [...new Set(rows.map((r) => r[key]))].sort()
}

export function maskEmail(email: string, hidden: boolean): string {
  if (!hidden) return email
  const [name, domain] = email.split('@')
  if (!domain) return email
  if (name.length <= 2) return `*@${domain}`
  return `${name[0]}***${name[name.length - 1]}@${domain}`
}

export function formatUsd(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

export function formatSignedUsd(value: number): string {
  if (value > 0) return `+${formatUsd(value)}`
  if (value < 0) return `−${formatUsd(Math.abs(value))}`
  return formatUsd(0)
}

export function formatPct(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return `${(value * 100).toFixed(1)}%`
}

export function formatSignedPct(ratio: number): string {
  if (!Number.isFinite(ratio)) return '—'
  const pct = ratio * 100
  const abs = Math.abs(pct).toFixed(1)
  if (pct > 0) return `+${abs}%`
  if (pct < 0) return `−${abs}%`
  return '0%'
}

export function periodDeltaRatio(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return (current - previous) / previous
}

export function composeShare<T>(
  items: T[],
  getId: (item: T) => string,
  getName: (item: T) => string,
  getValue: (item: T) => number,
  limit: number,
  othersLabel: string,
): { id: string; name: string; value: number }[] {
  const sorted = [...items].filter((item) => getValue(item) > 0).sort((a, b) => getValue(b) - getValue(a))
  const head = sorted.slice(0, limit)
  const rest = sorted.slice(limit)
  const out = head.map((item) => ({ id: getId(item), name: getName(item), value: getValue(item) }))
  const restSum = rest.reduce((sum, item) => sum + getValue(item), 0)
  if (restSum > 0) out.push({ id: '__others__', name: othersLabel, value: restSum })
  return out
}

export function spendBuckets(users: UserRank[]): { id: string; min: number; max: number; count: number }[] {
  const edges = [
    { id: 'zero', min: 0, max: 0 },
    { id: 'low', min: 0.01, max: 10 },
    { id: 'mid', min: 10, max: 50 },
    { id: 'high', min: 50, max: 100 },
    { id: 'heavy', min: 100, max: 250 },
    { id: 'top', min: 250, max: Number.POSITIVE_INFINITY },
  ]
  return edges.map((edge) => ({
    ...edge,
    count: users.filter((user) => {
      if (edge.id === 'zero') return user.spend === 0
      return user.spend >= edge.min && user.spend < edge.max
    }).length,
  }))
}

export function productSpendByPeriod(rows: EnrichedRow[]): { periodId: PeriodId; label: string; color: string; [product: string]: string | number }[] {
  const products = uniqueValues(rows, 'product')
  return PERIODS.filter((period) => rows.some((row) => row.periodId === period.id)).map((period) => {
    const periodRows = rows.filter((row) => row.periodId === period.id)
    const point: { periodId: PeriodId; label: string; color: string; [product: string]: string | number } = {
      periodId: period.id,
      label: period.label,
      color: period.color,
    }
    for (const product of products) {
      point[product] = periodRows
        .filter((row) => row.product === product)
        .reduce((sum, row) => sum + row.total_net_spend_usd, 0)
    }
    return point
  })
}

export function tokenSpendByPeriod(rows: EnrichedRow[]): {
  periodId: PeriodId
  prompt: number
  cacheRead: number
  completion: number
  uncached: number
  cache5m: number
  cache1h: number
}[] {
  return PERIODS.filter((period) => rows.some((row) => row.periodId === period.id)).map((period) => {
    const periodRows = rows.filter((row) => row.periodId === period.id)
    return {
      periodId: period.id,
      prompt: periodRows.reduce((sum, row) => sum + row.total_prompt_tokens, 0),
      cacheRead: periodRows.reduce((sum, row) => sum + row.total_cache_read_tokens, 0),
      completion: periodRows.reduce((sum, row) => sum + row.total_completion_tokens, 0),
      uncached: periodRows.reduce((sum, row) => sum + row.total_uncached_input_tokens, 0),
      cache5m: periodRows.reduce((sum, row) => sum + row.total_cache_write_5m_tokens, 0),
      cache1h: periodRows.reduce((sum, row) => sum + row.total_cache_write_1h_tokens, 0),
    }
  })
}

export function median(values: number[]): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 1) return sorted[mid] ?? 0
  return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
}

export function percentile(values: number[], p: number): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = (sorted.length - 1) * p
  const lo = Math.floor(index)
  const hi = Math.ceil(index)
  if (lo === hi) return sorted[lo] ?? 0
  return (sorted[lo] ?? 0) + ((sorted[hi] ?? 0) - (sorted[lo] ?? 0)) * (index - lo)
}

export function costStats(users: UserRank[]) {
  const active = users.filter((user) => user.requests > 0)
  const costs = active.map((user) => user.spend / user.requests)
  const spend = active.reduce((sum, user) => sum + user.spend, 0)
  const requests = active.reduce((sum, user) => sum + user.requests, 0)
  return {
    active,
    costs,
    average: requests > 0 ? spend / requests : 0,
    median: median(costs),
    p90: percentile(costs, 0.9),
  }
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toLocaleString()
}
