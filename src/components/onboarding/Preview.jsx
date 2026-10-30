import { useState, useEffect, useRef } from 'react'
import { useForge, getAccent } from '../../App'
import { 
  ArrowRight, ArrowLeft, RefreshCw, Send, SlidersHorizontal, Check, Layout, Users, 
  BarChart2, Settings, Radio, Play, Lock, MessageSquare, Calendar, 
  Download, ShoppingBag, Laptop, Smartphone, Volume2, Award, RotateCcw, Trash2,
  Heart, MessageCircle, Share2, MoreHorizontal, Maximize2, Minimize2, Globe, Sparkles,
  Layers, Video, Star, CheckCircle2, ShieldCheck, Rocket, CheckCircle,
  Megaphone, Pin, Clock, Headphones, Pause, FastForward, Rewind, Paperclip, Smile,
  ChevronRight, ThumbsUp, Flame, Music, Eye, ExternalLink, Plus, X
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
  const handleClean = (creatorData?.handle || creatorName || 'creator').replace('@', '').toLowerCase()
  const creatorDisplayName = (creatorData?.name || '').toLowerCase()
  const videos = creatorData?.recentPosts || creatorData?.videos || []
  const creatorUrl = getCreatorChannelUrl(creatorData)

  // Use strictly genuine audience comments scraped from Apify / YouTube (no handcoded announcements)
  if (Array.isArray(channelComments) && channelComments.length > 0) {
    return channelComments.map((c, idx) => {
      const matchedVid = videos.find(v => 
        (v.title && c.videoTitle && v.title.toLowerCase().includes(c.videoTitle.toLowerCase())) ||
        (v.videoId && c.videoId && v.videoId === c.videoId)
      ) || (videos.length > 0 ? videos[idx % videos.length] : null)

      const vidTitle = c.videoTitle || matchedVid?.title || ''
      const vidUrl = c.videoUrl || c.url || (c.videoId ? `https://www.youtube.com/watch?v=${c.videoId}` : null) || matchedVid?.url || (matchedVid?.videoId ? `https://www.youtube.com/watch?v=${matchedVid.videoId}` : null) || creatorUrl

      const authorRaw = c.author || c.user || 'viewer'
      const authorClean = authorRaw.replace(/^@/, '')
      const isCreator = Boolean(
        c.isCreator || 
        authorClean.toLowerCase() === handleClean || 
        (creatorDisplayName && authorClean.toLowerCase() === creatorDisplayName)
      )

      return {
        id: c.id || `comm_${idx}`,
        user: `@${authorClean}`,
        text: (c.text || c.quote || '').trim(),
        time: c.published || c.time || 'YouTube Comment',
        source: 'YouTube Comment',
        videoTitle: vidTitle,
        videoUrl: vidUrl,
        isCreator
      }
    }).filter(p => p.text && p.text.trim())
  }

  // If no comments found from Apify, return empty list (no mockup data or fake announcements)
  return []
}

export const CAPABILITY_PRESETS = [
  { label: 'Podcast section', icon: Volume2, tab: 'Podcast', desc: 'Audio episodes, show notes & players' },
  { label: 'Live events & AMAs', icon: Radio, tab: 'Live AMAs', desc: 'Live stage, scheduled streams & Q&A' },
  { label: 'Digital products & store', icon: ShoppingBag, tab: 'Products', desc: 'Downloadable assets, templates & vault' },
  { label: 'Video archive & vault', icon: Play, tab: 'Videos', desc: 'Curated uploads & releases' },
  { label: 'Tiered memberships', icon: Layers, tab: null, desc: 'Recurring Stripe subscription tiers' },
  { label: 'Exclusive perks', icon: Star, tab: null, desc: 'Verified member badges & rewards' },
]

const QUICK_PROMPTS = [
  'Focus on community',
  'More minimalist',
  'Mobile-first',
  'Add a podcast section',
  'Add live events',
  'Add digital store',
]

