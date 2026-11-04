import { useState, useEffect, useRef, useCallback } from 'react'
import { useForge, getAccent, useBgJob } from '../../App'
import {
  Sparkles, RefreshCw, Copy, Check, X,
  Mail, Instagram, Twitter, Smartphone, BarChart2, Image,
  AlertCircle, ExternalLink, Settings, ChevronDown, ChevronUp, Play,
  Home, BookOpen, MessageSquare, User, Calendar, Lock, Compass, Rocket, FileText, Layers, Briefcase,
  Terminal, Code, Utensils, Dumbbell, Gamepad2, Tv, LayoutGrid, Maximize2, Minimize2,
  ChevronLeft, ChevronRight, Download, Eye, Share2, Flame
} from 'lucide-react'
import {
  generateMarketingPack, generateProductImage,
  regenerateSection, hasTextKey, hasTogetherKey,
  buildChannelNativeMarketingPack, getChannelHeroFallbackImage,
  buildChannelSpecificImagePrompt, generateProductImageWithFlux,
  resetFailedAiKeys
} from '../../services/ai'
import ApiKeysModal from '../ui/ApiKeysModal'

// ── AI Commercial Image Styles ────────────────────────────────────────────────
const IMAGE_STYLES = [
  { id: 'saas_dashboard', label: '🖥️ SaaS Dashboard UI', desc: 'Dark obsidian UI with telemetry & charts' },
  { id: 'multi_device', label: '📱 Multi-Device Showcase', desc: 'MacBook Pro & iPhone 16 Pro on executive desk' },
  { id: 'studio_desk', label: '📸 Minimalist Studio Desk', desc: 'Executive creator workspace with 32" display' },
  { id: 'isometric_3d', label: '✨ 3D Floating Isometric', desc: 'Translucent glassmorphism panels & holographic streams' },
  { id: 'cyberpunk', label: '⚡ Dark Cyberdeck UI', desc: 'High-contrast futuristic matte black telemetry' },
]

// ── Copy button ────────────────────────────────────────────────────────────────

