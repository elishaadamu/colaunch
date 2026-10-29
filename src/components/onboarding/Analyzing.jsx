import { useState, useEffect, useRef, useMemo } from 'react'
import { useForge, getAccent, useBgJob } from '../../App'
import { Check, Play, Eye, Heart, Clock, Trash2 } from 'lucide-react'
import WingLogo from '../ui/WingLogo'
import { getScrapePromise } from '../../services/scraper'
import { saveCreator, recommendCreator } from '../../services/opsApi'
import { generateRecommendationsAI, hasTextKey, areRecsValidForCreator, parseFollowerCount } from '../../services/ai'
import { extractBrandColorFromAvatar, getDeterministicBrandColor, hexToRgb } from '../../utils/avatarColorExtractor'

// Helper: RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}


const ANALYSIS_STEPS = [
  {
    id: 'profile',
    label: 'Scanning creator profile',
    why: 'We pull your real follower count, profile photo, and bio directly from the platform.',
    duration: 1400,
  },
  {
    id: 'identity',
    label: 'Extracting visual identity',
    why: "Your brand colors and content style shape what your app will look like.",
    duration: 1200,
  },
  {
    id: 'audience',
    label: 'Reading audience signals',
    why: 'Engagement rate tells us how warm your audience is — the single biggest factor in which model succeeds.',
    duration: 1600,
  },
  {
    id: 'demand',
    label: 'Identifying monetizable demand',
    why: "Your niche and content topics reveal what your audience already wants to buy.",
    duration: 1800,
  },
  {
    id: 'model',
    label: 'Choosing best business model',
    why: 'Different platforms and niches convert very differently — we pick the one proven for yours.',
    duration: 1300,
  },
]

