# Bespoke Design Pipeline Skill

## Metadata
- **Skill ID:** bespoke-design-pipeline
- **Version:** 1.0.0
- **Trigger:** User describes a web application or asks for help with a design system
- **Working Directory:** `skills/bespoke_design_system/` (all scripts run from here)

## What You Get

The pipeline produces 7 files in `.design-pipeline/tokens/`:

| File | Description |
|------|-------------|
| `layout-blueprint.svg` | Spatial wireframe for LLM-driven UI generation (component placement, hierarchy) |
| `shadcn-globals.css` | shadcn/ui theme with HSL CSS variables, light + dark mode |
| `design-tokens.css` | Generic CSS custom properties (hex/RGB/HSL), spacing, and utility classes |
| `daisyui-theme.css` | DaisyUI theme configuration as CSS variables |
| `agnosticui-tokens.css` | AgnosticUI design tokens for framework-agnostic components |
| `design_manifest.json` | Complete design specifications with contrast data |
| `IMPLEMENTATION.md` | Step-by-step integration guide with constraints checklist |

## Quick Reference

### Stage Flow
```
1. understand-problem    -> match-niche.ts
2. wireframe-selection   -> generate-layouts.ts
3. typography-selection   -> filter-typography.ts + apply-typography-to-layout.ts
4. combination-preview   -> combine-previews.ts
5. palette-application   -> generate-palette-combinations.ts
6. token-generation      -> generate-tokens.ts
```

### State File
Location: `.design-pipeline/state.json`

### Script Directory
Location: `scripts/`

### Key Constraint
**The LLM is a pure orchestrator.** Never invent design choices. Only call scripts, parse their JSON output, and present options to the user. All design data comes from curated CSVs and SVG wireframes.

---

## Stage 1: Understand Problem

**TRIGGER:** User provides a project description OR skill is explicitly invoked.

### Script Call
```bash
npx tsx scripts/match-niche.ts --description "{user_description}"
```

