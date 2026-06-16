#!/usr/bin/env node
import {
  parse, rgbToHex, rgbToHsl, hslToRgb, rgbToHsv,
  lighten, darken, saturate, desaturate, spin, mix, grayscale, invert, complement,
  triadic, analogous, splitComplement, tetradic, monochromatic, tint, shade,
  luminance, contrastRatio, wcagGrade, isDark, bestTextOn, wheel, random, randomPleasing,
  toCssRgb, toCssHsl, toHex, info,
  RGB,
} from './index';

const args = process.argv.slice(2);
const cmd = args[0] || 'help';

function showHelp(): void {
  console.log(`
color-x CLI — Zero-dependency color manipulation

Usage: colorx <command> [args]

Commands:
  info <color>              Show all representations (hex, rgb, hsl, hsv, luminance, WCAG)
  convert <color> <format>  Convert color to hex|rgb|hsl|hsv
  lighten <color> <pct>     Lighten by N%
  darken <color> <pct>      Darken by N%
  mix <c1> <c2> [amount]    Mix two colors (amount 0–1, default 0.5)
  spin <color> <degrees>    Rotate hue by N degrees
  triadic <color>           Triadic palette (3 colors)
  analogous <color>         Analogous palette (3 colors)
  tetradic <color>          Tetradic palette (4 colors)
  mono <color> [steps]      Monochromatic palette (default 5 steps)
  contrast <c1> <c2>        WCAG contrast ratio + grade
  text <bg>                 Best text color for background
  wheel <n>                 N evenly-spaced colors
  random                    Random pleasing color
  demo                      Color space demos

Examples:
  colorx info "#ff6b35"
  colorx lighten "#3498db" 20
  colorx mix "#ff0000" "#0000ff" 0.5
  colorx contrast "#ffffff" "#666666"
  colorx triadic "#e74c3c"
`);
}

function fmtHex(c: RGB): string { return rgbToHex(c); }
function fmtRgb(c: RGB): string { return toCssRgb(c); }
function fmtHsl(c: RGB): string { return toCssHsl(c); }

function printColor(c: RGB): void {
  console.log(`  hex: ${fmtHex(c)}  rgb: ${fmtRgb(c)}  hsl: ${fmtHsl(c)}`);
}

try {
  switch (cmd) {
    case 'info': {
      const c = info(args[1]);
      for (const [k, v] of Object.entries(c)) {
        console.log(`  ${k.padEnd(16)} ${v}`);
      }
      break;
    }
    case 'convert': {
      const color = args[1];
      const format = (args[2] || 'hex').toLowerCase();
      const rgb = parse(color);
      if (format === 'hex') console.log(rgbToHex(rgb));
      else if (format === 'rgb') console.log(toCssRgb(rgb));
      else if (format === 'hsl') console.log(toCssHsl(rgb));
      else if (format === 'hsv') { const hsv = rgbToHsv(rgb); console.log(`hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`); }
      else throw new Error(`Unknown format: ${format}. Use hex|rgb|hsl|hsv`);
      break;
    }
    case 'lighten': {
      const c = lighten(args[1], parseFloat(args[2] || '10'));
      console.log(fmtHex(c));
      break;
    }
    case 'darken': {
      const c = darken(args[1], parseFloat(args[2] || '10'));
      console.log(fmtHex(c));
      break;
    }
    case 'saturate': {
      const c = saturate(args[1], parseFloat(args[2] || '10'));
      console.log(fmtHex(c));
      break;
    }
    case 'desaturate': {
      const c = desaturate(args[1], parseFloat(args[2] || '10'));
      console.log(fmtHex(c));
      break;
    }
    case 'spin': {
      const c = spin(args[1], parseFloat(args[2] || '30'));
      console.log(fmtHex(c));
      break;
    }
    case 'mix': {
      const c = mix(args[1], args[2], args[3] ? parseFloat(args[3]) : 0.5);
      console.log(fmtHex(c));
      break;
    }
    case 'grayscale': {
      const c = grayscale(args[1]);
      console.log(fmtHex(c));
      break;
    }
    case 'invert': {
      const c = invert(args[1]);
      console.log(fmtHex(c));
      break;
    }
    case 'complement': {
      const c = complement(args[1]);
      console.log(fmtHex(c));
      break;
    }
    case 'triadic': {
      console.log('Triadic palette:');
      for (const c of triadic(args[1])) printColor(c);
      break;
    }
    case 'analogous': {
      console.log('Analogous palette:');
      for (const c of analogous(args[1])) printColor(c);
      break;
    }
    case 'split': case 'splitcomplement': {
      console.log('Split complement palette:');
      for (const c of splitComplement(args[1])) printColor(c);
      break;
    }
    case 'tetradic': {
      console.log('Tetradic palette:');
      for (const c of tetradic(args[1])) printColor(c);
      break;
    }
    case 'mono': case 'monochromatic': {
      const steps = args[2] ? parseInt(args[2]) : 5;
      console.log('Monochromatic palette:');
      for (const c of monochromatic(args[1], steps)) printColor(c);
      break;
    }
    case 'tint': {
      const c = tint(args[1], args[2] ? parseFloat(args[2]) : 0.5);
      console.log(fmtHex(c));
      break;
    }
    case 'shade': {
      const c = shade(args[1], args[2] ? parseFloat(args[2]) : 0.5);
      console.log(fmtHex(c));
      break;
    }
    case 'contrast': {
      const ratio = contrastRatio(args[1], args[2]);
      const grade = wcagGrade(args[1], args[2]);
      console.log(`Contrast ratio: ${round(ratio, 2)}:1 (${grade})`);
      break;
    }
    case 'text': {
      console.log(`Best text on ${args[1]}: ${bestTextOn(args[1])}`);
      break;
    }
    case 'wheel': {
      const n = parseInt(args[1] || '6');
      console.log(`${n}-color wheel:`);
      for (const c of wheel(n)) printColor(c);
      break;
    }
    case 'random': {
      const c = randomPleasing();
      printColor(c);
      break;
    }
    case 'demo': {
      console.log('=== color-x demo ===\n');
      const base = '#3498db';
      console.log(`Base: ${base}\n`);
      console.log('Lighten:'); [10, 20, 30].forEach(n => console.log(`  +${n}% ${fmtHex(lighten(base, n))}`));
      console.log('Darken:');  [10, 20, 30].forEach(n => console.log(`  -${n}% ${fmtHex(darken(base, n))}`));
      console.log('\nTriadic:'); for (const c of triadic(base)) console.log(`  ${fmtHex(c)}`);
      console.log('\nAnalogous:'); for (const c of analogous(base)) console.log(`  ${fmtHex(c)}`);
      console.log('\nTetradic:'); for (const c of tetradic(base)) console.log(`  ${fmtHex(c)}`);
      console.log('\nMonochromatic:'); for (const c of monochromatic(base, 5)) console.log(`  ${fmtHex(c)}`);
      console.log('\nContrast vs white:', round(contrastRatio(base, '#ffffff'), 2), wcagGrade(base, '#ffffff'));
      console.log('Contrast vs black:', round(contrastRatio(base, '#000000'), 2), wcagGrade(base, '#000000'));
      console.log('\nRandom colors:');
      for (let i = 0; i < 5; i++) { const c = randomPleasing(); console.log(`  ${fmtHex(c)}`); }
      break;
    }
    case 'help': case '--help': case '-h':
    default:
      showHelp();
      break;
  }
} catch (err) {
  console.error(`Error: ${(err as Error).message}`);
  process.exit(1);
}

function round(n: number, dp: number): number {
  const f = Math.pow(10, dp);
  return Math.round(n * f) / f;
}
