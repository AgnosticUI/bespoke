# Bespoke Design Pipeline — MVP v1.0 Plan

## Status: In Progress

---

## Workstream 1: Doc Fixes (DOCUMENTATION.md + SKILL.md)

Reframe, fix inaccuracies, remove overpromises, add clear value proposition.

### Priority Fixes

| # | Priority | Issue | Affects | Status |
|---|----------|-------|---------|--------|
| 1 | **P0** | Add clear value proposition — "here's what you get" upfront | Both docs | [ ] |
| 2 | **P0** | Fix output file names to match actual generation (e.g., `shadcn-globals.css` not `shadcn-tokens.css`) | Both docs | [ ] |
| 3 | **P0** | Fix layout count claims (docs say 15, reality is 8; target is 12-15) | Both docs | [ ] |
| 4 | **P1** | Remove/demote PNG preview & Puppeteer claims — pipeline works with HTML previews only | Documentation | [ ] |
| 5 | **P1** | Drop Extended UI Libraries (Aceternity, Magic UI, NextUI) — not implemented | Documentation | [ ] |
| 6 | **P1** | "Each skill" → "Each stage" language fix | Documentation | [ ] |
| 7 | **P1** | Qualify "Deterministic Results" — true at script layer, not full pipeline | Documentation | [ ] |
| 8 | **P1** | Update pipeline diagrams to include reasoning row + constraints flow | Documentation | [ ] |
| 9 | **P2** | Expand User Interaction Model to cover all 6 stages (not just layout) | Documentation | [ ] |
| 10 | **P2** | Acknowledge 15-niche scope honestly (not "9 covers everything") | Both docs | [ ] |
| 11 | **P2** | Mark workflow examples as illustrative until validated with real runs | Documentation | [ ] |

### Value Proposition (agreed framing)

> **What you get:** Run the Bespoke pipeline, answer 4-5 design questions, and in ~10 minutes you'll have a complete, production-ready design token system. The output includes:
> - CSS custom properties (works with any framework)
> - shadcn/ui theme (HSL variables + Tailwind config)
> - DaisyUI theme
> - AgnosticUI token overrides
> - A design manifest (JSON) with all specifications
> - An implementation guide with copy-paste setup instructions
>
> These tokens encode your chosen layout structure, typography, and color palette — all filtered for your specific application type (not generic defaults).

### Key Reframes

- **"Deterministic Results"** → "Script outputs are deterministic — same parameters produce identical results. Design decisions are captured in `state.json`, making them reproducible and versionable."
- **"LLM as Pure Orchestrator"** → "The LLM interprets user intent in Stage 1, but is constrained to curated data in all subsequent stages. It calls scripts, parses JSON, and presents options — it never invents design choices."
- **"Each skill operates in isolation"** → "Each stage operates in isolation, producing structured artifacts"
- **Pipeline funnel** → Update numbers to reflect reality (8 layouts now, 12-15 target)

---

## Workstream 2: Niche & Layout Expansion

### Niche Expansion: 9 → 15

**Existing 9:** dashboard, marketing, saas, blog, ecommerce, portfolio, medical, fintech, industrial

**Add for v1.0 (6 new):**

| niche_id | Display Name | Rationale |
|----------|-------------|-----------|
| `education` | Education/LMS | Huge market, distinct design needs (course content, student dashboards) |
| `realestate` | Real Estate | Common request, very visual (listings, maps, property detail) |
| `social` | Social/Community | Forums, social networks — distinct interaction patterns |
| `food` | Food/Restaurant | Ordering, menus, reservations — most common small-business web project |
| `travel` | Travel/Booking | Reservation systems, itineraries — distinct layout needs |
| `nonprofit` | Non-profit/Government | Public service, donations — trust/accessibility-heavy |

**Deferred to v1.1:** Gaming, News/Media, Legal/Professional, Fitness/Wellness

### Layout Count Target: 12 minimum, 15 target per niche

- Current: 8 per niche x 9 niches = 72 SVGs
- Target: 12-15 per niche x 15 niches = 180-225 SVGs
- Existing 9 niches need 4-7 more layouts each
- New 6 niches need 12-15 layouts from scratch

### What needs updating for each new niche:

1. `data/niche-taxonomy.json` — Add niche + application types + keywords
2. `layouts/{niche_id}/` — Create 12-15 SVG wireframes
3. `data/typography.csv` — Tag existing rows + add niche-specific pairings
4. `data/colors.csv` — Tag existing rows + add niche-specific palettes
5. `data/application_type.csv` — Add reasoning rows for new application types
6. `data/constraints/` CSVs — Verify constraints apply (most are universal)
7. `match-niche.ts` keyword matching — Will pick up from taxonomy automatically

---

## Workstream 3: AgnosticUI Demo (Separate — Rob-led)

**Goal:** Validate pipeline end-to-end with a real app.

**Plan:**
1. Add a 3rd AgnosticUI playbook (Settings/Profile or Feed/Home page)
2. Run Bespoke pipeline to generate ~10 "skins" for the 3-playbook example app
3. Build skin switcher (dropdown or `?theme=N` URL param)
4. Use real pipeline runs as the basis for doc workflow examples

**Outcome:** Proves the value prop — "from description to themed app in 10 minutes"

**Status:** Not started (blocked on Workstreams 1 & 2)

---

## Decisions Made

- Pipeline positioning: **"Bespoke design token generator and design inception tool"**
- Core frameworks (v1.0): Generic CSS, shadcn/ui, DaisyUI, AgnosticUI
- Extended frameworks (Aceternity, Magic UI, NextUI): **Removed from v1.0 scope**
- PNG inline previews via Puppeteer: **Demoted to optional/future** — HTML previews are the primary path
- Layout count: **12 floor, 15 target** per niche
- Niche count: **15 for v1.0** (9 existing + 6 new)
