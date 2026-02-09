# The Bespoke Design Pipeline

## Complete Documentation & Implementation Guide v2.0

**Version:** 2.0  
**Last Updated:** February 2026  
**Status:** Ready for Implementation

---

## Executive Summary

The Bespoke Design Pipeline is a deterministic, Unix-philosophy-inspired design system that **eliminates generic "AI slop"** by forcing LLMs to work through discrete, expert-curated decision points rather than generating holistic designs from averaged training data.

### The Three-Layer Deliverable

The pipeline produces a three-layer package that gives developers and LLMs everything needed to build bespoke UI:

1. **Design Tokens** (CSS files) — Framework-ready color, typography, and spacing variables that your build system consumes directly. Available in shadcn/ui, generic CSS, DaisyUI, and AgnosticUI formats.

2. **Layout Blueprint** (`layout-blueprint.svg`) — The chosen spatial wireframe encoding component placement, information hierarchy, and content density. This is the key artifact for LLM-driven UI generation: include it in your prompt so the LLM follows your bespoke spatial logic instead of generic training-data patterns.

3. **Design Brief** (`design_manifest.json` + `IMPLEMENTATION.md`) — The manifest ties tokens and layout together with contrast data, font URLs, and metadata. The implementation guide provides framework-specific setup instructions and a design constraints checklist.

### What This Means For You

These three layers close the gap between "I know what I want" and "my codebase reflects it." You make six interactive design decisions — no design expertise required — and the pipeline hands you production-ready files you can use two ways:

- **Build UI now.** Give the layout blueprint and token file to any AI code editor. Instead of generating generic layouts from training data, the LLM follows your specific spatial logic and brand colors from the first commit.

- **Kickstart a design system.** The same tokens, manifest, and blueprint serve as a formal specification. Import the CSS into Storybook, hand the manifest to a designer, or extend the tokens into a component library. The pipeline gives you the hardest part — coherent, niche-appropriate foundations — so you start with substance, not a blank canvas.

### The Core Innovation

**Declarative Selection > Generative Hallucination**

The pipeline replaces vague prompting ("make it look modern") with logical, sequential selection from curated datasets ("select from niche-specific layouts, then choose from niche-appropriate font pairings").

### Hybrid Architecture

The system combines:

- **Skill-based orchestration** (markdown instructions for LLMs)
- **CSV databases** (human-curated design knowledge)
- **TypeScript scripts** (deterministic data access layer)
- **Stateful workflow** (progressive refinement across conversation turns)

### Target Users

Developers using AI-powered code editors:

- Cursor
- Claude Code Pro or Desktop
- VS Code + Copilot
- Codex
- Windsurf
- Any environment with LLM access to filesystem

### Environment Requirements

**Required:**

- Node.js 18+ (for TypeScript scripts)
- File system access (read/write to workspace)
- CSV files and SVG templates

**For Inline Previews (Recommended):**

- Code editor with built-in HTML preview (Cursor, Windsurf, VS Code)
- OR: Any browser for opening generated HTML preview files

---

## Table of Contents

