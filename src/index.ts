/**
 * color-x — Zero-dependency color manipulation library
 *
 * Parse, convert, mix, and analyze colors across hex, RGB, HSL, and HSV spaces.
 * Generate harmony palettes, compute WCAG contrast ratios, and more.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RGB {
  r: number; // 0–255
  g: number;
  b: number;
  a?: number; // 0–1 (optional alpha)
}

export interface HSL {
  h: number; // 0–360
  s: number; // 0–100
  l: number; // 0–100
  a?: number;
}

export interface HSV {
  h: number; // 0–360
  s: number; // 0–100
  v: number; // 0–100
  a?: number;
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function round(n: number, dp = 0): number {
  const f = Math.pow(10, dp);
  return Math.round(n * f) / f;
}

function hueToRgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

// ─── Parsing ────────────────────────────────────────────────────────────────

/** CSS named colors — full list */
const NAMED_COLORS: Record<string, string> = {
  black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000',
  blue: '#0000ff', yellow: '#ffff00', cyan: '#00ffff', magenta: '#ff00ff',
  orange: '#ffa500', purple: '#800080', pink: '#ffc0cb', brown: '#a52a2a',
  gray: '#808080', grey: '#808080', silver: '#c0c0c0', maroon: '#800000',
  olive: '#808000', lime: '#00ff00', aqua: '#00ffff', teal: '#008080',
  navy: '#000080', fuchsia: '#ff00ff', gold: '#ffd700', indigo: '#4b0082',
  violet: '#ee82ee', turquoise: '#40e0d0', salmon: '#fa8072', coral: '#ff7f50',
  khaki: '#f0e68c', crimson: '#dc143c', azure: '#f0ffff', ivory: '#fffff0',
  beige: '#f5f5dc', tan: '#d2b48c', lavender: '#e6e6fa', plum: '#dda0dd',
  orchid: '#da70d6', chocolate: '#d2691e', tomato: '#ff6347', wheat: '#f5deb3',
  slategray: '#708090', navyblue: '#000080', skyblue: '#87ceeb',
  midnightblue: '#191970', darkblue: '#00008b', mediumblue: '#0000cd',
  royalblue: '#4169e1', dodgerblue: '#1e90ff', deepskyblue: '#00bfff',
  lightblue: '#add8e6', lightskyblue: '#87cefa', steelblue: '#4682b4',
  aliceblue: '#f0f8ff', ghostwhite: '#f8f8ff', snow: '#fffafa',
  seashell: '#fff5ee', floralwhite: '#fffaf0', linen: '#faf0e6',
  oldlace: '#fdf5e6', antiquewhite: '#faebd7', cornsilk: '#fff8dc',
  lemonchiffon: '#fffacd', lightyellow: '#ffffe0', ivory2: '#fffff0',
  papayawhip: '#ffefd5', blanchedalmond: '#ffebcd', bisque: '#ffe4c4',
  moccasin: '#ffe4b5', navajowhite: '#ffdead', peachpuff: '#ffdab9',
  mistyrose: '#ffe4e1', lavenderblush: '#fff0f5', thistle: '#d8bfd8',
  darkred: '#8b0000', firebrick: '#b22222', indianred: '#cd5c5c',
  lightcoral: '#f08080', darksalmon: '#e9967a', lightsalmon: '#ffa07a',
  orangered: '#ff4500', darkorange: '#ff8c00', goldenrod: '#daa520',
  darkgoldenrod: '#b8860b', palegoldenrod: '#eee8aa', darkkhaki: '#bdb76b',
  yellowgreen: '#9acd32', chartreuse: '#7fff00', lawngreen: '#7cfc00',
  greenyellow: '#adff2f', palegreen: '#98fb98', lightgreen: '#90ee90',
  springgreen: '#00ff7f', mediumspringgreen: '#00fa9a', seagreen: '#2e8b57',
  forestgreen: '#228b22', darkgreen: '#006400', darkseagreen: '#8fbc8f',
  mediumseagreen: '#3cb371', lightseagreen: '#20b2aa', mediumaquamarine: '#66cdaa',
  darkcyan: '#008b8b', darkturquoise: '#00ced1', mediumturquoise: '#48d1cc',
  lightcyan: '#e0ffff', paleturquoise: '#afeeee', aquamarine: '#7fffd4',
  powderblue: '#b0e0e6', cadetblue: '#5f9ea0', rosybrown: '#bc8f8f',
  sandybrown: '#f4a460', peru: '#cd853f', sienna: '#a0522d',
  saddlebrown: '#8b4513', darkslategray: '#2f4f4f', dimgray: '#696969',
  darkgray: '#a9a9a9', lightgray: '#d3d3d3', gainsboro: '#dcdcdc',
  whitesmoke: '#f5f5f5', honeydew: '#f0fff0', mintcream: '#f5fffa',
  azure2: '#f0ffff', lightcyan2: '#e0ffff', paleturquoise2: '#afeeee',
  cornflowerblue: '#6495ed', lightsteelblue: '#b0c4de', lightslategray: '#778899',
  slateblue: '#6a5acd', mediumslateblue: '#7b68ee', mediumpurple: '#9370db',
  blueviolet: '#8a2be2', darkviolet: '#9400d3', darkorchid: '#9932cc',
  mediumorchid: '#ba55d3', palevioletred: '#db7093', deeppink: '#ff1493',
  hotpink: '#ff69b4', lightpink: '#ffb6c1', pink2: '#ffc0cb',
  mediumvioletred: '#c71585', palegoldenrod2: '#eee8aa',
};

