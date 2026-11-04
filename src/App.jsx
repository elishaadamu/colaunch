import { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react'
import Welcome from './components/onboarding/Welcome'
import CreatorLink from './components/onboarding/CreatorLink'
import Analyzing from './components/onboarding/Analyzing'
import Blueprint from './components/onboarding/Blueprint'
import Preview from './components/onboarding/Preview'
import Building from './components/onboarding/Building'
import PreFinish from './components/onboarding/PreFinish'
import Celebration from './components/onboarding/Celebration'
import Signup from './components/onboarding/Signup'
import Login from './components/onboarding/Login'
import DashboardLayout from './components/dashboard/DashboardLayout'
import OpsLayout from './components/ops/OpsLayout'
import OpsAuth from './components/ops/OpsAuth'
import CommunityJoin from './components/public/CommunityJoin'
import CreatorLaunchLayout from './components/launch/CreatorLaunchLayout'
import CreatorPortal from './components/launch/CreatorPortal'
import PreorderLandingPage from './components/launch/PreorderLandingPage'
import PublicSurveyPage from './components/launch/PublicSurveyPage'
import FollowUpCRMPage from './components/launch/FollowUpCRMPage'
import AdminErrorLogPage from './components/launch/AdminErrorLogPage'
import ProjectOSPage from './components/launch/ProjectOSPage'
import CreatorParticipationManager from './components/launch/CreatorParticipationManager'
import BetaTestingPortal from './components/launch/BetaTestingPortal'
import LaunchAuth from './components/launch/LaunchAuth'
import SupportWidget from './components/support/SupportWidget'
import { exchangeYouTubeAuthCode } from './services/youtubeApi'
import { fetchDashboardData, saveDashboardSection } from './services/dashboardApi'
import { updatePageSEO, getRouteSEO } from './utils/seo'
import { clearInMemoryKeys, loadKeys, saveKeys } from './services/scraper'
import { clearInMemoryAiKeys, restoreAiKeysFromLoginData, loadAiKeys, saveAiKeys, areRecsValidForCreator } from './services/ai'
import { Check, CheckCircle, AlertCircle, X, XCircle, Trash2, RefreshCw, Info } from 'lucide-react'
import { 
  hexToRgb, 
  extractBrandColorFromAvatar, 
  getDeterministicBrandColor,
  getContrastTextColor,
  isLightColor 
} from './utils/avatarColorExtractor'

export { getContrastTextColor, isLightColor }

export const ForgeContext = createContext(null)
export function useForge() { return useContext(ForgeContext) }

/**
 * useBgJob(jobId)
 * Subscribe to a background job's status and result from any component/page.
 * status: 'idle' | 'running' | 'done' | 'error'
 */
export function useBgJob(jobId) {
  const { bgJobs } = useForge()
  return bgJobs[jobId] || { status: 'idle', result: null, error: null }
}

const STEPS = [
  'welcome', 'creator-link', 'analyzing', 'blueprint',
  'preview', 'building', 'pre-finish', 'celebration', 'signup', 'login', 'dashboard',
]

// Unified CoLaunch brand red color from co-launch.app/#apply
const SINGLE_BRAND_COLOR = '#c81e3c'
const SINGLE_BRAND_RGB = '200, 30, 60'
const SINGLE_BRAND_CONTRAST = '#ffffff'

export function getAccent(platformOrCreator = null, brandColorOverride = null) {
  return {
    color: SINGLE_BRAND_COLOR,
    rgb: SINGLE_BRAND_RGB,
    contrastText: SINGLE_BRAND_CONTRAST,
    gradient: 'linear-gradient(135deg, #c81e3c 0%, #e11d48 100%)'
  }
}


function GlobalToast({ toast, onClose }) {
  const DURATION = 4200

  useEffect(() => {
    const timer = setTimeout(onClose, DURATION)
    return () => clearTimeout(timer)
  }, [onClose])

  const isSuccess = toast.type === 'success'
  const isError = toast.type === 'error'

  // Clean light theme matching reference image: 4px left accent stripe, soft tinted surface, solid circular icon badge
  const theme = isSuccess
    ? {
        borderLeft: '#16a34a',
        bg: '#dcfce7',
        titleColor: '#166534',
        msgColor: '#15803d',
        closeColor: 'text-emerald-700 hover:text-emerald-950',
        title: toast.title || 'Message sent',
      }
    : isError
      ? {
          borderLeft: '#ef4444',
          bg: '#fee2e2',
          titleColor: '#991b1b',
          msgColor: '#b91c1c',
          closeColor: 'text-rose-700 hover:text-rose-950',
          title: toast.title || 'Something has wrong',
        }
      : {
          borderLeft: '#f59e0b',
          bg: '#fef9c3',
          titleColor: '#854d0e',
          msgColor: '#a16207',
          closeColor: 'text-amber-700 hover:text-amber-950',
          title: toast.title || 'Keep in mind information',
        }

  return (
    <div
      className="fixed top-6 left-1/2 z-[9999] pointer-events-auto w-auto max-w-[90vw]"
      style={{
        animation: 'toastSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      <style>{`
        @keyframes toastSlideDown {
          0% { opacity: 0; transform: translate(-50%, -20px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      {/* Light card with 4px solid left accent stripe, zero gradients, zero progress bar, zero border radius */}
      <div
        className="relative flex items-stretch rounded-none border-0 shadow-[0_12px_36px_rgba(0,0,0,0.18)] overflow-hidden"
        style={{
          background: theme.bg,
          minWidth: 320,
          maxWidth: 460,
          borderRadius: '0px'
        }}
      >
        {/* Solid left accent vertical stripe (4px) */}
        <div
          className="w-1 shrink-0"
          style={{ background: theme.borderLeft }}
        />

        {/* Inner Content */}
        <div className="flex items-center gap-3 px-4 py-3 flex-1 min-w-0">
          {/* Solid circular badge with white icon */}
          <div
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white shadow-xs"
            style={{ background: theme.borderLeft }}
          >
            {isSuccess ? (
              <Check size={13} strokeWidth={3} className="text-white" />
            ) : isError ? (
              <AlertCircle size={13} strokeWidth={2.5} className="text-white" />
            ) : (
              <Info size={13} strokeWidth={2.5} className="text-white" />
            )}
          </div>

          {/* Text content matching reference typography */}
          <div className="flex-1 min-w-0 pr-1">
            <h5 
              className="text-[13px] font-bold tracking-tight leading-snug truncate"
              style={{ color: theme.titleColor }}
            >
              {theme.title}
            </h5>
            <p 
              className="text-[12px] font-medium leading-snug mt-0.5"
              style={{ color: theme.msgColor }}
            >
              {toast.message}
            </p>
            {toast.subtitle && (
              <p 
                className="text-[11px] opacity-85 mt-0.5"
                style={{ color: theme.msgColor }}
              >
                {toast.subtitle}
              </p>
            )}
          </div>

          {/* Minimal close button */}
          <button
            type="button"
            onClick={onClose}
            className={`w-5 h-5 rounded-none flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1 ${theme.closeColor}`}
            title="Dismiss notification"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

function WipeCreatorModal({ isOpen, onClose, onConfirm, creatorData }) {
  if (!isOpen) return null
  const handle = creatorData?.handle || creatorData?.name || 'current creator'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl bg-[#0f1117] border border-[#262c3b] p-6 shadow-2xl text-left relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Wipe Saved Creator?</h3>
            <p className="text-xs text-slate-400">Confirm local storage reset</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          This will permanently wipe <strong className="text-white">{handle}</strong>, active blueprints, and cached scraping signals from your browser's local storage.
        </p>

        <div className="p-3 rounded-xl bg-[#151822] border border-[#1f2433] text-[11px] text-slate-400 mb-6 space-y-1">
          <p className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Implications:</span>
          </p>
          <p>• If you simply refresh the page, your progress remains safely saved.</p>
          <p>• Clicking "Wipe &amp; Start Fresh" resets everything back to Step 1.</p>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#2a3042] text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            Keep Saved
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Wipe &amp; Start Fresh</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [step, setStep] = useState(() => {
    try {
      // Purge legacy shadow cache so deleted database creators never ghost in browser
      localStorage.removeItem('forge_crm_cached_creators')

      const path = window.location.pathname
      const search = window.location.search

      // OAuth callback detection: If returned from Google OAuth with code= or error=
      if (search && (search.includes('code=') || search.includes('error='))) {
        try { localStorage.setItem('forge_onboarding_step', 'dashboard') } catch {}
        try { localStorage.setItem('forge_dashboard_active_tab', 'accounts') } catch {}
        return 'dashboard'
      }

      if (path === '/' || path === '' || path === '/portal' || path === '/portal/') {
        if (typeof window !== 'undefined' && window.location.pathname !== '/portal') {
          window.history.replaceState(null, '', '/portal')
        }
        const savedStep = localStorage.getItem('forge_onboarding_step')
        const savedCreator = localStorage.getItem('forge_creator_data')
        if (savedStep && savedCreator && ['analyzing', 'blueprint', 'preview', 'building', 'pre-finish', 'celebration'].includes(savedStep)) {
          return savedStep
        }
        return 'creator-link'
      }
      if (path === '/dashboard' || path.startsWith('/dashboard/')) {
        const hasSession = localStorage.getItem('forge_active_session') === 'true' && localStorage.getItem('forge_user_profile')
        if (!hasSession) {
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.history.replaceState(null, '', '/login')
          }
          return 'login'
        }
        try { localStorage.setItem('forge_onboarding_step', 'dashboard') } catch {}
        return 'dashboard'
      }
      if (path.startsWith('/ops')) return 'ops'
      if (path.startsWith('/launch') || path.startsWith('/creator-launch')) return 'launch'
      if (path.startsWith('/portal/') || path.startsWith('/co-launch/')) return 'portal'
      if (path.startsWith('/preorder/')) return 'preorder'
      if (path.startsWith('/beta/')) return 'beta'
      if (path.startsWith('/survey/')) return 'survey'
      if (path.startsWith('/follow-up-crm') || path.startsWith('/crm')) return 'crm'
      if (path.startsWith('/project-os') || path.startsWith('/projects') || path.startsWith('/project/')) return 'project-os'
      if (path.startsWith('/participation-manager') || path.startsWith('/cobuilder-admin') || path.startsWith('/co-builders')) return 'participation'
      if (path.startsWith('/join/')) return 'join'
      if (path === '/login') return 'login'
      if (path === '/signup') return 'signup'

      const rawParts = path.split('/').filter(Boolean)
      const reservedRoutes = [
        'join', 'portal', 'co-launch', 'preorder', 'beta', 'survey', 'research',
        'follow-up-crm', 'crm', 'admin-error-log', 'error-log', 'errors',
        'project-os', 'projects', 'project', 'participation-manager', 'co-builders',
        'cobuilder-admin', 'participation', 'launch', 'creator-launch', 'ops',
        'dashboard', 'login', 'signup', 'api', 'static'
      ]
      if (rawParts.length === 2 && !reservedRoutes.includes(rawParts[0])) {
        const hasSession = localStorage.getItem('forge_active_session') === 'true' && localStorage.getItem('forge_user_profile')
        if (!hasSession) {
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            window.history.replaceState(null, '', '/login')
          }
          return 'login'
        }
        try { localStorage.setItem('forge_onboarding_step', 'dashboard') } catch {}
        return 'dashboard'
      }

      const savedStep = localStorage.getItem('forge_onboarding_step')
      const savedCreator = localStorage.getItem('forge_creator_data')
      if (savedStep && savedCreator && ['analyzing', 'blueprint', 'preview', 'building', 'pre-finish', 'celebration'].includes(savedStep)) {
        return savedStep
      }
      return 'creator-link'
    } catch { }
    return 'creator-link'
  })

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const cachedUser = localStorage.getItem('forge_user_profile')
      if (cachedUser) {
        const u = JSON.parse(cachedUser)
        if (u) {
          let updated = false
          // Purge default/dummy emails so creator is prompted to set their real one
          if (u.email === 'creatorforgeweb@gmail.com' || u.email?.endsWith('@example.com') || u.email?.endsWith('@test.com')) {
            u.email = ''
            u.needsCredentials = true
            updated = true
          }
          // Purge default/dummy passwords
          if (u.password === '320456ab' || u.password === 'demopassword' || u.password === 'creatorforge2026' || u.password === 'colaunch2026') {
            u.password = ''
            u.needsCredentials = true
            updated = true
          }
          if (!u.email || !u.password) {
            u.needsCredentials = true
            updated = true
          }
          if (updated) {
            localStorage.setItem('forge_user_profile', JSON.stringify(u))
          }
        }
        return u
      }
      return null
    } catch {
      return null
    }
  })
  const isRegistered = !!userProfile

  const [aiActionsCount, setAiActionsCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem('forge_ai_actions') || '0', 10)
    } catch {
      return 0
    }
  })

  // Lives at the root so it persists across all tab/page navigation.
  const [resetKey, setResetKey] = useState(0)
  const [bgJobs, setBgJobs] = useState({})
  const abortControllersRef = useRef({})

  // API Keys modal state
  const [apiModalOpen, setApiModalOpen] = useState(false)
  const [dbLoadedTimestamp, setDbLoadedTimestamp] = useState(0)

  const [aiKeys, setAiKeysState] = useState(() => {
    try {
      const keys = loadAiKeys()
      return {
        geminiKey: keys.geminiKey || '',
        togetherKey: keys.togetherKey || '',
        openaiKey: keys.openaiKey || '',
        anthropicKey: keys.anthropicKey || '',
      }
    } catch {
      return {
        geminiKey: '',
        togetherKey: '',
        openaiKey: '',
        anthropicKey: '',
      }
    }
  })

  const updateAiKeys = useCallback((newKeys) => {
    if (newKeys) {
      saveAiKeys(newKeys)
      restoreAiKeysFromLoginData(newKeys)
      setAiKeysState({
        geminiKey: newKeys.geminiKey || '',
        togetherKey: newKeys.togetherKey || '',
        openaiKey: newKeys.openaiKey || '',
        anthropicKey: newKeys.anthropicKey || '',
      })
    }
  }, [])

  useEffect(() => {
    fetch('/api/settings')
      .then(res => {
        if (res.ok) return res.json()
      })
      .then(data => {
        if (data) {
          if (data.apify_api_key) {
            localStorage.setItem('forge_apify_token', data.apify_api_key)
            saveKeys({ apifyToken: data.apify_api_key })
          }
          if (data.gemini_api_key && !localStorage.getItem('forge_gemini_api_key')) {
            localStorage.setItem('forge_gemini_api_key', data.gemini_api_key)
          }
          if (data.openai_api_key && !localStorage.getItem('forge_openai_api_key')) {
            localStorage.setItem('forge_openai_api_key', data.openai_api_key)
          }
          if (data.anthropic_api_key && !localStorage.getItem('forge_anthropic_api_key')) {
            localStorage.setItem('forge_anthropic_api_key', data.anthropic_api_key)
          }
          updateAiKeys({
            geminiKey: localStorage.getItem('forge_gemini_api_key') || data.gemini_api_key || '',
            openaiKey: localStorage.getItem('forge_openai_api_key') || data.openai_api_key || '',
            anthropicKey: localStorage.getItem('forge_anthropic_api_key') || data.anthropic_api_key || '',
          })
        }
      })
      .catch(err => {
        console.warn('[Forge] Failed to sync settings keys on mount:', err)
      })
  }, [updateAiKeys])

  const [globalToast, setGlobalToast] = useState(null)
  const triggerToast = useCallback((message, type = 'success') => {
    setGlobalToast({ message, type })
  }, [])

  const [activeTab, setActiveTabState] = useState(() => {
    try {
      return localStorage.getItem('forge_dashboard_active_tab') || 'preview'
    } catch {
      return 'preview'
    }
  })

  const setActiveTab = useCallback((tab) => {
    setActiveTabState(tab)
    try {
      localStorage.setItem('forge_dashboard_active_tab', tab)
    } catch (e) {
      console.warn('[Forge] Failed to cache active dashboard tab:', e)
    }
  }, [])

  const [preloadStudioType, setPreloadStudioType] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)

  /**
   * startBgJob(jobId, asyncFn)
   * Fires an async function in the background and tracks it in bgJobs.
   * The result is available from any page via useBgJob(jobId).
   */
  const startBgJob = useCallback((jobId, asyncFn) => {
    if (abortControllersRef.current[jobId]) {
      abortControllersRef.current[jobId].abort()
    }
    const controller = new AbortController()
    abortControllersRef.current[jobId] = controller

    setBgJobs(prev => ({ ...prev, [jobId]: { status: 'running', result: null, error: null } }))
    asyncFn(controller.signal)
      .then(result => {
        if (abortControllersRef.current[jobId] === controller) {
          delete abortControllersRef.current[jobId]
        }
        setBgJobs(prev => ({ ...prev, [jobId]: { status: 'done', result, error: null } }))
      })
      .catch(err => {
        if (abortControllersRef.current[jobId] === controller) {
          delete abortControllersRef.current[jobId]
        }
        if (err.name === 'AbortError') {
          setBgJobs(prev => ({ ...prev, [jobId]: { status: 'cancelled', result: null, error: 'Cancelled by user' } }))
        } else {
          setBgJobs(prev => ({ ...prev, [jobId]: { status: 'error', result: null, error: err.message || String(err) } }))
        }
      })
  }, [])

  /** Abort / cancel an ongoing background job */
  const cancelBgJob = useCallback((jobId) => {
    if (abortControllersRef.current[jobId]) {
      abortControllersRef.current[jobId].abort()
      delete abortControllersRef.current[jobId]
    }
    setBgJobs(prev => ({ ...prev, [jobId]: { status: 'cancelled', result: null, error: 'Cancelled by user' } }))
  }, [])

  /** Dismiss / clear a finished job so it doesn't re-apply on the next visit */
  const clearBgJob = useCallback((jobId) => {
    setBgJobs(prev => { const next = { ...prev }; delete next[jobId]; return next })
  }, [])

  const [creatorData, setCreatorData] = useState(() => {
    try {
      const cached = localStorage.getItem('forge_creator_data')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed.recommendations && !areRecsValidForCreator(parsed.recommendations, parsed)) {
          parsed.recommendations = null
          parsed.blueprint = null
          parsed.productName = ''
        }
        return parsed
      }
      return {
        url: '',
        platform: null,
        handle: '',
        name: '',
        followers: 0,
        avatar: null,
        niche: '',
        recentPosts: [],
        engagementRate: 0,
        brandColor: null,
        blueprint: null,
        productName: '',
        buildItems: [],
      }
    } catch {
      return {
        url: '',
        platform: null,
        handle: '',
        name: '',
        followers: 0,
        avatar: null,
        niche: '',
        recentPosts: [],
        engagementRate: 0,
        brandColor: null,
        blueprint: null,
        productName: '',
        buildItems: [],
      }
    }
  })

  // MongoDB Dashboard State Store
  const [dashboardData, setDashboardData] = useState({
    calendar_data: {},
    studio_data: {},
    community_data: {},
    marketing_data: {},
    products_data: {},
    accounts_platforms: {},
    youtube_connection: null,
    meta_connection: null
  })

  const saveDebounceMapRef = useRef({})

  // Directly save a dashboard section into MongoDB Atlas user_profiles (debounced per section)
  const saveDashboardData = useCallback((section, data) => {
    setDashboardData(prev => ({
      ...prev,
      [section === 'calendar' ? 'calendar_data' :
       section === 'studio' ? 'studio_data' :
       section === 'community' ? 'community_data' :
       section === 'marketing' ? 'marketing_data' :
       section === 'products' ? 'products_data' :
       section === 'accounts' ? 'accounts_platforms' : `${section}_data`]: data
    }))
    const uname = userProfile?.username || ''
    const handle = creatorData?.handle || 'default'

    if (saveDebounceMapRef.current[section]) {
      clearTimeout(saveDebounceMapRef.current[section])
    }

    return new Promise((resolve) => {
      saveDebounceMapRef.current[section] = setTimeout(async () => {
        try {
          const res = await saveDashboardSection(uname, handle, section, data)
          resolve(res)
        } catch (_) {
          resolve(false)
        }
      }, 800)
    })
  }, [userProfile?.username, creatorData?.handle])

  // Synchronize localStorage configuration to the backend SQLite database
  const syncSessionToDb = useCallback((currentUsername, currentCreatorData) => {
    const activeUser = currentUsername || userProfile?.username
    if (!activeUser) return // Guest session, skip sync

    const cData = currentCreatorData || creatorData
    const h = cData?.handle || 'default'
    const hLower = h.toLowerCase()

    const calendar_data = {}
    const launch_pack_data = {}
    const studio_data = {}
    const chat_data = {}

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('forge_calendar_')) {
        calendar_data[key] = localStorage.getItem(key)
      } else if (key && (key.startsWith(`forge_${h}_launch_pack`) || key.startsWith(`forge_${hLower}_launch_pack`) || key.startsWith(`forge_${h}_launch_image`) || key.startsWith(`forge_${hLower}_launch_image`))) {
        launch_pack_data[key] = localStorage.getItem(key)
      } else if (key && (key.startsWith(`forge_${h}_studio_`) || key.startsWith(`forge_${hLower}_studio_`))) {
        studio_data[key] = localStorage.getItem(key)
      } else if (key && (key.startsWith('forge_chat_') || key.includes('_chat_messages') || key.includes('_coach_messages'))) {
        chat_data[key] = localStorage.getItem(key)
      }
    }

    const payload = {
      username: activeUser,
      creator_data: cData,
      calendar_data,
      launch_pack_data,
      studio_data,
      chat_data
    }

    try {
      const activeEmail = userProfile?.email || activeUser
      const clean = activeEmail ? activeEmail.toLowerCase().replace(/[^a-z0-9_]/g, '_') : null
      const userYt = (clean && localStorage.getItem(`forge_youtube_connection_${clean}`)) || 
                     (dashboardData?.youtube_connection?.connected ? JSON.stringify(dashboardData.youtube_connection) : null)
      if (userYt) {
        payload.youtube_connection = typeof userYt === 'string' ? JSON.parse(userYt) : userYt
      }
    } catch (_) {}
    try {
      const activeEmail = userProfile?.email || activeUser
      const clean = activeEmail ? activeEmail.toLowerCase().replace(/[^a-z0-9_]/g, '_') : null
      const userMeta = (clean && localStorage.getItem(`forge_meta_connection_${clean}`)) ||
                       (dashboardData?.meta_connection?.facebook?.connected ? JSON.stringify(dashboardData.meta_connection) : null)
      if (userMeta) {
        payload.meta_connection = typeof userMeta === 'string' ? JSON.parse(userMeta) : userMeta
      }
    } catch (_) {}
    try {
      const activeEmail = userProfile?.email || activeUser
      const clean = activeEmail ? activeEmail.toLowerCase().replace(/[^a-z0-9_]/g, '_') : null
      const userPlatforms = (clean && localStorage.getItem(`forge_accounts_platforms_${clean}`)) ||
                            (dashboardData?.accounts_platforms ? JSON.stringify(dashboardData.accounts_platforms) : null) ||
                            localStorage.getItem('forge_accounts_platforms')
      if (userPlatforms) payload.accounts_platforms = typeof userPlatforms === 'string' ? JSON.parse(userPlatforms) : userPlatforms
    } catch (_) {}

    fetch('/api/auth/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .catch(err => {
        console.error('[Forge] Session sync failed:', err)
      })
  }, [userProfile, creatorData])

  const incrementAiActions = useCallback(() => {
    setAiActionsCount(prev => {
      const nextCount = prev + 1
      localStorage.setItem('forge_ai_actions', nextCount.toString())
      return nextCount
    })
    // Also trigger database sync if registered!
    if (userProfile?.username) {
      setTimeout(() => syncSessionToDb(), 200)
    }
  }, [userProfile, syncSessionToDb])

  // Navigate function that updates pathname using history pushState
  const navigate = useCallback((newStep) => {
    setStep(newStep)
    try {
      if (newStep !== 'login' && newStep !== 'signup' && newStep !== 'welcome') {
        localStorage.setItem('forge_onboarding_step', newStep)
      } else if (newStep === 'welcome') {
        localStorage.removeItem('forge_onboarding_step')
      }
    } catch {}
    let path = '/portal'
    if (newStep === 'welcome') {
      const savedStep = localStorage.getItem('forge_onboarding_step')
      const savedCreator = localStorage.getItem('forge_creator_data')
      newStep = (savedStep && savedCreator && ['analyzing', 'blueprint', 'preview', 'building', 'pre-finish', 'celebration'].includes(savedStep)) ? savedStep : 'creator-link'
      path = '/portal'
    } else if (newStep === 'creator-link' || ['analyzing', 'blueprint', 'preview', 'building', 'pre-finish', 'celebration'].includes(newStep)) {
      path = '/portal'
    } else if (newStep === 'login') {
      path = '/login'
    } else if (newStep === 'signup') {
      path = '/signup'
    } else if (newStep === 'dashboard') {
      const hasSession = Boolean(userProfile || (localStorage.getItem('forge_active_session') === 'true' && localStorage.getItem('forge_user_profile')))
      if (!hasSession) {
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.replace('/login')
        }
        return
      }
      const cleanHandle = (creatorData?.handle || creatorData?.name || 'creator')
        .replace(/^@+/, '')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '') || 'creator'
      const cId = creatorData?.id || creatorData?.channelId || creatorData?._id || ('cr_' + cleanHandle)
      path = cId ? `/dashboard/${cId}` : '/dashboard'
    }

    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path)
    }
  }, [creatorData, userProfile])

  useEffect(() => {
    if (step === 'dashboard' && typeof window !== 'undefined') {
      const hasSession = Boolean(userProfile || (localStorage.getItem('forge_active_session') === 'true' && localStorage.getItem('forge_user_profile')))
      if (!hasSession) {
        window.location.replace('/login')
        return
      }
      try {
        localStorage.setItem('forge_onboarding_step', 'dashboard')
      } catch {}
      const cleanHandle = (creatorData?.handle || creatorData?.name || 'creator')
        .replace(/^@+/, '')
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '') || 'creator'
      const cId = creatorData?.id || creatorData?.channelId || creatorData?._id || ('cr_' + cleanHandle)
      if (cId) {
        const targetPath = `/dashboard/${cId}`
        const currentSearch = window.location.search || ''
        if (window.location.pathname !== targetPath) {
          window.history.replaceState(null, '', `${targetPath}${currentSearch}`)
        }
      }
    }
  }, [step, userProfile, creatorData?.id, creatorData?.channelId, creatorData?._id, creatorData?.handle, creatorData?.name])

  const next = () => {
    if (step === 'celebration') {
      const mockUsername = (creatorData.handle || creatorData.name || 'creatorforgeweb')
        .toLowerCase()
        .replace(/^@/, '')
        .replace(/[^a-z0-9_-]/g, '') || 'creatorforgeweb'

      const profile = {
        username: mockUsername,
        email: '',
        password: '',
        needsCredentials: true
      }

      // Gather existing localStorage data so they are registered in the DB too
      const h = creatorData?.handle || 'default'
      const hLower = h.toLowerCase()
      const calendar_data = {}
      const launch_pack_data = {}
      const studio_data = {}
      const chat_data = {}

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('forge_calendar_')) {
          calendar_data[key] = localStorage.getItem(key)
        } else if (key && (key.startsWith(`forge_${h}_launch_pack`) || key.startsWith(`forge_${hLower}_launch_pack`) || key.startsWith(`forge_${h}_launch_image`) || key.startsWith(`forge_${hLower}_launch_image`))) {
          launch_pack_data[key] = localStorage.getItem(key)
        } else if (key && (key.startsWith(`forge_${h}_studio_`) || key.startsWith(`forge_${hLower}_studio_`))) {
          studio_data[key] = localStorage.getItem(key)
        } else if (key && (key.startsWith('forge_chat_') || key.includes('_chat_messages') || key.includes('_coach_messages'))) {
          chat_data[key] = localStorage.getItem(key)
        }
      }

      localStorage.setItem('forge_user_profile', JSON.stringify(profile))
      localStorage.setItem('forge_active_session', 'true')
      localStorage.setItem('forge_creator_data', JSON.stringify(creatorData))
      localStorage.setItem('forge_onboarding_step', 'dashboard')

      // Wait for registration to complete in DB to prevent race conditions
      fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: mockUsername,
          email: '',
          password: '',
          creator_data: creatorData,
          calendar_data,
          launch_pack_data,
          studio_data,
          chat_data
        })
      })
        .then(res => res.json())
        .then(data => {
          console.log('[Forge] Auto-registered creator account (pending credentials):', data)
          setUserProfile(profile)
          navigate('dashboard')
        })
        .catch(err => {
          console.warn('[Forge] Auto-registration notice, continuing to dashboard:', err)
          setUserProfile(profile)
          navigate('dashboard')
        })
    } else {
      const idx = STEPS.indexOf(step)
      if (idx < STEPS.length - 1) navigate(STEPS[idx + 1])
    }
  }

  const prev = useCallback(() => {
    if (step === 'signup' || step === 'login') {
      navigate('celebration')
    } else if (step === 'blueprint' || step === 'analyzing') {
      navigate('creator-link')
    } else if (step === 'creator-link') {
      return
    } else {
      const idx = STEPS.indexOf(step)
      if (idx > 0) navigate(STEPS[idx - 1])
    }
  }, [step, navigate])

  const resetCreator = useCallback(() => {
    try {
      localStorage.removeItem('forge_creator_data')
      localStorage.removeItem('forge_recommendations')
      localStorage.removeItem('forge_products_members')
      localStorage.removeItem('forge_onboarding_step')
      localStorage.removeItem('forge_onboarding_timestamp')
      localStorage.removeItem('forge_ai_actions')
      localStorage.removeItem('forge_user_profile')
      localStorage.removeItem('forge_active_session')
      localStorage.removeItem('forge_dashboard_active_tab')

      // Purge any creator-specific or cached data in localStorage and sessionStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i)
        if (k && (
          k.startsWith('forge_creator_') ||
          k.startsWith('forge_video_') ||
          k.startsWith('forge_channel_') ||
          k.startsWith('forge_calendar_') ||
          k.includes('_launch_pack') ||
          k.includes('_launch_image') ||
          k.includes('_studio_')
        )) {
          localStorage.removeItem(k)
        }
      }
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const k = sessionStorage.key(i)
        if (k && (
          k.startsWith('forge_creator_') ||
          k.startsWith('forge_video_') ||
          k.startsWith('forge_channel_')
        )) {
          sessionStorage.removeItem(k)
        }
      }
      localStorage.setItem('forge_onboarding_step', 'creator-link')
    } catch (e) {
      console.warn('[Forge] Error during resetCreator storage purge:', e)
    }

    setUserProfile(null)
    setResetKey(k => k + 1)
    setCreatorData({
      url: '',
      platform: null,
      handle: '',
      name: '',
      followers: 0,
      avatar: null,
      avatarUrl: '',
      niche: '',
      recentPosts: [],
      engagementRate: 0,
      brandColor: null,
      blueprint: null,
      productName: '',
      buildItems: [],
      id: null,
    })
    navigate('creator-link')
  }, [navigate])

  const goTo = (s) => navigate(s)

  const updateCreator = (data) => {
    setCreatorData(prev => {
      if (!data) return prev
      const prevH = (prev?.handle || '').toLowerCase().replace(/^@/, '').trim()
      const newH = (data?.handle || '').toLowerCase().replace(/^@/, '').trim()
      const prevUrl = (prev?.url || '').toLowerCase().trim()
      const newUrl = (data?.url || '').toLowerCase().trim()

      const isDifferentCreator = Boolean(
        (prevH && newH && prevH !== newH) ||
        (prevUrl && newUrl && prevUrl !== newUrl)
      )

      if (isDifferentCreator) {
        try {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i)
            if (k && (
              k.startsWith('forge_calendar_') ||
              k.startsWith('forge_campaign_posts_') ||
              k.includes('_launch_pack') ||
              k.includes('_launch_image') ||
              k.includes('_studio_')
            )) {
              localStorage.removeItem(k)
            }
          }
        } catch (_) {}
      }

      const base = isDifferentCreator ? {
        url: '',
        platform: null,
        handle: '',
        name: '',
        followers: 0,
        avatar: null,
        avatarUrl: '',
        avatar_url: '',
        description: '',
        bio: '',
        niche: '',
        recentPosts: [],
        engagementRate: 0,
        brandColor: null,
        blueprint: null,
        productName: '',
        buildItems: [],
      } : (prev || {})

      const updated = { ...base, ...data }
      try {
        if (updated && (updated.handle || updated.url || updated.name)) {
          localStorage.setItem('forge_creator_data', JSON.stringify(updated))
        }
      } catch (e) {
        console.warn('[Forge] Failed to persist creator data:', e)
      }
      return updated
    })
  }

  // Handle URL navigation popstate and session restores (without wiping saved creator)
  useEffect(() => {
    const handleNavigation = () => {
      const path = window.location.pathname
      const search = window.location.search
      const cachedCreator = localStorage.getItem('forge_creator_data')

      // Google OAuth Return Callback Handler (?code=... or ?error=...)
      if (search && (search.includes('code=') || search.includes('error='))) {
        let returnPath = ''
        let targetTab = 'accounts'
        try {
          const params = new URLSearchParams(search)
          const state = params.get('state')
          if (state) {
            const decoded = decodeURIComponent(state)
            if (decoded.includes('tab=')) {
              const urlParts = decoded.split('?')
              const searchP = new URLSearchParams(urlParts[1])
              targetTab = searchP.get('tab') || 'accounts'
            }
            if (decoded.startsWith('/dashboard')) returnPath = decoded.split('?')[0]
          }
          if (!returnPath) {
            returnPath = sessionStorage.getItem('forge_oauth_return_path') || localStorage.getItem('forge_oauth_return_path')
          }
        } catch (_) {}

        if (!returnPath && cachedCreator) {
          try {
            const parsed = JSON.parse(cachedCreator)
            if (parsed?.id) returnPath = `/dashboard/${parsed.id}`
          } catch (_) {}
        }
        if (!returnPath) returnPath = '/dashboard'

        setStep('dashboard')
        setActiveTab(targetTab)
        try { localStorage.setItem('forge_onboarding_step', 'dashboard') } catch {}
        try { localStorage.setItem('forge_dashboard_active_tab', targetTab) } catch {}

        const pathParts = returnPath.split('?')[0].split('/').filter(Boolean)
        if (pathParts[0] === 'dashboard' && pathParts[1]) {
          const routeCreatorId = pathParts[1]
          setCreatorData(prev => {
            if (prev?.id === routeCreatorId) return prev
            const updated = { ...(prev || {}), id: routeCreatorId }
            try { localStorage.setItem('forge_creator_data', JSON.stringify(updated)) } catch {}
            return updated
          })
        }

        // Check if there is an auth code to exchange
        const params = new URLSearchParams(search)
        const code = params.get('code')
        if (code) {
          const authEmail = userProfile?.email || userProfile?.username || ''
          exchangeYouTubeAuthCode(code, null, authEmail)
            .then(async (channel) => {
              console.log('[YouTube OAuth] Channel connected:', channel?.title)
              if (channel) {
                setCreatorData(prev => {
                  const updated = {
                    ...(prev || {}),
                    name: channel.title || prev?.name,
                    creator_name: channel.title || prev?.creator_name,
                    channel_title: channel.title,
                    handle: channel.customUrl || prev?.handle,
                    youtube_handle: channel.customUrl || prev?.youtube_handle,
                    avatar: channel.thumbnail || prev?.avatar,
                    avatarUrl: channel.thumbnail || prev?.avatarUrl,
                    subscribers: channel.subscriberCount !== undefined ? String(channel.subscriberCount) : prev?.subscribers,
                    video_count: channel.videoCount !== undefined ? String(channel.videoCount) : prev?.video_count,
                    youtube_channel_id: channel.id || prev?.youtube_channel_id,
                    email: channel.email || prev?.email,
                    youtube_connected: true
                  }
                  try { localStorage.setItem('forge_creator_data', JSON.stringify(updated)) } catch {}
                  return updated
                })

                try {
                  const { studyConnectedChannelAndBuildAssets } = await import('./services/channelStudyService')
                  await studyConnectedChannelAndBuildAssets({
                    channel,
                    platform: 'youtube',
                    creatorData,
                    userProfile,
                    updateCreator: (up) => setCreatorData(prev => ({ ...(prev || {}), ...up })),
                    saveDashboardData: (section, data) => setDashboardData(prev => ({ ...prev, [section]: data }))
                  })
                } catch (e) {
                  console.warn('[YouTube Study Notice]', e)
                }
              }
            })
            .catch(err => {
              console.warn('[YouTube OAuth] Code exchange notice:', err)
            })
        }

        window.history.replaceState(null, '', returnPath)
        return
      }

      if (path === '/' || path === '' || path === '/portal' || path === '/portal/') {
        // Base URL app.co-launch.app always routes to onboarding page /portal (no login page)
        const savedStep = localStorage.getItem('forge_onboarding_step')
        if (savedStep && cachedCreator && ['analyzing', 'blueprint', 'preview', 'building', 'pre-finish', 'celebration'].includes(savedStep)) {
          setStep(savedStep)
        } else {
          setStep('creator-link')
        }
        if (typeof window !== 'undefined' && window.location.pathname !== '/portal') {
          window.history.replaceState(null, '', '/portal')
        }
      } else if (path === '/login') {
        setStep('login')
      } else if (path === '/signup') {
        setStep('signup')
      } else if (path === '/dashboard' || path.startsWith('/dashboard/')) {
        const hasSession = Boolean(localStorage.getItem('forge_active_session') === 'true' && localStorage.getItem('forge_user_profile'))
        if (!hasSession) {
          window.location.replace('/login')
          return
        }
        setStep('dashboard')
        try { localStorage.setItem('forge_onboarding_step', 'dashboard') } catch {}
        const pathParts = path.split('/').filter(Boolean)
        if (pathParts[0] === 'dashboard' && pathParts[1]) {
          const routeCreatorId = pathParts[1]
          setCreatorData(prev => {
            if (prev && prev.id === routeCreatorId) return prev
            const updated = { ...(prev || {}), id: routeCreatorId }
            try { localStorage.setItem('forge_creator_data', JSON.stringify(updated)) } catch {}
            return updated
          })
        }
      } else {
        // Dedicated standalone routes (ops, launch, portal, crm, etc.) must NEVER be redirected to /portal
        if (
          path.startsWith('/ops') ||
          path.startsWith('/launch') ||
          path.startsWith('/creator-launch') ||
          path.startsWith('/portal/') ||
          path.startsWith('/co-launch/') ||
          path.startsWith('/preorder/') ||
          path.startsWith('/beta/') ||
          path.startsWith('/survey/') ||
          path.startsWith('/crm') ||
          path.startsWith('/follow-up-crm') ||
          path.startsWith('/project-os') ||
          path.startsWith('/projects') ||
          path.startsWith('/project/') ||
          path.startsWith('/participation-manager') ||
          path.startsWith('/cobuilder-admin') ||
          path.startsWith('/co-builders') ||
          path.startsWith('/admin-error-log') ||
          path.startsWith('/error-log') ||
          path.startsWith('/errors') ||
          path.startsWith('/join/')
        ) {
          return
        }

        const rawParts = path.split('/').filter(Boolean)
        const reservedRoutes = [
          'join', 'portal', 'co-launch', 'preorder', 'beta', 'survey', 'research',
          'follow-up-crm', 'crm', 'admin-error-log', 'error-log', 'errors',
          'project-os', 'projects', 'project', 'participation-manager', 'co-builders',
          'cobuilder-admin', 'participation', 'launch', 'creator-launch', 'ops',
          'dashboard', 'login', 'signup', 'api', 'static'
        ]
        if (rawParts.length === 2 && !reservedRoutes.includes(rawParts[0])) {
          const hasSession = Boolean(localStorage.getItem('forge_active_session') === 'true' && localStorage.getItem('forge_user_profile'))
          if (!hasSession) {
            window.location.replace('/login')
            return
          }
          const routeCreatorId = rawParts[1]
          setStep('dashboard')
          try { localStorage.setItem('forge_onboarding_step', 'dashboard') } catch {}
          setCreatorData(prev => {
            const updated = { ...(prev || {}), id: routeCreatorId }
            try { localStorage.setItem('forge_creator_data', JSON.stringify(updated)) } catch {}
            return updated
          })
          window.history.replaceState(null, '', `/dashboard/${routeCreatorId}`)
          return
        }

        // Base URL / or unrecognized path: Go to onboarding page (no login page)
        const savedStep = localStorage.getItem('forge_onboarding_step')
        const savedCreator = localStorage.getItem('forge_creator_data')
        if (savedStep && savedCreator && ['analyzing', 'blueprint', 'preview', 'building', 'pre-finish', 'celebration'].includes(savedStep)) {
          setStep(savedStep)
        } else {
          setStep('creator-link')
        }
        if (typeof window !== 'undefined' && window.location.pathname !== '/portal') {
          window.history.replaceState(null, '', '/portal')
        }
      }
    }

    handleNavigation()
    window.addEventListener('popstate', handleNavigation)
    return () => window.removeEventListener('popstate', handleNavigation)
  }, [])

  // Warn on page reload/refresh if onboarding is active with implications notice
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (step !== 'dashboard' && step !== 'login' && step !== 'signup' && (creatorData?.handle || creatorData?.url)) {
        e.preventDefault()
        e.returnValue = 'Your current setup remains safely stored in local storage. To start fresh, use the Reset Creator button.'
        return e.returnValue
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [step, creatorData?.handle, creatorData?.url])

  // Dynamically synchronize root CSS variables with creator's accent color
  useEffect(() => {
    const acc = getAccent(creatorData)
    if (acc?.color && acc?.rgb) {
      document.documentElement.style.setProperty('--theme-accent', acc.color)
      document.documentElement.style.setProperty('--theme-accent-bg', `rgba(${acc.rgb}, 0.12)`)
      document.documentElement.style.setProperty('--theme-accent-border', `rgba(${acc.rgb}, 0.28)`)
      document.documentElement.style.setProperty(
        '--theme-btn-primary-text',
        getContrastTextColor(acc.color)
      )
    }
  }, [creatorData?.brandColor, creatorData?.brand_color, creatorData?.brandHex, creatorData?.avatarUrl, creatorData?.platform])

  // Wipe Creator Modal State
  const [wipeModalOpen, setWipeModalOpen] = useState(false)
  const requestWipeCreator = useCallback(() => {
    setWipeModalOpen(true)
  }, [])
  const confirmWipeCreator = useCallback(() => {
    setWipeModalOpen(false)
    resetCreator()
    triggerToast('Creator data successfully wiped. Starting fresh.', 'success')
  }, [resetCreator, triggerToast])

  // Dynamically update document title and SEO metadata on route or step change
  useEffect(() => {
    const seo = getRouteSEO(window.location.pathname, step, creatorData)
    updatePageSEO(seo)
  }, [step, creatorData?.name, creatorData?.handle, creatorData?.productName])

  // Auto-save creatorData updates
  useEffect(() => {
    if (creatorData && (creatorData.handle || creatorData.url)) {
      localStorage.setItem('forge_creator_data', JSON.stringify(creatorData))
    }
  }, [creatorData])

  // Persist onboarding step to localStorage
  useEffect(() => {
    try {
      const isOnboardingStep = ['welcome', 'creator-link', 'analyzing', 'blueprint', 'preview', 'building', 'pre-finish', 'celebration'].includes(step)
      if (isOnboardingStep) {
        localStorage.setItem('forge_onboarding_step', step)
      } else if (step === 'dashboard' || step === 'login' || step === 'signup') {
        localStorage.removeItem('forge_onboarding_step')
        localStorage.removeItem('forge_onboarding_timestamp')
      }
    } catch (e) {
      console.warn('[Forge] Failed to save onboarding step:', e)
    }
  }, [step])

  // Restore full profile data from DB if user is logged in
  useEffect(() => {
    if (userProfile?.username) {
      fetch(`/api/auth/profile/${encodeURIComponent(userProfile.username)}`)
        .then(res => {
          if (!res.ok) {
            console.warn('[Forge] User profile not found on server, maintaining active local session')
            return null
          }
          return res.json()
        })
        .then(data => {
          if (!data) return
          console.log('[Forge] Restored user profile session from database:', data)
          if (data.status === 'success') {
            // Restore creatorData, calendar, launch pack, and studio copies from DB to localStorage
            if (data.creator_data && (data.creator_data.handle || data.creator_data.url)) {
              localStorage.setItem('forge_creator_data', JSON.stringify(data.creator_data))
              setCreatorData(prev => ({ ...prev, ...data.creator_data }))
            } else {
              localStorage.removeItem('forge_creator_data')
              setCreatorData({
                url: '',
                platform: null,
                handle: '',
                name: '',
                followers: 0,
                avatar: null,
                niche: '',
                recentPosts: [],
                engagementRate: 0,
                brandColor: null,
                blueprint: null,
                productName: '',
                buildItems: [],
              })
            }
            if (data.calendar_data) {
              Object.entries(data.calendar_data).forEach(([key, val]) => {
                if (key && val) localStorage.setItem(key, val)
              })
            }
            if (data.launch_pack_data) {
              Object.entries(data.launch_pack_data).forEach(([key, val]) => {
                if (key && val) localStorage.setItem(key, val)
              })
            }
            if (data.studio_data) {
              Object.entries(data.studio_data).forEach(([key, val]) => {
                if (key && val) localStorage.setItem(key, val)
              })
            }
            const cleanUser = (data.email || data.username || '').toLowerCase().replace(/[^a-z0-9_]/g, '_')

            // Restore or clear YouTube connection strictly for this user
            if (data.youtube_connection && data.youtube_connection.connected) {
              if (cleanUser) localStorage.setItem(`forge_youtube_connection_${cleanUser}`, JSON.stringify(data.youtube_connection))
              localStorage.setItem('forge_youtube_connection', JSON.stringify(data.youtube_connection))
              window.dispatchEvent(new CustomEvent('forge_youtube_connected', { detail: data.youtube_connection }))
            } else if (data.creator_data?.youtube_connected) {
              const ytPayload = {
                connected: true,
                channel: {
                  id: data.creator_data.youtube_channel_id,
                  title: data.creator_data.channel_title || data.creator_data.name,
                  customUrl: data.creator_data.youtube_handle || data.creator_data.handle,
                  thumbnail: data.creator_data.avatar || data.creator_data.avatarUrl,
                  subscriberCount: data.creator_data.subscribers,
                  videoCount: data.creator_data.video_count
                }
              }
              if (cleanUser) localStorage.setItem(`forge_youtube_connection_${cleanUser}`, JSON.stringify(ytPayload))
              localStorage.setItem('forge_youtube_connection', JSON.stringify(ytPayload))
              window.dispatchEvent(new CustomEvent('forge_youtube_connected', { detail: ytPayload }))
            } else {
              if (cleanUser) localStorage.removeItem(`forge_youtube_connection_${cleanUser}`)
              localStorage.removeItem('forge_youtube_connection')
              window.dispatchEvent(new CustomEvent('forge_youtube_disconnected'))
            }

            // Restore or clear Meta / Facebook connection strictly for this user
            if (data.meta_connection && (data.meta_connection.facebook?.connected || data.meta_connection.connected)) {
              if (cleanUser) localStorage.setItem(`forge_meta_connection_${cleanUser}`, JSON.stringify(data.meta_connection))
              localStorage.setItem('forge_meta_connection', JSON.stringify(data.meta_connection))
              window.dispatchEvent(new CustomEvent('forge_meta_connected', { detail: data.meta_connection }))
            } else if (data.creator_data?.facebook_connected) {
              const metaPayload = {
                facebook: {
                  connected: true,
                  pageId: data.creator_data.facebook_page_id,
                  pageName: data.creator_data.facebook_page_name,
                  accessToken: data.creator_data.facebook_access_token
                },
                ...(data.creator_data.instagram_connected ? {
                  instagram: {
                    connected: true,
                    businessId: data.creator_data.instagram_business_id,
                    username: data.creator_data.instagram_username || '@instagram',
                    accessToken: data.creator_data.instagram_access_token
                  }
                } : {})
              }
              if (cleanUser) localStorage.setItem(`forge_meta_connection_${cleanUser}`, JSON.stringify(metaPayload))
              localStorage.setItem('forge_meta_connection', JSON.stringify(metaPayload))
              window.dispatchEvent(new CustomEvent('forge_meta_connected', { detail: metaPayload }))
            } else {
              if (cleanUser) localStorage.removeItem(`forge_meta_connection_${cleanUser}`)
              localStorage.removeItem('forge_meta_connection')
              window.dispatchEvent(new CustomEvent('forge_meta_disconnected'))
            }

            // Restore or clear platform configurations across logins
            if (data.accounts_platforms) {
              if (cleanUser) localStorage.setItem(`forge_accounts_platforms_${cleanUser}`, JSON.stringify(data.accounts_platforms))
              localStorage.setItem('forge_accounts_platforms', JSON.stringify(data.accounts_platforms))
            } else {
              if (cleanUser) localStorage.removeItem(`forge_accounts_platforms_${cleanUser}`)
              localStorage.removeItem('forge_accounts_platforms')
            }

            if (data.ai_keys) {
              updateAiKeys(data.ai_keys)
            }

            // Hydrate central dashboard MongoDB state
            setDashboardData({
              calendar_data: data.calendar_data || {},
              studio_data: data.studio_data || {},
              community_data: data.community_data || {},
              marketing_data: data.marketing_data || {},
              products_data: data.products_data || {},
              accounts_platforms: data.accounts_platforms || {},
              youtube_connection: data.youtube_connection || null,
              meta_connection: data.meta_connection || null
            })

            setDbLoadedTimestamp(Date.now())
          }
        })
        .catch(err => {
          console.warn('[Forge] Profile sync notice (non-fatal, local session preserved):', err)
        })
    }
  }, [userProfile, updateAiKeys])

  // Logout callback - completely purges all caches so new user starts 100% clean
  const logout = useCallback(() => {
    clearInMemoryKeys()
    clearInMemoryAiKeys()
    setAiKeysState({
      geminiKey: '',
      togetherKey: '',
      openaiKey: '',
      anthropicKey: '',
    })

    // Wipe all session & cache keys so no previous user data persists
    localStorage.removeItem('forge_active_session')
    localStorage.removeItem('forge_user_profile')
    localStorage.removeItem('forge_logged_in_via_code')
    localStorage.removeItem('forge_login_timestamp')
    localStorage.removeItem('forge_ai_keys')
    localStorage.removeItem('forge_youtube_connection')
    localStorage.removeItem('forge_meta_connection')
    localStorage.removeItem('forge_accounts_platforms')
    localStorage.removeItem('forge_creator_data')
    localStorage.removeItem('creator_forge_data')
    localStorage.removeItem('forge_dashboard_data')
    localStorage.removeItem('forge_calendar_items')
    localStorage.removeItem('forge_studio_posts')

    try {
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && (
          k.startsWith('forge_youtube_connection_') ||
          k.startsWith('forge_meta_connection_') ||
          k.startsWith('forge_accounts_platforms_') ||
          k.startsWith('forge_creator_videos_') ||
          k.startsWith('forge_audience_intel_')
        )) {
          keysToRemove.push(k)
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k))
    } catch (_) {}

    try { sessionStorage.clear() } catch {}
    setUserProfile(null)

    // Notify all components that channels are disconnected
    window.dispatchEvent(new CustomEvent('forge_youtube_disconnected'))
    window.dispatchEvent(new CustomEvent('forge_meta_disconnected'))

    setDashboardData({
      calendar_data: {},
      studio_data: {},
      community_data: {},
      marketing_data: {},
      products_data: {},
      accounts_platforms: {},
      youtube_connection: null,
      meta_connection: null
    })

    setCreatorData({
      url: '',
      platform: null,
      handle: '',
      name: '',
      followers: 0,
      avatar: null,
      niche: '',
      recentPosts: [],
      engagementRate: 0,
      brandColor: null,
      blueprint: null,
      productName: '',
      buildItems: [],
    })
    setBgJobs({})
    setAiActionsCount(0)

    if (typeof window !== 'undefined') {
      window.location.replace('/login')
    } else {
      navigate('login')
    }
  }, [navigate])

  // Unified brand color is applied consistently across all portal & dashboard pages
  const accent = getAccent(creatorData)
  const ctx = {
    step,
    next,
    prev,
    goTo,
    creatorData,
    updateCreator,
    resetCreator,
    requestWipeCreator,
    wipeModalOpen,
    setWipeModalOpen,
    accent,
    bgJobs,
    startBgJob,
    cancelBgJob,
    clearBgJob,
    logout,
    userProfile,
    setUserProfile,
    isRegistered,
    aiActionsCount,
    incrementAiActions,
    syncSessionToDb,
    apiModalOpen,
    setApiModalOpen,
    triggerToast,
    aiKeys,
    updateAiKeys,
    dbLoadedTimestamp,
    activeTab,
    setActiveTab,
    preloadStudioType,
    setPreloadStudioType,
    chatOpen,
    setChatOpen,
    dashboardData,
    setDashboardData,
    saveDashboardData
  }

  // /:creatorhandle/:id route — public creator application & live hub url redirects directly to creator dashboard
  if (typeof window !== 'undefined') {
    const rawParts = window.location.pathname.split('/').filter(Boolean)
    const reservedRoutes = [
      'join', 'portal', 'co-launch', 'preorder', 'beta', 'survey', 'research',
      'follow-up-crm', 'crm', 'admin-error-log', 'error-log', 'errors',
      'project-os', 'projects', 'project', 'participation-manager', 'co-builders',
      'cobuilder-admin', 'participation', 'launch', 'creator-launch', 'ops',
      'dashboard', 'login', 'signup', 'api', 'static'
    ]
    if (rawParts.length === 2 && !reservedRoutes.includes(rawParts[0])) {
      const hasSession = Boolean(userProfile || (localStorage.getItem('forge_active_session') === 'true' && localStorage.getItem('forge_user_profile')))
      if (!hasSession) {
        if (window.location.pathname !== '/login') {
          window.location.replace('/login')
        }
        return (
          <ForgeContext.Provider value={ctx}>
            <Login />
          </ForgeContext.Provider>
        )
      }
      const routeCreatorId = rawParts[1]
      if (window.location.pathname !== `/dashboard/${routeCreatorId}`) {
        window.history.replaceState(null, '', `/dashboard/${routeCreatorId}`)
      }
      return (
        <ForgeContext.Provider value={ctx}>
          <DashboardLayout />
          <WipeCreatorModal 
            isOpen={wipeModalOpen} 
            onClose={() => setWipeModalOpen(false)} 
            onConfirm={confirmWipeCreator} 
            creatorData={creatorData} 
          />
          {globalToast && (
            <GlobalToast toast={globalToast} onClose={() => setGlobalToast(null)} />
          )}
        </ForgeContext.Provider>
      )
    }
  }

  // /join/:handle route — public community join page (no auth)
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/join/')) {
    const joinHandle = window.location.pathname.replace('/join/', '').replace(/\/$/, '')
    return <CommunityJoin handle={joinHandle} />
  }

  // /portal/:portalId route — dedicated Creator Co-Founder Portal (magic link with ID)
  if (typeof window !== 'undefined' && ((window.location.pathname.startsWith('/portal/') && window.location.pathname.replace('/portal/', '').trim()) || window.location.pathname.startsWith('/co-launch/'))) {
    const portalId = window.location.pathname.replace('/portal/', '').replace('/co-launch/', '').replace(/\/$/, '')
    if (portalId) {
      return <CreatorPortal portalId={portalId} />
    }
  }

  // /preorder/:slug route — live dynamic pre-order landing page & checkout
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/preorder')) {
    const slug = window.location.pathname.replace('/preorder/', '').replace('/preorder', '').replace(/\/$/, '')
    return <PreorderLandingPage slug={slug} />
  }

  // /beta/:slug or /beta route — live private Beta Testing & Feedback Workspace for invited backers
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/beta')) {
    const slug = window.location.pathname.replace('/beta/', '').replace('/beta', '').replace(/\/$/, '')
    return <BetaTestingPortal slug={slug} />
  }

  // /survey/:slug or /research/:slug route — live shareable audience discovery survey
  if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/survey') || window.location.pathname.startsWith('/research'))) {
    const slug = window.location.pathname.replace('/survey/', '').replace('/survey', '').replace('/research/', '').replace('/research', '').replace(/\/$/, '')
    return <PublicSurveyPage slug={slug} />
  }

  // /follow-up-crm or /crm route — standalone Creator Follow-Up & Reply Status CRM
  if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/follow-up-crm') || window.location.pathname === '/crm')) {
    return (
      <LaunchAuth>
        <FollowUpCRMPage />
      </LaunchAuth>
    )
  }

  // /admin-error-log or /error-log route — standalone Pipeline Intelligence & Exception Dashboard
  if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin-error-log') || window.location.pathname.startsWith('/error-log') || window.location.pathname === '/errors')) {
    return (
      <LaunchAuth>
        <AdminErrorLogPage />
      </LaunchAuth>
    )
  }

  // /project-os or /projects route — standalone Co-Launch Project Operations Center
  if (typeof window !== 'undefined' && (
    window.location.pathname.startsWith('/project-os') ||
    window.location.pathname.startsWith('/projects') ||
    window.location.pathname === '/project'
  )) {
    return (
      <LaunchAuth>
        <ProjectOSPage />
      </LaunchAuth>
    )
  }

  // /participation-manager, /co-builders, /participation route — dedicated admin creator participation & $50 pass console
  if (typeof window !== 'undefined' && (
    window.location.pathname.startsWith('/participation-manager') ||
    window.location.pathname.startsWith('/co-builders') ||
    window.location.pathname.startsWith('/cobuilder-admin') ||
    window.location.pathname === '/participation'
  )) {
    return (
      <LaunchAuth>
        <CreatorParticipationManager />
      </LaunchAuth>
    )
  }

  // /launch or /creator-launch route — standalone Creator Launch OS (Operator Master Command Center)
  if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/launch') || window.location.pathname.startsWith('/creator-launch'))) {
    return (
      <LaunchAuth>
        <CreatorLaunchLayout />
      </LaunchAuth>
    )
  }

  // /ops route — internal operator pipeline panel (login-protected)
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/ops')) {
    return (
      <OpsAuth>
        <OpsLayout />
      </OpsAuth>
    )
  }

  // /login route — dedicated standalone dark mode authentication page
  if (typeof window !== 'undefined' && (window.location.pathname === '/login' || step === 'login')) {
    return (
      <ForgeContext.Provider value={ctx}>
        <Login />
      </ForgeContext.Provider>
    )
  }

  if (step === 'dashboard') {
    const hasSession = Boolean(userProfile || (typeof localStorage !== 'undefined' && localStorage.getItem('forge_active_session') === 'true' && localStorage.getItem('forge_user_profile')))
    if (!hasSession) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.replace('/login')
      }
      return (
        <ForgeContext.Provider value={ctx}>
          <Login />
        </ForgeContext.Provider>
      )
    }
    return (
      <ForgeContext.Provider value={ctx}>
        <DashboardLayout />
        <WipeCreatorModal 
          isOpen={wipeModalOpen} 
          onClose={() => setWipeModalOpen(false)} 
          onConfirm={confirmWipeCreator} 
          creatorData={creatorData} 
        />
        {globalToast && (
          <GlobalToast toast={globalToast} onClose={() => setGlobalToast(null)} />
        )}
      </ForgeContext.Provider>
    )
  }

  const screens = {
    'welcome': <CreatorLink key={`creator-link-${resetKey}`} />,
    'creator-link': <CreatorLink key={`creator-link-${resetKey}`} />,
    'analyzing': <Analyzing />,
    'blueprint': <Blueprint />,
    'preview': <Preview />,
    'building': <Building />,
    'pre-finish': <PreFinish />,
    'celebration': <Celebration />,
    'signup': <Signup />,
    'login': <Login />,
  }

  return (
    <ForgeContext.Provider value={ctx}>
      <div className="min-h-screen bg-forge-bg text-white overflow-x-clip">
        {screens[step] || <CreatorLink key={`creator-link-${resetKey}`} />}
      </div>
      <SupportWidget currentStage={step} />
      <WipeCreatorModal 
        isOpen={wipeModalOpen} 
        onClose={() => setWipeModalOpen(false)} 
        onConfirm={confirmWipeCreator} 
        creatorData={creatorData} 
      />
      {globalToast && (
        <GlobalToast toast={globalToast} onClose={() => setGlobalToast(null)} />
      )}
    </ForgeContext.Provider>
  )
}
