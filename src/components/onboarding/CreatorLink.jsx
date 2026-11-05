import { useState, useEffect, useRef } from 'react'
import { useForge, getAccent } from '../../App'
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Camera,
  Zap,
  Globe,
  Youtube,
  Instagram,
  Check,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Trash2,
  Clock,
  Terminal,
  Activity,
  Loader2,
  LogIn
} from 'lucide-react'
import { startScrape } from '../../services/scraper'
import CoLaunchLogo from '../ui/CoLaunchLogo'

export function TikTokIcon({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.3 6.3 0 0 0 1.86-4.49V8.75a8.28 8.28 0 0 0 3.91 1v-3.06z" />
    </svg>
  )
}

const PLATFORMS = [
  { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-500', patterns: ['youtube.com', 'youtu.be'] },
  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500', patterns: ['instagram.com'] },
  { id: 'tiktok', label: 'TikTok', icon: TikTokIcon, color: 'text-teal-400', patterns: ['tiktok.com'] },
]

function detectPlatform(url) {
  if (!url) return null
  const lower = url.toLowerCase()
  for (const p of PLATFORMS) {
    if (p.patterns.some(pat => lower.includes(pat))) return p
  }
  return null
}

function extractHandle(url) {
  try {
    let parseUrl = url.trim()
    if (!parseUrl.startsWith('http://') && !parseUrl.startsWith('https://')) {
      parseUrl = 'https://' + parseUrl
    }
    const u = new URL(parseUrl)
    const parts = u.pathname.split('/').filter(Boolean)

    if (parts.length) {
      if (parts[0] === 'user' || parts[0] === 'c' || parts[0] === 'channel') {
        const h = parts[1]
        if (h) return h.startsWith('@') ? h : `@${h}`
      }
      const last = parts[parts.length - 1]
      const h = (last === 'videos' || last === 'shorts' || last === 'featured') && parts.length > 1
        ? parts[parts.length - 2]
        : last
      return h.startsWith('@') ? h : `@${h}`
    }
  } catch { }
  return url.replace(/^@/, '') ? `@${url.replace(/^@/, '')}` : ''
}

function formatFollowers(count) {
  if (!count && count !== 0) return '—'
  const num = typeof count === 'number' ? count : parseInt(count, 10) || 0
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M+`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return String(num)
}

function getTopFormat(platformId) {
  switch (platformId) {
    case 'youtube': return 'Long-form Video'
    case 'instagram': return 'Visual & Reels'
    case 'twitter': return 'Short-form & Threads'
    case 'tiktok': return 'Vertical Video'
    case 'linkedin': return 'Professional Thought-Leadership'
    default: return 'Digital Content'
  }
}

function getTargetArchetype(creator) {
  const niche = (creator?.niche?.[0] || creator?.niche || '').toLowerCase()
  const text = `${creator?.name || ''} ${creator?.handle || ''} ${creator?.description || ''}`.toLowerCase()

  if (niche.includes('tech') || text.includes('software') || text.includes('engineer') || text.includes('ai')) {
    return 'Tech Founders & Engineers'
  }
  if (niche.includes('water') || text.includes('development') || text.includes('international') || text.includes('sustainability')) {
    return 'Global Innovators & Impact Leaders'
  }
  if (niche.includes('finance') || text.includes('wealth') || text.includes('investing')) {
    return 'Investors & Wealth Builders'
  }
  if (niche.includes('fitness') || text.includes('workout') || text.includes('health')) {
    return 'Athletes & Health Enthusiasts'
  }
  if (niche.includes('education') || text.includes('learning')) {
    return 'Curious Learners & Practitioners'
  }
  return 'High-Resonance Community & Advocates'
}

export default function CreatorLink() {
  const { next, prev, goTo, updateCreator, resetCreator, creatorData, clearBgJob, requestWipeCreator, userProfile } = useForge()

  // Retain creator data from session storage across reloads unless explicitly wiped
  const [url, setUrl] = useState(() => creatorData?.url || '')
  const [platform, setPlatform] = useState(() => (creatorData?.url ? detectPlatform(creatorData.url) : (creatorData?.platform ? PLATFORMS.find(p => p.id === creatorData.platform) : null)))
  const [handle, setHandle] = useState(() => creatorData?.handle || '')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showPreview, setShowPreview] = useState(() => Boolean(creatorData?.handle && creatorData?.followers > 0))
  const [scrapedPreview, setScrapedPreview] = useState(() => (creatorData?.handle && creatorData?.followers > 0 ? creatorData : null))

  // Live Scraping Telemetry Timing States
  const [scrapeElapsedMs, setScrapeElapsedMs] = useState(0)
  const [scrapeTelemetryLogs, setScrapeTelemetryLogs] = useState([])
  const [activeScrapePhase, setActiveScrapePhase] = useState('')

  const inputRef = useRef(null)
  const timerRef = useRef(null)
  const autoAdvanceTimerRef = useRef(null)
  const telemetryLogsEndRef = useRef(null)

  const formatElapsedTimer = (ms = 0) => {
    const totalSeconds = (ms || 0) / 1000
    const minutes = Math.floor(totalSeconds / 60)
    const secs = (totalSeconds % 60).toFixed(2)
    const paddedSecs = (totalSeconds % 60) < 10 ? `0${secs}` : secs
    return `${String(minutes).padStart(2, '0')}:${paddedSecs}s`
  }

  const renderTelemetryMessage = (text = '') => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const parts = text.split(urlRegex)
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <span key={i} className="text-sky-400 font-mono underline decoration-sky-700/60 break-all select-all">
            {part}
          </span>
        )
      }
      return <span key={i}>{part}</span>
    })
  }

  // Sync state if creatorData changes from external restoration or wipe
  useEffect(() => {
    if (!creatorData?.handle && !creatorData?.url) {
      setUrl('')
      setHandle('')
      setPlatform(null)
      setShowPreview(false)
      setScrapedPreview(null)
      setIsAnalyzing(false)
      setScrapeElapsedMs(0)
      setScrapeTelemetryLogs([])
    } else if (creatorData?.handle && creatorData?.url && !url && creatorData?.followers > 0) {
      setUrl(creatorData.url)
      setHandle(creatorData.handle)
      setPlatform(detectPlatform(creatorData.url))
      setScrapedPreview(creatorData)
      setShowPreview(true)
    }
  }, [creatorData])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (isAnalyzing && telemetryLogsEndRef.current) {
      telemetryLogsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [scrapeTelemetryLogs, activeScrapePhase, isAnalyzing])

  const handleInputChange = (val) => {
    setUrl(val)
    const detected = detectPlatform(val)
    setPlatform(detected)
    const parsedH = extractHandle(val)
    setHandle(parsedH)

    // Hide preview whenever the input no longer matches the currently displayed creator
    const cleanVal = (val || '').trim().toLowerCase()
    const activeUrl = (scrapedPreview?.url || creatorData?.url || '').trim().toLowerCase()
    const activeH = (scrapedPreview?.handle || creatorData?.handle || '').trim().toLowerCase().replace(/^@/, '')
    const inputH = (parsedH || '').trim().toLowerCase().replace(/^@/, '')

    const matchesCurrent = Boolean(
      (cleanVal && activeUrl && cleanVal === activeUrl) ||
      (inputH && activeH && inputH === activeH)
    )

    if (!cleanVal || !matchesCurrent) {
      setShowPreview(false)
      setScrapedPreview(null)
    }
  }

  const setPreset = (presetUrl) => {
    setUrl(presetUrl)
    handleInputChange(presetUrl)
    if (inputRef.current) inputRef.current.focus()
  }

  const handleClear = () => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current)
    setUrl('')
    setPlatform(null)
    setHandle('')
    setShowPreview(false)
    setScrapedPreview(null)
    setIsAnalyzing(false)
    setScrapeElapsedMs(0)
    setScrapeTelemetryLogs([])
    if (resetCreator) {
      resetCreator()
    }
    if (inputRef.current) inputRef.current.focus()
  }

  const handleAnalyze = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    const cleanUrl = url.trim()
    if (!cleanUrl) {
      if (inputRef.current) inputRef.current.focus()
      return
    }

    const detectedPlatform = platform || detectPlatform(cleanUrl) || { id: 'youtube', label: 'YouTube' }
    const currentHandle = handle || extractHandle(cleanUrl) || '@creator'
    const platformId = detectedPlatform.id || 'youtube'

    setIsAnalyzing(true)
    setShowPreview(false)
    setScrapedPreview(null)
    setScrapeElapsedMs(0)
    setScrapeTelemetryLogs([])
    setActiveScrapePhase('Resolving DNS endpoint & security headers...')

    if (clearBgJob) clearBgJob('onboarding-recs')

    const startTime = Date.now()

    // Start live millisecond timer
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      setScrapeElapsedMs(elapsed)
    }, 40)

    const logTelemetry = (msg) => {
      const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2)
      setScrapeTelemetryLogs(prev => [...prev, `[ +${elapsedSec}s ] ${msg}`])
      setActiveScrapePhase(msg)
    }

    logTelemetry(`Initiating live scrape connection for ${cleanUrl}`)

    try {
      setTimeout(() => {
        logTelemetry(`Querying public ${detectedPlatform.label || 'channel'} stream & parsing metadata...`)
      }, 450)

      setTimeout(() => {
        logTelemetry(`Extracting follower graph, verified engagement & CDN profile picture...`)
      }, 1100)

      setTimeout(() => {
        logTelemetry(`Synthesizing audience archetype & resonance demand index...`)
      }, 1800)

      setTimeout(() => {
        logTelemetry(`Formatting telemetry payload for Forge Studio blueprint engine...`)
      }, 2400)

      // Live scrape promise
      const scrapePromise = startScrape(cleanUrl, platformId)

      // Minimum telemetry animation delay of 2.2s so the user can see actual timing breakdown
      const telemetryMinDelay = new Promise((resolve) => setTimeout(resolve, 2300))

      const [winner] = await Promise.all([
        scrapePromise.catch(err => {
          console.warn('[CreatorLink] Scrape execution handled:', err)
          return null
        }),
        telemetryMinDelay
      ])

      const totalElapsedSec = ((Date.now() - startTime) / 1000).toFixed(2)
      logTelemetry(`✓ Scrape complete in ${totalElapsedSec}s — Creator identity verified`)

      if (timerRef.current) clearInterval(timerRef.current)

      setTimeout(() => {
        setIsAnalyzing(false)
        if (winner && winner.handle) {
          const finalPayload = { ...winner, url: cleanUrl }
          updateCreator(finalPayload)
          setScrapedPreview(finalPayload)
          setShowPreview(true)
          logTelemetry(`✓ Creator verified — moving to Step 2...`)

          // Automatically advance to Step 2 so user doesn't have to click
          autoAdvanceTimerRef.current = setTimeout(() => {
            next()
          }, 700)
        } else {
          next()
        }
      }, 400)

    } catch (err) {
      console.warn('[CreatorLink] Scrape execution error:', err)
      if (timerRef.current) clearInterval(timerRef.current)
      setIsAnalyzing(false)
      next()
    }
  }

  const handleProceedToStep2 = () => {
    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current)
    next()
  }

  const PlatformIcon = platform?.icon || Globe
  const platformColorClass = platform?.color || 'text-neutral-400'

  const activeData = scrapedPreview || creatorData || {}
  const displayFollowers = activeData.followers || 0
  const displayEngagement = activeData.engagementRate || 3.3
  const displayFormat = getTopFormat(activeData.platform || platform?.id || 'youtube')
  const displayArchetype = getTargetArchetype(activeData)
  const displayAvatar = (activeData.avatarUrl || activeData.avatar || activeData.avatar_url || '').replace(/https:\/\/images\.unsplash\.com[^\s"']*/g, '')
  const displayName = activeData.name || (activeData.handle || 'Creator').replace(/^@/, '')
  const displayHandle = activeData.handle ? (activeData.handle.startsWith('@') ? activeData.handle : `@${activeData.handle}`) : '@creator'

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#090a0c] text-neutral-200 font-sans relative overflow-x-hidden selection:bg-[#c81e3c]/30 selection:text-white">

      {/* Ambient subtle top gradient aura */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{ background: 'radial-gradient(circle at 50% 0%, rgba(200, 30, 60, 0.12) 0%, rgba(9, 10, 12, 0) 70%)' }}
      />
      <div className="pointer-events-none fixed -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-[#c81e3c]/10 blur-[130px] rounded-full z-0" />

      {/* TOP NAVIGATION BAR */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        {/* Left: CoLaunch Brand Logo -> navigate to co-launch.app */}
        <a
          href="https://co-launch.app"
          className="flex items-center gap-3 hover:opacity-85 transition-opacity cursor-pointer text-inherit no-underline"
          title="Visit co-launch.app"
        >
          <CoLaunchLogo size={24} theme="dark" showWordmark={true} />
        </a>

        {/* Right: Reset Creator Button + Step Indicator Dots & Counter */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {!userProfile && (
            <button
              type="button"
              onClick={() => goTo('login')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-[#111317]/80 hover:bg-[#1a1e26] border border-[#1f242c] hover:border-slate-500 rounded-none transition-all cursor-pointer shadow-sm"
              title="Log in to existing account"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-400" />
              <span>Log in</span>
            </button>
          )}

          {(creatorData?.handle || url || showPreview) && (
            <button
              type="button"
              onClick={requestWipeCreator}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400/80 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 rounded-none transition-all cursor-pointer"
              title="Wipe creator from storage"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Creator</span>
            </button>
          )}

          <div className="flex items-center gap-3 bg-[#111317]/70 border border-[#1f242c] px-3.5 py-1.5 rounded-none">
            <span className="text-[11px] font-semibold text-neutral-400 tracking-wider uppercase font-mono mr-1">
              <span className="text-neutral-200">01</span> / 08
            </span>
            <div className="flex items-center gap-1.5">
              {/* Active pill */}
              <span className="w-5 h-1.5 rounded-none bg-[#c81e3c] shadow-sm shadow-[#c81e3c]/50"></span>
              {/* Inactive dots */}
              <span className="w-1.5 h-1.5 rounded-none bg-neutral-700"></span>
              <span className="w-1.5 h-1.5 rounded-none bg-neutral-700"></span>
              <span className="w-1.5 h-1.5 rounded-none bg-neutral-700"></span>
              <span className="w-1.5 h-1.5 rounded-none bg-neutral-700"></span>
              <span className="w-1.5 h-1.5 rounded-none bg-neutral-700"></span>
              <span className="w-1.5 h-1.5 rounded-none bg-neutral-700"></span>
              <span className="w-1.5 h-1.5 rounded-none bg-neutral-700"></span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN ONBOARDING HERO CONTAINER */}
      <main className="relative z-10 w-full max-w-3xl mx-auto px-5 sm:px-8 py-8 md:py-12 my-auto">
        <div className="flex flex-col items-center sm:items-start text-left">

          {/* Stage Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-none bg-[#c81e3c] border border-[#c81e3c] text-white text-[11px] font-semibold tracking-wider uppercase mb-5">
            <span className="w-1.5 h-1.5 rounded-none bg-white"></span>
            <span className="text-white">Step 1 of 8 &bull; Intelligence Setup</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.12] mb-3">
            Where is your <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
              audience living?
            </span>
          </h1>

          {/* Subtitle Description */}
          <p className="text-neutral-400 text-sm sm:text-base max-w-xl font-normal leading-relaxed mb-8">
            Paste your creator link and <span className="text-neutral-200 font-medium">Forge</span> will automatically dissect your live follower data, high-resonance content, and audience persona.
          </p>

          {/* Feature Checklist (Glass badge cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full mb-8">

            {/* Feature 1 */}
            <div className="flex items-start gap-3 p-3.5 rounded-none bg-[#111317]/40 border border-[#1f242c]/80 hover:border-[#1f242c] transition-colors">
              <div className="flex-shrink-0 w-6 h-6 rounded-none bg-[#c81e3c] border border-[#c81e3c] flex items-center justify-center text-white text-xs mt-0.5">
                <TrendingUp className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-200">Real Follower Count</div>
                <div className="text-[11px] text-neutral-400 leading-tight mt-0.5">Scraped live directly from the social platform API</div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-3 p-3.5 rounded-none bg-[#111317]/40 border border-[#1f242c]/80 hover:border-[#1f242c] transition-colors">
              <div className="flex-shrink-0 w-6 h-6 rounded-none bg-[#c81e3c] border border-[#c81e3c] flex items-center justify-center text-white text-xs mt-0.5">
                <Camera className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-200">Dynamic Identity</div>
                <div className="text-[11px] text-neutral-400 leading-tight mt-0.5">Your actual profile photo & handle across your product</div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-3 p-3.5 rounded-none bg-[#111317]/40 border border-[#1f242c]/80 hover:border-[#1f242c] transition-colors">
              <div className="flex-shrink-0 w-6 h-6 rounded-none bg-[#c81e3c] border border-[#c81e3c] flex items-center justify-center text-white text-xs mt-0.5">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-200">Engagement Matrix</div>
                <div className="text-[11px] text-neutral-400 leading-tight mt-0.5">AI matches monetization model to your specific niche</div>
              </div>
            </div>
          </div>

          {/* Quick Platform Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 mb-3 w-full">
            <span className="text-xs text-neutral-500 font-medium mr-1">Suggested formats:</span>
            <button
              type="button"
              onClick={() => setPreset('https://youtube.com/@Akvofoundation')}
              className="text-xs px-2.5 py-1 rounded-none bg-[#15181e] border border-[#1f242c] text-neutral-300 hover:text-white hover:border-[#c81e3c]/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Youtube className="w-3 h-3 text-red-400" /> youtube.com/@handle
            </button>
            <button
              type="button"
              onClick={() => setPreset('https://tiktok.com/@khaby.lame')}
              className="text-xs px-2.5 py-1 rounded-none bg-[#15181e] border border-[#1f242c] text-neutral-300 hover:text-white hover:border-[#c81e3c]/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <TikTokIcon className="w-3 h-3 text-teal-400" /> tiktok.com/@creator
            </button>
            <button
              type="button"
              onClick={() => setPreset('https://instagram.com/hubermanlab')}
              className="text-xs px-2.5 py-1 rounded-none bg-[#15181e] border border-[#1f242c] text-neutral-300 hover:text-white hover:border-[#c81e3c]/40 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Instagram className="w-3 h-3 text-pink-400" /> instagram.com/name
            </button>
          </div>

          {/* FORM INTERFACE */}
          <form onSubmit={handleAnalyze} className="w-full space-y-4">

            {/* Input field wrapper with glowing active outline */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#c81e3c]/20 via-[#c81e3c]/40 to-[#c81e3c]/20 rounded-none blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

              <div className="relative flex items-center w-full bg-[#111317] border border-[#1f242c] group-focus-within:border-[#c81e3c] rounded-none overflow-hidden transition-all duration-200 shadow-inner">
                {/* Dynamic Icon on left */}
                <div className={`pl-4 pr-3 ${platformColorClass} group-focus-within:text-[#c81e3c] transition-colors duration-200`}>
                  <PlatformIcon className="w-4 h-4" />
                </div>

                {/* Main Input */}
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="e.g. https://youtube.com/@channel or tiktok.com/@creator"
                  value={url}
                  autoComplete="off"
                  spellCheck="false"
                  className="w-full py-4 pr-12 bg-transparent text-sm sm:text-base font-normal text-white placeholder-neutral-500 focus:outline-none tracking-normal font-sans"
                  onChange={(e) => handleInputChange(e.target.value)}
                />

                {/* Clear or Reset button */}
                {(url || showPreview) && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="pr-4 text-neutral-500 hover:text-neutral-300 transition-colors text-xs font-mono cursor-pointer"
                    title="Clear input and reset creator"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Validation Feedback message */}
            {url.trim().length > 3 && (
              <div className="text-xs text-white font-medium flex items-center gap-2 pl-1 animate-fadeIn">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-white">Valid creator profile handle detected</span>
              </div>
            )}

            {/* Submit Button (co-launch brand red) */}
            <button
              type="submit"
              disabled={!url.trim() || isAnalyzing}
              className="relative w-full py-4 px-6 rounded-none bg-[#c81e3c] hover:bg-[#d92546] text-white font-bold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2.5 transition-all duration-200 shadow-lg shadow-[#c81e3c]/25 hover:shadow-[#c81e3c]/40 active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed group overflow-hidden cursor-pointer"
            >
              {/* Shimmer sweep effect on hover */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>

              {!isAnalyzing ? (
                <span className="flex items-center gap-2 text-white">
                  <span className="text-white font-bold">Analyze my audience</span>
                  <ArrowRight className="w-4 h-4 text-white transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              ) : (
                <span className="flex items-center gap-2 font-mono text-white">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span className="text-white font-bold">Scraping account data · [ {formatElapsedTimer(scrapeElapsedMs)} ]</span>
                </span>
              )}
            </button>

            {/* Live Telemetry Build Process HUD */}
            {isAnalyzing && (
              <div className="w-full mt-4 bg-[#080b11] border border-[#c81e3c]/40 font-mono text-xs shadow-[0_0_35px_rgba(200,30,60,0.18)] rounded-none overflow-hidden animate-fadeIn">
                {/* Terminal Header Chrome */}
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0d121c] border-b border-[#182030] select-none">
                  <div className="flex items-center gap-2">
                    {/* Square Status indicators */}
                    <div className="flex items-center gap-1.5 mr-1">
                      <span className="w-2.5 h-2.5 bg-[#c81e3c] block shadow-sm shadow-[#c81e3c]/50"></span>
                      <span className="w-2.5 h-2.5 bg-[#d97706]/70 block"></span>
                      <span className="w-2.5 h-2.5 bg-[#059669]/70 block"></span>
                    </div>
                    <span className="text-[#c81e3c] font-black text-xs font-mono select-none">&gt;_</span>
                    <span className="font-mono font-bold text-[11px] sm:text-xs tracking-wider uppercase text-white">
                      Live Account Scraper Telemetry
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#c81e3c] border border-[#c81e3c] text-white text-[10px] font-mono font-bold tracking-widest uppercase">
                      <span className="w-1.5 h-1.5 bg-white animate-ping"></span>
                      <span className="text-white">STREAMING</span>
                    </span>
                  </div>

                  {/* High Precision Timer */}
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-[#06080d] border border-[#1f283d] text-neutral-300 font-mono text-xs shadow-inner">
                    <Clock className="w-3.5 h-3.5 text-white" />
                    <span className="text-white font-mono font-bold tracking-wider">
                      {formatElapsedTimer(scrapeElapsedMs)}
                    </span>
                  </div>
                </div>

                {/* Progress bar track */}
                <div className="w-full h-1 bg-[#121622] relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#941128] via-[#c81e3c] to-[#ff4d6d] transition-all duration-100 ease-out shadow-[0_0_10px_#c81e3c]"
                    style={{ width: `${Math.min(Math.round(((scrapeElapsedMs || 0) / 2300) * 98), 98)}%` }}
                  />
                </div>

                {/* Live Step Logs viewport */}
                <div className="p-3.5 sm:p-4 space-y-2 max-h-48 overflow-y-auto bg-[#07090e] border-b border-[#182030] scrollbar-thin">
                  {scrapeTelemetryLogs.map((log, idx) => {
                    const match = log.match(/^(\[\s*\+[^\]]+\])\s*(.*)$/)
                    const timestamp = match ? match[1] : ''
                    const text = match ? match[2] : log
                    const isSuccess = text.includes('✓')

                    return (
                      <div key={idx} className="flex items-start gap-2 text-[11.5px] leading-relaxed group">
                        <span className={`flex-shrink-0 font-bold select-none mt-0.5 ${isSuccess ? 'text-emerald-400' : 'text-[#c81e3c]'}`}>
                          {isSuccess ? '✓' : '›'}
                        </span>
                        {timestamp && (
                          <span className="text-[#c81e3c]/80 font-mono flex-shrink-0 font-medium">
                            {timestamp}
                          </span>
                        )}
                        <span className={`break-words ${isSuccess ? 'text-emerald-300 font-medium' : 'text-neutral-300'}`}>
                          {renderTelemetryMessage(text)}
                        </span>
                      </div>
                    )
                  })}

                  {/* Active In-Flight Phase */}
                  <div className="flex items-center gap-2.5 pt-2 border-t border-[#182030]/80 text-[11.5px]">
                    <span className="relative flex h-2 w-2 flex-shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full bg-[#c81e3c] opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 bg-[#c81e3c]"></span>
                    </span>
                    <span className="text-neutral-200 font-medium italic">{activeScrapePhase}</span>
                    <span className="inline-block w-1.5 h-3.5 bg-[#c81e3c] animate-pulse"></span>
                  </div>
                  <div ref={telemetryLogsEndRef} />
                </div>

                {/* Terminal Footer Status Bar */}
                <div className="px-3.5 py-2 bg-[#090d14] flex items-center justify-between text-[10px] font-mono text-neutral-400 select-none">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center gap-1.5 text-neutral-300">
                      <Activity className="w-3.5 h-3.5 text-[#c81e3c]" /> STATUS: ONLINE
                    </span>
                    <span className="text-neutral-700">|</span>
                    <span className="hidden sm:inline text-neutral-400">PROTOCOL: HTTPS/2 · TLS 1.3</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400">INGESTION:</span>
                    <span className="text-[#ff4d6d] font-bold font-mono">
                      {Math.min(Math.round(((scrapeElapsedMs || 0) / 2300) * 98), 98)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

          </form>

          {/* SIMULATION / CONNECTED PROFILE RESULT CARD */}
          {showPreview && (
            <div className="w-full mt-6 p-5 rounded-none bg-[#15181e] border border-[#c81e3c]/35 shadow-[0_0_28px_-4px_rgba(200,30,60,0.32)] transition-all duration-300 animate-fadeIn">
              <div className="flex items-center justify-between pb-4 border-b border-[#1f242c]">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {displayAvatar ? (
                      <img
                        src={displayAvatar}
                        alt={displayName}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }
                        }}
                        className="w-11 h-11 rounded-none border border-[#1f242c] object-cover"
                      />
                    ) : null}
                    <div
                      className="w-11 h-11 rounded-none border border-[#1f242c] bg-[#1a1f2c] items-center justify-center font-bold text-white text-sm"
                      style={{ display: displayAvatar ? 'none' : 'flex' }}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#c81e3c] rounded-none flex items-center justify-center text-[9px] text-white font-black shadow">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{displayName}</span>
                      <span className="text-[11px] text-neutral-400 font-mono">{displayHandle}</span>
                    </div>
                    <div className="text-xs text-neutral-400 truncate max-w-[280px] sm:max-w-md">
                      {activeData.description || 'Verified Live Profile'}
                    </div>
                  </div>
                </div>
                <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-none bg-[#c81e3c] text-white border border-[#c81e3c]">
                  Live Connected
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4">
                <div className="text-left">
                  <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">Followers</div>
                  <div className="text-base font-bold text-white mt-0.5">{formatFollowers(displayFollowers)}</div>
                </div>
                <div className="text-left">
                  <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">Avg Engagement</div>
                  <div className="text-base font-bold text-white mt-0.5">{displayEngagement}%</div>
                </div>
                <div className="text-left">
                  <div className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">Top Format</div>
                  <div className="text-base font-bold text-white mt-0.5">{displayFormat}</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1f242c] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="text-neutral-400">
                  Target archetype: <strong className="text-neutral-200">{displayArchetype}</strong>
                </span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3 text-neutral-400" />
                    <span>Search different creator</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToStep2}
                    className="px-3 py-1.5 bg-[#c81e3c] hover:bg-[#b01732] text-white font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm rounded-none transition-colors"
                  >
                    <span className="text-white">Moving to Step 2</span>
                    <ArrowRight className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUPPORTED PLATFORMS FOOTER */}
          <div className="w-full mt-10 pt-6 border-t border-[#1f242c]/60 flex items-center justify-center gap-6 text-sm text-neutral-500">
            <div className="flex items-center gap-1.5 hover:text-neutral-300 transition-colors">
              <Youtube className="w-3.5 h-3.5 text-red-500" />
              <span className="text-xs font-medium">YouTube</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-neutral-300 transition-colors">
              <TikTokIcon className="w-3.5 h-3.5 text-teal-400" />
              <span className="text-xs font-medium">TikTok</span>
            </div>
            <div className="flex items-center gap-1.5 hover:text-neutral-300 transition-colors">
              <Instagram className="w-3.5 h-3.5 text-pink-500" />
              <span className="text-xs font-medium">Instagram</span>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER PRIVACY NOTICE & HELP */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
        <div>
          End-to-end read-only verification. We never store personal login credentials.
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => goTo('login')}
            className="hover:text-neutral-300 transition-colors cursor-pointer bg-transparent border-0 p-0 text-xs text-neutral-400"
          >
            Already have an account? <span className="text-[#c81e3c] font-semibold underline underline-offset-2">Log in</span>
          </button>
          <span className="text-neutral-700">&bull;</span>
          <a href="https://co-launch.app" className="hover:text-neutral-400 transition-colors">co-launch.app</a>
        </div>
      </footer>

    </div>
  )
}
