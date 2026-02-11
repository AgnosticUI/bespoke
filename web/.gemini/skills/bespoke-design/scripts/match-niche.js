// ../skills/bespoke_design_system/scripts/match-niche.ts
import { readFileSync as readFileSync2 } from "fs";
import { resolve as resolve2 } from "path";

// ../skills/bespoke_design_system/scripts/utils/state-manager.ts
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "fs";
import { dirname, resolve } from "path";
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
  const statePath = resolve(STATE_FILE);
  if (!existsSync(statePath)) {
    return createInitialState();
  }
  try {
    const content = readFileSync(statePath, "utf-8");
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
  const statePath = resolve(STATE_FILE);
  const tempPath = `${statePath}.tmp`;
  state.timestamp = (/* @__PURE__ */ new Date()).toISOString();
  writeFileSync(tempPath, JSON.stringify(state, null, 2), "utf-8");
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
function resetState() {
  const state = createInitialState();
  writeState(state);
  return state;
}

// ../skills/bespoke_design_system/scripts/match-niche.ts
function parseArgs() {
  const args = process.argv.slice(2);
  let description2 = "";
  let strict = false;
  let minConfidence = 0.5;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--description" && args[i + 1]) {
      description2 = args[i + 1];
      i++;
    } else if (args[i] === "--strict") {
      strict = true;
    } else if (args[i] === "--min-confidence" && args[i + 1]) {
      minConfidence = parseFloat(args[i + 1]);
      i++;
    }
  }
  if (!description2) {
    console.error(JSON.stringify({ error: true, code: "INVALID_PARAMS", message: "Missing --description parameter" }));
    process.exit(1);
  }
  return { description: description2, strict, minConfidence };
}
function tokenize(text) {
  const cleaned = text.toLowerCase().replace(/[^\w\s-]/g, " ");
  const words = cleaned.split(/\s+/).filter((w) => w.length > 0);
  const tokens = /* @__PURE__ */ new Set();
  words.forEach((w) => tokens.add(w));
  for (let i = 0; i < words.length - 1; i++) {
    tokens.add(`${words[i]} ${words[i + 1]}`);
  }
  for (let i = 0; i < words.length - 2; i++) {
    tokens.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }
  return tokens;
}
function matchApplicationType(tokens, niche) {
  const appTypeScores = {};
  for (const appType of niche.application_types) {
    let score = 0;
    const appTypeWords = appType.split("-");
    for (const word of appTypeWords) {
      if (tokens.has(word)) score += 2;
    }
    if (tokens.has(appType)) score += 5;
    if (tokens.has(appType.replace(/-/g, " "))) score += 5;
    appTypeScores[appType] = score;
  }
  const sorted = Object.entries(appTypeScores).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[1] > 0 ? sorted[0][0] : niche.application_types[0];
}
function matchNiche(description2) {
  const taxonomyPath = resolve2("data/niche-taxonomy.json");
  const taxonomy = JSON.parse(readFileSync2(taxonomyPath, "utf-8"));
  const tokens = tokenize(description2);
  const descLower = description2.toLowerCase();
  const nicheScores = {};
  const matchedKeywords = {};
  for (const niche of taxonomy.niches) {
    let score = 0;
    const keywords2 = [];
    for (const kw of niche.primary_keywords) {
      if (tokens.has(kw) || descLower.includes(kw)) {
        score += 10;
        keywords2.push(kw);
      }
    }
    for (const kw of niche.secondary_keywords) {
      if (tokens.has(kw) || descLower.includes(kw)) {
        score += 5;
        keywords2.push(kw);
      }
    }
    for (const kw of niche.negative_keywords) {
      if (tokens.has(kw) || descLower.includes(kw)) {
        score -= 8;
      }
    }
    for (const phrase of niche.phrases) {
      if (descLower.includes(phrase)) {
        score += 15;
        keywords2.push(phrase);
      }
    }
    nicheScores[niche.niche_id] = Math.max(0, score);
    matchedKeywords[niche.niche_id] = keywords2;
  }
  const totalScore = Object.values(nicheScores).reduce((a, b) => a + b, 0);
  const confidences = {};
  for (const [id, score] of Object.entries(nicheScores)) {
    confidences[id] = totalScore > 0 ? score / totalScore : 0;
  }
  const sorted = Object.entries(confidences).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0 || sorted[0][1] === 0) {
    return {
      niche_id: "saas",
      application_type: "web-app",
      confidence: 0.3,
      reasoning: "No specific domain detected. Defaulting to general web application.",
      matched_keywords: [],
      alternative_niches: taxonomy.niches.slice(0, 3).map((n) => ({
        niche_id: n.niche_id,
        confidence: 0.1
      }))
    };
  }
  const primaryNicheId = sorted[0][0];
  const primaryConfidence = sorted[0][1];
  const primaryNiche = taxonomy.niches.find((n) => n.niche_id === primaryNicheId);
  const appType = matchApplicationType(tokens, primaryNiche);
  const alternatives = sorted.slice(1, 4).filter(([_, conf]) => conf > 0.1).map(([id, conf]) => {
    const niche = taxonomy.niches.find((n) => n.niche_id === id);
    return {
      niche_id: id,
      confidence: Math.round(conf * 100) / 100,
      application_type: matchApplicationType(tokens, niche)
    };
  });
  const keywords = matchedKeywords[primaryNicheId];
  const reasoning = keywords.length > 0 ? `Matched keywords: ${keywords.slice(0, 5).join(", ")}. ${primaryNiche.description}` : primaryNiche.description;
  return {
    niche_id: primaryNicheId,
    application_type: appType,
    confidence: Math.round(primaryConfidence * 100) / 100,
    reasoning,
    matched_keywords: keywords,
    alternative_niches: alternatives
  };
}
var { description } = parseArgs();
var result = matchNiche(description);
resetState();
completeStage("understand_problem", "wireframe_selection", {
  inferred_niche: result.niche_id,
  application_type: result.application_type,
  niche_confidence: result.confidence
});
console.log(JSON.stringify(result, null, 2));
