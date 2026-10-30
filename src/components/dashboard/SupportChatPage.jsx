import { useState, useEffect, useRef } from 'react'
import { 
  Headphones, Send, Bot, User, ShieldCheck, Mail, Sparkles, 
  CheckCheck, AlertCircle, RefreshCw, FileText, DollarSign, 
  HelpCircle, ChevronRight, Lock, Check, Loader2, ArrowUpRight, Edit2
} from 'lucide-react'
import { useForge, getAccent } from '../../App'
import { 
  fetchSupportHistory, 
  sendSupportMessage, 
  escalateSupportTicket, 
  getCreatorId,
  getSupportUserIdentity,
  setSupportUserIdentity
} from '../../services/supportService'

export default function SupportChatPage() {
  const { creatorData } = useForge()
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [escalating, setEscalating] = useState(false)
  const [supportStatus, setSupportStatus] = useState(null)
  const messagesEndRef = useRef(null)

  // Creator Identity
  const [userIdentity, setUserIdentity] = useState(() => getSupportUserIdentity(creatorData))
  const [isEditingIdentity, setIsEditingIdentity] = useState(false)
  const [nameInput, setNameInput] = useState(userIdentity.name || '')
  const [emailInput, setEmailInput] = useState(userIdentity.email || '')

  const accent = getAccent(creatorData)
  const creatorId = getCreatorId(creatorData)
  const rawHandle = creatorData?.handle || creatorData?.name || 'creator'
  const cleanHandle = rawHandle.replace(/^@+/, '')
  const handle = cleanHandle ? `@${cleanHandle}` : '@creator'
  const creatorName = userIdentity.name || creatorData?.name || creatorData?.channelTitle || 'Creator'
  const blueprintName = creatorData?.blueprint?.name || creatorData?.productName || 'Custom Platform'
  const niche = creatorData?.niche || 'Digital Creator'
  const followers = creatorData?.followers ? Number(creatorData.followers).toLocaleString() : 'Growing'

  const hasIdentity = Boolean(userIdentity.name && userIdentity.email && userIdentity.email.includes('@'))
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://colaunch-web.vercel.app'
  const creatorDashboardUrl = `${baseUrl}/${cleanHandle.toLowerCase()}/${creatorId}`

  // Load and poll chat history by creatorId
  useEffect(() => {
    let active = true
    const loadHistory = () => {
      fetchSupportHistory(creatorData).then(msgs => {
        if (active && msgs) {
          setMessages(msgs)
        }
      })
    }
    loadHistory()
    const pollInterval = setInterval(loadHistory, 3500)

    // Also fetch backend status
    fetch('/api/support/status')
      .then(r => r.json())
      .then(d => { if (active) setSupportStatus(d) })
      .catch(() => {})

    return () => { 
      active = false 
      clearInterval(pollInterval)
    }
  }, [creatorId, handle])

  // Sync identity changes if creatorData updates
  useEffect(() => {
    const existing = getSupportUserIdentity(creatorData)
    if (existing.name && existing.email) {
      setUserIdentity(existing)
      setNameInput(existing.name)
      setEmailInput(existing.email)
    }
  }, [creatorData])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSaveIdentity = (e) => {
    if (e) e.preventDefault()
    const trimmedName = nameInput.trim()
    const trimmedEmail = emailInput.trim()
    if (!trimmedName || !trimmedEmail || !trimmedEmail.includes('@')) return

    setSupportUserIdentity(trimmedName, trimmedEmail)
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

    const tempId = 'temp_' + Date.now()
    const optimistic = {
      id: tempId,
      sender: 'user',
      message: text,
      status: 'active',
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, optimistic])

    try {
      const res = await sendSupportMessage(text, creatorData, 'Creator Dashboard', false, userIdentity)
      if (res && res.messages) {
        setMessages(res.messages)
      }
    } catch (err) {
      console.error('[SupportChatPage] Send failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEscalate = async (reason = 'Creator requested direct admin escalation') => {
    if (escalating) return
    if (!hasIdentity) {
      setIsEditingIdentity(true)
      return
    }
    setEscalating(true)
    try {
      const res = await escalateSupportTicket(
        creatorData, 
        `${reason} (${userIdentity.name} - ${userIdentity.email})`, 
        'Creator Dashboard', 
        userIdentity
      )
      if (res && res.messages) {
        setMessages(res.messages)
      } else {
        const refreshed = await fetchSupportHistory(creatorData)
        setMessages(refreshed)
      }
    } catch (err) {
      console.error('[SupportChatPage] Escalation failed:', err)
    } finally {
      setEscalating(false)
    }
  }

  const categoryPrompts = [
    {
      title: 'Monetization & Payouts',
      desc: `How do payouts and revenue splits operate for ${handle}?`,
      prompt: `Can you explain the detailed payout process, revenue split, and billing setup for ${handle}?`
    },
    {
      title: 'Platform Architecture',
      desc: `How is the ${blueprintName} suite structured for ${niche}?`,
      prompt: `Give me an overview of the technical components and member features built for ${blueprintName}.`
    },
    {
      title: 'Custom Domain & SSL',
      desc: `Connecting a custom web domain to ${handle}`,
      prompt: `How can I connect my own custom domain to replace the default URL for ${handle}?`
    },
    {
      title: 'Talk to Human Admin',
      desc: 'Direct escalation to CoLaunch Operations',
      prompt: `I would like to speak directly with an admin about a custom partnership agreement.`
    }
  ]

  const hasEscalation = messages.some(m => m.escalated || m.status === 'escalated_to_admin')

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner"
              style={{
                background: `rgba(${accent.rgb}, 0.12)`,
                borderColor: `rgba(${accent.rgb}, 0.3)`,
                color: accent.color
              }}
            >
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Customer Support Desk
                <span className="w-2 h-2 rounded-full" style={{ background: accent.color }} />
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                24/7 Creator Intelligence Agent & Direct Operations Desk
              </p>
            </div>
          </div>
        </div>

        {/* Operational Status Badges */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {hasIdentity && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121722] border border-[#232d42] text-xs font-mono text-slate-300">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-white font-bold">{userIdentity.name}</span>
              <span className="text-slate-400 text-[11px]">({userIdentity.email})</span>
              <button
                onClick={() => setIsEditingIdentity(true)}
                className="text-slate-400 hover:text-white ml-1 p-0.5 rounded hover:bg-white/10 cursor-pointer"
                title="Edit Name & Email"
              >
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121722] border border-[#232d42] text-xs font-mono text-slate-300">
            <Bot className="w-3.5 h-3.5" style={{ color: accent.color }} />
            <span>AI Desk:</span>
            <span className="text-emerald-400 font-bold">Online</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#121722] border border-[#232d42] text-xs font-mono text-slate-300">
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span>Operations Desk:</span>
            <span className="text-blue-400 font-bold">Active</span>
          </div>

          <button
            onClick={() => handleEscalate(`Creator ${handle} clicked Escalate button in Dashboard Support Desk`)}
            disabled={escalating}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer"
          >
            {escalating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            {hasEscalation ? 'Admin Already Notified' : 'Escalate to Admin'}
          </button>
        </div>
      </div>

      {/* Grid: Context & Categories (Left 4 cols) + Interactive Chat (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Context Card & Quick Questions */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Creator Active Snapshot Card */}
          <div className="p-5 rounded-2xl bg-[#0f141f] border border-[#1f283d] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2336]">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Grounding Data
              </span>
              <span className="text-[10px] font-mono text-slate-500">ID: {creatorId}</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Creator</span>
                <span className="font-semibold text-white">{creatorName} (<span style={{ color: accent.color }}>{handle}</span>)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Audience</span>
                <span className="font-mono text-slate-200">{followers} subscribers</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Niche</span>
                <span className="text-slate-200">{niche}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Platform Suite</span>
                <span className="font-semibold text-emerald-400">{blueprintName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Response SLA</span>
                <span className="font-mono text-slate-300 text-[11px]">Priority Queue</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#141a29] border border-[#232d42] text-[11.5px] text-slate-300 leading-relaxed">
              <p className="m-0">
                All inquiries are answered using your live channel telemetry. Questions requiring human intervention are forwarded immediately to our team.
              </p>
            </div>
          </div>

          {/* Quick Categories */}
          <div className="space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Common Topics
            </p>
            {categoryPrompts.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setInputText(cat.prompt)}
                className="w-full p-3 rounded-xl bg-[#101522] hover:bg-[#161d2f] border border-[#1f293d] hover:border-[#2d3a54] text-left transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-bold text-white group-hover:text-blue-400 transition">
                    {cat.title}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition" />
                </div>
                <p className="text-[11px] text-slate-400 m-0">
                  {cat.desc}
                </p>
              </button>
            ))}
          </div>

        </div>

        {/* Right Column: Full-Height Interactive Chat Interface */}
        <div className="lg:col-span-8 flex flex-col h-[650px] rounded-2xl bg-[#0b0e14] border border-[#1f283d] shadow-xl overflow-hidden">
          
          {/* Chat Window Top Bar */}
          <div className="p-4 bg-[#111622] border-b border-[#1c2436] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bot className="w-4 h-4" style={{ color: accent.color }} />
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white">
                  CoLaunch Creator Desk
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">
                  General Unified Database · Stored by ID: {creatorId}
                </span>
              </div>
            </div>

            {hasEscalation && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Support Team Notified</span>
              </div>
            )}
          </div>

          {/* Messages Flow Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#090b10]">
            {(!hasIdentity && messages.length === 0) || isEditingIdentity ? (
              <div className="h-full flex flex-col justify-center items-center p-4">
                <div className="max-w-md w-full p-6 sm:p-7 rounded-2xl bg-[#111724] border border-[#232f45] shadow-2xl text-left space-y-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner flex-shrink-0"
                      style={{
                        background: `rgba(${accent.rgb}, 0.15)`,
                        borderColor: `rgba(${accent.rgb}, 0.3)`,
                        color: accent.color
                      }}
                    >
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Introduce Yourself</h3>
                      <p className="text-xs text-slate-400">
                        Please provide your name and email to enable personalized AI and 2-way email support.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSaveIdentity} className="space-y-4 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        placeholder="e.g. Alex Fox"
                        className="w-full bg-[#090c13] border border-[#232c3f] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">Your Email Address</label>
                      <input
                        type="email"
                        required
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        placeholder="e.g. alex@example.com"
                        className="w-full bg-[#090c13] border border-[#232c3f] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-[11px] text-slate-500 block mt-1">
                        When escalated, a copy is dispatched here so you can reply directly from your personal inbox!
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 pt-1">
                      {isEditingIdentity && hasIdentity && (
                        <button
                          type="button"
                          onClick={() => setIsEditingIdentity(false)}
                          className="flex-1 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 bg-white/5 hover:bg-white/10 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={!nameInput.trim() || !emailInput.trim() || !emailInput.includes('@')}
                        className="flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
                        style={{ background: accent.color }}
                      >
                        <Check className="w-4 h-4" />
                        <span>Save & Start Support Chat</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 border shadow-md"
                  style={{
                    background: `rgba(${accent.rgb}, 0.1)`,
                    borderColor: `rgba(${accent.rgb}, 0.3)`,
                    color: accent.color
                  }}
                >
                  <Headphones className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">
                  Welcome to {creatorName}'s Support Desk
                </h3>
                <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
                  Ask about your audience rails, courses, video releases, Stripe connect setup, or community engagement. 
                  Our AI is grounded in your exact channel metrics.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                  {categoryPrompts.map((cp, i) => (
                    <button
                      key={i}
                      onClick={() => setInputText(cp.prompt)}
                      className="p-2.5 rounded-xl bg-[#121722] hover:bg-[#1a2233] border border-[#222a3d] text-left text-xs text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      <div className="font-semibold text-white mb-0.5">{cp.title}</div>
                      <div className="text-[10.5px] text-slate-400 truncate">{cp.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* 2-Way Email Channel Active Callout Banner */}
                {hasEscalation && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121c2d] to-[#0c121e] border border-blue-500/35 text-xs shadow-lg space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-300 flex items-center gap-2 text-xs sm:text-sm">
                        <Mail className="w-4 h-4 text-blue-400" />
                        2-Way Email Channel Active
                      </span>
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        Email & App Synced
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 m-0 leading-relaxed">
                      This inquiry has been escalated to human administration, and a copy was sent to <strong className="text-white">{userIdentity.email}</strong>. 
                      You can continue chatting right here, or <strong>reply directly to that email from your inbox</strong> without opening the app!
                    </p>
                    <div className="pt-2 flex items-center justify-between border-t border-white/5 text-[11px]">
                      <a 
                        href={creatorDashboardUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5"
                      >
                        Live Suite URL: <span className="font-mono text-slate-300">{creatorDashboardUrl}</span> ↗
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

                {messages.map((m, idx) => {
                  const isUser = m.sender === 'user'
                  const isAdmin = m.sender === 'admin'
                  return (
                    <div 
                      key={m.id || idx} 
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-mono">
                        {isUser ? (
                          <>
                            <span className="font-bold">{userIdentity.name || creatorName}</span>
                            <User className="w-3 h-3 text-slate-400" />
                          </>
                        ) : isAdmin ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="font-bold text-emerald-400">Support Operations (Human Reply)</span>
                          </>
                        ) : (
                          <>
                            <Bot className="w-3 h-3" style={{ color: accent.color }} />
                            <span className="font-bold" style={{ color: accent.color }}>CoLaunch AI Support</span>
                            {m.escalated && (
                              <span className="text-amber-400 font-bold ml-1.5 px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-800/40">
                                Escalated to Team
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      <div 
                        className={`rounded-2xl p-4 text-xs sm:text-[13px] leading-relaxed max-w-[85%] shadow-sm ${
                          isUser 
                            ? 'bg-blue-600 text-white rounded-br-sm' 
                            : isAdmin
                              ? 'bg-[#101b24] text-white border border-emerald-500/40 rounded-bl-sm shadow-md'
                              : 'bg-[#131824] text-slate-200 border border-[#212b3e] rounded-bl-sm'
                        }`}
                        style={isUser ? { background: accent.color, color: '#ffffff' } : {}}
                      >
                        <p className="whitespace-pre-wrap m-0">{m.message}</p>
                      </div>

                      <span className="text-[9.5px] text-slate-600 mt-1 font-mono">
                        {m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  )
                })}

                {loading && (
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-mono">
                      <Bot className="w-3 h-3" style={{ color: accent.color }} />
                      <span style={{ color: accent.color }}>CoLaunch AI analyzing for {handle}...</span>
                    </div>
                    <div className="rounded-2xl p-4 text-xs bg-[#131824] text-slate-400 border border-[#212b3e] rounded-bl-sm flex items-center gap-2.5">
                      <Loader2 className="w-4 h-4 animate-spin" style={{ color: accent.color }} />
                      <span>Formulating grounded response based on your channel metrics...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Chat Input Bar */}
          <form 
            onSubmit={handleSend}
            className="p-3.5 bg-[#10141f] border-t border-[#1c2436] flex items-center gap-2.5 flex-shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask anything about your platform for ${handle}...`}
              className="flex-1 bg-[#0b0e14] border border-[#222c40] rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="px-5 py-3 rounded-xl flex items-center gap-2 font-bold text-xs sm:text-sm text-white disabled:opacity-40 transition cursor-pointer"
              style={{ background: accent.color }}
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </div>
    </div>
  )
}

