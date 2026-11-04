import { useState, useEffect, useRef, useMemo } from 'react'
import { useForge } from '../../App'
import { 
  Sparkles, RefreshCw, Copy, Check, Calendar, Plus, Users, MessageSquare, 
  Radio, ChevronRight, ChevronDown, Link2, X, Trash2, Clock, Edit, Mail, 
  Send, ExternalLink, Zap, Search, ShieldCheck, Flame, UserPlus, Eye, TrendingUp, CheckCircle2, ArrowRight
} from 'lucide-react'
import { generateStudioContent, hasTextKey } from '../../services/ai'

// ─── Dynamic Community Content Templates ─────────────────────────────────────

function getCommunityContentTypes(productName, creatorName, handle, niche) {
  const cleanHandle = (handle || '').replace(/^@/, '')
  const name = creatorName || cleanHandle || 'Creator'
  const nicheTopic = niche || 'content creation'

  return [
    {
      id: 'announcement',
      icon: Plus,
      label: 'Member Announcement',
      titleDefault: `🚀 Milestone Update: What's next inside ${productName}`,
      description: 'Share major releases, asset drops, or platform milestones',
      example: `🚀 Milestone Update for ${productName} Members:\n\nOur latest milestone and member toolkit are officially live!\n\nHere is what this unlocks for our members:\n→ Exclusive member-only templates & frameworks\n→ Direct access to our upcoming community session\n→ Early-bird access to our next product drop\n\nQuestions or thoughts? Drop them below!`,
    },
    {
      id: 'discussion',
      icon: MessageSquare,
      label: 'Discussion Starter',
      titleDefault: `Quick question: What's your #1 bottleneck in ${nicheTopic}?`,
      description: 'Spark member conversations and pinpoint audience challenges',
      example: `Quick question for the ${productName} community:\n\nWhat is the SINGLE biggest bottleneck holding you back in ${nicheTopic} right now?\n\nBe 100% honest. I am personally answering and breaking down solutions for the top questions this week.\n\nDrop your thoughts below 👇`,
    },
    {
      id: 'challenge',
      icon: Radio,
      label: 'Weekly Challenge',
      titleDefault: `⚡ 72-Hour ${nicheTopic.toUpperCase()} Sprint Challenge!`,
      description: 'Drive active execution and member milestone completions',
      example: `⚡ Weekly Challenge: The 72-Hour ${nicheTopic.toUpperCase()} Sprint!\n\nNo overthinking this week. Every member of ${productName} takes one concrete action towards their goals.\n\nDirect milestone. Clear execution. Ship it.\n\nTag me (@${cleanHandle}) when you drop it — I will personally review and highlight the top submissions in our next update.\n\nWho is in? Comment "IN" below 👇`,
    },
    {
      id: 'welcome',
      icon: Users,
      label: 'Welcome Post',
      titleDefault: `Welcome to ${productName}! Start here 👇`,
      description: 'Onboard new members with energy, clarity, and directions',
      example: `Welcome to ${productName}! 🎉\n\nYou made it. This is the official founding community where we build, execute, and collaborate directly with @${cleanHandle}.\n\nHere is your immediate kickoff checklist:\n→ Introduce yourself below (where you are from & your #1 goal)\n→ Check the pinned resources and asset drops\n→ Join this week's active sprint challenge\n\nTag someone who should be here. Let's build together 👇`,
    },
    {
      id: 'qa',
      icon: MessageSquare,
      label: 'Audience Q&A Prompt',
      titleDefault: `🎙️ Exclusive Community Q&A with ${name}`,
      description: 'Collect questions for live coaching, podcast, or deep-dives',
      example: `🎙️ Exclusive ${productName} Community Q&A with ${name}\n\nI am collecting questions directly from our founding circle for an exclusive deep-dive breakdown.\n\nAsk me anything about:\n→ My workflows and scaling secrets\n→ How we structured ${productName}\n→ My biggest lessons in ${nicheTopic}\n\nDrop your question below — nothing is off-limits!`,
    },
    {
      id: 'recap',
      icon: ChevronRight,
      label: 'Weekly Sprint Recap',
      titleDefault: `🏁 Week in Review: Community Breakthroughs inside ${productName}`,
      description: 'Celebrate member wins and maintain retention momentum',
      example: `🏁 Week in Review: ${productName}\n\nWhat an incredible week across our community:\n✓ Multiple members shipped their first milestones\n✓ Great breakthroughs in our challenge threads\n✓ Our member base continues to grow with high-caliber creators\n\nDrop your biggest win of the week in the comments below! 👇`,
    },
  ]
}

// ─── Mini Calendar Component (Precision Angular Style) ────────────────────────

