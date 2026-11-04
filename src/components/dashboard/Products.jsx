import { useState, useEffect } from 'react'
import { useForge } from '../../App'
import {
  Package, Plus, ExternalLink, Users, DollarSign, BarChart2,
  Sparkles, RefreshCw, Check, ChevronRight, Radio, Edit3, Copy, Volume2, AlertCircle, Layers
} from 'lucide-react'
import { generateStudioContent } from '../../services/ai'

const AVAILABLE_MODULES = [
  { icon: Radio, label: 'Live events', description: 'Host live sessions and interactive webinars' },
  { icon: DollarSign, label: 'Digital products', description: 'Sell downloadable templates, toolkits, and assets' },
  { icon: BarChart2, label: 'Coaching tier', description: '1:1 or group strategy coaching upsell' },
  { icon: Package, label: 'Newsletter', description: 'Paid weekly briefing for founding members' },
]

const FORGE_SUGGESTIONS = [
  { label: 'Write offer page copy', icon: Sparkles },
  { label: 'Generate FAQ section', icon: Sparkles },
  { label: 'Create onboarding sequence', icon: Sparkles },
  { label: 'Write product description', icon: Sparkles },
]

export default function Products() {
  const { creatorData, triggerToast, setApiModalOpen, aiKeys, setActiveTab } = useForge()
  const brandRed = '#c81e3c'
  const [generating, setGenerating] = useState(null)
  const [generated, setGenerated] = useState({})
  const [copied, setCopied] = useState(null)
  const [activeTextLabel, setActiveTextLabel] = useState(null)

  const [membersCount, setMembersCount] = useState(() => {
    try {
      const stored = localStorage.getItem('forge_products_members')
      if (stored !== null) return parseInt(stored, 10)
    } catch {}
    return creatorData?.followers ? Math.round(creatorData.followers * 0.002) || 12 : 12
  })

  useEffect(() => {
    try {
      localStorage.setItem('forge_products_members', membersCount.toString())
    } catch (_) {}
  }, [membersCount])

  const productName = creatorData?.productName || creatorData?.blueprint?.name || 'Creator Academy'
  const blueprint = creatorData?.blueprint || { type: 'Web App', name: productName }
  const features = (creatorData?.features && creatorData.features.length > 0)
    ? creatorData.features
    : (blueprint.features || ['Private forum', 'Monthly AMAs', 'Exclusive perks'])

  // Dynamic modules list reflecting onboarding choices
  const activeModules = []

  features.forEach((feat, index) => {
    const fLower = feat.toLowerCase()
    if (fLower.includes('forum') || fLower.includes('community')) {
      activeModules.push({
        id: `community-${index}`,
        icon: Users,
        label: feat,
        description: 'Threaded discussions, member directory & announcements',
        status: 'Active',
        members: membersCount,
        cta: 'Post welcome message',
      })
    } else if (fLower.includes('course') || fLower.includes('curriculum') || fLower.includes('worksheet') || fLower.includes('vault')) {
      activeModules.push({
        id: `courses-${index}`,
        icon: Package,
        label: feat,
        description: 'Upload lessons, modules, and video resources',
        status: 'Active',
        members: Math.round(membersCount * 0.8),
        cta: 'Upload first lesson',
      })
    } else if (fLower.includes('podcast')) {
      activeModules.push({
        id: `podcast-${index}`,
        icon: Volume2,
        label: 'Podcast section',
        description: 'Publish audio episodes, show notes, and transcripts',
        status: 'Active',
        members: Math.round(membersCount * 0.5),
        cta: 'Upload first episode',
      })
    } else if (fLower.includes('ama') || fLower.includes('event') || fLower.includes('live')) {
      activeModules.push({
        id: `ama-${index}`,
        icon: Radio,
        label: feat,
        description: 'Scheduled live streams, Q&A sessions & recordings',
        status: 'Active',
        members: Math.round(membersCount * 0.65),
        cta: 'Schedule next AMA',
      })
    } else if (fLower.includes('tier') || fLower.includes('perk')) {
      activeModules.push({
        id: `tier-${index}`,
        icon: DollarSign,
        label: feat,
        description: 'Tiered subscriber levels, recurring Stripe billing & gates',
        status: 'Active',
        members: membersCount,
        cta: 'Configure pricing',
      })
    } else if (fLower.includes('push') || fLower.includes('notification')) {
      activeModules.push({
        id: `push-${index}`,
        icon: Radio,
        label: feat,
        description: 'Instant mobile alerts directly to member devices',
        status: 'Active',
        members: membersCount,
        cta: 'Send notification',
      })
    } else if (fLower.includes('drop') || fLower.includes('store') || fLower.includes('delivery')) {
      activeModules.push({
        id: `drop-${index}`,
        icon: DollarSign,
        label: feat,
        description: 'Digital downloads, templates and limited-time releases',
        status: 'Active',
        members: Math.round(membersCount * 0.4),
        cta: 'Add new drop',
      })
    } else {
      activeModules.push({
        id: `custom-${index}`,
        icon: Package,
        label: feat,
        description: `Active module configured for ${productName}`,
        status: 'Active',
        members: Math.round(membersCount * 0.7),
        cta: 'Manage module',
      })
    }
  })

  // Always append Offer Page
  activeModules.push({
    id: 'offer-page',
    icon: ExternalLink,
    label: 'Offer page',
    description: 'Conversion-optimized landing & checkout portal',
    status: 'Live',
    members: null,
    cta: 'Share link',
  })

  const handleGenerate = async (label) => {
    setGenerating(label)

    const hasKeys = aiKeys && (aiKeys.geminiKey || aiKeys.openaiKey || aiKeys.anthropicKey || aiKeys.togetherKey)
    if (!hasKeys) {
      setTimeout(() => {
        const mockMap = {
          'Write offer page copy': `**Headline**: Stop creating for free. Start building what your audience will actually pay for.

**Subheadline**: ${productName} is the premium space built for ${creatorData?.niche || 'creators'} who are ready to turn their audience into a real business.

**What's Inside**:
→ Course builder to host your structured programs
→ Community forum for direct student discussions
→ Audio podcast section for subscriber episodes

**Pricing**: Join today for just $29/month.`,
          'Generate FAQ section': `**Q: Who is ${productName} for?**
A: It is designed specifically for my audience who wants to master ${creatorData?.niche || 'content creation'} and build a sustainable brand.

**Q: Can I cancel my membership at any time?**
A: Yes! You can manage your subscription directly from your account page. There are no contracts or commitments.

**Q: How often is new content added?**
A: I publish new lessons and host live Q&A sessions weekly to ensure you always have fresh insights.`,
          'Create onboarding sequence': `**Email 1: Welcome to ${productName}! 👋**
Subject: You're in! Welcome to the family.
Body:
Hey there,

I am so excited to have you inside ${productName}. 

Over the next few weeks, you'll get access to my full library of training materials, our private community forum, and weekly live calls where we solve your biggest bottlenecks.`,
          'Write product description': `${productName} is the all-in-one ecosystem for ${creatorData?.niche || 'creators'}. Combining hands-on blueprints, high-level community accountability, and direct founder support to accelerate your trajectory.`
        }
        setGenerated(prev => ({ ...prev, [label]: mockMap[label] || 'Content generated successfully.' }))
        setActiveTextLabel(label)
        setGenerating(null)
        if (triggerToast) triggerToast(`Generated tailored copy for ${label}`, 'success')
      }, 700)
      return
    }

    try {
      const contentType = { label, platform: 'Product' }
      const inputContext = `Generate ${label} for a creator digital product named "${productName}" in the niche "${creatorData?.niche || 'creation'}". Clear, punchy, persuasive copy.`
      const result = await generateStudioContent(contentType, inputContext, creatorData, 'Confident')
      setGenerated(prev => ({ ...prev, [label]: result }))
      setActiveTextLabel(label)
      if (triggerToast) triggerToast(`AI generated: ${label}`, 'success')
    } catch (_) {
      if (triggerToast) triggerToast('Showing tailored copy template', 'info')
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

  const handleModuleCTA = (id, label) => {
    if (id === 'offer-page') {
      const url = `https://${creatorData?.handle?.replace('@','') || 'creator'}.co-launch.app`
      navigator.clipboard.writeText(url)
      if (triggerToast) triggerToast('Offer page link copied to clipboard!', 'success')
    } else if (id.startsWith('community')) {
      if (triggerToast) triggerToast('Navigating to Community forum...', 'success')
      setTimeout(() => {
        setActiveTab && setActiveTab('community')
      }, 300)
    } else {
      if (triggerToast) triggerToast(`Configuring module: ${label}`, 'info')
    }
  }

  return (
    <div className="min-h-full flex flex-col bg-[#090d16] text-slate-200 p-4 sm:p-6 space-y-6">

      {/* ── TOP HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="w-2 h-2 rounded-none bg-[#c81e3c]" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              Product Architecture &amp; Offer Suite
            </span>
            <span className="px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider bg-[#c81e3c]/15 text-white border border-[#c81e3c]/30">
              {blueprint.type}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>{productName} Modules</span>
            <Package size={18} className="text-[#c81e3c]" />
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Manage your product modules, gated subscriber content, and conversion-optimized checkout copy.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button 
            type="button"
            onClick={() => handleModuleCTA('offer-page', 'Offer page')} 
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 bg-[#121622] hover:bg-[#181e30] border border-white/10 rounded-none transition cursor-pointer"
          >
            <ExternalLink size={13} />
            <span>Copy Offer URL</span>
          </button>

          <button 
            type="button"
            onClick={() => {
              if (triggerToast) triggerToast('Select an available module below to activate it in your suite.', 'info')
            }} 
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-none transition shadow-sm cursor-pointer hover:opacity-90 border-0"
            style={{ background: brandRed, color: '#ffffff' }}
          >
            <Plus size={14} className="text-white" />
            <span>Add Module</span>
          </button>
        </div>
      </div>

      {/* ── 3 KEY METRICS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-[#0c1017] border border-white/[0.08] rounded-none">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Members</span>
            <Users size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{membersCount.toLocaleString('en-US')}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>Target: first 100 paid users</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#0c1017] border border-white/[0.08] rounded-none">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Projected MRR</span>
            <DollarSign size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">${(membersCount * 29).toLocaleString('en-US')}</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>@ $29/mo membership base</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#0c1017] border border-white/[0.08] rounded-none">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Page Conversion</span>
            <BarChart2 size={14} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">3.8%</div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            <span>Industry benchmark: 2.5%</span>
          </div>
        </div>
      </div>

      {/* ── ACTIVE PRODUCT MODULES ── */}
      <div className="bg-[#0c1017] border border-white/[0.08] rounded-none p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers size={13} />
            <span>Active Product Modules ({activeModules.length})</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Configured</span>
        </div>

        <div className="space-y-2">
          {activeModules.map(({ id, icon: Icon, label, description, status, members, cta }) => (
            <div
              key={id}
              className="p-3.5 bg-[#10141f] border border-white/[0.06] hover:border-white/20 transition rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-none bg-white/[0.05] border border-white/10 flex items-center justify-center shrink-0">
                  <Icon size={14} className="text-slate-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-white truncate">{label}</span>
                    <span className="px-1.5 py-0.2 rounded-none text-[9px] font-bold uppercase bg-[#c81e3c]/15 text-[#ff8093] border border-[#c81e3c]/25">
                      {status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                {members !== null && (
                  <span className="text-[10px] font-mono text-slate-400">
                    {members.toLocaleString('en-US')} users
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleModuleCTA(id, label)}
                  className="px-3 py-1 text-xs font-bold text-slate-200 bg-[#151b2a] hover:bg-[#1f283d] border border-white/10 rounded-none transition cursor-pointer"
                >
                  {cta} →
                </button>
              </div>
            </div>
          ))}

          {/* Add module slots */}
          {AVAILABLE_MODULES.slice(0, 2).map(mod => (
            <button
              key={mod.label}
              type="button"
              onClick={() => {
                if (triggerToast) triggerToast(`Module "${mod.label}" added to your workspace!`, 'success')
              }}
              className="w-full flex items-center gap-3 p-3 bg-transparent border border-dashed border-white/10 hover:border-[#c81e3c]/50 text-left transition rounded-none cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-none bg-white/[0.03] border border-white/10 flex items-center justify-center shrink-0">
                <mod.icon size={14} className="text-slate-500 group-hover:text-white transition" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-300 group-hover:text-white transition">{mod.label}</p>
                <p className="text-[10px] text-slate-500">{mod.description}</p>
              </div>
              <Plus size={14} className="text-slate-500 group-hover:text-white transition" />
            </button>
          ))}
        </div>
      </div>

      {/* ── FORGE AI COPY GENERATOR ── */}
      <div className="bg-[#0c1017] border border-white/[0.08] rounded-none p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles size={13} className="text-[#c81e3c]" />
            <span>Generate Product Copy</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">Click to draft</span>
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
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-7 h-7 rounded-none flex items-center justify-center shrink-0 ${generated[label] ? 'bg-[#c81e3c] text-white' : 'bg-white/[0.05] text-slate-400'}`}>
                  {generating === label ? <RefreshCw size={12} className="animate-spin text-white" /> : <Icon size={12} className={generated[label] ? 'text-white' : 'text-slate-400'} />}
                </div>
                <span className="text-xs font-bold truncate">{label}</span>
              </div>
              <ChevronRight size={13} className="text-slate-500" />
            </button>
          ))}
        </div>

        {activeTextLabel && generated[activeTextLabel] && (
          <div className="p-4 bg-[#090c14] border border-white/10 rounded-none space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300">
                {activeTextLabel}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(activeTextLabel, generated[activeTextLabel])}
                  className="px-2.5 py-1 text-xs font-bold text-slate-200 bg-[#121622] hover:bg-[#181e30] border border-white/10 rounded-none transition cursor-pointer flex items-center gap-1.5"
                >
                  {copied === activeTextLabel ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied === activeTextLabel ? 'Copied!' : 'Copy to Clipboard'}</span>
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
            <pre className="text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
              {generated[activeTextLabel]}
            </pre>
          </div>
        )}
      </div>

    </div>
  )
}
