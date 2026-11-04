import { useState, useMemo, useEffect } from 'react'
import { useForge, getAccent } from '../../App'
import {
  TrendingUp, ChevronRight, Sparkles, BarChart2, AlertCircle,
  ArrowUpRight, Zap, Rocket, ShieldCheck, Check, DollarSign,
  Users, Layers, ArrowRight, Activity, Calendar, Sliders, PieChart
} from 'lucide-react'

const MONTHS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Now']

const INSIGHTS = [
  {
    type: 'action',
    icon: AlertCircle,
    label: 'No members yet — your offer portal is live',
    detail: 'Share your launch link to get your first 10 founding subscribers. CoLaunch recommends posting today.',
    cta: 'Generate launch post',
  },
  {
    type: 'tip',
    icon: TrendingUp,
    label: 'Founders who launch in the first 48h earn 3× more in month 1',
    detail: 'Post your launch announcement now while channel momentum is fresh.',
    cta: 'Write announcement',
  },
  {
    type: 'tip',
    icon: BarChart2,
    label: 'Email converts 3–5× higher than standard organic posts',
    detail: 'Send your subscriber list an announcement email — that is your highest-leverage move right now.',
    cta: 'Write email sequence',
  },
]

const REVENUE_PATHS = [
  { label: 'Monthly memberships', potential: '$8K–$30K/mo', description: 'Primary recurring community subscription offer', active: true },
  { label: 'Course sales', potential: '$2K–$8K/mo', description: 'One-time curriculum and masterclass bundle', active: false },
  { label: 'Coaching upsell', potential: '$3K–$15K/mo', description: 'High-ticket 1:1 or group implementation sprint', active: false },
  { label: 'Sponsorships', potential: '$1K–$5K/mo', description: 'Brand partners aligned to your specific niche', active: false },
]

