/**
 * Channel Study & Autonomous Asset Generation Service
 * Automatically studies a newly connected YouTube channel or Facebook Page,
 * extracts real videos, detects niche & brand parameters,
 * and synthesizes the landing page, daily content calendar, and studio assets.
 */

import { fetchCreatorYouTubeVideos } from './scraper'
import { saveDashboardSection } from './dashboardApi'

/**
 * Returns true if the user has an authenticated or verified social channel.
 * Returns false if the user directly signed up / signed in without linking a channel.
 */
export function isChannelConnectedOrConfigured(creatorData, youtubeConn, metaConn) {
  if (youtubeConn?.connected || creatorData?.youtube_connected) return true
  if (metaConn?.facebook?.connected || creatorData?.facebook_connected) return true
  if (metaConn?.instagram?.connected || creatorData?.instagram_connected) return true

  const handle = creatorData?.handle || ''
  const hasRealHandle = handle && handle !== '@creator' && handle !== 'default' && handle !== '@'
  const hasRealPosts = Array.isArray(creatorData?.recentPosts) && creatorData.recentPosts.length > 0
  const hasRealBlueprint = Boolean(creatorData?.blueprint?.name && !creatorData?.blueprint?.name?.includes('Creator Academy'))

  return Boolean(hasRealHandle && (hasRealPosts || hasRealBlueprint))
}

/**
 * Infer primary niche from channel title, description, and video titles
 */
function inferNiche(title = '', description = '', videos = []) {
  const text = `${title} ${description} ${videos.map(v => v.title).join(' ')}`.toLowerCase()
  if (/tech|code|programming|developer|software|gadget|ai|hardware|laptop|pc|mobile/i.test(text)) {
    return 'Tech, Hardware & Developer Tools'
  }
  if (/sport|fitness|workout|gym|athlete|football|soccer|basketball|training/i.test(text)) {
    return 'Sports, Fitness & Athletic Performance'
  }
  if (/game|gaming|esports|streamer|playstation|xbox|nintendo|pc gaming/i.test(text)) {
    return 'Gaming & Entertainment'
  }
  if (/crypto|finance|money|invest|stocks|trading|business|ecommerce|marketing/i.test(text)) {
    return 'Business, Finance & Entrepreneurship'
  }
  if (/design|art|creative|photo|video|animation|music|film/i.test(text)) {
    return 'Creative Design & Visual Arts'
  }
  return 'Digital Content Creation & Media'
}

/**
 * Studies the connected channel, retrieves real videos, builds landing page assets & 7-day content calendar
 */
