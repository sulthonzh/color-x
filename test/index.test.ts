import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parse, parseHex, parseRgb, parseHsl,
  rgbToHex, rgbToHsl, hslToRgb, rgbToHsv, hsvToRgb,
  lighten, darken, saturate, desaturate, spin, mix, grayscale, invert, complement,
  triadic, analogous, splitComplement, tetradic, monochromatic, tint, shade,
  luminance, contrastRatio, wcagGrade, isDark, isLight, bestTextOn,
  wheel, random, randomPleasing, toCssRgb, toCssHsl, toHex, info, namedColors,
} from '../src/index';

describe('Parsing', () => {
  it('parseHex: #fff → {255,255,255}', () => {
    assert.deepEqual(parseHex('#fff'), { r: 255, g: 255, b: 255 });
  });

  it('parseHex: #ff6b35', () => {
    assert.deepEqual(parseHex('#ff6b35'), { r: 255, g: 107, b: 53 });
  });

  it('parseHex: 3-digit shorthand', () => {
    assert.deepEqual(parseHex('#0f0'), { r: 0, g: 255, b: 0 });
  });

  it('parseHex: with alpha #ff000080', () => {
    const r = parseHex('#ff000080');
    assert.equal(r.r, 255);
    assert.equal(r.g, 0);
    assert.equal(r.b, 0);
    assert.ok(r.a !== undefined && Math.abs(r.a - 128/255) < 0.01);
  });

  it('parseHex: 4-digit shorthand alpha', () => {
    const r = parseHex('#f00f');
    assert.equal(r.r, 255);
    assert.equal(r.a, 1);
  });

  it('parseHex: throws on invalid length', () => {
    assert.throws(() => parseHex('#12'));
    assert.throws(() => parseHex('#12345'));
  });

  it('parseRgb: rgb(255, 107, 53)', () => {
    assert.deepEqual(parseRgb('rgb(255, 107, 53)'), { r: 255, g: 107, b: 53 });
  });

  it('parseRgb: rgba with alpha', () => {
    const r = parseRgb('rgba(255, 0, 0, 0.5)');
    assert.equal(r.a, 0.5);
  });

  it('parseHsl: hsl(200, 50%, 40%)', () => {
    assert.deepEqual(parseHsl('hsl(200, 50%, 40%)'), { h: 200, s: 50, l: 40 });
  });

  it('parse: named color "red"', () => {
    assert.deepEqual(parse('red'), { r: 255, g: 0, b: 0 });
  });

  it('parse: named color "blue"', () => {
    assert.deepEqual(parse('blue'), { r: 0, g: 0, b: 255 });
  });

  it('parse: hex string', () => {
    assert.deepEqual(parse('#ff6b35'), { r: 255, g: 107, b: 53 });
  });

  it('parse: rgb string', () => {
    assert.deepEqual(parse('rgb(100, 200, 50)'), { r: 100, g: 200, b: 50 });
  });

  it('parse: hsl string converts to rgb', () => {
    const r = parse('hsl(0, 100%, 50%)');
    assert.equal(r.r, 255);
    assert.equal(r.g, 0);
    assert.equal(r.b, 0);
  });

  it('parse: throws on garbage', () => {
    assert.throws(() => parse('not-a-color'));
  });
});

