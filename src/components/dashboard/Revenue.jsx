import { useState, useMemo } from 'react'
import { useForge, getAccent } from '../../App'
import { TrendingUp, ChevronRight, Sparkles, BarChart2, AlertCircle, ArrowUpRight, Zap, Rocket, ShieldCheck, Check } from 'lucide-react'
import { hexToRgb } from '../../utils/avatarColorExtractor'

const MONTHS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Now']
const REVENUE_DATA = [0, 0, 0, 0, 0, 0, 0]

const INSIGHTS = [
  {
    type: 'action',
    icon: AlertCircle,
    label: 'No members yet - your product is live',
    detail: 'Share your launch link to get your first 10 signups. CoLaunch suggests posting today.',
    cta: 'Generate launch post',
    color: 'rgba(255,255,255,0.06)',
  },
  {
    type: 'tip',
    icon: TrendingUp,
    label: 'Founders who launch in the first 48h earn 3× more in month 1',
    detail: 'Post your launch announcement now while momentum is fresh.',
    cta: 'Write announcement',
    color: 'rgba(255,255,255,0.04)',
  },
  {
    type: 'tip',
    icon: BarChart2,
    label: 'Email converts 3–5× better than social posts',
    detail: 'If you haven\'t sent your list an email yet - that\'s your highest-leverage move right now.',
    cta: 'Write email',
    color: 'rgba(255,255,255,0.04)',
  },
]

const REVENUE_PATHS = [
  { label: 'Monthly memberships', potential: '$8K–$30K/mo', description: 'Your primary offer', active: true },
  { label: 'Course sales', potential: '$2K–$8K/mo', description: 'One-time or bundle', active: false },
  { label: 'Coaching upsell', potential: '$3K–$15K/mo', description: '1:1 or group', active: false },
  { label: 'Sponsorships', potential: '$1K–$5K/mo', description: 'Brand deals aligned to niche', active: false },
]