function fmt(n) {
  n = parseFollowerCount(n)
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`
  return String(n)
}

// Real thumbnail grid
function PostGrid({ posts, accentColor, revealCount }) {
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {posts.slice(0, 6).map((p, i) => (
        <div
          key={i}
          className="relative rounded-lg overflow-hidden transition-all duration-500"
          style={{
            height:    '72px',
            background: `hsl(${p.hue || 220},18%,14%)`,
            opacity:   i < revealCount ? 1 : 0.15,
            transform: i < revealCount ? 'scale(1)' : 'scale(0.95)',
          }}
        >
          {p.thumbnail ? (
            <img
              src={p.thumbnail}
              alt=""
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
              onError={e => {
                if (!e.currentTarget.dataset.proxied) {
                  e.currentTarget.dataset.proxied = 'true';
                  e.currentTarget.src = `/api/proxy/avatar?url=${encodeURIComponent(p.thumbnail)}`;
                } else {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    e.currentTarget.nextElementSibling.style.display = 'block';
                  }
                }
              }}
            />
          ) : null}
          <div className="absolute inset-0" style={{
            display: p.thumbnail ? 'none' : 'block',
            background: `linear-gradient(135deg, hsl(${p.hue || 220},25%,20%) 0%, hsl(${p.hue || 220},15%,10%) 100%)`,
          }} />
          {i < revealCount && (
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)' }} />
          )}
          {i < revealCount && (
            <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                <Eye size={8} style={{ color: 'rgba(255,255,255,0.6)' }} />
                <span className="text-[8px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {p.views || ''}
                </span>
              </div>
              {p.likes && (
                <div className="flex items-center gap-0.5">
                  <Heart size={7} style={{ color: 'rgba(255,255,255,0.5)' }} />
                  <span className="text-[8px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{p.likes}</span>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function IdentityPalette({ hue, visible }) {
  const swatches = [
    { l: 8,  s: 12 },
    { l: 15, s: 18 },
    { l: 22, s: 15 },
    { l: 85, s: 0  },
    { l: 95, s: 0  },
  ]
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-medium mr-1" style={{ color: 'rgba(255,255,255,0.25)' }}>Identity</span>
      {swatches.map((sw, i) => (
        <div
          key={i}
          className="w-5 h-5 rounded-full transition-all duration-500"
          style={{
            background:      sw.s === 0 ? `hsl(0,0%,${sw.l}%)` : `hsl(${hue},${sw.s}%,${sw.l}%)`,
            opacity:         visible ? 1 : 0,
            transform:       visible ? 'scale(1)' : 'scale(0.5)',
            transitionDelay: `${i * 80}ms`,
          }}
        />
      ))}
    </div>
  )
}

export default function Analyzing() {
  const { next, creatorData, updateCreator, startBgJob, prev, clearBgJob, requestWipeCreator } = useForge()
  const accent = getAccent(creatorData)
  const recsJob = useBgJob('onboarding-recs')

  const [completedSteps, setCompletedSteps] = useState([])
  const [activeStep, setActiveStep]         = useState(0)
  const [progress, setProgress]             = useState(0)
  const [confidence, setConfidence]         = useState(0)
  const [insight, setInsight]               = useState(null)
  const [done, setDone]                     = useState(false)
  const [revealedPosts, setRevealedPosts]   = useState(0)
  const [showPalette, setShowPalette]       = useState(false)
  const [scrapeError, setScrapeError]       = useState(null)
  const [scrapeErrorMsg, setScrapeErrorMsg] = useState('')
  const [liveData, setLiveData]             = useState(null)
  const [analysisElapsedMs, setAnalysisElapsedMs] = useState(0)
  const [stepTimings, setStepTimings]       = useState({})
  const timerRef = useRef(null)

  // Prefer real scraped data at every level
  const displayName = liveData?.name      || creatorData.name      || ''
  const handle      = liveData?.handle    || creatorData.handle    || '@creator'
  const followers   = liveData?.followers || creatorData.followers || 0
  const engRate     = liveData?.engagementRate || creatorData.engagementRate || 0
  const avatarUrl   = liveData?.avatarUrl || liveData?.avatar || liveData?.avatar_url || creatorData.avatarUrl || creatorData.avatar || creatorData.avatar_url || ''
  const niche       = liveData?.niche     || creatorData.niche     || 'Creator'
  const description = liveData?.description || creatorData.description || ''
  const videoCount  = liveData?.videoCount  || creatorData.videoCount  || 0
  const postCount   = liveData?.postCount   || creatorData.postCount   || 0
  const totalViews  = liveData?.totalViews  || creatorData.totalViews  || 0

  const posts = liveData?.recentPosts || creatorData.recentPosts || [
    { hue: 220, likes: '', views: '', thumbnail: '' },
    { hue: 200, likes: '', views: '', thumbnail: '' },
    { hue: 240, likes: '', views: '', thumbnail: '' },
    { hue: 210, likes: '', views: '', thumbnail: '' },
    { hue: 230, likes: '', views: '', thumbnail: '' },
    { hue: 195, likes: '', views: '', thumbnail: '' },
  ]

  // Dynamically compute hue from the detected creator avatar / brand color
  const activeBrandHex = liveData?.brandColor || creatorData?.brandColor || creatorData?.brandHex
  const hue = useMemo(() => {
    if (activeBrandHex && activeBrandHex.toLowerCase() !== '#ff3b30') {
      const [r, g, b] = hexToRgb(activeBrandHex)
      const [h] = rgbToHsl(r, g, b)
      return h
    }
    const det = getDeterministicBrandColor(liveData || creatorData)
    const [r, g, b] = hexToRgb(det.primaryHex)
    const [h] = rgbToHsl(r, g, b)
    return h
  }, [activeBrandHex, liveData, creatorData])

  const INSIGHTS = [
    liveData
      ? `${displayName || handle} — ${fmt(followers)} followers identified`
      : 'Profile located',
    'Visual identity extracted from content',
    followers > 0
      ? `${engRate > 0 ? engRate + '% engagement' : 'Audience'} — high purchase intent detected`
      : 'Audience signals mapped',
    'Monetizable demand found in your niche',
    'Optimal business model selected for your profile',
  ]

  const scrapeDoneRef = useRef(false)
  const stepsDoneRef = useRef(false)
  const hasAdvancedRef = useRef(false)

  const finishAndAdvance = () => {
    if (hasAdvancedRef.current) return
    hasAdvancedRef.current = true
    setProgress(100)
    setConfidence(96)
    setDone(true)
    setTimeout(next, 700)
  }

  // Await real scrape promise
  useEffect(() => {
    const promise = getScrapePromise()
    
    if (!promise) {
      scrapeDoneRef.current = true
      const fallbackColor = getDeterministicBrandColor(creatorData).primaryHex
      if (!creatorData.brandColor || creatorData.brandColor === '#ff3b30') {
        updateCreator({ brandColor: fallbackColor, brandHex: fallbackColor })
      }
      startBgJob('onboarding-recs', async (sig) => {
        const aiRecs = await generateRecommendationsAI(creatorData, sig)
        if (aiRecs && Array.isArray(aiRecs) && aiRecs.length > 0) {
          return aiRecs
        }
        throw new Error("Empty recommendations response")
      })
      return
    }

    promise
      .then(async data => {
        scrapeDoneRef.current = true
        let detectedBrandColor = null
        if (data?.avatarUrl) {
          try {
            const colorRes = await extractBrandColorFromAvatar(data.avatarUrl, data)
            if (colorRes?.primaryHex && colorRes.primaryHex.toLowerCase() !== '#ff3b30') {
              detectedBrandColor = colorRes.primaryHex
            }
          } catch (e) {
            console.warn('[Analyzing] Avatar color extraction notice:', e)
          }
        }
        if (!detectedBrandColor) {
          detectedBrandColor = getDeterministicBrandColor(data).primaryHex
        }

        const enrichedData = {
          ...data,
          brandColor: detectedBrandColor,
          brandHex: detectedBrandColor,
          recommendations: null
        }
        setLiveData(enrichedData)
        updateCreator(enrichedData)
        
        // Start onboarding-recs job specifically for the newly analyzed creator
        startBgJob('onboarding-recs', async (sig) => {
          let finalRecs = null
          try {
            const res = await saveCreator({
              handle: data.handle,
              platform: data.platform,
              display_name: data.name,
              bio: data.description,
              follower_count: data.followers,
              niche: Array.isArray(data.niche)
                ? data.niche.filter(Boolean).map(String)
                : (data.niche ? [String(data.niche)] : []),
              profile_url: `https://${data.platform}.com/${data.handle.replace('@', '')}`,
              discovery_source: 'onboarding_flow'
            })
            const creatorId = res?.creator?.id
            if (creatorId) {
              updateCreator({ id: creatorId })
              console.log('[Forge] Lead saved, ID:', creatorId)
              finalRecs = await recommendCreator(creatorId)
            }
          } catch (err) {
            console.error('[Forge] Backend pipeline failed:', err)
          }

          const isPlaceholder = finalRecs && finalRecs.length === 1 && (finalRecs[0].product_name?.includes('[Placeholder]') || finalRecs[0].product_name?.includes('Placeholder'))
          if (!finalRecs || finalRecs.length === 0 || isPlaceholder) {
            console.log('[Forge] Generating custom recommendations for creator:', data.name || data.handle)
            finalRecs = await generateRecommendationsAI(data, sig)
          }

          if (finalRecs && Array.isArray(finalRecs) && finalRecs.length > 0) {
            const cleanHandle = (data.handle || creatorData.handle || '').replace(/^@/, '').toLowerCase().trim()
            return finalRecs.map(r => ({
              ...r,
              forHandle: cleanHandle,
              forCreator: data.name || creatorData.name || ''
            }))
          }
          throw new Error("Empty recommendations response")
        })

        if (stepsDoneRef.current) {
          finishAndAdvance()
        }
      })
      .catch(err => {
        scrapeDoneRef.current = true
        const fallbackColor = getDeterministicBrandColor(creatorData).primaryHex
        if (!creatorData.brandColor || creatorData.brandColor === '#ff3b30') {
          updateCreator({ brandColor: fallbackColor, brandHex: fallbackColor })
        }
        const msg = err?.message || String(err)
        console.error('[Forge] Scrape failed:', msg)
        if (msg.includes('NO_') || msg.includes('NO_KEY')) {
          setScrapeError('no_key')
          setScrapeErrorMsg(msg)
        } else {
          setScrapeError('failed')
          setScrapeErrorMsg(msg)
        }
        
        startBgJob('onboarding-recs', async (sig) => {
          const aiRecs = await generateRecommendationsAI(creatorData, sig)
          if (aiRecs && Array.isArray(aiRecs) && aiRecs.length > 0) {
            const cleanHandle = (creatorData.handle || '').replace(/^@/, '').toLowerCase().trim()
            return aiRecs.map(r => ({
              ...r,
              forHandle: cleanHandle,
              forCreator: creatorData.name || ''
            }))
          }
          throw new Error("Empty recommendations response")
        })

        if (stepsDoneRef.current) {
          finishAndAdvance()
        }
      })
  }, [])

  useEffect(() => {
    if (recsJob.status === 'done' && recsJob.result) {
      if (areRecsValidForCreator(recsJob.result, creatorData)) {
        updateCreator({ recommendations: recsJob.result })
      }
    }
  }, [recsJob.status, recsJob.result, creatorData.handle, creatorData.name])

  // Analysis animation
  useEffect(() => {
    let stepIdx   = 0
    const totalTime = ANALYSIS_STEPS.reduce((s, step) => s + step.duration, 0)
    let elapsed   = 0
    const startTime = Date.now()

    timerRef.current = setInterval(() => {
      setAnalysisElapsedMs(Date.now() - startTime)
    }, 40)

    let currentStepTimer = null

    const runSteps = () => {
      if (stepIdx >= ANALYSIS_STEPS.length) {
        stepsDoneRef.current = true
        if (timerRef.current) clearInterval(timerRef.current)
        if (scrapeDoneRef.current || !getScrapePromise()) {
          finishAndAdvance()
        } else {
          setTimeout(() => {
            if (!hasAdvancedRef.current) {
              finishAndAdvance()
            }
          }, 10000)
        }
        return
      }
      setActiveStep(stepIdx)
      const step = ANALYSIS_STEPS[stepIdx]
      const stepStart = Date.now()

      if (stepIdx === 1) {
        [0,1,2,3,4,5].forEach(i =>
          setTimeout(() => setRevealedPosts(r => Math.max(r, i + 1)), i * 180)
        )
        setTimeout(() => setShowPalette(true), 800)
      }

      currentStepTimer = setTimeout(() => {
        const stepDurationSec = ((Date.now() - stepStart) / 1000).toFixed(2)
        const idx = stepIdx
        setStepTimings(prev => ({ ...prev, [idx]: stepDurationSec }))
        setCompletedSteps(prev => [...prev, idx])
        setInsight(INSIGHTS[idx])
        elapsed += step.duration
        stepIdx++
        runSteps()
      }, step.duration)
    }

    runSteps()

    const progressInterval = setInterval(() => {
      elapsed += 80
      const pct = Math.min(Math.round((elapsed / (totalTime + 800)) * 100), 96)
      setProgress(pct)
      setConfidence(Math.min(Math.round(pct * 0.97), 94))
    }, 80)

    return () => {
      if (currentStepTimer) clearTimeout(currentStepTimer)
      if (timerRef.current) clearInterval(timerRef.current)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, rgba(${accent.rgb},0.06) 0%, transparent 65%)` }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
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
            <div className="flex items-center gap-2">
              <WingLogo size={20} color={accent.color} />
              <span className="text-white/60 font-semibold text-[13px] tracking-tight">CoLaunch</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md border flex items-center gap-1.5"
              style={{ background: `rgba(${accent.rgb}, 0.1)`, borderColor: `rgba(${accent.rgb}, 0.25)`, color: accent.color }}>
              <Clock size={11} />
              00:0{((analysisElapsedMs || 0) / 1000).toFixed(2)}s
            </span>
            <button
              type="button"
              onClick={requestWipeCreator}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-red-400/80 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all cursor-pointer"
              title="Wipe creator from storage"
            >
              <Trash2 size={11} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

          {scrapeError && (
            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(255,160,0,0.1)', color: 'rgba(255,180,0,0.7)', border: '1px solid rgba(255,160,0,0.2)' }}>
                {scrapeError === 'no_key' ? 'No API key' : 'Scrape failed'}
              </span>
              {scrapeErrorMsg && (
                <span className="text-[10px] max-w-[240px] text-right leading-snug"
                  style={{ color: 'rgba(255,100,100,0.6)' }}>
                  {scrapeErrorMsg.slice(0, 120)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Profile card */}
        <div
          className="rounded-2xl border p-4 mb-5 transition-all duration-500"
          style={{
            background:  '#111',
            borderColor: completedSteps.includes(0)
              ? `rgba(${accent.rgb},0.25)`
              : 'rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-16 h-16 rounded-full border-2 flex items-center justify-center overflow-hidden relative"
                style={{
                  borderColor: completedSteps.includes(0) ? `rgba(${accent.rgb},0.5)` : 'rgba(255,255,255,0.15)',
                  background:  `hsl(${hue},20%,15%)`,
                  transition:  'border-color 0.5s',
                }}
              >
                <span className="text-2xl font-bold text-white/70 select-none">
                  {(displayName || handle).replace('@','').charAt(0).toUpperCase()}
                </span>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName || handle}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={e => {
                      if (!e.currentTarget.dataset.proxied && avatarUrl.startsWith('http')) {
                        e.currentTarget.dataset.proxied = 'true'
                        e.currentTarget.src = `/api/proxy/avatar?url=${encodeURIComponent(avatarUrl)}`
                      } else {
                        e.currentTarget.style.display = 'none'
                      }
                    }}
                  />
                ) : null}
              </div>
              {/* Scanning ring */}
              {!done && activeStep === 0 && (
                <div
                  className="absolute inset-0 rounded-full border-2 animate-spin-slow"
                  style={{ borderColor: `rgba(${accent.rgb},0.4)`, borderTopColor: 'transparent', margin: '-4px' }}
                />
              )}
              {/* Live badge */}
              {liveData && (
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                  style={{ background: '#111', borderColor: `rgba(${accent.rgb},0.5)` }}
                >
                  <Check size={9} style={{ color: accent.color }} strokeWidth={3} />
                </div>
              )}
            </div>

            {/* Name + handle + stats */}
            <div className="flex-1 min-w-0">
              {/* Real name large, handle small */}
              {displayName && displayName !== handle.replace('@','') ? (
                <>
                  <p className="text-[17px] font-bold text-white leading-tight truncate">{displayName}</p>
                  <p className="text-[12px] mb-1 truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {handle} · {creatorData.platform}
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[15px] font-semibold text-white truncate">{handle}</p>
                  {liveData && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0"
                      style={{ background: `rgba(${accent.rgb},0.15)`, color: accent.color }}>
                      LIVE
                    </span>
                  )}
                </div>
              )}
              <p className="text-[11px] capitalize truncate mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                {niche}
              </p>

              {/* Stats row */}
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[14px] font-semibold text-white">{followers > 0 ? fmt(followers) : '—'}</p>
                  <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>followers</p>
                </div>
                {engRate > 0 && (
                  <div>
                    <p className="text-[14px] font-semibold text-white">{engRate}%</p>
                    <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>engagement</p>
                  </div>
                )}
                {(videoCount > 0 || postCount > 0) && (
                  <div>
                    <p className="text-[14px] font-semibold text-white">{fmt(videoCount || postCount)}</p>
                    <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {creatorData.platform === 'youtube' ? 'videos' : 'posts'}
                    </p>
                  </div>
                )}
                {totalViews > 0 && (
                  <div>
                    <p className="text-[14px] font-semibold text-white">{fmt(totalViews)}</p>
                    <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>total views</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio snippet */}
          {description && completedSteps.includes(0) && (
            <p className="text-[11px] leading-relaxed mb-3 px-0.5 line-clamp-2"
              style={{ color: 'rgba(255,255,255,0.38)' }}>
              {description.split('.')[0]}
            </p>
          )}

          {/* Post grid */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
                {creatorData.platform === 'youtube' ? 'Latest videos' : 'Recent posts'}
              </p>
              {liveData?.recentPosts?.length > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `rgba(${accent.rgb},0.1)`, color: accent.color }}>
                  real content
                </span>
              )}
            </div>
            <PostGrid posts={posts} accentColor={accent.color} revealCount={revealedPosts} />
          </div>

          <IdentityPalette hue={hue} visible={showPalette} />
        </div>

        {/* Analysis steps with "why" */}
        <div className="space-y-1.5 mb-5">
          {ANALYSIS_STEPS.map((step, i) => {
            const isCompleted = completedSteps.includes(i)
            const isActive    = activeStep === i && !isCompleted
            return (
              <div key={step.id} className="transition-all duration-300"
                style={{ opacity: isCompleted ? 1 : isActive ? 1 : i < activeStep ? 0.5 : 0.2 }}>
                <div className="flex items-center gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      background: isCompleted ? 'white' : isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                      border:     isActive ? '1px solid rgba(255,255,255,0.25)' : 'none',
                    }}
                  >
                    {isCompleted
                      ? <Check size={11} className="text-black" strokeWidth={3} />
                      : isActive
                        ? <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        : null
                    }
                  </div>
                  <span className="text-[13px] font-medium transition-colors duration-300"
                    style={{ color: isCompleted ? 'rgba(255,255,255,0.75)' : isActive ? 'white' : 'rgba(255,255,255,0.25)' }}>
                    {step.label}
                    {isActive && <span className="cursor-blink text-white/40 ml-0.5">_</span>}
                  </span>
                  {isCompleted && stepTimings[i] && (
                    <span className="ml-auto text-[10px] font-mono font-semibold" style={{ color: accent.color }}>
                      +{stepTimings[i]}s
                    </span>
                  )}
                  {isActive && (
                    <div className="flex-1 h-px rounded-full overflow-hidden ml-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full shimmer-line" style={{ width: '100%' }} />
                    </div>
                  )}
                </div>
                {/* Why reason — appears when step is active */}
                {isActive && (
                  <div className="ml-8 mt-1">
                    <p className="text-[11px] leading-snug" style={{ color: `rgba(${accent.rgb},0.65)` }}>
                      {step.why}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Insight bubble */}
        <div
          className="mb-5 rounded-xl px-4 py-3 border transition-all duration-500"
          style={{
            background:  `rgba(${accent.rgb},0.06)`,
            borderColor: `rgba(${accent.rgb},0.12)`,
            minHeight:   '44px',
            opacity:     insight ? 1 : 0,
          }}
        >
          <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <span className="text-white/30 mr-2">Forge found</span>{insight}
          </p>
        </div>

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {done ? 'Ready' : liveData ? `Real data loaded for ${displayName || handle}` : 'Analyzing'}
            </span>
            <span className="text-[12px] font-mono" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {confidence}% confidence
            </span>
          </div>
          <div className="h-px w-full rounded-full overflow-hidden relative" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div
              className="h-full rounded-full relative progress-shimmer transition-all duration-300"
              style={{ width: `${progress}%`, background: accent.color }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
