import { useState, useEffect } from 'react'
import { useForge, getAccent, useBgJob } from '../../App'
import {
  ArrowRight, ArrowLeft, Globe, Smartphone, ShoppingBag, Users, Youtube, Instagram,
  CheckCircle, CheckCircle2, Play, Lock, Check, ChevronDown, HelpCircle, Info, Video, Camera, Compass, MoreHorizontal,
  Hammer, Trash2, MessageSquare, Heart, Sparkles, Layers, Sliders, DollarSign, Plus
} from 'lucide-react'
import { XLogo } from '../launch/PostVisualMockup'
import WingLogo from '../ui/WingLogo'
import CoLaunchLogo from '../ui/CoLaunchLogo'
import OnboardingStepIndicator from '../ui/OnboardingStepIndicator'
import { getScrapePromise, isScrapePending } from '../../services/scraper'
import {
  generateRecommendationsAI,
  areRecsValidForCreator,
  getFallbackCleanRecommendations,
  calculateFollowerRevenueRange,
  parseFollowerCount,
  deriveFeaturesFromToolSummary,
  deriveWhoPaysAndWhy,
  sanitizeTargetAudience,
  cleanEvidenceList
} from '../../services/ai'
import {
  calculateSubscriptionRevenue,
  clampPrice,
  formatRevenueAmount,
  REVENUE_DISCLAIMER
} from '../../utils/subscriptionRevenue.js'
import { recommendCreator } from '../../services/opsApi'
import AudienceIntelligenceEngine from './AudienceIntelligenceEngine'
import { ProductMockupPreview } from './Preview'


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
  youtube: Youtube,
  instagram: Instagram,
  twitter: XLogo,
  tiktok: Globe,
}

const PLATFORM_LABELS = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  twitter: 'X',
  tiktok: 'TikTok',
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

function buildReasons(blueprint, creator) {
  // If recommendation has grounded evidence from audience intelligence, clean and prioritize it
  if (blueprint?.evidence && Array.isArray(blueprint.evidence) && blueprint.evidence.length > 0) {
    const cleaned = cleanEvidenceList(
      blueprint.evidence.filter(Boolean),
      creator?.comments || [],
      creator?.recentPosts || []
    )
    if (cleaned.length > 0) return cleaned
  }

  const { platform, followers, engagementRate, niche } = creator || {}
  const eng = parseFloat(engagementRate) || 0
  const subs = parseFollowerCount(followers)
  const nicheL = (niche || 'creator').toLowerCase()
  const highEng = eng >= 4

  const category = (blueprint?.type || blueprint?.raw?.product_category || '').toLowerCase()

  if (category.includes('tracker')) {
    return [
      `Your audience actively asks how to measure, log, and benchmark their ${nicheL} progress`,
      highEng
        ? `${eng}% engagement signals strong commitment to daily tracking and habit logging`
        : `Tracking software builds daily utility and monthly retention into the subscriber relationship`,
      `Monthly recurring pricing ($9–$29/mo) turns one-time questions into ongoing software utility`,
      `Curated community benchmarks give your subscribers a clear reason to remain subscribed month after month`
    ]
  }

  if (category.includes('calc') || category.includes('utility')) {
    return [
      `Solves repetitive calculation and decision-making bottlenecks frequently asked in your comments`,
      `Instant web utility gives subscribers immediate value on their first visit without onboarding friction`,
      `${fmt(subs)} followers provides the ideal subscriber base for a focused, high-frequency utility tool`,
      `Software utility generates predictable MRR with zero ongoing physical inventory or 1-on-1 coaching time`
    ]
  }

  if (category.includes('community') || category.includes('member')) {
    return [
      highEng
        ? `${eng}% engagement indicates your audience already interacts with each other in comments`
        : `Followers seek direct collaboration, shared assets, and verified peer discussion`,
      `Software platform combines direct utility tools with member collaboration and monthly drops`,
      `Recurring membership creates stable, predictable monthly cash flow without one-off launch cycles`,
      `Members pay monthly for sustained access to your tools, templates, and active peer network`
    ]
  }

  // Default software tool / Workflow OS
  return [
    `Addresses the core recurring workflow challenge your ${nicheL} audience repeatedly discusses`,
    highEng
      ? `${eng}% engagement rate demonstrates audience willingness to adopt a dedicated tool`
      : `Subscribers convert to software when it saves them hours of repetitive manual effort`,
    `A subscription app monetizes recurring audience utility rather than one-time digital downloads`,
    `Platform handles all billing, hosting, user accounts, and technical updates automatically`
  ]
}

