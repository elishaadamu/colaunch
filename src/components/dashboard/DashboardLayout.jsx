import { useState, useEffect, useMemo, useRef } from 'react'
import Sidebar from './Sidebar'
import Marketing from './Marketing'
import ContentCalendar from './ContentCalendar'
import PerformanceIntelligence from './PerformanceIntelligence'
import Studio from './Studio'
import Community from './Community'
import Products from './Products'
import Revenue from './Revenue'
import Accounts from './Accounts'
import ForgeChat from './ForgeChat'
import SupportChatPage from './SupportChatPage'
import { useForge, getAccent, useBgJob } from '../../App'
import {
  Sparkles, Laptop, Smartphone, Tablet, Menu, LogOut, Zap,
  Globe, Layers, RotateCcw, Copy, Check, ExternalLink, Lock, Eye, Monitor,
  Mail, AlertTriangle, Headphones, Bell, X, CheckCircle2
} from 'lucide-react'
import WingLogo from '../ui/WingLogo'
import { AppMockup, VideoPlayerModal } from '../onboarding/Preview'
import ApiKeysModal from '../ui/ApiKeysModal'
import PricingPointModal from './PricingPointModal'
import DIYSubscriptionModal from '../launch/DIYSubscriptionModal'
import EmailConfigModal from '../ui/EmailConfigModal'
import { hexToRgb, extractBrandColorFromAvatar, getDeterministicBrandColor, getContrastTextColor } from '../../utils/avatarColorExtractor'
import { getStoredYouTubeConnection } from '../../services/youtubeApi'
import { getStoredMetaConnection } from '../../services/metaApi'
import { isChannelConnectedOrConfigured, hasOnboardedSocialData } from '../../services/channelStudyService'

