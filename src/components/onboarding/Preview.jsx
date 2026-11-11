import { useState, useEffect, useRef } from 'react'
import { useForge, getAccent } from '../../App'
import {
  ArrowRight, ArrowLeft, Check, Lock, Smartphone, Laptop, Maximize2, Minimize2,
  RotateCcw, Trash2, X, ExternalLink, Play, ChevronDown, AlertCircle, Layers,
  BarChart2, Calendar, MessageSquare, Settings, Cpu, Activity, Compass
} from 'lucide-react'
import CoLaunchLogo from '../ui/CoLaunchLogo'
import OnboardingStepIndicator from '../ui/OnboardingStepIndicator'
import { parseFollowerCount, generateLandingCopyAI } from '../../services/ai'
import { calculateSubscriptionRevenue, clampPrice, REVENUE_DISCLAIMER } from '../../utils/subscriptionRevenue'
import { cleanPostTitle } from '../../services/scraper'
import { buildDeterministicLandingCopy, getInitialLandingCopy } from '../../services/landingCopy'

export { cleanPostTitle }

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function isLightColor(hex) {
  if (!hex || typeof hex !== 'string') return false
  const clean = hex.replace('#', '').trim()
  const r = parseInt(clean.slice(0, 2), 16) || 0
  const g = parseInt(clean.slice(2, 4), 16) || 0
  const b = parseInt(clean.slice(4, 6), 16) || 0
  return ((r * 299 + g * 587 + b * 114) / 1000) > 135
}

function hexToRgbStr(hex) {
  const clean = String(hex || '').replace('#', '').trim()
  if (clean.length !== 6) return '200,30,60'
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  if ([r, g, b].some(Number.isNaN)) return '200,30,60'
  return `${r},${g},${b}`
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

function getScrollParent(node) {
  let el = node?.parentElement
  while (el && el !== document.body) {
    const oy = window.getComputedStyle(el).overflowY
    if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight) return el
    el = el.parentElement
  }
  return null
}

function isUsableCopy(c) {
  return Boolean(
    c &&
    typeof c.headline === 'string' && c.headline.trim() &&
    Array.isArray(c.howItWorks) && c.howItWorks.length > 0 &&
    Array.isArray(c.features) && c.features.length > 0 &&
    Array.isArray(c.faq) && c.faq.length > 0 &&
    c.cta && typeof c.cta === 'object'
  )
}

// All landing surfaces are dark. Legacy stored themes map onto these.
const SURFACES = {
  dark:     { bg: '#07080b', alt: '#0a0c11', card: '#0d1017', raised: '#11151e', border: '#1a1f2c', strong: '#2a3144' },
  midnight: { bg: '#05070f', alt: '#080b16', card: '#0b1020', raised: '#10172b', border: '#18203a', strong: '#27325c' },
  ink:      { bg: '#000000', alt: '#050505', card: '#0a0a0a', raised: '#111111', border: '#1c1c1c', strong: '#2e2e2e' },
}

function normalizeTheme(t) {
  if (t === 'premium') return 'midnight'
  if (t === 'minimalist') return 'ink'
  if (t === 'midnight' || t === 'ink' || t === 'dark') return t
  return 'dark'
}

const THEME_LABELS = { dark: 'Graphite', midnight: 'Midnight', ink: 'Ink' }

const FEATURE_ICONS = [Layers, BarChart2, Calendar, MessageSquare, Settings, Cpu, Activity, Compass]

// ─────────────────────────────────────────────────────────────────────────────
// Exported platform / media helpers (imported elsewhere, keep signatures)
// ─────────────────────────────────────────────────────────────────────────────

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

  if (platform === 'instagram') return `https://www.instagram.com/${clean}/`
  if (platform === 'tiktok') return `https://www.tiktok.com/@${clean}`
  if (platform === 'twitter' || platform === 'x') return `https://x.com/${clean}`
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

// ─────────────────────────────────────────────────────────────────────────────
// Video modal (used for the "where this idea comes from" references)
// ─────────────────────────────────────────────────────────────────────────────