// ── Software Product Blueprint definitions ────────────────────────────────────

const BLUEPRINTS = [
  {
    id: 'tool-os',
    type: 'Software App',
    name: 'Workflow OS',
    tagline: 'Your niche command center & workflow software',
    description: 'A cloud software tool solving your audience\'s most repetitive workflow bottlenecks with automated templates, calculators, and task tracking.',
    monthly_price: 19,
    fit: 96,
    icon: Globe,
    primary: true,
    preview: 'webapp',
    features: ['Interactive workspace', 'Automated workflows', 'Saved user projects', 'Cloud data sync'],
    targetAudience: 'Active community practitioners & creators',
    evidence: ['Solves top workflow bottleneck repeatedly asked in comments', 'Audience actively asks for structured execution tools']
  },
  {
    id: 'tracker-app',
    type: 'Tracker App',
    name: 'Benchmark Tracker',
    tagline: 'Milestone tracking and performance benchmarking',
    description: 'Interactive web application where members record metrics, track goal progress, and benchmark their results against community standards.',
    monthly_price: 24,
    fit: 91,
    icon: Smartphone,
    preview: 'dashboard',
    features: ['Daily progress logging', 'Community benchmarks', 'Goal milestones', 'Automated reports'],
    targetAudience: 'Members tracking daily improvement & goals',
    evidence: ['High engagement on metric and outcome discussions', 'Recurring questions regarding performance benchmarks']
  },
  {
    id: 'calculator-tool',
    type: 'Web Utility',
    name: 'Workflow Calculator',
    tagline: 'Instant estimations, formulas, and recommendations',
    description: 'A specialized web utility giving followers instant answers, formulas, and tailored recommendations without complex manual spreadsheets.',
    monthly_price: 15,
    fit: 87,
    icon: Globe,
    preview: 'webapp',
    features: ['Instant formula solver', 'Scenario comparison', 'Exportable summary reports', 'Saved user profiles'],
    targetAudience: 'Followers seeking rapid decision support and formulas',
    evidence: ['Recurring questions on calculations and setup comparisons']
  },
  {
    id: 'community-platform',
    type: 'Member Platform',
    name: 'Pro Member Hub',
    tagline: 'Software tools & direct member community',
    description: 'A gated software hub offering direct tools, monthly feature drops, and structured peer collaboration for your most dedicated followers.',
    monthly_price: 29,
    fit: 82,
    icon: Users,
    preview: 'community',
    features: ['Member software tools', 'Discussion boards', 'Live monthly sessions', 'Member directory'],
    targetAudience: 'Dedicated community members wanting tools & direct access',
    evidence: ['Community engagement signals high readiness for monthly subscription']
  },
]


// ── Mapping Recommendations ──────────────────────────────────────────────────

