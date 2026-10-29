import React, { useState } from 'react'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  X,
  Loader2,
  KeyRound,
  ArrowRight
} from 'lucide-react'

export default function SetCredentialsModal({
  isOpen,
  onClose,
  userProfile,
  onSaved
}) {
  const [email, setEmail] = useState(() => {
    const e = userProfile?.email || ''
    return (e === 'creatorforgeweb@gmail.com' || e.endsWith('@example.com')) ? '' : e
  })
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  // Email format validation
  const isValidEmail = (val) => {
    if (!val) return false
    const trimmed = val.trim().toLowerCase()
    if (trimmed === 'creatorforgeweb@gmail.com' || trimmed.endsWith('@example.com')) return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
  }

  // Password strength calculation
  const getStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'bg-slate-700', text: 'Enter at least 6 characters' }
    let score = 0
    if (pass.length >= 6) score++
    if (pass.length >= 8) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++

    if (score <= 1) return { score, label: 'Weak', color: 'bg-rose-500', text: 'Too short or simple' }
    if (score <= 2) return { score, label: 'Fair', color: 'bg-amber-500', text: 'Add numbers or symbols' }
    if (score === 3) return { score, label: 'Good', color: 'bg-cyan-500', text: 'Good password security' }
    return { score, label: 'Strong', color: 'bg-emerald-400', text: 'Excellent security' }
  }

  const strength = getStrength(password)
  const passwordsMatch = password.length > 0 && password === confirmPassword

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()
    setError('')

    const cleanEmail = email.trim().toLowerCase()
    if (!isValidEmail(cleanEmail)) {
      setError('Please enter a valid, active email address (not a default placeholder).')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.')
      return
    }

    const username = userProfile?.username || 'creator'

    setLoading(true)

    try {
      const res = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email: cleanEmail,
          password
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to update credentials. Please try again.')
      }

      // Update local storage
      const updatedProfile = {
        ...(userProfile || {}),
        username,
        email: cleanEmail,
        password,
        needsCredentials: false
      }
      localStorage.setItem('forge_user_profile', JSON.stringify(updatedProfile))

      setSuccess(true)

      // Notify parent or context
      if (onSaved) {
        onSaved(updatedProfile)
      }

      // Dispatch global event so all open tabs or listening components update immediately
      window.dispatchEvent(new CustomEvent('forge_credentials_updated', { detail: updatedProfile }))

      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1100)
    } catch (err) {
      setError(err.message || 'An error occurred while saving your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#0a0f1d] border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-[0_0_50px_-10px_rgba(245,158,11,0.25)] space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400 shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Account Credentials</h3>
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Required
                </span>
              </div>
              <p className="text-[12px] text-slate-400 mt-0.5">
                Set your real login email and password to secure your dashboard.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading || success}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success screen */}
        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)]">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-white">Credentials Saved!</h4>
            <p className="text-xs text-slate-300 max-w-xs">
              Your account is now secured with your email <span className="text-cyan-400 font-mono font-medium">{email}</span>. You can use it to log in anytime.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Email input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Real Login Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="e.g. yourname@brand.com"
                  autoFocus
                  required
                  className="w-full bg-[#121826] border border-white/[0.1] focus:border-amber-400/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner focus:ring-1 focus:ring-amber-400/50"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                You will use this email address to sign in to your dashboard.
              </p>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="Create a strong password (min 6 chars)"
                  required
                  className="w-full bg-[#121826] border border-white/[0.1] focus:border-amber-400/80 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner focus:ring-1 focus:ring-amber-400/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="pt-1 space-y-1">
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 rounded-full h-full transition-all duration-300 ${
                          strength.score >= step ? strength.color : 'bg-slate-700/50'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">{strength.text}</span>
                    <span className={`font-semibold ${strength.score >= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {strength.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password input */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (error) setError('')
                  }}
                  placeholder="Re-enter password to verify"
                  required
                  className={`w-full bg-[#121826] border rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner ${
                    confirmPassword && !passwordsMatch
                      ? 'border-rose-500/70 focus:border-rose-500'
                      : confirmPassword && passwordsMatch
                      ? 'border-emerald-500/70 focus:border-emerald-500'
                      : 'border-white/[0.1] focus:border-amber-400/80 focus:ring-1 focus:ring-amber-400/50'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {confirmPassword && (
                <div className="text-[10px] flex items-center gap-1.5">
                  {passwordsMatch ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Passwords match
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <AlertTriangle size={11} /> Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                Remind Me Later
              </button>
              <button
                type="submit"
                disabled={loading || !isValidEmail(email) || password.length < 6 || !passwordsMatch}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-lg shadow-amber-500/25 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-slate-950" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Save & Secure Account</span>
                    <ArrowRight size={13} className="text-slate-950" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