export function VideoPlayerModal({ video, onClose, creatorData, dynamicAccent }) {
  useEffect(() => {
    if (!video) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [video, onClose])

  if (!video) return null

  const platform = (creatorData?.platform || 'youtube').toLowerCase()
  const platformInfo = getPlatformInfo(platform)
  const videoId = platform === 'youtube' ? extractYouTubeId(video) : null
  const igShortcode = platform === 'instagram' ? extractInstagramCode(video) : null
  const directVideoUrl = video.videoUrl || video.video_url || video.mediaUrl || (video.url && String(video.url).match(/\.(mp4|webm|mov)(\?|$)/i) ? video.url : null)
  const videoTitle = video.title || (platform === 'instagram' ? 'Instagram Post' : 'Channel video')
  const creatorUrl = getCreatorChannelUrl(creatorData)
  const postUrl = video.url || (videoId ? `https://www.youtube.com/watch?v=${videoId}` : (igShortcode ? `https://www.instagram.com/p/${igShortcode}/` : creatorUrl))
  const thumbUrl = video.thumbnail || video.thumbnailUrl || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : '')

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-[#0b0d12] border border-[#232a3d] shadow-2xl flex flex-col overflow-hidden max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-[#1a1f2c] flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            <span className="w-2 h-2 shrink-0" style={{ backgroundColor: dynamicAccent }} />
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 shrink-0">
              Where this idea comes from
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-xs font-bold text-white truncate">{cleanPostTitle(videoTitle, 65)}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close"
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
            <video src={directVideoUrl} controls autoPlay className="w-full h-full object-contain" />
          ) : thumbUrl ? (
            <div className="relative w-full h-full">
              <img src={thumbUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/40">
                <p className="text-sm text-white font-medium mb-3">Reference from the channel catalog</p>
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
// Small shared UI atoms
// ─────────────────────────────────────────────────────────────────────────────

function Eyebrow({ children, accent }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-[0.18em]" style={{ color: accent }}>
      <span className="w-1.5 h-1.5" style={{ background: accent }} />
      {children}
    </span>
  )
}

function CtaButton({ onClick, accent, onAccent, children, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-bold uppercase tracking-wider transition hover:brightness-110 active:scale-[0.98] cursor-pointer ${className}`}
      style={{ background: accent, color: onAccent }}
    >
      {children}
    </button>
  )
}

function Track({ pct, accent, track }) {
  return (
    <div className="h-1.5 w-full" style={{ background: track }}>
      <div className="h-full" style={{ width: `${pct}%`, background: accent }} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Product mockup: a neutral, category-matched software window.
// All values are illustrative and labelled "Sample data".
// ─────────────────────────────────────────────────────────────────────────────

export function ProductMockupPreview({
  category = 'tool',
  blueprint = {},
  creatorData = {},
  dynamicAccent = '#c81e3c',
  isMobileFrame = false,
  surface
}) {
  const s = surface || SURFACES.dark
  const rgb = hexToRgbStr(dynamicAccent)
  const name = blueprint.name || creatorData.productName || 'Software Application'
  const cat = String(blueprint.raw?.product_category || blueprint.category || blueprint.type || category || 'tool').toLowerCase()

  const rawFeatures = Array.isArray(blueprint.features) && blueprint.features.length > 0
    ? blueprint.features
    : ['Interactive Workspace', 'Automated Calculations', 'Saved User Projects', 'Live Telemetry']
  const features = rawFeatures
    .map(f => (typeof f === 'string' ? f : (f?.title || f?.label || f?.name || '')))
    .filter(Boolean)

  const price = clampPrice(blueprint.monthly_price || blueprint.monthlyPrice || creatorData?.monthly_price || 19)

  const isCalc = /calc|formula|estimat/.test(cat)
  const isTracker = /track|log|milestone/.test(cat)
  const isPlanner = /plan|roadmap|sprint/.test(cat)
  const isCommunity = /communit|portal|forum|member/.test(cat)

  const renderMockupCanvas = () => {
    if (isCalc) {
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-2.5 bg-[#121624] border border-[#20293d]">
              <span className="text-[9px] font-mono text-slate-400 block uppercase">Input Parameter</span>
              <span className="text-sm font-bold text-white font-mono mt-0.5 block">84.50</span>
              <span className="text-[9px] text-cyan-400 font-mono">Calibrated baseline</span>
            </div>
            <div className="p-2.5 bg-[#121624] border border-[#20293d]">
              <span className="text-[9px] font-mono text-slate-400 block uppercase">Variance Factor</span>
              <span className="text-sm font-bold text-white font-mono mt-0.5 block">1.28x</span>
              <span className="text-[9px] text-sky-400 font-mono">Optimal tolerance</span>
            </div>
            <div className="p-2.5 bg-[#121624] border border-[#20293d]" style={{ borderColor: `${dynamicAccent}66` }}>
              <span className="text-[9px] font-mono text-slate-400 block uppercase">Projected Output</span>
              <span className="text-sm font-bold text-white font-mono mt-0.5 block" style={{ color: dynamicAccent }}>+34.2%</span>
              <span className="text-[9px] text-slate-400 font-mono">Automated result</span>
            </div>
          </div>
          <div className="p-2.5 bg-[#10141f] border border-[#1e2538] space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-mono text-[10px]">Dynamic Variable Slider</span>
              <span className="font-mono text-[10px] text-slate-400">72%</span>
            </div>
            <div className="h-1.5 w-full bg-[#1b2234]">
              <div className="h-full" style={{ width: '72%', background: dynamicAccent }} />
            </div>
          </div>
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex gap-1.5">
              <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
                Run Simulation
              </span>
              <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-[10px] font-mono text-slate-400">
                Export CSV
              </span>
            </div>
            <span className="text-[9px] font-mono text-slate-500">Live computation engine</span>
          </div>
        </div>
      )
    }

    if (isTracker) {
      return (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-[#20273a]">
            <div>
              <span className="text-xs font-bold text-white block">Execution Progress & Daily Logging</span>
              <span className="text-[10px] text-slate-400 font-mono">4 of 5 weekly objectives completed</span>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/40 border border-cyan-500/30">
              On Track
            </span>
          </div>
          <div className="space-y-1.5">
            {features.slice(0, 3).map((f, idx) => (
              <div key={idx} className="p-2 bg-[#121624] border border-[#1f273c] flex items-center justify-between">
                <div className="flex items-center gap-2 truncate pr-2">
                  <div className="w-4 h-4 border border-cyan-500/40 bg-cyan-950/40 flex items-center justify-center shrink-0">
                    <Check size={11} className="text-cyan-400" />
                  </div>
                  <span className="text-xs text-slate-200 font-medium truncate">{f}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">Day {idx + 1} logged</span>
              </div>
            ))}
          </div>
          <div className="p-2 bg-[#0f1320] border border-[#1b2336] flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Next automated milestone audit</span>
            <span className="text-slate-200">Tomorrow at 09:00 UTC</span>
          </div>
        </div>
      )
    }

    if (isPlanner) {
      return (
        <div className="space-y-2.5">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 bg-[#121624] border border-[#20283c]">
              <span className="text-[9px] font-mono uppercase text-slate-400 block">Stage 1</span>
              <span className="text-xs font-bold text-cyan-400">Validated</span>
              <div className="h-1 w-full bg-cyan-500/20 mt-1"><div className="h-full bg-cyan-400 w-full" /></div>
            </div>
            <div className="p-2 bg-[#121624] border border-[#20283c]" style={{ borderColor: `${dynamicAccent}66` }}>
              <span className="text-[9px] font-mono uppercase text-slate-400 block">Stage 2</span>
              <span className="text-xs font-bold text-white">Active Sprint</span>
              <div className="h-1 w-full bg-white/10 mt-1"><div className="h-full" style={{ width: '65%', background: dynamicAccent }} /></div>
            </div>
            <div className="p-2 bg-[#121624] border border-[#20283c]">
              <span className="text-[9px] font-mono uppercase text-slate-400 block">Stage 3</span>
              <span className="text-xs font-bold text-slate-400">Rollout</span>
              <div className="h-1 w-full bg-white/5 mt-1"><div className="h-full bg-white/20 w-0" /></div>
            </div>
          </div>
          <div className="p-2.5 bg-[#10141f] border border-[#1b2336] space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Priority Execution Sequence</span>
            <p className="text-xs text-slate-200 truncate">{features[0] || 'Centralized workflow management'}</p>
          </div>
        </div>
      )
    }

    if (isCommunity) {
      return (
        <div className="space-y-2.5">
          <div className="p-2.5 bg-[#131724] border border-[#222a3e] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold">Verified Member Workspace</span>
              <span className="text-[10px] font-mono text-slate-400">${price}/mo access</span>
            </div>
            <p className="text-xs text-slate-200 leading-snug">
              Collaborative portal with direct tooling, scheduled Q&amp;A queue, and member workspace files.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-[#101420] border border-[#1d2538] space-y-0.5">
              <span className="text-[9px] font-mono text-slate-400 block">Workflow Channel</span>
              <span className="text-white font-medium block truncate">#core-tooling</span>
            </div>
            <div className="p-2 bg-[#101420] border border-[#1d2538] space-y-0.5">
              <span className="text-[9px] font-mono text-slate-400 block">Resource Sync</span>
              <span className="text-cyan-400 font-medium block">All Files Ready</span>
            </div>
          </div>
        </div>
      )
    }

    // Default dashboard / tool / automation / software engine view (matches Screenshot 5)
    return (
      <div className="space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-[#121624] border border-[#20273c]">
            <span className="text-[9px] font-mono text-slate-400 uppercase block">Active Engine</span>
            <span className="text-xs sm:text-sm font-bold text-white font-mono mt-0.5 block">v1.2 Live</span>
            <span className="text-[9px] text-cyan-400 font-mono">Sync healthy</span>
          </div>
          <div className="p-2 bg-[#121624] border border-[#20273c]">
            <span className="text-[9px] font-mono text-slate-400 uppercase block">Throughput</span>
            <span className="text-xs sm:text-sm font-bold text-white font-mono mt-0.5 block">99.4%</span>
            <span className="text-[9px] text-sky-400 font-mono">Automated</span>
          </div>
          <div className="p-2 bg-[#121624] border border-[#20273c]" style={{ borderColor: `${dynamicAccent}55` }}>
            <span className="text-[9px] font-mono text-slate-400 uppercase block">Subscription</span>
            <span className="text-xs sm:text-sm font-bold text-white font-mono mt-0.5 block">${price}/mo</span>
            <span className="text-[9px] text-slate-400 font-mono">Per member</span>
          </div>
        </div>

        <div className="p-2.5 bg-[#101420] border border-[#1c2438] space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300 pb-1 border-b border-white/5">
            <span className="font-mono text-[9px] uppercase text-slate-400">Core Software Capabilities</span>
            <span className="text-[9px] font-mono text-cyan-400">Active Pipeline</span>
          </div>
          <div className="space-y-1">
            {features.slice(0, 3).map((feat, idx) => (
              <div key={idx} className="flex items-center justify-between text-[11px] py-0.5">
                <span className="text-slate-300 truncate max-w-[75%]">{feat}</span>
                <span className="text-[9px] font-mono text-slate-500 shrink-0">Configured</span>
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
      <div className="bg-[#101420] px-3 py-2 border-b border-[#20273c] flex items-center justify-between select-none">
        <div className="flex items-center gap-2 truncate pr-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-slate-700" />
            <span className="w-2 h-2 rounded-full bg-slate-700" />
            <span className="w-2 h-2 rounded-full bg-slate-700" />
          </div>
          <span className="text-[11px] font-mono font-medium text-slate-300 truncate">
            {name}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-widest text-slate-400 bg-white/5 border border-white/10">
            Preview · Software Engine
          </span>
        </div>
      </div>

      {/* Main Canvas Body */}
      <div className="p-3.5 sm:p-4 bg-[#0b0e18] relative">
        {renderMockupCanvas()}

        {/* Subtle Watermark Banner */}
        <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-slate-500">
          <span>CoLaunch Software Platform</span>
          <span>PREVIEW · ILLUSTRATIVE UI</span>
        </div>
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────
// Waitlist modal (demand-test capture). Preview only: nothing is stored.
// ─────────────────────────────────────────────────────────────────────────────

function DemandWaitlistModal({ isOpen, onClose, productName, monthlyPrice, creatorHandle, dynamicAccent = '#c81e3c', surface }) {
  const s = surface || SURFACES.dark
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const onAccent = isLightColor(dynamicAccent) ? '#08090c' : '#ffffff'

  useEffect(() => {
    if (!isOpen) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) {
      setSubmitted(false)
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const clean = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setSubmitted(true)
    // TODO: connect signup endpoint. No project record exists yet during onboarding,
    // so nothing is stored here. Wire this to a waitlist endpoint once the page is published.
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md border p-6 shadow-2xl text-slate-100"
        style={{ background: s.card, borderColor: s.strong }}
        onClick={e => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition cursor-pointer">
          <X size={18} />
        </button>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Eyebrow accent={dynamicAccent}>Waitlist</Eyebrow>
              <h3 className="text-xl font-extrabold text-white tracking-tight">Join the waitlist for {productName}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Co-created with @{String(creatorHandle).replace(/^@/, '')}. Planned price: ${monthlyPrice}/mo. Joining does not charge you.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-300 block">Email address</label>
              <input
                type="email"
                autoFocus
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="you@example.com"
                className="w-full px-3.5 py-3 text-sm text-white placeholder-slate-600 border focus:outline-none"
                style={{ background: s.raised, borderColor: error ? '#ef4444' : s.strong }}
              />
              {error && <p className="text-[11px] text-red-400 font-mono">{error}</p>}
            </div>

            <CtaButton accent={dynamicAccent} onAccent={onAccent} className="w-full py-3 text-xs" onClick={handleSubmit}>
              Join waitlist · ${monthlyPrice}/mo
            </CtaButton>
          </form>
        ) : (
          <div className="py-4 text-center space-y-3">
            <div className="w-10 h-10 mx-auto flex items-center justify-center border" style={{ borderColor: dynamicAccent, color: dynamicAccent }}>
              <Check size={20} />
            </div>
            <h4 className="text-lg font-extrabold text-white">Form works, nothing saved</h4>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              This is a preview of the waitlist for <strong>{productName}</strong>. Your email was not stored.
            </p>
            <div className="p-3 border text-[11px] font-mono text-amber-300/90 leading-relaxed" style={{ background: s.raised, borderColor: s.border }}>
              Signups are collected only after the landing page is published.
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-slate-200 hover:text-white border transition cursor-pointer"
              style={{ borderColor: s.strong }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Product landing page (demand-test conversion page)
// ─────────────────────────────────────────────────────────────────────────────

function ProductLandingPage({ styles, creatorData, blueprint, landingCopy, isMobile, onPlayVideo, onOpenWaitlist }) {
  const rootRef = useRef(null)
  const navRef = useRef(null)
  const [openFaq, setOpenFaq] = useState(0)

  const s = styles.surface
  const accent = styles.accent
  const rgb = styles.rgb
  const onAccent = isLightColor(accent) ? '#08090c' : '#ffffff'
  const m = isMobile

  const name = blueprint?.name || creatorData?.productName || 'Software Workspace'
  const monthlyPrice = clampPrice(blueprint?.monthly_price || creatorData?.monthly_price || 19)
  const followersCount = parseFollowerCount(creatorData?.followers || creatorData?.subscriberCount || 0)
  const fmtFollowers = followersCount > 0 ? fmt(followersCount) : ''
  const creatorHandle = (creatorData?.handle || creatorData?.name || 'creator').replace(/^@/, '')
  const creatorBio = creatorData?.description || creatorData?.bio || ''
  const avatarUrl = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''

  const copy = landingCopy || buildDeterministicLandingCopy(creatorData, blueprint)
  const problemPoints = Array.isArray(copy.problemPoints) ? copy.problemPoints : []
  const steps = Array.isArray(copy.howItWorks) ? copy.howItWorks : []
  const feats = Array.isArray(copy.features) ? copy.features : []
  const faqs = Array.isArray(copy.faq) ? copy.faq : []
  const cta = copy.cta || {}
  const audienceLabel = copy.targetAudience || blueprint?.target_audience || 'your community'

  const rawPosts = Array.isArray(creatorData?.recentPosts) && creatorData.recentPosts.length > 0
    ? creatorData.recentPosts
    : Array.isArray(creatorData?.videos) && creatorData.videos.length > 0
      ? creatorData.videos
      : []
  const originVideos = rawPosts.slice(0, 3)

  const included = [...feats.map(f => f.title).filter(Boolean), 'Hosting and updates included', 'Cancel anytime']

  const marqueeItems = feats.map(f => f.title).filter(Boolean)
  const marqueeHalf = marqueeItems.length > 0 ? Array.from({ length: 4 }, () => marqueeItems).flat() : []
  const marqueeTrack = [...marqueeHalf, ...marqueeHalf]

  const scrollToSection = (id) => {
    const root = rootRef.current
    const target = root?.querySelector(`[data-section="${id}"]`)
    if (!target) return
    const navH = navRef.current ? navRef.current.getBoundingClientRect().height : 60
    const parent = getScrollParent(root)
    if (parent) {
      const top = parent.scrollTop + (target.getBoundingClientRect().top - parent.getBoundingClientRect().top) - navH
      parent.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    } else {
      const top = window.scrollY + target.getBoundingClientRect().top - navH
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    }
  }

  const scrollToTop = () => {
    const parent = getScrollParent(rootRef.current)
    if (parent) parent.scrollTo({ top: 0, behavior: 'smooth' })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const pad = m ? 'px-4 py-12' : 'px-6 lg:px-10 py-16 lg:py-24'
  const h2 = m ? 'text-2xl' : 'text-3xl lg:text-4xl'
  const sectionBorder = { borderColor: s.border }

  const navLinks = [
    problemPoints.length > 0 ? ['problem', 'Problem'] : null,
    ['how-it-works', 'How it works'],
    ['features', 'Features'],
    ['pricing', 'Pricing'],
    ['faq', 'FAQ'],
  ].filter(Boolean)

  return (
    <div ref={rootRef} className="w-full flex flex-col font-sans text-slate-100 selection:bg-white/20" style={{ background: s.bg }}>
      <style>{`
        @keyframes cl-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
      `}</style>

      {/* NAV */}
      <nav
        ref={navRef}
        className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b flex items-center justify-between select-none ${m ? 'px-4 py-2.5' : 'px-6 lg:px-10 py-3'}`}
        style={{ background: `${s.bg}d9`, borderColor: s.border }}
      >
        <button type="button" onClick={scrollToTop} className="flex items-center gap-2.5 text-left cursor-pointer min-w-0">
          <span className="w-6 h-6 flex items-center justify-center font-black text-xs shrink-0" style={{ background: accent, color: onAccent }}>
            {name.charAt(0).toUpperCase()}
          </span>
          <span className="font-bold text-sm text-white tracking-tight truncate max-w-[160px] sm:max-w-xs">{name}</span>
        </button>

        {!m && (
          <div className="hidden md:flex items-center gap-6 text-xs text-slate-400 font-medium">
            {navLinks.map(([id, label]) => (
              <button key={id} type="button" onClick={() => scrollToSection(id)} className="hover:text-white transition cursor-pointer">
                {label}
              </button>
            ))}
          </div>
        )}

        <CtaButton onClick={onOpenWaitlist} accent={accent} onAccent={onAccent} className="px-3.5 py-2 text-[11px] shrink-0">
          {m ? `Join · $${monthlyPrice}/mo` : `Join waitlist · $${monthlyPrice}/mo`}
        </CtaButton>
      </nav>

      {/* HERO */}
      <section data-section="top" className="relative overflow-hidden border-b" style={{ background: s.bg, ...sectionBorder }}>
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(60% 55% at 50% 0%, rgba(${rgb},0.24), transparent 70%), linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)`,
            backgroundSize: 'auto, 44px 44px, 44px 44px',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 60%, transparent)',
            maskImage: 'linear-gradient(to bottom, #000 60%, transparent)'
          }}
        />

        <div className={`relative max-w-5xl mx-auto text-center ${m ? 'px-4 pt-12 pb-10' : 'px-6 lg:px-10 pt-20 pb-20'}`}>
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 border text-[11px] font-mono uppercase tracking-wider text-slate-200"
            style={{ background: `rgba(${rgb},0.10)`, borderColor: `rgba(${rgb},0.30)` }}
          >
            <span className="w-1.5 h-1.5" style={{ background: accent }} />
            Built for {audienceLabel}
          </span>

          <h1 className={`mt-6 mx-auto max-w-3xl font-black tracking-tight leading-[1.05] text-white ${m ? 'text-3xl' : 'text-4xl sm:text-5xl lg:text-6xl'}`}>
            {copy.headline}
          </h1>

          <p className={`mt-5 mx-auto max-w-xl text-slate-300 leading-relaxed ${m ? 'text-sm' : 'text-base sm:text-lg'}`}>
            {copy.subheadline}
          </p>

          <div className={`mt-8 flex items-stretch justify-center gap-3 ${m ? 'flex-col' : 'flex-col sm:flex-row'}`}>
            <CtaButton onClick={onOpenWaitlist} accent={accent} onAccent={onAccent} className="px-6 py-3.5 text-xs sm:text-sm shadow-lg">
              Join waitlist · ${monthlyPrice}/mo
              <ArrowRight size={15} />
            </CtaButton>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="px-6 py-3.5 text-xs sm:text-sm font-bold text-slate-200 hover:text-white border transition cursor-pointer"
              style={{ borderColor: s.strong, background: `${s.card}cc` }}
            >
              See how it works
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] font-mono text-slate-400">
            {['Flat monthly plan', 'Cancel anytime', 'Joining is free'].map(t => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check size={12} style={{ color: accent }} strokeWidth={3} />
                {t}
              </span>
            ))}
          </div>

          <div className="relative mt-14 mx-auto max-w-4xl text-left">
            <div
              aria-hidden="true"
              className="absolute inset-x-10 -top-6 h-24 blur-3xl pointer-events-none"
              style={{ background: `rgba(${rgb},0.22)` }}
            />
            <div className="relative">
              <ProductMockupPreview
                category={blueprint?.raw?.product_category || blueprint?.category || blueprint?.type || 'tool'}
                blueprint={blueprint}
                creatorData={creatorData}
                dynamicAccent={accent}
                isMobileFrame={m}
                surface={s}
              />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE MARQUEE */}
      {marqueeTrack.length > 0 && (
        <div className="overflow-hidden border-b py-3.5" style={{ background: s.alt, ...sectionBorder }}>
          <div className="flex w-max items-center gap-8 whitespace-nowrap" style={{ animation: 'cl-marquee 40s linear infinite' }}>
            {marqueeTrack.map((t, i) => (
              <span key={i} className="inline-flex items-center gap-8 text-xs font-mono uppercase tracking-[0.16em] text-slate-400">
                {t}
                <span className="w-1.5 h-1.5" style={{ background: accent }} />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* STAT BAND */}
      <section className="border-b" style={{ background: s.bg, ...sectionBorder }}>
        <div className="max-w-5xl mx-auto grid grid-cols-3">
          {[
            { big: `$${monthlyPrice}`, unit: '/mo', label: 'One flat monthly plan' },
            { big: String(feats.length || 0), unit: '', label: 'Core features included' },
            { big: String(steps.length || 0), unit: '', label: 'Steps in the workflow' },
          ].map((st, i) => (
            <div
              key={st.label}
              className={`text-center ${m ? 'px-2 py-6' : 'px-6 py-10'} ${i > 0 ? 'border-l' : ''}`}
              style={sectionBorder}
            >
              <div className={`font-black font-mono text-white tracking-tight ${m ? 'text-2xl' : 'text-4xl lg:text-5xl'}`}>
                {st.big}
                {st.unit && <span className={`font-medium text-slate-500 ${m ? 'text-xs' : 'text-base'}`}>{st.unit}</span>}
              </div>
              <div className={`mt-2 text-slate-400 font-mono uppercase tracking-wider ${m ? 'text-[9px]' : 'text-[11px]'}`}>{st.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      {problemPoints.length > 0 && (
        <section data-section="problem" className={`border-b ${pad}`} style={{ background: s.alt, ...sectionBorder }}>
          <div className={`max-w-5xl mx-auto ${m ? 'space-y-8' : 'grid grid-cols-12 gap-12'}`}>
            <div className={m ? '' : 'col-span-5'}>
              <Eyebrow accent={accent}>The problem</Eyebrow>
              <h2 className={`mt-4 font-black tracking-tight text-white leading-tight ${h2}`}>
                The friction {name} is built to remove.
              </h2>
            </div>
            <div className={`space-y-3 ${m ? '' : 'col-span-7'}`}>
              {problemPoints.map((point, idx) => (
                <div key={idx} className="flex gap-4 p-4 sm:p-5 border" style={{ background: s.card, borderColor: s.border }}>
                  <span className="font-mono font-bold text-sm shrink-0" style={{ color: accent }}>
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm sm:text-[15px] text-slate-200 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section data-section="how-it-works" className={`border-b ${pad}`} style={{ background: s.bg, ...sectionBorder }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Eyebrow accent={accent}>How it works</Eyebrow>
            <h2 className={`mt-4 font-black tracking-tight text-white leading-tight ${h2}`}>
              From first click to result.
            </h2>
          </div>

          <div>
            {steps.map((step, idx) => (
              <div key={idx} className="relative flex gap-5 pb-10 last:pb-0">
                {idx < steps.length - 1 && (
                  <span className="absolute left-5 top-11 bottom-0 w-px" style={{ background: s.strong }} />
                )}
                <div
                  className="w-10 h-10 shrink-0 flex items-center justify-center border font-mono font-bold text-sm relative z-10"
                  style={{ background: s.card, borderColor: accent, color: accent }}
                >
                  {String(step.step ?? idx + 1).padStart(2, '0')}
                </div>
                <div className="pt-1.5 min-w-0">
                  <h3 className="text-base sm:text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section data-section="features" className={`border-b ${pad}`} style={{ background: s.alt, ...sectionBorder }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-10 max-w-2xl">
            <Eyebrow accent={accent}>What you get</Eyebrow>
            <h2 className={`mt-4 font-black tracking-tight text-white leading-tight ${h2}`}>
              Everything in one plan.
            </h2>
          </div>

          <div className={`grid gap-3 ${m ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {feats.map((f, idx) => {
              const Icon = FEATURE_ICONS[idx % FEATURE_ICONS.length]
              const spanFirst = feats.length % 2 === 1 && idx === 0 && !m
              return (
                <div
                  key={idx}
                  className={`group p-5 sm:p-6 border transition hover:border-white/20 ${spanFirst ? 'md:col-span-2' : ''}`}
                  style={{ background: s.card, borderColor: s.border }}
                >
                  <div
                    className="w-9 h-9 flex items-center justify-center border mb-4"
                    style={{ background: `rgba(${rgb},0.10)`, borderColor: `rgba(${rgb},0.30)`, color: accent }}
                  >
                    <Icon size={16} />
                  </div>
                  <h3 className="text-base font-bold text-white">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">{f.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CREATOR ORIGIN */}
      <section className={`border-b ${pad}`} style={{ background: s.bg, ...sectionBorder }}>
        <div className="max-w-4xl mx-auto">
          <div className={`flex items-center justify-between gap-4 pb-6 border-b ${m ? 'flex-col items-start' : ''}`} style={sectionBorder}>
            <div className="flex items-center gap-4 min-w-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={creatorHandle}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 object-cover border shrink-0"
                  style={{ borderColor: s.strong }}
                  onError={e => {
                    if (!e.currentTarget.dataset.proxied && avatarUrl.startsWith('http')) {
                      e.currentTarget.dataset.proxied = 'true'
                      e.currentTarget.src = `/api/proxy/avatar?url=${encodeURIComponent(avatarUrl)}`
                    } else {
                      e.currentTarget.style.display = 'none'
                    }
                  }}
                />
              ) : (
                <div className="w-12 h-12 flex items-center justify-center font-black text-white border shrink-0" style={{ background: s.raised, borderColor: s.strong }}>
                  {creatorHandle.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <Eyebrow accent={accent}>Why @{creatorHandle}</Eyebrow>
                {creatorBio && <p className="mt-1.5 text-sm text-slate-300 line-clamp-2 max-w-lg">{creatorBio}</p>}
              </div>
            </div>
            {fmtFollowers && (
              <div className={m ? '' : 'text-right shrink-0'}>
                <span className="text-2xl font-black text-white font-mono block">{fmtFollowers}</span>
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Audience</span>
              </div>
            )}
          </div>

          {originVideos.length > 0 && (
            <div className="pt-6 space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block">Where this idea comes from</span>
              <div className={`grid gap-3 ${m ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'}`}>
                {originVideos.map((vid, idx) => {
                  const title = cleanPostTitle(vid.title || vid.caption || 'Channel topic', 55)
                  const thumb = vid.thumbnail || ''
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onPlayVideo?.(vid)}
                      className="p-2.5 border flex items-center gap-3 text-left cursor-pointer hover:border-white/20 transition group"
                      style={{ background: s.card, borderColor: s.border }}
                    >
                      {thumb ? (
                        <img src={thumb} alt="" referrerPolicy="no-referrer" className="w-14 h-10 object-cover shrink-0" />
                      ) : (
                        <span className="w-14 h-10 flex items-center justify-center shrink-0" style={{ background: s.raised }}>
                          <Play size={12} className="text-slate-400" />
                        </span>
                      )}
                      <span className="text-xs text-slate-300 font-medium line-clamp-2 group-hover:text-white">{title}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* PRICING */}
      <section data-section="pricing" className={`border-b ${pad}`} style={{ background: s.alt, ...sectionBorder }}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <Eyebrow accent={accent}>Pricing</Eyebrow>
            <h2 className={`mt-4 font-black tracking-tight text-white leading-tight ${h2}`}>One plan. One price.</h2>
          </div>

          <div
            className="relative border overflow-hidden"
            style={{ background: s.card, borderColor: `rgba(${rgb},0.45)`, boxShadow: `0 30px 90px -30px rgba(${rgb},0.35)` }}
          >
            <div className="h-1 w-full" style={{ background: accent }} />
            <div className={m ? 'p-5 space-y-5' : 'p-8 space-y-6'}>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">Full access</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`font-black font-mono text-white ${m ? 'text-5xl' : 'text-6xl'}`}>${monthlyPrice}</span>
                  <span className="text-sm text-slate-400 font-mono">/ month</span>
                </div>
              </div>

              <div className={`grid gap-x-6 gap-y-2.5 pt-5 border-t ${m ? 'grid-cols-1' : 'grid-cols-2'}`} style={sectionBorder}>
                {included.map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-sm text-slate-200">
                    <Check size={14} className="mt-0.5 shrink-0" style={{ color: accent }} strokeWidth={3} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <CtaButton onClick={onOpenWaitlist} accent={accent} onAccent={onAccent} className="w-full py-3.5 text-xs sm:text-sm">
                Join waitlist · ${monthlyPrice}/mo
                <ArrowRight size={15} />
              </CtaButton>

              <p className="text-[11px] font-mono text-slate-500 text-center">Joining the waitlist does not charge you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section data-section="faq" className={`border-b ${pad}`} style={{ background: s.bg, ...sectionBorder }}>
          <div className="max-w-3xl mx-auto">
            <div className="mb-10">
              <Eyebrow accent={accent}>FAQ</Eyebrow>
              <h2 className={`mt-4 font-black tracking-tight text-white leading-tight ${h2}`}>Straight answers.</h2>
            </div>

            <div className="border-t" style={sectionBorder}>
              {faqs.map((item, idx) => {
                const open = openFaq === idx
                return (
                  <div key={idx} className="border-b" style={sectionBorder}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? -1 : idx)}
                      className="w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer"
                    >
                      <span className="text-sm sm:text-base font-bold text-white">{item.question}</span>
                      <ChevronDown
                        size={18}
                        className="shrink-0 text-slate-400 transition-transform"
                        style={{ transform: open ? 'rotate(180deg)' : 'none', color: open ? accent : undefined }}
                      />
                    </button>
                    {open && <p className="pb-5 pr-8 text-sm text-slate-400 leading-relaxed">{item.answer}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* FINAL CTA */}
      <section className={`relative overflow-hidden border-b ${m ? 'px-4 py-14' : 'px-6 lg:px-10 py-24'}`} style={{ background: s.alt, ...sectionBorder }}>
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(50% 70% at 50% 100%, rgba(${rgb},0.22), transparent 70%), linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: 'auto, 44px 44px, 44px 44px',
            WebkitMaskImage: 'linear-gradient(to top, #000 55%, transparent)',
            maskImage: 'linear-gradient(to top, #000 55%, transparent)'
          }}
        />
        <div className="relative max-w-2xl mx-auto text-center space-y-5">
          <h2 className={`font-black tracking-tight text-white leading-tight ${m ? 'text-2xl' : 'text-3xl lg:text-5xl'}`}>
            {cta.headline || `Get early access to ${name}`}
          </h2>
          {cta.subheadline && <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg mx-auto">{cta.subheadline}</p>}
          <CtaButton onClick={onOpenWaitlist} accent={accent} onAccent={onAccent} className="px-7 py-3.5 text-xs sm:text-sm shadow-xl">
            {cta.buttonText || `Join waitlist · $${monthlyPrice}/mo`}
            <ArrowRight size={15} />
          </CtaButton>
        </div>
      </section>

      <footer className="px-4 sm:px-8 py-6 text-center text-xs text-slate-500 font-mono" style={{ background: s.bg }}>
        © {new Date().getFullYear()} {name}. Co-created with @{creatorHandle}.
      </footer>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AppMockup: landing page view or product preview view
// ─────────────────────────────────────────────────────────────────────────────

export function AppMockup({
  theme = 'dark',
  blueprint,
  creatorData,
  isMobile,
  viewMode = 'landing',
  onSwitchView,
  onPlayVideo
}) {
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false)
  const accent = getAccent(creatorData)
  const dynamicAccent = accent.color
  const surface = SURFACES[normalizeTheme(theme)]
  const styles = { surface, accent: dynamicAccent, rgb: accent.rgb || hexToRgbStr(dynamicAccent) }

  if (!blueprint) return null

  const landingCopy = creatorData?.landingCopy || buildDeterministicLandingCopy(creatorData, blueprint)
  const monthlyPrice = clampPrice(blueprint?.monthly_price || creatorData?.monthly_price || 19)

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
          monthlyPrice={monthlyPrice}
          creatorHandle={creatorData?.handle || 'creator'}
          dynamicAccent={dynamicAccent}
          surface={surface}
        />
      </div>
    )
  }

  return (
    <div className="w-full p-4 sm:p-8 min-h-[520px] flex flex-col items-center justify-center" style={{ background: surface.bg }}>
      <div className="w-full max-w-3xl space-y-4">
        <div className="p-3 border flex items-center justify-between text-xs font-mono" style={{ background: surface.card, borderColor: surface.border }}>
          <span className="font-bold uppercase tracking-wider" style={{ color: dynamicAccent }}>Product preview</span>
          <span className="text-slate-400">What subscribers see</span>
        </div>
        <ProductMockupPreview
          category={blueprint?.raw?.product_category || blueprint?.category || blueprint?.type || 'tool'}
          blueprint={blueprint}
          creatorData={creatorData}
          dynamicAccent={dynamicAccent}
          isMobileFrame={isMobile}
          surface={surface}
        />
        {onSwitchView && (
          <div className="text-center pt-2">
            <button type="button" onClick={() => onSwitchView('landing')} className="text-xs font-mono text-slate-400 hover:text-white underline cursor-pointer">
              ← Back to landing page
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding step: Preview (studio shell around the landing page)
// ─────────────────────────────────────────────────────────────────────────────

function PanelTitle({ children, aside }) {
  return (
    <div className="flex items-center justify-between mb-2.5">
      <span className="text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-slate-300">{children}</span>
      {aside}
    </div>
  )
}

export default function Preview() {
  const { next, creatorData, updateCreator, prev, requestWipeCreator } = useForge()
  const accent = getAccent(creatorData)
  const dynamicAccent = accent.color
  const onAccent = isLightColor(dynamicAccent) ? '#08090c' : '#ffffff'

  const [theme, setTheme] = useState(() => normalizeTheme(creatorData?.theme))
  const [viewMode, setViewMode] = useState(creatorData?.viewMode === 'mobile' ? 'mobile' : 'landing')
  const isMobileView = viewMode === 'mobile'
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [playingVideo, setPlayingVideo] = useState(null)
  const frameRef = useRef(null)
  const toastTimer = useRef(null)

  // The chosen product is preserved exactly as selected in the Blueprint step.
  const [currentBlueprint, setCurrentBlueprint] = useState(() => creatorData?.blueprint || null)
  const [landingCopy, setLandingCopy] = useState(() => {
    const bp = creatorData?.blueprint || null
    return bp ? getInitialLandingCopy(creatorData, bp) : null
  })

  useEffect(() => {
    if (!currentBlueprint && creatorData?.blueprint) {
      setCurrentBlueprint(creatorData.blueprint)
      setLandingCopy(getInitialLandingCopy(creatorData, creatorData.blueprint))
    }
  }, [creatorData, currentBlueprint])

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  const showToast = (msg) => {
    setToastMessage(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMessage(''), 2600)
  }

  const committedPrice = clampPrice(currentBlueprint?.monthly_price || creatorData?.monthly_price || 19)
  const [priceDraft, setPriceDraft] = useState(committedPrice)

  const persist = (patch) => {
    const updated = { ...creatorData, ...patch }
    updateCreator(updated)
    try {
      localStorage.setItem('forge_creator_data', JSON.stringify(updated))
    } catch { /* storage unavailable */ }
  }

  // Price changes never regenerate copy; they only update price-dependent fields.
  const handlePriceChange = (newPrice) => {
    if (!currentBlueprint) return
    const price = clampPrice(newPrice)
    const updatedBp = { ...currentBlueprint, monthly_price: price }
    setCurrentBlueprint(updatedBp)

    const audienceCount = parseFollowerCount(creatorData?.followers || creatorData?.subscriberCount || 0)
    const revEst = audienceCount > 0
      ? calculateSubscriptionRevenue({
        audience: audienceCount,
        monthlyPrice: price,
        engagementRate: parseFloat(creatorData?.engagementRate) || 3.5,
      })
      : null

    const base = landingCopy || {}
    const updatedCopy = {
      ...base,
      monthlyPrice: price,
      pricing: { ...(base.pricing || {}), price, ctaText: `Join waitlist · $${price}/mo` },
      cta: { ...(base.cta || {}), buttonText: `Join waitlist · $${price}/mo` },
    }
    setLandingCopy(updatedCopy)
    persist({ blueprint: updatedBp, monthly_price: price, revenue_estimate: revEst, landingCopy: updatedCopy })
    showToast(`Price set to $${price}/mo`)
  }

  useEffect(() => {
    if (!currentBlueprint || priceDraft === committedPrice) return undefined
    const t = setTimeout(() => handlePriceChange(priceDraft), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceDraft])

  // Regenerate only rewrites copy. Name, summary, audience, price, evidence and features stay untouched.
  const handleRegenerateCopy = async (tone = 'professional') => {
    if (isRegenerating || !currentBlueprint) return
    setIsRegenerating(true)
    showToast(`Rewriting copy (${tone})…`)
    try {
      const fresh = await generateLandingCopyAI(creatorData, currentBlueprint, { tone })
      if (isUsableCopy(fresh)) {
        setLandingCopy(fresh)
        persist({ landingCopy: fresh })
        showToast('Landing copy updated')
      } else {
        throw new Error('Unusable copy returned')
      }
    } catch (err) {
      console.warn('[Preview] Copy regeneration fell back to deterministic copy:', err)
      const fallback = buildDeterministicLandingCopy(creatorData, currentBlueprint)
      setLandingCopy(fallback)
      persist({ landingCopy: fallback })
      showToast('AI copy unavailable, used the default copy')
    } finally {
      setIsRegenerating(false)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      frameRef.current?.requestFullscreen?.().catch(() => showToast('Fullscreen is not available'))
    } else {
      document.exitFullscreen?.().catch(() => { })
    }
  }

  const handleApprove = () => {
    persist({
      blueprint: currentBlueprint,
      productName: currentBlueprint?.name || creatorData?.productName,
      features: currentBlueprint?.features || [],
      landingCopy,
      theme,
      isMobileView,
      viewMode,
    })
    showToast('Landing page approved')
    setTimeout(() => next(), 350)
  }

  const rawH = creatorData?.handle || creatorData?.name || 'creator'
  const cleanHandle = rawH.replace(/^@+/, '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '') || 'creator'

  if (!currentBlueprint) {
    return (
      <div className="min-h-screen bg-[#07080b] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 border border-[#1a1f2c] bg-[#0d1017] space-y-4 shadow-2xl">
          <AlertCircle size={32} className="text-amber-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">No product selected</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Go back to the Blueprint step and choose a subscription software idea for your audience.
          </p>
          <button
            type="button"
            onClick={prev}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
            style={{ background: dynamicAccent, color: onAccent }}
          >
            ← Back to Blueprint
          </button>
        </div>
      </div>
    )
  }

  const audienceCount = parseFollowerCount(creatorData?.followers || creatorData?.subscriberCount || 0)
  const revEst = audienceCount > 0
    ? calculateSubscriptionRevenue({
      audience: audienceCount,
      monthlyPrice: committedPrice,
      engagementRate: parseFloat(creatorData?.engagementRate) || 3.5,
    })
    : null

  const mockCreator = { ...creatorData, landingCopy, monthly_price: committedPrice }
  const surface = SURFACES[theme]

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-[#07080b] text-slate-100 selection:bg-white/20">

      {/* HEADER */}
      <header className="h-16 border-b border-[#1a1f2c] bg-[#0a0c11]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-50">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={prev}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-white/5 border border-white/10 transition cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Blueprint</span>
          </button>
          <div className="h-4 w-px bg-[#1f2433]" />
          <CoLaunchLogo size={18} href="https://co-launch.app" color={dynamicAccent} showWordmark={true} />
          <div className="h-4 w-px bg-[#1f2433] hidden md:block" />
          <div className="hidden md:flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold text-white truncate max-w-[200px]">{currentBlueprint.name}</span>
            <span
              className="text-[10px] font-mono px-2 py-0.5 border shrink-0"
              style={{ color: dynamicAccent, borderColor: `rgba(${accent.rgb},0.35)`, background: `rgba(${accent.rgb},0.10)` }}
            >
              ${committedPrice}/mo
            </span>
          </div>
        </div>

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

          <OnboardingStepIndicator currentStep="preview" showOptions={true} />

          <button
            type="button"
            id="dynamic-cta-button"
            onClick={handleApprove}
            className="px-4 sm:px-5 py-2 text-xs font-bold uppercase tracking-wider transition hover:brightness-110 cursor-pointer shadow-lg flex items-center gap-1.5"
            style={{ background: dynamicAccent, color: onAccent }}
          >
            <span>Approve landing page</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex-1 flex flex-col lg:flex-row lg:min-h-0">

        {/* STUDIO PANEL */}
        <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-[#1a1f2c] bg-[#090b10] p-4 sm:p-5 flex-shrink-0 space-y-6 lg:overflow-y-auto">

          <div className="p-4 border border-[#1a1f2c] bg-[#0d1017] space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Your product</span>
            <h3 className="text-sm font-bold text-white">{currentBlueprint.name}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{currentBlueprint.tool_summary || currentBlueprint.description}</p>
            {currentBlueprint.target_audience && (
              <p className="text-[11px] font-mono pt-1" style={{ color: dynamicAccent }}>For {currentBlueprint.target_audience}</p>
            )}
          </div>

          <div>
            <PanelTitle aside={<span className="text-xs font-mono font-bold" style={{ color: dynamicAccent }}>${priceDraft} / mo</span>}>
              Monthly price
            </PanelTitle>
            <input
              type="range"
              min={9}
              max={29}
              step={1}
              value={priceDraft}
              onChange={e => setPriceDraft(clampPrice(Number(e.target.value)))}
              className="w-full cursor-pointer"
              style={{ accentColor: dynamicAccent }}
              aria-label="Monthly subscription price"
            />
            <div className="grid grid-cols-5 gap-1 mt-2">
              {[9, 15, 19, 24, 29].map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriceDraft(p)}
                  className="py-1 text-xs font-mono font-bold transition cursor-pointer border"
                  style={{
                    borderColor: priceDraft === p ? dynamicAccent : 'rgba(255,255,255,0.10)',
                    background: priceDraft === p ? `rgba(${accent.rgb},0.14)` : 'rgba(255,255,255,0.03)',
                    color: priceDraft === p ? '#fff' : '#94a3b8'
                  }}
                >
                  ${p}
                </button>
              ))}
            </div>

            {revEst && (
              <div className="mt-3 p-3 border border-[#1a1f2c] bg-[#0d1017] space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Estimate for you</span>
                <div className="text-lg font-black font-mono text-white">{revEst.formattedRange} <span className="text-xs font-medium text-slate-500">/ mo</span></div>
                {revEst.formattedSubscribers && (
                  <div className="text-[11px] font-mono text-slate-400">{revEst.formattedSubscribers} subscribers</div>
                )}
                <p className="text-[10px] font-mono text-slate-500 leading-relaxed pt-1">{REVENUE_DISCLAIMER}</p>
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-5">
            <PanelTitle>Landing copy</PanelTitle>
            <p className="text-[11px] text-slate-500 mb-2.5 leading-relaxed">
              Rewrites wording only. Product name, features and price stay as they are.
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {['professional', 'bold', 'friendly'].map(tone => (
                <button
                  key={tone}
                  type="button"
                  disabled={isRegenerating}
                  onClick={() => handleRegenerateCopy(tone)}
                  className="py-1.5 px-2 bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-wider text-slate-300 hover:text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-5">
            <PanelTitle aside={<span className="text-[10px] font-mono text-slate-500">{(currentBlueprint.features || []).length}</span>}>
              Included features
            </PanelTitle>
            <div className="space-y-1.5">
              {(currentBlueprint.features || []).map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300 py-1.5 px-2.5 bg-[#0d1017] border border-[#1a1f2c]">
                  <Check size={11} className="shrink-0" style={{ color: dynamicAccent }} strokeWidth={3} />
                  <span className="truncate">{typeof feat === 'string' ? feat : (feat?.title || feat?.label || '')}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/5 pt-5">
            <PanelTitle>Surface</PanelTitle>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.keys(SURFACES).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTheme(t)}
                  className="py-1.5 text-[10px] font-mono uppercase tracking-wider transition cursor-pointer border"
                  style={{
                    borderColor: theme === t ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.10)',
                    background: theme === t ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                    color: theme === t ? '#fff' : '#94a3b8'
                  }}
                >
                  {THEME_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* PREVIEW STAGE */}
        <main ref={frameRef} className="flex-1 min-w-0 lg:min-h-0 flex flex-col bg-[#040508] p-3 sm:p-5 gap-3">

          <div className="flex items-center justify-between gap-3 flex-shrink-0">
            <div className="inline-flex items-center gap-1 p-0.5 bg-[#0d1017] border border-[#1a1f2c]">
              <button
                type="button"
                onClick={() => setViewMode('landing')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition cursor-pointer ${viewMode === 'landing' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Laptop size={12} />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition cursor-pointer ${viewMode === 'mobile' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Smartphone size={12} />
                <span>Mobile</span>
              </button>
            </div>
            <span className="hidden sm:block text-[11px] font-mono text-slate-500">Live preview of your demand-test page</span>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 text-slate-400 hover:text-white bg-[#0d1017] border border-[#1a1f2c] transition cursor-pointer"
              title="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>

          <div className="flex-1 lg:min-h-0 flex justify-center">
            <div
              className={`w-full ${isMobileView ? 'max-w-[390px]' : 'max-w-6xl'} border flex flex-col transition-all duration-300 shadow-2xl`}
              style={{ background: surface.bg, borderColor: '#232a3d' }}
            >
              <div className="px-4 py-2.5 border-b flex items-center justify-between gap-3 flex-shrink-0" style={{ background: '#0b0e15', borderColor: '#1a1f2c' }}>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                </div>
                <div className="flex-1 max-w-md px-3 py-1 border flex items-center justify-between text-xs text-slate-300 font-mono min-w-0" style={{ background: '#10141d', borderColor: '#1f2638' }}>
                  <div className="flex items-center gap-1.5 truncate min-w-0">
                    <Lock size={11} className="shrink-0" style={{ color: dynamicAccent }} />
                    <span className="truncate text-[11px]">https://{cleanHandle}.colaunch.app</span>
                  </div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 bg-white/5 px-1.5 py-0.5 border border-white/10 shrink-0 ml-2">
                    Preview URL
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRegenerateCopy('professional')}
                  disabled={isRegenerating}
                  className="p-1 text-slate-400 hover:text-white transition cursor-pointer disabled:opacity-50"
                  title="Rewrite landing copy"
                >
                  <RotateCcw size={13} className={isRegenerating ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="relative flex-1 min-h-0 overflow-y-auto max-h-[85vh] lg:max-h-none">
                {isRegenerating && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="text-center p-5 border border-[#232a3d] bg-[#0d1017]">
                      <div className="w-8 h-8 border-2 border-white/20 rounded-full animate-spin mx-auto mb-3" style={{ borderTopColor: dynamicAccent }} />
                      <p className="text-xs font-semibold text-white">Rewriting landing copy…</p>
                    </div>
                  </div>
                )}
                <AppMockup
                  theme={theme}
                  blueprint={currentBlueprint}
                  creatorData={mockCreator}
                  isMobile={isMobileView}
                  viewMode="landing"
                  onPlayVideo={v => setPlayingVideo(v)}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {playingVideo && (
        <VideoPlayerModal
          video={playingVideo}
          onClose={() => setPlayingVideo(null)}
          creatorData={creatorData}
          dynamicAccent={dynamicAccent}
        />
      )}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[120] px-4 py-2.5 bg-[#10141d] border border-[#2b354d] text-white text-xs font-mono shadow-2xl flex items-center gap-2">
          <span className="w-2 h-2" style={{ background: dynamicAccent }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
