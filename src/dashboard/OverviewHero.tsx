import { AxioCard, AxioHintLabel, interpolate, useLanguage } from '../axio'
import { formatPct, formatSignedPct, formatSignedUsd, formatUsd } from '../data/aggregate'
import { displayPerson } from '../data/display'
import { useFilters } from '../data/FilterContext'
import { biggestMover, idleCount, pairedDelta, topProductShare } from '../data/insights'
import { useLayout } from '../layout/LayoutContext'
import { AnimatedNumber } from './AnimatedNumber'
import { Sparkline } from './Sparkline'

export function OverviewHero() {
  const { t } = useLanguage()
  const { stats, periodCompare, topUsers, byProduct, groupSize, groupPresent, groupMissing } = useFilters()
  const { openPerson, openEntity } = useLayout()

  const spendDelta = pairedDelta(periodCompare, 'spend')
  const requestDelta = pairedDelta(periodCompare, 'requests')
  const mover = biggestMover(topUsers)
  const share = topProductShare(byProduct, stats.netSpend)
  const idle = idleCount(topUsers)
  const days = Math.max(periodCompare.reduce((sum, period) => sum + period.days, 0), 1)
  const perDay = stats.netSpend / days
  const deltaTone =
    spendDelta?.ratio == null || spendDelta.ratio === 0 ? 'flat' : spendDelta.ratio > 0 ? 'up' : 'down'

  return (
    <AxioCard className="axio-hero">
      <div className="axio-hero-top">
        <div className="axio-hero-primary">
          <p className="axio-hero-label">
            <AxioHintLabel title={t.netSpend} body={t.helpNetSpend} column={t.colNet}>
              {t.netSpend}
            </AxioHintLabel>
          </p>
          <p className="axio-hero-value">
            <AnimatedNumber value={stats.netSpend} format="usd" />
          </p>
          <p className={`axio-hero-delta is-${deltaTone}`}>
            {spendDelta?.ratio == null ? t.emptyChart : interpolate(t.vsPrevious, { pct: formatSignedPct(spendDelta.ratio) })}
            {spendDelta ? ` · ${formatUsd(spendDelta.previous.spend)} → ${formatUsd(spendDelta.current.spend)}` : ''}
          </p>
        </div>
        <Sparkline className="axio-hero-spark" values={periodCompare.map((item) => item.spend)} />
      </div>

      <dl className="axio-hero-support">
        <div>
          <dt>
            <AxioHintLabel title={t.costAvg} body={t.helpUnitCost}>
              {t.costAvg}
            </AxioHintLabel>
          </dt>
          <dd>
            {stats.requests ? (
              <AnimatedNumber value={stats.netSpend / stats.requests} format="usd" />
            ) : (
              '—'
            )}
          </dd>
        </div>
        <div>
          <dt>
            <AxioHintLabel title={t.requests} body={t.helpRequests} column={t.colReq}>
              {t.requests}
            </AxioHintLabel>
          </dt>
          <dd>
            <AnimatedNumber value={stats.requests} format="compact" />
            {requestDelta?.ratio != null ? (
              <small className={requestDelta.ratio >= 0 ? 'is-up' : 'is-down'}>{formatSignedPct(requestDelta.ratio)}</small>
            ) : null}
          </dd>
        </div>
        <div>
          <dt>
            <AxioHintLabel title={t.rosterTitle} body={t.helpRoster}>
              {t.rosterTitle}
            </AxioHintLabel>
          </dt>
          <dd>
            {groupPresent}
            <span className="axio-hero-support-suffix"> / {groupSize}</span>
          </dd>
          <p>{interpolate(t.rosterUsed, { n: groupPresent, total: groupSize })}{groupMissing.length ? ` · ${interpolate(t.groupMissing, { n: groupMissing.length })}` : ''}</p>
        </div>
        <div>
          <dt>
            <AxioHintLabel title={t.dailyAvg} body={t.helpDailyAvg}>
              {t.dailyAvg}
            </AxioHintLabel>
          </dt>
          <dd>{formatUsd(perDay)}</dd>
        </div>
      </dl>

      <div className="axio-hero-signals">
        <p className="axio-hero-label">
          <AxioHintLabel title={t.briefTitle} body={t.briefHint}>
            {t.briefTitle}
          </AxioHintLabel>
        </p>
        <div className="axio-signal-row">
          <button type="button" className="axio-signal" disabled={!mover} onClick={() => mover && openPerson(mover.email)}>
            <small>{t.briefMover}</small>
            <strong>{mover ? formatSignedUsd(mover.julToAug) : '—'}</strong>
            <span>{mover ? displayPerson(mover.email) : t.noSpend}</span>
          </button>
          <button
            type="button"
            className="axio-signal"
            disabled={!share}
            onClick={() => share && openEntity('product', share.product)}
          >
            <small>{t.insightOpen}</small>
            <strong>{share ? formatPct(share.share) : '—'}</strong>
            <span>{share ? share.product : t.emptyChart}</span>
          </button>
          <div className="axio-signal">
            <small>{t.rankIdle}</small>
            <strong>{idle}</strong>
            <span>{t.rankIdleHint}</span>
          </div>
        </div>
      </div>
    </AxioCard>
  )
}
