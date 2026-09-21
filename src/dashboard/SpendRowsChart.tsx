import { AxioCard, AxioSectionTitle, interpolate, useLanguage } from '../axio'
import { displayModel, displayPerson } from '../data/display'
import { useFilters } from '../data/FilterContext'
import { useLayout } from '../layout/LayoutContext'
import { rankQueue } from '../data/rankings'
import { RankBars } from './ChartKit'

export function SpendRowsChart() {
  const { t } = useLanguage()
  const { topRows, topUsers } = useFilters()
  const { openPerson, personEmail, rankId } = useLayout()
  const queue = rankQueue(topUsers, rankId)

  return (
    <AxioCard id="section-rows">
      <AxioSectionTitle hint={t.clickChart}>{t.topCsvRows}</AxioSectionTitle>
      <RankBars
        data={topRows.map((row, i) => ({
          id: `${row.user_email}::${i}`,
          name: interpolate(t.rowLabel, {
            person: displayPerson(row.user_email),
            product: row.product,
            model: displayModel(row.model),
          }),
          value: row.total_net_spend_usd,
        }))}
        yAxisWidth={168}
        selectedId={personEmail}
        onSelect={(id) => openPerson(id.split('::')[0], queue)}
      />
    </AxioCard>
  )
}
