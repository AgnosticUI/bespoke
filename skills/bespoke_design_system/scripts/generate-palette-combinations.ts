/**
 * generate-palette-combinations.ts
 * Applies color palettes to a selected layout+typography combination SVG.
 * Generates colored SVG previews with contrast ratio / WCAG compliance info.
 *
 * Usage: npx tsx scripts/generate-palette-combinations.ts --combination combo-05 --niche dashboard [--count 5]
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { loadSVG, cloneSVG, saveSVG, applyColorsViaGrayscale, generatePalettePreviewSVG } from './utils/svg-manipulator.js';
import { filterColors, ColorPalette } from './utils/filter-colors.js';
import { calculateContrast, formatContrastRatio, meetsWCAG, getContrastingText } from './utils/color-conversions.js';
import { completeStage, readState } from './utils/state-manager.js';

interface ComboMetadata {
  combos: {
    id: string;
    layoutId: string;
    typoId: string;
    layoutVariant: string;
    typoPairing: string;
    svgFile: string;
  }[];
  row_labels: string[];
  col_labels: string[];
}

interface ContrastCheck {
  ratio: string;
  rawRatio: number;
  aa: boolean;
  aaa: boolean;
}

interface PalettePreview {
  id: string;
  paletteId: string;
  svgFile: string;
  palette: ColorPalette;
  contrast: {
    textOnBg: ContrastCheck;
    autoOnPrimary: ContrastCheck & { autoColor: string };
    autoOnCta: ContrastCheck & { autoColor: string };
  };
  wcagLevel: 'AAA' | 'AA' | 'A' | 'FAIL';
}

function parseArgs() {
  const args = process.argv.slice(2);
  let combination = '';
  let niche = '';
  let count = 5;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--combination' && args[i + 1]) { combination = args[i + 1]; i++; }
    else if (args[i] === '--niche' && args[i + 1]) { niche = args[i + 1]; i++; }
    else if (args[i] === '--count' && args[i + 1]) { count = parseInt(args[i + 1]); i++; }
  }

  if (!combination || !niche) {
    console.error(JSON.stringify({ error: true, code: 'INVALID_PARAMS', message: 'Required: --combination combo-05 --niche dashboard' }));
    process.exit(1);
  }

  return { combination, niche, count };
}

function computeContrast(palette: ColorPalette) {
  const textOnBgRatio = calculateContrast(palette.text, palette.background);

  // For primary and CTA surfaces, check using the best auto-contrasting text (white or black)
  // This reflects real usage: nav/header text and button labels pick the most readable color
  const autoOnPrimaryColor = getContrastingText(palette.primary);
  const autoOnPrimaryRatio = calculateContrast(autoOnPrimaryColor, palette.primary);

  const autoOnCtaColor = getContrastingText(palette.cta);
  const autoOnCtaRatio = calculateContrast(autoOnCtaColor, palette.cta);

  const textOnBg: ContrastCheck = {
    ratio: formatContrastRatio(textOnBgRatio),
    rawRatio: textOnBgRatio,
    aa: textOnBgRatio >= 4.5,
    aaa: textOnBgRatio >= 7.0
  };
  const autoOnPrimary: ContrastCheck & { autoColor: string } = {
    ratio: formatContrastRatio(autoOnPrimaryRatio),
    rawRatio: autoOnPrimaryRatio,
    aa: autoOnPrimaryRatio >= 4.5,
    aaa: autoOnPrimaryRatio >= 7.0,
    autoColor: autoOnPrimaryColor
  };
  const autoOnCta: ContrastCheck & { autoColor: string } = {
    ratio: formatContrastRatio(autoOnCtaRatio),
    rawRatio: autoOnCtaRatio,
    aa: autoOnCtaRatio >= 3.0, // UI components need 3:1 minimum
    aaa: autoOnCtaRatio >= 4.5,
    autoColor: autoOnCtaColor
  };

  // Overall WCAG level based on body readability + surface text readability
  let wcagLevel: 'AAA' | 'AA' | 'A' | 'FAIL' = 'FAIL';
  if (textOnBg.aaa && autoOnPrimary.aaa && autoOnCta.aaa) wcagLevel = 'AAA';
  else if (textOnBg.aa && autoOnPrimary.aa && autoOnCta.aa) wcagLevel = 'AA';
  else if (textOnBgRatio >= 3.0 && autoOnPrimaryRatio >= 3.0) wcagLevel = 'A';

  return { textOnBg, autoOnPrimary, autoOnCta, wcagLevel };
}

function generatePreviewHTML(
  previews: PalettePreview[],
  comboId: string,
  context: { niche: string; appType: string; confidence: number | null }
): string {
  const cards = previews.map((p, idx) => {
    const pal = p.palette;
    const swatches = [
      { label: 'Primary', color: pal.primary },
      { label: 'Secondary', color: pal.secondary },
      { label: 'CTA', color: pal.cta },
      { label: 'Background', color: pal.background },
      { label: 'Text', color: pal.text },
      { label: 'Border', color: pal.border },
    ].map(s => `
            <div class="swatch" title="${s.label}: ${s.color}">
              <div class="swatch-circle" style="background: ${s.color}; color: ${getContrastingText(s.color)};">${s.label[0]}</div>
              <span class="swatch-hex">${s.color}</span>
            </div>`).join('');

    const wcagBadgeClass = p.wcagLevel === 'AAA' ? 'badge-aaa' :
      p.wcagLevel === 'AA' ? 'badge-aa' :
      p.wcagLevel === 'A' ? 'badge-a' : 'badge-fail';

    const contrastRows = [
      { label: `Body text on background`, fg: pal.text, bg: pal.background, ...p.contrast.textOnBg },
      { label: `Label on primary`, fg: p.contrast.autoOnPrimary.autoColor, bg: pal.primary, ...p.contrast.autoOnPrimary },
      { label: `Label on CTA`, fg: p.contrast.autoOnCta.autoColor, bg: pal.cta, ...p.contrast.autoOnCta },
    ].map(c => `
              <div class="contrast-row">
                <span class="contrast-label">${c.label}</span>
                <span class="contrast-specimen" style="background:${c.bg}; color:${c.fg};" title="Foreground ${c.fg} on ${c.bg}">Aa</span>
                <span class="contrast-ratio">${c.ratio}</span>
                <span class="contrast-badge ${c.aa ? 'pass' : 'fail'}">${c.aaa ? 'AAA' : c.aa ? 'AA' : 'FAIL'}</span>
              </div>`).join('');

    return `
        <div class="card" data-id="${p.id}" onclick="selectPalette(this)">
          <div class="card-header">
            <span class="badge">${idx + 1}</span>
            <span class="card-header-title">${pal.product_type || p.paletteId}</span>
            <span class="check-mark">&#10003;</span>
          </div>
          <div class="svg-container">
            <img src="${p.svgFile}" alt="${pal.product_type || 'Palette'} color preview" />
          </div>
          <div class="swatches">${swatches}</div>
          <div class="contrast-info">
            <div class="wcag-badge ${wcagBadgeClass}">WCAG ${p.wcagLevel}</div>
            ${contrastRows}
          </div>
          ${pal.notes ? `<div class="card-footer"><span class="palette-notes">${pal.notes}</span></div>` : ''}
        </div>`;
  }).join('\n');

  // Niche context header
  const confidencePct = context.confidence ? `${Math.round(context.confidence * 100)}%` : '';
  const appTypeLabel = context.appType ? context.appType.replace(/-/g, ' ') : '';
  const nicheLabel = context.niche.charAt(0).toUpperCase() + context.niche.slice(1);
  const contextLine = appTypeLabel
    ? `${nicheLabel} / ${appTypeLabel.charAt(0).toUpperCase() + appTypeLabel.slice(1)}${confidencePct ? ` (${confidencePct} confidence)` : ''}`
    : `${nicheLabel}${confidencePct ? ` (${confidencePct} confidence)` : ''}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Palette Selection — ${comboId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; padding: 2rem; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .niche-context {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;
      padding: 0.35rem 0.75rem; font-size: 0.8rem; color: #1e40af; margin-bottom: 0.5rem;
    }
    .niche-context strong { font-weight: 700; }
    .subtitle { color: #64748b; font-size: 0.875rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
    .card {
      background: white; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden;
      cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s;
    }
    .card:hover { border-color: #94a3b8; }
    .card.selected { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
    .card-header {
      display: flex; align-items: center; gap: 8px; padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9; background: white;
    }
    .badge {
      background: #0369a1; color: white; font-size: 0.7rem; font-weight: 700;
      padding: 2px 8px; border-radius: 4px; flex-shrink: 0;
    }
    .card-header-title { font-weight: 600; font-size: 0.85rem; flex: 1; }
    .check-mark {
      display: none; background: #2563eb; color: white; width: 22px; height: 22px;
      border-radius: 50%; font-size: 12px; line-height: 22px; text-align: center; flex-shrink: 0;
    }
    .card.selected .check-mark { display: block; }
    .svg-container { padding: 12px; background: #f1f5f9; }
    .svg-container img { width: 100%; height: auto; display: block; border-radius: 4px; }
    .swatches { display: flex; gap: 8px; padding: 12px 16px; flex-wrap: wrap; justify-content: center; }
    .swatch { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .swatch-circle {
      width: 36px; height: 36px; border-radius: 50%; border: 1px solid #e2e8f0;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.65rem; font-weight: 700;
    }
    .swatch-hex { font-size: 0.6rem; color: #94a3b8; font-family: monospace; }
    .contrast-info { padding: 10px 16px; border-top: 1px solid #f1f5f9; }
    .wcag-badge {
      display: inline-block; font-size: 0.7rem; font-weight: 700; padding: 2px 8px;
      border-radius: 4px; margin-bottom: 8px;
    }
    .badge-aaa { background: #dcfce7; color: #166534; }
    .badge-aa { background: #fef9c3; color: #854d0e; }
    .badge-a { background: #fed7aa; color: #9a3412; }
    .badge-fail { background: #fecaca; color: #991b1b; }
    .contrast-row { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; margin-bottom: 4px; }
    .contrast-label { flex: 1; color: #64748b; }
    .contrast-specimen {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 20px; border-radius: 3px; border: 1px solid #d1d5db;
      font-size: 0.7rem; font-weight: 700; line-height: 1; flex-shrink: 0;
    }
    .contrast-ratio { font-family: monospace; font-weight: 600; min-width: 3.5em; text-align: right; }
    .contrast-badge { font-size: 0.65rem; font-weight: 700; padding: 1px 5px; border-radius: 3px; min-width: 2.5em; text-align: center; }
    .contrast-badge.pass { background: #dcfce7; color: #166534; }
    .contrast-badge.fail { background: #fecaca; color: #991b1b; }
    .card-footer { padding: 8px 16px; border-top: 1px solid #f1f5f9; }
    .palette-notes { font-size: 0.75rem; color: #64748b; }
    .toolbar {
      position: sticky; bottom: 0; background: white; border-top: 1px solid #e2e8f0;
      padding: 1rem 0; display: flex; align-items: center; gap: 1rem;
    }
    .toolbar button {
      background: #2563eb; color: white; border: none; padding: 0.6rem 1.5rem;
      border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer;
    }
    .toolbar button:disabled { background: #94a3b8; cursor: not-allowed; }
    .toolbar button:not(:disabled):hover { background: #1d4ed8; }
    .selection-info { color: #64748b; font-size: 0.875rem; }
    .copied { color: #16a34a; font-weight: 600; display: none; }
  </style>
</head>
<body>
  <div class="page-header">
    <h1>Palette Selection</h1>
    <div class="niche-context">Niche identified: <strong>${contextLine}</strong></div>
    <p class="subtitle">Combination: <strong>${comboId}</strong> — Select exactly <strong>1</strong> palette. Colored SVGs show real palette application.</p>
  </div>
  <div class="grid">
${cards}
  </div>
  <div class="toolbar">
    <button id="copyBtn" disabled onclick="copySelection()">Copy selected palette ID</button>
    <span class="selection-info" id="selInfo">No selection</span>
    <span class="copied" id="copiedMsg">Copied!</span>
  </div>
  <script>
    let selectedCard = null;
    let selectedId = null;
    function selectPalette(card) {
      if (selectedCard) selectedCard.classList.remove('selected');
      if (selectedCard === card) { selectedCard = null; selectedId = null; update(); return; }
      card.classList.add('selected');
      selectedCard = card;
      selectedId = card.dataset.id;
      update();
    }
    function update() {
      document.getElementById('copyBtn').disabled = !selectedId;
      document.getElementById('selInfo').textContent = selectedId ? 'Selected: ' + selectedId : 'No selection';
    }
    function copySelection() {
      navigator.clipboard.writeText(selectedId).then(() => {
        const msg = document.getElementById('copiedMsg');
        msg.style.display = 'inline';
        setTimeout(() => msg.style.display = 'none', 2000);
      });
    }
  </script>
</body>
</html>`;
}

// Main
const { combination, niche, count } = parseArgs();

// Load combo metadata
const comboMetaPath = resolve('.design-pipeline/combinations/combinations.json');
if (!existsSync(comboMetaPath)) {
  console.error(JSON.stringify({ error: true, code: 'MISSING_DATA', message: 'Run combine-previews.ts first.' }));
  process.exit(1);
}
const comboMeta: ComboMetadata = JSON.parse(readFileSync(comboMetaPath, 'utf-8'));

const selectedCombo = comboMeta.combos.find(c => c.id === combination);
if (!selectedCombo) {
  console.error(JSON.stringify({
    error: true, code: 'INVALID_COMBINATION',
    message: `Combination ${combination} not found. Available: ${comboMeta.combos.map(c => c.id).join(', ')}`
  }));
  process.exit(1);
}

// Load the combo SVG
const comboSvg = loadSVG(join('.design-pipeline/combinations', selectedCombo.svgFile));

// Get palettes
const state = readState();
const applicationType = state.application_type || '';
const colorResult = filterColors(niche, applicationType, count);

// Prepare output directory
const outputDir = resolve('.design-pipeline/palettes');
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

const previews: PalettePreview[] = [];

for (let i = 0; i < colorResult.palettes.length; i++) {
  const palette = colorResult.palettes[i];
  const id = `palette-preview-${String(i + 1).padStart(2, '0')}`;

  // Generate a niche-appropriate palette preview SVG
  const coloredSvg = generatePalettePreviewSVG({
    primary: palette.primary,
    secondary: palette.secondary,
    cta: palette.cta,
    background: palette.background,
    text: palette.text,
    border: palette.border
  }, niche);

  const filename = `${id}.svg`;
  saveSVG(coloredSvg, join(outputDir, filename));

  // Compute contrast
  const { textOnBg, autoOnPrimary, autoOnCta, wcagLevel } = computeContrast(palette);

  previews.push({
    id,
    paletteId: palette.id,
    svgFile: filename,
    palette,
    contrast: { textOnBg, autoOnPrimary, autoOnCta },
    wcagLevel
  });
}

// Generate preview HTML with niche context from pipeline state
const html = generatePreviewHTML(previews, combination, {
  niche,
  appType: applicationType,
  confidence: state.niche_confidence
});
writeFileSync(join(outputDir, 'preview.html'), html);

// Save metadata
writeFileSync(join(outputDir, 'palettes.json'), JSON.stringify(previews, null, 2));

// Update pipeline state — complete combination_preview, advance to palette_application
completeStage('combination_preview', 'palette_application', {
  selected_combination: combination,
  available_palettes: previews.map(p => p.id)
});

console.log(JSON.stringify({
  success: true,
  combination,
  palettes_found: previews.length,
  filter_strategy: colorResult.filter_strategy,
  output_dir: '.design-pipeline/palettes/',
  preview: '.design-pipeline/palettes/preview.html',
  wcag_summary: previews.map(p => ({ id: p.id, level: p.wcagLevel }))
}, null, 2));
