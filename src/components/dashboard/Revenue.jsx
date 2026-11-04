import { useState, useMemo } from 'react'
import { useForge, getAccent } from '../../App'
import { TrendingUp, ChevronRight, Sparkles, BarChart2, AlertCircle, ArrowUpRight, Zap, Rocket, ShieldCheck, Check, DollarSign } from 'lucide-react'

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

  const cleanHandle = (creatorData?.handle || 'creator').replace(/^@+/, '')

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

  const baseRevenue = membersCount * (pricing.monthly || 29)
  const revenueHistory = [
    Math.round(baseRevenue * 0.15),
    Math.round(baseRevenue * 0.3),
    Math.round(baseRevenue * 0.45),
    Math.round(baseRevenue * 0.6),
    Math.round(baseRevenue * 0.75),
    Math.round(baseRevenue * 0.9),
    baseRevenue
  ]

  const maxHistoryVal = Math.max(...revenueHistory, 1)

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
            <span className="w-2 h-2 rounded-none bg-[#c81e3c]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Commercial Engine &amp; Monetization Analytics
            </span>
            <span className="px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider bg-[#c81e3c]/15 text-white border border-[#c81e3c]/30">
              Live Billing Ready
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Revenue Overview</span>
            <DollarSign size={18} className="text-[#c81e3c]" />
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Tracks MRR conversion benchmarks, calculates revenue projections, and pinpoints your next monetization move.
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
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-none transition shadow-sm cursor-pointer hover:opacity-90 border-0"
            style={{ background: brandRed, color: '#ffffff' }}
          >
            <Rocket size={13} className="text-white" />
            <span>Commercial Pricing Models</span>
          </button>
        </div>
      </div>

      {/* ── 3 KEY KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-[#0c1017] border border-white/[0.08] rounded-none">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Monthly Recurring</span>
            <DollarSign size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">${baseRevenue.toLocaleString('en-US')}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>Current baseline MRR</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#0c1017] border border-white/[0.08] rounded-none">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Subscribers</span>
            <BarChart2 size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{membersCount.toLocaleString('en-US')}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>Paying community tier</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#0c1017] border border-white/[0.08] rounded-none">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Scale Potential</span>
            <TrendingUp size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">${Math.round(baseRevenue * 4.5).toLocaleString('en-US')}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>Projected with multi-tiers</span>
          </div>
        </div>
      </div>

      {/* ── REVENUE CHART CARD ── */}
      <div className="bg-[#0c1017] border border-white/[0.08] rounded-none p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Historical &amp; Projected Growth
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                ${revenueHistory.reduce((a,b) => a+b, 0).toLocaleString('en-US')}
              </span>
              <span className="text-xs text-slate-400 font-mono">cumulative volume</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {['1m', '3m', 'all'].map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setActiveRange(r)}
                className={`px-3 py-1 text-xs font-mono font-bold uppercase rounded-none transition cursor-pointer border-0 ${
                  activeRange === r ? 'bg-[#c81e3c] text-white' : 'bg-[#10141f] text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-2 h-28 pt-2 pb-2">
          {MONTHS.map((month, i) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div
                className="w-full rounded-none transition-all duration-300 relative"
                style={{
                  height: `${Math.max((revenueHistory[i] / maxHistoryVal) * 90, 8)}px`,
                  background: i === MONTHS.length - 1 ? '#c81e3c' : 'rgba(255,255,255,0.08)',
                  border: i === MONTHS.length - 1 ? '1px solid #c81e3c' : '1px solid transparent',
                }}
              />
              <span className={`text-[10px] font-mono ${i === MONTHS.length - 1 ? 'text-white font-bold' : 'text-slate-500'}`}>
                {month}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06] text-xs text-slate-400">
          <span className="w-1.5 h-1.5 rounded-none bg-[#c81e3c]" />
          <span>Dynamic revenue telemetry modeled on live audience conversion and active subscription gates.</span>
        </div>
      </div>

      {/* ── COMMERCIAL DEPLOYMENT DUAL TRACK ── */}
      <div className="bg-[#0c1017] border border-white/[0.08] rounded-none p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] flex-wrap gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider bg-[#c81e3c]/15 text-[#ff8093] border border-[#c81e3c]/30 mb-1">
              <Zap size={11} />
              <span>Commercial Deployment Options</span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Turn your ${Math.round(baseRevenue * 4.5).toLocaleString('en-US')}/mo potential into live earnings
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Track 1: 50/50 Co-Launch Partnership */}
          <div className="p-4 bg-[#10141f] border border-[#c81e3c]/40 rounded-none flex flex-col justify-between space-y-4 relative">
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-none text-[8px] font-black uppercase tracking-wider bg-[#c81e3c] text-white">
              Recommended
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Rocket size={15} className="text-[#c81e3c]" />
                <h4 className="text-sm font-bold text-white">50/50 Venture Co-Launch</h4>
              </div>
              <div>
                <span className="text-2xl font-black text-white">$0</span>
                <span className="text-xs text-slate-400 ml-1.5 font-medium">upfront • 50/50 net split</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-[#c81e3c] shrink-0" />
                  <span>Full engineering, infrastructure, and server ops managed</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-[#c81e3c] shrink-0" />
                  <span>Automated email launch funnels and member support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-[#c81e3c] shrink-0" />
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
              className="w-full py-2 px-3 rounded-none font-bold text-xs text-white flex items-center justify-center gap-1.5 transition cursor-pointer border-0 shadow-sm hover:opacity-90"
              style={{ background: brandRed, color: brandTextColor }}
            >
              <span>Apply for 50/50 Track</span>
              <ChevronRight size={13} className="text-white" />
            </button>
          </div>

          {/* Track 2: Co-Builder DIY Pass */}
          <div className="p-4 bg-[#10141f] border border-white/10 rounded-none flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">Co-Builder DIY License</h4>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-none bg-white/10 text-slate-300 uppercase">
                  100% Creator Rev
                </span>
              </div>
              <div>
                <span className="text-2xl font-black text-white">$50</span>
                <span className="text-xs text-slate-400 ml-1.5 font-medium">one-time payment</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-400 shrink-0" />
                  <span>Full GitHub repository source code access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-400 shrink-0" />
                  <span>0% ongoing rev share — keep 100% of member earnings</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-400 shrink-0" />
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
              className="w-full py-2 px-3 rounded-none font-bold text-xs text-white flex items-center justify-center gap-1.5 transition border border-white/10 bg-[#151b2a] hover:bg-[#1e273d] cursor-pointer"
            >
              <span>Get $50 DIY Pass</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ── REVENUE PATHS ── */}
      <div className="bg-[#0c1017] border border-white/[0.08] rounded-none p-4 sm:p-5 space-y-3">
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
            >
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white truncate">{path.label}</span>
                  {path.active ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-none bg-[#c81e3c]/20 text-[#ff8093] border border-[#c81e3c]/30">
                      Active
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleActivatePath(path.label)}
                      className="text-[9px] font-bold px-1.5 py-0.2 rounded-none bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition cursor-pointer"
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
      <div className="bg-[#0c1017] border border-white/[0.08] rounded-none p-4 sm:p-5 space-y-3">
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
                className="px-3 py-1 text-xs font-bold text-slate-200 bg-[#151b2a] hover:bg-[#1e273d] border border-white/10 rounded-none transition cursor-pointer shrink-0 self-end sm:self-center"
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
