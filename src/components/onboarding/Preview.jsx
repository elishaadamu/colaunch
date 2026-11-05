import { useState, useEffect, useRef } from 'react'
import { useForge, getAccent } from '../../App'
import {
  ArrowRight, ArrowLeft, RefreshCw, Send, SlidersHorizontal, Check, Layout, Users,
  BarChart2, Settings, Radio, Play, Lock, MessageSquare, Calendar,
  Download, ShoppingBag, Laptop, Smartphone, Volume2, Award, RotateCcw, Trash2,
  Heart, MessageCircle, Share2, MoreHorizontal, Maximize2, Minimize2, Globe, Sparkles,
  Layers, Video, Star, CheckCircle2, ShieldCheck, Rocket, CheckCircle,
  Megaphone, Pin, Clock, Headphones, Pause, FastForward, Rewind, Paperclip, Smile,
  ChevronRight, ThumbsUp, Flame, Music, Eye, ExternalLink, Plus, X, Instagram
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

export function getPlatformInfo(platform) {
  const p = (platform || 'youtube').toLowerCase()
  if (p === 'instagram') {
    return {
      name: 'Instagram',
      exploreLabel: 'Explore Profile on Instagram',
      watchLabel: 'Watch on Instagram',
      viewLabel: 'View on Instagram',
      openLabel: 'Open in Instagram',
      feedLabel: 'Feed Vault & Curated Archive',
      releasesLabel: 'Latest Releases from',
      sourceComment: 'Instagram Comment',
      accent: '#E1306C'
    }
  }
  if (p === 'tiktok') {
    return {
      name: 'TikTok',
      exploreLabel: 'Explore Profile on TikTok',
      watchLabel: 'Watch on TikTok',
      viewLabel: 'View on TikTok',
      openLabel: 'Open in TikTok',
      feedLabel: 'TikTok Vault & Curated Feed',
      releasesLabel: 'Latest Releases from',
      sourceComment: 'TikTok Comment',
      accent: '#00F2FE'
    }
  }
  if (p === 'twitter' || p === 'x') {
    return {
      name: 'X (Twitter)',
      exploreLabel: 'Explore Profile on X',
      watchLabel: 'View on X',
      viewLabel: 'View on X',
      openLabel: 'Open in X',
      feedLabel: 'Posts & Discussion Archive',
      releasesLabel: 'Latest Releases from',
      sourceComment: 'X Reply',
      accent: '#1DA1F2'
    }
  }
  return {
    name: 'YouTube',
    exploreLabel: 'Explore Channel on YouTube',
    watchLabel: 'Watch on YouTube',
    viewLabel: 'View on YouTube',
    openLabel: 'Open in YouTube',
    feedLabel: 'Video Vault & Curated Archive',
    releasesLabel: 'Latest Releases from',
    sourceComment: 'YouTube Comment',
    accent: '#c81e3c'
  }
}

export function getCreatorChannelUrl(creatorData) {
  if (creatorData?.url && typeof creatorData.url === 'string' && creatorData.url.startsWith('http')) {
    return creatorData.url
  }
  const platform = (creatorData?.platform || 'youtube').toLowerCase()
  const rawH = creatorData?.handle || creatorData?.name || 'creator'
  const clean = rawH.replace(/^@+/, '').trim()

  if (platform === 'instagram') {
    return `https://www.instagram.com/${clean}/`
  }
  if (platform === 'tiktok') {
    return `https://www.tiktok.com/@${clean}`
  }
  if (platform === 'twitter' || platform === 'x') {
    return `https://x.com/${clean}`
  }
  return `https://www.youtube.com/@${clean}`
}

function getDynamicCommunityPosts(creatorName, blueprint, creatorData, channelComments = []) {
  const handleClean = (creatorData?.handle || creatorName || 'creator').replace('@', '').toLowerCase()
  const creatorDisplayName = (creatorData?.name || '').toLowerCase()
  const videos = creatorData?.recentPosts || creatorData?.videos || []
  const creatorUrl = getCreatorChannelUrl(creatorData)
  const platform = (creatorData?.platform || 'youtube').toLowerCase()
  const platformInfo = getPlatformInfo(platform)

  // Use strictly genuine audience comments scraped from Apify / social platform (no handcoded announcements)
  if (Array.isArray(channelComments) && channelComments.length > 0) {
    return channelComments.map((c, idx) => {
      const matchedVid = videos.find(v =>
        (v.title && c.videoTitle && v.title.toLowerCase().includes(c.videoTitle.toLowerCase())) ||
        (v.videoId && c.videoId && v.videoId === c.videoId)
      ) || (videos.length > 0 ? videos[idx % videos.length] : null)

      const vidTitle = c.videoTitle || matchedVid?.title || ''
      const defaultVidUrl = platform === 'instagram'
        ? (c.videoId ? `https://www.instagram.com/p/${c.videoId}/` : null)
        : (c.videoId ? `https://www.youtube.com/watch?v=${c.videoId}` : null)
      const vidUrl = c.videoUrl || c.url || defaultVidUrl || matchedVid?.url || creatorUrl

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
        time: c.published || c.time || platformInfo.sourceComment,
        source: platformInfo.sourceComment,
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
  const creatorName = creatorData.name || creatorData.handle?.replace('@', '') || 'Creator'
  const resolvedAvatar = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''
  const mrrVal = Math.round(parseFollowerCount(creatorData?.followers || 0) * 0.015 * 19)
  const cleanMrr = `$${mrrVal > 0 ? mrrVal.toLocaleString() : '8,420'}`

  const audienceStream = (Array.isArray(channelComments) && channelComments.length >= 1)
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
    : []

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
          { label: 'Channel Views', val: creatorData?.totalViews || 'Verified', badge: 'Total Impact', desc: 'Cumulative video views' },
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
                  Channel Comments (Live)
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

export function formatViewsString(val) {
  if (!val) return '';
  const s = String(val).trim();
  if (s === '0' || s === '0 views' || s === '0 view' || s === '0.0' || s === '0k' || s === '0M') return '';
  if (/views?$/i.test(s)) return s;
  return `${s} views`;
}

export function extractYouTubeId(video) {
  if (!video) return null;
  if (video.videoId && typeof video.videoId === 'string' && video.videoId.trim().length === 11) {
    return video.videoId.trim();
  }
  const candidates = [video.url, video.link, video.id, video.videoId, video.thumbnail];
  for (const c of candidates) {
    if (typeof c === 'string') {
      const match = c.match(/(?:v=|\/embed\/|youtu\.be\/|\/v\/|\/shorts\/|\/vi\/|\/vi_webp\/)([a-zA-Z0-9_-]{11})/);
      if (match && match[1]) return match[1];
    }
  }
  return null;
}

export function extractInstagramCode(video) {
  if (!video) return null;
  const candidates = [video.url, video.link, video.videoId, video.id, video.shortcode, video.shortCode, video.code];
  for (const c of candidates) {
    if (typeof c === 'string') {
      const match = c.match(/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i);
      if (match && match[1]) return match[1];
      if (/^[a-zA-Z0-9_-]{9,16}$/.test(c.trim()) && !['undefined', 'null', 'default', 'creator'].includes(c.trim())) {
        return c.trim();
      }
    }
  }
  return null;
}

export function VideoPlayerModal({ video, onClose, creatorData, dynamicAccent, isLight }) {
  if (!video) return null;

  const platform = (creatorData?.platform || 'youtube').toLowerCase();
  const platformInfo = getPlatformInfo(platform);
  const videoId = platform === 'youtube' ? extractYouTubeId(video) : null;
  const igShortcode = platform === 'instagram' ? extractInstagramCode(video) : null;
  const directVideoUrl = video.videoUrl || video.video_url || video.mediaUrl || (video.url && String(video.url).match(/\.(mp4|webm|mov)(\?|$)/i) ? video.url : null);
  const videoTitle = video.title || (platform === 'instagram' ? 'Instagram Post & Reel' : 'Official Channel Video');
  const creatorUrl = getCreatorChannelUrl(creatorData);
  const postUrl = video.url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : (igShortcode ? `https://www.instagram.com/p/${igShortcode}/` : creatorUrl));
  const thumbUrl = video.thumbnail || video.thumbnailUrl || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '');

  const [useEmbed, setUseEmbed] = useState(Boolean(igShortcode));
  const [embedError, setEmbedError] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#0d0f17] border border-[#232a3d] shadow-2xl flex flex-col overflow-hidden max-h-[92vh]"
        style={{ borderRadius: '0px' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="bg-[#131622] px-4 py-3 border-b border-[#232a3d] flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <span className="w-2 h-2 shrink-0 animate-pulse" style={{ backgroundColor: dynamicAccent }} />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 shrink-0">
              Live Preview · @{(creatorData?.handle || 'creator').replace('@', '')} on {platformInfo.name}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-bold text-white truncate">
              {videoTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {igShortcode && !directVideoUrl && (
              <div className="hidden sm:flex items-center bg-[#181c28] border border-[#252c40] p-0.5 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => { setUseEmbed(true); setEmbedError(false); }}
                  className={`px-2 py-0.5 transition cursor-pointer ${useEmbed && !embedError ? 'bg-[#22283a] text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Embed Player
                </button>
                <button
                  type="button"
                  onClick={() => setUseEmbed(false)}
                  className={`px-2 py-0.5 transition cursor-pointer ${!useEmbed || embedError ? 'bg-[#22283a] text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  Media View
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              style={{ borderRadius: '0px' }}
              title="Close viewer (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Player Frame / Media Stage */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {videoId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={videoTitle}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : directVideoUrl ? (
            <video
              src={directVideoUrl}
              poster={thumbUrl}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain bg-black"
            />
          ) : (igShortcode && useEmbed && !embedError) ? (
            <div className="w-full h-full relative bg-black flex items-center justify-center">
              <iframe
                src={`https://www.instagram.com/p/${igShortcode}/embed/`}
                title={videoTitle}
                className="w-full h-full border-0 bg-black"
                allowFullScreen
                scrolling="no"
                onError={() => setEmbedError(true)}
              />
            </div>
          ) : (
            <div className="w-full h-full relative flex items-center justify-center bg-[#07090e]">
              {thumbUrl ? (
                <img
                  src={thumbUrl}
                  alt={videoTitle}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain select-none"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                  <Video className="w-12 h-12" />
                  <span className="text-xs font-mono">{platformInfo.name} Media</span>
                </div>
              )}

              {/* Bottom Transparent Caption Bar — Clean, readable, does not obscure the media */}
              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/95 via-black/75 to-transparent flex flex-col justify-end">
                <div className="max-w-3xl space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span 
                      className="text-[10px] font-bold font-mono px-2 py-0.5 uppercase tracking-wider text-white"
                      style={{ background: platformInfo.accent || dynamicAccent }}
                    >
                      {platformInfo.name}
                    </span>
                    {formatViewsString(video.views) && (
                      <span className="text-[11px] font-mono text-slate-300">
                        {formatViewsString(video.views)}
                      </span>
                    )}
                    {video.likes && (
                      <span className="text-[11px] font-mono text-slate-300">
                        · {String(video.likes).includes('like') ? video.likes : `${video.likes} likes`}
                      </span>
                    )}
                    {video.comments && (
                      <span className="text-[11px] font-mono text-slate-300">
                        · {String(video.comments).includes('comment') ? video.comments : `${video.comments} comments`}
                      </span>
                    )}
                  </div>
                  <p className={`text-xs text-slate-200 leading-relaxed font-normal ${showFullCaption ? '' : 'line-clamp-2'}`}>
                    {videoTitle}
                  </p>
                  {videoTitle.length > 120 && (
                    <button
                      type="button"
                      onClick={() => setShowFullCaption(!showFullCaption)}
                      className="text-[11px] font-semibold text-white/80 hover:text-white underline cursor-pointer"
                    >
                      {showFullCaption ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Modal Metadata & Actions */}
        <div className="bg-[#10131d] px-4 py-3 border-t border-[#1f2433] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400 flex-wrap">
            {formatViewsString(video.views) ? (
              <span>{formatViewsString(video.views)}</span>
            ) : video.likes ? (
              <span>{String(video.likes).includes('like') ? video.likes : `${video.likes} likes`}</span>
            ) : null}
            {video.comments && (
              <>
                <span>·</span>
                <span>{String(video.comments).includes('comment') ? video.comments : `${video.comments} comments`}</span>
              </>
            )}
            {video.published && (
              <>
                <span>·</span>
                <span>{video.published}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {postUrl && (
              <a
                href={postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 text-xs font-semibold text-white transition flex items-center gap-1.5 hover:brightness-110"
                style={{ background: platformInfo.accent || dynamicAccent, borderRadius: '0px' }}
              >
                {platform === 'instagram' && <Instagram className="w-3.5 h-3.5" />}
                <span>{platformInfo.watchLabel}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white bg-[#171b28] hover:bg-[#1f2538] border border-[#23293a] transition cursor-pointer"
              style={{ borderRadius: '0px' }}
            >
              Done Playing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductLandingPage({
  styles,
  creatorData,
  blueprint,
  onSwitchToProduct,
  channelComments = [],
  isMobile = false,
  onPlayVideo
}) {
  const accent = getAccent(creatorData)
  const dynamicAccent = accent.color
  const dynamicAccentBg = `rgba(${accent.rgb}, 0.12)`
  const dynamicAccentBorder = `rgba(${accent.rgb}, 0.28)`
  const isLight = isLightColor(dynamicAccent)

  const creatorName = creatorData?.name || creatorData?.handle?.replace('@', '') || 'Creator'
  const handleClean = (creatorData?.handle || creatorName || 'creator').replace('@', '').toLowerCase()
  const resolvedAvatar = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''
  const niche = creatorData?.niche || 'Digital Content'
  const productName = blueprint?.name || `${creatorName}'s Resource Hub`
  const platform = (creatorData?.platform || 'youtube').toLowerCase()
  const platformInfo = getPlatformInfo(platform)
  const creatorUrl = getCreatorChannelUrl(creatorData)

  const scrollContainerRef = useRef(null)
  const navRef = useRef(null)

  // Real Scraped Videos / Posts
  const recentVideoList = Array.isArray(creatorData?.recentPosts) && creatorData.recentPosts.length > 0
    ? creatorData.recentPosts
    : Array.isArray(creatorData?.videos) && creatorData.videos.length > 0
      ? creatorData.videos
      : []

  const topVideo = recentVideoList[0] || null
  const topVideoTitle = topVideo?.title || `${creatorName} Masterclass & Foundations`
  const topVideoThumb = topVideo?.thumbnail || (topVideo?.videoId ? (platform === 'youtube' ? `https://i.ytimg.com/vi/${topVideo.videoId}/hqdefault.jpg` : '') : '')
  const topVideoUrl = topVideo?.url || (topVideo?.videoId ? (platform === 'instagram' ? `https://www.instagram.com/p/${topVideo.videoId}/` : `https://www.youtube.com/watch?v=${topVideo.videoId}`) : creatorUrl)

  // Real Scraped Comments from Channel (Strictly Genuine — Zero Fake Comments)
  const communityComments = (Array.isArray(channelComments) && channelComments.length > 0)
    ? channelComments.slice(0, 6)
    : (Array.isArray(creatorData?.comments) && creatorData.comments.length > 0)
      ? creatorData.comments.slice(0, 6)
      : []

  // Headline & Subtitle
  const heroHeadline = blueprint?.tagline || `The Ultimate Resource Hub for ${creatorName}'s Community`
  const heroSubtitle = creatorData?.description
    ? (creatorData.description.length > 180 ? creatorData.description.slice(0, 180) + '...' : creatorData.description)
    : `Curated masterclasses, downloadable study frameworks, and a private discussion space hosted directly by ${creatorName}.`

  // Controlled Section Scrolling (Pin-point accuracy without jumping window or showing prior section)
  const scrollToSection = (sectionId) => (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const cleanId = sectionId.replace('#', '')
    const target = document.getElementById(cleanId)
    if (!target) return

    const nav = navRef.current
    const navHeight = nav ? nav.offsetHeight : 58

    // 1. Look for scrollable parent container (e.g. Dashboard Live App Preview or Onboarding preview container)
    const scrollParent = target.closest('.overflow-y-auto') || scrollContainerRef.current
    if (scrollParent && scrollParent !== document.body && scrollParent !== document.documentElement) {
      const parentRect = scrollParent.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const targetPos = scrollParent.scrollTop + (targetRect.top - parentRect.top) - navHeight
      scrollParent.scrollTo({
        top: Math.max(0, targetPos),
        behavior: 'smooth'
      })
      return
    }

    // 2. Main window smooth scroll fallback
    const targetDocumentTop = window.pageYOffset + target.getBoundingClientRect().top
    const targetWindowY = targetDocumentTop - navHeight
    window.scrollTo({
      top: Math.max(0, targetWindowY),
      behavior: 'smooth'
    })
  }

  const scrollToTop = (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const nav = navRef.current
    const scrollParent = nav ? nav.closest('.overflow-y-auto') : null
    if (scrollParent && scrollParent !== document.body && scrollParent !== document.documentElement) {
      scrollParent.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="w-full flex flex-col bg-[#0a0c12] text-slate-100 selection:bg-rose-500/20 relative min-h-0 rounded-none">

      {/* 1. Navbar - PERMANENTLY STICKY TO THE TOP */}
      <nav
        ref={navRef}
        className={`border-b border-[#1f2433] bg-[#0c0e16]/98 backdrop-blur-md sticky top-0 z-40 flex-shrink-0 flex items-center justify-between w-full shadow-xl ${isMobile ? 'px-3 py-2.5' : 'px-6 py-3.5'
          }`}
      >
        <div
          onClick={scrollToTop}
          className="flex items-center gap-3 min-w-0 cursor-pointer group"
          title="Back to top"
        >
          <div
            className="w-8 h-8 rounded-none flex items-center justify-center font-black text-xs border overflow-hidden relative flex-shrink-0 group-hover:scale-105 transition-transform"
            style={{ background: dynamicAccent, borderColor: dynamicAccent, color: '#ffffff' }}
          >
            {resolvedAvatar ? (
              <img src={resolvedAvatar} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : (
              <span>{creatorName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0">
            <span className="font-bold text-sm text-white truncate block leading-tight group-hover:text-slate-200 transition-colors">
              {productName}
            </span>
            <span className="text-[10px] text-slate-400 font-mono block">
              @{handleClean} · Official Platform
            </span>
          </div>
        </div>

        {/* Anchor Links with Controlled Scroll */}
        {!isMobile && (
          <div className="hidden lg:flex items-center gap-4 xl:gap-6 text-xs font-semibold text-slate-300 shrink-0">
            <button
              type="button"
              onClick={scrollToSection('#featured')}
              className="hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs font-semibold text-slate-300 whitespace-nowrap shrink-0"
            >
              Featured Video
            </button>
            <button
              type="button"
              onClick={scrollToSection('#archive')}
              className="hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs font-semibold text-slate-300 whitespace-nowrap shrink-0"
            >
              Video Archive
            </button>
            <button
              type="button"
              onClick={scrollToSection('#discussions')}
              className="hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs font-semibold text-slate-300 whitespace-nowrap shrink-0"
            >
              Community Voices
            </button>
            <button
              type="button"
              onClick={scrollToSection('#resources')}
              className="hover:text-white transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs font-semibold text-slate-300 whitespace-nowrap shrink-0"
            >
              Resources
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onSwitchToProduct}
            className="px-3.5 py-1.5 text-xs font-bold border border-[#222634] text-slate-300 hover:text-white bg-[#141824] hover:bg-[#1b2030] transition cursor-pointer rounded-none flex items-center gap-1.5"
            title="Preview inside member area"
          >
            <Layers className="w-3.5 h-3.5" style={{ color: dynamicAccent }} />
            <span>Member Area</span>
          </button>
          <button
            type="button"
            onClick={onSwitchToProduct}
            className="px-4 py-1.5 text-xs font-bold transition shadow-sm cursor-pointer rounded-none flex items-center gap-1 text-white"
            style={{
              background: dynamicAccent,
              borderRadius: '0px'
            }}
          >
            <span>Get Access</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </nav>

      {/* 2. Scrollable Page Content Container */}
      <div
        ref={scrollContainerRef}
        className="w-full relative selection:bg-rose-500/20"
      >

        {/* 2. Content-First Hero Section with Creator Identity (Solid Flat Dark, Zero Gradients) */}
        <section className={`relative overflow-hidden border-b border-[#1f2433] ${isMobile ? 'p-4' : 'p-8 sm:p-12'} text-center`}
          style={{
            background: '#0c0e16'
          }}
        >
          <div className="max-w-4xl mx-auto space-y-4 relative z-10">

            {/* Creator Channel Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#141824] border border-[#232a3d] text-slate-300 text-[11px] font-mono uppercase tracking-wider rounded-none">
              <span className="w-2 h-2" style={{ backgroundColor: dynamicAccent }} />
              <span>Official Video & Resource Hub · @{handleClean}</span>
            </div>

            {/* Headline */}
            <h1 className={`font-black text-white tracking-tight leading-tight ${isMobile ? 'text-xl' : 'text-3xl sm:text-4xl lg:text-5xl'}`}>
              {heroHeadline}
            </h1>

            {/* Subtitle */}
            <p className={`text-slate-300 leading-relaxed max-w-2xl mx-auto ${isMobile ? 'text-xs' : 'text-sm sm:text-base'}`}>
              {heroSubtitle}
            </p>

            {/* Real Channel Stats (No fake A B C D boxes!) */}
            <div className="pt-2 pb-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-300">
              {creatorData?.followers && (
                <div className="px-3 py-1.5 bg-[#141824] border border-[#222634] flex items-center gap-2">
                  <span className="text-white font-bold">{creatorData.followers}</span>
                  <span className="text-slate-400">Subscribers</span>
                </div>
              )}
              {recentVideoList.length > 0 && (
                <div className="px-3 py-1.5 bg-[#141824] border border-[#222634] flex items-center gap-2">
                  <span className="text-white font-bold">{creatorData?.videoCount || recentVideoList.length}</span>
                  <span className="text-slate-400">Curated Videos</span>
                </div>
              )}
              {creatorData?.totalViews && (
                <div className="px-3 py-1.5 bg-[#141824] border border-[#222634] flex items-center gap-2">
                  <span className="text-white font-bold">{creatorData.totalViews}</span>
                  <span className="text-slate-400">Channel Views</span>
                </div>
              )}
            </div>

            {/* Direct Outcome CTAs (NO $/mo!) */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onSwitchToProduct}
                className="w-full sm:w-auto px-7 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition shadow-lg cursor-pointer rounded-none flex items-center justify-center gap-2 text-white"
                style={{
                  background: dynamicAccent,
                  boxShadow: `0 4px 18px rgba(${accent.rgb}, 0.25)`,
                  borderRadius: '0px'
                }}
              >
                <span>Explore Platform & Videos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {topVideo ? (
                <button
                  type="button"
                  onClick={() => onPlayVideo ? onPlayVideo(topVideo) : onSwitchToProduct()}
                  className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-semibold border border-[#2a3248] text-slate-300 hover:text-white bg-[#141824] hover:bg-[#1b2234] transition cursor-pointer rounded-none flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" style={{ color: dynamicAccent }} />
                  <span>Play Featured Video</span>
                </button>
              ) : null}
            </div>

          </div>
        </section>

        {/* 3. Featured Masterclass / Top Video Showcase */}
        {topVideo && (
          <section id="featured" className={`border-b border-[#1f2433] ${isMobile ? 'p-4' : 'p-8 sm:p-12'} bg-[#0e111a] scroll-mt-[58px]`}>
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2" style={{ backgroundColor: dynamicAccent }} />
                    Featured Channel Video
                  </span>
                  <h3 className="text-base sm:text-xl font-bold text-white mt-1">
                    {topVideoTitle}
                  </h3>
                </div>
                {creatorUrl && (
                  <a
                    href={topVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono hover:underline flex items-center gap-1 text-slate-400 hover:text-white shrink-0"
                  >
                    <span>{platformInfo.watchLabel}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Cinematic Video Player Mockup */}
              <div className="relative aspect-video w-full bg-[#141824] border border-[#222634] overflow-hidden group shadow-2xl">
                {topVideoThumb ? (
                  <img
                    src={topVideoThumb}
                    alt={topVideoTitle}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#111420]">
                    <Video className="w-12 h-12 text-slate-600" />
                  </div>
                )}

                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => onPlayVideo ? onPlayVideo(topVideo) : onSwitchToProduct()}
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 cursor-pointer"
                    style={{ background: dynamicAccent, color: '#ffffff' }}
                    title="Play video in preview"
                  >
                    <Play className="w-7 h-7 fill-current ml-1 text-white" />
                  </button>
                </div>

                {/* Bottom Video Meta Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
                  <div className="flex items-center gap-3 font-mono">
                    {formatViewsString(topVideo.views) ? (
                      <span>{formatViewsString(topVideo.views)}</span>
                    ) : topVideo.likes ? (
                      <span>{String(topVideo.likes).includes('like') ? topVideo.likes : `${topVideo.likes} likes`}</span>
                    ) : null}
                    {topVideo.likes && formatViewsString(topVideo.views) && (
                      <>
                        <span>·</span>
                        <span>{topVideo.likes} likes</span>
                      </>
                    )}
                    {topVideo.published && (
                      <>
                        <span>·</span>
                        <span>{topVideo.published}</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onPlayVideo ? onPlayVideo(topVideo) : onSwitchToProduct()}
                    className="text-xs font-semibold px-3 py-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer"
                  >
                    Play in Preview →
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. Curated Video Archive Grid (Show Their Videos!) */}
        {recentVideoList.length > 0 && (
          <section id="archive" className={`border-b border-[#1f2433] ${isMobile ? 'p-4' : 'p-8 sm:p-12'} bg-[#0b0d13] scroll-mt-[58px]`}>
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    {platformInfo.feedLabel}
                  </span>
                  <h3 className="text-lg sm:text-2xl font-bold text-white mt-0.5">
                    Latest Releases from @{handleClean}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Organized by topic with zero advertising interruptions.
                  </p>
                </div>
                {creatorUrl && (
                  <a
                    href={creatorUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono hover:underline flex items-center gap-1.5 self-start sm:self-auto"
                    style={{ color: dynamicAccent }}
                  >
                    <span>{platformInfo.exploreLabel}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {recentVideoList.slice(0, 6).map((v, idx) => {
                  const vidThumb = v.thumbnail || (v.videoId ? (platform === 'youtube' ? `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg` : '') : '')
                  const vidLink = v.url || (v.videoId ? (platform === 'instagram' ? `https://www.instagram.com/p/${v.videoId}/` : `https://www.youtube.com/watch?v=${v.videoId}`) : creatorUrl)
                  return (
                    <div
                      key={idx}
                      className="bg-[#121520] border border-[#1f2433] hover:border-slate-700 transition overflow-hidden flex flex-col justify-between group shadow-sm"
                    >
                      <div>
                        {/* Thumbnail Clickable */}
                        <div
                          onClick={() => onPlayVideo ? onPlayVideo(v) : onSwitchToProduct()}
                          className="relative aspect-video w-full bg-[#161a26] overflow-hidden flex items-center justify-center cursor-pointer group/thumb"
                          title="Click to play video in preview modal"
                        >
                          {vidThumb ? (
                            <img
                              src={vidThumb}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Video className="w-8 h-8 text-slate-600" />
                          )}
                          <div className="absolute inset-0 bg-black/35 group-hover/thumb:bg-black/20 transition-colors flex items-center justify-center">
                            <div
                              className="w-12 h-12 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover/thumb:scale-110"
                              style={{ background: dynamicAccent, color: '#ffffff' }}
                            >
                              <Play className="w-6 h-6 fill-current ml-0.5 text-white" />
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-3.5 space-y-1.5">
                          <h5
                            onClick={() => onPlayVideo ? onPlayVideo(v) : onSwitchToProduct()}
                            className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug hover:underline cursor-pointer"
                          >
                            {v.title}
                          </h5>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono flex-wrap">
                            {formatViewsString(v.views) ? (
                              <span>{formatViewsString(v.views)}</span>
                            ) : v.likes ? (
                              <span>{String(v.likes).includes('like') ? v.likes : `${v.likes} likes`}</span>
                            ) : null}
                            {v.comments && (
                              <>
                                <span>·</span>
                                <span>{String(v.comments).includes('comment') ? v.comments : `${v.comments} comments`}</span>
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

                      {/* Actions */}
                      <div className="p-3 pt-0 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onPlayVideo ? onPlayVideo(v) : onSwitchToProduct()}
                          className="flex-1 py-1.5 text-[11px] font-semibold bg-[#171b28] hover:bg-[#1f2538] border border-[#23293a] text-slate-300 hover:text-white transition text-center cursor-pointer"
                        >
                          Play in Preview
                        </button>
                        <a
                          href={vidLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-[#171b28] hover:bg-[#1f2538] border border-[#23293a] text-slate-400 hover:text-white transition"
                          title={platformInfo.watchLabel}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* 5. Real Audience Community Discussions (Rendered only when real channel comments exist — zero fake comments) */}
        {communityComments.length > 0 && (
          <section id="discussions" className={`border-b border-[#1f2433] ${isMobile ? 'p-4' : 'p-8 sm:p-12'} bg-[#0e111a] scroll-mt-[58px]`}>
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Community Feed
                  </span>
                  <h3 className="text-lg sm:text-2xl font-bold text-white mt-0.5">
                    What the Community Is Saying
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct reactions, discussions, and questions from viewers across recent uploads.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onSwitchToProduct}
                  className="text-xs font-semibold hover:underline flex items-center gap-1 self-start sm:self-auto"
                  style={{ color: dynamicAccent }}
                >
                  <span>Join Discussion Room →</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {communityComments.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-[#121520] border border-[#1f2433] hover:border-slate-700 transition flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 border border-[#222634] flex items-center justify-center text-[10px] font-bold text-white uppercase"
                          style={{ background: dynamicAccentBg }}
                        >
                          {(c.author || c.user || 'V').replace('@', '').charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-white truncate block">
                            {c.author || c.user || '@viewer'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            {c.published || c.time || 'Community Member'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-4">
                        "{c.text || c.quote}"
                      </p>
                    </div>

                    {c.videoTitle && (
                      <div className="pt-2 border-t border-[#1f2433] text-[10px] text-slate-400 truncate font-mono">
                        on: {c.videoTitle}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 6. What's Included & Platform Deliverables (NO $/mo!) */}
        <section id="resources" className={`border-b border-[#1f2433] ${isMobile ? 'p-4' : 'p-8 sm:p-12'} bg-[#0b0d13] scroll-mt-[58px]`}>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Platform Features
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-white">
                Everything Accessible Inside the Hub
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-[#10131d] border border-[#1f2433] space-y-2">
                <Video className="w-5 h-5" style={{ color: dynamicAccent }} />
                <h4 className="text-sm font-bold text-white">Ad-Free Video Archive</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Stream complete tutorials and masterclasses in chronological order without commercial breaks.
                </p>
              </div>

              <div className="p-5 bg-[#10131d] border border-[#1f2433] space-y-2">
                <Download className="w-5 h-5" style={{ color: dynamicAccent }} />
                <h4 className="text-sm font-bold text-white">Resource Files & Templates</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Direct access to project assets, code boilerplates, study roadmaps, and cheat sheets.
                </p>
              </div>

              <div className="p-5 bg-[#10131d] border border-[#1f2433] space-y-2">
                <Users className="w-5 h-5" style={{ color: dynamicAccent }} />
                <h4 className="text-sm font-bold text-white">Private Community Rooms</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Connect with fellow practitioners, share your progress, and get direct creator feedback.
                </p>
              </div>
            </div>

            {/* Clean Invitation Box (No subscription pricing!) */}
            <div className="p-6 bg-[#131622] border border-[#23293a] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Enter @{handleClean}'s Digital Platform
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Access the complete video archive, download files, and participate in community discussions.
                </p>
              </div>
              <button
                type="button"
                onClick={onSwitchToProduct}
                className="px-6 py-3 text-xs uppercase tracking-wider font-bold transition shadow-lg rounded-none text-white shrink-0 cursor-pointer"
                style={{
                  background: dynamicAccent,
                  borderRadius: '0px'
                }}
              >
                Get Free Access Now →
              </button>
            </div>
          </div>
        </section>

        {/* 7. Creator Authority & Welcome Statement */}
        <section className={`border-b border-[#1f2433] ${isMobile ? 'p-4' : 'p-8 sm:p-10'} bg-[#0e111a]`}>
          <div className="max-w-3xl mx-auto p-5 bg-[#121520] border border-[#1f2433] flex flex-col sm:flex-row items-center gap-5">
            <div
              className="w-16 h-16 rounded-none flex items-center justify-center font-bold text-lg border overflow-hidden relative flex-shrink-0"
              style={{ background: dynamicAccentBg, borderColor: dynamicAccentBorder, color: dynamicAccent }}
            >
              {resolvedAvatar ? (
                <img src={resolvedAvatar} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <span>{creatorName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="space-y-1 text-center sm:text-left min-w-0 flex-1">
              <h4 className="text-sm font-bold text-white">{creatorName} (@{handleClean})</h4>
              <div className="flex items-center justify-center sm:justify-start gap-3 text-slate-400 text-xs font-mono">
                {creatorData?.followers && <span>{creatorData.followers} subscribers</span>}
                {creatorData?.videoCount && <span>{creatorData.videoCount} videos</span>}
                {creatorData?.totalViews && <span>{creatorData.totalViews} views</span>}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {creatorData?.description
                  ? (creatorData.description.length > 200 ? creatorData.description.slice(0, 200) + '...' : creatorData.description)
                  : `Dedicated to helping our community grow with high-utility, structured video releases and frameworks.`}
              </p>
            </div>
          </div>
        </section>

        {/* 8. Minimal Footer */}
        <footer className="p-8 pb-32 bg-[#080a0e] text-center text-xs text-slate-500 space-y-2 rounded-b-2xl">
          <p>© {new Date().getFullYear()} {productName}. All rights reserved.</p>
          <p className="text-[11px] text-slate-600">
            Official platform powered by CoLaunch Autonomous Creator Operations.
          </p>
        </footer>

      </div>
    </div>
  )
}

export function AppMockup({ theme, activeTab, setActiveTab, blueprint, creatorData, extraTabs, isMobile, viewMode = 'landing', onSwitchView, channelComments = [], onPlayVideo }) {
  const isDark = theme === 'dark' || theme === 'premium' || theme === 'minimalist' || !theme
  const resolvedAvatar = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''
  const accent = getAccent(creatorData)
  const dynamicAccent = accent.color
  const dynamicAccentBg = `rgba(${accent.rgb}, 0.12)`
  const dynamicAccentBorder = `rgba(${accent.rgb}, 0.28)`
  const isLight = isLightColor(dynamicAccent)

  const creatorName = creatorData?.name || creatorData?.handle?.replace('@', '') || 'Creator'
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
    } catch { }

    fetchCreatorComments(h, creatorData?.platform || 'youtube', 12)
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          setInternalComments(res)
        }
      })
      .catch(() => { })
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

  if (viewMode === 'landing') {
    const defaultTab = getAnalyzedTabsForCreator(creatorData, blueprint, extraTabs)[0] || 'Community'
    return (
      <ProductLandingPage
        styles={styles}
        creatorData={creatorData}
        blueprint={blueprint}
        onSwitchToProduct={() => onSwitchView ? onSwitchView('product') : setActiveTab(defaultTab)}
        channelComments={internalComments}
        isMobile={isMobile}
        onPlayVideo={onPlayVideo}
      />
    )
  }

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
  const platform = (creatorData?.platform || 'youtube').toLowerCase()
  const platformInfo = getPlatformInfo(platform)
  const creatorUrl = getCreatorChannelUrl(creatorData)
  const cleanCreatorUrlDisplay = creatorUrl.replace(/^https?:\/\/(www\.)?/, '')

  const renderTabContent = () => {
    const tabLower = activeTab.toLowerCase()

    // 1. VIDEOS / POSTS TAB (Real Scraped Videos from Apify / Social)
    if (tabLower.includes('video') || tabLower.includes('archive') || tabLower.includes('watch') || tabLower.includes('upload') || tabLower.includes('feed') || tabLower.includes('post')) {
      if (recentVideoList.length === 0) {
        return (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <p className="text-xs">No media archive loaded for this creator.</p>
            {creatorUrl && (
              <a
                href={creatorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs hover:underline"
                style={{ color: styles.accent }}
              >
                <span>Browse profile on {platformInfo.name}</span>
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
              <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">Latest {platformInfo.name} Releases & Archive</h4>
              <p className="text-[11px] text-slate-400">{recentVideoList.length} {platform === 'instagram' ? 'posts & reels' : 'videos'} from official channel</p>
            </div>
            {creatorUrl && (
              <a
                href={creatorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs hover:underline flex items-center gap-1 font-mono"
                style={{ color: styles.accent }}
              >
                <span>{platformInfo.name}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className={isMobile ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"}>
            {recentVideoList.map((v, i) => {
              const videoLink = v.url || (v.videoId ? (platform === 'instagram' ? `https://www.instagram.com/p/${v.videoId}/` : `https://www.youtube.com/watch?v=${v.videoId}`) : creatorUrl)
              const thumbUrl = v.thumbnail || (v.videoId ? (platform === 'youtube' ? `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg` : '') : '')

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
                        <button
                          type="button"
                          onClick={() => onPlayVideo ? onPlayVideo(v) : null}
                          className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
                          style={{ background: styles.accent, color: '#ffffff' }}
                          title="Play in Preview"
                        >
                          <Play className="w-5 h-5 fill-current ml-0.5 text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3.5">
                      <h5 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug transition-colors">
                        {v.title}
                      </h5>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2 font-mono flex-wrap">
                        {formatViewsString(v.views) ? (
                          <span>{formatViewsString(v.views)}</span>
                        ) : v.likes ? (
                          <span>{String(v.likes).includes('like') ? v.likes : `${v.likes} likes`}</span>
                        ) : null}
                        {v.likes && formatViewsString(v.views) && (
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

                  {/* Actions */}
                  <div className="px-3.5 pb-3.5 pt-0 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onPlayVideo ? onPlayVideo(v) : null}
                      className="flex-1 py-1.5 px-3 rounded-none text-[11px] font-semibold border flex items-center justify-center gap-1.5 transition text-white hover:brightness-110 cursor-pointer"
                      style={{ background: dynamicAccent, borderColor: dynamicAccentBorder, borderRadius: '0px' }}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play in Preview</span>
                    </button>
                    <a
                      href={videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 rounded-none text-[11px] font-semibold border flex items-center justify-center gap-1.5 transition text-slate-300 hover:text-white bg-[#161922] hover:bg-[#1f2430] border-[#222634]"
                      style={{ borderRadius: '0px' }}
                      title={platformInfo.watchLabel}
                    >
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
        <div className={isMobile ? "p-3 space-y-3" : "p-6 space-y-4"}>
          {/* Apify Real Channel Stats Banner */}
          <div className="p-3 bg-[#12141c] border border-[#222634] shadow-sm flex items-center justify-between gap-2.5 rounded-none">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className="w-9 h-9 rounded-none overflow-hidden flex items-center justify-center font-bold text-xs flex-shrink-0"
                style={{ background: styles.accentBg, color: styles.accent }}
              >
                {resolvedAvatar ? (
                  <img src={resolvedAvatar} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <span>{creatorName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 truncate">
                  <h4 className="text-xs font-bold text-white truncate">{creatorName}</h4>
                  <span className="text-[10px] text-slate-400 font-mono truncate">@{handleClean}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400 font-mono mt-0.5 truncate">
                  {creatorData?.followers && (
                    <span className="text-slate-300 font-semibold">{fmt(creatorData.followers)} subscribers</span>
                  )}
                  {creatorData?.videoCount && (
                    <>
                      <span>·</span>
                      <span>{creatorData.videoCount} videos</span>
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
                className="px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider border flex items-center gap-1 transition shrink-0 whitespace-nowrap cursor-pointer rounded-none text-white shadow-sm"
                style={{
                  color: '#ffffff',
                  background: styles.accent,
                  borderColor: styles.accent,
                  borderRadius: '0px'
                }}
                title="Open Channel on YouTube"
              >
                <span>Channel Link</span>
                <ExternalLink className="w-3 h-3 shrink-0 text-white" />
              </a>
            )}
          </div>

          {/* Posts list */}
          {posts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-3 rounded-none bg-[#12141c] border border-[#222634]">
              <div
                className="w-10 h-10 rounded-none flex items-center justify-center mx-auto"
                style={{ background: styles.accentBg, color: styles.accent }}
              >
                <MessageSquare className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-300 font-medium">No comments synced yet.</p>
              {creatorUrl && (
                <a
                  href={creatorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs hover:underline font-mono"
                  style={{ color: styles.accent }}
                >
                  <span>Explore discussions on official {platformInfo.name} profile</span>
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
                    className={`bg-[#12141c] border border-[#222634] hover:border-slate-700 transition rounded-none shadow-sm ${isMobile ? "p-3.5" : "p-4 sm:p-5"
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div
                          className="w-8 h-8 rounded-none font-bold flex items-center justify-center flex-shrink-0 text-xs"
                          style={{
                            background: p.isCreator ? styles.accentBg : 'rgba(255,255,255,0.06)',
                            color: p.isCreator ? styles.accent : '#fff'
                          }}
                        >
                          {p.user.replace('@', '').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-xs sm:text-sm text-white truncate">{p.user}</span>
                            {p.isCreator && (
                              <span
                                className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-none border uppercase tracking-wider"
                                style={{ background: styles.accentBg, color: styles.accent, borderColor: styles.accentBorder, borderRadius: '0px' }}
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

                    {/* Direct Link to the Video / Post */}
                    {p.videoUrl && (
                      <div className="mt-3 pt-2.5 border-t border-[#222634]/60 flex items-center justify-between gap-2 flex-wrap">
                        <a
                          href={p.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-none border transition hover:opacity-90 group/vlink truncate max-w-full"
                          style={{
                            color: styles.accent,
                            background: styles.accentBg,
                            borderColor: styles.accentBorder,
                            borderRadius: '0px'
                          }}
                          title={`Watch "${p.videoTitle || `${platformInfo.name} Post`}" on ${platformInfo.name}`}
                        >
                          <Play className="w-2.5 h-2.5 fill-current shrink-0" />
                          <span className="truncate group-hover/vlink:underline font-mono text-[11px]">
                            {p.videoTitle || platformInfo.watchLabel}
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
          <div className="rounded-none border p-4 sm:p-5 bg-[#12141c] border-[#222634] shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-none overflow-hidden flex items-center justify-center font-bold text-xs"
                style={{ background: styles.accentBg, color: styles.accent }}
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
                  <span>Visit @{handleClean} on {platformInfo.name}</span>
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
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">{formatViewsString(v.views) || (v.likes ? `${v.likes} likes` : 'Lesson Video')}</span>
              </div>
              <a
                href={v.url || (v.videoId ? (platform === 'instagram' ? `https://www.instagram.com/p/${v.videoId}/` : `https://www.youtube.com/watch?v=${v.videoId}`) : creatorUrl)}
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
                <span>View on {platformInfo.name}</span>
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
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{formatViewsString(ep.views) || (ep.likes ? `${ep.likes} likes` : '')} {ep.published ? `· ${ep.published}` : ''}</span>
                  </div>
                </div>
                <a
                  href={ep.url || (ep.videoId ? (platform === 'instagram' ? `https://www.instagram.com/p/${ep.videoId}/` : `https://www.youtube.com/watch?v=${ep.videoId}`) : creatorUrl)}
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
              Join the live stream on {platformInfo.name} and connect with fellow viewers in real time.
            </p>
            {creatorUrl && (
              <a
                href={creatorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition text-white bg-red-600 hover:bg-red-500"
              >
                <span>Open {platformInfo.name} Live</span>
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
        <p className="text-xs text-slate-400">Content directly connected to {creatorName}'s profile.</p>
        {creatorUrl && (
          <a
            href={creatorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs hover:underline mt-2"
            style={{ color: styles.accent }}
          >
            <span>Visit profile on {platformInfo.name}</span>
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
            className="w-7 h-7 rounded-none overflow-hidden flex items-center justify-center font-bold text-[10px] flex-shrink-0 relative shadow-sm"
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

        <div className="flex items-center gap-2.5">
          {onSwitchView && (
            <button
              type="button"
              onClick={() => onSwitchView('landing')}
              className="font-semibold px-3.5 py-2 text-xs transition border border-[#222634] text-slate-300 hover:text-white bg-[#141824] hover:bg-[#1a2030] flex items-center gap-1.5 cursor-pointer rounded-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Landing Page</span>
            </button>
          )}
          <button
            className="font-bold px-5 py-2 rounded-none text-xs transition shadow-lg flex items-center space-x-2 cursor-pointer active:scale-95 text-white"
            style={{
              background: styles.accent,
              color: '#ffffff',
              boxShadow: `0 4px 14px rgba(${accent.rgb}, 0.25)`,
              borderRadius: '0px'
            }}
          >
            <span className="text-white">SIGN IN</span>
            <ArrowRight className="w-3 h-3 stroke-[2.5] text-white" />
          </button>
        </div>
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
  const [playingVideo, setPlayingVideo] = useState(null)
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
    } catch { }

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

  const [viewMode, setViewMode] = useState('landing') // 'landing' | 'product' | 'mobile'
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPlayingVideo(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleFullscreenPreview = () => {
    if (!document.fullscreenElement) {
      previewContainerRef.current?.requestFullscreen().catch(() => {
        showToast("Error enabling fullscreen")
      })
      setIsFullscreen(true)
      showToast("Entered fullscreen mode")
    } else {
      document.exitFullscreen().catch(() => { })
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
      } catch { }
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
    } catch { }
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
    } catch { }
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
      } catch { }

      setIsRegenerating(false)
      showToast("Refinement removed")
    }, 350)
  }

  const handleSwitchView = (mode) => {
    setViewMode(mode)
    if (mode === 'landing') {
      showToast("Switched to Public Landing Page")
    } else if (mode === 'product' || mode === 'desktop') {
      setAppliedPrompts(prev => prev.filter(p => !p.toLowerCase().includes('mobile')))
      showToast("Switched to Member Product App")
    } else if (mode === 'mobile') {
      showToast("Switched to Mobile Preview")
    }
  }

  const handleBuild = () => {
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
    } catch { }
    showToast("Launching application build...")
    setTimeout(() => {
      next();
    }, 400);
  };

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

          <a href="https://co-launch.app" className="flex items-center space-x-2.5 text-inherit no-underline hover:opacity-85 transition-opacity" title="Visit co-launch.app">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm bg-[#12141c] border border-[#222634] shadow-sm"
            >
              <WingLogo size={18} />
            </div>
            <span className="font-bold text-base tracking-tight text-white">
              CoLaunch
            </span>
          </a>
        </div>

        {/* Center View Mode Selector */}
        <div className="hidden md:flex items-center bg-[#12141c] p-1 border border-[#222634] shadow-inner">
          <button
            onClick={() => handleSwitchView('landing')}
            className="flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer rounded-none"
            style={{
              background: viewMode === 'landing' ? dynamicAccent : 'transparent',
              color: viewMode === 'landing' ? '#ffffff' : '#94a3b8',
              boxShadow: viewMode === 'landing' ? `0 4px 12px rgba(${accent.rgb}, 0.25)` : 'none'
            }}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public Landing Page</span>
          </button>
          <button
            onClick={() => handleSwitchView('product')}
            className="flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer rounded-none"
            style={{
              background: (viewMode === 'product' || viewMode === 'desktop') ? dynamicAccent : 'transparent',
              color: (viewMode === 'product' || viewMode === 'desktop') ? '#ffffff' : '#94a3b8',
              boxShadow: (viewMode === 'product' || viewMode === 'desktop') ? `0 4px 12px rgba(${accent.rgb}, 0.25)` : 'none'
            }}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Member Product App</span>
          </button>
          <button
            onClick={() => handleSwitchView('mobile')}
            className="flex items-center space-x-2 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer rounded-none"
            style={{
              background: viewMode === 'mobile' ? dynamicAccent : 'transparent',
              color: viewMode === 'mobile' ? '#ffffff' : '#94a3b8',
              boxShadow: viewMode === 'mobile' ? `0 4px 12px rgba(${accent.rgb}, 0.25)` : 'none'
            }}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Right Header Badges & Actions */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-none text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Generated v2.4</span>
          </div>

          <button
            type="button"
            onClick={requestWipeCreator}
            className="flex items-center space-x-2 text-xs font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3.5 py-2 rounded-none transition cursor-pointer"
            title="Wipe creator state"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Creator</span>
          </button>

          <button
            type="button"
            onClick={handleBuild}
            disabled={isRegenerating}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 font-bold text-xs uppercase tracking-wider text-white shadow-md transition cursor-pointer rounded-none active:scale-95"
            style={{
              background: dynamicAccent,
              borderRadius: '0px'
            }}
          >
            <span>Looks good, build it</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center space-x-1 pl-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
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

      {/* Main Workspace Layout (Full Width, No Sidebar) */}
      <main className="flex-1 flex flex-col p-4 sm:p-6 pb-44 max-w-[1440px] mx-auto w-full">

        <div className="w-full flex-1 flex flex-col space-y-4">

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
            className={`w-full flex-1 bg-[#12141c] border border-[#222634] rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${isFullscreen
                ? 'fixed inset-0 z-50 overflow-y-auto rounded-none border-0'
                : (viewMode === 'landing' ? 'min-h-[600px]' : 'min-h-[580px] h-[680px] overflow-hidden')
              }`}
            style={{
              boxShadow: `0 0 35px -5px rgba(${accent.rgb}, 0.12)`,
              height: isFullscreen ? '100vh' : (viewMode === 'landing' ? 'auto' : '680px'),
              minHeight: '580px'
            }}
          >
            {/* Browser Top Chrome Bar */}
            <div className={`bg-[#161922] px-4 py-3 border-b border-[#222634] flex items-center justify-between select-none flex-shrink-0 ${isFullscreen ? '' : 'rounded-t-2xl'
              }`}>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>

              <div className="flex-1 max-w-md mx-4">
                <div
                  className="bg-[#0b0c10] border border-[#222634] rounded-none px-4 py-1.5 text-xs text-slate-300 text-center truncate flex items-center justify-between shadow-inner"
                >
                  <div className="flex items-center space-x-2 truncate min-w-0">
                    <Lock className="w-3 h-3 flex-shrink-0" style={{ color: dynamicAccent }} />
                    <span id="browser-url" className="truncate font-mono font-semibold" style={{ color: dynamicAccent }}>
                      {viewMode === 'landing'
                        ? `${(creatorData?.handle || 'creator').replace('@', '')}.colaunch.app`
                        : `${(creatorData?.handle || 'creator').replace('@', '')}.colaunch.app/app`}
                    </span>
                  </div>
                  <span className="text-[9.5px] uppercase font-mono px-2 py-0.5 border border-[#222634] bg-[#141824] text-slate-400 shrink-0 ml-2">
                    {viewMode === 'landing' ? 'Public Landing Page' : 'Member App'}
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
            <div className={`flex-1 relative flex bg-[#0f1117] ${viewMode === 'mobile'
                ? 'items-center justify-center min-h-[600px] overflow-hidden'
                : (viewMode === 'landing' ? 'items-stretch min-h-0' : 'items-stretch min-h-0 overflow-hidden')
              }`}>
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

                    <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                      <AppMockup
                        theme={theme}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        blueprint={currentBlueprint}
                        creatorData={creatorData}
                        extraTabs={extraTabs}
                        isMobile={true}
                        viewMode={viewMode === 'landing' ? 'landing' : 'mobile'}
                        onSwitchView={handleSwitchView}
                        channelComments={channelComments}
                        onPlayVideo={(v) => setPlayingVideo(v)}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Desktop / Dashboard Viewport */
                <div className={`w-full flex flex-col ${viewMode === 'landing' ? 'min-h-0' : 'h-full min-h-0 overflow-hidden'
                  }`}>
                  <AppMockup
                    theme={theme}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    blueprint={currentBlueprint}
                    creatorData={creatorData}
                    extraTabs={extraTabs}
                    isMobile={false}
                    viewMode={viewMode}
                    onSwitchView={handleSwitchView}
                    channelComments={channelComments}
                    onPlayVideo={(v) => setPlayingVideo(v)}
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs bg-[#161922] hover:bg-rose-500/10 hover:text-rose-400 border border-[#222634] hover:border-rose-500/30 text-slate-300 group transition-all duration-150 cursor-pointer shadow-sm"
                  style={{ borderRadius: '0px' }}
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

        {/* ========================================================= */}
        {/* PLATFORM ARCHITECTURE & FORGE AI STUDIO (REFINED DESIGN)  */}
        {/* ========================================================= */}
        <section className="w-full mt-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1f2433] gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2" style={{ backgroundColor: dynamicAccent }} />
                <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                  Platform Architecture & Forge Studio
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure active capabilities and use Forge AI to refine your application in real time.
              </p>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="px-2.5 py-1 bg-[#12141c] border border-[#222634] text-slate-300">
                Build: <strong className="text-white">{currentBlueprint?.name}</strong>
              </span>
              <span
                className="px-2.5 py-1 border font-bold"
                style={{ background: dynamicAccentBg, color: dynamicAccent, borderColor: dynamicAccentBorder }}
              >
                {localFeatures.length} Active Modules
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT COLUMN: What's Included & Add More Modules (Span 7) */}
            <div className="lg:col-span-7 flex flex-col space-y-4">

              {/* 1. What's Included Card */}
              <div className="bg-[#10131d] border border-[#1f2433] p-5 shadow-xl flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-white font-mono">
                        What's Included
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Active capabilities configured for your build
                    </p>
                  </div>
                  <span
                    className="text-[10px] px-2.5 py-1 font-mono font-bold border"
                    style={{
                      background: dynamicAccentBg,
                      color: dynamicAccent,
                      borderColor: dynamicAccentBorder
                    }}
                  >
                    {localFeatures.length} Active
                  </span>
                </div>

                {/* Active modules grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {localFeatures.map(label => {
                    const matched = FEATURES.find(f => f.label.toLowerCase() === label.toLowerCase()) ||
                      CAPABILITY_PRESETS.find(p => p.label.toLowerCase() === label.toLowerCase())
                    const Icon = matched ? matched.icon : Layout
                    return (
                      <div
                        key={label}
                        className="flex items-center justify-between p-3 bg-[#141824] border border-[#222a3d] hover:border-slate-600 transition group"
                        style={{ borderRadius: '0px' }}
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-2">
                          <div
                            className="w-7 h-7 flex items-center justify-center text-xs shadow-sm border flex-shrink-0"
                            style={{
                              background: dynamicAccentBg,
                              color: dynamicAccent,
                              borderColor: dynamicAccentBorder,
                              borderRadius: '0px'
                            }}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-semibold text-slate-200 block truncate">{label}</span>
                            <span className="text-[10px] text-emerald-400 font-mono block">Enabled in build</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleFeature(label)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer flex-shrink-0"
                          title={`Remove "${label}" from build`}
                          style={{ borderRadius: '0px' }}
                        >
                          <X className="w-3.5 h-3.5 group-hover:block hidden" />
                          <Check className="w-3.5 h-3.5 text-emerald-400 group-hover:hidden block" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 2. Add More Modules Card */}
              {(() => {
                const unadded = CAPABILITY_PRESETS.filter(p =>
                  !localFeatures.some(f => f.toLowerCase() === p.label.toLowerCase() || f.toLowerCase().includes(p.label.toLowerCase()))
                )
                if (unadded.length === 0) return null
                return (
                  <div className="bg-[#10131d] border border-[#1f2433] p-5 shadow-xl flex flex-col space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#1f2433]">
                      <div>
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-300 font-mono">
                          Add More Modules
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Click to include additional capabilities in your platform
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {unadded.length} Available
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {unadded.map((preset, idx) => {
                        const PresetIcon = preset.icon
                        const isOddLast = idx === unadded.length - 1 && unadded.length % 2 !== 0
                        return (
                          <div
                            key={preset.label}
                            className={`flex items-center justify-between p-3 bg-[#141824]/60 hover:bg-[#141824] border border-[#222a3d]/80 hover:border-slate-600 transition group min-h-[62px] ${isOddLast ? 'sm:col-span-2' : ''}`}
                            style={{ borderRadius: '0px' }}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                              <div className="w-7 h-7 flex items-center justify-center text-xs bg-[#0e111a] border border-[#222a3d] text-slate-400 group-hover:text-white transition flex-shrink-0">
                                <PresetIcon className="w-3.5 h-3.5" />
                              </div>
                              <div className="min-w-0">
                                <span className="text-xs font-semibold text-slate-200 group-hover:text-white block truncate">
                                  {preset.label}
                                </span>
                                <span className="text-[10.5px] text-slate-400 block truncate">
                                  {preset.desc}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleToggleFeature(preset.label)}
                              className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition border flex items-center gap-1 shrink-0 cursor-pointer text-white active:scale-95"
                              style={{
                                background: dynamicAccent,
                                borderColor: dynamicAccentBorder,
                                borderRadius: '0px'
                              }}
                              title={`Add ${preset.label}`}
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}

            </div>

            {/* RIGHT COLUMN: Refine with Forge (Span 5) */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="bg-[#10131d] border border-[#1f2433] p-5 shadow-xl flex flex-col h-full justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5" style={{ color: dynamicAccent }} />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-white font-mono">
                        Refine with Forge
                      </h3>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 font-mono font-bold border"
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
                    Click any refinement chip or type custom commands to instantly tailor your application build.
                  </p>

                  {/* Interactive Dynamic Prompt Chips (ZERO EMOJIS, CLEAN ICONS) */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
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

                      // Dynamic clean icon
                      let ChipIcon = Sparkles
                      if (chip.toLowerCase().includes('community')) ChipIcon = Users
                      else if (chip.toLowerCase().includes('minimalist')) ChipIcon = Layout
                      else if (chip.toLowerCase().includes('mobile')) ChipIcon = Smartphone
                      else if (chip.toLowerCase().includes('podcast')) ChipIcon = Volume2
                      else if (chip.toLowerCase().includes('live')) ChipIcon = Radio
                      else if (chip.toLowerCase().includes('store')) ChipIcon = ShoppingBag

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
                          className="text-xs p-2.5 border transition-all cursor-pointer shadow-sm active:scale-95 flex items-center justify-between gap-1.5 text-left"
                          style={{
                            background: isActive ? dynamicAccentBg : '#141824',
                            borderColor: isActive ? dynamicAccentBorder : '#222a3d',
                            color: isActive ? '#ffffff' : '#cbd5e1',
                            fontWeight: isActive ? 600 : 400,
                            borderRadius: '0px'
                          }}
                          title={isActive ? `Click to remove "${chip}"` : `Click to apply "${chip}"`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <ChipIcon className="w-3.5 h-3.5 shrink-0" style={{ color: isActive ? dynamicAccent : '#94a3b8' }} />
                            <span className="truncate">{chip}</span>
                          </div>
                          {isActive ? (
                            <Check className="w-3.5 h-3.5 shrink-0 stroke-[3]" style={{ color: dynamicAccent }} />
                          ) : (
                            <Plus className="w-3 h-3 shrink-0 text-slate-500" />
                          )}
                        </button>
                      )
                    })}
                  </div>

                  {/* Input Area */}
                  <div className="relative mb-3">
                    <textarea
                      rows={3}
                      placeholder="Describe a change (e.g. Add podcast section, switch to mobile, customize layout...)"
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handlePromptSend()
                        }
                      }}
                      className="w-full bg-[#141824] border border-[#222a3d] focus:border-slate-500 p-3 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none resize-none shadow-inner transition"
                      style={{ borderRadius: '0px' }}
                    />
                    <button
                      type="button"
                      onClick={handlePromptSend}
                      disabled={!prompt.trim()}
                      className="absolute right-3 bottom-4 p-2 transition border border-[#222a3d] bg-[#0d0f17] hover:bg-[#1a1f2e] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      style={{ color: dynamicAccent, borderRadius: '0px' }}
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
                    className="w-full bg-[#141824] hover:bg-[#1c2233] font-bold py-2.5 text-xs transition flex items-center justify-center space-x-2 shadow-sm border border-[#222a3d] cursor-pointer active:scale-95 disabled:opacity-40"
                    style={{
                      color: dynamicAccent,
                      borderRadius: '0px'
                    }}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                    <span>{isRegenerating ? 'Regenerating Component...' : 'Regenerate Component'}</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Generous Bottom Clearance Spacer so fixed bottom bar never hides any content */}
        <div className="h-44 w-full flex-shrink-0" aria-hidden="true" />
      </main>

      {/* Video Player Modal */}
      {playingVideo && (
        <VideoPlayerModal
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
          creatorData={creatorData}
          dynamicAccent={dynamicAccent}
          isLight={isLight}
        />
      )}

      {/* Sticky Bottom Action Bar */}
      <aside className="fixed bottom-0 left-0 right-0 z-40 bg-[#08090c]/95 border-t border-[#1f2433] py-3.5 px-4 sm:px-6 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2 h-2" style={{ backgroundColor: dynamicAccent }} />
            <span>Ready to ship <strong>{currentBlueprint?.name}</strong> for @{(creatorData?.handle || 'creator').replace('@', '')}</span>
          </div>
          <button
            type="button"
            onClick={handleBuild}
            disabled={isRegenerating}
            className="w-full sm:w-auto font-bold px-8 py-3 text-xs uppercase tracking-wider transition shadow-xl flex items-center justify-center space-x-2 group cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed text-white"
            style={{
              background: dynamicAccent,
              borderRadius: '0px'
            }}
          >
            <span>Looks good, build it</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>
      </aside>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div
          className="fixed bottom-24 right-6 z-50 bg-[#161922] border px-4 py-3 rounded-none shadow-2xl flex items-center space-x-3 animate-fade-in"
          style={{ borderColor: dynamicAccentBorder, borderRadius: '0px' }}
        >
          <div
            className="w-7 h-7 rounded-none flex items-center justify-center text-xs shadow-sm"
            style={{ background: dynamicAccent, color: '#ffffff' }}
          >
            <Check className="w-4 h-4 stroke-[3] text-white" />
          </div>
          <span className="text-xs font-medium text-white">{toastMessage}</span>
        </div>
      )}

    </div>
  )
}
