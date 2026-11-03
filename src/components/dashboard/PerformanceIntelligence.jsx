import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  Play,
  Eye,
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowRight,
  RefreshCw,
  Zap,
  Wand2,
  Video,
  Copy,
  Check,
  Flame,
  Activity,
  Layers,
  ChevronRight,
  Youtube,
  Instagram,
  ExternalLink,
  Sliders,
  Cpu
} from 'lucide-react'
import { useForge } from '../../App'

export default function PerformanceIntelligence() {
  const { creatorData, userProfile, triggerToast, addXP } = useForge()
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [isSyncing, setIsSyncing] = useState(false)
  const [copiedPromptId, setCopiedPromptId] = useState(null)
  const [appliedToDraft, setAppliedToDraft] = useState(false)

  const brandRed = '#c81e3c'
  const creatorName = creatorData?.name || creatorData?.creator_name || 'Creator'
  const productName = creatorData?.productName || 'Software Product'

  // Simulated / live video analytics dataset with AI diagnosis of "lackings"
  const [videos, setVideos] = useState([
    {
      id: 'vid-1',
      title: `${productName} — How I Built A 6-Figure Tool For My Audience`,
      channel: 'YouTube',
      format: 'Short',
      publishedAt: 'Yesterday at 9:00 AM',
      views: '18,420',
      viewsNum: 18420,
      retentionRate: '64.2%',
      hookRetention: '71.5%',
      ctr: '9.4%',
      status: 'Live',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      lackings: [
        {
          timestamp: '0:02.8',
          issue: 'Hook Friction Drop-Off',
          description: '18% drop in first 3 seconds: opening speech started before the on-screen code demo visual appeared.',
          severity: 'high'
        },
        {
          timestamp: '0:22.0',
          issue: 'Mid-Pacing Drag',
          description: 'Viewer drop-off slowed momentum because camera angle remained static for 7 consecutive seconds without B-roll overlay.',
          severity: 'medium'
        },
        {
          timestamp: '0:54.0',
          issue: 'Late Call-to-Action',
          description: 'Access link teaser was placed after viewer drop-off slope began.',
          severity: 'medium'
        }
      ],
      aiPrescription: {
        headline: 'Shift to High-Stakes Visual Shock Hook + 1.5s Pattern Interrupt',
        nextHookDirective: 'Open with immediate split-screen: Left shows painful broken workflow, Right shows instant 1-click solution. Zero greeting.',
        pacingRule: 'Enforce max 4-second cuts between B-roll screencasts and punchy speaker close-ups.',
        ctaPlacement: 'Introduce the exclusive founder access perk at 0:38 before final conclusion.'
      }
    },
    {
      id: 'vid-2',
      title: 'Stop Building SaaS The Hard Way (3 Costly Mistakes)',
      channel: 'TikTok',
      format: 'Vertical Video',
      publishedAt: '3 Days Ago',
      views: '42,190',
      viewsNum: 42190,
      retentionRate: '72.8%',
      hookRetention: '84.0%',
      ctr: '12.1%',
      status: 'Live',
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      lackings: [
        {
          timestamp: '0:18.5',
          issue: 'Technical Over-Explanation',
          description: 'Viewer comment sentiment showed confusion around database terminology.',
          severity: 'low'
        },
        {
          timestamp: '0:45.0',
          issue: 'Sub-Optimal Thumbnail Font',
          description: 'Initial frame thumbnail text was too close to screen edges on mobile devices.',
          severity: 'medium'
        }
      ],
      aiPrescription: {
        headline: 'Use Metaphors Instead of Technical Jargon + 30% Larger Center Thumbnail Text',
        nextHookDirective: 'Say "Imagine having 1,000 users pay you every month while your laptop is closed." Compare SaaS directly to automated vending machines.',
        pacingRule: 'Add animated sound effects (woosh/pop) on every transition to keep subconscious attention.',
        ctaPlacement: 'End with "Comment \'ACCESS\' and my automated AI bot will DM you early invite coordinates."'
      }
    },
    {
      id: 'vid-3',
      title: 'Behind The Scenes: The Exact Stack Powering Our App Launch',
      channel: 'Instagram',
      format: 'Reel',
      publishedAt: '5 Days Ago',
      views: '11,850',
      viewsNum: 11850,
      retentionRate: '58.0%',
      hookRetention: '66.2%',
      ctr: '7.8%',
      status: 'Live',
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
      lackings: [
        {
          timestamp: '0:01.5',
          issue: 'Weak Opening Energy',
          description: 'First sentence sounded hesitant; audience swipe-away peaked in the first 2 seconds.',
          severity: 'high'
        },
        {
          timestamp: '0:35.0',
          issue: 'Missing Visual Proof Point',
          description: 'Talked about revenue growth without displaying the verified dashboard graph on screen.',
          severity: 'high'
        }
      ],
      aiPrescription: {
        headline: 'Show Real Live Screen Proof Within First 1 Second',
        nextHookDirective: 'Start video directly holding phone up showing real Stripe notification counter rolling in, then snap camera to face.',
        pacingRule: 'Keep text captions center-screen with yellow/white contrast highlighting key numbers.',
        ctaPlacement: 'Link in bio sticker visible throughout entire last 12 seconds.'
      }
    }
  ])

  // Filtered video list
  const filteredVideos = videos.filter(v => {
    if (selectedPlatform === 'all') return true
    return v.channel.toLowerCase() === selectedPlatform.toLowerCase()
  })

  // Synchronize stats action
  const handleSyncLiveStats = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      if (triggerToast) {
        triggerToast('Video performance data synchronized with YouTube & live social APIs', 'success')
      }
    }, 1200)
  }

  // Copy AI prompt to clipboard
  const handleCopyPrompt = (promptText, id) => {
    try {
      navigator.clipboard.writeText(promptText)
      setCopiedPromptId(id)
      setTimeout(() => setCopiedPromptId(null), 2500)
      if (triggerToast) {
        triggerToast('AI Video Creation Prompt copied to clipboard! Ready for Midjourney/Runway.', 'success')
      }
    } catch {}
  }

  // Apply improvements to next calendar draft
  const handleApplyToNextDraft = (e) => {
    setAppliedToDraft(true)
    addXP(100, 'Applied AI Self-Improvement Loop to next scheduled video draft', e)
    if (triggerToast) {
      triggerToast('Success! Next scheduled video draft updated with AI corrective directives (+100 XP)', 'success')
    }
  }

  return (
    <div className="min-h-full flex flex-col bg-[#090d16] text-slate-200 select-none p-4 sm:p-6 space-y-6">
      
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#161b2b]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-none bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-400">
              Autonomous Content Feedback Engine
            </span>
            <span className="px-2 py-0.5 rounded-none text-[9px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/20">
              AI Breathing &amp; Self-Improving Loop
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Video Performance &amp; AI Diagnostic Studio</span>
            <Sparkles size={20} className="text-amber-400" />
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Tracks live video views, pinpoints retention lackings, and synthesizes corrective creation directives so each subsequent video outperforms the last.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSyncLiveStats}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#111522] hover:bg-[#181f30] border border-[#202738] rounded-none transition cursor-pointer disabled:opacity-50"
            title="Refresh metrics from YouTube and social accounts"
          >
            <RefreshCw size={13} className={isSyncing ? 'animate-spin text-emerald-400' : 'text-slate-400'} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Live Stats'}</span>
          </button>

          <button
            type="button"
            onClick={handleApplyToNextDraft}
            disabled={appliedToDraft}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white rounded-none transition shadow-sm cursor-pointer hover:opacity-95 border-0"
            style={{ background: brandRed, color: '#ffffff' }}
          >
            <Cpu size={14} className="text-white" />
            <span>{appliedToDraft ? '✓ Adaptive Rules Applied' : 'Inject Rules to Next Video (+100 XP)'}</span>
          </button>
        </div>
      </div>

      {/* ── 4 KEY PERFORMANCE METRICS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#0c0f17] border border-[#161b2b] rounded-none">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Video Views</span>
            <Eye size={14} className="text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">72,460</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-1">
            <ArrowUpRight size={13} />
            <span>+24.8% vs last sprint</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#0c0f17] border border-[#161b2b] rounded-none">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Watch Time</span>
            <Clock size={14} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">1m 42s</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-1">
            <ArrowUpRight size={13} />
            <span>67.4% full-video retention</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#0c0f17] border border-[#161b2b] rounded-none">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">3s Hook Retention</span>
            <Flame size={14} className="text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">76.8%</div>
          <div className="flex items-center gap-1 text-[11px] text-amber-400 font-semibold mt-1">
            <span>Algorithm qualifying score</span>
          </div>
        </div>

        <div className="p-3.5 bg-[#0c0f17] border border-[#161b2b] rounded-none">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">AI Evolution Cycle</span>
            <Activity size={14} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 tracking-tight">Level 4 Adaptive</div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono mt-1">
            <span>3 lackings auto-fixed in next draft</span>
          </div>
        </div>
      </div>

      {/* ── THE SELF-IMPROVING "BREATHING" AI PIPELINE VISUALIZER ── */}
      <div className="p-4 sm:p-5 bg-[#0c0f17] border border-[#1b2336] rounded-none relative overflow-hidden">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-none bg-emerald-500 animate-ping" />
            <h3 className="text-sm font-extrabold text-white tracking-tight">
              Real-Time Adaptive Learning Loop (How AI Learns From Video Lackings)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20">
            Active Feedback Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
          
          {/* Step 1 */}
          <div className="p-3 bg-[#111522] border border-[#1c2438] rounded-none relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-slate-400">01 / AUDIT</span>
              <Eye size={13} className="text-sky-400" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Ingest Retention Graph</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Detects exact millisecond timestamps where viewers swiped away or dropped off.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3 bg-[#111522] border border-[#1c2438] rounded-none relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-slate-400">02 / DIAGNOSE</span>
              <AlertTriangle size={13} className="text-rose-400" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Extract Lackings</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Identifies speech hesitation, weak hook framing, and delayed calls to action.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-3 bg-[#111522] border border-[#1c2438] rounded-none relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-slate-400">03 / ADAPT</span>
              <Wand2 size={13} className="text-amber-400" />
            </div>
            <h4 className="text-xs font-bold text-white mb-1">Synthesize New Rules</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Converts video failures into actionable creation directives for tomorrow's video.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-3 bg-[#161d2f] border border-emerald-500/40 rounded-none relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono font-bold text-emerald-400">04 / DEPLOY</span>
              <CheckCircle2 size={13} className="text-emerald-400" />
            </div>
            <h4 className="text-xs font-bold text-emerald-300 mb-1">Auto-Enhance Next Draft</h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Injected into the next video in your Content Calendar for seamless execution.
            </p>
          </div>

        </div>
      </div>

      {/* ── PLATFORM FILTER TABS ── */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'YouTube', 'TikTok', 'Instagram'].map(plat => (
            <button
              key={plat}
              type="button"
              onClick={() => setSelectedPlatform(plat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-none transition cursor-pointer border-0 ${
                selectedPlatform === plat
                  ? 'text-white shadow-sm'
                  : 'bg-[#111522] text-slate-400 hover:bg-[#161b2b] hover:text-white'
              }`}
              style={selectedPlatform === plat ? { background: brandRed, color: '#ffffff' } : {}}
            >
              {plat === 'all' ? 'All Platforms' : plat}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Showing {filteredVideos.length} analyzed videos
        </span>
      </div>

      {/* ── VIDEO LIST WITH DIAGNOSED LACKINGS & AI PRESCRIPTIONS ── */}
      <div className="space-y-4">
        {filteredVideos.map(video => (
          <div
            key={video.id}
            className="bg-[#0c0f17] border border-[#161b2b] rounded-none p-4 sm:p-5 flex flex-col lg:flex-row gap-5"
          >
            {/* Left: Thumbnail & Core Stats */}
            <div className="w-full lg:w-72 shrink-0 space-y-3">
              <div className="relative aspect-video rounded-none overflow-hidden bg-black border border-[#202738] group">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-none bg-black/80 text-[10px] font-mono font-bold text-white flex items-center gap-1">
                  {video.channel === 'YouTube' ? <Youtube size={12} className="text-red-500" /> : <Instagram size={12} className="text-pink-500" />}
                  <span>{video.channel} • {video.format}</span>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-none bg-emerald-500/90 text-black text-[10px] font-mono font-black">
                  {video.views} VIEWS
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-[#111522] rounded-none border border-[#161b2b]">
                  <span className="text-[10px] text-slate-400 block font-mono">RETENTION</span>
                  <span className="font-bold text-white">{video.retentionRate}</span>
                </div>
                <div className="p-2 bg-[#111522] rounded-none border border-[#161b2b]">
                  <span className="text-[10px] text-slate-400 block font-mono">HOOK 3S</span>
                  <span className="font-bold text-emerald-400">{video.hookRetention}</span>
                </div>
                <div className="p-2 bg-[#111522] rounded-none border border-[#161b2b]">
                  <span className="text-[10px] text-slate-400 block font-mono">CTR</span>
                  <span className="font-bold text-sky-400">{video.ctr}</span>
                </div>
              </div>
            </div>

            {/* Right: Lackings & AI Corrective Directives */}
            <div className="flex-1 space-y-3.5">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Published {video.publishedAt}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight mt-0.5">
                  {video.title}
                </h3>
              </div>

              {/* Identified Video Lackings */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle size={13} />
                  <span>Diagnosed Lackings in This Video (Where Audience Was Lost)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {video.lackings.map((lac, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-[#121624] border border-rose-500/20 rounded-none space-y-1 text-left"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-rose-400 font-extrabold">@{lac.timestamp}</span>
                        <span className={`px-1 py-0.2 rounded-none uppercase font-bold text-[8px] ${lac.severity === 'high' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {lac.severity} Impact
                        </span>
                      </div>
                      <div className="text-[11px] font-bold text-white">{lac.issue}</div>
                      <p className="text-[10px] text-slate-400 leading-tight">{lac.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Self-Improving Prescription for Next Video */}
              <div className="p-3.5 bg-[#101726] border border-emerald-500/30 rounded-none space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                    <Sparkles size={13} />
                    <span>AI Prescriptions Generated for Next Video</span>
                  </h4>
                  <span className="text-[9px] font-mono text-emerald-300 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/30">
                    Auto-Applied To Next Scheduled Draft
                  </span>
                </div>

                <div className="text-xs font-bold text-white">
                  Strategy: {video.aiPrescription.headline}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 bg-[#0c101a] rounded-none border border-[#1e273d]">
                    <span className="text-[9px] font-mono text-emerald-400 font-bold block mb-0.5">NEW HOOK DIRECTIVE:</span>
                    <span className="text-slate-300 text-[10px] leading-snug">{video.aiPrescription.nextHookDirective}</span>
                  </div>
                  <div className="p-2 bg-[#0c101a] rounded-none border border-[#1e273d]">
                    <span className="text-[9px] font-mono text-sky-400 font-bold block mb-0.5">PACING CORRECTION:</span>
                    <span className="text-slate-300 text-[10px] leading-snug">{video.aiPrescription.pacingRule}</span>
                  </div>
                  <div className="p-2 bg-[#0c101a] rounded-none border border-[#1e273d]">
                    <span className="text-[9px] font-mono text-amber-400 font-bold block mb-0.5">CTA OPTIMIZATION:</span>
                    <span className="text-slate-300 text-[10px] leading-snug">{video.aiPrescription.ctaPlacement}</span>
                  </div>
                </div>

                {/* External AI Prompt Generator for Next Video */}
                <div className="pt-2 border-t border-[#1b253b] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="text-[10px] text-slate-300">
                    <span className="text-slate-500 font-mono">GENERATIVE PROMPT FOR NEXT THUMBNAIL / VIDEO: </span>
                    <code className="text-sky-300 font-mono">
                      "Cinematic 4K YouTube short split screen, high contrast tech aesthetic, neon cyan vs red glow, modern minimal UI --ar 9:16 --v 6.0"
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(
                      "Cinematic 4K YouTube short split screen, high contrast tech aesthetic, neon cyan vs red glow, modern minimal UI --ar 9:16 --v 6.0",
                      video.id
                    )}
                    className="px-2.5 py-1 text-[10px] font-bold text-white bg-[#192236] hover:bg-[#202c46] border border-[#2b3a5a] rounded-none flex items-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    {copiedPromptId === video.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    <span>{copiedPromptId === video.id ? 'Copied!' : 'Copy Tool Prompt'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

