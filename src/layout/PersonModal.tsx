import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  AXIO,
  AXIO_CHART,
  AXIO_SERIES,
  AxioBadge,
  AxioChip,
  AxioEmpty,
  AxioHint,
  AxioStat,
  interpolate,
  SortTh,
  TableShell,
  useLanguage,
  useSort,
} from '../axio'
import {
  formatCompact,
  formatPct,
  formatSignedUsd,
  formatUsd,
  maskEmail,
} from '../data/aggregate'
import { displayModel } from '../data/display'
import { useFilters } from '../data/FilterContext'
import { monthCopy } from '../dashboard/monthCopy'
import { DonutChart, RankBars } from '../dashboard/ChartKit'
import { PERIOD_MAP } from '../data/periods'
import { buildPersonProfile, slicePersonRows, type PersonProfile } from '../data/rankings'
import type { EnrichedRow, PeriodId } from '../data/types'
import { useLayout } from './LayoutContext'
import { tokenHelpItems } from '../data/tokenHelp'

type PersonTab = 'summary' | 'months' | 'mix' | 'tokens' | 'rows'

export function PersonModal() {
  const { t } = useLanguage()
  const { personEmail, personQueue, closePerson, stepPerson } = useLayout()
  const { scopedRows, topUsers, maskEmails, stats } = useFilters()
  const [tab, setTab] = useState<PersonTab>('summary')
  const [period, setPeriod] = useState<PeriodId | null>(null)
  const [product, setProduct] = useState<string | null>(null)
  const [model, setModel] = useState<string | null>(null)
  const [row, setRow] = useState<EnrichedRow | null>(null)

  useEffect(() => {
    setTab('summary')
    setPeriod(null)
    setProduct(null)
    setModel(null)
    setRow(null)
  }, [personEmail])

  useEffect(() => {
    if (!personEmail) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (row) setRow(null)
        else closePerson()
      } else if (event.key === 'ArrowLeft') {
        stepPerson(-1)
      } else if (event.key === 'ArrowRight') {
        stepPerson(1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [closePerson, personEmail, row, stepPerson])

  const allPersonRows = useMemo(
    () => (personEmail ? scopedRows.filter((item) => item.user_email === personEmail) : []),
    [personEmail, scopedRows],
  )
  const sliced = useMemo(
    () => slicePersonRows(allPersonRows, { period, product, model }),
    [allPersonRows, model, period, product],
  )
  const identity = useMemo(() => {
    if (!personEmail) return null
    return buildPersonProfile(personEmail, topUsers, allPersonRows, scopedRows)
  }, [allPersonRows, personEmail, scopedRows, topUsers])
  const profile = useMemo(() => {
    if (!personEmail) return null
    return buildPersonProfile(personEmail, topUsers, sliced, scopedRows)
  }, [personEmail, scopedRows, sliced, topUsers])

  if (!personEmail || !profile || !identity) return null

  const queueIndex = personQueue.indexOf(personEmail)
  const hasPrev = queueIndex > 0
  const hasNext = queueIndex >= 0 && queueIndex < personQueue.length - 1
  const tabs: { id: PersonTab; label: string }[] = [
    { id: 'summary', label: t.personTabSummary },
    { id: 'months', label: t.personTabMonths },
    { id: 'mix', label: t.personTabMix },
    { id: 'tokens', label: t.personTabTokens },
    { id: 'rows', label: t.personTabRows },
  ]

  const monthChart = profile.months.map((item) => ({
    name: monthCopy(item.periodId, t).title,
    periodId: item.periodId,
    net: item.spend,
    fill: item.color,
  }))
  const productChart = profile.products.map((item) => ({ ...item, name: item.product }))
  const modelChart = profile.models.map((item) => ({ ...item, name: displayModel(item.model) }))
  const personCost = identity.rank.spendPerRequest
  const teamCost = stats.requests ? stats.netSpend / stats.requests : 0

  return (
    <div className="axio-drill-root">
      <button type="button" className="axio-search-scrim" aria-label={t.personClose} onClick={closePerson} />
      <div className="axio-person-modal" role="dialog" aria-modal="true" aria-labelledby="axio-person-title">
        <header className="axio-person-head">
          <div className="axio-person-nav">
            <button type="button" className="axio-icon-btn" disabled={!hasPrev} onClick={() => stepPerson(-1)} aria-label={t.personPrev}>
              <ChevronLeft size={20} />
            </button>
            <button type="button" className="axio-icon-btn" disabled={!hasNext} onClick={() => stepPerson(1)} aria-label={t.personNext}>
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="axio-person-titleblock">
            <h2 id="axio-person-title">{identity.name}</h2>
            <p>{maskEmail(identity.email, maskEmails)}</p>
          </div>
          <button type="button" className="axio-icon-btn" onClick={closePerson} aria-label={t.personClose}>
            <X size={20} />
          </button>
        </header>

        <div className="axio-person-tabs">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`axio-person-tab${tab === item.id ? ' is-active' : ''}`}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="axio-person-body">
          <PersonSliceBar
            identity={identity}
            period={period}
            product={product}
            model={model}
            onPeriod={(id) => setPeriod(period === id ? null : id)}
            onProduct={(name) => setProduct(product === name ? null : name)}
            onModel={(id) => setModel(model === id ? null : id)}
            onReset={() => {
              setPeriod(null)
              setProduct(null)
              setModel(null)
            }}
          />

          {tab === 'summary' && (
            <>
              <div className="axio-person-meta">
                <AxioBadge tone="info">
                  {t.personRankSpend} {identity.spendRank || '—'} {interpolate(t.ofGroup, { n: topUsers.filter((u) => u.spend > 0).length })}
                </AxioBadge>
                <AxioBadge tone="info">
                  {t.personRankReq} {identity.requestRank || '—'}
                </AxioBadge>
                <AxioBadge tone="info">
                  {t.personRankToken} {identity.tokenRank || '—'}
                </AxioBadge>
                <AxioBadge tone="success">{t.personShare} {formatPct(identity.shareOfSpend)}</AxioBadge>
              </div>
              <dl className="axio-person-ids">
                <div>
                  <dt>{t.personUserId}</dt>
                  <dd>{identity.rank.userId || t.emptyValue}</dd>
                </div>
                <div>
                  <dt>{t.personAccount}</dt>
                  <dd>{identity.rank.accountUuid || t.emptyValue}</dd>
                </div>
                <div>
                  <dt>{t.domain}</dt>
                  <dd>{identity.email.split('@')[1] ?? t.emptyValue}</dd>
                </div>
              </dl>
              <div className="axio-kpi-grid">
                <AxioStat label={t.netSpend} hint={t.helpNetSpend} column={t.colNet} value={formatUsd(profile.stats.netSpend)} />
                <AxioStat label={t.requests} hint={t.helpRequests} column={t.colReq} value={formatCompact(profile.stats.requests)} />
                <AxioStat
                  label={t.costAvg}
                  hint={t.helpUnitCost}
                  value={profile.stats.requests ? formatUsd(profile.stats.netSpend / profile.stats.requests) : '—'}
                />
                <AxioStat label={t.personGrowth} hint={t.helpGrowth} value={formatSignedUsd(identity.rank.julToAug)} />
                <AxioStat label={t.topProduct} hint={t.helpTopProduct} column={t.product} value={identity.rank.topProduct} />
                <AxioStat label={t.topModel} hint={t.helpTopModel} column={t.model} value={displayModel(identity.rank.topModel)} />
              </div>
              {personCost > 0 && teamCost > 0 && personCost > teamCost ? (
                <p className="axio-cost-note">
                  {interpolate(t.costPersonHigh, {
                    avg: formatUsd(teamCost),
                    model: displayModel(identity.rank.topModel),
                    product: identity.rank.topProduct,
                  })}
                </p>
              ) : null}
              <div className="axio-person-months">
                {(['jul', 'aug', 'sep'] as PeriodId[]).map((id) => {
                  const present = identity.present.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`axio-person-month${present ? ' is-on' : ''}${period === id ? ' is-active' : ''}`}
                      onClick={() => setPeriod(period === id ? null : id)}
                    >
                      <span className="axio-swatch" style={{ background: PERIOD_MAP[id].color }} />
                      <strong>{monthCopy(id, t).title}</strong>
                      <small>{present ? formatUsd(identity.rank.spendByPeriod[id]) : t.personAbsent}</small>
                    </button>
                  )
                })}
              </div>
              {identity.products.length > 0 ? (
                <DonutChart
                  data={identity.products.map((item) => ({
                    id: item.product,
                    name: item.product,
                    value: item.spend,
                  }))}
                  centerLabel={t.spendByProduct}
                  selectedId={product}
                  onSelect={(id) => setProduct(product === id ? null : id)}
                />
              ) : null}
            </>
          )}

          {tab === 'months' && (
            sliced.length === 0 ? (
              <AxioEmpty>{t.personNoRows}</AxioEmpty>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={monthChart}>
                    <XAxis dataKey="name" tick={{ fill: AXIO_CHART.ink, fontSize: 12, fontFamily: AXIO.font }} tickLine={false} axisLine={{ stroke: AXIO_CHART.grid }} />
                    <YAxis tick={{ fill: AXIO_CHART.muted, fontSize: 12, fontFamily: AXIO.font }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={AXIO_CHART.tooltip} formatter={(v) => formatUsd(Number(v))} />
                    <Bar dataKey="net" name={t.compareNet} radius={[4, 4, 0, 0]} onClick={(item) => {
                      const id = (item as { payload?: { periodId?: PeriodId } }).payload?.periodId
                      if (id) setPeriod(period === id ? null : id)
                    }}>
                      {monthChart.map((entry) => (
                        <Cell key={entry.periodId} fill={entry.fill} opacity={!period || period === entry.periodId ? 1 : 0.25} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="axio-compare-stats">
                  {profile.months.map((item) => (
                    <button
                      key={item.periodId}
                      type="button"
                      className="axio-compare-stat"
                      onClick={() => setPeriod(period === item.periodId ? null : item.periodId)}
                    >
                      <span className="axio-stat-label">{monthCopy(item.periodId, t).title}</span>
                      <strong>{formatUsd(item.spend)}</strong>
                      <small>
                        {formatCompact(item.requests)} · {item.rows} {t.csvRows.toLowerCase()}
                      </small>
                    </button>
                  ))}
                </div>
              </>
            )
          )}

          {tab === 'mix' && (
            sliced.length === 0 ? (
              <AxioEmpty>{t.personNoRows}</AxioEmpty>
            ) : (
              <div className="axio-chart-grid">
                <div>
                  <h3>{t.spendByProduct}</h3>
                  <ResponsiveContainer width="100%" height={Math.max(180, productChart.length * 42)}>
                    <BarChart data={productChart} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fill: AXIO_CHART.ink, fontSize: 12, fontFamily: AXIO.font }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={AXIO_CHART.tooltip} formatter={(v) => formatUsd(Number(v))} />
                      <Bar dataKey="spend" radius={[0, 4, 4, 0]} onClick={(item) => {
                        const name = (item as { payload?: { product?: string } }).payload?.product
                        if (name) setProduct(product === name ? null : name)
                      }}>
                        {productChart.map((entry, i) => (
                          <Cell key={entry.product} fill={AXIO_SERIES[i % AXIO_SERIES.length]} opacity={!product || product === entry.product ? 1 : 0.25} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <h3>{t.spendByModel}</h3>
                  <ResponsiveContainer width="100%" height={Math.max(180, modelChart.length * 42)}>
                    <BarChart data={modelChart} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fill: AXIO_CHART.ink, fontSize: 12, fontFamily: AXIO.font }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={AXIO_CHART.tooltip} formatter={(v) => formatUsd(Number(v))} />
                      <Bar dataKey="spend" radius={[0, 4, 4, 0]} onClick={(item) => {
                        const id = (item as { payload?: { model?: string } }).payload?.model
                        if (id) setModel(model === id ? null : id)
                      }}>
                        {modelChart.map((entry, i) => (
                          <Cell key={entry.model} fill={AXIO_SERIES[i % AXIO_SERIES.length]} opacity={!model || model === entry.model ? 1 : 0.25} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )
          )}

          {tab === 'tokens' && (
            sliced.length === 0 ? (
              <AxioEmpty>{t.personNoRows}</AxioEmpty>
            ) : (
              <>
                <DonutChart
                  data={tokenHelpItems(t, profile.stats)
                    .filter((item) => item.key !== 'web')
                    .map((item) => ({ id: item.key, name: item.label, value: item.value, color: item.color }))}
                  centerLabel={t.tokenShare}
                  formatValue={formatCompact}
                />
                <RankBars
                  data={tokenHelpItems(t, profile.stats).map((item) => ({
                    id: item.key,
                    name: item.label,
                    value: item.value,
                    color: item.color,
                  }))}
                  formatValue={formatCompact}
                />
              </>
            )
          )}

          {tab === 'rows' && (
            sliced.length === 0 ? (
              <AxioEmpty>{t.personNoRows}</AxioEmpty>
            ) : (
              <>
                <RankBars
                  data={profile.rows.map((item, i) => ({
                    id: String(i),
                    name: `${item.product} · ${displayModel(item.model)}`,
                    value: item.total_net_spend_usd,
                  }))}
                  onSelect={(id) => setRow(profile.rows[Number(id)] ?? null)}
                />
                <PersonRowsTable rows={profile.rows} onOpen={setRow} />
              </>
            )
          )}
        </div>
      </div>

      {row && <RowDetail row={row} onClose={() => setRow(null)} />}
    </div>
  )
}

type PersonRowCol = 'month' | 'product' | 'model' | 'spend' | 'req' | 'prompt' | 'cache' | 'web'

const PERIOD_ORDER: Record<PeriodId, number> = { jul: 0, aug: 1, sep: 2 }

function personRowValue(row: EnrichedRow, key: PersonRowCol): string | number {
  if (key === 'month') return PERIOD_ORDER[row.periodId]
  if (key === 'product') return row.product
  if (key === 'model') return displayModel(row.model)
  if (key === 'spend') return row.total_net_spend_usd
  if (key === 'req') return row.total_requests
  if (key === 'prompt') return row.total_prompt_tokens
  if (key === 'cache') return row.total_cache_read_tokens
  return row.total_web_search_count
}

function PersonSliceBar({
  identity,
  period,
  product,
  model,
  onPeriod,
  onProduct,
  onModel,
  onReset,
}: {
  identity: PersonProfile
  period: PeriodId | null
  product: string | null
  model: string | null
  onPeriod: (id: PeriodId) => void
  onProduct: (name: string) => void
  onModel: (id: string) => void
  onReset: () => void
}) {
  const { t } = useLanguage()
  const sliced = Boolean(period || product || model)

  return (
    <div className="axio-slice-bar">
      <div className="axio-slice-head">
        <AxioHint title={t.helpSlice} body={t.personFilterHint} />
        <AxioChip active={!sliced} onClick={onReset}>
          {t.personAllSlices}
        </AxioChip>
        {sliced ? (
          <button type="button" className="axio-slice-clear" onClick={onReset}>
            {t.clearFilters}
          </button>
        ) : null}
      </div>
      <div className="axio-slice-group">
        <span className="axio-slice-label">{t.month}</span>
        <div className="axio-slice-chips">
          {identity.rank.periods.map((id) => (
            <AxioChip key={id} active={period === id} onClick={() => onPeriod(id)}>
              {monthCopy(id, t).title}
            </AxioChip>
          ))}
        </div>
      </div>
      <div className="axio-slice-group">
        <span className="axio-slice-label">{t.product}</span>
        <div className="axio-slice-chips">
          {identity.products.map((item) => (
            <AxioChip key={item.product} active={product === item.product} onClick={() => onProduct(item.product)}>
              {item.product}
            </AxioChip>
          ))}
        </div>
      </div>
      <div className="axio-slice-group">
        <span className="axio-slice-label">{t.model}</span>
        <div className="axio-slice-chips">
          {identity.models.map((item) => (
            <AxioChip key={item.model} active={model === item.model} onClick={() => onModel(item.model)}>
              {displayModel(item.model)}
            </AxioChip>
          ))}
        </div>
      </div>
    </div>
  )
}

function PersonRowsTable({
  rows,
  onOpen,
}: {
  rows: EnrichedRow[]
  onOpen: (row: EnrichedRow) => void
}) {
  const { t } = useLanguage()
  const { sorted, sort, toggle } = useSort(rows, personRowValue, { key: 'spend', dir: 'desc' })
  const labels: Record<PersonRowCol, string> = {
    month: t.month,
    product: t.product,
    model: t.model,
    spend: t.spend,
    req: t.req,
    prompt: t.promptTokens,
    cache: t.cacheRead,
    web: t.webSearch,
  }

  return (
    <TableShell count={sorted.length} sortLabel={labels[sort.key]} dir={sort.dir}>
      <table className="axio-table axio-table--wide">
        <thead>
          <tr>
            <SortTh label={t.month} column="month" sort={sort} onSort={toggle} />
            <SortTh label={t.product} column="product" sort={sort} onSort={toggle} />
            <SortTh label={t.model} column="model" sort={sort} onSort={toggle} />
            <SortTh label={t.spend} column="spend" sort={sort} onSort={toggle} numeric />
            <SortTh label={t.req} column="req" sort={sort} onSort={toggle} numeric />
            <SortTh label={t.promptTokens} column="prompt" sort={sort} onSort={toggle} numeric />
            <SortTh label={t.cacheRead} column="cache" sort={sort} onSort={toggle} numeric />
            <SortTh label={t.webSearch} column="web" sort={sort} onSort={toggle} numeric />
          </tr>
        </thead>
        <tbody>
          {sorted.map((item, i) => (
            <tr
              key={`${item.product}-${item.model}-${item.periodId}-${i}`}
              onClick={() => onOpen(item)}
            >
              <td>{monthCopy(item.periodId, t).title}</td>
              <td>{item.product}</td>
              <td title={item.model}>{displayModel(item.model)}</td>
              <td className="is-num">{formatUsd(item.total_net_spend_usd)}</td>
              <td className="is-num">{formatCompact(item.total_requests)}</td>
              <td className="is-num">{formatCompact(item.total_prompt_tokens)}</td>
              <td className="is-num">{formatCompact(item.total_cache_read_tokens)}</td>
              <td className="is-num">{item.total_web_search_count.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableShell>
  )
}

function RowDetail({ row, onClose }: { row: EnrichedRow; onClose: () => void }) {
  const { t } = useLanguage()
  const { maskEmails } = useFilters()
  const fields: { label: string; value: string }[] = [
    { label: t.email, value: maskEmail(row.user_email, maskEmails) },
    { label: t.colUserId, value: row.user_id || t.emptyValue },
    { label: t.colAccount, value: row.account_uuid || t.emptyValue },
    { label: t.colPeriod, value: `${monthCopy(row.periodId, t).title} · ${row.periodLabel}` },
    { label: t.product, value: row.product },
    { label: t.model, value: `${displayModel(row.model)} · ${row.model}` },
    { label: t.colNet, value: formatUsd(row.total_net_spend_usd) },
    { label: t.colReq, value: row.total_requests.toLocaleString() },
    { label: t.colPrompt, value: row.total_prompt_tokens.toLocaleString() },
    { label: t.colCompletion, value: row.total_completion_tokens.toLocaleString() },
    { label: t.colCacheRead, value: row.total_cache_read_tokens.toLocaleString() },
    { label: t.colUncached, value: row.total_uncached_input_tokens.toLocaleString() },
    { label: t.colCache5m, value: row.total_cache_write_5m_tokens.toLocaleString() },
    { label: t.colCache1h, value: row.total_cache_write_1h_tokens.toLocaleString() },
    { label: t.colWeb, value: row.total_web_search_count.toLocaleString() },
    { label: t.colSlack, value: row.slack_channel_id || t.emptyValue },
    { label: t.colTeams, value: row.teams_channel_id || t.emptyValue },
    { label: t.domain, value: row.domain },
  ]

  return (
    <div className="axio-row-root">
      <button type="button" className="axio-search-scrim" aria-label={t.personClose} onClick={onClose} />
      <div className="axio-row-modal" role="dialog" aria-modal="true" aria-labelledby="axio-row-title">
        <header className="axio-person-head">
          <div className="axio-person-titleblock">
            <h2 id="axio-row-title">{t.personRowDetail}</h2>
            <p>
              {row.product} · {displayModel(row.model)} · {monthCopy(row.periodId, t).title}
            </p>
          </div>
          <button type="button" className="axio-icon-btn" onClick={onClose} aria-label={t.personClose}>
            <X size={20} />
          </button>
        </header>
        <dl className="axio-row-fields">
          {fields.map((field) => (
            <div key={field.label}>
              <dt>{field.label}</dt>
              <dd>{field.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
