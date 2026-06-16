# color-x

Zero-dependency color manipulation library for Node.js. Parse, convert, mix, and analyze colors across hex, RGB, HSL, and HSV spaces. Generate harmony palettes, compute WCAG contrast ratios, and more.

## Install

```bash
npm install color-x
```

## Quick Start

```js
const { parse, rgbToHex, rgbToHsl, lighten, mix, contrastRatio } = require('color-x');

// Parse any format
parse('#ff6b35');     // → { r: 255, g: 107, b: 53 }
parse('rgb(100, 200, 50)');
parse('hsl(200, 50%, 40%)');
parse('red');          // named colors

// Convert between spaces
rgbToHex({ r: 255, g: 107, b: 53 });  // → '#ff6b35'
rgbToHsl({ r: 255, g: 0, b: 0 });     // → { h: 0, s: 100, l: 50 }

// Operations
lighten('#3498db', 20);              // → lighten by 20%
mix('#ff0000', '#0000ff', 0.5);      // → blend red and blue

// Accessibility
contrastRatio('#ffffff', '#000000'); // → 21
```

## API

### Parsing
- `parse(color)` — Parse hex, rgb(), hsl(), or named color string → RGB
- `parseHex(hex)` — Parse #rgb / #rrggbb / #rrggbbaa → RGB
- `parseRgb(str)` — Parse rgb()/rgba() string → RGB
- `parseHsl(str)` — Parse hsl()/hsla() string → HSL

### Conversion
- `rgbToHex(rgb)` — RGB → hex string
- `rgbToHsl(rgb)` — RGB → HSL
- `hslToRgb(hsl)` — HSL → RGB
- `rgbToHsv(rgb)` — RGB → HSV
- `hsvToRgb(hsv)` — HSV → RGB
- `toHex(colorStr)` — Any color string → hex
- `toCssRgb(rgb)` — RGB → CSS rgb()/rgba() string
- `toCssHsl(rgb)` — RGB → CSS hsl()/hsla() string

### Operations
- `lighten(color, pct)` — Increase lightness
- `darken(color, pct)` — Decrease lightness
- `saturate(color, pct)` — Increase saturation
- `desaturate(color, pct)` — Decrease saturation
- `spin(color, degrees)` — Rotate hue
- `mix(c1, c2, amount)` — Blend two colors (0 = c1, 1 = c2)
- `grayscale(color)` — Luminance-weighted grayscale
- `invert(color)` — Invert color
- `complement(color)` — Rotate hue 180°
- `tint(color, amount)` — Mix with white
- `shade(color, amount)` — Mix with black

### Harmony Palettes
- `triadic(color)` — 3 colors at 120° intervals
- `analogous(color, angle?)` — Adjacent hues (default ±30°)
- `splitComplement(color, angle?)` — Color + two near-complements
- `tetradic(color)` — 4 colors at 90° intervals
- `monochromatic(color, steps?, spread?)` — Lightness variations

### Accessibility (WCAG)
- `luminance(color)` — Relative luminance (0–1)
- `contrastRatio(c1, c2)` — Contrast ratio (1–21)
- `wcagGrade(c1, c2)` — 'AAA', 'AA', 'AA-large', or 'Fail'
- `isDark(color)` / `isLight(color)` — Luminance-based classification
- `bestTextOn(bg)` — Returns '#000000' or '#ffffff' for best contrast

### Utilities
- `wheel(n, sat?, light?)` — N evenly-spaced colors
- `random()` — Random RGB color
- `randomPleasing()` — Pleasing random color (golden angle hue)
- `info(color)` — All representations + metrics
- `namedColors()` — CSS named color map

## CLI

```bash
npx colorx info "#ff6b35"
npx colorx lighten "#3498db" 20
npx colorx mix "#ff0000" "#0000ff" 0.5
npx colorx triadic "#e74c3c"
npx colorx contrast "#ffffff" "#666666"
npx colorx demo
```

## License

MIT
