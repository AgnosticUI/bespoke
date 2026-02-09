import { join, dirname } from 'node:path';
import { existsSync } from 'node:fs';
import prompts from 'prompts';
import { detectPlatforms, getPlatform, getAllPlatforms, isInstalled, type PlatformConfig } from '../utils/detect.js';
import { copyDirectory } from '../utils/copy.js';
import { validateInstallation } from '../utils/validate.js';
import * as log from '../utils/logger.js';

function getAssetsDir(): string {
  // CLI bundles to dist/index.js (CJS), assets at dist/assets/
  // __dirname is available in CJS and points to the directory of the bundled file
  const bundledDir = typeof __dirname !== 'undefined' ? __dirname : dirname('.');
  const candidates = [
    join(bundledDir, 'assets'),
    join(bundledDir, '..', 'dist', 'assets'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return candidates[0];
}

export interface InitOptions {
  ai?: string;
  force?: boolean;
}

export async function initCommand(options: InitOptions) {
  const cwd = process.cwd();
  const assetsDir = getAssetsDir();

  log.title('Bespoke Design System Installer');

  if (!existsSync(assetsDir)) {
    log.error(`Assets not found at ${assetsDir}`);
    log.info('Run "npm run build" in the cli directory first.');
    process.exit(1);
  }

  // Determine target platforms
  let targets: PlatformConfig[] = [];

  if (options.ai) {
    if (options.ai === 'all') {
      targets = getAllPlatforms();
    } else {
      const ids = options.ai.split(',');
      for (const id of ids) {
        const platform = getPlatform(id.trim());
        if (!platform) {
          log.error(`Unknown platform: ${id}`);
          const validIds = getAllPlatforms().map((p) => p.id).join(', ');
          log.info(`Valid platforms: ${validIds}, all`);
          process.exit(1);
        }
        targets.push(platform);
      }
    }
  } else {
    // Auto-detect
    const detected = detectPlatforms(cwd);

    if (detected.length === 0) {
      log.warn('No AI coding assistant directories detected.');
      const configDirs = getAllPlatforms().map((p) => `${p.configDir}/`).join(', ');
      log.info(`Expected one of: ${configDirs}`);
      log.info('Use --ai <platform|all> to specify manually. Run --help for the full list.');
      process.exit(1);
    }

    if (detected.length === 1) {
      targets = detected;
    } else {
      // Multiple detected — prompt user
      const response = await prompts({
        type: 'multiselect',
        name: 'platforms',
        message: 'Multiple AI assistants detected. Install to:',
        choices: detected.map((p) => ({
          title: p.name,
          value: p,
          selected: true,
        })),
        min: 1,
      });

      if (!response.platforms || response.platforms.length === 0) {
        log.info('Installation cancelled.');
        process.exit(0);
      }
      targets = response.platforms;
    }
  }

  // Install to each target
  for (const platform of targets) {
    const targetDir = join(cwd, platform.skillDir);
    const alreadyInstalled = isInstalled(cwd, platform);

    if (alreadyInstalled && !options.force) {
      log.warn(`Already installed for ${platform.name} at ${platform.skillDir}`);
      log.info('Use --force to overwrite.');
      continue;
    }

    const spinner = log.startSpinner(`Installing to ${platform.name}...`);

    try {
      const fileCount = copyDirectory(assetsDir, targetDir, {
        overwrite: options.force ?? false,
      });

      // Validate
      const result = validateInstallation(targetDir);

      if (result.valid) {
        log.succeedSpinner(`Installed to ${platform.skillDir} (${fileCount} files)`);
      } else {
        log.failSpinner(`Installed with warnings`);
        if (result.missingFiles.length > 0) {
          log.warn('Missing files:');
          for (const f of result.missingFiles) {
            log.info(`  - ${f}`);
          }
        }
        if (result.missingDirs.length > 0) {
          log.warn('Missing directories:');
          for (const d of result.missingDirs) {
            log.info(`  - ${d}`);
          }
        }
      }
    } catch (err) {
      log.failSpinner(`Failed to install to ${platform.name}`);
      log.error(String(err));
    }
  }

  // Summary
  console.log('');
  log.success('Installation complete!');
  console.log('');
  log.info('Next steps:');
  log.info('  1. Open your AI coding assistant in this project');
  log.info('  2. Describe your web application (e.g., "patient portal for a clinic")');
  log.info('  3. The Bespoke Design Pipeline skill will guide you through 6 stages');
  console.log('');
  log.info('The skill requires only Node.js — no additional npm install needed.');
}
