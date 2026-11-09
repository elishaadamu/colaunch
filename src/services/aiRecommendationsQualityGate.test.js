import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizePainPoints,
  validateRecommendationQualityGate,
  cleanEvidenceList,
  deriveFeaturesFromToolSummary,
  deriveWhoPaysAndWhy,
  sanitizeTargetAudience,
  calibrateProductPricing,
  areRecsValidForCreator
} from './ai.js'

describe('normalizePainPoints', () => {
  it('ensures pain point percentages sum to <= 100%', () => {
    const raw = [
      { title: 'Pain 1', percentage: 39 },
      { title: 'Pain 2', percentage: 29 },
      { title: 'Pain 3', percentage: 28 },
      { title: 'Pain 4', percentage: 12 },
    ] // Sum was 108%
    const normalized = normalizePainPoints(raw)
    const sum = normalized.reduce((acc, p) => acc + p.percentage, 0)
    assert.ok(sum <= 100, `Sum ${sum} should be <= 100`)
    assert.strictEqual(normalized.length, 4)
  })

  it('keeps valid percentages unchanged if sum <= 100%', () => {
    const raw = [
      { title: 'Pain 1', percentage: 38 },
      { title: 'Pain 2', percentage: 29 },
      { title: 'Pain 3', percentage: 21 },
      { title: 'Pain 4', percentage: 12 },
    ]
    const normalized = normalizePainPoints(raw)
    const sum = normalized.reduce((acc, p) => acc + p.percentage, 0)
    assert.strictEqual(sum, 100)
  })
})

describe('validateRecommendationQualityGate', () => {
  const akvoCreator = {
    handle: '@akvofoundation',
    name: 'Akvofoundation',
    niche: 'International Development & Data',
    description: 'Akvo helps people use data, to transform international development',
    recentPosts: [
      { title: 'IWSMS - a platform for water monitoring' },
      { title: 'Por eso existe Akvo' },
      { title: 'Why does Akvo exist' }
    ]
  }

  it('rejects course-like or content-like ideas (e.g. step-by-step guides, pathways)', () => {
    const contentIdea = {
      product_name: 'Akvo Execution Pathway',
      product_category: 'tool',
      tool_summary: 'Structured step-by-step guides to execute field data projects.',
      target_audience: 'Field practitioners',
      monthly_price: 24
    }
    assert.strictEqual(validateRecommendationQualityGate(contentIdea, akvoCreator), false)
  })

  it('rejects off-niche ideas based on stray spam comments (e.g. children learning for development data)', () => {
    const offNicheIdea = {
      product_name: 'Akvo Engaged Learning for All',
      product_category: 'tool',
      tool_summary: 'Track progress on children development and student learning.',
      target_audience: 'Parents and teachers',
      monthly_price: 9
    }
    assert.strictEqual(validateRecommendationQualityGate(offNicheIdea, akvoCreator), false)
  })

  it('accepts interactive software apps aligned with creator domain', () => {
    const validSoftwareIdea = {
      product_name: 'AkvoLink Hub',
      product_category: 'tool',
      tool_summary: 'Centralized portal and repository for all video resources, links, and tool mentions.',
      target_audience: 'Project coordinators, field officers, and development partners',
      monthly_price: 9
    }
    assert.strictEqual(validateRecommendationQualityGate(validSoftwareIdea, akvoCreator), true)
  })
})

describe('cleanEvidenceList', () => {
  const realComments = [
    { text: 'Great explanation on water monitoring systems.' },
    { comment: 'How can we connect this with our field surveys?' }
  ]
  const recentPosts = [
    { title: 'IWSMS - a platform for water monitoring' }
  ]

  it('preserves genuine comments and video topics', () => {
    const evidence = [
      '38% of comments indicate need for data collection tools',
      'Viewer inquiry: "How can we connect this with our field surveys?"'
    ]
    const cleaned = cleanEvidenceList(evidence, realComments, recentPosts)
    assert.strictEqual(cleaned.length, 2)
  })

  it('drops fabricated quoted questions that do not exist in real comments or transcripts', () => {
    const evidence = [
      '39% of comments indicate frustration with scattered resources',
      'Recurring audience question: "Where can we access your mentioned setups?"' // Fabricated quote
    ]
    const cleaned = cleanEvidenceList(evidence, realComments, recentPosts)
    assert.strictEqual(cleaned.length, 1)
    assert.strictEqual(cleaned[0], '39% of comments indicate frustration with scattered resources')
  })
})

describe('deriveFeaturesFromToolSummary', () => {
  it('generates domain-specific features rather than generic category templates', () => {
    const features = deriveFeaturesFromToolSummary(
      'Centralized platform for all video resources, links, and mentions.',
      'AkvoLink Hub',
      'dashboard'
    )
    assert.strictEqual(features.length, 4)
    assert.ok(features.some(f => f.toLowerCase().includes('hub') || f.toLowerCase().includes('link')))
    assert.ok(!features.includes('Real-time telemetry'), 'Must not default to generic dashboard telemetry')
  })
})

describe('calibrateProductPricing', () => {
  it('clamps simple link hubs to $9/mo entry tier', () => {
    const priced = calibrateProductPricing({
      product_name: 'AkvoLink Hub',
      tool_summary: 'Centralized platform for all video resources, links, and mentions',
      monthly_price: 15
    })
    assert.strictEqual(priced, 9)
  })

  it('keeps justified software pricing for functional tools', () => {
    const priced = calibrateProductPricing({
      product_name: 'Data Indicator Tracker',
      tool_summary: 'Automated field indicator tracking and progress forecasting',
      monthly_price: 24
    })
    assert.strictEqual(priced, 24)
  })
})

describe('sanitizeTargetAudience & deriveWhoPaysAndWhy', () => {
  it('rewrites vague target audience phrases into concrete roles', () => {
    const clean = sanitizeTargetAudience('AkvoFoundation\'s YouTube followers seeking resource consolidation')
    assert.strictEqual(clean, 'Project coordinators, field officers, and team leads')
  })

  it('generates a concrete who pays and why statement', () => {
    const statement = deriveWhoPaysAndWhy({
      product_name: 'AkvoLink Hub',
      target_audience: 'Project coordinators, field officers, and team leads',
      monthly_price: 9
    })
    assert.ok(statement.includes('Project coordinators, field officers, and team leads'))
    assert.ok(statement.includes('$9/mo'))
  })
})