function DashboardAppPreview({ setActiveTab: propSetActiveTab }) {
  const { creatorData, triggerToast, setActiveTab: ctxSetActiveTab, userProfile } = useForge()
  const setActiveTab = propSetActiveTab || ctxSetActiveTab
  const ytConn = userProfile?.youtube_connection || getStoredYouTubeConnection(userProfile?.email)
  const metaConn = userProfile?.meta_connection || getStoredMetaConnection(userProfile?.email)
  const isConnected = isChannelConnectedOrConfigured(creatorData, ytConn, metaConn)
  const hasOnboardedData = hasOnboardedSocialData(creatorData)

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
    if (previewType === 'webapp') return 'Workspace'
    if (previewType === 'mobile') return 'Workspace'
    if (previewType === 'community') return 'Portal'
    if (previewType === 'store') return 'Workspace'
    return 'Workspace'
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

  if (!isConnected && !hasOnboardedData) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-[#090d16] p-4 sm:p-8 text-center overflow-y-auto">
        <div className="max-w-lg w-full p-8 bg-[#0c0f17] border border-[#1b2336] rounded-none shadow-2xl space-y-4 my-auto">
          <div className="w-14 h-14 mx-auto rounded-none bg-[#c81e3c] border border-[#c81e3c] flex items-center justify-center text-white shadow-lg shadow-[#c81e3c]/20">
            <Layers size={28} className="text-white" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
              Social Integration Required
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Connect a Channel to Generate Your Landing Page
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            You signed in directly without linking a social account. Connect your YouTube channel or Facebook page in Accounts so our AI engine can ingest your real videos, detect your brand niche, and synthesize your custom landing page and member portal.
          </p>
          <div className="pt-3">
            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('accounts')}
              className="px-6 py-2.5 text-xs font-bold text-white uppercase tracking-wider rounded-none transition cursor-pointer border-0 hover:opacity-95 flex items-center gap-2 mx-auto shadow-md"
              style={{ background: '#c81e3c', color: '#ffffff' }}
            >
              <ExternalLink size={14} className="text-white" />
              <span className="text-white">Go to Accounts to Connect</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#090d16] p-3 sm:p-5 overflow-hidden">
      {/* Main Viewport Stage - 90vh App Mockup with Landing Page as First View */}
      <div className="flex-1 w-full flex items-center justify-center relative min-h-0">
        {device === 'desktop' && (
          <div className="w-full max-w-6xl h-[90vh] min-h-[600px] flex flex-col rounded-none border border-[#22293d] bg-[#0a0c12] shadow-2xl overflow-hidden transition-all duration-300">
            {/* Sleek Browser Window Chrome */}
            <div className="px-4 py-2.5 bg-[#0d1019] border-b border-[#1f2638] flex items-center justify-between flex-shrink-0">
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
                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-none transition cursor-pointer ${device === 'desktop'
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
                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-none transition cursor-pointer ${device === 'mobile'
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
                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-none transition cursor-pointer ${viewMode === 'landing'
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
                    className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-none transition cursor-pointer ${viewMode === 'product'
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
  performance: PerformanceIntelligence,
  studio: Studio,
  community: Community,
  products: Products,
  revenue: Revenue,
  support: SupportChatPage,
  accounts: Accounts,
}

const TAB_LABELS = {
  preview: 'App Preview',
  marketing: 'Marketing',
  calendar: 'Content Calendar',
  performance: 'Performance & AI',
  studio: 'Studio',
  community: 'Community',
  products: 'Products',
  revenue: 'Revenue',
  support: 'Customer Support',
  accounts: 'Accounts',
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

  // Security Guard: Allow access if logged in OR if active creatorData exists from onboarding
  useEffect(() => {
    const hasSession = Boolean(
      userProfile || 
      (localStorage.getItem('forge_active_session') === 'true' && localStorage.getItem('forge_user_profile')) ||
      (creatorData && (creatorData.handle || creatorData.url || creatorData.name))
    )
    if (!hasSession) {
      if (typeof window !== 'undefined') {
        window.location.replace('/login')
      } else {
        goTo('login')
      }
    }
  }, [userProfile, creatorData, goTo])

  // Listen for real-time YouTube connection events from OAuth (strictly user-isolated)
  const [ytConn, setYtConn] = useState(() => userProfile?.youtube_connection || getStoredYouTubeConnection(userProfile?.email))
  useEffect(() => {
    setYtConn(userProfile?.youtube_connection || getStoredYouTubeConnection(userProfile?.email))
  }, [userProfile?.youtube_connection, userProfile?.email])

  useEffect(() => {
    const handleConnected = (e) => setYtConn(e.detail)
    const handleDisconnected = () => setYtConn(null)
    window.addEventListener('forge_youtube_connected', handleConnected)
    window.addEventListener('forge_youtube_disconnected', handleDisconnected)
    return () => {
      window.removeEventListener('forge_youtube_connected', handleConnected)
      window.removeEventListener('forge_youtube_disconnected', handleDisconnected)
    }
  }, [])

  // Creator avatar and branding must NEVER be replaced by connected YouTube channel
  const resolvedAvatar = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''
  const resolvedCreatorName = creatorData?.name || creatorData?.creator_name || creatorData?.handle || 'Creator'

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

  // Global listener for weekly launch plan & content calendar AI generation
  const autofillJob = useBgJob('autofill-week')
  const { clearBgJob, syncSessionToDb } = useForge()

  useEffect(() => {
    if (autofillJob.status === 'done' && autofillJob.result) {
      const h = creatorData?.handle || 'default'
      const hClean = h.replace(/^@+/, '')
      const keys = [
        `forge_calendar_${h}_launch_w0`,
        `forge_calendar_${h.toLowerCase()}_launch_w0`,
        `forge_calendar_${hClean}_launch_w0`,
        `forge_calendar_${hClean.toLowerCase()}_launch_w0`,
        `forge_calendar_@${hClean}_launch_w0`,
        `forge_calendar_@${hClean.toLowerCase()}_launch_w0`
      ]
      keys.forEach(k => {
        try { localStorage.setItem(k, JSON.stringify(autofillJob.result)) } catch (_) {}
      })
      try {
        localStorage.removeItem(`forge_campaign_posts_${hClean}`)
        localStorage.removeItem(`forge_campaign_posts_${hClean.toLowerCase()}`)
      } catch (_) {}

      window.dispatchEvent(new CustomEvent('forge_calendar_updated', { detail: { source: 'GlobalAutofill' } }))
      clearBgJob('autofill-week')
      if (triggerToast) {
        triggerToast('Launch plan & content calendar are ready!', 'success')
      }
      setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
    }
  }, [autofillJob.status, autofillJob.result, creatorData?.handle, clearBgJob, triggerToast, syncSessionToDb])

  // Check if user logged in via single-use email code without a password set in dashboard
  const [showCodeLoginBanner, setShowCodeLoginBanner] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      const isDismissed = sessionStorage.getItem('forge_dismiss_code_banner') === 'true'
      const isCodeLogin = localStorage.getItem('forge_logged_in_via_code') === 'true'
      return isCodeLogin && !isDismissed
    } catch (_) {
      return false
    }
  })

  // System Notifications modal state
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false)

  // Listen for open notifications event (e.g. from ContentCalendar)
  useEffect(() => {
    const handleOpenNotifications = () => setNotificationsModalOpen(true)
    window.addEventListener('forge_open_notifications', handleOpenNotifications)
    return () => window.removeEventListener('forge_open_notifications', handleOpenNotifications)
  }, [])

  // Dynamic system notifications list for unread badge count
  const notificationsList = useMemo(() => {
    const list = []
    if (!isEmailConfigured) {
      list.push({
        id: 'email_not_configured',
        title: 'Email Address Not Configured',
        subtitle: 'Action Required',
        description: 'Your creator email is not configured. Please add your email address to enable campaign outreach, lead notifications, customer receipts, and member invites.',
        actionLabel: 'Configure Email →',
        icon: Mail,
        onAction: () => {
          setNotificationsModalOpen(false)
          setEmailModalOpen(true)
        }
      })
    }
    if (showCodeLoginBanner) {
      list.push({
        id: 'code_login_notice',
        title: 'Single-Use Email Code Login',
        subtitle: 'Account Credentials',
        description: 'You signed in via email code (no password set in dashboard). Need help setting up a password or changing your email?',
        actionLabel: 'Contact Customer Care →',
        icon: Headphones,
        onAction: () => {
          setNotificationsModalOpen(false)
          setActiveTab('support')
        }
      })
    }
    return list
  }, [isEmailConfigured, showCodeLoginBanner, setActiveTab])

  const notificationCount = notificationsList.length

  // Listen for cross-component tab change events (e.g. ContentCalendar -> Accounts)
  useEffect(() => {
    const handleTabChange = (e) => {
      const targetTab = e.detail?.tab
      if (targetTab && TAB_COMPONENTS[targetTab] && typeof setActiveTab === 'function') {
        setActiveTab(targetTab)
      }
    }
    window.addEventListener('forge_tab_change', handleTabChange)
    return () => window.removeEventListener('forge_tab_change', handleTabChange)
  }, [setActiveTab])

  // Dedicated ref to scroll main content container to top
  const tabContentRef = useRef(null)

  // Scroll to top whenever tab changes or when requested
  useEffect(() => {
    if (tabContentRef.current) {
      tabContentRef.current.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [activeTab])

  useEffect(() => {
    const handleScrollTop = () => {
      if (tabContentRef.current) {
        tabContentRef.current.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
    window.addEventListener('forge_scroll_to_top', handleScrollTop)
    return () => window.removeEventListener('forge_scroll_to_top', handleScrollTop)
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
        {/* Top bar (Hidden on calendar tab so calendar is fullscreen height with only sidebar) */}
        {activeTab !== 'calendar' && (
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

              {/* Notification Bell Button with Badge Count */}
              <button
                type="button"
                onClick={() => setNotificationsModalOpen(true)}
                className="relative p-2 rounded-none transition-all duration-150 border flex items-center justify-center cursor-pointer"
                style={{
                  background: notificationsModalOpen ? 'rgba(200, 30, 60, 0.18)' : 'rgba(255,255,255,0.05)',
                  borderColor: notificationCount > 0 ? 'rgba(200, 30, 60, 0.45)' : 'rgba(255,255,255,0.08)',
                  color: notificationCount > 0 ? '#ffffff' : 'var(--theme-text-muted)',
                }}
                title={notificationCount > 0 ? `${notificationCount} unread alert${notificationCount > 1 ? 's' : ''}` : 'Notifications & System Alerts'}
              >
                <Bell size={15} className={notificationCount > 0 ? 'text-white' : 'text-slate-400'} />
                {notificationCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 rounded-full text-[10px] font-black text-white flex items-center justify-center shadow-lg border border-black/40"
                    style={{ background: '#c81e3c' }}
                  >
                    {notificationCount}
                  </span>
                )}
              </button>

              {/* Creator name + avatar */}
              <div className="flex items-center gap-2">
                <span className="text-[12px] hidden sm:block text-slate-300 font-medium">
                  {resolvedCreatorName}
                </span>
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
                      alt={resolvedCreatorName}
                      className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                  ) : (
                    (resolvedCreatorName || 'C').replace('@', '').charAt(0).toUpperCase()
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
        )}

        {/* Content row */}
        <div className="flex-1 flex overflow-hidden h-full">
          {/* Tab content (scrolls smoothly from top to bottom, or fullscreen on calendar) */}
          <div
            ref={tabContentRef}
            className={`flex-1 min-w-0 max-w-full flex flex-col ${activeTab === 'calendar'
              ? 'overflow-hidden h-full'
              : 'overflow-y-auto overflow-x-hidden custom-scrollbar scroll-smooth'
              }`}
          >
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

            <div className="flex-1 min-h-0 flex flex-col">
              <TabComponent chatOpen={chatOpen} setActiveTab={setActiveTab} />
            </div>
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

      {/* System Notifications & Alerts Modal */}
      {notificationsModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-[#0c1017] border border-white/10 rounded-none p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-none bg-[#c81e3c]/15 border border-[#c81e3c]/30 flex items-center justify-center text-[#ff6b81]">
                  <Bell size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>Notifications &amp; System Alerts</span>
                    {notificationCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-none text-[10px] font-bold uppercase bg-[#c81e3c] text-white">
                        {notificationCount} Active
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-400">Account security, channel connections, and system updates</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotificationsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer bg-transparent border-0"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Notification items list */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
              {notificationsList.length === 0 ? (
                <div className="p-8 text-center bg-[#10141f] border border-white/[0.06] rounded-none space-y-2">
                  <CheckCircle2 size={24} className="text-slate-400 mx-auto" />
                  <div className="text-xs font-bold text-white">All caught up!</div>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    No pending alerts or configuration warnings. Your creator dashboard is fully synchronized.
                  </p>
                </div>
              ) : (
                notificationsList.map(item => {
                  const ItemIcon = item.icon || AlertTriangle
                  return (
                    <div
                      key={item.id}
                      className="p-4 bg-[#10141f] border border-white/[0.08] hover:border-white/20 transition rounded-none space-y-3 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-none bg-[#c81e3c]/20 border border-[#c81e3c]/30 flex items-center justify-center text-[#ff6b81] shrink-0 mt-0.5">
                            <ItemIcon size={16} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white">{item.title}</h4>
                              <span className="px-1.5 py-0.2 rounded-none text-[9px] font-bold uppercase bg-[#c81e3c]/15 text-[#ff8093] border border-[#c81e3c]/25">
                                {item.subtitle}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={item.onAction}
                          className="px-3.5 py-1.5 text-xs font-bold text-white rounded-none transition cursor-pointer border-0 shadow-sm hover:opacity-90 flex items-center gap-1.5"
                          style={{ background: '#c81e3c', color: '#ffffff' }}
                        >
                          <span>{item.actionLabel}</span>
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono text-[10px]">CoLaunch Creator Suite</span>
              <button
                type="button"
                onClick={() => setNotificationsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer bg-transparent border-0 text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
