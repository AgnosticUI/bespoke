# Bespoke Design Pipeline - Implementation Plan

**Version:** 1.0
**Created:** February 2026
**Status:** In Progress

---

## Quick Status

**Current Phase:** Phase 6 - Polish & Testing
**Last Updated:** 2026-02-06
**Completed Phases:** Phase 0, Phase 1, Phase 2, Phase 3, Phase 4 (MVP COMPLETE), Phase 5

### Progress Overview

| Phase | Status | Completion |
|-------|--------|------------|
| Phase 0: Foundation | ✅ Complete | 100% |
| Phase 1: Core Scripts | ✅ Complete | 100% |
| Phase 2: Preview Generation | ✅ Complete | 100% |
| Phase 3: Token Output | ✅ Complete | 100% |
| Phase 4: Orchestration | ✅ Complete | 100% |
| Phase 5: Additional Frameworks | ✅ Complete | 100% |
| Phase 6: Polish & Testing | ⏳ Not Started | 0% |
| Phase 7: Extended Frameworks | 📋 Future | - |

### Scope Clarification

**MVP (Phases 0-4):** Complete pipeline with shadcn/ui + generic CSS output
**Core Complete (Phases 0-6):** All 4 documented frameworks (shadcn, DaisyUI, AgnosticUI, generic)
**Extended (Phase 7+):** Aceternity, Magic UI, NextUI, community-requested frameworks

---

## Reference Documents

Before starting implementation, these specs are complete and ready:

- [x] `docs/BESPOKE_DESIGN_SYSTEM_DOCUMENTATION.md` - Main PRD
- [x] `docs/SKILL_MD_SPECIFICATION.md` - SKILL.md orchestration spec
- [x] `docs/SCRIPT_ALGORITHMS.md` - Detailed algorithm specs for all 7 scripts
- [x] `docs/TEMPLATE_SYSTEM_SPEC.md` - Handlebars template system
- [x] `docs/SVG_WIREFRAME_GENERATION_GUIDE.md` - SVG layout requirements

---

## Phase 0: Foundation

**Goal:** Establish directory structure, data schemas, and shared utilities.

**Estimated Effort:** 2-3 hours

### Tasks

#### 0.1 Directory Structure
- [x] Create `scripts/` directory with subdirectories
- [x] Create `scripts/utils/` for shared utilities
- [x] Create `templates/` directory structure (per TEMPLATE_SYSTEM_SPEC.md)
- [x] Create `templates/helpers/` for Handlebars helpers
- [x] Create `data/framework-profiles/` for token mappings
- [x] Ensure `.design-pipeline/` exists and is gitignored

#### 0.2 Package Setup
- [x] Create/update `package.json` with dependencies
- [x] Install: `csv-parse`, `handlebars`, `typescript`, `tsx`
- [x] Install dev: `@types/node`
- [x] Optional: Install `puppeteer` for PNG generation
- [x] Create `tsconfig.json` for TypeScript compilation

#### 0.3 Shared Utilities
- [x] Create `scripts/utils/csv-loader.ts`
  - [x] CSV parsing with header detection
  - [x] Multi-value column parsing (semicolon-separated)
  - [x] filterBy and filterByMulti methods
- [x] Create `scripts/utils/color-conversions.ts`
  - [x] hexToRgb, hexToHsl, hslToHex
  - [x] calculateContrast, meetsWCAG
- [x] Create `scripts/utils/svg-manipulator.ts`
  - [x] SVG parsing and serialization
  - [x] Element selection and attribute modification
  - [x] Font injection

#### 0.4 Data Files
- [x] Validate `data/niche-taxonomy.json` exists and has correct structure
- [x] Validate `data/typography.csv` has niche_id and application_types columns
- [x] Validate `data/colors.csv` has niche_id and application_types columns
- [x] Create `data/framework-profiles/shadcn-profile.csv` (MVP framework)
- [x] Create `data/framework-profiles/generic-profile.csv` (MVP framework)

**Note:** DaisyUI and AgnosticUI profiles are created in Phase 5. Extended framework profiles (Aceternity, Magic UI, NextUI) are created in Phase 7+.

#### 0.5 State Management
- [x] Create `scripts/utils/state-manager.ts`
  - [x] readState, writeState, updateState functions
  - [x] State validation
  - [x] Atomic writes (temp file + rename)

