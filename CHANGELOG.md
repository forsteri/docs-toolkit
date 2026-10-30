# Changelog

docs-toolkit（ドキュメントツールキット）の変更履歴です。

## Unreleased

### 追加

- `verified.json`: 動作確認済みの組み合わせを機械可読に記録する（リポジトリURL・完全なSHA・タグ・docs-toolkit-sample のSHA、`brand/` の取得元）。README の表はその先頭の短縮。
- `scripts/fetch.mjs`: 記録した組み合わせを、記録した完全なSHAのまま取得する。タグが記録と違うコミットを指していれば失敗する。
- `scripts/import.mjs`: 利用プロジェクトでの取り込み（`add`）、記録のコミットとの突き合わせ（`status`）、取り込み直しと撤回（`update`）。記録は利用側の `toolkit-imports.json` に完全なSHAで残す。上流の削除・移動を当て、利用側の改変は3方向マージで残し、競合を一覧にする。
- 6リポジトリの 2026-10-28 の確認済みコミットに `v0.1.0` のタグを打ち、`verified.json` に記録。
- `scripts/test-import.mjs`: `import.mjs` の追加・変更・削除・移動・競合・撤回の検査。

### 変更

- `scripts/check.mjs`: 既定で `verified.json` の先頭の組み合わせを取得して検査するようにした（`--set`、従来の `--repos` も使える）。記録と README の一致、別のブランドを当てたあとの各テンプレートの手順と検査（pandoc-template・docusaurus-template・slidev-theme）、`import.mjs` の検査を加えた。
- `docs/importing.md`: `import.mjs` を使う手順に書き直し、取り込み直しの場合分け、撤回、版の付け方、docs-toolkit-sample で確かめたことを追記。

## [0.2.0] - 2026-10-28

6形式を形式ごとのリポジトリに分割し、このリポジトリは索引と共通のブランド道具だけを持つ入口にした。各形式の以後の変更は分割先のリポジトリで管理する。

### 分割

- `pandoc/` → [pandoc-template](https://github.com/forsteri/pandoc-template)、`docusaurus/` → [docusaurus-template](https://github.com/forsteri/docusaurus-template)、`one-pager/` → [one-pager](https://github.com/forsteri/one-pager)、`marp-theme/` → [marp-theme](https://github.com/forsteri/marp-theme)、`slidev/` → [slidev-theme](https://github.com/forsteri/slidev-theme)、`diagrams/` → [diagrams](https://github.com/forsteri/diagrams)。分割元はコミット `f2b5140`。Git履歴は分割先に引き継いでいない。
- 6形式のディレクトリ、Docusaurus を GitHub Pages へ公開するワークフロー、ローカル起動設定（`.claude/launch.json`）を削除。利用ガイドは docusaurus-template の `docs/guide/` にある。
- 分割先では色とフォントのトークン名を役割名の `--dt-*` に揃え、値を `@brand-tokens-start`〜`@brand-tokens-end` のブロックだけに書くようにした（旧 `--forsteri-*` などから移行）。

### 追加

- README を6リポジトリの索引にし、形式の選び方・取り込み方・動作確認済みの組み合わせを記載。
- `brand/`: ブランド値の雛形 `tokens.css`（ライト）・`tokens.dark.css`（Docusaurus のダーク）と、各テンプレートのトークンブロックへ名前で当てる `apply.mjs`（`--tokens`・`--dark-tokens`・`--check`）。ブランド面の範囲と既知の穴を `brand/README.md` に記載。docs-toolkit-sample の `brand/apply.mjs` を共通化したもの。
- `scripts/check.mjs`: brand/ → 各テンプレート、brand/ → diagrams → one-pager の組み合わせを検査する（依存なし）。
- `docs/importing.md`: コピーでの取り込み、取り込み記録の書式、取り込み直しと改善の戻し方。

### 変更

- ROADMAP を分割後の状態に合わせて書き直した。

## 分割前の未リリース分（v0.1.0 以降）

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
