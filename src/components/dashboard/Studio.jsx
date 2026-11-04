import { useState, useEffect, useCallback, useRef } from 'react'
import { useForge, getAccent, useBgJob } from '../../App'
import {
  Sparkles, RefreshCw, Copy, Check, ChevronDown, ChevronRight,
  Instagram, Youtube, Twitter, Mail, FileText, Video,
  Radio, ArrowRight, X, Calendar, Send, AlertCircle, Volume2,
  Clock, Trash2, Sliders, Bot, BookOpen, Layers, CheckCircle, Zap
} from 'lucide-react'
import { generateStudioContent } from '../../services/ai'
import { generateAuthenticFallbackCopy, refineAuthenticCopy } from '../../utils/authenticStudioCopy'
import { SOCIAL_TEMPLATES, EMAIL_TEMPLATES, ALL_TEMPLATES } from '../../utils/studioTemplates'
import ApiKeysModal from '../ui/ApiKeysModal'
import { getStoredYouTubeConnection } from '../../services/youtubeApi'
import { getStoredMetaConnection } from '../../services/metaApi'
import { isChannelConnectedOrConfigured } from '../../services/channelStudyService'


// ─── CONTENT TYPES ───────────────────────────────────────────────────────────

const CONTENT_TYPES = [
  {
    group: 'Social',
    items: [
      { id: 'ig-caption', label: 'Instagram caption', platform: 'Instagram', icon: Instagram },
      { id: 'ig-reel', label: 'Instagram Reel concept', platform: 'Instagram', icon: Instagram },
      { id: 'x-post', label: 'X / Twitter post', platform: 'Twitter', icon: Twitter },
      { id: 'x-thread', label: 'X thread (5–7 tweets)', platform: 'Twitter', icon: Twitter },
      { id: 'linkedin', label: 'LinkedIn post', platform: 'LinkedIn', icon: FileText },
      { id: 'yt-community', label: 'YouTube community post', platform: 'YouTube', icon: Youtube },
      { id: 'tiktok', label: 'TikTok caption + hook', platform: 'TikTok', icon: Radio },
    ],
  },
  {
    group: 'Video',
    items: [
      { id: 'yt-ad', label: 'YouTube 60-sec ad script', platform: 'YouTube', icon: Youtube },
      { id: 'short-script', label: 'Short-form promo script', platform: 'Multi', icon: Video },
      { id: 'live-outline', label: 'Live session outline', platform: 'YouTube', icon: Video },
      { id: 'hook', label: 'Promo hook (0–5 sec)', platform: 'Multi', icon: Radio },
    ],
  },
  {
    group: 'Email',
    items: [
      { id: 'email-announce', label: 'Launch announcement email', platform: 'Email', icon: Mail },
      { id: 'email-welcome', label: 'Welcome email', platform: 'Email', icon: Mail },
      { id: 'email-sequence', label: 'Launch email sequence', platform: 'Email', icon: Mail },
      { id: 'email-followup', label: 'Follow-up / re-engagement', platform: 'Email', icon: Mail },
    ],
  },
  {
    group: 'Copy',
    items: [
      { id: 'offer-copy', label: 'Offer page copy', platform: 'Product', icon: FileText },
      { id: 'faq', label: 'FAQ section', platform: 'Product', icon: FileText },
      { id: 'cta', label: 'Call-to-action variants', platform: 'Multi', icon: ArrowRight },
      { id: 'bio', label: 'Bio / about copy', platform: 'Multi', icon: FileText },
    ],
  },
  {
    group: 'Repurpose',
    items: [
      { id: 'repurpose-short', label: 'Long-form → 5 short posts', platform: 'Multi', icon: RefreshCw },
      { id: 'repurpose-platform', label: 'One idea → all platforms', platform: 'Multi', icon: RefreshCw },
      { id: 'repurpose-email', label: 'Post → email newsletter', platform: 'Email', icon: Mail },
      { id: 'comment-reply', label: 'Comment reply suggestions', platform: 'Multi', icon: Send },
    ],
  },
]

const TONE_OPTIONS = ['Confident', 'Casual', 'Bold', 'Minimal', 'Story-driven']
const PLATFORM_COLORS = {
  Instagram: 'rgba(225,48,108,0.2)',
  Twitter: 'rgba(29,161,242,0.2)',
  YouTube: 'rgba(255,0,0,0.2)',
  Email: 'rgba(255,255,255,0.08)',
  Product: 'rgba(255,255,255,0.08)',
  Multi: 'rgba(255,255,255,0.08)',
  TikTok: 'rgba(255,255,255,0.08)',
  LinkedIn: 'rgba(10,102,194,0.2)',
  Podcast: 'rgba(139,92,246,0.2)',
}

const STUDIO_JOB = 'studio-gen'