/**
 * Parse a hex color string (#rgb, #rgba, #rrggbb, #rrggbbaa) into RGB.
 */
export function parseHex(hex: string): RGB {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3 || h.length === 4) {
    h = h.split('').map(c => c + c).join('');
  }
  if (h.length !== 6 && h.length !== 8) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : undefined;
  return { r, g, b, ...(a !== undefined ? { a } : {}) };
}

/**
 * Parse an rgb()/rgba() CSS string into RGB.
 */
export function parseRgb(str: string): RGB {
  const m = str.match(/rgba?\(\s*(\d+\.?\d*)\s*[,\s]\s*(\d+\.?\d*)\s*[,\s]\s*(\d+\.?\d*)\s*(?:[,/]\s*([\d.]+)%?\s*)?\)/i);
  if (!m) throw new Error(`Invalid rgb() color: ${str}`);
  let a: number | undefined;
  if (m[4] !== undefined) {
    a = m[4].includes('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
  }
  return { r: Math.round(parseFloat(m[1])), g: Math.round(parseFloat(m[2])), b: Math.round(parseFloat(m[3])), ...(a !== undefined ? { a } : {}) };
}

/**
 * Parse an hsl()/hsla() CSS string into HSL.
 */
export function parseHsl(str: string): HSL {
  const m = str.match(/hsla?\(\s*(\d+\.?\d*)\s*(?:deg)?\s*[,\s]\s*(\d+\.?\d*)%\s*[,\s]\s*(\d+\.?\d*)%\s*(?:[,/]\s*([\d.]+)%?\s*)?\)/i);
  if (!m) throw new Error(`Invalid hsl() color: ${str}`);
  let a: number | undefined;
  if (m[4] !== undefined) {
    a = m[4].includes('%') ? parseFloat(m[4]) / 100 : parseFloat(m[4]);
  }
  return { h: parseFloat(m[1]), s: parseFloat(m[2]), l: parseFloat(m[3]), ...(a !== undefined ? { a } : {}) };
}

/**
 * Parse any color string (hex, rgb, hsl, or named) into RGB.
 */
export function parse(color: string): RGB {
  const c = color.trim().toLowerCase();
  // Named color
  if (NAMED_COLORS[c]) return parseHex(NAMED_COLORS[c]);
  // Hex
  if (c.startsWith('#')) return parseHex(c);
  // rgb/rgba
  if (c.startsWith('rgb')) return parseRgb(c);
  // hsl/hsla
  if (c.startsWith('hsl')) return hslToRgb(parseHsl(c));
  throw new Error(`Cannot parse color: ${color}`);
}

// ─── Conversion ─────────────────────────────────────────────────────────────

/** RGB → hex string (#rrggbb or #rrggbbaa) */
export function rgbToHex(rgb: RGB): string {
  const { r, g, b, a } = rgb;
  const hex = [r, g, b].map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
  if (a !== undefined && a < 1) {
    const ah = clamp(Math.round(a * 255), 0, 255).toString(16).padStart(2, '0');
    return `#${hex}${ah}`;
  }
  return `#${hex}`;
}

/** RGB → HSL */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h: round(h, 1), s: round(s * 100, 1), l: round(l * 100, 1), ...(rgb.a !== undefined ? { a: rgb.a } : {}) };
}

/** HSL → RGB */
export function hslToRgb(hsl: HSL): RGB {
  const { h, s, l } = hsl;
  const sN = s / 100, lN = l / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lN - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    ...(hsl.a !== undefined ? { a: hsl.a } : {}),
  };
}

