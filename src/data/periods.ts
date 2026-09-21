import type { PeriodId, PeriodMeta } from './types'

export const PERIODS: PeriodMeta[] = [
  {
    id: 'jul',
    label: 'July 2026',
    range: '01/07/2026 – 31/07/2026',
    days: 31,
    file: '/data/spend-report-c61f742b-53c6-45fd-8152-7693857f033b-2026-07-01-to-2026-07-31.csv',
    color: '#074E9F',
    colorSoft: '#0A5CAD',
  },
  {
    id: 'aug',
    label: 'August 2026',
    range: '01/08/2026 – 31/08/2026',
    days: 31,
    file: '/data/spend-report-c61f742b-53c6-45fd-8152-7693857f033b-2026-08-01-to-2026-08-31.csv',
    color: '#0086C9',
    colorSoft: '#34B4E0',
  },
  {
    id: 'sep',
    label: 'September 2026',
    range: '01/09/2026 – 15/09/2026',
    days: 15,
    file: '/data/spend-report-c61f742b-53c6-45fd-8152-7693857f033b-2026-09-01-to-2026-09-15.csv',
    color: '#07A721',
    colorSoft: '#00964C',
  },
]

export const ALL_PERIOD_IDS: PeriodId[] = PERIODS.map((p) => p.id)

export const PERIOD_MAP = Object.fromEntries(PERIODS.map((p) => [p.id, p])) as Record<
  PeriodId,
  PeriodMeta
>
