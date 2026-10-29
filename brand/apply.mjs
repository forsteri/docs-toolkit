// ブランド値のファイルを、各テンプレートの @brand-tokens ブロック内の同名トークンへ書き込む。
// 依存なし、Node.js 20以上。
//
// 使い方: node brand/apply.mjs [--tokens <file>] [--dark-tokens <file>] [--check] <テンプレートのCSS>...
//   --tokens       ライトの値。省略時はこのスクリプトと同じフォルダの tokens.css
//   --dark-tokens  Docusaurus のダークの値。省略時はライトの値と同じフォルダの tokens.dark.css（無ければ使わない）
//   --check        書き込まず、値が違うトークンを表示する。違いがあれば終了コード1
//
// ブランド値のファイルは、どちらも規則で囲まない宣言の並びで書く（diagrams の --tokens と同じ形）。
// - ライトの値は、ブロック内で最初に現れる同名の宣言へ当てる。
// - ダークの値は、ブロック内の [data-theme='dark'] { } の規則へ当てる。この規則を持たないテンプレートでは使わない。
// - テンプレートのブロックに無い名前は無視する。どのファイルにも無い名前は警告する（綴りの誤りの検出用）。
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const startMarker = '/* @brand-tokens-start */';
const endMarker = '/* @brand-tokens-end */';
const darkSelector = "[data-theme='dark']";
const usage = '使い方: node brand/apply.mjs [--tokens <file>] [--dark-tokens <file>] [--check] <テンプレートのCSS>...';

const args = process.argv.slice(2);
const options = {};
const files = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--check') options.check = true;
  else if (args[i] === '--tokens' || args[i] === '--dark-tokens') {
    if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`${args[i]} にファイルを指定してください`);
    options[args[i]] = path.resolve(args[++i]);
  } else if (args[i].startsWith('--')) throw new Error(`不明な引数です: ${args[i]}`);
  else files.push(args[i]);
}
if (files.length === 0) {
  console.error(usage);
  process.exit(2);
}
const lightFile = options['--tokens'] ?? path.join(path.dirname(fileURLToPath(import.meta.url)), 'tokens.css');
const darkFile = options['--dark-tokens'] ?? path.join(path.dirname(lightFile), 'tokens.dark.css');

// 規則で囲まない宣言の並びを読む。規則があると diagrams の --tokens が同名を後勝ちで読んでしまうので受け付けない
function readTokens(file) {
  const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  if (css.includes('{')) {
    throw new Error(`${file}: 規則（{ }）を書かず、宣言だけを並べてください。ダークの値は tokens.dark.css に分けます`);
  }
  const map = new Map();
  for (const m of css.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) map.set(m[1], m[2].replace(/\s+/g, ' ').trim());
  if (map.size === 0) throw new Error(`${file}: トークンの宣言がありません`);
  return map;
}

// text の中で最初に現れる --name の宣言の値を value にする。差し替えた結果と、元の値を返す
function replaceFirst(text, name, value) {
  const re = new RegExp(`((?<![\\w-])--${name}\\s*:\\s*)([^;]+)(;)`);
  const m = text.match(re);
  if (!m) return null;
  const before = m[2].replace(/\s+/g, ' ').trim();
  return {text: text.replace(re, `$1${value}$3`), before};
}

// 当てる先: selector が null ならブロック全体の最初の宣言、文字列ならその規則の中
const groups = [{selector: null, label: '', tokens: readTokens(lightFile)}];
if (options['--dark-tokens'] || existsSync(darkFile)) {
  groups.push({selector: darkSelector, label: 'ダーク ', tokens: readTokens(darkFile)});
}
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

  for (const {selector, label, tokens} of groups) {
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
      used.add(label + name);
      applied.push(label + name);
      if (result.before !== value) changed.push(`  ${label}--${name}: ${result.before} → ${value}`);
      rule = result.text;
    }
    block = block.slice(0, head) + rule + block.slice(tail);
  }

  if (options.check) {
    console.log(`${file}: ${applied.length}件中 ${changed.length}件が違います`);
    for (const line of changed) console.log(line);
    if (changed.length > 0) differs = true;
  } else {
    if (changed.length > 0) writeFileSync(file, css.slice(0, s) + block + css.slice(e));
    console.log(`${file}: ${applied.length}件を当て、${changed.length}件を変更`);
  }
}

for (const {label, tokens} of groups) {
  for (const name of tokens.keys()) {
    if (!used.has(label + name)) console.warn(`警告: ${label}--${name} はどのファイルのトークンブロックにもありません`);
  }
}
if (differs) process.exit(1);
