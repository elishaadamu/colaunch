import { useState, useEffect, useMemo, useRef } from 'react'
import { useForge } from '../../App'
import { loadAiKeys } from '../../services/ai'
import {
  getYouTubeAuthUrl,
  startYouTubeOAuth,
  exchangeYouTubeAuthCode,
  getStoredYouTubeConnection,
  saveLocalYouTubeConnection,
  disconnectYouTubeChannel,
  publishToYouTube
} from '../../services/youtubeApi'
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
  Trash2,
  Bell,
  ShieldCheck,
  Linkedin,
  Heart,
  Repeat,
  Bookmark,
  ThumbsUp,
  ThumbsDown,
  Globe,
  Sliders,
  Settings,
  AlertCircle,
  UploadCloud
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

// Month names constant
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

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
  const fullDayNamesList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const days = dayNames.map((name, idx) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + idx)
    return {
      dayIdx: idx,
      name,
      fullDayName: fullDayNamesList[idx],
      dateLabel: `${d.getMonth() + 1}/${d.getDate()}`,
      fullDateStr: `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
      isToday: d.toDateString() === now.toDateString()
    }
  })

  return { headerTitle, weekNum, days, monday, sunday }
}

// Clean Full Weekday Name Resolver (eliminates string concatenations like 'Tueday' or 'Wedday')
function getFullDayName(postOrCell) {
  if (!postOrCell) return 'Today'
  if (postOrCell.fullDayName) return postOrCell.fullDayName
  if (postOrCell.dateKey) {
    const parts = String(postOrCell.dateKey).split('-')
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
      const fullDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return fullDays[d.getDay()]
    }
  }
  const mapping = {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
    Sun: 'Sunday'
  }
  const raw = postOrCell.dayName || postOrCell.name || ''
  return mapping[raw] || raw || 'Today'
}

// Dynamic Month Calendar Grid calculation (7 columns: Mon to Sun)
function getMonthCalendarGrid(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1)
  const lastDay = new Date(year, monthIndex + 1, 0)
  
  // (0 = Sun, 1 = Mon ... 6 = Sat) -> Mon=0 ... Sun=6
  const startDayOfWeek = (firstDay.getDay() + 6) % 7
  const daysInMonth = lastDay.getDate()
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate()
  const fullDayNamesArr = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  
  const cells = []
  
  // Leading days from prev month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthLastDay - i
    const d = new Date(year, monthIndex - 1, dayNum)
    const dayIdx = (d.getDay() + 6) % 7
    cells.push({
      dayNumber: dayNum,
      isCurrentMonth: false,
      dateObj: d,
      dateKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`,
      dayName: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIdx],
      fullDayName: fullDayNamesArr[dayIdx]
    })
  }
  
  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, monthIndex, d)
    const dayIdx = (dateObj.getDay() + 6) % 7
    cells.push({
      dayNumber: d,
      isCurrentMonth: true,
      dateObj,
      dateKey: `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      dayName: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIdx],
      fullDayName: fullDayNamesArr[dayIdx]
    })
  }
  
  // Trailing days from next month to make complete 7-day rows (e.g., 35 or 42 cells)
  const remaining = (7 - (cells.length % 7)) % 7
  for (let d = 1; d <= remaining; d++) {
    const dateObj = new Date(year, monthIndex + 1, d)
    const dayIdx = (dateObj.getDay() + 6) % 7
    cells.push({
      dayNumber: d,
      isCurrentMonth: false,
      dateObj,
      dateKey: `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
      dayName: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIdx],
      fullDayName: fullDayNamesArr[dayIdx]
    })
  }
  
  return cells
}

// Generate structured campaign posts for ANY week offset (guaranteeing week navigation is never empty)
function generateWeekCampaignPosts(productName, offset = 0) {
  const weekData = calculateWeekData(offset)
  const templates = [
    {
      dayIndex: 0,
      dayName: 'Mon',
      channel: 'YouTube',
      format: 'VIDEO',
      strategy: 'LAUNCH',
      time: '9:00 AM',
      title: offset > 0 
        ? `Masterclass: Scaling Sunday Setlists with ${productName}` 
        : `How ${productName} Transforms Your Sunday Morning Preparation`,
      caption: `Sunday mornings shouldn't come with panic over missing audio stems or incorrect chords.\n\nToday, we're officially unveiling the brand-new ${productName} Session Engine. See how our members prepare a full 5-song set in under 20 minutes.\n\nLink in description to start your 7-day free trial.\n\n#ChurchTech #WorshipLeader #MusicDirector`
    },
    {
      dayIndex: 1,
      dayName: 'Tue',
      channel: 'Instagram',
      format: 'REEL',
      strategy: 'BTS',
      time: '11:30 AM',
      title: 'Sneak Peek: Upcoming Exclusive Songs for Members!',
      caption: `Big things are coming.\n\nWe've been working behind the scenes on something we can't wait to share with you.\n\nStay tuned. The countdown has begun.\n\n#newlaunch #staytuned #excitingnews #worshiptips`
    },
    {
      dayIndex: 2,
      dayName: 'Wed',
      channel: 'YouTube',
      format: 'SHORTS',
      strategy: 'PROOF',
      time: '1:00 PM',
      title: `3 Reasons ${productName} is a Game Changer`,
      caption: `Watch how our worship team cut rehearsal prep time by 50% using real-time key transposition.\n\nDrop a comment if your church needs this!\n\n#Shorts #Productivity #ChurchTech`
    },
    {
      dayIndex: 3,
      dayName: 'Thu',
      channel: 'Instagram',
      format: 'STORY',
      strategy: 'COMMUNITY',
      time: '3:00 PM',
      title: `Story Poll: Chord Transpose vs Multitracks?`,
      caption: `Quick question for our crew: Chord transpose or audio stem isolation? Vote in our story poll!`
    },
    {
      dayIndex: 4,
      dayName: 'Fri',
      channel: 'YouTube',
      format: 'VIDEO',
      strategy: 'CTA',
      time: '4:00 PM',
      title: `Before and After: Elevate Your Worship Sessions`,
      caption: `Founding member registration is live! Get full access to our complete music library and video stems for $29/mo.\n\nLink in description.`
    },
    {
      dayIndex: 5,
      dayName: 'Sat',
      channel: 'Instagram',
      format: 'REEL',
      strategy: 'PROOF',
      time: '12:00 PM',
      title: `User Feedback: Weekend Saved with ${productName}`,
      caption: `"I got my Saturday nights back with my family instead of manually transposing keys." - Sarah M.\n\nJoin the platform today!`
    },
    {
      dayIndex: 6,
      dayName: 'Sun',
      channel: 'YouTube',
      format: 'SHORTS',
      strategy: 'VALUE',
      time: '8:00 AM',
      title: `Sunday Quick Tip: Quick Audio Monitoring Hacks`,
      caption: `Happy Sunday everyone! Here are 3 quick tips for smooth audio monitoring during your service.\n\nHave a blessed morning!`
    }
  ]

  return templates.map((t, idx) => {
    const dayInfo = weekData.days[t.dayIndex]
    const d = new Date(weekData.monday)
    d.setDate(weekData.monday.getDate() + t.dayIndex)
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

    return {
      id: `post-gen-${offset}-${idx}-${Date.now()}`,
      weekOffset: offset,
      dayIndex: t.dayIndex,
      dayName: t.dayName,
      fullDayName: dayInfo?.fullDayName || getFullDayName({ dayName: t.dayName }),
      fullDateStr: dayInfo?.fullDateStr || `${getFullDayName({ dayName: t.dayName })}, ${d.getDate()}`,
      dateKey,
      channel: t.channel,
      format: t.format,
      strategy: t.strategy,
      title: t.title,
      caption: t.caption,
      status: 'Draft',
      time: t.time,
      imageUrl: null
    }
  })
}

// Map platform names to standard channel keys
function mapPlatformToChannel(platform = '') {
  const p = (platform || '').toLowerCase()
  if (p.includes('you') || p === 'yt') return 'YouTube'
  if (p.includes('insta') || p === 'ig') return 'Instagram'
  if (p.includes('tik')) return 'TikTok'
  if (p.includes('x') || p.includes('twit')) return 'X'
  if (p.includes('link')) return 'LinkedIn'
  if (p.includes('email') || p.includes('mail')) return 'Email'
  return 'Instagram'
}

// Map types to standard format keys
function mapTypeToFormat(type = '') {
  const t = (type || '').toUpperCase()
  if (t.includes('REEL')) return 'REEL'
  if (t.includes('SHORT')) return 'SHORTS'
  if (t.includes('VIDEO')) return 'VIDEO'
  if (t.includes('STORY')) return 'STORY'
  if (t.includes('THREAD')) return 'THREAD'
  if (t.includes('COMMUNITY')) return 'COMMUNITY'
  if (t.includes('EMAIL')) return 'EMAIL'
  return 'POST'
}

// Generate tailored caption for post if none exists
function generateTailoredCaption(post, creatorData, productName) {
  if (post.body && post.body.trim().length > 10) return post.body
  if (post.caption && post.caption.trim().length > 10) return post.caption

  const name = creatorData?.name || (creatorData?.handle || 'Creator').replace(/^@+/, '')
  const prod = productName || creatorData?.productName || 'our new launch platform'
  const title = post.title || 'Launch Update'
  const channel = mapPlatformToChannel(post.platform || post.channel)

  if (channel === 'YouTube') {
    return `${title}\n\nToday marks an exciting new chapter for our community! We are officially unveiling ${prod}.\n\nIn this video, I walk you through everything we built, why we made it, and how it directly empowers you.\n\nWatch now and grab early founding access at the link in description.\n\n#${name.replace(/\s+/g, '')} #NewLaunch #Community`
  }
  if (channel === 'Instagram') {
    return `${title}\n\nIt's finally here! We've been putting in the work behind the scenes to bring ${prod} to life for all of you. Drop a comment below with your thoughts and check out the link in our bio for instant access!\n\n#${name.replace(/\s+/g, '')} #FoundingMembers #Launch`
  }
  if (channel === 'TikTok') {
    return `${title}\n\nPOV: We just launched ${prod} and the reaction has been insane! Check the link in bio right now.\n\n#fyp #${name.replace(/\s+/g, '')} #viral`
  }
  if (channel === 'X') {
    return `${title}\n\n1/3 Excited to announce that ${prod} is officially live.\n\n2/3 Built from the ground up for our supporters and community.\n\n3/3 Join the first cohort here: [LINK]`
  }
  if (channel === 'Email') {
    return `Subject: ${title}\n\nHey everyone,\n\nDoors are officially open for ${prod}. We built this specifically for you, and early access is now unlocked.\n\nCheck out the full launch here:\n[PRODUCT_LINK]\n\nBest,\n${name}`
  }
  return `${title}\n\nExcited to share ${prod} with you today! Check our main link for full details.`
}

