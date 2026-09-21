import { PageHeader } from '../layout/PageHeader'
import { PageGate } from '../layout/PageGate'
import { PeriodCompareChart } from '../dashboard/PeriodCompareChart'
import { TokenBreakdown } from '../dashboard/TokenBreakdown'
import { SpendRowsChart } from '../dashboard/SpendRowsChart'
import { useLanguage } from '../axio/LanguageContext'

export function MonthsPage() {
  const { t } = useLanguage()

  return (
    <PageGate>
      <PageHeader title={t.monthsTitle} subtitle={t.monthsSubtitle} />
      <PeriodCompareChart />
      <TokenBreakdown />
      <SpendRowsChart />
    </PageGate>
  )
}
