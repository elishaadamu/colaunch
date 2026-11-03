/**
 * Meta Graph API Client (Facebook Pages & Instagram Professional)
 * Handles token verification, page discovery, account linking,
 * and direct publishing for Facebook and Instagram.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://creator-forge-backend-jj1y.onrender.com'
const STORAGE_KEY = 'forge_meta_connection'

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
  return `forge_meta_connection_${clean}`
}

export function getStoredMetaConnection(userEmail = null) {
  if (typeof window === 'undefined') return null
  try {
    const key = getActiveUserKey(userEmail)
    const saved = localStorage.getItem(key)
    if (saved) return JSON.parse(saved)

    // Check if userProfile in localStorage has connection
    const raw = localStorage.getItem('forge_user_profile')
    if (raw) {
      const p = JSON.parse(raw)
      if (p.meta_connection?.facebook?.connected) return p.meta_connection
      // User is logged in and has NO connection -> return null
      return null
    }

    // Only for non-logged-in guest sessions:
    const fallback = localStorage.getItem(STORAGE_KEY)
    if (fallback) return JSON.parse(fallback)
  } catch (_) {}
  return null
}

/**
 * Checks remote backend for saved Meta / Facebook connection strictly for this user
 */
export async function checkRemoteMetaStatus(handle = null, username = null, email = null) {
  if (typeof window === 'undefined') return null
  const targetUser = (email || username || (handle !== 'default' ? handle : null) || '').trim()
  if (!targetUser) return null

  const candidateUrls = [
    '',
    BACKEND_URL,
    'https://creator-forge-backend-jj1y.onrender.com',
    'https://creator-forge-backend.onrender.com'
  ].filter((v, i, a) => a.indexOf(v) === i)

  for (const baseUrl of candidateUrls) {
    try {
      const q = new URLSearchParams()
      if (email) q.set('email', email)
      if (username) q.set('username', username)
      if (handle && handle !== 'default') q.set('handle', handle)
      const res = await fetch(`${baseUrl}/api/meta/connection?${q.toString()}`)
      if (res.ok) {
        const data = await res.json()
        if (data && data.success && data.connection) {
          saveStoredMetaConnection(data.connection, email || username)
          return data.connection
        }
      }
    } catch (_) {}
  }
  return null
}

export function saveStoredMetaConnection(data, userEmail = null) {
  if (typeof window === 'undefined') return
  try {
    const key = getActiveUserKey(userEmail)
    localStorage.setItem(key, JSON.stringify(data))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    window.dispatchEvent(new CustomEvent('forge_meta_connected', { detail: data }))
  } catch (_) {}
}

export async function disconnectMetaChannel(channelType = 'all', userEmail = null) {
  if (typeof window === 'undefined') return
  try {
    let target = userEmail
    if (!target) {
      try {
        const raw = localStorage.getItem('forge_user_profile')
        if (raw) target = JSON.parse(raw).email || JSON.parse(raw).username
      } catch (_) {}
    }

    const current = getStoredMetaConnection(target) || {}
    let updated = null
    if (channelType === 'facebook') {
      delete current.facebook
      updated = current
    } else if (channelType === 'instagram') {
      delete current.instagram
      updated = current
    } else {
      const key = getActiveUserKey(target)
      localStorage.removeItem(key)
      localStorage.removeItem(STORAGE_KEY)
      window.dispatchEvent(new CustomEvent('forge_meta_disconnected'))
    }

    if (updated) {
      saveStoredMetaConnection(updated, target)
      window.dispatchEvent(new CustomEvent('forge_meta_updated', { detail: updated }))
    }

    await fetch(`${BACKEND_URL}/api/meta/disconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: target, channel_type: channelType })
    }).catch(() => {})
  } catch (_) {}
}

/**
 * Verify a user access token and retrieve all Facebook Pages & Instagram accounts
 */
export async function verifyMetaToken(accessToken) {
  const token = (accessToken || '').trim()
  if (!token) throw new Error('Access token is required.')

  // Try via backend first
  try {
    const res = await fetch(`${BACKEND_URL}/api/meta/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: token })
    })
    if (res.ok) {
      const data = await res.json()
      if (data.success) return data
    }
  } catch (backendErr) {
    console.warn('[Meta API] Backend verify call failed, trying direct Meta Graph API fallback:', backendErr)
  }

  // Fallback: Direct Graph API inspection
  const userRes = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${encodeURIComponent(token)}`)
  const userData = await userRes.json()
  if (userData.error) {
    throw new Error(userData.error.message || 'Invalid Meta token.')
  }

  const accountsRes = await fetch(
    `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,category,access_token,tasks,instagram_business_account{id,username,name,profile_picture_url}&access_token=${encodeURIComponent(token)}`
  )
  const accountsData = await accountsRes.json()
  const pages = accountsData.data || []

  return {
    success: true,
    user: userData,
    pages,
    page_count: pages.length
  }
}

/**
 * Save selected Page & Instagram account credentials to backend profile & local cache
 */
export async function saveMetaSelection(payload, userEmail = null) {
  let activeEmail = userEmail || payload.email
  if (!activeEmail && typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('forge_user_profile')
      if (raw) activeEmail = JSON.parse(raw).email || JSON.parse(raw).username
    } catch (_) {}
  }

  const backendPayload = {
    ...payload,
    email: activeEmail || payload.email || '',
    username: payload.username || ''
  }

  try {
    await fetch(`${BACKEND_URL}/api/meta/save-selection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload)
    })
  } catch (e) {
    console.warn('[Meta API] Could not persist to backend database:', e)
  }

  // Update local storage
  const current = getStoredMetaConnection(activeEmail) || {}
  const updated = {
    ...current,
    facebook: {
      connected: true,
      pageId: payload.page_id,
      pageName: payload.page_name,
      accessToken: payload.page_access_token,
      category: payload.category || 'Page',
      tasks: payload.tasks || []
    },
    ...(payload.instagram_business_id ? {
      instagram: {
        connected: true,
        businessId: payload.instagram_business_id,
        username: payload.instagram_username || '@instagram',
        accessToken: payload.page_access_token
      }
    } : {})
  }
  saveStoredMetaConnection(updated, activeEmail)
  return updated
}

