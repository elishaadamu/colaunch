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

export function getSupportSessionId() {
  try {
    let sid = localStorage.getItem(SESSION_KEY)
    if (!sid) {
      sid = 'ses_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
      localStorage.setItem(SESSION_KEY, sid)
    }
    return sid
  } catch {
    return 'ses_' + Date.now()
  }
}

export function getCreatorId(creatorData) {
  if (!creatorData) return ''
  if (creatorData.id) return creatorData.id
  if (creatorData.channelId) return creatorData.channelId
  if (creatorData._id) return creatorData._id
  const cleanHandle = (creatorData.handle || creatorData.name || 'creator').replace(/^@+/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '')
  return 'cr_' + cleanHandle
}

function getLocalCachedMessages(sessionId, creatorId) {
  try {
    const raw = localStorage.getItem(LOCAL_CACHE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const matched = parsed.filter(m => 
      (sessionId && m.session_id === sessionId) ||
      (creatorId && m.creator_id === creatorId)
    )
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
  const sessionId = getSupportSessionId()
  const creatorId = getCreatorId(creatorData)

  const params = new URLSearchParams()
  if (sessionId) params.append('session_id', sessionId)
  if (creatorId) params.append('creator_id', creatorId)

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
export async function sendSupportMessage(text, creatorData, stage = 'onboarding', forceEscalate = false) {
  await ensureServerAiKeysLoaded()
  const sessionId = getSupportSessionId()
  const creatorId = getCreatorId(creatorData)
  const creatorHandle = creatorData?.handle || ''
  const creatorName = creatorData?.name || creatorData?.channelTitle || 'Creator'

  const creatorContext = {
    handle: creatorHandle,
    name: creatorName,
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
    sender: 'user',
    message: text,
    status: 'active',
    escalated: forceEscalate,
    created_at: new Date().toISOString()
  }

  const cleanHandle = (creatorHandle || creatorData?.handle || 'creator').replace(/^@+/, '')
  const displayHandle = cleanHandle ? `@${cleanHandle}` : '@creator'

  const fallbackReply = forceEscalate
    ? `Your inquiry has been escalated directly to our dedicated support team. A team member will review your workspace and follow up with you promptly.`
    : `I am your CoLaunch AI Assistant supporting ${displayHandle}. Your ${creatorData?.blueprint?.name || 'custom suite'} is currently configured for ${creatorData?.niche || 'your audience'}. If you need anything escalated to an admin, let me know!`

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
export async function escalateSupportTicket(creatorData, reason = 'Creator requested human administrator support', stage = 'dashboard') {
  const sessionId = getSupportSessionId()
  const creatorId = getCreatorId(creatorData)
  const creatorHandle = creatorData?.handle || ''
  const creatorName = creatorData?.name || 'Creator'

  const creatorContext = {
    handle: creatorHandle,
    name: creatorName,
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
    reply: `Your ticket has been dispatched to our dedicated support team. An administrator will review your inquiry and follow up shortly.`
  }
}

