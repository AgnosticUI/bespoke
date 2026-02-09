# Dataset Strategy: Copy-Paste + Attribution

## Core Insight
**Don't build datasets from scratch. Find MIT/CC-licensed sources, copy-paste, attribute.**

---

## ✅ Recommended Sources (All MIT/CC Licensed)

### 1. **Typography Pairings**
- ✅ **ui-ux-pro-max-skill** (MIT) - Already have 57 pairings
- 🔍 **fontpair.co** - Check if they have exportable data
- 🔍 **typewolf** - May have JSON exports
- 🔍 **beautiful-web-type** - GitHub repo might have data

**Action:** Find 2-3 more MIT sources, paste into single CSV, dedupe.

---

### 2. **Color Palettes**
- ✅ **Tailwind CSS Colors** (MIT) - Already structured as semantic scales
- ✅ **Radix Colors** (MIT) - Accessibility-focused, well-documented
- ✅ **Open Color** (MIT) - 13 colors × 10 shades each
- ✅ **Ant Design Colors** (MIT) - Professional palette system
- 🔍 **coolors.co popular palettes** - Check license

**Action:** 
```bash
# Literally just copy-paste from their docs/GitHub
cat tailwind-colors.json radix-colors.json open-color.json > combined.json
node convert-to-csv.ts
```

---

### 3. **Layout Templates/Patterns**
- ✅ **shadcn/ui examples** (MIT) - React components with coordinates
- ✅ **daisyui components** (MIT) - Component library layouts
- ✅ **tailwindui free components** (MIT) - Some layouts are free
- 🔍 **uiverse.io** - Check individual component licenses
- 🔍 **aceternity-ui examples** - Check their GitHub

**Strategy:** 
- Don't create SVG wireframes yet
- Use existing component screenshots → describe in CSV
- Phase 2: Convert top 5 to SVG primitives (1-2 days max)

---

### 4. **Framework Profiles**
- ✅ **shadcn/ui theme vars** - Literally in their docs
- ✅ **agnosticui** - In docs
- ✅ **daisyui theme config** - In their docs
- ✅ **nextui customization** - In their docs
- ✅ **aceternity/magicui** - Check their GitHub repos

**Action:**
```typescript
// scrape-framework-docs.ts (30 min per framework)
const shadcnVars = fetchFromDocs('https://ui.shadcn.com/docs/theming');
const csv = convertToCSV(shadcnVars);
// Done.
```

---

## 📋 ATTRIBUTIONS.md Format

```markdown
# Prior Art & Attributions

This project combines curated design knowledge from multiple MIT/CC-licensed sources.

## Typography Pairings
- **ui-ux-pro-max-skill** (MIT License)
  - Source: [GitHub URL]
  - 57 font pairings with rationale
  - Used: All pairings with niche mapping added

- **fontpair.co** (MIT License)
  - Source: [URL]
  - 30 additional pairings
  - Used: Deduplicated and merged

## Color Systems
- **Tailwind CSS** (MIT License)
  - Source: https://tailwindcss.com/docs/customizing-colors
  - Full color palette with semantic naming

- **Radix Colors** (MIT License)
  - Source: https://www.radix-ui.com/colors
  - Accessibility-tested color scales

- **Open Color** (MIT License)
  - Source: https://yeun.github.io/open-color/
  - 13 color families with 10 shades each

## Framework Profiles
- **shadcn/ui documentation** (MIT License)
  - Source: https://ui.shadcn.com/docs/theming
  - CSS variable mappings extracted from official docs

- **DaisyUI documentation** (MIT License)
  - Source: https://daisyui.com/docs/themes/
  - Theme configuration structure from docs

## Layout Patterns
- Inspired by shadcn/ui component layouts (MIT)
- Adapted from daisyui component library (MIT)

## Methodology
All data was:
1. Copied from MIT/CC-licensed sources
2. Converted to CSV format
3. Enhanced with niche mappings and rationale
4. Validated for accessibility (WCAG contrast ratios)

## License Compatibility
All source materials are MIT or CC-licensed and allow commercial use, 
modification, and redistribution with attribution.
```

---

## ⚡ Realistic Timeline (Copy-Paste Approach)

| Task | Time | Method |
|------|------|--------|
| Typography CSV | 30 min | Copy ui-ux-pro-max + 1-2 others, dedupe in Excel |
| Color palettes CSV | 1 hour | Copy Tailwind + Radix + Open Color JSON, convert to CSV |
| Framework profiles | 3 hours | Copy-paste from official docs (6 frameworks × 30 min) |
| Niche profiles CSV | 1 hour | Write 5 niches manually (it's just metadata) |
| Layout metadata CSV | 2 hours | Describe 5 layouts per niche (no SVG yet) |
| Validation script | 2 hours | Check URLs, contrast ratios, deduplication |
| ATTRIBUTIONS.md | 30 min | Document sources |
| **TOTAL** | **~10 hours** | **1-2 days of work** |

---

## 🎯 MVP Dataset (Copy-Paste Strategy)

### **What You Actually Need for MVP:**

```
data/
├── niche_profiles.csv           # 5 niches × 5 fields = 25 cells (manual)
├── typography.csv               # Copy ui-ux-pro-max (57 rows) + add niche_id column
├── color_systems.csv            # Copy Tailwind + Radix (50 palettes)
├── layout_templates.csv         # 5 niches × 5 layouts = 25 descriptions (no SVG!)
└── framework-profiles/
    ├── shadcn-profile.csv       # Copy from shadcn docs
    ├── daisyui-profile.csv      # Copy from daisyui docs
    ├── nextui-profile.csv       # Copy from nextui docs
    └── aceternity-profile.csv   # Copy from their GitHub
```

**No SVG wireframes needed for MVP!** Use placeholder descriptions:
```csv
layout_id,description,density,columns
layout-med-01,"Three-column dashboard with left sidebar and top nav",spacious,3
layout-med-02,"Card grid layout with prominent hero section",spacious,2
```

Phase 2 (after validation): Hire Fiverr designer for $100 to convert top 5 layouts to SVG.

---

## 🚀 Immediate Next Steps (This Weekend)

### **Saturday (4 hours)**
1. ✅ Copy ui-ux-pro-max typography CSV → `data/typography.csv`
2. ✅ Add `niche_id` column via find-replace in Excel:
   - "healthcare" → `med-01`
   - "financial" → `fin-01`
   - etc.
3. ✅ Copy Tailwind colors from their docs → convert to CSV
4. ✅ Copy Radix colors → merge with Tailwind
5. ✅ Write 5 rows in `niche_profiles.csv` (manual, 30 min)

### **Sunday (6 hours)**
1. ✅ Copy-paste shadcn CSS variables from docs → CSV
2. ✅ Copy-paste daisyui theme config → CSV
3. ✅ Copy-paste nextui theme config → CSV
4. ✅ Write `layout_templates.csv` (descriptions only, no SVG)
5. ✅ Write validation script (check URLs work)
6. ✅ Write ATTRIBUTIONS.md
7. ✅ Test `match-niche.ts` script with real data

### **Monday: You have an MVP dataset**

---

## 🔥 Key Principle

**"Perfect is the enemy of shipped."**

- Don't create 15 unique SVG layouts per niche
- Don't spend weeks curating
- **DO**: Copy MIT-licensed sources, attribute properly, ship
- **THEN**: Iterate based on real usage

The PRD is achievable in **2-3 days** with this approach, not 3 weeks.