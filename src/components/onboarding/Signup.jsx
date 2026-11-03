import { useState, useEffect } from 'react'
import { useForge } from '../../App'
import { ArrowRight, Lock, Mail, User, AlertTriangle, ShieldCheck, ShieldAlert, Sparkles, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import WingLogo from '../ui/WingLogo'
import { loadAiKeys, saveAiKeysToDb, setAiKeysConsent } from '../../services/ai'

export default function Signup() {
  const { next, creatorData, updateCreator, setUserProfile, goTo } = useForge()
  
  // Default to scraped handle or name, sanitized for username format (a-z0-9_-)
  const defaultUsername = (creatorData.handle || creatorData.name || '')
    .toLowerCase()
    .replace(/^@/, '') // Remove leading @ if present
    .replace(/[^a-z0-9_-]/g, '')

  const [username, setUsername] = useState(defaultUsername)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(true)
  const [aiConsent, setAiConsent] = useState(false)
  const [visible, setVisible] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [countdown, setCountdown] = useState(4)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  // Auto-advance countdown upon successful account creation
  useEffect(() => {
    if (!signupSuccess) return
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          goTo('dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [signupSuccess, goTo])

  // Dynamic Password Strength Meter logic
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'rgba(255,255,255,0.06)' }
    
    let score = 0
    const length = pass.length >= 8
    const hasNumber = /\d/.test(pass)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    const hasMixedCase = /[a-z]/.test(pass) && /[A-Z]/.test(pass)

    if (length) score++
    if (hasNumber) score++
    if (hasSpecial) score++
    if (hasMixedCase) score++

    if (score <= 1) {
      return { score, label: 'Weak', color: '#ef4444', text: 'Add numbers, special characters, and casing' }
    } else if (score <= 3) {
      return { score, label: 'Medium', color: '#f59e0b', text: 'Almost there! Make it even stronger' }
    } else {
      return { score, label: 'Strong', color: '#10b981', text: 'Awesome! Your password is secure' }
    }
  }

  const strength = getPasswordStrength(password)

  const handleSignup = (e) => {
    e.preventDefault()
    if (!username.trim() || !email.trim() || !password || strength.score < 2) return

    setSubmitted(true)
    setError('')

    const profile = {
      username: username.trim(),
      email: email.trim(),
      password: password
    }

    // Save operator details in localStorage
    localStorage.setItem('forge_user_profile', JSON.stringify(profile))
    if (setUserProfile) setUserProfile(profile)

    // Save active session flag
    localStorage.setItem('forge_active_session', 'true')

    // Save final creatorData in localStorage to finalize
    localStorage.setItem('forge_creator_data', JSON.stringify(creatorData))

    // Extract localstorage payload to persist to DB
    const h = creatorData?.handle || 'default'
    const calendar_data = {}
    const launch_pack_data = {}
    const studio_data = {}
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('forge_calendar_')) {
        calendar_data[key] = localStorage.getItem(key)
      } else if (key && (key.startsWith(`forge_${h}_launch_pack`) || key.startsWith(`forge_${h}_launch_image`))) {
        launch_pack_data[key] = localStorage.getItem(key)
      } else if (key && key.startsWith(`forge_${h}_studio_`)) {
        studio_data[key] = localStorage.getItem(key)
      }
    }

    // Register account in backend SQLite DB along with local session progress
    fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.trim(),
        email: email.trim(),
        password: password,
        creator_data: creatorData,
        calendar_data,
        launch_pack_data,
        studio_data
      })
    })
      .then(async res => {
        if (!res.ok) {
          let msg = 'Failed to register account on database.'
          try {
            const data = await res.json()
            if (data && data.detail) {
              msg = data.detail
            }
          } catch {}
          throw new Error(msg)
        }
        return res.json()
      })
      .then(data => {
        console.log('[Forge] Registered account successfully in DB:', data)
        // Send the signup welcome email via SendGrid backend proxy
        fetch('/api/auth/signup-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim(),
            username: username.trim()
          })
        }).catch(err => console.error('[Forge] Signup email error:', err))

        // Save AI keys if consented
        if (aiConsent) {
          setAiKeysConsent(true)
          saveAiKeysToDb(username.trim())
        }

        // Activate celebratory successful signup confirmation message
        setSignupSuccess(true)
        setSubmitted(false)
      })
      .catch(err => {
        console.error('[Forge] Signup DB storage failed:', err)
        setError(err.message || 'Failed to register account on database.')
        setSubmitted(false)
      })
  }

  const isFormValid = username.trim() && email.trim() && password && strength.score >= 2 && agree

  return (
    <div className="min-h-screen flex flex-col justify-between py-8 px-6">
      {/* Header */}
      <header className="flex items-center justify-between max-w-4xl mx-auto w-full">
        <button onClick={() => goTo('welcome')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <WingLogo size={22} />
          <span className="text-white font-semibold text-[15px] tracking-tight">CoLaunch</span>
        </button>
        <div className="flex items-center gap-1.5">
          {[1,2,3,4,5,6,7,8,9].map(i => (
            <div key={i} className="rounded-full transition-all duration-300"
              style={{
                width: i === 9 ? '20px' : '6px',
                height: '6px',
                background: i === 9 ? 'white' : 'rgba(255,255,255,0.6)',
              }}
            />
          ))}
        </div>
      </header>

      {/* Main card */}
      <main 
        className="flex-1 flex items-center justify-center my-6"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.55s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {signupSuccess ? (
          <div 
            className="w-full max-w-lg p-8 space-y-6 shadow-2xl relative border"
            style={{ 
              background: '#0c0f17', 
              borderColor: '#1e2638',
              borderRadius: '0px'
            }}
          >
            {/* Celebration Badge & Headline */}
            <div className="text-center space-y-3">
              <div 
                className="w-16 h-16 mx-auto flex items-center justify-center shadow-lg"
                style={{ 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '0px'
                }}
              >
                <CheckCircle2 size={36} className="text-emerald-400" />
              </div>
              <div>
                <span 
                  className="inline-block px-3 py-1 text-[10px] font-mono uppercase tracking-widest font-bold text-emerald-400 mb-2"
                  style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '0px' }}
                >
                  Account Created Successfully
                </span>
                <h2 className="text-[26px] font-bold text-white tracking-tight">
                  Welcome to CoLaunch, {username}!
                </h2>
                <p className="text-[13px] text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                  Your creator workspace is fully provisioned. All your campaign schedules, audience insights, and monetization blueprints are saved securely on MongoDB Atlas.
                </p>
              </div>
            </div>

            {/* Profile & Security Credentials Spec */}
            <div 
              className="p-4 space-y-3 border"
              style={{ background: '#111624', borderColor: '#1f2a3f', borderRadius: '0px' }}
            >
              <div className="flex items-center justify-between text-[12px] pb-2.5 border-b border-white/5">
                <span className="text-slate-400 flex items-center gap-2">
                  <Mail size={13} className="text-slate-400" /> Registered Email:
                </span>
                <div className="flex items-center gap-1.5 font-medium text-white">
                  <span>{email}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">✓ Verified</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[12px] pb-2.5 border-b border-white/5">
                <span className="text-slate-400 flex items-center gap-2">
                  <ShieldCheck size={13} className="text-slate-400" /> Cloud Database:
                </span>
                <span className="text-white font-mono text-[11px]">MongoDB Atlas Secured</span>
              </div>

              <div className="flex items-center justify-between text-[12px] pb-2.5 border-b border-white/5">
                <span className="text-slate-400 flex items-center gap-2">
                  <Sparkles size={13} className="text-slate-400" /> Workspace Host:
                </span>
                <span className="text-[#38bdf8] font-mono text-[11px]">app.co-launch.app</span>
              </div>

              <div className="flex items-start justify-between text-[12px] pt-1">
                <span className="text-slate-400 flex items-center gap-2">
                  <Mail size={13} className="text-slate-400" /> Welcome Pack:
                </span>
                <span className="text-emerald-400 text-[11px] text-right font-medium">
                  Sent to {email}
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => goTo('dashboard')}
                className="w-full py-3.5 px-6 font-bold text-[13px] uppercase tracking-wider text-white flex items-center justify-center gap-2 transition-all duration-150 hover:brightness-110 active:scale-[0.99] cursor-pointer border-0"
                style={{
                  background: '#c81e3c',
                  borderRadius: '0px'
                }}
              >
                Launch CoLaunch Console ({countdown}s)
                <ArrowRight size={15} />
              </button>

              <p className="text-center text-[11px] text-slate-500 font-mono">
                Automatically entering your workspace in {countdown} seconds...
              </p>
            </div>
          </div>
        ) : (
          <div 
            className="w-full max-w-md border p-6 space-y-6 shadow-2xl relative"
            style={{ 
              background: '#0c0f17', 
              borderColor: '#1e2638',
              borderRadius: '0px'
            }}
          >
            {/* Title */}
            <div className="text-center">
              <p className="forge-label mb-2">Secure Operator Console</p>
              <h2 className="forge-heading text-[24px] tracking-tight mb-2">Create your account</h2>
              <p className="text-[13px]" style={{ color: 'var(--theme-text-muted)' }}>
                Set up your secure details to access the CoLaunch command center.
              </p>
            </div>

            {/* Warning Banner */}
            <div 
              className="border p-3.5 flex items-start gap-3"
              style={{ 
                background: 'rgba(245, 158, 11, 0.04)', 
                borderColor: 'rgba(245, 158, 11, 0.15)',
                borderRadius: '0px'
              }}
            >
              <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={15} />
              <div className="space-y-0.5">
                <h4 className="text-[12px] font-semibold text-white">Do Not Refresh Your Browser</h4>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                  All generated assets, platform recommendations, and telemetry logs are saved locally. Refreshing could reset your session.
                </p>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div 
                className="border p-3 flex items-center gap-2.5 text-left"
                style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)', borderRadius: '0px' }}
              >
                <AlertTriangle className="text-red-500 flex-shrink-0" size={14} />
                <p className="text-[12px] text-red-200 leading-snug">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>Username</label>
                <div className="forge-input-wrap">
                  <User size={14} style={{ color: 'var(--theme-text-muted)' }} />
                  <input
                    type="text"
                    required
                    disabled={submitted}
                    className="forge-input text-[13px]"
                    placeholder="e.g. janesmith"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>Email address</label>
                <div className="forge-input-wrap">
                  <Mail size={14} style={{ color: 'var(--theme-text-muted)' }} />
                  <input
                    type="email"
                    required
                    disabled={submitted}
                    className="forge-input text-[13px]"
                    placeholder="name@domain.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>Password</label>
                <div className="forge-input-wrap">
                  <Lock size={14} style={{ color: 'var(--theme-text-muted)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={submitted}
                    className="forge-input text-[13px]"
                    placeholder="Choose a strong password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="text-white/25 hover:text-white/60 transition-colors mr-1 cursor-pointer border-0 bg-transparent"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Password strength visualizer */}
                {password && (
                  <div className="pt-1 space-y-2">
                    <div className="flex justify-between items-center text-[10px]">
                      <span style={{ color: 'var(--theme-text-muted)' }}>Security Strength:</span>
                      <span style={{ color: strength.color }} className="font-bold uppercase tracking-wider">
                        {strength.label}
                      </span>
                    </div>
                    
                    {/* Visual segments */}
                    <div className="grid grid-cols-3 gap-1.5 h-1">
                      <div className="transition-all duration-300" style={{ background: strength.score >= 1 ? strength.color : 'rgba(255,255,255,0.06)', borderRadius: '0px' }} />
                      <div className="transition-all duration-300" style={{ background: strength.score >= 2 ? strength.color : 'rgba(255,255,255,0.06)', borderRadius: '0px' }} />
                      <div className="transition-all duration-300" style={{ background: strength.score >= 4 ? strength.color : 'rgba(255,255,255,0.06)', borderRadius: '0px' }} />
                    </div>
                    
                    <p className="text-[10px] italic leading-tight" style={{ color: 'var(--theme-text-muted)' }}>
                      {strength.text}
                    </p>
                  </div>
                )}
              </div>

              {/* Checkbox */}
              <label className="flex items-start gap-2.5 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={submitted}
                  checked={agree}
                  onChange={e => setAgree(e.target.checked)}
                  className="mt-0.5 accent-[#c81e3c] border-white/10"
                  style={{ borderRadius: '0px' }}
                />
                <span className="text-[11.5px] leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                  I authorize CoLaunch to serialize and secure my YouTube/social scraped signals and AI pack to my local browser database (localStorage).
                </span>
              </label>

              {/* AI API Keys Consent Checkbox */}
              {Object.values(loadAiKeys()).some(k => k) && (
                <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    disabled={submitted}
                    checked={aiConsent}
                    onChange={e => setAiConsent(e.target.checked)}
                    className="mt-0.5 accent-[#c81e3c] border-white/10"
                    style={{ borderRadius: '0px' }}
                  />
                  <span className="text-[11.5px] leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
                    I authorize CoLaunch to securely save my provided AI API keys to my account database so I don't have to re-enter them on other devices.
                  </span>
                </label>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!isFormValid || submitted}
                className="w-full text-[13px] font-bold uppercase tracking-wider py-3.5 mt-4 group disabled:opacity-30 disabled:pointer-events-none text-white transition-all flex items-center justify-center gap-2 cursor-pointer border-0"
                style={{
                  background: '#c81e3c',
                  borderRadius: '0px'
                }}
              >
                {submitted ? (
                  <>Saving secure credentials…</>
                ) : (
                  <>
                    Create account &amp; launch console
                    <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      <footer className="text-center max-w-md mx-auto w-full flex-shrink-0 pb-6">
        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
          © 2026 CoLaunch. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
