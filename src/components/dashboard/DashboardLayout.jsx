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
import SupportChatPage from './SupportChatPage'
import { useForge, getAccent } from '../../App'
import { 
  Sparkles, Laptop, Smartphone, Tablet, Menu, LogOut, Zap,
  Globe, Layers, RotateCcw, Copy, Check, ExternalLink, Lock, Eye, Monitor,
  Mail, AlertTriangle
} from 'lucide-react'
import WingLogo from '../ui/WingLogo'
import { AppMockup, VideoPlayerModal } from '../onboarding/Preview'
import ApiKeysModal from '../ui/ApiKeysModal'
import PricingPointModal from './PricingPointModal'
import DIYSubscriptionModal from '../launch/DIYSubscriptionModal'
import EmailConfigModal from '../ui/EmailConfigModal'
import { hexToRgb, extractBrandColorFromAvatar, getDeterministicBrandColor, getContrastTextColor } from '../../utils/avatarColorExtractor'

function DashboardAppPreview() {
  const { creatorData, triggerToast } = useForge()
  const theme = creatorData.theme || 'dark'
  const blueprint = creatorData.blueprint || { name: 'Creator Academy', type: 'Web App' }
  const extraTabs = creatorData.extraTabs || []
  const [device, setDevice] = useState('desktop') // 'desktop' | 'mobile'
  const [viewMode, setViewMode] = useState('landing') // 'landing' (default: first thing seen) | 'product'
  const [copied, setCopied] = useState(false)
  const [isReloading, setIsReloading] = useState(false)
  const [playingVideo, setPlayingVideo] = useState(null)

  const previewType = blueprint.preview || 'webapp'

  const [mockupActiveTab, setMockupActiveTab] = useState(() => {
    if (previewType === 'webapp') return 'Courses'
    if (previewType === 'mobile') return 'Home Feed'
    if (previewType === 'community') return 'Announcements'
    if (previewType === 'store') return 'All Products'
    return 'Courses'
  })

  const creatorName = creatorData?.name || creatorData?.handle?.replace('@', '') || 'Creator'
  const handleClean = (creatorData?.handle || creatorName || 'creator').replace('@', '').toLowerCase()
  const previewDomain = `${handleClean}.colaunch.app`
  const previewUrl = `https://${previewDomain}${viewMode === 'product' ? '/app' : ''}`

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(previewUrl)
      setCopied(true)
      if (triggerToast) triggerToast('Preview link copied to clipboard!', 'success')
      setTimeout(() => setCopied(false), 2200)
    } catch {
      if (triggerToast) triggerToast('Failed to copy preview link', 'error')
    }
  }

  const handleReload = () => {
    setIsReloading(true)
    if (triggerToast) triggerToast('Refreshed live app preview', 'info')
    setTimeout(() => setIsReloading(false), 600)
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#090d16] p-3 sm:p-5 overflow-hidden">
      {/* Main Viewport Stage - 90vh App Mockup with Landing Page as First View */}
      <div className="flex-1 w-full flex items-center justify-center relative min-h-0">
        {device === 'desktop' && (
          <div className="w-full max-w-6xl h-[90vh] min-h-[600px] flex flex-col rounded-none border border-[#22293d] bg-[#0a0c12] shadow-2xl overflow-hidden transition-all duration-300">
            {/* Sleek Browser Window Chrome */}
            <div className="px-4 py-2.5 bg-[#0d1019] border-b border-[#1f2638] flex items-center justify-between flex-shrink-0 select-none">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                </div>

                {/* Inline Device Switcher */}
                <div className="hidden sm:inline-flex items-center gap-1 p-0.5 bg-[#121624] border border-[#222a3d] rounded-none">
                  <button
                    type="button"
                    onClick={() => setDevice('desktop')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-none transition cursor-pointer ${
                      device === 'desktop'
                        ? 'text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    style={device === 'desktop' ? { background: '#c81e3c', color: '#ffffff' } : {}}
                    title="Desktop View"
                  >
                    <Laptop size={12} />
                    <span>Desktop</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDevice('mobile')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-none transition cursor-pointer ${
                      device === 'mobile'
                        ? 'text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    style={device === 'mobile' ? { background: '#c81e3c', color: '#ffffff' } : {}}
                    title="Mobile View"
                  >
                    <Smartphone size={12} />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              {/* Center: Address Pill + Mode Switcher */}
              <div className="flex-1 max-w-lg mx-3 flex items-center justify-center gap-2">
                <div className="flex-1 bg-[#121624] border border-[#222a3d] rounded-none px-3.5 py-1 text-xs flex items-center justify-between shadow-inner">
                  <div className="flex items-center space-x-2 truncate min-w-0">
                    <Lock size={12} className="text-emerald-400 flex-shrink-0" />
                    <span className="truncate font-mono font-medium text-slate-300 text-[11px]">
                      {previewDomain}{viewMode === 'product' ? '/app' : ''}
                    </span>
                  </div>
                  <span className="text-[9px] uppercase font-mono font-bold px-2 py-0.5 rounded-none bg-white/5 border border-white/10 text-slate-400 shrink-0 ml-2">
                    {viewMode === 'landing' ? 'Public' : 'Member App'}
                  </span>
                </div>

                {/* Inline Mode Switcher inside Chrome */}
                <div className="hidden md:inline-flex items-center gap-1 p-0.5 bg-[#121624] border border-[#222a3d] rounded-none shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode('landing')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-none transition cursor-pointer ${
                      viewMode === 'landing'
                        ? 'bg-white/10 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Public Landing Page"
                  >
                    <Globe size={11} />
                    <span>Landing</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('product')}
                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-none transition cursor-pointer ${
                      viewMode === 'product'
                        ? 'bg-white/10 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Member App View"
                  >
                    <Layers size={11} />
                    <span>Member App</span>
                  </button>
                </div>
              </div>

              {/* Right Chrome Controls */}
              <div className="flex items-center space-x-1.5 text-slate-400">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-1.5 rounded-none hover:text-white hover:bg-white/5 transition cursor-pointer"
                  title="Copy Preview URL"
                >
                  {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
                <button
                  type="button"
                  onClick={handleReload}
                  className="p-1.5 rounded-none hover:text-white hover:bg-white/5 transition cursor-pointer"
                  title="Reload Preview"
                >
                  <RotateCcw size={13} className={`transition-transform duration-500 ${isReloading ? 'rotate-180 text-white' : ''}`} />
                </button>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-none hover:text-white hover:bg-white/5 transition cursor-pointer"
                  title="Open in new window"
                >
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            {/* Browser Content Stage with Smooth Scroll */}
            <div className="flex-1 min-h-0 overflow-y-auto bg-[#0a0c12] custom-scrollbar relative flex flex-col scroll-smooth">
              <AppMockup
                theme={theme}
                activeTab={mockupActiveTab}
                setActiveTab={setMockupActiveTab}
                blueprint={blueprint}
                creatorData={creatorData}
                extraTabs={extraTabs}
                isMobile={false}
                viewMode={viewMode}
                onSwitchView={(mode) => setViewMode(mode)}
                onPlayVideo={(v) => setPlayingVideo(v)}
              />
            </div>
          </div>
        )}

        {device === 'mobile' && (
          <div className="w-[380px] max-w-full h-[90vh] min-h-[600px] p-2.5 rounded-none border border-[#252c3e] bg-[#0f121c] shadow-2xl flex flex-col relative my-auto transition-all duration-300">
            {/* Screen Top Bar */}
            <div className="flex items-center justify-between pb-2 px-1 text-slate-400 text-xs">
              <button
                type="button"
                onClick={() => setDevice('desktop')}
                className="flex items-center gap-1 text-[11px] hover:text-white transition cursor-pointer"
              >
                <Laptop size={12} />
                <span>Switch to Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'landing' ? 'product' : 'landing')}
                className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              >
                {viewMode === 'landing' ? 'View App' : 'View Landing'}
              </button>
            </div>

            {/* Screen Viewport */}
            <div className="flex-1 min-h-0 rounded-none overflow-hidden bg-[#0a0c12] flex flex-col relative overflow-y-auto custom-scrollbar border border-white/5 scroll-smooth">
              <AppMockup
                theme={theme}
                activeTab={mockupActiveTab}
                setActiveTab={setMockupActiveTab}
                blueprint={blueprint}
                creatorData={creatorData}
                extraTabs={extraTabs}
                isMobile={true}
                viewMode={viewMode === 'landing' ? 'landing' : 'mobile'}
                onSwitchView={(mode) => setViewMode(mode)}
                onPlayVideo={(v) => setPlayingVideo(v)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Video Player Modal for Live Preview playback */}
      {playingVideo && (
        <VideoPlayerModal
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
          creatorData={creatorData}
          dynamicAccent="#c81e3c"
          isLight={false}
        />
      )}
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
  support: SupportChatPage,
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
  support: 'Customer Support',
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
    setUserProfile,
    triggerToast,
    chatOpen,
    setChatOpen,
  } = useForge()
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024)
  const [pricingModalOpen, setPricingModalOpen] = useState(false)
  const [diyModalOpen, setDiyModalOpen] = useState(false)
  const [emailModalOpen, setEmailModalOpen] = useState(false)
  const resolvedAvatar = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''

  // Unified single brand color across the entire application (co-launch.app brand red)
  const creatorBrandColor = '#c81e3c'
  const [cr, cg, cb] = [200, 30, 60]
  const brandTextColor = '#ffffff'

  // Email configuration check: ensures the user has a genuine custom email (not default/dummy)
  const currentCreatorEmail = (userProfile?.email || creatorData?.email || '').trim().toLowerCase()
  const isEmailConfigured = Boolean(
    currentCreatorEmail &&
    currentCreatorEmail !== 'creatorforgeweb@gmail.com' &&
    !currentCreatorEmail.endsWith('@example.com') &&
    !currentCreatorEmail.endsWith('@test.com') &&
    currentCreatorEmail.includes('@')
  )

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
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-none transition-colors"
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
            {/* Live status pill */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-none border"
              style={{ 
                background: `rgba(${cr}, ${cg}, ${cb}, 0.1)`, 
                borderColor: `rgba(${cr}, ${cg}, ${cb}, 0.25)` 
              }}
            >
              <span className="w-1.5 h-1.5 rounded-none bg-emerald-400" />
              <span className="text-[12px] text-slate-200">
                {creatorData.productName || 'Creator Academy'} live
              </span>
            </div>

            {/* Forge Chat toggle */}
            <button
              onClick={() => setChatOpen(o => !o)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-none transition-all duration-150 border"
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
                className="w-8 h-8 rounded-none overflow-hidden flex items-center justify-center font-semibold text-[13px] cursor-pointer flex-shrink-0"
                style={{
                  background: '#121722',
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-none text-xs font-semibold text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer shadow-sm ml-1"
            >
              <LogOut size={13} className="text-rose-400" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Email Not Configured Notification Banner (First view of dashboard prompt) */}
        {!isEmailConfigured && (
          <div 
            className="mx-3 sm:mx-6 mt-3 sm:mt-4 p-3.5 sm:p-4 rounded-none border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 animate-fade-in-down relative overflow-hidden flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, rgba(${cr}, ${cg}, ${cb}, 0.14) 0%, rgba(11, 15, 25, 0.98) 100%)`,
              borderColor: `rgba(${cr}, ${cg}, ${cb}, 0.5)`,
              borderRadius: '0px'
            }}
          >
            <div className="flex items-center gap-3.5 relative z-10">
              <div 
                className="w-10 h-10 rounded-none flex items-center justify-center flex-shrink-0 border"
                style={{ 
                  background: creatorBrandColor, 
                  borderColor: `rgba(${cr}, ${cg}, ${cb}, 0.6)`,
                  borderRadius: '0px'
                }}
              >
                <Mail size={18} className="text-white" />
              </div>
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-2">
                  <h4 className="text-[13px] font-extrabold text-white tracking-tight">
                    Email Address Not Configured
                  </h4>
                  <span 
                    className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-none text-white shadow-xs"
                    style={{
                      background: creatorBrandColor,
                      color: '#ffffff',
                      borderRadius: '0px'
                    }}
                  >
                    Action Required
                  </span>
                </div>
                <p className="text-[12px] text-slate-300 leading-relaxed">
                  Your creator email is not configured. Please add your email address to enable campaign outreach, lead notifications, customer receipts, and member invites.
                </p>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setEmailModalOpen(true)}
              className="text-[12px] py-2.5 px-4 whitespace-nowrap self-start sm:self-center relative z-10 flex items-center gap-1.5 font-extrabold transition-all duration-150 cursor-pointer shadow-md hover:opacity-95"
              style={{
                background: creatorBrandColor,
                color: '#ffffff',
                borderRadius: '0px',
                border: 'none'
              }}
            >
              <Mail size={14} className="text-white" />
              <span className="text-white font-bold">Configure Email</span>
            </button>
          </div>
        )}

        {/* Guest Action Suggestion Banner */}
        {!isRegistered && aiActionsCount >= 3 && (
          <div 
            className="mx-3 sm:mx-6 mt-3 sm:mt-4 p-3 sm:p-4 rounded-none border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 animate-fade-in-down relative overflow-hidden flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, rgba(${cr}, ${cg}, ${cb}, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%)`,
              borderColor: `rgba(${cr}, ${cg}, ${cb}, 0.25)`,
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
              borderRadius: '0px'
            }}
          >
            {/* Ambient creator background glow */}
            <div 
              className="absolute -right-8 -top-8 w-24 h-24 blur-xl pointer-events-none" 
              style={{ background: `rgba(${cr}, ${cg}, ${cb}, 0.15)` }}
            />
            
            <div className="flex items-center gap-3.5 relative z-10">
              <div 
                className="w-9 h-9 rounded-none flex items-center justify-center flex-shrink-0 border"
                style={{ 
                  background: `rgba(${cr}, ${cg}, ${cb}, 0.18)`, 
                  borderColor: `rgba(${cr}, ${cg}, ${cb}, 0.35)`,
                  borderRadius: '0px'
                }}
              >
                <Sparkles size={16} className="animate-pulse text-white" />
              </div>
              <div className="space-y-0.5 text-left">
                <h4 className="text-[13px] font-semibold text-white tracking-tight flex items-center gap-2">
                  Upgrade to Secure Account
                  <span 
                    className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-none text-white shadow-xs"
                    style={{
                      background: `rgba(${cr}, ${cg}, ${cb}, 0.25)`,
                      color: '#ffffff',
                      border: `1px solid rgba(${cr}, ${cg}, ${cb}, 0.45)`,
                      borderRadius: '0px'
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
              className="forge-btn-primary text-[12px] py-2 px-4 whitespace-nowrap self-start sm:self-center relative z-10 flex items-center gap-1.5 rounded-none"
              style={{ borderRadius: '0px' }}
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
          productName: creatorData.productName || 'Creator Platform',
          diyFee: 50,
          diyPassPrice: 50
        }}
        onUnlockSuccess={() => setDiyModalOpen(false)}
      />

      {/* Email Configuration Modal */}
      <EmailConfigModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        userProfile={userProfile}
        creatorData={creatorData}
        setUserProfile={setUserProfile}
        updateCreator={updateCreator}
        triggerToast={triggerToast}
      />
    </div>
  )
}
