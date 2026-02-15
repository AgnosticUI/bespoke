// ../skills/bespoke_design_system/scripts/combine-previews.ts
import { readFileSync as readFileSync3, writeFileSync as writeFileSync3, mkdirSync as mkdirSync2, existsSync as existsSync2 } from "fs";
import { resolve as resolve3, join } from "path";

// ../skills/bespoke_design_system/scripts/utils/svg-manipulator.ts
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
function loadSVG(filePath) {
  const absolutePath = resolve(filePath);
  return readFileSync(absolutePath, "utf-8");
}
function saveSVG(content, filePath) {
  const absolutePath = resolve(filePath);
  writeFileSync(absolutePath, content, "utf-8");
}
function injectStyle(svg, css) {
  const styleBlock = `<style><![CDATA[
${css}
]]></style>`;
  const svgOpenMatch = svg.match(/<svg[^>]*>/);
  if (!svgOpenMatch) {
    throw new Error("Invalid SVG: no <svg> tag found");
  }
  const insertPosition = svgOpenMatch.index + svgOpenMatch[0].length;
  return svg.slice(0, insertPosition) + "\n" + styleBlock + svg.slice(insertPosition);
}
function injectGoogleFonts(svg, fontUrl) {
  const importStatement = `@import url('${fontUrl}');`;
  return injectStyle(svg, importStatement);
}
function cloneSVG(svg) {
  return svg.slice();
}

// ../skills/bespoke_design_system/scripts/utils/state-manager.ts
import { readFileSync as readFileSync2, writeFileSync as writeFileSync2, existsSync, mkdirSync, renameSync } from "fs";
import { dirname, resolve as resolve2 } from "path";
var STATE_FILE = ".design-pipeline/state.json";
var PIPELINE_VERSION = "1.0";
function createInitialState() {
  return {
    pipeline_version: PIPELINE_VERSION,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    current_stage: "understand_problem",
    completed_stages: [],
    inferred_niche: null,
    application_type: null,
    niche_confidence: null,
    available_layouts: null,
    selected_layouts: null,
    available_typography: null,
    selected_typography: null,
    combinations: null,
    selected_combination: null,
    available_palettes: null,
    selected_palette: null,
    final_combination: null,
    generated_tokens: null,
    pipeline_complete: false
  };
}
function ensureStateDirectory() {
  const dir = dirname(STATE_FILE);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}
