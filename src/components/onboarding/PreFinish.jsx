import { useState, useEffect } from 'react'
import { useForge, getAccent } from '../../App'
import { ArrowRight, Check, Layout, Users, BarChart2, Package, Mail, SlidersHorizontal, RefreshCw } from 'lucide-react'
import WingLogo from '../ui/WingLogo'

function isLightColor(hex) {
  if (!hex || typeof hex !== 'string') return false
  const clean = hex.replace('#', '').trim()
  const r = parseInt(clean.slice(0, 2), 16) || 0
  const g = parseInt(clean.slice(2, 4), 16) || 0
  const b = parseInt(clean.slice(4, 6), 16) || 0
  return ((r * 299 + g * 587 + b * 114) / 1000) > 135
}

function getDynamicBuiltItems(blueprint, creatorData) {
  const type = (blueprint?.type || '').toLowerCase()
  const name = blueprint?.name || 'Your platform'

  if (type.includes('member') || type.includes('community')) {
    return [
      { icon: Users, label: 'Community forum & discussions', detail: 'Private threads, member directory & AMAs' },
      { icon: Layout, label: 'Member portal architecture', detail: 'Member feeds, resource library & announcements' },
      { icon: BarChart2, label: 'Stripe subscription billing', detail: 'Monthly & annual recurring billing live' },
      { icon: Package, label: 'Landing & offer page', detail: 'Conversion-optimized member sales funnel' },
      { icon: Mail, label: 'Email onboarding sequences', detail: 'Automated welcome & activation workflows' },
    ]
  }

  if (type.includes('product') || type.includes('store') || type.includes('supplement')) {
    return [
      { icon: Package, label: 'Product catalog & checkout', detail: 'SKUs, inventory & variant configurations' },
      { icon: Layout, label: 'E-commerce storefront', detail: 'Fast checkout & mobile shopping flow' },
      { icon: BarChart2, label: 'Revenue & order analytics', detail: 'Sales tracking & fulfillment pipelines' },
      { icon: Users, label: 'Customer account portal', detail: 'Order history, subscriptions & support' },
      { icon: Mail, label: 'Order confirmation & marketing', detail: 'Automated receipts & abandoned cart recovery' },
    ]
  }

  if (type.includes('course') || type.includes('masterclass')) {
    return [
      { icon: Layout, label: 'Curriculum & lesson player', detail: 'HD video hosting, modules & attachments' },
      { icon: Users, label: 'Student community forum', detail: 'Q&A discussions, peer feedback & AMAs' },
      { icon: BarChart2, label: 'Creator analytics center', detail: 'Completion rates, quiz grades & revenue' },
      { icon: Package, label: 'Course sales page', detail: 'Curriculum preview & checkout enrollment' },
      { icon: Mail, label: 'Student onboarding emails', detail: 'Welcome sequence & module unlock notices' },
    ]
  }

  return [
    { icon: Layout, label: `${name} architecture`, detail: 'Core routing & responsive layout' },
    { icon: Users, label: 'Member management system', detail: 'User auth, roles & permissions' },
    { icon: BarChart2, label: 'Creator control dashboard', detail: 'Live metrics, MRR tracking & telemetry' },
    { icon: Package, label: 'Offer & launch page', detail: 'Direct purchase & signup flows' },
    { icon: Mail, label: 'Notification pipeline', detail: 'Transactional & promotional emails' },
  ]
}

