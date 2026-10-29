import { useState, useRef, useEffect, useCallback } from 'react'
import { useForge } from '../../App'
import { Sparkles, Send, X, ChevronDown, Copy, Check, Calendar, FileText, Minus, Trash2, Clock } from 'lucide-react'
import { hasTextKey, askForgeChat } from '../../services/ai'

const SUGGESTED_PROMPTS = [
  'What should I post today?',
  'Write my launch posts for this week',
  'Give me 10 promo hooks',
  'Write a welcome post for my community',
  'Turn this into an email',
  'What should I prioritize this week?',
  'Give me a 7-day launch sequence',
  'Rewrite this for TikTok',
  'How should I position this offer?',
  'Create posts for Instagram, X, and LinkedIn',
]

const FORGE_RESPONSES = {
  'What should I post today?': `Here's what I'd do today:

**Priority 1 - Launch teaser (Instagram Reel, 30s)**
Your audience hasn't seen a direct CTA in 6 days. A quick "something big is coming" clip will prime the algorithm and warm your list.

**Priority 2 - Behind-the-scenes (Stories)**
3-5 slides showing what you're building. Low effort, high trust.

**Priority 3 - Twitter thread**
"5 things I wish I knew before building a creator business" - this angle performs well for your niche. Ends with a soft CTA to your product.

Want me to write any of these?`,

  'Give me 10 promo hooks': `Here are 10 hooks for your launch:

1. "I spent 2 years figuring this out so you don't have to."
2. "Most creators are doing this backwards."
3. "What if you could build a business around what you already know?"
4. "I finally built the thing I kept wishing existed."
5. "Your audience is already ready to pay you - here's how to ask."
6. "This took me from 0 to $8K/month in 60 days."
7. "Stop posting more. Start building once."
8. "I'm opening [Product] to 100 people this week only."
9. "The creator math that actually makes sense."
10. "Posting content is the job. This is the business."

Want me to turn any of these into a full post?`,

  'Give me a 7-day launch sequence': `Here's your 7-day launch sequence:

**Day 1 - Tease**
Post a cryptic "something's coming" story/reel. Link drops Friday.

**Day 2 - Problem**
Share the problem your audience faces that your product solves. No CTA yet.

**Day 3 - Behind the scenes**
Show a sneak peek. Behind-the-scenes video works best here.

**Day 4 - Social proof**
Share a testimonial or early result. If you don't have one yet, share your own story.

**Day 5 - Launch day**
Drop the product. 4 posts minimum - Stories, feed, email, community.

**Day 6 - Objection handling**
"FAQ: everything you asked about [Product]."

**Day 7 - Final push**
"Last chance" or "24 hours left for founding member pricing."

Want me to write the copy for each day?`,

  'default': `I'm on it. Give me a moment to craft this for your audience and product...

Here's what I'd suggest based on your niche and platform mix:

Your audience responds best to authentic, behind-the-scenes content paired with clear value propositions. For this prompt, I'd lean into your unique angle as someone who's been through the exact transformation your audience wants.

Would you like me to:
- Write a full draft?
- Give you multiple variations?
- Adapt this for a specific platform?`,
}

function formatChatTime(timestamp) {
  if (!timestamp) return ''
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return ''
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    const isYesterday = date.toDateString() === yesterday.toDateString()
    
    const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    if (isToday) return timeStr
    if (isYesterday) return `Yesterday ${timeStr}`
    const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    return `${dateStr}, ${timeStr}`
  } catch {
    return ''
  }
}

