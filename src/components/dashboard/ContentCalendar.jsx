import { useState, useEffect, useMemo } from 'react'
import { useForge, useBgJob, getAccent } from '../../App'
import { hexToRgb, getDeterministicBrandColor, getContrastTextColor } from '../../utils/avatarColorExtractor'
import {
  RefreshCw,
  Copy,
  Check,
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar,
  AlertCircle,
  X,
  Pencil,
  Trash2,
  LayoutGrid,
  List,
  Filter,
  Eye,
  Send,
  Share2,
  Video,
  MessageSquare,
  Flame,
  TrendingUp,
  Layers,
  CheckCircle2,
  ChevronDown,
  Wand2,
  Compass,
  Play,
  ArrowRight,
  Clock,
  ExternalLink,
  Zap,
  Users,
  Rocket,
  HelpCircle,
  FileText,
  CheckCircle
} from 'lucide-react'
import {
  generateContentCalendar,
  generateSingleCalendarPost,
  hasTextKey,
  generateStudioContent
} from '../../services/ai'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Content theme categories with visual styling and conversion rationale
const THEMES = {
  launch: {
    label: 'Launch',
    tag: 'CONVERSION',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.12)',
    border: 'rgba(56, 189, 248, 0.28)',
    why: 'High-urgency direct conversion hooks to drive checkout & waitlist volume.'
  },
  value: {
    label: 'Value',
    tag: 'AUTHORITY',
    color: '#34d399',
    bg: 'rgba(52, 211, 153, 0.12)',
    border: 'rgba(52, 211, 153, 0.28)',
    why: 'High-signal educational breakdowns that build trust and viral bookmarks.'
  },
  bts: {
    label: 'BTS',
    tag: 'HUMANITY',
    color: '#fbbf24',
    bg: 'rgba(251, 191, 36, 0.12)',
    border: 'rgba(251, 191, 36, 0.28)',
    why: 'Unfiltered build-in-public moments that forge deep creator-fan emotional connection.'
  },
  proof: {
    label: 'Proof',
    tag: 'CREDIBILITY',
    color: '#818cf8',
    bg: 'rgba(129, 140, 248, 0.12)',
    border: 'rgba(129, 140, 248, 0.28)',
    why: 'Case studies, test results, and reviews that eliminate customer purchasing hesitation.'
  },
  cta: {
    label: 'CTA',
    tag: 'REVENUE',
    color: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.12)',
    border: 'rgba(244, 63, 94, 0.28)',
    why: 'Unapologetic call-to-actions targeting warm followers ready to buy now.'
  },
  community: {
    label: 'Community',
    tag: 'ENGAGEMENT',
    color: '#c084fc',
    bg: 'rgba(192, 132, 252, 0.12)',
    border: 'rgba(192, 132, 252, 0.28)',
    why: 'Open-ended questions & community polls that fuel algorithmic comment velocity.'
  },
  story: {
    label: 'Story',
    tag: 'RETENTION',
    color: '#fb7185',
    bg: 'rgba(251, 113, 133, 0.12)',
    border: 'rgba(251, 113, 133, 0.28)',
    why: 'Personal vulnerability and origin stories that turn casual viewers into loyal advocates.'
  },
}

const STATUS_STYLES = {
  draft: {
    bg: 'rgba(148, 163, 184, 0.1)',
    color: '#94a3b8',
    border: 'rgba(148, 163, 184, 0.25)',
    dot: '#64748b',
    label: 'Draft'
  },
  scheduled: {
    bg: 'rgba(56, 189, 248, 0.15)',
    color: '#38bdf8',
    border: 'rgba(56, 189, 248, 0.35)',
    dot: '#38bdf8',
    label: 'Scheduled'
  },
  posted: {
    bg: 'rgba(52, 211, 153, 0.15)',
    color: '#34d399',
    border: 'rgba(52, 211, 153, 0.35)',
    dot: '#34d399',
    label: 'Posted'
  },
  failed: {
    bg: 'rgba(244, 63, 94, 0.15)',
    color: '#f43f5e',
    border: 'rgba(244, 63, 94, 0.35)',
    dot: '#f43f5e',
    label: 'Failed'
  },
}

const PLATFORM_CONFIG = {
  YouTube: {
    abbr: 'YT',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.25)',
    badgeBg: 'rgba(239, 68, 68, 0.18)',
    badgeColor: '#fca5a5',
    types: ['Video', 'Shorts', 'Community', 'Live'],
    icon: Video,
  },
  Instagram: {
    abbr: 'IG',
    color: '#ec4899',
    bg: 'rgba(236, 72, 153, 0.1)',
    border: 'rgba(236, 72, 153, 0.25)',
    badgeBg: 'rgba(236, 72, 153, 0.18)',
    badgeColor: '#f472b6',
    types: ['Reel', 'Post', 'Story', 'Carousel'],
    icon: Sparkles,
  },
  Twitter: {
    abbr: 'X',
    color: '#38bdf8',
    bg: 'rgba(56, 189, 248, 0.1)',
    border: 'rgba(56, 189, 248, 0.25)',
    badgeBg: 'rgba(56, 189, 248, 0.18)',
    badgeColor: '#7dd3fc',
    types: ['Post', 'Thread'],
    icon: Share2,
  },
  TikTok: {
    abbr: 'TT',
    color: '#2dd4bf',
    bg: 'rgba(45, 212, 191, 0.1)',
    border: 'rgba(45, 212, 191, 0.25)',
    badgeBg: 'rgba(45, 212, 191, 0.18)',
    badgeColor: '#5eead4',
    types: ['Video'],
    icon: Play,
  },
  Email: {
    abbr: 'Email',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.25)',
    badgeBg: 'rgba(245, 158, 11, 0.18)',
    badgeColor: '#fcd34d',
    types: ['Broadcast', 'Newsletter', 'VIP Early Access'],
    icon: Send,
  },
  LinkedIn: {
    abbr: 'LI',
    color: '#60a5fa',
    bg: 'rgba(96, 165, 250, 0.1)',
    border: 'rgba(96, 165, 250, 0.25)',
    badgeBg: 'rgba(96, 165, 250, 0.18)',
    badgeColor: '#93c5fd',
    types: ['Post', 'Article'],
    icon: Layers,
  },
  Podcast: {
    abbr: 'Pod',
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.1)',
    border: 'rgba(168, 85, 247, 0.25)',
    badgeBg: 'rgba(168, 85, 247, 0.18)',
    badgeColor: '#c084fc',
    types: ['Episode', 'Clip'],
    icon: MessageSquare,
  },
}

const GOAL_CONFIG = {
  launch: {
    label: 'Launch',
    tagline: 'Conversion & checkout urgency',
    icon: Rocket,
    color: '#38bdf8',
    gradient: 'from-cyan-500/20 to-blue-600/10',
    border: 'border-cyan-500/40',
    desc: 'Primed to drive high checkout velocity, waitlist conversions, and day-1 sales.'
  },
  growth: {
    label: 'Growth',
    tagline: 'Algorithm reach & viral discovery',
    icon: TrendingUp,
    color: '#34d399',
    gradient: 'from-emerald-500/20 to-teal-600/10',
    border: 'border-emerald-500/40',
    desc: 'Engineered for viral hooks, shareability, and maximum non-follower discovery.'
  },
  engagement: {
    label: 'Engagement',
    tagline: 'Comment velocity & replies',
    icon: MessageSquare,
    color: '#fbbf24',
    gradient: 'from-amber-500/20 to-orange-600/10',
    border: 'border-amber-500/40',
    desc: 'Sparks high-energy debates, audience questions, and direct inbox replies.'
  },
  community: {
    label: 'Community',
    tagline: 'Fan loyalty & behind-the-scenes',
    icon: Users,
    color: '#c084fc',
    gradient: 'from-purple-500/20 to-pink-600/10',
    border: 'border-purple-500/40',
    desc: 'Builds intimacy, shows unfiltered creation, and bonds long-term super-fans.'
  },
}

