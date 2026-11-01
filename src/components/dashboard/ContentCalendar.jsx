import { useState, useEffect, useMemo, useRef } from 'react'
import { useForge } from '../../App'
import {
  Trophy,
  Flame,
  Sparkles,
  Zap,
  Target,
  CheckCircle2,
  Share2,
  Send,
  Volume2,
  Lightbulb,
  Plus,
  Play,
  ArrowRight,
  Clock,
  ExternalLink,
  Calendar,
  Columns,
  RefreshCw,
  Copy,
  Check,
  X,
  Pencil,
  Filter,
  ChevronLeft,
  ChevronRight,
  Wand2,
  ShieldCheck,
  Gauge,
  Youtube,
  Instagram,
  Twitter,
  Eye,
  MessageSquare,
  Video
} from 'lucide-react'

// Lightweight particle burst celebration for gamified publishing
function triggerConfettiBurst(originX, originY) {
  if (typeof window === 'undefined') return
  const count = 35
  const colors = ['#e11d48', '#38bdf8', '#34d399', '#fbbf24', '#a855f7', '#ffffff']
  const startX = originX ?? window.innerWidth * 0.75
  const startY = originY ?? window.innerHeight * 0.65

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    const size = Math.random() * 7 + 4
    el.style.position = 'fixed'
    el.style.zIndex = '99999'
    el.style.left = `${startX + (Math.random() * 40 - 20)}px`
    el.style.top = `${startY + (Math.random() * 40 - 20)}px`
    el.style.width = `${size}px`
    el.style.height = `${size * 0.6}px`
    el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    el.style.borderRadius = '2px'
    el.style.pointerEvents = 'none'
    el.style.transform = `rotate(${Math.random() * 360}deg)`
    el.style.transition = 'all 0.9s cubic-bezier(0.22, 1, 0.36, 1)'
    document.body.appendChild(el)

    const vx = (Math.random() - 0.5) * 320
    const vy = -Math.random() * 260 - 80

    requestAnimationFrame(() => {
      el.style.transform = `translate(${vx}px, ${vy + 380}px) rotate(${Math.random() * 720}deg)`
      el.style.opacity = '0'
    })

    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el)
    }, 950)
  }
}

