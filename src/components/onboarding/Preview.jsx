import { useState, useEffect, useRef } from 'react'
import { useForge, getAccent } from '../../App'
import { 
  ArrowRight, ArrowLeft, RefreshCw, Send, SlidersHorizontal, Check, Layout, Users, 
  BarChart2, Settings, Radio, Play, Lock, MessageSquare, Calendar, 
  Download, ShoppingBag, Laptop, Smartphone, Volume2, Award, RotateCcw, Trash2,
  Heart, MessageCircle, Share2, MoreHorizontal, Maximize2, Minimize2, Globe, Sparkles,
  Wand2, Layers, Video, Star, CheckCircle2, ShieldCheck, Rocket, CheckCircle
} from 'lucide-react'
import WingLogo from '../ui/WingLogo'
import { parseFollowerCount } from '../../services/ai'
import { hexToRgb, getDeterministicBrandColor } from '../../utils/avatarColorExtractor'
import { fetchCreatorComments } from '../../services/scraper'

function isLightColor(hex) {
  if (!hex || typeof hex !== 'string') return false
  const clean = hex.replace('#', '').trim()
  const r = parseInt(clean.slice(0, 2), 16) || 0
  const g = parseInt(clean.slice(2, 4), 16) || 0
  const b = parseInt(clean.slice(4, 6), 16) || 0
  return ((r * 299 + g * 587 + b * 114) / 1000) > 135
}

function getDynamicCommunityPosts(creatorName, blueprint, creatorData, channelComments = []) {
  const niche = (creatorData?.niche || '').toLowerCase()
  const bpName = (blueprint?.name || '').toLowerCase()
  const handleClean = (creatorData?.handle || creatorName || 'creator').replace('@', '').toLowerCase()

  // If real channel comments exist (from Apify / YouTube channel scraper), use them!
  if (Array.isArray(channelComments) && channelComments.length > 0) {
    const creatorAnnouncement = {
      id: 'announcement_0',
      user: `@${handleClean}`,
      text: `Welcome everyone to ${blueprint?.name || 'our private space'}! Direct masterclasses, drops, and community threads are live. Drop your questions below! 🚀`,
      isCreator: true,
      time: 'Just now',
      likes: 42,
      replies: channelComments.length
    }

    const realPosts = channelComments.map((c, idx) => ({
      id: c.id || `comm_${idx}`,
      user: c.author?.startsWith('@') ? c.author : `@${c.author || 'member'}`,
      text: c.text || c.quote || '',
      time: c.published || c.time || 'Recent',
      likes: parseInt(c.likes) || (Math.floor(Math.random() * 14) + 3),
      replies: Math.floor(Math.random() * 5) + 1,
      source: c.source || 'Channel Comment',
      videoTitle: c.videoTitle || ''
    })).filter(p => p.text && p.text.trim())

    return [creatorAnnouncement, ...realPosts]
  }

  if (niche.includes('health') || niche.includes('wellness') || bpName.includes('wellness') || bpName.includes('health') || bpName.includes('nutrition') || bpName.includes('truth')) {
    return [
      { id: 1, user: `@${handleClean}`, text: `Welcome everyone to the private inner circle! Drop your protocol questions below for tomorrow's live breakdown. 🚀`, isCreator: true, time: '10m ago', likes: 32, replies: 11 },
      { id: 2, user: '@sarah_k_wellness', text: `The research breakdown on natural detox protocols in the library was eye-opening. Already noticing more energy.`, time: '2h ago', likes: 14, replies: 3 },
      { id: 3, user: '@david_holistic', text: `Can we get a deep dive on seasonal supplementation next month? Really loving the verified resources here.`, time: '5h ago', likes: 19, replies: 5 }
    ]
  }

  if (niche.includes('tech') || niche.includes('code') || niche.includes('developer') || niche.includes('software')) {
    return [
      { id: 1, user: `@${handleClean}`, text: `Welcome engineers! Repository templates and architecture notes are posted in the Vault tab. 🚀`, isCreator: true, time: '15m ago', likes: 45, replies: 16 },
      { id: 2, user: '@dev_jordan', text: `Implemented the clean pipeline pattern from chapter 2 in our prod stack today. Shaved 35% off latency.`, time: '3h ago', likes: 21, replies: 4 },
      { id: 3, user: '@frontend_dan', text: `The interactive component breakdown was gold. Any recommendations for state management on scale?`, time: '6h ago', likes: 18, replies: 7 }
    ]
  }

  if (niche.includes('finance') || niche.includes('business') || niche.includes('invest') || niche.includes('money')) {
    return [
      { id: 1, user: `@${handleClean}`, text: `Welcome founders and investors! Market brief and portfolio teardowns are uploaded. 🚀`, isCreator: true, time: '20m ago', likes: 52, replies: 23 },
      { id: 2, user: '@marcus_invest', text: `The cashflow model from the core vault saved our team weeks of financial modeling.`, time: '1h ago', likes: 27, replies: 6 },
      { id: 3, user: '@growth_elena', text: `Really excited for the AMA tomorrow. Will submit my unit economics spreadsheet in advance.`, time: '4h ago', likes: 15, replies: 2 }
    ]
  }

  return [
    { id: 1, user: `@${handleClean}`, text: `Welcome everyone to ${blueprint?.name || 'our platform'}! Live AMA streams and member perks are ready. 🚀`, isCreator: true, time: '10m ago', likes: 24, replies: 8 },
    { id: 2, user: '@community_member', text: `Super impressed with the structure here. Everything is accessible and organized.`, time: '2h ago', likes: 12, replies: 2 },
    { id: 3, user: '@creative_mind', text: `Can't wait to connect with fellow members here. Exactly what our community needed.`, time: '5h ago', likes: 19, replies: 4 }
  ]
}

const QUICK_PROMPTS = [
  'Make it more premium',
  'Focus on community',
  'More minimalist',
  'For women 25-34',
  'Mobile-first',
  'Add a podcast section',
]

const FEATURES = [
  { icon: MessageSquare, label: 'Private forum' },
  { icon: Layers, label: 'Tiered tiers' },
  { icon: Video, label: 'Monthly AMAs' },
  { icon: Star, label: 'Exclusive perks' },
  { icon: Layout, label: 'Course builder' },
  { icon: Users, label: 'Community forum' },
  { icon: Radio, label: 'Live events' },
  { icon: BarChart2, label: 'Creator analytics' },
  { icon: Settings, label: 'Member management' },
  { icon: Volume2, label: 'Podcast section' },
]

