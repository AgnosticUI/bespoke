#!/usr/bin/env ts-node
/**
 * Example: How to filter typography and colors using the restructured CSVs
 * 
 * This demonstrates the filtering logic that will be used in:
 * - filter-typography.ts (Stage 3)
 * - generate-palette-combinations.ts (Stage 4a)
 */

import * as fs from 'fs';

interface TypographyRow {
  no: string;
  niche_id: string[];
  application_types: string[];
  font_pairing_name: string;
  category: string;
  heading_font: string;
  body_font: string;
  mood: string;
  best_for: string;
  google_fonts_url: string;
  css_import: string;
  tailwind_config: string;
  notes: string;
}

interface ColorRow {
  no: string;
  niche_id: string[];
  application_types: string[];
  product_type: string;
  primary: string;
  secondary: string;
  cta: string;
  background: string;
  text: string;
  border: string;
  notes: string;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

function parseTypographyCsv(filePath: string): TypographyRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  const rows: TypographyRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 13) continue;
    
    rows.push({
      no: cols[0],
      niche_id: cols[1].split(';').filter(Boolean),
      application_types: cols[2].split(';').filter(Boolean),
      font_pairing_name: cols[3],
      category: cols[4],
      heading_font: cols[5],
      body_font: cols[6],
      mood: cols[7],
      best_for: cols[8],
      google_fonts_url: cols[9],
      css_import: cols[10],
      tailwind_config: cols[11],
      notes: cols[12]
    });
  }
  
  return rows;
}

function parseColorsCsv(filePath: string): ColorRow[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());
  const rows: ColorRow[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 11) continue;
    
    rows.push({
      no: cols[0],
      niche_id: cols[1].split(';').filter(Boolean),
      application_types: cols[2].split(';').filter(Boolean),
      product_type: cols[3],
      primary: cols[4],
      secondary: cols[5],
      cta: cols[6],
      background: cols[7],
      text: cols[8],
      border: cols[9],
      notes: cols[10]
    });
  }
  
  return rows;
}

/**
 * Filter typography based on niche_id and application_type
 * Priority: Exact match > Niche match > All
 */
function filterTypography(
  typography: TypographyRow[],
  nicheId: string,
  applicationType?: string,
  limit: number = 15
): TypographyRow[] {
  // Priority 1: Exact match on both niche_id and application_type
  if (applicationType) {
    const exactMatches = typography.filter(row =>
      row.niche_id.includes(nicheId) &&
      row.application_types.includes(applicationType)
    );
    
    if (exactMatches.length >= limit) {
      return exactMatches.slice(0, limit);
    }
  }
  
  // Priority 2: Match on niche_id only
  const nicheMatches = typography.filter(row =>
    row.niche_id.includes(nicheId)
  );
  
  if (nicheMatches.length >= limit) {
    return nicheMatches.slice(0, limit);
  }
  
  // Priority 3: Return all niche matches even if < limit
  return nicheMatches;
}

/**
 * Filter colors based on niche_id and application_type
 * Priority: Exact match > Niche match > All
 */
function filterColors(
  colors: ColorRow[],
  nicheId: string,
  applicationType?: string,
  limit: number = 5
): ColorRow[] {
  // Priority 1: Exact match on both niche_id and application_type
  if (applicationType) {
    const exactMatches = colors.filter(row =>
      row.niche_id.includes(nicheId) &&
      row.application_types.includes(applicationType)
    );
    
    if (exactMatches.length >= limit) {
      return exactMatches.slice(0, limit);
    }
  }
  
  // Priority 2: Match on niche_id only
  const nicheMatches = colors.filter(row =>
    row.niche_id.includes(nicheId)
  );
  
  if (nicheMatches.length >= limit) {
    return nicheMatches.slice(0, limit);
  }
  
  // Priority 3: Return all niche matches even if < limit
  return nicheMatches;
}

// Example usage
console.log('='.repeat(80));
console.log('EXAMPLE 1: SaaS Project Management Tool');
console.log('='.repeat(80));

const typography = parseTypographyCsv('typography-restructured.csv');
const colors = parseColorsCsv('colors-restructured.csv');

const saasTypography = filterTypography(typography, 'saas', 'project-management', 15);
const saasColors = filterColors(colors, 'saas', 'project-management', 5);

console.log(`\nTypography Results: ${saasTypography.length} pairings`);
saasTypography.slice(0, 5).forEach(t => {
  console.log(`  - ${t.font_pairing_name}: ${t.heading_font} + ${t.body_font}`);
  console.log(`    Niches: ${t.niche_id.join(', ')}`);
  console.log(`    App Types: ${t.application_types.join(', ')}`);
});

console.log(`\nColor Results: ${saasColors.length} palettes`);
saasColors.slice(0, 5).forEach(c => {
  console.log(`  - ${c.product_type}: Primary ${c.primary}, CTA ${c.cta}`);
  console.log(`    Niches: ${c.niche_id.join(', ')}`);
  console.log(`    App Types: ${c.application_types.join(', ')}`);
});

console.log('\n' + '='.repeat(80));
console.log('EXAMPLE 2: E-commerce Fashion Store');
console.log('='.repeat(80));

const ecommerceTypography = filterTypography(typography, 'ecommerce', 'storefront', 15);
const ecommerceColors = filterColors(colors, 'ecommerce', 'storefront', 5);

console.log(`\nTypography Results: ${ecommerceTypography.length} pairings`);
ecommerceTypography.slice(0, 5).forEach(t => {
  console.log(`  - ${t.font_pairing_name}: ${t.heading_font} + ${t.body_font}`);
});

console.log(`\nColor Results: ${ecommerceColors.length} palettes`);
ecommerceColors.slice(0, 5).forEach(c => {
  console.log(`  - ${c.product_type}: Primary ${c.primary}, CTA ${c.cta}`);
});

console.log('\n' + '='.repeat(80));
console.log('EXAMPLE 3: Dashboard Analytics (niche only, no specific app type)');
console.log('='.repeat(80));

const dashboardTypography = filterTypography(typography, 'dashboard', undefined, 15);
const dashboardColors = filterColors(colors, 'dashboard', undefined, 5);

console.log(`\nTypography Results: ${dashboardTypography.length} pairings`);
dashboardTypography.slice(0, 5).forEach(t => {
  console.log(`  - ${t.font_pairing_name}: ${t.heading_font} + ${t.body_font}`);
});

console.log(`\nColor Results: ${dashboardColors.length} palettes`);
dashboardColors.slice(0, 5).forEach(c => {
  console.log(`  - ${c.product_type}: Primary ${c.primary}, CTA ${c.cta}`);
});

console.log('\n✅ Query examples complete!');
