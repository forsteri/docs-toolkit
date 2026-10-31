// src/css/custom.css のブランドトークン検査。依存パッケージなし（Node.js 20 以上）。
// 色とフォントの値は @brand-tokens-start〜end ブロックだけに書き、
// 本体と部品は役割名（--dt-*）だけを参照していることを確認する。
// 使い方: npm run check
import {readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  makeNeutralTheme,
  outputFile,
  parseLightTokens,
  renderNeutralTheme,
  tokenReader,
} from './build-mermaid-theme.mjs';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const failures = [];
const report = (ok, message) => {
  console.log(`${ok ? 'ok  ' : 'NG  '} ${message}`);
  if (!ok) failures.push(message);
};
const list = (items) => items.join(', ') || 'なし';

const css = await readFile(path.join(rootDirectory, 'src/css/custom.css'), 'utf8');

const blockPattern = /\/\* @brand-tokens-start \*\/([\s\S]*?)\/\* @brand-tokens-end \*\//;
const markers = {
  start: (css.match(/@brand-tokens-start/g) ?? []).length,
  end: (css.match(/@brand-tokens-end/g) ?? []).length,
};
report(
  markers.start === 1 && markers.end === 1,
  `@brand-tokens-start / end が1組だけある (start: ${markers.start}, end: ${markers.end})`,
);

const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, '');
const tokenBlock = stripComments(css.match(blockPattern)?.[1] ?? '');
const outside = stripComments(css.replace(blockPattern, ''));

// ブロックは :root（ライト）と [data-theme='dark']（ダーク）の2つの規則だけ
const selectors = [...tokenBlock.matchAll(/([^{}]+)\{/g)].map((match) => match[1].trim());
report(
  selectors.join(' | ') === ":root | [data-theme='dark']",
  `ブロックの規則は :root と [data-theme='dark'] だけ (検出: ${list(selectors)})`,
);

const declarations = (selector) => {
  const body = tokenBlock.match(new RegExp(`${selector.replace(/[[\]]/g, '\\$&')}\\s*\\{([^}]*)\\}`))?.[1] ?? '';
  return new Map([...body.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((match) => [match[1], match[2].trim()]));
};
const light = declarations(':root');
const dark = declarations("[data-theme='dark']");
report(light.size > 0, `トークンブロックに --dt-* が定義されている (ライト ${light.size}件、ダーク ${dark.size}件)`);

const otherDefinitions = [...light.keys(), ...dark.keys()].filter((name) => !name.startsWith('--dt-'));
report(otherDefinitions.length === 0, `ブロックには --dt-* だけを定義している (検出: ${list(otherDefinitions)})`);

const darkOnly = [...dark.keys()].filter((name) => !light.has(name));
report(darkOnly.length === 0, `ダークで上書きするトークンはライトにもある (ダークだけ: ${list(darkOnly)})`);

const tokensWithVar = [...light, ...dark].filter(([, value]) => /var\(/.test(value)).map(([name]) => name);
report(tokensWithVar.length === 0, `トークンの値に var() を使っていない (検出: ${list(tokensWithVar)})`);

const strayDefinitions = [...outside.matchAll(/(--dt-[a-z0-9-]+)\s*:/g)].map((match) => match[1]);
report(strayDefinitions.length === 0, `--dt-* をブロックの外で定義していない (検出: ${list(strayDefinitions)})`);

const referenced = new Set([...outside.matchAll(/var\((--dt-[a-z0-9-]+)/g)].map((match) => match[1]));
const undefinedTokens = [...referenced].filter((name) => !light.has(name));
report(undefinedTokens.length === 0, `未定義の --dt-* を参照していない (検出: ${list(undefinedTokens)})`);

// Mermaidテーマの生成に使うトークンも「使用中」に数える
const usedByMermaid = new Set();
makeNeutralTheme(tokenReader(parseLightTokens(css), usedByMermaid));
const unusedTokens = [...light.keys()].filter((name) => !referenced.has(name) && !usedByMermaid.has(name));
report(unusedTokens.length === 0, `定義した --dt-* はすべて本体かMermaidテーマで使っている (未使用: ${list(unusedTokens)})`);

const colorPattern =
  /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix)\(|(?<![\w-])(?:white|black)(?![\w-])/g;
const strayColors = [...new Set(outside.match(colorPattern) ?? [])];
report(strayColors.length === 0, `トークンブロックの外に色の直書きがない (検出: ${list(strayColors)})`);

const strayFonts = [...outside.matchAll(/(?:font-family|--ifm-font-family-[a-z]+)\s*:\s*([^;]+);/g)]
  .map((match) => match[1].trim())
  .filter((value) => !/^var\(--dt-font-[a-z0-9-]+\)$/.test(value) && value !== 'inherit');
report(strayFonts.length === 0, `フォント指定は --dt-font-* だけを参照している (検出: ${list(strayFonts)})`);

// 分割前から使っていたテンプレート独自の変数名
const legacyPattern = /--doc-(?:muted|sidebar-bg|code-bg)\b|--forsteri-[a-z0-9-]+/g;
const legacy = [...new Set(css.match(legacyPattern) ?? [])];
report(legacy.length === 0, `src/css/custom.css に旧トークン名がない (検出: ${list(legacy)})`);

// 部品（JS/JSX）に色を直書きしない。スタイルはCSSのクラスで当てる
async function walk(directory) {
  const entries = await readdir(directory, {withFileTypes: true});
  const files = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(target) : [target];
    }),
  );
  return files.flat();
}
const componentFiles = (await walk(path.join(rootDirectory, 'src'))).filter((file) => /\.(?:jsx?|tsx?)$/.test(file));
const componentColors = [];
for (const file of componentFiles) {
  const text = await readFile(file, 'utf8');
  for (const color of new Set(text.match(colorPattern) ?? [])) {
    componentColors.push(`${path.relative(rootDirectory, file)}: ${color}`);
  }
}
report(componentColors.length === 0, `src/ の部品に色の直書きがない (検出: ${list(componentColors)})`);

const actualTheme = await readFile(outputFile, 'utf8').catch(() => '');
report(
  actualTheme === (await renderNeutralTheme()),
  'assets/mermaid/neutral.json がトークンと同期している（ずれていたら npm run build:mermaid）',
);

if (failures.length > 0) {
  console.error(`\n${failures.length}件の検査に失敗しました。`);
  process.exit(1);
}
console.log('\nすべての検査に合格しました。');