describe('Conversions', () => {
  it('rgbToHex: basic', () => {
    assert.equal(rgbToHex({ r: 255, g: 107, b: 53 }), '#ff6b35');
    assert.equal(rgbToHex({ r: 0, g: 0, b: 0 }), '#000000');
    assert.equal(rgbToHex({ r: 255, g: 255, b: 255 }), '#ffffff');
  });

  it('rgbToHex: with alpha', () => {
    const hex = rgbToHex({ r: 255, g: 0, b: 0, a: 0.5 });
    assert.ok(hex.startsWith('#ff0000'));
  });

  it('rgbToHex: clamps out-of-range', () => {
    assert.equal(rgbToHex({ r: 300, g: -10, b: 128 }), '#ff0080');
  });

  it('rgbToHsl & hslToRgb round-trip', () => {
    const colors = [{ r: 255, g: 107, b: 53 }, { r: 0, g: 0, b: 0 }, { r: 128, g: 200, b: 50 }];
    for (const c of colors) {
      const hsl = rgbToHsl(c);
      const back = hslToRgb(hsl);
      assert.ok(Math.abs(back.r - c.r) <= 2, `r: ${back.r} vs ${c.r}`);
      assert.ok(Math.abs(back.g - c.g) <= 2, `g: ${back.g} vs ${c.g}`);
      assert.ok(Math.abs(back.b - c.b) <= 2, `b: ${back.b} vs ${c.b}`);
    }
  });

  it('rgbToHsl: black is 0,0,0', () => {
    assert.deepEqual(rgbToHsl({ r: 0, g: 0, b: 0 }), { h: 0, s: 0, l: 0 });
  });

  it('rgbToHsl: white is 0,0,100', () => {
    assert.deepEqual(rgbToHsl({ r: 255, g: 255, b: 255 }), { h: 0, s: 0, l: 100 });
  });

  it('rgbToHsl: pure red', () => {
    assert.deepEqual(rgbToHsl({ r: 255, g: 0, b: 0 }), { h: 0, s: 100, l: 50 });
  });

  it('rgbToHsl: pure green', () => {
    const hsl = rgbToHsl({ r: 0, g: 255, b: 0 });
    assert.equal(hsl.h, 120);
    assert.equal(hsl.s, 100);
    assert.equal(hsl.l, 50);
  });

  it('rgbToHsl: pure blue', () => {
    const hsl = rgbToHsl({ r: 0, g: 0, b: 255 });
    assert.equal(hsl.h, 240);
    assert.equal(hsl.s, 100);
    assert.equal(hsl.l, 50);
  });

  it('rgbToHsv & hsvToRgb round-trip', () => {
    const c = { r: 100, g: 150, b: 200 };
    const hsv = rgbToHsv(c);
    const back = hsvToRgb(hsv);
    assert.ok(Math.abs(back.r - c.r) <= 2);
    assert.ok(Math.abs(back.g - c.g) <= 2);
    assert.ok(Math.abs(back.b - c.b) <= 2);
  });

  it('rgbToHsv: black', () => {
    assert.deepEqual(rgbToHsv({ r: 0, g: 0, b: 0 }), { h: 0, s: 0, v: 0 });
  });

  it('rgbToHsv: white', () => {
    assert.deepEqual(rgbToHsv({ r: 255, g: 255, b: 255 }), { h: 0, s: 0, v: 100 });
  });
});

describe('Operations', () => {
  it('lighten: makes color lighter', () => {
    const dark = { r: 50, g: 50, b: 50 };
    const lighter = lighten(dark, 20);
    assert.ok(lighter.r > dark.r);
    assert.ok(lighter.g > dark.g);
    assert.ok(lighter.b > dark.b);
  });

  it('lighten: caps at 100%', () => {
    const result = lighten('#000000', 200);
    const hsl = rgbToHsl(result);
    assert.equal(hsl.l, 100);
  });

  it('darken: makes color darker', () => {
    const light = { r: 200, g: 200, b: 200 };
    const darker = darken(light, 20);
    assert.ok(darker.r < light.r);
  });

  it('darken: caps at 0%', () => {
    const result = darken('#ffffff', 200);
    const hsl = rgbToHsl(result);
    assert.equal(hsl.l, 0);
  });

  it('saturate: increases saturation', () => {
    const c = { r: 128, g: 128, b: 100 };
    const s1 = rgbToHsl(c).s;
    const s2 = rgbToHsl(saturate(c, 30)).s;
    assert.ok(s2 >= s1);
  });

  it('desaturate: decreases saturation', () => {
    const c = { r: 255, g: 0, b: 0 };
    const s1 = rgbToHsl(c).s;
    const s2 = rgbToHsl(desaturate(c, 50)).s;
    assert.ok(s2 < s1);
  });

  it('spin: rotates hue', () => {
    const c = { r: 255, g: 0, b: 0 };
    const spun = spin(c, 120);
    const hsl = rgbToHsl(spun);
    assert.ok(Math.abs(hsl.h - 120) < 2);
  });

  it('spin: handles negative', () => {
    const c = { r: 255, g: 0, b: 0 };
    const spun = spin(c, -60);
    const hsl = rgbToHsl(spun);
    assert.ok(Math.abs(hsl.h - 300) < 2);
  });

  it('mix: 50/50 red+blue', () => {
    const result = mix('#ff0000', '#0000ff', 0.5);
    assert.ok(Math.abs(result.r - 128) <= 1);
    assert.ok(Math.abs(result.b - 128) <= 1);
  });

  it('mix: amount=0 returns first color', () => {
    const result = mix('#ff0000', '#00ff00', 0);
    assert.equal(result.r, 255);
    assert.equal(result.g, 0);
  });

  it('mix: amount=1 returns second color', () => {
    const result = mix('#ff0000', '#00ff00', 1);
    assert.equal(result.g, 255);
  });

  it('grayscale: produces gray', () => {
    const result = grayscale('#ff0000');
    assert.equal(result.r, result.g);
    assert.equal(result.g, result.b);
  });

  it('grayscale: red contributes 0.299', () => {
    const result = grayscale('#ff0000');
    assert.ok(Math.abs(result.r - 76) <= 1); // 255 * 0.299 ≈ 76
  });

  it('invert: black → white', () => {
    assert.deepEqual(invert('#000000'), { r: 255, g: 255, b: 255 });
  });

  it('invert: red → cyan', () => {
    assert.deepEqual(invert('#ff0000'), { r: 0, g: 255, b: 255 });
  });

  it('complement: red → cyan (180°)', () => {
    const c = complement('#ff0000');
    const hsl = rgbToHsl(c);
    assert.ok(Math.abs(hsl.h - 180) < 2);
  });

  it('tint: mixes with white', () => {
    const result = tint('#000000', 0.5);
    assert.ok(result.r > 0);
    assert.equal(result.r, result.g);
    assert.equal(result.g, result.b);
  });

  it('shade: mixes with black', () => {
    const result = shade('#ffffff', 0.5);
    assert.ok(result.r < 255);
    assert.equal(result.r, result.g);
  });
});

