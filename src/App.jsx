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

  // Clean solid theme accents (NO gradients, NO progress bar, matching user reference)
  const theme = isSuccess
    ? {
        accent: '#10b981', // solid emerald
        title: toast.title || 'Success',
      }
    : isError
      ? {
          accent: '#ef4444', // solid red
          title: toast.title || 'Error',
        }
      : {
          accent: '#3b82f6', // solid blue / info
          title: toast.title || 'Information',
        }

  return (
    <div
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto w-auto max-w-[90vw]"
      style={{
        animation: 'toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      <style>{`
        @keyframes toastSlideIn {
          0% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Solid card with solid left accent stripe, zero gradients, zero progress bar, zero border radius */}
      <div
        className="relative flex items-stretch rounded-none border-0 shadow-[0_20px_48px_rgba(0,0,0,0.7)] overflow-hidden"
        style={{
          background: '#0f121a',
          minWidth: 320,
          maxWidth: 440,
          borderRadius: '0px'
        }}
      >
        {/* Solid left accent vertical stripe */}
        <div
          className="w-1.5 shrink-0"
          style={{ background: theme.accent }}
        />

        {/* Inner Content */}
        <div className="flex items-center gap-3.5 px-4 py-3.5 flex-1 min-w-0">
          {/* Solid circular badge with white icon */}
          <div
            className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm"
            style={{ background: theme.accent }}
          >
            {isSuccess ? (
              <Check size={14} strokeWidth={3} className="text-white" />
            ) : isError ? (
              <AlertCircle size={14} strokeWidth={2.5} className="text-white" />
            ) : (
              <Info size={14} strokeWidth={2.5} className="text-white" />
            )}
          </div>

          {/* Text content */}
          <div className="flex-1 min-w-0 pr-1">
            <h5 className="text-[13px] font-bold text-white tracking-tight leading-snug truncate">
              {theme.title}
            </h5>
            <p className="text-[12px] text-slate-300 leading-snug mt-0.5">
              {toast.message}
            </p>
            {toast.subtitle && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                {toast.subtitle}
              </p>
            )}
          </div>

          {/* Minimal close button */}
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-none flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-1"
            title="Dismiss notification"
          >
            <X size={13} />
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
      if (path === '/' || path === '') return 'welcome'
      if (path === '/portal' || path === '/portal/') {
        const savedStep = localStorage.getItem('forge_onboarding_step')
        const savedCreator = localStorage.getItem('forge_creator_data')
        if (savedStep && savedCreator && ['analyzing', 'blueprint', 'preview', 'building', 'pre-finish', 'celebration'].includes(savedStep)) {
          return savedStep
        }
        return 'creator-link'
      }
      if (path === '/dashboard' || path.startsWith('/dashboard/')) {
        try { localStorage.setItem('forge_onboarding_step', 'dashboard') } catch {}
        return 'dashboard'
      }
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
        try { localStorage.setItem('forge_onboarding_step', 'dashboard') } catch {}
        return 'dashboard'
      }

      return 'welcome'
    } catch { }
    return 'welcome'
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
    let path = '/'
    if (newStep === 'welcome') {
      path = '/'
    } else if (newStep === 'creator-link' || ['analyzing', 'blueprint', 'preview', 'building', 'pre-finish', 'celebration'].includes(newStep)) {
      path = '/portal'
    } else if (newStep === 'login') {
      path = '/login'
    } else if (newStep === 'signup') {
      path = '/signup'
    } else if (newStep === 'dashboard') {
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
  }, [creatorData])

  useEffect(() => {
    if (step === 'dashboard' && typeof window !== 'undefined') {
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
        if (window.location.pathname !== targetPath) {
          window.history.replaceState(null, '', targetPath)
        }
      }
    }
  }, [step, creatorData?.id, creatorData?.channelId, creatorData?._id, creatorData?.handle, creatorData?.name])

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
      const updated = { ...prev, ...data }
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
      const cachedCreator = localStorage.getItem('forge_creator_data')

      if (path === '/' || path === '') {
        setStep('welcome')
      } else if (path === '/portal' || path === '/portal/') {
        const savedStep = localStorage.getItem('forge_onboarding_step')
        if (savedStep && cachedCreator && ['analyzing', 'blueprint', 'preview', 'building', 'pre-finish', 'celebration'].includes(savedStep)) {
          setStep(savedStep)
        } else {
          setStep('creator-link')
        }
      } else if (path === '/login') {
        setStep('login')
      } else if (path === '/signup') {
        setStep('signup')
      } else if (path === '/dashboard' || path.startsWith('/dashboard/')) {
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
        const rawParts = path.split('/').filter(Boolean)
        const reservedRoutes = [
          'join', 'portal', 'co-launch', 'preorder', 'beta', 'survey', 'research',
          'follow-up-crm', 'crm', 'admin-error-log', 'error-log', 'errors',
          'project-os', 'projects', 'project', 'participation-manager', 'co-builders',
          'cobuilder-admin', 'participation', 'launch', 'creator-launch', 'ops',
          'dashboard', 'login', 'signup', 'api', 'static'
        ]
        if (rawParts.length === 2 && !reservedRoutes.includes(rawParts[0])) {
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

        setStep('welcome')
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
            if (data.creator_data) {
              localStorage.setItem('forge_creator_data', JSON.stringify(data.creator_data))
              setCreatorData(prev => ({ ...prev, ...data.creator_data }))
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
            if (data.ai_keys) {
              updateAiKeys(data.ai_keys)
            }
            setDbLoadedTimestamp(Date.now())
          }
        })
        .catch(err => {
          console.warn('[Forge] Profile sync notice (non-fatal, local session preserved):', err)
        })
    }
  }, [userProfile, updateAiKeys])

  // Logout callback - clears transient keys, active session, and dashboard caches
  const logout = useCallback(() => {
    clearInMemoryKeys()
    clearInMemoryAiKeys()
    setAiKeysState({
      geminiKey: '',
      togetherKey: '',
      openaiKey: '',
      anthropicKey: '',
    })

    localStorage.clear()
    setUserProfile(null)

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
    navigate('login')
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
    setChatOpen
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

  if (step === 'dashboard') {
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
    'welcome': <Welcome />,
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
      <div className={`min-h-screen ${step === 'welcome' || step === 'login' ? 'bg-white text-slate-900' : 'bg-forge-bg text-white'} overflow-x-clip`}>
        {screens[step] || <Welcome />}
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
