import Papa from 'papaparse'
import { PERIOD_MAP } from './periods'
import type { EnrichedRow, PeriodId, UsageRecord } from './types'

const NUMERIC_FIELDS: (keyof UsageRecord)[] = [
  'total_requests',
  'total_prompt_tokens',
  'total_completion_tokens',
  'total_net_spend_usd',
  'total_uncached_input_tokens',
  'total_cache_read_tokens',
  'total_cache_write_5m_tokens',
  'total_cache_write_1h_tokens',
  'total_web_search_count',
]

function coerceRow(raw: Record<string, string>): UsageRecord {
  const row = { ...raw } as unknown as Record<string, string | number>
  for (const key of NUMERIC_FIELDS) {
    row[key] = Number(raw[key]) || 0
  }
  return row as unknown as UsageRecord
}

function enrich(row: UsageRecord, periodId: PeriodId): EnrichedRow {
  const meta = PERIOD_MAP[periodId]
  const domain = row.user_email.split('@')[1]?.toLowerCase() ?? 'unknown'
  return {
    ...row,
    product: row.product || '(other)',
    model: row.model || 'no-model',
    periodId,
    periodLabel: meta.label,
    domain,
  }
}

export async function loadPeriodCsv(periodId: PeriodId, url: string): Promise<EnrichedRow[]> {
  const response = await fetch(url)
  const text = await response.text()

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data
          .filter((r) => r.user_email)
          .map((r) => enrich(coerceRow(r), periodId))
        resolve(rows)
      },
      error: reject,
    })
  })
}
