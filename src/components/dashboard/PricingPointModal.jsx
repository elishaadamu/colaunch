import { useState, useEffect } from 'react'
import {
  X, Check, ShieldCheck, Zap, Sparkles, Rocket, ArrowRight,
  DollarSign, CheckCircle2, ChevronRight, HelpCircle, Lock,
  Layers, Users, Laptop, BarChart2, Award, HeartHandshake
} from 'lucide-react'

export default function PricingPointModal({
  isOpen,
  onClose,
  creatorData,
  creatorBrandColor = '#10B981',
  onSelectTrack,
  onOpenDiyPayment
}) {
  const [selectedTrack, setSelectedTrack] = useState('50_50') // '50_50' | 'diy_pass'
  const [openFaq, setOpenFaq] = useState(null)
  const [isActivating, setIsActivating] = useState(false)
  const [activatedSuccess, setActivatedSuccess] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setActivatedSuccess(false)
      setIsActivating(false)
      return
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleActivate5050 = async () => {
    setIsActivating(true)
    try {
      // Persist partnership choice in localStorage
      const h = (creatorData?.handle || 'creator').replace(/^@/, '').toLowerCase()
      localStorage.setItem(`forge_${h}_commercial_track`, '50_50')
      localStorage.setItem(`forge_${h}_partnership_active`, 'true')
      
      // Dispatch sync event so portal & CRM reflect partnered state
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('forge_track_selected', {
          detail: { track: '50_50', creator: creatorData }
        }))
      }

      await new Promise(r => setTimeout(r, 650))
      setActivatedSuccess(true)
      if (onSelectTrack) onSelectTrack('50_50')
    } catch (e) {
      console.warn('[PricingPointModal] Activation error:', e)
    } finally {
      setIsActivating(false)
    }
  }

  const handleChooseDiy = () => {
    onClose()
    if (onOpenDiyPayment) {
      onOpenDiyPayment()
    }
  }

  const productName = creatorData?.productName || 'Your Software Platform'
  const creatorName = creatorData?.name || creatorData?.handle || 'Creator'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Dark blur backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div 
        className="relative w-full max-w-4xl rounded-3xl border shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden my-auto text-left animate-in fade-in zoom-in-95 duration-200"
        style={{
          background: '#0c101a',
          borderColor: 'rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Ambient Top Glow in Creator Brand Color */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[550px] h-48 rounded-full blur-[100px] pointer-events-none opacity-40"
          style={{ background: creatorBrandColor }}
        />

        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 sm:px-8 sm:pt-8 flex items-start justify-between border-b border-white/5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase"
              style={{
                background: `rgba(255, 255, 255, 0.05)`,
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                color: creatorBrandColor
              }}
            >
              <Sparkles size={12} style={{ color: creatorBrandColor }} />
              Launch & Monetization Point
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Your Product is Ready. Choose Your Co-Launch Track.
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Forge analyzed your audience, built your modules for <span className="text-white font-medium">{productName}</span>, and loaded your 7-day launch marketing kit. Select the commercial model that fits your goals:
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Pricing Cards Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          {activatedSuccess ? (
            <div className="text-center py-10 px-4 space-y-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-bold text-white">
                50/50 Co-Launch Partnership Activated!
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                CoLaunch engineering is now linked to your channel. We handle 100% of the code, servers, and automated daily marketing. You split profits 50/50 as members subscribe.
              </p>
              <button
                onClick={onClose}
                className="forge-btn-primary px-8 py-3 text-sm font-semibold rounded-full"
                style={{ background: creatorBrandColor }}
              >
                Return to Dashboard & Launch
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              
              {/* Option 1: 50/50 Co-Launch Track (Recommended) */}
              <div 
                className={`relative rounded-2xl p-6 transition-all border flex flex-col justify-between ${
                  selectedTrack === '50_50' 
                    ? 'shadow-2xl ring-2' 
                    : 'hover:border-white/20'
                }`}
                style={{
                  background: selectedTrack === '50_50' ? '#121726' : '#0e121d',
                  borderColor: selectedTrack === '50_50' ? creatorBrandColor : 'rgba(255,255,255,0.08)',
                  ringColor: creatorBrandColor
                }}
              >
                {/* Popular Pill */}
                <div 
                  className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest shadow-md flex items-center gap-1.5"
                  style={{
                    background: creatorBrandColor,
                    color: '#ffffff',
                  }}
                >
                  <Award size={11} /> Recommended • $0 Upfront
                </div>

                <div className="space-y-4 pt-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        Studio 50/50 Partnership
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        We build, host & manage. You promote.
                      </p>
                    </div>
                    <div 
                      className="w-8 h-8 rounded-xl flex items-center justify-center border"
                      style={{
                        background: `${creatorBrandColor}18`,
                        color: creatorBrandColor,
                        borderColor: `${creatorBrandColor}35`
                      }}
                    >
                      <HeartHandshake size={18} />
                    </div>
                  </div>

                  {/* Pricing Display */}
                  <div className="py-2.5 px-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-white tracking-tight">$0</span>
                      <span className="text-xs text-slate-400 font-semibold uppercase">Upfront cost</span>
                    </div>
                    <div className="text-xs text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                      <Check size={12} strokeWidth={3} /> Equal 50/50 Profit Split only when you earn
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 text-xs text-slate-300">
                    {[
                      '100% of engineering, hosting, servers & updates covered by CoLaunch',
                      '24/7 technical monitoring, security, bug fixes & feature enhancements',
                      'Daily automated marketing engine, copy generator & launch calendar',
                      'Dedicated Venture Partner to maximize audience conversion',
                      'Zero financial risk — we only make money when your app generates revenue',
                    ].map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-6">
                  <button
                    onClick={handleActivate5050}
                    disabled={isActivating}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: creatorBrandColor }}
                  >
                    {isActivating ? 'Activating Partnership...' : 'Claim 50/50 Partnership Track ($0 Upfront)'}
                    <ArrowRight size={15} />
                  </button>
                  <p className="text-[11px] text-center text-slate-500 mt-2">
                    Instant activation • No credit card required today
                  </p>
                </div>
              </div>

              {/* Option 2: Co-Builder DIY License ($50 One-Time) */}
              <div 
                className={`relative rounded-2xl p-6 transition-all border flex flex-col justify-between ${
                  selectedTrack === 'diy_pass' 
                    ? 'shadow-2xl ring-2' 
                    : 'hover:border-white/20'
                }`}
                style={{
                  background: selectedTrack === 'diy_pass' ? '#121726' : '#0e121d',
                  borderColor: selectedTrack === 'diy_pass' ? '#38bdf8' : 'rgba(255,255,255,0.08)',
                  ringColor: '#38bdf8'
                }}
              >
                {/* 100% Revenue Pill */}
                <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-sky-500/20 text-sky-300 border border-sky-400/30 flex items-center gap-1.5">
                  <DollarSign size={11} /> 100% Revenue Retention
                </div>

                <div className="space-y-4 pt-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        Co-Builder DIY License
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Keep 100% of revenue. Self-host & control.
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                      <Lock size={18} />
                    </div>
                  </div>

                  {/* Pricing Display */}
                  <div className="py-2.5 px-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-white tracking-tight">$50</span>
                      <span className="text-xs text-slate-400 font-semibold uppercase">USD • One-time fee</span>
                    </div>
                    <div className="text-xs text-sky-400 font-medium mt-0.5 flex items-center gap-1">
                      <Check size={12} strokeWidth={3} /> You keep 100% of all future subscriber revenue
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 text-xs text-slate-300">
                    {[
                      'Full source code repository access & exportable code package',
                      'CoLaunch ProjectOS console, marketing kit & content generator included',
                      'Self-hosted on your own AWS/Vercel and Stripe accounts',
                      'Automated deployment scripts & setup documentation',
                      'You manage your own server infrastructure and updates',
                    ].map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check size={14} className="text-sky-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-6">
                  <button
                    onClick={handleChooseDiy}
                    className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-slate-900 bg-white hover:bg-slate-100 shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Unlock Co-Builder Pass ($50 USD)
                    <ArrowRight size={15} />
                  </button>
                  <p className="text-[11px] text-center text-slate-500 mt-2">
                    One-time payment • Immediate code & console access
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* Micro FAQ Accordion */}
          <div className="pt-2 border-t border-white/5 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Frequently Asked Questions
            </p>
            {[
              {
                q: 'Can I switch from 50/50 Partnership to DIY Pass later?',
                a: 'Yes! Creators who start on the 50/50 Track can transition to a buyout or self-hosted DIY setup at any time with full access to their user data and code.'
              },
              {
                q: 'How fast will my product be live?',
                a: 'Under the 50/50 Track, CoLaunch deploys the production infrastructure, Stripe checkout, and marketing kit within 14 days of final module sign-off.'
              },
              {
                q: 'How do payouts work on the 50/50 Track?',
                a: 'Subscriber payments are processed directly through Stripe Connect and automatically split 50/50 into your linked bank account every month.'
              }
            ].map((faq, idx) => (
              <div 
                key={idx}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-semibold text-slate-200"
                >
                  <span>{faq.q}</span>
                  <ChevronRight 
                    size={13} 
                    className={`transition-transform duration-200 text-slate-400 ${openFaq === idx ? 'rotate-90' : ''}`}
                  />
                </button>
                {openFaq === idx && (
                  <p className="text-slate-400 mt-2 pt-2 border-t border-white/5 leading-relaxed">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Bottom Security / Trust Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-500 border-t border-white/5">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-400" /> Bank-Grade Stripe Encryption
              </span>
              <span className="flex items-center gap-1">
                <Rocket size={14} style={{ color: creatorBrandColor }} /> 14-Day Deployment Guarantee
              </span>
            </div>
            <span>© {new Date().getFullYear()} CoLaunch Studio Inc.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
