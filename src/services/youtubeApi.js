/**
 * YouTube Data API v3 & Google OAuth 2.0 Integration Client
 * Provides direct OAuth 2.0 authentication, channel status checks,
 * and direct video / community post publishing for creators.
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || [
  '1060262666913',
  '-0vu142mc8f59csp2db3heqs0rnphgqtb',
  '.apps.googleusercontent.com'
].join('')
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin : 'https://app.co-launch.app')
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://creator-forge-backend-jj1y.onrender.com'

const STORAGE_KEY = 'forge_youtube_connection'

function getActiveUserKey(userEmail = null) {
  let target = userEmail
  if (!target && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('forge_user_profile')
      if (raw) {
        const p = JSON.parse(raw)
        target = p.email || p.username
      }
    } catch (_) {}
  }
  if (!target) return STORAGE_KEY
  const clean = target.toLowerCase().replace(/[^a-z0-9_]/g, '_')
  return `forge_youtube_connection_${clean}`
}

const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/userinfo.profile'
]

/**
 * Returns the Google OAuth 2.0 authorization URL
 */
export function getYouTubeAuthUrl(redirectUri = null, state = null) {
  const targetRedirect = redirectUri || GOOGLE_REDIRECT_URI
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: targetRedirect,
    response_type: 'code',
    scope: YOUTUBE_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true'
  })
  if (state) params.set('state', state)
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

/**
 * Initiates the Google OAuth 2.0 connection redirect
 */
export function startYouTubeOAuth(state = null, returnTab = 'accounts', userEmail = null) {
  if (typeof window === 'undefined') return
  const currentPath = window.location.pathname || '/dashboard'
  try {
    sessionStorage.setItem('forge_oauth_return_path', currentPath)
    localStorage.setItem('forge_oauth_return_path', currentPath)
    localStorage.setItem('forge_dashboard_active_tab', returnTab)
    localStorage.setItem('forge_onboarding_step', 'dashboard')
    if (userEmail) {
      sessionStorage.setItem('forge_oauth_user_email', userEmail)
    }
  } catch (_) {}

  let statePayload = state
  if (!statePayload) {
    statePayload = JSON.stringify({
      path: currentPath,
      tab: returnTab,
      email: userEmail || ''
    })
  }
  const authUrl = getYouTubeAuthUrl(GOOGLE_REDIRECT_URI, encodeURIComponent(statePayload))
  window.location.href = authUrl
}

/**
 * Exchanges authorization code for tokens and retrieves YouTube channel info
 */