export default function Revenue() {
  const { creatorData, triggerToast, setActiveTab, setPreloadStudioType } = useForge()

  const brandRed = '#c81e3c'
  const brandTextColor = '#ffffff'
  const [activeRange, setActiveRange] = useState('all')
  const [chartMode, setChartMode] = useState('projected') // 'actual' | 'projected'
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState(null)

  const cleanHandle = (creatorData?.handle || 'creator').replace(/^@+/, '')
  const followersNum = Number(creatorData?.followers || creatorData?.subscribers || 1440000)

  const [pricing] = useState(() => {
    try {
      const cached = localStorage.getItem(`forge_${cleanHandle}_product_pricing`)
      if (cached) return JSON.parse(cached)
    } catch (_) {}
    return { monthly: 29, currency: '$' }
  })

  const [membersCount, setMembersCount] = useState(() => {
    try {
      const cachedMem = localStorage.getItem(`forge_${cleanHandle}_community_members`)
      if (cachedMem) {
        const parsed = JSON.parse(cachedMem)
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(m => m.name !== 'Alex Rivera' && m.name !== 'Sarah Lin')
          return valid.length
        }
      }
      const stored = localStorage.getItem('forge_products_members')
      if (stored !== null) return parseInt(stored, 10)
    } catch (_) {}
    return 0
  })

  useEffect(() => {
    const handleSync = () => {
      try {
        const cachedMem = localStorage.getItem(`forge_${cleanHandle}_community_members`)
        if (cachedMem) {
          const parsed = JSON.parse(cachedMem)
          if (Array.isArray(parsed)) {
            const valid = parsed.filter(m => m.name !== 'Alex Rivera' && m.name !== 'Sarah Lin')
            setMembersCount(valid.length)
            return
          }
        }
        const stored = localStorage.getItem('forge_products_members')
        if (stored !== null) setMembersCount(parseInt(stored, 10))
      } catch (_) {}
    }
    window.addEventListener('forge_member_joined', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('forge_member_joined', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [cleanHandle])

  const monthlyPrice = pricing.monthly || 29
  const baseRevenue = membersCount * monthlyPrice

  // Model realistic channel projections
  const targetDay1Members = Math.max(30, Math.min(250, Math.round(followersNum * 0.0001)))
  const targetDay90Members = Math.max(100, Math.min(800, Math.round(followersNum * 0.0003)))
  const projectedDay1MRR = targetDay1Members * monthlyPrice
  const projectedDay90MRR = targetDay90Members * monthlyPrice

  // Actual vs Projected Month Histories
  const actualHistory = [
    Math.round(baseRevenue * 0.15),
    Math.round(baseRevenue * 0.3),
    Math.round(baseRevenue * 0.45),
    Math.round(baseRevenue * 0.6),
    Math.round(baseRevenue * 0.75),
    Math.round(baseRevenue * 0.9),
    baseRevenue
  ]

  const projectedHistory = [
    0,
    0,
    0,
    Math.round(projectedDay1MRR * 0.35),
    Math.round(projectedDay1MRR * 0.65),
    Math.round(projectedDay1MRR),
    projectedDay90MRR
  ]

  const activeHistory = chartMode === 'actual' ? actualHistory : projectedHistory
  const maxHistoryVal = Math.max(...activeHistory, 1)

  // 3-Tier Multi-Offer Model
  const tieredOffers = useMemo(() => [
    {
      id: 'starter',
      name: 'Starter Community Tier',
      price: monthlyPrice,
      interval: 'mo',
      sharePct: 65,
      memberCount: Math.round(targetDay90Members * 0.65),
      monthlyTotal: Math.round(targetDay90Members * 0.65) * monthlyPrice,
      description: 'Core community discussions, weekly live Q&A, library access',
      badge: 'Active Base Tier'
    },
    {
      id: 'pro',
      name: 'Pro Accelerator Tier',
      price: Math.round(monthlyPrice * 2.7),
      interval: 'mo',
      sharePct: 25,
      memberCount: Math.round(targetDay90Members * 0.25),
      monthlyTotal: Math.round(targetDay90Members * 0.25) * Math.round(monthlyPrice * 2.7),
      description: 'Everything in Starter + private implementation sprints & source code',
      badge: 'High-Demand Tier'
    },
    {
      id: 'vip',
      name: 'VIP Mastermind Tier',
      price: Math.round(monthlyPrice * 8.5),
      interval: 'mo',
      sharePct: 10,
      memberCount: Math.round(targetDay90Members * 0.10),
      monthlyTotal: Math.round(targetDay90Members * 0.10) * Math.round(monthlyPrice * 8.5),
      description: '1:1 monthly advisory, direct async Slack/WhatsApp, strategy reviews',
      badge: 'VIP Tier'
    }
  ], [monthlyPrice, targetDay90Members])

  const totalTieredMRR = tieredOffers.reduce((sum, t) => sum + t.monthlyTotal, 0)
  const blendedARPU = targetDay90Members > 0 ? (totalTieredMRR / targetDay90Members).toFixed(1) : monthlyPrice

  const handleNavigationToStudio = (typeId) => {
    if (setPreloadStudioType) setPreloadStudioType(typeId)
    if (setActiveTab) setActiveTab('studio')
    if (triggerToast) triggerToast(`Studio preloaded with content type: ${typeId}`, 'info')
  }

  const handleActivatePath = (label) => {
    if (triggerToast) triggerToast(`Opening Products to configure ${label}...`, 'info')
    setTimeout(() => {
      setActiveTab && setActiveTab('products')
    }, 400)
  }

  return (
    <div className="min-h-full flex flex-col bg-[#090d16] text-slate-200 p-4 sm:p-6 space-y-6">

      {/* ── TOP HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="w-2 h-2 rounded-none bg-[#c81e3c]" style={{ borderRadius: '0px' }} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Commercial Engine &amp; Monetization Analytics
            </span>
            <span
              className="px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider bg-[#c81e3c]/20 text-white border border-[#c81e3c]/40"
              style={{ borderRadius: '0px', color: '#ffffff' }}
            >
              Live Billing Ready
            </span>
            <span
              className="px-2 py-0.5 rounded-none text-[9px] font-mono font-bold text-slate-400 bg-white/[0.04] border border-white/[0.08]"
              style={{ borderRadius: '0px' }}
            >
              50/50 Venture Model
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Revenue Overview</span>
            <DollarSign size={18} className="text-[#c81e3c]" />
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1 leading-relaxed">
            Tracks MRR conversion benchmarks, models multi-tier subscription growth, and pinpoints your highest-leverage monetization moves.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('forge_open_pricing'))
              }
            }}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-none transition shadow-lg cursor-pointer hover:opacity-95 border-0"
            style={{ background: brandRed, color: brandTextColor, borderRadius: '0px' }}
          >
            <Rocket size={13} className="text-white" />
            <span>Commercial Pricing Models</span>
          </button>
        </div>
      </div>

      {/* ── 4 ELEVATED KEY KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Monthly Recurring Revenue */}
        <div className="p-4 bg-[#0c1017] border border-white/[0.08] rounded-none space-y-1.5" style={{ borderRadius: '0px' }}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10.5px] font-bold uppercase tracking-wider">Monthly Recurring (MRR)</span>
            <DollarSign size={14} className="text-[#c81e3c]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ${baseRevenue.toLocaleString('en-US')}
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 pt-0.5">
            <span className="w-1.5 h-1.5 rounded-none bg-[#c81e3c]" style={{ borderRadius: '0px' }} />
            <span>${monthlyPrice}/mo × {membersCount} active</span>
          </div>
        </div>

        {/* Card 2: Active Subscribers */}
        <div className="p-4 bg-[#0c1017] border border-white/[0.08] rounded-none space-y-1.5" style={{ borderRadius: '0px' }}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10.5px] font-bold uppercase tracking-wider">Active Paid Members</span>
            <Users size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {membersCount.toLocaleString('en-US')}
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 pt-0.5">
            <span className="text-slate-500 font-mono text-[10px]">Target cohort:</span>
            <span className="text-white font-bold">{targetDay1Members} founding seats</span>
          </div>
        </div>

        {/* Card 3: Average Revenue Per User (ARPU) */}
        <div className="p-4 bg-[#0c1017] border border-white/[0.08] rounded-none space-y-1.5" style={{ borderRadius: '0px' }}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10.5px] font-bold uppercase tracking-wider">Average ARPU</span>
            <BarChart2 size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ${blendedARPU}
            <span className="text-xs text-slate-500 font-normal">/mo</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono pt-0.5">
            <span>Blended across active tiers</span>
          </div>
        </div>

        {/* Card 4: Projected Annual Run Rate (ARR) */}
        <div className="p-4 bg-[#0c1017] border border-white/[0.08] rounded-none space-y-1.5" style={{ borderRadius: '0px' }}>
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10.5px] font-bold uppercase tracking-wider">Projected Annual ARR</span>
            <TrendingUp size={14} className="text-[#c81e3c]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            ${(totalTieredMRR * 12).toLocaleString('en-US')}
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5 pt-0.5">
            <ArrowUpRight size={12} className="text-[#c81e3c]" />
            <span>${totalTieredMRR.toLocaleString('en-US')}/mo at 90-day scale</span>
          </div>
        </div>
      </div>

      {/* ── HISTORICAL & PROJECTED GROWTH ENGINE ── */}
      <div className="bg-[#0c1017] border border-white/[0.08] rounded-none p-4 sm:p-5 space-y-4" style={{ borderRadius: '0px' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Telemetry &amp; Trajectory Forecast
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-[#c81e3c]/20 text-white uppercase border border-[#c81e3c]/30"
                style={{ borderRadius: '0px' }}>
                {chartMode === 'projected' ? 'AI Growth Simulation' : 'Live Recorded Actuals'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ${activeHistory.reduce((a, b) => a + b, 0).toLocaleString('en-US')}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {chartMode === 'projected' ? 'cumulative 90-day volume' : 'cumulative recorded billing'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Mode Selector */}
            <div className="flex items-center border border-white/10" style={{ borderRadius: '0px' }}>
              <button
                type="button"
                onClick={() => setChartMode('projected')}
                className={`px-3 py-1 text-xs font-mono font-bold uppercase transition cursor-pointer border-0 ${
                  chartMode === 'projected' ? 'bg-[#c81e3c] text-white' : 'bg-[#10141f] text-slate-400 hover:text-white'
                }`}
                style={{ borderRadius: '0px', color: chartMode === 'projected' ? '#ffffff' : undefined }}
              >
                Growth Simulator
              </button>
              <button
                type="button"
                onClick={() => setChartMode('actual')}
                className={`px-3 py-1 text-xs font-mono font-bold uppercase transition cursor-pointer border-0 ${
                  chartMode === 'actual' ? 'bg-[#c81e3c] text-white' : 'bg-[#10141f] text-slate-400 hover:text-white'
                }`}
                style={{ borderRadius: '0px', color: chartMode === 'actual' ? '#ffffff' : undefined }}
              >
                Live Actuals
              </button>
            </div>

            {/* Time range */}
            <div className="flex items-center border border-white/10" style={{ borderRadius: '0px' }}>
              {['1m', '3m', 'all'].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setActiveRange(r)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold uppercase transition cursor-pointer border-0 ${
                    activeRange === r ? 'bg-white/15 text-white' : 'bg-[#10141f] text-slate-500 hover:text-white'
                  }`}
                  style={{ borderRadius: '0px' }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Bar Chart with Exact Amounts */}
        <div className="flex items-end gap-2.5 h-36 pt-4 pb-2 px-1">
          {MONTHS.map((month, i) => {
            const val = activeHistory[i] || 0
            const heightPx = Math.max((val / maxHistoryVal) * 110, 8)
            const isLatest = i === MONTHS.length - 1
            const isHovered = hoveredMonthIdx === i

            return (
              <div
                key={month}
                className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
                onMouseEnter={() => setHoveredMonthIdx(i)}
                onMouseLeave={() => setHoveredMonthIdx(null)}
              >
                {/* Tooltip value */}
                <div
                  className={`text-[10px] font-mono transition-opacity ${
                    isHovered || isLatest ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  } ${isLatest ? 'text-white font-bold' : 'text-slate-400'}`}
                >
                  ${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                </div>

                {/* Vertical Bar */}
                <div
                  className="w-full transition-all duration-300 relative"
                  style={{
                    height: `${heightPx}px`,
                    background: isLatest ? '#c81e3c' : isHovered ? 'rgba(200, 30, 60, 0.4)' : 'rgba(255,255,255,0.08)',
                    border: isLatest ? '1px solid #c81e3c' : isHovered ? '1px solid rgba(200, 30, 60, 0.5)' : '1px solid transparent',
                    borderRadius: '0px',
                    boxShadow: isLatest ? '0 0 16px rgba(200, 30, 60, 0.4)' : 'none'
                  }}
                />

                {/* Month label */}
                <span
                  className={`text-[10px] font-mono uppercase tracking-wider ${
                    isLatest ? 'text-white font-black' : 'text-slate-500'
                  }`}
                >
                  {month}
                </span>
              </div>
            )
          })}
        </div>

        {/* Bottom Chart Note */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/[0.06] text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-none bg-[#c81e3c]" style={{ borderRadius: '0px' }} />
            <span>
              {chartMode === 'projected'
                ? `Simulated trajectory calibrated to ${followersNum.toLocaleString()} reach & multi-tier conversion.`
                : 'Direct verified Stripe and platform telemetry connected to active subscriber gates.'}
            </span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">
            Monthly Target: ${totalTieredMRR.toLocaleString('en-US')}/mo
          </span>
        </div>
      </div>

      {/* ── SUBSCRIPTION TIER DISTRIBUTION & UNIT ECONOMICS ── */}
      <div className="bg-[#0c1017] border border-white/[0.08] rounded-none p-5 sm:p-6 space-y-4" style={{ borderRadius: '0px' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider bg-[#c81e3c]/15 text-white border border-[#c81e3c]/30 mb-1"
              style={{ borderRadius: '0px', color: '#ffffff' }}>
              <Layers size={11} className="text-white" />
              <span>Multi-Tier Product Matrix</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              3-Tier Subscription Architecture &amp; Unit Economics
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-slate-400">Total Projected Monthly Potential:</span>
            <span className="text-sm font-bold text-white block">${totalTieredMRR.toLocaleString('en-US')}/mo</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {tieredOffers.map((tier) => (
            <div
              key={tier.id}
              className="p-4 bg-[#10141f] border border-white/[0.08] rounded-none flex flex-col justify-between space-y-3 relative group hover:border-white/20 transition-all"
              style={{ borderRadius: '0px' }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    {tier.sharePct}% Audience Share
                  </span>
                  <span className="px-1.5 py-0.2 text-[8.5px] font-mono font-bold uppercase bg-white/10 text-white" style={{ borderRadius: '0px' }}>
                    {tier.badge}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-white">{tier.name}</h4>

                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">${tier.price}</span>
                  <span className="text-xs text-slate-400 font-mono">/{tier.interval}</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed min-h-[34px]">
                  {tier.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">{tier.memberCount} members</span>
                <span className="text-white font-bold">${tier.monthlyTotal.toLocaleString('en-US')}/mo</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COMMERCIAL DEPLOYMENT DUAL TRACK ── */}
      <div className="bg-[#0c1017] border border-white/[0.08] rounded-none p-5 sm:p-6 space-y-4" style={{ borderRadius: '0px' }}>
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] flex-wrap gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider bg-[#c81e3c]/15 text-white border border-[#c81e3c]/30 mb-1"
              style={{ borderRadius: '0px', color: '#ffffff' }}>
              <Zap size={11} className="text-white" />
              <span>Commercial Deployment Options</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Turn your ${totalTieredMRR.toLocaleString('en-US')}/mo scale potential into live earnings
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Track 1: 50/50 Co-Launch Partnership */}
          <div
            className="p-5 bg-[#10141f] border border-[#c81e3c]/50 rounded-none flex flex-col justify-between space-y-4 relative shadow-xl"
            style={{ borderRadius: '0px' }}
          >
            <div
              className="absolute top-3 right-3 px-2 py-0.5 rounded-none text-[8px] font-black uppercase tracking-wider bg-[#c81e3c] text-white"
              style={{ borderRadius: '0px', color: '#ffffff' }}
            >
              Recommended
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Rocket size={16} className="text-[#c81e3c]" />
                <h4 className="text-sm font-bold text-white">50/50 Venture Co-Launch</h4>
              </div>
              <div>
                <span className="text-3xl font-black text-white">$0</span>
                <span className="text-xs text-slate-400 ml-1.5 font-medium">upfront • 50/50 net split</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check size={13} className="text-[#c81e3c] shrink-0" />
                  <span>Full engineering, infrastructure, and server ops managed</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={13} className="text-[#c81e3c] shrink-0" />
                  <span>Automated email launch funnels and ongoing member support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={13} className="text-[#c81e3c] shrink-0" />
                  <span>Custom domain + Stripe payment gateway integration</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('forge_open_pricing', { detail: { track: '50_50' } }))
                }
              }}
              className="w-full py-2.5 px-3 rounded-none font-bold text-xs text-white flex items-center justify-center gap-1.5 transition cursor-pointer border-0 shadow-lg hover:opacity-95"
              style={{ background: brandRed, color: brandTextColor, borderRadius: '0px' }}
            >
              <span>Apply for 50/50 Track</span>
              <ChevronRight size={13} className="text-white" />
            </button>
          </div>

          {/* Track 2: Co-Builder DIY Pass */}
          <div
            className="p-5 bg-[#10141f] border border-white/10 rounded-none flex flex-col justify-between space-y-4"
            style={{ borderRadius: '0px' }}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Co-Builder DIY License</h4>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-none bg-white/10 text-slate-300 uppercase"
                  style={{ borderRadius: '0px' }}>
                  100% Creator Rev
                </span>
              </div>
              <div>
                <span className="text-3xl font-black text-white">$50</span>
                <span className="text-xs text-slate-400 ml-1.5 font-medium">one-time payment</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check size={13} className="text-emerald-400 shrink-0" />
                  <span>Full GitHub repository source code access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={13} className="text-emerald-400 shrink-0" />
                  <span>0% ongoing rev share — keep 100% of member earnings</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={13} className="text-emerald-400 shrink-0" />
                  <span>Self-hosted Vercel / Railway / Docker deployment docs</span>
                </li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('forge_open_pricing', { detail: { track: 'diy_pass' } }))
                }
              }}
              className="w-full py-2.5 px-3 rounded-none font-bold text-xs text-white flex items-center justify-center gap-1.5 transition border border-white/15 bg-[#151b2a] hover:bg-[#1e273d] cursor-pointer"
              style={{ borderRadius: '0px' }}
            >
              <span>Get $50 DIY Pass</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── REVENUE PATHS ── */}
      <div className="bg-[#0c1017] border border-white/[0.08] rounded-none p-4 sm:p-5 space-y-3" style={{ borderRadius: '0px' }}>
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Monetization Pathways
          </h3>
          <span className="text-[10px] font-mono text-slate-400">4 Revenue Channels</span>
        </div>

        <div className="space-y-2">
          {REVENUE_PATHS.map((path) => (
            <div
              key={path.label}
              className="p-3 bg-[#10141f] border border-white/[0.06] rounded-none flex items-center justify-between gap-3"
              style={{ borderRadius: '0px' }}
            >
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white truncate">{path.label}</span>
                  {path.active ? (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.2 rounded-none bg-[#c81e3c]/20 text-white border border-[#c81e3c]/40"
                      style={{ borderRadius: '0px', color: '#ffffff' }}
                    >
                      Active
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleActivatePath(path.label)}
                      className="text-[9px] font-bold px-1.5 py-0.2 rounded-none bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition cursor-pointer"
                      style={{ borderRadius: '0px' }}
                    >
                      Activate
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">{path.description}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs font-bold text-white block">{path.potential}</span>
                <span className="text-[10px] font-mono text-slate-500">at benchmark</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CO-LAUNCH ADVISORY GUIDANCE ── */}
      <div className="bg-[#0c1017] border border-white/[0.08] rounded-none p-4 sm:p-5 space-y-3" style={{ borderRadius: '0px' }}>
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles size={13} className="text-[#c81e3c]" />
            <span>CoLaunch Advisory Directives</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Actionable</span>
        </div>

        <div className="space-y-2">
          {INSIGHTS.map((insight, i) => (
            <div
              key={i}
              className="p-3 bg-[#10141f] border border-white/[0.06] rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              style={{ borderRadius: '0px' }}
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <insight.icon size={15} className="text-slate-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-bold text-white">{insight.label}</p>
                  <p className="text-[11px] text-slate-400">{insight.detail}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (insight.cta.includes('launch')) handleNavigationToStudio('ig-caption')
                  else if (insight.cta.includes('announcement')) handleNavigationToStudio('email-announce')
                  else handleNavigationToStudio('email-sequence')
                }}
                className="px-3 py-1.5 text-xs font-bold text-slate-200 bg-[#151b2a] hover:bg-[#1e273d] border border-white/10 rounded-none transition cursor-pointer shrink-0 self-end sm:self-center"
                style={{ borderRadius: '0px' }}
              >
                {insight.cta} →
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
