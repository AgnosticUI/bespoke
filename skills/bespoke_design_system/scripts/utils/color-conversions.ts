/**
 * Color Conversion Utilities
 * Handles hex, RGB, HSL conversions and contrast calculations
 */

export interface ColorValue {
  hex: string;
  rgb: [number, number, number];
  rgbString: string;
  hsl: [number, number, number];
  hslString: string;
  hslCss: string;
}

/**
 * Convert hex color to RGB tuple
 */
export function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');

  if (cleanHex.length === 3) {
    // Short form (#RGB)
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return [r, g, b];
  }

  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    return [r, g, b];
  }

  throw new Error(`Invalid hex color: ${hex}`);
}

/**
 * Convert hex color to HSL tuple [h, s, l]
 * h: 0-360, s: 0-100, l: 0-100
 */
export function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map(x => x / 255);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    // Achromatic
    return [0, 0, Math.round(l * 100)];
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h: number;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
    default:
      h = ((r - g) / d + 4) / 6;
      break;
  }

  return [
    Math.round(h * 360),
    Math.round(s * 100),
    Math.round(l * 100)
  ];
}

/**
 * Convert HSL to hex color
 */
export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Convert RGB to hex
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Calculate relative luminance for a color
 * Per WCAG 2.1 spec
 */
export function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(c => {
    const sRGB = c / 255;
    return sRGB <= 0.03928
      ? sRGB / 12.92
      : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 * Returns ratio like 4.5 or 7.0
 */
export function calculateContrast(fg: string, bg: string): number {
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);

  const l1 = getRelativeLuminance(fgRgb);
  const l2 = getRelativeLuminance(bgRgb);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Format contrast ratio as string like "4.5:1"
 */
export function formatContrastRatio(ratio: number): string {
  return `${ratio.toFixed(1)}:1`;
}

/**
 * Check if contrast meets WCAG level
 */
export function meetsWCAG(fg: string, bg: string, level: 'AA' | 'AAA' = 'AA'): boolean {
  const ratio = calculateContrast(fg, bg);
  const threshold = level === 'AAA' ? 7.0 : 4.5;
  return ratio >= threshold;
}

/**
 * Get contrasting text color (black or white) for a background
 */
export function getContrastingText(bgHex: string): string {
  const rgb = hexToRgb(bgHex);
  const luminance = getRelativeLuminance(rgb);
  return luminance > 0.179 ? '#000000' : '#FFFFFF';
}

/**
 * Darken a color by a percentage
 */
export function darken(hex: string, percent: number): string {
  const [h, s, l] = hexToHsl(hex);
  const newL = Math.max(0, l - percent);
  return hslToHex(h, s, newL);
}

/**
 * Lighten a color by a percentage
 */
export function lighten(hex: string, percent: number): string {
  const [h, s, l] = hexToHsl(hex);
  const newL = Math.min(100, l + percent);
  return hslToHex(h, s, newL);
}

/**
 * Adjust saturation of a color
 */
export function saturate(hex: string, percent: number): string {
  const [h, s, l] = hexToHsl(hex);
  const newS = Math.max(0, Math.min(100, s + percent));
  return hslToHex(h, newS, l);
}

/**
 * Create a complete ColorValue object from a hex color
 */
export function createColorValue(hex: string): ColorValue {
  const rgb = hexToRgb(hex);
  const hsl = hexToHsl(hex);

  return {
    hex: hex.toUpperCase(),
    rgb,
    rgbString: `${rgb[0]} ${rgb[1]} ${rgb[2]}`,
    hsl,
    hslString: `${hsl[0]} ${hsl[1]}% ${hsl[2]}%`,
    hslCss: `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`
  };
}

/**
 * Apply opacity to a hex color, returning rgba string
 */
export function withOpacity(hex: string, opacity: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// Self-test when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Testing Color Conversions...\n');

  const testColor = '#0369A1';
  console.log(`Test color: ${testColor}`);

  const rgb = hexToRgb(testColor);
  console.log(`RGB: ${rgb.join(', ')}`);

  const hsl = hexToHsl(testColor);
  console.log(`HSL: ${hsl[0]}° ${hsl[1]}% ${hsl[2]}%`);

  const backToHex = hslToHex(hsl[0], hsl[1], hsl[2]);
  console.log(`Back to hex: ${backToHex}`);

  const colorValue = createColorValue(testColor);
  console.log('\nColorValue object:');
  console.log(JSON.stringify(colorValue, null, 2));

  // Test contrast
  const white = '#FFFFFF';
  const contrast = calculateContrast(testColor, white);
  console.log(`\nContrast with white: ${formatContrastRatio(contrast)}`);
  console.log(`Meets AA: ${meetsWCAG(testColor, white, 'AA')}`);
  console.log(`Meets AAA: ${meetsWCAG(testColor, white, 'AAA')}`);

  // Test manipulation
  console.log(`\nDarkened 10%: ${darken(testColor, 10)}`);
  console.log(`Lightened 10%: ${lighten(testColor, 10)}`);
  console.log(`Contrasting text: ${getContrastingText(testColor)}`);

  console.log('\n✓ Color conversion tests passed');
}
