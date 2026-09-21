import { AxioCard, AxioSectionTitle, useLanguage } from '../axio'
import { formatCompact, tokenSpendByPeriod } from '../data/aggregate'
import { tokenHelpItems } from '../data/tokenHelp'
import { useFilters } from '../data/FilterContext'
import { monthCopy } from './monthCopy'
import { DonutChart, RankBars, StackedBars } from './ChartKit'

export function TokenBreakdown() {
  const { t } = useLanguage()
  const { stats, filteredRows } = useFilters()
  const items = tokenHelpItems(t, stats)
  const tokenSlices = items.filter((item) => item.key !== 'web')
  const stacked = tokenSpendByPeriod(filteredRows).map((row) => ({
    label: monthCopy(row.periodId, t).title,
    [t.promptTokens]: row.prompt,
    [t.cacheRead]: row.cacheRead,
    [t.completionTokens]: row.completion,
    [t.uncached]: row.uncached,
    [t.cacheWrite5m]: row.cache5m,
    [t.cacheWrite1h]: row.cache1h,
  }))

  return (
    <>
      <div className="axio-chart-grid" id="section-tokens">
        <AxioCard>
          <AxioSectionTitle hint={t.helpTokenTitle}>{t.tokenShare}</AxioSectionTitle>
          <DonutChart
            data={tokenSlices.map((item) => ({ id: item.key, name: item.label, value: item.value, color: item.color }))}
            centerLabel={t.tokenTitle}
            formatValue={formatCompact}
          />
        </AxioCard>
        <AxioCard>
          <AxioSectionTitle hint={t.tokenHint}>{t.tokenTitle}</AxioSectionTitle>
          <RankBars
            data={items.map((item) => ({ id: item.key, name: item.label, value: item.value, color: item.color }))}
            formatValue={formatCompact}
          />
        </AxioCard>
      </div>
      <AxioCard>
        <AxioSectionTitle hint={t.helpTokenTitle}>{t.tokenByMonth}</AxioSectionTitle>
        <StackedBars
          rows={stacked}
          keys={[t.promptTokens, t.cacheRead, t.completionTokens, t.uncached, t.cacheWrite5m, t.cacheWrite1h]}
          xKey="label"
          formatValue={formatCompact}
        />
      </AxioCard>
    </>
  )
}
