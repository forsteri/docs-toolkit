// One-pager の検査スクリプト。依存パッケージなし（Node.js 20 以上）。
// theme.css が「大きく、少なく、濃く」の方針を守っていること、
// template.html と examples/*.html が用意した部品だけで組まれていることを確認する。
import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(scriptDirectory, "..");
const repositoryDirectory = path.resolve(rootDirectory, "..");

// 方針を数値で固定する。緩めるときは README の原則も合わせて見直す。
const MIN_FONT_PX = 18; // 文字サイズの下限
const MAX_TEXT_LENGTH = 1000; // 1枚あたりの本文文字数（タグ・空白を除く）
const MAX_SECTIONS = 4; // section の上限
const MAX_CALLOUTS = 1; // callout の上限
const MAX_KEYS = 2; // key の上限
const FLOW_ITEMS = [3, 5]; // flow の項目数

const failures = [];
const report = (ok, message) => {
  console.log(`${ok ? "ok  " : "NG  "} ${message}`);
  if (!ok) failures.push(message);
};

const css = await readFile(path.join(rootDirectory, "theme.css"), "utf8");
const readme = await readFile(path.join(rootDirectory, "README.md"), "utf8");
const neutral = JSON.parse(
  await readFile(path.join(repositoryDirectory, "diagrams/themes/neutral.json"), "utf8"),
).themeVariables;

// ------------------------------------------------------------
// theme.css
// ------------------------------------------------------------
console.log("theme.css");

report(!/url\(/.test(css), "url( 参照がない（外部資産を持たない）");
report(!/@import|@font-face/.test(css), "@import / @font-face がない");

// 色は文書系（diagrams neutral = Docusaurus / Pandoc）と同じ値
const tokenValue = (name) => css.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1].trim();
for (const [token, variable] of [
  ["--op-primary", "primaryBorderColor"],
  ["--op-primary-soft", "primaryColor"],
  ["--op-text", "textColor"],
  ["--op-heading", "titleColor"],
  ["--op-line", "secondaryBorderColor"],
  ["--op-surface", "secondaryColor"],
]) {
  report(
    tokenValue(token) === neutral[variable],
    `${token} が neutral.json の ${variable} と一致 (${tokenValue(token)} / ${neutral[variable]})`,
  );
}

// 文字サイズ: font-size と --op-size-* に現れる px をすべて確認する
const sizeDeclarations = [...css.matchAll(/(?:font-size|--op-size-[a-z]+)\s*:\s*([^;]+);/g)].map(
  (match) => match[1].trim(),
);
const pxValues = sizeDeclarations.flatMap((value) =>
  [...value.matchAll(/(\d+(?:\.\d+)?)px/g)].map((match) => Number(match[1])),
);
const minPx = Math.min(...pxValues);
report(pxValues.length > 0 && minPx >= MIN_FONT_PX, `font-size の最小値が ${MIN_FONT_PX}px 以上 (最小: ${minPx}px)`);
const relativeSizes = sizeDeclarations.filter((value) => /\d(em|rem|%|pt)\b/.test(value));
report(
  relativeSizes.length === 0,
  `font-size は px / inherit / --op-size-* だけ (相対指定: ${relativeSizes.join(", ") || "なし"})`,
);

// 文字色: 濃い色のトークンだけ。薄い文字用トークンを持たない
const allowedColors = new Set([
  "var(--op-text)",
  "var(--op-heading)",
  "var(--op-primary)",
  "var(--op-primary-strong)",
  "var(--op-white)",
  "inherit",
  "currentcolor",
]);
const colorDeclarations = [...css.matchAll(/(?<![\w-])color\s*:\s*([^;]+);/g)].map((match) =>
  match[1].trim().toLowerCase(),
);
const disallowedColors = colorDeclarations.filter((value) => !allowedColors.has(value));
report(
  disallowedColors.length === 0,
  `文字色は濃いトークンだけ (違反: ${disallowedColors.join(", ") || "なし"})`,
);
report(
  !/--op-(muted|gray|grey|subtle|caption|meta|note)\b/.test(css),
  "薄い文字用のトークン（muted / gray / caption / meta など）を定義していない",
);
report(!/opacity\s*:/.test(css), "opacity で文字を薄くしていない");

