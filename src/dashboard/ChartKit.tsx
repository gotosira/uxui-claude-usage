import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AXIO, AXIO_CHART, AXIO_SERIES, AxioEmpty, useLanguage } from '../axio'
import { formatPct, formatUsd } from '../data/aggregate'
import { clickPayload } from './chartUtils'

export type SliceDatum = {
  id: string
  name: string
  value: number
  color?: string
}

const tooltipStyle = AXIO_CHART.tooltip

function colorAt(index: number, explicit?: string) {
  return explicit ?? AXIO_SERIES[index % AXIO_SERIES.length]
}

export function DonutChart({
  data,
  center,
  centerLabel,
  selectedId,
  onSelect,
  formatValue = formatUsd,
  height = 260,
}: {
  data: SliceDatum[]
  center?: string
  centerLabel?: string
  selectedId?: string | null
  onSelect?: (id: string) => void
  formatValue?: (value: number) => string
  height?: number
}) {
  const { t } = useLanguage()
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const slices = data.map((item, i) => ({ ...item, color: colorAt(i, item.color) }))

  if (!slices.length || total <= 0) return <AxioEmpty>{t.emptyChart}</AxioEmpty>

  return (
    <div className="axio-donut">
      <div className="axio-donut-plot">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={64}
              outerRadius={96}
              paddingAngle={slices.length > 1 ? 2 : 0}
              stroke="#fff"
              strokeWidth={2}
              onClick={(entry) => {
                const id = (entry as { payload?: SliceDatum }).payload?.id
                if (id && id !== '__others__') onSelect?.(id)
              }}
            >
              {slices.map((slice) => (
                <Cell
                  key={slice.id}
                  fill={slice.color}
                  opacity={selectedId && selectedId !== slice.id ? 0.28 : 1}
                  cursor={slice.id === '__others__' ? 'default' : 'pointer'}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, name) => [formatValue(Number(value)), String(name)]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="axio-donut-center">
          <strong>{center ?? formatValue(total)}</strong>
          {centerLabel ? <small>{centerLabel}</small> : null}
        </div>
      </div>
      <ul className="axio-legend-rows">
        {slices.map((slice) => (
          <li key={slice.id}>
            <button
              type="button"
              className={selectedId === slice.id ? 'is-active' : ''}
              disabled={slice.id === '__others__' || !onSelect}
              onClick={() => onSelect?.(slice.id)}
            >
              <span className="axio-swatch" style={{ background: slice.color }} />
              <span className="axio-legend-copy">
                <strong>{slice.name}</strong>
                <small>{formatPct(slice.value / total)}</small>
              </span>
              <span className="axio-legend-value">{formatValue(slice.value)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function RankBars({
  data,
  selectedId,
  onSelect,
  formatValue = formatUsd,
  height,
  yAxisWidth = 120,
}: {
  data: SliceDatum[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  formatValue?: (value: number) => string
  height?: number
  yAxisWidth?: number
}) {
  const { t } = useLanguage()
  if (!data.length) return <AxioEmpty>{t.emptyChart}</AxioEmpty>

  const allZero = data.every((item) => item.value === 0)
  const rows = data.map((item, i) => ({
    ...item,
    color: colorAt(i, item.color),
    bar: allZero ? 1 : item.value,
    label: item.name.length > 22 ? `${item.name.slice(0, 20)}…` : item.name,
  }))
  const plotHeight = height ?? Math.max(180, rows.length * 36)

  return (
    <div className="axio-chart-host">
      <ResponsiveContainer width="100%" height={plotHeight}>
        <BarChart data={rows} layout="vertical" margin={{ left: 4, right: 16, top: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={AXIO_CHART.grid} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: AXIO_CHART.muted, fontSize: 11, fontFamily: AXIO.font }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => formatValue(Number(value))}
            hide={allZero}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={yAxisWidth}
            tick={{ fill: AXIO_CHART.ink, fontSize: 12, fontFamily: AXIO.font }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, _name, item) => {
              const payload = (item as { payload?: SliceDatum }).payload
              return [formatValue(payload?.value ?? Number(value)), payload?.name ?? '']
            }}
            labelFormatter={() => ''}
          />
          <Bar
            dataKey="bar"
            radius={[0, 4, 4, 0]}
            onClick={(item, index) => {
              const row = clickPayload(item, index, rows)
              if (row?.id && row.id !== '__others__') onSelect?.(row.id)
            }}
          >
            {rows.map((row) => (
              <Cell
                key={row.id}
                fill={row.value < 0 ? AXIO.destructive : row.color}
                opacity={selectedId && selectedId !== row.id ? 0.28 : 1}
                cursor="pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function StackedBars({
  rows,
  keys,
  xKey,
  formatValue = formatUsd,
}: {
  rows: Array<Record<string, string | number>>
  keys: string[]
  xKey: string
  formatValue?: (value: number) => string
}) {
  const { t } = useLanguage()
  if (!rows.length || !keys.length) return <AxioEmpty>{t.emptyChart}</AxioEmpty>

  return (
    <div className="axio-chart-host">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={rows} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={AXIO_CHART.grid} vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fill: AXIO_CHART.ink, fontSize: 12, fontFamily: AXIO.font }}
            axisLine={{ stroke: AXIO_CHART.grid }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: AXIO_CHART.muted, fontSize: 11, fontFamily: AXIO.font }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => formatValue(Number(value))}
          />
          <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [formatValue(Number(value)), String(name)]} />
          <Legend wrapperStyle={{ fontFamily: AXIO.font, fontSize: 12 }} />
          {keys.map((key, i) => (
            <Bar key={key} dataKey={key} stackId="stack" fill={colorAt(i)} radius={i === keys.length - 1 ? [4, 4, 0, 0] : 0} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
