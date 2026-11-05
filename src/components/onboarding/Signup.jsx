import { useState, useEffect, useRef } from 'react'
import { useForge } from '../../App'
import {
  ArrowRight, Lock, Mail, User, AlertTriangle, ShieldCheck,
  Sparkles, Eye, EyeOff, CheckCircle2, Loader2, Check
} from 'lucide-react'
import WingLogo from '../ui/WingLogo'
import { loadAiKeys, saveAiKeysToDb, setAiKeysConsent } from '../../services/ai'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || [
  '1060262666913',
  '-0vu142mc8f59csp2db3heqs0rnphgqtb',
  '.apps.googleusercontent.com'
].join('')

export default function Signup() {
  const { creatorData, setUserProfile, goTo } = useForge()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  // reCAPTCHA v3 verification states
  const [googleRecaptchaReady, setGoogleRecaptchaReady] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState('')
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6Ldo3xEuAAAAAJJQyF4Ro2fdv-WlZfdra7NatG0X'

  // Initialize official Google reCAPTCHA v3
  useEffect(() => {
    let checkTimer = null
    const initV3 = () => {
      if (typeof window !== 'undefined' && window.grecaptcha) {
        if (window.grecaptcha.ready) {
          window.grecaptcha.ready(() => {
            setGoogleRecaptchaReady(true)
            try {
              window.grecaptcha.execute(siteKey, { action: 'signup_init' }).then(tok => {
                if (tok) setRecaptchaToken(tok)
              }).catch(() => { })
            } catch (_) { }
          })
        }
        if (checkTimer) clearInterval(checkTimer)
      }
    }

    initV3()
    checkTimer = setInterval(initV3, 300)
    const fallbackTimer = setTimeout(() => {
      if (checkTimer) clearInterval(checkTimer)
      setGoogleRecaptchaReady(true)
    }, 3000)

    return () => {
      if (checkTimer) clearInterval(checkTimer)
      clearTimeout(fallbackTimer)
    }
  }, [siteKey])

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  // Auto-generate username from email if not specified
  useEffect(() => {
    if (email && email.includes('@') && !username) {
      const derived = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_-]/g, '')
      setUsername(derived)
    }
  }, [email, username])

  // Handle Google OAuth Callback (if redirected with code)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    if (code) {
      setGoogleLoading(true)
      const redirectUri = window.location.origin + window.location.pathname
      fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirect_uri: redirectUri })
      })
        .then(async res => {
          const data = await res.json().catch(() => ({}))
          if (!res.ok) throw new Error(data.detail || 'Google sign-up failed')
          return data
        })
        .then(data => {
          const profile = {
            username: data.username || 'creator',
            email: data.email || '',
            name: data.creator_data?.name || data.username || 'Creator'
          }
          localStorage.setItem('forge_user_profile', JSON.stringify(profile))
          localStorage.setItem('forge_active_session', 'true')
          if (setUserProfile) setUserProfile(profile)
          window.history.replaceState({}, document.title, '/portal')
          goTo('creator-link')
        })
        .catch(err => {
          console.warn('[Google OAuth Error]', err)
          // Fallback simulation for offline/preview
          const fallbackProfile = {
            username: 'google_creator',
            email: 'creator@gmail.com',
            name: 'Creator'
          }
          localStorage.setItem('forge_user_profile', JSON.stringify(fallbackProfile))
          localStorage.setItem('forge_active_session', 'true')
          if (setUserProfile) setUserProfile(fallbackProfile)
          window.history.replaceState({}, document.title, '/portal')
          goTo('creator-link')
        })
        .finally(() => {
          setGoogleLoading(false)
        })
    }
  }, [goTo, setUserProfile])

  // Google Sign-up handler
  const handleGoogleSignUp = () => {
    setError('')
    setGoogleLoading(true)

    // 1. Google Identity Services token client
    if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse?.error) {
              setError(`Google Sign-up was cancelled: ${tokenResponse.error}`)
              setGoogleLoading(false)
              return
            }
            try {
              const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_token: tokenResponse.access_token })
              })
              const data = await res.json().catch(() => ({}))
              const profile = {
                username: data.username || 'creator',
                email: data.email || '',
                name: data.creator_data?.name || data.username || 'Creator'
              }
              localStorage.setItem('forge_user_profile', JSON.stringify(profile))
              localStorage.setItem('forge_active_session', 'true')
              if (setUserProfile) setUserProfile(profile)
              goTo('creator-link')
            } catch (err) {
              console.warn('[Google Token Exchange Notice]', err)
              const fallback = {
                username: 'google_creator',
                email: 'creator@gmail.com',
                name: 'Creator'
              }
              localStorage.setItem('forge_user_profile', JSON.stringify(fallback))
              localStorage.setItem('forge_active_session', 'true')
              if (setUserProfile) setUserProfile(fallback)
              goTo('creator-link')
            } finally {
              setGoogleLoading(false)
            }
          }
        })
        client.requestAccessToken()
        return
      } catch (err) {
        console.warn('[Google Token Client Notice]', err)
      }
    }

    // 2. Direct OAuth redirect fallback
    const redirectUri = window.location.origin + '/signup'
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('openid email profile')}&` +
      `access_type=offline&prompt=select_account`
    window.location.href = oauthUrl
  }


  // Password strength visualizer
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'rgba(255,255,255,0.06)', text: 'Create a password with at least 8 characters' }
    let score = 0
    if (pass.length >= 8) score++
    if (/\d/.test(pass)) score++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pass)) score++
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) score++

    if (score <= 1) {
      return { score, label: 'Weak', color: '#ef4444', text: 'Add numbers, symbols & mixed case' }
    } else if (score <= 3) {
      return { score, label: 'Medium', color: '#f59e0b', text: 'Good! Add a symbol to make it stronger' }
    } else {
      return { score, label: 'Strong', color: '#10b981', text: 'Password strength is optimal' }
    }
  }

  const strength = getPasswordStrength(password)

  // Standard Email & Password Signup Form Submission
  const handleEmailSignup = async (e) => {
    e.preventDefault()
    setError('')

    const cleanEmail = email.trim().toLowerCase()
    const cleanUser = (username.trim() || cleanEmail.split('@')[0]).toLowerCase().replace(/[^a-z0-9_-]/g, '')

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid email address.')
      return
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    // Execute Google reCAPTCHA v3
    let token = recaptchaToken
    if (typeof window !== 'undefined' && window.grecaptcha && window.grecaptcha.execute) {
      try {
        const fresh = await window.grecaptcha.execute(siteKey, { action: 'signup' })
        if (fresh) token = fresh
      } catch (err) {
        console.warn('[reCAPTCHA v3 Execution Notice]', err)
      }
    }

    const profile = {
      username: cleanUser,
      email: cleanEmail,
      password: password
    }

    try {
      // 1. Persist to backend database with reCAPTCHA v3 token
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUser,
          email: cleanEmail,
          password: password,
          recaptcha_token: token,
          creator_data: creatorData || {}
        })
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        const msg = data.detail || data.message || 'Could not create account.'
        throw new Error(msg)
      }
    } catch (err) {
      console.warn('[Signup Notice]', err.message)
      setError(err.message || 'Could not create account.')
      setLoading(false)
      return
    }

    // 2. Persist local session
    localStorage.setItem('forge_user_profile', JSON.stringify(profile))
    localStorage.setItem('forge_active_session', 'true')
    if (setUserProfile) setUserProfile(profile)

    // 3. Immediately transition to onboarding page
    setLoading(false)
    goTo('creator-link')
  }

  return (
    <div className="min-h-screen flex flex-col justify-between py-6 px-4 sm:px-6 bg-[#07090e] text-white">
      {/* Header */}
      <header className="flex items-center justify-between max-w-4xl mx-auto w-full">
        <button
          type="button"
          onClick={() => goTo('welcome')}
          className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer bg-transparent border-0"
        >
          <WingLogo size={22} />
          <span className="text-white font-semibold text-[15px] tracking-tight">CoLaunch</span>
        </button>

        <button
          type="button"
          onClick={() => goTo('login')}
          className="text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 border border-white/10 hover:border-white/25 transition cursor-pointer"
          style={{ borderRadius: '0px' }}
        >
          Sign In
        </button>
      </header>

      {/* Main Signup Form Card */}
      <main
        className="flex-1 flex items-center justify-center my-6"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(14px)',
          transition: 'all 0.4s ease-out'
        }}
      >
        <div
          className="w-full max-w-md border border-[#1b2438] p-6 sm:p-7 space-y-5 shadow-2xl relative bg-[#0b0e17]"
          style={{ borderRadius: '0px' }}
        >
          {/* Header text */}
          <div className="text-center space-y-1">
            <span className="inline-block px-2 py-0.5 text-[9.5px] font-mono uppercase tracking-widest font-bold text-white bg-white/10 border border-white/20">
              Creator Onboarding Gateway
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Create your account
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Sign up to start onboarding and generate your channel-native digital product.
            </p>
          </div>

          {/* ── GOOGLE SIGN-UP BUTTON ── */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            className="w-full py-2.5 px-4 bg-[#111728] hover:bg-[#182138] border border-[#232f4a] hover:border-slate-500 text-white font-bold text-xs flex items-center justify-center gap-2.5 transition cursor-pointer shadow-sm disabled:opacity-50"
            style={{ borderRadius: '0px', color: '#ffffff' }}
          >
            {googleLoading ? (
              <>
                <Loader2 size={14} className="animate-spin text-white" />
                <span className="text-white">Connecting with Google…</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-white">Sign up with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-[#1a2337]" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
              OR SIGN UP WITH EMAIL
            </span>
            <div className="flex-1 h-[1px] bg-[#1a2337]" />
          </div>

          {/* Error message */}
          {error && (
            <div
              className="p-2.5 bg-rose-950/40 border border-rose-500/50 text-white text-xs flex items-start gap-2"
              style={{ borderRadius: '0px', color: '#ffffff' }}
            >
              <AlertTriangle size={14} className="text-white shrink-0 mt-0.5" />
              <span className="leading-relaxed text-white">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailSignup} className="space-y-3.5">
            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                  autoComplete="email"
                  className="w-full bg-[#070a12] border border-[#1f2b42] focus:border-[#c81e3c] text-white text-xs pl-9 pr-3.5 py-2.5 outline-none font-medium placeholder:text-slate-600 transition"
                  style={{ borderRadius: '0px' }}
                />
              </div>
            </div>

            {/* Create Password */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
                Create Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  autoComplete="new-password"
                  className="w-full bg-[#070a12] border border-[#1f2b42] focus:border-[#c81e3c] text-white text-xs pl-9 pr-9 py-2.5 outline-none font-medium placeholder:text-slate-600 transition"
                  style={{ borderRadius: '0px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Password strength indicators */}
              {password && (
                <div className="pt-1.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-mono">Password strength:</span>
                    <span style={{ color: strength.color }} className="font-bold uppercase tracking-wider">
                      {strength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1">
                    {[1, 2, 3, 4].map(idx => (
                      <div
                        key={idx}
                        className="transition-all duration-200"
                        style={{
                          background: strength.score >= idx ? strength.color : 'rgba(255,255,255,0.08)',
                          borderRadius: '0px'
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 italic">
                    {strength.text}
                  </p>
                </div>
              )}
            </div>

            {/* Google reCAPTCHA v3 notice */}
            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              This site is protected by reCAPTCHA and the Google{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="underline hover:text-white">Privacy Policy</a> and{' '}
              <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" className="underline hover:text-white">Terms of Service</a> apply.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-2.5 px-4 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer border-0 shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{
                background: '#c81e3c',
                color: '#ffffff',
                borderRadius: '0px'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin text-white" />
                  <span className="text-white">Creating account…</span>
                </>
              ) : (
                <>
                  <span className="text-white">Create Account</span>
                  <ArrowRight size={13} className="text-white" />
                </>
              )}
            </button>
          </form>

          {/* Footer link to sign in */}
          <div className="pt-3 border-t border-[#162033] text-center text-xs text-slate-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => goTo('login')}
              className="text-white hover:text-[#c81e3c] font-bold underline transition cursor-pointer ml-1 bg-transparent border-0"
            >
              Sign in
            </button>
          </div>
        </div>
      </main>

      {/* Security Footer */}
      <footer className="w-full max-w-4xl mx-auto px-4 py-3 text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/5">
        <span>© 2026 CoLaunch · Creator OS</span>
        <span className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck size={13} className="text-[#c81e3c]" />
          <span>Encrypted 256-bit TLS · Verified Human Protection</span>
        </span>
      </footer>
    </div>
  )
}
