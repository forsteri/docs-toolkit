# forsteri Marp Theme

ドキュメントツールキット（docs-toolkit）のスライド向けMarpテーマです。16:9（1280 × 720）、主色ティール `#0f766e` の落ち着いた技術資料向けデザインで、画像に依存しない単一CSSとして配布します。

## 特徴

- タイトル、章扉、本文、図版、終端を用途別クラスで整理
- KPI、意思決定、工程、出典表記の実務レイアウトを収録
- カジュアル資料向けのオプトイン式`dark`（Night）テーマを収録
- 画像を一切使わないため、`forsteri.css`1ファイルだけで動作
- 色・フォントの共有トークンを`forsteri.css`先頭に集約し、Slidev / diagrams から同じ値を参照

## 構成

| パス | 用途 |
|---|---|
| `themes/forsteri/forsteri.css` | テーマ本体。共有トークンの単一ソースを含む |
| `themes/forsteri/README.md` | 利用者向けガイド |
| `examples/example.md` | 主要レイアウトのサンプル |
| `examples/feature-showcase.md` | 全機能のPDF向けカタログ |
| `examples/dark-showcase.md` | Nightダークテーマの代表レイアウト |
| `examples/layout-check.md` | レイアウト回帰確認用サンプル |
| `examples/diagram-showcase.md` | forsteriテーマのMermaid SVG表示確認 |
| `examples/assets/` | サンプルで使うローカル図版 |
| `scripts/check-theme.mjs` | テーマとサンプルの検査 |
| `package.json` / `package-lock.json` | Marp CLIの固定バージョンと実行環境 |

## セットアップと検査

```bash
npm install
npm run check
```

`npm run check`は次を確認します。

- `/* @theme forsteri */`の宣言が1回だけあること
- 共有トークンマーカー（`@forsteri-shared-tokens-start` / `-end`）が1組あること
- `url(`参照が残っていないこと（画像埋め込みを使わない方針）
- テーマ外の資産（ロゴ・スローガン・別ブランドの配色）を参照する語が残っていないこと
- 未定義の`--forsteri-*`変数参照がないこと
- `examples/*.md`がすべてMarp CLIでHTMLへ変換できること

## プレビューとPDF出力

```bash
npx marp \
  --theme themes/forsteri/forsteri.css \
  examples/example.md

npx marp \
  --theme themes/forsteri/forsteri.css \
  --allow-local-files \
  --pdf \
  --output ../output/pdf/forsteri-marp-feature-showcase.pdf \
  examples/feature-showcase.md

npx marp \
  --theme themes/forsteri/forsteri.css \
  --allow-local-files \
  --pdf \
  --output ../output/pdf/forsteri-marp-dark-showcase.pdf \
  examples/dark-showcase.md
```

テーマ標準機能はMarp Coreの既定HTML許可リスト内で動作するため、`--html`は不要です。許可リスト外のHTMLを追加する場合だけ、信頼できる資料に限って明示的に有効化してください。

## Mermaid図を埋め込む

MarpはMermaidをネイティブ描画しないため、共通レンダラでforsteriテーマのSVGを生成してから通常の画像として参照します。

```bash
cd ../diagrams
npm install
npm run render -- samples/flowchart.mmd generated/forsteri/flowchart.svg --theme forsteri
cd ../marp-theme
npx marp \
  --theme themes/forsteri/forsteri.css \
  --allow-local-files \
  --pdf \
  --output ../output/pdf/forsteri-marp-diagram-showcase.pdf \
  examples/diagram-showcase.md
```

原本とclassDefの規約は[`../diagrams/README.md`](../diagrams/README.md)を参照してください。生成SVGは直接編集しません。

## 共有トークン（単一ソース）

`themes/forsteri/forsteri.css`先頭の`/* @forsteri-shared-tokens-start */`〜`/* @forsteri-shared-tokens-end */`ブロックが、色・系列色・Nightパレット・フォントの単一ソースです。Slidevテーマと diagrams のテーマ生成はこの範囲を読み取って同期するため、値を変えるときはMarp側のこのブロックだけを編集し、各ディレクトリの検査コマンドを再実行してください。

詳細な使い方は[`themes/forsteri/README.md`](themes/forsteri/README.md)を参照してください。
