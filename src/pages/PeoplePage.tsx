import { PageHeader } from '../layout/PageHeader'
import { PageGate } from '../layout/PageGate'
import { PeopleCharts } from '../dashboard/PeopleCharts'
import { AxioField, useLanguage } from '../axio'
import { useFilters } from '../data/FilterContext'

export function PeoplePage() {
  const { t } = useLanguage()
  const { filters, setEmailSearch } = useFilters()

  return (
    <PageGate>
      <PageHeader title={t.peopleTitle} subtitle={t.peopleSubtitle} />
      <div className="axio-card">
        <AxioField label={t.emailSearch}>
          <input
            type="search"
            placeholder="name@axonstech.com"
            value={filters.emailSearch}
            onChange={(e) => setEmailSearch(e.target.value)}
          />
        </AxioField>
      </div>
      <PeopleCharts />
    </PageGate>
  )
}
