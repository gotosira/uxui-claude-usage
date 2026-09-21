import type { Copy } from '../axio/i18n'
import type { PeriodId, UserRank } from './types'
import { displayModel, displayPerson } from './display'
import { PERIODS } from './periods'
import { monthCopy } from '../dashboard/monthCopy'

export type SearchKind = 'page' | 'person' | 'product' | 'model' | 'month'

export interface SearchItem {
  id: string
  kind: SearchKind
  title: string
  subtitle: string
  haystack: string
  to: string
  email?: string
  product?: string
  model?: string
  period?: PeriodId
}

export interface ScoredHit {
  item: SearchItem
  score: number
}

const KIND_ORDER: SearchKind[] = ['page', 'month', 'person', 'product', 'model']

export function buildSearchIndex(input: {
  t: Copy
  emails: readonly string[]
  products: string[]
  models: string[]
  users: UserRank[]
}): SearchItem[] {
  const { t } = input
  const spendByEmail = new Map(input.users.map((user) => [user.email.toLowerCase(), user]))

  const pages: SearchItem[] = [
    {
      id: 'page:/',
      kind: 'page',
      title: t.overviewTitle,
      subtitle: t.overviewSubtitle,
      haystack: `overview dashboard ภาพรวม ${t.overviewTitle} ${t.overviewSubtitle}`,
      to: '/',
    },
    {
      id: 'page:/people',
      kind: 'page',
      title: t.peopleTitle,
      subtitle: t.peopleSubtitle,
      haystack: `people users roster คน ${t.peopleTitle} ${t.users} ${t.peopleSubtitle}`,
      to: '/people',
    },
    {
      id: 'page:/products',
      kind: 'page',
      title: t.productsTitle,
      subtitle: t.productsSubtitle,
      haystack: `products models claude ผลิตภัณฑ์ เครื่องมือ ${t.productsTitle} ${t.productsNav} ${t.models} ${t.productsSubtitle}`,
      to: '/products',
    },
    {
      id: 'page:/months',
      kind: 'page',
      title: t.monthsTitle,
      subtitle: t.monthsSubtitle,
      haystack: `months periods july august september กรกฎาคม สิงหาคม กันยายน ${t.monthsTitle} ${t.monthsNav} ${t.monthsSubtitle}`,
      to: '/months',
    },
  ]

  const people: SearchItem[] = input.emails.map((email) => {
    const name = displayPerson(email)
    const rank = spendByEmail.get(email.toLowerCase())
    const spendHint = rank
      ? `$${rank.spend.toFixed(2)} · ${rank.topProduct || '—'}`
      : t.noSpend
    return {
      id: `person:${email}`,
      kind: 'person',
      title: name,
      subtitle: `${email} · ${spendHint}`,
      haystack: `${email} ${name} ${email.split('@')[0]}`,
      to: '/people',
      email,
    }
  })

  const products: SearchItem[] = input.products.map((product) => ({
    id: `product:${product}`,
    kind: 'product',
    title: product,
    subtitle: t.searchProductHint,
    haystack: `product ${product}`,
    to: '/products',
    product,
  }))

  const models: SearchItem[] = input.models.map((model) => {
    const label = displayModel(model)
    return {
      id: `model:${model}`,
      kind: 'model',
      title: label,
      subtitle: model,
      haystack: `model ${model} ${label} claude`,
      to: '/products',
      model,
    }
  })

  const months: SearchItem[] = PERIODS.map((period) => {
    const copy = monthCopy(period.id, t)
    return {
      id: `month:${period.id}`,
      kind: 'month',
      title: copy.title,
      subtitle: copy.range,
      haystack: `${period.id} ${period.label} ${copy.title} ${copy.range} ${period.file}`,
      to: '/months',
      period: period.id,
    }
  })

  return [...pages, ...people, ...products, ...models, ...months]
}

function scoreItem(item: SearchItem, query: string): number {
  const q = query.trim().toLowerCase()
  if (!q) return 0
  const hay = item.haystack.toLowerCase()
  const title = item.title.toLowerCase()
  if (title === q || hay === q) return 200
  if (title.startsWith(q)) return 160
  if (hay.startsWith(q)) return 140
  const titleIndex = title.indexOf(q)
  if (titleIndex >= 0) return 120 - titleIndex
  const hayIndex = hay.indexOf(q)
  if (hayIndex >= 0) return 80 - Math.min(hayIndex, 40)
  const tokens = q.split(/\s+/).filter(Boolean)
  if (tokens.length > 1 && tokens.every((token) => hay.includes(token))) return 70
  return 0
}

export function searchIndex(items: SearchItem[], query: string, limit = 24): ScoredHit[] {
  const q = query.trim()
  if (!q) return []
  return items
    .map((item) => ({ item, score: scoreItem(item, q) }))
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score || KIND_ORDER.indexOf(a.item.kind) - KIND_ORDER.indexOf(b.item.kind))
    .slice(0, limit)
}

export function groupHits(hits: ScoredHit[]): { kind: SearchKind; hits: ScoredHit[] }[] {
  const buckets = new Map<SearchKind, ScoredHit[]>()
  for (const hit of hits) {
    const list = buckets.get(hit.item.kind) ?? []
    list.push(hit)
    buckets.set(hit.item.kind, list)
  }
  return KIND_ORDER.filter((kind) => buckets.has(kind)).map((kind) => ({
    kind,
    hits: buckets.get(kind)!,
  }))
}

export function kindLabel(kind: SearchKind, t: Copy): string {
  if (kind === 'page') return t.searchPages
  if (kind === 'person') return t.searchPeople
  if (kind === 'product') return t.searchProducts
  if (kind === 'model') return t.searchModels
  return t.searchMonths
}
