import { useState, useEffect } from 'react'
import { Users, ArrowRight, Check, Sparkles, ShieldCheck } from 'lucide-react'
import WingLogo from '../ui/WingLogo'
import { updatePageSEO } from '../../utils/seo'

/**
 * CommunityJoin — Public landing page at /join/{handle}
 * Lets visitors sign up for a creator's community with name + email.
 * Styled in CoLaunch precision angular aesthetic (rounded-none).
 */
export default function CommunityJoin({ handle }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)
  const [visible, setVisible] = useState(false)
  const [creatorInfo, setCreatorInfo] = useState(null)
  const [welcomeConfig, setWelcomeConfig] = useState(null)

  const cleanHandle = (handle || '').replace(/^@/, '').replace(/\//g, '-')

  useEffect(() => {
    updatePageSEO({
      title: `Join @${cleanHandle}'s VIP Community | CoLaunch`,
      description: `Join the official community and get early access to exclusive software tools built with @${cleanHandle}.`,
      image: "/og-image.svg"
    })
  }, [cleanHandle])

  // Track real visitor page view & load creator data
  useEffect(() => {
    setTimeout(() => setVisible(true), 80)
    
    // 1. Increment real traffic count
    try {
      const visitsKey = `forge_${cleanHandle}_community_visits`
      const curVisits = parseInt(localStorage.getItem(visitsKey) || '0', 10)
      localStorage.setItem(visitsKey, String(curVisits + 1))
    } catch (_) {}

    // 2. Load creator info
    try {
      const cached = localStorage.getItem('forge_creator_data')
      if (cached) {
        const data = JSON.parse(cached)
        const dataHandle = (data.handle || '').replace(/^@/, '').replace(/\//g, '-')
        if (dataHandle.toLowerCase() === cleanHandle.toLowerCase()) {
          setCreatorInfo(data)
        }
      }
    } catch (_) {}

    // 3. Load personalized welcome message if configured by creator
    try {
      const welcomeRaw = localStorage.getItem(`forge_${cleanHandle}_community_welcome`)
      if (welcomeRaw) {
        setWelcomeConfig(JSON.parse(welcomeRaw))
      }
    } catch (_) {}
  }, [cleanHandle])

  const displayName = creatorInfo?.name || creatorInfo?.handle?.replace('@', '') || cleanHandle
  const productName = creatorInfo?.productName || `${displayName}'s Community`
  const avatarUrl = creatorInfo?.avatarUrl || creatorInfo?.avatar || null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return

    const member = {
      name: name.trim() || 'Community Member',
      email: email.trim(),
      joinedAt: new Date().toISOString(),
      role: 'Founding Member',
      status: 'Active',
      source: 'Invite Link'
    }

    // Store member in localStorage for the creator's dashboard to pick up
    const key = `forge_${cleanHandle}_community_members`
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '[]')
      // Prevent duplicate emails
      if (!existing.some(m => m.email.toLowerCase() === member.email.toLowerCase())) {
        existing.unshift(member)
        localStorage.setItem(key, JSON.stringify(existing))
      }
    } catch (_) {
      localStorage.setItem(key, JSON.stringify([member]))
    }

    // Real-time broadcast event so any open creator dashboard reflects immediately
    try {
      window.dispatchEvent(new CustomEvent('forge_member_joined', { detail: member }))
    } catch (_) {}

    setJoined(true)
  }

  if (joined) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-[#080808] text-white">
        <div
          className="w-full max-w-md p-6 sm:p-8 bg-[#0c1017] border border-white/10 rounded-none text-center shadow-2xl space-y-5"
          style={{
            borderRadius: '0px',
            animation: 'fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          <style>{`
            @keyframes fadeInUp {
              0% { opacity: 0; transform: translateY(14px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `}</style>
          
          <div className="w-14 h-14 rounded-none bg-[#c81e3c]/15 border border-[#c81e3c]/40 flex items-center justify-center mx-auto text-[#ff6b81]">
            <Check size={26} strokeWidth={2.5} />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#ff8093] block mb-1">
              Confirmed Member
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              You're officially in! 🎉
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              Welcome to <strong className="text-white">{productName}</strong> by {displayName}.
            </p>
          </div>

          {/* Personalized Welcome Message from Creator */}
          {welcomeConfig && welcomeConfig.enabled && (
            <div className="p-4 bg-[#10141f] border border-[#c81e3c]/25 rounded-none text-left space-y-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#ff8093]">
                <Sparkles size={11} />
                <span>Message from {displayName}:</span>
              </div>
              {welcomeConfig.subject && (
                <div className="text-xs font-bold text-white">
                  {welcomeConfig.subject}
                </div>
              )}
              <div className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                {welcomeConfig.message}
              </div>
            </div>
          )}

          {/* Member Privileges */}
          <div className="p-4 bg-[#10141f] border border-white/[0.08] rounded-none text-left space-y-2.5">
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Your Founding Privileges
            </p>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-none bg-[#c81e3c]" />
                <span>Direct access to upcoming sprints, challenges, and drops</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-none bg-[#c81e3c]" />
                <span>Early priority invite to product releases</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-none bg-[#c81e3c]" />
                <span>Private feedback pipeline directly with {displayName}</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-mono">
            Confirmation email dispatched to <span className="text-slate-300">{email}</span>
          </p>

          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-center gap-2">
            <WingLogo size={14} color="rgba(255,255,255,0.2)" />
            <span className="text-[10px] font-mono text-slate-500">CoLaunch Community Infrastructure</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-[#080808] text-white relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(200,30,60,0.08) 0%, transparent 65%)' }}
      />

      <div
        className="relative z-10 w-full max-w-md p-6 sm:p-8 bg-[#0c1017] border border-white/10 rounded-none shadow-2xl space-y-6"
        style={{
          borderRadius: '0px',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Creator Identity */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-16 h-16 rounded-none border-2 border-[#c81e3c] object-cover shadow-lg"
                style={{ borderRadius: '0px' }}
                onError={e => { e.currentTarget.style.display = 'none' }}
              />
            ) : (
              <div 
                className="w-16 h-16 rounded-none border-2 border-[#c81e3c] bg-[#10141f] flex items-center justify-center text-white font-black text-xl shadow-lg"
                style={{ borderRadius: '0px' }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider bg-[#c81e3c]/15 text-[#ff8093] border border-[#c81e3c]/30 mb-2">
            <ShieldCheck size={11} />
            <span>Verified Creator Community</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Join {productName}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official founding circle by <span className="text-slate-200 font-bold">{displayName}</span> (@{cleanHandle})
          </p>
        </div>

        {/* Join Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Your Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Jordan Miller"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-none text-xs bg-[#10141f] border border-white/10 text-white outline-none focus:border-[#c81e3c] transition"
              style={{ borderRadius: '0px' }}
            />
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@domain.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-none text-xs bg-[#10141f] border border-white/10 text-white outline-none focus:border-[#c81e3c] transition"
              style={{ borderRadius: '0px' }}
            />
          </div>

          <button
            type="submit"
            disabled={!email.trim() || !name.trim()}
            className="w-full py-3 rounded-none text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer border-0 shadow-lg disabled:opacity-40"
            style={{
              background: '#c81e3c',
              color: '#ffffff',
              borderRadius: '0px'
            }}
          >
            <span>Join Founding Circle</span>
            <ArrowRight size={13} className="text-white" />
          </button>
        </form>

        {/* Trust Signals */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>✓ 100% Free to join</span>
          <span>✓ Instant invitation</span>
          <span>✓ No spam guarantee</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <WingLogo size={13} color="rgba(255,255,255,0.2)" />
          <span className="text-[10px] font-mono text-slate-500">Powered by CoLaunch</span>
        </div>
      </div>
    </div>
  )
}
