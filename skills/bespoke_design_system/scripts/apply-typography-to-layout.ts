/**
 * apply-typography-to-layout.ts
 * Loads selected layouts and filtered typography, generates SVG+HTML previews
 * showing font pairings applied to layouts with real Google Fonts specimens.
 *
 * Usage: npx tsx scripts/apply-typography-to-layout.ts --layouts 1,2,3
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { loadSVG, cloneSVG, injectGoogleFonts, saveSVG, buildGoogleFontsUrl } from './utils/svg-manipulator.js';
import { completeStage } from './utils/state-manager.js';

interface TypographyEntry {
  id: string;
  pairing_name: string;
  heading_font: string;
  body_font: string;
  category: string;
  mood: string[];
  best_for: string;
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

function parseArgs() {
  const args = process.argv.slice(2);
  let layouts = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--layouts' && args[i + 1]) { layouts = args[i + 1]; i++; }
  }

  if (!layouts) {
    console.error(JSON.stringify({ error: true, code: 'INVALID_PARAMS', message: 'Missing --layouts parameter (e.g. --layouts 1,2,3)' }));
    process.exit(1);
  }

  const layoutNums = layouts.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
  if (layoutNums.length !== 3) {
    console.error(JSON.stringify({ error: true, code: 'INVALID_PARAMS', message: 'Exactly 3 layout numbers required' }));
    process.exit(1);
  }

  return { layoutNums };
}

function loadTypography(): TypographyEntry[] {
  const filteredPath = resolve('.design-pipeline/typography/filtered.json');
  if (!existsSync(filteredPath)) {
    console.error(JSON.stringify({ error: true, code: 'MISSING_DATA', message: 'Run filter-typography.ts first. No filtered.json found.' }));
    process.exit(1);
  }
  return JSON.parse(readFileSync(filteredPath, 'utf-8'));
}

function loadLayouts(): LayoutEntry[] {
  const layoutsPath = resolve('.design-pipeline/layouts/layouts.json');
  if (!existsSync(layoutsPath)) {
    console.error(JSON.stringify({ error: true, code: 'MISSING_DATA', message: 'Run generate-layouts.ts first. No layouts.json found.' }));
    process.exit(1);
  }
  return JSON.parse(readFileSync(layoutsPath, 'utf-8'));
}

function generatePreviewHTML(
  selectedLayouts: LayoutEntry[],
  typography: TypographyEntry[],
  comboFiles: { layoutId: string; typoId: string; svgFile: string }[]
): string {
  // Collect all unique Google Fonts URLs for preloading
  const fontLinks = typography.map(t =>
    `<link rel="stylesheet" href="${t.google_fonts_url}">`
  ).join('\n    ');

  const cards = typography.map((typo, tIdx) => {
    const thumbs = selectedLayouts.map(layout => {
      const combo = comboFiles.find(c => c.layoutId === layout.id && c.typoId === typo.id);
      return combo ? `<img src="${combo.svgFile}" alt="${layout.variant}" class="thumb" />` : '';
    }).join('');

    return `
        <div class="card" data-id="${typo.id}" onclick="toggleSelect(this)">
          <div class="badge">${tIdx + 1}</div>
          <div class="specimens">
            <h3 class="specimen-heading" style="font-family: '${typo.heading_font}', sans-serif;">${typo.heading_font}</h3>
            <p class="specimen-body" style="font-family: '${typo.body_font}', sans-serif;">
              The quick brown fox jumps over the lazy dog. 0123456789
            </p>
          </div>
          <div class="card-info">
            <div class="card-title">${typo.pairing_name}</div>
            <div class="card-meta">${typo.category} · ${typo.heading_font} + ${typo.body_font}</div>
          </div>
          <div class="thumbs">${thumbs}</div>
          <div class="check-mark">&#10003;</div>
        </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Typography Selection</title>
  ${fontLinks}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; padding: 2rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .subtitle { color: #475569; margin-bottom: 1.5rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
    .card {
      background: white; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden;
      cursor: pointer; position: relative; transition: border-color 0.15s, box-shadow 0.15s;
    }
    .card:hover { border-color: #94a3b8; }
    .card.selected { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
    .badge {
      position: absolute; top: 8px; left: 8px; background: #0369a1; color: white;
      font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; z-index: 1;
    }
    .specimens { padding: 20px 16px; background: #f1f5f9; }
    .specimen-heading { font-size: 1.75rem; font-weight: 700; margin-bottom: 8px; line-height: 1.2; }
    .specimen-body { font-size: 0.95rem; line-height: 1.6; color: #475569; }
    .card-info { padding: 12px 16px; border-bottom: 1px solid #f1f5f9; }
    .card-title { font-weight: 600; margin-bottom: 2px; }
    .card-meta { font-size: 0.75rem; color: #64748b; }
    .thumbs { display: flex; gap: 6px; padding: 10px 16px; overflow-x: auto; }
    .thumb { height: 60px; width: auto; border-radius: 4px; border: 1px solid #e2e8f0; }
    .check-mark {
      display: none; position: absolute; top: 8px; right: 8px; background: #2563eb;
      color: white; width: 24px; height: 24px; border-radius: 50%; font-size: 14px;
      line-height: 24px; text-align: center;
    }
    .card.selected .check-mark { display: block; }
    .toolbar {
      position: sticky; bottom: 0; background: white; border-top: 1px solid #e2e8f0;
      padding: 1rem 0; display: flex; align-items: center; gap: 1rem; margin-top: 1rem;
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
  <h1>Typography Selection</h1>
  <p class="subtitle">Select exactly <strong>3</strong> typography pairings. Each card shows heading + body font specimens and layout thumbnails.</p>
  <div class="grid">
${cards}
  </div>
  <div class="toolbar">
    <button id="copyBtn" disabled onclick="copySelection()">Copy --typography argument</button>
    <span class="selection-info"><span id="count">0</span>/3 selected</span>
    <span class="copied" id="copiedMsg">Copied!</span>
  </div>
  <script>
    const selected = new Set();
    function toggleSelect(card) {
      const id = card.dataset.id;
      const idx = parseInt(id.replace('typo-', ''));
      if (selected.has(idx)) {
        selected.delete(idx);
        card.classList.remove('selected');
      } else {
        if (selected.size >= 3) return;
        selected.add(idx);
        card.classList.add('selected');
      }
      document.getElementById('count').textContent = selected.size;
      document.getElementById('copyBtn').disabled = selected.size !== 3;
    }
    function copySelection() {
      const sorted = [...selected].sort((a, b) => a - b);
      const text = '--typography ' + sorted.join(',');
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
const { layoutNums } = parseArgs();
const allLayouts = loadLayouts();
const typography = loadTypography();

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

// Prepare output directory
const outputDir = resolve('.design-pipeline/typography-applied');
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

const comboFiles: { layoutId: string; typoId: string; svgFile: string }[] = [];

// Generate SVG combinations (layouts × typography)
for (const layout of selectedLayouts) {
  const layoutSvg = loadSVG(join('.design-pipeline/layouts', layout.svgFile));

  for (const typo of typography) {
    let svg = cloneSVG(layoutSvg);
    svg = injectGoogleFonts(svg, typo.google_fonts_url);

    const filename = `${layout.id}_${typo.id}.svg`;
    saveSVG(svg, join(outputDir, filename));

    comboFiles.push({
      layoutId: layout.id,
      typoId: typo.id,
      svgFile: filename
    });
  }
}

// Generate preview HTML
const html = generatePreviewHTML(selectedLayouts, typography, comboFiles);
writeFileSync(join(outputDir, 'preview.html'), html);

// Save metadata
writeFileSync(join(outputDir, 'combinations.json'), JSON.stringify(comboFiles, null, 2));

// Update pipeline state — complete wireframe_selection, advance to typography_selection
completeStage('wireframe_selection', 'typography_selection', {
  selected_layouts: selectedLayouts.map(l => l.id)
});

console.log(JSON.stringify({
  success: true,
  selected_layouts: selectedLayouts.map(l => l.id),
  typography_count: typography.length,
  combinations_generated: comboFiles.length,
  output_dir: '.design-pipeline/typography-applied/',
  preview: '.design-pipeline/typography-applied/preview.html'
}, null, 2));
