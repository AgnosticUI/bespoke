# Plan: Integrate `application_type.csv` Reasoning Layer

## Context

The Bespoke pipeline infers `niche_id` + `application_type` in Stage 1, but `application_type` is barely used downstream. Meanwhile, ui-ux-pro-max has 97 product types with conditional reasoning data that makes LLM outputs far more deterministic and design-literate.

We want `data/application_type.csv` — a reasoning CSV where each row encodes **opinionated, research-derived design rules** for a specific product type. The user authored the SaaS (General) row as the template. Remaining rows will be added incrementally over time.

For each product type in the ui-ux-pro-max (97), we collaboratively rewrite one CSV row by grounding it in established UX thought leadership (e.g., Nielsen Norman Group, Baymard, Refactoring UI).

**This plan covers:** create the CSV, add a SKILL.md section that tells the LLM how to use it, and rebuild the CLI so it's included.

# Application Type Row Derivation Guidelines

Each application type is represented by exactly one CSV row. See: skills/bespoke_design_system/data/application_type.csv

That row must function as deterministic UX guardrails derived from established UX research and practice.

The row should be sufficient for an LLM or designer to produce a competent first-pass product without relying on external examples.

---

## Research Inputs (Not Output)

For each product type, perform lightweight, targeted research into established UX thought leadership, such as:

- Nielsen Norman Group (usability, IA, interaction design)
- Baymard Institute (conversion, SaaS & e-commerce UX failure modes)
- Refactoring UI (practical UI decisions, layout, density)
- Interaction Design Foundation (interaction patterns, accessibility)

These sources inform judgment but must **never be named, cited, or quoted** in the CSV output.

## UI style bias

