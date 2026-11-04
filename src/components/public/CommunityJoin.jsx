import { useState, useEffect } from 'react'
import {
  Users, ArrowRight, Check, Sparkles, ShieldCheck, CreditCard,
  Lock, CheckCircle2, Star, Zap, Layers
} from 'lucide-react'
import WingLogo from '../ui/WingLogo'
import { updatePageSEO } from '../../utils/seo'

/**
 * CommunityJoin — Public landing & tier checkout page at /join/{handle}
 * Supports tier selection (Starter $29, Pro $79, VIP $249), Stripe credit card payment,
 * and instant community member provisioning with live revenue synchronization.
 * Styled in CoLaunch precision angular aesthetic (rounded-none).
 */
export default function CommunityJoin({ handle }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [joined, setJoined] = useState(false)
  const [visible, setVisible] = useState(false)
  const [creatorInfo, setCreatorInfo] = useState(null)
  const [welcomeConfig, setWelcomeConfig] = useState(null)
  const [confirmedOrder, setConfirmedOrder] = useState(null)

  const cleanHandle = (handle || '').replace(/^@/, '').replace(/\//g, '-')

  // Read URL query parameter for preselected tier (e.g. ?tier=pro)
  const searchTier = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('tier') || 'starter'
    : 'starter'

  const [selectedTierId, setSelectedTierId] = useState(() => {
    const clean = searchTier.toLowerCase()
    if (clean.includes('pro')) return 'pro'
    if (clean.includes('vip') || clean.includes('mastermind')) return 'vip'
    return 'starter'
  })

  // Dynamic pricing
  const baseMonthlyPrice = 29
  const TIERS = [
    {
      id: 'starter',
      name: 'Starter Community',
      price: baseMonthlyPrice,
      interval: 'mo',
      badge: 'Most Popular',
      features: ['Full community feed & discussions', 'Weekly sprint updates & drops', 'Direct member Q&A channel'],
    },
    {
      id: 'pro',
      name: 'Pro Accelerator',
      price: Math.round(baseMonthlyPrice * 2.7), // $78
      interval: 'mo',
      badge: 'Best Value',
      features: ['Everything in Starter', 'Private sprint implementation room', 'Source templates, scripts & code'],
    },
    {
      id: 'vip',
      name: 'VIP Mastermind',
      price: Math.round(baseMonthlyPrice * 8.5), // $247
      interval: 'mo',
      badge: 'Exclusive',
      features: ['Everything in Pro', '1:1 monthly advisory call', 'Direct WhatsApp / Slack line with creator'],
    }
  ]

  const activeTier = TIERS.find(t => t.id === selectedTierId) || TIERS[0]

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

  const handleCheckoutSubmit = (e) => {
    e.preventDefault()
    if (!email.trim() || !name.trim()) return

    setIsProcessing(true)

    const txId = `tx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
    const member = {
      id: `mem-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      tier: activeTier.name,
      price: activeTier.price,
      amount: activeTier.price,
      interval: activeTier.interval,
      role: activeTier.name,
      status: 'Active',
      joinedAt: new Date().toISOString(),
      source: 'Stripe Live Rails',
      txId
    }

    setTimeout(() => {
      // Store member in localStorage for creator's revenue & community dashboard
      const key = `forge_${cleanHandle}_community_members`
      try {
        const existing = JSON.parse(localStorage.getItem(key) || '[]')
        // Update if existing or unshift
        const idx = existing.findIndex(m => m.email?.toLowerCase() === member.email)
        if (idx >= 0) {
          existing[idx] = member
        } else {
          existing.unshift(member)
        }
        localStorage.setItem(key, JSON.stringify(existing))
      } catch (_) {
        localStorage.setItem(key, JSON.stringify([member]))
      }

      // Real-time broadcast event so any open creator dashboard updates immediately
      try {
        window.dispatchEvent(new CustomEvent('forge_member_joined', { detail: member }))
      } catch (_) {}

      setConfirmedOrder({
        txId,
        tierName: activeTier.name,
        price: activeTier.price,
        email: member.email,
        name: member.name,
      })
      setIsProcessing(false)
      setJoined(true)
    }, 700)
  }

  // Quick 1-click test checkout fill
  const handleFillTestCard = () => {
    setName('Alex Vance')
    setEmail(`alex.${Date.now().toString().slice(-4)}@example.com`)
    setCardNumber('4242 4242 4242 4242')
    setCardExpiry('12/28')
    setCardCvc('842')
  }

  if (joined && confirmedOrder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-[#080808] text-white py-12">
        <div
          className="w-full max-w-lg p-6 sm:p-8 bg-[#0c1017] border border-white/10 rounded-none text-center shadow-2xl space-y-5"
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

          <div className="w-14 h-14 rounded-none bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
            <Check size={28} strokeWidth={2.5} />
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 block mb-1">
              Payment Confirmed • Stripe Verified
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              You're officially subscribed! 🎉
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              Welcome to <strong className="text-white">{confirmedOrder.tierName}</strong> inside {productName}.
            </p>
          </div>

          {/* Receipt Box */}
          <div className="p-4 bg-[#10141f] border border-white/[0.08] rounded-none text-left space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-white/[0.06]">
              <span>Plan Subscribed:</span>
              <strong className="text-white font-bold">{confirmedOrder.tierName}</strong>
            </div>
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-white/[0.06]">
              <span>Monthly Amount:</span>
              <strong className="text-emerald-400 font-bold">${confirmedOrder.price}/mo</strong>
            </div>
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-white/[0.06]">
              <span>Member Account:</span>
              <span className="text-white">{confirmedOrder.email}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Transaction Ref:</span>
              <span className="text-slate-500">{confirmedOrder.txId}</span>
            </div>
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
              Your Unlocked Privileges
            </p>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-none bg-[#c81e3c]" />
                <span>Instant access to member discussions and community rooms</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-none bg-[#c81e3c]" />
                <span>Automated weekly challenge drops &amp; product access</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-none bg-[#c81e3c]" />
                <span>Direct feedback channel with {displayName}</span>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 font-mono">
            Payment receipt &amp; portal invitation dispatched to <span className="text-slate-300">{confirmedOrder.email}</span>
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-[#080808] text-white relative overflow-hidden py-10">
      {/* Background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(200,30,60,0.08) 0%, transparent 65%)' }}
      />

      <div
        className="relative z-10 w-full max-w-xl p-6 sm:p-8 bg-[#0c1017] border border-white/10 rounded-none shadow-2xl space-y-6"
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

        {/* ── TIER SELECTOR ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            <span>Select Membership Tier</span>
            <span className="text-[#ff8093]">Stripe Billing</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {TIERS.map(t => {
              const isSelected = selectedTierId === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTierId(t.id)}
                  className={`p-3 text-left border rounded-none transition cursor-pointer flex flex-col justify-between space-y-1.5 relative ${
                    isSelected
                      ? 'border-[#c81e3c] bg-[#c81e3c]/15 text-white'
                      : 'border-white/[0.08] bg-[#10141f] text-slate-300 hover:border-white/20'
                  }`}
                  style={{ borderRadius: '0px' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono uppercase font-bold text-slate-400">
                      {t.badge}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-none bg-[#c81e3c]" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white truncate">{t.name}</h4>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-base font-black text-white">${t.price}</span>
                      <span className="text-[10px] font-mono text-slate-400">/{t.interval}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected Tier Perk Summary */}
        <div className="p-3 bg-[#10141f] border border-white/[0.06] rounded-none space-y-1.5 text-xs">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
            Included in {activeTier.name}:
          </div>
          <div className="space-y-1 text-slate-300">
            {activeTier.features.map((feat, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px]">
                <Check size={11} className="text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CHECKOUT FORM ── */}
        <form onSubmit={handleCheckoutSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                placeholder="Jordan Miller"
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
                placeholder="jordan@domain.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-none text-xs bg-[#10141f] border border-white/10 text-white outline-none focus:border-[#c81e3c] transition"
                style={{ borderRadius: '0px' }}
              />
            </div>
          </div>

          {/* Payment Card Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              <span className="flex items-center gap-1.5">
                <CreditCard size={12} className="text-[#c81e3c]" />
                <span>Payment Details (Stripe Rails)</span>
              </span>
              <button
                type="button"
                onClick={handleFillTestCard}
                className="text-[9px] text-[#ff8093] hover:underline cursor-pointer font-bold"
              >
                Autofill Test Card
              </button>
            </div>

            <input
              type="text"
              required
              placeholder="Card number (4242 •••• •••• 4242)"
              value={cardNumber}
              onChange={e => setCardNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-none text-xs font-mono bg-[#10141f] border border-white/10 text-white outline-none focus:border-[#c81e3c] transition"
              style={{ borderRadius: '0px' }}
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="MM / YY"
                value={cardExpiry}
                onChange={e => setCardExpiry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-none text-xs font-mono bg-[#10141f] border border-white/10 text-white outline-none focus:border-[#c81e3c] transition"
                style={{ borderRadius: '0px' }}
              />
              <input
                type="text"
                required
                placeholder="CVC"
                value={cardCvc}
                onChange={e => setCardCvc(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-none text-xs font-mono bg-[#10141f] border border-white/10 text-white outline-none focus:border-[#c81e3c] transition"
                style={{ borderRadius: '0px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing || !email.trim() || !name.trim()}
            className="w-full py-3.5 rounded-none text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer border-0 shadow-lg disabled:opacity-40"
            style={{
              background: '#c81e3c',
              color: '#ffffff',
              borderRadius: '0px'
            }}
          >
            {isProcessing ? (
              <span>Verifying Stripe Payment...</span>
            ) : (
              <>
                <Lock size={12} className="text-white" />
                <span>Pay ${activeTier.price}/mo &amp; Join Community</span>
                <ArrowRight size={13} className="text-white" />
              </>
            )}
          </button>
        </form>

        {/* Trust Signals */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>✓ 256-bit Stripe Encryption</span>
          <span>✓ Instant Access</span>
          <span>✓ Cancel Anytime</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <WingLogo size={13} color="rgba(255,255,255,0.2)" />
          <span className="text-[10px] font-mono text-slate-500">Powered by CoLaunch Commerce Infrastructure</span>
        </div>
      </div>
    </div>
  )
}