// Strategy color tokens tailored for flat dark canvas with zero borders
const STRATEGY_CONFIG = {
  LAUNCH: { bg: 'bg-sky-500/15', text: 'text-sky-300', tag: 'CONVERSION', desc: 'High-urgency direct conversion hooks & checkout waitlist.' },
  VALUE: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', tag: 'AUTHORITY', desc: 'High-signal educational breakdowns & viral tips.' },
  BTS: { bg: 'bg-amber-500/15', text: 'text-amber-300', tag: 'HUMANITY', desc: 'Unfiltered build-in-public raw moments.' },
  PROOF: { bg: 'bg-purple-500/15', text: 'text-purple-300', tag: 'CREDIBILITY', desc: 'Case studies, testimonials, and user receipts.' },
  CTA: { bg: 'bg-rose-500/15', text: 'text-rose-300', tag: 'REVENUE', desc: 'Unapologetic call-to-actions targeting warm buyers.' },
  COMMUNITY: { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-300', tag: 'ENGAGEMENT', desc: 'Polls & questions that trigger algorithmic comments.' },
  STORY: { bg: 'bg-orange-500/15', text: 'text-orange-300', tag: 'RELATABILITY', desc: 'Personal storytelling connecting audience pain to solution.' }
}

export default function ContentCalendar() {
  const { creatorData, triggerToast } = useForge()

  const creatorName = creatorData?.name || creatorData?.handle?.replace('@', '') || 'Creator'
  const handleClean = (creatorData?.handle || creatorName || 'creator').replace('@', '').toLowerCase()
  const productName = creatorData?.productName || 'WorshipLeader+ Membership'

  // Brand Red styling with guaranteed white text
  const brandRed = '#c81e3c'

  // Gamification State (XP, Streak, Level)
  const [xp, setXp] = useState(() => {
    try {
      const saved = localStorage.getItem(`forge_calendar_xp_${handleClean}`)
      return saved ? parseInt(saved, 10) : 720
    } catch {
      return 720
    }
  })

  const [streak, setStreak] = useState(() => {
    try {
      const saved = localStorage.getItem(`forge_calendar_streak_${handleClean}`)
      return saved ? parseInt(saved, 10) : 4
    } catch {
      return 4
    }
  })

  // Level computation: Level 3 (0-999), Level 4 (1000-1499), Level 5 (1500+)
  const currentLevel = xp >= 1500 ? 5 : xp >= 1000 ? 4 : 3
  const targetXp = currentLevel === 3 ? 1000 : currentLevel === 4 ? 1500 : 2000
  const xpPercent = Math.min(100, Math.round((xp / targetXp) * 100))

  const addXP = (amount, reason, e) => {
    const nextXp = xp + amount
    setXp(nextXp)
    try {
      localStorage.setItem(`forge_calendar_xp_${handleClean}`, String(nextXp))
    } catch {}

    const rect = e?.currentTarget?.getBoundingClientRect()
    triggerConfettiBurst(rect ? rect.left + rect.width / 2 : undefined, rect ? rect.top : undefined)

    if (triggerToast) {
      triggerToast(`${reason} (+${amount} XP)`, 'success')
    }
  }

  // Active View Mode: 'sprint' (7-day board) vs 'calendar' (monthly grid)
  const [viewMode, setViewMode] = useState('sprint')
  const [platformFilter, setPlatformFilter] = useState('all')

  // Week offset state (0 = current week)
  const [weekOffset, setWeekOffset] = useState(0)

  // Modals state
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [newDraftModalOpen, setNewDraftModalOpen] = useState(false)
  const [isTweakingAi, setIsTweakingAi] = useState(false)
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false)

  // AI Modal Inputs
  const [aiProductName, setAiProductName] = useState(productName)
  const [aiProductUsp, setAiProductUsp] = useState(`Save 4 hours every week planning church gatherings with instant chord charts and stems. $29/mo with 7-day free trial.`)
  const [aiCampaignGoal, setAiCampaignGoal] = useState('LaunchUrgency')

  // New Draft Modal Inputs
  const [modalDraftDay, setModalDraftDay] = useState(0)
  const [modalDraftChannel, setModalDraftChannel] = useState('YouTube')
  const [modalDraftStrategy, setModalDraftStrategy] = useState('LAUNCH')
  const [modalDraftTitle, setModalDraftTitle] = useState('')
  const [modalDraftCaption, setModalDraftCaption] = useState('')

  // 7-Day Campaign Post Dataset
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem(`forge_campaign_posts_${handleClean}`)
      if (saved) return JSON.parse(saved)
    } catch {}

    return [
      {
        id: 'post-1',
        dayIndex: 0,
        dayName: 'Mon',
        dateLabel: '10/26',
        fullDateStr: 'Oct 26, 2026',
        channel: 'YouTube',
        format: 'VIDEO',
        strategy: 'LAUNCH',
        title: `How ${productName} Can Transform Your Sunday Service`,
        caption: `Sunday mornings shouldn't come with panic over missing audio stems or incorrect chords.\n\nToday, we're officially unveiling the brand-new ${productName} Session Engine. See how our members prepare a full 5-song set in under 20 minutes.\n\nLink in description to start your 7-day free trial.\n\n#ChurchTech #WorshipLeader #MusicDirector`,
        status: 'Draft',
        time: '9:00 AM'
      },
      {
        id: 'post-2',
        dayIndex: 1,
        dayName: 'Tue',
        dateLabel: '10/27',
        fullDateStr: 'Oct 27, 2026',
        channel: 'Instagram',
        format: 'REEL',
        strategy: 'BTS',
        title: 'Sneak Peek: Upcoming Exclusive Songs for Members!',
        caption: `Big things are coming.\n\nWe've been working behind the scenes on something we can't wait to share with you. Worship leaders asked, and we delivered the full chord charts + stem downloads.\n\nStay tuned. The countdown has begun.\n\n#newlaunch #staytuned #worshiptips #excited`,
        status: 'Draft',
        time: '11:30 AM'
      },
      {
        id: 'post-3',
        dayIndex: 2,
        dayName: 'Wed',
        dateLabel: '10/28',
        fullDateStr: 'Oct 28, 2026',
        channel: 'YouTube',
        format: 'SHORTS',
        strategy: 'PROOF',
        title: `3 Reasons ${productName} is a Game Changer`,
        caption: `Watch how Pastor Dave cut rehearsal time by 50% using our chord chart transpose feature. Proof that preparation beats talent when stress is on the line.\n\nDrop a comment if your band needs this!\n\n#Shorts #Productivity #ChurchLife`,
        status: 'Draft',
        time: '1:00 PM'
      },
      {
        id: 'post-3b',
        dayIndex: 2,
        dayName: 'Wed',
        dateLabel: '10/28',
        fullDateStr: 'Oct 28, 2026',
        channel: 'Instagram',
        format: 'STORY',
        strategy: 'COMMUNITY',
        title: `Poll: What's Your Favorite Part of ${productName}?`,
        caption: `Quick question for our crew: Chord transpose or multitrack audio isolation? Vote in the sticker below!`,
        status: 'Draft',
        time: '3:00 PM'
      },
      {
        id: 'post-4',
        dayIndex: 3,
        dayName: 'Thu',
        dateLabel: '10/29',
        fullDateStr: 'Oct 29, 2026',
        channel: 'YouTube',
        format: 'COMMUNITY',
        strategy: 'STORY',
        title: `Q&A: How Our Members Use ${productName} Every Week`,
        caption: `Real vulnerability: 3 years ago I was burned out running 3 campuses with handwritten paper sheets. Here's why we built this software.\n\nRead the full founder note in the community tab.`,
        status: 'Draft',
        time: '10:00 AM'
      },
      {
        id: 'post-5',
        dayIndex: 4,
        dayName: 'Fri',
        dateLabel: '10/30',
        fullDateStr: 'Oct 30, 2026',
        channel: 'YouTube',
        format: 'VIDEO',
        strategy: 'CTA',
        title: 'Before and After: Elevate Your Worship Sessions',
        caption: `Doors to our Founding Member tier close this Sunday at midnight! Lock in $29/mo before prices go up.\n\nClick the link in description now.`,
        status: 'Scheduled',
        time: '4:00 PM'
      },
      {
        id: 'post-6',
        dayIndex: 5,
        dayName: 'Sat',
        dateLabel: '10/31',
        fullDateStr: 'Oct 31, 2026',
        channel: 'Instagram',
        format: 'REEL',
        strategy: 'PROOF',
        title: `User Testament: Life Changing Benefits of ${productName}`,
        caption: `"I got my Saturday nights back with my family instead of transposing keys at 11 PM." - Sarah M.\n\nYour time is worth it.`,
        status: 'Draft',
        time: '12:00 PM'
      },
      {
        id: 'post-7',
        dayIndex: 6,
        dayName: 'Sun',
        dateLabel: '11/1',
        fullDateStr: 'Nov 1, 2026',
        channel: 'YouTube',
        format: 'SHORTS',
        strategy: 'VALUE',
        title: `Quick Tips: Making the Most of ${productName}`,
        caption: `Happy Sunday everyone! Here are 3 micro-hacks in our mobile app for quick audio monitoring.\n\nHave an amazing service today!`,
        status: 'Posted',
        time: '8:00 AM'
      }
    ]
  })

  // Persist posts
  useEffect(() => {
    try {
      localStorage.setItem(`forge_campaign_posts_${handleClean}`, JSON.stringify(posts))
    } catch {}
  }, [posts, handleClean])

  // Active Post for Right Inspector Studio
  const [selectedPostId, setSelectedPostId] = useState('post-2')
  const activePost = posts.find(p => p.id === selectedPostId) || posts[0]

  // Suggested hooks state
  const [suggestedHooks, setSuggestedHooks] = useState([
    `Stop spending 3 hours every Saturday fixing chord charts...`,
    `Here is why 1,400 worship leaders joined our VIP beta yesterday...`
  ])

  // Caption input ref for "Edit Script" action
  const captionRef = useRef(null)

  // Metrics
  const totalPostsCount = posts.length
  const readyPostsCount = posts.filter(p => p.status === 'Scheduled' || p.status === 'Posted').length
  const readinessPercent = totalPostsCount > 0 ? Math.round((readyPostsCount / totalPostsCount) * 100) : 0
  const draftPostsCount = posts.filter(p => p.status === 'Draft').length

  const ytCount = posts.filter(p => p.channel === 'YouTube').length
  const igCount = posts.filter(p => p.channel === 'Instagram').length
  const xCount = posts.filter(p => p.channel === 'X').length
  const ttCount = posts.filter(p => p.channel === 'TikTok').length

  // Handlers for Right Inspector Studio
  const updateActivePostTitle = (title) => {
    setPosts(prev => prev.map(p => p.id === activePost.id ? { ...p, title } : p))
  }

  const updateActivePostCaption = (caption) => {
    setPosts(prev => prev.map(p => p.id === activePost.id ? { ...p, caption } : p))
  }

  const handleApproveAndSchedule = (e) => {
    if (!activePost) return
    setPosts(prev => prev.map(p => p.id === activePost.id ? { ...p, status: 'Scheduled' } : p))
    addXP(50, `Scheduled "${activePost.title.slice(0, 24)}..." for ${activePost.fullDateStr}`, e)
  }

  const handleInstantPostLive = (e) => {
    if (!activePost) return
    setPosts(prev => prev.map(p => p.id === activePost.id ? { ...p, status: 'Posted' } : p))
    addXP(100, `Published live to ${activePost.channel}`, e)
  }

  const handleScheduleAllReady = (e) => {
    const drafts = posts.filter(p => p.status === 'Draft')
    if (drafts.length === 0) {
      if (triggerToast) triggerToast('All posts are already scheduled or published!', 'info')
      return
    }
    setPosts(prev => prev.map(p => p.status === 'Draft' ? { ...p, status: 'Scheduled' } : p))
    addXP(drafts.length * 40, `All ${drafts.length} drafts approved and scheduled to pipeline`, e)
  }

  const handleShareDraftPreview = () => {
    if (!activePost) return
    try {
      navigator.clipboard.writeText(activePost.caption)
      if (triggerToast) triggerToast('Draft caption copied to clipboard!', 'success')
    } catch {
      if (triggerToast) triggerToast('Failed to copy to clipboard', 'error')
    }
  }

  const handleVoicePreview = () => {
    if (triggerToast) triggerToast('Voice Synthesizer: Generating fast audio preview hook...', 'info')
  }

  // AI Actions
  const handleTweakWithAi = () => {
    if (!activePost) return
    setIsTweakingAi(true)

    setTimeout(() => {
      setIsTweakingAi(false)
      const elevatedCaption = `Here is the truth about running a high-impact Sunday service:\n\nPreparation beats talent when stress is on the line. We spent 6 months building the ${productName} session toolkit to automate stems and chord transposition in 1 click.\n\nTap the link in bio to claim your 7-day founding pass.\n\n#WorshipLeader #ChurchMusic #FoundingPass #SundayService`
      updateActivePostCaption(elevatedCaption)
      if (triggerToast) triggerToast('Caption refined with AI creative parameters!', 'success')
    }, 850)
  }

  const handleGenerateHookIdeas = () => {
    setIsGeneratingHooks(true)
    setTimeout(() => {
      setIsGeneratingHooks(false)
      setSuggestedHooks([
        `The single biggest mistake church directors make with chord charts...`,
        `How 1 click transposes an entire Sunday 5-song set...`,
        `Inside look: Why our members save 4 hours every rehearsal...`
      ])
      if (triggerToast) triggerToast('Generated fresh viral opening hooks!', 'success')
    }, 600)
  }

  const handleApplyHook = (hook) => {
    updateActivePostTitle(hook)
    if (triggerToast) triggerToast('Hook applied to headline!', 'success')
  }

  // Auto-Fill 7-Day Strategy
  const handleExecuteAiWeekFill = (e) => {
    const generated = [
      {
        id: `gen-${Date.now()}-1`,
        dayIndex: 0,
        dayName: 'Mon',
        dateLabel: '10/26',
        fullDateStr: 'Oct 26, 2026',
        channel: 'YouTube',
        format: 'VIDEO',
        strategy: 'LAUNCH',
        title: `Official Launch: How ${aiProductName} Transforms Your Workflow`,
        caption: `Stop spending your weekends fixing chord charts. Today, ${aiProductName} officially opens for early members.\n\n${aiProductUsp}\n\nStart your 7-day trial now.\n\n#Launch #Creator #SundayService`,
        status: 'Draft',
        time: '9:00 AM'
      },
      {
        id: `gen-${Date.now()}-2`,
        dayIndex: 1,
        dayName: 'Tue',
        dateLabel: '10/27',
        fullDateStr: 'Oct 27, 2026',
        channel: 'Instagram',
        format: 'REEL',
        strategy: 'BTS',
        title: `Behind The Scenes: Crafting ${aiProductName}`,
        caption: `Unfiltered moment: We built this tool because 3 years ago I was burned out transposing charts by hand at 11 PM.\n\nCheck out the member space today!\n\n#BTS #Founders #Productivity`,
        status: 'Draft',
        time: '11:30 AM'
      },
      {
        id: `gen-${Date.now()}-3`,
        dayIndex: 2,
        dayName: 'Wed',
        dateLabel: '10/28',
        fullDateStr: 'Oct 28, 2026',
        channel: 'YouTube',
        format: 'SHORTS',
        strategy: 'PROOF',
        title: `3 Reasons Directors Are Switching to ${aiProductName}`,
        caption: `Watch how our members cut set preparation time by 50% in the first week.\n\nFull case breakdown in link in bio!\n\n#Proof #Shorts #CaseStudy`,
        status: 'Draft',
        time: '1:00 PM'
      },
      {
        id: `gen-${Date.now()}-4`,
        dayIndex: 3,
        dayName: 'Thu',
        dateLabel: '10/29',
        fullDateStr: 'Oct 29, 2026',
        channel: 'TikTok',
        format: 'VIDEO',
        strategy: 'VALUE',
        title: `The 5-Minute Sunday Planning Framework`,
        caption: `Here is the exact step-by-step framework our community uses every Thursday.\n\nSave this video for your next rehearsal!\n\n#Tutorial #LifeHack #MusicTips`,
        status: 'Draft',
        time: '2:30 PM'
      },
      {
        id: `gen-${Date.now()}-5`,
        dayIndex: 4,
        dayName: 'Fri',
        dateLabel: '10/30',
        fullDateStr: 'Oct 30, 2026',
        channel: 'YouTube',
        format: 'VIDEO',
        strategy: 'CTA',
        title: `Founding Member Pass: Pricing Ends This Weekend`,
        caption: `Lock in founding tier pricing before standard rates apply on Monday.\n\n${aiProductUsp}\n\nJoin through the official link in bio.\n\n#Discount #VIPAccess #Limited`,
        status: 'Draft',
        time: '4:00 PM'
      },
      {
        id: `gen-${Date.now()}-6`,
        dayIndex: 5,
        dayName: 'Sat',
        dateLabel: '10/31',
        fullDateStr: 'Oct 31, 2026',
        channel: 'Instagram',
        format: 'REEL',
        strategy: 'COMMUNITY',
        title: `Live Community Voice: Member Spotlight`,
        caption: `Shoutout to our incredible community members leading services across 14 countries this weekend.\n\nWhat song are you playing tomorrow? Drop it in comments!\n\n#Community #WorshipCommunity`,
        status: 'Draft',
        time: '12:00 PM'
      },
      {
        id: `gen-${Date.now()}-7`,
        dayIndex: 6,
        dayName: 'Sun',
        dateLabel: '11/1',
        fullDateStr: 'Nov 1, 2026',
        channel: 'YouTube',
        format: 'SHORTS',
        strategy: 'STORY',
        title: `Sunday Wrap-Up: Sunday Service Walkthrough`,
        caption: `Happy Sunday! Here is a micro-breakdown of how seamless today's set ran with instant stem playback.\n\nHave a blessed week ahead!\n\n#SundayService #Gospel #Worship`,
        status: 'Draft',
        time: '8:00 AM'
      }
    ]

    setPosts(generated)
    setSelectedPostId(generated[0].id)
    setAiModalOpen(false)
    addXP(150, `Generated 7-day campaign strategy for "${aiProductName}"`, e)
  }

  // Save New Custom Draft
  const handleSaveNewDraft = (e) => {
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const newPost = {
      id: `post-${Date.now()}`,
      dayIndex: modalDraftDay,
      dayName: dayNames[modalDraftDay],
      dateLabel: `10/${26 + modalDraftDay}`,
      fullDateStr: `Oct ${26 + modalDraftDay}, 2026`,
      channel: modalDraftChannel,
      format: modalDraftChannel === 'YouTube' ? 'SHORTS' : 'POST',
      strategy: modalDraftStrategy,
      title: modalDraftTitle.trim() || `New ${productName} Campaign Video`,
      caption: modalDraftCaption.trim() || `Exciting new drop coming for our subscribers! Link in bio.`,
      status: 'Draft',
      time: '2:00 PM'
    }

    setPosts(prev => [...prev, newPost])
    setSelectedPostId(newPost.id)
    setNewDraftModalOpen(false)
    setModalDraftTitle('')
    setModalDraftCaption('')
    addXP(40, `Added new quest to ${newPost.dayName}`, e)
  }

  // Days list for 7-day sprint
  const sprintDays = [
    { name: 'Mon', date: '10/26', dayIdx: 0 },
    { name: 'Tue', date: '10/27', dayIdx: 1 },
    { name: 'Wed', date: '10/28', dayIdx: 2 },
    { name: 'Thu', date: '10/29', dayIdx: 3 },
    { name: 'Fri', date: '10/30', dayIdx: 4 },
    { name: 'Sat', date: '10/31', dayIdx: 5 },
    { name: 'Sun', date: '11/1', dayIdx: 6 }
  ]

  // Channel Icon helper
  const renderChannelIcon = (channel) => {
    if (channel === 'YouTube') return <Youtube className="w-4 h-4 text-red-500 shrink-0" />
    if (channel === 'Instagram') return <Instagram className="w-4 h-4 text-pink-500 shrink-0" />
    if (channel === 'TikTok') return <Video className="w-4 h-4 text-slate-300 shrink-0" />
    if (channel === 'X') return <Twitter className="w-4 h-4 text-sky-400 shrink-0" />
    return <Send className="w-4 h-4 text-slate-400 shrink-0" />
  }

  return (
    <div className="h-full flex flex-col bg-[#090d16] text-slate-200 overflow-hidden select-none">
      
      {/* ── TOP HEADER (Flat Dark Elevation, Border 0) ── */}
      <header className="h-16 bg-[#0c0f17] px-4 sm:px-6 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {/* Date & Week Title */}
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
              Oct 26 – Nov 1, 2026
            </h2>
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#161b2b] text-slate-300">
              Week 44
            </span>
          </div>

          {/* Week Shift Controls */}
          <div className="flex items-center bg-[#111522] p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setWeekOffset(w => w - 1)
                if (triggerToast) triggerToast('Navigating to previous week', 'info')
              }}
              className="p-1.5 hover:bg-[#161b2b] rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => {
                setWeekOffset(0)
                if (triggerToast) triggerToast('Reset to active sprint week', 'info')
              }}
              className="px-2.5 py-1 text-xs font-semibold hover:bg-[#161b2b] rounded-lg text-slate-300 transition cursor-pointer"
            >
              Current
            </button>
            <button
              type="button"
              onClick={() => {
                setWeekOffset(w => w + 1)
                if (triggerToast) triggerToast('Navigating to next week', 'info')
              }}
              className="p-1.5 hover:bg-[#161b2b] rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              title="Next Week"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Strategy Mode Badge */}
          <div className="hidden lg:flex items-center gap-1.5 bg-rose-500/10 text-rose-400 px-3 py-1 rounded-xl text-xs font-semibold">
            <Target size={13} className="text-rose-400" />
            <span>Mode: Launch Conversion &amp; Urgency</span>
          </div>
        </div>

        {/* Quick Action Buttons (Zero Borders) */}
        <div className="flex items-center gap-2">
          {/* AI Auto-Fill Week */}
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition cursor-pointer"
            title="Auto-fill week with AI"
          >
            <Sparkles size={13} className="text-rose-400" />
            <span className="hidden sm:inline">Auto-fill Week with AI</span>
          </button>

          {/* New Draft Button (Brand Red with Pure White Text) */}
          <button
            type="button"
            onClick={() => {
              setModalDraftDay(activePost ? activePost.dayIndex : 0)
              setNewDraftModalOpen(true)
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white rounded-xl transition shadow-sm cursor-pointer hover:opacity-95"
            style={{ background: brandRed, color: '#ffffff' }}
          >
            <Plus size={14} className="text-white" />
            <span>New Quest Draft</span>
          </button>

          {/* Schedule All Ready */}
          <button
            type="button"
            onClick={handleScheduleAllReady}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 rounded-xl transition cursor-pointer"
          >
            <CheckCircle2 size={13} />
            <span>Schedule All Ready</span>
          </button>
        </div>
      </header>

      {/* ── METRICS & STRATEGY STRIP (Flat Dark Elevation, Border 0) ── */}
      <section className="bg-[#0c0f17] px-4 sm:px-6 py-3 flex-shrink-0 mt-0.5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-center">
          
          {/* Metric 1: Gamified Level & XP */}
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#111522]">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <Trophy size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs font-extrabold text-white">
                <span className="text-amber-400">Level {currentLevel} Creator</span>
                <span className="text-[10px] font-mono text-slate-400">{xp} / {targetXp} XP</span>
              </div>
              <div className="w-full bg-[#161b2b] h-1.5 rounded-full overflow-hidden mt-1.5">
                <div className="bg-amber-400 h-full rounded-full transition-all duration-500" style={{ width: `${xpPercent}%` }} />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <Flame size={11} className="text-rose-400" />
                  <span>Streak: <b className="text-white">{streak} Days</b></span>
                </span>
                <span className="text-rose-400 font-bold">1 post to Lvl {currentLevel + 1}</span>
              </div>
            </div>
          </div>

          {/* Metric 2: Readiness / Pipeline */}
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#111522]">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Gauge size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs font-extrabold text-white">
                <span>{readyPostsCount} of {totalPostsCount} Ready</span>
                <span className="text-[11px] text-emerald-400">{readinessPercent}%</span>
              </div>
              <div className="w-full bg-[#161b2b] h-1.5 rounded-full overflow-hidden mt-1.5">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${readinessPercent}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {draftPostsCount} pending in draft quest queue
              </p>
            </div>
          </div>

          {/* Metric 3: Channel Breakdown */}
          <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#111522]">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
              <Share2 size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-red-500/15 text-red-400">YT {ytCount}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-pink-500/15 text-pink-400">IG {igCount}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-sky-500/15 text-sky-400">X {xCount}</span>
                {ttCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-500/15 text-slate-300">TT {ttCount}</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Omnichannel distribution active</p>
            </div>
          </div>

          {/* Metric 4: Campaign Product & Formula */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-[#111522]">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
              <Zap size={16} />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider truncate">
                Target: {productName}
              </span>
              <span className="text-xs font-bold text-white truncate block">
                Launch + Proof + Value
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ── SPLIT MAIN WORKSPACE ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT WORKSPACE: Sprint Grid or Month Grid */}
        <section className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-5 custom-scrollbar">
          
          {/* Filter Chips & View Mode Switcher */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2.5">
            {/* Platform Filter Chips (Flat Dark Pills, Border 0) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setPlatformFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  platformFilter === 'all'
                    ? 'text-white shadow-sm'
                    : 'bg-[#111522] text-slate-300 hover:bg-[#161b2b] hover:text-white'
                }`}
                style={platformFilter === 'all' ? { background: brandRed, color: '#ffffff' } : {}}
              >
                All Channels
              </button>
              <button
                type="button"
                onClick={() => setPlatformFilter('YouTube')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  platformFilter === 'YouTube'
                    ? 'text-white shadow-sm'
                    : 'bg-[#111522] text-slate-300 hover:bg-[#161b2b] hover:text-white'
                }`}
                style={platformFilter === 'YouTube' ? { background: brandRed, color: '#ffffff' } : {}}
              >
                <Youtube size={13} className="text-red-500" />
                <span>YouTube</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatformFilter('Instagram')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  platformFilter === 'Instagram'
                    ? 'text-white shadow-sm'
                    : 'bg-[#111522] text-slate-300 hover:bg-[#161b2b] hover:text-white'
                }`}
                style={platformFilter === 'Instagram' ? { background: brandRed, color: '#ffffff' } : {}}
              >
                <Instagram size={13} className="text-pink-500" />
                <span>Instagram</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatformFilter('TikTok')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  platformFilter === 'TikTok'
                    ? 'text-white shadow-sm'
                    : 'bg-[#111522] text-slate-300 hover:bg-[#161b2b] hover:text-white'
                }`}
                style={platformFilter === 'TikTok' ? { background: brandRed, color: '#ffffff' } : {}}
              >
                <Video size={13} className="text-slate-300" />
                <span>TikTok</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatformFilter('X')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  platformFilter === 'X'
                    ? 'text-white shadow-sm'
                    : 'bg-[#111522] text-slate-300 hover:bg-[#161b2b] hover:text-white'
                }`}
                style={platformFilter === 'X' ? { background: brandRed, color: '#ffffff' } : {}}
              >
                <Twitter size={13} className="text-sky-400" />
                <span>X</span>
              </button>
            </div>

            {/* View Mode Toggle: 7-Day Sprint vs Month Grid */}
            <div className="flex items-center bg-[#111522] p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setViewMode('sprint')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'sprint'
                    ? 'bg-[#1c2236] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns size={13} />
                <span>7-Day Sprint</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-[#1c2236] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar size={13} />
                <span>Month Grid</span>
              </button>
            </div>
          </div>

          {/* VIEW A: 7-DAY SPRINT BOARD (GAMIFIED DAY CARDS) */}
          {viewMode === 'sprint' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {sprintDays.map(day => {
                const dayPosts = posts.filter(p => {
                  const matchDay = p.dayIndex === day.dayIdx
                  if (!matchDay) return false
                  if (platformFilter === 'all') return true
                  return p.channel.toLowerCase() === platformFilter.toLowerCase()
                })

                const hasSelected = dayPosts.some(p => p.id === activePost?.id)

                return (
                  <div
                    key={day.dayIdx}
                    className={`flex flex-col bg-[#0c0f17] rounded-2xl p-3.5 transition-all duration-150 ${
                      hasSelected ? 'ring-2 ring-rose-500/70 bg-[#111522]' : 'hover:bg-[#111522]/80'
                    }`}
                  >
                    {/* Day Column Header */}
                    <div className="flex items-center justify-between pb-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-extrabold text-xs ${hasSelected ? 'text-rose-400' : 'text-slate-200'}`}>
                          {day.name}
                        </span>
                        {day.dayIdx === 6 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-400 font-semibold text-[11px]">{day.date}</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-[#161b2b] text-slate-300 font-bold text-[10px]">
                          {dayPosts.length}
                        </span>
                      </div>
                    </div>

                    {/* Posts Cards list */}
                    <div className="space-y-2 flex-1">
                      {dayPosts.length === 0 ? (
                        <div className="h-28 flex flex-col items-center justify-center text-center p-3 rounded-xl bg-[#090d16] text-slate-500">
                          <MessageSquare size={18} className="mb-1 text-slate-600" />
                          <span className="text-[11px] font-semibold">No quest slotted</span>
                        </div>
                      ) : (
                        dayPosts.map(post => {
                          const stratCfg = STRATEGY_CONFIG[post.strategy] || STRATEGY_CONFIG.LAUNCH
                          const isSelected = post.id === activePost?.id

                          return (
                            <div
                              key={post.id}
                              onClick={() => setSelectedPostId(post.id)}
                              className={`cursor-pointer p-3 rounded-xl transition-all duration-150 relative ${
                                isSelected ? 'bg-[#1c2236] text-white shadow-md' : 'bg-[#111522] text-slate-200 hover:bg-[#161b2b]'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                  {renderChannelIcon(post.channel)}
                                  <span className="uppercase tracking-wider text-slate-300 font-mono">
                                    {post.channel.slice(0, 2)} {post.format}
                                  </span>
                                </div>
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${stratCfg.bg} ${stratCfg.text}`}>
                                  {post.strategy}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug mb-2">
                                {post.title}
                              </h4>

                              <div className="flex items-center justify-between pt-1">
                                {post.status === 'Posted' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 size={11} /> Posted
                                  </span>
                                ) : post.status === 'Scheduled' ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 flex items-center gap-1">
                                    <Clock size={11} /> {post.time}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#161b2b] text-slate-400">
                                    Draft
                                  </span>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedPostId(post.id)
                                    handleTweakWithAi()
                                  }}
                                  title="Polish with AI"
                                  className="text-slate-400 hover:text-rose-400 p-1 rounded-md transition cursor-pointer"
                                >
                                  <Sparkles size={12} />
                                </button>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {/* Quick Add Post on this day */}
                    <button
                      type="button"
                      onClick={() => {
                        setModalDraftDay(day.dayIdx)
                        setNewDraftModalOpen(true)
                      }}
                      className="mt-2.5 w-full py-2 rounded-xl text-[11px] font-bold text-slate-400 bg-[#111522] hover:text-white hover:bg-[#161b2b] flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>Add Post</span>
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* VIEW B: MONTHLY CALENDAR VIEW (Direct from reference image) */}
          {viewMode === 'calendar' && (
            <div className="flex-1 bg-[#0c0f17] rounded-2xl p-4 flex flex-col">
              {/* Day Name Headers */}
              <div className="grid grid-cols-7 pb-2 text-center text-xs font-extrabold text-slate-400 uppercase tracking-wider bg-[#111522] py-2 rounded-t-xl">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </div>

              {/* 35 Calendar Cells */}
              <div className="grid grid-cols-7 flex-1 rounded-b-xl overflow-hidden bg-[#090d16] gap-1 p-1">
                {Array.from({ length: 35 }).map((_, i) => {
                  const dayNumber = i < 4 ? 28 + i : i <= 34 ? i - 3 : i - 34
                  const isCurrentMonth = i >= 4 && i <= 34
                  const isToday = i === 20 || i === 5 // e.g. Day 20 or active day highlighted

                  // Match posts to days in month
                  const cellPosts = posts.filter(p => {
                    if (i === 5 && p.dayIndex === 0) return true
                    if (i === 19 && p.dayIndex === 1) return true
                    if (i === 20 && p.dayIndex === 2) return true
                    if (i === 22 && p.dayIndex === 4) return true
                    return false
                  })

                  return (
                    <div
                      key={i}
                      onClick={() => {
                        if (cellPosts.length > 0) {
                          setSelectedPostId(cellPosts[0].id)
                        } else {
                          if (triggerToast) triggerToast(`Day ${dayNumber} selected. Click "+ New Quest Draft" to schedule.`, 'info')
                        }
                      }}
                      className={`min-h-[85px] p-2 flex flex-col justify-between transition hover:bg-[#161b2b] cursor-pointer rounded-lg ${
                        !isCurrentMonth ? 'bg-[#0c0f17]/40 text-slate-600' : 'bg-[#0c0f17] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${
                          isToday
                            ? 'w-5 h-5 rounded-full text-white flex items-center justify-center font-black shadow-sm'
                            : ''
                        }`}
                        style={isToday ? { background: brandRed, color: '#ffffff' } : {}}
                        >
                          {dayNumber}
                        </span>
                        {cellPosts.length > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        )}
                      </div>

                      <div className="space-y-1 mt-1">
                        {cellPosts.map(p => (
                          <div
                            key={p.id}
                            className="p-1 rounded text-white text-[10px] font-bold truncate shadow-xs"
                            style={{ background: brandRed, color: '#ffffff' }}
                            title={`${p.title} (${p.time})`}
                          >
                            <span>{p.title}</span>
                            <span className="block text-[8.5px] opacity-90">{p.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* CAMPAIGN CONVERSION ARCHITECTURE STRATEGY CARDS FOOTER (Border 0, Flat Dark Elevation) */}
          <div className="mt-5 p-4 rounded-2xl bg-[#0c0f17]">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-rose-400" />
                <span>Campaign Conversion Architecture &amp; Strategy Tags</span>
              </h5>
              <span className="text-[10px] text-slate-500 font-medium">Strategic framework for omnichannel conversion</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <div className="p-2.5 rounded-xl bg-sky-500/10">
                <div className="flex items-center justify-between text-xs font-bold text-sky-400">
                  <span>LAUNCH</span>
                  <span className="text-[9px] px-1 bg-sky-500/20 text-sky-300 rounded font-mono">CONV</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">High-urgency direct conversion hooks &amp; checkout waitlist.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                  <span>VALUE</span>
                  <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-300 rounded font-mono">AUTHORITY</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">High-signal educational breakdowns &amp; viral tips.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10">
                <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                  <span>BTS</span>
                  <span className="text-[9px] px-1 bg-amber-500/20 text-amber-300 rounded font-mono">HUMANITY</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">Unfiltered build-in-public raw moments.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-purple-500/10">
                <div className="flex items-center justify-between text-xs font-bold text-purple-400">
                  <span>PROOF</span>
                  <span className="text-[9px] px-1 bg-purple-500/20 text-purple-300 rounded font-mono">CRED</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">Case studies, testimonials, and user receipts.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-rose-500/10">
                <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                  <span>CTA</span>
                  <span className="text-[9px] px-1 bg-rose-500/20 text-rose-300 rounded font-mono">REVENUE</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">Unapologetic call-to-actions targeting warm buyers.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-fuchsia-500/10">
                <div className="flex items-center justify-between text-xs font-bold text-fuchsia-400">
                  <span>COMMUNITY</span>
                  <span className="text-[9px] px-1 bg-fuchsia-500/20 text-fuchsia-300 rounded font-mono">ENGAGE</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">Polls &amp; questions that trigger algorithmic comments.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── RIGHT WORKSPACE: LIVE DRAFT INSPECTOR STUDIO (Border 0, Flat Dark Elevation) ── */}
        <aside className="w-[380px] lg:w-[420px] bg-[#0c0f17] flex flex-col flex-shrink-0 overflow-y-auto z-10 custom-scrollbar">
          
          {/* Header */}
          <div className="p-5 flex items-center justify-between bg-[#111522]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Draft for {activePost?.dayName}day
                </span>
                {activePost?.status === 'Posted' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                    Posted
                  </span>
                ) : activePost?.status === 'Scheduled' ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400">
                    Scheduled
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400">
                    Draft
                  </span>
                )}
              </div>
              <h3 className="text-base font-extrabold text-white mt-0.5">
                {activePost?.fullDateStr} • {activePost?.time}
              </h3>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleShareDraftPreview}
                title="Copy Caption Link"
                className="p-2 rounded-lg bg-[#161b2b] hover:bg-[#1c2236] text-slate-300 transition cursor-pointer"
              >
                <Share2 size={14} />
              </button>
              <button
                type="button"
                onClick={handleVoicePreview}
                title="Voice Preview Hook"
                className="p-2 rounded-lg bg-[#161b2b] hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 transition cursor-pointer"
              >
                <Volume2 size={14} />
              </button>
            </div>
          </div>

          {/* Post Configuration Body */}
          <div className="p-5 flex-1 space-y-4">
            
            {/* Channel & Strategy Badges */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {renderChannelIcon(activePost?.channel)}
                <span className="text-xs font-extrabold text-white">
                  {activePost?.channel} {activePost?.format}
                </span>
              </div>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                STRATEGY_CONFIG[activePost?.strategy]?.bg || 'bg-sky-500/15'
              } ${
                STRATEGY_CONFIG[activePost?.strategy]?.text || 'text-sky-300'
              }`}>
                {activePost?.strategy} STRATEGY
              </span>
            </div>

            {/* Campaign Product Focus */}
            <div className="bg-[#111522] rounded-xl p-3">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Campaign Product Focus
              </div>
              <div className="text-xs font-extrabold text-white mt-0.5">
                {productName}
              </div>
            </div>

            {/* Catchy Video Hook / Headline */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Catchy Video Hook / Headline
              </label>
              <input
                type="text"
                value={activePost?.title || ''}
                onChange={(e) => updateActivePostTitle(e.target.value)}
                className="w-full text-sm font-semibold text-white bg-[#111522] rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none transition border-0"
                placeholder="e.g. Sneak Peek: Upcoming Exclusive Songs for Members!"
              />
            </div>

            {/* Social Caption & Script */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Social Caption &amp; Script
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {activePost?.caption?.length || 0} / 2,200
                </span>
              </div>
              <textarea
                ref={captionRef}
                rows={6}
                value={activePost?.caption || ''}
                onChange={(e) => updateActivePostCaption(e.target.value)}
                className="w-full text-sm text-slate-200 bg-[#111522] rounded-xl p-3 focus:ring-2 focus:ring-rose-500 focus:outline-none leading-relaxed transition font-normal resize-none border-0"
              />
            </div>

            {/* AI Creative Booster / Tweak Tools */}
            <div className="rounded-xl p-3 bg-[#111522]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>AI Creative Booster</span>
                </span>
                <button
                  type="button"
                  onClick={handleGenerateHookIdeas}
                  disabled={isGeneratingHooks}
                  className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={11} className={isGeneratingHooks ? 'animate-spin' : ''} />
                  <span>New Hooks</span>
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                {suggestedHooks.map((hook, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyHook(hook)}
                    className="w-full text-left p-2.5 rounded-lg bg-[#161b2b] hover:bg-[#1c2236] transition cursor-pointer text-xs font-medium text-slate-200 flex items-start gap-1.5"
                  >
                    <Lightbulb size={12} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>"{hook}"</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons Group (Border 0, Guaranteed White Text on Red) */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    captionRef.current?.focus()
                    if (triggerToast) triggerToast('Script editor focused. Write freely!', 'info')
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#111522] hover:bg-[#161b2b] text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Pencil size={13} className="text-slate-400" />
                  <span>Edit Script</span>
                </button>

                <button
                  type="button"
                  onClick={handleTweakWithAi}
                  disabled={isTweakingAi}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#111522] hover:bg-[#161b2b] text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={13} className={`text-rose-400 ${isTweakingAi ? 'animate-spin' : ''}`} />
                  <span>{isTweakingAi ? 'Polishing...' : 'Tweak with AI'}</span>
                </button>
              </div>

              {/* Approve and Schedule (Solid Brand Red, White Text, +50 XP) */}
              <button
                type="button"
                onClick={handleApproveAndSchedule}
                className="w-full py-3 px-4 rounded-xl font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-md hover:opacity-95"
                style={{ background: brandRed, color: '#ffffff' }}
              >
                <CheckCircle2 size={15} className="text-white" />
                <span className="text-white font-bold">Approve and Schedule (+50 XP)</span>
              </button>

              {/* Instant Post to Live Channel (Solid Emerald, White Text, +100 XP) */}
              <button
                type="button"
                onClick={handleInstantPostLive}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-md"
                style={{ color: '#ffffff' }}
              >
                <Send size={14} className="text-white" />
                <span className="text-white font-bold">Post to Live Channel Now (+100 XP)</span>
              </button>
            </div>

          </div>
        </aside>

      </div>

      {/* ── MODAL: AI AUTO-FILL WEEK ── */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0f17] rounded-2xl max-w-lg w-full p-6 text-slate-200 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    Generate 7-Day Campaign Cadence
                  </h3>
                  <p className="text-xs text-slate-400">
                    Let AI craft strategic hooks for your product launch
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#161b2b] text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Product or Offer Name
                </label>
                <input
                  type="text"
                  value={aiProductName}
                  onChange={(e) => setAiProductName(e.target.value)}
                  className="w-full text-xs font-medium bg-[#111522] text-white rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 outline-none border-0"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Key Value Proposition / Price
                </label>
                <input
                  type="text"
                  value={aiProductUsp}
                  onChange={(e) => setAiProductUsp(e.target.value)}
                  className="w-full text-xs font-medium bg-[#111522] text-white rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 outline-none border-0"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Target Primary Goal
                </label>
                <select
                  value={aiCampaignGoal}
                  onChange={(e) => setAiCampaignGoal(e.target.value)}
                  className="w-full text-xs font-semibold bg-[#111522] text-white rounded-xl p-2.5 focus:ring-2 focus:ring-rose-500 outline-none border-0"
                >
                  <option value="LaunchUrgency">Conversion &amp; Urgency (Cart closes Sunday)</option>
                  <option value="AudienceGrowth">Rapid Follower Growth &amp; Viral Reach</option>
                  <option value="HighTicketCall">High-Ticket / Waitlist Warmup</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAiWeekFill}
                className="px-5 py-2.5 text-xs font-extrabold text-white rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm hover:opacity-95"
                style={{ background: brandRed, color: '#ffffff' }}
              >
                <Wand2 size={13} className="text-white" />
                <span className="text-white">Forge 7-Day Strategy (+150 XP)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: STAGE NEW CONTENT QUEST ── */}
      {newDraftModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0f17] rounded-2xl max-w-lg w-full p-6 text-slate-200 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">
                    Stage New Content Quest
                  </h3>
                  <p className="text-xs text-slate-400">
                    Pick day, strategy pillar, and destination channel
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNewDraftModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#161b2b] text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Target Day</label>
                  <select
                    value={modalDraftDay}
                    onChange={(e) => setModalDraftDay(parseInt(e.target.value, 10))}
                    className="w-full text-xs font-semibold bg-[#111522] text-white rounded-xl p-2.5 border-0 focus:ring-2 focus:ring-rose-500 outline-none"
                  >
                    <option value={0}>Monday (Oct 26)</option>
                    <option value={1}>Tuesday (Oct 27)</option>
                    <option value={2}>Wednesday (Oct 28)</option>
                    <option value={3}>Thursday (Oct 29)</option>
                    <option value={4}>Friday (Oct 30)</option>
                    <option value={5}>Saturday (Oct 31)</option>
                    <option value={6}>Sunday (Nov 1)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Social Channel</label>
                  <select
                    value={modalDraftChannel}
                    onChange={(e) => setModalDraftChannel(e.target.value)}
                    className="w-full text-xs font-semibold bg-[#111522] text-white rounded-xl p-2.5 border-0 focus:ring-2 focus:ring-rose-500 outline-none"
                  >
                    <option value="YouTube">YouTube Shorts</option>
                    <option value="Instagram">Instagram Reel</option>
                    <option value="TikTok">TikTok Video</option>
                    <option value="X">X (Twitter) Thread</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Strategy Tag</label>
                <div className="grid grid-cols-3 gap-2">
                  {['LAUNCH', 'VALUE', 'BTS', 'PROOF', 'CTA', 'COMMUNITY'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setModalDraftStrategy(tag)}
                      className={`p-2 rounded-xl text-xs font-bold text-center transition cursor-pointer ${
                        modalDraftStrategy === tag
                          ? 'bg-sky-500/25 text-sky-300 ring-1 ring-sky-400/30'
                          : 'bg-[#111522] text-slate-400 hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Hook / Headline</label>
                <input
                  type="text"
                  value={modalDraftTitle}
                  onChange={(e) => setModalDraftTitle(e.target.value)}
                  className="w-full text-xs font-medium bg-[#111522] text-white rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-rose-500 border-0"
                  placeholder={`e.g. 3 Reasons ${productName} is a Game Changer`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Caption / Talking Points</label>
                <textarea
                  rows={3}
                  value={modalDraftCaption}
                  onChange={(e) => setModalDraftCaption(e.target.value)}
                  className="w-full text-xs font-medium bg-[#111522] text-white rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-rose-500 border-0 resize-none"
                  placeholder="Write draft caption or paste talking points..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setNewDraftModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNewDraft}
                className="px-5 py-2.5 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition cursor-pointer"
              >
                Add to Campaign (+40 XP)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
