/**
 * CoLaunch AI Avatar Vision & Brand Color Extractor
 *
 * Automatically inspects the creator's avatar image, extracts the dominant vibrant signature
 * brand color via computer vision & canvas quantization, and generates cohesive palettes
 * for Step 5 Landing Page Hero Mockups and Creator & Admin Dashboards.
 */

const COLOR_CACHE = new Map();

// Helper: RGB to HSL
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

// Helper: HSL to Hex
function hslToHex(h, s, l) {
  h = (h % 360 + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// Helper: RGB to Hex
function rgbToHex(r, g, b) {
  const clamp = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${clamp(r)}${clamp(g)}${clamp(b)}`.toUpperCase();
}

// Helper: Hex to RGB
export function hexToRgb(hex) {
  if (!hex) return [22, 163, 74];
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16),
      parseInt(clean[1] + clean[1], 16),
      parseInt(clean[2] + clean[2], 16)
    ];
  }
  if (clean.length >= 6) {
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16)
    ];
  }
  return [22, 163, 74];
}

// Helper: Hex to RGBA
export function hexToRgba(hex, alpha = 0.22) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Returns a human-friendly name for a given hex color
 */
export function getFriendlyColorName(hex) {
  if (!hex) return "Studio Emerald";
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);

  if (s < 12) {
    if (l < 25) return "Obsidian Slate";
    if (l > 75) return "Pure Steel";
    return "Industrial Slate";
  }

  if (h >= 345 || h < 15) return "Creator Crimson";
  if (h >= 15 && h < 45) return "Flame Orange";
  if (h >= 45 && h < 65) return "Venture Amber";
  if (h >= 65 && h < 100) return "Forge Lime";
  if (h >= 100 && h < 165) return "Studio Emerald";
  if (h >= 165 && h < 205) return "Ocean Cyan";
  if (h >= 205 && h < 240) return "Cobalt Blue";
  if (h >= 240 && h < 280) return "Royal Indigo";
  if (h >= 280 && h < 320) return "Venture Violet";
  return "Electric Rose";
}

/**
 * Quantize pixel data from canvas and pick the most vibrant, dominant brand signature color.
 */
export function analyzeImageData(data) {
  const buckets = {
    red: { count: 0, weight: 0, r: 0, g: 0, b: 0, h: 0, s: 0, l: 0 },
    orange: { count: 0, weight: 0, r: 0, g: 0, b: 0, h: 0, s: 0, l: 0 },
    amber: { count: 0, weight: 0, r: 0, g: 0, b: 0, h: 0, s: 0, l: 0 },
    lime: { count: 0, weight: 0, r: 0, g: 0, b: 0, h: 0, s: 0, l: 0 },
    green: { count: 0, weight: 0, r: 0, g: 0, b: 0, h: 0, s: 0, l: 0 },
    cyan: { count: 0, weight: 0, r: 0, g: 0, b: 0, h: 0, s: 0, l: 0 },
    blue: { count: 0, weight: 0, r: 0, g: 0, b: 0, h: 0, s: 0, l: 0 },
    indigo: { count: 0, weight: 0, r: 0, g: 0, b: 0, h: 0, s: 0, l: 0 },
    purple: { count: 0, weight: 0, r: 0, g: 0, b: 0, h: 0, s: 0, l: 0 },
    pink: { count: 0, weight: 0, r: 0, g: 0, b: 0, h: 0, s: 0, l: 0 },
    neutralDark: { count: 0, weight: 0, r: 0, g: 0, b: 0, h: 0, s: 0, l: 0 },
  };

  const len = data.length;
  // Sample every 4th pixel for speed
  for (let i = 0; i < len; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 120) continue; // Skip transparency

    const [h, s, l] = rgbToHsl(r, g, b);

    // Skip extreme pure white / highlight borders
    if (l > 92 && s < 18) continue;
    // Skip muddy low-saturation background noise unless very distinct
    if (s < 14) {
      if (l < 30) {
        buckets.neutralDark.count++;
        buckets.neutralDark.weight += (100 - l) * 0.2;
        buckets.neutralDark.r += r;
        buckets.neutralDark.g += g;
        buckets.neutralDark.b += b;
      }
      continue;
    }

    // Weight by vibrancy: high saturation and moderate lightness
    const vibrancyWeight = (s / 100) * 2.2 * (1 - Math.abs((l - 50) / 50));

    let bucketKey = "blue";
    if (h >= 345 || h < 15) bucketKey = "red";
    else if (h >= 15 && h < 45) bucketKey = "orange";
    else if (h >= 45 && h < 65) bucketKey = "amber";
    else if (h >= 65 && h < 100) bucketKey = "lime";
    else if (h >= 100 && h < 165) bucketKey = "green";
    else if (h >= 165 && h < 205) bucketKey = "cyan";
    else if (h >= 205 && h < 240) bucketKey = "blue";
    else if (h >= 240 && h < 280) bucketKey = "indigo";
    else if (h >= 280 && h < 320) bucketKey = "purple";
    else if (h >= 320 && h < 345) bucketKey = "pink";

    const bkt = buckets[bucketKey];
    bkt.count++;
    bkt.weight += vibrancyWeight;
    bkt.r += r;
    bkt.g += g;
    bkt.b += b;
    bkt.h += h;
    bkt.s += s;
    bkt.l += l;
  }

  // Find bucket with highest cumulative vibrancy weight
  let bestKey = null;
  let maxWeight = -1;

  for (const [key, bkt] of Object.entries(buckets)) {
    if (key === "neutralDark") continue;
    if (bkt.count > 0 && bkt.weight > maxWeight) {
      maxWeight = bkt.weight;
      bestKey = key;
    }
  }

  // If no chromatic color found, check neutral dark or fallback to Studio Emerald
  if (!bestKey || buckets[bestKey].count === 0) {
    if (buckets.neutralDark.count > 10) {
      return {
        primaryHex: "#38BDF8",
        name: "Electric Steel",
        isNeutral: true,
      };
    }
    return {
      primaryHex: "#10B981",
      name: "Studio Emerald",
      isFallback: true,
    };
  }

  const winner = buckets[bestKey];
  const avgR = winner.r / winner.count;
  const avgG = winner.g / winner.count;
  const avgB = winner.b / winner.count;
  const [h, s, l] = rgbToHsl(avgR, avgG, avgB);

  // Normalize lightness for maximum contrast and polish:
  // Ensure not too dark (< 36%) or too pale/bleached (> 68%)
  const tunedL = Math.max(38, Math.min(56, l));
  const tunedS = Math.max(65, Math.min(95, s));
  const primaryHex = hslToHex(h, tunedS, tunedL);

  return {
    primaryHex,
    name: getFriendlyColorName(primaryHex),
    hue: h,
    saturation: tunedS,
    lightness: tunedL,
  };
}

/**
 * Deterministic fallback color for creator based on handle / name / niche
 */
export function getDeterministicBrandColor(creator) {
  const name = String(creator?.name || creator?.display_name || creator?.handle || "Creator").toLowerCase();
  const niche = String(creator?.niche || "").toLowerCase();

  // Broadway, Musical Theater, Theater, Arts & Music
  if (
    niche.includes("theater") || niche.includes("theatre") || niche.includes("musical") ||
    niche.includes("broadway") || niche.includes("stage") || niche.includes("drama") ||
    niche.includes("music") || niche.includes("orchestra") || niche.includes("opera") ||
    name.includes("rodgers") || name.includes("hammerstein") || name.includes("broadway") ||
    name.includes("theater") || name.includes("theatre")
  ) {
    return { primaryHex: "#D97706", name: "Broadway Amber" };
  }

  if (niche.includes("tech") || niche.includes("code") || niche.includes("software")) {
    if (name.includes("coach")) return { primaryHex: "#16A34A", name: "Studio Emerald" };
    return { primaryHex: "#0284C7", name: "Ocean Cyan" };
  }
  if (niche.includes("ai") || niche.includes("data") || niche.includes("study")) {
    return { primaryHex: "#0284C7", name: "Electric Cobalt" };
  }
  if (niche.includes("pet") || niche.includes("community") || niche.includes("puppy") || niche.includes("media")) {
    return { primaryHex: "#D97706", name: "Venture Amber" };
  }
  if (niche.includes("game") || niche.includes("fitness")) {
    return { primaryHex: "#65A30D", name: "Forge Lime" };
  }
  if (niche.includes("finance") || niche.includes("invest") || niche.includes("crypto") || niche.includes("money")) {
    return { primaryHex: "#10B981", name: "Venture Emerald" };
  }

  // Hash based on letters - palette of vibrant, prestigious studio colors (no purple/violet)
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hues = [142, 199, 38, 215, 168, 340, 28]; // Emerald, Cyan, Gold, Cobalt, Teal, Crimson, Orange
  const chosenHue = hues[Math.abs(hash) % hues.length];
  const hex = hslToHex(chosenHue, 78, 48);

  return {
    primaryHex: hex,
    name: getFriendlyColorName(hex),
  };
}

/**
 * Extracts the signature brand color from the creator's avatar image URL.
 * Uses an offscreen canvas and handles CORS / proxy fallbacks.
 */
export async function extractBrandColorFromAvatar(avatarUrl, creator = null) {
  if (!avatarUrl && creator) {
    return getDeterministicBrandColor(creator);
  }
  if (!avatarUrl) {
    return { primaryHex: "#16A34A", name: "Studio Emerald" };
  }

  // Check in-memory cache
  if (COLOR_CACHE.has(avatarUrl)) {
    return COLOR_CACHE.get(avatarUrl);
  }

  // If URL has ui-avatars.com with explicit background
  if (avatarUrl.includes("ui-avatars.com") && avatarUrl.includes("background=")) {
    try {
      const match = avatarUrl.match(/background=([0-9a-fA-F]{6})/);
      if (match && match[1] && match[1].toLowerCase() !== "0f172a") {
        const hex = `#${match[1].toUpperCase()}`;
        const res = {
          primaryHex: hex,
          name: getFriendlyColorName(hex),
          source: "ui_avatar",
        };
        COLOR_CACHE.set(avatarUrl, res);
        return res;
      }
    } catch (e) { }
  }

  // Attempt client-side image load and canvas sampling
  return new Promise((resolve) => {
    // If running in non-browser environment
    if (typeof window === "undefined" || typeof document === "undefined") {
      const fb = getDeterministicBrandColor(creator);
      resolve(fb);
      return;
    }

    let hasResolved = false;
    const finish = (result) => {
      if (hasResolved) return;
      hasResolved = true;
      COLOR_CACHE.set(avatarUrl, result);
      try {
        if (result?.primaryHex) {
          const rawMap = localStorage.getItem("forge_creator_brand_color_map") || "{}";
          const map = JSON.parse(rawMap);
          if (creator?.id) map[creator.id] = result;
          if (creator?.handle) map[creator.handle.replace(/^@/, '').toLowerCase()] = result;
          if (creator?.name) map[creator.name.toLowerCase()] = result;
          localStorage.setItem("forge_creator_brand_color_map", JSON.stringify(map));
        }
      } catch {}
      resolve(result);
    };

    // Timeout safety: if image takes > 3.0s to load, fall back gracefully
    const timeoutTimer = setTimeout(() => {
      finish(getDeterministicBrandColor(creator));
    }, 3000);

    const trySampleUrl = (urlToSample, isRetry = false) => {
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          const size = 48;
          canvas.width = size;
          canvas.height = size;

          ctx.drawImage(img, 0, 0, size, size);
          const imageData = ctx.getImageData(0, 0, size, size);
          const analysis = analyzeImageData(imageData.data);

          clearTimeout(timeoutTimer);
          finish({
            ...analysis,
            source: isRetry ? "avatar_proxy_vision" : "avatar_vision",
          });
        } catch (err) {
          // If direct load hit CORS taint, try backend proxy once
          if (!isRetry && !urlToSample.includes("/api/proxy/avatar") && urlToSample.startsWith("http")) {
            const proxyUrl = `/api/proxy/avatar?url=${encodeURIComponent(urlToSample)}`;
            trySampleUrl(proxyUrl, true);
          } else {
            clearTimeout(timeoutTimer);
            finish(getDeterministicBrandColor(creator));
          }
        }
      };

      img.onerror = () => {
        if (!isRetry && !urlToSample.includes("/api/proxy/avatar") && urlToSample.startsWith("http")) {
          const proxyUrl = `/api/proxy/avatar?url=${encodeURIComponent(urlToSample)}`;
          trySampleUrl(proxyUrl, true);
        } else {
          clearTimeout(timeoutTimer);
          finish(getDeterministicBrandColor(creator));
        }
      };

      img.src = urlToSample;
    };

    // Clean original URL (unwrap proxy if present)
    let cleanUrl = avatarUrl;
    if (cleanUrl.includes('/api/proxy/avatar?url=')) {
      try {
        cleanUrl = decodeURIComponent(cleanUrl.split('/api/proxy/avatar?url=')[1]);
      } catch {}
    }

    // Always attempt direct clean URL first with crossOrigin="anonymous" (e.g. YouTube CDN yt3.ggpht.com supports CORS)
    trySampleUrl(cleanUrl, false);
  });
}

