import { PERIODS } from '../data/periods'
import { useFilters } from '../data/FilterContext'
import { AxioButton, useLanguage } from '../axio'
import { displayModel } from '../data/display'
import { monthCopy } from '../dashboard/monthCopy'

export function FilterRail() {
  const { t } = useLanguage()
  const {
    filters,
    togglePeriod,
    setAllPeriods,
    setModel,
    setProduct,
    setUserEmail,
    setEmailSearch,
    clearFilters,
  } = useFilters()

  const hasActive =
    filters.model ||
    filters.product ||
    filters.domain ||
    filters.userEmail ||
    filters.emailSearch

  return (
    <div className="axio-filter-rail">
      <div className="axio-period-list">
        {PERIODS.map((p) => {
          const active = filters.periods.has(p.id)
          const copy = monthCopy(p.id, t)
          return (
            <button
              key={p.id}
              type="button"
              className={`axio-period-chip${active ? ' is-active' : ''}`}
              onClick={() => togglePeriod(p.id)}
              title={copy.range}
            >
              <span className="swatch" style={{ background: p.color }} />
              {copy.title}
            </button>
          )
        })}
        <button
          type="button"
          className={`axio-period-chip axio-period-all${filters.periods.size === PERIODS.length ? ' is-active' : ''}`}
          onClick={() => setAllPeriods(true)}
        >
          {t.allMonths}
        </button>
      </div>
      {hasActive && (
        <div className="axio-tags">
          {filters.product && (
            <button type="button" className="axio-tag" onClick={() => setProduct(null)}>
              {t.product}: {filters.product} ×
            </button>
          )}
          {filters.model && (
            <button type="button" className="axio-tag" onClick={() => setModel(null)}>
              {t.model}: {displayModel(filters.model)} ×
            </button>
          )}
          {filters.userEmail && (
            <button type="button" className="axio-tag" onClick={() => setUserEmail(null)}>
              {t.email}: {filters.userEmail} ×
            </button>
          )}
          {filters.emailSearch && (
            <button type="button" className="axio-tag" onClick={() => setEmailSearch('')}>
              {t.emailSearch}: {filters.emailSearch} ×
            </button>
          )}
          <AxioButton onClick={clearFilters}>{t.clearFilters}</AxioButton>
        </div>
      )}
    </div>
  )
}