The new `ui_style_bias` can reference https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/src/ui-ux-pro-max/data/products.csv but adapt per the earlier Research Inputs above (which should come before ui_style_bias is derived; Research Inputs should take priority and the ui-ux-pro-max skill should just be a first stop, then, the Research Inputs above is utilized and prioritized to derive `ui_style_bias` value.

UPDATE: For now, I've copied products.csv locally right here into: skills/bespoke_design_system/data/products.csv so you don't have to search web.

## Translation Rule

Translate research findings into **plain-language, opinionated design rules** written in the voice of a senior product designer.

Do not describe trends.
Do not list options.
Make decisions.

## ⚠️ Warning: One thing to be careful about

When extending the CSV file:
❗ Never introduce an unescaped double quote inside a field

If you ever need quotes inside text, you must escape them like this:

> "He said ""do this first"" before continuing"

---

## Core Writing Principles

### 1. Behavior Over Aesthetics

Prioritize:

- How the interface behaves
- How users make decisions
- How errors are prevented or recovered
- How complexity is revealed or hidden

Visual style is secondary and must serve usability.

---

### 2. Do / Avoid Bias

Prefer directive framing, even when implicit:

- “Use X to achieve Y”
- “Avoid Z because it causes…”
- “Prioritize A over B when…”

The row should actively prevent common UX mistakes.

---

### 3. Determinism First

Each CSV field must:

- Reduce interpretive variance
- Constrain design freedom intentionally
- Pre-empt common failure modes for that product type
- Produce near-identical outcomes across repeated generations

Two senior designers following the row should reach highly similar solutions.

---

### 4. Product-Type-Specific Bias

Each row must encode the _primary UX optimization target_ for that product type
(e.g. time-to-value, trust, data density, discoverability, engagement).

Do not generalize across product types.

---

### 5. Eliminate Source Leakage

- No citations
- No named experts
- No academic tone
- No buzzwords without operational meaning

The row should read as applied judgment, not research notes.

---

## Completion Test (Mandatory)

Before finalizing a row, apply this test:

> “If an LLM followed only this row (with no external examples), would it reliably avoid the most common UX mistakes typical for this product type?”

- If **no** → revise
- If **yes** → the row is complete

## CSV Schema

8 columns, all quoted (fields contain commas):

| Column             | Purpose                                                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `application_type` | Display name (e.g., "SaaS (General)")                                                                                                                                 |
| `keywords`         | Comma-separated matching terms                                                                                                                                        |
| `visual_style`     | How the UI should feel — opinionated design direction, balancing clarity, hierarchy, and brand tone                                                                   |
| `landing_page`     | Landing/marketing page structure and content strategy; behavior-focused guidance for engagement & conversion                                                          |
| `dashboard_layout` | App/dashboard information hierarchy and structure; default layouts, navigation patterns, and feedback mechanisms                                                      |
| `color_palette`    | Color psychology and usage rules (not hex values); how brand, semantic, and accent colors are applied                                                                 |
| `essential_ux`     | Critical UX considerations, common pitfalls to avoid, and deterministic guidance on behavior, performance, and accessibility                                          |
| `ui_style_bias`    | Concise, high-level visual aesthetic guidance (5–12 words) that complements `visual_style` without overriding UX determinism; captures tone, motion, and polish hints |

Each field is a single prose paragraph — clear enough that an AI following only this row avoids the most common UX mistakes for that product type.

## How It Integrates

**The CSV is consumed by the LLM orchestrator, not by scripts.** No TypeScript changes needed.

The reasoning row acts as a **persistent context card** that the LLM carries through every stage. Today, `application_type` is inferred in Stage 1 and then goes dormant — scripts ignore it after typography filtering. This CSV restores `niche_id` + `application_type` as the active driver of every decision by giving the LLM concrete, opinionated guidance to apply at each choice point.

After Stage 1 returns `niche_id` + `application_type`, SKILL.md instructs the LLM to:

1. Read the matching row from `application_type.csv`
2. Carry it forward as active context through ALL subsequent stages
3. Use it to evaluate, rank, and frame every option presented to the user

**Per-stage usage:**

| Stage                    | Reasoning Fields Used                               | How                                                                                                                                                   |
| ------------------------ | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1 (Niche Match)**      | All fields                                          | Present the design philosophy for this product type; explain what principles will drive all downstream choices                                        |
| **2 (Layout Selection)** | `visual_style`, `dashboard_layout`, `ui_style_bias` | Evaluate which wireframes match the layout guidance and aesthetic hints; flag mismatches; recommend layouts that align both structurally and visually |
| **3 (Typography)**       | `visual_style`, `ui_style_bias`                     | Evaluate font pairings against the mood/feel described; recommend pairings that reinforce both hierarchy and visual tone                              |
| **4 (Combinations)**     | `visual_style`, `dashboard_layout`, `ui_style_bias` | Assess which layout + font + style combinations best embody the guidance, balancing UX and visual polish                                              |
| **5 (Color Palette)**    | `color_palette`, `ui_style_bias`                    | Evaluate palettes against the color usage rules and style hints; flag decorative palettes if guidance says "restrained"                               |
| **6 (Token Output)**     | `essential_ux`, all fields                          | Include reasoning summary in design manifest; reference `essential_ux` in IMPLEMENTATION.md; capture any UI-style guidance for developer handoff      |

## Files to Create/Modify (2 files)

### 1. `data/application_type.csv` (NEW)

Header + SaaS (General) row using the user's authored content. All fields properly quoted since they contain commas.

### 2. `SKILL.md` (MODIFY)

**Add new section** "Design Reasoning Reference" between Stage 1 and Stage 2:

- How to match: compare user's description against the `keywords` column
- How to use: reference the 5 guidance fields at appropriate stages
- Gut check rule: "Does this option align with the reasoning row's guidance?"

**Add concrete instructions** to Stages 2, 3, 4, 5, and 6 making the reasoning row an active part of each stage's decision process — not just a reminder but explicit guidance like "Evaluate each layout against the `dashboard_layout` guidance. Recommend layouts that align and note any tension with the guidance."

### 3. `cli/build.ts` — NO CHANGE NEEDED

The build already copies all `.csv` files from `data/`. The new file will be included automatically.

## Verification

1. `cd cli && npm run build` — verify `application_type.csv` appears in `dist/assets/data/`
2. `bespokeui init --ai claude --force` in a test dir
3. Confirm `application_type.csv` exists in installed skill
4. Confirm SKILL.md has the new Design Reasoning Reference section
5. Confirm the SaaS row parses correctly (read the installed file)
