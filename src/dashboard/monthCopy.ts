import type { PeriodId } from '../data/types'
import type { Copy } from '../axio/i18n'

export function monthCopy(id: PeriodId, t: Copy): { title: string; range: string } {
  if (id === 'jul') return { title: t.monthJul, range: t.rangeJul }
  if (id === 'aug') return { title: t.monthAug, range: t.rangeAug }
  return { title: t.monthSep, range: t.rangeSep }
}
