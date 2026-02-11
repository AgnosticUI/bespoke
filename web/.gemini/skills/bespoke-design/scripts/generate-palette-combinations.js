// ../skills/bespoke_design_system/scripts/generate-palette-combinations.ts
import { readFileSync as readFileSync4, writeFileSync as writeFileSync3, mkdirSync as mkdirSync2, existsSync as existsSync2 } from "fs";
import { resolve as resolve4, join } from "path";

// ../skills/bespoke_design_system/scripts/utils/svg-manipulator.ts
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

// ../skills/bespoke_design_system/scripts/utils/color-conversions.ts
function hexToRgb(hex) {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return [r, g, b];
  }
  if (cleanHex.length === 6) {
    const r = parseInt(cleanHex.slice(0, 2), 16);
    const g = parseInt(cleanHex.slice(2, 4), 16);
    const b = parseInt(cleanHex.slice(4, 6), 16);
    return [r, g, b];
  }
  throw new Error(`Invalid hex color: ${hex}`);
}
function hexToHsl(hex) {
  const [r, g, b] = hexToRgb(hex).map((x) => x / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) {
    return [0, 0, Math.round(l * 100)];
  }
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  switch (max) {
    case r:
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      break;
    case g:
      h = ((b - r) / d + 2) / 6;
      break;
    case b:
    default:
      h = ((r - g) / d + 4) / 6;
      break;
  }
  return [
    Math.round(h * 360),
    Math.round(s * 100),
    Math.round(l * 100)
  ];
}
function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(h / 60 % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (h >= 300 && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  const toHex = (n) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}
function getRelativeLuminance(rgb) {
  const [r, g, b] = rgb.map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function calculateContrast(fg, bg) {
  const fgRgb = hexToRgb(fg);
  const bgRgb = hexToRgb(bg);
  const l1 = getRelativeLuminance(fgRgb);
  const l2 = getRelativeLuminance(bgRgb);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
function formatContrastRatio(ratio) {
  return `${ratio.toFixed(1)}:1`;
}
function getContrastingText(bgHex) {
  const rgb = hexToRgb(bgHex);
  const luminance = getRelativeLuminance(rgb);
  return luminance > 0.179 ? "#000000" : "#FFFFFF";
}

// ../skills/bespoke_design_system/scripts/utils/svg-manipulator.ts
function loadSVG(filePath) {
  const absolutePath = resolve(filePath);
  return readFileSync(absolutePath, "utf-8");
}
function saveSVG(content, filePath) {
  const absolutePath = resolve(filePath);
  writeFileSync(absolutePath, content, "utf-8");
}
function deriveChromes(background, secondary) {
  const [, , bL] = hexToHsl(background);
  const [sH, sS] = hexToHsl(secondary);
  const tintH = sH;
  const tintS = Math.min(sS, 15);
  if (bL < 50) {
    return {
      chrome: hslToHex(tintH, tintS, Math.min(bL + 14, 30)),
      chromeSubtle: hslToHex(tintH, tintS, Math.min(bL + 7, 22))
    };
  } else {
    return {
      chrome: hslToHex(tintH, tintS, Math.max(bL - 12, 75)),
      chromeSubtle: hslToHex(tintH, tintS, Math.max(bL - 5, 85))
    };
  }
}
var NICHE_TEMPLATE_MAP = {
  dashboard: "dashboard",
  saas: "dashboard",
  fintech: "dashboard",
  industrial: "dashboard",
  ecommerce: "storefront",
  marketing: "storefront",
  blog: "content",
  portfolio: "content",
  medical: "content"
};
function generatePalettePreviewSVG(colors, niche2) {
  const template = NICHE_TEMPLATE_MAP[niche2 || ""] || "dashboard";
  switch (template) {
    case "storefront":
      return generateStorefrontSVG(colors);
    case "content":
      return generateContentSVG(colors);
    default:
      return generateDashboardSVG(colors);
  }
}
function generateDashboardSVG(colors) {
  const { chrome, chromeSubtle } = deriveChromes(colors.background, colors.secondary);
  const ctaText = getContrastingText(colors.cta);
  const chromeText = getContrastingText(chrome);
  const W = 800, H = 500, sb = 56, hdr = 44, p = 20, r = 8;
  const cx = sb + p;
  const cy = hdr + p;
  const cw = W - sb - p * 2;
  const halfW = Math.round((cw - p) / 2);
  const halfX = cx + halfW + p;
  const chartL = cx + 20;
  const chartR = cx + 300;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${colors.background}" rx="12"/>

  <!-- Sidebar -->
  <rect x="0" y="0" width="${sb}" height="${H}" fill="${chrome}" rx="12"/>
  <rect x="12" y="0" width="${sb - 12}" height="${H}" fill="${chrome}"/>
  <circle cx="${sb / 2}" cy="28" r="8" fill="${colors.primary}" opacity="0.9"/>
  <circle cx="${sb / 2}" cy="68" r="5" fill="${chromeText}" opacity="0.18"/>
  <circle cx="${sb / 2}" cy="96" r="5" fill="${chromeText}" opacity="0.18"/>

  <!-- Header -->
  <rect x="${sb}" y="0" width="${W - sb}" height="${hdr}" fill="${chromeSubtle}"/>
  <rect x="${cx}" y="12" width="48" height="20" rx="4" fill="${colors.primary}" opacity="0.85"/>
  <rect x="${cx + 68}" y="16" width="36" height="12" rx="3" fill="${colors.text}" opacity="0.12"/>
  <circle cx="${W - p - 14}" cy="${hdr / 2}" r="12" fill="${colors.border}"/>

  <!-- Stat card 1 -->
  <rect x="${cx}" y="${cy}" width="${halfW}" height="100" rx="${r}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${cx + 16}" y="${cy + 16}" width="60" height="10" rx="3" fill="${colors.text}" opacity="0.2"/>
  <rect x="${cx + 16}" y="${cy + 38}" width="100" height="18" rx="4" fill="${colors.primary}"/>
  <rect x="${cx + 16}" y="${cy + 70}" width="${halfW - 32}" height="14" rx="3" fill="${colors.secondary}" opacity="0.18"/>

  <!-- Stat card 2 -->
  <rect x="${halfX}" y="${cy}" width="${halfW}" height="100" rx="${r}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${halfX + 16}" y="${cy + 16}" width="50" height="10" rx="3" fill="${colors.text}" opacity="0.2"/>
  <rect x="${halfX + 16}" y="${cy + 38}" width="80" height="18" rx="4" fill="${colors.primary}"/>
  <rect x="${halfX + 16}" y="${cy + 70}" width="${halfW - 32}" height="14" rx="3" fill="${colors.secondary}" opacity="0.18"/>

  <!-- Main content card -->
  <rect x="${cx}" y="${cy + 120}" width="${cw}" height="180" rx="${r}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${cx + 20}" y="${cy + 140}" width="120" height="12" rx="3" fill="${colors.text}" opacity="0.25"/>
  <!-- Chart: grid lines match bar area width -->
  <line x1="${chartL}" y1="${cy + 180}" x2="${chartR}" y2="${cy + 180}" stroke="${colors.border}" stroke-width="0.5" opacity="0.4"/>
  <line x1="${chartL}" y1="${cy + 215}" x2="${chartR}" y2="${cy + 215}" stroke="${colors.border}" stroke-width="0.5" opacity="0.4"/>
  <line x1="${chartL}" y1="${cy + 250}" x2="${chartR}" y2="${cy + 250}" stroke="${colors.border}" stroke-width="0.5" opacity="0.4"/>
  <!-- Chart bars -->
  <rect x="${chartL + 10}" y="${cy + 200}" width="28" height="75" rx="3" fill="${colors.primary}" opacity="0.15"/>
  <rect x="${chartL + 50}" y="${cy + 183}" width="28" height="92" rx="3" fill="${colors.primary}" opacity="0.25"/>
  <rect x="${chartL + 90}" y="${cy + 210}" width="28" height="65" rx="3" fill="${colors.primary}" opacity="0.2"/>
  <rect x="${chartL + 130}" y="${cy + 175}" width="28" height="100" rx="3" fill="${colors.primary}" opacity="0.35"/>
  <rect x="${chartL + 170}" y="${cy + 195}" width="28" height="80" rx="3" fill="${colors.primary}" opacity="0.2"/>

  <!-- CTA button -->
  <rect x="${cx + cw - 120}" y="${cy + 136}" width="100" height="32" rx="6" fill="${colors.cta}"/>
  <rect x="${cx + cw - 100}" y="${cy + 148}" width="60" height="8" rx="2" fill="${ctaText}" opacity="0.9"/>

  <!-- Bottom card -->
  <rect x="${cx}" y="${cy + 318}" width="${cw}" height="76" rx="${r}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${cx + 16}" y="${cy + 334}" width="80" height="10" rx="3" fill="${colors.text}" opacity="0.2"/>
  <rect x="${cx + 16}" y="${cy + 356}" width="${cw - 32}" height="8" rx="2" fill="${colors.text}" opacity="0.08"/>
</svg>`;
}
function generateStorefrontSVG(colors) {
  const { chrome, chromeSubtle } = deriveChromes(colors.background, colors.secondary);
  const ctaText = getContrastingText(colors.cta);
  const chromeText = getContrastingText(chrome);
  const W = 800, H = 500, nav = 48, p = 20, r = 8;
  const cx = p;
  const cw = W - p * 2;
  const heroY = nav + p;
  const heroH = 140;
  const gridY = heroY + heroH + p;
  const cardW = Math.round((cw - p * 2) / 3);
  const cardH = 200;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${colors.background}" rx="12"/>

  <!-- Top nav -->
  <rect x="0" y="0" width="${W}" height="${nav}" fill="${chrome}" rx="12"/>
  <rect x="0" y="12" width="${W}" height="${nav - 12}" fill="${chrome}"/>
  <circle cx="${p + 14}" cy="${nav / 2}" r="10" fill="${colors.primary}" opacity="0.9"/>
  <rect x="${p + 36}" y="${Math.round(nav / 2) - 6}" width="40" height="12" rx="3" fill="${chromeText}" opacity="0.15"/>
  <rect x="${p + 86}" y="${Math.round(nav / 2) - 6}" width="32" height="12" rx="3" fill="${chromeText}" opacity="0.1"/>
  <rect x="${p + 128}" y="${Math.round(nav / 2) - 6}" width="36" height="12" rx="3" fill="${chromeText}" opacity="0.1"/>
  <circle cx="${W - p - 14}" cy="${nav / 2}" r="12" fill="${colors.border}"/>

  <!-- Hero banner -->
  <rect x="${cx}" y="${heroY}" width="${cw}" height="${heroH}" rx="${r}" fill="${chromeSubtle}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${cx + 32}" y="${heroY + 28}" width="200" height="16" rx="4" fill="${colors.text}" opacity="0.2"/>
  <rect x="${cx + 32}" y="${heroY + 56}" width="300" height="10" rx="3" fill="${colors.text}" opacity="0.1"/>
  <rect x="${cx + 32}" y="${heroY + 76}" width="260" height="10" rx="3" fill="${colors.text}" opacity="0.08"/>
  <!-- CTA button in hero -->
  <rect x="${cx + 32}" y="${heroY + 100}" width="110" height="28" rx="6" fill="${colors.cta}"/>
  <rect x="${cx + 52}" y="${heroY + 110}" width="70" height="8" rx="2" fill="${ctaText}" opacity="0.9"/>

  <!-- Product card 1 -->
  <rect x="${cx}" y="${gridY}" width="${cardW}" height="${cardH}" rx="${r}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${cx + 12}" y="${gridY + 12}" width="${cardW - 24}" height="${Math.round(cardH * 0.5)}" rx="4" fill="${colors.secondary}" opacity="0.12"/>
  <rect x="${cx + 12}" y="${gridY + Math.round(cardH * 0.5) + 24}" width="${cardW - 60}" height="10" rx="3" fill="${colors.text}" opacity="0.2"/>
  <rect x="${cx + 12}" y="${gridY + Math.round(cardH * 0.5) + 44}" width="50" height="12" rx="3" fill="${colors.primary}" opacity="0.8"/>

  <!-- Product card 2 -->
  <rect x="${cx + cardW + p}" y="${gridY}" width="${cardW}" height="${cardH}" rx="${r}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${cx + cardW + p + 12}" y="${gridY + 12}" width="${cardW - 24}" height="${Math.round(cardH * 0.5)}" rx="4" fill="${colors.secondary}" opacity="0.12"/>
  <rect x="${cx + cardW + p + 12}" y="${gridY + Math.round(cardH * 0.5) + 24}" width="${cardW - 60}" height="10" rx="3" fill="${colors.text}" opacity="0.2"/>
  <rect x="${cx + cardW + p + 12}" y="${gridY + Math.round(cardH * 0.5) + 44}" width="50" height="12" rx="3" fill="${colors.primary}" opacity="0.8"/>

  <!-- Product card 3 -->
  <rect x="${cx + (cardW + p) * 2}" y="${gridY}" width="${cardW}" height="${cardH}" rx="${r}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${cx + (cardW + p) * 2 + 12}" y="${gridY + 12}" width="${cardW - 24}" height="${Math.round(cardH * 0.5)}" rx="4" fill="${colors.secondary}" opacity="0.12"/>
  <rect x="${cx + (cardW + p) * 2 + 12}" y="${gridY + Math.round(cardH * 0.5) + 24}" width="${cardW - 60}" height="10" rx="3" fill="${colors.text}" opacity="0.2"/>
  <rect x="${cx + (cardW + p) * 2 + 12}" y="${gridY + Math.round(cardH * 0.5) + 44}" width="50" height="12" rx="3" fill="${colors.primary}" opacity="0.8"/>
</svg>`;
}
function generateContentSVG(colors) {
  const { chrome, chromeSubtle } = deriveChromes(colors.background, colors.secondary);
  const ctaText = getContrastingText(colors.cta);
  const chromeText = getContrastingText(chrome);
  const W = 800, H = 500, nav = 48, p = 20, r = 8;
  const cx = p;
  const cw = W - p * 2;
  const featY = nav + p;
  const featH = 120;
  const contentY = featY + featH + p;
  const mainW = Math.round(cw * 0.62);
  const sideW = cw - mainW - p;
  const sideX = cx + mainW + p;
  const contentH = H - contentY - p;
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${W}" height="${H}" fill="${colors.background}" rx="12"/>

  <!-- Top nav -->
  <rect x="0" y="0" width="${W}" height="${nav}" fill="${chrome}" rx="12"/>
  <rect x="0" y="12" width="${W}" height="${nav - 12}" fill="${chrome}"/>
  <circle cx="${p + 14}" cy="${nav / 2}" r="10" fill="${colors.primary}" opacity="0.9"/>
  <rect x="${p + 36}" y="${Math.round(nav / 2) - 6}" width="40" height="12" rx="3" fill="${chromeText}" opacity="0.15"/>
  <rect x="${p + 86}" y="${Math.round(nav / 2) - 6}" width="32" height="12" rx="3" fill="${chromeText}" opacity="0.1"/>
  <rect x="${p + 128}" y="${Math.round(nav / 2) - 6}" width="36" height="12" rx="3" fill="${chromeText}" opacity="0.1"/>
  <circle cx="${W - p - 14}" cy="${nav / 2}" r="12" fill="${colors.border}"/>

  <!-- Feature / hero area -->
  <rect x="${cx}" y="${featY}" width="${cw}" height="${featH}" rx="${r}" fill="${chromeSubtle}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${cx + 32}" y="${featY + 24}" width="240" height="16" rx="4" fill="${colors.text}" opacity="0.2"/>
  <rect x="${cx + 32}" y="${featY + 52}" width="360" height="10" rx="3" fill="${colors.text}" opacity="0.1"/>
  <rect x="${cx + 32}" y="${featY + 72}" width="300" height="10" rx="3" fill="${colors.text}" opacity="0.08"/>
  <!-- CTA in feature area -->
  <rect x="${cx + cw - 152}" y="${featY + 44}" width="120" height="30" rx="6" fill="${colors.cta}"/>
  <rect x="${cx + cw - 132}" y="${featY + 55}" width="80" height="8" rx="2" fill="${ctaText}" opacity="0.9"/>

  <!-- Main content column -->
  <rect x="${cx}" y="${contentY}" width="${mainW}" height="${contentH}" rx="${r}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${cx + 20}" y="${contentY + 20}" width="180" height="14" rx="3" fill="${colors.text}" opacity="0.22"/>
  <rect x="${cx + 20}" y="${contentY + 48}" width="${mainW - 40}" height="8" rx="2" fill="${colors.text}" opacity="0.08"/>
  <rect x="${cx + 20}" y="${contentY + 64}" width="${mainW - 60}" height="8" rx="2" fill="${colors.text}" opacity="0.08"/>
  <rect x="${cx + 20}" y="${contentY + 80}" width="${mainW - 50}" height="8" rx="2" fill="${colors.text}" opacity="0.06"/>
  <rect x="${cx + 20}" y="${contentY + 108}" width="140" height="12" rx="3" fill="${colors.text}" opacity="0.18"/>
  <rect x="${cx + 20}" y="${contentY + 132}" width="${mainW - 40}" height="8" rx="2" fill="${colors.text}" opacity="0.08"/>
  <rect x="${cx + 20}" y="${contentY + 148}" width="${mainW - 70}" height="8" rx="2" fill="${colors.text}" opacity="0.06"/>
  <rect x="${cx + 20}" y="${contentY + 176}" width="120" height="12" rx="3" fill="${colors.primary}" opacity="0.7"/>

  <!-- Sidebar -->
  <rect x="${sideX}" y="${contentY}" width="${sideW}" height="${contentH}" rx="${r}" fill="${colors.background}" stroke="${colors.border}" stroke-width="1"/>
  <rect x="${sideX + 16}" y="${contentY + 20}" width="${sideW - 32}" height="10" rx="3" fill="${colors.text}" opacity="0.2"/>
  <rect x="${sideX + 16}" y="${contentY + 44}" width="${sideW - 32}" height="8" rx="2" fill="${colors.text}" opacity="0.08"/>
  <rect x="${sideX + 16}" y="${contentY + 60}" width="${sideW - 48}" height="8" rx="2" fill="${colors.text}" opacity="0.06"/>
  <rect x="${sideX + 16}" y="${contentY + 88}" width="${sideW - 32}" height="8" rx="2" fill="${colors.text}" opacity="0.08"/>
  <rect x="${sideX + 16}" y="${contentY + 104}" width="${sideW - 48}" height="8" rx="2" fill="${colors.text}" opacity="0.06"/>
</svg>`;
}

// ../skills/bespoke_design_system/node_modules/csv-parse/lib/api/CsvError.js
var CsvError = class _CsvError extends Error {
  constructor(code, message, options, ...contexts) {
    if (Array.isArray(message)) message = message.join(" ").trim();
    super(message);
    if (Error.captureStackTrace !== void 0) {
      Error.captureStackTrace(this, _CsvError);
    }
    this.code = code;
    for (const context of contexts) {
      for (const key in context) {
        const value = context[key];
        this[key] = Buffer.isBuffer(value) ? value.toString(options.encoding) : value == null ? value : JSON.parse(JSON.stringify(value));
      }
    }
  }
};

// ../skills/bespoke_design_system/node_modules/csv-parse/lib/utils/is_object.js
var is_object = function(obj) {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
};

// ../skills/bespoke_design_system/node_modules/csv-parse/lib/api/normalize_columns_array.js
var normalize_columns_array = function(columns) {
  const normalizedColumns = [];
  for (let i = 0, l = columns.length; i < l; i++) {
    const column = columns[i];
    if (column === void 0 || column === null || column === false) {
      normalizedColumns[i] = { disabled: true };
    } else if (typeof column === "string") {
      normalizedColumns[i] = { name: column };
    } else if (is_object(column)) {
      if (typeof column.name !== "string") {
        throw new CsvError("CSV_OPTION_COLUMNS_MISSING_NAME", [
          "Option columns missing name:",
          `property "name" is required at position ${i}`,
          "when column is an object literal"
        ]);
      }
      normalizedColumns[i] = column;
    } else {
      throw new CsvError("CSV_INVALID_COLUMN_DEFINITION", [
        "Invalid column definition:",
        "expect a string or a literal object,",
        `got ${JSON.stringify(column)} at position ${i}`
      ]);
    }
  }
  return normalizedColumns;
};

// ../skills/bespoke_design_system/node_modules/csv-parse/lib/utils/ResizeableBuffer.js
var ResizeableBuffer = class {
  constructor(size = 100) {
    this.size = size;
    this.length = 0;
    this.buf = Buffer.allocUnsafe(size);
  }
  prepend(val) {
    if (Buffer.isBuffer(val)) {
      const length = this.length + val.length;
      if (length >= this.size) {
        this.resize();
        if (length >= this.size) {
          throw Error("INVALID_BUFFER_STATE");
        }
      }
      const buf = this.buf;
      this.buf = Buffer.allocUnsafe(this.size);
      val.copy(this.buf, 0);
      buf.copy(this.buf, val.length);
      this.length += val.length;
    } else {
      const length = this.length++;
      if (length === this.size) {
        this.resize();
      }
      const buf = this.clone();
      this.buf[0] = val;
      buf.copy(this.buf, 1, 0, length);
    }
  }
  append(val) {
    const length = this.length++;
    if (length === this.size) {
      this.resize();
    }
    this.buf[length] = val;
  }
  clone() {
    return Buffer.from(this.buf.slice(0, this.length));
  }
  resize() {
    const length = this.length;
    this.size = this.size * 2;
    const buf = Buffer.allocUnsafe(this.size);
    this.buf.copy(buf, 0, 0, length);
    this.buf = buf;
  }
  toString(encoding) {
    if (encoding) {
      return this.buf.slice(0, this.length).toString(encoding);
    } else {
      return Uint8Array.prototype.slice.call(this.buf.slice(0, this.length));
    }
  }
  toJSON() {
    return this.toString("utf8");
  }
  reset() {
    this.length = 0;
  }
};
var ResizeableBuffer_default = ResizeableBuffer;

// ../skills/bespoke_design_system/node_modules/csv-parse/lib/api/init_state.js
var np = 12;
var cr = 13;
var nl = 10;
var space = 32;
var tab = 9;
var init_state = function(options) {
  return {
    bomSkipped: false,
    bufBytesStart: 0,
    castField: options.cast_function,
    commenting: false,
    // Current error encountered by a record
    error: void 0,
    enabled: options.from_line === 1,
    escaping: false,
    escapeIsQuote: Buffer.isBuffer(options.escape) && Buffer.isBuffer(options.quote) && Buffer.compare(options.escape, options.quote) === 0,
    // columns can be `false`, `true`, `Array`
    expectedRecordLength: Array.isArray(options.columns) ? options.columns.length : void 0,
    field: new ResizeableBuffer_default(20),
    firstLineToHeaders: options.cast_first_line_to_header,
    needMoreDataSize: Math.max(
      // Skip if the remaining buffer smaller than comment
      options.comment !== null ? options.comment.length : 0,
      ...options.delimiter.map((delimiter) => delimiter.length),
      // Skip if the remaining buffer can be escape sequence
      options.quote !== null ? options.quote.length : 0
    ),
    previousBuf: void 0,
    quoting: false,
    stop: false,
    rawBuffer: new ResizeableBuffer_default(100),
    record: [],
    recordHasError: false,
    record_length: 0,
    recordDelimiterMaxLength: options.record_delimiter.length === 0 ? 0 : Math.max(...options.record_delimiter.map((v) => v.length)),
    trimChars: [
      Buffer.from(" ", options.encoding)[0],
      Buffer.from("	", options.encoding)[0]
    ],
    wasQuoting: false,
    wasRowDelimiter: false,
    timchars: [
      Buffer.from(Buffer.from([cr], "utf8").toString(), options.encoding),
      Buffer.from(Buffer.from([nl], "utf8").toString(), options.encoding),
      Buffer.from(Buffer.from([np], "utf8").toString(), options.encoding),
      Buffer.from(Buffer.from([space], "utf8").toString(), options.encoding),
      Buffer.from(Buffer.from([tab], "utf8").toString(), options.encoding)
    ]
  };
};

// ../skills/bespoke_design_system/node_modules/csv-parse/lib/utils/underscore.js
var underscore = function(str) {
  return str.replace(/([A-Z])/g, function(_, match) {
    return "_" + match.toLowerCase();
  });
};

// ../skills/bespoke_design_system/node_modules/csv-parse/lib/api/normalize_options.js
var normalize_options = function(opts) {
  const options = {};
  for (const opt in opts) {
    options[underscore(opt)] = opts[opt];
  }
  if (options.encoding === void 0 || options.encoding === true) {
    options.encoding = "utf8";
  } else if (options.encoding === null || options.encoding === false) {
    options.encoding = null;
  } else if (typeof options.encoding !== "string" && options.encoding !== null) {
    throw new CsvError(
      "CSV_INVALID_OPTION_ENCODING",
      [
        "Invalid option encoding:",
        "encoding must be a string or null to return a buffer,",
        `got ${JSON.stringify(options.encoding)}`
      ],
      options
    );
  }
  if (options.bom === void 0 || options.bom === null || options.bom === false) {
    options.bom = false;
  } else if (options.bom !== true) {
    throw new CsvError(
      "CSV_INVALID_OPTION_BOM",
      [
        "Invalid option bom:",
        "bom must be true,",
        `got ${JSON.stringify(options.bom)}`
      ],
      options
    );
  }
  options.cast_function = null;
  if (options.cast === void 0 || options.cast === null || options.cast === false || options.cast === "") {
    options.cast = void 0;
  } else if (typeof options.cast === "function") {
    options.cast_function = options.cast;
    options.cast = true;
  } else if (options.cast !== true) {
    throw new CsvError(
      "CSV_INVALID_OPTION_CAST",
      [
        "Invalid option cast:",
        "cast must be true or a function,",
        `got ${JSON.stringify(options.cast)}`
      ],
      options
    );
  }
  if (options.cast_date === void 0 || options.cast_date === null || options.cast_date === false || options.cast_date === "") {
    options.cast_date = false;
  } else if (options.cast_date === true) {
    options.cast_date = function(value) {
      const date = Date.parse(value);
      return !isNaN(date) ? new Date(date) : value;
    };
  } else if (typeof options.cast_date !== "function") {
    throw new CsvError(
      "CSV_INVALID_OPTION_CAST_DATE",
      [
        "Invalid option cast_date:",
        "cast_date must be true or a function,",
        `got ${JSON.stringify(options.cast_date)}`
      ],
      options
    );
  }
  options.cast_first_line_to_header = null;
  if (options.columns === true) {
    options.cast_first_line_to_header = void 0;
  } else if (typeof options.columns === "function") {
    options.cast_first_line_to_header = options.columns;
    options.columns = true;
  } else if (Array.isArray(options.columns)) {
    options.columns = normalize_columns_array(options.columns);
  } else if (options.columns === void 0 || options.columns === null || options.columns === false) {
    options.columns = false;
  } else {
    throw new CsvError(
      "CSV_INVALID_OPTION_COLUMNS",
      [
        "Invalid option columns:",
        "expect an array, a function or true,",
        `got ${JSON.stringify(options.columns)}`
      ],
      options
    );
  }
  if (options.group_columns_by_name === void 0 || options.group_columns_by_name === null || options.group_columns_by_name === false) {
    options.group_columns_by_name = false;
  } else if (options.group_columns_by_name !== true) {
    throw new CsvError(
      "CSV_INVALID_OPTION_GROUP_COLUMNS_BY_NAME",
      [
        "Invalid option group_columns_by_name:",
        "expect an boolean,",
        `got ${JSON.stringify(options.group_columns_by_name)}`
      ],
      options
    );
  } else if (options.columns === false) {
    throw new CsvError(
      "CSV_INVALID_OPTION_GROUP_COLUMNS_BY_NAME",
      [
        "Invalid option group_columns_by_name:",
        "the `columns` mode must be activated."
      ],
      options
    );
  }
  if (options.comment === void 0 || options.comment === null || options.comment === false || options.comment === "") {
    options.comment = null;
  } else {
    if (typeof options.comment === "string") {
      options.comment = Buffer.from(options.comment, options.encoding);
    }
    if (!Buffer.isBuffer(options.comment)) {
      throw new CsvError(
        "CSV_INVALID_OPTION_COMMENT",
        [
          "Invalid option comment:",
          "comment must be a buffer or a string,",
          `got ${JSON.stringify(options.comment)}`
        ],
        options
      );
    }
  }
  if (options.comment_no_infix === void 0 || options.comment_no_infix === null || options.comment_no_infix === false) {
    options.comment_no_infix = false;
  } else if (options.comment_no_infix !== true) {
    throw new CsvError(
      "CSV_INVALID_OPTION_COMMENT",
      [
        "Invalid option comment_no_infix:",
        "value must be a boolean,",
        `got ${JSON.stringify(options.comment_no_infix)}`
      ],
      options
    );
  }
  const delimiter_json = JSON.stringify(options.delimiter);
  if (!Array.isArray(options.delimiter))
    options.delimiter = [options.delimiter];
  if (options.delimiter.length === 0) {
    throw new CsvError(
      "CSV_INVALID_OPTION_DELIMITER",
      [
        "Invalid option delimiter:",
        "delimiter must be a non empty string or buffer or array of string|buffer,",
        `got ${delimiter_json}`
      ],
      options
    );
  }
  options.delimiter = options.delimiter.map(function(delimiter) {
    if (delimiter === void 0 || delimiter === null || delimiter === false) {
      return Buffer.from(",", options.encoding);
    }
    if (typeof delimiter === "string") {
      delimiter = Buffer.from(delimiter, options.encoding);
    }
    if (!Buffer.isBuffer(delimiter) || delimiter.length === 0) {
      throw new CsvError(
        "CSV_INVALID_OPTION_DELIMITER",
        [
          "Invalid option delimiter:",
          "delimiter must be a non empty string or buffer or array of string|buffer,",
          `got ${delimiter_json}`
        ],
        options
      );
    }
    return delimiter;
  });
  if (options.escape === void 0 || options.escape === true) {
    options.escape = Buffer.from('"', options.encoding);
  } else if (typeof options.escape === "string") {
    options.escape = Buffer.from(options.escape, options.encoding);
  } else if (options.escape === null || options.escape === false) {
    options.escape = null;
  }
  if (options.escape !== null) {
    if (!Buffer.isBuffer(options.escape)) {
      throw new Error(
        `Invalid Option: escape must be a buffer, a string or a boolean, got ${JSON.stringify(options.escape)}`
      );
    }
  }
  if (options.from === void 0 || options.from === null) {
    options.from = 1;
  } else {
    if (typeof options.from === "string" && /\d+/.test(options.from)) {
      options.from = parseInt(options.from);
    }
    if (Number.isInteger(options.from)) {
      if (options.from < 0) {
        throw new Error(
          `Invalid Option: from must be a positive integer, got ${JSON.stringify(opts.from)}`
        );
      }
    } else {
      throw new Error(
        `Invalid Option: from must be an integer, got ${JSON.stringify(options.from)}`
      );
    }
  }
  if (options.from_line === void 0 || options.from_line === null) {
    options.from_line = 1;
  } else {
    if (typeof options.from_line === "string" && /\d+/.test(options.from_line)) {
      options.from_line = parseInt(options.from_line);
    }
    if (Number.isInteger(options.from_line)) {
      if (options.from_line <= 0) {
        throw new Error(
          `Invalid Option: from_line must be a positive integer greater than 0, got ${JSON.stringify(opts.from_line)}`
        );
      }
    } else {
      throw new Error(
        `Invalid Option: from_line must be an integer, got ${JSON.stringify(opts.from_line)}`
      );
    }
  }
  if (options.ignore_last_delimiters === void 0 || options.ignore_last_delimiters === null) {
    options.ignore_last_delimiters = false;
  } else if (typeof options.ignore_last_delimiters === "number") {
    options.ignore_last_delimiters = Math.floor(options.ignore_last_delimiters);
    if (options.ignore_last_delimiters === 0) {
      options.ignore_last_delimiters = false;
    }
  } else if (typeof options.ignore_last_delimiters !== "boolean") {
    throw new CsvError(
      "CSV_INVALID_OPTION_IGNORE_LAST_DELIMITERS",
      [
        "Invalid option `ignore_last_delimiters`:",
        "the value must be a boolean value or an integer,",
        `got ${JSON.stringify(options.ignore_last_delimiters)}`
      ],
      options
    );
  }
  if (options.ignore_last_delimiters === true && options.columns === false) {
    throw new CsvError(
      "CSV_IGNORE_LAST_DELIMITERS_REQUIRES_COLUMNS",
      [
        "The option `ignore_last_delimiters`",
        "requires the activation of the `columns` option"
      ],
      options
    );
  }
  if (options.info === void 0 || options.info === null || options.info === false) {
    options.info = false;
  } else if (options.info !== true) {
    throw new Error(
      `Invalid Option: info must be true, got ${JSON.stringify(options.info)}`
    );
  }
  if (options.max_record_size === void 0 || options.max_record_size === null || options.max_record_size === false) {
    options.max_record_size = 0;
  } else if (Number.isInteger(options.max_record_size) && options.max_record_size >= 0) {
  } else if (typeof options.max_record_size === "string" && /\d+/.test(options.max_record_size)) {
    options.max_record_size = parseInt(options.max_record_size);
  } else {
    throw new Error(
      `Invalid Option: max_record_size must be a positive integer, got ${JSON.stringify(options.max_record_size)}`
    );
  }
  if (options.objname === void 0 || options.objname === null || options.objname === false) {
    options.objname = void 0;
  } else if (Buffer.isBuffer(options.objname)) {
    if (options.objname.length === 0) {
      throw new Error(`Invalid Option: objname must be a non empty buffer`);
    }
    if (options.encoding === null) {
    } else {
      options.objname = options.objname.toString(options.encoding);
    }
  } else if (typeof options.objname === "string") {
    if (options.objname.length === 0) {
      throw new Error(`Invalid Option: objname must be a non empty string`);
    }
  } else if (typeof options.objname === "number") {
  } else {
    throw new Error(
      `Invalid Option: objname must be a string or a buffer, got ${options.objname}`
    );
  }
  if (options.objname !== void 0) {
    if (typeof options.objname === "number") {
      if (options.columns !== false) {
        throw Error(
          "Invalid Option: objname index cannot be combined with columns or be defined as a field"
        );
      }
    } else {
      if (options.columns === false) {
        throw Error(
          "Invalid Option: objname field must be combined with columns or be defined as an index"
        );
      }
    }
  }
  if (options.on_record === void 0 || options.on_record === null) {
    options.on_record = void 0;
  } else if (typeof options.on_record !== "function") {
    throw new CsvError(
      "CSV_INVALID_OPTION_ON_RECORD",
      [
        "Invalid option `on_record`:",
        "expect a function,",
        `got ${JSON.stringify(options.on_record)}`
      ],
      options
    );
  }
  if (options.on_skip !== void 0 && options.on_skip !== null && typeof options.on_skip !== "function") {
    throw new Error(
      `Invalid Option: on_skip must be a function, got ${JSON.stringify(options.on_skip)}`
    );
  }
  if (options.quote === null || options.quote === false || options.quote === "") {
    options.quote = null;
  } else {
    if (options.quote === void 0 || options.quote === true) {
      options.quote = Buffer.from('"', options.encoding);
    } else if (typeof options.quote === "string") {
      options.quote = Buffer.from(options.quote, options.encoding);
    }
    if (!Buffer.isBuffer(options.quote)) {
      throw new Error(
        `Invalid Option: quote must be a buffer or a string, got ${JSON.stringify(options.quote)}`
      );
    }
  }
  if (options.raw === void 0 || options.raw === null || options.raw === false) {
    options.raw = false;
  } else if (options.raw !== true) {
    throw new Error(
      `Invalid Option: raw must be true, got ${JSON.stringify(options.raw)}`
    );
  }
  if (options.record_delimiter === void 0) {
    options.record_delimiter = [];
  } else if (typeof options.record_delimiter === "string" || Buffer.isBuffer(options.record_delimiter)) {
    if (options.record_delimiter.length === 0) {
      throw new CsvError(
        "CSV_INVALID_OPTION_RECORD_DELIMITER",
        [
          "Invalid option `record_delimiter`:",
          "value must be a non empty string or buffer,",
          `got ${JSON.stringify(options.record_delimiter)}`
        ],
        options
      );
    }
    options.record_delimiter = [options.record_delimiter];
  } else if (!Array.isArray(options.record_delimiter)) {
    throw new CsvError(
      "CSV_INVALID_OPTION_RECORD_DELIMITER",
      [
        "Invalid option `record_delimiter`:",
        "value must be a string, a buffer or array of string|buffer,",
        `got ${JSON.stringify(options.record_delimiter)}`
      ],
      options
    );
  }
  options.record_delimiter = options.record_delimiter.map(function(rd, i) {
    if (typeof rd !== "string" && !Buffer.isBuffer(rd)) {
      throw new CsvError(
        "CSV_INVALID_OPTION_RECORD_DELIMITER",
        [
          "Invalid option `record_delimiter`:",
          "value must be a string, a buffer or array of string|buffer",
          `at index ${i},`,
          `got ${JSON.stringify(rd)}`
        ],
        options
      );
    } else if (rd.length === 0) {
      throw new CsvError(
        "CSV_INVALID_OPTION_RECORD_DELIMITER",
        [
          "Invalid option `record_delimiter`:",
          "value must be a non empty string or buffer",
          `at index ${i},`,
          `got ${JSON.stringify(rd)}`
        ],
        options
      );
    }
    if (typeof rd === "string") {
      rd = Buffer.from(rd, options.encoding);
    }
    return rd;
  });
  if (typeof options.relax_column_count === "boolean") {
  } else if (options.relax_column_count === void 0 || options.relax_column_count === null) {
    options.relax_column_count = false;
  } else {
    throw new Error(
      `Invalid Option: relax_column_count must be a boolean, got ${JSON.stringify(options.relax_column_count)}`
    );
  }
  if (typeof options.relax_column_count_less === "boolean") {
  } else if (options.relax_column_count_less === void 0 || options.relax_column_count_less === null) {
    options.relax_column_count_less = false;
  } else {
    throw new Error(
      `Invalid Option: relax_column_count_less must be a boolean, got ${JSON.stringify(options.relax_column_count_less)}`
    );
  }
  if (typeof options.relax_column_count_more === "boolean") {
  } else if (options.relax_column_count_more === void 0 || options.relax_column_count_more === null) {
    options.relax_column_count_more = false;
  } else {
    throw new Error(
      `Invalid Option: relax_column_count_more must be a boolean, got ${JSON.stringify(options.relax_column_count_more)}`
    );
  }
  if (typeof options.relax_quotes === "boolean") {
  } else if (options.relax_quotes === void 0 || options.relax_quotes === null) {
    options.relax_quotes = false;
  } else {
    throw new Error(
      `Invalid Option: relax_quotes must be a boolean, got ${JSON.stringify(options.relax_quotes)}`
    );
  }
  if (typeof options.skip_empty_lines === "boolean") {
  } else if (options.skip_empty_lines === void 0 || options.skip_empty_lines === null) {
    options.skip_empty_lines = false;
  } else {
    throw new Error(
      `Invalid Option: skip_empty_lines must be a boolean, got ${JSON.stringify(options.skip_empty_lines)}`
    );
  }
  if (typeof options.skip_records_with_empty_values === "boolean") {
  } else if (options.skip_records_with_empty_values === void 0 || options.skip_records_with_empty_values === null) {
    options.skip_records_with_empty_values = false;
  } else {
    throw new Error(
      `Invalid Option: skip_records_with_empty_values must be a boolean, got ${JSON.stringify(options.skip_records_with_empty_values)}`
    );
  }
  if (typeof options.skip_records_with_error === "boolean") {
  } else if (options.skip_records_with_error === void 0 || options.skip_records_with_error === null) {
    options.skip_records_with_error = false;
  } else {
    throw new Error(
      `Invalid Option: skip_records_with_error must be a boolean, got ${JSON.stringify(options.skip_records_with_error)}`
    );
  }
  if (options.rtrim === void 0 || options.rtrim === null || options.rtrim === false) {
    options.rtrim = false;
  } else if (options.rtrim !== true) {
    throw new Error(
      `Invalid Option: rtrim must be a boolean, got ${JSON.stringify(options.rtrim)}`
    );
  }
  if (options.ltrim === void 0 || options.ltrim === null || options.ltrim === false) {
    options.ltrim = false;
  } else if (options.ltrim !== true) {
    throw new Error(
      `Invalid Option: ltrim must be a boolean, got ${JSON.stringify(options.ltrim)}`
    );
  }
  if (options.trim === void 0 || options.trim === null || options.trim === false) {
    options.trim = false;
  } else if (options.trim !== true) {
    throw new Error(
      `Invalid Option: trim must be a boolean, got ${JSON.stringify(options.trim)}`
    );
  }
  if (options.trim === true && opts.ltrim !== false) {
    options.ltrim = true;
  } else if (options.ltrim !== true) {
    options.ltrim = false;
  }
  if (options.trim === true && opts.rtrim !== false) {
    options.rtrim = true;
  } else if (options.rtrim !== true) {
    options.rtrim = false;
  }
  if (options.to === void 0 || options.to === null) {
    options.to = -1;
  } else {
    if (typeof options.to === "string" && /\d+/.test(options.to)) {
      options.to = parseInt(options.to);
    }
    if (Number.isInteger(options.to)) {
      if (options.to <= 0) {
        throw new Error(
          `Invalid Option: to must be a positive integer greater than 0, got ${JSON.stringify(opts.to)}`
        );
      }
    } else {
      throw new Error(
        `Invalid Option: to must be an integer, got ${JSON.stringify(opts.to)}`
      );
    }
  }
  if (options.to_line === void 0 || options.to_line === null) {
    options.to_line = -1;
  } else {
    if (typeof options.to_line === "string" && /\d+/.test(options.to_line)) {
      options.to_line = parseInt(options.to_line);
    }
    if (Number.isInteger(options.to_line)) {
      if (options.to_line <= 0) {
        throw new Error(
          `Invalid Option: to_line must be a positive integer greater than 0, got ${JSON.stringify(opts.to_line)}`
        );
      }
    } else {
      throw new Error(
        `Invalid Option: to_line must be an integer, got ${JSON.stringify(opts.to_line)}`
      );
    }
  }
  return options;
};

// ../skills/bespoke_design_system/node_modules/csv-parse/lib/api/index.js
var isRecordEmpty = function(record) {
  return record.every(
    (field) => field == null || field.toString && field.toString().trim() === ""
  );
};
var cr2 = 13;
var nl2 = 10;
var boms = {
  // Note, the following are equals:
  // Buffer.from("\ufeff")
  // Buffer.from([239, 187, 191])
  // Buffer.from('EFBBBF', 'hex')
  utf8: Buffer.from([239, 187, 191]),
  // Note, the following are equals:
  // Buffer.from "\ufeff", 'utf16le
  // Buffer.from([255, 254])
  utf16le: Buffer.from([255, 254])
};
var transform = function(original_options = {}) {
  const info = {
    bytes: 0,
    comment_lines: 0,
    empty_lines: 0,
    invalid_field_length: 0,
    lines: 1,
    records: 0
  };
  const options = normalize_options(original_options);
  return {
    info,
    original_options,
    options,
    state: init_state(options),
    __needMoreData: function(i, bufLen, end) {
      if (end) return false;
      const { encoding, escape, quote } = this.options;
      const { quoting, needMoreDataSize, recordDelimiterMaxLength } = this.state;
      const numOfCharLeft = bufLen - i - 1;
      const requiredLength = Math.max(
        needMoreDataSize,
        // Skip if the remaining buffer smaller than record delimiter
        // If "record_delimiter" is yet to be discovered:
        // 1. It is equals to `[]` and "recordDelimiterMaxLength" equals `0`
        // 2. We set the length to windows line ending in the current encoding
        // Note, that encoding is known from user or bom discovery at that point
        // recordDelimiterMaxLength,
        recordDelimiterMaxLength === 0 ? Buffer.from("\r\n", encoding).length : recordDelimiterMaxLength,
        // Skip if remaining buffer can be an escaped quote
        quoting ? (escape === null ? 0 : escape.length) + quote.length : 0,
        // Skip if remaining buffer can be record delimiter following the closing quote
        quoting ? quote.length + recordDelimiterMaxLength : 0
      );
      return numOfCharLeft < requiredLength;
    },
    // Central parser implementation
    parse: function(nextBuf, end, push, close) {
      const {
        bom,
        comment_no_infix,
        encoding,
        from_line,
        ltrim,
        max_record_size,
        raw,
        relax_quotes,
        rtrim,
        skip_empty_lines,
        to,
        to_line
      } = this.options;
      let { comment, escape, quote, record_delimiter } = this.options;
      const { bomSkipped, previousBuf, rawBuffer, escapeIsQuote } = this.state;
      let buf;
      if (previousBuf === void 0) {
        if (nextBuf === void 0) {
          close();
          return;
        } else {
          buf = nextBuf;
        }
      } else if (previousBuf !== void 0 && nextBuf === void 0) {
        buf = previousBuf;
      } else {
        buf = Buffer.concat([previousBuf, nextBuf]);
      }
      if (bomSkipped === false) {
        if (bom === false) {
          this.state.bomSkipped = true;
        } else if (buf.length < 3) {
          if (end === false) {
            this.state.previousBuf = buf;
            return;
          }
        } else {
          for (const encoding2 in boms) {
            if (boms[encoding2].compare(buf, 0, boms[encoding2].length) === 0) {
              const bomLength = boms[encoding2].length;
              this.state.bufBytesStart += bomLength;
              buf = buf.slice(bomLength);
              this.options = normalize_options({
                ...this.original_options,
                encoding: encoding2
              });
              ({ comment, escape, quote } = this.options);
              break;
            }
          }
          this.state.bomSkipped = true;
        }
      }
      const bufLen = buf.length;
      let pos;
      for (pos = 0; pos < bufLen; pos++) {
        if (this.__needMoreData(pos, bufLen, end)) {
          break;
        }
        if (this.state.wasRowDelimiter === true) {
          this.info.lines++;
          this.state.wasRowDelimiter = false;
        }
        if (to_line !== -1 && this.info.lines > to_line) {
          this.state.stop = true;
          close();
          return;
        }
        if (this.state.quoting === false && record_delimiter.length === 0) {
          const record_delimiterCount = this.__autoDiscoverRecordDelimiter(
            buf,
            pos
          );
          if (record_delimiterCount) {
            record_delimiter = this.options.record_delimiter;
          }
        }
        const chr = buf[pos];
        if (raw === true) {
          rawBuffer.append(chr);
        }
        if ((chr === cr2 || chr === nl2) && this.state.wasRowDelimiter === false) {
          this.state.wasRowDelimiter = true;
        }
        if (this.state.escaping === true) {
          this.state.escaping = false;
        } else {
          if (escape !== null && this.state.quoting === true && this.__isEscape(buf, pos, chr) && pos + escape.length < bufLen) {
            if (escapeIsQuote) {
              if (this.__isQuote(buf, pos + escape.length)) {
                this.state.escaping = true;
                pos += escape.length - 1;
                continue;
              }
            } else {
              this.state.escaping = true;
              pos += escape.length - 1;
              continue;
            }
          }
          if (this.state.commenting === false && this.__isQuote(buf, pos)) {
            if (this.state.quoting === true) {
              const nextChr = buf[pos + quote.length];
              const isNextChrTrimable = rtrim && this.__isCharTrimable(buf, pos + quote.length);
              const isNextChrComment = comment !== null && this.__compareBytes(comment, buf, pos + quote.length, nextChr);
              const isNextChrDelimiter = this.__isDelimiter(
                buf,
                pos + quote.length,
                nextChr
              );
              const isNextChrRecordDelimiter = record_delimiter.length === 0 ? this.__autoDiscoverRecordDelimiter(buf, pos + quote.length) : this.__isRecordDelimiter(nextChr, buf, pos + quote.length);
              if (escape !== null && this.__isEscape(buf, pos, chr) && this.__isQuote(buf, pos + escape.length)) {
                pos += escape.length - 1;
              } else if (!nextChr || isNextChrDelimiter || isNextChrRecordDelimiter || isNextChrComment || isNextChrTrimable) {
                this.state.quoting = false;
                this.state.wasQuoting = true;
                pos += quote.length - 1;
                continue;
              } else if (relax_quotes === false) {
                const err = this.__error(
                  new CsvError(
                    "CSV_INVALID_CLOSING_QUOTE",
                    [
                      "Invalid Closing Quote:",
                      `got "${String.fromCharCode(nextChr)}"`,
                      `at line ${this.info.lines}`,
                      "instead of delimiter, record delimiter, trimable character",
                      "(if activated) or comment"
                    ],
                    this.options,
                    this.__infoField()
                  )
                );
                if (err !== void 0) return err;
              } else {
                this.state.quoting = false;
                this.state.wasQuoting = true;
                this.state.field.prepend(quote);
                pos += quote.length - 1;
              }
            } else {
              if (this.state.field.length !== 0) {
                if (relax_quotes === false) {
                  const info2 = this.__infoField();
                  const bom2 = Object.keys(boms).map(
                    (b) => boms[b].equals(this.state.field.toString()) ? b : false
                  ).filter(Boolean)[0];
                  const err = this.__error(
                    new CsvError(
                      "INVALID_OPENING_QUOTE",
                      [
                        "Invalid Opening Quote:",
                        `a quote is found on field ${JSON.stringify(info2.column)} at line ${info2.lines}, value is ${JSON.stringify(this.state.field.toString(encoding))}`,
                        bom2 ? `(${bom2} bom)` : void 0
                      ],
                      this.options,
                      info2,
                      {
                        field: this.state.field
                      }
                    )
                  );
                  if (err !== void 0) return err;
                }
              } else {
                this.state.quoting = true;
                pos += quote.length - 1;
                continue;
              }
            }
          }
          if (this.state.quoting === false) {
            const recordDelimiterLength = this.__isRecordDelimiter(
              chr,
              buf,
              pos
            );
            if (recordDelimiterLength !== 0) {
              const skipCommentLine = this.state.commenting && this.state.wasQuoting === false && this.state.record.length === 0 && this.state.field.length === 0;
              if (skipCommentLine) {
                this.info.comment_lines++;
              } else {
                if (this.state.enabled === false && this.info.lines + (this.state.wasRowDelimiter === true ? 1 : 0) >= from_line) {
                  this.state.enabled = true;
                  this.__resetField();
                  this.__resetRecord();
                  pos += recordDelimiterLength - 1;
                  continue;
                }
                if (skip_empty_lines === true && this.state.wasQuoting === false && this.state.record.length === 0 && this.state.field.length === 0) {
                  this.info.empty_lines++;
                  pos += recordDelimiterLength - 1;
                  continue;
                }
                this.info.bytes = this.state.bufBytesStart + pos;
                const errField = this.__onField();
                if (errField !== void 0) return errField;
                this.info.bytes = this.state.bufBytesStart + pos + recordDelimiterLength;
                const errRecord = this.__onRecord(push);
                if (errRecord !== void 0) return errRecord;
                if (to !== -1 && this.info.records >= to) {
                  this.state.stop = true;
                  close();
                  return;
                }
              }
              this.state.commenting = false;
              pos += recordDelimiterLength - 1;
              continue;
            }
            if (this.state.commenting) {
              continue;
            }
            if (comment !== null && (comment_no_infix === false || this.state.record.length === 0 && this.state.field.length === 0)) {
              const commentCount = this.__compareBytes(comment, buf, pos, chr);
              if (commentCount !== 0) {
                this.state.commenting = true;
                continue;
              }
            }
            const delimiterLength = this.__isDelimiter(buf, pos, chr);
            if (delimiterLength !== 0) {
              this.info.bytes = this.state.bufBytesStart + pos;
              const errField = this.__onField();
              if (errField !== void 0) return errField;
              pos += delimiterLength - 1;
              continue;
            }
          }
        }
        if (this.state.commenting === false) {
          if (max_record_size !== 0 && this.state.record_length + this.state.field.length > max_record_size) {
            return this.__error(
              new CsvError(
                "CSV_MAX_RECORD_SIZE",
                [
                  "Max Record Size:",
                  "record exceed the maximum number of tolerated bytes",
                  `of ${max_record_size}`,
                  `at line ${this.info.lines}`
                ],
                this.options,
                this.__infoField()
              )
            );
          }
        }
        const lappend = ltrim === false || this.state.quoting === true || this.state.field.length !== 0 || !this.__isCharTrimable(buf, pos);
        const rappend = rtrim === false || this.state.wasQuoting === false;
        if (lappend === true && rappend === true) {
          this.state.field.append(chr);
        } else if (rtrim === true && !this.__isCharTrimable(buf, pos)) {
          return this.__error(
            new CsvError(
              "CSV_NON_TRIMABLE_CHAR_AFTER_CLOSING_QUOTE",
              [
                "Invalid Closing Quote:",
                "found non trimable byte after quote",
                `at line ${this.info.lines}`
              ],
              this.options,
              this.__infoField()
            )
          );
        } else {
          if (lappend === false) {
            pos += this.__isCharTrimable(buf, pos) - 1;
          }
          continue;
        }
      }
      if (end === true) {
        if (this.state.quoting === true) {
          const err = this.__error(
            new CsvError(
              "CSV_QUOTE_NOT_CLOSED",
              [
                "Quote Not Closed:",
                `the parsing is finished with an opening quote at line ${this.info.lines}`
              ],
              this.options,
              this.__infoField()
            )
          );
          if (err !== void 0) return err;
        } else {
          if (this.state.wasQuoting === true || this.state.record.length !== 0 || this.state.field.length !== 0) {
            this.info.bytes = this.state.bufBytesStart + pos;
            const errField = this.__onField();
            if (errField !== void 0) return errField;
            const errRecord = this.__onRecord(push);
            if (errRecord !== void 0) return errRecord;
          } else if (this.state.wasRowDelimiter === true) {
            this.info.empty_lines++;
          } else if (this.state.commenting === true) {
            this.info.comment_lines++;
          }
        }
      } else {
        this.state.bufBytesStart += pos;
        this.state.previousBuf = buf.slice(pos);
      }
      if (this.state.wasRowDelimiter === true) {
        this.info.lines++;
        this.state.wasRowDelimiter = false;
      }
    },
    __onRecord: function(push) {
      const {
        columns,
        group_columns_by_name,
        encoding,
        info: info2,
        from,
        relax_column_count,
        relax_column_count_less,
        relax_column_count_more,
        raw,
        skip_records_with_empty_values
      } = this.options;
      const { enabled, record } = this.state;
      if (enabled === false) {
        return this.__resetRecord();
      }
      const recordLength = record.length;
      if (columns === true) {
        if (skip_records_with_empty_values === true && isRecordEmpty(record)) {
          this.__resetRecord();
          return;
        }
        return this.__firstLineToColumns(record);
      }
      if (columns === false && this.info.records === 0) {
        this.state.expectedRecordLength = recordLength;
      }
      if (recordLength !== this.state.expectedRecordLength) {
        const err = columns === false ? new CsvError(
          "CSV_RECORD_INCONSISTENT_FIELDS_LENGTH",
          [
            "Invalid Record Length:",
            `expect ${this.state.expectedRecordLength},`,
            `got ${recordLength} on line ${this.info.lines}`
          ],
          this.options,
          this.__infoField(),
          {
            record
          }
        ) : new CsvError(
          "CSV_RECORD_INCONSISTENT_COLUMNS",
          [
            "Invalid Record Length:",
            `columns length is ${columns.length},`,
            // rename columns
            `got ${recordLength} on line ${this.info.lines}`
          ],
          this.options,
          this.__infoField(),
          {
            record
          }
        );
        if (relax_column_count === true || relax_column_count_less === true && recordLength < this.state.expectedRecordLength || relax_column_count_more === true && recordLength > this.state.expectedRecordLength) {
          this.info.invalid_field_length++;
          this.state.error = err;
        } else {
          const finalErr = this.__error(err);
          if (finalErr) return finalErr;
        }
      }
      if (skip_records_with_empty_values === true && isRecordEmpty(record)) {
        this.__resetRecord();
        return;
      }
      if (this.state.recordHasError === true) {
        this.__resetRecord();
        this.state.recordHasError = false;
        return;
      }
      this.info.records++;
      if (from === 1 || this.info.records >= from) {
        const { objname } = this.options;
        if (columns !== false) {
          const obj = {};
          for (let i = 0, l = record.length; i < l; i++) {
            if (columns[i] === void 0 || columns[i].disabled) continue;
            if (group_columns_by_name === true && obj[columns[i].name] !== void 0) {
              if (Array.isArray(obj[columns[i].name])) {
                obj[columns[i].name] = obj[columns[i].name].concat(record[i]);
              } else {
                obj[columns[i].name] = [obj[columns[i].name], record[i]];
              }
            } else {
              obj[columns[i].name] = record[i];
            }
          }
          if (raw === true || info2 === true) {
            const extRecord = Object.assign(
              { record: obj },
              raw === true ? { raw: this.state.rawBuffer.toString(encoding) } : {},
              info2 === true ? { info: this.__infoRecord() } : {}
            );
            const err = this.__push(
              objname === void 0 ? extRecord : [obj[objname], extRecord],
              push
            );
            if (err) {
              return err;
            }
          } else {
            const err = this.__push(
              objname === void 0 ? obj : [obj[objname], obj],
              push
            );
            if (err) {
              return err;
            }
          }
        } else {
          if (raw === true || info2 === true) {
            const extRecord = Object.assign(
              { record },
              raw === true ? { raw: this.state.rawBuffer.toString(encoding) } : {},
              info2 === true ? { info: this.__infoRecord() } : {}
            );
            const err = this.__push(
              objname === void 0 ? extRecord : [record[objname], extRecord],
              push
            );
            if (err) {
              return err;
            }
          } else {
            const err = this.__push(
              objname === void 0 ? record : [record[objname], record],
              push
            );
            if (err) {
              return err;
            }
          }
        }
      }
      this.__resetRecord();
    },
    __firstLineToColumns: function(record) {
      const { firstLineToHeaders } = this.state;
      try {
        const headers = firstLineToHeaders === void 0 ? record : firstLineToHeaders.call(null, record);
        if (!Array.isArray(headers)) {
          return this.__error(
            new CsvError(
              "CSV_INVALID_COLUMN_MAPPING",
              [
                "Invalid Column Mapping:",
                "expect an array from column function,",
                `got ${JSON.stringify(headers)}`
              ],
              this.options,
              this.__infoField(),
              {
                headers
              }
            )
          );
        }
        const normalizedHeaders = normalize_columns_array(headers);
        this.state.expectedRecordLength = normalizedHeaders.length;
        this.options.columns = normalizedHeaders;
        this.__resetRecord();
        return;
      } catch (err) {
        return err;
      }
    },
    __resetRecord: function() {
      if (this.options.raw === true) {
        this.state.rawBuffer.reset();
      }
      this.state.error = void 0;
      this.state.record = [];
      this.state.record_length = 0;
    },
    __onField: function() {
      const { cast, encoding, rtrim, max_record_size } = this.options;
      const { enabled, wasQuoting } = this.state;
      if (enabled === false) {
        return this.__resetField();
      }
      let field = this.state.field.toString(encoding);
      if (rtrim === true && wasQuoting === false) {
        field = field.trimRight();
      }
      if (cast === true) {
        const [err, f] = this.__cast(field);
        if (err !== void 0) return err;
        field = f;
      }
      this.state.record.push(field);
      if (max_record_size !== 0 && typeof field === "string") {
        this.state.record_length += field.length;
      }
      this.__resetField();
    },
    __resetField: function() {
      this.state.field.reset();
      this.state.wasQuoting = false;
    },
    __push: function(record, push) {
      const { on_record } = this.options;
      if (on_record !== void 0) {
        const info2 = this.__infoRecord();
        try {
          record = on_record.call(null, record, info2);
        } catch (err) {
          return err;
        }
        if (record === void 0 || record === null) {
          return;
        }
      }
      push(record);
    },
    // Return a tuple with the error and the casted value
    __cast: function(field) {
      const { columns, relax_column_count } = this.options;
      const isColumns = Array.isArray(columns);
      if (isColumns === true && relax_column_count && this.options.columns.length <= this.state.record.length) {
        return [void 0, void 0];
      }
      if (this.state.castField !== null) {
        try {
          const info2 = this.__infoField();
          return [void 0, this.state.castField.call(null, field, info2)];
        } catch (err) {
          return [err];
        }
      }
      if (this.__isFloat(field)) {
        return [void 0, parseFloat(field)];
      } else if (this.options.cast_date !== false) {
        const info2 = this.__infoField();
        return [void 0, this.options.cast_date.call(null, field, info2)];
      }
      return [void 0, field];
    },
    // Helper to test if a character is a space or a line delimiter
    __isCharTrimable: function(buf, pos) {
      const isTrim = (buf2, pos2) => {
        const { timchars } = this.state;
        loop1: for (let i = 0; i < timchars.length; i++) {
          const timchar = timchars[i];
          for (let j = 0; j < timchar.length; j++) {
            if (timchar[j] !== buf2[pos2 + j]) continue loop1;
          }
          return timchar.length;
        }
        return 0;
      };
      return isTrim(buf, pos);
    },
    // Keep it in case we implement the `cast_int` option
    // __isInt(value){
    //   // return Number.isInteger(parseInt(value))
    //   // return !isNaN( parseInt( obj ) );
    //   return /^(\-|\+)?[1-9][0-9]*$/.test(value)
    // }
    __isFloat: function(value) {
      return value - parseFloat(value) + 1 >= 0;
    },
    __compareBytes: function(sourceBuf, targetBuf, targetPos, firstByte) {
      if (sourceBuf[0] !== firstByte) return 0;
      const sourceLength = sourceBuf.length;
      for (let i = 1; i < sourceLength; i++) {
        if (sourceBuf[i] !== targetBuf[targetPos + i]) return 0;
      }
      return sourceLength;
    },
    __isDelimiter: function(buf, pos, chr) {
      const { delimiter, ignore_last_delimiters } = this.options;
      if (ignore_last_delimiters === true && this.state.record.length === this.options.columns.length - 1) {
        return 0;
      } else if (ignore_last_delimiters !== false && typeof ignore_last_delimiters === "number" && this.state.record.length === ignore_last_delimiters - 1) {
        return 0;
      }
      loop1: for (let i = 0; i < delimiter.length; i++) {
        const del = delimiter[i];
        if (del[0] === chr) {
          for (let j = 1; j < del.length; j++) {
            if (del[j] !== buf[pos + j]) continue loop1;
          }
          return del.length;
        }
      }
      return 0;
    },
    __isRecordDelimiter: function(chr, buf, pos) {
      const { record_delimiter } = this.options;
      const recordDelimiterLength = record_delimiter.length;
      loop1: for (let i = 0; i < recordDelimiterLength; i++) {
        const rd = record_delimiter[i];
        const rdLength = rd.length;
        if (rd[0] !== chr) {
          continue;
        }
        for (let j = 1; j < rdLength; j++) {
          if (rd[j] !== buf[pos + j]) {
            continue loop1;
          }
        }
        return rd.length;
      }
      return 0;
    },
    __isEscape: function(buf, pos, chr) {
      const { escape } = this.options;
      if (escape === null) return false;
      const l = escape.length;
      if (escape[0] === chr) {
        for (let i = 0; i < l; i++) {
          if (escape[i] !== buf[pos + i]) {
            return false;
          }
        }
        return true;
      }
      return false;
    },
    __isQuote: function(buf, pos) {
      const { quote } = this.options;
      if (quote === null) return false;
      const l = quote.length;
      for (let i = 0; i < l; i++) {
        if (quote[i] !== buf[pos + i]) {
          return false;
        }
      }
      return true;
    },
    __autoDiscoverRecordDelimiter: function(buf, pos) {
      const { encoding } = this.options;
      const rds = [
        // Important, the windows line ending must be before mac os 9
        Buffer.from("\r\n", encoding),
        Buffer.from("\n", encoding),
        Buffer.from("\r", encoding)
      ];
      loop: for (let i = 0; i < rds.length; i++) {
        const l = rds[i].length;
        for (let j = 0; j < l; j++) {
          if (rds[i][j] !== buf[pos + j]) {
            continue loop;
          }
        }
        this.options.record_delimiter.push(rds[i]);
        this.state.recordDelimiterMaxLength = rds[i].length;
        return rds[i].length;
      }
      return 0;
    },
    __error: function(msg) {
      const { encoding, raw, skip_records_with_error } = this.options;
      const err = typeof msg === "string" ? new Error(msg) : msg;
      if (skip_records_with_error) {
        this.state.recordHasError = true;
        if (this.options.on_skip !== void 0) {
          this.options.on_skip(
            err,
            raw ? this.state.rawBuffer.toString(encoding) : void 0
          );
        }
        return void 0;
      } else {
        return err;
      }
    },
    __infoDataSet: function() {
      return {
        ...this.info,
        columns: this.options.columns
      };
    },
    __infoRecord: function() {
      const { columns, raw, encoding } = this.options;
      return {
        ...this.__infoDataSet(),
        error: this.state.error,
        header: columns === true,
        index: this.state.record.length,
        raw: raw ? this.state.rawBuffer.toString(encoding) : void 0
      };
    },
    __infoField: function() {
      const { columns } = this.options;
      const isColumns = Array.isArray(columns);
      return {
        ...this.__infoRecord(),
        column: isColumns === true ? columns.length > this.state.record.length ? columns[this.state.record.length].name : null : this.state.record.length,
        quoting: this.state.wasQuoting
      };
    }
  };
};

// ../skills/bespoke_design_system/node_modules/csv-parse/lib/sync.js
var parse = function(data, opts = {}) {
  if (typeof data === "string") {
    data = Buffer.from(data);
  }
  const records = opts && opts.objname ? {} : [];
  const parser = transform(opts);
  const push = (record) => {
    if (parser.options.objname === void 0) records.push(record);
    else {
      records[record[0]] = record[1];
    }
  };
  const close = () => {
  };
  const err1 = parser.parse(data, false, push, close);
  if (err1 !== void 0) throw err1;
  const err2 = parser.parse(void 0, true, push, close);
  if (err2 !== void 0) throw err2;
  return records;
};

// ../skills/bespoke_design_system/scripts/utils/csv-loader.ts
import { readFileSync as readFileSync2 } from "fs";
import { resolve as resolve2 } from "path";
var DEFAULT_OPTIONS = {
  hasHeader: true,
  delimiter: ",",
  multiValueSeparator: ";",
  multiValueColumns: ["niche_id", "application_types"]
};
function parseMultiValue(value, separator) {
  if (!value || value.trim() === "") {
    return [];
  }
  return value.split(separator).map((v) => v.trim()).filter((v) => v.length > 0);
}
function loadCSV(filePath, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const absolutePath = resolve2(filePath);
  const content = readFileSync2(absolutePath, "utf-8");
  const records = parse(content, {
    delimiter: opts.delimiter,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true
  });
  if (records.length === 0) {
    return createEmptyCSVData();
  }
  const headers = opts.hasHeader ? records[0] : records[0].map((_, i) => `column_${i}`);
  const dataRows = opts.hasHeader ? records.slice(1) : records;
  const rows = dataRows.map((rawRow) => {
    const parsed = {};
    headers.forEach((header, index) => {
      const value = rawRow[index] || "";
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
function createEmptyCSVData() {
  return createCSVData([], []);
}
function createCSVData(headers, rows) {
  return {
    headers,
    rows,
    getColumn(name) {
      return rows.map((row) => row.parsed[name]);
    },
    filterBy(column, value) {
      return rows.filter((row) => {
        const colValue = row.parsed[column];
        if (Array.isArray(colValue)) {
          return colValue.includes(value);
        }
        return colValue === value;
      });
    },
    filterByMulti(column, value) {
      return rows.filter((row) => {
        const colValue = row.parsed[column];
        if (Array.isArray(colValue)) {
          return colValue.includes(value);
        }
        return colValue === value;
      });
    },
    toObjects() {
      return rows.map((row) => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row.raw[index] || "";
        });
        return obj;
      });
    }
  };
}
function rowContains(row, column, value) {
  const colValue = row.parsed[column];
  if (Array.isArray(colValue)) {
    return colValue.includes(value);
  }
  return colValue === value;
}

// ../skills/bespoke_design_system/scripts/utils/filter-colors.ts
var RELATED_NICHES = {
  medical: ["saas"],
  fintech: ["dashboard"],
  dashboard: ["saas", "fintech"],
  saas: ["dashboard"],
  ecommerce: ["marketing"],
  marketing: ["portfolio"],
  portfolio: ["marketing", "blog"],
  blog: ["portfolio"],
  industrial: ["dashboard"],
  education: ["saas"],
  realestate: ["marketing"],
  social: ["saas"],
  food: ["ecommerce"],
  travel: ["marketing"],
  nonprofit: ["medical"]
};
function csvRowToColorPalette(row, index) {
  const raw = row.raw;
  return {
    id: `palette-${String(index + 1).padStart(3, "0")}`,
    product_type: raw[3] || "",
    primary: raw[4] || "",
    secondary: raw[5] || "",
    cta: raw[6] || "",
    background: raw[7] || "",
    text: raw[8] || "",
    border: raw[9] || "",
    notes: raw[10] || ""
  };
}
function getPrimaryHue(hex) {
  try {
    const [h, s] = hexToHsl(hex);
    if (s < 5) return -1;
    return h;
  } catch {
    return -1;
  }
}
function selectDiverse(palettes, count2) {
  if (palettes.length <= count2) return palettes;
  const HUE_BUCKET_SIZE = 30;
  const buckets = /* @__PURE__ */ new Map();
  for (const palette of palettes) {
    const hue = getPrimaryHue(palette.primary);
    const bucket = hue < 0 ? -1 : Math.floor(hue / HUE_BUCKET_SIZE);
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket).push(palette);
  }
  const selected = [];
  const bucketKeys = [...buckets.keys()].sort((a, b) => a - b);
  const perBucket = Math.ceil(count2 / bucketKeys.length);
  for (const key of bucketKeys) {
    const bucketPalettes = buckets.get(key);
    selected.push(...bucketPalettes.slice(0, perBucket));
    if (selected.length >= count2) break;
  }
  if (selected.length < count2) {
    const remaining = palettes.filter((p) => !selected.includes(p));
    selected.push(...remaining.slice(0, count2 - selected.length));
  }
  return selected.slice(0, count2);
}
function filterColors(niche2, applicationType2, count2) {
  const csv = loadCSV("data/colors.csv");
  if (applicationType2) {
    const exact = csv.rows.filter(
      (row) => rowContains(row, "niche_id", niche2) && rowContains(row, "application_types", applicationType2)
    );
    if (exact.length >= count2) {
      const palettes2 = exact.map((r, i) => csvRowToColorPalette(r, i));
      return {
        palettes: selectDiverse(palettes2, count2),
        total_matches: exact.length,
        filter_strategy: "exact_match"
      };
    }
  }
  const nicheMatches = csv.rows.filter((row) => rowContains(row, "niche_id", niche2));
  if (nicheMatches.length >= count2) {
    const palettes2 = nicheMatches.map((r, i) => csvRowToColorPalette(r, i));
    return {
      palettes: selectDiverse(palettes2, count2),
      total_matches: nicheMatches.length,
      filter_strategy: "niche_only"
    };
  }
  const related = RELATED_NICHES[niche2] || [];
  const allNiches = [niche2, ...related];
  const expanded = csv.rows.filter(
    (row) => allNiches.some((n) => rowContains(row, "niche_id", n))
  );
  if (expanded.length >= count2) {
    const palettes2 = expanded.map((r, i) => csvRowToColorPalette(r, i));
    return {
      palettes: selectDiverse(palettes2, count2),
      total_matches: expanded.length,
      filter_strategy: "expanded"
    };
  }
  const all = csv.rows;
  const palettes = all.map((r, i) => csvRowToColorPalette(r, i));
  return {
    palettes: selectDiverse(palettes, Math.min(count2, palettes.length)),
    total_matches: all.length,
    filter_strategy: "fallback"
  };
}

// ../skills/bespoke_design_system/scripts/utils/state-manager.ts
import { readFileSync as readFileSync3, writeFileSync as writeFileSync2, existsSync, mkdirSync, renameSync } from "fs";
import { dirname, resolve as resolve3 } from "path";
var STATE_FILE = ".design-pipeline/state.json";
var PIPELINE_VERSION = "1.0";
function createInitialState() {
  return {
    pipeline_version: PIPELINE_VERSION,
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    current_stage: "understand_problem",
    completed_stages: [],
    inferred_niche: null,
    application_type: null,
    niche_confidence: null,
    available_layouts: null,
    selected_layouts: null,
    available_typography: null,
    selected_typography: null,
    combinations: null,
    selected_combination: null,
    available_palettes: null,
    selected_palette: null,
    final_combination: null,
    generated_tokens: null,
    pipeline_complete: false
  };
}
function ensureStateDirectory() {
  const dir = dirname(STATE_FILE);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}
function readState() {
  const statePath = resolve3(STATE_FILE);
  if (!existsSync(statePath)) {
    return createInitialState();
  }
  try {
    const content = readFileSync3(statePath, "utf-8");
    const state2 = JSON.parse(content);
    if (state2.pipeline_version !== PIPELINE_VERSION) {
      console.warn(`State file version mismatch: ${state2.pipeline_version} vs ${PIPELINE_VERSION}`);
    }
    return state2;
  } catch (error) {
    console.error("Failed to read state file:", error);
    return createInitialState();
  }
}
function writeState(state2) {
  ensureStateDirectory();
  const statePath = resolve3(STATE_FILE);
  const tempPath = `${statePath}.tmp`;
  state2.timestamp = (/* @__PURE__ */ new Date()).toISOString();
  writeFileSync2(tempPath, JSON.stringify(state2, null, 2), "utf-8");
  renameSync(tempPath, statePath);
}
function completeStage(currentStage, nextStage, stageOutputs = {}) {
  const state2 = readState();
  if (!state2.completed_stages.includes(currentStage)) {
    state2.completed_stages.push(currentStage);
  }
  const newState = {
    ...state2,
    ...stageOutputs,
    current_stage: nextStage,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  writeState(newState);
  return newState;
}

// ../skills/bespoke_design_system/scripts/generate-palette-combinations.ts
function parseArgs() {
  const args = process.argv.slice(2);
  let combination2 = "";
  let niche2 = "";
  let count2 = 5;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--combination" && args[i + 1]) {
      combination2 = args[i + 1];
      i++;
    } else if (args[i] === "--niche" && args[i + 1]) {
      niche2 = args[i + 1];
      i++;
    } else if (args[i] === "--count" && args[i + 1]) {
      count2 = parseInt(args[i + 1]);
      i++;
    }
  }
  if (!combination2 || !niche2) {
    console.error(JSON.stringify({ error: true, code: "INVALID_PARAMS", message: "Required: --combination combo-05 --niche dashboard" }));
    process.exit(1);
  }
  return { combination: combination2, niche: niche2, count: count2 };
}
function computeContrast(palette) {
  const textOnBgRatio = calculateContrast(palette.text, palette.background);
  const autoOnPrimaryColor = getContrastingText(palette.primary);
  const autoOnPrimaryRatio = calculateContrast(autoOnPrimaryColor, palette.primary);
  const autoOnCtaColor = getContrastingText(palette.cta);
  const autoOnCtaRatio = calculateContrast(autoOnCtaColor, palette.cta);
  const textOnBg = {
    ratio: formatContrastRatio(textOnBgRatio),
    rawRatio: textOnBgRatio,
    aa: textOnBgRatio >= 4.5,
    aaa: textOnBgRatio >= 7
  };
  const autoOnPrimary = {
    ratio: formatContrastRatio(autoOnPrimaryRatio),
    rawRatio: autoOnPrimaryRatio,
    aa: autoOnPrimaryRatio >= 4.5,
    aaa: autoOnPrimaryRatio >= 7,
    autoColor: autoOnPrimaryColor
  };
  const autoOnCta = {
    ratio: formatContrastRatio(autoOnCtaRatio),
    rawRatio: autoOnCtaRatio,
    aa: autoOnCtaRatio >= 3,
    // UI components need 3:1 minimum
    aaa: autoOnCtaRatio >= 4.5,
    autoColor: autoOnCtaColor
  };
  let wcagLevel = "FAIL";
  if (textOnBg.aaa && autoOnPrimary.aaa && autoOnCta.aaa) wcagLevel = "AAA";
  else if (textOnBg.aa && autoOnPrimary.aa && autoOnCta.aa) wcagLevel = "AA";
  else if (textOnBgRatio >= 3 && autoOnPrimaryRatio >= 3) wcagLevel = "A";
  return { textOnBg, autoOnPrimary, autoOnCta, wcagLevel };
}
function generatePreviewHTML(previews2, comboId, context) {
  const cards = previews2.map((p, idx) => {
    const pal = p.palette;
    const swatches = [
      { label: "Primary", color: pal.primary },
      { label: "Secondary", color: pal.secondary },
      { label: "CTA", color: pal.cta },
      { label: "Background", color: pal.background },
      { label: "Text", color: pal.text },
      { label: "Border", color: pal.border }
    ].map((s) => `
            <div class="swatch" title="${s.label}: ${s.color}">
              <div class="swatch-circle" style="background: ${s.color}; color: ${getContrastingText(s.color)};">${s.label[0]}</div>
              <span class="swatch-hex">${s.color}</span>
            </div>`).join("");
    const wcagBadgeClass = p.wcagLevel === "AAA" ? "badge-aaa" : p.wcagLevel === "AA" ? "badge-aa" : p.wcagLevel === "A" ? "badge-a" : "badge-fail";
    const contrastRows = [
      { label: `Body text on background`, fg: pal.text, bg: pal.background, ...p.contrast.textOnBg },
      { label: `Label on primary`, fg: p.contrast.autoOnPrimary.autoColor, bg: pal.primary, ...p.contrast.autoOnPrimary },
      { label: `Label on CTA`, fg: p.contrast.autoOnCta.autoColor, bg: pal.cta, ...p.contrast.autoOnCta }
    ].map((c) => `
              <div class="contrast-row">
                <span class="contrast-label">${c.label}</span>
                <span class="contrast-specimen" style="background:${c.bg}; color:${c.fg};" title="Foreground ${c.fg} on ${c.bg}">Aa</span>
                <span class="contrast-ratio">${c.ratio}</span>
                <span class="contrast-badge ${c.aa ? "pass" : "fail"}">${c.aaa ? "AAA" : c.aa ? "AA" : "FAIL"}</span>
              </div>`).join("");
    return `
        <div class="card" data-id="${p.id}" onclick="selectPalette(this)">
          <div class="card-header">
            <span class="badge">${idx + 1}</span>
            <span class="card-header-title">${pal.product_type || p.paletteId}</span>
            <span class="check-mark">&#10003;</span>
          </div>
          <div class="svg-container">
            <img src="${p.svgFile}" alt="${pal.product_type || "Palette"} color preview" />
          </div>
          <div class="swatches">${swatches}</div>
          <div class="contrast-info">
            <div class="wcag-badge ${wcagBadgeClass}">WCAG ${p.wcagLevel}</div>
            ${contrastRows}
          </div>
          ${pal.notes ? `<div class="card-footer"><span class="palette-notes">${pal.notes}</span></div>` : ""}
        </div>`;
  }).join("\n");
  const confidencePct = context.confidence ? `${Math.round(context.confidence * 100)}%` : "";
  const appTypeLabel = context.appType ? context.appType.replace(/-/g, " ") : "";
  const nicheLabel = context.niche.charAt(0).toUpperCase() + context.niche.slice(1);
  const contextLine = appTypeLabel ? `${nicheLabel} / ${appTypeLabel.charAt(0).toUpperCase() + appTypeLabel.slice(1)}${confidencePct ? ` (${confidencePct} confidence)` : ""}` : `${nicheLabel}${confidencePct ? ` (${confidencePct} confidence)` : ""}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Palette Selection \u2014 ${comboId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; color: #1e293b; padding: 2rem; }
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    .niche-context {
      display: inline-flex; align-items: center; gap: 0.5rem;
      background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px;
      padding: 0.35rem 0.75rem; font-size: 0.8rem; color: #1e40af; margin-bottom: 0.5rem;
    }
    .niche-context strong { font-weight: 700; }
    .subtitle { color: #475569; font-size: 0.875rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.25rem; margin-bottom: 2rem; }
    .card {
      background: white; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden;
      cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s;
    }
    .card:hover { border-color: #94a3b8; }
    .card.selected { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
    .card-header {
      display: flex; align-items: center; gap: 8px; padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9; background: white;
    }
    .badge {
      background: #0369a1; color: white; font-size: 0.7rem; font-weight: 700;
      padding: 2px 8px; border-radius: 4px; flex-shrink: 0;
    }
    .card-header-title { font-weight: 600; font-size: 0.85rem; flex: 1; }
    .check-mark {
      display: none; background: #2563eb; color: white; width: 22px; height: 22px;
      border-radius: 50%; font-size: 12px; line-height: 22px; text-align: center; flex-shrink: 0;
    }
    .card.selected .check-mark { display: block; }
    .svg-container { padding: 12px; background: #f1f5f9; }
    .svg-container img { width: 100%; height: auto; display: block; border-radius: 4px; }
    .swatches { display: flex; gap: 8px; padding: 12px 16px; flex-wrap: wrap; justify-content: center; }
    .swatch { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .swatch-circle {
      width: 36px; height: 36px; border-radius: 50%; border: 1px solid #e2e8f0;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.65rem; font-weight: 700;
    }
    .swatch-hex { font-size: 0.6rem; color: #64748b; font-family: monospace; }
    .contrast-info { padding: 10px 16px; border-top: 1px solid #f1f5f9; }
    .wcag-badge {
      display: inline-block; font-size: 0.7rem; font-weight: 700; padding: 2px 8px;
      border-radius: 4px; margin-bottom: 8px;
    }
    .badge-aaa { background: #dcfce7; color: #166534; }
    .badge-aa { background: #fef9c3; color: #854d0e; }
    .badge-a { background: #fed7aa; color: #9a3412; }
    .badge-fail { background: #fecaca; color: #991b1b; }
    .contrast-row { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; margin-bottom: 4px; }
    .contrast-label { flex: 1; color: #475569; }
    .contrast-specimen {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 20px; border-radius: 3px; border: 1px solid #d1d5db;
      font-size: 0.7rem; font-weight: 700; line-height: 1; flex-shrink: 0;
    }
    .contrast-ratio { font-family: monospace; font-weight: 600; min-width: 3.5em; text-align: right; }
    .contrast-badge { font-size: 0.65rem; font-weight: 700; padding: 1px 5px; border-radius: 3px; min-width: 2.5em; text-align: center; }
    .contrast-badge.pass { background: #dcfce7; color: #166534; }
    .contrast-badge.fail { background: #fecaca; color: #991b1b; }
    .card-footer { padding: 8px 16px; border-top: 1px solid #f1f5f9; }
    .palette-notes { font-size: 0.75rem; color: #475569; }
    .toolbar {
      position: sticky; bottom: 0; background: white; border-top: 1px solid #e2e8f0;
      padding: 1rem 0; display: flex; align-items: center; gap: 1rem;
    }
    .toolbar button {
      background: #2563eb; color: white; border: none; padding: 0.6rem 1.5rem;
      border-radius: 8px; font-size: 0.9rem; font-weight: 600; cursor: pointer;
    }
    .toolbar button:disabled { background: #94a3b8; cursor: not-allowed; }
    .toolbar button:not(:disabled):hover { background: #1d4ed8; }
    .selection-info { color: #475569; font-size: 0.875rem; }
    .copied { color: #16a34a; font-weight: 600; display: none; }
  </style>
</head>
<body>
  <div class="page-header">
    <h1>Palette Selection</h1>
    <div class="niche-context">Niche identified: <strong>${contextLine}</strong></div>
    <p class="subtitle">Combination: <strong>${comboId}</strong> \u2014 Select exactly <strong>1</strong> palette. Colored SVGs show real palette application.</p>
  </div>
  <div class="grid">
${cards}
  </div>
  <div class="toolbar">
    <button id="copyBtn" disabled onclick="copySelection()">Copy selected palette ID</button>
    <span class="selection-info" id="selInfo">No selection</span>
    <span class="copied" id="copiedMsg">Copied!</span>
  </div>
  <script>
    let selectedCard = null;
    let selectedId = null;
    function selectPalette(card) {
      if (selectedCard) selectedCard.classList.remove('selected');
      if (selectedCard === card) { selectedCard = null; selectedId = null; update(); return; }
      card.classList.add('selected');
      selectedCard = card;
      selectedId = card.dataset.id;
      update();
    }
    function update() {
      document.getElementById('copyBtn').disabled = !selectedId;
      document.getElementById('selInfo').textContent = selectedId ? 'Selected: ' + selectedId : 'No selection';
    }
    function copySelection() {
      navigator.clipboard.writeText(selectedId).then(() => {
        const msg = document.getElementById('copiedMsg');
        msg.style.display = 'inline';
        setTimeout(() => msg.style.display = 'none', 2000);
      });
    }
  </script>
</body>
</html>`;
}
var { combination, niche, count } = parseArgs();
var comboMetaPath = resolve4(".design-pipeline/combinations/combinations.json");
if (!existsSync2(comboMetaPath)) {
  console.error(JSON.stringify({ error: true, code: "MISSING_DATA", message: "Run combine-previews.ts first." }));
  process.exit(1);
}
var comboMeta = JSON.parse(readFileSync4(comboMetaPath, "utf-8"));
var selectedCombo = comboMeta.combos.find((c) => c.id === combination);
if (!selectedCombo) {
  console.error(JSON.stringify({
    error: true,
    code: "INVALID_COMBINATION",
    message: `Combination ${combination} not found. Available: ${comboMeta.combos.map((c) => c.id).join(", ")}`
  }));
  process.exit(1);
}
var comboSvg = loadSVG(join(".design-pipeline/combinations", selectedCombo.svgFile));
var state = readState();
var applicationType = state.application_type || "";
var colorResult = filterColors(niche, applicationType, count);
var outputDir = resolve4(".design-pipeline/palettes");
if (!existsSync2(outputDir)) mkdirSync2(outputDir, { recursive: true });
var previews = [];
for (let i = 0; i < colorResult.palettes.length; i++) {
  const palette = colorResult.palettes[i];
  const id = `palette-preview-${String(i + 1).padStart(2, "0")}`;
  const coloredSvg = generatePalettePreviewSVG({
    primary: palette.primary,
    secondary: palette.secondary,
    cta: palette.cta,
    background: palette.background,
    text: palette.text,
    border: palette.border
  }, niche);
  const filename = `${id}.svg`;
  saveSVG(coloredSvg, join(outputDir, filename));
  const { textOnBg, autoOnPrimary, autoOnCta, wcagLevel } = computeContrast(palette);
  previews.push({
    id,
    paletteId: palette.id,
    svgFile: filename,
    palette,
    contrast: { textOnBg, autoOnPrimary, autoOnCta },
    wcagLevel
  });
}
var html = generatePreviewHTML(previews, combination, {
  niche,
  appType: applicationType,
  confidence: state.niche_confidence
});
writeFileSync3(join(outputDir, "preview.html"), html);
writeFileSync3(join(outputDir, "palettes.json"), JSON.stringify(previews, null, 2));
completeStage("combination_preview", "palette_application", {
  selected_combination: combination,
  available_palettes: previews.map((p) => p.id)
});
console.log(JSON.stringify({
  success: true,
  combination,
  palettes_found: previews.length,
  filter_strategy: colorResult.filter_strategy,
  output_dir: ".design-pipeline/palettes/",
  preview: ".design-pipeline/palettes/preview.html",
  wcag_summary: previews.map((p) => ({ id: p.id, level: p.wcagLevel }))
}, null, 2));
