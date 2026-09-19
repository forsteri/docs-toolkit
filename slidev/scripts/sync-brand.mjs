import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Marp テーマ forsteri.css の共有トークンブロックを Slidev 用 CSS へ複写する。
// 画像資産は使わないため、同期対象はトークンだけ。
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const slidevDirectory = path.resolve(scriptDirectory, "..");
const repositoryDirectory = path.resolve(slidevDirectory, "..");
const sourcePath = path.join(
  repositoryDirectory,
  "marp-theme/themes/forsteri/forsteri.css",
);
const generatedPath = path.join(
  slidevDirectory,
  "theme/styles/brand-tokens.generated.css",
);
const checkOnly = process.argv.includes("--check");
const unexpectedArguments = process.argv
  .slice(2)
  .filter((argument) => argument !== "--check");

if (unexpectedArguments.length > 0) {
  throw new Error(`不明な引数です: ${unexpectedArguments.join(", ")}`);
}

const startMarker = "/* @forsteri-shared-tokens-start */";
const endMarker = "/* @forsteri-shared-tokens-end */";
const source = await readFile(sourcePath, "utf8");
const startIndex = source.indexOf(startMarker);
const endIndex = source.indexOf(endMarker);

if (
  startIndex < 0 ||
  endIndex < 0 ||
  endIndex <= startIndex ||
  source.indexOf(startMarker, startIndex + startMarker.length) >= 0 ||
  source.indexOf(endMarker, endIndex + endMarker.length) >= 0
) {
  throw new Error(
    "共有トークンのマーカーは開始・終了が1組だけ、この順で存在する必要があります。",
  );
}

const declarations = source
  .slice(startIndex + startMarker.length, endIndex)
  .trim();
const generated = [
  "/* Marp テーマ forsteri.css の共有トークンブロックから生成。 */",
  "/* slidev/ で npm run brand:sync を実行して更新する。直接編集しないこと。 */",
  ":root {",
  declarations,
  "}",
  "",
].join("\n");

if (checkOnly) {
  let current;
  try {
    current = await readFile(generatedPath, "utf8");
  } catch {
    throw new Error("生成済みトークンがありません。npm run brand:sync を実行してください。");
  }
  if (current !== generated) {
    throw new Error("生成済みトークンが古いです。npm run brand:sync を実行してください。");
  }
  console.log("共有ブランドトークンは最新です");
} else {
  await mkdir(path.dirname(generatedPath), { recursive: true });
  await writeFile(generatedPath, generated);
  console.log(`共有ブランドトークンを同期しました: ${path.relative(slidevDirectory, generatedPath)}`);
}