**Required:** `--description` (user's natural language description)
**Optional:** `--strict` (boolean), `--min-confidence 0.5`
**Exit codes:** 0 = success, 1 = missing --description

### Expected Output (JSON to stdout)
```json
{
  "niche_id": "medical",
  "application_type": "patient-portal",
  "confidence": 0.96,
  "reasoning": "Clear healthcare domain...",
  "matched_keywords": ["patient", "portal", "telemedicine"],
  "alternative_niches": [{ "niche_id": "saas", "confidence": 0.45 }]
}
```

### Response Templates

**HIGH CONFIDENCE (>= 0.85):**
> I've analyzed your requirements:
>
> **Niche:** {niche_name} ({niche_id})
> **Application Type:** {application_type}
> **Confidence:** {confidence * 100}%
>
> {reasoning}
>
> This means I'll use {niche_id}-specific layouts optimized for {application_type} interfaces.
>
> Let me generate layout options for you...

Then immediately proceed to Stage 2.

**MEDIUM CONFIDENCE (0.60-0.84):**
> I'm detecting elements of **{primary_niche}** ({confidence}%) but this could also fit **{alternative_niche}** ({alt_confidence}%).
>
> 1. **{primary_niche}** - {description}
> 2. **{alternative_niche}** - {description}
>
> Which approach better matches your vision?

Wait for user to confirm before proceeding.

**LOW CONFIDENCE (< 0.60):**
> I need more context to provide the best design system.
>
> **Common categories:**
> - **Dashboard/Admin** - Data-heavy interfaces with metrics
> - **Marketing/Landing** - Conversion-focused pages
> - **SaaS Product** - Application interfaces with navigation
> - **E-commerce** - Product browsing and purchasing
> - **Medical/Healthcare** - Patient-focused interfaces
> - **Fintech/Trading** - Financial data interfaces
> - **Blog/Content** - Reading-focused layouts
> - **Portfolio/Creative** - Visual showcase
> - **Industrial/IoT** - Equipment monitoring
> - **Education/LMS** - Learning and course platforms
> - **Real Estate** - Property listings and agents
> - **Social/Community** - Social networks and forums
> - **Food/Restaurant** - Menus, ordering, reservations
> - **Travel/Booking** - Trip planning and reservations
> - **Non-profit/Government** - Mission-driven organizations
>
> Please describe the main purpose or select a category.

### State Update
The script updates state automatically. Verify state contains:
- `inferred_niche` is set and valid
- `application_type` is set
- `niche_confidence` is set

### Valid Niche IDs
`dashboard`, `marketing`, `saas`, `blog`, `ecommerce`, `portfolio`, `medical`, `fintech`, `industrial`, `education`, `realestate`, `social`, `food`, `travel`, `nonprofit`

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
| education | Education/LMS |
| realestate | Real Estate |
| social | Social/Community |
| food | Food/Restaurant |
| travel | Travel/Booking |
| nonprofit | Non-profit/Government |

---

## Design Reasoning Reference

**After Stage 1 completes**, look up the inferred `application_type` in `data/application_type.csv`. This CSV contains opinionated, research-derived design rules for specific product types.

### How to Match

1. Take the `application_type` value returned by `match-niche.ts`
2. Search the `application_type` column for an exact match
3. If no exact match, scan the `keywords` column for the closest match
4. If no row matches, skip reasoning augmentation — fall back to niche-specific notes in Appendix A

### How to Use the Reasoning Row

Once matched, the row becomes a **persistent context card** that you carry through ALL subsequent stages. It has 6 guidance fields:

| Field | Use At Stages | Purpose |
|-------|---------------|---------|
| `visual_style` | 2, 3, 4 | Overall mood, density, and aesthetic direction |
| `landing_page` | 2 | Marketing/landing page structure and content hierarchy |
| `dashboard_layout` | 2, 4 | App interface structure, navigation, and information hierarchy |
| `color_palette` | 5 | Color psychology, usage rules, and restraint guidelines |
| `essential_ux` | 6 | Critical UX patterns and failure modes to avoid |
| `ui_style_bias` | 2, 3, 4, 5 | Concise visual aesthetic hint — tone, motion, and polish direction |

### Gut Check Rule

At every decision point, ask: **"Does this option align with the reasoning row's guidance?"** If an option contradicts the guidance, flag the tension to the user — don't silently ignore it.

### Stage 1 Integration

When presenting the niche match result to the user, include a brief summary of the design philosophy from the reasoning row:

> **Design approach for {application_type}:** {1-2 sentence summary of visual_style}
>
> This will guide layout, typography, and color decisions throughout the pipeline.

---

## Design Constraints Reference

**After Stage 1 completes**, load the universal design constraints from `data/constraints/`. These CSVs encode non-negotiable implementation rules that apply to ALL product types regardless of niche or application type.

### Constraint Files

| File | Purpose | When to Reference |
|------|---------|-------------------|
| `data/constraints/accessibility.csv` | WCAG 2.2 compliance rules: semantic HTML, focus states, form labels, keyboard operability, screen reader support | Stages 2-6 (all design decisions), especially Stage 6 output |
| `data/constraints/interaction.csv` | Interaction UX rules: keyboard navigation, modal accessibility, drag-and-drop alternatives, focus trapping, skip navigation | Stages 2-4 (layout and interaction evaluation), Stage 6 output |
| `data/constraints/performance.csv` | Core Web Vitals and performance budgets: LCP <=2.5s, FCP <=1.8s, CLS <=0.1, TTI <=5s, image optimization, lazy loading | Stage 6 output (IMPLEMENTATION.md performance section) |

### How to Use Constraints

Unlike the reasoning row (which is product-type-specific and advisory), constraints are **universal and mandatory**. They apply to every output.

1. **During evaluation stages (2-5):** Flag options that would make constraint compliance harder (e.g., animation-heavy layouts conflicting with `prefers-reduced-motion` requirements, or low-contrast color pairings violating WCAG)
2. **At Stage 6 output:** Include a **Constraints Checklist** in IMPLEMENTATION.md summarizing the most critical accessibility, interaction, and performance requirements
3. **Gut check:** If a design choice conflicts with a `blocker` or `High` impact constraint, flag it to the user before proceeding

### Constraint Impact Levels

| Level | Meaning |
|-------|---------|
| `blocker` | Must be resolved — failure breaks accessibility compliance |
| `High` | Should be resolved — significantly impacts user segments |
| `Medium` | Recommended — improves experience for affected users |
| `Low` | Nice-to-have — minor improvement |

---

## Stage 2: Wireframe Selection

**TRIGGER:** Stage 1 complete AND niche confirmed.

**PRE-CONDITIONS:**
- `state.inferred_niche` is set and valid
- `layouts/{niche_id}/` directory contains SVG files

### Script Call
```bash
npx tsx scripts/generate-layouts.ts --niche "{state.inferred_niche}"
```

**Required:** `--niche`
**Optional:** `--count 15`
**Exit codes:** 0 = success, 1 = missing --niche, 2 = no layouts directory or no SVGs

### Expected Output (JSON to stdout)
```json
{
  "success": true,
  "niche": "medical",
  "layouts_found": 8,
  "output_dir": ".design-pipeline/layouts",
  "preview": ".design-pipeline/layouts/preview.html",
  "available_layouts": ["option-01", "option-02", ...]
}
```

### Reasoning-Informed Evaluation

If a reasoning row was matched in Stage 1, evaluate each layout against the `visual_style`, `dashboard_layout`, and `ui_style_bias` guidance before presenting options. In your response:
- Highlight which layouts best align with the guidance (e.g., "Layouts 2 and 5 match the recommended sidebar navigation pattern")
- Flag any layouts that contradict the guidance (e.g., "Layout 7 uses tab-heavy navigation, which the guidance recommends against")
- Frame your recommendation around the reasoning, not just aesthetics

### Response Template
> Here are {layouts_found} layouts designed for **{niche_display_name}** applications:
>
> For detailed inspection, open: `.design-pipeline/layouts/preview.html`
>
> {If reasoning row exists:}
> **Based on {application_type} design guidance:** {1-2 sentences noting which layouts align with `dashboard_layout` and `visual_style` guidance}
>
> **Selection Instructions:**
> Enter the numbers of **3 layouts** that best match your vision (e.g., "2, 5, 7")

Include niche-specific layout notes (see Appendix A).

### User Input Parsing
- Extract numbers using regex: `/\d+/g`
- Validate: exactly 3 numbers, each between 1 and {layouts_found}
- If invalid: "Please select exactly 3 layouts (e.g., 2, 5, 7)"

### Confirmation
> You selected:
> - Layout {n1}
> - Layout {n2}
> - Layout {n3}
>
> Is this correct? (yes / no / change)

### State Update
State is updated by scripts in subsequent stages. No manual state update needed here — the layout numbers are passed forward to Stage 3.

---

## Stage 3: Typography Selection

**TRIGGER:** Stage 2 complete AND user confirmed 3 layout selections.

### Script Calls (two scripts in sequence)

**Step 1: Filter typography options**
```bash
npx tsx scripts/filter-typography.ts \
  --niche "{state.inferred_niche}" \
  --application-type "{state.application_type}" \
  --count 15
```

**Required:** `--niche`
**Optional:** `--application-type`, `--count 15`, `--category`
**Exit codes:** 0 = success, 1 = missing --niche

Output (JSON to stdout):
```json
{
  "typography": [...],
  "total_matches": 15,
  "filter_strategy": "niche_only"
}
```

Also writes: `.design-pipeline/typography/filtered.json`

**Step 2: Generate typography previews applied to selected layouts**
```bash
npx tsx scripts/apply-typography-to-layout.ts \
  --layouts "{n1},{n2},{n3}"
```

**Required:** `--layouts` (comma-separated layout numbers, e.g., `1,2,3` — the user's selected numbers, NOT option IDs)
**Exit codes:** 0 = success, 1 = missing/invalid --layouts

Output (JSON to stdout):
```json
{
  "success": true,
  "selected_layouts": ["option-01", "option-02", "option-03"],
  "typography_count": 15,
  "combinations_generated": 45,
  "output_dir": ".design-pipeline/typography-applied",
  "preview": ".design-pipeline/typography-applied/preview.html"
}
```

### Reasoning-Informed Evaluation

If a reasoning row was matched, evaluate font pairings against the `visual_style` and `ui_style_bias` guidance. In your response:
- Recommend pairings that reinforce the described mood and visual tone (e.g., "Pairings 4 and 9 deliver the modern-professional tone the guidance calls for")
- Flag pairings that clash with the guidance (e.g., "Pairing 12 leans playful/rounded, which contradicts the structured, confident feel recommended for this product type")

### Response Template
> Here are {typography_count} font pairings for **{niche_display_name}/{application_type}** applications:
>
> For detailed inspection: `.design-pipeline/typography-applied/preview.html`
> (Each font is shown applied to your 3 selected layouts with real Google Fonts)
>
> {If reasoning row exists:}
> **Based on {application_type} design guidance:** {1-2 sentences on which pairings best match the `visual_style` direction}
>
> **Selection Instructions:**
> Enter the numbers of **3 font pairings** that work best (e.g., "4, 9, 13")

Include niche-specific typography notes (see Appendix A).

### User Input Parsing
Same as Stage 2: extract 3 valid numbers from 1 to {typography_count}.

### Confirmation
> You selected:
> - Font {n1}: {pairing_name} ({heading_font} / {body_font})
> - Font {n2}: {pairing_name} ({heading_font} / {body_font})
> - Font {n3}: {pairing_name} ({heading_font} / {body_font})
>
> Is this correct? (yes / no / change)

---

## Stage 4: Combination Preview

**TRIGGER:** Stage 3 complete AND user confirmed 3 typography selections.

### Script Call
```bash
npx tsx scripts/combine-previews.ts \
  --layouts "{layout_n1},{layout_n2},{layout_n3}" \
  --typography "{typo_n1},{typo_n2},{typo_n3}"
```

**Required:** `--layouts` (3 layout numbers), `--typography` (3 typography numbers)
**Exit codes:** 0 = success, 1 = missing/invalid params

### Expected Output (JSON to stdout)
```json
{
  "success": true,
  "selected_layouts": ["option-01", "option-02", "option-03"],
  "selected_typography": ["typo-001", "typo-003", "typo-005"],
  "combinations_generated": 9,
  "output_dir": ".design-pipeline/combinations",
  "preview": ".design-pipeline/combinations/preview.html"
}
```

### Reasoning-Informed Evaluation

If a reasoning row was matched, assess which combinations best embody the `visual_style`, `dashboard_layout`, and `ui_style_bias` guidance. In your response:
- Call out the 1-2 strongest combinations and explain why they align with the guidance
- Note any combinations where the layout and font pairing create tension with the recommended direction

### Response Template
> I've generated all 9 combinations of your selections:
>
> **Combination Grid:**
>
> |                    | {font_1_name} | {font_2_name} | {font_3_name} |
> |--------------------|---------------|---------------|---------------|
> | **{layout_1_name}**| Combo 1       | Combo 2       | Combo 3       |
> | **{layout_2_name}**| Combo 4       | Combo 5       | Combo 6       |
> | **{layout_3_name}**| Combo 7       | Combo 8       | Combo 9       |
>
> For detailed inspection: `.design-pipeline/combinations/preview.html`
>
> {If reasoning row exists:}
> **Based on {application_type} design guidance:** {1-2 sentences on which combos best match the `visual_style` + `dashboard_layout` direction}
>
> Which **single combination** best represents your vision? (Enter 1-9)

### User Input Parsing
- Extract single number: `/\d+/`
- Validate: between 1 and 9
- If invalid: "Please select one combination (1-9)"

### Confirmation
> You selected **Combo {n}**:
> - Layout: {layout_name}
> - Typography: {font_pairing_name} ({heading} / {body})
>
> Is this correct? (yes / no / change)

---

## Stage 5: Palette Application

**TRIGGER:** Stage 4 complete AND user selected a single combination.

### Script Call
```bash
npx tsx scripts/generate-palette-combinations.ts \
  --combination "combo-{padded_number}" \
  --niche "{state.inferred_niche}" \
  --count 5
```

**Required:** `--combination` (e.g., `combo-05`), `--niche`
**Optional:** `--count 5`
**Exit codes:** 0 = success, 1 = missing params or invalid combo

**IMPORTANT:** The `--combination` value is `combo-XX` format (zero-padded two digits), e.g., user selects "5" -> `combo-05`.

### Expected Output (JSON to stdout)
```json
{
  "success": true,
  "combination": "combo-05",
  "palettes_found": 5,
  "filter_strategy": "niche_only",
  "output_dir": ".design-pipeline/palettes",
  "preview": ".design-pipeline/palettes/preview.html",
  "wcag_summary": [
    { "id": "palette-preview-01", "wcagLevel": "AA" },
    { "id": "palette-preview-02", "wcagLevel": "AAA" }
  ]
}
```

Also writes: `.design-pipeline/palettes/palettes.json` (full palette data with contrast ratios)

### Reasoning-Informed Evaluation

If a reasoning row was matched, evaluate each palette against the `color_palette` and `ui_style_bias` guidance. In your response:
- Recommend palettes that follow the color usage rules (e.g., "Palette 2 uses restrained primary coverage with a high-contrast CTA, matching the guidance")
- Flag palettes that violate the guidance (e.g., "Palette 4 uses the brand color as a large background fill, which the guidance recommends against")
- Note contrast ratio compliance relative to the guidance's accessibility requirements

### Response Template
> Here are {palettes_found} color palettes for your **{niche_display_name}** design:
>
> For detailed inspection: `.design-pipeline/palettes/preview.html`
> (Each palette is shown applied to your selected combination with contrast ratios)
>
> **Accessibility:**
> {For each palette, show WCAG level: AAA/AA/A}
>
> {If reasoning row exists:}
> **Based on {application_type} color guidance:** {1-2 sentences on which palettes best match the `color_palette` rules}
>
> Which color palette matches your brand? (Enter 1-{palettes_found})

Include niche-specific color notes (see Appendix A).

### User Input Parsing
- Extract single number: `/\d+/`
- Validate: between 1 and {palettes_found}

### Confirmation
> You selected **Palette {n}**: {palette_notes}
> - Primary: {primary} | Secondary: {secondary}
> - CTA: {cta} | Background: {background}
> - WCAG: {wcag_level}
>
> Is this correct? (yes / no / change)

### State Update
After user confirms, update state:
```json
{
  "selected_palette": "palette-preview-{padded_number}",
  "final_combination": {
    "layout": "{layout_id}",
    "typography": "{typography_id}",
    "palette": "palette-preview-{padded_number}"
  }
}
```

Use `updateState()` from `scripts/utils/state-manager.ts` or set values before calling generate-tokens.

---

## Stage 6: Token Generation

**TRIGGER:** Stage 5 complete AND user selected a palette.

### Script Call
```bash
npx tsx scripts/generate-tokens.ts \
  --frameworks shadcn,generic \
  --palette "palette-preview-{padded_number}"
```

**Optional:** `--frameworks shadcn,generic` (default: both), `--palette` (overrides state.selected_palette)
**Exit codes:** 0 = success, 1 = error

**IMPORTANT:** This script reads `selected_combination` from state to resolve the layout and typography. The `--palette` flag is needed if `state.selected_palette` hasn't been set yet.

### Expected Output (console logs, not JSON)
The script writes files directly:
```
.design-pipeline/tokens/
  layout-blueprint.svg     # Spatial wireframe (copied from selected layout)
  shadcn-globals.css       # shadcn/ui CSS variables (light + dark mode)
  design-tokens.css        # Generic CSS custom properties + utilities
  design_manifest.json     # Full design manifest with contrast data
  IMPLEMENTATION.md        # Integration guide
```

### Reasoning-Informed Output

If a reasoning row was matched, enhance the final output:
- Include the `essential_ux` guidance in the design summary as key implementation considerations
- Reference the reasoning row's principles in the closing summary so the user understands *why* these choices work together
- The design manifest and IMPLEMENTATION.md should reflect the product type's specific UX priorities

### Constraints-Informed Output

Always include a **Design Constraints Summary** in the Stage 6 response, drawn from the three constraint files:

1. **Accessibility (from `data/constraints/accessibility.csv`):** List the `blocker` and `High` impact constraints as a checklist — e.g., visible focus states, form control labels, keyboard handlers, semantic HTML
2. **Interaction (from `data/constraints/interaction.csv`):** List critical interaction requirements — e.g., skip navigation, modal focus trapping, drag-and-drop alternatives, accessible error messages
3. **Performance (from `data/constraints/performance.csv`):** List the Core Web Vitals budgets — LCP <=2.5s, FCP <=1.8s, CLS <=0.1, INP <=200ms — plus key optimizations (lazy loading, font-display swap, image compression)

### Response Template
> **Your {application_type} design system is ready!**
>
> **Design Summary:**
> | Aspect | Selection |
> |--------|-----------|
> | **Layout** | {layout_variant} |
> | **Heading Font** | {heading_font} |
> | **Body Font** | {body_font} |
> | **Color Palette** | {palette_notes} |
> | **Accessibility** | {wcag_level} compliant |
>
> {If reasoning row exists:}
> **Key UX Considerations for {application_type}:**
> {2-3 most critical points from `essential_ux` guidance}
>
> **Design Constraints Checklist:**
>
> _Accessibility (blockers):_
> - [ ] Visible focus states on all interactive elements (`:focus-visible`)
> - [ ] Form control labels (`<label>` or `aria-label` on every input)
> - [ ] Icon-only buttons have `aria-label`
> - [ ] Keyboard operability on all interactive elements
> - [ ] Semantic HTML before ARIA (`<button>`, `<a>`, `<label>`)
> - [ ] Never remove `outline` without a visible replacement
>
> _Interaction (high-impact):_
> - [ ] Skip navigation link at page top
> - [ ] Modal focus trapping with Escape key close
> - [ ] Drag-and-drop has keyboard/screen-reader alternatives
> - [ ] `prefers-reduced-motion` respected for all animations
> - [ ] Accessible error messages inline with form fields
>
> _Performance budgets:_
> - [ ] LCP <= 2.5s | FCP <= 1.8s | CLS <= 0.1 | INP <= 200ms
> - [ ] Images: responsive formats, `loading="lazy"` below the fold
> - [ ] Fonts: `font-display: swap`
> - [ ] Preconnect to critical domains (Google Fonts, CDNs)
>
> **Generated Files:**
>
> `.design-pipeline/tokens/`
> - `layout-blueprint.svg` -- Spatial wireframe for LLM-driven UI generation
> - `shadcn-globals.css` -- shadcn/ui theme (HSL variables, dark mode)
> - `design-tokens.css` -- Generic CSS (hex/RGB/HSL, spacing, utilities)
> - `daisyui-theme.css` -- DaisyUI theme (CSS variables)
> - `agnosticui-tokens.css` -- AgnosticUI design tokens
> - `design_manifest.json` -- Complete design specifications
> - `IMPLEMENTATION.md` -- Step-by-step integration guide
>
> **Google Fonts Import:**
> ```html
> <link rel="stylesheet" href="{google_fonts_url}" />
> ```
>
> **Next Steps:**
> 1. Choose your preferred framework (shadcn/ui or generic CSS)
> 2. Copy the corresponding token files to your project
> 3. Add the Google Fonts import to your HTML head
> 4. Follow `IMPLEMENTATION.md` for framework-specific setup
>
> **Need adjustments?** I can regenerate any stage:
> - "change layouts" -- Back to layout selection
> - "change fonts" -- Back to typography selection
> - "change colors" -- Back to palette selection
> - "start over" -- Fresh start

### Final State
The script automatically sets:
```json
{
  "current_stage": "complete",
  "pipeline_complete": true,
  "generated_tokens": { "layout": "...", "shadcn": "...", "generic": "...", "manifest": "...", "guide": "..." }
}
```

---

## Navigation Commands

### Go Back Handling

**User phrases that trigger go-back:**
- "go back", "previous", "undo"
- "change my layouts/fonts/colors"
- "start over", "restart"
- "I want to pick different..."

**Parsing rules:**
| User says | Action |
|-----------|--------|
| "go back" / "previous" | Move to previous stage |
| "restart" / "start over" | Reset to Stage 1 |
| "change layouts" | Return to Stage 2 |
| "change fonts" / "change typography" | Return to Stage 3 |
| "change combination" | Return to Stage 4 |
| "change colors" / "change palette" | Return to Stage 5 |

**Response template:**
> No problem! Going back to **{stage_name}**.
>
> {If previous selections exist:}
> Your previous selections were: {list}
> Would you like to start fresh or modify these?

**State update:** Use `resetToStage()` from `scripts/utils/state-manager.ts`.

---

## Error Handling

### Script Errors

| Exit Code | Meaning | Recovery |
|-----------|---------|----------|
| 1 | Invalid/missing parameters | Fix parameters and retry once |
| 2 | Missing files/data (generate-layouts only) | Check layouts directory exists for niche |
| Other | Unexpected error | Show error, offer manual troubleshooting |

**Response template (script error):**
> I encountered an issue generating {stage_artifact}. Let me try an alternative approach.
>
> {If retryable: attempt with corrected params}
>
> {If still failing:}
> The script reported an error. You can try running it manually:
> ```bash
> cd skills/bespoke_design_system
> {script_command}
> ```

### Insufficient Data

If filter-typography or filter-colors returns too few results, the scripts handle fallback internally (exact_match -> niche_only -> expanded -> generic). Report the `filter_strategy` to the user:

> I found {count} options using the **{filter_strategy}** strategy.
> {If strategy is "expanded" or "fallback":}
> I expanded the search beyond {niche_id}-specific options to give you more choices.

### Invalid User Input

> I didn't understand that selection. {specific guidance}
>
> Examples of valid input:
> - {example}
>
> Please try again.

### State Corruption Recovery

If state.json is corrupt or inconsistent:
1. Attempt to read — if JSON parse fails, backup and create fresh state
2. If fields are missing, attempt to infer from `.design-pipeline/` artifacts
3. Report to user: "Reconstructing progress from generated files..."

---

## Appendix A: Niche-Specific Notes

Use these when presenting options at each stage.

### Dashboard
- **Layouts:** High information density, sidebar/topnav patterns, chart zones, metric cards
- **Typography:** Tabular figures for alignment, monospace for data, high contrast
- **Colors:** Semantic status colors (success/warning/error), neutral backgrounds, accent for interactive elements

### Medical
- **Layouts:** Spacious for reduced cognitive load, clear scheduling interfaces, high contrast
- **Typography:** AAA contrast (7:1+), clinical trustworthy typefaces, dyslexia-tested
- **Colors:** Calming professional palettes, accessible emergency red, color-vision-deficiency tested

### Fintech
- **Layouts:** Maximum data density, multi-panel for live data, real-time update zones
- **Typography:** Monospace/tabular for prices, high legibility at small sizes, column-aligned numbers
- **Colors:** Semantic green/red for profit/loss, dark backgrounds, high contrast for critical info

### E-commerce
- **Layouts:** Product grid/gallery, clear CTA placement, conversion-optimized checkout
- **Typography:** Scannable product titles, readable descriptions, strong price hierarchy
- **Colors:** Strong CTA for conversion, neutral backgrounds for product focus, trust indicators

### Marketing
- **Layouts:** Hero section prominence, CTA placement, social proof zones
- **Typography:** Impactful headlines, readable feature descriptions, mobile-friendly sizes
- **Colors:** High-contrast CTAs, brand personality, emotional resonance

### SaaS
- **Layouts:** Persistent navigation, content-rich panels, settings/configuration patterns
- **Typography:** Optimized for long sessions, clear hierarchy, tabular figures for metrics
- **Colors:** Professional, not fatiguing, clear interactive element states

### Blog/Content
- **Layouts:** Reading-optimized, generous whitespace, sidebar for navigation
- **Typography:** Highly readable body text, elegant headings, comfortable line height
- **Colors:** Low-fatigue reading, subtle accents, clean backgrounds

### Portfolio/Creative
- **Layouts:** Visual showcase, gallery patterns, minimal chrome
- **Typography:** Distinctive headings, clean body text, creative pairings
- **Colors:** Bold or minimal palettes, let content shine, brand expression

### Industrial/IoT
- **Layouts:** Equipment monitoring, status panels, alert zones, map integration
- **Typography:** High legibility, clear status labels, monospace for sensor data
- **Colors:** Safety-standard colors, high contrast alerts, dark mode for control rooms

### Education/LMS
- **Layouts:** Course catalogs, lesson viewers, progress dashboards, quiz interfaces
- **Typography:** Highly readable body text, clear hierarchy for lesson content, accessible at all sizes
- **Colors:** Engaging but not distracting, progress-indicator greens, category coding for subjects

### Real Estate
- **Layouts:** Property grids with map integration, listing detail pages, agent profiles, search-heavy interfaces
- **Typography:** Clean headlines for property titles, readable descriptions, strong price hierarchy
- **Colors:** Trust-building neutrals, aspirational accents, high-contrast CTAs for contact/schedule

### Social/Community
- **Layouts:** Feed-centric with content cards, profile pages, messaging panels, notification systems
- **Typography:** Scannable feed text, clear usernames, readable at small sizes for dense feeds
- **Colors:** Neutral backgrounds to let user content shine, brand accent for actions, semantic for notifications

### Food/Restaurant
- **Layouts:** Menu displays, reservation flows, gallery-heavy pages, order interfaces
- **Typography:** Elegant menu headers, readable item descriptions, price alignment
- **Colors:** Appetite-stimulating warm palettes, clean backgrounds for food photography, gold/amber accents

### Travel/Booking
- **Layouts:** Search-first interfaces, date pickers, itinerary views, gallery and map integration
- **Typography:** Clear pricing and date displays, scannable listing cards, readable descriptions
- **Colors:** Aspirational blues and greens, high-contrast booking CTAs, trust indicators

### Non-profit/Government
- **Layouts:** Mission-first hero sections, donation flows, impact dashboards, accessible forms
- **Typography:** Highly readable, accessible (AAA preferred), plain language friendly
- **Colors:** Trust-building professional palettes, accessible contrast ratios, semantic for alerts only

---

## Appendix B: Implementation Checklist

Before using this skill, verify:
- [ ] All 7 scripts exist in `scripts/`
- [ ] `npm install` has been run (csv-parse, handlebars, tsx available)
- [ ] Layout SVGs exist in `layouts/{niche}/` for target niches
- [ ] `data/typography.csv` and `data/colors.csv` exist
- [ ] `data/niche-taxonomy.json` exists with keyword data
- [ ] `.design-pipeline/` directory exists (created by scripts if missing)
- [ ] Templates exist in `templates/shadcn/` and `templates/generic/`
- [ ] Template helpers exist in `templates/helpers/`
- [ ] `data/application_type.csv` exists (design reasoning rows for product types)
- [ ] `data/constraints/accessibility.csv` exists (WCAG 2.2 rules)
- [ ] `data/constraints/interaction.csv` exists (interaction UX rules)
- [ ] `data/constraints/performance.csv` exists (Core Web Vitals budgets)
