import {readFile, readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {buildAwsPack} from './build-aws-pack.mjs';
import {buildThemes} from './build-themes.mjs';
import {renderDiagram} from './render.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const diagramsDir = path.resolve(scriptDir, '..');
const repositoryDir = path.resolve(diagramsDir, '..');

function readCssToken(css, name) {
  const value = css.match(new RegExp(`--${name}\\s*:\\s*([^;]+);`))?.[1]?.trim();
  if (!value) throw new Error(`CSS変数が見つかりません: --${name}`);
  return value;
}

async function checkNeutralTheme() {
  const [theme, css] = await Promise.all([
    readFile(path.join(diagramsDir, 'themes/neutral.json'), 'utf8').then(JSON.parse),
    readFile(path.join(repositoryDir, 'docusaurus/src/css/custom.css'), 'utf8'),
  ]);
  const expected = {
    primaryBorderColor: readCssToken(css, 'ifm-color-primary'),
    primaryColor: readCssToken(css, 'ifm-color-primary-lightest'),
    primaryTextColor: readCssToken(css, 'ifm-font-color-base'),
    clusterBkg: readCssToken(css, 'ifm-background-surface-color'),
    clusterBorder: readCssToken(css, 'ifm-border-color'),
    lineColor: readCssToken(css, 'doc-muted'),
    fontFamily: readCssToken(css, 'ifm-font-family-base').replaceAll('"', ''),
  };

  for (const [name, value] of Object.entries(expected)) {
    if (theme.themeVariables[name] !== value) {
      throw new Error(`neutral.jsonの${name}がDocusaurus CSSと不一致です。`);
    }
  }
}

async function checkGeneratedSvg(filePath, expectsAws = false) {
  const svg = await readFile(filePath, 'utf8');
  if (!svg.includes('<svg') || !svg.includes('</svg>')) {
    throw new Error(`SVG出力が不正です: ${filePath}`);
  }
  if (expectsAws && /(^|>)\s*\?\s*(<|$)/.test(svg)) {
    throw new Error(`AWSアイコンが未登録です: ${filePath}`);
  }
}

async function checkEmbeddedSamples(sampleNames) {
  const consumers = [
    path.join(repositoryDir, 'docusaurus/docs/style-check.md'),
    path.join(repositoryDir, 'slidev/examples/showcase.md'),
  ];

  for (const consumer of consumers) {
    const markdown = await readFile(consumer, 'utf8');
    const isMdx = consumer.endsWith('style-check.md');
    for (const sampleName of sampleNames) {
      const marker = sampleName.replace(/\.mmd$/, '');
      const startMarker = isMdx
        ? `\\{/\\* diagrams:${marker}:start \\*/\\}`
        : `<!-- diagrams:${marker}:start -->`;
      const endMarker = isMdx
        ? `\\{/\\* diagrams:${marker}:end \\*/\\}`
        : `<!-- diagrams:${marker}:end -->`;
      const pattern = new RegExp(
        `${startMarker}\\s*\\x60\\x60\\x60mermaid\\n([\\s\\S]*?)\\n\\x60\\x60\\x60\\s*${endMarker}`,
      );
      const embedded = markdown.match(pattern)?.[1]?.trim();
      const canonical = (await readFile(
        path.join(diagramsDir, 'samples', sampleName),
        'utf8',
      )).trim();

      if (!embedded || embedded !== canonical) {
        throw new Error(`${consumer}の${sampleName}が共通原本と一致しません。`);
      }
    }
  }
}

await buildThemes({check: true});
await buildAwsPack({check: true});
await checkNeutralTheme();

const samples = (await readdir(path.join(diagramsDir, 'samples')))
  .filter((name) => name.endsWith('.mmd'))
  .sort();
const requiredSamples = [
  'architecture-aws.mmd',
  'flowchart.mmd',
  'sequence.mmd',
  'state.mmd',
];
for (const required of requiredSamples) {
  if (!samples.includes(required)) throw new Error(`必須サンプルがありません: ${required}`);
}
await checkEmbeddedSamples(['architecture-aws.mmd', 'flowchart.mmd', 'sequence.mmd']);

for (const theme of ['neutral', 'forsteri']) {
  for (const sample of samples) {
    const output = path.join(diagramsDir, 'generated', theme, sample.replace(/\.mmd$/, '.svg'));
    await renderDiagram({
      input: path.join(diagramsDir, 'samples', sample),
      output,
      theme,
    });
    await checkGeneratedSvg(output, sample === 'architecture-aws.mmd');
  }
}

console.log(`Verified themes, AWS icon pack, and ${samples.length * 2} rendered SVGs.`);
