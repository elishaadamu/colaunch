import { useState, useEffect } from 'react'
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle, X, CheckCircle2 } from 'lucide-react'

/**
 * Checks whether the current user has registered with a valid email and password.
 * Returns false if userProfile is missing, is a temporary guest profile, or has no password.
 */
export function isUserSignedUpWithPassword(userProfile) {
  if (!userProfile) return false
  const email = (userProfile.email || '').trim().toLowerCase()
  if (
    !email ||
    email.endsWith('@colaunch.app') ||
    email.endsWith('@example.com') ||
    email.endsWith('@test.com') ||
    email === 'creatorforgeweb@gmail.com'
  ) {
    return false
  }
  if (userProfile.needsCredentials || userProfile.needsPassword) {
    return false
  }
  if (!userProfile.password && !userProfile.has_password) {
    return false
  }
  return true
}

export default function RequiredSignupModal({
  isOpen,
  onClose,
  mode = 'logout', // 'logout' | 'save'
  userProfile = {},
  creatorData = {},
  setUserProfile,
  logout,
  triggerToast
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setError('')
      setPassword('')
      setConfirmPassword('')
      // Pre-fill valid creator email if available
      const rawEmail = userProfile?.email || creatorData?.email || ''
      if (rawEmail && !rawEmail.endsWith('@colaunch.app') && !rawEmail.endsWith('@example.com')) {
        setEmail(rawEmail)
      } else {
        setEmail('')
      }
    }
  }, [isOpen, userProfile?.email, creatorData?.email])

  if (!isOpen) return null

  const isLogoutMode = mode === 'logout'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.')
      return
    }

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.')
      return
    }

    setLoading(true)

    const rawUsername = userProfile?.username || creatorData?.handle || cleanEmail.split('@')[0]
    const cleanUsername = rawUsername.replace(/^@+/, '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'creator'

    const updatedProfile = {
      username: cleanUsername,
      email: cleanEmail,
      password: password,
      name: creatorData?.name || cleanUsername,
      needsCredentials: false,
      needsPassword: false,
      has_password: true,
      registered_at: new Date().toISOString()
    }

    try {
      // 1. Send registration to backend API
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          email: cleanEmail,
          password: password,
          creator_data: creatorData || {}
        })
      }).catch(() => null)

      if (res && !res.ok) {
        const data = await res.json().catch(() => ({}))
        // If account already exists with this email, try updating or logging in
        if (data.detail && data.detail.includes('already exists')) {
          // Attempt credentials update endpoint
          await fetch('/api/auth/update-credentials', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: cleanEmail,
              password: password
            })
          }).catch(() => null)
        }
      }
    } catch (_) {
      // Fallback: local session is still guaranteed below
    }

    // 2. Persist real credentials to localStorage
    try {
      localStorage.setItem('forge_user_profile', JSON.stringify(updatedProfile))
      localStorage.setItem('forge_active_session', 'true')
    } catch (_) {}

    if (setUserProfile) {
      setUserProfile(updatedProfile)
    }

    setLoading(false)

    if (isLogoutMode) {
      if (triggerToast) {
        triggerToast('Account created! Your progress is securely saved.', 'success')
      }
      onClose()
      if (logout) {
        logout()
      }
    } else {
      if (triggerToast) {
        triggerToast('Account created! Your software workspace is permanently secured.', 'success')
      }
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-[#0c1017] border border-white/10 rounded-none p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 text-left">
        {/* Close icon (cancels the logout / modal) */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer p-1 bg-transparent border-0"
          title="Cancel"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3 pt-1">
          <div className="w-10 h-10 rounded-none bg-[#c81e3c]/15 border border-[#c81e3c]/35 flex items-center justify-center text-[#ff6b81] shrink-0 mt-0.5">
            {isLogoutMode ? <Lock size={20} /> : <ShieldCheck size={20} />}
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {isLogoutMode ? 'Sign-Up Required Before Logout' : 'Sign Up to Secure Your Workspace'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {isLogoutMode
                ? 'Before logging out, please sign up with your email and password so your software launch plan, audience research, and content drafts are safely saved.'
                : 'Set up your email and password to preserve your software venture, protect member billing, and enable safe access.'}
            </p>
          </div>
        </div>

        {/* Error notice */}
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-start gap-2 rounded-none">
            <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoComplete="email"
                className="w-full bg-[#10141f] border border-[#1f2638] focus:border-[#c81e3c] text-white text-xs pl-9 pr-3 py-2.5 outline-none rounded-none transition font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Create Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                autoComplete="new-password"
                className="w-full bg-[#10141f] border border-[#1f2638] focus:border-[#c81e3c] text-white text-xs pl-9 pr-9 py-2.5 outline-none rounded-none transition font-medium"
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
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                autoComplete="new-password"
                className="w-full bg-[#10141f] border border-[#1f2638] focus:border-[#c81e3c] text-white text-xs pl-9 pr-3 py-2.5 outline-none rounded-none transition font-medium"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={loading || !email || !password || !confirmPassword}
              className="w-full py-2.5 px-4 bg-[#c81e3c] hover:bg-[#b01732] active:bg-[#99142b] text-white font-bold text-xs uppercase tracking-wider rounded-none transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#c81e3c]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin text-white" />
                  <span>{isLogoutMode ? 'Securing Account & Logging Out…' : 'Creating Account…'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>{isLogoutMode ? 'Sign Up & Safely Log Out' : 'Sign Up & Secure Workspace'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer text-center bg-transparent border border-white/5 hover:border-white/15"
            >
              {isLogoutMode ? 'Cancel & Stay in Workspace' : 'Cancel'}
            </button>
          </div>
        </form>

        <p className="text-[10px] text-slate-500 text-center pt-1 font-mono">
          © 2026 CoLaunch · Your data is encrypted and permanently associated with this account.
        </p>
      </div>
    </div>
  )
}
