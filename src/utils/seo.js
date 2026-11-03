/**
 * SEO & Dynamic Page Title / Metadata Manager for CoLaunch
 */

const DEFAULT_TITLE = 'CoLaunch | Turn your audience into a software business'
const DEFAULT_DESCRIPTION = 'Subscribe to the CoLaunch platform, launch an app your audience pays for and run it on autopilot, keeping 100 percent. Or let our done-for-you studio build and run it for a handful of creators.'
const DEFAULT_OG_DESCRIPTION = 'Subscribe to the platform and run your app on autopilot, or let our studio build and run it for you.'
const DEFAULT_IMAGE = '/og-image.svg'

export function updatePageSEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  keywords,
}) {
  const fullTitle = title ? (title.includes('CoLaunch') ? title : `${title} | CoLaunch`) : DEFAULT_TITLE

  // Update title
  document.title = fullTitle

  // Helper to set or create meta tag
  const setMetaTag = (attrName, attrValue, content) => {
    let element = document.querySelector(`meta[${attrName}="${attrValue}"]`)
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute(attrName, attrValue)
      document.head.appendChild(element)
    }
    element.setAttribute('content', content)
  }

  // Update primary meta tags
  setMetaTag('name', 'title', fullTitle)
  setMetaTag('name', 'description', description)
  if (keywords) setMetaTag('name', 'keywords', keywords)

  // Update Open Graph tags
  const ogDesc = description === DEFAULT_DESCRIPTION ? DEFAULT_OG_DESCRIPTION : description
  setMetaTag('property', 'og:title', fullTitle)
  setMetaTag('property', 'og:description', ogDesc)
  setMetaTag('property', 'og:image', image.startsWith('http') ? image : window.location.origin + image)
  if (url || typeof window !== 'undefined') {
    setMetaTag('property', 'og:url', url || window.location.href)
  }

  // Update Twitter Card tags
  setMetaTag('name', 'twitter:title', fullTitle)
  setMetaTag('name', 'twitter:description', ogDesc)
  setMetaTag('name', 'twitter:image', image.startsWith('http') ? image : window.location.origin + image)
}

/**
 * Route-based SEO metadata resolver
 */
export function getRouteSEO(pathname, step, creatorData) {
  const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/')

  if (path.startsWith('/join/')) {
    const handle = path.replace('/join/', '').replace(/\/$/, '')
    return {
      title: `Join @${handle}'s Community & Early Access`,
      description: `Join the official community and get early access to exclusive software tools built with @${handle}.`,
    }
  }

  if (path.startsWith('/portal') || path.startsWith('/co-launch/')) {
    return {
      title: 'Partner Co-Founder Portal — Creator Studio Agreement & Roadmap',
      description: 'Review your tailored software concepts, 50/50 revenue split dashboard, and launch roadmap with CoLaunch Studio.',
    }
  }

  if (path.startsWith('/preorder')) {
    const creatorName = creatorData?.name || creatorData?.handle || 'Creator'
    return {
      title: `VIP Early Access & Pre-Order — ${creatorData?.productName || 'Exclusive Software Launch'}`,
      description: `Lock in founder pricing and early access to ${creatorData?.productName || 'our new software product'} co-built with ${creatorName}.`,
    }
  }

  if (path.startsWith('/survey') || path.startsWith('/research')) {
    const creatorName = creatorData?.name || creatorData?.handle || 'Creator'
    return {
      title: `Audience Discovery & Research Survey — ${creatorName}`,
      description: `Help shape our next software tool! Share your biggest workflow challenges in 60 seconds.`,
    }
  }

  if (path.startsWith('/follow-up-crm') || path === '/crm') {
    return {
      title: 'Creator Follow-Up CRM & Inbound Reply Intelligence',
      description: 'Directory list, audience score breakdown, AI sentiment analysis, and multi-channel response tracking for partner creators.',
    }
  }

  if (path.startsWith('/admin-error-log') || path.startsWith('/error-log') || path === '/errors') {
    return {
      title: 'Pipeline Intelligence & Exception Logs Dashboard',
      description: 'Real-time error monitoring, scraper audit trails, and API diagnostics for CoLaunch platform.',
    }
  }

  if (path.startsWith('/launch') || path.startsWith('/creator-launch')) {
    return {
      title: 'Operator Master Studio — Acquisition Engine & Launch OS',
      description: 'End-to-end creator discovery, audience intelligence, autonomous outreach, and 50/50 venture launch pipeline.',
    }
  }

  if (path.startsWith('/ops')) {
    return {
      title: 'Operator Pipeline & Acquisition Engine',
      description: 'Internal operations panel for creator discovery, scraping verification, and outreach dispatch.',
    }
  }

  if (path === '/dashboard' || step === 'dashboard') {
    return {
      title: `${creatorData?.name || 'Creator'} Studio Dashboard`,
      description: `Manage your software product, early access members, analytics, and marketing launch pack in CoLaunch.`,
    }
  }

  if (path === '/login' || step === 'login') {
    return {
      title: 'Sign In to CoLaunch',
      description: 'Log into your creator studio account to access your product dashboard, analytics, and roadmap.',
    }
  }

  if (path === '/signup' || step === 'signup') {
    return {
      title: 'Create Your Account — CoLaunch',
      description: 'Join CoLaunch to turn your audience into a high-growth software business with 50/50 venture backing.',
    }
  }

  // Onboarding Steps
  const stepTitles = {
    'welcome': {
      title: 'CoLaunch | Turn your audience into a software business',
      description: 'Subscribe to the CoLaunch platform, launch an app your audience pays for and run it on autopilot, keeping 100 percent. Or let our done-for-you studio build and run it for a handful of creators.',
    },
    'creator-link': {
      title: 'Connect Your Social Channel — Audience Discovery',
      description: 'Paste your YouTube, Instagram, or TikTok profile to analyze audience signals and extract SaaS opportunities.',
    },
    'analyzing': {
      title: 'AI Audience Intelligence & Pain Point Analysis',
      description: 'Deep AI research analyzing comments, recurring questions, and monetization signals across your community.',
    },
    'blueprint': {
      title: 'Engineered Product Blueprint & SaaS Concepts',
      description: 'Review your personalized software architecture, features list, pricing model, and competitive moat.',
    },
    'preview': {
      title: 'Interactive Application Mockup Preview',
      description: 'Explore an interactive functional mockup of your custom SaaS application designed for your audience.',
    },
    'building': {
      title: 'Generating MVP Build & Launch Architecture',
      description: 'Architecting frontend, backend, database schema, and Stripe billing integrations for your software.',
    },
    'pre-finish': {
      title: 'Finalizing Co-Founder Launch Package',
      description: 'Preparing your promotional assets, email announcement templates, and early access landing page.',
    },
    'celebration': {
      title: 'Software Suite Ready — Launch with CoLaunch',
      description: 'Your customized software product and launch suite are ready. Take full ownership of your SaaS venture.',
    },
  }

  return stepTitles[step] || {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  }
}