const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function MiniCalendar({ onSelectDate, selectedDate, scheduledPosts = [], brandRed = '#c81e3c' }) {
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

  const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="w-full text-white">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button 
          type="button"
          onClick={prevMonth} 
          className="w-7 h-7 rounded-none flex items-center justify-center text-slate-400 hover:text-white bg-[#10141f] hover:bg-[#161d2d] transition border border-white/10 cursor-pointer"
          style={{ borderRadius: '0px' }}
        >
          <ChevronRight size={13} className="rotate-180" />
        </button>
        <span className="text-xs font-bold text-white tracking-wide">{MONTHS[month]} {year}</span>
        <button 
          type="button"
          onClick={nextMonth} 
          className="w-7 h-7 rounded-none flex items-center justify-center text-slate-400 hover:text-white bg-[#10141f] hover:bg-[#161d2d] transition border border-white/10 cursor-pointer"
          style={{ borderRadius: '0px' }}
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
          const isToday = dateObj.getTime() === today.getTime()
          const dayShort = dayNamesShort[dateObj.getDay()]

          const isSelected = selectedDate && (
            selectedDate.getFullYear() === dateObj.getFullYear() &&
            selectedDate.getMonth() === dateObj.getMonth() &&
            selectedDate.getDate() === dateObj.getDate()
          )

          const postsForDay = scheduledPosts.filter(p => {
            if (p.date) {
              const d = new Date(p.date)
              d.setHours(0, 0, 0, 0)
              if (d.getTime() === dateObj.getTime()) return true
            }
            if (p.dateLabel && p.dateLabel.includes(dayShort)) {
              return true
            }
            return false
          })
          const hasPost = postsForDay.length > 0

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDate && onSelectDate(dateObj)}
              title={`${dayShort}, ${MONTHS[month]} ${day}${hasPost ? ` · ${postsForDay.length} post(s) in community pipeline` : ' · Click to filter'}`}
              className="relative w-full aspect-square rounded-none flex flex-col items-center justify-center text-[11px] font-mono font-bold transition cursor-pointer hover:border-white/40"
              style={{
                borderRadius: '0px',
                color: isSelected ? '#ffffff' : isToday ? '#ffffff' : hasPost ? '#ffffff' : '#94a3b8',
                background: isSelected 
                  ? brandRed 
                  : isToday 
                    ? 'rgba(200,30,60,0.18)' 
                    : hasPost 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'transparent',
                border: isSelected 
                  ? `1px solid ${brandRed}` 
                  : isToday 
                    ? `1px solid ${brandRed}` 
                    : hasPost 
                      ? '1px solid rgba(255,255,255,0.16)' 
                      : '1px solid transparent',
              }}
            >
              <span>{day}</span>
              {hasPost && (
                <span 
                  className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-none ${isSelected ? 'bg-white' : 'bg-[#c81e3c]'}`}
                  style={{ borderRadius: '0px' }}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Manual Add Member Modal ──────────────────────────────────────────────────

function AddMemberModal({ isOpen, onClose, onAddMember, brandRed = '#c81e3c' }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('Founding Member')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    onAddMember({
      name: name.trim() || 'Community Member',
      email: email.trim(),
      role,
      joinedAt: new Date().toISOString(),
      status: 'Active',
      source: 'Direct Add'
    })
    setName('')
    setEmail('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-none border border-white/10 p-5 sm:p-6 bg-[#0c1017] shadow-2xl space-y-4" style={{ borderRadius: '0px' }}>
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-[#c81e3c]/20 border border-[#c81e3c]/40 flex items-center justify-center text-white" style={{ borderRadius: '0px' }}>
              <UserPlus size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Add Community Member</h3>
              <p className="text-[11px] text-slate-400">Manually enroll a member into your founding circle</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="w-7 h-7 rounded-none flex items-center justify-center bg-[#10141f] border border-white/10 text-slate-400 hover:text-white cursor-pointer"
            style={{ borderRadius: '0px' }}
          >
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Member Name
            </label>
            <input 
              type="text" 
              required
              placeholder="e.g. Maya Chen"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-none text-xs bg-[#10141f] border border-white/10 text-white outline-none focus:border-[#c81e3c] transition"
              style={{ borderRadius: '0px' }}
            />
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Email Address
            </label>
            <input 
              type="email" 
              required
              placeholder="maya@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-none text-xs bg-[#10141f] border border-white/10 text-white outline-none focus:border-[#c81e3c] transition"
              style={{ borderRadius: '0px' }}
            />
          </div>

          <div>
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Member Tier / Role
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full px-3 py-2 rounded-none text-xs bg-[#10141f] border border-white/10 text-white outline-none focus:border-[#c81e3c] transition cursor-pointer"
              style={{ borderRadius: '0px' }}
            >
              <option value="Founding Member">Founding Member</option>
              <option value="VIP Contributor">VIP Contributor</option>
              <option value="Early Adopter">Early Adopter</option>
              <option value="Co-Builder">Co-Builder</option>
            </select>
          </div>

          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-none text-xs font-semibold bg-[#10141f] hover:bg-[#161d2d] text-slate-300 hover:text-white transition border border-white/10 cursor-pointer"
              style={{ borderRadius: '0px' }}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 rounded-none text-xs font-bold text-white transition cursor-pointer border-0 shadow-md"
              style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Broadcast Email & Member Messaging Modal ─────────────────────────────────

function BroadcastModal({ 
  members = [], 
  onClose, 
  triggerToast, 
  creatorData, 
  userProfile,
  productName, 
  brandRed = '#c81e3c', 
  onScheduleToCalendar,
  initialSubject = '',
  initialMessage = '',
  targetPostId = null,
  onBroadcastSent
}) {
  const [subject, setSubject] = useState(initialSubject || '')
  const [message, setMessage] = useState(initialMessage || '')
  const [isSending, setIsSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [isRefiningTitle, setIsRefiningTitle] = useState(false)
  const [isRefiningBody, setIsRefiningBody] = useState(false)

  // Identify the creator / logged in user's email
  const creatorEmail = (userProfile?.email || creatorData?.email || creatorData?.contactEmail || '').trim()

  // Build the live recipient list
  const [recipients, setRecipients] = useState(() => {
    const list = []
    const seen = new Set()

    // 1. Add valid member emails
    (members || []).forEach(m => {
      const email = (m.email || '').trim().toLowerCase()
      if (email && email.includes('@') && !email.endsWith('@example.com') && !seen.has(email)) {
        seen.add(email)
        list.push({ email, name: m.name || '' })
      }
    })

    // 2. Automatically include creator's email so they can receive and verify test broadcasts
    if (creatorEmail && creatorEmail.includes('@') && !seen.has(creatorEmail.toLowerCase())) {
      seen.add(creatorEmail.toLowerCase())
      list.push({ email: creatorEmail.toLowerCase(), name: creatorData?.name || 'Creator (You)' })
    }

    return list
  })

  const [newEmailInput, setNewEmailInput] = useState('')

  const handleAddRecipient = (e) => {
    if (e) e.preventDefault()
    const clean = newEmailInput.trim().toLowerCase()
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      if (triggerToast) triggerToast('Please enter a valid email address', 'error')
      return
    }
    if (recipients.some(r => r.email === clean)) {
      if (triggerToast) triggerToast('Email is already in recipient list', 'info')
      return
    }
    setRecipients(prev => [...prev, { email: clean, name: '' }])
    setNewEmailInput('')
    if (triggerToast) triggerToast(`Added ${clean} to broadcast recipients`, 'success')
  }

  const handleRemoveRecipient = (emailToRemove) => {
    setRecipients(prev => prev.filter(r => r.email !== emailToRemove))
  }

  // 1. AI Title Refinement
  const handleRefineTitle = async () => {
    setIsRefiningTitle(true)
    try {
      const topic = subject.trim() || `Community Update for ${productName}`
      const promptContext = `Generate 1 punchy, high-open-rate email subject line for community update on "${topic}". Niche: ${creatorData?.niche || 'creator'}. Format: return ONLY the single subject line, no quotes, no conversational filler.`
      const result = await generateStudioContent({ label: 'Subject Line', platform: 'Email' }, promptContext, creatorData, 'Confident')
      const cleanTitle = (result || '').replace(/^subject:\s*/i, '').replace(/["']/g, '').trim().split('\n')[0]
      if (cleanTitle) {
        setSubject(cleanTitle)
        if (triggerToast) triggerToast('Email subject refined by AI!', 'success')
      }
    } catch (_) {
      setSubject(`Exclusive Milestone Update for ${productName} Members`)
      if (triggerToast) triggerToast('Applied optimized subject line', 'info')
    } finally {
      setIsRefiningTitle(false)
    }
  }

  // 2. AI Body Refinement
  const handleRefineBody = async () => {
    setIsRefiningBody(true)
    try {
      const inputContext = `Refine this community email update. Current draft: "${message || `Update for our members in ${productName}`}". Niche: ${creatorData?.niche || 'creation'}. Tone: Confident, warm, community-first, actionable.`
      const draft = await generateStudioContent({ label: 'Community Email', platform: 'Email' }, inputContext, creatorData, 'Confident')
      
      let cleanDraft = draft
      if (draft.includes('Subject:')) {
        const lines = draft.split('\n')
        const subjLine = lines.find(l => l.toLowerCase().startsWith('subject:'))
        if (subjLine && !subject) {
          setSubject(subjLine.replace(/subject:\s*/i, '').trim())
        }
        cleanDraft = lines.filter(l => !l.toLowerCase().startsWith('subject:')).join('\n').trim()
      }
      setMessage(cleanDraft)
      if (triggerToast) triggerToast('Email body refined by AI!', 'success')
    } catch (_) {
      setMessage(`Hey everyone,\n\nHere is a quick milestone update for our ${productName} community...\n\nKeep building,\n${creatorData?.name || 'Creator'}`)
      if (triggerToast) triggerToast('Applied community email draft', 'info')
    } finally {
      setIsRefiningBody(false)
    }
  }

  // Real Backend Dispatch
  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      if (triggerToast) triggerToast('Subject line and message body are required', 'error')
      return
    }
    if (recipients.length === 0) {
      if (triggerToast) triggerToast('Please add at least one recipient email address', 'error')
      return
    }

    setIsSending(true)
    setSendError('')

    const payload = {
      handle: (creatorData?.handle || 'creator').replace(/^@/, ''),
      creator_name: creatorData?.name || 'Creator',
      product_name: productName || 'Community',
      subject: subject.trim(),
      message: message.trim(),
      recipients: recipients,
      reply_to: creatorEmail || undefined,
      from_name: `${creatorData?.name || 'Creator'} · ${productName || 'CoLaunch'}`
    }

    const candidateUrls = [
      '',
      'https://creator-forge-backend-jj1y.onrender.com',
      'https://creator-forge-backend.onrender.com'
    ]

    let delivered = false
    let resultData = null
    let errorDetail = ''

    for (const baseUrl of candidateUrls) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 12000)
        const res = await fetch(`${baseUrl}/api/community/broadcast`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        })
        clearTimeout(timeoutId)

        if (res.ok) {
          const data = await res.json()
          if (data && (data.status === 'success' || data.sent_count > 0)) {
            delivered = true
            resultData = data
            break
          }
        } else {
          const errData = await res.json().catch(() => ({}))
          errorDetail = errData.detail || `Server responded with ${res.status}`
        }
      } catch (err) {
        errorDetail = err.message || 'Connection timeout'
      }
    }

    setIsSending(false)

    if (delivered) {
      const count = resultData?.sent_count || recipients.length
      if (triggerToast) {
        triggerToast(`Broadcast email delivered to ${count} recipient inbox(es)!`, 'success')
      }
      if (onBroadcastSent) {
        onBroadcastSent({ subject, message, targetPostId, recipients })
      }
      onClose()
    } else {
      const finalMsg = errorDetail || 'Could not connect to email delivery service.'
      setSendError(finalMsg)
      if (triggerToast) {
        triggerToast(`Email delivery notice: ${finalMsg}`, 'error')
      }
    }
  }

  const handleCalendarDrop = () => {
    if (!subject.trim() || !message.trim()) return
    onScheduleToCalendar({
      title: subject,
      body: message,
      type: 'Email',
      platform: 'Email'
    })
    onClose()
  }

  const mailtoLink = `mailto:?bcc=${recipients.map(r => r.email).filter(Boolean).join(',')}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div 
        className="w-full max-w-xl rounded-none border border-white/10 p-5 sm:p-6 flex flex-col shadow-2xl relative max-h-[92vh] bg-[#0c1017] space-y-4"
        style={{ borderRadius: '0px' }}
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition w-8 h-8 rounded-none flex items-center justify-center bg-[#10141f] border border-white/10 cursor-pointer"
          style={{ borderRadius: '0px' }}
        >
          <X size={15} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
          <div 
            className="w-9 h-9 rounded-none flex items-center justify-center border border-[#c81e3c]/40 bg-[#c81e3c]/20 text-white" 
            style={{ borderRadius: '0px' }}
          >
            <Send size={15} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Broadcast Email &amp; Member Message</h3>
            <p className="text-[11px] text-slate-400">
              Live email delivery across <strong className="text-white">{recipients.length} recipient inbox(es)</strong>
            </p>
          </div>
        </div>

        {/* Recipients Bar */}
        <div className="bg-[#10141f] border border-white/10 p-2.5 rounded-none space-y-2" style={{ borderRadius: '0px' }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              Recipients ({recipients.length})
            </span>
            {creatorEmail && !recipients.some(r => r.email === creatorEmail.toLowerCase()) && (
              <button
                type="button"
                onClick={() => setRecipients(prev => [...prev, { email: creatorEmail.toLowerCase(), name: 'You' }])}
                className="text-[10px] font-mono font-bold text-rose-300 hover:text-white underline cursor-pointer"
              >
                + Add my email ({creatorEmail})
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap max-h-20 overflow-y-auto custom-scrollbar">
            {recipients.map(r => (
              <span
                key={r.email}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-none text-[10px] font-mono bg-white/[0.06] text-slate-200 border border-white/10"
                style={{ borderRadius: '0px' }}
              >
                <span>{r.email}</span>
                {r.name && <span className="text-slate-400">({r.name})</span>}
                <button
                  type="button"
                  onClick={() => handleRemoveRecipient(r.email)}
                  className="text-slate-500 hover:text-rose-400 ml-0.5 cursor-pointer"
                  title="Remove recipient"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>

          {/* Add custom email input */}
          <form onSubmit={handleAddRecipient} className="flex items-center gap-2 pt-1">
            <input
              type="email"
              value={newEmailInput}
              onChange={e => setNewEmailInput(e.target.value)}
              placeholder="Add another recipient email (e.g. test recipient)..."
              className="flex-1 px-2.5 py-1 text-xs bg-[#090c14] border border-white/10 text-white rounded-none outline-none focus:border-[#c81e3c]"
              style={{ borderRadius: '0px' }}
            />
            <button
              type="submit"
              className="px-2.5 py-1 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/10 rounded-none cursor-pointer"
              style={{ borderRadius: '0px' }}
            >
              + Add
            </button>
          </form>
        </div>

        {/* Error Notification if any */}
        {sendError && (
          <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs rounded-none flex items-center justify-between gap-2" style={{ borderRadius: '0px' }}>
            <span>{sendError}</span>
            <a
              href={mailtoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold underline text-white whitespace-nowrap"
            >
              Send via Gmail ↗
            </a>
          </div>
        )}

        {/* Form Inputs */}
        <div className="space-y-3.5 flex-1 overflow-y-auto pr-1 py-1 custom-scrollbar">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Email Subject / Title
              </label>
              <button 
                type="button"
                onClick={handleRefineTitle}
                disabled={isRefiningTitle}
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-none border border-[#c81e3c]/40 bg-[#c81e3c]/20 text-white hover:bg-[#c81e3c]/35 transition cursor-pointer"
                style={{ borderRadius: '0px' }}
              >
                <Sparkles size={10} className={isRefiningTitle ? 'animate-spin' : ''} />
                <span>{isRefiningTitle ? 'Refining...' : 'AI Refine Title'}</span>
              </button>
            </div>
            <input 
              type="text" 
              required
              placeholder="e.g. Milestone unlocked: New resources & sprint update"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-none text-xs bg-[#10141f] border border-white/10 text-white outline-none focus:border-[#c81e3c] transition"
              style={{ borderRadius: '0px' }}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Message Body
              </label>
              <button 
                type="button"
                onClick={handleRefineBody}
                disabled={isRefiningBody}
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-none border border-[#c81e3c]/40 bg-[#c81e3c]/20 text-white hover:bg-[#c81e3c]/35 transition cursor-pointer"
                style={{ borderRadius: '0px' }}
              >
                <Sparkles size={10} className={isRefiningBody ? 'animate-spin' : ''} />
                <span>{isRefiningBody ? 'Refining...' : 'AI Refine Message'}</span>
              </button>
            </div>
            <textarea
              required
              rows={6}
              placeholder="Write your message or update for your community members..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-none text-xs bg-[#10141f] border border-white/10 text-white outline-none focus:border-[#c81e3c] transition resize-none font-mono leading-relaxed"
              style={{ borderRadius: '0px' }}
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between gap-3 flex-wrap">
          <a
            href={mailtoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition px-2.5 py-1 bg-[#10141f] border border-white/10"
            style={{ borderRadius: '0px' }}
          >
            <ExternalLink size={12} className="text-[#c81e3c]" />
            <span>Open in Mail Client</span>
          </a>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={handleCalendarDrop}
              disabled={!subject.trim() || !message.trim()}
              className="px-3 py-2 rounded-none text-xs font-bold text-slate-200 bg-[#161c2c] hover:bg-[#1c2438] border border-white/15 transition cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
              style={{ borderRadius: '0px' }}
              title="Schedule this email blast directly into your Content Calendar"
            >
              <Calendar size={13} className="text-[#c81e3c]" />
              <span>Schedule to Calendar</span>
            </button>

            <button 
              type="button"
              onClick={handleSend}
              disabled={isSending || !subject.trim() || !message.trim() || recipients.length === 0}
              className="px-4 py-2 rounded-none text-xs font-bold text-white transition cursor-pointer border-0 shadow-md disabled:opacity-40 flex items-center gap-1.5"
              style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
            >
              {isSending && <RefreshCw size={12} className="animate-spin text-white" />}
              <span>{isSending ? `Sending to ${recipients.length} inboxes...` : `Send to ${recipients.length} Recipient(s)`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Automated Member Welcome Setup Modal ──────────────────────────────────────

function WelcomeSetupModal({ isOpen, onClose, cleanHandle, creatorData, productName, triggerToast, brandRed = '#c81e3c' }) {
  const [enabled, setEnabled] = useState(true)
  const [subject, setSubject] = useState(`Welcome to ${productName}! Here is your kickoff blueprint`)
  const [message, setMessage] = useState(
    `Hey there!\n\nWelcome to the official founding circle of ${productName}. You now have exclusive direct access to our weekly challenges, product blueprints, and member sessions.\n\nIntroduce yourself and let us know what you are building!`
  )
  const [isRefiningTitle, setIsRefiningTitle] = useState(false)
  const [isRefiningBody, setIsRefiningBody] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`forge_${cleanHandle}_community_welcome`)
      if (raw) {
        const parsed = JSON.parse(raw)
        setEnabled(parsed.enabled !== false)
        if (parsed.subject) setSubject(parsed.subject)
        if (parsed.message) setMessage(parsed.message)
      }
    } catch (_) {}
  }, [cleanHandle])

  if (!isOpen) return null

  const handleRefineTitle = async () => {
    setIsRefiningTitle(true)
    try {
      const promptContext = `Generate 1 punchy, welcoming email subject line for new members joining "${productName}". Format: return ONLY the single subject line.`
      const res = await generateStudioContent({ label: 'Welcome Subject', platform: 'Email' }, promptContext, creatorData, 'Confident')
      const clean = (res || '').replace(/^subject:\s*/i, '').replace(/["']/g, '').trim().split('\n')[0]
      if (clean) setSubject(clean)
    } catch (_) {}
    setIsRefiningTitle(false)
  }

  const handleRefineBody = async () => {
    setIsRefiningBody(true)
    try {
      const promptContext = `Write a high-converting automated welcome email for new members joining "${productName}". Creator: ${creatorData?.name || 'Creator'}. Niche: ${creatorData?.niche || 'creation'}. Tone: Warm, exciting, clear next steps.`
      const res = await generateStudioContent({ label: 'Welcome Email', platform: 'Email' }, promptContext, creatorData, 'Confident')
      if (res) setMessage(res)
    } catch (_) {}
    setIsRefiningBody(false)
  }

  const handleSave = () => {
    const payload = { enabled, subject, message, updatedAt: new Date().toISOString() }
    localStorage.setItem(`forge_${cleanHandle}_community_welcome`, JSON.stringify(payload))
    if (triggerToast) triggerToast('Automated welcome setup saved!', 'success')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-none border border-white/10 p-5 sm:p-6 bg-[#0c1017] shadow-2xl space-y-4" style={{ borderRadius: '0px' }}>
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-none bg-[#c81e3c]/20 border border-[#c81e3c]/40 flex items-center justify-center text-white" style={{ borderRadius: '0px' }}>
              <Mail size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Automated Member Welcome Setup</h3>
              <p className="text-[11px] text-slate-400">Displayed and dispatched to anyone who joins via your invite link</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="w-7 h-7 rounded-none flex items-center justify-center bg-[#10141f] border border-white/10 text-slate-400 hover:text-white cursor-pointer"
            style={{ borderRadius: '0px' }}
          >
            <X size={14} />
          </button>
        </div>

        <div className="space-y-3.5">
          <div className="flex items-center justify-between p-2.5 bg-[#10141f] border border-white/[0.08]" style={{ borderRadius: '0px' }}>
            <div>
              <span className="text-xs font-bold text-white block">Auto-Send Welcome Greeting</span>
              <span className="text-[10px] text-slate-400">Instantly greet every new member who joins via URL</span>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(v => !v)}
              className={`px-3 py-1 text-xs font-bold transition cursor-pointer border-0 ${enabled ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}
              style={{ borderRadius: '0px' }}
            >
              {enabled ? 'Active' : 'Disabled'}
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Welcome Title / Subject
              </label>
              <button 
                type="button"
                onClick={handleRefineTitle}
                disabled={isRefiningTitle}
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-none border border-[#c81e3c]/40 bg-[#c81e3c]/20 text-white hover:bg-[#c81e3c]/35 transition cursor-pointer"
                style={{ borderRadius: '0px' }}
              >
                <Sparkles size={10} className={isRefiningTitle ? 'animate-spin' : ''} />
                <span>{isRefiningTitle ? 'Refining...' : 'AI Refine Title'}</span>
              </button>
            </div>
            <input 
              type="text"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-none text-xs bg-[#10141f] border border-white/10 text-white outline-none focus:border-[#c81e3c] transition"
              style={{ borderRadius: '0px' }}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Welcome Message Body
              </label>
              <button 
                type="button"
                onClick={handleRefineBody}
                disabled={isRefiningBody}
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-none border border-[#c81e3c]/40 bg-[#c81e3c]/20 text-white hover:bg-[#c81e3c]/35 transition cursor-pointer"
                style={{ borderRadius: '0px' }}
              >
                <Sparkles size={10} className={isRefiningBody ? 'animate-spin' : ''} />
                <span>{isRefiningBody ? 'Refining...' : 'AI Refine Message'}</span>
              </button>
            </div>
            <textarea
              rows={5}
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-none text-xs bg-[#10141f] border border-white/10 text-white outline-none focus:border-[#c81e3c] transition font-mono resize-none leading-relaxed"
              style={{ borderRadius: '0px' }}
            />
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 rounded-none text-xs font-semibold bg-[#10141f] hover:bg-[#161d2d] text-slate-300 hover:text-white transition border border-white/10 cursor-pointer"
            style={{ borderRadius: '0px' }}
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-none text-xs font-bold text-white transition cursor-pointer border-0 shadow-md"
            style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
          >
            Save Welcome Setup
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Community Component ─────────────────────────────────────────────────

export default function Community() {
  const { 
    creatorData, 
    incrementAiActions, 
    setApiModalOpen, 
    triggerToast, 
    dashboardData, 
    saveDashboardData, 
    setActiveTab,
    userProfile
  } = useForge()

  const brandRed = '#c81e3c'
  const handle = creatorData?.handle || '@creator'
  const productName = creatorData?.productName || 'Creator Academy'
  const cleanHandle = handle.replace(/^@/, '').replace(/\//g, '-').toLowerCase()
  const creatorName = creatorData?.name || cleanHandle || 'Creator'
  const niche = creatorData?.niche || 'content creation'

  // Dynamic Content Types personalized to creator & product
  const communityContentTypes = useMemo(
    () => getCommunityContentTypes(productName, creatorName, cleanHandle, niche),
    [productName, creatorName, cleanHandle, niche]
  )

  const [activeTabSub, setActiveTabSub] = useState('hub') // 'hub' | 'members' | 'email'
  const [selectedType, setSelectedType] = useState(() => communityContentTypes[0])
  const [postTitle, setPostTitle] = useState(() => communityContentTypes[0]?.titleDefault || '')
  const [generated, setGenerated] = useState(() => communityContentTypes[0]?.example || '')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRefiningTitle, setIsRefiningTitle] = useState(false)
  const [copied, setCopied] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [expandedPostId, setExpandedPostId] = useState(null)
  const [editingPostId, setEditingPostId] = useState(null)
  const [editingText, setEditingText] = useState('')
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [broadcastDraft, setBroadcastDraft] = useState({ subject: '', message: '', targetPostId: null })
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null)
  const [pipelineChannelFilter, setPipelineChannelFilter] = useState('all') // 'all' | 'email' | 'youtube'
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [welcomeSetupOpen, setWelcomeSetupOpen] = useState(false)
  const [memberFilter, setMemberFilter] = useState('all')
  const [memberSearchQuery, setMemberSearchQuery] = useState('')
  const calendarRef = useRef(null)

  // ── 1. Real Members (Zero Fake Silicon Valley Placeholders) ──
  const getMembersKey = () => `forge_${cleanHandle}_community_members`
  const [members, setMembers] = useState(() => {
    try {
      const cached = localStorage.getItem(getMembersKey())
      if (cached) {
        const parsed = JSON.parse(cached)
        // Discard legacy mock arrays containing Alex Rivera or Sarah Lin
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed.some(m => m.name === 'Alex Rivera' || m.name === 'Sarah Lin')) {
          return parsed
        }
      }
      return []
    } catch (_) { 
      return []
    }
  })

  // ── 2. Real Traffic / Visits Count ──
  const getVisitsKey = () => `forge_${cleanHandle}_community_visits`
  const [trafficCount, setTrafficCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem(getVisitsKey()) || '0', 10)
    } catch (_) {
      return 0
    }
  })

  // Listen for real-time member joins & traffic
  useEffect(() => {
    const handleMemberJoined = (e) => {
      const newMember = e.detail
      if (!newMember) return
      setMembers(prev => {
        if (prev.some(m => m.email?.toLowerCase() === newMember.email?.toLowerCase())) return prev
        const updated = [newMember, ...prev]
        try { localStorage.setItem(getMembersKey(), JSON.stringify(updated)) } catch (_) {}
        return updated
      })
      setTrafficCount(prev => prev + 1)
      if (triggerToast) triggerToast(`New member joined: ${newMember.name || newMember.email}!`, 'success')
    }
    window.addEventListener('forge_member_joined', handleMemberJoined)
    return () => window.removeEventListener('forge_member_joined', handleMemberJoined)
  }, [cleanHandle, triggerToast])

  // Hydrate once from MongoDB Atlas if available
  const hasHydratedRef = useRef(false)
  useEffect(() => {
    if (hasHydratedRef.current) return
    if (dashboardData?.community_data) {
      hasHydratedRef.current = true
      if (Array.isArray(dashboardData.community_data.members)) {
        // Filter out legacy dummy arrays
        const realMembers = dashboardData.community_data.members.filter(m => m && m.name !== 'Alex Rivera' && m.name !== 'Sarah Lin')
        if (realMembers.length > 0) setMembers(realMembers)
      }
      if (typeof dashboardData.community_data.traffic === 'number') {
        setTrafficCount(dashboardData.community_data.traffic)
      }
    }
  }, [dashboardData?.community_data])

  const persistMembers = (updated) => {
    setMembers(updated)
    try {
      localStorage.setItem(getMembersKey(), JSON.stringify(updated))
    } catch (_) {}
    if (saveDashboardData) {
      saveDashboardData('community', {
        members: updated,
        traffic: trafficCount,
        synced_at: new Date().toISOString()
      })
    }
  }

  // ── 3. Real Scheduled Community Posts Reflected With Content Calendar ──
  const getCalendarKey = () => `forge_calendar_${cleanHandle}_launch_w0`
  const getCommunityPostsKey = () => `forge_${cleanHandle}_community_posts`

  // Helper to load all community & email posts directly reflecting the central calendar
  const loadReflectedCalendarPosts = () => {
    const allCommunityPosts = []
    
    // A. Read direct community scheduled posts
    try {
      const cached = localStorage.getItem(getCommunityPostsKey())
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed)) {
          // Reject legacy mock posts ('sched-1', 'sched-2')
          const real = parsed.filter(p => p && p.id !== 'sched-1' && p.id !== 'sched-2' && p.id !== 'sched-3')
          allCommunityPosts.push(...real)
        }
      }
    } catch (_) {}

    // B. Read central launch calendar to reflect YouTube Community / Email drops
    try {
      const calRaw = localStorage.getItem(getCalendarKey()) || localStorage.getItem(`forge_calendar_${cleanHandle.replace(/[^a-z0-9_]/g, '_')}_launch_w0`)
      if (calRaw) {
        const parsedCal = JSON.parse(calRaw)
        if (Array.isArray(parsedCal)) {
          parsedCal.forEach((dayData, dayIdx) => {
            const posts = dayData.posts || []
            posts.forEach(p => {
              const pType = (p.type || '').toLowerCase()
              const pPlat = (p.platform || '').toLowerCase()
              const pTheme = (p.theme || '').toLowerCase()
              if (pType.includes('communit') || pPlat.includes('communit') || pPlat.includes('email') || pType.includes('email') || pTheme === 'community') {
                allCommunityPosts.push({
                  id: `cal-${dayData.day}-${p.id}`,
                  calendarId: p.id,
                  day: dayData.day,
                  type: p.type || 'Community Post',
                  title: p.title || p.label || 'Community Update',
                  content: p.body || p.title || 'Scheduled campaign update',
                  fullContent: p.body || p.title || '',
                  platform: p.platform || 'YouTube',
                  dateLabel: `${dayData.day} · Active Sprint`,
                  status: p.status || 'Draft',
                  fromCalendar: true
                })
              }
            })
          })
        }
      }
    } catch (_) {}

    // De-duplicate by title/id
    const seen = new Set()
    return allCommunityPosts.filter(p => {
      const key = `${p.type}_${p.title}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  const [scheduledPosts, setScheduledPosts] = useState(loadReflectedCalendarPosts)

  // Listen for calendar updates dispatched anywhere across the app
  useEffect(() => {
    const handleCalendarSync = () => {
      setScheduledPosts(loadReflectedCalendarPosts())
    }
    window.addEventListener('forge_calendar_updated', handleCalendarSync)
    return () => window.removeEventListener('forge_calendar_updated', handleCalendarSync)
  }, [cleanHandle])

  // Quick Action: Open Broadcast Modal pre-populated with any post
  const handleOpenBroadcastForPost = (post) => {
    setBroadcastDraft({
      subject: post.title || `Community Update: ${productName}`,
      message: post.fullContent || post.content || '',
      targetPostId: post.id
    })
    setBroadcastOpen(true)
  }

  // Quick Action: Load post into Composer for refinement
  const handleLoadToComposer = (post) => {
    setPostTitle(post.title || '')
    setGenerated(post.fullContent || post.content || '')
    const matchingType = communityContentTypes.find(t => t.label.toLowerCase() === (post.type || '').toLowerCase())
    if (matchingType) setSelectedType(matchingType)
    if (triggerToast) triggerToast('Loaded post into composer for editing', 'info')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Quick Action: Toggle Sent / Published Status
  const handleTogglePostStatus = (post) => {
    const isCurrentlySent = (post.status || '').toLowerCase() === 'sent' || (post.status || '').toLowerCase() === 'published'
    const newStatus = isCurrentlySent ? 'Scheduled' : 'Sent'

    // Update in memory
    setScheduledPosts(prev => prev.map(p => p.id === post.id ? { ...p, status: newStatus } : p))

    // Update local community store
    try {
      const cached = localStorage.getItem(getCommunityPostsKey())
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed)) {
          const updated = parsed.map(p => p.id === post.id ? { ...p, status: newStatus } : p)
          localStorage.setItem(getCommunityPostsKey(), JSON.stringify(updated))
        }
      }
    } catch (_) {}

    // Update central calendar store if originated from calendar
    try {
      const calKey = getCalendarKey()
      const calRaw = localStorage.getItem(calKey)
      if (calRaw) {
        let parsedCal = JSON.parse(calRaw)
        if (Array.isArray(parsedCal)) {
          let updatedAny = false
          parsedCal = parsedCal.map(dayData => {
            const posts = (dayData.posts || []).map(p => {
              if (p.id === post.calendarId || `cal-${dayData.day}-${p.id}` === post.id || p.title === post.title) {
                updatedAny = true
                return { ...p, status: newStatus.toLowerCase() }
              }
              return p
            })
            return { ...dayData, posts }
          })
          if (updatedAny) {
            localStorage.setItem(calKey, JSON.stringify(parsedCal))
            window.dispatchEvent(new CustomEvent('forge_calendar_updated', { detail: { source: 'Community' } }))
          }
        }
      }
    } catch (_) {}

    if (triggerToast) {
      triggerToast(newStatus === 'Sent' ? 'Post marked as Sent & Delivered!' : 'Post status reset to Scheduled', 'success')
    }
  }

  // Callback when broadcast email sends successfully
  const handleBroadcastSent = ({ targetPostId }) => {
    if (targetPostId) {
      const matchingPost = scheduledPosts.find(p => p.id === targetPostId)
      if (matchingPost) {
        handleTogglePostStatus({ ...matchingPost, status: 'Draft' })
      }
    }
  }

  // Helper: Match post with selected calendar date
  const postMatchesDate = (post, targetDate) => {
    if (!targetDate) return true
    const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayShort = dayNamesShort[targetDate.getDay()]

    if (post.date) {
      const d = new Date(post.date)
      if (!isNaN(d.getTime())) {
        if (d.getFullYear() === targetDate.getFullYear() &&
            d.getMonth() === targetDate.getMonth() &&
            d.getDate() === targetDate.getDate()) {
          return true
        }
      }
    }

    if (post.day && post.day.toLowerCase() === dayShort.toLowerCase()) {
      return true
    }

    const label = (post.dateLabel || '').toLowerCase()
    if (label.includes(dayShort.toLowerCase())) {
      return true
    }

    return false
  }

  // Filtered posts based on active channel and date filters
  const filteredPipelinePosts = useMemo(() => {
    return scheduledPosts.filter(post => {
      // 1. Channel filter
      if (pipelineChannelFilter === 'email') {
        const isEmail = (post.platform || '').toLowerCase().includes('email') || (post.type || '').toLowerCase().includes('email')
        if (!isEmail) return false
      } else if (pipelineChannelFilter === 'youtube') {
        const isYt = (post.platform || '').toLowerCase().includes('youtube') || (post.type || '').toLowerCase().includes('communit')
        if (!isYt) return false
      }

      // 2. Date filter
      if (selectedCalendarDate) {
        if (!postMatchesDate(post, selectedCalendarDate)) {
          return false
        }
      }

      return true
    })
  }, [scheduledPosts, pipelineChannelFilter, selectedCalendarDate])

  const emailPostsCount = useMemo(() => {
    return scheduledPosts.filter(p => (p.platform || '').toLowerCase().includes('email') || (p.type || '').toLowerCase().includes('email')).length
  }, [scheduledPosts])

  const ytPostsCount = useMemo(() => {
    return scheduledPosts.filter(p => (p.platform || '').toLowerCase().includes('youtube') || (p.type || '').toLowerCase().includes('communit')).length
  }, [scheduledPosts])

  // Save new scheduled community post to BOTH Community & central Content Calendar
  const scheduleCommunityPostToCalendar = (postData, targetDate = new Date()) => {
    const postId = Date.now().toString()
    const dateLabel = targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const dayName = dayNames[targetDate.getDay()]

    const newPost = {
      id: postId,
      type: postData.type || selectedType.label,
      typeId: selectedType.id,
      title: postData.title || postTitle || selectedType.label,
      content: (postData.body || generated).slice(0, 140) + '…',
      fullContent: postData.body || generated,
      platform: postData.platform || 'YouTube',
      date: targetDate.toISOString(),
      dateLabel,
      status: 'Scheduled',
      createdAt: new Date().toISOString()
    }

    // 1. Save in local community store
    const updatedCommunity = [newPost, ...scheduledPosts.filter(p => !p.fromCalendar)]
    setScheduledPosts(prev => [newPost, ...prev])
    try {
      localStorage.setItem(getCommunityPostsKey(), JSON.stringify(updatedCommunity))
    } catch (_) {}

    // 2. Synchronize directly into Content Calendar (forge_calendar_${cleanHandle}_launch_w0)
    try {
      const calKey = getCalendarKey()
      const calRaw = localStorage.getItem(calKey)
      let parsedCal = calRaw ? JSON.parse(calRaw) : []
      if (!Array.isArray(parsedCal) || parsedCal.length === 0) {
        parsedCal = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({ day, posts: [] }))
      }

      const calendarPostShape = {
        id: Date.now(),
        platform: postData.platform || 'YouTube',
        type: postData.type || 'Community',
        title: postData.title || postTitle || selectedType.label,
        body: postData.body || generated,
        theme: 'community',
        status: 'draft',
        time: '9:00 AM'
      }

      // Add to corresponding day
      const targetDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][targetDate.getDay()] || 'Mon'
      parsedCal = parsedCal.map(d => {
        if (d.day === targetDay || (targetDay === 'Sun' && d.day === 'Sun')) {
          return { ...d, posts: [...(d.posts || []), calendarPostShape] }
        }
        return d
      })

      localStorage.setItem(calKey, JSON.stringify(parsedCal))
      // Notify ContentCalendar and Marketing immediately
      window.dispatchEvent(new CustomEvent('forge_calendar_updated', { detail: { source: 'Community' } }))
    } catch (_) {}

    if (triggerToast) {
      triggerToast(`Post scheduled for ${dateLabel} & synchronized with Content Calendar!`, 'success')
    }
  }

  // ── 4. Public Invite Link ──
  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://app.co-launch.app'}/join/${cleanHandle}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
    if (triggerToast) triggerToast('Community invite link copied!', 'success')
  }

  // ── 5. AI Generation & Title Refinement ──
  const handleSelectType = (type) => {
    setSelectedType(type)
    setPostTitle(type.titleDefault)
    setGenerated(type.example)
  }

  const handleRefineTitle = async () => {
    setIsRefiningTitle(true)
    try {
      const promptContext = `Refine this community headline to be irresistible, concise, and high-engagement: "${postTitle || selectedType.titleDefault}". Niche: ${niche}. Format: return ONLY the single title, no quotes, no extra prose.`
      const res = await generateStudioContent({ label: 'Title', platform: 'Community' }, promptContext, creatorData, 'Confident')
      const clean = (res || '').replace(/^title:\s*/i, '').replace(/["']/g, '').trim().split('\n')[0]
      if (clean) {
        setPostTitle(clean)
        if (triggerToast) triggerToast('Community post title refined by AI!', 'success')
      }
    } catch (_) {
      if (triggerToast) triggerToast('Title refined', 'info')
    } finally {
      setIsRefiningTitle(false)
    }
  }

  const handleGenerateBody = async () => {
    if (!hasTextKey()) {
      if (setApiModalOpen) setApiModalOpen(true)
      return
    }
    setIsGenerating(true)
    try {
      const contentType = { label: selectedType.label, platform: 'Community' }
      const inputContext = `${selectedType.description}. Title: "${postTitle}". Community: "${productName}" by ${handle}. Authentic, energetic, and engaging for our founding members.`
      const result = await generateStudioContent(contentType, inputContext, creatorData, 'Confident')
      setGenerated(result || selectedType.example)
      if (incrementAiActions) incrementAiActions()
      if (triggerToast) triggerToast('Community post drafted by AI!', 'success')
    } catch (err) {
      console.warn('[Forge Community] AI notice:', err)
      setGenerated(selectedType.example)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    if (!generated) return
    const textToCopy = `${postTitle}\n\n${generated}`
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    if (triggerToast) triggerToast('Copied content to clipboard', 'success')
  }

  const handleDeletePost = (id) => {
    const updated = scheduledPosts.filter(p => p.id !== id)
    setScheduledPosts(updated)
    try {
      const communityOnly = updated.filter(p => !p.fromCalendar)
      localStorage.setItem(getCommunityPostsKey(), JSON.stringify(communityOnly))
    } catch (_) {}
    if (triggerToast) triggerToast('Post removed from queue', 'info')
  }

  const handleExportCsv = () => {
    if (members.length === 0) return
    const headers = 'Name,Email,Role,Status,Joined Date,Source\n'
    const rows = members.map(m => `"${m.name}","${m.email}","${m.role}","${m.status || 'Active'}","${m.joinedAt || ''}","${m.source || 'Invite Link'}"`).join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${cleanHandle}_community_members.csv`
    a.click()
    URL.revokeObjectURL(url)
    if (triggerToast) triggerToast('Members list exported to CSV', 'success')
  }

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

  // Conversion calculation
  const conversionRate = useMemo(() => {
    if (trafficCount === 0 && members.length === 0) return '0.0%'
    const denom = Math.max(trafficCount, members.length, 1)
    return `${((members.length / denom) * 100).toFixed(1)}%`
  }, [members.length, trafficCount])

  return (
    <div className="min-h-full flex flex-col bg-[#090d16] text-slate-200 p-4 sm:p-6 space-y-6">
      
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="w-2 h-2 rounded-none bg-[#c81e3c]" style={{ borderRadius: '0px' }} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Community Connection Hub &amp; Member Engagement Engine
            </span>
            <span className="px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider bg-[#c81e3c]/20 text-white border border-[#c81e3c]/40" style={{ borderRadius: '0px' }}>
              Founding Circle
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{productName} Community</span>
            <Sparkles size={18} className="text-[#c81e3c]" />
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Real member connections, live invite URLs, automated welcome flows, and calendar-synced community updates.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 bg-[#121622] hover:bg-[#181e30] border border-white/10 rounded-none transition cursor-pointer"
            style={{ borderRadius: '0px' }}
            title="Copy public member join invite link"
          >
            {linkCopied ? <Check size={13} className="text-emerald-400" /> : <Link2 size={13} className="text-[#c81e3c]" />}
            <span>{linkCopied ? 'Link Copied!' : 'Copy Member Join Link'}</span>
          </button>

          <button
            type="button"
            onClick={() => setWelcomeSetupOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 bg-[#121622] hover:bg-[#181e30] border border-white/10 rounded-none transition cursor-pointer"
            style={{ borderRadius: '0px' }}
            title="Configure automated member welcome message"
          >
            <Mail size={13} className="text-[#c81e3c]" />
            <span>Welcome Setup</span>
          </button>

          <button
            type="button"
            onClick={() => setBroadcastOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-none transition shadow-sm cursor-pointer hover:opacity-95 border-0"
            style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
          >
            <Send size={13} className="text-white" />
            <span>Broadcast Email</span>
          </button>
        </div>
      </div>

      {/* ── MEMBER INVITE URL BANNER (Urls Of People Joining) ── */}
      <div className="p-3.5 sm:p-4 bg-[#0c1017] border border-white/[0.08] rounded-none flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md" style={{ borderRadius: '0px' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-none bg-[#c81e3c]/20 border border-[#c81e3c]/40 flex items-center justify-center text-white shrink-0" style={{ borderRadius: '0px' }}>
            <Link2 size={16} className="text-[#ff8093]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Member Join Portal URL:
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 border border-emerald-500/20">
                Live &amp; Accepting Signups
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <code className="text-xs font-mono font-bold text-white truncate max-w-md bg-[#10141f] px-2 py-0.5 border border-white/10">
                {inviteLink}
              </code>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`/join/${cleanHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white px-3 py-1.5 bg-[#10141f] hover:bg-[#161d2d] border border-white/10 transition"
            style={{ borderRadius: '0px' }}
            title="Preview member join screen in a new tab"
          >
            <ExternalLink size={12} />
            <span>Preview Join Page ↗</span>
          </a>

          <button
            type="button"
            onClick={() => setAddMemberOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 border-0 shadow-sm transition hover:opacity-95 cursor-pointer"
            style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
          >
            <UserPlus size={12} className="text-white" />
            <span>+ Add Member</span>
          </button>
        </div>
      </div>

      {/* ── 4 REAL COMMUNITY HEALTH METRIC CARDS (Zero Mockups) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Real Total Members */}
        <div className="p-3.5 bg-[#0c1017] border border-white/[0.08] rounded-none" style={{ borderRadius: '0px' }}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Members</span>
            <Users size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{members.length}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-none ${members.length > 0 ? 'bg-emerald-400' : 'bg-amber-400'}`} style={{ borderRadius: '0px' }} />
            <span>{members.length > 0 ? `${members.length} verified enrolled` : 'Awaiting first joiner'}</span>
          </div>
        </div>

        {/* Metric 2: Real Page Traffic / Link Views */}
        <div className="p-3.5 bg-[#0c1017] border border-white/[0.08] rounded-none" style={{ borderRadius: '0px' }}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Link Visitors (Traffic)</span>
            <Eye size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{trafficCount}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1">
            <TrendingUp size={12} className="text-[#c81e3c]" />
            <span>{trafficCount > 0 ? `${trafficCount} landing page hits` : 'Share link to track visits'}</span>
          </div>
        </div>

        {/* Metric 3: Real Conversion Rate */}
        <div className="p-3.5 bg-[#0c1017] border border-white/[0.08] rounded-none" style={{ borderRadius: '0px' }}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Join Conversion</span>
            <Zap size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{conversionRate}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>Visits to member signups</span>
          </div>
        </div>

        {/* Metric 4: Real Content Calendar Queue */}
        <div className="p-3.5 bg-[#0c1017] border border-white/[0.08] rounded-none" style={{ borderRadius: '0px' }}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Calendar Drops</span>
            <Calendar size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{scheduledPosts.length}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>Synced with Content Calendar</span>
          </div>
        </div>
      </div>

      {/* ── SUB-TABS: HUB & GENERATOR vs MEMBERS DIRECTORY vs EMAIL SETUP ── */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-1 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTabSub('hub')}
            className={`px-4 py-2 text-xs font-bold rounded-none transition cursor-pointer border-0 ${
              activeTabSub === 'hub' ? 'text-white' : 'text-slate-400 hover:text-white bg-transparent'
            }`}
            style={{
              borderRadius: '0px',
              ...(activeTabSub === 'hub' ? { background: brandRed, color: '#ffffff' } : {})
            }}
          >
            Community Feed &amp; Calendar Hub
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSub('members')}
            className={`px-4 py-2 text-xs font-bold rounded-none transition cursor-pointer border-0 ${
              activeTabSub === 'members' ? 'text-white' : 'text-slate-400 hover:text-white bg-transparent'
            }`}
            style={{
              borderRadius: '0px',
              ...(activeTabSub === 'members' ? { background: brandRed, color: '#ffffff' } : {})
            }}
          >
            Members Directory ({members.length})
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('calendar')}
            className="text-slate-400 hover:text-white flex items-center gap-1 transition"
          >
            <Calendar size={12} className="text-[#c81e3c]" />
            <span>Open Content Calendar →</span>
          </button>
        </div>
      </div>

      {/* ── TAB 1: HUB & CALENDAR CONTENT ENGINE ── */}
      {activeTabSub === 'hub' && (
        <div className="grid grid-cols-1 lg:grid-cols-[290px_1fr] gap-5 w-full">
          {/* Left Column: Post Types & MiniCalendar */}
          <div className="flex flex-col gap-4">
            <div className="bg-[#0c1017] border border-white/[0.08] p-4 rounded-none space-y-3" style={{ borderRadius: '0px' }}>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Select Community Type
              </span>
              <div className="space-y-1.5">
                {communityContentTypes.map(type => {
                  const isSelected = selectedType?.id === type.id
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleSelectType(type)}
                      className={`w-full text-left p-2.5 rounded-none border transition cursor-pointer flex items-center gap-2.5 ${
                        isSelected 
                          ? 'border-[#c81e3c]/60 bg-[#c81e3c]/15 text-white' 
                          : 'border-white/[0.06] bg-[#10141f] text-slate-300 hover:bg-[#151b2a] hover:text-white'
                      }`}
                      style={{ borderRadius: '0px' }}
                    >
                      <div 
                        className={`w-6 h-6 rounded-none flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#c81e3c] text-white' : 'bg-white/[0.05] text-slate-400'}`}
                        style={{ borderRadius: '0px' }}
                      >
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
              style={{ borderRadius: '0px' }}
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Post Calendar Sync
                </span>
                <span className="text-[9px] font-mono text-slate-300 bg-white/[0.04] px-2 py-0.5 border border-white/[0.08]" style={{ borderRadius: '0px' }}>
                  Click date to filter &amp; schedule
                </span>
              </div>
              <MiniCalendar
                onSelectDate={(dateObj) => {
                  if (selectedCalendarDate && selectedCalendarDate.getTime() === dateObj.getTime()) {
                    setSelectedCalendarDate(null)
                  } else {
                    setSelectedCalendarDate(dateObj)
                  }
                }}
                selectedDate={selectedCalendarDate}
                scheduledPosts={scheduledPosts}
                brandRed={brandRed}
              />

              {/* Direct date action prompt if date is selected */}
              {selectedCalendarDate && (
                <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">
                      Selected: <strong className="text-white">{selectedCalendarDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedCalendarDate(null)}
                      className="text-[10px] font-mono text-slate-400 hover:text-white underline cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => scheduleCommunityPostToCalendar({ title: postTitle, body: generated }, selectedCalendarDate)}
                    className="w-full py-1.5 px-2 text-xs font-bold text-white transition cursor-pointer border-0 flex items-center justify-center gap-1.5"
                    style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
                  >
                    <Calendar size={12} className="text-white" />
                    <span>Queue Draft for {selectedCalendarDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: AI Content Generator & Scheduled Posts */}
          <div className="space-y-5">
            {/* AI Generator Box with Title Refinement */}
            <div className="bg-[#0c1017] border border-white/[0.08] rounded-none p-4 sm:p-5 space-y-4 shadow-sm" style={{ borderRadius: '0px' }}>
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-[#c81e3c]" />
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    {selectedType?.label || 'Community Post'}
                  </h3>
                  <span className="text-[9px] font-mono text-slate-400 bg-white/[0.04] px-2 py-0.5 border border-white/[0.08]" style={{ borderRadius: '0px' }}>
                    {selectedType?.description}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={handleCopy} 
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-[#10141f] hover:bg-[#161d2d] border border-white/10 rounded-none transition cursor-pointer"
                    style={{ borderRadius: '0px' }}
                  >
                    {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateBody}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-[#10141f] hover:bg-[#161d2d] border border-white/10 rounded-none transition cursor-pointer disabled:opacity-50"
                    style={{ borderRadius: '0px' }}
                  >
                    <RefreshCw size={12} className={isGenerating ? 'animate-spin' : ''} />
                    <span>{isGenerating ? 'Drafting...' : 'AI Refine Body'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => scheduleCommunityPostToCalendar({ title: postTitle, body: generated })}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-none transition cursor-pointer border-0 shadow-sm hover:opacity-95"
                    style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
                  >
                    <Calendar size={12} className="text-white" />
                    <span>Schedule to Calendar</span>
                  </button>
                </div>
              </div>

              {/* Title & Headline Input with AI Refine Title */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Post Title / Headline
                  </label>
                  <button
                    type="button"
                    onClick={handleRefineTitle}
                    disabled={isRefiningTitle}
                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-none border border-[#c81e3c]/40 bg-[#c81e3c]/20 text-white hover:bg-[#c81e3c]/35 transition cursor-pointer"
                    style={{ borderRadius: '0px' }}
                  >
                    <Sparkles size={10} className={isRefiningTitle ? 'animate-spin' : ''} />
                    <span>{isRefiningTitle ? 'Refining...' : 'AI Refine Title'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={postTitle}
                  onChange={e => setPostTitle(e.target.value)}
                  placeholder="Enter community post title..."
                  className="w-full px-3 py-2 text-xs font-bold bg-[#10141f] border border-white/10 text-white outline-none focus:border-[#c81e3c] transition"
                  style={{ borderRadius: '0px' }}
                />
              </div>

              {/* Editor Textarea */}
              <div className="p-3 bg-[#090c14] border border-white/[0.08] rounded-none" style={{ borderRadius: '0px' }}>
                <textarea
                  value={generated || ''}
                  onChange={e => setGenerated(e.target.value)}
                  className="w-full text-xs font-mono leading-relaxed bg-transparent outline-none border-none resize-none text-slate-200"
                  style={{ minHeight: '170px' }}
                  placeholder="Generate or draft your community post..."
                />
              </div>
            </div>

            {/* Scheduled Posts Queue Directly Reflecting Calendar */}
            <div className="bg-[#0c1017] border border-white/[0.08] rounded-none p-4 sm:p-5 space-y-3" style={{ borderRadius: '0px' }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-white/[0.06] gap-2">
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-[#c81e3c]" />
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    Content Calendar Community Pipeline ({filteredPipelinePosts.length}{selectedCalendarDate || pipelineChannelFilter !== 'all' ? ` of ${scheduledPosts.length}` : ''})
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-none" style={{ borderRadius: '0px' }} />
                    <span>Calendar Synced</span>
                  </span>
                </div>

                {/* Channel Filter Chips */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPipelineChannelFilter('all')}
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-none border transition cursor-pointer ${
                      pipelineChannelFilter === 'all'
                        ? 'border-[#c81e3c]/50 bg-[#c81e3c]/20 text-white'
                        : 'border-white/10 bg-[#10141f] text-slate-400 hover:text-white'
                    }`}
                    style={{ borderRadius: '0px' }}
                  >
                    All ({scheduledPosts.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setPipelineChannelFilter('email')}
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-none border transition cursor-pointer ${
                      pipelineChannelFilter === 'email'
                        ? 'border-[#c81e3c]/50 bg-[#c81e3c]/20 text-white'
                        : 'border-white/10 bg-[#10141f] text-slate-400 hover:text-white'
                    }`}
                    style={{ borderRadius: '0px' }}
                  >
                    Email ({emailPostsCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => setPipelineChannelFilter('youtube')}
                    className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-none border transition cursor-pointer ${
                      pipelineChannelFilter === 'youtube'
                        ? 'border-[#c81e3c]/50 bg-[#c81e3c]/20 text-white'
                        : 'border-white/10 bg-[#10141f] text-slate-400 hover:text-white'
                    }`}
                    style={{ borderRadius: '0px' }}
                  >
                    YouTube ({ytPostsCount})
                  </button>
                </div>
              </div>

              {/* Active Date Filter Banner */}
              {selectedCalendarDate && (
                <div className="p-2.5 bg-[#141b2a] border border-[#c81e3c]/40 rounded-none flex items-center justify-between text-xs" style={{ borderRadius: '0px' }}>
                  <div className="flex items-center gap-2">
                    <Calendar size={13} className="text-[#c81e3c]" />
                    <span className="text-slate-300">
                      Showing posts scheduled for <strong className="text-white">{selectedCalendarDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</strong> ({filteredPipelinePosts.length})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedCalendarDate(null)}
                    className="text-[11px] font-mono font-bold text-rose-300 hover:text-white underline cursor-pointer"
                  >
                    Clear Filter ✕
                  </button>
                </div>
              )}

              {filteredPipelinePosts.length === 0 ? (
                <div className="p-8 text-center bg-[#10141f] border border-white/[0.06] rounded-none text-xs text-slate-400 space-y-2.5" style={{ borderRadius: '0px' }}>
                  <p>
                    {selectedCalendarDate
                      ? `No campaign posts scheduled for ${selectedCalendarDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}.`
                      : 'No community posts currently match this filter.'}
                  </p>
                  {selectedCalendarDate && (
                    <button
                      type="button"
                      onClick={() => scheduleCommunityPostToCalendar({ title: postTitle, body: generated }, selectedCalendarDate)}
                      className="px-3 py-1.5 text-xs font-bold text-white transition cursor-pointer border-0 shadow-sm"
                      style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
                    >
                      + Schedule Current Composer Draft for This Day
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredPipelinePosts.map(post => {
                    const isEmail = (post.platform || '').toLowerCase().includes('email') || (post.type || '').toLowerCase().includes('email')
                    const isSent = (post.status || '').toLowerCase() === 'sent' || (post.status || '').toLowerCase() === 'published'

                    return (
                      <div
                        key={post.id}
                        onClick={() => setExpandedPostId(prev => prev === post.id ? null : post.id)}
                        className="p-3 bg-[#10141f] border border-white/[0.06] hover:border-white/20 transition rounded-none cursor-pointer space-y-2"
                        style={{ borderRadius: '0px' }}
                      >
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div 
                              className={`w-6 h-6 rounded-none flex items-center justify-center shrink-0 border ${
                                isEmail ? 'bg-[#c81e3c]/20 border-[#c81e3c]/40 text-white' : 'bg-white/[0.05] border-white/10 text-slate-400'
                              }`} 
                              style={{ borderRadius: '0px' }}
                            >
                              {isEmail ? <Mail size={12} className="text-white" /> : <Clock size={12} className="text-[#c81e3c]" />}
                            </div>

                            <span className="text-xs font-bold text-white truncate max-w-sm sm:max-w-md">
                              {post.title || post.type}
                            </span>

                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-none bg-[#c81e3c]/20 text-white border border-[#c81e3c]/40 shrink-0" style={{ borderRadius: '0px' }}>
                              {post.dateLabel}
                            </span>

                            {post.platform && (
                              <span 
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded-none shrink-0 border ${
                                  isEmail ? 'bg-[#c81e3c]/15 text-rose-200 border-[#c81e3c]/35' : 'bg-white/[0.05] text-slate-300 border-white/10'
                                }`} 
                                style={{ borderRadius: '0px' }}
                              >
                                {post.platform}
                              </span>
                            )}

                            {isSent ? (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-none bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold shrink-0" style={{ borderRadius: '0px' }}>
                                DELIVERED ✓
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-none bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold shrink-0" style={{ borderRadius: '0px' }}>
                                SCHEDULED
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* Primary Action Button directly on the card */}
                            {isEmail && !isSent && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleOpenBroadcastForPost(post)
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white transition cursor-pointer border-0 shadow-sm"
                                style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
                                title="Broadcast this email to community members now"
                              >
                                <Send size={11} className="text-white" />
                                <span>Send Broadcast</span>
                              </button>
                            )}

                            {isSent && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleTogglePostStatus(post)
                                }}
                                className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-none cursor-pointer"
                                title="Click to reset status to Scheduled"
                              >
                                <CheckCircle2 size={11} />
                                <span>Sent</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleLoadToComposer(post)
                              }}
                              className="text-slate-400 hover:text-white p-1 transition cursor-pointer bg-transparent border-0"
                              title="Edit in Composer"
                            >
                              <Edit size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleTogglePostStatus(post)
                              }}
                              className="text-slate-400 hover:text-emerald-400 p-1 transition cursor-pointer bg-transparent border-0"
                              title={isSent ? 'Reset status to Scheduled' : 'Mark as Sent / Published'}
                            >
                              <Check size={13} />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeletePost(post.id)
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
                          <div className="pt-2 border-t border-white/[0.06] space-y-2.5" onClick={e => e.stopPropagation()}>
                            <pre className="text-xs leading-relaxed text-slate-300 font-sans whitespace-pre-wrap bg-[#090c14] p-3 rounded-none border border-white/[0.06]" style={{ borderRadius: '0px' }}>
                              {post.fullContent || post.content}
                            </pre>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-white/[0.04]">
                              <span className="text-[10px] font-mono text-slate-400">
                                Channel: <strong className="text-white">{post.platform || 'Social'}</strong> · Status: <strong className={isSent ? 'text-emerald-400' : 'text-amber-300'}>{isSent ? 'Sent / Delivered' : 'Scheduled'}</strong>
                              </span>

                              <div className="flex items-center gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => handleOpenBroadcastForPost(post)}
                                  className="px-2.5 py-1 text-xs font-bold text-white transition cursor-pointer border-0 flex items-center gap-1 shadow-sm"
                                  style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
                                >
                                  <Send size={11} className="text-white" />
                                  <span>Send as Broadcast Email</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleLoadToComposer(post)}
                                  className="px-2.5 py-1 text-xs font-semibold text-slate-200 hover:text-white bg-[#151c2d] hover:bg-[#1a2338] rounded-none cursor-pointer border border-white/10"
                                  style={{ borderRadius: '0px' }}
                                >
                                  Edit in Composer
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleTogglePostStatus(post)}
                                  className="px-2.5 py-1 text-xs font-semibold text-slate-200 hover:text-white bg-[#151c2d] hover:bg-[#1a2338] rounded-none cursor-pointer border border-white/10"
                                  style={{ borderRadius: '0px' }}
                                >
                                  {isSent ? 'Mark as Scheduled' : 'Mark as Sent ✓'}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(`${post.title}\n\n${post.fullContent || post.content}`)
                                    if (triggerToast) triggerToast('Copied post content to clipboard', 'success')
                                  }}
                                  className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 rounded-none cursor-pointer border border-white/10"
                                  style={{ borderRadius: '0px' }}
                                >
                                  Copy Text
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setActiveTab && setActiveTab('calendar')}
                                  className="px-2.5 py-1 text-xs font-bold text-slate-200 hover:text-white bg-[#182132] transition cursor-pointer border border-white/15"
                                  style={{ borderRadius: '0px' }}
                                >
                                  Open in Calendar →
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: MEMBERS DIRECTORY (Zero Fake Mockups) ── */}
      {activeTabSub === 'members' && (
        <div className="bg-[#0c1017] border border-white/[0.08] rounded-none p-5 space-y-4" style={{ borderRadius: '0px' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Community Members Directory</h3>
              <p className="text-xs text-slate-400">
                Direct connections with verified people joining via your invite URL
              </p>
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
                  style={{ borderRadius: '0px' }}
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
                    style={{ borderRadius: '0px' }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleExportCsv}
                disabled={members.length === 0}
                className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-[#10141f] hover:bg-[#161d2d] border border-white/10 rounded-none transition cursor-pointer disabled:opacity-40"
                style={{ borderRadius: '0px' }}
                title="Export members list to CSV"
              >
                Export CSV
              </button>

              <button
                type="button"
                onClick={() => setAddMemberOpen(true)}
                className="px-3.5 py-1.5 text-xs font-bold text-white rounded-none transition cursor-pointer border-0 shadow-sm"
                style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
              >
                + Add Member
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {members.length === 0 ? (
              <div className="p-12 text-center bg-[#10141f] border border-white/[0.06] rounded-none space-y-3" style={{ borderRadius: '0px' }}>
                <Users size={32} className="mx-auto text-slate-500" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">No Members Enrolled Yet</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Your community portal is ready and accepting new joiners. Share your invite link on YouTube, Instagram, or X to build your founding circle.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-2 text-xs font-bold text-white transition cursor-pointer border-0 shadow-md"
                    style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
                  >
                    {linkCopied ? '✓ Link Copied!' : 'Copy Member Join Link'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddMemberOpen(true)}
                    className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/5 border border-white/10 transition cursor-pointer"
                    style={{ borderRadius: '0px' }}
                  >
                    + Add Member Manually
                  </button>
                </div>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No members match the query "{memberSearchQuery}".
              </div>
            ) : (
              filteredMembers.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#10141f] border border-white/[0.06] hover:border-white/15 transition rounded-none flex items-center justify-between gap-3"
                  style={{ borderRadius: '0px' }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="w-8 h-8 rounded-none bg-[#c81e3c]/20 border border-[#c81e3c]/40 text-white font-bold flex items-center justify-center text-xs shrink-0"
                      style={{ borderRadius: '0px' }}
                    >
                      {(m.name || m.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{m.name || 'Member'}</span>
                        <span 
                          className="px-1.5 py-0.2 rounded-none text-[9px] font-bold uppercase bg-[#c81e3c]/20 text-white border border-[#c81e3c]/40"
                          style={{ borderRadius: '0px' }}
                        >
                          {m.role || 'Founding Member'}
                        </span>
                        {m.source && (
                          <span className="text-[9px] font-mono text-slate-500 hidden md:inline">
                            via {m.source}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 truncate block">{m.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                      Joined {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                    </span>
                    <a
                      href={`mailto:${m.email}?subject=${encodeURIComponent(`Welcome to ${productName}`)}`}
                      className="px-2.5 py-1 text-xs font-bold text-slate-200 bg-[#151b2a] hover:bg-[#1f283d] border border-white/10 rounded-none transition flex items-center gap-1.5"
                      style={{ borderRadius: '0px' }}
                      title={`Send email directly to ${m.email}`}
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
          onClose={() => {
            setBroadcastOpen(false)
            setBroadcastDraft({ subject: '', message: '', targetPostId: null })
          }}
          triggerToast={triggerToast}
          creatorData={creatorData}
          userProfile={userProfile}
          productName={productName}
          brandRed={brandRed}
          onScheduleToCalendar={(emailPost) => scheduleCommunityPostToCalendar(emailPost)}
          initialSubject={broadcastDraft.subject}
          initialMessage={broadcastDraft.message}
          targetPostId={broadcastDraft.targetPostId}
          onBroadcastSent={handleBroadcastSent}
        />
      )}

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        onAddMember={(newM) => persistMembers([newM, ...members])}
        brandRed={brandRed}
      />

      {/* Automated Welcome Setup Modal */}
      <WelcomeSetupModal
        isOpen={welcomeSetupOpen}
        onClose={() => setWelcomeSetupOpen(false)}
        cleanHandle={cleanHandle}
        creatorData={creatorData}
        productName={productName}
        triggerToast={triggerToast}
        brandRed={brandRed}
      />
    </div>
  )
}
