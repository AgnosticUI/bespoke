# The Bespoke Design Pipeline
## Product Requirements Document v2.0

---

## Executive Summary

The Bespoke Design Pipeline is a deterministic, Unix-philosophy-inspired design system that eliminates generic "AI slop" by forcing LLMs to work through discrete, expert-curated decision points rather than generating holistic designs from averaged training data. The system uses a hybrid architecture combining:

- **Skill-based orchestration** (markdown instructions for LLMs)
- **CSV databases** (human-curated design knowledge)
- **TypeScript scripts** (deterministic data access layer)
- **Stateful workflow** (progressive refinement across conversation turns)

**Target Users:** Developers using AI-powered code editors (Cursor, Windsurf, Claude Desktop, VS Code + Copilot)

**Key Innovation:** Replaces vague prompting with logical, sequential selection from curated datasets, preventing LLM hallucination of generic design solutions.

---

## Table of Contents

1. [Vision & Philosophy](#vision--philosophy)
2. [Core Architecture](#core-architecture)
3. [Workflow Overview](#workflow-overview)
4. [Technical Implementation](#technical-implementation)
5. [Data Structures](#data-structures)
6. [Script Specifications](#script-specifications)
7. [Framework Integration](#framework-integration)
8. [File Structure](#file-structure)
9. [Usage Examples](#usage-examples)
10. [Success Metrics](#success-metrics)

---

## Vision & Philosophy

### Problem Statement

Current AI-generated designs suffer from:
- **Generic aesthetics** due to LLM training on averaged design patterns
- **Inconsistent execution** when LLMs try to solve design and coding simultaneously
- **No design intent preservation** across iterations
- **Framework drift** where implementation diverges from design vision

### Core Principle

**Declarative Selection > Generative Hallucination**

The pipeline replaces vague prompting ("make it look modern") with logical, sequential selection from curated datasets ("select from 15 medical-specific layouts, then choose from 15 healthcare-appropriate font pairings").

### Design Philosophy

1. **Discrete Decision Points**: Each skill operates in isolation, producing structured artifacts
2. **Expert Curation**: All design options come from human-maintained CSV databases
3. **Deterministic Results**: Same inputs always produce same outputs
4. **Progressive Refinement**: 3→3→(3×3)→1 narrowing funnel
5. **Framework Agnostic**: Design decisions separate from implementation

---

## Core Architecture

### Three-Layer System

```
┌─────────────────────────────────────────────┐
│   Layer 1: SKILL.md Files                   │
│   (LLM Orchestration Instructions)          │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│   Layer 2: TypeScript Scripts               │
│   (Deterministic Data Access)               │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│   Layer 3: CSV Databases                    │
│   (Curated Design Knowledge)                │
└─────────────────────────────────────────────┘
```

### Why This Architecture?

1. **LLM as Pure Orchestrator**: The LLM never "invents" design choices—it only:
   - Calls scripts with parameters
   - Parses JSON output
   - Presents options to users
   - Updates state

2. **Humans Curate Design Knowledge**: Designers maintain CSVs without touching code
3. **Scripts Ensure Determinism**: Same inputs guarantee same outputs
4. **Skills Enable Modularity**: Each stage can be run independently or rerun

---

## Workflow Overview

### The 3→3→(3×3)→1 Progressive Refinement Flow

```
User Description
      ↓
[1. Identify Niche] → 1 application type
      ↓
[2. Generate Layouts] → 15 options → User selects 3
      ↓
[3. Select Typography] → 15 options → User selects 3
      ↓
[4. Combine Previews] → 9 full combinations (3 layouts × 3 fonts)
      ↓                      User selects 1
[5. Apply Palette] → 5 color variations (optional)
      ↓                User selects final
[6. Generate Tokens] → Multi-format design system
```

### State Management

The pipeline maintains a stateful workflow through `state.json`:

```json
{
  "pipeline_version": "1.0",
  "current_stage": "typography_selection",
  "completed_stages": ["understand_problem", "wireframe_selection"],
  "application_type": "patient-portal",
  "inferred_niche": "med-01",
  "selected_layouts": ["option-03", "option-08", "option-12"],
  "selected_typography": ["typo-02", "typo-09", "typo-14"],
  "final_combination": {
    "layout": "option-08",
    "typography": "typo-09",
    "palette": "palette-med-02"
  },
  "timestamp": "2026-02-04T10:30:00Z"
}
```

---

## Technical Implementation

### File Structure

```
<workspace_root>/
├── skills/
│   ├── bespoke_design_system/
│   │   ├── SKILL.md                          # Main orchestrator
│   │   ├── data/
│   │   │   ├── design-tokens.csv             # Semantic source of truth
│   │   │   ├── niche_profiles.csv            # Application type constraints
│   │   │   ├── layout_templates.csv          # Layout metadata
│   │   │   ├── typography.csv                # Font pairings
│   │   │   ├── color_systems.csv             # Color palettes
│   │   │   └── framework-profiles/
│   │   │       ├── shadcn-profile.csv        # Shadcn-specific mappings
│   │   │       ├── daisyui-profile.csv       # DaisyUI-specific mappings
│   │   │       ├── agnosticui-profile.csv    # AgnosticUI-specific mappings
│   │   │       ├── aceternity-profile.csv    # Aceternity UI mappings
│   │   │       ├── magicui-profile.csv       # Magic UI mappings
│   │   │       └── nextui-profile.csv        # NextUI mappings
│   │   ├── templates/
│   │   │   ├── wireframe_templates/
│   │   │   │   ├── three-pane-spacious.svg
│   │   │   │   ├── card-grid-wide.svg
│   │   │   │   └── ...
│   │   │   ├── design-tokens.css.hbs         # Generic CSS template
│   │   │   ├── shadcn.css.hbs                # Shadcn CSS template
│   │   │   ├── daisyui.css.hbs               # DaisyUI CSS template
│   │   │   ├── agnosticui.css.hbs            # AgnosticUI CSS template
│   │   │   ├── aceternity.tailwind.config.hbs # Aceternity Tailwind config
│   │   │   ├── magicui.tailwind.config.hbs   # Magic UI Tailwind config
│   │   │   ├── nextui.tailwind.config.hbs    # NextUI plugin config
│   │   │   ├── shadcn.tailwind.config.hbs    # Shadcn Tailwind config
│   │   │   └── daisyui.tailwind.config.hbs   # DaisyUI Tailwind config
│   │   └── scripts/
│   │       ├── match-niche.ts                # Stage 1: Identify niche
│   │       ├── generate-layouts.ts           # Stage 2: Generate wireframes
│   │       ├── filter-typography.ts          # Stage 3: Filter fonts
│   │       ├── apply-typography-to-layout.ts # Stage 3a: Apply fonts to layout
│   │       ├── combine-previews.ts           # Stage 4: Combine layouts+fonts
│   │       ├── generate-palette-combinations.ts # Stage 4a: Add color variations
│   │       ├── generate-tokens.ts            # Stage 6: Generate design tokens
│   │       └── utils/
│   │           ├── color-conversions.ts
│   │           └── csv-loader.ts
│   ├── understand_problem/
│   │   └── SKILL.md
│   ├── generate_wireframe/
│   │   └── SKILL.md
│   ├── select_typography/
│   │   └── SKILL.md
│   ├── select_palette/
│   │   └── SKILL.md
│   └── generate_tokens/
│       └── SKILL.md
└── .design-pipeline/                         # Generated artifacts (gitignored)
    ├── state.json                            # Current pipeline state
    ├── layouts/
    │   ├── option-01.svg
    │   ├── option-02.svg
    │   └── ... (15 total)
    ├── typography/
    │   ├── preview-01.svg
    │   └── ... (15 total)
    ├── combinations/
    │   ├── combo-01.svg
    │   └── ... (9 total)
    ├── css/
    │   ├── design-tokens.css
    │   ├── shadcn-tokens.css
    │   ├── daisyui-tokens.css
    │   └── agnosticui-tokens.css
    ├── shadcn.tailwind.config.js
    ├── daisyui.tailwind.config.js
    ├── aceternity.tailwind.config.js
    ├── magicui.tailwind.config.js
    ├── nextui.tailwind.config.js
    ├── design_manifest.json
    └── IMPLEMENTATION.md
```

---

## Data Structures

### 1. Niche Profiles (`data/niche_profiles.csv`)

Maps application types to design constraints:

```csv
niche_id,niche_name,applications,layout_density,typography_style,color_requirements,accessibility_level
med-01,Medical/Healthcare,"patient-portal,ehr-system,telemedicine-app",spacious,approachable-clinical,emergency-hierarchy,AAA
fin-01,Fintech/Trading,"trading-platform,crypto-wallet,financial-dashboard",high-density,monospace-precision,status-indicators,AA
studio-01,Creative/Portfolio,"design-agency,architect-portfolio,fashion-ecommerce",experimental,bespoke-expressive,brand-forward,AA
ind-01,Industrial/IoT,"factory-dashboard,fleet-management,iot-control-panel",grid-centric,condensed-utilitarian,operational-status,AA
```

**Purpose**: Enables deterministic matching of user descriptions to niche-specific constraints.

---

### 2. Layout Templates (`data/layout_templates.csv`)

Stores metadata about each wireframe template:

```csv
layout_id,template_file,niche_id,density,primary_columns,navigation_type,sidebar_position,description
layout-01,three-pane-spacious.svg,med-01,spacious,3,top-horizontal,right,Three-column layout with generous padding for healthcare readability
layout-02,card-grid-wide.svg,fin-01,high-density,4,left-vertical,left,Dense card grid for financial data visualization
layout-03,hero-asymmetric.svg,studio-01,experimental,1,floating-menu,none,Asymmetric hero layout with bold typography zones
layout-04,tabbed-dashboard.svg,ind-01,grid-centric,2,tabs,none,Tab-based dashboard for industrial control panels
```

**Key Fields:**
- `template_file`: Actual SVG wireframe in `templates/wireframe_templates/`
- `niche_id`: Links to niche constraints
- `density`: Matches niche requirements (spacious, high-density, experimental, etc.)
- `description`: Human-readable rationale for LLM to present

---

### 3. Typography Pairings (`data/typography.csv`)

Font combinations curated for each niche:

```csv
pairing_id,niche_id,display_font,display_weights,body_font,body_weights,google_fonts_url,archetype,rationale
typo-01,med-01,Inter,400;600;700,Source Sans 3,400;600,https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Source+Sans+3:wght@400;600&display=swap,Approachable Clinical,"Modern sans-serif with excellent readability at all sizes, critical for patient-facing applications"
typo-02,fin-01,IBM Plex Mono,400;600,IBM Plex Sans,400;500,https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500&display=swap,Precision Monospace,"Monospace for numeric precision, sans-serif for dashboard clarity"
typo-03,studio-01,Playfair Display,400;700,Work Sans,300;400,https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Work+Sans:wght@300;400&display=swap,Editorial Elegance,"High-contrast serif paired with geometric sans for fashion/design agencies"
typo-04,ind-01,Roboto Condensed,400;700,Roboto,300;400,https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&family=Roboto:wght@300;400&display=swap,Industrial Condensed,"Space-efficient condensed font for dense industrial dashboards"
```

**Key Fields:**
- `google_fonts_url`: Direct import URL for font loading
- `archetype`: Semantic category (Approachable Clinical, Precision Monospace, etc.)
- `rationale`: Explains niche-specific reasoning
- `display_weights`/`body_weights`: Available font weights for variable typography

---

### 4. Color Systems (`data/color_systems.csv`)

Niche-appropriate color palettes:

```csv
palette_id,niche_id,palette_name,primary,secondary,accent,success,warning,error,neutral_100,neutral_900,contrast_ratio
palette-med-01,med-01,Healthcare Calm,#0369A1,#0EA5E9,#38BDF8,#10B981,#F59E0B,#EF4444,#F0F9FF,#0C4A6E,AAA
palette-fin-01,fin-01,Trading Pro,#1E40AF,#3B82F6,#60A5FA,#22C55E,#F59E0B,#DC2626,#EFF6FF,#1E3A8A,AA
palette-studio-01,studio-01,Creative Bold,#7C3AED,#A78BFA,#C4B5FD,#10B981,#F59E0B,#EF4444,#FAF5FF,#5B21B6,AA
palette-ind-01,ind-01,Industrial Slate,#475569,#64748B,#94A3B8,#22C55E,#F59E0B,#DC2626,#F1F5F9,#0F172A,AA
```

**Purpose**: Provides accessible, domain-appropriate color schemes that meet niche requirements.

---

### 5. Framework Profiles (`data/framework-profiles/*.csv`)

Maps semantic tokens to framework-specific conventions:

#### Example: `shadcn-profile.csv`

```csv
semantic_token,category,shadcn_variable,shadcn_css_value,notes
primary,color,--primary,hsl(var(--primary)),Maps to shadcn's primary color system
secondary,color,--secondary,hsl(var(--secondary)),Secondary accent color
accent,color,--accent,hsl(var(--accent)),Highlighted elements
success,color,--success,hsl(var(--success)),Success states
warning,color,--warning,hsl(var(--warning)),Warning states
error,color,--destructive,hsl(var(--destructive)),Error/destructive actions (shadcn naming)
neutral-100,color,--background,hsl(var(--background)),Page background
neutral-900,color,--foreground,hsl(var(--foreground)),Primary text color
display-font,typography,--font-display,var(--font-display),Heading/display font
body-font,typography,--font-sans,var(--font-sans),Body text font (shadcn convention)
radius-sm,border,--radius,0.25rem,Small border radius
radius-md,border,--radius,0.5rem,Medium border radius
radius-lg,border,--radius,1rem,Large border radius
```

#### Example: `nextui-profile.csv`

```csv
semantic_token,category,nextui_plugin_path,nextui_value,notes
primary,color,themes.light.colors.primary,{value},NextUI plugin primary color
secondary,color,themes.light.colors.secondary,{value},NextUI plugin secondary color
success,color,themes.light.colors.success,{value},Success state color
warning,color,themes.light.colors.warning,{value},Warning state color
error,color,themes.light.colors.danger,{value},Danger/error color (NextUI naming)
neutral-100,color,themes.light.colors.default.100,{value},Lightest neutral
neutral-900,color,themes.light.colors.default.900,{value},Darkest neutral
display-font,typography,theme.extend.fontFamily.display,{value},Display font family
body-font,typography,theme.extend.fontFamily.body,{value},Body font family
radius-sm,border,layout.radius.small,{value},Small radius
radius-md,border,layout.radius.medium,{value},Medium radius
radius-lg,border,layout.radius.large,{value},Large radius
```

**Purpose**: Eliminates need to read framework documentation—profiles encode framework conventions as data.

---

### 6. Design Tokens (`data/design-tokens.csv`)

The semantic source of truth:

```csv
semantic_name,category,value,description,accessibility_notes
primary,color,#0369A1,Primary brand color,Meets AA contrast on white backgrounds
secondary,color,#0EA5E9,Secondary accent color,Meets AA contrast requirements
accent,color,#38BDF8,Highlight/interaction color,Use for non-critical accents only
success,color,#10B981,Success state indicator,Meets AAA contrast
warning,color,#F59E0B,Warning state indicator,Meets AA contrast
error,color,#EF4444,Error/destructive indicator,Meets AAA contrast
neutral-100,color,#F0F9FF,Lightest neutral (backgrounds),Base background color
neutral-900,color,#0C4A6E,Darkest neutral (text),Primary text color
display-font,typography,Inter,Heading/display font,Optimized for 24px+ sizes
body-font,typography,Source Sans 3,Body text font,Optimized for 14-18px sizes
spacing-xs,spacing,0.25rem,Extra small spacing,4px
spacing-sm,spacing,0.5rem,Small spacing,8px
spacing-md,spacing,1rem,Medium spacing,16px
spacing-lg,spacing,1.5rem,Large spacing,24px
spacing-xl,spacing,2rem,Extra large spacing,32px
radius-sm,border,0.25rem,Small border radius,Subtle rounded corners
radius-md,border,0.5rem,Medium border radius,Standard rounded corners
radius-lg,border,1rem,Large border radius,Prominent rounded corners
```

**Purpose**: Framework-agnostic semantic tokens that drive all output formats.

---

## Script Specifications

### 1. `scripts/match-niche.ts`

**Purpose**: Identify application niche from user description.

**Input:**
- User's app description (string)
- `niche_profiles.csv`

**Output:**
```json
{
  "matched_niche": "med-01",
  "niche_name": "Medical/Healthcare",
  "confidence": 0.92,
  "reasoning": "Description mentions 'patient portal', 'appointments', 'medical records' which strongly match medical/healthcare niche",
  "constraints": {
    "layout_density": "spacious",
    "typography_style": "approachable-clinical",
    "color_requirements": "emergency-hierarchy",
    "accessibility_level": "AAA"
  }
}
```

**Algorithm:**
1. Tokenize user description
2. Calculate semantic similarity to `applications` field in each niche
3. Return best match with confidence score
4. Extract niche-specific constraints

**Example Usage:**
```bash
$ node scripts/match-niche.ts "I'm building a telemedicine app for remote patient consultations"

{
  "matched_niche": "med-01",
  "niche_name": "Medical/Healthcare",
  "confidence": 0.94,
  "reasoning": "Keywords: 'telemedicine', 'patient', 'consultations' match healthcare domain",
  "constraints": { ... }
}
```

---

### 2. `scripts/generate-layouts.ts`

**Purpose**: Generate 15 wireframe SVG files based on niche constraints.

**Input:**
- Niche ID (e.g., `med-01`)
- `layout_templates.csv`
- `templates/wireframe_templates/*.svg`

**Output:**
```json
{
  "generated_layouts": [
    {
      "layout_id": "option-01",
      "description": "Three-column layout with generous padding for healthcare readability",
      "file_path": ".design-pipeline/layouts/option-01.svg",
      "metadata": {
        "density": "spacious",
        "columns": 3,
        "navigation": "top-horizontal",
        "sidebar": "right"
      }
    },
    // ... 14 more layouts
  ],
  "preview_html": ".design-pipeline/layouts/preview.html"
}
```

**Algorithm:**
1. Filter `layout_templates.csv` by `niche_id` and `density`
2. Select 15 layouts (or all if fewer)
3. Copy template SVGs to `.design-pipeline/layouts/`
4. Generate HTML preview grid
5. Return metadata JSON

**Example Usage:**
```bash
$ node scripts/generate-layouts.ts med-01 .design-pipeline

✅ Generated 15 layouts
📄 Preview: .design-pipeline/layouts/preview.html
```

---

### 3. `scripts/filter-typography.ts`

**Purpose**: Return 15 font pairings appropriate for niche.

**Input:**
- Niche ID (e.g., `med-01`)
- `typography.csv`

**Output:**
```json
{
  "typography_pairings": [
    {
      "pairing_id": "typo-01",
      "display_font": "Inter",
      "body_font": "Source Sans 3",
      "archetype": "Approachable Clinical",
      "rationale": "Modern sans-serif with excellent readability...",
      "google_fonts_url": "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Source+Sans+3:wght@400;600&display=swap"
    },
    // ... 14 more pairings
  ]
}
```

**Algorithm:**
1. Filter `typography.csv` by `niche_id`
2. Return up to 15 pairings
3. Include Google Fonts URLs for easy import

**Example Usage:**
```bash
$ node scripts/filter-typography.ts med-01

{
  "typography_pairings": [ ... ],
  "count": 15
}
```

---

### 3a. `scripts/apply-typography-to-layout.ts`

**Purpose**: Apply font pairings to selected layout for visual comparison.

**Input:**
- Layout SVG file path
- Typography pairings JSON array
- Output directory

**Output:**
- 15 SVG files with real fonts applied
- Typography specimens (headings, body text, etc.) rendered in each font

**Algorithm:**
1. Read base layout SVG
2. For each font pairing:
   - Inject Google Fonts `@import` in `<style>` block
   - Add CSS classes for display/body fonts with appropriate weights
   - Insert text specimens at strategic coordinates
   - Add info badge showing pairing details
3. Write enhanced SVG to output directory
4. Generate HTML preview grid

**Example Usage:**
```bash
$ node scripts/apply-typography-to-layout.ts \
    .design-pipeline/layouts/option-08.svg \
    '[{"pairing_id":"typo-01",...}]' \
    .design-pipeline/typography

✅ Generated 15 typography previews
📄 Preview: .design-pipeline/typography/preview.html
```

**Typography Specimen Placement:**
```xml
<!-- Example of injected text specimens -->
<g id="typography-specimens">
  <text x="120" y="140" class="display-font">Patient Dashboard</text>
  <text x="120" y="180" class="display-font-bold">Recent Activity</text>
  <text x="120" y="210" class="body-font">View your recent appointments...</text>
  <text x="120" y="270" class="body-font-medium">Last updated: 2 hours ago</text>
</g>

<!-- Info badge showing pairing details -->
<g id="pairing-info">
  <rect x="20" y="660" width="760" height="60" rx="8" fill="#F3F4F6"/>
  <text x="40" y="685">Approachable Clinical • Display: Inter • Body: Source Sans 3</text>
  <text x="40" y="705">Modern sans-serif with excellent readability...</text>
</g>
```

---

### 4. `scripts/combine-previews.ts`

**Purpose**: Generate 9 full combinations (3 layouts × 3 fonts).

**Input:**
- Selected layout IDs (e.g., `["option-03", "option-08", "option-12"]`)
- Selected typography IDs (e.g., `["typo-02", "typo-09", "typo-14"]`)
- `state.json` for niche context

**Output:**
```json
{
  "combinations": [
    {
      "combination_id": "combo-01",
      "layout_id": "option-03",
      "typography_id": "typo-02",
      "file_path": ".design-pipeline/combinations/combo-01.svg",
      "preview_url": ".design-pipeline/combinations/preview.html#combo-01"
    },
    // ... 8 more combinations
  ]
}
```

**Algorithm:**
1. Load selected layouts and typography from `.design-pipeline/`
2. For each layout × typography pair:
   - Apply font pairing to layout SVG
   - Add typography specimen text
   - Add combination metadata badge
3. Generate interactive HTML preview
4. Return combination metadata

**Example Usage:**
```bash
$ node scripts/combine-previews.ts \
    '["option-03","option-08","option-12"]' \
    '["typo-02","typo-09","typo-14"]' \
    .design-pipeline

✅ Generated 9 combinations
📄 Preview: .design-pipeline/combinations/preview.html
```

---

### 4a. `scripts/generate-palette-combinations.ts`

**Purpose**: Generate full-context combinations with color variations (layouts × fonts × colors).

**Input:**
- Selected layout paths (3 SVG files)
- Selected font pairings (3 pairings)
- Niche ID
- Output directory

**Output:**
```json
{
  "files": [
    ".design-pipeline/palette-combos/combo-01.svg",
    ".design-pipeline/palette-combos/combo-02.svg",
    // ... up to 27 combinations (3×3×3 if showing all palette variations)
    // or 9 combinations (3×3×1 if cycling through palettes)
  ],
  "metadata": [
    {
      "combination_id": "combo-01",
      "layout_id": "option-03",
      "typography_id": "typo-02",
      "palette_id": "palette-med-01",
      "palette_name": "Healthcare Calm"
    },
    // ...
  ],
  "preview_html": ".design-pipeline/palette-combos/preview.html"
}
```

**Algorithm:**
1. Load color palettes for niche from `color_systems.csv`
2. For each layout × font combination:
   - Read typography-enhanced layout SVG
   - Apply color transformations:
     - `#DDDDDD` (backgrounds) → `palette.neutral_100`
     - `#9CA3AF` (icons) → `palette.secondary`
     - `#374151` (text) → `palette.neutral_900`
     - `#CCCCCC` (borders) → `palette.neutral_100`
   - Add color swatch visualization
   - Add palette metadata badge
3. Generate HTML preview grid with color filters
4. Return file paths and metadata

**Example Usage:**
```bash
$ node scripts/generate-palette-combinations.ts \
    '[".design-pipeline/typography/preview-03.svg",...]' \
    '[{"pairing_id":"typo-02",...},...]' \
    med-01 \
    .design-pipeline/palette-combos

✅ Generated 9 colorized combinations
📄 Preview: .design-pipeline/palette-combos/preview.html
```

**Color Application Strategy:**
```typescript
function applyColorToSVG(svgContent: string, palette: ColorPalette): string {
  // Replace grayscale wireframe colors with semantic palette
  let colorizedSvg = svgContent;
  
  colorizedSvg = colorizedSvg.replace(/fill="#DDDDDD"/g, `fill="${palette.neutral_100}"`);
  colorizedSvg = colorizedSvg.replace(/fill="#9CA3AF"/g, `fill="${palette.secondary}"`);
  colorizedSvg = colorizedSvg.replace(/fill="#374151"/g, `fill="${palette.neutral_900}"`);
  
  // Add color swatch visualization
  const swatchY = 750;
  const swatches = `
    <g id="color-swatches">
      <text x="20" y="${swatchY - 10}">${palette.palette_name}</text>
      <rect x="20" y="${swatchY}" width="30" height="30" fill="${palette.primary}"/>
      <rect x="55" y="${swatchY}" width="30" height="30" fill="${palette.secondary}"/>
      <!-- ... more swatches -->
    </g>`;
  
  return colorizedSvg + swatches;
}
```

---

### 5. `scripts/generate-tokens.ts`

**Purpose**: Generate multi-format design system outputs.

**Input:**
- `state.json` (final selections)
- `design-tokens.csv`
- Framework profile CSVs
- Handlebars templates

**Output:**
- `.design-pipeline/css/design-tokens.css`
- `.design-pipeline/css/shadcn-tokens.css`
- `.design-pipeline/shadcn.tailwind.config.js`
- `.design-pipeline/css/daisyui-tokens.css`
- `.design-pipeline/daisyui.tailwind.config.js`
- `.design-pipeline/css/agnosticui-tokens.css`
- `.design-pipeline/aceternity.tailwind.config.js`
- `.design-pipeline/magicui.tailwind.config.js`
- `.design-pipeline/nextui.tailwind.config.js`
- `.design-pipeline/design_manifest.json`
- `.design-pipeline/IMPLEMENTATION.md`

**Algorithm:**

#### Phase 1: Load Semantic Tokens
```typescript
function loadSemanticTokens(): DesignToken[] {
  const csv = readFileSync('data/design-tokens.csv', 'utf-8');
  return parse(csv, { columns: true });
}
```

#### Phase 2: Apply Framework Profiles
```typescript
function applyFrameworkProfile(
  semanticTokens: DesignToken[],
  profile: FrameworkProfile,
  framework: string
): { css: string[], tailwind: TailwindToken[] } {
  
  const cssTokens: string[] = [];
  const tailwindTokens: TailwindToken[] = [];
  
  semanticTokens.forEach(token => {
    const mapping = profile.find(p => p.semantic_token === token.semantic_name);
    
    if (mapping) {
      // Generate CSS custom property
      if (mapping.css_variable) {
        cssTokens.push(`  ${mapping.css_variable}: ${token.value};`);
      }
      
      // Generate Tailwind config entry
      if (mapping.tailwind_path) {
        tailwindTokens.push({
          path: mapping.tailwind_path,
          value: token.value,
          category: token.category
        });
      }
    }
  });
  
  return { css: cssTokens, tailwind: tailwindTokens };
}
```

#### Phase 3: Generate CSS Files
```typescript
function generateCSS(tokens: string[], templatePath: string): string {
  const template = Handlebars.compile(readFileSync(templatePath, 'utf-8'));
  return template({ tokens });
}
```

#### Phase 4: Generate Tailwind Configs
```typescript
function generateTailwindConfig(
  tokens: TailwindToken[],
  templatePath: string
): string {
  // Group tokens by path
  const grouped = tokens.reduce((acc, token) => {
    const [section, key] = token.path.split('.');
    if (!acc[section]) acc[section] = {};
    acc[section][key] = token.value;
    return acc;
  }, {});
  
  const template = Handlebars.compile(readFileSync(templatePath, 'utf-8'));
  return template(grouped);
}
```

#### Phase 5: Generate UI Library Configs
```typescript
function generateUILibraryOutputs(library: string, outputDir: string): string[] {
  const semanticTokens = loadSemanticTokens();
  const profile = loadFrameworkProfile(library);
  
  // UI libraries typically only need Tailwind config (no separate CSS)
  const { tailwind } = applyFrameworkProfile(semanticTokens, profile, library);
  
  if (tailwind.length === 0) return [];
  
  // Group tokens by category
  const grouped = {
    colors: tailwind.filter(t => t.category === 'color'),
    typography: tailwind.filter(t => t.category === 'typography'),
    spacing: tailwind.filter(t => t.category === 'spacing'),
    borders: tailwind.filter(t => t.category === 'border')
  };
  
  // Use library-specific template
  const templateName = `${library}.tailwind.config.hbs`;
  const templatePath = join(__dirname, `../templates/${templateName}`);
  const template = Handlebars.compile(readFileSync(templatePath, 'utf-8'));
  
  // Add color values as top-level variables for easier template access
  const templateData = {
    ...grouped,
    primary_color: grouped.colors.find(c => c.semantic === 'primary')?.value,
    secondary_color: grouped.colors.find(c => c.semantic === 'secondary')?.value,
    accent_color: grouped.colors.find(c => c.semantic === 'accent')?.value,
    success_color: grouped.colors.find(c => c.semantic === 'success')?.value,
    warning_color: grouped.colors.find(c => c.semantic === 'warning')?.value,
    error_color: grouped.colors.find(c => c.semantic === 'error')?.value,
    neutral_100: grouped.colors.find(c => c.semantic === 'neutral-100')?.value,
    neutral_900: grouped.colors.find(c => c.semantic === 'neutral-900')?.value,
    radius_sm: grouped.borders.find(b => b.semantic === 'radius-sm')?.value,
    radius_md: grouped.borders.find(b => b.semantic === 'radius-md')?.value,
    radius_lg: grouped.borders.find(b => b.semantic === 'radius-lg')?.value,
  };
  
  const output = template(templateData);
  const filepath = join(outputDir, `${library}.tailwind.config.js`);
  writeFileSync(filepath, output);
  
  console.log(`✅ Generated: ${library}.tailwind.config.js`);
  return [filepath];
}
```

#### Phase 6: Generate Manifest
```typescript
function generateManifest(state: StateJSON): DesignManifest {
  return {
    pipeline_version: state.pipeline_version,
    niche: state.inferred_niche,
    selections: {
      layout: state.final_combination.layout,
      typography: state.final_combination.typography,
      palette: state.final_combination.palette
    },
    generated_files: {
      css: ['design-tokens.css', 'shadcn-tokens.css', ...],
      tailwind: ['shadcn.tailwind.config.js', 'aceternity.tailwind.config.js', ...],
      documentation: ['IMPLEMENTATION.md']
    },
    timestamp: new Date().toISOString()
  };
}
```

**Example Usage:**
```bash
$ node scripts/generate-tokens.ts .design-pipeline

✅ Generated: design-tokens.css
✅ Generated: shadcn-tokens.css
✅ Generated: shadcn.tailwind.config.js
✅ Generated: daisyui-tokens.css
✅ Generated: daisyui.tailwind.config.js
✅ Generated: agnosticui-tokens.css
✅ Generated: aceternity.tailwind.config.js
✅ Generated: magicui.tailwind.config.js
✅ Generated: nextui.tailwind.config.js
✅ Generated: design_manifest.json
✅ Generated: IMPLEMENTATION.md

📦 All files in .design-pipeline/
```

---

## Framework Integration

### Generic CSS Variables

The baseline output (`design-tokens.css`) works with any framework:

```css
:root {
  /* Colors */
  --color-primary: #0369A1;
  --color-secondary: #0EA5E9;
  --color-accent: #38BDF8;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-neutral-100: #F0F9FF;
  --color-neutral-900: #0C4A6E;
  
  /* Typography */
  --font-display: 'Inter', sans-serif;
  --font-body: 'Source Sans 3', sans-serif;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Borders */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
}
```

---

### Shadcn/UI Integration

**Generated Files:**
- `shadcn-tokens.css` (HSL-based CSS variables)
- `shadcn.tailwind.config.js` (Tailwind extension)

**Usage:**
```bash
# 1. Import CSS in your globals.css
@import './.design-pipeline/css/shadcn-tokens.css';

# 2. Use generated Tailwind config
cp .design-pipeline/shadcn.tailwind.config.js tailwind.config.js

# 3. shadcn components automatically use your bespoke colors!
npx shadcn-ui@latest add button
```

**Generated `shadcn-tokens.css`:**
```css
@layer base {
  :root {
    --background: 210 100% 97%;  /* neutral-100 in HSL */
    --foreground: 204 68% 18%;   /* neutral-900 in HSL */
    --primary: 199 100% 32%;     /* primary in HSL */
    --secondary: 199 90% 48%;    /* secondary in HSL */
    --accent: 199 95% 60%;       /* accent in HSL */
    --destructive: 0 84% 60%;    /* error in HSL */
    --success: 142 71% 45%;      /* success in HSL */
    --warning: 38 92% 50%;       /* warning in HSL */
    --radius: 0.5rem;            /* radius-md */
  }
}
```

---

### DaisyUI Integration

**Generated Files:**
- `daisyui-tokens.css` (DaisyUI theme variables)
- `daisyui.tailwind.config.js` (DaisyUI plugin config)

**Usage:**
```bash
# 1. Install DaisyUI
npm install daisyui

# 2. Use generated config
cp .design-pipeline/daisyui.tailwind.config.js tailwind.config.js

# 3. DaisyUI components use your bespoke theme!
<button class="btn btn-primary">Styled with your colors</button>
```

**Generated `daisyui.tailwind.config.js`:**
```javascript
module.exports = {
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        bespoke: {
          "primary": "#0369A1",
          "secondary": "#0EA5E9",
          "accent": "#38BDF8",
          "success": "#10B981",
          "warning": "#F59E0B",
          "error": "#EF4444",
          "base-100": "#F0F9FF",
          "base-content": "#0C4A6E",
          "--rounded-btn": "0.5rem",
        },
      },
    ],
  },
}
```

---

### Aceternity UI Integration

**Generated Files:**
- `aceternity.tailwind.config.js` (Standard Tailwind config with Aceternity-compatible tokens)

**Usage:**
```bash
# 1. Install Aceternity UI
npm install aceternity-ui

# 2. Use generated Tailwind config
cp .design-pipeline/aceternity.tailwind.config.js tailwind.config.js

# 3. Import Aceternity components with bespoke colors
import { HeroParallax, BentoGrid } from "aceternity-ui";

# Your bespoke colors are automatically applied!
```

**Generated `aceternity.tailwind.config.js`:**
```javascript
module.exports = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0369A1",
        secondary: "#0EA5E9",
        accent: "#38BDF8",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        neutral: {
          100: "#F0F9FF",
          900: "#0C4A6E",
        },
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["Source Sans 3", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "0.25rem",
        md: "0.5rem",
        lg: "1rem",
      },
    },
  },
}
```

---

### Magic UI Integration

**Generated Files:**
- `magicui.tailwind.config.js` (Standard Tailwind config optimized for Magic UI)

**Usage:**
```bash
# 1. Install Magic UI
npm install magic-ui

# 2. Merge generated config
# Your existing tailwind.config.js
const bespoke = require('./.design-pipeline/magicui.tailwind.config.js');

module.exports = {
  ...bespoke,
  // Your additional config
}

# 3. Use Magic UI components
import { ShimmerButton, AnimatedBeam } from "magic-ui";
```

**Generated `magicui.tailwind.config.js`:**
```javascript
module.exports = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0369A1",
        secondary: "#0EA5E9",
        accent: "#38BDF8",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        neutral: {
          100: "#F0F9FF",
          900: "#0C4A6E",
        },
      },
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["Source Sans 3", "system-ui", "sans-serif"],
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        beam: "beam 5s linear infinite",
      },
      keyframes: {
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        beam: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
}
```

---

### NextUI Integration

**Generated Files:**
- `nextui.tailwind.config.js` (NextUI plugin configuration)

**Usage:**
```bash
# 1. Install NextUI
npm install @nextui-org/react framer-motion

# 2. Use generated plugin config
cp .design-pipeline/nextui.tailwind.config.js tailwind.config.js

# 3. Wrap app with NextUIProvider
import { NextUIProvider } from "@nextui-org/react";

function App() {
  return (
    <NextUIProvider>
      {/* Your bespoke theme is active! */}
    </NextUIProvider>
  );
}
```

**Generated `nextui.tailwind.config.js`:**
```javascript
const { nextui } = require("@nextui-org/react");

module.exports = {
  content: [
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["Inter", "system-ui", "sans-serif"],
        body: ["Source Sans 3", "system-ui", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: "#0369A1",
            secondary: "#0EA5E9",
            success: "#10B981",
            warning: "#F59E0B",
            danger: "#EF4444",
            default: {
              100: "#F0F9FF",
              900: "#0C4A6E",
            },
          },
        },
        dark: {
          // Optional: Add dark theme variants
          colors: {
            primary: "#0369A1",
            // ... inverted color mappings
          },
        },
      },
      layout: {
        fontSize: {
          tiny: "0.75rem",
          small: "0.875rem",
          medium: "1rem",
          large: "1.125rem",
        },
        lineHeight: {
          tiny: "1rem",
          small: "1.25rem",
          medium: "1.5rem",
          large: "1.75rem",
        },
        radius: {
          small: "0.25rem",
          medium: "0.5rem",
          large: "1rem",
        },
        borderWidth: {
          small: "1px",
          medium: "2px",
          large: "3px",
        },
      },
    }),
  ],
}
```

---

### AgnosticUI Integration

**Generated Files:**
- `agnosticui-tokens.css` (CSS custom properties)

**Usage:**
```bash
# 1. Install AgnosticUI
npm install agnostic-vue  # or agnostic-react, agnostic-svelte

# 2. Import bespoke tokens
@import './.design-pipeline/css/agnosticui-tokens.css';

# 3. AgnosticUI components use CSS custom properties automatically
```

---

### UI Library Integration Benefits

1. **Instant Animation**: Get Aceternity/Magic UI animations with bespoke colors
2. **Component Library**: NextUI's full component suite themed to your palette
3. **No Manual Theming**: Skip reading documentation—generated configs work immediately
4. **Mix and Match**: Use Shadcn base + Aceternity animations + your colors
5. **Community Growth**: Users contribute profiles for new libraries

---

## Template Specifications

### CSS Template (`templates/design-tokens.css.hbs`)

```handlebars
/**
 * Bespoke Design System
 * Generated: {{timestamp}}
 * Niche: {{niche_name}}
 */

:root {
  {{#each colors}}
  --color-{{semantic}}: {{{value}}};
  {{/each}}
  
  {{#each typography}}
  --font-{{semantic}}: "{{{value}}}", sans-serif;
  {{/each}}
  
  {{#each spacing}}
  --spacing-{{semantic}}: {{value}};
  {{/each}}
  
  {{#each borders}}
  --{{semantic}}: {{value}};
  {{/each}}
}

/* Google Fonts Import */
@import url('{{google_fonts_url}}');
```

---

### Shadcn Tailwind Config (`templates/shadcn.tailwind.config.hbs`)

```handlebars
const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        {{#each typography}}
        {{key}}: ["{{{value}}}", ...fontFamily.sans],
        {{/each}}
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

### NextUI Tailwind Config (`templates/nextui.tailwind.config.hbs`)

```handlebars
const { nextui } = require("@nextui-org/react");

module.exports = {
  content: [
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        {{#each typography}}
        {{key}}: ["{{{value}}}", "system-ui", "sans-serif"],
        {{/each}}
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            primary: "{{{primary_color}}}",
            secondary: "{{{secondary_color}}}",
            success: "{{{success_color}}}",
            warning: "{{{warning_color}}}",
            danger: "{{{error_color}}}",
            default: {
              100: "{{{neutral_100}}}",
              900: "{{{neutral_900}}}",
            },
          },
        },
        dark: {
          // Optional: Add dark theme variants
          colors: {
            primary: "{{{primary_color}}}",
            // ... inverted color mappings
          },
        },
      },
      layout: {
        fontSize: {
          tiny: "0.75rem",
          small: "0.875rem",
          medium: "1rem",
          large: "1.125rem",
        },
        lineHeight: {
          tiny: "1rem",
          small: "1.25rem",
          medium: "1.5rem",
          large: "1.75rem",
        },
        radius: {
          small: "{{{radius_sm}}}",
          medium: "{{{radius_md}}}",
          large: "{{{radius_lg}}}",
        },
        borderWidth: {
          small: "1px",
          medium: "2px",
          large: "3px",
        },
      },
    }),
  ],
}
```

---

## SKILL.md Orchestration

The `SKILL.md` file instructs the LLM how to orchestrate the pipeline:

```markdown
# Bespoke Design Pipeline - Main Orchestrator

You are orchestrating a deterministic design pipeline that eliminates AI slop through expert-curated datasets.

## Your Role

**DO:**
- Execute scripts and present options to users
- Parse JSON outputs and format them clearly
- Update state.json after each stage
- Present HTML previews for visual decisions

**DON'T:**
- Invent design choices (all options come from CSVs)
- Skip scripts (they ensure determinism)
- Make design decisions for the user
- Hallucinate rationale (quote from CSV data)

## Pipeline Stages

### Stage 1: Understand Problem (skills/understand_problem/SKILL.md)

**Trigger**: User describes their application

**Actions**:
1. Extract application description
2. Run: `node scripts/match-niche.ts "<description>"`
3. Parse JSON output
4. Present matched niche and constraints to user
5. Update `state.json` with `inferred_niche` and `application_type`

**User Interaction**: Confirm niche or request re-analysis

---

### Stage 2: Generate Layouts (skills/generate_wireframe/SKILL.md)

**Trigger**: Niche confirmed

**Actions**:
1. Run: `node scripts/generate-layouts.ts <niche_id> .design-pipeline`
2. Present preview HTML: `.design-pipeline/layouts/preview.html`
3. Ask user to select 3 layouts (by number)

**User Interaction**: Select 3 layouts (e.g., "3, 8, 12")

**Update State**:
```json
{
  "selected_layouts": ["option-03", "option-08", "option-12"]
}
```

---

### Stage 3: Select Typography (skills/select_typography/SKILL.md)

**Trigger**: Layouts selected

**Actions**:
1. Run: `node scripts/filter-typography.ts <niche_id>`
2. Parse typography pairings JSON
3. Apply fonts to first selected layout:
   ```bash
   node scripts/apply-typography-to-layout.ts \
     .design-pipeline/layouts/option-<first-selected>.svg \
     '<pairings_json>' \
     .design-pipeline/typography
   ```
4. Present preview HTML: `.design-pipeline/typography/preview.html`
5. Ask user to select 3 font pairings (by number)

**User Interaction**: Select 3 typography pairings (e.g., "2, 7, 11")

**Update State**:
```json
{
  "selected_typography": ["typo-02", "typo-07", "typo-11"]
}
```

---

### Stage 4: Combine Previews (Implicit)

**Trigger**: Typography selected

**Actions**:
1. Run: `node scripts/combine-previews.ts '<layout_ids>' '<typo_ids>' .design-pipeline`
2. Present combinations HTML: `.design-pipeline/combinations/preview.html`
3. Ask user to select final combination (1-9)

**User Interaction**: Select final combination (e.g., "5")

**Update State**:
```json
{
  "final_combination": {
    "layout": "option-08",
    "typography": "typo-07"
  }
}
```

---

### Stage 5: Apply Palette (skills/select_palette/SKILL.md)

**Trigger**: Final combination selected

**Actions**:
1. Ask: "Would you like to see color palette variations?"
2. If yes:
   ```bash
   node scripts/generate-palette-combinations.ts \
     '[".design-pipeline/combinations/combo-05.svg"]' \
     '[<final_typography_pairing>]' \
     <niche_id> \
     .design-pipeline/palette-variations
   ```
   Present palette variations
3. If no: Use default niche palette

**User Interaction**: Select palette or use default

**Update State**:
```json
{
  "final_combination": {
    "layout": "option-08",
    "typography": "typo-07",
    "palette": "palette-med-02"
  }
}
```

---

### Stage 6: Generate Tokens (skills/generate_tokens/SKILL.md)

**Trigger**: Final combination complete

**Actions**:
1. Run: `node scripts/generate-tokens.ts .design-pipeline`
2. Report generated files:
   - Generic CSS tokens
   - Framework-specific CSS (shadcn, DaisyUI, AgnosticUI)
   - Tailwind configs (shadcn, DaisyUI, Aceternity, Magic UI, NextUI)
   - Implementation guide
3. Direct user to `.design-pipeline/IMPLEMENTATION.md`

**No User Interaction Required**

**Completion Message**:
```
✅ Your bespoke design system is ready!

Generated Files:
- CSS: design-tokens.css, shadcn-tokens.css, daisyui-tokens.css, agnosticui-tokens.css
- Tailwind: shadcn.tailwind.config.js, daisyui.tailwind.config.js, aceternity.tailwind.config.js, magicui.tailwind.config.js, nextui.tailwind.config.js
- Docs: IMPLEMENTATION.md, design_manifest.json

See .design-pipeline/IMPLEMENTATION.md for integration instructions.
```

---

## Error Handling

### Script Execution Failures

**If script fails**:
1. Show error message to user
2. Suggest manual inspection of CSV data
3. Offer to retry with different parameters
4. Log error to `.design-pipeline/errors.log`

### Invalid User Selections

**If user selects invalid options**:
1. Show valid range (e.g., "Please select 3 numbers from 1-15")
2. Re-present preview HTML
3. Don't update state until valid input received

### Missing Dependencies

**If CSV or template missing**:
1. Show clear error: "Missing required file: <path>"
2. Suggest checking repository structure
3. Provide link to setup documentation

---

## State Persistence

**Always update state.json after each stage**:

```typescript
function updateState(updates: Partial<PipelineState>): void {
  const currentState = JSON.parse(readFileSync('.design-pipeline/state.json'));
  const newState = { ...currentState, ...updates, timestamp: new Date().toISOString() };
  writeFileSync('.design-pipeline/state.json', JSON.stringify(newState, null, 2));
}
```

**State enables**:
- Resuming interrupted workflows
- Re-running individual stages
- Version control of design decisions
- Collaboration across sessions

---

## Presentation Guidelines

### When Showing Options

**DO**:
- Use clear numbering (1-15 or 1-9)
- Quote rationale from CSV data verbatim
- Show preview images/HTML
- Explain how to view previews

**DON'T**:
- Invent additional rationale
- Change CSV descriptions
- Make recommendations without data
- Show raw JSON/CSV to users

### Example Good Presentation

```
I've generated 15 healthcare-appropriate layouts:

1. Three-column layout with generous padding for healthcare readability
   (Spacious • 3 columns • Top navigation • Right sidebar)

2. Card grid for patient data visualization
   (High-density • 4 columns • Left navigation)

...

Preview all layouts: .design-pipeline/layouts/preview.html

Please select your top 3 layouts (e.g., "3, 8, 12")
```

---

## Quality Assurance

### Before Presenting Options

1. ✅ Verify script executed successfully
2. ✅ Confirm output files exist
3. ✅ Parse JSON without errors
4. ✅ Count matches expected quantity (15 layouts, 15 fonts, etc.)

### Before Generating Tokens

1. ✅ Confirm state.json has all required fields
2. ✅ Verify selected IDs exist in CSV data
3. ✅ Check Google Fonts URLs are valid
4. ✅ Ensure color contrast ratios meet niche requirements

---

## Success Criteria

Pipeline succeeds when:

1. ✅ User makes 4 informed decisions (niche, layouts, fonts, combination)
2. ✅ All decisions backed by CSV data (no hallucinated options)
3. ✅ Generated tokens work with target framework(s)
4. ✅ Implementation guide is clear and actionable
5. ✅ state.json contains complete design provenance

**You are not designing—you are facilitating deterministic selection from expert-curated options.**
```

---

## Usage Examples

### Example 1: Healthcare Patient Portal

```
# User initiates
User: "I'm building a patient portal for telemedicine appointments"

# LLM invokes Stage 1
Claude: [Calls match-niche.ts]
        
        $ node scripts/match-niche.ts "patient portal for telemedicine appointments"
        
        {
          "matched_niche": "med-01",
          "niche_name": "Medical/Healthcare",
          "confidence": 0.94,
          "constraints": {
            "layout_density": "spacious",
            "typography_style": "approachable-clinical",
            "accessibility_level": "AAA"
          }
        }
        
        "I've identified this as a Medical/Healthcare application with:
         - Spacious layouts (medical readability)
         - Approachable-clinical typography
         - AAA accessibility requirements
         
         Proceed with healthcare constraints? (yes/no)"

# User confirms
User: "Yes"

# LLM invokes Stage 2
Claude: [Calls generate-layouts.ts]
        
        $ node scripts/generate-layouts.ts med-01 .design-pipeline
        
        ✅ Generated 15 layouts
        
        "📄 Preview: .design-pipeline/layouts/preview.html
        
         Here are 15 healthcare-optimized layouts:
         
         1. Three-column layout with generous padding
         2. Card grid for appointment scheduling
         3. Asymmetric hero with patient dashboard
         ...
         
         Select your top 3 (e.g., '3, 8, 12')"

# User selects
User: "3, 8, 12"

# LLM invokes Stage 3
Claude: [Calls filter-typography.ts and apply-typography-to-layout.ts]
        
        $ node scripts/filter-typography.ts med-01
        # Returns 15 font pairings
        
        $ node scripts/apply-typography-to-layout.ts \
          .design-pipeline/layouts/option-08.svg \
          '<pairings_json>' \
          .design-pipeline/typography
        
        ✅ Generated 15 typography previews
        
        "📄 Preview: .design-pipeline/typography/preview.html
         
         Here are 15 healthcare-appropriate font pairings applied to your selected layout:
         
         1. Inter + Source Sans 3 (Approachable Clinical)
         2. IBM Plex Sans + Open Sans (Modern Precision)
         ...
         
         Select your top 3 pairings (e.g., '2, 7, 11')"

# User selects
User: "2, 7, 11"

# LLM invokes Stage 4
Claude: [Calls combine-previews.ts]
        
        $ node scripts/combine-previews.ts \
          '["option-03","option-08","option-12"]' \
          '["typo-02","typo-07","typo-11"]' \
          .design-pipeline
        
        # Generates 9 combinations:
        # (layouts 3,8,12) × (fonts 2,7,11) = 9 options
        
        "📄 Preview: .design-pipeline/combinations/preview.html
         
         I've generated 9 full combinations. Each shows your selected 
         layout with fonts applied:
         
         1. Layout 3 + Inter/Source Sans
         2. Layout 3 + IBM Plex Sans/Open Sans
         ...
         
         Select your favorite (1-9)"

# User selects final
User: "5"

# LLM invokes Stage 5 (optional palette variations)
Claude: "Would you like to see alternative color palette variations 
         applied to your final design? (yes/no)"

User: "No, use the default healthcare palette"

# LLM invokes Stage 6
Claude: [Calls generate-tokens.ts]
        
        $ node scripts/generate-tokens.ts .design-pipeline
        
        ✅ Generated: design-tokens.css
        ✅ Generated: shadcn-tokens.css
        ✅ Generated: shadcn.tailwind.config.js
        ✅ Generated: daisyui-tokens.css
        ✅ Generated: daisyui.tailwind.config.js
        ✅ Generated: agnosticui-tokens.css
        ✅ Generated: aceternity.tailwind.config.js
        ✅ Generated: magicui.tailwind.config.js
        ✅ Generated: nextui.tailwind.config.js
        ✅ Generated: design_manifest.json
        ✅ Generated: IMPLEMENTATION.md
        
        "✅ Your bespoke healthcare design system is complete!
         
         📦 Files in .design-pipeline/:
         - CSS tokens (generic, shadcn, DaisyUI, AgnosticUI)
         - Tailwind configs (shadcn, DaisyUI, Aceternity, Magic UI, NextUI)
         - Implementation guide
         
         📖 See IMPLEMENTATION.md for framework integration instructions.
         
         Your design decisions:
         - Layout: Three-column spacious (option-08)
         - Fonts: IBM Plex Sans + Open Sans
         - Colors: Healthcare Calm (AAA accessible)
         
         All decisions are versioned in state.json for future reference."
```

---

### Example 2: Fintech Trading Dashboard

```
User: "Build a crypto trading dashboard with real-time price charts"

Claude: [Calls match-niche.ts]
        
        Matched: fin-01 (Fintech/Trading)
        Constraints: high-density layouts, monospace precision, status indicators
        
        "Proceed with fintech constraints?"

User: "Yes"

Claude: [Generates 15 high-density fintech layouts]
        "Preview: .design-pipeline/layouts/preview.html
         Select top 3 layouts"

User: "1, 5, 9"

Claude: [Filters monospace-focused typography]
        [Applies to selected layouts]
        "Preview: .design-pipeline/typography/preview.html
         Select top 3 font pairings"

User: "1, 3, 8"

Claude: [Combines 9 options]
        "Preview: .design-pipeline/combinations/preview.html
         Select final (1-9)"

User: "4"

Claude: "Show color palette variations? (Trading Pro has green/red status indicators)"

User: "Yes, show me options"

Claude: [Generates palette variations]
        "Preview: .design-pipeline/palette-variations/preview.html
         
         1. Trading Pro (default): Blue primary, green gains, red losses
         2. Dark Mode Optimized: Muted colors for low-light trading
         3. High Contrast: Meets AAA for accessibility
         
         Select palette (1-3)"

User: "1"

Claude: [Generates all token formats]
        
        "✅ Fintech design system ready!
         
         Key features:
         - IBM Plex Mono for precise numeric display
         - High-density layout for max data visibility
         - Green/red status colors (meets AA contrast)
         - All formats: generic CSS, shadcn, DaisyUI, Aceternity, Magic UI, NextUI
         
         See IMPLEMENTATION.md for integration."
```

---

## Success Metrics

The pipeline successfully "kills AI slop" when:

### Qualitative Metrics

1. ✅ **Bespoke Spatial Relationships**
   - Generated layouts use coordinate systems not found in generic templates
   - Layouts respect niche-specific density constraints
   - Whitespace ratios match application requirements

2. ✅ **Niche-Appropriate Typography**
   - Font pairings match domain needs (e.g., monospace for fintech, clinical for healthcare)
   - No generic "Roboto + Open Sans" defaults
   - Rationale provided for each pairing

3. ✅ **Accessible Color Systems**
   - Meet or exceed WCAG standards for niche (AAA for healthcare, AA for creative)
   - Status colors appropriate to domain (green/red for trading, emergency hierarchy for medical)
   - Contrast ratios documented and tested

4. ✅ **Faithful Implementation**
   - Final code matches blueprint coordinates exactly
   - No framework-imposed drift (e.g., Tailwind defaults overriding design)
   - Typography CSS imports match selections precisely

5. ✅ **Visual Typography/Color Previews**
   - Users see real fonts rendered in context (not just font names)
   - Full-context combinations show layout + typography + colors together
   - Color swatches visualize palette relationships
   - Interactive HTML previews enable informed decisions

### Quantitative Metrics

6. ✅ **Reduced Iteration Time**
   - Time from concept to tokens < 15 minutes (vs. hours of trial-and-error prompting)
   - Re-running individual stages < 2 minutes
   - Zero manual CSS variable writing

7. ✅ **Deterministic Outputs**
   - Same niche + same selections = identical tokens (100% reproducibility)
   - No LLM temperature-induced variation
   - Versionable design decisions (state.json in git)

### User Satisfaction Indicators

8. ✅ **Design Intent Preservation**
   - Users can articulate design rationale from CSV data
   - Designers can maintain/extend CSVs without developer help
   - Non-designers understand constraint reasoning

9. ✅ **Framework Flexibility**
   - Users successfully switch frameworks without redesign
   - Community contributes new framework profiles (Aceternity, Magic UI, NextUI, etc.)
   - Generic tokens work in custom design systems

10. ✅ **UI Library Integration**
    - Generated configs work immediately with modern UI libraries
    - No manual theming or documentation reading required
    - Bespoke colors automatically applied to component libraries

---

## Maintenance & Evolution

### CSV Database Updates

**Frequency:** Quarterly review or as frameworks release major versions

**Process:**
1. Check framework changelogs for token changes
2. Update relevant profile CSV
3. Bump version in CSV header
4. Regenerate test outputs
5. Document breaking changes

### Community Contributions

**Encouraged:**
- New niche profiles (e.g., "e-commerce," "gaming")
- New framework profiles (e.g., "Material-UI," "Chakra")
- New UI library profiles (community-requested libraries)
- Additional layout templates
- Font pairing recommendations

**Contribution Guidelines:**
- Include rationale in CSV comments
- Provide example output
- Test against real projects
- Document accessibility considerations

### Future Enhancements

**Phase 2 (Post-MVP):**
- **Component Library Mapping**: Auto-map coordinates to AgnosticUI, Radix, shadcn, DaisyUI components
- **A/B Testing**: Generate multiple complete systems for comparison
- **Figma Export**: Convert tokens to Figma variables
- **Version Control**: Track design system evolution across projects

**Phase 3 (Advanced):**
- **ML-Enhanced Matching**: Use embeddings for better niche detection
- **Dynamic Template Generation**: Parametric SVG generation from constraints
- **Real-time Collaboration**: Multiple designers refining same pipeline
- **Component Generation**: Auto-generate React/Vue/Svelte components from tokens

---

## Appendix: Key Design Decisions

### Why Primitive Shapes Over Complex Paths?

**The Problem with Path-Based Wireframes:**
- LLMs struggle to reason about bezier curves and complex path data
- Parametric variation requires mathematical path manipulation (error-prone)
- Designers can't easily understand or modify path coordinates
- Copy-paste from design tools produces non-semantic paths

**The Primitive Shapes Solution:**
1. **Spatial Reasoning**: `<rect x="100" width="700">` is semantically clear
2. **Parametric Control**: Simple arithmetic on coordinates (`x + 20`, `width * 1.15`)
3. **Human Readability**: Designers can edit coordinates directly
4. **Prevents Slop**: Forces system to calculate layout math, not copy generic patterns

**Implementation Rules:**
- ✅ **PREFER**: `<rect>`, `<circle>`, `<line>`
- ⚠️ **LIMIT**: `<path>` only for rounded corners or complex icons
- ❌ **AVOID**: Paths for rectangles, straight lines, or simple shapes

**Example Conversion:**
```xml
<!-- ❌ BAD: Path-based rectangle -->
<path d="M100 100H800V700H100V100Z" fill="white"/>

<!-- ✅ GOOD: Primitive rectangle -->
<rect x="100" y="100" width="700" height="600" fill="white"/>

<!-- ⚠️ ACCEPTABLE: Path for rounded corners (if necessary) -->
<path d="M788 100H112C105.373 100..." fill="white"/>

<!-- ✅ BETTER: Rect with rx attribute -->
<rect x="100" y="100" width="700" height="600" rx="12" fill="white"/>
```

**Quality Metrics:**
- Target: 80%+ primitives, <20% paths
- Warning threshold: >50% paths indicates non-optimal template
- Scripts validate and warn about path overuse

---

### Why CSV Over JSON?

1. **Human Editability**: Non-developers can maintain design knowledge
2. **Diff-Friendly**: Git diffs show exactly what changed
3. **Spreadsheet Compatibility**: Open in Excel/Sheets for bulk editing
4. **Simplicity**: No nested structures to navigate

### Why TypeScript Scripts Over Pure LLM?

1. **Determinism**: Eliminate temperature-induced variation
2. **Performance**: Fast execution vs. LLM inference latency
3. **Testability**: Unit test data transformations
4. **Debuggability**: Stack traces vs. prompt debugging

### Why Handlebars Over String Templates?

1. **Logic Separation**: Templates stay declarative
2. **Partial Support**: Reuse template components
3. **Community Familiarity**: Industry standard
4. **Escaping**: Automatic HTML/CSS escaping

### Why Multi-Format Output?

1. **User Choice**: Don't force framework lock-in
2. **Migration Path**: Easy framework switching
3. **Learning Tool**: Compare framework conventions
4. **Ecosystem Compatibility**: Work with existing tools

### Why Visual Previews for Typography/Colors?

1. **Informed Decisions**: Users see actual fonts rendered, not just names
2. **Context Matters**: Typography looks different at scale vs. in lists
3. **Color Relationships**: Swatches show how palette colors work together
4. **Prevents Regret**: Reduces need for re-running stages after seeing final output

---

## Document Status

**Version:** 2.0  
**Last Updated:** 2026-02-04  
**Status:** Ready for Implementation

**Next Steps:**
1. Implement TypeScript scripts (including typography preview and palette combination scripts)
2. Populate initial CSV databases (including UI library profiles)
3. Create Handlebars templates (including UI library configs)
4. Write SKILL.md orchestration
5. Build example SVG wireframe templates
6. Document community contribution process
7. Create tutorial video/documentation