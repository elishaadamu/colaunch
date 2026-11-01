import { useState, useEffect, useMemo, useRef } from 'react'
import { useForge } from '../../App'
import { loadAiKeys } from '../../services/ai'
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
  Gauge,
  Youtube,
  Instagram,
  Twitter,
  Eye,
  MessageSquare,
  Video,
  Image as ImageIcon,
  Award,
  Gamepad2,
  Layers,
  Sparkle,
  Trash2
} from 'lucide-react'

// Lightweight particle burst celebration for gamified publishing
function triggerConfettiBurst(originX, originY) {
  if (typeof window === 'undefined') return
  const count = 35
  const colors = ['#c81e3c', '#38bdf8', '#34d399', '#fbbf24', '#a855f7', '#ffffff']
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
    el.style.borderRadius = '0px'
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

// Strategy color tokens tailored for flat dark canvas with zero borders and zero border radius
const STRATEGY_CONFIG = {
  LAUNCH: { bg: 'bg-sky-500/15', text: 'text-sky-300', tag: 'CONVERSION', desc: 'High-urgency direct conversion hooks & checkout waitlist.' },
  VALUE: { bg: 'bg-emerald-500/15', text: 'text-emerald-300', tag: 'AUTHORITY', desc: 'High-signal educational breakdowns & viral tips.' },
  BTS: { bg: 'bg-amber-500/15', text: 'text-amber-300', tag: 'HUMANITY', desc: 'Unfiltered build-in-public raw moments.' },
  PROOF: { bg: 'bg-purple-500/15', text: 'text-purple-300', tag: 'CREDIBILITY', desc: 'Case studies, testimonials, and user receipts.' },
  CTA: { bg: 'bg-rose-500/15', text: 'text-rose-300', tag: 'REVENUE', desc: 'Unapologetic call-to-actions targeting warm buyers.' },
  COMMUNITY: { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-300', tag: 'ENGAGEMENT', desc: 'Polls & questions that trigger algorithmic comments.' },
  STORY: { bg: 'bg-orange-500/15', text: 'text-orange-300', tag: 'RELATABILITY', desc: 'Personal storytelling connecting audience pain to solution.' }
}

// Dynamic week date computation helper
function calculateWeekData(offset = 0) {
  const now = new Date()
  const day = now.getDay() // 0 = Sun, 1 = Mon ...
  const distanceToMon = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + distanceToMon + (offset * 7))
  
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const startMonth = monthNames[monday.getMonth()]
  const endMonth = monthNames[sunday.getMonth()]
  const startDay = monday.getDate()
  const endDay = sunday.getDate()
  const year = sunday.getFullYear()

  const headerTitle = startMonth === endMonth
    ? `${startMonth} ${startDay} – ${endDay}, ${year}`
    : `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`

  // ISO Week Number
  const firstJan = new Date(monday.getFullYear(), 0, 1)
  const numberOfDays = Math.floor((monday - firstJan) / (24 * 60 * 60 * 1000))
  const weekNum = Math.ceil((monday.getDay() + 1 + numberOfDays) / 7)

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const days = dayNames.map((name, idx) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + idx)
    return {
      dayIdx: idx,
      name,
      dateLabel: `${d.getMonth() + 1}/${d.getDate()}`,
      fullDateStr: `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
      isToday: d.toDateString() === now.toDateString()
    }
  })

  return { headerTitle, weekNum, days, monday, sunday }
}

// Pre-seeded campaign dataset across past week (-1), current launch sprint (0), and next retention week (+1)
function getDefaultCampaignPosts(productName) {
  return [
    // ── PREVIOUS WEEK (weekOffset: -1) ──
    {
      id: 'post-prev-1',
      weekOffset: -1,
      dayIndex: 0,
      dayName: 'Mon',
      channel: 'YouTube',
      format: 'VIDEO',
      strategy: 'LAUNCH',
      title: `The Story Behind ${productName}: Why We Built It`,
      caption: `For years, worship leaders have lost hours wrestling with misplaced keys and inconsistent rehearsals.\n\nHere is our journey building ${productName} from scratch for modern church teams.\n\nFull story on our channel.\n\n#WorshipLeader #ChurchMusic #BehindTheScenes`,
      status: 'Posted',
      time: '9:00 AM',
      imageUrl: null
    },
    {
      id: 'post-prev-2',
      weekOffset: -1,
      dayIndex: 2,
      dayName: 'Wed',
      channel: 'Instagram',
      format: 'REEL',
      strategy: 'BTS',
      title: 'Studio Rehearsal Run-Through',
      caption: `Testing our audio multitrack player with the Sunday band. Seamless tempo transitions make all the difference.\n\nDrop a comment if your church needs this!\n\n#worshiptips #christianmusic #rehearsal`,
      status: 'Posted',
      time: '12:00 PM',
      imageUrl: null
    },
    {
      id: 'post-prev-3',
      weekOffset: -1,
      dayIndex: 4,
      dayName: 'Fri',
      channel: 'YouTube',
      format: 'SHORTS',
      strategy: 'PROOF',
      title: 'How 1 Chord Chart Transpose Saves 30 Minutes',
      caption: `Watch how quickly you can transpose a 5-song set into any key with zero pencil scribbles.\n\n#Shorts #WorshipLeader #ChurchTech`,
      status: 'Posted',
      time: '4:00 PM',
      imageUrl: null
    },

    // ── CURRENT SPRINT WEEK (weekOffset: 0) ──
    {
      id: 'post-1',
      weekOffset: 0,
      dayIndex: 0,
      dayName: 'Mon',
      channel: 'YouTube',
      format: 'VIDEO',
      strategy: 'LAUNCH',
      title: `How ${productName} Can Transform Your Sunday Service`,
      caption: `Sunday mornings shouldn't come with panic over missing audio stems or incorrect chords.\n\nToday, we're officially unveiling the brand-new ${productName} Session Engine. See how our members prepare a full 5-song set in under 20 minutes.\n\nLink in description to start your 7-day free trial.\n\n#ChurchTech #WorshipLeader #MusicDirector`,
      status: 'Draft',
      time: '9:00 AM',
      imageUrl: null
    },
    {
      id: 'post-2',
      weekOffset: 0,
      dayIndex: 1,
      dayName: 'Tue',
      channel: 'Instagram',
      format: 'REEL',
      strategy: 'BTS',
      title: 'Sneak Peek: Upcoming Exclusive Songs for Members!',
      caption: `Big things are coming.\n\nWe've been working behind the scenes on something we can't wait to share with you. Worship leaders asked, and we delivered the full chord charts + stem downloads.\n\nStay tuned. The countdown has begun.\n\n#newlaunch #staytuned #worshiptips #excited`,
      status: 'Draft',
      time: '11:30 AM',
      imageUrl: null
    },
    {
      id: 'post-3',
      weekOffset: 0,
      dayIndex: 2,
      dayName: 'Wed',
      channel: 'YouTube',
      format: 'SHORTS',
      strategy: 'PROOF',
      title: `3 Reasons ${productName} is a Game Changer`,
      caption: `Watch how Pastor Dave cut rehearsal time by 50% using our chord chart transpose feature. Proof that preparation beats talent when stress is on the line.\n\nDrop a comment if your band needs this!\n\n#Shorts #Productivity #ChurchLife`,
      status: 'Draft',
      time: '1:00 PM',
      imageUrl: null
    },
    {
      id: 'post-3b',
      weekOffset: 0,
      dayIndex: 2,
      dayName: 'Wed',
      channel: 'Instagram',
      format: 'STORY',
      strategy: 'COMMUNITY',
      title: `Poll: What's Your Favorite Part of ${productName}?`,
      caption: `Quick question for our crew: Chord transpose or multitrack audio isolation? Vote in the sticker below!`,
      status: 'Draft',
      time: '3:00 PM',
      imageUrl: null
    },
    {
      id: 'post-4',
      weekOffset: 0,
      dayIndex: 3,
      dayName: 'Thu',
      channel: 'YouTube',
      format: 'COMMUNITY',
      strategy: 'STORY',
      title: `Q&A: How Our Members Use ${productName} Every Week`,
      caption: `Real vulnerability: 3 years ago I was burned out running 3 campuses with handwritten paper sheets. Here's why we built this software.\n\nRead the full founder note in the community tab.`,
      status: 'Draft',
      time: '10:00 AM',
      imageUrl: null
    },
    {
      id: 'post-5',
      weekOffset: 0,
      dayIndex: 4,
      dayName: 'Fri',
      channel: 'YouTube',
      format: 'VIDEO',
      strategy: 'CTA',
      title: 'Before and After: Elevate Your Worship Sessions',
      caption: `Doors to our Founding Member tier close this Sunday at midnight! Lock in $29/mo before prices go up.\n\nClick the link in description now.`,
      status: 'Scheduled',
      time: '4:00 PM',
      imageUrl: null
    },
    {
      id: 'post-6',
      weekOffset: 0,
      dayIndex: 5,
      dayName: 'Sat',
      channel: 'Instagram',
      format: 'REEL',
      strategy: 'PROOF',
      title: `User Testament: Life Changing Benefits of ${productName}`,
      caption: `"I got my Saturday nights back with my family instead of transposing keys at 11 PM." - Sarah M.\n\nYour time is worth it.`,
      status: 'Draft',
      time: '12:00 PM',
      imageUrl: null
    },
    {
      id: 'post-7',
      weekOffset: 0,
      dayIndex: 6,
      dayName: 'Sun',
      channel: 'YouTube',
      format: 'SHORTS',
      strategy: 'VALUE',
      title: `Quick Tips: Making the Most of ${productName}`,
      caption: `Happy Sunday everyone! Here are 3 micro-hacks in our mobile app for quick audio monitoring.\n\nHave an amazing service today!`,
      status: 'Posted',
      time: '8:00 AM',
      imageUrl: null
    },

    // ── NEXT RETENTION & GROWTH WEEK (weekOffset: 1) ──
    {
      id: 'post-next-1',
      weekOffset: 1,
      dayIndex: 0,
      dayName: 'Mon',
      channel: 'YouTube',
      format: 'VIDEO',
      strategy: 'VALUE',
      title: `Mastering Key Modulation with ${productName}`,
      caption: `How to lead clean, smooth key modulations during Sunday worship without losing the vocalists.\n\nInside this week's member breakdown.\n\n#WorshipWorkshop #Chords #ChristianMusicians`,
      status: 'Draft',
      time: '9:00 AM',
      imageUrl: null
    },
    {
      id: 'post-next-2',
      weekOffset: 1,
      dayIndex: 1,
      dayName: 'Tue',
      channel: 'Instagram',
      format: 'REEL',
      strategy: 'COMMUNITY',
      title: 'Community Q&A: Your Stems Questions Answered',
      caption: `Answering the top 5 questions from our new members about multitrack routing.\n\nGot a question? Drop it below for tomorrow's live answering session!`,
      status: 'Draft',
      time: '11:00 AM',
      imageUrl: null
    },
    {
      id: 'post-next-3',
      weekOffset: 1,
      dayIndex: 3,
      dayName: 'Thu',
      channel: 'YouTube',
      format: 'SHORTS',
      strategy: 'PROOF',
      title: 'Member Spotlight: How St. Jude Fellowship Uses Our Stems',
      caption: `See how a 4-piece volunteer worship team sounds like a full studio ensemble with ${productName}.\n\nTry it free for 7 days.`,
      status: 'Draft',
      time: '2:00 PM',
      imageUrl: null
    },
    {
      id: 'post-next-4',
      weekOffset: 1,
      dayIndex: 4,
      dayName: 'Fri',
      channel: 'YouTube',
      format: 'VIDEO',
      strategy: 'CTA',
      title: `Weekly Wrap-Up: Top New Songs Added to ${productName}`,
      caption: `5 new song stems just dropped in the member portal! Log in now to add them to your Sunday setlist.\n\n#NewMusic #SundayPrep #WorshipLeader`,
      status: 'Scheduled',
      time: '4:00 PM',
      imageUrl: null
    },
    {
      id: 'post-next-5',
      weekOffset: 1,
      dayIndex: 6,
      dayName: 'Sun',
      channel: 'Instagram',
      format: 'STORY',
      strategy: 'BTS',
      title: 'Sunday Morning Live Warmup',
      caption: `Early morning soundcheck! Running the new multitrack stems. Have a blessed service everyone!`,
      status: 'Draft',
      time: '7:30 AM',
      imageUrl: null
    }
  ]
}

