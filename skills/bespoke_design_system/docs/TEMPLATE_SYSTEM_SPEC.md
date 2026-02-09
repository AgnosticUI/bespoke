# Handlebars Template System Specification

**Version:** 1.0
**Document Type:** Implementation Specification
**Last Updated:** February 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Directory Structure](#directory-structure)
3. [Template Context Schema](#template-context-schema)
4. [Template Helpers](#template-helpers)
5. [Token Mapping Specification](#token-mapping-specification)
6. [Reference Implementation: shadcn/ui](#reference-implementation-shadcnui)
7. [Other Framework Templates](#other-framework-templates)
8. [Adding New Frameworks](#adding-new-frameworks)
9. [Testing Templates](#testing-templates)

---

## Overview

The Handlebars template system transforms generic design tokens into framework-specific configuration files. This approach allows:

- **Single source of truth** - Design decisions stored once, output in many formats
- **Easy framework addition** - New frameworks only need template files
- **Consistent outputs** - Templates ensure proper formatting and syntax
- **Designer-friendly** - Non-developers can update token values without touching templates

### Supported Frameworks

| Framework | Output Files | Status | Primary Use Case |
|-----------|--------------|--------|------------------|
| Generic CSS | `design-tokens.css` | ✅ | Framework-agnostic, custom builds |
| shadcn/ui | `shadcn-globals.css` | ✅ | React + Tailwind |
| DaisyUI | `daisyui-theme.css` | ✅ | Tailwind with pre-built components |
| AgnosticUI | `agnosticui-tokens.css` | ✅ | Framework-agnostic components |
| Aceternity UI | `tailwind.config.ts` | Future | Animated components |
| Magic UI | `tailwind.config.ts` | Future | Glassmorphism effects |
| NextUI | `tailwind.config.ts`, `nextui.config.ts` | Future | Next.js projects |

---

## Directory Structure

```
skills/bespoke_design_system/
├── templates/
│   ├── helpers/
│   │   ├── index.ts              # Register all helpers
│   │   ├── color-helpers.ts      # HSL/RGB/hex conversions
│   │   ├── spacing-helpers.ts    # px/rem conversions
│   │   └── string-helpers.ts     # kebab-case, etc.
│   │
│   ├── partials/
│   │   ├── font-imports.hbs      # Google Fonts @import
│   │   ├── color-palette.hbs     # Color variable definitions
│   │   └── spacing-scale.hbs     # Spacing token definitions
│   │
│   ├── generic/
│   │   └── design-tokens.css.hbs
│   │
│   ├── shadcn/
│   │   ├── globals.css.hbs
│   │   ├── tailwind.config.ts.hbs
│   │   └── components.json.hbs
│   │
│   ├── daisyui/
│   │   ├── theme.css.hbs
│   │   └── tailwind.config.ts.hbs
│   │
│   ├── aceternity/
│   │   └── tailwind.config.ts.hbs
│   │
│   ├── magicui/
│   │   └── tailwind.config.ts.hbs
│   │
│   ├── nextui/
│   │   ├── tailwind.config.ts.hbs
│   │   └── nextui.config.ts.hbs
│   │
│   └── agnosticui/
│       ├── design-tokens.css.hbs
│       └── variables.css.hbs
│
└── data/
    └── framework-profiles/
        ├── shadcn-profile.csv
        ├── daisyui-profile.csv
        ├── aceternity-profile.csv
        ├── magicui-profile.csv
        ├── nextui-profile.csv
        └── agnosticui-profile.csv
```

---

## Template Context Schema

The template context is a JSON object passed to all templates. It contains all design tokens in multiple formats.

### Complete Context Interface

```typescript
interface TemplateContext {
  // Typography
  fonts: {
    heading: string;              // "Inter"
    body: string;                 // "Roboto"
    mono: string;                 // "JetBrains Mono"
    googleFontsUrl: string;       // Full URL
    cssImport: string;            // @import statement
  };

  // Colors (each color in multiple formats)
  colors: {
    primary: ColorValue;
    secondary: ColorValue;
    accent: ColorValue;           // Alias for CTA
    cta: ColorValue;
    background: ColorValue;
    foreground: ColorValue;       // Text color
    muted: ColorValue;            // Muted background
    mutedForeground: ColorValue;  // Muted text
    card: ColorValue;             // Card background
    cardForeground: ColorValue;   // Card text
    border: ColorValue;
    input: ColorValue;            // Input border
    ring: ColorValue;             // Focus ring
    destructive: ColorValue;      // Error/danger
    destructiveForeground: ColorValue;
    success: ColorValue;
    warning: ColorValue;
  };

  // Dark mode colors (pre-computed from light colors)
  // Templates reference darkColors.X.hex instead of inline darken/lighten sub-expressions
  darkColors: {
    background: ColorValue;         // darken(foreground, 5)
    foreground: ColorValue;         // lighten(background, 5)
    card: ColorValue;               // darken(foreground, 3)
    cardForeground: ColorValue;     // lighten(background, 5)
    popover: ColorValue;            // darken(foreground, 3)
    popoverForeground: ColorValue;  // lighten(background, 5)
    primary: ColorValue;            // lighten(primary, 10)
    primaryForeground: ColorValue;  // getContrastingText(darkPrimary)
    secondary: ColorValue;          // darken(secondary, 30)
    secondaryForeground: ColorValue;// getContrastingText(darkSecondary)
    muted: ColorValue;              // darken(foreground, 2)
    mutedForeground: ColorValue;    // lighten(mutedForeground, 20)
    accent: ColorValue;             // darken(accent, 10)
    accentForeground: ColorValue;   // getContrastingText(darkAccent)
    destructive: ColorValue;        // lighten(destructive, 10)
    destructiveForeground: ColorValue;
    border: ColorValue;             // lighten(border, 10)
    input: ColorValue;              // lighten(border, 10)
    ring: ColorValue;               // lighten(primary, 10)
    success: ColorValue;            // lighten(success, 10)
    successForeground: ColorValue;
    warning: ColorValue;            // lighten(warning, 10)
    warningForeground: ColorValue;
  };

  // Spacing
  spacing: {
    xs: number;     // 4
    sm: number;     // 8
    md: number;     // 16
    lg: number;     // 24
    xl: number;     // 32
    '2xl': number;  // 48
    '3xl': number;  // 64
    section: number; // 80
  };

  // Border Radius
  radius: {
    sm: number;     // 4
    md: number;     // 8
    lg: number;     // 12
    xl: number;     // 16
    full: string;   // "9999px"
  };

  // Shadows
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };

  // Metadata
  meta: {
    layout_id: string;
    typography_id: string;
    palette_id: string;
    niche: string;
    application_type: string;
    generated_at: string;
    pipeline_version: string;
  };

  // Framework-specific overrides (populated by profile)
  framework?: Record<string, any>;
}

interface ColorValue {
  hex: string;                    // "#0369A1"
  rgb: [number, number, number];  // [3, 105, 161]
  rgbString: string;              // "3 105 161"
  hsl: [number, number, number];  // [199, 96, 32]
  hslString: string;              // "199 96% 32%"
  hslCss: string;                 // "hsl(199, 96%, 32%)"
  oklch?: string;                 // "oklch(49% 0.14 230)"
}
```

### Example Context (Medical Patient Portal)

```json
{
  "fonts": {
    "heading": "Atkinson Hyperlegible",
    "body": "Georgia",
    "mono": "JetBrains Mono",
    "googleFontsUrl": "https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Georgia&display=swap",
    "cssImport": "@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Georgia&display=swap');"
  },
  "colors": {
    "primary": {
      "hex": "#059669",
      "rgb": [5, 150, 105],
      "rgbString": "5 150 105",
      "hsl": [161, 94, 30],
      "hslString": "161 94% 30%",
      "hslCss": "hsl(161, 94%, 30%)"
    },
    "secondary": {
      "hex": "#34D399",
      "rgb": [52, 211, 153],
      "rgbString": "52 211 153",
      "hsl": [158, 64, 52],
      "hslString": "158 64% 52%",
      "hslCss": "hsl(158, 64%, 52%)"
    },
    "cta": {
      "hex": "#0284C7",
      "rgb": [2, 132, 199],
      "rgbString": "2 132 199",
      "hsl": [200, 98, 39],
      "hslString": "200 98% 39%",
      "hslCss": "hsl(200, 98%, 39%)"
    },
    "background": {
      "hex": "#F8FAFC",
      "rgb": [248, 250, 252],
      "rgbString": "248 250 252",
      "hsl": [210, 40, 98],
      "hslString": "210 40% 98%",
      "hslCss": "hsl(210, 40%, 98%)"
    },
    "foreground": {
      "hex": "#0F172A",
      "rgb": [15, 23, 42],
      "rgbString": "15 23 42",
      "hsl": [222, 47, 11],
      "hslString": "222 47% 11%",
      "hslCss": "hsl(222, 47%, 11%)"
    },
    "border": {
      "hex": "#E2E8F0",
      "rgb": [226, 232, 240],
      "rgbString": "226 232 240",
      "hsl": [214, 32, 91],
      "hslString": "214 32% 91%",
      "hslCss": "hsl(214, 32%, 91%)"
    },
    "muted": {
      "hex": "#F1F5F9",
      "rgb": [241, 245, 249],
      "rgbString": "241 245 249",
      "hsl": [210, 40, 96],
      "hslString": "210 40% 96%",
      "hslCss": "hsl(210, 40%, 96%)"
    },
    "mutedForeground": {
      "hex": "#64748B",
      "rgb": [100, 116, 139],
      "rgbString": "100 116 139",
      "hsl": [215, 16, 47],
      "hslString": "215 16% 47%",
      "hslCss": "hsl(215, 16%, 47%)"
    },
    "accent": {
      "hex": "#0284C7",
      "rgb": [2, 132, 199],
      "rgbString": "2 132 199",
      "hsl": [200, 98, 39],
      "hslString": "200 98% 39%",
      "hslCss": "hsl(200, 98%, 39%)"
    },
    "destructive": {
      "hex": "#DC2626",
      "rgb": [220, 38, 38],
      "rgbString": "220 38 38",
      "hsl": [0, 72, 51],
      "hslString": "0 72% 51%",
      "hslCss": "hsl(0, 72%, 51%)"
    },
    "destructiveForeground": {
      "hex": "#FAFAFA",
      "rgb": [250, 250, 250],
      "rgbString": "250 250 250",
      "hsl": [0, 0, 98],
      "hslString": "0 0% 98%",
      "hslCss": "hsl(0, 0%, 98%)"
    }
  },
  "spacing": {
    "xs": 4,
    "sm": 8,
    "md": 16,
    "lg": 24,
    "xl": 32,
    "2xl": 48,
    "3xl": 64,
    "section": 80
  },
  "radius": {
    "sm": 4,
    "md": 8,
    "lg": 12,
    "xl": 16,
    "full": "9999px"
  },
  "shadows": {
    "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    "md": "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1)"
  },
  "meta": {
    "layout_id": "medical_patient-portal_07",
    "typography_id": "typo-009",
    "palette_id": "palette-02",
    "niche": "medical",
    "application_type": "patient-portal",
    "generated_at": "2026-02-05T12:00:00Z",
    "pipeline_version": "1.0"
  }
}
```

---

## Template Helpers

Custom Handlebars helpers enable complex transformations within templates.

### helpers/index.ts

```typescript
import Handlebars from 'handlebars';
import { colorHelpers } from './color-helpers';
import { spacingHelpers } from './spacing-helpers';
import { stringHelpers } from './string-helpers';

export function registerHelpers(handlebars: typeof Handlebars) {
  // Register all helpers
  Object.entries(colorHelpers).forEach(([name, fn]) => {
    handlebars.registerHelper(name, fn);
  });

  Object.entries(spacingHelpers).forEach(([name, fn]) => {
    handlebars.registerHelper(name, fn);
  });

  Object.entries(stringHelpers).forEach(([name, fn]) => {
    handlebars.registerHelper(name, fn);
  });
}
```

### helpers/color-helpers.ts

```typescript
export const colorHelpers = {
  /**
   * Convert hex to HSL string (shadcn format: "199 96% 32%")
   * Usage: {{hsl colors.primary.hex}}
   */
  hsl(hex: string): string {
    const [h, s, l] = hexToHsl(hex);
    return `${h} ${s}% ${l}%`;
  },

  /**
   * Convert hex to HSL CSS function
   * Usage: {{hslCss colors.primary.hex}}
   */
  hslCss(hex: string): string {
    const [h, s, l] = hexToHsl(hex);
    return `hsl(${h}, ${s}%, ${l}%)`;
  },

  /**
   * Convert hex to RGB space-separated (Tailwind format)
   * Usage: {{rgb colors.primary.hex}}
   */
  rgb(hex: string): string {
    const [r, g, b] = hexToRgb(hex);
    return `${r} ${g} ${b}`;
  },

  /**
   * Darken a color by percentage
   * Usage: {{darken colors.primary.hex 10}}
   */
  darken(hex: string, percent: number): string {
    const [h, s, l] = hexToHsl(hex);
    const newL = Math.max(0, l - percent);
    return hslToHex(h, s, newL);
  },

  /**
   * Lighten a color by percentage
   * Usage: {{lighten colors.primary.hex 10}}
   */
  lighten(hex: string, percent: number): string {
    const [h, s, l] = hexToHsl(hex);
    const newL = Math.min(100, l + percent);
    return hslToHex(h, s, newL);
  },

  /**
   * Adjust saturation
   * Usage: {{saturate colors.primary.hex 20}}
   */
  saturate(hex: string, percent: number): string {
    const [h, s, l] = hexToHsl(hex);
    const newS = Math.min(100, Math.max(0, s + percent));
    return hslToHex(h, newS, l);
  },

  /**
   * Get contrasting text color (black or white)
   * Usage: {{contrastText colors.primary.hex}}
   */
  contrastText(hex: string): string {
    const [r, g, b] = hexToRgb(hex);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  },

  /**
   * Generate color with opacity
   * Usage: {{withOpacity colors.primary.hex 0.5}}
   */
  withOpacity(hex: string, opacity: number): string {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },

  /**
   * Generate focus ring color (primary with opacity)
   * Usage: {{focusRing colors.primary.hex}}
   */
  focusRing(hex: string): string {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  }
};

// Helper functions
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [0, 0, 0];
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ];
}

function hexToHsl(hex: string): [number, number, number] {
  const [r, g, b] = hexToRgb(hex).map(x => x / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
```

### helpers/spacing-helpers.ts

```typescript
export const spacingHelpers = {
  /**
   * Convert px to rem (assuming 16px base)
   * Usage: {{rem spacing.md}}
   */
  rem(px: number): string {
    return `${px / 16}rem`;
  },

  /**
   * Convert px to em
   * Usage: {{em spacing.md 14}}
   */
  em(px: number, baseFontSize: number = 16): string {
    return `${px / baseFontSize}em`;
  },

  /**
   * Add 'px' suffix
   * Usage: {{px spacing.md}}
   */
  px(value: number): string {
    return `${value}px`;
  },

  /**
   * Generate Tailwind spacing scale value
   * Usage: {{tailwindSpacing spacing.md}}
   * 16 -> "4" (16/4 = 4)
   */
  tailwindSpacing(px: number): string {
    return String(px / 4);
  },

  /**
   * Multiply a spacing value
   * Usage: {{multiply spacing.md 1.5}}
   */
  multiply(value: number, factor: number): number {
    return Math.round(value * factor);
  },

  /**
   * Generate a spacing scale from base
   * Usage: {{spacingScale 4}}
   * Returns: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }
   */
  spacingScale(base: number): object {
    return {
      xs: base,
      sm: base * 2,
      md: base * 4,
      lg: base * 6,
      xl: base * 8
    };
  }
};
```

### helpers/string-helpers.ts

```typescript
export const stringHelpers = {
  /**
   * Convert to kebab-case
   * Usage: {{kebab "primaryColor"}} -> "primary-color"
   */
  kebab(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  },

  /**
   * Convert to camelCase
   * Usage: {{camel "primary-color"}} -> "primaryColor"
   */
  camel(str: string): string {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  },

  /**
   * Convert to SCREAMING_SNAKE_CASE
   * Usage: {{screamingSnake "primaryColor"}} -> "PRIMARY_COLOR"
   */
  screamingSnake(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase();
  },

  /**
   * Quote a string for CSS
   * Usage: {{quote fonts.heading}}
   */
  quote(str: string): string {
    return `'${str}'`;
  },

  /**
   * Join array with separator
   * Usage: {{join fonts.stack ", "}}
   */
  join(arr: string[], separator: string): string {
    return arr.join(separator);
  },

  /**
   * Escape special CSS characters
   * Usage: {{escapeCss "value"}}
   */
  escapeCss(str: string): string {
    return str.replace(/['"\\]/g, '\\$&');
  },

  /**
   * Current date in ISO format
   * Usage: {{now}}
   */
  now(): string {
    return new Date().toISOString();
  },

  /**
   * Conditional helper
   * Usage: {{#if (eq framework "shadcn")}}...{{/if}}
   */
  eq(a: any, b: any): boolean {
    return a === b;
  },

  /**
   * Not equal
   * Usage: {{#if (neq framework "shadcn")}}...{{/if}}
   */
  neq(a: any, b: any): boolean {
    return a !== b;
  }
};
```

---

## Token Mapping Specification

### How Token Mapping Works

1. Generic tokens are defined in the context (e.g., `colors.primary.hex`)
2. Framework profiles map generic tokens to framework-specific names
3. Templates use either generic paths or framework-specific paths

### Framework Profile CSV Format

```csv
generic_token,framework_token,category,transform,notes
colors.primary.hex,--primary,color,hsl,"Primary brand color"
colors.secondary.hex,--secondary,color,hsl,"Secondary color"
colors.background.hex,--background,color,hsl,"Page background"
colors.foreground.hex,--foreground,color,hsl,"Default text"
colors.muted.hex,--muted,color,hsl,"Muted backgrounds"
colors.mutedForeground.hex,--muted-foreground,color,hsl,"Muted text"
colors.accent.hex,--accent,color,hsl,"Accent/CTA color"
colors.destructive.hex,--destructive,color,hsl,"Error/danger"
colors.border.hex,--border,color,hsl,"Default borders"
colors.input.hex,--input,color,hsl,"Input borders"
colors.ring.hex,--ring,color,hsl,"Focus rings"
fonts.heading,--font-heading,typography,quote,"Heading font family"
fonts.body,--font-sans,typography,quote,"Body font family"
fonts.mono,--font-mono,typography,quote,"Monospace font"
radius.md,--radius,spacing,rem,"Default border radius"
```

### Column Definitions

| Column | Description |
|--------|-------------|
| generic_token | Dot-path to value in context (e.g., `colors.primary.hex`) |
| framework_token | Framework-specific CSS variable or config key |
| category | Token category: `color`, `typography`, `spacing`, `shadow` |
| transform | Transformation to apply: `hsl`, `rgb`, `rem`, `px`, `quote`, `none` |
| notes | Documentation for maintainers |

### Mapping Examples

**Generic → shadcn/ui:**
```
colors.primary.hex → --primary (as HSL: "199 96% 32%")
fonts.heading → --font-heading (as "'Inter', sans-serif")
spacing.md → --radius (as "0.5rem")
```

**Generic → DaisyUI:**
```
colors.primary.hex → --p (as HSL: "199 96% 32%")
colors.primary.hex → --pf (as darkened HSL for focus state)
fonts.heading → --font-family (as "'Inter', sans-serif")
```

**Generic → Tailwind:**
```
colors.primary.hex → colors.primary.DEFAULT (as "#0369A1")
colors.primary.hex → colors.primary.50-950 (generated scale)
spacing.md → spacing.4 (as "1rem")
```

---

## Dark Mode Strategy

All templates use a two-pronged dark mode approach:

### Selectors

| Selector | Trigger | Use Case |
|----------|---------|----------|
| `@media (prefers-color-scheme: dark)` | OS/browser preference | Automatic — no JS required |
| `[data-theme="dark"]` | Explicit attribute on `<html>` | Theme switcher toggle |
| `.dark` (shadcn only) | Class on `<html>` | `next-themes` / Tailwind `darkMode: "class"` |

### How It Works

1. **Automatic**: When the user's OS is set to dark mode, `@media (prefers-color-scheme: dark)` activates and overrides `:root` variables.
2. **Manual override**: A theme switcher sets `data-theme="dark"` on the `<html>` element, which takes precedence over the media query.
3. **shadcn `.dark` class**: For backwards compatibility with `next-themes` and Tailwind's class-based dark mode.

### Dark Color Derivation

Dark colors are pre-computed in `generate-tokens.ts` via `darkColors` context (not inline template sub-expressions). This avoids duplicating derivation logic across templates.

| Dark Token | Derivation |
|------------|------------|
| `background` | `darken(foreground, 5)` |
| `foreground` | `lighten(background, 5)` |
| `card` / `popover` | `darken(foreground, 3)` |
| `primary` | `lighten(primary, 10)` |
| `secondary` | `darken(secondary, 30)` |
| `muted` | `darken(foreground, 2)` |
| `mutedForeground` | `lighten(mutedForeground, 20)` |
| `accent` | `darken(accent, 10)` |
| `destructive` | `lighten(destructive, 10)` |
| `border` / `input` | `lighten(border, 10)` |
| `ring` | `lighten(primary, 10)` |
| `success` / `warning` | `lighten(X, 10)` |
| All `-foreground` tokens | `getContrastingText()` on corresponding dark color |

---

## Reference Implementation: shadcn/ui

### templates/shadcn/globals.css.hbs

```handlebars
{{!--
  shadcn/ui Global CSS Variables
  Generated by Bespoke Design Pipeline v{{meta.pipeline_version}}

  Layout: {{meta.layout_id}}
  Typography: {{meta.typography_id}}
  Palette: {{meta.palette_id}}
  Generated: {{meta.generated_at}}
--}}

{{!-- Google Fonts Import --}}
{{{fonts.cssImport}}}

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    {{!-- Colors (HSL format without function wrapper) --}}
    --background: {{hsl colors.background.hex}};
    --foreground: {{hsl colors.foreground.hex}};

    --card: {{hsl colors.card.hex}};
    --card-foreground: {{hsl colors.cardForeground.hex}};

    --popover: {{hsl colors.card.hex}};
    --popover-foreground: {{hsl colors.cardForeground.hex}};

    --primary: {{hsl colors.primary.hex}};
    --primary-foreground: {{contrastText colors.primary.hex}};

    --secondary: {{hsl colors.secondary.hex}};
    --secondary-foreground: {{contrastText colors.secondary.hex}};

    --muted: {{hsl colors.muted.hex}};
    --muted-foreground: {{hsl colors.mutedForeground.hex}};

    --accent: {{hsl colors.accent.hex}};
    --accent-foreground: {{contrastText colors.accent.hex}};

    --destructive: {{hsl colors.destructive.hex}};
    --destructive-foreground: {{hsl colors.destructiveForeground.hex}};

    --border: {{hsl colors.border.hex}};
    --input: {{hsl colors.border.hex}};
    --ring: {{hsl colors.primary.hex}};

    {{!-- Border Radius --}}
    --radius: {{rem radius.md}};

    {{!-- Typography --}}
    --font-heading: '{{fonts.heading}}', system-ui, sans-serif;
    --font-sans: '{{fonts.body}}', system-ui, sans-serif;
    --font-mono: '{{fonts.mono}}', ui-monospace, monospace;
  }

  {{!-- Dark Mode (inverted colors) --}}
  .dark {
    --background: {{hsl (darken colors.foreground.hex 5)}};
    --foreground: {{hsl colors.background.hex}};

    --card: {{hsl (darken colors.foreground.hex 3)}};
    --card-foreground: {{hsl colors.background.hex}};

    --popover: {{hsl (darken colors.foreground.hex 3)}};
    --popover-foreground: {{hsl colors.background.hex}};

    --primary: {{hsl colors.primary.hex}};
    --primary-foreground: {{contrastText colors.primary.hex}};

    --secondary: {{hsl (darken colors.secondary.hex 30)}};
    --secondary-foreground: {{hsl colors.background.hex}};

    --muted: {{hsl (darken colors.foreground.hex 10)}};
    --muted-foreground: {{hsl (lighten colors.mutedForeground.hex 20)}};

    --accent: {{hsl (darken colors.accent.hex 10)}};
    --accent-foreground: {{hsl colors.background.hex}};

    --destructive: {{hsl colors.destructive.hex}};
    --destructive-foreground: {{hsl colors.destructiveForeground.hex}};

    --border: {{hsl (lighten colors.foreground.hex 15)}};
    --input: {{hsl (lighten colors.foreground.hex 15)}};
    --ring: {{hsl colors.primary.hex}};
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-family: var(--font-sans);
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
  }

  code, pre, kbd, samp {
    font-family: var(--font-mono);
  }
}
```

### templates/shadcn/tailwind.config.ts.hbs

```handlebars
{{!--
  Tailwind CSS Configuration for shadcn/ui
  Generated by Bespoke Design Pipeline
--}}

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      spacing: {
        {{!-- Custom spacing from layout analysis --}}
        'section': '{{px spacing.section}}',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### templates/shadcn/components.json.hbs

```handlebars
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## Other Framework Templates

### templates/daisyui/theme.css.hbs

```handlebars
{{!-- DaisyUI Theme CSS --}}

{{{fonts.cssImport}}}

[data-theme="bespoke"] {
  /* Primary */
  --p: {{hsl colors.primary.hex}};
  --pf: {{hsl (darken colors.primary.hex 10)}};  /* Primary focus */
  --pc: {{contrastText colors.primary.hex}};     /* Primary content */

  /* Secondary */
  --s: {{hsl colors.secondary.hex}};
  --sf: {{hsl (darken colors.secondary.hex 10)}};
  --sc: {{contrastText colors.secondary.hex}};

  /* Accent */
  --a: {{hsl colors.accent.hex}};
  --af: {{hsl (darken colors.accent.hex 10)}};
  --ac: {{contrastText colors.accent.hex}};

  /* Neutral */
  --n: {{hsl colors.foreground.hex}};
  --nf: {{hsl (lighten colors.foreground.hex 10)}};
  --nc: {{hsl colors.background.hex}};

  /* Base */
  --b1: {{hsl colors.background.hex}};
  --b2: {{hsl colors.muted.hex}};
  --b3: {{hsl colors.border.hex}};
  --bc: {{hsl colors.foreground.hex}};

  /* Info, Success, Warning, Error */
  --in: {{hsl colors.primary.hex}};
  --su: {{hsl colors.success.hex}};
  --wa: {{hsl colors.warning.hex}};
  --er: {{hsl colors.destructive.hex}};

  /* Roundedness */
  --rounded-box: {{rem radius.lg}};
  --rounded-btn: {{rem radius.md}};
  --rounded-badge: {{rem radius.full}};

  /* Other */
  --animation-btn: 0.25s;
  --animation-input: 0.2s;
  --btn-focus-scale: 0.95;
  --border-btn: 1px;
  --tab-border: 1px;
  --tab-radius: {{rem radius.md}};
}

body {
  font-family: '{{fonts.body}}', system-ui, sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: '{{fonts.heading}}', system-ui, sans-serif;
}
```

### templates/daisyui/tailwind.config.ts.hbs

```handlebars
import type { Config } from "tailwindcss";
import daisyui from "daisyui";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        heading: ['{{fonts.heading}}', 'system-ui', 'sans-serif'],
        sans: ['{{fonts.body}}', 'system-ui', 'sans-serif'],
        mono: ['{{fonts.mono}}', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        bespoke: {
          "primary": "{{colors.primary.hex}}",
          "secondary": "{{colors.secondary.hex}}",
          "accent": "{{colors.accent.hex}}",
          "neutral": "{{colors.foreground.hex}}",
          "base-100": "{{colors.background.hex}}",
          "info": "{{colors.primary.hex}}",
          "success": "{{colors.success.hex}}",
          "warning": "{{colors.warning.hex}}",
          "error": "{{colors.destructive.hex}}",
        },
      },
    ],
  },
};

export default config;
```

### templates/generic/design-tokens.css.hbs

```handlebars
/**
 * Bespoke Design Tokens
 * Framework-agnostic CSS custom properties
 *
 * Generated: {{meta.generated_at}}
 * Layout: {{meta.layout_id}}
 * Typography: {{meta.typography_id}}
 * Palette: {{meta.palette_id}}
 */

{{{fonts.cssImport}}}

:root {
  /* ===== COLORS ===== */

  /* Primary */
  --color-primary: {{colors.primary.hex}};
  --color-primary-rgb: {{colors.primary.rgbString}};
  --color-primary-hsl: {{colors.primary.hslCss}};

  /* Secondary */
  --color-secondary: {{colors.secondary.hex}};
  --color-secondary-rgb: {{colors.secondary.rgbString}};

  /* Accent / CTA */
  --color-accent: {{colors.accent.hex}};
  --color-cta: {{colors.cta.hex}};

  /* Background & Foreground */
  --color-background: {{colors.background.hex}};
  --color-foreground: {{colors.foreground.hex}};
  --color-muted: {{colors.muted.hex}};
  --color-muted-foreground: {{colors.mutedForeground.hex}};

  /* Semantic */
  --color-destructive: {{colors.destructive.hex}};
  --color-success: {{colors.success.hex}};
  --color-warning: {{colors.warning.hex}};

  /* UI Elements */
  --color-border: {{colors.border.hex}};
  --color-input: {{colors.border.hex}};
  --color-ring: {{withOpacity colors.primary.hex 0.5}};

  /* ===== TYPOGRAPHY ===== */

  --font-family-heading: '{{fonts.heading}}', system-ui, -apple-system, sans-serif;
  --font-family-body: '{{fonts.body}}', system-ui, -apple-system, sans-serif;
  --font-family-mono: '{{fonts.mono}}', ui-monospace, SFMono-Regular, monospace;

  /* Font Sizes */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */

  /* Line Heights */
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;

  /* Font Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* ===== SPACING ===== */

  --spacing-xs: {{px spacing.xs}};
  --spacing-sm: {{px spacing.sm}};
  --spacing-md: {{px spacing.md}};
  --spacing-lg: {{px spacing.lg}};
  --spacing-xl: {{px spacing.xl}};
  --spacing-2xl: {{px spacing.2xl}};
  --spacing-3xl: {{px spacing.3xl}};
  --spacing-section: {{px spacing.section}};

  /* ===== BORDER RADIUS ===== */

  --radius-sm: {{px radius.sm}};
  --radius-md: {{px radius.md}};
  --radius-lg: {{px radius.lg}};
  --radius-xl: {{px radius.xl}};
  --radius-full: {{radius.full}};

  /* ===== SHADOWS ===== */

  --shadow-sm: {{shadows.sm}};
  --shadow-md: {{shadows.md}};
  --shadow-lg: {{shadows.lg}};
  --shadow-xl: {{shadows.xl}};

  /* ===== TRANSITIONS ===== */

  --transition-fast: 150ms ease;
  --transition-normal: 250ms ease;
  --transition-slow: 350ms ease;
}

/* ===== UTILITY CLASSES ===== */

.text-primary { color: var(--color-primary); }
.text-secondary { color: var(--color-secondary); }
.text-muted { color: var(--color-muted-foreground); }
.text-foreground { color: var(--color-foreground); }

.bg-primary { background-color: var(--color-primary); }
.bg-secondary { background-color: var(--color-secondary); }
.bg-background { background-color: var(--color-background); }
.bg-muted { background-color: var(--color-muted); }

.border-default { border-color: var(--color-border); }
.border-primary { border-color: var(--color-primary); }

.font-heading { font-family: var(--font-family-heading); }
.font-body { font-family: var(--font-family-body); }
.font-mono { font-family: var(--font-family-mono); }

.rounded-sm { border-radius: var(--radius-sm); }
.rounded-md { border-radius: var(--radius-md); }
.rounded-lg { border-radius: var(--radius-lg); }
.rounded-full { border-radius: var(--radius-full); }
```

---

## Adding New Frameworks

### Step-by-Step Guide

#### Step 1: Create Framework Directory

```bash
mkdir templates/myframework/
```

#### Step 2: Create Framework Profile CSV

Create `data/framework-profiles/myframework-profile.csv`:

```csv
generic_token,framework_token,category,transform,notes
colors.primary.hex,--my-primary,color,hsl,"Primary color"
colors.secondary.hex,--my-secondary,color,hsl,"Secondary color"
colors.background.hex,--my-bg,color,none,"Background (keep hex)"
fonts.heading,--my-font-heading,typography,quote,"Heading font"
fonts.body,--my-font-body,typography,quote,"Body font"
radius.md,--my-radius,spacing,rem,"Border radius"
```

#### Step 3: Create Template Files

Create templates matching your framework's expected files:

**templates/myframework/theme.css.hbs:**
```handlebars
/* MyFramework Theme */
/* Generated by Bespoke Design Pipeline */

{{{fonts.cssImport}}}

:root {
  --my-primary: {{hsl colors.primary.hex}};
  --my-secondary: {{hsl colors.secondary.hex}};
  --my-bg: {{colors.background.hex}};
  --my-fg: {{colors.foreground.hex}};
  --my-font-heading: '{{fonts.heading}}', sans-serif;
  --my-font-body: '{{fonts.body}}', sans-serif;
  --my-radius: {{rem radius.md}};
}
```

**templates/myframework/config.js.hbs:**
```handlebars
// MyFramework Configuration
module.exports = {
  theme: {
    colors: {
      primary: "{{colors.primary.hex}}",
      secondary: "{{colors.secondary.hex}}",
      background: "{{colors.background.hex}}",
      foreground: "{{colors.foreground.hex}}"
    },
    fonts: {
      heading: "{{fonts.heading}}",
      body: "{{fonts.body}}"
    }
  }
};
```

#### Step 4: Register Framework in generate-tokens.ts

Add your framework to the supported list:

```typescript
const SUPPORTED_FRAMEWORKS = [
  'generic',
  'shadcn',
  'daisyui',
  'aceternity',
  'magicui',
  'nextui',
  'myframework'  // Add here
];

function renderFrameworkTemplates(framework: string, context: Context, outputDir: string) {
  switch (framework) {
    // ... existing cases ...

    case 'myframework':
      return {
        myframework_css: renderTemplate('myframework/theme.css.hbs', context, `${outputDir}myframework-theme.css`),
        myframework_config: renderTemplate('myframework/config.js.hbs', context, `${outputDir}myframework.config.js`)
      };
  }
}
```

#### Step 5: Document the Framework

Add to this specification:
- Expected output files
- Required configuration
- Integration instructions

#### Step 6: Test

```bash
npm run generate-tokens -- --framework=myframework --niche=medical --app-type=patient-portal
```

Verify:
- [ ] Output files are syntactically valid
- [ ] Colors render correctly
- [ ] Fonts are properly quoted
- [ ] Framework accepts the configuration

---

## Testing Templates

### Template Validation Script

```typescript
// scripts/test/validate-templates.ts

import Handlebars from 'handlebars';
import { readFileSync, readdirSync } from 'fs';
import { registerHelpers } from '../templates/helpers';

const testContext = {
  fonts: {
    heading: 'Inter',
    body: 'Roboto',
    mono: 'JetBrains Mono',
    googleFontsUrl: 'https://fonts.googleapis.com/...',
    cssImport: '@import url(...);'
  },
  colors: {
    primary: { hex: '#0369A1', rgb: [3, 105, 161], hsl: [199, 96, 32] },
    secondary: { hex: '#0EA5E9', rgb: [14, 165, 233], hsl: [199, 89, 48] },
    // ... rest of colors
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 4, md: 8, lg: 12, xl: 16, full: '9999px' },
  shadows: { sm: '...', md: '...', lg: '...', xl: '...' },
  meta: { layout_id: 'test', typography_id: 'test', palette_id: 'test' }
};

async function validateAllTemplates() {
  const handlebars = Handlebars.create();
  registerHelpers(handlebars);

  const templateDirs = readdirSync('templates', { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== 'helpers' && d.name !== 'partials');

  for (const dir of templateDirs) {
    const templates = readdirSync(`templates/${dir.name}`)
      .filter(f => f.endsWith('.hbs'));

    for (const templateFile of templates) {
      const templatePath = `templates/${dir.name}/${templateFile}`;
      console.log(`Testing: ${templatePath}`);

      try {
        const source = readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(source);
        const output = template(testContext);

        // Basic validation
        if (!output || output.length < 10) {
          throw new Error('Output too short');
        }

        // Check for unresolved placeholders
        if (output.includes('{{') || output.includes('}}')) {
          throw new Error('Unresolved Handlebars expressions');
        }

        // Framework-specific validation
        if (templateFile.endsWith('.css.hbs')) {
          validateCSS(output, templatePath);
        } else if (templateFile.endsWith('.ts.hbs') || templateFile.endsWith('.js.hbs')) {
          validateJS(output, templatePath);
        } else if (templateFile.endsWith('.json.hbs')) {
          validateJSON(output, templatePath);
        }

        console.log(`  ✓ ${templateFile}`);
      } catch (error) {
        console.error(`  ✗ ${templateFile}: ${error.message}`);
        process.exitCode = 1;
      }
    }
  }
}

function validateCSS(css: string, path: string) {
  // Check for common CSS errors
  const openBraces = (css.match(/{/g) || []).length;
  const closeBraces = (css.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    throw new Error(`Mismatched braces: ${openBraces} open, ${closeBraces} close`);
  }

  // Check for valid CSS custom properties
  const cssVars = css.match(/--[\w-]+/g) || [];
  for (const v of cssVars) {
    if (v.includes('undefined') || v.includes('null')) {
      throw new Error(`Invalid CSS variable: ${v}`);
    }
  }
}

function validateJS(js: string, path: string) {
  // Try to parse as JavaScript
  try {
    new Function(js);
  } catch (e) {
    throw new Error(`Invalid JavaScript: ${e.message}`);
  }
}

function validateJSON(json: string, path: string) {
  try {
    JSON.parse(json);
  } catch (e) {
    throw new Error(`Invalid JSON: ${e.message}`);
  }
}

validateAllTemplates();
```

### Visual Regression Testing

```typescript
// scripts/test/visual-regression.ts

import { generateTokens } from '../generate-tokens';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import crypto from 'crypto';

const testCases = [
  { niche: 'medical', appType: 'patient-portal', framework: 'shadcn' },
  { niche: 'fintech', appType: 'trading-dashboard', framework: 'shadcn' },
  { niche: 'saas', appType: 'productivity-tool', framework: 'daisyui' },
];

async function runVisualRegression() {
  for (const testCase of testCases) {
    const caseId = `${testCase.niche}-${testCase.appType}-${testCase.framework}`;
    console.log(`Testing: ${caseId}`);

    // Generate tokens
    await generateTokens({
      layout: `${testCase.niche}_test_01`,
      typography: 'typo-001',
      palette: 'palette-01',
      frameworks: [testCase.framework]
    });

    // Hash output files
    const outputFiles = getOutputFiles(testCase.framework);
    const currentHashes: Record<string, string> = {};

    for (const file of outputFiles) {
      const content = readFileSync(file, 'utf8');
      currentHashes[file] = crypto.createHash('md5').update(content).digest('hex');
    }

    // Compare to baseline
    const baselinePath = `test/baselines/${caseId}.json`;
    let baseline: Record<string, string>;

    try {
      baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
    } catch {
      // No baseline exists, create one
      writeFileSync(baselinePath, JSON.stringify(currentHashes, null, 2));
      console.log(`  Created baseline for ${caseId}`);
      continue;
    }

    // Compare
    const differences: string[] = [];
    for (const [file, hash] of Object.entries(currentHashes)) {
      if (baseline[file] !== hash) {
        differences.push(file);
      }
    }

    if (differences.length > 0) {
      console.log(`  ⚠ Changes detected in: ${differences.join(', ')}`);
      // Optionally: show diff, prompt to update baseline
    } else {
      console.log(`  ✓ No changes`);
    }
  }
}

runVisualRegression();
```

---

## Appendix: Complete Token Reference

### Color Tokens

| Generic Token | Description | Default Value |
|---------------|-------------|---------------|
| colors.primary | Primary brand color | Palette-specific |
| colors.secondary | Secondary brand color | Palette-specific |
| colors.accent | Accent/CTA color | Same as CTA |
| colors.cta | Call-to-action buttons | Palette-specific |
| colors.background | Page background | #F8FAFC |
| colors.foreground | Default text | #0F172A |
| colors.muted | Muted backgrounds | Lightened background |
| colors.mutedForeground | Muted text | Darkened background |
| colors.card | Card background | Same as background |
| colors.cardForeground | Card text | Same as foreground |
| colors.border | Default borders | Palette-specific |
| colors.input | Input borders | Same as border |
| colors.ring | Focus rings | Primary with opacity |
| colors.destructive | Error/danger | #DC2626 |
| colors.destructiveForeground | Error text | #FAFAFA |
| colors.success | Success states | #10B981 |
| colors.warning | Warning states | #F59E0B |

### Typography Tokens

| Generic Token | Description | Example |
|---------------|-------------|---------|
| fonts.heading | Heading font family | "Inter" |
| fonts.body | Body text font | "Roboto" |
| fonts.mono | Monospace font | "JetBrains Mono" |
| fonts.googleFontsUrl | Google Fonts URL | https://fonts.google... |
| fonts.cssImport | CSS @import statement | @import url(...); |

### Spacing Tokens

| Generic Token | Description | Default (px) |
|---------------|-------------|--------------|
| spacing.xs | Extra small | 4 |
| spacing.sm | Small | 8 |
| spacing.md | Medium | 16 |
| spacing.lg | Large | 24 |
| spacing.xl | Extra large | 32 |
| spacing.2xl | 2× extra large | 48 |
| spacing.3xl | 3× extra large | 64 |
| spacing.section | Section gap | 80 |

### Radius Tokens

| Generic Token | Description | Default (px) |
|---------------|-------------|--------------|
| radius.sm | Small | 4 |
| radius.md | Medium | 8 |
| radius.lg | Large | 12 |
| radius.xl | Extra large | 16 |
| radius.full | Full/pill | 9999px |

---

*End of Handlebars Template System Specification*