/**
 * Returns a set of 3 harmonious concept colors derived from the creator's avatar brand color:
 * - Concept 1: Primary Signature Brand Color (guaranteed high contrast)
 * - Concept 2: High-Contrast AI Copilot Accent (Analogous or High-Tech Cyan/Indigo pair)
 * - Concept 3: Warm Executive Mastermind Accent (Complementary Gold/Amber, Cyan, or Lime - never dark slate)
 */
export function getHarmoniousConceptColors(primaryHex) {
  let safeHex = primaryHex || "#10B981";
  const clean = safeHex.replace('#', '').toLowerCase().trim();
  if (['0f172a', '1e293b', '090b10', '0a0e17', '000000', '111827', '334155', '475569'].includes(clean)) {
    safeHex = "#06B6D4";
  }

  const [r, g, b] = hexToRgb(safeHex);
  const [h, s, l] = rgbToHsl(r, g, b);

  // Concept 1 is the signature color (boost lightness if too dark)
  const c1 = l < 35 ? hslToHex(h, Math.max(75, s), 50) : safeHex;

  // Concept 2: Shift hue by +38° to +48° for high-contrast tech accent
  let h2 = (h + 40) % 360;
  if (h >= 180 && h <= 220) {
    h2 = 255; // Royal indigo
  } else if (h >= 100 && h <= 165) {
    h2 = 199; // Ocean cyan
  }
  const c2 = hslToHex(h2, Math.max(75, s), Math.max(48, Math.min(58, l)));

  // Concept 3: Warm executive amber or vibrant cyan/lime (never dark slate)
  let c3;
  if (h >= 30 && h <= 70) {
    c3 = "#06B6D4"; // Ocean Cyan
  } else if (h >= 170 && h <= 250) {
    c3 = "#F59E0B"; // Warm Gold/Amber
  } else {
    c3 = "#F59E0B"; // Venture Amber
  }

  return [c1, c2, c3];
}

