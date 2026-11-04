/**
 * CoLaunch — Authentic Studio & Product Copy Synthesizer
 * 
 * Provides 100% finished, realistic, niche-tailored fallback copy
 * with ZERO bracketed placeholders or mockups.
 */

export function extractCreatorDetails(creatorData) {
  const rawName = creatorData?.name || (creatorData?.handle ? creatorData.handle.replace(/^@+/, '') : 'Creator')
  const name = rawName.trim() || 'Creator'
  const rawHandle = creatorData?.handle || '@creator'
  const handle = rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`
  const cleanHandle = rawHandle.replace(/^@+/, '')
  const niche = (creatorData?.niche && creatorData.niche.trim()) || 'Digital Creation'
  const productName = (creatorData?.productName && creatorData.productName.trim()) 
    || (creatorData?.blueprint?.name && creatorData.blueprint.name.trim()) 
    || `${name} Academy`
  
  const rawFeatures = (Array.isArray(creatorData?.features) && creatorData.features.length > 0)
    ? creatorData.features
    : (Array.isArray(creatorData?.blueprint?.features) && creatorData.blueprint.features.length > 0)
      ? creatorData.blueprint.features
      : ['Interactive Community Network', 'Step-by-Step Curriculum', 'Weekly Live Q&A Sessions', 'Downloadable Templates & Systems']
  
  const features = rawFeatures.map(f => typeof f === 'string' ? f.trim() : String(f)).filter(Boolean)
  const f1 = features[0] || 'Interactive Community Network'
  const f2 = features[1] || 'Step-by-Step Implementation Frameworks'
  const f3 = features[2] || 'Weekly Live Strategy Calls'
  const f4 = features[3] || 'Exclusive Downloadable Resources'

  const pricing = creatorData?.pricing || creatorData?.blueprint?.pricing || '$29/mo'
  const audience = creatorData?.targetAudience || 'creators, builders, and professionals'
  const bio = creatorData?.description || creatorData?.bio || `Helping ${audience} succeed in ${niche}.`
  const platform = creatorData?.platform || 'YouTube'

  const nicheTag = niche.toLowerCase().replace(/[^a-z0-9]/g, '')
  const productTag = productName.toLowerCase().replace(/[^a-z0-9]/g, '')

  return {
    name,
    handle,
    cleanHandle,
    niche,
    productName,
    features,
    f1,
    f2,
    f3,
    f4,
    pricing,
    audience,
    bio,
    platform,
    nicheTag,
    productTag
  }
}

export function generateAuthenticFallbackCopy(typeId, creatorData, tone = 'Confident', customContext = '') {
  const ctx = extractCreatorDetails(creatorData)
  const { name, handle, cleanHandle, niche, productName, f1, f2, f3, f4, pricing, audience, nicheTag, productTag } = ctx
  const extraNote = customContext ? `\n\n(Context focus: ${customContext})` : ''

  switch (typeId) {
    // ── SOCIAL ──
    case 'ig-caption':
      return `Stop overcomplicating ${niche}.

For the longest time, I thought success came down to working 14-hour days and endlessly guessing what to build next.

It doesn’t. It comes down to three repeatable systems:
1. Clear domain focus (${f1})
2. A proven step-by-step roadmap (${f2})
3. A real peer network keeping you accountable (${f3})

That’s why I officially built ${productName}.

Everything I learned the hard way is organized into one high-signal environment so you never have to navigate the journey alone again.

Founding member spots are now open. Head to the link in my bio (${handle}) or comment "LAUNCH" below and I’ll send you direct access. 👇

#${nicheTag} #${productTag} #creatorgrowth #buildinpublic${extraNote}`

    case 'ig-reel':
      return `[REEL CONCEPT & SCRIPT: 30-45 SECONDS]

HOOK (0:00 - 0:04):
[Visual: Quick cut of ${name} looking directly into camera with high-contrast text overlay]
Audio: "If you want to master ${niche} this year, stop making this one costly mistake."

SCENE 1 - THE BOTTLENECK (0:04 - 0:14):
[Visual: Screen recording or over-the-shoulder shot scrolling endless confusing tutorials]
Audio: "Most people consume random clips for months without a structured path. You end up overwhelmed with zero tangible outcomes to show for it."

SCENE 2 - THE SOLUTION (0:14 - 0:26):
[Visual: Clean tour of ${productName} interface showing ${f1} and ${f2}]
Audio: "Instead of piecing together fragmented advice, here is the exact framework we use inside ${productName} to streamline your progress and get consistent results."

CALL TO ACTION (0:26 - 0:34):
[Visual: ${name} pointing to caption / bio link with prominent sticker: 'JOIN ${productName}']
Audio: "Founding spots are officially open at ${pricing}. Tap the link in my bio or comment 'FOUNDER' below to grab your key."

CAPTION:
Mastering ${niche} doesn't require reinventing the wheel. Step inside ${productName} today. Link in bio! 🚀${extraNote}`

    case 'x-post':
      return `The biggest myth in ${niche} is that you need years of trial-and-error before seeing real momentum.

What you actually need:
• A structured framework (${f2})
• Direct access to peers on the same mission (${f1})
• Weekly feedback loops so you never get stuck (${f3})

That is why I created ${productName}.

Founding passes are live today: https://${cleanHandle}.co-launch.app${extraNote}`

    case 'x-thread':
      return `1/ I spent years figuring out ${niche} the hard way.

If I had to start over from scratch today with zero audience and zero unfair advantages, here is the exact playbook I'd follow: 🧵👇

2/ Most people fail because they mistake information for transformation.
Reading 100 threads won't fix your bottleneck. You need an execution framework that tells you what to execute on Monday morning.

3/ Pillar 1: Foundational Clarity
Cut 80% of low-impact tasks. Focus exclusively on mastering ${f1} and building direct leverage.

4/ Pillar 2: Repeatable Systems
Instead of relying on willpower, anchor your workflow to ${f2}. When the system is clear, consistency becomes automatic.

5/ Pillar 3: Fast Feedback Loops
Do not build in isolation. Having access to ${f3} cuts your learning curve by months because your questions get resolved in real time.

6/ That is why I built ${productName}.
I wanted to give ${audience} the exact toolkit, accountability, and guidance I wished existed when I first began.

7/ Founding passes are officially open for ${pricing}:
→ Private member portal
→ Full framework access (${f2})
→ Weekly AMAs with me (${name})

Grab your spot before founding enrollment closes:
https://${cleanHandle}.co-launch.app${extraNote}`

    case 'linkedin':
      return `Over the past few years working in ${niche}, I noticed a glaring pattern:

Talented professionals spend hundreds of hours consuming disconnected tutorials, yet still hit a ceiling when it comes to practical execution.

The issue isn't a lack of motivation. It's the absence of an integrated operating system.

When you bring together:
1. ${f1}
2. Structured execution blueprints (${f2})
3. Ongoing accountability from high-caliber peers (${f3})

The trajectory changes immediately.

To solve this gap for ${audience}, I'm proud to announce the official launch of ${productName}.

Inside, we've distilled our entire methodology into an actionable, step-by-step curriculum backed by a private community where members share real workflows and support each other's growth.

If you're serious about taking your work in ${niche} to the next tier, explore what we’ve built here:
https://${cleanHandle}.co-launch.app

Looking forward to welcoming you inside.

#${nicheTag} #innovation #professionaldevelopment #leadership${extraNote}`

    case 'yt-community':
      return `🚨 Exciting Announcement for our community!

Many of you have been asking for a centralized place where we can dive deeper into ${niche}, collaborate directly, and work through hands-on blueprints together.

Today, I’m thrilled to officially unveil ${productName}! 🎉

Here is what you get immediate access to:
✅ ${f1} — Connect and build alongside fellow members
✅ ${f2} — Step-by-step systems and exclusive resources
✅ ${f3} — Weekly direct sessions with me (${name})
✅ ${f4} — Downloadable toolkits and templates

Founding member pricing is locked at ${pricing} for our early supporters.

👉 Check out the official offer page and claim your founding pass:
https://${cleanHandle}.co-launch.app

Drop your questions below, and let me know which module you're most excited to explore first!${extraNote}`

    case 'tiktok':
      return `[TIKTOK HOOK & CAPTION]

AUDIO / SPOKEN HOOK (0:00 - 0:03):
"Do not spend another dollar trying to learn ${niche} until you hear this."

VISUAL ACTION:
[Quick zoom on ${name} setting down phone, walking up to whiteboard or laptop]

TALKING POINTS (0:03 - 0:18):
"Everyone tells you to just 'grind consistently'. But nobody gives you the exact setup.
Here is how you actually build leverage:
One: Stop doing random tasks alone.
Two: Get inside a curated network doing the same thing.
Three: Use a proven framework like ${f2}."

OUTRO / CTA (0:18 - 0:24):
"I just launched ${productName} for ${pricing}. Hit the link in my bio to join our founding group right now."

CAPTION:
The real way to master ${niche} in 2026. Link in bio to join ${productName}! 🎯 #${nicheTag} #creatorlife #build${extraNote}`

    // ── VIDEO ──
    case 'yt-ad':
      return `[YOUTUBE 60-SECOND DIRECT RESPONSE SCRIPT]

[0:00 – 0:08] PATTERN INTERRUPT HOOK:
"If you’ve been trying to make real progress in ${niche} and you feel like you’re spinning your wheels... don't skip this video. Because what I'm about to show you will save you six months of frustration."

[0:08 – 0:20] THE PROBLEM:
"Every day I talk to people who want to break through in ${niche}. But they’re stuck jumping between disconnected YouTube videos, half-baked advice, and zero structured guidance. It leads to burnout every single time."

[0:20 – 0:38] THE SOLUTION — ${productName}:
"That’s why I built ${productName}. It is the all-in-one ecosystem designed specifically for ${audience}. You get immediate access to:
→ ${f1} so you never build alone
→ ${f2} to guide your daily implementation
→ And ${f3} with me directly to unblock your bottlenecks."

[0:38 – 0:48] PROOF & VALUE:
"This isn't theory. This is the exact playbook responsible for our own growth, distilled into clear, actionable steps you can start applying today."

[0:48 – 1:00] THE CALL TO ACTION:
"Click the link on your screen right now. We are currently offering founding member pricing at just ${pricing}. Join ${productName} today and let’s build together."${extraNote}`

    case 'short-script':
      return `[SHORT-FORM PROMO SCRIPT — 35 SECONDS]

[0:00 - 0:05] TEXT ON SCREEN: "The 3 rules of ${niche}"
Spoken: "Three rules that completely transformed how I approach ${niche}."

[0:05 - 0:15] RULE 1 & 2:
Spoken: "Rule 1: Don't learn in isolation. Your peer group dictates your speed.
Rule 2: Master ${f2} before worrying about complex tactics."

[0:15 - 0:25] RULE 3:
Spoken: "Rule 3: Have an ongoing feedback loop. When you get stuck, getting an answer in 10 minutes beats waiting 3 weeks."

[0:25 - 0:35] CTA & SIGN-OFF:
Spoken: "I packed all three into ${productName}. Tap the link in my bio or comment 'START' and I'll send you an exclusive invite."${extraNote}`

    case 'live-outline':
      return `[LIVE SESSION MASTER OUTLINE: 45 MINUTES]
Session Title: Mastering ${niche} — The Complete Roadmap & ${productName} Launch Walkthrough
Host: ${name} (${handle})

[00:00 - 05:00] WELCOME & SETTING THE STAGE
• Welcome early attendees, shout out names in the live chat
• Quick pulse check: Where are you currently feeling most challenged in ${niche}?
• Reveal today's core agenda: The 3 bottlenecks holding 90% of creators back

[05:00 - 15:00] THE BREAKTHROUGH FRAMEWORK
• Why traditional methods in ${niche} break down under pressure
• Deep dive on Core Pillar: ${f1}
• Walkthrough of implementation blueprints: ${f2}
• Real-world examples of rapid turnarounds

[15:00 - 25:00] LIVE DEMO & BEHIND-THE-SCENES
• Screen-share walkthrough of ${productName}
• Showing members how to navigate modules, submit work, and access ${f4}
• Spotlight on weekly live sessions (${f3})

[25:00 - 35:00] LIVE AUDIENCE Q&A
• Answering top audience questions from the live chat
• Diagnosing live community bottlenecks in real time

[35:00 - 45:00] FOUNDING MEMBER INVITATION & CLOSE
• Announcing limited founding member enrollment at ${pricing}
• Reminding members of the guarantee and bonuses
• Final drop of offer link: https://${cleanHandle}.co-launch.app
• Closing words and community send-off${extraNote}`

    case 'hook':
      return `[5 HIGH-RETENTION PROMO HOOKS FOR ${productName.toUpperCase()}]

HOOK 1 (Curiosity & Contrarian):
"Everyone in ${niche} is doing this completely backwards, and it’s costing them months of wasted effort."

HOOK 2 (Direct & Empathetic):
"If you love ${niche} but hate the feeling of being overwhelmed with zero results, listen to this for 20 seconds."

HOOK 3 (Outcome-Driven):
"Here is the exact step-by-step system I used to master ${f2} without burning out."

HOOK 4 (Transformation & Social Proof):
"I spent years testing everything in ${niche}. Here is the single platform I built so you never have to guess again."

HOOK 5 (Scarcity & Launch):
"Founding passes for ${productName} just opened up today. Here’s what you need to know before spots fill."${extraNote}`

    // ── EMAIL ──
    case 'email-announce':
      return `Subject: It’s finally here — Introducing ${productName} 🚀

Hey friend,

Over the past several months, I've had one burning question on my mind:

How can I give ${audience} an unfair advantage in ${niche} without the endless noise and guesswork?

Today, I’m thrilled to share the answer with you:

👉 ${productName} is officially live.

Here is what you unlock the moment you step inside:

1. ${f1} — Join a dedicated circle of practitioners committed to real results.
2. ${f2} — Our comprehensive, step-by-step curriculum and execution roadmap.
3. ${f3} — Weekly live calls with me (${name}) to review your work and answer questions.
4. ${f4} — Every checklist, template, and asset we use daily.

Because you’ve been here supporting our journey, I want to make joining as effortless as possible.

Founding member pricing is locked at just ${pricing}. When you join today, this rate is grandfathered for as long as you stay active.

→ Claim your founding member pass here:
https://${cleanHandle}.co-launch.app

I cannot wait to see you on the inside and help you hit your next milestone.

Warmly,
${name}
${handle}

P.S. We are keeping founding cohorts tight so I can personally support each new member. If you want in, grab your pass today!${extraNote}`

    case 'email-welcome':
      return `Subject: Welcome to ${productName}! Here is your Day 1 playbook 👋

Welcome to the family!

You made a tremendous decision today, and I could not be more excited to work with you.

Inside ${productName}, our mission is simple: cut through the noise and give you a straight line to mastering ${niche}.

Here are your 3 immediate next steps:

Step 1: Introduce yourself in the Community Hub
Drop a quick post telling us who you are, what you're building, and your #1 goal this month.

Step 2: Access your core materials
Head over to the Modules tab to begin "${f2}". Everything is structured in bite-sized, actionable lessons.

Step 3: Mark your calendar for our next live call
Check the Schedule tab for our upcoming ${f3}. Come ready with your questions!

If you ever need anything, just reply directly to this email. I read every note from our members.

Let’s get to work!

Best,
${name}
Founder, ${productName}${extraNote}`

    case 'email-sequence':
      return `[3-PART LAUNCH EMAIL SEQUENCE FOR ${productName.toUpperCase()}]

EMAIL 1: THE BIG ANNOUNCEMENT
Subject: The doors are officially open (Welcome to ${productName})
Preview: Everything we’ve been building behind the scenes is finally live.
Core Message: Explain why you built ${productName}, break down ${f1} and ${f2}, and offer founding pricing (${pricing}).

EMAIL 2: THE CASE STUDY & SNEAK PEEK
Subject: Inside ${productName}: How the system actually works
Preview: A quick behind-the-scenes look at the framework.
Core Message: Walk through a tangible challenge in ${niche}. Show how ${f2} resolves it step-by-step. Reiterate the live AMA support (${f3}).

EMAIL 3: CLOSING THE FOUNDING WINDOW
Subject: Last chance for founding pricing on ${productName} ⏳
Preview: The founding cohort rate closes tonight.
Core Message: Remind readers of what they miss out on by continuing to struggle alone. Full breakdown of the zero-risk satisfaction guarantee. Final link to enroll.${extraNote}`

    case 'email-followup':
      return `Subject: Quick question about ${niche}...

Hey,

I noticed you checked out ${productName} yesterday, but haven't grabbed your founding pass yet.

Totally understand — committing to a new program is a serious decision.

So I wanted to check in personally: What’s your biggest hesitation right now?

• Is it time? (Our frameworks are designed for busy schedules, needing as little as 2 hours a week)
• Is it fit? (If you're focused on ${niche}, this was built specifically for you)
• Is it the investment? (Founding member rate is just ${pricing}, cancel anytime with one click)

Whatever is on your mind, just hit reply and let me know. I’m happy to give you an honest answer on whether ${productName} is the right move for you right now.

Or if you're ready to dive in, here is the link to join:
https://${cleanHandle}.co-launch.app

Talk soon,
${name}${extraNote}`

    // ── COPY ──
    case 'offer-copy':
    case 'Write offer page copy':
      return `**HERO HEADLINE**
Stop guessing your way through ${niche}. Start building with a proven system.

**SUBHEADLINE**
${productName} is the all-in-one ecosystem for ${audience} who are ready to level up their skills, connect with fellow builders, and turn their passion into a sustainable reality.

**WHAT YOU GET INSIDE**
→ ${f1}: Direct access to our private, threaded member hub and direct collaborations
→ ${f2}: Our complete, step-by-step master curriculum from fundamentals to advanced scale
→ ${f3}: Weekly live implementation and Q&A sessions with ${name}
→ ${f4}: Ready-to-deploy templates, blueprints, and resource directories

**THE FOUNDING OFFER**
• Monthly Membership: ${pricing} (lock in this rate forever)
• Instant access to all current and future modules
• 100% satisfaction guarantee — cancel anytime in one click

[CLAIM YOUR FOUNDING PASS NOW →]${extraNote}`

    case 'faq':
    case 'Generate FAQ section':
      return `**Q: Who is ${productName} designed for?**
A: It is built specifically for ${audience} who want structured guidance, real community accountability, and proven playbooks in ${niche}. Whether you're just starting out or scaling existing projects, the frameworks meet you where you are.

**Q: How much time do I need to commit each week?**
A: All lessons and exercises are built for high efficiency. You can make substantial progress with just 2 to 3 hours per week. Everything is recorded and accessible 24/7.

**Q: What is included in the membership?**
A: Full access to our ${f1}, the complete ${f2}, weekly live ${f3}, and all downloadable ${f4}.

**Q: Can I cancel if it's not right for me?**
A: Absolutely. You can manage and cancel your subscription anytime with zero hassles or hidden fees. We want you here only if you are getting immense value.

**Q: How do I get support when I'm stuck?**
A: You can post in our community hub 24/7 for peer feedback, or bring your specific questions to our weekly live sessions with ${name}.${extraNote}`

    case 'cta':
      return `[5 HIGH-CONVERTING CALL-TO-ACTION VARIANTS]

VARIANT 1 (Direct & Action-Oriented):
"Join ${productName} Today — Get Instant Access for ${pricing}"

VARIANT 2 (Value-Focused):
"Unlock the Complete ${niche} Roadmap & Private Community"

VARIANT 3 (Low-Risk & Friendly):
"Become a Founding Member — Cancel Anytime with One Click"

VARIANT 4 (Urgency & Community):
"Claim Your Spot in the Founding Cohort Before Enrollment Closes"

VARIANT 5 (Short & Punchy):
"Start Building Inside ${productName} →"${extraNote}`

    case 'bio':
      return `[3 SOCIAL & PROFILE BIO VARIATIONS]

1. TWITTER / X & INSTAGRAM (SHORT & PUNCHY):
${name} | Building ${productName} 🚀
Helping ${audience} master ${niche}.
Join our founding cohort: https://${cleanHandle}.co-launch.app 👇

2. LINKEDIN & YOUTUBE (PROFESSIONAL & CREDIBLE):
Founder of ${productName}. Creator at ${handle}. Dedicated to building practical frameworks and community for practitioners in ${niche}.

3. EXTENDED ABOUT / HERO BIO:
Hey, I'm ${name}. After years of experimenting in ${niche}, I launched ${productName} to give ambitious creators the exact blueprints, community, and guidance they need to succeed without the burnout.${extraNote}`

    // ── REPURPOSE ──
    case 'repurpose-short':
      return `[5 STANDALONE SHORT POSTS DERIVED FROM ${productName.toUpperCase()}]

POST 1:
The secret to ${niche} isn't more information. It's better curation. Cut 90% of the noise and focus on one clear system.

POST 2:
Most creators build in isolation and wonder why momentum stalls. Surround yourself with people on the exact same mission.

POST 3:
If you want to accelerate your growth in ${niche}, master ${f2}. Master the fundamentals before chasing shiny tactics.

POST 4:
Consistency is easy when you have a proven roadmap. It's almost impossible when you have to invent your plan every morning.

POST 5:
We officially opened founding enrollment for ${productName} today. If you're ready to build with us, link is in my bio!${extraNote}`

    case 'repurpose-platform':
      return `[ONE CORE CONCEPT ADAPTED FOR 4 PLATFORMS]

1. FOR X / TWITTER:
You don't need 10 different tools to master ${niche}.
You need:
• 1 clear execution framework
• 1 dedicated community
• Weekly feedback loops
That's why I created ${productName}. Founding passes open: https://${cleanHandle}.co-launch.app

2. FOR LINKEDIN:
The biggest obstacle in ${niche} today is fragmented learning. When practitioners have access to a structured curriculum and active peer reviews, outcomes improve exponentially. That is the core thesis behind ${productName}.

3. FOR INSTAGRAM:
Everything I wish I knew about ${niche} when I started is now in one place. Proud to introduce ${productName}. Tap the bio link for founding member access! 🚀

4. FOR YOUTUBE COMMUNITY:
Big news! The official ${productName} member portal is live. Check the pinned link to join our founding cohort at ${pricing}.${extraNote}`

    case 'repurpose-email':
      return `Subject: The fundamental rule of ${niche} (and why it matters today)

Hey everyone,

If you look at the creators who consistently win in ${niche}, they rarely have more natural talent than everyone else.

What they have is an operational framework.

They don't guess what to work on when they sit down at their desk. They have a system that removes friction and builds compounding momentum.

That’s why I created ${productName}. I wanted to take our internal frameworks—from ${f1} to ${f2}—and make them available to anyone ready to take this work seriously.

If you’ve been looking for that missing structure, our founding doors are currently open at ${pricing}.

Check it out here:
https://${cleanHandle}.co-launch.app

Have an amazing week ahead!

${name}${extraNote}`

    case 'comment-reply':
      return `[5 READY-TO-USE ENGAGEMENT & COMMENT REPLIES]

REPLY 1 (When someone asks for the link):
"Just sent you a direct message with all the details! You can also check it directly here: https://${cleanHandle}.co-launch.app 🚀"

REPLY 2 (When someone asks about beginner suitability):
"100%! We designed ${productName} with clear beginner foundations through advanced execution modules so you can progress at your own pace."

REPLY 3 (When someone asks about pricing):
"Founding passes are locked at ${pricing} right now! It gives you full access to all current and future modules plus our live calls."

REPLY 4 (When someone compliments the content):
"Appreciate you so much! We dive even deeper into this exact strategy inside ${productName} if you want to join us!"

REPLY 5 (When someone asks about time commitment):
"Most members spend about 2 hours a week going through the core modules. Everything is recorded and self-paced!"${extraNote}`

    // ── PODCAST ──
    case 'podcast-outline':
      return `[EPISODE MASTER OUTLINE: 30 MINUTES]
Episode Title: The Future of ${niche} and How to Build a Real Asset
Host: ${name} (${handle})

[00:00 - 03:00] HOOK & COLD OPEN
• Why the traditional approach to ${niche} is failing in 2026
• The difference between chasing fleeting views and building an owned ecosystem

[03:00 - 12:00] SEGMENT 1: THE FOUNDATIONAL SHIFT
• Decoupling your time from your output
• The role of structured frameworks (${f2}) in eliminating creator fatigue

[12:00 - 20:00] SEGMENT 2: THE COMMUNITY ADVANTAGE
• Why audiences want connection, not just another video
• How ${f1} creates compounding retention and peer-driven success

[20:00 - 26:00] SEGMENT 3: THE ${productName.toUpperCase()} BLUEPRINT
• Behind the scenes of how we built ${productName}
• Walking through ${f3} and our member resources

[26:00 - 30:00] EPISODE WRAP & LISTENER CALL TO ACTION
• Summary of the 3 key takeaways
• Special invitation for listeners: Join ${productName} at ${pricing}
• Official show link: https://${cleanHandle}.co-launch.app${extraNote}`

    case 'podcast-intro':
      return `[PODCAST SHOW INTRO & COLD OPEN]

"Welcome back to the show, everybody! I'm your host, ${name}.

If you're passionate about ${niche}, but you're exhausted from guessing your next move and building in isolation, this episode was created specifically for you.

Today, we are breaking down the exact systems required to transform your skills into a high-leverage asset. No fluff, no generic motivational speeches—just the actionable blueprints we use every single day.

And before we jump in: founding passes for our brand-new community, ${productName}, are officially live right now at https://${cleanHandle}.co-launch.app.

Grab a notepad, settle in, and let's dive into today's episode."${extraNote}`

    // ── PRODUCT SPECIFIC ──
    case 'Create onboarding sequence':
      return `**ONBOARDING SEQUENCE FOR ${productName.toUpperCase()}**

**Step 1: Welcome & Setup (Sent immediately upon signup)**
Subject: You're in! Welcome to ${productName} 🎉
Hey there,
Welcome to ${productName}! Over the next few weeks, you'll get immediate access to our private community hub, ${f2}, and our weekly live Q&A sessions.
First step: Click the link to complete your member profile and introduce yourself in the introductions thread!

**Step 2: Core Framework Orientation (Sent on Day 2)**
Subject: Your first win inside ${productName} 🎯
Hey,
Today, start with Module 1: "${f2}". This 15-minute breakdown gives you our core mental model for ${niche}. Download the companion checklist before diving in.

**Step 3: Community & Live Call Invitation (Sent on Day 4)**
Subject: Live Q&A this week + community highlights 👋
Hey,
Our next live session (${f3}) is coming up. Make sure to RSVP in the Schedule tab and submit your questions in advance so we can tackle them live!${extraNote}`

    case 'Write product description':
      return `${productName} is the all-in-one ecosystem built for ${audience} in ${niche}. Combining structured step-by-step masterclasses, a dedicated peer community, and direct weekly strategy calls with ${name}, ${productName} removes the guesswork and accelerates your trajectory from day one.${extraNote}`

    default:
      return `**${productName} — Official Content Draft**

Topic: Advancing in ${niche} with clarity and momentum.
Creator: ${name} (${handle})

Key takeaways:
• Stop building in isolation — join fellow creators in our dedicated community (${f1})
• Follow a structured step-by-step execution roadmap (${f2})
• Get direct live feedback and guidance (${f3})

Founding passes are available today at ${pricing}.
Join us here: https://${cleanHandle}.co-launch.app${extraNote}`
  }
}