### Phase 0 Success Criteria
- [x] `npm install` completes without errors
- [x] `npx tsx scripts/utils/csv-loader.ts` runs without errors
- [x] Can load and parse typography.csv (139 rows loaded)
- [x] State file can be created/read/updated

### Phase 0 Deliverables
```
skills/bespoke_design_system/
├── package.json
├── tsconfig.json
├── scripts/
│   └── utils/
│       ├── csv-loader.ts
│       ├── color-conversions.ts
│       ├── svg-manipulator.ts
│       └── state-manager.ts
├── templates/
│   ├── helpers/
│   └── (empty framework dirs)
└── data/
    └── framework-profiles/
        ├── shadcn-profile.csv
        └── generic-profile.csv
```

---

## Phase 1: Core Scripts

**Goal:** Build the data access scripts that query CSVs and perform matching.

**Estimated Effort:** 4-5 hours

**Depends On:** Phase 0 complete

### Tasks

#### 1.1 match-niche.ts
- [x] Create `scripts/match-niche.ts`
- [x] Implement tokenization (words, bigrams, trigrams)
- [x] Implement keyword matching against taxonomy
- [x] Implement scoring algorithm (primary/secondary/negative keywords)
- [x] Implement confidence calculation
- [x] Implement application_type matching within niche
- [x] Add CLI argument parsing (--description, --strict, --min-confidence)
- [x] Output valid JSON to stdout
- [x] Test with edge cases:
  - [x] Clear medical case (confidence: 1.0, niche: medical, app_type: telemedicine)
  - [x] Ambiguous case — dashboard/analytics returns 0.92 confidence
  - [x] Very generic input ("I need a website") — falls back to saas/web-app at 0.3

#### 1.2 filter-typography.ts
- [x] Create `scripts/filter-typography.ts`
- [x] Implement cascading filter strategy:
  - [x] Exact match (niche + application_type)
  - [x] Niche-only fallback
  - [x] Related niches expansion
  - [x] Generic fallback
- [x] Implement diversity selection (mix categories)
- [x] Add CLI argument parsing (--niche, --application-type, --count)
- [x] Output valid JSON to stdout
- [x] Test with various niches (medical: 15 matches via niche_only strategy)

#### 1.3 filter-colors.ts (used by generate-palette-combinations.ts)
- [x] Create `scripts/utils/filter-colors.ts` (shared logic)
- [x] Same cascading filter strategy as typography
- [x] Implement hue diversity selection (30° hue buckets for even distribution)
- [x] Test: medical niche returns palettes via expanded strategy (36 matches), patient-portal exact match (12 matches)

### Phase 1 Success Criteria
- [x] `npx tsx scripts/match-niche.ts --description "patient portal"` returns medical niche
- [x] `npx tsx scripts/filter-typography.ts --niche medical` returns 15 typography options
- [x] All scripts exit with proper codes (0=success, 1=invalid params)

### Phase 1 Deliverables
```
scripts/
├── match-niche.ts
├── filter-typography.ts
└── utils/
    └── filter-colors.ts
```

---

## Phase 2: Preview Generation

**Goal:** Build scripts that generate visual previews (SVG/HTML/PNG).

**Estimated Effort:** 6-8 hours

**Depends On:** Phase 1 complete

### Tasks

#### 2.0 Utility Fixes (Prerequisites)
- [x] Add `buildGoogleFontsUrl()` to `scripts/utils/svg-manipulator.ts`
- [x] Add `applyColorsViaGrayscale()` to `scripts/utils/svg-manipulator.ts`
- [x] Fix `scripts/filter-typography.ts` to construct Google Fonts URLs dynamically (CSV column misalignment bug)

#### 2.1 generate-layouts.ts
- [x] Create `scripts/generate-layouts.ts`
- [x] Implement SVG file discovery from `layouts/{niche}/`
- [x] Implement filename parsing for metadata
- [x] Copy SVGs to `.design-pipeline/layouts/`
- [x] Generate preview.html (interactive grid with click-to-select-3)
- [x] Optional: Generate grid-preview.png via Puppeteer
- [x] Test with dashboard layouts (8 found), exit code 2 for missing niches

#### 2.2 apply-typography-to-layout.ts
- [x] Create `scripts/apply-typography-to-layout.ts`
- [x] Clone selected layout SVGs
- [x] Inject Google Fonts @import into SVG
- [x] Generate combined previews (3 layouts × N fonts SVGs)
- [x] Generate preview.html with real font specimens (heading + body via Google Fonts <link> tags)
- [x] Layout thumbnails shown per typography card

