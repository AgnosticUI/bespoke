/**
 * CSV Loader Utility
 * Parses CSV files with support for multi-value columns (semicolon-separated)
 */

import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { resolve } from 'path';

export interface CSVRow {
  raw: string[];
  parsed: Record<string, string | string[]>;
}

export interface CSVData {
  headers: string[];
  rows: CSVRow[];

  /** Get all values from a column by name */
  getColumn(name: string): (string | string[])[];

  /** Filter rows where column equals value exactly */
  filterBy(column: string, value: string): CSVRow[];

  /** Filter rows where column contains value (for multi-value columns) */
  filterByMulti(column: string, value: string): CSVRow[];

  /** Get raw row data as array of objects */
  toObjects(): Record<string, string>[];
}

export interface CSVLoaderOptions {
  hasHeader?: boolean;
  delimiter?: string;
  multiValueSeparator?: string;
  multiValueColumns?: string[];
}

const DEFAULT_OPTIONS: Required<CSVLoaderOptions> = {
  hasHeader: true,
  delimiter: ',',
  multiValueSeparator: ';',
  multiValueColumns: ['niche_id', 'application_types']
};

/**
 * Parse a multi-value string into an array
 */
function parseMultiValue(value: string, separator: string): string[] {
  if (!value || value.trim() === '') {
    return [];
  }
  return value.split(separator).map(v => v.trim()).filter(v => v.length > 0);
}

/**
 * Load and parse a CSV file
 */
export function loadCSV(filePath: string, options: CSVLoaderOptions = {}): CSVData {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Resolve path relative to project root
  const absolutePath = resolve(filePath);
  const content = readFileSync(absolutePath, 'utf-8');

  // Parse CSV
  const records: string[][] = parse(content, {
    delimiter: opts.delimiter,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true
  });

  if (records.length === 0) {
    return createEmptyCSVData();
  }

  // Extract headers
  const headers = opts.hasHeader ? records[0] : records[0].map((_, i) => `column_${i}`);
  const dataRows = opts.hasHeader ? records.slice(1) : records;

  // Parse rows
  const rows: CSVRow[] = dataRows.map(rawRow => {
    const parsed: Record<string, string | string[]> = {};

    headers.forEach((header, index) => {
      const value = rawRow[index] || '';

      // Check if this column should be parsed as multi-value
      if (opts.multiValueColumns?.includes(header) && value.includes(opts.multiValueSeparator)) {
        parsed[header] = parseMultiValue(value, opts.multiValueSeparator);
      } else {
        parsed[header] = value;
      }
    });

    return { raw: rawRow, parsed };
  });

  return createCSVData(headers, rows);
}

function createEmptyCSVData(): CSVData {
  return createCSVData([], []);
}

function createCSVData(headers: string[], rows: CSVRow[]): CSVData {
  return {
    headers,
    rows,

    getColumn(name: string): (string | string[])[] {
      return rows.map(row => row.parsed[name]);
    },

    filterBy(column: string, value: string): CSVRow[] {
      return rows.filter(row => {
        const colValue = row.parsed[column];
        if (Array.isArray(colValue)) {
          return colValue.includes(value);
        }
        return colValue === value;
      });
    },

    filterByMulti(column: string, value: string): CSVRow[] {
      return rows.filter(row => {
        const colValue = row.parsed[column];
        if (Array.isArray(colValue)) {
          return colValue.includes(value);
        }
        return colValue === value;
      });
    },

    toObjects(): Record<string, string>[] {
      return rows.map(row => {
        const obj: Record<string, string> = {};
        headers.forEach((header, index) => {
          obj[header] = row.raw[index] || '';
        });
        return obj;
      });
    }
  };
}

/**
 * Get a value from a parsed row, handling both string and array types
 */
export function getRowValue(row: CSVRow, column: string): string {
  const value = row.parsed[column];
  if (Array.isArray(value)) {
    return value.join(';');
  }
  return value || '';
}

/**
 * Check if a row's column contains a specific value (works for multi-value columns)
 */
export function rowContains(row: CSVRow, column: string, value: string): boolean {
  const colValue = row.parsed[column];
  if (Array.isArray(colValue)) {
    return colValue.includes(value);
  }
  return colValue === value;
}

// Self-test when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('Testing CSV Loader...\n');

  try {
    // Test with typography.csv
    const typography = loadCSV('data/typography.csv');
    console.log(`Loaded typography.csv: ${typography.rows.length} rows`);
    console.log(`Headers: ${typography.headers.join(', ')}`);

    // Test multi-value filtering
    const saasTypography = typography.filterByMulti('niche_id', 'saas');
    console.log(`\nTypography matching niche_id='saas': ${saasTypography.length} rows`);

    if (saasTypography.length > 0) {
      console.log('First match:', saasTypography[0].parsed['Font Pairing Name']);
    }

    // Test with colors.csv
    const colors = loadCSV('data/colors.csv');
    console.log(`\nLoaded colors.csv: ${colors.rows.length} rows`);

    const portfolioColors = colors.filterByMulti('niche_id', 'portfolio');
    console.log(`Colors matching niche_id='portfolio': ${portfolioColors.length} rows`);

    console.log('\n✓ CSV Loader tests passed');
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}
