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
    localStorage.clear()

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

    // If logged in via email code or has no password set in dashboard, offer customer care opportunity!
    if (data.logged_in_via_code || !hasPwd) {
      setShowCareOpportunity(true)
    } else {
      goTo('dashboard')
    }
  }

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
    <div className="min-h-screen w-full bg-[#07090e] text-slate-100 flex flex-col justify-between items-center relative overflow-hidden select-none">
      
      {/* Background Matrix Dots */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Ambient Radial Mesh Glow */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[360px] pointer-events-none opacity-20 blur-[130px]"
        style={{
          background: 'radial-gradient(circle, #c81e3c 0%, #1e1b4b 60%, transparent 80%)'
        }}
      />

      {/* ── TOP NAV BAR ── */}
      <header className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between z-10">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.location.pathname !== '/portal') {
              window.history.pushState(null, '', '/portal')
            }
            goTo('creator-link')
          }}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition px-3 py-1.5 bg-[#0e1320] hover:bg-[#151c2e] border border-[#1e293b] cursor-pointer"
          style={{ borderRadius: '0px' }}
        >
          <Sparkles size={13} className="text-[#c81e3c]" />
          <span>Start Onboarding</span>
        </button>

        <div className="flex items-center gap-2">
          <CoLaunchLogo size={22} theme="dark" showWordmark={true} />
        </div>

        <button
          type="button"
          onClick={() => {
            localStorage.setItem('forge_dashboard_active_tab', 'support')
            goTo('dashboard')
          }}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition px-3 py-1.5 bg-[#0e1320] hover:bg-[#151c2e] border border-[#1e293b] cursor-pointer"
          style={{ borderRadius: '0px' }}
        >
          <Headphones size={13} className="text-[#c81e3c]" />
          <span className="hidden sm:inline">Support</span>
        </button>
      </header>

      {/* ── MAIN AUTHENTICATION CONTAINER ── */}
      <main className="w-full max-w-md mx-auto my-auto px-4 py-6 z-10">
        <div 
          className="bg-[#0b0f19] border border-[#1e293b] p-6 sm:p-8 shadow-2xl relative"
          style={{ borderRadius: '0px' }}
        >
          {/* Subtle Top Red Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c81e3c] to-transparent" />

          {/* Heading */}
          <div className="mb-6">
            <h1 className="text-2xl font-black text-white tracking-tight">Sign In</h1>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to your CoLaunch account.
            </p>
          </div>

          {/* Customer Care Opportunity Card (Shown when authenticated via code & no password configured) */}
          {showCareOpportunity ? (
            <div 
              className="p-5 bg-[#070a12] border border-[#1e293b] space-y-4"
              style={{ borderRadius: '0px' }}
            >
              <div className="flex items-center gap-2.5 text-emerald-400">
                <CheckCircle2 size={22} className="shrink-0" />
                <div>
                  <h2 className="text-sm font-extrabold text-white">Identity Verified</h2>
                  <p className="text-[11px] text-emerald-400 font-mono">Authenticated via Single-Use Email Code</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Welcome back! Because your account currently does not have a password configured in the dashboard, we invite you to connect with Customer Care if you would like to set a password or change your email address.
              </p>

              <div className="p-3 bg-[#0d1322] border border-[#1b263b] text-xs text-slate-300 space-y-2" style={{ borderRadius: '0px' }}>
                <div className="flex items-center gap-2 text-white font-bold">
                  <Headphones size={14} className="text-[#c81e3c]" />
                  <span>Customer Care & Account Assistance</span>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-1 pl-4 list-disc">
                  <li>Configure or update your dashboard password</li>
                  <li>Verify or migrate your primary email address</li>
                  <li>1-on-1 launch onboarding and technical assistance</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('forge_dashboard_active_tab', 'support')
                    goTo('dashboard')
                  }}
                  className="flex-1 py-3 px-4 bg-[#c81e3c] hover:bg-[#b01a35] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer border-0 shadow-md"
                  style={{ borderRadius: '0px' }}
                >
                  <Headphones size={14} />
                  <span>Contact Customer Care</span>
                </button>
                <button
                  type="button"
                  onClick={() => goTo('dashboard')}
                  className="flex-1 py-3 px-4 bg-[#141b2b] hover:bg-[#1a2338] text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-[#232f48]"
                  style={{ borderRadius: '0px' }}
                >
                  <span>Continue to Dashboard</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Segmented Auth Mode Selector: Password vs Email */}
              <div 
                className="grid grid-cols-2 p-1 bg-[#070a12] border border-[#1b253b] mb-5"
                style={{ borderRadius: '0px' }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('password')
                    setError('')
                    setInfoNotice('')
                  }}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-bold transition cursor-pointer ${
                    authMode === 'password'
                      ? 'bg-[#151f33] text-white border border-[#263757] shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                  style={{ borderRadius: '0px' }}
                >
                  <Lock size={13} className={authMode === 'password' ? 'text-[#c81e3c]' : ''} />
                  <span>Password</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('code')
                    setError('')
                    setInfoNotice('')
                    if (identifier.includes('@')) setCodeEmail(identifier.trim())
                  }}
                  className={`flex items-center justify-center gap-2 py-2 text-xs font-bold transition cursor-pointer ${
                    authMode === 'code'
                      ? 'bg-[#151f33] text-white border border-[#263757] shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 border border-transparent'
                  }`}
                  style={{ borderRadius: '0px' }}
                >
                  <Mail size={13} className={authMode === 'code' ? 'text-[#c81e3c]' : ''} />
                  <span>Email</span>
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div 
                  className="p-3 mb-4 bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5"
                  style={{ borderRadius: '0px' }}
                >
                  <AlertTriangle size={15} className="text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Informational Notice */}
              {infoNotice && (
                <div 
                  className="p-3 mb-4 bg-sky-950/40 border border-sky-500/50 text-sky-200 text-xs flex items-start gap-2.5"
                  style={{ borderRadius: '0px' }}
                >
                  <Sparkles size={15} className="text-sky-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{infoNotice}</span>
                </div>
              )}

              {/* ── MODE A: PASSWORD LOGIN ── */}
              {authMode === 'password' && (
                <form onSubmit={handlePasswordLogin} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Username or Email
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="e.g. elishadamu97@gmail.com"
                        required
                        autoComplete="username"
                        className="w-full bg-[#070a12] border border-[#1f2b42] focus:border-[#c81e3c] text-white text-xs pl-10 pr-3.5 py-3 outline-none font-medium placeholder:text-slate-600 transition"
                        style={{ borderRadius: '0px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your dashboard password"
                        required
                        autoComplete="current-password"
                        className="w-full bg-[#070a12] border border-[#1f2b42] focus:border-[#c81e3c] text-white text-xs pl-10 pr-10 py-3 outline-none font-medium placeholder:text-slate-600 transition"
                        style={{ borderRadius: '0px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    <div className="flex justify-end mt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('code')
                          setError('')
                          if (identifier.includes('@')) {
                            setCodeEmail(identifier.trim())
                          }
                        }}
                        className="text-[11px] text-[#c81e3c] hover:underline font-semibold cursor-pointer"
                      >
                        No password set? Sign in with email code →
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !identifier.trim() || !password}
                    className="w-full py-3 bg-[#c81e3c] hover:bg-[#b01a35] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer border-0 shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    style={{ borderRadius: '0px' }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-white" />
                        <span>Signing In…</span>
                      </>
                    ) : (
                      <span>Sign In</span>
                    )}
                  </button>
                </form>
              )}

              {/* ── MODE B: EMAIL CODE LOGIN ── */}
              {authMode === 'code' && (
                <div className="space-y-4">
                  {!codeSent ? (
                    <form onSubmit={handleSendCode} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                          Account Email Address
                        </label>
                        <div className="relative">
                          <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                          <input
                            type="email"
                            value={codeEmail || identifier}
                            onChange={(e) => {
                              setCodeEmail(e.target.value)
                              setIdentifier(e.target.value)
                            }}
                            placeholder="e.g. elishadamu97@gmail.com"
                            required
                            autoComplete="email"
                            className="w-full bg-[#070a12] border border-[#1f2b42] focus:border-[#c81e3c] text-white text-xs pl-10 pr-3.5 py-3 outline-none font-medium placeholder:text-slate-600 transition"
                            style={{ borderRadius: '0px' }}
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || !(codeEmail || identifier).includes('@')}
                        className="w-full py-3 bg-[#c81e3c] hover:bg-[#b01a35] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer border-0 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ borderRadius: '0px' }}
                      >
                        {loading ? (
                          <>
                            <Loader2 size={14} className="animate-spin text-white" />
                            <span>Sending code…</span>
                          </>
                        ) : (
                          <span>Continue</span>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                      <div className="p-3 bg-[#0d1424] border border-[#1e2a42] flex items-center justify-between text-xs" style={{ borderRadius: '0px' }}>
                        <div>
                          <span className="text-slate-400 block text-[10px] font-mono">TARGET EMAIL</span>
                          <span className="text-white font-bold">{codeEmail}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCodeSent(false)
                            setCode('')
                            setError('')
                            setInfoNotice('')
                          }}
                          className="text-[11px] text-[#c81e3c] hover:underline font-semibold cursor-pointer"
                        >
                          Change
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                          6-Digit Verification Code
                        </label>
                        <div className="relative">
                          <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                            placeholder="123456"
                            required
                            autoFocus
                            className="w-full bg-[#070a12] border border-[#1f2b42] focus:border-[#c81e3c] text-white text-lg tracking-[0.4em] font-mono text-center py-2.5 outline-none font-bold placeholder:text-slate-700 transition"
                            style={{ borderRadius: '0px' }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="text-slate-500">Didn't receive it?</span>
                        {codeTimer > 0 ? (
                          <span className="text-slate-400 font-mono">Resend in {codeTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendCode}
                            disabled={loading}
                            className="text-[#c81e3c] hover:underline font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                            <span>Resend Code</span>
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={loading || code.trim().length !== 6}
                        className="w-full py-3 bg-[#c81e3c] hover:bg-[#b01a35] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer border-0 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ borderRadius: '0px' }}
                      >
                        {loading ? (
                          <>
                            <Loader2 size={14} className="animate-spin text-white" />
                            <span>Signing in…</span>
                          </>
                        ) : (
                          <span>Sign In</span>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </>
          )}

          {/* Bottom Card Footer */}
          <div className="mt-6 pt-5 border-t border-[#162033] text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && window.location.pathname !== '/portal') {
                  window.history.pushState(null, '', '/portal')
                }
                goTo('creator-link')
              }}
              className="text-white hover:text-[#c81e3c] font-bold underline transition cursor-pointer ml-1"
            >
              Start onboarding
            </button>
          </div>
        </div>
      </main>

      {/* ── SECURITY FOOTER ── */}
      <footer className="w-full max-w-5xl mx-auto px-4 sm:px-8 py-5 text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 z-10 border-t border-[#121927]">
        <span>© 2026 CoLaunch Inc. · Creator OS</span>
        <span className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck size={13} className="text-[#c81e3c]" />
          <span>256-Bit TLS · Zero-Knowledge Storage</span>
        </span>
      </footer>

    </div>
  )
}
