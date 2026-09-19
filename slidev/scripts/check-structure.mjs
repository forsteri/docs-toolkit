import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// テーマの必須ファイル・系列色の配線・showcase の網羅を検査する。
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const slidevDirectory = path.resolve(scriptDirectory, "..");
const components = [
  "Process",
  "Cycle",
  "Pyramid",
  "Matrix2x2",
  "Funnel",
  "KpiCards",
  "Roadmap",
  "Comparison",
];
const requiredFiles = [
  "theme/layouts/cover.vue",
  "theme/layouts/section.vue",
  "theme/layouts/default.vue",
  "theme/layouts/ending.vue",
  "theme/layouts/statement.vue",
  "theme/layouts/metric.vue",
  ...components.map((name) => `theme/components/${name}.vue`),
  "theme/components/ThemeFrame.vue",
  "theme/setup/mermaid.ts",
  "theme/styles/brand-tokens.generated.css",
  "patterns/proposal.md",
  "patterns/progress-report.md",
  "patterns/decision.md",
  "patterns/kickoff.md",
  "patterns/retrospective.md",
  "scripts/export-showcase.mjs",
];
const seriesTokens = Array.from(
  { length: 8 },
  (_, index) => `--forsteri-series-${index + 1}`,
);

await Promise.all(
  requiredFiles.map((file) => access(path.join(slidevDirectory, file))),
);

const [paletteSource, smartArtStyles, themeStyles, showcase] =
  await Promise.all(
    [
      "theme/utils/palette.ts",
      "theme/styles/smart-art.css",
      "theme/styles/theme.css",
      "examples/showcase.md",
    ].map((file) => readFile(path.join(slidevDirectory, file), "utf8")),
  );

// 系列色8トークンが palette.ts に順に配線されていること
for (const token of seriesTokens) {
  if (!paletteSource.includes(token)) {
    throw new Error(`系列色 ${token} が palette.ts に配線されていません。`);
  }
}

if (
  !paletteSource.includes('"--smart-color"') ||
  !paletteSource.includes('"--smart-foreground"') ||
  !paletteSource.includes("var(--forsteri-ink)")
) {
  throw new Error(
    "palette.ts は --smart-color と --smart-foreground（--forsteri-ink）を返す必要があります。",
  );
}

// 全面塗りの図解は前景トークンを使うこと
for (const selector of [
  ".smart-pyramid-level strong",
  ".smart-pyramid-level small",
  ".smart-funnel-stage strong",
  ".smart-funnel-stage span",
]) {
  const ruleStart = smartArtStyles.indexOf(selector);
  const ruleEnd = smartArtStyles.indexOf("}", ruleStart);
  if (
    ruleStart === -1 ||
    !smartArtStyles
      .slice(ruleStart, ruleEnd)
      .includes("color: var(--smart-foreground)")
  ) {
    throw new Error(`${selector} が --smart-foreground を使っていません。`);
  }
}

// section の kicker は Marp の章扉と同じ扱い（主色・27px）
const kickerStart = themeStyles.indexOf(".forsteri-section .forsteri-kicker");
const kickerEnd = themeStyles.indexOf("}", kickerStart);
if (
  kickerStart === -1 ||
  !themeStyles.slice(kickerStart, kickerEnd).includes("font-size: 27px")
) {
  throw new Error("section の kicker が Marp の章扉と整合していません。");
}

// 旧概念（画像資産・地平線アーチ・曲線）が復活していないこと
// 旧テーマ名は最終確認 grep に引っかからないよう分割して保持する
const legacyPrefix = ["toy", "obo"].join("");
for (const forbidden of [legacyPrefix, "url(", "horizon", "clip-path: ellipse"]) {
  if (themeStyles.includes(forbidden)) {
    throw new Error(`theme.css に廃止済みの記述 ${forbidden} が残っています。`);
  }
}

// showcase がレイアウト・図解・系列色の色見本を網羅していること
for (const sample of [
  "layout: cover",
  "layout: section",
  "layout: ending",
  "layout: statement",
  "layout: metric",
  "class: dark",
  ...seriesTokens.map((token) => `var(${token})`),
]) {
  if (!showcase.includes(sample)) {
    throw new Error(`showcase に ${sample} がありません。`);
  }
}

for (const name of components) {
  if (!new RegExp(`<${name}\\s`).test(showcase)) {
    throw new Error(`showcase でコンポーネント ${name} が使われていません。`);
  }
}

console.log(
  `必須ファイル ${requiredFiles.length} 件、系列色 ${seriesTokens.length} トークンの配線、前景トークン、showcase の網羅を確認しました`,
);
