/**
 * generate-preview-image.ts
 * Optional Puppeteer wrapper for generating PNG screenshots of preview HTML files.
 * Gracefully degrades if Puppeteer is not installed.
 *
 * Usage (standalone): npx tsx scripts/utils/generate-preview-image.ts <html-path> <output-path> [--width 1200] [--height 800]
 * Usage (import):     import { generatePreviewImage } from './utils/generate-preview-image.js';
 */

export interface PreviewImageOptions {
  width?: number;
  height?: number;
  fullPage?: boolean;
  deviceScaleFactor?: number;
}

const DEFAULT_OPTIONS: Required<PreviewImageOptions> = {
  width: 1200,
  height: 800,
  fullPage: true,
  deviceScaleFactor: 2
};

/**
 * Generate a PNG screenshot of an HTML file using Puppeteer.
 * Returns true on success, false if Puppeteer is not available.
 */
export async function generatePreviewImage(
  htmlPath: string,
  outputPath: string,
  options: PreviewImageOptions = {}
): Promise<boolean> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Dynamic import for graceful degradation
    const puppeteer = await import('puppeteer');
    const { resolve } = await import('path');

    const absoluteHtmlPath = resolve(htmlPath);
    const absoluteOutputPath = resolve(outputPath);

    const browser = await puppeteer.default.launch({ headless: true });
    const page = await browser.newPage();

    await page.setViewport({
      width: opts.width,
      height: opts.height,
      deviceScaleFactor: opts.deviceScaleFactor
    });

    await page.goto(`file://${absoluteHtmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

    await page.screenshot({
      path: absoluteOutputPath,
      fullPage: opts.fullPage
    });

    await browser.close();
    return true;
  } catch (error: any) {
    if (error.code === 'ERR_MODULE_NOT_FOUND' || error.code === 'MODULE_NOT_FOUND') {
      console.warn('Puppeteer not installed. Skipping PNG generation. Install with: npm install puppeteer');
    } else {
      console.warn(`Preview image generation failed: ${error.message}`);
    }
    return false;
  }
}

// CLI when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error('Usage: npx tsx scripts/utils/generate-preview-image.ts <html-path> <output-path> [--width 1200] [--height 800]');
    process.exit(1);
  }

  const htmlPath = args[0];
  const outputPath = args[1];
  let width = 1200;
  let height = 800;

  for (let i = 2; i < args.length; i++) {
    if (args[i] === '--width' && args[i + 1]) { width = parseInt(args[i + 1]); i++; }
    else if (args[i] === '--height' && args[i + 1]) { height = parseInt(args[i + 1]); i++; }
  }

  generatePreviewImage(htmlPath, outputPath, { width, height }).then(success => {
    if (success) {
      console.log(JSON.stringify({ success: true, output: outputPath }));
    } else {
      console.log(JSON.stringify({ success: false, message: 'PNG generation unavailable' }));
    }
  });
}