describe('Harmony Palettes', () => {
  it('triadic: returns 3 colors', () => {
    const palette = triadic('#ff0000');
    assert.equal(palette.length, 3);
    const hues = palette.map(c => rgbToHsl(c).h);
    assert.ok(Math.abs(hues[0] - hues[1]) > 100);
  });

  it('analogous: returns 3 colors', () => {
    const palette = analogous('#336699');
    assert.equal(palette.length, 3);
  });

  it('splitComplement: returns 3 colors', () => {
    const palette = splitComplement('#ff6b35');
    assert.equal(palette.length, 3);
  });

  it('tetradic: returns 4 colors', () => {
    const palette = tetradic('#e74c3c');
    assert.equal(palette.length, 4);
  });

  it('monochromatic: returns N steps', () => {
    const palette = monochromatic('#3498db', 5);
    assert.equal(palette.length, 5);
    const lightness = palette.map(c => rgbToHsl(c).l);
    // Should be ascending
    for (let i = 1; i < lightness.length; i++) {
      assert.ok(lightness[i] >= lightness[i - 1] - 1, 'should be ascending');
    }
  });

  it('monochromatic: custom steps', () => {
    assert.equal(monochromatic('#fff', 3).length, 3);
    assert.equal(monochromatic('#fff', 7).length, 7);
  });
});

describe('Accessibility', () => {
  it('luminance: black = 0', () => {
    assert.equal(luminance('#000000'), 0);
  });

  it('luminance: white = 1', () => {
    assert.ok(Math.abs(luminance('#ffffff') - 1) < 0.001);
  });

  it('contrastRatio: white/black = 21', () => {
    const r = contrastRatio('#ffffff', '#000000');
    assert.ok(r > 20, `expected ~21, got ${r}`);
  });

  it('contrastRatio: same color = 1', () => {
    const r = contrastRatio('#777777', '#777777');
    assert.ok(Math.abs(r - 1) < 0.01);
  });

  it('wcagGrade: returns proper grade', () => {
    assert.equal(wcagGrade('#ffffff', '#000000'), 'AAA');
    assert.equal(wcagGrade('#777777', '#888888'), 'Fail');
  });

  it('wcagGrade: AA threshold', () => {
    // #767676 on white has ratio ~4.54
    assert.equal(wcagGrade('#ffffff', '#767676'), 'AA');
  });

  it('isDark: black is dark', () => {
    assert.ok(isDark('#000000'));
  });

  it('isDark: white is not dark', () => {
    assert.ok(!isDark('#ffffff'));
  });

  it('isLight: white is light', () => {
    assert.ok(isLight('#ffffff'));
  });

  it('bestTextOn: dark bg → white text', () => {
    assert.equal(bestTextOn('#000000'), '#ffffff');
  });

  it('bestTextOn: light bg → black text', () => {
    assert.equal(bestTextOn('#ffffff'), '#000000');
  });
});

