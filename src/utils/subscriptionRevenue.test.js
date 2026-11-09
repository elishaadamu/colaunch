import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSubscriptionRevenue,
  formatRevenueAmount,
  clampPrice,
  parseFollowerCount,
  REVENUE_DISCLAIMER
} from './subscriptionRevenue.js';

describe('subscriptionRevenue helper', () => {
  it('clamps monthly price between $9 and $29', () => {
    assert.equal(clampPrice(5), 9);
    assert.equal(clampPrice(50), 29);
    assert.equal(clampPrice(19), 19);
    assert.equal(clampPrice(' $24/mo '), 24);
  });

  it('formats revenue amounts with proper units without unit-mixing', () => {
    assert.equal(formatRevenueAmount(190), '$190');
    assert.equal(formatRevenueAmount(950), '$950');
    assert.equal(formatRevenueAmount(1200), '$1.2K');
    assert.equal(formatRevenueAmount(24000), '$24K');
    assert.equal(formatRevenueAmount(1200000), '$1.2M');
  });

  it('produces valid low <= high ranges for small creators (4K audience, e.g. @akvofoundation)', () => {
    const res = calculateSubscriptionRevenue({
      audience: 4000,
      monthlyPrice: 19,
      engagementRate: 3.5
    });

    assert.ok(res.low <= res.high);
    assert.ok(res.subscribersLow >= 5);
    assert.notEqual(res.subscribersLow, 1);
    assert.equal(res.formattedLow, '$190');
    assert.equal(res.formattedHigh, '$570');
    assert.equal(res.formattedRange, '$190–$570 / mo');
    assert.equal(res.disclaimer, REVENUE_DISCLAIMER);
  });

  it('produces valid low <= high ranges for large creators (500K+ audience)', () => {
    const res = calculateSubscriptionRevenue({
      audience: 500000,
      monthlyPrice: 24,
      engagementRate: 4.8
    });

    assert.ok(res.low <= res.high);
    assert.ok(res.formattedLow.includes('K'));
    assert.ok(res.formattedHigh.includes('K'));
    assert.ok(res.subscribersLow > 1000);
  });

  it('handles tiny audiences gracefully without 1-subscriber outputs', () => {
    const res = calculateSubscriptionRevenue({
      audience: 350,
      monthlyPrice: 15
    });

    assert.ok(res.low <= res.high);
    assert.ok(res.subscribersLow >= 5);
    assert.notEqual(res.subscribersLow, 1);
  });
});
