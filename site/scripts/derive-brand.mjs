import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

// 主色から決まる派生色を計算し、トークンブロックへ書き込む。
// 入力（自分で決める値）: ライトとダークそれぞれの --dt-accent / --dt-accent-soft。
// 出力（このスクリプトが決める値）: Infima の段階6つ、info・info-soft・status-review、強調行（ライトのみ）。
// 段階は Infima 既定と同じ作り方（黒へ 10/15/30%、白へ 15/30/50% 寄せる）。
// 使い方: node scripts/derive-brand.mjs [--write]   （--write なしは計算結果を表示するだけ）
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const cssFile = path.resolve(scriptDir, '../src/css/custom.css');
const write = process.argv.includes('--write');
const unexpected = process.argv.slice(2).filter((arg) => arg !== '--write');
if (unexpected.length > 0) throw new Error(`不明な引数です: ${unexpected.join(', ')}`);

const startMarker = '/* @brand-tokens-start */';
const endMarker = '/* @brand-tokens-end */';
const css = await readFile(cssFile, 'utf8');
const start = css.indexOf(startMarker);
const end = css.indexOf(endMarker);
if (start === -1 || end === -1 || end <= start) {
  throw new Error('src/css/custom.css にトークンブロックがありません。');
}
const block = css.slice(start, end);

// ブロック内の2つの規則（ライト・ダーク）を範囲で取り出す
function ruleRange(selector) {
  const head = block.indexOf(`${selector} {`);
  if (head === -1) throw new Error(`トークンブロックに ${selector} の規則がありません。`);
  return [head, block.indexOf('}', head) + 1];
}
const ranges = {light: ruleRange(':root'), dark: ruleRange("[data-theme='dark']")};

function readToken(mode, name) {
  const rule = block.slice(...ranges[mode]).replace(/\/\*[\s\S]*?\*\//g, '');
  const value = rule.match(new RegExp(`--${name}\\s*:\\s*([^;]+);`))?.[1].trim();
  if (value === undefined) throw new Error(`${mode === 'light' ? ':root' : "[data-theme='dark']"} に --${name} がありません。`);
  if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`--${name} は #rrggbb で書いてください: ${value}`);
  return value.toLowerCase();
}

const toRgb = (hex) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
const toHex = (rgb) => `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`;
const mix = (hex, target, amount) => toHex(toRgb(hex).map((channel) => channel + (target - channel) * amount));

function steps(accent) {
  return {
    'dt-accent-dark': mix(accent, 0, 0.1),
    'dt-accent-darker': mix(accent, 0, 0.15),
    'dt-accent-darkest': mix(accent, 0, 0.3),
    'dt-accent-light': mix(accent, 255, 0.15),
    'dt-accent-lighter': mix(accent, 255, 0.3),
    'dt-accent-lightest': mix(accent, 255, 0.5),
  };
}

const light = {accent: readToken('light', 'dt-accent'), soft: readToken('light', 'dt-accent-soft')};
const dark = {accent: readToken('dark', 'dt-accent'), soft: readToken('dark', 'dt-accent-soft')};
const lightSteps = steps(light.accent);
const darkSteps = steps(dark.accent);
const derived = {
  light: {
    ...lightSteps,
    'dt-info': light.accent, // 注記の info・決定の線は主色。ダークでも上書きしない
    'dt-info-soft': light.soft,
    'dt-status-review': lightSteps['dt-accent-dark'],
    'dt-code-highlight': `rgb(${toRgb(light.accent).join(' ')} / 12%)`,
  },
  dark: {
    ...darkSteps,
    'dt-info-soft': dark.soft,
    'dt-status-review': darkSteps['dt-accent-light'],
  },
};

let nextBlock = block;
for (const mode of ['dark', 'light']) {
  // 後ろの規則から置き換えて、前の規則の位置がずれないようにする
  const [from, to] = ranges[mode];
  let rule = nextBlock.slice(from, to);
  console.log(mode === 'light' ? ':root（ライト）' : "[data-theme='dark']（ダーク）");
  for (const [name, value] of Object.entries(derived[mode])) {
    const pattern = new RegExp(`(--${name}\\s*:\\s*)([^;]+)(;)`);
    const current = rule.match(pattern)?.[2].trim();
    if (current === undefined) throw new Error(`${mode} の規則に --${name} がありません。`);
    console.log(`  --${name}: ${current}${current === value ? '' : ` → ${value}`}`);
    rule = rule.replace(pattern, `$1${value}$3`);
  }
  nextBlock = nextBlock.slice(0, from) + rule + nextBlock.slice(to);
}

if (write) {
  await writeFile(cssFile, css.slice(0, start) + nextBlock + css.slice(end));
  console.log('src/css/custom.css に書き込みました。npm run build:mermaid と npm run check を実行してください。');
} else {
  console.log('（表示だけです。書き込むには --write を付けます）');
}