describe('Utilities', () => {
  it('wheel: returns N colors', () => {
    assert.equal(wheel(6).length, 6);
    assert.equal(wheel(12).length, 12);
  });

  it('wheel: colors are evenly spaced', () => {
    const palette = wheel(3);
    const hues = palette.map(c => rgbToHsl(c).h);
    assert.ok(Math.abs(hues[0] - 0) < 2 || Math.abs(hues[0] - 360) < 2);
    assert.ok(Math.abs(hues[1] - 120) < 2);
    assert.ok(Math.abs(hues[2] - 240) < 2);
  });

  it('random: returns valid RGB', () => {
    const c = random();
    assert.ok(c.r >= 0 && c.r <= 255);
    assert.ok(c.g >= 0 && c.g <= 255);
    assert.ok(c.b >= 0 && c.b <= 255);
  });

  it('randomPleasing: returns valid RGB', () => {
    const c = randomPleasing();
    assert.ok(c.r >= 0 && c.r <= 255);
    assert.ok(c.g >= 0 && c.g <= 255);
  });

  it('toCssRgb: format correctly', () => {
    assert.equal(toCssRgb({ r: 255, g: 107, b: 53 }), 'rgb(255, 107, 53)');
    const withAlpha = toCssRgb({ r: 255, g: 0, b: 0, a: 0.5 });
    assert.ok(withAlpha.includes('rgba'));
  });

  it('toCssHsl: format correctly', () => {
    const css = toCssHsl({ r: 255, g: 0, b: 0 });
    assert.ok(css.startsWith('hsl('));
  });

  it('toHex: convert named color', () => {
    assert.equal(toHex('red'), '#ff0000');
  });

  it('toHex: convert rgb string', () => {
    assert.equal(toHex('rgb(0,0,255)'), '#0000ff');
  });

  it('info: returns all fields', () => {
    const i = info('#ff6b35');
    assert.ok(i.hex);
    assert.ok(i.rgb);
    assert.ok(i.hsl);
    assert.ok(i.hsv);
    assert.ok(i.luminance);
    assert.ok(i.contrastWhite);
    assert.ok(i.contrastBlack);
    assert.ok(i.wcagWhite);
    assert.ok(i.wcagBlack);
    assert.ok(i.isDark !== undefined);
  });

  it('namedColors: returns object with known names', () => {
    const names = namedColors();
    assert.ok(names.red);
    assert.ok(names.blue);
    assert.ok(names.chocolate);
  });
});

describe('Round-trip Stability', () => {
  it('rgb → hsl → rgb preserves colors within tolerance', () => {
    const testColors = [
      { r: 17, g: 200, b: 99 },
      { r: 0, g: 128, b: 255 },
      { r: 64, g: 64, b: 64 },
      { r: 200, g: 100, b: 50 },
    ];
    for (const c of testColors) {
      const back = hslToRgb(rgbToHsl(c));
      assert.ok(Math.abs(back.r - c.r) <= 2, `r mismatch for ${JSON.stringify(c)}`);
      assert.ok(Math.abs(back.g - c.g) <= 2, `g mismatch for ${JSON.stringify(c)}`);
      assert.ok(Math.abs(back.b - c.b) <= 2, `b mismatch for ${JSON.stringify(c)}`);
    }
  });

  it('rgb → hsv → rgb preserves colors within tolerance', () => {
    const testColors = [
      { r: 100, g: 200, b: 50 },
      { r: 0, g: 0, b: 128 },
      { r: 255, g: 255, b: 0 },
    ];
    for (const c of testColors) {
      const back = hsvToRgb(rgbToHsv(c));
      assert.ok(Math.abs(back.r - c.r) <= 2, `r mismatch for ${JSON.stringify(c)}`);
      assert.ok(Math.abs(back.g - c.g) <= 2, `g mismatch for ${JSON.stringify(c)}`);
      assert.ok(Math.abs(back.b - c.b) <= 2, `b mismatch for ${JSON.stringify(c)}`);
    }
  });
});
