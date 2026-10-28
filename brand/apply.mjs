// ブランド値のファイル（既定は同じフォルダの tokens.css）を、各テンプレートの
// @brand-tokens ブロック内の同名トークンへ書き込む。依存なし、Node.js 20以上。
//
// 使い方: node brand/apply.mjs [--tokens <file>] [--check] <テンプレートのCSS>...
//   --tokens  ブランド値のファイル。省略時はこのスクリプトと同じフォルダの tokens.css
//   --check   書き込まず、値が違うトークンを表示する。違いがあれば終了コード1
//
// ブランド値のファイルの書き方:
// - 規則の外（または :root { } の中）の宣言は、ブロック内で最初に現れる同名の宣言（ライト側）へ当てる。
// - [data-theme='dark'] { } の中の宣言は、ブロック内の同じセレクタの規則へ当てる（Docusaurus のダーク）。
//   その規則を持たないテンプレートでは無視する。
// - テンプレートのブロックに無い名前は無視する。どのファイルにも無い名前は警告する（綴りの誤りの検出用）。
import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const startMarker = '/* @brand-tokens-start */';
const endMarker = '/* @brand-tokens-end */';

const args = process.argv.slice(2);
const check = args.includes('--check');
const tokensIndex = args.indexOf('--tokens');
const tokensFile = tokensIndex >= 0
  ? path.resolve(args[tokensIndex + 1] ?? '')
  : path.join(path.dirname(fileURLToPath(import.meta.url)), 'tokens.css');
const files = args.filter((arg, i) => arg !== '--check' && (tokensIndex < 0 || (i !== tokensIndex && i !== tokensIndex + 1)));
const unknown = files.filter((arg) => arg.startsWith('--'));
if (tokensIndex >= 0 && !args[tokensIndex + 1]) throw new Error('--tokens にファイルを指定してください');
if (unknown.length > 0) throw new Error(`不明な引数です: ${unknown.join(', ')}`);
if (files.length === 0) {
  console.error('使い方: node brand/apply.mjs [--tokens <file>] [--check] <テンプレートのCSS>...');
  process.exit(2);
}

function declarations(css) {
  const map = new Map();
  for (const m of css.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) map.set(m[1], m[2].replace(/\s+/g, ' ').trim());
  return map;
}

// ブランド値を、当てる先（null はライト側、文字列はセレクタ）ごとに分ける
function readBrand(file) {
  let css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const groups = new Map();
  for (const m of css.matchAll(/([^{};]+)\{([^}]*)\}/g)) {
    const selector = m[1].trim();
    const key = selector === ':root' ? null : selector;
    groups.set(key, new Map([...(groups.get(key) ?? []), ...declarations(m[2])]));
  }
  css = css.replace(/[^{};]+\{[^}]*\}/g, '');
  groups.set(null, new Map([...declarations(css), ...(groups.get(null) ?? [])]));
  if ([...groups.values()].every((g) => g.size === 0)) throw new Error(`${file}: トークンの宣言がありません`);
  return groups;
}

// text の中で最初に現れる --name の宣言の値を value にする。差し替えた結果と、元の値を返す
function replaceFirst(text, name, value) {
  const re = new RegExp(`((?<![\\w-])--${name}\\s*:\\s*)([^;]+)(;)`);
  const m = text.match(re);
  if (!m) return null;
  const before = m[2].replace(/\s+/g, ' ').trim();
  return {text: text.replace(re, `$1${value}$3`), before};
}

const brand = readBrand(tokensFile);
const used = new Set();
let differs = false;

for (const file of files) {
  const css = readFileSync(file, 'utf8');
  const s = css.indexOf(startMarker);
  const e = css.indexOf(endMarker);
  if (s < 0 || e < 0 || e < s) throw new Error(`${file}: トークンブロックがありません`);
  let block = css.slice(s, e);
  const applied = [];
  const changed = [];

  for (const [selector, tokens] of brand) {
    let head = 0;
    let tail = block.length;
    if (selector !== null) {
      head = block.indexOf(`${selector} {`);
      if (head < 0) continue;
      tail = block.indexOf('}', head) + 1;
    }
    let rule = block.slice(head, tail);
    for (const [name, value] of tokens) {
      const result = replaceFirst(rule, name, value);
      if (!result) continue;
      const label = selector === null ? name : `${selector} ${name}`;
      used.add(label);
      applied.push(label);
      if (result.before !== value) changed.push(`  --${label}: ${result.before} → ${value}`);
      rule = result.text;
    }
    block = block.slice(0, head) + rule + block.slice(tail);
  }

  if (check) {
    console.log(`${file}: ${applied.length}件中 ${changed.length}件が違います`);
    for (const line of changed) console.log(line);
    if (changed.length > 0) differs = true;
  } else {
    if (changed.length > 0) writeFileSync(file, css.slice(0, s) + block + css.slice(e));
    console.log(`${file}: ${applied.length}件を当て、${changed.length}件を変更`);
  }
}

for (const [selector, tokens] of brand) {
  for (const name of tokens.keys()) {
    const label = selector === null ? name : `${selector} ${name}`;
    if (!used.has(label)) console.warn(`警告: --${label} はどのファイルのトークンブロックにもありません`);
  }
}
if (differs) process.exit(1);
