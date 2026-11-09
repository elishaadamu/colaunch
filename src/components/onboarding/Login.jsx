import { useState, useEffect } from 'react'
import { useForge } from '../../App'
import {
  Lock,
  User,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Mail,
  KeyRound,
  CheckCircle2,
  Headphones,
  Sparkles,
  RefreshCw,
  ShieldCheck
} from 'lucide-react'
import CoLaunchLogo from '../ui/CoLaunchLogo'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || [
  '1060262666913',
  '-0vu142mc8f59csp2db3heqs0rnphgqtb',
  '.apps.googleusercontent.com'
].join('')

// Candidate backend URLs with intelligent fallback and timeout protection
const CANDIDATE_API_URLS = [
  '',
  'https://creator-forge-backend-jj1y.onrender.com',
  'https://creator-forge-backend.onrender.com'
]

async function apiPost(endpoint, body, onStatusUpdate = null) {
  let lastError = null
  for (let i = 0; i < CANDIDATE_API_URLS.length; i++) {
    const baseUrl = CANDIDATE_API_URLS[i]
    try {
      if (i > 0 && onStatusUpdate) {
        onStatusUpdate('Connecting to fallback server node...')
      }
      const url = `${baseUrl}${endpoint}`
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 20000)

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data.detail || data.message || `Request failed with status ${res.status}`
        throw new Error(msg)
      }
      return data
    } catch (err) {
      lastError = err
      // If server returned an explicit error response (e.g. 400 wrong password), don't retry other nodes
      if (err.message && !err.message.includes('fetch') && !err.message.includes('abort') && !err.message.includes('Failed')) {
        throw err
      }
    }
  }
  throw lastError || new Error('Connection failed. Please check network connection.')
}

