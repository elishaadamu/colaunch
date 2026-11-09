import { useState, useEffect, useCallback } from 'react'
import { useForge } from '../../App'
import {
  Package, Plus, ExternalLink, Users, DollarSign, BarChart2,
  Sparkles, RefreshCw, Check, ChevronRight, Radio, Edit3, Copy,
  Volume2, AlertCircle, Layers, Trash2, X, Calendar, Settings,
  CheckCircle, FileText, ArrowRight
} from 'lucide-react'
import { generateStudioContent } from '../../services/ai'
import { generateAuthenticFallbackCopy } from '../../utils/authenticStudioCopy'

const AVAILABLE_TEMPLATES = [
  { type: 'live', icon: Radio, label: 'Live events & AMAs', description: 'Host interactive webinars, live Q&A, and mastermind calls' },
  { type: 'digital', icon: DollarSign, label: 'Digital products & toolkits', description: 'Sell downloadable templates, toolkits, and swipe files' },
  { type: 'coaching', icon: BarChart2, label: 'Coaching tier', description: '1:1 implementation sprint or small group strategy advisory' },
  { type: 'newsletter', icon: Package, label: 'Paid weekly newsletter', description: 'Exclusive premium briefing and industry reports for members' },
]

const FORGE_SUGGESTIONS = [
  { label: 'Write offer page copy', icon: Sparkles },
  { label: 'Generate FAQ section', icon: Sparkles },
  { label: 'Create onboarding sequence', icon: Sparkles },
  { label: 'Write product description', icon: Sparkles },
]

