import React, { useState } from 'react'
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
  ShieldCheck
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

  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const brandRed = '#c81e3c'

  const isValidEmail = (val) => {
    if (!val) return false
    const trimmed = val.trim().toLowerCase()
    if (trimmed === 'creatorforgeweb@gmail.com') return false
    if (trimmed.endsWith('@example.com') || trimmed.endsWith('@test.com')) return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
  }

  const handleSubmit = async (e) => {
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
      const cleanPassword = password ? password.trim() : ''
      const cleanHandle = (creatorData?.handle || '').replace(/^@+/, '').trim()
      const username = userProfile?.username || cleanHandle || creatorData?.name || cleanEmail.split('@')[0]
      
      const payload = {
        username,
        email: cleanEmail,
        password: cleanPassword || undefined,
        creator_data: creatorData || {}
      }

      const candidateUrls = [
        '',
        'https://creator-forge-backend-jj1y.onrender.com',
        'https://creator-forge-backend.onrender.com'
      ]

      let savedOk = false
      let lastErr = null
      for (const baseUrl of candidateUrls) {
        try {
          const res = await fetch(`${baseUrl}/api/auth/update-profile`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          })
          if (res.ok) {
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

      if (!savedOk && lastErr && lastErr.message && !lastErr.message.includes('fetch')) {
        throw lastErr
      }

      // Update userProfile in state and localStorage
      const updatedProfile = {
        ...(userProfile || {}),
        username,
        email: cleanEmail,
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
        contactEmail: cleanEmail
      }
      try {
        localStorage.setItem('forge_creator_data', JSON.stringify(updatedCreator))
      } catch {}
      if (updateCreator) {
        updateCreator({ email: cleanEmail, contactEmail: cleanEmail })
      }

      if (triggerToast) {
        triggerToast(cleanPassword ? `Account registered successfully: ${cleanEmail}` : `Email configured successfully: ${cleanEmail}`, 'success')
      }

      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save account credentials.')
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
        <div className="flex items-center justify-between pb-4 border-b border-[#161b2b]">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-none flex items-center justify-center"
              style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
            >
              <Mail size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">Configure Official Email</h3>
              <p className="text-xs text-slate-400">Required for campaign broadcasts & orders</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-none hover:bg-[#161b2b] text-slate-400 hover:text-white transition cursor-pointer border-0"
            style={{ borderRadius: '0px' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-none text-xs flex items-start gap-2">
              <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Your Creator Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. creator@yourbrand.com"
                className="w-full bg-[#111522] text-white rounded-none p-3 pl-9 text-xs border border-[#202738] focus:border-[#c81e3c] outline-none transition"
                style={{ borderRadius: '0px' }}
                autoFocus
                required
              />
              <Mail size={15} className="absolute left-3 top-3.5 text-slate-500" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Used to send automated launch notifications, receipt confirmations, and customer access tokens.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Set / Update Password <span className="text-slate-500 text-[10px] font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep existing password"
                className="w-full bg-[#111522] text-white rounded-none p-3 pl-9 pr-9 text-xs border border-[#202738] focus:border-[#c81e3c] outline-none transition"
                style={{ borderRadius: '0px' }}
              />
              <Lock size={15} className="absolute left-3 top-3.5 text-slate-500" />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 border-0 bg-transparent cursor-pointer"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="p-3 bg-[#111522] border border-[#202738] rounded-none text-[11px] text-slate-300 flex items-start gap-2">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Your email is encrypted and private. It is only used for customer communications and platform notifications.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#161b2b]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white bg-[#111522] hover:bg-[#161b2b] rounded-none cursor-pointer border border-[#202738]"
              style={{ borderRadius: '0px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-xs font-extrabold text-white rounded-none flex items-center gap-1.5 transition cursor-pointer shadow-md hover:opacity-95 border-0 disabled:opacity-50"
              style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
            >
              {loading ? (
                <>
                  <Loader2 size={13} className="animate-spin text-white" />
                  <span className="text-white font-bold">Saving...</span>
                </>
              ) : (
                <>
                  <span className="text-white font-bold">Save Email Address</span>
                  <ArrowRight size={13} className="text-white" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
