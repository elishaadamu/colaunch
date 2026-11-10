import { useState, useEffect, useRef, useMemo } from 'react'
import { useForge, getAccent, useBgJob } from '../../App'
import { Check, Play, Eye, Heart, Clock, Trash2 } from 'lucide-react'
import WingLogo from '../ui/WingLogo'
import { getScrapePromise, fetchCreatorComments, searchGoogleApify } from '../../services/scraper'
import { saveCreator, recommendCreator } from '../../services/opsApi'
import { generateRecommendationsAI, hasTextKey, areRecsValidForCreator, parseFollowerCount, generateAudienceIntelligenceAI, getDynamicAudienceIntelligence } from '../../services/ai'
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
    label: 'Scanning creator profile & indexing media',
    why: 'Pulling verified follower metrics, engagement patterns, and channel telemetry directly from the platform.',
    duration: 800,
  },
  {
    id: 'identity',
    label: 'Extracting audience signals & sentiment',
    why: 'Analyzing audience resonance, comment velocity, and buyer readiness across recent content releases.',
    duration: 850,
  },
  {
    id: 'audience',
    label: 'Synthesizing market demand & pricing rails',
    why: 'Benchmarking customer willingness to pay and high-retention software niches proven for your audience.',
    duration: 900,
  },
  {
    id: 'intelligence',
    label: 'Synthesizing 10-point audience & market intelligence',
    why: 'Extracting verbatim community inquiries, sentiment breakdown, demographics, and competitive market gaps.',
    duration: 950,
  },
  {
    id: 'demand',
    label: 'Architecting custom software blueprint',
    why: 'Synthesizing feature specifications, membership paywalls, and interactive platform modules.',
    duration: 900,
  },
  {
    id: 'model',
    label: 'Selecting optimal monetization engine',
    why: 'Finalizing unit economics, recurring subscription tiers, and go-to-market launch sequences.',
    duration: 800,
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

  // Unified brand hue (crimson red matching co-launch.app brand)
  const hue = 350

  const INSIGHTS = [
    liveData
      ? `${displayName || handle} — ${fmt(followers)} followers identified`
      : 'Profile located',
    'Visual identity extracted from content',
    followers > 0
      ? `${engRate > 0 ? engRate + '% engagement' : 'Audience'} — high purchase intent detected`
      : 'Audience signals mapped',
    '10-point audience telemetry & demand mapped',
    'Monetizable demand found in your niche',
    'Optimal business model selected for your profile',
  ]

  const scrapeDoneRef = useRef(false)
  const stepsDoneRef = useRef(false)
  const intelDoneRef = useRef(false)
  const hasAdvancedRef = useRef(false)

  const finishAndAdvance = () => {
    if (hasAdvancedRef.current) return
    // Wait until steps, scrape, and 10 points analysis are all finished
    if (!stepsDoneRef.current || !scrapeDoneRef.current || !intelDoneRef.current) return
    hasAdvancedRef.current = true
    setProgress(100)
    setConfidence(96)
    setDone(true)
    setTimeout(next, 700)
  }

  // Synthesize 10-point audience intelligence during analysis with fast concurrent resolution
  const runTenPointsAnalysis = async (targetData) => {
    try {
      const cleanHandle = String(targetData?.handle || creatorData?.handle || 'creator').replace(/^@/, '').trim().toLowerCase()
      const creatorName = targetData?.name || cleanHandle
      const niche = targetData?.niche || 'Digital Content Creation'
      const platform = targetData?.platform || 'youtube'

      const withTimeout = (promise, ms = 3000) =>
        Promise.race([
          promise,
          new Promise((resolve) => setTimeout(() => resolve(null), ms))
        ])

      // Run comments and search in parallel with strict 3-second ceiling
      const [commentsResult, searchResult] = await Promise.allSettled([
        withTimeout(
          fetchCreatorComments(cleanHandle, platform, 12).catch(async () => {
            const urls = (targetData?.recentPosts || []).map(p => p.url).filter(Boolean)
            if (urls.length > 0) return await fetchCreatorComments(urls[0], platform, 12)
            return []
          }),
          3000
        ),
        withTimeout(
          searchGoogleApify(`${creatorName} ${niche} software tools reviews`),
          3000
        )
      ])

      const comments = (commentsResult.status === 'fulfilled' && Array.isArray(commentsResult.value)) ? commentsResult.value : []
      const searchItems = (searchResult.status === 'fulfilled' && Array.isArray(searchResult.value)) ? searchResult.value : []

      if (searchItems.length > 0) {
        try {
          localStorage.setItem(`forge_apify_search_${cleanHandle}`, JSON.stringify(searchItems))
        } catch {}
      }

      let synthesized = null
      try {
        synthesized = await withTimeout(generateAudienceIntelligenceAI(targetData, comments, searchItems), 2500)
      } catch (err) {
        console.warn('[Forge] Analyzing AI synthesis notice:', err)
      }

      if (!synthesized) {
        synthesized = getDynamicAudienceIntelligence(targetData, comments, searchItems)
      }

      if (synthesized) {
        const payloadToSave = { ...synthesized, platform }
        try {
          localStorage.setItem(`forge_audience_intel_${platform}_${cleanHandle}`, JSON.stringify(payloadToSave))
          localStorage.setItem(`forge_audience_intel_${cleanHandle}`, JSON.stringify(payloadToSave))
        } catch {}
        updateCreator({ audienceIntelligence: payloadToSave })
      }
    } catch (e) {
      console.warn('[Forge] 10-point analysis notice:', e)
    } finally {
      intelDoneRef.current = true
      if (stepsDoneRef.current && scrapeDoneRef.current) {
        finishAndAdvance()
      }
    }
  }

  // Await real scrape promise
  useEffect(() => {
    const promise = getScrapePromise()
    
    if (!promise) {
      scrapeDoneRef.current = true
      updateCreator({ brandColor: '#c81e3c', brandHex: '#c81e3c' })
      runTenPointsAnalysis(creatorData)
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
        const enrichedData = {
          ...data,
          brandColor: '#c81e3c',
          brandHex: '#c81e3c',
          recommendations: null
        }
        setLiveData(enrichedData)
        updateCreator(enrichedData)
        runTenPointsAnalysis(enrichedData)
        
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

        if (stepsDoneRef.current && intelDoneRef.current) {
          finishAndAdvance()
        }
      })
      .catch(err => {
        scrapeDoneRef.current = true
        runTenPointsAnalysis(creatorData)
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

        if (stepsDoneRef.current && intelDoneRef.current) {
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
        if (scrapeDoneRef.current && intelDoneRef.current) {
          finishAndAdvance()
        } else {
          const checkDoneInterval = setInterval(() => {
            if (intelDoneRef.current && scrapeDoneRef.current) {
              clearInterval(checkDoneInterval)
              finishAndAdvance()
            }
          }, 250)
          setTimeout(() => {
            clearInterval(checkDoneInterval)
            if (!hasAdvancedRef.current) {
              intelDoneRef.current = true
              scrapeDoneRef.current = true
              finishAndAdvance()
            }
          }, 1500)
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

        {/* Streamlined, High-Trust Creator Verification Card */}
        <div
          className="rounded-2xl border p-5 mb-5 transition-all duration-500 bg-[#0c0e12]"
          style={{
            borderColor: completedSteps.includes(0)
              ? `rgba(${accent.rgb}, 0.35)`
              : 'rgba(255,255,255,0.08)',
          }}
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden relative"
                style={{
                  background: '#151921',
                }}
              >
                <span className="text-xl font-bold text-white/70 select-none">
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
              {!done && (
                <div
                  className="absolute inset-0 rounded-full border-2 animate-spin-slow"
                  style={{ borderColor: `rgba(${accent.rgb}, 0.4)`, borderTopColor: 'transparent', margin: '-3px' }}
                />
              )}
              {/* Verified checkmark badge */}
              {liveData && (
                <div
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border flex items-center justify-center"
                  style={{ background: '#0c0e12', borderColor: accent.color }}
                >
                  <Check size={9} style={{ color: accent.color }} strokeWidth={3} />
                </div>
              )}
            </div>

            {/* Creator verified identity & key signals */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[16px] font-bold text-white truncate leading-tight">
                  {displayName || handle}
                </p>
                <span
                  className="text-[9px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider"
                  style={{ background: `rgba(${accent.rgb}, 0.15)`, color: accent.color, border: `1px solid rgba(${accent.rgb}, 0.3)` }}
                >
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mb-2">
                {handle} · <span className="capitalize text-slate-300">{niche}</span>
              </p>

              {/* Clean key metrics */}
              <div className="flex items-center gap-5 pt-1 border-t border-white/5">
                <div>
                  <p className="text-sm font-bold text-white leading-tight font-mono">
                    {followers > 0 ? fmt(followers) : '—'}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Subscribers</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight font-mono">
                    {engRate > 0 ? `${engRate}%` : 'High'}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Engagement</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight font-mono capitalize">
                    {creatorData?.platform || 'YouTube'}
                  </p>
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Channel</p>
                </div>
              </div>
            </div>
          </div>
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
