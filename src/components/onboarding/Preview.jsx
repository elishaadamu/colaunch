import { useState, useEffect } from 'react'
import { useForge, getAccent } from '../../App'
import { 
  ArrowRight, RefreshCw, Send, SlidersHorizontal, Check, Layout, Users, 
  BarChart2, Settings, Radio, Play, Lock, MessageSquare, Calendar, 
  Download, ShoppingBag, Laptop, Smartphone, Volume2, Award, RotateCcw, Trash2
} from 'lucide-react'
import WingLogo from '../ui/WingLogo'
import { parseFollowerCount } from '../../services/ai'
import { hexToRgb, getDeterministicBrandColor } from '../../utils/avatarColorExtractor'

function isLightColor(hex) {
  if (!hex || typeof hex !== 'string') return false
  const clean = hex.replace('#', '').trim()
  const r = parseInt(clean.slice(0, 2), 16) || 0
  const g = parseInt(clean.slice(2, 4), 16) || 0
  const b = parseInt(clean.slice(4, 6), 16) || 0
  return ((r * 299 + g * 587 + b * 114) / 1000) > 135
}

function getDynamicCommunityPosts(creatorName, blueprint, creatorData) {
  const niche = (creatorData?.niche || '').toLowerCase()
  const bpName = (blueprint?.name || '').toLowerCase()
  const handleClean = (creatorData?.handle || creatorName || 'creator').replace('@', '').toLowerCase()

  if (niche.includes('health') || niche.includes('wellness') || bpName.includes('wellness') || bpName.includes('health') || bpName.includes('nutrition') || bpName.includes('truth')) {
    return [
      { user: `@${handleClean}`, text: `Welcome everyone to the private inner circle! Drop your protocol questions below for tomorrow's live breakdown.`, isCreator: true, time: '10m ago' },
      { user: '@sarah_k_wellness', text: `The research breakdown on natural detox protocols in the library was eye-opening. Already noticing more energy.`, time: '2h ago' },
      { user: '@david_holistic', text: `Can we get a deep dive on seasonal supplementation next month? Really loving the verified resources here.`, time: '5h ago' }
    ]
  }

  if (niche.includes('tech') || niche.includes('code') || niche.includes('developer') || niche.includes('software')) {
    return [
      { user: `@${handleClean}`, text: `Welcome engineers! Repository templates and architecture notes are posted in the Vault tab.`, isCreator: true, time: '15m ago' },
      { user: '@dev_jordan', text: `Implemented the clean pipeline pattern from chapter 2 in our prod stack today. Shaved 35% off latency.`, time: '3h ago' },
      { user: '@frontend_dan', text: `The interactive component breakdown was gold. Any recommendations for state management on scale?`, time: '6h ago' }
    ]
  }

  if (niche.includes('finance') || niche.includes('business') || niche.includes('invest') || niche.includes('money')) {
    return [
      { user: `@${handleClean}`, text: `Welcome founders and investors! Market brief and portfolio teardowns are uploaded.`, isCreator: true, time: '20m ago' },
      { user: '@marcus_invest', text: `The cashflow model from the core vault saved our team weeks of financial modeling.`, time: '1h ago' },
      { user: '@growth_elena', text: `Really excited for the AMA tomorrow. Will submit my unit economics spreadsheet in advance.`, time: '4h ago' }
    ]
  }

  return [
    { user: `@${handleClean}`, text: `Welcome everyone to ${blueprint?.name || 'our platform'}! Live AMA streams and member perks are ready.`, isCreator: true, time: '10m ago' },
    { user: '@community_member', text: `Super impressed with the structure here. Everything is accessible and organized.`, time: '2h ago' },
    { user: '@creative_mind', text: `Can't wait to connect with fellow members here. Exactly what our community needed.`, time: '5h ago' }
  ]
}

const QUICK_PROMPTS = [
  'Make it more premium',
  'Focus on community',
  'More minimalist',
  'For women 25–34',
  'Mobile-first',
  'Add a podcast section',
]

const FEATURES = [
  { icon: Layout, label: 'Course builder' },
  { icon: Users, label: 'Community forum' },
  { icon: Radio, label: 'Live events' },
  { icon: BarChart2, label: 'Creator analytics' },
  { icon: Settings, label: 'Member management' },
  { icon: Volume2, label: 'Podcast section' },
]

function getDynamicProducts(blueprint, creatorData) {
  const name = creatorData.name || creatorData.handle?.replace('@', '') || 'Creator'
  const bpName = blueprint?.name || 'Platform'
  const bpNameL = bpName.toLowerCase()
  const category = (blueprint?.raw?.product_category || '').toLowerCase()
  const followers = parseFollowerCount(creatorData.followers)

  // 1. Philanthropy / Impact / Cause ventures
  if (bpNameL.includes('philanthrop') || bpNameL.includes('impact') || bpNameL.includes('charity')) {
    return [
      { title: 'Community Impact Pass', price: '$9.99 / mo', type: 'Monthly Membership' },
      { title: 'Project Founding Partner', price: '$49.00', type: 'Impact Tier' },
      { title: 'Executive Impact Brief & Strategy', price: '$299.00', type: 'Annual Report' },
      { title: 'Transparency Ledger & Asset Pack', price: 'Free', type: 'Public Access' }
    ]
  }

  // 2. High-scale challenge / App / Entertainment / Drops
  if (bpNameL.includes('challenge') || bpNameL.includes('drop') || bpNameL.includes('box') || category === 'app') {
    return [
      { title: `${name}'s Seasonal Challenge Pass`, price: '$4.99 / mo', type: 'Digital Pass' },
      { title: 'VIP Exclusive Drop Bundle', price: '$29.99', type: 'Limited Edition' },
      { title: 'Golden Ticket Entry & Live Session', price: '$99.00', type: 'Exclusive Access' },
      { title: 'Fan Starter Toolkit & Wallpapers', price: 'Free', type: 'Starter Pack' }
    ]
  }

  // 3. Course / Academy / Learning
  if (category === 'course' || bpNameL.includes('academy') || bpNameL.includes('masterclass')) {
    const isBig = followers >= 100_000
    return [
      { title: `${name}'s Foundational Masterclass`, price: isBig ? '$49.00' : '$29.00', type: 'Core Curriculum' },
      { title: 'Viral Strategy & Production Playbook', price: isBig ? '$129.00' : '$79.00', type: 'Advanced Guide' },
      { title: '1-on-1 Channel Audit & Mentorship', price: isBig ? '$499.00' : '$199.00', type: 'Direct Access' },
      { title: 'Thumbnail & Retention Templates', price: 'Free', type: 'Starter Pack' }
    ]
  }

  // 4. Community / Membership
  if (category === 'community' || bpNameL.includes('circle') || bpNameL.includes('club')) {
    return [
      { title: 'General Member Access', price: '$12.00 / mo', type: 'Membership' },
      { title: 'Pro Tier + Monthly Live AMAs', price: '$35.00 / mo', type: 'VIP Tier' },
      { title: 'Founding Member Lifetime Pass', price: '$299.00', type: 'Lifetime' },
      { title: 'Community Discussion Pass', price: 'Free', type: 'Community' }
    ]
  }

  // 5. Default tailored to followers & product name
  const basePrice = followers >= 1_000_000 ? 19.99 : 9.99
  return [
    { title: `${bpName} Starter Guide`, price: `$${basePrice.toFixed(2)}`, type: 'Digital Guide' },
    { title: 'Complete Resource Vault & Files', price: `$${(basePrice * 2.5).toFixed(2)}`, type: 'Toolkit' },
    { title: 'Exclusive Strategy Session', price: `$${followers >= 1_000_000 ? '249.00' : '99.00'}`, type: 'Consultation' },
    { title: 'Essential Launch Assets', price: 'Free', type: 'Free Tier' }
  ]
}