#### 2.3 combine-previews.ts
- [x] Create `scripts/combine-previews.ts`
- [x] Accept 3 layout IDs and 3 typography IDs
- [x] Generate 9 combinations (3×3 matrix)
- [x] Apply fonts to layouts
- [x] Generate combo-01.svg through combo-09.svg
- [x] Generate preview.html with 3×3 grid table (rows=layouts, cols=typography)
- [x] Include grid metadata (row/col labels)

#### 2.4 generate-palette-combinations.ts
- [x] Create `scripts/generate-palette-combinations.ts`
- [x] Filter palettes using filter-colors utility
- [x] Load selected combination SVG
- [x] Apply colors via `applyColorsViaGrayscale()` (grayscale fill/stroke replacement)
- [x] Calculate and validate contrast ratios (text-on-bg, text-on-primary, cta-on-bg)
- [x] WCAG level badges (AAA/AA/A/FAIL)
- [x] Generate preview.html with colored SVGs, swatches, and contrast info

#### 2.5 PNG Generation (Optional)
- [x] Create `scripts/utils/generate-preview-image.ts`
- [x] Puppeteer-based HTML to PNG
- [x] Handle missing Puppeteer gracefully (skip PNG)

### Phase 2 Success Criteria
- [x] Layout grid preview displays correctly in browser
- [x] Typography previews show actual Google Fonts
- [x] 3×3 combination grid displays correctly
- [x] Color variations apply properly to SVG elements (via grayscale replacement)
- [x] All preview.html files are interactive (click to select)

### Phase 2 Deliverables
```
scripts/
├── generate-layouts.ts
├── apply-typography-to-layout.ts
├── combine-previews.ts
├── generate-palette-combinations.ts
└── utils/
    └── generate-preview-image.ts
```

---

## Phase 3: Token Output

**Goal:** Build Handlebars templates and token generation script.

**Estimated Effort:** 4-5 hours

**Depends On:** Phase 2 complete

### Tasks

#### 3.1 Template Helpers
- [x] Create `templates/helpers/index.ts`
- [x] Create `templates/helpers/color-helpers.ts`
  - [x] hsl, hslCss, rgb helpers
  - [x] darken, lighten helpers
  - [x] contrastText, withOpacity, focusRing helpers
- [x] Create `templates/helpers/spacing-helpers.ts`
  - [x] rem, px, em helpers
  - [x] tailwindSpacing helper
- [x] Create `templates/helpers/string-helpers.ts`
  - [x] kebab, camel, quote helpers
  - [x] eq, neq conditional helpers
- [x] Register all helpers in Handlebars instance (via `createHandlebars()` isolated instance)

#### 3.2 shadcn/ui Templates (Reference Implementation)
- [x] Create `templates/shadcn/globals.css.hbs`
  - [x] Light mode CSS variables
  - [x] Dark mode CSS variables
  - [x] Base layer styles
- [ ] Create `templates/shadcn/tailwind.config.ts.hbs` *(deferred — lower priority, CSS file is the primary output)*
  - [ ] Theme extension
  - [ ] Color references to CSS variables
  - [ ] Font family configuration
- [ ] Create `templates/shadcn/components.json.hbs` *(deferred — lower priority)*

#### 3.3 Generic CSS Template
- [x] Create `templates/generic/design-tokens.css.hbs`
  - [x] All color tokens (hex, rgb, hsl formats)
  - [x] Typography tokens
  - [x] Spacing tokens
  - [x] Radius and shadow tokens
  - [x] Basic utility classes

#### 3.4 generate-tokens.ts
- [x] Create `scripts/generate-tokens.ts`
- [x] Build template context from selected assets
- [x] Derive missing colors (6 base → 16 total including muted, card, ring, destructive, success, warning)
- [x] Render Handlebars templates
- [x] Generate design_manifest.json (with contrast ratios)
- [x] Generate IMPLEMENTATION.md guide
- [x] Support --frameworks flag for selective generation
- [x] Support --palette flag for palette override

### Phase 3 Success Criteria
- [x] `npx tsx scripts/generate-tokens.ts --frameworks shadcn` produces valid shadcn CSS
- [x] `npx tsx scripts/generate-tokens.ts --frameworks generic` produces valid generic CSS
- [ ] Generated CSS variables work in a test project *(manual verification pending)*
- [ ] Tailwind config is syntactically valid *(deferred — tailwind.config.ts.hbs not yet created)*
- [x] design_manifest.json contains all selected options
- [x] Tested with 2 different palettes (palette-preview-01 and palette-preview-02) — correct hex/HSL/RGB values in both

