/**
 * Dashboard MongoDB Persistence API Client
 * Connects all dashboard modules (Accounts, Content Calendar, Studio, Community, Marketing, Products)
 * directly to MongoDB Atlas user_profiles so that state is persisted in the database,
 * not dependent on localStorage.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://creator-forge-backend-jj1y.onrender.com'

const CANDIDATE_URLS = [
  '',
  BACKEND_URL,
  'https://creator-forge-backend-jj1y.onrender.com',
  'https://creator-forge-backend.onrender.com'
].filter((v, i, a) => a.indexOf(v) === i)

/**
 * Fetch all dashboard state directly from MongoDB Atlas for the user
 */
export async function fetchDashboardData(username = '', handle = '') {
  const q = new URLSearchParams()
  if (username) q.set('username', username)
  if (handle) q.set('handle', handle)
  const qs = q.toString() ? `?${q.toString()}` : ''

  for (const baseUrl of CANDIDATE_URLS) {
    try {
      const res = await fetch(`${baseUrl}/api/dashboard/data${qs}`, {
        headers: { 'Accept': 'application/json' }
      })
      if (res.ok) {
        const data = await res.json()
        if (data && data.status === 'success') {
          return data
        }
      }
    } catch (_) {}
  }
  return null
}

/**
 * Persist a dashboard section directly to MongoDB Atlas
 * @param {string} username
 * @param {string} handle
 * @param {string} section - 'calendar' | 'studio' | 'community' | 'marketing' | 'products' | 'accounts' | 'creator' | 'all'
 * @param {Object} data
 */
export async function saveDashboardSection(username = '', handle = '', section, data) {
  if (!section || !data) return false

  const payload = {
    username: username || '',
    handle: handle || 'default',
    section,
    data
  }

  for (const baseUrl of CANDIDATE_URLS) {
    try {
      const res = await fetch(`${baseUrl}/api/dashboard/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        const result = await res.json()
        if (result && result.status === 'success') {
          return true
        }
      }
    } catch (_) {}
  }
  return false
}
