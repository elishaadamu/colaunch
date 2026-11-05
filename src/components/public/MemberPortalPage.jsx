import { useState, useEffect } from 'react'
import {
  LayoutGrid, BookOpen, Code, MessageSquare, Tv, Lock, Play,
  Check, CheckCircle2, Download, ExternalLink, Send, Copy, ArrowRight, ShieldCheck
} from 'lucide-react'

// Dynamic Niche Data Generator
function getMemberPortalData(creatorData) {
  const niche = (creatorData.niche || 'Technology').toLowerCase()
  const name = creatorData.name || creatorData.handle?.replace(/^@+/, '') || 'Creator'
  const productName = creatorData.blueprint?.name || creatorData.productName || 'Creator Academy'

  const isCooking = niche.includes('cook') || niche.includes('food') || niche.includes('culinary') || niche.includes('meal') || name.toLowerCase().includes('chef')
  const isFitness = niche.includes('fit') || niche.includes('workout') || niche.includes('train') || niche.includes('gym')
  const isGaming = niche.includes('game') || niche.includes('gaming') || niche.includes('play') || niche.includes('stream')

  if (isCooking) {
    return {
      activeLessonTitle: 'Module 03: Temperature Control, Emulsions & Secret Pastry Ganache',
      activeLessonDesc: 'Master molecular emulsification and high-heat pan searing. Complete the signature plating submission to unlock Masterclass Batch #2 ingredients.',
      activeModuleNum: '03',
      progressPercent: 68,
      assetsDeployed: '16 / 20',
      modules: [
        {
          id: 1,
          title: 'Artisanal Sauces & Emulsions',
          meta: '6 Guides · 1.8 hrs · Recipe Cards',
          status: 'completed',
          lessons: [
            { id: 'c1', title: 'Hollandaise & Emulsion Phase Chemistry', dur: '18m', type: 'Video + Card', completed: true },
            { id: 'c2', title: 'Cold-Pressed Herb Oils & Infusions', dur: '22m', type: 'Video + Specs', completed: true },
            { id: 'c3', title: 'Velouté & Modern Reduction Bases', dur: '26m', type: 'Video + Lab', completed: true },
          ]
        },
        {
          id: 2,
          title: 'Knife Precision & Kitchen Mechanics',
          meta: '5 Guides · 2.2 hrs · Equipment Blueprint',
          status: 'completed',
          lessons: [
            { id: 'c4', title: 'Japanese Steel Blade Angles & Honing', dur: '24m', type: 'Video + Guide', completed: true },
            { id: 'c5', title: 'Brunoise & Julienne Precision Drills', dur: '30m', type: 'Practice Drill', completed: true },
          ]
        },
        {
          id: 3,
          title: 'Temperature Control & Pastry Ganache',
          meta: '6 Guides · 2.5 hrs · Active Assignment',
          status: 'in_progress',
          lessons: [
            { id: 'c6', title: 'Thermal Inversion & Sugar Crystallization', dur: '28m', type: 'Video + Chart', completed: true },
            { id: 'c7', title: 'High-Gloss Red Pepper Ganache Formulation', dur: '38m', type: 'Active Assignment', completed: false, current: true },
            { id: 'c8', title: 'Tart Shell Blind Baking & Moisture Barriers', dur: '22m', type: 'Hands-on Lab', completed: false },
          ]
        },
        {
          id: 4,
          title: 'Commercial Plating & Tasting Menus',
          meta: '4 Guides · 1.6 hrs · Capstone Box',
          status: 'locked',
          lessons: [
            { id: 'c9', title: 'Negative Space & Architectural Plating', dur: '25m', type: 'Locked Guide', completed: false },
            { id: 'c10', title: 'Batch Production & Multi-Course Timing', dur: '35m', type: 'Locked Guide', completed: false },
          ]
        },
      ],
      wins: [
        { author: 'Marcus B. · Executive Sous Chef', time: '1h ago', channel: '#culinary-wins', quote: 'The Ganache temperature curve in Module 3 completely stopped our separation issues during dinner rush.' },
        { author: 'Elena R. · Bakery Owner', time: '4h ago', channel: '#batch-prep', quote: 'Box #1 secret spice blend sold out in our cafe in under 3 hours. Reordering bulk supply.' },
      ],
      coachingTopic: `Live Culinary Masterclass & Plating Critique with ${name}`,
      coachingDate: 'This Friday · 4:00 PM EST',
      communityChat: [
        { id: 1, sender: name, role: 'Executive Chef', time: '10:30 AM', text: 'Welcome team to Week 3! Office hours are this Friday. Post your plating photos below for live critique.' },
        { id: 2, sender: 'Chef David', role: 'VIP Member', time: '11:15 AM', text: 'The emulsion temp chart saved my hollandaise this morning. Zero split!' },
        { id: 3, sender: 'Elena R.', role: 'VIP Member', time: '12:04 PM', text: 'Working on the ganache gloss test right now, texture is immaculate.' },
      ]
    }
  }

  if (isFitness) {
    return {
      activeLessonTitle: 'Module 03: Periodization Microcycles & Biomechanical Form Mastery',
      activeLessonDesc: 'Execute the 6-phase periodization protocol. Submit your 4K lift video for automated AI kinematic and bar path analysis.',
      activeModuleNum: '03',
      progressPercent: 68,
      assetsDeployed: '18 / 24',
      modules: [
        {
          id: 1,
          title: 'Kinetic Chain Stabilization',
          meta: '6 Workouts · 2.1 hrs · Form Library',
          status: 'completed',
          lessons: [
            { id: 'f1', title: 'Foot Rooting & Hip Hinge Mechanics', dur: '20m', type: 'Biomechanics Lab', completed: true },
            { id: 'f2', title: 'Thoracic Extension & Shoulder Packing', dur: '24m', type: 'Video + Drill', completed: true },
          ]
        },
        {
          id: 2,
          title: 'Hypertrophy Biomechanics & RPE Targets',
          meta: '5 Workouts · 3.0 hrs · Macro Calculator',
          status: 'completed',
          lessons: [
            { id: 'f3', title: 'Length-Tension Curve Optimization', dur: '29m', type: 'Video + Calc', completed: true },
            { id: 'f4', title: 'RPE 8-9 Fatigue Management', dur: '25m', type: 'Spreadsheet', completed: true },
          ]
        },
        {
          id: 3,
          title: 'Periodization Microcycles & Recovery',
          meta: '6 Workouts · 2.7 hrs · Active Protocol',
          status: 'in_progress',
          lessons: [
            { id: 'f5', title: 'Wave Loading & Volume Deload Triggers', dur: '32m', type: 'Active Protocol', completed: false, current: true },
            { id: 'f6', title: 'Sleep Architecture & Cortisol Buffering', dur: '28m', type: 'Biohacking Guide', completed: false },
          ]
        },
        {
          id: 4,
          title: 'Peak Week & Athletic Conditioning',
          meta: '4 Workouts · 1.8 hrs · Capstone Assessment',
          status: 'locked',
          lessons: [
            { id: 'f7', title: 'Carb Depletion & Supercompensation', dur: '30m', type: 'Locked Guide', completed: false },
            { id: 'f8', title: 'Max Testing Day Protocol', dur: '45m', type: 'Locked Guide', completed: false },
          ]
        },
      ],
      wins: [
        { author: 'Chris D. · Competitive Lifter', time: '2h ago', channel: '#prs-and-wins', quote: 'Added 25 lbs to my deadlift without lower back fatigue using the Module 2 rooting setup.' },
        { author: 'Taylor S. · CrossFit Coach', time: '6h ago', channel: '#coaching-clinic', quote: 'The periodization spreadsheet has completely transformed our morning athlete programming.' },
      ],
      coachingTopic: `Form Check Friday: Live Biomechanics Review with ${name}`,
      coachingDate: 'This Friday · 4:00 PM EST',
      communityChat: [
        { id: 1, sender: name, role: 'Head Coach', time: '09:00 AM', text: 'Week 3 check-ins are open! Upload your squat depth videos to #form-checks before Friday 2 PM.' },
        { id: 2, sender: 'Chris D.', role: 'VIP Athlete', time: '10:45 AM', text: 'Hit a 405lb squat PR this morning on the wave loading protocol!' },
        { id: 3, sender: 'Taylor S.', role: 'VIP Athlete', time: '11:20 AM', text: 'The hip mobility routine cleared up all my knee pinch.' },
      ]
    }
  }

  // DEFAULT / TECH / DEV / ANDROID / SAAS / EDUCATION
  return {
    activeLessonTitle: 'Module 03: Reactive State Flows & High-Performance Compose Modifiers',
    activeLessonDesc: 'Deconstruct the architectural patterns powering 60fps fluid UI layouts. Complete the benchmark test suite to unlock Module 04 capstone assets.',
    activeModuleNum: '03',
    progressPercent: 68,
    assetsDeployed: '18 / 24',
    modules: [
      {
        id: 1,
        title: 'Core Architecture Foundations',
        meta: '6 Lessons · 2.4 hrs · 4 Production Repos',
        status: 'completed',
        lessons: [
          { id: 'm1', title: 'Unidirectional Data Flow & State Holders', dur: '22m', type: 'Video + Repo', completed: true },
          { id: 'm2', title: 'Clean Architecture Domain Model Separation', dur: '28m', type: 'Video + Specs', completed: true },
          { id: 'm3', title: 'Dependency Injection with Koin & Hilt', dur: '24m', type: 'Starter Repo', completed: true },
        ]
      },
      {
        id: 2,
        title: 'High-Performance UI Render Pipeline',
        meta: '5 Lessons · 3.1 hrs · 8 Reusable Components',
        status: 'completed',
        lessons: [
          { id: 'm4', title: 'Custom Layout Measure & Placement Pass', dur: '32m', type: 'Video + Blueprint', completed: true },
          { id: 'm5', title: 'SubcomposeLayout for Virtualized Feeds', dur: '29m', type: 'Source Code', completed: true },
          { id: 'm6', title: 'Hardware Acceleration & Draw Modifiers', dur: '26m', type: 'Benchmark Lab', completed: true },
        ]
      },
      {
        id: 3,
        title: 'Reactive State Flows & Custom Modifiers',
        meta: '6 Lessons · 2.8 hrs · Active Assignment',
        status: 'in_progress',
        lessons: [
          { id: 'm7', title: 'StateFlow vs SharedFlow Backpressure Handling', dur: '27m', type: 'Video + Code', completed: true },
          { id: 'm8', title: 'DerivedStateOf & Snapshot Invalidation Phasing', dur: '34m', type: 'Video + Lab', completed: true },
          { id: 'm9', title: 'Recomposition Loop Profiling & LeakCanary', dur: '38m', type: 'Active Assignment', completed: false, current: true },
        ]
      },
      {
        id: 4,
        title: 'Production Deployment & Benchmark CI/CD',
        meta: '4 Lessons · 1.9 hrs · Final Capstone',
        status: 'locked',
        lessons: [
          { id: 'm10', title: 'Macrobenchmark Suite & Frame Time Profiling', dur: '25m', type: 'Locked Guide', completed: false },
          { id: 'm11', title: 'Baseline Profile Generation for Instant Start', dur: '31m', type: 'Locked Guide', completed: false },
        ]
      },
    ],
    wins: [
      { author: 'Sarah M. · Staff Android Engineer', time: '2h ago', channel: '#production-wins', quote: 'Refactored our app navigation with the Module 2 blueprint. UI render latency dropped 44% in production!' },
      { author: 'David K. · Senior Mobile Lead', time: '5h ago', channel: '#sprint-3-help', quote: 'All 42 benchmark tests passed on our local device farm. Best architecture guide out there.' },
      { author: 'Marcus Chen · Founding Member', time: '1d ago', channel: '#code-reviews', quote: 'The state hoist pattern in Module 3 completely solved our recomposition loop bug.' },
    ],
    coachingTopic: `Live Architecture Teardown & Code Review with ${name}`,
    coachingDate: 'This Friday · 4:00 PM EST',
    communityChat: [
      { id: 1, sender: name, role: 'Lead Architect', time: '09:30 AM', text: `Welcome team to Week 3! Our live architecture teardown is this Friday at 4 PM EST. Drop any blocking PR questions here.` },
      { id: 2, sender: 'Sarah M.', role: 'Staff Engineer', time: '10:14 AM', text: 'The custom Modifier blueprint from Module 2 locked our scroll rate at a steady 60fps on low-end test devices.' },
      { id: 3, sender: 'David K.', role: 'Senior Dev', time: '11:05 AM', text: 'Benchmark suite ran clean across 12 devices. Huge reduction in recomposition overhead.' },
    ]
  }
}

