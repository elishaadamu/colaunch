import { useState, useEffect, useRef, useMemo } from 'react'
import { useForge, getAccent } from '../../App'
import { 
  Sparkles, RefreshCw, Copy, Check, Calendar, Plus, Users, MessageSquare, 
  Radio, ChevronRight, ChevronDown, Link2, X, Trash2, Clock, Edit, Mail, Send, ExternalLink, Zap, Search, ShieldCheck, Flame
} from 'lucide-react'
import { generateStudioContent, hasTextKey } from '../../services/ai'

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
      description: 'Onboard new members with energy & clarity',
      example: `Welcome to ${productName}! 🎉\n\nYou made it. This is the official founding community where we build, execute, and collaborate directly with @${cleanHandle}.\n\nHere is your immediate kickoff checklist:\n→ Introduce yourself below (where you are from & your #1 goal)\n→ Check the pinned resources and asset drops\n→ Join this week's active sprint challenge\n\nTag someone who should be here. Let's build together 👇`,
    },
    {
      id: 'challenge',
      icon: Radio,
      label: 'Weekly challenge',
      description: 'Drive engagement and active milestone execution',
      example: `⚡ Weekly Challenge: The 72-Hour ${nicheTopic.toUpperCase()} Sprint!\n\nNo overthinking this week. Every member of ${productName} takes one concrete action towards their goals.\n\nDirect milestone. Clear execution. Ship it.\n\nTag me (@${cleanHandle}) when you drop it — I will personally review and highlight the top submissions in our next update.\n\nWho is in? Comment "IN" below 👇`,
    },
    {
      id: 'discussion',
      icon: MessageSquare,
      label: 'Discussion starter',
      description: 'Get members talking and solving bottlenecks',
      example: `Quick question for the ${productName} community:\n\nWhat is the SINGLE biggest bottleneck holding you back in ${nicheTopic} right now?\n\nBe 100% honest. I am personally answering and breaking down solutions for the top questions this week.\n\nDrop your thoughts below 👇`,
    },
    {
      id: 'announcement',
      icon: Plus,
      label: 'Member announcement',
      description: 'Share news, asset drops, or major updates',
      example: `🚀 Milestone Update for ${productName} Members:\n\nOur latest milestone and member toolkit are officially live!\n\nHere is what this unlocks for our members:\n→ Exclusive member-only templates & frameworks\n→ Direct access to our upcoming community session\n→ Early-bird access to our next product drop\n\nHead over to the Resources tab to check it out. Questions? Drop them below!`,
    },
    {
      id: 'recap',
      icon: ChevronRight,
      label: 'Weekly recap',
      description: 'Celebrate member wins and maintain momentum',
      example: `🏁 Week in Review: ${productName}\n\nWhat an incredible week across our community:\n✓ Multiple members shipped their first milestones\n✓ Great breakthroughs in our challenge threads\n✓ Our member base continues to grow with high-caliber creators\n\nDrop your biggest win of the week in the comments below! 👇`,
    },
    {
      id: 'qa',
      icon: MessageSquare,
      label: 'Audience Q&A prompt',
      description: 'Collect questions for live coaching or recap',
      example: `🎙️ Exclusive ${productName} Community Q&A with ${name}\n\nI am collecting questions directly from our founding circle for an exclusive deep-dive breakdown.\n\nAsk me anything about:\n→ My workflows and scaling secrets\n→ How we structured ${productName}\n→ My biggest lessons in ${nicheTopic}\n\nDrop your question below — nothing is off-limits!`,
    },
  ]
}

// ─── Initial Dynamic Seed Helpers ─────────────────────────────────────────────

