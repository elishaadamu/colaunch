import { useState, useEffect } from 'react'
import { useForge, getAccent } from '../../App'
import { 
  ArrowRight, Check, Share2, Mail, Users, Globe, Copy, CheckCheck, 
  Sparkles, ShieldCheck, Rocket, Volume2, Radio, Play, ShoppingBag, 
  Layers, BarChart2, Package
} from 'lucide-react'
import WingLogo from '../ui/WingLogo'

function isLightColor(hex) {
  if (!hex || typeof hex !== 'string') return false
  const clean = hex.replace('#', '').trim()
  const r = parseInt(clean.slice(0, 2), 16) || 0
  const g = parseInt(clean.slice(2, 4), 16) || 0
  const b = parseInt(clean.slice(4, 6), 16) || 0
  return ((r * 299 + g * 587 + b * 114) / 1000) > 135
}

function Confetti({ accentColor }) {
  const pieces = Array.from({ length: 48 }, (_, i) => i)
  const colors = [accentColor || '#10B981', '#38BDF8', '#F59E0B', '#EC4899', '#A855F7', '#ffffff']
  const shapes = ['rounded-full', 'rounded-sm', 'rounded-none']

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {pieces.map(i => {
        const x = (i * 2.2 + 3) % 100
        const delay = (i * 0.07) % 3
        const duration = 3.5 + (i % 5) * 0.7
        const size = 5 + (i % 6) * 1.5
        const color = colors[i % colors.length]
        const shape = shapes[i % shapes.length]

        return (
          <div
            key={i}
            className={`absolute confetti-piece ${shape}`}
            style={{
              left: `${x}%`,
              top: '-15px',
              width: `${size}px`,
              height: `${size * 0.65}px`,
              background: color,
              opacity: 0.75,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        )
      })}
    </div>
  )
}

function getRichBuiltModules(blueprint, creatorData) {
  const name = blueprint?.name || 'Creator Platform'
  const features = Array.isArray(creatorData?.features) && creatorData.features.length > 0
    ? creatorData.features
    : Array.isArray(blueprint?.features) && blueprint.features.length > 0
      ? blueprint.features
      : ['Community Forum', 'Member Discussions', 'Video Releases', 'Official Announcements']

  const modules = []

  features.forEach((feat, idx) => {
    const fLower = feat.toLowerCase()
    if (fLower.includes('podcast')) {
      modules.push({
        id: `podcast-${idx}`,
        icon: Volume2,
        title: 'Podcast Engine & Audio Player',
        description: 'Audio syndication, show notes feed & web streaming player',
        status: 'Active',
      })
    } else if (fLower.includes('live') || fLower.includes('ama') || fLower.includes('event')) {
      modules.push({
        id: `live-${idx}`,
        icon: Radio,
        title: 'Live Stage & Event Hosting',
        description: 'Scheduled broadcast rooms, live Q&A queue & recording archive',
        status: 'Active',
      })
    } else if (fLower.includes('store') || fLower.includes('product') || fLower.includes('drop')) {
      modules.push({
        id: `store-${idx}`,
        icon: ShoppingBag,
        title: 'Digital Storefront & Vault',
        description: 'Stripe checkout flow, downloadable assets & product vault',
        status: 'Configured',
      })
    } else if (fLower.includes('video') || fLower.includes('vault') || fLower.includes('release')) {
      modules.push({
        id: `videos-${idx}`,
        icon: Play,
        title: 'Video Vault & YouTube Sync',
        description: 'Curated video releases, playlist indexing & adaptive playback',
        status: 'Synced',
      })
    } else if (fLower.includes('forum') || fLower.includes('community') || fLower.includes('discussion')) {
      modules.push({
        id: `community-${idx}`,
        icon: Users,
        title: 'Member Community & Feed',
        description: 'Real audience comments, threaded discussions & creator announcements',
        status: 'Live',
      })
    } else if (fLower.includes('tier') || fLower.includes('perk') || fLower.includes('membership')) {
      modules.push({
        id: `billing-${idx}`,
        icon: BarChart2,
        title: 'Stripe Membership & Paywalls',
        description: 'Recurring subscription tiers, member perks & access control',
        status: 'Ready',
      })
    } else if (fLower.includes('announcement')) {
      modules.push({
        id: `announcements-${idx}`,
        icon: Sparkles,
        title: 'Official Channel Broadcasts',
        description: 'Verified creator updates, release alerts & push notifications',
        status: 'Active',
      })
    } else if (fLower.includes('course') || fLower.includes('curriculum')) {
      modules.push({
        id: `course-${idx}`,
        icon: Layers,
        title: 'Structured Course Builder',
        description: 'Video lesson curriculum, module tracking & milestone certificates',
        status: 'Built',
      })
    } else {
      modules.push({
        id: `custom-${idx}`,
        icon: Package,
        title: feat,
        description: `Dedicated ${feat.toLowerCase()} pipeline configured for ${name}`,
        status: 'Active',
      })
    }
  })

  // Ensure telemetry is always present
  modules.push({
    id: 'analytics-core',
    icon: BarChart2,
    title: 'Creator Studio Telemetry',
    description: 'Real-time subscriber tracking, revenue analytics & member management',
    status: 'Ready',
  })

  return modules.slice(0, 6)
}

export default function Celebration() {
  const { next, creatorData } = useForge()
  const [visible, setVisible] = useState(false)
  const [copied, setCopied] = useState(false)

  const blueprint = creatorData.blueprint || { name: 'Creator Platform' }
  const handle = creatorData.handle || '@creator'
  const cleanHandle = (creatorData.handle || creatorData.name || 'creator')
    .replace(/^@/, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '') || 'creator'
  
  const creatorId = creatorData?.id || creatorData?.channelId || creatorData?._id || (
    'cr_' + cleanHandle + '_' + Math.abs(cleanHandle.split('').reduce((acc, ch) => ((acc << 5) - acc) + ch.charCodeAt(0), 0)).toString(36)
  )
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://colaunch.app'
  const publicUrl = `${baseUrl}/${cleanHandle}/${creatorId}`
  
  const resolvedAvatar = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''
  
  const accent = getAccent(creatorData)
  const isLight = isLightColor(accent.color)
  const builtModules = getRichBuiltModules(blueprint, creatorData)

  useEffect(() => {
    if (!creatorData.id) {
      creatorData.id = creatorId
      try {
        localStorage.setItem('forge_creator_data', JSON.stringify({ ...creatorData, id: creatorId }))
      } catch {}
    }
  }, [creatorId, creatorData])

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const handleCopyLink = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(publicUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden bg-[#08090d] text-slate-100">
      <Confetti accentColor={accent.color} />

      {/* Ambient background glow behind header */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] rounded-full blur-[140px] pointer-events-none opacity-20"
        style={{ background: accent.color }}
      />

      <div 
        className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(20px)',
        }}
      >
        {/* Milestone Status Pill */}
        <div 
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none border text-xs font-semibold tracking-wide uppercase mb-6"
          style={{
            background: `rgba(${accent.rgb}, 0.1)`,
            borderColor: `rgba(${accent.rgb}, 0.3)`,
            color: accent.color
          }}
        >
          <span className="w-2 h-2" style={{ background: accent.color }} />
          <span>Platform Live on Edge · Deployment Complete</span>
        </div>

        {/* Hero Brand & Headline */}
        <div className="text-center max-w-3xl mb-8 sm:mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div 
              className="w-14 h-14 rounded-none flex items-center justify-center border overflow-hidden relative"
              style={{
                background: `rgba(${accent.rgb}, 0.12)`,
                borderColor: `rgba(${accent.rgb}, 0.35)`,
              }}
            >
              {resolvedAvatar ? (
                <img src={resolvedAvatar} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <WingLogo size={32} color={accent.color} />
              )}
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-3">
            {blueprint.name} <span style={{ color: accent.color }}>is live.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Forge provisioned your custom software suite in under a minute. 
            <br className="hidden sm:inline" /> 
            <strong className="text-slate-200">{handle}</strong>, your community, content, and revenue rails are ready.
          </p>

          {/* Public URL Link Banner */}
          <div className="mt-5 inline-flex items-center gap-2.5 p-1.5 pl-4 rounded-none bg-[#12141c] border border-[#222634] max-w-full">
            <Globe className="w-4 h-4 flex-shrink-0" style={{ color: accent.color }} />
            <span className="font-mono text-xs sm:text-sm text-slate-300 truncate select-all">
              {publicUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-semibold transition cursor-pointer"
              style={{
                background: copied ? 'rgba(16, 185, 129, 0.15)' : `rgba(${accent.rgb}, 0.15)`,
                color: copied ? '#34D399' : accent.color,
                border: `1px solid ${copied ? 'rgba(16, 185, 129, 0.3)' : `rgba(${accent.rgb}, 0.3)`}`
              }}
              title="Copy link to clipboard"
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* 2-Column Main Workspace */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: What Forge Built (Span 7) */}
          <div className="lg:col-span-7 bg-[#12141c] border border-[#222634] rounded-none p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#222634]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: accent.color }} />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Provisioned Architecture & Modules
                </h3>
              </div>
              <span 
                className="text-[10px] font-mono px-2 py-0.5 rounded-none font-bold border"
                style={{ 
                  background: `rgba(${accent.rgb}, 0.1)`, 
                  color: accent.color,
                  borderColor: `rgba(${accent.rgb}, 0.25)`
                }}
              >
                {builtModules.length} Modules Active
              </span>
            </div>

            <div className="space-y-3">
              {builtModules.map((m) => {
                const ModIcon = m.icon
                return (
                  <div 
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-none bg-[#161922] border border-[#222634] hover:border-slate-700 transition group"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0 pr-3">
                      <div 
                        className="w-9 h-9 rounded-none flex items-center justify-center flex-shrink-0 border"
                        style={{
                          background: `rgba(${accent.rgb}, 0.1)`,
                          color: accent.color,
                          borderColor: `rgba(${accent.rgb}, 0.25)`
                        }}
                      >
                        <ModIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-white block truncate">
                          {m.title}
                        </span>
                        <span className="text-xs text-slate-400 block truncate">
                          {m.description}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>{m.status}</span>
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Telemetry Footnote */}
            <div className="mt-5 pt-4 border-t border-[#222634] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SSL Active
                </span>
                <span>·</span>
                <span>Edge CDN: Global</span>
                <span>·</span>
                <span>Database: Connected</span>
              </div>
              <span className="text-emerald-400 font-semibold">100% Operational</span>
            </div>
          </div>

          {/* Right Column: Launchpad & Quick Actions (Span 5) */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            {/* Quick Launch Checklist */}
            <div className="bg-[#12141c] border border-[#222634] rounded-none p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#222634]">
                <Rocket className="w-4 h-4" style={{ color: accent.color }} />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Launchpad: What to Do Next
                </h3>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3 p-3 rounded-none bg-[#161922] border border-[#222634]">
                  <div 
                    className="w-8 h-8 rounded-none flex items-center justify-center flex-shrink-0 mt-0.5 border"
                    style={{
                      background: `rgba(${accent.rgb}, 0.1)`,
                      color: accent.color,
                      borderColor: `rgba(${accent.rgb}, 0.25)`
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">1. Announce to your audience</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Post your launch link on your YouTube community tab and video descriptions.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-none bg-[#161922] border border-[#222634]">
                  <div 
                    className="w-8 h-8 rounded-none flex items-center justify-center flex-shrink-0 mt-0.5 border"
                    style={{
                      background: `rgba(${accent.rgb}, 0.1)`,
                      color: accent.color,
                      borderColor: `rgba(${accent.rgb}, 0.25)`
                    }}
                  >
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">2. Review your launch sequence</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Automated welcome broadcasts are pre-drafted and ready in Creator Studio.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-none bg-[#161922] border border-[#222634]">
                  <div 
                    className="w-8 h-8 rounded-none flex items-center justify-center flex-shrink-0 mt-0.5 border"
                    style={{
                      background: `rgba(${accent.rgb}, 0.1)`,
                      color: accent.color,
                      borderColor: `rgba(${accent.rgb}, 0.25)`
                    }}
                  >
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">3. Welcome your first 10 members</span>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      Engage early supporters directly in your live discussion channels.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary CTA Card */}
            <div className="bg-[#12141c] border border-[#222634] rounded-none p-6 flex flex-col justify-between">
              <button
                type="button"
                onClick={next}
                className="w-full font-bold py-4 px-6 rounded-none text-sm transition flex items-center justify-center space-x-2.5 group cursor-pointer border border-white/10"
                style={{
                  background: accent.color,
                  color: isLight ? '#000000' : '#ffffff',
                }}
              >
                <span>Enter your dashboard</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <p className="text-center text-xs text-slate-500 mt-3 font-medium">
                Your Creator Studio OS is configured and ready
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
