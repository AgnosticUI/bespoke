# Bespoke Design Pipeline Skill

## Metadata
- **Skill ID:** bespoke-design-pipeline
- **Version:** 2.1.0
- **Trigger:** User provides a project description, niche, or request for a "design system" or "design tokens"
- **Working Directory:** All scripts must run from the skill's root directory (the directory containing this file, `scripts/`, and `data/`)

## Core Directive

**STOP. Read this before doing anything.**

Your job is to **run scripts and deliver artifacts**. You are not building a website. You are not writing application code. You are generating a design token system.

1. The user's description is **input data** for the `match-niche` script's `--description` flag. It is NOT a request to build a site, create pages, or write application code.
2. Your first and only priority is to execute the 6-step pipeline below. Do NOT create files, write code, or modify the user's project until `.design-pipeline/tokens/` is fully populated.
3. All output stays inside `.design-pipeline/` — never copy, move, or integrate files into the user's project (`src/`, `public/`, `app/`, etc.) unless the user explicitly asks you to after reviewing the results.

**Success = 7 files in `.design-pipeline/tokens/` + 3 preview HTML files the user can open.**

---

## Phase 1: Generation (This Is the Skill)

All scripts run from the skill's root directory. All output stays in `.design-pipeline/`. Do not touch the user's project files.

### Output Files

The pipeline produces 7 files in `.design-pipeline/tokens/`:

| File | Description |
|------|-------------|
| `layout-blueprint.svg` | Spatial wireframe for LLM-driven UI generation |
| `shadcn-globals.css` | shadcn/ui theme with HSL CSS variables, light + dark mode |
| `design-tokens.css` | Generic CSS custom properties (hex/RGB/HSL), spacing, utilities |
| `daisyui-theme.css` | DaisyUI theme configuration as CSS variables |
| `agnosticui-tokens.css` | AgnosticUI design tokens for framework-agnostic components |
| `design_manifest.json` | Complete design specifications with contrast data |
| `IMPLEMENTATION.md` | Step-by-step integration guide with constraints checklist |

### Auto-Pilot Recipe

Run all 7 steps in sequence. Each step produces JSON output — parse it and feed results into the next step.

#### Step 1: Detect Niche

```bash
npx tsx scripts/match-niche.ts --description "{user_description}"
```

Take the user's original message — their project description — and pass it as the `--description` argument. This is text classification, not a build request.

Output fields: `niche_id`, `application_type`, `confidence`, `reasoning`, `matched_keywords`, `alternative_niches`.

**Decision rule:**
- If `confidence >= 0.60`: proceed automatically using `niche_id` and `application_type`
- If `confidence < 0.60`: pause and ask the user to clarify their project type (this is the **only** acceptable pause point in the entire pipeline)

After this step, look up the `application_type` in `data/application_type.csv`. Find the matching row by the `application_type` column (or scan `keywords` for closest match). Store the row's `visual_style` and `color_palette` fields as design guidance for later steps.

Store: `NICHE` = `niche_id`, `APP_TYPE` = `application_type`

#### Step 2: Generate 3 Layouts

```bash
npx tsx scripts/generate-layouts.ts --niche "{NICHE}" --count 3
```

Output fields: `success`, `niche`, `layouts_found`, `output_dir`, `preview`, `available_layouts`.

The script writes layout data to `.design-pipeline/layouts/layouts.json`. Each layout entry has an `id` (e.g., `option-01`) and a `variant` name describing the layout pattern.

**Smart pick:** Read the layout entries from `layouts.json`. Match each layout's `variant` name against the `visual_style` and `dashboard_layout` keywords from the application_type row. Recommend the layout whose variant best aligns with the guidance.

Layout numbers for the next step are always `1,2,3` (since `--count 3` produces exactly 3).

#### Step 3: Filter 3 Font Pairings

```bash
npx tsx scripts/filter-typography.ts --niche "{NICHE}" --application-type "{APP_TYPE}" --count 3
```

Output fields: `typography` (array of pairings), `total_matches`, `filter_strategy`.

Each typography entry has: `id`, `pairing_name`, `heading_font`, `body_font`, `category`, `mood` (array), `best_for`, `google_fonts_url`.

**Smart pick:** Trust the script's diversity selection. Note which pairing's `mood` and `best_for` fields best match the niche and `visual_style` guidance. That pairing is your recommendation.

If `filter_strategy` is `expanded` or `fallback`, note this in the presentation — the search was widened beyond niche-specific options.

Typography numbers for the next step are always `1,2,3`.

#### Step 4: Generate 3x3 Combination Grid

```bash
npx tsx scripts/combine-previews.ts --layouts "1,2,3" --typography "1,2,3"
```

Output fields: `success`, `selected_layouts`, `selected_typography`, `combinations_generated` (always 9), `output_dir`, `preview`.

