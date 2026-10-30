import { useState, useEffect, useMemo } from 'react'
import Sidebar from './Sidebar'
import Marketing from './Marketing'
import ContentCalendar from './ContentCalendar'
import Studio from './Studio'
import Community from './Community'
import Products from './Products'
import Revenue from './Revenue'
import Accounts from './Accounts'
import Settings from './Settings'
import ForgeChat from './ForgeChat'
import { useForge, getAccent } from '../../App'
import { Sparkles, Laptop, Smartphone, Menu, LogOut, Zap } from 'lucide-react'
import WingLogo from '../ui/WingLogo'
import { AppMockup } from '../onboarding/Preview'
import ApiKeysModal from '../ui/ApiKeysModal'
import PricingPointModal from './PricingPointModal'
import DIYSubscriptionModal from '../launch/DIYSubscriptionModal'
import { hexToRgb, extractBrandColorFromAvatar, getDeterministicBrandColor, getContrastTextColor } from '../../utils/avatarColorExtractor'

function DashboardAppPreview() {
  const { creatorData } = useForge()
  const theme = creatorData.theme || 'dark'
  const blueprint = creatorData.blueprint || { name: 'Creator Academy', type: 'Web App' }
  const extraTabs = creatorData.extraTabs || []
  const [isMobileView, setIsMobileView] = useState(() => creatorData.isMobileView || false)
  const previewType = blueprint.preview || 'webapp'

  const [mockupActiveTab, setMockupActiveTab] = useState(() => {
    if (previewType === 'webapp') return 'Courses'
    if (previewType === 'mobile') return 'Home Feed'
    if (previewType === 'community') return 'Announcements'
    if (previewType === 'store') return 'All Products'
    return 'Courses'
  })

  return (
    <div className="p-6 h-full flex flex-col items-center justify-center">
      <div className="mb-4 text-center flex flex-col items-center">
        <h3 className="text-[16px] font-bold text-white mb-1">Live App Preview</h3>
        <p className="text-[12px] mb-4" style={{ color: 'var(--theme-text-muted)' }}>
          This is how your space looks to your audience.
        </p>

        {/* Viewport layout toggles */}
        <div 
          className="flex items-center gap-1 p-1 rounded-xl border"
          style={{ 
            background: 'var(--theme-sidebar-bg)', 
            borderColor: 'var(--theme-border-color)' 
          }}
        >
          <button
            onClick={() => setIsMobileView(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150"
            style={{
              background: !isMobileView ? 'var(--theme-accent)' : 'transparent',
              color: !isMobileView ? 'var(--theme-btn-primary-text)' : 'var(--theme-text-muted)',
            }}
          >
            <Laptop size={13} />
            Desktop
          </button>
          <button
            onClick={() => setIsMobileView(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150"
            style={{
              background: isMobileView ? 'var(--theme-accent)' : 'transparent',
              color: isMobileView ? 'var(--theme-btn-primary-text)' : 'var(--theme-text-muted)',
            }}
          >
            <Smartphone size={13} />
            Mobile
          </button>
        </div>
      </div>
      
      <div className="flex-1 w-full max-w-4xl flex items-center justify-center overflow-hidden">
        {isMobileView ? (
          <div
            className="relative rounded-[40px] p-[8px] shadow-2xl transition-all duration-300 ring-1 ring-white/10"
            style={{
              width: '320px',
              height: '540px',
              background: 'var(--theme-border-color)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)'
            }}
          >
            <div className="w-full h-full rounded-[32px] overflow-hidden bg-[#0f1117] flex flex-col relative [isolation:isolate]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#141414] rounded-b-xl z-20 pointer-events-none" />
              <div className="flex-1 overflow-hidden flex flex-col">
                <AppMockup
                  theme={theme}
                  activeTab={mockupActiveTab}
                  setActiveTab={setMockupActiveTab}
                  blueprint={blueprint}
                  creatorData={creatorData}
                  extraTabs={extraTabs}
                  isMobile={true}
                />
              </div>
            </div>
          </div>
        ) : (
          <div
            className="w-full h-full max-h-[550px] rounded-2xl border overflow-hidden relative flex flex-col"
            style={{
              borderColor: 'var(--theme-border-color)',
              background: 'var(--theme-bg)',
            }}
          >
            <div
              className="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0"
              style={{ borderColor: 'var(--theme-border-color)', background: 'rgba(255,255,255,0.02)' }}
            >
              {[1,2,3].map(i => (
                <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--theme-border-color)' }} />
              ))}
              <div
                className="flex-1 mx-3 h-5 rounded-md flex items-center px-2"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <span className="text-[10px]" style={{ color: 'var(--theme-text-muted)', opacity: 0.5 }}>
                  {blueprint.name?.toLowerCase().replace(/\s+/g, '') || 'site'}.forge.app
                </span>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <AppMockup
                theme={theme}
                activeTab={mockupActiveTab}
                setActiveTab={setMockupActiveTab}
                blueprint={blueprint}
                creatorData={creatorData}
                extraTabs={extraTabs}
                isMobile={false}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const TAB_COMPONENTS = {
  preview: DashboardAppPreview,
  marketing: Marketing,
  calendar: ContentCalendar,
  studio: Studio,
  community: Community,
  products: Products,
  revenue: Revenue,
  accounts: Accounts,
  settings: Settings,
}

const TAB_LABELS = {
  preview: 'App Preview',
  marketing: 'Marketing',
  calendar: 'Content Calendar',
  studio: 'Studio',
  community: 'Community',
  products: 'Products',
  revenue: 'Revenue',
  accounts: 'Accounts',
  settings: 'Settings',
}

export default function DashboardLayout() {
  const { 
    creatorData, 
    updateCreator,
    isRegistered, 
    aiActionsCount, 
    goTo, 
    apiModalOpen, 
    setApiModalOpen,
    activeTab,
    setActiveTab,
    logout,
    userProfile,
    chatOpen,
    setChatOpen,
  } = useForge()
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024)
  const [pricingModalOpen, setPricingModalOpen] = useState(false)
  const [diyModalOpen, setDiyModalOpen] = useState(false)

  // Extract and apply avatar brand color dynamically if not set or if defaulted to red
  const resolvedAvatar = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url
  useEffect(() => {
    let active = true
    const currentBrand = creatorData?.brandColor || creatorData?.brand_color || creatorData?.brandHex
    if (resolvedAvatar && (!currentBrand || currentBrand.toLowerCase() === '#ff3b30' || currentBrand === '#7C5CFC')) {
      extractBrandColorFromAvatar(resolvedAvatar, creatorData).then(res => {
        if (active && res?.primaryHex && res.primaryHex.toLowerCase() !== '#ff3b30') {
          updateCreator({ brandColor: res.primaryHex, brandHex: res.primaryHex })
        }
      }).catch(err => {
        console.warn('[DashboardLayout] Avatar color extraction notice:', err)
      })
    }
    return () => { active = false }
  }, [resolvedAvatar, creatorData?.brandColor, creatorData?.brand_color, creatorData?.brandHex])

  // Resolve Creator Brand Color dynamically from detected avatar color
  const creatorBrandColor = useMemo(() => {
    if (creatorData?.brand_color && creatorData.brand_color !== '#7C5CFC' && creatorData.brand_color.toLowerCase() !== '#ff3b30') return creatorData.brand_color
    if (creatorData?.brandColor && creatorData.brandColor !== '#7C5CFC' && creatorData.brandColor.toLowerCase() !== '#ff3b30') return creatorData.brandColor
    if (creatorData?.brandHex && creatorData.brandHex !== '#7C5CFC' && creatorData.brandHex.toLowerCase() !== '#ff3b30') return creatorData.brandHex
    if (creatorData?.color && creatorData.color !== '#7C5CFC' && creatorData.color.toLowerCase() !== '#ff3b30') return creatorData.color
    try {
      const rawMap = localStorage.getItem("forge_creator_brand_color_map")
      if (rawMap) {
        const map = JSON.parse(rawMap)
        const id = creatorData?.id
        const handle = (creatorData?.handle || '').replace(/^@/, '').toLowerCase()
        const name = (creatorData?.name || '').toLowerCase()
        if (id && map[id]?.primaryHex && map[id].primaryHex.toLowerCase() !== '#ff3b30') return map[id].primaryHex
        if (handle && map[handle]?.primaryHex && map[handle].primaryHex.toLowerCase() !== '#ff3b30') return map[handle].primaryHex
        if (name && map[name]?.primaryHex && map[name].primaryHex.toLowerCase() !== '#ff3b30') return map[name].primaryHex
      }
    } catch {}

    const det = getDeterministicBrandColor(creatorData)
    if (det?.primaryHex && det.primaryHex.toLowerCase() !== '#ff3b30') {
      return det.primaryHex
    }
    return '#10B981'
  }, [creatorData?.brand_color, creatorData?.brandColor, creatorData?.brandHex, creatorData?.color, creatorData?.name, creatorData?.id, creatorData?.handle])

  const [cr, cg, cb] = useMemo(() => hexToRgb(creatorBrandColor), [creatorBrandColor])
  const brandTextColor = useMemo(() => getContrastTextColor(creatorBrandColor), [creatorBrandColor])

  // Listen for pricing events from child tabs (Revenue, Marketing, etc.)
  useEffect(() => {
    const handleOpenPricing = () => setPricingModalOpen(true)
    window.addEventListener('forge_open_pricing', handleOpenPricing)
    return () => window.removeEventListener('forge_open_pricing', handleOpenPricing)
  }, [])

  const TabComponent = TAB_COMPONENTS[activeTab] || Marketing

  return (
    <div 
      className="flex h-screen overflow-hidden theme-dark" 
      style={{ 
        background: '#090d16', 
        color: '#F5F3EA',
        '--theme-bg': '#090d16',
        '--theme-sidebar-bg': '#0b0f19',
        '--theme-card-bg': '#121722',
        '--theme-border-color': 'rgba(255,255,255,0.08)',
        '--theme-text': '#F5F3EA',
        '--theme-text-muted': '#94a3b8',
        '--theme-accent': creatorBrandColor,
        '--theme-accent-rgb': `${cr}, ${cg}, ${cb}`,
        '--theme-accent-bg': `rgba(${cr}, ${cg}, ${cb}, 0.14)`,
        '--theme-accent-border': `rgba(${cr}, ${cg}, ${cb}, 0.35)`,
        '--theme-btn-primary-text': brandTextColor,
      }}
    >
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0, background: '#090d16' }}>
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0"
          style={{
            borderColor: 'rgba(255,255,255,0.08)',
            background: '#0b0f19',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
              style={{ color: 'var(--theme-text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--theme-accent-bg)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-[15px] font-semibold tracking-tight text-white">
                {TAB_LABELS[activeTab]}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Commercial Launch & Pricing Point Button */}
            <button
              onClick={() => setPricingModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all hover:opacity-90 active:scale-95 cursor-pointer shadow-sm"
              style={{
                background: creatorBrandColor,
                color: brandTextColor,
              }}
              title="Review Co-Launch Commercial Terms & Pricing"
            >
              <Zap size={12} className="fill-current" style={{ color: brandTextColor }} />
              <span style={{ color: brandTextColor }}>Launch Plan • Pricing</span>
            </button>

            {/* Live status pill */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border"
              style={{ 
                background: `rgba(${cr}, ${cg}, ${cb}, 0.1)`, 
                borderColor: `rgba(${cr}, ${cg}, ${cb}, 0.25)` 
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[12px] text-slate-200">
                {creatorData.productName || 'Creator Academy'} live
              </span>
            </div>

            {/* Forge Chat toggle */}
            <button
              onClick={() => setChatOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-150 border"
              style={{
                background: chatOpen ? `rgba(${cr}, ${cg}, ${cb}, 0.15)` : 'rgba(255,255,255,0.05)',
                borderColor: chatOpen ? creatorBrandColor : 'rgba(255,255,255,0.08)',
                color: chatOpen ? '#ffffff' : 'var(--theme-text-muted)',
              }}
            >
              <Sparkles size={13} style={{ color: chatOpen ? creatorBrandColor : 'inherit' }} />
              <span className="text-[12px] font-medium hidden sm:block text-slate-200">Ask Forge</span>
            </button>

            {/* Creator name + avatar */}
            <div className="flex items-center gap-2">
              {creatorData.name && (
                <span className="text-[12px] hidden sm:block text-slate-300 font-medium">
                  {creatorData.name}
                </span>
              )}
              <div
                className="w-8 h-8 rounded-full border overflow-hidden flex items-center justify-center font-semibold text-[13px] cursor-pointer flex-shrink-0"
                style={{
                  background: '#121722',
                  borderColor: `rgba(${cr}, ${cg}, ${cb}, 0.35)`,
                  color: '#ffffff',
                }}
              >
                {resolvedAvatar ? (
                  <img
                    src={resolvedAvatar}
                    alt={creatorData.name || creatorData.handle}
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                ) : (
                  (creatorData.name || creatorData.handle || 'C').replace('@', '').charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {/* Individual User Logout Button */}
            <button
              onClick={logout}
              title={`Logout ${userProfile?.username || userProfile?.email || 'User'}`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer shadow-sm ml-1"
            >
              <LogOut size={13} className="text-rose-400" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Guest Action Suggestion Banner */}
        {!isRegistered && aiActionsCount >= 3 && (
          <div 
            className="mx-3 sm:mx-6 mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 animate-fade-in-down relative overflow-hidden flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, rgba(${cr}, ${cg}, ${cb}, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)`,
              borderColor: `rgba(${cr}, ${cg}, ${cb}, 0.25)`,
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Ambient creator background glow */}
            <div 
              className="absolute -right-8 -top-8 w-24 h-24 rounded-full blur-xl pointer-events-none" 
              style={{ background: `rgba(${cr}, ${cg}, ${cb}, 0.15)` }}
            />
            
            <div className="flex items-center gap-3.5 relative z-10">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border"
                style={{ 
                  background: `rgba(${cr}, ${cg}, ${cb}, 0.12)`, 
                  borderColor: `rgba(${cr}, ${cg}, ${cb}, 0.25)` 
                }}
              >
                <Sparkles size={16} className="animate-pulse" style={{ color: creatorBrandColor }} />
              </div>
              <div className="space-y-0.5 text-left">
                <h4 className="text-[13px] font-semibold text-white tracking-tight flex items-center gap-2">
                  Upgrade to Secure Account
                  <span 
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
                    style={{
                      background: `rgba(${cr}, ${cg}, ${cb}, 0.2)`,
                      color: creatorBrandColor,
                      border: `1px solid rgba(${cr}, ${cg}, ${cb}, 0.3)`
                    }}
                  >
                    {aiActionsCount} AI Actions
                  </span>
                </h4>
                <p className="text-[12px] leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                  You are currently exploring CoLaunch in a temporary guest session. Register your permanent profile to protect and preserve your transient API keys, calendar configurations, and launch assets.
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => goTo('signup')} 
              className="forge-btn-primary text-[12px] py-2 px-4 whitespace-nowrap self-start sm:self-center relative z-10 flex items-center gap-1.5"
            >
              Secure Console Account
            </button>
          </div>
        )}

        {/* Content row */}
        <div className="flex-1 flex overflow-hidden">
          {/* Tab content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden min-w-0 max-w-full">
            <TabComponent chatOpen={chatOpen} />
          </div>

          {/* Forge Chat panel */}
          <ForgeChat isOpen={chatOpen} onClose={() => setChatOpen(false)} />
        </div>
      </main>
      
      {/* Global Modals */}
      {apiModalOpen && (
        <ApiKeysModal onClose={() => setApiModalOpen(false)} tab="ai" />
      )}

      {/* Commercial Launch & Pricing Point Modal */}
      <PricingPointModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
        creatorData={creatorData}
        creatorBrandColor={creatorBrandColor}
        creatorBrandTextColor={brandTextColor}
        onSelectTrack={(track) => {
          // Track choice processed in modal
        }}
        onOpenDiyPayment={() => {
          setPricingModalOpen(false)
          setDiyModalOpen(true)
        }}
      />

      {/* DIY Co-Builder License Card Checkout Modal */}
      <DIYSubscriptionModal
        isOpen={diyModalOpen}
        onClose={() => setDiyModalOpen(false)}
        project={{
          creatorName: creatorData.name || creatorData.handle,
          productName: creatorData.productName || 'Creator OS',
          diyFee: 50,
          diyPassPrice: 50
        }}
        onUnlockSuccess={() => setDiyModalOpen(false)}
      />
    </div>
  )
}
