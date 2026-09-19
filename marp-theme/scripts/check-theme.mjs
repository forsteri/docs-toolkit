// forsteri テーマの検査スクリプト。
// 単一ファイルの forsteri.css が自己完結していること、会社固有の語が残っていないこと、
// examples/ のすべてのサンプルが Marp CLI で変換できることを確認する。
import { spawnSync } from "node:child_process";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootDirectory = path.resolve(scriptDirectory, "..");
const themePath = path.join(rootDirectory, "themes/forsteri/forsteri.css");
const examplesDirectory = path.join(rootDirectory, "examples");

const failures = [];
const report = (ok, message) => {
  console.log(`${ok ? "ok  " : "NG  "} ${message}`);
  if (!ok) failures.push(message);
};

const countMatches = (text, pattern) => (text.match(pattern) ?? []).length;

// (a)〜(d): テーマ CSS の静的検査
const css = await readFile(themePath, "utf8");

const themeDeclarations = countMatches(css, /\/\*\s*@theme forsteri\s*\*\//g);
report(themeDeclarations === 1, `@theme forsteri の宣言が1回 (実際: ${themeDeclarations})`);

const tokenStart = countMatches(css, /@forsteri-shared-tokens-start/g);
const tokenEnd = countMatches(css, /@forsteri-shared-tokens-end/g);
report(
  tokenStart === 1 && tokenEnd === 1,
  `共有トークンマーカーが1組 (start: ${tokenStart}, end: ${tokenEnd})`,
);

const urlReferences = countMatches(css, /url\(/g);
report(urlReferences === 0, `url( 参照が0件 (実際: ${urlReferences})`);

// 旧テーマ由来の語。このファイル自体が最終確認の grep に引っかからないよう、語を分割して保持する。
const forbiddenWords = [
  "toy" + "obo",
  "東洋" + "紡",
  "lo" + "go",
  "slo" + "gan",
  "exter" + "nal",
  "solu" + "tion",
  "pv" + "vs",
];
const foundWords = forbiddenWords.filter((word) =>
  css.toLowerCase().includes(word.toLowerCase()),
);
report(foundWords.length === 0, `禁止語が0件 (検出: ${foundWords.join(", ") || "なし"})`);

// 未定義のカスタムプロパティ参照がないこと
const defined = new Set([...css.matchAll(/(--forsteri-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
const referenced = new Set([...css.matchAll(/var\((--forsteri-[a-z0-9-]+)/g)].map((m) => m[1]));
const undefinedVariables = [...referenced].filter((name) => !defined.has(name));
report(
  undefinedVariables.length === 0,
  `未定義の --forsteri-* 参照が0件 (検出: ${undefinedVariables.join(", ") || "なし"})`,
);

// (e): examples/*.md を Marp CLI で変換
const exampleFiles = (await readdir(examplesDirectory))
  .filter((name) => name.endsWith(".md"))
  .sort();
report(exampleFiles.length > 0, `examples/*.md が見つかる (${exampleFiles.length}件)`);

const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "forsteri-marp-check-"));
const marpBinary = path.join(
  rootDirectory,
  "node_modules/.bin",
  process.platform === "win32" ? "marp.cmd" : "marp",
);

try {
  for (const file of exampleFiles) {
    const input = path.join(examplesDirectory, file);
    const output = path.join(temporaryDirectory, `${path.basename(file, ".md")}.html`);
    const result = spawnSync(
      marpBinary,
      ["--theme", themePath, "--allow-local-files", "-o", output, input],
      { cwd: rootDirectory, encoding: "utf8" },
    );
    const ok = result.status === 0;
    report(ok, `examples/${file} を HTML へ変換`);
    if (!ok) {
      console.error(result.stdout);
      console.error(result.stderr);
    }
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}

if (failures.length > 0) {
  console.error(`\n${failures.length}件の検査に失敗しました。`);
  process.exit(1);
}

console.log("\nすべての検査を通過しました。");
