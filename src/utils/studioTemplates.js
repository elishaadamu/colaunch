/**
 * CoLaunch — Studio Copywriting Templates & Frameworks
 * 
 * Battle-tested templates for Socials (IG, X, LinkedIn, TikTok) 
 * and Emails (Launch, Sequence, Urgency, Onboarding).
 */

import { extractCreatorDetails } from './authenticStudioCopy'

export const SOCIAL_TEMPLATES = [
  {
    id: 'tpl-hso',
    category: 'Social',
    badge: 'High Engagement',
    title: 'Hook-Story-Offer (HSO)',
    targetTypeId: 'ig-caption',
    platform: 'Instagram',
    description: 'Hook attention with a contrarian truth, share a personal turning point, and transition into your product.',
    formula: 'Pattern Interrupt → Relatable Friction → The Unlock → Product Solution → Action CTA',
    promptGuideline: 'Write using the Hook-Story-Offer framework. Open with a contrarian hook about the niche, share a short turning point story, introduce the product, and finish with a comment-to-receive CTA.',
    generateDraft: (creatorData) => {
      const c = extractCreatorDetails(creatorData)
      return `Stop overcomplicating ${c.niche}.

For years I believed progress came down to working 14-hour days and hoping the algorithm noticed me.

It didn't. The real breakthrough happened when I stopped chasing random tactics and built a repeatable system.

Here is the exact 3-part framework:
1. ${c.f1} — surround yourself with peers on the same mission
2. ${c.f2} — follow a step-by-step roadmap instead of guessing
3. ${c.f3} — get live feedback to unblock questions in minutes

That is why I created ${c.productName}.

Everything is organized into one high-signal ecosystem so you never have to navigate ${c.niche} alone.

Founding member passes are officially open at ${c.pricing}.

Comment "LAUNCH" below or tap the link in my bio (${c.handle}) to claim your spot today! 👇

#${c.nicheTag} #${c.productTag} #creatorgrowth #buildinpublic`
    }
  },
  {
    id: 'tpl-pas',
    category: 'Social',
    badge: 'Problem Solver',
    title: 'Problem-Agitate-Solve (PAS)',
    targetTypeId: 'x-post',
    platform: 'Twitter',
    description: 'Identify the primary audience pain point, agitate the cost of staying stuck, and present your product as the antidote.',
    formula: 'Core Bottleneck → Pain of Stagnation → Structured Antidote → Direct URL',
    promptGuideline: 'Write using the Problem-Agitate-Solve framework. Highlight the biggest headache in this niche, explain why conventional advice makes it worse, and present our product as the straightforward solution.',
    generateDraft: (creatorData) => {
      const c = extractCreatorDetails(creatorData)
      return `The biggest bottleneck in ${c.niche} isn't lack of talent.

It's spending 10 hours a week jumping between scattered tutorials with zero structured accountability.

You end up exhausted with zero compounding assets to show for it.

The fix:
• A structured execution curriculum (${c.f2})
• A private network of high-caliber builders (${c.f1})
• Weekly direct guidance with me (${c.f3})

We built ${c.productName} to solve this once and for all.

Lock in founding pricing (${c.pricing}) today:
https://${c.cleanHandle}.co-launch.app`
    }
  },
  {
    id: 'tpl-bab',
    category: 'Social',
    badge: 'Transformation',
    title: 'Before-After-Bridge (BAB)',
    targetTypeId: 'ig-reel',
    platform: 'Instagram',
    description: 'Contrast the painful current state with the desired dream outcome, bridging the gap with your product.',
    formula: 'Painful Reality (Before) → Dream State (After) → The Bridge (${productName})',
    promptGuideline: 'Write using the Before-After-Bridge framework for a short-form video. Contrast building in isolation with having a proven system and mastermind network.',
    generateDraft: (creatorData) => {
      const c = extractCreatorDetails(creatorData)
      return `[BEFORE-AFTER-BRIDGE SCRIPT — 35 SECONDS]

BEFORE (0:00 - 0:10):
"Before: You sit at your desk for 3 hours wondering what to work on in ${c.niche}. You read 20 threads, watch 4 tutorials, and end the day with zero finished projects."

AFTER (0:10 - 0:20):
"After: You open your dashboard, follow a clear checklist (${c.f2}), get your questions answered in our live session (${c.f3}), and ship tangible work every single week."

THE BRIDGE (0:20 - 0:35):
"The bridge between where you are and where you want to be is ${c.productName}. 
Founding cohort enrollment is live now at ${c.pricing}. 
Tap the link in my bio or comment 'BRIDGE' to get instant access."`
    }
  },
  {
    id: 'tpl-contrarian',
    category: 'Social',
    badge: 'Thought Leadership',
    title: 'Contrarian Pattern Interrupt',
    targetTypeId: 'linkedin',
    platform: 'LinkedIn',
    description: 'Challenge conventional wisdom in your niche to establish authority and attract high-intent buyers.',
    formula: 'Contrarian Stance → Why Common Wisdom Fails → The Real Leverage → System Reveal',
    promptGuideline: 'Write a contrarian thought-leadership post for LinkedIn. Call out the myth that more volume equals better results in this niche, and demonstrate why systems beat grind.',
    generateDraft: (creatorData) => {
      const c = extractCreatorDetails(creatorData)
      return `Unpopular opinion on ${c.niche}:

"Consistency" is terrible advice if you are consistently executing the wrong strategy.

Over the past few years, I’ve seen dozens of talented creators burn out because they were told to just "post every day."

More noise doesn't create leverage. Systems do.

If you want sustainable momentum in ${c.niche}, prioritize these 3 assets:
1. ${c.f1}: A tight feedback loop with practitioners who give constructive critique.
2. ${c.f2}: A repeatable framework so you never start from a blank screen.
3. ${c.f3}: Ongoing strategy alignment with an experienced operator.

This is the exact operating system we created inside ${c.productName}.

We designed it specifically for ${c.audience} who want high-leverage outcomes without the 60-hour burnout.

Explore the curriculum and join our founding cohort:
https://${c.cleanHandle}.co-launch.app

#${c.nicheTag} #strategy #systems #creatorbusiness`
    }
  },
  {
    id: 'tpl-thread',
    category: 'Social',
    badge: 'Viral Framework',
    title: 'Actionable 5-Pillar Masterclass',
    targetTypeId: 'x-thread',
    platform: 'Twitter',
    description: 'High-signal 6-tweet thread delivering tactical value and ending with an irresistible launch offer.',
    formula: 'Curiosity Hook → 4 Core Lessons → Transformation Summary → Founding Pass CTA',
    promptGuideline: 'Write an actionable 6-tweet thread breaking down the 4 pillars of success in our niche, concluding with a launch invitation for our product.',
    generateDraft: (creatorData) => {
      const c = extractCreatorDetails(creatorData)
      return `1/ Most people spend 2 years learning ${c.niche} the hard way.

Here is the exact playbook to skip the trial-and-error in 4 minutes: 🧵👇

2/ Pillar 1: Foundational Clarity
Do not start by building 10 things. Pick one specific outcome and master ${c.f1}.

3/ Pillar 2: Repeatable Architecture
Stop waking up asking "what should I do today?" Build around ${c.f2} so execution is friction-free.

4/ Pillar 3: Real-Time Feedback
Building in silence kills momentum. Having access to ${c.f3} cuts weeks off your learning curve.

5/ Pillar 4: Curated Assets
Why recreate templates from scratch? Leverage proven ${c.f4} and focus on your unique perspective.

6/ That’s why I built ${c.productName}.
All 4 pillars packed into one dedicated member workspace for ${c.pricing}.

Founding passes are officially live today:
https://${c.cleanHandle}.co-launch.app`
    }
  },
  {
    id: 'tpl-urgency-drop',
    category: 'Social',
    badge: 'Launch Drop',
    title: '24-Hour Founding Drop',
    targetTypeId: 'yt-community',
    platform: 'YouTube',
    description: 'Create healthy urgency around limited founding member pricing and cohort access.',
    formula: 'Urgent Alert → Value Proposition → Grandfathered Guarantee → Pinned Checkout Link',
    promptGuideline: 'Write an urgent launch drop announcement highlighting that founding cohort pricing is grandfathered for early members.',
    generateDraft: (creatorData) => {
      const c = extractCreatorDetails(creatorData)
      return `⏰ 24-HOUR NOTICE: Founding Passes for ${c.productName} are live!

If you've been waiting for a structured, hands-on environment to master ${c.niche}, this is your moment.

Here is what is waiting for you inside:
✅ ${c.f1} — direct collaboration with fellow members
✅ ${c.f2} — complete step-by-step master curriculum
✅ ${c.f3} — weekly live coaching & Q&A with ${c.name}
✅ ${c.f4} — every template and asset directory

Founding rate is locked at just ${c.pricing} (grandfathered for life).

Grab your pass before founding enrollment closes:
👉 https://${c.cleanHandle}.co-launch.app

See you on the inside! 🚀`
    }
  }
]

