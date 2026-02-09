import { existsSync } from 'node:fs';
import { join } from 'node:path';

const REQUIRED_FILES = [
  'SKILL.md',
  'scripts/match-niche.js',
  'scripts/generate-layouts.js',
  'scripts/filter-typography.js',
  'scripts/apply-typography-to-layout.js',
  'scripts/combine-previews.js',
  'scripts/generate-palette-combinations.js',
  'scripts/generate-tokens.js',
  'templates/shadcn/globals.css.hbs',
  'templates/generic/design-tokens.css.hbs',
  'templates/daisyui/theme.css.hbs',
  'templates/agnosticui/design-tokens.css.hbs',
  'data/typography.csv',
  'data/colors.csv',
  'data/niche-taxonomy.json',
];

const REQUIRED_DIRS = ['layouts'];

export interface ValidationResult {
  valid: boolean;
  missingFiles: string[];
  missingDirs: string[];
}

export function validateInstallation(installDir: string): ValidationResult {
  const missingFiles: string[] = [];
  const missingDirs: string[] = [];

  for (const file of REQUIRED_FILES) {
    if (!existsSync(join(installDir, file))) {
      missingFiles.push(file);
    }
  }

  for (const dir of REQUIRED_DIRS) {
    if (!existsSync(join(installDir, dir))) {
      missingDirs.push(dir);
    }
  }

  return {
    valid: missingFiles.length === 0 && missingDirs.length === 0,
    missingFiles,
    missingDirs,
  };
}
