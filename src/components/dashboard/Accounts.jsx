import { useState, useEffect, useCallback, useMemo } from 'react'
import { useForge } from '../../App'
import {
  Youtube,
  Instagram,
  Facebook,
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
  UserCheck,
  Calendar,
  Lock,
  Layers,
  ArrowUpRight,
  Zap,
  Globe
} from 'lucide-react'
import {
  getStoredYouTubeConnection,
  checkRemoteYouTubeStatus,
  startYouTubeOAuth,
  exchangeYouTubeAuthCode,
  disconnectYouTubeChannel
} from '../../services/youtubeApi'
import {
  getStoredMetaConnection,
  checkRemoteMetaStatus,
  saveStoredMetaConnection,
  saveMetaSelection,
  verifyMetaToken,
  disconnectMetaChannel
} from '../../services/metaApi'
import { studyConnectedChannelAndBuildAssets } from '../../services/channelStudyService'

const STATUS_STYLES = {
  scheduled: { bg: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', label: 'Scheduled' },
  draft: { bg: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)', label: 'Draft' },
  posted: { bg: 'rgba(16,185,129,0.15)', color: '#34d399', label: 'Posted' },
  failed: { bg: 'rgba(200,30,60,0.15)', color: '#f87171', label: 'Failed' },
}

const BRAND_RED = '#c81e3c'

export default function Accounts() {
  const { creatorData, updateCreator, setActiveTab, setPreloadStudioType, triggerToast, syncSessionToDb, userProfile, dashboardData, saveDashboardData } = useForge()

  // Real YouTube Connection from OAuth 2.0
  const [youtubeConn, setYoutubeConn] = useState(() => getStoredYouTubeConnection())
  const [isYouTubeConnecting, setIsYouTubeConnecting] = useState(false)
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false)

  // Meta / Facebook Connection State
  const [metaConn, setMetaConn] = useState(() => getStoredMetaConnection())
  const [isFacebookModalOpen, setIsFacebookModalOpen] = useState(false)
  const [facebookTokenInput, setFacebookTokenInput] = useState(
    'EAAV1vSnTG90BS1zkUbZBQmhLvwwgZCh4qBGqP6DZAotLlcWZCdQaJUfQ1iHV1pfvxGJY5mjwKPrY9Q40O7QxdQddGkLQtqO4IjKtZBHurQelIcoi0jC8QWZAxiBjGbOfX3mawfnVAlaN2l2cMjzrlecoJORKRpClj41TlkEYkhkuHwMRIUOKpvNPFnRUJLZCYdBAN576Ns9UjXPU39INo99PDm3E3qFbHpVtVtjQgZDZD'
  )
  const [discoveredPages, setDiscoveredPages] = useState([
    {
      id: '103228882009161',
      name: 'Techgen',
      category: 'E-commerce website',
      access_token: 'EAAV1vSnTG90BS9vKHxsV4CPXpEvXmCT9caVx3suZAesPHTzaqdP5PxZAAkRlSCALSnQMr2ZCsiEguVP5bcDMFJYFp8PK9o6UyiEfGpSeHHTzImZAoxTdUhbzDjFW25u299grZBueEd82FZC9Q6FbjDbJd0S1bgLGvFPZCmrxOSSCQLLYBnikYQt84mvgkPdF2NIISubewlT0vY2eZCvYGGLTDtW3bl8FxjtKcOPtF46DxB8ZD'
    },
    {
      id: '527462540449391',
      name: 'pigeon Tech',
      category: 'Accessories',
      access_token: 'EAAV1vSnTG90BS055tGM7dUPyDxgNQfyVRBX2S6z9xGenNsXLrFN83FIkJAa3SMUPD3v8NXPPZCVea4bjz9BDzgh3958Od5P5j8ZC3KaNfZCOOiDkPVkawJ6I95HXZBJCXHyuAsLu3ZAe8zCxeXUaFz24AiRVtbfnFX11NiyaB932OTjowsCfjpN3urzOXszPvvzwtZBuMUtLspc6cqXaYSPGo7ioZBeNSysohZBzsqQTHWN9'
    },
    {
      id: '1820886941570083',
      name: 'Sportstechwest',
      category: 'Entrepreneur',
      access_token: 'EAAV1vSnTG90BSwj9RWf4G96UZCoZBdSfIpBZBVSBYoHOFMsVcCmsd6qqpXoBCXGYmHZBNjHIYeQZC0IweCbY5ziaZBZCBKqyDDVp6CW7IDFH5cMDM92pKaKj7hmlyynzFLJWl2lfJEKVTiakIzNROZCj2iZAsjjheo18m4RiBRSSivpZBBweOMBVwrXr5qZAKVcfu8oq2lwjorDZAqBc4IkANvXqx9644GD1ZBqDXLSdQPVF34XpZA'
    }
  ])
  const [selectedPageId, setSelectedPageId] = useState('103228882009161')
  const [isVerifyingMeta, setIsVerifyingMeta] = useState(false)

  // Instagram Manual / Custom Modal
  const [isManualModalOpen, setIsManualModalOpen] = useState(false)
  const [manualBusinessId, setManualBusinessId] = useState('')
  const [manualAccessToken, setManualAccessToken] = useState('')
  const [modalTab, setModalTab] = useState('oauth')

  // Expanded card settings
  const [expandedId, setExpandedId] = useState(null)
  const [connectingPlatform, setConnectingPlatform] = useState(null)

  // Other platform states (Facebook, Instagram, X, TikTok, Email)
  const [otherAccounts, setOtherAccounts] = useState(() => {
    try {
      const stored = localStorage.getItem('forge_accounts_platforms')
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          facebook: { connected: false, pageName: '', pageId: '', handle: '', autoPost: false, approveBeforePost: true, ...(parsed.facebook || {}) },
          instagram: { connected: false, handle: '', autoPost: false, approveBeforePost: true, ...(parsed.instagram || {}) },
          twitter: { connected: false, handle: '', autoPost: false, approveBeforePost: true, ...(parsed.twitter || {}) },
          tiktok: { connected: false, handle: '', autoPost: false, approveBeforePost: true, ...(parsed.tiktok || {}) },
          email: { connected: false, handle: '', autoPost: false, approveBeforePost: true, ...(parsed.email || {}) },
        }
      }
    } catch (_) {}
    return {
      facebook: { connected: false, pageName: '', pageId: '', handle: '', autoPost: false, approveBeforePost: true },
      instagram: { connected: false, handle: '', autoPost: false, approveBeforePost: true },
      twitter: { connected: false, handle: '', autoPost: false, approveBeforePost: true },
      tiktok: { connected: false, handle: '', autoPost: false, approveBeforePost: true },
      email: { connected: false, handle: '', autoPost: false, approveBeforePost: true },
    }
  })

  // Sync Meta Connection with state
  useEffect(() => {
    if (metaConn?.facebook?.connected) {
      setOtherAccounts(prev => ({
        ...prev,
        facebook: {
          ...prev.facebook,
          connected: true,
          pageName: metaConn.facebook.pageName || prev.facebook.pageName,
          pageId: metaConn.facebook.pageId || prev.facebook.pageId,
          handle: metaConn.facebook.pageName || prev.facebook.handle
        }
      }))
    }
    if (metaConn?.instagram?.connected) {
      setOtherAccounts(prev => ({
        ...prev,
        instagram: {
          ...prev.instagram,
          connected: true,
          handle: metaConn.instagram.username || prev.instagram.handle
        }
      }))
    }
  }, [metaConn])

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

  // Check remote backend status if local storage was cleared or fresh session started
  useEffect(() => {
    if (!youtubeConn?.connected) {
      checkRemoteYouTubeStatus(userProfile?.username || creatorData?.handle || 'default')
        .then(res => {
          if (res?.connected && res?.channel) {
            setYoutubeConn({ connected: true, channel: res.channel })
          }
        })
        .catch(() => {})
    }
    if (!metaConn?.facebook?.connected) {
      checkRemoteMetaStatus(creatorData?.handle || 'default', userProfile?.username || '')
        .then(conn => {
          if (conn?.facebook?.connected) {
            setMetaConn(conn)
          }
        })
        .catch(() => {})
    }
  }, [userProfile?.username, creatorData?.handle])

  // Handle incoming OAuth callback query parameter (?code=...) on the accounts page
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code) {
      setIsYouTubeConnecting(true)
      if (triggerToast) triggerToast('Exchanging Google OAuth code with YouTube Data API...', 'info')

      exchangeYouTubeAuthCode(code)
        .then(async channel => {
          setYoutubeConn({ connected: true, channel })
          if (triggerToast) {
            triggerToast(`Connected to YouTube: ${channel.title || '@creator'}! Studying channel...`, 'info')
          }

          // Study channel, fetch real videos, and build custom landing page & daily content calendar
          try {
            await studyConnectedChannelAndBuildAssets({
              channel,
              platform: 'youtube',
              creatorData,
              userProfile,
              updateCreator,
              saveDashboardData
            })
            if (triggerToast) {
              triggerToast(`Analyzed ${channel.title}! Landing page and content calendar synthesized with real videos.`, 'success')
            }
          } catch (studyErr) {
            console.warn('[YouTube Study Notice]', studyErr)
          }

          if (syncSessionToDb) {
            setTimeout(() => syncSessionToDb(), 300)
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
  }, [triggerToast, syncSessionToDb])

  // Save other account configurations and sync to MongoDB Atlas
  useEffect(() => {
    try {
      localStorage.setItem('forge_accounts_platforms', JSON.stringify(otherAccounts))
      if (saveDashboardData) {
        saveDashboardData('accounts', otherAccounts)
      }
      if (syncSessionToDb && (otherAccounts.facebook?.connected || otherAccounts.instagram?.connected)) {
        syncSessionToDb()
      }
    } catch (_) {}
  }, [otherAccounts, saveDashboardData, syncSessionToDb])

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
    if (id === 'facebook') {
      setIsFacebookModalOpen(true)
      return
    }
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
    if (id === 'facebook') {
      updateCreator({ facebook_connected: false, facebook_page_id: null, facebook_page_name: null, facebook_access_token: null })
      disconnectMetaChannel('facebook')
    }
    if (id === 'instagram') {
      updateCreator({ instagram_access_token: null, instagram_business_id: null })
      disconnectMetaChannel('instagram')
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

  // Count active channels (out of 6 channels)
  const isYouTubeActive = !!youtubeConn?.connected
  const activeCount = (isYouTubeActive ? 1 : 0) +
    (otherAccounts.facebook?.connected ? 1 : 0) +
    (otherAccounts.instagram?.connected ? 1 : 0) +
    (otherAccounts.twitter?.connected ? 1 : 0) +
    (otherAccounts.tiktok?.connected ? 1 : 0) +
    (otherAccounts.email?.connected ? 1 : 0)

  // Construct YouTube channel web link if available
  const youtubeCustomUrl = youtubeConn?.channel?.customUrl
  const youtubeChannelLink = youtubeCustomUrl
    ? `https://www.youtube.com/${youtubeCustomUrl.startsWith('@') ? youtubeCustomUrl : '@' + youtubeCustomUrl}`
    : 'https://studio.youtube.com'

  // Dynamic scheduled posts preview for the sidebar from real campaign data
  const upcomingQueue = useMemo(() => {
    try {
      const handle = creatorData?.handle || 'default'
      const hClean = handle.replace(/^@+/, '')
      const saved = localStorage.getItem(`forge_campaign_posts_${hClean}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          const scheduled = parsed.filter(p => p.status === 'Scheduled')
          if (scheduled.length > 0) {
            return scheduled.slice(0, 3).map(p => ({
              id: p.id,
              day: p.fullDayName || p.dayName,
              date: p.fullDateStr,
              channel: p.channel,
              format: p.format,
              title: p.title,
              time: p.time,
              status: 'scheduled'
            }))
          }
          return parsed.slice(0, 3).map(p => ({
            id: p.id,
            day: p.fullDayName || p.dayName,
            date: p.fullDateStr,
            channel: p.channel,
            format: p.format,
            title: p.title,
            time: p.time,
            status: p.status === 'Scheduled' ? 'scheduled' : 'draft'
          }))
        }
      }
    } catch (_) {}
    return [
      {
        id: 'q1',
        day: 'Tuesday',
        date: 'Nov 3, 2026',
        channel: 'YouTube',
        format: 'VIDEO',
        title: creatorData?.productName ? `Launch: Unveiling ${creatorData.productName}` : 'Launch Campaign Video',
        time: '11:30 AM',
        status: 'draft'
      },
      {
        id: 'q2',
        day: 'Wednesday',
        date: 'Nov 4, 2026',
        channel: 'Instagram',
        format: 'REEL',
        title: 'Behind the Scenes & Community Teaser',
        time: '1:00 PM',
        status: 'draft'
      }
    ]
  }, [creatorData?.handle, creatorData?.productName])

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full space-y-6 text-slate-200">
      
      {/* ── HEADER ── */}
      <div className="border-b border-[#1b2234] pb-5 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1">
            ACCOUNTS &amp; INTEGRATIONS
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            Connected Social Accounts
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Manage your native social broadcasting channels. Connected accounts are automatically recognized across your <strong className="text-slate-200">Content Calendar</strong>, <strong className="text-slate-200">Marketing Pipeline</strong>, and <strong className="text-slate-200">Studio</strong> for direct publishing without third-party redirection.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('content-calendar')}
            className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#121724] hover:bg-[#1a2234] border border-[#202738] transition cursor-pointer flex items-center gap-1.5"
            style={{ borderRadius: '0px' }}
          >
            <Calendar size={13} />
            <span>Content Calendar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('studio')}
            className="px-3.5 py-2 text-xs font-bold text-white transition hover:opacity-90 cursor-pointer border-0 flex items-center gap-1.5"
            style={{ background: BRAND_RED, color: '#ffffff', borderRadius: '0px' }}
          >
            <Sparkles size={13} className="text-white" />
            <span>Open Studio</span>
          </button>
        </div>
      </div>

      {/* ── CONNECTION STATUS SUMMARY BANNER ── */}
      <div
        className="p-4 border flex items-center justify-between flex-wrap gap-4"
        style={{
          borderRadius: '0px',
          background: activeCount > 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255, 255, 255, 0.02)',
          borderColor: activeCount > 0 ? 'rgba(16, 185, 129, 0.25)' : '#202738'
        }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-10 h-10 flex items-center justify-center font-bold text-xs shrink-0"
            style={{
              borderRadius: '0px',
              background: activeCount > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: activeCount > 0 ? '#34d399' : '#94a3b8'
            }}
          >
            {activeCount > 0 ? <Check size={20} /> : <AlertCircle size={20} />}
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2.5 flex-wrap">
              <span>{activeCount} of 6 Broadcasting Channels Connected</span>
              {isYouTubeActive && (
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
                  YOUTUBE LIVE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeCount > 0
                ? 'Your publishing engine is active. Posts scheduled in your Content Calendar will broadcast directly to connected channels.'
                : 'Connect at least one channel below to enable direct live publishing and scheduling.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline-block">
            ENGINE: DIRECT OAUTH 2.0
          </span>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab && setActiveTab('content-calendar')}
              className="px-3.5 py-1.5 text-xs font-bold text-white transition hover:opacity-95 cursor-pointer border-0 flex items-center gap-1.5"
              style={{ background: BRAND_RED, color: '#ffffff', borderRadius: '0px' }}
            >
              <span>Schedule Post</span>
              <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── MAIN TWO-COLUMN RESPONSIVE LAYOUT ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* ════════════════════════════════════════════════════════════════
            LEFT COLUMN (CARDS SPAN FULL COLUMN WIDTH)
           ════════════════════════════════════════════════════════════════ */}
        <div className="xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <p className="text-xs font-bold font-mono uppercase tracking-wider text-slate-400">
              Broadcasting Channels
            </p>
            <span className="text-xs text-slate-500 font-mono">Direct API &amp; OAuth 2.0</span>
          </div>

          <div className="space-y-3.5">
            
            {/* ── CARD 1: YOUTUBE (OAUTH 2.0 REAL CONNECTION) ── */}
            <div
              className="p-5 border transition-all"
              style={{
                borderRadius: '0px',
                background: isYouTubeActive ? '#0c111c' : '#0c0f17',
                borderColor: isYouTubeActive ? 'rgba(239, 68, 68, 0.4)' : '#1e2436'
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  {/* Channel Avatar / Icon */}
                  <div
                    className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] flex items-center justify-center flex-shrink-0 shrink-0 relative overflow-hidden border border-white/10"
                    style={{
                      borderRadius: '0px',
                      width: '56px',
                      height: '56px',
                      minWidth: '56px',
                      minHeight: '56px',
                      maxWidth: '56px',
                      maxHeight: '56px',
                      background: isYouTubeActive ? '#c81e3c' : 'rgba(255,255,255,0.05)',
                      color: '#ffffff'
                    }}
                  >
                    {youtubeConn?.channel?.thumbnail ? (
                      <img
                        src={youtubeConn.channel.thumbnail}
                        alt={youtubeConn.channel.title || 'YouTube Avatar'}
                        className="w-14 h-14 object-cover block"
                        style={{ width: '56px', height: '56px', maxWidth: '56px', maxHeight: '56px' }}
                      />
                    ) : (
                      <Youtube size={26} className="text-white" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-base font-bold text-white">YouTube</span>
                      {isYouTubeActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
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
                        <p className="text-sm font-bold text-slate-100 truncate">
                          {youtubeConn.channel?.title || 'Connected YouTube Channel'}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {youtubeConn.channel?.customUrl || '@creator'} • <span className="text-emerald-400 font-bold">{youtubeConn.channel?.subscriberCount || '0'}</span> subscribers • {youtubeConn.channel?.videoCount || '0'} videos
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 leading-relaxed">
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
                        className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#141926] hover:bg-[#1a2234] border border-[#242d42] cursor-pointer transition flex items-center gap-1.5"
                        style={{ borderRadius: '0px' }}
                      >
                        <Sliders size={12} />
                        <span>Channel Details</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDisconnectYouTube}
                        className="px-3.5 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 bg-transparent hover:bg-rose-950/20 border border-rose-900/40 cursor-pointer transition"
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
                      className="px-4 py-2.5 text-xs font-extrabold text-white transition active:scale-98 cursor-pointer border-0 shadow-md flex items-center gap-2 disabled:opacity-50"
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
                <div className="mt-3.5 pt-3.5 border-t border-[#1b2336] flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span className="text-slate-500 font-mono text-[10px]">ACTIVE PERMISSIONS:</span>
                  <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300">✓ youtube.upload</span>
                  <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300">✓ youtube.readonly</span>
                  <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300">✓ Resumable video upload</span>
                  {youtubeConn?.channel?.email && (
                    <span className="px-2 py-0.5 bg-slate-900/60 border border-slate-800/60 text-slate-400 font-mono text-[10px]">
                      Account: {youtubeConn.channel.email}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* ── CARD: FACEBOOK (META GRAPH API) ── */}
            <div
              className="p-5 border transition-all"
              style={{
                borderRadius: '0px',
                background: otherAccounts.facebook?.connected ? '#0c111c' : '#0c0f17',
                borderColor: otherAccounts.facebook?.connected ? 'rgba(24, 119, 242, 0.4)' : '#1e2436'
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  <div
                    className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] flex items-center justify-center flex-shrink-0 shrink-0"
                    style={{
                      borderRadius: '0px',
                      width: '56px',
                      height: '56px',
                      minWidth: '56px',
                      minHeight: '56px',
                      maxWidth: '56px',
                      maxHeight: '56px',
                      background: otherAccounts.facebook?.connected ? 'rgba(24, 119, 242, 0.2)' : 'rgba(255,255,255,0.05)',
                      color: otherAccounts.facebook?.connected ? '#38bdf8' : '#94a3b8'
                    }}
                  >
                    <Facebook size={26} className={otherAccounts.facebook?.connected ? 'text-blue-400' : 'text-slate-400'} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-base font-bold text-white">Facebook Page</span>
                      {otherAccounts.facebook?.connected ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
                          CONNECTED (META GRAPH API)
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700">
                          OFFLINE
                        </span>
                      )}
                    </div>
                    {otherAccounts.facebook?.connected ? (
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-slate-100 truncate">
                          {otherAccounts.facebook?.pageName || 'Connected Facebook Page'}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Page ID: {otherAccounts.facebook?.pageId || 'Linked'} • Auto-Publish Ready
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Publish launch updates, community posts, and product links directly to your Facebook Page without third-party redirection.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {otherAccounts.facebook?.connected ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsFacebookModalOpen(true)}
                        className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#141926] hover:bg-[#1a2234] border border-[#242d42] cursor-pointer transition"
                        style={{ borderRadius: '0px' }}
                      >
                        Page Settings
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDisconnectOther('facebook')}
                        className="px-3.5 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 bg-transparent hover:bg-rose-950/20 border border-rose-900/40 cursor-pointer transition"
                        style={{ borderRadius: '0px' }}
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsFacebookModalOpen(true)}
                      className="px-4 py-2.5 text-xs font-extrabold text-white transition active:scale-98 cursor-pointer border-0 shadow-md flex items-center gap-2"
                      style={{ background: BRAND_RED, color: '#ffffff', borderRadius: '0px' }}
                    >
                      <Facebook size={14} className="text-white" />
                      <span className="text-white font-bold">+ Connect Page</span>
                    </button>
                  )}
                </div>
              </div>

              {otherAccounts.facebook?.connected && (
                <div className="mt-3.5 pt-3.5 border-t border-[#1b2336] flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span className="text-slate-500 font-mono text-[10px]">VERIFIED CAPABILITIES:</span>
                  <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300">✓ pages_manage_posts</span>
                  <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300">✓ pages_read_engagement</span>
                  <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300">✓ Direct feed dispatch</span>
                </div>
              )}
            </div>

            {/* ── CARD 3: INSTAGRAM (META GRAPH API) ── */}
            <div
              className="p-5 border transition-all"
              style={{
                borderRadius: '0px',
                background: otherAccounts.instagram?.connected ? '#0c111c' : '#0c0f17',
                borderColor: otherAccounts.instagram?.connected ? 'rgba(16, 185, 129, 0.3)' : '#1e2436'
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  <div
                    className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] flex items-center justify-center flex-shrink-0 shrink-0"
                    style={{
                      borderRadius: '0px',
                      width: '56px',
                      height: '56px',
                      minWidth: '56px',
                      minHeight: '56px',
                      maxWidth: '56px',
                      maxHeight: '56px',
                      background: otherAccounts.instagram?.connected ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255,255,255,0.05)',
                      color: otherAccounts.instagram?.connected ? '#f472b6' : '#94a3b8'
                    }}
                  >
                    <Instagram size={24} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-base font-bold text-white">Instagram</span>
                      {otherAccounts.instagram?.connected ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
                          CONNECTED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700">
                          OFFLINE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {otherAccounts.instagram?.connected
                        ? `Connected profile (${otherAccounts.instagram?.handle || '@instagram'}). Ready for Reels, Feed Posts, and Stories.`
                        : 'Schedule Reels, Feed Posts, and Stories via Meta Graph API without third-party redirection.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {otherAccounts.instagram?.connected ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setExpandedId(expandedId === 'instagram' ? null : 'instagram')}
                        className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#141926] hover:bg-[#1a2234] border border-[#242d42] cursor-pointer transition"
                        style={{ borderRadius: '0px' }}
                      >
                        Settings
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDisconnectOther('instagram')}
                        className="px-3.5 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 bg-transparent hover:bg-rose-950/20 border border-rose-900/40 cursor-pointer transition"
                        style={{ borderRadius: '0px' }}
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnectOther('instagram')}
                      className="px-4 py-2.5 text-xs font-extrabold text-white transition active:scale-98 cursor-pointer border-0 shadow-md flex items-center gap-2"
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
                <div className="mt-3.5 pt-3.5 border-t border-[#1b2336] space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white">Auto-Publish Reels</span>
                      <p className="text-[11px] text-slate-400">Dispatch scheduled Reels to Instagram automatically</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleAutoPostOther('instagram')}
                      className="px-3.5 py-1 text-xs font-bold cursor-pointer border"
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

            {/* ── CARD 3: TWITTER / X ── */}
            <div
              className="p-5 border transition-all"
              style={{
                borderRadius: '0px',
                background: otherAccounts.twitter?.connected ? '#0c111c' : '#0c0f17',
                borderColor: otherAccounts.twitter?.connected ? 'rgba(16, 185, 129, 0.3)' : '#1e2436'
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  <div
                    className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] flex items-center justify-center flex-shrink-0 shrink-0"
                    style={{
                      borderRadius: '0px',
                      width: '56px',
                      height: '56px',
                      minWidth: '56px',
                      minHeight: '56px',
                      maxWidth: '56px',
                      maxHeight: '56px',
                      background: otherAccounts.twitter?.connected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.05)',
                      color: otherAccounts.twitter?.connected ? '#38bdf8' : '#94a3b8'
                    }}
                  >
                    <Twitter size={22} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-base font-bold text-white">Twitter / X</span>
                      {otherAccounts.twitter?.connected ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
                          CONNECTED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700">
                          OFFLINE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {otherAccounts.twitter?.connected
                        ? `Connected handle (${otherAccounts.twitter?.handle || '@creator'}). Ready for tweets, threads, and media uploads.`
                        : 'Auto-post threads, announcements, and launch updates via X API v2.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {otherAccounts.twitter?.connected ? (
                    <button
                      type="button"
                      onClick={() => handleDisconnectOther('twitter')}
                      className="px-3.5 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 bg-transparent hover:bg-rose-950/20 border border-rose-900/40 cursor-pointer transition"
                      style={{ borderRadius: '0px' }}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnectOther('twitter')}
                      disabled={connectingPlatform === 'twitter'}
                      className="px-4 py-2.5 text-xs font-extrabold text-white transition active:scale-98 cursor-pointer border-0 shadow-md flex items-center gap-2"
                      style={{ background: BRAND_RED, color: '#ffffff', borderRadius: '0px' }}
                    >
                      <Plus size={14} className="text-white" />
                      <span className="text-white font-bold">{connectingPlatform === 'twitter' ? 'Connecting...' : '+ Connect'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── CARD 4: TIKTOK ── */}
            <div
              className="p-5 border transition-all"
              style={{
                borderRadius: '0px',
                background: otherAccounts.tiktok?.connected ? '#0c111c' : '#0c0f17',
                borderColor: otherAccounts.tiktok?.connected ? 'rgba(16, 185, 129, 0.3)' : '#1e2436'
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  <div
                    className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] flex items-center justify-center flex-shrink-0 shrink-0 font-extrabold text-sm"
                    style={{
                      borderRadius: '0px',
                      width: '56px',
                      height: '56px',
                      minWidth: '56px',
                      minHeight: '56px',
                      maxWidth: '56px',
                      maxHeight: '56px',
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
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
                          CONNECTED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700">
                          OFFLINE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {otherAccounts.tiktok?.connected
                        ? `Connected profile (${otherAccounts.tiktok?.handle || '@tiktok'}). Direct video posting enabled.`
                        : 'Schedule and publish TikTok videos and clips directly via Content Posting API.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {otherAccounts.tiktok?.connected ? (
                    <button
                      type="button"
                      onClick={() => handleDisconnectOther('tiktok')}
                      className="px-3.5 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 bg-transparent hover:bg-rose-950/20 border border-rose-900/40 cursor-pointer transition"
                      style={{ borderRadius: '0px' }}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnectOther('tiktok')}
                      disabled={connectingPlatform === 'tiktok'}
                      className="px-4 py-2.5 text-xs font-extrabold text-white transition active:scale-98 cursor-pointer border-0 shadow-md flex items-center gap-2"
                      style={{ background: BRAND_RED, color: '#ffffff', borderRadius: '0px' }}
                    >
                      <Plus size={14} className="text-white" />
                      <span className="text-white font-bold">{connectingPlatform === 'tiktok' ? 'Connecting...' : '+ Connect'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── CARD 5: EMAIL (CONVERTKIT / BEEHIIV) ── */}
            <div
              className="p-5 border transition-all"
              style={{
                borderRadius: '0px',
                background: otherAccounts.email?.connected ? '#0c111c' : '#0c0f17',
                borderColor: otherAccounts.email?.connected ? 'rgba(16, 185, 129, 0.3)' : '#1e2436'
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                  <div
                    className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] flex items-center justify-center flex-shrink-0 shrink-0 font-bold text-lg"
                    style={{
                      borderRadius: '0px',
                      width: '56px',
                      height: '56px',
                      minWidth: '56px',
                      minHeight: '56px',
                      maxWidth: '56px',
                      maxHeight: '56px',
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
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
                          CONNECTED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700">
                          OFFLINE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {otherAccounts.email?.connected
                        ? `Connected list (${otherAccounts.email?.handle || creatorData?.email || 'list@colaunch.io'}). Auto-broadcast ready.`
                        : 'Sync audience subscribers, trigger VIP sequences, and send launch announcements directly.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {otherAccounts.email?.connected ? (
                    <button
                      type="button"
                      onClick={() => handleDisconnectOther('email')}
                      className="px-3.5 py-2 text-xs font-bold text-rose-400 hover:text-rose-300 bg-transparent hover:bg-rose-950/20 border border-rose-900/40 cursor-pointer transition"
                      style={{ borderRadius: '0px' }}
                    >
                      Disconnect
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnectOther('email')}
                      disabled={connectingPlatform === 'email'}
                      className="px-4 py-2.5 text-xs font-extrabold text-white transition active:scale-98 cursor-pointer border-0 shadow-md flex items-center gap-2"
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
        </div>

        {/* ════════════════════════════════════════════════════════════════
            RIGHT SIDEBAR (RICH INSPECTOR & LIVE DISPATCH PANELS)
           ════════════════════════════════════════════════════════════════ */}
        <div className="xl:col-span-4 space-y-5">

          {/* ── PANEL 1: PUBLISHING ENGINE STATUS & MATRIX ── */}
          <div
            className="p-5 border bg-[#0c0f17] space-y-4"
            style={{ borderRadius: '0px', borderColor: '#1e2436' }}
          >
            <div className="flex items-center justify-between border-b border-[#1b2336] pb-3">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  DISPATCH ENGINE
                </p>
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mt-0.5">
                  <Zap size={14} className="text-amber-400" />
                  <span>CoLaunch Direct Engine</span>
                </h4>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>

            {/* Channel Connection Grid */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Broadcasting Matrix ({activeCount}/6 Armed)
              </p>
              
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {/* YouTube status line */}
                <div className="flex items-center justify-between p-2 bg-[#101420] border border-[#1b2336]">
                  <div className="flex items-center gap-2">
                    <Youtube size={14} className={isYouTubeActive ? 'text-red-400' : 'text-slate-500'} />
                    <span className="font-bold text-white">YouTube</span>
                  </div>
                  {isYouTubeActive ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400" />
                      OAUTH 2.0 READY
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">OFFLINE</span>
                  )}
                </div>

                {/* Facebook status line */}
                <div className="flex items-center justify-between p-2 bg-[#101420] border border-[#1b2336]">
                  <div className="flex items-center gap-2">
                    <Facebook size={14} className={otherAccounts.facebook?.connected ? 'text-blue-400' : 'text-slate-500'} />
                    <span className="font-bold text-white">Facebook</span>
                  </div>
                  {otherAccounts.facebook?.connected ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400" />
                      READY
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">OFFLINE</span>
                  )}
                </div>

                {/* Instagram status line */}
                <div className="flex items-center justify-between p-2 bg-[#101420] border border-[#1b2336]">
                  <div className="flex items-center gap-2">
                    <Instagram size={14} className={otherAccounts.instagram?.connected ? 'text-pink-400' : 'text-slate-500'} />
                    <span className="font-bold text-white">Instagram</span>
                  </div>
                  {otherAccounts.instagram?.connected ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400" />
                      READY
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">OFFLINE</span>
                  )}
                </div>

                {/* Twitter / X status line */}
                <div className="flex items-center justify-between p-2 bg-[#101420] border border-[#1b2336]">
                  <div className="flex items-center gap-2">
                    <Twitter size={14} className={otherAccounts.twitter?.connected ? 'text-sky-400' : 'text-slate-500'} />
                    <span className="font-bold text-white">Twitter / X</span>
                  </div>
                  {otherAccounts.twitter?.connected ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400" />
                      READY
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">OFFLINE</span>
                  )}
                </div>

                {/* TikTok status line */}
                <div className="flex items-center justify-between p-2 bg-[#101420] border border-[#1b2336]">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-extrabold ${otherAccounts.tiktok?.connected ? 'text-pink-400' : 'text-slate-500'}`}>TT</span>
                    <span className="font-bold text-white">TikTok</span>
                  </div>
                  {otherAccounts.tiktok?.connected ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400" />
                      READY
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">OFFLINE</span>
                  )}
                </div>

                {/* Email status line */}
                <div className="flex items-center justify-between p-2 bg-[#101420] border border-[#1b2336]">
                  <div className="flex items-center gap-2">
                    <span className={`text-[12px] ${otherAccounts.email?.connected ? 'text-amber-400' : 'text-slate-500'}`}>✉</span>
                    <span className="font-bold text-white">Email</span>
                  </div>
                  {otherAccounts.email?.connected ? (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400" />
                      READY
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">OFFLINE</span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1b2336] flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>MIDDLEMAN: NONE</span>
              <span className="text-emerald-400">DIRECT HANDSHAKE</span>
            </div>
          </div>

          {/* ── PANEL 2: ACTIVE CHANNEL SPOTLIGHT ── */}
          {isYouTubeActive ? (
            <div
              className="p-5 border bg-[#0c0f17] space-y-4"
              style={{ borderRadius: '0px', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            >
              <div className="flex items-center justify-between border-b border-[#1b2336] pb-3">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  CHANNEL SPOTLIGHT
                </p>
                <a
                  href={youtubeChannelLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition"
                >
                  <span>Open Channel</span>
                  <ExternalLink size={12} />
                </a>
              </div>

              {/* Profile Card */}
              <div className="flex items-center gap-3.5">
                <div
                  className="w-14 h-14 flex items-center justify-center overflow-hidden shrink-0"
                  style={{ borderRadius: '0px', background: '#c81e3c' }}
                >
                  {youtubeConn.channel?.thumbnail ? (
                    <img
                      src={youtubeConn.channel.thumbnail}
                      alt={youtubeConn.channel.title || 'Channel'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Youtube size={28} className="text-white" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-extrabold text-white truncate">
                    {youtubeConn.channel?.title || 'Connected Channel'}
                  </h4>
                  <p className="text-xs font-mono text-slate-400 truncate">
                    {youtubeConn.channel?.customUrl || '@creator'}
                  </p>
                  <p className="text-[11px] font-mono text-emerald-400 mt-0.5">
                    Verified OAuth 2.0 Credentials
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 bg-[#101420] border border-[#1b2336]">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Subscribers</p>
                  <p className="text-base font-extrabold text-white mt-0.5">
                    {youtubeConn.channel?.subscriberCount || '0'}
                  </p>
                </div>
                <div className="p-2.5 bg-[#101420] border border-[#1b2336]">
                  <p className="text-[10px] font-mono text-slate-400 uppercase">Total Videos</p>
                  <p className="text-base font-extrabold text-white mt-0.5">
                    {youtubeConn.channel?.videoCount || '0'}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setYoutubeModalOpen(true)}
                  className="flex-1 py-2 text-xs font-bold text-slate-200 bg-[#141926] hover:bg-[#1a2234] border border-[#242d42] transition cursor-pointer"
                  style={{ borderRadius: '0px' }}
                >
                  View Permissions
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab && setActiveTab('studio')}
                  className="flex-1 py-2 text-xs font-bold text-white transition hover:opacity-90 cursor-pointer border-0"
                  style={{ background: BRAND_RED, color: '#ffffff', borderRadius: '0px' }}
                >
                  Create Video Post
                </button>
              </div>
            </div>
          ) : (
            <div
              className="p-5 border bg-[#0c0f17] space-y-3.5"
              style={{ borderRadius: '0px', borderColor: '#1e2436' }}
            >
              <div className="flex items-center gap-2 text-amber-400">
                <AlertCircle size={16} />
                <h4 className="text-xs font-bold uppercase tracking-wider">No Active Channels</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect your YouTube channel with direct Google OAuth 2.0 to unlock instant live broadcasting, automatic Shorts publishing, and channel analytics.
              </p>
              <button
                type="button"
                onClick={handleConnectYouTube}
                disabled={isYouTubeConnecting}
                className="w-full py-2.5 text-xs font-extrabold text-white transition cursor-pointer border-0 shadow-md flex items-center justify-center gap-2"
                style={{ background: BRAND_RED, color: '#ffffff', borderRadius: '0px' }}
              >
                <Youtube size={15} className="text-white" />
                <span>{isYouTubeConnecting ? 'Connecting...' : 'Connect YouTube Now'}</span>
              </button>
            </div>
          )}

          {/* ── PANEL 3: UPCOMING BROADCAST QUEUE ── */}
          <div
            className="p-5 border bg-[#0c0f17] space-y-3.5"
            style={{ borderRadius: '0px', borderColor: '#1e2436' }}
          >
            <div className="flex items-center justify-between border-b border-[#1b2336] pb-3">
              <div>
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  SCHEDULED BROADCASTS
                </p>
                <h4 className="text-sm font-bold text-white mt-0.5">Upcoming Queue</h4>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab && setActiveTab('content-calendar')}
                className="text-xs font-bold text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer border-0 bg-transparent"
              >
                <span>View Full</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="space-y-2">
              {upcomingQueue.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setActiveTab && setActiveTab('content-calendar')}
                  className="p-3 bg-[#101420] border border-[#1b2336] hover:border-slate-600 transition cursor-pointer space-y-1"
                  style={{ borderRadius: '0px' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-slate-800 text-slate-300">
                      {item.channel.toUpperCase()} • {item.format}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {item.day}, {item.time}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-200 truncate">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-1 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setActiveTab && setActiveTab('content-calendar')}
                className="flex-1 py-2 text-xs font-bold text-slate-300 hover:text-white bg-[#141926] hover:bg-[#1a2234] border border-[#242d42] transition cursor-pointer"
                style={{ borderRadius: '0px' }}
              >
                Calendar View
              </button>
              <button
                type="button"
                onClick={() => setActiveTab && setActiveTab('studio')}
                className="flex-1 py-2 text-xs font-bold text-white transition hover:opacity-90 cursor-pointer border-0"
                style={{ background: BRAND_RED, color: '#ffffff', borderRadius: '0px' }}
              >
                + New Draft
              </button>
            </div>
          </div>

        </div>

      </div>

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

      {/* ── MODAL: FACEBOOK PAGE SELECTION MODAL ── */}
      {isFacebookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div
            className="w-full max-w-lg bg-[#0c0f17] border border-[#202738] p-6 shadow-2xl space-y-4"
            style={{ borderRadius: '0px' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#1b2336]">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 flex items-center justify-center text-white"
                  style={{ background: '#1877f2', borderRadius: '0px' }}
                >
                  <Facebook size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Facebook Page Integration</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Meta Graph API Verified</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFacebookModalOpen(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer border-0 bg-transparent"
                style={{ borderRadius: '0px' }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-400 leading-relaxed">
                Connect your verified Facebook Page to auto-publish product launches, announcements, and calendar drafts.
              </p>

              {/* Meta Token Input with Verify button */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Meta Access Token
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400">Authenticated: Elisha Adamu</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={facebookTokenInput}
                    onChange={(e) => setFacebookTokenInput(e.target.value)}
                    placeholder="Paste Meta Access Token..."
                    className="flex-1 bg-[#111522] border border-[#202738] px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-rose-500 font-mono text-xs"
                    style={{ borderRadius: '0px' }}
                  />
                  <button
                    type="button"
                    disabled={isVerifyingMeta}
                    onClick={async () => {
                      if (!facebookTokenInput.trim()) {
                        if (triggerToast) triggerToast('Please enter a valid Meta token', 'error')
                        return
                      }
                      setIsVerifyingMeta(true)
                      try {
                        const res = await verifyMetaToken(facebookTokenInput)
                        if (res.pages && res.pages.length > 0) {
                          setDiscoveredPages(res.pages)
                          setSelectedPageId(res.pages[0].id)
                          if (triggerToast) triggerToast(`Found ${res.pages.length} Facebook Pages!`, 'success')
                        } else {
                          if (triggerToast) triggerToast('Token verified, but no Pages returned. Ensure pages_show_list is granted.', 'info')
                        }
                      } catch (err) {
                        if (triggerToast) triggerToast(`Meta Token verification error: ${err.message}`, 'error')
                      } finally {
                        setIsVerifyingMeta(false)
                      }
                    }}
                    className="px-3 py-2 text-xs font-bold text-slate-200 hover:text-white bg-[#182030] hover:bg-[#202a40] border border-[#2b354d] cursor-pointer transition shrink-0"
                    style={{ borderRadius: '0px' }}
                  >
                    {isVerifyingMeta ? 'Verifying...' : 'Re-verify'}
                  </button>
                </div>
              </div>

              {/* Discovered Pages List */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Select Facebook Page ({discoveredPages.length} Available)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {discoveredPages.map((page) => {
                    const isSelected = selectedPageId === page.id
                    return (
                      <div
                        key={page.id}
                        onClick={() => setSelectedPageId(page.id)}
                        className={`p-3 border cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#141d2f] border-blue-500/60 ring-1 ring-blue-500/50'
                            : 'bg-[#111522] border-[#202738] hover:border-slate-600'
                        }`}
                        style={{ borderRadius: '0px' }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-blue-400 bg-blue-500' : 'border-slate-600'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">{page.name}</p>
                            <p className="text-[10px] font-mono text-slate-400">
                              ID: {page.id} • {page.category || 'Page'}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <span className="text-[10px] font-mono font-bold text-blue-400 px-2 py-0.5 bg-blue-950/60 border border-blue-800/60">
                            SELECTED
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between gap-2 border-t border-[#1b2336]">
              <button
                type="button"
                onClick={() => setIsFacebookModalOpen(false)}
                className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer border-0 bg-transparent"
                style={{ borderRadius: '0px' }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={async () => {
                  const targetPage = discoveredPages.find(p => p.id === selectedPageId) || discoveredPages[0]
                  if (!targetPage) {
                    if (triggerToast) triggerToast('Please select a Facebook Page to connect', 'error')
                    return
                  }

                  const payload = {
                    page_id: targetPage.id,
                    page_name: targetPage.name,
                    page_access_token: targetPage.access_token || facebookTokenInput,
                    user_access_token: facebookTokenInput,
                    category: targetPage.category,
                    tasks: targetPage.tasks,
                    handle: creatorData?.handle || 'default',
                    username: userProfile?.username || ''
                  }

                  await saveMetaSelection(payload)

                  setOtherAccounts(prev => ({
                    ...prev,
                    facebook: {
                      ...prev.facebook,
                      connected: true,
                      pageName: targetPage.name,
                      pageId: targetPage.id,
                      handle: targetPage.name
                    }
                  }))

                  if (updateCreator) {
                    updateCreator({
                      facebook_connected: true,
                      facebook_page_id: targetPage.id,
                      facebook_page_name: targetPage.name,
                      facebook_access_token: targetPage.access_token || facebookTokenInput
                    })
                  }

                  try {
                    await studyConnectedChannelAndBuildAssets({
                      channel: {
                        id: targetPage.id,
                        title: targetPage.name,
                        name: targetPage.name,
                        handle: `@${targetPage.name.replace(/\s+/g, '').toLowerCase()}`,
                        customUrl: `@${targetPage.name.replace(/\s+/g, '').toLowerCase()}`,
                        subscriberCount: '1,500'
                      },
                      platform: 'facebook',
                      creatorData,
                      userProfile,
                      updateCreator,
                      saveDashboardData
                    })
                  } catch (e) {
                    console.warn('[Facebook Study Notice]', e)
                  }

                  if (syncSessionToDb) {
                    setTimeout(() => syncSessionToDb(), 300)
                  }

                  setIsFacebookModalOpen(false)
                  if (triggerToast) triggerToast(`Facebook Page "${targetPage.name}" linked successfully!`, 'success')
                }}
                className="px-4 py-2 text-xs font-bold text-white cursor-pointer border-0"
                style={{ background: BRAND_RED, color: '#ffffff', borderRadius: '0px' }}
              >
                Connect Selected Page
              </button>
            </div>
          </div>
        </div>
      )}
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
