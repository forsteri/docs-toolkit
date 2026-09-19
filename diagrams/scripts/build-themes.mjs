import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const diagramsDir = path.resolve(scriptDir, '..');
const tokenSource = path.resolve(
  diagramsDir,
  '../marp-theme/themes/forsteri/forsteri.css',
);
const outputFile = path.join(diagramsDir, 'themes/forsteri.json');

const requiredTokens = [
  'forsteri-primary',
  'forsteri-ink',
  'forsteri-gray-700',
  'forsteri-gray-300',
  'forsteri-gray-100',
  'forsteri-primary-soft',
  'forsteri-white',
  'forsteri-font-ja',
  ...Array.from({length: 8}, (_, index) => `forsteri-series-${index + 1}`),
];

function parseSharedTokens(css) {
  const startMarker = '/* @forsteri-shared-tokens-start */';
  const endMarker = '/* @forsteri-shared-tokens-end */';
  const start = css.indexOf(startMarker);
  const end = css.indexOf(endMarker);

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Marp共有トークンのマーカー範囲を検出できません。');
  }

  const block = css.slice(start + startMarker.length, end);
  const tokens = new Map();
  const pattern = /--([a-z0-9-]+)\s*:\s*([\s\S]*?);/g;

  for (const match of block.matchAll(pattern)) {
    tokens.set(match[1], match[2].replace(/\s+/g, ' ').trim());
  }

  const missing = requiredTokens.filter((name) => !tokens.has(name));
  if (missing.length > 0) {
    throw new Error(`共有トークンが不足しています: ${missing.join(', ')}`);
  }

  return tokens;
}

function makeForsteriTheme(tokens) {
  const value = (name) => tokens.get(name);
  // 系列色 series-1〜8。図表の色分け専用で、黒文字が載る明度で揃っている。
  const seriesColors = Array.from({length: 8}, (_, index) =>
    value(`forsteri-series-${index + 1}`),
  );
  const series = {};

  seriesColors.forEach((color, index) => {
    series[`cScale${index}`] = color;
    series[`fillType${index}`] = color;
    series[`git${index}`] = color;
    series[`pie${index + 1}`] = color;
  });

  return {
    theme: 'base',
    flowchart: {
      htmlLabels: false,
      curve: 'basis',
    },
    themeVariables: {
      background: value('forsteri-white'),
      primaryColor: value('forsteri-primary-soft'),
      primaryBorderColor: value('forsteri-primary'),
      primaryTextColor: value('forsteri-ink'),
      secondaryColor: value('forsteri-gray-100'),
      secondaryBorderColor: value('forsteri-gray-300'),
      secondaryTextColor: value('forsteri-ink'),
      tertiaryColor: value('forsteri-white'),
      tertiaryBorderColor: value('forsteri-gray-700'),
      tertiaryTextColor: value('forsteri-ink'),
      lineColor: value('forsteri-gray-700'),
      arrowheadColor: value('forsteri-primary'),
      textColor: value('forsteri-ink'),
      nodeBkg: value('forsteri-primary-soft'),
      nodeBorder: value('forsteri-primary'),
      nodeTextColor: value('forsteri-ink'),
      mainBkg: value('forsteri-primary-soft'),
      clusterBkg: value('forsteri-gray-100'),
      clusterBorder: value('forsteri-gray-300'),
      defaultLinkColor: value('forsteri-gray-700'),
      titleColor: value('forsteri-ink'),
      edgeLabelBackground: value('forsteri-white'),
      actorBkg: value('forsteri-primary-soft'),
      actorBorder: value('forsteri-primary'),
      actorTextColor: value('forsteri-ink'),
      actorLineColor: value('forsteri-gray-300'),
      signalColor: value('forsteri-gray-700'),
      signalTextColor: value('forsteri-ink'),
      labelBoxBkgColor: value('forsteri-gray-100'),
      labelBoxBorderColor: value('forsteri-gray-300'),
      labelTextColor: value('forsteri-ink'),
      loopTextColor: value('forsteri-ink'),
      // ノート面は系列色2（黄）、アクティベーション面は系列色1（ティール淡）。
      noteBkgColor: seriesColors[1],
      noteBorderColor: value('forsteri-gray-700'),
      noteTextColor: value('forsteri-ink'),
      activationBkgColor: seriesColors[0],
      activationBorderColor: value('forsteri-primary'),
      sequenceNumberColor: value('forsteri-white'),
      stateBkg: value('forsteri-primary-soft'),
      stateLabelColor: value('forsteri-ink'),
      transitionColor: value('forsteri-gray-700'),
      transitionLabelColor: value('forsteri-ink'),
      labelBackgroundColor: value('forsteri-white'),
      compositeBackground: value('forsteri-gray-100'),
      compositeBorder: value('forsteri-gray-300'),
      archEdgeColor: value('forsteri-gray-700'),
      archEdgeArrowColor: value('forsteri-primary'),
      archGroupBorderColor: value('forsteri-gray-300'),
      fontFamily: value('forsteri-font-ja').replaceAll('"', ''),
      ...series,
    },
  };
}

export async function buildThemes({check = false} = {}) {
  const css = await readFile(tokenSource, 'utf8');
  const tokens = parseSharedTokens(css);
  const expected = `${JSON.stringify(makeForsteriTheme(tokens), null, 2)}\n`;

  if (check) {
    const actual = await readFile(outputFile, 'utf8').catch(() => '');
    if (actual !== expected) {
      throw new Error('forsteri.jsonがMarp共有トークンと同期していません。npm run build:themesを実行してください。');
    }
    return outputFile;
  }

  await writeFile(outputFile, expected);
  return outputFile;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check');
  await buildThemes({check});
  console.log(`${check ? 'Verified' : 'Generated'}: ${outputFile}`);
}
