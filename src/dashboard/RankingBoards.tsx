import { useState } from 'react'
import { Search } from 'lucide-react'
import { AxioCard, AxioChip, AxioEmpty, AxioSectionTitle, interpolate, useLanguage } from '../axio'
import { composeShare, formatCompact, formatSignedUsd, formatUsd } from '../data/aggregate'
import { displayPerson } from '../data/display'
import { useFilters } from '../data/FilterContext'
import {
  PEOPLE_RANK_IDS,
  peopleRankHint,
  peopleRankLabel,
  rankModels,
  rankPeople,
  rankQueue,
} from '../data/rankings'
import { useLayout } from '../layout/LayoutContext'
import { DonutChart, RankBars } from './ChartKit'

export function RankingBoards() {
  const { t } = useLanguage()
  const { topUsers, byProduct, byModel } = useFilters()
  const { rankId, setRankId, openPerson, openEntity, personEmail } = useLayout()
  const [query, setQuery] = useState('')
  const people = rankPeople(topUsers, rankId, t, query.trim() ? 96 : 18)
  const models = rankModels(byModel, t, 8)
  const productShare = composeShare(byProduct, (item) => item.product, (item) => item.product, (item) => item.spend, 5, t.others)
  const modelShare = composeShare(byModel, (item) => item.model, (item) => item.model, (item) => item.spend, 6, t.others)
  const visiblePeople = people.filter((row) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return (
      displayPerson(row.user.email).toLowerCase().includes(q) ||
      row.user.email.toLowerCase().includes(q)
    )
  })
  const queue = rankQueue(topUsers, rankId)

  return (
    <div className="axio-rank-stack">
      <AxioCard>
        <AxioSectionTitle hint={peopleRankHint(rankId, t)}>{t.rankTitle}</AxioSectionTitle>
        <div className="axio-rank-chips">
          {PEOPLE_RANK_IDS.map((id) => (
            <AxioChip key={id} active={rankId === id} onClick={() => setRankId(id)}>
              {peopleRankLabel(id, t)}
            </AxioChip>
          ))}
        </div>
        <label className="axio-rank-search">
          <Search size={16} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.rankSearch}
          />
        </label>
        {!visiblePeople.length ? (
          <AxioEmpty>{query.trim() ? interpolate(t.searchEmpty, { q: query.trim() }) : t.emptyChart}</AxioEmpty>
        ) : (
          <RankBars
            data={visiblePeople.slice(0, 18).map((row) => ({
              id: row.user.email,
              name: displayPerson(row.user.email),
              value: row.value,
            }))}
            selectedId={personEmail}
            onSelect={(id) => openPerson(id, queue)}
            formatValue={(value) => {
              if (rankId === 'spend' || rankId === 'unitCost') return formatUsd(value)
              if (rankId === 'growth') return formatSignedUsd(value)
              if (rankId === 'idle') return formatUsd(0)
              return formatCompact(value)
            }}
          />
        )}
      </AxioCard>

      <div className="axio-chart-grid">
        <AxioCard>
          <AxioSectionTitle hint={t.productHint}>{t.rankProducts}</AxioSectionTitle>
          <DonutChart
            data={productShare}
            centerLabel={t.spendShare}
            selectedId={null}
            onSelect={(id) => openEntity('product', id)}
          />
        </AxioCard>
        <AxioCard>
          <AxioSectionTitle hint={t.clickSlice}>{t.rankModels}</AxioSectionTitle>
          <DonutChart
            data={modelShare.map((item) => ({
              ...item,
              name: models.find((row) => row.id === item.id)?.title ?? item.name,
            }))}
            centerLabel={t.spendShare}
            onSelect={(id) => openEntity('model', id)}
          />
        </AxioCard>
      </div>
    </div>
  )
}
