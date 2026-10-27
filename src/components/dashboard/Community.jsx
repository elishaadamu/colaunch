import { useState, useEffect, useRef, useMemo } from 'react'
import { useForge, getAccent } from '../../App'
import { 
  Sparkles, RefreshCw, Copy, Check, Calendar, Plus, Users, MessageSquare, 
  Radio, ChevronRight, ChevronDown, Link2, X, Trash2, Clock, Edit, Mail, Send, ExternalLink
} from 'lucide-react'
import { generateStudioContent, hasTextKey } from '../../services/ai'
import { hexToRgb } from '../../utils/avatarColorExtractor'

// ─── Dynamic Community Content Generator ─────────────────────────────────────

function getCommunityContentTypes(productName, creatorName, handle, niche) {
  const cleanHandle = (handle || '').replace(/^@/, '')
  const name = creatorName || cleanHandle || 'Creator'
  const nicheTopic = niche || 'content creation'

  return [
    {
      id: 'welcome',
      icon: Users,
      label: 'Welcome post',
      description: 'Onboard new members with energy',
      example: `Welcome to ${productName}! 🎉\n\nYou made it. This is the official founding community where we build, execute, and collaborate directly with @${cleanHandle}.\n\nHere is your immediate kickoff checklist:\n→ Introduce yourself below (where you are from & your #1 goal)\n→ Check the pinned resources and asset drops\n→ Join this week's active sprint challenge\n\nTag someone who should be here. Let's build together 👇`,
    },
    {
      id: 'challenge',
      icon: Radio,
      label: 'Weekly challenge',
      description: 'Drive engagement and accountability',
      example: `⚡ Weekly Challenge: The 72-Hour ${nicheTopic.toUpperCase()} Sprint!\n\nNo overthinking this week. Every member of ${productName} takes one concrete action towards their goals.\n\nDirect milestone. Clear execution. Ship it.\n\nTag me (@${cleanHandle}) when you drop it — I will personally review and highlight the top submissions in our next update.\n\nWho is in? Comment "IN" below 👇`,
    },
    {
      id: 'discussion',
      icon: MessageSquare,
      label: 'Discussion starter',
      description: 'Get members talking and engaging',
      example: `Quick question for the ${productName} community:\n\nWhat is the SINGLE biggest bottleneck holding you back in ${nicheTopic} right now?\n\nBe 100% honest. I am personally answering and breaking down solutions for the top questions this week.\n\nDrop your thoughts below 👇`,
    },
    {
      id: 'announcement',
      icon: Plus,
      label: 'Member announcement',
      description: 'Share news, drops, or updates',
      example: `🚀 Milestone Update for ${productName} Members:\n\nOur latest milestone and member toolkit are officially live!\n\nHere is what this unlocks for our members:\n→ Exclusive member-only templates & frameworks\n→ Direct access to our upcoming community session\n→ Early-bird access to our next product drop\n\nHead over to the Resources tab to check it out. Questions? Drop them below!`,
    },
    {
      id: 'recap',
      icon: ChevronRight,
      label: 'Weekly recap',
      description: 'Celebrate wins and keep momentum',
      example: `🏁 Week in Review: ${productName}\n\nWhat an incredible week across our community:\n✓ Multiple members shipped their first milestones\n✓ Great breakthroughs in our challenge threads\n✓ Our member base continues to grow with high-caliber creators\n\nDrop your biggest win of the week in the comments below! 👇`,
    },
    {
      id: 'qa',
      icon: MessageSquare,
      label: 'Audience Q&A prompt',
      description: 'Collect questions for a live or post',
      example: `🎙️ Exclusive ${productName} Community Q&A with ${name}\n\nI am collecting questions directly from our founding circle for an exclusive deep-dive breakdown.\n\nAsk me anything about:\n→ My workflows and scaling secrets\n→ How we structured ${productName}\n→ My biggest lessons in ${nicheTopic}\n\nDrop your question below — nothing is off-limits!`,
    },
  ]
}

// ─── Initial Dynamic Seed Helpers ─────────────────────────────────────────────