export default function Studio() {
  const { 
    creatorData, 
    userProfile,
    startBgJob, 
    cancelBgJob, 
    clearBgJob, 
    incrementAiActions, 
    triggerToast,
    aiKeys,
    setApiModalOpen,
    setActiveTab,
    preloadStudioType,
    setPreloadStudioType,
    syncSessionToDb,
    dashboardData,
    saveDashboardData
  } = useForge()
  const accent = getAccent(creatorData?.platform)
  const studioJob = useBgJob(STUDIO_JOB)

  const ytConn = userProfile?.youtube_connection || getStoredYouTubeConnection(userProfile?.email)
  const metaConn = userProfile?.meta_connection || getStoredMetaConnection(userProfile?.email)
  const isConnected = isChannelConnectedOrConfigured(creatorData, ytConn, metaConn)

  if (!isConnected) {
    return (
      <div className="min-h-full flex flex-col bg-[#090d16] text-slate-200 p-4 sm:p-8 items-center justify-center">
        <div className="max-w-xl w-full p-8 bg-[#0c0f17] border border-[#161b2b] rounded-none text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-none bg-[#c81e3c] border border-[#c81e3c] flex items-center justify-center text-white shadow-lg shadow-[#c81e3c]/20">
            <Sparkles size={28} className="text-white" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400">
              AI Content Studio
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Connect a Channel to Unlock AI Studio
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            The AI Studio generates captions, hooks, and content scripts specifically for your audience and niche. Connect your YouTube or Facebook channel in Accounts first so the AI has your real videos and brand context to work from.
          </p>
          <div className="pt-3">
            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('accounts')}
              className="px-6 py-2.5 text-xs font-bold text-white uppercase tracking-wider rounded-none transition cursor-pointer border-0 hover:opacity-95 flex items-center gap-2 mx-auto shadow-md"
              style={{ background: '#c81e3c', color: '#ffffff' }}
            >
              <ArrowRight size={14} className="text-white" />
              <span className="text-white">Go to Accounts to Connect</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  const [selectedType, setSelectedType] = useState(null)
  const [showTypeSelectorMobile, setShowTypeSelectorMobile] = useState(false)
  const [input, setInput] = useState('')
  const [generated, setGenerated] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [tone, setTone] = useState('Confident')
  const [copied, setCopied] = useState(false)
  const [expandedGroup, setExpandedGroup] = useState('Social')
  const [scheduled, setScheduled] = useState(false)
  const [showKeys, setShowKeys] = useState(false)
  const [recentOutputs, setRecentOutputs] = useState([])
  const [expandedOutputId, setExpandedOutputId] = useState(null)
  const [currentGeneratedId, setCurrentGeneratedId] = useState(null)

  // ── Mode & Template States ──
  const [sidebarMode, setSidebarMode] = useState('types') // 'types' | 'templates'
  const [templateFilter, setTemplateFilter] = useState('all') // 'all' | 'social' | 'email'
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [aiSetupOpen, setAiSetupOpen] = useState(false)

  const handle = creatorData?.handle || 'default'
  const recentKey = `forge_${handle}_studio_recent_outputs`
  const hasHydratedStudioRef = useRef(false)

  // ── AI Setup Preferences ──
  const [aiSetupConfig, setAiSetupConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(`forge_${handle}_studio_ai_setup`)
      if (saved) return JSON.parse(saved)
    } catch (_) {}
    return {
      provider: 'gemini',
      creativity: 'balanced',
      tone: 'Confident',
      customVoice: '',
      audiencePersona: creatorData?.targetAudience || 'creators, builders, and learners',
      includeEmojis: true,
      includeHashtags: true,
    }
  })

  // Hydrate AI setup & recent outputs from MongoDB Atlas
  useEffect(() => {
    if (hasHydratedStudioRef.current) return
    if (dashboardData?.studio_data) {
      hasHydratedStudioRef.current = true
      if (Array.isArray(dashboardData.studio_data.recent_outputs) && dashboardData.studio_data.recent_outputs.length > 0) {
        setRecentOutputs(dashboardData.studio_data.recent_outputs)
      }
      if (dashboardData.studio_data.ai_setup) {
        setAiSetupConfig(dashboardData.studio_data.ai_setup)
        if (dashboardData.studio_data.ai_setup.tone) {
          setTone(dashboardData.studio_data.ai_setup.tone)
        }
      }
    }
  }, [dashboardData?.studio_data])

  const handleSaveAiSetup = (newConfig) => {
    setAiSetupConfig(newConfig)
    if (newConfig.tone) setTone(newConfig.tone)
    try {
      localStorage.setItem(`forge_${handle}_studio_ai_setup`, JSON.stringify(newConfig))
    } catch (_) {}
    if (saveDashboardData) {
      saveDashboardData('studio', { ai_setup: newConfig, recent_outputs: recentOutputs, synced_at: new Date().toISOString() })
    }
    setAiSetupOpen(false)
    if (triggerToast) triggerToast('AI Setup preferences saved!', 'success')
  }

  // Load recent outputs from localStorage on mount (as fallback)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(recentKey)
      if (saved && (!recentOutputs || recentOutputs.length === 0)) setRecentOutputs(JSON.parse(saved))
    } catch (e) { /* ignore corrupt data */ }
  }, [recentKey])

  // Save recent outputs to MongoDB Atlas and localStorage
  const saveRecentOutputs = useCallback((outputs) => {
    setRecentOutputs(outputs)
    try {
      localStorage.setItem(recentKey, JSON.stringify(outputs))
    } catch (e) { /* quota exceeded */ }
    if (saveDashboardData) {
      saveDashboardData('studio', { recent_outputs: outputs, ai_setup: aiSetupConfig, synced_at: new Date().toISOString() })
    }
  }, [recentKey, saveDashboardData, aiSetupConfig])

  // Push a new output to the history list
  const pushToRecent = useCallback((content, type) => {
    const entry = {
      id: Date.now(),
      typeId: type?.id || 'unknown',
      typeLabel: type?.label || 'Content',
      platform: type?.platform || 'Multi',
      content,
      timestamp: new Date().toISOString(),
    }
    setRecentOutputs(prev => {
      const next = [entry, ...prev].slice(0, 20) // cap at 20
      try { localStorage.setItem(recentKey, JSON.stringify(next)) } catch(e) {}
      if (saveDashboardData) {
        setTimeout(() => {
          saveDashboardData('studio', { recent_outputs: next, ai_setup: aiSetupConfig, synced_at: new Date().toISOString() })
        }, 50)
      }
      return next
    })
    return entry.id
  }, [recentKey, saveDashboardData, aiSetupConfig])

  const removeFromRecent = useCallback((id) => {
    setRecentOutputs(prev => {
      const next = prev.filter(o => o.id !== id)
      try { localStorage.setItem(recentKey, JSON.stringify(next)) } catch(e) {}
      if (saveDashboardData) {
        setTimeout(() => {
          saveDashboardData('studio', { recent_outputs: next, ai_setup: aiSetupConfig, synced_at: new Date().toISOString() })
        }, 50)
      }
      return next
    })
  }, [recentKey, saveDashboardData, aiSetupConfig])

  // Dynamic content types reflecting onboarding modifications
  const productName = creatorData.productName || 'Creator Academy'
  const features = creatorData.features || []
  const contentTypes = [
    ...CONTENT_TYPES,
    ...(features.includes('Podcast section') ? [{
      group: 'Podcast',
      items: [
        { id: 'podcast-outline', label: 'Podcast episode outline', platform: 'Podcast', icon: Volume2 },
        { id: 'podcast-intro', label: 'Podcast show intro & hook', platform: 'Podcast', icon: Volume2 },
      ]
    }] : [])
  ]

  // Template Handlers
  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl)
    const flatTypes = contentTypes.flatMap(g => g.items)
    const matchingType = flatTypes.find(t => t.id === tpl.targetTypeId) || flatTypes.find(t => t.platform.toLowerCase() === tpl.platform.toLowerCase()) || flatTypes[0]
    setSelectedType(matchingType)
    setInput(tpl.promptGuideline)
    setShowTypeSelectorMobile(false)
    if (triggerToast) triggerToast(`Loaded "${tpl.title}" template!`, 'info')
  }

  const handleLoadBlueprint = (tpl) => {
    const templateToUse = tpl || selectedTemplate
    if (!templateToUse) return
    const draft = templateToUse.generateDraft(creatorData)
    setGenerated(draft)
    const newId = pushToRecent(draft, selectedType)
    setCurrentGeneratedId(newId)
    if (triggerToast) triggerToast(`Loaded "${templateToUse.title}" blueprint!`, 'success')
  }

  // Preload studio type if set in context (e.g. from Revenue/Products tab)
  useEffect(() => {
    if (preloadStudioType) {
      const flatTypes = contentTypes.flatMap(g => g.items)
      const matchedType = flatTypes.find(t => t.id === preloadStudioType)
      if (matchedType) {
        setSelectedType(matchedType)
        setGenerated(null)
        // Expand the group if we match
        const group = contentTypes.find(g => g.items.some(item => item.id === preloadStudioType))
        if (group) {
          setExpandedGroup(group.group)
        }
      }
      setPreloadStudioType(null) // clear it so it only runs once
    }
  }, [preloadStudioType, contentTypes, setPreloadStudioType])

  // Load cached generated text when selectedType changes
  useEffect(() => {
    if (selectedType) {
      const cached = localStorage.getItem(`forge_${handle}_studio_${selectedType.id}`)
      setGenerated(cached || null)
    } else {
      setGenerated(null)
    }
  }, [selectedType, handle])

  // Save generated text to localStorage
  useEffect(() => {
    if (selectedType && generated !== null) {
      localStorage.setItem(`forge_${handle}_studio_${selectedType.id}`, generated)
    }
  }, [generated, selectedType, handle])

  // Apply result when bg job finishes (even after navigating away)
  useEffect(() => {
    if (studioJob.status === 'done' && studioJob.result !== null) {
      setGenerated(studioJob.result)
      const newId = pushToRecent(studioJob.result, selectedType)
      setCurrentGeneratedId(newId)
      setIsGenerating(false)
      clearBgJob(STUDIO_JOB)
      if (triggerToast) triggerToast('Script generated successfully!', 'success')
    }
    if (studioJob.status === 'cancelled') {
      const cached = localStorage.getItem(`forge_${handle}_studio_${selectedType?.id}`)
      setGenerated(cached || null)
      setIsGenerating(false)
      clearBgJob(STUDIO_JOB)
    }
    if (studioJob.status === 'error') {
      setGenerated(`(Generation failed: ${studioJob.error})`)
      setIsGenerating(false)
      clearBgJob(STUDIO_JOB)
    }
    if (studioJob.status === 'running') {
      setIsGenerating(true)
    }
  }, [studioJob.status, studioJob.result, studioJob.error, selectedType, handle, clearBgJob, pushToRecent])

  const handleGenerate = () => {
    if (!selectedType) return
    setIsGenerating(true)
    setGenerated(null)

    const composedPrompt = [
      input,
      selectedTemplate ? `Template Directive: Follow the ${selectedTemplate.title} framework (${selectedTemplate.formula}).` : '',
      aiSetupConfig.customVoice ? `Brand Voice Directives: ${aiSetupConfig.customVoice}` : '',
      aiSetupConfig.audiencePersona ? `Target Audience Persona: ${aiSetupConfig.audiencePersona}` : '',
      aiSetupConfig.includeEmojis === false ? 'Avoid using emojis in this output.' : '',
      aiSetupConfig.includeHashtags === false ? 'Avoid using hashtags in this output.' : '',
      `Creativity setting: ${aiSetupConfig.creativity || 'balanced'}.`
    ].filter(Boolean).join('\n')

    if (incrementAiActions) incrementAiActions()
    startBgJob(STUDIO_JOB, async (sig) => {
      try {
        const res = await generateStudioContent(selectedType, composedPrompt, creatorData, aiSetupConfig.tone || tone, sig)
        if (res && res.trim()) return res
      } catch (err) {
        if (err.name === 'AbortError') throw err
        console.warn('[Studio] Server AI call failed, generating authentic synthesized copy:', err)
      }
      return selectedTemplate
        ? selectedTemplate.generateDraft(creatorData)
        : generateAuthenticFallbackCopy(selectedType.id, creatorData, aiSetupConfig.tone || tone, composedPrompt)
    })
  }

  const handleRefine = (instruction) => {
    if (!selectedType) return
    setIsGenerating(true)
    setGenerated(null)

    const composedInstruction = [
      instruction,
      aiSetupConfig.customVoice ? `Maintain brand voice: ${aiSetupConfig.customVoice}` : '',
    ].filter(Boolean).join('. ')

    if (incrementAiActions) incrementAiActions()
    startBgJob(STUDIO_JOB, async (sig) => {
      try {
        const res = await generateStudioContent(
          selectedType,
          `${input ? `${input}. ` : ''}Please rewrite the previous copy with this direction: ${composedInstruction}. Current copy: ${generated || ''}`,
          creatorData,
          aiSetupConfig.tone || tone,
          sig
        )
        if (res && res.trim()) return res
      } catch (err) {
        if (err.name === 'AbortError') throw err
        console.warn('[Studio] Server AI refinement failed, refining authentically:', err)
      }
      return refineAuthenticCopy(generated, instruction, selectedType.id, creatorData, aiSetupConfig.tone || tone)
    })
  }

  const handleAdaptPlatform = (platformName) => {
    if (!selectedType) return
    setIsGenerating(true)
    setGenerated(null)
    const flatTypes = contentTypes.flatMap(g => g.items)
    const matchedType = flatTypes.find(t => t.platform.toLowerCase() === platformName.toLowerCase()) || selectedType
    setSelectedType(matchedType)

    if (incrementAiActions) incrementAiActions()
    startBgJob(STUDIO_JOB, async (sig) => {
      try {
        const res = await generateStudioContent(
          matchedType,
          `${input ? `${input}. ` : ''}Adapt this copy to suit the ${platformName} platform rules, format, length, and best practices. Current copy: ${generated || ''}`,
          creatorData,
          aiSetupConfig.tone || tone,
          sig
        )
        if (res && res.trim()) return res
      } catch (err) {
        if (err.name === 'AbortError') throw err
        console.warn('[Studio] Server AI adapt failed, adapting authentically:', err)
      }
      return generateAuthenticFallbackCopy(matchedType.id, creatorData, aiSetupConfig.tone || tone, `Adapted for ${platformName}: ${input || ''}`)
    })
  }

  const handleCopy = (text) => {
    const toCopy = text || generated
    if (!toCopy) return
    navigator.clipboard.writeText(toCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Schedule a specific output entry to the calendar
  const handleScheduleEntry = (entry) => {
    const handleVal = creatorData?.handle || 'default'
    const activeGoal = localStorage.getItem(`forge_${handleVal}_calendar_active_goal`) || 'launch'
    const cacheKey = `forge_calendar_${handleVal}_${activeGoal}_w0`
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const todayName = dayNames[new Date().getDay()] || 'Mon'

    let currentCal = null
    try {
      const cached = localStorage.getItem(cacheKey) || localStorage.getItem(`forge_calendar_${handleVal.toLowerCase()}_${activeGoal.toLowerCase()}_w0`)
      if (cached) currentCal = JSON.parse(cached)
    } catch (e) { console.error(e) }

    if (!currentCal) {
      currentCal = [
        { day: 'Mon', posts: [] }, { day: 'Tue', posts: [] },
        { day: 'Wed', posts: [] }, { day: 'Thu', posts: [] },
        { day: 'Fri', posts: [] }, { day: 'Sat', posts: [] },
        { day: 'Sun', posts: [] },
      ]
    }

    let dayObj = currentCal.find(d => d.day === todayName)
    if (!dayObj) dayObj = currentCal[0]

    const titleVal = entry.content.length > 80 ? entry.content.substring(0, 80) + '...' : entry.content

    // Filter out duplicate scheduling of the same post
    const isAlreadyScheduled = dayObj.posts && dayObj.posts.some(p => 
      p.originalId === entry.id || p.title === titleVal
    )
    if (isAlreadyScheduled) {
      if (triggerToast) triggerToast('This post is already scheduled to your calendar today.', 'warning')
      return
    }

    const newPost = {
      id: Date.now(),
      originalId: entry.id,
      platform: entry.platform === 'Multi' || entry.platform === 'Product' || entry.platform === 'Email' ? 'Instagram' : entry.platform,
      type: entry.typeLabel,
      title: titleVal,
      body: entry.content,
      theme: 'launch',
      status: 'scheduled',
    }

    dayObj.posts = [...(dayObj.posts || []), newPost]
    const hClean = handleVal.replace(/^@+/, '')
    const studioKeys = [
      cacheKey,
      `forge_calendar_${handleVal.toLowerCase()}_${activeGoal.toLowerCase()}_w0`,
      `forge_calendar_${hClean}_${activeGoal}_w0`,
      `forge_calendar_${hClean.toLowerCase()}_${activeGoal.toLowerCase()}_w0`
    ]
    studioKeys.forEach(k => {
      try { localStorage.setItem(k, JSON.stringify(currentCal)) } catch (_) {}
    })
    window.dispatchEvent(new CustomEvent('forge_calendar_updated', { detail: { source: 'Studio' } }))

    if (creatorData?.handle && syncSessionToDb) setTimeout(() => syncSessionToDb(), 100)
    if (triggerToast) triggerToast(`"${entry.typeLabel}" scheduled to calendar!`, 'success')
    setTimeout(() => setActiveTab('calendar'), 1000)
  }

  const handleSchedulePost = () => {
    if (!generated || !selectedType) return
    
    const handleVal = creatorData?.handle || 'default'
    const activeGoal = localStorage.getItem(`forge_${handleVal}_calendar_active_goal`) || 'launch'
    const cacheKey = `forge_calendar_${handleVal}_${activeGoal}_w0`
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const todayName = dayNames[new Date().getDay()] || 'Mon'
    
    let currentCal = null
    try {
      const cached = localStorage.getItem(cacheKey) || localStorage.getItem(`forge_calendar_${handleVal.toLowerCase()}_${activeGoal.toLowerCase()}_w0`)
      if (cached) currentCal = JSON.parse(cached)
    } catch (e) {
      console.error(e)
    }
    
    if (!currentCal) {
      currentCal = [
        { day: 'Mon', posts: [] },
        { day: 'Tue', posts: [] },
        { day: 'Wed', posts: [] },
        { day: 'Thu', posts: [] },
        { day: 'Fri', posts: [] },
        { day: 'Sat', posts: [] },
        { day: 'Sun', posts: [] },
      ]
    }

    let dayObj = currentCal.find(d => d.day === todayName)
    if (!dayObj) dayObj = currentCal[0]

    const titleVal = generated.length > 80 ? generated.substring(0, 80) + '...' : generated

    // Filter out duplicate scheduling of the same post
    const isAlreadyScheduled = dayObj.posts && dayObj.posts.some(p => 
      (currentGeneratedId && p.originalId === currentGeneratedId) || p.title === titleVal
    )
    if (isAlreadyScheduled) {
      if (triggerToast) triggerToast('This post is already scheduled to your calendar today.', 'warning')
      return
    }
    
    const newPost = {
      id: Date.now(),
      originalId: currentGeneratedId,
      platform: selectedType.platform === 'Multi' || selectedType.platform === 'Product' || selectedType.platform === 'Email' ? 'Instagram' : selectedType.platform,
      type: selectedType.label,
      title: titleVal,
      body: generated,
      theme: 'launch',
      status: 'scheduled'
    }
    
    dayObj.posts = [...(dayObj.posts || []), newPost]
    const hClean2 = handleVal.replace(/^@+/, '')
    const studioKeys2 = [
      cacheKey,
      `forge_calendar_${handleVal.toLowerCase()}_${activeGoal.toLowerCase()}_w0`,
      `forge_calendar_${hClean2}_${activeGoal}_w0`,
      `forge_calendar_${hClean2.toLowerCase()}_${activeGoal.toLowerCase()}_w0`
    ]
    studioKeys2.forEach(k => {
      try { localStorage.setItem(k, JSON.stringify(currentCal)) } catch (_) {}
    })
    window.dispatchEvent(new CustomEvent('forge_calendar_updated', { detail: { source: 'Studio' } }))
    
    if (creatorData?.handle && syncSessionToDb) {
      setTimeout(() => syncSessionToDb(), 100)
    }
    
    setScheduled(true)
    if (triggerToast) triggerToast('Post scheduled to Content Calendar!', 'success')
    
    setTimeout(() => {
      setActiveTab('calendar')
    }, 1000)
  }


  const renderSelectorItems = () => (
    <>
      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-1 px-3 pb-3 mb-2 border-b border-white/[0.08]">
        <button
          type="button"
          onClick={() => setSidebarMode('types')}
          className={`py-1.5 text-[10px] font-bold uppercase tracking-wider text-center transition cursor-pointer border ${
            sidebarMode === 'types'
              ? 'border-[#c81e3c] bg-[#c81e3c]/15 text-white'
              : 'border-white/5 text-slate-400 hover:text-white bg-white/[0.02]'
          }`}
          style={{ borderRadius: '0px' }}
        >
          Formats
        </button>
        <button
          type="button"
          onClick={() => setSidebarMode('templates')}
          className={`py-1.5 text-[10px] font-bold uppercase tracking-wider text-center transition cursor-pointer border flex items-center justify-center gap-1 ${
            sidebarMode === 'templates'
              ? 'border-[#c81e3c] bg-[#c81e3c]/15 text-white'
              : 'border-white/5 text-slate-400 hover:text-white bg-white/[0.02]'
          }`}
          style={{ borderRadius: '0px' }}
        >
          <span>Templates</span>
          <span className="px-1 py-0.2 text-[8px] font-mono bg-[#c81e3c] text-white font-bold">12</span>
        </button>
      </div>

      {sidebarMode === 'types' ? (
        <>
          <p className="forge-label px-4 mb-2 hidden md:block">Content Formats</p>
          {contentTypes.map(group => (
            <div key={group.group}>
              <button
                onClick={() => setExpandedGroup(g => g === group.group ? null : group.group)}
                className="w-full flex items-center justify-between px-4 py-2 transition-colors cursor-pointer"
                style={{ color: 'var(--theme-text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--theme-text)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--theme-text-muted)' }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider">{group.group}</span>
                <ChevronDown
                  size={12}
                  style={{
                    transition: 'transform 0.2s',
                    transform: expandedGroup === group.group ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {expandedGroup === group.group && (
                <div className="pb-2">
                  {group.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => { setSelectedType(item); setSelectedTemplate(null); setGenerated(null); setShowTypeSelectorMobile(false) }}
                      className="w-full text-left px-4 py-2 flex items-center gap-2.5 transition-all duration-150 cursor-pointer"
                      style={{
                        background: selectedType?.id === item.id ? 'var(--theme-accent-bg)' : 'transparent',
                        borderLeft: selectedType?.id === item.id ? '2px solid var(--theme-accent)' : '2px solid transparent',
                      }}
                      onMouseEnter={e => { if (selectedType?.id !== item.id) e.currentTarget.style.background = 'var(--theme-accent-bg)' }}
                      onMouseLeave={e => { if (selectedType?.id !== item.id) e.currentTarget.style.background = 'transparent' }}
                    >
                      <item.icon size={12} style={{ color: selectedType?.id === item.id ? 'var(--theme-text)' : 'var(--theme-text-muted)', flexShrink: 0 }} />
                      <span className="text-[12px] leading-tight" style={{ color: selectedType?.id === item.id ? 'var(--theme-text)' : 'var(--theme-text-muted)' }}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      ) : (
        <div className="px-2 space-y-3">
          {/* Category Filter Pills */}
          <div className="flex gap-1 px-1">
            {['all', 'social', 'email'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setTemplateFilter(cat)}
                className={`flex-1 py-1 text-[9px] font-bold uppercase tracking-wider text-center border transition cursor-pointer ${
                  templateFilter === cat
                    ? 'bg-[#c81e3c] text-white border-[#c81e3c]'
                    : 'bg-[#10141f] text-slate-400 border-white/10 hover:text-white'
                }`}
                style={{ borderRadius: '0px' }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Social Templates Section */}
          {(templateFilter === 'all' || templateFilter === 'social') && (
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 px-2 block">
                Social Frameworks
              </span>
              {SOCIAL_TEMPLATES.map(tpl => {
                const isSelected = selectedTemplate?.id === tpl.id
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`w-full text-left p-2.5 transition border block cursor-pointer ${
                      isSelected
                        ? 'bg-[#c81e3c]/15 border-[#c81e3c] text-white'
                        : 'bg-[#10141f]/60 hover:bg-[#141926] border-white/5 text-slate-300'
                    }`}
                    style={{ borderRadius: '0px' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-white truncate">{tpl.title}</span>
                      <span className="text-[8px] font-mono px-1 py-0.2 bg-white/10 text-slate-300">
                        {tpl.platform}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>
                  </button>
                )
              })}
            </div>
          )}

          {/* Email Templates Section */}
          {(templateFilter === 'all' || templateFilter === 'email') && (
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 px-2 block">
                Email Frameworks
              </span>
              {EMAIL_TEMPLATES.map(tpl => {
                const isSelected = selectedTemplate?.id === tpl.id
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`w-full text-left p-2.5 transition border block cursor-pointer ${
                      isSelected
                        ? 'bg-[#c81e3c]/15 border-[#c81e3c] text-white'
                        : 'bg-[#10141f]/60 hover:bg-[#141926] border-white/5 text-slate-300'
                    }`}
                    style={{ borderRadius: '0px' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-white truncate">{tpl.title}</span>
                      <span className="text-[8px] font-mono px-1 py-0.2 bg-[#c81e3c]/20 text-[#ff8093]">
                        {tpl.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {tpl.description}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </>
  )

  return (
    <div className="flex flex-col md:flex-row h-full overflow-hidden w-full">
      {/* Mobile Selector Header/Toggle */}
      <div className="md:hidden flex items-center justify-between p-3 border-b flex-shrink-0" style={{ borderColor: 'var(--theme-border-color)', background: 'var(--theme-sidebar-bg)' }}>
        <div className="flex items-center gap-2">
          {selectedType ? (
            <>
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: PLATFORM_COLORS[selectedType.platform] || 'rgba(255,255,255,0.08)' }}>
                <selectedType.icon size={11} className="text-white/70" />
              </div>
              <span className="text-[13px] font-semibold text-white">{selectedType.label}</span>
            </>
          ) : (
            <span className="text-[13px] text-white/40">Select a content type...</span>
          )}
        </div>
        <button
          onClick={() => setShowTypeSelectorMobile(true)}
          className="text-[12px] font-semibold px-3 py-1.5 rounded-none border transition-all"
          style={{
            color: 'var(--theme-accent)',
            background: 'var(--theme-accent-bg)',
            borderColor: 'var(--theme-accent-border)',
          }}
        >
          Change Type
        </button>
      </div>

      {/* ─── Left: Type selector ────────────────────────────────── */}
      <div className="hidden md:block w-56 border-r flex-shrink-0 overflow-y-auto py-4" style={{ borderColor: 'var(--theme-border-color)' }}>
        {renderSelectorItems()}
      </div>

      {/* Mobile Type Selector Drawer/Bottom Sheet */}
      {showTypeSelectorMobile && (
        <>
          <div
            className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setShowTypeSelectorMobile(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-[1001] max-h-[80vh] rounded-t-2xl border-t p-4 flex flex-col md:hidden animate-slide-up"
            style={{
              background: 'var(--theme-sidebar-bg)',
              borderColor: 'var(--theme-border-color)',
              animation: 'slideUpMobile 0.25s ease-out forwards',
            }}
          >
            <style>{`
              @keyframes slideUpMobile {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
              }
            `}</style>
            <div className="w-12 h-1 bg-white/10 rounded-none mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-[14px] font-bold text-white">Choose Content Type</span>
              <button onClick={() => setShowTypeSelectorMobile(false)} className="text-[12px] text-white/40 hover:text-white">Close</button>
            </div>
            <div className="flex-1 overflow-y-auto pb-6">
              {renderSelectorItems()}
            </div>
          </div>
        </>
      )}

      {/* ─── Right: Generator ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selectedType ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            {/* Visual platform preview cards */}
            <div className="flex gap-3 mb-8">
              {[
                { color: 'rgba(225,48,108,0.15)', border: 'rgba(225,48,108,0.25)', label: 'IG', lines: [70, 55, 85] },
                { color: 'rgba(29,161,242,0.12)', border: 'rgba(29,161,242,0.2)', label: 'X', lines: [85, 60, 70, 45] },
                { color: 'rgba(255,0,0,0.1)', border: 'rgba(255,0,0,0.18)', label: 'YT', lines: [65, 80] },
              ].map((card, i) => (
                <div key={i} className="w-28 rounded-none border p-3 text-left" style={{ background: card.color, borderColor: card.border }}>
                  <div className="text-[9px] font-bold mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{card.label}</div>
                  <div className="space-y-1.5">
                    {card.lines.map((w, j) => (
                      <div key={j} className="h-1.5 rounded-none" style={{ width: `${w}%`, background: 'rgba(255,255,255,0.15)' }} />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-1">
                    <Sparkles size={9} style={{ color: 'rgba(255,255,255,0.3)' }} />
                    <div className="h-1 flex-1 rounded-none" style={{ background: 'rgba(255,255,255,0.1)' }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="w-10 h-10 rounded-none bg-white flex items-center justify-center mb-4">
              <Sparkles size={16} className="text-black" />
            </div>
            <h3 className="forge-heading mb-2" style={{ fontSize: '20px', letterSpacing: '-0.03em' }}>AI Content Studio</h3>
            <p className="text-[13px] max-w-sm" style={{ color: 'var(--theme-text-muted)', lineHeight: '1.5' }}>
              Choose a format from the left or select a proven copywriting template for Socials &amp; Email to generate creator-ready assets for {productName}.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 justify-center max-w-md">
              {[
                { label: 'Hook-Story-Offer (Social)', tplId: 'tpl-hso' },
                { label: 'Launch Email (Official)', tplId: 'tpl-email-launch' },
                { label: 'Problem-Agitate-Solve', tplId: 'tpl-pas' },
                { label: 'Soap Opera Sequence', tplId: 'tpl-email-soap' },
                { label: 'Closing Tonight Urgency', tplId: 'tpl-email-closing' },
                { label: '5-Pillar Masterclass', tplId: 'tpl-thread' },
              ].map(item => {
                const matchedTpl = ALL_TEMPLATES.find(t => t.id === item.tplId)
                return (
                  <button 
                    key={item.tplId}
                    type="button"
                    onClick={() => {
                      if (matchedTpl) handleSelectTemplate(matchedTpl)
                    }}
                    className="text-[11px] px-3 py-1.5 rounded-none font-medium transition cursor-pointer hover:border-white/30 hover:text-white flex items-center gap-1.5" 
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <Sparkles size={10} className="text-[#c81e3c]" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0 gap-3" style={{ borderColor: 'var(--theme-border-color)' }}>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-none flex items-center justify-center" style={{ background: PLATFORM_COLORS[selectedType.platform] || 'rgba(255,255,255,0.08)' }}>
                  <selectedType.icon size={13} className="text-white/70" />
                </div>
                <div>
                  <p className="text-[13px] sm:text-[14px] font-semibold text-white">{selectedType.label}</p>
                  <p className="text-[10px] sm:text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>{selectedType.platform}</p>
                </div>
              </div>

              {/* Top Bar Controls: Tone selector & AI Setup */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px]" style={{ color: 'var(--theme-text-muted)' }}>Tone:</span>
                  <div className="flex gap-1 flex-wrap">
                    {TONE_OPTIONS.map(t => (
                      <button key={t} onClick={() => setTone(t)}
                        className="text-[10px] sm:text-[11px] px-2.5 py-1 rounded-none transition-all duration-150 font-semibold cursor-pointer"
                        style={{
                          background: tone === t ? '#c81e3c' : 'rgba(255,255,255,0.05)',
                          color: tone === t ? '#ffffff' : 'rgba(255,255,255,0.6)',
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Setup Trigger Button */}
                <button
                  type="button"
                  onClick={() => setAiSetupOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-white bg-[#141926] hover:bg-[#1d2436] border border-white/10 rounded-none transition cursor-pointer"
                  style={{ borderRadius: '0px' }}
                >
                  <Sliders size={12} className="text-[#c81e3c]" />
                  <span>AI Setup</span>
                  {aiSetupConfig.customVoice && (
                    <span className="w-1.5 h-1.5 rounded-none bg-emerald-400" title="Custom Voice Directive Active" />
                  )}
                </button>
              </div>
            </div>

            {/* Input area with Active Template Banner */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0 space-y-2.5" style={{ borderColor: 'var(--theme-border-color)' }}>
              {selectedTemplate && (
                <div 
                  className="p-2.5 bg-[#c81e3c]/10 border border-[#c81e3c]/30 rounded-none flex items-center justify-between gap-3 flex-wrap animate-fade-in-down"
                  style={{ borderRadius: '0px' }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles size={13} className="text-[#ff8093] shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-white truncate">{selectedTemplate.title}</span>
                        <span className="px-1.5 py-0.2 rounded-none text-[8px] font-mono uppercase bg-[#c81e3c] text-white">
                          {selectedTemplate.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 font-mono truncate">{selectedTemplate.formula}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleLoadBlueprint(selectedTemplate)}
                      className="px-2.5 py-1 text-[10px] font-bold text-white bg-[#0c1017] hover:bg-[#141926] border border-white/15 rounded-none transition cursor-pointer"
                      style={{ borderRadius: '0px' }}
                    >
                      Load Blueprint
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSelectedTemplate(null); setInput('') }}
                      className="p-1 text-slate-400 hover:text-white bg-transparent border-0 cursor-pointer"
                      title="Clear template"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-[11px] sm:text-[12px]" style={{ color: 'var(--theme-text-muted)' }}>
                  {selectedTemplate ? 'Template Context & Angles' : 'Context (optional)'}
                </p>
                {selectedTemplate && (
                  <span className="text-[10px] font-mono text-[#ff8093]">
                    Template Framework Applied
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div
                  className="flex-1 rounded-none border px-3 sm:px-4 py-2 sm:py-2.5 transition-all duration-200 focus-within:border-white/20"
                  style={{ background: 'var(--theme-card-bg)', borderColor: 'var(--theme-border-color)' }}
                >
                  <input
                    className="forge-input text-[12px] sm:text-[13px] w-full bg-transparent outline-none rounded-none"
                    placeholder={`e.g. "focus on the community angle" or paste your idea here...`}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                  />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="px-5 py-2 sm:py-2.5 text-xs font-bold uppercase tracking-wider rounded-none transition cursor-pointer flex items-center justify-center gap-2 shadow-md hover:opacity-95 disabled:opacity-50"
                  style={{ background: '#c81e3c', color: '#ffffff' }}
                >
                  {isGenerating ? <RefreshCw size={13} className="animate-spin text-white" /> : <Sparkles size={13} className="text-white" />}
                  <span className="text-white">Generate</span>
                </button>
              </div>
            </div>

            {/* Output */}
            <div className="flex-1 flex flex-col overflow-y-auto px-6 py-4">


              {isGenerating ? (
                <div className="flex items-center gap-3 py-8">
                  <div className="w-6 h-6 rounded-none bg-white flex items-center justify-center">
                    <Sparkles size={11} className="text-black" />
                  </div>
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-none animate-pulse" style={{ background: '#c81e3c', animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Writing your {selectedType.label}...</span>
                  <button
                    onClick={() => {
                      cancelBgJob(STUDIO_JOB)
                      setIsGenerating(false)
                    }}
                    className="ml-4 text-[11px] font-semibold text-white/50 hover:text-white border border-white/10 hover:border-white/25 px-2.5 py-1 rounded-none transition-all"
                  >
                    Cancel
                  </button>
                </div>
              ) : generated ? (
                <div>
                  {/* Output card */}
                  <div
                    className="rounded-none border p-5 mb-4 relative group flex flex-col"
                    style={{ background: 'var(--theme-card-bg)', borderColor: 'var(--theme-border-color)' }}
                  >
                    <pre className="text-[13px] whitespace-pre-wrap leading-relaxed flex-1" style={{ color: 'var(--theme-text)', fontFamily: 'inherit', opacity: 0.85 }}>
                      {generated}
                    </pre>
                    
                    <div className="mt-4 pt-3 border-t flex items-center justify-between text-[11px]" style={{ borderColor: 'rgba(255,255,255,0.05)', color: 'var(--theme-text-muted)' }}>
                      <span>Word count: {generated.trim().split(/\s+/).filter(Boolean).length}</span>
                      <span>Character count: {generated.length}</span>
                    </div>
                  </div>

                  {/* Action bar */}
                  <div className="flex flex-wrap gap-2">
                    <button onClick={handleCopy} className="forge-btn-secondary text-[12px] py-2 px-4 gap-1.5 rounded-none">
                      {copied ? <Check size={12} /> : <Copy size={12} />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                    <button onClick={handleGenerate} className="forge-btn-secondary text-[12px] py-2 px-4 gap-1.5 rounded-none">
                      <RefreshCw size={12} />
                      Regenerate
                    </button>
                    <button onClick={() => handleRefine('make it bolder, more high-energy, and direct')} className="forge-btn-secondary text-[12px] py-2 px-4 rounded-none">Make bolder</button>
                    <button onClick={() => handleRefine('shorten it significantly, making it concise and punchy')} className="forge-btn-secondary text-[12px] py-2 px-4 rounded-none">Shorten</button>
                    <button onClick={() => handleRefine('simplify the language to be extremely clear and easy to read')} className="forge-btn-secondary text-[12px] py-2 px-4 rounded-none">Simplify</button>

                    {/* Repurpose */}
                    <div className="ml-auto flex gap-2">
                      <button
                        onClick={handleSchedulePost}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-none transition cursor-pointer flex items-center gap-1.5 shadow-md hover:opacity-95"
                        style={{ background: '#c81e3c', color: '#ffffff' }}
                      >
                        <Calendar size={12} className="text-white" />
                        <span className="text-white">{scheduled ? 'Scheduled ✓' : 'Schedule post'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Adapt to other platforms */}
                  <div className="mt-5">
                    <p className="text-[12px] mb-3" style={{ color: 'var(--theme-text-muted)' }}>Adapt for other platforms</p>
                    <div className="flex flex-wrap gap-2">
                      {['Instagram', 'X / Twitter', 'LinkedIn', 'TikTok', 'Email', 'YouTube'].map(p => (
                        <button key={p}
                          className="text-[11px] px-3 py-1.5 rounded-none transition-all duration-150 border border-white/10 bg-white/[0.04] text-white/70 hover:text-white hover:border-white/30"
                          onClick={() => handleAdaptPlatform(p)}
                        >
                          → {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock size={13} style={{ color: 'var(--theme-text-muted)' }} />
                      <p className="text-[13px] font-medium" style={{ color: 'var(--theme-text-muted)' }}>Recent outputs</p>
                      {recentOutputs.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-none font-bold bg-[#c81e3c] text-white">
                          {recentOutputs.length}
                        </span>
                      )}
                    </div>
                    {recentOutputs.length > 0 && (
                      <button
                        onClick={() => { saveRecentOutputs([]); if (triggerToast) triggerToast('History cleared', 'info') }}
                        className="text-[10px] px-2 py-1 rounded-none transition-all"
                        style={{ color: 'var(--theme-text-muted)', border: '1px solid var(--theme-border-color)' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; e.currentTarget.style.color = 'rgba(239,68,68,0.8)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--theme-border-color)'; e.currentTarget.style.color = 'var(--theme-text-muted)' }}
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {recentOutputs.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-10 h-10 rounded-none mx-auto mb-3 flex items-center justify-center bg-white/[0.04] border border-white/10">
                        <Sparkles size={15} style={{ color: 'var(--theme-text-muted)' }} />
                      </div>
                      <p className="text-[12px] mb-1" style={{ color: 'var(--theme-text-muted)' }}>No outputs yet</p>
                      <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.25)' }}>Hit Generate above to create your first piece of content</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {recentOutputs.map(entry => {
                        const isOpen = expandedOutputId === entry.id
                        const preview = entry.content.split('\n')[0].substring(0, 90) + (entry.content.length > 90 ? '…' : '')
                        const timeAgo = (() => {
                          const diff = Date.now() - new Date(entry.timestamp).getTime()
                          const mins = Math.floor(diff / 60000)
                          if (mins < 1) return 'just now'
                          if (mins < 60) return `${mins}m ago`
                          const hrs = Math.floor(mins / 60)
                          if (hrs < 24) return `${hrs}h ago`
                          return `${Math.floor(hrs / 24)}d ago`
                        })()

                        return (
                          <div
                            key={entry.id}
                            className="rounded-none border transition-all duration-200"
                            style={{
                              background: isOpen ? 'var(--theme-card-bg)' : 'transparent',
                              borderColor: isOpen ? 'rgba(200,30,60,0.4)' : 'var(--theme-border-color)',
                            }}
                          >
                            {/* Collapsed header */}
                            <button
                              onClick={() => setExpandedOutputId(isOpen ? null : entry.id)}
                              className="w-full flex items-center gap-3 p-3.5 text-left transition-colors"
                              onMouseEnter={e => { if (!isOpen) e.currentTarget.parentElement.style.borderColor = 'rgba(200,30,60,0.3)' }}
                              onMouseLeave={e => { if (!isOpen) e.currentTarget.parentElement.style.borderColor = 'var(--theme-border-color)' }}
                            >
                              <ChevronRight
                                size={12}
                                style={{
                                  color: 'var(--theme-text-muted)',
                                  transition: 'transform 0.2s',
                                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-none flex-shrink-0"
                                style={{ background: PLATFORM_COLORS[entry.platform] || 'rgba(255,255,255,0.08)', color: '#ffffff' }}
                              >
                                {entry.typeLabel}
                              </span>
                              <p className="text-[12px] flex-1 truncate" style={{ color: isOpen ? 'var(--theme-text)' : 'var(--theme-text-muted)' }}>
                                {preview}
                              </p>
                              <span className="text-[10px] flex-shrink-0" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                {timeAgo}
                              </span>
                            </button>

                            {/* Expanded content */}
                            {isOpen && (
                              <div className="px-4 pb-4 animate-fade-in-down">
                                <div
                                  className="rounded-none p-4 mb-3 max-h-64 overflow-y-auto"
                                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
                                >
                                  <pre className="text-[12px] whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--theme-text)', fontFamily: 'inherit', opacity: 0.85 }}>
                                    {entry.content}
                                  </pre>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleCopy(entry.content) }}
                                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-none border border-white/10 hover:border-white/25 text-white flex items-center gap-1"
                                  >
                                    <Copy size={11} /> Copy
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleScheduleEntry(entry) }}
                                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-none flex items-center gap-1 shadow-sm"
                                    style={{ background: '#c81e3c', color: '#ffffff' }}
                                  >
                                    <Calendar size={11} className="text-white" /> <span className="text-white">Add to Calendar</span>
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedType({ id: entry.typeId, label: entry.typeLabel, platform: entry.platform, icon: FileText }); setGenerated(entry.content) }}
                                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-none border border-white/10 hover:border-white/25 text-white/70 hover:text-white flex items-center gap-1"
                                  >
                                    <RefreshCw size={11} /> Reopen
                                  </button>
                                  <div className="ml-auto">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); removeFromRecent(entry.id) }}
                                      className="text-[11px] p-1.5 rounded-none transition-all hover:bg-red-500/20 text-white/40 hover:text-red-400"
                                    >
                                      <Trash2 size={12} />
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
              )}
            </div>
          </div>
        )}
      </div>
      {/* ── AI ENGINE & BRAND VOICE SETUP MODAL ── */}
      {aiSetupOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="w-full max-w-lg bg-[#0c1017] border border-white/15 p-5 space-y-4 shadow-2xl rounded-none animate-fade-in-down"
            style={{ borderRadius: '0px' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sliders size={16} className="text-[#c81e3c]" />
                <div>
                  <h3 className="text-sm font-bold text-white">AI Studio Engine &amp; Brand Voice Setup</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Fine-tune generation parameters, models, and creator persona</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setAiSetupOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer bg-transparent border-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
              {/* Model & Engine */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  ACTIVE AI GENERATION ENGINE
                </label>
                <select
                  value={aiSetupConfig.provider || 'gemini'}
                  onChange={(e) => setAiSetupConfig(prev => ({ ...prev, provider: e.target.value }))}
                  className="w-full text-xs bg-[#10141f] border border-white/10 px-3 py-2 text-white outline-none focus:border-[#c81e3c] rounded-none"
                  style={{ borderRadius: '0px' }}
                >
                  <option value="gemini">Google Gemini 2.5 Flash (Recommended · Cloud Proxy Active)</option>
                  <option value="openai">OpenAI GPT-4o (High Nuance Copywriting)</option>
                  <option value="anthropic">Claude 3.5 Sonnet (Long-form Prose &amp; Emails)</option>
                  <option value="cloud">CoLaunch Cloud AI Proxy (Instant)</option>
                </select>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Cloud AI Active (~320ms latency)
                  </span>
                  <button
                    type="button"
                    onClick={() => { setAiSetupOpen(false); setApiModalOpen(true) }}
                    className="text-[#ff8093] hover:underline cursor-pointer bg-transparent border-0 text-[10px]"
                  >
                    Configure Custom API Keys →
                  </button>
                </div>
              </div>

              {/* Tone Preset */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">DEFAULT TONE PRESET</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
                  {TONE_OPTIONS.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAiSetupConfig(prev => ({ ...prev, tone: t }))}
                      className={`py-1 text-[10px] font-bold text-center border rounded-none transition cursor-pointer ${
                        (aiSetupConfig.tone || tone) === t
                          ? 'bg-[#c81e3c] text-white border-[#c81e3c]'
                          : 'bg-[#10141f] text-slate-400 border-white/10 hover:text-white'
                      }`}
                      style={{ borderRadius: '0px' }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Brand Voice Directives */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-slate-400">
                    CREATOR VOICE DIRECTIVES (PROMPT INJECTION)
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Custom Rules</span>
                </div>
                <textarea
                  rows={3}
                  value={aiSetupConfig.customVoice || ''}
                  onChange={(e) => setAiSetupConfig(prev => ({ ...prev, customVoice: e.target.value }))}
                  placeholder="e.g. Write with high conviction. Use short sentences under 15 words. No buzzwords. Emphasize practical frameworks and real numbers."
                  className="w-full text-xs bg-[#10141f] border border-white/10 px-3 py-2 text-white outline-none focus:border-[#c81e3c] rounded-none font-mono"
                  style={{ borderRadius: '0px' }}
                />
                {/* Quick preset chips */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  <span className="text-[9px] text-slate-500 font-mono self-center mr-1">Presets:</span>
                  {[
                    { label: 'Punchy & Direct', prompt: 'Short punchy sentences. High conviction. No corporate buzzwords. Emphasize tangible results.' },
                    { label: 'Educational Authority', prompt: 'Authoritative and pedagogical tone. Break complex insights into 3 step-by-step points with concrete examples.' },
                    { label: 'Vulnerable Storyteller', prompt: 'Authentic founder voice. Share the honest struggles and turning points before revealing the lesson.' },
                    { label: 'Urgent Launch', prompt: 'High urgency, decisive FOMO, emphasize locked-in founding pricing and immediate enrollment.' },
                  ].map(chip => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => setAiSetupConfig(prev => ({ ...prev, customVoice: chip.prompt }))}
                      className="text-[9px] px-2 py-0.5 bg-[#141926] hover:bg-[#1d2538] text-slate-300 border border-white/10 rounded-none transition cursor-pointer"
                      style={{ borderRadius: '0px' }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Audience Persona */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  TARGET AUDIENCE PERSONA
                </label>
                <input
                  type="text"
                  value={aiSetupConfig.audiencePersona || ''}
                  onChange={(e) => setAiSetupConfig(prev => ({ ...prev, audiencePersona: e.target.value }))}
                  placeholder="e.g. Ambitious creators, builders, and professionals in gaming"
                  className="w-full text-xs bg-[#10141f] border border-white/10 px-3 py-2 text-white outline-none focus:border-[#c81e3c] rounded-none"
                  style={{ borderRadius: '0px' }}
                />
              </div>

              {/* Creativity / Temperature */}
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  CREATIVITY &amp; TEMPERATURE
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'precise', label: 'Precise (0.2)', desc: 'Strict structure' },
                    { id: 'balanced', label: 'Balanced (0.7)', desc: 'Natural voice (Default)' },
                    { id: 'creative', label: 'Creative (0.95)', desc: 'Unexpected analogies' },
                  ].map(opt => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAiSetupConfig(prev => ({ ...prev, creativity: opt.id }))}
                      className={`p-2 text-left border rounded-none transition cursor-pointer ${
                        (aiSetupConfig.creativity || 'balanced') === opt.id
                          ? 'bg-[#c81e3c]/15 border-[#c81e3c] text-white'
                          : 'bg-[#10141f] border-white/10 text-slate-400 hover:text-white'
                      }`}
                      style={{ borderRadius: '0px' }}
                    >
                      <p className="text-[10px] font-bold">{opt.label}</p>
                      <p className="text-[9px] text-slate-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Formatting Toggles */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiSetupConfig.includeEmojis !== false}
                    onChange={(e) => setAiSetupConfig(prev => ({ ...prev, includeEmojis: e.target.checked }))}
                    className="accent-[#c81e3c]"
                  />
                  <span>Include emojis in copy</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={aiSetupConfig.includeHashtags !== false}
                    onChange={(e) => setAiSetupConfig(prev => ({ ...prev, includeHashtags: e.target.checked }))}
                    className="accent-[#c81e3c]"
                  />
                  <span>Include hashtags on posts</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setAiSetupOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-300 bg-[#151b2a] border border-white/10 rounded-none transition cursor-pointer"
                style={{ borderRadius: '0px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveAiSetup(aiSetupConfig)}
                className="px-4 py-1.5 text-xs font-bold text-white rounded-none transition cursor-pointer shadow-sm border-0"
                style={{ background: '#c81e3c', color: '#ffffff', borderRadius: '0px' }}
              >
                Save &amp; Apply Setup
              </button>
            </div>
          </div>
        </div>
      )}
      {showKeys && <ApiKeysModal onClose={() => setShowKeys(false)} defaultTab="ai" />}
    </div>
  )
}