export async function exchangeYouTubeAuthCode(code, redirectUri = null, userEmail = null) {
  const targetRedirect = redirectUri || GOOGLE_REDIRECT_URI

  let activeEmail = userEmail
  if (!activeEmail && typeof window !== 'undefined') {
    try {
      activeEmail = sessionStorage.getItem('forge_oauth_user_email')
      if (!activeEmail) {
        const raw = localStorage.getItem('forge_user_profile')
        if (raw) activeEmail = JSON.parse(raw).email || JSON.parse(raw).username
      }
    } catch (_) {}
  }

  const payload = {
    code,
    redirect_uri: targetRedirect,
    identifier: activeEmail || 'default',
    email: activeEmail || '',
    client_id: GOOGLE_CLIENT_ID,
    ...(import.meta.env.VITE_GOOGLE_CLIENT_SECRET ? { client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET } : {})
  }

  const candidateUrls = [
    BACKEND_URL,
    'https://creator-forge-backend.onrender.com',
    'https://creator-forge-backend-jj1y.onrender.com'
  ].filter(Boolean)

  let lastError = null
  for (const url of Array.from(new Set(candidateUrls))) {
    try {
      const res = await fetch(`${url}/api/youtube/exchange-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        if (data.channel) {
          saveLocalYouTubeConnection(data.channel, data.tokens, activeEmail)
          return data.channel
        }
      } else {
        let errorDetail = `Status ${res.status}`
        try {
          const errJson = await res.json()
          errorDetail = errJson.detail || errJson.message || errorDetail
        } catch (_) {}
        lastError = new Error(`Google OAuth Exchange Failed: ${errorDetail}`)
      }
    } catch (err) {
      lastError = err
    }
  }

  throw lastError || new Error('Google did not return channel metadata.')
}

/**
 * Retrieves the current connected YouTube channel strictly for the active user
 */
export function getStoredYouTubeConnection(userEmail = null) {
  if (typeof window === 'undefined') return null
  try {
    const key = getActiveUserKey(userEmail)
    const saved = localStorage.getItem(key)
    if (saved) return JSON.parse(saved)

    // Check if userProfile in localStorage has connection
    const raw = localStorage.getItem('forge_user_profile')
    if (raw) {
      const p = JSON.parse(raw)
      if (p.youtube_connection?.connected) return p.youtube_connection
      // User is logged in and has NO connection on profile or user key -> return null
      return null
    }

    // Only for non-logged-in guest sessions:
    const fallback = localStorage.getItem(STORAGE_KEY)
    if (fallback) return JSON.parse(fallback)
  } catch (_) {}
  return null
}

/**
 * Checks remote backend for active YouTube connection strictly for the given user
 */
export async function checkRemoteYouTubeStatus(identifier = null) {
  if (typeof window === 'undefined') return null
  const cleanId = (identifier || '').replace('@', '').trim()
  if (!cleanId || cleanId === 'default') return null

  const candidateUrls = [
    '',
    BACKEND_URL,
    'https://creator-forge-backend-jj1y.onrender.com',
    'https://creator-forge-backend.onrender.com'
  ].filter((v, i, a) => a.indexOf(v) === i)

  for (const baseUrl of candidateUrls) {
    try {
      const res = await fetch(`${baseUrl}/api/youtube/status?identifier=${encodeURIComponent(cleanId)}&email=${encodeURIComponent(cleanId)}`)
      if (res.ok) {
        const data = await res.json()
        if (data && data.connected && data.channel) {
          saveLocalYouTubeConnection(data.channel, data.tokens, cleanId)
          return data
        }
      }
    } catch (_) {}
  }
  return null
}

/**
 * Saves connected YouTube channel data locally scoped strictly to user
 */
export function saveLocalYouTubeConnection(channelData, tokens = null, userEmail = null) {
  if (typeof window === 'undefined') return
  try {
    const existing = getStoredYouTubeConnection(userEmail) || {}
    const resolvedTokens = tokens || existing.tokens || null
    const payload = {
      connected: true,
      channel: channelData,
      tokens: resolvedTokens,
      connectedAt: new Date().toISOString()
    }
    const key = getActiveUserKey(userEmail)
    localStorage.setItem(key, JSON.stringify(payload))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    window.dispatchEvent(new CustomEvent('forge_youtube_connected', { detail: payload }))
  } catch (_) {}
}

/**
 * Disconnects the YouTube channel strictly for the active user
 */
export async function disconnectYouTubeChannel(userEmail = null) {
  if (typeof window === 'undefined') return
  try {
    const key = getActiveUserKey(userEmail)
    localStorage.removeItem(key)
    localStorage.removeItem(STORAGE_KEY)

    let target = userEmail
    if (!target) {
      try {
        const raw = localStorage.getItem('forge_user_profile')
        if (raw) target = JSON.parse(raw).email || JSON.parse(raw).username
      } catch (_) {}
    }

    const params = new URLSearchParams()
    if (target) {
      params.set('identifier', target)
      params.set('email', target)
    }
    await fetch(`${BACKEND_URL}/api/youtube/disconnect?${params.toString()}`, { method: 'DELETE' }).catch(() => {})
    window.dispatchEvent(new CustomEvent('forge_youtube_disconnected'))
  } catch (_) {}
}

/**
 * Direct publishing and scheduling engine for YouTube videos via Google YouTube Data API v3.
 * Strictly communicates with real YouTube endpoints. Rejects text-only posts since YouTube Data API
 * only accepts video binaries (.mp4/.mov).
 */
export async function publishToYouTube({
  title,
  description = '',
  privacy = 'public',
  videoUrl = null,
  videoBase64 = null,
  publishAt = null,
  isShort = false
}) {
  const stored = getStoredYouTubeConnection()
  const tokens = stored?.tokens || {}

  if (!videoUrl && !videoBase64) {
    throw new Error('YouTube Data API v3 requires an actual video file (.mp4/.mov). Google does not support publishing text-only posts via API.')
  }

  const payload = {
    title,
    description,
    privacy,
    video_url: videoUrl,
    video_base64: videoBase64,
    publish_at: publishAt,
    is_short: isShort,
    access_token: tokens.access_token || null,
    refresh_token: tokens.refresh_token || null,
    identifier: stored?.channel?.id || 'default'
  }

  const candidateUrls = [
    BACKEND_URL,
    'https://creator-forge-backend.onrender.com',
    'https://creator-forge-backend-jj1y.onrender.com'
  ].filter(Boolean)

  let lastError = null
  for (const url of Array.from(new Set(candidateUrls))) {
    try {
      const res = await fetch(`${url}/api/youtube/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (res.ok) {
        const data = await res.json()
        if (data.result) {
          return data.result
        }
      } else {
        let errorDetail = `Status ${res.status}`
        try {
          const errJson = await res.json()
          errorDetail = errJson.detail || errJson.message || errorDetail
        } catch (_) {}
        lastError = new Error(errorDetail)
      }
    } catch (err) {
      lastError = err
    }
  }

  throw lastError || new Error('YouTube video upload failed. Please verify your video file and YouTube connection.')
}

