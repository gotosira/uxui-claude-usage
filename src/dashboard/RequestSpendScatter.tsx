import { useState } from 'react'
import { ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts'
import { AXIO, AXIO_CHART, AxioEmpty, AxioHintLabel, useLanguage } from '../axio'
import { costStats, formatCompact, formatUsd, median, percentile } from '../data/aggregate'
import { displayPerson } from '../data/display'
import type { UserRank } from '../data/types'

type ScatterPoint = {
  id: string
  name: string
  requests: number
  spend: number
  cost: number
  hot: boolean
  quadrant: 'hh' | 'lh' | 'hl' | 'll'
}

const NORMAL = AXIO.primary
const HOT = AXIO.destructive

function buildPoints(users: UserRank[]): { points: ScatterPoint[]; medReq: number; medSpend: number } {
  const active = users.filter((user) => user.spend > 0 || user.requests > 0)
  const medReq = median(active.map((user) => user.requests))
  const medSpend = median(active.map((user) => user.spend))
  const costs = active.filter((user) => user.requests > 0).map((user) => user.spend / user.requests)
  const p90 = percentile(costs, 0.9)
  const points = active.map((user) => {
    const cost = user.requests > 0 ? user.spend / user.requests : 0
    const highUse = user.requests >= medReq
    const highSpend = user.spend >= medSpend
    return {
      id: user.email,
      name: displayPerson(user.email),
      requests: user.requests,
      spend: user.spend,
      cost,
      hot: user.requests > 0 && cost > p90,
      quadrant: (highUse && highSpend ? 'hh' : !highUse && highSpend ? 'lh' : highUse ? 'hl' : 'll') as ScatterPoint['quadrant'],
    }
  })
  return { points, medReq, medSpend }
}

function ScatterTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: ScatterPoint }>
}) {
  const { t } = useLanguage()
  if (!active || !payload?.[0]) return null
  const point = payload[0].payload
  return (
    <div className="axio-scatter-tip">
      <strong>{point.name}</strong>
      <span>
        {t.requests}: {formatCompact(point.requests)}
      </span>
      <span>
        {t.netSpend}: {formatUsd(point.spend)}
      </span>
      <span>
        {t.costAvg}: {point.requests ? formatUsd(point.cost) : '—'}
      </span>
    </div>
  )
}

