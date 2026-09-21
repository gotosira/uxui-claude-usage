import { useEffect, useState } from 'react'
import { Bell, Menu, Search, Settings } from 'lucide-react'
import { useLanguage } from '../axio/LanguageContext'
import { interpolate } from '../axio/i18n'
import { useLayout } from './LayoutContext'
import { useFilters } from '../data/FilterContext'

export function TopNavigation() {
  const { t, language, setLanguage } = useLanguage()
  const { sidebarCollapsed, setSidebarCollapsed, mobileNavOpen, setMobileNavOpen, openSearch } =
    useLayout()
  const { allRows, filteredRows, maskEmails, setMaskEmails } = useFilters()
  const [showSettings, setShowSettings] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [isMac, setIsMac] = useState(true)

  const overlayOpen = showSettings || showNotif

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform) || navigator.userAgent.includes('Mac'))
  }, [])

  const closeMenus = () => {
    setShowNotif(false)
    setShowSettings(false)
  }

  return (
    <header className="axio-nav">
      <div className="axio-nav-inner">
        <div className="axio-nav-left">
          <button
            type="button"
            className="axio-icon-btn axio-icon-btn-on-primary"
            aria-label={t.menu}
            onClick={() => {
              if (window.innerWidth < 900) setMobileNavOpen(!mobileNavOpen)
              else setSidebarCollapsed(!sidebarCollapsed)
            }}
          >
            <Menu size={20} />
          </button>
          <div className="axio-brand">
            <img src="/logo.svg" alt="AXONS" width={48} height={48} className="axio-logo" />
          </div>
        </div>

        <button type="button" className="axio-nav-search" onClick={openSearch}>
          <Search size={18} />
          <span>{t.searchTrigger}</span>
          <kbd className="axio-kbd axio-kbd-on-primary">{isMac ? t.searchShortcut : t.searchShortcutWin}</kbd>
        </button>

        <div className="axio-nav-right">
          <div className="axio-lang-switch" role="group" aria-label={t.language}>
            <button
              type="button"
              className={language === 'th' ? 'is-active' : ''}
              aria-pressed={language === 'th'}
              onClick={() => setLanguage('th')}
            >
              {t.langTh}
            </button>
            <button
              type="button"
              className={language === 'en' ? 'is-active' : ''}
              aria-pressed={language === 'en'}
              onClick={() => setLanguage('en')}
            >
              {t.langEn}
            </button>
          </div>
          <button
            type="button"
            className="axio-icon-btn axio-icon-btn-on-primary axio-nav-search-icon"
            aria-label={t.search}
            onClick={openSearch}
          >
            <Search size={20} />
          </button>

          <div className="axio-nav-popover-wrap">
            <button
              type="button"
              className="axio-icon-btn axio-icon-btn-on-primary"
              aria-label={t.setting}
              onClick={() => {
                closeMenus()
                setShowSettings((v) => !v)
              }}
            >
              <Settings size={20} />
            </button>
            {showSettings && (
              <div className="axio-popover">
                <p className="axio-popover-label">{t.settingsTitle}</p>
                <div className="axio-lang-switch is-on-light" role="group" aria-label={t.language}>
                  <button
                    type="button"
                    className={language === 'th' ? 'is-active' : ''}
                    aria-pressed={language === 'th'}
                    onClick={() => setLanguage('th')}
                  >
                    {t.langTh}
                  </button>
                  <button
                    type="button"
                    className={language === 'en' ? 'is-active' : ''}
                    aria-pressed={language === 'en'}
                    onClick={() => setLanguage('en')}
                  >
                    {t.langEn}
                  </button>
                </div>
                <label className="axio-check">
                  <input
                    type="checkbox"
                    checked={maskEmails}
                    onChange={(e) => setMaskEmails(e.target.checked)}
                  />
                  {t.maskEmails}
                </label>
              </div>
            )}
          </div>

          <div className="axio-nav-popover-wrap">
            <button
              type="button"
              className="axio-icon-btn axio-icon-btn-on-primary"
              aria-label={t.notifications}
              onClick={() => {
                closeMenus()
                setShowNotif((v) => !v)
              }}
            >
              <Bell size={20} />
            </button>
            {showNotif && (
              <div className="axio-popover">
                <p className="axio-popover-label">{t.notifications}</p>
                <p>{t.threeFiles}</p>
                <p>{interpolate(t.loadedRows, { n: allRows.length.toLocaleString() })}</p>
                <p>
                  {interpolate(t.rowsInView, {
                    n: filteredRows.length.toLocaleString(),
                    total: allRows.length.toLocaleString(),
                  })}
                </p>
                <p>{t.noNotifications}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      {overlayOpen && <div className="axio-overlay" onClick={closeMenus} />}
    </header>
  )
}