/** RGB → HSV */
export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (d !== 0) {
    switch (max) {
      case r: h = ((g - b) / d) % 6; break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h: round(h, 1), s: round(s * 100, 1), v: round(v * 100, 1), ...(rgb.a !== undefined ? { a: rgb.a } : {}) };
}

/** HSV → RGB */
export function hsvToRgb(hsv: HSV): RGB {
  const { h, s, v } = hsv;
  const sN = s / 100, vN = v / 100;
  const c = vN * sN;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vN - c;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    ...(hsv.a !== undefined ? { a: hsv.a } : {}),
  };
}

// ─── Color Operations ───────────────────────────────────────────────────────

/** Lighten a color by a percentage (0–100). */
export function lighten(color: RGB | string, amount: number): RGB {
  const rgb = typeof color === 'string' ? parse(color) : { ...color };
  const hsl = rgbToHsl(rgb);
  hsl.l = clamp(hsl.l + amount, 0, 100);
  return hslToRgb(hsl);
}

/** Darken a color by a percentage (0–100). */
export function darken(color: RGB | string, amount: number): RGB {
  const rgb = typeof color === 'string' ? parse(color) : { ...color };
  const hsl = rgbToHsl(rgb);
  hsl.l = clamp(hsl.l - amount, 0, 100);
  return hslToRgb(hsl);
}

/** Saturate a color by a percentage (0–100). */
export function saturate(color: RGB | string, amount: number): RGB {
  const rgb = typeof color === 'string' ? parse(color) : { ...color };
  const hsl = rgbToHsl(rgb);
  hsl.s = clamp(hsl.s + amount, 0, 100);
  return hslToRgb(hsl);
}

/** Desaturate a color by a percentage (0–100). */
export function desaturate(color: RGB | string, amount: number): RGB {
  const rgb = typeof color === 'string' ? parse(color) : { ...color };
  const hsl = rgbToHsl(rgb);
  hsl.s = clamp(hsl.s - amount, 0, 100);
  return hslToRgb(hsl);
}

/** Spin / rotate the hue by N degrees (can be negative). */
export function spin(color: RGB | string, degrees: number): RGB {
  const rgb = typeof color === 'string' ? parse(color) : { ...color };
  const hsl = rgbToHsl(rgb);
  hsl.h = (hsl.h + degrees + 360) % 360;
  return hslToRgb(hsl);
}

/** Mix/blend two colors. amount = 0 → color1, 1 → color2. Default 0.5. */
export function mix(color1: RGB | string, color2: RGB | string, amount = 0.5): RGB {
  const c1 = typeof color1 === 'string' ? parse(color1) : color1;
  const c2 = typeof color2 === 'string' ? parse(color2) : color2;
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * amount),
    g: Math.round(c1.g + (c2.g - c1.g) * amount),
    b: Math.round(c1.b + (c2.b - c1.b) * amount),
  };
}

/** Convert to grayscale (luminance-weighted). */
export function grayscale(color: RGB | string): RGB {
  const c = typeof color === 'string' ? parse(color) : color;
  const gray = Math.round(c.r * 0.299 + c.g * 0.587 + c.b * 0.114);
  return { r: gray, g: gray, b: gray };
}

/** Invert a color. */
export function invert(color: RGB | string): RGB {
  const c = typeof color === 'string' ? parse(color) : color;
  return { r: 255 - c.r, g: 255 - c.g, b: 255 - c.b };
}

/** Complement a color (rotate hue 180°). */
export function complement(color: RGB | string): RGB {
  return spin(color, 180);
}

// ─── Harmony Palettes ───────────────────────────────────────────────────────

/** Returns [color, color+120°, color+240°] */
export function triadic(color: RGB | string): RGB[] {
  return [spin(color, 0), spin(color, 120), spin(color, 240)];
}

/** Returns [color, color-30°, color+30°] */
export function analogous(color: RGB | string, angle = 30): RGB[] {
  return [spin(color, -angle), spin(color, 0), spin(color, angle)];
}

/** Returns [color, complement] */
export function splitComplement(color: RGB | string, angle = 150): RGB[] {
  return [spin(color, 0), spin(color, angle), spin(color, 360 - angle)];
}

/** Returns [color, color+90°, complement, color+270°] — rectangle/quad */
export function tetradic(color: RGB | string): RGB[] {
  return [spin(color, 0), spin(color, 90), spin(color, 180), spin(color, 270)];
}

