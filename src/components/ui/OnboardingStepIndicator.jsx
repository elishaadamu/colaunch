import React, { useState, useRef, useEffect } from 'react'
import { useForge, getAccent } from '../../App'
import { MoreHorizontal, Check, ExternalLink, ArrowRight } from 'lucide-react'

export const ONBOARDING_STEPS = [
  { index: 1, step: 'welcome', label: 'Welcome', path: '/portal' },
  { index: 2, step: 'creator-link', label: 'Channel Link', path: '/portal' },
  { index: 3, step: 'analyzing', label: 'Audience Intelligence', path: '/analyzing' },
  { index: 4, step: 'blueprint', label: 'Product Blueprint', path: '/blueprint' },
  { index: 5, step: 'preview', label: 'Demand Landing Page', path: '/preview' },
  { index: 6, step: 'building', label: 'Architecture Build', path: '/building' },
  { index: 7, step: 'pre-finish', label: 'Launch Package', path: '/pre-finish' },
  { index: 8, step: 'celebration', label: 'Ready to Launch', path: '/celebration' },
]

/**
 * OnboardingStepIndicator
 * Interactive 8-step indicator for top navigation headers.
 * Matches authentic CoLaunch indicator styling:
 * - Square blocks (6px x 6px) for inactive steps
 * - Elongated rectangle (22px x 6px) for active step
 * - Clickable to move to any step when scraped creator record is present in localStorage/session
 * - Includes optional options menu (...) for direct step jumps
 */
export default function OnboardingStepIndicator({
  currentStep,
  showOptions = true,
  showCounter = false,
  className = '',
}) {
  const { goTo, creatorData } = useForge()
  const accent = getAccent(creatorData)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Verify if a scraped record exists in localStorage or context memory before dashboard migration
  const hasScrapedRecord = Boolean(
    creatorData?.handle ||
    creatorData?.name ||
    creatorData?.url ||
    creatorData?.channelId ||
    creatorData?.blueprint ||
    (typeof localStorage !== 'undefined' && (() => {
      try {
        const raw = localStorage.getItem('forge_creator_data')
        if (!raw) return false
        const parsed = JSON.parse(raw)
        return Boolean(
          parsed && (
            parsed.handle ||
            parsed.name ||
            parsed.url ||
            parsed.channelId ||
            parsed.blueprint ||
            parsed.recommendations
          )
        )
      } catch {
        return false
      }
    })())
  )

  const activeIndex = typeof currentStep === 'number'
    ? currentStep
    : (ONBOARDING_STEPS.find(s => s.step === currentStep)?.index || 4)

  const handleStepClick = (item) => {
    // If no scraped record yet, steps 3-8 are locked until channel scraping
    if (!hasScrapedRecord && item.index > 2) {
      return
    }
    setMenuOpen(false)
    goTo(item.step)
  }

  // Close dropdown menu on outside click or escape
  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  return (
    <div className={`relative flex items-center gap-2 select-none ${className}`}>
      {/* Optional numeric counter */}
      {showCounter && (
        <span className="text-[11px] font-semibold text-neutral-400 tracking-wider uppercase font-mono mr-1">
          <span className="text-neutral-200">0{activeIndex}</span> / 08
        </span>
      )}

      {/* 8 Step Indicator Bars */}
      <div className="flex items-center gap-1.5" role="tablist" aria-label="Onboarding Progress">
        {ONBOARDING_STEPS.map((item) => {
          const isActive = item.index === activeIndex
          const isPast = item.index < activeIndex
          const isClickable = hasScrapedRecord || item.index <= 2

          return (
            <button
              key={item.index}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Step ${item.index}: ${item.label}`}
              onClick={() => handleStepClick(item)}
              disabled={!isClickable}
              title={
                isClickable
                  ? `Go to Step ${item.index}: ${item.label} (${item.path})`
                  : 'Connect your channel in Step 2 to unlock this step'
              }
              className={`group relative p-1 -m-1 flex items-center justify-center border-0 bg-transparent transition-transform duration-150 ${
                isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-30'
              }`}
            >
              <span
                className="block transition-all duration-300 rounded-[1px]"
                style={{
                  width: isActive ? '22px' : '6px',
                  height: '6px',
                  background: isActive
                    ? (accent.color || '#c81e3c')
                    : isPast
                      ? 'rgba(255,255,255,0.65)'
                      : 'rgba(255,255,255,0.16)',
                  boxShadow: isActive ? `0 0 8px ${accent.color || '#c81e3c'}80` : 'none',
                }}
              />
            </button>
          )
        })}
      </div>

      {/* Options (...) Button & Dropdown Menu */}
      {showOptions && (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Onboarding steps menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer flex items-center justify-center"
            title="Jump to any onboarding step"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-64 bg-[#0d1017] border border-[#23293a] rounded-none shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150"
              style={{ minWidth: '240px' }}
            >
              <div className="px-3 py-1.5 border-b border-white/5 flex items-center justify-between text-[10px] uppercase font-mono tracking-wider text-slate-400">
                <span>Jump to Step</span>
                <span className={hasScrapedRecord ? 'text-emerald-400' : 'text-amber-400'}>
                  {hasScrapedRecord ? 'Channel Active' : 'Channel Needed'}
                </span>
              </div>

              <div className="py-1">
                {ONBOARDING_STEPS.map((item) => {
                  const isActive = item.index === activeIndex
                  const isPast = item.index < activeIndex
                  const isClickable = hasScrapedRecord || item.index <= 2

                  return (
                    <button
                      key={item.index}
                      type="button"
                      disabled={!isClickable}
                      onClick={() => handleStepClick(item)}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                        isActive
                          ? 'bg-white/10 font-bold text-white'
                          : isClickable
                            ? 'text-slate-300 hover:bg-white/5 hover:text-white cursor-pointer'
                            : 'text-slate-600 cursor-not-allowed opacity-40'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className="w-1.5 h-1.5 rounded-[1px] shrink-0"
                          style={{
                            background: isActive
                              ? (accent.color || '#c81e3c')
                              : isPast
                                ? 'rgba(255,255,255,0.65)'
                                : 'rgba(255,255,255,0.2)',
                          }}
                        />
                        <span className="font-mono text-[10px] text-slate-500">0{item.index}</span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 ml-2 shrink-0">
                        {item.path}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
