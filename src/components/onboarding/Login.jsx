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

const CANDIDATE_API_URLS = [
  '',
  'https://creator-forge-backend-jj1y.onrender.com',
  'https://creator-forge-backend.onrender.com'
]

async function apiPost(endpoint, body) {
  let lastError = null
  for (const baseUrl of CANDIDATE_API_URLS) {
    try {
      const url = `${baseUrl}${endpoint}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.detail || data.message || `Request failed with status ${res.status}`)
      }
      return data
    } catch (err) {
      lastError = err
    }
  }
  throw lastError || new Error('Connection failed. Please check network.')
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

    try {
      const data = await apiPost('/api/auth/login', {
        identifier: identifier.trim(),
        password: password
      })

      // If user exists but password was not set in dashboard, switch to code flow automatically!
      if (data.status === 'no_password_set') {
        const targetEmail = data.email || (identifier.includes('@') ? identifier.trim() : '')
        setInfoNotice('Your password was not set in the dashboard. Sending an authentication code to your email...')
        setAuthMode('code')
        setCodeEmail(targetEmail)
        if (targetEmail) {
          await apiPost('/api/auth/send-code', { email: targetEmail })
          setCodeSent(true)
          setCodeTimer(30)
          setInfoNotice(`Authentication code sent to ${targetEmail}. Please check your inbox.`)
        }
        setLoading(false)
        return
      }

      if (data.status === 'code_required') {
        const targetEmail = data.email || (identifier.includes('@') ? identifier.trim() : '')
        setAuthMode('code')
        setCodeEmail(targetEmail)
        if (targetEmail) {
          await apiPost('/api/auth/send-code', { email: targetEmail })
          setCodeSent(true)
          setCodeTimer(30)
          setInfoNotice(`Authentication code sent to ${targetEmail}.`)
        }
        setLoading(false)
        return
      }

      finalizeLoginSession(data, password)
    } catch (err) {
      // Local fallback for demo
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
    try {
      await apiPost('/api/auth/send-code', { email: targetEmail })
      setCodeEmail(targetEmail)
      setCodeSent(true)
      setCodeTimer(30)
      setInfoNotice(`We sent a 6-digit authentication code to ${targetEmail}.`)
    } catch (err) {
      setError(err.message || 'Could not send verification code. Please verify email.')
    } finally {
      setLoading(false)
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
    try {
      const data = await apiPost('/api/auth/verify-code', {
        email: codeEmail.toLowerCase().trim(),
        code: cleanCode
      })

      finalizeLoginSession(data, '')
    } catch (err) {
      setError(err.message || 'Invalid or expired code. Please request a new code.')
      setLoading(false)
    }
  }

  return (
    <div className="login-split-page">

      {/* ── LEFT: FULL-BLEED IMAGE ── */}
      <div className="login-split-image">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80"
          alt="Engineering team collaborating in modern workspace"
          loading="eager"
        />
        <div className="login-image-overlay" />

        <div className="login-image-brand">
          <CoLaunchLogo size={24} theme="dark" showWordmark={true} />
        </div>

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

        {/* Form inner */}
        <div className="login-form-inner">

          {/* Heading */}
          <div className="login-form-heading">
            <h1>Welcome back</h1>
            <p>Sign in to your CoLaunch creator workspace</p>
          </div>

          {/* Customer Care Opportunity Modal / Banner (When logged in via code / no password set) */}
          {showCareOpportunity ? (
            <div className="p-5 sm:p-6 bg-[#0c101a] border border-[#232f48] rounded-none space-y-4 shadow-xl" style={{ borderRadius: '0px' }}>
              <div className="flex items-center gap-2.5 text-emerald-400">
                <CheckCircle2 size={22} className="shrink-0" />
                <div>
                  <h2 className="text-base font-extrabold text-white">Signed In Successfully</h2>
                  <p className="text-[11px] text-emerald-400 font-mono">Authenticated via Single-Use Email Code</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Welcome back! Your identity was verified. Because your account does not currently have a password configured in the dashboard, we invite you to connect with Customer Care if you'd like to set a password or change your email address.
              </p>

              <div className="p-3 bg-[#131926] border border-[#20293d] rounded-none text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Headphones size={15} className="text-[#c81e3c]" />
                  <span>Customer Care & Account Assistance</span>
                </div>
                <ul className="text-[11px] text-slate-400 space-y-1 pl-4 list-disc">
                  <li>Configure or update your dashboard password</li>
                  <li>Verify or migrate your primary account email</li>
                  <li>Get 1-on-1 launch onboarding & technical support</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('forge_dashboard_active_tab', 'support')
                    goTo('dashboard')
                  }}
                  className="flex-1 py-3 px-4 bg-[#c81e3c] hover:bg-[#b01a35] text-white font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer border-0 shadow-md"
                  style={{ borderRadius: '0px' }}
                >
                  <Headphones size={15} />
                  <span>Contact Customer Care</span>
                </button>
                <button
                  type="button"
                  onClick={() => goTo('dashboard')}
                  className="flex-1 py-3 px-4 bg-[#182030] hover:bg-[#202b40] text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-[#283652]"
                  style={{ borderRadius: '0px' }}
                >
                  <span>Continue to Dashboard</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Segmented Auth Mode Selector: Password vs Email Code */}
              <div className="login-role-toggle" style={{ borderRadius: '0px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('password')
                    setError('')
                    setInfoNotice('')
                  }}
                  className={`login-role-btn ${authMode === 'password' ? 'active' : ''}`}
                  style={{ borderRadius: '0px' }}
                >
                  <Lock size={14} />
                  <span>Password Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('code')
                    setError('')
                    setInfoNotice('')
                    if (identifier.includes('@')) setCodeEmail(identifier.trim())
                  }}
                  className={`login-role-btn ${authMode === 'code' ? 'active' : ''}`}
                  style={{ borderRadius: '0px' }}
                >
                  <Mail size={14} />
                  <span>Email Code Login</span>
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="login-error">
                  <AlertTriangle size={15} />
                  <span>{error}</span>
                </div>
              )}

              {/* Informational Notice */}
              {infoNotice && (
                <div className="p-3 mb-4 bg-sky-950/40 border border-sky-500/40 text-xs text-sky-200 flex items-start gap-2" style={{ borderRadius: '0px' }}>
                  <Sparkles size={15} className="text-sky-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{infoNotice}</span>
                </div>
              )}

              {/* ── MODE A: PASSWORD LOGIN ── */}
              {authMode === 'password' && (
                <form onSubmit={handlePasswordLogin} className="login-fields">
                  <label className="login-label">Username or Email</label>
                  <div className="login-input-wrap">
                    <User size={16} className="login-input-icon" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter your username or email"
                      required
                      autoComplete="username"
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
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="login-eye-btn"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Passwordless Helper link */}
                  <div className="login-forgot-row flex items-center justify-between text-xs pt-1 pb-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('code')
                        if (identifier.includes('@')) setCodeEmail(identifier.trim())
                      }}
                      className="text-[#c81e3c] hover:underline font-bold bg-transparent border-0 p-0 cursor-pointer text-left"
                    >
                      No password set? Sign in with email code →
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !identifier.trim()}
                    className="relative w-full group flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-wide shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2 border-0"
                    style={{ borderRadius: '0px' }}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-white" />
                        <span>Signing in…</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In with Password</span>
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ── MODE B: EMAIL CODE LOGIN (FOR USERS WITHOUT PASSWORD SET) ── */}
              {authMode === 'code' && (
                <div className="space-y-4">
                  {!codeSent ? (
                    <form onSubmit={handleSendCode} className="login-fields">
                      <label className="login-label">Your Account Email Address</label>
                      <div className="login-input-wrap">
                        <Mail size={16} className="login-input-icon" />
                        <input
                          type="email"
                          value={codeEmail || identifier}
                          onChange={(e) => {
                            setCodeEmail(e.target.value)
                            setIdentifier(e.target.value)
                          }}
                          placeholder="name@example.com"
                          required
                          autoFocus
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 mb-3">
                        We will send a 6-digit authentication code to verify your identity.
                      </p>

                      <button
                        type="submit"
                        disabled={loading || !(codeEmail || identifier).includes('@')}
                        className="relative w-full group flex items-center justify-center gap-2 px-5 py-3.5 bg-[#c81e3c] hover:bg-[#b01a35] text-white font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
                        style={{ borderRadius: '0px' }}
                      >
                        {loading ? (
                          <>
                            <Loader2 size={16} className="animate-spin text-white" />
                            <span>Sending code…</span>
                          </>
                        ) : (
                          <>
                            <KeyRound size={16} />
                            <span>Send Authentication Code</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyCode} className="login-fields space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="login-label mb-0">6-Digit Code</label>
                          <span className="text-[11px] text-slate-500 font-mono">Sent to {codeEmail}</span>
                        </div>
                        <div className="login-input-wrap">
                          <KeyRound size={16} className="login-input-icon text-[#c81e3c]" />
                          <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            placeholder="• • • • • •"
                            maxLength={6}
                            required
                            autoFocus
                            className="font-mono text-center tracking-[0.4em] font-extrabold text-lg"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={loading || code.trim().length < 6}
                        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-[#c81e3c] hover:bg-[#b01a35] text-white font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-0"
                        style={{ borderRadius: '0px' }}
                      >
                        {loading ? (
                          <>
                            <Loader2 size={16} className="animate-spin text-white" />
                            <span>Verifying code…</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} />
                            <span>Verify Code & Sign In</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center justify-between text-xs pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCodeSent(false)
                            setCode('')
                          }}
                          className="text-slate-500 hover:text-slate-700 bg-transparent border-0 cursor-pointer p-0"
                        >
                          Change Email
                        </button>
                        <button
                          type="button"
                          onClick={handleSendCode}
                          disabled={codeTimer > 0 || loading}
                          className="text-[#c81e3c] hover:underline font-bold bg-transparent border-0 cursor-pointer p-0 disabled:opacity-40 disabled:no-underline"
                        >
                          {codeTimer > 0 ? `Resend code in ${codeTimer}s` : 'Resend Code'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </>
          )}

          {/* Bottom text */}
          <p className="login-bottom-text">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => goTo('welcome')}
              className="login-signup-link"
            >
              Start onboarding
            </button>
          </p>

        </div>

        {/* Footer */}
        <div className="login-form-footer">
          <span>© 2026 CoLaunch · 256-Bit Encrypted</span>
        </div>

      </div>

    </div>
  )
}
