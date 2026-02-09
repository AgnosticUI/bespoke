/**
 * Handlebars Spacing Helpers
 * Pure math helpers for unit conversions
 */

import type Handlebars from 'handlebars';

export function registerSpacingHelpers(hbs: typeof Handlebars): void {
  // px to rem (base 16)
  hbs.registerHelper('rem', (px: number) => {
    return `${px / 16}rem`;
  });

  // Explicit px unit
  hbs.registerHelper('px', (v: number) => {
    return `${v}px`;
  });

  // px to em with optional base
  hbs.registerHelper('em', (px: number, base?: number | object) => {
    const b = typeof base === 'number' ? base : 16;
    return `${px / b}em`;
  });

  // Tailwind spacing scale (divide by 4)
  hbs.registerHelper('tailwindSpacing', (px: number) => {
    return `${px / 4}`;
  });

  // Multiply two numbers
  hbs.registerHelper('multiply', (a: number, b: number) => {
    return a * b;
  });
}
