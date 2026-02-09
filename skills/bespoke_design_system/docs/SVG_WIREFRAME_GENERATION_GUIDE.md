# SVG Wireframe Generation Guide

## Purpose
This guide helps generate low-fidelity SVG wireframe layouts for the Design Token Generator application. These wireframes represent broad layout patterns that will later be themed with typography and color palettes.

## Design Principles

### Visual Style
- **Low-fidelity**: Abstract representation, not pixel-perfect designs
- **Grayscale only**: Uses 3-4 shades of gray to maintain neutrality
- **Shape-based**: Uses basic SVG primitives (rect, circle, line, path)
- **Recognizable patterns**: Should clearly communicate layout structure at a glance

### Technical Specifications

#### Canvas Size
```
Width: 1200px
Height: 800px
ViewBox: 0 0 1200 800
```

#### Color Palette (Grayscale)
```
#FFFFFF - White backgrounds, content areas, cards
#EEEEEE - Light gray for subtle backgrounds
#DDDDDD - Medium gray for primary borders, navigation bars, footers
#CCCCCC - Darker borders, secondary dividers
#9CA3AF - Icon placeholders, text line indicators, accents
```

#### Design Constraints
- **Margins**: 20-40px from canvas edges (use 80-100px for sidebars)
- **Padding**: 20-30px inside containers
- **Border Radius**: 0px (sharp) for dashboards, 8-12px (rounded) for marketing/SaaS
- **Stroke Width**: 1-2px for borders and lines
- **Grid Spacing**: Use multiples of 20px for alignment

### Common Components

#### 1. Navigation Bars
```svg
<!-- Top horizontal nav -->
<rect x="0" y="0" width="1200" height="60" fill="#DDDDDD"/>

<!-- Vertical sidebar -->
<rect x="0" y="0" width="80" height="800" fill="#DDDDDD"/>
```

#### 2. Content Cards
```svg
<!-- Rounded card with border -->
<rect x="100" y="100" width="300" height="200" 
      rx="12" fill="white" stroke="#CCCCCC" stroke-width="1"/>

<!-- Sharp dashboard panel -->
<rect x="100" y="100" width="300" height="200" 
      fill="white" stroke="#CCCCCC" stroke-width="1"/>
```

#### 3. Text Placeholders
```svg
<!-- Heading line -->
<rect x="120" y="120" width="180" height="16" rx="4" fill="#9CA3AF"/>

<!-- Body text lines (3 lines) -->
<rect x="120" y="150" width="260" height="8" rx="4" fill="#CCCCCC"/>
<rect x="120" y="165" width="240" height="8" rx="4" fill="#CCCCCC"/>
<rect x="120" y="180" width="250" height="8" rx="4" fill="#CCCCCC"/>
```

#### 4. Buttons
```svg
<!-- Primary CTA button -->
<rect x="120" y="220" width="140" height="44" rx="6" 
      fill="#9CA3AF" stroke="#9CA3AF" stroke-width="2"/>

<!-- Outlined button -->
<rect x="280" y="220" width="140" height="44" rx="6" 
      fill="white" stroke="#CCCCCC" stroke-width="2"/>
```

#### 5. Images/Media Placeholders
```svg
<!-- Rectangle with X through it -->
<rect x="100" y="100" width="400" height="300" fill="#EEEEEE" stroke="#CCCCCC"/>
<line x1="100" y1="100" x2="500" y2="400" stroke="#CCCCCC" stroke-width="2"/>
<line x1="500" y1="100" x2="100" y2="400" stroke="#CCCCCC" stroke-width="2"/>

<!-- Circle avatar -->
<circle cx="150" cy="150" r="40" fill="#9CA3AF"/>
```

#### 6. Icons (Simple Indicators)
```svg
<!-- Hamburger menu -->
<line x1="30" y1="20" x2="50" y2="20" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"/>
<line x1="30" y1="30" x2="50" y2="30" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"/>
<line x1="30" y1="40" x2="50" y2="40" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"/>

<!-- Search icon (circle + line) -->
<circle cx="40" cy="40" r="12" stroke="#9CA3AF" stroke-width="2" fill="none"/>
<line x1="49" y1="49" x2="58" y2="58" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"/>
```

## Layout Patterns by Niche

### Dashboard Layouts

**Common Elements:**
- Left or top navigation
- Grid of metric cards/charts
- Sharp corners (minimal border-radius)
- Dense information architecture
- Consistent spacing (20px grid)

**Typical Patterns:**
1. Sidebar + 2x3 card grid
2. Top nav + 4 metric cards + 2 large charts
3. Sidebar + main chart + 3 right panels
4. Full-width top nav + 3-column layout
5. Sidebar + stacked horizontal panels

### Marketing/Landing Page Layouts

**Common Elements:**
- Hero section (large, prominent)
- CTA buttons (clear, emphasized)
- Feature sections (3-column grids)
- Rounded corners (8-12px)
- Generous whitespace
- Social proof sections

**Typical Patterns:**
1. Centered hero + 3-column features
2. Split hero (50/50 text/image) + benefits grid
3. Full-width hero + alternating feature sections
4. Nav + hero + pricing table
5. Hero + logo carousel + 3-column features

### SaaS Product Layouts

**Common Elements:**
- Persistent sidebar navigation
- Main content area (forms, tables, settings)
- Top header with search/profile
- Panels and modals
- Mix of sharp and rounded corners