export const EMAIL_TEMPLATES = [
  {
    id: 'tpl-email-launch',
    category: 'Email',
    badge: 'Core Launch',
    title: 'The Official Launch Announcement',
    targetTypeId: 'email-announce',
    platform: 'Email',
    description: 'The cornerstone reveal email with personal origin story, full feature breakdown, and locked-in pricing.',
    formula: 'Subject Curiosity → The Origin Why → Feature Bullet Points → Lifetime Price Lock → P.S. Guarantee',
    promptGuideline: 'Write an authoritative launch announcement email from the creator. Explain why this product was built, break down the core modules, and emphasize locked-in founding pricing.',
    generateDraft: (creatorData) => {
      const c = extractCreatorDetails(creatorData)
      return `Subject: It's finally here — Introducing ${c.productName} 🚀

Hey friend,

For the past several months, I've noticed one consistent pattern in ${c.niche}:

Talented creators and practitioners spend hundreds of hours consuming disconnected tutorials, yet still hit a frustrating ceiling when it comes to structured execution.

I built ${c.productName} to solve that once and for all.

Starting today, the doors are officially open.

Here is what you unlock the moment you step inside:
• ${c.f1}: A dedicated private network of creators on the exact same mission.
• ${c.f2}: Step-by-step execution blueprints designed for immediate implementation.
• ${c.f3}: Weekly live strategy and review sessions with me (${c.name}).
• ${c.f4}: Downloadable templates, worksheets, and asset vaults.

Because you are part of our core audience, founding member pricing is locked at just ${c.pricing}.

When you join today, this rate is grandfathered for as long as you remain a member.

→ Secure your founding pass here:
https://${c.cleanHandle}.co-launch.app

I cannot wait to see you inside and build together.

Best,
${c.name}
${c.handle}

P.S. We are keeping this founding cohort deliberately intimate to give everyone direct support. Grab your spot before the cohort closes!`
    }
  },
  {
    id: 'tpl-email-soap',
    category: 'Email',
    badge: '4-Part Sequence',
    title: 'The 4-Part Soap Opera Sequence',
    targetTypeId: 'email-sequence',
    platform: 'Email',
    description: 'High-converting narrative sequence that builds anticipation, shares the breakthrough, and closes with direct urgency.',
    formula: 'Day 1: The Turning Point → Day 2: The Core Bottleneck → Day 3: The Secret Architecture → Day 4: Final Cohort Call',
    promptGuideline: 'Write a 4-part email launch sequence. Detail the subject line and core message for each of the 4 consecutive days of launch week.',
    generateDraft: (creatorData) => {
      const c = extractCreatorDetails(creatorData)
      return `[4-PART SOAP OPERA LAUNCH SEQUENCE FOR ${c.productName.toUpperCase()}]

EMAIL 1: THE TURNING POINT (Day 1)
Subject: The mistake that cost me 14 months in ${c.niche}...
Core Narrative: Share the early struggle of building without guidance. End with an open loop about the system discovered.

EMAIL 2: THE HIGH DRAMA & REALIZATION (Day 2)
Subject: Why traditional advice in ${c.niche} is broken
Core Narrative: Explain why 90% of beginners burn out trying to do everything alone. Introduce the necessity of ${c.f1} and ${c.f2}.

EMAIL 3: THE EPIPHANY & REVEAL (Day 3)
Subject: Sneak peek inside ${c.productName} (Here is how it works)
Core Narrative: Screen-by-screen breakdown of the member experience. Spotlight on weekly live AMAs (${c.f3}) and templates (${c.f4}). Announce the founding rate (${c.pricing}).

EMAIL 4: THE HARD DEADLINE (Day 4)
Subject: Tonight: Founding passes for ${c.productName} close ⏳
Core Narrative: Remind subscribers that the grandfathered rate closes tonight. Reiterate the 100% money-back guarantee. Final checkout link: https://${c.cleanHandle}.co-launch.app`
    }
  },
  {
    id: 'tpl-email-closing',
    category: 'Email',
    badge: 'High Urgency',
    title: 'The "Closing Tonight" Urgency Email',
    targetTypeId: 'email-announce',
    platform: 'Email',
    description: 'Sent on the final night of launch. Reminds subscribers of the deadline, eliminates risk, and calls for decision.',
    formula: 'Direct Time Trigger → What Stays / What Changes → Risk Reversal → Final Checkout Link',
    promptGuideline: 'Write a closing-night urgency email. Keep it empathetic, high-conviction, and clear on the upcoming deadline.',
    generateDraft: (creatorData) => {
      const c = extractCreatorDetails(creatorData)
      return `Subject: Final call: Founding pricing for ${c.productName} ends tonight ⏳

Hey,

Just a quick reminder that the founding cohort enrollment for ${c.productName} officially closes at midnight.

After tonight:
• Founding member rate (${c.pricing}) will increase
• Direct onboarding review with me will be paused

If you've been on the fence, ask yourself this:

Where do you want your work in ${c.niche} to be 90 days from today?

You can spend those 90 days guessing your way through scattered videos... or you can step into an environment where every step (${c.f2}) is already mapped out for you.

You're completely protected by our 100% satisfaction guarantee. If inside 30 days you don't feel this is the highest-value investment in your craft, just send one email for a full refund.

→ Lock in your grandfathered founding pass here:
https://${c.cleanHandle}.co-launch.app

Doors close at midnight. Hope to see you on the inside!

Warmly,
${c.name}`
    }
  },
  {
    id: 'tpl-email-9word',
    category: 'Email',
    badge: 'Lead Re-engagement',
    title: 'The 9-Word Re-engagement Email',
    targetTypeId: 'email-followup',
    platform: 'Email',
    description: 'Shortest, highest-reply rate email framework for waking up inactive subscribers and starting conversations.',
    formula: 'Ultra-Short Curiosity Subject → 1-Sentence Question → Low-Pressure Invitation',
    promptGuideline: 'Write a 9-word re-engagement email to check in on subscribers who viewed the offer but have not completed checkout.',
    generateDraft: (creatorData) => {
      const c = extractCreatorDetails(creatorData)
      return `Subject: Quick question about ${c.niche}...

Hey,

Are you still planning to level up your work in ${c.niche} this month?

I noticed you checked out ${c.productName} yesterday. If you had any specific questions about ${c.f2} or the live sessions (${c.f3}), just hit reply and let me know.

I'm happy to give you my honest thoughts on whether it's the right fit for your goals right now.

Or if you're ready to jump in:
https://${c.cleanHandle}.co-launch.app

Best,
${c.name}`
    }
  },
  {
    id: 'tpl-email-faq',
    category: 'Email',
    badge: 'Objection Crusher',
    title: 'The FAQ & Objection Crusher Email',
    targetTypeId: 'faq',
    platform: 'Email',
    description: 'Address and dismantle the top 4 hesitations stopping your audience from enrolling.',
    formula: 'Common Hesitations → Clear Direct Answers → Guarantee Reaffirmation → Simple Next Step',
    promptGuideline: 'Write an FAQ email addressing time commitment, beginner suitability, cancellation policy, and member support for our digital product.',
    generateDraft: (creatorData) => {
      const c = extractCreatorDetails(creatorData)
      return `Subject: "Is ${c.productName} right for me?" (Your top questions answered)

Hey,

Since opening founding passes for ${c.productName}, I've received some fantastic questions from the community.

Here are the answers to the top 4 questions to help you decide:

1. "How much time do I need each week?"
All modules inside ${c.f2} are bite-sized (10–15 minutes). You only need about 2 hours per week to see consistent progress. Everything is recorded and self-paced.

2. "What if I'm just starting out in ${c.niche}?"
We built ${c.productName} with clear foundational paths right up to advanced implementation. You will never feel left behind.

3. "What happens during our live calls?"
Every week in ${c.f3}, we review live projects, diagnose bottlenecks, and brainstorm solutions together. It's direct access without the $5,000 agency price tag.

4. "Can I cancel if it's not a fit?"
Yes, anytime in one click. No contracts, no fine print.

Ready to build with us?

→ Claim your founding member pass here:
https://${c.cleanHandle}.co-launch.app

Talk soon,
${c.name}`
    }
  },
  {
    id: 'tpl-email-welcome',
    category: 'Email',
    badge: 'Onboarding',
    title: 'Day 1 Member Welcome & Playbook',
    targetTypeId: 'email-welcome',
    platform: 'Email',
    description: 'Sent immediately upon purchase to guide new members to their first quick win and eliminate buyer remorse.',
    formula: 'Warm Congratulatory Welcome → Step 1 (Community) → Step 2 (First Lesson) → Step 3 (Live RSVP)',
    promptGuideline: 'Write a high-energy welcome and orientation email detailing the 3 immediate steps for new members inside our digital product.',
    generateDraft: (creatorData) => {
      const c = extractCreatorDetails(creatorData)
      return `Subject: Welcome to ${c.productName}! Here is your Day 1 playbook 👋

Welcome to the family!

You just made a tremendous commitment to your craft, and I couldn't be more excited to work with you.

Inside ${c.productName}, our mission is straightforward: eliminate the noise and give you a direct path to mastering ${c.niche}.

Here are your 3 immediate steps today:

Step 1: Introduce yourself in the Community Hub
Jump into our introductions channel and tell us what you're working on and your #1 objective this month.

Step 2: Start Module 1
Head over to ${c.f2} and watch the quick 10-minute orientation video. It establishes the foundational mental model for everything we do.

Step 3: Mark your calendar for our live call
Check the schedule for our upcoming ${c.f3}. Add it to your calendar so you don't miss the live Q&A!

If you ever need anything, just reply directly to this email.

Let's make big things happen!

Warmly,
${c.name}
Founder, ${c.productName}`
    }
  }
]

export const ALL_TEMPLATES = [...SOCIAL_TEMPLATES, ...EMAIL_TEMPLATES]
