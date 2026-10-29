import { useState, useEffect } from 'react'
import { useForge, getAccent, useBgJob } from '../../App'
import { 
  ArrowRight, ArrowLeft, Globe, Smartphone, ShoppingBag, Users, Youtube, Instagram, 
  CheckCircle, CheckCircle2, Play, Lock, Check, ChevronDown, HelpCircle, Info, Video, Compass, MoreHorizontal,
  Hammer, Trash2, MessageSquare, Heart
} from 'lucide-react'
import { XLogo } from '../launch/PostVisualMockup'
import WingLogo from '../ui/WingLogo'
import { getScrapePromise, isScrapePending } from '../../services/scraper'
import { 
  generateRecommendationsAI, 
  areRecsValidForCreator, 
  getFallbackCleanRecommendations,
  calculateFollowerRevenueRange,
  parseFollowerCount
} from '../../services/ai'
import { recommendCreator } from '../../services/opsApi'


// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n) {
  n = parseFollowerCount(n)
  if (n >= 1_000_000) {
    const m = n / 1_000_000
    return m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`
  }
  if (n >= 1_000) {
    const k = n / 1_000
    return k % 1 === 0 ? `${k}K` : `${k.toFixed(1)}K`
  }
  return String(n)
}

function isLightColor(hex) {
  if (!hex || typeof hex !== 'string') return false
  const clean = hex.replace('#', '').trim()
  const r = parseInt(clean.slice(0, 2), 16) || 0
  const g = parseInt(clean.slice(2, 4), 16) || 0
  const b = parseInt(clean.slice(4, 6), 16) || 0
  return ((r * 299 + g * 587 + b * 114) / 1000) > 135
}

const PLATFORM_ICONS = {
  youtube:   Youtube,
  instagram: Instagram,
  twitter:   XLogo,
  tiktok:    Globe,
}

const PLATFORM_LABELS = {
  youtube:   'YouTube',
  instagram: 'Instagram',
  twitter:   'X',
  tiktok:    'TikTok',
}

// ── Creator blurb from scraped signals ───────────────────────────────────────

function buildCreatorBlurb(creator) {
  const { name, handle, platform, followers, engagementRate, niche, description } = creator
  const displayName = name || (handle || '').replace('@', '') || 'This creator'
  const fmtFollowers = followers ? fmt(followers) : null
  const eng = parseFloat(engagementRate) || 0
  const isYT = platform === 'youtube'
  const followerTerm = isYT ? 'subscribers' : 'followers'

  // Use real bio if available and meaningful (avoid generic subscribe prompts)
  if (description && description.length > 20) {
    const short = description.split('.')[0].trim()
    const isGenericPrompt = short.toLowerCase().includes('subscribe') && short.length < 35
    if (short.length > 15 && short.length < 120 && !isGenericPrompt) {
      return short
    }
  }

  // Build natural, grammatically correct blurb from signals
  const cleanNiche = (niche && niche !== 'Lifestyle & Creativity' && niche !== 'Creator') ? niche : 'content'
  const article = /^[aeiou]/i.test(cleanNiche) ? 'an' : 'a'

  let text = `${displayName} is ${article} ${cleanNiche} creator`
  if (fmtFollowers) {
    text += ` with ${fmtFollowers} ${followerTerm}`
  }
  if (eng >= 6) {
    text += ' and an exceptionally engaged audience.'
  } else if (eng >= 3.0) {
    text += ' and a highly engaged audience.'
  } else if (eng > 0) {
    text += ' and an established community.'
  } else {
    text += '.'
  }

  return text
}

// ── Why-this-fits reasons (dynamic per blueprint × creator) ──────────────────

function buildReasons(blueprintId, creator) {
  const { platform, followers, engagementRate, niche, description } = creator
  const eng = parseFloat(engagementRate) || 0
  const subs = parseFollowerCount(followers)
  const desc = (description || '').toLowerCase()
  const nicheL = (niche || '').toLowerCase()

  const isEducation  = nicheL.includes('educat') || nicheL.includes('learn') || desc.includes('teach') || desc.includes('learn') || desc.includes('course')
  const isEntertain  = nicheL.includes('comedy') || nicheL.includes('entertain') || nicheL.includes('gaming')
  const isTech       = nicheL.includes('tech') || nicheL.includes('gadget')
  const isFinance    = nicheL.includes('finance') || nicheL.includes('business')
  const isLifestyle  = nicheL.includes('lifestyle') || nicheL.includes('travel') || nicheL.includes('fitness')
  const isYouTube    = platform === 'youtube'
  const isShortForm  = platform === 'tiktok' || platform === 'instagram'
  const highEng      = eng >= 4
  const veryHighEng  = eng >= 6

  switch (blueprintId) {
    case 'web-app': return [
      subs >= 100_000
        ? `${fmt(subs)} followers signals a large enough base to support a paid platform from day one`
        : `Your engaged community is the right size to test a paid platform`,
      isYouTube
        ? `YouTube audiences expect long-form depth — a course platform is the natural next step`
        : `Your ${PLATFORM_LABELS[platform] || 'social'} audience already shows interest in learning from you`,
      highEng
        ? `${eng}% engagement rate means your audience is primed to pay for exclusive access`
        : `Your audience follows you for a reason — that trust converts to subscriptions`,
      isEducation
        ? `Your ${niche} niche has proven willingness to pay for structured knowledge`
        : `Course platforms work for every niche — yours included`,
    ]

    case 'mobile-app': return [
      isShortForm
        ? `${PLATFORM_LABELS[platform]} audiences check their phone constantly — a native app fits their behavior`
        : `A mobile app extends your YouTube presence into daily screen time`,
      veryHighEng
        ? `${eng}% engagement proves your audience wants more from you than a feed can offer`
        : `Push notifications can 3x your retention vs social algorithms`,
      `Mobile apps generate recurring revenue through in-app purchases and subscriptions`,
      isEntertain
        ? `Entertainment content thrives with daily drops and exclusive clips`
        : `Exclusive daily content keeps members coming back`,
    ]

    case 'community': return [
      highEng
        ? `${eng}% engagement means your followers already talk to each other — you just need a home for it`
        : `Even a small paid community from ${fmt(subs)} followers yields significant MRR`,
      isLifestyle || isFinance
        ? `${niche} followers pay premium for peer accountability and insider access`
        : `Paid communities work when people trust the host — your followers clearly do`,
      `Monthly memberships create predictable recurring revenue, unlike one-time products`,
      isYouTube
        ? `YouTube comment sections are screaming for a dedicated community space`
        : `Your most engaged followers want somewhere to connect beyond the algorithm`,
    ]

    case 'digital-products': return [
      `One-time products require zero ongoing effort after launch`,
      isFinance || isTech
        ? `${niche} audiences pay well for templates, tools, and frameworks that save them time`
        : `Templates and guides in your niche sell on autopilot once listed`,
      subs >= 50_000
        ? `At ${fmt(subs)} followers, even a 0.1% conversion rate means hundreds of sales per launch`
        : `Digital products have zero inventory risk — perfect for testing what your audience pays for`,
      `Bundles and upsells can multiply revenue per customer without extra content`,
    ]

    default: return []
  }
}



// ── Blueprint definitions ─────────────────────────────────────────────────────

const BLUEPRINTS = [
  {
    id: 'web-app',
    type: 'Web App',
    name: 'Creator Academy',
    tagline: 'Your own skill-building platform',
    description: 'A branded learning hub where your audience pays for courses, live sessions, and exclusive resources — all under your name.',
    revenue: '$8K–$30K / mo',
    fit: 93,
    icon: Globe,
    primary: true,
    preview: 'webapp',
    features: ['Course builder', 'Community forum', 'Live events', 'Analytics'],
  },
  {
    id: 'mobile-app',
    type: 'Mobile App',
    name: 'Creator Club',
    tagline: 'Daily drops on mobile',
    description: 'An iOS/Android app your audience installs and returns to daily.',
    revenue: '$5K–$20K / mo',
    fit: 87,
    icon: Smartphone,
    preview: 'mobile',
    features: ['Push notifications', 'Members feed', 'Exclusive drops', 'In-app purchases'],
  },
  {
    id: 'community',
    type: 'Membership',
    name: 'Inner Circle',
    tagline: 'A paid community for your people',
    description: 'Gated community with tiered memberships and monthly live AMAs.',
    revenue: '$3K–$15K / mo',
    fit: 81,
    icon: Users,
    preview: 'community',
    features: ['Tiered tiers', 'Private forum', 'Monthly AMAs', 'Exclusive perks'],
  },
  {
    id: 'digital-products',
    type: 'Digital Products',
    name: 'Creator Store',
    tagline: 'Templates, guides, and toolkits',
    description: 'A curated storefront of high-value digital products your audience already wants.',
    revenue: '$2K–$12K / mo',
    fit: 74,
    icon: ShoppingBag,
    preview: 'store',
    features: ['Instant delivery', 'Bundled packs', 'Upsells', 'Affiliate support'],
  },
]

// ── Preview mocks ─────────────────────────────────────────────────────────────

function WebAppPreview({ accent, primary, creatorData }) {
  const avatar = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''
  const creatorName = creatorData?.name || creatorData?.handle?.replace('@', '') || 'Creator'
  const appName = primary?.name || 'Masterclass Series'
  const isMusic = (appName + ' ' + (creatorData?.niche || '')).toLowerCase().match(/musical|theater|broadway|music|song/)

  const modules = isMusic ? [
    { title: 'Dramatic Score & Form', lessons: '12 lessons', badge: 'POPULAR', progress: '85%' },
    { title: 'Broadway Archive Vault', lessons: '8 lessons', badge: 'PRO', lock: true },
    { title: 'Lyrical Storytelling', lessons: '6 lessons', badge: 'READY', progress: '100%' },
    { title: 'Live Composition AMA', lessons: 'Live in 2d', badge: 'LIVE', live: true },
  ] : [
    { title: `${creatorName} Core Method`, lessons: '12 lessons', badge: 'POPULAR', progress: '85%' },
    { title: 'Advanced Tactics & Secrets', lessons: '8 lessons', badge: 'PRO', lock: true },
    { title: 'Quick Start Templates', lessons: '6 lessons', badge: 'READY', progress: '100%' },
    { title: 'Weekly Creator Stream', lessons: 'Live in 2d', badge: 'LIVE', live: true },
  ]

  return (
    <div className="w-full h-full flex flex-col p-2.5 gap-2 select-none" style={{ background: '#0a0a0c' }}>
      {/* Top Navbar */}
      <div className="flex items-center justify-between pb-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-4 h-4 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0 relative"
            style={{ background: `rgba(${accent.rgb}, 0.15)`, border: `1px solid rgba(${accent.rgb}, 0.3)` }}>
            <span className="text-[7px] font-black select-none" style={{ color: accent.color }}>
              {creatorName.charAt(0).toUpperCase()}
            </span>
            {avatar && (
              <img 
                src={avatar} 
                alt="" 
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover" 
                onError={e => { 
                  if (!e.currentTarget.dataset.proxied && avatar.startsWith('http')) {
                    e.currentTarget.dataset.proxied = 'true';
                    e.currentTarget.src = `/api/proxy/avatar?url=${encodeURIComponent(avatar)}`;
                  } else {
                    e.currentTarget.style.display = 'none'; 
                  }
                }} 
              />
            )}
          </div>
          <span className="text-[9px] font-bold text-white/90 truncate max-w-[70px] sm:max-w-[85px]">
            {appName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[8px] font-semibold shrink-0">
          <span className="relative pb-0.5 whitespace-nowrap" style={{ color: accent.color }}>
            Courses
            <span className="absolute bottom-0 left-0 right-0 h-[1.5px] rounded-full" style={{ background: accent.color }} />
          </span>
          <span className="text-white/40 whitespace-nowrap hidden sm:inline">Community</span>
          <span className="text-white/40 whitespace-nowrap">Live</span>
          <div className="px-2 py-0.5 rounded-full text-[7px] font-extrabold uppercase tracking-wide whitespace-nowrap shrink-0 leading-tight"
            style={{ 
              background: accent.color, 
              color: isLightColor(accent.color) ? '#000000' : '#ffffff' 
            }}>
            Sign In
          </div>
        </div>
      </div>

      {/* Hero Featured Banner - Flat studio style, no gradient, no shadow */}
      <div className="rounded-lg p-2 relative overflow-hidden flex items-center justify-between flex-shrink-0 border"
        style={{
          background: `rgba(${accent.rgb}, 0.12)`,
          borderColor: `rgba(${accent.rgb}, 0.25)`
        }}>
        <div className="min-w-0 pr-2">
          <div className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[6.5px] font-extrabold uppercase tracking-wide mb-0.5"
            style={{ background: `rgba(${accent.rgb}, 0.22)`, color: accent.color }}>
            Featured Masterclass
          </div>
          <div className="text-[9.5px] font-bold text-white truncate leading-tight">
            {isMusic ? 'Storytelling Through Song' : `${creatorName} Masterclass`}
          </div>
          <div className="text-[7.5px] text-white/50">Full Video Curriculum · 4.9 ★</div>
        </div>
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: accent.color, color: '#000' }}>
          <Play size={10} fill="#000" className="ml-0.5" />
        </div>
      </div>

      {/* Grid of Real Module Cards */}
      <div className="grid grid-cols-2 gap-1.5 flex-1">
        {modules.map((m, idx) => (
          <div key={idx} className="rounded-lg p-1.5 flex flex-col justify-between border"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[7px] font-bold px-1 rounded uppercase tracking-wider"
                  style={{
                    background: m.live ? 'rgba(239,68,68,0.18)' : m.lock ? 'rgba(255,255,255,0.08)' : `rgba(${accent.rgb}, 0.15)`,
                    color: m.live ? '#ef4444' : m.lock ? 'rgba(255,255,255,0.5)' : accent.color
                  }}>
                  {m.badge}
                </span>
                {m.lock ? (
                  <Lock size={9} className="text-white/40" />
                ) : (
                  <Play size={9} style={{ color: accent.color }} fill={accent.color} />
                )}
              </div>
              <div className="text-[8.5px] font-semibold text-white/90 leading-tight truncate">
                {m.title}
              </div>
              <div className="text-[7px] text-white/40">{m.lessons}</div>
            </div>
            {m.progress ? (
              <div className="mt-1">
                <div className="h-0.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: m.progress, background: accent.color }} />
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}

function MobilePreview({ accent, primary, creatorData }) {
  const avatar = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''
  const creatorName = creatorData?.name || creatorData?.handle?.replace('@', '') || 'Creator'

  return (
    <div className="w-full h-full flex items-center justify-center p-2 select-none">
      <div className="relative rounded-2xl border-2 overflow-hidden flex flex-col"
        style={{ width: '135px', height: '200px', borderColor: 'rgba(255,255,255,0.18)', background: '#08080a' }}>
        
        {/* Phone Speaker Notch */}
        <div className="w-10 h-1.5 bg-black rounded-b-md mx-auto z-10 flex-shrink-0" />

        {/* Mini App Header */}
        <div className="flex items-center justify-between px-2 py-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-1 min-w-0">
            <div className="w-3.5 h-3.5 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 relative"
              style={{ background: `rgba(${accent.rgb}, 0.2)` }}>
              <span className="text-[6px] font-bold select-none" style={{ color: accent.color }}>{creatorName.charAt(0)}</span>
              {avatar && (
                <img 
                  src={avatar} 
                  alt="" 
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover" 
                  onError={e => { 
                    if (!e.currentTarget.dataset.proxied && avatar.startsWith('http')) {
                      e.currentTarget.dataset.proxied = 'true';
                      e.currentTarget.src = `/api/proxy/avatar?url=${encodeURIComponent(avatar)}`;
                    } else {
                      e.currentTarget.style.display = 'none'; 
                    }
                  }} 
                />
              )}
            </div>
            <span className="text-[7.5px] font-bold text-white truncate max-w-[65px]">{creatorName}</span>
          </div>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent.color }} />
        </div>

        {/* Stories / Highlights row */}
        <div className="flex items-center gap-1 px-2 py-1 overflow-hidden">
          {['Live', 'Drops', 'Vault', 'Chat'].map((s, i) => (
            <div key={s} className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <div className="w-4 h-4 rounded-full p-0.5 flex items-center justify-center"
                style={{ border: `1px solid ${i === 0 ? accent.color : 'rgba(255,255,255,0.2)'}` }}>
                <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center text-[5px] text-white">
                  {s.charAt(0)}
                </div>
              </div>
              <span className="text-[5px] text-white/50">{s}</span>
            </div>
          ))}
        </div>

        {/* Feed Card - Flat studio style, no gradient */}
        <div className="flex-1 px-2 space-y-1 overflow-hidden">
          <div className="rounded-lg p-1.5 border"
            style={{ background: `rgba(${accent.rgb}, 0.10)`, borderColor: `rgba(${accent.rgb}, 0.25)` }}>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[6px] font-bold uppercase" style={{ color: accent.color }}>New Drop</span>
              <Play size={7} style={{ color: accent.color }} fill={accent.color} />
            </div>
            <div className="text-[7.5px] font-bold text-white truncate leading-tight">Masterclass Series #1</div>
            <div className="text-[6px] text-white/40">Watch in-app · 18 min</div>
          </div>

          <div className="rounded-lg p-1.5 border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="text-[6px] text-white/40 mb-0.5">Member discussion</div>
            <div className="text-[7px] text-white/80 line-clamp-2">"The phrasing in this lesson is brilliant."</div>
          </div>
        </div>

        {/* Bottom Nav Bar */}
        <div className="h-5 border-t flex items-center justify-around flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.08)', background: '#000000' }}>
          <div className="w-2.5 h-2.5 rounded-full flex items-center justify-center" style={{ background: accent.color }} />
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <div className="w-2 h-2 rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  )
}

function CommunityPreview({ accent, primary, creatorData }) {
  const avatar = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''
  const creatorName = creatorData?.name || creatorData?.handle?.replace('@', '') || 'Creator'
  const isMusic = (primary?.name + ' ' + (creatorData?.niche || '')).toLowerCase().match(/worship|music|song|praise|gospel/)

  return (
    <div className="w-full h-full p-3.5 space-y-3 font-sans text-xs select-none bg-[#090b10]">
      {/* Channel Title in Mock */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f2433]/70">
        <div className="flex items-center gap-2">
          <div 
            className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white overflow-hidden shrink-0 relative"
            style={{ background: accent.color }}
          >
            <span className="select-none">{creatorName.charAt(0).toUpperCase()}</span>
            {avatar && (
              <img 
                src={avatar} 
                alt="" 
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover" 
                onError={e => { 
                  if (!e.currentTarget.dataset.proxied && avatar.startsWith('http')) {
                    e.currentTarget.dataset.proxied = 'true';
                    e.currentTarget.src = `/api/proxy/avatar?url=${encodeURIComponent(avatar)}`;
                  } else {
                    e.currentTarget.style.display = 'none'; 
                  }
                }} 
              />
            )}
          </div>
          <span className="font-semibold text-slate-200 text-[11px] truncate max-w-[130px]">
            {creatorName} Inner Circle
          </span>
        </div>
        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium border border-emerald-500/20">
          Online
        </span>
      </div>

      {/* Channel Sidebar + Feed simulation */}
      <div className="grid grid-cols-12 gap-2 text-[10px]">
        <div className="col-span-4 space-y-1.5 text-slate-400 border-r border-[#1f2433]/50 pr-1">
          <div 
            className="font-medium px-1.5 py-1 rounded truncate text-[9.5px]"
            style={{ background: `rgba(${accent.rgb}, 0.15)`, color: accent.color }}
          >
            # general
          </div>
          <div className="px-1.5 py-0.5 hover:text-slate-300 truncate text-[9.5px]">
            {isMusic ? '# lyric-drops' : '# resources'}
          </div>
          <div className="px-1.5 py-0.5 hover:text-slate-300 truncate text-[9.5px]">
            {isMusic ? '# chords' : '# ama-q-and-a'}
          </div>
          <div className="px-1.5 py-0.5 hover:text-slate-300 truncate text-[9.5px]">
            # feedback
          </div>
        </div>

        <div className="col-span-8 space-y-2">
          <div className="p-2 rounded-lg bg-[#151822] border border-[#1f2433]/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 text-[10px] truncate max-w-[90px]">{creatorName}</span>
              <span className="text-[8px] text-slate-400">10m ago</span>
            </div>
            <p className="text-[9px] text-slate-300 leading-snug">
              Welcome everyone to the private circle! Drop questions below for tomorrow's breakdown.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[8px] font-medium" style={{ color: accent.color }}>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-2.5 h-2.5" />
                <span>16 replies</span>
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-2.5 h-2.5" />
                <span>34 likes</span>
              </span>
            </div>
          </div>

          <div className="p-1.5 rounded bg-[#151822]/40 border border-dashed border-[#1f2433] text-center text-slate-400 text-[9px] truncate">
            {isMusic ? 'Sunday Stems Pack v2.4 attached' : 'VIP Resource Toolkit v2.4 attached'}
          </div>
        </div>
      </div>
    </div>
  )
}

function StorePreview({ accent, primary, creatorData }) {
  const avatar = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''
  const creatorName = creatorData?.name || creatorData?.handle?.replace('@', '') || 'Creator'

  const products = [
    { title: 'Masterclass Pass', price: '$99.00', tag: 'COURSE' },
    { title: 'Resource Vault', price: '$49.00', tag: 'DIGITAL' },
    { title: 'Arrangement Stems', price: '$29.00', tag: 'FILES' },
    { title: 'Starter Guide', price: 'FREE', tag: 'STARTER' },
  ]

  return (
    <div className="w-full h-full flex flex-col p-2.5 gap-2 select-none" style={{ background: '#0a0a0c' }}>
      {/* Store Header */}
      <div className="flex items-center justify-between pb-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-md overflow-hidden flex items-center justify-center relative shrink-0"
            style={{ background: `rgba(${accent.rgb}, 0.2)` }}>
            <span className="text-[7px] font-bold select-none" style={{ color: accent.color }}>{creatorName.charAt(0)}</span>
            {avatar && (
              <img 
                src={avatar} 
                alt="" 
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover" 
                onError={e => { 
                  if (!e.currentTarget.dataset.proxied && avatar.startsWith('http')) {
                    e.currentTarget.dataset.proxied = 'true';
                    e.currentTarget.src = `/api/proxy/avatar?url=${encodeURIComponent(avatar)}`;
                  } else {
                    e.currentTarget.style.display = 'none'; 
                  }
                }} 
              />
            )}
          </div>
          <span className="text-[8.5px] font-bold text-white truncate max-w-[100px]">{creatorName} Store</span>
        </div>
        <div className="px-1.5 py-0.5 rounded text-[7px] font-bold"
          style={{ background: `rgba(${accent.rgb}, 0.15)`, color: accent.color }}>
          Cart (1)
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-1.5 flex-1">
        {products.map((p, i) => (
          <div key={i} className="rounded-lg p-1.5 flex flex-col justify-between border"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[6px] font-bold px-1 rounded uppercase"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}>
                  {p.tag}
                </span>
                <span className="text-[8px] font-extrabold text-white">{p.price}</span>
              </div>
              <div className="text-[8px] font-semibold text-white/90 leading-tight truncate">
                {p.title}
              </div>
            </div>
            <div className="mt-1 w-full py-0.5 rounded text-center text-[7px] font-bold uppercase"
              style={{
                background: i === 0 ? accent.color : 'rgba(255,255,255,0.08)',
                color: i === 0 ? '#000000' : 'rgba(255,255,255,0.8)'
              }}>
              {i === 0 ? 'Buy Now' : 'View'}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DashboardPreview({ accent, primary, creatorData }) {
  const avatar = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''
  const creatorName = creatorData?.name || creatorData?.handle?.replace('@', '') || 'Creator'
  const appName = primary?.name || 'Masterclass Series'

  return (
    <div className="w-full h-full flex flex-col p-2.5 gap-2 select-none" style={{ background: '#09090b' }}>
      {/* Dashboard Top Header */}
      <div className="flex items-center justify-between pb-1.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-4 h-4 rounded-md overflow-hidden flex items-center justify-center flex-shrink-0 relative"
            style={{ background: `rgba(${accent.rgb}, 0.18)`, border: `1px solid rgba(${accent.rgb}, 0.3)` }}>
            <span className="text-[7px] font-black select-none" style={{ color: accent.color }}>
              {creatorName.charAt(0).toUpperCase()}
            </span>
            {avatar && (
              <img 
                src={avatar} 
                alt="" 
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover" 
                onError={e => { 
                  if (!e.currentTarget.dataset.proxied && avatar.startsWith('http')) {
                    e.currentTarget.dataset.proxied = 'true';
                    e.currentTarget.src = `/api/proxy/avatar?url=${encodeURIComponent(avatar)}`;
                  } else {
                    e.currentTarget.style.display = 'none'; 
                  }
                }} 
              />
            )}
          </div>
          <span className="text-[9px] font-bold text-white truncate max-w-[90px]">
            {creatorName} Studio OS
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent.color }} />
          <span className="text-[7.5px] font-mono uppercase" style={{ color: accent.color }}>Live Rails</span>
        </div>
      </div>

      {/* 4 Metric Tiles */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="rounded-lg p-1.5 border"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[6.5px] text-white/40 uppercase">Monthly MRR</span>
            <span className="text-[6px] font-bold px-1 rounded" style={{ background: `rgba(${accent.rgb}, 0.15)`, color: accent.color }}>+18.4%</span>
          </div>
          <div className="text-[11px] font-bold text-white font-mono leading-tight">$14,850</div>
          <div className="text-[6.5px] text-white/30">Target: $20,000</div>
        </div>

        <div className="rounded-lg p-1.5 border"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[6.5px] text-white/40 uppercase">Members</span>
            <span className="text-[6px] text-white/50 font-bold">Active</span>
          </div>
          <div className="text-[11px] font-bold text-white font-mono leading-tight">1,280</div>
          <div className="text-[6.5px] text-white/30">92% Retention</div>
        </div>
      </div>

      {/* Modules & Revenue Engine Row */}
      <div className="rounded-lg p-1.5 border flex-1 flex flex-col justify-between"
        style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center justify-between pb-1 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <span className="text-[7.5px] font-bold text-white">Active Product Engine</span>
          <span className="text-[6.5px] px-1 py-0.2 rounded font-mono" style={{ background: `rgba(${accent.rgb}, 0.15)`, color: accent.color }}>
            {appName.slice(0, 16)}
          </span>
        </div>
        <div className="space-y-1 my-1">
          <div className="flex items-center justify-between text-[7px]">
            <span className="text-white/80 truncate max-w-[120px]">Module 1: Core Curriculum</span>
            <span className="font-mono text-white/50">85% done</span>
          </div>
          <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '85%', background: accent.color }} />
          </div>
        </div>
        <div className="flex items-center justify-between pt-1 border-t text-[6.5px] text-white/40" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
          <span>Payouts: Stripe Connected</span>
          <span style={{ color: accent.color }}>Next batch: Today</span>
        </div>
      </div>
    </div>
  )
}

const PREVIEW_COMPONENTS = { webapp: WebAppPreview, mobile: MobilePreview, community: CommunityPreview, store: StorePreview, dashboard: DashboardPreview }

// ── Main component ────────────────────────────────────────────────────────────

// ── Mapping Recommendations ──────────────────────────────────────────────────

function mapRecommendationsToBlueprints(recs, creatorData = {}) {
  const followers = parseFollowerCount(creatorData?.followers)
  const eng = parseFloat(creatorData?.engagementRate) || 3.5

  if (!recs || recs.length === 0) {
    const baseFit = eng >= 6.0 ? 97 : eng >= 4.0 ? 94 : followers >= 100_000 ? 92 : 89
    return BLUEPRINTS.map((b, idx) => ({
      ...b,
      fit: Math.max(65, baseFit - (idx * 6)),
      revenue: calculateFollowerRevenueRange(followers, b.id, eng)
    }))
  }

  const CATEGORY_MAP = {
    course:            { type: 'Web App', icon: Globe, preview: 'webapp' },
    community:         { type: 'Membership', icon: Users, preview: 'community' },
    app:               { type: 'Mobile App', icon: Smartphone, preview: 'mobile' },
    physical_product:  { type: 'Digital Products', icon: ShoppingBag, preview: 'store' },
    saas:              { type: 'Web App', icon: Globe, preview: 'webapp' },
    coaching:          { type: 'Membership', icon: Users, preview: 'community' },
    newsletter:        { type: 'Web App', icon: Globe, preview: 'webapp' },
    other:             { type: 'Digital Products', icon: ShoppingBag, preview: 'store' },
  }

  return recs.slice(0, 4).map((r, index) => {
    const config = CATEGORY_MAP[r.product_category] || CATEGORY_MAP.other
    const featuresMap = {
      course: ['Course builder', 'Community forum', 'Live events', 'Analytics'],
      community: ['Private forum', 'Tiered tiers', 'Monthly AMAs', 'Exclusive perks'],
      app: ['Push notifications', 'Members feed', 'Exclusive drops', 'In-app purchases'],
      physical_product: ['Instant delivery', 'Bundled packs', 'Upsells', 'Affiliate support'],
      saas: ['Custom domain', 'API access', 'Billing integration', 'Analytics dashboard'],
      coaching: ['Booking calendar', '1-on-1 video', 'Resource sharing', 'Messaging'],
      newsletter: ['Email publisher', 'Subscriber list', 'Paid sponsorships', 'Premium archives'],
      other: ['Custom storefront', 'Digital delivery', 'Secure checkout', 'Customer dashboard']
    }

    const dynamicRev = calculateFollowerRevenueRange(
      followers,
      r.product_category,
      eng,
      r.revenue_potential
    )

    const rawConf = r.confidence_score ?? r.confidenceScore ?? r.fit
    let fitVal
    if (typeof rawConf === 'number' && !isNaN(rawConf)) {
      fitVal = rawConf <= 1 ? Math.round(rawConf * 100) : Math.round(rawConf)
    } else if (typeof rawConf === 'string') {
      const parsed = parseFloat(rawConf.replace('%', ''))
      if (!isNaN(parsed)) {
        fitVal = parsed <= 1 ? Math.round(parsed * 100) : Math.round(parsed)
      }
    }

    if (!fitVal || isNaN(fitVal)) {
      const topFit = eng >= 6.0 ? 96 : eng >= 4.0 ? 94 : followers >= 100_000 ? 92 : 89
      fitVal = Math.max(68, topFit - (index * 7))
    } else if (fitVal === 95 && index === 0) {
      // If AI returned static 0.95 default, refine it with creator engagement
      fitVal = eng >= 6.0 ? 97 : eng >= 4.0 ? 96 : followers >= 100_000 ? 94 : 92
    }

    const finalFit = Math.min(98, Math.max(65, fitVal))

    return {
      id: r.id || `rec-${index}`,
      type: config.type,
      name: r.product_name,
      tagline: r.tagline || 'Custom built for your brand',
      description: r.description || 'A tailored monetization platform designed specifically for your audience niche.',
      revenue: dynamicRev,
      fit: finalFit,
      icon: config.icon,
      primary: index === 0,
      preview: config.preview,
      features: featuresMap[r.product_category] || featuresMap.other,
      rationale: r.rationale || '',
      targetAudience: r.target_audience || '',
      revenueModel: r.revenue_model || '',
      raw: r
    }
  })
}

function getReasonsCategoryKey(selectedBlueprint) {
  if (!selectedBlueprint) return 'web-app'
  const preview = selectedBlueprint.preview
  if (preview === 'webapp') return 'web-app'
  if (preview === 'mobile') return 'mobile-app'
  if (preview === 'community') return 'community'
  if (preview === 'store') return 'digital-products'
  return 'web-app'
}

function parseMetricViews(str) {
  if (typeof str === 'number') return str
  if (!str) return 0
  const clean = String(str).toLowerCase().replace(/views?/g, '').replace(/,/g, '').trim()
  if (clean.endsWith('m')) return parseFloat(clean) * 1_000_000
  if (clean.endsWith('k')) return parseFloat(clean) * 1_000
  if (clean.endsWith('b')) return parseFloat(clean) * 1_000_000_000
  return parseFloat(clean) || 0
}

function getDynamicEngagementRate(creator) {
  const followers = parseFollowerCount(creator?.followers)
  const posts = creator?.recentPosts || []

  if (followers > 0 && posts.length > 0) {
    let totalViews = 0
    let validCount = 0
    for (const p of posts) {
      const v = parseMetricViews(p.views || p.viewCount)
      if (v > 0) {
        totalViews += v
        validCount++
      }
    }
    if (validCount > 0 && totalViews > 0) {
      const avgViews = totalViews / validCount
      const ratio = Math.min(20, (avgViews / followers) * 100)
      return parseFloat(Math.max(1.8, Math.min(14.5, 1.8 + (ratio * 0.42))).toFixed(1))
    }
  }

  const stored = parseFloat(creator?.engagementRate)
  if (!isNaN(stored) && stored > 0 && stored !== 3.8) {
    return stored
  }

  const h = String(creator?.handle || creator?.name || 'creator')
  const seed = h.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return parseFloat((2.8 + ((seed % 29) * 0.2)).toFixed(1))
}

function calculateAudienceFit(creator, blueprint) {
  if (blueprint?.fit && typeof blueprint.fit === 'number') {
    return blueprint.fit
  }
  const followers = parseFollowerCount(creator?.followers)
  const niche = (creator?.niche || '').toLowerCase()
  const postCount = creator?.recentPosts?.length || 0

  let score = 88
  if (followers >= 500_000) score += 4
  else if (followers >= 100_000) score += 3
  else if (followers >= 10_000) score += 2

  if (postCount >= 4) score += 2

  if (niche.includes('relig') || niche.includes('spirit') || niche.includes('faith') || niche.includes('prophecy')) {
    score += 3
  } else if (niche.includes('tech') || niche.includes('finance') || niche.includes('educat') || niche.includes('business')) {
    score += 3
  }

  const h = String(creator?.handle || creator?.name || 'creator')
  const seed = h.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const offset = (seed % 5) - 2

  return Math.min(99, Math.max(84, score + offset))
}

export default function Blueprint() {
  const { next, creatorData, updateCreator, startBgJob, prev, goTo, requestWipeCreator } = useForge()
  const accent  = getAccent(creatorData)
  
  const recsJob = useBgJob('onboarding-recs')
  const rawRecs = creatorData.recommendations
  const isValidRecs = areRecsValidForCreator(rawRecs, creatorData)
  const validRecs = isValidRecs ? rawRecs : null
  const blueprints = mapRecommendationsToBlueprints(validRecs, creatorData)
  const [selected, setSelected] = useState(blueprints[0]?.id)
  const [visible,  setVisible]  = useState(false)
  const [showReasons, setShowReasons] = useState(false)
  const [isScraping, setIsScraping] = useState(false)
  const [quotaWarning, setQuotaWarning] = useState(null)
  const [previewMode, setPreviewMode] = useState('app')

  const hasNoRecs = !validRecs || validRecs.length === 0

  const isGenerating = recsJob.status === 'running' || hasNoRecs

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const promise = getScrapePromise()
    if (promise && isScrapePending()) {
      setIsScraping(true)
      promise
        .then((data) => {
          setIsScraping(false)
          if (data && (data.followers || data.name || data.recentPosts)) {
            updateCreator(data)
          }
        })
        .catch(() => setIsScraping(false))
    } else {
      setIsScraping(false)
    }
  }, [])

  useEffect(() => {
    if (hasNoRecs && recsJob.status !== 'running' && !isScraping) {
      if (rawRecs && !isValidRecs) {
        updateCreator({ recommendations: null })
      }
      startBgJob('onboarding-recs', async (sig) => {
        let finalRecs = null
        if (creatorData.id) {
          try {
            finalRecs = await recommendCreator(creatorData.id)
          } catch (err) {
            console.warn('[Forge] Backend recommend in Blueprint failed, fallback to AI:', err)
          }
        }
        const isPlaceholder = finalRecs && finalRecs.length === 1 && (finalRecs[0].product_name?.includes('[Placeholder]') || finalRecs[0].product_name?.includes('Placeholder'))
        if (!finalRecs || finalRecs.length === 0 || isPlaceholder) {
          finalRecs = await generateRecommendationsAI(creatorData, sig)
        }
        if (finalRecs && Array.isArray(finalRecs) && finalRecs.length > 0) {
          const cleanHandle = (creatorData.handle || '').replace(/^@/, '').toLowerCase().trim()
          return finalRecs.map(r => ({
            ...r,
            revenue_potential: calculateFollowerRevenueRange(
              creatorData.followers,
              r.product_category,
              creatorData.engagementRate,
              r.revenue_potential
            ),
            forHandle: cleanHandle,
            forCreator: creatorData.name || ''
          }))
        }
        throw new Error("Empty recommendations response")
      })
    }
  }, [hasNoRecs, recsJob.status, isScraping, creatorData.handle, creatorData.name, creatorData.id])

  useEffect(() => {
    if (recsJob.status === 'done' && recsJob.result) {
      if (areRecsValidForCreator(recsJob.result, creatorData)) {
        updateCreator({ recommendations: recsJob.result })
      } else {
        console.warn('[Forge] Stale recommendations detected in recsJob. Regenerating...')
        startBgJob('onboarding-recs', async (sig) => {
          const aiRecs = await generateRecommendationsAI(creatorData, sig)
          if (aiRecs && Array.isArray(aiRecs) && aiRecs.length > 0) {
            return aiRecs
          }
          throw new Error("Empty recommendations response")
        })
      }
    } else if (recsJob.status === 'error') {
      const fallbacks = getFallbackCleanRecommendations(creatorData)
      updateCreator({ recommendations: fallbacks })
      setQuotaWarning(
        recsJob.error?.includes('429') || recsJob.error?.includes('exceeded')
          ? "API rate limit exceeded. Loaded default product templates." 
          : "Failed to generate recommendations. Loaded default templates."
      )
    }
  }, [recsJob.status, recsJob.result, recsJob.error, creatorData.handle, creatorData.name])

  useEffect(() => {
    if (blueprints.length > 0 && !blueprints.some(b => b.id === selected)) {
      setSelected(blueprints[0].id)
    }
  }, [creatorData.recommendations])

  const selectedBlueprint = blueprints.find(b => b.id === selected) || blueprints[0]
  const activeBlueprint = selectedBlueprint || blueprints[0]
  const otherOptions = blueprints.filter(b => b.id !== activeBlueprint.id)

  const dynamicEngagement = getDynamicEngagementRate(creatorData)
  const audienceFit = activeBlueprint?.fit || calculateAudienceFit(creatorData, activeBlueprint)

  useEffect(() => {
    if (dynamicEngagement && (!creatorData.engagementRate || creatorData.engagementRate === 3.8)) {
      updateCreator({ engagementRate: dynamicEngagement })
    }
  }, [dynamicEngagement, creatorData.engagementRate])

  const blurb   = buildCreatorBlurb(creatorData)
  const reasonsKey = getReasonsCategoryKey(activeBlueprint)
  const reasons = buildReasons(reasonsKey, creatorData)

  const PLATFORM_COLORS = {
    youtube: '#ef4444',
    instagram: '#e1306c',
    twitter: '#60a5fa',
    tiktok: '#00c8c8',
    twitch: '#9146ff',
  }

  const PlatformIcon = PLATFORM_ICONS[creatorData.platform] || Globe
  const platformColor = PLATFORM_COLORS[creatorData.platform] || accent.color
  const activeAvatar = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''

  const ActiveIcon = activeBlueprint?.icon || Globe
  const PreviewComp = PREVIEW_COMPONENTS[activeBlueprint?.preview] || WebAppPreview

  const handleContinue = () => {
    if (isScraping || isGenerating) return
    updateCreator({ blueprint: activeBlueprint, productName: activeBlueprint.name })
    next()
  }

  const creatorName = creatorData.name || (creatorData.handle || 'Creator').replace('@', '')
  const rawPosts = (creatorData.recentPosts && creatorData.recentPosts.length > 0)
    ? creatorData.recentPosts
    : []

  // Dynamic creator-contextual benchmark fallback if no real uploads found
  const fallbackBenchmarkPosts = [
    { title: `${creatorName} Core Guide & Overview`, duration: '10:24', views: '45K' },
    { title: `${creatorName} Channel Masterclass`, duration: '14:10', views: '62K' },
    { title: `${creatorName} Audience Live Session`, duration: '18:45', views: '38K' },
    { title: `${creatorName} Strategy Deep Dive`, duration: '12:05', views: '55K' },
    { title: `${creatorName} Behind The Scenes`, duration: '08:30', views: '71K' },
  ]

  const displayPosts = rawPosts.length > 0
    ? rawPosts.slice(0, 5)
    : fallbackBenchmarkPosts

  const VIDEO_GRADIENTS = [
    { bg: 'from-amber-900/40 via-stone-800 to-black', text: 'text-amber-200' },
    { bg: 'from-blue-900/40 via-sky-950 to-black', text: 'text-sky-200' },
    { bg: 'from-cyan-950 via-teal-900/40 to-black', text: 'text-teal-200' },
    { bg: 'from-purple-950 via-indigo-900/30 to-black', text: 'text-indigo-200' },
    { bg: 'from-rose-950 via-orange-950/40 to-black', text: 'text-orange-200' },
  ]

  return (
    <div 
      className="min-h-screen flex flex-col text-slate-200 font-sans antialiased selection:bg-brand-500 selection:text-white pb-36 sm:pb-44"
      style={{
        background: `radial-gradient(circle at 50% 0%, rgba(${accent.rgb}, 0.08) 0%, transparent 60%), radial-gradient(circle at 10% 40%, rgba(99, 102, 241, 0.04) 0%, transparent 40%), #08090c`
      }}
    >
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#08090c]/85 border-b border-[#1f2433]/70 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Back Button & Brand */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => goTo('creator-link')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-[#0f1117] hover:bg-[#151822] border border-[#1f2433] rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <div className="h-4 w-[1px] bg-[#1f2433]"></div>
            <div className="flex items-center gap-2">
              {/* CoLaunch 4-square Logo */}
              <div className="grid grid-cols-2 gap-1 w-4 h-4">
                <span className="w-1.5 h-1.5 rounded-sm" style={{ background: accent.color }}></span>
                <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400"></span>
                <span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>
                <span className="w-1.5 h-1.5 rounded-sm bg-purple-400"></span>
              </div>
              <span className="font-bold tracking-tight text-white text-sm">CoLaunch</span>
            </div>
          </div>

          {/* Action Menus & Step Indicator */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={requestWipeCreator}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-red-400/80 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all cursor-pointer"
              title="Wipe creator from session storage"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Creator</span>
            </button>

            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === 4 ? '18px' : '5px',
                    height: '5px',
                    background: i === 4 ? accent.color : i < 4 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.12)',
                  }}
                />
              ))}
            </div>
            <button 
              type="button"
              aria-label="Options"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#0f1117] border border-transparent hover:border-[#1f2433] transition-colors cursor-pointer"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-12 space-y-8">
        {quotaWarning && (
          <div className="p-4 rounded-xl border flex items-center justify-between gap-4" style={{ background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.15)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <CheckCircle size={16} className="text-amber-400" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-white">Rate Limit Notice</p>
                <p className="text-[12px] text-white/50">{quotaWarning}</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ SKELETON LOADER ═══════════════ */}
        {(isScraping || isGenerating) ? (
          <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }} className="space-y-8">
            {/* Loading Title & Status */}
            <div className="space-y-2">
              <div 
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border"
                style={{ background: `rgba(${accent.rgb}, 0.1)`, borderColor: `rgba(${accent.rgb}, 0.25)`, color: accent.color }}
              >
                <Compass className="w-3.5 h-3.5" />
                {isScraping ? 'Analyzing Channel Signals…' : 'Synthesizing Architecture…'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {isScraping ? 'Extracting live audience benchmarks…' : 'Generating custom monetization blueprint…'}
              </h2>
              <p className="text-sm text-slate-400">
                {isScraping
                  ? 'CoLaunch is analyzing your recent videos, engagement ratios, and niche demand to construct the highest-yield platform.'
                  : 'Tailoring pricing tiers, curriculum modules, and interactive studio features.'}
              </p>
            </div>

            {/* Skeleton Creator Profile Header */}
            <div className="rounded-2xl bg-[#0f1117] border border-[#1f2433] p-5 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl shimmer-line shrink-0" />
                  <div className="space-y-2">
                    <div className="w-36 h-4 rounded-full shimmer-line" />
                    <div className="w-64 h-3 rounded-full shimmer-line" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-12 rounded-xl shimmer-line" />
                  <div className="w-20 h-12 rounded-xl shimmer-line" />
                  <div className="w-20 h-12 rounded-xl shimmer-line" />
                </div>
              </div>
            </div>

            {/* Skeleton Videos Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="aspect-video rounded-xl shimmer-line" />
              ))}
            </div>

            {/* Skeleton Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 rounded-2xl bg-[#0f1117] border border-[#1f2433] p-6 h-80 shimmer-line" />
              <div className="lg:col-span-4 space-y-4">
                <div className="h-32 rounded-2xl shimmer-line" />
                <div className="h-32 rounded-2xl shimmer-line" />
              </div>
            </div>
          </div>
        ) : (
          /* ═══════════════ REAL CONTENT ═══════════════ */
          <>
            {/* Creator Profile Header Card */}
            <div 
              className="relative overflow-hidden rounded-2xl bg-[#0f1117] border border-[#1f2433]/80 p-5 sm:p-6 backdrop-blur-sm transition-all"
              style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease' }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                
                {/* Creator Identity */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="relative shrink-0">
                    {/* Channel Avatar */}
                    <div 
                      className="w-14 h-14 rounded-2xl p-[2px] shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${accent.color}, #6366f1, #38bdf8)` }}
                    >
                      <div className="w-full h-full rounded-[14px] bg-[#0c101a] flex items-center justify-center overflow-hidden relative">
                        <span className="text-xl font-extrabold text-white/80 select-none">
                          {(creatorData.name || creatorData.handle || 'C').replace(/^@/, '').charAt(0).toUpperCase()}
                        </span>
                        {activeAvatar && (
                          <img
                            src={activeAvatar}
                            alt={creatorData.handle || ''}
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={e => {
                              if (!e.currentTarget.dataset.proxied && activeAvatar.startsWith('http')) {
                                e.currentTarget.dataset.proxied = 'true';
                                e.currentTarget.src = `/api/proxy/avatar?url=${encodeURIComponent(activeAvatar)}`;
                              } else {
                                e.currentTarget.style.display = 'none';
                              }
                            }}
                          />
                        )}
                      </div>
                    </div>
                    <div 
                      className="absolute -bottom-1 -right-1 text-white rounded-full p-1 border-2 border-[#0f1117] flex items-center justify-center"
                      style={{ background: platformColor }}
                      title={`${PLATFORM_LABELS[creatorData.platform] || 'Creator'} Verified`}
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {creatorData.handle ? (creatorData.handle.startsWith('@') ? creatorData.handle : `@${creatorData.handle}`) : (creatorData.name || '@creator')}
                      </h1>
                      <span 
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
                        style={{
                          background: `rgba(${creatorData.platform === 'youtube' ? '239,68,68' : accent.rgb}, 0.1)`,
                          color: creatorData.platform === 'youtube' ? '#f87171' : accent.color,
                          border: `1px solid rgba(${creatorData.platform === 'youtube' ? '239,68,68' : accent.rgb}, 0.2)`
                        }}
                      >
                        {PLATFORM_LABELS[creatorData.platform] || 'YouTube'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl leading-relaxed">
                      {blurb}
                    </p>
                  </div>
                </div>

                {/* Metric Badges */}
                <div className="flex items-center gap-2 sm:gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-[#1f2433]">
                  <div className="px-3.5 py-2 rounded-xl bg-[#151822]/80 border border-[#1f2433]/60 text-center min-w-[76px]">
                    <div className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {creatorData.followers ? fmt(creatorData.followers) : '—'}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                      {creatorData.platform === 'youtube' ? 'Subscribers' : 'Followers'}
                    </div>
                  </div>

                  <div className="px-3.5 py-2 rounded-xl bg-[#151822]/80 border border-[#1f2433]/60 text-center min-w-[76px]">
                    <div className="text-base sm:text-lg font-bold text-emerald-400 tracking-tight">
                      {dynamicEngagement}%
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                      Engagement
                    </div>
                  </div>

                  <div className="px-3.5 py-2 rounded-xl bg-[#151822]/80 border border-[#1f2433]/60 text-center min-w-[76px]">
                    <div className="text-base sm:text-lg font-bold tracking-tight" style={{ color: accent.color }}>
                      {activeBlueprint.fit}%
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                      Audience Fit
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Latest Videos Horizontal Carousel */}
            <div className="space-y-3" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 0.1s' }}>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-slate-400" />
                  Latest Videos
                </span>
                <span className="text-xs text-slate-400">Audience affinity benchmark</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {displayPosts.map((post, i) => {
                  const grad = VIDEO_GRADIENTS[i % VIDEO_GRADIENTS.length]
                  let postUrl = post.url
                  if (!postUrl) {
                    if (creatorData.platform === 'youtube' && post.videoId) {
                      postUrl = `https://www.youtube.com/watch?v=${post.videoId}`
                    } else if (creatorData.platform === 'instagram' && post.shortcode) {
                      postUrl = `https://www.instagram.com/p/${post.shortcode}/`
                    } else {
                      postUrl = '#'
                    }
                  }

                  return (
                    <div 
                      key={i} 
                      onClick={() => {
                        if (postUrl && postUrl !== '#') window.open(postUrl, '_blank', 'noopener,noreferrer')
                      }}
                      className={`group relative rounded-xl overflow-hidden bg-[#0f1117] border border-[#1f2433] hover:border-[#2d354a] transition-all cursor-pointer ${i === 4 ? 'col-span-2 sm:col-span-1' : ''}`}
                    >
                      <div className={`aspect-video w-full bg-gradient-to-br ${grad.bg} relative overflow-hidden flex flex-col justify-between p-2`}>
                        {post.thumbnail ? (
                          <img 
                            src={post.thumbnail} 
                            alt={post.title || ''} 
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover"
                            onError={e => {
                              if (!e.currentTarget.dataset.proxied) {
                                e.currentTarget.dataset.proxied = 'true';
                                e.currentTarget.src = `/api/proxy/avatar?url=${encodeURIComponent(post.thumbnail)}`;
                              } else {
                                e.currentTarget.style.display = 'none';
                              }
                            }} 
                          />
                        ) : null}

                        {/* Scrim Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-black/40 to-black/20 group-hover:via-black/20 transition-all pointer-events-none" />

                        {/* Center Play Icon Badge */}
                        <div className="relative z-10 self-center my-auto">
                          <div className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center group-hover:scale-110 group-hover:bg-black/80 transition-all shadow-md">
                            <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                          </div>
                        </div>

                        {/* Docked Bottom Title & Duration */}
                        <div className="relative z-10 w-full mt-auto flex items-end justify-between gap-1.5">
                          <p className="text-[11px] font-semibold text-white/90 line-clamp-1 leading-snug group-hover:text-white transition-colors text-left flex-1 drop-shadow-sm">
                            {post.title}
                          </p>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-white/90 border border-white/10 shrink-0">
                            {post.duration || post.views || '8:14'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recommendation Section Header */}
            <div className="pt-4 space-y-1.5" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 0.15s' }}>
              <div 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border"
                style={{
                  background: `rgba(${accent.rgb}, 0.1)`,
                  borderColor: `rgba(${accent.rgb}, 0.2)`,
                  color: accent.color
                }}
              >
                <Hammer className="w-3.5 h-3.5" />
                <span>What Forge Should Build</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Here is what makes sense for {creatorData.name || (creatorData.handle || 'your audience')}.
              </h2>
              <p className="text-sm text-slate-400">
                Based on your follower count, engagement rate, niche, and platform behavior.
              </p>
            </div>

            {/* Product Options Matrix */}
            <div 
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.2s' }}
            >
              {/* Primary Recommended Product (Featured) */}
              <div 
                className="lg:col-span-8 rounded-2xl bg-[#0f1117] border border-[#1f2433] p-6 sm:p-7 relative overflow-hidden transition-all duration-300"
              >
                {/* Ambient Top Accent Gradient */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1" 
                  style={{ background: `linear-gradient(90deg, ${accent.color}, #38bdf8, #6366f1)` }} 
                />

                {/* Header Tag & Match Indicator */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div 
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold text-xs tracking-wide border"
                    style={{
                      background: `rgba(${accent.rgb}, 0.1)`,
                      borderColor: `rgba(${accent.rgb}, 0.2)`,
                      color: accent.color
                    }}
                  >
                    <ActiveIcon className="w-3.5 h-3.5" />
                    <span>{activeBlueprint.type.toUpperCase()}</span>
                  </div>

                  <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    {activeBlueprint.fit}% Match
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Specs Column */}
                  <div className="md:col-span-7 space-y-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                        {activeBlueprint.name}
                      </h3>
                      <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1">
                        {activeBlueprint.tagline}
                      </p>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {activeBlueprint.description}
                    </p>

                    {/* Feature Pills */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {activeBlueprint.features.map(f => (
                        <span 
                          key={f} 
                          className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#151822] border border-[#1f2433] text-slate-300 flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" style={{ color: accent.color }} />
                          {f}
                        </span>
                      ))}
                    </div>

                    {/* Accordion / Why it fits */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowReasons(!showReasons)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" style={{ color: accent.color }} />
                        <span>Why this fits {creatorData.name || creatorData.handle || 'you'}</span>
                        <ChevronDown 
                          className="w-3.5 h-3.5 transition-transform duration-200" 
                          style={{ transform: showReasons ? 'rotate(180deg)' : 'none' }} 
                        />
                      </button>
                      {showReasons && (
                        <div className="mt-2.5 p-3 rounded-xl bg-[#141822] border border-[#1f2433] space-y-2">
                          {reasons.map((r, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <span className="text-[10px] mt-0.5 flex-shrink-0 font-bold" style={{ color: accent.color }}>✓</span>
                              <p className="text-[11px] leading-relaxed text-slate-300">{r}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Projected Revenue */}
                    <div className="pt-3 border-t border-[#1f2433] flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                        {(activeBlueprint.revenue || '$17K–$48K').replace(/\s*\/\s*mo/i, '').trim()}
                      </span>
                      <span className="text-sm font-medium text-slate-400">/ mo</span>
                      <span className="text-xs text-slate-400 ml-1">estimated potential</span>
                    </div>
                  </div>

                  {/* Right Column: Interactive App Preview Window */}
                  <div className="md:col-span-5">
                    <div className="rounded-xl bg-[#090b10] border border-[#1f2433]/90 overflow-hidden ring-1 ring-white/5 flex flex-col min-h-[250px]">
                      {/* Window Bar */}
                      <div className="px-3 py-2 bg-[#151822]/80 border-b border-[#1f2433] flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                        </div>
                        {/* Switcher: Member App | Creator OS */}
                        <div className="flex items-center p-0.5 rounded-md border border-[#1f2433] bg-[#090b10]">
                          <button
                            type="button"
                            onClick={() => setPreviewMode('app')}
                            className="px-2 py-0.5 rounded text-[8px] font-semibold transition-colors cursor-pointer"
                            style={{
                              background: previewMode === 'app' ? accent.color : 'transparent',
                              color: previewMode === 'app' ? (isLightColor(accent.color) ? '#000000' : '#ffffff') : 'rgba(255,255,255,0.4)',
                            }}
                          >
                            Member App
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewMode('dashboard')}
                            className="px-2 py-0.5 rounded text-[8px] font-semibold transition-colors cursor-pointer"
                            style={{
                              background: previewMode === 'dashboard' ? accent.color : 'transparent',
                              color: previewMode === 'dashboard' ? (isLightColor(accent.color) ? '#000000' : '#ffffff') : 'rgba(255,255,255,0.4)',
                            }}
                          >
                            Creator OS
                          </button>
                        </div>
                      </div>

                      {/* Inside Mock UI */}
                      <div className="flex-1 overflow-hidden">
                        {previewMode === 'dashboard' ? (
                          <DashboardPreview accent={accent} primary={activeBlueprint} creatorData={creatorData} />
                        ) : (
                          <PreviewComp accent={accent} primary={activeBlueprint} creatorData={creatorData} />
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column: Secondary / Alternate Options */}
              <div className="lg:col-span-4 space-y-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  Other options
                </div>

                {otherOptions.map(blueprint => {
                  const altReasonsKey = getReasonsCategoryKey(blueprint)
                  const altReasons = buildReasons(altReasonsKey, creatorData)
                  const AltIcon = blueprint.icon || Globe
                  const cleanAltRevenue = (blueprint.revenue || '$17K–$46K').replace(/\s*\/\s*mo/i, '').trim()

                  return (
                    <div
                      key={blueprint.id}
                      onClick={() => setSelected(blueprint.id)}
                      className="group p-5 rounded-2xl bg-[#0f1117] border border-[#1f2433] hover:border-[#2d354a] hover:bg-[#151822]/50 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="w-full flex items-start justify-between gap-2 min-w-0">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="p-2.5 rounded-xl bg-[#151822] border border-[#1f2433] group-hover:border-slate-600 transition-colors shrink-0">
                            <AltIcon className="w-5 h-5 text-slate-300" />
                          </div>
                          <div className="space-y-1 min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-white transition-colors leading-snug line-clamp-2 break-words">
                              {blueprint.name}
                            </h4>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {blueprint.tagline}
                            </p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#151822] border border-[#1f2433] text-slate-300 shrink-0 self-start whitespace-nowrap ml-2">
                          {blueprint.fit}%
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#1f2433]/70 flex items-center justify-between text-xs">
                        <span className="font-bold text-white">
                          {cleanAltRevenue} <span className="font-normal text-slate-400">/ mo</span>
                        </span>
                        <span className="text-slate-400 text-[11px]">
                          {blueprint.revenueModel || (blueprint.type === 'Membership' ? 'Subscription' : blueprint.type === 'Mobile App' ? 'Subscription' : 'One-time / Bundles')}
                        </span>
                      </div>

                      {(blueprint.rationale || altReasons[0]) && (
                        <div className="mt-3 flex items-start gap-1.5 text-[11px] text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: accent.color }} />
                          <span className="line-clamp-2">{blueprint.rationale || altReasons[0]}</span>
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* Something Else Prompt */}
                <div 
                  onClick={() => {
                    const customIdea = window.prompt("Tell Forge what you have in mind:")
                    if (customIdea && customIdea.trim()) {
                      updateCreator({ customIdea: customIdea.trim() })
                    }
                  }}
                  className="p-4 rounded-xl border border-dashed border-[#1f2433] hover:border-slate-600 transition-all text-center cursor-pointer"
                >
                  <p className="text-xs font-semibold text-slate-300">Something else?</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {creatorData?.customIdea ? `Concept noted: "${creatorData.customIdea}"` : 'Tell Forge what you have in mind'}
                  </p>
                </div>
              </div>

            </div>
          </>
        )}
      </main>

      {/* Sticky Bottom CTA Action Bar (With Dynamic Button Intact) */}
      <aside className="fixed bottom-0 left-0 right-0 z-50 bg-[#08090c] border-t border-[#1f2433] py-4 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Primary Dynamic Action Button (Do not modify dynamic binding) */}
          <div className="w-full sm:w-auto">
            <button 
              id="dynamic-cta-button" 
              onClick={handleContinue}
              disabled={isScraping || isGenerating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer group"
              style={{
                background: (isScraping || isGenerating) ? 'rgba(255,255,255,0.08)' : accent.color,
                color: (isScraping || isGenerating) ? 'rgba(255,255,255,0.4)' : (isLightColor(accent.color) ? '#000000' : '#ffffff'),
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              {(isScraping || isGenerating) ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Synthesizing Blueprint…</span>
                </span>
              ) : (
                <>
                  <span>Build {activeBlueprint?.name}</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>

          {/* Supporting Status Copy */}
          <div className="text-xs text-slate-400 flex items-center gap-2 text-center sm:text-right">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Customize live layout and review studio in the next step</span>
          </div>

        </div>
      </aside>
    </div>
  )
}
