# The Bespoke Design Pipeline

## Quick Start

```bash
# Go to your project
cd /path/to/your/project

# Initialize Bespoke skill and scripts in your project
npx [BESPOKE_CLI_ONCE_PUBPLISHED] init

# TODO npm i -g global install option so folks can alternatively do bespokeui init
```

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
