/**
 * filter-colors.ts
 * Shared utility for querying colors.csv and returning niche-appropriate palettes.
 * Used by generate-palette-combinations.ts and can be run standalone for testing.
 *
 * Usage: npx tsx scripts/utils/filter-colors.ts --niche "medical" --application-type "patient-portal" --count 15
 */

import { loadCSV, rowContains } from './csv-loader.js';
import { hexToHsl } from './color-conversions.js';

export interface ColorPalette {
  id: string;
  product_type: string;
  primary: string;
  secondary: string;
  cta: string;
  background: string;
  text: string;
  border: string;
  notes: string;
}

export interface ColorFilterResult {
  palettes: ColorPalette[];
  total_matches: number;
  filter_strategy: 'exact_match' | 'niche_only' | 'expanded' | 'fallback';
}

// Related niches for fallback expansion (same as filter-typography)
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

function csvRowToColorPalette(row: ReturnType<typeof loadCSV>['rows'][0], index: number): ColorPalette {
  const raw = row.raw;
  return {
    id: `palette-${String(index + 1).padStart(3, '0')}`,
    product_type: raw[3] || '',
    primary: raw[4] || '',
    secondary: raw[5] || '',
    cta: raw[6] || '',
    background: raw[7] || '',
    text: raw[8] || '',
    border: raw[9] || '',
    notes: raw[10] || ''
  };
}

/**
 * Get the primary hue (0-360) from a hex color.
 * Returns -1 for achromatic colors (white, black, grays).
 */
function getPrimaryHue(hex: string): number {
  try {
    const [h, s] = hexToHsl(hex);
    // If saturation is very low, treat as achromatic
    if (s < 5) return -1;
    return h;
  } catch {
    return -1;
  }
}

/**
 * Select palettes with hue diversity to avoid too-similar color schemes.
 * Groups by primary color hue bucket (30° increments = 12 buckets),
 * then picks evenly across buckets.
 */
function selectDiverse(palettes: ColorPalette[], count: number): ColorPalette[] {
  if (palettes.length <= count) return palettes;

  // Bucket by primary color hue (30° increments)
  const HUE_BUCKET_SIZE = 30;
  const buckets = new Map<number, ColorPalette[]>();

  for (const palette of palettes) {
    const hue = getPrimaryHue(palette.primary);
    const bucket = hue < 0 ? -1 : Math.floor(hue / HUE_BUCKET_SIZE);
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket)!.push(palette);
  }

  const selected: ColorPalette[] = [];
  const bucketKeys = [...buckets.keys()].sort((a, b) => a - b);
  const perBucket = Math.ceil(count / bucketKeys.length);

  for (const key of bucketKeys) {
    const bucketPalettes = buckets.get(key)!;
    selected.push(...bucketPalettes.slice(0, perBucket));
    if (selected.length >= count) break;
  }

  // Fill remaining from unselected palettes
  if (selected.length < count) {
    const remaining = palettes.filter(p => !selected.includes(p));
    selected.push(...remaining.slice(0, count - selected.length));
  }

  return selected.slice(0, count);
}

/**
 * Filter color palettes using cascading strategy:
 * 1. Exact match (niche + application_type)
 * 2. Niche only
 * 3. Expanded to related niches
 * 4. Fallback (all palettes)
 */
export function filterColors(niche: string, applicationType: string, count: number): ColorFilterResult {
  const csv = loadCSV('data/colors.csv');

  // Strategy 1: Exact match (niche + application_type)
  if (applicationType) {
    const exact = csv.rows.filter(row =>
      rowContains(row, 'niche_id', niche) &&
      rowContains(row, 'application_types', applicationType)
    );
    if (exact.length >= count) {
      const palettes = exact.map((r, i) => csvRowToColorPalette(r, i));
      return {
        palettes: selectDiverse(palettes, count),
        total_matches: exact.length,
        filter_strategy: 'exact_match'
      };
    }
  }

  // Strategy 2: Niche only
  const nicheMatches = csv.rows.filter(row => rowContains(row, 'niche_id', niche));
  if (nicheMatches.length >= count) {
    const palettes = nicheMatches.map((r, i) => csvRowToColorPalette(r, i));
    return {
      palettes: selectDiverse(palettes, count),
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
    const palettes = expanded.map((r, i) => csvRowToColorPalette(r, i));
    return {
      palettes: selectDiverse(palettes, count),
      total_matches: expanded.length,
      filter_strategy: 'expanded'
    };
  }

  // Strategy 4: Include everything (fallback)
  const all = csv.rows;
  const palettes = all.map((r, i) => csvRowToColorPalette(r, i));
  return {
    palettes: selectDiverse(palettes, Math.min(count, palettes.length)),
    total_matches: all.length,
    filter_strategy: 'fallback'
  };
}

// CLI when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  let niche = '';
  let applicationType = '';
  let count = 15;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--niche' && args[i + 1]) { niche = args[i + 1]; i++; }
    else if (args[i] === '--application-type' && args[i + 1]) { applicationType = args[i + 1]; i++; }
    else if (args[i] === '--count' && args[i + 1]) { count = parseInt(args[i + 1]); i++; }
  }

  if (!niche) {
    console.error(JSON.stringify({ error: true, code: 'INVALID_PARAMS', message: 'Missing --niche parameter' }));
    process.exit(1);
  }

  const result = filterColors(niche, applicationType, count);
  console.log(JSON.stringify(result, null, 2));
}
