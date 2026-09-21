import { AxioCard, AxioChip, AxioField, AxioHintLabel, AxioSectionTitle, useLanguage } from '../axio'
import { composeShare, productSpendByPeriod } from '../data/aggregate'
import { displayModel } from '../data/display'
import { useFilters } from '../data/FilterContext'
import { useLayout } from '../layout/LayoutContext'
import { monthCopy } from './monthCopy'
import { DonutChart, RankBars, StackedBars } from './ChartKit'

export function ProductCharts() {
  const { t } = useLanguage()
  const { byProduct, byModel, filteredRows, filters } = useFilters()
  const { openEntity } = useLayout()
  const productShare = composeShare(byProduct, (item) => item.product, (item) => item.product, (item) => item.spend, 6, t.others)
  const modelShare = composeShare(
    byModel,
    (item) => item.model,
    (item) => displayModel(item.model),
    (item) => item.spend,
    6,
    t.others,
  )
  const stacked = productSpendByPeriod(filteredRows).map((row) => ({
    ...row,
    label: monthCopy(row.periodId, t).title,
  }))
  const productKeys = byProduct.map((item) => item.product)

  return (
    <>
      <div className="axio-chart-grid">
        <AxioCard>
          <AxioSectionTitle hint={t.clickChart}>{t.spendByProduct}</AxioSectionTitle>
          <DonutChart
            data={productShare}
            centerLabel={t.netSpend}
            selectedId={filters.product}
            onSelect={(id) => openEntity('product', id)}
          />
        </AxioCard>
        <AxioCard>
          <AxioSectionTitle hint={t.clickChart}>{t.spendByModel}</AxioSectionTitle>
          <DonutChart
            data={modelShare}
            centerLabel={t.netSpend}
            selectedId={filters.model}
            onSelect={(id) => openEntity('model', id)}
          />
        </AxioCard>
      </div>
      <div className="axio-chart-grid">
        <AxioCard>
          <AxioSectionTitle hint={t.clickBarFilter}>{t.spendByProduct}</AxioSectionTitle>
          <RankBars
            data={byProduct.map((item) => ({ id: item.product, name: item.product, value: item.spend }))}
            selectedId={filters.product}
            onSelect={(id) => openEntity('product', id)}
          />
        </AxioCard>
        <AxioCard>
          <AxioSectionTitle hint={t.clickBarFilter}>{t.modelRequests}</AxioSectionTitle>
          <RankBars
            data={byModel.map((item) => ({
              id: item.model,
              name: displayModel(item.model),
              value: item.requests,
            }))}
            selectedId={filters.model}
            onSelect={(id) => openEntity('model', id)}
            formatValue={(value) => value.toLocaleString()}
          />
        </AxioCard>
      </div>
      <AxioCard>
        <AxioSectionTitle hint={t.productHint}>{t.productByMonth}</AxioSectionTitle>
        <StackedBars rows={stacked} keys={productKeys} xKey="label" />
      </AxioCard>
    </>
  )
}

export function ProductFilters() {
  const { t } = useLanguage()
  const { filters, products, models, setProduct, setModel } = useFilters()

  return (
    <AxioCard>
      <div className="axio-toolbar">
        <h3>
          <AxioHintLabel title={t.product} body={t.productHint}>
            {t.product}
          </AxioHintLabel>
        </h3>
        <div className="axio-period-list">
          {products.map((p) => (
            <AxioChip
              key={p}
              active={filters.product === p}
              onClick={() => setProduct(filters.product === p ? null : p)}
            >
              {p}
            </AxioChip>
          ))}
        </div>
        <AxioField label={t.model}>
          <select value={filters.model ?? ''} onChange={(e) => setModel(e.target.value || null)}>
            <option value="">{t.all}</option>
            {models.map((m) => (
              <option key={m} value={m}>{displayModel(m)}</option>
            ))}
          </select>
        </AxioField>
      </div>
    </AxioCard>
  )
}
