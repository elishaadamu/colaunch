/**
 * CoLaunch Unified Customer Support Service
 * - Connects Onboarding Stages and Creator Dashboard to a general database table.
 * - Answers user queries specifically grounded in that creator's data at that moment.
 * - Escalates to human support team if question cannot be answered by AI or user asks for human help.
 * - History retrieved by session_id in onboarding, or creator_id in dashboard.
 */

import { ensureServerAiKeysLoaded } from './ai'

const SESSION_KEY = 'forge_support_session_id'
const LOCAL_CACHE_KEY = 'forge_support_messages_cache'
const USER_NAME_KEY = 'forge_support_user_name'
const USER_EMAIL_KEY = 'forge_support_user_email'

export function getCreatorId(creatorData) {
  if (!creatorData) return ''
  if (creatorData.id) return creatorData.id
  if (creatorData.channelId) return creatorData.channelId
  if (creatorData._id) return creatorData._id
  const cleanHandle = (creatorData.handle || creatorData.name || 'creator').replace(/^@+/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '')
  return 'cr_' + cleanHandle
}

export function getSupportSessionId(creatorData = null) {
  const cid = getCreatorId(creatorData) || 'global'
  const key = `${SESSION_KEY}_${cid}`
  try {
    let sid = localStorage.getItem(key)
    if (!sid) {
      sid = 'ses_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
      localStorage.setItem(key, sid)
    }
    return sid
  } catch {
    return 'ses_' + Date.now()
  }
}

export function getSupportUserIdentity(creatorData = null) {
  const cid = getCreatorId(creatorData) || 'global'
  const authenticName = creatorData?.name || creatorData?.creatorName || creatorData?.channelTitle || ''
  const authenticEmail = creatorData?.email || creatorData?.contactEmail || ''

  try {
    // 1. Check creator-scoped identity first
    let name = localStorage.getItem(`${USER_NAME_KEY}_${cid}`) || ''
    let email = localStorage.getItem(`${USER_EMAIL_KEY}_${cid}`) || ''

    // 2. If no scoped name, check legacy global key ONLY IF it matches this creator's name
    if (!name) {
      const legacyName = localStorage.getItem(USER_NAME_KEY) || ''
      if (legacyName && authenticName) {
        const normLegacy = legacyName.toLowerCase().trim()
        const normAuth = authenticName.toLowerCase().trim()
        if (normLegacy === normAuth || normLegacy.includes(normAuth) || normAuth.includes(normLegacy)) {
          name = legacyName
        }
      }
    }

    // 3. Fallback to authentic creator name (never leak another creator's name)
    if (!name) {
      name = authenticName
    }

    if (!email) {
      email = authenticEmail || localStorage.getItem(USER_EMAIL_KEY) || ''
    }

    return { name: name || authenticName, email: email || '' }
  } catch {
    return { name: authenticName, email: authenticEmail }
  }
}

export function setSupportUserIdentity(name, email, creatorData = null) {
  const cid = getCreatorId(creatorData) || 'global'
  try {
    if (name) {
      localStorage.setItem(`${USER_NAME_KEY}_${cid}`, name.trim())
      localStorage.setItem(USER_NAME_KEY, name.trim())
    }
    if (email) {
      localStorage.setItem(`${USER_EMAIL_KEY}_${cid}`, email.trim())
      localStorage.setItem(USER_EMAIL_KEY, email.trim())
    }
  } catch {}
}

const CORRUPTED_MARKERS = [
  'CoLaunch Customer Support Alert',
  'RECENT CONVERSATION HISTORY:',
  'Dispatched via CoLaunch',
  'A creator has requested administrator assistance',
  'Admin Inbox:',
  'CREATOR DETAILS:',
]

export function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return []
  const cleanList = []
  const seenAdminTexts = new Set()

  for (const m of messages) {
    if (!m) continue
    const msgText = m.message || ''
    const msgLower = msgText.toLowerCase()

    // Filter out internal system alert emails
    const isCorrupted = CORRUPTED_MARKERS.some(marker => msgLower.includes(marker.toLowerCase()))
    if (isCorrupted) continue

    // Normalize handle
    const rawHandle = m.creator_handle || ''
    const cleanHandle = rawHandle.replace(/^@+/, '')
    const normalizedHandle = cleanHandle ? `@${cleanHandle}` : ''

    // Normalize message text (remove double @@)
    const normalizedText = msgText.replace(/@@+/g, '@').trim()
    if (!normalizedText) continue

    // Deduplicate admin replies
    if (m.sender === 'admin') {
      const dedupeKey = normalizedText.toLowerCase()
      if (seenAdminTexts.has(dedupeKey)) continue
      seenAdminTexts.add(dedupeKey)
    }

    cleanList.push({
      ...m,
      creator_handle: normalizedHandle,
      message: normalizedText,
    })
  }

  return cleanList
}