function getInitialFoundingMembers(productName, handle) {
  const now = Date.now()
  return [
    { name: 'Alex Rivera', email: 'alex.rivera@techpulse.io', joinedAt: new Date(now - 1 * 86400000).toISOString(), role: 'Founding Member' },
    { name: 'Sarah Lin', email: 'sarah.lin@studioflow.com', joinedAt: new Date(now - 2 * 86400000).toISOString(), role: 'VIP Contributor' },
    { name: 'Marcus Vance', email: 'marcus.vance99@gmail.com', joinedAt: new Date(now - 2 * 86400000).toISOString(), role: 'Founding Member' },
    { name: 'Elena Rostova', email: 'elena.rostova@designlab.co', joinedAt: new Date(now - 3 * 86400000).toISOString(), role: 'Founding Member' },
    { name: 'Priya Sharma', email: 'priya.creatives@gmail.com', joinedAt: new Date(now - 3 * 86400000).toISOString(), role: 'VIP Contributor' },
    { name: 'David Kim', email: 'dkim.builds@horizon.co', joinedAt: new Date(now - 4 * 86400000).toISOString(), role: 'Founding Member' },
    { name: 'Chloe Bennett', email: 'chloe.bennett@creatorpulse.org', joinedAt: new Date(now - 4 * 86400000).toISOString(), role: 'Founding Member' },
    { name: 'Lucas Silva', email: 'lucas.silva@ventures.io', joinedAt: new Date(now - 5 * 86400000).toISOString(), role: 'Founding Member' },
  ]
}

function getInitialScheduledPosts(productName, creatorName, handle, niche) {
  const types = getCommunityContentTypes(productName, creatorName, handle, niche)
  const now = new Date()
  
  const post1Date = new Date(now.getTime() + 1 * 86400000)
  const post2Date = new Date(now.getTime() + 3 * 86400000)
  const post3Date = new Date(now.getTime() + 5 * 86400000)

  return [
    {
      id: 'sched-1',
      type: types[0].label,
      typeId: types[0].id,
      content: types[0].example.slice(0, 120) + '…',
      fullContent: types[0].example,
      date: post1Date.toISOString(),
      dateLabel: post1Date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    },
    {
      id: 'sched-2',
      type: types[1].label,
      typeId: types[1].id,
      content: types[1].example.slice(0, 120) + '…',
      fullContent: types[1].example,
      date: post2Date.toISOString(),
      dateLabel: post2Date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    },
    {
      id: 'sched-3',
      type: types[5].label,
      typeId: types[5].id,
      content: types[5].example.slice(0, 120) + '…',
      fullContent: types[5].example,
      date: post3Date.toISOString(),
      dateLabel: post3Date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    },
  ]
}

