// 各テンプレートのトークンブロックの値で、文字と背景のコントラスト比を確かめる。依存なし、Node.js 20以上。
//
// 使い方: node brand/contrast.mjs [--min <比>] [--skip <役割名>]... <テンプレートのCSS>...
//   apply.mjs で当てたあとのファイルを渡す。文字の基準は既定 4.5（WCAG 2.x の AA。文字の大きさによる緩和は使わない。
//   デジタル庁デザインシステムも同じ扱い）、注記の左線のような文字でない部品は 3。
//   基準を下回る組み合わせがあれば一覧にして終了コード1。
//   --skip は前景の役割名（--dt- を除いた名前）を検査から外す。分かっていて残す組み合わせに使う。
//
// 見るのは、前景として使う役割名と、それが載る面の組み合わせだけ（下の pairs）。
// どちらかの名前がブロックに無い組み合わせは飛ばす。装飾の罫線（line）や系列色は見ない。
// ブロック内の [data-theme='dark'] { } の規則（Docusaurus）は、ライトの値にダークの値を重ねて別に見る。
import {readFileSync} from 'node:fs';

const startMarker = '/* @brand-tokens-start */';
const endMarker = '/* @brand-tokens-end */';
const darkSelector = "[data-theme='dark']";
const usage = '使い方: node brand/contrast.mjs [--min <比>] [--skip <役割名>]... <テンプレートのCSS>...';

// [前景, 面, 基準]。基準 'text' は文字（--min、既定 4.5）、'ui' は罫線・注記の左線など文字でない部品（3、WCAG 1.4.11）。
// 前景の役割名は、どのテンプレートでもその面の上の文字（または部品）として使われているものだけを並べる
const text = (fg, bg) => [fg, bg, 'text'];
const ui = (fg, bg) => [fg, bg, 'ui'];
const pairs = [
  ...['heading', 'text', 'text-soft', 'text-muted', 'text-subtle', 'accent', 'accent-strong'].map((fg) => text(fg, 'bg')),
  text('text', 'surface'), text('text-muted', 'surface'),
  text('accent', 'accent-soft'), text('accent-strong', 'accent-soft'),
  text('header-text', 'header-bg'), text('header-text-muted', 'header-bg'),
  text('code-text', 'code-bg'), text('code-block-text', 'code-block-bg'),
  text('status-draft', 'status-draft-soft'), text('status-review', 'accent-soft'),
  text('status-approved', 'status-approved-soft'), text('status-deprecated', 'danger-soft'),
  // 注記の状態色は左線などの部品にだけ使う
  ...['success', 'warning', 'danger', 'info'].map((fg) => ui(fg, 'bg')),
  // スライドの Night（ダーク）
  ...['night-text', 'night-text-muted', 'night-text-soft', 'night-accent'].map((fg) => text(fg, 'night-bg')),
  ...['night-text', 'night-text-muted', 'night-accent'].map((fg) => text(fg, 'night-surface')),
];
// 塗りの面に載せる文字。Docusaurus では Mermaid の設定（ライトの値から作る）にだけ使うので、ダークでは見ない
const lightOnly = [text('on-accent', 'accent')];

const args = process.argv.slice(2);
let min = 4.5;
const skip = new Set();
const files = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--min') min = Number(args[++i]);
  else if (args[i] === '--skip') skip.add(String(args[++i]).replace(/^--dt-/, ''));
  else if (args[i].startsWith('--')) throw new Error(`不明な引数です: ${args[i]}`);
  else files.push(args[i]);
}
if (files.length === 0 || !(min > 1)) {
  console.error(usage);
  process.exit(2);
}

// 宣言を読む。同名は最初のものを使う（apply.mjs がライトの値を当てる先と同じ）
function declarations(text) {
  const map = new Map();
  for (const m of text.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/--dt-([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    if (!map.has(m[1])) map.set(m[1], m[2].replace(/\s+/g, ' ').trim());
  }
  return map;
}

// 色を [r, g, b]（0〜255）にする。#rgb・#rrggbb・rgb()・「R G B」の並び・var(--dt-*) を読む。読めなければ null
function parseColor(value, tokens, depth = 0) {
  if (!value || depth > 8) return null;
  value = value.replace(/var\(--dt-([a-z0-9-]+)\)/g, (_, name) => tokens.get(name) ?? '?').trim();
  let m = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (m) {
    const hex = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
    return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
  }
  m = value.match(/^rgb\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*\)$/i) ?? value.match(/^(\d+)\s+(\d+)\s+(\d+)$/);
  if (m) return [m[1], m[2], m[3]].map(Number);
  return null;
}

function luminance(rgb) {
  const [r, g, b] = rgb.map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

let failed = 0;
for (const file of files) {
  const css = readFileSync(file, 'utf8');
  const s = css.indexOf(startMarker);
  const e = css.indexOf(endMarker);
  if (s < 0 || e < 0 || e < s) throw new Error(`${file}: トークンブロックがありません`);
  const block = css.slice(s, e);

  const modes = [{label: '', tokens: declarations(block), pairs: [...pairs, ...lightOnly]}];
  const head = block.indexOf(`${darkSelector} {`);
  if (head >= 0) {
    const rule = block.slice(head, block.indexOf('}', head) + 1);
    // ライトの値（規則の外の最初の宣言）にダークの規則の値を重ねる
    const light = declarations(block.slice(0, head) + block.slice(head + rule.length));
    modes[0].tokens = light;
    modes.push({label: 'ダーク ', tokens: new Map([...light, ...declarations(rule)]), pairs});
  }

  let checked = 0;
  const low = [];
  for (const {label, tokens, pairs: list} of modes) {
    for (const [fg, bg, kind] of list) {
      if (skip.has(fg)) continue;
      const a = parseColor(tokens.get(fg), tokens);
      const b = parseColor(tokens.get(bg), tokens);
      if (!a || !b) continue;
      checked++;
      const r = ratio(a, b);
      const need = kind === 'text' ? min : 3;
      if (r < need) low.push(`  ${label}--dt-${fg} ${tokens.get(fg)} / --dt-${bg} ${tokens.get(bg)}: ${r.toFixed(2)}（基準 ${need}）`);
    }
  }
  console.log(`${file}: ${checked}組中 ${low.length}組が基準未満`);
  for (const line of low) console.log(line);
  failed += low.length;
}
if (failed > 0) process.exit(1);