function CopyBtn({ text, label = 'Copy', small }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="flex items-center gap-1.5 rounded-none transition-all flex-shrink-0 font-medium"
      style={{
        fontSize: small ? '10px' : '11px',
        padding: small ? '3px 8px' : '6px 12px',
        background: copied ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.06)',
        color: copied ? '#34d399' : 'rgba(255,255,255,0.7)',
        border: `1px solid ${copied ? 'rgba(52, 211, 153, 0.35)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '0px'
      }}
    >
      {copied ? <><Check size={11} className="text-emerald-400" /> Copied</> : <><Copy size={11} /> {label}</>}
    </button>
  )
}

// ── Inline editable field ──────────────────────────────────────────────────────

function Editable({ value, onChange, multiline, className, style, placeholder }) {
  const [focus, setFocus] = useState(false)
  const Tag = multiline ? 'textarea' : 'input'
  return (
    <Tag
      className={`w-full bg-transparent outline-none resize-none transition-all rounded-none ${className || ''}`}
      style={{
        ...style,
        borderRadius: '0px',
        border: focus ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
        padding: focus ? '6px 8px' : '2px 0',
        background: focus ? 'rgba(255,255,255,0.03)' : 'transparent',
        cursor: 'text',
      }}
      placeholder={placeholder}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    />
  )
}

// ── Channel-grounded Product Mockup ───────────────────────────────────────────

function ProductMockup({ creatorData, accent }) {
  const productName = creatorData.blueprint?.name || creatorData.productName || 'Creator Academy'
  const preview = creatorData.blueprint?.preview
  const name = creatorData.name || creatorData.handle?.replace(/^@+/, '') || 'Creator'
  const handle = creatorData.handle?.startsWith('@') ? creatorData.handle : `@${creatorData.handle || 'creator'}`
  const niche = (creatorData.niche || 'Technology').toLowerCase()
  const avatarUrl = creatorData.avatarUrl
  const followers = creatorData.followers ? Number(creatorData.followers).toLocaleString() : '1,000,000'

  const isCoding = niche.includes('code') || niche.includes('program') || niche.includes('dev') || niche.includes('software') || niche.includes('tech') || name.toLowerCase().includes('bro code')
  const isCooking = niche.includes('cook') || niche.includes('food') || niche.includes('culinary') || niche.includes('meal') || name.toLowerCase().includes('angry birds') || name.toLowerCase().includes('chef')
  const isFitness = niche.includes('fit') || niche.includes('workout') || niche.includes('train') || niche.includes('gym')
  const isGaming = niche.includes('game') || niche.includes('gaming') || niche.includes('play') || niche.includes('stream')

  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  // Top window frame
  const BrowserFrame = ({ children, title = `${productName.toLowerCase().replace(/\s+/g, '-')}.com` }) => (
    <div className="rounded-none overflow-hidden border shadow-2xl" style={{ background: '#0a0a0c', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '0px' }}>
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b" style={{ background: '#121215', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {['#ff5f57', '#ffbd2e', '#28c840'].map(c => (
              <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.8 }} />
            ))}
          </div>
          <div className="h-4 w-px mx-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
          <span className="text-[10px] font-mono font-medium text-white/40 truncate max-w-[200px]">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] px-2 py-0.5 rounded-none font-mono font-semibold" style={{ background: `rgba(${accent.rgb},0.15)`, color: '#ffffff', borderRadius: '0px' }}>
            LIVE PREVIEW
          </span>
        </div>
      </div>
      {children}
    </div>
  )

  // 1. CODING / DEVELOPER NICHE — Interactive IDE Studio
  if (isCoding) {
    return (
      <BrowserFrame title={`${productName.toLowerCase().replace(/\s+/g, '-')}.dev`}>
        <div className="flex flex-col md:flex-row text-[12px] font-mono" style={{ minHeight: 260 }}>
          {/* File Explorer */}
          <div className="w-full md:w-44 border-r p-3 flex flex-col gap-1 flex-shrink-0" style={{ background: '#08080a', borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-2 pb-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <Terminal size={13} style={{ color: accent.color }} />
              <span className="text-[11px] font-bold text-white tracking-wide truncate">{productName}</span>
            </div>
            <p className="text-[9px] uppercase tracking-wider text-white/30 font-semibold mb-1">Explorer</p>
            {[
              { name: 'main.py', active: true, color: '#38bdf8' },
              { name: 'challenges.ts', active: false, color: '#f59e0b' },
              { name: 'solution.js', active: false, color: '#34d399' },
              { name: 'system_design.md', active: false, color: '#a78bfa' },
            ].map(file => (
              <div
                key={file.name}
                className="flex items-center gap-2 px-2 py-1.5 rounded-none text-[10px] cursor-pointer transition-colors"
                style={{
                  background: file.active ? `rgba(${accent.rgb},0.15)` : 'transparent',
                  color: file.active ? '#ffffff' : 'rgba(255,255,255,0.45)',
                  borderLeft: file.active ? `2px solid ${accent.color}` : '2px solid transparent',
                  borderRadius: '0px'
                }}
              >
                <Code size={11} style={{ color: file.color }} />
                <span className="truncate">{file.name}</span>
              </div>
            ))}
            <div className="mt-auto pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-1.5 text-[9px] text-white">
                <span className="w-1.5 h-1.5 rounded-none bg-[#c81e3c] animate-pulse" />
                <span>Compiler: Ready</span>
              </div>
            </div>
          </div>

          {/* Code Editor & Console */}
          <div className="flex-1 flex flex-col" style={{ background: '#0e0e12' }}>
            {/* Editor tab bar */}
            <div className="flex items-center border-b px-3 py-1.5 gap-2" style={{ background: '#0a0a0d', borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-[#16161c] text-[10px] text-white" style={{ borderRadius: '0px' }}>
                <span className="w-2 h-2 rounded-none" style={{ background: accent.color }} />
                <span>main.py</span>
                <span className="text-white/30 text-[9px] ml-1">×</span>
              </div>
              <span className="text-[10px] text-white/30">interactive sandbox</span>
            </div>

            {/* Syntax highlighted code */}
            <div className="p-4 flex-1 space-y-1 text-[11px] font-mono leading-relaxed overflow-x-auto">
              <p><span className="text-purple-400"># Welcome to {productName}</span> <span className="text-white/30">// Created by {name}</span></p>
              <p><span className="text-pink-400">from</span> <span className="text-amber-300">colaunch_studio</span> <span className="text-pink-400">import</span> <span className="text-blue-300">InteractiveSandbox</span></p>
              <p>&nbsp;</p>
              <p><span className="text-blue-400">class</span> <span className="text-yellow-300 font-semibold">{name.replace(/\s+/g, '')}Mastery</span>:</p>
              <p className="pl-4"><span className="text-pink-400">def</span> <span className="text-blue-300">__init__</span>(<span className="text-purple-300">self</span>):</p>
              <p className="pl-8"><span className="text-purple-300">self</span>.creator = <span className="text-emerald-300">"{handle}"</span></p>
              <p className="pl-8"><span className="text-purple-300">self</span>.members = <span className="text-amber-300">"{followers}+ active builders"</span></p>
              <p className="pl-8"><span className="text-purple-300">self</span>.status = <span className="text-[#c81e3c]">"Production Deployed"</span></p>
              <p>&nbsp;</p>
              <p className="pl-4"><span className="text-pink-400">def</span> <span className="text-blue-300">verify_challenge</span>(<span className="text-purple-300">self</span>, code_submission):</p>
              <p className="pl-8"><span className="text-pink-400">return</span> <span className="text-purple-300">self</span>.sandbox.run_automated_tests(code_submission)</p>
            </div>

            {/* Terminal console */}
            <div className="border-t p-2.5 px-3 flex items-center justify-between" style={{ background: '#09090c', borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-[#c81e3c] font-bold">$</span>
                <span className="text-white/60">pytest --test_suite=mastery</span>
                <span className="text-white ml-2 font-semibold">✓ 18 tests passed (0.14s)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] px-2 py-0.5 rounded-none font-mono font-medium" style={{ background: 'rgba(255,255,255,0.05)', color: '#ffffff', borderRadius: '0px' }}>
                  Py 3.12
                </span>
              </div>
            </div>
          </div>
        </div>
      </BrowserFrame>
    )
  }

  // 2. COOKING / MEAL KIT / CULINARY NICHE — Gourmet Chef Studio
  if (isCooking) {
    return (
      <BrowserFrame title={`${productName.toLowerCase().replace(/\s+/g, '-')}.kitchen`}>
        <div className="p-4" style={{ minHeight: 240, background: '#0c0a09' }}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none flex items-center justify-center shadow-lg" style={{ background: `linear-gradient(135deg, ${accent.color}, #ea580c)`, borderRadius: '0px' }}>
                <Utensils size={18} className="text-white" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-white leading-tight">{productName}</h4>
                <p className="text-[11px] text-white/40">Gourmet Culinary Box & Masterclass by {name}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] px-2.5 py-1 rounded-none font-bold uppercase" style={{ background: 'rgba(200, 30, 60, 0.2)', color: '#ffffff', borderRadius: '0px' }}>
                Cohort Batch #1 Live
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div className="rounded-none p-3 border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px' }}>
              <span className="text-[9px] uppercase font-bold text-white/30">Active Orders</span>
              <p className="text-[16px] font-black text-white mt-1">10,000 Boxes</p>
              <p className="text-[9px] text-[#c81e3c] mt-0.5 font-semibold">Sold out in 24 hours</p>
            </div>
            <div className="rounded-none p-3 border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px' }}>
              <span className="text-[9px] uppercase font-bold text-white/30">Farm-to-Door</span>
              <p className="text-[16px] font-black text-white mt-1">100% Organic</p>
              <p className="text-[9px] text-white/40 mt-0.5">Pre-measured secret spices</p>
            </div>
            <div className="rounded-none p-3 border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px' }}>
              <span className="text-[9px] uppercase font-bold text-white/30">Chef Vault</span>
              <p className="text-[16px] font-black text-white mt-1">24 Video Guides</p>
              <p className="text-[9px] text-white mt-0.5">Step-by-step masterclasses</p>
            </div>
          </div>

          <div className="rounded-none p-3 border flex items-center justify-between" style={{ background: `rgba(${accent.rgb}, 0.08)`, borderColor: `rgba(${accent.rgb}, 0.2)`, borderRadius: '0px' }}>
            <div className="flex items-center gap-2.5">
              <Flame size={16} style={{ color: accent.color }} />
              <div>
                <p className="text-[11px] font-bold text-white">This Week's Signature Dish: Anger Management Lava Cake</p>
                <p className="text-[9px] text-white/40">Includes custom pastry molds & secret Red Pepper Ganache recipe</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-none text-white" style={{ background: accent.color, color: '#ffffff', borderRadius: '0px' }}>
              Preview Box
            </span>
          </div>
        </div>
      </BrowserFrame>
    )
  }

  // 3. FITNESS / ATHLETE NICHE — Performance Command Center
  if (isFitness) {
    return (
      <BrowserFrame title={`${productName.toLowerCase().replace(/\s+/g, '-')}.fit`}>
        <div className="p-4" style={{ minHeight: 240, background: '#0a0d0d' }}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accent.color}, #a61830)`, borderRadius: '0px' }}>
                <Dumbbell size={18} className="text-white" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-white">{productName}</h4>
                <p className="text-[11px] text-white/40">Athletic Conditioning Hub by {name}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-none text-white" style={{ background: `rgba(${accent.rgb}, 0.25)`, border: `1px solid rgba(${accent.rgb}, 0.4)`, borderRadius: '0px' }}>
              PROGRAM VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mb-3">
            {[
              { val: '12 Weeks', lab: 'Periodization Protocol' },
              { val: '4K Form Vault', lab: 'Biomechanical Breakdown' },
              { val: 'Custom Macro', lab: 'Precision Nutrition Engine' },
            ].map(m => (
              <div key={m.lab} className="rounded-none p-2.5 text-center border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px' }}>
                <p className="text-[13px] font-bold text-white">{m.val}</p>
                <p className="text-[9px] text-white/40 mt-0.5">{m.lab}</p>
              </div>
            ))}
          </div>
        </div>
      </BrowserFrame>
    )
  }

  // 4. GAMING / ESPORTS NICHE
  if (isGaming) {
    return (
      <BrowserFrame title={`${productName.toLowerCase().replace(/\s+/g, '-')}.gg`}>
        <div className="p-4" style={{ minHeight: 240, background: '#090812' }}>
          <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-none flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${accent.color}, #a61830)`, borderRadius: '0px' }}>
                <Gamepad2 size={18} className="text-white" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-white">{productName}</h4>
                <p className="text-[11px] text-white/40">VIP Guild & Esports Strategy Vault</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-none text-white" style={{ background: `rgba(${accent.rgb}, 0.25)`, border: `1px solid rgba(${accent.rgb}, 0.4)`, borderRadius: '0px' }}>
              DISCORD SYNCED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-none p-3 border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px' }}>
              <p className="text-[11px] font-bold text-white">Ranked Meta Tier List</p>
              <p className="text-[9px] text-white/40 mt-1">Patch 14.8 analytics & replay reviews</p>
            </div>
            <div className="rounded-none p-3 border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px' }}>
              <p className="text-[11px] font-bold text-white">Private Scrim Matchmaker</p>
              <p className="text-[9px] text-white/40 mt-1">Weekly community tournaments</p>
            </div>
          </div>
        </div>
      </BrowserFrame>
    )
  }

  // 5. DEFAULT / SAAS / DIGITAL CREATOR HUB
  return (
    <BrowserFrame>
      <div className="flex" style={{ minHeight: 220 }}>
        {/* Sidebar */}
        <div className="w-36 sm:w-44 border-r p-3 flex flex-col gap-1" style={{ background: '#09090b', borderColor: 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2 mb-3 px-1">
            {avatarUrl ? (
              <img src={avatarUrl} className="w-6 h-6 rounded-none object-cover" alt="" onError={e => { e.currentTarget.style.display = 'none' }} style={{ borderRadius: '0px' }} />
            ) : (
              <div className="w-6 h-6 rounded-none flex items-center justify-center text-[9px] font-bold"
                style={{ background: `rgba(${accent.rgb},0.25)`, color: '#ffffff', borderRadius: '0px' }}>{initials}</div>
            )}
            <span className="text-[11px] font-bold text-white truncate">{productName}</span>
          </div>
          {['Dashboard', 'Core Curriculum', 'Private Network', 'Live Coaching'].map((item, i) => (
            <div key={item} className="px-2 py-1.5 rounded-none text-[10px] font-medium"
              style={{
                background: i === 0 ? `rgba(${accent.rgb},0.22)` : 'transparent',
                color: i === 0 ? '#ffffff' : 'rgba(255,255,255,0.45)',
                borderLeft: i === 0 ? `2px solid ${accent.color}` : '2px solid transparent',
                borderRadius: '0px'
              }}>
              {item}
            </div>
          ))}
        </div>
        {/* Main Content */}
        <div className="flex-1 p-4" style={{ background: '#0c0c0e' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[13px] font-bold text-white">Welcome back, Member</p>
              <p className="text-[10px] text-white/40">{niche} Mastery Hub by {name}</p>
            </div>
            <span className="px-2.5 py-1 rounded-none text-[9px] font-bold text-white" style={{ background: `rgba(${accent.rgb},0.28)`, border: `1px solid rgba(${accent.rgb}, 0.5)`, color: '#ffffff', borderRadius: '0px' }}>
              VIP Cohort
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              ['100%', 'Outcome Driven'],
              [followers, 'Community Reach'],
              ['4.9 / 5', 'Cohort Rating']
            ].map(([n, l]) => (
              <div key={l} className="rounded-none p-2.5 text-center border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '0px' }}>
                <p className="text-[13px] font-bold text-white">{n}</p>
                <p className="text-[8px] text-white/40 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BrowserFrame>
  )
}

// Helper to keep slide categories crisp and single-line in tight grid cards
function formatCategory(cat = '') {
  const c = cat.toUpperCase().trim()
  if (c.includes('EXECUTIVE')) return 'EXEC SUMMARY'
  if (c.includes('PROBLEM')) return 'MARKET PROBLEM'
  if (c.includes('PROPRIETARY') || c.includes('SOLUTION')) return 'SOLUTION'
  if (c.includes('ARCHITECTURE') || c.includes('DELIVERABLES')) return 'ARCHITECTURE'
  if (c.includes('AUDIENCE') || c.includes('PERSONA')) return 'TARGET AUDIENCE'
  if (c.includes('ECONOMICS') || c.includes('FINANCIAL') || c.includes('MONETIZATION')) return 'UNIT ECONOMICS'
  if (c.includes('GO-TO-MARKET') || c.includes('GTM') || c.includes('CONVERSION') || c.includes('RUNWAY')) return 'GO-TO-MARKET'
  if (c.includes('OFFER') || c.includes('INCENTIVE') || c.includes('FOUNDING')) return 'THE OFFER'
  return c.split('&')[0].trim().slice(0, 15)
}

function formatMetric(m = '') {
  if (!m) return ''
  return m.replace(' Global Community', ' Community')
          .replace(' Engagement Multiplier', ' Multiplier')
          .replace(' Modular Pillars', ' Pillars')
          .replace(' Commercial Readiness', ' Intent')
}

// ── 8-Slide Executive Pitch Deck Presenter ──────────────────────────────────────

function PitchDeckPresenter({ pack, creatorData, accent, onRegen, regenning, onUpdateSlide }) {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0)
  const [viewMode, setViewMode] = useState('presenter') // 'presenter' | 'grid'
  const [fullscreen, setFullscreen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const containerRef = useRef(null)

  const slides = pack?.pitchDeck?.slides || []
  const totalSlides = slides.length || 8
  const currentSlide = slides[currentSlideIdx] || {}

  const productName = creatorData.blueprint?.name || creatorData.productName || 'Creator Launch Suite'
  const creatorName = creatorData.name || creatorData.handle?.replace(/^@+/, '') || 'Creator'

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        setCurrentSlideIdx(prev => Math.min(prev + 1, totalSlides - 1))
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault()
        setCurrentSlideIdx(prev => Math.max(prev - 1, 0))
      } else if (e.key === 'Escape' && fullscreen) {
        setFullscreen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [totalSlides, fullscreen])

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!fullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {})
      }
      setFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
      setFullscreen(false)
    }
  }

  // Export full markdown pitch deck
  const handleDownloadMarkdown = () => {
    let md = `# ${pack?.pitchDeck?.headline || `${productName} — Executive Pitch Deck`}\n`
    md += `*${pack?.pitchDeck?.tagline || `An executive launch blueprint for ${creatorName}.`}*\n\n`
    md += `---\n\n`

    slides.forEach((s, idx) => {
      md += `## Slide ${idx + 1}: ${s.category || 'OVERVIEW'} — ${s.title}\n`
      if (s.subtitle) md += `*${s.subtitle}*\n\n`
      if (s.metricBadge) md += `> **Key Metric:** ${s.metricBadge}\n\n`
      if (Array.isArray(s.bullets)) {
        s.bullets.forEach(b => {
          md += `- ${b}\n`
        })
      }
      if (s.takeaway) md += `\n**Strategic Takeaway:** ${s.takeaway}\n\n`
      md += `---\n\n`
    })

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${creatorName.replace(/\s+/g, '_')}_Executive_PitchDeck.md`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const allDeckText = `${pack?.pitchDeck?.headline || productName}\n${pack?.pitchDeck?.tagline || ''}\n\n` +
    slides.map((s, idx) => `SLIDE ${idx + 1}: [${s.category}] ${s.title}\n${s.subtitle || ''}\n` +
      (s.bullets || []).map(b => `• ${b}`).join('\n') + `\nTakeaway: ${s.takeaway || ''}`
    ).join('\n\n---\n\n')

  return (
    <div
      ref={containerRef}
      className={`rounded-none border transition-all duration-300 flex flex-col ${
        fullscreen ? 'fixed inset-0 z-50 p-6 md:p-12 overflow-y-auto bg-[#070709]' : 'relative'
      }`}
      style={{
        background: '#09090c',
        borderColor: 'rgba(255,255,255,0.09)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}
    >
      {/* Deck Toolbar - Tight, sleek */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#0c0c10' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-none flex items-center justify-center font-bold" style={{ background: `rgba(${accent.rgb},0.15)`, color: accent.color }}>
            <BarChart2 size={13} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] font-bold text-white tracking-wide">Executive Pitch Deck</span>
              <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-none bg-amber-500/15 text-amber-300 border border-amber-500/20">
                {totalSlides} SLIDES
              </span>
            </div>
            <p className="text-[9.5px] text-white/40 leading-none">16:9 Presentation Studio · {creatorName}</p>
          </div>
        </div>

        {/* View Mode & Actions */}
        <div className="flex items-center gap-1.5">
          {/* Slideshow vs Grid Mode */}
          <div className="flex items-center rounded-none p-0.5 border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => setViewMode('presenter')}
              className="flex items-center gap-1 px-2 py-1 rounded-none text-[9.5px] font-medium transition-all"
              style={{
                background: viewMode === 'presenter' ? `rgba(${accent.rgb},0.2)` : 'transparent',
                color: viewMode === 'presenter' ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            >
              <Eye size={10} /> Presenter
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className="flex items-center gap-1 px-2 py-1 rounded-none text-[9.5px] font-medium transition-all"
              style={{
                background: viewMode === 'grid' ? `rgba(${accent.rgb},0.2)` : 'transparent',
                color: viewMode === 'grid' ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            >
              <LayoutGrid size={10} /> Grid (8-up)
            </button>
          </div>

          {/* Download Markdown */}
          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1 text-[9.5px] px-2 py-1 rounded-none border text-white/70 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
            title="Download formatted pitch deck (.md)"
          >
            <Download size={10} /> Export
          </button>

          {/* Copy Deck */}
          <CopyBtn text={allDeckText} label="Copy" small />

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1 rounded-none border text-white/50 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
            title={fullscreen ? "Exit fullscreen" : "Present fullscreen"}
          >
            {fullscreen ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
          </button>

          {/* Rewrite with AI */}
          {onRegen && (
            <button
              onClick={onRegen}
              disabled={regenning}
              className="flex items-center gap-1 text-[9.5px] px-2 py-1 rounded-none transition-all disabled:opacity-30 border"
              style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.25)' }}
            >
              <RefreshCw size={9} className={regenning ? 'animate-spin' : ''} />
              {regenning ? 'Rewriting…' : 'Rewrite'}
            </button>
          )}
        </div>
      </div>

      {/* ── MODE 1: PRESENTER CANVAS ─────────────────────────────────────────── */}
      {viewMode === 'presenter' && (
        <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
          {/* Main 16:9 Slide Canvas */}
          <div
            className="relative rounded-none p-5 sm:p-6 border shadow-2xl flex flex-col justify-between transition-all duration-300"
            style={{
              minHeight: fullscreen ? '65vh' : '310px',
              background: 'linear-gradient(145deg, #101016 0%, #08080b 100%)',
              borderColor: `rgba(${accent.rgb}, 0.22)`,
              boxShadow: `0 12px 36px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)`
            }}
          >
            {/* Top Slide Meta: Category Badge + Slide Counter */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="text-[9.5px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-none uppercase"
                  style={{
                    background: `rgba(${accent.rgb}, 0.18)`,
                    color: accent.color,
                    border: `1px solid rgba(${accent.rgb}, 0.3)`
                  }}
                >
                  {currentSlide.category || `SLIDE ${currentSlideIdx + 1}`}
                </span>
                {currentSlide.metricBadge && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-none bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-none bg-emerald-400" />
                    {currentSlide.metricBadge}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-semibold text-white/40">
                  Slide <span className="text-white font-bold">{currentSlideIdx + 1}</span> / {totalSlides}
                </span>
              </div>
            </div>

            {/* Slide Body: Title, Subtitle, Bullets */}
            <div className="my-auto py-1">
              <h3 className="text-[16px] sm:text-[20px] font-black text-white tracking-tight leading-snug mb-1.5">
                {currentSlide.title || `${productName} Overview`}
              </h3>
              {currentSlide.subtitle && (
                <p className="text-[12px] sm:text-[13px] text-white/50 mb-3 leading-relaxed max-w-2xl font-medium">
                  {currentSlide.subtitle}
                </p>
              )}

              {/* Bullet points */}
              <div className="space-y-2 max-w-3xl">
                {(currentSlide.bullets || []).map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-2.5 group">
                    <div
                      className="w-4 h-4 rounded-none flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: `rgba(${accent.rgb}, 0.15)`,
                        color: accent.color,
                        border: `1px solid rgba(${accent.rgb}, 0.25)`
                      }}
                    >
                      <Check size={9} strokeWidth={3} />
                    </div>
                    <p className="text-[12.5px] sm:text-[13px] text-white/80 leading-relaxed font-normal">
                      {bullet}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Key Takeaway Callout */}
            {currentSlide.takeaway && (
              <div
                className="mt-4 pt-3 border-t flex items-center justify-between flex-wrap gap-2"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2 text-[10.5px] text-white/60">
                  <span className="font-bold uppercase tracking-wider text-[9.5px]" style={{ color: accent.color }}>
                    Takeaway:
                  </span>
                  <span>{currentSlide.takeaway}</span>
                </div>
                <div className="text-[9px] text-white/20 font-mono">
                  {creatorName} · Confidential Launch
                </div>
              </div>
            )}
          </div>

          {/* Presenter Navigation Controls */}
          <div className="mt-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentSlideIdx(p => Math.max(p - 1, 0))}
                disabled={currentSlideIdx === 0}
                className="flex items-center gap-1 px-2.5 py-1 rounded-none border text-[10px] font-semibold text-white/70 hover:text-white transition-all disabled:opacity-20"
                style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <ChevronLeft size={11} /> Prev
              </button>
              <button
                onClick={() => setCurrentSlideIdx(p => Math.min(p + 1, totalSlides - 1))}
                disabled={currentSlideIdx === totalSlides - 1}
                className="flex items-center gap-1 px-3 py-1 rounded-none border text-[10px] font-bold text-white transition-all disabled:opacity-20 shadow-md"
                style={{
                  background: `linear-gradient(135deg, rgba(${accent.rgb}, 0.35), rgba(${accent.rgb}, 0.2))`,
                  borderColor: `rgba(${accent.rgb}, 0.4)`
                }}
              >
                Next <ChevronRight size={11} />
              </button>
            </div>

            {/* Slide Track Dots & Jump Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIdx(idx)}
                  className="group relative flex items-center justify-center p-1 rounded-none transition-all"
                  style={{
                    background: currentSlideIdx === idx ? `rgba(${accent.rgb}, 0.25)` : 'rgba(255,255,255,0.03)',
                    border: currentSlideIdx === idx ? `1px solid ${accent.color}` : '1px solid rgba(255,255,255,0.06)'
                  }}
                  title={`Slide ${idx + 1}: ${s.category || s.title}`}
                >
                  <span
                    className="text-[8.5px] font-mono font-bold px-1"
                    style={{ color: currentSlideIdx === idx ? '#fff' : 'rgba(255,255,255,0.4)' }}
                  >
                    0{idx + 1}
                  </span>
                </button>
              ))}
            </div>

            <div className="text-[9.5px] text-white/30 hidden md:block">
              <kbd className="px-1 py-0.5 rounded-none bg-white/10 text-white/60 font-mono text-[8.5px]">←</kbd> <kbd className="px-1 py-0.5 rounded-none bg-white/10 text-white/60 font-mono text-[8.5px]">→</kbd> to present
            </div>
          </div>
        </div>
      )}

      {/* ── MODE 2: 8-UP GRID OVERVIEW (TIGHT & COMPACT) ────────────────────── */}
      {viewMode === 'grid' && (
        <div className="p-2.5 sm:p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
          {slides.map((s, idx) => (
            <div
              key={idx}
              onClick={() => {
                setCurrentSlideIdx(idx)
                setViewMode('presenter')
              }}
              className="group rounded-none p-2.5 sm:p-3 border cursor-pointer transition-all duration-150 hover:border-white/20 flex flex-col justify-between"
              style={{
                background: currentSlideIdx === idx ? `rgba(${accent.rgb}, 0.1)` : '#0b0b0e',
                borderColor: currentSlideIdx === idx ? accent.color : 'rgba(255,255,255,0.07)',
                boxShadow: currentSlideIdx === idx ? `0 0 14px rgba(${accent.rgb}, 0.15)` : 'none',
                minHeight: '138px'
              }}
            >
              <div>
                {/* Header row: tight slide number + single-line category pill + clean metric */}
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-none flex-shrink-0"
                      style={{
                        background: currentSlideIdx === idx ? accent.color : 'rgba(255,255,255,0.07)',
                        color: currentSlideIdx === idx ? '#000' : 'rgba(255,255,255,0.7)',
                        border: currentSlideIdx === idx ? 'none' : '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      0{idx + 1}
                    </span>
                    <span
                      className="text-[8.5px] font-mono font-bold tracking-wider uppercase truncate"
                      style={{ color: currentSlideIdx === idx ? accent.color : 'rgba(255,255,255,0.45)' }}
                    >
                      {formatCategory(s.category)}
                    </span>
                  </div>
                  {s.metricBadge && (
                    <span
                      className="text-[7.5px] font-mono font-semibold px-1.5 py-0.5 rounded-none flex-shrink-0 border"
                      style={{
                        background: 'rgba(52, 211, 153, 0.08)',
                        color: '#34d399',
                        borderColor: 'rgba(52, 211, 153, 0.2)'
                      }}
                    >
                      {formatMetric(s.metricBadge)}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h5 className="text-[11.5px] font-bold text-white line-clamp-1 leading-snug mb-0.5 group-hover:text-white transition-colors">
                  {s.title}
                </h5>

                {/* Subtitle */}
                {s.subtitle && (
                  <p className="text-[9.5px] text-white/40 line-clamp-1 leading-tight mb-1.5">
                    {s.subtitle}
                  </p>
                )}

                {/* Bullets (tight single-line preview) */}
                <div className="space-y-0.5 my-1">
                  {(s.bullets || []).slice(0, 2).map((b, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-1 text-[8.5px] text-white/55 leading-tight">
                      <span className="text-white/25 leading-none mt-0.5">•</span>
                      <span className="line-clamp-1">{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom bar */}
              <div
                className="mt-2 pt-1.5 border-t flex items-center justify-between text-[8px] font-mono"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <span className="text-white/30 group-hover:text-white/60 transition-colors">
                  {currentSlideIdx === idx ? '● Current slide' : 'Present slide'}
                </span>
                <ChevronRight size={10} className="text-white/30 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Step row shown during generation ──────────────────────────────────────────

const STEPS = [
  { id: 'pitchDeck', label: 'Drafting 8-slide pitch deck',    icon: BarChart2,  color: '#f59e0b' },
  { id: 'email',     label: 'Writing launch announcement',   icon: Mail,       color: '#34d399' },
  { id: 'instagram', label: 'Crafting Instagram caption',    icon: Instagram,  color: '#e1306c' },
  { id: 'twitter',   label: 'Building X viral thread',       icon: Twitter,    color: '#60a5fa' },
  { id: 'tiktok',    label: 'Scripting TikTok video hook',   icon: Smartphone, color: '#69c9d0' },
  { id: 'image',     label: 'Rendering channel 4K visual',   icon: Image,      color: '#a78bfa' },
]

function StepRow({ step, status, index }) {
  const Icon = step.icon
  const stepNum = String((index ?? 0) + 1).padStart(2, '0')
  const isActive = status === 'active'
  const isDone = status === 'done'
  const isSkipped = status === 'skipped'

  return (
    <div
      className={`flex items-center gap-3.5 px-4 py-3 transition-all duration-300 border-l-2 ${
        isActive
          ? 'bg-white/[0.04] border-[#c81e3c]'
          : isDone
            ? 'bg-transparent border-emerald-500/50'
            : 'bg-transparent border-transparent opacity-40'
      }`}
      style={{ borderRadius: '0px' }}
    >
      {/* Icon / Status Indicator */}
      <div
        className="w-7 h-7 rounded-none flex items-center justify-center flex-shrink-0 transition-all border"
        style={{
          background: isDone
            ? '#c81e3c'
            : isActive
              ? 'rgba(200, 30, 60, 0.2)'
              : 'rgba(255, 255, 255, 0.04)',
          borderColor: isDone
            ? '#c81e3c'
            : isActive
              ? '#c81e3c'
              : 'rgba(255, 255, 255, 0.1)',
          borderRadius: '0px'
        }}
      >
        {isDone ? (
          <Check size={13} className="text-white" strokeWidth={3} />
        ) : isActive ? (
          <Sparkles size={13} className="text-[#c81e3c] animate-spin" />
        ) : isSkipped ? (
          <X size={12} className="text-white/30" />
        ) : (
          <span className="text-[10px] font-mono text-white/40 font-bold">{stepNum}</span>
        )}
      </div>

      {/* Label & Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-[12.5px] font-bold tracking-tight truncate ${
            isActive ? 'text-white' : isDone ? 'text-white/85' : 'text-white/40'
          }`}>
            {step.label}
          </span>
          {isActive && (
            <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase bg-[#c81e3c]/20 text-white border border-[#c81e3c]/40 animate-pulse">
              Synthesizing
            </span>
          )}
        </div>
      </div>

      {/* Status Pill */}
      <div className="shrink-0 text-right">
        {isDone && (
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20">
            Ready
          </span>
        )}
        {isActive && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-none bg-[#c81e3c] animate-ping" />
            <span className="text-[10.5px] font-mono text-white/70 font-semibold">Generating…</span>
          </div>
        )}
        {!isDone && !isActive && !isSkipped && (
          <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
            Queued
          </span>
        )}
        {isSkipped && (
          <span className="text-[10px] font-mono text-white/20 uppercase">Skipped</span>
        )}
      </div>
    </div>
  )
}

// ── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ id, title, icon: Icon, iconColor, children, onRegen, regenning, accent, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-none border overflow-hidden transition-all duration-300"
      style={{ background: '#0e0e12', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '0px' }}>
      <div className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => setOpen(v => !v)}
        style={{ borderBottom: open ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-none flex items-center justify-center flex-shrink-0"
            style={{ background: `${iconColor}20`, borderRadius: '0px' }}>
            <Icon size={13} style={{ color: iconColor }} />
          </div>
          <span className="text-[13px] font-bold text-white">{title}</span>
        </div>
        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
          {onRegen && (
            <button
              onClick={onRegen}
              disabled={regenning}
              className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-none transition-all disabled:opacity-30 border"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.7)', borderColor: 'rgba(255,255,255,0.12)', borderRadius: '0px' }}
              onMouseEnter={e => e.currentTarget.style.color = '#ffffff'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            >
              <RefreshCw size={9} className={regenning ? 'animate-spin' : ''} />
              {regenning ? 'Rewriting…' : 'Rewrite'}
            </button>
          )}
          <div style={{ color: 'rgba(255,255,255,0.3)' }}>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>
      {open && <div className="p-4 sm:p-5">{children}</div>}
    </div>
  )
}

// ── Main AI Does It Panel ─────────────────────────────────────────────────────

const PACK_JOB   = 'launch-pack'
const IMAGE_JOB  = 'launch-pack-image'

export default function AiDoesItPanel({ onClose }) {
  const {
    creatorData, startBgJob, cancelBgJob, clearBgJob,
    incrementAiActions, setApiModalOpen, triggerToast,
    syncSessionToDb, dbLoadedTimestamp
  } = useForge()

  const accent = getAccent(creatorData.platform)
  const packJob  = useBgJob(PACK_JOB)
  const imageJob = useBgJob(IMAGE_JOB)

  const handle = creatorData?.handle || 'default'
  const creatorName = creatorData.name || creatorData.handle?.replace(/^@+/, '') || 'Creator'
  const niche = creatorData.niche || 'Digital Creation'
  const followers = creatorData.followers ? Number(creatorData.followers).toLocaleString() : '1,000,000'
  const productName = creatorData.blueprint?.name || creatorData.productName || `${creatorName} Pro Suite`

  const [activeTab, setActiveTab] = useState('deck') // 'deck' | 'email' | 'social' | 'mockup' | 'all'

  const [pack, setPack] = useState(() => {
    try {
      const cached = localStorage.getItem(`forge_${handle}_launch_pack`)
      return cached ? JSON.parse(cached) : null
    } catch (e) {
      console.error(e)
      return null
    }
  })

  const [imageUrl, setImageUrl] = useState(() => {
    const cached = localStorage.getItem(`forge_${handle}_launch_image`)
    if (cached && !cached.includes('/images/saas_multi_device_showcase.jpg') && !cached.includes('/images/hero_saas_macbook.jpg')) {
      return cached
    }
    return getChannelHeroFallbackImage(creatorData) || null
  })

  // User-directed AI Image Studio state
  const [selectedStyle, setSelectedStyle] = useState('saas_dashboard')
  const [imageEngine, setImageEngine] = useState('flux') // 'flux' (free cloud AI) | 'openai' | 'gemini'
  const [customImagePrompt, setCustomImagePrompt] = useState(() => {
    return buildChannelSpecificImagePrompt(creatorData, 'saas_dashboard', accent.color)
  })
  const [isPromptDirty, setIsPromptDirty] = useState(false)

  // Keep prompt in sync with channel data if not customized by user
  useEffect(() => {
    if (!isPromptDirty) {
      setCustomImagePrompt(buildChannelSpecificImagePrompt(creatorData, selectedStyle, accent.color))
    }
  }, [creatorData?.name, creatorData?.handle, creatorData?.productName, creatorData?.niche, selectedStyle, accent.color, isPromptDirty])

  const [phase, setPhase] = useState(() => {
    const cachedPack = localStorage.getItem(`forge_${handle}_launch_pack`)
    return cachedPack ? 'done' : 'idle'
  })

  const [stepStatus, setStepStatus] = useState(() => {
    const cachedPack = localStorage.getItem(`forge_${handle}_launch_pack`)
    const cachedImage = localStorage.getItem(`forge_${handle}_launch_image`)
    const fallbackImage = getChannelHeroFallbackImage(creatorData)
    const initial = {}
    STEPS.forEach(s => {
      initial[s.id] = (s.id === 'image' && (cachedImage || fallbackImage)) || (s.id !== 'image' && cachedPack) ? 'done' : 'pending'
    })
    return initial
  })

  const [imageError, setImageError] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [regenning, setRegenning] = useState({})

  // Persist pack and image
  useEffect(() => {
    if (pack) {
      localStorage.setItem(`forge_${handle}_launch_pack`, JSON.stringify(pack))
      setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
    }
  }, [pack, handle, syncSessionToDb])

  useEffect(() => {
    if (imageUrl) {
      localStorage.setItem(`forge_${handle}_launch_image`, imageUrl)
      setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
    }
  }, [imageUrl, handle, syncSessionToDb])

  // Sync from cache & purge legacy static mockups
  useEffect(() => {
    const h = creatorData?.handle
    if (!h || h === 'default') return

    const cachedPack = localStorage.getItem(`forge_${h}_launch_pack`) || localStorage.getItem(`forge_${h.toLowerCase()}_launch_pack`)
    if (cachedPack) {
      try {
        setPack(JSON.parse(cachedPack))
        setPhase('done')
      } catch (e) {
        console.error('Failed to parse cached pack:', e)
      }
    }

    const cachedImage = localStorage.getItem(`forge_${h}_launch_image`) || localStorage.getItem(`forge_${h.toLowerCase()}_launch_image`)
    if (cachedImage && !cachedImage.includes('/images/saas_multi_device_showcase.jpg') && !cachedImage.includes('/images/hero_saas_macbook.jpg')) {
      setImageUrl(cachedImage)
    } else {
      const fresh = getChannelHeroFallbackImage(creatorData)
      setImageUrl(fresh)
      localStorage.setItem(`forge_${h}_launch_image`, fresh)
    }

    const cachedEdits = localStorage.getItem(`forge_${h}_launch_pack_edits`) || localStorage.getItem(`forge_${h.toLowerCase()}_launch_pack_edits`)
    if (cachedEdits) {
      try {
        setEdits(JSON.parse(cachedEdits))
      } catch (e) {
        console.error('Failed to parse cached edits:', e)
      }
    }

    if (cachedPack || cachedImage) {
      const initial = {}
      STEPS.forEach(s => {
        initial[s.id] = (s.id === 'image' && cachedImage) || (s.id !== 'image' && cachedPack) ? 'done' : 'pending'
      })
      setStepStatus(initial)
    }
  }, [creatorData?.handle, dbLoadedTimestamp])

  // Background jobs listener
  useEffect(() => {
    if (packJob.status === 'done' && packJob.result) {
      STEPS.slice(0, 5).forEach(s => setStepStatus(prev => ({ ...prev, [s.id]: 'done' })))
      setPack(packJob.result)
      setPhase('done')
      clearBgJob(PACK_JOB)
      if (triggerToast) triggerToast('Marketing Pack generated successfully!', 'success')
    }
    if (packJob.status === 'error' || packJob.status === 'cancelled') {
      if (packJob.status === 'error') {
        setErrorMsg(packJob.error || 'Generation failed')
        setPhase('error')
      } else {
        const cachedPack = localStorage.getItem(`forge_${handle}_launch_pack`)
        if (cachedPack) {
          try {
            setPack(JSON.parse(cachedPack))
            setPhase('done')
          } catch {
            setPhase('idle')
          }
        } else {
          setPhase('idle')
        }
      }
      clearBgJob(PACK_JOB)
    }
    if (packJob.status === 'running' && phase === 'idle') {
      setPhase('running')
      const initial = {}
      STEPS.forEach(s => { initial[s.id] = 'pending' })
      setStepStatus(initial)
    }
  }, [packJob.status, packJob.result, packJob.error, handle, clearBgJob, phase, triggerToast])

  useEffect(() => {
    if (imageJob.status === 'done' && imageJob.result) {
      setImageUrl(imageJob.result)
      setStepStatus(prev => ({ ...prev, image: 'done' }))
      clearBgJob(IMAGE_JOB)
      if (triggerToast) triggerToast('Product Visual generated with OpenAI!', 'success')
    }
    if (imageJob.status === 'error' || imageJob.status === 'cancelled') {
      if (imageJob.status === 'cancelled') {
        const cachedImage = localStorage.getItem(`forge_${handle}_launch_image`)
        setImageUrl(cachedImage || null)
        setStepStatus(prev => ({ ...prev, image: cachedImage ? 'done' : 'pending' }))
      } else {
        setImageError(imageJob.error || 'Image generation failed')
        const fallback = getChannelHeroFallbackImage(creatorData)
        if (fallback) {
          setImageUrl(fallback)
          setStepStatus(prev => ({ ...prev, image: 'done' }))
        } else {
          setStepStatus(prev => ({ ...prev, image: 'error' }))
        }
      }
      clearBgJob(IMAGE_JOB)
    }
    if (imageJob.status === 'running') {
      setStepStatus(prev => ({ ...prev, image: 'active' }))
    }
  }, [imageJob.status, imageJob.result, imageJob.error, handle, clearBgJob, triggerToast, creatorData])

  // Edited values
  const [edits, setEdits] = useState(() => {
    try {
      const cached = localStorage.getItem(`forge_${handle}_launch_pack_edits`)
      return cached ? JSON.parse(cached) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    if (handle !== '@creator' && Object.keys(edits).length > 0) {
      localStorage.setItem(`forge_${handle}_launch_pack_edits`, JSON.stringify(edits))
      setTimeout(() => { if (syncSessionToDb) syncSessionToDb() }, 50)
    }
  }, [edits, handle, syncSessionToDb])

  const val = (path, fallback = '') => edits[path] !== undefined ? edits[path] : fallback
  const set = (path, v) => setEdits(p => ({ ...p, [path]: v }))

  // Merged helpers
  const emailSubj   = () => val('email.subject', pack?.email?.subject || '')
  const emailBody   = () => val('email.body', pack?.email?.body || '')
  const igCaption   = () => val('ig.caption', pack?.instagram?.caption || '')
  const igTags      = () => val('ig.hashtags', (pack?.instagram?.hashtags || []).join(' '))
  const tweet       = i  => val(`tw.${i}`, pack?.twitter?.thread?.[i] || '')
  const tiktokHook  = () => val('tt.hook', pack?.tiktok?.hook || '')
  const tiktokScript= () => val('tt.script', pack?.tiktok?.script || '')

  // Instant Studio Preview (channel-grounded without waiting)
  const loadInstantStudio = () => {
    const instantPack = buildChannelNativeMarketingPack(creatorData)
    setPack(instantPack)
    const fallbackImg = getChannelHeroFallbackImage(creatorData)
    if (fallbackImg && !imageUrl) {
      setImageUrl(fallbackImg)
      localStorage.setItem(`forge_${handle}_launch_image`, fallbackImg)
    }
    setPhase('done')
    STEPS.forEach(s => {
      setStepStatus(prev => ({ ...prev, [s.id]: 'done' }))
    })
    if (triggerToast) triggerToast(`Loaded instant launch pack tailored to ${creatorName}!`, 'info')
  }

  // Run full AI generation
  const run = async () => {
    if (incrementAiActions) incrementAiActions()

    setPhase('running')
    setErrorMsg('')
    setImageError('')
    setPack(null)
    setImageUrl(null)
    setEdits({})

    const initial = {}
    STEPS.forEach(s => { initial[s.id] = 'pending' })
    setStepStatus(initial)

    // Kick off jobs
    startBgJob(PACK_JOB, (sig) => generateMarketingPack(creatorData, sig))
    startBgJob(IMAGE_JOB, (sig) => generateProductImage(creatorData, sig))

    // Step animations
    const textSteps = STEPS.slice(0, 5)
    const stepDurations = [900, 800, 700, 800, 900]
    for (let i = 0; i < textSteps.length; i++) {
      const step = textSteps[i]
      setStepStatus(prev => ({ ...prev, [step.id]: 'active' }))
      await new Promise(r => setTimeout(r, stepDurations[i]))
    }
  }

  // Custom User-Directed AI Image Generator
  const handleGenerateCustomImage = async (engineOverride = null, seedOverride = null) => {
    const engineToUse = engineOverride || imageEngine
    setRegenning(p => ({ ...p, image: true }))
    if (incrementAiActions) incrementAiActions()
    setImageError('')
    setStepStatus(prev => ({ ...prev, image: 'active' }))
    try {
      const generated = await generateProductImage(creatorData, {
        prompt: customImagePrompt,
        style: selectedStyle,
        brandColor: accent.color,
        engine: engineToUse,
        seed: seedOverride || Math.floor(Math.random() * 899999) + 100000
      })
      if (generated) {
        setImageUrl(generated)
        setStepStatus(prev => ({ ...prev, image: 'done' }))
        localStorage.setItem(`forge_${handle}_launch_image`, generated)
        if (triggerToast) triggerToast(`Product hero visual generated with ${engineToUse.toUpperCase()} AI!`, 'success')
      }
    } catch (err) {
      console.error('Image generation error:', err)
      setImageError(err.message || 'Image generation failed')
      const fallback = getChannelHeroFallbackImage(creatorData)
      if (fallback) {
        setImageUrl(fallback)
        setStepStatus(prev => ({ ...prev, image: 'done' }))
      } else {
        setStepStatus(prev => ({ ...prev, image: 'error' }))
      }
      if (triggerToast) triggerToast(`Image generation: ${err.message}`, 'error')
    } finally {
      setRegenning(p => ({ ...p, image: false }))
    }
  }

  // Regen single section
  const regen = async (section) => {
    if (section === 'image') {
      await handleGenerateCustomImage()
      return
    }

    setRegenning(p => ({ ...p, [section]: true }))
    if (incrementAiActions) incrementAiActions()
    try {
      const result = await regenerateSection(section, creatorData)
      setPack(prev => ({ ...prev, [section]: result }))
      setEdits(prev => {
        const next = { ...prev }
        const prefix = { email: 'email', instagram: 'ig', twitter: 'tw', tiktok: 'tt', pitchDeck: ['deck', 'slide'] }[section]
        if (Array.isArray(prefix)) prefix.forEach(p => Object.keys(next).filter(k => k.startsWith(p + '.')).forEach(k => delete next[k]))
        else Object.keys(next).filter(k => k.startsWith(prefix + '.')).forEach(k => delete next[k])
        return next
      })
    } catch (e) {
      console.error(e)
    }
    setRegenning(p => ({ ...p, [section]: false }))
  }

  return (
    <div
      className="rounded-none border overflow-hidden transition-all duration-300"
      style={{
        background: '#09090c',
        borderColor: `rgba(${accent.rgb}, 0.25)`,
        boxShadow: `0 16px 40px rgba(0,0,0,0.4)`
      }}
    >
      {/* ── Studio Header ────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b flex-wrap gap-3"
        style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#0e0e13' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-none flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(135deg, rgba(${accent.rgb},0.3), rgba(${accent.rgb},0.15))`,
              border: `1px solid rgba(${accent.rgb},0.3)`
            }}
          >
            <Sparkles size={16} style={{ color: accent.color }} className={phase === 'running' ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[14px] font-bold text-white tracking-wide">AI Launch Studio</h3>
              <span
                className="text-[9px] px-2 py-0.5 rounded-none font-mono font-bold"
                style={{ background: `rgba(${accent.rgb}, 0.15)`, color: accent.color }}
              >
                {handle}
              </span>
            </div>
            <p className="text-[11px] text-white/40">
              {phase === 'running' ? 'AI is crafting channel-tailored launch assets…'
                : phase === 'done' ? 'Ready · 8-Slide Pitch Deck, Email, Social Suite & Channel Visuals'
                : `Grounding with ${creatorName} (${followers} on ${creatorData.platform || 'YouTube'})`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {phase === 'done' && (
            <button
              onClick={() => { setPhase('idle'); setPack(null); setEdits({}) }}
              className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-none border text-white/60 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <RefreshCw size={11} /> Reset
            </button>
          )}

          <button
            onClick={() => setApiModalOpen(true)}
            className="p-2 rounded-none border transition-all text-white/40 hover:text-white"
            style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
            title="Configure AI API Keys"
          >
            <Settings size={13} />
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-none border transition-all text-white/40 hover:text-white"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* ── 1. IDLE STATE: EXECUTIVE HERO & CAPABILITY CARDS ── */}
        {phase === 'idle' && (
          <div className="space-y-6 py-2">
            {/* Grounding Telemetry Banner */}
            <div
              className="rounded-none p-5 border flex flex-col md:flex-row items-center justify-between gap-4"
              style={{
                background: 'linear-gradient(145deg, #121217 0%, #0a0a0e 100%)',
                borderColor: `rgba(${accent.rgb}, 0.2)`
              }}
            >
              <div className="flex items-center gap-4">
                {creatorData.avatarUrl ? (
                  <img src={creatorData.avatarUrl} alt="" className="w-14 h-14 rounded-none object-cover border border-white/10" />
                ) : (
                  <div className="w-14 h-14 rounded-none flex items-center justify-center font-bold text-[18px]"
                    style={{ background: `rgba(${accent.rgb}, 0.2)`, color: accent.color }}>
                    {creatorName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[16px] font-black text-white">{creatorName}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-none font-mono font-semibold" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
                      {creatorData.platform || 'YouTube'} · {niche}
                    </span>
                  </div>
                  <p className="text-[12px] text-white/50 mt-0.5">
                    Target Blueprint: <span className="text-white font-medium">{productName}</span>
                  </p>
                  <p className="text-[11px] font-mono mt-1" style={{ color: accent.color }}>
                    Audience Reach: {followers} followers · Ready for Day-1 Conversion
                  </p>
                </div>
              </div>

              {/* Launch CTA */}
              <div className="flex items-center gap-2.5 w-full md:w-auto">
                <button
                  onClick={run}
                  className="w-full md:w-auto flex items-center justify-center gap-2.5 px-6 py-3 rounded-none font-bold text-[13px] text-white transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  style={{
                    background: '#c81e3c',
                    boxShadow: '0 8px 24px rgba(200, 30, 60, 0.35)',
                    color: '#ffffff',
                    borderRadius: '0px'
                  }}
                >
                  <Sparkles size={15} className="text-white" style={{ color: '#ffffff' }} />
                  <span className="text-white font-bold" style={{ color: '#ffffff' }}>Do all steps with AI</span>
                </button>
              </div>
            </div>

            {/* 4 Executive Capability Previews */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  icon: BarChart2,
                  color: '#f59e0b',
                  title: '8-Slide Executive Deck',
                  desc: 'Full 16:9 widescreen presentation deck covering market problem, solution, unit economics & launch offer.'
                },
                {
                  icon: Mail,
                  color: '#34d399',
                  title: 'VIP Launch Email',
                  desc: 'High-converting founding cohort invitation written strictly in your channel voice and tone.'
                },
                {
                  icon: Instagram,
                  color: '#e1306c',
                  title: 'Social Multi-Suite',
                  desc: 'Viral X threads, high-hook TikTok scripts, and high-engagement Instagram launch posts.'
                },
                {
                  icon: Image,
                  color: '#a78bfa',
                  title: 'Channel-Native Visuals',
                  desc: 'IDE & interactive code sandbox for developers, gourmet meal kits for food, or custom platform mockups.'
                }
              ].map(card => (
                <div
                  key={card.title}
                  className="rounded-none p-4 border flex flex-col justify-between"
                  style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <div>
                    <div className="w-8 h-8 rounded-none flex items-center justify-center mb-3" style={{ background: `${card.color}15` }}>
                      <card.icon size={16} style={{ color: card.color }} />
                    </div>
                    <h5 className="text-[12px] font-bold text-white mb-1">{card.title}</h5>
                    <p className="text-[11px] text-white/40 leading-relaxed">{card.desc}</p>
                  </div>
                  <span className="text-[9px] font-mono mt-3 text-white/20 uppercase tracking-wider">Channel Calibrated</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 2. RUNNING STATE: ANIMATED GENERATION (Image 3 Overhaul) ──────────── */}
        {phase === 'running' && (
          <div className="py-2">
            <div
              className="rounded-none border overflow-hidden shadow-2xl"
              style={{
                background: '#090a0f',
                borderColor: 'rgba(255,255,255,0.1)',
                borderTop: '2px solid #c81e3c',
                borderRadius: '0px'
              }}
            >
              {/* Header with live progress stats */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0e1017' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-none flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(200, 30, 60, 0.15)', border: '1px solid rgba(200, 30, 60, 0.35)', borderRadius: '0px' }}
                  >
                    <Sparkles size={16} className="text-white animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] font-black text-white tracking-wide">
                        Synthesizing Launch Ecosystem
                      </h4>
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase bg-[#c81e3c] text-white" style={{ borderRadius: '0px', color: '#ffffff' }}>
                        AI Active
                      </span>
                    </div>
                    <p className="text-[11px] text-white/50 mt-0.5">
                      Grounding pitch deck, announcement emails, viral social suite &amp; 4K visuals for {creatorName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[11.5px] font-mono font-bold text-white block">
                      {STEPS.filter(s => stepStatus[s.id] === 'done').length} / {STEPS.length} Completed
                    </span>
                    <span className="text-[9.5px] font-mono text-white/40">
                      {Math.round((STEPS.filter(s => stepStatus[s.id] === 'done').length / STEPS.length) * 100)}% Synchronized
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      cancelBgJob(PACK_JOB)
                      cancelBgJob(IMAGE_JOB)
                      setPhase('idle')
                    }}
                    className="text-[11px] font-bold text-white/70 hover:text-white border border-white/15 hover:border-white/30 px-3.5 py-1.5 rounded-none transition-all cursor-pointer bg-white/[0.04]"
                    style={{ borderRadius: '0px' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Integrated Precision Progress Track */}
              <div className="h-1.5 w-full bg-white/[0.04] overflow-hidden relative">
                <div
                  className="h-full transition-all duration-500 ease-out"
                  style={{
                    background: '#c81e3c',
                    width: `${Math.max(8, (STEPS.filter(s => stepStatus[s.id] === 'done').length / STEPS.length) * 100)}%`,
                    boxShadow: '0 0 12px rgba(200, 30, 60, 0.6)'
                  }}
                />
              </div>

              {/* Steps List */}
              <div className="divide-y divide-white/[0.04] p-1">
                {STEPS.map((step, idx) => (
                  <StepRow
                    key={step.id}
                    step={step}
                    index={idx}
                    status={stepStatus[step.id] || 'pending'}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 3. ERROR STATE ──────────────────────────────────── */}
        {phase === 'error' && (
          <div className="rounded-none p-6 text-center border" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <AlertCircle size={28} className="mx-auto mb-3 text-red-400" />
            <h4 className="text-[15px] font-bold text-white mb-1">AI Synthesis Interrupted</h4>
            <p className="text-[12px] text-white/50 max-w-sm mx-auto mb-5 leading-relaxed">
              {errorMsg || 'Could not connect to AI services. You can still launch instant studio mode with channel-grounded blueprints.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={loadInstantStudio}
                className="flex items-center gap-1.5 px-4 py-2 rounded-none text-[12px] font-bold bg-white/10 text-white hover:bg-white/15 transition-all"
              >
                <Eye size={12} /> Use Instant Studio
              </button>
              <button
                onClick={() => setPhase('idle')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-none text-[12px] font-bold border border-white/10 text-white/60 hover:text-white transition-all"
              >
                <RefreshCw size={12} /> Try Again
              </button>
            </div>
          </div>
        )}

        {/* ── 4. DONE STATE: COMPLETE LAUNCH PACK ────────────── */}
        {phase === 'done' && pack && (
          <div className="space-y-3.5">
            {/* Navigation Tabs Bar - Tight & sleek */}
            <div
              className="flex items-center justify-between border-b pb-1.5 overflow-x-auto gap-2"
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-1">
                {[
                  { id: 'deck',   label: 'Pitch Deck (8 Slides)', icon: BarChart2, color: '#f59e0b' },
                  { id: 'mockup', label: 'Product & Visuals',     icon: Image,     color: '#a78bfa' },
                  { id: 'email',  label: 'Launch Email',          icon: Mail,      color: '#34d399' },
                  { id: 'social', label: 'Social Multi-Suite',    icon: Instagram, color: '#e1306c' },
                  { id: 'all',    label: 'All Assets View',       icon: LayoutGrid,color: '#38bdf8' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-none text-[10.5px] font-bold transition-all whitespace-nowrap"
                    style={{
                      background: activeTab === tab.id ? `rgba(${accent.rgb}, 0.18)` : 'transparent',
                      color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.45)',
                      border: activeTab === tab.id ? `1px solid rgba(${accent.rgb}, 0.35)` : '1px solid transparent'
                    }}
                  >
                    <tab.icon size={11} style={{ color: activeTab === tab.id ? accent.color : tab.color }} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="text-[9.5px] text-white/30 hidden lg:block font-mono">
                {handle} · {niche}
              </div>
            </div>

            {/* TAB 1: PITCH DECK PRESENTER */}
            {(activeTab === 'deck' || activeTab === 'all') && (
              <PitchDeckPresenter
                pack={pack}
                creatorData={creatorData}
                accent={accent}
                onRegen={() => regen('pitchDeck')}
                regenning={!!regenning.pitchDeck}
              />
            )}

            {/* TAB 2: PRODUCT MOCKUP & AI VISUAL */}
            {(activeTab === 'mockup' || activeTab === 'all') && (
              <SectionCard id="image" title="Channel-Native Product & Visual Studio" icon={Image} iconColor="#a78bfa" accent={accent}
                onRegen={() => regen('image')} regenning={!!regenning.image}>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-white">Interactive Platform Mockup</span>
                      <span className="text-[10px] font-mono text-white/40">Calibrated to {niche}</span>
                    </div>
                    {/* CSS Mockup tailored to channel */}
                    <ProductMockup creatorData={creatorData} accent={accent} />
                  </div>

                  {/* AI Generated 4K Commercial Hero Studio */}
                  <div className="pt-2 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-white/5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[12px] font-bold text-white tracking-wide">AI Visual Studio · Commercial Product Hero</span>
                        <span className="text-[9.5px] font-mono px-2 py-0.5 rounded-none font-bold"
                          style={{ background: 'rgba(200, 30, 60, 0.25)', border: '1px solid rgba(200, 30, 60, 0.5)', color: '#ffffff', borderRadius: '0px' }}>
                          ⚡ {imageEngine === 'flux' ? 'FLUX.1 Cloud AI' : imageEngine === 'openai' ? 'OpenAI DALL-E 3' : 'Gemini Imagen'}
                        </span>
                        <div className="flex items-center gap-1.5 px-2 py-0.5 text-[9.5px] font-mono font-bold"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', borderRadius: '0px' }}>
                          <span className="w-2 h-2 inline-block rounded-none" style={{ background: accent.color }} />
                          <span>Website Theme: {accent.color}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {imageUrl && (
                          <a
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10.5px] text-white/70 hover:text-white font-medium"
                          >
                            <ExternalLink size={11} /> Full resolution
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Interactive Prompt & AI Control Panel */}
                    <div className="p-3.5 border space-y-3"
                      style={{ background: '#0a0a0e', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '0px' }}>
                      
                      {/* Style Preset Selector */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-white/60 font-bold">1. Select Visual Style & Environment</span>
                          <span className="text-[9.5px] font-mono text-white/40">Calibrated to {creatorName}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5">
                          {IMAGE_STYLES.map(st => {
                            const active = selectedStyle === st.id
                            return (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => {
                                  setSelectedStyle(st.id)
                                  setCustomImagePrompt(buildChannelSpecificImagePrompt(creatorData, st.id, accent.color))
                                  setIsPromptDirty(false)
                                }}
                                className="px-2.5 py-1.5 text-left transition-all border cursor-pointer"
                                style={{
                                  background: active ? '#c81e3c' : 'rgba(255,255,255,0.03)',
                                  borderColor: active ? '#c81e3c' : 'rgba(255,255,255,0.08)',
                                  color: active ? '#ffffff' : 'rgba(255,255,255,0.7)',
                                  borderRadius: '0px'
                                }}
                                title={st.desc}
                              >
                                <div className="text-[11px] font-bold truncate" style={{ color: active ? '#ffffff' : 'inherit' }}>
                                  {st.label}
                                </div>
                                <div className="text-[9px] font-mono truncate opacity-60">
                                  {st.id}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Prompt Editor */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <label className="font-bold text-white flex items-center gap-1.5">
                            <Sparkles size={12} className="text-[#c81e3c]" />
                            <span>2. Creative AI Prompt (Direct User Control)</span>
                          </label>
                          <div className="flex items-center gap-2">
                            {isPromptDirty && (
                              <button
                                type="button"
                                onClick={() => {
                                  const defPrompt = buildChannelSpecificImagePrompt(creatorData, selectedStyle, accent.color)
                                  setCustomImagePrompt(defPrompt)
                                  setIsPromptDirty(false)
                                }}
                                className="text-[10px] text-white/50 hover:text-white underline cursor-pointer"
                              >
                                Reset to Channel Default
                              </button>
                            )}
                            <span className="text-[10px] font-mono text-white/40">{customImagePrompt.length} chars</span>
                          </div>
                        </div>
                        <textarea
                          value={customImagePrompt}
                          onChange={(e) => {
                            setCustomImagePrompt(e.target.value)
                            setIsPromptDirty(true)
                          }}
                          rows={3}
                          className="w-full text-[11.5px] text-white p-2.5 outline-none transition-all resize-y font-mono"
                          placeholder="Type what image you want the AI to generate..."
                          style={{
                            background: '#121218',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '0px',
                            lineHeight: '1.45'
                          }}
                        />
                      </div>

                      {/* Controls Bar: Engine Selector & Action Buttons */}
                      <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-white/5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-white/50 font-bold">Engine:</span>
                          <div className="flex items-center border" style={{ borderColor: 'rgba(255,255,255,0.12)', borderRadius: '0px' }}>
                            <button
                              type="button"
                              onClick={() => setImageEngine('flux')}
                              className={`px-2.5 py-1 text-[10.5px] font-bold transition-all cursor-pointer ${imageEngine === 'flux' ? 'text-white' : 'text-white/60 hover:text-white'}`}
                              style={{
                                background: imageEngine === 'flux' ? '#c81e3c' : 'rgba(255,255,255,0.04)',
                                borderRadius: '0px',
                                color: '#ffffff'
                              }}
                            >
                              ⚡ FLUX.1 (Free / Instant)
                            </button>
                            <button
                              type="button"
                              onClick={() => setImageEngine('openai')}
                              className={`px-2.5 py-1 text-[10.5px] font-bold transition-all cursor-pointer ${imageEngine === 'openai' ? 'text-white' : 'text-white/60 hover:text-white'}`}
                              style={{
                                background: imageEngine === 'openai' ? '#c81e3c' : 'rgba(255,255,255,0.04)',
                                borderRadius: '0px',
                                color: '#ffffff'
                              }}
                            >
                              OpenAI DALL-E 3
                            </button>
                            <button
                              type="button"
                              onClick={() => setImageEngine('gemini')}
                              className={`px-2.5 py-1 text-[10.5px] font-bold transition-all cursor-pointer ${imageEngine === 'gemini' ? 'text-white' : 'text-white/60 hover:text-white'}`}
                              style={{
                                background: imageEngine === 'gemini' ? '#c81e3c' : 'rgba(255,255,255,0.04)',
                                borderRadius: '0px',
                                color: '#ffffff'
                              }}
                            >
                              Gemini Imagen
                            </button>
                          </div>

                          {setApiModalOpen && (
                            <button
                              type="button"
                              onClick={() => setApiModalOpen(true)}
                              className="flex items-center gap-1 px-2 py-1 rounded-none text-[10.5px] font-medium text-white/70 hover:text-white transition-all cursor-pointer"
                              style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0px'
                              }}
                              title="Configure API Keys"
                            >
                              <Settings size={10} />
                              <span>API Keys</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleGenerateCustomImage(null, Math.floor(Math.random() * 899999) + 100000)}
                            disabled={regenning.image || stepStatus.image === 'active'}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-[11px] font-bold text-white transition-all cursor-pointer"
                            style={{
                              background: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: '0px',
                              color: '#ffffff'
                            }}
                            title="Generate another variation with a fresh seed"
                          >
                            <RefreshCw size={11} className={regenning.image ? "animate-spin text-white" : "text-white"} />
                            <span>Re-roll Variant</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleGenerateCustomImage()}
                            disabled={regenning.image || stepStatus.image === 'active'}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-none text-[11.5px] font-bold shadow-lg transition-all cursor-pointer"
                            style={{
                              background: '#c81e3c',
                              color: '#ffffff',
                              border: '1px solid rgba(255,255,255,0.25)',
                              borderRadius: '0px'
                            }}
                          >
                            <Sparkles size={12} className={regenning.image || stepStatus.image === 'active' ? "animate-spin text-white" : "text-white"} />
                            <span>{regenning.image || stepStatus.image === 'active' ? 'Synthesizing with AI...' : 'Generate Image with AI'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    {(regenning.image || stepStatus.image === 'active') && (
                      <div className="rounded-none flex items-center gap-3 px-4 py-5 border border-dashed"
                        style={{ background: 'rgba(200,30,60,0.08)', borderColor: 'rgba(200,30,60,0.3)', borderRadius: '0px' }}>
                        <div className="w-5 h-5 rounded-none border-2 border-t-transparent animate-spin"
                          style={{ borderColor: '#c81e3c', borderTopColor: 'transparent' }} />
                        <div>
                          <p className="text-[12px] text-white font-bold">
                            Synthesizing 4K commercial hero asset with {imageEngine.toUpperCase()} AI for {creatorName}...
                          </p>
                          <p className="text-[10.5px] text-white/60 mt-0.5">
                            Calibrated to website theme color {accent.color} (strictly no lime green) • Generating photorealistic high-res scene
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Image Preview Canvas */}
                    {imageUrl && (
                      <div className="space-y-2">
                        <div className="relative rounded-none overflow-hidden border group shadow-2xl" style={{ borderColor: 'rgba(255,255,255,0.12)', borderRadius: '0px' }}>
                          <img
                            src={imageUrl}
                            alt="AI product hero"
                            className="w-full max-h-[460px] object-cover"
                            style={{ borderRadius: '0px' }}
                          />
                          
                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className="px-2.5 py-0.5 text-[9.5px] font-mono font-bold tracking-wide uppercase shadow-lg"
                              style={{ background: '#c81e3c', color: '#ffffff', borderRadius: '0px' }}>
                              AI Generated • 4K Commercial Hero
                            </span>
                            <span className="px-2.5 py-0.5 text-[9.5px] font-mono font-bold shadow-lg"
                              style={{ background: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff', borderRadius: '0px' }}>
                              Theme: {accent.color}
                            </span>
                          </div>

                          {/* Hover Action Bar */}
                          <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between p-3.5"
                            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)', borderRadius: '0px' }}>
                            <span className="text-[11px] text-white font-medium">
                              Channel-grounded 4K asset for @{handle}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleGenerateCustomImage()}
                                disabled={regenning.image}
                                className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-none font-bold bg-[#c81e3c] text-white shadow-lg border border-white/20 cursor-pointer"
                                style={{ borderRadius: '0px', color: '#ffffff' }}
                              >
                                <Sparkles size={11} className={regenning.image ? "animate-spin text-white" : "text-white"} />
                                <span>{regenning.image ? 'Generating...' : 'Re-render AI'}</span>
                              </button>
                              <a
                                href={imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-none font-bold bg-white text-black shadow-lg hover:bg-white/90"
                                style={{ borderRadius: '0px' }}
                              >
                                <ExternalLink size={11} /> Open Full Size
                              </a>
                            </div>
                          </div>
                        </div>

                        {imageError && (
                          <div className="rounded-none p-3 border flex items-center justify-between flex-wrap gap-2"
                            style={{ background: 'rgba(200, 30, 60, 0.1)', borderColor: 'rgba(200, 30, 60, 0.3)', borderRadius: '0px' }}>
                            <div className="text-[11px] text-white/90">
                              <span className="font-bold text-white">Notice: </span>
                              {imageError.includes('Expired') || imageError.includes('401')
                                ? 'OpenAI API key expired in .env. Switched to FLUX.1 high-res generator to ensure your assets are always rendered with your brand colors.'
                                : imageError.slice(0, 160)}
                            </div>
                            {setApiModalOpen && (
                              <button
                                type="button"
                                onClick={() => setApiModalOpen(true)}
                                className="px-2.5 py-1 rounded-none text-[10.5px] font-bold text-white shadow-sm transition-all"
                                style={{ background: '#c81e3c', borderRadius: '0px', color: '#ffffff' }}
                              >
                                Update OpenAI Key
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {stepStatus.image === 'error' && !imageUrl && (
                      <div className="rounded-none p-3.5 border flex items-center justify-between flex-wrap gap-3"
                        style={{ background: 'rgba(200, 30, 60, 0.12)', borderColor: 'rgba(200, 30, 60, 0.35)', borderRadius: '0px' }}>
                        <div>
                          <p className="text-[11.5px] font-bold text-white">OpenAI DALL-E Image Note</p>
                          <p className="text-[10.5px] text-white/80 mt-0.5">
                            {imageError?.includes('Expired') || imageError?.includes('401')
                              ? 'Your configured OpenAI API key has expired. Update your key in Settings to generate live DALL-E 3 assets.'
                              : imageError?.slice(0, 160) || 'API key limit reached. Click below to connect an active OpenAI key.'}
                          </p>
                        </div>
                        {setApiModalOpen && (
                          <button
                            type="button"
                            onClick={() => setApiModalOpen(true)}
                            className="px-3.5 py-1.5 rounded-none text-[11px] font-bold text-white shadow-sm transition-all"
                            style={{ background: '#c81e3c', borderRadius: '0px', color: '#ffffff' }}
                          >
                            Update OpenAI Key
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>
            )}

            {/* TAB 3: LAUNCH EMAIL */}
            {(activeTab === 'email' || activeTab === 'all') && (
              <SectionCard id="email" title="VIP Founding Member Launch Email" icon={Mail} iconColor="#34d399" accent={accent}
                onRegen={() => regen('email')} regenning={!!regenning.email}>
                <div className="space-y-4">
                  <div className="rounded-none p-3 border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 mb-1">Subject Line</p>
                    <Editable value={emailSubj()} onChange={v => set('email.subject', v)} multiline={false}
                      className="text-[14px] font-bold text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/30 mb-2">Email Body (Click to edit)</p>
                    <Editable value={emailBody()} onChange={v => set('email.body', v)} multiline
                      className="text-[13px] min-h-[160px] p-3 rounded-none border"
                      style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.75', background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.05)' }} />
                  </div>
                  <div className="flex justify-end pt-1">
                    <CopyBtn text={`Subject: ${emailSubj()}\n\n${emailBody()}`} label="Copy Email" />
                  </div>
                </div>
              </SectionCard>
            )}

            {/* TAB 4: SOCIAL MULTI-SUITE */}
            {(activeTab === 'social' || activeTab === 'all') && (
              <div className="space-y-4">
                {/* Instagram */}
                <SectionCard id="instagram" title="Instagram Launch Caption & Tags" icon={Instagram} iconColor="#e1306c" accent={accent}
                  onRegen={() => regen('instagram')} regenning={!!regenning.instagram}>
                  <div className="space-y-3">
                    <Editable value={igCaption()} onChange={v => set('ig.caption', v)} multiline
                      className="text-[13px] min-h-[80px] p-3 rounded-none border"
                      style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.65', background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.05)' }} />
                    <Editable value={igTags()} onChange={v => set('ig.hashtags', v)} multiline={false}
                      className="text-[12px] font-mono text-pink-400" />
                    <div className="flex justify-end">
                      <CopyBtn text={`${igCaption()}\n\n${igTags()}`} label="Copy Caption" />
                    </div>
                  </div>
                </SectionCard>

                {/* X / Twitter Thread */}
                <SectionCard id="twitter" title="X / Twitter Viral Thread" icon={Twitter} iconColor="#60a5fa" accent={accent}
                  onRegen={() => regen('twitter')} regenning={!!regenning.twitter}>
                  <div className="space-y-3">
                    {(pack.twitter?.thread || []).map((_, i) => (
                      <div key={i} className="flex gap-3 items-start p-3 rounded-none border" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                        <span className="w-6 h-6 rounded-none flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400">
                          {i + 1}
                        </span>
                        <Editable value={tweet(i)} onChange={v => set(`tw.${i}`, v)} multiline
                          className="flex-1 text-[13px]"
                          style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }} />
                      </div>
                    ))}
                    <div className="flex justify-end">
                      <CopyBtn text={(pack.twitter?.thread || []).map((_, i) => tweet(i)).join('\n\n')} label="Copy Full Thread" />
                    </div>
                  </div>
                </SectionCard>

                {/* TikTok Hook & Script */}
                <SectionCard id="tiktok" title="TikTok Video Script & Hook" icon={Smartphone} iconColor="#69c9d0" accent={accent}
                  onRegen={() => regen('tiktok')} regenning={!!regenning.tiktok}>
                  <div className="space-y-3">
                    <div className="rounded-none p-3 border" style={{ background: 'rgba(105,201,208,0.06)', borderColor: 'rgba(105,201,208,0.2)' }}>
                      <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 mb-1">
                        First 3 Seconds Hook (Critical Retention)
                      </p>
                      <Editable value={tiktokHook()} onChange={v => set('tt.hook', v)} multiline={false}
                        className="text-[14px] font-bold text-white" />
                    </div>
                    <Editable value={tiktokScript()} onChange={v => set('tt.script', v)} multiline
                      className="text-[12px] min-h-[90px] p-3 rounded-none border"
                      style={{ color: 'rgba(255,255,255,0.75)', lineHeight: '1.7', background: 'rgba(0,0,0,0.2)', borderColor: 'rgba(255,255,255,0.05)' }} />
                    <div className="flex justify-end">
                      <CopyBtn text={`HOOK: ${tiktokHook()}\n\n${tiktokScript()}`} label="Copy TikTok Script" />
                    </div>
                  </div>
                </SectionCard>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