function Message({ msg, onActionClick }) {
  const [copied, setCopied] = useState(false)
  const isForge = msg.role === 'forge' || msg.role === 'coach'

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content || msg.text || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Render markdown-ish bold
  const renderContent = (text) => {
    if (!text) return null
    return text.split('\n').map((line, i) => {
      const boldified = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return (
        <p key={i}
          className="leading-relaxed"
          style={{ marginBottom: line === '' ? '8px' : '2px', fontSize: '13px', color: isForge ? 'rgba(255,255,255,0.85)' : '#0c0c0c' }}
          dangerouslySetInnerHTML={{ __html: boldified }}
        />
      )
    })
  }

  const timeLabel = formatChatTime(msg.timestamp || msg.created_at)

  return (
    <div className={`flex gap-3 ${isForge ? '' : 'flex-row-reverse'}`}>
      {isForge && (
        <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
          <Sparkles size={11} className="text-black" />
        </div>
      )}
      <div className={`flex-1 max-w-[85%] ${isForge ? '' : 'flex flex-col items-end'}`}>
        <div
          className="rounded-2xl px-4 py-3 group relative shadow-md transition-all"
          style={{
            background: isForge ? '#1a1a1a' : 'white',
            borderRadius: isForge ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
            border: isForge ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.1)'
          }}
        >
          <div>{renderContent(msg.content || msg.text)}</div>

          {/* Footer bar for Forge messages with Timestamp & Copy */}
          {isForge && (
            <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-white/[0.06]">
              {timeLabel ? (
                <span className="text-[10px] text-white/35 font-mono flex items-center gap-1">
                  <Clock size={10} className="opacity-60" />
                  {timeLabel}
                </span>
              ) : <span />}
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-white/50 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] transition-colors cursor-pointer"
              >
                {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>

        {/* User timestamp indicator */}
        {!isForge && timeLabel && (
          <div className="flex items-center justify-end mt-1 px-1">
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <Clock size={10} className="opacity-50" />
              {timeLabel}
            </span>
          </div>
        )}

        {/* Action buttons for forge messages */}
        {isForge && msg.actions && (
          <div className="flex gap-2 mt-2 flex-wrap">
            {msg.actions.map(action => (
              <button
                key={action}
                onClick={() => onActionClick && onActionClick(action)}
                className="text-[11px] px-2.5 py-1 rounded-full transition-all duration-150 cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.09)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
              >
                {action}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
        <Sparkles size={11} className="text-black" />
      </div>
      <div className="rounded-2xl px-4 py-3 flex items-center gap-1.5" style={{ background: '#1a1a1a', borderRadius: '4px 18px 18px 18px' }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: 'rgba(255,255,255,0.4)', animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function ForgeChat({ isOpen, onClose }) {
  const { creatorData, incrementAiActions, userProfile, syncSessionToDb } = useForge()
  const cleanHandle = (creatorData?.handle || 'default').replace(/^@/, '').toLowerCase()
  const storageKey = `forge_${cleanHandle}_chat_messages`

  const getInitialMessages = useCallback(() => {
    try {
      const cached = localStorage.getItem(storageKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {
      console.warn('[ForgeChat] Failed to parse initial cache:', e)
    }
    return [
      {
        role: 'forge',
        content: `Hey ${creatorData?.handle || '@creator'} - I'm Forge.\n\nI'm here to help you run your creator business. Ask me anything: what to post, how to launch, what to write, what to prioritize.\n\nWhat do you need?`,
        actions: ['Write my launch posts', 'What to post today?', 'Give me hooks'],
        timestamp: Date.now(),
      },
    ]
  }, [storageKey, creatorData?.handle])

  const [messages, setMessages] = useState(getInitialMessages)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const endRef = useRef(null)

  // Reload cache whenever creator handle changes
  useEffect(() => {
    setMessages(getInitialMessages())
  }, [cleanHandle, getInitialMessages])

  // Fetch persisted history from backend database on mount or creator handle change
  useEffect(() => {
    let isMounted = true
    if (!cleanHandle || cleanHandle === 'default') return

    async function loadRemoteHistory() {
      try {
        const u = userProfile?.username || ''
        const res = await fetch(`/api/chat/messages?handle=${encodeURIComponent(cleanHandle)}&username=${encodeURIComponent(u)}`)
        if (!res.ok) return
        const data = await res.json()
        if (isMounted && data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(prev => {
            const seen = new Set()
            const merged = []
            
            // Prioritize remote messages from database
            data.messages.forEach(m => {
              const content = (m.content || m.text || '').trim()
              const k = `${m.role}:${content}`
              if (!seen.has(k) && content) {
                seen.add(k)
                merged.push({
                  role: m.role === 'coach' ? 'forge' : m.role,
                  content: content,
                  actions: m.actions || null,
                  timestamp: m.timestamp || (m.created_at ? new Date(m.created_at).getTime() : Date.now()),
                  created_at: m.created_at,
                })
              }
            })

            // Keep any locally created messages that haven't hit DB yet
            prev.forEach(m => {
              const content = (m.content || m.text || '').trim()
              const k = `${m.role}:${content}`
              if (!seen.has(k) && content) {
                seen.add(k)
                merged.push(m)
              }
            })

            merged.sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0))
            try {
              localStorage.setItem(storageKey, JSON.stringify(merged))
            } catch {}
            return merged
          })
        }
      } catch (err) {
        console.warn('[ForgeChat] Could not load remote chat history:', err)
      }
    }

    loadRemoteHistory()
    return () => { isMounted = false }
  }, [cleanHandle, userProfile?.username, storageKey])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const saveMessageToDb = useCallback(async (msgObj) => {
    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: cleanHandle,
          username: userProfile?.username || null,
          role: msgObj.role,
          content: msgObj.content,
          actions: msgObj.actions || null,
          timestamp: msgObj.timestamp || Date.now(),
        })
      })
    } catch (err) {
      console.warn('[ForgeChat] Background message save error:', err)
    }
  }, [cleanHandle, userProfile?.username])

  const handleClearChat = () => {
    if (window.confirm('Clear all conversation messages?')) {
      const resetMsg = [
        {
          role: 'forge',
          content: `Chat history cleared. Hey ${creatorData?.handle || '@creator'}, how can I help you right now?`,
          actions: ['Write my launch posts', 'What to post today?', 'Give me hooks'],
          timestamp: Date.now(),
        }
      ]
      setMessages(resetMsg)
      try {
        localStorage.setItem(storageKey, JSON.stringify(resetMsg))
      } catch {}
      // Sync cleared state
      fetch('/api/chat/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle: cleanHandle,
          username: userProfile?.username || null,
          messages: resetMsg,
        })
      }).catch(() => {})
      if (syncSessionToDb) syncSessionToDb()
    }
  }

  const sendMessage = async (text) => {
    const msg = text || input.trim()
    if (!msg) return
    setInput('')
    if (incrementAiActions) incrementAiActions()
    
    const userTimestamp = Date.now()
    const userMessage = { role: 'user', content: msg, timestamp: userTimestamp }
    const currentMessages = [...messages, userMessage]
    
    setMessages(currentMessages)
    try {
      localStorage.setItem(storageKey, JSON.stringify(currentMessages))
    } catch {}
    
    // Asynchronously persist user message to backend DB
    saveMessageToDb(userMessage)

    setIsTyping(true)

    try {
      const response = await askForgeChat(msg, messages, creatorData)
      setIsTyping(false)
      const forgeTimestamp = Date.now()
      const forgeMessage = {
        role: 'forge',
        content: response,
        actions: ['Write full draft', 'Save to calendar', 'Adapt for all platforms'],
        timestamp: forgeTimestamp,
      }
      setMessages(prev => {
        const next = [...prev, forgeMessage]
        try {
          localStorage.setItem(storageKey, JSON.stringify(next))
        } catch {}
        return next
      })

      // Asynchronously persist AI response to backend DB
      saveMessageToDb(forgeMessage)
      if (syncSessionToDb) syncSessionToDb()

    } catch (err) {
      console.error('[Forge] Chat AI error:', err)
      setIsTyping(false)
      const fallback = FORGE_RESPONSES[msg] || FORGE_RESPONSES['default']
      const fallbackMsg = {
        role: 'forge',
        content: `*(Note: Live AI failed, using fallback)*\n\n${fallback}`,
        actions: ['Write full draft', 'Save to calendar', 'Adapt for all platforms'],
        timestamp: Date.now(),
      }
      setMessages(prev => {
        const next = [...prev, fallbackMsg]
        try {
          localStorage.setItem(storageKey, JSON.stringify(next))
        } catch {}
        return next
      })
      saveMessageToDb(fallbackMsg)
      if (syncSessionToDb) syncSessionToDb()
    }
  }

  if (!isOpen) return null

  if (isMinimized) {
    return (
      <div
        className="fixed bottom-6 right-6 flex flex-col border shadow-2xl z-50 overflow-hidden cursor-pointer group hover:-translate-y-1 transition-transform"
        style={{
          width: '240px',
          borderColor: 'rgba(255,255,255,0.1)',
          background: '#0c0c0c',
          borderRadius: '12px',
        }}
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-[rgba(255,255,255,0.02)] group-hover:bg-[rgba(255,255,255,0.04)] transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center bg-white">
              <Sparkles size={10} className="text-black" />
            </div>
            <span className="text-[13px] font-semibold text-white">Forge Chat</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClose() }}
            className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
          >
            <X size={12} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
      />

      <div
        className="fixed inset-y-0 right-0 z-50 md:static flex flex-col border-l shadow-2xl md:shadow-none w-full max-w-[340px] sm:max-w-[380px] md:w-[360px] animate-fade-in"
        style={{
          borderColor: 'rgba(255,255,255,0.07)',
          background: '#0c0c0c',
          flexShrink: 0,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.07)' }}
        >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center">
            <Sparkles size={11} className="text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-semibold text-white">Forge</span>
              <span
                className="text-[10px] px-2 py-0.2 rounded-full font-medium"
                style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8' }}
              >
                Synced to Cloud
              </span>
            </div>
            <p className="text-[10px] text-white/40">Persistent AI partner</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleClearChat}
            title="Clear conversation history"
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 text-white/30 hover:text-red-400 hover:bg-white/5 cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => setIsMinimized(true)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
          >
            <Minus size={14} />
          </button>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer"
            style={{ color: 'rgba(255,255,255,0.3)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} onActionClick={setInput} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={endRef} />
      </div>

      {/* Suggested prompts */}
      <div
        className="px-4 py-2 border-t overflow-x-auto no-scrollbar"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex gap-2 pb-1">
          {SUGGESTED_PROMPTS.slice(0, 5).map(p => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="flex-shrink-0 text-[11px] px-3 py-1.5 rounded-full transition-all duration-150 whitespace-nowrap cursor-pointer"
              style={{
                background: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.55)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div
        className="px-4 pb-4 flex-shrink-0"
        style={{ paddingTop: '8px' }}
      >
        <div
          className="flex items-end gap-2 rounded-2xl border px-4 py-3 transition-all duration-200 focus-within:border-white/20"
          style={{ background: '#151515', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <textarea
            className="forge-input flex-1 text-[13px] resize-none"
            style={{ minHeight: '20px', maxHeight: '100px', lineHeight: '1.5', background: 'transparent', color: 'white' }}
            placeholder="Ask Forge anything..."
            value={input}
            onChange={e => {
              setInput(e.target.value)
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            rows={1}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-150 disabled:opacity-30 cursor-pointer"
            style={{ background: input.trim() ? 'white' : 'rgba(255,255,255,0.1)' }}
          >
            <Send size={12} className={input.trim() ? 'text-black' : 'text-white/40'} />
          </button>
        </div>
      </div>
    </div>
  </>
)
}
