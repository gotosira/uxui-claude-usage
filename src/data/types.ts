export type PeriodId = 'jul' | 'aug' | 'sep'

export interface UsageRecord {
  user_email: string
  account_uuid: string
  product: string
  model: string
  total_requests: number
  total_prompt_tokens: number
  total_completion_tokens: number
  total_net_spend_usd: number
  user_id: string
  total_uncached_input_tokens: number
  total_cache_read_tokens: number
  total_cache_write_5m_tokens: number
  total_cache_write_1h_tokens: number
  total_web_search_count: number
  slack_channel_id: string
  teams_channel_id: string
}

export interface EnrichedRow extends UsageRecord {
  periodId: PeriodId
  periodLabel: string
  domain: string
}

export interface PeriodMeta {
  id: PeriodId
  label: string
  range: string
  days: number
  file: string
  color: string
  colorSoft: string
}

export interface FilterState {
  periods: Set<PeriodId>
  model: string | null
  product: string | null
  domain: string | null
  emailSearch: string
  userEmail: string | null
}

export interface DashboardStats {
  netSpend: number
  requests: number
  uniqueUsers: number
  rows: number
  promptTokens: number
  completionTokens: number
  cacheRead: number
  uncached: number
  cacheWrite5m: number
  cacheWrite1h: number
  webSearch: number
}

export interface ModelSpend {
  model: string
  spend: number
  requests: number
}

export interface ProductSpend {
  product: string
  spend: number
  requests: number
  users: number
  rows: number
}

export interface DomainSpend {
  domain: string
  spend: number
  requests: number
  users: number
}

export interface UserRank {
  email: string
  spend: number
  requests: number
  rows: number
  promptTokens: number
  completionTokens: number
  cacheRead: number
  uncached: number
  cacheWrite5m: number
  cacheWrite1h: number
  webSearch: number
  spendPerRequest: number
  julToAug: number
  topProduct: string
  topModel: string
  periods: PeriodId[]
  spendByPeriod: Record<PeriodId, number>
  userId: string
  accountUuid: string
}

export type PeopleRankId =
  | 'spend'
  | 'requests'
  | 'tokens'
  | 'cache'
  | 'web'
  | 'unitCost'
  | 'growth'
  | 'idle'

export type EntityKind = 'product' | 'model'

export interface RankEntry {
  key: string
  email?: string
  product?: string
  model?: string
  value: number
  hint: string
}

export interface PeriodComparison {
  periodId: PeriodId
  label: string
  range: string
  days: number
  color: string
  spend: number
  requests: number
  users: number
  rows: number
}
