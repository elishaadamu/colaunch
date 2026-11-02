/**
 * Buffer GraphQL API Service Client
 * Connects directly to Buffer's production GraphQL API (https://api.buffer.com)
 * Handles account query, channel discovery, post creation (draft, queue, custom scheduled),
 * and live post synchronization.
 */

const BUFFER_GRAPHQL_ENDPOINT = 'https://api.buffer.com';

export function getBufferToken() {
  try {
    const custom = localStorage.getItem('forge_buffer_token');
    if (custom && custom.trim()) return custom.trim();
  } catch {}
  return import.meta.env.VITE_BUFFER_ACCESS_TOKEN || '';
}

export function setBufferToken(token) {
  try {
    if (token) {
      localStorage.setItem('forge_buffer_token', token.trim());
    } else {
      localStorage.removeItem('forge_buffer_token');
    }
  } catch {}
}

/**
 * Low-level GraphQL caller with automatic Bearer token injection
 */
export async function executeBufferGraphQL(query, variables = {}) {
  const token = getBufferToken();
  if (!token) {
    throw new Error('No Buffer access token available.');
  }

  const res = await fetch(BUFFER_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query,
      variables
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Buffer API HTTP ${res.status}: ${errorText}`);
  }

  const json = await res.json();
  if (json.errors && json.errors.length > 0) {
    const msg = json.errors.map(e => e.message).join(' | ');
    throw new Error(`Buffer GraphQL Error: ${msg}`);
  }

  return json.data;
}

/**
 * Retrieves the Buffer account profile and organization ID
 */
export async function fetchBufferAccount() {
  const query = `
    query GetBufferAccount {
      account {
        id
        email
        organizations {
          id
          name
        }
      }
    }
  `;

  const data = await executeBufferGraphQL(query);
  const account = data?.account;
  const primaryOrg = account?.organizations?.[0] || null;

  return {
    accountId: account?.id,
    email: account?.email,
    organizationId: primaryOrg?.id,
    organizationName: primaryOrg?.name,
    raw: account
  };
}

/**
 * Fetches all connected channels (YouTube, X, Instagram, LinkedIn, TikTok, Facebook) for the given organization
 */
export async function fetchBufferChannels(organizationId) {
  if (!organizationId) {
    const acct = await fetchBufferAccount();
    organizationId = acct.organizationId;
  }

  if (!organizationId) {
    return [];
  }

  const query = `
    query GetBufferChannels($input: ChannelsInput!) {
      channels(input: $input) {
        id
        name
        displayName
        service
        avatar
        isQueuePaused
      }
    }
  `;

  const data = await executeBufferGraphQL(query, {
    input: { organizationId }
  });

  return Array.isArray(data?.channels) ? data.channels : [];
}

/**
 * Retrieves existing posts from Buffer
 */
export async function fetchBufferPosts(organizationId) {
  if (!organizationId) {
    const acct = await fetchBufferAccount();
    organizationId = acct.organizationId;
  }

  if (!organizationId) {
    return [];
  }

  const query = `
    query GetBufferPosts($input: PostsInput!) {
      posts(input: $input) {
        edges {
          node {
            id
            text
            dueAt
            channelId
            status
          }
        }
      }
    }
  `;

  try {
    const data = await executeBufferGraphQL(query, {
      input: { organizationId }
    });

    const edges = data?.posts?.edges || [];
    return edges.map(e => e.node).filter(Boolean);
  } catch (err) {
    console.warn('[BufferApi] Fetch posts notice:', err);
    return [];
  }
}

/**
 * Creates a post in Buffer:
 * - mode: 'addToQueue' | 'shareNow' | 'customScheduled'
 * - saveToDraft: true (saves to draft status) | false
 * - dueAt: ISO 8601 timestamp string (required for customScheduled)
 * - schedulingType: 'automatic' | 'notification'
 */
export async function createBufferPost({
  channelId,
  text,
  mode = 'addToQueue',
  schedulingType = 'automatic',
  dueAt = null,
  saveToDraft = false,
  assets = []
}) {
  if (!channelId) {
    throw new Error('A valid channelId is required to create a Buffer post.');
  }

  const mutation = `
    mutation CreateBufferPost($input: CreatePostInput!) {
      createPost(input: $input) {
        ... on PostActionSuccess {
          post {
            id
            text
            dueAt
            channelId
            status
          }
        }
        ... on MutationError {
          message
        }
      }
    }
  `;

  const input = {
    channelId,
    text: text || '',
    mode: mode || 'addToQueue',
    schedulingType: schedulingType || 'automatic',
    needsApproval: false
  };

  if (saveToDraft) {
    input.saveToDraft = true;
  }

  if (mode === 'customScheduled' && dueAt) {
    input.dueAt = new Date(dueAt).toISOString();
  }

  if (Array.isArray(assets) && assets.length > 0) {
    input.assets = assets.map(a => {
      if (a.url) {
        return {
          image: {
            url: a.url
          }
        };
      }
      return a;
    });
  }

  const data = await executeBufferGraphQL(mutation, { input });
  const result = data?.createPost;

  if (result?.message && !result?.post) {
    throw new Error(`Buffer Post Failed: ${result.message}`);
  }

  return result?.post || null;
}

