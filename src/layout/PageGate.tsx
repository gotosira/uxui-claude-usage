import type { ReactNode } from 'react'
import { useLanguage } from '../axio/LanguageContext'
import { useFilters } from '../data/FilterContext'

export function PageGate({ children }: { children: ReactNode }) {
  const { t } = useLanguage()
  const { loading, allRows } = useFilters()

  if (loading) {
    return (
      <div className="axio-main">
        <div className="axio-kpi-grid">
          <div className="axio-skeleton axio-skeleton-kpi" />
          <div className="axio-skeleton axio-skeleton-kpi" />
          <div className="axio-skeleton axio-skeleton-kpi" />
          <div className="axio-skeleton axio-skeleton-kpi" />
        </div>
        <div className="axio-skeleton axio-skeleton-chart" />
      </div>
    )
  }

  if (!allRows.length) {
    return (
      <div className="axio-main">
        <div className="axio-card">
          <p className="axio-empty">{t.noData}</p>
        </div>
      </div>
    )
  }

  return <div className="axio-main">{children}</div>
}