**MVP Output:** After Phase 3, the pipeline produces 2 framework outputs (shadcn + generic)

### Phase 3 Deliverables
```
templates/
├── helpers/
│   ├── index.ts
│   ├── color-helpers.ts
│   ├── spacing-helpers.ts
│   └── string-helpers.ts
├── shadcn/
│   ├── globals.css.hbs
│   ├── tailwind.config.ts.hbs
│   └── components.json.hbs
└── generic/
    └── design-tokens.css.hbs

scripts/
└── generate-tokens.ts
```

### Phase 3 Detailed Implementation Notes

#### Template Helpers (4 files)

**`templates/helpers/color-helpers.ts`** — Handlebars color helpers wrapping existing `scripts/utils/color-conversions.ts`:
- `hsl(hex)` → `"199 96% 32%"` (shadcn format, space-separated)
- `hslCss(hex)` → `"hsl(199, 96%, 32%)"`
- `rgb(hex)` → `"3 105 161"` (Tailwind format)
- `darken(hex, percent)`, `lighten(hex, percent)`, `saturate(hex, percent)` — delegate to color-conversions
- `contrastText(hex)` → `"0 0% 100%"` or `"0 0% 0%"` (HSL of black/white for shadcn)
- `withOpacity(hex, opacity)` → `"rgba(r, g, b, opacity)"`
- `focusRing(hex)` → primary at 0.5 opacity

**`templates/helpers/spacing-helpers.ts`**:
- `rem(px)` → `"1rem"`, `px(value)` → `"16px"`, `em(px, base?)` → `"1em"`
- `tailwindSpacing(px)` → `"4"` (px/4)
- `multiply(value, factor)` → number

**`templates/helpers/string-helpers.ts`**:
- `kebab(str)`, `camel(str)`, `quote(str)` → `"'Inter'"`
- `eq(a, b)`, `neq(a, b)` — block helpers for conditionals
- `now()` → ISO timestamp

**`templates/helpers/index.ts`** — Imports all helper modules, exports `registerHelpers(handlebars)`.

#### Handlebars Templates (4 files)

**`templates/shadcn/globals.css.hbs`** — Google Fonts `@import`, `:root` with HSL CSS variables (--primary, --secondary, etc.), `--primary-foreground` via `contrastText`, font families, radius, `.dark` block with inverted variants, `@layer base` body styles.

**`templates/shadcn/tailwind.config.ts.hbs`** — Extends theme colors to `"hsl(var(--primary))"`, font family extension, border radius extension.

**`templates/shadcn/components.json.hbs`** — Standard shadcn CLI configuration JSON.

**`templates/generic/design-tokens.css.hbs`** — All colors in hex/RGB/HSL, spacing as px, typography, radius, shadows, utility classes.

#### generate-tokens.ts Script

1. Reads pipeline state (`selected_combination` + `selected_palette`)
2. Loads `combinations.json` → resolves combo to layout + typography IDs
3. Loads `palettes.json` → resolves palette to color hex values
4. Loads `filtered.json` → resolves typography ID to font names
5. Builds `TemplateContext` with colors (via `createColorValue()`), fonts, spacing, radius, shadows, meta
6. **Derives missing colors**: palette has 6 (primary, secondary, cta, background, text, border) → derives ~11 more: `foreground` from `text`, `accent` from `cta`, `muted`/`mutedForeground`/`card`/`cardForeground`/`input`/`ring` via lighten/darken, `destructive`/`success`/`warning` as sensible defaults
7. Compiles and renders Handlebars templates per framework
8. Generates `design_manifest.json` + `IMPLEMENTATION.md`
9. Updates state with `generated_tokens` paths

**CLI:** `npx tsx scripts/generate-tokens.ts [--frameworks shadcn,generic] [--palette palette-preview-XX]`

#### Key Design Decisions
- **Static defaults**: spacing, radius, shadows are constants (not in pipeline state)
- **Framework profiles**: CSV files serve as documentation/mapping reference; templates use direct Handlebars expressions for formatting control
- **Reused utilities**: `createColorValue()`, `hexToHsl()`, `darken()`, `lighten()`, `getContrastingText()`, `withOpacity()` from color-conversions.ts; `readState()`, `completeStage()` from state-manager.ts; `loadCSV()` from csv-loader.ts; `buildGoogleFontsUrl()` from svg-manipulator.ts

