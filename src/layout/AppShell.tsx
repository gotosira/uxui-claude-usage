import { Outlet } from 'react-router-dom'
import { LayoutProvider } from './LayoutContext'
import { TopNavigation } from './TopNavigation'
import { Sidebar } from './Sidebar'
import { FilterRail } from './FilterRail'
import { SearchModal } from './SearchModal'
import { PersonModal } from './PersonModal'
import { EntityModal } from './EntityModal'

export function AppShell() {
  return (
    <LayoutProvider>
      <div className="axio-app">
        <TopNavigation />
        <div className="axio-body">
          <Sidebar />
          <main className="axio-content">
            <FilterRail />
            <Outlet />
          </main>
        </div>
        <SearchModal />
        <EntityModal />
        <PersonModal />
      </div>
    </LayoutProvider>
  )
}
