import { cpSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export interface CopyOptions {
  overwrite?: boolean;
}

export function copyDirectory(src: string, dest: string, options: CopyOptions = {}): number {
  const { overwrite = false } = options;

  if (!existsSync(src)) {
    throw new Error(`Source directory does not exist: ${src}`);
  }

  mkdirSync(dest, { recursive: true });
  let count = 0;

  function walk(srcDir: string, destDir: string) {
    for (const entry of readdirSync(srcDir)) {
      const srcPath = join(srcDir, entry);
      const destPath = join(destDir, entry);
      const stat = statSync(srcPath);

      if (stat.isDirectory()) {
        mkdirSync(destPath, { recursive: true });
        walk(srcPath, destPath);
      } else {
        if (!overwrite && existsSync(destPath)) {
          continue;
        }
        mkdirSync(destDir, { recursive: true });
        cpSync(srcPath, destPath);
        count++;
      }
    }
  }

  walk(src, dest);
  return count;
}
