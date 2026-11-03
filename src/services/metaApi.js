/**
 * Meta Graph API Client (Facebook Pages & Instagram Professional)
 * Handles token verification, page discovery, account linking,
 * and direct publishing for Facebook and Instagram.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://creator-forge-backend-jj1y.onrender.com'
const STORAGE_KEY = 'forge_meta_connection'

export function getStoredMetaConnection() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return null
}

export function saveStoredMetaConnection(data) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    window.dispatchEvent(new CustomEvent('forge_meta_connected', { detail: data }))
  } catch (_) {}
}

export function disconnectMetaChannel(channelType = 'all') {
  if (typeof window === 'undefined') return
  try {
    const current = getStoredMetaConnection() || {}
    if (channelType === 'facebook') {
      delete current.facebook
    } else if (channelType === 'instagram') {
      delete current.instagram
    } else {
      localStorage.removeItem(STORAGE_KEY)
      window.dispatchEvent(new CustomEvent('forge_meta_disconnected'))
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
    window.dispatchEvent(new CustomEvent('forge_meta_updated', { detail: current }))
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
export async function saveMetaSelection(payload) {
  try {
    await fetch(`${BACKEND_URL}/api/meta/save-selection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (e) {
    console.warn('[Meta API] Could not persist to backend database:', e)
  }

  // Update local storage
  const current = getStoredMetaConnection() || {}
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
  saveStoredMetaConnection(updated)
  return updated
}