// ─── Mini Calendar Component ──────────────────────────────────────────────────

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function MiniCalendar({ onSelect, scheduledPosts = [], creatorColor = '#ff3b30' }) {
  const [viewDate, setViewDate] = useState(new Date())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1))

  return (
    <div className="w-full text-white">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button onClick={prevMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5">
          <ChevronRight size={13} className="rotate-180" />
        </button>
        <span className="text-[12px] font-semibold text-white tracking-wide">{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all border border-white/5">
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-white/20 py-1">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} />
          const dateObj = new Date(year, month, day)
          dateObj.setHours(0, 0, 0, 0)
          const isPast = dateObj < today
          const isToday = dateObj.getTime() === today.getTime()

          // Check if this date has scheduled posts
          const postsForDay = scheduledPosts.filter(p => {
            const d = new Date(p.date)
            d.setHours(0, 0, 0, 0)
            return d.getTime() === dateObj.getTime()
          })
          const hasPost = postsForDay.length > 0

          return (
            <button
              key={day}
              disabled={isPast}
              onClick={() => onSelect(dateObj)}
              className="relative w-full aspect-square rounded-lg flex flex-col items-center justify-center text-[11px] font-semibold transition-all duration-100"
              style={{
                color: isPast ? 'rgba(255,255,255,0.15)' : isToday ? '#ffffff' : 'rgba(255,255,255,0.7)',
                background: isToday ? 'rgba(255,255,255,0.08)' : 'transparent',
                border: isToday ? `1px solid ${creatorColor}` : '1px solid transparent',
                cursor: isPast ? 'not-allowed' : 'pointer',
              }}
              onMouseEnter={e => {
                if (!isPast) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.borderColor = creatorColor
                  e.currentTarget.style.color = 'white'
                }
              }}
              onMouseLeave={e => {
                if (!isPast) {
                  e.currentTarget.style.background = isToday ? 'rgba(255,255,255,0.08)' : 'transparent'
                  e.currentTarget.style.borderColor = isToday ? creatorColor : 'transparent'
                  e.currentTarget.style.color = isToday ? '#ffffff' : 'rgba(255,255,255,0.7)'
                }
              }}
            >
              <span>{day}</span>
              {hasPost && (
                <span 
                  className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
                  style={{ background: creatorColor }}
                  title={`${postsForDay.length} post(s) scheduled`}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Broadcast Email Modal Component ──────────────────────────────────────────

function BroadcastModal({ members, onClose, triggerToast, creatorData, productName, handle, creatorColor, cr, cg, cb }) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isDrafting, setIsDrafting] = useState(false)

  const handleDraftWithAi = async () => {
    setIsDrafting(true)
    try {
      const type = { label: 'Community Update Email', platform: 'Email' }
      const inputContext = `Write an email update to my community "${productName}". Niche: ${creatorData.niche || 'creation'}. Warm, personal, engaging tone.`
      const draft = await generateStudioContent(type, inputContext, creatorData, 'Confident')
      
      // Separate subject if AI returned one
      if (draft.includes('Subject:')) {
        const lines = draft.split('\n')
        const subjLine = lines.find(l => l.toLowerCase().startsWith('subject:'))
        if (subjLine) {
          setSubject(subjLine.replace(/subject:\s*/i, ''))
          setMessage(lines.filter(l => !l.toLowerCase().startsWith('subject:')).join('\n').trim())
        } else {
          setMessage(draft)
        }
      } else {
        setMessage(draft)
      }
      if (triggerToast) triggerToast('AI drafted your broadcast email!', 'success')
    } catch (e) {
      if (triggerToast) triggerToast('Failed to draft with AI, showing template', 'error')
      setSubject(`Quick update from ${creatorData.name || 'creator'}`)
      setMessage(`Hey everyone,\n\nHope you're doing great! Here is a quick update for our ${productName} community...\n\nBest,\n${creatorData.name || 'creator'}`)
    } finally {
      setIsDrafting(false)
    }
  }

  const handleSend = () => {
    if (!subject.trim() || !message.trim()) return
    setIsSending(true)
    setTimeout(() => {
      setIsSending(false)
      if (triggerToast) triggerToast(`Broadcast sent to ${members.length} member(s)!`, 'success')
      onClose()
    }, 1800)
  }

  const mailtoLink = `mailto:?bcc=${members.map(m => m.email).filter(Boolean).join(',')}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div 
        className="w-full max-w-lg rounded-2xl border p-4 sm:p-6 flex flex-col shadow-2xl relative max-h-[92vh]"
        style={{
          background: 'rgba(13,13,13,0.95)',
          borderColor: 'rgba(255,255,255,0.08)',
          animation: 'modalSlideUp 0.3s cubic-bezier(0.16,1,0.3,1) both',
        }}
      >
        <style>{`
          @keyframes modalSlideUp {
            from { opacity: 0; transform: translateY(20px) scale(0.98); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-all w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/5"
        >
          <X size={14} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-white/5">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center border" 
            style={{ 
              background: `rgba(${cr}, ${cg}, ${cb}, 0.12)`, 
              borderColor: `rgba(${cr}, ${cg}, ${cb}, 0.25)` 
            }}
          >
            <Send size={14} style={{ color: creatorColor }} />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-white">Send Email Broadcast</h3>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Reaching out to all <span className="text-white font-medium">{members.length} members</span>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 flex-1 overflow-y-auto pr-1 py-1 custom-scrollbar">
          <div>
            <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider block mb-1.5">Subject</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Big news about our next challenge!"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none transition-all duration-150"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'white',
              }}
              onFocus={e => e.target.style.borderColor = `rgba(${cr}, ${cg}, ${cb}, 0.45)`}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider block m-0">Message Body</label>
              <button 
                onClick={handleDraftWithAi}
                disabled={isDrafting}
                className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all"
                style={{
                  color: creatorColor,
                  background: `rgba(${cr}, ${cg}, ${cb}, 0.12)`,
                  borderColor: `rgba(${cr}, ${cg}, ${cb}, 0.25)`,
                }}
              >
                {isDrafting ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />}
                Draft with AI
              </button>
            </div>
            <textarea
              required
              rows={6}
              placeholder="Write your email update..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none transition-all duration-150 resize-none font-mono"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'white',
              }}
              onFocus={e => e.target.style.borderColor = `rgba(${cr}, ${cg}, ${cb}, 0.45)`}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
          <a
            href={mailtoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-white/40 hover:text-white/80 transition-colors"
          >
            <ExternalLink size={12} />
            Use my email client
          </a>
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/5"
            >
              Cancel
            </button>
            <button 
              onClick={handleSend}
              disabled={isSending || !subject.trim() || !message.trim()}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed transition-all"
              style={{
                background: isSending || !subject.trim() || !message.trim() ? undefined : creatorColor,
                boxShadow: isSending || !subject.trim() || !message.trim() ? 'none' : `0 0 16px rgba(${cr}, ${cg}, ${cb}, 0.35)`
              }}
            >
              {isSending ? 'Sending...' : 'Send Broadcast'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Community Component ─────────────────────────────────────────────────

export default function Community() {
  const { creatorData, incrementAiActions, setApiModalOpen, triggerToast, syncSessionToDb } = useForge()

  // Resolve Creator Brand Color dynamically
  const creatorColor = useMemo(() => {
    if (creatorData?.brand_color && creatorData.brand_color !== '#7C5CFC') return creatorData.brand_color
    if (creatorData?.brandColor && creatorData.brandColor !== '#7C5CFC') return creatorData.brandColor
    if (creatorData?.brandHex && creatorData.brandHex !== '#7C5CFC') return creatorData.brandHex
    if (creatorData?.color && creatorData.color !== '#7C5CFC') return creatorData.color
    try {
      const rawMap = localStorage.getItem("forge_creator_brand_color_map")
      if (rawMap) {
        const map = JSON.parse(rawMap)
        const id = creatorData?.id
        const handle = (creatorData?.handle || '').replace(/^@/, '').toLowerCase()
        if (id && map[id]?.primaryHex && map[id].primaryHex !== '#7C5CFC') return map[id].primaryHex
        if (handle && map[handle]?.primaryHex && map[handle].primaryHex !== '#7C5CFC') return map[handle].primaryHex
      }
    } catch {}
    const platform = (creatorData?.platform || '').toLowerCase()
    const pAccent = getAccent(platform)
    if (pAccent && pAccent.color && pAccent.color !== '#ffffff') return pAccent.color
    return '#ff3b30'
  }, [creatorData])

  const [cr, cg, cb] = useMemo(() => hexToRgb(creatorColor), [creatorColor])

  const handle = creatorData?.handle || '@creator'
  const productName = creatorData.productName || 'Creator Academy'
  const cleanHandle = handle.replace(/^@/, '').replace(/\//g, '-')
  const creatorName = creatorData?.name || cleanHandle || 'Creator'
  const niche = creatorData?.niche || 'content creation'

  // Dynamic Content Types personalized to creator & product
  const communityContentTypes = useMemo(
    () => getCommunityContentTypes(productName, creatorName, cleanHandle, niche),
    [productName, creatorName, cleanHandle, niche]
  )

  const [selectedType, setSelectedType] = useState(() => communityContentTypes[0])
  const [generated, setGenerated] = useState(() => communityContentTypes[0]?.example || '')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [highlightCalendar, setHighlightCalendar] = useState(false)
  const [expandedPostId, setExpandedPostId] = useState(null)
  const [editingPostId, setEditingPostId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const calendarRef = useRef(null)
  const outputRef = useRef(null)

  // ── Members ──
  const getMembersKey = () => `forge_${cleanHandle}_community_members`
  const [members, setMembers] = useState(() => {
    try {
      const cached = localStorage.getItem(getMembersKey())
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      const initial = getInitialFoundingMembers(productName, handle)
      localStorage.setItem(getMembersKey(), JSON.stringify(initial))
      return initial
    } catch { 
      return getInitialFoundingMembers(productName, handle)
    }
  })

  // Sync members from localStorage on focus (when join page adds one)
  useEffect(() => {
    const handler = () => {
      try {
        const cached = localStorage.getItem(getMembersKey())
        if (cached) setMembers(JSON.parse(cached))
      } catch {}
    }
    window.addEventListener('focus', handler)
    return () => window.removeEventListener('focus', handler)
  }, [cleanHandle])

  // ── Scheduled posts ──
  const getScheduledKey = () => `forge_${cleanHandle}_community_scheduled`
  const [scheduledPosts, setScheduledPosts] = useState(() => {
    try {
      const cached = localStorage.getItem(getScheduledKey())
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
      const initial = getInitialScheduledPosts(productName, creatorName, cleanHandle, niche)
      localStorage.setItem(getScheduledKey(), JSON.stringify(initial))
      return initial
    } catch { 
      return getInitialScheduledPosts(productName, creatorName, cleanHandle, niche)
    }
  })

  const saveScheduledPosts = (posts) => {
    setScheduledPosts(posts)
    localStorage.setItem(getScheduledKey(), JSON.stringify(posts))
    setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
  }

  // ── Invite link ──
  const inviteLink = `${window.location.origin}/join/${cleanHandle}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
    if (triggerToast) triggerToast('Invite link copied!', 'success')
  }

  useEffect(() => {
    if (generated && window.innerWidth < 1024) {
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)
    }
  }, [generated])

  // ── AI Generation ──
  const handleGenerate = async (type) => {
    setSelectedType(type)
    setGenerated(null)

    if (!hasTextKey()) {
      if (setApiModalOpen) setApiModalOpen(true)
      return
    }

    setIsGenerating(true)

    try {
      const contentType = { label: type.label, platform: 'Community' }
      const inputContext = `${type.description}. Write for a community called "${productName}" by creator ${handle}. Make it feel authentic, warm, and actionable.`
      const result = await generateStudioContent(contentType, inputContext, creatorData, 'Confident')
      setGenerated(result || type.example)
      if (incrementAiActions) incrementAiActions()
    } catch (err) {
      console.error('[Forge Community] AI generation failed:', err)
      setGenerated(type.example)
      if (triggerToast) triggerToast('AI unavailable — showing tailored template', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleScheduleClick = () => {
    const today = new Date()
    handleScheduleDate(today)
  }

  const handleCopy = () => {
    if (!generated) return
    navigator.clipboard.writeText(generated)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    if (triggerToast) triggerToast('Copied content to clipboard', 'success')
  }

  const handleScheduleDate = (date) => {
    if (!generated || !selectedType) {
      if (triggerToast) triggerToast('Generate a post first, then select a date to schedule', 'info')
      return
    }
    const postId = Date.now().toString()
    const post = {
      id: postId,
      type: selectedType.label,
      typeId: selectedType.id,
      content: generated.slice(0, 120) + (generated.length > 120 ? '…' : ''),
      fullContent: generated,
      date: date.toISOString(),
      dateLabel: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    }
    const updated = [...scheduledPosts, post].sort((a, b) => new Date(a.date) - new Date(b.date))
    saveScheduledPosts(updated)
    setExpandedPostId(postId)
    if (triggerToast) triggerToast(`Scheduled "${selectedType.label}" for ${post.dateLabel}`, 'success')
  }

  const handleDeleteScheduled = (id) => {
    saveScheduledPosts(scheduledPosts.filter(p => p.id !== id))
    if (editingPostId === id) setEditingPostId(null)
    if (triggerToast) triggerToast('Scheduled post deleted', 'info')
  }

  const handleSaveEdit = (id) => {
    const updated = scheduledPosts.map(p => {
      if (p.id === id) {
        return {
          ...p,
          content: editingText.slice(0, 120) + (editingText.length > 120 ? '…' : ''),
          fullContent: editingText
        }
      }
      return p
    })
    saveScheduledPosts(updated)
    setEditingPostId(null)
    if (triggerToast) triggerToast('Scheduled post updated successfully', 'success')
  }

  const postsThisWeek = scheduledPosts.filter(p => {
    const d = new Date(p.date)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    const weekAhead = new Date(now.getTime() + 7 * 86400000)
    return d >= weekAgo && d <= weekAhead
  }).length

  const memberStats = [
    { 
      label: 'Members', 
      value: members.length.toString(), 
      sub: `${members.length} founding members joined`,
      badge: '● Live Community'
    },
    { 
      label: 'Scheduled', 
      value: scheduledPosts.length.toString(), 
      sub: `${scheduledPosts.length} posts in queue`,
      badge: scheduledPosts[0]?.dateLabel ? `Next: ${scheduledPosts[0].dateLabel}` : 'Active'
    },
    { 
      label: 'Posts this week', 
      value: postsThisWeek.toString(), 
      sub: `${postsThisWeek} scheduled this cycle`,
      badge: 'Active Cadence'
    },
  ]

  return (
    <div className="p-3 sm:p-6 max-w-4xl">
      {/* Header */}
      <p className="forge-label mb-3">Community</p>
      <h2 className="forge-heading mb-2" style={{ fontSize: 'clamp(22px, 3vw, 30px)', letterSpacing: '-0.03em' }}>
        {productName} community
      </h2>
      <p className="text-[14px] mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Generate posts, challenges, and discussions — keep your community active and engaged.
      </p>

      {/* ── Invite Link Card ── */}
      <div
        className="rounded-xl border p-4 mb-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(${cr}, ${cg}, ${cb}, 0.08) 0%, rgba(255,255,255,0.02) 100%)`,
          borderColor: `rgba(${cr}, ${cg}, ${cb}, 0.25)`,
        }}
      >
        <div 
          className="absolute -right-6 -top-6 w-24 h-24 rounded-full blur-xl pointer-events-none" 
          style={{ background: `rgba(${cr}, ${cg}, ${cb}, 0.15)` }}
        />
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center border" 
            style={{ 
              background: `rgba(${cr}, ${cg}, ${cb}, 0.12)`, 
              borderColor: `rgba(${cr}, ${cg}, ${cb}, 0.25)` 
            }}
          >
            <Link2 size={14} style={{ color: creatorColor }} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-white">Community invite link</p>
            <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Share this link so people can join your community
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex-1 px-3 py-2 rounded-lg text-[12px] font-mono truncate"
            style={{ background: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            {inviteLink}
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-150"
            style={{
              background: linkCopied ? 'rgba(52,211,153,0.15)' : `rgba(${cr}, ${cg}, ${cb}, 0.15)`,
              color: linkCopied ? '#34d399' : creatorColor,
              border: `1px solid ${linkCopied ? 'rgba(52,211,153,0.25)' : `rgba(${cr}, ${cg}, ${cb}, 0.3)`}`,
            }}
          >
            {linkCopied ? <Check size={12} /> : <Copy size={12} />}
            {linkCopied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {/* Member count + toggle */}
        {members.length > 0 && (
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowMembers(o => !o)}
                className="flex items-center gap-2 text-[12px] font-medium transition-colors"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'white'}
                onMouseLeave={e => { if (!showMembers) e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
              >
                <Users size={12} style={{ color: creatorColor }} />
                <span>{members.length} member{members.length !== 1 ? 's' : ''} joined</span>
                <ChevronDown size={11} className={`transition-transform duration-200 ${showMembers ? 'rotate-180' : ''}`} />
              </button>
              
              <button
                onClick={() => setBroadcastOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all"
                style={{
                  background: `rgba(${cr}, ${cg}, ${cb}, 0.12)`,
                  color: creatorColor,
                  border: `1px solid rgba(${cr}, ${cg}, ${cb}, 0.25)`,
                }}
              >
                <Send size={10} />
                Broadcast Email
              </button>
            </div>
            {showMembers && (
              <div className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {members.map((m, i) => (
                  <div key={i} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-white/[0.04] group" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" 
                        style={{ 
                          background: `rgba(${cr}, ${cg}, ${cb}, 0.2)`, 
                          color: creatorColor 
                        }}
                      >
                        {(m.name || m.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-[12px] font-medium text-white truncate">{m.name || 'Anonymous'}</p>
                          {m.role && (
                            <span 
                              className="text-[9px] px-1.5 py-0.2 rounded font-medium"
                              style={{
                                background: `rgba(${cr}, ${cg}, ${cb}, 0.12)`,
                                color: creatorColor,
                              }}
                            >
                              {m.role}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{m.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                      </span>
                      <a
                        href={`mailto:${m.email}`}
                        onClick={e => e.stopPropagation()}
                        className="w-6 h-6 rounded-lg flex items-center justify-center bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-white/40 hover:text-white transition-all"
                        title={`Email ${m.name || 'member'}`}
                      >
                        <Mail size={11} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {memberStats.map(s => (
          <div 
            key={s.label} 
            className="rounded-xl border p-4 transition-all duration-200" 
            style={{ 
              background: '#111', 
              borderColor: 'rgba(255,255,255,0.07)' 
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.label}</p>
              {s.badge && (
                <span 
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: `rgba(${cr}, ${cg}, ${cb}, 0.12)`,
                    color: creatorColor,
                    border: `1px solid rgba(${cr}, ${cg}, ${cb}, 0.25)`
                  }}
                >
                  {s.badge}
                </span>
              )}
            </div>
            <p className="text-[24px] font-bold tracking-tight text-white">{s.value}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 w-full max-w-full overflow-hidden">
        {/* Left: Sidebar (Generate Categories + Calendar) */}
        <div className="flex flex-col gap-5 lg:flex-shrink-0 w-full">
          <div className="w-full min-w-0">
            <p className="forge-label mb-3">Generate</p>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 w-full">
              {communityContentTypes.map(type => {
                const isSelected = selectedType?.id === type.id
                return (
                  <button
                    key={type.id}
                    onClick={() => handleGenerate(type)}
                    className="w-full text-left flex flex-col lg:flex-row items-start lg:items-center gap-2.5 lg:gap-3 p-3 lg:p-3.5 rounded-xl border transition-all duration-150"
                    style={{
                      background: isSelected ? `rgba(${cr}, ${cg}, ${cb}, 0.1)` : '#111',
                      borderColor: isSelected ? `rgba(${cr}, ${cg}, ${cb}, 0.4)` : 'rgba(255,255,255,0.07)',
                    }}
                    onMouseEnter={e => { 
                      if (!isSelected) { 
                        e.currentTarget.style.background = '#161616'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' 
                      } 
                    }}
                    onMouseLeave={e => { 
                      if (!isSelected) { 
                        e.currentTarget.style.background = '#111'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' 
                      } 
                    }}
                  >
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" 
                      style={{ 
                        background: isSelected ? `rgba(${cr}, ${cg}, ${cb}, 0.2)` : 'rgba(255,255,255,0.07)',
                        color: isSelected ? creatorColor : 'rgba(255,255,255,0.5)'
                      }}
                    >
                      <type.icon size={13} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] lg:text-[13px] font-semibold text-white truncate">{type.label}</p>
                      <p className="text-[10px] lg:text-[11px] hidden lg:block" style={{ color: 'rgba(255,255,255,0.35)' }}>{type.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Calendar Widget */}
          <div
            ref={calendarRef}
            className="rounded-xl border p-4 transition-all duration-300 w-full lg:w-full mx-auto lg:mx-0"
            style={{
              background: '#111',
              borderColor: highlightCalendar ? `rgba(${cr}, ${cg}, ${cb}, 0.6)` : 'rgba(255,255,255,0.07)',
              boxShadow: highlightCalendar ? `0 0 15px rgba(${cr}, ${cg}, ${cb}, 0.25)` : 'none',
              maxWidth: '320px'
            }}
          >
            <div className="flex items-center justify-between mb-3 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-wider m-0">Content Calendar</p>
              {generated && (
                <span 
                  className="text-[9px] px-2 py-0.5 rounded-full animate-pulse font-medium"
                  style={{
                    background: `rgba(${cr}, ${cg}, ${cb}, 0.12)`,
                    color: creatorColor,
                    border: `1px solid rgba(${cr}, ${cg}, ${cb}, 0.25)`
                  }}
                >
                  Select date to schedule
                </span>
              )}
            </div>
            <MiniCalendar
              onSelect={handleScheduleDate}
              scheduledPosts={scheduledPosts}
              creatorColor={creatorColor}
            />
          </div>
        </div>

        {/* Right: Output */}
        <div ref={outputRef}>
          {isGenerating ? (
            <div className="rounded-2xl border p-6 flex items-center gap-3" style={{ background: '#111', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center"
                style={{ background: creatorColor, color: '#ffffff' }}
              >
                <Sparkles size={11} />
              </div>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: `rgba(${cr}, ${cg}, ${cb}, 0.6)`, animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.45)' }}>AI writing {selectedType?.label}...</span>
            </div>
          ) : generated ? (
            <div className="rounded-2xl border overflow-hidden" style={{ background: '#111', borderColor: 'rgba(255,255,255,0.09)' }}>
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2">
                  <Sparkles size={13} style={{ color: creatorColor }} />
                  <span className="text-[13px] font-semibold text-white">{selectedType?.label}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleCopy} 
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all" 
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' }}
                  >
                    {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 max-h-80 overflow-y-auto border border-transparent rounded-xl focus-within:border-white/5 transition-all">
                <textarea
                  value={generated}
                  onChange={e => setGenerated(e.target.value)}
                  className="w-full text-[13px] whitespace-pre-wrap leading-relaxed bg-transparent outline-none border-none resize-none text-white/90"
                  style={{ fontFamily: 'inherit', minHeight: '160px', height: 'auto' }}
                  placeholder="Edit your generated content post here..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 px-5 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
                <button onClick={() => handleGenerate(selectedType)} className="forge-btn-secondary text-[12px] py-2 px-4 gap-1.5">
                  <RefreshCw size={11} />
                  Regenerate
                </button>
                <button
                  onClick={handleScheduleClick}
                  className="text-[12px] py-2 px-4 gap-1.5 ml-auto flex items-center font-bold rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  style={{
                    background: creatorColor,
                    color: '#ffffff',
                    boxShadow: `0 0 16px rgba(${cr}, ${cg}, ${cb}, 0.35)`
                  }}
                >
                  <Calendar size={11} />
                  Schedule Post
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border flex flex-col items-center justify-center text-center py-16 px-8" style={{ borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.01)' }}>
              <Sparkles size={24} className="mb-3" style={{ color: `rgba(${cr}, ${cg}, ${cb}, 0.4)` }} />
              <p className="text-[14px] font-medium text-white/60 mb-1">Select a post type</p>
              <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Forge will generate community-ready copy personalized to {productName}.
              </p>
            </div>
          )}

          {/* ── Scheduled Posts ── */}
          {scheduledPosts.length > 0 && (
            <div className="mt-5">
              <p className="forge-label mb-3">Scheduled posts</p>
              <div className="space-y-2">
                {scheduledPosts.map(post => (
                  <div
                    key={post.id}
                    onClick={() => setExpandedPostId(prev => prev === post.id ? null : post.id)}
                    className="flex flex-col p-3.5 rounded-xl border group cursor-pointer transition-all duration-150"
                    style={{ background: '#111', borderColor: 'rgba(255,255,255,0.07)' }}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Clock size={13} className="text-white/40" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[12px] font-semibold text-white">{post.type}</span>
                          <span 
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" 
                            style={{ 
                              background: `rgba(${cr}, ${cg}, ${cb}, 0.12)`, 
                              color: creatorColor,
                              border: `1px solid rgba(${cr}, ${cg}, ${cb}, 0.25)`
                            }}
                          >
                            {post.dateLabel}
                          </span>
                        </div>
                        {expandedPostId !== post.id && (
                          <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.4)' }}>{post.content}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 self-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteScheduled(post.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ color: 'rgba(255,255,255,0.3)' }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent' }}
                        >
                          <Trash2 size={12} />
                        </button>
                        <ChevronDown
                          size={14}
                          className={`text-white/30 transition-transform duration-200 ${expandedPostId === post.id ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </div>

                    {/* Accordion content */}
                    {expandedPostId === post.id && (
                      <div
                        className="mt-3 pt-3 w-full border-t border-white/5"
                        style={{
                          animation: 'slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1) both',
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        <style>{`
                          @keyframes slideDown {
                            from { opacity: 0; transform: translateY(-4px); }
                            to { opacity: 1; transform: translateY(0); }
                          }
                        `}</style>
                        {editingPostId === post.id ? (
                          <textarea
                            value={editingText}
                            onChange={e => setEditingText(e.target.value)}
                            className="w-full text-[12px] whitespace-pre-wrap leading-relaxed bg-black/45 p-3 rounded-lg overflow-x-auto border border-white/10 outline-none text-white/90 font-mono transition-colors"
                            style={{ minHeight: '120px' }}
                            placeholder="Edit post content..."
                            onFocus={e => e.target.style.borderColor = `rgba(${cr}, ${cg}, ${cb}, 0.5)`}
                            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                          />
                        ) : (
                          <pre className="text-[12px] whitespace-pre-wrap leading-relaxed text-white/80 font-mono bg-black/35 p-3 rounded-lg overflow-x-auto border border-white/5">
                            {post.fullContent || post.content}
                          </pre>
                        )}
                        <div className="flex gap-2 justify-end mt-2">
                          {editingPostId === post.id ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(post.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all"
                              >
                                <Check size={11} />
                                Save
                              </button>
                              <button
                                onClick={() => setEditingPostId(null)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-white/5 hover:bg-white/10 text-white/50 border border-white/5 transition-all"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingPostId(post.id)
                                  setEditingText(post.fullContent || post.content)
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/5"
                              >
                                <Edit size={11} />
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(post.fullContent || post.content)
                                  if (triggerToast) triggerToast('Copied content to clipboard', 'success')
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all border border-white/5"
                              >
                                <Copy size={11} />
                                Copy content
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick wins */}
          <div className="mt-5">
            <p className="forge-label mb-3">Quick wins</p>
            <div className="space-y-2">
              {[
                { emoji: '👋', label: 'Post your first welcome message', typeId: 'welcome' },
                { emoji: '💬', label: 'Start a discussion to break the ice', typeId: 'discussion' },
                { emoji: '⚡', label: 'Create your first weekly challenge', typeId: 'challenge' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border" style={{ background: '#111', borderColor: 'rgba(255,255,255,0.07)' }}>
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-[13px] flex-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{item.label}</span>
                  <button
                    onClick={() => {
                      const type = communityContentTypes.find(t => t.id === item.typeId)
                      if (type) handleGenerate(type)
                    }}
                    className="text-[12px] px-3 py-1 rounded-full transition-all duration-150 font-medium" 
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}
                    onMouseEnter={e => { 
                      e.target.style.background = `rgba(${cr}, ${cg}, ${cb}, 0.2)`
                      e.target.style.color = creatorColor 
                    }}
                    onMouseLeave={e => { 
                      e.target.style.background = 'rgba(255,255,255,0.07)'
                      e.target.style.color = 'rgba(255,255,255,0.6)' 
                    }}
                  >
                    Generate →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Modal Overlay */}
      {broadcastOpen && (
        <BroadcastModal
          members={members}
          onClose={() => setBroadcastOpen(false)}
          triggerToast={triggerToast}
          creatorData={creatorData}
          productName={productName}
          handle={handle}
          creatorColor={creatorColor}
          cr={cr}
          cg={cg}
          cb={cb}
        />
      )}
    </div>
  )
}