function CreatorDashboardView({ styles, dynamicAccent, dynamicAccentBg, dynamicAccentBorder, creatorData, blueprint }) {
  const creatorName = creatorData.name || creatorData.handle?.replace('@', '') || 'Creator'
  const resolvedAvatar = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''

  // Format realistic MRR display from blueprint revenue
  const rawRev = blueprint?.revenue || '$14K–$38K / mo'
  const mrrDisplay = rawRev.includes('/ mo') ? rawRev.split('–')[0].trim() : '$14,850'
  const cleanMrr = mrrDisplay.startsWith('$') ? mrrDisplay : `$${mrrDisplay}`

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto" style={{ background: styles.bg }}>
      {/* Studio OS Header */}
      <div 
        className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
        style={{ borderColor: styles.borderColor, background: 'rgba(255,255,255,0.015)' }}
      >
        <div className="flex items-center gap-2.5">
          <div 
            className="w-6 h-6 rounded-md overflow-hidden flex items-center justify-center font-bold text-[9px] flex-shrink-0 relative"
            style={{ background: dynamicAccentBg, border: `1px solid ${dynamicAccentBorder}` }}
          >
            <span style={{ color: dynamicAccent }}>
              {creatorName.charAt(0).toUpperCase()}
            </span>
            {resolvedAvatar ? (
              <img 
                src={resolvedAvatar} 
                alt="" 
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover" 
                onError={e => {
                  if (!e.currentTarget.dataset.proxied && resolvedAvatar.startsWith('http')) {
                    e.currentTarget.dataset.proxied = 'true';
                    e.currentTarget.src = `/api/proxy/avatar?url=${encodeURIComponent(resolvedAvatar)}`;
                  } else {
                    e.currentTarget.style.display = 'none';
                  }
                }} 
              />
            ) : null}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black tracking-tight" style={{ color: styles.text }}>
                {creatorName} Studio OS
              </span>
              <span 
                className="text-[7.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                style={{ background: dynamicAccentBg, color: dynamicAccent, border: `1px solid ${dynamicAccentBorder}` }}
              >
                Verified
              </span>
            </div>
            <p className="text-[8.5px] leading-none" style={{ color: styles.textMuted }}>
              Command Center · {blueprint.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div 
            className="flex items-center gap-1.5 px-2 py-1 rounded text-[8.5px] font-medium"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: dynamicAccent }} />
            <span style={{ color: styles.textMuted }}>Stripe Live Rails</span>
          </div>
          <span className="text-[8px] font-mono px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.03)', color: styles.textMuted }}>
            Live
          </span>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-4 flex-shrink-0">
        {[
          { label: 'Projected MRR', val: `${cleanMrr}/mo`, badge: '+18.4% MoM', desc: 'Active subscriptions' },
          { label: 'Active Members', val: '1,280', badge: '94.2% retention', desc: '+48 this week' },
          { label: 'Curriculum Finish', val: '89.6%', badge: 'High Engagement', desc: 'Avg module progress' },
          { label: 'Available Payout', val: '$12,420', badge: 'Instant Transfer', desc: 'Next payout today' },
        ].map((m, i) => (
          <div 
            key={i} 
            className="p-3 rounded-xl border flex flex-col justify-between"
            style={{ background: styles.cardBg, borderColor: styles.borderColor }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8.5px] font-medium uppercase tracking-wider" style={{ color: styles.textMuted }}>{m.label}</span>
              <span 
                className="text-[7.5px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: dynamicAccentBg, color: dynamicAccent }}
              >
                {m.badge}
              </span>
            </div>
            <div className="text-[14px] font-mono font-bold tracking-tight mb-0.5" style={{ color: styles.text }}>
              {m.val}
            </div>
            <p className="text-[8px]" style={{ color: styles.textMuted }}>{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Two Column Layout: Curriculum Pipeline & Live Member Activity */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 px-4 pb-4 flex-1">
        {/* Modules / Pipeline (3 cols) */}
        <div 
          className="md:col-span-3 p-3.5 rounded-xl border flex flex-col"
          style={{ background: styles.cardBg, borderColor: styles.borderColor }}
        >
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b" style={{ borderColor: styles.borderColor }}>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: styles.text }}>
              Curriculum & Asset Modules
            </span>
            <span className="text-[8px] font-mono" style={{ color: dynamicAccent }}>
              3 Active Pipelines
            </span>
          </div>

          <div className="space-y-2">
            {[
              { title: 'Core Masterclass & Strategy', lessons: '12 video modules · Upload ready', progress: '88%', status: 'Active' },
              { title: 'Resource Vault & Templates', lessons: '14 downloadable toolkits & files', progress: '100%', status: 'Published' },
              { title: 'VIP Community & Live AMAs', lessons: 'Scheduled streams & weekly chats', progress: '65%', status: 'In Review' },
            ].map((mod, idx) => (
              <div 
                key={idx} 
                className="p-2.5 rounded-lg border"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold truncate max-w-[180px]" style={{ color: styles.text }}>
                    {mod.title}
                  </span>
                  <span 
                    className="text-[7.5px] font-bold px-1.5 py-0.5 rounded uppercase"
                    style={{ background: dynamicAccentBg, color: dynamicAccent }}
                  >
                    {mod.status}
                  </span>
                </div>
                <p className="text-[8px] mb-2" style={{ color: styles.textMuted }}>{mod.lessons}</p>
                <div className="space-y-1">
                  <div className="flex justify-between text-[7px] font-mono" style={{ color: styles.textMuted }}>
                    <span>Student Completion</span>
                    <span>{mod.progress}</span>
                  </div>
                  <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: mod.progress, background: dynamicAccent }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed (2 cols) */}
        <div 
          className="md:col-span-2 p-3.5 rounded-xl border flex flex-col"
          style={{ background: styles.cardBg, borderColor: styles.borderColor }}
        >
          <div className="flex items-center justify-between mb-2.5 pb-2 border-b" style={{ borderColor: styles.borderColor }}>
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: styles.text }}>
              Live Sales Stream
            </span>
            <span className="text-[8px] font-mono text-emerald-400">
              ● Live
            </span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto">
            {[
              { user: 'Sarah K.', action: 'Enrolled in Core Masterclass', amount: '+$149.00', time: '4m ago' },
              { user: 'David M.', action: 'Joined Monthly VIP Circle', amount: '+$35.00/mo', time: '18m ago' },
              { user: 'Elena R.', action: 'Downloaded Strategy Pack', amount: 'Free', time: '34m ago' },
              { user: 'PC Master', action: 'Purchased Toolkit Bundle', amount: '+$79.00', time: '1h ago' },
            ].map((feed, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold truncate" style={{ color: styles.text }}>{feed.user}</span>
                    <span className="text-[7.5px]" style={{ color: styles.textMuted }}>{feed.time}</span>
                  </div>
                  <p className="text-[8px] truncate" style={{ color: styles.textMuted }}>{feed.action}</p>
                </div>
                <span className="text-[9px] font-mono font-bold flex-shrink-0" style={{ color: dynamicAccent }}>
                  {feed.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AppMockup({ theme, activeTab, setActiveTab, blueprint, creatorData, extraTabs, isMobile, viewMode = 'desktop' }) {
  const isDark = theme === 'dark' || theme === 'premium' || theme === 'minimalist' || !theme
  const resolvedAvatar = creatorData?.avatarUrl || creatorData?.avatar || creatorData?.avatar_url || ''
  const accent = getAccent(creatorData)
  const dynamicAccent = accent.color
  const dynamicAccentBg = `rgba(${accent.rgb}, 0.12)`
  const dynamicAccentBorder = `rgba(${accent.rgb}, 0.28)`
  
  // Theme color maps — always inherits extracted creator brand color instead of hardcoded purple
  const themeStyles = {
    dark: {
      bg: '#0a0a0c',
      cardBg: '#121215',
      borderColor: 'rgba(255,255,255,0.06)',
      text: '#ffffff',
      textMuted: 'rgba(255,255,255,0.4)',
      accent: dynamicAccent,
      accentBg: dynamicAccentBg,
      accentBorder: dynamicAccentBorder
    },
    light: {
      bg: '#f9fafb',
      cardBg: '#ffffff',
      borderColor: 'rgba(0,0,0,0.08)',
      text: '#111827',
      textMuted: '#6b7280',
      accent: dynamicAccent,
      accentBg: dynamicAccentBg,
      accentBorder: dynamicAccentBorder
    },
    premium: {
      bg: '#08050e',
      cardBg: 'rgba(17, 12, 28, 0.75)',
      borderColor: dynamicAccentBorder,
      text: '#f8fafc',
      textMuted: 'rgba(255,255,255,0.6)',
      accent: dynamicAccent,
      accentBg: dynamicAccentBg,
      accentBorder: dynamicAccentBorder,
      glow: ''
    },
    minimalist: {
      bg: '#ffffff',
      cardBg: '#ffffff',
      borderColor: '#000000',
      text: '#000000',
      textMuted: '#737373',
      accent: '#000000',
      accentBg: 'rgba(0, 0, 0, 0.05)',
      accentBorder: '#000000'
    },
    feminine: {
      bg: '#faf5f6',
      cardBg: 'rgba(255, 241, 242, 0.8)',
      borderColor: 'rgba(251, 113, 133, 0.18)',
      text: '#4c0519',
      textMuted: '#fda4af',
      accent: '#db2777',
      accentBg: 'rgba(219, 39, 119, 0.08)',
      accentBorder: 'rgba(219, 39, 119, 0.15)'
    }
  }

  const styles = themeStyles[theme] || themeStyles.dark

  if (viewMode === 'dashboard') {
    return (
      <CreatorDashboardView
        styles={styles}
        dynamicAccent={dynamicAccent}
        dynamicAccentBg={dynamicAccentBg}
        dynamicAccentBorder={dynamicAccentBorder}
        creatorData={creatorData}
        blueprint={blueprint}
      />
    )
  }
  const previewType = blueprint.preview || 'webapp'
  const creatorName = creatorData.name || creatorData.handle?.replace('@','') || 'Creator'

  // Tabs based on Blueprint Type
  let defaultTabs = []
  if (previewType === 'webapp') defaultTabs = ['Courses', 'Community', 'Live AMAs']
  else if (previewType === 'mobile') defaultTabs = ['Home Feed', 'Group Chat', 'Drops']
  else if (previewType === 'community') defaultTabs = ['Announcements', 'Chat Room', 'Events']
  else if (previewType === 'store') defaultTabs = ['All Products', 'Guides', 'Consultation']

  const allTabs = [...defaultTabs, ...extraTabs]

  // Render content based on activeTab
  const renderTabContent = () => {
    const tabLower = activeTab.toLowerCase()
    
    if (tabLower.includes('course')) {
      const isMusicOrTheater = (blueprint?.name || '').toLowerCase().includes('musical') || 
                               (blueprint?.name || '').toLowerCase().includes('theater') ||
                               (blueprint?.name || '').toLowerCase().includes('broadway') ||
                               (blueprint?.name || '').toLowerCase().includes('music') ||
                               (creatorData?.niche || '').toLowerCase().includes('theater') ||
                               (creatorData?.niche || '').toLowerCase().includes('music')

      const coursesList = isMusicOrTheater ? [
        { title: `${creatorName} Core Method`, lessons: '12 lessons', badge: 'Popular', progress: '85%' },
        { title: 'Dramatic Score & Lyric Craft', lessons: '8 lessons', badge: 'Pro Tier', lock: true },
        { title: 'Golden Age Repertoire Vault', lessons: '5 lessons', badge: 'Ready', progress: '100%' }
      ] : [
        { title: `${creatorName} Core Method`, lessons: '12 lessons', badge: 'Popular', progress: '85%' },
        { title: 'Advanced Tactics & Secrets', lessons: '8 lessons', badge: 'Pro Tier', lock: true },
        { title: 'Quick Start Templates', lessons: '5 lessons', badge: 'Ready', progress: '100%' }
      ]

      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4">
          {coursesList.map((c, i) => (
            <div 
              key={i} 
              className={`rounded-xl p-3 border transition-all duration-200 ${styles.glow || ''}`}
              style={{ background: styles.cardBg, borderColor: styles.borderColor }}
            >
              <div className="h-16 rounded-lg mb-2 flex items-center justify-center relative overflow-hidden" 
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                {c.lock ? (
                  <Lock size={16} style={{ color: styles.accent }} />
                ) : (
                  <Play size={16} style={{ color: styles.accent }} />
                )}
                {c.badge && (
                  <span className="absolute top-1.5 right-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase"
                    style={{ background: styles.accentBg, color: styles.accent, border: `1px solid ${styles.accentBorder}` }}
                  >
                    {c.badge}
                  </span>
                )}
              </div>
              <h4 className="text-[11px] font-bold leading-tight mb-1 truncate" style={{ color: styles.text }}>{c.title}</h4>
              <p className="text-[9px] mb-2" style={{ color: styles.textMuted }}>{c.lessons}</p>
              {c.progress && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[7px] font-mono" style={{ color: styles.textMuted }}>
                    <span>Progress</span>
                    <span>{c.progress}</span>
                  </div>
                  <div className="h-1 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full" style={{ width: c.progress, background: styles.accent }} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )
    }

    if (tabLower.includes('community') || tabLower.includes('chat') || tabLower.includes('feed') || tabLower.includes('room') || tabLower.includes('announcement')) {
      return (
        <div className="space-y-2.5 p-4">
          {getDynamicCommunityPosts(creatorName, blueprint, creatorData).map((p, i) => (
            <div 
              key={i} 
              className={`rounded-xl p-3 border flex gap-3 ${styles.glow || ''}`}
              style={{ background: styles.cardBg, borderColor: styles.borderColor }}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0"
                style={{ background: p.isCreator ? styles.accentBg : 'rgba(255,255,255,0.06)', color: p.isCreator ? styles.accent : styles.text }}
              >
                {p.user.charAt(1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold" style={{ color: styles.text }}>{p.user}</span>
                  {p.isCreator && (
                    <span className="text-[7px] font-bold uppercase px-1 rounded" style={{ background: styles.accentBg, color: styles.accent }}>
                      Host
                    </span>
                  )}
                  <span className="text-[8px] ml-auto" style={{ color: styles.textMuted }}>{p.time}</span>
                </div>
                <p className="text-[10px] leading-relaxed" style={{ color: styles.textMuted }}>{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (tabLower.includes('live') || tabLower.includes('event')) {
      return (
        <div className="space-y-3 p-4">
          {[
            { title: 'Launch Day Live Q&A', desc: `Join ${creatorName} for the live reveal and get early answers.`, status: 'Live in 2 days', action: 'Add' },
            { title: 'Weekly Setup Critiques', desc: 'Host review of community visual setups.', status: 'Mon at 8:00 PM', action: 'Remind' }
          ].map((e, i) => (
            <div 
              key={i} 
              className={`rounded-xl p-3 border flex gap-4 items-center justify-between ${styles.glow || ''}`}
              style={{ background: styles.cardBg, borderColor: styles.borderColor }}
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-[8px] font-bold uppercase tracking-wider text-red-400">Stream</span>
                </div>
                <h4 className="text-[11px] font-bold truncate" style={{ color: styles.text }}>{e.title}</h4>
                <p className="text-[9px] leading-snug truncate" style={{ color: styles.textMuted }}>{e.desc}</p>
              </div>
              <div className="text-right flex flex-col gap-1 flex-shrink-0">
                <span className="text-[8px] font-mono" style={{ color: styles.text }}>{e.status}</span>
                <button className="text-[8px] font-bold px-2 py-1 rounded transition-colors border"
                  style={{ background: styles.accentBg, color: styles.accent, borderColor: styles.accentBorder }}
                >
                  {e.action}
                </button>
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (tabLower.includes('podcast')) {
      return (
        <div className="space-y-2.5 p-4">
          {[
            { title: `Ep 14: Monetizing content in 2026`, duration: '42 min', plays: '12K list' },
            { title: `Ep 13: Secrets of highly successful creators`, duration: '35 min', plays: '8K list' }
          ].map((p, i) => (
            <div 
              key={i} 
              className={`rounded-xl p-3 border flex gap-3 items-center ${styles.glow || ''}`}
              style={{ background: styles.cardBg, borderColor: styles.borderColor }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <Volume2 size={13} style={{ color: styles.accent }} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-bold truncate" style={{ color: styles.text }}>{p.title}</h4>
                <p className="text-[8px]" style={{ color: styles.textMuted }}>{p.duration} · {p.plays}</p>
              </div>
              <button className="w-6 h-6 rounded-full flex items-center justify-center border flex-shrink-0"
                style={{ background: styles.accentBg, color: styles.accent, borderColor: styles.accentBorder }}
              >
                <Play size={10} fill="currentColor" />
              </button>
            </div>
          ))}
        </div>
      )
    }

    if (tabLower.includes('product') || tabLower.includes('guide') || tabLower.includes('shop') || tabLower.includes('consult') || tabLower.includes('drop')) {
      const dynamicProducts = getDynamicProducts(blueprint, creatorData)
      return (
        <div className="grid grid-cols-2 gap-3 p-4">
          {dynamicProducts.map((p, i) => (
            <div 
              key={i} 
              className={`rounded-xl p-3 border transition-all duration-200 flex flex-col justify-between ${styles.glow || ''}`}
              style={{ background: styles.cardBg, borderColor: styles.borderColor }}
            >
              <div>
                <span className="text-[8px] font-semibold uppercase tracking-wider" style={{ color: styles.textMuted }}>{p.type}</span>
                <h4 className="text-[11px] font-bold leading-tight mt-0.5 mb-2 truncate" style={{ color: styles.text }}>{p.title}</h4>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5">
                <span className="text-[11px] font-mono font-bold" style={{ color: styles.text }}>{p.price}</span>
                <button className="p-1 rounded-lg" style={{ color: styles.accent }}>
                  <Download size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )
    }

    // Default Fallback
    return (
      <div className="p-6 text-center" style={{ color: styles.textMuted }}>
        <p className="text-[11px]">Selecting new layout modules...</p>
      </div>
    )
  }

  // Desktop vs Mobile View wrapper layouts
  if (isMobile) {
    return (
      <div className="w-full h-full flex flex-col" style={{ background: styles.bg }}>
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
          style={{ borderColor: styles.borderColor }}
        >
          <span className="text-[11px] font-black uppercase tracking-wider truncate mr-2" style={{ color: styles.text }}>
            {blueprint.name.split("'")[0]}
          </span>
          <div className="w-5 h-5 rounded-full overflow-hidden flex items-center justify-center font-bold text-[8px] flex-shrink-0 relative"
            style={{ background: styles.accentBg, color: styles.accent, border: `1px solid ${styles.accentBorder}` }}
          >
            <span>{creatorName.charAt(0).toUpperCase()}</span>
            {resolvedAvatar ? (
              <img 
                src={resolvedAvatar} 
                alt="" 
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover" 
                onError={e => {
                  if (!e.currentTarget.dataset.proxied && resolvedAvatar.startsWith('http')) {
                    e.currentTarget.dataset.proxied = 'true';
                    e.currentTarget.src = `/api/proxy/avatar?url=${encodeURIComponent(resolvedAvatar)}`;
                  } else {
                    e.currentTarget.style.display = 'none';
                  }
                }} 
              />
            ) : null}
          </div>
        </div>

        {/* Mobile Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto">
          {/* Mobile Hero */}
          <div className="px-4 py-4 flex-shrink-0 text-center border-b" style={{ borderColor: styles.borderColor }}>
            <h3 className="text-[14px] font-extrabold leading-tight tracking-tight mb-1" style={{ color: styles.text }}>
              {creatorName}'s Space
            </h3>
            <p className="text-[9px]" style={{ color: styles.textMuted }}>
              Exclusive masterclasses, drops & direct chats.
            </p>
          </div>
          {renderTabContent()}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="h-12 border-t flex items-center justify-around flex-shrink-0"
          style={{ borderColor: styles.borderColor, background: 'rgba(0,0,0,0.1)' }}
        >
          {allTabs.slice(0, 4).map(t => {
            const isTabActive = activeTab === t
            return (
              <button 
                key={t} 
                onClick={() => setActiveTab(t)}
                className="flex flex-col items-center justify-center py-1 flex-1 text-[8px] font-bold"
                style={{ color: isTabActive ? styles.accent : styles.textMuted }}
              >
                <span>{t.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Desktop View
  return (
    <div className="w-full h-full flex flex-col" style={{ background: styles.bg }}>
      {/* Desktop Header */}
      <div 
        className="flex items-center justify-between px-5 py-3 border-b flex-shrink-0"
        style={{ borderColor: styles.borderColor }}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded overflow-hidden flex items-center justify-center flex-shrink-0 relative" style={{ background: styles.accentBg, border: `1px solid ${styles.accentBorder}` }}>
            <span style={{ fontSize: '8px', color: styles.accent, fontWeight: 900 }}>
              {(creatorName || blueprint.name || 'C').charAt(0).toUpperCase()}
            </span>
            {resolvedAvatar ? (
              <img 
                src={resolvedAvatar} 
                alt="" 
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover" 
                onError={e => {
                  if (!e.currentTarget.dataset.proxied && resolvedAvatar.startsWith('http')) {
                    e.currentTarget.dataset.proxied = 'true';
                    e.currentTarget.src = `/api/proxy/avatar?url=${encodeURIComponent(resolvedAvatar)}`;
                  } else {
                    e.currentTarget.style.display = 'none';
                  }
                }} 
              />
            ) : null}
          </div>
          <span className="text-[11px] font-black tracking-tight" style={{ color: styles.text }}>
            {blueprint.name}
          </span>
        </div>

        {/* Desktop Tabs */}
        <div className="flex gap-4">
          {allTabs.map(t => {
            const isTabActive = activeTab === t
            return (
              <button 
                key={t} 
                onClick={() => setActiveTab(t)}
                className="text-[10px] font-bold tracking-tight py-1 relative transition-colors"
                style={{ color: isTabActive ? styles.accent : styles.textMuted }}
              >
                {t}
                {isTabActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" 
                    style={{ background: styles.accent }} 
                  />
                )}
              </button>
            )
          })}
        </div>
        <div className="w-16 h-5 rounded-full text-[9px] font-extrabold flex items-center justify-center uppercase tracking-wide cursor-pointer whitespace-nowrap shrink-0" 
          style={{ background: styles.accent, color: isDark ? '#000000' : '#ffffff' }}
        >
          Sign In
        </div>
      </div>

      {/* Desktop Hero Section */}
      <div className="px-6 py-5 flex-shrink-0 border-b" style={{ borderColor: styles.borderColor }}>
        <h3 className="text-[16px] font-extrabold leading-tight tracking-tight mb-1" style={{ color: styles.text }}>
          Welcome to {blueprint.name}
        </h3>
        <p className="text-[10px] max-w-lg" style={{ color: styles.textMuted, lineHeight: '1.4' }}>
          Get direct access to step-by-step masterclasses, visual assets, and monthly live AMAs hosted by {creatorName}.
        </p>
      </div>

      {/* Desktop Scrollable Grid content */}
      <div className="flex-1 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  )
}

function getVariationsForCreator(creatorData, extraTabs = []) {
  const name = creatorData.name || creatorData.handle?.replace('@', '') || 'Creator'
  const niche = (creatorData.niche || 'Digital').replace(/&/g, 'and')
  const baseTabs = extraTabs.includes('Podcast') ? ['Podcast section'] : []

  return [
    {
      id: 'membership',
      name: `${name}'s Inner Circle`,
      type: 'Membership',
      preview: 'community',
      description: `Gated inner circle with direct access, live monthly AMAs, and private forum discussions.`,
      features: ['Private forum', 'Tiered tiers', 'Monthly AMAs', 'Exclusive perks', ...baseTabs],
      tagline: 'Private community for your most loyal followers'
    },
    {
      id: 'masterclass',
      name: `${name}'s Masterclass Academy`,
      type: 'Web App',
      preview: 'webapp',
      description: `Structured curriculum modules, masterclass video streaming, and verified toolkits.`,
      features: ['Course builder', 'Interactive worksheets', 'Video vault', 'Certificates of completion', ...baseTabs],
      tagline: 'Step-by-step masterclasses and video curriculums'
    },
    {
      id: 'mobile-app',
      name: `${name} Official App & Passes`,
      type: 'Mobile App',
      preview: 'mobile',
      description: `Dedicated handheld experience with instant push notifications, backstage drops, and feeds.`,
      features: ['Push notifications', 'Members feed', 'Exclusive drops', 'In-app purchases', ...baseTabs],
      tagline: 'Backstage drops and direct daily mobile engagement'
    },
    {
      id: 'vault-store',
      name: `${name}'s Digital Vault & Library`,
      type: 'Digital Products',
      preview: 'store',
      description: `Comprehensive digital storefront with verified frameworks, templates, and downloadable assets.`,
      features: ['Instant delivery', 'Resource library', 'Templates & toolkits', 'Direct consultation', ...baseTabs],
      tagline: 'Instant delivery digital assets and resource vault'
    }
  ]
}

export default function Preview() {
  const { next, creatorData, updateCreator, prev, requestWipeCreator } = useForge()
  const [visible, setVisible] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [theme, setTheme] = useState('dark')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [appliedPrompts, setAppliedPrompts] = useState([])
  const [variationIndex, setVariationIndex] = useState(0)

  const accent = getAccent(creatorData)
  const dynamicAccent = accent.color
  const dynamicAccentBg = `rgba(${accent.rgb}, 0.12)`
  const dynamicAccentBorder = `rgba(${accent.rgb}, 0.28)`

  const [currentBlueprint, setCurrentBlueprint] = useState(() => {
    return creatorData.blueprint || {
      name: `${creatorData.name || 'Creator'}'s Space`,
      type: 'Membership',
      preview: 'community',
      features: ['Private forum', 'Tiered tiers', 'Monthly AMAs', 'Exclusive perks']
    }
  })

  const [activeTab, setActiveTab] = useState(() => {
    const p = currentBlueprint.preview || 'community'
    if (p === 'webapp') return 'Courses'
    if (p === 'mobile') return 'Home Feed'
    if (p === 'store') return 'All Products'
    return 'Announcements'
  })

  const [viewMode, setViewMode] = useState('desktop') // 'desktop' | 'mobile' | 'dashboard'
  const isMobileView = viewMode === 'mobile'
  const [extraTabs, setExtraTabs] = useState(() => creatorData.extraTabs || [])
  const [localFeatures, setLocalFeatures] = useState(() => {
    return currentBlueprint.features || ['Private forum', 'Tiered tiers', 'Monthly AMAs']
  })

  useEffect(() => {
    const previewType = currentBlueprint.preview || 'webapp'
    if (previewType === 'webapp') setActiveTab('Courses')
    else if (previewType === 'mobile') setActiveTab('Home Feed')
    else if (previewType === 'community') setActiveTab('Announcements')
    else if (previewType === 'store') setActiveTab('All Products')
  }, [currentBlueprint.preview])

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const processPrompt = (text) => {
    const p = text.toLowerCase()
    
    // Check regeneration request
    if (p.includes('regenerat')) {
      const variations = getVariationsForCreator(creatorData, extraTabs)
      const nextIdx = (variationIndex + 1) % variations.length
      setVariationIndex(nextIdx)
      const nextBp = variations[nextIdx]
      setCurrentBlueprint(nextBp)
      setLocalFeatures(nextBp.features)

      if (nextBp.preview === 'webapp') setActiveTab('Courses')
      else if (nextBp.preview === 'mobile') setActiveTab('Home Feed')
      else if (nextBp.preview === 'community') setActiveTab('Announcements')
      else if (nextBp.preview === 'store') setActiveTab('All Products')

      const updated = {
        ...creatorData,
        blueprint: nextBp,
        productName: nextBp.name,
        features: nextBp.features,
        theme,
        isMobileView,
        viewMode
      }
      updateCreator(updated)
      try {
        localStorage.setItem('forge_creator_data', JSON.stringify(updated))
      } catch {}
      return
    }

    // Theme shifts
    if (p.includes('premium')) {
      setTheme('premium')
      setCurrentBlueprint(prev => {
        const updated = {
          ...prev,
          name: prev.name.includes('VIP') ? prev.name : `VIP ${prev.name}`
        }
        updateCreator({ blueprint: updated, productName: updated.name, theme: 'premium' })
        try {
          localStorage.setItem('forge_creator_data', JSON.stringify({ ...creatorData, blueprint: updated, productName: updated.name, theme: 'premium' }))
        } catch {}
        return updated
      })
    } else if (p.includes('minimalist') || p.includes('minimal')) {
      setTheme('minimalist')
    } else if (p.includes('women') || p.includes('female') || p.includes('feminine') || p.includes('rose') || p.includes('25')) {
      setTheme('feminine')
    } else if (p.includes('light') || p.includes('paper')) {
      setTheme('light')
    } else if (p.includes('dark') || p.includes('graphite')) {
      setTheme('dark')
    }

    // View shifts
    if (p.includes('mobile') || p.includes('phone') || p.includes('handheld')) {
      setViewMode('mobile')
      updateCreator({ isMobileView: true, viewMode: 'mobile' })
    } else if (p.includes('desktop') || p.includes('web') || p.includes('laptop')) {
      setViewMode('desktop')
      updateCreator({ isMobileView: false, viewMode: 'desktop' })
    } else if (p.includes('dashboard') || p.includes('admin') || p.includes('creator os') || p.includes('studio') || p.includes('stats')) {
      setViewMode('dashboard')
    }

    // Dynamic Features / Tabs additions
    if (p.includes('podcast')) {
      if (!extraTabs.includes('Podcast')) {
        setExtraTabs(prev => [...prev, 'Podcast'])
        setLocalFeatures(prev => {
          const nextF = prev.includes('Podcast section') ? prev : [...prev, 'Podcast section']
          updateCreator({ features: nextF, extraTabs: [...extraTabs, 'Podcast'] })
          try {
            localStorage.setItem('forge_creator_data', JSON.stringify({ ...creatorData, features: nextF, extraTabs: [...extraTabs, 'Podcast'] }))
          } catch {}
          return nextF
        })
      }
      setActiveTab('Podcast')
    }
    
    if (p.includes('community')) {
      const previewType = currentBlueprint.preview || 'webapp'
      if (previewType === 'webapp') setActiveTab('Community')
      else if (previewType === 'mobile') setActiveTab('Group Chat')
      else if (previewType === 'community') setActiveTab('Chat Room')
      setLocalFeatures(prev => {
        const nextF = prev.includes('Private forum') ? prev : ['Private forum', ...prev]
        updateCreator({ features: nextF })
        return nextF
      })
    }

    // Custom prompt text name modification if not a known trigger
    if (!p.includes('premium') && !p.includes('minimal') && !p.includes('women') && !p.includes('mobile') && !p.includes('podcast') && !p.includes('community')) {
      if (text.trim().length > 3 && text.trim().length < 60) {
        setCurrentBlueprint(prev => {
          const updated = { ...prev, name: text.trim() }
          updateCreator({ blueprint: updated, productName: updated.name })
          try {
            localStorage.setItem('forge_creator_data', JSON.stringify({ ...creatorData, blueprint: updated, productName: updated.name }))
          } catch {}
          return updated
        })
      }
    }
  }

  const handlePromptSend = () => {
    if (!prompt.trim()) return
    setIsRegenerating(true)
    setAppliedPrompts(prev => [...prev, prompt])
    const currentPrompt = prompt
    setPrompt('')
    
    setTimeout(() => {
      processPrompt(currentPrompt)
      setIsRegenerating(false)
    }, 1000)
  }

  const handleQuickPrompt = (p) => {
    setIsRegenerating(true)
    if (!p.toLowerCase().includes('regenerat')) {
      setAppliedPrompts(prev => [...prev, p])
    }
    
    setTimeout(() => {
      processPrompt(p)
      setIsRegenerating(false)
    }, 1000)
  }

  const removeAppliedPrompt = (promptText) => {
    setIsRegenerating(true)
    setTimeout(() => {
      setAppliedPrompts(prev => prev.filter(x => x !== promptText))
      const p = promptText.toLowerCase()
      
      if (p.includes('premium') || p.includes('minimalist') || p.includes('minimal') || 
          p.includes('women') || p.includes('female') || p.includes('feminine') || p.includes('rose') || p.includes('25') ||
          p.includes('light') || p.includes('paper') || p.includes('dark') || p.includes('graphite')) {
        setTheme('dark')
      }

      if (p.includes('mobile') || p.includes('phone') || p.includes('handheld') || p.includes('dashboard') || p.includes('admin') || p.includes('creator os')) {
        setViewMode('desktop')
      }

      if (p.includes('podcast')) {
        setExtraTabs(prev => prev.filter(x => x !== 'Podcast'))
        setLocalFeatures(prev => prev.filter(x => x !== 'Podcast section'))
        setActiveTab('Courses')
      }
      setIsRegenerating(false)
    }, 600)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={prev}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            ← Back
          </button>
          <div className="flex items-center gap-2.5">
            <WingLogo size={22} color={dynamicAccent} />
            <span className="text-white font-semibold text-[15px] tracking-tight">CoLaunch</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={requestWipeCreator}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-red-400/80 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all cursor-pointer"
            title="Wipe creator from storage"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Creator</span>
          </button>

          <div className="flex items-center gap-1.5">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className="rounded-full transition-all duration-300"
                style={{
                  width: i === 5 ? '20px' : '6px',
                  height: '6px',
                  background: i === 5 ? dynamicAccent : i < 5 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.12)',
                }}
              />
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left: Live Preview */}
        <div
          className="flex-1 p-6 flex flex-col"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.55s ease',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="forge-label mb-1">Live preview</p>
              <h2
                className="forge-heading"
                style={{ fontSize: '22px', letterSpacing: '-0.03em' }}
              >
                {currentBlueprint.name}
              </h2>
            </div>

            {/* Viewport layout toggles - Flat pill switcher */}
            <div 
              className="flex items-center gap-1 p-0.5 rounded-xl border bg-black/40"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <button
                onClick={() => {
                  setViewMode('desktop')
                  setAppliedPrompts(prev => prev.filter(p => !p.toLowerCase().includes('mobile') && !p.toLowerCase().includes('dashboard')))
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all duration-150 cursor-pointer"
                style={{
                  background: viewMode === 'desktop' ? dynamicAccent : 'transparent',
                  color: viewMode === 'desktop' ? (isLightColor(dynamicAccent) ? '#000000' : '#ffffff') : 'rgba(255,255,255,0.45)',
                }}
              >
                <Laptop size={12} />
                Member Web
              </button>
              <button
                onClick={() => {
                  setViewMode('mobile')
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all duration-150 cursor-pointer"
                style={{
                  background: viewMode === 'mobile' ? dynamicAccent : 'transparent',
                  color: viewMode === 'mobile' ? (isLightColor(dynamicAccent) ? '#000000' : '#ffffff') : 'rgba(255,255,255,0.45)',
                }}
              >
                <Smartphone size={12} />
                Member Mobile
              </button>
              <button
                onClick={() => {
                  setViewMode('dashboard')
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all duration-150 cursor-pointer"
                style={{
                  background: viewMode === 'dashboard' ? dynamicAccent : 'transparent',
                  color: viewMode === 'dashboard' ? (isLightColor(dynamicAccent) ? '#000000' : '#ffffff') : 'rgba(255,255,255,0.45)',
                }}
              >
                <BarChart2 size={12} />
                Creator OS
              </button>
            </div>

            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: dynamicAccent }} />
              <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Generated</span>
            </div>
          </div>

          {/* Preview window */}
          <div className="flex-1 flex items-center justify-center">
            {viewMode === 'mobile' ? (
              /* Mobile Shell Frame - Flat, no box-shadow */
              <div
                className="relative rounded-[36px] border-[8px] overflow-hidden flex flex-col transition-all duration-300"
                style={{
                  width: '290px',
                  height: '480px',
                  borderColor: 'rgba(255,255,255,0.14)',
                  background: '#000',
                }}
              >
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-[#141414] rounded-b-xl z-20" />
                
                {/* Regenerating overlay */}
                {isRegenerating && (
                  <div
                    className="absolute inset-0 flex items-center justify-center z-30 animate-fade-in"
                    style={{ background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(4px)' }}
                  >
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Refining...</p>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-hidden">
                  <AppMockup 
                    theme={theme} 
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    blueprint={currentBlueprint}
                    creatorData={creatorData}
                    extraTabs={extraTabs}
                    isMobile={true}
                    viewMode="mobile"
                  />
                </div>
              </div>
            ) : (
              /* Desktop / Dashboard Browser Shell Frame - Flat, hairline border, no shadow */
              <div
                className="w-full flex-1 rounded-2xl border overflow-hidden relative flex flex-col transition-all duration-300"
                style={{
                  borderColor: 'rgba(255,255,255,0.07)',
                  background: '#0a0a0a',
                  minHeight: '400px',
                  maxHeight: '560px',
                }}
              >
                {/* Window chrome */}
                <div
                  className="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0"
                  style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
                >
                  {[1,2,3].map(i => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
                  ))}
                  <div
                    className="flex-1 mx-3 h-5 rounded-md flex items-center px-2"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      {viewMode === 'dashboard' 
                        ? `${currentBlueprint.name.toLowerCase().replace(/\s+/g, '')}.creator.studio`
                        : `${currentBlueprint.name.toLowerCase().replace(/\s+/g, '')}.forge.app`}
                    </span>
                  </div>
                </div>

                {/* Regenerating overlay */}
                {isRegenerating && (
                  <div
                    className="absolute inset-0 flex items-center justify-center z-10"
                    style={{ background: 'rgba(8,8,8,0.85)', backdropFilter: 'blur(4px)' }}
                  >
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-[13px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Refining...</p>
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-hidden">
                  <AppMockup 
                    theme={theme} 
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    blueprint={currentBlueprint}
                    creatorData={creatorData}
                    extraTabs={extraTabs}
                    isMobile={false}
                    viewMode={viewMode}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Applied prompts */}
          {appliedPrompts.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {appliedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => removeAppliedPrompt(p)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] hover:bg-red-500/10 hover:text-red-400 group transition-all duration-150 cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}
                  title="Click to remove refinement"
                >
                  <Check size={10} className="group-hover:hidden" />
                  <span className="hidden group-hover:inline font-bold">×</span>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Controls */}
        <div
          className="lg:w-[340px] border-l p-6 flex flex-col gap-6 overflow-y-auto"
          style={{
            borderColor: 'rgba(255,255,255,0.07)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateX(0)' : 'translateX(20px)',
            transition: 'all 0.55s cubic-bezier(0.16,1,0.3,1) 0.1s',
          }}
        >
          {/* What was built */}
          <div>
            <p className="forge-label mb-3">What's included</p>
            <div className="space-y-2">
              {localFeatures.map(label => {
                const matched = FEATURES.find(f => f.label === label)
                const Icon = matched ? matched.icon : Layout
                return (
                  <div key={label} className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.07)' }}
                    >
                      <Icon size={13} className="text-white/60" />
                    </div>
                    <span className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{label}</span>
                    <Check size={12} className="ml-auto text-white/30" />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

          {/* Prompt to refine */}
          <div>
            <p className="forge-label mb-3">Refine with Forge</p>

            {/* Quick prompts */}
            <div className="flex flex-wrap gap-2 mb-4">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => handleQuickPrompt(p)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150 cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.55)',
                    border: '1px solid ' + (theme === 'premium' && p.includes('premium') ? 'rgba(234, 179, 8, 0.4)' : 'rgba(255,255,255,0.07)'),
                  }}
                  onMouseEnter={e => {
                    e.target.style.background = 'rgba(255,255,255,0.1)'
                    e.target.style.color = 'rgba(255,255,255,0.85)'
                  }}
                  onMouseLeave={e => {
                    e.target.style.background = 'rgba(255,255,255,0.06)'
                    e.target.style.color = 'rgba(255,255,255,0.55)'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Custom prompt input - Clean flat input, no sparkles */}
            <div
              className="flex items-center gap-2 rounded-xl border px-4 py-3 mb-3"
              style={{ background: '#111', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <SlidersHorizontal size={14} className="text-white/25 flex-shrink-0" />
              <input
                className="bg-transparent flex-1 text-[13px] text-white focus:outline-none"
                placeholder="Describe a change (e.g. Creator OS, minimalist)..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePromptSend()}
              />
              <button
                onClick={handlePromptSend}
                disabled={!prompt.trim()}
                className="text-white/30 hover:text-white/70 transition-colors disabled:opacity-30 cursor-pointer"
              >
                <Send size={14} />
              </button>
            </div>

            <button
              onClick={() => handleQuickPrompt('Regenerate')}
              disabled={isRegenerating}
              className="w-full text-[13px] py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border"
              style={{
                background: dynamicAccentBg,
                borderColor: dynamicAccentBorder,
                color: dynamicAccent,
              }}
            >
              <RefreshCw size={13} className={isRegenerating ? 'animate-spin' : ''} />
              {isRegenerating ? 'Regenerating blueprint...' : 'Regenerate'}
            </button>
          </div>

          <div className="mt-auto pt-4">
            <button
              onClick={() => {
                const finalPayload = {
                  blueprint: currentBlueprint,
                  productName: currentBlueprint.name,
                  features: localFeatures,
                  theme,
                  isMobileView,
                  viewMode,
                  extraTabs,
                };
                updateCreator(finalPayload);
                try {
                  localStorage.setItem('forge_creator_data', JSON.stringify({ ...creatorData, ...finalPayload }));
                } catch {}
                next();
              }}
              disabled={isRegenerating}
              className="w-full text-[14px] py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer"
              style={{
                background: isRegenerating ? 'rgba(255,255,255,0.08)' : dynamicAccent,
                color: isRegenerating ? 'rgba(255,255,255,0.4)' : (isLightColor(dynamicAccent) ? '#000000' : '#ffffff'),
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              {isRegenerating ? (
                <span className="flex items-center gap-2">
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Regenerating blueprint...</span>
                </span>
              ) : (
                <>
                  Looks good, build it
                  <ArrowRight size={15} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
