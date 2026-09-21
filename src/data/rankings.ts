import type { Copy } from '../axio/i18n'
import { displayModel, displayPerson } from './display'
import {
  aggregateByModel,
  aggregateByProduct,
  comparePeriods,
  computeStats,
  emptyUserRank,
  formatCompact,
  formatSignedUsd,
  formatUsd,
} from './aggregate'
import type {
  EnrichedRow,
  EntityKind,
  ModelSpend,
  PeopleRankId,
  PeriodId,
  ProductSpend,
  UserRank,
} from './types'
import { ALL_PERIOD_IDS } from './periods'

export interface RankedPerson {
  user: UserRank
  value: number
  display: string
  caption: string
}

export interface RankedEntity {
  kind: EntityKind
  id: string
  title: string
  value: number
  display: string
  caption: string
  spend: number
  requests: number
  users?: number
}

export const PEOPLE_RANK_IDS: PeopleRankId[] = [
  'spend',
  'requests',
  'tokens',
  'cache',
  'web',
  'unitCost',
  'growth',
  'idle',
]

export function peopleRankLabel(id: PeopleRankId, t: Copy): string {
  if (id === 'spend') return t.rankSpend
  if (id === 'requests') return t.rankRequests
  if (id === 'tokens') return t.rankTokens
  if (id === 'cache') return t.rankCache
  if (id === 'web') return t.rankWeb
  if (id === 'unitCost') return t.rankUnitCost
  if (id === 'growth') return t.rankGrowth
  return t.rankIdle
}

export function peopleRankHint(id: PeopleRankId, t: Copy): string {
  if (id === 'spend') return t.rankSpendHint
  if (id === 'requests') return t.rankRequestsHint
  if (id === 'tokens') return t.rankTokensHint
  if (id === 'cache') return t.rankCacheHint
  if (id === 'web') return t.rankWebHint
  if (id === 'unitCost') return t.rankUnitCostHint
  if (id === 'growth') return t.rankGrowthHint
  return t.rankIdleHint
}

function metric(user: UserRank, id: PeopleRankId): number {
  if (id === 'spend') return user.spend
  if (id === 'requests') return user.requests
  if (id === 'tokens') return user.promptTokens
  if (id === 'cache') return user.cacheRead
  if (id === 'web') return user.webSearch
  if (id === 'unitCost') return user.spendPerRequest
  if (id === 'growth') return user.julToAug
  return user.spend
}

function displayMetric(user: UserRank, id: PeopleRankId): string {
  if (id === 'spend') return formatUsd(metric(user, id))
  if (id === 'unitCost') return user.requests ? formatUsd(user.spendPerRequest) : '—'
  if (id === 'growth') return formatSignedUsd(user.julToAug)
  if (id === 'idle') return formatUsd(0)
  return formatCompact(metric(user, id))
}

export function rankPeople(users: UserRank[], id: PeopleRankId, t: Copy, limit = 12): RankedPerson[] {
  let pool = [...users]
  if (id === 'idle') pool = pool.filter((user) => user.spend === 0)
  else if (id === 'unitCost') pool = pool.filter((user) => user.requests > 0)
  else if (id === 'growth') pool = pool.filter((user) => user.spendByPeriod.jul + user.spendByPeriod.aug > 0)
  else pool = pool.filter((user) => metric(user, id) > 0)

  pool.sort((a, b) => {
    if (id === 'idle') return a.email.localeCompare(b.email)
    return metric(b, id) - metric(a, id) || a.email.localeCompare(b.email)
  })

  return pool.slice(0, limit).map((user) => ({
    user,
    value: metric(user, id),
    display: displayMetric(user, id),
    caption:
      id === 'idle'
        ? t.noSpend
        : `${user.topProduct} · ${displayModel(user.topModel)}`,
  }))
}

export function rankQueue(users: UserRank[], id: PeopleRankId): string[] {
  let pool = [...users]
  if (id === 'idle') pool = pool.filter((user) => user.spend === 0)
  else if (id === 'unitCost') pool = pool.filter((user) => user.requests > 0)
  else if (id === 'growth') pool = pool.filter((user) => user.spendByPeriod.jul + user.spendByPeriod.aug > 0)
  else pool = pool.filter((user) => metric(user, id) > 0)
  pool.sort((a, b) => {
    if (id === 'idle') return a.email.localeCompare(b.email)
    return metric(b, id) - metric(a, id) || a.email.localeCompare(b.email)
  })
  return pool.map((user) => user.email)
}

