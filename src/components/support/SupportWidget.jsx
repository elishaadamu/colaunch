import { useState, useEffect, useRef } from 'react'
import { 
  Headphones, X, Send, User, Bot, ShieldAlert, Sparkles, 
  Mail, CheckCheck, Loader2, MessageSquare, AlertCircle
} from 'lucide-react'
import { useForge, getAccent } from '../../App'
import { 
  fetchSupportHistory, 
  sendSupportMessage, 
  escalateSupportTicket, 
  getCreatorId 
} from '../../services/supportService'

export default function SupportWidget({ currentStage }) {
  const { creatorData } = useForge()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [loading, setLoading] = useState(false)
  const [escalating, setEscalating] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef(null)

  const accent = getAccent(creatorData)
  const handle = creatorData?.handle || '@creator'
  const creatorId = getCreatorId(creatorData)

  // Load chat history on mount and when creator changes
  useEffect(() => {
    let active = true
    fetchSupportHistory(creatorData).then(msgs => {
      if (active && msgs) {
        setMessages(msgs)
      }
    })
    return () => { active = false }
  }, [creatorId, creatorData?.handle])

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setUnreadCount(0)
    }
  }, [messages, isOpen])

  const handleSend = async (e) => {
    if (e) e.preventDefault()
    const text = inputText.trim()
    if (!text || loading) return

    setInputText('')
    setLoading(true)

    // Optimistic user message
    const tempId = 'temp_' + Date.now()
    const optimisticMsg = {
      id: tempId,
      sender: 'user',
      message: text,
      status: 'active',
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, optimisticMsg])

    try {
      const res = await sendSupportMessage(text, creatorData, currentStage)
      if (res && res.messages) {
        setMessages(res.messages)
      }
    } catch (err) {
      console.error('[SupportWidget] Send failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickPrompt = (promptText) => {
    setInputText(promptText)
  }

  const handleEscalateToAdmin = async () => {
    if (escalating) return
    setEscalating(true)
    try {
      const res = await escalateSupportTicket(
        creatorData, 
        `Creator @${handle} clicked Escalate to Human Admin from Onboarding stage: ${currentStage}`,
        currentStage
      )
      if (res && res.messages) {
        setMessages(res.messages)
      } else {
        const refreshed = await fetchSupportHistory(creatorData)
        setMessages(refreshed)
      }
    } catch (err) {
      console.error('[SupportWidget] Escalation error:', err)
    } finally {
      setEscalating(false)
    }
  }

  const quickChips = [
    `How does the revenue split work for @${handle.replace('@', '')}?`,
    `Can I change my blueprint features later?`,
    `How do video releases & YouTube sync work?`,
    `Talk to human admin`,
  ]

  const hasEscalation = messages.some(m => m.escalated || m.status === 'escalated_to_admin')

  return (
    <>
      {/* Floating Right Support Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#121722] hover:bg-[#1a2233] text-white border border-[#2b354c] shadow-2xl transition-all duration-200 hover:scale-[1.02] cursor-pointer"
          style={{
            borderColor: isOpen ? accent.color : 'rgba(255,255,255,0.12)',
            boxShadow: isOpen ? `0 0 25px -5px ${accent.color}40` : '0 10px 30px rgba(0,0,0,0.6)'
          }}
          aria-label="Toggle Customer Support"
        >
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: `rgba(${accent.rgb}, 0.15)`, color: accent.color }}
          >
            <Headphones className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
              Support
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent.color }} />
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              AI & Admin Desk
            </span>
          </div>
          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center ml-1">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Slide-over Right Chat Panel */}
      {isOpen && (
        <div 
          className="fixed bottom-20 right-6 z-50 w-[92vw] sm:w-[420px] max-h-[80vh] h-[640px] flex flex-col rounded-2xl bg-[#0c1017] border border-[#232b3e] shadow-2xl overflow-hidden animate-fadeIn"
          style={{ boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.85)' }}
        >
          {/* Header */}
          <div className="p-4 border-b border-[#1c2333] bg-[#101520] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner"
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
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                    24/7 AI Desk
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono truncate max-w-[240px]">
                  Grounded in {handle} · {currentStage}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Context Banner */}
          <div className="px-4 py-2 bg-[#131926] border-b border-[#1f273b] flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Bot className="w-3.5 h-3.5" style={{ color: accent.color }} />
              <span>Grounded in your channel data</span>
            </div>
            {hasEscalation ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-md">
                <ShieldAlert className="w-3 h-3" />
                Admin Notified (Brevo/SMTP)
              </span>
            ) : (
              <button
                onClick={handleEscalateToAdmin}
                disabled={escalating}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-0.5 rounded-md border border-white/10 transition cursor-pointer"
                title="Send ticket to human team via Brevo & Google SMTP"
              >
                {escalating ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Mail className="w-2.5 h-2.5" />}
                Escalate to Admin
              </button>
            )}
          </div>

          {/* Messages Flow */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#0a0d14]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border shadow-sm"
                  style={{
                    background: `rgba(${accent.rgb}, 0.1)`,
                    borderColor: `rgba(${accent.rgb}, 0.25)`,
                    color: accent.color
                  }}
                >
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">
                  How can we help with {handle}?
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
                      className="w-full text-left text-xs p-2 rounded-xl bg-[#121722] hover:bg-[#182030] text-slate-300 hover:text-white border border-[#20283a] transition cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((m, idx) => {
                  const isUser = m.sender === 'user'
                  return (
                    <div 
                      key={m.id || idx} 
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-500 font-mono">
                        {isUser ? (
                          <>
                            <span>You</span>
                            <User className="w-3 h-3 text-slate-400" />
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
                        className={`rounded-2xl p-3 text-xs leading-relaxed max-w-[88%] shadow-sm ${
                          isUser 
                            ? 'bg-blue-600 text-white rounded-br-sm' 
                            : 'bg-[#151c29] text-slate-200 border border-[#232d42] rounded-bl-sm'
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
                    <div className="rounded-2xl p-3 text-xs bg-[#151c29] text-slate-400 border border-[#232d42] rounded-bl-sm flex items-center gap-2">
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
                onClick={() => handleQuickPrompt(`Talk to human admin about @${handle}`)}
                className="whitespace-nowrap text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer"
              >
                Human Admin
              </button>
              <button
                onClick={() => handleQuickPrompt(`Explain my revenue projections & pricing`)}
                className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition cursor-pointer"
              >
                Revenue & Pricing
              </button>
              <button
                onClick={() => handleQuickPrompt(`What features are built for my audience?`)}
                className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition cursor-pointer"
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
              className="flex-1 bg-[#0b0e14] border border-[#20293d] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition cursor-pointer"
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

