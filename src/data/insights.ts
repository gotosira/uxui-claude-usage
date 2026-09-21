import type { PeriodComparison, ProductSpend, UserRank } from './types'
import { periodDeltaRatio } from './aggregate'

export function pairedPeriods(periods: PeriodComparison[]): {
  current: PeriodComparison
  previous: PeriodComparison
} | null {
  const jul = periods.find((item) => item.periodId === 'jul')
  const aug = periods.find((item) => item.periodId === 'aug')
  if (jul && aug) return { previous: jul, current: aug }
  if (periods.length < 2) return null
  return { previous: periods[periods.length - 2], current: periods[periods.length - 1] }
}

export function pairedDelta(periods: PeriodComparison[], key: 'spend' | 'requests' | 'users') {
  const pair = pairedPeriods(periods)
  if (!pair) return null
  return {
    ...pair,
    ratio: periodDeltaRatio(pair.current[key], pair.previous[key]),
  }
}

export function biggestMover(users: UserRank[]): UserRank | null {
  const movers = users.filter((user) => user.julToAug !== 0)
  if (!movers.length) return null
  return [...movers].sort((a, b) => Math.abs(b.julToAug) - Math.abs(a.julToAug))[0] ?? null
}

export function topProductShare(products: ProductSpend[], total: number) {
  const top = [...products].sort((a, b) => b.spend - a.spend)[0]
  if (!top || total <= 0) return null
  return { product: top.product, spend: top.spend, share: top.spend / total }
}

export function idleCount(users: UserRank[]): number {
  return users.filter((user) => user.spend === 0).length
}
