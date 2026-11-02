import { useState, useEffect, useCallback } from 'react'
import { useForge } from '../../App'
import {
  Youtube,
  Instagram,
  Twitter,
  Check,
  Plus,
  ExternalLink,
  AlertCircle,
  Clock,
  Radio,
  ChevronRight,
  Edit3,
  X,
  Sliders,
  RefreshCw,
  Trash2,
  Send,
  Sparkles,
  ShieldCheck,
  UserCheck
} from 'lucide-react'
import {
  getStoredYouTubeConnection,
  startYouTubeOAuth,
  exchangeYouTubeAuthCode,
  disconnectYouTubeChannel
} from '../../services/youtubeApi'

const STATUS_STYLES = {
  scheduled: { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', label: 'Scheduled' },
  draft: { bg: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', label: 'Draft' },
  posted: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', label: 'Posted' },
  failed: { bg: 'rgba(200,30,60,0.15)', color: '#f87171', label: 'Failed' },
}

const BRAND_RED = '#c81e3c'

export default function Accounts() {
  const { creatorData, updateCreator, setActiveTab, setPreloadStudioType, triggerToast } = useForge()

  // Real YouTube Connection from OAuth 2.0
  const [youtubeConn, setYoutubeConn] = useState(() => getStoredYouTubeConnection())
  const [isYouTubeConnecting, setIsYouTubeConnecting] = useState(false)
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false)

  // Instagram Manual / Custom Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [manualBusinessId, setManualBusinessId] = useState('')
  const [manualAccessToken, setManualAccessToken] = useState('')
  const [modalTab, setModalTab] = useState('oauth')

  // Expanded card settings
  const [expandedId, setExpandedId] = useState(null)
  const [connectingPlatform, setConnectingPlatform] = useState(null)

  // Other platform states (Instagram, X, TikTok, Email)
  const [otherAccounts, setOtherAccounts] = useState(() => {
    try {
      const stored = localStorage.getItem('forge_accounts_platforms')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (_) {}
    return {
      instagram: { connected: false, handle: '', autoPost: false, approveBeforePost: true },
      twitter: { connected: false, handle: '', autoPost: false, approveBeforePost: true },
      tiktok: { connected: false, handle: '', autoPost: false, approveBeforePost: true },
      email: { connected: false, handle: '', autoPost: false, approveBeforePost: true },
    }
  })

  // Synchronize YouTube connection from storage and window events
  const refreshYouTubeConnection = useCallback(() => {
    const conn = getStoredYouTubeConnection()
    setYoutubeConn(conn)
  }, [])

  useEffect(() => {
    refreshYouTubeConnection()

    const handleConnected = (e) => setYoutubeConn(e.detail)
    const handleDisconnected = () => setYoutubeConn(null)

    window.addEventListener('forge_youtube_connected', handleConnected)
    window.addEventListener('forge_youtube_disconnected', handleDisconnected)
    return () => {
      window.removeEventListener('forge_youtube_connected', handleConnected)
      window.removeEventListener('forge_youtube_disconnected', handleDisconnected)
    }
  }, [refreshYouTubeConnection])

  // Handle incoming OAuth callback query parameter (?code=...) on the accounts page
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      setIsYouTubeConnecting(true)
      if (triggerToast) triggerToast('Exchanging Google OAuth code with YouTube Data API...', 'info')

      exchangeYouTubeAuthCode(code)
        .then(channel => {
          setYoutubeConn({ connected: true, channel })
          if (triggerToast) {
            triggerToast(`Connected to YouTube: ${channel.title || '@creator'}!`, 'success')
          }
          // Clean the URL query params without reloading
          const cleanUrl = window.location.pathname
          window.history.replaceState({}, document.title, cleanUrl)
        })
        .catch(err => {
          console.error('[YouTube OAuth Error]', err)
          if (triggerToast) {
            triggerToast(`YouTube Connection Error: ${err.message}`, 'error')
          }
        })
        .finally(() => {
          setIsYouTubeConnecting(false)
        })
    }

    if (params.get('ig_connected') === 'true') {
      setOtherAccounts(prev => ({
        ...prev,
        instagram: { ...prev.instagram, connected: true, handle: '@instagram_creator' }
      }))
      if (triggerToast) triggerToast('Instagram connected successfully!', 'success')
      const cleanUrl = window.location.pathname
      window.history.replaceState({}, document.title, cleanUrl)
    }
  }, [triggerToast])

  // Save other account configurations locally
  useEffect(() => {
    try {
      localStorage.setItem('forge_accounts_platforms', JSON.stringify(otherAccounts))
    } catch (_) {}
  }, [otherAccounts])

  // Connect YouTube using Real Google OAuth 2.0
  const handleConnectYouTube = () => {
    setIsYouTubeConnecting(true)
    const returnPath = `/dashboard/${creatorData?.id || ''}`
    startYouTubeOAuth(returnPath, 'accounts')
  }

  // Disconnect YouTube
  const handleDisconnectYouTube = async () => {
    await disconnectYouTubeChannel()
    setYoutubeConn(null)
    setYoutubeModalOpen(false)
    if (triggerToast) triggerToast('YouTube channel disconnected.', 'info')
  }

  // Connect other platforms
  const handleConnectOther = (id) => {
    if (id === 'instagram') {
      setManualBusinessId(creatorData?.instagram_business_id || '')
      setManualAccessToken(creatorData?.instagram_access_token || '')
      setModalTab(creatorData?.instagram_access_token ? 'manual' : 'oauth')
      setIsManualModalOpen(true)
      return
    }

    setConnectingPlatform(id)
    setTimeout(() => {
      setOtherAccounts(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          connected: true,
          handle: id === 'twitter' ? '@creator_x' : id === 'tiktok' ? '@creator_tiktok' : creatorData?.email || 'list@colaunch.io'
        }
      }))
      setConnectingPlatform(null)
      if (triggerToast) triggerToast(`${id.toUpperCase()} connected successfully!`, 'success')
    }, 1000)
  }

  const handleDisconnectOther = (id) => {
    setOtherAccounts(prev => ({
      ...prev,
      [id]: { ...prev[id], connected: false, handle: '' }
    }))
    if (id === 'instagram') {
      updateCreator({ instagram_access_token: null, instagram_business_id: null })
    }
    if (triggerToast) triggerToast(`${id.toUpperCase()} disconnected.`, 'info')
  }

  const toggleAutoPostOther = (id) => {
    setOtherAccounts(prev => ({
      ...prev,
      [id]: { ...prev[id], autoPost: !prev[id]?.autoPost }
    }))
  }

  const toggleApproveOther = (id) => {
    setOtherAccounts(prev => ({
      ...prev,
      [id]: { ...prev[id], approveBeforePost: !prev[id]?.approveBeforePost }
    }))
  }

  // Count active channels
  const isYouTubeActive = !!youtubeConn?.connected
  const activeCount = (isYouTubeActive ? 1 : 0) +
    (otherAccounts.instagram?.connected ? 1 : 0) +
    (otherAccounts.twitter?.connected ? 1 : 0) +
    (otherAccounts.tiktok?.connected ? 1 : 0) +
    (otherAccounts.email?.connected ? 1 : 0)

  return (
    <div className="p-4 sm:p-8 max-w-4xl space-y-6 text-slate-200">
      
      {/* ── HEADER ── */}
      <div className="border-b border-[#1b2234] pb-5">
        <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
          ACCOUNTS &amp; INTEGRATIONS
        </p>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Connected Social Accounts
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          Manage your live social broadcasting channels. Any account you configure here is automatically recognized across your <strong className="text-slate-200">Content Calendar</strong>, <strong className="text-slate-200">Marketing Pipeline</strong>, and <strong className="text-slate-200">Studio</strong>.
        </p>
      </div>

      {/* ── CONNECTION STATUS SUMMARY BANNER ── */}
      <div
        className="p-4 border flex items-center justify-between flex-wrap gap-3"
        style={{
          borderRadius: '0px',
          background: activeCount > 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
          borderColor: activeCount > 0 ? 'rgba(16, 185, 129, 0.25)' : '#202738'
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 flex items-center justify-center font-bold text-xs"
            style={{
              borderRadius: '0px',
              background: activeCount > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: activeCount > 0 ? '#34d399' : '#94a3b8'
            }}
          >
            {activeCount > 0 ? <Check size={18} /> : <AlertCircle size={18} />}
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <span>{activeCount} of 5 Channels Connected</span>
              {isYouTubeActive && (
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  YOUTUBE LIVE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeCount > 0
                ? 'Your publishing engine is active. Posts scheduled in your Content Calendar will broadcast to connected channels.'
                : 'Connect at least one channel below to enable direct live publishing and scheduling.'}
            </p>
          </div>
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('content-calendar')}
            className="px-3.5 py-1.5 text-xs font-bold text-white transition hover:opacity-95 cursor-pointer border-0 flex items-center gap-1.5"
            style={{ background: BRAND_RED, color: '#ffffff', borderRadius: '0px' }}
          >
            <span>Open Content Calendar</span>
            <ChevronRight size={13} />
          </button>
        )}
      </div>

      {/* ── SECTION: PRIMARY CHANNELS ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">
            Broadcasting Channels
          </p>
          <span className="text-xs text-slate-500 font-mono">Direct API &amp; OAuth 2.0</span>
        </div>

        <div className="space-y-3">
          
          {/* ══════════════════════════════════════════════════════════════
              CARD 1: YOUTUBE (OAUTH 2.0 REAL CONNECTION)
             ══════════════════════════════════════════════════════════════ */}
          <div
            className="p-4 border transition-all"
            style={{
              borderRadius: '0px',
              background: isYouTubeActive ? '#0c111c' : '#0c0f17',
              borderColor: isYouTubeActive ? 'rgba(239, 68, 68, 0.4)' : '#1e2436'
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                {/* Avatar / Icon */}
                <div
                  className="w-12 h-12 flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                  style={{
                    borderRadius: '0px',
                    background: isYouTubeActive ? '#c81e3c' : 'rgba(255,255,255,0.05)',
                    color: '#ffffff'
                  }}
                >
                  {youtubeConn?.channel?.thumbnail ? (
                    <img
                      src={youtubeConn.channel.thumbnail}
                      alt={youtubeConn.channel.title || 'YouTube Avatar'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Youtube size={24} className="text-white" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-base font-bold text-white">YouTube</span>
                    {isYouTubeActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
                        CONNECTED (OAUTH 2.0)
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700">
                        OFFLINE
                      </span>
                    )}
                  </div>

                  {isYouTubeActive ? (
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-200 truncate">
                        {youtubeConn.channel?.title || 'Connected YouTube Channel'}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {youtubeConn.channel?.customUrl || '@creator'} • {youtubeConn.channel?.subscriberCount || '0'} subscribers • {youtubeConn.channel?.videoCount || '0'} videos
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Auto-post Shorts, Community posts, and Videos directly to your channel without third-party redirection.
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                {isYouTubeActive ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setYoutubeModalOpen(true)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-[#141926] hover:bg-[#1a2234] border border-[#242d42] cursor-pointer transition flex items-center gap-1.5"
                      style={{ borderRadius: '0px' }}
                    >
                      <Sliders size={12} />
                      <span>Channel Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDisconnectYouTube}
                      className="px-3 py-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 bg-transparent hover:bg-rose-950/20 border border-rose-900/40 cursor-pointer transition"
                      style={{ borderRadius: '0px' }}
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectYouTube}
                    disabled={isYouTubeConnecting}
                    className="px-4 py-2 text-xs font-extrabold text-white transition active:scale-98 cursor-pointer border-0 shadow-md flex items-center gap-2 disabled:opacity-50"
                    style={{ background: BRAND_RED, color: '#ffffff', borderRadius: '0px' }}
                  >
                    <Youtube size={14} className="text-white" />
                    <span className="text-white font-bold">
                      {isYouTubeConnecting ? 'Connecting...' : '+ Connect YouTube'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Scope badges if active */}
            {isYouTubeActive && (
              <div className="mt-3 pt-3 border-t border-[#1b2336] flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                <span className="text-slate-500 font-mono text-[10px]">ACTIVE PERMISSIONS:</span>
                <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300">✓ youtube.upload</span>
                <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300">✓ youtube.readonly</span>
                <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300">✓ Resumable video upload</span>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════
              CARD 2: INSTAGRAM (META GRAPH API)
             ══════════════════════════════════════════════════════════════ */}
          <div
            className="p-4 border transition-all"
            style={{
              borderRadius: '0px',
              background: otherAccounts.instagram?.connected ? '#0c111c' : '#0c0f17',
              borderColor: otherAccounts.instagram?.connected ? 'rgba(16, 185, 129, 0.3)' : '#1e2436'
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                <div
                  className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                  style={{
                    borderRadius: '0px',
                    background: otherAccounts.instagram?.connected ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255,255,255,0.05)',
                    color: otherAccounts.instagram?.connected ? '#f472b6' : '#94a3b8'
                  }}
                >
                  <Instagram size={22} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-base font-bold text-white">Instagram</span>
                    {otherAccounts.instagram?.connected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        CONNECTED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700">
                        OFFLINE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {otherAccounts.instagram?.connected
                      ? `Connected profile (${otherAccounts.instagram?.handle || '@instagram'}). Ready for Reels & Stories.`
                      : 'Schedule Reels, Feed Posts, and Stories via Meta Graph API.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                {otherAccounts.instagram?.connected ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setExpandedId(expandedId === 'instagram' ? null : 'instagram')}
                      className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white bg-[#141926] hover:bg-[#1a2234] border border-[#242d42] cursor-pointer transition"
                      style={{ borderRadius: '0px' }}
                    >
                      Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDisconnectOther('instagram')}
                      className="px-3 py-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 bg-transparent hover:bg-rose-950/20 border border-rose-900/40 cursor-pointer transition"
                      style={{ borderRadius: '0px' }}
                    >
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConnectOther('instagram')}
                    className="px-4 py-2 text-xs font-extrabold text-white transition active:scale-98 cursor-pointer border-0 shadow-md flex items-center gap-2"
                    style={{ background: BRAND_RED, color: '#ffffff', borderRadius: '0px' }}
                  >
                    <Instagram size={14} className="text-white" />
                    <span className="text-white font-bold">+ Connect</span>
                  </button>
                )}
              </div>
            </div>

            {/* Instagram Settings Panel */}
            {expandedId === 'instagram' && otherAccounts.instagram?.connected && (
              <div className="mt-3 pt-3 border-t border-[#1b2336] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">Auto-Publish Reels</span>
                    <p className="text-[11px] text-slate-400">Dispatch scheduled Reels to Instagram automatically</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAutoPostOther('instagram')}
                    className="px-3 py-1 text-xs font-bold cursor-pointer border"
                    style={{
                      borderRadius: '0px',
                      background: otherAccounts.instagram.autoPost ? BRAND_RED : '#111522',
                      borderColor: otherAccounts.instagram.autoPost ? BRAND_RED : '#202738',
                      color: '#ffffff'
                    }}
                  >
                    {otherAccounts.instagram.autoPost ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════
              CARD 3: TWITTER / X
             ══════════════════════════════════════════════════════════════ */}
          <div
            className="p-4 border transition-all"
            style={{
              borderRadius: '0px',
              background: otherAccounts.twitter?.connected ? '#0c111c' : '#0c0f17',
              borderColor: otherAccounts.twitter?.connected ? 'rgba(16, 185, 129, 0.3)' : '#1e2436'
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                <div
                  className="w-12 h-12 flex items-center justify-center flex-shrink-0"
                  style={{
                    borderRadius: '0px',
                    background: otherAccounts.twitter?.connected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.05)',
                    color: otherAccounts.twitter?.connected ? '#38bdf8' : '#94a3b8'
                  }}
                >
                  <Twitter size={20} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-base font-bold text-white">Twitter / X</span>
                    {otherAccounts.twitter?.connected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        CONNECTED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700">
                        OFFLINE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {otherAccounts.twitter?.connected
                      ? `Connected handle (${otherAccounts.twitter?.handle || '@creator'}). Ready for tweets & threads.`
                      : 'Auto-post threads, announcements, and launch updates via X API v2.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                {otherAccounts.twitter?.connected ? (
                  <button
                    type="button"
                    onClick={() => handleDisconnectOther('twitter')}
                    className="px-3 py-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 bg-transparent hover:bg-rose-950/20 border border-rose-900/40 cursor-pointer transition"
                    style={{ borderRadius: '0px' }}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConnectOther('twitter')}
                    disabled={connectingPlatform === 'twitter'}
                    className="px-4 py-2 text-xs font-extrabold text-white transition active:scale-98 cursor-pointer border-0 shadow-md flex items-center gap-2"
                    style={{ background: BRAND_RED, color: '#ffffff', borderRadius: '0px' }}
                  >
                    <Plus size={14} className="text-white" />
                    <span className="text-white font-bold">{connectingPlatform === 'twitter' ? 'Connecting...' : '+ Connect'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              CARD 4: TIKTOK
             ══════════════════════════════════════════════════════════════ */}
          <div
            className="p-4 border transition-all"
            style={{
              borderRadius: '0px',
              background: otherAccounts.tiktok?.connected ? '#0c111c' : '#0c0f17',
              borderColor: otherAccounts.tiktok?.connected ? 'rgba(16, 185, 129, 0.3)' : '#1e2436'
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                <div
                  className="w-12 h-12 flex items-center justify-center flex-shrink-0 font-extrabold text-sm"
                  style={{
                    borderRadius: '0px',
                    background: otherAccounts.tiktok?.connected ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255,255,255,0.05)',
                    color: otherAccounts.tiktok?.connected ? '#f472b6' : '#94a3b8'
                  }}
                >
                  TT
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-base font-bold text-white">TikTok</span>
                    {otherAccounts.tiktok?.connected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        CONNECTED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700">
                        OFFLINE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Schedule and publish TikTok videos and clips directly via Content Posting API.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                {otherAccounts.tiktok?.connected ? (
                  <button
                    type="button"
                    onClick={() => handleDisconnectOther('tiktok')}
                    className="px-3 py-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 bg-transparent hover:bg-rose-950/20 border border-rose-900/40 cursor-pointer transition"
                    style={{ borderRadius: '0px' }}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConnectOther('tiktok')}
                    disabled={connectingPlatform === 'tiktok'}
                    className="px-4 py-2 text-xs font-extrabold text-white transition active:scale-98 cursor-pointer border-0 shadow-md flex items-center gap-2"
                    style={{ background: BRAND_RED, color: '#ffffff', borderRadius: '0px' }}
                  >
                    <Plus size={14} className="text-white" />
                    <span className="text-white font-bold">{connectingPlatform === 'tiktok' ? 'Connecting...' : '+ Connect'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              CARD 5: EMAIL (CONVERTKIT / BEEHIIV)
             ══════════════════════════════════════════════════════════════ */}
          <div
            className="p-4 border transition-all"
            style={{
              borderRadius: '0px',
              background: otherAccounts.email?.connected ? '#0c111c' : '#0c0f17',
              borderColor: otherAccounts.email?.connected ? 'rgba(16, 185, 129, 0.3)' : '#1e2436'
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                <div
                  className="w-12 h-12 flex items-center justify-center flex-shrink-0 font-bold text-base"
                  style={{
                    borderRadius: '0px',
                    background: otherAccounts.email?.connected ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.05)',
                    color: otherAccounts.email?.connected ? '#f59e0b' : '#94a3b8'
                  }}
                >
                  ✉
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-base font-bold text-white">Email (ConvertKit / Beehiiv)</span>
                    {otherAccounts.email?.connected ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        CONNECTED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700">
                        OFFLINE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    Sync audience subscribers, trigger VIP sequences, and send launch announcements.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                {otherAccounts.email?.connected ? (
                  <button
                    type="button"
                    onClick={() => handleDisconnectOther('email')}
                    className="px-3 py-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 bg-transparent hover:bg-rose-950/20 border border-rose-900/40 cursor-pointer transition"
                    style={{ borderRadius: '0px' }}
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConnectOther('email')}
                    disabled={connectingPlatform === 'email'}
                    className="px-4 py-2 text-xs font-extrabold text-white transition active:scale-98 cursor-pointer border-0 shadow-md flex items-center gap-2"
                    style={{ background: BRAND_RED, color: '#ffffff', borderRadius: '0px' }}
                  >
                    <Plus size={14} className="text-white" />
                    <span className="text-white font-bold">{connectingPlatform === 'email' ? 'Connecting...' : '+ Connect'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── MODAL: YOUTUBE CHANNEL METADATA & PERMISSIONS ── */}
      {youtubeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div
            className="w-full max-w-md bg-[#0c0f17] border border-[#202738] p-6 shadow-2xl space-y-4"
            style={{ borderRadius: '0px' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2336]">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 flex items-center justify-center text-white"
                  style={{ background: BRAND_RED, borderRadius: '0px' }}
                >
                  <Youtube size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">YouTube Channel Details</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Google OAuth 2.0 Connection</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setYoutubeModalOpen(false)}
                className="p-1 hover:bg-[#161c2b] text-slate-400 hover:text-white transition cursor-pointer border-0"
                style={{ borderRadius: '0px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#111522] border border-[#202738] space-y-1.5 font-mono text-[11px]" style={{ borderRadius: '0px' }}>
                <div className="flex justify-between">
                  <span className="text-slate-500">CHANNEL:</span>
                  <span className="text-white font-bold">{youtubeConn?.channel?.title || 'YouTube Channel'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">HANDLE:</span>
                  <span className="text-slate-300 font-bold">{youtubeConn?.channel?.customUrl || '@creator'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SUBSCRIBERS:</span>
                  <span className="text-emerald-400 font-bold">{youtubeConn?.channel?.subscriberCount || '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">TOTAL VIDEOS:</span>
                  <span className="text-slate-300 font-bold">{youtubeConn?.channel?.videoCount || '0'}</span>
                </div>
                {youtubeConn?.channel?.email && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">GOOGLE ACCOUNT:</span>
                    <span className="text-slate-300">{youtubeConn.channel.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">STATUS:</span>
                  <span className="text-emerald-400 font-bold">Authenticated &amp; Ready</span>
                </div>
              </div>

              <div className="p-3 bg-[#111522] border border-[#202738] text-slate-300 space-y-1" style={{ borderRadius: '0px' }}>
                <div className="font-bold text-white flex items-center gap-1.5 text-[11px]">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Configured Capabilities:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-400">
                  <li>Automatic title, description, and privacy tag dispatching.</li>
                  <li>Directly upload videos and shorts to your channel.</li>
                  <li>All actions executed natively from your CoLaunch dashboard.</li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#1b2336]">
              <button
                type="button"
                onClick={handleDisconnectYouTube}
                className="px-3 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 cursor-pointer border-0 bg-transparent"
                style={{ borderRadius: '0px' }}
              >
                Disconnect Channel
              </button>

              <button
                type="button"
                onClick={() => setYoutubeModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-white cursor-pointer border-0"
                style={{ background: BRAND_RED, color: '#ffffff', borderRadius: '0px' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: INSTAGRAM SETUP MODAL ── */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div
            className="w-full max-w-lg bg-[#0c0f17] border border-[#202738] p-6 shadow-2xl space-y-4"
            style={{ borderRadius: '0px' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2336]">
              <div className="flex items-center gap-2">
                <Instagram size={18} className="text-pink-400" />
                <h3 className="font-bold text-white text-base">Link Instagram Account</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer border-0"
                style={{ borderRadius: '0px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <p className="text-slate-400 leading-relaxed">
                Connect your Instagram Business or Creator account to publish Reels, Stories, and carousel posts directly.
              </p>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Instagram Business Account ID
                </label>
                <input
                  type="text"
                  value={manualBusinessId}
                  onChange={(e) => setManualBusinessId(e.target.value)}
                  placeholder="e.g. 178414053987165"
                  className="w-full bg-[#111522] border border-[#202738] px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 font-mono text-xs"
                  style={{ borderRadius: '0px' }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  User Access Token
                </label>
                <textarea
                  value={manualAccessToken}
                  onChange={(e) => setManualAccessToken(e.target.value)}
                  placeholder="Paste Meta User Access Token..."
                  className="w-full h-20 bg-[#111522] border border-[#202738] p-3 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 font-mono text-xs resize-none"
                  style={{ borderRadius: '0px' }}
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-2 border-t border-[#1b2336]">
              <button
                type="button"
                onClick={() => setIsManualModalOpen(false)}
                className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer border-0 bg-transparent"
                style={{ borderRadius: '0px' }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!manualBusinessId.trim() || !manualAccessToken.trim()) {
                    if (triggerToast) triggerToast('Please enter both Business Account ID and Access Token', 'error')
                    return
                  }
                  updateCreator({
                    instagram_business_id: manualBusinessId.trim(),
                    instagram_access_token: manualAccessToken.trim()
                  })
                  setOtherAccounts(prev => ({
                    ...prev,
                    instagram: { ...prev.instagram, connected: true, handle: '@instagram_business' }
                  }))
                  setIsManualModalOpen(false)
                  if (triggerToast) triggerToast('Instagram connected successfully!', 'success')
                }}
                className="px-4 py-2 text-xs font-bold text-white cursor-pointer border-0"
                style={{ background: BRAND_RED, color: '#ffffff', borderRadius: '0px' }}
              >
                Save &amp; Connect
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
