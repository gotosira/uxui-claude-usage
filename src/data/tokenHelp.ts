import type { Copy } from '../axio/i18n'
import type { DashboardStats } from './types'
import { AXIO_SERIES } from '../axio/tokens'

export interface TokenHelpItem {
  key: string
  label: string
  body: string
  column: string
  value: number
  color: string
}

export function tokenHelpItems(t: Copy, stats: DashboardStats): TokenHelpItem[] {
  return [
    {
      key: 'prompt',
      label: t.promptTokens,
      body: t.helpPrompt,
      column: t.colPrompt,
      value: stats.promptTokens,
      color: AXIO_SERIES[0],
    },
    {
      key: 'cacheRead',
      label: t.cacheRead,
      body: t.helpCacheRead,
      column: t.colCacheRead,
      value: stats.cacheRead,
      color: AXIO_SERIES[1],
    },
    {
      key: 'completion',
      label: t.completionTokens,
      body: t.helpCompletion,
      column: t.colCompletion,
      value: stats.completionTokens,
      color: AXIO_SERIES[2],
    },
    {
      key: 'uncached',
      label: t.uncached,
      body: t.helpUncached,
      column: t.colUncached,
      value: stats.uncached,
      color: AXIO_SERIES[3],
    },
    {
      key: 'cache5m',
      label: t.cacheWrite5m,
      body: t.helpCache5m,
      column: t.colCache5m,
      value: stats.cacheWrite5m,
      color: AXIO_SERIES[4],
    },
    {
      key: 'cache1h',
      label: t.cacheWrite1h,
      body: t.helpCache1h,
      column: t.colCache1h,
      value: stats.cacheWrite1h,
      color: AXIO_SERIES[5],
    },
    {
      key: 'web',
      label: t.webSearch,
      body: t.helpWebSearch,
      column: t.colWeb,
      value: stats.webSearch,
      color: AXIO_SERIES[6],
    },
  ]
}
