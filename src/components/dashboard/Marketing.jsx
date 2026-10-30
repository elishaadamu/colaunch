import { useState, useEffect, useRef, useMemo } from 'react'
import { useForge, getAccent, useBgJob } from '../../App'
import { askForgeChat, generateStudioContent, hasTextKey, generateContentCalendar, generateTodayPrioritiesAI } from '../../services/ai'
import {
  Sparkles, TrendingUp, Mail, Video, Share2, Users,
  RefreshCw, Copy, Check, X, Calendar, ChevronRight,
  BarChart2, AlertCircle, MessageSquare, Send, ArrowRight, Play, Minus, Pencil, Zap, Plus, RotateCcw, Eye
} from 'lucide-react'
import AiDoesItPanel from './AiDoesItPanel'
import { hexToRgb, getDeterministicBrandColor, getContrastTextColor } from '../../utils/avatarColorExtractor'

// ─── PIXEL COACH ─────────────────────────────────────────────────────────────
// A tiny pixel-art character that coaches the creator

function getCoachMessage(trigger, creatorData) {
  const handle = creatorData.handle || '@creator'
  const displayName = creatorData.name || handle.replace('@','')
  const platformName = creatorData.platform ? (creatorData.platform.charAt(0).toUpperCase() + creatorData.platform.slice(1)) : 'social media'
  const niche = creatorData.niche || 'content creation'
  const productName = creatorData.productName || 'Creator Academy'

  switch (trigger) {
    case 'idle': {
      let msg = `Hey ${displayName}! `
      if (creatorData.followers > 0) {
        const followersFormatted = creatorData.followers >= 1_000_000
          ? `${(creatorData.followers/1_000_000).toFixed(1)}M`
          : creatorData.followers >= 1_000
            ? `${Math.round(creatorData.followers/1_000)}K`
            : creatorData.followers
        msg += `I've analyzed your ${followersFormatted} followers on ${platformName}. `
      } else {
        msg += `Welcome to your dashboard. `
      }
      if (creatorData.engagementRate > 0) {
        msg += `Your ${creatorData.engagementRate}% engagement rate shows a very warm audience. `
      }
      msg += `Since you create content in ${niche}, launching your own product is the perfect way to monetize. Let's start with your launch plan today!`
      return msg
    }
    case 'teaser':
      return `Perfect. A teaser post primes your ${platformName} audience 48-72h before launch. I wrote one for your ${niche} brand below — copy it and post today.`
    case 'email':
      return `Email converts 3-5x better than social. Your list needs to hear about ${productName} before you go wide. Here's a launch email ready to send.`
    case 'bts':
      return `Behind-the-scenes content builds more trust than promos. Here's a caption. Pair it with a quick phone video showing your work on ${productName} — no editing needed.`
    case 'calendar':
      return `Batching a full week takes 20 minutes and means you never scramble again. I filled your launch week for ${productName} below. Drag to reschedule.`
    case 'scheduled':
      return `Saved to your calendar! Next up: post your launch email tomorrow morning. Want me to write it now?`
    case 'copied':
      return `Copied! Now paste it into ${platformName} and hit post. Don't overthink it — your audience is waiting.`
    default:
      return `Hey ${displayName}! Let's build your launch plan.`
  }
}

function PixelCoach({ message, onChat }) {
  const [expanded, setExpanded]     = useState(false)
  const [displayText, setDisplayText] = useState('')
  const [charIdx, setCharIdx]       = useState(0)

  useEffect(() => {
    setDisplayText('')
    setCharIdx(0)
  }, [message])

  useEffect(() => {
    if (!expanded) return
    if (charIdx >= message.length) return
    const t = setTimeout(() => {
      setDisplayText(prev => prev + message[charIdx])
      setCharIdx(i => i + 1)
    }, 14)
    return () => clearTimeout(t)
  }, [charIdx, message, expanded])

  // When user expands, kick off typewriter
  const handleExpand = () => {
    setExpanded(true)
    setDisplayText('')
    setCharIdx(0)
  }

  if (!expanded) {
    return (
      <button
        onClick={handleExpand}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all text-left"
        style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.11)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
      >
        {/* Mini pixel avatar */}
        <svg viewBox="0 0 16 16" width="20" height="20" style={{ imageRendering: 'pixelated', flexShrink: 0 }}>
          <rect x="4" y="1" width="8" height="2" fill="#f0d0a0"/>
          <rect x="4" y="3" width="8" height="5" fill="#fde8c8"/>
          <rect x="5" y="5" width="2" height="2" fill="#2a2a2a"/>
          <rect x="9" y="5" width="2" height="2" fill="#2a2a2a"/>
          <rect x="5" y="5" width="1" height="1" fill="white"/>
          <rect x="9" y="5" width="1" height="1" fill="white"/>
          <rect x="5" y="9" width="6" height="4" fill="white"/>
        </svg>
        <span className="text-[11px] flex-1 truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <span className="font-semibold text-white/60 mr-1">Forge Coach</span>
          {message.slice(0, 80)}{message.length > 80 ? '…' : ''}
        </span>
        <ChevronRight size={12} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
      </button>
    )
  }

  return (
    <div className="flex items-end gap-3">
      {/* Pixel character */}
      <div className="flex-shrink-0" style={{ width: 36, height: 36 }}>
        <svg viewBox="0 0 16 16" width="36" height="36" style={{ imageRendering: 'pixelated' }}>
          <rect x="4" y="1" width="8" height="2" fill="#f0d0a0"/>
          <rect x="3" y="2" width="1" height="2" fill="#f0d0a0"/>
          <rect x="12" y="2" width="1" height="2" fill="#f0d0a0"/>
          <rect x="4" y="3" width="8" height="5" fill="#fde8c8"/>
          <rect x="5" y="5" width="2" height="2" fill="#2a2a2a"/>
          <rect x="9" y="5" width="2" height="2" fill="#2a2a2a"/>
          <rect x="5" y="5" width="1" height="1" fill="white"/>
          <rect x="9" y="5" width="1" height="1" fill="white"/>
          <rect x="6" y="7" width="1" height="1" fill="#c0806a"/>
          <rect x="7" y="8" width="2" height="1" fill="#c0806a"/>
          <rect x="9" y="7" width="1" height="1" fill="#c0806a"/>
          <rect x="5" y="9" width="6" height="4" fill="white"/>
          <rect x="7" y="9" width="2" height="1" fill="#e0e0e0"/>
          <rect x="3" y="9" width="2" height="3" fill="white"/>
          <rect x="11" y="9" width="2" height="3" fill="white"/>
        </svg>
      </div>

      {/* Speech bubble */}
      <div className="flex-1 relative">
        <div
          className="rounded-2xl rounded-bl-sm px-4 py-3 relative"
          style={{ background: 'var(--theme-card-bg)', border: '1px solid var(--theme-border-color)' }}
        >
          {/* Collapse button */}
          <button
            onClick={() => setExpanded(false)}
            className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}
          >
            <X size={10} />
          </button>

          <p className="text-[12px] leading-relaxed pr-6" style={{ color: 'var(--theme-text)', opacity: 0.8 }}>
            {displayText}
            {charIdx < message.length && (
              <span className="cursor-blink text-white/40">|</span>
            )}
          </p>

          {charIdx >= message.length && (
            <div className="flex items-center gap-2 mt-2 pt-2" style={{ borderTop: '1px solid var(--theme-border-color)' }}>
              <button
                onClick={onChat}
                className="flex items-center gap-1.5 text-[11px] transition-all duration-150"
                style={{ color: 'var(--theme-text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--theme-text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--theme-text-muted)'}
              >
                <MessageSquare size={10} /> Reply to Forge coach
              </button>
            </div>
          )}
        </div>
        {/* Bubble tail */}
        <div className="absolute -left-2 bottom-3 w-0 h-0"
          style={{ borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: '8px solid var(--theme-card-bg)' }} />
      </div>
    </div>
  )
}

// ─── WEEKLY CALENDAR ─────────────────────────────────────────────────────────

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TODAY_IDX = (new Date().getDay() + 6) % 7 // 0=Mon

function getWeekNumber(d = new Date()) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7)
}