function mapRecommendationsToBlueprints(recs, creatorData = {}) {
  const followers = parseFollowerCount(
    creatorData?.followers ||
    creatorData?.subscribers ||
    creatorData?.subscriberCount ||
    creatorData?.channelData?.subscriberCount ||
    creatorData?.telemetry?.subscribers ||
    0
  )
  const eng = parseFloat(creatorData?.engagementRate) || 3.5
  const niche = creatorData?.niche || 'Software & Workflow'

  const defaultPrices = [19, 24, 15, 29]

  if (!recs || recs.length === 0) {
    const baseFit = eng >= 6.0 ? 97 : eng >= 4.0 ? 94 : followers >= 100_000 ? 92 : 89
    return BLUEPRINTS.map((b, idx) => {
      const price = clampPrice(b.monthly_price || defaultPrices[idx % 4])
      const rev = calculateSubscriptionRevenue({
        audience: followers,
        monthlyPrice: price,
        engagementRate: eng
      })

      const targetAud = sanitizeTargetAudience(b.targetAudience, niche)
      const whoPays = deriveWhoPaysAndWhy({ ...b, target_audience: targetAud, monthly_price: price }, niche)

      return {
        ...b,
        monthly_price: price,
        fit: Math.max(65, baseFit - (idx * 6)),
        revenue: rev.formattedRange,
        revenueEstimate: rev,
        subscribers: rev.formattedSubscribers,
        revenueModel: `$${price}/mo recurring subscription`,
        targetAudience: targetAud,
        whoPaysAndWhy: whoPays,
        features: (Array.isArray(b.features) && b.features.length >= 3)
          ? b.features
          : deriveFeaturesFromToolSummary(b.toolSummary || b.description, b.name, b.type)
      }
    })
  }

  const CATEGORY_MAP = {
    tool: { type: 'Software App', icon: Globe, preview: 'webapp' },
    tracker: { type: 'Tracker App', icon: Smartphone, preview: 'dashboard' },
    calculator: { type: 'Web Utility', icon: Globe, preview: 'webapp' },
    community: { type: 'Member Platform', icon: Users, preview: 'community' },
    dashboard: { type: 'Dashboard', icon: Globe, preview: 'dashboard' },
    app: { type: 'Mobile App', icon: Smartphone, preview: 'mobile' },
    saas: { type: 'Software App', icon: Globe, preview: 'webapp' },
    other: { type: 'Software App', icon: Globe, preview: 'webapp' },
  }

  // Ensure at least 3 candidate recommendations exist so "Other options" is always populated
  let effectiveRecs = Array.isArray(recs) ? [...recs] : []
  if (effectiveRecs.length > 0 && effectiveRecs.length < 3) {
    const fallbacks = getFallbackCleanRecommendations(creatorData)
    for (const fb of fallbacks) {
      if (effectiveRecs.length >= 3) break
      const exists = effectiveRecs.some(r =>
        (r.product_name || r.name || '').toLowerCase() === (fb.product_name || fb.name || '').toLowerCase() ||
        (r.product_category || r.category || '').toLowerCase() === (fb.product_category || fb.category || '').toLowerCase()
      )
      if (!exists) {
        effectiveRecs.push({
          ...fb,
          id: fb.id || `rec-fallback-${effectiveRecs.length}`,
          confidence_score: parseFloat(Math.max(0.68, (effectiveRecs[0]?.confidence_score || 0.92) - (effectiveRecs.length * 0.07)).toFixed(2))
        })
      }
    }
  }

  return effectiveRecs.slice(0, 4).map((r, index) => {
    const cat = (r.product_category || 'tool').toLowerCase()
    const config = CATEGORY_MAP[cat] || CATEGORY_MAP.other
    const price = clampPrice(r.monthly_price || defaultPrices[index % 4])

    const rev = calculateSubscriptionRevenue({
      audience: followers,
      monthlyPrice: price,
      engagementRate: eng
    })

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
    }

    const finalFit = Math.min(98, Math.max(65, fitVal))
    const toolSummary = r.tool_summary || r.description || ''
    const targetAud = sanitizeTargetAudience(r.target_audience, niche)
    const whoPays = r.who_pays_and_why || deriveWhoPaysAndWhy({ ...r, target_audience: targetAud, monthly_price: price }, niche)

    // Dynamic feature pills strictly from tool_summary or AI key_features
    const features = (Array.isArray(r.key_features) && r.key_features.length >= 3)
      ? r.key_features.slice(0, 4)
      : deriveFeaturesFromToolSummary(toolSummary, r.product_name, cat)

    // Clean evidence to remove fabricated quotes
    const cleanedEvidence = cleanEvidenceList(
      Array.isArray(r.evidence) ? r.evidence : [],
      creatorData?.comments || [],
      creatorData?.recentPosts || []
    )

    return {
      id: r.id || `rec-${index}`,
      type: config.type,
      name: r.product_name,
      tagline: r.tagline || 'Custom built for your audience',
      description: toolSummary || 'A tailored subscription software app designed specifically for your audience.',
      toolSummary: toolSummary,
      monthly_price: price,
      revenue: rev.formattedRange,
      revenueEstimate: rev,
      subscribers: rev.formattedSubscribers,
      fit: finalFit,
      icon: config.icon,
      primary: index === 0,
      preview: config.preview,
      features: features,
      rationale: r.rationale || '',
      targetAudience: targetAud,
      whoPaysAndWhy: whoPays,
      evidence: cleanedEvidence,
      revenueModel: `$${price}/mo subscription`,
      raw: r
    }
  })
}

