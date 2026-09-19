# Changelog

docs-toolkit（ドキュメントツールキット）の変更履歴です。

## [Unreleased]

### One-pager

- 概念・方針・構造・ロードマップ・比較を1枚で説明する単体HTML形式`one-pager/`を追加。読む文書（Pandoc / Docusaurus）と見せる資料（Marp / Slidev）の中間に位置づける。
- 単一CSS（`theme.css`）、テンプレート、用途別サンプル4種、依存なしの検査（`npm run check`）、CSS埋め込みスクリプト（`scripts/bundle.sh`）。
- 「大きく、少なく、濃く」の方針をテーマと検査で固定する。文字サイズはpx指定で下限18px、文字色は濃いトークンだけ、部品は10個と`key`修飾子だけ、`section`・`callout`・`key`の個数と本文文字量に上限。
- 配色は文書系と同じ値（`diagrams/themes/neutral.json`と検査で照合）。スライド向け`forsteri`テーマのブランド表現は持ち込まない。

## [0.1.0] - 2026-09-12

最初の版。5形式（Pandoc / Docusaurus / Marp / Slidev / Diagrams）のテーマ・図解基盤・執筆規約・利用ガイドを収録。

### 全体

- 主色ティール（`#0f766e`）の`forsteri`テーマ。ロゴや装飾画像を持たず、線・面・主色だけで構成する。
- 色・フォントの共有トークンは`marp-theme/themes/forsteri/forsteri.css`の`@forsteri-shared-tokens`ブロックを単一ソースとし、Slidevテーマと図解基盤の`forsteri`テーマはそこから生成する。
- 文書系（Pandoc / Docusaurus / diagrams `neutral`）はニュートラルな情報設計のまま、リンク・主色・注記をティールに揃える。

### Marpテーマ

- 16:9の単一CSS（`forsteri.css`）。タイトル・章扉・本文・終端に加え、`statement` / `metric` / `decision` / `timeline` / `figure-*`の実務レイアウトと、オプトイン式の`dark`を収録。
- `npm run check`でテーマの自己完結性とサンプルの変換を検証。

### Slidevテーマ

- ローカルテーマ（`cover` / `section` / `default` / `statement` / `metric` / `ending`）と、系列色を自動割当するスマートアート8コンポーネント（Process / Cycle / Pyramid / Matrix2x2 / Funnel / KpiCards / Roadmap / Comparison）。
- 提案・進捗報告・意思決定・キックオフ・振り返りのパターン集と、SPA / PDF出力。

### 図解基盤

- Mermaid原本から4形式へ同じ見た目の図を出す共通基盤。テーマは`neutral`（Docusaurus / Pandoc）と`forsteri`（Marp / Slidev）。
- AWS Architecture Icons 2026 Q3のIconifyパック化と、Docusaurus / Slidev / mermaid-cliへの登録。

### Pandoc

- 単体HTML / PDF向けテンプレートと、bashスクリプト（`scripts/build-html.sh` / `scripts/build-pdf.sh`。PDFはGoogle Chromeのヘッドレス印刷）。

### Docusaurus

- 利用ガイド・執筆規約・文書テンプレート（設計書 / 手順書 / 判断記録 / ランブック）を収録したdocs-onlyサイト。UDフォント、日本語ローカル検索、Mermaid、カスタム注記、DocMeta。
- GitHub Pages（`https://forsteri.github.io/docs-toolkit/`）へ公開する前提の設定。
