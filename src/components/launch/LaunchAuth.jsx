import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import {
  Lock,
  User,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import CoLaunchLogo from '../ui/CoLaunchLogo'

const LAUNCH_AUTH_SESSION_KEY = 'forge_launch_auth_token'
const LAUNCH_AUTH_EMAIL_KEY = 'forge_launch_auth_email'
const LAUNCH_AUTH_TIMESTAMP_KEY = 'forge_launch_auth_timestamp'
const ONE_HOUR_MS = 60 * 60 * 1000 // 1 hour expiration (3,600,000 ms)

export const LaunchAuthContext = createContext(null)
export const useLaunchAuth = () => useContext(LaunchAuthContext)

export function isLaunchAuthenticated() {
  try {
    const token = localStorage.getItem(LAUNCH_AUTH_SESSION_KEY)
    const email = localStorage.getItem(LAUNCH_AUTH_EMAIL_KEY)
    const timestampStr = localStorage.getItem(LAUNCH_AUTH_TIMESTAMP_KEY)
    if (!token || !email || !timestampStr) return false

    const ts = parseInt(timestampStr, 10)
    if (isNaN(ts) || Date.now() - ts > ONE_HOUR_MS) {
      logoutLaunchAuth()
      return false
    }
    return true
  } catch {
    return false
  }
}

export function logoutLaunchAuth() {
  try {
    localStorage.removeItem(LAUNCH_AUTH_SESSION_KEY)
    localStorage.removeItem(LAUNCH_AUTH_EMAIL_KEY)
    localStorage.removeItem(LAUNCH_AUTH_TIMESTAMP_KEY)
    localStorage.removeItem('forge_launch_auth_user')
  } catch (e) {
    console.warn('[LaunchAuth] Logout error:', e)
  }
}

export default function LaunchAuth({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => isLaunchAuthenticated())
  const [identifier, setIdentifier] = useState('admin')
  const [password, setPassword] = useState('colaunch2026')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Periodic expiration watcher: check every 10 seconds for session timeout
  useEffect(() => {
    const checkExpiration = () => {
      const authenticated = isLaunchAuthenticated()
      if (!authenticated && isAuthenticated) {
        setIsAuthenticated(false)
        setError('Session expired. Please sign in again.')
      }
    }

    const interval = setInterval(checkExpiration, 10000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  const establishLaunchSession = (cleanEmail) => {
    const token = `op_${Date.now()}`
    localStorage.setItem(LAUNCH_AUTH_SESSION_KEY, token)
    localStorage.setItem(LAUNCH_AUTH_EMAIL_KEY, cleanEmail || 'admin@colaunch.com')
    localStorage.setItem(LAUNCH_AUTH_TIMESTAMP_KEY, Date.now().toString())
    localStorage.setItem('forge_launch_auth_user', JSON.stringify({ email: cleanEmail || 'admin@colaunch.com', role: 'operator_admin' }))
    localStorage.setItem('forge_active_session', 'true')
    localStorage.setItem('forge_login_timestamp', Date.now().toString())

    let existingProfile = {}
    try {
      existingProfile = JSON.parse(localStorage.getItem('forge_user_profile') || '{}')
    } catch (e) {}

    const isRealEmail = cleanEmail && cleanEmail.includes('@') && cleanEmail !== 'creatorforgeweb@gmail.com'

    localStorage.setItem(
      'forge_user_profile',
      JSON.stringify({
        ...existingProfile,
        username: existingProfile.username || (isRealEmail ? cleanEmail.split('@')[0] : 'admin'),
        email: isRealEmail ? cleanEmail : (existingProfile.email || 'admin@colaunch.com'),
        role: 'operator_admin',
        needsCredentials: existingProfile.needsCredentials ?? !isRealEmail
      })
    )

    setTimeout(() => {
      setIsAuthenticated(true)
      setLoading(false)
    }, 200)
  }

  const handleLogin = async (e) => {
    if (e) e.preventDefault()
    setError('')

    const cleanIdentifier = identifier.trim().toLowerCase()
    const cleanPass = password

    if (!cleanIdentifier) {
      setError('Please enter your username or email.')
      return
    }
    if (!cleanPass) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)

    try {
      // Call backend auth API
      const res = await fetch('/api/auth/launch-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanIdentifier,
          password: cleanPass
        })
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok && data.status === 'success') {
        establishLaunchSession(cleanIdentifier)
        return
      }

      // Friendly fallback validation for dev & testing accounts
      if (
        (cleanIdentifier === 'admin' && (cleanPass === 'creatorforge2026' || cleanPass === 'colaunch2026' || cleanPass === 'Upworkproject')) ||
        (cleanIdentifier === 'admin@colaunch.com' && (cleanPass === 'creatorforge2026' || cleanPass === 'colaunch2026' || cleanPass === 'Upworkproject'))
      ) {
        establishLaunchSession(cleanIdentifier.includes('@') ? cleanIdentifier : 'admin@colaunch.com')
        return
      }

      setError(data.detail || 'Invalid email or password.')
      setLoading(false)
    } catch (err) {
      // Direct offline fallback for verified credentials
      if (
        (cleanIdentifier === 'admin' && (cleanPass === 'creatorforge2026' || cleanPass === 'colaunch2026' || cleanPass === 'Upworkproject')) ||
        (cleanIdentifier === 'admin@colaunch.com' && (cleanPass === 'creatorforge2026' || cleanPass === 'colaunch2026' || cleanPass === 'Upworkproject'))
      ) {
        establishLaunchSession(cleanIdentifier.includes('@') ? cleanIdentifier : 'admin@colaunch.com')
        return
      }
      setError('Authentication failed. Please verify credentials.')
      setLoading(false)
    }
  }

  const handleAutoFillDemo = () => {
    setIdentifier('admin')
    setPassword('colaunch2026')
    setError('')
  }

  const logout = useCallback(() => {
    logoutLaunchAuth()
    setIsAuthenticated(false)
    setPassword('')
  }, [])

  if (isAuthenticated) {
    return (
      <LaunchAuthContext.Provider value={{ isAuthenticated, logout, operatorEmail: identifier || '' }}>
        {children}
      </LaunchAuthContext.Provider>
    )
  }

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-[#090D16] text-white selection:bg-[#C81E3C] selection:text-white font-sans">

      {/* ── LEFT: FULL-BLEED IMAGE PANEL ── */}
      <div className="relative hidden lg:block overflow-hidden h-full min-h-screen bg-[#07090F]">
        <img
          src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80"
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = '/images/hero_saas_macbook.jpg'
          }}
          alt="Engineering team collaborating in modern workspace"
          className="w-full h-full object-cover object-center"
          loading="eager"
        />
        {/* Dark overlay with soft gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#090D16]/70 via-[#090D16]/20 to-[#090D16]/90 pointer-events-none" />

        {/* CoLaunch branding */}
        <div className="absolute top-8 left-8 z-10 flex items-center gap-3">
          <CoLaunchLogo size={24} theme="dark" showWordmark={true} />
        </div>

        {/* Caption text */}
        <div className="absolute bottom-0 left-0 right-0 p-10 z-10 space-y-3">
          <span className="inline-block px-2.5 py-0.5 rounded-none text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 uppercase tracking-wider">
            STUDIO
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight font-display">
            Build Products.<br />Share Ownership.
          </h2>
          <p className="text-sm text-slate-300 max-w-sm leading-relaxed">
            50/50 co-founder partnerships powered by AI sprint workflows.
          </p>
        </div>
      </div>

      {/* ── RIGHT: DARK MODE LOGIN FORM ── */}
      <div className="flex flex-col justify-between bg-[#090D16] border-l border-[#1E2638] min-h-screen p-6 sm:p-10 lg:p-14 relative">
        {/* Subtle ambient corner glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C81E3C]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar with back link */}
        <div className="flex items-center justify-between w-full relative z-10 mb-8">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') window.location.href = '/'
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>

          {/* Mobile-only logo */}
          <div className="lg:hidden">
            <CoLaunchLogo size={20} theme="dark" showWordmark={true} />
          </div>
        </div>

        {/* Form inner (vertically centered) */}
        <div className="w-full max-w-sm mx-auto my-auto relative z-10 space-y-6">

          {/* Heading */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Sign in to your CoLaunch workspace
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 rounded-none leading-relaxed">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Username or Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin or operator@colaunch.com"
                  autoComplete="username"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-[#0D111C] border border-[#1E2638] text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#C81E3C] transition rounded-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter operator password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-3 bg-[#0D111C] border border-[#1E2638] text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-[#C81E3C] transition rounded-none font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition cursor-pointer p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Quick-fill helper */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <button
                type="button"
                onClick={handleAutoFillDemo}
                className="font-mono text-[11px] text-slate-400 hover:text-white underline decoration-slate-600 underline-offset-2 transition cursor-pointer"
              >
                Quick-fill Admin Credentials
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !identifier.trim() || !password}
              className="w-full mt-2 py-3.5 px-4 bg-[#C81E3C] hover:bg-[#B01732] active:bg-[#99142B] text-white font-bold text-xs uppercase tracking-wider rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#C81E3C]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Signing In…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </>
              )}
            </button>
          </form>

          {/* Bottom text */}
          <p className="text-xs text-slate-400 text-center mt-6">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') window.location.href = '/'
              }}
              className="text-white hover:text-[#C81E3C] font-bold underline transition ml-1 cursor-pointer"
            >
              Start onboarding
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="w-full text-center text-xs text-slate-600 font-mono py-4 border-t border-[#1E2638]/60 relative z-10 mt-8">
          © 2026 CoLaunch
        </div>

      </div>

    </div>
  )
}