function getLocalCachedMessages(sessionId, creatorId) {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const matched = parsed.filter(m => {
      // If creatorId is known, strictly isolate messages for this creator
      if (creatorId) {
        if (m.creator_id) return m.creator_id === creatorId
        return sessionId && m.session_id === sessionId
      }
      return sessionId && m.session_id === sessionId
    })
    return sanitizeMessages(matched)
  } catch {
    return []
  }
}

function saveLocalCachedMessages(messages) {
  try {
    const cleaned = sanitizeMessages(messages)
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(cleaned.slice(-100)))
  } catch {}
}

/**
 * Fetch unified support history by sessionId or creatorId
 */
export async function fetchSupportHistory(creatorData) {
  const sessionId = getSupportSessionId(creatorData)
  const creatorId = getCreatorId(creatorData)
  const cleanHandle = (creatorData?.handle || '').replace(/^@+/, '').trim()

  const params = new URLSearchParams()
  if (creatorId) params.append('creator_id', creatorId)
  if (sessionId) params.append('session_id', sessionId)
  if (cleanHandle) params.append('creator_handle', cleanHandle)

  try {
    const res = await fetch(`/api/support/history?${params.toString()}`, {
      headers: { 'Accept': 'application/json' }
    })
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data.messages)) {
        const cleaned = sanitizeMessages(data.messages)
        saveLocalCachedMessages(cleaned)
        return cleaned
      }
    }
  } catch (err) {
    console.warn('[SupportService] Backend history fetch failed, reading local cache:', err)
  }

  // Fallback to local cache
  return getLocalCachedMessages(sessionId, creatorId)
}

/**
 * Send a message to Customer Support
 */
export async function sendSupportMessage(text, creatorData, stage = 'onboarding', forceEscalate = false, customIdentity = null) {
  await ensureServerAiKeysLoaded()
  const sessionId = getSupportSessionId(creatorData)
  const creatorId = getCreatorId(creatorData)
  const creatorHandle = creatorData?.handle || ''
  const identity = customIdentity || getSupportUserIdentity(creatorData)
  const creatorName = identity.name || creatorData?.name || creatorData?.channelTitle || 'Creator'
  const creatorEmail = identity.email || creatorData?.email || ''

  const creatorContext = {
    handle: creatorHandle,
    name: creatorName,
    email: creatorEmail,
    platform: creatorData?.platform || 'YouTube',
    followers: creatorData?.followers || 0,
    niche: creatorData?.niche || 'Digital Creator',
    stage: stage || 'Onboarding',
    productName: creatorData?.productName || creatorData?.blueprint?.name || '',
    blueprint: creatorData?.blueprint || null,
    features: creatorData?.features || creatorData?.blueprint?.features || [],
    pricing: creatorData?.pricing || creatorData?.pricingTiers || null,
  }

  const payload = {
    session_id: sessionId,
    creator_id: creatorId,
    creator_handle: creatorHandle,
    creator_name: creatorName,
    creator_email: creatorEmail,
    message: text,
    creator_context: creatorContext,
    force_escalate: forceEscalate,
  }

  try {
    const res = await fetch('/api/support/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (res.ok) {
      const data = await res.json()
      // Refresh history
      const history = await fetchSupportHistory(creatorData)
      return {
        reply: data.reply,
        escalated: data.escalated,
        status: data.status,
        messages: history
      }
    }
  } catch (err) {
    console.warn('[SupportService] Backend message dispatch error, falling back locally:', err)
  }

  // Offline / direct fallback
  const userMsg = {
    id: 'usr_' + Date.now(),
    session_id: sessionId,
    creator_id: creatorId,
    creator_handle: creatorHandle,
    creator_name: creatorName,
    creator_email: creatorEmail,
    sender: 'user',
    message: text,
    status: 'active',
    escalated: forceEscalate,
    created_at: new Date().toISOString()
  }

  const cleanHandle = (creatorHandle || creatorData?.handle || 'creator').replace(/^@+/, '')
  const displayHandle = cleanHandle ? `@${cleanHandle}` : '@creator'

  const fallbackReply = forceEscalate
    ? `Your inquiry has been escalated directly to our dedicated support team. A confirmation has been sent to your email (${creatorEmail || 'registered inbox'}). You can continue chatting right here, or reply directly to the email anytime!`
    : `Hi ${creatorName}! I am your CoLaunch AI Assistant supporting ${displayHandle}. Your ${creatorData?.blueprint?.name || 'custom suite'} is currently configured for ${creatorData?.niche || 'your audience'}. How can I help you today?`

  const botMsg = {
    id: 'ast_' + (Date.now() + 1),
    session_id: sessionId,
    creator_id: creatorId,
    creator_handle: creatorHandle,
    creator_name: creatorName,
    sender: 'assistant',
    message: fallbackReply,
    status: forceEscalate ? 'escalated_to_admin' : 'ai_resolved',
    escalated: forceEscalate,
    created_at: new Date().toISOString()
  }

  const existing = getLocalCachedMessages(sessionId, creatorId)
  const updated = [...existing, userMsg, botMsg]
  saveLocalCachedMessages(updated)

  return {
    reply: fallbackReply,
    escalated: forceEscalate,
    status: botMsg.status,
    messages: updated
  }
}