// 部品の一覧（README との整合と、HTML 側の未定義クラス検出に使う）
const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
const definedClasses = new Set(
  [...cssWithoutComments.matchAll(/\.([a-z][a-z0-9-]*)/g)].map((match) => match[1]),
);
const forbiddenClasses = [
  "eyebrow",
  "kicker",
  "subtitle",
  "badge",
  "label",
  "meta",
  "caption",
  "footer",
  "muted",
  "small",
  "note",
];
const foundForbidden = forbiddenClasses.filter((name) => definedClasses.has(name));
report(
  foundForbidden.length === 0,
  `補助文字用のクラスを定義していない (検出: ${foundForbidden.join(", ") || "なし"})`,
);
for (const name of [...definedClasses].sort()) {
  report(readme.includes(`.${name}`), `README が .${name} を説明している`);
}

// ------------------------------------------------------------
// template.html / examples/*.html
// ------------------------------------------------------------
const htmlFiles = [
  "template.html",
  ...(await readdir(path.join(rootDirectory, "examples")))
    .filter((name) => name.endsWith(".html"))
    .sort()
    .map((name) => `examples/${name}`),
];
report(htmlFiles.length >= 3, `template.html と examples/*.html が見つかる (${htmlFiles.length}件)`);

const classCount = (html, name) =>
  [...html.matchAll(/class="([^"]*)"/g)].filter((match) => match[1].split(/\s+/).includes(name)).length;

for (const file of htmlFiles) {
  console.log(`\n${file}`);
  const filePath = path.join(rootDirectory, file);
  const html = await readFile(filePath, "utf8");
  const count = (pattern) => (html.match(pattern) ?? []).length;

  report(
    /<link rel="stylesheet" href="(\.\.\/)?theme\.css">/.test(html),
    "theme.css を link で参照している",
  );
  report(count(/<script\b/gi) === 0, "script タグがない（HTML + CSS だけで完結）");
  report(count(/<style\b/gi) === 0, "style タグがない（独自CSSを足していない）");
  report(count(/\sstyle="/gi) === 0, "style 属性がない");
  report(count(/<(small|font|sub|sup)\b/gi) === 0, "small / font / sub / sup がない");
  report(count(/<h1\b/gi) === 1, "h1 が1つ");
  report(classCount(html, "hero") === 1, "hero が1つ");

  const hero = html.match(/<header class="hero">[\s\S]*?<\/header>/)?.[0] ?? "";
  report(classCount(hero, "lead") === 1, "hero に lead が1つ");

  const sections = classCount(html, "section");
  report(sections >= 1 && sections <= MAX_SECTIONS, `section が1〜${MAX_SECTIONS}個 (${sections})`);
  report(count(/<h2\b/gi) === sections, "h2 の数が section の数と一致");
  report(classCount(html, "callout") <= MAX_CALLOUTS, `callout が${MAX_CALLOUTS}つ以下`);
  report(classCount(html, "key") <= MAX_KEYS, `key が${MAX_KEYS}つ以下`);

  const usedClasses = [...html.matchAll(/class="([^"]*)"/g)].flatMap((match) =>
    match[1].split(/\s+/).filter(Boolean),
  );
  const unknownClasses = [...new Set(usedClasses.filter((name) => !definedClasses.has(name)))];
  report(
    unknownClasses.length === 0,
    `theme.css にないクラスを使っていない (検出: ${unknownClasses.join(", ") || "なし"})`,
  );

  for (const block of html.matchAll(/<ol class="flow[^"]*">([\s\S]*?)<\/ol>/g)) {
    // 項目内の入れ子リストは数えない
    const directItems = block[1].replace(/<ul\b[\s\S]*?<\/ul>/g, "");
    const items = (directItems.match(/<li\b/g) ?? []).length;
    report(
      items >= FLOW_ITEMS[0] && items <= FLOW_ITEMS[1],
      `flow の項目数が${FLOW_ITEMS[0]}〜${FLOW_ITEMS[1]} (${items})`,
    );
  }

  // 相対パスの画像が存在すること
  for (const match of html.matchAll(/\ssrc="([^"]+)"/g)) {
    const source = match[1];
    if (/^(https?:|data:)/.test(source)) continue;
    let exists = true;
    try {
      await access(path.resolve(path.dirname(filePath), source));
    } catch {
      exists = false;
    }
    report(exists, `画像が存在する: ${source}`);
  }

  // 文字量: 収まらないなら文字を縮めずに削る
  const text = html
    .replace(/<head>[\s\S]*?<\/head>/i, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, "");
  report(
    text.length <= MAX_TEXT_LENGTH,
    `本文の文字量が${MAX_TEXT_LENGTH.toLocaleString()}字以下 (${text.length.toLocaleString()}字)`,
  );
}

if (failures.length > 0) {
  console.error(`\n${failures.length}件の検査に失敗しました。`);
  process.exit(1);
}

console.log("\nすべての検査を通過しました。");
