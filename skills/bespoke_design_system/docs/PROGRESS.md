# Bespoke Design Pipeline — Progress & Status

> Portable planning doc. Lives in the repo so it follows you across machines.

---

## Pipeline Overview

The Bespoke Design Pipeline is a 6-stage LLM-orchestrated design system generator. An AI skill (SKILL.md) drives the user through niche detection, layout selection, typography, combination preview, color palette, and token generation — all backed by curated data files and deterministic scripts.

---

## Completed Work

### Phase 0: Foundation
- Shared utilities: `scripts/utils/` (state-manager, csv-parser, svg-manipulator, color-conversions)
- Data files: `data/typography.csv`, `data/colors.csv`, `data/niche-taxonomy.json`
- State machine: `.design-pipeline/state.json` with progression, go-back, corruption recovery

### Phase 1: Core Scripts
- `scripts/match-niche.ts` — niche + application_type inference from user description
- `scripts/filter-typography.ts` — typography filtering by niche/application_type
- `scripts/filter-colors.ts` — color palette filtering with fallback strategies

### Phase 2: Preview Generation
- `scripts/generate-layouts.ts` — SVG wireframe selection per niche
- `scripts/apply-typography-to-layout.ts` — HTML specimens with Google Fonts
- `scripts/combine-previews.ts` — 3x3 layout+font combination grid
- `scripts/generate-palette-combinations.ts` — color palettes applied to chosen combo
- `scripts/generate-preview-image.ts` — standalone preview renderer

### Phase 3: Token Output
- Handlebars templates: `templates/{shadcn,generic,daisyui,agnosticui}/`
- Template helpers: `templates/helpers/{color,spacing,string}-helpers.ts`
- `scripts/generate-tokens.ts` — CSS variables, design manifest, implementation guide
- Dark mode: pre-computed for all 4 frameworks

### Phase 4: Orchestration (MVP Complete)
- `SKILL.md` — full orchestration doc for all 6 stages
- State machine validated: progression, go-back (resetToStage), corruption detection
- Full integration test passed (dashboard niche, stages 1-6)

### Phase 5: Additional Frameworks
- DaisyUI: `templates/daisyui/theme.css.hbs`
- AgnosticUI: `templates/agnosticui/design-tokens.css.hbs`

### CLI Installer (`cli/`)
- `bespokeui init [--ai claude|cursor|windsurf|all] [--force]`
- esbuild bundles 7 pipeline scripts + csv-parse + handlebars (zero npm install at runtime)
- CLI bundles as CJS; pipeline scripts stay ESM
- `stripSelfTestPlugin` removes self-test blocks at build time
- Auto-detects AI config dirs; installs to `{configDir}/skills/bespoke-design/`
- `validate.ts` checks 15 required files + layouts dir
- Full e2e tested: install → stages 1-6 → `pipeline_complete: true`

---

## In Progress: Application Type Reasoning Layer

### What
`data/application_type.csv` — a reasoning CSV where each row encodes opinionated, research-derived design rules for a specific product type. The LLM uses the matched row as a persistent context card through all 6 stages.

### Spec
Full spec: `docs/APPLICATION_TYPE_CSV.md`

### CSV Schema (8 columns)
| Column | Purpose |
|--------|---------|
| `application_type` | Display name |
| `keywords` | Comma-separated matching terms |
| `visual_style` | Opinionated design direction |
| `landing_page` | Landing page structure and content strategy |
| `dashboard_layout` | App interface hierarchy and navigation |
| `color_palette` | Color usage rules (not hex values) |
| `essential_ux` | Critical UX considerations and failure modes |
| `ui_style_bias` | Concise visual aesthetic hint (5-12 words) |

### Row Derivation Flow
1. Check `ui-ux-pro-max` products.csv for initial style reference
2. Research established UX thought leadership (NNG, Baymard, Refactoring UI, IxDF)
3. Translate findings into plain-language opinionated rules (senior designer voice)
4. Apply completion test: "Would an LLM following only this row avoid common UX mistakes?"

### Rows Completed (34 of 97)
- [x] SaaS (General)
- [x] Micro SaaS
- [x] E-commerce
- [x] E-commerce Luxury
- [x] Service Landing Page
- [x] Analytics Dashboard
- [x] Healthcare App
- [x] Educational Platform
- [x] Creative Portfolio
- [x] Personal Portfolio
- [x] B2B Service
- [x] Financial Dashboard
- [x] Gaming
- [x] Government/Public Service
- [x] Fintech/Crypto
- [x] Social Media App
- [x] Productivity Tool
- [x] Design System/Component Library
- [x] AI/Chatbot Platform
- [x] NFT/Web3 Platform
- [x] Creator Economy Platform
- [x] Sustainability / ESG Platform
- [x] Remote Work / Collaboration Tool
- [x] Event Management / Ticketing Platform
- [x] Mental Health App (research-verified)
- [x] Pet Tech App (research-verified)
- [x] Smart Home / IoT Dashboard (research-verified)
- [x] EV / Charging Ecosystem (research-verified)
- [x] Subscription Box Service (research-verified)
- [x] Podcast Platform (research-verified)
- [x] Dating App (research-verified)
- [x] Micro-Credentials / Badges Platform (research-verified)
- [x] Knowledge Base / Documentation (research-verified)
- [x] Hyperlocal Services (research-verified)
- [ ] 63 remaining product types (incremental)

### Integration Completed
- [x] CSV created: `data/application_type.csv`
- [x] SKILL.md: "Design Reasoning Reference" section added between Stage 1 and Stage 2
- [x] SKILL.md: Per-stage reasoning instructions added to Stages 2, 3, 4, 5, 6
- [x] SKILL.md: `ui_style_bias` referenced in all relevant stages
- [x] CLI build: CSV auto-included via existing `data/*.csv` glob

### Pending
- [ ] Author remaining 63 product type rows (incremental, per derivation guidelines)

---

## Backlog / Polish

- **Palette derivation tuning**: `deriveChromes()` in `svg-manipulator.ts` — some derived tones look off. Tweak HSL math. Cosmetic only.
- **Layout SVGs**: Only dashboard niche has SVGs. Other 8 niches need wireframes for full testing.

---

## Key Files

| File | Purpose |
|------|---------|
| `SKILL.md` | LLM orchestration doc (the "brain") |
| `data/application_type.csv` | Reasoning layer — product-type-specific design rules |
| `docs/APPLICATION_TYPE_CSV.md` | Spec + derivation guidelines for the CSV |
| `docs/PROGRESS.md` | This file — portable progress tracker |
| `scripts/` | All pipeline scripts |
| `scripts/utils/` | Shared utilities |
| `templates/` | Handlebars templates for token output |
| `cli/` | CLI installer (esbuild bundled) |
| `.design-pipeline/` | Runtime pipeline state + outputs |