1. [Vision & Philosophy](#vision--philosophy)
2. [System Architecture](#system-architecture)
3. [Workflow Overview](#workflow-overview)
4. [Niche Taxonomy](#niche-taxonomy)
5. [CSV Data Structure](#csv-data-structure)
6. [Directory Structure](#directory-structure)
7. [Script Specifications](#script-specifications)
8. [Pipeline Data Flow](#pipeline-data-flow)
9. [Framework Integration](#framework-integration)
10. [Implementation Guide](#implementation-guide)
11. [Usage Examples](#usage-examples)
12. [Success Metrics](#success-metrics)
13. [Maintenance & Evolution](#maintenance--evolution)
14. [Appendix: Design Decisions](#appendix-design-decisions)
15. [Migration Checklist](#migration-checklist)

---

## Vision & Philosophy

### Problem Statement

Current AI-generated designs suffer from:

1. **Generic aesthetics** due to LLM training on averaged design patterns
   - Every app looks the same (rounded corners, gradient buttons, generic spacing)
   - No consideration of domain-specific needs
   - Training data bias toward popular frameworks

2. **Inconsistent execution** when LLMs try to solve design and coding simultaneously
   - Implementation drift from design vision
   - Framework defaults override design intent
   - No preservation of spatial relationships

3. **No design intent preservation** across iterations
   - Regeneration produces completely different results
   - No way to version design decisions
   - Lost rationale for choices

4. **Framework drift** where implementation diverges from design
   - Tailwind defaults override custom spacing
   - Component libraries impose their aesthetics
   - Generic color schemes replace bespoke palettes

### Core Principles

1. **Discrete Decision Points**
   - Each stage operates in isolation, producing structured artifacts
   - No holistic "design everything at once" approach
   - Clear separation of concerns

2. **Expert Curation**
   - All design options come from human-maintained CSV databases
   - Designers curate knowledge without touching code
   - No LLM hallucination of design choices

3. **Deterministic Results** (Stages 2–6)
   - Same inputs always produce same outputs from curated data
   - Versionable design decisions
   - Reproducible across environments
   - *Note:* Stage 1 (niche matching) uses LLM reasoning, so results may vary slightly between runs. All subsequent stages are fully deterministic.

4. **Progressive Refinement**
   - 3→3→(3×3)→1 narrowing funnel
   - Users make informed choices at each stage
   - Visual previews enable confident decisions

5. **Framework Agnostic**
   - Design decisions separate from implementation
   - Multi-format output (shadcn, DaisyUI, AgnosticUI, generic CSS)
   - Easy framework migration; new profiles can be added

---

## System Architecture

### Three-Layer Architecture

```
┌─────────────────────────────────────────────┐
│   Layer 1: SKILL.md                          │
│   (LLM Orchestration Instructions)          │
│   - Understands user intent                 │
│   - Calls TypeScript scripts                │
│   - Presents options to users               │
│   - Updates state                           │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│   Layer 2: TypeScript Scripts               │
│   (Deterministic Data Access)               │
│   - Queries CSV databases                   │
│   - Filters by niche taxonomy               │
│   - Generates previews                      │
│   - Produces structured JSON                │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│   Layer 3: CSV Databases                    │
│   (Curated Design Knowledge)                │
│   - Niche-tagged typography                 │
│   - Application-specific colors             │
│   - Framework mappings                      │
│   - Layout metadata                         │
│   - Contraints metadata                     │
└─────────────────────────────────────────────┘
```

### Why This Architecture?

**1. LLM as Pure Orchestrator**

The LLM never "invents" design choices—it only:

- Calls scripts with parameters
- Parses JSON output
- Presents options to users
- Updates state.json

**2. Humans Curate Design Knowledge**

Designers maintain CSVs without touching code:

- Add new font pairings
- Create color palettes
- Tag assets with niches
- Document rationale

**3. Scripts Ensure Determinism**

Same inputs guarantee same outputs:

- No temperature-induced variation
- Testable transformations
- Debuggable with stack traces
- Fast execution (no LLM latency)

**4. Skills Enable Modularity**

Each stage can be:

- Run independently
- Rerun without side effects
- Extended with new stages
- Versioned separately

---

## Workflow Overview

### The 3→3→(3×3)→1 Progressive Refinement Flow

```
User Description
      ↓
[1. Understand Problem] → Identify niche + application_type
      ↓
[2. Generate Layouts] → Up to 15 options → User selects 3
      ↓
[3. Select Typography] → Up to 15 options → User selects 3
      ↓
[4. Combine Previews] → 9 full combinations (3 layouts × 3 fonts)
      ↓                      User selects 1
[5. Apply Palette] → 5 color variations
      ↓                User selects final
[6. Generate Tokens] → Multi-format design system
```

### State Management

The pipeline maintains a stateful workflow through `state.json`, enabling:

- Progressive refinement across conversation turns
- Ability to rerun individual stages
- Versionable design decisions (commit to git)
- Clear audit trail of choices

**State Structure:**

```json
{
  "pipeline_version": "1.0",
  "current_stage": "typography_selection",
  "completed_stages": ["understand_problem", "wireframe_selection"],
  "inferred_niche": "saas",
  "application_type": "project-management",
  "selected_layouts": ["option-03", "option-08", "option-12"],
  "selected_typography": ["typo-02", "typo-09", "typo-14"],
  "final_combination": {
    "layout": "option-08",
    "typography": "typo-09",
    "palette": "palette-saas-02"
  },
  "timestamp": "2026-02-04T10:30:00Z"
}
```

### Key Features

- **Deterministic Filtering**: Same input always produces same results
- **Granular Matching**: Both broad (niche) and specific (application_type) filtering
- **Flexible Asset Tagging**: Assets can serve multiple niches
- **Maintainable**: Human-readable CSVs, easy to curate
- **Scalable**: Add new niches/types without restructuring
- **Visual Previews**: See real fonts and colors in context before committing

---

## System Architecture

### The Six-Stage Pipeline

```
Stage 1: Understand Problem (match-niche.ts)
    ↓ Outputs: { niche_id, application_type, confidence }
    ↓ Stored in: .design-pipeline/state.json
    ↓
Stage 2: Wireframe Selection (generate-layouts.ts)
    ↓ Filters: layouts/[niche_id]/*.svg
    ↓ Returns: Up to 15 layout options → User selects 3
    ↓
Stage 3: Typography Selection (filter-typography.ts + apply-typography-to-layout.ts)
    ↓ Queries: typography.csv WHERE niche_id AND application_type match
    ↓ Returns: Up to 15 font pairings → User selects 3
    ↓
Stage 4: Combination Preview (combine-previews.ts)
    ↓ Generates: 3×3 layout+font combinations → User selects 1
    ↓
Stage 5: Palette Application (generate-palette-combinations.ts)
    ↓ Queries: colors.csv WHERE niche_id AND application_type match
    ↓ Returns: 5 color variations → User selects 1
    ↓
Stage 6: Token Generation (generate-tokens.ts)
    ↓ Outputs: CSS tokens, design manifest, implementation guide
```

---

## Niche Taxonomy

The system uses **15 primary niches**, each with specific **application types**. This two-level taxonomy enables precise filtering.

### Primary Niches

| niche_id      | Niche Name            | Description                                                             |
| ------------- | --------------------- | ----------------------------------------------------------------------- |
| `dashboard`   | Dashboard/Admin       | Data-heavy interfaces focused on metrics, analytics, and management     |
| `marketing`   | Marketing/Landing     | Conversion-focused pages with hero sections and clear CTAs              |
| `saas`        | SaaS Product          | Application interfaces with persistent navigation and complex workflows |
| `blog`        | Blog/Content          | Reading-focused layouts with strong typography and content hierarchy    |
| `ecommerce`   | E-commerce            | Product-focused layouts optimized for browsing and purchasing           |
| `portfolio`   | Portfolio/Creative    | Visual showcase layouts emphasizing imagery and creative work           |
| `medical`     | Medical/Healthcare    | Patient-focused interfaces requiring clarity and trust                  |
| `fintech`     | Fintech/Trading       | Financial interfaces requiring precision and data density               |
| `industrial`  | Industrial/IoT        | Control panels and monitoring interfaces for industrial systems         |
| `education`   | Education/LMS         | Learning platforms, course catalogs, and student dashboards             |
| `realestate`  | Real Estate           | Property listings, agent portals, and neighborhood exploration          |
| `social`      | Social/Community      | Social networks, forums, and community-driven platforms                 |
| `food`        | Food/Restaurant       | Menus, online ordering, reservations, and food delivery                 |
| `travel`      | Travel/Booking        | Trip planning, accommodation booking, and itinerary management          |
| `nonprofit`   | Non-profit/Government | Mission-driven organizations, donation flows, and public services       |

### Application Types (Examples)

Each niche has 5-10 specific application types:

**SaaS:**

- `web-app` - General web application
- `productivity-tool` - Task/project management
- `crm` - Customer relationship management
- `collaboration` - Team communication tools

**E-commerce:**

- `storefront` - Main product browsing
- `product-grid` - Product listing pages
- `marketplace` - Multi-vendor platforms
- `checkout-flow` - Payment/cart interfaces

**Dashboard:**

- `analytics` - Data visualization dashboards
- `monitoring` - System/server monitoring
- `metrics` - KPI tracking interfaces

Full taxonomy available in: `data/niche-taxonomy.json`

---

## CSV Data Structure

### Restructured Format

Both `typography.csv` and `colors.csv` now include niche-based columns for filtering.

#### Typography CSV

**Column Order:**

```
No, niche_id, application_types, Font Pairing Name, Category, Heading Font, Body Font,
Mood/Style Keywords, Best For, Google Fonts URL, CSS Import, Tailwind Config, Notes
```

**Example Row:**

```csv
3,saas;ecommerce,web-app;productivity-tool;storefront;product-grid,Modern Professional,Sans + Sans,Inter,Roboto,clean modern professional,SaaS dashboards and e-commerce,https://fonts.google.com/specimen/Inter,...
```

#### Colors CSV

**Column Order:**

```
No, niche_id, application_types, Product Type, Primary (Hex), Secondary (Hex), CTA (Hex),
Background (Hex), Text (Hex), Border (Hex), Notes
```

**Example Row:**

```csv
15,saas;dashboard,web-app;analytics;productivity-tool,SaaS Blue,#0369A1,#0EA5E9,#F97316,#F8FAFC,#0F172A,#E2E8F0,Professional blue scheme
```

### Key Column Details

#### Column 2: `niche_id` (Required)

- Primary categorization
- Can contain **multiple values** separated by `;`
- Example: `saas;ecommerce` (asset serves both niches)

#### Column 3: `application_types` (Optional but Recommended)

- Specific sub-categories within niches
- Can contain **multiple values** separated by `;`
- Example: `web-app;productivity-tool;storefront`
- Enables granular filtering

### Multi-Value Matching

A row with:

```csv
3,saas;ecommerce,web-app;storefront;product-grid,...
```

Will match queries for:

- `niche_id: "saas"` AND `application_type: "web-app"`
- `niche_id: "saas"` AND `application_type: "storefront"`
- `niche_id: "ecommerce"` AND `application_type: "storefront"`
- `niche_id: "ecommerce"` AND `application_type: "product-grid"`

---

## Directory Structure

```
<workspace_root>/
│
├── skills/
│   └── bespoke_design_system/
│       │
│       ├── SKILL.md                              # Main orchestrator skill
│       │
│       ├── data/
│       │   ├── niche-taxonomy.json               # ⭐ Source of truth for niches
│       │   ├── typography.csv                    # ⭐ Restructured with niche_id columns
│       │   ├── colors.csv                        # ⭐ Restructured with niche_id columns
│       │   ├── layout_templates.csv              # Metadata about SVG layouts (optional)
│       │   └── design-tokens.csv                 # Semantic token definitions (future)
│       │
│       ├── layouts/                              # ⭐ Pre-generated SVG wireframes
│       │   ├── dashboard/                        # ✅ 8 layouts complete
│       │   │   ├── dashboard_sidebar-metrics-grid_01.svg
│       │   │   ├── dashboard_topnav-chart-panels_02.svg
│       │   │   ├── dashboard_sidebar-table-detail_03.svg
│       │   │   ├── dashboard_fullwidth-stacked_04.svg
│       │   │   ├── dashboard_analytics-timeline_05.svg
│       │   │   ├── dashboard_kanban-board_06.svg
│       │   │   ├── dashboard_calendar-schedule_07.svg
│       │   │   └── dashboard_email-messaging_08.svg
│       │   │
│       │   ├── marketing/                        # 📝 TODO: 12-15 layouts
│       │   ├── saas/                             # 📝 TODO: 12-15 layouts
│       │   ├── blog/                             # 📝 TODO: 12-15 layouts
│       │   ├── ecommerce/                        # 📝 TODO: 12-15 layouts
│       │   ├── portfolio/                        # 📝 TODO: 12-15 layouts
│       │   ├── medical/                          # 📝 TODO: 12-15 layouts
│       │   ├── fintech/                          # 📝 TODO: 12-15 layouts
│       │   ├── industrial/                       # 📝 TODO: 12-15 layouts
│       │   ├── education/                        # 📝 TODO: 12-15 layouts
│       │   ├── realestate/                       # 📝 TODO: 12-15 layouts
│       │   ├── social/                           # 📝 TODO: 12-15 layouts
│       │   ├── food/                             # 📝 TODO: 12-15 layouts
│       │   ├── travel/                           # 📝 TODO: 12-15 layouts
│       │   └── nonprofit/                        # 📝 TODO: 12-15 layouts
│       │
│       ├── scripts/
│       │   ├── match-niche.ts                    # Stage 1: Identify niche & application_type
│       │   ├── generate-layouts.ts               # Stage 2: Filter layouts by niche_id
│       │   ├── filter-typography.ts              # Stage 3: Filter fonts by niche + type
│       │   ├── apply-typography-to-layout.ts     # Stage 3a: Apply fonts to layouts
│       │   ├── combine-previews.ts               # Stage 4: Create combinations
│       │   ├── generate-palette-combinations.ts  # Stage 4a: Apply colors
│       │   ├── generate-tokens.ts                # Stage 6: Generate design tokens
│       │   │
│       │   ├── utils/
│       │   │   ├── csv-loader.ts                 # CSV parsing utility
│       │   │   ├── color-conversions.ts          # Color format conversions
│       │   │   └── svg-manipulator.ts            # SVG editing utilities
│       │   │
│       │   └── examples/
│       │       └── example-queries.ts            # Demo filtering logic
│       │
│       ├── templates/
│       │   ├── generic/
│       │   │   └── design-tokens.css.hbs         # Generic CSS template
│       │   ├── shadcn/
│       │   │   └── globals.css.hbs               # shadcn/ui CSS template
│       │   ├── daisyui/
│       │   │   └── theme.css.hbs                 # DaisyUI CSS template
│       │   ├── agnosticui/
│       │   │   └── design-tokens.css.hbs         # AgnosticUI CSS template
│       │   └── helpers/                          # Handlebars template helpers
│       │
│       └── docs/
│           ├── SVG_WIREFRAME_GENERATION_GUIDE.md # How to create layouts
│           ├── DELIVERABLES_SUMMARY.md           # System overview
│           └── NICHE_TAXONOMY_REFERENCE.md       # Complete niche reference
│
├── .design-pipeline/                             # ⚠️ Generated artifacts (gitignored)
│   ├── state.json                                # ⭐ Contains niche_id & application_type
│   ├── layouts/
│   │   ├── option-01.svg                         # Layout choices (count varies by niche)
│   │   └── preview.html                          # Interactive HTML preview
│   ├── typography/
│   │   ├── preview-01.html                       # Font specimen previews
│   │   └── preview.html                          # Interactive HTML preview
│   ├── combinations/
│   │   ├── combo-01.html                         # 3×3 combos
│   │   └── preview.html                          # Interactive HTML preview
│   ├── palettes/
│   │   ├── palette-preview-01.html               # Color variations
│   │   └── preview.html                          # Interactive HTML preview
│   ├── tokens/
│   │   ├── layout-blueprint.svg                  # Spatial wireframe for LLM UI generation
│   │   ├── design-tokens.css                     # Generic CSS custom properties
│   │   ├── shadcn-globals.css                    # shadcn/ui HSL theme
│   │   ├── daisyui-theme.css                     # DaisyUI theme
│   │   ├── agnosticui-tokens.css                 # AgnosticUI tokens
│   │   ├── design_manifest.json                  # Complete design system spec
│   │   └── IMPLEMENTATION.md                     # Integration guide
│
└── package.json
```

### Key Directory Purposes

#### `data/` - Static Design Knowledge

- Human-curated CSVs and taxonomy
- **Never modified by pipeline** (read-only reference data)

#### `layouts/` - SVG Wireframe Library

- Organized by `niche_id` subdirectories
- Naming: `{niche}_{description}_{number}.svg`
- Target: 12-15 layouts per niche; currently 8 dashboard layouts, other niches pending

#### `scripts/` - Pipeline Logic

- TypeScript modules for each stage
- Deterministic data access layer
- **Must use columns 2 & 3** from restructured CSVs

#### `.design-pipeline/` - Runtime Artifacts

- Generated during user workflow
- **Gitignored** (ephemeral session data)
- Contains `state.json` with inferred niche info

---

## Script Specifications

### Stage 1: match-niche.ts

**Purpose:** Analyze user description and identify niche + application type

**Input:**

```typescript
{
  description: string; // User's project description
}
```

**Output:**

```json
{
  "niche_id": "saas",
  "application_type": "project-management",
  "confidence": 0.94,
  "reasoning": "Keywords match SaaS domain with project management focus",
  "alternative_niches": [{ "niche_id": "dashboard", "confidence": 0.72 }]
}
```

**Logic:**

1. Tokenize user description
2. Match keywords against niche taxonomy
3. Identify primary niche (highest confidence)
4. Identify specific application_type within niche
5. Return structured classification

### Stage 2: generate-layouts.ts

**Purpose:** Filter and return SVG layouts matching the niche

**Input:**

```typescript
{
  niche_id: string;     // From state.json
  count?: number;       // Default 15
}
```

**Output:**

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
  "preview_html": ".design-pipeline/layouts/preview.html"
}
```

**Logic:**

1. Read `niche_id` from state.json
2. List all SVG files in `layouts/{niche_id}/`
3. Copy up to 15 to `.design-pipeline/layouts/`
4. Generate interactive HTML preview grid
5. Return structured file list

**Preview Generation:**

- **HTML Preview**: Interactive grid with click selection
- **Individual SVGs**: Each layout as separate file

### Stage 3: filter-typography.ts

**Purpose:** Query typography.csv and return niche-appropriate fonts

**Input:**

```typescript
{
  niche_id: string;
  application_type?: string;
  count?: number;  // Default 15
}
```

**Output:**

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
      "css_import": "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Roboto:wght@400;500&display=swap');",
      "tailwind_config": "fontFamily: { heading: ['Inter', 'sans-serif'], body: ['Roboto', 'sans-serif'] }"
    }
  ],
  "preview_html": ".design-pipeline/typography/preview.html"
}
```

**Logic:**

1. Parse typography.csv
2. Filter rows where column[1] (niche_id) contains input niche_id
3. If application_type provided, refine where column[2] contains it
4. Return up to 15 matching font pairings
5. Fallback to niche-only if application_type yields too few results

### Stage 3 (continued): apply-typography-to-layout.ts

**Purpose:** Generate visual previews of layouts with fonts applied

**Input:**

```typescript
{
  selected_layouts: string[];  // IDs from user selection (e.g., ["2", "7", "11"])
  typography: object[];        // Filtered font options
}
```

**Output:**

```json
{
  "previews": [
    {
      "layout_id": "dashboard_sidebar-metrics-grid_01",
      "typography_id": "typo-003",
      "preview_path": ".design-pipeline/typography/preview-layout01-font03.svg"
    }
  ],
  "preview_html": ".design-pipeline/typography/preview.html"
}
```

**Logic:**

1. For each selected layout (3)
2. For each font pairing (filtered set)
3. Generate HTML specimen with Google Fonts `<link>` tags
4. Show font samples in context of selected layouts
5. Save to typography/ directory

**Preview Notes:**

- HTML imports actual Google Fonts for accurate rendering
- Since SVGs have no text nodes, font previews use HTML specimens rather than SVG manipulation
- Each preview shows font name and sample text in context

### Stage 4: combine-previews.ts

**Purpose:** Create 3×3 matrix of layout+font combinations

**Input:**

```typescript
{
  selected_layouts: string[];     // 3 layouts (e.g., ["2", "7", "11"])
  selected_typography: string[];  // 3 fonts (e.g., ["4", "9", "13"])
}
```

**Output:**

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
  "preview_html": ".design-pipeline/combinations/preview.html"
}
```

**Logic:**

1. Generate 9 combinations (3 layouts × 3 fonts)
2. Apply fonts to layouts with Google Fonts imports
3. Save to combinations/ directory
4. Create interactive HTML grid with click selection

### Stage 5: generate-palette-combinations.ts

**Purpose:** Apply 5 color variations to selected combination

**Input:**

```typescript
{
  final_combination: string;   // Selected combo ID (e.g., "5" or "combo-05")
  niche_id: string;
  application_type?: string;
}
```

**Output:**

```json
{
  "palettes": [
    {
      "id": "palette-01",
      "name": "Professional Blue",
      "primary": "#0369A1",
      "secondary": "#0EA5E9",
      "cta": "#F97316",
      "background": "#F8FAFC",
      "text": "#0F172A",
      "border": "#E2E8F0",
      "preview_path": ".design-pipeline/palettes/variation-01.svg",
      "contrast_ratios": {
        "text_on_background": "16.2:1",
        "cta_on_background": "4.8:1"
      }
    }
  ],
  "preview_html": ".design-pipeline/palettes/preview.html"
}
```

**Logic:**

1. Parse colors.csv
2. Filter by niche_id and application_type (same as typography)
3. Select 5 palettes
4. Apply each palette to final combination via grayscale replacement
5. Calculate and validate contrast ratios
6. Generate HTML previews with color swatches

### Stage 6: generate-tokens.ts

**Purpose:** Generate multi-format design system tokens

**Input:**

```typescript
{
  final_selection: {
    layout: string;        // e.g., "option-02"
    typography: string;    // e.g., "typo-04"
    palette: string;       // e.g., "palette-01"
  };
  target_frameworks: string[];  // ['shadcn', 'daisyui', 'generic']
}
```

**Output:**

```json
{
  "layout": ".design-pipeline/tokens/layout-blueprint.svg",
  "tokens": {
    "generic_css": ".design-pipeline/tokens/design-tokens.css",
    "shadcn_css": ".design-pipeline/tokens/shadcn-globals.css",
    "daisyui_css": ".design-pipeline/tokens/daisyui-theme.css",
    "agnosticui_css": ".design-pipeline/tokens/agnosticui-tokens.css"
  },
  "manifest": ".design-pipeline/tokens/design_manifest.json",
  "implementation_guide": ".design-pipeline/tokens/IMPLEMENTATION.md"
}
```

**Logic:**

1. Load selected typography + palette data from CSV
2. Extract layout spatial coordinates
3. For each target framework:
   - Load framework profile CSV
   - Map generic tokens to framework-specific names
   - Render Handlebars template
   - Save to tokens/ directory
4. Generate design_manifest.json with complete specs
5. Create IMPLEMENTATION.md with framework-specific instructions

---

## User Interaction Model

### How File Previews Work

The pipeline generates **interactive HTML previews** at each stage. The LLM orchestrator presents options and collects user selections.

#### In AI Code Editors (Claude Code, Cursor, Windsurf)

```
Claude: [Calls generate-layouts.ts]
        [Script generates SVGs + preview.html]

"I've generated layout options in .design-pipeline/layouts/

Files created:
- preview.html (interactive grid)
- option-01.svg through option-08.svg

You can open preview.html in the preview pane to see all options.

Which 3 layouts best match your vision? (e.g., 1, 5, 7)"
```

**Key Points:**

- Generated files appear in file explorer automatically
- User can preview HTML in split view (editor's preview pane)
- Chat stays open in sidebar
- User types selection back into chat

### Interactive HTML Preview Features

```html
<!-- .design-pipeline/layouts/preview.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>Select 3 Layouts - Medical Applications</title>
    <style>
      .grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        padding: 20px;
      }
      .card {
        cursor: pointer;
        border: 3px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px;
        transition: all 0.2s;
      }
      .card:hover {
        border-color: #0ea5e9;
        transform: scale(1.02);
      }
      .card.selected {
        border-color: #0369a1;
        background: #f0f9ff;
      }
      .card img {
        width: 100%;
        height: auto;
        display: block;
      }
      .card-label {
        margin-top: 8px;
        font-weight: 600;
        color: #0f172a;
      }
      #selection-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        border-top: 2px solid #e2e8f0;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    </style>
  </head>
  <body>
    <h1>Select 3 Layouts for Medical Patient Portal</h1>
    <p>
      Click on 3 layouts that best match your vision. Selected layouts will be
      highlighted.
    </p>

    <div class="grid" id="layoutGrid">
      <div class="card" data-id="1" data-name="Sidebar + Metrics Grid">
        <img src="option-01.svg" alt="Layout 1" />
        <div class="card-label">1. Sidebar + Metrics Grid</div>
      </div>
      <!-- ... 14 more cards ... -->
    </div>

    <div id="selection-bar">
      <div>
        <strong>Selected:</strong>
        <span id="selectedDisplay">None (select 3)</span>
      </div>
      <div>
        <button id="copyBtn" disabled onclick="copySelection()">
          Copy to Clipboard
        </button>
        <button id="saveBtn" disabled onclick="saveSelection()">
          Save Selection
        </button>
      </div>
    </div>

    <script>
      let selected = [];
      const maxSelection = 3;

      document.querySelectorAll(".card").forEach((card) => {
        card.addEventListener("click", () => {
          const id = card.dataset.id;

          if (selected.includes(id)) {
            // Deselect
            selected = selected.filter((x) => x !== id);
            card.classList.remove("selected");
          } else if (selected.length < maxSelection) {
            // Select
            selected.push(id);
            card.classList.add("selected");
          } else {
            // Max reached
            alert(
              `You can only select ${maxSelection} layouts. Deselect one first.`,
            );
            return;
          }

          updateDisplay();
        });
      });

      function updateDisplay() {
        const display = document.getElementById("selectedDisplay");
        const copyBtn = document.getElementById("copyBtn");
        const saveBtn = document.getElementById("saveBtn");

        if (selected.length === 0) {
          display.textContent = "None (select 3)";
          copyBtn.disabled = true;
          saveBtn.disabled = true;
        } else {
          display.textContent = selected.join(", ");
          copyBtn.disabled = selected.length !== maxSelection;
          saveBtn.disabled = selected.length !== maxSelection;
        }
      }

      function copySelection() {
        if (selected.length !== maxSelection) return;

        navigator.clipboard
          .writeText(selected.join(", "))
          .then(() => {
            alert(
              "✓ Copied to clipboard: " +
                selected.join(", ") +
                "\n\nPaste this into the chat!",
            );
          })
          .catch((err) => {
            // Fallback for browsers without clipboard API
            const textarea = document.createElement("textarea");
            textarea.value = selected.join(", ");
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            alert("✓ Copied: " + selected.join(", "));
          });
      }

      function saveSelection() {
        if (selected.length !== maxSelection) return;

        // Save to file that pipeline can read
        const data = {
          stage: "layout_selection",
          selected: selected,
          timestamp: new Date().toISOString(),
        };

        // This works in environments with file system access (Electron-based editors)
        try {
          const fs = require("fs");
          fs.writeFileSync(
            ".design-pipeline/layout-selection.json",
            JSON.stringify(data, null, 2),
          );
          alert(
            '✓ Selection saved to .design-pipeline/layout-selection.json\n\nReturn to chat and type "done"',
          );
        } catch (e) {
          // Fallback: just copy to clipboard
          copySelection();
        }
      }
    </script>
  </body>
</html>
```

### Recommended Workflow Pattern

**Best Practice for All Environments:**

1. **Generate HTML Preview**

   ```typescript
   // In each stage script
   return {
     items: [...],
     preview_html: 'preview.html'
   };
   ```

2. **LLM Directs User to Preview**

   ```
   Claude: "I've generated the options. Open preview.html to see them.

            Which 3 do you prefer?"
   ```

3. **Accept Simple Text Input**

   ```
   User: "2, 7, 11"

   Claude: [Parses with regex: /\d+/g]
   ```

4. **Validate and Confirm**
   ```
   Claude: "You selected:
            - Layout 2: Sidebar + Metrics Grid
            - Layout 7: Calendar Schedule
            - Layout 11: Patient Records View

            Correct? (yes/no)"
   ```

This approach works across **all environments** without requiring complex file round-trips.

---

## Pipeline Data Flow

### Stage 1: Understand Problem

**Script:** `match-niche.ts`

**Input:** User description (e.g., "I need a project management dashboard")

**Output:**

```json
{
  "niche_id": "saas",
  "application_type": "project-management",
  "confidence": 0.94,
  "reasoning": "Keywords match SaaS domain with project management focus"
}
```

**Storage:** Saved to `.design-pipeline/state.json`

### Stage 2: Generate Layouts

**Script:** `generate-layouts.ts`

**Query:**

```bash
# Read niche_id from state.json
niche_id="saas"

# Filter layouts directory
ls layouts/saas/*.svg
```

**Result:** Up to 15 layout options specific to SaaS applications

### Stage 3: Filter Typography

**Script:** `filter-typography.ts`

**Filtering Strategy:**

```typescript
// Priority 1: Exact Match (niche_id AND application_type)
const exactMatches = typography.filter((row) => {
  const niches = row[1].split(";"); // Column 2: niche_id
  const appTypes = row[2].split(";"); // Column 3: application_types

  return niches.includes("saas") && appTypes.includes("project-management");
});

// Priority 2: Niche Match (niche_id only)
const nicheMatches = typography.filter((row) => {
  const niches = row[1].split(";");
  return niches.includes("saas");
});

// Select up to 15 fonts
const finalSelection =
  exactMatches.length >= 15
    ? exactMatches.slice(0, 15)
    : nicheMatches.slice(0, 15);
```

**Result:** Up to 15 font pairings appropriate for SaaS/project-management

### Stage 4a: Generate Palette Combinations

**Script:** `generate-palette-combinations.ts`

**Filtering Strategy:**

```typescript
// Primary filter: niche_id
const nicheMatches = colors.filter((row) => {
  const niches = row[1].split(";");
  return niches.includes("saas");
});

// Secondary filter: application_type
const appMatches = nicheMatches.filter((row) => {
  const appTypes = row[2].split(";");
  return appTypes.includes("project-management");
});

// Select 5 color palettes
const palettes =
  appMatches.length >= 5 ? appMatches.slice(0, 5) : nicheMatches.slice(0, 5);
```

**Result:** 5 color palettes appropriate for SaaS project management

### State JSON Structure

```json
{
  "pipeline_version": "1.0",
  "current_stage": "typography_selection",
  "completed_stages": ["understand_problem", "wireframe_selection"],
  "inferred_niche": "saas",
  "application_type": "project-management",
  "selected_layouts": ["option-03", "option-08", "option-12"],
  "selected_typography": ["typo-02", "typo-09", "typo-14"],
  "final_combination": {
    "layout": "option-08",
    "typography": "typo-09",
    "palette": "palette-saas-02"
  }
}
```

---

## Framework Integration

The pipeline supports multiple UI frameworks and component libraries through a **framework profile system**. Each profile maps generic design tokens to framework-specific naming conventions.

### Supported Frameworks

#### Core Frameworks

**shadcn/ui**

- Template: `templates/shadcn/globals.css.hbs`
- Output: `shadcn-globals.css` — HSL CSS variables with light + dark mode
- Integrates with Tailwind's theme extension

**DaisyUI**

- Template: `templates/daisyui/theme.css.hbs`
- Output: `daisyui-theme.css` — DaisyUI theme as CSS variables
- Uses `[data-theme="bespoke"]` / `[data-theme="bespoke-dark"]`

**AgnosticUI**

- Template: `templates/agnosticui/design-tokens.css.hbs`
- Output: `agnosticui-tokens.css` — Semantic token overrides
- Uses `:where(html)` + `[data-theme="dark"]`

**Generic CSS**

- Template: `templates/generic/design-tokens.css.hbs`
- Output: `design-tokens.css` — Standard CSS custom properties (hex/RGB/HSL)
- Use case: Custom design systems, vanilla CSS, any framework

### Framework Profile Structure

**Example: shadcn-profile.csv**

```csv
generic_token,shadcn_token,category,notes
primary,--primary,color,Main brand color
secondary,--secondary,color,Secondary brand color
background,--background,color,Page background
foreground,--foreground,color,Text color
card,--card,color,Card background
border,--border,color,Border color
heading-font,--font-heading,typography,Heading font family
body-font,--font-sans,typography,Body text font
```

### Token Mapping Flow

```
Generic Design Tokens
      ↓
[Load Framework Profile CSV]
      ↓
[Map Generic → Framework-Specific]
      ↓
[Render Handlebars Template]
      ↓
Framework-Specific Output
```

**Example Transformation:**

```css
/* Generic Input */
--color-primary: #0369a1;
--font-heading: "Inter", sans-serif;

/* shadcn Output */
:root {
  --primary: 199 89% 48%;
  --font-heading: "Inter", sans-serif;
}

/* DaisyUI Output */
[data-theme="custom"] {
  --p: 199 89% 48%;
  --pf: 199 89% 38%;
}
```

### Adding New Framework Support

1. **Create Profile CSV**

   ```bash
   cp data/framework-profiles/shadcn-profile.csv \
      data/framework-profiles/my-framework-profile.csv
   ```

2. **Define Token Mappings**

   ```csv
   generic_token,my_framework_token,category,notes
   primary,--theme-primary,color,Primary brand color
   ```

3. **Create Handlebars Template**

   ```handlebars
   /* My Framework Theme */ .theme { --theme-primary:
   {{primary}}; --theme-font:
   {{headingFont}}; }
   ```

4. **Update generate-tokens.ts**

   ```typescript
   const frameworks = ["shadcn", "daisyui", "my-framework"];
   ```

5. **Test Output**
   ```bash
   npm run generate-tokens -- --frameworks=my-framework
   ```

### Framework-Specific Considerations

**shadcn/ui:**

- Requires HSL color format: `199 89% 48%`
- Uses CSS variables with `--` prefix
- Integrates with Tailwind's theme extension

**DaisyUI:**

- Uses custom theme names: `[data-theme="custom"]`
- Requires primary/focus color variants
- Component-specific tokens (btn-_, input-_)

**AgnosticUI:**

- Semantic token overrides only (no primitive color scales)
- `:where(html)` selector for low specificity
- `[data-theme="dark"]` for dark mode

### Output File Locations

```
.design-pipeline/tokens/
├── layout-blueprint.svg           # Spatial wireframe for LLM UI generation
├── design-tokens.css              # Generic CSS custom properties
├── shadcn-globals.css              # shadcn/ui HSL theme
├── daisyui-theme.css              # DaisyUI theme
├── agnosticui-tokens.css          # AgnosticUI tokens
├── design_manifest.json           # Complete design specifications
└── IMPLEMENTATION.md              # Integration guide
```

---

## Implementation Guide

### Step 1: Create Directory Structure

```bash
cd <workspace_root>

# Create main directories
mkdir -p skills/bespoke_design_system/{data,scripts/{utils,examples},templates,docs}

# Create layout directories for all niches
mkdir -p skills/bespoke_design_system/layouts/{dashboard,marketing,saas,blog,ecommerce,portfolio,medical,fintech,industrial,education,realestate,social,food,travel,nonprofit}

# Create pipeline output directories
mkdir -p .design-pipeline/{layouts,typography,combinations,palettes,tokens}
```

### Step 2: Copy Data Files

```bash
cd skills/bespoke_design_system/data/

# Copy taxonomy and restructured CSVs
cp /path/to/niche-taxonomy.json ./
cp /path/to/typography-restructured.csv ./typography.csv
cp /path/to/colors-restructured.csv ./colors.csv
```

### Step 3: Copy Layout Files

```bash
cd skills/bespoke_design_system/layouts/dashboard/

# Copy 8 existing dashboard layouts
cp /path/to/dashboard_*.svg ./
```

### Step 4: Copy Documentation

```bash
cd skills/bespoke_design_system/docs/

cp /path/to/SVG_WIREFRAME_GENERATION_GUIDE.md ./
cp /path/to/DELIVERABLES_SUMMARY.md ./
```

### Step 5: Update Scripts

#### `filter-typography.ts` - OLD vs NEW

**OLD (Column 7: "Best For"):**

```typescript
const matches = rows.filter((r) => r[7].includes("SaaS"));
```

**NEW (Columns 2 & 3: niche_id, application_types):**

```typescript
const matches = rows.filter((r) => {
  const niches = r[1].split(";");
  const appTypes = r[2].split(";");

  return (
    niches.includes(nicheId) && (appType ? appTypes.includes(appType) : true)
  );
});
```

#### `generate-palette-combinations.ts` - Same Pattern

```typescript
const nicheMatches = colors.filter((r) => {
  const niches = r[1].split(";");
  return niches.includes(state.inferred_niche);
});

const appMatches = nicheMatches.filter((r) => {
  const appTypes = r[2].split(";");
  return appTypes.includes(state.application_type);
});
```

#### `match-niche.ts` - Return Both Values

```typescript
// Must return BOTH niche_id AND application_type
return {
  niche_id: "saas", // ⭐ Primary category
  application_type: "project-management", // ⭐ Specific type
  confidence: 0.94,
  reasoning: "User description indicates SaaS project management tool",
};
```

### Step 6: Initialize State

```bash
cd .design-pipeline/

cat > state.json << 'EOF'
{
  "pipeline_version": "1.0",
  "current_stage": "understand_problem",
  "completed_stages": []
}
EOF
```

### Step 7: Install Dependencies

```bash
cd skills/bespoke_design_system/

# Initialize package.json if not exists
npm init -y

# Install required dependencies
npm install --save \
  csv-parse \
  handlebars

# Install dev dependencies
npm install --save-dev \
  @types/node \
  typescript \
  tsx
```

**Dependencies Explained:**

- **csv-parse**: Parse CSV files into structured data
- **handlebars**: Template engine for generating tokens
- **typescript**: TypeScript compiler
- **tsx**: Run TypeScript scripts directly

---

## Usage Examples

### Complete Workflow Examples

> **Note:** These examples are illustrative. Actual options, counts, and output depend on the niche matched and assets available in the curated CSV databases.

#### Example 1: Healthcare Patient Portal

**User Input:**

```
User: "I need a patient portal for a telemedicine app.
      Patients should be able to view appointments, medical records,
      and message their doctors."
```

**Stage 1: Understand Problem**

```
Claude: [Calls match-niche.ts]

"I've analyzed your requirements:

 Niche: Medical/Healthcare
 Application Type: patient-portal
 Confidence: 96%

 This will use healthcare-specific layouts optimized for clarity and trust.
 Let's start with layout selection."
```

**Stage 2: Generate Layouts**

```
Claude: [Calls generate-layouts.ts with niche_id="medical"]
        [Shows medical-specific layouts]

"Here are the patient portal layouts.
 These prioritize:
 - High contrast for readability
 - Clear appointment scheduling interfaces
 - HIPAA-compliant information hierarchy

 Which 3 layouts best match your vision?"
```

**User Selection:** "1, 7, 12"

**Stage 3: Select Typography**

```
Claude: [Calls filter-typography.ts with niche_id="medical",
         application_type="patient-portal"]
        [Shows healthcare-appropriate fonts]

"Here are font pairings for healthcare applications:

 All selections:
 - Meet AAA contrast requirements
 - Use clinical, trustworthy typefaces
 - Avoid decorative fonts

 I'm showing these as actual rendered previews in your layouts.
 Which 3 work best?"
```

**User Selection:** "2, 9, 14"

**Stage 4: Combine Previews**

```
Claude: [Calls combine-previews.ts]
        [Generates 9 combinations: 3 layouts × 3 fonts]
        [Shows interactive preview grid]

"Here are all 9 combinations of your selected layouts and typography.
 Each preview shows how the fonts actually look in the layout context.

 Which single combination best represents your vision?"
```

**User Selection:** "5"

**Stage 5: Apply Color Palette**

```
Claude: [Calls generate-palette-combinations.ts with
         niche_id="medical", application_type="patient-portal"]
        [Applies 5 healthcare-appropriate color schemes]

"Here are 5 color variations of your selected combination:

 1. Clinical Blue (trust, professionalism)
 2. Wellness Green (health, vitality)
 3. Calm Lavender (stress reduction)
 4. Warm Amber (comfort, care)
 5. Neutral Gray (accessibility, clarity)

 All palettes meet WCAG AAA standards for medical interfaces.
 Which color scheme do you prefer?"
```

**User Selection:** "2 (Wellness Green)"

**Stage 6: Generate Tokens**

```
Claude: [Calls generate-tokens.ts]
        [Generates design system in multiple formats]

"✅ Healthcare patient portal design system complete!

Key Features:
- Source Sans Pro + Lora (clinical readability)
- Wellness Green palette (WCAG AAA compliant)
- High-density layout for medical data
- All frameworks: shadcn, DaisyUI, AgnosticUI, generic CSS

Files generated:
📁 .design-pipeline/tokens/
  ├── layout-blueprint.svg           ← Spatial wireframe for LLM UI generation
  ├── design-tokens.css              ← Generic CSS variables
  ├── shadcn-globals.css              ← shadcn/ui theme
  ├── daisyui-theme.css              ← DaisyUI theme
  ├── agnosticui-tokens.css          ← AgnosticUI tokens
  ├── design_manifest.json           ← Complete specifications
  └── IMPLEMENTATION.md              ← Integration guide

See IMPLEMENTATION.md for integration instructions."
```

---

#### Example 2: Fintech Trading Dashboard

**User Input:**

```
User: "Real-time crypto trading dashboard with charts,
      order book, and portfolio tracking"
```

**Condensed Flow:**

**Stage 1:**

```json
{
  "niche_id": "fintech",
  "application_type": "trading-dashboard",
  "confidence": 0.98
}
```

**Stage 2:** Up to 15 fintech-specific layouts

- Dense information architecture
- Multi-panel layouts for data streams
- Optimized for 1440p+ screens

**User selects:** 3 high-density layouts

**Stage 3:** Up to 15 fintech-appropriate fonts

- Monospace options for numeric precision
- Tabular number support
- High legibility at small sizes

**User selects:** 3 fonts including IBM Plex Mono

**Stage 4:** 9 combinations → User selects dense layout + IBM Plex Mono

**Stage 5:** 5 color palettes

- Dark mode optimized
- Green/red status indicators
- High contrast for readability

**User selects:** Dark theme with semantic status colors

**Output:**

```
✅ Fintech trading dashboard design system ready!

Key Features:
- IBM Plex Mono for precise numeric display
- High-density layout for maximum data visibility
- Semantic green/red status colors (AA contrast compliant)
- Dark mode optimized for extended viewing
- All frameworks supported

Integration: See IMPLEMENTATION.md
```

---

#### Example 3: SaaS Project Management Tool

**User Input:**

```
User: "Team collaboration tool for managing projects,
      tasks, and team communication"
```

**Stage 1 Output:**

```json
{
  "niche_id": "saas",
  "application_type": "productivity-tool",
  "confidence": 0.94
}
```

**Pipeline Execution:**

1. **Layouts:** Filters `layouts/saas/*.svg`
   - Returns project-management-optimized layouts
   - Kanban boards, list views, calendar views

2. **Typography:** Filters typography.csv

   ```
   WHERE niche_id CONTAINS 'saas'
   AND application_types CONTAINS 'productivity-tool'
   ```

   - Returns professional, modern font pairings
   - Sans-serif focused for screen readability

3. **Colors:** Filters colors.csv (same logic)
   - Returns SaaS-appropriate palettes
   - Professional blues, productivity greens
   - Strong CTA colors for engagement

**User Flow:**

- Selects: Kanban layout + Inter/Roboto fonts + Professional Blue palette
- Receives: Complete design system in 4 formats (shadcn, DaisyUI, AgnosticUI, generic)
- Integration time: < 5 minutes

---

### Conversation Flow Example

> **Note:** These examples are illustrative. Actual output depends on available layouts for the matched niche and the specific assets in the curated CSV databases.

**Typical LLM Interaction:**

```
User: "I need a design for a medical appointment booking system"

Claude: [Calls match-niche.ts]

        "I've identified this as a Medical/Healthcare application,
         specifically a 'patient-portal' type.

         Let me generate layouts optimized for healthcare interfaces...

         [Calls generate-layouts.ts]
         [Generates SVGs + preview.html]

         I've generated layout options in .design-pipeline/layouts/
         Open preview.html to see all options side by side.

         These layouts prioritize:
         • Clear appointment scheduling flows
         • High contrast for accessibility (WCAG AAA)
         • Trustworthy information hierarchy

         Which 3 layouts best match your vision?"

User: "2, 5, 7"

Claude: [Updates state.json with selections]
        [Calls filter-typography.ts]
        [Calls apply-typography-to-layout.ts]

        "Great choices! Now let's select typography.

         Open .design-pipeline/typography/preview.html to see font pairings
         applied to your selected layouts.

         All options meet AAA contrast requirements for healthcare.

         Which 3 font pairings work best?"

User: "1, 4, 6"

Claude: [Calls combine-previews.ts]

        "I've generated all 9 combinations (3 layouts × 3 fonts).
         Open .design-pipeline/combinations/preview.html to compare.

         Which single combination best represents your vision? (1-9)"

User: "5"

Claude: [Calls generate-palette-combinations.ts with niche_id="medical"]

        "Here are 5 color variations. See .design-pipeline/palettes/preview.html

         All palettes are WCAG AAA compliant.

         Which color scheme resonates with your brand? (1-5)"

User: "2"

Claude: [Calls generate-tokens.ts with all selections]

        "Your medical appointment booking design system is ready!

         Generated Files:
         📁 .design-pipeline/tokens/
           ├── layout-blueprint.svg      (Spatial wireframe for LLM UI generation)
           ├── design-tokens.css         (Generic CSS variables)
           ├── shadcn-globals.css        (shadcn/ui theme)
           ├── daisyui-theme.css         (DaisyUI theme)
           ├── agnosticui-tokens.css     (AgnosticUI tokens)
           ├── design_manifest.json      (Complete specs)
           └── IMPLEMENTATION.md         (Integration guide)

         See IMPLEMENTATION.md for step-by-step setup."
```

---

### Edge Cases & Variations

> **Note:** These edge case examples are illustrative of how the LLM orchestrator should handle ambiguous input.

#### Ambiguous Description

**User:** "I need a website"

**Claude Response:**

```
"I need more context to provide the best design system.

 What type of website are you building?

 Common categories:
 • Marketing/Landing page - Conversion-focused
 • Blog/Content site - Reading-focused
 • E-commerce store - Product browsing
 • SaaS application - Tool interface
 • Portfolio/showcase - Visual presentation
 • Dashboard/admin - Data management

 Or describe the main purpose and I'll categorize it for you."
```

#### Low Confidence Match

**User:** "Blockchain NFT marketplace with social features"

**Claude Response:**

```
[match-niche.ts returns confidence: 0.62]

"I'm detecting elements of both 'ecommerce' and 'portfolio' niches,
 but with lower confidence (62%).

 This could be approached as:
 1. E-commerce (marketplace focus) - Product grids, checkout flows
 2. Portfolio (NFT showcase) - Visual galleries, creator profiles

 Which aspect is more important for your users?"
```

#### Framework-Specific Request

**User:** "Give me only the shadcn/ui theme"

**Claude Response:**

```
[In Stage 6, only generates shadcn outputs]

"Generated shadcn/ui theme:

 📁 .design-pipeline/tokens/
   └── shadcn-globals.css

 To use:
 1. Copy shadcn-globals.css to your project
 2. Import in your root layout

 Need other frameworks? Let me know."
```

---

## Success Metrics

The pipeline successfully "kills AI slop" when it achieves these qualitative and quantitative goals:

### Qualitative Metrics

#### 1. ✅ Bespoke Spatial Relationships

**What This Means:**

- Generated layouts use coordinate systems not found in generic templates
- Layouts respect niche-specific density constraints
- Whitespace ratios match application requirements

**How to Measure:**

- Layout coordinates should NOT match common framework defaults (e.g., no "padding: 1rem" everywhere)
- Spacing values derived from niche constraints (medical: spacious, fintech: dense)
- No grid systems copied from Bootstrap/Tailwind defaults

**Example Pass:**

```svg
<!-- ✅ Bespoke: Custom spacing for medical readability -->
<rect x="120" y="180" width="660" height="480" />
<!-- Top margin: 180px for breathing room -->
<!-- Content width: 660px for optimal reading line length -->
```

**Example Fail:**

```svg
<!-- ❌ Generic: Standard 16px padding everywhere -->
<rect x="16" y="16" width="calc(100% - 32px)" />
```

#### 2. ✅ Niche-Appropriate Typography

**What This Means:**

- Font pairings match domain needs
- Rationale documented for each selection
- No generic "Roboto + Open Sans" defaults

**How to Measure:**

- Medical apps use clinical typefaces (Source Sans Pro, Merriweather)
- Fintech uses tabular fonts (IBM Plex Mono)
- Creative portfolios use distinctive pairings (Playfair Display + Raleway)

**Example Pass:**

```
Healthcare App:
- Heading: Source Sans Pro (clinical, accessible)
- Body: Lora (readable, trustworthy)
- Rationale: AAA contrast, proven medical UI readability
```

**Example Fail:**

```
Healthcare App:
- Heading: Montserrat (generic)
- Body: Roboto (generic)
- Rationale: "Modern and clean"
```

#### 3. ✅ Accessible Color Systems

**What This Means:**

- Color palettes meet or exceed WCAG standards for niche
- Status colors appropriate to domain
- Contrast ratios documented and tested

**How to Measure:**

- Healthcare: AAA contrast (4.5:1 for normal text, 7:1 for large text)
- Trading platforms: Semantic green/red with AA contrast
- All applications: Border colors meet 3:1 minimum

**Example Pass:**

```
Medical Palette:
- Text on Background: #0F172A on #F8FAFC (16.2:1 - AAA ✓)
- Primary CTA: #10B981 on white (3.8:1 - AA Large ✓)
- Emergency Red: #DC2626 (tested for colorblind safety)
```

**Example Fail:**

```
Medical Palette:
- Text on Background: #666 on #EEE (2.8:1 - FAIL)
- CTA: #5BCEFA on white (1.9:1 - FAIL)
```

#### 4. ✅ Faithful Implementation

**What This Means:**

- Final code matches blueprint coordinates exactly
- No framework-imposed drift
- Typography CSS imports match selections precisely

**How to Measure:**

- Generated CSS tokens map 1:1 to design choices
- Tailwind config preserves spacing system
- No framework defaults override design intent

**Example Pass:**

```css
/* Design System */
--spacing-section-gap: 180px;
--font-heading: "Source Sans Pro", sans-serif;

/* Rendered Component */
section {
  margin-top: 180px;
}
h1 {
  font-family: "Source Sans Pro", sans-serif;
}
```

**Example Fail:**

```css
/* Design System */
--spacing-section-gap: 180px;

/* Rendered Component (Tailwind default overriding) */
section {
  margin-top: 96px;
} /* Tailwind's mt-24 = 96px */
```

#### 5. ✅ Visual Typography/Color Previews

**What This Means:**

- Users see real fonts rendered in context
- Full-context combinations show layout + typography + colors together
- Color swatches visualize palette relationships

**How to Measure:**

- Typography stage shows actual font rendering (not just names)
- Combination stage shows complete context
- Color variations show all palette tokens applied

**Example Pass:**

- Stage 3: SVG previews with actual Google Fonts imported and rendered
- Stage 4: Interactive HTML grid with live font rendering
- Stage 5: Full-color SVG showing all palette tokens in use

**Example Fail:**

- Stage 3: Text list of font names without previews
- Stage 4: Wireframes with placeholder text
- Stage 5: Color swatches without context

---

### Quantitative Metrics

#### 6. ✅ Reduced Iteration Time

**Target:**

- Concept to tokens: < 15 minutes
- Re-running individual stages: < 2 minutes
- Zero manual CSS variable writing

**How to Measure:**

- Time stage 1-6 complete workflow
- Log script execution times
- Count user interactions required

**Benchmark:**

- Traditional prompting: 1-3 hours of trial-and-error
- Bespoke Pipeline: 10-15 minutes of informed selection

#### 7. ✅ Deterministic Outputs

**Target:**

- 100% reproducibility: Same inputs = identical outputs
- Zero temperature-induced variation
- Versionable design decisions (state.json committable to git)

**How to Measure:**

- Run pipeline twice with identical inputs
- Compare generated files byte-for-byte
- Verify state.json is git-friendly (no timestamps in critical data)

**Example Test:**

```bash
# Run 1
npm run bespoke-pipeline -- --niche=medical --app-type=patient-portal

# Run 2 (same inputs)
npm run bespoke-pipeline -- --niche=medical --app-type=patient-portal

# Compare
diff .design-pipeline/tokens/shadcn-globals.css run1/shadcn-globals.css
# Expected: No differences (except timestamps in comments)
```

---

### User Satisfaction Indicators

#### 8. ✅ Design Intent Preservation

**What This Means:**

- Users can articulate design rationale from CSV data
- Designers can maintain/extend CSVs without developer help
- Non-designers understand constraint reasoning

**How to Measure:**

- CSV comments clearly explain "why" behind choices
- Design decisions traceable to niche requirements
- Maintenance doesn't require code changes

**Example Pass:**

```csv
# typography.csv
3,medical,patient-portal,Clinical Serif,Serif + Sans,Source Sans Pro,Lora,
clinical accessible trustworthy,Healthcare interfaces requiring AAA contrast,
https://fonts.google.com/specimen/Source+Sans+Pro,
"Source Sans Pro chosen for clinical readability studies. Lora provides warmth
while maintaining medical professionalism. Both fonts tested for dyslexia
accessibility."
```

#### 9. ✅ Framework Flexibility

**What This Means:**

- Users successfully switch frameworks without redesign
- Community contributes new framework profiles
- Generic tokens work in custom design systems

**How to Measure:**

- Number of framework profiles in repository
- User reports of successful framework migration
- Community PR activity

**Success Indicators:**

- 4 framework profiles supported (extensible)
- Users switch from shadcn → DaisyUI without design changes
- Generic CSS tokens integrate with custom build systems

#### 10. ✅ UI Library Integration

**What This Means:**

- Generated configs work immediately with modern UI libraries
- No manual theming or documentation reading required
- Bespoke colors automatically applied to component libraries

**How to Measure:**

- shadcn/ui components render correctly with generated theme
- DaisyUI components use custom palette without modification
- AgnosticUI components adopt bespoke tokens

**Example Pass:**

```tsx
// shadcn Button component
import { Button } from "@/components/ui/button";

// Works immediately with generated theme
<Button>Book Appointment</Button>;
// Renders with bespoke primary color, no customization needed
```

---

### Anti-Patterns to Avoid

The pipeline FAILS if outputs exhibit these "AI slop" characteristics:

#### ❌ Generic Spacing

- All margins/padding in multiples of 8px or 16px
- No consideration of niche-specific density needs
- Cookie-cutter grid systems

#### ❌ Averaged Typography

- Roboto, Open Sans, Inter as default fallbacks
- No rationale beyond "modern and clean"
- Same fonts across all niches

#### ❌ Framework Default Colors

- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Danger: Red (#EF4444)
- No niche-specific reasoning

#### ❌ Implementation Drift

- Tailwind defaults override design tokens
- Framework CSS has higher specificity
- Manual overrides required to match design

#### ❌ Non-Deterministic Results

- Re-running produces different outputs
- LLM temperature affects generation
- Can't reproduce exact design system

---

### Success Dashboard

Track these metrics to ensure quality:

| Metric                      | Target                         | Measurement                    |
| --------------------------- | ------------------------------ | ------------------------------ |
| **Bespoke Coordinates**     | >80% non-standard values       | Analyze generated SVG layouts  |
| **Niche-Appropriate Fonts** | 100% match niche requirements  | Review typography CSV mappings |
| **WCAG Compliance**         | AAA for medical, AA for others | Automated contrast testing     |
| **Iteration Time**          | <15 min concept→tokens         | User workflow timing           |
| **Reproducibility**         | 100% identical outputs         | Automated diff testing         |
| **Framework Support**       | 4+ frameworks                  | Count profile CSVs             |
| **Community Contributions** | 2+ PRs per quarter             | GitHub activity                |

---

## Maintenance & Evolution

### Example 1: Dashboard Analytics

**User Input:** "I need an analytics dashboard for tracking website metrics"

**Stage 1 Output:**

```json
{
  "niche_id": "dashboard",
  "application_type": "analytics",
  "confidence": 0.96
}
```

**Typography Query:**

```typescript
// Pseudo-SQL representation
SELECT * FROM typography
WHERE niche_id CONTAINS 'dashboard'
  AND (application_types CONTAINS 'analytics' OR application_types IS NULL)
LIMIT 15
```

**Color Query:**

```typescript
SELECT * FROM colors
WHERE niche_id CONTAINS 'dashboard'
  AND (application_types CONTAINS 'analytics' OR application_types IS NULL)
LIMIT 5
```

**Result:**

- Up to 15 dashboard-specific layouts
- Up to 15 font pairings (data-focused, professional)
- 5 color palettes (blues, grays, trust-building)

### Example 2: E-commerce Fashion

**User Input:** "Online clothing store with product galleries"

**Stage 1 Output:**

```json
{
  "niche_id": "ecommerce",
  "application_type": "storefront",
  "confidence": 0.92
}
```

**Result:**

- Layouts: `ecommerce_product-gallery_*.svg`
- Fonts tagged: `ecommerce;storefront` or `ecommerce;product-grid`
- Colors: Fashion-appropriate palettes with strong CTAs

### Example 3: SaaS Project Management

**User Input:** "Task management app for remote teams"

**Stage 1 Output:**

```json
{
  "niche_id": "saas",
  "application_type": "productivity-tool",
  "confidence": 0.89
}
```

**Filtered Assets:**

**Typography:**

```csv
3,saas;dashboard,web-app;productivity-tool;analytics,Modern Clean,...
17,saas,productivity-tool;collaboration,Team Workspace,...
42,saas;ecommerce,web-app;productivity-tool,Professional Sans,...
```

**Colors:**

```csv
15,saas;dashboard,web-app;productivity-tool,SaaS Blue,...
28,saas,productivity-tool;crm,Productivity Green,...
```

---

## Migration Checklist

### Infrastructure

- [ ] Create complete directory structure
- [ ] Copy `niche-taxonomy.json` to `data/`
- [ ] Replace `typography.csv` with restructured version
- [ ] Replace `colors.csv` with restructured version
- [ ] Copy 8 dashboard layouts to `layouts/dashboard/`
- [ ] Copy documentation to `docs/`

### Script Updates

- [ ] Update `filter-typography.ts` to use columns 2 & 3
- [ ] Update `generate-palette-combinations.ts` to use columns 2 & 3
- [ ] Update `match-niche.ts` to return both `niche_id` and `application_type`
- [ ] Update `state.json` schema to include both fields
- [ ] Add error handling for missing niche/type combinations

### Testing

- [ ] Test Stage 1: Niche matching returns correct values
- [ ] Test Stage 2: Layout filtering works for all 15 niches
- [ ] Test Stage 3: Typography filtering returns expected results
- [ ] Test Stage 4a: Color filtering returns 5 palettes
- [ ] Test complete pipeline end-to-end with sample inputs
- [ ] Verify fallback behavior when exact matches < required count

### Content Creation

- [ ] Generate 12-15 layouts for `marketing/`
- [ ] Generate 12-15 layouts for `saas/`
- [ ] Generate 12-15 layouts for `blog/`
- [ ] Generate 12-15 layouts for `ecommerce/`
- [ ] Generate 12-15 layouts for `portfolio/`
- [ ] Generate 12-15 layouts for `medical/`
- [ ] Generate 12-15 layouts for `fintech/`
- [ ] Generate 12-15 layouts for `industrial/`
- [ ] Generate 12-15 layouts for `education/`
- [ ] Generate 12-15 layouts for `realestate/`
- [ ] Generate 12-15 layouts for `social/`
- [ ] Generate 12-15 layouts for `food/`
- [ ] Generate 12-15 layouts for `travel/`
- [ ] Generate 12-15 layouts for `nonprofit/`
- [ ] Add 4-7 more layouts to `dashboard/` (currently 8, target 12-15)
- [ ] Review and refine automatic niche assignments in CSVs
- [ ] Add metadata to `layout_templates.csv` (optional)

### Quality Assurance

- [ ] Manual review of all niche assignments in `typography.csv`
- [ ] Manual review of all niche assignments in `colors.csv`
- [ ] Verify multi-niche assets (`;` separated) are tagged correctly
- [ ] Test edge cases (generic requests, ambiguous descriptions)
- [ ] Verify color accessibility (contrast ratios)
- [ ] Check font licensing compatibility

### Maintenance & Evolution

#### CSV Database Updates

**Frequency:** Quarterly review or as frameworks release major versions

**Process:**

1. **Check Framework Changelogs**
   - Review shadcn/ui, DaisyUI, AgnosticUI updates
   - Note breaking changes in token naming
   - Identify new component patterns

2. **Update Relevant Profile CSV**

   ```csv
   # Example: shadcn v2.0 changes
   # Old: --primary
   # New: --primary-500
   generic_token,shadcn_token_v2,category,notes
   primary,--primary-500,color,Updated for v2.0 color system
   ```

3. **Bump Version in CSV Header**

   ```csv
   # shadcn-profile.csv
   # Version: 2.0
   # Last Updated: 2026-02-04
   # Breaking Changes: Primary color token renamed
   ```

4. **Regenerate Test Outputs**

   ```bash
   npm run test:generate-tokens -- --framework=shadcn
   npm run test:validate-output
   ```

5. **Document Breaking Changes**
   - Update CHANGELOG.md
   - Add migration guide to docs/
   - Notify users via release notes

#### Community Contributions

**Encouraged Contributions:**

1. **New Niche Profiles**
   - E-commerce subcategories (fashion, electronics, groceries)
   - Gaming interfaces (MMO, FPS, mobile)
   - Education platforms (LMS, course sites)
   - Real estate (listings, property management)

2. **New Framework Profiles**
   - Material-UI (MUI)
   - Chakra UI
   - Ant Design
   - Mantine
   - Park UI

3. **New UI Library Profiles**
   - Community-requested libraries
   - Emerging frameworks
   - Specialized component sets

4. **Additional Layout Templates**
   - More variations per niche (target: 20+ per niche)
   - Responsive variations
   - Mobile-first layouts

5. **Font Pairing Recommendations**
   - More Google Fonts combinations
   - Self-hosted font options
   - Variable font support

**Contribution Guidelines:**

1. **Include Rationale**

   ```csv
   # Example typography contribution
   42,ecommerce,storefront,Luxury Fashion,Serif + Sans,Playfair Display,Montserrat,
   elegant luxury high-end,High-end fashion storefronts,
   https://fonts.google.com/specimen/Playfair+Display,
   "Playfair Display evokes luxury editorial design. Montserrat provides clean
   product descriptions. Pairing tested on luxury brand sites. Contrast ratio:
   4.8:1 on white backgrounds."
   ```

2. **Provide Example Output**
   - Screenshots of generated design
   - Live demo URLs if possible
   - Before/after comparisons

3. **Test Against Real Projects**
   - Verify framework integration works
   - Test responsive behavior
   - Confirm accessibility standards

4. **Document Accessibility Considerations**
   ```csv
   # Color palette contribution
   28,medical,telehealth,Telehealth Blue,#0369A1,#0EA5E9,#10B981,#F8FAFC,#0F172A,#E2E8F0,
   "WCAG AAA compliant. Primary/background: 12.8:1. Tested with colorblind
   simulators. Green CTA chosen over blue to differentiate from info elements."
   ```

#### Future Enhancements

**Phase 2 (Post-MVP):**

1. **Component Library Mapping**
   - Auto-map layout coordinates to AgnosticUI/Radix/shadcn components
   - Generate component scaffolding
   - Semantic HTML structure from wireframes

2. **A/B Testing**
   - Generate multiple complete systems for comparison
   - Side-by-side preview mode
   - User preference tracking

3. **Figma Export**
   - Convert design tokens to Figma variables
   - Export layouts as Figma frames
   - Two-way sync (Figma ↔ Pipeline)

4. **Version Control**
   - Track design system evolution across projects
   - Compare versions (diff visualization)
   - Rollback to previous states

**Phase 3 (Advanced):**

1. **ML-Enhanced Matching**
   - Use embeddings for better niche detection
   - Learn from user corrections
   - Confidence score improvements

2. **Dynamic Template Generation**
   - Parametric SVG generation from constraints
   - Procedural layout variations
   - Constraint-based design rules

3. **Real-time Collaboration**
   - Multiple designers refining same pipeline
   - Live preview synchronization
   - Comment/annotation system

4. **Component Generation**
   - Auto-generate React/Vue/Svelte components from tokens
   - Props derived from design system
   - Storybook integration

#### Versioning Strategy

**Design System Versions:**

```
v1.0.0 - Initial release
  ├── 15 niches
  ├── 4 framework profiles (shadcn, DaisyUI, AgnosticUI, generic)
  └── 8 dashboard layout templates (more niches in progress)

v1.1.0 - Incremental improvements
  ├── Layout SVGs for additional niches
  ├── More layout variations per niche
  └── Bug fixes

v2.0.0 - Breaking changes
  ├── Restructured CSV schema
  ├── New taxonomy system
  └── Migration guide provided
```

**Framework Profile Versions:**

```
shadcn-profile-v1.csv  → Compatible with shadcn/ui v0.x
shadcn-profile-v2.csv  → Compatible with shadcn/ui v1.x
```

#### Quality Assurance Process

**Before Merging Contributions:**

1. **CSV Validation**

   ```bash
   npm run validate:csv -- typography.csv
   # Checks: column count, required fields, valid niche_ids
   ```

2. **Token Generation Test**

   ```bash
   npm run test:generate -- --niche=medical --app-type=patient-portal
   # Verifies: all frameworks generate successfully
   ```

3. **Accessibility Audit**

   ```bash
   npm run audit:a11y -- .design-pipeline/tokens/
   # Checks: contrast ratios, color vision deficiency
   ```

4. **Visual Regression**
   ```bash
   npm run test:visual-regression
   # Compares: new layouts vs baseline screenshots
   ```

#### Deprecation Policy

**When Removing Features:**

1. **Announce Deprecation** (1 quarter before removal)

   ```
   # DEPRECATION NOTICE
   ## v1.5.0 (2026-05-01)

   The following will be removed in v2.0.0 (2026-08-01):
   - Old `niche_profiles.csv` format (replaced by `niche-taxonomy.json`)
   - DaisyUI v2.x support (upgrade to v3.x)

   Migration guide: docs/MIGRATION_v2.md
   ```

2. **Provide Migration Path**
   - Automated migration scripts if possible
   - Clear documentation
   - Example before/after code

3. **Maintain Compatibility Layer** (during transition)
   - Support both old and new formats temporarily
   - Log warnings when using deprecated features

4. **Remove Cleanly**
   - Delete deprecated code
   - Update all documentation
   - Add entry to CHANGELOG.md

---

## Appendix: Design Decisions

### Adding a Font Pairing

1. **Determine primary `niche_id`** (required)
   - Choose from: `dashboard`, `marketing`, `saas`, `blog`, `ecommerce`, `portfolio`, `medical`, `fintech`, `industrial`, `education`, `realestate`, `social`, `food`, `travel`, `nonprofit`
   - Can assign multiple: `saas;dashboard`

2. **List relevant `application_types`** (optional but recommended)
   - Reference `niche-taxonomy.json` for valid types
   - Can assign multiple: `web-app;productivity-tool`

3. **Add row to `typography.csv`**

```csv
140,saas;dashboard,web-app;productivity-tool;analytics;monitoring,Modern Data,Sans + Mono,IBM Plex Sans,IBM Plex Mono,technical precise data-focused,Data dashboards and SaaS analytics,...
```

### Adding a Color Palette

Same process:

```csv
160,medical;saas,patient-portal;wellness-app;health-dashboard,Healthcare Modern,#0369A1,#0EA5E9,#10B981,#F8FAFC,#0F172A,#E2E8F0,Trustworthy healthcare palette with calming blues
```

### Adding a Layout

1. Create SVG following wireframe guidelines
2. Save to appropriate niche directory: `layouts/{niche_id}/{niche}_{description}_{number}.svg`
3. Optionally add metadata to `layout_templates.csv`

**Example:**

```
layouts/fintech/fintech_trading-dashboard_01.svg
```

---

## Appendix: Design Decisions

### Why Primitive Shapes Over Complex Paths?

**The Problem with Path-Based Wireframes:**

1. **LLM Reasoning Difficulty**
   - LLMs struggle to reason about bezier curves and complex path data
   - Path coordinates are opaque: `M100 100H800V700H100V100Z` vs `x="100" width="700"`
   - Semantic meaning lost in mathematical notation

2. **Parametric Variation Challenges**
   - Requires mathematical path manipulation (error-prone)
   - Scaling, repositioning requires path parsing
   - No simple arithmetic on coordinates

3. **Designer Editability**
   - Designers can't easily understand or modify path coordinates
   - Copy-paste from design tools produces non-semantic paths
   - Manual editing requires specialized knowledge

4. **Enables Generic Patterns**
   - Easy to copy paths from design tools
   - Encourages "AI slop" (copying existing designs)
   - No forcing function for bespoke coordinates

**The Primitive Shapes Solution:**

1. **Spatial Reasoning**
   - `<rect x="100" width="700">` is semantically clear
   - Coordinates explicitly define spatial relationships
   - Human and LLM readable

2. **Parametric Control**
   - Simple arithmetic on coordinates: `x + 20`, `width * 1.15`
   - Easy to generate variations programmatically
   - Constraint-based layout rules possible

3. **Human Readability**
   - Designers can edit coordinates directly
   - No specialized SVG knowledge required
   - Version control diffs are meaningful

4. **Prevents Slop**
   - Forces system to calculate layout math
   - Can't copy generic patterns directly
   - Encourages bespoke spatial design

**Implementation Rules:**

```xml
<!-- ✅ PREFER: Primitive shapes -->
<rect x="100" y="100" width="700" height="600" fill="white" />
<circle cx="450" cy="400" r="50" fill="#0369A1" />
<line x1="100" y1="200" x2="800" y2="200" stroke="#E2E8F0" />

<!-- ⚠️ LIMIT: Paths only for rounded corners or complex icons -->
<path d="M100 100 Q150 50, 200 100" fill="none" stroke="#333" />
<!-- Acceptable: bezier curve that can't be done with primitives -->

<!-- ❌ AVOID: Paths for rectangles or straight lines -->
<path d="M100 100H800V700H100V100Z" fill="white" />
<!-- This should be <rect> -->

<!-- ✅ BETTER: Rect with rounded corners -->
<rect x="100" y="100" width="700" height="600" rx="12" fill="white" />
```

**Quality Metrics:**

| Template Quality | Primitive % | Path % | Notes                          |
| ---------------- | ----------- | ------ | ------------------------------ |
| Excellent        | >90%        | <10%   | Optimal for reasoning          |
| Good             | >80%        | <20%   | Acceptable                     |
| Warning          | >50%        | <50%   | Review recommended             |
| Poor             | <50%        | >50%   | Likely copied from design tool |

**Validation Script:**

```typescript
// scripts/utils/validate-svg.ts
function analyzeTemplate(svgContent: string) {
  const primitives = (svgContent.match(/<rect|<circle|<line/g) || []).length;
  const paths = (svgContent.match(/<path/g) || []).length;
  const total = primitives + paths;

  const primitiveRatio = primitives / total;

  if (primitiveRatio < 0.5) {
    console.warn("⚠️ Template uses >50% paths - consider simplifying");
  }

  return { primitives, paths, ratio: primitiveRatio };
}
```

---

### Why CSV Over JSON?

**Decision Rationale:**

1. **Human Editability**
   - Non-developers can maintain design knowledge
   - Designers comfortable with spreadsheets
   - No syntax errors from missing commas/brackets

2. **Diff-Friendly**
   - Git diffs show exactly what changed
   - Line-by-line comparison
   - Conflict resolution easier

3. **Spreadsheet Compatibility**
   - Open in Excel/Google Sheets for bulk editing
   - Sort, filter, search capabilities
   - Collaborative editing without code knowledge

4. **Simplicity**
   - No nested structures to navigate
   - Flat data model matches mental model
   - Easy to validate (column count, required fields)

**Comparison:**

```csv
# CSV: Easy to scan, edit, and diff
No,niche_id,application_types,Font Pairing Name,Heading Font,Body Font
3,saas;ecommerce,web-app;storefront,Modern Clean,Inter,Roboto
```

```json
// JSON: More verbose, error-prone for non-developers
{
  "typography": [
    {
      "no": 3,
      "niche_id": ["saas", "ecommerce"],
      "application_types": ["web-app", "storefront"],
      "pairing_name": "Modern Clean",
      "heading_font": "Inter",
      "body_font": "Roboto"
    }
  ]
}
```

**Trade-offs Accepted:**

- ❌ No nested data structures (acceptable - data is inherently flat)
- ❌ No native arrays (mitigated with `;` separator)
- ❌ Limited data types (strings only - sufficient for this use case)
- ✅ Maximum accessibility for curators
- ✅ Git-friendly workflow
- ✅ Zero barrier to contribution

---

### Why TypeScript Scripts Over Pure LLM?

**Decision Rationale:**

1. **Determinism**
   - Eliminate temperature-induced variation
   - Same inputs → identical outputs (100% reproducible)
   - No "creative interpretation" of queries

2. **Performance**
   - Fast execution vs LLM inference latency
   - CSV parsing in milliseconds vs seconds
   - No API rate limits or quota concerns

3. **Testability**
   - Unit test data transformations
   - Property-based testing (fuzzing)
   - Integration test full pipeline

4. **Debuggability**
   - Stack traces point to exact error location
   - Can step through code with debugger
   - No "prompt debugging" guesswork

**Comparison:**

**LLM-Based Approach (Rejected):**

```
User: "Filter fonts for medical apps"

LLM: [Parses typography.csv]
     [Interprets "medical" → looks for keywords in "Best For" column]
     [Returns 12 fonts... maybe different on next run]
     [Rationale based on training data, not explicit rules]
```

**Script-Based Approach (Adopted):**

```typescript
// filter-typography.ts
function filterByNiche(csv: Row[], niche: string): Row[] {
  return csv.filter((row) => row[1].split(";").includes(niche));
}

// Deterministic, testable, fast
```

**When LLM IS Used:**

- **Orchestration** (Layer 1): LLM reads SKILL.md and decides which scripts to call
- **User interaction**: LLM presents options and parses user selections
- **State management**: LLM updates state.json with user choices

**When Scripts Are Used:**

- **Data access** (Layer 2): Scripts query CSVs deterministically
- **Transformations**: Scripts apply fonts to layouts, generate tokens
- **Validation**: Scripts check accessibility, validate output

---

### Why Handlebars Over String Templates?

**Decision Rationale:**

1. **Logic Separation**
   - Templates stay declarative (no complex logic)
   - Business logic in TypeScript, presentation in HBS
   - Clear separation of concerns

2. **Partial Support**
   - Reuse template components
   - DRY principle (Don't Repeat Yourself)
   - Consistent header/footer across formats

3. **Community Familiarity**
   - Industry standard template engine
   - Well-documented
   - Large ecosystem of helpers

4. **Automatic Escaping**
   - HTML/CSS escaping built-in
   - Prevents injection vulnerabilities
   - Safe by default

**Example:**

```handlebars
{{! templates/shadcn.css.hbs }}
{{> header }}

:root {
  --background: {{background}};
  --foreground: {{foreground}};
  --primary: {{primary}};
  {{#if secondary}}
  --secondary: {{secondary}};
  {{/if}}
}

{{> footer }}
```

```handlebars
{{! templates/partials/header.hbs }}
/** * Generated by Bespoke Design Pipeline * Version:
{{version}}
* Date:
{{timestamp}}
*/
```

**Alternatives Considered:**

- **Template literals**: Too much logic in strings, no partials
- **JSX**: Overkill for CSS generation, requires React
- **Mustache**: Less powerful than Handlebars (no conditionals)

---

### Why Multi-Format Output?

**Decision Rationale:**

1. **User Choice**
   - Don't force framework lock-in
   - Users pick best fit for their stack
   - Future-proof (new frameworks emerge)

2. **Migration Path**
   - Easy framework switching
   - Try multiple before committing
   - Reduce switching costs

3. **Learning Tool**
   - Compare framework conventions
   - Understand token mapping differences
   - Educational value

4. **Ecosystem Compatibility**
   - Work with existing tools (Figma, Storybook)
   - Interoperate with design systems
   - Standards-compliant output

**Formats Supported:**

| Format      | Use Case                    | Example                     |
| ----------- | --------------------------- | --------------------------- |
| Generic CSS | Custom systems, vanilla CSS | `--color-primary: #0369A1;` |
| shadcn/ui    | React + Tailwind projects   | `--primary: 199 89% 48%;`   |
| DaisyUI      | Vue/Svelte + Tailwind       | `[data-theme="custom"]`     |
| AgnosticUI   | Framework-agnostic components | Semantic CSS custom properties |
| Generic CSS  | Any project                 | Standard CSS custom properties |

**Cost:**

- ~6 Handlebars templates to maintain
- ~4 framework templates to keep updated
- Worthwhile trade-off for flexibility

---

### Why Visual Previews for Typography/Colors?

**Decision Rationale:**

1. **Informed Decisions**
   - Users see actual fonts rendered, not just names
   - Typography looks different at scale vs in lists
   - Font weight, spacing, readability visible

2. **Context Matters**
   - How fonts interact with layout structure
   - Color relationships in realistic scenarios
   - Hierarchy and visual balance evident

3. **Color Relationships**
   - Swatches show how palette colors work together
   - Primary/secondary/CTA interactions visible
   - Border, background, text contrast apparent

4. **Prevents Regret**
   - Reduces need for re-running stages
   - Catch issues early (readability, contrast)
   - Confident final selection

**Implementation:**

**Stage 3: Typography Previews**

```svg
<!-- Apply actual fonts to layout -->
<text font-family="Inter, sans-serif" font-size="24" font-weight="600">
  Dashboard Analytics
</text>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
</style>
```

**Stage 4: Full Combinations**

```html
<!-- Interactive HTML preview -->
<div class="preview-grid">
  <div class="combo" style="font-family: Inter, sans-serif">
    <svg><!-- Layout with fonts applied --></svg>
  </div>
  <!-- 8 more combinations -->
</div>
```

**Stage 5: Color Variations**

```svg
<!-- Apply palette to combination -->
<rect fill="#F8FAFC" />  <!-- background -->
<rect fill="#0369A1" />  <!-- primary -->
<rect fill="#E2E8F0" />  <!-- border -->
<text fill="#0F172A">   <!-- text -->
```

**User Experience:**

```
Without Previews:
User: "Hmm, 'Inter + Roboto' sounds good..."
[Generates tokens]
User: "Wait, Inter looks too similar to Roboto at this size. Redo."

With Previews:
User: [Sees Inter + Roboto rendered side-by-side]
User: "Actually, these are too similar. I'll pick option 9 instead."
[Confident selection, no regrets]
```

---

### Why Niche Taxonomy Over Free-Form Tags?

**Decision Rationale:**

1. **Structured Filtering**
   - Two-level hierarchy (niche_id → application_type)
   - Enables both broad and specific matching
   - Prevents tag explosion

2. **Controlled Vocabulary**
   - Defined in niche-taxonomy.json
   - Prevents typos, variants ("saas" vs "SaaS" vs "software-as-a-service")
   - Semantic consistency

3. **Hierarchical Relationships**
   - Application types grouped under niches
   - Clear parent-child relationships
   - Easier to reason about

4. **Validation**
   - Can validate CSV against taxonomy
   - Catch invalid niche_ids early
   - Maintain data quality

**Comparison:**

```csv
# Free-Form Tags (Rejected):
No,tags,Font Pairing Name,...
3,"saas, webapp, productivity, project-management, teams, collaboration",Modern Clean,...
# Problems: typos, inconsistency, hard to query

# Structured Taxonomy (Adopted):
No,niche_id,application_types,Font Pairing Name,...
3,saas,web-app;productivity-tool,Modern Clean,...
# Benefits: consistent, queryable, validated
```

---

### Why State Management Over Stateless?

**Decision Rationale:**

1. **Progressive Refinement**
   - Workflow spans multiple conversation turns
   - Each stage builds on previous decisions
   - Can't re-prompt user for earlier choices

2. **Resumability**
   - Pause and resume workflow
   - Review earlier decisions
   - Rerun individual stages without starting over

3. **Versionability**
   - Commit state.json to git
   - Track design evolution over time
   - Reproduce exact design system later

4. **Debugging**
   - Inspect state to understand pipeline position
   - Diagnose issues (which stage failed?)
   - Clear audit trail

**State Structure:**

```json
{
  "pipeline_version": "1.0",
  "current_stage": "typography_selection",
  "completed_stages": ["understand_problem", "wireframe_selection"],
  "inferred_niche": "saas",
  "application_type": "productivity-tool",
  "selected_layouts": ["option-03", "option-08", "option-12"],
  "selected_typography": null, // Not yet selected
  "final_combination": null,
  "timestamp": "2026-02-04T10:30:00Z"
}
```

**Benefits:**

- ✅ Resume after interruption
- ✅ Undo/redo capability
- ✅ Version control friendly
- ✅ Clear workflow progress

---

## Adding New Assets

### Adding a Font Pairing

1. **Determine primary `niche_id`** (required)
   - Choose from: `dashboard`, `marketing`, `saas`, `blog`, `ecommerce`, `portfolio`, `medical`, `fintech`, `industrial`, `education`, `realestate`, `social`, `food`, `travel`, `nonprofit`
   - Can assign multiple: `saas;dashboard`

2. **List relevant `application_types`** (optional but recommended)
   - Reference `niche-taxonomy.json` for valid types
   - Can assign multiple: `web-app;productivity-tool`

3. **Add row to `typography.csv`**

```csv
140,saas;dashboard,web-app;productivity-tool;analytics;monitoring,Modern Data,Sans + Mono,IBM Plex Sans,IBM Plex Mono,technical precise data-focused,Data dashboards and SaaS analytics,...
```

### Adding a Color Palette

Same process:

```csv
160,medical;saas,patient-portal;wellness-app;health-dashboard,Healthcare Modern,#0369A1,#0EA5E9,#10B981,#F8FAFC,#0F172A,#E2E8F0,Trustworthy healthcare palette with calming blues
```

### Adding a Layout

1. Create SVG following wireframe guidelines (see docs/SVG_WIREFRAME_GENERATION_GUIDE.md)
2. Save to appropriate niche directory: `layouts/{niche_id}/{niche}_{description}_{number}.svg`
3. Optionally add metadata to `layout_templates.csv`

**Example:**

```
layouts/fintech/fintech_trading-dashboard_01.svg
```

**Naming Convention:**

- Format: `{niche}_{description}_{number}.svg`
- Description: kebab-case, descriptive (e.g., `sidebar-metrics-grid`)
- Number: Zero-padded (01, 02, ..., 15)

---

## Troubleshooting

### Issue: "No fonts found for niche"

**Cause:** No rows in `typography.csv` have matching `niche_id`

**Solution:**

1. Check `state.json` for correct `inferred_niche` value
2. Verify CSV has rows with that `niche_id` in column 2
3. Check for typos (case-sensitive)

### Issue: "Too few fonts returned"

**Cause:** Not enough exact matches for `niche_id` + `application_type`

**Solution:**

1. Fallback to niche-only matching (ignore `application_type`)
2. Add more font pairings to CSV for that niche
3. Use related niche fallback (see RELATED_NICHES in match-niche.ts)

### Issue: "Layout directory empty"

**Cause:** No SVG files in `layouts/{niche_id}/`

**Solution:**

1. Generate missing layouts using SVG wireframe guide
2. Check directory name matches `niche_id` exactly
3. Verify file naming convention: `{niche}_{desc}_{num}.svg`

---

## File Locations Reference

```
skills/bespoke_design_system/
├── data/
│   ├── niche-taxonomy.json          # Source of truth
│   ├── typography.csv                # Restructured with niche columns
│   └── colors.csv                    # Restructured with niche columns
│
├── layouts/
│   └── {niche_id}/                   # One directory per niche
│       └── {niche}_{desc}_{num}.svg  # SVG wireframes
│
├── scripts/
│   ├── match-niche.ts                # Returns niche_id + application_type
│   ├── filter-typography.ts          # Uses columns 2 & 3
│   └── generate-palette-combinations.ts # Uses columns 2 & 3
│
└── docs/
    ├── SVG_WIREFRAME_GENERATION_GUIDE.md
    ├── DELIVERABLES_SUMMARY.md
    └── NICHE_TAXONOMY_REFERENCE.md
```

---

## Next Steps

1. **Complete Migration**: Follow checklist in Migration Checklist section
2. **Generate Remaining Layouts**: 53 layouts needed for 8 niches (~7 per niche)
3. **Review CSV Mappings**: Manually verify automatic niche assignments in typography.csv and colors.csv
4. **Implement Scripts**: Complete all TypeScript scripts with proper error handling
5. **Test End-to-End**: Run complete pipeline with diverse inputs across all 15 niches
6. **Create Templates**: Build Handlebars templates for all supported frameworks
7. **Write SKILL.md**: Create orchestration logic that ties all stages together
8. **Document Edge Cases**: Add examples for ambiguous scenarios and error conditions
9. **Set Up CI/CD**: Automate CSV validation, token generation testing, visual regression
10. **Community Setup**: Create contribution guidelines, issue templates, PR review process

---

## Document Status

**Version:** 2.0  
**Last Updated:** February 2026  
**Status:** ✅ Ready for Implementation

### Changelog

**v2.0** (2026-02-04)

- ✅ Unified CSV restructure documentation with directory structure
- ✅ Integrated PRD vision, philosophy, and success metrics
- ✅ Added comprehensive script specifications with I/O formats
- ✅ Framework integration section (4 core frameworks)
- ✅ Added complete usage examples with realistic conversation flows
- ✅ Documented maintenance and evolution strategy
- ✅ Added appendix explaining all key design decisions
- ✅ Enhanced troubleshooting with common issues and solutions

**v1.0** (2026-02-01)

- Initial split documentation
- CSV restructure details
- Directory structure proposal

### Document Scope

This unified document serves as:

1. **Vision Statement** - Why this system exists and what problems it solves
2. **Technical Specification** - Complete architecture and implementation details
3. **Implementation Guide** - Step-by-step setup and configuration
4. **User Manual** - How to use the pipeline effectively
5. **Contributor Guide** - How to extend and maintain the system
6. **Reference Manual** - Design decisions and rationale

### Related Documentation

- `docs/SVG_WIREFRAME_GENERATION_GUIDE.md` - How to create layout templates
- `docs/DELIVERABLES_SUMMARY.md` - System overview and deliverables
- `docs/NICHE_TAXONOMY_REFERENCE.md` - Complete niche and application type reference
- `SKILL.md` - LLM orchestration instructions (to be created)

---

**For Questions or Issues:**

- **Valid Values**: Reference `niche-taxonomy.json` for all valid niche_ids and application_types
- **Usage Examples**: See "Usage Examples" section for complete workflow demonstrations
- **Debugging**: Check `.design-pipeline/state.json` for current pipeline state
- **Framework Support**: See "Framework Integration" section for adding new frameworks
- **Contributing**: Follow guidelines in "Maintenance & Evolution" section