This produces 9 combos (3 layouts x 3 fonts) plus `preview.html`. The combinations are numbered 1-9 in row-major order:

|              | Font 1 | Font 2 | Font 3 |
|--------------|--------|--------|--------|
| **Layout 1** | 1      | 2      | 3      |
| **Layout 2** | 4      | 5      | 6      |
| **Layout 3** | 7      | 8      | 9      |

**Smart pick:** Best combo = intersection of best-match layout row and best-match font column.
Formula: `combo_number = (best_layout_row - 1) * 3 + best_font_col`

The combo ID is `combo-XX` format (zero-padded), e.g., combo 5 = `combo-05`.

#### Step 5: Generate 3 Color Palettes

```bash
npx tsx scripts/generate-palette-combinations.ts --combination "combo-{BEST_COMBO_PADDED}" --niche "{NICHE}" --count 3
```

Output fields: `success`, `combination`, `palettes_found`, `filter_strategy`, `output_dir`, `preview`, `wcag_summary` (array with `id` and `level` per palette).

**Important:** This script automatically sets `state.selected_combination` in the pipeline state, which Step 6 needs.

Palette IDs are `palette-preview-01`, `palette-preview-02`, etc. Full palette data is in `.design-pipeline/palettes/palettes.json`.

**Smart pick:** Sort palettes by WCAG level (AAA > AA > A). Among same-level palettes, prefer the one whose color notes best match the `color_palette` guidance from the application_type row.

Store: `BEST_PALETTE` = the chosen palette ID (e.g., `palette-preview-01`)

#### Step 6: Generate Design Tokens

```bash
npx tsx scripts/generate-tokens.ts --frameworks shadcn,generic,daisyui,agnosticui --palette "{BEST_PALETTE}"
```

This script reads `selected_combination` from pipeline state (set by Step 5). The `--palette` flag specifies which palette to use. It produces all 7 output files in `.design-pipeline/tokens/`.

No JSON output — the script writes files directly and logs progress to stderr/stdout.

#### Step 7: Validate Artifacts

Before presenting results, verify all expected files exist:

```bash
ls .design-pipeline/tokens/
ls .design-pipeline/layouts/preview.html .design-pipeline/combinations/preview.html .design-pipeline/palettes/preview.html
```

**Expected in `.design-pipeline/tokens/`:** `layout-blueprint.svg`, `shadcn-globals.css`, `design-tokens.css`, `daisyui-theme.css`, `agnosticui-tokens.css`, `design_manifest.json`, `IMPLEMENTATION.md`

**Expected previews:** 3 `preview.html` files (layouts, combinations, palettes)

If any token files are missing, do not present results — report which step failed and offer to re-run it. If preview files are missing, note which previews are unavailable but still present the token results.

**Preview access:** After validation, provide the user with `open` commands for each preview HTML using the **absolute paths** from the script JSON output (the `preview` field). Example:
```bash
open /absolute/path/to/.design-pipeline/layouts/preview.html
open /absolute/path/to/.design-pipeline/combinations/preview.html
open /absolute/path/to/.design-pipeline/palettes/preview.html
```
Always use the exact `preview` path from the script output — never hardcode a relative path.

---

## Artifact Delivery

After completing all 7 steps, present the generated design system to the user. This is a **delivery report** — you are handing over artifacts, not proposing a project plan.

### Niche & Design Direction

> **Detected niche:** {niche_id} ({confidence}%)
> **Application type:** {application_type}
> **Design philosophy:** {1-sentence summary from application_type.csv `visual_style`}

### Generated Options