const INITIAL_CALENDAR = [
  {
    day: 'Mon',
    posts: [
      { id: 1, platform: 'YouTube', type: 'Video', title: 'Why most creators fail at digital product launches (and the fix)', theme: 'value', status: 'scheduled' },
      { id: 2, platform: 'Instagram', type: 'Reel', title: 'Teaser: Something big is dropping this Friday link in bio', theme: 'launch', status: 'draft' },
    ],
  },
  {
    day: 'Tue',
    posts: [
      { id: 3, platform: 'Email', type: 'Broadcast', title: 'Private Invitation: VIP Founding Member Early Access', theme: 'launch', status: 'scheduled' },
      { id: 4, platform: 'Twitter', type: 'Thread', title: '5 systems I built to automate customer onboarding from scratch', theme: 'proof', status: 'draft' },
    ],
  },
  {
    day: 'Wed',
    posts: [
      { id: 5, platform: 'YouTube', type: 'Shorts', title: '3 quick mistakes that kill conversions before day 1', theme: 'value', status: 'draft' },
      { id: 6, platform: 'Instagram', type: 'Story', title: 'Raw BTS: packing the welcome kits and testing the hub', theme: 'bts', status: 'scheduled' },
    ],
  },
  {
    day: 'Thu',
    posts: [
      { id: 7, platform: 'Instagram', type: 'Carousel', title: 'From zero to full launch breakdown step by step', theme: 'proof', status: 'draft' },
      { id: 8, platform: 'Twitter', type: 'Post', title: 'What is the #1 obstacle keeping you from launching your offer?', theme: 'community', status: 'draft' },
    ],
  },
  {
    day: 'Fri',
    posts: [
      { id: 9, platform: 'YouTube', type: 'Live', title: 'OFFICIAL LAUNCH LIVESTREAM: Q&A + Live Access Walkthrough', theme: 'launch', status: 'draft' },
      { id: 10, platform: 'Email', type: 'VIP Early Access', title: 'DOORS ARE OPEN: Access is now live for founders', theme: 'cta', status: 'scheduled' },
    ],
  },
  {
    day: 'Sat',
    posts: [
      { id: 11, platform: 'Instagram', type: 'Reel', title: 'First 24 hour milestone recap + answering top community DMs', theme: 'proof', status: 'draft' },
    ],
  },
  {
    day: 'Sun',
    posts: [
      { id: 12, platform: 'Twitter', type: 'Thread', title: 'Week 1 launch lessons learned: What worked vs what flopped', theme: 'story', status: 'draft' },
    ],
  },
]

function SkeletonDayColumn({ day, dateStr, isToday }) {
  return (
    <div
      className={`p-3 rounded-2xl flex flex-col justify-between min-h-[240px] transition-all ${
        isToday
          ? 'bg-[#0c1424]'
          : 'bg-[#0d1424]/80 border border-slate-800/80'
      }`}
      style={isToday ? {
        border: '2px solid var(--theme-accent, #10B981)',
        boxShadow: '0 0 24px -2px var(--theme-accent-bg, rgba(16,185,129,0.35))'
      } : {}}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <span 
            className={`text-xs font-bold ${isToday ? '' : 'text-slate-300'}`}
            style={isToday ? { color: 'var(--theme-accent, #10B981)' } : {}}
          >
            {day}
          </span>
          {isToday && (
            <span 
              className="inline-flex rounded-full h-1.5 w-1.5" 
              style={{ background: 'var(--theme-accent, #10B981)' }}
            />
          )}
        </div>
        <span className="text-[10px] font-mono text-slate-500">{dateStr}</span>
      </div>

      <div className="space-y-2 flex-1 animate-pulse">
        <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-12 h-3 bg-slate-700 rounded" />
            <div className="w-8 h-3 bg-slate-700 rounded-full" />
          </div>
          <div className="w-full h-3 bg-slate-700/80 rounded" />
          <div className="w-3/4 h-3 bg-slate-700/60 rounded" />
          <div className="w-10 h-2.5 bg-slate-800 rounded mt-1" />
        </div>

        <div className="p-2.5 rounded-xl bg-slate-800/30 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div className="w-10 h-3 bg-slate-700/70 rounded" />
            <div className="w-8 h-3 bg-slate-700/70 rounded-full" />
          </div>
          <div className="w-4/5 h-3 bg-slate-700/60 rounded" />
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800/60">
        <div className="w-full h-8 rounded-xl bg-slate-800/40 border border-dashed border-slate-700/40 animate-pulse" />
      </div>
    </div>
  )
}

