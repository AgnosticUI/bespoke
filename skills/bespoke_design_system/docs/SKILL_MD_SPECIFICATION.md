# SKILL.md Orchestration Specification

**Version:** 1.0
**Document Type:** Implementation Specification
**Last Updated:** February 2026

---

## Table of Contents

1. [Overview](#overview)
2. [SKILL.md Structure](#skillmd-structure)
3. [Conversation Flow Templates](#conversation-flow-templates)
4. [Script Invocation Syntax](#script-invocation-syntax)
5. [State Transition Logic](#state-transition-logic)
6. [Error Handling Decision Trees](#error-handling-decision-trees)
7. [User Interaction Patterns](#user-interaction-patterns)
8. [Example Conversation Transcripts](#example-conversation-transcripts)

---

## Overview

The SKILL.md file serves as the master orchestration document that instructs the LLM how to guide users through the Bespoke Design Pipeline. It defines:

- **What to say** at each stage (conversation templates)
- **When to call scripts** (trigger conditions)
- **How to call scripts** (invocation syntax)
- **How to handle responses** (parsing and state updates)
- **How to recover from errors** (fallback behaviors)

### Design Principles

1. **LLM as Pure Orchestrator** - The LLM never invents design choices; it only calls scripts, parses JSON, and presents options
2. **Deterministic Flow** - Same user inputs always produce the same script calls and state transitions
3. **Graceful Degradation** - Every error has a recovery path or helpful fallback
4. **Minimal Ambiguity** - User inputs are validated and confirmed before state changes

---

## SKILL.md Structure

The SKILL.md file is organized into clearly marked sections that the LLM can reference during execution.

### File Template

```markdown
# Bespoke Design Pipeline Skill

## Metadata
- **Skill ID:** bespoke-design-pipeline
- **Version:** 1.0.0
- **Trigger:** User describes a web application or asks for help with design system

## Quick Reference

### Stage Flow
1. understand-problem → match-niche.ts
2. wireframe-selection → generate-layouts.ts
3. typography-selection → filter-typography.ts + apply-typography-to-layout.ts
4. combination-preview → combine-previews.ts
5. palette-application → generate-palette-combinations.ts
6. token-generation → generate-tokens.ts

### State File
Location: `.design-pipeline/state.json`

### Script Directory
Location: `skills/bespoke_design_system/scripts/`

---

## Stage 1: Understand Problem

[TRIGGER]
User provides a project description OR skill is explicitly invoked.

[SCRIPT CALL]
```bash
npx tsx skills/bespoke_design_system/scripts/match-niche.ts \
  --description "{user_description}"
```

[EXPECTED OUTPUT]
```json
{
  "niche_id": "string",
  "application_type": "string",
  "confidence": 0.0-1.0,
  "reasoning": "string",
  "alternative_niches": [{ "niche_id": "string", "confidence": 0.0-1.0 }]
}
```

[RESPONSE TEMPLATE - HIGH CONFIDENCE (≥0.85)]
I've analyzed your requirements:

**Niche:** {niche_name} ({niche_id})
**Application Type:** {application_type}
**Confidence:** {confidence * 100}%

{reasoning}

This means I'll use {niche_id}-specific layouts optimized for {application_type} interfaces.

Let me generate layout options for you...

[RESPONSE TEMPLATE - MEDIUM CONFIDENCE (0.60-0.84)]
I'm detecting elements of **{primary_niche}** ({confidence * 100}% confidence), but this could also fit **{alternative_niche}** ({alt_confidence * 100}%).

This could be approached as:
1. **{primary_niche}** - {primary_niche_description}
2. **{alternative_niche}** - {alternative_niche_description}

Which approach better matches your vision?

[RESPONSE TEMPLATE - LOW CONFIDENCE (<0.60)]
I need more context to provide the best design system.

What type of application are you building?

**Common categories:**
- **Dashboard/Admin** - Data-heavy interfaces with metrics and analytics
- **Marketing/Landing** - Conversion-focused pages with hero sections
- **SaaS Product** - Application interfaces with persistent navigation
- **E-commerce** - Product browsing and purchasing flows
- **Medical/Healthcare** - Patient-focused interfaces requiring clarity
- **Fintech/Trading** - Financial interfaces with data density

Please describe the main purpose or select a category.

[STATE UPDATE]
```json
{
  "current_stage": "wireframe_selection",
  "completed_stages": ["understand_problem"],
  "inferred_niche": "{niche_id}",
  "application_type": "{application_type}",
  "niche_confidence": {confidence}
}
```

[VALIDATION]
- niche_id must be one of: dashboard, marketing, saas, blog, ecommerce, portfolio, medical, fintech, industrial
- application_type must be valid for the niche (reference niche-taxonomy.json)
- confidence must be a number between 0 and 1

---

## Stage 2: Wireframe Selection

[TRIGGER]
Stage 1 complete AND user confirmed niche OR user explicitly requested layout generation.

[PRE-CONDITIONS]
- state.json exists with valid niche_id
- layouts/{niche_id}/ directory contains SVG files

[SCRIPT CALL]
```bash
npx tsx skills/bespoke_design_system/scripts/generate-layouts.ts \
  --niche "{state.inferred_niche}" \
  --count 15
```

[EXPECTED OUTPUT]
```json
{
  "layouts": [
    {
      "id": "dashboard_sidebar-metrics-grid_01",
      "filepath": "layouts/dashboard/dashboard_sidebar-metrics-grid_01.svg",
      "description": "Left sidebar navigation with metrics grid",
      "density": "high",
      "preview_path": ".design-pipeline/layouts/option-01.svg"
    }
  ],
  "preview_html": ".design-pipeline/layouts/preview.html",
  "preview_image": ".design-pipeline/layouts/grid-preview.png",
  "total_available": 15
}
```

[RESPONSE TEMPLATE]
Here are {total_available} layouts designed for **{niche_name}** applications:

[Display grid-preview.png inline OR reference preview_html]

These layouts are optimized for:
{niche_specific_features}

**Selection Instructions:**
Enter the numbers of **3 layouts** that best match your vision (e.g., "2, 7, 11")

For detailed inspection, open: `.design-pipeline/layouts/preview.html`

[USER INPUT PARSING]
- Extract numbers using regex: /\d+/g
- Validate: exactly 3 numbers, each between 1 and {total_available}
- If invalid, prompt: "Please select exactly 3 layouts (e.g., 2, 7, 11)"

[CONFIRMATION TEMPLATE]
You selected:
- Layout {n1}: {description_1}
- Layout {n2}: {description_2}
- Layout {n3}: {description_3}

Correct? (yes/no/change)

[STATE UPDATE]
```json
{
  "current_stage": "typography_selection",
  "completed_stages": ["understand_problem", "wireframe_selection"],
  "selected_layouts": ["{layout_id_1}", "{layout_id_2}", "{layout_id_3}"]
}
```

---

## Stage 3: Typography Selection

[TRIGGER]
Stage 2 complete AND user confirmed layout selections.

[SCRIPT CALLS]
```bash
# Step 1: Get typography options
npx tsx skills/bespoke_design_system/scripts/filter-typography.ts \
  --niche "{state.inferred_niche}" \
  --application-type "{state.application_type}" \
  --count 15

# Step 2: Generate previews with selected layouts
npx tsx skills/bespoke_design_system/scripts/apply-typography-to-layout.ts \
  --layouts "{state.selected_layouts}" \
  --typography-data "{typography_json_output}"
```

[EXPECTED OUTPUT - filter-typography.ts]
```json
{
  "typography": [
    {
      "id": "typo-003",
      "pairing_name": "Modern Professional",
      "heading_font": "Inter",
      "body_font": "Roboto",
      "category": "Sans + Sans",
      "mood": ["clean", "modern", "professional"],
      "google_fonts_url": "https://fonts.google.com/specimen/Inter",
      "css_import": "@import url('...');",
      "tailwind_config": "fontFamily: { heading: [...], body: [...] }"
    }
  ],
  "total_matches": 15,
  "filter_strategy": "exact_match" | "niche_only" | "fallback"
}
```

[EXPECTED OUTPUT - apply-typography-to-layout.ts]
```json
{
  "previews": [
    {
      "layout_id": "option-02",
      "typography_id": "typo-003",
      "preview_path": ".design-pipeline/typography/preview-L02-T03.svg"
    }
  ],
  "preview_html": ".design-pipeline/typography/preview.html",
  "preview_image": ".design-pipeline/typography/grid-preview.png"
}
```

[RESPONSE TEMPLATE]
Here are 15 font pairings appropriate for **{niche_name}/{application_type}** applications:

[Display typography grid-preview.png inline]

{niche_specific_typography_notes}

**Selection Instructions:**
Enter the numbers of **3 font pairings** that work best (e.g., "4, 9, 13")

[USER INPUT PARSING]
Same as Stage 2: extract 3 valid numbers.

[STATE UPDATE]
```json
{
  "current_stage": "combination_preview",
  "completed_stages": ["understand_problem", "wireframe_selection", "typography_selection"],
  "selected_typography": ["{typo_id_1}", "{typo_id_2}", "{typo_id_3}"]
}
```

---

## Stage 4: Combination Preview

[TRIGGER]
Stage 3 complete AND user confirmed typography selections.

[SCRIPT CALL]
```bash
npx tsx skills/bespoke_design_system/scripts/combine-previews.ts \
  --layouts "{state.selected_layouts}" \
  --typography "{state.selected_typography}"
```

[EXPECTED OUTPUT]
```json
{
  "combinations": [
    {
      "id": "combo-01",
      "layout_id": "option-02",
      "typography_id": "typo-04",
      "preview_path": ".design-pipeline/combinations/combo-01.svg"
    }
  ],
  "grid_layout": {
    "rows": 3,
    "cols": 3,
    "row_labels": ["Layout 2", "Layout 7", "Layout 11"],
    "col_labels": ["Font 4", "Font 9", "Font 13"]
  },
  "preview_html": ".design-pipeline/combinations/preview.html",
  "preview_image": ".design-pipeline/combinations/grid-preview.png"
}
```

[RESPONSE TEMPLATE]
I've generated all 9 combinations of your selections:

[Display combinations grid-preview.png inline]

**Grid Layout:**
|           | {font_1} | {font_2} | {font_3} |
|-----------|----------|----------|----------|
| {layout_1}| Combo 1  | Combo 2  | Combo 3  |
| {layout_2}| Combo 4  | Combo 5  | Combo 6  |
| {layout_3}| Combo 7  | Combo 8  | Combo 9  |

**Selection Instructions:**
Choose the **single combination** (1-9) that best represents your vision.

[USER INPUT PARSING]
- Extract single number: /\d+/
- Validate: between 1 and 9
- If invalid: "Please select one combination (1-9)"

[STATE UPDATE]
```json
{
  "current_stage": "palette_application",
  "completed_stages": ["understand_problem", "wireframe_selection", "typography_selection", "combination_preview"],
  "selected_combination": "{combo_id}",
  "final_layout": "{layout_id}",
  "final_typography": "{typography_id}"
}
```

---

## Stage 5: Palette Application

[TRIGGER]
Stage 4 complete AND user selected single combination.

[SCRIPT CALL]
```bash
npx tsx skills/bespoke_design_system/scripts/generate-palette-combinations.ts \
  --combination "{state.selected_combination}" \
  --niche "{state.inferred_niche}" \
  --application-type "{state.application_type}"
```

[EXPECTED OUTPUT]
```json
{
  "palettes": [
    {
      "id": "palette-01",
      "name": "Professional Blue",
      "colors": {
        "primary": "#0369A1",
        "secondary": "#0EA5E9",
        "cta": "#F97316",
        "background": "#F8FAFC",
        "text": "#0F172A",
        "border": "#E2E8F0"
      },
      "contrast_ratios": {
        "text_on_background": "16.2:1",
        "cta_on_background": "4.8:1"
      },
      "wcag_compliance": "AAA",
      "preview_path": ".design-pipeline/palettes/variation-01.svg"
    }
  ],
  "preview_html": ".design-pipeline/palettes/preview.html",
  "preview_image": ".design-pipeline/palettes/grid-preview.png"
}
```

[RESPONSE TEMPLATE]
Here are 5 color palettes for your **{niche_name}** design:

[Display palettes grid-preview.png inline]

{palette_descriptions_with_rationale}

**Accessibility Notes:**
{contrast_compliance_summary}

**Selection Instructions:**
Choose the palette (1-5) that best matches your brand.

[USER INPUT PARSING]
- Extract single number: /\d+/
- Validate: between 1 and 5

[STATE UPDATE]
```json
{
  "current_stage": "token_generation",
  "completed_stages": ["understand_problem", "wireframe_selection", "typography_selection", "combination_preview", "palette_application"],
  "selected_palette": "{palette_id}",
  "final_combination": {
    "layout": "{layout_id}",
    "typography": "{typography_id}",
    "palette": "{palette_id}"
  }
}
```

---

## Stage 6: Token Generation

[TRIGGER]
Stage 5 complete AND user selected palette.

[SCRIPT CALL]
```bash
npx tsx skills/bespoke_design_system/scripts/generate-tokens.ts \
  --layout "{state.final_combination.layout}" \
  --typography "{state.final_combination.typography}" \
  --palette "{state.final_combination.palette}" \
  --frameworks "shadcn,daisyui,aceternity,magicui,nextui,generic"
```

[EXPECTED OUTPUT]
```json
{
  "tokens": {
    "generic_css": ".design-pipeline/tokens/design-tokens.css",
    "shadcn_css": ".design-pipeline/tokens/shadcn-tokens.css",
    "shadcn_config": ".design-pipeline/tokens/shadcn.tailwind.config.js",
    "daisyui_css": ".design-pipeline/tokens/daisyui-tokens.css",
    "daisyui_config": ".design-pipeline/tokens/daisyui.tailwind.config.js",
    "aceternity_config": ".design-pipeline/tokens/aceternity.tailwind.config.js",
    "magicui_config": ".design-pipeline/tokens/magicui.tailwind.config.js",
    "nextui_config": ".design-pipeline/tokens/nextui.tailwind.config.js"
  },
  "manifest": ".design-pipeline/design_manifest.json",
  "implementation_guide": ".design-pipeline/IMPLEMENTATION.md"
}
```

[RESPONSE TEMPLATE]
✅ **Your {application_type} design system is ready!**

**Design Summary:**
- **Layout:** {layout_description}
- **Typography:** {heading_font} + {body_font}
- **Colors:** {palette_name} palette
- **Accessibility:** {wcag_compliance} compliant

**Generated Files:**

📁 `.design-pipeline/tokens/`
  ├── `design-tokens.css` — Generic CSS variables
  ├── `shadcn-tokens.css` — shadcn/ui theme
  ├── `shadcn.tailwind.config.js` — Tailwind + shadcn
  ├── `daisyui-tokens.css` — DaisyUI theme
  ├── `daisyui.tailwind.config.js` — Tailwind + DaisyUI
  ├── `aceternity.tailwind.config.js` — Aceternity UI
  ├── `magicui.tailwind.config.js` — Magic UI
  └── `nextui.tailwind.config.js` — NextUI

📄 `design_manifest.json` — Complete design specifications
📄 `IMPLEMENTATION.md` — Step-by-step integration guide

**Next Steps:**
1. Choose your preferred framework
2. Copy the corresponding token files to your project
3. Import the Google Fonts: `{heading_font}` + `{body_font}`
4. Follow IMPLEMENTATION.md for framework-specific setup

Need to adjust anything? I can regenerate any stage.

[FINAL STATE]
```json
{
  "current_stage": "complete",
  "completed_stages": ["understand_problem", "wireframe_selection", "typography_selection", "combination_preview", "palette_application", "token_generation"],
  "pipeline_complete": true
}
```

---

## Navigation Commands

[GO BACK HANDLING]

User says: "go back", "previous", "undo", "restart stage {n}", "change my {layouts|fonts|colors}"

[PARSING RULES]
1. "go back" / "previous" → Move to previous stage
2. "restart" → Reset to Stage 1
3. "change layouts" → Return to Stage 2
4. "change fonts" / "change typography" → Return to Stage 3
5. "change combination" → Return to Stage 4
6. "change colors" / "change palette" → Return to Stage 5

[GO BACK RESPONSE TEMPLATE]
No problem! Let's go back to **{stage_name}**.

{If stage is earlier than current:}
Your previous selections for later stages will be preserved but can be updated.

{Invoke appropriate stage}

[STATE UPDATE FOR GO BACK]
```json
{
  "current_stage": "{target_stage}",
  "completed_stages": {filter to remove stages after target}
}
```

---

## Error Handling Templates

[SCRIPT ERROR]

When script returns non-zero exit code or invalid JSON:

**Response:**
I encountered an issue generating {stage_artifact}. Let me try an alternative approach.

{If retry available:}
Attempting with fallback parameters...

{If retry fails:}
I'm unable to complete this step automatically. Here's what you can do:
1. Check that the required files exist in `{relevant_directory}`
2. Verify the CSV data is properly formatted
3. Try running the script manually: `{script_command}`

Would you like me to help troubleshoot?

[INSUFFICIENT DATA]

When filter returns fewer results than needed:

**Response:**
I found only {count} {items} matching your criteria (needed {required}).

{If fallback available:}
I'm expanding the search to include more general {niche_name} options...

{If still insufficient:}
Available options for {niche_name}:
{list available items}

Would you like to proceed with these options, or should we try a different niche?

[INVALID USER INPUT]

**Response Template:**
I didn't understand that selection. {specific_guidance}

Examples of valid input:
- {example_1}
- {example_2}

Please try again.
```

---

## Conversation Flow Templates

### Stage-Specific Niche Notes

The LLM should include domain-specific context when presenting options. Below are templates for each niche.

#### Dashboard Niche Notes

```markdown
**Layout Optimizations:**
- High information density for metrics and KPIs
- Clear visual hierarchy for data prioritization
- Sidebar/topnav patterns for navigation persistence
- Chart and table integration zones

**Typography Notes:**
- Tabular figures for numeric alignment
- High contrast for extended reading sessions
- Monospace options for data precision

**Color Notes:**
- Semantic status colors (success, warning, error)
- Neutral backgrounds to reduce eye strain
- Accent colors for interactive elements
```

#### Medical Niche Notes

```markdown
**Layout Optimizations:**
- Spacious design for reduced cognitive load
- Clear appointment/scheduling interfaces
- HIPAA-compliant information hierarchy
- High contrast for accessibility

**Typography Notes:**
- AAA contrast requirement (7:1 ratio minimum)
- Clinical, trustworthy typefaces
- Tested for dyslexia accessibility
- No decorative or playful fonts

**Color Notes:**
- Calming, professional palettes
- Emergency red meets accessibility standards
- Tested for color vision deficiency
- Green used carefully (not for "go" in medical context)
```

#### Fintech Niche Notes

```markdown
**Layout Optimizations:**
- Maximum data density for trading interfaces
- Multi-panel layouts for live data streams
- Real-time update zones
- Dark mode optimized for extended viewing

**Typography Notes:**
- Monospace/tabular for price precision
- High legibility at small sizes
- Numbers must align in columns
- Fast scanning for time-sensitive decisions

**Color Notes:**
- Semantic green/red for profit/loss
- Dark backgrounds reduce eye strain
- High contrast for critical information
- Neutral tones for supporting content
```

#### E-commerce Niche Notes

```markdown
**Layout Optimizations:**
- Product grid and gallery patterns
- Clear call-to-action placement
- Conversion-optimized checkout flows
- Mobile-first responsive structure

**Typography Notes:**
- Scannable product titles
- Readable body text for descriptions
- Strong hierarchy for pricing
- Trust-building professional fonts

**Color Notes:**
- Strong CTA colors for conversion
- Neutral backgrounds for product focus
- Brand-appropriate accent colors
- Trust indicators (security, guarantees)
```

#### Marketing/Landing Niche Notes

```markdown
**Layout Optimizations:**
- Hero section prominence
- Clear value proposition hierarchy
- CTA button placement optimization
- Social proof integration zones

**Typography Notes:**
- Impactful headline fonts
- Readable body for feature descriptions
- Scannable bullet points
- Mobile-friendly text sizes

**Color Notes:**
- High-contrast CTAs
- Brand personality expression
- Emotional resonance with target audience
- Trust and credibility signals
```

---

## Script Invocation Syntax

### General Pattern

All scripts are invoked via `npx tsx` with JSON-formatted parameters:

```bash
npx tsx skills/bespoke_design_system/scripts/{script-name}.ts \
  --param1 "value1" \
  --param2 "value2"
```

### Parameter Escaping Rules

1. **Strings with spaces**: Always wrap in double quotes
2. **JSON objects**: Escape inner quotes or use single quotes for outer wrapper
3. **Arrays**: JSON format with escaped quotes or pass as comma-separated values

```bash
# String with spaces
--description "A patient portal for telemedicine"

# Array as JSON
--layouts "[\"option-02\", \"option-07\", \"option-11\"]"

# Array as comma-separated (preferred for simplicity)
--layouts "option-02,option-07,option-11"
```

### Script Output Parsing

All scripts output valid JSON to stdout. The LLM should:

1. Capture the full stdout
2. Parse as JSON
3. Validate required fields exist
4. Handle parsing errors gracefully

```javascript
// Pseudocode for LLM parsing
const output = await runScript(command);
try {
  const data = JSON.parse(output);
  if (!data.required_field) throw new Error("Missing required field");
  return data;
} catch (e) {
  return handleScriptError(e, command);
}
```

### Script-Specific Invocations

#### match-niche.ts

```bash
npx tsx skills/bespoke_design_system/scripts/match-niche.ts \
  --description "User's project description here"
```

**Required Parameters:**
- `--description`: User's natural language project description

**Optional Parameters:**
- `--strict`: Boolean, require exact taxonomy match (default: false)
- `--min-confidence`: Number 0-1, minimum confidence threshold (default: 0.5)

#### generate-layouts.ts

```bash
npx tsx skills/bespoke_design_system/scripts/generate-layouts.ts \
  --niche "medical" \
  --count 15
```

**Required Parameters:**
- `--niche`: One of the 9 niche IDs

**Optional Parameters:**
- `--count`: Number of layouts to return (default: 15, max: 20)
- `--density`: Filter by density: "low", "medium", "high"

#### filter-typography.ts

```bash
npx tsx skills/bespoke_design_system/scripts/filter-typography.ts \
  --niche "medical" \
  --application-type "patient-portal" \
  --count 15
```

**Required Parameters:**
- `--niche`: One of the 9 niche IDs

**Optional Parameters:**
- `--application-type`: Specific application type within niche
- `--count`: Number of results (default: 15)
- `--category`: Filter by category: "Sans + Sans", "Serif + Sans", etc.

#### apply-typography-to-layout.ts

```bash
npx tsx skills/bespoke_design_system/scripts/apply-typography-to-layout.ts \
  --layouts "option-02,option-07,option-11" \
  --typography-file ".design-pipeline/typography/filtered.json"
```

**Required Parameters:**
- `--layouts`: Comma-separated layout IDs or JSON array
- `--typography-file`: Path to JSON file with typography data

**Optional Parameters:**
- `--output-dir`: Output directory (default: `.design-pipeline/typography/`)

#### combine-previews.ts

```bash
npx tsx skills/bespoke_design_system/scripts/combine-previews.ts \
  --layouts "option-02,option-07,option-11" \
  --typography "typo-04,typo-09,typo-13"
```

**Required Parameters:**
- `--layouts`: Exactly 3 layout IDs
- `--typography`: Exactly 3 typography IDs

**Optional Parameters:**
- `--output-dir`: Output directory (default: `.design-pipeline/combinations/`)

#### generate-palette-combinations.ts

```bash
npx tsx skills/bespoke_design_system/scripts/generate-palette-combinations.ts \
  --combination "combo-05" \
  --niche "medical" \
  --application-type "patient-portal"
```

**Required Parameters:**
- `--combination`: Selected combination ID
- `--niche`: Niche ID for palette filtering

**Optional Parameters:**
- `--application-type`: For more specific palette filtering
- `--count`: Number of palette variations (default: 5)

#### generate-tokens.ts

```bash
npx tsx skills/bespoke_design_system/scripts/generate-tokens.ts \
  --layout "option-07" \
  --typography "typo-09" \
  --palette "palette-02" \
  --frameworks "shadcn,daisyui,generic"
```

**Required Parameters:**
- `--layout`: Final layout ID
- `--typography`: Final typography ID
- `--palette`: Final palette ID

**Optional Parameters:**
- `--frameworks`: Comma-separated list (default: all supported frameworks)
- `--output-dir`: Output directory (default: `.design-pipeline/tokens/`)

---

## State Transition Logic

### State File Location

`.design-pipeline/state.json`

### State Schema

```typescript
interface PipelineState {
  // Meta
  pipeline_version: "1.0";
  timestamp: string;  // ISO 8601

  // Progress
  current_stage:
    | "understand_problem"
    | "wireframe_selection"
    | "typography_selection"
    | "combination_preview"
    | "palette_application"
    | "token_generation"
    | "complete";
  completed_stages: string[];

  // Stage 1 outputs
  inferred_niche: string | null;
  application_type: string | null;
  niche_confidence: number | null;

  // Stage 2 outputs
  available_layouts: string[] | null;
  selected_layouts: string[] | null;  // Exactly 3

  // Stage 3 outputs
  available_typography: string[] | null;
  selected_typography: string[] | null;  // Exactly 3

  // Stage 4 outputs
  combinations: string[] | null;  // Exactly 9
  selected_combination: string | null;  // Exactly 1

  // Stage 5 outputs
  available_palettes: string[] | null;
  selected_palette: string | null;

  // Final outputs
  final_combination: {
    layout: string;
    typography: string;
    palette: string;
  } | null;

  // Generated artifacts
  generated_tokens: {
    [framework: string]: string;  // framework -> file path
  } | null;

  pipeline_complete: boolean;
}
```

### Validation Rules Per Stage

#### Before Stage 1 (understand_problem)
- No prerequisites
- State file may not exist (create fresh)

#### Before Stage 2 (wireframe_selection)
- `inferred_niche` must be set and valid
- `completed_stages` must include "understand_problem"
- `layouts/{niche_id}/` directory must contain SVG files

#### Before Stage 3 (typography_selection)
- `selected_layouts` must have exactly 3 items
- `completed_stages` must include "wireframe_selection"
- All layout IDs must exist in `available_layouts`

#### Before Stage 4 (combination_preview)
- `selected_typography` must have exactly 3 items
- `completed_stages` must include "typography_selection"
- All typography IDs must exist in `available_typography`

#### Before Stage 5 (palette_application)
- `selected_combination` must be set
- `completed_stages` must include "combination_preview"
- Combination ID must be valid (1-9 or combo-XX format)

#### Before Stage 6 (token_generation)
- `selected_palette` must be set
- `completed_stages` must include "palette_application"
- `final_combination` must be fully populated

### State Update Protocol

1. **Read current state** (or create default if missing)
2. **Validate prerequisites** for target stage
3. **Execute stage scripts**
4. **Update state atomically**:
   - Add stage to `completed_stages`
   - Update `current_stage` to next stage
   - Store stage outputs
   - Update `timestamp`
5. **Write state file**

### Atomic State Updates

To prevent corruption, state updates should be atomic:

```typescript
// Pseudocode
function updateState(updates: Partial<PipelineState>) {
  const currentState = readState();
  const newState = {
    ...currentState,
    ...updates,
    timestamp: new Date().toISOString()
  };

  // Validate new state is consistent
  validateState(newState);

  // Write to temp file first
  writeFile('.design-pipeline/state.json.tmp', JSON.stringify(newState, null, 2));

  // Atomic rename
  renameFile('.design-pipeline/state.json.tmp', '.design-pipeline/state.json');
}
```

---

## Error Handling Decision Trees

### Script Execution Errors

```
Script returns non-zero exit code
├── Exit code 1: Invalid parameters
│   └── Response: "I received invalid parameters. Let me try with corrected values..."
│   └── Action: Fix parameters and retry once
│
├── Exit code 2: Missing files/data
│   └── Response: "Required data files are missing."
│   └── Action: Offer to create/download missing files OR proceed with fallback
│
├── Exit code 3: Insufficient matches
│   └── Response: "Found fewer results than needed."
│   └── Action: Expand search criteria (see Fallback Chain)
│
└── Other exit codes: Unexpected error
    └── Response: "An unexpected error occurred."
    └── Action: Show error details, offer manual intervention steps
```

### Fallback Chain for Insufficient Data

```
filter-typography.ts returns < 15 results
│
├── Step 1: Remove application_type filter
│   └── Re-run with niche_id only
│   └── If ≥ 15: Use these results with note about broader selection
│
├── Step 2: Add adjacent niches
│   └── If niche is "medical", add "saas" (patient portals are often SaaS-like)
│   └── If niche is "fintech", add "dashboard" (trading dashboards)
│   └── Re-run with expanded niches
│
├── Step 3: Use generic fallback
│   └── Filter typography where niche_id is empty or "generic"
│   └── If ≥ 15: Use with warning about non-specialized fonts
│
└── Step 4: Proceed with fewer options
    └── If ≥ 5: Present available options with explanation
    └── If < 5: Error - insufficient design data for this niche
```

### Invalid User Input Handling

```
User input doesn't match expected format
│
├── Missing numbers
│   └── Prompt: "Please enter numbers separated by commas (e.g., 2, 7, 11)"
│
├── Wrong count
│   ├── Too few: "Please select exactly {n} options"
│   └── Too many: "You selected {count} options, but only {n} are needed. Which {n} do you want?"
│
├── Out of range
│   └── Prompt: "Please select numbers between 1 and {max}"
│
├── Ambiguous response
│   ├── "yes" when number expected: "Did you want to confirm your previous selection, or select option 1?"
│   └── Partial match: "Did you mean {closest_match}?"
│
└── Completely unparseable
    └── Prompt: "I didn't understand that. Examples of valid input: {examples}"
```

### State Corruption Recovery

```
State file is invalid or corrupted
│
├── JSON parse error
│   └── Action: Backup corrupt file, create fresh state
│   └── Response: "Your progress file was corrupted. Starting fresh, but your generated files are preserved."
│
├── Missing required fields
│   └── Action: Attempt to infer from generated files in .design-pipeline/
│   └── Response: "Reconstructing progress from generated files..."
│
├── Inconsistent state
│   └── Example: completed_stages includes "typography_selection" but selected_typography is null
│   └── Action: Reset to last consistent state
│   └── Response: "Found inconsistent progress data. Resuming from {last_valid_stage}."
│
└── Version mismatch
    └── Action: Run migration if available, otherwise warn user
    └── Response: "Your design pipeline was created with an older version. {migration_instructions}"
```

---

## User Interaction Patterns

### Presenting 15 Options

When showing 15 options (layouts, typography):

1. **Show visual grid first** (PNG or HTML reference)
2. **Provide quick description list** for accessibility
3. **Highlight recommended options** (if applicable)
4. **Explain selection criteria** relevant to niche

```markdown
[PNG Grid Display]

**Quick Reference:**
1. Sidebar + Metrics Grid - High density, left navigation
2. Topnav + Chart Panels - Horizontal navigation, chart focus
3. Fullwidth Stacked - Maximum content width, vertical flow
...
15. Split Panel View - Two-column comparison layout

**Recommended for {application_type}:** 2, 7, 11
(Based on common patterns for this use case)

Select 3 layouts (e.g., "2, 7, 11"):
```

### Handling "Go Back" Requests

User phrases that trigger go-back:
- "go back"
- "previous"
- "undo"
- "change my layouts/fonts/colors"
- "start over"
- "restart"
- "I want to pick different..."

Response pattern:
```markdown
No problem! Going back to **{stage_name}**.

{If selections exist for this stage:}
Your previous selections were: {list_selections}
Would you like to start fresh or modify these?

{Invoke stage prompt}
```

### Multi-Turn Clarification

When user response needs clarification:

```markdown
Turn 1:
User: "2 and 7 look good, maybe 11"

LLM: I heard 2 and 7. Are you also selecting 11, or would you like to consider other options?
     Your current selection: 2, 7, ?

Turn 2:
User: "yeah 11 is fine"

LLM: Got it. Confirming your selection: 2, 7, 11. Proceeding to typography...
```

### Handling Ambiguous Selections

```markdown
User: "the blue one and the one with the sidebar"

LLM: I want to make sure I understand correctly:

     By "the blue one", do you mean:
     - Layout 3 (has blue accent header)
     - Layout 8 (has blue sidebar)

     By "one with the sidebar", that could be:
     - Layout 3, 5, 8, or 12 (all have sidebars)

     Could you refer to the layouts by number? Looking at the preview:
     [Reference to grid image]
```

### Confirming Before State Changes

Always confirm before updating state:

```markdown
You've selected:
1. Layout 7 - Timeline-based schedule view
2. Layout 2 - Sidebar navigation + appointment calendar
3. Layout 11 - Patient records with tab navigation

Is this correct? (yes / no / change)
```

If user says "change":
```markdown
Which selection would you like to change?
- Type "1" to change Layout 7
- Type "2" to change Layout 2
- Type "3" to change Layout 11
- Type "all" to start fresh
```

---

## Example Conversation Transcripts

### Example 1: Medical Patient Portal (Simple, Clear Case)

This example demonstrates the happy path through all 6 stages with a clear, unambiguous use case.

---

**USER:**
I need a patient portal for a telemedicine app. Patients should be able to view appointments, medical records, and message their doctors.

---

**ASSISTANT:**
*[Internally calls: `npx tsx scripts/match-niche.ts --description "patient portal for telemedicine app with appointments, medical records, and doctor messaging"`]*

*[Script returns: `{"niche_id": "medical", "application_type": "patient-portal", "confidence": 0.96, "reasoning": "Clear healthcare domain with patient-facing portal functionality"}`]*

I've analyzed your requirements:

**Niche:** Medical/Healthcare
**Application Type:** Patient Portal
**Confidence:** 96%

This is clearly a healthcare application focused on patient interactions. I'll use medical-specific layouts optimized for:
- Clear appointment scheduling interfaces
- HIPAA-compliant information hierarchy
- High contrast for accessibility
- Spacious design for reduced cognitive load

Let me generate layout options for you...

*[Internally calls: `npx tsx scripts/generate-layouts.ts --niche "medical" --count 15`]*

*[Script returns 15 layouts with preview files]*

Here are 15 layouts designed for **medical patient portal** applications:

*[Displays grid-preview.png showing 15 numbered layout thumbnails]*

**Quick Reference:**
1. **Sidebar + Dashboard** - Left nav with appointment overview
2. **Topnav + Calendar** - Horizontal nav with schedule focus
3. **Split Panel** - Records on left, details on right
4. **Tab Navigation** - Horizontal tabs for sections
5. **Card Grid** - Visual blocks for different functions
6. **Timeline View** - Chronological appointment history
7. **Schedule Focus** - Calendar-centric with quick actions
8. **Records Browser** - Document-focused with search
9. **Messaging Center** - Communication-first layout
10. **Compact Dashboard** - Dense information display
11. **Mobile-First** - Touch-optimized layout
12. **Accessibility Enhanced** - Extra-large touch targets
13. **Family Portal** - Multiple patient profiles
14. **Telehealth Ready** - Video call integration zones
15. **Lab Results View** - Test results and trends

**Recommended for patient portals:** 2, 7, 14
(Based on common telemedicine patterns)

Which 3 layouts best match your vision? (Enter numbers like "2, 7, 14")

---

**USER:**
2, 7, 11

---

**ASSISTANT:**
*[Internally: Parses "2, 7, 11" → validates 3 numbers in range 1-15 → stores selection]*

You selected:
- **Layout 2:** Topnav + Calendar - Horizontal nav with schedule focus
- **Layout 7:** Schedule Focus - Calendar-centric with quick actions
- **Layout 11:** Mobile-First - Touch-optimized layout

Is this correct? (yes / no / change)

---

**USER:**
yes

---

**ASSISTANT:**
*[Internally updates state.json with selected_layouts: ["option-02", "option-07", "option-11"]]*
*[Internally calls: `npx tsx scripts/filter-typography.ts --niche "medical" --application-type "patient-portal" --count 15`]*
*[Internally calls: `npx tsx scripts/apply-typography-to-layout.ts --layouts "option-02,option-07,option-11" --typography-file ".design-pipeline/typography/filtered.json"`]*

Now let's select typography. Here are 15 font pairings appropriate for **healthcare patient portals**:

*[Displays typography grid-preview.png showing fonts applied to the 3 selected layouts]*

**Healthcare Typography Requirements Met:**
✓ AAA contrast compliance (7:1+ ratio)
✓ Clinical, trustworthy typefaces
✓ Tested for dyslexia accessibility
✓ No decorative or playful fonts

**Quick Reference:**
1. **Source Sans Pro + Merriweather** - Clinical authority with warmth
2. **IBM Plex Sans + IBM Plex Serif** - Modern healthcare precision
3. **Open Sans + Lora** - Friendly accessibility
4. **Nunito + Source Serif** - Soft, approachable care
5. **Roboto + Roboto Slab** - Clean, reliable
6. **Inter + Charter** - Contemporary medical
7. **Work Sans + Libre Baskerville** - Professional warmth
8. **Source Sans Pro + Lora** - Clinical readability
9. **Atkinson Hyperlegible + Georgia** - Maximum accessibility
10. **DM Sans + DM Serif Display** - Modern elegance
11. **Mulish + Crimson Pro** - Gentle authority
12. **Public Sans + Newsreader** - Government-grade clarity
13. **Lexend + Literata** - Dyslexia-friendly
14. **Outfit + Source Serif** - Contemporary care
15. **Albert Sans + Fraunces** - Warm professionalism

**Recommended for telemedicine:** 8, 9, 13
(Optimized for extended screen reading and accessibility)

Which 3 font pairings work best? (Enter numbers like "8, 9, 13")

---

**USER:**
I like 8, and maybe 3 and... actually which one is best for older patients?

---

**ASSISTANT:**
Great question! For older patients, I'd specifically recommend:

**#9 - Atkinson Hyperlegible + Georgia**
- Atkinson Hyperlegible was literally designed by the Braille Institute for visually impaired users
- Larger x-height for better readability
- Distinguished letter shapes (avoids confusion between similar characters like 1, l, I)
- Georgia provides familiar, comfortable body text

**#13 - Lexend + Literata**
- Lexend was designed to improve reading fluency
- Research-backed for faster reading with less cognitive load
- Works well across age groups

For a patient portal serving older patients, **#9 (Atkinson Hyperlegible)** is the gold standard for accessibility.

Would you like to select:
- **8, 9, 13** (includes both accessibility-focused options)
- Or a different combination?

---

**USER:**
8, 9, 13

---

**ASSISTANT:**
You selected:
- **Font 8:** Source Sans Pro + Lora - Clinical readability
- **Font 9:** Atkinson Hyperlegible + Georgia - Maximum accessibility
- **Font 13:** Lexend + Literata - Dyslexia-friendly

Is this correct? (yes / no / change)

---

**USER:**
yes

---

**ASSISTANT:**
*[Internally updates state.json with selected_typography: ["typo-08", "typo-09", "typo-13"]]*
*[Internally calls: `npx tsx scripts/combine-previews.ts --layouts "option-02,option-07,option-11" --typography "typo-08,typo-09,typo-13"`]*

I've generated all 9 combinations of your selections:

*[Displays combinations grid-preview.png showing 3×3 matrix]*

**Combination Grid:**

|                      | Font 8 (Source Sans) | Font 9 (Atkinson) | Font 13 (Lexend) |
|----------------------|----------------------|-------------------|------------------|
| **Layout 2** (Topnav)| Combo 1              | Combo 2           | Combo 3          |
| **Layout 7** (Schedule)| Combo 4            | Combo 5           | Combo 6          |
| **Layout 11** (Mobile)| Combo 7             | Combo 8           | Combo 9          |

Each preview shows the actual Google Fonts rendered in context.

For detailed inspection: `.design-pipeline/combinations/preview.html`

Which single combination best represents your vision? (Enter 1-9)

---

**USER:**
5

---

**ASSISTANT:**
Excellent choice! **Combo 5** is:
- **Layout 7:** Schedule Focus - Calendar-centric with quick actions
- **Font 9:** Atkinson Hyperlegible + Georgia - Maximum accessibility

This combination prioritizes appointment scheduling (the core telemedicine flow) with the most accessible typography option.

*[Internally updates state.json with selected_combination: "combo-05", final_layout: "option-07", final_typography: "typo-09"]*
*[Internally calls: `npx tsx scripts/generate-palette-combinations.ts --combination "combo-05" --niche "medical" --application-type "patient-portal"`]*

Now let's select a color palette. Here are 5 options designed for **healthcare applications**:

*[Displays palettes grid-preview.png showing Combo 5 with 5 different color schemes]*

**1. Clinical Blue** (Professional, Trustworthy)
- Primary: #0369A1 | Secondary: #0EA5E9 | CTA: #10B981
- *Evokes traditional healthcare. Calming and reliable.*

**2. Wellness Green** (Health-Focused, Calming)
- Primary: #059669 | Secondary: #34D399 | CTA: #0284C7
- *Associated with health and vitality. Positive energy.*

**3. Calm Lavender** (Stress Reduction)
- Primary: #7C3AED | Secondary: #A78BFA | CTA: #059669
- *Reduces anxiety. Suitable for mental health integration.*

**4. Warm Amber** (Comfort, Care)
- Primary: #D97706 | Secondary: #FBBF24 | CTA: #0369A1
- *Warm and welcoming. Good for patient comfort.*

**5. Neutral Gray** (Maximum Accessibility)
- Primary: #475569 | Secondary: #94A3B8 | CTA: #0369A1
- *Highest contrast ratios. Zero color distraction.*

**Accessibility Verification:**
✓ All palettes meet WCAG AAA for text (16.2:1+ ratio)
✓ Tested for deuteranopia, protanopia, tritanopia
✓ CTA buttons meet AA standard for interactive elements

Which color scheme resonates with your brand? (Enter 1-5)

---

**USER:**
2 - the green one

---

**ASSISTANT:**
**Wellness Green** it is!

*[Internally updates state.json with selected_palette: "palette-02", final_combination complete]*
*[Internally calls: `npx tsx scripts/generate-tokens.ts --layout "option-07" --typography "typo-09" --palette "palette-02" --frameworks "shadcn,daisyui,aceternity,magicui,nextui,generic"`]*

✅ **Your telemedicine patient portal design system is ready!**

**Design Summary:**
| Aspect | Selection |
|--------|-----------|
| **Layout** | Schedule Focus (Calendar-centric with quick actions) |
| **Heading Font** | Atkinson Hyperlegible |
| **Body Font** | Georgia |
| **Color Palette** | Wellness Green |
| **Accessibility** | WCAG AAA Compliant |

**Generated Files:**

📁 `.design-pipeline/tokens/`
```
├── design-tokens.css           ← Generic CSS variables
├── shadcn-tokens.css           ← shadcn/ui theme
├── shadcn.tailwind.config.js   ← Tailwind + shadcn
├── daisyui-tokens.css          ← DaisyUI theme
├── daisyui.tailwind.config.js  ← Tailwind + DaisyUI
├── aceternity.tailwind.config.js
├── magicui.tailwind.config.js
└── nextui.tailwind.config.js
```

📄 `design_manifest.json` — Complete design specifications
📄 `IMPLEMENTATION.md` — Step-by-step integration guide

**Google Fonts Import:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Georgia&display=swap" rel="stylesheet">
```

**Next Steps:**
1. Choose your preferred framework (I recommend shadcn/ui for React)
2. Copy the corresponding token files to your project
3. Add the Google Fonts import to your HTML head
4. Follow `IMPLEMENTATION.md` for framework-specific setup

**Need adjustments?** I can regenerate any stage:
- "change layouts" → Back to layout selection
- "change fonts" → Back to typography selection
- "change colors" → Back to palette selection
- "start over" → Fresh start

---

### Example 2: Project Management Tool with Analytics (Ambiguous Case)

This example demonstrates handling an ambiguous description that could match multiple niches, and shows the clarification flow.

---

**USER:**
I need a project management tool with analytics

---

**ASSISTANT:**
*[Internally calls: `npx tsx scripts/match-niche.ts --description "project management tool with analytics"`]*

*[Script returns: `{"niche_id": "saas", "application_type": "productivity-tool", "confidence": 0.71, "reasoning": "Project management suggests SaaS, but analytics component suggests dashboard", "alternative_niches": [{"niche_id": "dashboard", "confidence": 0.68}]}`]*

I'm detecting elements of both **SaaS** (71% confidence) and **Dashboard** (68% confidence) in your description.

This could be approached two ways:

**Option A: SaaS Product Focus**
- Emphasizes the project management workflows
- Persistent navigation, task lists, team collaboration
- Analytics as a secondary feature
- Best for: Asana, Monday.com, Notion-style interfaces

**Option B: Dashboard/Analytics Focus**
- Emphasizes the data visualization and metrics
- Chart-heavy, KPI-focused layouts
- Project management as the data source
- Best for: Jira dashboards, executive reporting views

Which approach better matches your vision?
- Type **"A"** for SaaS/Project Management focus
- Type **"B"** for Dashboard/Analytics focus
- Or describe your primary user workflow in more detail

---

**USER:**
it's more like basecamp - so A, but I do need good charts for sprint analytics

---

**ASSISTANT:**
Got it! **SaaS/Project Management** focus with strong analytics capabilities.

*[Internally: Stores niche_id: "saas", application_type: "productivity-tool", notes chart requirement for layout filtering]*

I'll use SaaS layouts that include chart integration zones, giving you the best of both:
- Core project management workflows (tasks, timelines, team views)
- Embedded analytics sections for sprint metrics

Let me generate layout options...

*[Internally calls: `npx tsx scripts/generate-layouts.ts --niche "saas" --count 15`]*

Here are 15 layouts designed for **SaaS productivity tools** with analytics integration:

*[Displays grid-preview.png]*

**Quick Reference:**
1. **Kanban Board** - Card-based task management
2. **List + Timeline** - Linear task view with Gantt
3. **Dashboard Home** - Metrics overview with quick actions
4. **Project Detail** - Deep-dive single project view
5. **Team Overview** - Member workloads and assignments
6. **Sprint Board** - Agile sprint view with burndown
7. **Calendar Planning** - Date-based scheduling
8. **Analytics Panel** - Charts and sprint metrics
9. **Chat + Tasks** - Slack-style with task integration
10. **Document Hub** - Wiki/docs with project context
11. **Resource Planner** - Capacity and allocation
12. **Goals & OKRs** - Objective tracking
13. **Timeline + Charts** - Roadmap with analytics sidebar
14. **Inbox + Actions** - Notification-centric workflow
15. **Compact Multi-Panel** - Dense info for power users

**For Basecamp-style with analytics, consider:** 3, 6, 13
(These have built-in chart zones while maintaining project focus)

Which 3 layouts best match your vision? (Enter numbers like "3, 6, 13")

---

**USER:**
1, 6, 8

---

**ASSISTANT:**
You selected:
- **Layout 1:** Kanban Board - Card-based task management
- **Layout 6:** Sprint Board - Agile sprint view with burndown
- **Layout 8:** Analytics Panel - Charts and sprint metrics

This is a strong combination! You're covering:
- Day-to-day task work (Kanban)
- Sprint planning (Sprint Board)
- Performance tracking (Analytics Panel)

Is this correct? (yes / no / change)

---

**USER:**
actually let me change 1 to 3

---

**ASSISTANT:**
No problem! Updated selection:
- **Layout 3:** Dashboard Home - Metrics overview with quick actions
- **Layout 6:** Sprint Board - Agile sprint view with burndown
- **Layout 8:** Analytics Panel - Charts and sprint metrics

This shifts toward a more metrics-driven experience while keeping the agile workflow. Is this correct? (yes / no / change)

---

**USER:**
yes

---

**ASSISTANT:**
*[Internally updates state.json with selected_layouts: ["option-03", "option-06", "option-08"]]*
*[Internally calls typography scripts...]*

Now let's select typography. Here are 15 font pairings appropriate for **SaaS productivity tools**:

*[Displays typography grid-preview.png]*

**SaaS Typography Characteristics:**
✓ Optimized for long working sessions
✓ Clear hierarchy for complex interfaces
✓ Tabular figures available for metrics
✓ Professional but not boring

**Quick Reference:**
1. **Inter + Inter** - Swiss precision, variable font
2. **SF Pro + SF Pro** - Apple ecosystem feel
3. **Roboto + Roboto** - Google/Android ecosystem
4. **IBM Plex Sans + IBM Plex Mono** - Tech-forward, great for code
5. **Nunito Sans + Nunito** - Friendly productivity
6. **Work Sans + Work Sans** - Geometric clarity
7. **DM Sans + DM Mono** - Modern startup aesthetic
8. **Manrope + Manrope** - Contemporary geometric
9. **Space Grotesk + JetBrains Mono** - Developer-friendly
10. **Plus Jakarta Sans + Fira Code** - Trendy + technical
11. **General Sans + Söhne Mono** - Premium SaaS feel
12. **Satoshi + Satoshi** - Minimal, modern
13. **Geist + Geist Mono** - Vercel/Next.js ecosystem
14. **Outfit + Source Code Pro** - Clean + monospace
15. **Cabinet Grotesk + Berkeley Mono** - Distinctive premium

**Recommended for sprint analytics:** 4, 9, 13
(These have excellent monospace pairings for metrics and charts)

Which 3 font pairings work best? (Enter numbers like "4, 9, 13")

---

**USER:**
4, 7, 13

---

**ASSISTANT:**
You selected:
- **Font 4:** IBM Plex Sans + IBM Plex Mono - Tech-forward, great for code
- **Font 7:** DM Sans + DM Mono - Modern startup aesthetic
- **Font 13:** Geist + Geist Mono - Vercel/Next.js ecosystem

All three have excellent monospace variants for your analytics displays. Is this correct? (yes / no / change)

---

**USER:**
yes

---

**ASSISTANT:**
*[Internally updates state and generates combinations...]*

I've generated all 9 combinations:

*[Displays combinations grid-preview.png]*

**Combination Grid:**

|                        | Font 4 (IBM Plex) | Font 7 (DM Sans) | Font 13 (Geist) |
|------------------------|-------------------|------------------|-----------------|
| **Layout 3** (Dashboard)| Combo 1          | Combo 2          | Combo 3         |
| **Layout 6** (Sprint)   | Combo 4          | Combo 5          | Combo 6         |
| **Layout 8** (Analytics)| Combo 7          | Combo 8          | Combo 9         |

Which single combination best represents your vision? (Enter 1-9)

---

**USER:**
hard to decide between 5 and 6. what's the difference in feel?

---

**ASSISTANT:**
Great question! Here's the vibe difference:

**Combo 5: Sprint Board + DM Sans**
- **Feel:** Modern startup, approachable
- **Vibe:** Think Linear, Notion, Figma
- **Best for:** Teams that value aesthetics, younger user base
- **Personality:** Friendly, contemporary, slightly playful

**Combo 6: Sprint Board + Geist**
- **Feel:** Technical precision, developer-focused
- **Vibe:** Think Vercel, GitHub, Railway
- **Best for:** Engineering teams, technical users
- **Personality:** Clean, efficient, professional

**Quick Decision Framework:**
- If your team says "we're a design-forward company" → **Combo 5**
- If your team says "we're an engineering-first company" → **Combo 6**
- If you're not sure → **Combo 5** (more universally appealing)

Which resonates more with your target users?

---

**USER:**
we're engineering-focused, so 6

---

**ASSISTANT:**
**Combo 6** it is - Sprint Board layout with Geist typography. Perfect for engineering teams.

*[Internally updates state...]*
*[Internally calls palette generation...]*

Now let's select a color palette. Here are 5 options designed for **SaaS productivity tools**:

*[Displays palettes grid-preview.png]*

**1. Professional Blue** (Classic SaaS)
- Primary: #2563EB | Secondary: #60A5FA | CTA: #F97316
- *Trustworthy, established. Think Jira, Confluence.*

**2. Vibrant Indigo** (Modern Startup)
- Primary: #6366F1 | Secondary: #818CF8 | CTA: #10B981
- *Energetic, innovative. Think Linear, Vercel.*

**3. Minimal Slate** (Developer Focus)
- Primary: #334155 | Secondary: #64748B | CTA: #3B82F6
- *Understated, serious. Think GitHub, Terminal.*

**4. Forest Green** (Growth Focus)
- Primary: #059669 | Secondary: #34D399 | CTA: #6366F1
- *Positive, achievement-oriented. Progress and growth.*

**5. Warm Coral** (Engagement Focus)
- Primary: #F43F5E | Secondary: #FB7185 | CTA: #0EA5E9
- *Energetic, attention-grabbing. Urgency and action.*

**For engineering teams, consider:** 2 or 3
(#2 is modern tech, #3 is developer-tool minimal)

Which color scheme fits your brand? (Enter 1-5)

---

**USER:**
3 - we want that github feel

---

**ASSISTANT:**
**Minimal Slate** - the GitHub aesthetic. Excellent choice for an engineering-focused tool.

*[Internally updates state and generates tokens...]*

✅ **Your sprint analytics project management tool design system is ready!**

**Design Summary:**
| Aspect | Selection |
|--------|-----------|
| **Layout** | Sprint Board (Agile sprint view with burndown) |
| **Heading Font** | Geist |
| **Body/Mono Font** | Geist Mono |
| **Color Palette** | Minimal Slate (Developer focus) |
| **Accessibility** | WCAG AA Compliant |

**Generated Files:**

📁 `.design-pipeline/tokens/`
```
├── design-tokens.css
├── shadcn-tokens.css
├── shadcn.tailwind.config.js
├── daisyui-tokens.css
├── daisyui.tailwind.config.js
├── aceternity.tailwind.config.js
├── magicui.tailwind.config.js
└── nextui.tailwind.config.js
```

📄 `design_manifest.json` — Complete specifications
📄 `IMPLEMENTATION.md` — Integration guide

**Google Fonts Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">
```

*Note: Geist may need to be self-hosted if not on Google Fonts. See IMPLEMENTATION.md for fallback options.*

**Tech Stack Recommendation:**
Given your engineering focus and Geist selection, you might enjoy:
- **shadcn/ui** - Uses Geist by default, great DX
- **Tailwind CSS** - Developer-friendly utility classes
- **React** - Component-based architecture

See `IMPLEMENTATION.md` for framework-specific setup.

**Need adjustments?** I can regenerate any stage.

---

## Appendix: Niche-Specific Response Templates

### Template Variables Reference

| Variable | Source | Example |
|----------|--------|---------|
| `{niche_name}` | niche-taxonomy.json | "Medical/Healthcare" |
| `{niche_id}` | match-niche.ts output | "medical" |
| `{application_type}` | match-niche.ts output | "patient-portal" |
| `{confidence}` | match-niche.ts output | 0.96 |
| `{heading_font}` | selected typography | "Atkinson Hyperlegible" |
| `{body_font}` | selected typography | "Georgia" |
| `{palette_name}` | selected palette | "Wellness Green" |
| `{total_available}` | script output count | 15 |
| `{layout_description}` | layouts[].description | "Calendar-centric with quick actions" |

### Niche Display Names

| niche_id | Display Name |
|----------|--------------|
| dashboard | Dashboard/Admin |
| marketing | Marketing/Landing |
| saas | SaaS Product |
| blog | Blog/Content |
| ecommerce | E-commerce |
| portfolio | Portfolio/Creative |
| medical | Medical/Healthcare |
| fintech | Fintech/Trading |
| industrial | Industrial/IoT |

---

## Implementation Checklist

Before deploying the SKILL.md, verify:

- [ ] All 7 scripts exist in `scripts/` directory
- [ ] Scripts accept documented parameters
- [ ] Scripts output valid JSON to stdout
- [ ] CSV files exist with correct column structure
- [ ] Layout SVGs exist for each niche
- [ ] `.design-pipeline/` directory is gitignored
- [ ] state.json schema matches documented structure
- [ ] Error handling paths tested
- [ ] Go-back navigation tested
- [ ] PNG preview generation works (or HTML fallback ready)

---

*End of SKILL.md Orchestration Specification*