---

## Phase 4: Orchestration

**Goal:** Create the SKILL.md file and integrate all scripts into a cohesive workflow.

**Estimated Effort:** 3-4 hours

**Depends On:** Phase 3 complete

### Tasks

#### 4.1 SKILL.md Creation
- [x] Create `SKILL.md` in skill root directory
- [x] Add metadata section (skill ID, version, trigger)
- [x] Add Stage 1: Understand Problem section
- [x] Add Stage 2: Wireframe Selection section
- [x] Add Stage 3: Typography Selection section
- [x] Add Stage 4: Combination Preview section
- [x] Add Stage 5: Palette Application section
- [x] Add Stage 6: Token Generation section
- [x] Add navigation commands (go back handling)
- [x] Add error handling templates
- [x] Add Appendix A: niche-specific notes for all 9 niches
- [x] Add Appendix B: implementation checklist

#### 4.2 State Machine Validation
- [x] Verify state transitions work correctly (fresh -> S1 -> S2 -> S3 -> S4 -> S5 -> token_generation)
- [x] Test go-back functionality (resetToStage preserves data, trims completed_stages)
- [x] Test state corruption detection (inconsistent state correctly flagged with specific errors)
- [x] Ensure atomic state updates (temp file + rename in writeState)

#### 4.3 Integration Testing
- [x] Run complete pipeline manually (all 6 stages, dashboard niche)
- [ ] Test with medical niche end-to-end *(blocked: medical layouts directory is empty)*
- [ ] Test with saas niche end-to-end *(blocked: saas layouts directory is empty)*
- [x] Verify all outputs are generated correctly (CSS, manifest, guide)
- [x] **Bug found & fixed**: `combine-previews.ts` typography resolution used ID construction (`typo-006`) instead of position-based indexing into filtered.json. Fixed to use 1-based index.

### Phase 4 Success Criteria
- [x] SKILL.md follows specification in SKILL_MD_SPECIFICATION.md (adapted to match actual script interfaces)
- [x] Complete pipeline can be run manually following SKILL.md instructions (tested with dashboard niche)
- [x] State persists correctly across "sessions"
- [x] Go-back navigation works properly

**Note:** Full multi-niche integration testing blocked on layout SVG content (only dashboard has SVGs). This is a Phase 6 content task, not a code issue.

### Phase 4 Deliverables
```
skills/bespoke_design_system/
└── SKILL.md
```

---

## Phase 5: Additional Frameworks

**Goal:** Build templates for remaining core frameworks (DaisyUI, AgnosticUI).

**Estimated Effort:** 3-4 hours

**Depends On:** Phase 4 complete

### Tasks

#### 5.1 DaisyUI Templates
- [x] Create `templates/daisyui/theme.css.hbs`
  - [x] Light theme: `[data-theme="bespoke"]` with hex colors
  - [x] Dark theme: `[data-theme="bespoke-dark"]` using pre-computed `darkColors`
  - [x] Structural vars: `--radius-*`, `--size-*`, `--border`, `--depth`, `--noise`
  - [x] Typography base styles
- [ ] Create `templates/daisyui/tailwind.config.ts.hbs` *(deferred — CSS theme file is the primary output)*
- [ ] Create `data/framework-profiles/daisyui-profile.csv` *(deferred — templates use direct expressions)*
- [x] Test with sample design (palette-preview-02)

#### 5.2 AgnosticUI Templates
- [x] Create `templates/agnosticui/design-tokens.css.hbs`
  - [x] Semantic token overrides only (no primitive color scales)
  - [x] Light mode: `:where(html), [data-theme="light"]`
  - [x] Dark mode: `[data-theme="dark"]` using pre-computed `darkColors`
  - [x] Covers: text, backgrounds, primary/secondary/danger/success/warning/info, borders, focus, rating
- [ ] Create `templates/agnosticui/variables.css.hbs` *(not needed — single file covers all semantic tokens)*
- [ ] Create `data/framework-profiles/agnosticui-profile.csv` *(deferred — templates use direct expressions)*
- [x] Test with sample design (palette-preview-02)

