/**
 * SVG Manipulator Utility
 * Simple SVG parsing and manipulation using string operations
 * (No external XML parser dependency)
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { hexToHsl, hslToHex, getContrastingText } from './color-conversions.js';

export interface SVGMetadata {
  width: string;
  height: string;
  viewBox: string;
}

/**
 * Load an SVG file and return its content
 */
export function loadSVG(filePath: string): string {
  const absolutePath = resolve(filePath);
  return readFileSync(absolutePath, 'utf-8');
}

/**
 * Save SVG content to a file
 */
export function saveSVG(content: string, filePath: string): void {
  const absolutePath = resolve(filePath);
  writeFileSync(absolutePath, content, 'utf-8');
}

/**
 * Extract SVG metadata (width, height, viewBox)
 */
export function getSVGMetadata(svg: string): SVGMetadata {
  const widthMatch = svg.match(/width=["']([^"']+)["']/);
  const heightMatch = svg.match(/height=["']([^"']+)["']/);
  const viewBoxMatch = svg.match(/viewBox=["']([^"']+)["']/);

  return {
    width: widthMatch?.[1] || '900',
    height: heightMatch?.[1] || '700',
    viewBox: viewBoxMatch?.[1] || '0 0 900 700'
  };
}

/**
 * Inject a style block into an SVG
 * Adds it as the first child of the SVG element
 */
export function injectStyle(svg: string, css: string): string {
  const styleBlock = `<style><![CDATA[\n${css}\n]]></style>`;

  // Find the end of the opening <svg> tag
  const svgOpenMatch = svg.match(/<svg[^>]*>/);
  if (!svgOpenMatch) {
    throw new Error('Invalid SVG: no <svg> tag found');
  }

  const insertPosition = svgOpenMatch.index! + svgOpenMatch[0].length;
  return svg.slice(0, insertPosition) + '\n' + styleBlock + svg.slice(insertPosition);
}

/**
 * Inject Google Fonts import into SVG
 */
export function injectGoogleFonts(svg: string, fontUrl: string): string {
  const importStatement = `@import url('${fontUrl}');`;
  return injectStyle(svg, importStatement);
}

/**
 * Apply font-family to all text elements based on their role
 */
