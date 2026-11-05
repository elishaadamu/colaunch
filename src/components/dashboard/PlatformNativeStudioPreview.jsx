import { useState, useMemo } from 'react'
import {
  Instagram, Youtube, Twitter, Facebook, Mail, Radio,
  Heart, MessageCircle, Send, Bookmark, MoreHorizontal,
  ThumbsUp, ThumbsDown, Share2, Eye, Repeat, ExternalLink,
  Volume2, Music2, CheckCircle2, Copy, Check, Play, Globe
} from 'lucide-react'

export default function PlatformNativeStudioPreview({
  content,
  contentType,
  creatorData,
  onCopy
}) {
  const [copied, setCopied] = useState(false)
  const [activePlatform, setActivePlatform] = useState(() => {
    const raw = (contentType?.platform || '').toLowerCase()
    if (raw.includes('tik')) return 'tiktok'
    if (raw.includes('you') || raw.includes('yt')) return 'youtube'
    if (raw.includes('face') || raw.includes('fb')) return 'facebook'
    if (raw.includes('twit') || raw.includes('x')) return 'twitter'
    if (raw.includes('email') || raw.includes('mail')) return 'email'
    return 'instagram'
  })

  const [igLiked, setIgLiked] = useState(false)
  const [igSaved, setIgSaved] = useState(false)
  const [ttLiked, setTtLiked] = useState(false)
  const [ttSaved, setTtSaved] = useState(false)
  const [ytLiked, setYtLiked] = useState(false)
  const [fbLiked, setFbLiked] = useState(false)
  const [twLiked, setTwLiked] = useState(false)

  const creatorName = creatorData?.name || creatorData?.handle?.replace(/^@+/, '') || 'Creator'
  const cleanHandle = (creatorData?.handle || 'creator').replace(/^@+/, '')
  const productName = creatorData?.blueprint?.name || creatorData?.productName || 'Creator Academy'
  const niche = creatorData?.niche || 'Digital Creation'
  const avatarUrl = creatorData?.avatar || creatorData?.avatarUrl || null

  const portalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/member/${cleanHandle}`
    : `https://app.co-launch.app/member/${cleanHandle}`

  // Ensure content has no bracket placeholders
  const displayContent = useMemo(() => {
    if (!content) return ''
    return content
      .replace(/\[Link to your documentation\/GitHub\/blog post here\]/gi, portalUrl)
      .replace(/\[Link to Documentation\/GitHub\/Landing Page\]/gi, portalUrl)
      .replace(/\[Link to [^\]]+\]/gi, portalUrl)
      .replace(/\[(?:Link|your link|link to waitlist|link to product|link to github|link to documentation)[^\]]*\]/gi, portalUrl)
      .replace(/\[(?:https?:\/\/)?[^\]]*(?:link|url|github|documentation|blog|landing|waitlist)[^\]]*\]/gi, portalUrl)
  }, [content, portalUrl])

  // Extract Subject and Body for email
  const { emailSubject, emailBody } = useMemo(() => {
    if (!displayContent) return { emailSubject: `Introducing ${productName} 🚀`, emailBody: '' }
    const lines = displayContent.split('\n')
    const subjLine = lines.find(l => l.toLowerCase().startsWith('subject:'))
    if (subjLine) {
      const subject = subjLine.replace(/subject:\s*/i, '').trim()
      const body = lines.filter(l => !l.toLowerCase().startsWith('subject:')).join('\n').trim()
      return { emailSubject: subject, emailBody: body }
    }
    return {
      emailSubject: `Introducing ${productName} (Founding Cohort Open)`,
      emailBody: displayContent
    }
  }, [displayContent, productName])

  // Extract Hook for TikTok
  const ttHook = useMemo(() => {
    if (!displayContent) return `Master ${niche} with ${productName}`
    const match = displayContent.match(/HOOK[^\n:]*:\s*([^\n]+)/i)
    if (match && match[1]) return match[1].replace(/["']/g, '').trim()
    const firstLine = displayContent.split('\n')[0] || ''
    return firstLine.slice(0, 70).replace(/["']/g, '').trim()
  }, [displayContent, niche, productName])

  const handleCopyAction = () => {
    if (onCopy) {
      onCopy(displayContent)
    } else {
      navigator.clipboard.writeText(displayContent)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const platforms = [
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: '#e1306c' },
    { id: 'tiktok', label: 'TikTok', icon: Radio, color: '#ff0050' },
    { id: 'youtube', label: 'YouTube', icon: Youtube, color: '#ff0000' },
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877f2' },
    { id: 'twitter', label: 'X / Twitter', icon: Twitter, color: '#1d9bf0' },
    { id: 'email', label: 'Email Client', icon: Mail, color: '#34d399' },
  ]

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Top Platform Switcher Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-white/[0.08]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 mr-1">
            Native Template:
          </span>
          {platforms.map(p => {
            const Icon = p.icon
            const isActive = activePlatform === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePlatform(p.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
                  border: isActive ? `1px solid ${p.color}` : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0px'
                }}
              >
                <Icon size={12} style={{ color: isActive ? p.color : 'inherit' }} />
                <span>{p.label}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyAction}
            className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition cursor-pointer"
            style={{ borderRadius: '0px' }}
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          1. INSTAGRAM ORIGINAL DESIGN
      ────────────────────────────────────────────────────────────────────────── */}
      {activePlatform === 'instagram' && (
        <div className="max-w-md mx-auto w-full bg-black border border-[#262626] text-white overflow-hidden shadow-2xl" style={{ borderRadius: '0px' }}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-[#262626]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={creatorName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-bold text-white uppercase">{cleanHandle.slice(0, 2)}</span>
                  )}
                </div>
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white">{cleanHandle}</span>
                  <CheckCircle2 size={11} className="text-[#3897f0] fill-[#3897f0]" />
                </div>
                <span className="text-[10px] text-white/50">{niche} · Sponsored</span>
              </div>
            </div>
            <MoreHorizontal size={16} className="text-white/60 cursor-pointer" />
          </div>

          {/* Media Frame (Post Canvas) */}
          <div className="relative aspect-square w-full bg-[#0a0a0f] flex flex-col items-center justify-center p-6 border-b border-[#262626] overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#c81e3c]/20 via-transparent to-black pointer-events-none" />
            <div className="relative z-10 text-center max-w-xs space-y-3">
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-[#c81e3c]/40 bg-[#c81e3c]/15 text-[#ff8093] text-[9px] font-mono uppercase tracking-wider font-bold">
                ● VIP LAUNCH COHORT
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight leading-tight">
                {productName}
              </h3>
              <p className="text-xs text-white/70 line-clamp-3 leading-relaxed">
                {displayContent.split('\n\n')[0] || `Master ${niche} with high-signal execution blueprints and a private network.`}
              </p>
              <div className="pt-2">
                <span className="inline-block px-3 py-1.5 bg-[#c81e3c] text-white text-[11px] font-bold uppercase tracking-wider shadow-lg">
                  Explore Blueprint
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart
                  size={20}
                  onClick={() => setIgLiked(!igLiked)}
                  className={`cursor-pointer transition ${igLiked ? 'text-[#ff3040] fill-[#ff3040]' : 'text-white hover:text-white/70'}`}
                />
                <MessageCircle size={20} className="text-white cursor-pointer hover:text-white/70" />
                <Send size={19} className="text-white cursor-pointer hover:text-white/70" />
              </div>
              <Bookmark
                size={20}
                onClick={() => setIgSaved(!igSaved)}
                className={`cursor-pointer transition ${igSaved ? 'text-white fill-white' : 'text-white hover:text-white/70'}`}
              />
            </div>

            <p className="text-[11px] font-bold text-white">
              {igLiked ? '2,941 likes' : '2,940 likes'}
            </p>

            {/* Caption */}
            <div className="text-xs leading-relaxed text-white/90">
              <span className="font-bold mr-1 text-white">{cleanHandle}</span>
              <span className="whitespace-pre-wrap">{displayContent}</span>
            </div>

            <p className="text-[10px] text-white/40 cursor-pointer pt-1">
              View all 128 comments
            </p>
            <p className="text-[9px] font-mono text-white/30 uppercase">
              2 HOURS AGO
            </p>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          2. TIKTOK ORIGINAL DESIGN
      ────────────────────────────────────────────────────────────────────────── */}
      {activePlatform === 'tiktok' && (
        <div className="max-w-xs mx-auto w-full aspect-[9/16] bg-[#000000] border-2 border-white/20 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between" style={{ borderRadius: '0px' }}>
          {/* Top Status Bar */}
          <div className="relative z-20 flex items-center justify-between px-4 pt-3 text-[11px] font-bold">
            <span className="text-[9px] uppercase tracking-wider font-mono text-white/60">LIVE</span>
            <div className="flex items-center gap-3">
              <span className="text-white/60 text-xs">Following</span>
              <span className="text-white text-xs font-bold border-b-2 border-white pb-0.5">For You</span>
            </div>
            <Eye size={14} className="text-white/70" />
          </div>

          {/* Central Video & Hook Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />
          <div className="relative z-10 px-6 text-center my-auto">
            <div className="inline-block px-2.5 py-1 bg-black/70 border border-white/30 text-[10px] font-mono font-bold text-amber-300 mb-3 shadow-lg">
              🔥 CRITICAL 3S HOOK
            </div>
            <h2 className="text-base font-extrabold text-white leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] bg-black/40 p-3 border-l-2 border-[#ff0050]">
              "{ttHook}"
            </h2>
          </div>

          {/* Bottom Left Info & Right Floating Actions */}
          <div className="relative z-20 p-4 flex items-end justify-between gap-3">
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-white">@{cleanHandle}</span>
                <span className="px-1.5 py-0.2 bg-[#ff0050] text-[9px] font-bold uppercase">Follow</span>
              </div>
              <p className="text-[11px] text-white/90 line-clamp-3 leading-snug drop-shadow-md">
                {displayContent}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/80">
                <Music2 size={11} className="animate-spin text-[#00f2fe]" style={{ animationDuration: '4s' }} />
                <span className="truncate">♫ {creatorName} · Original Sound - Trending</span>
              </div>
            </div>

            {/* Right Action Column */}
            <div className="flex flex-col items-center gap-3 shrink-0 pb-1">
              <div className="relative mb-1">
                <div className="w-9 h-9 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-bold text-xs uppercase">
                  {cleanHandle.slice(0, 2)}
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#ff0050] rounded-full flex items-center justify-center text-[10px] font-bold">
                  +
                </div>
              </div>

              <div className="flex flex-col items-center cursor-pointer" onClick={() => setTtLiked(!ttLiked)}>
                <Heart size={22} className={ttLiked ? 'text-[#ff0050] fill-[#ff0050]' : 'text-white'} />
                <span className="text-[9px] font-bold mt-0.5">{ttLiked ? '48.3K' : '48.2K'}</span>
              </div>

              <div className="flex flex-col items-center cursor-pointer">
                <MessageCircle size={22} className="text-white" />
                <span className="text-[9px] font-bold mt-0.5">1,294</span>
              </div>

              <div className="flex flex-col items-center cursor-pointer" onClick={() => setTtSaved(!ttSaved)}>
                <Bookmark size={22} className={ttSaved ? 'text-amber-400 fill-amber-400' : 'text-white'} />
                <span className="text-[9px] font-bold mt-0.5">5,810</span>
              </div>

              <div className="flex flex-col items-center cursor-pointer">
                <Share2 size={20} className="text-white" />
                <span className="text-[9px] font-bold mt-0.5">842</span>
              </div>

              <div className="w-8 h-8 rounded-full bg-black/80 border-2 border-white/60 flex items-center justify-center animate-spin" style={{ animationDuration: '6s' }}>
                <div className="w-3 h-3 rounded-full bg-[#ff0050]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          3. YOUTUBE ORIGINAL DESIGN (COMMUNITY POST & VIDEO CARD)
      ────────────────────────────────────────────────────────────────────────── */}
      {activePlatform === 'youtube' && (
        <div className="max-w-xl mx-auto w-full bg-[#0f0f0f] border border-[#272727] text-white p-4 space-y-3.5 shadow-2xl" style={{ borderRadius: '0px' }}>
          {/* Channel Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#272727] flex items-center justify-center font-bold text-sm uppercase text-white/90">
                {avatarUrl ? <img src={avatarUrl} alt={creatorName} className="w-full h-full rounded-full object-cover" /> : cleanHandle.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{creatorName}</span>
                  <CheckCircle2 size={12} className="text-slate-400" />
                </div>
                <div className="text-[10px] text-white/40 font-mono">
                  4 hours ago · Public
                </div>
              </div>
            </div>
            <MoreHorizontal size={16} className="text-white/40 cursor-pointer" />
          </div>

          {/* Post Text */}
          <div className="text-[13px] leading-relaxed text-white/90 whitespace-pre-wrap pl-13">
            {displayContent}
          </div>

          {/* Video / Blueprint Media Preview */}
          <div className="ml-13 border border-[#272727] bg-[#181818] overflow-hidden" style={{ borderRadius: '0px' }}>
            <div className="relative aspect-video w-full bg-[#121212] flex items-center justify-center group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="w-12 h-12 bg-red-600/90 rounded-none flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition">
                <Play size={18} fill="white" className="ml-0.5" />
              </div>
              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-[10px] font-mono font-bold text-white">
                14:28
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600" />
            </div>
            <div className="p-3">
              <p className="text-xs font-bold text-white leading-snug">{productName} — VIP Launch Architecture</p>
              <p className="text-[11px] text-white/50 mt-1">{creatorName} · 48K views · Streamed 4 hours ago</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="ml-13 flex items-center gap-6 pt-2 text-white/70 text-xs">
            <button
              type="button"
              onClick={() => setYtLiked(!ytLiked)}
              className={`flex items-center gap-1.5 hover:text-white transition cursor-pointer ${ytLiked ? 'text-white font-bold' : ''}`}
            >
              <ThumbsUp size={14} className={ytLiked ? 'fill-white' : ''} />
              <span>{ytLiked ? '1.9K' : '1.8K'}</span>
            </button>
            <button type="button" className="hover:text-white transition cursor-pointer">
              <ThumbsDown size={14} />
            </button>
            <button type="button" className="flex items-center gap-1.5 hover:text-white transition cursor-pointer">
              <Share2 size={14} />
              <span>Share</span>
            </button>
            <button type="button" className="flex items-center gap-1.5 hover:text-white transition cursor-pointer">
              <MessageCircle size={14} />
              <span>245</span>
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          4. FACEBOOK ORIGINAL DESIGN
      ────────────────────────────────────────────────────────────────────────── */}
      {activePlatform === 'facebook' && (
        <div className="max-w-xl mx-auto w-full bg-[#242526] border border-[#3a3b3c] text-[#e4e6eb] p-4 space-y-3 shadow-2xl" style={{ borderRadius: '0px' }}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#3a3b3c] flex items-center justify-center font-bold text-sm text-white uppercase overflow-hidden">
                {avatarUrl ? <img src={avatarUrl} alt={creatorName} className="w-full h-full object-cover" /> : cleanHandle.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white hover:underline cursor-pointer">{creatorName}</span>
                  <CheckCircle2 size={12} className="text-[#1877f2] fill-[#1877f2]" />
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#b0b3b8]">
                  <span>Sponsored · Just now</span>
                  <span>·</span>
                  <Globe size={11} />
                </div>
              </div>
            </div>
            <MoreHorizontal size={16} className="text-[#b0b3b8] cursor-pointer" />
          </div>

          {/* Body Text */}
          <div className="text-[13px] leading-relaxed whitespace-pre-wrap">
            {displayContent}
          </div>

          {/* Facebook Link Preview Card */}
          <div className="border border-[#3a3b3c] bg-[#18191a] overflow-hidden" style={{ borderRadius: '0px' }}>
            <div className="aspect-[1.91/1] w-full bg-[#1e2022] flex flex-col items-center justify-center p-6 text-center relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#c81e3c]/20 via-transparent to-black/60 pointer-events-none" />
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-[#c81e3c] mb-1">
                CO-LAUNCH VIP PORTAL
              </span>
              <h4 className="text-base font-bold text-white relative z-10">{productName}</h4>
              <p className="text-xs text-white/60 relative z-10 mt-1 max-w-sm">
                Official founding cohort portal &amp; battle-tested implementation blueprints.
              </p>
            </div>
            <div className="p-3 flex items-center justify-between gap-3 bg-[#242526]">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-[#b0b3b8] uppercase truncate block">APP.CO-LAUNCH.APP</span>
                <p className="text-xs font-bold text-white truncate">{productName} — VIP Member Platform</p>
                <p className="text-[11px] text-[#b0b3b8] truncate">Join the founding cohort and build smarter today.</p>
              </div>
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-[#3a3b3c] hover:bg-[#4e4f50] text-xs font-bold text-white shrink-0 transition"
                style={{ borderRadius: '0px' }}
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Reaction Counts Bar */}
          <div className="flex items-center justify-between text-[11px] text-[#b0b3b8] py-1 border-b border-[#3a3b3c]">
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-full bg-[#1877f2] flex items-center justify-center text-[9px] text-white">👍</span>
              <span className="w-4 h-4 rounded-full bg-[#fa3e3e] flex items-center justify-center text-[9px] text-white">❤️</span>
              <span className="ml-1">{fbLiked ? '893' : '892'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>142 Comments</span>
              <span>58 Shares</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-3 gap-1 pt-1 text-[#b0b3b8] text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFbLiked(!fbLiked)}
              className={`flex items-center justify-center gap-2 py-1.5 hover:bg-[#3a3b3c] transition cursor-pointer ${fbLiked ? 'text-[#1877f2]' : ''}`}
            >
              <ThumbsUp size={15} />
              <span>Like</span>
            </button>
            <button type="button" className="flex items-center justify-center gap-2 py-1.5 hover:bg-[#3a3b3c] transition cursor-pointer">
              <MessageCircle size={15} />
              <span>Comment</span>
            </button>
            <button type="button" className="flex items-center justify-center gap-2 py-1.5 hover:bg-[#3a3b3c] transition cursor-pointer">
              <Share2 size={15} />
              <span>Share</span>
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          5. X / TWITTER ORIGINAL DESIGN
      ────────────────────────────────────────────────────────────────────────── */}
      {activePlatform === 'twitter' && (
        <div className="max-w-xl mx-auto w-full bg-black border border-[#2f3336] text-[#e7e9ea] p-4 space-y-3 shadow-2xl" style={{ borderRadius: '0px' }}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#202327] flex items-center justify-center font-bold text-sm uppercase text-white">
                {avatarUrl ? <img src={avatarUrl} alt={creatorName} className="w-full h-full rounded-full object-cover" /> : cleanHandle.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white hover:underline cursor-pointer">{creatorName}</span>
                  <CheckCircle2 size={12} className="text-[#1d9bf0] fill-[#1d9bf0]" />
                  <span className="text-xs text-[#71767b]">@{cleanHandle} · 2h</span>
                </div>
                <span className="text-[10px] text-[#71767b]">Verified Creator OS</span>
              </div>
            </div>
            <Twitter size={15} className="text-white/60" />
          </div>

          <div className="text-[13px] leading-relaxed whitespace-pre-wrap pl-12.5 text-white/90">
            {displayContent}
          </div>

          <div className="ml-12.5 border border-[#2f3336] overflow-hidden bg-[#16181c]" style={{ borderRadius: '0px' }}>
            <div className="p-3">
              <span className="text-[10px] font-mono text-[#71767b] uppercase">app.co-launch.app</span>
              <p className="text-xs font-bold text-white truncate">{productName} | Founding Cohort Portal</p>
              <p className="text-[11px] text-[#71767b] mt-0.5 line-clamp-2">
                Join the exclusive founding cohort and access production implementation templates.
              </p>
            </div>
          </div>

          <div className="ml-12.5 flex items-center justify-between text-[#71767b] text-xs pt-2">
            <button type="button" className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition cursor-pointer">
              <MessageCircle size={14} />
              <span>128</span>
            </button>
            <button type="button" className="flex items-center gap-1.5 hover:text-[#00ba7c] transition cursor-pointer">
              <Repeat size={14} />
              <span>342</span>
            </button>
            <button
              type="button"
              onClick={() => setTwLiked(!twLiked)}
              className={`flex items-center gap-1.5 hover:text-[#f91880] transition cursor-pointer ${twLiked ? 'text-[#f91880]' : ''}`}
            >
              <Heart size={14} className={twLiked ? 'fill-[#f91880]' : ''} />
              <span>{twLiked ? '2.8K' : '2.7K'}</span>
            </button>
            <button type="button" className="flex items-center gap-1.5 hover:text-[#1d9bf0] transition cursor-pointer">
              <Eye size={14} />
              <span>94.2K</span>
            </button>
            <div className="flex items-center gap-3">
              <Bookmark size={14} className="hover:text-white cursor-pointer" />
              <Share2 size={14} className="hover:text-white cursor-pointer" />
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          6. EMAIL CLIENT ORIGINAL DESIGN
      ────────────────────────────────────────────────────────────────────────── */}
      {activePlatform === 'email' && (
        <div className="max-w-2xl mx-auto w-full bg-[#18181c] border border-white/10 text-white shadow-2xl overflow-hidden" style={{ borderRadius: '0px' }}>
          {/* macOS / Luxury Email Window Bar */}
          <div className="bg-[#121216] px-4 py-2.5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
              <span className="text-[10px] font-mono text-white/40 ml-2">Inbox — {productName} Broadcast</span>
            </div>
            <div className="flex items-center gap-2 text-white/50 text-[10px]">
              <span className="font-mono">Encrypted 256-bit</span>
            </div>
          </div>

          {/* Email Headers */}
          <div className="p-4 border-b border-white/[0.08] bg-[#141418] space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-bold text-white">{emailSubject}</h3>
              <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/30 bg-emerald-950/40 px-2 py-0.5">
                VIP Broadcast Ready
              </span>
            </div>
            <div className="text-xs text-white/60 space-y-0.5 font-mono">
              <div>
                <strong className="text-white">From:</strong> {creatorName} &lt;broadcast@co-launch.app&gt;
              </div>
              <div>
                <strong className="text-white">To:</strong> Verified VIP Community &lt;member@network.com&gt;
              </div>
            </div>
          </div>

          {/* Email Content Body */}
          <div className="p-6 bg-[#0e0e12] space-y-4">
            <div className="text-[13px] leading-relaxed text-white/85 whitespace-pre-wrap font-sans">
              {emailBody || displayContent}
            </div>

            {/* Direct Member Portal CTA Button */}
            <div className="p-4 border border-[#c81e3c]/40 bg-[#c81e3c]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 my-4" style={{ borderRadius: '0px' }}>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">
                  👉 Explore {productName}
                </p>
                <p className="text-[11px] text-white/60 mt-0.5">
                  Direct destination: <span className="font-mono text-white/90">{portalUrl}</span>
                </p>
              </div>
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#c81e3c] text-white font-bold text-xs uppercase tracking-wider hover:brightness-110 flex items-center justify-center gap-1.5 shrink-0 shadow-lg"
                style={{ borderRadius: '0px', color: '#ffffff' }}
              >
                <span>Launch Member Portal</span>
                <ExternalLink size={12} className="text-white" />
              </a>
            </div>

            {/* Email Footer */}
            <div className="pt-4 border-t border-white/[0.06] text-[10px] text-white/40 space-y-1">
              <p>© 2026 {productName} · Operated by {creatorName}</p>
              <p>You received this because you are an enrolled member of the {creatorName} community.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