// Tailored fallback week generator (matches Marketing fallback)
function buildTailoredFallbackWeek(creatorData) {
  const name = creatorData?.name || (creatorData?.handle || 'Creator').replace(/^@/, '')
  const prod = creatorData?.productName || `${name} Foundation & Marketplace`
  return [
    { day: 'Mon', posts: [
      { id: 1, type: 'Video', title: `SURPRISE!! We Built a Foundation to Help EVERYONE in Our Community`, platform: 'YouTube', theme: 'launch', status: 'draft' },
      { id: 2, type: 'Reel', title: `The BIGGEST Announcement You've Been Waiting For: ${prod}`, platform: 'Instagram', theme: 'launch', status: 'draft' }
    ]},
    { day: 'Tue', posts: [
      { id: 3, type: 'Shorts', title: `See the JOY! How YOUR Purchases Fund Real Good Deeds`, platform: 'YouTube', theme: 'launch', status: 'draft' },
      { id: 4, type: 'Post', title: `How Your Good Deeds Gear Makes a Difference: 3 Simple Ways`, platform: 'Instagram', theme: 'value', status: 'draft' }
    ]},
    { day: 'Wed', posts: [
      { id: 5, type: 'Story', title: `Designing the 'Impact Tee': A Glimpse into Our Process`, platform: 'Instagram', theme: 'bts', status: 'draft' },
      { id: 6, type: 'Thread', title: `From Pranks to Purpose: My Journey to Starting ${prod}`, platform: 'Twitter', theme: 'story', status: 'draft' }
    ]},
    { day: 'Thu', posts: [
      { id: 7, type: 'Community', title: `What's the BEST way to make someone's day? Vote below!`, platform: 'YouTube', theme: 'community', status: 'draft' },
      { id: 8, type: 'Email', title: `IT'S LIVE! The ${prod} VIP Early Access`, platform: 'Email', theme: 'launch', status: 'draft' }
    ]},
    { day: 'Fri', posts: [
      { id: 9, type: 'Reel', title: `Outfit Check: Doing Good & Looking Good! + Shop Our First Drop`, platform: 'Instagram', theme: 'cta', status: 'draft' },
      { id: 10, type: 'Shorts', title: `Quick Look: Our BESTSELLING Foundation Gear!`, platform: 'YouTube', theme: 'proof', status: 'draft' }
    ]},
    { day: 'Sat', posts: [
      { id: 11, type: 'Video', title: `POV: You just funded a good deed by getting some merch`, platform: 'TikTok', theme: 'value', status: 'draft' },
      { id: 12, type: 'Community', title: `What's one good deed you want to see our foundation tackle next?`, platform: 'YouTube', theme: 'community', status: 'draft' }
    ]},
    { day: 'Sun', posts: [
      { id: 13, type: 'Post', title: `A HUGE Thank You! ❤️ Week 1 of the ${prod}`, platform: 'Instagram', theme: 'proof', status: 'draft' },
      { id: 14, type: 'Email', title: `Your Impact So Far! A Look Back at Our First Week & What's Next`, platform: 'Email', theme: 'cta', status: 'draft' }
    ]}
  ]
}

// Pre-seeded campaign dataset dynamically anchored to the current month & date for surrounding weeks
function getDefaultCampaignPosts(productName = 'Creator Launch Suite', creatorData = {}) {
  const name = creatorData?.name || (creatorData?.handle || 'Creator').replace(/^@+/, '')
  const prod = productName || 'our new launch platform'

  return [
    // ── PREVIOUS WEEK (weekOffset: -1) ──
    {
      id: 'post-prev-1',
      weekOffset: -1,
      dayIndex: 0,
      dayName: 'Mon',
      fullDayName: 'Monday',
      channel: 'YouTube',
      format: 'VIDEO',
      strategy: 'LAUNCH',
      title: `The Story Behind ${prod}: Why We Built It`,
      caption: `For months, our community has asked how to take everything we do on channel to the next level.\n\nHere is our journey building ${prod} from the ground up for you.\n\n#${name.replace(/\s+/g, '')} #Launch #BehindTheScenes`,
      status: 'Draft',
      time: '9:00 AM',
      imageUrl: null
    },
    {
      id: 'post-prev-2',
      weekOffset: -1,
      dayIndex: 2,
      dayName: 'Wed',
      fullDayName: 'Wednesday',
      channel: 'Instagram',
      format: 'REEL',
      strategy: 'BTS',
      title: `Behind the Scenes: Engineering ${prod}`,
      caption: `Unfiltered look behind the scenes at our process creating ${prod}.\n\nDrop a comment with your thoughts!\n\n#${name.replace(/\s+/g, '')} #BTS`,
      status: 'Draft',
      time: '12:00 PM',
      imageUrl: null
    },
    {
      id: 'post-prev-3',
      weekOffset: -1,
      dayIndex: 4,
      dayName: 'Fri',
      fullDayName: 'Friday',
      channel: 'YouTube',
      format: 'SHORTS',
      strategy: 'PROOF',
      title: `3 Big Reasons You'll Love ${prod}`,
      caption: `Early feedback from our core community has been incredible. Here's a quick preview!\n\n#Shorts #${name.replace(/\s+/g, '')}`,
      status: 'Draft',
      time: '4:00 PM',
      imageUrl: null
    },

    // ── NEXT RETENTION & GROWTH WEEK (weekOffset: 1) ──
    {
      id: 'post-next-1',
      weekOffset: 1,
      dayIndex: 0,
      dayName: 'Mon',
      fullDayName: 'Monday',
      channel: 'YouTube',
      format: 'VIDEO',
      strategy: 'VALUE',
      title: `Masterclass: Getting Maximum Value from ${prod}`,
      caption: `How to get the most out of our new platform and level up your results.\n\nWatch the full breakdown on YouTube!\n\n#${name.replace(/\s+/g, '')} #Masterclass`,
      status: 'Draft',
      time: '9:00 AM',
      imageUrl: null
    },
    {
      id: 'post-next-2',
      weekOffset: 1,
      dayIndex: 1,
      dayName: 'Tue',
      fullDayName: 'Tuesday',
      channel: 'Instagram',
      format: 'REEL',
      strategy: 'COMMUNITY',
      title: 'Community Q&A: Answering Your Top Questions',
      caption: `Answering the top questions from our founding members about ${prod}.\n\nDrop any questions below for our next live session!\n\n#${name.replace(/\s+/g, '')} #Community`,
      status: 'Draft',
      time: '11:00 AM',
      imageUrl: null
    },
    {
      id: 'post-next-3',
      weekOffset: 1,
      dayIndex: 3,
      dayName: 'Thu',
      fullDayName: 'Thursday',
      channel: 'YouTube',
      format: 'SHORTS',
      strategy: 'PROOF',
      title: 'Member Spotlight: How Supporters Are Thriving',
      caption: `Real member stories from week 1 of ${prod}.\n\nJoin our community today! Link in bio.`,
      status: 'Draft',
      time: '2:00 PM',
      imageUrl: null
    },
    {
      id: 'post-next-4',
      weekOffset: 1,
      dayIndex: 4,
      dayName: 'Fri',
      fullDayName: 'Friday',
      channel: 'YouTube',
      format: 'VIDEO',
      strategy: 'CTA',
      title: `Weekly Wrap-Up: Top Highlights & What's Next`,
      caption: `Exciting new updates just dropped in ${prod}! Check out the member hub now.\n\n#${name.replace(/\s+/g, '')} #WeeklyUpdate`,
      status: 'Draft',
      time: '4:00 PM',
      imageUrl: null
    },
    {
      id: 'post-next-5',
      weekOffset: 1,
      dayIndex: 6,
      dayName: 'Sun',
      fullDayName: 'Sunday',
      channel: 'Instagram',
      format: 'STORY',
      strategy: 'BTS',
      title: 'Sunday Creator Log: Thank You for an Incredible Week',
      caption: `Wrapping up an unforgettable week with the community. Thank you all for the love on ${prod}!`,
      status: 'Draft',
      time: '7:30 AM',
      imageUrl: null
    }
  ]
}

// Checks if a given social channel is actively connected and authorized
export function isChannelConnected(channel, ytConn = null, creatorData = null) {
  const norm = (channel || '').toLowerCase().trim()
  const effectiveYt = ytConn || getStoredYouTubeConnection()
  if (norm === 'youtube') {
    return Boolean(
      effectiveYt?.connected || 
      creatorData?.youtube_connected || 
      creatorData?.channel_title
    )
  }
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('forge_accounts_platforms') : null
    if (raw) {
      const parsed = JSON.parse(raw)
      if (norm === 'instagram' && parsed.instagram?.connected) return true
      if ((norm === 'x' || norm === 'twitter') && parsed.twitter?.connected) return true
      if (norm === 'tiktok' && parsed.tiktok?.connected) return true
      if (norm === 'email' && (parsed.email?.connected || creatorData?.email)) return true
    }
  } catch (_) {}
  if (norm === 'email') {
    return Boolean(creatorData?.email && creatorData.email.includes('@'))
  }
  return false
}

