/**
 * landingCopy.js
 *
 * Dedicated generator and validator for SaaS Demand-Test Landing Page copy.
 * Generates conversion-focused SaaS copy strictly grounded in:
 * - blueprint.name
 * - blueprint.tool_summary / toolSummary
 * - blueprint.target_audience / targetAudience
 * - blueprint.monthly_price / monthlyPrice
 * - blueprint.features
 * - audience intelligence signals (pain points, tool requests)
 *
 * Enforces strict honesty:
 * - NO invented statistics, ratings, press logos, or testimonials
 * - NO fake follower or user counts
 * - NO courses, masterclasses, or video vault copy
 * - Fallback to deterministic copy if AI generation or validation fails
 */

import { clampPrice } from '../utils/subscriptionRevenue.js';

export const LANDING_COPY_SCHEMA_VERSION = 2;

/**
 * Builds a deterministic, reliable SaaS copy set from blueprint and creator data.
 * Guarantees zero empty sections and 100% adherence to product specs.
 */
export function buildDeterministicLandingCopy(creatorData = {}, blueprint = {}) {
  const name = blueprint.name || creatorData.productName || 'Software Workspace';
  const toolSummary = blueprint.tool_summary || blueprint.toolSummary || blueprint.description || 'Dedicated interactive software tool built to streamline your workflow';
  const targetAudience = blueprint.target_audience || blueprint.targetAudience || creatorData.target_audience || 'Action-driven professionals and community members';
  const price = clampPrice(blueprint.monthly_price || blueprint.monthlyPrice || creatorData.monthly_price || 19);
  const rawFeatures = Array.isArray(blueprint.features) && blueprint.features.length > 0
    ? blueprint.features
    : Array.isArray(creatorData.features) && creatorData.features.length > 0
      ? creatorData.features
      : ['Interactive workspace', 'Automated workflows', 'Saved user projects', 'Cloud data sync'];

  // Clean features and build benefit lines
  const features = rawFeatures.slice(0, 6).map((feat) => {
    const fStr = typeof feat === 'string' ? feat : feat?.title || 'Core Feature';
    const fLower = fStr.toLowerCase();
    let benefit = 'Interactive workspace capabilities designed for daily execution.';
    if (fLower.includes('telemetry') || fLower.includes('analytic') || fLower.includes('metric')) {
      benefit = 'Monitor key operational performance indicators and live status in real time.';
    } else if (fLower.includes('export') || fLower.includes('sync') || fLower.includes('cloud')) {
      benefit = 'Securely store your records and export structured reports whenever needed.';
    } else if (fLower.includes('workflow') || fLower.includes('automat')) {
      benefit = 'Eliminate manual friction with automated processing pipelines.';
    } else if (fLower.includes('benchmark') || fLower.includes('comparison')) {
      benefit = 'Compare data points directly against verified benchmarks and past records.';
    } else if (fLower.includes('filter') || fLower.includes('search') || fLower.includes('hub')) {
      benefit = 'Quickly organize, filter, and retrieve critical resources without searching through dispersed links.';
    } else if (fLower.includes('log') || fLower.includes('track') || fLower.includes('history')) {
      benefit = 'Keep a continuous audit trail of your progress, inputs, and completed items.';
    } else if (fLower.includes('calc') || fLower.includes('formula') || fLower.includes('solver')) {
      benefit = 'Run complex formulas instantly and generate actionable scenarios with zero spreadsheet mess.';
    }
    return {
      title: fStr,
      description: benefit,
    };
  });

  // Extract qualitative problem points from audience intelligence or fallbacks
  // NEVER show percentages (e.g. "39%") or quoted real names on the public page
  const intel = creatorData.audienceIntelligence || null;
  const rawPainPoints = (intel?.pain_points || []).map(p => p.title || p.description).filter(Boolean);
  const rawRequests = (intel?.requests || []).map(r => r.title || r.quote).filter(Boolean);

  const problemPoints = [];
  if (rawPainPoints.length > 0) {
    rawPainPoints.slice(0, 3).forEach(pt => {
      // Clean out any percentage strings or quote attributions
      const cleaned = pt.replace(/\b\d+%\s*(of\s*comments)?/gi, '').replace(/^[-—"'\s]+|[-—"'\s]+$/g, '').trim();
      if (cleaned.length > 10) {
        problemPoints.push(cleaned);
      }
    });
  }
  if (problemPoints.length < 2 && rawRequests.length > 0) {
    rawRequests.slice(0, 2).forEach(rq => {
      const cleaned = rq.replace(/^[-—"'\s]+|[-—"'\s]+$/g, '').trim();
      if (cleaned.length > 10 && !problemPoints.includes(cleaned)) {
        problemPoints.push(`Need for dedicated solutions: ${cleaned}`);
      }
    });
  }
  // Safe fallbacks matching the product definition
  if (problemPoints.length < 2) {
    problemPoints.push(
      'Scattered resources, bookmarked links, and manual notes consume valuable time every single week.',
      'Generic mass-market software tools lack the tailored nuance and workflow precision required for this domain.'
    );
  }
  if (problemPoints.length < 3) {
    problemPoints.push('Execution stalls without a centralized, interactive workspace built specifically for this workflow.');
  }

  // Derive outcome-focused headline (what the tool achieves, not just the product name)
  let headline = `The Dedicated Software Solution for ${targetAudience}`;
  const tLower = toolSummary.toLowerCase();
  if (tLower.includes('centraliz') || tLower.includes('hub') || tLower.includes('bridge') || tLower.includes('link')) {
    headline = 'All Your Critical Tools & Workflows Unified in One Dedicated Workspace';
  } else if (tLower.includes('reliab') || tLower.includes('radar') || tLower.includes('review') || tLower.includes('aggregat')) {
    headline = 'Unfiltered, Real-Time Intelligence to Make Confident Decisions';
  } else if (tLower.includes('track') || tLower.includes('progress') || tLower.includes('log')) {
    headline = 'Automate Your Progress Tracking with Zero Spreadsheet Friction';
  } else if (tLower.includes('calc') || tLower.includes('estimat') || tLower.includes('financ')) {
    headline = 'Accurate, Instant Calculations Built Specifically for Your Use Case';
  } else if (tLower.includes('feedback') || tLower.includes('portal') || tLower.includes('collaborat')) {
    headline = 'Structured Direct Collaboration and Fast Problem Solving';
  }

  // Subheadline: 1-sentence value prop from tool_summary
  const subheadline = toolSummary.endsWith('.') ? toolSummary : `${toolSummary}.`;

  // 3-step workflow
  const howItWorks = [
    {
      step: '01',
      title: 'Configure Your Parameters',
      description: 'Set up your workspace with your specific preferences, data inputs, and workflow targets.',
    },
    {
      step: '02',
      title: 'Execute & Automate',
      description: 'Run interactive tools, track ongoing tasks, and streamline recurring bottlenecks with dedicated software.',
    },
    {
      step: '03',
      title: 'Review Insights & Export',
      description: 'Access centralized outputs, maintain historical records, and export reports anytime.',
    },
  ];

  // Honest FAQ section
  const creatorHandle = creatorData.handle || creatorData.name || 'the creator';
  const faq = [
    {
      question: `What is ${name}?`,
      answer: `${name} is a dedicated subscription software tool engineered to ${toolSummary.charAt(0).toLowerCase() + toolSummary.slice(1)}. It provides a focused interactive application rather than disconnected spreadsheets or content files.`,
    },
    {
      question: 'Who is this tool built for?',
      answer: `It is built specifically for ${targetAudience} who need a dependable, purpose-built utility to solve recurring workflow bottlenecks.`,
    },
    {
      question: 'How much does subscription access cost?',
      answer: `Access is $${price} per month. This includes full access to all features, ongoing software updates, cloud data sync, and support. Cancel anytime.`,
    },
    {
      question: 'When will early access launch?',
      answer: 'The project is currently in the early demand-validation stage. Once our target early waitlist cohort is reached, build timelines are finalized and early access invitations will be sent directly to waitlist members.',
    },
    {
      question: 'How do I get access?',
      answer: `Submit your email in the waitlist form. Early supporters will receive priority access and direct onboarding when the software goes live.`,
    },
    {
      question: 'Can I cancel my subscription?',
      answer: 'Yes. Once live, subscriptions are billed monthly with no long-term commitment. You can cancel your subscription at any time directly from your account settings.',
    },
  ];

  return {
    schemaVersion: LANDING_COPY_SCHEMA_VERSION,
    productName: name,
    headline,
    subheadline,
    targetAudience,
    monthlyPrice: price,
    problemPoints: problemPoints.slice(0, 4),
    howItWorks,
    features,
    pricing: {
      price,
      period: '/mo',
      title: 'Monthly Subscription',
      included: features.map(f => f.title),
      ctaText: `Join Waitlist — $${price}/mo`,
      cancelNote: 'Cancel anytime.',
    },
    creatorOrigin: {
      tagline: `Co-created with @${creatorHandle.replace(/^@/, '')}`,
      whyText: `Developed to address recurring audience challenges identified across @${creatorHandle.replace(/^@/, '')}'s channel.`,
    },
    faq,
    cta: {
      headline: `Join the Early Waitlist for ${name}`,
      subheadline: `Be the first to access the interactive tool when early cohort spots open. Only $${price}/mo once live.`,
      buttonText: `Join Waitlist — $${price}/mo`,
    },
  };
}

/**
 * Validates AI-generated copy to ensure honesty and consistency.
 * Returns true if valid, false if it contains fabricated claims or missing fields.
 */
export function validateLandingCopy(copy, blueprint = {}) {
  if (!copy || typeof copy !== 'object') return false;
  if (!copy.headline || typeof copy.headline !== 'string' || copy.headline.trim().length < 8) return false;
  if (!copy.subheadline || typeof copy.subheadline !== 'string' || copy.subheadline.trim().length < 15) return false;

  // Problem points check
  if (!Array.isArray(copy.problemPoints) || copy.problemPoints.length < 2) return false;

  // Features check
  if (!Array.isArray(copy.features) || copy.features.length === 0) return false;

  // Validate that no fabricated testimonials or statistics exist in the copy
  const fullText = JSON.stringify(copy).toLowerCase();

  // Reject fabricated social proof, star ratings, or invented claims
  const forbiddenPatterns = [
    /\b4\.[89]\s*\/\s*5\b/,
    /\b[45]\s*stars?\b/,
    /\b\d{2,3}%\s*(satisfaction|guaranteed|faster|increase|success)\b/,
    /\b10,\d{3}\+?\s*users?\b/,
    /\btrusted by \d+\b/,
    /\bfeatured in\b/,
    /\bforbes\b/,
    /\bwall street journal\b/,
    /\btechcrunch\b/,
    /\bmasterclass\b/,
    /\bcourse curriculum\b/,
    /\bvideo vault\b/,
    /\bdigital download\b/,
    /\bphysical supplement\b/,
    /\bno hidden fees\b/, // forbidden per condition 4
  ];

  for (const pat of forbiddenPatterns) {
    if (pat.test(fullText)) {
      console.warn('[LandingCopy Validation] Rejected copy containing forbidden pattern:', pat);
      return false;
    }
  }

  // Verify feature names correspond to blueprint features if provided
  if (Array.isArray(blueprint?.features) && blueprint.features.length > 0) {
    const validBpFeatures = blueprint.features.map(f => (typeof f === 'string' ? f : f?.title || '').toLowerCase().trim());
    // Every copy feature title must be present or closely matching blueprint features
    const hasUnapprovedFeatures = copy.features.some(cf => {
      const cfTitle = (cf.title || cf).toLowerCase().trim();
      return !validBpFeatures.some(bpF => bpF.includes(cfTitle) || cfTitle.includes(bpF));
    });
    if (hasUnapprovedFeatures) {
      console.warn('[LandingCopy Validation] Copy contains unapproved features not in blueprint.');
      return false;
    }
  }

  return true;
}

/**
 * Retrieves valid landing copy from cache or generates it deterministically.
 */
export function getInitialLandingCopy(creatorData, blueprint) {
  if (creatorData?.landingCopy && typeof creatorData.landingCopy === 'object') {
    const cached = creatorData.landingCopy;
    if (
      cached.schemaVersion === LANDING_COPY_SCHEMA_VERSION &&
      cached.productName === (blueprint?.name || creatorData.productName)
    ) {
      // Return cached copy if price matches or update only price field
      const currentPrice = clampPrice(blueprint?.monthly_price || creatorData.monthly_price || 19);
      if (cached.monthlyPrice === currentPrice) {
        return cached;
      }
      return {
        ...cached,
        monthlyPrice: currentPrice,
        pricing: {
          ...cached.pricing,
          price: currentPrice,
          ctaText: `Join Waitlist — $${currentPrice}/mo`,
        },
        cta: {
          ...cached.cta,
          buttonText: `Join Waitlist — $${currentPrice}/mo`,
        },
      };
    }
  }
  return buildDeterministicLandingCopy(creatorData, blueprint);
}

