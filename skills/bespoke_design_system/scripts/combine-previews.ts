/**
 * combine-previews.ts
 * Combines 3 selected layouts × 3 selected typography pairings into a 3×3 matrix.
 * Generates 9 combo SVGs and an interactive grid preview for selecting 1 combination.
 *
 * Usage: npx tsx scripts/combine-previews.ts --layouts 1,2,3 --typography 3,6,10
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { loadSVG, cloneSVG, injectGoogleFonts, saveSVG } from './utils/svg-manipulator.js';
import { completeStage } from './utils/state-manager.js';

interface TypographyEntry {
  id: string;
  pairing_name: string;
  heading_font: string;
  body_font: string;
  category: string;
  google_fonts_url: string;
}

interface LayoutEntry {
  id: string;
  filename: string;
  niche: string;
  variant: string;
  number: string;
  svgFile: string;
}

interface ComboEntry {
  id: string;
  layoutId: string;
  typoId: string;
  layoutVariant: string;
  typoPairing: string;
  svgFile: string;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let layouts = '';
  let typography = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--layouts' && args[i + 1]) { layouts = args[i + 1]; i++; }
    else if (args[i] === '--typography' && args[i + 1]) { typography = args[i + 1]; i++; }
  }

  if (!layouts || !typography) {
    console.error(JSON.stringify({ error: true, code: 'INVALID_PARAMS', message: 'Required: --layouts 1,2,3 --typography 3,6,10' }));
    process.exit(1);
  }

  const layoutNums = layouts.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  const typoNums = typography.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));

  if (layoutNums.length !== 3) {
    console.error(JSON.stringify({ error: true, code: 'INVALID_PARAMS', message: 'Exactly 3 layout numbers required' }));
    process.exit(1);
  }
  if (typoNums.length !== 3) {
    console.error(JSON.stringify({ error: true, code: 'INVALID_PARAMS', message: 'Exactly 3 typography numbers required' }));
    process.exit(1);
  }

  return { layoutNums, typoNums };
}

function loadLayouts(): LayoutEntry[] {
  const path = resolve('.design-pipeline/layouts/layouts.json');
  if (!existsSync(path)) {
    console.error(JSON.stringify({ error: true, code: 'MISSING_DATA', message: 'Run generate-layouts.ts first.' }));
    process.exit(1);
  }
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function loadTypography(): TypographyEntry[] {
  const path = resolve('.design-pipeline/typography/filtered.json');
  if (!existsSync(path)) {
    console.error(JSON.stringify({ error: true, code: 'MISSING_DATA', message: 'Run filter-typography.ts first.' }));
    process.exit(1);
  }
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function generatePreviewHTML(
  layouts: LayoutEntry[],
  typos: TypographyEntry[],
  combos: ComboEntry[]
): string {
  const fontLinks = typos.map(t =>
    `<link rel="stylesheet" href="${t.google_fonts_url}">`
  ).join('\n    ');

  // Build 3×3 grid cells
  const rows = layouts.map(layout => {
    const cells = typos.map(typo => {
      const combo = combos.find(c => c.layoutId === layout.id && c.typoId === typo.id)!;
      return `
            <td class="cell" data-id="${combo.id}" onclick="selectCombo(this)">
              <div class="cell-inner">
                <object data="${combo.svgFile}" type="image/svg+xml" class="combo-svg">${combo.id}</object>
                <div class="specimen" style="font-family: '${typo.heading_font}', sans-serif;">
                  <span class="spec-heading">${typo.heading_font}</span>
                  <span class="spec-body" style="font-family: '${typo.body_font}', sans-serif;">${typo.body_font}</span>
                </div>
              </div>
              <div class="check-mark">&#10003;</div>
            </td>`;
    }).join('');
    return `
          <tr>
            <th class="row-label">${layout.variant.replace(/-/g, ' ')}</th>
            ${cells}
          </tr>`;
  }).join('');

  const colHeaders = typos.map(t =>
    `<th class="col-label">${t.pairing_name}<br><small>${t.heading_font} + ${t.body_font}</small></th>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Combination Preview — 3×3 Matrix</title>
  ${fontLinks}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; padding: 2rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .subtitle { color: #475569; margin-bottom: 1.5rem; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 2rem; }
    .col-label { padding: 10px 8px; font-size: 0.8rem; text-align: center; background: #f1f5f9; border: 1px solid #e2e8f0; }
    .col-label small { color: #64748b; font-weight: 400; }
    .row-label {
      padding: 10px 12px; font-size: 0.8rem; text-align: right; text-transform: capitalize;
      background: #f1f5f9; border: 1px solid #e2e8f0; white-space: nowrap; font-weight: 600;
    }
    .cell {
      border: 2px solid #e2e8f0; padding: 8px; cursor: pointer; position: relative;
      transition: border-color 0.15s, box-shadow 0.15s; vertical-align: top;
    }
    .cell:hover { border-color: #94a3b8; }
    .cell.selected { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
    .cell-inner { display: flex; flex-direction: column; gap: 6px; }
    .combo-svg { width: 100%; height: auto; border-radius: 4px; border: 1px solid #f1f5f9; display: block; }
    .specimen { font-size: 0.75rem; padding: 4px 0; }
    .spec-heading { display: block; font-weight: 700; font-size: 0.85rem; }
    .spec-body { display: block; color: #475569; font-size: 0.75rem; }
    .check-mark {
      display: none; position: absolute; top: 6px; right: 6px; background: #2563eb;
      color: white; width: 22px; height: 22px; border-radius: 50%; font-size: 12px;
      line-height: 22px; text-align: center;
    }
    .cell.selected .check-mark { display: block; }
    .corner { background: #f1f5f9; border: 1px solid #e2e8f0; }
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
    .selection-info { color: #475569; font-size: 0.875rem; }
    .copied { color: #16a34a; font-weight: 600; display: none; }
  </style>
</head>
<body>
  <h1>Combination Preview</h1>
  <p class="subtitle">Rows = layouts, Columns = typography pairings. Select exactly <strong>1</strong> combination.</p>
  <table>
    <thead>
      <tr>
        <th class="corner"></th>
        ${colHeaders}
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <div class="toolbar">
    <button id="copyBtn" disabled onclick="copySelection()">Copy --combination argument</button>
    <span class="selection-info" id="selInfo">No selection</span>
    <span class="copied" id="copiedMsg">Copied!</span>
  </div>
  <script>
    let selectedCell = null;
    let selectedId = null;
    function selectCombo(cell) {
      if (selectedCell) selectedCell.classList.remove('selected');
      if (selectedCell === cell) { selectedCell = null; selectedId = null; update(); return; }
      cell.classList.add('selected');
      selectedCell = cell;
      selectedId = cell.dataset.id;
      update();
    }
    function update() {
      document.getElementById('copyBtn').disabled = !selectedId;
      document.getElementById('selInfo').textContent = selectedId ? 'Selected: ' + selectedId : 'No selection';
    }
    function copySelection() {
      const text = '--combination ' + selectedId;
      navigator.clipboard.writeText(text).then(() => {
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
const { layoutNums, typoNums } = parseArgs();
const allLayouts = loadLayouts();
const allTypography = loadTypography();

// Resolve selected layouts
const selectedLayouts = layoutNums.map(num => {
  const id = `option-${String(num).padStart(2, '0')}`;
  const layout = allLayouts.find(l => l.id === id);
  if (!layout) {
    console.error(JSON.stringify({ error: true, code: 'INVALID_LAYOUT', message: `Layout ${id} not found` }));
    process.exit(1);
  }
  return layout;
});

// Resolve selected typography by 1-based display position in filtered list
const selectedTypography = typoNums.map(num => {
  const index = num - 1;
  if (index < 0 || index >= allTypography.length) {
    console.error(JSON.stringify({ error: true, code: 'INVALID_TYPOGRAPHY', message: `Typography #${num} out of range (1-${allTypography.length})` }));
    process.exit(1);
  }
  return allTypography[index];
});

// Prepare output directory
const outputDir = resolve('.design-pipeline/combinations');
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

const combos: ComboEntry[] = [];
let comboIdx = 1;

for (const layout of selectedLayouts) {
  const layoutSvg = loadSVG(join('.design-pipeline/layouts', layout.svgFile));

  for (const typo of selectedTypography) {
    const id = `combo-${String(comboIdx).padStart(2, '0')}`;
    let svg = cloneSVG(layoutSvg);
    svg = injectGoogleFonts(svg, typo.google_fonts_url);

    const filename = `${id}.svg`;
    saveSVG(svg, join(outputDir, filename));

    combos.push({
      id,
      layoutId: layout.id,
      typoId: typo.id,
      layoutVariant: layout.variant,
      typoPairing: typo.pairing_name,
      svgFile: filename
    });
    comboIdx++;
  }
}

// Generate preview HTML
const html = generatePreviewHTML(selectedLayouts, selectedTypography, combos);
writeFileSync(join(outputDir, 'preview.html'), html);

// Save metadata
const metadata = {
  combos,
  row_labels: selectedLayouts.map(l => l.variant.replace(/-/g, ' ')),
  col_labels: selectedTypography.map(t => `${t.pairing_name} (${t.heading_font} + ${t.body_font})`)
};
writeFileSync(join(outputDir, 'combinations.json'), JSON.stringify(metadata, null, 2));

// Update pipeline state — complete typography_selection, advance to combination_preview
completeStage('typography_selection', 'combination_preview', {
  selected_typography: selectedTypography.map(t => t.id),
  combinations: combos.map(c => c.id)
});

console.log(JSON.stringify({
  success: true,
  selected_layouts: selectedLayouts.map(l => l.id),
  selected_typography: selectedTypography.map(t => t.id),
  combinations_generated: combos.length,
  output_dir: '.design-pipeline/combinations/',
  preview: '.design-pipeline/combinations/preview.html'
}, null, 2));