function getInitialFoundingMembers(productName, handle) {
  const now = Date.now()
  return [
    { name: 'Alex Rivera', email: 'alex.rivera@techpulse.io', joinedAt: new Date(now - 1 * 86400000).toISOString(), role: 'Founding Member', status: 'Active' },
    { name: 'Sarah Lin', email: 'sarah.lin@studioflow.com', joinedAt: new Date(now - 2 * 86400000).toISOString(), role: 'VIP Contributor', status: 'Active' },
    { name: 'Marcus Vance', email: 'marcus.vance99@gmail.com', joinedAt: new Date(now - 2 * 86400000).toISOString(), role: 'Founding Member', status: 'Active' },
    { name: 'Elena Rostova', email: 'elena.rostova@designlab.co', joinedAt: new Date(now - 3 * 86400000).toISOString(), role: 'Founding Member', status: 'Active' },
    { name: 'Priya Sharma', email: 'priya.creatives@gmail.com', joinedAt: new Date(now - 3 * 86400000).toISOString(), role: 'VIP Contributor', status: 'Active' },
    { name: 'David Kim', email: 'dkim.builds@horizon.co', joinedAt: new Date(now - 4 * 86400000).toISOString(), role: 'Founding Member', status: 'Active' },
    { name: 'Chloe Bennett', email: 'chloe.bennett@creatorpulse.org', joinedAt: new Date(now - 4 * 86400000).toISOString(), role: 'Founding Member', status: 'Active' },
    { name: 'Lucas Silva', email: 'lucas.silva@ventures.io', joinedAt: new Date(now - 5 * 86400000).toISOString(), role: 'Founding Member', status: 'Active' },
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

// ─── Mini Calendar Component (Precision Angular Style) ────────────────────────

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function MiniCalendar({ onSelect, scheduledPosts = [], brandRed = '#c81e3c' }) {
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
        <button 
          type="button"
          onClick={prevMonth} 
          className="w-7 h-7 rounded-none flex items-center justify-center text-slate-400 hover:text-white bg-[#10141f] hover:bg-[#161d2d] transition border border-white/10 cursor-pointer"
        >
          <ChevronRight size={13} className="rotate-180" />
        </button>
        <span className="text-xs font-bold text-white tracking-wide">{MONTHS[month]} {year}</span>
        <button 
          type="button"
          onClick={nextMonth} 
          className="w-7 h-7 rounded-none flex items-center justify-center text-slate-400 hover:text-white bg-[#10141f] hover:bg-[#161d2d] transition border border-white/10 cursor-pointer"
        >
          <ChevronRight size={13} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_SHORT.map(d => (
          <div key={d} className="text-center text-[10px] font-mono font-bold text-slate-500 py-1">{d}</div>
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

          const postsForDay = scheduledPosts.filter(p => {
            const d = new Date(p.date)
            d.setHours(0, 0, 0, 0)
            return d.getTime() === dateObj.getTime()
          })
          const hasPost = postsForDay.length > 0

          return (
            <button
              key={day}
              type="button"
              disabled={isPast}
              onClick={() => onSelect(dateObj)}
              className="relative w-full aspect-square rounded-none flex flex-col items-center justify-center text-[11px] font-mono font-bold transition cursor-pointer"
              style={{
                color: isPast ? '#475569' : isToday ? '#ffffff' : '#cbd5e1',
                background: isToday ? 'rgba(200,30,60,0.15)' : 'transparent',
                border: isToday ? `1px solid ${brandRed}` : '1px solid transparent',
                cursor: isPast ? 'not-allowed' : 'pointer',
              }}
            >
              <span>{day}</span>
              {hasPost && (
                <span 
                  className="absolute bottom-1 w-1.5 h-1.5 rounded-none"
                  style={{ background: brandRed }}
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

function BroadcastModal({ members, onClose, triggerToast, creatorData, productName, brandRed = '#c81e3c' }) {
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
    }, 1200)
  }

  const mailtoLink = `mailto:?bcc=${members.map(m => m.email).filter(Boolean).join(',')}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div 
        className="w-full max-w-lg rounded-none border border-white/10 p-5 sm:p-6 flex flex-col shadow-2xl relative max-h-[92vh] bg-[#0c1017] space-y-4"
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition w-8 h-8 rounded-none flex items-center justify-center bg-[#10141f] border border-white/10 cursor-pointer"
        >
          <X size={15} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
          <div 
            className="w-9 h-9 rounded-none flex items-center justify-center border border-[#c81e3c]/30 bg-[#c81e3c]/15 text-[#ff6b81]" 
          >
            <Send size={15} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Send Email Broadcast</h3>
            <p className="text-[11px] text-slate-400">
              Reaching out to all <span className="text-white font-medium">{members.length} founding members</span>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3.5 flex-1 overflow-y-auto pr-1 py-1 custom-scrollbar">
          <div>
            <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-1">Subject</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Milestone unlocked: New resources available inside"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-none text-xs bg-[#10141f] border border-white/10 text-white outline-none focus:border-[#c81e3c] transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider block m-0">Message Body</label>
              <button 
                type="button"
                onClick={handleDraftWithAi}
                disabled={isDrafting}
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-none border border-[#c81e3c]/30 bg-[#c81e3c]/15 text-[#ff8093] hover:bg-[#c81e3c]/25 transition cursor-pointer"
              >
                {isDrafting ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />}
                <span>Draft with AI</span>
              </button>
            </div>
            <textarea
              required
              rows={6}
              placeholder="Write your member email update..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-none text-xs bg-[#10141f] border border-white/10 text-white outline-none focus:border-[#c81e3c] transition resize-none font-mono"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3">
          <a
            href={mailtoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
          >
            <ExternalLink size={12} />
            <span>Open in Mail Client</span>
          </a>
          <div className="flex gap-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-none text-xs font-semibold bg-[#10141f] hover:bg-[#161d2d] text-slate-300 hover:text-white transition border border-white/10 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handleSend}
              disabled={isSending || !subject.trim() || !message.trim()}
              className="px-4 py-2 rounded-none text-xs font-bold text-white transition cursor-pointer border-0 shadow-sm disabled:opacity-50"
              style={{ background: brandRed, color: '#ffffff' }}
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
  const { creatorData, incrementAiActions, setApiModalOpen, triggerToast, syncSessionToDb, dashboardData, saveDashboardData, setActiveTab } = useForge()

  const brandRed = '#c81e3c'
  const handle = creatorData?.handle || '@creator'
  const productName = creatorData?.productName || 'Creator Academy'
  const cleanHandle = handle.replace(/^@/, '').replace(/\//g, '-')
  const creatorName = creatorData?.name || cleanHandle || 'Creator'
  const niche = creatorData?.niche || 'content creation'

  // Dynamic Content Types personalized to creator & product
  const communityContentTypes = useMemo(
    () => getCommunityContentTypes(productName, creatorName, cleanHandle, niche),
    [productName, creatorName, cleanHandle, niche]
  )

  const [activeTabSub, setActiveTabSub] = useState('hub') // 'hub' | 'members'
  const [selectedType, setSelectedType] = useState(() => communityContentTypes[0])
  const [generated, setGenerated] = useState(() => communityContentTypes[0]?.example || '')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [highlightCalendar, setHighlightCalendar] = useState(false)
  const [expandedPostId, setExpandedPostId] = useState(null)
  const [editingPostId, setEditingPostId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [memberFilter, setMemberFilter] = useState('all')
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
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

  // Hydrate once from MongoDB Atlas
  const hasHydratedCommunityRef = useRef(false)
  useEffect(() => {
    if (hasHydratedCommunityRef.current) return
    if (dashboardData?.community_data) {
      hasHydratedCommunityRef.current = true
      if (Array.isArray(dashboardData.community_data.members) && dashboardData.community_data.members.length > 0) {
        setMembers(dashboardData.community_data.members)
      }
      if (Array.isArray(dashboardData.community_data.scheduled_posts) && dashboardData.community_data.scheduled_posts.length > 0) {
        setScheduledPosts(dashboardData.community_data.scheduled_posts)
      }
    }
  }, [dashboardData?.community_data])

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
    try {
      localStorage.setItem(getScheduledKey(), JSON.stringify(posts))
    } catch (_) {}
    if (saveDashboardData) {
      setTimeout(() => {
        saveDashboardData('community', {
          members,
          scheduled_posts: posts,
          synced_at: new Date().toISOString()
        })
      }, 50)
    }
  }

  // ── Invite link ──
  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://co-launch.app'}/join/${cleanHandle}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
    if (triggerToast) triggerToast('Community invite link copied!', 'success')
  }

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
      console.error('[Forge Community] AI generation notice:', err)
      setGenerated(type.example)
      if (triggerToast) triggerToast('Showing tailored community template', 'info')
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
    if (triggerToast) triggerToast('Scheduled post removed', 'info')
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

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchesSearch = !memberSearchQuery || 
        (m.name || '').toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
        (m.email || '').toLowerCase().includes(memberSearchQuery.toLowerCase())
      const matchesFilter = memberFilter === 'all' || 
        (memberFilter === 'vip' && m.role?.includes('VIP')) ||
        (memberFilter === 'founding' && m.role?.includes('Founding'))
      return matchesSearch && matchesFilter
    })
  }, [members, memberSearchQuery, memberFilter])

  return (
    <div className="min-h-full flex flex-col bg-[#090d16] text-slate-200 p-4 sm:p-6 space-y-6">
      
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="w-2 h-2 rounded-none bg-[#c81e3c]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Community Hub &amp; Engagement Engine
            </span>
            <span className="px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider bg-[#c81e3c]/15 text-white border border-[#c81e3c]/30">
              Founding Circle
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{productName} Community</span>
            <Sparkles size={18} className="text-[#c81e3c]" />
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Generate challenges, discussion starters, and milestone announcements to maintain high retention across your member base.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 bg-[#121622] hover:bg-[#181e30] border border-white/10 rounded-none transition cursor-pointer"
            title="Copy community invite link"
          >
            {linkCopied ? <Check size={13} className="text-emerald-400" /> : <Link2 size={13} />}
            <span>{linkCopied ? 'Link Copied!' : 'Copy Invite Link'}</span>
          </button>

          <button
            type="button"
            onClick={() => setBroadcastOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-none transition shadow-sm cursor-pointer hover:opacity-90 border-0"
            style={{ background: brandRed, color: '#ffffff' }}
          >
            <Send size={13} className="text-white" />
            <span>Broadcast Email</span>
          </button>
        </div>
      </div>

      {/* ── 4 COMMUNITY HEALTH METRIC CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#0c1017] border border-white/[0.08] rounded-none">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Members</span>
            <Users size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{members.length}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-none bg-emerald-400" />
            <span>Founding circle active</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#0c1017] border border-white/[0.08] rounded-none">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Scheduled Queue</span>
            <Calendar size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{scheduledPosts.length}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            {scheduledPosts[0]?.dateLabel ? `Next: ${scheduledPosts[0].dateLabel}` : 'Ready for drafts'}
          </div>
        </div>

        <div className="p-3.5 bg-[#0c1017] border border-white/[0.08] rounded-none">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Posts This Week</span>
            <Clock size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{postsThisWeek}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>Optimal 3-4 weekly cadence</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#0c1017] border border-white/[0.08] rounded-none">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Health Status</span>
            <Flame size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">Active</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>Private community ready</span>
          </div>
        </div>
      </div>

      {/* ── SUB-TABS: HUB & GENERATOR vs MEMBERS DIRECTORY ── */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTabSub('hub')}
            className={`px-4 py-2 text-xs font-bold rounded-none transition cursor-pointer border-0 ${
              activeTabSub === 'hub' ? 'text-white' : 'text-slate-400 hover:text-white bg-transparent'
            }`}
            style={activeTabSub === 'hub' ? { background: brandRed, color: '#ffffff' } : {}}
          >
            Content Engine &amp; Calendar
          </button>
          <button
            type="button"
            onClick={() => setActiveTabSub('members')}
            className={`px-4 py-2 text-xs font-bold rounded-none transition cursor-pointer border-0 ${
              activeTabSub === 'members' ? 'text-white' : 'text-slate-400 hover:text-white bg-transparent'
            }`}
            style={activeTabSub === 'members' ? { background: brandRed, color: '#ffffff' } : {}}
          >
            Members Directory ({members.length})
          </button>
        </div>

        <div className="hidden sm:block text-[11px] font-mono text-slate-400">
          URL: <code className="text-slate-300">/join/{cleanHandle}</code>
        </div>
      </div>

      {/* ── TAB 1: HUB & CONTENT ENGINE ── */}
      {activeTabSub === 'hub' && (
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 w-full">
          {/* Left Column: Post Types & MiniCalendar */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#0c1017] border border-white/[0.08] p-4 rounded-none space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Select Content Type
              </span>
              <div className="space-y-1.5">
                {communityContentTypes.map(type => {
                  const isSelected = selectedType?.id === type.id
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleGenerate(type)}
                      className={`w-full text-left p-2.5 rounded-none border transition cursor-pointer flex items-center gap-2.5 ${
                        isSelected 
                          ? 'border-[#c81e3c]/50 bg-[#c81e3c]/10 text-white' 
                          : 'border-white/[0.06] bg-[#10141f] text-slate-300 hover:bg-[#151b2a] hover:text-white'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-none flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#c81e3c] text-white' : 'bg-white/[0.05] text-slate-400'}`}>
                        <type.icon size={12} className={isSelected ? 'text-white' : 'text-slate-400'} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate">{type.label}</div>
                        <div className="text-[10px] text-slate-400 truncate">{type.description}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Content Calendar Widget */}
            <div
              ref={calendarRef}
              className="bg-[#0c1017] border border-white/[0.08] p-4 rounded-none space-y-2.5"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Post Calendar
                </span>
                <span className="text-[9px] font-mono text-slate-300 bg-white/[0.04] px-2 py-0.5 border border-white/[0.08]">
                  Click day to schedule
                </span>
              </div>
              <MiniCalendar
                onSelect={handleScheduleDate}
                scheduledPosts={scheduledPosts}
                brandRed={brandRed}
              />
            </div>
          </div>

          {/* Right Column: AI Content Generator & Scheduled Posts */}
          <div className="space-y-5" ref={outputRef}>
            {/* AI Generator Box */}
            <div className="bg-[#0c1017] border border-white/[0.08] rounded-none p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-[#c81e3c]" />
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {selectedType?.label || 'Community Post'}
                  </h3>
                  <span className="text-[9px] font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 border border-white/[0.08]">
                    {selectedType?.description}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={handleCopy} 
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-[#10141f] hover:bg-[#161d2d] border border-white/10 rounded-none transition cursor-pointer"
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerate(selectedType)}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-[#10141f] hover:bg-[#161d2d] border border-white/10 rounded-none transition cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw size={12} className={isGenerating ? 'animate-spin' : ''} />
                    <span>Regenerate</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleScheduleClick}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-none transition cursor-pointer border-0 shadow-sm hover:opacity-90"
                    style={{ background: brandRed, color: '#ffffff' }}
                  >
                    <Calendar size={12} className="text-white" />
                    <span>Schedule to Calendar</span>
                  </button>
                </div>
              </div>

              {/* Editor Textarea */}
              <div className="p-3 bg-[#090c14] border border-white/[0.08] rounded-none">
                <textarea
                  value={generated || ''}
                  onChange={e => setGenerated(e.target.value)}
                  className="w-full text-xs font-sans leading-relaxed bg-transparent outline-none border-none resize-none text-slate-200"
                  style={{ minHeight: '180px' }}
                  placeholder="Generate or draft your community post..."
                />
              </div>
            </div>

            {/* Scheduled Posts Queue */}
            <div className="bg-[#0c1017] border border-white/[0.08] rounded-none p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Clock size={13} />
                  <span>Scheduled Community Pipeline ({scheduledPosts.length})</span>
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Auto-synced</span>
              </div>

              {scheduledPosts.length === 0 ? (
                <div className="p-6 text-center bg-[#10141f] border border-white/[0.06] rounded-none text-xs text-slate-400">
                  No scheduled community posts. Click any date on the calendar to queue your next update.
                </div>
              ) : (
                <div className="space-y-2">
                  {scheduledPosts.map(post => (
                    <div
                      key={post.id}
                      onClick={() => setExpandedPostId(prev => prev === post.id ? null : post.id)}
                      className="p-3 bg-[#10141f] border border-white/[0.06] hover:border-white/20 transition rounded-none cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-6 h-6 rounded-none bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                            <Clock size={12} className="text-slate-400" />
                          </div>
                          <span className="text-xs font-bold text-white truncate">{post.type}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-none bg-[#c81e3c]/15 text-[#ff8093] border border-[#c81e3c]/30">
                            {post.dateLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteScheduled(post.id)
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1 transition cursor-pointer bg-transparent border-0"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                          <ChevronDown size={14} className={`text-slate-400 transition-transform ${expandedPostId === post.id ? 'rotate-180' : ''}`} />
                        </div>
                      </div>

                      {expandedPostId !== post.id ? (
                        <p className="text-[11px] text-slate-400 truncate pl-8">{post.content}</p>
                      ) : (
                        <div className="pt-2 border-t border-white/[0.06] space-y-2" onClick={e => e.stopPropagation()}>
                          {editingPostId === post.id ? (
                            <textarea
                              value={editingText}
                              onChange={e => setEditingText(e.target.value)}
                              className="w-full text-xs leading-relaxed bg-[#090c14] p-3 rounded-none border border-white/10 outline-none text-slate-200 font-mono"
                              rows={5}
                            />
                          ) : (
                            <pre className="text-xs leading-relaxed text-slate-300 font-sans whitespace-pre-wrap bg-[#090c14] p-3 rounded-none border border-white/[0.06]">
                              {post.fullContent || post.content}
                            </pre>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-1">
                            {editingPostId === post.id ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(post.id)}
                                  className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 rounded-none cursor-pointer border-0"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPostId(null)}
                                  className="px-3 py-1 text-xs font-semibold text-slate-300 bg-white/5 rounded-none cursor-pointer border-0"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingPostId(post.id)
                                    setEditingText(post.fullContent || post.content)
                                  }}
                                  className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 rounded-none cursor-pointer border border-white/10"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(post.fullContent || post.content)
                                    if (triggerToast) triggerToast('Copied content to clipboard', 'success')
                                  }}
                                  className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 rounded-none cursor-pointer border border-white/10"
                                >
                                  Copy
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: MEMBERS DIRECTORY ── */}
      {activeTabSub === 'members' && (
        <div className="bg-[#0c1017] border border-white/[0.08] rounded-none p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Founding Circle Members</h3>
              <p className="text-xs text-slate-400">Manage member privileges, view join timestamps, and direct contact</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search member or email..."
                  value={memberSearchQuery}
                  onChange={e => setMemberSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-[#10141f] border border-white/10 rounded-none text-white outline-none focus:border-[#c81e3c] transition"
                />
              </div>

              <div className="flex items-center gap-1">
                {['all', 'founding', 'vip'].map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setMemberFilter(f)}
                    className={`px-2.5 py-1 text-[11px] font-bold uppercase rounded-none transition cursor-pointer border-0 ${
                      memberFilter === f ? 'bg-[#c81e3c] text-white' : 'bg-[#10141f] text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No members match the query "{memberSearchQuery}".
              </div>
            ) : (
              filteredMembers.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#10141f] border border-white/[0.06] hover:border-white/15 transition rounded-none flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-none bg-[#c81e3c]/20 border border-[#c81e3c]/30 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {(m.name || m.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{m.name || 'Member'}</span>
                        <span className="px-1.5 py-0.2 rounded-none text-[9px] font-bold uppercase bg-[#c81e3c]/15 text-[#ff8093] border border-[#c81e3c]/30">
                          {m.role || 'Member'}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 truncate block">{m.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                      Joined {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recent'}
                    </span>
                    <a
                      href={`mailto:${m.email}`}
                      className="px-2.5 py-1 text-xs font-bold text-slate-200 bg-[#151b2a] hover:bg-[#1f283d] border border-white/10 rounded-none transition flex items-center gap-1.5"
                      title={`Send email to ${m.email}`}
                    >
                      <Mail size={12} className="text-[#c81e3c]" />
                      <span>Contact</span>
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Broadcast Modal Overlay */}
      {broadcastOpen && (
        <BroadcastModal
          members={members}
          onClose={() => setBroadcastOpen(false)}
          triggerToast={triggerToast}
          creatorData={creatorData}
          productName={productName}
          brandRed={brandRed}
        />
      )}
    </div>
  )
}
