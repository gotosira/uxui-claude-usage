import { useMemo } from 'react'
import { AxioCard, AxioEmpty, AxioSectionTitle, useLanguage } from '../axio'
import { composeShare, formatCompact, spendBuckets } from '../data/aggregate'
import { displayPerson } from '../data/display'
import { useFilters } from '../data/FilterContext'
import { rankQueue } from '../data/rankings'
import { useLayout } from '../layout/LayoutContext'
import { DonutChart, RankBars } from './ChartKit'
import { CostPerRequestChart } from './CostPerRequestChart'
import { RequestSpendScatter } from './RequestSpendScatter'

export function PeopleCharts() {
  const { t } = useLanguage()
  const { topUsers, filters } = useFilters()
  const { openPerson, personEmail, rankId } = useLayout()
  const queue = rankQueue(topUsers, rankId)

  const rows = useMemo(() => {
    const q = filters.emailSearch.trim().toLowerCase()
    if (!q) return topUsers
    return topUsers.filter(
      (user) =>
        user.email.toLowerCase().includes(q) || displayPerson(user.email).toLowerCase().includes(q),
    )
  }, [filters.emailSearch, topUsers])

  const share = composeShare(
    rows,
    (user) => user.email,
    (user) => displayPerson(user.email),
    (user) => user.spend,
    8,
    t.restOfTeam,
  )
  const ranked = [...rows].sort((a, b) => b.spend - a.spend)
  const bars = ranked.slice(0, 24).map((user) => ({
    id: user.email,
    name: displayPerson(user.email),
    value: user.spend,
  }))
  const buckets = spendBuckets(rows).map((bucket) => ({
    id: bucket.id,
    name:
      bucket.id === 'zero'
        ? t.bucketZero
        : bucket.id === 'low'
          ? t.bucketLow
          : bucket.id === 'mid'
            ? t.bucketMid
            : bucket.id === 'high'
              ? t.bucketHigh
              : bucket.id === 'heavy'
                ? t.bucketHeavy
                : t.bucketTop,
    value: bucket.count,
  }))

  if (!rows.length) return <AxioEmpty>{t.emptyChart}</AxioEmpty>

  return (
    <>
      <RequestSpendScatter
        users={rows}
        selectedId={personEmail}
        onSelect={(id) => openPerson(id, queue)}
      />
      <div className="axio-chart-grid">
        <CostPerRequestChart
          users={rows}
          selectedId={personEmail}
          onSelect={(id) => openPerson(id, queue)}
        />
        <AxioCard id="section-users">
          <AxioSectionTitle hint={t.clickChart}>{t.topSpenders}</AxioSectionTitle>
          <RankBars
            data={bars}
            selectedId={personEmail}
            onSelect={(id) => openPerson(id, queue)}
          />
        </AxioCard>
      </div>
      <div className="axio-chart-grid">
        <AxioCard>
          <AxioSectionTitle hint={t.clickChart}>{t.spendShare}</AxioSectionTitle>
          <DonutChart
            data={share}
            centerLabel={t.netSpend}
            selectedId={personEmail}
            onSelect={(id) => openPerson(id, queue)}
          />
        </AxioCard>
        <AxioCard>
          <AxioSectionTitle hint={t.helpUniqueUsers}>{t.spendDistribution}</AxioSectionTitle>
          <RankBars data={buckets} formatValue={(value) => formatCompact(value)} />
        </AxioCard>
      </div>
    </>
  )
}