function getDynamicProducts(blueprint, creatorData) {
  const name = creatorData.name || creatorData.handle?.replace('@', '') || 'Creator'
  const bpName = blueprint?.name || 'Platform'
  const bpNameL = bpName.toLowerCase()
  const category = (blueprint?.raw?.product_category || '').toLowerCase()
  const followers = parseFollowerCount(creatorData.followers)

  if (bpNameL.includes('philanthrop') || bpNameL.includes('impact') || bpNameL.includes('charity')) {
    return [
      { title: 'Community Impact Pass', price: '$9.99 / mo', type: 'Monthly Membership' },
      { title: 'Project Founding Partner', price: '$49.00', type: 'Impact Tier' },
      { title: 'Executive Impact Brief & Strategy', price: '$299.00', type: 'Annual Report' },
      { title: 'Transparency Ledger & Asset Pack', price: 'Free', type: 'Public Access' }
    ]
  }

  if (bpNameL.includes('challenge') || bpNameL.includes('drop') || bpNameL.includes('box') || category === 'app') {
    return [
      { title: `${name}'s Seasonal Challenge Pass`, price: '$4.99 / mo', type: 'Digital Pass' },
      { title: 'VIP Exclusive Drop Bundle', price: '$29.99', type: 'Limited Edition' },
      { title: 'Golden Ticket Entry & Live Session', price: '$99.00', type: 'Exclusive Access' },
      { title: 'Fan Starter Toolkit & Wallpapers', price: 'Free', type: 'Starter Pack' }
    ]
  }

  if (category === 'course' || category === 'membership' || bpNameL.includes('academy') || bpNameL.includes('circle')) {
    return [
      { title: 'All-Access Inner Circle Pass', price: '$19.00 / mo', type: 'Monthly Membership' },
      { title: 'Masterclass Direct Vault', price: '$89.00', type: 'Complete Course' },
      { title: 'Annual VIP Pass & Private Calls', price: '$180.00 / yr', type: 'Annual Tier' },
      { title: 'Essential Starter Blueprint', price: 'Free', type: 'Starter Guide' }
    ]
  }

  return [
    { title: 'Core Member Access Pass', price: '$12.00 / mo', type: 'Community Tier' },
    { title: 'The Complete Resource Archive', price: '$69.00', type: 'Digital Bundle' },
    { title: 'Exclusive Strategy Session Pass', price: '$149.00', type: 'Live Workshop' },
    { title: 'Community Welcome Pack', price: 'Free', type: 'Starter Pack' }
  ]
}

function getVariationsForCreator(creatorData, extraTabs) {
  const name = creatorData.name || creatorData.handle?.replace('@', '') || 'Creator'
  const baseTabs = extraTabs.length ? extraTabs : []

  return [
    {
      id: 'community-circle',
      name: `${name}'s Inner Circle`,
      type: 'Membership Community',
      preview: 'community',
      description: `Private high-resonance community platform with member forums, scheduled AMA streams, and perk drops.`,
      features: ['Private forum', 'Tiered tiers', 'Monthly AMAs', 'Exclusive perks', ...baseTabs],
      tagline: 'Direct access to masterclasses, visual assets & monthly AMAs'
    },
    {
      id: 'masterclass-academy',
      name: `${name}'s Masterclass Academy`,
      type: 'Course Platform',
      preview: 'webapp',
      description: `Structured video curriculum with interactive chapter checkpoints, exercises, and certification.`,
      features: ['Course builder', 'Community forum', 'Live events', 'Creator analytics', ...baseTabs],
      tagline: 'Accelerated curriculum and step-by-step masterclasses'
    },
    {
      id: 'backstage-app',
      name: `${name}'s Mobile Backstage`,
      type: 'Mobile App',
      preview: 'mobile',
      description: `Dedicated handheld experience with instant push notifications, backstage drops, and feeds.`,
      features: ['Push notifications', 'Members feed', 'Exclusive drops', 'In-app purchases', ...baseTabs],
      tagline: 'Backstage drops and direct daily mobile engagement'
    },
    {
      id: 'vault-store',
      name: `${name}'s Digital Vault & Library`,
      type: 'Digital Products',
      preview: 'store',
      description: `Comprehensive digital storefront with verified frameworks, templates, and downloadable assets.`,
      features: ['Instant delivery', 'Resource library', 'Templates & toolkits', 'Direct consultation', ...baseTabs],
      tagline: 'Instant delivery digital assets and resource vault'
    }
  ]
}

