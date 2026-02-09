# TypeScript Script Algorithm Specifications

**Version:** 1.0
**Document Type:** Implementation Specification
**Last Updated:** February 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Shared Utilities](#shared-utilities)
3. [match-niche.ts](#match-nichets)
4. [generate-layouts.ts](#generate-layoutsts)
5. [filter-typography.ts](#filter-typographyts)
6. [apply-typography-to-layout.ts](#apply-typography-to-layoutts)
7. [combine-previews.ts](#combine-previewsts)
8. [generate-palette-combinations.ts](#generate-palette-combinationsts)
9. [generate-tokens.ts](#generate-tokensts)
10. [Error Handling Standards](#error-handling-standards)

---

## Overview

This document provides detailed algorithmic specifications for each of the 7 core scripts in the Bespoke Design Pipeline. Each specification includes:

- **Purpose & Role**: What the script does in the pipeline
- **Algorithm Approach**: Detailed logic and decision trees
- **Input/Output Schemas**: TypeScript interfaces
- **Edge Case Handling**: What to do when things go wrong
- **Pseudocode/Flowcharts**: Implementation guidance
- **Example I/O**: Concrete test cases

### Design Principles

1. **Pure Functions** - Same input always produces same output
2. **Fail Fast** - Validate inputs early, provide clear error messages
3. **Graceful Fallbacks** - When primary strategy fails, have alternatives
4. **JSON I/O** - All scripts read/write JSON for LLM compatibility
5. **Exit Codes** - Use standard exit codes for error categorization

### Exit Code Standards

| Code | Meaning | LLM Action |
|------|---------|------------|
| 0 | Success | Parse JSON output |
| 1 | Invalid parameters | Fix params, retry |
| 2 | Missing files/data | Offer alternatives |
| 3 | Insufficient matches | Use fallback strategy |
| 4 | Invalid state | Reset/recover state |
| 5+ | Unexpected error | Manual intervention |

---

## Shared Utilities

### utils/csv-loader.ts

```typescript
interface CSVLoaderOptions {
  path: string;
  hasHeader?: boolean;        // Default: true
  delimiter?: string;         // Default: ','
  multiValueSeparator?: string; // Default: ';'
}

interface CSVRow {
  raw: string[];              // Original values
  parsed: Record<string, string | string[]>;
}

interface CSVData {
  headers: string[];
  rows: CSVRow[];
  getColumn(name: string): string[];
  filterBy(column: string, value: string): CSVRow[];
  filterByMulti(column: string, value: string): CSVRow[];  // For ; separated
}
```

#### CSV Parsing Algorithm

```
FUNCTION parseCSV(content: string, options: CSVLoaderOptions) -> CSVData:
    lines = content.split('\n')
    headers = []
    rows = []

    FOR i = 0 TO lines.length:
        line = lines[i].trim()

        IF line is empty OR starts with '#':
            CONTINUE  // Skip empty lines and comments

        values = parseCSVLine(line, options.delimiter)

        IF i == 0 AND options.hasHeader:
            headers = values
            CONTINUE

        row = {
            raw: values,
            parsed: {}
        }

        FOR j = 0 TO values.length:
            columnName = headers[j] OR `column_${j}`
            value = values[j]

            // Handle multi-value columns (e.g., "saas;dashboard")
            IF value.includes(options.multiValueSeparator):
                row.parsed[columnName] = value.split(options.multiValueSeparator)
            ELSE:
                row.parsed[columnName] = value

        rows.push(row)

    RETURN { headers, rows, getColumn, filterBy, filterByMulti }

FUNCTION parseCSVLine(line: string, delimiter: string) -> string[]:
    values = []
    current = ""
    inQuotes = false

    FOR char IN line:
        IF char == '"':
            inQuotes = NOT inQuotes
        ELSE IF char == delimiter AND NOT inQuotes:
            values.push(current.trim())
            current = ""
        ELSE:
            current += char

    values.push(current.trim())
    RETURN values
```

#### Multi-Value Matching Algorithm

```
FUNCTION filterByMulti(csv: CSVData, column: string, target: string) -> CSVRow[]:
    results = []

    FOR row IN csv.rows:
        columnValue = row.parsed[column]

        IF columnValue is Array:
            // Column contains multiple values like "saas;dashboard"
            IF target IN columnValue:
                results.push(row)
        ELSE:
            // Column is single value
            IF columnValue == target:
                results.push(row)

    RETURN results
```

### utils/svg-manipulator.ts

```typescript
interface SVGElement {
  tag: string;
  attributes: Record<string, string>;
  children: SVGElement[];
  textContent?: string;
}

interface SVGDocument {
  root: SVGElement;
  getElementById(id: string): SVGElement | null;
  getElementsByTag(tag: string): SVGElement[];
  setFontFamily(selector: string, fontFamily: string): void;
  setColors(colorMap: Record<string, string>): void;
  toString(): string;
}
```

#### SVG Font Application Algorithm

```
FUNCTION applyFontToSVG(svg: SVGDocument, typography: Typography) -> SVGDocument:
    // Step 1: Add Google Fonts import to defs
    fontImport = createStyleElement(`
        @import url('${typography.googleFontsUrl}');
    `)
    svg.root.children.unshift(fontImport)

    // Step 2: Find all text elements
    textElements = svg.getElementsByTag('text')

    FOR element IN textElements:
        // Determine if heading or body based on class/id
        IF hasClass(element, 'heading') OR element.attributes['data-type'] == 'heading':
            element.attributes['font-family'] = `'${typography.headingFont}', sans-serif`
            element.attributes['font-weight'] = '600'
        ELSE:
            element.attributes['font-family'] = `'${typography.bodyFont}', sans-serif`
            element.attributes['font-weight'] = '400'

    RETURN svg
```

### utils/color-conversions.ts

```typescript
interface Color {
  hex: string;      // "#0369A1"
  rgb: [number, number, number];
  hsl: [number, number, number];
}

// Conversion functions
function hexToRgb(hex: string): [number, number, number];
function hexToHsl(hex: string): [number, number, number];
function hslToHex(h: number, s: number, l: number): string;
function calculateContrast(fg: Color, bg: Color): number;
function meetsWCAG(fg: Color, bg: Color, level: 'AA' | 'AAA'): boolean;
```

#### Contrast Calculation Algorithm

```
FUNCTION calculateContrast(fg: Color, bg: Color) -> number:
    // Formula: (L1 + 0.05) / (L2 + 0.05) where L1 > L2

    L1 = getRelativeLuminance(fg.rgb)
    L2 = getRelativeLuminance(bg.rgb)

    IF L1 < L2:
        SWAP L1, L2

    contrast = (L1 + 0.05) / (L2 + 0.05)
    RETURN ROUND(contrast, 2)

FUNCTION getRelativeLuminance(rgb: [number, number, number]) -> number:
    // sRGB to linear conversion
    r, g, b = rgb.map(c => {
        c = c / 255
        RETURN c <= 0.03928
            ? c / 12.92
            : ((c + 0.055) / 1.055) ^ 2.4
    })

    RETURN 0.2126 * r + 0.7152 * g + 0.0722 * b

FUNCTION meetsWCAG(fg: Color, bg: Color, level: 'AA' | 'AAA') -> boolean:
    contrast = calculateContrast(fg, bg)
    threshold = level == 'AAA' ? 7.0 : 4.5
    RETURN contrast >= threshold
```

---

## match-niche.ts

### Purpose & Role

Analyzes user's natural language project description and classifies it into the niche taxonomy. This is the critical first step that determines all subsequent filtering.

### Matching Algorithm Approach

**Strategy: Hybrid Keyword Extraction + Weighted Scoring**

The script uses a deterministic keyword-based approach (no LLM inference) to ensure reproducibility:

1. **Tokenize** - Break description into lowercase words
2. **Match Keywords** - Compare against niche keyword dictionaries
3. **Score Niches** - Weight matches by specificity and frequency
4. **Resolve Ties** - Use priority rules for ambiguous cases
5. **Determine Application Type** - Secondary matching within niche

### Input Schema

```typescript
interface MatchNicheInput {
  description: string;
  strict?: boolean;          // Require exact taxonomy match
  minConfidence?: number;    // Minimum confidence to accept (0-1)
}
```

### Output Schema

```typescript
interface MatchNicheOutput {
  niche_id: string;
  application_type: string;
  confidence: number;        // 0.0 to 1.0
  reasoning: string;
  matched_keywords: string[];
  alternative_niches: Array<{
    niche_id: string;
    confidence: number;
    application_type?: string;
  }>;
}
```

### Algorithm Pseudocode

```
FUNCTION matchNiche(input: MatchNicheInput) -> MatchNicheOutput:
    // Step 1: Load taxonomy
    taxonomy = loadJSON('data/niche-taxonomy.json')

    // Step 2: Tokenize and normalize description
    description = input.description.toLowerCase()
    tokens = tokenize(description)

    // Step 3: Build niche scores
    nicheScores = {}
    matchedKeywords = {}

    FOR niche IN taxonomy.niches:
        score = 0
        keywords = []

        // Primary keywords (high weight)
        FOR keyword IN niche.primary_keywords:
            IF keyword IN tokens:
                score += 10
                keywords.push(keyword)

        // Secondary keywords (medium weight)
        FOR keyword IN niche.secondary_keywords:
            IF keyword IN tokens:
                score += 5
                keywords.push(keyword)

        // Negative keywords (reduce score)
        FOR keyword IN niche.negative_keywords:
            IF keyword IN tokens:
                score -= 8

        // Phrase matching (bonus for multi-word matches)
        FOR phrase IN niche.phrases:
            IF phrase IN description:
                score += 15
                keywords.push(phrase)

        nicheScores[niche.id] = score
        matchedKeywords[niche.id] = keywords

    // Step 4: Normalize scores to confidence
    maxScore = MAX(nicheScores.values())
    totalScore = SUM(nicheScores.values())

    FOR niche IN nicheScores:
        IF totalScore > 0:
            nicheScores[niche] = nicheScores[niche] / totalScore

    // Step 5: Select primary niche
    sortedNiches = SORT(nicheScores, descending)
    primaryNiche = sortedNiches[0]
    primaryConfidence = nicheScores[primaryNiche]

    // Step 6: Determine application type within niche
    appType = matchApplicationType(tokens, primaryNiche, taxonomy)

    // Step 7: Build alternatives
    alternatives = []
    FOR i = 1 TO MIN(3, sortedNiches.length):
        altNiche = sortedNiches[i]
        IF nicheScores[altNiche] > 0.15:  // Only include significant alternatives
            alternatives.push({
                niche_id: altNiche,
                confidence: nicheScores[altNiche],
                application_type: matchApplicationType(tokens, altNiche, taxonomy)
            })

    // Step 8: Generate reasoning
    reasoning = generateReasoning(primaryNiche, appType, matchedKeywords[primaryNiche])

    RETURN {
        niche_id: primaryNiche,
        application_type: appType,
        confidence: primaryConfidence,
        reasoning: reasoning,
        matched_keywords: matchedKeywords[primaryNiche],
        alternative_niches: alternatives
    }

FUNCTION matchApplicationType(tokens: string[], niche: string, taxonomy: Taxonomy) -> string:
    nicheData = taxonomy.niches.find(n => n.id == niche)
    appTypeScores = {}

    FOR appType IN nicheData.application_types:
        score = 0
        FOR keyword IN appType.keywords:
            IF keyword IN tokens:
                score += 1
        appTypeScores[appType.id] = score

    // Return highest scoring, or default
    bestAppType = MAX_KEY(appTypeScores)
    IF appTypeScores[bestAppType] == 0:
        RETURN nicheData.default_application_type
    RETURN bestAppType

FUNCTION tokenize(text: string) -> string[]:
    // Remove punctuation, split on whitespace
    cleaned = text.replace(/[^\w\s-]/g, ' ')
    words = cleaned.split(/\s+/)

    // Also generate bigrams and trigrams for phrase matching
    tokens = words
    FOR i = 0 TO words.length - 1:
        tokens.push(words[i] + ' ' + words[i+1])  // bigrams
    FOR i = 0 TO words.length - 2:
        tokens.push(words[i] + ' ' + words[i+1] + ' ' + words[i+2])  // trigrams

    RETURN tokens
```

### Keyword Dictionary Structure (niche-taxonomy.json)

```json
{
  "niches": [
    {
      "id": "medical",
      "name": "Medical/Healthcare",
      "primary_keywords": [
        "medical", "healthcare", "health", "patient", "doctor",
        "hospital", "clinic", "telemedicine", "telehealth"
      ],
      "secondary_keywords": [
        "appointment", "prescription", "diagnosis", "treatment",
        "wellness", "care", "therapy", "medication"
      ],
      "negative_keywords": [
        "gaming", "shopping", "social media"
      ],
      "phrases": [
        "patient portal", "medical records", "health tracker",
        "appointment booking", "doctor appointment"
      ],
      "application_types": [
        {
          "id": "patient-portal",
          "keywords": ["patient", "portal", "records", "appointments"],
          "default": true
        },
        {
          "id": "telehealth",
          "keywords": ["video", "call", "remote", "virtual", "telehealth"]
        },
        {
          "id": "ehr",
          "keywords": ["records", "charts", "documentation", "ehr", "emr"]
        }
      ],
      "default_application_type": "patient-portal"
    }
  ]
}
```

### Handling Ambiguous Inputs

#### Decision Tree for Ambiguous Cases

```
IF primaryConfidence < 0.60:
    IF alternatives[0].confidence > primaryConfidence - 0.10:
        // Close competition - needs user clarification
        RETURN with flag: needs_clarification = true
    ELSE:
        // Clear winner despite low confidence
        RETURN primary niche with warning

IF primaryConfidence >= 0.60 AND primaryConfidence < 0.85:
    // Medium confidence - proceed but mention alternatives
    RETURN primary niche with alternatives shown

IF primaryConfidence >= 0.85:
    // High confidence - proceed without hesitation
    RETURN primary niche
```

#### Ambiguity Resolution Examples

**Example 1: "healthcare analytics"**
```
Matched Keywords:
- "healthcare" → medical (10 pts)
- "analytics" → dashboard (10 pts)

Scores: medical=0.45, dashboard=0.45, saas=0.10

Resolution: Near-tie → needs_clarification = true
Output: Ask user which aspect is primary
```

**Example 2: "e-commerce product analytics"**
```
Matched Keywords:
- "e-commerce" → ecommerce (10 pts)
- "product" → ecommerce (5 pts)
- "analytics" → dashboard (10 pts)

Scores: ecommerce=0.52, dashboard=0.35, saas=0.13

Resolution: Clear primary → proceed with ecommerce
```

### Confidence Thresholds

| Confidence | Action | LLM Behavior |
|------------|--------|--------------|
| ≥0.85 | Proceed automatically | "I've identified this as..." |
| 0.60-0.84 | Proceed with alternatives shown | "This appears to be... (alternatives: ...)" |
| 0.40-0.59 | Ask for clarification | "This could be either... Which approach?" |
| <0.40 | Request more information | "I need more context. What type of app?" |

### Fallback Behavior

When no clear match exists:

```
FUNCTION handleNoMatch(tokens: string[]) -> MatchNicheOutput:
    // Check for generic web app keywords
    genericKeywords = ['website', 'app', 'application', 'platform', 'tool', 'system']
    hasGenericKeywords = ANY(genericKeywords IN tokens)

    IF hasGenericKeywords:
        // Default to SaaS (most generic category)
        RETURN {
            niche_id: 'saas',
            application_type: 'web-app',
            confidence: 0.30,
            reasoning: 'No specific domain detected. Defaulting to general web application.',
            alternatives: [] // Show all niches as options
        }
    ELSE:
        // Truly ambiguous - need human input
        RETURN {
            niche_id: null,
            application_type: null,
            confidence: 0.0,
            reasoning: 'Unable to determine application type. Please specify.',
            alternatives: [] // List all niches
        }
```

### Example Inputs → Outputs

**Input 1:** Simple medical case
```json
{
  "description": "I need a patient portal for a telemedicine app"
}
```

**Output 1:**
```json
{
  "niche_id": "medical",
  "application_type": "patient-portal",
  "confidence": 0.94,
  "reasoning": "Keywords 'patient portal' and 'telemedicine' strongly indicate healthcare domain with patient-facing interface.",
  "matched_keywords": ["patient", "portal", "telemedicine"],
  "alternative_niches": []
}
```

**Input 2:** Ambiguous case
```json
{
  "description": "project management tool with analytics"
}
```

**Output 2:**
```json
{
  "niche_id": "saas",
  "application_type": "productivity-tool",
  "confidence": 0.71,
  "reasoning": "Project management suggests SaaS product, but analytics component suggests dashboard capabilities.",
  "matched_keywords": ["project", "management", "tool"],
  "alternative_niches": [
    {
      "niche_id": "dashboard",
      "confidence": 0.68,
      "application_type": "analytics"
    }
  ]
}
```

**Input 3:** Edge case - very generic
```json
{
  "description": "I need a website"
}
```

**Output 3:**
```json
{
  "niche_id": null,
  "application_type": null,
  "confidence": 0.0,
  "reasoning": "Description too generic. Cannot determine specific application type.",
  "matched_keywords": ["website"],
  "alternative_niches": [
    { "niche_id": "marketing", "confidence": 0.15 },
    { "niche_id": "saas", "confidence": 0.15 },
    { "niche_id": "blog", "confidence": 0.15 }
  ]
}
```

---

## generate-layouts.ts

### Purpose & Role

Reads SVG layout files from the niche-specific directory and prepares them for user selection. Generates preview artifacts (HTML grid, PNG image).

### Input Schema

```typescript
interface GenerateLayoutsInput {
  niche: string;           // Niche ID (e.g., "medical")
  count?: number;          // Max layouts to return (default: 15)
  density?: 'low' | 'medium' | 'high';  // Optional density filter
}
```

### Output Schema

```typescript
interface GenerateLayoutsOutput {
  layouts: Array<{
    id: string;            // e.g., "dashboard_sidebar-metrics-grid_01"
    filepath: string;      // Relative path to source SVG
    description: string;   // Human-readable description
    density: string;       // Layout density category
    preview_path: string;  // Path to copied preview SVG
  }>;
  preview_html: string;    // Path to HTML preview grid
  preview_image: string;   // Path to PNG preview grid
  total_available: number; // How many layouts exist for this niche
}
```

### Algorithm Pseudocode

```
FUNCTION generateLayouts(input: GenerateLayoutsInput) -> GenerateLayoutsOutput:
    // Step 1: Validate niche exists
    layoutDir = `skills/bespoke_design_system/layouts/${input.niche}/`
    IF NOT exists(layoutDir):
        EXIT_CODE = 2
        THROW Error(`No layouts found for niche: ${input.niche}`)

    // Step 2: List all SVG files
    svgFiles = glob(`${layoutDir}/*.svg`)
    IF svgFiles.length == 0:
        EXIT_CODE = 2
        THROW Error(`No SVG files in ${layoutDir}`)

    // Step 3: Parse metadata from filenames
    layouts = []
    FOR file IN svgFiles:
        metadata = parseLayoutFilename(file)

        // Optional density filter
        IF input.density AND metadata.density != input.density:
            CONTINUE

        layouts.push({
            id: metadata.id,
            filepath: file,
            description: metadata.description,
            density: metadata.density,
            preview_path: null  // Set in step 5
        })

    // Step 4: Sort by ID and limit
    layouts = SORT(layouts, by: 'id')
    layouts = layouts.slice(0, input.count OR 15)

    // Step 5: Copy to preview directory
    outputDir = '.design-pipeline/layouts/'
    ensureDir(outputDir)

    FOR i, layout IN enumerate(layouts):
        optionNum = String(i + 1).padStart(2, '0')
        previewPath = `${outputDir}option-${optionNum}.svg`
        copyFile(layout.filepath, previewPath)
        layout.preview_path = previewPath

    // Step 6: Generate HTML preview
    htmlPath = generatePreviewHTML(layouts, outputDir, input.niche)

    // Step 7: Generate PNG preview (if Puppeteer available)
    pngPath = null
    TRY:
        pngPath = generatePreviewPNG(htmlPath, outputDir)
    CATCH:
        LOG('PNG generation skipped - Puppeteer not available')

    RETURN {
        layouts: layouts,
        preview_html: htmlPath,
        preview_image: pngPath,
        total_available: svgFiles.length
    }

FUNCTION parseLayoutFilename(filepath: string) -> LayoutMetadata:
    // Expected format: {niche}_{description}_{number}.svg
    // Example: dashboard_sidebar-metrics-grid_01.svg

    filename = basename(filepath, '.svg')
    parts = filename.split('_')

    IF parts.length < 3:
        // Fallback for non-standard naming
        RETURN {
            id: filename,
            description: humanize(filename),
            density: 'medium'  // Default
        }

    niche = parts[0]
    description = parts.slice(1, -1).join('-')
    number = parts[parts.length - 1]

    // Infer density from description keywords
    density = inferDensity(description)

    RETURN {
        id: filename,
        description: humanize(description),
        density: density
    }

FUNCTION inferDensity(description: string) -> 'low' | 'medium' | 'high':
    lowKeywords = ['minimal', 'simple', 'clean', 'spacious']
    highKeywords = ['dense', 'compact', 'multi-panel', 'complex', 'data-heavy']

    FOR keyword IN highKeywords:
        IF keyword IN description.toLowerCase():
            RETURN 'high'

    FOR keyword IN lowKeywords:
        IF keyword IN description.toLowerCase():
            RETURN 'low'

    RETURN 'medium'

FUNCTION humanize(slug: string) -> string:
    // Convert "sidebar-metrics-grid" to "Sidebar Metrics Grid"
    RETURN slug
        .replace(/-/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
```

### Preview HTML Generation

```
FUNCTION generatePreviewHTML(layouts: Layout[], outputDir: string, niche: string) -> string:
    html = `
<!DOCTYPE html>
<html>
<head>
    <title>Select 3 Layouts - ${niche}</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: system-ui; padding: 20px; background: #f8fafc; }
        h1 { color: #0f172a; margin-bottom: 8px; }
        .subtitle { color: #64748b; margin-bottom: 24px; }
        .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            max-width: 1200px;
        }
        .card {
            background: white;
            border: 3px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .card:hover { border-color: #0ea5e9; transform: scale(1.02); }
        .card.selected { border-color: #0369a1; background: #f0f9ff; }
        .card img { width: 100%; height: auto; border-radius: 8px; }
        .card-number {
            display: inline-block;
            background: #0369a1;
            color: white;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            text-align: center;
            line-height: 28px;
            font-weight: 600;
            margin-right: 8px;
        }
        .card-label { margin-top: 12px; font-weight: 500; color: #1e293b; }
        .card-density { font-size: 12px; color: #64748b; margin-top: 4px; }
        #selection-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            border-top: 2px solid #e2e8f0;
            padding: 16px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 -4px 6px rgba(0,0,0,0.05);
        }
        button {
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
        }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        #copyBtn { background: #0369a1; color: white; border: none; }
    </style>
</head>
<body>
    <h1>Select 3 Layouts</h1>
    <p class="subtitle">Click to select layouts for your ${niche} application</p>

    <div class="grid">
    ${layouts.map((layout, i) => `
        <div class="card" data-id="${i + 1}">
            <img src="option-${String(i + 1).padStart(2, '0')}.svg" alt="Layout ${i + 1}">
            <div class="card-label">
                <span class="card-number">${i + 1}</span>
                ${layout.description}
            </div>
            <div class="card-density">Density: ${layout.density}</div>
        </div>
    `).join('')}
    </div>

    <div id="selection-bar">
        <div>
            <strong>Selected:</strong>
            <span id="selectedDisplay">None (select 3)</span>
        </div>
        <button id="copyBtn" disabled onclick="copySelection()">
            Copy Selection
        </button>
    </div>

    <script>
        let selected = [];
        const maxSelection = 3;

        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                if (selected.includes(id)) {
                    selected = selected.filter(x => x !== id);
                    card.classList.remove('selected');
                } else if (selected.length < maxSelection) {
                    selected.push(id);
                    card.classList.add('selected');
                }
                updateDisplay();
            });
        });

        function updateDisplay() {
            const display = document.getElementById('selectedDisplay');
            const copyBtn = document.getElementById('copyBtn');

            if (selected.length === 0) {
                display.textContent = 'None (select 3)';
            } else {
                display.textContent = selected.join(', ');
            }
            copyBtn.disabled = selected.length !== maxSelection;
        }

        function copySelection() {
            navigator.clipboard.writeText(selected.join(', '))
                .then(() => alert('Copied: ' + selected.join(', ')));
        }
    </script>
</body>
</html>
    `

    path = `${outputDir}preview.html`
    writeFile(path, html)
    RETURN path
```

### PNG Generation (using Puppeteer)

```
FUNCTION generatePreviewPNG(htmlPath: string, outputDir: string) -> string:
    // Requires: npm install puppeteer

    browser = await puppeteer.launch({ headless: true })
    page = await browser.newPage()

    // Set viewport for 3x5 grid at reasonable size
    await page.setViewport({ width: 1200, height: 1800 })

    // Load HTML file
    await page.goto(`file://${resolve(htmlPath)}`)

    // Wait for images to load
    await page.waitForSelector('.grid')
    await page.evaluate(() => {
        return Promise.all(
            Array.from(document.images)
                .filter(img => !img.complete)
                .map(img => new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                }))
        );
    })

    // Hide selection bar for screenshot
    await page.evaluate(() => {
        document.getElementById('selection-bar').style.display = 'none';
    })

    // Take screenshot
    pngPath = `${outputDir}grid-preview.png`
    await page.screenshot({
        path: pngPath,
        fullPage: false,
        clip: { x: 0, y: 0, width: 1200, height: 1600 }
    })

    await browser.close()
    RETURN pngPath
```

### Error Handling

| Error Condition | Exit Code | Recovery |
|-----------------|-----------|----------|
| Niche directory doesn't exist | 2 | Suggest valid niches |
| No SVG files found | 2 | Check if layouts need generation |
| Fewer than 15 layouts | 3 (soft) | Return available, note in output |
| Puppeteer not installed | 0 (soft) | Skip PNG, use HTML only |

---

## filter-typography.ts

### Purpose & Role

Queries typography.csv to find font pairings appropriate for the specified niche and application type. Uses a cascading filter strategy to ensure sufficient results.

### Input Schema

```typescript
interface FilterTypographyInput {
  niche: string;
  applicationTypes?: string;  // Optional, for more specific filtering
  count?: number;             // Default: 15
  category?: string;          // Optional: "Sans + Sans", "Serif + Sans", etc.
}
```

### Output Schema

```typescript
interface FilterTypographyOutput {
  typography: Array<{
    id: string;              // e.g., "typo-003"
    pairing_name: string;
    heading_font: string;
    body_font: string;
    category: string;        // e.g., "Sans + Sans"
    mood: string[];
    google_fonts_url: string;
    css_import: string;
    tailwind_config: string;
  }>;
  total_matches: number;
  filter_strategy: 'exact_match' | 'niche_only' | 'expanded' | 'fallback';
  preview_html?: string;
  preview_image?: string;
}
```

### Filtering Algorithm

```
FUNCTION filterTypography(input: FilterTypographyInput) -> FilterTypographyOutput:
    csv = loadCSV('data/typography.csv')
    requestedCount = input.count OR 15

    // Strategy 1: Exact match (niche AND application_type)
    IF input.applicationTypes:
        results = filterExactMatch(csv, input.niche, input.applicationTypes)
        IF results.length >= requestedCount:
            RETURN formatResults(results.slice(0, requestedCount), 'exact_match')

    // Strategy 2: Niche only
    results = filterNicheOnly(csv, input.niche)
    IF results.length >= requestedCount:
        RETURN formatResults(results.slice(0, requestedCount), 'niche_only')

    // Strategy 3: Expand to related niches
    relatedNiches = getRelatedNiches(input.niche)
    results = filterMultipleNiches(csv, [input.niche, ...relatedNiches])
    IF results.length >= requestedCount:
        RETURN formatResults(results.slice(0, requestedCount), 'expanded')

    // Strategy 4: Include generic entries (no niche specified)
    results = filterWithFallback(csv, input.niche)
    IF results.length >= 5:  // Minimum viable count
        RETURN formatResults(results.slice(0, requestedCount), 'fallback')

    // Strategy 5: Error - insufficient data
    EXIT_CODE = 3
    THROW Error(`Insufficient typography data for niche: ${input.niche}`)

FUNCTION filterExactMatch(csv: CSVData, niche: string, appType: string) -> Row[]:
    RETURN csv.rows.filter(row => {
        niches = parseMultiValue(row['niche_id'])
        appTypes = parseMultiValue(row['application_types'])

        RETURN niches.includes(niche) AND appTypes.includes(appType)
    })

FUNCTION filterNicheOnly(csv: CSVData, niche: string) -> Row[]:
    RETURN csv.rows.filter(row => {
        niches = parseMultiValue(row['niche_id'])
        RETURN niches.includes(niche)
    })

FUNCTION filterMultipleNiches(csv: CSVData, niches: string[]) -> Row[]:
    RETURN csv.rows.filter(row => {
        rowNiches = parseMultiValue(row['niche_id'])
        RETURN niches.some(n => rowNiches.includes(n))
    })

FUNCTION filterWithFallback(csv: CSVData, niche: string) -> Row[]:
    // Include niche matches AND generic entries (empty niche_id)
    RETURN csv.rows.filter(row => {
        niches = parseMultiValue(row['niche_id'])
        RETURN niches.includes(niche) OR niches.length == 0 OR niches[0] == ''
    })

FUNCTION getRelatedNiches(niche: string) -> string[]:
    // Mapping of related niches for expansion
    relations = {
        'medical': ['saas'],           // Patient portals are often SaaS-like
        'fintech': ['dashboard'],       // Trading dashboards
        'dashboard': ['saas', 'fintech'],
        'saas': ['dashboard'],
        'ecommerce': ['marketing'],     // Product pages are marketing-like
        'marketing': ['portfolio'],
        'portfolio': ['marketing', 'blog'],
        'blog': ['portfolio'],
        'industrial': ['dashboard']
    }
    RETURN relations[niche] OR []

FUNCTION parseMultiValue(value: string) -> string[]:
    IF value is null OR value == '':
        RETURN []
    RETURN value.split(';').map(v => v.trim())
```

### Selection Strategy for >15 Matches

When more than the requested count of matches exist:

```
FUNCTION selectFromMatches(matches: Row[], count: number, niche: string) -> Row[]:
    // Priority 1: Exact application_type matches first
    // Priority 2: Diverse category mix (Sans+Sans, Serif+Sans, etc.)
    // Priority 3: Higher-rated pairings (if rating exists)

    IF matches.length <= count:
        RETURN matches

    // Get unique categories
    categories = unique(matches.map(m => m['category']))

    selected = []
    perCategory = Math.ceil(count / categories.length)

    FOR category IN categories:
        categoryMatches = matches.filter(m => m['category'] == category)
        selected.push(...categoryMatches.slice(0, perCategory))

        IF selected.length >= count:
            BREAK

    // Fill remaining slots
    remaining = matches.filter(m => NOT selected.includes(m))
    selected.push(...remaining.slice(0, count - selected.length))

    RETURN selected.slice(0, count)
```

### CSV Column Reference

| Column | Index | Description |
|--------|-------|-------------|
| No | 0 | Row number |
| niche_id | 1 | Semicolon-separated niche IDs |
| application_types | 2 | Semicolon-separated app types |
| Font Pairing Name | 3 | Human-readable name |
| Category | 4 | e.g., "Sans + Sans" |
| Heading Font | 5 | Font name |
| Body Font | 6 | Font name |
| Mood/Style Keywords | 7 | Comma-separated keywords |
| Best For | 8 | Description |
| Google Fonts URL | 9 | URL |
| CSS Import | 10 | @import statement |
| Tailwind Config | 11 | Config snippet |
| Notes | 12 | Additional notes |

### Caching Strategy

```typescript
// In-memory cache for CSV data
let csvCache: {
  data: CSVData | null;
  timestamp: number;
  maxAge: number;  // 5 minutes
} = {
  data: null,
  timestamp: 0,
  maxAge: 5 * 60 * 1000
};

FUNCTION loadCSVCached(path: string) -> CSVData:
    now = Date.now()

    IF csvCache.data AND (now - csvCache.timestamp) < csvCache.maxAge:
        RETURN csvCache.data

    csvCache.data = loadCSV(path)
    csvCache.timestamp = now

    RETURN csvCache.data
```

### Error Handling

| Error Condition | Exit Code | Recovery |
|-----------------|-----------|----------|
| CSV file not found | 2 | Error with file path |
| CSV parse error | 2 | Show malformed line |
| No matches found | 3 | Try fallback chain |
| <5 matches total | 3 | Return available with warning |

---

## apply-typography-to-layout.ts

### Purpose & Role

Takes selected layouts and applies all typography options to create visual previews. This allows users to see how each font pairing looks in context.

### Input Schema

```typescript
interface ApplyTypographyInput {
  layouts: string | string[];       // Layout IDs or paths
  typographyFile: string;           // Path to typography JSON
  outputDir?: string;               // Default: .design-pipeline/typography/
}
```

### Output Schema

```typescript
interface ApplyTypographyOutput {
  previews: Array<{
    layout_id: string;
    typography_id: string;
    preview_path: string;
  }>;
  preview_html: string;
  preview_image: string;
}
```

### Algorithm Pseudocode

```
FUNCTION applyTypographyToLayout(input: ApplyTypographyInput) -> Output:
    // Step 1: Parse inputs
    layouts = parseLayouts(input.layouts)  // Array of 3 layout IDs
    typography = loadJSON(input.typographyFile)  // Array of 15 typography objects
    outputDir = input.outputDir OR '.design-pipeline/typography/'

    ensureDir(outputDir)

    // Step 2: Generate all combinations (3 layouts × 15 fonts = 45 previews)
    previews = []

    FOR layoutId IN layouts:
        layoutSvg = loadSVG(getLayoutPath(layoutId))

        FOR typo IN typography:
            // Clone SVG and apply fonts
            modifiedSvg = cloneSVG(layoutSvg)
            applyFonts(modifiedSvg, typo)

            // Generate preview filename
            previewPath = `${outputDir}preview-${layoutId}-${typo.id}.svg`
            saveSVG(modifiedSvg, previewPath)

            previews.push({
                layout_id: layoutId,
                typography_id: typo.id,
                preview_path: previewPath
            })

    // Step 3: Generate preview HTML
    htmlPath = generateTypographyPreviewHTML(previews, typography, outputDir)

    // Step 4: Generate preview PNG
    pngPath = generatePreviewPNG(htmlPath, outputDir)

    RETURN { previews, preview_html: htmlPath, preview_image: pngPath }

FUNCTION applyFonts(svg: SVGDocument, typo: Typography):
    // Add Google Fonts import
    styleElement = svg.createElement('style')
    styleElement.textContent = `
        @import url('${typo.google_fonts_url}');

        .heading, [data-type="heading"], text.heading {
            font-family: '${typo.heading_font}', sans-serif;
            font-weight: 600;
        }

        .body, [data-type="body"], text.body, text:not(.heading) {
            font-family: '${typo.body_font}', sans-serif;
            font-weight: 400;
        }
    `

    // Insert style at beginning of SVG
    defs = svg.querySelector('defs') OR svg.createElement('defs')
    defs.insertBefore(styleElement, defs.firstChild)

    // Apply font-family attributes directly to text elements
    textElements = svg.querySelectorAll('text')
    FOR element IN textElements:
        classList = element.getAttribute('class') OR ''
        dataType = element.getAttribute('data-type')
        fontSize = parseFloat(element.getAttribute('font-size') OR '14')

        IF 'heading' IN classList OR dataType == 'heading' OR fontSize > 20:
            element.setAttribute('font-family', `'${typo.heading_font}', sans-serif`)
            element.setAttribute('font-weight', '600')
        ELSE:
            element.setAttribute('font-family', `'${typo.body_font}', sans-serif`)
            element.setAttribute('font-weight', '400')
```

### Preview HTML for Typography Selection

```
FUNCTION generateTypographyPreviewHTML(previews, typography, outputDir) -> string:
    // Group previews by layout
    previewsByLayout = groupBy(previews, 'layout_id')
    layouts = Object.keys(previewsByLayout)

    html = `
<!DOCTYPE html>
<html>
<head>
    <title>Select 3 Font Pairings</title>
    ${typography.map(t => `<link rel="preconnect" href="https://fonts.googleapis.com">`)}
    ${typography.map(t => t.css_import).join('\n')}
    <style>
        body { font-family: system-ui; padding: 20px; background: #f8fafc; }
        h1 { color: #0f172a; }
        .layout-section { margin-bottom: 40px; }
        .layout-title { font-size: 18px; color: #475569; margin-bottom: 16px; }
        .font-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 16px;
        }
        .font-card {
            background: white;
            border: 3px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .font-card:hover { border-color: #0ea5e9; }
        .font-card.selected { border-color: #0369a1; background: #f0f9ff; }
        .font-card img { width: 100%; height: 120px; object-fit: cover; border-radius: 8px; }
        .font-name { font-weight: 600; margin-top: 8px; font-size: 14px; }
        .font-preview { margin-top: 4px; font-size: 12px; color: #64748b; }
        .card-number {
            background: #0369a1; color: white;
            border-radius: 50%; width: 24px; height: 24px;
            display: inline-flex; align-items: center; justify-content: center;
            font-size: 12px; font-weight: 600;
        }
    </style>
</head>
<body>
    <h1>Select 3 Font Pairings</h1>
    <p>Each font is shown applied to your selected layouts. Click to select 3 pairings.</p>

    <div class="font-grid">
    ${typography.map((typo, i) => `
        <div class="font-card" data-id="${i + 1}">
            <span class="card-number">${i + 1}</span>
            <div class="font-name">${typo.pairing_name}</div>
            <div class="font-preview">
                <span style="font-family: '${typo.heading_font}'">Heading</span> +
                <span style="font-family: '${typo.body_font}'">Body</span>
            </div>
            <div style="margin-top: 8px; font-size: 11px; color: #94a3b8;">
                ${typo.heading_font} + ${typo.body_font}
            </div>
        </div>
    `).join('')}
    </div>

    <script>
        let selected = [];
        const maxSelection = 3;

        document.querySelectorAll('.font-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                if (selected.includes(id)) {
                    selected = selected.filter(x => x !== id);
                    card.classList.remove('selected');
                } else if (selected.length < maxSelection) {
                    selected.push(id);
                    card.classList.add('selected');
                }
            });
        });
    </script>
</body>
</html>
    `

    path = `${outputDir}preview.html`
    writeFile(path, html)
    RETURN path
```

### Performance Considerations

| Operation | Estimated Time | Optimization |
|-----------|---------------|--------------|
| Load 3 SVGs | ~10ms | Cache parsed SVGs |
| Apply fonts (45x) | ~100ms | Batch DOM operations |
| Generate HTML | ~5ms | Template caching |
| Generate PNG | ~2-5s | Run in parallel if possible |
| **Total** | ~3-5s | Acceptable UX |

---

## combine-previews.ts

### Purpose & Role

Creates a 3×3 matrix of layout + typography combinations from the user's selections (3 layouts × 3 fonts = 9 combinations).

### Input Schema

```typescript
interface CombinePreviewsInput {
  layouts: string[];          // Exactly 3 layout IDs
  typography: string[];       // Exactly 3 typography IDs
  outputDir?: string;
}
```

### Output Schema

```typescript
interface CombinePreviewsOutput {
  combinations: Array<{
    id: string;               // "combo-01" through "combo-09"
    layout_id: string;
    typography_id: string;
    preview_path: string;
  }>;
  grid_layout: {
    rows: 3;
    cols: 3;
    row_labels: string[];     // Layout names
    col_labels: string[];     // Typography names
  };
  preview_html: string;
  preview_image: string;
}
```

### Algorithm

```
FUNCTION combineLayouts(input: CombinePreviewsInput) -> Output:
    // Validate: exactly 3 of each
    IF input.layouts.length != 3 OR input.typography.length != 3:
        EXIT_CODE = 1
        THROW Error('Must provide exactly 3 layouts and 3 typography options')

    outputDir = input.outputDir OR '.design-pipeline/combinations/'
    ensureDir(outputDir)

    combinations = []
    comboNum = 1

    // Generate 3×3 grid
    FOR i, layoutId IN enumerate(input.layouts):
        layoutSvg = loadSVG(getLayoutPath(layoutId))
        layoutInfo = getLayoutMetadata(layoutId)

        FOR j, typoId IN enumerate(input.typography):
            typoInfo = getTypographyData(typoId)

            // Create combination
            modifiedSvg = cloneSVG(layoutSvg)
            applyFonts(modifiedSvg, typoInfo)

            comboId = `combo-${String(comboNum).padStart(2, '0')}`
            previewPath = `${outputDir}${comboId}.svg`
            saveSVG(modifiedSvg, previewPath)

            combinations.push({
                id: comboId,
                layout_id: layoutId,
                typography_id: typoId,
                preview_path: previewPath
            })

            comboNum++

    // Build grid metadata
    gridLayout = {
        rows: 3,
        cols: 3,
        row_labels: input.layouts.map(id => getLayoutMetadata(id).description),
        col_labels: input.typography.map(id => getTypographyData(id).pairing_name)
    }

    // Generate HTML preview with 3×3 grid
    htmlPath = generateCombinationHTML(combinations, gridLayout, outputDir)
    pngPath = generatePreviewPNG(htmlPath, outputDir)

    RETURN {
        combinations,
        grid_layout: gridLayout,
        preview_html: htmlPath,
        preview_image: pngPath
    }
```

### Combination Mapping

```
Grid Position → Combo ID

| Layout\Font | Font A | Font B | Font C |
|-------------|--------|--------|--------|
| Layout 1    | 1      | 2      | 3      |
| Layout 2    | 4      | 5      | 6      |
| Layout 3    | 7      | 8      | 9      |

Formula: combo_id = (layout_index * 3) + font_index + 1
```

### File Naming Convention

```
.design-pipeline/combinations/
├── combo-01.svg    # Layout 1 + Font A
├── combo-02.svg    # Layout 1 + Font B
├── combo-03.svg    # Layout 1 + Font C
├── combo-04.svg    # Layout 2 + Font A
├── combo-05.svg    # Layout 2 + Font B
├── combo-06.svg    # Layout 2 + Font C
├── combo-07.svg    # Layout 3 + Font A
├── combo-08.svg    # Layout 3 + Font B
├── combo-09.svg    # Layout 3 + Font C
├── preview.html
└── grid-preview.png
```

---

## generate-palette-combinations.ts

### Purpose & Role

Filters color palettes from colors.csv and applies them to the selected combination, generating 5 color variations for user selection.

### Input Schema

```typescript
interface GeneratePaletteInput {
  combination: string;          // Selected combo ID (e.g., "combo-05")
  niche: string;
  applicationTypes?: string;
  count?: number;               // Default: 5
}
```

### Output Schema

```typescript
interface GeneratePaletteOutput {
  palettes: Array<{
    id: string;
    name: string;
    colors: {
      primary: string;
      secondary: string;
      cta: string;
      background: string;
      text: string;
      border: string;
    };
    contrast_ratios: {
      text_on_background: string;
      cta_on_background: string;
      primary_on_background: string;
    };
    wcag_compliance: 'AAA' | 'AA' | 'A' | 'FAIL';
    preview_path: string;
  }>;
  preview_html: string;
  preview_image: string;
}
```

### Algorithm

```
FUNCTION generatePaletteCombinations(input: GeneratePaletteInput) -> Output:
    // Step 1: Load and filter colors
    csv = loadCSV('data/colors.csv')
    palettes = filterPalettes(csv, input.niche, input.applicationTypes, input.count)

    // Step 2: Load the selected combination SVG
    comboSvg = loadSVG(getCombinationPath(input.combination))

    outputDir = '.design-pipeline/palettes/'
    ensureDir(outputDir)

    // Step 3: Apply each palette to the combination
    results = []
    FOR i, palette IN enumerate(palettes):
        // Clone and apply colors
        coloredSvg = cloneSVG(comboSvg)
        applyColors(coloredSvg, palette)

        // Calculate contrast ratios
        contrasts = calculateContrastRatios(palette)
        wcagLevel = determineWCAGLevel(contrasts)

        // Save preview
        previewPath = `${outputDir}variation-${String(i + 1).padStart(2, '0')}.svg`
        saveSVG(coloredSvg, previewPath)

        results.push({
            id: `palette-${String(i + 1).padStart(2, '0')}`,
            name: palette.name,
            colors: palette.colors,
            contrast_ratios: contrasts,
            wcag_compliance: wcagLevel,
            preview_path: previewPath
        })

    // Step 4: Generate previews
    htmlPath = generatePalettePreviewHTML(results, outputDir)
    pngPath = generatePreviewPNG(htmlPath, outputDir)

    RETURN { palettes: results, preview_html: htmlPath, preview_image: pngPath }

FUNCTION filterPalettes(csv: CSVData, niche: string, appType: string, count: number):
    // Same cascading filter strategy as typography

    // Strategy 1: Exact match
    results = csv.filterByMulti('niche_id', niche)
        .filter(row => !appType OR row['application_types'].includes(appType))

    IF results.length >= count:
        RETURN selectDiversePalettes(results, count)

    // Strategy 2: Niche only
    results = csv.filterByMulti('niche_id', niche)

    IF results.length >= count:
        RETURN selectDiversePalettes(results, count)

    // Strategy 3: Related niches
    related = getRelatedNiches(niche)
    FOR relatedNiche IN related:
        moreResults = csv.filterByMulti('niche_id', relatedNiche)
        results = [...results, ...moreResults]

        IF results.length >= count:
            RETURN selectDiversePalettes(results, count)

    // Return what we have
    RETURN selectDiversePalettes(results, MIN(results.length, count))

FUNCTION selectDiversePalettes(palettes: Palette[], count: number) -> Palette[]:
    // Ensure diversity in the selection
    // Prioritize: different primary hues, different moods

    selected = []
    usedHues = []

    FOR palette IN palettes:
        hue = getHue(palette.primary)

        // Skip if too similar to already selected
        IF usedHues.some(h => Math.abs(h - hue) < 30):
            CONTINUE

        selected.push(palette)
        usedHues.push(hue)

        IF selected.length >= count:
            BREAK

    // Fill remaining with any available
    IF selected.length < count:
        remaining = palettes.filter(p => !selected.includes(p))
        selected.push(...remaining.slice(0, count - selected.length))

    RETURN selected

FUNCTION applyColors(svg: SVGDocument, palette: Palette):
    // Color mapping based on element roles
    colorMap = {
        // Background elements
        '[data-role="background"]': palette.background,
        '.bg, .background': palette.background,

        // Primary elements
        '[data-role="primary"]': palette.primary,
        '.primary': palette.primary,

        // Text elements
        'text': palette.text,
        '[data-role="text"]': palette.text,

        // CTA/buttons
        '[data-role="cta"], .cta, .button': palette.cta,

        // Borders
        '[data-role="border"], .border': palette.border,

        // Secondary elements
        '[data-role="secondary"]': palette.secondary
    }

    FOR selector, color IN colorMap:
        elements = svg.querySelectorAll(selector)
        FOR element IN elements:
            IF element.hasAttribute('fill'):
                element.setAttribute('fill', color)
            IF element.hasAttribute('stroke'):
                element.setAttribute('stroke', color)

FUNCTION calculateContrastRatios(palette: Palette) -> ContrastRatios:
    RETURN {
        text_on_background: formatRatio(calculateContrast(palette.text, palette.background)),
        cta_on_background: formatRatio(calculateContrast(palette.cta, palette.background)),
        primary_on_background: formatRatio(calculateContrast(palette.primary, palette.background))
    }

FUNCTION determineWCAGLevel(contrasts: ContrastRatios) -> string:
    textRatio = parseRatio(contrasts.text_on_background)

    IF textRatio >= 7.0:
        RETURN 'AAA'
    ELSE IF textRatio >= 4.5:
        RETURN 'AA'
    ELSE IF textRatio >= 3.0:
        RETURN 'A'
    ELSE:
        RETURN 'FAIL'
```

### CSV Column Reference (colors.csv)

| Column | Index | Description |
|--------|-------|-------------|
| No | 0 | Row number |
| niche_id | 1 | Semicolon-separated niches |
| application_types | 2 | Semicolon-separated types |
| Product Type | 3 | Palette name |
| Primary (Hex) | 4 | Primary color |
| Secondary (Hex) | 5 | Secondary color |
| CTA (Hex) | 6 | Call-to-action color |
| Background (Hex) | 7 | Background color |
| Text (Hex) | 8 | Text color |
| Border (Hex) | 9 | Border color |
| Notes | 10 | Design rationale |

---

## generate-tokens.ts

### Purpose & Role

Generates the final design token outputs in multiple framework formats using Handlebars templates.

### Input Schema

```typescript
interface GenerateTokensInput {
  layout: string;              // Final layout ID
  typography: string;          // Final typography ID
  palette: string;             // Final palette ID
  frameworks?: string[];       // Default: all supported
  outputDir?: string;
}
```

### Output Schema

```typescript
interface GenerateTokensOutput {
  tokens: {
    [framework: string]: string;  // framework -> file path
  };
  manifest: string;            // Path to design_manifest.json
  implementation_guide: string; // Path to IMPLEMENTATION.md
}
```

### Algorithm

```
FUNCTION generateTokens(input: GenerateTokensInput) -> Output:
    // Step 1: Load all selected assets
    layout = loadLayoutMetadata(input.layout)
    typography = loadTypographyData(input.typography)
    palette = loadPaletteData(input.palette)

    // Step 2: Build template context
    context = buildTemplateContext(layout, typography, palette)

    outputDir = input.outputDir OR '.design-pipeline/tokens/'
    ensureDir(outputDir)

    // Step 3: Generate for each framework
    frameworks = input.frameworks OR ['shadcn', 'daisyui', 'aceternity', 'magicui', 'nextui', 'generic']
    tokenPaths = {}

    FOR framework IN frameworks:
        // Load framework profile (token mappings)
        profile = loadFrameworkProfile(framework)

        // Map generic tokens to framework-specific
        frameworkContext = mapTokens(context, profile)

        // Render templates
        paths = renderFrameworkTemplates(framework, frameworkContext, outputDir)
        tokenPaths = { ...tokenPaths, ...paths }

    // Step 4: Generate manifest
    manifest = generateManifest(context, tokenPaths)
    manifestPath = `${outputDir}design_manifest.json`
    writeJSON(manifestPath, manifest)

    // Step 5: Generate implementation guide
    guidePath = generateImplementationGuide(context, tokenPaths, outputDir)

    RETURN {
        tokens: tokenPaths,
        manifest: manifestPath,
        implementation_guide: guidePath
    }

FUNCTION buildTemplateContext(layout, typography, palette) -> Context:
    RETURN {
        // Typography tokens
        fonts: {
            heading: typography.heading_font,
            body: typography.body_font,
            mono: typography.mono_font OR 'monospace',
            googleFontsUrl: typography.google_fonts_url,
            cssImport: typography.css_import
        },

        // Color tokens (multiple formats)
        colors: {
            primary: {
                hex: palette.primary,
                rgb: hexToRgb(palette.primary),
                hsl: hexToHsl(palette.primary)
            },
            secondary: {
                hex: palette.secondary,
                rgb: hexToRgb(palette.secondary),
                hsl: hexToHsl(palette.secondary)
            },
            cta: {
                hex: palette.cta,
                rgb: hexToRgb(palette.cta),
                hsl: hexToHsl(palette.cta)
            },
            background: {
                hex: palette.background,
                rgb: hexToRgb(palette.background),
                hsl: hexToHsl(palette.background)
            },
            foreground: {
                hex: palette.text,
                rgb: hexToRgb(palette.text),
                hsl: hexToHsl(palette.text)
            },
            border: {
                hex: palette.border,
                rgb: hexToRgb(palette.border),
                hsl: hexToHsl(palette.border)
            }
        },

        // Spacing tokens (extracted from layout)
        spacing: extractSpacingFromLayout(layout),

        // Metadata
        meta: {
            layout_id: layout.id,
            typography_id: typography.id,
            palette_id: palette.id,
            generated_at: new Date().toISOString()
        }
    }

FUNCTION mapTokens(context: Context, profile: FrameworkProfile) -> FrameworkContext:
    mapped = { ...context }

    FOR mapping IN profile.mappings:
        genericPath = mapping.generic_token   // e.g., "colors.primary.hex"
        frameworkToken = mapping.framework_token  // e.g., "--primary"

        value = getNestedValue(context, genericPath)
        setNestedValue(mapped, frameworkToken, value)

    RETURN mapped

FUNCTION renderFrameworkTemplates(framework: string, context: Context, outputDir: string) -> Paths:
    templateDir = `skills/bespoke_design_system/templates/${framework}/`
    paths = {}

    IF framework == 'generic':
        // Generic CSS variables
        template = loadTemplate(`${templateDir}design-tokens.css.hbs`)
        output = template(context)
        path = `${outputDir}design-tokens.css`
        writeFile(path, output)
        paths.generic_css = path

    ELSE IF framework == 'shadcn':
        // shadcn-specific files
        cssTemplate = loadTemplate(`${templateDir}globals.css.hbs`)
        cssOutput = cssTemplate(context)
        paths.shadcn_css = `${outputDir}shadcn-tokens.css`
        writeFile(paths.shadcn_css, cssOutput)

        configTemplate = loadTemplate(`${templateDir}tailwind.config.ts.hbs`)
        configOutput = configTemplate(context)
        paths.shadcn_config = `${outputDir}shadcn.tailwind.config.js`
        writeFile(paths.shadcn_config, configOutput)

    ELSE IF framework == 'daisyui':
        // DaisyUI theme
        cssTemplate = loadTemplate(`${templateDir}theme.css.hbs`)
        cssOutput = cssTemplate(context)
        paths.daisyui_css = `${outputDir}daisyui-tokens.css`
        writeFile(paths.daisyui_css, cssOutput)

        configTemplate = loadTemplate(`${templateDir}tailwind.config.ts.hbs`)
        configOutput = configTemplate(context)
        paths.daisyui_config = `${outputDir}daisyui.tailwind.config.js`
        writeFile(paths.daisyui_config, configOutput)

    // Similar patterns for aceternity, magicui, nextui...

    RETURN paths
```

### Token Extraction from Layout

```
FUNCTION extractSpacingFromLayout(layout: Layout) -> SpacingTokens:
    svg = loadSVG(layout.filepath)

    // Analyze layout structure for spacing patterns
    elements = svg.getElementsByTag('rect')

    // Find common spacing values
    margins = []
    paddings = []
    gaps = []

    FOR i = 0 TO elements.length - 1:
        FOR j = i + 1 TO elements.length:
            elem1 = elements[i]
            elem2 = elements[j]

            // Calculate distances
            horizontalGap = elem2.x - (elem1.x + elem1.width)
            verticalGap = elem2.y - (elem1.y + elem1.height)

            IF horizontalGap > 0 AND horizontalGap < 100:
                gaps.push(horizontalGap)
            IF verticalGap > 0 AND verticalGap < 100:
                gaps.push(verticalGap)

    // Find most common values
    commonGaps = findMostCommon(gaps, 5)

    RETURN {
        xs: commonGaps[0] OR 4,
        sm: commonGaps[1] OR 8,
        md: commonGaps[2] OR 16,
        lg: commonGaps[3] OR 24,
        xl: commonGaps[4] OR 32,
        section: findSectionGap(svg) OR 64
    }
```

### Manifest Structure

```json
{
  "version": "1.0",
  "generated_at": "2026-02-05T12:00:00Z",
  "design_system": {
    "layout": {
      "id": "dashboard_sidebar-metrics-grid_01",
      "description": "Sidebar navigation with metrics grid",
      "density": "high"
    },
    "typography": {
      "id": "typo-009",
      "name": "Atkinson Hyperlegible + Georgia",
      "heading_font": "Atkinson Hyperlegible",
      "body_font": "Georgia",
      "google_fonts_url": "..."
    },
    "palette": {
      "id": "palette-02",
      "name": "Wellness Green",
      "primary": "#059669",
      "secondary": "#34D399",
      "cta": "#0284C7",
      "background": "#F8FAFC",
      "text": "#0F172A",
      "border": "#E2E8F0"
    }
  },
  "tokens": {
    "colors": { ... },
    "typography": { ... },
    "spacing": { ... }
  },
  "generated_files": {
    "generic_css": ".design-pipeline/tokens/design-tokens.css",
    "shadcn_css": ".design-pipeline/tokens/shadcn-tokens.css",
    "shadcn_config": ".design-pipeline/tokens/shadcn.tailwind.config.js"
  },
  "contrast_compliance": {
    "text_on_background": "16.2:1 (AAA)",
    "cta_on_background": "4.8:1 (AA)"
  }
}
```

---

## Error Handling Standards

### Standard Error Response Format

All scripts should output errors as JSON to stderr:

```json
{
  "error": true,
  "code": "INSUFFICIENT_MATCHES",
  "message": "Found only 3 typography matches for niche 'industrial', needed 15",
  "details": {
    "niche": "industrial",
    "found": 3,
    "required": 15
  },
  "suggestions": [
    "Try removing the application_type filter",
    "Consider using related niche 'dashboard'"
  ]
}
```

### Error Code Reference

| Code | Numeric | Description |
|------|---------|-------------|
| INVALID_PARAMS | 1 | Missing or invalid parameters |
| MISSING_FILE | 2 | Required file not found |
| INSUFFICIENT_MATCHES | 3 | Filter returned too few results |
| INVALID_STATE | 4 | State file corrupted or inconsistent |
| PARSE_ERROR | 5 | Failed to parse CSV/JSON/SVG |
| TEMPLATE_ERROR | 6 | Handlebars template rendering failed |
| IO_ERROR | 7 | File read/write failed |

### Logging Standard

```typescript
// Log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

function log(level: LogLevel, message: string, data?: object) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...data
  };

  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else if (process.env.DEBUG) {
    console.error(JSON.stringify(entry));
  }
}
```

---

*End of Script Algorithms Specification*