export function refineAuthenticCopy(originalCopy, instruction, typeId, creatorData, tone) {
  const ctx = extractCreatorDetails(creatorData)
  const instrLower = (instruction || '').toLowerCase()

  if (instrLower.includes('shorten') || instrLower.includes('concise')) {
    const lines = (originalCopy || '').split('\n').filter(Boolean)
    const condensed = lines.slice(0, Math.max(3, Math.floor(lines.length * 0.6))).join('\n\n')
    return `${condensed}\n\n👉 Join ${ctx.productName} today: https://${ctx.cleanHandle}.co-launch.app`
  }

  if (instrLower.includes('bolder') || instrLower.includes('high-energy')) {
    return `🔥 ATTENTION ${ctx.niche.toUpperCase()} CREATORS:

${originalCopy}

Don't settle for average results. Step inside ${ctx.productName} right now:
https://${ctx.cleanHandle}.co-launch.app`
  }

  if (instrLower.includes('simplify')) {
    return `Here is the simple truth about ${ctx.niche}:

${ctx.f2} makes everything easier.
When you combine it with ${ctx.f1}, you stop guessing and start making real progress.

That is why I created ${ctx.productName}.
Join us here for ${ctx.pricing}: https://${ctx.cleanHandle}.co-launch.app`
  }

  return `[Refined Direction: ${instruction}]\n\n${originalCopy || generateAuthenticFallbackCopy(typeId, creatorData, tone)}`
}

