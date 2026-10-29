import { useState, useEffect, useRef } from 'react'
import { useForge, getAccent } from '../../App'
import { Check, Layout, Users, BarChart2, Package, Mail, Globe, Clock, Terminal, Trash2 } from 'lucide-react'
import WingLogo from '../ui/WingLogo'

function isLightColor(hex) {
  if (!hex || typeof hex !== 'string') return false
  const clean = hex.replace('#', '').trim()
  const r = parseInt(clean.slice(0, 2), 16) || 0
  const g = parseInt(clean.slice(2, 4), 16) || 0
  const b = parseInt(clean.slice(4, 6), 16) || 0
  return ((r * 299 + g * 587 + b * 114) / 1000) > 135
}

function getDynamicBuildArtifacts(blueprint, creatorData) {
  const type = (blueprint?.type || '').toLowerCase()
  const name = blueprint?.name || 'Creator Space'

  if (type.includes('member') || type.includes('community')) {
    return [
      { id: 'shell', icon: Globe, label: 'Community engine', description: `Core ${name} portal & dynamic member routing`, duration: 1400 },
      { id: 'billing', icon: BarChart2, label: 'Recurring billing', description: 'Stripe subscription tiers & customer portal live', duration: 1600 },
      { id: 'forum', icon: Users, label: 'Member discussions', description: 'Gated forum categories, AMA stages & DMs', duration: 1400 },
      { id: 'onboarding', icon: Layout, label: 'Member onboarding', description: 'Welcome video sequence & profile onboarding flow', duration: 1400 },
      { id: 'marketing', icon: Mail, label: 'Launch sequences', description: 'Automated invitations & announcement broadcasts', duration: 1200 },
    ]
  }

  if (type.includes('product') || type.includes('store') || type.includes('supplement') || type.includes('drop')) {
    return [
      { id: 'catalog', icon: Package, label: 'Product catalog', description: `${name} SKU architecture & inventory sync`, duration: 1400 },
      { id: 'checkout', icon: Globe, label: 'Checkout gateway', description: 'High-conversion cart & automated tax calculation', duration: 1600 },
      { id: 'analytics', icon: BarChart2, label: 'Revenue telemetry', description: 'Real-time sales tracking & attribution analytics', duration: 1400 },
      { id: 'portal', icon: Users, label: 'Customer portal', description: 'Instant order access, downloads & support pipeline', duration: 1400 },
      { id: 'email', icon: Mail, label: 'Fulfillment emails', description: 'Instant receipts, shipping notifications & upsells', duration: 1200 },
    ]
  }

  if (type.includes('course') || type.includes('academy') || type.includes('masterclass')) {
    return [
      { id: 'curriculum', icon: Layout, label: 'Curriculum builder', description: `${name} video modules & lesson indexing`, duration: 1400 },
      { id: 'streaming', icon: Globe, label: 'Video player', description: 'HD adaptive streaming engine & progress tracker', duration: 1600 },
      { id: 'community', icon: Users, label: 'Student community', description: 'Discussion boards & assignment submission threads', duration: 1400 },
      { id: 'cert', icon: BarChart2, label: 'Certification & tests', description: 'Completion milestones & certificate engine', duration: 1400 },
      { id: 'offer', icon: Package, label: 'Enrollment page', description: 'Direct checkout landing page & syllabus preview', duration: 1200 },
    ]
  }

  return [
    { id: 'shell', icon: Globe, label: 'Architecture shell', description: `${name} responsive layout & edge CDN routing`, duration: 1400 },
    { id: 'dashboard', icon: Layout, label: 'Creator Studio OS', description: 'Command center, member analytics & telemetry', duration: 1600 },
    { id: 'access', icon: Users, label: 'Access control', description: 'Tokenized member authentication & permissions', duration: 1400 },
    { id: 'offer', icon: Package, label: 'Offer & launch page', description: 'Sales funnel & subscriber checkout flow', duration: 1400 },
    { id: 'marketing', icon: Mail, label: 'Broadcast pipelines', description: 'Automated email dispatch & subscriber alerts', duration: 1200 },
  ]
}