export default function PreFinish() {
  const { next, creatorData, prev } = useForge()
  const [visible, setVisible] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [change, setChange] = useState(null)

  const blueprint = creatorData.blueprint || { name: 'Creator Academy' }
  const accent = getAccent(creatorData)
  const isLight = isLightColor(accent.color)
  const builtItems = getDynamicBuiltItems(blueprint, creatorData)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const handleApply = () => {
    if (!prompt.trim()) return
    setIsApplying(true)
    setChange(prompt)
    setPrompt('')
    setTimeout(() => setIsApplying(false), 1200)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={prev}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            ← Back
          </button>
          <div className="flex items-center gap-2.5">
            <WingLogo size={22} />
            <span className="text-white font-semibold text-[15px] tracking-tight">CoLaunch</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="rounded-full transition-all duration-300"
              style={{
                width: i === 7 ? '20px' : '6px',
                height: '6px',
                background: i === 7 ? 'white' : i < 7 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
        </div>
      </header>

      <main
        className="flex-1 px-6 pb-16 max-w-3xl mx-auto w-full"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.55s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Heading */}
        <div className="mb-10">
          <p className="forge-label mb-4">Final review</p>
          <h2
            className="forge-heading mb-3"
            style={{ fontSize: 'clamp(28px, 4vw, 42px)', letterSpacing: '-0.035em' }}
          >
            Almost ready.
            <br />
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Here's what Forge built.</span>
          </h2>
          <p className="text-[14px]" style={{ color: 'rgba(255,255,255,0.35)', lineHeight: '1.5' }}>
            Review everything, make a final change, or go straight to your dashboard.
          </p>
        </div>

        {/* Built items */}
        <div className="mb-8">
          <p className="forge-label mb-4">{blueprint.name}</p>
          <div className="space-y-2">
            {builtItems.map(({ icon: Icon, label, detail }, i) => (
              <div
                key={label}
                className="flex items-center gap-4 p-4 rounded-xl border transition-all duration-300"
                style={{
                  background: '#111114',
                  borderColor: 'rgba(255,255,255,0.07)',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(8px)',
                  transition: `all 0.4s cubic-bezier(0.16,1,0.3,1) ${0.1 + i * 0.06}s`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  <Icon size={16} className="text-white/60" />
                </div>
                <div className="flex-1">
                  <span className="text-[14px] font-medium text-white">{label}</span>
                  <p className="text-[12px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{detail}</p>
                </div>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: accent.color }}
                >
                  <Check size={12} style={{ color: isLight ? '#000000' : '#ffffff' }} strokeWidth={2.5} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Applied change pill */}
        {change && !isApplying && (
          <div
            className="mb-4 flex items-center gap-2 px-3 py-2 rounded-full"
            style={{ background: 'rgba(255,255,255,0.06)', display: 'inline-flex' }}
          >
            <Check size={12} style={{ color: accent.color }} />
            <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.7)' }}>Applied: "{change}"</span>
          </div>
        )}

        {/* Final prompt */}
        <div
          className="mb-8 rounded-2xl border p-5"
          style={{ background: '#111114', borderColor: 'rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal size={14} style={{ color: accent.color }} />
            <span className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
              One more change?
            </span>
          </div>
          <div className="flex gap-2">
            <div
              className="flex-1 flex items-center gap-2 rounded-xl border px-4 py-2.5 transition-all duration-200 focus-within:border-white/20"
              style={{ background: '#0a0a0c', borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <input
                className="forge-input text-[13px]"
                placeholder="e.g. Make the colors softer, rename to Creator Hub..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleApply()}
                disabled={isApplying}
              />
            </div>
            <button
              onClick={handleApply}
              disabled={!prompt.trim() || isApplying}
              className="forge-btn-secondary px-4 py-2.5 text-[13px] gap-2 disabled:opacity-30 cursor-pointer"
            >
              {isApplying ? (
                <RefreshCw size={13} className="animate-spin" />
              ) : (
                <>Apply</>
              )}
            </button>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={next}
          disabled={isApplying}
          className="text-[15px] px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
          style={{
            background: isApplying ? 'rgba(255,255,255,0.08)' : accent.color,
            color: isApplying ? 'rgba(255,255,255,0.4)' : (isLight ? '#000000' : '#ffffff'),
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {isApplying ? (
            <span className="flex items-center gap-2">
              <RefreshCw size={14} className="animate-spin" />
              <span>Updating platform...</span>
            </span>
          ) : (
            <>
              Finish building
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </main>
    </div>
  )
}
