import { useState, useEffect, useRef } from 'react'
import { useForge, getAccent } from '../../App'
import {
  ArrowRight, ArrowLeft, RefreshCw, Send, SlidersHorizontal, Check, Layout, Users,
  BarChart2, Settings, Radio, Play, Lock, MessageSquare, Calendar,
  Download, ShoppingBag, Laptop, Smartphone, Volume2, Award, RotateCcw, Trash2,
  Heart, MessageCircle, Share2, MoreHorizontal, Maximize2, Minimize2, Globe, Sparkles,
  Layers, Video, Star, CheckCircle2, ShieldCheck, Rocket, CheckCircle,
  Megaphone, Pin, Clock, Headphones, Pause, FastForward, Rewind, Paperclip, Smile,
  ChevronRight, ThumbsUp, Flame, Music, Eye, ExternalLink, Plus, X, Instagram,
  ChevronDown, HelpCircle, AlertCircle, Terminal, Activity, Compass, Cpu
} from 'lucide-react'
import WingLogo from '../ui/WingLogo'
import CoLaunchLogo from '../ui/CoLaunchLogo'
import OnboardingStepIndicator from '../ui/OnboardingStepIndicator'
import { parseFollowerCount, generateLandingCopyAI } from '../../services/ai'
import { calculateSubscriptionRevenue, clampPrice, REVENUE_DISCLAIMER } from '../../utils/subscriptionRevenue'
import { fetchCreatorComments, cleanPostTitle } from '../../services/scraper'
import {
  LANDING_COPY_SCHEMA_VERSION,
  buildDeterministicLandingCopy,
  validateLandingCopy,
  getInitialLandingCopy
} from '../../services/landingCopy'

export { cleanPostTitle }

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
      featuredLabel: 'Featured Release',
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
      featuredLabel: 'Featured TikTok',
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
      featuredLabel: 'Featured Post',
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
    featuredLabel: 'Featured Channel Video',
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

export function formatViewsString(val) {
  if (!val) return ''
  const s = String(val).trim()
  if (s === '0' || s === '0 views' || s === '0 view' || s === '0.0' || s === '0k' || s === '0M') return ''
  if (/views?$/i.test(s)) return s
  return `${s} views`
}

export function extractYouTubeId(video) {
  if (!video) return null
  if (video.videoId && typeof video.videoId === 'string' && video.videoId.trim().length === 11) {
    return video.videoId.trim()
  }
  const candidates = [video.url, video.link, video.id, video.videoId, video.thumbnail]
  for (const c of candidates) {
    if (typeof c === 'string') {
      const match = c.match(/(?:v=|\/embed\/|youtu\.be\/|\/v\/|\/shorts\/|\/vi\/|\/vi_webp\/)([a-zA-Z0-9_-]{11})/)
      if (match && match[1]) return match[1]
    }
  }
  return null
}

export function extractInstagramCode(video) {
  if (!video) return null
  const candidates = [video.url, video.link, video.videoId, video.id, video.shortcode, video.shortCode, video.code]
  for (const c of candidates) {
    if (typeof c === 'string') {
      const match = c.match(/instagram\.com\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i)
      if (match && match[1]) return match[1]
      if (/^[a-zA-Z0-9_-]{9,16}$/.test(c.trim()) && !['undefined', 'null', 'default', 'creator'].includes(c.trim())) {
        return c.trim()
      }
    }
  }
  return null
}

