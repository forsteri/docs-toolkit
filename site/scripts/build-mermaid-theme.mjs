// src/css/custom.css のブランドトークン（ライト側）から assets/mermaid/neutral.json を生成する。
// Mermaidはテーマ変数から配色を計算するため、CSS変数ではなく値そのものを渡す。
// 使い方: npm run build:mermaid（同期の確認だけなら npm run build:mermaid -- --check）
import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const cssFile = path.join(rootDir, 'src/css/custom.css');
export const outputFile = path.join(rootDir, 'assets/mermaid/neutral.json');

const startMarker = '/* @brand-tokens-start */';
const endMarker = '/* @brand-tokens-end */';

// ブロックのうち :root（ライト）の宣言を読む。ダークはMermaid組み込みの dark を使う
export function parseLightTokens(css) {
  const start = css.indexOf(startMarker);
  const end = css.indexOf(endMarker);

  if (
    start === -1 ||
    end === -1 ||
    end <= start ||
    css.indexOf(startMarker, start + startMarker.length) !== -1 ||
    css.indexOf(endMarker, end + endMarker.length) !== -1
  ) {
    throw new Error('ブランドトークンのマーカーは開始・終了が1組だけ、この順で存在する必要があります。');
  }

  // コメント内の「--dt-*」などを宣言と取り違えないよう、コメントを除いてから読む
  const block = css.slice(start + startMarker.length, end).replace(/\/\*[\s\S]*?\*\//g, '');
  const root = block.match(/:root\s*\{([^}]*)\}/);
  if (!root) {
    throw new Error('ブランドトークンのブロックに :root の宣言がありません。');
  }

  const tokens = new Map();
  for (const match of root[1].matchAll(/--([a-z0-9-]+)\s*:\s*([\s\S]*?);/g)) {
    tokens.set(match[1], match[2].replace(/\s+/g, ' ').trim());
  }
  return tokens;
}

export function tokenReader(tokens, used = new Set()) {
  return (name) => {
    const resolved = tokens.get(name);
    if (resolved === undefined) {
      throw new Error(`Mermaidテーマが未定義のトークン --${name} を参照しています。`);
    }
    if (resolved.includes('var(')) {
      throw new Error(`Mermaidテーマから参照する --${name} は値を直接持つ必要があります: ${resolved}`);
    }
    used.add(`--${name}`);
    return resolved;
  };
}

export function makeNeutralTheme(value) {
  return {
    theme: 'base',
    flowchart: {
      htmlLabels: false,
      curve: 'basis',
    },
    themeVariables: {
      background: value('dt-bg'),
      primaryColor: value('dt-accent-soft'),
      primaryBorderColor: value('dt-accent'),
      primaryTextColor: value('dt-text'),
      secondaryColor: value('dt-surface'),
      secondaryBorderColor: value('dt-line'),
      secondaryTextColor: value('dt-text'),
      tertiaryColor: value('dt-bg'),
      tertiaryBorderColor: value('dt-text-muted'),
      tertiaryTextColor: value('dt-text'),
      lineColor: value('dt-text-muted'),
      arrowheadColor: value('dt-text-muted'),
      textColor: value('dt-text'),
      nodeBkg: value('dt-accent-soft'),
      nodeBorder: value('dt-accent'),
      nodeTextColor: value('dt-text'),
      mainBkg: value('dt-accent-soft'),
      clusterBkg: value('dt-surface'),
      clusterBorder: value('dt-line'),
      defaultLinkColor: value('dt-text-muted'),
      titleColor: value('dt-heading'),
      edgeLabelBackground: value('dt-bg'),
      actorBkg: value('dt-accent-soft'),
      actorBorder: value('dt-accent'),
      actorTextColor: value('dt-text'),
      actorLineColor: value('dt-line'),
      signalColor: value('dt-text-muted'),
      signalTextColor: value('dt-text'),
      labelBoxBkgColor: value('dt-surface'),
      labelBoxBorderColor: value('dt-line'),
      labelTextColor: value('dt-text'),
      loopTextColor: value('dt-text'),
      noteBkgColor: value('dt-note-surface'),
      noteBorderColor: value('dt-note-line'),
      noteTextColor: value('dt-text'),
      activationBkgColor: value('dt-accent-tint'),
      activationBorderColor: value('dt-accent'),
      // 番号は塗りの円に載る文字なので、面の上の文字色（on-accent）を使う。
      sequenceNumberColor: value('dt-on-accent'),
      stateBkg: value('dt-accent-soft'),
      stateLabelColor: value('dt-text'),
      transitionColor: value('dt-text-muted'),
      transitionLabelColor: value('dt-text'),
      labelBackgroundColor: value('dt-bg'),
      compositeBackground: value('dt-surface'),
      compositeBorder: value('dt-line'),
      archEdgeColor: value('dt-text-muted'),
      archEdgeArrowColor: value('dt-accent'),
      archGroupBorderColor: value('dt-line'),
      fontFamily: value('dt-font-ja').replaceAll('"', ''),
    },
  };
}

export async function renderNeutralTheme() {
  const css = await readFile(cssFile, 'utf8');
  return `${JSON.stringify(makeNeutralTheme(tokenReader(parseLightTokens(css))), null, 2)}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const expected = await renderNeutralTheme();
  if (process.argv.includes('--check')) {
    const actual = await readFile(outputFile, 'utf8').catch(() => '');
    if (actual !== expected) {
      console.error('assets/mermaid/neutral.json が src/css/custom.css と同期していません。npm run build:mermaid を実行してください。');
      process.exit(1);
    }
    console.log(`Verified: ${outputFile}`);
  } else {
    await writeFile(outputFile, expected);
    console.log(`Generated: ${outputFile}`);
  }
}