function PostCard({
  post,
  day,
  onCopy,
  onSchedule,
  onRegenerate,
  isRegenerating,
  copiedId,
  onOpen,
  onDelete
}) {
  const [showWhy, setShowWhy] = useState(false)
  const theme = THEMES[post.theme] || THEMES.value
  const status = STATUS_STYLES[post.status] || STATUS_STYLES.draft
  const plat = PLATFORM_CONFIG[post.platform] || PLATFORM_CONFIG.Instagram
  const PlatformIcon = plat.icon || Sparkles

  if (isRegenerating) {
    return (
      <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="w-14 h-3 bg-slate-700 rounded" />
          <div className="w-10 h-3 bg-slate-700 rounded-full" />
        </div>
        <div className="w-full h-3 bg-slate-700/80 rounded" />
        <div className="w-2/3 h-3 bg-slate-700/50 rounded" />
      </div>
    )
  }

  return (
    <div
      onClick={() => onOpen && onOpen(post)}
      className="group relative p-2.5 sm:p-3 rounded-xl bg-[#0f172a]/90 hover:bg-[#15213b] border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 overflow-hidden"
    >
      {/* Top subtle platform color edge accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity"
        style={{
          background: `linear-gradient(90deg, ${plat.color} 0%, transparent 80%)`
        }}
      />

      {/* Card Header: Platform + Format Type + Theme */}
      <div>
        <div className="flex items-center justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded font-mono flex items-center gap-1 shrink-0"
              style={{ background: plat.badgeBg, color: plat.badgeColor }}
            >
              <PlatformIcon size={9} />
              {plat.abbr}
            </span>
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-tight truncate">
              {post.type}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span
              className="text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
              style={{ background: theme.bg, color: theme.color, border: `1px solid ${theme.border}` }}
            >
              {theme.label}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowWhy(w => !w)
              }}
              title="View post strategy rationale"
              className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-slate-300 transition-opacity p-0.5"
            >
              <Info size={10} />
            </button>
          </div>
        </div>

        {/* Post Title / Hook */}
        <p className="text-[11px] sm:text-[12px] text-slate-200 group-hover:text-white font-medium leading-snug line-clamp-2 transition-colors">
          {post.title}
        </p>

        {/* Why Strategy Tooltip */}
        {showWhy && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-2 p-2 rounded-lg text-[10px] leading-relaxed text-slate-300 border border-slate-700/80 bg-slate-900/95 animate-fade-in"
          >
            <span className="font-semibold text-cyan-400 block mb-0.5">{theme.tag} STRATEGY</span>
            {theme.why}
          </div>
        )}
      </div>

      {/* Card Footer: Status + Hover Action Toolbar */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 mt-1">
        <span
          className="text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 border"
          style={{ background: status.bg, color: status.color, borderColor: status.border }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
          {status.label}
        </span>

        {/* Quick action buttons on hover */}
        <div className="flex items-center gap-0.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onCopy(post.id, post.title)
            }}
            title={copiedId === post.id ? 'Copied hook!' : 'Copy hook text'}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {copiedId === post.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRegenerate(post.id, day)
            }}
            disabled={isRegenerating}
            title="Regenerate this specific post with AI"
            className="p-1 rounded-md text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <RefreshCw size={11} className={isRegenerating ? 'animate-spin text-cyan-400' : ''} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onSchedule(post.id)
            }}
            title={post.status === 'scheduled' ? 'Mark as Draft' : 'Mark as Scheduled'}
            className={`p-1 rounded-md transition-colors ${
              post.status === 'scheduled'
                ? 'text-cyan-400 bg-cyan-950/40 hover:bg-cyan-950/70'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Calendar size={11} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              if (window.confirm('Delete this post draft from your calendar?')) {
                onDelete(post.id)
              }
            }}
            title="Delete post"
            className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptySlot({ day, onGenerate, isGenerating }) {
  return (
    <button
      type="button"
      onClick={() => onGenerate(day)}
      disabled={isGenerating}
      title={`Ask Forge AI to craft a strategic ${day} post`}
      className="w-full rounded-xl border border-dashed border-slate-800 hover:border-cyan-500/50 bg-slate-900/30 hover:bg-cyan-950/20 p-2.5 sm:p-3 flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer group disabled:opacity-50"
    >
      {isGenerating ? (
        <RefreshCw size={12} className="text-cyan-400 animate-spin" />
      ) : (
        <>
          <Sparkles size={12} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
          <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
            AI Post Suggestion
          </span>
        </>
      )}
    </button>
  )
}

export default function ContentCalendar() {
  const {
    creatorData,
    startBgJob,
    cancelBgJob,
    clearBgJob,
    incrementAiActions,
    setApiModalOpen,
    triggerToast,
    syncSessionToDb,
    dbLoadedTimestamp,
    userProfile
  } = useForge()

  const handle = creatorData?.handle || 'default'
  const creatorName = creatorData?.name || creatorData?.handle?.replace('@', '') || 'Creator'
  const niche = creatorData?.niche || 'creator community'
  const productName = creatorData?.productName || 'VIP Launch'

  const detectedBrandColor = useMemo(() => {
    if (creatorData?.brand_color && creatorData.brand_color !== '#7C5CFC') return creatorData.brand_color
    if (creatorData?.brandColor && creatorData.brandColor !== '#7C5CFC') return creatorData.brandColor
    if (creatorData?.brandHex && creatorData.brandHex !== '#7C5CFC') return creatorData.brandHex
    if (creatorData?.color && creatorData.color !== '#7C5CFC') return creatorData.color
    try {
      const rawMap = localStorage.getItem("forge_creator_brand_color_map")
      if (rawMap) {
        const map = JSON.parse(rawMap)
        const id = creatorData?.id
        const handleClean = (creatorData?.handle || '').replace(/^@/, '').toLowerCase()
        const name = (creatorData?.name || '').toLowerCase()
        if (id && map[id]?.primaryHex) return map[id].primaryHex
        if (handleClean && map[handleClean]?.primaryHex) return map[handleClean].primaryHex
        if (name && map[name]?.primaryHex) return map[name].primaryHex
      }
    } catch {}
    const det = getDeterministicBrandColor(creatorData)
    if (det?.primaryHex) return det.primaryHex
    return '#10B981'
  }, [creatorData])

  const [cr, cg, cb] = useMemo(() => hexToRgb(detectedBrandColor), [detectedBrandColor])
  const brandTextColor = useMemo(() => getContrastTextColor(detectedBrandColor), [detectedBrandColor])
  const accent = useMemo(() => ({
    color: detectedBrandColor,
    rgb: `${cr},${cg},${cb}`,
    contrastText: brandTextColor
  }), [detectedBrandColor, cr, cg, cb, brandTextColor])

  // View mode: 'grid' (7-day columns) or 'feed' (chronological timeline)
  const [viewMode, setViewMode] = useState('grid')

  // Filter state: 'all' or specific platform
  const [platformFilter, setPlatformFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [activeGoal, setActiveGoal] = useState(() => {
    return localStorage.getItem(`forge_${handle}_calendar_active_goal`) || 'launch'
  })

  const [week, setWeek] = useState(0)

  const [calendar, setCalendar] = useState(() => {
    const initialGoal = localStorage.getItem(`forge_${handle}_calendar_active_goal`) || 'launch'
    const cacheKey = `forge_calendar_${handle}_${initialGoal}_w0`
    const cacheKeyLower = `forge_calendar_${handle.toLowerCase()}_${initialGoal.toLowerCase()}_w0`
    try {
      const cached = localStorage.getItem(cacheKey) || localStorage.getItem(cacheKeyLower)
      if (cached) return JSON.parse(cached)
    } catch (e) {
      console.error('Failed to parse cached calendar:', e)
    }
    return null
  })

  // Save activeGoal selection to localStorage
  useEffect(() => {
    localStorage.setItem(`forge_${handle}_calendar_active_goal`, activeGoal)
  }, [activeGoal, handle])

  const [copiedId, setCopiedId] = useState(null)
  const [regeneratingPostId, setRegeneratingPostId] = useState(null)
  const [generatingSlot, setGeneratingSlot] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const [selectedDay, setSelectedDay] = useState(null)

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newPostData, setNewPostData] = useState({
    title: '',
    day: 'Mon',
    platform: 'YouTube',
    type: 'Video',
    theme: 'launch',
    status: 'draft'
  })

  // Calculate dynamic week dates
  const getWeekDates = (weekOffset) => {
    const dates = []
    const today = new Date()
    const currentDay = today.getDay()
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + distanceToMonday + i + (weekOffset * 7))
      dates.push(d)
    }
    return dates
  }
  const weekDates = useMemo(() => getWeekDates(week), [week])

  // Derive stable job id from current goal + week
  const calJobId = `calendar-week-${activeGoal}-${week}`
  const calJob = useBgJob(calJobId)

  // Week number & header label
  const weekLabel = useMemo(() => {
    const monday = weekDates[0]
    const sunday = weekDates[6]
    if (!monday || !sunday) return 'Current Week'
    const monStr = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const sunStr = sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const weekNum = Math.ceil((((monday - new Date(monday.getFullYear(), 0, 1)) / 86400000) + 1) / 7)
    return `Week ${weekNum} • ${monStr} – ${sunStr}`
  }, [weekDates])

  const loadOrGenerateCalendar = async (goal, forceRegenerate = false) => {
    const h = creatorData?.handle || 'default'
    const cacheKey = `forge_calendar_${h}_${goal}_w${week}`

    if (!forceRegenerate) {
      const cacheKeyLower = `forge_calendar_${h.toLowerCase()}_${goal.toLowerCase()}_w${week}`
      const cached = localStorage.getItem(cacheKey) || localStorage.getItem(cacheKeyLower)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          setCalendar(parsed)
          setError(null)
          return
        } catch (e) {
          console.error('Failed to parse cached calendar:', e)
        }
      }
    }

    if (!hasTextKey()) {
      // Offline fallback: adapt initial calendar
      const adaptedMock = INITIAL_CALENDAR.map(day => ({
        ...day,
        posts: day.posts.map(post => {
          let newTheme = post.theme
          if (goal === 'community' && post.theme === 'launch') newTheme = 'community'
          if (goal === 'engagement' && post.theme === 'launch') newTheme = 'value'
          if (goal === 'growth' && post.theme === 'launch') newTheme = 'proof'
          return {
            ...post,
            theme: newTheme,
            title: post.title.replace(/Launch/i, goal.charAt(0).toUpperCase() + goal.slice(1))
          }
        })
      }))
      setCalendar(adaptedMock)
      localStorage.setItem(cacheKey, JSON.stringify(adaptedMock))
      setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const result = await generateContentCalendar(creatorData, goal)
      if (result && Array.isArray(result)) {
        let idCounter = 1
        const normalized = result.map(day => ({
          day: day.day,
          posts: (day.posts || []).map(post => ({
            id: `post-gen-${Date.now()}-${idCounter++}`,
            platform: post.platform || 'YouTube',
            type: post.type || 'Video',
            title: post.title || 'Untitled Hook',
            theme: THEMES[post.theme] ? post.theme : 'value',
            status: STATUS_STYLES[post.status] ? post.status : 'draft'
          }))
        }))
        setCalendar(normalized)
        localStorage.setItem(cacheKey, JSON.stringify(normalized))
        setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
      } else {
        throw new Error("Invalid response format received from AI.")
      }
    } catch (err) {
      console.error(err)
      setError("AI generation failed. Using cached or fallback schedule.")
      const fallback = localStorage.getItem(cacheKey)
      if (fallback) {
        setCalendar(JSON.parse(fallback))
      } else {
        setCalendar(INITIAL_CALENDAR)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userProfile?.username && dbLoadedTimestamp === 0) return
    const h = creatorData?.handle
    if (!h || h === 'default') {
      setCalendar(INITIAL_CALENDAR)
      return
    }
    loadOrGenerateCalendar(activeGoal, false)
  }, [activeGoal, week, creatorData?.handle, dbLoadedTimestamp, userProfile?.username])

  // Reload activeGoal when database loads
  useEffect(() => {
    const h = creatorData?.handle || 'default'
    const cachedGoal = localStorage.getItem(`forge_${h}_calendar_active_goal`) || 'launch'
    if (cachedGoal !== activeGoal) {
      setActiveGoal(cachedGoal)
    }
  }, [dbLoadedTimestamp, creatorData?.handle])

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    if (triggerToast) triggerToast('Post hook copied to clipboard!', 'success')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSchedule = (id) => {
    setCalendar(prev => {
      if (!prev) return null
      const updated = prev.map(day => ({
        ...day,
        posts: day.posts.map(p => {
          if (p.id === id) {
            const nextStatus = p.status === 'scheduled' ? 'draft' : 'scheduled'
            return { ...p, status: nextStatus }
          }
          return p
        }),
      }))
      const h = creatorData?.handle || 'default'
      const cacheKey = `forge_calendar_${h}_${activeGoal}_w${week}`
      localStorage.setItem(cacheKey, JSON.stringify(updated))
      return updated
    })
    setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
  }

  // Handle background job result
  useEffect(() => {
    if (calJob.status === 'done' && calJob.result) {
      const result = calJob.result
      if (Array.isArray(result)) {
        let idCounter = 1
        const normalized = result.map(day => ({
          day: day.day,
          posts: (day.posts || []).map(post => ({
            id: `post-gen-${Date.now()}-${idCounter++}`,
            platform: post.platform || 'YouTube',
            type: post.type || 'Video',
            title: post.title || 'Untitled Post',
            theme: THEMES[post.theme] ? post.theme : 'value',
            status: STATUS_STYLES[post.status] ? post.status : 'draft'
          }))
        }))
        const h = creatorData?.handle || 'default'
        const cacheKey = `forge_calendar_${h}_${activeGoal}_w${week}`
        setCalendar(normalized)
        localStorage.setItem(cacheKey, JSON.stringify(normalized))
        clearBgJob(calJobId)
        if (triggerToast) triggerToast(`7-Day ${activeGoal} plan auto-filled!`, 'success')
        setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
      } else {
        clearBgJob(calJobId)
      }
    }
    if (calJob.status === 'error' || calJob.status === 'cancelled') {
      setError(calJob.status === 'cancelled' ? 'AI generation cancelled.' : 'AI generation error.')
      clearBgJob(calJobId)
    }
  }, [calJob.status, calJob.result])

  const handleRegenerateWeek = () => {
    if (calJob.status === 'running') return
    if (!hasTextKey()) {
      setApiModalOpen(true)
      return
    }
    if (incrementAiActions) incrementAiActions()
    setCalendar(null) // trigger skeleton loader immediately
    startBgJob(calJobId, (sig) => generateContentCalendar(creatorData, activeGoal, sig))
  }

  const handleGenerateSlot = async (day) => {
    setGeneratingSlot(day)
    if (incrementAiActions) incrementAiActions()
    try {
      if (!hasTextKey()) {
        setApiModalOpen(true)
        setGeneratingSlot(null)
        return
      }
      const postData = await generateSingleCalendarPost(creatorData, day, activeGoal)
      const newPost = {
        id: `slot-gen-${Date.now()}`,
        platform: postData.platform || 'YouTube',
        type: postData.type || 'Video',
        title: postData.title || `Strategic ${day} hook for ${creatorName}`,
        theme: THEMES[postData.theme] ? postData.theme : 'value',
        status: postData.status || 'draft',
      }
      setCalendar(prev => {
        if (!prev) return null
        const updated = prev.map(d =>
          d.day === day ? { ...d, posts: [...d.posts, newPost] } : d
        )
        const h = creatorData?.handle || 'default'
        const cacheKey = `forge_calendar_${h}_${activeGoal}_w${week}`
        localStorage.setItem(cacheKey, JSON.stringify(updated))
        if (triggerToast) triggerToast(`Generated custom post for ${day}!`, 'success')
        return updated
      })
      setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
    } catch (err) {
      console.error(err)
      alert("Failed to generate post: " + err.message)
    } finally {
      setGeneratingSlot(null)
    }
  }

  const handleRegeneratePost = async (postId, day) => {
    setRegeneratingPostId(postId)
    if (incrementAiActions) incrementAiActions()
    try {
      if (!hasTextKey()) {
        setApiModalOpen(true)
        setRegeneratingPostId(null)
        return
      }
      const postData = await generateSingleCalendarPost(creatorData, day, activeGoal)
      const updatedPost = {
        id: postId,
        platform: postData.platform || 'YouTube',
        type: postData.type || 'Video',
        title: postData.title || `Forge generated post for ${day}`,
        theme: THEMES[postData.theme] ? postData.theme : 'value',
        status: 'draft',
      }
      setCalendar(prev => {
        if (!prev) return null
        const updated = prev.map(d =>
          d.day === day
            ? { ...d, posts: d.posts.map(p => p.id === postId ? updatedPost : p) }
            : d
        )
        const h = creatorData?.handle || 'default'
        const cacheKey = `forge_calendar_${h}_${activeGoal}_w${week}`
        localStorage.setItem(cacheKey, JSON.stringify(updated))
        if (triggerToast) triggerToast('Post draft regenerated!', 'success')
        return updated
      })
      setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
    } catch (err) {
      console.error(err)
      alert("Failed to regenerate post suggestion: " + err.message)
    } finally {
      setRegeneratingPostId(null)
    }
  }

  const handleAddPost = () => {
    setNewPostData({
      title: '',
      day: 'Mon',
      platform: 'YouTube',
      type: 'Video',
      theme: 'launch',
      status: 'draft'
    })
    setIsAddModalOpen(true)
  }

  const handleSaveNewPost = () => {
    if (!newPostData.title.trim()) return
    const newPost = {
      id: `custom-${Date.now()}`,
      platform: newPostData.platform,
      type: newPostData.type,
      title: newPostData.title,
      theme: newPostData.theme,
      status: newPostData.status,
    }
    setCalendar(prev => {
      if (!prev) return null
      const updated = prev.map(d =>
        d.day === newPostData.day ? { ...d, posts: [...d.posts, newPost] } : d
      )
      const h = creatorData?.handle || 'default'
      const cacheKey = `forge_calendar_${h}_${activeGoal}_w${week}`
      localStorage.setItem(cacheKey, JSON.stringify(updated))
      return updated
    })
    setIsAddModalOpen(false)
    if (triggerToast) triggerToast('Custom post added to schedule!', 'success')
    setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
  }

  const handleScheduleAllDrafts = () => {
    if (!calendar) return
    setCalendar(prev => {
      if (!prev) return null
      const updated = prev.map(day => ({
        ...day,
        posts: day.posts.map(p => p.status === 'draft' ? { ...p, status: 'scheduled' } : p),
      }))
      const h = creatorData?.handle || 'default'
      const cacheKey = `forge_calendar_${h}_${activeGoal}_w${week}`
      localStorage.setItem(cacheKey, JSON.stringify(updated))
      return updated
    })
    if (triggerToast) triggerToast('All draft posts marked as Scheduled!', 'success')
    setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
  }

  const handleSaveEditedPost = (updatedPost) => {
    setCalendar(prev => {
      if (!prev) return null
      const updated = prev.map(d =>
        d.day === selectedDay
          ? { ...d, posts: d.posts.map(p => p.id === updatedPost.id ? { ...p, ...updatedPost } : p) }
          : d
      )
      const h = creatorData?.handle || 'default'
      const cacheKey = `forge_calendar_${h}_${activeGoal}_w${week}`
      localStorage.setItem(cacheKey, JSON.stringify(updated))
      if (triggerToast) triggerToast('Post updated successfully!', 'success')
      return updated
    })
    setSelectedPost(null)
    setSelectedDay(null)
    setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
  }

  const handleDeletePost = (postId) => {
    setCalendar(prev => {
      if (!prev) return null
      const updated = prev.map(d => ({
        ...d,
        posts: d.posts.filter(p => p.id !== postId)
      }))
      const h = creatorData?.handle || 'default'
      const cacheKey = `forge_calendar_${h}_${activeGoal}_w${week}`
      localStorage.setItem(cacheKey, JSON.stringify(updated))
      if (triggerToast) triggerToast('Post removed from calendar', 'success')
      return updated
    })
    setSelectedPost(null)
    setSelectedDay(null)
    setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
  }

  // Analytics Metrics
  const totalPosts = calendar ? calendar.reduce((s, d) => s + (d.posts ? d.posts.length : 0), 0) : 0
  const scheduledCount = calendar ? calendar.reduce((s, d) => s + (d.posts ? d.posts.filter(p => p.status === 'scheduled').length : 0), 0) : 0
  const draftsCount = calendar ? calendar.reduce((s, d) => s + (d.posts ? d.posts.filter(p => p.status === 'draft').length : 0), 0) : 0
  const postedCount = calendar ? calendar.reduce((s, d) => s + (d.posts ? d.posts.filter(p => p.status === 'posted').length : 0), 0) : 0
  const readinessPercent = totalPosts > 0 ? Math.round((scheduledCount / totalPosts) * 100) : 0

  // Platform breakdown counts
  const platformCounts = useMemo(() => {
    if (!calendar) return {}
    const counts = {}
    calendar.forEach(d => {
      (d.posts || []).forEach(p => {
        counts[p.platform] = (counts[p.platform] || 0) + 1
      })
    })
    return counts
  }, [calendar])

  // Filtered days data
  const filteredCalendar = useMemo(() => {
    if (!calendar) return []
    return calendar.map(dayData => ({
      ...dayData,
      posts: (dayData.posts || []).filter(p => {
        const matchesPlatform = platformFilter === 'all' || p.platform.toLowerCase() === platformFilter.toLowerCase()
        const matchesStatus = statusFilter === 'all' || p.status.toLowerCase() === statusFilter.toLowerCase()
        return matchesPlatform && matchesStatus
      })
    }))
  }, [calendar, platformFilter, statusFilter])

  // Flattened posts for Feed / Timeline view
  const allChronologicalPosts = useMemo(() => {
    if (!filteredCalendar) return []
    const list = []
    filteredCalendar.forEach((dayData, idx) => {
      const dateObj = weekDates[idx]
      ;(dayData.posts || []).forEach(post => {
        list.push({
          ...post,
          day: dayData.day,
          dateObj,
          dayIndex: idx
        })
      })
    })
    return list
  }, [filteredCalendar, weekDates])

  const activeGoalDetails = GOAL_CONFIG[activeGoal] || GOAL_CONFIG.launch
  const ActiveGoalIcon = activeGoalDetails.icon

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* ─── 1. TOP COMMAND HERO HEADER ──────────────────────────── */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#0f172a]/90 via-[#0a0f1d]/90 to-[#080c14] border border-slate-800/80 p-5 sm:p-7 overflow-hidden">
        {/* Subtle ambient light glow */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-10 w-64 h-24 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Left Title & Strategy Context */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold"
                style={{
                  color: accent.color,
                  background: `rgba(${accent.rgb}, 0.12)`,
                  border: `1px solid rgba(${accent.rgb}, 0.35)`
                }}
              >
                <Sparkles size={11} className="animate-pulse" style={{ color: accent.color }} />
                CONTENT CALENDAR & CADENCE ENGINE
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                {weekLabel}
              </span>
              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                @{handle.replace('@', '')} • {niche}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              This Week's Content Plan
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Forge engineered a strategic 7-day multi-channel roadmap for <strong className="text-slate-200">{creatorName}</strong> around <strong style={{ color: accent.color }}>"{productName}"</strong>. Click any card to customize or generate full captions with AI.
            </p>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
            {calJob.status === 'running' && (
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
                style={{
                  background: `rgba(${accent.rgb}, 0.12)`,
                  border: `1px solid rgba(${accent.rgb}, 0.35)`
                }}
              >
                <span className="inline-flex rounded-full h-2 w-2" style={{ background: accent.color }}></span>
                <span className="text-xs font-mono" style={{ color: accent.color }}>AI generating schedule…</span>
                <button
                  type="button"
                  onClick={() => cancelBgJob(calJobId)}
                  className="text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-wider ml-1"
                >
                  Cancel
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleRegenerateWeek}
              disabled={calJob.status === 'running' || isLoading}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-sm hover:brightness-110 active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${accent.color} 0%, rgba(${accent.rgb}, 0.88) 100%)`,
                color: accent.contrastText || '#090d16',
                boxShadow: `0 2px 14px rgba(${accent.rgb}, 0.28)`
              }}
            >
              <Wand2 size={13} className={calJob.status === 'running' || isLoading ? 'animate-spin' : ''} />
              <span>{calJob.status === 'running' ? 'Crafting Week…' : 'Auto-fill Week with AI'}</span>
            </button>

            <button
              type="button"
              onClick={handleAddPost}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Post</span>
            </button>

            <button
              type="button"
              onClick={handleScheduleAllDrafts}
              title="Batch schedule all draft posts"
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/50 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              <CheckCircle2 size={13} />
              <span className="hidden sm:inline">Schedule All</span>
            </button>
          </div>
        </div>

        {/* Offline / Mock Warning Notice */}
        {!hasTextKey() && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={15} className="text-amber-400 shrink-0" />
              <span>
                <strong>Mock Calendar Mode:</strong> Add your Gemini or OpenAI API key in Settings to unlock real-time contextual calendar generation.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setApiModalOpen(true)}
              className="font-bold underline text-amber-300 hover:text-amber-100 shrink-0"
            >
              Add Key →
            </button>
          </div>
        )}
      </div>

      {/* ─── 2. CADENCE METRIC STRIP ──────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Planned Velocity */}
        <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Weekly Volume</span>
            <Calendar size={13} className="text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{totalPosts}</span>
            <span className="text-[11px] text-slate-400">
              {totalPosts > 0 ? `~${(totalPosts / 7).toFixed(1)}/day` : '0/day'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block font-mono">
            Optimal target: 8–14 posts/week
          </span>
        </div>

        {/* Metric 2: Scheduled Readiness */}
        <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Schedule Readiness</span>
            <Clock size={13} className="text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400">{scheduledCount}</span>
            <span className="text-[11px] text-slate-400">of {totalPosts} ready ({readinessPercent}%)</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${readinessPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Channels Activated */}
        <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800/80">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Channels Active</span>
            <Layers size={13} className="text-purple-400" />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            {Object.keys(platformCounts).length === 0 ? (
              <span className="text-xs text-slate-500">None yet</span>
            ) : (
              Object.entries(platformCounts).map(([platform, count]) => {
                const conf = PLATFORM_CONFIG[platform] || PLATFORM_CONFIG.Instagram
                return (
                  <span
                    key={platform}
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                    style={{ background: conf.badgeBg, color: conf.badgeColor }}
                  >
                    {conf.abbr} {count}
                  </span>
                )
              })
            )}
          </div>
        </div>

        {/* Metric 4: Campaign Objective */}
        <div className="p-4 rounded-2xl bg-[#0d1424] border border-slate-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Strategy</span>
            <ActiveGoalIcon size={13} style={{ color: activeGoalDetails.color }} />
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="text-sm font-bold uppercase tracking-wide"
              style={{ color: activeGoalDetails.color }}
            >
              {activeGoalDetails.label} Mode
            </span>
          </div>
          <span className="text-[10px] text-slate-400 line-clamp-1 leading-snug">
            {activeGoalDetails.tagline}
          </span>
        </div>
      </div>

      {/* ─── 3. STRATEGY CONTROLS & DUAL-TIER FILTER BAR ────────── */}
      <div className="rounded-2xl bg-[#0d1424]/90 border border-slate-800/80 p-3 sm:p-4 space-y-3">

        {/* Top row: Campaign Goal Segmented Switcher + Week Navigation */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">

          {/* Goal Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Compass size={12} className="text-cyan-400" /> Goal:
            </span>
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
              {Object.entries(GOAL_CONFIG).map(([key, goalObj]) => {
                const IconComponent = goalObj.icon
                const isActive = activeGoal === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveGoal(key)}
                    disabled={isLoading}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 text-white border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <IconComponent
                      size={12}
                      style={{ color: isActive ? goalObj.color : 'currentColor' }}
                    />
                    <span>{goalObj.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Week offset navigator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setWeek(w => w - 1)}
                disabled={isLoading}
                title="Previous Week"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => setWeek(0)}
                className={`text-xs font-mono px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  week === 0
                    ? 'text-cyan-400 font-bold bg-cyan-950/40 border border-cyan-800/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {week === 0 ? 'This Week' : week > 0 ? `+${week}w` : `${week}w`}
              </button>
              <button
                type="button"
                onClick={() => setWeek(w => w + 1)}
                disabled={isLoading}
                title="Next Week"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* View Mode Toggle: Grid vs Feed */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="7-Day Column Grid View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('feed')}
                title="Chronological Feed View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'feed'
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <List size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom row: Platform & Status Filter Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
          {/* Platform chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Filter size={11} /> Filter:
            </span>
            <button
              type="button"
              onClick={() => setPlatformFilter('all')}
              className={`text-[11px] font-mono px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                platformFilter === 'all'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-transparent'
              }`}
            >
              All Platforms
            </button>
            {Object.keys(PLATFORM_CONFIG).map(plat => (
              <button
                key={plat}
                type="button"
                onClick={() => setPlatformFilter(plat.toLowerCase())}
                className={`text-[11px] font-mono px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  platformFilter === plat.toLowerCase()
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-transparent'
                }`}
              >
                {plat}
              </button>
            ))}
          </div>

          {/* Status filter chips */}
          <div className="flex items-center gap-1.5 shrink-0">
            {['all', 'draft', 'scheduled', 'posted'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 4. MAIN CONTENT AREA: 7-DAY GRID OR FEED VIEW ──────── */}
      {viewMode === 'grid' ? (
        /* 4 CARDS PER ROW RESPONSIVE GRID */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading || calJob.status === 'running' || !calendar ? (
            /* SKELETON LOADER (4 CARDS PER ROW) */
            <>
              {DAYS.map((day, i) => {
                const dateObj = weekDates[i]
                const dateStr = dateObj ? `${dateObj.getMonth() + 1}/${dateObj.getDate()}` : ''
                const isToday = week === 0 && dateObj && dateObj.toDateString() === new Date().toDateString()
                return (
                  <SkeletonDayColumn
                    key={day}
                    day={day}
                    dateStr={dateStr}
                    isToday={isToday}
                  />
                )
              })}
              <div className="p-4 rounded-2xl bg-[#0d1424]/40 border border-dashed border-slate-800/60 flex flex-col justify-between min-h-[240px] animate-pulse">
                <div className="h-4 w-28 bg-slate-800 rounded" />
                <div className="space-y-2 my-auto">
                  <div className="h-10 bg-slate-800/50 rounded-xl" />
                  <div className="h-10 bg-slate-800/30 rounded-xl" />
                </div>
                <div className="h-8 bg-slate-800/40 rounded-xl" />
              </div>
            </>
          ) : (
            <>
              {filteredCalendar.map((dayData, dayIdx) => {
                const dateObj = weekDates[dayIdx]
                const isToday = week === 0 && dateObj && dateObj.toDateString() === new Date().toDateString()
                const dateStr = dateObj ? `${dateObj.getMonth() + 1}/${dateObj.getDate()}` : ''

                return (
                  <div
                    key={dayData.day}
                    className={`p-3.5 sm:p-4 rounded-2xl flex flex-col justify-between min-h-[230px] transition-all duration-200 ${
                      isToday
                        ? 'bg-[#0c1527]'
                        : 'bg-[#0d1424] border border-slate-800/80 hover:border-slate-700'
                    }`}
                    style={isToday ? {
                      border: `2px solid rgba(${accent.rgb}, 0.85)`,
                      boxShadow: `0 0 24px -2px rgba(${accent.rgb}, 0.35)`
                    } : {}}
                  >
                    {/* Day Column Header */}
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className={`text-xs font-bold ${isToday ? '' : 'text-slate-300'}`}
                            style={isToday ? { color: accent.color } : {}}
                          >
                            {dayData.day}
                          </span>
                          {isToday && (
                            <span 
                              className="inline-flex rounded-full h-1.5 w-1.5"
                              style={{ background: accent.color }}
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-slate-500">{dateStr}</span>
                          {(dayData.posts || []).length > 0 && (
                            <span className="text-[9px] font-mono px-1 rounded bg-slate-800 text-slate-400">
                              {dayData.posts.length}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Posts inside day column */}
                      <div className="space-y-2">
                        {(dayData.posts || []).map((post) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            day={dayData.day}
                            onCopy={handleCopy}
                            onSchedule={handleSchedule}
                            onRegenerate={(id) => handleRegeneratePost(id, dayData.day)}
                            isRegenerating={regeneratingPostId === post.id}
                            copiedId={copiedId}
                            onOpen={(p) => {
                              setSelectedPost(p)
                              setSelectedDay(dayData.day)
                            }}
                            onDelete={handleDeletePost}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Empty Slot / AI Post Generator button */}
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60">
                      <EmptySlot
                        day={dayData.day}
                        onGenerate={handleGenerateSlot}
                        isGenerating={generatingSlot === dayData.day}
                      />
                    </div>
                  </div>
                )
              })}

              {/* 8th Slot: Weekly Buffer & Ideas Scratchpad to complete 4-per-row grid */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-[#0e1627]/90 to-[#0a0f1d]/90 border border-dashed border-slate-800/90 hover:border-cyan-500/40 flex flex-col justify-between min-h-[230px] transition-all group">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={13} className="text-cyan-400" />
                      <span className="text-xs font-bold text-slate-200">Ideas & Buffer</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400/90 bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-800/40 font-semibold">
                      VAULT
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mt-2">
                    Capture scratchpad ideas, unscheduled post hooks, or stage drafts for next week.
                  </p>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Weekly Tip</span>
                    <p className="text-[11px] text-slate-300">
                      Consistency beats intensity: keep at least 2 evergreen value posts queued ahead.
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={handleAddPost}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/70 transition-all cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Quick Add Draft</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        /* CHRONOLOGICAL TIMELINE / FEED VIEW */
        <div className="rounded-2xl bg-[#0d1424] border border-slate-800/80 p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Chronological Release Feed
              </h3>
              <p className="text-xs text-slate-400">
                {allChronologicalPosts.length} posts queued across this week
              </p>
            </div>
          </div>

          {allChronologicalPosts.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No posts match the active platform or status filter.
            </div>
          ) : (
            <div className="space-y-3">
              {allChronologicalPosts.map((post) => {
                const plat = PLATFORM_CONFIG[post.platform] || PLATFORM_CONFIG.Instagram
                const theme = THEMES[post.theme] || THEMES.value
                const status = STATUS_STYLES[post.status] || STATUS_STYLES.draft
                const PlatformIcon = plat.icon || Sparkles

                return (
                  <div
                    key={post.id}
                    onClick={() => {
                      setSelectedPost(post)
                      setSelectedDay(post.day)
                    }}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: plat.badgeBg, color: plat.badgeColor }}
                      >
                        <PlatformIcon size={18} />
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                            {post.day} {post.dateObj ? `${post.dateObj.getMonth() + 1}/${post.dateObj.getDate()}` : ''}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {post.platform}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            • {post.type}
                          </span>
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                            style={{ background: theme.bg, color: theme.color }}
                          >
                            {theme.label}
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {post.title}
                        </p>

                        <p className="text-xs text-slate-400">
                          {theme.why}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 border"
                        style={{ background: status.bg, color: status.color, borderColor: status.border }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
                        {status.label}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCopy(post.id, post.title)
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Copy hook"
                      >
                        {copiedId === post.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSchedule(post.id)
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
                        title="Toggle schedule"
                      >
                        <Calendar size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (window.confirm('Delete this post?')) {
                            handleDeletePost(post.id)
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                        title="Delete post"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── 5. CAMPAIGN THEME MATRIX / LEGEND ───────────────────── */}
      <div className="p-4 rounded-2xl bg-[#0d1424]/60 border border-slate-800/80">
        <div className="flex items-center gap-2 mb-2.5">
          <Info size={13} className="text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Campaign Conversion Architecture
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.entries(THEMES).map(([k, t]) => (
            <div
              key={k}
              className="p-2.5 rounded-xl border space-y-1"
              style={{ background: t.bg, borderColor: t.border }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold" style={{ color: t.color }}>{t.label}</span>
                <span className="text-[8px] font-mono opacity-60 text-slate-300">{t.tag}</span>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight">
                {t.why}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 6. ADD CUSTOM POST MODAL ────────────────────────────── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-[#0d1424] border border-slate-800 p-6 space-y-5 relative">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus size={16} className="text-cyan-400" /> Add Custom Post
                </h3>
                <p className="text-xs text-slate-400">
                  Insert a hand-crafted release hook into your weekly schedule.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Post Title / Hook
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-colors"
                  placeholder="e.g. 5 secrets to scaling your agency"
                  value={newPostData.title}
                  onChange={e => setNewPostData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* Day & Platform */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Day of Week
                  </label>
                  <select
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                    value={newPostData.day}
                    onChange={e => setNewPostData(prev => ({ ...prev, day: e.target.value }))}
                  >
                    {DAYS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Platform
                  </label>
                  <select
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                    value={newPostData.platform}
                    onChange={e => {
                      const platform = e.target.value
                      const defaultTypes = (PLATFORM_CONFIG[platform] && PLATFORM_CONFIG[platform].types) || ['Post']
                      setNewPostData(prev => ({
                        ...prev,
                        platform,
                        type: defaultTypes[0]
                      }))
                    }}
                  >
                    {Object.keys(PLATFORM_CONFIG).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Format Type & Campaign Theme */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Format Type
                  </label>
                  <select
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                    value={newPostData.type}
                    onChange={e => setNewPostData(prev => ({ ...prev, type: e.target.value }))}
                  >
                    {((PLATFORM_CONFIG[newPostData.platform] && PLATFORM_CONFIG[newPostData.platform].types) || ['Post']).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Campaign Theme
                  </label>
                  <select
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                    value={newPostData.theme}
                    onChange={e => setNewPostData(prev => ({ ...prev, theme: e.target.value }))}
                  >
                    {Object.entries(THEMES).map(([k, t]) => (
                      <option key={k} value={k}>{t.label} ({t.tag})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Initial Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Initial Status
                </label>
                <div className="flex gap-4">
                  {['draft', 'scheduled'].map(s => (
                    <label key={s} className="flex items-center gap-2 text-xs font-medium cursor-pointer text-slate-200">
                      <input
                        type="radio"
                        name="newPostStatus"
                        checked={newPostData.status === s}
                        onChange={() => setNewPostData(prev => ({ ...prev, status: s }))}
                        className="accent-cyan-400"
                      />
                      <span className="capitalize">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNewPost}
                disabled={!newPostData.title.trim()}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Add to Calendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── 7. POST DETAILS & AI STUDIO MODAL ───────────────────── */}
      {selectedPost && (
        <PostDetailsModal
          post={selectedPost}
          day={selectedDay}
          onClose={() => {
            setSelectedPost(null)
            setSelectedDay(null)
          }}
          onSave={handleSaveEditedPost}
          onDelete={handleDeletePost}
        />
      )}
    </div>
  )
}

// ─── POST DETAILS & AI STUDIO MODAL ────────────────────────────
function PostDetailsModal({ post, day, onClose, onSave, onDelete }) {
  const { creatorData, incrementAiActions, setApiModalOpen, triggerToast } = useForge()
  const [edited, setEdited] = useState({ ...post })
  const [activeTab, setActiveTab] = useState('details') // 'details' | 'ai-studio' | 'preview'
  const [isGeneratingBody, setIsGeneratingBody] = useState(false)
  const [selectedTone, setSelectedTone] = useState('Confident')

  // Close on Escape
  useEffect(() => {
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  const handleWriteWithAi = async () => {
    if (!hasTextKey()) {
      setApiModalOpen(true)
      return
    }
    setIsGeneratingBody(true)
    if (incrementAiActions) incrementAiActions()
    try {
      const text = await generateStudioContent(
        { label: `${edited.platform} ${edited.type || 'Post'}`, platform: edited.platform },
        edited.title || '',
        creatorData,
        selectedTone
      )
      setEdited(p => ({ ...p, body: text }))
      if (triggerToast) triggerToast('AI caption generated successfully!', 'success')
    } catch (err) {
      console.error(err)
      if (triggerToast) triggerToast(err.message || 'Failed to generate caption', 'error')
    } finally {
      setIsGeneratingBody(false)
    }
  }

  const plat = PLATFORM_CONFIG[edited.platform] || PLATFORM_CONFIG.YouTube
  const theme = THEMES[edited.theme] || THEMES.value
  const PlatformIcon = plat.icon || Sparkles

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl bg-[#0d1424] border border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Top ambient color strip */}
        <div
          className="h-1 w-full"
          style={{ background: `linear-gradient(90deg, ${plat.color} 0%, ${theme.color} 50%, transparent 100%)` }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: plat.badgeBg, color: plat.badgeColor }}
            >
              <PlatformIcon size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white truncate leading-snug">
                {edited.title || 'Untitled Hook'}
              </h3>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                <span className="font-mono text-cyan-400">{day}</span>
                <span>•</span>
                <span>{edited.platform} {edited.type}</span>
                <span>•</span>
                <span
                  className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase"
                  style={{ background: theme.bg, color: theme.color }}
                >
                  {theme.label}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center border-b border-slate-800 px-5 gap-4 bg-slate-950/40">
          {[
            { id: 'details', label: 'Post Parameters', icon: Pencil },
            { id: 'ai-studio', label: 'AI Caption Studio', icon: Wand2 },
            { id: 'preview', label: 'Social Mockup', icon: Eye },
          ].map(tab => {
            const TabIcon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 py-3 text-xs font-semibold relative transition-colors cursor-pointer ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TabIcon size={13} />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Hook / Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Post Hook / Video Title
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-colors"
                  value={edited.title || ''}
                  onChange={e => setEdited(p => ({ ...p, title: e.target.value }))}
                  placeholder="Your compelling hook..."
                />
              </div>

              {/* Platform & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Platform
                  </label>
                  <select
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                    value={edited.platform || 'YouTube'}
                    onChange={e => {
                      const pl = e.target.value
                      const defaultTypes = (PLATFORM_CONFIG[pl] && PLATFORM_CONFIG[pl].types) || ['Post']
                      setEdited(p => ({ ...p, platform: pl, type: defaultTypes[0] }))
                    }}
                  >
                    {Object.keys(PLATFORM_CONFIG).map(pl => (
                      <option key={pl} value={pl}>{pl}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Format
                  </label>
                  <select
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                    value={edited.type || 'Video'}
                    onChange={e => setEdited(p => ({ ...p, type: e.target.value }))}
                  >
                    {((PLATFORM_CONFIG[edited.platform] && PLATFORM_CONFIG[edited.platform].types) || ['Post']).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Theme & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Campaign Theme
                  </label>
                  <select
                    className="w-full rounded-xl bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none focus:border-cyan-400"
                    value={edited.theme || 'launch'}
                    onChange={e => setEdited(p => ({ ...p, theme: e.target.value }))}
                  >
                    {Object.entries(THEMES).map(([k, t]) => (
                      <option key={k} value={k}>{t.label} — {t.tag}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Status
                  </label>
                  <div className="flex gap-1.5">
                    {['draft', 'scheduled', 'posted'].map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEdited(p => ({ ...p, status: st }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                          edited.status === st
                            ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-700/60'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai-studio' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Tone:</span>
                  {['Confident', 'Urgent', 'Casual', 'Storytelling'].map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedTone(t)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                        selectedTone === t
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleWriteWithAi}
                  disabled={isGeneratingBody}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <Sparkles size={12} className={isGeneratingBody ? 'animate-spin' : ''} />
                  <span>{isGeneratingBody ? 'Writing with AI…' : 'Generate Full Copy'}</span>
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Post Caption & Script Body
                </label>
                <textarea
                  rows={8}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 p-3.5 text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-400 transition-colors leading-relaxed font-sans"
                  placeholder="Click 'Generate Full Copy' above or type your script, bullet points, or captions here..."
                  value={edited.body || ''}
                  onChange={e => setEdited(p => ({ ...p, body: e.target.value }))}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>{(edited.body || '').length} characters</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(edited.body || '')
                    if (triggerToast) triggerToast('Caption copied to clipboard!', 'success')
                  }}
                  className="text-cyan-400 hover:text-cyan-300 underline font-semibold cursor-pointer"
                >
                  Copy Text
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                  style={{ background: plat.badgeBg, color: plat.badgeColor }}
                >
                  {plat.abbr}
                </div>
                <div>
                  <p className="text-xs font-bold text-white leading-tight">
                    {creatorData?.name || 'Creator Name'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {edited.platform} • Scheduled for {day}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded inline-block" style={{ background: theme.bg, color: theme.color }}>
                  {theme.label} • {edited.type}
                </span>
                <p className="text-sm font-semibold text-white">
                  {edited.title || 'Your Hook Here'}
                </p>
                {edited.body && (
                  <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {edited.body}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/60">
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Delete this post?')) {
                  onDelete(edited.id)
                }
              }}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 px-3 py-2 rounded-xl hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(edited)}
              disabled={!(edited.title || '').trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Check size={13} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
