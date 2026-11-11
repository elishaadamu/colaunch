import { useState, useEffect, useMemo, useRef } from 'react'
import { useForge, getAccent, useBgJob } from '../../App'
import {
  ArrowLeft, Globe, Smartphone, Users, Check, Trash2, Sparkles, Layers,
  Plus, AlertCircle, Info
} from 'lucide-react'
import CoLaunchLogo from '../ui/CoLaunchLogo'
import OnboardingStepIndicator from '../ui/OnboardingStepIndicator'
import { getScrapePromise, isScrapePending } from '../../services/scraper'
import {
  generateRecommendationsAI,
  areRecsValidForCreator,
  getFallbackCleanRecommendations,
  parseFollowerCount,
  deriveFeaturesFromToolSummary,
  deriveWhoPaysAndWhy,
  sanitizeTargetAudience,
  cleanEvidenceList
} from '../../services/ai'
import {
  calculateSubscriptionRevenue,
  clampPrice,
  REVENUE_DISCLAIMER
} from '../../utils/subscriptionRevenue.js'
import { recommendCreator } from '../../services/opsApi'
import AudienceIntelligenceEngine from './AudienceIntelligenceEngine'

// ─────────────────────────────────────────────────────────────────────────────
// Look and feel
// Soft dark surfaces, one accent (the creator's), a serif for the few big moments.
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  bg: '#08090c',
  sheet: '#10131a',
  row: '#0c0e13',
  raised: '#171b24',
  line: 'rgba(255,255,255,0.07)',
  lineStrong: 'rgba(255,255,255,0.16)',
  text: '#f3f4f6',
  body: '#cdd1da',
  muted: '#9ba1ae',
  faint: '#6c7280',
}

const PLATFORM_LABELS = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  twitter: 'X',
  tiktok: 'TikTok',
}

const PAGE_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap');

.bp-serif {
  font-family: 'Instrument Serif', 'Iowan Old Style', 'Palatino Linotype', Georgia, serif;
  font-weight: 400;
  letter-spacing: -0.015em;
}

.bp-focus:focus-visible,
.bp-btn:focus-visible {
  outline: 2px solid var(--bp-accent);
  outline-offset: 3px;
}

.bp-range {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 28px;
  background: transparent;
  cursor: pointer;
}
.bp-range::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(to right, var(--bp-accent) var(--pct), rgba(255,255,255,0.12) var(--pct));
}
.bp-range::-moz-range-track {
  height: 4px;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
}
.bp-range::-moz-range-progress {
  height: 4px;
  border-radius: 999px;
  background: var(--bp-accent);
}
.bp-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  margin-top: -9px;
  border-radius: 50%;
  background: #fff;
  border: 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.55);
}
.bp-range::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  border: 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.55);
}
.bp-range:focus-visible::-webkit-slider-thumb { outline: 2px solid var(--bp-accent); outline-offset: 3px; }
.bp-range:focus-visible::-moz-range-thumb { outline: 2px solid var(--bp-accent); outline-offset: 3px; }

@keyframes bp-swap {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}
.bp-swap { animation: bp-swap 0.28s ease-out both; }