function getPlatformColor(platform) {
  const p = (platform || '').toLowerCase()
  if (p.includes('you') || p === 'yt') return { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' }
  if (p.includes('insta') || p === 'ig') return { text: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/30' }
  if (p.includes('email') || p.includes('mail') || p.includes('letter')) return { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
  if (p.includes('tik')) return { text: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/30' }
  if (p.includes('link')) return { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' }
  if (p.includes('x') || p.includes('twit')) return { text: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30' }
  return { text: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' }
}

function isMockupCalendar(result) {
  if (!result || !Array.isArray(result) || result.length === 0) return true
  const str = JSON.stringify(result)
  return str.includes('init-mon-1') ||
         str.includes('Launch teaser reel') ||
         str.includes('Early access email') ||
         str.includes('5 things I wish I knew') ||
         str.includes('YouTube live — product intro') ||
         str.includes('Launch day announcement')
}

function buildFallbackWeek(creatorData) {
  const name = creatorData?.name || (creatorData?.handle || 'Creator').replace(/^@/, '')
  const niche = creatorData?.niche || 'Fitness'
  const prod = creatorData?.productName || `${name} Academy`
  return [
    { day: 'Mon', posts: [
      { id: 1, type: 'Video', title: `Welcome to the VIP ${name} ${niche} Masterclass Launch!`, platform: 'YouTube', theme: 'launch', status: 'posted' },
      { id: 2, type: 'Reel', title: `3 ${niche} Myths Busted by our Academic Experts`, platform: 'Instagram', theme: 'value', status: 'draft' }
    ]},
    { day: 'Tue', posts: [
      { id: 3, type: 'Email', title: `How Our Masterclass Will Transform Your ${niche} Journey`, platform: 'Email', theme: 'story', status: 'draft' }
    ]},
    { day: 'Wed', posts: [
      { id: 4, type: 'Shorts', title: `Building the Masterclass: Behind-the-Scenes Sneak Peek`, platform: 'YouTube', theme: 'bts', status: 'draft' },
      { id: 5, type: 'Story', title: `Meet the Trainers: Get to Know Our Masterclass Stars`, platform: 'Instagram', theme: 'community', status: 'draft' }
    ]},
    { day: 'Thu', posts: [
      { id: 6, type: 'Community', title: `Join our Live Q&A Session with Masterclass Alumni`, platform: 'YouTube', theme: 'launch', status: 'draft' }
    ]},
    { day: 'Fri', posts: [
      { id: 7, type: 'Post', title: `Why Our ${niche} Toolkit Is Essential for Your Success`, platform: 'Instagram', theme: 'proof', status: 'draft' },
      { id: 8, type: 'Post', title: `Achieving Personal Bests: Success Stories from Our Masterclass`, platform: 'LinkedIn', theme: 'proof', status: 'draft' }
    ]},
    { day: 'Sat', posts: [
      { id: 9, type: 'Video', title: `Your Weekend ${niche} Challenge: From the Masterclass Workbook`, platform: 'YouTube', theme: 'value', status: 'draft' }
    ]},
    { day: 'Sun', posts: [
      { id: 10, type: 'Email', title: `Last Chance to Join: Enroll in the Masterclass Today`, platform: 'Email', theme: 'cta', status: 'draft' },
      { id: 11, type: 'Thread', title: `Top 5 Reasons You Need Our ${niche} Masterclass This Year`, platform: 'Twitter', theme: 'cta', status: 'draft' }
    ]}
  ]
}

function WeekCalendar({ week, onAddPost, accentRgb, isLoading, onCardClick, chatOpen }) {
  const getWeekDates = () => {
    const dates = []
    const today = new Date()
    const currentDay = today.getDay()
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() + distanceToMonday + i)
      dates.push(d)
    }
    return dates
  }
  const weekDates = getWeekDates()
  const todayIdx = (new Date().getDay() + 6) % 7 // 0=Mon, ..., 6=Sun

  // When AI sidebar is open, reduce columns from 7 to 4 so cards remain wide & legible
  const gridClass = chatOpen 
    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 transition-all duration-200"
    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 transition-all duration-200"

  // Skeleton Loader when generating or opening page before real content is ready
  if (isLoading || !week || week.length === 0) {
    return (
      <div className={gridClass}>
        {DAYS.map((day, i) => {
          const isToday = i === todayIdx
          const dateStr = weekDates[i].toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
          return (
            <div
              key={day}
              className={`p-3 rounded-xl flex flex-col justify-between min-h-[220px] relative overflow-hidden transition-all ${
                isToday 
                  ? 'bg-slate-900/90 border-2 border-cyan-500/80 shadow-[0_0_24px_-2px_rgba(56,189,248,0.35)]' 
                  : 'bg-[#111726]/80 border border-[#1e293b]'
              }`}
            >
              {isToday && (
                <span className="absolute -top-2.5 right-3 px-1.5 py-0.2 rounded bg-cyan-500 text-[#090d16] font-bold text-[9px] uppercase tracking-wider">
                  Today
                </span>
              )}

              {/* Day Header Skeleton */}
              <div className={`flex items-center justify-between pb-2 mb-2 border-b ${isToday ? 'border-cyan-500/30' : 'border-slate-800'}`}>
                <span className={`text-xs font-extrabold flex items-center gap-1.5 ${isToday ? 'text-cyan-300' : 'text-slate-300'}`}>
                  {day}
                  {isToday && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />}
                </span>
                <span className={`text-[10px] font-mono ${isToday ? 'text-cyan-300/80 font-bold' : 'text-slate-500'}`}>{dateStr}</span>
              </div>

              {/* Skeleton Cards with Pulse */}
              <div className="space-y-2 flex-1 animate-pulse">
                <div className={`p-2.5 rounded-lg space-y-2 border ${
                  isToday 
                    ? 'bg-cyan-950/40 border-cyan-500/40' 
                    : 'bg-slate-800/60 border-slate-700/50'
                }`}>
                  <div className={`w-12 h-2.5 rounded ${isToday ? 'bg-cyan-400/40' : 'bg-slate-700/80'}`} />
                  <div className="space-y-1.5">
                    <div className={`w-full h-2.5 rounded ${isToday ? 'bg-cyan-400/30' : 'bg-slate-700/60'}`} />
                    <div className={`w-4/5 h-2.5 rounded ${isToday ? 'bg-cyan-400/20' : 'bg-slate-700/40'}`} />
                  </div>
                  <div className={`w-10 h-3 rounded ${isToday ? 'bg-cyan-900/60' : 'bg-slate-900/90'}`} />
                </div>

                {i % 2 === 0 && (
                  <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-800/80 space-y-1.5">
                    <div className="w-14 h-2 rounded bg-slate-700/60" />
                    <div className="w-full h-2 rounded bg-slate-700/40" />
                    <div className="w-9 h-2.5 rounded bg-slate-900/90" />
                  </div>
                )}
              </div>

              {/* Add Post Skeleton */}
              <div className="pt-2 mt-2 border-t border-slate-800/60">
                <div className="w-16 h-2.5 mx-auto rounded bg-slate-800/50 animate-pulse" />
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Real Rendered Calendar
  return (
    <div className={gridClass}>
      {week.map((dayData, i) => {
        const isToday = i === todayIdx
        const dateStr = weekDates[i].toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })
        const posts = dayData.posts || []

        return (
          <div
            key={`${dayData.day || 'day'}-${i}`}
            className={`p-3 rounded-xl flex flex-col justify-between min-h-[220px] transition-all relative ${
              isToday
                ? 'bg-slate-900/90 border-2 border-cyan-500/80 shadow-[0_0_24px_-2px_rgba(56,189,248,0.35)]'
                : 'bg-[#111726] border border-[#1e293b] hover:border-slate-700'
            }`}
          >
            {isToday && (
              <span className="absolute -top-2.5 right-3 px-1.5 py-0.2 rounded bg-cyan-500 text-[#090d16] font-bold text-[9px] uppercase tracking-wider">
                Today
              </span>
            )}

            {/* Header: Day & Date */}
            <div className={`flex items-center justify-between pb-2 mb-2 border-b ${isToday ? 'border-cyan-500/30' : 'border-slate-800'}`}>
              <span className={`text-xs font-bold flex items-center gap-1.5 ${isToday ? 'text-cyan-300 font-extrabold' : 'text-slate-300'}`}>
                {dayData.day}
                {isToday && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />}
              </span>
              <span className={`text-[10px] font-mono ${isToday ? 'text-cyan-300/80 font-bold' : 'text-slate-500'}`}>
                {dateStr}
              </span>
            </div>

            {/* Posts List */}
            <div className="space-y-2 flex-1">
              {posts.map((post, j) => {
                const colors = getPlatformColor(post.platform)
                return (
                  <div
                    key={post.id ? `post-id-${post.id}-${j}` : `post-idx-${dayData.day}-${j}`}
                    onClick={() => onCardClick && onCardClick(post, dayData.day)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer group hover:border-slate-600 ${
                      isToday
                        ? 'bg-cyan-950/40 border-cyan-500/40 hover:border-cyan-400'
                        : 'bg-slate-800/80 border-slate-700/60 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[9px] uppercase font-bold tracking-wider ${colors.text} block`}>
                        {post.platform || 'Social'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onCardClick && onCardClick(post, dayData.day)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white"
                        title="Edit post"
                      >
                        <Pencil size={10} />
                      </button>
                    </div>

                    <p className={`text-[11px] font-medium leading-tight line-clamp-3 mb-1.5 ${isToday ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                      {post.title || post.label || 'Untitled Post'}
                    </p>

                    {post.type && (
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-mono uppercase ${
                        isToday ? 'bg-cyan-900/60 text-cyan-200' : 'bg-slate-900 text-slate-400'
                      }`}>
                        {post.type}
                      </span>
                    )}
                  </div>
                )
              })}

              {posts.length === 0 && (
                <div className="h-full flex items-center justify-center p-3 text-center">
                  <span className="text-[10px] text-slate-600 font-mono">Rest / Off day</span>
                </div>
              )}
            </div>

            {/* Add Post Button */}
            <div className="pt-2 mt-2 border-t border-slate-800/60">
              <button
                type="button"
                onClick={() => onAddPost(i)}
                className="w-full py-1 text-center text-[10px] text-slate-500 hover:text-slate-300 hover:bg-slate-800/40 rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus size={10} />
                <span>Add post</span>
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── GENERATED CONTENT MAP ────────────────────────────────────────────────────

function buildContent(handle, productName, niche) {
  const h = handle || '@creator'
  const p = productName || 'Creator Academy'
  const n = niche || 'your niche'

  return {
    teaser: {
      title: 'Launch Teaser Post',
      platforms: ['Instagram', 'TikTok', 'X'],
      body: `Something big is dropping this week.

I've been building this for the past 3 months and I finally feel ready to share it.

If you've been following me for a while — you already know what problem this solves.

If you're new here: I make content about ${n}. And I built the exact resource I always wished existed when I was starting out.

Friday. Link in bio. 👀

Comment "in" and I'll DM you early access.`,
    },
    email: {
      title: 'Launch Announcement Email',
      platforms: ['Email'],
      body: `Subject: It's finally here (and you get first access)

Hey —

I don't usually send emails like this. But today feels different.

I just launched ${p}.

It's the thing I've spent the last few months building for people exactly like you — people who watch my ${n} content and want to actually go deeper.

Here's what's inside:
- [Module 1 — describe it]
- [Module 2 — describe it]
- [Module 3 — describe it]
- A private community of people doing the same work

For the next 48 hours, founding members get 40% off. That price closes Friday at midnight.

→ Get in here: [your link]

I read every reply. If you have a question, just hit respond.

${h.replace('@','')}

P.S. If this isn't for you, no worries. But if you've ever thought "I wish I had a proper place to learn this from ${h}" — this is it.`,
    },
    bts: {
      title: 'Behind-the-Scenes Caption',
      platforms: ['Instagram', 'TikTok'],
      body: `POV: It's 11pm and I'm still working on this thing I'm launching Friday.

No ring light. No script. Just me, my laptop, and the same playlist I've had on repeat for 3 months.

Here's what building this actually looked like:
- Week 1: convinced myself it was a bad idea
- Week 2: realized it was actually what my audience needed
- Week 3-8: built it, broke it, rebuilt it
- This week: shipping it

The behind-the-scenes is always messier than the highlight reel. I'm sharing it anyway.

Friday. You'll see what it was all for. 👀

#buildinginpublic #${n.toLowerCase().replace(/\s+/g,'').replace(/&/g,'')} #creatorbusiness`,
    },
    calendar: {
      title: 'Your 7-Day Launch Week',
      platforms: ['All platforms'],
      body: `MONDAY — Teaser post (IG Reel, 15-30 seconds)
"Something big is coming Friday." Show your workspace or a cryptic preview. Caption: keep it short and mysterious. Goal: get people asking questions.

TUESDAY — Email your list
Subject: "Early access closes Friday." Send to your full list. Personalize the first line. Link to waitlist or product page.

WEDNESDAY — X/Twitter thread + IG Story
Thread: "5 things I learned building [product]" — ends with a soft CTA. Story: 3-5 slides showing progress. Add a poll ("are you in?").

THURSDAY — YouTube live or long-form video
30-minute session: walk through what you built and why. Take live questions. Pin your launch link in the chat. This is your highest-intent touchpoint.

FRIDAY — LAUNCH DAY
Post everywhere at 9am EST. 4-6 social posts across all platforms. Send final email to list: "It's live." Go live on IG Stories for 30 minutes. Reply to every comment within 2 hours.

SATURDAY — Social proof + momentum
Screenshot kind words. Post testimonials. Share a "Day 1 results" update. Keep the energy going.

SUNDAY — Recap + extended deadline
"Last 24 hours at this price." Email non-openers with a different subject line. Post a simple "here's what happened this week" video.`,
    },
  }
}

// ─── OUTPUT PANEL ─────────────────────────────────────────────────────────────

function OutputPanel({ content, onClose, onSchedule, onCopy, accent, onRefine, isGenerating }) {
  const [copied, setCopied] = useState(false)
  const [tone, setTone] = useState('confident')

  const handleCopy = () => {
    navigator.clipboard.writeText(content.body)
    setCopied(true)
    onCopy?.()
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl border overflow-hidden animate-fade-up"
      style={{ background: 'var(--theme-card-bg)', borderColor: 'var(--theme-border-color)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: 'var(--theme-border-color)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--theme-accent)', color: 'var(--theme-btn-primary-text)' }}>
            <Sparkles size={11} className="text-current" />
          </div>
          <span className="text-[14px] font-semibold text-white">{content.title}</span>
          <div className="flex gap-1 ml-1">
            {content.platforms.map(p => (
              <span key={p} className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {['confident', 'casual', 'bold'].map(t => (
              <button key={t} onClick={() => { setTone(t); onRefine?.(`Rewrite this using a ${t} tone.`, t); }}
                disabled={isGenerating}
                className="text-[10px] px-2 py-0.5 rounded-full capitalize transition-all disabled:opacity-50"
                style={{
                  background: tone === t ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                  color: tone === t ? 'white' : 'rgba(255,255,255,0.3)',
                }}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={onClose}
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>
            <X size={12} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 max-h-80 overflow-y-auto">
        <pre className="text-[13px] whitespace-pre-wrap leading-[1.7]"
          style={{ color: 'rgba(255,255,255,0.75)', fontFamily: 'inherit' }}>
          {content.body}
        </pre>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-5 py-3 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <button onClick={handleCopy}
          className="forge-btn-secondary text-[12px] py-2 px-4 gap-1.5">
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button onClick={() => onRefine?.('Regenerate completely fresh', tone)} disabled={isGenerating}
          className="forge-btn-secondary text-[12px] py-2 px-4 gap-1.5 disabled:opacity-50">
          <RefreshCw size={11} className={isGenerating ? "animate-spin" : ""} /> Regenerate
        </button>
        <button onClick={() => onRefine?.('Make this shorter and more concise', tone)} disabled={isGenerating}
          className="forge-btn-secondary text-[12px] py-2 px-4 disabled:opacity-50">Shorten</button>
        <button onClick={() => onRefine?.('Make this much bolder, punchier, and more aggressive', tone)} disabled={isGenerating}
          className="forge-btn-secondary text-[12px] py-2 px-4 disabled:opacity-50">Make bolder</button>
        <button onClick={onSchedule}
          className="ml-auto forge-btn-primary text-[12px] py-2 px-4 gap-1.5">
          <Calendar size={11} /> Add to calendar
        </button>
      </div>
    </div>
  )
}

// ─── COACH CHAT ──────────────────────────────────────────────────────────────

function CoachChat({ accent, handle, onClose, creatorData }) {
  const cleanHandle = (handle || creatorData?.handle || 'default').replace(/^@/, '').toLowerCase()
  const storageKey = `forge_${cleanHandle}_coach_messages`

  const formatChatTime = (timestamp) => {
    if (!timestamp) return ''
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) return ''
      const now = new Date()
      const isToday = date.toDateString() === now.toDateString()
      const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      if (isToday) return timeStr
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`
    } catch {
      return ''
    }
  }

  const [messages, setMessages] = useState(() => {
    try {
      const cached = localStorage.getItem(storageKey) || localStorage.getItem(`forge_${handle}_coach_messages`)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.error(e)
    }
    return [
      {
        role: 'coach',
        text: `Hey ${handle || 'there'}! I'm your Forge coach. I've analyzed your channel and I'm here to help you launch. What do you want to work on?`,
        timestamp: Date.now()
      }
    ]
  })
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const bottomRef = useRef(null)

  // Load any remote database chat history
  useEffect(() => {
    let active = true
    if (!cleanHandle || cleanHandle === 'default') return

    fetch(`/api/chat/messages?handle=${encodeURIComponent(cleanHandle)}`)
      .then(r => r.json())
      .then(d => {
        if (!active || !d.messages || !Array.isArray(d.messages) || d.messages.length === 0) return
        setMessages(prev => {
          const seen = new Set()
          const combined = []
          d.messages.forEach(m => {
            const txt = (m.content || m.text || '').trim()
            const k = `${m.role}:${txt}`
            if (!seen.has(k) && txt) {
              seen.add(k)
              combined.push({
                role: m.role === 'coach' ? 'coach' : (m.role === 'forge' ? 'coach' : 'user'),
                text: txt,
                timestamp: m.timestamp || (m.created_at ? new Date(m.created_at).getTime() : Date.now())
              })
            }
          })
          prev.forEach(m => {
            const txt = (m.text || m.content || '').trim()
            const k = `${m.role}:${txt}`
            if (!seen.has(k) && txt) {
              seen.add(k)
              combined.push(m)
            }
          })
          combined.sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0))
          try {
            localStorage.setItem(storageKey, JSON.stringify(combined))
          } catch {}
          return combined
        })
      })
      .catch(() => {})

    return () => { active = false }
  }, [cleanHandle, storageKey])

  useEffect(() => {
    if (messages && messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages))
    }
  }, [messages, storageKey])

  const QUICK = ['What should I post today?', 'Write my launch email', 'How do I grow faster?', 'Give me 5 hooks']

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    
    const userTs = Date.now()
    const userMsg = { role: 'user', text: msg, timestamp: userTs }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setTyping(true)

    // Save user message to cloud DB
    fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        handle: cleanHandle,
        role: 'user',
        content: msg,
        timestamp: userTs
      })
    }).catch(() => {})
    
    try {
      const history = messages.map(m => ({
        role: m.role === 'coach' ? 'forge' : 'user',
        text: m.text
      }))
      
      const reply = await askForgeChat(msg, history, creatorData)
      const replyTs = Date.now()
      const coachMsg = { role: 'coach', text: reply, timestamp: replyTs }
      setMessages(prev => [...prev, coachMsg])

      // Save coach reply to cloud DB
      fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: cleanHandle,
          role: 'forge',
          content: reply,
          timestamp: replyTs
        })
      }).catch(() => {})
    } catch (err) {
      setMessages(prev => [...prev, { role: 'coach', text: `(Error) ${err.message}`, timestamp: Date.now() }])
    } finally {
      setTyping(false)
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  return (
    <div className={`fixed bottom-6 right-6 z-50 w-96 rounded-2xl border overflow-hidden shadow-2xl transition-all duration-300 ${minimized ? 'h-[52px] cursor-pointer' : ''}`}
      style={{ background: '#0e0e0e', borderColor: 'rgba(255,255,255,0.12)' }}
      onClick={() => minimized && setMinimized(false)}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: minimized ? 'transparent' : 'rgba(255,255,255,0.07)', background: '#111' }}>
        <div style={{ width: 28, height: 28, flexShrink: 0 }}>
          <svg viewBox="0 0 16 16" width="28" height="28" style={{ imageRendering: 'pixelated' }}>
            <rect x="4" y="1" width="8" height="2" fill="#f0d0a0"/>
            <rect x="4" y="3" width="8" height="5" fill="#fde8c8"/>
            <rect x="5" y="5" width="2" height="2" fill="#2a2a2a"/>
            <rect x="9" y="5" width="2" height="2" fill="#2a2a2a"/>
            <rect x="5" y="5" width="1" height="1" fill="white"/>
            <rect x="9" y="5" width="1" height="1" fill="white"/>
            <rect x="6" y="7" width="1" height="1" fill="#c0806a"/>
            <rect x="7" y="8" width="2" height="1" fill="#c0806a"/>
            <rect x="9" y="7" width="1" height="1" fill="#c0806a"/>
            <rect x="5" y="9" width="6" height="4" fill="white"/>
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-white">Forge Coach</p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-white/40">Synced & Persistent</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); setMinimized(!minimized) }} className="text-white/25 hover:text-white/60 transition-colors cursor-pointer">
            <Minus size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onClose() }} className="text-white/25 hover:text-white/60 transition-colors cursor-pointer">
            <X size={14} />
          </button>
        </div>
      </div>

      <div className={`transition-opacity duration-300 ${minimized ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Messages */}
        <div className="overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: 320 }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'coach' && (
                <div style={{ width: 22, height: 22, flexShrink: 0, marginTop: 2 }}>
                  <svg viewBox="0 0 16 16" width="22" height="22" style={{ imageRendering: 'pixelated' }}>
                    <rect x="4" y="3" width="8" height="5" fill="#fde8c8"/>
                    <rect x="5" y="5" width="2" height="2" fill="#2a2a2a"/>
                    <rect x="9" y="5" width="2" height="2" fill="#2a2a2a"/>
                    <rect x="5" y="9" width="6" height="4" fill="white"/>
                  </svg>
                </div>
              )}
              <div
                className="rounded-2xl px-3 py-2.5 max-w-[80%]"
                style={{
                  background: m.role === 'coach' ? '#1a1a1a' : 'white',
                  borderRadius: m.role === 'coach' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                  border: m.role === 'coach' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <pre className="text-[12px] whitespace-pre-wrap leading-relaxed"
                  style={{ color: m.role === 'coach' ? 'rgba(255,255,255,0.85)' : 'black', fontFamily: 'inherit' }}>
                  {m.text || m.content}
                </pre>
              </div>
            </div>
            {m.timestamp && (
              <span className={`text-[9px] font-mono mt-0.5 px-1 ${m.role === 'user' ? 'text-slate-500' : 'text-white/30 ml-8'}`}>
                {formatChatTime(m.timestamp)}
              </span>
            )}
          </div>
        ))}
        {typing && (
          <div className="flex gap-2">
            <div style={{ width: 22, height: 22, flexShrink: 0 }}>
              <svg viewBox="0 0 16 16" width="22" height="22" style={{ imageRendering: 'pixelated' }}>
                <rect x="4" y="3" width="8" height="5" fill="#fde8c8"/>
                <rect x="5" y="9" width="6" height="4" fill="white"/>
              </svg>
            </div>
            <div className="rounded-2xl px-3 py-2.5 flex gap-1 items-center"
              style={{ background: '#1a1a1a', borderRadius: '4px 16px 16px 16px' }}>
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.4)', animationDelay: `${i*0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {QUICK.map(q => (
          <button key={q} onClick={() => send(q)}
            className="flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
          style={{ background: '#111', borderColor: 'rgba(255,255,255,0.1)' }}>
          <input
            className="flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/20"
            placeholder="Ask your coach anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
          />
          <button onClick={() => send()}
            disabled={!input.trim()}
            className="text-white/30 hover:text-white/70 transition-colors disabled:opacity-30">
            <Send size={13} />
          </button>
        </div>
      </div>
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

const ICON_MAP = {
  Share2,
  Mail,
  Video,
  Calendar,
  Sparkles,
  MessageSquare,
  TrendingUp,
  Zap,
}

function buildDynamicTodayActions(creatorData) {
  const p = (creatorData?.platform || 'youtube').toLowerCase()
  const name = creatorData?.name || creatorData?.handle?.replace('@', '') || 'Creator'
  const product = creatorData?.productName || 'VIP Launch Pass'
  const niche = creatorData?.niche || 'creator community'
  const followers = creatorData?.followers ? Number(creatorData.followers).toLocaleString() : 'audience'
  const latestVideo = creatorData?.recentVideos?.[0]?.title || creatorData?.videos?.[0]?.title || null

  if (p === 'youtube') {
    return [
      {
        id: 'teaser',
        priority: 'High',
        label: latestVideo ? `Pin a "${product}" teaser comment on "${latestVideo.slice(0, 32)}…"` : `Post your "${product}" launch teaser video`,
        rationale: `Prime your ${followers} YouTube viewers. Teaser clips 48-72h before launch drive 3.8x higher day-1 conversions for ${niche} channels.`,
        cta: 'Generate teaser',
        contentType: 'Launch Teaser Post',
        icon: Share2
      },
      {
        id: 'email',
        priority: 'High',
        label: `Send VIP founding member invite for "${product}"`,
        rationale: `Convert your warmest subscribers to day-1 buyers. Email converts 3-5x better than YouTube community posts.`,
        cta: 'Write email',
        contentType: 'Launch Announcement Email',
        icon: Mail
      },
      {
        id: 'bts',
        priority: 'Medium',
        label: `Drop a raw behind-the-scenes Short building "${product}"`,
        rationale: `Shorts humanize ${name} and trigger algorithmic discovery across new ${niche} viewers looking to learn your system.`,
        cta: 'Generate caption',
        contentType: 'Behind-the-Scenes Caption',
        icon: Video
      },
      {
        id: 'calendar',
        priority: 'Medium',
        label: `Schedule your launch week uploads & Community Q&A`,
        rationale: `Batch your main videos, Shorts, and Community polls so your launch run has daily momentum.`,
        cta: 'Generate week',
        contentType: '7-Day Launch Calendar',
        icon: Calendar
      }
    ]
  }

  if (p === 'instagram') {
    return [
      {
        id: 'teaser',
        priority: 'High',
        label: `Post your "${product}" launch teaser Reel & pin to profile`,
        rationale: `Priming your ${followers} Instagram followers primes the algorithm and creates early comment demand before checkout opens.`,
        cta: 'Generate teaser',
        contentType: 'Launch Teaser Post',
        icon: Share2
      },
      {
        id: 'email',
        priority: 'High',
        label: `Broadcast VIP access link for "${product}" to your list`,
        rationale: `Move your IG followers to owned media. Email converts 3-5x higher than link in bio taps.`,
        cta: 'Write email',
        contentType: 'Launch Announcement Email',
        icon: Mail
      },
      {
        id: 'bts',
        priority: 'Medium',
        label: `Share a 4-slide behind-the-scenes Story sequence`,
        rationale: `Story sequences build intimate connection and urgency for ${niche} followers following your journey.`,
        cta: 'Generate caption',
        contentType: 'Behind-the-Scenes Caption',
        icon: Video
      },
      {
        id: 'calendar',
        priority: 'Medium',
        label: `Schedule your launch week Stories & broadcast drops`,
        rationale: `Consistency is key during launch week. Pre-batch your daily engagement hooks.`,
        cta: 'Generate week',
        contentType: '7-Day Launch Calendar',
        icon: Calendar
      }
    ]
  }

  if (p === 'twitter' || p === 'x') {
    return [
      {
        id: 'teaser',
        priority: 'High',
        label: `Tweet your "${product}" launch teaser thread`,
        rationale: `Prime your timeline. A hook-heavy teaser thread builds early bookmarks and retweets from ${niche} founders.`,
        cta: 'Generate teaser',
        contentType: 'Launch Teaser Post',
        icon: Share2
      },
      {
        id: 'email',
        priority: 'High',
        label: `Email your list about VIP founding access to "${product}"`,
        rationale: `X algorithms fluctuate, but email lands directly in your followers' primary inboxes.`,
        cta: 'Write email',
        contentType: 'Launch Announcement Email',
        icon: Mail
      },
      {
        id: 'bts',
        priority: 'Medium',
        label: `Post a build-in-public breakdown of "${product}"`,
        rationale: `Share screenshots and lessons learned. X audiences love transparent build-in-public stories.`,
        cta: 'Generate caption',
        contentType: 'Behind-the-Scenes Caption',
        icon: Video
      },
      {
        id: 'calendar',
        priority: 'Medium',
        label: `Schedule your launch week X threads & daily drops`,
        rationale: `Batching your X posts ensures you maintain high visibility without being glued to the timeline.`,
        cta: 'Generate week',
        contentType: '7-Day Launch Calendar',
        icon: Calendar
      }
    ]
  }

  if (p === 'tiktok') {
    return [
      {
        id: 'teaser',
        priority: 'High',
        label: `Post your "${product}" launch teaser TikTok`,
        rationale: `Prime your FYP reach. A high-energy hook generates early search demand and profile visits for ${product}.`,
        cta: 'Generate teaser',
        contentType: 'Launch Teaser Post',
        icon: Share2
      },
      {
        id: 'email',
        priority: 'High',
        label: `Convert TikTok viewers into "${product}" VIP waitlist`,
        rationale: `Convert short-form views into direct revenue before the algorithm shifts.`,
        cta: 'Write email',
        contentType: 'Launch Announcement Email',
        icon: Mail
      },
      {
        id: 'bts',
        priority: 'Medium',
        label: `Share a raw late-night building clip for ${product}`,
        rationale: `TikTok audiences connect with authentic, low-production BTS clips in ${niche}.`,
        cta: 'Generate caption',
        contentType: 'Behind-the-Scenes Caption',
        icon: Video
      },
      {
        id: 'calendar',
        priority: 'Medium',
        label: `Schedule your launch week daily TikTok drops`,
        rationale: `Daily posting during launch week keeps your videos in the FYP loop.`,
        cta: 'Generate week',
        contentType: '7-Day Launch Calendar',
        icon: Calendar
      }
    ]
  }

  return [
    {
      id: 'teaser',
      priority: 'High',
      label: `Post your "${product}" launch teaser announcement`,
      rationale: `Prime your ${followers} audience. Announcing 48-72h ahead drives immediate day-1 momentum for "${product}".`,
      cta: 'Generate teaser',
      contentType: 'Launch Teaser Post',
      icon: Share2
    },
    {
      id: 'email',
      priority: 'High',
      label: `Email your list about VIP founding access to "${product}"`,
      rationale: `Email converts 3-5x better than public social posts. Give your closest fans the first offer.`,
      cta: 'Write email',
      contentType: 'Launch Announcement Email',
      icon: Mail
    },
    {
      id: 'bts',
      priority: 'Medium',
      label: `Share behind-the-scenes building "${product}"`,
      rationale: `Authentic building stories outperform standard promos by 2x in ${niche}.`,
      cta: 'Generate caption',
      contentType: 'Behind-the-Scenes Caption',
      icon: Video
    },
    {
      id: 'calendar',
      priority: 'Medium',
      label: `Schedule your next 7 launch checkpoints`,
      rationale: `Creators who batch weekly post 4x more consistently and double their launch revenue.`,
      cta: 'Generate week',
      contentType: '7-Day Launch Calendar',
      icon: Calendar
    }
  ]
}

const PRIORITY_STYLES = {
  High:   { bg: 'rgba(255,255,255,0.12)', color: 'white' },
  Medium: { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' },
}


const AUTOFILL_JOB = 'autofill-week'

const THEME_COLORS = {
  'launch': 'rgba(255,255,255,0.2)',
  'value': 'rgba(96,165,250,0.2)',
  'bts': 'rgba(225,48,108,0.15)',
  'proof': 'rgba(52,211,153,0.15)',
  'cta': 'rgba(255,59,48,0.2)',
  'community': 'rgba(167,139,250,0.15)',
  'story': 'rgba(251,191,36,0.15)',
}

const THEMES = {
  launch: { label: 'Launch' },
  value: { label: 'Value' },
  bts: { label: 'BTS' },
  proof: { label: 'Proof' },
  cta: { label: 'CTA' },
  community: { label: 'Community' },
  story: { label: 'Story' },
}

const PLATFORM_TYPES = {
  Instagram: ['Post', 'Reel', 'Story', 'Carousel'],
  Twitter: ['Post', 'Thread'],
  YouTube: ['Video', 'Community', 'Shorts', 'Live'],
  TikTok: ['Video'],
  LinkedIn: ['Post'],
  Email: ['Email'],
  Podcast: ['Episode'],
}

function getPlatformName(platform) {
  if (!platform) return 'Instagram'
  const lower = platform.toLowerCase()
  if (lower === 'youtube' || lower === 'yt') return 'YouTube'
  if (lower === 'instagram' || lower === 'ig') return 'Instagram'
  if (lower === 'twitter' || lower === 'x') return 'Twitter'
  if (lower === 'tiktok' || lower === 'tt') return 'TikTok'
  if (lower === 'linkedin' || lower === 'li') return 'LinkedIn'
  if (lower === 'email') return 'Email'
  if (lower === 'podcast') return 'Podcast'
  return 'Instagram'
}

function reverseMapPlatform(p) {
  if (p === 'IG') return 'Instagram'
  if (p === 'X') return 'Twitter'
  if (p === 'YT') return 'YouTube'
  if (p === 'TT') return 'TikTok'
  if (p === 'LI') return 'LinkedIn'
  if (p === 'Email') return 'Email'
  if (p === '✉') return 'Email'
  if (p === '🎙') return 'Podcast'
  return p || 'Instagram'
}

function reverseMapColorToTheme(color) {
  if (!color) return 'value'
  if (color.includes('225,48,108') || color.includes('e1306c')) return 'bts'
  if (color.includes('255,255,255')) return 'launch'
  if (color.includes('96,165,250') || color.includes('60a5fa')) return 'value'
  if (color.includes('52,211,153')) return 'proof'
  if (color.includes('255,59,48') || color.includes('ff3b30')) return 'cta'
  if (color.includes('167,139,250')) return 'community'
  if (color.includes('251,191,36')) return 'story'
  return 'value'
}

function mapCalendarResult(result) {
  if (!Array.isArray(result)) return null
  let idCounter = 1
  return result.map(day => ({
    day: day.day,
    posts: (day.posts || []).map(post => ({
      id: `post-gen-${idCounter++}`,
      type: post.type || 'post',
      label: post.title || 'Untitled Post',
      title: post.title || 'Untitled Post',
      body: post.body || '',
      platform: post.platform || 'IG',
      color: THEME_COLORS[post.theme] || 'rgba(255,255,255,0.12)',
      theme: post.theme || 'launch',
      status: post.status || 'draft',
      done: post.status === 'posted'
    }))
  }))
}

export default function Marketing({ chatOpen: propChatOpen }) {
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
    userProfile,
    chatOpen: contextChatOpen,
    setChatOpen
  } = useForge()
  const isChatOpen = propChatOpen ?? contextChatOpen
  
  // Derive Creator Accent dynamically
  const detectedBrandColor = useMemo(() => {
    if (creatorData?.brand_color && creatorData.brand_color !== '#7C5CFC' && creatorData.brand_color.toLowerCase() !== '#ff3b30') return creatorData.brand_color
    if (creatorData?.brandColor && creatorData.brandColor !== '#7C5CFC' && creatorData.brandColor.toLowerCase() !== '#ff3b30') return creatorData.brandColor
    if (creatorData?.brandHex && creatorData.brandHex !== '#7C5CFC' && creatorData.brandHex.toLowerCase() !== '#ff3b30') return creatorData.brandHex
    if (creatorData?.color && creatorData.color !== '#7C5CFC' && creatorData.color.toLowerCase() !== '#ff3b30') return creatorData.color
    try {
      const rawMap = localStorage.getItem("forge_creator_brand_color_map")
      if (rawMap) {
        const map = JSON.parse(rawMap)
        const id = creatorData?.id
        const handle = (creatorData?.handle || '').replace(/^@/, '').toLowerCase()
        const name = (creatorData?.name || '').toLowerCase()
        if (id && map[id]?.primaryHex && map[id].primaryHex.toLowerCase() !== '#ff3b30') return map[id].primaryHex
        if (handle && map[handle]?.primaryHex && map[handle].primaryHex.toLowerCase() !== '#ff3b30') return map[handle].primaryHex
        if (name && map[name]?.primaryHex && map[name].primaryHex.toLowerCase() !== '#ff3b30') return map[name].primaryHex
      }
    } catch {}
    const det = getDeterministicBrandColor(creatorData)
    if (det?.primaryHex && det.primaryHex.toLowerCase() !== '#ff3b30') {
      return det.primaryHex
    }
    return '#10B981'
  }, [creatorData?.brand_color, creatorData?.brandColor, creatorData?.brandHex, creatorData?.color, creatorData?.name, creatorData?.id, creatorData?.handle])

  const [cr, cg, cb] = useMemo(() => hexToRgb(detectedBrandColor), [detectedBrandColor])
  const brandTextColor = useMemo(() => getContrastTextColor(detectedBrandColor), [detectedBrandColor])
  const accent = useMemo(() => ({
    color: detectedBrandColor,
    rgb: `${cr},${cg},${cb}`,
    contrastText: brandTextColor
  }), [detectedBrandColor, cr, cg, cb, brandTextColor])

  // Resolve creator's latest videos (from real scraped posts or tailored high-production fallbacks)
  const displayVideos = useMemo(() => {
    if (Array.isArray(creatorData?.recentPosts) && creatorData.recentPosts.length >= 3) {
      return creatorData.recentPosts.slice(0, 6).map(p => ({
        title: p.title || 'Latest Video',
        thumbnail: p.thumbnail,
        views: p.views || '12K',
        likes: p.likes,
        url: p.url || (p.videoId ? `https://www.youtube.com/watch?v=${p.videoId}` : '#')
      }))
    }
    if (Array.isArray(creatorData?.youtube_data?.latest_videos) && creatorData.youtube_data.latest_videos.length >= 3) {
      return creatorData.youtube_data.latest_videos.slice(0, 6).map(v => ({
        title: v.title || 'Recent Video',
        thumbnail: v.thumbnail || v.thumbnailUrl,
        views: v.views ? (typeof v.views === 'number' ? `${Math.round(v.views/1000)}K` : String(v.views)) : '18K',
        likes: v.likes,
        url: v.url || '#'
      }))
    }
    if (Array.isArray(creatorData?.audienceIntelligence?.topContent) && creatorData.audienceIntelligence.topContent.length >= 3) {
      return creatorData.audienceIntelligence.topContent.slice(0, 6).map(c => ({
        title: c.title || 'Top Performance Video',
        thumbnail: c.thumbnail,
        views: c.views || '45K',
        likes: c.likes,
        url: c.url || '#'
      }))
    }

    const name = (creatorData?.name || '').toLowerCase()
    const handle = (creatorData?.handle || '').toLowerCase()
    const niche = (creatorData?.niche || '').toLowerCase()

    if (name.includes('bbc') || handle.includes('bbc')) {
      return [
        {
          title: 'Top 5 Monkey Moments | BBC Earth',
          views: '2K',
          thumbnail: 'https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=400&auto=format&fit=crop&q=80',
          url: 'https://www.youtube.com/@BBCStudios'
        },
        {
          title: 'Ancient Egypt: Pyramids, Tombs & Secrets',
          views: '2K',
          thumbnail: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=400&auto=format&fit=crop&q=80',
          url: 'https://www.youtube.com/@BBCStudios'
        },
        {
          title: 'Uncovering the Truth Behind the Legend',
          views: '2K',
          thumbnail: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&auto=format&fit=crop&q=80',
          url: 'https://www.youtube.com/@BBCStudios'
        },
        {
          title: 'Extraordinary Animal Encounters in the Wild',
          views: '37K',
          thumbnail: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&auto=format&fit=crop&q=80',
          url: 'https://www.youtube.com/@BBCStudios'
        },
        {
          title: 'The Remarkable Nature of Arctic Wolves',
          views: '2K',
          thumbnail: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&auto=format&fit=crop&q=80',
          url: 'https://www.youtube.com/@BBCStudios'
        },
        {
          title: "'Allo 'Allo Series 1 Funny Outtakes & Comedy",
          views: '7K',
          thumbnail: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=400&auto=format&fit=crop&q=80',
          url: 'https://www.youtube.com/@BBCStudios'
        }
      ]
    }

    if (name.includes('brownlee') || handle.includes('mkbhd') || niche.includes('tech') || niche.includes('gear')) {
      return [
        {
          title: 'The Ultimate Studio Tour 2026',
          views: '1.8M',
          thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&auto=format&fit=crop&q=80',
          url: 'https://www.youtube.com/@mkbhd'
        },
        {
          title: 'Blind Smartphone Camera Test Results',
          views: '2.4M',
          thumbnail: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?w=400&auto=format&fit=crop&q=80',
          url: 'https://www.youtube.com/@mkbhd'
        },
        {
          title: 'Best Desk Setup Gear Under $100',
          views: '920K',
          thumbnail: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&auto=format&fit=crop&q=80',
          url: 'https://www.youtube.com/@mkbhd'
        },
        {
          title: 'Apple Vision Pro 2: Real World Review',
          views: '3.1M',
          thumbnail: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&auto=format&fit=crop&q=80',
          url: 'https://www.youtube.com/@mkbhd'
        },
        {
          title: 'Red Cinema Camera vs Sony FX9 Shootout',
          views: '640K',
          thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&auto=format&fit=crop&q=80',
          url: 'https://www.youtube.com/@mkbhd'
        },
        {
          title: 'My Everyday Tech & EDC Essentials',
          views: '1.2M',
          thumbnail: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&auto=format&fit=crop&q=80',
          url: 'https://www.youtube.com/@mkbhd'
        }
      ]
    }

    if (name.includes('ali') || handle.includes('abdaal') || niche.includes('productivity')) {
      return [
        {
          title: 'How I Manage 5 Businesses in 20 Hours a Week',
          views: '840K',
          thumbnail: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&auto=format&fit=crop&q=80',
          url: 'https://www.youtube.com/@aliabdaal'
        },
        {
          title: '7 Principles of Real Wealth and Freedom',
          views: '1.4M',
          thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80',
          url: 'https://www.youtube.com/@aliabdaal'
        },
        {
          title: 'My Complete Notion Second Brain System',
          views: '2.1M',
          thumbnail: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&auto=format&fit=crop&q=80',
          url: 'https://www.youtube.com/@aliabdaal'
        },
        {
          title: 'How to Build Recurring Software Income',
          views: '620K',
          thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80',
          url: 'https://www.youtube.com/@aliabdaal'
        },
        {
          title: '10 Books That Completely Changed My Mindset',
          views: '980K',
          thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80',
          url: 'https://www.youtube.com/@aliabdaal'
        },
        {
          title: 'The Ultimate Minimalist Creator Desk Setup',
          views: '710K',
          thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
          url: 'https://www.youtube.com/@aliabdaal'
        }
      ]
    }

    const cName = creatorData?.name || creatorData?.handle?.replace('@','') || 'Creator'
    return [
      {
        title: `${cName}'s Complete Launch Blueprint & Reveal`,
        views: '142K',
        thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&auto=format&fit=crop&q=80',
        url: '#'
      },
      {
        title: 'Behind the Scenes: How We Built This Platform',
        views: '88K',
        thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80',
        url: '#'
      },
      {
        title: '5 Core Bottlenecks Our Audience Shared This Month',
        views: '64K',
        thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&auto=format&fit=crop&q=80',
        url: '#'
      },
      {
        title: 'Masterclass: What Actually Converts Followers to Members',
        views: '210K',
        thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&auto=format&fit=crop&q=80',
        url: '#'
      },
      {
        title: 'Exclusive Member Q&A and Community Roadmap',
        views: '49K',
        thumbnail: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&auto=format&fit=crop&q=80',
        url: '#'
      },
      {
        title: 'Everything You Need to Know Before Joining',
        views: '175K',
        thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format&fit=crop&q=80',
        url: '#'
      }
    ]
  }, [creatorData])

  const autofillJob = useBgJob(AUTOFILL_JOB)

  const handle      = creatorData.handle      || '@creator'
  const displayName = creatorData.name        || handle.replace('@','')
  const productName = creatorData.productName || 'Creator Academy'
  const niche       = creatorData.niche        || 'your niche'

  const CONTENT = buildContent(handle, productName, niche)

  const [dismissedActions, setDismissedActions] = useState(() => {
    try {
      const newKey = `forge_${handle}_launch_pack_dismissed_actions`
      const oldKey = `forge_${handle}_dismissed_actions`
      const cached = localStorage.getItem(newKey) || localStorage.getItem(oldKey)
      return cached ? JSON.parse(cached) : []
    } catch { return [] }
  })
  const [completedActions, setCompletedActions] = useState(() => {
    try {
      const newKey = `forge_${handle}_launch_pack_completed_actions`
      const oldKey = `forge_${handle}_completed_actions`
      const cached = localStorage.getItem(newKey) || localStorage.getItem(oldKey)
      return cached ? JSON.parse(cached) : []
    } catch { return [] }
  })
  const [dynamicPriorities, setDynamicPriorities] = useState(() => {
    const handle = creatorData?.handle || 'default'
    try {
      const cached = localStorage.getItem(`forge_${handle}_dynamic_priorities`) || localStorage.getItem(`forge_${handle.toLowerCase()}_dynamic_priorities`)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.error('Failed to parse cached dynamic priorities:', e)
    }
    return null
  })
  const [isPrioritiesGenerating, setIsPrioritiesGenerating] = useState(false)
  const [generating, setGenerating]             = useState(null)
  const [openOutputId, setOpenOutputId]         = useState(null)  // which action's output is open
  const [generatedContents, setGeneratedContents] = useState(() => {
    const handle = creatorData?.handle || 'default'
    try {
      const cached = localStorage.getItem(`forge_${handle}_launch_pack_contents`) || localStorage.getItem(`forge_${handle.toLowerCase()}_launch_pack_contents`)
      return cached ? JSON.parse(cached) : {}
    } catch (e) {
      console.error('Failed to parse cached launch pack contents:', e)
      return {}
    }
  })
  const [selectedPost, setSelectedPost]         = useState(null)
  const [selectedPostDay, setSelectedPostDay]   = useState(null)
  const [week, setWeek]                         = useState(() => {
    const handle = creatorData?.handle || 'default'
    const cacheKey = `forge_calendar_${handle}_launch_w0`
    const cacheKeyLower = `forge_calendar_${handle.toLowerCase()}_launch_w0`
    try {
      const cached = localStorage.getItem(cacheKey) || localStorage.getItem(cacheKeyLower)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (!isMockupCalendar(parsed)) {
          return mapCalendarResult(parsed)
        }
      }
    } catch (e) {
      console.error('Failed to parse cached calendar:', e)
    }
    return null
  })
  const [scheduledToast, setScheduledToast]     = useState(null)
  const [coachTrigger, setCoachTrigger]         = useState('idle')
  const [showCoachChat, setShowCoachChat]       = useState(false)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newPostData, setNewPostData] = useState({
    title: '',
    day: 'Mon',
    platform: 'Instagram',
    type: 'Post',
    theme: 'launch',
    status: 'draft'
  })

  const getRawCalendar = () => {
    const handle = creatorData?.handle || 'default'
    const cacheKey = `forge_calendar_${handle}_launch_w0`
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try {
        return JSON.parse(cached)
      } catch (e) {
        console.error('Failed to parse cached calendar:', e)
      }
    }
    if (week) {
      let idCounter = 1
      return week.map(dayData => ({
        day: dayData.day,
        posts: (dayData.posts || []).map(post => {
          const platform = reverseMapPlatform(post.platform)
          const theme = reverseMapColorToTheme(post.color)
          return {
            id: idCounter++,
            platform,
            type: post.type || 'Post',
            title: post.label || 'Untitled Post',
            theme,
            status: post.done ? 'posted' : 'draft'
          }
        })
      }))
    }
    return DAYS.map(day => ({ day, posts: [] }))
  }

  const coachMessage = getCoachMessage(coachTrigger, creatorData)

  // Load/reload cached contents when handle resolves or changes
  useEffect(() => {
    const h = creatorData?.handle
    if (!h || h === 'default') return
    
    const cachedContents = localStorage.getItem(`forge_${h}_launch_pack_contents`) || localStorage.getItem(`forge_${h.toLowerCase()}_launch_pack_contents`)
    if (cachedContents) {
      try {
        const parsed = JSON.parse(cachedContents)
        console.log('[Forge Marketing] Loaded cached launch pack contents:', parsed)
        setGeneratedContents(parsed)
      } catch (e) {
        console.error('Failed to parse cached launch pack contents:', e)
      }
    }
    
    const cacheKey = `forge_calendar_${h}_launch_w0`
    const cacheKeyLower = `forge_calendar_${h.toLowerCase()}_launch_w0`
    const cached = localStorage.getItem(cacheKey) || localStorage.getItem(cacheKeyLower)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (!isMockupCalendar(parsed)) {
          console.log('[Forge Marketing] Loaded cached launch week calendar:', parsed)
          setWeek(mapCalendarResult(parsed))
        }
      } catch (e) {
        console.error('Failed to parse cached calendar:', e)
      }
    }
    const cachedDismissed = localStorage.getItem(`forge_${h}_launch_pack_dismissed_actions`) ||
                            localStorage.getItem(`forge_${h.toLowerCase()}_launch_pack_dismissed_actions`) ||
                            localStorage.getItem(`forge_${h}_dismissed_actions`) ||
                            localStorage.getItem(`forge_${h.toLowerCase()}_dismissed_actions`)
    if (cachedDismissed) {
      try {
        const parsed = JSON.parse(cachedDismissed)
        console.log('[Forge Marketing] Loaded cached dismissed priorities:', parsed)
        setDismissedActions(parsed)
      } catch (e) {
        console.error('Failed to parse cached dismissed actions:', e)
      }
    }

    const cachedCompleted = localStorage.getItem(`forge_${h}_launch_pack_completed_actions`) ||
                            localStorage.getItem(`forge_${h.toLowerCase()}_launch_pack_completed_actions`) ||
                            localStorage.getItem(`forge_${h}_completed_actions`) ||
                            localStorage.getItem(`forge_${h.toLowerCase()}_completed_actions`)
    if (cachedCompleted) {
      try {
        const parsed = JSON.parse(cachedCompleted)
        console.log('[Forge Marketing] Loaded cached completed priorities:', parsed)
        setCompletedActions(parsed)
      } catch (e) {
        console.error('Failed to parse cached completed actions:', e)
      }
    }

    const cachedPriorities = localStorage.getItem(`forge_${h}_dynamic_priorities`) ||
                            localStorage.getItem(`forge_${h.toLowerCase()}_dynamic_priorities`)
    if (cachedPriorities) {
      try {
        const parsed = JSON.parse(cachedPriorities)
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('[Forge Marketing] Loaded cached dynamic priorities:', parsed)
          setDynamicPriorities(parsed)
        }
      } catch (e) {
        console.error('Failed to parse cached dynamic priorities:', e)
      }
    }
  }, [creatorData?.handle, dbLoadedTimestamp])

  // ── Load cache or trigger autofill on mount
  useEffect(() => {
    // Wait for DB profile and AI keys to finish restoring if logged in
    if (userProfile?.username && dbLoadedTimestamp === 0) {
      return
    }
    const h = creatorData?.handle
    if (!h || h === 'default') return

    if (!week) {
      const cacheKey = `forge_calendar_${h}_launch_w0`
      const cacheKeyLower = `forge_calendar_${h.toLowerCase()}_launch_w0`
      const cached = localStorage.getItem(cacheKey) || localStorage.getItem(cacheKeyLower)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (!isMockupCalendar(parsed)) {
            setWeek(mapCalendarResult(parsed))
            return
          }
        } catch (e) {
          console.error('Failed to parse cached calendar:', e)
        }
      }

      // If not cached or was old mockup, trigger AI autofill so skeleton shows!
      if (hasTextKey() && autofillJob.status === 'idle') {
        startBgJob(AUTOFILL_JOB, (sig) => generateContentCalendar(creatorData, 'launch', sig))
      }
    }
  }, [creatorData?.handle, week, autofillJob.status, dbLoadedTimestamp, userProfile?.username])

  // ── Apply result when autofill job finishes (even if user was on another tab)
  useEffect(() => {
    if (autofillJob.status === 'done' && autofillJob.result) {
      const mapped = mapCalendarResult(autofillJob.result)
      if (mapped) {
        setWeek(mapped)
        const handle = creatorData?.handle || 'default'
        const cacheKey = `forge_calendar_${handle}_launch_w0`
        localStorage.setItem(cacheKey, JSON.stringify(autofillJob.result))
        clearBgJob(AUTOFILL_JOB)
        if (triggerToast) triggerToast('Weekly content calendar autofilled!', 'success')
        setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
      } else {
        console.warn('[Forge] Weekly calendar mapping failed. Falling back to tailored week.')
        const fallback = buildFallbackWeek(creatorData)
        setWeek(mapCalendarResult(fallback))
        clearBgJob(AUTOFILL_JOB)
      }
    } else if (autofillJob.status === 'error' || autofillJob.status === 'cancelled') {
      const handle = creatorData?.handle || 'default'
      const cacheKey = `forge_calendar_${handle}_launch_w0`
      const cacheKeyLower = `forge_calendar_${handle.toLowerCase()}_launch_w0`
      const cached = localStorage.getItem(cacheKey) || localStorage.getItem(cacheKeyLower)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (!isMockupCalendar(parsed)) {
            setWeek(mapCalendarResult(parsed))
            clearBgJob(AUTOFILL_JOB)
            return
          }
        } catch (e) {}
      }
      // If error and no valid cache, set tailored fallback
      const fallback = buildFallbackWeek(creatorData)
      setWeek(mapCalendarResult(fallback))
      clearBgJob(AUTOFILL_JOB)
    }
  }, [autofillJob.status, autofillJob.result])

  // Close modal on escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAddModalOpen) {
        setIsAddModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAddModalOpen])

  const handleAutoFillWeek = () => {
    if (incrementAiActions) incrementAiActions()
    setWeek(null)
    startBgJob(AUTOFILL_JOB, (sig) => generateContentCalendar(creatorData, 'launch', sig))
  }

  const handleRegeneratePriorities = async () => {
    if (isPrioritiesGenerating) return
    setIsPrioritiesGenerating(true)
    if (incrementAiActions) incrementAiActions()
    try {
      const aiPriorities = await generateTodayPrioritiesAI(creatorData)
      if (aiPriorities && Array.isArray(aiPriorities) && aiPriorities.length > 0) {
        setDynamicPriorities(aiPriorities)
        const handle = creatorData?.handle || 'default'
        localStorage.setItem(`forge_${handle}_dynamic_priorities`, JSON.stringify(aiPriorities))
        if (triggerToast) triggerToast("Today's priorities personalized by Forge AI!", 'success')
        setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
      } else {
        const fallback = buildDynamicTodayActions(creatorData)
        setDynamicPriorities(fallback)
        const handle = creatorData?.handle || 'default'
        localStorage.setItem(`forge_${handle}_dynamic_priorities`, JSON.stringify(fallback))
      }
    } catch (e) {
      console.warn('Failed to regenerate priorities with AI:', e)
      const fallback = buildDynamicTodayActions(creatorData)
      setDynamicPriorities(fallback)
    } finally {
      setIsPrioritiesGenerating(false)
    }
  }

  // Load or generate dynamic priorities on mount if not already cached
  useEffect(() => {
    const h = creatorData?.handle
    if (!h || h === 'default') return

    if (!dynamicPriorities && hasTextKey() && !isPrioritiesGenerating) {
      handleRegeneratePriorities()
    }
  }, [creatorData?.handle, dynamicPriorities])

  const fallbackActions = useMemo(() => buildDynamicTodayActions(creatorData), [creatorData])
  const todayActions = useMemo(() => {
    if (dynamicPriorities && Array.isArray(dynamicPriorities) && dynamicPriorities.length > 0) {
      return dynamicPriorities.map(a => ({
        ...a,
        icon: typeof a.icon === 'function' ? a.icon : (ICON_MAP[a.icon] || Sparkles)
      }))
    }
    return fallbackActions
  }, [dynamicPriorities, fallbackActions])

  const isActionStruck = (id) => completedActions.includes(id) || dismissedActions.includes(id)

  const sortedActions = useMemo(() => {
    const active = todayActions.filter(a => !isActionStruck(a.id))
    const struck = todayActions.filter(a => isActionStruck(a.id))
    return [...active, ...struck]
  }, [todayActions, completedActions, dismissedActions])

  const remainingCount = useMemo(() => {
    return todayActions.filter(a => !isActionStruck(a.id)).length
  }, [todayActions, completedActions, dismissedActions])

  const completedCount = useMemo(() => {
    return todayActions.filter(a => isActionStruck(a.id)).length
  }, [todayActions, completedActions, dismissedActions])

  const handleToggleStrikeAction = (actionId) => {
    const isCurrentlyStruck = isActionStruck(actionId)

    if (isCurrentlyStruck) {
      setCompletedActions(prev => {
        const next = prev.filter(id => id !== actionId)
        localStorage.setItem(`forge_${handle}_launch_pack_completed_actions`, JSON.stringify(next))
        return next
      })
      setDismissedActions(prev => {
        const next = prev.filter(id => id !== actionId)
        localStorage.setItem(`forge_${handle}_launch_pack_dismissed_actions`, JSON.stringify(next))
        return next
      })
    } else {
      setCompletedActions(prev => {
        const next = prev.includes(actionId) ? prev : [...prev, actionId]
        localStorage.setItem(`forge_${handle}_launch_pack_completed_actions`, JSON.stringify(next))
        return next
      })
      setDismissedActions(prev => {
        const next = prev.includes(actionId) ? prev : [...prev, actionId]
        localStorage.setItem(`forge_${handle}_launch_pack_dismissed_actions`, JSON.stringify(next))
        return next
      })
    }
    setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
  }

  const handleRefine = async (id, instruction, tone) => {
    setGenerating(id)
    if (incrementAiActions) incrementAiActions()
    try {
      if (!hasTextKey()) {
        setApiModalOpen(true)
        setGenerating(null)
        return
      }
      
      const typeMap = {
        'teaser': 'Launch Teaser Post',
        'email': 'Launch Announcement Email',
        'bts': 'Behind-the-Scenes Caption',
        'calendar': '7-Day Launch Calendar'
      }
      const contentType = typeMap[id] || id
      
      const existingContent = generatedContents[id]?.body || CONTENT[id]?.body || ""
      const newContext = instruction.startsWith('Regenerate') 
        ? "I need fresh launch materials. Be completely different from previous generation."
        : `Modify this existing content:\n\n"${existingContent}"\n\nInstruction: ${instruction}`
      
      const result = await generateStudioContent(contentType, newContext, creatorData, tone)
      
      setGeneratedContents(prev => {
        const updated = {
          ...prev,
          [id]: {
            title: CONTENT[id]?.title || contentType,
            platforms: result.platforms || CONTENT[id]?.platforms || ['All platforms'],
            body: result.body || result.text || result
          }
        }
        const h = creatorData?.handle || 'default'
        console.log(`[Forge Marketing] Refined marketing content for "${id}":`, updated[id])
        localStorage.setItem(`forge_${h}_launch_pack_contents`, JSON.stringify(updated))
        return updated
      })
      setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
    } catch (err) {
      console.error(err)
      alert("Error refining content: " + err.message)
    } finally {
      setGenerating(null)
    }
  }

  const handleGenerate = async (actionOrId) => {
    const id = typeof actionOrId === 'string' ? actionOrId : actionOrId.id
    const action = typeof actionOrId === 'object' ? actionOrId : todayActions.find(a => a.id === id)

    if (generatedContents[id]) {
      setOpenOutputId(id)
      return
    }

    setGenerating(id)
    setCoachTrigger(id)
    if (incrementAiActions) incrementAiActions()
    try {
      if (!hasTextKey()) {
        setApiModalOpen(true)
        setGenerating(null)
        return
      }
      
      const contentType = action?.contentType || (id === 'teaser' ? 'Launch Teaser Post' : id === 'email' ? 'Launch Announcement Email' : id === 'bts' ? 'Behind-the-Scenes Caption' : '7-Day Launch Calendar')
      const contextPrompt = action?.promptContext || action?.label || `I need launch materials for ${productName}.`
      
      const result = await generateStudioContent(contentType, contextPrompt, creatorData)
      
      setGeneratedContents(prev => {
        const updated = {
          ...prev,
          [id]: {
            title: action?.label || CONTENT[id]?.title || contentType,
            platforms: result.platforms || CONTENT[id]?.platforms || [getPlatformName(creatorData?.platform)],
            body: result.body || result.text || result
          }
        }
        const h = creatorData?.handle || 'default'
        console.log(`[Forge Marketing] Generated marketing content for "${id}":`, updated[id])
        localStorage.setItem(`forge_${h}_launch_pack_contents`, JSON.stringify(updated))
        return updated
      })
      
      setGenerating(null)
      setOpenOutputId(id)
      setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
    } catch (err) {
      console.error(err)
      alert("Error generating content: " + err.message)
      setGenerating(null)
    }
  }

  const handleSchedule = (id) => {
    setOpenOutputId(null)
    setScheduledToast(id)
    setCoachTrigger('scheduled')

    // Map action id → calendar post shape
    const content = generatedContents[id] || CONTENT[id]
    const body    = content?.body || ''

    const p = (creatorData?.platform || 'other').toLowerCase()
    let teaserPostShape = { type: 'reel', label: 'Launch teaser post', platform: 'IG', color: 'rgba(225,48,108,0.25)', theme: 'launch' }
    let btsPostShape = { type: 'reel', label: 'Behind-the-scenes caption', platform: 'IG', color: 'rgba(225,48,108,0.15)', theme: 'bts' }
    let calendarPostShape = { type: 'thread', label: '7-Day launch plan drafted', platform: 'All', color: 'rgba(96,165,250,0.2)', theme: 'value' }

    if (p === 'youtube') {
      teaserPostShape = { type: 'Shorts', label: 'Launch teaser video', platform: 'YT', color: 'rgba(255,59,48,0.25)', theme: 'launch' }
      btsPostShape = { type: 'Shorts', label: 'Behind-the-scenes Short', platform: 'YT', color: 'rgba(255,59,48,0.15)', theme: 'bts' }
      calendarPostShape = { type: 'Video', label: 'Launch week uploads plan', platform: 'YT', color: 'rgba(255,59,48,0.2)', theme: 'value' }
    } else if (p === 'twitter' || p === 'x') {
      teaserPostShape = { type: 'Thread', label: 'Launch teaser thread', platform: 'X', color: 'rgba(96,165,250,0.25)', theme: 'launch' }
      btsPostShape = { type: 'Post', label: 'Behind-the-scenes thread', platform: 'X', color: 'rgba(96,165,250,0.15)', theme: 'bts' }
      calendarPostShape = { type: 'Thread', label: 'X launch plan scheduled', platform: 'X', color: 'rgba(96,165,250,0.2)', theme: 'value' }
    } else if (p === 'tiktok') {
      teaserPostShape = { type: 'Video', label: 'Launch teaser TikTok', platform: 'TT', color: 'rgba(0,200,200,0.25)', theme: 'launch' }
      btsPostShape = { type: 'Video', label: 'Behind-the-scenes TikTok', platform: 'TT', color: 'rgba(0,200,200,0.15)', theme: 'bts' }
      calendarPostShape = { type: 'Video', label: 'TikTok launch schedule plan', platform: 'TT', color: 'rgba(0,200,200,0.2)', theme: 'value' }
    } else if (p === 'twitch') {
      teaserPostShape = { type: 'Stream', label: 'Launch stream countdown', platform: 'Twitch', color: 'rgba(145,70,255,0.25)', theme: 'launch' }
      btsPostShape = { type: 'Clip', label: 'Behind-the-scenes stream clip', platform: 'Twitch', color: 'rgba(145,70,255,0.15)', theme: 'bts' }
      calendarPostShape = { type: 'Stream', label: 'Twitch launch streams schedule', platform: 'Twitch', color: 'rgba(145,70,255,0.2)', theme: 'value' }
    }

    const ACTION_POST_MAP = {
      teaser: teaserPostShape,
      email: { type: 'email', label: 'Launch announcement email', platform: 'Email', color: 'rgba(255,255,255,0.12)', theme: 'launch' },
      bts: btsPostShape,
      calendar: calendarPostShape,
    }

    const postShape = ACTION_POST_MAP[id]
    if (postShape) {
      const newPost = {
        id: Date.now().toString(),
        ...postShape,
        title: postShape.label,
        body,
        status: 'scheduled',
        done: false,
      }

      setWeek(prev => {
        if (!prev) return null
        const updated = prev.map((d, i) => i === TODAY_IDX
          ? { ...d, posts: [...(d.posts || []), newPost] }
          : d
        )
        // Persist to localStorage
        const h = creatorData?.handle || 'default'
        const raw = updated.map(dayData => ({
          day: dayData.day,
          posts: (dayData.posts || []).map(p => ({
            id: p.id,
            platform: reverseMapPlatform(p.platform) || p.platform,
            type: p.type || 'Post',
            title: p.title || p.label || 'Untitled',
            body: p.body || '',
            theme: p.theme || reverseMapColorToTheme(p.color),
            status: p.done ? 'posted' : (p.status || 'draft'),
          }))
        }))
        localStorage.setItem(`forge_calendar_${h}_launch_w0`, JSON.stringify(raw))
        return updated
      })
    }

    // Mark as completed so it vanishes from Today's Priorities
    setCompletedActions(prev => {
      const next = prev.includes(id) ? prev : [...prev, id]
      localStorage.setItem(`forge_${handle}_launch_pack_completed_actions`, JSON.stringify(next))
      return next
    })

    setTimeout(() => setScheduledToast(null), 3000)
    setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
  }

  const handleCopy = () => {
    setCoachTrigger('copied')
  }

  const handleAddPost = (dayIdx) => {
    const defaultPlatform = getPlatformName(creatorData.platform)
    const defaultTypes = PLATFORM_TYPES[defaultPlatform] || ['Post']
    
    setNewPostData({
      title: '',
      day: DAYS[dayIdx] !== undefined ? DAYS[dayIdx] : 'Mon',
      platform: defaultPlatform,
      type: defaultTypes[0],
      theme: 'launch',
      status: 'draft'
    })
    setIsAddModalOpen(true)
  }

  const handleSaveNewPost = () => {
    if (!newPostData.title.trim()) return

    const newPost = {
      id: Date.now(),
      platform: newPostData.platform,
      type: newPostData.type,
      title: newPostData.title,
      theme: newPostData.theme,
      status: newPostData.status,
    }

    const rawCalendar = getRawCalendar()
    const updatedRaw = rawCalendar.map(d => {
      if (d.day === newPostData.day) {
        return {
          ...d,
          posts: [...(d.posts || []), newPost]
        }
      }
      return d
    })

    const handle = creatorData?.handle || 'default'
    const cacheKey = `forge_calendar_${handle}_launch_w0`
    localStorage.setItem(cacheKey, JSON.stringify(updatedRaw))

    // Update the local state week with mapped format
    const mapped = mapCalendarResult(updatedRaw)
    if (mapped) {
      setWeek(mapped)
    }

    setIsAddModalOpen(false)
    setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
  }

  const handleSaveEditedPost = (updatedPost, day) => {
    setWeek(prev => {
      if (!prev) return null
      return prev.map(d =>
        d.day === day
          ? {
              ...d,
              posts: (d.posts || []).map(p =>
                p.id === updatedPost.id
                  ? { ...p, ...updatedPost, label: updatedPost.title || p.label }
                  : p
              )
            }
          : d
      )
    })
    // Persist to localStorage
    const raw = getRawCalendar()
    const updatedRaw = raw.map(d => {
      if (d.day === day) {
        return {
          ...d,
          posts: (d.posts || []).map(p =>
            (p.id?.toString() === updatedPost.id?.toString())
              ? { ...p, title: updatedPost.title, body: updatedPost.body, platform: updatedPost.platform, type: updatedPost.type, theme: updatedPost.theme, status: updatedPost.status }
              : p
          )
        }
      }
      return d
    })
    const h = creatorData?.handle || 'default'
    localStorage.setItem(`forge_calendar_${h}_launch_w0`, JSON.stringify(updatedRaw))
    setSelectedPost(null)
    if (triggerToast) triggerToast('Post draft updated!', 'success')
    setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-7 max-w-7xl mx-auto w-full">

      {/* ─── CREATOR PROFILE CARD ────────────────────────────────── */}
      <div className="rounded-2xl border overflow-hidden"
        style={{ background: 'var(--theme-card-bg)', borderColor: 'var(--theme-border-color)' }}>
        {/* Top strip: avatar + name + stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 border-b"
          style={{ borderColor: 'var(--theme-border-color)' }}>
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border-2 flex items-center justify-center"
                style={{
                  borderColor: 'var(--theme-accent-border)',
                  background: 'var(--theme-accent-bg)',
                }}>
                {creatorData.avatarUrl ? (
                  <img src={creatorData.avatarUrl} alt={displayName}
                    className="w-full h-full object-cover"
                    onError={e => { e.currentTarget.style.display = 'none' }} />
                ) : (
                  <span className="text-lg sm:text-xl font-bold text-white/60">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border flex items-center justify-center"
                style={{ background: 'var(--theme-card-bg)', borderColor: 'var(--theme-accent-border)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--theme-accent)' }} />
              </div>
            </div>

            {/* Name + handle + niche */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[15px] sm:text-[16px] font-bold text-white truncate">{displayName}</p>
                <p className="text-[11px] sm:text-[12px] truncate" style={{ color: 'var(--theme-text-muted)' }}>{handle}</p>
                <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full capitalize"
                  style={{ background: 'var(--theme-accent-bg)', color: 'var(--theme-accent)' }}>
                  {creatorData.platform || 'creator'}
                </span>
              </div>
              {niche && niche !== 'your niche' && (
                <p className="text-[11px] sm:text-[12px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>{niche}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5 sm:gap-6 flex-shrink-0 self-start sm:self-center">
            {creatorData.followers > 0 && (
              <div className="text-right">
                <p className="text-[15px] sm:text-[16px] font-bold text-white">
                  {creatorData.followers >= 1_000_000
                    ? `${(creatorData.followers/1_000_000).toFixed(1)}M`
                    : creatorData.followers >= 1_000
                      ? `${Math.round(creatorData.followers/1_000)}K`
                      : creatorData.followers}
                </p>
                <p className="text-[9px] sm:text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>followers</p>
              </div>
            )}
            {creatorData.engagementRate > 0 && (
              <div className="text-right">
                <p className="text-[15px] sm:text-[16px] font-bold text-white">{creatorData.engagementRate}%</p>
                <p className="text-[9px] sm:text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>engagement</p>
              </div>
            )}
            {creatorData.followers > 0 && creatorData.engagementRate > 0 && (
              <div className="text-right hidden xs:block">
                <p className="text-[15px] sm:text-[16px] font-bold text-white">
                  {(() => {
                    const r = Math.round(creatorData.followers * creatorData.engagementRate / 100)
                    return r >= 1_000 ? `${Math.round(r/1_000)}K` : r
                  })()}
                </p>
                <p className="text-[9px] sm:text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>avg reach</p>
              </div>
            )}
          </div>
        </div>

        {/* Latest videos / posts grid matching Demo Video (0:36s) */}
        <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--theme-border-color)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {creatorData.platform === 'instagram' ? 'Recent posts' : 'Latest videos'}
            </p>
            <span className="text-[10px] font-semibold flex items-center gap-1.5" style={{ color: accent.color }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent.color }} />
              Channel sync active
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pb-0.5">
            {displayVideos.map((post, i) => {
              const postUrl = post.url || '#'
              return (
                <a
                  key={i}
                  href={postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative rounded-xl overflow-hidden cursor-pointer block border transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-600"
                  style={{
                    aspectRatio: '16/10',
                    background: 'rgba(255,255,255,0.03)',
                    borderColor: 'rgba(255,255,255,0.08)'
                  }}
                >
                  {post.thumbnail ? (
                    <img 
                      src={post.thumbnail} 
                      alt={post.title || ''} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={e => {
                        if (!e.currentTarget.dataset.proxied) {
                          e.currentTarget.dataset.proxied = 'true';
                          e.currentTarget.src = `/api/proxy/avatar?url=${encodeURIComponent(post.thumbnail)}`;
                        } else {
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling) {
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }
                        }
                      }} 
                    />
                  ) : null}
                  <div
                    className="w-full h-full flex items-center justify-center absolute inset-0"
                    style={{ display: post.thumbnail ? 'none' : 'flex', background: 'rgba(255,255,255,0.04)' }}
                  >
                    <Video size={18} style={{ color: accent.color, opacity: 0.7 }} />
                  </div>
                  {/* Dark gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.4) 100%)'
                    }}
                  />
                  {/* Title at top */}
                  {post.title && (
                    <div className="absolute top-1.5 left-2 right-2">
                      <p className="text-[8.5px] font-medium leading-tight line-clamp-2 text-white/90 group-hover:text-white">
                        {post.title}
                      </p>
                    </div>
                  )}
                  {/* View count at bottom */}
                  <div className="absolute bottom-1.5 left-2 right-2 flex justify-between items-center">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white bg-black/60 backdrop-blur-sm border border-white/10">
                      {post.views || '2K'}
                    </span>
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: accent.color }}
                    >
                      <Play size={8} fill="white" color="white" className="ml-0.5" />
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </div>

      {/* ─── HEADER + COACH ──────────────────────────────────────── */}
      <div className="flex items-start gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="forge-label">Today · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: accent.color, opacity: 0.8 }} />
          </div>
          <h2 className="forge-heading mb-1" style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', letterSpacing: '-0.03em' }}>
            What's next for {displayName}?
          </h2>
          <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.35)', lineHeight: '1.5' }}>
            Forge analyzed your content history and audience signals.
          </p>
        </div>

        {/* Coach in top right — click to open chat */}
        <button
          onClick={() => setChatOpen ? setChatOpen(v => !v) : setShowCoachChat(v => !v)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all duration-150 flex-shrink-0 cursor-pointer"
          style={{
            background: isChatOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
            borderColor: isChatOpen ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
          }}
        >
          <div style={{ width: 24, height: 24, flexShrink: 0 }}>
            <svg viewBox="0 0 16 16" width="24" height="24" style={{ imageRendering: 'pixelated' }}>
              <rect x="4" y="1" width="8" height="2" fill="#f0d0a0"/>
              <rect x="4" y="3" width="8" height="5" fill="#fde8c8"/>
              <rect x="5" y="5" width="2" height="2" fill="#2a2a2a"/>
              <rect x="9" y="5" width="2" height="2" fill="#2a2a2a"/>
              <rect x="5" y="5" width="1" height="1" fill="white"/>
              <rect x="9" y="5" width="1" height="1" fill="white"/>
              <rect x="6" y="7" width="1" height="1" fill="#c0806a"/>
              <rect x="7" y="8" width="2" height="1" fill="#c0806a"/>
              <rect x="9" y="7" width="1" height="1" fill="#c0806a"/>
              <rect x="5" y="9" width="6" height="4" fill="white"/>
              <rect x="3" y="9" width="2" height="3" fill="white"/>
              <rect x="11" y="9" width="2" height="3" fill="white"/>
            </svg>
          </div>
          <div className="text-left">
            <p className="text-[12px] font-semibold text-white">Forge Coach</p>
            <div className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-green-400" />
              <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>online</span>
            </div>
          </div>
          <MessageSquare size={12} style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 2 }} />
        </button>
      </div>

      {/* ─── COACH BUBBLE (contextual) ───────────────────────────── */}
      <PixelCoach
        message={coachMessage}
        onChat={() => setChatOpen ? setChatOpen(true) : setShowCoachChat(true)}
      />

      {/* ─── WEEKLY CALENDAR ─────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">This Week's Launch Plan</h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Week {getWeekNumber()}</span>
          </div>
          <div className="flex items-center gap-2">
            {autofillJob.status === 'running' && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
                  <Sparkles size={11} className="animate-spin text-cyan-400" />
                  Generating custom plan…
                </span>
                <button
                  type="button"
                  onClick={() => cancelBgJob(AUTOFILL_JOB)}
                  className="text-[10px] font-semibold text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 px-2 py-0.5 rounded transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
            {autofillJob.status === 'error' && (
              <span className="text-[10px] text-red-400">
                Failed — try again
              </span>
            )}
            <button
              type="button"
              onClick={handleAutoFillWeek}
              disabled={autofillJob.status === 'running'}
              className="flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-800/60 px-3 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={11} className={autofillJob.status === 'running' ? "animate-pulse" : ""} />
              <span>{autofillJob.status === 'running' ? "AI working…" : "Auto-fill Week"}</span>
            </button>
          </div>
        </div>
        <WeekCalendar 
          week={week} 
          onAddPost={handleAddPost} 
          accentRgb={accent.rgb} 
          isLoading={autofillJob.status === 'running' || !week || week.length === 0} 
          onCardClick={(post, day) => { setSelectedPost(post); setSelectedPostDay(day) }} 
          chatOpen={isChatOpen}
        />
      </section>


      {/* ─── TODAY'S PRIORITIES ──────────────────────────────────── */}
      <section className="space-y-3">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-0.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
                Today's priorities
              </p>
            </div>

            {completedCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                <Check size={10} className="stroke-[3]" />
                {completedCount} of {todayActions.length} completed
              </span>
            )}

            {isPrioritiesGenerating && (
              <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5 animate-pulse">
                <Sparkles size={11} className="animate-spin text-cyan-400" />
                Forge AI tailoring priorities…
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleRegeneratePriorities}
              disabled={isPrioritiesGenerating}
              className="flex items-center gap-1.5 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/30 hover:bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-1 rounded-lg transition-all cursor-pointer disabled:opacity-50"
              title="Regenerate dynamic priorities with AI"
            >
              <RefreshCw size={11} className={isPrioritiesGenerating ? "animate-spin" : ""} />
              <span>{isPrioritiesGenerating ? "Tailoring…" : "AI Refresh"}</span>
            </button>

            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
              {remainingCount} remaining
            </span>
          </div>
        </div>

        {/* Priority Cards List */}
        <div className="space-y-2.5">
          {sortedActions.map(action => {
            const isStruck = isActionStruck(action.id)
            const isHighPriority = action.priority === 'High'
            const isMediumPriority = action.priority === 'Medium'

            const ActionCtaIcon = action.cta?.toLowerCase().includes('email')
              ? Mail
              : action.cta?.toLowerCase().includes('calendar') || action.cta?.toLowerCase().includes('week')
                ? Calendar
                : action.cta?.toLowerCase().includes('caption')
                  ? Pencil
                  : Sparkles

            return (
              <div key={action.id} className="transition-all duration-200">
                <div
                  className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 ${
                    isStruck
                      ? 'bg-[#090d16]/70 border-slate-800/50 opacity-60 hover:opacity-95'
                      : 'bg-[#0d1424] hover:bg-[#10192e] border-slate-800/80 hover:border-slate-700'
                  }`}
                  style={openOutputId === action.id ? { borderColor: `rgba(${accent.rgb},0.4)` } : {}}
                >
                  {/* Left: Interactive Checkbox + Content */}
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    {/* Interactive Checkbox Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleStrikeAction(action.id)}
                      title={isStruck ? "Mark incomplete / restore to top" : "Mark completed & strike to bottom"}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 transition-all cursor-pointer ${
                        isStruck
                          ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                          : 'bg-slate-900/90 border border-slate-700/80 hover:border-cyan-400 text-transparent hover:text-cyan-400/60'
                      }`}
                    >
                      <Check size={13} className={isStruck ? "stroke-[2.5]" : "stroke-[2]"} />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className={`text-[13px] sm:text-[13.5px] font-semibold tracking-tight transition-all ${
                            isStruck
                              ? 'text-slate-400 line-through decoration-slate-500/80'
                              : 'text-slate-100 group-hover:text-white'
                          }`}
                        >
                          {action.label}
                        </span>

                        {/* Priority / Completed Tag */}
                        {isStruck ? (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Check size={10} className="stroke-[3]" /> Completed
                          </span>
                        ) : isHighPriority ? (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            High
                          </span>
                        ) : isMediumPriority ? (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            Medium
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                            {action.priority || 'Normal'}
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-[12px] leading-relaxed transition-all ${
                          isStruck
                            ? 'text-slate-500 line-through decoration-slate-600/70'
                            : 'text-slate-400'
                        }`}
                      >
                        {action.rationale}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 w-full sm:w-auto justify-end sm:justify-start">
                    {isStruck ? (
                      <>
                        <button
                          type="button"
                          onClick={() => openOutputId === action.id ? setOpenOutputId(null) : handleGenerate(action)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer"
                        >
                          <Eye size={12} className="text-slate-400" />
                          <span>{openOutputId === action.id ? 'Hide Output' : 'Review Output'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStrikeAction(action.id)}
                          title="Restore task to active list"
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-cyan-300 bg-slate-900/60 hover:bg-slate-800 border border-slate-800/80 transition-all cursor-pointer"
                        >
                          <RotateCcw size={11} />
                          <span>Restore</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => openOutputId === action.id ? setOpenOutputId(null) : handleGenerate(action)}
                          disabled={generating === action.id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                        >
                          {generating === action.id ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : openOutputId === action.id ? (
                            <Check size={12} />
                          ) : (
                            <ActionCtaIcon size={12} />
                          )}
                          <span>{generating === action.id ? 'Writing…' : openOutputId === action.id ? 'Generated' : action.cta}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStrikeAction(action.id)}
                          title="Dismiss & move to bottom"
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-slate-800/80 transition-all cursor-pointer"
                        >
                          <X size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Output panel opens inline under the action that triggered it */}
                {openOutputId === action.id && (generatedContents[action.id] || CONTENT[action.id]) && (
                  <div className="mt-2.5">
                    <OutputPanel
                      content={generatedContents[action.id] || CONTENT[action.id] || {
                        title: action.label,
                        platforms: [getPlatformName(creatorData?.platform)],
                        body: ''
                      }}
                      accent={accent}
                      onClose={() => setOpenOutputId(null)}
                      onSchedule={() => handleSchedule(action.id)}
                      onCopy={handleCopy}
                      onRefine={(instruction, tone) => handleRefine(action.id, instruction, tone)}
                      isGenerating={generating === action.id}
                    />
                  </div>
                )}
              </div>
            )
          })}

          {sortedActions.length === 0 && (
            <div className="text-center py-8 rounded-2xl bg-[#0d1424] border border-slate-800 text-slate-400">
              <Check size={20} className="mx-auto mb-2 text-emerald-400" />
              <p className="text-[13px] font-medium text-slate-300">All priorities cleared!</p>
              <p className="text-xs text-slate-500 mt-0.5">Forge will surface new actions tomorrow.</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── COMMERCIAL LAUNCH & PRICING POINT CALLOUT ────────────── */}
      <section className="rounded-2xl border p-5 sm:p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(18, 23, 34, 0.95) 0%, rgba(9, 13, 22, 0.98) 100%)',
          borderColor: `rgba(${accent.rgb}, 0.28)`,
          boxShadow: `0 12px 36px rgba(0,0,0,0.4), 0 0 24px rgba(${accent.rgb}, 0.1)`
        }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none opacity-20"
          style={{ background: accent.color }} />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase"
              style={{
                background: `rgba(${accent.rgb}, 0.15)`,
                border: `1px solid rgba(${accent.rgb}, 0.35)`,
                color: accent.color
              }}>
              <Zap size={11} className="fill-current" />
              <span>Launch Point • Ready to Deploy</span>
            </div>
            <h3 className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight">
              Ready to take your product live to your audience?
            </h3>
            <p className="text-[12.5px] sm:text-[13px] text-slate-400 leading-relaxed">
              Your software platform is configured, audience analyzed, and launch week primed. Select your commercial track to activate custom domain routing, Stripe payments, and member onboarding.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('forge_open_pricing'))
                }
              }}
              className="px-5 py-3 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98] cursor-pointer shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${accent.color} 0%, rgba(${accent.rgb}, 0.9) 100%)`,
                color: brandTextColor,
              }}
            >
              <Zap size={14} className="fill-current" style={{ color: brandTextColor }} />
              <span style={{ color: brandTextColor }}>Review Launch Plan & Pricing</span>
              <ChevronRight size={14} style={{ color: brandTextColor }} />
            </button>
          </div>
        </div>
      </section>

      {/* Scheduled toast */}
      {scheduledToast && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl animate-fade-up"
          style={{ background: `rgba(${accent.rgb},0.08)`, border: `1px solid rgba(${accent.rgb},0.2)` }}>
          <Check size={13} style={{ color: accent.color }} />
          <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Added to your content calendar</span>
          <button onClick={() => setScheduledToast(null)} className="ml-auto text-white/25 hover:text-white/50"><X size={12} /></button>
        </div>
      )}

      {/* ─── AI DOES IT ──────────────────────────────────────────── */}
      <AiDoesItPanel onClose={() => {}} />

      {showCoachChat && (
        <CoachChat 
          accent={accent} 
          handle={handle} 
          creatorData={creatorData}
          onClose={() => setShowCoachChat(false)} 
        />
      )}

      {/* Add Custom Post Modal */}
      {isAddModalOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsAddModalOpen(false)
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div 
            className="w-full max-w-md rounded-2xl border p-6 space-y-6 shadow-2xl relative"
            style={{ 
              background: 'var(--theme-card-bg)', 
              borderColor: 'var(--theme-border-color)',
              color: 'var(--theme-text)'
            }}
          >
            <div>
              <h3 className="text-[18px] font-bold text-white mb-1.5">Add Custom Post</h3>
              <p className="text-[12px]" style={{ color: 'var(--theme-text-muted)' }}>
                Create a customized draft post to add to your calendar.
              </p>
            </div>

            <div className="space-y-4">
              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>Post Title / Hook</label>
                <div className="forge-input-wrap">
                  <input
                    type="text"
                    className="forge-input text-[13px]"
                    placeholder="e.g. 5 secrets to scaling your agency"
                    value={newPostData.title}
                    onChange={e => setNewPostData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
              </div>

              {/* Day & Platform */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>Day of Week</label>
                  <select
                    className="w-full rounded-xl border p-2.5 text-[13px] bg-[#141414] text-white outline-none"
                    style={{ borderColor: 'var(--theme-border-color)' }}
                    value={newPostData.day}
                    onChange={e => setNewPostData(prev => ({ ...prev, day: e.target.value }))}
                  >
                    {DAYS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>Platform</label>
                  <select
                    className="w-full rounded-xl border p-2.5 text-[13px] bg-[#141414] text-white outline-none"
                    style={{ borderColor: 'var(--theme-border-color)' }}
                    value={newPostData.platform}
                    onChange={e => {
                      const platform = e.target.value
                      const defaultTypes = PLATFORM_TYPES[platform] || ['Post']
                      setNewPostData(prev => ({ 
                        ...prev, 
                        platform, 
                        type: defaultTypes[0] 
                      }))
                    }}
                  >
                    {Object.keys(PLATFORM_TYPES).map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Format Type & Theme */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>Format Type</label>
                  <select
                    className="w-full rounded-xl border p-2.5 text-[13px] bg-[#141414] text-white outline-none"
                    style={{ borderColor: 'var(--theme-border-color)' }}
                    value={newPostData.type}
                    onChange={e => setNewPostData(prev => ({ ...prev, type: e.target.value }))}
                  >
                    {(PLATFORM_TYPES[newPostData.platform] || ['Post']).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>Campaign Theme</label>
                  <select
                    className="w-full rounded-xl border p-2.5 text-[13px] bg-[#141414] text-white outline-none"
                    style={{ borderColor: 'var(--theme-border-color)' }}
                    value={newPostData.theme}
                    onChange={e => setNewPostData(prev => ({ ...prev, theme: e.target.value }))}
                  >
                    {Object.entries(THEMES).map(([k, t]) => (
                      <option key={k} value={k}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>Initial Status</label>
                <div className="flex gap-4">
                  {['draft', 'scheduled'].map(s => (
                    <label key={s} className="flex items-center gap-2 text-[13px] cursor-pointer text-white">
                      <input
                        type="radio"
                        name="newPostStatus"
                        checked={newPostData.status === s}
                        onChange={() => setNewPostData(prev => ({ ...prev, status: s }))}
                        className="accent-[var(--theme-accent)]"
                      />
                      <span className="capitalize">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--theme-border-color)' }}>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="forge-btn-secondary py-2 px-4 text-[13px]"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewPost}
                disabled={!newPostData.title.trim()}
                className="forge-btn-primary py-2 px-5 text-[13px] disabled:opacity-50"
              >
                Add to Calendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── POST DETAILS / EDIT MODAL ───────────────────────────── */}
      {selectedPost && (
        <PostDetailsModal
          post={selectedPost}
          day={selectedPostDay}
          onClose={() => setSelectedPost(null)}
          onSave={(updated) => handleSaveEditedPost(updated, selectedPostDay)}
          accent={accent}
        />
      )}
    </div>
  )
}

const STATUS_COLORS = {
  draft:     { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' },
  scheduled: { bg: 'rgba(96,165,250,0.15)',  color: 'rgba(96,165,250,0.9)'  },
  posted:    { bg: 'rgba(52,211,153,0.15)',   color: 'rgba(52,211,153,0.9)'  },
}

function PostDetailsModal({ post, day, onClose, onSave, accent }) {
  const { creatorData, incrementAiActions, setApiModalOpen, triggerToast } = useForge()
  const [edited, setEdited] = useState({ ...post })
  const [activeTab, setActiveTab] = useState('details') // 'details' | 'body'
  const [isGeneratingBody, setIsGeneratingBody] = useState(false)

  const accentRgb = accent?.rgb || '255,255,255'
  const accentColor = accent?.color || 'white'

  const handleWriteWithAi = async () => {
    if (!hasTextKey()) {
      setApiModalOpen(true)
      return
    }
    setIsGeneratingBody(true)
    if (incrementAiActions) incrementAiActions()
    try {
      const rawPlatform = edited.platform || 'Instagram'
      const platformName = reverseMapPlatform(rawPlatform)
      const text = await generateStudioContent(
        { label: `${platformName} ${edited.type || 'Post'}`, platform: platformName },
        edited.title || '',
        creatorData,
        'Confident'
      )
      setEdited(p => ({ ...p, body: text }))
      if (triggerToast) triggerToast('Caption generated successfully!', 'success')
    } catch (err) {
      console.error(err)
      if (triggerToast) triggerToast(err.message || 'Failed to generate caption', 'error')
    } finally {
      setIsGeneratingBody(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl border shadow-2xl relative overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #111 0%, #0d0d0d 100%)',
          borderColor: `rgba(${accentRgb},0.2)`,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Accent top bar */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, rgba(${accentRgb},0.6) 0%, transparent 100%)` }} />

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            {/* Colour swatch */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: edited.color || 'rgba(255,255,255,0.12)' }}
            >
              <Pencil size={14} style={{ color: 'rgba(255,255,255,0.7)' }} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-white leading-tight line-clamp-1 max-w-[240px]">{edited.title || 'Untitled Post'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-semibold" style={{ color: accentColor }}>{edited.platform}</span>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>·</span>
                <span className="text-[10px] capitalize" style={{ color: 'rgba(255,255,255,0.35)' }}>{edited.type}</span>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>·</span>
                <span
                  className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full capitalize"
                  style={STATUS_COLORS[edited.status] || STATUS_COLORS.draft}
                >{edited.status}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
          >
            <X size={13} />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
          {[['details','Details'], ['body','Caption / Body']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="px-5 py-2.5 text-[12px] font-semibold transition-colors relative"
              style={{ color: activeTab === id ? 'white' : 'rgba(255,255,255,0.35)' }}
            >
              {label}
              {activeTab === id && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: `rgba(${accentRgb},0.8)` }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: 'none' }}>

          {activeTab === 'details' && (
            <div className="p-5 space-y-4">

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Post Title / Hook</label>
                <div className="forge-input-wrap">
                  <input
                    type="text"
                    className="forge-input text-[13px]"
                    value={edited.title || ''}
                    onChange={e => setEdited(p => ({ ...p, title: e.target.value }))}
                    placeholder="Your hook..."
                  />
                </div>
              </div>

              {/* Platform & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Platform</label>
                  <select
                    className="w-full rounded-xl border p-2.5 text-[13px] bg-[#141414] text-white outline-none"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                    value={reverseMapPlatform(edited.platform)}
                    onChange={e => {
                      const pl = e.target.value
                      setEdited(p => ({ ...p, platform: pl, type: (PLATFORM_TYPES[pl] || ['Post'])[0] }))
                    }}
                  >
                    {Object.keys(PLATFORM_TYPES).map(pl => (
                      <option key={pl} value={pl}>{pl}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Format</label>
                  <select
                    className="w-full rounded-xl border p-2.5 text-[13px] bg-[#141414] text-white outline-none"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                    value={edited.type || 'Post'}
                    onChange={e => setEdited(p => ({ ...p, type: e.target.value }))}
                  >
                    {(PLATFORM_TYPES[reverseMapPlatform(edited.platform)] || ['Post']).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Theme & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Theme</label>
                  <select
                    className="w-full rounded-xl border p-2.5 text-[13px] bg-[#141414] text-white outline-none"
                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                    value={edited.theme || 'launch'}
                    onChange={e => {
                      const theme = e.target.value
                      setEdited(p => ({ ...p, theme, color: THEME_COLORS[theme] || p.color }))
                    }}
                  >
                    {Object.entries(THEMES).map(([k, t]) => (
                      <option key={k} value={k}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>Status</label>
                  <div className="flex gap-1 flex-wrap">
                    {['draft','scheduled','posted'].map(s => (
                      <button
                        key={s}
                        onClick={() => setEdited(p => ({ ...p, status: s }))}
                        className="flex-1 py-2 rounded-xl text-[11px] font-semibold capitalize transition-all border"
                        style={edited.status === s
                          ? { ...(STATUS_COLORS[s]), borderColor: 'transparent' }
                          : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)', borderColor: 'rgba(255,255,255,0.08)' }
                        }
                      >{s}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Day indicator */}
              {day && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <Calendar size={12} style={{ color: accentColor }} />
                  <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Scheduled for <span className="text-white font-semibold">{day}</span> this week</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'body' && (
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider block" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Caption / Body Text
                </label>
                <button
                  onClick={handleWriteWithAi}
                  disabled={isGeneratingBody}
                  className="forge-btn-secondary py-1 px-3 text-[11px] gap-1.5 flex items-center"
                  style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)' }}
                >
                  {isGeneratingBody ? (
                    <RefreshCw size={11} className="animate-spin text-white" />
                  ) : (
                    <Sparkles size={11} className="text-[var(--theme-accent)]" />
                  )}
                  {isGeneratingBody ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
              <div className="forge-input-wrap">
                <textarea
                  className="forge-input text-[13px] resize-y min-h-[200px] py-3 leading-relaxed"
                  placeholder="Write the full caption, email body, or script here..."
                  value={edited.body || ''}
                  onChange={e => setEdited(p => ({ ...p, body: e.target.value }))}
                  disabled={isGeneratingBody}
                />
              </div>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>{(edited.body || '').length} chars</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div
          className="flex items-center justify-between gap-3 px-5 py-4 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)' }}
        >
          <button
            onClick={onClose}
            className="forge-btn-secondary py-2 px-4 text-[13px]"
          >Discard</button>
          <button
            onClick={() => onSave(edited)}
            disabled={!(edited.title || '').trim()}
            className="forge-btn-primary py-2 px-5 text-[13px] disabled:opacity-50 gap-1.5"
          >
            <Check size={12} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