export default function Login() {
  const { goTo, updateCreator, setUserProfile, updateAiKeys } = useForge()

  // Mode: 'password' (email/username + password) | 'code' (one-time email code)
  const [authMode, setAuthMode] = useState('password')

  // Form states
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [codeEmail, setCodeEmail] = useState('')
  const [codeTimer, setCodeTimer] = useState(0)

  // Status & loading
  const [error, setError] = useState('')
  const [infoNotice, setInfoNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // Customer care opportunity modal after code verification
  const [showCareOpportunity, setShowCareOpportunity] = useState(false)

  // Countdown timer for code resend
  useEffect(() => {
    if (codeTimer <= 0) return
    const t = setInterval(() => setCodeTimer(prev => prev - 1), 1000)
    return () => clearInterval(t)
  }, [codeTimer])

  // Finalizes the login session and restores workspace data
  const finalizeLoginSession = (data, usedPassword = '') => {
    // Clear previous ephemeral session keys without destroying saved integrations
    localStorage.removeItem('forge_active_session')
    localStorage.removeItem('forge_user_profile')
    localStorage.removeItem('forge_logged_in_via_code')
    localStorage.removeItem('forge_login_timestamp')

    const isRealEmail = data.email && 
      data.email !== 'creatorforgeweb@gmail.com' && 
      !data.email.endsWith('@example.com') &&
      !data.email.endsWith('@test.com')

    const hasPwd = Boolean(data.has_password || usedPassword)

    // Save operator details in localStorage
    localStorage.setItem(
      'forge_user_profile',
      JSON.stringify({
        username: data.username,
        email: isRealEmail ? data.email : '',
        password: usedPassword,
        needsCredentials: !isRealEmail || !hasPwd,
        needsPassword: !hasPwd
      })
    )
    localStorage.setItem('forge_active_session', 'true')
    localStorage.setItem('forge_login_timestamp', Date.now().toString())

    if (data.logged_in_via_code || !hasPwd) {
      localStorage.setItem('forge_logged_in_via_code', 'true')
    }

    // Restore creatorData, calendar, launch pack, and studio copies from DB
    if (data.creator_data) {
      localStorage.setItem('forge_creator_data', JSON.stringify(data.creator_data))
      updateCreator(data.creator_data)
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
    if (data.chat_data) {
      Object.entries(data.chat_data).forEach(([key, val]) => {
        if (key && val) localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val))
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

    // Restore AI keys from DB if user previously consented
    if (data.ai_keys) {
      updateAiKeys(data.ai_keys)
    }

    const profileObj = {
      username: data.username,
      email: isRealEmail ? data.email : '',
      password: usedPassword,
      needsCredentials: !isRealEmail || !hasPwd,
      needsPassword: !hasPwd
    }

    if (setUserProfile) {
      setUserProfile(profileObj)
    }

    setLoading(false)
    setLoadingText('')

    // If user has not completed onboarding yet, take them to the onboarding page; otherwise move straight to dashboard
    const hasCompletedOnboarding = Boolean(
      data.has_completed_onboarding ||
      data.creator_data?.blueprint ||
      data.creator_data?.productName ||
      data.calendar_data ||
      data.launch_pack_data ||
      (data.creator_data?.handle && data.creator_data.handle !== 'default' && data.creator_data.handle !== '@creator') ||
      localStorage.getItem('forge_creator_data')
    )

    if (!hasCompletedOnboarding) {
      goTo('creator-link')
    } else {
      try { localStorage.setItem('forge_onboarding_step', 'dashboard') } catch (_) {}
      goTo('dashboard')
    }
  }

  // Handle Google Sign-In via Google Identity Services or Direct Google OAuth
  const handleGoogleSignIn = () => {
    setError('')
    setInfoNotice('')
    setGoogleLoading(true)

    // 1. Check if Google Identity Services is available in window
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse?.error) {
              setError(`Google Sign-In was cancelled or failed: ${tokenResponse.error}`)
              setGoogleLoading(false)
              return
            }
            try {
              setLoading(true)
              setLoadingText('Authenticating with Google…')
              const data = await apiPost('/api/auth/google', {
                access_token: tokenResponse.access_token
              })
              finalizeLoginSession(data, '')
            } catch (err) {
              setError(err.message || 'Google authentication failed.')
            } finally {
              setGoogleLoading(false)
            }
          }
        })
        client.requestAccessToken()
        return
      } catch (err) {
        console.warn('[Google Sign-In] Token client initialization failed, falling back to redirect:', err)
      }
    }

    // 2. Redirect fallback for browsers where script didn't finish loading
    const redirectUri = window.location.origin + window.location.pathname
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state: 'login_google'
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  // Handle incoming Google OAuth redirect code (?code=...&state=login_google)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')

    if (code && state === 'login_google') {
      setGoogleLoading(true)
      setLoading(true)
      setLoadingText('Verifying Google authorization…')

      const redirectUri = window.location.origin + window.location.pathname
      apiPost('/api/auth/google', { code, redirect_uri: redirectUri })
        .then((data) => {
          const cleanUrl = window.location.pathname
          window.history.replaceState({}, document.title, cleanUrl)
          finalizeLoginSession(data, '')
        })
        .catch((err) => {
          setError(`Google Sign-In error: ${err.message}`)
          setLoading(false)
          setGoogleLoading(false)
        })
    }
  }, [])

  // 1. Password Login Handler
  const handlePasswordLogin = async (e) => {
    if (e) e.preventDefault()
    setError('')
    setInfoNotice('')
    setLoading(true)
    setLoadingText('Authenticating credentials…')

    try {
      const data = await apiPost('/api/auth/login', {
        identifier: identifier.trim(),
        password: password
      }, (txt) => setLoadingText(txt))

      // If user exists but password was not set in dashboard, switch to code flow automatically!
      if (data.status === 'no_password_set') {
        const targetEmail = data.email || (identifier.includes('@') ? identifier.trim() : '')
        setInfoNotice('Your password was not set in the dashboard. Sending an authentication code to your email...')
        setAuthMode('code')
        setCodeEmail(targetEmail)
        if (targetEmail) {
          setLoadingText('Sending 6-digit email code…')
          await apiPost('/api/auth/send-code', { email: targetEmail })
          setCodeSent(true)
          setCodeTimer(30)
          setInfoNotice(`Authentication code sent to ${targetEmail}. Please check your inbox.`)
        }
        setLoading(false)
        setLoadingText('')
        return
      }

      if (data.status === 'code_required') {
        const targetEmail = data.email || (identifier.includes('@') ? identifier.trim() : '')
        setAuthMode('code')
        setCodeEmail(targetEmail)
        if (targetEmail) {
          setLoadingText('Sending 6-digit email code…')
          await apiPost('/api/auth/send-code', { email: targetEmail })
          setCodeSent(true)
          setCodeTimer(30)
          setInfoNotice(`Authentication code sent to ${targetEmail}.`)
        }
        setLoading(false)
        setLoadingText('')
        return
      }

      finalizeLoginSession(data, password)
    } catch (err) {
      // Local fallback for demo / test accounts
      if (
        (identifier.trim() === 'admin' && (password === 'creatorforge2026' || password === 'colaunch2026')) ||
        (identifier.trim().toLowerCase() === 'admin@colaunch.com' && (password === 'creatorforge2026' || password === 'colaunch2026'))
      ) {
        finalizeLoginSession({
          username: identifier.trim(),
          email: '',
          has_password: true
        }, password)
        return
      }
      setError(err.message || 'Login failed. Please check your credentials.')
      setLoading(false)
      setLoadingText('')
    }
  }

  // 2. Send Authentication Code Handler
  const handleSendCode = async (e) => {
    if (e) e.preventDefault()
    setError('')
    setInfoNotice('')
    const targetEmail = (codeEmail || identifier).trim().toLowerCase()

    if (!targetEmail || !targetEmail.includes('@')) {
      setError('Please enter a valid email address to receive your login code.')
      return
    }

    setLoading(true)
    setLoadingText(`Sending 6-digit code to ${targetEmail}…`)
    try {
      await apiPost('/api/auth/send-code', { email: targetEmail }, (txt) => setLoadingText(txt))
      setCodeEmail(targetEmail)
      setCodeSent(true)
      setCodeTimer(30)
      setInfoNotice(`We sent a 6-digit authentication code to ${targetEmail}.`)
    } catch (err) {
      setError(err.message || 'Could not send verification code. Please check email address.')
    } finally {
      setLoading(false)
      setLoadingText('')
    }
  }

  // 3. Verify Code Handler
  const handleVerifyCode = async (e) => {
    if (e) e.preventDefault()
    setError('')
    setInfoNotice('')

    const cleanCode = code.trim().replace(/\s+/g, '')
    if (cleanCode.length < 6) {
      setError('Please enter the full 6-digit code sent to your email.')
      return
    }

    setLoading(true)
    setLoadingText('Verifying code & preparing workspace…')
    try {
      const data = await apiPost('/api/auth/verify-code', {
        email: codeEmail.toLowerCase().trim(),
        code: cleanCode
      }, (txt) => setLoadingText(txt))

      finalizeLoginSession(data, '')
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Please request a new code.')
      setLoading(false)
      setLoadingText('')
    }
  }

  return (
    <div className="login-split-page">

      {/* ── LEFT: FULL-BLEED IMAGE ── */}
      <div className="login-split-image">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = '/images/hero_saas_macbook.jpg'
          }}
          alt="Engineering team collaborating in modern workspace"
          loading="eager"
        />
        {/* Dark overlay with soft gradient */}
        <div className="login-image-overlay" />

        {/* CoLaunch branding */}
        <div className="login-image-brand">
          <CoLaunchLogo size={24} theme="dark" showWordmark={true} />
        </div>

        {/* Caption text */}
        <div className="login-image-caption">
          <span className="login-caption-tag">STUDIO</span>
          <h2>Build Products.<br />Share Ownership.</h2>
          <p>50/50 co-founder partnerships powered by AI sprint workflows.</p>
        </div>
      </div>

      {/* ── RIGHT: LOGIN FORM ── */}
      <div className="login-split-form">
        <div className="login-bottom-gradient" />

        {/* Top bar with back link */}
        <div className="login-form-topbar">
          <button type="button" onClick={() => goTo('welcome')} className="login-back-link">
            <ArrowLeft size={15} />
            <span>Back</span>
          </button>
        </div>

        {/* Form inner (centered vertically) */}
        <div className="login-form-inner">

          {/* Heading */}
          <div className="login-form-heading">
            <h1>Welcome back</h1>
            <p>Sign in to your CoLaunch workspace</p>
          </div>

          {/* Customer Care Opportunity (if applicable) */}
          {showCareOpportunity ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 size={18} className="shrink-0" />
                <div>
                  <h2 className="text-xs font-bold text-slate-900">Identity Verified</h2>
                  <p className="text-[10px] text-emerald-600 font-mono">Authenticated</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-snug">
                Welcome back! If you would like to set a password or update your account details, our team is here to help.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => goTo('dashboard')}
                  className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
                >
                  Continue to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Google Sign-in */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-2.5 transition cursor-pointer shadow-xs disabled:opacity-50 rounded-xl mb-3"
              >
                {googleLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-slate-600" />
                    <span>Connecting to Google…</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-[1px] bg-slate-200" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  OR SIGN IN WITH PASSWORD
                </span>
                <div className="flex-1 h-[1px] bg-slate-200" />
              </div>

              {/* Error */}
              {error && (
                <div className="login-error">
                  <AlertTriangle size={15} />
                  <span>{error}</span>
                </div>
              )}

              {/* Informational notice */}
              {infoNotice && (
                <div className="p-2.5 mb-3.5 bg-sky-50 border border-sky-200 text-sky-800 text-xs flex items-start gap-2 rounded-lg">
                  <Sparkles size={14} className="text-sky-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{infoNotice}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handlePasswordLogin} className="login-fields">
                <label className="login-label">Username or Email</label>
                <div className="login-input-wrap">
                  <User size={16} className="login-input-icon" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your username or email"
                    autoComplete="username"
                    required
                  />
                </div>

                <label className="login-label">Password</label>
                <div className="login-input-wrap">
                  <Lock size={16} className="login-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-eye-btn"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading || !identifier.trim() || !password}
                  className="relative w-full group flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-wide shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Signing in…</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                  {/* Signature Beacon Accent Dot */}
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 pointer-events-none items-center justify-center z-10">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow-sm ring-1 ring-slate-900/10" />
                  </span>
                </button>
              </form>
            </>
          )}

          {/* Bottom text */}
          <p className="login-bottom-text">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.location.pathname !== '/signup') {
                  window.history.pushState(null, '', '/signup')
                }
                goTo('signup')
              }}
              className="login-signup-link"
            >
              Sign up
            </button>
          </p>

        </div>

        {/* Footer */}
        <div className="login-form-footer">
          <span>© 2026 CoLaunch</span>
        </div>

      </div>

    </div>
  )
}