export default function Products() {
  const { 
    creatorData, 
    triggerToast, 
    setActiveTab, 
    dashboardData, 
    saveDashboardData,
    syncSessionToDb
  } = useForge()

  const brandRed = '#c81e3c'
  const rawHandle = creatorData?.handle || 'creator'
  const cleanHandle = rawHandle.replace(/^@+/, '')
  const productName = (creatorData?.productName && creatorData.productName.trim()) 
    || (creatorData?.blueprint?.name && creatorData.blueprint.name.trim()) 
    || 'Creator Academy'
  const blueprint = creatorData?.blueprint || { type: 'Web App', name: productName }

  const features = (Array.isArray(creatorData?.features) && creatorData.features.length > 0)
    ? creatorData.features
    : (Array.isArray(blueprint.features) && blueprint.features.length > 0)
      ? blueprint.features
      : ['Interactive Community Network', 'Step-by-Step Curriculum', 'Weekly Live Q&A Sessions', 'Downloadable Templates & Systems']

  // ── 1. Real Members Count ──
  const getMembersKey = useCallback(() => `forge_${cleanHandle}_community_members`, [cleanHandle])
  const getVisitsKey = useCallback(() => `forge_${cleanHandle}_community_visits`, [cleanHandle])
  const getModulesKey = useCallback(() => `forge_${cleanHandle}_product_modules`, [cleanHandle])
  const getPricingKey = useCallback(() => `forge_${cleanHandle}_product_pricing`, [cleanHandle])

  const [membersCount, setMembersCount] = useState(() => {
    try {
      const cached = localStorage.getItem(`forge_${cleanHandle}_community_members`)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed)) {
          const valid = parsed.filter(m => m.name !== 'Alex Rivera' && m.name !== 'Sarah Lin')
          return valid.length
        }
      }
    } catch (_) {}
    return 0
  })

  // ── 2. Real Traffic / Page Visits ──
  const [visitsCount, setVisitsCount] = useState(() => {
    try {
      return parseInt(localStorage.getItem(`forge_${cleanHandle}_community_visits`) || '0', 10)
    } catch (_) {
      return 0
    }
  })

  // Real-time synchronization for members & visits
  useEffect(() => {
    const syncRealData = () => {
      try {
        const memCached = localStorage.getItem(getMembersKey())
        if (memCached) {
          const parsed = JSON.parse(memCached)
          if (Array.isArray(parsed)) {
            const valid = parsed.filter(m => m.name !== 'Alex Rivera' && m.name !== 'Sarah Lin')
            setMembersCount(valid.length)
            try { localStorage.setItem('forge_products_members', valid.length.toString()) } catch (_) {}
          }
        } else {
          setMembersCount(0)
          try { localStorage.setItem('forge_products_members', '0') } catch (_) {}
        }
      } catch (_) {}

      try {
        const v = parseInt(localStorage.getItem(getVisitsKey()) || '0', 10)
        setVisitsCount(v)
      } catch (_) {}
    }

    syncRealData()

    const onMemberJoined = () => syncRealData()
    window.addEventListener('forge_member_joined', onMemberJoined)
    window.addEventListener('storage', syncRealData)
    return () => {
      window.removeEventListener('forge_member_joined', onMemberJoined)
      window.removeEventListener('storage', syncRealData)
    }
  }, [cleanHandle, getMembersKey, getVisitsKey])

  // ── 3. Real Configurable Pricing ──
  const [pricing, setPricing] = useState(() => {
    try {
      const cached = localStorage.getItem(getPricingKey())
      if (cached) return JSON.parse(cached)
    } catch (_) {}
    const initMonthly = creatorData?.pricing ? parseInt(String(creatorData.pricing).replace(/[^0-9]/g, ''), 10) || 29 : 29
    return {
      monthly: initMonthly,
      oneTime: 99,
      currency: '$'
    }
  })

  const [pricingModalOpen, setPricingModalOpen] = useState(false)
  const [editMonthlyPrice, setEditMonthlyPrice] = useState(pricing.monthly)
  const [editOneTimePrice, setEditOneTimePrice] = useState(pricing.oneTime)

  const handleSavePricing = () => {
    const updated = {
      ...pricing,
      monthly: Math.max(1, parseInt(editMonthlyPrice, 10) || 29),
      oneTime: Math.max(1, parseInt(editOneTimePrice, 10) || 99)
    }
    setPricing(updated)
    try {
      localStorage.setItem(getPricingKey(), JSON.stringify(updated))
    } catch (_) {}
    if (saveDashboardData) {
      saveDashboardData('products', { pricing: updated, modules, synced_at: new Date().toISOString() })
    }
    setPricingModalOpen(false)
    if (triggerToast) triggerToast(`Pricing updated: $${updated.monthly}/mo membership!`, 'success')
  }

  // ── 4. Real Product Modules ──
  const buildDefaultModules = useCallback(() => {
    const list = []
    features.forEach((feat, index) => {
      const fLower = feat.toLowerCase()
      let type = 'custom'
      let icon = 'Package'
      let desc = `Active module configured for ${productName}`
      let cta = 'Manage Module'
      let items = ['Overview & Getting Started Guide', 'Core Implementation Blueprint']

      if (fLower.includes('tool') || fLower.includes('software') || fLower.includes('calculator') || fLower.includes('tracker')) {
        type = 'tool'
        icon = 'Layout'
        desc = 'Interactive software utility solving recurring audience workflows'
        cta = 'Configure Software Engine'
        items = ['Interactive Estimation Engine', 'Verified Benchmark Archive', 'Scenario Modeling Solver']
      } else if (fLower.includes('forum') || fLower.includes('community')) {
        type = 'community'
        icon = 'Users'
        desc = 'Threaded discussions, member directory & announcements'
        cta = 'Open Community Forum'
        items = ['General Discussion', 'Introductions', 'Feedback & Q&A']
      } else if (fLower.includes('course') || fLower.includes('curriculum') || fLower.includes('vault') || fLower.includes('video')) {
        type = 'tool'
        icon = 'Package'
        desc = 'Software application modules, guides & tool walkthroughs'
        cta = 'Manage Tool Modules'
        items = ['Core Architecture & Setup', 'Advanced Workflow Engine', 'Community Benchmark Database']
      } else if (fLower.includes('live') || fLower.includes('ama') || fLower.includes('event')) {
        type = 'live'
        icon = 'Radio'
        desc = 'Scheduled live streams, founder Q&A sessions & recordings'
        cta = 'Schedule Next Session'
        items = ['Weekly Member Q&A (Thursdays 12 PM)', 'Monthly Masterclass Workshop']
      } else if (fLower.includes('tier') || fLower.includes('coaching') || fLower.includes('perk')) {
        type = 'coaching'
        icon = 'BarChart2'
        desc = 'Direct 1:1 or small group implementation sprint'
        cta = 'Configure Coaching'
        items = ['1:1 Strategy Intake Form', 'Private Slack/Discord Channel', 'Weekly Milestone Reviews']
      } else if (fLower.includes('download') || fLower.includes('template') || fLower.includes('drop') || fLower.includes('toolkit')) {
        type = 'digital'
        icon = 'DollarSign'
        desc = 'Downloadable templates, swipe files, and exclusive toolkits'
        cta = 'Manage Downloads'
        items = ['Notion Workspace System', 'Figma Wireframe Kit', 'Checklist Spreadsheet']
      } else if (fLower.includes('newsletter') || fLower.includes('briefing')) {
        type = 'newsletter'
        icon = 'Package'
        desc = 'Exclusive weekly member dispatch and industry breakdowns'
        cta = 'Draft Newsletter'
        items = ['Issue #1: The Founding Playbook', 'Issue #2: Member Highlights']
      }

      list.push({
        id: `module-${index + 1}`,
        type,
        icon,
        label: feat,
        description: desc,
        status: 'Active',
        access: 'Included in Membership',
        cta,
        items
      })
    })

    list.push({
      id: 'offer-page',
      type: 'offer-page',
      icon: 'ExternalLink',
      label: 'Offer Page & Checkout',
      description: 'Public landing portal & conversion-optimized checkout link',
      status: 'Live',
      access: 'Public',
      cta: 'Copy Offer Link',
      items: [`https://${cleanHandle}.co-launch.app`]
    })

    return list
  }, [features, productName, cleanHandle])

  const [modules, setModules] = useState(() => {
    try {
      const cached = localStorage.getItem(`forge_${cleanHandle}_product_modules`)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (_) {}
    return buildDefaultModules()
  })

  // Hydrate from MongoDB Atlas
  const hasHydratedRef = useState(false)
  useEffect(() => {
    if (dashboardData?.products_data?.modules && Array.isArray(dashboardData.products_data.modules) && dashboardData.products_data.modules.length > 0) {
      setModules(dashboardData.products_data.modules)
    }
    if (dashboardData?.products_data?.pricing) {
      setPricing(dashboardData.products_data.pricing)
    }
  }, [dashboardData?.products_data])

  const saveModules = (updated) => {
    setModules(updated)
    try {
      localStorage.setItem(getModulesKey(), JSON.stringify(updated))
    } catch (_) {}
    if (saveDashboardData) {
      saveDashboardData('products', { modules: updated, pricing, synced_at: new Date().toISOString() })
    }
  }

  // Module Modals State
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [newModTitle, setNewModTitle] = useState('')
  const [newModDesc, setNewModDesc] = useState('')
  const [newModType, setNewModType] = useState('tool')

  const [editingModule, setEditingModule] = useState(null)
  const [inspectingModule, setInspectingModule] = useState(null)
  const [newItemText, setNewItemText] = useState('')

  const handleAddModule = (typePreset = null) => {
    const selectedType = typePreset || newModType
    let iconName = 'Package'
    let defaultTitle = newModTitle || 'New Product Module'
    let defaultDesc = newModDesc || `Interactive module for ${productName}`
    let defaultCta = 'Manage Module'
    let defaultItems = ['Overview & Getting Started']

    if (selectedType === 'live') {
      iconName = 'Radio'
      defaultTitle = newModTitle || 'Live Sessions & Masterclasses'
      defaultDesc = newModDesc || 'Interactive live streams, weekly AMAs, and workshop replays'
      defaultCta = 'Schedule Session'
      defaultItems = ['Monthly Strategy AMA', 'Guest Workshop Replay']
    } else if (selectedType === 'digital') {
      iconName = 'DollarSign'
      defaultTitle = newModTitle || 'Digital Assets & Toolkits'
      defaultDesc = newModDesc || 'Downloadable Notion templates, swipe files, and guides'
      defaultCta = 'Manage Files'
      defaultItems = ['Founding Member Toolkit (.zip)', 'Workflow Checklist']
    } else if (selectedType === 'coaching') {
      iconName = 'BarChart2'
      defaultTitle = newModTitle || 'Private Coaching Tier'
      defaultDesc = newModDesc || '1:1 strategy calls and direct messaging access'
      defaultCta = 'Configure Tier'
      defaultItems = ['Monthly 45-min Zoom Call', 'Private Support Channel']
    } else if (selectedType === 'newsletter') {
      iconName = 'Package'
      defaultTitle = newModTitle || 'Weekly Member Dispatch'
      defaultDesc = newModDesc || 'Exclusive editorial briefing delivered to member inboxes'
      defaultCta = 'Draft Issue'
      defaultItems = ['Issue #1: Strategy Roadmap', 'Issue #2: Execution Tactics']
    }

    const newMod = {
      id: `module-${Date.now()}`,
      type: selectedType,
      icon: iconName,
      label: defaultTitle,
      description: defaultDesc,
      status: 'Active',
      access: 'Included in Membership',
      cta: defaultCta,
      items: defaultItems
    }

    const updated = [newMod, ...modules]
    saveModules(updated)
    setAddModalOpen(false)
    setNewModTitle('')
    setNewModDesc('')
    if (triggerToast) triggerToast(`Module "${defaultTitle}" added to product suite!`, 'success')
  }

  const handleDeleteModule = (id) => {
    const updated = modules.filter(m => m.id !== id)
    saveModules(updated)
    if (triggerToast) triggerToast('Module removed from suite', 'info')
  }

  const handleToggleModuleStatus = (id) => {
    const updated = modules.map(m => {
      if (m.id === id) {
        const nextStatus = m.status === 'Active' ? 'Draft' : 'Active'
        return { ...m, status: nextStatus }
      }
      return m
    })
    saveModules(updated)
  }

  const handleAddItemToModule = (moduleId) => {
    if (!newItemText.trim()) return
    const updated = modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, items: [...(m.items || []), newItemText.trim()] }
      }
      return m
    })
    saveModules(updated)
    setNewItemText('')
    if (inspectingModule && inspectingModule.id === moduleId) {
      setInspectingModule(prev => ({ ...prev, items: [...(prev.items || []), newItemText.trim()] }))
    }
    if (triggerToast) triggerToast('Item added to module', 'success')
  }

  const handleRemoveItemFromModule = (moduleId, itemIndex) => {
    const updated = modules.map(m => {
      if (m.id === moduleId) {
        const newItems = (m.items || []).filter((_, idx) => idx !== itemIndex)
        return { ...m, items: newItems }
      }
      return m
    })
    saveModules(updated)
    if (inspectingModule && inspectingModule.id === moduleId) {
      setInspectingModule(prev => ({ ...prev, items: (prev.items || []).filter((_, idx) => idx !== itemIndex) }))
    }
  }

  const handleModuleCTA = (mod) => {
    if (mod.id === 'offer-page' || mod.type === 'offer-page') {
      const url = `https://${cleanHandle}.co-launch.app`
      navigator.clipboard.writeText(url)
      if (triggerToast) triggerToast('Offer page URL copied to clipboard!', 'success')
      return
    }

    if (mod.type === 'community' || mod.id.startsWith('community')) {
      if (triggerToast) triggerToast('Navigating to Community forum...', 'success')
      setTimeout(() => {
        setActiveTab && setActiveTab('community')
      }, 200)
      return
    }

    // Open module inspector modal
    setInspectingModule(mod)
  }

  // ── 5. Dynamic AI Copy Generator ──
  const [generating, setGenerating] = useState(null)
  const [generated, setGenerated] = useState({})
  const [copied, setCopied] = useState(null)
  const [activeTextLabel, setActiveTextLabel] = useState(null)
  const [scheduledLabel, setScheduledLabel] = useState(null)

  const handleGenerate = async (label) => {
    setGenerating(label)
    try {
      const contentType = { label, platform: 'Product' }
      const inputContext = `Generate ${label} for creator digital product "${productName}" in niche "${creatorData?.niche || 'Digital Creation'}". Monthly price: $${pricing.monthly}/mo. Deliver authentic, high-converting copy without placeholders.`
      
      let result = null
      try {
        result = await generateStudioContent(contentType, inputContext, creatorData, 'Confident')
      } catch (err) {
        console.warn('[Products] Server AI call failed, generating authentic synthesized copy:', err)
      }

      if (!result || !result.trim()) {
        result = generateAuthenticFallbackCopy(label, creatorData, 'Confident', inputContext)
      }

      setGenerated(prev => ({ ...prev, [label]: result }))
      setActiveTextLabel(label)
      if (triggerToast) triggerToast(`Generated copy for ${label}`, 'success')
    } catch (e) {
      const fallback = generateAuthenticFallbackCopy(label, creatorData, 'Confident')
      setGenerated(prev => ({ ...prev, [label]: fallback }))
      setActiveTextLabel(label)
      if (triggerToast) triggerToast(`Drafted tailored copy for ${label}`, 'success')
    } finally {
      setGenerating(null)
    }
  }

  const handleCopy = (label, text) => {
    const val = text || generated[label] || ''
    navigator.clipboard.writeText(val)
    setCopied(label)
    if (triggerToast) triggerToast('Copied to clipboard!', 'success')
    setTimeout(() => setCopied(null), 2000)
  }

  // Direct scheduling to Content Calendar
  const handleScheduleToCalendar = (label) => {
    const content = generated[label]
    if (!content) return

    const activeGoal = localStorage.getItem(`forge_${cleanHandle}_calendar_active_goal`) || 'launch'
    const cacheKey = `forge_calendar_${cleanHandle}_${activeGoal}_w0`
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const todayName = dayNames[new Date().getDay()] || 'Mon'

    let currentCal = null
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) currentCal = JSON.parse(cached)
    } catch (_) {}

    if (!currentCal) {
      currentCal = [
        { day: 'Mon', posts: [] }, { day: 'Tue', posts: [] },
        { day: 'Wed', posts: [] }, { day: 'Thu', posts: [] },
        { day: 'Fri', posts: [] }, { day: 'Sat', posts: [] },
        { day: 'Sun', posts: [] },
      ]
    }

    let dayObj = currentCal.find(d => d.day === todayName) || currentCal[0]
    const titleVal = content.length > 70 ? content.substring(0, 70) + '...' : content

    const newPost = {
      id: Date.now(),
      platform: 'YouTube',
      type: label,
      title: titleVal,
      body: content,
      theme: 'launch',
      status: 'scheduled'
    }

    dayObj.posts = [...(dayObj.posts || []), newPost]
    try {
      localStorage.setItem(cacheKey, JSON.stringify(currentCal))
      localStorage.setItem(`forge_calendar_${cleanHandle}_launch_w0`, JSON.stringify(currentCal))
    } catch (_) {}

    window.dispatchEvent(new CustomEvent('forge_calendar_updated', { detail: { source: 'Products' } }))
    if (syncSessionToDb) setTimeout(() => syncSessionToDb(), 100)

    setScheduledLabel(label)
    if (triggerToast) triggerToast(`"${label}" scheduled to Content Calendar!`, 'success')
    setTimeout(() => setScheduledLabel(null), 3000)
  }

  // Icon Resolver
  const resolveIcon = (iconName) => {
    switch (iconName) {
      case 'Users': return Users
      case 'DollarSign': return DollarSign
      case 'BarChart2': return BarChart2
      case 'Radio': return Radio
      case 'ExternalLink': return ExternalLink
      case 'Volume2': return Volume2
      default: return Package
    }
  }

  // Real Metric Calculations
  const projectedMRR = membersCount * (pricing.monthly || 29)
  const conversionRate = visitsCount > 0 && membersCount > 0 
    ? ((membersCount / visitsCount) * 100).toFixed(1) + '%' 
    : '0.0%'

  return (
    <div className="min-h-full flex flex-col bg-[#090d16] text-slate-200 p-4 sm:p-6 space-y-6">

      {/* ── TOP HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="w-2 h-2 rounded-none bg-[#c81e3c]" style={{ borderRadius: '0px' }} />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Product Architecture &amp; Offer Suite
            </span>
            <span 
              className="px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider bg-[#c81e3c]/15 text-white border border-[#c81e3c]/30"
              style={{ borderRadius: '0px' }}
            >
              {blueprint.type}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{productName} Suite</span>
            <Package size={18} className="text-[#c81e3c]" />
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Manage your real product modules, subscription pricing, and conversion-optimized checkout copy.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button 
            type="button"
            onClick={() => handleModuleCTA({ id: 'offer-page', type: 'offer-page' })} 
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 bg-[#121622] hover:bg-[#181e30] border border-white/10 rounded-none transition cursor-pointer"
            style={{ borderRadius: '0px' }}
          >
            <ExternalLink size={13} />
            <span>Copy Offer URL</span>
          </button>

          <button 
            type="button"
            onClick={() => setPricingModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 bg-[#121622] hover:bg-[#181e30] border border-white/10 rounded-none transition cursor-pointer"
            style={{ borderRadius: '0px' }}
          >
            <Settings size={13} />
            <span>Configure Pricing</span>
          </button>

          <button 
            type="button"
            onClick={() => setAddModalOpen(true)} 
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-none transition shadow-sm cursor-pointer hover:opacity-90 border-0"
            style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
          >
            <Plus size={14} className="text-white" />
            <span className="text-white">Add Module</span>
          </button>
        </div>
      </div>

      {/* ── 3 REAL KEY METRICS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Active Members */}
        <div className="p-3.5 bg-[#0c1017] border border-white/[0.08] rounded-none" style={{ borderRadius: '0px' }}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Members</span>
            <Users size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{membersCount.toLocaleString('en-US')}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center justify-between">
            <span>{membersCount === 0 ? '0 joined yet · share offer URL' : `${membersCount} verified founding member${membersCount === 1 ? '' : 's'}`}</span>
          </div>
        </div>

        {/* Real Projected MRR */}
        <div className="p-3.5 bg-[#0c1017] border border-white/[0.08] rounded-none" style={{ borderRadius: '0px' }}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Projected MRR</span>
            <DollarSign size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {pricing.currency}{projectedMRR.toLocaleString('en-US')}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center justify-between">
            <span>@ {pricing.currency}{pricing.monthly}/mo membership base</span>
            <button 
              type="button"
              onClick={() => setPricingModalOpen(true)}
              className="text-[#ff8093] hover:underline cursor-pointer bg-transparent border-0 text-[10px]"
            >
              Edit
            </button>
          </div>
        </div>

        {/* Real Page Conversion */}
        <div className="p-3.5 bg-[#0c1017] border border-white/[0.08] rounded-none" style={{ borderRadius: '0px' }}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Page Conversion</span>
            <BarChart2 size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{conversionRate}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>{visitsCount > 0 ? `${membersCount} signups / ${visitsCount} visits` : '0 visits tracked to offer link'}</span>
          </div>
        </div>
      </div>

      {/* ── ACTIVE PRODUCT MODULES ── */}
      <div className="bg-[#0c1017] border border-white/[0.08] rounded-none p-4 sm:p-5 space-y-3" style={{ borderRadius: '0px' }}>
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers size={13} />
            <span>Active Product Modules ({modules.length})</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Customizable Suite</span>
        </div>

        <div className="space-y-2">
          {modules.map((mod) => {
            const ModIcon = resolveIcon(mod.icon)
            return (
              <div
                key={mod.id}
                className="p-3.5 bg-[#10141f] border border-white/[0.06] hover:border-white/20 transition rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ borderRadius: '0px' }}
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                  <div 
                    className="w-8 h-8 rounded-none bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0"
                    style={{ borderRadius: '0px' }}
                  >
                    <ModIcon size={14} className="text-slate-300" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-xs font-bold text-white truncate">{mod.label}</span>
                      <button
                        type="button"
                        onClick={() => handleToggleModuleStatus(mod.id)}
                        className={`px-1.5 py-0.2 rounded-none text-[9px] font-bold uppercase transition cursor-pointer border ${
                          mod.status === 'Active' || mod.status === 'Live'
                            ? 'bg-[#c81e3c]/15 text-[#ff8093] border-[#c81e3c]/25'
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}
                        style={{ borderRadius: '0px' }}
                      >
                        {mod.status}
                      </button>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {mod.access || 'Included'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{mod.description}</p>
                    {Array.isArray(mod.items) && mod.items.length > 0 && (
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {mod.items.length} item{mod.items.length === 1 ? '' : 's'} enrolled
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleModuleCTA(mod)}
                    className="px-3 py-1 text-xs font-bold text-slate-200 bg-[#151b2a] hover:bg-[#1f283d] border border-white/10 rounded-none transition cursor-pointer"
                    style={{ borderRadius: '0px' }}
                  >
                    {mod.cta || 'Open'} →
                  </button>

                  <button
                    type="button"
                    onClick={() => setInspectingModule(mod)}
                    className="p-1.5 text-slate-400 hover:text-white bg-[#151b2a] border border-white/10 rounded-none transition cursor-pointer"
                    title="Configure content items"
                    style={{ borderRadius: '0px' }}
                  >
                    <Edit3 size={12} />
                  </button>

                  {mod.id !== 'offer-page' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteModule(mod.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 bg-[#151b2a] border border-white/10 rounded-none transition cursor-pointer"
                      title="Remove module"
                      style={{ borderRadius: '0px' }}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}

          {/* Quick-add available module templates */}
          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {AVAILABLE_TEMPLATES.map(mod => (
              <button
                key={mod.label}
                type="button"
                onClick={() => handleAddModule(mod.type)}
                className="w-full flex items-center gap-3 p-3 bg-transparent border border-dashed border-white/10 hover:border-[#c81e3c]/50 text-left transition rounded-none cursor-pointer group"
                style={{ borderRadius: '0px' }}
              >
                <div 
                  className="w-8 h-8 rounded-none bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0"
                  style={{ borderRadius: '0px' }}
                >
                  <mod.icon size={14} className="text-slate-500 group-hover:text-white transition" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-300 group-hover:text-white transition">{mod.label}</p>
                  <p className="text-[10px] text-slate-500 truncate">{mod.description}</p>
                </div>
                <Plus size={14} className="text-slate-500 group-hover:text-white transition shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FORGE AI COPY GENERATOR (ZERO MOCKUPS) ── */}
      <div className="bg-[#0c1017] border border-white/[0.08] rounded-none p-4 sm:p-5 space-y-4" style={{ borderRadius: '0px' }}>
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles size={13} className="text-[#c81e3c]" />
            <span>Generate Product Copy</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Direct to calendar ready</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FORGE_SUGGESTIONS.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => handleGenerate(label)}
              disabled={generating === label}
              className={`p-3.5 rounded-none border text-left transition cursor-pointer flex items-center justify-between ${
                generated[label]
                  ? 'bg-[#c81e3c]/10 border-[#c81e3c]/40 text-white'
                  : 'bg-[#10141f] border-white/[0.06] hover:border-white/20 text-slate-300'
              }`}
              style={{ borderRadius: '0px' }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div 
                  className={`w-7 h-7 rounded-none flex items-center justify-center shrink-0 ${generated[label] ? 'bg-[#c81e3c] text-white' : 'bg-white/[0.05] text-slate-400'}`}
                  style={{ borderRadius: '0px' }}
                >
                  {generating === label ? <RefreshCw size={12} className="animate-spin text-white" /> : <Icon size={12} className={generated[label] ? 'text-white' : 'text-slate-400'} />}
                </div>
                <span className="text-xs font-bold truncate">{label}</span>
              </div>
              <ChevronRight size={13} className="text-slate-500" />
            </button>
          ))}
        </div>

        {activeTextLabel && generated[activeTextLabel] && (
          <div className="p-4 bg-[#090c14] border border-white/10 rounded-none space-y-3" style={{ borderRadius: '0px' }}>
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] flex-wrap gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
                {activeTextLabel}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleScheduleToCalendar(activeTextLabel)}
                  className="px-2.5 py-1 text-xs font-bold text-white rounded-none transition cursor-pointer flex items-center gap-1.5 shadow-sm border-0"
                  style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
                >
                  <Calendar size={12} className="text-white" />
                  <span className="text-white">
                    {scheduledLabel === activeTextLabel ? 'Scheduled ✓' : 'Schedule to Calendar'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(activeTextLabel, generated[activeTextLabel])}
                  className="px-2.5 py-1 text-xs font-bold text-slate-200 bg-[#121622] hover:bg-[#181e30] border border-white/10 rounded-none transition cursor-pointer flex items-center gap-1.5"
                  style={{ borderRadius: '0px' }}
                >
                  {copied === activeTextLabel ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied === activeTextLabel ? 'Copied!' : 'Copy'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTextLabel(null)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer bg-transparent border-0"
                >
                  Close
                </button>
              </div>
            </div>

            <textarea
              value={generated[activeTextLabel]}
              onChange={(e) => setGenerated(prev => ({ ...prev, [activeTextLabel]: e.target.value }))}
              rows={8}
              className="w-full text-xs text-slate-200 font-mono bg-[#0c1017] border border-white/10 p-3 leading-relaxed outline-none focus:border-white/30 rounded-none"
              style={{ borderRadius: '0px' }}
            />
          </div>
        )}
      </div>

      {/* ── CONFIGURE PRICING MODAL ── */}
      {pricingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="w-full max-w-md bg-[#0c1017] border border-white/15 p-5 space-y-4 shadow-2xl rounded-none animate-fade-in-down"
            style={{ borderRadius: '0px' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Settings size={16} className="text-[#c81e3c]" />
                <h3 className="text-sm font-bold text-white">Configure Product Pricing</h3>
              </div>
              <button 
                type="button"
                onClick={() => setPricingModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer bg-transparent border-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  MONTHLY MEMBERSHIP SUBSCRIPTION ($/MONTH)
                </label>
                <input
                  type="number"
                  min="1"
                  value={editMonthlyPrice}
                  onChange={(e) => setEditMonthlyPrice(e.target.value)}
                  className="w-full text-xs bg-[#10141f] border border-white/10 px-3 py-2 text-white outline-none focus:border-[#c81e3c] rounded-none"
                  style={{ borderRadius: '0px' }}
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Updates projected MRR calculations across your CoLaunch dashboard.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  ONE-TIME TIER / LIFETIME PASS ($)
                </label>
                <input
                  type="number"
                  min="1"
                  value={editOneTimePrice}
                  onChange={(e) => setEditOneTimePrice(e.target.value)}
                  className="w-full text-xs bg-[#10141f] border border-white/10 px-3 py-2 text-white outline-none focus:border-[#c81e3c] rounded-none"
                  style={{ borderRadius: '0px' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setPricingModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-300 bg-[#151b2a] border border-white/10 rounded-none transition cursor-pointer"
                style={{ borderRadius: '0px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePricing}
                className="px-4 py-1.5 text-xs font-bold text-white rounded-none transition cursor-pointer shadow-sm border-0"
                style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
              >
                Save Pricing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD CUSTOM MODULE MODAL ── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="w-full max-w-md bg-[#0c1017] border border-white/15 p-5 space-y-4 shadow-2xl rounded-none animate-fade-in-down"
            style={{ borderRadius: '0px' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Plus size={16} className="text-[#c81e3c]" />
                <h3 className="text-sm font-bold text-white">Add New Product Module</h3>
              </div>
              <button 
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer bg-transparent border-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">MODULE TYPE</label>
                <select
                  value={newModType}
                  onChange={(e) => setNewModType(e.target.value)}
                  className="w-full text-xs bg-[#10141f] border border-white/10 px-3 py-2 text-white outline-none focus:border-[#c81e3c] rounded-none"
                  style={{ borderRadius: '0px' }}
                >
                  <option value="tool">Interactive Software Tool / Calculator</option>
                  <option value="tracker">Performance Tracker & Benchmarking</option>
                  <option value="community">Subscriber Community Hub</option>
                  <option value="live">Live Stream / Workshop AMA</option>
                  <option value="custom">Custom Software Module</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">MODULE NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Creator Video Vault, VIP Mastermind"
                  value={newModTitle}
                  onChange={(e) => setNewModTitle(e.target.value)}
                  className="w-full text-xs bg-[#10141f] border border-white/10 px-3 py-2 text-white outline-none focus:border-[#c81e3c] rounded-none"
                  style={{ borderRadius: '0px' }}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">DESCRIPTION</label>
                <textarea
                  rows={2}
                  placeholder="Explain what members will achieve or unlock inside this module..."
                  value={newModDesc}
                  onChange={(e) => setNewModDesc(e.target.value)}
                  className="w-full text-xs bg-[#10141f] border border-white/10 px-3 py-2 text-white outline-none focus:border-[#c81e3c] rounded-none"
                  style={{ borderRadius: '0px' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="px-3 py-1.5 text-xs font-bold text-slate-300 bg-[#151b2a] border border-white/10 rounded-none transition cursor-pointer"
                style={{ borderRadius: '0px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAddModule()}
                className="px-4 py-1.5 text-xs font-bold text-white rounded-none transition cursor-pointer shadow-sm border-0"
                style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
              >
                Add Module
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODULE INSPECTOR & CONTENT MANAGER MODAL ── */}
      {inspectingModule && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div 
            className="w-full max-w-lg bg-[#0c1017] border border-white/15 p-5 space-y-4 shadow-2xl rounded-none animate-fade-in-down"
            style={{ borderRadius: '0px' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-[#c81e3c]" />
                <div>
                  <h3 className="text-sm font-bold text-white">{inspectingModule.label}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Module Content &amp; Curriculum Items</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setInspectingModule(null)}
                className="text-slate-400 hover:text-white cursor-pointer bg-transparent border-0"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {inspectingModule.description}
            </p>

            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Enrolled Items ({inspectingModule.items?.length || 0})
              </span>

              <div className="max-h-56 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                {(inspectingModule.items || []).map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-2.5 bg-[#10141f] border border-white/10 flex items-center justify-between text-xs text-slate-200 rounded-none"
                    style={{ borderRadius: '0px' }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-4 h-4 rounded-none bg-white/5 border border-white/10 text-[9px] font-mono flex items-center justify-center text-slate-400 shrink-0">
                        {idx + 1}
                      </span>
                      <span className="truncate">{item}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItemFromModule(inspectingModule.id, idx)}
                      className="text-slate-500 hover:text-red-400 cursor-pointer bg-transparent border-0 ml-2"
                      title="Remove item"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                {(!inspectingModule.items || inspectingModule.items.length === 0) && (
                  <div className="p-4 text-center text-xs text-slate-500 font-mono">
                    No items added yet. Add lessons, files, or deliverables below.
                  </div>
                )}
              </div>
            </div>

            {/* Add new item input */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <input
                type="text"
                placeholder="Add lesson, resource link, or deliverable..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItemToModule(inspectingModule.id)}
                className="flex-1 text-xs bg-[#10141f] border border-white/10 px-3 py-2 text-white outline-none focus:border-[#c81e3c] rounded-none"
                style={{ borderRadius: '0px' }}
              />
              <button
                type="button"
                onClick={() => handleAddItemToModule(inspectingModule.id)}
                className="px-3 py-2 text-xs font-bold text-white rounded-none transition cursor-pointer shadow-sm border-0"
                style={{ background: brandRed, color: '#ffffff', borderRadius: '0px' }}
              >
                Add
              </button>
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setInspectingModule(null)}
                className="px-4 py-1.5 text-xs font-bold text-slate-300 bg-[#151b2a] border border-white/10 rounded-none transition cursor-pointer"
                style={{ borderRadius: '0px' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
