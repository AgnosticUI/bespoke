/**
 * Generate Tokens — Phase 3
 * Renders selected design choices into framework-ready token files
 * using Handlebars templates + helpers.
 *
 * Usage:
 *   npx tsx scripts/generate-tokens.ts [--frameworks shadcn,generic] [--palette palette-preview-XX]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { createHandlebars } from '../templates/helpers/index.js';
import { readState, completeStage } from './utils/state-manager.js';
import { loadCSV } from './utils/csv-loader.js';
import {
  createColorValue,
  lighten,
  darken,
  getContrastingText,
  calculateContrast,
  formatContrastRatio,
  meetsWCAG,
  type ColorValue,
} from './utils/color-conversions.js';

// ── Types ──────────────────────────────────────────────────────────────

interface Combination {
  id: string;
  layoutId: string;
  typoId: string;
  layoutVariant: string;
  typoPairing: string;
  svgFile: string;
}

interface Typography {
  id: string;
  pairing_name: string;
  heading_font: string;
  body_font: string;
  category: string;
  mood: string[];
  best_for: string;
  google_fonts_url: string;
}

interface PaletteEntry {
  id: string;
  paletteId: string;
  svgFile: string;
  palette: {
    id: string;
    product_type: string;
    primary: string;
    secondary: string;
    cta: string;
    background: string;
    text: string;
    border: string;
    notes: string;
  };
  contrast: Record<string, unknown>;
  wcagLevel: string;
}

interface TemplateContext {
  fonts: {
    heading: string;
    body: string;
    mono: string;
    googleFontsUrl: string;
    cssImport: string;
  };
  colors: Record<string, ColorValue>;
  darkColors: Record<string, ColorValue>;
  spacing: Record<string, number>;
  radius: Record<string, number | string>;
  shadows: Record<string, string>;
  meta: {
    layout_id: string;
    typography_id: string;
    palette_id: string;
    niche: string;
    app_type: string;
    timestamp: string;
    version: string;
  };
}

// ── CLI Arg Parsing ────────────────────────────────────────────────────

function parseArgs(): { frameworks: string[]; paletteOverride: string | null } {
  const args = process.argv.slice(2);
  let frameworks = ['shadcn', 'generic'];
  let paletteOverride: string | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--frameworks' && args[i + 1]) {
      frameworks = args[i + 1].split(',').map((f) => f.trim());
      i++;
    } else if (args[i] === '--palette' && args[i + 1]) {
      paletteOverride = args[i + 1];
      i++;
    }
  }

  return { frameworks, paletteOverride };
}

// ── Data Loading ───────────────────────────────────────────────────────

function loadJSON<T>(relativePath: string): T {
  const abs = resolve(relativePath);
  return JSON.parse(readFileSync(abs, 'utf-8')) as T;
}

function resolveCombination(comboId: string): Combination {
  const data = loadJSON<{ combos: Combination[] }>('.design-pipeline/combinations/combinations.json');
  const combo = data.combos.find((c) => c.id === comboId);
  if (!combo) throw new Error(`Combination ${comboId} not found`);
  return combo;
}

function resolveTypography(typoId: string): Typography {
  const data = loadJSON<Typography[]>('.design-pipeline/typography/filtered.json');
  const typo = data.find((t) => t.id === typoId);
  if (!typo) throw new Error(`Typography ${typoId} not found`);
  return typo;
}

function resolvePalette(paletteId: string): PaletteEntry {
  // Search across all palette directories
  const dirs = ['.design-pipeline/palettes', '.design-pipeline/palettes-dashboard', '.design-pipeline/palettes-storefront', '.design-pipeline/palettes-content'];
  for (const dir of dirs) {
    const filePath = resolve(`${dir}/palettes.json`);
    if (!existsSync(filePath)) continue;
    const data = loadJSON<PaletteEntry[]>(filePath);
    const entry = data.find((p) => p.id === paletteId);
    if (entry) return entry;
  }
  throw new Error(`Palette ${paletteId} not found in any palettes directory`);
}

// ── Context Building ───────────────────────────────────────────────────

function buildContext(
  combo: Combination,
  typo: Typography,
  palette: PaletteEntry,
  niche: string,
  appType: string
): TemplateContext {
  const pal = palette.palette;

  // Build CSS import from Google Fonts URL
  const cssImport = `@import url('${typo.google_fonts_url}');`;

  // Base 6 colors
  const colors: Record<string, ColorValue> = {
    primary: createColorValue(pal.primary),
    secondary: createColorValue(pal.secondary),
    accent: createColorValue(pal.cta), // CTA = accent
    background: createColorValue(pal.background),
    foreground: createColorValue(pal.text),
    border: createColorValue(pal.border),
  };

  // Derived colors
  colors.muted = createColorValue(darken(pal.background, 5));
  colors.mutedForeground = createColorValue(lighten(pal.text, 40));
  colors.card = createColorValue(pal.background);
  colors.cardForeground = createColorValue(pal.text);
  colors.input = createColorValue(pal.border);
  colors.ring = createColorValue(pal.primary);
  colors.destructive = createColorValue('#DC2626');
  colors.destructiveForeground = createColorValue(getContrastingText('#DC2626'));
  colors.success = createColorValue('#16A34A');
  colors.warning = createColorValue('#F59E0B');

  // Dark mode derived colors (pre-computed for templates)
  const darkColors: Record<string, ColorValue> = {};

  darkColors.background = createColorValue(darken(pal.text, 5));
  darkColors.foreground = createColorValue(lighten(pal.background, 5));

  darkColors.card = createColorValue(darken(pal.text, 3));
  darkColors.cardForeground = createColorValue(lighten(pal.background, 5));

  darkColors.popover = createColorValue(darken(pal.text, 3));
  darkColors.popoverForeground = createColorValue(lighten(pal.background, 5));

  const darkPrimary = lighten(pal.primary, 10);
  darkColors.primary = createColorValue(darkPrimary);
  darkColors.primaryForeground = createColorValue(getContrastingText(darkPrimary));

  const darkSecondary = darken(pal.secondary, 30);
  darkColors.secondary = createColorValue(darkSecondary);
  darkColors.secondaryForeground = createColorValue(getContrastingText(darkSecondary));

  darkColors.muted = createColorValue(darken(pal.text, 2));
  darkColors.mutedForeground = createColorValue(lighten(colors.mutedForeground.hex, 20));

  const darkAccent = darken(pal.cta, 10);
  darkColors.accent = createColorValue(darkAccent);
  darkColors.accentForeground = createColorValue(getContrastingText(darkAccent));

  const darkDestructive = lighten('#DC2626', 10);
  darkColors.destructive = createColorValue(darkDestructive);
  darkColors.destructiveForeground = createColorValue(getContrastingText(darkDestructive));

  darkColors.border = createColorValue(lighten(pal.border, 10));
  darkColors.input = createColorValue(lighten(pal.border, 10));
  darkColors.ring = createColorValue(lighten(pal.primary, 10));

  darkColors.success = createColorValue(lighten('#16A34A', 10));
  darkColors.successForeground = createColorValue(getContrastingText(lighten('#16A34A', 10)));
  darkColors.warning = createColorValue(lighten('#F59E0B', 10));
  darkColors.warningForeground = createColorValue(getContrastingText(lighten('#F59E0B', 10)));

  return {
    fonts: {
      heading: typo.heading_font,
      body: typo.body_font,
      mono: 'JetBrains Mono',
      googleFontsUrl: typo.google_fonts_url,
      cssImport,
    },
    colors,
    darkColors,
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48, '3xl': 64, section: 80 },
    radius: { sm: 4, md: 8, lg: 12, xl: 16, full: '9999px' },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    },
    meta: {
      layout_id: combo.layoutId,
      typography_id: combo.typoId,
      palette_id: palette.id,
      niche,
      app_type: appType,
      timestamp: new Date().toISOString(),
      version: '1.0',
    },
  };
}

// ── Manifest Generation ────────────────────────────────────────────────

function buildManifest(
  context: TemplateContext,
  palette: PaletteEntry,
  outputFiles: Record<string, string>,
  combo: Combination
) {
  const pal = palette.palette;
  return {
    meta: context.meta,
    fonts: context.fonts,
    layoutBlueprint: {
      id: combo.layoutId,
      variant: combo.layoutVariant,
      svgPath: '.design-pipeline/tokens/layout-blueprint.svg',
      purpose: 'Spatial reference for LLM-driven UI generation. Encodes component placement, hierarchy, and density.',
    },
    colors: {
      base: {
        primary: pal.primary,
        secondary: pal.secondary,
        cta: pal.cta,
        background: pal.background,
        text: pal.text,
        border: pal.border,
      },
      derived: Object.fromEntries(
        Object.entries(context.colors).map(([k, v]) => [k, v.hex])
      ),
      dark: Object.fromEntries(
        Object.entries(context.darkColors).map(([k, v]) => [k, v.hex])
      ),
    },
    contrast: {
      textOnBackground: {
        ratio: formatContrastRatio(calculateContrast(pal.text, pal.background)),
        aa: meetsWCAG(pal.text, pal.background, 'AA'),
        aaa: meetsWCAG(pal.text, pal.background, 'AAA'),
      },
      primaryOnBackground: {
        ratio: formatContrastRatio(calculateContrast(pal.primary, pal.background)),
        aa: meetsWCAG(pal.primary, pal.background, 'AA'),
        aaa: meetsWCAG(pal.primary, pal.background, 'AAA'),
      },
      ctaOnBackground: {
        ratio: formatContrastRatio(calculateContrast(pal.cta, pal.background)),
        aa: meetsWCAG(pal.cta, pal.background, 'AA'),
        aaa: meetsWCAG(pal.cta, pal.background, 'AAA'),
      },
    },
    spacing: context.spacing,
    radius: context.radius,
    shadows: context.shadows,
    outputFiles,
  };
}

// ── Implementation Guide ───────────────────────────────────────────────

function buildImplementationGuide(context: TemplateContext, outputFiles: Record<string, string>, constraints: Constraints, combo: Combination): string {
  const lines: string[] = [
    `# Design Token Implementation Guide`,
    ``,
    `> Generated by Bespoke Design Pipeline on ${context.meta.timestamp}`,
    `> Niche: **${context.meta.niche}** | App Type: **${context.meta.app_type}**`,
    ``,
    `## Generated Files`,
    ``,
  ];

  for (const [key, path] of Object.entries(outputFiles)) {
    lines.push(`- \`${path}\` — ${key}`);
  }

  lines.push('', '## Fonts', '');
  lines.push(`Add this to your \`<head>\` or CSS entry point:`);
  lines.push('```html');
  lines.push(`<link rel="stylesheet" href="${context.fonts.googleFontsUrl}" />`);
  lines.push('```');

  // Layout Blueprint section
  if (outputFiles['layout']) {
    lines.push(
      '',
      '## Layout Blueprint',
      '',
      `The file \`layout-blueprint.svg\` is the spatial wireframe for **${combo.layoutVariant}**. It encodes:`,
      '',
      '- Component placement and relative sizing',
      '- Information hierarchy (what goes above the fold)',
      '- Navigation patterns and content density',
      '',
      'Use this SVG as a spatial reference when prompting an LLM to build UI:',
      '',
      '```',
      `Build [component] following the spatial layout in layout-blueprint.svg.`,
      `Use design tokens from ${outputFiles['shadcn'] || outputFiles['generic'] || outputFiles['daisyui'] || outputFiles['agnosticui'] || 'the generated CSS file'} for colors and typography.`,
      '```',
      ''
    );
  }

  if (outputFiles['shadcn']) {
    lines.push(
      '',
      '## shadcn/ui Integration',
      '',
      '1. Copy `shadcn-globals.css` to your project (e.g. `src/app/globals.css`)',
      '2. The file uses HSL color variables compatible with shadcn/ui',
      '3. Dark mode is supported via three mechanisms:',
      '   - `@media (prefers-color-scheme: dark)` — automatic OS preference detection',
      '   - `[data-theme="dark"]` — explicit attribute toggle (e.g. theme switcher)',
      '   - `.dark` class — compatible with `next-themes` and Tailwind `darkMode: "class"`',
      '4. Font family variables are set on `--font-heading`, `--font-body`, `--font-mono`',
      ''
    );
  }

  if (outputFiles['generic']) {
    lines.push(
      '',
      '## Generic CSS Integration',
      '',
      '1. Import `design-tokens.css` at the top of your main CSS file',
      '2. All tokens are available as CSS custom properties (`--color-primary`, etc.)',
      '3. Dark mode is supported via:',
      '   - `@media (prefers-color-scheme: dark)` — automatic OS preference detection',
      '   - `[data-theme="dark"]` — explicit attribute toggle for theme switchers',
      '4. Utility classes (`.text-primary`, `.bg-primary`) are included',
      '5. Spacing uses `--space-xs` through `--space-section`',
      ''
    );
  }

  if (outputFiles['daisyui']) {
    lines.push(
      '',
      '## DaisyUI Integration',
      '',
      '1. Import `daisyui-theme.css` in your project',
      '2. Set `data-theme="bespoke"` on your `<html>` element for light mode',
      '3. Set `data-theme="bespoke-dark"` for dark mode',
      '4. If using Tailwind + DaisyUI plugin, register the theme in your CSS:',
      '   ```css',
      '   @import "tailwindcss";',
      '   @plugin "daisyui";',
      '   @import "./daisyui-theme.css";',
      '   ```',
      '5. All DaisyUI components will automatically use your brand colors',
      ''
    );
  }

  if (outputFiles['agnosticui']) {
    lines.push(
      '',
      '## AgnosticUI Integration',
      '',
      '1. Import `agnosticui-tokens.css` AFTER AgnosticUI\'s base CSS',
      '2. Semantic tokens (`--ag-primary`, `--ag-text-primary`, etc.) are overridden with your brand palette',
      '3. Dark mode via `[data-theme="dark"]` on your `<html>` element',
      '4. Primitive color scales (--ag-blue-50 through --ag-blue-900, etc.) are left at defaults',
      '5. All AgnosticUI components will use your overridden tokens',
      ''
    );
  }

  lines.push(
    '## Color Palette',
    '',
    `| Token | Hex |`,
    `|-------|-----|`,
  );
  for (const [name, cv] of Object.entries(context.colors)) {
    lines.push(`| ${name} | \`${cv.hex}\` |`);
  }

  // Design Constraints Checklist
  const hasAny = constraints.accessibility.length > 0
    || constraints.interaction.length > 0
    || constraints.performance.length > 0;

  if (hasAny) {
    lines.push('', '## Design Constraints Checklist', '');

    const isHighImpact = (level: string) => /^(blocker|high)$/i.test(level);

    if (constraints.accessibility.length > 0) {
      const rows = constraints.accessibility.filter(r => isHighImpact(r.impact_level));
      if (rows.length > 0) {
        lines.push('### Accessibility', '');
        for (const r of rows) {
          lines.push(`- [ ] **${r.constraint}** — ${r.remediation}`);
        }
        lines.push('');
      }
    }

    if (constraints.interaction.length > 0) {
      const rows = constraints.interaction.filter(r => isHighImpact(r.impact_level));
      if (rows.length > 0) {
        lines.push('### Interaction', '');
        for (const r of rows) {
          lines.push(`- [ ] **${r.constraint}** — ${r.remediation}`);
        }
        lines.push('');
      }
    }

    if (constraints.performance.length > 0) {
      lines.push('### Performance', '');
      for (const r of constraints.performance) {
        lines.push(`- [ ] **${r.constraint}**: ${r.metric} ${r.threshold} — ${r.remediation}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

// ── Constraint Loading ──────────────────────────────────────────────────

type ConstraintRows = Record<string, string>[];

interface Constraints {
  accessibility: ConstraintRows;
  interaction: ConstraintRows;
  performance: ConstraintRows;
}

function loadConstraints(): Constraints {
  const result: Constraints = { accessibility: [], interaction: [], performance: [] };
  const categories = ['accessibility', 'interaction', 'performance'] as const;

  for (const cat of categories) {
    const filePath = `data/constraints/${cat}.csv`;
    if (!existsSync(resolve(filePath))) continue;
    try {
      const csv = loadCSV(filePath, { multiValueColumns: [] });
      result[cat] = csv.toObjects();
    } catch {
      // Gracefully skip unparseable files
    }
  }

  return result;
}

// ── Template Rendering ─────────────────────────────────────────────────

const TEMPLATE_MAP: Record<string, { template: string; output: string }> = {
  shadcn: {
    template: 'templates/shadcn/globals.css.hbs',
    output: '.design-pipeline/tokens/shadcn-globals.css',
  },
  generic: {
    template: 'templates/generic/design-tokens.css.hbs',
    output: '.design-pipeline/tokens/design-tokens.css',
  },
  daisyui: {
    template: 'templates/daisyui/theme.css.hbs',
    output: '.design-pipeline/tokens/daisyui-theme.css',
  },
  agnosticui: {
    template: 'templates/agnosticui/design-tokens.css.hbs',
    output: '.design-pipeline/tokens/agnosticui-tokens.css',
  },
};

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  const { frameworks, paletteOverride } = parseArgs();

  console.log('=== Generate Tokens (Phase 3) ===\n');

  // 1. Load pipeline state
  const state = readState();
  console.log(`Pipeline state: stage=${state.current_stage}, niche=${state.inferred_niche}`);

  const comboId = state.selected_combination;
  if (!comboId) throw new Error('No selected_combination in pipeline state');

  const paletteId = paletteOverride || state.selected_palette;
  if (!paletteId) throw new Error('No selected_palette in pipeline state (use --palette to override)');

  // 2. Resolve all data
  console.log(`\nResolving: combo=${comboId}, palette=${paletteId}`);
  const combo = resolveCombination(comboId);
  const typo = resolveTypography(combo.typoId);
  const palette = resolvePalette(paletteId);

  console.log(`  Layout: ${combo.layoutVariant} (${combo.layoutId})`);
  console.log(`  Typography: ${typo.pairing_name} — ${typo.heading_font} / ${typo.body_font}`);
  console.log(`  Palette: ${palette.palette.notes}`);

  // 3. Build template context
  const context = buildContext(
    combo,
    typo,
    palette,
    state.inferred_niche || 'unknown',
    state.application_type || 'unknown'
  );

  // 4. Ensure output directory
  const outputDir = resolve('.design-pipeline/tokens');
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // 4b. Copy layout blueprint SVG to output dir
  const layoutSrc = resolve(`.design-pipeline/layouts/${combo.layoutId}.svg`);
  const layoutDest = resolve('.design-pipeline/tokens/layout-blueprint.svg');
  if (existsSync(layoutSrc)) {
    copyFileSync(layoutSrc, layoutDest);
    console.log(`  Copied layout blueprint: ${combo.layoutId}.svg → layout-blueprint.svg`);
  } else {
    console.warn(`  Warning: Layout SVG not found at ${layoutSrc} — skipping blueprint copy`);
  }

  // 5. Render templates
  const hbs = createHandlebars();
  const outputFiles: Record<string, string> = {};

  for (const fw of frameworks) {
    const mapping = TEMPLATE_MAP[fw];
    if (!mapping) {
      console.warn(`Unknown framework: ${fw} — skipping`);
      continue;
    }

    console.log(`\nRendering ${fw} template...`);
    const templateSrc = readFileSync(resolve(mapping.template), 'utf-8');
    const compiled = hbs.compile(templateSrc, { noEscape: true });
    const rendered = compiled(context);

    const outputPath = resolve(mapping.output);
    writeFileSync(outputPath, rendered, 'utf-8');
    console.log(`  → ${mapping.output}`);
    outputFiles[fw] = mapping.output;
  }

  // 5b. Add layout blueprint to output files
  if (existsSync(layoutDest)) {
    outputFiles['layout'] = '.design-pipeline/tokens/layout-blueprint.svg';
  }

  // 6. Generate manifest
  console.log('\nGenerating design_manifest.json...');
  const manifest = buildManifest(context, palette, outputFiles, combo);
  const manifestPath = resolve('.design-pipeline/tokens/design_manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  outputFiles['manifest'] = '.design-pipeline/tokens/design_manifest.json';

  // 7. Generate implementation guide
  console.log('Generating IMPLEMENTATION.md...');
  const constraints = loadConstraints();
  const guide = buildImplementationGuide(context, outputFiles, constraints, combo);
  const guidePath = resolve('.design-pipeline/tokens/IMPLEMENTATION.md');
  writeFileSync(guidePath, guide, 'utf-8');
  outputFiles['guide'] = '.design-pipeline/tokens/IMPLEMENTATION.md';

  // 8. Update pipeline state — complete palette_application, then token_generation
  completeStage('palette_application', 'token_generation', {
    selected_palette: paletteId,
    final_combination: {
      layout: combo.layoutId,
      typography: combo.typoId,
      palette: paletteId,
    },
  });
  completeStage('token_generation', 'complete', {
    generated_tokens: outputFiles,
    pipeline_complete: true,
  });

  console.log('\n=== Token generation complete ===');
  console.log('Output files:');
  for (const [key, path] of Object.entries(outputFiles)) {
    console.log(`  ${key}: ${path}`);
  }
}

main().catch((err) => {
  console.error('Token generation failed:', err.message);
  process.exit(1);
});