**Typical Patterns:**
1. Sidebar + form layout + right sidebar (settings)
2. Top nav + sidebar + data table
3. Sidebar + kanban board columns
4. App header + wizard/stepper + content area
5. Sidebar + calendar/timeline view

### Blog/Content Layouts

**Common Elements:**
- Large readable content area
- Optional sidebar (widgets, TOC)
- Article header (title, meta, image)
- Rounded corners for cards
- Typography-focused (lots of text placeholders)

**Typical Patterns:**
1. Centered article + right sidebar
2. Magazine grid (3-4 cards)
3. Featured post + 2-column grid
4. Full-width article (no sidebar)
5. Left sidebar + main article

## File Naming Convention

```
{niche}_{pattern-description}_{variant}.svg

Examples:
dashboard_sidebar-metrics-grid_01.svg
marketing_hero-centered-features_02.svg
saas_sidebar-table-panel_01.svg
blog_article-right-sidebar_01.svg
```

## Quality Checklist

Before finalizing an SVG wireframe, verify:

- [ ] Canvas is exactly 1200×800px
- [ ] ViewBox is set to "0 0 1200 800"
- [ ] Uses only approved grayscale colors
- [ ] No text elements (use rect placeholders instead)
- [ ] Stroke widths are 1-2px
- [ ] Elements align to 20px grid where possible
- [ ] Border radius appropriate for niche (0px dash, 8-12px marketing)
- [ ] Pattern is immediately recognizable
- [ ] Layout is distinct from other variants in same niche
- [ ] File size is under 10KB (keep SVG simple)

## Generation Prompt Template

When generating new wireframes, use this prompt:

```
Create a low-fidelity SVG wireframe for a [NICHE] application with the following layout pattern:

Pattern: [DESCRIPTION]
Key Elements: [LIST MAIN COMPONENTS]
Layout Structure: [GRID/FLEXBOX DESCRIPTION]

Requirements:
- Canvas: 1200×800px, viewBox="0 0 1200 800"
- Colors: Only use #FFFFFF, #EEEEEE, #DDDDDD, #CCCCCC, #9CA3AF
- Shapes: Use rect, circle, line, path only
- Style: [Sharp corners for dashboards | Rounded corners (8-12px) for marketing]
- No text elements, use rect placeholders for text

Focus on clear, recognizable layout structure over detail.
```

## Example Full Wireframe

```svg
<svg width="1200" height="800" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Sidebar Navigation -->
  <rect x="0" y="0" width="80" height="800" fill="#DDDDDD"/>
  <circle cx="40" cy="40" r="20" fill="#9CA3AF"/>
  
  <!-- Top Header -->
  <rect x="80" y="0" width="1120" height="60" fill="#DDDDDD"/>
  
  <!-- Main Content Area - Metric Cards Grid -->
  <rect x="120" y="100" width="340" height="140" fill="white" stroke="#CCCCCC"/>
  <rect x="140" y="120" width="100" height="24" rx="4" fill="#9CA3AF"/>
  <rect x="140" y="160" width="200" height="12" rx="4" fill="#CCCCCC"/>
  
  <rect x="500" y="100" width="340" height="140" fill="white" stroke="#CCCCCC"/>
  <rect x="520" y="120" width="120" height="24" rx="4" fill="#9CA3AF"/>
  <rect x="520" y="160" width="220" height="12" rx="4" fill="#CCCCCC"/>
  
  <rect x="880" y="100" width="280" height="140" fill="white" stroke="#CCCCCC"/>
  <rect x="900" y="120" width="100" height="24" rx="4" fill="#9CA3AF"/>
  <rect x="900" y="160" width="180" height="12" rx="4" fill="#CCCCCC"/>
  
  <!-- Large Chart Area -->
  <rect x="120" y="280" width="720" height="480" fill="white" stroke="#CCCCCC"/>
  <rect x="140" y="300" width="140" height="20" rx="4" fill="#9CA3AF"/>
  
  <!-- Side Panel -->
  <rect x="880" y="280" width="280" height="480" fill="white" stroke="#CCCCCC"/>
  <rect x="900" y="300" width="120" height="16" rx="4" fill="#9CA3AF"/>
  
  <!-- Footer -->
  <rect x="80" y="760" width="1120" height="40" fill="#DDDDDD"/>
</svg>
```

## Tips for Efficient Generation

1. **Start with structure**: Create the main containers first (nav, content areas, footer)
2. **Work in layers**: Background → containers → content placeholders → details
3. **Use comments**: Group related elements with SVG comments
4. **Keep it simple**: If you're spending more than 5 minutes on one wireframe, simplify
5. **Test at scale**: Zoom out to ensure layout is recognizable at thumbnail size

## Common Mistakes to Avoid

❌ Using actual text (use rect placeholders instead)
❌ Too much detail (this is lo-fi, not hi-fi)
❌ Colors outside the approved grayscale palette
❌ Inconsistent spacing/alignment
❌ Canvas size other than 1200×800
❌ Forgetting viewBox attribute
❌ Border radius on dashboard layouts (keep sharp)
❌ File sizes over 10KB (SVG should be minimal)

## Expanding the Library

When you need more layouts:

1. **Identify gaps**: What layout patterns are missing?
2. **Research patterns**: Look at real sites in that niche
3. **Abstract the layout**: Strip to basic shapes and structure
4. **Generate SVG**: Follow this guide
5. **Review for distinctness**: Is it clearly different from existing layouts?
6. **Add to library**: Name consistently and catalog

---

**Last Updated**: February 2026
**Version**: 1.0
**For**: Design Token Generator Application