function ArtifactPreview({ artifact, isActive, isBuilt, accent, elapsedSec }) {
  const { icon: Icon } = artifact
  const isLight = isLightColor(accent.color)

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-300"
      style={{
        background: isBuilt ? '#111114' : isActive ? '#141418' : '#0a0a0c',
        borderColor: isActive
          ? accent.color
          : isBuilt
            ? `rgba(${accent.rgb}, 0.35)`
            : 'rgba(255,255,255,0.05)',
        opacity: isBuilt ? 1 : isActive ? 1 : 0.4,
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <Icon size={12} style={{ color: isActive ? accent.color : 'rgba(255,255,255,0.5)' }} />
          <span className="text-[11px] font-medium truncate" style={{ color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)' }}>
            {artifact.label}
          </span>
        </div>
        {isBuilt && (
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: accent.color }}
          >
            <Check size={9} style={{ color: isLight ? '#000000' : '#ffffff' }} strokeWidth={3} />
          </div>
        )}
        {isActive && (
          <div className="flex gap-1 flex-shrink-0">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="w-1 h-1 rounded-full animate-pulse"
                style={{
                  background: accent.color,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content box */}
      <div className="p-3 space-y-2">
        {isBuilt || isActive ? (
          <>
            <div
              className="h-14 rounded-lg flex flex-col items-center justify-center text-[9px] font-mono px-2 text-center"
              style={{
                background: isActive ? `rgba(${accent.rgb}, 0.08)` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? `rgba(${accent.rgb}, 0.25)` : 'rgba(255,255,255,0.04)'}`,
                color: isActive ? accent.color : 'rgba(255,255,255,0.55)',
              }}
            >
              <span className="font-semibold">{isBuilt ? '✓ Compiled' : 'Compiling...'}</span>
              {isBuilt && elapsedSec && (
                <span className="text-[8px] opacity-75 mt-0.5">{elapsedSec}s</span>
              )}
            </div>
            <div className="space-y-1.5">
              {[1, 2].map(i => (
                <div
                  key={i}
                  className="h-1.5 rounded-full"
                  style={{
                    width: `${60 + i * 20}%`,
                    background: isActive ? accent.color : 'rgba(255,255,255,0.05)',
                    opacity: isActive ? 0.4 : 1,
                  }}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <div className="h-14 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }} />
            <div className="h-1.5 w-3/4 rounded-full" style={{ background: 'rgba(255,255,255,0.02)' }} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function Building() {
  const { goTo, creatorData, requestWipeCreator } = useForge()
  const [builtArtifacts, setBuiltArtifacts] = useState([])
  const [activeArtifact, setActiveArtifact] = useState(0)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [visible, setVisible] = useState(false)
  const [buildElapsedMs, setBuildElapsedMs] = useState(0)
  const [artifactTimings, setArtifactTimings] = useState({})

  const blueprint = creatorData.blueprint || { name: 'Creator Academy', type: 'Web App' }
  const accent = getAccent(creatorData)
  const artifacts = getDynamicBuildArtifacts(blueprint, creatorData)
  const timerRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    let artifactIdx = 0
    const totalDuration = artifacts.reduce((s, a) => s + a.duration, 0)
    const startTime = Date.now()

    // Real-time elapsed clock
    timerRef.current = setInterval(() => {
      setBuildElapsedMs(Date.now() - startTime)
    }, 40)

    let currentStepTimer = null

    const runBuild = () => {
      if (artifactIdx >= artifacts.length) {
        setProgress(100)
        setDone(true)
        if (timerRef.current) clearInterval(timerRef.current)
        setTimeout(() => goTo('celebration'), 1100)
        return
      }

      setActiveArtifact(artifactIdx)
      const artifact = artifacts[artifactIdx]
      const stepStart = Date.now()

      currentStepTimer = setTimeout(() => {
        const stepElapsed = ((Date.now() - stepStart) / 1000).toFixed(2)
        const idx = artifactIdx
        setArtifactTimings(prev => ({ ...prev, [idx]: stepElapsed }))
        setBuiltArtifacts(prev => [...prev, idx])
        artifactIdx++
        runBuild()
      }, artifact.duration)
    }

    runBuild()

    // Progress interval
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min(Math.round((elapsed / totalDuration) * 98), 98)
      setProgress(pct)
    }, 50)

    return () => {
      if (currentStepTimer) clearTimeout(currentStepTimer)
      if (timerRef.current) clearInterval(timerRef.current)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <WingLogo size={22} color={accent.color} />
          <span className="text-white font-semibold text-[15px] tracking-tight">CoLaunch</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={requestWipeCreator}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium text-red-400/80 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 transition-all cursor-pointer"
            title="Wipe creator from storage"
          >
            <Trash2 size={12} />
            <span className="hidden sm:inline">Reset Creator</span>
          </button>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === 6 ? '20px' : '6px',
                  height: '6px',
                  background: i === 6 ? accent.color : i < 6 ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.12)',
                }}
              />
            ))}
          </div>
        </div>
      </header>

      <main
        className="flex-1 px-6 pb-10 max-w-4xl mx-auto w-full"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      >
        {/* Title & Live Build Timing Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="forge-label">Building your product</p>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent.color }} />
              <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border flex items-center gap-1.5"
                style={{ background: `rgba(${accent.rgb}, 0.1)`, borderColor: `rgba(${accent.rgb}, 0.25)`, color: accent.color }}>
                <Clock size={11} />
                00:0{((buildElapsedMs || 0) / 1000).toFixed(2)}s
              </span>
            </div>
            <h2
              className="forge-heading"
              style={{ fontSize: 'clamp(28px, 4vw, 38px)', letterSpacing: '-0.035em' }}
            >
              {done ? `${blueprint.name} is ready.` : `Forge is building\n${blueprint.name}.`}
            </h2>
            {!done && (
              <p className="text-[14px] mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Compiling dynamic {blueprint.type ? blueprint.type.toLowerCase() : 'platform'} modules in real time.
              </p>
            )}
          </div>
        </div>

        {/* Artifact grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          {artifacts.map((artifact, i) => (
            <ArtifactPreview
              key={artifact.id}
              artifact={artifact}
              isBuilt={builtArtifacts.includes(i)}
              isActive={activeArtifact === i && !builtArtifacts.includes(i)}
              accent={accent}
              elapsedSec={artifactTimings[i]}
            />
          ))}
        </div>

        {/* Build log with real-time compilation timing */}
        <div
          className="rounded-xl border p-4 mb-8 font-mono overflow-hidden"
          style={{
            background: '#0a0a0c',
            borderColor: 'rgba(255,255,255,0.06)',
            maxHeight: '140px',
          }}
        >
          <div className="space-y-1.5">
            {artifacts.slice(0, activeArtifact + 1).map((a, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2 truncate pr-2">
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span style={{ color: activeArtifact === i ? accent.color : 'rgba(255,255,255,0.15)' }}>›</span>
                  <span
                    style={{
                      color: builtArtifacts.includes(i) ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.85)',
                    }}
                  >
                    <span style={{ color: builtArtifacts.includes(i) ? accent.color : 'inherit' }}>
                      {builtArtifacts.includes(i) ? '✓' : '·'}
                    </span>{' '}
                    {a.description}
                    {!builtArtifacts.includes(i) && i === activeArtifact && (
                      <span className="cursor-blink ml-1" style={{ color: accent.color }}>_</span>
                    )}
                  </span>
                </div>
                {builtArtifacts.includes(i) && artifactTimings[i] && (
                  <span className="text-[10px] flex-shrink-0 font-semibold" style={{ color: accent.color }}>
                    +{artifactTimings[i]}s
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {done ? 'Build complete' : artifacts[activeArtifact]?.label || 'Initializing architecture'}
            </span>
            <span className="text-[13px] font-semibold" style={{ color: done ? '#ffffff' : accent.color }}>
              {progress}%
            </span>
          </div>
          <div
            className="h-1.5 w-full rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-300 relative"
              style={{ width: `${progress}%`, background: accent.color }}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
