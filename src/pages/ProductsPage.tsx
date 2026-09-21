import { PageHeader } from '../layout/PageHeader'
import { PageGate } from '../layout/PageGate'
import { ProductCharts, ProductFilters } from '../dashboard/ProductCharts'
import { useLanguage } from '../axio'

export function ProductsPage() {
  const { t } = useLanguage()

  return (
    <PageGate>
      <PageHeader title={t.productsTitle} subtitle={t.productsSubtitle} />
      <ProductFilters />
      <ProductCharts />
    </PageGate>
  )
}
