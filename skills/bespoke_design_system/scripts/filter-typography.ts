/**
 * filter-typography.ts
 * Queries typography.csv and returns niche-appropriate font pairings
 *
 * Usage: npx tsx scripts/filter-typography.ts --niche "medical" --application-type "patient-portal" --count 15
 */

import { loadCSV, rowContains, getRowValue } from './utils/csv-loader.js';
import { buildGoogleFontsUrl } from './utils/svg-manipulator.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

interface TypographyEntry {
  id: string;
  pairing_name: string;
  heading_font: string;
  body_font: string;
  category: string;
  mood: string[];
  best_for: string;
  google_fonts_url: string;
  css_import: string;
  tailwind_config: string;
  notes: string;
}

interface FilterResult {
  typography: TypographyEntry[];
  total_matches: number;
  filter_strategy: 'exact_match' | 'niche_only' | 'expanded' | 'fallback';
}

// Related niches for fallback expansion
const RELATED_NICHES: Record<string, string[]> = {
  medical: ['saas'],
  fintech: ['dashboard'],
  dashboard: ['saas', 'fintech'],
  saas: ['dashboard'],
  ecommerce: ['marketing'],
  marketing: ['portfolio'],
  portfolio: ['marketing', 'blog'],
  blog: ['portfolio'],
  industrial: ['dashboard'],
  education: ['saas'],
  realestate: ['marketing'],
  social: ['saas'],
  food: ['ecommerce'],
  travel: ['marketing'],
  nonprofit: ['medical']
};

function parseArgs() {
  const args = process.argv.slice(2);
  let niche = '';
  let applicationType = '';
  let count = 15;
  let category = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--niche' && args[i + 1]) { niche = args[i + 1]; i++; }
    else if (args[i] === '--application-type' && args[i + 1]) { applicationType = args[i + 1]; i++; }
    else if (args[i] === '--count' && args[i + 1]) { count = parseInt(args[i + 1]); i++; }
    else if (args[i] === '--category' && args[i + 1]) { category = args[i + 1]; i++; }
  }

  if (!niche) {
    console.error(JSON.stringify({ error: true, code: 'INVALID_PARAMS', message: 'Missing --niche parameter' }));
    process.exit(1);
  }

  return { niche, applicationType, count, category };
}

function csvRowToTypography(row: ReturnType<typeof loadCSV>['rows'][0], index: number): TypographyEntry {
  const raw = row.raw;
  const headingFont = raw[5] || '';
  const bodyFont = raw[6] || '';
  return {
    id: `typo-${String(index + 1).padStart(3, '0')}`,
    pairing_name: raw[3] || '',
    heading_font: headingFont,
    body_font: bodyFont,
    category: raw[4] || '',
    mood: (raw[7] || '').split(/[,;]/).map(s => s.trim()).filter(Boolean),
    best_for: raw[8] || '',
    // Construct URL dynamically — CSV column is misaligned due to unquoted commas
    google_fonts_url: headingFont && bodyFont ? buildGoogleFontsUrl(headingFont, bodyFont) : '',
    css_import: '',
    tailwind_config: '',
    notes: ''
  };
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function selectDiverse(entries: TypographyEntry[], count: number): TypographyEntry[] {
  if (entries.length <= count) return entries;

  // Get unique categories
  const categories = [...new Set(entries.map(e => e.category))];
  const selected: TypographyEntry[] = [];
  const perCategory = Math.ceil(count / categories.length);

  for (const cat of categories) {
    const catEntries = entries.filter(e => e.category === cat);
    selected.push(...shuffle(catEntries).slice(0, perCategory));
    if (selected.length >= count) break;
  }

  // Fill remaining
  if (selected.length < count) {
    const remaining = entries.filter(e => !selected.includes(e));
    selected.push(...shuffle(remaining).slice(0, count - selected.length));
  }

  return selected.slice(0, count);
}

function filterTypography(niche: string, applicationType: string, count: number, category: string): FilterResult {
  const csv = loadCSV('data/typography.csv');

  // Strategy 1: Exact match (niche + application_type)
  if (applicationType) {
    const exact = csv.rows.filter(row =>
      rowContains(row, 'niche_id', niche) &&
      rowContains(row, 'application_types', applicationType)
    );
    if (exact.length >= count) {
      const entries = exact.map((r, i) => csvRowToTypography(r, i));
      return {
        typography: selectDiverse(entries, count),
        total_matches: exact.length,
        filter_strategy: 'exact_match'
      };
    }
  }

  // Strategy 2: Niche only
  const nicheMatches = csv.rows.filter(row => rowContains(row, 'niche_id', niche));
  if (nicheMatches.length >= count) {
    const entries = nicheMatches.map((r, i) => csvRowToTypography(r, i));
    return {
      typography: selectDiverse(entries, count),
      total_matches: nicheMatches.length,
      filter_strategy: 'niche_only'
    };
  }

  // Strategy 3: Expand to related niches
  const related = RELATED_NICHES[niche] || [];
  const allNiches = [niche, ...related];
  const expanded = csv.rows.filter(row =>
    allNiches.some(n => rowContains(row, 'niche_id', n))
  );
  if (expanded.length >= count) {
    const entries = expanded.map((r, i) => csvRowToTypography(r, i));
    return {
      typography: selectDiverse(entries, count),
      total_matches: expanded.length,
      filter_strategy: 'expanded'
    };
  }

  // Strategy 4: Include everything (fallback)
  const all = csv.rows;
  const entries = all.map((r, i) => csvRowToTypography(r, i));
  return {
    typography: selectDiverse(entries, Math.min(count, entries.length)),
    total_matches: all.length,
    filter_strategy: 'fallback'
  };
}

// Main
const { niche, applicationType, count, category } = parseArgs();
const result = filterTypography(niche, applicationType, count, category);

// Also save filtered data for downstream scripts
const outputDir = '.design-pipeline/typography';
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
writeFileSync(`${outputDir}/filtered.json`, JSON.stringify(result.typography, null, 2));

console.log(JSON.stringify(result, null, 2));
