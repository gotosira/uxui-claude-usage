import { PageHeader } from '../layout/PageHeader'
import { PageGate } from '../layout/PageGate'
import { OverviewHero } from '../dashboard/OverviewHero'
import { PeriodCompareChart } from '../dashboard/PeriodCompareChart'
import { RankingBoards } from '../dashboard/RankingBoards'
import { RequestSpendScatter } from '../dashboard/RequestSpendScatter'
import { CostPerRequestChart } from '../dashboard/CostPerRequestChart'
import { useLanguage } from '../axio/LanguageContext'
import { useFilters } from '../data/FilterContext'
import { rankQueue } from '../data/rankings'
import { useLayout } from '../layout/LayoutContext'

export function OverviewPage() {
  const { t } = useLanguage()
  const { topUsers } = useFilters()
  const { openPerson, personEmail, rankId } = useLayout()
  const queue = rankQueue(topUsers, rankId)

  return (
    <PageGate>
      <PageHeader title={t.overviewTitle} subtitle={t.overviewSubtitle} />
      <OverviewHero />
      <RequestSpendScatter
        users={topUsers}
        selectedId={personEmail}
        onSelect={(id) => openPerson(id, queue)}
      />
      <CostPerRequestChart
        users={topUsers}
        selectedId={personEmail}
        onSelect={(id) => openPerson(id, queue)}
      />
      <PeriodCompareChart />
      <RankingBoards />
    </PageGate>
  )
}
