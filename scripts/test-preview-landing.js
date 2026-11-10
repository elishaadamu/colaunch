import assert from 'node:assert';
import {
  buildDeterministicLandingCopy,
  validateLandingCopy,
  getInitialLandingCopy,
  LANDING_COPY_SCHEMA_VERSION
} from '../src/services/landingCopy.js';
import { calculateSubscriptionRevenue, clampPrice } from '../src/utils/subscriptionRevenue.js';

console.log('--- RUNNING PREVIEW LANDING PAGE & COPY TESTS ---');

// 1. Test @akvofoundation (~3.8K followers)
const akvoData = {
  handle: '@akvofoundation',
  name: 'Akvofoundation',
  followers: 3800,
  platform: 'youtube',
  description: 'Akvo helps people use data to transform international development.',
  audienceIntelligence: {
    pain_points: [
      { title: 'Scattered Resources Across Multiple Platforms', percentage: 39, description: 'Viewers waste time searching through links.' },
      { title: 'Lack of Direct Interactive Access & Feedback', percentage: 29, description: 'Comments get lost in YouTube algorithm.' }
    ],
    requests: [
      { title: 'Centralized tools for data monitoring', quote: 'Where can we access this setup?' }
    ]
  }
};

const akvoBlueprint = {
  name: 'AkvoLink Hub',
  tool_summary: 'Centralized platform for all video resources, links, and mentions',
  target_audience: "Akvofoundation's YouTube followers seeking resource consolidation",
  monthly_price: 15,
  features: ['Real-time telemetry', 'Custom metrics', 'Workflow status', 'Data export'],
  category: 'dashboard'
};

const akvoCopy = buildDeterministicLandingCopy(akvoData, akvoBlueprint);

console.log('1. Checking Akvo Landing Copy structure:');
assert.strictEqual(akvoCopy.schemaVersion, LANDING_COPY_SCHEMA_VERSION, 'Schema version matches');
assert.strictEqual(akvoCopy.productName, 'AkvoLink Hub', 'Product name matches');
assert.ok(akvoCopy.headline.length > 10, 'Headline is outcome focused');
assert.ok(akvoCopy.subheadline.includes('Centralized platform'), 'Subheadline derived from tool_summary');
assert.strictEqual(akvoCopy.monthlyPrice, 15, 'Monthly price is 15');
assert.ok(akvoCopy.problemPoints.length >= 2, 'Has at least 2 problem statements');

// Ensure NO percentages (e.g. 39%) appear in public problem points
akvoCopy.problemPoints.forEach((pt, i) => {
  assert.ok(!/\b\d+%\b/.test(pt), `Problem point ${i + 1} must not contain percentage figures: "${pt}"`);
});

// Ensure features match
assert.strictEqual(akvoCopy.features.length, 4, 'Feature count matches blueprint');
assert.strictEqual(akvoCopy.features[0].title, 'Real-time telemetry');
assert.ok(akvoCopy.features[0].description.length > 10, 'Feature has benefit description');

// Check pricing and honest cancellation copy
assert.strictEqual(akvoCopy.pricing.price, 15);
assert.strictEqual(akvoCopy.pricing.cancelNote, 'Cancel anytime.');
assert.ok(!JSON.stringify(akvoCopy).toLowerCase().includes('no hidden fees'), 'Must NOT contain "no hidden fees"');

// Check validation
const isValidAkvo = validateLandingCopy(akvoCopy, akvoBlueprint);
assert.strictEqual(isValidAkvo, true, 'Akvo copy passes validation');
console.log('✓ Akvofoundation copy validated successfully.');

// 2. Test 500K+ Creator (@mkbhd)
const mkbhdData = {
  handle: '@mkbhd',
  name: 'Marques Brownlee',
  followers: 550000,
  platform: 'youtube',
  description: 'Quality Tech Videos | Geek | Consumer Electronics'
};

const mkbhdBlueprint = {
  name: 'Reliability Review Radar',
  tool_summary: 'Aggregates daily-driver reliability scores from user reviews into an unbiased dashboard',
  target_audience: 'Tech enthusiasts seeking unbiased product insights',
  monthly_price: 19,
  features: ['Daily progress logging', 'Community benchmarks', 'Goal milestones', 'Automated reports'],
  category: 'tracker'
};

const mkbhdCopy = buildDeterministicLandingCopy(mkbhdData, mkbhdBlueprint);

console.log('2. Checking 500K+ Creator (@mkbhd) Landing Copy:');
assert.strictEqual(mkbhdCopy.productName, 'Reliability Review Radar');
assert.strictEqual(mkbhdCopy.monthlyPrice, 19);
assert.strictEqual(mkbhdCopy.howItWorks.length, 3, 'Exactly 3 workflow steps');
assert.ok(mkbhdCopy.faq.length >= 5, 'At least 5 FAQ questions');

const rev500k = calculateSubscriptionRevenue({ audience: 550000, monthlyPrice: 19 });
assert.ok(rev500k.low <= rev500k.high, 'Revenue low <= high');
console.log(`✓ 500K audience revenue estimate: ${rev500k.formattedRange} (${rev500k.formattedSubscribers} subscribers)`);

// 3. Test Copy Validation Rejection (Forbidden claims)
console.log('3. Testing Validator against fake claims:');
const invalidCopy = {
  ...akvoCopy,
  pricing: { ...akvoCopy.pricing, guarantee: 'No hidden fees guaranteed' }
};
assert.strictEqual(validateLandingCopy(invalidCopy, akvoBlueprint), false, 'Validator rejects "No hidden fees"');

const fakeRatingCopy = {
  ...akvoCopy,
  subheadline: 'Rated 4.9/5 stars by over 10,000+ users worldwide.'
};
assert.strictEqual(validateLandingCopy(fakeRatingCopy, akvoBlueprint), false, 'Validator rejects fake star ratings and user counts');

const unapprovedFeatureCopy = {
  ...akvoCopy,
  features: [{ title: 'Invented Mystery Module', description: 'Does magic' }]
};
assert.strictEqual(validateLandingCopy(unapprovedFeatureCopy, akvoBlueprint), false, 'Validator rejects unapproved features');
console.log('✓ Validator correctly rejects unapproved claims and features.');

// 4. Test price update preserves copy
console.log('4. Testing Price update preservation:');
const updatedPriceCopy = getInitialLandingCopy({ ...akvoData, landingCopy: akvoCopy }, { ...akvoBlueprint, monthly_price: 24 });
assert.strictEqual(updatedPriceCopy.monthlyPrice, 24, 'Price updated to 24');
assert.strictEqual(updatedPriceCopy.headline, akvoCopy.headline, 'Headline remained untouched');
assert.strictEqual(updatedPriceCopy.subheadline, akvoCopy.subheadline, 'Subheadline remained untouched');
console.log('✓ Price changes update price without mutating copy.');

console.log('ALL TESTS PASSED SUCCESSFULLY!');