function getReasonsCategoryKey(selectedBlueprint) {
  if (!selectedBlueprint) return 'tool-os'
  return selectedBlueprint.id || 'tool-os'
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
  const followers = parseFollowerCount(creator?.followers || creator?.subscribers || 0)
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

  return null
}

function calculateAudienceFit(creator, blueprint) {
  if (blueprint?.fit && typeof blueprint.fit === 'number') {
    return blueprint.fit
  }
  return 92
}

export default function Blueprint() {
  const { next, creatorData, updateCreator, startBgJob, prev, goTo, requestWipeCreator } = useForge()
  const accent = getAccent(creatorData)

  const recsJob = useBgJob('onboarding-recs')
  const rawRecs = creatorData.recommendations
  const isValidRecs = areRecsValidForCreator(rawRecs, creatorData)
  const validRecs = isValidRecs ? rawRecs : null
  const generatedBlueprints = mapRecommendationsToBlueprints(validRecs, creatorData)

  const [customPrices, setCustomPrices] = useState({})
  const [customBlueprints, setCustomBlueprints] = useState([])
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customSummary, setCustomSummary] = useState('')
  const [customPrice, setCustomPrice] = useState(19)
  const [customTargetAudience, setCustomTargetAudience] = useState('')
  const [customError, setCustomError] = useState(null)

  const blueprints = [...customBlueprints, ...generatedBlueprints]
  const [selected, setSelected] = useState(blueprints[0]?.id)
  const [visible, setVisible] = useState(false)
  const [showReasons, setShowReasons] = useState(true)
  const [isScraping, setIsScraping] = useState(false)
  const [quotaWarning, setQuotaWarning] = useState(null)

  const hasNoRecs = (!validRecs || validRecs.length === 0) && customBlueprints.length === 0
  const isGenerating = recsJob.status === 'running' || (hasNoRecs && !isScraping)

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

  // Trigger recommendations when audience intelligence is ready or as fallback
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
            console.warn('[CoLaunch] Backend recommend in Blueprint failed, fallback to AI:', err)
          }
        }
        const isPlaceholder = finalRecs && finalRecs.length === 1 && (finalRecs[0].product_name?.includes('[Placeholder]') || finalRecs[0].product_name?.includes('Placeholder'))
        if (!finalRecs || finalRecs.length === 0 || isPlaceholder) {
          finalRecs = await generateRecommendationsAI(creatorData, sig)
        }
        if (finalRecs && Array.isArray(finalRecs) && finalRecs.length > 0) {
          return finalRecs
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
        console.warn('[CoLaunch] Stale recommendations detected in recsJob. Regenerating...')
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
          ? "API rate limit reached. Loaded estimated subscription software templates."
          : "Failed to load live recommendations. Loaded default software templates."
      )
    }
  }, [recsJob.status, recsJob.result, recsJob.error, creatorData.handle, creatorData.name])

  useEffect(() => {
    if (blueprints.length > 0 && !blueprints.some(b => b.id === selected)) {
      setSelected(blueprints[0].id)
    }
  }, [creatorData.recommendations, customBlueprints.length])

  const selectedBlueprint = blueprints.find(b => b.id === selected) || blueprints[0]
  const activeBlueprint = selectedBlueprint || blueprints[0]
  const otherOptions = blueprints
    .filter(b => b.id !== activeBlueprint.id)
    .sort((a, b) => (b.fit || 0) - (a.fit || 0))

  const dynamicEngagement = getDynamicEngagementRate(creatorData)
  const followersCount = parseFollowerCount(creatorData?.followers || creatorData?.subscribers || 0)

  // Interactive chosen price for the active blueprint (clamps $9–$29)
  const activePrice = clampPrice(customPrices[activeBlueprint?.id] || activeBlueprint?.monthly_price || 19)

  // Live subscription revenue calculations purely using the shared helper
  const activeRevenue = calculateSubscriptionRevenue({
    audience: followersCount,
    monthlyPrice: activePrice,
    engagementRate: dynamicEngagement || 3.5
  })

  useEffect(() => {
    if (dynamicEngagement && (!creatorData.engagementRate || creatorData.engagementRate === 3.8)) {
      updateCreator({ engagementRate: dynamicEngagement })
    }
  }, [dynamicEngagement, creatorData.engagementRate])

  const blurb = buildCreatorBlurb(creatorData)
  const reasons = buildReasons(activeBlueprint, creatorData)

  const PLATFORM_COLORS = {
    youtube: '#ef4444',
    instagram: '#e1306c',
    twitter: '#60a5fa',
    tiktok: '#00c8c8',
    twitch: '#9146ff',
  }

  const platformColor = PLATFORM_COLORS[creatorData.platform] || accent.color
  const activeAvatar = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''
  const ActiveIcon = activeBlueprint?.icon || Globe

  const creatorName = creatorData.name || (creatorData.handle || 'Creator').replace('@', '')

  const handlePriceChange = (newPrice) => {
    const clamped = clampPrice(newPrice)
    setCustomPrices(prev => ({
      ...prev,
      [activeBlueprint.id]: clamped
    }))
  }

  const handleCreateCustomProduct = (e) => {
    e.preventDefault()
    if (!customName.trim()) {
      setCustomError('Please enter a software product name')
      return
    }
    if (!customSummary.trim()) {
      setCustomError('Please describe what tool or recurring problem the software solves')
      return
    }

    const price = clampPrice(customPrice)
    const customId = `custom-software-${Date.now()}`
    const rev = calculateSubscriptionRevenue({
      audience: followersCount,
      monthlyPrice: price,
      engagementRate: dynamicEngagement || 3.5
    })

    const targetAud = customTargetAudience.trim() || `${creatorName}'s audience`
    const customFeatures = deriveFeaturesFromToolSummary(customSummary.trim(), customName.trim(), 'tool')
    const whoPays = `${targetAud} paying $${price}/mo for automated tools and ongoing software utility.`

    const newBp = {
      id: customId,
      type: 'Software App',
      name: customName.trim(),
      tagline: 'Custom subscription software',
      description: customSummary.trim(),
      toolSummary: customSummary.trim(),
      targetAudience: targetAud,
      whoPaysAndWhy: whoPays,
      monthly_price: price,
      revenue: rev.formattedRange,
      revenueEstimate: rev,
      subscribers: rev.formattedSubscribers,
      fit: 95,
      icon: Globe,
      primary: true,
      preview: 'webapp',
      features: customFeatures,
      evidence: ['Custom software idea designed for audience recurring workflow'],
      revenueModel: `$${price}/mo subscription`,
      raw: {
        schemaVersion: 3,
        id: customId,
        product_name: customName.trim(),
        tool_summary: customSummary.trim(),
        target_audience: targetAud,
        who_pays_and_why: whoPays,
        key_features: customFeatures,
        monthly_price: price,
        product_category: 'tool'
      }
    }

    setCustomBlueprints(prev => [newBp, ...prev])
    setSelected(customId)
    setShowCustomModal(false)
    setCustomName('')
    setCustomSummary('')
    setCustomTargetAudience('')
    setCustomError(null)
  }

  const handleContinue = () => {
    if (isScraping || isGenerating) return
    const chosenPrice = activePrice
    const updatedBlueprint = {
      ...activeBlueprint,
      monthly_price: chosenPrice,
      revenue: activeRevenue.formattedRange,
      revenueEstimate: activeRevenue,
      subscribers: activeRevenue.formattedSubscribers,
    }

    updateCreator({
      blueprint: updatedBlueprint,
      productName: activeBlueprint.name,
      monthly_price: chosenPrice,
      tool_summary: activeBlueprint.toolSummary || activeBlueprint.description,
      target_audience: activeBlueprint.targetAudience,
      estimated_subscribers: activeRevenue.formattedSubscribers,
      revenue_estimate: activeRevenue,
      evidence: activeBlueprint.evidence,
      category: activeBlueprint.raw?.product_category || 'tool',
    })
    next()
  }

  const rawPosts = (creatorData.recentPosts && creatorData.recentPosts.length > 0)
    ? creatorData.recentPosts
    : []

  const displayPosts = rawPosts.slice(0, 5)

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
            <CoLaunchLogo
              size={18}
              href="https://co-launch.app"
              showWordmark={true}
              className="hover:opacity-85 transition-opacity"
            />
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

            <OnboardingStepIndicator currentStep="blueprint" showOptions={true} />
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
                <p className="text-[13px] font-medium text-white">Notice</p>
                <p className="text-[12px] text-white/50">{quotaWarning}</p>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════ SKELETON LOADER ═══════════════ */}
        {(isScraping || isGenerating) ? (
          <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }} className="space-y-8">
            <div className="space-y-2">
              <div
                className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider border"
                style={{ background: `rgba(${accent.rgb}, 0.1)`, borderColor: `rgba(${accent.rgb}, 0.25)`, color: accent.color }}
              >
                <Compass className="w-3.5 h-3.5" />
                {isScraping ? 'Analyzing Channel Signals…' : 'Synthesizing Software Candidates…'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Product ideas for {creatorName}
              </h2>
              <p className="text-sm text-slate-400">
                {isScraping
                  ? 'CoLaunch is analyzing recurring audience problems, tool requests, and subscription demand.'
                  : 'Tailoring recurring software products ($9–$29/mo) grounded in your audience signals.'}
              </p>
            </div>

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
                    <div className="w-14 h-14 rounded-2xl shadow-lg bg-[#0c101a] flex items-center justify-center overflow-hidden relative">
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
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-[11px] font-bold uppercase tracking-wider font-mono"
                        style={{
                          background: creatorData.platform === 'youtube'
                            ? 'rgba(239,68,68, 0.12)'
                            : creatorData.platform === 'instagram'
                              ? 'rgba(225,48,108, 0.15)'
                              : creatorData.platform === 'tiktok'
                                ? 'rgba(20,184,166, 0.12)'
                                : `rgba(${accent.rgb}, 0.12)`,
                          color: creatorData.platform === 'youtube'
                            ? '#f87171'
                            : creatorData.platform === 'instagram'
                              ? '#f472b6'
                              : creatorData.platform === 'tiktok'
                                ? '#2dd4bf'
                                : accent.color,
                          border: `1px solid ${creatorData.platform === 'youtube' ? 'rgba(239,68,68, 0.25)' : creatorData.platform === 'instagram' ? 'rgba(225,48,108, 0.3)' : 'rgba(255,255,255,0.1)'}`
                        }}
                      >
                        {PLATFORM_LABELS[creatorData.platform] || (creatorData.platform ? creatorData.platform.toUpperCase() : 'Creator')}
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
                      {followersCount > 0 ? fmt(followersCount) : '—'}
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                      {creatorData.platform === 'youtube' ? 'Subscribers' : 'Followers'}
                    </div>
                  </div>

                  <div className="px-3.5 py-2 rounded-xl bg-[#151822]/80 border border-[#1f2433]/60 text-center min-w-[76px]">
                    <div className="text-base sm:text-lg font-bold text-emerald-400 tracking-tight">
                      {dynamicEngagement ? `${dynamicEngagement}%` : 'Estimated'}
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
                      Estimated Fit
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Latest Media Carousel (Only if real posts exist) */}
            {displayPosts.length > 0 && (
              <div className="space-y-3" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 0.1s' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    {creatorData.platform === 'youtube' ? (
                      <Video className="w-3.5 h-3.5 text-slate-400" />
                    ) : (
                      <Camera className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    {creatorData.platform === 'youtube' ? 'Latest Videos' : 'Latest Posts'}
                  </span>
                  <span className="text-xs text-slate-400">Audience affinity benchmark</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {displayPosts.map((post, i) => {
                    const grad = VIDEO_GRADIENTS[i % VIDEO_GRADIENTS.length]
                    let postUrl = post.url || '#'

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

                          <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-black/40 to-black/20 group-hover:via-black/20 transition-all pointer-events-none" />

                          <div className="relative z-10 self-center my-auto">
                            <div className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center group-hover:scale-110 group-hover:bg-black/80 transition-all shadow-md">
                              <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                            </div>
                          </div>

                          <div className="relative z-10 w-full mt-auto flex items-end justify-between gap-1.5">
                            <p className="text-[11px] font-semibold text-white/90 line-clamp-1 leading-snug group-hover:text-white transition-colors text-left flex-1 drop-shadow-sm">
                              {post.title}
                            </p>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-white/90 border border-white/10 shrink-0">
                              {post.duration || post.views || 'Video'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* 10-MODULE AUDIENCE INTELLIGENCE ENGINE */}
            <div style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 0.12s' }}>
              <AudienceIntelligenceEngine
                creatorData={creatorData}
                activeBlueprint={activeBlueprint}
                accent={accent}
                fitScore={activeBlueprint.fit}
              />
            </div>

            {/* Recommendation Section Header */}
            <div className="pt-0 space-y-1" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 0.15s' }}>
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider"
                style={{
                  background: 'rgba(200, 30, 60, 0.12)',
                  borderColor: 'rgba(200, 30, 60, 0.25)',
                  borderWidth: '1px',
                  color: '#c81e3c'
                }}
              >
                <Hammer className="w-3 h-3" />
                <span>Software Product Candidates</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                Product ideas for {creatorName}
              </h2>
              <p className="text-xs text-slate-400">
                Subscription software solving recurring problems your audience keeps asking about. Validated before building.
              </p>
            </div>

            {/* Audience Scale Notice (< 20K followers) */}
            {followersCount > 0 && followersCount < 20_000 && (
              <div
                className="p-2 bg-amber-500/10 border border-amber-500/25 rounded-none flex items-start gap-2 text-xs text-amber-200"
                style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 0.18s' }}
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">Audience Scale Notice: </span>
                  <span>
                    @{creatorName}'s audience ({followersCount.toLocaleString()} followers) is below the typical 20,000 follower threshold for software co-launch ventures. Estimated revenue figures reflect this smaller audience scale at standard conversion benchmarks.
                  </span>
                </div>
              </div>
            )}

            {/* Product Options Matrix */}
            <div
              className="w-full max-w-5xl mx-auto"
              style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease 0.2s' }}
            >
              {/* Blueprint Candidates Switcher (Clean tabs instead of bulky Other Options sidebar) */}
              {blueprints.length > 1 && (
                <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 shrink-0">Candidates:</span>
                  {blueprints.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelected(b.id)}
                      className={`px-3 py-1 text-xs font-mono transition-all cursor-pointer border ${
                        b.id === activeBlueprint.id
                          ? 'bg-[#151a26] text-white border-[#313c54] font-bold shadow-sm'
                          : 'bg-[#0f121a] text-slate-400 border-[#1f2638] hover:text-white hover:border-slate-500'
                      }`}
                    >
                      {b.name} ({b.fit || 90}% Match)
                    </button>
                  ))}
                </div>
              )}

              {/* Primary Recommended Product (Featured) */}
              <div
                className="w-full rounded-none bg-[#0f1117] border border-[#1f2433] p-4 sm:p-5 relative overflow-hidden transition-all duration-300 shadow-2xl"
              >
                {/* Header Tag & Match Indicator */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-none font-bold text-[10px] tracking-wide"
                    style={{
                      background: 'rgba(200, 30, 60, 0.15)',
                      borderColor: 'rgba(200, 30, 60, 0.3)',
                      borderWidth: '1px',
                      color: '#c81e3c'
                    }}
                  >
                    <ActiveIcon className="w-3 h-3" />
                    <span>{activeBlueprint.type.toUpperCase()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400 truncate max-w-[240px]">
                      Target Audience: {activeBlueprint.targetAudience || 'Subscribers'}
                    </span>
                    <div className="px-2 py-0.5 rounded-none bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold shrink-0">
                      {activeBlueprint.fit}% Match
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 items-start">

                  {/* Left Specs Column */}
                  <div className="md:col-span-7 space-y-2.5">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
                        {activeBlueprint.name}
                      </h3>
                      <p className="text-xs font-medium text-slate-300 mt-0.5">
                        {activeBlueprint.tagline}
                      </p>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                      {activeBlueprint.toolSummary || activeBlueprint.description}
                    </p>

                    {/* Feature Pills */}
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      {activeBlueprint.features.slice(0, 4).map(f => (
                        <div
                          key={f}
                          className="px-2 py-1 text-[11px] font-medium rounded-none bg-[#151822] border border-[#1f2433] text-slate-300 flex items-center gap-1.5 truncate"
                        >
                          <Check className="w-3 h-3 shrink-0 text-[#c81e3c]" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* Who Pays & Why */}
                    {activeBlueprint.whoPaysAndWhy && (
                      <div className="p-2 rounded-none bg-[#141822] border border-[#1f2433] space-y-0.5">
                        <div className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                          <Users className="w-3 h-3" />
                          <span>Who Pays &amp; Why</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight">
                          {activeBlueprint.whoPaysAndWhy}
                        </p>
                      </div>
                    )}

                    {/* Interactive Monthly Price Selector */}
                    <div className="pt-2 border-t border-[#1f2433] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Monthly Price</span>
                        </label>
                        <span className="text-xs font-extrabold text-white font-mono px-2 py-0.5 rounded-none bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          ${activePrice} / mo per subscriber
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="9"
                          max="29"
                          step="1"
                          value={activePrice}
                          onChange={(e) => handlePriceChange(Number(e.target.value))}
                          className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-none appearance-none"
                        />
                      </div>

                      {/* Quick Preset Buttons */}
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className="text-[10px] uppercase font-mono text-slate-400">Presets:</span>
                        {[9, 15, 19, 24, 29].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => handlePriceChange(p)}
                            className={`px-2 py-0.5 text-[10px] font-mono font-bold transition-all cursor-pointer rounded-none ${activePrice === p
                              ? 'bg-emerald-400 text-black shadow-sm'
                              : 'bg-[#151822] border border-[#1f2433] text-slate-300 hover:text-white hover:bg-[#1a202c]'
                              }`}
                          >
                            ${p}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Why this fits & Audience Evidence */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setShowReasons(!showReasons)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        <HelpCircle className="w-3 h-3 text-[#c81e3c]" />
                        <span>Audience Demand Evidence ({reasons.length} signals)</span>
                        <ChevronDown
                          className="w-3 h-3 transition-transform duration-200"
                          style={{ transform: showReasons ? 'rotate(180deg)' : 'none' }}
                        />
                      </button>
                      {showReasons && (
                        <div className="mt-1.5 p-2 rounded-none bg-[#141822] border border-[#1f2433] space-y-1">
                          {reasons.map((r, i) => (
                            <div key={i} className="flex items-start gap-1.5">
                              <span className="text-[10px] mt-0.5 flex-shrink-0 font-bold text-emerald-400">✓</span>
                              <p className="text-[11px] leading-relaxed text-slate-300">{r}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Projected Gross Subscription Revenue */}
                    <div className="pt-2 border-t border-[#1f2433] space-y-0.5">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight whitespace-nowrap shrink-0">
                          {activeRevenue.formattedRange}
                        </span>
                        <span className="text-[11px] text-slate-400 whitespace-nowrap">
                          ({activeRevenue.formattedSubscribers} subscribers at ~0.5% conversion)
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 italic">
                        {activeRevenue.disclaimer}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Interactive App Preview Window */}
                  <div className="md:col-span-5 flex flex-col justify-start">
                    <ProductMockupPreview
                      category={activeBlueprint?.category || activeBlueprint?.type || 'tool'}
                      blueprint={{
                        ...activeBlueprint,
                        monthly_price: activePrice,
                        price: activePrice
                      }}
                      creatorData={creatorData}
                      dynamicAccent={accent.color}
                    />
                  </div>

                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Sticky Bottom CTA Action Bar */}
      <aside className="fixed bottom-0 left-0 right-0 z-50 bg-[#08090c]/95 backdrop-blur-md border-t border-[#1f2433] py-2.5 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">

          {/* Primary Dynamic Action Button (Keep id="dynamic-cta-button" intact) */}
          <div className="w-full sm:w-auto">
            <button
              id="dynamic-cta-button"
              onClick={handleContinue}
              disabled={isScraping || isGenerating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-none font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer group shadow-md"
              style={{
                background: (isScraping || isGenerating) ? 'rgba(255,255,255,0.08)' : '#c81e3c',
                color: (isScraping || isGenerating) ? 'rgba(255,255,255,0.4)' : '#ffffff',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              {(isScraping || isGenerating) ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Synthesizing Software Product…</span>
                </span>
              ) : (
                <>
                  <span>Preview landing page for {activeBlueprint?.name}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>

          {/* Supporting Status Copy */}
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 text-center sm:text-right">
            <Info className="w-3 h-3 text-slate-400 shrink-0" />
            <span>Customize live landing page layout and test demand in next steps</span>
          </div>

        </div>
      </aside>
    </div>
  )
}