@media (prefers-reduced-motion: reduce) {
  .bp-swap { animation: none; }
}
`

// ─────────────────────────────────────────────────────────────────────────────
// Product rules: the client sells subscription SOFTWARE, not content.
// ─────────────────────────────────────────────────────────────────────────────

const BANNED_CATEGORIES = new Set(['course', 'coaching', 'consulting', 'newsletter', 'physical_product', 'digital_download'])

const CONTENT_RE = /\b(courses?|masterclass(es)?|lessons?|curriculum|cohorts?|boot ?camps?|coaching|consulting|consultants?|newsletters?|e-?books?|workshops?|webinars?|mentorship|training program|step-by-step guides?)\b/i

const GENERIC_FEATURE_RE = /^(real-time telemetry|custom metrics|workflow status|data export|interactive workspace|automated workflows|saved user projects|cloud data sync|member software tools|discussion boards|live monthly sessions|member directory)$/i

const CATEGORY_MAP = {
  tool: { type: 'Software tool', icon: Globe, iconKey: 'globe', preview: 'webapp' },
  calculator: { type: 'Calculator', icon: Globe, iconKey: 'globe', preview: 'webapp' },
  tracker: { type: 'Tracker', icon: Layers, iconKey: 'layers', preview: 'dashboard' },
  planner: { type: 'Planner', icon: Layers, iconKey: 'layers', preview: 'dashboard' },
  dashboard: { type: 'Dashboard', icon: Layers, iconKey: 'layers', preview: 'dashboard' },
  community: { type: 'Member platform', icon: Users, iconKey: 'users', preview: 'community' },
  mobile_app: { type: 'Mobile app', icon: Smartphone, iconKey: 'smartphone', preview: 'mobile' },
  app: { type: 'Mobile app', icon: Smartphone, iconKey: 'smartphone', preview: 'mobile' },
  marketplace: { type: 'Marketplace', icon: Globe, iconKey: 'globe', preview: 'webapp' },
  automation: { type: 'Automation', icon: Sparkles, iconKey: 'sparkles', preview: 'webapp' },
  creator_tool: { type: 'Creator tool', icon: Sparkles, iconKey: 'sparkles', preview: 'webapp' },
  saas: { type: 'Software tool', icon: Globe, iconKey: 'globe', preview: 'webapp' },
  other: { type: 'Software tool', icon: Globe, iconKey: 'globe', preview: 'webapp' },
}

const DEFAULT_PRICES = [19, 24, 15, 29]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

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

// One follower count, parsed once and reused everywhere on the page.
function getFollowers(c) {
  return parseFollowerCount(
    c?.followers ||
    c?.subscribers ||
    c?.subscriberCount ||
    c?.channelData?.subscriberCount ||
    c?.telemetry?.subscribers ||
    0
  )
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

// Estimated from average views vs audience size. Always shown as an estimate.
function getDynamicEngagementRate(creator) {
  const followers = getFollowers(creator)
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

function normCat(c) {
  return String(c || 'tool').toLowerCase().trim().replace(/[\s-]+/g, '_')
}

function normName(n) {
  return String(n || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

// Only software ideas pass. Courses, coaching, consulting, newsletters and guides do not.
function isSoftwareIdea(r) {
  if (!r) return false
  if (BANNED_CATEGORIES.has(normCat(r.product_category || r.category))) return false
  const text = `${r.product_name || r.name || ''} ${r.tool_summary || r.description || ''}`
  return !CONTENT_RE.test(text)
}

function safeRevenue(audience, price, engagement) {
  if (!(audience > 0)) return null
  try {
    return calculateSubscriptionRevenue({ audience, monthlyPrice: price, engagementRate: engagement })
  } catch {
    return null
  }
}

// "9–28 members" -> "9–28" so we can write "9–28 subscribers" without doubling the noun.
function subsText(rev) {
  const s = String(rev?.formattedSubscribers ?? '').replace(/\s*(members?|subscribers?)\s*$/i, '').trim()
  return s || '—'
}

// "$135–$420 / mo" -> "$135–$420"
function rangeMain(rev) {
  return String(rev?.formattedRange ?? '').replace(/\s*\/\s*mo\w*\s*$/i, '').trim() || '—'
}

function featureLabel(f) {
  if (typeof f === 'string') return f.trim()
  return String(f?.title || f?.label || f?.name || '').trim()
}

// Feature pills must come from the product itself. Generic template features are
// dropped unless the tool summary actually talks about them.
function pickFeatures(candidates, summary, name, cat) {
  const text = `${summary} ${name}`.toLowerCase()
  const clean = (list) => {
    const seen = new Set()
    return (Array.isArray(list) ? list : [])
      .map(featureLabel)
      .filter(f => {
        if (!f || seen.has(f.toLowerCase())) return false
        seen.add(f.toLowerCase())
        return true
      })
  }
  const keep = (f) => {
    if (!GENERIC_FEATURE_RE.test(f)) return true
    return f.toLowerCase().split(/\W+/).filter(w => w.length > 4).some(w => text.includes(w))
  }

  const given = clean(candidates)
  let derived = []
  try {
    derived = clean(deriveFeaturesFromToolSummary(summary, name, cat))
  } catch { /* fall through */ }

  let list = given.filter(keep)
  if (list.length < 3) list = [...list, ...derived.filter(keep).filter(d => !list.includes(d))]
  if (list.length < 3) list = [...list, ...[...given, ...derived].filter(d => !list.includes(d))]
  return list.slice(0, 4)
}

function makeBlueprint(p, ctx) {
  const config = CATEGORY_MAP[p.cat] || CATEGORY_MAP.tool
  const rev = safeRevenue(ctx.followers, p.price, ctx.engagement)
  return {
    id: p.id,
    type: config.type,
    category: p.cat,
    name: p.name,
    tagline: p.tagline || '',
    description: p.toolSummary,
    toolSummary: p.toolSummary,
    tool_summary: p.toolSummary,
    targetAudience: p.targetAudience,
    target_audience: p.targetAudience,
    whoPaysAndWhy: p.whoPays,
    who_pays_and_why: p.whoPays,
    monthly_price: p.price,
    revenue: rev ? rev.formattedRange : '',
    revenueEstimate: rev,
    subscribers: rev ? rev.formattedSubscribers : '',
    fit: p.fit,
    icon: config.icon,
    iconKey: config.iconKey,
    primary: false,
    preview: config.preview,
    features: p.features,
    evidence: p.evidence,
    rationale: p.rationale || '',
    revenueModel: `$${p.price}/mo subscription`,
    isTemplate: Boolean(p.isTemplate),
    isCustom: Boolean(p.isCustom),
    raw: p.raw,
  }
}

function mapRecommendationsToBlueprints(recs, creatorData, ctx) {
  const { followers, engagement, niche } = ctx
  if (!Array.isArray(recs) || recs.length === 0) return []

  // 1. Keep software ideas only.
  const list = recs.filter(isSoftwareIdea).slice(0, 4).map(rec => ({ rec, isTemplate: false }))

  // 2. If too few real ideas remain, add clearly labelled starter templates (never passed off as audience-backed).
  if (list.length < 3) {
    let fallbacks = []
    try {
      fallbacks = (getFallbackCleanRecommendations(creatorData) || []).filter(isSoftwareIdea)
    } catch { /* ignore */ }
    for (const fb of fallbacks) {
      if (list.length >= 3) break
      const name = normName(fb.product_name || fb.name)
      const cat = normCat(fb.product_category || fb.category)
      const dup = list.some(({ rec }) =>
        normName(rec.product_name || rec.name) === name ||
        normCat(rec.product_category || rec.category) === cat
      )
      if (!dup) list.push({ rec: fb, isTemplate: true })
    }
  }

  const topFit = engagement >= 6 ? 96 : engagement >= 4 ? 94 : followers >= 100_000 ? 92 : 89

  const mapped = list.map(({ rec: r, isTemplate }, index) => {
    const cat = normCat(r.product_category || r.category)
    const price = clampPrice(r.monthly_price || DEFAULT_PRICES[index % 4])
    const name = r.product_name || r.name || 'Untitled software idea'
    const toolSummary = r.tool_summary || r.description || ''

    const rawConf = r.confidence_score ?? r.confidenceScore ?? r.fit
    let fit
    if (typeof rawConf === 'number' && !isNaN(rawConf)) {
      fit = rawConf <= 1 ? Math.round(rawConf * 100) : Math.round(rawConf)
    } else if (typeof rawConf === 'string') {
      const parsed = parseFloat(rawConf.replace('%', ''))
      if (!isNaN(parsed)) fit = parsed <= 1 ? Math.round(parsed * 100) : Math.round(parsed)
    }
    if (!fit || isNaN(fit)) fit = Math.max(68, topFit - (index * 7))
    fit = Math.min(98, Math.max(65, fit))
    if (isTemplate) fit = Math.min(fit, 72)

    const targetAudience = sanitizeTargetAudience(r.target_audience, niche)
    let whoPays = r.who_pays_and_why
    if (!whoPays) {
      try {
        whoPays = deriveWhoPaysAndWhy({ ...r, target_audience: targetAudience, monthly_price: price }, niche)
      } catch {
        whoPays = ''
      }
    }

    // Evidence is shown only when it matches real comments or posts. Templates carry none.
    let evidence = []
    if (!isTemplate) {
      try {
        evidence = cleanEvidenceList(
          Array.isArray(r.evidence) ? r.evidence.filter(Boolean) : [],
          creatorData?.comments || [],
          creatorData?.recentPosts || []
        ) || []
      } catch {
        evidence = []
      }
    }

    const features = pickFeatures(r.key_features, toolSummary, name, cat)

    return makeBlueprint({
      id: isTemplate ? `template-${index}-${normName(name)}` : (r.id || `rec-${index}`),
      name,
      tagline: r.tagline,
      toolSummary,
      targetAudience,
      whoPays,
      price,
      cat,
      fit,
      features,
      evidence,
      rationale: r.rationale,
      isTemplate,
      raw: r,
    }, ctx)
  })

  // Highest match first, so the featured idea is always the strongest one.
  mapped.sort((a, b) => (b.fit || 0) - (a.fit || 0))
  return mapped
}


// ─────────────────────────────────────────────────────────────────────────────
// Small pieces
// ─────────────────────────────────────────────────────────────────────────────

function Pill({ children, tone = 'neutral', icon: Icon }) {
  const tones = {
    neutral: { color: C.muted, background: 'rgba(255,255,255,0.06)' },
    amber: { color: '#f5c066', background: 'rgba(245,192,102,0.12)' },
    green: { color: '#5fd3a0', background: 'rgba(95,211,160,0.12)' },
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium" style={tones[tone]}>
      {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
      {children}
    </span>
  )
}

function MiniBar({ pct, accent }) {
  return (
    <div className="h-1.5 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: accent.color }} />
    </div>
  )
}

// A neutral software window. Every value in it is illustration, and it says so.
function IdeaMockup({ bp, accent }) {
  const features = Array.isArray(bp.features) && bp.features.length > 0
    ? bp.features
    : ['Workspace', 'Saved items', 'Exports']
  const feat = (i) => features[i % features.length]
  const box = { background: C.raised }
  const tint = { background: `rgba(${accent.rgb},0.14)` }

  let body
  if (bp.preview === 'dashboard') {
    body = (
      <div className="space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
          {[['Active', '24'], ['Saved', '128'], ['Score', '86%']].map(([label, value], i) => (
            <div key={label} className="rounded-lg p-2.5" style={i === 2 ? tint : box}>
              <span className="text-[11px] block" style={{ color: C.muted }}>{label}</span>
              <span className="text-base font-semibold tabular-nums block mt-0.5">{value}</span>
            </div>
          ))}
        </div>
        <div className="rounded-lg p-3" style={box}>
          <div className="flex items-end gap-1.5 h-16">
            {[38, 62, 48, 78, 58, 92, 72].map((h, i, arr) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{ height: `${h}%`, background: i >= arr.length - 2 ? accent.color : 'rgba(255,255,255,0.12)' }}
              />
            ))}
          </div>
        </div>
        {[0, 1].map(i => (
          <div key={i} className="rounded-lg px-3 py-2 flex items-center justify-between text-xs" style={box}>
            <span className="truncate pr-2" style={{ color: C.body }}>{feat(i)}</span>
            <span style={{ color: C.faint }}>Ready</span>
          </div>
        ))}
      </div>
    )
  } else if (bp.preview === 'community') {
    body = (
      <div className="space-y-2.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-lg p-3 flex items-start gap-3" style={box}>
            <div className="w-7 h-7 rounded-full shrink-0" style={{ background: `rgba(${accent.rgb},${0.22 + i * 0.1})` }} />
            <div className="flex-1 min-w-0 space-y-2">
              <span className="text-xs font-medium block truncate" style={{ color: C.body }}>{feat(i)}</span>
              <div className="h-1.5 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="h-1.5 w-3/5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }} />
            </div>
          </div>
        ))}
      </div>
    )
  } else if (bp.preview === 'mobile') {
    body = (
      <div className="flex justify-center">
        <div className="w-40 rounded-2xl p-2.5 space-y-2" style={{ background: C.row, boxShadow: `inset 0 0 0 2px ${C.lineStrong}` }}>
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11px] font-semibold truncate pr-1">{bp.name}</span>
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: accent.color }} />
          </div>
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-lg p-2" style={box}>
              <span className="text-[10px] block truncate mb-1.5" style={{ color: C.body }}>{feat(i)}</span>
              <MiniBar pct={[80, 55, 30][i]} accent={accent} />
            </div>
          ))}
          <div className="flex items-center justify-around pt-1">
            {[0, 1, 2, 3].map(i => (
              <span key={i} className="w-2 h-2 rounded-full" style={{ background: i === 0 ? accent.color : 'rgba(255,255,255,0.14)' }} />
            ))}
          </div>
        </div>
      </div>
    )
  } else {
    body = (
      <div className="space-y-2.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="rounded-lg p-3" style={box}>
            <div className="flex items-center justify-between text-xs mb-2" style={{ color: C.muted }}>
              <span className="truncate pr-2">{feat(i)}</span>
              <span className="tabular-nums shrink-0">{[72, 48, 86][i]}%</span>
            </div>
            <MiniBar pct={[72, 48, 86][i]} accent={accent} />
          </div>
        ))}
        <div className="rounded-lg p-3 flex items-center justify-between" style={tint}>
          <span className="text-xs" style={{ color: C.muted }}>Result</span>
          <span className="text-lg font-semibold tabular-nums">+34%</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: C.row, boxShadow: `inset 0 0 0 1px ${C.line}` }}>
      <div className="flex items-center gap-3 px-3.5 py-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => <span key={i} className="w-2 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.14)' }} />)}
        </div>
        <span className="text-xs truncate" style={{ color: C.muted }}>{bp.name}</span>
      </div>
      <div className="px-3.5 pb-3">{body}</div>
      <p className="px-3.5 pb-3 text-[11px]" style={{ color: C.faint }}>Sample data, for illustration</p>
    </div>
  )
}

function PostThumb({ post }) {
  const url = post?.url && post.url !== '#' ? post.url : null
  const rawViews = post?.views || post?.viewCount
  const meta = rawViews
    ? (/view/i.test(String(rawViews)) ? String(rawViews) : `${rawViews} views`)
    : (post?.duration || '')

  const inner = (
    <>
      <div className="relative aspect-video overflow-hidden rounded-xl" style={{ background: C.raised }}>
        {post?.thumbnail ? (
          <img
            src={post.thumbnail}
            alt=""
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={e => {
              if (!e.currentTarget.dataset.proxied) {
                e.currentTarget.dataset.proxied = 'true'
                e.currentTarget.src = `/api/proxy/avatar?url=${encodeURIComponent(post.thumbnail)}`
              } else {
                e.currentTarget.style.display = 'none'
              }
            }}
          />
        ) : null}
      </div>
      <p className="mt-2 text-[13px] leading-snug line-clamp-2 transition-colors group-hover:text-white" style={{ color: C.body }}>
        {post?.title}
      </p>
      {meta && <p className="mt-0.5 text-xs" style={{ color: C.faint }}>{meta}</p>}
    </>
  )

  const cls = 'group block w-44 shrink-0 bp-focus rounded-xl'
  return url
    ? <a href={url} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
    : <div className={cls}>{inner}</div>
}

export default function Blueprint() {
  const { next, creatorData, updateCreator, startBgJob, goTo, requestWipeCreator } = useForge()
  const accent = getAccent(creatorData)
  const onAccent = isLightColor(accent.color) ? '#08090c' : '#ffffff'

  const recsJob = useBgJob('onboarding-recs')
  const rawRecs = creatorData.recommendations
  const isValidRecs = areRecsValidForCreator(rawRecs, creatorData)
  const validRecs = isValidRecs ? rawRecs : null

  const [useFallback, setUseFallback] = useState(false)
  const regen = useRef({ handle: null, n: 0 })

  const fallbackRecs = useMemo(
    () => (useFallback ? getFallbackCleanRecommendations(creatorData) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [useFallback]
  )
  const sourceRecs = validRecs || fallbackRecs

  // One audience size and one engagement figure feed every number on the page.
  const followersCount = getFollowers(creatorData)
  const dynamicEngagement = getDynamicEngagementRate(creatorData)
  const engagementForMath = dynamicEngagement || parseFloat(creatorData?.engagementRate) || 3.5
  const niche = creatorData?.niche || 'Software & Workflow'

  const generatedBlueprints = useMemo(
    () => mapRecommendationsToBlueprints(sourceRecs, creatorData, {
      followers: followersCount,
      engagement: engagementForMath,
      niche,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sourceRecs, followersCount, engagementForMath, niche, creatorData.comments, creatorData.recentPosts]
  )

  const [customPrices, setCustomPrices] = useState({})
  const [customBlueprints, setCustomBlueprints] = useState([])
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customForm, setCustomForm] = useState({ name: '', summary: '', audience: '', price: 19 })
  const [customError, setCustomError] = useState(null)

  const blueprints = useMemo(
    () => [...customBlueprints, ...generatedBlueprints],
    [customBlueprints, generatedBlueprints]
  )
  const [selected, setSelected] = useState(null)
  const [isScraping, setIsScraping] = useState(false)
  const [quotaWarning, setQuotaWarning] = useState(null)

  const hasNoRecs = (!sourceRecs || sourceRecs.length === 0) && customBlueprints.length === 0
  const gaveUp = useFallback && generatedBlueprints.length === 0
  const isGenerating = recsJob.status === 'running' || (hasNoRecs && !isScraping && !gaveUp)
  const busy = isScraping || isGenerating

  useEffect(() => {
    let cancelled = false
    const promise = getScrapePromise()
    if (promise && isScrapePending()) {
      setIsScraping(true)
      promise
        .then((data) => {
          if (cancelled) return
          setIsScraping(false)
          if (data && (data.followers || data.name || data.recentPosts)) updateCreator(data)
        })
        .catch(() => { if (!cancelled) setIsScraping(false) })
    } else {
      setIsScraping(false)
    }
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reset the retry counter when the creator changes.
  useEffect(() => {
    if (regen.current.handle !== creatorData.handle) {
      regen.current = { handle: creatorData.handle, n: 0 }
    }
  }, [creatorData.handle])

  // Start generating ideas. Backend first, AI as the fallback.
  useEffect(() => {
    const idle = !['running', 'done', 'error'].includes(recsJob.status)
    if (hasNoRecs && idle && !isScraping && !useFallback) {
      if (rawRecs && !isValidRecs) updateCreator({ recommendations: null })
      startBgJob('onboarding-recs', async (sig) => {
        let finalRecs = null
        if (creatorData.id) {
          try {
            finalRecs = await recommendCreator(creatorData.id)
          } catch (err) {
            console.warn('[CoLaunch] Backend recommend in Blueprint failed, falling back to AI:', err)
          }
        }
        const isPlaceholder = finalRecs && finalRecs.length === 1 &&
          String(finalRecs[0].product_name || '').toLowerCase().includes('placeholder')
        if (!finalRecs || finalRecs.length === 0 || isPlaceholder) {
          finalRecs = await generateRecommendationsAI(creatorData, sig)
        }
        if (Array.isArray(finalRecs) && finalRecs.length > 0) return finalRecs
        throw new Error('Empty recommendations response')
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasNoRecs, recsJob.status, isScraping, useFallback, creatorData.handle, creatorData.name, creatorData.id])

  // Apply the job result, retry once if it does not match this creator, then fall back.
  useEffect(() => {
    if (recsJob.status === 'done' && recsJob.result) {
      if (areRecsValidForCreator(recsJob.result, creatorData)) {
        updateCreator({ recommendations: recsJob.result })
      } else if (regen.current.n < 1) {
        regen.current.n += 1
        startBgJob('onboarding-recs', async (sig) => {
          const aiRecs = await generateRecommendationsAI(creatorData, sig)
          if (Array.isArray(aiRecs) && aiRecs.length > 0) return aiRecs
          throw new Error('Empty recommendations response')
        })
      } else {
        setUseFallback(true)
        setQuotaWarning('Live ideas did not match your channel, so these are general starter ideas.')
      }
    } else if (recsJob.status === 'error') {
      const fallbacks = getFallbackCleanRecommendations(creatorData)
      updateCreator({ recommendations: fallbacks })
      setUseFallback(true)
      const msg = String(recsJob.error?.message || recsJob.error || '')
      setQuotaWarning(
        msg.includes('429') || msg.includes('exceeded')
          ? 'API rate limit reached. Showing general starter ideas.'
          : 'Could not load live ideas. Showing general starter ideas.'
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recsJob.status, recsJob.result, recsJob.error, creatorData.handle, creatorData.name])

  useEffect(() => {
    if (dynamicEngagement && (!creatorData.engagementRate || creatorData.engagementRate === 3.8)) {
      updateCreator({ engagementRate: dynamicEngagement })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dynamicEngagement, creatorData.engagementRate])

  // Derived selection: always valid, falls back to the strongest idea.
  const activeBlueprint = blueprints.find(b => b.id === selected) || blueprints[0] || null
  const otherOptions = activeBlueprint
    ? blueprints.filter(b => b.id !== activeBlueprint.id)
    : []

  const activePrice = clampPrice(customPrices[activeBlueprint?.id] ?? activeBlueprint?.monthly_price ?? 19)
  const activeRevenue = activeBlueprint ? safeRevenue(followersCount, activePrice, engagementForMath) : null

  const activeAvatar = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''
  const ActiveIcon = activeBlueprint?.icon || Globe
  const creatorName = creatorData.name || (creatorData.handle || 'Creator').replace('@', '')
  const displayPosts = (Array.isArray(creatorData.recentPosts) ? creatorData.recentPosts : []).slice(0, 5)
  const engineFit = typeof activeBlueprint?.fit === 'number'
    ? activeBlueprint.fit
    : (generatedBlueprints[0]?.fit ?? 85)

  const handlePriceChange = (value) => {
    if (!activeBlueprint) return
    setCustomPrices(prev => ({ ...prev, [activeBlueprint.id]: clampPrice(value) }))
  }

  const handleCreateCustom = (e) => {
    e.preventDefault()
    const name = customForm.name.trim()
    const summary = customForm.summary.trim()
    const audience = customForm.audience.trim()

    if (!name) return setCustomError('Give your software idea a name.')
    if (summary.length < 20) return setCustomError('Describe what the tool does in a sentence or two (at least 20 characters).')
    if (CONTENT_RE.test(`${name} ${summary}`)) {
      return setCustomError('This sounds like content (a course, coaching, newsletter or guide). Describe a tool people use every month, like a calculator, tracker or dashboard.')
    }

    const price = clampPrice(customForm.price)
    const targetAudience = audience || `${creatorName}'s audience`
    let whoPays = ''
    try {
      whoPays = deriveWhoPaysAndWhy({
        product_name: name,
        tool_summary: summary,
        target_audience: targetAudience,
        monthly_price: price,
        product_category: 'tool',
      }, niche)
    } catch { /* optional */ }

    const id = `custom-software-${Date.now()}`
    const bp = makeBlueprint({
      id,
      name,
      tagline: 'Your own idea',
      toolSummary: summary,
      targetAudience,
      whoPays,
      price,
      cat: 'tool',
      fit: null,
      features: pickFeatures([], summary, name, 'tool'),
      evidence: [],
      isCustom: true,
      raw: {
        schemaVersion: 3,
        id,
        product_name: name,
        tool_summary: summary,
        target_audience: targetAudience,
        who_pays_and_why: whoPays,
        monthly_price: price,
        product_category: 'tool',
      },
    }, { followers: followersCount, engagement: engagementForMath })

    setCustomBlueprints(prev => [bp, ...prev])
    setSelected(id)
    setShowCustomForm(false)
    setCustomForm({ name: '', summary: '', audience: '', price: 19 })
    setCustomError(null)
  }

  const handleContinue = () => {
    if (busy || !activeBlueprint) return
    const saved = {
      ...activeBlueprint,
      primary: true,
      monthly_price: activePrice,
      revenue: activeRevenue ? activeRevenue.formattedRange : '',
      revenueEstimate: activeRevenue,
      subscribers: activeRevenue ? activeRevenue.formattedSubscribers : '',
    }

    // If the product or price changed, the cached landing copy is stale.
    const prev = creatorData.blueprint
    const sameProduct = Boolean(prev) &&
      prev.id === saved.id &&
      prev.name === saved.name &&
      prev.monthly_price === activePrice

    updateCreator({
      blueprint: saved,
      productName: saved.name,
      monthly_price: activePrice,
      tool_summary: saved.toolSummary,
      target_audience: saved.targetAudience,
      estimated_subscribers: activeRevenue ? activeRevenue.formattedSubscribers : '',
      revenue_estimate: activeRevenue,
      evidence: saved.evidence,
      features: saved.features,
      category: saved.raw?.product_category || saved.category,
      ...(sameProduct ? {} : { landingCopy: null }),
    })
    next()
  }

  const rail = blueprints
  const activeIndex = Math.max(0, rail.findIndex(b => b.id === activeBlueprint?.id))
  const moveSelection = (dir) => {
    if (rail.length === 0) return
    setSelected(rail[(activeIndex + dir + rail.length) % rail.length].id)
  }

  const audienceWord = creatorData.platform === 'youtube' ? 'subscribers' : 'followers'
  const handleLabel = creatorData.handle
    ? (creatorData.handle.startsWith('@') ? creatorData.handle : `@${creatorData.handle}`)
    : (creatorData.name || '@creator')
  const pricePct = ((activePrice - 9) / 20) * 100
  const evidence = activeBlueprint?.evidence || []

  const evidenceNote = activeBlueprint?.isCustom
    ? 'This is your own idea. The landing page will show whether your audience wants it.'
    : activeBlueprint?.isTemplate
      ? 'A general starter idea for your niche. It is not based on your audience data.'
      : 'No comment or video matched this idea. It is based on your niche and channel topics.'

  return (
    <div
      className="bp-root min-h-screen flex flex-col antialiased pb-40 sm:pb-32 selection:bg-white/20"
      style={{ background: C.bg, color: C.text, '--bp-accent': accent.color }}
    >
      <style>{PAGE_CSS}</style>

      {/* Header */}
      <header
        className="sticky top-0 z-40 w-full backdrop-blur-xl border-b"
        style={{ background: 'rgba(8,9,12,0.82)', borderColor: C.line }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => goTo('creator-link')}
              className="bp-btn inline-flex items-center gap-1.5 text-sm rounded-md transition-colors hover:text-white cursor-pointer"
              style={{ color: C.muted }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <CoLaunchLogo
              size={18}
              href="https://co-launch.app"
              showWordmark={true}
              className="hover:opacity-85 transition-opacity"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={requestWipeCreator}
              className="bp-btn hidden sm:inline-flex items-center gap-1.5 text-sm rounded-md text-red-400/80 hover:text-red-300 transition-colors cursor-pointer"
              title="Wipe creator from session storage"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset creator</span>
            </button>
            <OnboardingStepIndicator currentStep="blueprint" showOptions={true} />
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-8 pt-10 sm:pt-16 pb-16">

        {/* Intro */}
        <section className="max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ background: C.raised }}>
              <span className="text-sm font-semibold select-none" style={{ color: C.muted }}>
                {(creatorData.name || creatorData.handle || 'C').replace(/^@/, '').charAt(0).toUpperCase()}
              </span>
              {activeAvatar && (
                <img
                  src={activeAvatar}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={e => {
                    if (!e.currentTarget.dataset.proxied && activeAvatar.startsWith('http')) {
                      e.currentTarget.dataset.proxied = 'true'
                      e.currentTarget.src = `/api/proxy/avatar?url=${encodeURIComponent(activeAvatar)}`
                    } else {
                      e.currentTarget.style.display = 'none'
                    }
                  }}
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{handleLabel}</p>
              <p className="text-xs" style={{ color: C.muted }}>
                {PLATFORM_LABELS[creatorData.platform] || 'Creator'}
                {followersCount > 0 ? `, ${fmt(followersCount)} ${audienceWord}` : ''}
                {dynamicEngagement ? `, about ${dynamicEngagement}% engagement (estimate)` : ''}
              </p>
            </div>
          </div>

          <h1 className="bp-serif mt-9 text-[44px] sm:text-[64px] leading-[1.02]">
            Which app should {creatorName} launch?
          </h1>
          <p className="mt-5 text-base sm:text-lg leading-relaxed max-w-xl" style={{ color: C.muted }}>
            These ideas come from what your audience asks about. Pick one, set a monthly price, then preview its landing page.
          </p>
        </section>

        {quotaWarning && (
          <div
            className="mt-8 max-w-3xl rounded-xl px-4 py-3 flex items-start gap-3 text-sm"
            style={{ background: 'rgba(245,192,102,0.08)', color: '#f5d9a6' }}
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#f5c066' }} />
            <p className="leading-relaxed">{quotaWarning}</p>
          </div>
        )}

        {busy ? (
          <section className="mt-14" aria-busy="true">
            <p className="text-sm" style={{ color: C.muted }}>
              {isScraping ? 'Reading your channel...' : 'Matching app ideas to what your audience asks about...'}
            </p>
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-6">
              <div className="space-y-3">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: C.sheet }} />
                ))}
              </div>
              <div className="h-[520px] rounded-3xl animate-pulse" style={{ background: C.sheet }} />
            </div>
          </section>
        ) : (
          <>
            {/* Channel */}
            {displayPosts.length > 0 && (
              <section className="mt-14">
                <h2 className="text-sm font-medium" style={{ color: C.muted }}>From your channel</h2>
                <div className="mt-4 flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                  {displayPosts.map((post, i) => <PostThumb key={i} post={post} />)}
                </div>
              </section>
            )}

            {/* Audience signals */}
            {activeBlueprint && (
              <section className="mt-16">
                <h2 className="bp-serif text-3xl sm:text-4xl leading-tight">What we found in your audience</h2>
                <p className="mt-2 text-sm max-w-xl leading-relaxed" style={{ color: C.muted }}>
                  Signals from your videos and comments.
                </p>
                <div className="mt-6 overflow-hidden rounded-2xl">
                  <AudienceIntelligenceEngine
                    creatorData={creatorData}
                    activeBlueprint={activeBlueprint}
                    accent={accent}
                    fitScore={engineFit}
                  />
                </div>
              </section>
            )}

            {/* Ideas */}
            <section className="mt-20">
              <h2 className="bp-serif text-4xl sm:text-5xl leading-none">App ideas</h2>
              <p className="mt-3 text-sm sm:text-base max-w-xl leading-relaxed" style={{ color: C.muted }}>
                Each one is a subscription app. Choose the one you want to preview.
              </p>

              {followersCount > 0 && followersCount < 20_000 && (
                <div
                  className="mt-6 max-w-3xl rounded-xl px-4 py-3 flex items-start gap-3 text-sm"
                  style={{ background: 'rgba(245,192,102,0.08)', color: '#f5d9a6' }}
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#f5c066' }} />
                  <p className="leading-relaxed">
                    {creatorName} has {followersCount.toLocaleString()} {audienceWord}. CoLaunch usually works with creators from 20,000, so the earnings estimates below are small.
                  </p>
                </div>
              )}

              {!activeBlueprint ? (
                <div className="mt-8 rounded-3xl p-6 sm:p-10" style={{ background: C.sheet, boxShadow: `inset 0 0 0 1px ${C.line}` }}>
                  <h3 className="bp-serif text-3xl">No ideas yet</h3>
                  <p className="mt-2 text-sm max-w-md leading-relaxed" style={{ color: C.muted }}>
                    We could not build ideas from your channel data. Describe an app below and we will price it and preview it.
                  </p>
                  <div className="mt-6 max-w-md">
                    <CustomIdeaCard
                      accent={accent}
                      onAccent={onAccent}
                      open={true}
                      setOpen={setShowCustomForm}
                      form={customForm}
                      setForm={setCustomForm}
                      error={customError}
                      onSubmit={handleCreateCustom}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-[340px_minmax(0,1fr)] gap-6 items-start">

                  {/* Idea list */}
                  <div role="radiogroup" aria-label="App ideas" className="space-y-3 lg:sticky lg:top-24">
                    {rail.map(bp => {
                      const isActive = bp.id === activeBlueprint.id
                      const rowPrice = clampPrice(customPrices[bp.id] ?? bp.monthly_price ?? 19)
                      const rowRev = safeRevenue(followersCount, rowPrice, engagementForMath)
                      return (
                        <button
                          key={bp.id}
                          type="button"
                          role="radio"
                          aria-checked={isActive}
                          tabIndex={isActive ? 0 : -1}
                          onClick={() => setSelected(bp.id)}
                          onKeyDown={e => {
                            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                              e.preventDefault()
                              moveSelection(1)
                            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                              e.preventDefault()
                              moveSelection(-1)
                            }
                          }}
                          className="bp-focus w-full text-left rounded-2xl p-4 transition-colors cursor-pointer"
                          style={{
                            background: isActive ? C.sheet : 'transparent',
                            boxShadow: isActive ? `inset 0 0 0 1.5px ${accent.color}` : `inset 0 0 0 1px ${C.line}`,
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-[15px] font-semibold leading-snug">{bp.name}</span>
                            {typeof bp.fit === 'number' && (
                              <span className="text-xs tabular-nums shrink-0 mt-0.5" style={{ color: C.muted }}>{bp.fit}% match</span>
                            )}
                          </div>
                          <p className="mt-1 text-[13px] leading-relaxed line-clamp-2" style={{ color: C.muted }}>{bp.toolSummary}</p>
                          <div className="mt-3 flex items-baseline justify-between gap-3 text-[13px]">
                            <span style={{ color: C.muted }}>${rowPrice} a month</span>
                            {rowRev && <span className="font-medium tabular-nums">{rangeMain(rowRev)} a month</span>}
                          </div>
                          {(bp.isTemplate || bp.isCustom) && (
                            <div className="mt-2.5">
                              <Pill tone={bp.isTemplate ? 'amber' : 'neutral'}>{bp.isCustom ? 'Your idea' : 'Starter template'}</Pill>
                            </div>
                          )}
                        </button>
                      )
                    })}

                    <CustomIdeaCard
                      accent={accent}
                      onAccent={onAccent}
                      open={showCustomForm}
                      setOpen={setShowCustomForm}
                      form={customForm}
                      setForm={setCustomForm}
                      error={customError}
                      onSubmit={handleCreateCustom}
                    />
                  </div>

                  {/* Selected idea */}
                  <article
                    className="rounded-3xl p-5 sm:p-8 lg:p-10"
                    style={{ background: C.sheet, boxShadow: `inset 0 0 0 1px ${C.line}` }}
                  >
                    <div key={activeBlueprint.id} className="bp-swap space-y-10">

                      <header>
                        <div className="flex flex-wrap items-center gap-2">
                          <Pill icon={ActiveIcon}>{activeBlueprint.type}</Pill>
                          {activeBlueprint.isTemplate && <Pill tone="amber">Starter template</Pill>}
                          {activeBlueprint.isCustom && <Pill>Your idea</Pill>}
                          {typeof activeBlueprint.fit === 'number' && <Pill tone="green">{activeBlueprint.fit}% match</Pill>}
                        </div>
                        <h3 className="bp-serif mt-5 text-5xl sm:text-6xl leading-[1.02]">{activeBlueprint.name}</h3>
                        {activeBlueprint.tagline && (
                          <p className="mt-2 text-base" style={{ color: C.muted }}>{activeBlueprint.tagline}</p>
                        )}
                        <p className="mt-5 text-base sm:text-lg leading-relaxed max-w-xl" style={{ color: C.body }}>
                          {activeBlueprint.toolSummary}
                        </p>
                      </header>

                      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_300px] gap-8 lg:gap-10">
                        <div className="space-y-7">
                          <div>
                            <h4 className="text-sm font-semibold">What subscribers get</h4>
                            <ul className="mt-3 space-y-2.5">
                              {activeBlueprint.features.map(f => (
                                <li key={f} className="flex items-start gap-3 text-[15px] leading-snug" style={{ color: C.body }}>
                                  <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: accent.color }} strokeWidth={2.5} />
                                  <span>{f}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {activeBlueprint.whoPaysAndWhy && (
                            <div>
                              <h4 className="text-sm font-semibold">Who pays for it</h4>
                              <p className="mt-2 text-[15px] leading-relaxed" style={{ color: C.body }}>
                                {activeBlueprint.whoPaysAndWhy}
                              </p>
                            </div>
                          )}
                        </div>

                        <IdeaMockup bp={activeBlueprint} accent={accent} />
                      </div>

                      {/* Price and earnings */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pt-8 border-t" style={{ borderColor: C.line }}>
                        <div>
                          <label htmlFor="bp-price" className="text-sm font-semibold">Monthly price per subscriber</label>
                          <div className="mt-3 flex items-baseline gap-2.5">
                            <span className="bp-serif text-[76px] sm:text-[92px] leading-none tabular-nums">${activePrice}</span>
                            <span className="text-sm whitespace-nowrap" style={{ color: C.muted }}>a month</span>
                          </div>

                          <input
                            id="bp-price"
                            type="range"
                            min="9"
                            max="29"
                            step="1"
                            value={activePrice}
                            onChange={e => handlePriceChange(Number(e.target.value))}
                            className="bp-range mt-5"
                            style={{ '--pct': `${pricePct}%` }}
                          />

                          <div className="mt-2 grid grid-cols-5 gap-2">
                            {[9, 15, 19, 24, 29].map(p => (
                              <button
                                key={p}
                                type="button"
                                onClick={() => handlePriceChange(p)}
                                className="bp-btn rounded-full py-1.5 text-xs font-medium tabular-nums transition-colors cursor-pointer"
                                style={{
                                  background: activePrice === p ? 'rgba(255,255,255,0.14)' : 'transparent',
                                  color: activePrice === p ? '#fff' : C.muted,
                                  boxShadow: `inset 0 0 0 1px ${activePrice === p ? C.lineStrong : C.line}`,
                                }}
                              >
                                ${p}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-semibold">What it could earn</h4>
                          {activeRevenue ? (
                            <>
                              <p className="mt-3 text-[15px] leading-relaxed" style={{ color: C.body }}>
                                If {subsText(activeRevenue)} of your {followersCount.toLocaleString()} {audienceWord} subscribe, you could bring in about
                              </p>
                              <p className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight tabular-nums">
                                {rangeMain(activeRevenue)}
                                <span className="text-base font-normal" style={{ color: C.muted }}> a month</span>
                              </p>
                              <p className="mt-4 text-xs leading-relaxed" style={{ color: C.faint }}>
                                {activeRevenue.disclaimer || REVENUE_DISCLAIMER}
                              </p>
                            </>
                          ) : (
                            <p className="mt-3 text-sm leading-relaxed" style={{ color: C.muted }}>
                              We could not read your audience size, so there is no estimate yet.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Evidence */}
                      <div className="pt-8 border-t" style={{ borderColor: C.line }}>
                        <h4 className="text-sm font-semibold">
                          {evidence.length > 0 ? 'What your audience said' : 'Audience evidence'}
                        </h4>
                        {evidence.length > 0 ? (
                          <ul className="mt-4 space-y-4">
                            {evidence.map((r, i) => (
                              <li
                                key={i}
                                className="pl-4 text-[15px] leading-relaxed max-w-xl"
                                style={{ borderLeft: `2px solid ${accent.color}`, color: C.body }}
                              >
                                {r}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-3 flex items-start gap-2.5 text-sm leading-relaxed max-w-xl" style={{ color: C.muted }}>
                            <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color: C.faint }} />
                            <span>{evidenceNote}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Action bar */}
      <aside
        className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t"
        style={{ background: 'rgba(8,9,12,0.88)', borderColor: C.line }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            {activeBlueprint && !busy ? (
              <>
                <p className="text-sm font-semibold truncate">{activeBlueprint.name} at ${activePrice} a month</p>
                <p className="text-xs" style={{ color: C.muted }}>
                  {activeRevenue ? `Could earn about ${rangeMain(activeRevenue)} a month` : 'No earnings estimate yet'}
                </p>
              </>
            ) : (
              <p className="text-sm" style={{ color: C.muted }}>
                {busy ? 'Getting your ideas ready' : 'Add an idea to continue'}
              </p>
            )}
          </div>

          {/* Keep id="dynamic-cta-button" intact */}
          <button
            id="dynamic-cta-button"
            type="button"
            onClick={handleContinue}
            disabled={busy || !activeBlueprint}
            className="bp-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
            style={{
              background: (busy || !activeBlueprint) ? 'rgba(255,255,255,0.08)' : accent.color,
              color: (busy || !activeBlueprint) ? 'rgba(255,255,255,0.45)' : onAccent,
            }}
          >
            {busy ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Getting ideas ready</span>
              </>
            ) : (
              <span>Preview landing page</span>
            )}
          </button>
        </div>
      </aside>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Your own idea, added inline
// ─────────────────────────────────────────────────────────────────────────────

function CustomIdeaCard({ accent, onAccent, open, setOpen, form, setForm, error, onSubmit }) {
  const field = 'w-full rounded-lg px-3 py-2.5 text-sm text-white outline-none placeholder-slate-600 transition-shadow focus:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]'
  const fieldStyle = { background: C.row, boxShadow: `inset 0 0 0 1px ${C.line}` }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bp-focus w-full rounded-2xl px-4 py-4 text-left transition-colors hover:bg-white/[0.03] cursor-pointer"
        style={{ boxShadow: `inset 0 0 0 1px ${C.line}` }}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Plus className="w-4 h-4" style={{ color: accent.color }} />
          Add your own idea
        </span>
        <span className="block mt-1 text-[13px] leading-relaxed" style={{ color: C.muted }}>
          Describe an app and we will price it.
        </span>
      </button>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl p-4 space-y-4"
      style={{ background: C.sheet, boxShadow: `inset 0 0 0 1px ${C.lineStrong}` }}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="w-4 h-4" style={{ color: accent.color }} />
          Your idea
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="bp-btn text-xs rounded-md hover:text-white transition-colors cursor-pointer"
          style={{ color: C.muted }}
        >
          Cancel
        </button>
      </div>

      {error && <p className="text-[13px] leading-relaxed text-red-400">{error}</p>}

      <div>
        <label htmlFor="bp-custom-name" className="text-xs font-medium block mb-1.5" style={{ color: C.muted }}>Name</label>
        <input
          id="bp-custom-name"
          type="text"
          placeholder="Grant Budget Tracker"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className={field}
          style={fieldStyle}
        />
      </div>

      <div>
        <label htmlFor="bp-custom-summary" className="text-xs font-medium block mb-1.5" style={{ color: C.muted }}>What does the tool do?</label>
        <textarea
          id="bp-custom-summary"
          rows={3}
          placeholder="Lets NGO staff log project spending and see budget gaps in one dashboard."
          value={form.summary}
          onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
          className={`${field} resize-none`}
          style={fieldStyle}
        />
      </div>

      <div>
        <label htmlFor="bp-custom-audience" className="text-xs font-medium block mb-1.5" style={{ color: C.muted }}>Who would pay for it? (optional)</label>
        <input
          id="bp-custom-audience"
          type="text"
          placeholder="Program managers at small NGOs"
          value={form.audience}
          onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
          className={field}
          style={fieldStyle}
        />
      </div>

      <div>
        <label htmlFor="bp-custom-price" className="text-xs font-medium block mb-1" style={{ color: C.muted }}>
          Monthly price: ${form.price}
        </label>
        <input
          id="bp-custom-price"
          type="range"
          min="9"
          max="29"
          value={form.price}
          onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
          className="bp-range"
          style={{ '--pct': `${((form.price - 9) / 20) * 100}%` }}
        />
      </div>

      <button
        type="submit"
        className="bp-btn w-full rounded-xl py-2.5 text-sm font-semibold hover:brightness-110 transition cursor-pointer"
        style={{ background: accent.color, color: onAccent }}
      >
        Add and select
      </button>
    </form>
  )
}
