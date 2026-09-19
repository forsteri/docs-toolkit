# Changelog

docs-toolkit（個人用ドキュメントツールキット）の変更履歴です。詳細な経緯と判断は`Issues/`の各記録を参照してください。

## [0.1.0] - 2026-09-12

会社用ドキュメントツールキット v0.9.0 を土台に、個人用として再構成した最初の版（[Issue-0001](Issues/0001-personal-toolkit-bootstrap.md)）。5形式（Pandoc / Docusaurus / Marp / Slidev / Diagrams）のテーマ・図解基盤・執筆規約・利用ガイドを収録。

### 全体

- テーマ名・トークン接頭辞を`forsteri`（`@theme forsteri`、`--forsteri-*`）へ変更。会社名・部署名・社内ホストなど会社固有の記述をすべて撤去。
- ロゴ（コーポレート / コミュニケーション）、ブランドスローガン、シグネチャ画像、画像埋め込み（Data URI）の仕組みを撤去。線・面・主色だけのシンプルなデザインに統一。
- ソリューションカラー（事業領域別の配色）と社内/社外の区分（`external`クラス・frontmatter）を廃止。事業領域固有の色は系列色`--forsteri-series-1..8`へ置き換え。
- 配色をティール系（主色`#0f766e`）へ変更。スライド系は`forsteri`テーマ、文書系（Pandoc / Docusaurus / diagrams `neutral`）はニュートラルな情報設計のまま、リンク・主色・注記をティールに揃えた。
- バージョンをv0.1.0から再スタート。CHANGELOG / README / Issuesを個人用として書き直し。

### Marpテーマ

- 保守CSS→配布CSSの2段構成を`forsteri.css`の単一ファイルへ統合（ビルドスクリプト不要）。共有トークンブロック`@forsteri-shared-tokens`が全形式の単一ソース。
- `slogan`クラスを削除。`ending`は見出し・本文をそのまま中央配置するシンプルな終端に変更。

### Slidevテーマ

- レイアウトから`slogan`を削除、frontmatterの`external`を削除。
- スマートアート8コンポーネント（Process / Cycle / Pyramid / Matrix2x2 / Funnel / KpiCards / Roadmap / Comparison）のpropsから`palette` / `solution`を削除し、系列色を自動割当に一本化。

### 図解基盤

- テーマを`neutral`（Docusaurus / Pandoc）と`forsteri`（Marp / Slidev）の2種に整理。`neutral`の主色をティールへ変更。
- Docusaurusの`style-check`ページとの同期マーカーを`diagrams:<name>`へ改名。

### Pandoc

- PowerShellスクリプトを廃止し、bash版`scripts/build-html.sh` / `scripts/build-pdf.sh`（Google Chromeヘッドレス印刷、`CHROME_PATH`で上書き可）へ置き換え。
- `document.css`のリンク・注記色をティールへ変更。サンプルの会社固有語を中立化。

### Docusaurus

- サイト名・navbarを`docs-toolkit`、公開先をGitHub Pages（`https://forsteri.github.io/docs-toolkit/`）想定に変更。
- `custom.css`の主色トークンをティール系（ライト / ダーク）へ変更。利用ガイド・執筆規約・テンプレートから会社文脈とPowerShell手順を除去。