#### 5.3 Supporting Changes
- [x] Added `contrastHex` Handlebars helper (hex output for DaisyUI `-content` vars)
- [x] Added `rgbCsv` Handlebars helper (comma-separated RGB for AgnosticUI `--ag-*-rgb` vars)
- [x] Registered both frameworks in `TEMPLATE_MAP` in `generate-tokens.ts`
- [x] Added implementation guide sections for both frameworks

### Phase 5 Success Criteria
- [x] DaisyUI templates generate valid theme
- [x] AgnosticUI templates generate valid CSS
- [x] Both integrate correctly with generate-tokens.ts
- [x] All 4 frameworks generate together without errors

### Phase 5 Deliverables
```
templates/
├── daisyui/
│   └── theme.css.hbs
└── agnosticui/
    └── design-tokens.css.hbs

templates/helpers/
└── color-helpers.ts          (added contrastHex + rgbCsv)

scripts/
└── generate-tokens.ts        (added TEMPLATE_MAP entries + guide sections)
```

---

## Phase 6: Polish & Testing

**Goal:** Improve robustness, add testing, complete documentation.

**Estimated Effort:** 3-4 hours

**Depends On:** Phase 5 complete

### Tasks

#### 6.1 Error Handling Improvements
- [ ] Add comprehensive error messages
- [ ] Add recovery suggestions
- [ ] Test all error paths

#### 6.2 Testing Suite
- [ ] Create `scripts/test/validate-templates.ts`
- [ ] Create `scripts/test/test-pipeline.ts`
- [ ] Add example test cases
- [ ] Validate all CSV files

#### 6.3 Documentation
- [ ] Update README with usage instructions
- [ ] Add troubleshooting guide
- [ ] Document all CLI options

#### 6.4 Layout Content (Parallel Track)
- [ ] Create additional layouts for each niche
- [ ] Target: 10-15 layouts per niche
- [ ] Validate SVG structure per SVG_WIREFRAME_GENERATION_GUIDE.md

### Phase 6 Success Criteria
- [ ] Test suite passes
- [ ] Error messages are helpful
- [ ] Documentation is complete

### Phase 6 Deliverables
```
scripts/test/
├── validate-templates.ts
└── test-pipeline.ts

README.md (updated)
```

---

## Phase 7: Extended Frameworks (Future)

**Goal:** Add support for additional UI libraries beyond core set.

**Status:** Future work - not in current scope

**Depends On:** Phase 6 complete

### Frameworks to Add

| Framework | Priority | Rationale |
|-----------|----------|-----------|
| Aceternity UI | Medium | Popular for animated components |
| Magic UI | Medium | Glassmorphism/effects focused |
| NextUI | Medium | Next.js ecosystem integration |
| Chakra UI | Low | Community request |
| Mantine | Low | Community request |
| Radix Themes | Low | Pairs well with shadcn |

### Tasks (Per Framework)
- [ ] Create template directory
- [ ] Create framework profile CSV
- [ ] Create necessary template files
- [ ] Add to generate-tokens.ts
- [ ] Test output validity

### Notes
- These are **not blocking** for MVP
- Can be added incrementally based on user demand
- Community contributions welcome for these

---

## Dependency Graph

```
Phase 0: Foundation
    │
    ├── csv-loader.ts
    ├── color-conversions.ts
    ├── state-manager.ts
    │
    ▼
Phase 1: Core Scripts
    │
    ├── match-niche.ts ─────────────────┐
    ├── filter-typography.ts ───────────┤
    ├── filter-colors.ts (utility) ─────┤
    │                                   │
    ▼                                   ▼
Phase 2: Preview Generation          Phase 3: Token Output
    │                                   │
    ├── generate-layouts.ts             ├── Template helpers
    ├── apply-typography-to-layout.ts   ├── shadcn templates (MVP)
    ├── combine-previews.ts             ├── generic templates (MVP)
    ├── generate-palette-combinations.ts├── generate-tokens.ts
    │                                   │
    └───────────────┬───────────────────┘
                    │
                    ▼
              Phase 4: Orchestration
                    │
                    ├── SKILL.md
                    ├── Integration testing
                    │
                    ▼
        ┌─────────────────────────────┐
        │    *** MVP COMPLETE ***     │
        │  (shadcn + generic output)  │
        └─────────────────────────────┘
                    │
                    ▼
          Phase 5: Additional Frameworks
                    │
                    ├── DaisyUI templates
                    ├── AgnosticUI templates
                    │
                    ▼
          Phase 6: Polish & Testing
                    │
                    ├── Testing suite
                    ├── Error handling
                    ├── Documentation
                    │
                    ▼
        ┌─────────────────────────────┐
        │   *** CORE COMPLETE ***     │
        │ (All 4 documented frameworks)│
        └─────────────────────────────┘
                    │
                    ▼
          Phase 7+: Extended Frameworks (Future)
                    │
                    ├── Aceternity UI
                    ├── Magic UI
                    ├── NextUI
                    └── Community requests
```

