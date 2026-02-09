/**
 * Handlebars Color Helpers
 * Thin wrappers around color-conversions.ts functions
 */

import type Handlebars from 'handlebars';
import {
  hexToHsl,
  hexToRgb,
  darken,
  lighten,
  getContrastingText,
  withOpacity,
  createColorValue,
} from '../../scripts/utils/color-conversions.js';

export function registerColorHelpers(hbs: typeof Handlebars): void {
  // "199 96% 32%" — shadcn space-separated HSL
  hbs.registerHelper('hsl', (hex: string) => {
    const [h, s, l] = hexToHsl(hex);
    return `${h} ${s}% ${l}%`;
  });

  // "hsl(199, 96%, 32%)" — standard CSS
  hbs.registerHelper('hslCss', (hex: string) => {
    return createColorValue(hex).hslCss;
  });

  // "3 105 161" — space-separated RGB
  hbs.registerHelper('rgb', (hex: string) => {
    const [r, g, b] = hexToRgb(hex);
    return `${r} ${g} ${b}`;
  });

  // "3, 105, 161" — comma-separated RGB
  hbs.registerHelper('rgbCsv', (hex: string) => {
    const [r, g, b] = hexToRgb(hex);
    return `${r}, ${g}, ${b}`;
  });

  // Darken by percent
  hbs.registerHelper('darken', (hex: string, percent: number) => {
    return darken(hex, percent);
  });

  // Lighten by percent
  hbs.registerHelper('lighten', (hex: string, percent: number) => {
    return lighten(hex, percent);
  });

  // Contrasting text as shadcn HSL ("0 0% 100%" or "0 0% 0%")
  hbs.registerHelper('contrastText', (hex: string) => {
    const contrast = getContrastingText(hex);
    const [h, s, l] = hexToHsl(contrast);
    return `${h} ${s}% ${l}%`;
  });

  // Contrasting text as hex ("#FFFFFF" or "#000000")
  hbs.registerHelper('contrastHex', (hex: string) => {
    return getContrastingText(hex);
  });

  // "rgba(r,g,b,0.5)"
  hbs.registerHelper('withOpacity', (hex: string, opacity: number) => {
    return withOpacity(hex, opacity);
  });

  // Focus ring — withOpacity at 0.5
  hbs.registerHelper('focusRing', (hex: string) => {
    return withOpacity(hex, 0.5);
  });
}