export function rankProducts(products: ProductSpend[], t: Copy, limit = 8): RankedEntity[] {
  return [...products]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, limit)
    .map((item) => ({
      kind: 'product' as const,
      id: item.product,
      title: item.product,
      value: item.spend,
      display: formatUsd(item.spend),
      caption: `${item.users} ${t.users} · ${formatCompact(item.requests)} ${t.req}`,
      spend: item.spend,
      requests: item.requests,
      users: item.users,
    }))
}

export function rankModels(models: ModelSpend[], t: Copy, limit = 8): RankedEntity[] {
  return [...models]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, limit)
    .map((item) => ({
      kind: 'model' as const,
      id: item.model,
      title: displayModel(item.model),
      value: item.spend,
      display: formatUsd(item.spend),
      caption: `${formatCompact(item.requests)} ${t.req}`,
      spend: item.spend,
      requests: item.requests,
    }))
}

export interface PersonProfile {
  email: string
  name: string
  rank: UserRank
  stats: ReturnType<typeof computeStats>
  groupSpend: number
  shareOfSpend: number
  spendRank: number
  requestRank: number
  tokenRank: number
  products: ProductSpend[]
  models: ModelSpend[]
  months: ReturnType<typeof comparePeriods>
  rows: EnrichedRow[]
  present: PeriodId[]
  missing: PeriodId[]
}

export function buildPersonProfile(
  email: string,
  users: UserRank[],
  personRows: EnrichedRow[],
  groupRows: EnrichedRow[],
): PersonProfile {
  const user = users.find((item) => item.email === email) ?? {
    ...emptyUserRank(email),
    userId: personRows[0]?.user_id ?? '',
    accountUuid: personRows[0]?.account_uuid ?? '',
  }
  const stats = computeStats(personRows)
  const groupSpend = groupRows.reduce((sum, row) => sum + row.total_net_spend_usd, 0)
  const spenders = [...users].filter((item) => item.spend > 0).sort((a, b) => b.spend - a.spend)
  const requesters = [...users].filter((item) => item.requests > 0).sort((a, b) => b.requests - a.requests)
  const tokeners = [...users]
    .filter((item) => item.promptTokens > 0)
    .sort((a, b) => b.promptTokens - a.promptTokens)
  const spendRank = spenders.findIndex((item) => item.email === email) + 1
  const requestRank = requesters.findIndex((item) => item.email === email) + 1
  const tokenRank = tokeners.findIndex((item) => item.email === email) + 1
  const present = ALL_PERIOD_IDS.filter((id) => user.periods.includes(id))
  const missing = ALL_PERIOD_IDS.filter((id) => !user.periods.includes(id))
  return {
    email,
    name: displayPerson(email),
    rank: user,
    stats,
    groupSpend,
    shareOfSpend: groupSpend > 0 ? stats.netSpend / groupSpend : 0,
    spendRank,
    requestRank,
    tokenRank,
    products: aggregateByProduct(personRows),
    models: aggregateByModel(personRows),
    months: comparePeriods(personRows, new Set(ALL_PERIOD_IDS)),
    rows: [...personRows].sort((a, b) => b.total_net_spend_usd - a.total_net_spend_usd),
    present,
    missing,
  }
}

export function slicePersonRows(
  rows: EnrichedRow[],
  slice: { period: PeriodId | null; product: string | null; model: string | null },
): EnrichedRow[] {
  return rows.filter((row) => {
    if (slice.period && row.periodId !== slice.period) return false
    if (slice.product && row.product !== slice.product) return false
    if (slice.model && row.model !== slice.model) return false
    return true
  })
}

export function entityPeople(rows: EnrichedRow[], kind: EntityKind, id: string): UserRank[] {
  const filtered = rows.filter((row) => (kind === 'product' ? row.product === id : row.model === id))
  return [...filtered.reduce((map, row) => {
    const current = map.get(row.user_email) ?? {
      email: row.user_email,
      spend: 0,
      requests: 0,
    }
    current.spend += row.total_net_spend_usd
    current.requests += row.total_requests
    map.set(row.user_email, current)
    return map
  }, new Map<string, { email: string; spend: number; requests: number }>()).values()]
    .sort((a, b) => b.spend - a.spend)
    .map((item) => ({
      email: item.email,
      spend: item.spend,
      requests: item.requests,
      rows: 0,
      promptTokens: 0,
      completionTokens: 0,
      cacheRead: 0,
      uncached: 0,
      cacheWrite5m: 0,
      cacheWrite1h: 0,
      webSearch: 0,
      spendPerRequest: item.requests ? item.spend / item.requests : 0,
      julToAug: 0,
      topProduct: kind === 'product' ? id : '—',
      topModel: kind === 'model' ? id : '—',
      periods: [],
      spendByPeriod: { jul: 0, aug: 0, sep: 0 },
      userId: '',
      accountUuid: '',
    }))
}