export function RequestSpendScatter({
  users,
  selectedId,
  onSelect,
}: {
  users: UserRank[]
  selectedId?: string | null
  onSelect?: (email: string) => void
}) {
  const { t } = useLanguage()
  const { points, medReq, medSpend } = buildPoints(users)
  const unit = costStats(users)
  const [hovered, setHovered] = useState<ScatterPoint | null>(null)

  if (!points.length) return <AxioEmpty>{t.emptyChart}</AxioEmpty>

  const counts = {
    hh: points.filter((point) => point.quadrant === 'hh').length,
    lh: points.filter((point) => point.quadrant === 'lh').length,
    hl: points.filter((point) => point.quadrant === 'hl').length,
    ll: points.filter((point) => point.quadrant === 'll').length,
  }

  return (
    <article className="axio-scatter-card">
      <header className="axio-scatter-head">
        <h3>{t.scatterTitle}</h3>
        <p>{t.scatterSubtitle}</p>
      </header>
      <div className="axio-scatter-layout">
        <div className="axio-scatter-plot">
          <ResponsiveContainer width="100%" height={360}>
            <ScatterChart margin={{ top: 12, right: 16, bottom: 28, left: 8 }}>
              <XAxis
                type="number"
                dataKey="requests"
                tick={{ fill: AXIO_CHART.muted, fontSize: 11, fontFamily: AXIO.font }}
                axisLine={{ stroke: AXIO_CHART.grid }}
                tickLine={false}
                tickFormatter={(value) => formatCompact(Number(value))}
                label={{
                  value: t.scatterX,
                  position: 'insideBottom',
                  offset: -16,
                  fill: AXIO_CHART.ink,
                  fontFamily: AXIO.font,
                  fontSize: 12,
                }}
              />
              <YAxis
                type="number"
                dataKey="spend"
                tick={{ fill: AXIO_CHART.muted, fontSize: 11, fontFamily: AXIO.font }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatUsd(Number(value))}
                label={{
                  value: t.scatterY,
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  fill: AXIO_CHART.ink,
                  fontFamily: AXIO.font,
                  fontSize: 12,
                }}
              />
              <ReferenceLine x={medReq} stroke={AXIO.border} strokeDasharray="5 5" ifOverflow="extendDomain" />
              <ReferenceLine y={medSpend} stroke={AXIO.border} strokeDasharray="5 5" ifOverflow="extendDomain" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<ScatterTooltip />} />
              <Scatter
                data={points}
                shape={(props) => {
                  const { cx, cy, payload, onMouseEnter, onMouseLeave, onMouseMove } = props as {
                    cx?: number
                    cy?: number
                    payload?: ScatterPoint
                    onMouseEnter?: (event: unknown) => void
                    onMouseLeave?: (event: unknown) => void
                    onMouseMove?: (event: unknown) => void
                  }
                  if (cx == null || cy == null || !payload) return <g />
                  const selected = selectedId === payload.id
                  return (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={selected ? 7 : 5}
                      fill={payload.hot ? HOT : NORMAL}
                      fillOpacity={selectedId && !selected ? 0.28 : 0.92}
                      stroke={selected ? AXIO.foreground : '#fff'}
                      strokeWidth={selected ? 2 : 1}
                      cursor="pointer"
                      onMouseEnter={(event) => {
                        setHovered(payload)
                        onMouseEnter?.(event)
                      }}
                      onMouseMove={onMouseMove}
                      onMouseLeave={(event) => {
                        setHovered(null)
                        onMouseLeave?.(event)
                      }}
                      onClick={() => onSelect?.(payload.id)}
                    />
                  )
                }}
                onClick={(item) => {
                  const id = (item as { payload?: ScatterPoint }).payload?.id
                  if (id) onSelect?.(id)
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <aside className="axio-scatter-side">
          <ul className="axio-scatter-quads">
            <li>
              <strong>{counts.hh}</strong>
              <span>{t.scatterHighHigh}</span>
            </li>
            <li className="is-alert">
              <strong>{counts.lh}</strong>
              <span>{t.scatterLowHigh}</span>
            </li>
            <li>
              <strong>{counts.hl}</strong>
              <span>{t.scatterHighLow}</span>
            </li>
            <li>
              <strong>{counts.ll}</strong>
              <span>{t.scatterLowLow}</span>
            </li>
          </ul>
          <p className="axio-scatter-talk">{t.scatterTalk}</p>
          <ul className="axio-scatter-legend">
            <li>
              <span className="axio-swatch" style={{ background: NORMAL }} />
              {t.scatterNormal}
            </li>
            <li>
              <span className="axio-swatch" style={{ background: HOT }} />
              {t.scatterHot}
            </li>
          </ul>
        </aside>
      </div>
      <dl className="axio-scatter-cost">
        <div>
          <dt>
            <AxioHintLabel title={t.costAvg} body={t.helpUnitCost}>
              {t.costAvg}
            </AxioHintLabel>
          </dt>
          <dd>{formatUsd(unit.average)}</dd>
        </div>
        <div>
          <dt>{t.costMedian}</dt>
          <dd>{formatUsd(unit.median)}</dd>
        </div>
        <div>
          <dt>{t.costP90}</dt>
          <dd>{formatUsd(unit.p90)}</dd>
        </div>
        {hovered ? (
          <div className="is-person">
            <dt>{hovered.name}</dt>
            <dd>{hovered.requests ? formatUsd(hovered.cost) : '—'}</dd>
          </div>
        ) : (
          <div>
            <dt>{t.costPersonHint}</dt>
            <dd>—</dd>
          </div>
        )}
      </dl>
      <details className="axio-scatter-why">
        <summary>{t.scatterWhyTitle}</summary>
        <p>{t.scatterWhyBody}</p>
      </details>
    </article>
  )
}