export async function studyConnectedChannelAndBuildAssets({
  channel,
  platform = 'youtube',
  creatorData = {},
  userProfile = null,
  updateCreator = null,
  saveDashboardData = null
}) {
  const channelTitle = channel?.title || channel?.name || creatorData?.name || 'Creator'
  const rawHandle = channel?.customUrl || channel?.handle || creatorData?.handle || `@${channelTitle.replace(/\s+/g, '').toLowerCase()}`
  const customUrl = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`
  const cleanHandle = customUrl.replace(/^@+/, '')
  const avatar = channel?.thumbnail || channel?.avatar || creatorData?.avatar || ''
  const subscriberCount = channel?.subscriberCount || creatorData?.subscribers || '1,000'
  const videoCount = channel?.videoCount || creatorData?.video_count || '12'

  // 1. Fetch real uploaded videos from the connected channel
  let realVideos = []
  const studyTarget = userProfile?.email || cleanHandle
  try {
    realVideos = await fetchCreatorYouTubeVideos(studyTarget, 8, true)
  } catch (err) {
    console.warn('[Channel Study] Failed fetching videos via scraper, checking channel cache:', err)
  }

  if ((!realVideos || realVideos.length === 0) && Array.isArray(channel?.recent_videos) && channel.recent_videos.length > 0) {
    realVideos = channel.recent_videos
  }

  // Fallback if brand-new channel with no uploads yet
  if (!realVideos || realVideos.length === 0) {
    realVideos = [
      {
        id: 'real-v1',
        title: `Welcome to ${channelTitle} — Official Channel Launch`,
        url: `https://www.youtube.com/${customUrl}`,
        views: `${subscriberCount} subscribers`,
        thumbnail: avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
        publishedAt: 'Recent'
      }
    ]
  }

  // 2. Infer niche and craft tailored software product
  const detectedNiche = inferNiche(channelTitle, channel?.description || '', realVideos)
  const productName = `${channelTitle.split(' ')[0]} Launchpad`

  const blueprint = {
    name: productName,
    tagline: `Exclusive Tools, Community & Resources by ${channelTitle}`,
    type: 'Web App',
    preview: 'webapp',
    niche: detectedNiche,
    features: [
      { name: 'Video Vault', desc: `Ad-free high-bitrate archive of ${channelTitle}'s premium series` },
      { name: 'Creator Toolkits', desc: 'Downloadable templates, workflows, and blueprints' },
      { name: 'VIP Community Hub', desc: 'Direct access chat with founder & members' },
      { name: 'Live AMA Sprints', desc: 'Monthly live coding, strategy, and Q&A broadcasts' }
    ],
    pricing: {
      monthly: 19,
      annual: 190,
      tierName: 'VIP Founder Access'
    }
  }

  // 3. Build 7-Day Campaign Posts ("What to post on that day") based on real videos
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const topVideoTitle = realVideos[0]?.title || 'Latest Video'
  const secondVideoTitle = realVideos[1]?.title || 'Featured Highlight'

  const campaignPosts = dayNames.map((dName, idx) => {
    let title = ''
    let format = 'Video'
    let channelName = 'YouTube'
    let strategy = 'LAUNCH'
    let caption = ''

    if (idx === 0) {
      title = `Announcement: Turning ${topVideoTitle} Into A Live Solution`
      format = 'VIDEO'
      channelName = 'YouTube'
      strategy = 'LAUNCH'
      caption = `Big news everyone! Based on your comments on "${topVideoTitle}", I have officially engineered ${productName}. Check the link in my bio for early founder access.`
    } else if (idx === 1) {
      title = `Behind The Scenes: How We Built ${productName}`
      format = 'REEL'
      channelName = 'Instagram'
      strategy = 'VALUE'
      caption = `A quick behind-the-scenes look at the technical architecture powering ${productName}. Zero fluff, pure engineering.`
    } else if (idx === 2) {
      title = `Community Q&A: 3 Workflows You Asked For in ${secondVideoTitle}`
      format = 'SHORT'
      channelName = 'YouTube'
      strategy = 'ENGAGEMENT'
      caption = `Answering the top 3 community questions from ${secondVideoTitle}. Watch until the end for the secret feature reveal!`
    } else if (idx === 3) {
      title = `Founder Playbook & Live Code Teaser`
      format = 'POST'
      channelName = 'X'
      strategy = 'PROOF'
      caption = `Building in public: Here is what we learned launching ${productName} this week. What features do you want to see next?`
    } else if (idx === 4) {
      title = `VIP Member Spotlight & Interactive AMA`
      format = 'COMMUNITY'
      channelName = 'YouTube'
      strategy = 'COMMUNITY'
      caption = `Shoutout to our founding members! Dropping the exclusive weekend module inside the portal today.`
    } else if (idx === 5) {
      title = `Weekend Speed Sprint: 3 Mistakes Creators Make`
      format = 'VIDEO'
      channelName = 'TikTok'
      strategy = 'EDUCATION'
      caption = `Stop doing it the hard way. Here is the modern approach we use inside ${productName}.`
    } else {
      title = `Weekly Sprint Recap & Next Drop Preview`
      format = 'BROADCAST'
      channelName = 'Email'
      strategy = 'RETENTION'
      caption = `Sunday briefing for the ${channelTitle} community. New features rolling out this week.`
    }

    return {
      id: `camp-${idx + 1}`,
      dayIndex: idx,
      dayName: dName.slice(0, 3),
      fullDayName: dName,
      channel: channelName,
      format,
      title,
      caption,
      strategy,
      status: 'Scheduled',
      time: idx % 2 === 0 ? '11:30 AM' : '2:00 PM',
      videoRefId: realVideos[idx % realVideos.length]?.id,
      videoThumbnail: realVideos[idx % realVideos.length]?.thumbnail
    }
  })

  // 4. Synthesize complete updated creator data
  const updatedCreatorData = {
    ...creatorData,
    name: channelTitle,
    creator_name: channelTitle,
    channel_title: channelTitle,
    handle: customUrl,
    youtube_handle: customUrl,
    avatar: avatar || creatorData?.avatar,
    avatarUrl: avatar || creatorData?.avatarUrl,
    subscribers: String(subscriberCount),
    video_count: String(videoCount),
    youtube_connected: platform === 'youtube' || creatorData?.youtube_connected,
    youtube_channel_id: channel?.id || creatorData?.youtube_channel_id,
    facebook_connected: platform === 'facebook' || creatorData?.facebook_connected,
    niche: detectedNiche,
    productName,
    blueprint,
    recentPosts: realVideos
  }

  // 5. Update local state
  if (updateCreator) {
    updateCreator(updatedCreatorData)
  }

  try {
    localStorage.setItem('forge_creator_data', JSON.stringify(updatedCreatorData))
    localStorage.setItem(`forge_campaign_posts_${cleanHandle}`, JSON.stringify(campaignPosts))
  } catch (_) {}

  // 6. Persist permanently to MongoDB Atlas
  const username = userProfile?.username || cleanHandle || 'default'
  const payloadToSave = {
    creator_data: updatedCreatorData,
    calendar_data: {
      campaign_posts: campaignPosts,
      bonus_xp: 150,
      claimed_quests: { 'q-connect': true },
      active_goal: 'launch',
      synced_at: new Date().toISOString()
    },
    youtube_connection: {
      connected: true,
      channel: {
        id: channel?.id,
        title: channelTitle,
        customUrl,
        thumbnail: avatar,
        subscriberCount,
        videoCount
      },
      recent_videos: realVideos
    }
  }

  if (saveDashboardData) {
    saveDashboardData('all', payloadToSave)
  } else {
    saveDashboardSection(username, cleanHandle, 'all', payloadToSave)
  }

  return {
    creatorData: updatedCreatorData,
    campaignPosts,
    videos: realVideos
  }
}