export function VideoPlayerModal({ video, onClose, creatorData, dynamicAccent, isLight }) {
  if (!video) return null

  const platform = (creatorData?.platform || 'youtube').toLowerCase()
  const platformInfo = getPlatformInfo(platform)
  const videoId = platform === 'youtube' ? extractYouTubeId(video) : null
  const igShortcode = platform === 'instagram' ? extractInstagramCode(video) : null
  const directVideoUrl = video.videoUrl || video.video_url || video.mediaUrl || (video.url && String(video.url).match(/\.(mp4|webm|mov)(\?|$)/i) ? video.url : null)
  const videoTitle = video.title || (platform === 'instagram' ? 'Instagram Post & Reel' : 'Official Channel Video')
  const creatorUrl = getCreatorChannelUrl(creatorData)
  const postUrl = video.url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : (igShortcode ? `https://www.instagram.com/p/${igShortcode}/` : creatorUrl))
  const thumbUrl = video.thumbnail || video.thumbnailUrl || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '')

  const [useEmbed, setUseEmbed] = useState(Boolean(igShortcode))
  const [embedError, setEmbedError] = useState(false)

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#0d0f17] border border-[#232a3d] shadow-2xl flex flex-col overflow-hidden max-h-[92vh] rounded-none"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-[#131622] px-4 py-3 border-b border-[#232a3d] flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <span className="w-2 h-2 shrink-0 animate-pulse" style={{ backgroundColor: dynamicAccent }} />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 shrink-0">
              Where this idea comes from · @{(creatorData?.handle || 'creator').replace('@', '')}
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-bold text-white truncate">
              {cleanPostTitle(videoTitle, 65)}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-none text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close video"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {videoId ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
              title={videoTitle}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : directVideoUrl ? (
            <video
              src={directVideoUrl}
              controls
              autoPlay
              className="w-full h-full object-contain"
            />
          ) : thumbUrl ? (
            <div className="relative w-full h-full">
              <img src={thumbUrl} alt="" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/40">
                <p className="text-sm text-white font-medium mb-3">Video reference from channel catalog</p>
                <a
                  href={postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition flex items-center gap-1.5"
                  style={{ background: dynamicAccent }}
                >
                  <span>Open on {platformInfo.name}</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <p className="text-xs">No media playback available for this item.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. PRODUCT UI MOCKUP COMPONENT
// Neutral, category-matched dark software interface preview
// ─────────────────────────────────────────────────────────────────────────────

export function ProductMockupPreview({
  category = 'tool',
  blueprint = {},
  creatorData = {},
  dynamicAccent = '#c81e3c',
  isMobileFrame = false
}) {
  const name = blueprint.name || creatorData.productName || 'Software Application'
  const cat = (blueprint.raw?.product_category || blueprint.category || blueprint.type || category || 'tool').toLowerCase()
  const features = Array.isArray(blueprint.features) && blueprint.features.length > 0
    ? blueprint.features
    : ['Interactive Workspace', 'Automated Calculations', 'Saved User Projects', 'Live Telemetry']
  const price = clampPrice(blueprint.monthly_price || 19)

  // Inner mockup views based on software category
  const renderMockupCanvas = () => {
    if (cat.includes('calc') || cat.includes('formula') || cat.includes('estimat')) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#131724] border border-[#22293d] rounded-none">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Input Parameter A</span>
              <span className="text-base font-bold text-white font-mono mt-0.5 block">84.50</span>
              <span className="text-[10px] text-emerald-400 font-mono">Calibrated baseline</span>
            </div>
            <div className="p-3 bg-[#131724] border border-[#22293d] rounded-none">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Variance Factor</span>
              <span className="text-base font-bold text-white font-mono mt-0.5 block">1.28x</span>
              <span className="text-[10px] text-sky-400 font-mono">Optimal tolerance</span>
            </div>
            <div className="p-3 bg-[#131724] border border-[#22293d] rounded-none" style={{ borderColor: `${dynamicAccent}66` }}>
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Projected Output</span>
              <span className="text-base font-bold text-white font-mono mt-0.5 block" style={{ color: dynamicAccent }}>+34.2%</span>
              <span className="text-[10px] text-slate-400 font-mono">Automated result</span>
            </div>
          </div>
          <div className="p-3 bg-[#10141f] border border-[#1e2538] space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-mono text-[11px]">Dynamic Variable Slider</span>
              <span className="font-mono text-[11px] text-slate-400">72%</span>
            </div>
            <div className="h-1.5 w-full bg-[#1b2234]">
              <div className="h-full" style={{ width: '72%', background: dynamicAccent }} />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-2">
              <button type="button" className="px-3 py-1 bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">
                Run Simulation
              </button>
              <button type="button" className="px-3 py-1 bg-white/5 border border-white/10 text-[11px] font-mono text-slate-400">
                Export CSV
              </button>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Live computation engine</span>
          </div>
        </div>
      )
    }

    if (cat.includes('track') || cat.includes('log') || cat.includes('milestone')) {
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#20273a]">
            <div>
              <span className="text-xs font-bold text-white block">Execution Progress & Daily Logging</span>
              <span className="text-[10px] text-slate-400 font-mono">4 of 5 weekly objectives completed</span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
              On Track
            </span>
          </div>
          <div className="space-y-2">
            {features.slice(0, 3).map((feat, idx) => (
              <div key={idx} className="p-2.5 bg-[#121624] border border-[#1f273c] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-none border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center">
                    <Check size={11} className="text-emerald-400" />
                  </div>
                  <span className="text-xs text-slate-200 font-medium">{feat}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Day {idx + 1} logged</span>
              </div>
            ))}
          </div>
          <div className="p-2.5 bg-[#0f1320] border border-[#1b2336] flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Next automated milestone audit</span>
            <span className="text-slate-200">Tomorrow at 09:00 UTC</span>
          </div>
        </div>
      )
    }

    if (cat.includes('plan') || cat.includes('roadmap') || cat.includes('sprint')) {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-[#121624] border border-[#20283c]">
              <span className="text-[9px] font-mono uppercase text-slate-400 block">Stage 1</span>
              <span className="text-xs font-bold text-emerald-400">Validated</span>
              <div className="h-1 w-full bg-emerald-500/20 mt-1.5"><div className="h-full bg-emerald-400 w-full" /></div>
            </div>
            <div className="p-2 bg-[#121624] border border-[#20283c]" style={{ borderColor: `${dynamicAccent}66` }}>
              <span className="text-[9px] font-mono uppercase text-slate-400 block">Stage 2</span>
              <span className="text-xs font-bold text-white">Active Sprint</span>
              <div className="h-1 w-full bg-white/10 mt-1.5"><div className="h-full" style={{ width: '65%', background: dynamicAccent }} /></div>
            </div>
            <div className="p-2 bg-[#121624] border border-[#20283c]">
              <span className="text-[9px] font-mono uppercase text-slate-400 block">Stage 3</span>
              <span className="text-xs font-bold text-slate-400">Rollout</span>
              <div className="h-1 w-full bg-white/5 mt-1.5"><div className="h-full bg-white/20 w-0" /></div>
            </div>
          </div>
          <div className="p-3 bg-[#10141f] border border-[#1b2336] space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Priority Execution Sequence</span>
            <p className="text-xs text-slate-200">{features[0] || 'Centralized workflow management'}</p>
          </div>
        </div>
      )
    }

    if (cat.includes('community') || cat.includes('portal') || cat.includes('feedback')) {
      return (
        <div className="space-y-3">
          <div className="p-3 bg-[#131724] border border-[#222a3e] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Verified Member Workspace</span>
              <span className="text-[10px] font-mono text-slate-400">$19/mo subscriber access</span>
            </div>
            <p className="text-xs text-slate-200">
              Collaborative portal with direct tooling, scheduled Q&A queue, and member workspace files.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-[#101420] border border-[#1d2538] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block">Workflow Channel</span>
              <span className="text-white font-medium block truncate">#core-tooling</span>
            </div>
            <div className="p-2.5 bg-[#101420] border border-[#1d2538] space-y-1">
              <span className="text-[10px] font-mono text-slate-400 block">Resource Sync</span>
              <span className="text-emerald-400 font-medium block">All Files Ready</span>
            </div>
          </div>
        </div>
      )
    }

    // Default dashboard / tool / automation / creator_tool view
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 bg-[#121624] border border-[#20273c]">
            <span className="text-[9px] font-mono text-slate-400 uppercase block">Active Engine</span>
            <span className="text-sm font-bold text-white font-mono mt-0.5 block">v1.2 Live</span>
            <span className="text-[9px] text-emerald-400 font-mono">Sync healthy</span>
          </div>
          <div className="p-2.5 bg-[#121624] border border-[#20273c]">
            <span className="text-[9px] font-mono text-slate-400 uppercase block">Throughput</span>
            <span className="text-sm font-bold text-white font-mono mt-0.5 block">99.4%</span>
            <span className="text-[9px] text-sky-400 font-mono">Automated</span>
          </div>
          <div className="p-2.5 bg-[#121624] border border-[#20273c]" style={{ borderColor: `${dynamicAccent}55` }}>
            <span className="text-[9px] font-mono text-slate-400 uppercase block">Subscription</span>
            <span className="text-sm font-bold text-white font-mono mt-0.5 block">${price}/mo</span>
            <span className="text-[9px] text-slate-400 font-mono">Per member</span>
          </div>
        </div>

        <div className="p-3 bg-[#101420] border border-[#1c2438] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300 pb-1.5 border-b border-white/5">
            <span className="font-mono text-[10px] uppercase text-slate-400">Core Software Capabilities</span>
            <span className="text-[10px] font-mono text-emerald-400">Active Pipeline</span>
          </div>
          <div className="space-y-1.5">
            {features.slice(0, 3).map((feat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-1">
                <span className="text-slate-300 truncate max-w-[70%]">{feat}</span>
                <span className="text-[10px] font-mono text-slate-500">Configured</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full bg-[#0a0d16] border border-[#20273c] shadow-2xl overflow-hidden rounded-none ${isMobileFrame ? 'max-w-[340px] mx-auto' : ''}`}>
      {/* Sleek App Window Header */}
      <div className="bg-[#101420] px-3.5 py-2 border-b border-[#20273c] flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          </div>
          <span className="text-[11px] font-mono font-medium text-slate-300 ml-2 truncate max-w-[180px] sm:max-w-xs">
            {name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10">
            Preview · Software Engine
          </span>
        </div>
      </div>

      {/* Main Canvas Body */}
      <div className="p-4 sm:p-5 bg-[#0b0e18] relative">
        {renderMockupCanvas()}

        {/* Subtle Watermark Banner */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <span>CoLaunch Software Platform</span>
          <span>PREVIEW · ILLUSTRATIVE UI</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DEMAND-TEST EMAIL CAPTURE MODAL
// Collects waitlist demand interest with honest validation
// ─────────────────────────────────────────────────────────────────────────────

function DemandWaitlistModal({
  isOpen,
  onClose,
  productName,
  monthlyPrice,
  creatorHandle,
  dynamicAccent = '#c81e3c'
}) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const clean = email.trim().toLowerCase()
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)

    if (!isValid) {
      setError('Please enter a valid email address.')
      return
    }

    setError('')
    setSubmitted(true)
    // TODO: connect signup endpoint (e.g. POST /api/waitlist or /projects/record-preorder once project is saved)
    // In onboarding preview, no remote project exists yet; we show the honest preview note.
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#0d101a] border border-[#242c42] p-6 shadow-2xl rounded-none text-slate-100"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                Early Access Cohort
              </span>
              <h3 className="text-lg font-bold text-white">Join the Waitlist for {productName}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Co-created with @{creatorHandle.replace(/^@/, '')}. Reserved spots are ${monthlyPrice}/mo once live. Cancel anytime.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-300 block">Your email address</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="name@work.com"
                required
                className="w-full bg-[#121624] border border-[#252e46] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/40"
              />
              {error && <p className="text-[11px] text-red-400 font-mono mt-1">{error}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold uppercase tracking-wider text-white transition cursor-pointer"
                style={{ background: dynamicAccent }}
              >
                Join Waitlist — ${monthlyPrice}/mo
              </button>
            </div>

            <p className="text-[10px] text-slate-500 text-center font-mono pt-1">
              No immediate billing. You will be notified when early cohort spots open.
            </p>
          </form>
        ) : (
          <div className="py-6 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-none bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Check size={20} />
            </div>
            <h4 className="text-base font-bold text-white">You're on the preview waitlist</h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              We have recorded your email preview for <strong>{productName}</strong>.
            </p>
            <div className="p-3 bg-[#121624] border border-[#20273a] text-[11px] font-mono text-amber-300/90 leading-relaxed">
              Preview only · Signups are not collected remotely yet until your public demand-test page is launched.
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 text-xs font-mono text-slate-200 hover:text-white transition cursor-pointer mt-2"
            >
              Close Window
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PRODUCT LANDING PAGE (SaaS Demand-Test Conversion Page)
// Strictly follows the ordered sections in the specification
// ─────────────────────────────────────────────────────────────────────────────

function ProductLandingPage({
  styles,
  creatorData,
  blueprint,
  landingCopy,
  isMobile,
  onPlayVideo,
  onOpenWaitlist
}) {
  const navRef = useRef(null)
  const name = blueprint?.name || creatorData?.productName || 'Software Workspace'
  const monthlyPrice = clampPrice(blueprint?.monthly_price || 19)
  const rawFollowers = creatorData?.followers || creatorData?.subscriberCount || 0
  const followersCount = parseFollowerCount(rawFollowers)
  const fmtFollowers = followersCount > 0 ? fmt(followersCount) : ''
  const creatorHandle = (creatorData?.handle || creatorData?.name || 'creator').replace(/^@/, '')
  const creatorBio = creatorData?.description || creatorData?.bio || ''
  const avatarUrl = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''

  const copy = landingCopy || buildDeterministicLandingCopy(creatorData, blueprint)

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    const nav = navRef.current
    const navHeight = nav ? nav.getBoundingClientRect().height : 60
    const top = el.getBoundingClientRect().top + window.scrollY - navHeight
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Related creator videos (at most 2 or 3) for "Where this idea comes from"
  const rawPosts = Array.isArray(creatorData?.recentPosts) && creatorData.recentPosts.length > 0
    ? creatorData.recentPosts
    : Array.isArray(creatorData?.videos) && creatorData.videos.length > 0
      ? creatorData.videos
      : []
  const originVideos = rawPosts.slice(0, 3)

  return (
    <div className="w-full bg-[#08090d] text-slate-100 flex flex-col font-sans selection:bg-white/20">

      {/* 1. STICKY NAV */}
      <nav
        ref={navRef}
        className="sticky top-0 z-40 w-full bg-[#0c0f17]/95 backdrop-blur-md border-b border-[#1b2234] px-4 sm:px-8 py-3.5 flex items-center justify-between select-none"
      >
        <button
          type="button"
          onClick={scrollToTop}
          className="flex items-center gap-2 text-left cursor-pointer group"
        >
          <div className="w-6 h-6 flex items-center justify-center font-bold text-xs rounded-none" style={{ background: styles.accent, color: '#ffffff' }}>
            {name.charAt(0)}
          </div>
          <span className="font-bold text-sm sm:text-base text-white tracking-tight group-hover:text-slate-200 transition">
            {name}
          </span>
        </button>

        <div className="hidden md:flex items-center gap-6 text-xs text-slate-300 font-medium">
          <button type="button" onClick={() => scrollToSection('problem')} className="hover:text-white transition cursor-pointer">
            The Problem
          </button>
          <button type="button" onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition cursor-pointer">
            How It Works
          </button>
          <button type="button" onClick={() => scrollToSection('features')} className="hover:text-white transition cursor-pointer">
            Features
          </button>
          <button type="button" onClick={() => scrollToSection('pricing')} className="hover:text-white transition cursor-pointer">
            Pricing
          </button>
          <button type="button" onClick={() => scrollToSection('faq')} className="hover:text-white transition cursor-pointer">
            FAQ
          </button>
        </div>

        <div>
          <button
            type="button"
            onClick={onOpenWaitlist}
            className="px-3.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white transition cursor-pointer shadow-md"
            style={{ background: styles.accent }}
          >
            Join Waitlist — ${monthlyPrice}/mo
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative px-4 sm:px-8 lg:px-12 py-12 sm:py-16 md:py-20 border-b border-[#192032] overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/25">
                Designed for {copy.targetAudience}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Co-created with @{creatorHandle}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
              {copy.headline}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              {copy.subheadline}
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={onOpenWaitlist}
                className="px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition cursor-pointer text-center shadow-lg"
                style={{ background: styles.accent }}
              >
                Join Waitlist — ${monthlyPrice}/mo
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="px-5 py-3.5 text-xs sm:text-sm font-bold text-slate-300 hover:text-white bg-[#121624] border border-[#232a3e] transition cursor-pointer text-center"
              >
                Explore Features & Workflow ↓
              </button>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
              <span>✓ Monthly subscription</span>
              <span>✓ Cancel anytime</span>
              <span>✓ Direct early cohort access</span>
            </div>
          </div>

          <div className="lg:col-span-5 w-full">
            <ProductMockupPreview
              category={blueprint.raw?.product_category || blueprint.category || blueprint.type || 'tool'}
              blueprint={blueprint}
              creatorData={creatorData}
              dynamicAccent={styles.accent}
              isMobileFrame={isMobile}
            />
          </div>

        </div>
      </section>

      {/* 3. PROBLEM SECTION */}
      <section id="problem" className="px-4 sm:px-8 lg:px-12 py-14 sm:py-18 bg-[#0a0d15] border-b border-[#181f30]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-2 text-left max-w-2xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              The Bottleneck
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              Why Existing Workflows Keep Breaking
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Discussions across the community consistently highlight recurring operational frustrations that generic advice and mass-market tools fail to resolve.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {copy.problemPoints.map((point, idx) => (
              <div
                key={idx}
                className="p-5 bg-[#0e121c] border border-[#1d2436] rounded-none space-y-2.5 text-left"
              >
                <div className="w-7 h-7 rounded-none bg-red-500/10 border border-red-500/20 text-red-400 font-mono text-xs flex items-center justify-center font-bold">
                  0{idx + 1}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                  {point}
                </h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section id="how-it-works" className="px-4 sm:px-8 lg:px-12 py-14 sm:py-18 bg-[#08090d] border-b border-[#181f30]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-2 text-left max-w-2xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
              Execution Architecture
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              How {name} Streamlines Your Process
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              A 3-step structured workflow engineered to replace fragmented manual setups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {copy.howItWorks.map((step, idx) => (
              <div
                key={idx}
                className="p-6 bg-[#0c101a] border border-[#1b2336] rounded-none space-y-3 text-left relative"
              >
                <span className="text-2xl font-black font-mono text-slate-600 block">
                  {step.step}
                </span>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURES & CAPABILITIES */}
      <section id="features" className="px-4 sm:px-8 lg:px-12 py-14 sm:py-18 bg-[#0a0d15] border-b border-[#181f30]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-2 text-left max-w-2xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Capabilities
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              Engineered Capabilities Included in Your Subscription
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Direct interactive utilities built strictly for this problem domain.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {copy.features.map((feat, idx) => (
              <div
                key={idx}
                className="p-5 bg-[#0e121d] border border-[#1f273a] rounded-none space-y-2 text-left hover:border-slate-600 transition"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-none flex items-center justify-center" style={{ background: `${styles.accent}22`, color: styles.accent }}>
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">{feat.title}</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-7">
                  {feat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. TRANSPARENT PRICING */}
      <section id="pricing" className="px-4 sm:px-8 lg:px-12 py-14 sm:py-18 bg-[#08090d] border-b border-[#181f30]">
        <div className="max-w-4xl mx-auto space-y-8 text-center">
          <div className="space-y-2 max-w-xl mx-auto">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
              Predictable Pricing
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              Simple Monthly Subscription
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              One clear subscription tier. All software capabilities and updates included.
            </p>
          </div>

          <div className="max-w-md mx-auto p-6 sm:p-8 bg-[#0d101a] border border-[#232b3e] rounded-none space-y-6 text-left shadow-2xl relative" style={{ borderColor: `${styles.accent}55` }}>
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Full Platform Membership
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-white font-mono">${monthlyPrice}</span>
                <span className="text-xs text-slate-400 font-mono">/ month</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Per active subscriber. Includes cloud workspace, all features, and continuous updates.
              </p>
            </div>

            <div className="border-t border-[#1d2538] pt-4 space-y-2.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
                Everything Included:
              </span>
              {copy.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                  <Check size={13} className="text-emerald-400 shrink-0" />
                  <span>{f.title}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <Check size={13} className="text-emerald-400 shrink-0" />
                <span>Regular software enhancements & bug fixes</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-200">
                <Check size={13} className="text-emerald-400 shrink-0" />
                <span>Cancel anytime</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onOpenWaitlist}
                className="w-full py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition cursor-pointer shadow-md text-center block"
                style={{ background: styles.accent }}
              >
                Join Waitlist — ${monthlyPrice}/mo
              </button>
            </div>

            <p className="text-[10px] font-mono text-slate-500 text-center">
              Demand-validation cohort · Early supporters secure first access.
            </p>
          </div>
        </div>
      </section>

      {/* 7. CREATOR ORIGIN SECTION ("Why @creator") */}
      <section className="px-4 sm:px-8 lg:px-12 py-12 sm:py-16 bg-[#0a0d15] border-b border-[#181f30]">
        <div className="max-w-4xl mx-auto space-y-6 text-left">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#1b2234]">
            <div className="flex items-center gap-3.5">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={creatorHandle}
                  className="w-12 h-12 rounded-none object-cover border border-white/10"
                />
              ) : (
                <div className="w-12 h-12 rounded-none bg-[#141926] border border-white/10 flex items-center justify-center font-bold text-white">
                  {creatorHandle.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white">Why @{creatorHandle}</h3>
                {creatorBio && (
                  <p className="text-xs text-slate-400 line-clamp-1 max-w-md">{creatorBio}</p>
                )}
              </div>
            </div>
            {fmtFollowers && (
              <div className="text-left sm:text-right">
                <span className="text-base font-black text-white font-mono block">{fmtFollowers}</span>
                <span className="text-[10px] text-slate-400 font-mono uppercase">Audience Community</span>
              </div>
            )}
          </div>

          {originVideos.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Where this idea comes from:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {originVideos.map((vid, idx) => {
                  const title = cleanPostTitle(vid.title || vid.caption || 'Channel Topic', 55)
                  const thumb = vid.thumbnail || ''
                  return (
                    <div
                      key={idx}
                      onClick={() => onPlayVideo ? onPlayVideo(vid) : null}
                      className="p-2.5 bg-[#0e121c] border border-[#1d2538] rounded-none flex items-center gap-2.5 cursor-pointer hover:border-slate-500 transition group"
                    >
                      {thumb ? (
                        <img src={thumb} alt="" className="w-12 h-9 object-cover shrink-0 rounded-none" />
                      ) : (
                        <div className="w-12 h-9 bg-[#151a28] flex items-center justify-center shrink-0">
                          <Play size={12} className="text-slate-400 group-hover:text-white" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="text-xs text-slate-300 font-medium block truncate group-hover:text-white">
                          {title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 block">Channel Reference</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 8. HONEST FAQ */}
      <section id="faq" className="px-4 sm:px-8 lg:px-12 py-14 sm:py-18 bg-[#08090d] border-b border-[#181f30]">
        <div className="max-w-4xl mx-auto space-y-8 text-left">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Clear Answers
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Straightforward details about the tool, release timeline, and billing model.
            </p>
          </div>

          <div className="space-y-3">
            {copy.faq.map((item, idx) => (
              <div
                key={idx}
                className="p-4 sm:p-5 bg-[#0d101a] border border-[#1b2336] rounded-none space-y-1.5"
              >
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  {item.question}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA & MINIMAL FOOTER */}
      <section className="px-4 sm:px-8 lg:px-12 py-16 bg-[#0b0e18] text-center border-b border-[#181f30]">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {copy.cta.headline}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            {copy.cta.subheadline}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenWaitlist}
              className="px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white transition cursor-pointer shadow-xl"
              style={{ background: styles.accent }}
            >
              {copy.cta.buttonText}
            </button>
          </div>
        </div>
      </section>

      <footer className="px-4 sm:px-8 py-6 bg-[#080a0f] text-center text-xs text-slate-500 font-mono">
        <p>© {new Date().getFullYear()} {name}. Co-created with @{creatorHandle}. All rights reserved.</p>
      </footer>

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. APP MOCKUP WRAPPER COMPONENT
// Handles ViewModes ('landing' vs 'product' / 'mobile') cleanly
// ─────────────────────────────────────────────────────────────────────────────

export function AppMockup({
  theme = 'dark',
  activeTab,
  setActiveTab,
  blueprint,
  creatorData,
  extraTabs,
  isMobile,
  viewMode = 'landing',
  onSwitchView,
  channelComments = [],
  onPlayVideo
}) {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)
  const accent = getAccent(creatorData)
  const dynamicAccent = accent.color

  const themeStyles = {
    dark: {
      bg: '#0f1117',
      cardBg: '#12141c',
      borderColor: '#222634',
      text: '#f3f4f6',
      accent: dynamicAccent,
    },
    premium: {
      bg: '#0a0b10',
      cardBg: '#12141c',
      borderColor: `rgba(${accent.rgb}, 0.28)`,
      text: '#f8fafc',
      accent: dynamicAccent,
    },
    light: {
      bg: '#f9fafb',
      cardBg: '#ffffff',
      borderColor: 'rgba(0,0,0,0.08)',
      text: '#111827',
      accent: dynamicAccent,
    },
    minimalist: {
      bg: '#ffffff',
      cardBg: '#ffffff',
      borderColor: '#000000',
      text: '#000000',
      accent: '#000000',
    }
  }

  const styles = themeStyles[theme] || themeStyles.dark
  const landingCopy = creatorData?.landingCopy || buildDeterministicLandingCopy(creatorData, blueprint)

  if (viewMode === 'landing') {
    return (
      <div className="w-full relative">
        <ProductLandingPage
          styles={styles}
          creatorData={creatorData}
          blueprint={blueprint}
          landingCopy={landingCopy}
          isMobile={isMobile}
          onPlayVideo={onPlayVideo}
          onOpenWaitlist={() => setIsWaitlistOpen(true)}
        />
        <DemandWaitlistModal
          isOpen={isWaitlistOpen}
          onClose={() => setIsWaitlistOpen(false)}
          productName={blueprint?.name || creatorData?.productName || 'Software Workspace'}
          monthlyPrice={clampPrice(blueprint?.monthly_price || 19)}
          creatorHandle={creatorData?.handle || 'creator'}
          dynamicAccent={dynamicAccent}
        />
      </div>
    )
  }

  // Member Product App / Tool Preview View
  return (
    <div className="w-full p-4 sm:p-6 bg-[#08090d] min-h-[600px] flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl space-y-4">
        <div className="p-3 bg-[#111624] border border-[#20293d] rounded-none flex items-center justify-between text-xs font-mono">
          <span className="text-emerald-400 font-bold uppercase">Product Preview · Member App View</span>
          <span className="text-slate-400">Subscriber Tool Interface</span>
        </div>
        <ProductMockupPreview
          category={blueprint?.raw?.product_category || blueprint?.category || blueprint?.type || 'tool'}
          blueprint={blueprint}
          creatorData={creatorData}
          dynamicAccent={dynamicAccent}
          isMobileFrame={isMobile}
        />
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => onSwitchView ? onSwitchView('landing') : null}
            className="text-xs font-mono text-slate-400 hover:text-white underline cursor-pointer"
          >
            ← Return to Public Demand-Test Landing Page
          </button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. MAIN ONBOARDING PREVIEW STEP COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function Preview() {
  const { next, creatorData, updateCreator, prev, requestWipeCreator } = useForge()
  const [theme, setTheme] = useState(creatorData?.theme || 'dark')
  const [viewMode, setViewMode] = useState(creatorData?.viewMode || 'landing') // 'landing' | 'mobile'
  const isMobileView = viewMode === 'mobile'
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [playingVideo, setPlayingVideo] = useState(null)
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)
  const previewContainerRef = useRef(null)

  // 1. Preserve blueprint strictly from creatorData.blueprint (or first candidate if jumping directly)
  const [currentBlueprint, setCurrentBlueprint] = useState(() => {
    return creatorData?.blueprint || creatorData?.recommendations?.[0] || null
  })

  useEffect(() => {
    if (!currentBlueprint && (creatorData?.blueprint || creatorData?.recommendations?.[0])) {
      const bp = creatorData?.blueprint || creatorData?.recommendations?.[0]
      setCurrentBlueprint(bp)
      setLandingCopy(getInitialLandingCopy(creatorData, bp))
    }
  }, [creatorData, currentBlueprint])

  // 2. Initial landing copy
  const [landingCopy, setLandingCopy] = useState(() => {
    return getInitialLandingCopy(creatorData, currentBlueprint)
  })

  const accent = getAccent(creatorData)
  const dynamicAccent = accent.color

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2800)
  }

  // Handle price adjustment (clamped $9–$29). Never regenerates copy!
  const handlePriceChange = (newPrice) => {
    const price = clampPrice(newPrice)
    const updatedBp = {
      ...currentBlueprint,
      monthly_price: price,
    }
    setCurrentBlueprint(updatedBp)

    // Recalculate subscription revenue estimate using single shared helper
    const audienceCount = parseFollowerCount(creatorData?.followers || creatorData?.subscriberCount || 0)
    const revEst = calculateSubscriptionRevenue({
      audience: audienceCount,
      monthlyPrice: price,
      engagementRate: parseFloat(creatorData?.engagementRate) || 3.5,
    })

    const updatedCopy = {
      ...landingCopy,
      monthlyPrice: price,
      pricing: {
        ...landingCopy.pricing,
        price,
        ctaText: `Join Waitlist — $${price}/mo`,
      },
      cta: {
        ...landingCopy.cta,
        buttonText: `Join Waitlist — $${price}/mo`,
      },
    }
    setLandingCopy(updatedCopy)

    const updatedCreator = {
      ...creatorData,
      blueprint: updatedBp,
      monthly_price: price,
      revenue_estimate: revEst,
      landingCopy: updatedCopy,
    }
    updateCreator(updatedCreator)
    try {
      localStorage.setItem('forge_creator_data', JSON.stringify(updatedCreator))
    } catch {}
    showToast(`Updated price to $${price}/mo per subscriber`)
  }

  // Handle Regenerate: Only regenerates landing copy and theme; never alters name, tool_summary, audience, price, evidence or features!
  const handleRegenerateCopy = async (tone = 'professional') => {
    if (isRegenerating) return
    setIsRegenerating(true)
    showToast(`Synthesizing fresh ${tone} SaaS landing copy...`)

    try {
      const freshCopy = await generateLandingCopyAI(creatorData, currentBlueprint, { tone })
      setLandingCopy(freshCopy)
      const updatedCreator = {
        ...creatorData,
        landingCopy: freshCopy,
      }
      updateCreator(updatedCreator)
      try {
        localStorage.setItem('forge_creator_data', JSON.stringify(updatedCreator))
      } catch {}
      showToast('Generated fresh SaaS landing copy!')
    } catch (err) {
      console.warn('[Preview] Regenerate copy error:', err)
      const fallback = buildDeterministicLandingCopy(creatorData, currentBlueprint)
      setLandingCopy(fallback)
    } finally {
      setIsRegenerating(false)
    }
  }

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (previewContainerRef.current?.requestFullscreen) {
        previewContainerRef.current.requestFullscreen().catch(() => {})
        setIsFullscreen(true)
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
        setIsFullscreen(false)
      }
    }
  }

  // Handle final CTA: Approve landing page and proceed to launch preparation
  const handleBuild = () => {
    const finalPayload = {
      blueprint: currentBlueprint,
      productName: currentBlueprint?.name || creatorData.productName,
      features: currentBlueprint?.features || [],
      landingCopy,
      theme,
      isMobileView,
      viewMode,
    }
    updateCreator(finalPayload)
    try {
      localStorage.setItem('forge_creator_data', JSON.stringify({ ...creatorData, ...finalPayload }))
    } catch {}
    showToast('Approving landing page...')
    setTimeout(() => {
      next()
    }, 350)
  }

  // Clean creator handle for URL preview
  const rawH = creatorData?.handle || creatorData?.name || 'creator'
  const cleanHandle = rawH.replace(/^@+/, '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'creator'

  if (!currentBlueprint) {
    return (
      <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 bg-[#0d101a] border border-[#242c42] rounded-none space-y-4 shadow-2xl">
          <AlertCircle size={32} className="text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">No Product Selected</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Please return to the Blueprint step to choose a subscription software product idea for your audience.
          </p>
          <button
            type="button"
            onClick={prev}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white rounded-none cursor-pointer"
            style={{ background: dynamicAccent }}
          >
            ← Return to Blueprint
          </button>
        </div>
      </div>
    )
  }

  const currentPrice = clampPrice(currentBlueprint.monthly_price || 19)

  return (
    <div className="min-h-screen flex flex-col bg-[#08090d] text-slate-100 selection:bg-white/20">

      {/* Top Studio Header */}
      <header className="h-16 border-b border-[#1b2234] bg-[#0c0f17]/90 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={prev}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-white/5 border border-white/10 rounded-none transition cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Blueprint</span>
          </button>
          <div className="h-4 w-[1px] bg-[#1f2433]" />

          {/* CoLaunch 4-Square Brand Mark & Link */}
          <CoLaunchLogo
            size={18}
            href="https://co-launch.app"
            color={dynamicAccent}
            showWordmark={true}
          />

          <div className="h-4 w-[1px] bg-[#1f2433] hidden md:block" />
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-bold text-white truncate max-w-[180px]">
              {currentBlueprint.name}
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/25">
              ${currentPrice}/mo SaaS
            </span>
          </div>
        </div>

        {/* Center: Device Mode Switcher */}
        <div className="hidden md:inline-flex items-center gap-1 p-0.5 bg-[#121624] border border-[#20273a]">
          <button
            type="button"
            onClick={() => setViewMode('landing')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-bold transition cursor-pointer ${viewMode === 'landing' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Laptop size={12} />
            <span className="hidden sm:inline">Landing Page</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-bold transition cursor-pointer ${viewMode === 'mobile' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            <Smartphone size={12} />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Right Action: Reset Creator + Interactive Step Indicator + Approve CTA */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={requestWipeCreator}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-red-400/80 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all cursor-pointer"
            title="Wipe creator from session storage"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Creator</span>
          </button>

          {/* Interactive 8-Step Navigation Indicator */}
          <OnboardingStepIndicator currentStep="preview" showOptions={true} />

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 text-slate-400 hover:text-white bg-white/5 border border-white/10 transition cursor-pointer hidden sm:block"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button
            type="button"
            id="dynamic-cta-button"
            onClick={handleBuild}
            className="px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider text-white transition cursor-pointer shadow-lg flex items-center gap-1.5"
            style={{ background: dynamicAccent }}
          >
            <span>Approve landing page</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* Main Studio Workspace Grid */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Left Refine Panel (Software-focused controls) */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[#1a2133] bg-[#0a0d16] p-4 sm:p-5 flex-shrink-0 space-y-6 overflow-y-auto">
          
          {/* Product Overview Card */}
          <div className="p-3.5 bg-[#101420] border border-[#1f273b] space-y-2 text-left">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Active Software Product
            </span>
            <h3 className="text-sm font-bold text-white">{currentBlueprint.name}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentBlueprint.tool_summary || currentBlueprint.description}
            </p>
            <div className="pt-1 text-[11px] font-mono text-emerald-400">
              Target: {currentBlueprint.target_audience || 'Target Community'}
            </div>
          </div>

          {/* Pricing Controller (Clamped $9–$29) */}
          <div className="space-y-2 text-left">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Monthly Subscription Price</span>
              <span className="text-xs font-mono font-bold text-emerald-400">${currentPrice} / mo</span>
            </div>
            <div className="grid grid-cols-5 gap-1 pt-1">
              {[9, 15, 19, 24, 29].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handlePriceChange(p)}
                  className={`py-1 text-xs font-mono font-bold transition cursor-pointer border ${currentPrice === p ? 'border-emerald-400 bg-emerald-500/20 text-white' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'}`}
                >
                  ${p}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 font-mono pt-1">
              {REVENUE_DISCLAIMER}
            </p>
          </div>

          {/* Landing Copy Refinement (Tone & AI regeneration) */}
          <div className="space-y-2 text-left border-t border-white/5 pt-4">
            <span className="text-xs font-bold text-white block">Regenerate Copy Tone</span>
            <p className="text-[11px] text-slate-400">
              Only rewrites copywriting while preserving product name, features, and price.
            </p>
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                disabled={isRegenerating}
                onClick={() => handleRegenerateCopy('professional')}
                className="py-1.5 px-2 bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
              >
                Professional
              </button>
              <button
                type="button"
                disabled={isRegenerating}
                onClick={() => handleRegenerateCopy('bold')}
                className="py-1.5 px-2 bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
              >
                Bold
              </button>
              <button
                type="button"
                disabled={isRegenerating}
                onClick={() => handleRegenerateCopy('friendly')}
                className="py-1.5 px-2 bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-50"
              >
                Friendly
              </button>
            </div>
          </div>

          {/* Included Features List */}
          <div className="space-y-2 text-left border-t border-white/5 pt-4">
            <span className="text-xs font-bold text-white block">Included Software Features</span>
            <div className="space-y-1.5">
              {(currentBlueprint.features || []).map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300 py-1 px-2 bg-[#121624] border border-[#1d2538]">
                  <Check size={11} className="text-emerald-400 shrink-0" />
                  <span className="truncate">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Selector */}
          <div className="space-y-2 text-left border-t border-white/5 pt-4">
            <span className="text-xs font-bold text-white block">Visual Theme</span>
            <div className="grid grid-cols-2 gap-1.5">
              {['dark', 'premium', 'light', 'minimalist'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className={`py-1 text-xs font-mono uppercase tracking-wider transition cursor-pointer border ${theme === t ? 'border-white/60 bg-white/15 text-white font-bold' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* Right Canvas Stage: Mockup Container with Browser Chrome */}
        <main
          ref={previewContainerRef}
          className="flex-1 bg-[#05070a] p-3 sm:p-6 flex flex-col items-center justify-start overflow-y-auto"
        >
          {/* Browser Frame */}
          <div className={`w-full ${isMobileView ? 'max-w-[390px]' : 'max-w-5xl'} bg-[#0a0d16] border border-[#1f273b] shadow-2xl flex flex-col transition-all duration-300 my-auto`}>
            
            {/* Address Bar Chrome */}
            <div className="px-4 py-2.5 bg-[#0e121d] border-b border-[#1b2336] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
              </div>

              {/* Labeled Preview URL */}
              <div className="flex-1 max-w-md mx-3 px-3 py-1 bg-[#131826] border border-[#232c42] flex items-center justify-between text-xs text-slate-300 font-mono shadow-inner">
                <div className="flex items-center gap-1.5 truncate">
                  <Lock size={11} className="text-emerald-400 shrink-0" />
                  <span className="truncate text-[11px]">https://{cleanHandle}.colaunch.app</span>
                </div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 bg-white/5 px-1.5 py-0.5 border border-white/10 shrink-0 ml-2">
                  Preview URL
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <button
                  type="button"
                  onClick={() => handleRegenerateCopy('professional')}
                  disabled={isRegenerating}
                  className="p-1 hover:text-white transition cursor-pointer"
                  title="Regenerate copy"
                >
                  <RotateCcw size={13} className={isRegenerating ? 'animate-spin text-white' : ''} />
                </button>
              </div>
            </div>

            {/* Viewport Content */}
            <div className="overflow-y-auto custom-scrollbar max-h-[82vh]">
              <AppMockup
                theme={theme}
                blueprint={currentBlueprint}
                creatorData={{ ...creatorData, landingCopy, monthly_price: currentPrice }}
                isMobile={isMobileView}
                viewMode="landing"
                onPlayVideo={v => setPlayingVideo(v)}
              />
            </div>
          </div>
        </main>

      </div>

      {/* Video Modal if referenced from origin */}
      {playingVideo && (
        <VideoPlayerModal
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
          creatorData={creatorData}
          dynamicAccent={dynamicAccent}
          isLight={false}
        />
      )}

      {/* Toast Notice */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[120] px-4 py-2 bg-[#121624] border border-[#2b354d] text-white text-xs font-mono shadow-2xl flex items-center gap-2 animate-fade-in">
          <span className="w-2 h-2 rounded-full" style={{ background: dynamicAccent }} />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  )
}
