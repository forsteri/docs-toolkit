# Changelog

docs-toolkit（ドキュメントツールキット）の変更履歴です。

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