function CreatorDashboardView({ styles, dynamicAccent, dynamicAccentBg, dynamicAccentBorder, creatorData, blueprint, channelComments = [] }) {
  const creatorName = creatorData.name || creatorData.handle?.replace('@','') || 'Creator'
  const resolvedAvatar = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''
  const mrrVal = Math.round(parseFollowerCount(creatorData?.followers || 0) * 0.015 * 19)
  const cleanMrr = `$${mrrVal > 0 ? mrrVal.toLocaleString() : '8,420'}`

  const audienceStream = (Array.isArray(channelComments) && channelComments.length >= 2)
    ? channelComments.slice(0, 5).map((c, i) => {
        const cleanUser = (c.author || '@member').replace(/^@/, '')
        const actions = [
          { action: 'Enrolled in Core Masterclass', amount: '+$149.00' },
          { action: 'Joined Monthly VIP Circle', amount: '+$35.00/mo' },
          { action: 'Downloaded Strategy Pack', amount: 'Free' },
          { action: 'Purchased Toolkit Bundle', amount: '+$79.00' },
          { action: 'Enrolled in Core Masterclass', amount: '+$149.00' },
        ]
        return {
          user: cleanUser,
          action: actions[i % actions.length].action,
          amount: actions[i % actions.length].amount,
          time: c.published || c.time || `${(i + 1) * 7}m ago`
        }
      })
    : [
        { user: 'Sarah K.', action: 'Enrolled in Core Masterclass', amount: '+$149.00', time: '4m ago' },
        { user: 'David M.', action: 'Joined Monthly VIP Circle', amount: '+$35.00/mo', time: '18m ago' },
        { user: 'Elena R.', action: 'Downloaded Strategy Pack', amount: 'Free', time: '34m ago' },
        { user: 'PC Master', action: 'Purchased Toolkit Bundle', amount: '+$79.00', time: '1h ago' },
      ]

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto" style={{ background: '#0f1117' }}>
      {/* OS Top Subheader */}
      <div 
        className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
        style={{ borderColor: '#222634', background: '#12141c' }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center font-bold text-xs flex-shrink-0 relative shadow-md"
            style={{ background: dynamicAccentBg, border: `1px solid ${dynamicAccentBorder}` }}
          >
            <span style={{ color: dynamicAccent }}>
              {creatorName.charAt(0).toUpperCase()}
            </span>
            {resolvedAvatar ? (
              <img 
                src={resolvedAvatar} 
                alt="" 
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover" 
                onError={e => {
                  if (!e.currentTarget.dataset.proxied && resolvedAvatar.startsWith('http')) {
                    e.currentTarget.dataset.proxied = 'true';
                    e.currentTarget.src = `/api/proxy/avatar?url=${encodeURIComponent(resolvedAvatar)}`;
                  } else {
                    e.currentTarget.style.display = 'none';
                  }
                }} 
              />
            ) : null}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white">
                {creatorName} Studio OS
              </span>
              <span 
                className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider"
                style={{ background: dynamicAccentBg, color: dynamicAccent, border: `1px solid ${dynamicAccentBorder}` }}
              >
                Verified
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Command Center · {blueprint.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#161922] border border-[#222634]"
          >
            <span className="w-2 h-2 rounded-full" style={{ background: dynamicAccent }} />
            <span className="text-slate-300">Stripe Live Rails</span>
          </div>
          <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Live
          </span>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 flex-shrink-0">
        {[
          { label: 'Projected MRR', val: `${cleanMrr}/mo`, badge: '+18.4% MoM', desc: 'Active subscriptions' },
          { label: 'Active Members', val: '1,280', badge: '94.2% retention', desc: '+48 this week' },
          { label: 'Curriculum Finish', val: '89.6%', badge: 'High Engagement', desc: 'Avg module progress' },
          { label: 'Available Payout', val: '$12,420', badge: 'Instant Transfer', desc: 'Next payout today' },
        ].map((m, i) => (
          <div 
            key={i} 
            className="p-4 rounded-xl border flex flex-col justify-between bg-[#12141c] border-[#222634] hover:border-slate-700 transition shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{m.label}</span>
              <span 
                className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                style={{ background: dynamicAccentBg, color: dynamicAccent }}
              >
                {m.badge}
              </span>
            </div>
            <div className="text-xl font-mono font-bold tracking-tight mb-1 text-white">
              {m.val}
            </div>
            <p className="text-xs text-slate-500">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout: Curriculum Pipeline & Live Member Activity */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 px-5 pb-5 flex-1">
        {/* Modules / Pipeline (3 cols) */}
        <div 
          className="md:col-span-3 p-4 rounded-xl border flex flex-col bg-[#12141c] border-[#222634]"
        >
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#222634]">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Curriculum & Asset Modules
            </span>
            <span className="text-xs font-mono font-semibold" style={{ color: dynamicAccent }}>
              3 Active Pipelines
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { title: 'Core Masterclass & Strategy', lessons: '12 video modules · Upload ready', progress: '88%', status: 'Active' },
              { title: 'Resource Vault & Templates', lessons: '14 downloadable toolkits & files', progress: '100%', status: 'Published' },
              { title: 'VIP Community & Live AMAs', lessons: 'Scheduled streams & weekly chats', progress: '65%', status: 'In Review' },
            ].map((mod, idx) => (
              <div 
                key={idx} 
                className="p-3 rounded-xl border bg-[#161922] border-[#222634]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white truncate max-w-[200px]">
                    {mod.title}
                  </span>
                  <span 
                    className="text-[9px] font-bold px-2 py-0.5 rounded uppercase"
                    style={{ background: dynamicAccentBg, color: dynamicAccent }}
                  >
                    {mod.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-2">{mod.lessons}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>Student Completion</span>
                    <span className="text-white font-semibold">{mod.progress}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-black/40 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: mod.progress, background: dynamicAccent }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed (2 cols) */}
        <div 
          className="md:col-span-2 p-4 rounded-xl border flex flex-col bg-[#12141c] border-[#222634]"
        >
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#222634]">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Live Sales Stream
            </span>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              Real-time
            </span>
          </div>

          <div className="space-y-2">
            {audienceStream.map((feed, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#161922] border border-[#222634]/60 hover:border-slate-700 transition"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">@{feed.user}</span>
                    <span className="text-[10px] text-slate-500">{feed.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{feed.action}</p>
                </div>
                <span className="text-xs font-mono font-bold flex-shrink-0" style={{ color: dynamicAccent }}>
                  {feed.amount}
                </span>
              </div>
            ))}
          </div>

          {/* Real Channel Comments & Audience Insights */}
          {channelComments.length > 0 && (
            <div className="mt-3.5 pt-3 border-t border-[#222634]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: dynamicAccent }} />
                  Channel Comments (Apify)
                </span>
                <span className="text-[9px] font-mono text-emerald-400 font-medium">
                  {channelComments.length} Synced
                </span>
              </div>
              <div className="space-y-2">
                {channelComments.slice(0, 3).map((c, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#161922] border border-[#222634]/60 text-[10px] hover:border-slate-700 transition">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-white truncate">{c.author}</span>
                        {c.videoTitle && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 truncate max-w-[120px]" title={c.videoTitle}>
                            {c.videoTitle}
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[9px] text-slate-500 flex-shrink-0">{c.published || c.time}</span>
                    </div>
                    <p className="text-slate-300 italic line-clamp-2">"{c.text}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function AppMockup({ theme, activeTab, setActiveTab, blueprint, creatorData, extraTabs, isMobile, viewMode = 'desktop', channelComments = [] }) {
  const isDark = theme === 'dark' || theme === 'premium' || theme === 'minimalist' || !theme
  const resolvedAvatar = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''
  const accent = getAccent(creatorData)
  const dynamicAccent = accent.color
  const dynamicAccentBg = `rgba(${accent.rgb}, 0.12)`
  const dynamicAccentBorder = `rgba(${accent.rgb}, 0.28)`
  const isLight = isLightColor(dynamicAccent)

  const effectiveComments = (Array.isArray(channelComments) && channelComments.length > 0)
    ? channelComments
    : (Array.isArray(creatorData?.comments) && creatorData.comments.length > 0)
      ? creatorData.comments
      : (Array.isArray(creatorData?.channelComments) && creatorData.channelComments.length > 0)
        ? creatorData.channelComments
        : []

  const [internalComments, setInternalComments] = useState(effectiveComments)

  useEffect(() => {
    if (effectiveComments.length > 0) {
      setInternalComments(effectiveComments)
      return
    }
    const h = creatorData?.handle || creatorData?.url || creatorData?.name
    if (!h) return
    const clean = String(h).replace(/^@/, '').trim()
    try {
      const cached = sessionStorage.getItem(`forge_creator_comments_${clean}`) || localStorage.getItem(`forge_creator_comments_${clean}`)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setInternalComments(parsed)
          return
        }
      }
    } catch {}

    fetchCreatorComments(h, creatorData?.platform || 'youtube', 12)
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          setInternalComments(res)
        }
      })
      .catch(() => {})
  }, [creatorData?.handle, creatorData?.url, effectiveComments.length])

  const [postLikes, setPostLikes] = useState({})

  const toggleLike = (id, baseLikes) => {
    setPostLikes(prev => {
      const isLiked = prev[id]?.liked
      const count = prev[id]?.count ?? baseLikes
      return {
        ...prev,
        [id]: {
          liked: !isLiked,
          count: isLiked ? count - 1 : count + 1
        }
      }
    })
  }

  const themeStyles = {
    dark: {
      bg: '#0f1117',
      cardBg: '#12141c',
      cardHover: '#161922',
      borderColor: '#222634',
      text: '#f3f4f6',
      textMuted: '#94a3b8',
      accent: dynamicAccent,
      accentBg: dynamicAccentBg,
      accentBorder: dynamicAccentBorder
    },
    light: {
      bg: '#f9fafb',
      cardBg: '#ffffff',
      cardHover: '#f3f4f6',
      borderColor: 'rgba(0,0,0,0.08)',
      text: '#111827',
      textMuted: '#6b7280',
      accent: dynamicAccent,
      accentBg: dynamicAccentBg,
      accentBorder: dynamicAccentBorder
    },
    premium: {
      bg: '#0a0b10',
      cardBg: '#12141c',
      cardHover: '#161922',
      borderColor: dynamicAccentBorder,
      text: '#f8fafc',
      textMuted: '#94a3b8',
      accent: dynamicAccent,
      accentBg: dynamicAccentBg,
      accentBorder: dynamicAccentBorder,
    },
    minimalist: {
      bg: '#ffffff',
      cardBg: '#ffffff',
      cardHover: '#f9fafb',
      borderColor: '#000000',
      text: '#000000',
      textMuted: '#737373',
      accent: '#000000',
      accentBg: 'rgba(0, 0, 0, 0.05)',
      accentBorder: '#000000'
    },
    feminine: {
      bg: '#faf5f6',
      cardBg: 'rgba(255, 241, 242, 0.8)',
      cardHover: '#fff',
      borderColor: 'rgba(251, 113, 133, 0.18)',
      text: '#4c0519',
      textMuted: '#fda4af',
      accent: '#db2777',
      accentBg: 'rgba(219, 39, 119, 0.08)',
      accentBorder: 'rgba(219, 39, 119, 0.15)'
    }
  }

  const styles = themeStyles[theme] || themeStyles.dark

  if (viewMode === 'dashboard') {
    return (
      <CreatorDashboardView
        styles={styles}
        dynamicAccent={dynamicAccent}
        dynamicAccentBg={dynamicAccentBg}
        dynamicAccentBorder={dynamicAccentBorder}
        creatorData={creatorData}
        blueprint={blueprint}
        channelComments={internalComments}
      />
    )
  }

  const previewType = blueprint.preview || 'webapp'
  const creatorName = creatorData.name || creatorData.handle?.replace('@','') || 'Creator'

  let defaultTabs = []
  if (previewType === 'webapp') defaultTabs = ['Courses', 'Community', 'Live AMAs']
  else if (previewType === 'mobile') defaultTabs = ['Home Feed', 'Group Chat', 'Drops']
  else if (previewType === 'community') defaultTabs = ['Announcements', 'Chat Room', 'Events']
  else if (previewType === 'store') defaultTabs = ['All Products', 'Guides', 'Consultation']

  const allTabs = [...defaultTabs, ...(extraTabs || [])]

  const renderTabContent = () => {
    const tabLower = activeTab.toLowerCase()
    
    if (tabLower.includes('course')) {
      const coursesList = [
        { title: `${creatorName} Core Method`, lessons: '12 lessons', badge: 'Popular', progress: '85%' },
        { title: 'Advanced Tactics & Secrets', lessons: '8 lessons', badge: 'Pro Tier', lock: true },
        { title: 'Quick Start Templates', lessons: '5 lessons', badge: 'Ready', progress: '100%' }
      ]

      return (
        <div className={isMobile ? "p-3 space-y-3" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-6"}>
          {coursesList.map((c, i) => (
            <div 
              key={i} 
              className={`rounded-2xl border transition-all duration-200 bg-[#12141c] border-[#222634] hover:border-slate-700 shadow-sm flex flex-col justify-between ${
                isMobile ? "p-3" : "p-4"
              }`}
            >
              <div>
                <div className={`${isMobile ? "h-20 mb-2.5" : "h-24 mb-3"} rounded-xl flex items-center justify-center relative overflow-hidden bg-[#161922] border border-[#222634]/60`}>
                  {c.lock ? (
                    <Lock size={isMobile ? 18 : 20} style={{ color: styles.accent }} />
                  ) : (
                    <Play size={isMobile ? 18 : 20} style={{ color: styles.accent }} />
                  )}
                  {c.badge && (
                    <span 
                      className="absolute top-2 right-2 text-[8.5px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                      style={{ background: styles.accentBg, color: styles.accent, border: `1px solid ${styles.accentBorder}` }}
                    >
                      {c.badge}
                    </span>
                  )}
                </div>
                <h4 className={`${isMobile ? "text-xs" : "text-sm"} font-bold leading-snug mb-1 text-white`}>{c.title}</h4>
                <p className="text-[11px] mb-2 text-slate-400">{c.lessons}</p>
              </div>
              {c.progress && (
                <div className="space-y-1 pt-2 border-t border-[#222634]/60">
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span className="truncate pr-1">Curriculum Progress</span>
                    <span className="text-white font-semibold flex-shrink-0">{c.progress}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-black/40 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-300" style={{ width: c.progress, background: styles.accent }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    if (tabLower.includes('community') || tabLower.includes('chat') || tabLower.includes('feed') || tabLower.includes('room') || tabLower.includes('announcement')) {
      const posts = getDynamicCommunityPosts(creatorName, blueprint, creatorData, internalComments)
      return (
        <div className={isMobile ? "p-3.5 pt-4 space-y-3.5" : "p-6 space-y-4"}>
          {posts.map((p) => {
            const isLiked = postLikes[p.id]?.liked
            const currentLikes = postLikes[p.id]?.count ?? p.likes
            return (
              <div 
                key={p.id} 
                className={`bg-[#12141c] border border-[#222634] hover:border-slate-700 transition rounded-2xl shadow-sm ${
                  isMobile ? "p-4 pt-4" : "p-5 pt-5"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <div 
                      className={`${isMobile ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm"} rounded-full font-bold flex items-center justify-center border shadow-sm flex-shrink-0 mt-0.5`}
                      style={{ 
                        background: p.isCreator ? styles.accentBg : 'rgba(255,255,255,0.06)', 
                        color: p.isCreator ? styles.accent : '#fff',
                        borderColor: p.isCreator ? styles.accentBorder : '#222634'
                      }}
                    >
                      {p.user.charAt(1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-xs sm:text-sm text-white truncate max-w-[140px] sm:max-w-none">{p.user}</span>
                        {p.isCreator && (
                          <span 
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider"
                            style={{ background: styles.accentBg, color: styles.accent, borderColor: styles.accentBorder }}
                          >
                            HOST
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500">·</span>
                        <span className="text-[11px] text-slate-500 font-medium">{p.time}</span>
                      </div>
                      {!p.isCreator && p.videoTitle && (
                        <div className="mt-1">
                          <span className="inline-flex items-center text-[9px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-700/50 truncate max-w-[170px] sm:max-w-[240px]" title={p.videoTitle}>
                            via {p.videoTitle}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button className="text-slate-500 hover:text-slate-300 transition-colors p-1 -mr-1 -mt-0.5 flex-shrink-0 cursor-pointer">
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className={`text-slate-300 leading-relaxed ${isMobile ? "pl-0 text-xs mt-2.5" : "pl-11 text-sm mt-1"}`}>
                  {p.text}
                </p>
                <div className={`mt-3 flex items-center text-xs text-slate-400 ${
                  isMobile ? "justify-between pl-0" : "space-x-6 pl-12"
                }`}>
                  <button 
                    onClick={() => toggleLike(p.id, p.likes)}
                    className="flex items-center space-x-1.5 transition-colors cursor-pointer"
                    style={{ color: isLiked ? styles.accent : undefined }}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{currentLikes}</span>
                  </button>
                  <button className="flex items-center space-x-1.5 hover:text-slate-200 transition-colors cursor-pointer">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{p.replies} replies</span>
                  </button>
                  <button className="flex items-center space-x-1.5 hover:text-slate-200 transition-colors cursor-pointer">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    if (tabLower.includes('live') || tabLower.includes('event')) {
      return (
        <div className={isMobile ? "p-3 space-y-3" : "p-6 space-y-4"}>
          {[
            { title: 'Launch Day Live Q&A Stream', desc: `Join ${creatorName} for the live reveal and get early answers.`, status: 'Live in 2 days', action: 'RSVP Now' },
            { title: 'Weekly Inner Circle Teardowns', desc: 'Host review of community setups & live Q&A.', status: 'Mon at 8:00 PM', action: 'Set Reminder' }
          ].map((e, i) => (
            <div 
              key={i} 
              className={`rounded-2xl border flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-[#12141c] border-[#222634] hover:border-slate-700 transition shadow-sm ${
                isMobile ? "p-3.5" : "p-5"
              }`}
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-red-400">Live Stream Event</span>
                </div>
                <h4 className={`${isMobile ? "text-xs" : "text-sm"} font-bold text-white truncate`}>{e.title}</h4>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{e.desc}</p>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-[#222634]/60">
                <span className="text-[11px] font-mono font-medium text-slate-300">{e.status}</span>
                <button 
                  className="text-[11px] font-bold px-3 py-1.5 rounded-xl transition shadow-sm border"
                  style={{ background: styles.accentBg, color: styles.accent, borderColor: styles.accentBorder }}
                >
                  {e.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (tabLower.includes('podcast')) {
      return (
        <div className={isMobile ? "p-3 space-y-2.5" : "p-6 space-y-3.5"}>
          {[
            { title: `Ep 14: Monetizing Audience & High-Resonance Communities in 2026`, duration: '42 min', plays: '12K listens' },
            { title: `Ep 13: Secrets of Sustainable Independent Creator Businesses`, duration: '35 min', plays: '8.4K listens' }
          ].map((p, i) => (
            <div 
              key={i} 
              className={`rounded-2xl border flex gap-3 items-center bg-[#12141c] border-[#222634] hover:border-slate-700 transition shadow-sm ${
                isMobile ? "p-3" : "p-4"
              }`}
            >
              <div 
                className={`${isMobile ? "w-8 h-8 rounded-lg" : "w-10 h-10 rounded-xl"} flex items-center justify-center flex-shrink-0 shadow-sm border`}
                style={{ background: styles.accentBg, borderColor: styles.accentBorder }}
              >
                <Volume2 className={isMobile ? "w-4 h-4" : "w-5 h-5"} style={{ color: styles.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`${isMobile ? "text-xs" : "text-sm"} font-bold truncate text-white`}>{p.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{p.duration} · {p.plays}</p>
              </div>
              <button 
                className={`${isMobile ? "w-7 h-7" : "w-9 h-9"} rounded-full flex items-center justify-center border flex-shrink-0 transition-transform active:scale-95 shadow-sm`}
                style={{ background: styles.accent, color: isLight ? '#000000' : '#ffffff', borderColor: styles.accentBorder }}
              >
                <Play className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} fill-current ml-0.5`} />
              </button>
            </div>
          ))}
        </div>
      )
    }

    if (tabLower.includes('product') || tabLower.includes('guide') || tabLower.includes('shop') || tabLower.includes('consult') || tabLower.includes('drop')) {
      const dynamicProducts = getDynamicProducts(blueprint, creatorData)
      return (
        <div className={isMobile ? "p-3 space-y-2.5" : "grid grid-cols-1 sm:grid-cols-2 gap-4 p-6"}>
          {dynamicProducts.map((p, i) => (
            <div 
              key={i} 
              className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between bg-[#12141c] border-[#222634] hover:border-slate-700 shadow-sm ${
                isMobile ? "p-3" : "p-4"
              }`}
            >
              <div>
                <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">{p.type}</span>
                <h4 className={`${isMobile ? "text-xs" : "text-sm"} font-bold leading-tight mt-0.5 mb-2 truncate text-white`}>{p.title}</h4>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-[#222634]">
                <span className="text-xs font-mono font-bold text-white">{p.price}</span>
                <button 
                  className="px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-[11px] font-semibold border transition"
                  style={{ background: styles.accentBg, color: styles.accent, borderColor: styles.accentBorder }}
                >
                  <Download className="w-3 h-3" />
                  <span>Access</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="p-8 text-center text-slate-400">
        <p className="text-xs">Selecting new layout modules...</p>
      </div>
    )
  }

  // Mobile Shell View Layout
  if (isMobile) {
    return (
      <div className="w-full h-full flex flex-col bg-[#0f1117] text-slate-100 rounded-[32px] overflow-hidden">
        {/* Mobile App Header */}
        <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#222634] flex-shrink-0 bg-[#12141c]">
          <span className="text-xs font-bold uppercase tracking-wider truncate mr-2 text-white">
            {blueprint.name.split("'")[0]}
          </span>
          <div 
            className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center font-bold text-[10px] flex-shrink-0 relative shadow-sm border border-[#222634]"
            style={{ background: styles.accentBg, color: styles.accent }}
          >
            <span>{creatorName.charAt(0).toUpperCase()}</span>
            {resolvedAvatar ? (
              <img 
                src={resolvedAvatar} 
                alt="" 
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover" 
                onError={e => {
                  if (!e.currentTarget.dataset.proxied && resolvedAvatar.startsWith('http')) {
                    e.currentTarget.dataset.proxied = 'true';
                    e.currentTarget.src = `/api/proxy/avatar?url=${encodeURIComponent(resolvedAvatar)}`;
                  } else {
                    e.currentTarget.style.display = 'none';
                  }
                }} 
              />
            ) : null}
          </div>
        </div>

        {/* Mobile Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Mobile Hero Banner */}
          <div className="px-3.5 py-3 flex-shrink-0 text-center border-b border-[#222634] bg-gradient-to-b from-[#161922] to-[#12141c]">
            <h3 className="text-sm font-bold leading-tight tracking-tight mb-0.5 text-white">
              {creatorName}'s Space
            </h3>
            <p className="text-[11px] text-slate-400">
              Exclusive masterclasses, drops & direct chats.
            </p>
          </div>
          {renderTabContent()}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="h-12 border-t border-[#222634] flex items-center justify-around flex-shrink-0 bg-[#12141c] rounded-b-[32px] px-1">
          {allTabs.slice(0, 4).map(t => {
            const isTabActive = activeTab === t
            return (
              <button 
                key={t} 
                onClick={() => setActiveTab(t)}
                className="flex flex-col items-center justify-center py-1 flex-1 text-[11px] font-semibold transition-colors cursor-pointer"
                style={{ color: isTabActive ? styles.accent : '#94a3b8' }}
              >
                <span>{t.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Desktop Member Web View
  return (
    <div className="w-full h-full flex flex-col bg-[#0f1117] text-slate-100 overflow-y-auto">
      {/* App Inner Header */}
      <div className="p-6 border-b border-[#222634] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 flex-shrink-0 bg-[#0f1117]">
        <div className="flex items-center space-x-3.5">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-md overflow-hidden relative flex-shrink-0 border"
            style={{ 
              background: styles.accentBg, 
              color: styles.accent, 
              borderColor: styles.accentBorder,
              boxShadow: `0 4px 14px rgba(${accent.rgb}, 0.2)`
            }}
          >
            <span>{(creatorName || blueprint.name || 'C').charAt(0).toUpperCase()}</span>
            {resolvedAvatar ? (
              <img 
                src={resolvedAvatar} 
                alt="" 
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover" 
                onError={e => {
                  if (!e.currentTarget.dataset.proxied && resolvedAvatar.startsWith('http')) {
                    e.currentTarget.dataset.proxied = 'true';
                    e.currentTarget.src = `/api/proxy/avatar?url=${encodeURIComponent(resolvedAvatar)}`;
                  } else {
                    e.currentTarget.style.display = 'none';
                  }
                }} 
              />
            ) : null}
          </div>
          <div>
            <h2 className="font-bold text-lg text-white leading-tight">{blueprint.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Exclusive community & masterclasses</p>
          </div>
        </div>

        <button 
          className="font-bold px-5 py-2.5 rounded-xl text-xs transition shadow-lg flex items-center space-x-2 cursor-pointer active:scale-95"
          style={{ 
            background: styles.accent, 
            color: isLight ? '#000000' : '#ffffff',
            boxShadow: `0 4px 14px rgba(${accent.rgb}, 0.25)`
          }}
        >
          <span>SIGN IN</span>
          <ArrowRight className="w-3 h-3 stroke-[2.5]" />
        </button>
      </div>

      {/* Inner Nav Tabs */}
      <div className="flex items-center space-x-8 px-6 border-b border-[#222634] text-sm overflow-x-auto flex-shrink-0 bg-[#0f1117]">
        {allTabs.map(t => {
          const isTabActive = activeTab === t
          return (
            <button 
              key={t} 
              onClick={() => setActiveTab(t)}
              className="pb-3 pt-3 border-b-2 font-semibold whitespace-nowrap transition cursor-pointer"
              style={{ 
                color: isTabActive ? styles.accent : '#94a3b8',
                borderColor: isTabActive ? styles.accent : 'transparent'
              }}
            >
              {t}
            </button>
          )
        })}
      </div>

      {/* Welcome Card */}
      <div className="px-6 pt-6 flex-shrink-0">
        <div className="bg-gradient-to-r from-[#161922] to-[#12141c] border border-[#222634] p-6 rounded-2xl relative overflow-hidden shadow-sm">
          <div 
            className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-40" 
            style={{ background: dynamicAccentBg }} 
          />
          <h3 className="text-xl font-bold text-white mb-2 relative z-10">
            Welcome to {blueprint.name}
          </h3>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl relative z-10">
            Get direct access to step-by-step masterclasses, visual assets, and monthly live AMAs hosted by {creatorName}.
          </p>
        </div>
      </div>

      {/* Tab Dynamic Content */}
      <div className="flex-1">
        {renderTabContent()}
      </div>
    </div>
  )
}

export default function Preview() {
  const { next, creatorData, updateCreator, prev, requestWipeCreator } = useForge()
  const [visible, setVisible] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [theme, setTheme] = useState('dark')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [appliedPrompts, setAppliedPrompts] = useState([])
  const [variationIndex, setVariationIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [channelComments, setChannelComments] = useState(() => {
    return creatorData?.comments || creatorData?.channelComments || []
  })

  // Fetch real channel comments from Apify / YouTube if not yet loaded
  useEffect(() => {
    const handle = creatorData?.handle || creatorData?.name || creatorData?.url
    if (!handle) return

    // Check localStorage cache first
    const clean = String(handle).replace(/^@/, '').trim()
    try {
      const cached = sessionStorage.getItem(`forge_creator_comments_${clean}`) || localStorage.getItem(`forge_creator_comments_${clean}`)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChannelComments(parsed)
          return
        }
      }
    } catch {}

    fetchCreatorComments(handle, creatorData?.platform || 'youtube', 12)
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          setChannelComments(res)
          updateCreator({ comments: res, channelComments: res })
        }
      })
      .catch(err => console.warn('[Preview] Channel comments fetch notice:', err))
  }, [creatorData?.handle, creatorData?.url])

  const previewContainerRef = useRef(null)

  const accent = getAccent(creatorData)
  const dynamicAccent = accent.color
  const dynamicAccentBg = `rgba(${accent.rgb}, 0.12)`
  const dynamicAccentBorder = `rgba(${accent.rgb}, 0.28)`
  const isLight = isLightColor(dynamicAccent)

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage('')
    }, 2800)
  }

  const [currentBlueprint, setCurrentBlueprint] = useState(() => {
    return creatorData.blueprint || {
      name: `${creatorData.name || 'Creator'}'s Space`,
      type: 'Membership',
      preview: 'community',
      features: ['Private forum', 'Tiered tiers', 'Monthly AMAs', 'Exclusive perks']
    }
  })

  const [activeTab, setActiveTab] = useState(() => {
    const p = currentBlueprint.preview || 'community'
    if (p === 'webapp') return 'Courses'
    if (p === 'mobile') return 'Home Feed'
    if (p === 'store') return 'All Products'
    return 'Announcements'
  })

  const [viewMode, setViewMode] = useState('desktop') // 'desktop' | 'mobile' | 'dashboard'
  const isMobileView = viewMode === 'mobile'
  const [extraTabs, setExtraTabs] = useState(() => creatorData.extraTabs || [])
  const [localFeatures, setLocalFeatures] = useState(() => {
    return currentBlueprint.features || ['Private forum', 'Tiered tiers', 'Monthly AMAs', 'Exclusive perks']
  })

  useEffect(() => {
    const previewType = currentBlueprint.preview || 'webapp'
    if (previewType === 'webapp') setActiveTab('Courses')
    else if (previewType === 'mobile') setActiveTab('Home Feed')
    else if (previewType === 'community') setActiveTab('Announcements')
    else if (previewType === 'store') setActiveTab('All Products')
  }, [currentBlueprint.preview])

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const toggleFullscreenPreview = () => {
    if (!document.fullscreenElement) {
      previewContainerRef.current?.requestFullscreen().catch(() => {
        showToast("Error enabling fullscreen")
      })
      setIsFullscreen(true)
      showToast("Entered fullscreen mode")
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
      showToast("Exited fullscreen mode")
    }
  }

  const processPrompt = (text) => {
    const p = text.toLowerCase()
    
    if (p.includes('regenerat')) {
      const variations = getVariationsForCreator(creatorData, extraTabs)
      const nextIdx = (variationIndex + 1) % variations.length
      setVariationIndex(nextIdx)
      const nextBp = variations[nextIdx]
      setCurrentBlueprint(nextBp)
      setLocalFeatures(nextBp.features)

      if (nextBp.preview === 'webapp') setActiveTab('Courses')
      else if (nextBp.preview === 'mobile') setActiveTab('Home Feed')
      else if (nextBp.preview === 'community') setActiveTab('Announcements')
      else if (nextBp.preview === 'store') setActiveTab('All Products')

      const updated = {
        ...creatorData,
        blueprint: nextBp,
        productName: nextBp.name,
        features: nextBp.features,
        theme,
        isMobileView,
        viewMode
      }
      updateCreator(updated)
      try {
        localStorage.setItem('forge_creator_data', JSON.stringify(updated))
      } catch {}
      showToast("Generated new blueprint variation!")
      return
    }

    if (p.includes('premium')) setTheme('premium')
    else if (p.includes('minimalist') || p.includes('minimal')) setTheme('minimalist')
    else if (p.includes('women') || p.includes('female') || p.includes('feminine') || p.includes('rose') || p.includes('25')) setTheme('feminine')
    else if (p.includes('light') || p.includes('paper')) setTheme('light')
    else if (p.includes('dark') || p.includes('graphite')) setTheme('dark')

    if (p.includes('community')) {
      setActiveTab('Announcements')
      showToast("Focused layout on community discussion")
    }

    if (p.includes('mobile') || p.includes('phone') || p.includes('handheld')) {
      setViewMode('mobile')
      showToast("Switched to mobile viewport")
    } else if (p.includes('dashboard') || p.includes('admin') || p.includes('creator os')) {
      setViewMode('dashboard')
      showToast("Switched to Creator OS")
    } else if (p.includes('desktop') || p.includes('web')) {
      setViewMode('desktop')
      showToast("Switched to Member Web")
    }

    if (p.includes('podcast')) {
      if (!extraTabs.includes('Podcast')) {
        setExtraTabs(prev => [...prev, 'Podcast'])
        setLocalFeatures(prev => prev.includes('Podcast section') ? prev : [...prev, 'Podcast section'])
        setActiveTab('Podcast')
        showToast("Added Podcast section to blueprint")
      }
    }
  }

  const handlePromptSend = () => {
    if (!prompt.trim()) return
    setIsRegenerating(true)
    showToast("Forge AI is applying your changes...")
    setAppliedPrompts(prev => [...prev, prompt])
    const currentPrompt = prompt
    setPrompt('')
    
    setTimeout(() => {
      processPrompt(currentPrompt)
      setIsRegenerating(false)
      showToast("Layout successfully updated!")
    }, 1000)
  }

  const handleQuickPrompt = (p) => {
    setIsRegenerating(true)
    if (!p.toLowerCase().includes('regenerat')) {
      setAppliedPrompts(prev => [...prev, p])
    }
    showToast(`Refining: "${p}"...`)
    
    setTimeout(() => {
      processPrompt(p)
      setIsRegenerating(false)
    }, 1000)
  }

  const applyChipToInput = (chip) => {
    setPrompt(chip)
    showToast(`Added prompt: "${chip}"`)
  }

  const removeAppliedPrompt = (promptText) => {
    setIsRegenerating(true)
    setTimeout(() => {
      setAppliedPrompts(prev => prev.filter(x => x !== promptText))
      const p = promptText.toLowerCase()
      
      if (p.includes('premium') || p.includes('minimalist') || p.includes('minimal') || 
          p.includes('women') || p.includes('female') || p.includes('feminine') || p.includes('rose') || p.includes('25') ||
          p.includes('light') || p.includes('paper') || p.includes('dark') || p.includes('graphite')) {
        setTheme('dark')
      }

      if (p.includes('mobile') || p.includes('phone') || p.includes('handheld') || p.includes('dashboard') || p.includes('admin') || p.includes('creator os')) {
        setViewMode('desktop')
      }

      if (p.includes('podcast')) {
        setExtraTabs(prev => prev.filter(x => x !== 'Podcast'))
        setLocalFeatures(prev => prev.filter(x => x !== 'Podcast section'))
        setActiveTab('Courses')
      }
      setIsRegenerating(false)
      showToast("Refinement removed")
    }, 600)
  }

  const handleSwitchView = (mode) => {
    setViewMode(mode)
    if (mode === 'desktop') {
      setAppliedPrompts(prev => prev.filter(p => !p.toLowerCase().includes('mobile') && !p.toLowerCase().includes('dashboard')))
      showToast("Switched to Member Web preview")
    } else if (mode === 'mobile') {
      showToast("Switched to Member Mobile preview")
    } else if (mode === 'creator' || mode === 'dashboard') {
      showToast("Switched to Creator OS preview")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#08090d] text-slate-100 selection:bg-white/20">
      
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-[#1f2430] bg-[#0b0c10]/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={prev} 
            className="flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-white bg-[#161922] hover:bg-[#1f2430] px-3.5 py-2 rounded-xl transition border border-[#222634] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
          
          <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />
          
          <div className="flex items-center space-x-2.5">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm bg-[#12141c] border border-[#222634] shadow-sm"
            >
              <WingLogo size={18} />
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              CoLaunch
            </span>
          </div>
        </div>

        {/* Center View Mode Selector */}
        <div className="hidden md:flex items-center bg-[#12141c] p-1 rounded-2xl border border-[#222634] shadow-inner">
          <button 
            onClick={() => handleSwitchView('desktop')}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            style={{
              background: viewMode === 'desktop' ? dynamicAccent : 'transparent',
              color: viewMode === 'desktop' ? (isLight ? '#000000' : '#ffffff') : '#94a3b8',
              boxShadow: viewMode === 'desktop' ? `0 4px 12px rgba(${accent.rgb}, 0.25)` : 'none'
            }}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Member Web</span>
          </button>
          <button 
            onClick={() => handleSwitchView('mobile')}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            style={{
              background: viewMode === 'mobile' ? dynamicAccent : 'transparent',
              color: viewMode === 'mobile' ? (isLight ? '#000000' : '#ffffff') : '#94a3b8',
              boxShadow: viewMode === 'mobile' ? `0 4px 12px rgba(${accent.rgb}, 0.25)` : 'none'
            }}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Member Mobile</span>
          </button>
          <button 
            onClick={() => handleSwitchView('dashboard')}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            style={{
              background: viewMode === 'dashboard' ? dynamicAccent : 'transparent',
              color: viewMode === 'dashboard' ? (isLight ? '#000000' : '#ffffff') : '#94a3b8',
              boxShadow: viewMode === 'dashboard' ? `0 4px 12px rgba(${accent.rgb}, 0.25)` : 'none'
            }}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Creator OS</span>
          </button>
        </div>

        {/* Right Header Badges & Actions */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Generated v2.4</span>
          </div>

          <button 
            type="button" 
            onClick={requestWipeCreator}
            className="flex items-center space-x-2 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3.5 py-2 rounded-xl transition cursor-pointer"
            title="Wipe creator state"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Creator</span>
          </button>

          <div className="flex items-center space-x-1 pl-2">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div 
                key={i} 
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === 5 ? '16px' : '6px',
                  height: '6px',
                  background: i === 5 ? dynamicAccent : i < 5 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)',
                }}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-[1700px] mx-auto w-full">

        {/* Left / Center Main Preview Area (Span 8) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          
          {/* Breadcrumb / Header Info & Fullscreen Toggle */}
          <div className="flex items-center justify-between px-2">
            <div>
              <span 
                className="text-xs uppercase tracking-wider font-semibold"
                style={{ color: dynamicAccent }}
              >
                Live Preview
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
                {currentBlueprint.name}
              </h1>
            </div>

            {/* Mobile View Toggle (Shown when on small screens) */}
            <div className="flex items-center space-x-2">
              <div className="flex md:hidden items-center bg-[#12141c] p-1 rounded-xl border border-[#222634]">
                <button 
                  onClick={() => handleSwitchView('desktop')}
                  className="p-1.5 rounded-lg text-xs"
                  style={{ background: viewMode === 'desktop' ? dynamicAccent : 'transparent', color: viewMode === 'desktop' ? '#000' : '#888' }}
                >
                  <Globe className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleSwitchView('mobile')}
                  className="p-1.5 rounded-lg text-xs"
                  style={{ background: viewMode === 'mobile' ? dynamicAccent : 'transparent', color: viewMode === 'mobile' ? '#000' : '#888' }}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleSwitchView('dashboard')}
                  className="p-1.5 rounded-lg text-xs"
                  style={{ background: viewMode === 'dashboard' ? dynamicAccent : 'transparent', color: viewMode === 'dashboard' ? '#000' : '#888' }}
                >
                  <Wand2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <button 
                onClick={toggleFullscreenPreview}
                className="p-2.5 rounded-xl bg-[#12141c] hover:bg-[#1a1d26] border border-[#222634] text-slate-300 hover:text-white transition cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Toggle Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Browser Mockup Canvas Container */}
          <div 
            ref={previewContainerRef}
            id="preview-container" 
            className="flex-1 bg-[#12141c] border border-[#222634] rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300"
            style={{
              boxShadow: `0 0 35px -5px rgba(${accent.rgb}, 0.12)`,
              minHeight: '520px'
            }}
          >
            {/* Browser Top Chrome Bar */}
            <div className="bg-[#161922] px-4 py-3 border-b border-[#222634] flex items-center justify-between select-none flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>

              <div className="flex-1 max-w-md mx-4">
                <div className="bg-[#0b0c10] border border-[#222634] rounded-lg px-4 py-1.5 text-xs text-slate-400 text-center truncate flex items-center justify-center space-x-2 shadow-inner">
                  <Lock className="w-3 h-3 flex-shrink-0" style={{ color: dynamicAccent }} />
                  <span id="browser-url" className="truncate font-mono">
                    {viewMode === 'dashboard' 
                      ? `${currentBlueprint.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.creator.studio`
                      : viewMode === 'mobile'
                        ? `m.${currentBlueprint.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.app`
                        : `${currentBlueprint.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.forge.app`}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-slate-400 text-xs">
                <RotateCcw 
                  className="w-3.5 h-3.5 hover:text-white cursor-pointer transition-transform duration-300 active:rotate-180" 
                  onClick={() => {
                    handleQuickPrompt('Regenerate')
                    showToast("Reloading live preview...")
                  }}
                  title="Reload preview"
                />
              </div>
            </div>

            {/* Inner Viewport Area */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-[#0f1117]">
              {/* Regenerating overlay */}
              {isRegenerating && (
                <div 
                  className="absolute inset-0 flex items-center justify-center z-30 animate-fade-in"
                  style={{ background: 'rgba(8,9,13,0.85)', backdropFilter: 'blur(4px)' }}
                >
                  <div className="text-center p-6 rounded-2xl bg-[#12141c] border border-[#222634] shadow-2xl">
                    <div 
                      className="w-10 h-10 border-2 border-white/20 rounded-full animate-spin mx-auto mb-3"
                      style={{ borderTopColor: dynamicAccent }} 
                    />
                    <p className="text-sm font-semibold text-white">Refining Interface...</p>
                    <p className="text-xs text-slate-400 mt-1">Applying aesthetic parameters</p>
                  </div>
                </div>
              )}

              {viewMode === 'mobile' ? (
                /* Mobile Phone Shell */
                <div 
                  className="relative rounded-[40px] p-[8px] bg-[#222634] shadow-2xl transition-all duration-300 my-4 ring-1 ring-white/10"
                  style={{
                    width: '320px',
                    height: '540px',
                    boxShadow: `0 25px 50px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06)`
                  }}
                >
                  {/* Inner Screen */}
                  <div className="w-full h-full rounded-[32px] overflow-hidden bg-[#0f1117] flex flex-col relative [isolation:isolate]">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#141414] rounded-b-xl z-20 pointer-events-none" />
                    
                    <div className="flex-1 overflow-hidden flex flex-col">
                      <AppMockup 
                        theme={theme} 
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        blueprint={currentBlueprint}
                        creatorData={creatorData}
                        extraTabs={extraTabs}
                        isMobile={true}
                        viewMode="mobile"
                        channelComments={channelComments}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Desktop / Dashboard Viewport */
                <div className="w-full h-full overflow-hidden flex flex-col">
                  <AppMockup 
                    theme={theme} 
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    blueprint={currentBlueprint}
                    creatorData={creatorData}
                    extraTabs={extraTabs}
                    isMobile={false}
                    viewMode={viewMode}
                    channelComments={channelComments}
                  />
                </div>
              )}
            </div>

          </div>

          {/* Applied Prompts Filter Tags */}
          {appliedPrompts.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 px-1">
              {appliedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => removeAppliedPrompt(p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-[#161922] hover:bg-rose-500/10 hover:text-rose-400 border border-[#222634] hover:border-rose-500/30 text-slate-300 group transition-all duration-150 cursor-pointer shadow-sm"
                  title="Click to remove refinement"
                >
                  <Check className="w-3 h-3 group-hover:hidden text-emerald-400" />
                  <span className="hidden group-hover:inline font-bold text-rose-400">×</span>
                  <span>{p}</span>
                </button>
              ))}
            </div>
          )}

        </div>

        {/* Right Sidebar - Creator Forge & Included Features (Span 4) */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          {/* What's Included Card */}
          <div className="bg-[#12141c] border border-[#222634] rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">What's Included</h3>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: dynamicAccent }} />
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: dynamicAccent }} />
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: dynamicAccent }} />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              </div>
            </div>

            <div className="space-y-2.5">
              {localFeatures.map(label => {
                const matched = FEATURES.find(f => f.label === label)
                const Icon = matched ? matched.icon : Layout
                return (
                  <div 
                    key={label} 
                    className="flex items-center justify-between p-3 rounded-xl bg-[#161922] border border-[#222634]/60 hover:border-[#222634] transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs shadow-sm border"
                        style={{ 
                          background: dynamicAccentBg, 
                          color: dynamicAccent,
                          borderColor: dynamicAccentBorder
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-200">{label}</span>
                    </div>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                )
              })}
            </div>
          </div>

          {/* Refine with Forge Card */}
          <div className="bg-[#12141c] border border-[#222634] rounded-2xl p-5 shadow-lg flex flex-col flex-1 justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Refine with Forge</h3>
                <span 
                  className="text-[10px] px-2 py-0.5 rounded-md font-bold border"
                  style={{ 
                    background: dynamicAccentBg, 
                    color: dynamicAccent,
                    borderColor: dynamicAccentBorder
                  }}
                >
                  AI ASSISTANT
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Click chips to apply instant style modifications or type custom instructions below.
              </p>
              
              {/* Prompt Chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {QUICK_PROMPTS.map(chip => (
                  <button 
                    key={chip}
                    onClick={() => applyChipToInput(chip)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-[#161922] hover:bg-[#1f2430] border border-[#222634] hover:border-slate-600 text-slate-300 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    {chip === 'Make it more premium' && '✨ '}
                    {chip === 'Focus on community' && '👥 '}
                    {chip === 'More minimalist' && '⚪ '}
                    {chip === 'For women 25-34' && '🎯 '}
                    {chip === 'Mobile-first' && '📱 '}
                    {chip === 'Add a podcast section' && '🎙️ '}
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="relative mb-3">
                <textarea 
                  rows={3} 
                  placeholder="Describe a change (e.g. Creator OS, add dark mode toggle...)" 
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handlePromptSend()
                    }
                  }}
                  className="w-full bg-[#161922] border border-[#222634] focus:border-slate-500 rounded-xl p-3 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none resize-none shadow-inner transition"
                />
                <button 
                  onClick={handlePromptSend}
                  disabled={!prompt.trim()}
                  className="absolute right-3 bottom-4 p-2 rounded-lg transition border border-[#222634] bg-[#12141c] hover:bg-[#1f2430] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  style={{ color: dynamicAccent }}
                  title="Send instruction"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Regenerate Button */}
              <button 
                onClick={() => handleQuickPrompt('Regenerate')}
                disabled={isRegenerating}
                className="w-full bg-[#161922] hover:bg-[#1f2430] font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-sm border cursor-pointer active:scale-95 disabled:opacity-40"
                style={{
                  color: dynamicAccent,
                  borderColor: dynamicAccentBorder
                }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                <span>{isRegenerating ? 'Regenerating Component...' : 'Regenerate Component'}</span>
              </button>
            </div>

            {/* Final Action CTA Button */}
            <div className="mt-6 pt-4 border-t border-[#222634]">
              <button 
                onClick={() => {
                  const finalPayload = {
                    blueprint: currentBlueprint,
                    productName: currentBlueprint.name,
                    features: localFeatures,
                    theme,
                    isMobileView,
                    viewMode,
                    extraTabs,
                  };
                  updateCreator(finalPayload);
                  try {
                    localStorage.setItem('forge_creator_data', JSON.stringify({ ...creatorData, ...finalPayload }));
                  } catch {}
                  showToast("🚀 Launching application build...")
                  setTimeout(() => {
                    next();
                  }, 400);
                }}
                disabled={isRegenerating}
                className="w-full font-extrabold py-3.5 rounded-xl text-sm transition shadow-xl flex items-center justify-center space-x-2 group cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: dynamicAccent,
                  color: isLight ? '#000000' : '#ffffff',
                  boxShadow: `0 10px 25px -5px rgba(${accent.rgb}, 0.35)`
                }}
              >
                <span>Looks good, build it</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>

          </div>

        </div>

      </main>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div 
          className="fixed bottom-6 right-6 z-50 bg-[#161922] border px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 animate-fade-in"
          style={{ borderColor: dynamicAccentBorder }}
        >
          <div 
            className="w-7 h-7 rounded-xl flex items-center justify-center text-xs shadow-sm"
            style={{ background: dynamicAccentBg, color: dynamicAccent }}
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-xs font-medium text-white">{toastMessage}</span>
        </div>
      )}

    </div>
  )
}
