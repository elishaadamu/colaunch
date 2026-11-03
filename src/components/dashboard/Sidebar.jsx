import { useState, useEffect, useRef } from 'react'
import { Megaphone, Calendar, Layers, Package, DollarSign, Link, Settings, ChevronLeft, ChevronRight, Users, Laptop, LogOut, UserPlus, ShieldAlert, X, Rocket, Headphones, ArrowUp } from 'lucide-react'
import WingLogo from '../ui/WingLogo'
import { useForge } from '../../App'

const NAV_ITEMS = [
  { id: 'preview',    icon: Laptop,     label: 'App Preview',       badge: 'Live' },
  { id: 'marketing',  icon: Megaphone,  label: 'Marketing',         badge: null },
  { id: 'calendar',   icon: Calendar,   label: 'Content Calendar',  badge: null },
  { id: 'community',  icon: Users,      label: 'Community',         badge: null },
  { id: 'studio',     icon: Layers,     label: 'Studio',            badge: null },
  { id: 'products',   icon: Package,    label: 'Products',          badge: null },
  { id: 'revenue',    icon: DollarSign, label: 'Revenue',           badge: null },
  { id: 'support',    icon: Headphones, label: 'Customer Support',  badge: 'AI' },
  { id: 'accounts',   icon: Link,       label: 'Accounts',          badge: null },
  { id: 'settings',   icon: Settings,   label: 'Settings',          badge: null },
]

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  const { logout, isRegistered, goTo } = useForge()
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarScrolled, setSidebarScrolled] = useState(false)
  const desktopNavRef = useRef(null)
  const mobileNavRef = useRef(null)

  // Scroll sidebar to top when tab changes
  useEffect(() => {
    if (desktopNavRef.current) {
      desktopNavRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
    if (mobileNavRef.current) {
      mobileNavRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [activeTab])

  const scrollToTop = () => {
    desktopNavRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    mobileNavRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Detect mobile/tablet breakpoint
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Listen for external toggle events (e.g. from fullscreen ContentCalendar)
  useEffect(() => {
    const handleToggle = () => setIsOpen(o => !o)
    window.addEventListener('forge_toggle_sidebar', handleToggle)
    return () => window.removeEventListener('forge_toggle_sidebar', handleToggle)
  }, [setIsOpen])

  // Close sidebar on escape key
  useEffect(() => {
    if (!isMobile || !isOpen) return
    const fn = (e) => { if (e.key === 'Escape') setIsOpen(false) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [isMobile, isOpen, setIsOpen])

  const handleNavClick = (id) => {
    setActiveTab(id)
    if (isMobile) setIsOpen(false)
  }

  // Mobile/tablet: fixed slide-in drawer
  if (isMobile) {
    return (
      <>
        {/* Backdrop overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 sidebar-overlay"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={() => setIsOpen(false)}
          />
        )}

        {/* Drawer */}
        {isOpen && (
          <aside
            className="fixed top-0 left-0 bottom-0 z-50 flex flex-col border-r sidebar-mobile-open"
            style={{
              width: '270px',
              borderColor: 'var(--theme-border-color)',
              background: 'var(--theme-sidebar-bg)',
            }}
          >
            {/* Logo + close */}
            <div
              className="flex items-center justify-between px-4 border-b flex-shrink-0"
              style={{ borderColor: 'var(--theme-border-color)', height: '60px' }}
            >
              <div className="flex items-center gap-2.5">
                <WingLogo size={22} />
                <span
                  style={{ fontFamily: "'Playfair Display', Georgia, Cambria, 'Times New Roman', serif" }}
                  className="text-white font-semibold text-[15px] tracking-tight"
                >
                  CoLaunch
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-none transition-colors"
                style={{ color: 'var(--theme-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav items */}
            <nav ref={mobileNavRef} className="flex-1 py-3 overflow-y-auto custom-scrollbar scroll-smooth">
              <div className="space-y-0.5 px-2">
                {NAV_ITEMS.map(({ id, icon: Icon, label, badge }) => {
                  const isActive = activeTab === id
                  return (
                    <button
                      key={id}
                      onClick={() => handleNavClick(id)}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-none transition-all duration-150"
                      style={{
                        background: isActive ? 'var(--theme-accent-bg)' : 'transparent',
                      }}
                    >
                      <Icon
                        size={18}
                        className="flex-shrink-0"
                        style={{ color: isActive ? 'var(--theme-accent)' : 'var(--theme-text-muted)' }}
                      />
                      <span
                        className="text-[14px] font-medium flex-1 text-left"
                        style={{ color: isActive ? 'var(--theme-text)' : 'var(--theme-text-muted)' }}
                      >
                        {label}
                      </span>
                      {badge && (
                        <span
                          className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-none flex-shrink-0 tracking-tight leading-none"
                          style={{ background: 'var(--theme-accent)', color: 'var(--theme-btn-primary-text)' }}
                        >
                          {badge}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </nav>

            {/* Register promo (guest) */}
            {!isRegistered && (
              <div className="px-2 pb-2 flex-shrink-0">
                <button
                  onClick={() => { goTo('signup'); setIsOpen(false) }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-none transition-all duration-300 relative overflow-hidden group border"
                  style={{
                    background: 'linear-gradient(135deg, var(--theme-accent-bg) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    borderColor: 'var(--theme-accent-border)',
                  }}
                >
                  <UserPlus size={18} className="flex-shrink-0" style={{ color: 'var(--theme-accent)' }} />
                  <span className="text-[13px] font-semibold text-white text-left flex-1">
                    Register Account
                  </span>
                  <span className="absolute right-2 top-2 w-1.5 h-1.5 rounded-none" style={{ background: 'var(--theme-accent)' }} />
                </button>
              </div>
            )}

            {/* Logout */}
            <div className="px-2 pb-4">
              <button
                onClick={() => {
                  if (!isRegistered) {
                    setShowLogoutModal(true)
                  } else {
                    logout()
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-none transition-all duration-150"
                style={{ background: 'transparent', color: 'var(--theme-text-muted)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'
                  e.currentTarget.style.color = '#ef4444'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--theme-text-muted)'
                }}
              >
                <LogOut size={18} className="flex-shrink-0" />
                <span className="text-[14px] font-medium text-left">Logout</span>
              </button>
            </div>
          </aside>
        )}

        {/* Logout modal */}
        {showLogoutModal && (
          <LogoutModal
            onRegister={() => { setShowLogoutModal(false); goTo('signup') }}
            onLogout={() => { setShowLogoutModal(false); logout() }}
            onCancel={() => setShowLogoutModal(false)}
          />
        )}
      </>
    )
  }

  // Desktop: persistent collapsible sidebar
  return (
    <>
      <aside
        className="relative z-30 flex flex-col border-r flex-shrink-0 transition-all duration-300"
        style={{
          width: isOpen ? '228px' : '60px',
          borderColor: 'var(--theme-border-color)',
          background: 'var(--theme-sidebar-bg)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 border-b flex-shrink-0 overflow-hidden cursor-pointer hover:bg-white/[0.02] transition"
          style={{
            borderColor: 'var(--theme-border-color)',
            padding: isOpen ? '18px 16px' : '18px 0',
            justifyContent: isOpen ? 'flex-start' : 'center',
          }}
          onClick={scrollToTop}
          title="Scroll sidebar to top"
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(o => !o)
            }}
            className="w-7 h-7 flex items-center justify-center flex-shrink-0 cursor-pointer"
          >
            <WingLogo size={22} />
          </button>
          {isOpen && (
            <span
              className="text-white font-semibold text-[15px] tracking-tight whitespace-nowrap cursor-pointer select-none"
              style={{
                fontFamily: "'Playfair Display', Georgia, Cambria, 'Times New Roman', serif",
                opacity: isOpen ? 1 : 0,
                transition: 'opacity 0.15s',
              }}
              onClick={scrollToTop}
            >
              CoLaunch
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav 
          ref={desktopNavRef}
          onScroll={(e) => setSidebarScrolled(e.target.scrollTop > 40)}
          className="flex-1 py-3 overflow-y-auto custom-scrollbar scroll-smooth"
        >
          <div className="space-y-0.5 px-2">
            <button
              onClick={() => window.location.href = '/launch'}
              title={!isOpen ? 'Creator Launch OS' : undefined}
              className="w-full flex items-center rounded-none transition-all duration-200 group overflow-hidden mb-2"
              style={{
                padding: isOpen ? '9px 10px' : '9px 0',
                justifyContent: isOpen ? 'flex-start' : 'center',
                gap: isOpen ? '10px' : '0',
                background: 'linear-gradient(135deg, var(--theme-accent-bg) 0%, rgba(255, 255, 255, 0.02) 100%)',
                border: '1px solid var(--theme-accent-border)',
              }}
            >
              <Rocket size={16} className="flex-shrink-0" style={{ color: 'var(--theme-accent)' }} />
              {isOpen && (
                <>
                  <span className="text-[13px] font-bold flex-1 text-left whitespace-nowrap text-white">
                    Creator Launch
                  </span>
                  <span 
                    className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-none"
                    style={{
                      background: 'var(--theme-accent-bg)',
                      color: 'var(--theme-accent)',
                      border: '1px solid var(--theme-accent-border)',
                    }}
                  >
                    OS
                  </span>
                </>
              )}
            </button>
            {NAV_ITEMS.map(({ id, icon: Icon, label, badge }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  title={!isOpen ? label : undefined}
                  className="w-full flex items-center rounded-none transition-all duration-150 group overflow-hidden"
                  style={{
                    padding: isOpen ? '9px 10px' : '9px 0',
                    justifyContent: isOpen ? 'flex-start' : 'center',
                    gap: isOpen ? '10px' : '0',
                    background: isActive
                      ? 'var(--theme-accent-bg)'
                      : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = 'var(--theme-accent-bg)'
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <Icon
                    size={16}
                    className="flex-shrink-0 transition-colors"
                    style={{ color: isActive ? 'var(--theme-accent)' : 'var(--theme-text-muted)' }}
                  />

                  {isOpen && (
                    <>
                      <span
                        className="text-[13px] font-medium flex-1 text-left whitespace-nowrap"
                        style={{ color: isActive ? 'var(--theme-text)' : 'var(--theme-text-muted)' }}
                      >
                        {label}
                      </span>
                      {badge && (
                        <span
                          className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-none flex-shrink-0 tracking-tight leading-none"
                          style={{ background: 'var(--theme-accent)', color: 'var(--theme-btn-primary-text)' }}
                        >
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Register Account Promo (Only if guest) */}
        {!isRegistered && (
          <div className="px-2 pb-2 flex-shrink-0">
            <button
              onClick={() => goTo('signup')}
              title={!isOpen ? "Register Console Account" : undefined}
              className="w-full flex items-center rounded-none transition-all duration-300 relative overflow-hidden group border"
              style={{
                padding: isOpen ? '10px 10px' : '10px 0',
                justifyContent: isOpen ? 'flex-start' : 'center',
                gap: isOpen ? '10px' : '0',
                background: 'linear-gradient(135deg, var(--theme-accent-bg) 0%, rgba(255, 255, 255, 0.02) 100%)',
                borderColor: 'var(--theme-accent-border)',
              }}
            >
              <UserPlus
                size={16}
                className="flex-shrink-0 group-hover:scale-110 transition-transform"
                style={{ color: 'var(--theme-accent)' }}
              />
              {isOpen && (
                <span className="text-[12px] font-semibold text-white whitespace-nowrap text-left flex-1">
                  Register Account
                </span>
              )}
              {/* Subtle accent dot */}
              <span className="absolute right-2 top-2 w-1.5 h-1.5 rounded-none" style={{ background: 'var(--theme-accent)' }} />
            </button>
          </div>
        )}

        {/* Scroll sidebar to top shortcut */}
        {sidebarScrolled && (
          <div className="px-2 pb-1.5 flex-shrink-0 animate-fadeIn">
            <button
              onClick={scrollToTop}
              title="Scroll sidebar to top"
              className="w-full py-1 text-[10px] font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-1.5 transition cursor-pointer"
              style={{ borderRadius: '0px' }}
            >
              <ArrowUp size={11} className="text-[#c81e3c]" />
              {isOpen && <span>Back to Top</span>}
            </button>
          </div>
        )}

        {/* Logout button */}
        <div className="px-2 pb-2">
          <button
            onClick={() => {
              if (!isRegistered) {
                setShowLogoutModal(true)
              } else {
                logout()
              }
            }}
            title={!isOpen ? "Logout" : undefined}
            className="w-full flex items-center rounded-none transition-all duration-150 group overflow-hidden"
            style={{
              padding: isOpen ? '9px 10px' : '9px 0',
              justifyContent: isOpen ? 'flex-start' : 'center',
              gap: isOpen ? '10px' : '0',
              background: 'transparent',
              color: 'var(--theme-text-muted)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'
              e.currentTarget.style.color = '#ef4444'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--theme-text-muted)'
            }}
          >
            <LogOut size={16} className="flex-shrink-0" />
            {isOpen && (
              <span className="text-[13px] font-medium text-left whitespace-nowrap">
                Logout
              </span>
            )}
          </button>
        </div>

        {/* Collapse toggle */}
        <div
          className="px-2 py-3 border-t"
          style={{ borderColor: 'var(--theme-border-color)' }}
        >
          <button
            onClick={() => setIsOpen(o => !o)}
            title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            className="w-full flex items-center justify-center py-2 rounded-none transition-all duration-150"
            style={{ color: 'var(--theme-text-muted)' }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--theme-accent-bg)'
              e.currentTarget.style.color = 'var(--theme-text)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--theme-text-muted)'
            }}
          >
            {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      </aside>

      {/* Logout Warning Modal for Guests */}
      {showLogoutModal && (
        <LogoutModal
          onRegister={() => { setShowLogoutModal(false); goTo('signup') }}
          onLogout={() => { setShowLogoutModal(false); logout() }}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </>
  )
}

function LogoutModal({ onRegister, onLogout, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
      <div className="w-full max-w-sm rounded-none border p-6 space-y-6 shadow-2xl text-left bg-[#0e0e0e]" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        <div className="flex items-center gap-3 text-amber-500">
          <ShieldAlert size={22} className="animate-bounce" />
          <h3 className="text-[16px] font-bold text-white">Discard Guest Progress?</h3>
        </div>
        <p className="text-[12.5px] leading-relaxed text-white/50">
          You are currently in a temporary guest session. If you log out without registering, all your scraped signals, content calendars, and campaign drafts will be permanently deleted.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={onRegister}
            className="forge-btn-primary w-full text-[13px] py-2.5 font-semibold rounded-none"
          >
            Register Account & Save
          </button>
          <button
            onClick={onLogout}
            className="w-full py-2.5 text-[12px] font-medium rounded-none border border-white/5 hover:border-red-500/20 hover:bg-red-500/5 text-white/40 hover:text-red-400 transition-all text-center"
          >
            Logout anyway (Discard all data)
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2 text-[12px] font-medium rounded-none text-white/40 hover:text-white/60 transition-colors text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
