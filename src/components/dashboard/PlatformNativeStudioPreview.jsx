import { useState, useMemo, useEffect } from 'react'
import {
  Instagram, Youtube, Twitter, Facebook, Mail, Radio,
  Heart, MessageCircle, Send, Bookmark, MoreHorizontal,
  ThumbsUp, ThumbsDown, Share2, Eye, Repeat, ExternalLink,
  Volume2, Music2, CheckCircle2, Copy, Check, Play, Globe,
  Search, Bell, Cast, Compass, Plus, Film, ShoppingBag,
  SlidersHorizontal, Home, User, ArrowLeft, Trash2, Archive,
  Reply, Sparkles
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

  // Synchronize when contentType from Studio changes
  useEffect(() => {
    if (!contentType?.platform) return
    const raw = contentType.platform.toLowerCase()
    if (raw.includes('tik')) setActivePlatform('tiktok')
    else if (raw.includes('you') || raw.includes('yt')) setActivePlatform('youtube')
    else if (raw.includes('face') || raw.includes('fb')) setActivePlatform('facebook')
    else if (raw.includes('twit') || raw.includes('x')) setActivePlatform('twitter')
    else if (raw.includes('email') || raw.includes('mail')) setActivePlatform('email')
    else if (raw.includes('insta') || raw.includes('ig')) setActivePlatform('instagram')
  }, [contentType])

  // Interactive engagement states
  const [igLiked, setIgLiked] = useState(false)
  const [igSaved, setIgSaved] = useState(false)
  const [ttLiked, setTtLiked] = useState(false)
  const [ttSaved, setTtSaved] = useState(false)
  const [ytLiked, setYtLiked] = useState(false)
  const [fbLiked, setFbLiked] = useState(false)
  const [twLiked, setTwLiked] = useState(false)
  const [twRetweeted, setTwRetweeted] = useState(false)

  const creatorName = creatorData?.name || creatorData?.handle?.replace(/^@+/, '') || 'Creator'
  const cleanHandle = (creatorData?.handle || 'creator').replace(/^@+/, '')
  const productName = creatorData?.blueprint?.name || creatorData?.productName || 'Creator Academy'
  const niche = creatorData?.niche || 'Digital Creation'
  const avatarUrl = creatorData?.avatar || creatorData?.avatarUrl || null

  const portalUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/member/${cleanHandle}`
    : `https://app.co-launch.app/member/${cleanHandle}`

  // Ensure content has real links, no bracket placeholders
  const cleanContent = useMemo(() => {
    if (!content) return ''
    return content
      .replace(/\[Link to your documentation\/GitHub\/blog post here\]/gi, portalUrl)
      .replace(/\[Link to Documentation\/GitHub\/Landing Page\]/gi, portalUrl)
      .replace(/\[Link to [^\]]+\]/gi, portalUrl)
      .replace(/\[(?:Link|your link|link to waitlist|link to product|link to github|link to documentation)[^\]]*\]/gi, portalUrl)
      .replace(/\[(?:https?:\/\/)?[^\]]*(?:link|url|github|documentation|blog|landing|waitlist)[^\]]*\]/gi, portalUrl)
  }, [content, portalUrl])

  // Fallback authentic copy for instant realistic phone view even before generation
  const fallbackCopy = useMemo(() => {
    if (activePlatform === 'tiktok') {
      return `3 critical mistakes you're making with ${niche} (and how to fix them today) 📱\n\n1. Overcomplicating setup\n2. Ignoring modern patterns\n3. Building in a vacuum\n\nWe packaged the exact blueprints inside ${productName}. Link in bio to join the founding cohort! #tech #creator #coding`
    }
    if (activePlatform === 'youtube') {
      return `🚨 We just officially opened access to ${productName}!\n\nIf you've been following our journey, you know how hard it has been to master ${niche}. Today, we're giving our community the complete production workspace, curated challenges, and direct feedback channels.\n\n👉 Access the founding cohort: ${portalUrl}\n\nDrop a comment with your biggest question below!`
    }
    if (activePlatform === 'facebook') {
      return `Excited to finally share what we've been building for the community: ${productName} is officially live!\n\nWhether you're looking to level up your workflow or connect with high-caliber creators in ${niche}, this is built specifically for you.\n\n👉 Join the founding member circle here: ${portalUrl}`
    }
    if (activePlatform === 'twitter') {
      return `Shipping ${productName} today 🚀\n\nA production-grade blueprint library and community for anyone building in ${niche}.\n\n• Zero fluff, pure signal\n• Production-ready templates\n• VIP founding access\n\nJoin the cohort: ${portalUrl}`
    }
    if (activePlatform === 'email') {
      return `Subject: Introducing ${productName} (Founding Access Open)\n\nHey there,\n\nFor the past few months, the #1 request from our community has been a unified system to master ${niche} without wasted hours.\n\nToday, I'm thrilled to officially unveil ${productName}.\n\nHere is what is waiting inside for you:\n• Complete production blueprints & frameworks\n• Direct access to our private member community\n• Bi-weekly live challenges and teardowns\n\n👉 Access the founding cohort here: ${portalUrl}\n\nI can't wait to see what you build!\n\nBest regards,\n${creatorName}`
    }
    return `Announcing ${productName} ✨\n\nThe ultimate blueprint library and private network built exclusively for our community in ${niche}.\n\nTap the link in bio to join our founding cohort before slots fill up!\n\n#${niche.replace(/[^a-zA-Z0-9]/g, '')} #creator #mastery`
  }, [activePlatform, niche, productName, portalUrl, creatorName])

  const displayContent = cleanContent || fallbackCopy

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
    return firstLine.slice(0, 75).replace(/["']/g, '').trim()
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
    { id: 'email', label: 'Email', icon: Mail, color: '#34d399' },
  ]

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      {/* Platform Switcher Bar */}
      <div className="w-full flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-white/[0.08]">
        <div className="flex items-center gap-1.5 flex-wrap">
          {platforms.map(p => {
            const Icon = p.icon
            const isActive = activePlatform === p.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePlatform(p.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.03)',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
                  border: isActive ? `1.5px solid ${p.color}` : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0px'
                }}
              >
                <Icon size={13} style={{ color: isActive ? p.color : 'inherit' }} />
                <span>{p.label}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyAction}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition cursor-pointer"
            style={{ borderRadius: '0px' }}
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy Copy'}</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          AUTHENTIC MOBILE SMARTPHONE DEVICE FRAME
      ────────────────────────────────────────────────────────────────────────── */}
      <div 
        className="relative mx-auto w-full max-w-[385px] bg-[#000000] border-[9px] border-[#181d28] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col"
        style={{ borderRadius: '48px', height: '740px' }}
      >
        {/* Hardware Reflection / Side Button Simulation */}
        <div className="absolute top-24 -left-[11px] w-[3px] h-8 bg-[#2d3548] rounded-l-xs pointer-events-none" />
        <div className="absolute top-36 -left-[11px] w-[3px] h-12 bg-[#2d3548] rounded-l-xs pointer-events-none" />
        <div className="absolute top-52 -left-[11px] w-[3px] h-12 bg-[#2d3548] rounded-l-xs pointer-events-none" />
        <div className="absolute top-32 -right-[11px] w-[3px] h-16 bg-[#2d3548] rounded-r-xs pointer-events-none" />

        {/* ── Top Status Bar with Dynamic Island ── */}
        <div className="pt-2 px-6 pb-1 flex items-center justify-between text-white shrink-0 select-none z-30 bg-black">
          <span className="text-[12px] font-semibold tracking-tight font-sans pl-1">9:41</span>
          
          {/* Dynamic Island Pill */}
          <div className="w-24 h-5 bg-black rounded-full flex items-center justify-between px-2.5 mx-auto border border-white/15 shadow-inner">
            <div className="w-2 h-2 rounded-full bg-[#0a1128] border border-white/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#06101e] ring-1 ring-white/10" />
          </div>

          {/* Icons: 5G & Battery */}
          <div className="flex items-center gap-1.5 text-[11px] pr-1">
            <span className="text-[10px] font-bold font-mono">5G</span>
            <div className="w-5 h-2.5 border border-white/80 rounded-xs p-0.5 flex items-center">
              <div className="w-full h-full bg-emerald-400" />
            </div>
          </div>
        </div>

        {/* ── Scrollable Native Social Media Screen Canvas ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col bg-black text-white custom-scrollbar select-text">

          {/* 1. INSTAGRAM NATIVE MOBILE APP */}
          {activePlatform === 'instagram' && (
            <div className="flex flex-col flex-1 bg-black">
              {/* Instagram Top Navigation */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#1c1c1c]">
                <span className="text-lg font-serif italic font-bold tracking-tight text-white">Instagram</span>
                <div className="flex items-center gap-4">
                  <div className="relative cursor-pointer">
                    <Heart size={20} className="text-white" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#ff3040] rounded-full" />
                  </div>
                  <Send size={19} className="text-white cursor-pointer -rotate-12" />
                </div>
              </div>

              {/* Instagram Feed Post Header */}
              <div className="flex items-center justify-between p-3 border-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-[#1a1a1a] flex items-center justify-center shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={creatorName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-bold text-white uppercase">{cleanHandle.slice(0, 2)}</span>
                    )}
                  </div>
                  <div className="leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white">{cleanHandle}</span>
                      <CheckCircle2 size={11} className="text-[#3897f0] fill-[#3897f0]" />
                    </div>
                    <span className="text-[9px] text-white/50">{niche} • Sponsored</span>
                  </div>
                </div>
                <MoreHorizontal size={16} className="text-white/60 cursor-pointer" />
              </div>

              {/* Instagram Post Image / Canvas (Edge-to-Edge Pure Clean, Zero Borders) */}
              <div className="relative aspect-square w-full bg-[#0a0d16] flex flex-col items-center justify-center p-6 border-0 outline-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#c81e3c]/20 via-black to-[#050811] pointer-events-none" />
                <div className="relative z-10 text-center max-w-xs space-y-2.5">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/10 text-white text-[9px] font-mono uppercase tracking-wider font-bold">
                    ● FOUNDING COHORT
                  </div>
                  <h3 className="text-base font-extrabold text-white tracking-tight leading-tight">
                    {productName}
                  </h3>
                  <p className="text-[11px] text-white/80 line-clamp-3 leading-relaxed">
                    {displayContent.split('\n\n')[0] || `Master ${niche} with high-signal execution blueprints and a private network.`}
                  </p>
                  <div className="pt-1.5">
                    <span className="inline-block px-3 py-1 bg-[#c81e3c] text-white text-[10px] font-bold uppercase tracking-wider shadow-md">
                      Explore Blueprint
                    </span>
                  </div>
                </div>
              </div>

              {/* Instagram Post Action Row */}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <Heart
                      size={22}
                      onClick={() => setIgLiked(!igLiked)}
                      className={`cursor-pointer transition ${igLiked ? 'text-[#ff3040] fill-[#ff3040]' : 'text-white hover:text-white/70'}`}
                    />
                    <MessageCircle size={22} className="text-white cursor-pointer hover:text-white/70" />
                    <Send size={20} className="text-white cursor-pointer hover:text-white/70" />
                  </div>
                  <Bookmark
                    size={22}
                    onClick={() => setIgSaved(!igSaved)}
                    className={`cursor-pointer transition ${igSaved ? 'text-white fill-white' : 'text-white hover:text-white/70'}`}
                  />
                </div>

                <p className="text-[11px] font-bold text-white">
                  {igLiked ? '2,941 likes' : '2,940 likes'}
                </p>

                {/* Caption */}
                <div className="text-xs leading-relaxed text-white/90">
                  <span className="font-bold mr-1.5 text-white">{cleanHandle}</span>
                  <span className="whitespace-pre-wrap">{displayContent}</span>
                </div>

                <p className="text-[10px] text-white/40 cursor-pointer pt-0.5">
                  View all 128 comments
                </p>
                <p className="text-[9px] font-mono text-white/30 uppercase">
                  2 HOURS AGO
                </p>
              </div>

              {/* Instagram Bottom App Bar */}
              <div className="mt-auto flex items-center justify-around py-3 border-t border-[#262626] bg-black shrink-0">
                <Home size={20} className="text-white" />
                <Search size={20} className="text-white/60" />
                <Film size={20} className="text-white/60" />
                <ShoppingBag size={20} className="text-white/60" />
                <div className="w-5 h-5 rounded-full border border-white/60 overflow-hidden">
                  {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : <div className="bg-white/20 w-full h-full" />}
                </div>
              </div>
            </div>
          )}

          {/* 2. TIKTOK NATIVE MOBILE APP */}
          {activePlatform === 'tiktok' && (
            <div className="flex flex-col flex-1 bg-black justify-between relative overflow-hidden">
              {/* TikTok Top Nav */}
              <div className="relative z-20 flex items-center justify-between px-4 pt-2 text-[11px] font-bold">
                <span className="text-[9px] uppercase tracking-wider font-mono text-white/60">LIVE</span>
                <div className="flex items-center gap-3">
                  <span className="text-white/60 text-xs">Following</span>
                  <span className="text-white text-xs font-bold border-b-2 border-white pb-0.5">For You</span>
                </div>
                <Search size={16} className="text-white/70" />
              </div>

              {/* Central Video & Hook Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/95 pointer-events-none" />
              <div className="relative z-10 px-5 text-center my-auto">
                <div className="inline-block px-2.5 py-1 bg-black/75 border border-white/30 text-[10px] font-mono font-bold text-amber-300 mb-3 shadow-lg">
                  🔥 VIRAL SHORT HOOK
                </div>
                <h2 className="text-base font-extrabold text-white leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] bg-black/50 p-3.5 border-l-3 border-[#ff0050]">
                  "{ttHook}"
                </h2>
              </div>

              {/* Bottom Info & Right Actions */}
              <div className="relative z-20 p-3.5 flex items-end justify-between gap-3">
                <div className="flex-1 space-y-2 min-w-0 pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white">@{cleanHandle}</span>
                    <span className="px-1.5 py-0.2 bg-[#ff0050] text-[9px] font-bold uppercase">Follow</span>
                  </div>
                  <p className="text-[11px] text-white/90 line-clamp-3 leading-snug drop-shadow-md">
                    {displayContent}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/80">
                    <Music2 size={11} className="animate-spin text-[#00f2fe]" style={{ animationDuration: '4s' }} />
                    <span className="truncate">♫ {creatorName} • Original Sound</span>
                  </div>
                </div>

                {/* Right Action Rail */}
                <div className="flex flex-col items-center gap-3 shrink-0 pb-1">
                  <div className="relative mb-1">
                    <div className="w-9 h-9 rounded-full bg-white/20 border border-white/40 flex items-center justify-center font-bold text-xs uppercase overflow-hidden">
                      {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : cleanHandle.slice(0, 2)}
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#ff0050] rounded-full flex items-center justify-center text-[10px] font-bold text-white">
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

              {/* TikTok Bottom Bar */}
              <div className="flex items-center justify-around py-2.5 border-t border-white/10 bg-black shrink-0 relative z-20">
                <span className="text-xs font-bold text-white">Home</span>
                <span className="text-xs font-medium text-white/60">Friends</span>
                <div className="w-9 h-6 bg-gradient-to-r from-[#00f2fe] to-[#ff0050] p-[2px] rounded-xs flex items-center justify-center">
                  <div className="w-full h-full bg-white text-black font-black flex items-center justify-center text-xs">
                    +
                  </div>
                </div>
                <span className="text-xs font-medium text-white/60">Inbox</span>
                <span className="text-xs font-medium text-white/60">Profile</span>
              </div>
            </div>
          )}

          {/* 3. YOUTUBE NATIVE MOBILE APP */}
          {activePlatform === 'youtube' && (
            <div className="flex flex-col flex-1 bg-[#0f0f0f]">
              {/* YouTube Mobile Header */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#272727]">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-4 bg-[#ff0000] rounded-xs flex items-center justify-center">
                    <Play size={10} fill="white" className="text-white ml-0.5" />
                  </div>
                  <span className="text-sm font-black tracking-tighter text-white">YouTube</span>
                </div>
                <div className="flex items-center gap-3.5 text-white/80">
                  <Cast size={16} />
                  <Bell size={16} />
                  <Search size={16} />
                  <div className="w-5 h-5 rounded-full bg-[#272727] flex items-center justify-center text-[9px] font-bold">
                    {cleanHandle.slice(0, 2)}
                  </div>
                </div>
              </div>

              {/* Video Player Card */}
              <div className="relative aspect-video w-full bg-[#181818] flex items-center justify-center">
                <div className="w-12 h-12 bg-red-600/90 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer">
                  <Play size={20} fill="white" className="ml-1" />
                </div>
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 text-[10px] font-mono font-bold text-white">
                  14:28
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-600" />
              </div>

              {/* Title & Metadata */}
              <div className="p-3 space-y-2 border-b border-[#272727]">
                <h3 className="text-xs font-extrabold text-white leading-snug">
                  {productName} — Official Launch Architecture Breakdown
                </h3>
                <p className="text-[10px] text-white/50 font-mono">
                  48K views • 2 hours ago • #mastery #{niche.replace(/[^a-zA-Z0-9]/g, '')}
                </p>

                {/* Channel Bar */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#272727] overflow-hidden flex items-center justify-center font-bold text-xs">
                      {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : cleanHandle.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-white">{creatorName}</span>
                        <CheckCircle2 size={10} className="text-slate-400" />
                      </div>
                      <span className="text-[9px] text-white/50">142K subscribers</span>
                    </div>
                  </div>

                  <button type="button" className="px-3 py-1 bg-white text-black font-bold text-[11px] rounded-full">
                    Subscribe
                  </button>
                </div>

                {/* Pill Actions (Thumbs, Share, Remix) */}
                <div className="flex items-center gap-2 overflow-x-auto pt-1 no-scrollbar text-white">
                  <div 
                    onClick={() => setYtLiked(!ytLiked)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-[#272727] rounded-full text-[11px] font-semibold cursor-pointer"
                  >
                    <ThumbsUp size={12} className={ytLiked ? 'fill-white' : ''} />
                    <span>{ytLiked ? '1.9K' : '1.8K'}</span>
                    <span className="text-white/30">|</span>
                    <ThumbsDown size={12} />
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#272727] rounded-full text-[11px] font-semibold">
                    <Share2 size={12} />
                    <span>Share</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-[#272727] rounded-full text-[11px] font-semibold">
                    <Repeat size={12} />
                    <span>Remix</span>
                  </div>
                </div>
              </div>

              {/* YouTube Community Post / Description Box */}
              <div className="p-3 bg-[#181818] m-2.5 rounded-none text-xs text-white/90 whitespace-pre-wrap leading-relaxed">
                <span className="text-[10px] font-mono uppercase text-white/40 block mb-1">Community Post &amp; Video Description</span>
                {displayContent}
              </div>

              {/* YouTube Bottom Bar */}
              <div className="mt-auto flex items-center justify-around py-2.5 border-t border-[#272727] bg-[#0f0f0f] shrink-0 text-white/70">
                <span className="text-[10px] flex flex-col items-center gap-0.5 text-white"><Home size={16} /> Home</span>
                <span className="text-[10px] flex flex-col items-center gap-0.5"><Film size={16} /> Shorts</span>
                <div className="w-6 h-6 rounded-full border border-white flex items-center justify-center text-white text-sm">+</div>
                <span className="text-[10px] flex flex-col items-center gap-0.5"><Bell size={16} /> Subs</span>
                <span className="text-[10px] flex flex-col items-center gap-0.5"><User size={16} /> You</span>
              </div>
            </div>
          )}

          {/* 4. FACEBOOK NATIVE MOBILE APP */}
          {activePlatform === 'facebook' && (
            <div className="flex flex-col flex-1 bg-[#18191a]">
              {/* Facebook Mobile Top Header */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#3a3b3c]">
                <span className="text-xl font-black text-[#2d88ff] tracking-tight">facebook</span>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#3a3b3c] flex items-center justify-center cursor-pointer">
                    <Search size={14} className="text-white" />
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#3a3b3c] flex items-center justify-center cursor-pointer relative">
                    <MessageCircle size={14} className="text-white" />
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] font-bold flex items-center justify-center text-white">3</span>
                  </div>
                </div>
              </div>

              {/* Post Author Bar */}
              <div className="p-3 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#3a3b3c] flex items-center justify-center overflow-hidden font-bold text-xs uppercase">
                    {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : cleanHandle.slice(0, 2)}
                  </div>
                  <div className="leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white">{creatorName}</span>
                      <CheckCircle2 size={11} className="text-[#2d88ff] fill-[#2d88ff]" />
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-white/50">
                      <span>3h</span>
                      <span>•</span>
                      <Globe size={10} />
                    </div>
                  </div>
                </div>
                <MoreHorizontal size={16} className="text-white/60 cursor-pointer" />
              </div>

              {/* Post Text */}
              <div className="px-3.5 pb-3 text-xs leading-relaxed text-white/95 whitespace-pre-wrap">
                {displayContent}
              </div>

              {/* Rich Link Preview Card */}
              <div className="border-y border-[#3a3b3c] bg-[#242526] overflow-hidden">
                <div className="aspect-video w-full bg-gradient-to-br from-[#c81e3c]/20 via-[#18191a] to-black flex items-center justify-center p-4">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-mono text-[#ff8093] uppercase font-bold">● VIP MEMBER PORTAL</span>
                    <h4 className="text-sm font-bold text-white">{productName}</h4>
                  </div>
                </div>
                <div className="p-2.5 bg-[#242526]">
                  <span className="text-[10px] font-mono uppercase text-white/40 block truncate">co-launch.app</span>
                  <p className="text-xs font-bold text-white truncate">{productName} — Official Community Workspace</p>
                </div>
              </div>

              {/* Reaction Counter */}
              <div className="px-3.5 py-2 flex items-center justify-between text-[11px] text-white/60 border-b border-[#3a3b3c]">
                <div className="flex items-center gap-1">
                  <span className="text-xs">👍❤️😮</span>
                  <span>{fbLiked ? '249' : '248'}</span>
                </div>
                <div>42 Comments • 18 Shares</div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-around py-2 text-xs font-semibold text-white/80">
                <button 
                  type="button" 
                  onClick={() => setFbLiked(!fbLiked)} 
                  className={`flex items-center gap-1.5 cursor-pointer ${fbLiked ? 'text-[#2d88ff]' : ''}`}
                >
                  <ThumbsUp size={14} className={fbLiked ? 'fill-[#2d88ff]' : ''} />
                  <span>Like</span>
                </button>
                <button type="button" className="flex items-center gap-1.5 cursor-pointer">
                  <MessageCircle size={14} />
                  <span>Comment</span>
                </button>
                <button type="button" className="flex items-center gap-1.5 cursor-pointer">
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
              </div>

              {/* Facebook Bottom Nav */}
              <div className="mt-auto flex items-center justify-around py-2.5 border-t border-[#3a3b3c] bg-[#18191a] shrink-0 text-white/60">
                <Home size={18} className="text-[#2d88ff]" />
                <Film size={18} />
                <ShoppingBag size={18} />
                <Bell size={18} />
                <div className="w-5 h-5 rounded-full bg-white/20" />
              </div>
            </div>
          )}

          {/* 5. X / TWITTER NATIVE MOBILE APP */}
          {activePlatform === 'twitter' && (
            <div className="flex flex-col flex-1 bg-black">
              {/* X Mobile Header */}
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#2f3336]">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                  {cleanHandle.slice(0, 2)}
                </div>
                <span className="text-base font-black text-white">𝕏</span>
                <SlidersHorizontal size={15} className="text-white/60" />
              </div>

              {/* Tabs: For You | Following */}
              <div className="flex items-center border-b border-[#2f3336] text-xs font-bold text-center">
                <div className="flex-1 py-2.5 text-white border-b-2 border-[#1d9bf0]">
                  For you
                </div>
                <div className="flex-1 py-2.5 text-white/50">
                  Following
                </div>
              </div>

              {/* Tweet Card */}
              <div className="p-3.5 space-y-2 border-b border-[#2f3336]">
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#16181c] border border-white/20 flex items-center justify-center font-bold text-xs uppercase shrink-0 overflow-hidden">
                    {avatarUrl ? <img src={avatarUrl} alt="" className="w-full h-full object-cover" /> : cleanHandle.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 truncate">
                        <span className="text-xs font-bold text-white truncate">{creatorName}</span>
                        <CheckCircle2 size={12} className="text-[#1d9bf0] fill-[#1d9bf0] shrink-0" />
                        <span className="text-[11px] text-white/50 truncate">@{cleanHandle} • 2h</span>
                      </div>
                      <MoreHorizontal size={14} className="text-white/40 cursor-pointer shrink-0" />
                    </div>

                    {/* Tweet Text */}
                    <div className="text-xs leading-relaxed text-white/95 whitespace-pre-wrap mt-1">
                      {displayContent}
                    </div>

                    {/* Stats & Timestamp */}
                    <div className="text-[10px] text-white/40 font-mono pt-2 border-t border-[#2f3336]/60 mt-2">
                      2:45 PM • Nov 5, 2026 • <strong className="text-white">14.8K</strong> Views
                    </div>

                    {/* Action Row */}
                    <div className="flex items-center justify-between pt-2.5 text-white/60 text-xs">
                      <div className="flex items-center gap-1 cursor-pointer hover:text-[#1d9bf0]">
                        <MessageCircle size={14} />
                        <span className="text-[10px]">28</span>
                      </div>

                      <div 
                        onClick={() => setTwRetweeted(!twRetweeted)} 
                        className={`flex items-center gap-1 cursor-pointer hover:text-emerald-400 ${twRetweeted ? 'text-emerald-400' : ''}`}
                      >
                        <Repeat size={14} />
                        <span className="text-[10px]">{twRetweeted ? '65' : '64'}</span>
                      </div>

                      <div 
                        onClick={() => setTwLiked(!twLiked)} 
                        className={`flex items-center gap-1 cursor-pointer hover:text-rose-500 ${twLiked ? 'text-rose-500 fill-rose-500' : ''}`}
                      >
                        <Heart size={14} className={twLiked ? 'fill-rose-500' : ''} />
                        <span className="text-[10px]">{twLiked ? '413' : '412'}</span>
                      </div>

                      <div className="flex items-center gap-1 cursor-pointer hover:text-[#1d9bf0]">
                        <Bookmark size={14} />
                        <span className="text-[10px]">88</span>
                      </div>

                      <div className="flex items-center cursor-pointer hover:text-[#1d9bf0]">
                        <Share2 size={14} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* X Bottom Bar */}
              <div className="mt-auto flex items-center justify-around py-3 border-t border-[#2f3336] bg-black shrink-0 text-white/70">
                <Home size={18} className="text-white" />
                <Search size={18} />
                <span className="text-xs font-bold text-white">/</span>
                <Bell size={18} />
                <Mail size={18} />
              </div>
            </div>
          )}

          {/* 6. EMAIL CLIENT NATIVE MOBILE APP */}
          {activePlatform === 'email' && (
            <div className="flex flex-col flex-1 bg-[#121214] text-white">
              {/* Mail App Top Bar */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/10 text-white/80">
                <div className="flex items-center gap-1 text-xs text-[#38bdf8] font-semibold cursor-pointer">
                  <ArrowLeft size={14} />
                  <span>Inbox (14)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Archive size={15} />
                  <Trash2 size={15} />
                  <Reply size={15} />
                </div>
              </div>

              {/* Email Content Header */}
              <div className="p-3.5 border-b border-white/10 space-y-2">
                <h3 className="text-sm font-extrabold text-white leading-snug">
                  {emailSubject}
                </h3>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#c81e3c] flex items-center justify-center font-black text-xs text-white">
                      {cleanHandle.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="leading-tight">
                      <div className="text-xs font-bold text-white">{creatorName}</div>
                      <div className="text-[10px] text-white/50 font-mono">vip@{cleanHandle}.co-launch.app</div>
                    </div>
                  </div>

                  <span className="text-[10px] text-white/40 font-mono">9:41 AM</span>
                </div>
              </div>

              {/* Email Body */}
              <div className="p-4 space-y-3.5 text-xs text-slate-200 leading-relaxed overflow-y-auto">
                <div className="p-2.5 bg-white/[0.04] border border-white/10 text-[11px] font-mono text-[#34d399] flex items-center gap-2">
                  <Sparkles size={12} className="shrink-0" />
                  <span>Official Member Broadcast: Founding Cohort Open</span>
                </div>

                <div className="whitespace-pre-wrap leading-relaxed text-[12px] text-slate-100">
                  {emailBody}
                </div>

                {/* Big Email CTA Button */}
                <div className="pt-3 text-center">
                  <a
                    href={portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg"
                    style={{ background: '#c81e3c', color: '#ffffff', borderRadius: '0px' }}
                  >
                    👉 Access {productName} Now
                  </a>
                  <p className="text-[9px] font-mono text-white/40 mt-1.5">
                    Direct access via {cleanHandle}.co-launch.app
                  </p>
                </div>

                {/* Footer Sign-off & Unsubscribe */}
                <div className="pt-4 border-t border-white/10 text-[10px] text-white/40 space-y-1">
                  <p>You received this email as an insider of {creatorName}’s community.</p>
                  <p className="underline cursor-pointer">Manage email preferences • Unsubscribe</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── iOS Bottom Home Indicator Bar ── */}
        <div className="pt-1.5 pb-2.5 shrink-0 bg-black z-30 flex flex-col items-center select-none">
          <div className="w-32 h-1 bg-white/40 rounded-full" />
        </div>
      </div>
    </div>
  )
}
