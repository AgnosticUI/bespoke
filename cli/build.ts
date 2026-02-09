import * as esbuild from 'esbuild';
import { cpSync, mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';

const SKILL_DIR = resolve('../skills/bespoke_design_system');
const DIST = resolve('dist');
const ASSETS = join(DIST, 'assets');

/**
 * esbuild plugin to strip self-test blocks from utility modules.
 * These blocks use `if (import.meta.url === ...)` guards that don't work
 * correctly when bundled — import.meta.url matches the entry point, so
 * the self-tests fire on every invocation, resetting pipeline state.
 */
function stripSelfTestPlugin(): esbuild.Plugin {
  return {
    name: 'strip-self-tests',
    setup(build) {
      build.onLoad({ filter: /scripts\/utils\/.*\.ts$/ }, async (args) => {
        let contents = readFileSync(args.path, 'utf-8');

        // Remove the self-test block: `if (import.meta.url === ...) { ... }` at end of file
        // Match the comment line (// Self-test... or // CLI when...) + the if block to EOF
        const selfTestPattern = /\n*\/\/\s*(?:Self-test|CLI).*\nif\s*\(import\.meta\.url\s*===[\s\S]*$/;
        if (selfTestPattern.test(contents)) {
          contents = contents.replace(selfTestPattern, '\n');
        }

        return { contents, loader: 'ts' };
      });
    },
  };
}

const MAIN_SCRIPTS = [
  'match-niche',
  'generate-layouts',
  'filter-typography',
  'apply-typography-to-layout',
  'combine-previews',
  'generate-palette-combinations',
  'generate-tokens',
];

async function bundleScripts() {
  console.log('Bundling pipeline scripts...');
  const scriptsOut = join(ASSETS, 'scripts');
  mkdirSync(scriptsOut, { recursive: true });

  for (const name of MAIN_SCRIPTS) {
    const input = join(SKILL_DIR, 'scripts', `${name}.ts`);
    if (!existsSync(input)) {
      console.warn(`  Warning: ${input} not found, skipping`);
      continue;
    }
    await esbuild.build({
      entryPoints: [input],
      bundle: true,
      platform: 'node',
      target: 'node18',
      format: 'esm',
      outfile: join(scriptsOut, `${name}.js`),
      external: ['puppeteer'],
      minify: false,
      treeShaking: true,
      plugins: [stripSelfTestPlugin()],
      // Resolve path aliases from the skill's tsconfig
      alias: {
        '@utils': join(SKILL_DIR, 'scripts/utils'),
        '@data': join(SKILL_DIR, 'data'),
        '@templates': join(SKILL_DIR, 'templates'),
      },
      // Resolve npm deps from CLI's node_modules (scripts live outside cli/)
      nodePaths: [resolve('node_modules')],
    });
    console.log(`  Bundled: ${name}.js`);
  }
}

function copyAssets() {
  console.log('Copying assets...');

  // Templates (.hbs files only)
  copyDirFiltered(
    join(SKILL_DIR, 'templates'),
    join(ASSETS, 'templates'),
    (filePath) => extname(filePath) === '.hbs'
  );
  console.log('  Copied: templates/**/*.hbs');

  // Layouts (all SVGs)
  copyDirFiltered(
    join(SKILL_DIR, 'layouts'),
    join(ASSETS, 'layouts'),
    (filePath) => extname(filePath) === '.svg'
  );
  console.log('  Copied: layouts/**/*.svg');

  // Data files (.csv, .json only — skip docs)
  copyDirFiltered(
    join(SKILL_DIR, 'data'),
    join(ASSETS, 'data'),
    (filePath) => ['.csv', '.json'].includes(extname(filePath))
  );
  console.log('  Copied: data/*.csv, data/*.json');
}

function copyDirFiltered(src: string, dest: string, filter: (filePath: string) => boolean) {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });

  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      copyDirFiltered(srcPath, destPath, filter);
    } else if (filter(srcPath)) {
      // Ensure parent dir exists
      mkdirSync(dest, { recursive: true });
      cpSync(srcPath, destPath);
    }
  }
}

function transformSkillMd() {
  console.log('Transforming SKILL.md...');
  const skillPath = join(SKILL_DIR, 'SKILL.md');
  let content = readFileSync(skillPath, 'utf-8');

  // Replace `npx tsx scripts/X.ts` with `node scripts/X.js`
  content = content.replace(/npx tsx scripts\/(\S+)\.ts/g, 'node scripts/$1.js');

  // Also replace bare `tsx scripts/X.ts` (from package.json script references)
  content = content.replace(/(?<!npx )tsx scripts\/(\S+)\.ts/g, 'node scripts/$1.js');

  writeFileSync(join(ASSETS, 'SKILL.md'), content);
  console.log('  Transformed: SKILL.md (tsx -> node)');
}

async function bundleCli() {
  console.log('Bundling CLI...');
  await esbuild.build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    outfile: join(DIST, 'index.cjs'),
    banner: { js: '#!/usr/bin/env node' },
    external: [],
  });
  console.log('  Bundled: dist/index.cjs');
}

async function main() {
  console.log('Building bespokeui-cli...\n');

  mkdirSync(ASSETS, { recursive: true });

  await bundleScripts();
  console.log('');
  copyAssets();
  console.log('');
  transformSkillMd();
  console.log('');
  await bundleCli();

  console.log('\nBuild complete!');
}

main().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
