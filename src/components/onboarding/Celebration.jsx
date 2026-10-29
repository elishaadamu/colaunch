import { useState, useEffect } from 'react'
import { useForge, getAccent } from '../../App'
import { ArrowRight, Check, Share2, Mail, Users } from 'lucide-react'
import WingLogo from '../ui/WingLogo'

function isLightColor(hex) {
  if (!hex || typeof hex !== 'string') return false
  const clean = hex.replace('#', '').trim()
  const r = parseInt(clean.slice(0, 2), 16) || 0
  const g = parseInt(clean.slice(2, 4), 16) || 0
  const b = parseInt(clean.slice(4, 6), 16) || 0
  return ((r * 299 + g * 587 + b * 114) / 1000) > 135
}

function Confetti() {
  const pieces = Array.from({ length: 40 }, (_, i) => i)
  const colors = ['#ffffff', '#e5e5e5', '#a0a0a0', '#606060', '#c0c0c0']
  const shapes = ['rounded-full', 'rounded-sm', 'rounded-none']

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {pieces.map(i => {
        const x = Math.random() * 100
        const delay = Math.random() * 3
        const duration = 3 + Math.random() * 4
        const size = 4 + Math.random() * 8
        const color = colors[Math.floor(Math.random() * colors.length)]
        const shape = shapes[Math.floor(Math.random() * shapes.length)]

        return (
          <div
            key={i}
            className={`absolute confetti-piece ${shape}`}
            style={{
              left: `${x}%`,
              top: '-10px',
              width: `${size}px`,
              height: `${size * (0.4 + Math.random() * 0.8)}px`,
              background: color,
              opacity: 0.6 + Math.random() * 0.4,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        )
      })}
    </div>
  )
}

function getWhatWasBuilt(blueprint, creatorData) {
  const type = (blueprint?.type || '').toLowerCase()
  const name = blueprint?.name || 'Your platform'
  const creator = creatorData?.name || creatorData?.handle || 'you'
  
  if (type.includes('member') || type.includes('community')) {
    return [
      `Community hub: live forum for ${creator}'s members`,
      'Tiered subscription billing: Stripe live rails',
      'Exclusive resource vault & AMAs: scheduled',
      'Member onboarding sequence: configured',
      'Creator dashboard: track active MRR & churn'
    ]
  }
  
  if (type.includes('product') || type.includes('store') || type.includes('supplement') || type.includes('drop')) {
    return [
      `Product catalog & checkout: active for ${name}`,
      'Cart & shipping engine: configured',
      'Bundle discounts & promotional codes: ready',
      'Order fulfillment pipeline: connected',
      'Creator dashboard: revenue & sales analytics'
    ]
  }

  if (type.includes('course') || type.includes('masterclass') || type.includes('academy')) {
    return [
      'Course curriculum builder: structured modules',
      'Video lesson streaming player: HD ready',
      'Downloadable workbook & asset files: hosted',
      'Student certification pipeline: active',
      'Creator dashboard: student completion telemetry'
    ]
  }

  if (type.includes('app') || type.includes('mobile')) {
    return [
      'Mobile web application: responsive PWA active',
      'Push notifications gateway: connected',
      'In-app member feed & discussions: live',
      'Paywall & subscriber access: provisioned',
      'Creator dashboard: active daily users tracking'
    ]
  }

  const customFeatures = Array.isArray(blueprint?.features) && blueprint.features.length >= 3
    ? blueprint.features.slice(0, 5).map(f => `${f}: configured & active`)
    : [
        `${name}: core architecture ready`,
        'Member checkout & payments: Stripe live rails',
        'Discussion forum: invite your first members',
        'Email delivery pipeline: templates provisioned',
        'Creator dashboard: track your growth'
      ]
  return customFeatures
}

const FIRST_STEPS = [
  { icon: Share2, label: 'Share your launch link' },
  { icon: Mail, label: 'Send your first email' },
  { icon: Users, label: 'Invite 10 beta members' },
]

export default function Celebration() {
  const { next, creatorData } = useForge()
  const [visible, setVisible] = useState(false)
  const [showItems, setShowItems] = useState([])
  const [showCTA, setShowCTA] = useState(false)

  const blueprint = creatorData.blueprint || { name: 'Creator Academy' }
  const handle = creatorData.handle || '@creator'
  const accent = getAccent(creatorData)
  const isLight = isLightColor(accent.color)
  const dynamicBuiltItems = getWhatWasBuilt(blueprint, creatorData)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)

    // Stagger the built items
    dynamicBuiltItems.forEach((_, i) => {
      setTimeout(() => {
        setShowItems(prev => [...prev, i])
      }, 600 + i * 180)
    })

    setTimeout(() => setShowCTA(true), 600 + dynamicBuiltItems.length * 180 + 400)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <Confetti />

      <div
        className="relative z-10 w-full max-w-md text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(24px)',
          transition: 'all 0.65s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Icon with margin top and transparent background */}
        <div className="flex justify-center mt-12 sm:mt-16 mb-8 pt-4">
          <div className="transition-transform hover:scale-105 flex items-center justify-center">
            <WingLogo size={56} color={accent.color} />
          </div>
        </div>

        {/* Heading */}
        <h1
          className="forge-heading mb-3"
          style={{ fontSize: 'clamp(36px, 6vw, 52px)', letterSpacing: '-0.04em' }}
        >
          {blueprint.name} is live.
        </h1>

        <p className="text-[16px] mb-10" style={{ color: 'rgba(255,255,255,0.4)', lineHeight: '1.5' }}>
          Forge built your entire {blueprint.type || 'platform'} in under a minute.
          <br />
          {handle}, your business is ready.
        </p>

        {/* What was built */}
        <div
          className="rounded-2xl border p-5 mb-6 text-left"
          style={{ background: '#111114', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <p className="text-[12px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
            What Forge built
          </p>
          <div className="space-y-2.5">
            {dynamicBuiltItems.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 transition-all duration-400"
                style={{
                  opacity: showItems.includes(i) ? 1 : 0,
                  transform: showItems.includes(i) ? 'translateY(0)' : 'translateY(6px)',
                  transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: showItems.includes(i) ? accent.color : 'rgba(255,255,255,0.08)' }}
                >
                  {showItems.includes(i) && (
                    <Check size={11} style={{ color: isLight ? '#000000' : '#ffffff' }} strokeWidth={3} />
                  )}
                </div>
                <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.75)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* First steps */}
        <div
          className="rounded-2xl border p-5 mb-8 text-left"
          style={{
            background: 'rgba(255,255,255,0.03)',
            borderColor: 'rgba(255,255,255,0.07)',
            opacity: showCTA ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}
        >
          <p className="text-[12px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.25)' }}>
            What to do first
          </p>
          <div className="space-y-3">
            {FIRST_STEPS.map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `rgba(${accent.rgb}, 0.12)`,
                    border: `1px solid rgba(${accent.rgb}, 0.25)`
                  }}
                >
                  <Icon size={14} style={{ color: accent.color }} />
                </div>
                <span className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          style={{
            opacity: showCTA ? 1 : 0,
            transform: showCTA ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <button
            onClick={next}
            className="w-full text-[15px] py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 cursor-pointer group"
            style={{
              background: accent.color,
              color: isLight ? '#000000' : '#ffffff',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            Enter your dashboard
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
          <p className="text-[12px] mt-3" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Your Forge command center is ready
          </p>
        </div>
      </div>
    </div>
  )
}