function readState() {
  const statePath = resolve2(STATE_FILE);
  if (!existsSync(statePath)) {
    return createInitialState();
  }
  try {
    const content = readFileSync2(statePath, "utf-8");
    const state = JSON.parse(content);
    if (state.pipeline_version !== PIPELINE_VERSION) {
      console.warn(`State file version mismatch: ${state.pipeline_version} vs ${PIPELINE_VERSION}`);
    }
    return state;
  } catch (error) {
    console.error("Failed to read state file:", error);
    return createInitialState();
  }
}
function writeState(state) {
  ensureStateDirectory();
  const statePath = resolve2(STATE_FILE);
  const tempPath = `${statePath}.tmp`;
  state.timestamp = (/* @__PURE__ */ new Date()).toISOString();
  writeFileSync2(tempPath, JSON.stringify(state, null, 2), "utf-8");
  renameSync(tempPath, statePath);
}
function completeStage(currentStage, nextStage, stageOutputs = {}) {
  const state = readState();
  if (!state.completed_stages.includes(currentStage)) {
    state.completed_stages.push(currentStage);
  }
  const newState = {
    ...state,
    ...stageOutputs,
    current_stage: nextStage,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  writeState(newState);
  return newState;
}

// ../skills/bespoke_design_system/scripts/combine-previews.ts
function parseArgs() {
  const args = process.argv.slice(2);
  let layouts = "";
  let typography = "";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--layouts" && args[i + 1]) {
      layouts = args[i + 1];
      i++;
    } else if (args[i] === "--typography" && args[i + 1]) {
      typography = args[i + 1];
      i++;
    }
  }
  if (!layouts || !typography) {
    console.error(JSON.stringify({ error: true, code: "INVALID_PARAMS", message: "Required: --layouts 1,2,3 --typography 3,6,10" }));
    process.exit(1);
  }
  const layoutNums2 = layouts.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n));
  const typoNums2 = typography.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n));
  if (layoutNums2.length !== 3) {
    console.error(JSON.stringify({ error: true, code: "INVALID_PARAMS", message: "Exactly 3 layout numbers required" }));
    process.exit(1);
  }
  if (typoNums2.length !== 3) {
    console.error(JSON.stringify({ error: true, code: "INVALID_PARAMS", message: "Exactly 3 typography numbers required" }));
    process.exit(1);
  }
  return { layoutNums: layoutNums2, typoNums: typoNums2 };
}
function loadLayouts() {
  const path = resolve3(".design-pipeline/layouts/layouts.json");
  if (!existsSync2(path)) {
    console.error(JSON.stringify({ error: true, code: "MISSING_DATA", message: "Run generate-layouts.ts first." }));
    process.exit(1);
  }
  return JSON.parse(readFileSync3(path, "utf-8"));
}
function loadTypography() {
  const path = resolve3(".design-pipeline/typography/filtered.json");
  if (!existsSync2(path)) {
    console.error(JSON.stringify({ error: true, code: "MISSING_DATA", message: "Run filter-typography.ts first." }));
    process.exit(1);
  }
  return JSON.parse(readFileSync3(path, "utf-8"));
}
function generatePreviewHTML(layouts, typos, combos2) {
  const fontLinks = typos.map(
    (t) => `<link rel="stylesheet" href="${t.google_fonts_url}">`
  ).join("\n    ");
  const rows = layouts.map((layout) => {
    const cells = typos.map((typo) => {
      const combo = combos2.find((c) => c.layoutId === layout.id && c.typoId === typo.id);
      return `
            <td class="cell" data-id="${combo.id}" onclick="selectCombo(this)">
              <div class="cell-inner">
                <object data="${combo.svgFile}" type="image/svg+xml" class="combo-svg">${combo.id}</object>
                <div class="specimens">
                  <h3 class="specimen-heading" style="font-family: '${typo.heading_font}', sans-serif;">${typo.heading_font}</h3>
                  <p class="specimen-body" style="font-family: '${typo.body_font}', sans-serif;">
                    The quick brown fox jumps over the lazy dog. 0123456789
                  </p>
                </div>
                <div class="specimen" style="font-family: '${typo.heading_font}', sans-serif;">
                  <span class="spec-heading">The Quick Brown Fox</span>
                  <span class="spec-body" style="font-family: '${typo.body_font}', sans-serif;">Pack my box with five dozen liquor jugs. Every great design starts with an even better story.</span>
                  <span class="spec-meta">${typo.heading_font} + ${typo.body_font}</span>
                </div>
              </div>
              <div class="check-mark">&#10003;</div>
            </td>`;
    }).join("");
    return `
          <tr>
            <th class="row-label">${layout.variant.replace(/-/g, " ")}</th>
            ${cells}
          </tr>`;
  }).join("");
  const colHeaders = typos.map(
    (t) => `<th class="col-label">${t.pairing_name}<br><small>${t.heading_font} + ${t.body_font}</small></th>`
  ).join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Combination Preview \u2014 3\xD73 Matrix</title>
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
    .specimen { font-size: 0.75rem; padding: 6px 0; }
    .spec-heading { display: block; font-weight: 700; font-size: 1.05rem; line-height: 1.3; margin-bottom: 2px; }
    .spec-body { display: block; color: #475569; font-size: 0.8rem; line-height: 1.4; }
    .spec-meta { display: block; color: #94a3b8; font-size: 0.65rem; margin-top: 4px; font-family: system-ui, sans-serif; }
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
var { layoutNums, typoNums } = parseArgs();
var allLayouts = loadLayouts();
var allTypography = loadTypography();
var selectedLayouts = layoutNums.map((num) => {
  const id = `option-${String(num).padStart(2, "0")}`;
  const layout = allLayouts.find((l) => l.id === id);
  if (!layout) {
    console.error(JSON.stringify({ error: true, code: "INVALID_LAYOUT", message: `Layout ${id} not found` }));
    process.exit(1);
  }
  return layout;
});
var selectedTypography = typoNums.map((num) => {
  const index = num - 1;
  if (index < 0 || index >= allTypography.length) {
    console.error(JSON.stringify({ error: true, code: "INVALID_TYPOGRAPHY", message: `Typography #${num} out of range (1-${allTypography.length})` }));
    process.exit(1);
  }
  return allTypography[index];
});
var outputDir = resolve3(".design-pipeline/combinations");
if (!existsSync2(outputDir)) mkdirSync2(outputDir, { recursive: true });
var combos = [];
var comboIdx = 1;
for (const layout of selectedLayouts) {
  const layoutSvg = loadSVG(join(".design-pipeline/layouts", layout.svgFile));
  for (const typo of selectedTypography) {
    const id = `combo-${String(comboIdx).padStart(2, "0")}`;
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
var html = generatePreviewHTML(selectedLayouts, selectedTypography, combos);
writeFileSync3(join(outputDir, "preview.html"), html);
var metadata = {
  combos,
  row_labels: selectedLayouts.map((l) => l.variant.replace(/-/g, " ")),
  col_labels: selectedTypography.map((t) => `${t.pairing_name} (${t.heading_font} + ${t.body_font})`)
};
writeFileSync3(join(outputDir, "combinations.json"), JSON.stringify(metadata, null, 2));
completeStage("typography_selection", "combination_preview", {
  selected_typography: selectedTypography.map((t) => t.id),
  combinations: combos.map((c) => c.id)
});
console.log(JSON.stringify({
  success: true,
  selected_layouts: selectedLayouts.map((l) => l.id),
  selected_typography: selectedTypography.map((t) => t.id),
  combinations_generated: combos.length,
  output_dir: resolve3(".design-pipeline/combinations/"),
  preview: resolve3(".design-pipeline/combinations/preview.html")
}, null, 2));