### Framework Coverage Summary

| Framework | Phase | Status |
|-----------|-------|--------|
| Generic CSS | 3 (MVP) | ✅ Complete |
| shadcn/ui | 3 (MVP) | ✅ Complete |
| DaisyUI | 5 | ✅ Complete |
| AgnosticUI | 5 | ✅ Complete |
| Aceternity UI | 7+ | Future |
| Magic UI | 7+ | Future |
| NextUI | 7+ | Future |

---

## Progress Log

Use this section to track progress between sessions.

### Session Log

| Date | Session | Work Completed | Next Steps |
|------|---------|----------------|------------|
| 2026-02-05 | 1 | Created specification docs (SKILL_MD_SPEC, SCRIPT_ALGORITHMS, TEMPLATE_SYSTEM_SPEC) | Start Phase 0 |
| 2026-02-05 | 1 | Completed Phase 0: package.json, tsconfig.json, all 4 utilities, framework profiles, updated niche-taxonomy with keywords | Start Phase 1 |
| 2026-02-05 | 2 | Completed Phase 1: match-niche.ts, filter-typography.ts, filter-colors.ts — all tested and passing | Start Phase 2 |
| 2026-02-05 | 3 | Completed Phase 2: Fixed typography CSV bug (buildGoogleFontsUrl), added applyColorsViaGrayscale, created all 4 preview scripts + Puppeteer wrapper | Start Phase 3 |
| 2026-02-06 | 4 | Pre-Phase 3 polish: Simplified dashboard SVG template, generated palette previews for all 3 template variants (dashboard/storefront/content), created side-by-side comparison HTML | Start Phase 3 |
| 2026-02-06 | 5 | Completed Phase 3: 4 template helpers, 2 Handlebars templates (shadcn globals.css + generic design-tokens.css), generate-tokens.ts script. Tested with palette-preview-01 and palette-preview-02. | Start Phase 4 |
| 2026-02-06 | 5 | Completed Phase 4: SKILL.md created, state machine validated (progression, go-back, corruption detection), full integration test (dashboard niche, all 6 stages). Fixed bug in combine-previews.ts typography resolution. **MVP COMPLETE.** | Phase 5 or polish |
| 2026-02-06 | 6 | **Dark mode (cross-cutting):** Added `darkColors` to TemplateContext (pre-computed in `buildContext()`). Updated shadcn template: `@media (prefers-color-scheme: dark)` + `[data-theme="dark"]` + `.dark`. Added dark mode to generic template: media query + `[data-theme="dark"]`. Updated implementation guide and spec docs. | Phase 5 frameworks |
| 2026-02-06 | 7 | **Phase 5: DaisyUI + AgnosticUI templates.** DaisyUI: `[data-theme="bespoke"]` / `[data-theme="bespoke-dark"]` with hex colors + structural vars. AgnosticUI: semantic token overrides only (`--ag-primary`, `--ag-text-*`, `--ag-background-*`, `--ag-border`, etc.) + `[data-theme="dark"]`. Added `contrastHex` and `rgbCsv` Handlebars helpers. Registered both in TEMPLATE_MAP. All 4 frameworks tested together. | Polish / testing |
| | | | |

### Notes for Next Session

*Update this before ending a session:*

