/**
 * subscriptionRevenue.js
 *
 * Single shared helper for CoLaunch subscription revenue estimation.
 * Formula: Estimated Gross Subscription Revenue = Estimated Subscribers × Monthly Price
 *
 * Conversion rate ranges from 0.25% (conservative floor) to 0.75% (target/healthy),
 * slightly calibrated by audience engagement rate within a documented, realistic band.
 */

export const REVENUE_DISCLAIMER = 'estimated gross subscription revenue, example not a forecast';

/**
 * Robust follower parsing that handles numeric values and strings like "455K", "1.2M", "10,500".
 */
export function parseFollowerCount(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.round(val);
  if (!val) return 0;
  const s = String(val).replace(/,/g, '').trim().toLowerCase();
  const m = s.match(/([\d.]+)\s*([kmb])?/);
  if (m) {
    const num = parseFloat(m[1]) || 0;
    const unit = m[2];
    if (unit === 'b') return Math.round(num * 1_000_000_000);
    if (unit === 'm') return Math.round(num * 1_000_000);
    if (unit === 'k') return Math.round(num * 1_000);
    return Math.round(num);
  }
  return parseInt(s, 10) || 0;
}

export function clampPrice(price) {
  const num = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return 19;
  return Math.min(29, Math.max(9, Math.round(num)));
}

export function formatRevenueAmount(amount) {
  const num = Math.round(Number(amount) || 0);
  if (num >= 1_000_000) {
    const m = num / 1_000_000;
    return m % 1 === 0 ? `$${m}M` : `$${m.toFixed(1)}M`;
  }
  if (num >= 1_000) {
    const k = num / 1_000;
    if (k < 10 && (k * 10) % 10 !== 0) {
      return `$${k.toFixed(1)}K`;
    }
    return `$${Math.round(k)}K`;
  }
  return `$${num}`;
}

export function calculateSubscriptionRevenue({
  audience = 0,
  monthlyPrice = 19,
  engagementRate = 3.5,
}) {
  const f = Math.max(0, parseFollowerCount(audience));
  const price = clampPrice(monthlyPrice);

  if (f === 0) {
    return {
      subscribersLow: 0,
      subscribersHigh: 0,
      subscribersMid: 0,
      low: 0,
      high: 0,
      mid: 0,
      price,
      formattedLow: '$0',
      formattedHigh: '$0',
      formattedRange: '$0 / mo',
      formattedSubscribers: '0',
      disclaimer: REVENUE_DISCLAIMER,
      isAvailable: false,
    };
  }

  // Engagement calibration: engagement rate shifts conversion slightly within [0.20% - 0.90%]
  const eng = Math.max(0.5, Math.min(15.0, parseFloat(engagementRate) || 3.5));
  const engShift = ((eng - 3.5) / 10) * 0.0015; // ±0.05% to ±0.15%

  const convLow = Math.max(0.0020, 0.0025 + engShift);
  const convHigh = Math.max(convLow + 0.0025, Math.min(0.0090, 0.0075 + engShift));

  // Handle tiny audiences gracefully: ensure no "1 subscriber" outputs (minimum founding cohort floor of 5)
  const rawSubLow = Math.round(f * convLow);
  const rawSubHigh = Math.round(f * convHigh);

  const subscribersLow = Math.max(5, rawSubLow);
  const subscribersHigh = Math.max(subscribersLow + 5, rawSubHigh);
  const subscribersMid = Math.round((subscribersLow + subscribersHigh) / 2);

  const low = subscribersLow * price;
  const high = Math.max(low, subscribersHigh * price);
  const mid = Math.round((low + high) / 2);

  const formattedLow = formatRevenueAmount(low);
  const formattedHigh = formatRevenueAmount(high);

  return {
    subscribersLow,
    subscribersHigh,
    subscribersMid,
    low,
    high,
    mid,
    price,
    formattedLow,
    formattedHigh,
    formattedRange: `${formattedLow}–${formattedHigh} / mo`,
    formattedSubscribers: `${subscribersLow.toLocaleString()}–${subscribersHigh.toLocaleString()}`,
    disclaimer: REVENUE_DISCLAIMER,
    isAvailable: true,
  };
}
