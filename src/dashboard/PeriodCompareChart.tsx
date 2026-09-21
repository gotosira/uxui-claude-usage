import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { composeShare, formatCompact, formatUsd } from '../data/aggregate'
import { clickPayload } from './chartUtils'
import { useFilters } from '../data/FilterContext'
import { AXIO, AXIO_CHART, AxioCard, AxioEmpty, AxioSectionTitle, useLanguage } from '../axio'
import { monthCopy } from './monthCopy'
import { DonutChart } from './ChartKit'
import type { PeriodId } from '../data/types'

export function PeriodCompareChart() {
  const { t } = useLanguage()
  const { periodCompare, togglePeriod, filters } = useFilters()

  const chartData = periodCompare.map((p) => ({
    name: monthCopy(p.periodId, t).title,
    periodId: p.periodId,
    net: p.spend,
    requests: p.requests,
    users: p.users,
    rows: p.rows,
    fill: p.color,
  }))
  const totals = {
    spend: periodCompare.reduce((sum, item) => sum + item.spend, 0),
  }
  const peak = periodCompare.reduce(
    (best, item) => (item.spend > best.spend ? item : best),
    periodCompare[0] ?? { spend: 0, periodId: 'jul' as const },
  )
  const monthShare = composeShare(
    periodCompare,
    (item) => item.periodId,
    (item) => monthCopy(item.periodId, t).title,
    (item) => item.spend,
    3,
    t.others,
  )

  return (
    <div className="axio-chart-grid">
      <AxioCard>
        <AxioSectionTitle hint={t.monthSpendHint}>{t.monthSpend}</AxioSectionTitle>
        {chartData.length > 0 && (
          <div className="axio-explorer">
            <div>
              <small>{t.chartTotal}</small>
              <strong>{formatUsd(totals.spend)}</strong>
            </div>
            <div>
              <small>{t.chartAverage}</small>
              <strong>{formatUsd(totals.spend / chartData.length)}</strong>
            </div>
            <div>
              <small>{t.chartPeak}</small>
              <strong>
                {formatUsd(peak.spend)} · {monthCopy(peak.periodId, t).title}
              </strong>
            </div>
          </div>
        )}
        {!chartData.length ? (
          <AxioEmpty>{t.emptyChart}</AxioEmpty>
        ) : (
          <div className="axio-chart-host">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData} margin={{ bottom: 8, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={AXIO_CHART.grid} vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: AXIO_CHART.ink, fontSize: 12, fontFamily: AXIO.font }}
                  axisLine={{ stroke: AXIO_CHART.grid }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: AXIO_CHART.muted, fontSize: 12, fontFamily: AXIO.font }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatUsd(Number(value))}
                />
                <YAxis
                  yAxisId="req"
                  orientation="right"
                  tick={{ fill: AXIO_CHART.muted, fontSize: 11, fontFamily: AXIO.font }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatCompact(Number(value))}
                />
                <Tooltip
                  contentStyle={AXIO_CHART.tooltip}
                  formatter={(v, name) => {
                    if (name === t.compareNet) return formatUsd(Number(v))
                    if (name === t.requests) return formatCompact(Number(v))
                    return Number(v).toLocaleString()
                  }}
                />
                <Legend wrapperStyle={{ fontFamily: AXIO.font, fontSize: 12 }} />
                <Bar
                  dataKey="net"
                  name={t.compareNet}
                  fill={AXIO.primary}
                  radius={[4, 4, 0, 0]}
                  onClick={(item, index) => {
                    const row = clickPayload(item, index, chartData)
                    if (row?.periodId) togglePeriod(row.periodId)
                  }}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={`net-${entry.periodId}`}
                      fill={entry.fill}
                      opacity={filters.periods.has(entry.periodId) ? 1 : 0.25}
                    />
                  ))}
                </Bar>
                <Line
                  yAxisId="req"
                  type="monotone"
                  dataKey="requests"
                  name={t.requests}
                  stroke={AXIO.destructive}
                  strokeWidth={2}
                  dot={{ r: 4, fill: AXIO.destructive }}
                  activeDot={{ r: 5, fill: AXIO.destructive, stroke: AXIO.destructive }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </AxioCard>
      <AxioCard>
        <AxioSectionTitle hint={t.monthSpendHint}>{t.monthShare}</AxioSectionTitle>
        <DonutChart
          data={monthShare}
          centerLabel={t.netSpend}
          onSelect={(id) => togglePeriod(id as PeriodId)}
        />
      </AxioCard>
    </div>
  )
}