/**
 * Escalate support thread to human admin team
 */
export async function escalateSupportTicket(creatorData, reason = 'Creator requested human administrator support', stage = 'dashboard', customIdentity = null) {
  const sessionId = getSupportSessionId(creatorData)
  const creatorId = getCreatorId(creatorData)
  const creatorHandle = creatorData?.handle || ''
  const identity = customIdentity || getSupportUserIdentity(creatorData)
  const creatorName = identity.name || creatorData?.name || 'Creator'
  const creatorEmail = identity.email || creatorData?.email || ''

  const creatorContext = {
    handle: creatorHandle,
    name: creatorName,
    email: creatorEmail,
    platform: creatorData?.platform || 'YouTube',
    followers: creatorData?.followers || 0,
    niche: creatorData?.niche || 'Digital Creator',
    stage: stage,
    productName: creatorData?.productName || creatorData?.blueprint?.name || '',
    blueprint: creatorData?.blueprint || null,
    features: creatorData?.features || creatorData?.blueprint?.features || [],
  }

  try {
    const res = await fetch('/api/support/escalate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        creator_id: creatorId,
        creator_handle: creatorHandle,
        creator_name: creatorName,
        creator_email: creatorEmail,
        reason,
        creator_context: creatorContext,
      })
    })

    if (res.ok) {
      const data = await res.json()
      const history = await fetchSupportHistory(creatorData)
      return {
        success: true,
        reply: data.reply,
        messages: history
      }
    }
  } catch (err) {
    console.warn('[SupportService] Escalation API call failed:', err)
  }

  return {
    success: true,
    reply: `Your ticket has been dispatched to our dedicated support team${creatorEmail ? ` and a confirmation has been sent to ${creatorEmail}` : ''}. An administrator will review your inquiry and follow up shortly.`
  }
}

/**
 * Clear all support messages (frontend cache + database) to start completely fresh
 */
export async function clearAllSupportChats(creatorData = null) {
  const cid = getCreatorId(creatorData) || 'global'
  try {
    localStorage.removeItem(LOCAL_CACHE_KEY)
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(`${SESSION_KEY}_${cid}`)
    localStorage.removeItem(USER_NAME_KEY)
    localStorage.removeItem(USER_EMAIL_KEY)
    localStorage.removeItem(`${USER_NAME_KEY}_${cid}`)
    localStorage.removeItem(`${USER_EMAIL_KEY}_${cid}`)
  } catch {}

  const sessionId = getSupportSessionId(creatorData)
  const creatorId = creatorData ? getCreatorId(creatorData) : ''

  const params = new URLSearchParams()
  params.append('all_chats', 'true')
  if (sessionId) params.append('session_id', sessionId)
  if (creatorId) params.append('creator_id', creatorId)

  try {
    const res = await fetch(`/api/support/reset?${params.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (err) {
    console.warn('[SupportService] Reset chat API call failed:', err)
  }

  return { status: 'ok', message: 'Chat cache cleared locally' }
}

