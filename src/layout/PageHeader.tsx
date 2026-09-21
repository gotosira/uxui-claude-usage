import { interpolate, useLanguage } from '../axio'
import { useFilters } from '../data/FilterContext'

interface PageHeaderProps {
  title: string
  subtitle: string
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const { t } = useLanguage()
  const { filteredRows, allRows, groupName } = useFilters()

  return (
    <div className="axio-page-head">
      <div>
        <h1>{title}</h1>
        <p className="axio-page-lede">{subtitle}</p>
      </div>
      <p className="axio-page-meta">
        <span>{groupName}</span>
        <span>
          {interpolate(t.rowsInView, {
            n: filteredRows.length.toLocaleString(),
            total: allRows.length.toLocaleString(),
          })}
        </span>
      </p>
    </div>
  )
}
