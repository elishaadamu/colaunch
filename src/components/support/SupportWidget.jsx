import { useState, useEffect, useRef } from 'react'
import { 
  Headphones, X, Send, User, Bot, ShieldAlert, Sparkles, 
  Mail, CheckCheck, Loader2, MessageSquare, AlertCircle, Edit2, Check, RotateCcw
} from 'lucide-react'
import { useForge, getAccent } from '../../App'
import { 
  fetchSupportHistory, 
  sendSupportMessage, 
  escalateSupportTicket, 
  getCreatorId,
  getSupportUserIdentity,
  setSupportUserIdentity,
  clearAllSupportChats
} from '../../services/supportService'

export default function SupportWidget({ currentStage }) {
  const { creatorData } = useForge()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [escalating, setEscalating] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef(null)

  // Creator Identity (Name & Email requirement)
  const [userIdentity, setUserIdentity] = useState(() => getSupportUserIdentity(creatorData))
  const [isEditingIdentity, setIsEditingIdentity] = useState(false)
  const [nameInput, setNameInput] = useState(userIdentity.name || '')
  const [emailInput, setEmailInput] = useState(userIdentity.email || '')

  const accent = getAccent(creatorData)
  const rawHandle = creatorData?.handle || creatorData?.name || 'creator'
  const cleanHandle = rawHandle.replace(/^@+/, '')
  const handle = cleanHandle ? `@${cleanHandle}` : '@creator'
  const creatorId = getCreatorId(creatorData)

  const hasIdentity = Boolean(userIdentity.name && userIdentity.email && userIdentity.email.includes('@'))

  const mergeMessages = (prevMsgs, incomingMsgs) => {
    if (!Array.isArray(incomingMsgs)) return prevMsgs
    if (!Array.isArray(prevMsgs) || prevMsgs.length === 0) return incomingMsgs

    const incomingIds = new Set(incomingMsgs.map(m => m.id).filter(Boolean))
    const merged = [...incomingMsgs]

    for (const p of prevMsgs) {
      if (!p) continue
      if (p.id && incomingIds.has(p.id)) continue
      const isDuplicate = incomingMsgs.some(inc => 
        inc.sender === p.sender && 
        inc.message && p.message && 
        inc.message.trim() === p.message.trim()
      )
      if (!isDuplicate) {
        merged.push(p)
      }
    }

    merged.sort((a, b) => {
      const ta = a.created_at ? new Date(a.created_at).getTime() : 0
      const tb = b.created_at ? new Date(b.created_at).getTime() : 0
      return ta - tb
    })

    return merged
  }

  // Load and poll chat history
  useEffect(() => {
    let active = true
    const loadHistory = () => {
      fetchSupportHistory(creatorData).then(msgs => {
        if (active && msgs) {
          setMessages(prev => mergeMessages(prev, msgs))
        }
      })
    }
    loadHistory()
    const pollTimer = setInterval(loadHistory, 3500)
    return () => { 
      active = false 
      clearInterval(pollTimer)
    }
  }, [creatorId, creatorData?.handle])

  // Sync identity changes if creatorData updates
  useEffect(() => {
    const existing = getSupportUserIdentity(creatorData)
    if (existing.name && existing.email) {
      setUserIdentity(existing)
      setNameInput(existing.name)
      setEmailInput(existing.email)
    }
  }, [creatorData])

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setUnreadCount(0)
    }
  }, [messages, isOpen])

  const handleSaveIdentity = (e) => {
    if (e) e.preventDefault()
    const trimmedName = nameInput.trim()
    const trimmedEmail = emailInput.trim()
    if (!trimmedName || !trimmedEmail || !trimmedEmail.includes('@')) return

    setSupportUserIdentity(trimmedName, trimmedEmail, creatorData)
    setUserIdentity({ name: trimmedName, email: trimmedEmail })
    setIsEditingIdentity(false)
  }

  const handleSend = async (e) => {
    if (e) e.preventDefault()
    const text = inputText.trim()
    if (!text || loading) return

    if (!hasIdentity) {
      setIsEditingIdentity(true)
      return
    }

    setInputText('')
    setLoading(true)

    // Optimistic user message
    const tempId = 'temp_' + Date.now()
    const optimisticMsg = {
      id: tempId,
      session_id: creatorData ? getSupportSessionId(creatorData) : '',
      creator_id: creatorId,
      creator_handle: handle,
      creator_name: userIdentity.name || 'Creator',
      sender: 'user',
      message: text,
      status: 'active',
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, optimisticMsg])

    try {
      const res = await sendSupportMessage(text, creatorData, currentStage, false, userIdentity)
      if (res && res.messages) {
        setMessages(prev => mergeMessages(prev, res.messages))
      }
    } catch (err) {
      console.error('[SupportWidget] Send failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickPrompt = (promptText) => {
    if (!hasIdentity) {
      setIsEditingIdentity(true)
      return
    }
    setInputText(promptText)
  }

  const handleEscalateToAdmin = async () => {
    if (escalating) return
    if (!hasIdentity) {
      setIsEditingIdentity(true)
      return
    }
    setEscalating(true)
    try {
      const res = await escalateSupportTicket(
        creatorData, 
        `Creator ${handle} (${userIdentity.name}) requested Human Operations support from Onboarding stage: ${currentStage}`,
        currentStage,
        userIdentity
      )
      if (res && res.messages) {
        setMessages(prev => mergeMessages(prev, res.messages))
      } else {
        const refreshed = await fetchSupportHistory(creatorData)
        setMessages(prev => mergeMessages(prev, refreshed))
      }
    } catch (err) {
      console.error('[SupportWidget] Escalation error:', err)
    } finally {
      setEscalating(false)
    }
  }

  const quickChips = [
    `How does the revenue split work for ${handle}?`,
    `Can I change my blueprint features later?`,
    `How do video releases & YouTube sync work?`,
    `Talk to human admin`,
  ]

  const handleResetChat = async () => {
    if (!window.confirm("Start over with a clean chat? This clears all support messages.")) return
    setClearing(true)
    try {
      await clearAllSupportChats(creatorData)
      setMessages([])
    } finally {
      setClearing(false)
    }
  }

  // Strictly filter messages so only this creator's conversation is shown
  const displayedMessages = messages.filter(m => {
    if (!m) return false
    if (creatorId && m.creator_id && m.creator_id !== creatorId) return false
    if (cleanHandle && m.creator_handle) {
      const mHandle = m.creator_handle.replace(/^@+/, '').toLowerCase()
      if (mHandle && mHandle !== cleanHandle.toLowerCase() && m.creator_id !== creatorId) {
        return false
      }
    }
    return true
  })

  const hasEscalation = displayedMessages.some(m => m.escalated || m.status === 'escalated_to_admin')
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://colaunch-web.vercel.app'
  const creatorDashboardUrl = `${baseUrl}/dashboard/${creatorId}`

  return (
    <>
      {/* Floating Right Support Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-none bg-[#121722] hover:bg-[#1a2233] text-white border border-[#2b354c] shadow-2xl transition-all duration-200 cursor-pointer"
          style={{
            borderColor: isOpen ? accent.color : 'rgba(255,255,255,0.12)',
            boxShadow: isOpen ? `0 0 25px -5px ${accent.color}40` : '0 10px 30px rgba(0,0,0,0.6)'
          }}
          aria-label="Toggle Customer Support"
        >
          <div 
            className="w-7 h-7 rounded-none flex items-center justify-center"
            style={{ background: `rgba(${accent.rgb}, 0.15)`, color: accent.color }}
          >
            <Headphones className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              Support
              <span className="w-1.5 h-1.5 rounded-none" style={{ background: accent.color }} />
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              AI & Admin Desk
            </span>
          </div>
          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-none bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ml-1">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Slide-over Right Chat Panel */}
      {isOpen && (
        <div 
          className="fixed bottom-20 right-6 z-50 w-[92vw] sm:w-[420px] max-h-[80vh] h-[640px] flex flex-col rounded-none bg-[#0c1017] border border-[#232b3e] shadow-2xl overflow-hidden animate-fadeIn"
          style={{ boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85)' }}
        >
          {/* Header */}
          <div className="p-4 border-b border-[#1c2333] bg-[#101520] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-none flex items-center justify-center border shadow-inner"
                style={{
                  background: `rgba(${accent.rgb}, 0.12)`,
                  borderColor: `rgba(${accent.rgb}, 0.3)`,
                  color: accent.color
                }}
              >
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">CoLaunch Support</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-none bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    24/7 AI Desk
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono truncate max-w-[240px]">
                  Grounded in {handle} · {currentStage}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                disabled={clearing}
                className="p-1.5 rounded-none text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                title="Clear all chat messages & start over"
              >
                {clearing ? <Loader2 className="w-4 h-4 animate-spin text-rose-400" /> : <RotateCcw className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-none text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Banner */}
          <div className="px-4 py-2 bg-[#131926] border-b border-[#1f273b] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300 truncate max-w-[230px]">
              {hasIdentity ? (
                <>
                  <User className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span className="truncate">
                    <strong className="text-white">{userIdentity.name}</strong> ({userIdentity.email})
                  </span>
                  <button 
                    onClick={() => setIsEditingIdentity(true)} 
                    className="text-slate-400 hover:text-white ml-0.5 p-1 rounded-none hover:bg-white/10"
                    title="Change Name & Email"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5" style={{ color: accent.color }} />
                  <span>Grounded in {handle}</span>
                </>
              )}
            </div>
            {hasEscalation ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-none flex-shrink-0">
                <ShieldAlert className="w-3 h-3" />
                Team Notified
              </span>
            ) : (
              <button
                onClick={handleEscalateToAdmin}
                disabled={escalating}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-none border border-white/10 transition cursor-pointer flex-shrink-0"
                title="Send ticket to our dedicated operations team"
              >
                {escalating ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Mail className="w-2.5 h-2.5" />}
                Escalate
              </button>
            )}
          </div>

          {/* Messages Flow */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#0a0d14]">
            {(!hasIdentity && messages.length === 0) || isEditingIdentity ? (
              <div className="h-full flex flex-col justify-center p-2">
                <div className="p-5 rounded-none bg-[#111724] border border-[#232f45] text-left space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-none flex items-center justify-center border flex-shrink-0"
                      style={{
                        background: `rgba(${accent.rgb}, 0.15)`,
                        borderColor: `rgba(${accent.rgb}, 0.3)`,
                        color: accent.color
                      }}
                    >
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Introduce Yourself</h4>
                      <p className="text-[11px] text-slate-400">
                        Please provide your name & email to begin chatting with AI & support.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveIdentity} className="space-y-3 pt-1">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        placeholder="e.g. Alex Fox"
                        className="w-full bg-[#090c13] border border-[#232c3f] rounded-none px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Your Email Address</label>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        placeholder="e.g. alex@example.com"
                        className="w-full bg-[#090c13] border border-[#232c3f] rounded-none px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-[10px] text-slate-500 block mt-1">
                        Used for 2-way email support escalation & dashboard sync.
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {isEditingIdentity && hasIdentity && (
                        <button
                          type="button"
                          onClick={() => setIsEditingIdentity(false)}
                          className="flex-1 py-2.5 rounded-none text-xs font-semibold text-slate-400 bg-white/5 hover:bg-white/10 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={!nameInput.trim() || !emailInput.trim() || !emailInput.includes('@')}
                        className="flex-1 py-2.5 rounded-none font-bold text-xs text-white transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
                        style={{ background: accent.color }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Save & Start Chat</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : displayedMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div 
                  className="w-12 h-12 rounded-none flex items-center justify-center mb-3 border shadow-sm"
                  style={{
                    background: `rgba(${accent.rgb}, 0.1)`,
                    borderColor: `rgba(${accent.rgb}, 0.25)`,
                    color: accent.color
                  }}
                >
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  How can we help, {userIdentity.name || handle}?
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mb-4">
                  Ask anything about your custom platform, audience monetization, technical rails, or revenue split.
                </p>

                {/* Initial quick prompts */}
                <div className="w-full space-y-1.5 text-left">
                  {quickChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickPrompt(chip)}
                      className="w-full text-left text-xs p-2 rounded-none bg-[#121722] hover:bg-[#182030] text-slate-300 hover:text-white border border-[#20283a] transition cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* 2-Way Email Channel Active Callout Banner */}
                {hasEscalation && (
                  <div className="p-3.5 rounded-none bg-[#111724] border border-blue-500/30 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-300 flex items-center gap-1.5 text-[11px]">
                        <Mail className="w-3.5 h-3.5 text-blue-400" />
                        2-Way Email Channel Active
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-none bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Email & App Synced
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-300 m-0 leading-relaxed">
                      Escalation copy sent to <strong className="text-white">{userIdentity.email}</strong>. You can chat right here or <strong>reply directly to that email from your inbox</strong> without opening the app!
                    </p>
                    <div className="pt-1.5 flex items-center justify-between border-t border-white/5 text-[10.5px]">
                      <a 
                        href={creatorDashboardUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                      >
                        Creator Dashboard ↗
                      </a>
                      <button 
                        onClick={() => setIsEditingIdentity(true)} 
                        className="text-slate-400 hover:text-white underline cursor-pointer"
                      >
                        Change Email
                      </button>
                    </div>
                  </div>
                )}

                {displayedMessages.map((m, idx) => {
                  const isUser = m.sender === 'user'
                  const isAdmin = m.sender === 'admin'
                  return (
                    <div 
                      key={m.id || idx} 
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-500 font-mono">
                        {isUser ? (
                          <>
                            <span>{m.creator_name || userIdentity.name || 'You'}</span>
                            <User className="w-3 h-3 text-slate-400" />
                          </>
                        ) : isAdmin ? (
                          <>
                            <ShieldAlert className="w-3 h-3 text-emerald-400" />
                            <span className="font-bold text-emerald-400">Support Operations (Human Reply)</span>
                          </>
                        ) : (
                          <>
                            <Bot className="w-3 h-3" style={{ color: accent.color }} />
                            <span style={{ color: accent.color }}>CoLaunch AI</span>
                            {m.escalated && (
                              <span className="text-amber-400 font-bold ml-1">· Escalated</span>
                            )}
                          </>
                        )}
                      </div>

                      <div 
                        className={`rounded-none p-3 text-xs leading-relaxed max-w-[88%] ${
                          isUser 
                            ? 'bg-blue-600 text-white' 
                            : isAdmin
                              ? 'bg-[#121c27] text-white border border-emerald-500/40'
                              : 'bg-[#151c29] text-slate-200 border border-[#232d42]'
                        }`}
                        style={isUser ? { background: accent.color, color: '#ffffff' } : {}}
                      >
                        <p className="whitespace-pre-wrap m-0">{m.message}</p>
                      </div>

                      <span className="text-[9px] text-slate-600 mt-1">
                        {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  )
                })}

                {loading && (
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-500 font-mono">
                      <Bot className="w-3 h-3" style={{ color: accent.color }} />
                      <span style={{ color: accent.color }}>CoLaunch AI analyzing for {handle}...</span>
                    </div>
                    <div className="rounded-none p-3 text-xs bg-[#151c29] text-slate-400 border border-[#232d42] flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: accent.color }} />
                      <span>Generating tailored response...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick Chips Bar when active */}
          {messages.length > 0 && (
            <div className="px-3 py-2 bg-[#0d111a] border-t border-[#1c2333] flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0">
              <button
                onClick={() => handleQuickPrompt(`Talk to human admin about ${handle}`)}
                className="whitespace-nowrap text-[10px] font-semibold px-2.5 py-1 rounded-none bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer"
              >
                Human Admin
              </button>
              <button
                onClick={() => handleQuickPrompt(`Explain my revenue projections & pricing`)}
                className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-none bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition cursor-pointer"
              >
                Revenue & Pricing
              </button>
              <button
                onClick={() => handleQuickPrompt(`What features are built for my audience?`)}
                className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-none bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition cursor-pointer"
              >
                Features Built
              </button>
            </div>
          )}

          {/* Input Area */}
          <form 
            onSubmit={handleSend}
            className="p-3 bg-[#101520] border-t border-[#1c2333] flex items-center gap-2 flex-shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask anything about ${handle}...`}
              className="flex-1 bg-[#0b0e14] border border-[#20293d] rounded-none px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="w-9 h-9 rounded-none flex items-center justify-center text-white disabled:opacity-40 transition cursor-pointer"
              style={{ background: accent.color }}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}