- **Current task:** MVP complete (Phases 0-4). Ready for Phase 5 (DaisyUI/AgnosticUI templates) or Phase 6 (polish/testing/layout content)
- **Blockers:** Only dashboard niche has layout SVGs. Other 8 niches need SVG wireframes before full integration testing.
- **Decisions made:**
  - filter-colors uses 30° hue buckets for diversity selection
  - match-niche falls back to saas/web-app at 0.3 confidence for unrecognized descriptions
  - Typography CSV google_fonts_url column is broken (unquoted commas) — URLs are now constructed dynamically via `buildGoogleFontsUrl()` in `scripts/utils/svg-manipulator.ts`
  - SVG color application uses grayscale fill/stroke replacement (`applyColorsViaGrayscale`) since wireframes have no semantic attributes
  - Palette preview SVGs are purpose-built in code (not based on wireframe SVGs) — 3 template variants: `generateDashboardSVG()`, `generateStorefrontSVG()`, `generateContentSVG()` in `scripts/utils/svg-manipulator.ts`
  - Niche→template mapping: dashboard/saas/fintech/industrial→dashboard, ecommerce/marketing→storefront, blog/portfolio/medical→content (see `NICHE_TEMPLATE_MAP` in svg-manipulator.ts)
  - Phase 3: `Handlebars.create()` for isolated instance; `saturate` helper omitted (not needed by templates); `tailwind.config.ts.hbs` and `components.json.hbs` deferred as lower priority
  - Phase 3: generate-tokens.ts searches all palette directories (palettes, palettes-dashboard, palettes-storefront, palettes-content) to find a palette by ID
  - Phase 4: SKILL.md adapted from spec to match actual script CLI interfaces (spec was aspirational in places)
  - Phase 4: combine-previews.ts typography numbers are 1-based positions in filtered.json, NOT raw typo IDs (bug fix)
  - Phase 4: tsconfig.json updated to include `templates/**/*.ts` in addition to `scripts/**/*.ts`
- **Open questions:** None
- **Deferred (non-blocking for MVP):**
  - `templates/shadcn/tailwind.config.ts.hbs` — Tailwind config template
  - `templates/shadcn/components.json.hbs` — shadcn CLI config
  - Manual verification of generated CSS in a test project
  - Multi-niche integration testing (needs layout SVGs for non-dashboard niches)
- **Backlog (cosmetic, non-blocking):**
  - `deriveChromes()` in `svg-manipulator.ts` — some derived chrome/chromeSubtle tones look off for certain palettes. Tweak HSL math (tintS cap, lightness offsets) and element opacity values. Purely cosmetic, doesn't affect token output.

### Pre-Phase 3 Work (Session 4, 2026-02-06)

Changes made to prepare for Phase 3:

1. **Simplified `generateDashboardSVG()`** in `scripts/utils/svg-manipulator.ts`:
   - Removed 1 sidebar dot (4→3 nav icons)
   - Removed 1 header pill (3→2 header items)
   - Removed 1 chart bar (6→5 bars)
   - Merged bottom card: reduced height 100→76, reduced text lines 4→2

2. **Generated palette previews for all 3 template variants:**
   - Dashboard: `.design-pipeline/palettes-dashboard/` (5 palettes, niche_only filter, all AAA/AA)
   - Storefront: `.design-pipeline/palettes-storefront/` (5 palettes via ecommerce niche, niche_only filter)
   - Content: `.design-pipeline/palettes-content/` (5 palettes via medical niche, exact_match filter)
   - Each directory has `preview.html`, `palettes.json`, and individual SVGs

3. **Created side-by-side comparison page:**
   - `.design-pipeline/palettes-comparison/comparison.html` — 5 palettes × 3 templates in a table
   - SVGs: `pal-{01-05}-{dashboard,ecommerce,medical}.svg`
   - Template wireframe shapes look good across all 3 variants
   - Some derived chrome tones need tuning (noted in backlog)

---

## Quick Commands Reference

```bash
# Phase 0
npm init -y
npm install csv-parse handlebars
npm install -D typescript tsx @types/node

# Test utilities
npx tsx scripts/utils/csv-loader.ts

# Phase 1
npx tsx scripts/match-niche.ts --description "patient portal for telemedicine"
npx tsx scripts/filter-typography.ts --niche medical --count 15

# Phase 2
npx tsx scripts/generate-layouts.ts --niche medical
npx tsx scripts/combine-previews.ts --layouts "1,2,3" --typography "1,2,3"

# Phase 3
npx tsx scripts/generate-tokens.ts --frameworks shadcn,generic

# Validation
npx tsx scripts/test/validate-templates.ts
```

---

## Rollback Points

If you need to restart from a clean state:

1. **Reset pipeline state:** `rm -rf .design-pipeline/*`
2. **Reset to Phase 0:** Delete all scripts, keep specs
3. **Full reset:** `git checkout -- skills/bespoke_design_system/`

---

*Last checkpoint: Phase 4 complete / MVP COMPLETE (2026-02-06) — SKILL.md created, state machine validated, full integration test passed (dashboard niche). Bug fixed in combine-previews.ts typography resolution. Ready for Phase 5 (additional frameworks) or Phase 6 (polish/testing/content).*