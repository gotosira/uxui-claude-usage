import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AXIO, AXIO_CHART, AxioCard, AxioEmpty, AxioSectionTitle, useLanguage } from '../axio'
import { formatCompact, formatUsd, costStats } from '../data/aggregate'
import { displayPerson } from '../data/display'
import type { UserRank } from '../data/types'
import { RankBars } from './ChartKit'

const COST_BUCKETS = [
  { id: 'b0', min: 0, max: 0.03 },
  { id: 'b1', min: 0.03, max: 0.06 },
  { id: 'b2', min: 0.06, max: 0.1 },
  { id: 'b3', min: 0.1, max: 0.2 },
  { id: 'b4', min: 0.2, max: Number.POSITIVE_INFINITY },
] as const

function bucketLabel(id: (typeof COST_BUCKETS)[number]['id'], t: { costBucket0: string; costBucket1: string; costBucket2: string; costBucket3: string; costBucket4: string }) {
  if (id === 'b0') return t.costBucket0
  if (id === 'b1') return t.costBucket1
  if (id === 'b2') return t.costBucket2
  if (id === 'b3') return t.costBucket3
  return t.costBucket4
}

export function CostPerRequestChart({
  users,
  selectedId,
  onSelect,
}: {
  users: UserRank[]
  selectedId?: string | null
  onSelect?: (email: string) => void
}) {
  const { t } = useLanguage()
  const stats = costStats(users)

  if (!stats.active.length) return <AxioEmpty>{t.emptyChart}</AxioEmpty>

  const buckets = COST_BUCKETS.map((bucket) => {
    const count = stats.active.filter((user) => {
      const cost = user.spend / user.requests
      return cost >= bucket.min && cost < bucket.max
    }).length
    return {
      id: bucket.id,
      name: bucketLabel(bucket.id, t),
      value: count,
      hot: bucket.min >= stats.p90,
    }
  }).filter((bucket) => bucket.value > 0)

  const people = [...stats.active]
    .map((user) => {
      const cost = user.spend / user.requests
      return {
        id: user.email,
        name: displayPerson(user.email),
        value: cost,
        color: cost > stats.p90 ? AXIO.destructive : AXIO.primary,
      }
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 12)

  return (
    <AxioCard>
      <AxioSectionTitle hint={t.helpUnitCost}>{t.costSpreadTitle}</AxioSectionTitle>
      <div className="axio-explorer axio-cost-stats">
        <div>
          <small>{t.costAvg}</small>
          <strong>{formatUsd(stats.average)}</strong>
        </div>
        <div>
          <small>{t.costMedian}</small>
          <strong>{formatUsd(stats.median)}</strong>
        </div>
        <div>
          <small>{t.costP90}</small>
          <strong>{formatUsd(stats.p90)}</strong>
        </div>
      </div>
      <div className="axio-chart-host">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={buckets} margin={{ top: 4, right: 8, left: 0, bottom: 8 }}>
            <XAxis
              dataKey="name"
              tick={{ fill: AXIO_CHART.muted, fontSize: 11, fontFamily: AXIO.font }}
              axisLine={{ stroke: AXIO_CHART.grid }}
              tickLine={false}
              interval={0}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: AXIO_CHART.muted, fontSize: 11, fontFamily: AXIO.font }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => formatCompact(Number(value))}
            />
            <Tooltip
              contentStyle={AXIO_CHART.tooltip}
              formatter={(value) => [formatCompact(Number(value)), t.uniqueUsers]}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {buckets.map((bucket) => (
                <Cell key={bucket.id} fill={bucket.hot ? AXIO.destructive : AXIO.primary} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="axio-cost-people-label">{t.costPeople}</p>
      <RankBars
        data={people}
        selectedId={selectedId}
        onSelect={onSelect}
        yAxisWidth={108}
      />
      <details className="axio-why">
        <summary>{t.costWhyTitle}</summary>
        <p>{t.costWhyCauses}</p>
        <p>{t.costWhyDo}</p>
      </details>
    </AxioCard>
  )
}