export default function MemberPortalPage({ handle }) {
  const cleanHandle = (handle || 'creator').replace(/^@+/, '')

  // Resolve creator data
  const [creatorData, setCreatorData] = useState(() => {
    try {
      const active = localStorage.getItem('forge_creator_data')
      if (active) {
        const parsed = JSON.parse(active)
        const parsedHandle = (parsed.handle || '').replace(/^@+/, '').toLowerCase()
        if (parsedHandle === cleanHandle.toLowerCase() || !cleanHandle) {
          return parsed
        }
      }
    } catch (_) {}

    // Channel specific profiles
    if (cleanHandle.toLowerCase().includes('android')) {
      return {
        name: 'Android Developers',
        handle: '@AndroidDevelopers',
        niche: 'Technology',
        productName: 'Compose Blueprint Library',
        followers: '1440000',
        avatarUrl: 'https://yt3.googleusercontent.com/ytc/AIdro_k6Hk_7eQ1JbH6a9ZtJk1s6v4J8z7f7e9Q8w5e4=s176-c-k-c0x00ffffff-no-rj',
        blueprint: {
          name: 'Compose Blueprint Library',
          description: 'Enterprise Jetpack Compose Architecture, Reusable Layouts & Reactive State Pipeline',
        }
      }
    }

    if (cleanHandle.toLowerCase().includes('brocode')) {
      return {
        name: 'Bro Code',
        handle: '@BroCodez',
        niche: 'Coding',
        productName: 'Full-Stack Developer Sandbox',
        followers: '2800000',
        blueprint: {
          name: 'Full-Stack Developer Sandbox',
          description: 'Interactive coding challenges, automated grading, and production portfolio projects.'
        }
      }
    }

    return {
      name: cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1),
      handle: `@${cleanHandle}`,
      niche: 'Digital Creation',
      productName: `${cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1)} Pro Suite`,
      followers: '1000000',
      blueprint: {
        name: `${cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1)} Pro Suite`,
        description: 'Comprehensive mastery platform and private member network.'
      }
    }
  })

  const name = creatorData.name || 'Creator'
  const productName = creatorData.blueprint?.name || creatorData.productName || 'Creator Academy'
  const niche = (creatorData.niche || 'Technology').toLowerCase()
  const followers = creatorData.followers ? Number(creatorData.followers).toLocaleString() : '1,000,000'
  const avatarUrl = creatorData.avatarUrl
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  const isCoding = niche.includes('code') || niche.includes('program') || niche.includes('dev') || niche.includes('software') || niche.includes('tech') || name.toLowerCase().includes('bro code') || name.toLowerCase().includes('android') || productName.toLowerCase().includes('compose') || productName.toLowerCase().includes('code') || productName.toLowerCase().includes('blueprint')
  const isAndroid = name.toLowerCase().includes('android') || productName.toLowerCase().includes('compose')

  const mockData = getMemberPortalData(creatorData)

  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard' | 'curriculum' | 'sandbox' | 'network' | 'coaching'
  const [chatMessages, setChatMessages] = useState(() => mockData.communityChat || [])
  const [chatInput, setChatInput] = useState('')
  const [activeFile, setActiveFile] = useState(isAndroid ? 'ComposeBenchmark.kt' : 'main.py')
  const [testsRunning, setTestsRunning] = useState(false)
  const [testsPassed, setTestsPassed] = useState(true)
  const [rsvpConfirmed, setRsvpConfirmed] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [curriculumFilter, setCurriculumFilter] = useState('all')

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const handleSendMessage = (e) => {
    e?.preventDefault()
    if (!chatInput.trim()) return
    const msg = {
      id: Date.now(),
      sender: 'Alex Vance (You)',
      role: 'VIP Member',
      time: 'Just now',
      text: chatInput.trim()
    }
    setChatMessages(prev => [...prev, msg])
    setChatInput('')
  }

  const handleRunTests = () => {
    setTestsRunning(true)
    setTimeout(() => {
      setTestsRunning(false)
      setTestsPassed(true)
    }, 600)
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid, badge: null },
    { id: 'curriculum', label: 'Core Curriculum', icon: BookOpen, badge: '4 Modules' },
    ...(isCoding ? [{ id: 'sandbox', label: 'IDE Sandbox', icon: Code, badge: isAndroid ? 'Kotlin' : 'Py 3.12' }] : []),
    { id: 'network', label: 'Private Network', icon: MessageSquare, badge: '3 new' },
    { id: 'coaching', label: 'Live Coaching', icon: Tv, badge: 'Live Fri' },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#070709', color: '#ffffff' }}>
      {/* ── Top Global Portal Header ────────────────────────────────────────── */}
      <header className="border-b px-4 sm:px-6 py-3 flex items-center justify-between flex-wrap gap-3 sticky top-0 z-50 backdrop-blur-md"
        style={{ background: 'rgba(10, 10, 14, 0.95)', borderColor: 'rgba(255,255,255,0.08)' }}>
        
        {/* Left: Creator & Platform Identity */}
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img src={avatarUrl} className="w-8 h-8 rounded-none object-cover border border-white/10 shadow-md" alt="" onError={e => { e.currentTarget.style.display = 'none' }} style={{ borderRadius: '0px' }} />
          ) : (
            <div className="w-8 h-8 rounded-none flex items-center justify-center text-[11px] font-black text-white"
              style={{ background: '#c81e3c', borderRadius: '0px' }}>{initials}</div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[14px] font-bold text-white tracking-wide">{productName}</h1>
              <span className="text-[9px] font-mono px-2 py-0.5 font-bold uppercase tracking-wider"
                style={{ background: '#c81e3c', color: '#ffffff', borderRadius: '0px' }}>
                VIP MEMBER PORTAL
              </span>
            </div>
            <p className="text-[10px] text-white/40">Official Ecosystem by {name} · Cohort Batch #1</p>
          </div>
        </div>

        {/* Center: Live Cohort Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 border"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px' }}>
          <span className="w-2 h-2 rounded-none bg-emerald-400 inline-block animate-pulse" style={{ borderRadius: '0px' }} />
          <span className="text-[10.5px] font-mono text-white/80 font-medium">Sprint Active · Week 3 of 6</span>
          <span className="text-white/20">|</span>
          <span className="text-[10px] font-mono text-white/40">1,440+ Registered Builders</span>
        </div>

        {/* Right: Actions & Join CTA */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium border text-white/70 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0px' }}
          >
            {copiedLink ? <><Check size={12} className="text-emerald-400" /> Copied Link</> : <><Copy size={12} /> Share</>}
          </button>

          <a
            href={`/join/${cleanHandle}?tier=pro`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-[11.5px] font-bold transition-all hover:brightness-110 shadow-lg"
            style={{ background: '#c81e3c', color: '#ffffff', borderRadius: '0px' }}
          >
            <span>Join VIP Tier ($78/mo)</span>
            <ArrowRight size={12} className="text-white" />
          </a>
        </div>
      </header>

      {/* ── Main Workspace Body ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r p-3.5 flex flex-col gap-1 flex-shrink-0"
          style={{ background: '#0a0a0d', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="mb-2 px-2 py-1">
            <span className="text-[8.5px] font-mono uppercase tracking-wider text-white/30 font-bold">
              Member Syllabus
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-medium transition-all text-left"
                  style={{
                    background: isActive ? 'rgba(200, 30, 60, 0.18)' : 'transparent',
                    color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                    borderLeft: isActive ? '2px solid #c81e3c' : '2px solid transparent',
                    borderRadius: '0px'
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={13} style={{ color: isActive ? '#c81e3c' : 'rgba(255,255,255,0.4)' }} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className="text-[8.5px] font-mono px-1.5 py-0.2 font-semibold"
                      style={{
                        background: isActive ? '#c81e3c' : 'rgba(255,255,255,0.05)',
                        color: isActive ? '#ffffff' : 'rgba(255,255,255,0.4)',
                        borderRadius: '0px'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Member Identity Card */}
          <div className="mt-auto pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="p-2.5 border" style={{ background: '#0e0e13', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px' }}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-none flex items-center justify-center font-bold text-[9px] text-white flex-shrink-0"
                    style={{ background: '#c81e3c', borderRadius: '0px' }}>
                    M
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10.5px] font-bold text-white truncate">Alex Vance</p>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-none bg-emerald-400 inline-block" style={{ borderRadius: '0px' }} />
                      <span className="text-[8px] text-white/40 font-mono">Online · VIP</span>
                    </div>
                  </div>
                </div>
                <span className="text-[8px] font-mono px-1 py-0.2 font-bold"
                  style={{ background: 'rgba(200, 30, 60, 0.25)', color: '#ffffff', borderRadius: '0px' }}>
                  PRO PASS
                </span>
              </div>
              <div className="flex items-center justify-between text-[8.5px] text-white/40 font-mono pt-1 border-t border-white/5">
                <span>Member #042</span>
                <span>Cohort Batch #1</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Central Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto" style={{ background: '#070709' }}>
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-5">
              {/* Top Welcome Banner */}
              <div className="p-4 sm:p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                style={{ background: '#0e0e12', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px' }}>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-black text-white tracking-wide">Welcome back, Member</h2>
                    <span className="text-[9px] px-2 py-0.5 font-mono font-bold"
                      style={{ background: '#c81e3c', color: '#ffffff', borderRadius: '0px' }}>
                      VIP SEAT VERIFIED
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 mt-1">
                    {productName} · Masterclass Hub by {name} · Q4 Production Cycle
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2.5 py-1 border text-white/60"
                    style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '0px' }}>
                    Sprint Week 3 of 6
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-1 font-bold"
                    style={{ background: 'rgba(200, 30, 60, 0.25)', border: '1px solid rgba(200, 30, 60, 0.4)', color: '#ffffff', borderRadius: '0px' }}>
                    LIVE COHORT
                  </span>
                </div>
              </div>

              {/* 4 KPI Telemetry Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Card 1: Sprint Velocity */}
                <div className="p-3.5 border" style={{ background: '#0e0e12', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] uppercase font-bold tracking-wider text-white/40">Sprint Velocity</span>
                    <span className="text-[10px] font-mono text-[#c81e3c] font-bold">{mockData.progressPercent}%</span>
                  </div>
                  <p className="text-[18px] font-black text-white mt-1">Module {mockData.activeModuleNum}</p>
                  <div className="w-full h-1.5 bg-white/10 mt-2 overflow-hidden" style={{ borderRadius: '0px' }}>
                    <div className="h-full bg-[#c81e3c]" style={{ width: `${mockData.progressPercent}%`, borderRadius: '0px' }} />
                  </div>
                  <p className="text-[9px] text-white/40 mt-1.5 truncate">Lesson 4 of 6 in progress</p>
                </div>

                {/* Card 2: Deliverables Vault */}
                <div className="p-3.5 border" style={{ background: '#0e0e12', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] uppercase font-bold tracking-wider text-white/40">Deliverables</span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">+3 deployed</span>
                  </div>
                  <p className="text-[18px] font-black text-white mt-1">{mockData.assetsDeployed}</p>
                  <p className="text-[9px] text-white/40 mt-2 truncate">Production blueprints active</p>
                </div>

                {/* Card 3: Community Reach */}
                <div className="p-3.5 border" style={{ background: '#0e0e12', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] uppercase font-bold tracking-wider text-white/40">Active Network</span>
                    <span className="text-[10px] font-mono text-white/40">Verified</span>
                  </div>
                  <p className="text-[18px] font-black text-white mt-1">{followers}</p>
                  <p className="text-[9px] text-white/40 mt-2 truncate">Global registered builders</p>
                </div>

                {/* Card 4: Cohort Satisfaction */}
                <div className="p-3.5 border" style={{ background: '#0e0e12', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] uppercase font-bold tracking-wider text-white/40">Cohort Score</span>
                    <span className="text-[10px] font-mono text-amber-400 font-bold">★ 4.98</span>
                  </div>
                  <p className="text-[18px] font-black text-white mt-1">100% Outcome</p>
                  <p className="text-[9px] text-white/40 mt-2 truncate">Verified cohort pass rate</p>
                </div>
              </div>

              {/* Active Sprint Deliverable Hero Card */}
              <div className="p-4 sm:p-5 border relative overflow-hidden shadow-xl"
                style={{ background: 'linear-gradient(180deg, #121217 0%, #0d0d10 100%)', borderColor: 'rgba(200,30,60,0.3)', borderRadius: '0px' }}>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#c81e3c] inline-block animate-pulse" style={{ borderRadius: '0px' }} />
                    <span className="text-[9.5px] font-mono uppercase tracking-wider font-bold text-white/60">
                      ACTIVE SPRINT DELIVERABLE · LESSON 04 OF 06
                    </span>
                  </div>
                  <span className="text-[9.5px] font-mono text-white/40">⏱ 38m remaining</span>
                </div>

                <h3 className="text-[15px] font-bold text-white mb-1.5">
                  {mockData.activeLessonTitle}
                </h3>
                <p className="text-[11px] text-white/60 leading-relaxed mb-4 max-w-3xl">
                  {mockData.activeLessonDesc}
                </p>

                <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => setActiveTab('curriculum')}
                      className="flex items-center gap-1.5 px-4 py-2 font-bold text-[11px] transition-all hover:brightness-110 shadow-lg"
                      style={{ background: '#c81e3c', color: '#ffffff', borderRadius: '0px' }}
                    >
                      <Play size={11} className="fill-white text-white" />
                      Resume Lesson
                    </button>
                    <button
                      className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-medium border text-white/70 hover:text-white"
                      style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0px' }}
                    >
                      <Download size={11} />
                      Download Assets (.zip)
                    </button>
                    {isCoding && (
                      <button
                        onClick={() => setActiveTab('sandbox')}
                        className="flex items-center gap-1 px-3 py-2 text-[11px] font-medium text-white/60 hover:text-white"
                      >
                        <Code size={12} className="text-[#c81e3c]" />
                        <span>Interactive Sandbox →</span>
                      </button>
                    )}
                  </div>
                  <span className="text-[9.5px] font-mono text-white/40 hidden sm:inline">
                    Asset Vault: 4 Architectural Blueprints · 1 Benchmark Suite
                  </span>
                </div>
              </div>

              {/* Lower Section: 2 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left Column: Syllabus Roadmap (7 cols) */}
                <div className="lg:col-span-7 p-4 border" style={{ background: '#0e0e12', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px' }}>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="flex items-center gap-2">
                      <BookOpen size={13} className="text-[#c81e3c]" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white">Syllabus Milestones</span>
                    </div>
                    <button onClick={() => setActiveTab('curriculum')} className="text-[10px] text-[#c81e3c] font-semibold hover:underline">
                      View Full Syllabus →
                    </button>
                  </div>
                  <div className="space-y-2">
                    {mockData.modules.map((m, i) => (
                      <div
                        key={m.title}
                        onClick={() => setActiveTab('curriculum')}
                        className="p-2.5 border flex items-center justify-between gap-2 cursor-pointer transition-colors hover:bg-white/[0.03]"
                        style={{
                          background: m.status === 'in_progress' ? 'rgba(200,30,60,0.08)' : 'rgba(255,255,255,0.02)',
                          borderColor: m.status === 'in_progress' ? 'rgba(200,30,60,0.25)' : 'rgba(255,255,255,0.04)',
                          borderRadius: '0px'
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-[10px] font-mono font-bold text-white/40">0{i + 1}</span>
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-white truncate">{m.title}</p>
                            <p className="text-[9px] text-white/40">{m.meta}</p>
                          </div>
                        </div>
                        <div>
                          {m.status === 'completed' && (
                            <span className="text-[9px] font-mono px-2 py-0.5 text-emerald-400 font-bold"
                              style={{ background: 'rgba(52,211,153,0.1)', borderRadius: '0px' }}>
                              ✓ Completed
                            </span>
                          )}
                          {m.status === 'in_progress' && (
                            <span className="text-[9px] font-mono px-2 py-0.5 font-bold"
                              style={{ background: '#c81e3c', color: '#ffffff', borderRadius: '0px' }}>
                              68% Active
                            </span>
                          )}
                          {m.status === 'locked' && (
                            <span className="text-[9px] font-mono px-2 py-0.5 text-white/40 font-bold"
                              style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0px' }}>
                              🔒 Unlocks Fri
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Live Session Card & Community Wins (5 cols) */}
                <div className="lg:col-span-5 flex flex-col gap-4">
                  {/* Live Coaching Callout */}
                  <div className="p-4 border"
                    style={{ background: '#0e0e13', borderColor: 'rgba(200,30,60,0.25)', borderLeft: '3px solid #c81e3c', borderRadius: '0px' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-mono uppercase font-bold text-[#c81e3c]">Next Live Coaching</span>
                      <span className="text-[9px] font-mono text-emerald-400">● RSVP Ready</span>
                    </div>
                    <h4 className="text-[12px] font-bold text-white leading-snug">{mockData.coachingTopic}</h4>
                    <p className="text-[10px] text-white/50 mt-1">{mockData.coachingDate}</p>
                    <button
                      onClick={() => setActiveTab('coaching')}
                      className="w-full mt-3 py-2 text-[10.5px] font-bold text-center transition-all hover:brightness-110 shadow-lg"
                      style={{ background: '#c81e3c', color: '#ffffff', borderRadius: '0px' }}
                    >
                      Join Live Room (VIP Pass) ▶
                    </button>
                  </div>

                  {/* VIP Community Wins */}
                  <div className="p-4 border flex-1" style={{ background: '#0e0e12', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px' }}>
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare size={12} className="text-[#c81e3c]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white">VIP Discussions & Wins</span>
                      </div>
                      <button onClick={() => setActiveTab('network')} className="text-[9px] text-white/40 hover:text-white">
                        Open Chat →
                      </button>
                    </div>
                    <div className="space-y-2.5">
                      {mockData.wins.slice(0, 2).map(w => (
                        <div key={w.author} className="text-[10px] p-2.5 border"
                          style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)', borderRadius: '0px' }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white truncate max-w-[170px]">{w.author}</span>
                            <span className="text-[8.5px] font-mono text-white/30">{w.time}</span>
                          </div>
                          <p className="text-white/60 italic leading-snug">"{w.quote}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CORE CURRICULUM VIEW */}
          {activeTab === 'curriculum' && (
            <div className="max-w-6xl mx-auto space-y-4">
              <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div>
                  <h3 className="text-[14px] font-bold text-white">Core Curriculum Syllabus</h3>
                  <p className="text-[11px] text-white/40 mt-0.5">14 of 20 Lessons Completed (70% Overall Velocity)</p>
                </div>
                <div className="flex items-center gap-2">
                  {['all', 'completed', 'in_progress', 'locked'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setCurriculumFilter(tab)}
                      className="px-2.5 py-1 text-[9.5px] font-mono font-medium uppercase transition-colors"
                      style={{
                        background: curriculumFilter === tab ? '#c81e3c' : 'rgba(255,255,255,0.05)',
                        color: curriculumFilter === tab ? '#ffffff' : 'rgba(255,255,255,0.5)',
                        borderRadius: '0px'
                      }}
                    >
                      {tab.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modules Accordion */}
              <div className="space-y-3">
                {mockData.modules
                  .filter(m => curriculumFilter === 'all' || m.status === curriculumFilter)
                  .map((m, idx) => (
                    <div key={m.title} className="border p-4" style={{ background: '#0e0e12', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-[11px] font-mono font-bold text-white/40">MODULE 0{idx + 1}</span>
                          <h4 className="text-[13px] font-bold text-white">{m.title}</h4>
                        </div>
                        <span className="text-[9px] font-mono px-2 py-0.5 font-bold"
                          style={{
                            background: m.status === 'completed' ? 'rgba(52,211,153,0.15)' : m.status === 'in_progress' ? '#c81e3c' : 'rgba(255,255,255,0.05)',
                            color: m.status === 'completed' ? '#34d399' : m.status === 'in_progress' ? '#ffffff' : 'rgba(255,255,255,0.4)',
                            borderRadius: '0px'
                          }}>
                          {m.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[10px] text-white/40 mb-3">{m.meta}</p>

                      <div className="space-y-1.5">
                        {m.lessons?.map(l => (
                          <div key={l.id} className="flex items-center justify-between p-2.5 border text-[11px]"
                            style={{
                              background: l.current ? 'rgba(200,30,60,0.1)' : 'rgba(255,255,255,0.02)',
                              borderColor: l.current ? 'rgba(200,30,60,0.3)' : 'rgba(255,255,255,0.04)',
                              borderRadius: '0px'
                            }}>
                            <div className="flex items-center gap-2.5 min-w-0">
                              {l.completed ? (
                                <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0" />
                              ) : l.current ? (
                                <Play size={13} className="text-[#c81e3c] flex-shrink-0 fill-[#c81e3c]" />
                              ) : (
                                <Lock size={13} className="text-white/30 flex-shrink-0" />
                              )}
                              <span className={`truncate ${l.current ? 'text-white font-bold' : 'text-white/80'}`}>{l.title}</span>
                            </div>
                            <div className="flex items-center gap-2.5 flex-shrink-0">
                              <span className="text-[9.5px] font-mono text-white/40">{l.dur}</span>
                              <span className="text-[9px] px-2 py-0.5 border text-white/50"
                                style={{ borderColor: 'rgba(255,255,255,0.08)', borderRadius: '0px' }}>
                                {l.type}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 3: IDE SANDBOX VIEW (Coding / Tech) */}
          {activeTab === 'sandbox' && isCoding && (
            <div className="max-w-6xl mx-auto flex flex-col border" style={{ background: '#08080a', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px', minHeight: 460 }}>
              <div className="flex items-center justify-between border-b px-3.5 py-2 gap-2" style={{ background: '#0e0e12', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-1.5">
                  {[
                    isAndroid ? 'ComposeBenchmark.kt' : 'main.py',
                    'challenges.ts',
                    'solution.kt',
                    'architecture.md'
                  ].map(file => (
                    <button
                      key={file}
                      onClick={() => setActiveFile(file)}
                      className="px-3 py-1.5 text-[10.5px] font-mono transition-colors flex items-center gap-1.5"
                      style={{
                        background: activeFile === file ? '#16161c' : 'transparent',
                        color: activeFile === file ? '#ffffff' : 'rgba(255,255,255,0.4)',
                        borderBottom: activeFile === file ? '2px solid #c81e3c' : '2px solid transparent',
                        borderRadius: '0px'
                      }}
                    >
                      <Code size={11} style={{ color: activeFile === file ? '#c81e3c' : 'rgba(255,255,255,0.3)' }} />
                      <span>{file}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleRunTests}
                  disabled={testsRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold font-mono transition-all hover:brightness-110 shadow-lg"
                  style={{ background: '#c81e3c', color: '#ffffff', borderRadius: '0px' }}
                >
                  <Play size={11} className="fill-white text-white" />
                  <span>{testsRunning ? 'Running Tests...' : 'Run Test Suite'}</span>
                </button>
              </div>

              <div className="p-4 sm:p-5 flex-1 space-y-1 text-[12px] font-mono leading-relaxed overflow-x-auto text-white/80" style={{ background: '#0a0a0d' }}>
                {isAndroid ? (
                  <>
                    <p><span className="text-purple-400">// {productName}</span> <span className="text-white/30">— Channel Blueprint for {name}</span></p>
                    <p><span className="text-pink-400">package</span> <span className="text-amber-300">com.android.compose.mastery</span></p>
                    <p>&nbsp;</p>
                    <p><span className="text-pink-400">import</span> <span className="text-blue-300">androidx.compose.runtime.*</span></p>
                    <p><span className="text-pink-400">import</span> <span className="text-blue-300">kotlinx.coroutines.flow.StateFlow</span></p>
                    <p>&nbsp;</p>
                    <p><span className="text-blue-400">@Composable</span></p>
                    <p><span className="text-pink-400">fun</span> <span className="text-yellow-300 font-semibold">ProductionBlueprintFeed</span>(</p>
                    <p className="pl-4">stateFlow: <span className="text-emerald-300">StateFlow&lt;CohortState&gt;</span>,</p>
                    <p className="pl-4">modifier: <span className="text-emerald-300">Modifier</span> = Modifier</p>
                    <p>): <span className="text-emerald-300">Unit</span> &#123;</p>
                    <p className="pl-4"><span className="text-pink-400">val</span> state <span className="text-pink-400">by</span> stateFlow.collectAsStateWithLifecycle()</p>
                    <p>&nbsp;</p>
                    <p className="pl-4"><span className="text-purple-400">// High-performance SubcomposeLayout pipeline</span></p>
                    <p className="pl-4"><span className="text-blue-400">ReusableLayout</span>(</p>
                    <p className="pl-8">measurePolicy = <span className="text-yellow-300">SubcomposeMeasurePolicy</span> &#123; constraints -&gt;</p>
                    <p className="pl-12">layout(constraints.maxWidth, constraints.maxHeight) &#123;</p>
                    <p className="pl-16"><span className="text-purple-300">// Zero recomposition lag verified across {followers}+ members</span></p>
                    <p className="pl-12">&#125;</p>
                    <p className="pl-8">&#125;</p>
                    <p className="pl-4">)</p>
                    <p>&#125;</p>
                  </>
                ) : (
                  <>
                    <p><span className="text-purple-400"># {productName}</span> <span className="text-white/30">— Channel Blueprint for {name}</span></p>
                    <p><span className="text-pink-400">from</span> <span className="text-amber-300">colaunch_studio</span> <span className="text-pink-400">import</span> <span className="text-blue-300">InteractiveSandbox, BenchmarkSuite</span></p>
                    <p>&nbsp;</p>
                    <p><span className="text-blue-400">class</span> <span className="text-yellow-300 font-semibold">{name.replace(/\s+/g, '')}MasteryHub</span>:</p>
                    <p className="pl-4"><span className="text-pink-400">def</span> <span className="text-blue-300">__init__</span>(<span className="text-purple-300">self</span>):</p>
                    <p className="pl-8"><span className="text-purple-300">self</span>.creator = <span className="text-emerald-300">"{creatorData.handle || '@creator'}"</span></p>
                    <p className="pl-8"><span className="text-purple-300">self</span>.members = <span className="text-amber-300">"{followers}+ active builders"</span></p>
                    <p className="pl-8"><span className="text-purple-300">self</span>.status = <span className="text-[#c81e3c]">"Production Deployed"</span></p>
                    <p>&nbsp;</p>
                    <p className="pl-4"><span className="text-pink-400">def</span> <span className="text-blue-300">verify_challenge</span>(<span className="text-purple-300">self</span>, code_submission):</p>
                    <p className="pl-8"><span className="text-pink-400">return</span> <span className="text-purple-300">self</span>.sandbox.run_automated_tests(code_submission)</p>
                  </>
                )}
              </div>

              <div className="border-t p-3 px-4 flex items-center justify-between" style={{ background: '#09090c', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="text-[#c81e3c] font-bold">$</span>
                  <span className="text-white/50">{isAndroid ? './gradlew testBenchmark' : 'pytest --test_suite=mastery'}</span>
                  {testsRunning ? (
                    <span className="text-amber-400 ml-2 animate-pulse font-semibold">Running 42 assertions...</span>
                  ) : testsPassed ? (
                    <span className="text-emerald-400 ml-2 font-semibold">✓ 42 benchmark tests passed (0.18s) — Memory overhead: 0.00MB</span>
                  ) : null}
                </div>
                <span className="text-[9.5px] px-2 py-0.5 font-mono text-white/50 border" style={{ borderColor: 'rgba(255,255,255,0.08)', borderRadius: '0px' }}>
                  {isAndroid ? 'Kotlin 2.0.20' : 'Python 3.12'}
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: PRIVATE NETWORK VIEW */}
          {activeTab === 'network' && (
            <div className="max-w-6xl mx-auto flex flex-col border" style={{ background: '#0a0a0d', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px', minHeight: 460 }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ background: '#0e0e12', borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-[#c81e3c] font-mono font-bold">#</span>
                  <span className="text-[12px] font-bold text-white">sprint-3-help</span>
                  <span className="text-[10px] text-white/40 border-l pl-2 ml-1" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    VIP Cohort Active Discussion
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[9.5px] font-mono text-white/40">
                  <span className="w-1.5 h-1.5 rounded-none bg-emerald-400 inline-block" style={{ borderRadius: '0px' }} />
                  <span>38 Online</span>
                </div>
              </div>

              <div className="flex-1 p-4 space-y-3.5 overflow-y-auto" style={{ maxHeight: 320 }}>
                {chatMessages.map(msg => (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-none flex items-center justify-center font-bold text-[10px] text-white flex-shrink-0"
                      style={{ background: msg.role.includes('Lead') || msg.role.includes('Instructor') ? '#c81e3c' : '#1f1f26', borderRadius: '0px' }}>
                      {msg.sender[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-white">{msg.sender}</span>
                        <span className="text-[8.5px] font-mono px-1.5 py-0.2 font-semibold"
                          style={{
                            background: msg.role.includes('Lead') || msg.role.includes('Instructor') ? 'rgba(200,30,60,0.2)' : 'rgba(255,255,255,0.05)',
                            color: msg.role.includes('Lead') || msg.role.includes('Instructor') ? '#ffffff' : 'rgba(255,255,255,0.4)',
                            borderRadius: '0px'
                          }}>
                          {msg.role}
                        </span>
                        <span className="text-[9px] font-mono text-white/30">{msg.time}</span>
                      </div>
                      <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2.5" style={{ background: '#0e0e12', borderColor: 'rgba(255,255,255,0.06)' }}>
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Message #sprint-3-help (Type your message and press Enter)..."
                  className="flex-1 bg-white/5 border border-white/10 px-3 py-2 text-[11px] text-white placeholder-white/30 outline-none focus:border-[#c81e3c]"
                  style={{ borderRadius: '0px' }}
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 font-bold text-[11px] transition-all hover:brightness-110 shadow-lg"
                  style={{ background: '#c81e3c', color: '#ffffff', borderRadius: '0px' }}
                >
                  <Send size={11} className="text-white" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 5: LIVE COACHING VIEW */}
          {activeTab === 'coaching' && (
            <div className="max-w-6xl mx-auto space-y-4">
              <div className="p-5 border relative overflow-hidden"
                style={{ background: '#0f0f14', borderColor: 'rgba(200,30,60,0.3)', borderLeft: '3px solid #c81e3c', borderRadius: '0px' }}>
                <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                  <span className="text-[9.5px] font-mono uppercase font-bold text-[#c81e3c] tracking-wider">
                    UPCOMING LIVE VIP MASTERCLASS
                  </span>
                  <span className="text-[9.5px] font-mono px-2.5 py-0.5 text-white/60 border border-white/10" style={{ borderRadius: '0px' }}>
                    Countdown: 02d : 14h : 22m
                  </span>
                </div>

                <h3 className="text-[15px] font-bold text-white mb-1.5">{mockData.coachingTopic}</h3>
                <p className="text-[11px] text-white/50 mb-4 leading-relaxed max-w-3xl">
                  Join {name} for an interactive 90-minute architecture teardown, live code reviews from cohort submissions, and open Q&A.
                </p>

                <div className="flex items-center justify-between flex-wrap gap-3 pt-3 border-t border-white/5">
                  <div className="text-[10px] text-white/40 font-mono">
                    Date: <span className="text-white">{mockData.coachingDate}</span> · Private Zoom Link Encrypted
                  </div>
                  <button
                    onClick={() => setRsvpConfirmed(prev => !prev)}
                    className="flex items-center gap-1.5 px-4 py-2 font-bold text-[11px] transition-all hover:brightness-110"
                    style={{
                      background: rsvpConfirmed ? 'rgba(52,211,153,0.2)' : '#c81e3c',
                      color: rsvpConfirmed ? '#34d399' : '#ffffff',
                      border: rsvpConfirmed ? '1px solid rgba(52,211,153,0.4)' : 'none',
                      borderRadius: '0px'
                    }}
                  >
                    <Check size={12} className={rsvpConfirmed ? 'text-emerald-400' : 'text-white'} />
                    <span>{rsvpConfirmed ? 'RSVP Confirmed (Calendar Synced)' : 'Confirm VIP Attendance'}</span>
                  </button>
                </div>
              </div>

              {/* Past Masterclasses Vault */}
              <div>
                <h4 className="text-[12px] font-bold text-white uppercase tracking-wider mb-3">Past Masterclass Vault & Replays</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { title: 'Zero-Lag UI Render Architecture', dur: '1h 14m', date: 'Oct 28', rating: '5.0 ★' },
                    { title: 'Reactive State Streams & Profiling', dur: '58m', date: 'Oct 21', rating: '4.9 ★' },
                    { title: 'CI/CD Pipelines & Baseline Profiles', dur: '1h 06m', date: 'Oct 14', rating: '5.0 ★' },
                  ].map(r => (
                    <div key={r.title} className="p-3 border" style={{ background: '#09090c', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] font-mono text-white/40">{r.date}</span>
                        <span className="text-[9px] font-mono text-amber-400 font-bold">{r.rating}</span>
                      </div>
                      <p className="text-[11px] font-bold text-white truncate">{r.title}</p>
                      <p className="text-[9px] text-white/40 mt-0.5">{r.dur} · 4K Replay + Slides</p>
                      <button className="mt-2.5 w-full py-1.5 text-[9.5px] font-bold text-center border text-white/70 hover:text-white"
                        style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '0px' }}>
                        Watch Replay ▶
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
