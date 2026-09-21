import { useMemo, type ComponentType } from 'react'
import { NavLink } from 'react-router-dom'
import { CalendarRange, LayoutDashboard, Search, Sparkles, Users } from 'lucide-react'
import { useLanguage } from '../axio/LanguageContext'
import { useLayout } from './LayoutContext'

interface MenuDef {
  to: string
  icon: ComponentType<{ size?: number; color?: string; className?: string }>
  labelKey: 'overview' | 'users' | 'productsNav' | 'monthsNav'
}

const HOME: MenuDef[] = [{ to: '/', icon: LayoutDashboard, labelKey: 'overview' }]

const FEATURES: MenuDef[] = [
  { to: '/people', icon: Users, labelKey: 'users' },
  { to: '/products', icon: Sparkles, labelKey: 'productsNav' },
  { to: '/months', icon: CalendarRange, labelKey: 'monthsNav' },
]

export function Sidebar() {
  const { t } = useLanguage()
  const { sidebarCollapsed, mobileNavOpen, setMobileNavOpen, openSearch } = useLayout()
  const collapsed = sidebarCollapsed && !mobileNavOpen

  const home = useMemo(() => HOME, [])
  const features = useMemo(() => FEATURES, [])

  return (
    <>
      {mobileNavOpen && (
        <div className="axio-sidebar-backdrop" onClick={() => setMobileNavOpen(false)} />
      )}
      <aside
        className={`axio-sidebar${collapsed ? ' is-collapsed' : ''}${mobileNavOpen ? ' is-open' : ''}`}
      >
        <div className="axio-sidebar-top">
          {!collapsed && (
            <div className="axio-sidebar-search">
              <p className="axio-sidebar-label">{t.menu}</p>
              <button type="button" className="axio-search-field axio-search-launch" onClick={openSearch}>
                <Search size={20} />
                <span>{t.searchTrigger}</span>
              </button>
            </div>
          )}

          <div className="axio-menu-list">
            {home.map((item) => (
              <MenuItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={collapsed ? '' : t[item.labelKey]}
                collapsed={collapsed}
                end={item.to === '/'}
                onNavigate={() => setMobileNavOpen(false)}
              />
            ))}
          </div>

          {!collapsed && <div className="axio-divider" />}

          <div className="axio-sidebar-features">
            {!collapsed && <p className="axio-sidebar-label">{t.feature}</p>}
            <div className="axio-menu-list">
              {features.map((item) => (
                <MenuItem
                  key={item.to}
                  to={item.to}
                  icon={item.icon}
                  label={collapsed ? '' : t[item.labelKey]}
                  collapsed={collapsed}
                  onNavigate={() => setMobileNavOpen(false)}
                />
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function MenuItem({
  to,
  icon: Icon,
  label,
  collapsed,
  end,
  onNavigate,
}: {
  to: string
  icon: ComponentType<{ size?: number; color?: string }>
  label: string
  collapsed: boolean
  end?: boolean
  onNavigate: () => void
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      title={label || undefined}
      className={({ isActive }) =>
        `axio-menu-item${isActive ? ' is-active' : ''}${collapsed ? ' is-collapsed' : ''}`
      }
    >
      {({ isActive }) => (
        <>
          <span className="axio-menu-icon">
            <Icon
              size={20}
              color={isActive ? 'var(--color-accent-foreground)' : 'var(--color-foreground)'}
            />
          </span>
          {label && <span className="axio-menu-label">{label}</span>}
        </>
      )}
    </NavLink>
  )
}