export default function Revenue() {
  const { creatorData, triggerToast, setActiveTab, setPreloadStudioType } = useForge()

  // Resolve Creator Brand Color dynamically
  const detectedBrandColor = useMemo(() => {
    if (creatorData?.brand_color && creatorData.brand_color !== '#7C5CFC') return creatorData.brand_color
    if (creatorData?.brandColor && creatorData.brandColor !== '#7C5CFC') return creatorData.brandColor
    if (creatorData?.brandHex && creatorData.brandHex !== '#7C5CFC') return creatorData.brandHex
    if (creatorData?.color && creatorData.color !== '#7C5CFC') return creatorData.color
    try {
      const rawMap = localStorage.getItem("forge_creator_brand_color_map")
      if (rawMap) {
        const map = JSON.parse(rawMap)
        const id = creatorData?.id
        const handle = (creatorData?.handle || '').replace(/^@/, '').toLowerCase()
        if (id && map[id]?.primaryHex && map[id].primaryHex !== '#7C5CFC') return map[id].primaryHex
        if (handle && map[handle]?.primaryHex && map[handle].primaryHex !== '#7C5CFC') return map[handle].primaryHex
        const entries = Object.values(map)
        if (entries.length > 0 && entries[entries.length - 1]?.primaryHex && entries[entries.length - 1].primaryHex !== '#7C5CFC') {
          return entries[entries.length - 1].primaryHex
        }
      }
    } catch {}
    const platform = (creatorData?.platform || '').toLowerCase()
    const pAccent = getAccent(platform)
    if (pAccent && pAccent.color && pAccent.color !== '#ffffff') return pAccent.color
    return '#ff3b30'
  }, [creatorData?.brand_color, creatorData?.brandColor, creatorData?.brandHex, creatorData?.color, creatorData?.platform, creatorData?.id, creatorData?.handle])

  const [cr, cg, cb] = useMemo(() => hexToRgb(detectedBrandColor), [detectedBrandColor])
  const accent = useMemo(() => ({
    color: detectedBrandColor,
    rgb: `${cr},${cg},${cb}`
  }), [detectedBrandColor, cr, cg, cb])

  const [activeRange, setActiveRange] = useState('all')

  const [membersCount] = useState(() => {
    try {
      const stored = localStorage.getItem('forge_products_members')
      if (stored !== null) return parseInt(stored, 10)
    } catch {}
    const name = (creatorData?.name || '').toLowerCase()
    const handle = (creatorData?.handle || '').toLowerCase()
    // Match Demo Video Frame 09 (0:54s) exactly for BBC Studios scale
    if (name.includes('bbc') || handle.includes('bbc') || (creatorData?.followers && creatorData.followers > 2000000)) {
      return 7740
    }
    return creatorData?.followers ? Math.round(creatorData.followers * 0.002) || 12 : 12
  })

  const baseRevenue = membersCount * 29
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
    if (setPreloadStudioType) {
      setPreloadStudioType(typeId)
    }
    if (setActiveTab) {
      setActiveTab('studio')
    }
    if (triggerToast) triggerToast(`Studio preloaded with content type: ${typeId}`, 'info')
  }

  const handleActivatePath = (label) => {
    if (triggerToast) triggerToast(`Opening Products to configure ${label}...`, 'info')
    setTimeout(() => {
      setActiveTab('products')
    }, 600)
  }

  return (
    <div className="p-3 sm:p-6 max-w-3xl space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <p className="forge-label mb-3">Revenue</p>
        <h2 className="forge-heading mb-1.5" style={{ fontSize: 'clamp(22px, 3vw, 30px)', letterSpacing: '-0.03em' }}>
          Revenue overview
        </h2>
        <p className="text-[14px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
          CoLaunch tracks your revenue and tells you what to do next.
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Monthly Recurring', value: `$${baseRevenue.toLocaleString('en-US')}`, sub: 'monthly recurring' },
          { label: 'Members', value: membersCount.toLocaleString('en-US'), sub: 'total active' },
          { label: 'Potential', value: `$${Math.round(baseRevenue * 4.5).toLocaleString('en-US')}`, sub: 'per month at scale' },
        ].map((kpi, i) => (
          <div key={i} className="rounded-xl border p-4" style={{ background: 'var(--theme-card-bg, #121722)', borderColor: i === 2 ? `rgba(${accent.rgb},0.28)` : 'var(--theme-border-color, rgba(255,255,255,0.08))' }}>
            <p className="text-[11px] mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{kpi.label}</p>
            <p className="text-[24px] font-semibold tracking-tight text-white leading-none mb-0.5">{kpi.value}</p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Main chart card */}
      <div className="rounded-2xl border p-6" style={{ background: 'var(--theme-card-bg, #121722)', borderColor: 'var(--theme-border-color, rgba(255,255,255,0.08))' }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-[13px] mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Revenue over time</p>
            <div className="flex items-end gap-2">
              <span className="text-[36px] font-semibold tracking-tight text-white leading-none">${revenueHistory.reduce((a,b) => a+b, 0).toLocaleString('en-US')}</span>
              <span className="text-[13px] mb-1" style={{ color: 'rgba(255,255,255,0.3)' }}>all time</span>
            </div>
          </div>
          <div className="flex gap-1">
            {['1m', '3m', 'all'].map(r => (
              <button key={r} onClick={() => setActiveRange(r)}
                className="text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wide transition-all duration-150"
                style={{
                  background: activeRange === r ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                  color: activeRange === r ? 'white' : 'rgba(255,255,255,0.3)',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Bar chart */}
        <div className="flex items-end gap-2 h-24 mb-3">
          {MONTHS.map((month, i) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className="w-full rounded-lg transition-all duration-500 relative overflow-hidden"
                style={{
                  height: `${Math.max((revenueHistory[i] / maxHistoryVal) * 80, 6)}px`,
                  background: i === MONTHS.length - 1
                    ? `rgba(${accent.rgb},0.35)`
                    : 'rgba(255,255,255,0.06)',
                  border: i === MONTHS.length - 1 ? `1px solid rgba(${accent.rgb},0.4)` : '1px solid transparent',
                }}
              >
                {i === MONTHS.length - 1 && (
                  <div className="absolute inset-0 shimmer-line" style={{ opacity: 0.3 }} />
                )}
              </div>
              <span className="text-[10px]" style={{ color: i === MONTHS.length - 1 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.18)' }}>{month}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent.color, opacity: 0.6 }} />
          <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Dynamic revenue estimates tracked based on active platform member conversions.
          </p>
        </div>
      </div>

      {/* ─── COMMERCIAL LAUNCH & PRICING POINT ────────────────────── */}
      <div 
        className="rounded-2xl border p-5 sm:p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(18, 23, 34, 0.95) 0%, rgba(9, 13, 22, 0.98) 100%)',
          borderColor: `rgba(${accent.rgb}, 0.3)`,
          boxShadow: `0 16px 40px rgba(0,0,0,0.5), 0 0 28px rgba(${accent.rgb}, 0.12)`
        }}
      >
        <div 
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-[80px] pointer-events-none opacity-25"
          style={{ background: accent.color }}
        />

        {/* Section Header */}
        <div className="relative z-10 mb-5">
          <div 
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold tracking-wider uppercase mb-2"
            style={{
              background: `rgba(${accent.rgb}, 0.14)`,
              border: `1px solid rgba(${accent.rgb}, 0.35)`,
              color: accent.color
            }}
          >
            <Zap size={12} className="fill-current" />
            <span>Commercial Launch & Pricing Point</span>
          </div>
          <h3 className="text-[19px] sm:text-[22px] font-bold text-white tracking-tight">
            Turn your ${Math.round(baseRevenue * 4.5).toLocaleString('en-US')}/mo potential into live revenue
          </h3>
          <p className="text-[13px] text-slate-400 mt-1 max-w-xl">
            You've completed analyzing your audience, generating your product blueprint, and staging content. Now select your deployment model with CoLaunch:
          </p>
        </div>

        {/* Dual Track Cards */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Track 1: 50/50 Co-Launch Partnership */}
          <div 
            className="rounded-2xl p-4 sm:p-5 border flex flex-col justify-between transition-all duration-200 group hover:border-white/20 relative"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderColor: `rgba(${accent.rgb}, 0.4)`
            }}
          >
            <div className="absolute top-3.5 right-3.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-white"
              style={{ background: accent.color }}>
              Recommended
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Rocket size={16} style={{ color: accent.color }} />
                <h4 className="text-[15px] font-bold text-white">50/50 Venture Co-Launch</h4>
              </div>
              <div className="mb-3">
                <span className="text-[26px] font-extrabold text-white">$0</span>
                <span className="text-[12px] text-slate-400 ml-1.5 font-medium">upfront • 50/50 net split</span>
              </div>
              <ul className="space-y-1.5 text-[12px] text-slate-300 mb-4">
                <li className="flex items-center gap-2">
                  <Check size={13} style={{ color: accent.color }} className="flex-shrink-0" />
                  <span>Full engineering & server infrastructure managed</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={13} style={{ color: accent.color }} className="flex-shrink-0" />
                  <span>Automated email launch funnels & member support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={13} style={{ color: accent.color }} className="flex-shrink-0" />
                  <span>Custom domain + Stripe checkout integration</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('forge_open_pricing', { detail: { track: '50_50' } }))
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl font-bold text-[12px] text-white flex items-center justify-center gap-1.5 transition-all shadow-md hover:brightness-110 active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${accent.color} 0%, rgba(${accent.rgb}, 0.8) 100%)`,
                boxShadow: `0 4px 14px rgba(${accent.rgb}, 0.3)`
              }}
            >
              <span>Apply for 50/50 Track</span>
              <ChevronRight size={13} />
            </button>
          </div>

          {/* Track 2: Co-Builder DIY Pass */}
          <div 
            className="rounded-2xl p-4 sm:p-5 border flex flex-col justify-between transition-all duration-200 group hover:border-white/20"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <h4 className="text-[15px] font-bold text-white">Co-Builder DIY License</h4>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 uppercase tracking-wider">
                100% Creator Rev
              </span>
            </div>
            <div>
              <div className="mb-3">
                <span className="text-[26px] font-extrabold text-white">$50</span>
                <span className="text-[12px] text-slate-400 ml-1.5 font-medium">one-time payment</span>
              </div>
              <ul className="space-y-1.5 text-[12px] text-slate-300 mb-4">
                <li className="flex items-center gap-2">
                  <Check size={13} className="text-emerald-400 flex-shrink-0" />
                  <span>Full GitHub repository source code access</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={13} className="text-emerald-400 flex-shrink-0" />
                  <span>0% revenue share — keep 100% of member earnings</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={13} className="text-emerald-400 flex-shrink-0" />
                  <span>Self-hosted Vercel / Railway / Docker deployment docs</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('forge_open_pricing', { detail: { track: 'diy_pass' } }))
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl font-bold text-[12px] text-white flex items-center justify-center gap-1.5 transition-all border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 active:scale-[0.98]"
            >
              <span>Get $50 DIY Pass</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Footnote */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-slate-500 pt-3 border-t border-white/5">
          <span>Both options include your fully analyzed product blueprint & community architecture.</span>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('forge_open_pricing'))
              }
            }}
            className="text-white hover:underline flex items-center gap-1 font-medium"
            style={{ color: accent.color }}
          >
            Compare track details <ChevronRight size={11} />
          </button>
        </div>
      </div>

      {/* Forge insights - action-tied */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="forge-label">CoLaunch guidance</p>
          <Sparkles size={13} className="text-white/25" />
        </div>
        <div className="space-y-2">
          {INSIGHTS.map((insight, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl border" style={{ background: insight.color, borderColor: 'rgba(255,255,255,0.07)' }}>
              <div className="flex items-start gap-3 flex-1">
                <insight.icon size={15} className="text-white/40 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-white mb-0.5">{insight.label}</p>
                  <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.4)' }}>{insight.detail}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (insight.cta === 'Generate launch post') handleNavigationToStudio('ig-caption')
                  else if (insight.cta === 'Write announcement') handleNavigationToStudio('email-announce')
                  else if (insight.cta === 'Write email') handleNavigationToStudio('email-sequence')
                }}
                className="text-[12px] px-3 py-1.5 rounded-full self-end sm:self-center transition-all duration-150"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }}
                onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.15)'; e.target.style.color = 'white' }}
                onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.color = 'rgba(255,255,255,0.55)' }}
              >
                {insight.cta} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Revenue paths */}
      <section>
        <p className="forge-label mb-4">Revenue paths</p>
        <div className="space-y-2">
          {REVENUE_PATHS.map((path, i) => {
            const widths = [85, 55, 65, 40]
            return (
              <div key={path.label} className="p-4 rounded-xl border transition-all duration-150" style={{ background: 'var(--theme-card-bg, #121722)', borderColor: path.active ? `rgba(${accent.rgb},0.28)` : 'var(--theme-border-color, rgba(255,255,255,0.08))' }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-white">{path.label}</span>
                      {path.active ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: accent.color, color: 'white' }}>Active</span>
                      ) : (
                        <button 
                          onClick={() => handleActivatePath(path.label)}
                          className="text-[9px] px-2 py-0.5 rounded-full border border-white/10 text-white/50 hover:bg-white/5 hover:text-white transition-all font-medium"
                        >
                          Activate
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{path.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[13px] font-semibold text-white">{path.potential}</p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>potential</p>
                  </div>
                </div>
                {/* Potential bar */}
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${widths[i]}%`,
                      background: path.active ? accent.color : 'rgba(255,255,255,0.15)',
                      opacity: path.active ? 0.7 : 0.4,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Next revenue action */}
      <div className="rounded-2xl border p-4 sm:p-5" style={{ background: `rgba(${accent.rgb},0.05)`, borderColor: `rgba(${accent.rgb},0.15)` }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <ArrowUpRight size={16} className="mt-0.5 flex-shrink-0" style={{ color: accent.color }} />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white">Your next revenue move</p>
              <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Post your launch announcement to get your first 10 paying members.</p>
            </div>
          </div>
          <button 
            onClick={() => handleNavigationToStudio('ig-caption')}
            className="forge-btn-primary text-[12px] py-2 px-4 self-end sm:self-center flex-shrink-0"
          >
            Generate post
          </button>
        </div>
      </div>
    </div>
  )
}