**3 Layouts** — preview in browser:
```
open {layouts_preview_path}
```
(Use the absolute `preview` path from Step 2 output)
- For each: layout number, variant name, why it fits (or doesn't) the niche
- Mark your recommended pick

**3 Font Pairings** — applied to layouts in the combination preview
- For each: pairing name, heading/body fonts, category, mood
- Mark your recommended pick

**3x3 Combination Grid** — preview in browser:
```
open {combinations_preview_path}
```
(Use the absolute `preview` path from Step 4 output)

|              | {font_1} | {font_2} | {font_3} |
|--------------|----------|----------|----------|
| **{layout_1}** | 1     | 2        | 3        |
| **{layout_2}** | 4     | 5        | 6        |
| **{layout_3}** | 7     | 8        | 9        |

Best combo marked with a star.

**3 Color Palettes** — preview in browser:
```
open {palettes_preview_path}
```
(Use the absolute `preview` path from Step 5 output)
- For each: WCAG level, key colors (primary/CTA/background), palette notes
- Mark your selected palette and why

### Final Selections

| Aspect | Selection |
|--------|-----------|
| Layout | {variant name} |
| Heading Font | {heading_font} |
| Body Font | {body_font} |
| Color Palette | {palette notes} |
| Accessibility | {WCAG level} |

**Google Fonts import:**
```html
<link rel="stylesheet" href="{google_fonts_url}" />
```

**All 7 generated files are in `.design-pipeline/tokens/`**

### What's Next

> Your design system is ready for review. Open the preview links above to inspect layouts, combinations, and palettes in your browser.
>
> **To refine:** "change layout to 2", "change fonts", "change colors", "start over"
> **To integrate:** "apply this to my project" — I'll copy the right files into your codebase

---

## Phase 2: Integration (Only on Explicit Request)

**Do NOT enter this phase unless the user explicitly asks** with phrases like "apply this", "integrate", "copy to my project", or "use these tokens".

Copy the relevant files from `.design-pipeline/tokens/` into the user's project:

| Framework | Files to Copy | Where |
|-----------|--------------|-------|
| Next.js + shadcn/ui | `shadcn-globals.css`, `layout-blueprint.svg` | `src/app/globals.css`, `public/` |
| Tailwind + DaisyUI | `daisyui-theme.css`, `layout-blueprint.svg` | `src/styles/`, `public/` |
| AgnosticUI | `agnosticui-tokens.css`, `layout-blueprint.svg` | `src/styles/`, `public/` |
| Vanilla CSS | `design-tokens.css`, `layout-blueprint.svg` | `src/styles/`, `public/` |

Always copy `design_manifest.json` — it's the complete design spec.

### Using Artifacts with LLMs

Feed these 3 artifacts into any LLM prompt for UI code generation:

1. **`layout-blueprint.svg`** — spatial wireframe showing component placement, hierarchy, and density
2. **CSS token file** (shadcn/generic/daisyui/agnosticui) — all colors, fonts, spacing as CSS variables
3. **`design_manifest.json`** — complete design specs: colors (light + dark), fonts, contrast ratios, spacing, radius

### Example Prompt

```
Build a [COMPONENT_NAME] component using the attached design system.

Spatial layout: Follow the wireframe in layout-blueprint.svg for component
placement and hierarchy.

Design tokens: Use CSS variables from [shadcn-globals.css | design-tokens.css].

Specifications from design_manifest.json:
- Heading font: {fonts.heading} / Body font: {fonts.body}
- Primary: {colors.base.primary} / CTA: {colors.base.cta}
- Background: {colors.base.background}
- Border radius: {radius.md}px
- Spacing scale: xs={spacing.xs}px, sm={spacing.sm}px, md={spacing.md}px,
  lg={spacing.lg}px

Requirements:
- Support light and dark mode using the CSS variables
- Meet WCAG {contrast level} contrast requirements
- Use semantic HTML and accessible patterns
- Follow the component density shown in the wireframe
```

---

## Refinement Handling

When the user requests changes after the initial run:

| User says | Action |
|-----------|--------|
| "change layout" or "use layout 2" | Re-run from Step 4 with the new layout selection |
| "change fonts" | Re-run from Step 3 with `--count 5` for more options |
| "change colors" or "more palettes" | Re-run Step 5 with `--count 5` for more options |
| "use palette 2" | Re-run Step 6 with `--palette palette-preview-02` |
| "start over" | Re-run from Step 1 with the new/updated description |

When re-running from a middle step, all subsequent steps must also re-run to propagate the change.

---

## Error Handling

| Exit Code | Meaning | Recovery |
|-----------|---------|----------|
| 0 | Success | Continue to next step |
| 1 | Invalid/missing parameters | Fix parameters and retry once |
| 2 | Missing files/data (generate-layouts only) | Check `layouts/{niche}/` directory exists |

If a script fails, show the error JSON to the user and offer to run the command manually:
```bash
cd {skill_root_directory} && {script_command}
```

If `filter_strategy` is `expanded` or `fallback`, note that the search was widened beyond niche-specific options to provide enough choices.

---

## Smart Defaults Reference

Quick heuristics for edge cases:

- **Layout selection:** Match layout `variant` names against `visual_style` and `dashboard_layout` keywords from the application_type row. Prefer layouts that mention navigation patterns and density levels matching the guidance.
- **Typography:** Trust the script's diversity selection. Use `mood` and `best_for` fields to pick the recommendation. If mood includes terms matching the `ui_style_bias` (e.g., "professional", "playful", "minimal"), that's the best fit.
- **Combination:** Algebraic formula: `combo = (best_layout_row - 1) * 3 + best_font_col`. The best combo is the intersection of the best layout and best font pairing.
- **Palette:** Rank by WCAG level (AAA > AA > A). Break ties using semantic match between palette notes and the `color_palette` guidance. Prefer palettes with restrained primary coverage and high-contrast CTAs.