const FEATURES = [
  { icon: MessageSquare, label: 'Private forum' },
  { icon: Layers, label: 'Tiered tiers' },
  { icon: Layers, label: 'Tiered memberships' },
  { icon: Video, label: 'Monthly AMAs' },
  { icon: Radio, label: 'Live events & AMAs' },
  { icon: Radio, label: 'Live events' },
  { icon: Star, label: 'Exclusive perks' },
  { icon: Layout, label: 'Course builder' },
  { icon: Users, label: 'Community forum' },
  { icon: MessageCircle, label: 'Member discussions' },
  { icon: Play, label: 'Video releases' },
  { icon: Play, label: 'Video archive' },
  { icon: Play, label: 'Video archive & vault' },
  { icon: Megaphone, label: 'Official announcements' },
  { icon: Users, label: 'Verified members' },
  { icon: Star, label: 'Direct discussions' },
  { icon: BarChart2, label: 'Creator analytics' },
  { icon: Settings, label: 'Member management' },
  { icon: Volume2, label: 'Podcast section' },
  { icon: ShoppingBag, label: 'Digital products & store' },
  { icon: ShoppingBag, label: 'Digital products' },
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

export function getCreatorChannelUrl(creatorData) {
  if (creatorData?.url && typeof creatorData.url === 'string' && creatorData.url.startsWith('http')) {
    return creatorData.url
  }
  if (creatorData?.handle) {
    const clean = creatorData.handle.startsWith('@') ? creatorData.handle : `@${creatorData.handle}`
    return `https://www.youtube.com/${clean}`
  }
  if (creatorData?.name) {
    return `https://www.youtube.com/@${creatorData.name.replace(/[^a-zA-Z0-9]/g, '')}`
  }
  return 'https://www.youtube.com'
}

export function isEducationalCreator(creatorData) {
  const videos = creatorData?.recentPosts || creatorData?.videos || []
  const bio = (creatorData?.description || '').toLowerCase()
  const niche = (creatorData?.niche || '').toLowerCase()
  const allTitles = videos.map(v => (v.title || '').toLowerCase()).join(' ')
  const channelText = `${bio} ${niche} ${allTitles}`
  return /\b(full course|crash course|coding tutorial|programming tutorial|beginner course|complete course|masterclass series|curriculum|bootcamp|learn python|learn javascript|learn react|step-by-step tutorial)\b/i.test(channelText)
}

export function getAnalyzedTabsForCreator(creatorData, blueprint, extraTabs = []) {
  const videos = creatorData?.recentPosts || creatorData?.videos || []
  const bio = (creatorData?.description || '').toLowerCase()
  const niche = (creatorData?.niche || '').toLowerCase()

  // Real channel content strictly from Apify (bio, niche, video titles)
  const allTitles = videos.map(v => (v.title || '').toLowerCase()).join(' ')
  const channelText = `${bio} ${niche} ${allTitles}`

  // Community is ALWAYS present and primary
  const tabs = ['Community']

  // Videos / Channel Archive (shows real Apify YouTube videos)
  if (videos.length > 0) {
    tabs.push('Videos')
  }

  // Courses: ONLY if channel actually teaches structured courses or programming/skill tutorials
  const isEducational = isEducationalCreator(creatorData)
  if (isEducational) {
    tabs.push('Courses')
  }

  // Podcast: ONLY if channel actually has podcast episodes or an interview show
  const isPodcast = /\b(podcast|podcast episode|the .* podcast|ep\s*\d+|audio podcast)\b/i.test(channelText)
  if (isPodcast) {
    tabs.push('Podcast')
  }

  // Live Streams / AMAs: ONLY if channel explicitly does live streams or live AMAs
  const isLive = /\b(live stream|livestream|live q&a|live ama\b|ama livestream)\b/i.test(channelText)
  if (isLive) {
    tabs.push('Live AMAs')
  }

  // Include user extraTabs if user explicitly requested/prompted or added via sidebar
  if (Array.isArray(extraTabs)) {
    extraTabs.forEach(t => {
      if (!tabs.includes(t)) tabs.push(t)
    })
  }

  return tabs
}

function getVariationsForCreator(creatorData, extraTabs) {
  const name = creatorData.name || creatorData.handle?.replace('@', '') || 'Creator'
  const baseTabs = extraTabs.length ? extraTabs : []
  const isEdu = isEducationalCreator(creatorData)

  if (isEdu) {
    return [
      {
        id: 'academy-course',
        name: `${name}'s Learning Academy`,
        type: 'Course Platform',
        preview: 'webapp',
        description: `Structured curriculum with step-by-step video tutorials, modules, and community discussions.`,
        features: ['Course builder', 'Community forum', 'Video vault', 'Creator analytics', ...baseTabs],
        tagline: 'Structured learning and hands-on video tutorials'
      },
      {
        id: 'community-circle',
        name: `${name}'s Community Hub`,
        type: 'Membership Community',
        preview: 'community',
        description: `Official audience community platform with member discussions, video archive, and announcements.`,
        features: ['Community forum', 'Member discussions', 'Video releases', 'Official announcements', ...baseTabs],
        tagline: 'Direct community access & video vault'
      },
      {
        id: 'backstage-app',
        name: `${name}'s Mobile Backstage`,
        type: 'Mobile App',
        preview: 'mobile',
        description: `Dedicated mobile app with video streaming, push notifications, and member discussions.`,
        features: ['Push notifications', 'Members feed', 'Video archive', 'Exclusive drops', ...baseTabs],
        tagline: 'Mobile community and video updates'
      }
    ]
  }

  return [
    {
      id: 'community-hub',
      name: `${name}'s Community Hub`,
      type: 'Membership Community',
      preview: 'community',
      description: `Official audience community platform with member discussions, video archive, and announcements.`,
      features: ['Community forum', 'Member discussions', 'Video releases', 'Official announcements', ...baseTabs],
      tagline: 'Direct audience connection & official video archive'
    },
    {
      id: 'inner-circle',
      name: `${name}'s Inner Circle`,
      type: 'Membership Space',
      preview: 'community',
      description: `Private community platform for dedicated viewers with direct discussions and channel archive.`,
      features: ['Private forum', 'Verified members', 'Direct discussions', 'Official announcements', ...baseTabs],
      tagline: 'Dedicated space for our most active supporters'
    },
    {
      id: 'backstage-app',
      name: `${name}'s Mobile Backstage`,
      type: 'Mobile App',
      preview: 'mobile',
      description: `Dedicated mobile application for on-the-go community updates, video streaming, and member discussions.`,
      features: ['Push notifications', 'Members feed', 'Video archive', 'Exclusive drops', ...baseTabs],
      tagline: 'Mobile access with instant push notifications'
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
          { label: 'Subscribers', val: creatorData?.followers || 'Community Reach', badge: 'Official Audience', desc: 'Verified subscriber count' },
          { label: 'Channel Views', val: creatorData?.totalViews || 'Apify Scraped', badge: 'Total Impact', desc: 'Cumulative video views' },
          { label: 'Catalog Uploads', val: `${creatorData?.videoCount || recentVideoList.length || '12'} Videos`, badge: 'Official Archive', desc: 'Verified channel videos' },
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

      {/* Two Column Layout: Channel Releases & Live Member Activity */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 px-5 pb-5 flex-1">
        {/* Releases / Pipeline (3 cols) */}
        <div 
          className="md:col-span-3 p-4 rounded-xl border flex flex-col bg-[#12141c] border-[#222634]"
        >
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#222634]">
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Official Releases & Video Catalog
            </span>
            <span className="text-xs font-mono font-semibold" style={{ color: dynamicAccent }}>
              {recentVideoList.length} Uploads
            </span>
          </div>

          <div className="space-y-2.5">
            {recentVideoList.slice(0, 3).map((vid, idx) => (
              <div 
                key={idx} 
                className="p-3 rounded-xl border bg-[#161922] border-[#222634] flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white truncate">
                      {vid.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {vid.views ? `${vid.views} views` : 'Published release'} {vid.published ? `· ${vid.published}` : ''}
                  </p>
                </div>
                <a 
                  href={vid.url || (vid.videoId ? `https://www.youtube.com/watch?v=${vid.videoId}` : getCreatorChannelUrl(creatorData))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold border flex items-center gap-1 shrink-0"
                  style={{ color: dynamicAccent, background: dynamicAccentBg, borderColor: dynamicAccentBorder }}
                >
                  <span>Watch</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
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

  const creatorName = creatorData?.name || creatorData?.handle?.replace('@','') || 'Creator'
  const handleClean = (creatorData?.handle || creatorName || 'creator').replace('@', '').toLowerCase()

  const recentVideoList = Array.isArray(creatorData?.recentPosts) && creatorData.recentPosts.length > 0
    ? creatorData.recentPosts
    : Array.isArray(creatorData?.videos) && creatorData.videos.length > 0
      ? creatorData.videos
      : []

  const topVideoTitle = recentVideoList[0]?.title || ''
  const secondVideoTitle = recentVideoList[1]?.title || ''
  const thirdVideoTitle = recentVideoList[2]?.title || ''

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

  const allTabs = getAnalyzedTabsForCreator(creatorData, blueprint, extraTabs)
  const creatorUrl = getCreatorChannelUrl(creatorData)
  const cleanCreatorUrlDisplay = creatorUrl.replace(/^https?:\/\/(www\.)?/, '')

  const renderTabContent = () => {
    const tabLower = activeTab.toLowerCase()

    // 1. VIDEOS TAB (Real Scraped YouTube Videos from Apify)
    if (tabLower.includes('video') || tabLower.includes('archive') || tabLower.includes('watch') || tabLower.includes('upload')) {
      if (recentVideoList.length === 0) {
        return (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <p className="text-xs">No video archive loaded for this creator.</p>
            {creatorUrl && (
              <a 
                href={creatorUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs hover:underline"
                style={{ color: styles.accent }}
              >
                <span>Browse channel on YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )
      }

      return (
        <div className={isMobile ? "p-3 space-y-3" : "p-6 space-y-4"}>
          <div className="flex items-center justify-between pb-2 border-b border-[#222634]">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">Latest YouTube Releases & Archive</h4>
              <p className="text-[11px] text-slate-400">{recentVideoList.length} videos from official channel</p>
            </div>
            {creatorUrl && (
              <a 
                href={creatorUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs hover:underline flex items-center gap-1 font-mono"
                style={{ color: styles.accent }}
              >
                <span>YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className={isMobile ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"}>
            {recentVideoList.map((v, i) => {
              const videoLink = v.url || (v.videoId ? `https://www.youtube.com/watch?v=${v.videoId}` : creatorUrl)
              const thumbUrl = v.thumbnail || (v.videoId ? `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg` : '')

              return (
                <div 
                  key={i} 
                  className="rounded-2xl border bg-[#12141c] border-[#222634] hover:border-slate-700 transition overflow-hidden shadow-sm flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-video w-full bg-[#161922] overflow-hidden flex items-center justify-center">
                      {thumbUrl ? (
                        <img 
                          src={thumbUrl} 
                          alt="" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <Play className="w-8 h-8 text-slate-500" />
                      )}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                          style={{ background: styles.accent, color: isLight ? '#000000' : '#ffffff' }}
                        >
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3.5">
                      <h5 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug transition-colors">
                        {v.title}
                      </h5>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2 font-mono flex-wrap">
                        {v.views && <span>{v.views} views</span>}
                        {v.likes && (
                          <>
                            <span>·</span>
                            <span>{v.likes} likes</span>
                          </>
                        )}
                        {v.published && (
                          <>
                            <span>·</span>
                            <span>{v.published}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Watch Link */}
                  <div className="px-3.5 pb-3.5 pt-0">
                    <a 
                      href={videoLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-3 rounded-xl text-[11px] font-semibold border flex items-center justify-center gap-1.5 transition text-slate-300 hover:text-white bg-[#161922] hover:bg-[#1f2430] border-[#222634]"
                    >
                      <span>Watch on YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    // 2. COMMUNITY TAB (Real Comments Scraped from Apify)
    if (tabLower.includes('community') || tabLower.includes('feed') || tabLower.includes('forum') || tabLower.includes('discussion')) {
      const posts = getDynamicCommunityPosts(creatorName, blueprint, creatorData, internalComments)

      return (
        <div className={isMobile ? "p-3 space-y-3.5" : "p-6 space-y-4"}>
          {/* Apify Real Channel Stats Banner */}
          <div className="p-4 rounded-2xl bg-[#12141c] border border-[#222634] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm border shadow-sm flex-shrink-0"
                style={{ background: styles.accentBg, color: styles.accent, borderColor: styles.accentBorder }}
              >
                {resolvedAvatar ? (
                  <img src={resolvedAvatar} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <span>{creatorName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white">{creatorName}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">@{handleClean}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5 flex-wrap">
                  {creatorData?.followers && (
                    <span className="text-slate-300 font-semibold">{creatorData.followers} subscribers</span>
                  )}
                  {creatorData?.videoCount && (
                    <>
                      <span>·</span>
                      <span>{creatorData.videoCount} videos</span>
                    </>
                  )}
                  {creatorData?.totalViews && (
                    <>
                      <span>·</span>
                      <span>{creatorData.totalViews} views</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {creatorUrl && (
              <a 
                href={creatorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
                style={{ 
                  color: styles.accent, 
                  background: styles.accentBg, 
                  borderColor: styles.accentBorder 
                }}
              >
                <span>Channel Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* Posts list */}
          {posts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-3 rounded-2xl bg-[#12141c] border border-[#222634]">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mx-auto border"
                style={{ background: styles.accentBg, color: styles.accent, borderColor: styles.accentBorder }}
              >
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-300 font-medium">No comments synced yet from Apify.</p>
              {creatorUrl && (
                <a 
                  href={creatorUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs hover:underline font-mono"
                  style={{ color: styles.accent }}
                >
                  <span>Explore discussions on official YouTube channel</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((p) => {
                return (
                  <div 
                    key={p.id} 
                    className={`bg-[#12141c] border border-[#222634] hover:border-slate-700 transition rounded-2xl shadow-sm ${
                      isMobile ? "p-3.5" : "p-4 sm:p-5"
                    }`}
                  >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div 
                        className="w-8 h-8 rounded-full font-bold flex items-center justify-center border shadow-sm flex-shrink-0 text-xs"
                        style={{ 
                          background: p.isCreator ? styles.accentBg : 'rgba(255,255,255,0.06)', 
                          color: p.isCreator ? styles.accent : '#fff',
                          borderColor: p.isCreator ? styles.accentBorder : '#222634'
                        }}
                      >
                        {p.user.replace('@', '').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-xs sm:text-sm text-white truncate">{p.user}</span>
                          {p.isCreator && (
                            <span 
                              className="text-[8.5px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider"
                              style={{ background: styles.accentBg, color: styles.accent, borderColor: styles.accentBorder }}
                            >
                              CREATOR
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500">·</span>
                          <span className="text-[10px] text-slate-400 font-mono">{p.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-xs sm:text-sm mt-1">
                    {p.text}
                  </p>

                  {/* Direct Link to the Video on YouTube */}
                  {p.videoUrl && (
                    <div className="mt-3 pt-2.5 border-t border-[#222634]/60 flex items-center justify-between gap-2 flex-wrap">
                      <a 
                        href={p.videoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border transition hover:opacity-90 group/vlink truncate max-w-full"
                        style={{ 
                          color: styles.accent, 
                          background: styles.accentBg, 
                          borderColor: styles.accentBorder 
                        }}
                        title={`Watch "${p.videoTitle || 'YouTube Video'}" on YouTube`}
                      >
                        <Play className="w-2.5 h-2.5 fill-current shrink-0" />
                        <span className="truncate group-hover/vlink:underline font-mono text-[11px]">
                          {p.videoTitle || 'Watch on YouTube'}
                        </span>
                        <ExternalLink className="w-3 h-3 shrink-0 opacity-70 group-hover/vlink:opacity-100" />
                      </a>

                      {p.source && (
                        <span className="text-[10px] text-slate-500 font-mono shrink-0 hidden sm:inline ml-auto">
                          {p.source}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          )}
        </div>
      )
    }

    // 3. ANNOUNCEMENTS TAB (Official updates from creator)
    if (tabLower.includes('announcement') || tabLower.includes('bulletin') || tabLower.includes('news') || tabLower.includes('update')) {
      return (
        <div className={isMobile ? "p-3 space-y-3.5" : "p-6 space-y-4"}>
          <div className="rounded-2xl border p-4 sm:p-5 bg-[#12141c] border-[#222634] shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-xs border"
                style={{ background: styles.accentBg, color: styles.accent, borderColor: styles.accentBorder }}
              >
                {resolvedAvatar ? (
                  <img src={resolvedAvatar} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <span>{creatorName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{creatorName}</span>
                <span className="text-[10px] text-slate-400 font-mono">@{handleClean}</span>
              </div>
            </div>

            <h4 className="text-sm sm:text-base font-bold text-white">
              Official Channel Announcements & Releases
            </h4>

            {topVideoTitle ? (
              <p className="text-xs text-slate-300 leading-relaxed">
                Latest release from channel: <strong className="text-white">"{topVideoTitle}"</strong>.
              </p>
            ) : null}

            {creatorData?.description && (
              <p className="text-xs text-slate-400 leading-relaxed">
                {creatorData.description}
              </p>
            )}

            {creatorUrl && (
              <div className="pt-2 border-t border-[#222634]">
                <a 
                  href={creatorUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs hover:underline"
                  style={{ color: styles.accent }}
                >
                  <span>Visit @{handleClean} on YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      )
    }

    // 4. COURSES TAB (ONLY IF EDUCATIONAL)
    if (tabLower.includes('course') || tabLower.includes('lesson') || tabLower.includes('curriculum') || tabLower.includes('academy')) {
      return (
        <div className={isMobile ? "p-3 space-y-3" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-6"}>
          {recentVideoList.slice(0, 6).map((v, i) => (
            <div 
              key={i} 
              className="rounded-2xl border bg-[#12141c] border-[#222634] p-4 flex flex-col justify-between shadow-sm"
            >
              <div>
                <div className="aspect-video w-full rounded-xl bg-[#161922] mb-3 overflow-hidden relative flex items-center justify-center">
                  {v.thumbnail ? (
                    <img src={v.thumbnail} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    <Play className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <h5 className="text-xs sm:text-sm font-bold text-white line-clamp-2">{v.title}</h5>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">{v.views || 'Tutorial Video'}</span>
              </div>
              <a 
                href={v.url || (v.videoId ? `https://www.youtube.com/watch?v=${v.videoId}` : creatorUrl)}
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-3 w-full py-1.5 px-3 rounded-xl text-[11px] font-semibold border flex items-center justify-center gap-1.5 transition text-slate-300 hover:text-white bg-[#161922] border-[#222634]"
              >
                <span>Watch Lesson</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      )
    }

    // 5. PODCAST TAB (ONLY IF PODCAST)
    if (tabLower.includes('podcast') || tabLower.includes('audio') || tabLower.includes('episode')) {
      const podcastVids = recentVideoList.filter(v => /podcast|episode|ep\s*\d|interview/i.test(v.title || ''))
      const listToUse = podcastVids.length > 0 ? podcastVids : recentVideoList.slice(0, 4)

      return (
        <div className={isMobile ? "p-3 space-y-3" : "p-6 space-y-4"}>
          <div className="flex items-center justify-between pb-2 border-b border-[#222634]">
            <h4 className="text-xs sm:text-sm font-bold text-white">Podcast Episodes</h4>
            {creatorUrl && (
              <a href={creatorUrl} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline flex items-center gap-1" style={{ color: styles.accent }}>
                <span>View on YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div className="space-y-3">
            {listToUse.map((ep, i) => (
              <div key={i} className="rounded-2xl border p-4 bg-[#12141c] border-[#222634] flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#161922] border border-[#222634] flex items-center justify-center flex-shrink-0">
                    <Headphones className="w-5 h-5" style={{ color: styles.accent }} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs sm:text-sm font-bold text-white truncate">{ep.title}</h5>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{ep.views || ''} {ep.published ? `· ${ep.published}` : ''}</span>
                  </div>
                </div>
                <a 
                  href={ep.url || (ep.videoId ? `https://www.youtube.com/watch?v=${ep.videoId}` : creatorUrl)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 text-slate-300 hover:text-white bg-[#161922] border-[#222634] flex-shrink-0"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Listen</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )
    }

    // 6. LIVE AMAS TAB (ONLY IF LIVE)
    if (tabLower.includes('live') || tabLower.includes('event') || tabLower.includes('ama')) {
      return (
        <div className={isMobile ? "p-3 space-y-3.5" : "p-6 space-y-4"}>
          <div className="rounded-2xl border p-5 bg-[#12141c] border-[#222634] shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">Live Stage & Broadcasts</span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-white">
              {topVideoTitle ? `Live Stream: ${topVideoTitle}` : `${creatorName} Live Community Broadcast`}
            </h4>
            <p className="text-xs text-slate-300">
              Join the live stream on YouTube and connect with fellow viewers in real time.
            </p>
            {creatorUrl && (
              <a 
                href={creatorUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition text-white bg-red-600 hover:bg-red-500"
              >
                <span>Open YouTube Live</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )
    }

    // Fallback for Products / other tabs
    return (
      <div className="p-8 text-center text-slate-400 space-y-2">
        <p className="text-xs font-medium text-white">{activeTab}</p>
        <p className="text-xs text-slate-400">Content directly connected to {creatorName}'s channel.</p>
        {creatorUrl && (
          <a 
            href={creatorUrl}
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs hover:underline mt-2"
            style={{ color: styles.accent }}
          >
            <span>Visit channel on YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
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
              {blueprint.name}
            </h3>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              {creatorData?.description 
                ? (creatorData.description.length > 100 ? creatorData.description.slice(0, 100) + '...' : creatorData.description)
                : 'Official community space and latest video releases.'}
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
            <p className="text-xs text-slate-400 mt-1">
              {creatorData?.niche ? `${creatorData.niche} · ` : ''}Official Member Space & Video Hub
            </p>
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
            {creatorData?.description 
              ? (creatorData.description.length > 220 ? creatorData.description.slice(0, 220) + '...' : creatorData.description)
              : `Connect with fellow members, explore official releases, and participate in community discussions with ${creatorName}.`}
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

  const creatorUrl = getCreatorChannelUrl(creatorData)
  const cleanCreatorUrlDisplay = creatorUrl.replace(/^https?:\/\/(www\.)?/, '')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage('')
    }, 2800)
  }

  const [currentBlueprint, setCurrentBlueprint] = useState(() => {
    const rawBp = creatorData.blueprint
    const isEdu = isEducationalCreator(creatorData)
    const creatorName = creatorData.name || creatorData.handle?.replace('@', '') || 'Creator'

    if (rawBp && !isEdu && (rawBp.name?.includes('Masterclass') || rawBp.name?.includes('Academy') || rawBp.type === 'Course Platform')) {
      return {
        ...rawBp,
        name: `${creatorName}'s Community Hub`,
        type: 'Membership Community',
        preview: 'community',
        features: ['Community forum', 'Member discussions', 'Video releases', 'Official announcements']
      }
    }
    return rawBp || {
      name: `${creatorName}'s Space`,
      type: 'Membership',
      preview: 'community',
      features: ['Community forum', 'Member discussions', 'Video releases', 'Official announcements']
    }
  })

  const [viewMode, setViewMode] = useState('desktop') // 'desktop' | 'mobile'
  const isMobileView = viewMode === 'mobile'
  const [extraTabs, setExtraTabs] = useState(() => creatorData.extraTabs || [])
  const [localFeatures, setLocalFeatures] = useState(() => {
    const isEdu = isEducationalCreator(creatorData)
    if (!isEdu && currentBlueprint.features?.some(f => f.includes('Course') || f.includes('worksheet') || f.includes('Certificate'))) {
      return ['Community forum', 'Member discussions', 'Video releases', 'Official announcements']
    }
    return currentBlueprint.features || ['Community forum', 'Member discussions', 'Video releases', 'Official announcements']
  })

  const analyzedTabs = getAnalyzedTabsForCreator(creatorData, currentBlueprint, extraTabs)
  const [activeTab, setActiveTab] = useState(() => analyzedTabs[0] || 'Community')

  useEffect(() => {
    if (!analyzedTabs.includes(activeTab)) {
      setActiveTab(analyzedTabs[0] || 'Community')
    }
  }, [analyzedTabs, activeTab])

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
      setActiveTab('Community')

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

    let updatedFeatures = [...localFeatures]
    let updatedTabs = [...extraTabs]
    let updatedTheme = theme
    let updatedViewMode = viewMode

    if (p.includes('premium')) {
      updatedTheme = 'premium'
      setTheme('premium')
      if (!updatedFeatures.includes('Exclusive perks')) updatedFeatures.push('Exclusive perks')
      if (!updatedFeatures.includes('Tiered memberships')) updatedFeatures.push('Tiered memberships')
    } else if (p.includes('minimalist') || p.includes('minimal')) {
      updatedTheme = 'minimalist'
      setTheme('minimalist')
    } else if (p.includes('women') || p.includes('female') || p.includes('feminine') || p.includes('rose') || p.includes('25')) {
      updatedTheme = 'feminine'
      setTheme('feminine')
    } else if (p.includes('light') || p.includes('paper')) {
      updatedTheme = 'light'
      setTheme('light')
    } else if (p.includes('dark') || p.includes('graphite')) {
      updatedTheme = 'dark'
      setTheme('dark')
    }

    if (p.includes('community')) {
      setActiveTab('Community')
      if (!updatedFeatures.includes('Community forum')) updatedFeatures.push('Community forum')
      if (!updatedFeatures.includes('Member discussions')) updatedFeatures.push('Member discussions')
    }

    if (p.includes('mobile') || p.includes('phone') || p.includes('handheld')) {
      updatedViewMode = 'mobile'
      setViewMode('mobile')
    } else if (p.includes('desktop') || p.includes('web')) {
      updatedViewMode = 'desktop'
      setViewMode('desktop')
    }

    if (p.includes('podcast')) {
      if (!updatedTabs.includes('Podcast')) updatedTabs.push('Podcast')
      if (!updatedFeatures.includes('Podcast section')) updatedFeatures.push('Podcast section')
      setActiveTab('Podcast')
    }

    if (p.includes('live') || p.includes('ama') || p.includes('stream') || p.includes('event')) {
      if (!updatedTabs.includes('Live AMAs')) updatedTabs.push('Live AMAs')
      if (!updatedFeatures.includes('Live events & AMAs')) updatedFeatures.push('Live events & AMAs')
      setActiveTab('Live AMAs')
    }

    if (p.includes('product') || p.includes('store') || p.includes('merch') || p.includes('download')) {
      if (!updatedTabs.includes('Products')) updatedTabs.push('Products')
      if (!updatedFeatures.includes('Digital products & store')) updatedFeatures.push('Digital products & store')
      setActiveTab('Products')
    }

    setLocalFeatures(updatedFeatures)
    setExtraTabs(updatedTabs)

    const updatedBp = {
      ...currentBlueprint,
      features: updatedFeatures
    }
    setCurrentBlueprint(updatedBp)

    const updatedData = {
      ...creatorData,
      blueprint: updatedBp,
      productName: updatedBp.name,
      features: updatedFeatures,
      extraTabs: updatedTabs,
      theme: updatedTheme,
      viewMode: updatedViewMode,
      isMobileView: updatedViewMode === 'mobile'
    }
    updateCreator(updatedData)
    try {
      localStorage.setItem('forge_creator_data', JSON.stringify(updatedData))
    } catch {}
  }

  const handleToggleFeature = (label) => {
    let updatedFeatures;
    let updatedTabs = [...extraTabs];
    
    const matchedPreset = CAPABILITY_PRESETS.find(p => 
      p.label === label || 
      label.toLowerCase().includes(p.label.toLowerCase()) ||
      (p.tab && label.toLowerCase().includes(p.tab.toLowerCase()))
    );
    const tabName = matchedPreset?.tab;

    if (localFeatures.includes(label)) {
      updatedFeatures = localFeatures.filter(f => f !== label);
      if (tabName && updatedTabs.includes(tabName)) {
        updatedTabs = updatedTabs.filter(t => t !== tabName);
        if (activeTab === tabName) setActiveTab('Community');
      }
      showToast(`Removed "${label}" from build`);
    } else {
      updatedFeatures = [...localFeatures, label];
      if (tabName && !updatedTabs.includes(tabName)) {
        updatedTabs.push(tabName);
        setActiveTab(tabName);
      }
      showToast(`Added "${label}" to build`);
    }

    setLocalFeatures(updatedFeatures);
    setExtraTabs(updatedTabs);

    const updatedBp = { ...currentBlueprint, features: updatedFeatures };
    setCurrentBlueprint(updatedBp);

    const updatedData = {
      ...creatorData,
      blueprint: updatedBp,
      features: updatedFeatures,
      extraTabs: updatedTabs,
      productName: updatedBp.name
    };
    updateCreator(updatedData);
    try {
      localStorage.setItem('forge_creator_data', JSON.stringify(updatedData));
    } catch {}
  };

  const handlePromptSend = () => {
    if (!prompt.trim()) return
    setIsRegenerating(true)
    showToast("Applying custom modification...")
    setAppliedPrompts(prev => [...prev, prompt])
    const currentPrompt = prompt
    setPrompt('')
    
    setTimeout(() => {
      processPrompt(currentPrompt)
      setIsRegenerating(false)
      showToast("Build architecture updated!")
    }, 400)
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
    }, 400)
  }

  const handleChipClick = (chip) => {
    setIsRegenerating(true)
    showToast(`Applying "${chip}"...`)

    setTimeout(() => {
      processPrompt(chip)
      if (!appliedPrompts.includes(chip)) {
        setAppliedPrompts(prev => [...prev, chip])
      }
      setIsRegenerating(false)
      showToast(`Applied: "${chip}"`)
    }, 350)
  }

  const removeAppliedPrompt = (promptText) => {
    setIsRegenerating(true)
    setTimeout(() => {
      setAppliedPrompts(prev => prev.filter(x => x !== promptText))
      const p = promptText.toLowerCase()
      
      let updatedFeatures = [...localFeatures]
      let updatedTabs = [...extraTabs]

      if (p.includes('premium') || p.includes('minimalist') || p.includes('minimal') || 
          p.includes('women') || p.includes('female') || p.includes('feminine') || p.includes('rose') || p.includes('25') ||
          p.includes('light') || p.includes('paper') || p.includes('dark') || p.includes('graphite')) {
        setTheme('dark')
      }

      if (p.includes('mobile') || p.includes('phone') || p.includes('handheld')) {
        setViewMode('desktop')
      }

      if (p.includes('podcast')) {
        updatedTabs = updatedTabs.filter(x => x !== 'Podcast')
        updatedFeatures = updatedFeatures.filter(x => !x.toLowerCase().includes('podcast'))
        setExtraTabs(updatedTabs)
        setLocalFeatures(updatedFeatures)
        setActiveTab('Community')
      }

      if (p.includes('live') || p.includes('ama') || p.includes('event')) {
        updatedTabs = updatedTabs.filter(x => x !== 'Live AMAs')
        updatedFeatures = updatedFeatures.filter(x => !x.toLowerCase().includes('live') && !x.toLowerCase().includes('ama') && !x.toLowerCase().includes('event'))
        setExtraTabs(updatedTabs)
        setLocalFeatures(updatedFeatures)
        setActiveTab('Community')
      }

      if (p.includes('product') || p.includes('store') || p.includes('merch')) {
        updatedTabs = updatedTabs.filter(x => x !== 'Products')
        updatedFeatures = updatedFeatures.filter(x => !x.toLowerCase().includes('product') && !x.toLowerCase().includes('store') && !x.toLowerCase().includes('merch'))
        setExtraTabs(updatedTabs)
        setLocalFeatures(updatedFeatures)
        setActiveTab('Community')
      }

      const updatedBp = { ...currentBlueprint, features: updatedFeatures }
      setCurrentBlueprint(updatedBp)

      const updatedData = {
        ...creatorData,
        blueprint: updatedBp,
        features: updatedFeatures,
        extraTabs: updatedTabs
      }
      updateCreator(updatedData)
      try {
        localStorage.setItem('forge_creator_data', JSON.stringify(updatedData));
      } catch {}

      setIsRegenerating(false)
      showToast("Refinement removed")
    }, 350)
  }

  const handleSwitchView = (mode) => {
    setViewMode(mode)
    if (mode === 'desktop') {
      setAppliedPrompts(prev => prev.filter(p => !p.toLowerCase().includes('mobile')))
      showToast("Switched to Member Web preview")
    } else if (mode === 'mobile') {
      showToast("Switched to Member Mobile preview")
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
        </div>

        {/* Right Header Badges & Actions */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
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
                <a 
                  href={creatorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#0b0c10] hover:bg-[#161922] border border-[#222634] hover:border-slate-600 rounded-lg px-4 py-1.5 text-xs text-slate-300 text-center truncate flex items-center justify-center space-x-2 shadow-inner transition cursor-pointer group"
                  title="Open Creator Channel on YouTube"
                >
                  <Lock className="w-3 h-3 flex-shrink-0" style={{ color: dynamicAccent }} />
                  <span id="browser-url" className="truncate font-mono group-hover:underline" style={{ color: dynamicAccent }}>
                    {cleanCreatorUrlDisplay}
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-slate-300 flex-shrink-0" />
                </a>
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
          <div className="bg-[#12141c] border border-[#222634] rounded-2xl p-5 shadow-lg flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">What's Included</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Active capabilities configured for your build</p>
              </div>
              <span 
                className="text-[10px] px-2.5 py-1 rounded-lg font-mono font-bold border"
                style={{ 
                  background: dynamicAccentBg, 
                  color: dynamicAccent,
                  borderColor: dynamicAccentBorder
                }}
              >
                {localFeatures.length} Active
              </span>
            </div>

            {/* Active modules list with interactive toggles */}
            <div className="space-y-2">
              {localFeatures.map(label => {
                const matched = FEATURES.find(f => f.label.toLowerCase() === label.toLowerCase()) ||
                                CAPABILITY_PRESETS.find(p => p.label.toLowerCase() === label.toLowerCase())
                const Icon = matched ? matched.icon : Layout
                return (
                  <div 
                    key={label} 
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#161922] border border-[#222634] hover:border-slate-700 transition group"
                  >
                    <div className="flex items-center space-x-3 min-w-0 pr-2">
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shadow-sm border flex-shrink-0"
                        style={{ 
                          background: dynamicAccentBg, 
                          color: dynamicAccent,
                          borderColor: dynamicAccentBorder
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-medium text-slate-200 truncate">{label}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleFeature(label)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer flex-shrink-0"
                      title={`Remove "${label}" from build`}
                    >
                      <X className="w-3.5 h-3.5 group-hover:block hidden" />
                      <Check className="w-3.5 h-3.5 text-emerald-400 group-hover:hidden block" />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Available Capabilities that can be added */}
            {(() => {
              const unadded = CAPABILITY_PRESETS.filter(p => 
                !localFeatures.some(f => f.toLowerCase() === p.label.toLowerCase() || f.toLowerCase().includes(p.label.toLowerCase()))
              )
              if (unadded.length === 0) return null
              return (
                <div className="pt-3 border-t border-[#222634]/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Add More Modules
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Click to include
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {unadded.map(preset => {
                      const PresetIcon = preset.icon
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleToggleFeature(preset.label)}
                          className="w-full flex items-center justify-between p-2 rounded-xl bg-[#161922]/50 hover:bg-[#161922] border border-[#222634]/60 hover:border-slate-600 transition text-left group cursor-pointer"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs bg-[#12141c] border border-[#222634] text-slate-400 group-hover:text-white transition flex-shrink-0">
                              <PresetIcon className="w-3 h-3" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-medium text-slate-300 group-hover:text-white block truncate">
                                {preset.label}
                              </span>
                              <span className="text-[10px] text-slate-500 block truncate">
                                {preset.desc}
                              </span>
                            </div>
                          </div>
                          <div 
                            className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition border group-hover:scale-105"
                            style={{ 
                              background: dynamicAccentBg, 
                              color: dynamicAccent,
                              borderColor: dynamicAccentBorder
                            }}
                          >
                            <Plus className="w-3 h-3" />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Refine with Forge Card */}
          <div className="bg-[#12141c] border border-[#222634] rounded-2xl p-5 shadow-lg flex flex-col flex-1 justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
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
              <p className="text-xs text-slate-400 mb-3.5 leading-relaxed">
                Click any refinement chip or type custom commands to instantly tailor your application build.
              </p>
              
              {/* Interactive Dynamic Prompt Chips */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {QUICK_PROMPTS.map(chip => {
                  const isChipApplied = appliedPrompts.includes(chip)
                  const isPodcastChip = chip.toLowerCase().includes('podcast') && localFeatures.some(f => f.toLowerCase().includes('podcast'))
                  const isLiveChip = chip.toLowerCase().includes('live') && localFeatures.some(f => f.toLowerCase().includes('live') || f.toLowerCase().includes('ama'))
                  const isStoreChip = chip.toLowerCase().includes('store') && localFeatures.some(f => f.toLowerCase().includes('store') || f.toLowerCase().includes('product'))
                  const isMobileChip = chip.toLowerCase().includes('mobile') && viewMode === 'mobile'
                  const isCommunityChip = chip.toLowerCase().includes('community') && activeTab === 'Community'
                  const isPremiumChip = chip.toLowerCase().includes('premium') && theme === 'premium'
                  const isMinimalistChip = chip.toLowerCase().includes('minimalist') && theme === 'minimalist'

                  const isActive = isChipApplied || isPodcastChip || isLiveChip || isStoreChip || isMobileChip || isCommunityChip || isPremiumChip || isMinimalistChip

                  return (
                    <button 
                      key={chip}
                      type="button"
                      onClick={() => {
                        if (isActive) {
                          removeAppliedPrompt(chip)
                        } else {
                          handleChipClick(chip)
                        }
                      }}
                      className="text-xs px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-1.5"
                      style={isActive ? {
                        background: dynamicAccentBg,
                        borderColor: dynamicAccentBorder,
                        color: dynamicAccent,
                        fontWeight: 600
                      } : {
                        background: '#161922',
                        borderColor: '#222634',
                        color: '#cbd5e1'
                      }}
                      title={isActive ? `Click to remove "${chip}"` : `Click to apply "${chip}"`}
                    >
                      {chip === 'Focus on community' && '👥 '}
                      {chip === 'More minimalist' && '⚪ '}
                      {chip === 'For women 25-34' && '🎯 '}
                      {chip === 'Mobile-first' && '📱 '}
                      {chip === 'Add a podcast section' && '🎙️ '}
                      {chip === 'Add live events' && '🔴 '}
                      {chip === 'Add digital store' && '🛍️ '}
                      <span>{chip}</span>
                      {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  )
                })}
              </div>

              {/* Input Area */}
              <div className="relative mb-3">
                <textarea 
                  rows={3} 
                  placeholder="Describe a change (e.g. Add podcast section, switch to mobile, add dark mode...)" 
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
                  type="button"
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
                type="button"
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
                type="button"
                onClick={() => {
                  const finalPayload = {
                    blueprint: {
                      ...currentBlueprint,
                      features: localFeatures
                    },
                    productName: currentBlueprint.name,
                    features: localFeatures,
                    theme,
                    isMobileView: viewMode === 'mobile',
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