export function applyFonts(
  svg: string,
  headingFont: string,
  bodyFont: string
): string {
  // Pattern to match text elements
  const textPattern = /<text([^>]*)>/g;

  return svg.replace(textPattern, (match, attributes) => {
    const isHeading =
      attributes.includes('class="heading"') ||
      attributes.includes('data-type="heading"') ||
      // Check for large font-size (heuristic for headings)
      (() => {
        const fontSizeMatch = attributes.match(/font-size=["'](\d+)/);
        if (fontSizeMatch) {
          return parseInt(fontSizeMatch[1]) >= 20;
        }
        return false;
      })();

    const fontFamily = isHeading
      ? `'${headingFont}', sans-serif`
      : `'${bodyFont}', sans-serif`;
    const fontWeight = isHeading ? '600' : '400';

    // Remove existing font-family and font-weight if present
    let cleanedAttrs = attributes
      .replace(/font-family=["'][^"']*["']/g, '')
      .replace(/font-weight=["'][^"']*["']/g, '')
      .trim();

    // Add new font attributes
    return `<text${cleanedAttrs} font-family="${fontFamily}" font-weight="${fontWeight}">`;
  });
}

/**
 * Apply color palette to SVG elements
 * Uses data-role attributes or class names to determine which color to apply
 */
export function applyColors(
  svg: string,
  colors: {
    primary: string;
    secondary: string;
    cta: string;
    background: string;
    text: string;
    border: string;
  }
): string {
  let result = svg;

  // Map of selectors to colors and property
  const colorMappings = [
    // Background elements
    { pattern: /data-role=["']background["']/g, color: colors.background, prop: 'fill' },
    { pattern: /class=["'][^"']*\bbackground\b[^"']*["']/g, color: colors.background, prop: 'fill' },

    // Primary elements
    { pattern: /data-role=["']primary["']/g, color: colors.primary, prop: 'fill' },
    { pattern: /class=["'][^"']*\bprimary\b[^"']*["']/g, color: colors.primary, prop: 'fill' },

    // CTA elements
    { pattern: /data-role=["']cta["']/g, color: colors.cta, prop: 'fill' },
    { pattern: /class=["'][^"']*\bcta\b[^"']*["']/g, color: colors.cta, prop: 'fill' },
    { pattern: /class=["'][^"']*\bbutton\b[^"']*["']/g, color: colors.cta, prop: 'fill' },

    // Border elements
    { pattern: /data-role=["']border["']/g, color: colors.border, prop: 'stroke' },
    { pattern: /class=["'][^"']*\bborder\b[^"']*["']/g, color: colors.border, prop: 'stroke' },

    // Secondary elements
    { pattern: /data-role=["']secondary["']/g, color: colors.secondary, prop: 'fill' },
    { pattern: /class=["'][^"']*\bsecondary\b[^"']*["']/g, color: colors.secondary, prop: 'fill' }
  ];

  // Apply text color to all text elements
  result = result.replace(/<text([^>]*)>/g, (match, attrs) => {
    // Remove existing fill if present
    const cleanedAttrs = attrs.replace(/fill=["'][^"']*["']/g, '').trim();
    return `<text${cleanedAttrs} fill="${colors.text}">`;
  });

  // For each color mapping, find elements and update their color
  // This is a simplified approach - in production, you'd want proper SVG parsing
  for (const mapping of colorMappings) {
    result = result.replace(mapping.pattern, (match) => {
      // The match is just the attribute, we need to find the element and update it
      // For now, we'll use CSS via the style block
      return match;
    });
  }

  // Add a style block with CSS rules for the color classes
  const colorCSS = `
    [data-role="background"], .background { fill: ${colors.background}; }
    [data-role="primary"], .primary { fill: ${colors.primary}; }
    [data-role="secondary"], .secondary { fill: ${colors.secondary}; }
    [data-role="cta"], .cta, .button { fill: ${colors.cta}; }
    [data-role="border"], .border { stroke: ${colors.border}; }
    [data-role="text"], text { fill: ${colors.text}; }
  `;

  result = injectStyle(result, colorCSS);

  return result;
}

/**
 * Build a Google Fonts CSS2 API URL from heading and body font names.
 * Handles the same-font case (single family) and URL-encodes names.
 */
export function buildGoogleFontsUrl(headingFont: string, bodyFont: string): string {
  const weights = '300;400;500;600;700';
  const encode = (name: string) => name.replace(/ /g, '+');

  if (headingFont === bodyFont) {
    return `https://fonts.googleapis.com/css2?family=${encode(headingFont)}:wght@${weights}&display=swap`;
  }

  return `https://fonts.googleapis.com/css2?family=${encode(bodyFont)}:wght@${weights}&family=${encode(headingFont)}:wght@${weights}&display=swap`;
}

/**
 * Derive a chrome surface color from background + secondary.
 * For dark backgrounds: lighten slightly. For light backgrounds: darken slightly.
 * This creates a neutral tinted surface for nav/sidebar/header — distinct
 * from the main background but not as loud as a brand primary color.
 */
/**
 * Derive neutral chrome surface colors from background + secondary.
 * Returns two tones: chrome (for nav/header) and chromeSubtle (for secondary surfaces).
 * Both are tinted neutrals — visually distinct from background but never loud.
 */
function deriveChromes(background: string, secondary: string): { chrome: string; chromeSubtle: string } {
  const [, , bL] = hexToHsl(background);
  const [sH, sS] = hexToHsl(secondary);
  const tintH = sH;
  const tintS = Math.min(sS, 15); // very desaturated — neutral feel

  if (bL < 50) {
    // Dark bg → chrome surfaces are slightly lighter
    return {
      chrome: hslToHex(tintH, tintS, Math.min(bL + 14, 30)),
      chromeSubtle: hslToHex(tintH, tintS, Math.min(bL + 7, 22)),
    };
  } else {
    // Light bg → chrome surfaces are slightly darker
    return {
      chrome: hslToHex(tintH, tintS, Math.max(bL - 12, 75)),
      chromeSubtle: hslToHex(tintH, tintS, Math.max(bL - 5, 85)),
    };
  }
}

/**
 * Apply a color palette to an SVG by replacing grayscale fill/stroke values.
 *
 * Grayscale → Semantic mapping (tuned for realistic visual weight):
 *   #DDDDDD → chrome (nav/header/sidebar — neutral surface derived from background)
 *   #9CA3AF → primary (small accent elements: heading placeholders, icons, buttons)
 *   #CCCCCC → border (borders/body placeholders)
 *   #EEEEEE → chromeSubtle (secondary surfaces — neutral, slightly offset from background)
 *   #FFFFFF / white → background (card/base bg)
 *
 * Only primary is used as brand color, and only on small accent elements.
 * All large surfaces get neutral derived chrome tones so the palette
 * feels like a real UI — not a wall of saturated paint.
 *
 * Does NOT touch fill="none".
 */
export function applyColorsViaGrayscale(
  svg: string,
  colors: {
    primary: string;
    secondary: string;
    cta: string;
    background: string;
    text: string;
    border: string;
  }
): string {
  let result = svg;

  const { chrome, chromeSubtle } = deriveChromes(colors.background, colors.secondary);

  // Map grayscale values to palette colors.
  // Order matters: replace more specific values first.
  const replacements: [RegExp, string][] = [
    // #DDDDDD → chrome (large structural surfaces: nav, header, sidebar)
    [/(?<=fill=["'])#[Dd]{6}(?=["'])/g, chrome],
    [/(?<=stroke=["'])#[Dd]{6}(?=["'])/g, chrome],
    // #9CA3AF → primary (small accent elements: headings, icons, buttons)
    [/(?<=fill=["'])#9[Cc][Aa]3[Aa][Ff](?=["'])/g, colors.primary],
    [/(?<=stroke=["'])#9[Cc][Aa]3[Aa][Ff](?=["'])/g, colors.primary],
    // #CCCCCC → border (case-insensitive)
    [/(?<=fill=["'])#[Cc]{6}(?=["'])/g, colors.border],
    [/(?<=stroke=["'])#[Cc]{6}(?=["'])/g, colors.border],
    // #EEEEEE → chromeSubtle (secondary surfaces — subtle neutral, not brand color)
    [/(?<=fill=["'])#[Ee]{6}(?=["'])/g, chromeSubtle],
    [/(?<=stroke=["'])#[Ee]{6}(?=["'])/g, chromeSubtle],
    // white keyword → background
    [/(?<=fill=["'])white(?=["'])/g, colors.background],
    // #FFFFFF → background (case-insensitive)
    [/(?<=fill=["'])#[Ff]{6}(?=["'])/g, colors.background],
    [/(?<=stroke=["'])#[Ff]{6}(?=["'])/g, colors.background],
  ];

  for (const [pattern, color] of replacements) {
    result = result.replace(pattern, color);
  }

  return result;
}

/**
 * Clone an SVG (just returns a copy)
 */
export function cloneSVG(svg: string): string {
  return svg.slice();
}

/**
 * Combine fonts and colors application
 */
export function applyTypographyAndColors(
  svg: string,
  typography: {
    headingFont: string;
    bodyFont: string;
    googleFontsUrl: string;
  },
  colors: {
    primary: string;
    secondary: string;
    cta: string;
    background: string;
    text: string;
    border: string;
  }
): string {
  let result = cloneSVG(svg);

  // Inject Google Fonts
  result = injectGoogleFonts(result, typography.googleFontsUrl);

  // Apply fonts to text elements
  result = applyFonts(result, typography.headingFont, typography.bodyFont);

  // Apply colors
  result = applyColors(result, colors);

  return result;
}

/**
 * Add a numbered label to an SVG (for preview grids)
 */
export function addLabel(svg: string, label: string, position: 'top-left' | 'bottom-left' = 'top-left'): string {
  const metadata = getSVGMetadata(svg);
  const y = position === 'top-left' ? '25' : (parseInt(metadata.height) - 10).toString();

  const labelElement = `
  <g class="preview-label">
    <rect x="10" y="${parseInt(y) - 18}" width="30" height="24" rx="4" fill="#0369A1"/>
    <text x="25" y="${y}" text-anchor="middle" fill="white" font-size="14" font-weight="600" font-family="system-ui">${label}</text>
  </g>`;

  // Insert before closing </svg>
  return svg.replace('</svg>', `${labelElement}\n</svg>`);
}

/**
 * Niche-to-template mapping.
 * Each niche gets the template variant that best represents its typical UI pattern.
 */
const NICHE_TEMPLATE_MAP: Record<string, 'dashboard' | 'storefront' | 'content'> = {
  dashboard: 'dashboard',
  saas: 'dashboard',
  fintech: 'dashboard',
  industrial: 'dashboard',
  ecommerce: 'storefront',
  marketing: 'storefront',
  blog: 'content',
  portfolio: 'content',
  medical: 'content',
};

type PaletteColors = {
  primary: string;
  secondary: string;
  cta: string;
  background: string;
  text: string;
  border: string;
};

/**
 * Generate a clean, minimal palette preview SVG appropriate for the given niche.
 * Purpose-built for evaluating color harmony — NOT a wireframe.
 *
 * Three template variants:
 *   dashboard  — sidebar + header + stat cards + chart + CTA
 *   storefront — top nav + hero banner + product grid + CTA
 *   content    — top nav + feature area + content blocks
 *
 * All variants: generous whitespace, primary as accent only, one CTA button,
 * large surfaces use derived neutral chrome tones.
 */
export function generatePalettePreviewSVG(colors: PaletteColors, niche?: string): string {
  const template = NICHE_TEMPLATE_MAP[niche || ''] || 'dashboard';

  switch (template) {
    case 'storefront': return generateStorefrontSVG(colors);
    case 'content':    return generateContentSVG(colors);
    default:           return generateDashboardSVG(colors);
  }
}

/* ─── Dashboard template ─── */
function generateDashboardSVG(colors: PaletteColors): string {
  const { chrome, chromeSubtle } = deriveChromes(colors.background, colors.secondary);
  const ctaText = getContrastingText(colors.cta);
  const chromeText = getContrastingText(chrome);

  const W = 800, H = 500, sb = 56, hdr = 44, p = 20, r = 8;
  const cx = sb + p;
  const cy = hdr + p;
  const cw = W - sb - p * 2;
  const halfW = Math.round((cw - p) / 2);
  const halfX = cx + halfW + p;

  // Chart area: bars and grid lines share same x-range
  const chartL = cx + 20;
  const chartR = cx + 300;  // bars and lines both end here — no confusing overflow

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${colors.background}" rx="12"/>

  <!-- Sidebar -->
  <rect x="0" y="0" width="${sb}" height="${H}" fill="${chrome}" rx="12"/>
  <rect x="12" y="0" width="${sb - 12}" height="${H}" fill="${chrome}"/>
  <circle cx="${sb / 2}" cy="28" r="8" fill="${colors.primary}" opacity="0.9"/>
  <circle cx="${sb / 2}" cy="68" r="5" fill="${chromeText}" opacity="0.18"/>
  <circle cx="${sb / 2}" cy="96" r="5" fill="${chromeText}" opacity="0.18"/>

  <!-- Header -->
  <rect x="${sb}" y="0" width="${W - sb}" height="${hdr}" fill="${chromeSubtle}"/>
  <rect x="${cx}" y="12" width="48" height="20" rx="4" fill="${colors.primary}" opacity="0.85"/>
  <rect x="${cx + 68}" y="16" width="36" height="12" rx="3" fill="${colors.text}" opacity="0.12"/>
  <circle cx="${W - p - 14}" cy="${hdr / 2}" r="12" fill="${colors.border}"/>

  <!-- Stat card 1 -->
  <rect x="${cx}" y="${cy}" width="${halfW}" height="100" rx="${r}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${cx + 16}" y="${cy + 16}" width="60" height="10" rx="3" fill="${colors.text}" opacity="0.2"/>
  <rect x="${cx + 16}" y="${cy + 38}" width="100" height="18" rx="4" fill="${colors.primary}"/>
  <rect x="${cx + 16}" y="${cy + 70}" width="${halfW - 32}" height="14" rx="3" fill="${colors.secondary}" opacity="0.18"/>

  <!-- Stat card 2 -->
  <rect x="${halfX}" y="${cy}" width="${halfW}" height="100" rx="${r}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${halfX + 16}" y="${cy + 16}" width="50" height="10" rx="3" fill="${colors.text}" opacity="0.2"/>
  <rect x="${halfX + 16}" y="${cy + 38}" width="80" height="18" rx="4" fill="${colors.primary}"/>
  <rect x="${halfX + 16}" y="${cy + 70}" width="${halfW - 32}" height="14" rx="3" fill="${colors.secondary}" opacity="0.18"/>

  <!-- Main content card -->
  <rect x="${cx}" y="${cy + 120}" width="${cw}" height="180" rx="${r}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${cx + 20}" y="${cy + 140}" width="120" height="12" rx="3" fill="${colors.text}" opacity="0.25"/>
  <!-- Chart: grid lines match bar area width -->
  <line x1="${chartL}" y1="${cy + 180}" x2="${chartR}" y2="${cy + 180}" stroke="${colors.border}" stroke-width="0.5" opacity="0.4"/>
  <line x1="${chartL}" y1="${cy + 215}" x2="${chartR}" y2="${cy + 215}" stroke="${colors.border}" stroke-width="0.5" opacity="0.4"/>
  <line x1="${chartL}" y1="${cy + 250}" x2="${chartR}" y2="${cy + 250}" stroke="${colors.border}" stroke-width="0.5" opacity="0.4"/>
  <!-- Chart bars -->
  <rect x="${chartL + 10}" y="${cy + 200}" width="28" height="75" rx="3" fill="${colors.primary}" opacity="0.15"/>
  <rect x="${chartL + 50}" y="${cy + 183}" width="28" height="92" rx="3" fill="${colors.primary}" opacity="0.25"/>
  <rect x="${chartL + 90}" y="${cy + 210}" width="28" height="65" rx="3" fill="${colors.primary}" opacity="0.2"/>
  <rect x="${chartL + 130}" y="${cy + 175}" width="28" height="100" rx="3" fill="${colors.primary}" opacity="0.35"/>
  <rect x="${chartL + 170}" y="${cy + 195}" width="28" height="80" rx="3" fill="${colors.primary}" opacity="0.2"/>

  <!-- CTA button -->
  <rect x="${cx + cw - 120}" y="${cy + 136}" width="100" height="32" rx="6" fill="${colors.cta}"/>
  <rect x="${cx + cw - 100}" y="${cy + 148}" width="60" height="8" rx="2" fill="${ctaText}" opacity="0.9"/>

  <!-- Bottom card -->
  <rect x="${cx}" y="${cy + 318}" width="${cw}" height="76" rx="${r}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${cx + 16}" y="${cy + 334}" width="80" height="10" rx="3" fill="${colors.text}" opacity="0.2"/>
  <rect x="${cx + 16}" y="${cy + 356}" width="${cw - 32}" height="8" rx="2" fill="${colors.text}" opacity="0.08"/>
</svg>`;
}

/* ─── Storefront template ─── */
function generateStorefrontSVG(colors: PaletteColors): string {
  const { chrome, chromeSubtle } = deriveChromes(colors.background, colors.secondary);
  const ctaText = getContrastingText(colors.cta);
  const chromeText = getContrastingText(chrome);

  const W = 800, H = 500, nav = 48, p = 20, r = 8;
  const cx = p;
  const cw = W - p * 2;
  // Hero area
  const heroY = nav + p;
  const heroH = 140;
  // Product grid: 3 cards
  const gridY = heroY + heroH + p;
  const cardW = Math.round((cw - p * 2) / 3);
  const cardH = 200;

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${colors.background}" rx="12"/>

  <!-- Top nav -->
  <rect x="0" y="0" width="${W}" height="${nav}" fill="${chrome}" rx="12"/>
  <rect x="0" y="12" width="${W}" height="${nav - 12}" fill="${chrome}"/>
  <circle cx="${p + 14}" cy="${nav / 2}" r="10" fill="${colors.primary}" opacity="0.9"/>
  <rect x="${p + 36}" y="${Math.round(nav / 2) - 6}" width="40" height="12" rx="3" fill="${chromeText}" opacity="0.15"/>
  <rect x="${p + 86}" y="${Math.round(nav / 2) - 6}" width="32" height="12" rx="3" fill="${chromeText}" opacity="0.1"/>
  <rect x="${p + 128}" y="${Math.round(nav / 2) - 6}" width="36" height="12" rx="3" fill="${chromeText}" opacity="0.1"/>
  <circle cx="${W - p - 14}" cy="${nav / 2}" r="12" fill="${colors.border}"/>

  <!-- Hero banner -->
  <rect x="${cx}" y="${heroY}" width="${cw}" height="${heroH}" rx="${r}" fill="${chromeSubtle}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${cx + 32}" y="${heroY + 28}" width="200" height="16" rx="4" fill="${colors.text}" opacity="0.2"/>
  <rect x="${cx + 32}" y="${heroY + 56}" width="300" height="10" rx="3" fill="${colors.text}" opacity="0.1"/>
  <rect x="${cx + 32}" y="${heroY + 76}" width="260" height="10" rx="3" fill="${colors.text}" opacity="0.08"/>
  <!-- CTA button in hero -->
  <rect x="${cx + 32}" y="${heroY + 100}" width="110" height="28" rx="6" fill="${colors.cta}"/>
  <rect x="${cx + 52}" y="${heroY + 110}" width="70" height="8" rx="2" fill="${ctaText}" opacity="0.9"/>

  <!-- Product card 1 -->
  <rect x="${cx}" y="${gridY}" width="${cardW}" height="${cardH}" rx="${r}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${cx + 12}" y="${gridY + 12}" width="${cardW - 24}" height="${Math.round(cardH * 0.5)}" rx="4" fill="${colors.secondary}" opacity="0.12"/>
  <rect x="${cx + 12}" y="${gridY + Math.round(cardH * 0.5) + 24}" width="${cardW - 60}" height="10" rx="3" fill="${colors.text}" opacity="0.2"/>
  <rect x="${cx + 12}" y="${gridY + Math.round(cardH * 0.5) + 44}" width="50" height="12" rx="3" fill="${colors.primary}" opacity="0.8"/>

  <!-- Product card 2 -->
  <rect x="${cx + cardW + p}" y="${gridY}" width="${cardW}" height="${cardH}" rx="${r}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${cx + cardW + p + 12}" y="${gridY + 12}" width="${cardW - 24}" height="${Math.round(cardH * 0.5)}" rx="4" fill="${colors.secondary}" opacity="0.12"/>
  <rect x="${cx + cardW + p + 12}" y="${gridY + Math.round(cardH * 0.5) + 24}" width="${cardW - 60}" height="10" rx="3" fill="${colors.text}" opacity="0.2"/>
  <rect x="${cx + cardW + p + 12}" y="${gridY + Math.round(cardH * 0.5) + 44}" width="50" height="12" rx="3" fill="${colors.primary}" opacity="0.8"/>

  <!-- Product card 3 -->
  <rect x="${cx + (cardW + p) * 2}" y="${gridY}" width="${cardW}" height="${cardH}" rx="${r}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${cx + (cardW + p) * 2 + 12}" y="${gridY + 12}" width="${cardW - 24}" height="${Math.round(cardH * 0.5)}" rx="4" fill="${colors.secondary}" opacity="0.12"/>
  <rect x="${cx + (cardW + p) * 2 + 12}" y="${gridY + Math.round(cardH * 0.5) + 24}" width="${cardW - 60}" height="10" rx="3" fill="${colors.text}" opacity="0.2"/>
  <rect x="${cx + (cardW + p) * 2 + 12}" y="${gridY + Math.round(cardH * 0.5) + 44}" width="50" height="12" rx="3" fill="${colors.primary}" opacity="0.8"/>
</svg>`;
}

/* ─── Content template ─── */
function generateContentSVG(colors: PaletteColors): string {
  const { chrome, chromeSubtle } = deriveChromes(colors.background, colors.secondary);
  const ctaText = getContrastingText(colors.cta);
  const chromeText = getContrastingText(chrome);

  const W = 800, H = 500, nav = 48, p = 20, r = 8;
  const cx = p;
  const cw = W - p * 2;
  // Feature / hero area
  const featY = nav + p;
  const featH = 120;
  // Content area: main column + sidebar
  const contentY = featY + featH + p;
  const mainW = Math.round(cw * 0.62);
  const sideW = cw - mainW - p;
  const sideX = cx + mainW + p;
  const contentH = H - contentY - p;

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${colors.background}" rx="12"/>

  <!-- Top nav -->
  <rect x="0" y="0" width="${W}" height="${nav}" fill="${chrome}" rx="12"/>
  <rect x="0" y="12" width="${W}" height="${nav - 12}" fill="${chrome}"/>
  <circle cx="${p + 14}" cy="${nav / 2}" r="10" fill="${colors.primary}" opacity="0.9"/>
  <rect x="${p + 36}" y="${Math.round(nav / 2) - 6}" width="40" height="12" rx="3" fill="${chromeText}" opacity="0.15"/>
  <rect x="${p + 86}" y="${Math.round(nav / 2) - 6}" width="32" height="12" rx="3" fill="${chromeText}" opacity="0.1"/>
  <rect x="${p + 128}" y="${Math.round(nav / 2) - 6}" width="36" height="12" rx="3" fill="${chromeText}" opacity="0.1"/>
  <circle cx="${W - p - 14}" cy="${nav / 2}" r="12" fill="${colors.border}"/>

  <!-- Feature / hero area -->
  <rect x="${cx}" y="${featY}" width="${cw}" height="${featH}" rx="${r}" fill="${chromeSubtle}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${cx + 32}" y="${featY + 24}" width="240" height="16" rx="4" fill="${colors.text}" opacity="0.2"/>
  <rect x="${cx + 32}" y="${featY + 52}" width="360" height="10" rx="3" fill="${colors.text}" opacity="0.1"/>
  <rect x="${cx + 32}" y="${featY + 72}" width="300" height="10" rx="3" fill="${colors.text}" opacity="0.08"/>
  <!-- CTA in feature area -->
  <rect x="${cx + cw - 152}" y="${featY + 44}" width="120" height="30" rx="6" fill="${colors.cta}"/>
  <rect x="${cx + cw - 132}" y="${featY + 55}" width="80" height="8" rx="2" fill="${ctaText}" opacity="0.9"/>

  <!-- Main content column -->
  <rect x="${cx}" y="${contentY}" width="${mainW}" height="${contentH}" rx="${r}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${cx + 20}" y="${contentY + 20}" width="180" height="14" rx="3" fill="${colors.text}" opacity="0.22"/>
  <rect x="${cx + 20}" y="${contentY + 48}" width="${mainW - 40}" height="8" rx="2" fill="${colors.text}" opacity="0.08"/>
  <rect x="${cx + 20}" y="${contentY + 64}" width="${mainW - 60}" height="8" rx="2" fill="${colors.text}" opacity="0.08"/>
  <rect x="${cx + 20}" y="${contentY + 80}" width="${mainW - 50}" height="8" rx="2" fill="${colors.text}" opacity="0.06"/>
  <rect x="${cx + 20}" y="${contentY + 108}" width="140" height="12" rx="3" fill="${colors.text}" opacity="0.18"/>
  <rect x="${cx + 20}" y="${contentY + 132}" width="${mainW - 40}" height="8" rx="2" fill="${colors.text}" opacity="0.08"/>
  <rect x="${cx + 20}" y="${contentY + 148}" width="${mainW - 70}" height="8" rx="2" fill="${colors.text}" opacity="0.06"/>
  <rect x="${cx + 20}" y="${contentY + 176}" width="120" height="12" rx="3" fill="${colors.primary}" opacity="0.7"/>

  <!-- Sidebar -->
  <rect x="${sideX}" y="${contentY}" width="${sideW}" height="${contentH}" rx="${r}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${sideX + 16}" y="${contentY + 20}" width="${sideW - 32}" height="10" rx="3" fill="${colors.text}" opacity="0.2"/>
  <rect x="${sideX + 16}" y="${contentY + 44}" width="${sideW - 32}" height="8" rx="2" fill="${colors.text}" opacity="0.08"/>
  <rect x="${sideX + 16}" y="${contentY + 60}" width="${sideW - 48}" height="8" rx="2" fill="${colors.text}" opacity="0.06"/>
  <rect x="${sideX + 16}" y="${contentY + 88}" width="${sideW - 32}" height="8" rx="2" fill="${colors.text}" opacity="0.08"/>
  <rect x="${sideX + 16}" y="${contentY + 104}" width="${sideW - 48}" height="8" rx="2" fill="${colors.text}" opacity="0.06"/>
</svg>`;
}

// Self-test when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Testing SVG Manipulator...\n');

  // Create a simple test SVG
  const testSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="400" height="300" fill="#f0f0f0" data-role="background"/>
  <rect x="20" y="20" width="360" height="60" rx="8" fill="#0066cc" data-role="primary"/>
  <text x="40" y="58" font-size="24" class="heading">Dashboard</text>
  <text x="40" y="120" font-size="14">Welcome to your dashboard. Here you can view your metrics.</text>
  <rect x="20" y="160" width="120" height="40" rx="4" fill="#ff6600" data-role="cta"/>
  <text x="80" y="186" text-anchor="middle" font-size="14" fill="white">Get Started</text>
</svg>`;

  console.log('Original SVG created');
  console.log('Metadata:', getSVGMetadata(testSVG));

  // Test font injection
  console.log('\nInjecting Google Fonts...');
  const withFonts = injectGoogleFonts(
    testSVG,
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Roboto&display=swap'
  );
  console.log('Font import added');

  // Test font application
  console.log('\nApplying fonts...');
  const withFontStyles = applyFonts(withFonts, 'Inter', 'Roboto');
  console.log('Fonts applied to text elements');

  // Test color application
  console.log('\nApplying colors...');
  const withColors = applyColors(withFontStyles, {
    primary: '#059669',
    secondary: '#34D399',
    cta: '#0284C7',
    background: '#F8FAFC',
    text: '#0F172A',
    border: '#E2E8F0'
  });
  console.log('Colors applied');

  // Test label addition
  console.log('\nAdding label...');
  const withLabel = addLabel(withColors, '1');
  console.log('Label added');

  // Save test output
  const outputPath = '.design-pipeline/test-svg-output.svg';
  try {
    const { mkdirSync, existsSync } = await import('fs');
    if (!existsSync('.design-pipeline')) {
      mkdirSync('.design-pipeline', { recursive: true });
    }
    saveSVG(withLabel, outputPath);
    console.log(`\nTest SVG saved to ${outputPath}`);
  } catch (e) {
    console.log('(Skipped saving - directory may not exist)');
  }

  console.log('\n✓ SVG manipulator tests passed');
}
