// ../skills/bespoke_design_system/scripts/generate-layouts.ts
import { readdirSync, mkdirSync as mkdirSync2, existsSync as existsSync2, writeFileSync as writeFileSync3 } from "fs";
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
function getSVGMetadata(svg) {
  const widthMatch = svg.match(/width=["']([^"']+)["']/);
  const heightMatch = svg.match(/height=["']([^"']+)["']/);
  const viewBoxMatch = svg.match(/viewBox=["']([^"']+)["']/);
  return {
    width: widthMatch?.[1] || "900",
    height: heightMatch?.[1] || "700",
    viewBox: viewBoxMatch?.[1] || "0 0 900 700"
  };
}
function addLabel(svg, label, position = "top-left") {
  const metadata = getSVGMetadata(svg);
  const y = position === "top-left" ? "25" : (parseInt(metadata.height) - 10).toString();
  const labelElement = `
  <g class="preview-label">
    <rect x="10" y="${parseInt(y) - 18}" width="30" height="24" rx="4" fill="#0369A1"/>
    <text x="25" y="${y}" text-anchor="middle" fill="white" font-size="14" font-weight="600" font-family="system-ui">${label}</text>
  </g>`;
  return svg.replace("</svg>", `${labelElement}
</svg>`);
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
function updateState(updates) {
  const currentState = readState();
  const newState = {
    ...currentState,
    ...updates,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  writeState(newState);
  return newState;
}

// ../skills/bespoke_design_system/scripts/generate-layouts.ts
function parseArgs() {
  const args = process.argv.slice(2);
  let niche2 = "";
  let count2 = 15;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--niche" && args[i + 1]) {
      niche2 = args[i + 1];
      i++;
    } else if (args[i] === "--count" && args[i + 1]) {
      count2 = parseInt(args[i + 1]);
      i++;
    }
  }
  if (!niche2) {
    console.error(JSON.stringify({ error: true, code: "INVALID_PARAMS", message: "Missing --niche parameter" }));
    process.exit(1);
  }
  return { niche: niche2, count: count2 };
}
function parseFilename(filename) {
  const match = filename.match(/^([^_]+)_(.+)_(\d+)\.svg$/);
  if (!match) return null;
  return { niche: match[1], variant: match[2], number: match[3] };
}
function generatePreviewHTML(layouts2, niche2) {
  const cards = layouts2.map((layout) => `
        <div class="card" data-id="${layout.id}" onclick="toggleSelect(this)">
          <div class="badge">${layout.id.replace("option-", "")}</div>
          <div class="svg-container">
            <img src="${layout.svgFile}" alt="${layout.variant}" />
          </div>
          <div class="card-info">
            <div class="card-title">${layout.variant.replace(/-/g, " ")}</div>
            <div class="card-meta">${layout.filename}</div>
          </div>
          <div class="check-mark">&#10003;</div>
        </div>`).join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Layout Selection \u2014 ${niche2}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; padding: 2rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .subtitle { color: #475569; margin-bottom: 1.5rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
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
    .svg-container { padding: 12px; background: #f1f5f9; }
    .svg-container img { width: 100%; height: auto; display: block; border-radius: 4px; }
    .card-info { padding: 12px 16px; }
    .card-title { font-weight: 600; text-transform: capitalize; margin-bottom: 2px; }
    .card-meta { font-size: 0.75rem; color: #64748b; }
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
  <h1>Layout Selection</h1>
  <p class="subtitle">Niche: <strong>${niche2}</strong> \u2014 Select exactly <strong>3</strong> layouts, then copy the CLI argument.</p>
  <div class="grid">
${cards}
  </div>
  <div class="toolbar">
    <button id="copyBtn" disabled onclick="copySelection()">Copy --layouts argument</button>
    <span class="selection-info"><span id="count">0</span>/3 selected</span>
    <span class="copied" id="copiedMsg">Copied!</span>
  </div>
  <script>
    const selected = new Set();
    function toggleSelect(card) {
      const id = card.dataset.id;
      const num = parseInt(id.replace('option-', ''));
      if (selected.has(num)) {
        selected.delete(num);
        card.classList.remove('selected');
      } else {
        if (selected.size >= 3) return;
        selected.add(num);
        card.classList.add('selected');
      }
      document.getElementById('count').textContent = selected.size;
      document.getElementById('copyBtn').disabled = selected.size !== 3;
    }
    function copySelection() {
      const sorted = [...selected].sort((a, b) => a - b);
      const text = '--layouts ' + sorted.join(',');
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
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
var { niche, count } = parseArgs();
var layoutsDir = resolve3(`layouts/${niche}`);
if (!existsSync2(layoutsDir)) {
  console.error(JSON.stringify({ error: true, code: "NO_LAYOUTS", message: `No layouts directory found for niche: ${niche}` }));
  process.exit(2);
}
var svgFiles = readdirSync(layoutsDir).filter((f) => f.endsWith(".svg")).sort();
if (svgFiles.length === 0) {
  console.error(JSON.stringify({ error: true, code: "NO_LAYOUTS", message: `No SVG files found in layouts/${niche}/` }));
  process.exit(2);
}
var selected = shuffle(svgFiles).slice(0, count);
var outputDir = resolve3(".design-pipeline/layouts");
if (!existsSync2(outputDir)) mkdirSync2(outputDir, { recursive: true });
var layouts = [];
for (let i = 0; i < selected.length; i++) {
  const filename = selected[i];
  const parsed = parseFilename(filename);
  const num = String(i + 1).padStart(2, "0");
  const outputFile = `option-${num}.svg`;
  let svg = loadSVG(join(layoutsDir, filename));
  svg = addLabel(svg, String(i + 1));
  saveSVG(svg, join(outputDir, outputFile));
  layouts.push({
    id: `option-${num}`,
    filename,
    niche: parsed?.niche || niche,
    variant: parsed?.variant || filename.replace(".svg", ""),
    number: parsed?.number || num,
    svgFile: outputFile
  });
}
var html = generatePreviewHTML(layouts, niche);
writeFileSync3(join(outputDir, "preview.html"), html);
writeFileSync3(join(outputDir, "layouts.json"), JSON.stringify(layouts, null, 2));
updateState({
  available_layouts: layouts.map((l) => l.id)
});
console.log(JSON.stringify({
  success: true,
  niche,
  layouts_found: layouts.length,
  output_dir: ".design-pipeline/layouts/",
  preview: ".design-pipeline/layouts/preview.html",
  available_layouts: layouts.map((l) => l.id)
}, null, 2));