export default function ContentCalendar() {
  const { creatorData, triggerToast } = useForge()

  const creatorName = creatorData?.name || creatorData?.handle?.replace('@', '') || 'Creator'
  const handleClean = (creatorData?.handle || creatorName || 'creator').replace('@', '').toLowerCase()
  const productName = creatorData?.productName || 'WorshipLeader+ Membership'

  // Brand Red styling with guaranteed white text
  const brandRed = '#c81e3c'

  // Week Shifting State (0 = current week, +1 next week, -1 previous week)
  const [weekOffset, setWeekOffset] = useState(0)
  const weekData = useMemo(() => calculateWeekData(weekOffset), [weekOffset])

  // Active View Mode: 'sprint' (7-day board) vs 'calendar' (monthly grid)
  const [viewMode, setViewMode] = useState('sprint')
  const [platformFilter, setPlatformFilter] = useState('all')

  // Gamification State (XP, Streak, Level, Completed Quests)
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

  const [claimedQuests, setClaimedQuests] = useState(() => {
    try {
      const saved = localStorage.getItem(`forge_calendar_claimed_quests_${handleClean}`)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
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

  // Modals state
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [newDraftModalOpen, setNewDraftModalOpen] = useState(false)
  const [questModalOpen, setQuestModalOpen] = useState(false)
  const [vaultModalOpen, setVaultModalOpen] = useState(false)
  const [isTweakingAi, setIsTweakingAi] = useState(false)
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)

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
    const defaultPosts = getDefaultCampaignPosts(productName)
    try {
      const saved = localStorage.getItem(`forge_campaign_posts_${handleClean}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.some(p => p.weekOffset === 1)) {
          return parsed
        }
        // Merge so weekOffset -1 and 1 are always available
        const merged = [...parsed]
        for (const dp of defaultPosts) {
          if (!merged.some(m => m.id === dp.id)) {
            merged.push(dp)
          }
        }
        return merged
      }
    } catch {}

    return defaultPosts
  })

  // Persist posts
  useEffect(() => {
    try {
      localStorage.setItem(`forge_campaign_posts_${handleClean}`, JSON.stringify(posts))
    } catch {}
  }, [posts, handleClean])

  // Active Post for Right Inspector Studio
  const [selectedPostId, setSelectedPostId] = useState('post-2')
  
  // Filtered dataset based on platform and active week
  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      // Platform filter
      const matchPlatform = platformFilter === 'all' || p.channel.toLowerCase() === platformFilter.toLowerCase()
      // Week filter (posts belonging to the current weekOffset)
      const matchWeek = (p.weekOffset ?? 0) === weekOffset
      return matchPlatform && matchWeek
    })
  }, [posts, platformFilter, weekOffset])

  // Active inspected post
  const activePost = useMemo(() => {
    const found = filteredPosts.find(p => p.id === selectedPostId)
    if (found) return found
    if (filteredPosts.length > 0) return filteredPosts[0]
    return posts.find(p => p.id === selectedPostId) || posts[0]
  }, [filteredPosts, selectedPostId, posts])

  // Auto-sync selectedPostId when switching week or platform filter
  useEffect(() => {
    if (filteredPosts.length > 0 && !filteredPosts.some(p => p.id === selectedPostId)) {
      setSelectedPostId(filteredPosts[0].id)
    }
  }, [filteredPosts, selectedPostId])

  // Populate an empty week with structured sprint strategy
  const handlePopulateEmptyWeek = (offset, e) => {
    const newPosts = [
      {
        id: `post-gen-${offset}-1`,
        weekOffset: offset,
        dayIndex: 0,
        dayName: 'Mon',
        channel: 'YouTube',
        format: 'VIDEO',
        strategy: 'VALUE',
        title: `Deep-Dive: How ${productName} Saves 4 Hours Every Week`,
        caption: `Planning Sunday services shouldn't take over your entire weekend.\n\nInside this walkthrough, we unpack our automated chord transposition and multitrack player.\n\nJoin the founding members now at the link in bio.`,
        status: 'Draft',
        time: '9:00 AM',
        imageUrl: null
      },
      {
        id: `post-gen-${offset}-2`,
        weekOffset: offset,
        dayIndex: 2,
        dayName: 'Wed',
        channel: 'Instagram',
        format: 'REEL',
        strategy: 'BTS',
        title: `Rehearsal Breakdown with ${productName}`,
        caption: `Watch how seamlessly our team flips between keys in real-time.\n\nDrop a comment if your church worship team needs this!`,
        status: 'Draft',
        time: '12:00 PM',
        imageUrl: null
      },
      {
        id: `post-gen-${offset}-3`,
        weekOffset: offset,
        dayIndex: 4,
        dayName: 'Fri',
        channel: 'YouTube',
        format: 'SHORTS',
        strategy: 'PROOF',
        title: `3 Reasons Worship Leaders Are Switching to ${productName}`,
        caption: `1. Zero handwritten chord errors\n2. Instant tempo alignment\n3. 7-day free trial\n\nLink in bio!`,
        status: 'Scheduled',
        time: '3:00 PM',
        imageUrl: null
      },
      {
        id: `post-gen-${offset}-4`,
        weekOffset: offset,
        dayIndex: 6,
        dayName: 'Sun',
        channel: 'Instagram',
        format: 'COMMUNITY',
        strategy: 'COMMUNITY',
        title: `Sunday Morning Service Reflection`,
        caption: `What a powerful morning of worship! Thank you to everyone who shared stems with our community today.`,
        status: 'Draft',
        time: '1:00 PM',
        imageUrl: null
      }
    ]
    setPosts(prev => [...prev, ...newPosts])
    addXP(100, `Generated strategy sprint for Week ${weekData.weekNum}`, e)
  }

  // Image prompt input for active post
  const [imagePrompt, setImagePrompt] = useState('')

  useEffect(() => {
    if (activePost) {
      setImagePrompt(`Editorial commercial visual for "${activePost.title}", professional 4k studio lighting, brand red accents, sleek digital product cover for ${productName}`)
    }
  }, [activePost?.id, activePost?.title, productName])

  // Suggested hooks state
  const [suggestedHooks, setSuggestedHooks] = useState([
    `Stop spending 3 hours every Saturday fixing chord charts...`,
    `Here is why 1,400 worship leaders joined our VIP beta yesterday...`
  ])

  // Caption input ref for "Edit Script" action
  const captionRef = useRef(null)

  // Metrics (computed across the active week)
  const totalPostsCount = filteredPosts.length
  const readyPostsCount = filteredPosts.filter(p => p.status === 'Scheduled' || p.status === 'Posted').length
  const readinessPercent = totalPostsCount > 0 ? Math.round((readyPostsCount / totalPostsCount) * 100) : 0
  const draftPostsCount = filteredPosts.filter(p => p.status === 'Draft').length

  const ytCount = filteredPosts.filter(p => p.channel === 'YouTube').length
  const igCount = filteredPosts.filter(p => p.channel === 'Instagram').length
  const xCount = filteredPosts.filter(p => p.channel === 'X').length
  const ttCount = filteredPosts.filter(p => p.channel === 'TikTok').length

  // Handlers for Right Inspector Studio
  const updateActivePostTitle = (title) => {
    if (!activePost) return
    setPosts(prev => prev.map(p => p.id === activePost.id ? { ...p, title } : p))
  }

  const updateActivePostCaption = (caption) => {
    if (!activePost) return
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
    const drafts = filteredPosts.filter(p => p.status === 'Draft')
    if (drafts.length === 0) {
      if (triggerToast) triggerToast('All posts are already scheduled or published!', 'info')
      return
    }
    setPosts(prev => prev.map(p => {
      if ((p.weekOffset ?? 0) === weekOffset && p.status === 'Draft') {
        return { ...p, status: 'Scheduled' }
      }
      return p
    }))
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
      const elevatedCaption = `Here is the truth about running a high-impact Sunday service:\n\nPreparation beats talent when stress is on the line. We spent 6 months building the ${productName} session toolkit to automate stems and chord transposition in 1 click.\n\nTap the link in description to claim your 7-day founding pass.\n\n#WorshipLeader #ChurchMusic #FoundingPass #SundayService`
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

  // Manual OpenAI Image Generation Handler
  const handleGenerateImage = async (e) => {
    if (!activePost) return
    setIsGeneratingImage(true)
    if (triggerToast) triggerToast('Contacting OpenAI DALL-E image engine...', 'info')

    try {
      const { openaiKey } = loadAiKeys()
      let generatedUrl = null

      if (openaiKey) {
        const res = await fetch('/api/openai/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: imagePrompt || activePost.title,
            n: 1,
            size: '1024x1024',
            quality: 'standard'
          })
        })
        if (res.ok) {
          const data = await res.json()
          generatedUrl = data?.data?.[0]?.url || (data?.data?.[0]?.b64_json ? `data:image/png;base64,${data.data[0].b64_json}` : null)
        }
      }

      // High-quality fallback SVG graphic if direct OpenAI call doesn't return
      if (!generatedUrl) {
        const svgContent = encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
            <rect width="1024" height="1024" fill="#090d16"/>
            <rect x="40" y="40" width="944" height="944" fill="#111522" rx="0"/>
            <circle cx="512" cy="420" r="160" fill="#c81e3c" opacity="0.2"/>
            <circle cx="512" cy="420" r="110" fill="#c81e3c" opacity="0.8"/>
            <path d="M480 360 L580 420 L480 480 Z" fill="#ffffff"/>
            <text x="512" y="660" font-family="sans-serif" font-size="42" font-weight="bold" fill="#ffffff" text-anchor="middle">${activePost.channel} • ${activePost.strategy}</text>
            <text x="512" y="730" font-family="sans-serif" font-size="28" font-weight="600" fill="#94a3b8" text-anchor="middle">${productName}</text>
            <rect x="362" y="780" width="300" height="48" fill="#c81e3c" rx="0"/>
            <text x="512" y="812" font-family="sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">OFFICIAL PROMO RELEASE</text>
          </svg>
        `)
        generatedUrl = `data:image/svg+xml;utf8,${svgContent}`
      }

      setPosts(prev => prev.map(p => p.id === activePost.id ? { ...p, imageUrl: generatedUrl } : p))
      addXP(60, `Visual generated with OpenAI DALL-E`, e)
    } catch (err) {
      if (triggerToast) triggerToast('Failed to generate image with OpenAI. Check API key.', 'error')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleRemoveImage = () => {
    if (!activePost) return
    setPosts(prev => prev.map(p => p.id === activePost.id ? { ...p, imageUrl: null } : p))
    if (triggerToast) triggerToast('Visual removed from draft', 'info')
  }

  // Auto-Fill 7-Day Strategy for Active Week
  const handleExecuteAiWeekFill = (e) => {
    const generated = weekData.days.map((day, idx) => {
      const strategies = ['LAUNCH', 'BTS', 'PROOF', 'VALUE', 'CTA', 'COMMUNITY', 'STORY']
      const channels = ['YouTube', 'Instagram', 'YouTube', 'TikTok', 'YouTube', 'Instagram', 'YouTube']
      const formats = ['VIDEO', 'REEL', 'SHORTS', 'VIDEO', 'VIDEO', 'REEL', 'SHORTS']
      const strat = strategies[idx % strategies.length]
      const chan = channels[idx % channels.length]
      const form = formats[idx % formats.length]

      return {
        id: `gen-w${weekOffset}-${Date.now()}-${idx + 1}`,
        weekOffset: weekOffset,
        dayIndex: day.dayIdx,
        dayName: day.name,
        dateLabel: day.dateLabel,
        fullDateStr: day.fullDateStr,
        channel: chan,
        format: form,
        strategy: strat,
        title: idx === 0 
          ? `Official Launch: How ${aiProductName} Transforms Your Workflow`
          : idx === 1
          ? `Behind The Scenes: Crafting ${aiProductName}`
          : idx === 2
          ? `3 Reasons Directors Are Switching to ${aiProductName}`
          : idx === 3
          ? `The 5-Minute Sunday Planning Framework`
          : idx === 4
          ? `Founding Member Pass: Pricing Ends This Weekend`
          : idx === 5
          ? `Live Community Voice: Member Spotlight`
          : `Sunday Service Walkthrough with ${aiProductName}`,
        caption: `Stop spending your weekends fixing chord charts. Today, ${aiProductName} officially opens for early members.\n\n${aiProductUsp}\n\nStart your 7-day trial now.\n\n#${aiProductName.replace(/\s+/g,'')} #Creator #SundayService`,
        status: 'Draft',
        time: idx % 2 === 0 ? '9:00 AM' : '2:00 PM',
        imageUrl: null
      }
    })

    // Merge or replace posts for this weekOffset
    setPosts(prev => [
      ...prev.filter(p => (p.weekOffset ?? 0) !== weekOffset),
      ...generated
    ])
    setSelectedPostId(generated[0].id)
    setAiModalOpen(false)
    addXP(150, `Generated 7-day campaign strategy for "${aiProductName}"`, e)
  }

  // Save New Custom Draft
  const handleSaveNewDraft = (e) => {
    const targetDayObj = weekData.days[modalDraftDay] || weekData.days[0]
    const newPost = {
      id: `post-${Date.now()}`,
      weekOffset: weekOffset,
      dayIndex: modalDraftDay,
      dayName: targetDayObj.name,
      dateLabel: targetDayObj.dateLabel,
      fullDateStr: targetDayObj.fullDateStr,
      channel: modalDraftChannel,
      format: modalDraftChannel === 'YouTube' ? 'SHORTS' : 'POST',
      strategy: modalDraftStrategy,
      title: modalDraftTitle.trim() || `New ${productName} Campaign Video`,
      caption: modalDraftCaption.trim() || `Exciting new drop coming for our subscribers! Link in bio.`,
      status: 'Draft',
      time: '2:00 PM',
      imageUrl: null
    }

    setPosts(prev => [...prev, newPost])
    setSelectedPostId(newPost.id)
    setNewDraftModalOpen(false)
    setModalDraftTitle('')
    setModalDraftCaption('')
    addXP(40, `Added new quest to ${newPost.dayName}`, e)
  }

  // Slot Evergreen Concept from Buffer Vault
  const handleSlotVaultIdea = (idea, e) => {
    const targetDayObj = weekData.days[0]
    const newPost = {
      id: `vault-${Date.now()}`,
      weekOffset: weekOffset,
      dayIndex: 0,
      dayName: targetDayObj.name,
      dateLabel: targetDayObj.dateLabel,
      fullDateStr: targetDayObj.fullDateStr,
      channel: idea.channel,
      format: idea.format,
      strategy: idea.strategy,
      title: idea.title,
      caption: idea.caption,
      status: 'Draft',
      time: '11:00 AM',
      imageUrl: null
    }

    setPosts(prev => [...prev, newPost])
    setSelectedPostId(newPost.id)
    setVaultModalOpen(false)
    addXP(30, `Slotted "${idea.title.slice(0, 20)}..." from vault`, e)
  }

  // Claim Quest Reward
  const handleClaimQuest = (questId, rewardAmount, e) => {
    setClaimedQuests(prev => {
      const next = { ...prev, [questId]: true }
      try {
        localStorage.setItem(`forge_calendar_claimed_quests_${handleClean}`, JSON.stringify(next))
      } catch {}
      return next
    })
    addXP(rewardAmount, `Claimed quest objective reward`, e)
  }

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
      
      {/* ── TOP HEADER (Flat Dark Elevation, Border 0, Rounded 0) ── */}
      <header className="h-16 bg-[#0c0f17] px-4 sm:px-6 flex items-center justify-between flex-shrink-0 border-0">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {/* Date & Week Title (Functional week shifting display) */}
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
              {weekData.headerTitle}
            </h2>
            <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-[#161b2b] text-slate-300">
              Week {weekData.weekNum}
            </span>
          </div>

          {/* Week Shift Controls (Real Date Navigation) */}
          <div className="flex items-center bg-[#111522] p-0.5 rounded-none border-0">
            <button
              type="button"
              onClick={() => {
                setWeekOffset(w => w - 1)
                if (triggerToast) triggerToast('Navigated to previous week', 'info')
              }}
              className="p-1.5 hover:bg-[#161b2b] rounded-none text-slate-400 hover:text-white transition cursor-pointer border-0"
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
              className={`px-2.5 py-1 text-xs font-semibold rounded-none transition cursor-pointer border-0 ${
                weekOffset === 0 ? 'bg-[#1c2236] text-white font-bold' : 'hover:bg-[#161b2b] text-slate-300'
              }`}
            >
              Current
            </button>
            <button
              type="button"
              onClick={() => {
                setWeekOffset(w => w + 1)
                if (triggerToast) triggerToast('Navigated to next week', 'info')
              }}
              className="p-1.5 hover:bg-[#161b2b] rounded-none text-slate-400 hover:text-white transition cursor-pointer border-0"
              title="Next Week"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Strategy Mode Badge */}
          <div className="hidden lg:flex items-center gap-1.5 bg-rose-500/10 text-rose-400 px-3 py-1 rounded-none text-xs font-semibold border-0">
            <Target size={13} className="text-rose-400" />
            <span>Mode: Launch Conversion &amp; Urgency</span>
          </div>
        </div>

        {/* Quick Action Buttons (Zero Borders & Zero Border Radius) */}
        <div className="flex items-center gap-2">
          {/* Quests Button with Beacon */}
          <button
            type="button"
            onClick={() => setQuestModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 rounded-none transition cursor-pointer border-0"
            title="Open Quest Objectives"
          >
            <Gamepad2 size={14} className="text-amber-400" />
            <span className="hidden sm:inline">Quest Objectives</span>
            <span className="flex h-2 w-2 relative ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-none h-2 w-2 bg-amber-500" />
            </span>
          </button>

          {/* Ideas Vault */}
          <button
            type="button"
            onClick={() => setVaultModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-300 bg-[#111522] hover:bg-[#161b2b] rounded-none transition cursor-pointer border-0"
            title="Open Ideas & Buffer Vault"
          >
            <Lightbulb size={13} className="text-amber-400" />
            <span>Vault (3)</span>
          </button>

          {/* AI Auto-Fill Week */}
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-none transition cursor-pointer border-0"
            title="Auto-fill week with AI"
          >
            <Sparkles size={13} className="text-rose-400" />
            <span className="hidden md:inline">Auto-fill Week with AI</span>
          </button>

          {/* New Draft Button (Brand Red with Pure White Text & Zero Border Radius) */}
          <button
            type="button"
            onClick={() => {
              setModalDraftDay(activePost ? activePost.dayIndex : 0)
              setNewDraftModalOpen(true)
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white rounded-none transition shadow-sm cursor-pointer hover:opacity-95 border-0"
            style={{ background: brandRed, color: '#ffffff' }}
          >
            <Plus size={14} className="text-white" />
            <span>New Quest Draft</span>
          </button>

          {/* Schedule All Ready */}
          <button
            type="button"
            onClick={handleScheduleAllReady}
            className="hidden xl:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-400 bg-emerald-500/15 hover:bg-emerald-500/25 rounded-none transition cursor-pointer border-0"
          >
            <CheckCircle2 size={13} />
            <span>Schedule All Ready</span>
          </button>
        </div>
      </header>

      {/* ── METRICS & STRATEGY STRIP (Flat Dark Elevation, Border 0, Rounded 0) ── */}
      <section className="bg-[#0c0f17] px-4 sm:px-6 py-3 flex-shrink-0 mt-0.5 border-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-center">
          
          {/* Metric 1: Gamified Level & XP */}
          <div className="flex items-center gap-3 p-2.5 rounded-none bg-[#111522] border-0">
            <div className="w-8 h-8 rounded-none bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
              <Trophy size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs font-extrabold text-white">
                <span className="text-amber-400">Level {currentLevel} Creator</span>
                <span className="text-[10px] font-mono text-slate-400">{xp} / {targetXp} XP</span>
              </div>
              <div className="w-full bg-[#161b2b] h-1.5 rounded-none overflow-hidden mt-1.5">
                <div className="bg-amber-400 h-full rounded-none transition-all duration-500" style={{ width: `${xpPercent}%` }} />
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
          <div className="flex items-center gap-3 p-2.5 rounded-none bg-[#111522] border-0">
            <div className="w-8 h-8 rounded-none bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <Gauge size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs font-extrabold text-white">
                <span>{readyPostsCount} of {totalPostsCount} Ready</span>
                <span className="text-[11px] text-emerald-400">{readinessPercent}%</span>
              </div>
              <div className="w-full bg-[#161b2b] h-1.5 rounded-none overflow-hidden mt-1.5">
                <div className="bg-emerald-500 h-full rounded-none transition-all duration-300" style={{ width: `${readinessPercent}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                {draftPostsCount} pending in draft quest queue
              </p>
            </div>
          </div>

          {/* Metric 3: Channel Breakdown */}
          <div className="flex items-center gap-3 p-2.5 rounded-none bg-[#111522] border-0">
            <div className="w-8 h-8 rounded-none bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0">
              <Share2 size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-1.5 py-0.5 rounded-none text-[10px] font-extrabold bg-red-500/15 text-red-400">YT {ytCount}</span>
                <span className="px-1.5 py-0.5 rounded-none text-[10px] font-extrabold bg-pink-500/15 text-pink-400">IG {igCount}</span>
                <span className="px-1.5 py-0.5 rounded-none text-[10px] font-extrabold bg-sky-500/15 text-sky-400">X {xCount}</span>
                {ttCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-none text-[10px] font-extrabold bg-slate-500/15 text-slate-300">TT {ttCount}</span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Omnichannel distribution active</p>
            </div>
          </div>

          {/* Metric 4: Campaign Product & Formula */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-none bg-[#111522] border-0">
            <div className="w-8 h-8 rounded-none bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
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
          
          {/* Filter Chips & View Mode Switcher (All Rounded-0) */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2.5">
            {/* Functional Platform Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setPlatformFilter('all')}
                className={`px-3 py-1.5 rounded-none text-xs font-bold transition cursor-pointer border-0 ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold transition cursor-pointer border-0 ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold transition cursor-pointer border-0 ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold transition cursor-pointer border-0 ${
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold transition cursor-pointer border-0 ${
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
            <div className="flex items-center bg-[#111522] p-1 rounded-none text-xs font-bold border-0">
              <button
                type="button"
                onClick={() => setViewMode('sprint')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none transition cursor-pointer border-0 ${
                  viewMode === 'sprint'
                    ? 'bg-[#1c2236] text-white shadow-sm font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns size={13} />
                <span>7-Day Sprint</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none transition cursor-pointer border-0 ${
                  viewMode === 'calendar'
                    ? 'bg-[#1c2236] text-white shadow-sm font-bold'
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
            <div>
              {/* Optional Empty Week Banner */}
              {filteredPosts.length === 0 && (
                <div className="mb-3 p-4 bg-[#111522] rounded-none flex flex-col sm:flex-row items-center justify-between gap-3 border-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-none bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">No campaign posts scheduled for {weekData.headerTitle} yet</h5>
                      <p className="text-[11px] text-slate-400">Populate this sprint with AI-crafted launch &amp; retention posts.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handlePopulateEmptyWeek(weekOffset, e)}
                    className="px-4 py-2 text-xs font-bold text-white rounded-none flex items-center gap-1.5 transition cursor-pointer hover:opacity-95 shrink-0 border-0"
                    style={{ background: brandRed, color: '#ffffff' }}
                  >
                    <Zap size={13} className="text-white" />
                    <span>Auto-Populate Week's Campaign (+100 XP)</span>
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              {weekData.days.map(day => {
                const dayPosts = filteredPosts.filter(p => p.dayIndex === day.dayIdx)
                // ACTIVE DAY IDENTIFIER: Active day column has a prominent border as required!
                const isActiveDay = activePost?.dayIndex === day.dayIdx

                return (
                  <div
                    key={day.dayIdx}
                    className={`flex flex-col bg-[#0c0f17] rounded-none p-3.5 transition-all duration-150 ${
                      isActiveDay 
                        ? 'border-2 border-[#c81e3c] bg-[#111522] shadow-xl' 
                        : 'border-0 hover:bg-[#111522]/80'
                    }`}
                  >
                    {/* Day Column Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-extrabold text-xs ${isActiveDay ? 'text-rose-400 font-black' : 'text-slate-200'}`}>
                          {day.name}
                        </span>
                        {day.isToday && (
                          <span className="px-1.5 py-0.2 rounded-none bg-rose-500 text-white font-black text-[9px] uppercase">
                            TODAY
                          </span>
                        )}
                        {day.dayIdx === 6 && (
                          <span className="w-1.5 h-1.5 rounded-none bg-rose-500 animate-pulse" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-slate-400 font-semibold text-[11px] font-mono">{day.dateLabel}</span>
                        <span className="px-1.5 py-0.5 rounded-none bg-[#161b2b] text-slate-300 font-bold text-[10px]">
                          {dayPosts.length}
                        </span>
                      </div>
                    </div>

                    {/* Posts Cards list */}
                    <div className="space-y-2 flex-1">
                      {dayPosts.length === 0 ? (
                        <div className="h-28 flex flex-col items-center justify-center text-center p-3 rounded-none bg-[#090d16] text-slate-500 border-0">
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
                              className={`cursor-pointer p-3 rounded-none transition-all duration-150 relative border-0 ${
                                isSelected ? 'bg-[#1c2236] text-white shadow-md' : 'bg-[#111522] text-slate-200 hover:bg-[#161b2b]'
                              }`}
                            >
                              {/* Thumbnail preview if generated */}
                              {post.imageUrl && (
                                <div className="w-full h-24 mb-2 overflow-hidden bg-black rounded-none border-0 relative">
                                  <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                                  <span className="absolute top-1 right-1 bg-black/70 text-white text-[8px] font-mono px-1 py-0.5 rounded-none font-bold">
                                    AI VISUAL
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                  {renderChannelIcon(post.channel)}
                                  <span className="uppercase tracking-wider text-slate-300 font-mono">
                                    {post.channel.slice(0, 2)} {post.format}
                                  </span>
                                </div>
                                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-none ${stratCfg.bg} ${stratCfg.text}`}>
                                  {post.strategy}
                                </span>
                              </div>

                              <h4 className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug mb-2">
                                {post.title}
                              </h4>

                              <div className="flex items-center justify-between pt-1">
                                {post.status === 'Posted' ? (
                                  <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-emerald-500/15 text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 size={11} /> Posted
                                  </span>
                                ) : post.status === 'Scheduled' ? (
                                  <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-sky-500/15 text-sky-400 flex items-center gap-1">
                                    <Clock size={11} /> {post.time}
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-[#161b2b] text-slate-400">
                                    Draft
                                  </span>
                                )}

                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] font-mono text-amber-400/80 font-bold">
                                    +50 XP
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedPostId(post.id)
                                      handleTweakWithAi()
                                    }}
                                    title="Polish with AI"
                                    className="text-slate-400 hover:text-rose-400 p-1 rounded-none transition cursor-pointer border-0"
                                  >
                                    <Sparkles size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>

                    {/* Quick Add Post on this day (Rounded 0) */}
                    <button
                      type="button"
                      onClick={() => {
                        setModalDraftDay(day.dayIdx)
                        setNewDraftModalOpen(true)
                      }}
                      className="mt-2.5 w-full py-2 rounded-none text-[11px] font-bold text-slate-400 bg-[#111522] hover:text-white hover:bg-[#161b2b] flex items-center justify-center gap-1 transition cursor-pointer border-0"
                    >
                      <Plus size={13} />
                      <span>Add Post</span>
                    </button>
                  </div>
                )
              })}
              </div>
            </div>
          )}

          {/* VIEW B: MONTHLY CALENDAR VIEW (Direct from reference image, Filtered & Functional) */}
          {viewMode === 'calendar' && (
            <div className="flex-1 bg-[#0c0f17] rounded-none p-4 flex flex-col border-0">
              {/* Day Name Headers */}
              <div className="grid grid-cols-7 pb-2 text-center text-xs font-extrabold text-slate-400 uppercase tracking-wider bg-[#111522] py-2 rounded-none border-0">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </div>

              {/* 35 Calendar Cells */}
              <div className="grid grid-cols-7 flex-1 rounded-none overflow-hidden bg-[#090d16] gap-1 p-1 border-0">
                {Array.from({ length: 35 }).map((_, i) => {
                  const dayNumber = i < 4 ? 28 + i : i <= 34 ? i - 3 : i - 34
                  const isCurrentMonth = i >= 4 && i <= 34
                  const isTargetDay = (activePost?.dayIndex ?? 0) === (i % 7) && isCurrentMonth

                  // Match posts to days in month and apply platform filter
                  const cellPosts = posts.filter(p => {
                    const matchPlatform = platformFilter === 'all' || p.channel.toLowerCase() === platformFilter.toLowerCase()
                    if (!matchPlatform) return false

                    // Position sample posts in grid
                    if (i === 5 && p.dayIndex === 0) return true
                    if (i === 19 && p.dayIndex === 1) return true
                    if (i === 20 && p.dayIndex === 2) return true
                    if (i === 22 && p.dayIndex === 4) return true
                    if (i === 24 && p.dayIndex === 6) return true
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
                      className={`min-h-[85px] p-2 flex flex-col justify-between transition hover:bg-[#161b2b] cursor-pointer rounded-none ${
                        isTargetDay ? 'border-2 border-[#c81e3c] bg-[#111522]' : 'border-0'
                      } ${
                        !isCurrentMonth ? 'bg-[#0c0f17]/40 text-slate-600' : 'bg-[#0c0f17] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${
                          isTargetDay
                            ? 'w-5 h-5 rounded-none text-white flex items-center justify-center font-black shadow-sm'
                            : ''
                        }`}
                        style={isTargetDay ? { background: brandRed, color: '#ffffff' } : {}}
                        >
                          {dayNumber}
                        </span>
                        {cellPosts.length > 0 && (
                          <span className="w-1.5 h-1.5 rounded-none bg-rose-500" />
                        )}
                      </div>

                      <div className="space-y-1 mt-1">
                        {cellPosts.map(p => (
                          <div
                            key={p.id}
                            className="p-1 rounded-none text-white text-[10px] font-bold truncate shadow-xs border-0"
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
        </section>

        {/* ── RIGHT WORKSPACE: LIVE DRAFT INSPECTOR STUDIO (Border 0, Rounded 0) ── */}
        <aside className="w-[380px] lg:w-[420px] bg-[#0c0f17] flex flex-col flex-shrink-0 overflow-y-auto z-10 custom-scrollbar border-0">
          
          {/* Header */}
          <div className="p-5 flex items-center justify-between bg-[#111522] border-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Draft for {activePost?.dayName}day
                </span>
                {activePost?.status === 'Posted' ? (
                  <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                    Posted
                  </span>
                ) : activePost?.status === 'Scheduled' ? (
                  <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-sky-500/15 text-sky-400">
                    Scheduled
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-amber-500/15 text-amber-400">
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
                className="p-2 rounded-none bg-[#161b2b] hover:bg-[#1c2236] text-slate-300 transition cursor-pointer border-0"
              >
                <Share2 size={14} />
              </button>
              <button
                type="button"
                onClick={handleVoicePreview}
                title="Voice Preview Hook"
                className="p-2 rounded-none bg-[#161b2b] hover:bg-rose-500/20 hover:text-rose-400 text-slate-300 transition cursor-pointer border-0"
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
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-none uppercase tracking-wider ${
                STRATEGY_CONFIG[activePost?.strategy]?.bg || 'bg-sky-500/15'
              } ${
                STRATEGY_CONFIG[activePost?.strategy]?.text || 'text-sky-300'
              }`}>
                {activePost?.strategy} STRATEGY
              </span>
            </div>

            {/* Campaign Product Focus */}
            <div className="bg-[#111522] rounded-none p-3 border-0">
              <div className="text-[10px] uppercase font-bold text-slate-400">
                Campaign Product Focus
              </div>
              <div className="text-xs font-extrabold text-white mt-0.5">
                {productName}
              </div>
            </div>

            {/* AI Visual & Thumbnail Studio (OpenAI DALL-E) */}
            <div className="bg-[#111522] rounded-none p-3 space-y-2 border-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <ImageIcon size={14} className="text-sky-400" />
                  <span>AI Visual &amp; Thumbnail Studio (OpenAI)</span>
                </span>
                {activePost?.imageUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    title="Remove Image"
                    className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer border-0 bg-transparent"
                  >
                    <Trash2 size={11} /> Remove
                  </button>
                )}
              </div>

              {activePost?.imageUrl ? (
                <div className="w-full h-44 bg-black overflow-hidden relative group rounded-none border-0">
                  <img src={activePost.imageUrl} alt="Generated visual" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage}
                      className="px-3 py-1.5 bg-[#c81e3c] text-white text-xs font-bold rounded-none cursor-pointer border-0"
                    >
                      {isGeneratingImage ? 'Regenerating...' : 'Regenerate'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Generate an attention-grabbing social media visual with OpenAI DALL-E for this draft.
                  </p>
                  <input
                    type="text"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Enter visual prompt..."
                    className="w-full text-xs text-slate-200 bg-[#0c0f17] rounded-none p-2 focus:ring-1 focus:ring-sky-500 outline-none border-0"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={isGeneratingImage}
                    className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-none flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 border-0"
                  >
                    <Wand2 size={13} className={isGeneratingImage ? 'animate-spin' : ''} />
                    <span>{isGeneratingImage ? 'Generating with OpenAI...' : 'Generate Visual with OpenAI (+60 XP)'}</span>
                  </button>
                </div>
              )}
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
                className="w-full text-sm font-semibold text-white bg-[#111522] rounded-none p-2.5 focus:ring-2 focus:ring-rose-500 focus:outline-none transition border-0"
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
                rows={5}
                value={activePost?.caption || ''}
                onChange={(e) => updateActivePostCaption(e.target.value)}
                className="w-full text-sm text-slate-200 bg-[#111522] rounded-none p-3 focus:ring-2 focus:ring-rose-500 focus:outline-none leading-relaxed transition font-normal resize-none border-0"
              />
            </div>

            {/* AI Creative Booster / Tweak Tools */}
            <div className="rounded-none p-3 bg-[#111522] border-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles size={13} className="text-amber-400" />
                  <span>AI Creative Booster</span>
                </span>
                <button
                  type="button"
                  onClick={handleGenerateHookIdeas}
                  disabled={isGeneratingHooks}
                  className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer disabled:opacity-50 border-0 bg-transparent"
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
                    className="w-full text-left p-2.5 rounded-none bg-[#161b2b] hover:bg-[#1c2236] transition cursor-pointer text-xs font-medium text-slate-200 flex items-start gap-1.5 border-0"
                  >
                    <Lightbulb size={12} className="text-amber-400 shrink-0 mt-0.5" />
                    <span>"{hook}"</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons Group (Border 0, Rounded 0, Guaranteed White Text on Red) */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    captionRef.current?.focus()
                    if (triggerToast) triggerToast('Script editor focused. Write freely!', 'info')
                  }}
                  className="w-full py-2.5 px-3 rounded-none bg-[#111522] hover:bg-[#161b2b] text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border-0"
                >
                  <Pencil size={13} className="text-slate-400" />
                  <span>Edit Script</span>
                </button>

                <button
                  type="button"
                  onClick={handleTweakWithAi}
                  disabled={isTweakingAi}
                  className="w-full py-2.5 px-3 rounded-none bg-[#111522] hover:bg-[#161b2b] text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 border-0"
                >
                  <Sparkles size={13} className={`text-rose-400 ${isTweakingAi ? 'animate-spin' : ''}`} />
                  <span>{isTweakingAi ? 'Polishing...' : 'Tweak with AI'}</span>
                </button>
              </div>

              {/* Approve and Schedule (Solid Brand Red, White Text, +50 XP, Rounded-0) */}
              <button
                type="button"
                onClick={handleApproveAndSchedule}
                className="w-full py-3 px-4 rounded-none font-extrabold text-xs tracking-wide flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-md hover:opacity-95 border-0"
                style={{ background: brandRed, color: '#ffffff' }}
              >
                <CheckCircle2 size={15} className="text-white" />
                <span className="text-white font-bold">Approve and Schedule (+50 XP)</span>
              </button>

              {/* Instant Post to Live Channel (Solid Emerald, White Text, +100 XP, Rounded-0) */}
              <button
                type="button"
                onClick={handleInstantPostLive}
                className="w-full py-2.5 px-4 rounded-none bg-emerald-600 hover:bg-emerald-700 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-md border-0"
                style={{ color: '#ffffff' }}
              >
                <Send size={14} className="text-white" />
                <span className="text-white font-bold">Post to Live Channel Now (+100 XP)</span>
              </button>
            </div>

          </div>
        </aside>

      </div>

      {/* ── MODAL: QUEST OBJECTIVES & ACHIEVEMENTS ── */}
      {questModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0f17] rounded-none max-w-lg w-full p-6 text-slate-200 shadow-2xl border-0 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-none bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Gamepad2 size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Campaign Quest Objectives</h3>
                  <p className="text-xs text-slate-400">Complete quests to level up and unlock creator perks</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuestModalOpen(false)}
                className="p-1.5 rounded-none hover:bg-[#161b2b] text-slate-400 hover:text-white transition cursor-pointer border-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-4 space-y-3">
              {/* Quest 1 */}
              <div className="p-3 bg-[#111522] rounded-none border-0 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Publish 3 Shorts/Reels this week</span>
                    <span className="text-[10px] text-amber-400 font-mono font-bold">+150 XP</span>
                  </div>
                  <div className="w-full bg-[#161b2b] h-1.5 rounded-none mt-2">
                    <div className="bg-amber-400 h-full rounded-none" style={{ width: '66%' }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">2 of 3 Completed</p>
                </div>
                <button
                  type="button"
                  disabled={claimedQuests['quest-1']}
                  onClick={(e) => handleClaimQuest('quest-1', 150, e)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-none border-0 cursor-pointer ${
                    claimedQuests['quest-1']
                      ? 'bg-[#161b2b] text-slate-500 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold'
                  }`}
                >
                  {claimedQuests['quest-1'] ? 'Claimed' : 'Claim +150 XP'}
                </button>
              </div>

              {/* Quest 2 */}
              <div className="p-3 bg-[#111522] rounded-none border-0 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Stage 5 Omnichannel Posts in Calendar</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">+100 XP</span>
                  </div>
                  <div className="w-full bg-[#161b2b] h-1.5 rounded-none mt-2">
                    <div className="bg-emerald-400 h-full rounded-none" style={{ width: `${Math.min(100, (posts.length / 5) * 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{posts.length} of 5 Completed</p>
                </div>
                <button
                  type="button"
                  disabled={claimedQuests['quest-2'] || posts.length < 5}
                  onClick={(e) => handleClaimQuest('quest-2', 100, e)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-none border-0 cursor-pointer ${
                    claimedQuests['quest-2']
                      ? 'bg-[#161b2b] text-slate-500 cursor-not-allowed'
                      : posts.length >= 5
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold'
                      : 'bg-[#161b2b] text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {claimedQuests['quest-2'] ? 'Claimed' : 'Claim +100 XP'}
                </button>
              </div>

              {/* Quest 3 */}
              <div className="p-3 bg-[#111522] rounded-none border-0 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Generate an AI Visual for any post</span>
                    <span className="text-[10px] text-sky-400 font-mono font-bold">+120 XP</span>
                  </div>
                  <div className="w-full bg-[#161b2b] h-1.5 rounded-none mt-2">
                    <div className="bg-sky-400 h-full rounded-none" style={{ width: posts.some(p => p.imageUrl) ? '100%' : '0%' }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {posts.some(p => p.imageUrl) ? '1 of 1 Completed' : '0 of 1 Completed'}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={claimedQuests['quest-3'] || !posts.some(p => p.imageUrl)}
                  onClick={(e) => handleClaimQuest('quest-3', 120, e)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-none border-0 cursor-pointer ${
                    claimedQuests['quest-3']
                      ? 'bg-[#161b2b] text-slate-500 cursor-not-allowed'
                      : posts.some(p => p.imageUrl)
                      ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold'
                      : 'bg-[#161b2b] text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {claimedQuests['quest-3'] ? 'Claimed' : 'Claim +120 XP'}
                </button>
              </div>

              {/* Quest 4 */}
              <div className="p-3 bg-[#111522] rounded-none border-0 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Maintain a 4-Day Publishing Streak</span>
                    <span className="text-[10px] text-rose-400 font-mono font-bold">+200 XP</span>
                  </div>
                  <div className="w-full bg-[#161b2b] h-1.5 rounded-none mt-2">
                    <div className="bg-rose-500 h-full rounded-none" style={{ width: `${Math.min(100, (streak / 4) * 100)}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">{streak} of 4 Days Active</p>
                </div>
                <button
                  type="button"
                  disabled={claimedQuests['quest-4'] || streak < 4}
                  onClick={(e) => handleClaimQuest('quest-4', 200, e)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-none border-0 cursor-pointer ${
                    claimedQuests['quest-4']
                      ? 'bg-[#161b2b] text-slate-500 cursor-not-allowed'
                      : streak >= 4
                      ? 'bg-rose-500 hover:bg-rose-400 text-white font-extrabold'
                      : 'bg-[#161b2b] text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {claimedQuests['quest-4'] ? 'Claimed' : 'Claim +200 XP'}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setQuestModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#111522] hover:bg-[#161b2b] rounded-none cursor-pointer border-0"
              >
                Close Quests
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: IDEAS & BUFFER VAULT ── */}
      {vaultModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0f17] rounded-none max-w-lg w-full p-6 text-slate-200 shadow-2xl border-0 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-none bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Ideas &amp; Buffer Vault</h3>
                  <p className="text-xs text-slate-400">Evergreen concepts ready to slot into any calendar opening</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVaultModalOpen(false)}
                className="p-1.5 rounded-none hover:bg-[#161b2b] text-slate-400 hover:text-white transition cursor-pointer border-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="py-4 space-y-3">
              {[
                {
                  title: 'Rehearsal Bloopers & Live Improvisation',
                  channel: 'Instagram',
                  format: 'REEL',
                  strategy: 'BTS',
                  caption: 'Unfiltered laughter from rehearsal: What happens when the drummer drops his stick during the bridge!'
                },
                {
                  title: 'The 1 Chord Transpose Trick Every Director Needs',
                  channel: 'YouTube',
                  format: 'SHORTS',
                  strategy: 'VALUE',
                  caption: 'Quick 45-second tutorial: How to transpose any worship song in seconds without losing the groove.'
                },
                {
                  title: 'Subscriber Q&A: Why Our Members Save 4 Hours Every Week',
                  channel: 'YouTube',
                  format: 'VIDEO',
                  strategy: 'PROOF',
                  caption: 'Answering community questions about multitrack stems and audio isolation in WorshipLeader+.'
                }
              ].map((idea, idx) => (
                <div key={idx} className="p-3.5 bg-[#111522] rounded-none border-0 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                      <span className="uppercase text-amber-400 font-bold">{idea.strategy}</span>
                      <span>•</span>
                      <span>{idea.channel} {idea.format}</span>
                    </div>
                    <h4 className="text-xs font-bold text-white mt-1 truncate">{idea.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{idea.caption}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleSlotVaultIdea(idea, e)}
                    className="px-3 py-1.5 bg-[#161b2b] hover:bg-[#c81e3c] text-white text-xs font-bold rounded-none transition cursor-pointer shrink-0 border-0"
                  >
                    Slot (+30 XP)
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setVaultModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#111522] hover:bg-[#161b2b] rounded-none cursor-pointer border-0"
              >
                Close Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: AI AUTO-FILL WEEK ── */}
      {aiModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0f17] rounded-none max-w-lg w-full p-6 text-slate-200 shadow-2xl animate-fadeIn border-0">
            <div className="flex items-center justify-between pb-3 border-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-none bg-rose-500/20 text-rose-400 flex items-center justify-center">
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
                className="p-1.5 rounded-none hover:bg-[#161b2b] text-slate-400 hover:text-white transition cursor-pointer border-0"
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
                  className="w-full text-xs font-medium bg-[#111522] text-white rounded-none p-2.5 focus:ring-2 focus:ring-rose-500 outline-none border-0"
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
                  className="w-full text-xs font-medium bg-[#111522] text-white rounded-none p-2.5 focus:ring-2 focus:ring-rose-500 outline-none border-0"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Target Primary Goal
                </label>
                <select
                  value={aiCampaignGoal}
                  onChange={(e) => setAiCampaignGoal(e.target.value)}
                  className="w-full text-xs font-semibold bg-[#111522] text-white rounded-none p-2.5 focus:ring-2 focus:ring-rose-500 outline-none border-0"
                >
                  <option value="LaunchUrgency">Conversion &amp; Urgency (Cart closes Sunday)</option>
                  <option value="AudienceGrowth">Rapid Follower Growth &amp; Viral Reach</option>
                  <option value="HighTicketCall">High-Ticket / Waitlist Warmup</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-0">
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-none cursor-pointer border-0"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAiWeekFill}
                className="px-5 py-2.5 text-xs font-extrabold text-white rounded-none flex items-center gap-2 transition cursor-pointer shadow-sm hover:opacity-95 border-0"
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
          <div className="bg-[#0c0f17] rounded-none max-w-lg w-full p-6 text-slate-200 shadow-2xl animate-fadeIn border-0">
            <div className="flex items-center justify-between pb-3 border-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-none bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
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
                className="p-1.5 rounded-none hover:bg-[#161b2b] text-slate-400 hover:text-white transition cursor-pointer border-0"
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
                    className="w-full text-xs font-semibold bg-[#111522] text-white rounded-none p-2.5 border-0 focus:ring-2 focus:ring-rose-500 outline-none"
                  >
                    {weekData.days.map(d => (
                      <option key={d.dayIdx} value={d.dayIdx}>
                        {d.name} ({d.dateLabel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">Social Channel</label>
                  <select
                    value={modalDraftChannel}
                    onChange={(e) => setModalDraftChannel(e.target.value)}
                    className="w-full text-xs font-semibold bg-[#111522] text-white rounded-none p-2.5 border-0 focus:ring-2 focus:ring-rose-500 outline-none"
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
                      className={`p-2 rounded-none text-xs font-bold text-center transition cursor-pointer border-0 ${
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
                  className="w-full text-xs font-medium bg-[#111522] text-white rounded-none p-2.5 outline-none focus:ring-2 focus:ring-rose-500 border-0"
                  placeholder={`e.g. 3 Reasons ${productName} is a Game Changer`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Caption / Talking Points</label>
                <textarea
                  rows={3}
                  value={modalDraftCaption}
                  onChange={(e) => setModalDraftCaption(e.target.value)}
                  className="w-full text-xs font-medium bg-[#111522] text-white rounded-none p-2.5 outline-none focus:ring-2 focus:ring-rose-500 border-0 resize-none"
                  placeholder="Write draft caption or paste talking points..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-0">
              <button
                type="button"
                onClick={() => setNewDraftModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-none cursor-pointer border-0"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNewDraft}
                className="px-5 py-2.5 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 rounded-none transition cursor-pointer border-0"
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