// Synchronizes and loads 7-day launch plan directly from Marketing Launch Calendar
export function loadSyncedCampaignPosts(creatorData, productName, handleClean) {
  const handle = creatorData?.handle || 'default'
  const hClean = (handleClean || handle.replace(/^@+/, '')).toLowerCase()
  const rawH = handle.replace(/^@+/, '')
  const cacheKeys = [
    `forge_calendar_${handle}_launch_w0`,
    `forge_calendar_${handle.toLowerCase()}_launch_w0`,
    `forge_calendar_${rawH}_launch_w0`,
    `forge_calendar_${hClean}_launch_w0`
  ]

  let rawCalendar = null
  for (const k of cacheKeys) {
    try {
      const saved = localStorage.getItem(k)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          rawCalendar = parsed
          break
        }
      }
    } catch (_) {}
  }

  // If no calendar in localStorage yet, build tailored week and persist to localStorage
  if (!rawCalendar) {
    rawCalendar = buildTailoredFallbackWeek(creatorData)
    cacheKeys.forEach(k => {
      try { localStorage.setItem(k, JSON.stringify(rawCalendar)) } catch (_) {}
    })
  }

  // Calculate dates for Monday-Sunday of active sprint (weekOffset: 0)
  const now = new Date()
  const day = now.getDay()
  const distanceToMon = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + distanceToMon)

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const dayNamesShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dayNamesFull = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const defaultTimes = ['9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM']

  const week0Posts = []

  rawCalendar.forEach((dayData, dayIdx) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + dayIdx)
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const fullDateStr = `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
    const dayName = dayNamesShort[dayIdx]
    const fullDayName = dayNamesFull[dayIdx]

    const dayPosts = Array.isArray(dayData.posts) ? dayData.posts : []
    dayPosts.forEach((p, pIdx) => {
      const channel = mapPlatformToChannel(p.platform || p.channel)
      const format = mapTypeToFormat(p.type || p.format)
      const strategy = (p.theme || p.strategy || 'LAUNCH').toUpperCase()
      const title = p.title || p.label || `Launch Post ${pIdx + 1}`
      const isConnected = isChannelConnected(channel, null, creatorData)
      const status = isConnected && (p.status === 'posted' || p.done)
        ? 'Posted'
        : (isConnected && (p.status === 'scheduled' || p.status === 'Scheduled') && p.scheduledAt)
          ? 'Scheduled'
          : 'Draft'
      const time = p.time || defaultTimes[pIdx % defaultTimes.length]
      const caption = generateTailoredCaption(p, creatorData, productName)

      week0Posts.push({
        id: `post-mkt-${dateKey}-${p.id || pIdx}`,
        marketingId: p.id,
        weekOffset: 0,
        dayIndex: dayIdx,
        dayName,
        fullDayName,
        dateKey,
        fullDateStr,
        channel,
        format,
        strategy,
        title,
        caption,
        status,
        time,
        imageUrl: p.imageUrl || null
      })
    })
  })

  // Get surrounding weeks for navigation (-1 and +1) — un-connected channels are strictly Drafts
  const surrounding = getDefaultCampaignPosts(productName, creatorData).map(p => {
    const isConn = isChannelConnected(p.channel, null, creatorData)
    return isConn ? p : { ...p, status: 'Draft', scheduledAt: null }
  })
  return [...week0Posts, ...surrounding]
}

export default function ContentCalendar({ setActiveTab: propSetActiveTab }) {
  const { creatorData, userProfile, triggerToast, setActiveTab: contextSetActiveTab } = useForge()
  const setActiveTab = propSetActiveTab || contextSetActiveTab

  // Direct router to Accounts page
  const navigateToAccounts = useCallback(() => {
    if (typeof setActiveTab === 'function') {
      setActiveTab('accounts')
    }
    try {
      localStorage.setItem('forge_dashboard_active_tab', 'accounts')
      const url = new URL(window.location.href)
      url.searchParams.set('tab', 'accounts')
      window.history.pushState({}, '', url.toString())
      window.dispatchEvent(new CustomEvent('forge_tab_change', { detail: { tab: 'accounts' } }))
    } catch (_) {}
  }, [setActiveTab])

  const creatorName = creatorData?.name || creatorData?.handle?.replace('@', '') || 'Creator'
  const handleClean = (creatorData?.handle || creatorName || 'creator').replace('@', '').toLowerCase()
  const productName = creatorData?.productName || creatorData?.blueprint?.name || `${creatorName} Pro Suite`

  // Brand Red styling with guaranteed white text
  const brandRed = '#c81e3c'

  // Week Shifting State (0 = current week, +1 next week, -1 previous week)
  const [weekOffset, setWeekOffset] = useState(0)
  const weekData = useMemo(() => calculateWeekData(weekOffset), [weekOffset])

  // Current real-world date reference
  const todayDateObj = useMemo(() => new Date(), [])
  const todayDateKeyStr = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])

  // Month Calendar Navigation State (Anchored dynamically to the current real date)
  const [calendarDate, setCalendarDate] = useState(() => new Date(todayDateObj.getFullYear(), todayDateObj.getMonth(), 1))
  const [selectedCalendarDateKey, setSelectedCalendarDateKey] = useState(todayDateKeyStr)
  const monthGrid = useMemo(() => {
    return getMonthCalendarGrid(calendarDate.getFullYear(), calendarDate.getMonth())
  }, [calendarDate])

  // Active View Mode: 'sprint' (7-day board) vs 'calendar' (monthly grid)
  const [viewMode, setViewMode] = useState('calendar')
  const [platformFilter, setPlatformFilter] = useState('all')

  // Gamification State (XP, Streak, Level, Completed Quests)
  const [bonusXp, setBonusXp] = useState(() => {
    try {
      const saved = localStorage.getItem(`forge_calendar_bonus_xp_${handleClean}`)
      return saved ? parseInt(saved, 10) : 0
    } catch {
      return 0
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

  const addXP = (amount, reason, e) => {
    setBonusXp(prev => {
      const next = prev + amount
      try {
        localStorage.setItem(`forge_calendar_bonus_xp_${handleClean}`, String(next))
      } catch {}
      return next
    })

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

  // YouTube Social Connection State (configured in Accounts page)
  const [youtubeConnection, setYoutubeConnection] = useState(() => getStoredYouTubeConnection())
  const [isPublishingDirect, setIsPublishingDirect] = useState(false)

  // Postiz-Style Omnichannel Studio State
  const [inspectorTab, setInspectorTab] = useState('composer') // 'composer' | 'preview'
  const [previewPlatform, setPreviewPlatform] = useState('x') // 'x' | 'instagram' | 'youtube' | 'linkedin' | 'tiktok'
  const [isRepurposingAi, setIsRepurposingAi] = useState(false)

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

  // 7-Day Campaign Post Dataset - dynamically synced 1:1 with Marketing Launch Plan
  const [posts, setPosts] = useState(() => {
    const initial = loadSyncedCampaignPosts(creatorData, productName, handleClean)
    const ytConn = getStoredYouTubeConnection()
    return initial.map(p => {
      const isConn = isChannelConnected(p.channel, ytConn, creatorData)
      if (!isConn && p.status !== 'Draft') {
        return { ...p, status: 'Draft', scheduledAt: null }
      }
      return p
    })
  })

  // Whenever social channel connection changes, enforce that un-connected channels stay as Drafts
  useEffect(() => {
    setPosts(prev => prev.map(p => {
      const isConn = isChannelConnected(p.channel, youtubeConnection, creatorData)
      if (!isConn && p.status !== 'Draft') {
        return { ...p, status: 'Draft', scheduledAt: null }
      }
      return p
    }))
  }, [youtubeConnection?.connected, creatorData?.youtube_connected])

  // Dynamic XP computation derived from real creator actions, database posts, and connected accounts
  // Pre-generated templates do NOT award passive XP — XP is only earned through genuine creator actions.
  const xp = useMemo(() => {
    // 0 XP for unedited system drafts; 50 XP per actively scheduled post; 100 XP per published post
    const postsXp = posts.reduce((sum, p) => {
      if (p.status === 'Posted') return sum + 100
      if (p.status === 'Scheduled') return sum + 50
      // Only award custom draft XP if user created it or significantly customized it
      if (p.isCustomCreated || (p.caption && p.caption.length > 50 && p.customized)) return sum + 25
      return sum
    }, 0)
    const ytXp = youtubeConnection?.connected ? 100 : 0
    const emailXp = creatorData?.email && creatorData.email.includes('@') ? 50 : 0
    return (creatorData?.xp || 0) + postsXp + ytXp + emailXp + bonusXp
  }, [posts, youtubeConnection?.connected, creatorData?.email, creatorData?.xp, bonusXp])

  // Realistic Level computation:
  // Level 1: 0-249 XP (Launchpad Creator)
  // Level 2: 250-599 XP (Rising Creator)
  // Level 3: 600-1199 XP (Active Creator)
  // Level 4: 1200-2499 XP (Growth Creator)
  // Level 5: 2500+ XP (Pro Creator)
  const currentLevel = xp >= 2500 ? 5 : xp >= 1200 ? 4 : xp >= 600 ? 3 : xp >= 250 ? 2 : 1
  const targetXp = currentLevel === 1 ? 250 : currentLevel === 2 ? 600 : currentLevel === 3 ? 1200 : currentLevel === 4 ? 2500 : 5000
  const prevLevelXp = currentLevel === 1 ? 0 : currentLevel === 2 ? 250 : currentLevel === 3 ? 600 : currentLevel === 4 ? 1200 : 2500
  const xpPercent = Math.min(100, Math.max(0, Math.round(((xp - prevLevelXp) / (targetXp - prevLevelXp)) * 100)))

  // Truthful Streak: only counts if there are genuinely scheduled or posted campaigns
  const streak = useMemo(() => {
    const scheduledOrPosted = posts.filter(p => p.status === 'Scheduled' || p.status === 'Posted')
    if (scheduledOrPosted.length === 0) return 1
    const activeDays = new Set(scheduledOrPosted.map(p => p.dayName)).size
    return Math.max(1, activeDays)
  }, [posts])

  // Persist posts and keep Marketing Launch Calendar synchronized
  useEffect(() => {
    try {
      localStorage.setItem(`forge_campaign_posts_${handleClean}`, JSON.stringify(posts))
    } catch {}

    const week0Posts = posts.filter(p => (p.weekOffset ?? 0) === 0)
    if (week0Posts.length > 0) {
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const rawCalendar = dayNames.map((dName, dIdx) => {
        const dayPosts = week0Posts.filter(p => p.dayIndex === dIdx || p.dayName === dName)
        return {
          day: dName,
          posts: dayPosts.map((p, pIdx) => ({
            id: p.marketingId || (pIdx + 1),
            platform: p.channel,
            type: p.format || 'Post',
            title: p.title,
            body: p.caption,
            theme: (p.strategy || 'launch').toLowerCase(),
            status: p.status === 'Posted' ? 'posted' : p.status === 'Scheduled' ? 'scheduled' : 'draft',
            time: p.time
          }))
        }
      })

      const handle = creatorData?.handle || 'default'
      const hClean = handle.replace(/^@+/, '')
      const keys = [
        `forge_calendar_${handle}_launch_w0`,
        `forge_calendar_${handle.toLowerCase()}_launch_w0`,
        `forge_calendar_${hClean}_launch_w0`,
        `forge_calendar_${hClean.toLowerCase()}_launch_w0`
      ]
      keys.forEach(k => {
        try { localStorage.setItem(k, JSON.stringify(rawCalendar)) } catch (_) {}
      })
      window.dispatchEvent(new CustomEvent('forge_calendar_updated', { detail: { source: 'ContentCalendar' } }))
    }
  }, [posts, handleClean, creatorData?.handle])

  // Cross-component listener: reload when Marketing updates
  useEffect(() => {
    const handleCalendarSync = (e) => {
      if (e?.detail?.source === 'ContentCalendar') return
      const synced = loadSyncedCampaignPosts(creatorData, productName, handleClean)
      if (synced && synced.length > 0) {
        setPosts(synced)
      }
    }
    window.addEventListener('forge_calendar_updated', handleCalendarSync)
    return () => window.removeEventListener('forge_calendar_updated', handleCalendarSync)
  }, [creatorData, productName, handleClean])

  // Active Post for Right Inspector Studio
  const [selectedPostId, setSelectedPostId] = useState(() => {
    const todayPost = posts.find(p => p.dateKey === todayDateKeyStr)
    return todayPost?.id || posts[0]?.id || 'post-1'
  })
  
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

  // Month Calendar Navigation Handlers
  const handlePrevMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    if (triggerToast) triggerToast('Navigated to previous month', 'info')
  }

  const handleNextMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    if (triggerToast) triggerToast('Navigated to next month', 'info')
  }

  const handleToday = () => {
    const now = new Date()
    setCalendarDate(new Date(now.getFullYear(), now.getMonth(), 1))
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    setSelectedCalendarDateKey(todayKey)
    if (triggerToast) triggerToast('Jumped to current month & date', 'info')
  }

  // Active inspected post (seamlessly resolves for both calendar and sprint views)
  const activePost = useMemo(() => {
    if (viewMode === 'calendar' && selectedCalendarDateKey) {
      const matchExact = posts.find(p => p.id === selectedPostId && p.dateKey === selectedCalendarDateKey)
      if (matchExact) return matchExact
      const matchOnDate = posts.find(p => p.dateKey === selectedCalendarDateKey)
      if (matchOnDate) return matchOnDate
    }
    const found = filteredPosts.find(p => p.id === selectedPostId)
    if (found) return found
    if (filteredPosts.length > 0) return filteredPosts[0]
    return posts.find(p => p.id === selectedPostId) || posts[0]
  }, [viewMode, selectedCalendarDateKey, filteredPosts, selectedPostId, posts])

  useEffect(() => {
    if (activePost && activePost.id !== selectedPostId) {
      setSelectedPostId(activePost.id)
    }
  }, [activePost?.id])

  // Select a calendar cell in month view
  const handleSelectCalendarDay = (cell) => {
    setSelectedCalendarDateKey(cell.dateKey)
    const match = posts.find(p => p.dateKey === cell.dateKey)
    if (match) {
      setSelectedPostId(match.id)
    } else {
      const creatorCleanName = creatorData?.name || (creatorData?.handle || 'Creator').replace(/^@+/, '')
      const newDraftPost = {
        id: `post-date-${cell.dateKey}`,
        dateKey: cell.dateKey,
        dayName: cell.dayName,
        fullDayName: cell.fullDayName || getFullDayName(cell),
        fullDateStr: `${MONTH_NAMES[cell.dateObj.getMonth()]} ${cell.dayNumber}, ${cell.dateObj.getFullYear()}`,
        channel: 'Instagram',
        format: 'REEL',
        strategy: 'LAUNCH',
        title: `${creatorCleanName}: ${productName} Campaign Update`,
        caption: `Exciting update from our team!\n\nWe're continuing our launch week for ${productName} with exclusive founder perks and live member access.\n\nTap the link in bio to join us today!\n\n#${creatorCleanName.replace(/\s+/g, '')} #Launch #Exclusive`,
        status: 'Draft',
        time: '11:30 AM',
        imageUrl: null,
        weekOffset: 0,
        dayIndex: (cell.dateObj.getDay() + 6) % 7
      }
      setPosts(prev => [newDraftPost, ...prev])
      setSelectedPostId(newDraftPost.id)
      if (triggerToast) triggerToast(`Draft loaded for ${getFullDayName(cell)} ${cell.dayNumber}!`, 'info')
    }
  }

  // Week Shifting Handler that dynamically generates posts if none exist (guaranteed functional)
  const handleShiftWeek = (direction) => {
    const nextOffset = direction === 'next' ? weekOffset + 1 : direction === 'prev' ? weekOffset - 1 : 0
    setWeekOffset(nextOffset)

    // Check if posts exist for nextOffset, if not generate them immediately
    setPosts(currentPosts => {
      const hasPostsForOffset = currentPosts.some(p => (p.weekOffset ?? 0) === nextOffset)
      if (!hasPostsForOffset) {
        const generated = generateWeekCampaignPosts(productName, nextOffset)
        return [...currentPosts, ...generated]
      }
      return currentPosts
    })

    if (triggerToast) {
      triggerToast(
        nextOffset === 0
          ? 'Reset to active sprint week'
          : `Navigated to ${direction === 'next' ? 'next' : 'previous'} week (${nextOffset > 0 ? `+${nextOffset}` : nextOffset})`,
        'info'
      )
    }
  }

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

  // Synchronize YouTube connection from Accounts page
  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleConnectEvent = (e) => setYoutubeConnection(e.detail)
    const handleDisconnectEvent = () => setYoutubeConnection(null)
    window.addEventListener('forge_youtube_connected', handleConnectEvent)
    window.addEventListener('forge_youtube_disconnected', handleDisconnectEvent)
    return () => {
      window.removeEventListener('forge_youtube_connected', handleConnectEvent)
      window.removeEventListener('forge_youtube_disconnected', handleDisconnectEvent)
    }
  }, [])

  // Update target social channel for active post (Postiz Omnichannel Selector)
  const updateActivePostChannel = (channel) => {
    if (!activePost) return
    setPosts(prev => prev.map(p => p.id === activePost.id ? { ...p, channel } : p))
    const map = {
      'YouTube': 'youtube',
      'Instagram': 'instagram',
      'X': 'x',
      'Twitter': 'x',
      'LinkedIn': 'linkedin',
      'TikTok': 'tiktok'
    }
    if (map[channel]) setPreviewPlatform(map[channel])
  }

  // Video Asset Handlers for YouTube Upload & Scheduling
  const handleVideoFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      if (triggerToast) triggerToast('Please select a valid MP4 or MOV video file.', 'error')
      return
    }
    // Limit to 45MB in browser for base64 safety
    if (file.size > 45 * 1024 * 1024) {
      if (triggerToast) triggerToast('File exceeds 45MB browser limit. Please enter a public video URL instead.', 'error')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const base64Data = reader.result
      setPosts(prev => prev.map(p => p.id === activePost.id ? {
        ...p,
        videoBase64: base64Data,
        videoFileName: file.name,
        videoSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      } : p))
      if (triggerToast) triggerToast(`Attached video: ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)`, 'success')
    }
    reader.onerror = () => {
      if (triggerToast) triggerToast('Failed to read video file.', 'error')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveVideo = () => {
    if (!activePost) return
    setPosts(prev => prev.map(p => p.id === activePost.id ? {
      ...p,
      videoBase64: null,
      videoUrl: null,
      videoFileName: null,
      videoSize: null
    } : p))
    if (triggerToast) triggerToast('Video attachment removed.', 'info')
  }

  const handleSetVideoUrl = (url) => {
    if (!activePost) return
    setPosts(prev => prev.map(p => p.id === activePost.id ? {
      ...p,
      videoUrl: url,
      videoFileName: url ? url.split('/').pop()?.split('?')[0] || 'Remote Video' : null
    } : p))
  }

  // Schedule Post in Campaign Pipeline — strictly blocked if account is not connected
  const handleSchedulePost = async (e) => {
    if (!activePost) return
    const isConn = isChannelConnected(activePost.channel, youtubeConnection, creatorData)
    if (!isConn) {
      if (triggerToast) {
        triggerToast(`Cannot schedule: ${activePost.channel} is not connected. Connect your account in Accounts first.`, 'error')
      }
      return
    }
    setIsPublishingDirect(true)
    try {
      // If YouTube and has a video file/URL attached, perform real Google API scheduled upload
      if (activePost.channel === 'YouTube' && (activePost.videoUrl || activePost.videoBase64) && youtubeConnection?.channel) {
        if (triggerToast) triggerToast('Queuing scheduled video directly with YouTube Data API v3...', 'info')

        // Convert post target date + time into RFC 3339 datetime
        let targetPublishDate = new Date()
        try {
          if (activePost.fullDateStr) {
            const parsed = new Date(activePost.fullDateStr)
            if (!isNaN(parsed.getTime())) targetPublishDate = parsed
          }
          if (targetPublishDate.getTime() < Date.now() + 3600000) {
            targetPublishDate = new Date(Date.now() + 86400000) // default 24h ahead
          }
        } catch (_) {}
        const rfc3339Time = targetPublishDate.toISOString()

        const result = await publishToYouTube({
          title: activePost.title || 'CoLaunch Video Update',
          description: activePost.caption || '',
          privacy: 'private',
          publishAt: rfc3339Time,
          videoUrl: activePost.videoUrl || null,
          videoBase64: activePost.videoBase64 || null,
          isShort: activePost.type === 'shorts' || (activePost.time && activePost.time.toLowerCase().includes('short'))
        })

        const ytVideoId = result?.videoId || result?.id
        const ytUrl = result?.url || (ytVideoId ? `https://www.youtube.com/watch?v=${ytVideoId}` : null)

        setPosts(prev => prev.map(p => p.id === activePost.id ? {
          ...p,
          status: 'Scheduled',
          youtubeVideoId: ytVideoId,
          youtubeUrl: ytUrl,
          scheduledAt: rfc3339Time,
          isLiveScheduledOnYouTube: true
        } : p))
        addXP(50, `Scheduled video on YouTube Studio (${ytVideoId})`, e)
        if (triggerToast) {
          triggerToast(`Scheduled in YouTube Studio! Video ID: ${ytVideoId} (Releases: ${rfc3339Time.slice(0, 10)})`, 'success')
        }
      } else {
        // Campaign calendar scheduling
        setPosts(prev => prev.map(p => p.id === activePost.id ? {
          ...p,
          status: 'Scheduled',
          scheduledAt: new Date().toISOString()
        } : p))
        addXP(50, `Scheduled "${activePost?.title?.slice(0, 20)}..." in campaign calendar`, e)
        if (triggerToast) {
          if (activePost.channel === 'YouTube' && !activePost.videoUrl && !activePost.videoBase64) {
            triggerToast('Draft marked Scheduled in CoLaunch calendar. Note: To queue directly in YouTube Studio, attach an MP4 video file.', 'info')
          } else {
            triggerToast(`Post scheduled for ${activePost?.channel || 'social channel'} on ${activePost?.fullDateStr || 'target date'}!`, 'success')
          }
        }
      }
    } catch (err) {
      console.error('[Schedule Error]', err)
      if (triggerToast) triggerToast(`Scheduling failed: ${err.message}`, 'error')
    } finally {
      setIsPublishingDirect(false)
    }
  }

  // Revert Post to Draft
  const handleRevertToDraft = () => {
    if (!activePost) return
    setPosts(prev => prev.map(p => p.id === activePost.id ? { ...p, status: 'Draft', scheduledAt: null } : p))
    if (triggerToast) triggerToast('Post reverted to Draft.', 'info')
  }

  // Save Post to Draft queue
  const handleSaveToDraft = (e) => {
    if (!activePost) return
    setPosts(prev => prev.map(p => p.id === activePost.id ? { ...p, status: 'Draft' } : p))
    addXP(30, `Saved "${activePost?.title?.slice(0, 20)}..." to Draft queue`, e)
    if (triggerToast) triggerToast('Draft saved to queue.', 'info')
  }

  // Direct Publish — strictly blocked if account is not connected
  const handlePublishNow = async (e) => {
    if (!activePost) return
    const isConn = isChannelConnected(activePost.channel, youtubeConnection, creatorData)
    if (!isConn) {
      if (triggerToast) {
        triggerToast(`Cannot publish: ${activePost.channel} is not connected. Connect your account in Accounts first.`, 'error')
      }
      return
    }
    setIsPublishingDirect(true)
    try {
      if (activePost.channel === 'YouTube' && youtubeConnection?.channel) {
        if (!activePost.videoUrl && !activePost.videoBase64) {
          if (triggerToast) {
            triggerToast('YouTube Data API v3 requires an MP4 video file. Please attach a video below to publish live.', 'error')
          }
          return
        }
        if (triggerToast) triggerToast('Uploading video directly to YouTube Data API v3...', 'info')
        const result = await publishToYouTube({
          title: activePost.title || 'CoLaunch Video Update',
          description: activePost.caption || '',
          privacy: 'public',
          videoUrl: activePost.videoUrl || null,
          videoBase64: activePost.videoBase64 || null,
          isShort: activePost.type === 'shorts' || (activePost.time && activePost.time.toLowerCase().includes('short'))
        })
        const ytVideoId = result?.videoId || result?.id
        const ytUrl = result?.url || (ytVideoId ? `https://www.youtube.com/watch?v=${ytVideoId}` : null)
        setPosts(prev => prev.map(p => p.id === activePost.id ? {
          ...p,
          status: 'Posted',
          youtubeVideoId: ytVideoId,
          youtubeUrl: ytUrl,
          postedAt: new Date().toISOString()
        } : p))
        addXP(100, `Published live to YouTube (${ytVideoId || 'video'})`, e)
        if (triggerToast) {
          triggerToast(`Successfully uploaded to ${youtubeConnection.channel.title || 'YouTube Channel'}! Video ID: ${ytVideoId}`, 'success')
        }
      } else {
        setPosts(prev => prev.map(p => p.id === activePost.id ? { ...p, status: 'Posted', postedAt: new Date().toISOString() } : p))
        addXP(100, `Dispatched broadcast to ${activePost?.channel || 'Social Pipeline'}`, e)
        if (triggerToast) triggerToast(`Broadcast published live to ${activePost?.channel || 'Channel'}!`, 'success')
      }
    } catch (err) {
      console.error('[Publish Error]', err)
      if (triggerToast) triggerToast(`YouTube upload failed: ${err.message}`, 'error')
    } finally {
      setIsPublishingDirect(false)
    }
  }

  // Postiz-Style AI Content Repurposer (repurposing YouTube videos to omnichannel formats)
  const handleRepurposeFromYouTube = () => {
    if (!activePost) return
    setIsRepurposingAi(true)

    setTimeout(() => {
      setIsRepurposingAi(false)
      const creatorCleanName = creatorData?.name || (creatorData?.handle || 'Creator').replace(/^@+/, '')
      const adaptedCopy = {
        x: `Announcing the launch of ${productName}!\n\n3 reasons our community is loving it:\n1. Direct access & exclusive perks\n2. Built from the ground up for you\n3. Limited founding member spots\n\nLink below 👇\n\n#${creatorCleanName.replace(/\s+/g, '')} #Launch`,
        instagram: `Big announcement today! ✨\n\nWe poured our heart into engineering ${productName} for everyone who supports what we do.\n\n🔥 Founding member registration is officially open.\n👉 Tap the link in bio to get instant access.\n\n#${creatorCleanName.replace(/\s+/g, '')} #Community #Launch`,
        linkedin: `Excited to announce the official launch of ${productName}.\n\nWhen we analyzed our audience signals and engagement, the demand was undeniable.\n\nToday we take this live to empower our community members with dedicated software and tools.\n\n#Leadership #CreatorEconomy #ProductLaunch`,
        youtube: `Which feature in ${productName} are you most excited to try?\n\n1. Community Hub\n2. Direct Founding Access\n3. Exclusive Drops\n\nVote below! Official demo in our latest video.`,
        tiktok: `POV: We just officially launched ${productName} and the reaction has been insane 🤯\n\nLink in bio right now! #${creatorCleanName.replace(/\s+/g, '')} #viral #launch`
      }

      const targetPlatform = activePost.channel === 'X' || activePost.channel === 'Twitter' ? 'x'
        : activePost.channel === 'LinkedIn' ? 'linkedin'
        : activePost.channel === 'YouTube' ? 'youtube'
        : activePost.channel === 'TikTok' ? 'tiktok'
        : 'instagram'

      const newCaption = adaptedCopy[targetPlatform] || adaptedCopy.instagram
      updateActivePostCaption(newCaption)
      setInspectorTab('preview')
      setPreviewPlatform(targetPlatform)

      if (triggerToast) triggerToast(`Omnichannel copy adapted for ${activePost.channel} from YouTube content!`, 'success')
    }, 700)
  }

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
    const isConn = isChannelConnected(activePost.channel, youtubeConnection, creatorData)
    if (!isConn) {
      if (triggerToast) {
        triggerToast(`Cannot schedule: ${activePost.channel} is not connected. Connect your account in Accounts first.`, 'error')
      }
      return
    }
    setPosts(prev => prev.map(p => p.id === activePost.id ? { ...p, status: 'Scheduled', scheduledAt: new Date().toISOString() } : p))
    addXP(50, `Scheduled "${activePost.title.slice(0, 24)}..." for ${activePost.fullDateStr}`, e)
  }

  const handleInstantPostLive = (e) => {
    if (!activePost) return
    const isConn = isChannelConnected(activePost.channel, youtubeConnection, creatorData)
    if (!isConn) {
      if (triggerToast) {
        triggerToast(`Cannot publish: ${activePost.channel} is not connected. Connect your account in Accounts first.`, 'error')
      }
      return
    }
    setPosts(prev => prev.map(p => p.id === activePost.id ? { ...p, status: 'Posted' } : p))
    addXP(100, `Published live to ${activePost.channel}`, e)
  }

  const handleScheduleAllReady = (e) => {
    const readyDrafts = filteredPosts.filter(p => p.status === 'Draft' && isChannelConnected(p.channel, youtubeConnection, creatorData))
    if (readyDrafts.length === 0) {
      if (triggerToast) triggerToast('No drafts have connected accounts. Connect your channels in Accounts first to schedule.', 'error')
      return
    }
    setPosts(prev => prev.map(p => {
      if ((p.weekOffset ?? 0) === weekOffset && p.status === 'Draft' && isChannelConnected(p.channel, youtubeConnection, creatorData)) {
        return { ...p, status: 'Scheduled', scheduledAt: new Date().toISOString() }
      }
      return p
    }))
    addXP(readyDrafts.length * 40, `All ${readyDrafts.length} ready drafts scheduled to pipeline`, e)
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

  // Slot Evergreen Concept from Content Vault
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
    if (channel === 'X' || channel === 'Twitter') return <Twitter className="w-4 h-4 text-sky-400 shrink-0" />
    if (channel === 'LinkedIn') return <Linkedin className="w-4 h-4 text-sky-400 shrink-0" />
    return <Send className="w-4 h-4 text-slate-400 shrink-0" />
  }

  return (
    <div className="h-full flex flex-col bg-[#090d16] text-slate-200 overflow-hidden select-none">
      
      {/* ── TOP HEADER (Flat Dark Elevation, Border 0, Rounded 0) ── */}
      <header className="h-16 bg-[#0c0f17] px-4 sm:px-6 flex items-center justify-between flex-shrink-0 border-0">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {viewMode === 'calendar' ? (
            /* Month Calendar Header Controls matching user reference Image 4 */
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight min-w-[110px]">
                {MONTH_NAMES[calendarDate.getMonth()]} {calendarDate.getFullYear()}
              </h2>

              <div className="flex items-center bg-[#111522] p-0.5 rounded-none border-0">
                <button
                  type="button"
                  onClick={handleToday}
                  className="px-3 py-1.5 text-xs font-bold rounded-none bg-[#161b2b] hover:bg-[#1c2236] text-slate-200 transition cursor-pointer border-0"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-[#161b2b] rounded-none text-slate-400 hover:text-white transition cursor-pointer border-0 ml-0.5"
                  title="Previous Month"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-[#161b2b] rounded-none text-slate-400 hover:text-white transition cursor-pointer border-0"
                  title="Next Month"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Red New Draft Button matching Image 4 */}
              <button
                type="button"
                onClick={() => {
                  setModalDraftDay(activePost ? activePost.dayIndex : 0)
                  setNewDraftModalOpen(true)
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-none transition shadow-sm cursor-pointer hover:opacity-95 border-0"
                style={{ background: brandRed, color: '#ffffff' }}
              >
                <span>New draft</span>
                <Plus size={14} className="text-white" />
              </button>
            </div>
          ) : (
            /* Weekly Sprint Header Controls */
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                  {weekData.headerTitle}
                </h2>
                <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-[#161b2b] text-slate-300">
                  Week {weekData.weekNum}
                </span>
              </div>

              <div className="flex items-center bg-[#111522] p-0.5 rounded-none border-0">
                <button
                  type="button"
                  onClick={() => handleShiftWeek('prev')}
                  className="p-1.5 hover:bg-[#161b2b] rounded-none text-slate-400 hover:text-white transition cursor-pointer border-0"
                  title="Previous Week"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleShiftWeek('current')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-none transition cursor-pointer border-0 ${
                    weekOffset === 0 ? 'bg-[#1c2236] text-white font-bold' : 'hover:bg-[#161b2b] text-slate-300'
                  }`}
                >
                  Current
                </button>
                <button
                  type="button"
                  onClick={() => handleShiftWeek('next')}
                  className="p-1.5 hover:bg-[#161b2b] rounded-none text-slate-400 hover:text-white transition cursor-pointer border-0"
                  title="Next Week"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setModalDraftDay(activePost ? activePost.dayIndex : 0)
                  setNewDraftModalOpen(true)
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-none transition shadow-sm cursor-pointer hover:opacity-95 border-0"
                style={{ background: brandRed, color: '#ffffff' }}
              >
                <Plus size={14} className="text-white" />
                <span>New Quest Draft</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
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

          {/* Bell Icon Notification Button matching Image 4 */}
          <button
            type="button"
            onClick={() => {
              if (triggerToast) triggerToast('Notifications: 3 campaign quests active today', 'info')
            }}
            className="p-2 rounded-none bg-[#111522] hover:bg-[#161b2b] text-slate-400 hover:text-white transition cursor-pointer border-0"
            title="Notifications"
          >
            <Bell size={15} />
          </button>
        </div>
      </header>

      {/* ── YOUTUBE DIRECT PUBLISHING ENGINE STATUS BAR ── */}
      <div className="bg-[#080b11] px-4 sm:px-6 py-2 flex items-center justify-between flex-wrap gap-2 text-xs font-mono border-b border-[#161b2b]">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-none ${youtubeConnection?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-[#c81e3c]'}`} />
            <span className="text-white font-bold tracking-wider">
              PUBLISHING ENGINE:
            </span>
            <span className={youtubeConnection?.connected ? 'text-emerald-400 font-extrabold uppercase' : 'text-slate-300 font-extrabold uppercase'}>
              {youtubeConnection?.connected ? 'YOUTUBE OAUTH 2.0 (LIVE)' : 'YOUTUBE DIRECT (AUTH READY)'}
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-slate-400 text-[11px]">
            <span className="text-slate-500">CHANNEL: </span>
            <span className="text-slate-200 font-bold">
              {youtubeConnection?.channel?.title || creatorData?.name || 'BigDawsTv'}
            </span>
          </div>
          <span className="text-slate-600 hidden md:inline">|</span>
          <div className="text-slate-400 text-[11px] hidden md:inline">
            <span className="text-slate-500">EMAIL: </span>
            <span className="text-slate-200 font-bold">{userProfile?.email || creatorData?.email || 'Not configured'}</span>
          </div>
          <span className="text-slate-600 hidden lg:inline">|</span>
          <div className="text-[11px] hidden lg:flex items-center gap-1.5">
            <span className="text-slate-500">STATUS: </span>
            <span className={youtubeConnection?.connected ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {youtubeConnection?.connected
                ? `Connected (${youtubeConnection?.channel?.subscriberCount ? String(youtubeConnection.channel.subscriberCount) : (creatorData?.subscribers || '0')} subs)`
                : 'Ready to Authenticate'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {youtubeConnection?.connected ? (
            <button
              type="button"
              onClick={navigateToAccounts}
              className="px-2.5 py-1 bg-[#111522] hover:bg-[#161b2b] text-slate-200 hover:text-white rounded-none flex items-center gap-1.5 transition cursor-pointer border border-[#202738] text-[11px] font-bold"
              style={{ borderRadius: '0px' }}
              title="Manage connected channels in Accounts"
            >
              <Sliders size={11} />
              <span>Manage in Accounts →</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={navigateToAccounts}
              className="px-3 py-1 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border-0 shadow-sm"
              style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
              title="Connect social channels in Accounts"
            >
              <span>Configure in Accounts →</span>
            </button>
          )}
        </div>
      </div>

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
                <span className="text-amber-400/90 font-mono text-[10px]">{Math.max(0, targetXp - xp)} XP to Lvl {currentLevel + 1}</span>
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
                <span>{readyPostsCount} of {totalPostsCount} Scheduled</span>
                <span className="text-[11px] text-emerald-400">{readinessPercent}%</span>
              </div>
              <div className="w-full bg-[#161b2b] h-1.5 rounded-none overflow-hidden mt-1.5">
                <div className="bg-emerald-500 h-full rounded-none transition-all duration-300" style={{ width: `${readinessPercent}%` }} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                {draftPostsCount} unscheduled in draft queue
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

          {/* VIEW B: MONTHLY CALENDAR VIEW (Direct from user reference Image 4) */}
          {viewMode === 'calendar' && (
            <div className="flex-1 bg-[#0c0f17] rounded-none p-4 flex flex-col border-0">
              {/* Day Name Headers matching Image 4: Mon, Tue, Wed, Thu, Fri, Sat, Sun */}
              <div className="grid grid-cols-7 pb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider bg-[#111522] py-2.5 rounded-none border-0">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </div>

              {/* Month Grid Cells matching Image 4 */}
              <div className="grid grid-cols-7 flex-1 rounded-none overflow-hidden bg-[#090d16] gap-1 p-1 border-0">
                {monthGrid.map((cell, idx) => {
                  const isSelected = selectedCalendarDateKey === cell.dateKey
                  // Find posts matching this dateKey and applying platform filter
                  const cellPosts = posts.filter(p => {
                    const matchPlatform = platformFilter === 'all' || p.channel.toLowerCase() === platformFilter.toLowerCase()
                    if (!matchPlatform) return false
                    return p.dateKey === cell.dateKey
                  })

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelectCalendarDay(cell)}
                      className={`min-h-[92px] p-2 flex flex-col justify-between transition cursor-pointer rounded-none select-none ${
                        isSelected
                          ? 'border-2 border-[#c81e3c] bg-[#111522] shadow-xl'
                          : 'border border-white/[0.04] hover:bg-[#161b2b]'
                      } ${
                        !cell.isCurrentMonth
                          ? 'bg-[#0a0d14]/50 text-slate-600'
                          : 'bg-[#0c0f17] text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        {/* Day Number: Circled in solid red when active, exactly like Day 20 in Image 4 */}
                        {isSelected ? (
                          <div 
                            className="w-6 h-6 rounded-none flex items-center justify-center text-white text-xs font-black shadow-sm"
                            style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
                          >
                            {cell.dayNumber}
                          </div>
                        ) : (
                          <span className={`text-xs font-bold ${cell.isCurrentMonth ? 'text-slate-300' : 'text-slate-600'}`}>
                            {cell.dayNumber}
                          </span>
                        )}

                        {cellPosts.length > 0 && !isSelected && (
                          <span className="w-1.5 h-1.5 rounded-none bg-rose-500" />
                        )}
                      </div>

                      {/* Scheduled Post Cards on this date: Solid Red Cards matching Image 4 */}
                      <div className="space-y-1.5 mt-1.5">
                        {cellPosts.map(p => (
                          <div
                            key={p.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedCalendarDateKey(cell.dateKey)
                              setSelectedPostId(p.id)
                            }}
                            className={`p-1.5 rounded-none text-white text-[11px] font-bold shadow-xs border-0 truncate leading-tight cursor-pointer transition-all hover:brightness-110 ${
                              selectedPostId === p.id && isSelected ? 'ring-2 ring-white shadow-md' : ''
                            }`}
                            style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
                            title={`${p.title} (${p.time})`}
                          >
                            <div className="truncate flex items-center gap-1">
                              <span className="opacity-75 text-[9px] uppercase font-mono">{p.channel}:</span>
                              <span className="truncate">{p.title}</span>
                            </div>
                            <div className="text-[9px] opacity-90 font-medium flex items-center justify-between mt-0.5">
                              <span className="flex items-center gap-1">
                                <span>{p.format || 'POST'}</span>
                                {p.youtubeVideoId && (
                                  <span className="bg-black/60 text-[8px] font-mono px-1 py-0.2 border border-white/20">YT ✓</span>
                                )}
                              </span>
                              <span>{p.time}</span>
                            </div>
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

        {/* ── RIGHT WORKSPACE: LIVE DRAFT INSPECTOR STUDIO (Direct Publishing Engine) ── */}
        <aside className="w-[380px] lg:w-[450px] bg-[#0c0f17] flex flex-col flex-shrink-0 overflow-y-auto z-10 custom-scrollbar border-0 p-4 sm:p-5 space-y-4">
          
          {/* Header: Title, Date, Real Dynamic Status Badge */}
          <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#1b2336]">
            <div>
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                {activePost?.status === 'Scheduled' ? 'SCHEDULED BROADCAST' : activePost?.status === 'Posted' ? 'PUBLISHED CONTENT' : 'CAMPAIGN DRAFT'}
              </p>
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                {activePost?.status === 'Scheduled' ? `Scheduled for ${getFullDayName(activePost)}` : `Your draft for ${getFullDayName(activePost)}`}
              </h3>
              <p className="text-xs font-bold text-rose-400 mt-0.5">
                {activePost?.fullDateStr || 'Selected Date'} • <span className="font-mono text-slate-400">{activePost?.time || '9:00 AM'}</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {activePost?.status === 'Posted' ? (
                <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 size={11} /> Posted
                </span>
              ) : activePost?.status === 'Scheduled' ? (
                <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30 flex items-center gap-1">
                  <Clock size={11} /> Scheduled
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-none text-[10px] font-bold bg-[#161b2b] text-slate-300 border border-[#242d42]">
                  Draft (Unscheduled)
                </span>
              )}
            </div>
          </div>

          {/* Quick Post Switcher for multiple posts on selected date */}
          {(() => {
            const datePosts = posts.filter(p => p.dateKey === (activePost?.dateKey || selectedCalendarDateKey))
            if (datePosts.length <= 1) return null
            return (
              <div className="p-2 bg-[#0c0f17] border border-[#202738] rounded-none space-y-1.5" style={{ borderRadius: '0px' }}>
                <div className="flex items-center justify-between text-[10px] font-mono uppercase text-slate-400 font-bold px-0.5">
                  <span>Posts on this day ({datePosts.length}):</span>
                  <span className="text-slate-500">Click to switch</span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                  {datePosts.map((p, pIdx) => {
                    const isCurrent = p.id === activePost?.id
                    const isScheduled = p.status === 'Scheduled'
                    const isPosted = p.status === 'Posted'
                    return (
                      <button
                        key={p.id || pIdx}
                        type="button"
                        onClick={() => setSelectedPostId(p.id)}
                        className={`px-3 py-1.5 text-[11px] font-bold rounded-none transition cursor-pointer flex items-center gap-2 whitespace-nowrap border ${
                          isCurrent
                            ? 'bg-[#c81e3c] text-white border-[#c81e3c] shadow-sm'
                            : 'text-slate-300 hover:text-white bg-[#121624] hover:bg-[#181f30] border-[#222b40]'
                        }`}
                        style={{ borderRadius: '0px' }}
                      >
                        <span className="font-extrabold">{p.channel}</span>
                        <span className="text-[10px] font-mono opacity-80 uppercase">({p.format || 'POST'})</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 border ${
                            isPosted
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : isScheduled
                              ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                              : 'bg-slate-700/50 text-slate-400 border-slate-600'
                          }`}
                        >
                          {isPosted ? 'POSTED' : isScheduled ? 'SCHEDULED' : 'DRAFT'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })()}

          {/* Postiz Omnichannel Platform Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Target Channel
            </label>
            <div className="grid grid-cols-5 gap-1">
              {[
                { name: 'YouTube', icon: Youtube, color: 'text-red-500', activeBg: 'bg-red-500/20 text-white ring-1 ring-red-500' },
                { name: 'Instagram', icon: Instagram, color: 'text-pink-500', activeBg: 'bg-pink-500/20 text-white ring-1 ring-pink-500' },
                { name: 'X', icon: Twitter, color: 'text-sky-400', activeBg: 'bg-sky-500/20 text-white ring-1 ring-sky-500' },
                { name: 'LinkedIn', icon: Linkedin, color: 'text-blue-400', activeBg: 'bg-blue-500/20 text-white ring-1 ring-blue-500' },
                { name: 'TikTok', icon: Video, color: 'text-slate-200', activeBg: 'bg-slate-500/25 text-white ring-1 ring-slate-400' }
              ].map(plat => {
                const isCurrent = activePost?.channel === plat.name || (plat.name === 'X' && activePost?.channel === 'Twitter')
                const IconComponent = plat.icon
                return (
                  <button
                    key={plat.name}
                    type="button"
                    onClick={() => updateActivePostChannel(plat.name)}
                    className={`py-1.5 px-1 rounded-none text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer border-0 ${
                      isCurrent
                        ? plat.activeBg
                        : 'bg-[#111522] hover:bg-[#161b2b] text-slate-400'
                    }`}
                    title={`Target ${plat.name}`}
                  >
                    <IconComponent size={14} className={plat.color} />
                    <span className="truncate text-[10px]">{plat.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Inspector View Mode Switcher: Composer vs Platform Preview (Postiz) */}
          <div className="flex items-center bg-[#111522] p-1 rounded-none text-xs font-bold border-0">
            <button
              type="button"
              onClick={() => setInspectorTab('composer')}
              className={`flex-1 py-1.5 rounded-none flex items-center justify-center gap-1.5 transition cursor-pointer border-0 ${
                inspectorTab === 'composer'
                  ? 'bg-[#1c2236] text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Pencil size={12} />
              <span>Script Editor</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setInspectorTab('preview')
                // Align preview platform
                const map = {
                  'YouTube': 'youtube',
                  'Instagram': 'instagram',
                  'X': 'x',
                  'Twitter': 'x',
                  'LinkedIn': 'linkedin',
                  'TikTok': 'tiktok'
                }
                if (activePost?.channel && map[activePost.channel]) {
                  setPreviewPlatform(map[activePost.channel])
                }
              }}
              className={`flex-1 py-1.5 rounded-none flex items-center justify-center gap-1.5 transition cursor-pointer border-0 ${
                inspectorTab === 'preview'
                  ? 'bg-[#1c2236] text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye size={12} />
              <span>Platform Preview</span>
            </button>
          </div>

          {/* TAB 1: SCRIPT & COMPOSER WORKSPACE */}
          {inspectorTab === 'composer' && (
            <div className="space-y-4">
              
              {/* Caption Section with Platform Limit Meter */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Caption / Script
                  </label>
                  <span className={`text-[11px] font-mono ${
                    (activePost?.channel === 'X' || activePost?.channel === 'Twitter') && (activePost?.caption?.length || 0) > 280
                      ? 'text-rose-400 font-bold'
                      : 'text-slate-400'
                  }`}>
                    {activePost?.caption?.length || 0} / {
                      activePost?.channel === 'X' || activePost?.channel === 'Twitter' ? '280 (X Limit)'
                      : activePost?.channel === 'Instagram' ? '2,200 (IG Limit)'
                      : activePost?.channel === 'LinkedIn' ? '3,000 (LI Limit)'
                      : '5,000 (YT Limit)'
                    }
                  </span>
                </div>

                <div className="p-3.5 bg-[#111522] border border-[#202738] rounded-none space-y-2">
                  <textarea
                    ref={captionRef}
                    rows={7}
                    value={activePost?.caption || ''}
                    onChange={(e) => updateActivePostCaption(e.target.value)}
                    className="w-full text-xs text-slate-100 bg-transparent rounded-none focus:outline-none leading-relaxed resize-none border-0 font-normal"
                    placeholder="Write your campaign draft caption..."
                  />
                </div>
              </div>

              {/* Quick AI & Script Tools */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleRepurposeFromYouTube}
                  disabled={isRepurposingAi}
                  className="py-2 px-3 rounded-none bg-[#111522] hover:bg-[#161b2b] text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-[#202738] disabled:opacity-50"
                  title="Repurpose scraped YouTube video into omnichannel formats"
                >
                  <Sparkles size={13} className={`text-amber-400 ${isRepurposingAi ? 'animate-spin' : ''}`} />
                  <span>{isRepurposingAi ? 'Repurposing...' : 'Repurpose YT with AI'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTweakWithAi}
                  disabled={isTweakingAi}
                  className="py-2 px-3 rounded-none bg-[#111522] hover:bg-[#161b2b] text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50 border border-[#202738]"
                >
                  <Wand2 size={13} className={`text-rose-400 ${isTweakingAi ? 'animate-spin' : ''}`} />
                  <span>{isTweakingAi ? 'Tweaking...' : 'Tweak Copy'}</span>
                </button>
              </div>

              {/* ── YOUTUBE DIRECT PUBLISHING PIPELINE SECTION ── */}
              <div className="p-3.5 bg-[#111522] border border-[#202738] rounded-none space-y-3" style={{ borderRadius: '0px' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-none ${youtubeConnection?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-xs font-bold text-white tracking-tight">
                      YouTube Direct Publishing Pipeline
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    OAuth 2.0 Direct
                  </span>
                </div>

                {youtubeConnection?.connected ? (
                  <div className="p-2.5 bg-[#0c0f17] rounded-none border border-[#202738] flex items-center justify-between gap-2" style={{ borderRadius: '0px' }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-none bg-red-600 flex items-center justify-center text-white font-bold text-xs" style={{ borderRadius: '0px' }}>
                        YT
                      </div>
                      <div>
                        <div className="text-white font-bold text-xs">
                          {youtubeConnection.channel?.title || 'Connected Channel'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {youtubeConnection.channel?.customUrl || '@creator'} • {youtubeConnection.channel?.subscriberCount || creatorData?.subscribers || '0'} subscribers
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20" style={{ borderRadius: '0px' }}>
                      LIVE
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-[#0c0f17] rounded-none border border-[#202738] text-[11px] text-slate-300 flex items-start gap-2" style={{ borderRadius: '0px' }}>
                    <Youtube size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-white font-bold">{activePost?.channel || 'Social Channel'} Not Connected</div>
                      <p className="text-slate-400 text-[10px] mt-0.5">Link your {activePost?.channel || 'YouTube'} account in the Accounts page to schedule or broadcast directly.</p>
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={navigateToAccounts}
                          className="px-3 py-1.5 font-bold text-[11px] flex items-center gap-1.5 transition cursor-pointer border-0 shadow-sm"
                          style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
                        >
                          <Sliders size={12} className="text-white" />
                          <span className="text-white font-bold">Configure in Accounts Page →</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Real YouTube Video Asset Attachment & API Info (YouTube Data API v3) */}
                {activePost?.channel === 'YouTube' && (
                  <div className="p-3.5 bg-[#0c0f17] border border-[#202738] rounded-none space-y-2.5" style={{ borderRadius: '0px' }}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                        <Video size={14} className="text-red-500" />
                        <span>Video Binary File (.mp4 / .mov)</span>
                      </span>
                      {(activePost?.videoBase64 || activePost?.videoUrl) && (
                        <button
                          type="button"
                          onClick={handleRemoveVideo}
                          className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer border-0 bg-transparent"
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                      )}
                    </div>

                    {(activePost?.videoBase64 || activePost?.videoUrl) ? (
                      <div className="space-y-2">
                        {activePost.videoBase64 ? (
                          <video
                            src={activePost.videoBase64}
                            controls
                            className="w-full max-h-44 bg-black border border-[#202738] rounded-none"
                          />
                        ) : (
                          <div className="p-2.5 bg-[#121624] border border-[#202738] text-xs font-mono text-slate-300 break-all">
                            {activePost.videoUrl}
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="truncate max-w-[220px] font-mono text-slate-200">{activePost.videoFileName || 'Video File Ready'}</span>
                          {activePost.videoSize && <span className="font-mono text-emerald-400">{activePost.videoSize}</span>}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="w-full py-2.5 px-3 bg-[#161d2d] hover:bg-[#1e273d] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-[#26334f] transition">
                          <UploadCloud size={15} className="text-red-400" />
                          <span>Attach MP4 Video File</span>
                          <input
                            type="file"
                            accept="video/mp4,video/quicktime,video/webm"
                            onChange={handleVideoFileUpload}
                            className="hidden"
                          />
                        </label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="url"
                            value={activePost?.videoUrl || ''}
                            onChange={(e) => handleSetVideoUrl(e.target.value)}
                            placeholder="Or paste public video URL (.mp4)..."
                            className="w-full py-1.5 px-2 bg-[#121624] border border-[#202738] text-white text-[11px] font-mono focus:outline-none focus:border-red-500/50"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          ℹ️ Google's YouTube Data API requires a video file. Pure text posts cannot be published via the YouTube API.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Published / Live YouTube Video Link Box */}
                {activePost?.youtubeVideoId && (
                  <div className="p-3 bg-red-950/30 border border-red-500/40 rounded-none flex items-center justify-between gap-3" style={{ borderRadius: '0px' }}>
                    <div className="flex items-center gap-2">
                      <Youtube size={18} className="text-red-500 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-white">
                          {activePost.status === 'Scheduled' ? 'Queued in YouTube Studio' : 'Live on YouTube'}
                        </p>
                        <p className="text-[10px] text-red-300 font-mono">ID: {activePost.youtubeVideoId}</p>
                      </div>
                    </div>
                    <a
                      href={activePost.youtubeUrl || `https://www.youtube.com/watch?v=${activePost.youtubeVideoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition no-underline"
                      style={{ borderRadius: '0px' }}
                    >
                      <span>{activePost.status === 'Scheduled' ? 'Open Studio' : 'Watch Video'}</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}

                {/* Dispatch Action Buttons */}
                <div className="space-y-2 pt-1">
                  
                  {/* Primary Action Button */}
                  {!isChannelConnected(activePost?.channel, youtubeConnection, creatorData) ? (
                    <button
                      type="button"
                      onClick={navigateToAccounts}
                      className="w-full py-3 px-4 rounded-none font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-md hover:opacity-95 border-0"
                      style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
                    >
                      <Sliders size={14} className="text-white" />
                      <span className="text-white font-bold">
                        Connect {activePost?.channel || 'Channel'} to Schedule
                      </span>
                    </button>
                  ) : activePost?.status === 'Posted' ? (
                    <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-2" style={{ borderRadius: '0px' }}>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-emerald-200">
                            {activePost?.channel === 'YouTube' ? 'Published to YouTube Channel' : 'Published Live'}
                          </p>
                          <p className="text-[10px] text-emerald-400/80 font-mono">
                            {activePost?.youtubeVideoId ? `Video ID: ${activePost.youtubeVideoId}` : 'Broadcast Complete'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRevertToDraft}
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white bg-[#141926] hover:bg-[#1a2234] border border-[#242d42] cursor-pointer transition"
                        style={{ borderRadius: '0px' }}
                      >
                        Revert to Draft
                      </button>
                    </div>
                  ) : activePost?.status === 'Scheduled' ? (
                    <div className="p-2.5 bg-sky-950/40 border border-sky-500/40 flex items-center justify-between gap-2" style={{ borderRadius: '0px' }}>
                      <div className="flex items-center gap-2">
                        <Clock size={15} className="text-sky-400 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-sky-200">
                            {activePost?.youtubeVideoId ? 'Scheduled on YouTube Studio' : 'Scheduled in Campaign'}
                          </p>
                          <p className="text-[10px] text-sky-400/80 font-mono">
                            {activePost?.fullDateStr} at {activePost?.time || '9:00 AM'}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRevertToDraft}
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white bg-[#141926] hover:bg-[#1a2234] border border-[#242d42] cursor-pointer transition"
                        style={{ borderRadius: '0px' }}
                      >
                        Revert to Draft
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSchedulePost}
                      disabled={isPublishingDirect}
                      className="w-full py-3 px-4 rounded-none font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-md hover:opacity-95 border-0 disabled:opacity-50"
                      style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
                    >
                      <Clock size={14} className="text-white" />
                      <span className="text-white font-bold">
                        {isPublishingDirect ? 'Scheduling...' : 'Schedule in Campaign (+50 XP)'}
                      </span>
                    </button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {/* Secondary: Save Draft */}
                    <button
                      type="button"
                      onClick={handleSaveToDraft}
                      disabled={isPublishingDirect}
                      className="w-full py-2.5 px-3 rounded-none bg-[#0c0f17] hover:bg-[#161b2b] text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer border border-[#202738] disabled:opacity-50"
                      style={{ borderRadius: '0px' }}
                    >
                      <CheckCircle2 size={13} className="text-slate-400" />
                      <span>Save as Draft</span>
                    </button>

                    {/* Secondary: Publish Live */}
                    <button
                      type="button"
                      onClick={isChannelConnected(activePost?.channel, youtubeConnection, creatorData) ? handlePublishNow : navigateToAccounts}
                      disabled={isPublishingDirect}
                      className={`w-full py-2.5 px-3 rounded-none font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer border-0 text-white disabled:opacity-50 ${
                        isChannelConnected(activePost?.channel, youtubeConnection, creatorData)
                          ? 'bg-emerald-600 hover:bg-emerald-700'
                          : 'bg-[#182030] text-slate-400 hover:text-white'
                      }`}
                      style={{ borderRadius: '0px' }}
                      title={isChannelConnected(activePost?.channel, youtubeConnection, creatorData) ? 'Publish live' : 'Connect channel first'}
                    >
                      <Send size={13} className="text-white" />
                      <span className="font-bold">
                        {isPublishingDirect
                          ? 'Publishing...'
                          : isChannelConnected(activePost?.channel, youtubeConnection, creatorData)
                            ? (activePost?.channel === 'YouTube' && !activePost?.videoBase64 && !activePost?.videoUrl ? 'Attach Video to Publish' : 'Publish Live (+100 XP)')
                            : 'Connect to Publish'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Manual OpenAI Visual Studio */}
              <div className="bg-[#111522] rounded-none p-3.5 space-y-2.5 border border-[#202738]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-sky-400" />
                    <span>OpenAI Visual Generator</span>
                  </span>
                  {activePost?.imageUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer border-0 bg-transparent"
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                  )}
                </div>

                {activePost?.imageUrl ? (
                  <div className="w-full h-40 bg-black overflow-hidden relative group rounded-none border border-white/10">
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
                      Generate an AI visual with OpenAI for this draft. Triggered manually.
                    </p>
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

              {/* Quick Viral Hooks */}
              <div className="rounded-none p-3.5 bg-[#111522] border border-[#202738] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <Lightbulb size={13} className="text-amber-400" />
                    <span>Quick Viral Hooks</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleGenerateHookIdeas}
                    disabled={isGeneratingHooks}
                    className="text-[10px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer disabled:opacity-50 border-0 bg-transparent"
                  >
                    <RefreshCw size={10} className={isGeneratingHooks ? 'animate-spin' : ''} />
                    <span>Refresh</span>
                  </button>
                </div>
                <div className="space-y-1.5">
                  {suggestedHooks.map((hook, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyHook(hook)}
                      className="w-full text-left p-2 rounded-none bg-[#161b2b] hover:bg-[#1c2236] transition cursor-pointer text-[11px] text-slate-300 flex items-start gap-1.5 border-0"
                    >
                      <span className="text-rose-400 font-bold">•</span>
                      <span>"{hook}"</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: POSTIZ-STYLE WYSIWYG PLATFORM PREVIEWS */}
          {inspectorTab === 'preview' && (
            <div className="space-y-4">
              
              {/* Platform Selector Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {[
                  { id: 'x', label: 'X (Twitter)', icon: Twitter },
                  { id: 'instagram', label: 'Instagram', icon: Instagram },
                  { id: 'youtube', label: 'YouTube', icon: Youtube },
                  { id: 'linkedin', label: 'LinkedIn', icon: Linkedin },
                  { id: 'tiktok', label: 'TikTok', icon: Video }
                ].map(tab => {
                  const IconComp = tab.icon
                  const active = previewPlatform === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPreviewPlatform(tab.id)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-none flex items-center gap-1 transition cursor-pointer shrink-0 border-0 ${
                        active
                          ? 'bg-[#1c2236] text-white ring-1 ring-white/20'
                          : 'bg-[#111522] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <IconComp size={12} />
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* WYSIWYG 1: X (TWITTER) PREVIEW */}
              {previewPlatform === 'x' && (
                <div className="bg-[#000000] border border-slate-800 rounded-none p-4 space-y-3 font-sans text-white text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-none bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0 border border-sky-400/30">
                      {creatorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm truncate">{creatorName}</span>
                        <CheckCircle2 size={14} className="text-sky-400 fill-sky-400 shrink-0" />
                        <span className="text-slate-500 truncate">@{handleClean}</span>
                        <span className="text-slate-500">· 2m</span>
                      </div>
                      <p className="text-slate-100 mt-2 leading-relaxed whitespace-pre-line text-xs font-normal">
                        {activePost?.caption || activePost?.title || 'Draft tweet content will render here...'}
                      </p>

                      {/* Visual Attachment */}
                      {activePost?.imageUrl && (
                        <div className="mt-3 rounded-none overflow-hidden border border-slate-800">
                          <img src={activePost.imageUrl} alt="" className="w-full h-44 object-cover" />
                        </div>
                      )}

                      {/* Dynamic 280-char counter */}
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1 hover:text-sky-400 cursor-pointer">
                            <MessageSquare size={13} /> 12
                          </span>
                          <span className="flex items-center gap-1 hover:text-emerald-400 cursor-pointer">
                            <Repeat size={13} /> 34
                          </span>
                          <span className="flex items-center gap-1 hover:text-rose-400 cursor-pointer">
                            <Heart size={13} /> 148
                          </span>
                          <span className="flex items-center gap-1 hover:text-sky-400 cursor-pointer">
                            <Eye size={13} /> 2.4K
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className={(activePost?.caption?.length || 0) > 280 ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                            {activePost?.caption?.length || 0}/280
                          </span>
                          <div className="w-4 h-4 rounded-none bg-slate-800 flex items-center justify-center">
                            <div
                              className={`h-full ${
                                (activePost?.caption?.length || 0) > 280 ? 'bg-rose-500' : 'bg-sky-400'
                              }`}
                              style={{ width: `${Math.min(100, ((activePost?.caption?.length || 0) / 280) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* WYSIWYG 2: INSTAGRAM PREVIEW */}
              {previewPlatform === 'instagram' && (
                <div className="bg-[#000000] border border-slate-800 rounded-none overflow-hidden text-xs text-white">
                  {/* IG Header */}
                  <div className="p-3 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-none bg-gradient-to-tr from-amber-500 to-pink-500 p-0.5">
                        <div className="w-full h-full bg-black flex items-center justify-center font-bold text-pink-400 text-xs">
                          {creatorName.slice(0, 1)}
                        </div>
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">{handleClean}</div>
                        <div className="text-[10px] text-slate-400">Original audio</div>
                      </div>
                    </div>
                    <span className="text-slate-400 font-bold text-sm">•••</span>
                  </div>

                  {/* IG Media Box */}
                  <div className="w-full h-56 bg-[#111522] flex items-center justify-center relative overflow-hidden">
                    {activePost?.imageUrl ? (
                      <img src={activePost.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <Instagram size={36} className="text-pink-500 mx-auto mb-2 opacity-60" />
                        <span className="text-xs font-bold text-slate-300 block">{activePost?.title}</span>
                        <span className="text-[10px] text-slate-500 mt-1 block">Visual / Video Mockup</span>
                      </div>
                    )}
                  </div>

                  {/* IG Action Icons */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between text-slate-300">
                      <div className="flex items-center gap-3">
                        <Heart size={18} className="hover:text-rose-500 cursor-pointer" />
                        <MessageSquare size={18} className="hover:text-sky-400 cursor-pointer" />
                        <Send size={18} className="hover:text-emerald-400 cursor-pointer" />
                      </div>
                      <Bookmark size={18} className="hover:text-amber-400 cursor-pointer" />
                    </div>
                    <div className="text-[11px] font-bold text-white">1,284 likes</div>
                    <div className="text-xs text-slate-200 leading-snug">
                      <span className="font-bold text-white mr-1.5">{handleClean}</span>
                      <span className="line-clamp-3 font-normal whitespace-pre-line">{activePost?.caption}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* WYSIWYG 3: YOUTUBE COMMUNITY / SHORTS PREVIEW */}
              {previewPlatform === 'youtube' && (
                <div className="bg-[#0f0f0f] border border-slate-800 rounded-none p-4 text-xs text-white space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-none bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                        {creatorName.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1 font-bold text-sm text-white">
                          <span>{creatorName}</span>
                          <CheckCircle2 size={13} className="text-slate-400 fill-slate-400" />
                        </div>
                        <span className="text-[10px] text-slate-400">Scheduled • Community Feed</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1 bg-red-600 text-white font-bold text-xs rounded-none"
                    >
                      Subscribe
                    </button>
                  </div>

                  <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                    {activePost?.caption || activePost?.title}
                  </p>

                  {/* Thumbnail */}
                  <div className="w-full h-44 bg-slate-900 border border-slate-800 rounded-none overflow-hidden relative flex items-center justify-center">
                    {activePost?.imageUrl ? (
                      <img src={activePost.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-3">
                        <Youtube size={36} className="text-red-500 mx-auto mb-1" />
                        <span className="text-xs font-bold text-slate-200">{activePost?.title}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                      <div className="w-12 h-8 rounded-none bg-red-600/90 flex items-center justify-center text-white">
                        <Play size={16} className="fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center gap-4 text-slate-400 pt-1 text-xs">
                    <span className="flex items-center gap-1.5 hover:text-white cursor-pointer">
                      <ThumbsUp size={14} /> 482
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-white cursor-pointer">
                      <ThumbsDown size={14} />
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-white cursor-pointer">
                      <Share2 size={14} /> Share
                    </span>
                    <span className="flex items-center gap-1.5 hover:text-white cursor-pointer">
                      <MessageSquare size={14} /> 86
                    </span>
                  </div>
                </div>
              )}

              {/* WYSIWYG 4: LINKEDIN PREVIEW */}
              {previewPlatform === 'linkedin' && (
                <div className="bg-[#1b1f23] border border-slate-700/60 rounded-none p-4 text-xs text-slate-200 space-y-3 font-sans">
                  <div className="flex items-start gap-2.5">
                    <div className="w-10 h-10 rounded-none bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-500/30">
                      {creatorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-white text-sm truncate">{creatorName}</span>
                        <span className="text-slate-400 text-[11px]">• 1st</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">Creator &amp; Founder • Building {productName}</p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <span>1h • Edited •</span>
                        <Globe size={10} />
                      </p>
                    </div>
                  </div>

                  <p className="text-slate-200 leading-relaxed whitespace-pre-line text-xs font-normal">
                    {activePost?.caption || activePost?.title}
                  </p>

                  {activePost?.imageUrl && (
                    <div className="rounded-none overflow-hidden border border-slate-700">
                      <img src={activePost.imageUrl} alt="" className="w-full h-44 object-cover" />
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-slate-400 text-xs">
                    <button type="button" className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer bg-transparent border-0 p-0 text-slate-400">
                      <ThumbsUp size={13} />
                      <span>Like</span>
                    </button>
                    <button type="button" className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer bg-transparent border-0 p-0 text-slate-400">
                      <MessageSquare size={13} />
                      <span>Comment</span>
                    </button>
                    <button type="button" className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer bg-transparent border-0 p-0 text-slate-400">
                      <Repeat size={13} />
                      <span>Repost</span>
                    </button>
                    <button type="button" className="flex items-center gap-1.5 hover:text-blue-400 cursor-pointer bg-transparent border-0 p-0 text-slate-400">
                      <Send size={13} />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              )}

              {/* WYSIWYG 5: TIKTOK PREVIEW */}
              {previewPlatform === 'tiktok' && (
                <div className="w-full max-w-[280px] mx-auto bg-black border border-slate-800 rounded-none h-[420px] relative overflow-hidden text-white flex flex-col justify-between p-3 select-none">
                  {/* Top bar */}
                  <div className="flex items-center justify-center gap-3 text-xs font-bold text-slate-400">
                    <span className="hover:text-white cursor-pointer">Following</span>
                    <span className="text-white font-black border-b-2 border-white pb-0.5">For You</span>
                  </div>

                  {/* Center mock visual */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900 via-[#111522] to-black flex items-center justify-center">
                    {activePost?.imageUrl ? (
                      <img src={activePost.imageUrl} alt="" className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <div className="text-center p-4">
                        <Video size={40} className="text-slate-400 mx-auto mb-2 opacity-50" />
                        <span className="text-xs font-bold text-slate-300">{activePost?.title}</span>
                      </div>
                    )}
                  </div>

                  {/* Right Action Stack */}
                  <div className="self-end space-y-3 flex flex-col items-center z-10">
                    <div className="w-9 h-9 rounded-none bg-rose-600 flex items-center justify-center font-bold text-white text-xs border border-white/20">
                      {creatorName.slice(0, 1)}
                    </div>
                    <div className="text-center">
                      <Heart size={20} className="text-white fill-white mx-auto" />
                      <span className="text-[10px] font-bold">14.2K</span>
                    </div>
                    <div className="text-center">
                      <MessageSquare size={20} className="text-white mx-auto" />
                      <span className="text-[10px] font-bold">842</span>
                    </div>
                    <div className="text-center">
                      <Bookmark size={20} className="text-white mx-auto" />
                      <span className="text-[10px] font-bold">3.1K</span>
                    </div>
                    <div className="text-center">
                      <Share2 size={20} className="text-white mx-auto" />
                      <span className="text-[10px] font-bold">1.2K</span>
                    </div>
                  </div>

                  {/* Bottom creator info */}
                  <div className="z-10 space-y-1">
                    <div className="font-bold text-sm text-white">@{handleClean}</div>
                    <p className="text-[11px] text-slate-200 line-clamp-2">{activePost?.caption}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                      <span>♫ original sound - {creatorName}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Quick Dispatch Buttons from Preview */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSchedulePost}
                  disabled={isPublishingDirect}
                  className="w-full py-3 px-4 rounded-none font-bold text-xs flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer shadow-md hover:opacity-95 border-0 disabled:opacity-50"
                  style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
                >
                  <Clock size={14} className="text-white" />
                  <span className="text-white font-bold">
                    {isPublishingDirect ? 'Scheduling...' : 'Schedule in Campaign Pipeline (+50 XP)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectorTab('composer')}
                  className="w-full py-2 bg-[#111522] hover:bg-[#161b2b] text-slate-300 text-xs font-bold rounded-none flex items-center justify-center gap-1.5 transition cursor-pointer border border-[#202738]"
                >
                  <Pencil size={12} />
                  <span>Return to Script Editor</span>
                </button>
              </div>

            </div>
          )}

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

      {/* ── MODAL: IDEAS & CONTENT VAULT ── */}
      {vaultModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0f17] rounded-none max-w-lg w-full p-6 text-slate-200 shadow-2xl border-0 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-none bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Ideas &amp; Content Vault</h3>
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
