import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { FilterProvider } from './data/FilterContext'
import { LanguageProvider } from './axio/LanguageContext'
import { AppShell } from './layout/AppShell'
import { OverviewPage } from './pages/OverviewPage'
import { PeoplePage } from './pages/PeoplePage'
import { ProductsPage } from './pages/ProductsPage'
import { MonthsPage } from './pages/MonthsPage'

export default function App() {
  return (
    <LanguageProvider>
      <FilterProvider>
        <HashRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<OverviewPage />} />
              <Route path="people" element={<PeoplePage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="months" element={<MonthsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </FilterProvider>
    </LanguageProvider>
  )
}