/** Monochromatic: variations in lightness. Steps default 5, spread default 40. */
export function monochromatic(color: RGB | string, steps = 5, spread = 40): RGB[] {
  const rgb = typeof color === 'string' ? parse(color) : color;
  const hsl = rgbToHsl(rgb);
  const result: RGB[] = [];
  const start = hsl.l - spread / 2;
  for (let i = 0; i < steps; i++) {
    const l = clamp(start + (spread / (steps - 1)) * i, 0, 100);
    result.push(hslToRgb({ ...hsl, l }));
  }
  return result;
}

/** Shade: mix with black. amount 0–1 */
export function shade(color: RGB | string, amount: number): RGB {
  return mix(color, '#000000', amount);
}

/** Tint: mix with white. amount 0–1 */
export function tint(color: RGB | string, amount: number): RGB {
  return mix(color, '#ffffff', amount);
}

// ─── Accessibility / WCAG ───────────────────────────────────────────────────

/** Relative luminance per WCAG 2.x */
export function luminance(color: RGB | string): number {
  const c = typeof color === 'string' ? parse(color) : color;
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
}

/** Contrast ratio between two colors (1–21). */
export function contrastRatio(c1: RGB | string, c2: RGB | string): number {
  const l1 = luminance(c1);
  const l2 = luminance(c2);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/** WCAG grade: 'AAA' (7+), 'AA' (4.5+), 'AA-large' (3+), or 'Fail'. */
export function wcagGrade(c1: RGB | string, c2: RGB | string): string {
  const r = contrastRatio(c1, c2);
  if (r >= 7) return 'AAA';
  if (r >= 4.5) return 'AA';
  if (r >= 3) return 'AA-large';
  return 'Fail';
}

/** Returns true if a color is considered "dark" (luminance < 0.5). */
export function isDark(color: RGB | string): boolean {
  return luminance(color) < 0.5;
}

/** Returns true if a color is considered "light". */
export function isLight(color: RGB | string): boolean {
  return !isDark(color);
}

/** Pick black or white text for best contrast on the given background. */
export function bestTextOn(bg: RGB | string): string {
  return isDark(bg) ? '#ffffff' : '#000000';
}

// ─── Utilities ──────────────────────────────────────────────────────────────

/** Generate N evenly spaced colors around the wheel (for categorical data). */
export function wheel(n: number, saturation = 70, lightness = 50): RGB[] {
  const result: RGB[] = [];
  for (let i = 0; i < n; i++) {
    const h = (360 / n) * i;
    result.push(hslToRgb({ h, s: saturation, l: lightness }));
  }
  return result;
}

/** Generate a random RGB color. */
export function random(): RGB {
  return {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
  };
}

/** Generate a pleasing random HSL color (constrained saturation/lightness). */
export function randomPleasing(): RGB {
  const goldenAngle = 137.508;
  const h = (Math.random() * 360 + goldenAngle) % 360;
  const s = 55 + Math.random() * 25; // 55–80
  const l = 45 + Math.random() * 20; // 45–65
  return hslToRgb({ h, s, l });
}

/** Convert RGB to a CSS rgb()/rgba() string. */
export function toCssRgb(rgb: RGB): string {
  if (rgb.a !== undefined && rgb.a < 1) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${round(rgb.a, 3)})`;
  }
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/** Convert RGB to a CSS hsl()/hsla() string. */
export function toCssHsl(rgb: RGB): string {
  const hsl = rgbToHsl(rgb);
  if (hsl.a !== undefined && hsl.a < 1) {
    return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${round(hsl.a, 3)})`;
  }
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

/** Convert any supported color string to hex. */
export function toHex(color: string): string {
  return rgbToHex(parse(color));
}

/** Format a color in all representations. */
export function info(color: RGB | string): Record<string, string> {
  const rgb = typeof color === 'string' ? parse(color) : color;
  const hsl = rgbToHsl(rgb);
  const hsv = rgbToHsv(rgb);
  return {
    hex: rgbToHex(rgb),
    rgb: toCssRgb(rgb),
    hsl: toCssHsl(rgb),
    hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
    luminance: round(luminance(rgb), 4).toString(),
    contrastWhite: round(contrastRatio(rgb, '#ffffff'), 2).toString(),
    contrastBlack: round(contrastRatio(rgb, '#000000'), 2).toString(),
    wcagWhite: wcagGrade(rgb, '#ffffff'),
    wcagBlack: wcagGrade(rgb, '#000000'),
    isDark: isDark(rgb).toString(),
  };
}

/** List all named CSS colors. */
export function namedColors(): Record<string, string> {
  return { ...NAMED_COLORS };
}
