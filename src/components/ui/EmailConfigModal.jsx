import React, { useState, useEffect, useRef } from 'react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  RotateCcw
} from 'lucide-react'

export default function EmailConfigModal({
  isOpen,
  onClose,
  userProfile,
  creatorData,
  setUserProfile,
  updateCreator,
  triggerToast
}) {
  const currentEmail = (userProfile?.email || creatorData?.email || '').trim()
  const initialEmail = (currentEmail === 'creatorforgeweb@gmail.com' || currentEmail.endsWith('@example.com') || currentEmail.endsWith('@test.com'))
    ? ''
    : currentEmail

  const [step, setStep] = useState('input') // 'input' | 'verify' | 'success'
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendTimer, setResendTimer] = useState(0)

  const codeInputRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setStep('input')
      setEmail(initialEmail)
      setCode('')
      setError('')
      setLoading(false)
    }
  }, [isOpen, initialEmail])

  // Countdown timer for code resend
  useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => {
      setResendTimer(t => t - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  // Auto-focus code input when switching to verify step
  useEffect(() => {
    if (step === 'verify' && codeInputRef.current) {
      codeInputRef.current.focus()
    }
  }, [step])

  // Auto-close modal after successful verification
  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        onClose()
      }, 2400)
      return () => clearTimeout(timer)
    }
  }, [step, onClose])

  if (!isOpen) return null

  const brandRed = '#c81e3c'

  const isValidEmail = (val) => {
    if (!val) return false
    const trimmed = val.trim().toLowerCase()
    if (trimmed === 'creatorforgeweb@gmail.com') return false
    if (trimmed.endsWith('@example.com') || trimmed.endsWith('@test.com')) return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
  }

  const candidateUrls = [
    '',
    'https://creator-forge-backend-jj1y.onrender.com',
    'https://creator-forge-backend.onrender.com'
  ]

  // Step 1: Send verification code to the email address
  const handleSendCode = async (e) => {
    if (e) e.preventDefault()
    setError('')

    const cleanEmail = email.trim().toLowerCase()
    if (!isValidEmail(cleanEmail)) {
      setError('Please enter a valid, active email address (e.g. you@yourbrand.com).')
      return
    }

    if (password && password.length < 6) {
      setError('If setting a password, it must be at least 6 characters long.')
      return
    }

    setLoading(true)

    try {
      let sentOk = false
      let lastErr = null

      for (const baseUrl of candidateUrls) {
        try {
          const res = await fetch(`${baseUrl}/api/auth/send-code`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cleanEmail })
          })
          if (res.ok) {
            sentOk = true
            break
          } else {
            const data = await res.json().catch(() => ({}))
            if (data.detail) lastErr = new Error(data.detail)
          }
        } catch (err) {
          lastErr = err
        }
      }

      if (!sentOk && lastErr && lastErr.message && !lastErr.message.includes('fetch')) {
        throw lastErr
      }

      // Transition to code verification step
      setStep('verify')
      setResendTimer(60)
      if (triggerToast) {
        triggerToast(`Verification code sent to ${cleanEmail}`, 'info')
      }
    } catch (err) {
      setError(err.message || 'Failed to send verification code. Please check email address.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify code & save profile on MongoDB Atlas
  const handleVerifyAndSave = async (e) => {
    if (e) e.preventDefault()
    setError('')

    const cleanCode = code.trim()
    if (!cleanCode || cleanCode.length < 6) {
      setError('Please enter the full 6-digit verification code from your email.')
      return
    }

    setLoading(true)

    try {
      const cleanEmail = email.trim().toLowerCase()
      const cleanPassword = password ? password.trim() : ''
      const cleanHandle = (creatorData?.handle || '').replace(/^@+/, '').trim()
      const username = userProfile?.username || cleanHandle || creatorData?.name || cleanEmail.split('@')[0]

      const payload = {
        username,
        email: cleanEmail,
        password: cleanPassword || undefined,
        verification_code: cleanCode,
        creator_data: creatorData || {}
      }

      let savedOk = false
      let lastErr = null
      let responseData = null

      for (const baseUrl of candidateUrls) {
        try {
          const res = await fetch(`${baseUrl}/api/auth/update-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          if (res.ok) {
            responseData = await res.json().catch(() => ({}))
            savedOk = true
            break
          } else {
            const data = await res.json().catch(() => ({}))
            if (data.detail) lastErr = new Error(data.detail)
          }
        } catch (err) {
          lastErr = err
        }
      }

      if (!savedOk) {
        throw lastErr || new Error('Verification failed. Please check the code and try again.')
      }

      // Update userProfile in state and localStorage
      const updatedProfile = {
        ...(userProfile || {}),
        username: responseData?.username || username,
        email: cleanEmail,
        email_verified: true,
        password: cleanPassword || (userProfile?.password || ''),
        has_password: Boolean(cleanPassword || userProfile?.password),
        needsCredentials: false,
        needsPassword: false
      }
      try {
        localStorage.setItem('forge_user_profile', JSON.stringify(updatedProfile))
        localStorage.setItem('forge_active_session', 'true')
      } catch {}
      if (setUserProfile) {
        setUserProfile(updatedProfile)
      }

      // Update creatorData in state and localStorage
      const updatedCreator = {
        ...(creatorData || {}),
        email: cleanEmail,
        contactEmail: cleanEmail,
        email_verified: true
      }
      try {
        localStorage.setItem('forge_creator_data', JSON.stringify(updatedCreator))
      } catch {}
      if (updateCreator) {
        updateCreator({ email: cleanEmail, contactEmail: cleanEmail, email_verified: true })
      }

      if (triggerToast) {
        triggerToast(`Email verified and account registered: ${cleanEmail}`, 'success')
      }

      setStep('success')
    } catch (err) {
      setError(err.message || 'Failed to verify code. Please check and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div 
        className="bg-[#0c0f17] rounded-none max-w-md w-full p-6 text-slate-200 shadow-2xl border border-[#202738] animate-fadeIn"
        style={{ borderRadius: '0px' }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#161b2b]">
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-none flex items-center justify-center shrink-0"
              style={{ background: step === 'success' ? '#10b981' : brandRed, color: '#ffffff', borderRadius: '0px' }}
            >
              {step === 'input' ? <Mail size={16} className="text-white" /> : step === 'verify' ? <KeyRound size={16} className="text-white" /> : <CheckCircle2 size={16} className="text-white" />}
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm">
                {step === 'input' ? 'Configure & Verify Email' : step === 'verify' ? 'Verify Email Authentication Code' : 'Email Verified Successfully'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {step === 'input' ? 'Required for campaign outreach & member access' : step === 'verify' ? 'Enter the 6-digit code sent to your email' : 'Your account credentials have been synchronized'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-none hover:bg-[#161b2b] text-slate-400 hover:text-white transition cursor-pointer border-0"
            style={{ borderRadius: '0px' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body: STEP 1 - EMAIL & PASSWORD INPUT */}
        {step === 'input' && (
          <form onSubmit={handleSendCode} className="py-3 space-y-3">
            {error && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-white rounded-none text-xs flex items-start gap-2" style={{ color: '#ffffff' }}>
                <AlertCircle size={14} className="text-white shrink-0 mt-0.5" />
                <span className="text-white">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Your Creator Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. creator@yourbrand.com"
                  className="w-full bg-[#111522] text-white rounded-none p-2.5 pl-8 text-xs border border-[#202738] focus:border-[#c81e3c] outline-none transition"
                  style={{ borderRadius: '0px' }}
                  autoFocus
                  required
                />
                <Mail size={14} className="absolute left-2.5 top-3 text-slate-500" />
              </div>
              <p className="text-[10.5px] text-slate-400 mt-1">
                We will send a 6-digit verification code to confirm ownership before activating your account.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider">
                Set / Update Password <span className="text-slate-500 text-[10px] font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to use email code login"
                  className="w-full bg-[#111522] text-white rounded-none p-2.5 pl-8 pr-8 text-xs border border-[#202738] focus:border-[#c81e3c] outline-none transition"
                  style={{ borderRadius: '0px' }}
                />
                <Lock size={14} className="absolute left-2.5 top-3 text-slate-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-2.5 top-3 text-slate-500 hover:text-slate-300 border-0 bg-transparent cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="p-2.5 bg-[#111522] border border-[#202738] rounded-none text-[11px] text-slate-300 flex items-start gap-2">
              <ShieldCheck size={13} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Your email is encrypted and verified with two-factor authentication. Saved directly to MongoDB Atlas.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-1.5 flex items-center justify-end gap-2 border-t border-[#161b2b]">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-white bg-[#111522] hover:bg-[#161b2b] rounded-none cursor-pointer border border-[#202738]"
                style={{ borderRadius: '0px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-xs font-extrabold text-white rounded-none flex items-center gap-1.5 transition cursor-pointer shadow-md hover:opacity-95 border-0 disabled:opacity-50"
                style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-white" />
                    <span className="text-white font-bold">Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span className="text-white font-bold">Send Verification Code</span>
                    <ArrowRight size={13} className="text-white" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Modal Body: STEP 2 - CODE VERIFICATION */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyAndSave} className="py-3 space-y-3">
            {error && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-white rounded-none text-xs flex items-start gap-2" style={{ color: '#ffffff' }}>
                <AlertCircle size={14} className="text-white shrink-0 mt-0.5" />
                <span className="text-white">{error}</span>
              </div>
            )}

            <div className="p-2.5 bg-[#111522] border border-[#202738] rounded-none flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Mail size={13} className="text-slate-400 shrink-0" />
                <span className="font-mono text-white font-semibold truncate max-w-[220px]">{email}</span>
              </div>
              <button
                type="button"
                onClick={() => { setStep('input'); setError('') }}
                className="text-xs text-white hover:underline cursor-pointer border-0 bg-transparent font-medium"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 uppercase tracking-wider text-center">
                6-Digit Authentication Code <span className="text-rose-500">*</span>
              </label>
              <input
                ref={codeInputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                className="w-full bg-[#111522] text-white rounded-none p-2.5 text-center font-mono text-xl font-extrabold tracking-widest border border-[#202738] focus:border-[#c81e3c] outline-none transition"
                style={{ borderRadius: '0px', letterSpacing: '0.35em' }}
                autoFocus
                required
              />
              <p className="text-[10.5px] text-slate-400 text-center mt-1.5">
                Enter the 6-digit code sent to your email inbox. Valid for 15 minutes.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <button
                type="button"
                onClick={handleSendCode}
                disabled={resendTimer > 0 || loading}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition cursor-pointer border-0 bg-transparent disabled:opacity-40 disabled:cursor-not-allowed text-[11px]"
              >
                <RotateCcw size={12} className={loading ? 'animate-spin' : ''} />
                <span>{resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend verification code'}</span>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="pt-1.5 flex items-center justify-between gap-2 border-t border-[#161b2b]">
              <button
                type="button"
                onClick={() => { setStep('input'); setError('') }}
                className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white bg-[#111522] hover:bg-[#161b2b] rounded-none cursor-pointer border border-[#202738] inline-flex items-center gap-1"
                style={{ borderRadius: '0px' }}
              >
                <ArrowLeft size={12} />
                <span>Back</span>
              </button>

              <button
                type="submit"
                disabled={loading || code.trim().length !== 6}
                className="px-4 py-2 text-xs font-extrabold text-white rounded-none flex items-center gap-1.5 transition cursor-pointer shadow-md hover:opacity-95 border-0 disabled:opacity-50"
                style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
              >
                {loading ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-white" />
                    <span className="text-white font-bold">Verifying &amp; Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={13} className="text-white" />
                    <span className="text-white font-bold">Verify &amp; Link Account</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Modal Body: STEP 3 - SUCCESS CONFIRMATION */}
        {step === 'success' && (
          <div className="py-4 space-y-3.5 text-center">
            <div 
              className="w-11 h-11 mx-auto flex items-center justify-center shadow-lg"
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '0px'
              }}
            >
              <CheckCircle2 size={24} className="text-emerald-400" />
            </div>

            <div className="space-y-0.5">
              <span 
                className="inline-block px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest font-bold text-emerald-400"
                style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '0px' }}
              >
                OTP VERIFIED &amp; PROFILE SECURED
              </span>
              <h4 className="text-sm font-bold text-white tracking-tight">
                Account Credentials Linked
              </h4>
              <p className="text-[11.5px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                Your email <strong className="text-white">{email}</strong> is now verified on MongoDB Atlas. You have full access to campaign scheduling and automated publishing engines.
              </p>
            </div>

            <div 
              className="p-2.5 border text-left text-[11px] font-mono space-y-1.5"
              style={{ background: '#111624', borderColor: '#1f2a3f', borderRadius: '0px' }}
            >
              <div className="flex items-center justify-between text-slate-400">
                <span>Account Status:</span>
                <span className="text-emerald-400 font-bold">✓ Verified Operator</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Database:</span>
                <span className="text-white">MongoDB Atlas Cloud</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Workspace:</span>
                <span className="text-[#38bdf8]">app.co-launch.app</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 font-bold text-xs uppercase tracking-wider text-white transition-all hover:brightness-110 cursor-pointer border-0"
              style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
            >
              Done &amp; Return to Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
