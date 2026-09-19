# toolkit: 会社用 v0.9.0 からの個人用再構成

- 起票日: 2026-09-12
- 対象: リポジトリ全体（`pandoc/` `docusaurus/` `marp-theme/` `slidev/` `diagrams/` ルート直下）
- 種別: 再構成 / ブランド差し替え
- 状態: **クローズ**（2026-09-12 実施・確認完了。初期コミットのみ利用者の操作待ち）
- 関連: 会社用ツールキット v0.9.0（`docs-format`。参照のみ、変更しない）

## 背景と方針

会社用ドキュメントツールキット v0.9.0（Pandoc / Docusaurus / Marp / Slidev / Diagrams の5形式）を土台に、個人で使うツールキットとして再構成する。会社固有のブランド要素（ロゴ・スローガン・事業領域別の色・社内外区分・会社名や部署名）をすべて撤去し、ティールを主色にしたシンプルなデザインへ置き換える。仕組み（Markdown原本、共有トークンの単一ソース、図解基盤、検査コマンド）はそのまま引き継ぐ。

会社用の原本（`/Users/forsteri/work/Projects/docs-format`）は参照のみとし、変更しない。Git履歴は引き継がず、本リポジトリの初期コミットからやり直す。

## 決定事項（2026-09-12・利用者確認済み）

- **テーマ名・トークン接頭辞**: `forsteri`（`@theme forsteri`、`--forsteri-*`）。会社名を含む旧名称はすべて排除する。
- **主色**: ティール `#0f766e`。ムードは落ち着いた技術資料。
- **スコープ**: Pandoc / Docusaurus / Marp / Slidev / Diagrams の5形式すべて。
- **画像は使わない**: ロゴ・スローガン・シグネチャ画像を一切使わず、画像埋め込み（Data URI）の仕組みも持たない。Marpテーマは`forsteri.css`の単一ファイル構成にする（配布CSSと保守CSSの2段構成とビルドスクリプトを廃止）。
- **会社固有概念の撤去**: 社内/社外区分（`external`）、コーポレート/コミュニケーションロゴ、ブランドスローガン（`slogan`）、ソリューションカラー（事業領域別）、PVVsカラー（→ 系列色`series-1..8`へ置換）、著作権表記、部署名、社内ホスト、リポジトリ移行の話。
- **共有トークンの単一ソース**: `marp-theme/themes/forsteri/forsteri.css`の`@forsteri-shared-tokens`ブロック。Slidevテーマは`npm run brand:sync`、図解基盤の`forsteri`テーマは`npm run build:themes`でここから生成する。
- **文書系の配色**: Pandoc / Docusaurus / diagrams `neutral`はAWSドキュメント風のニュートラルな情報設計（濃紺ヘッダ）を維持し、リンク・主色・注記だけをティールへ寄せる。`diagrams`の`npm run check`が`neutral.json`とDocusaurusの`custom.css`の一致を検査するため、両者は同じ値を使う。
- **スライドの終端**: ロゴなし。資料側の見出し・本文をそのまま中央配置するシンプルな`ending`にする。
- **表記**: 呼称は「docs-toolkit」「個人用ドキュメントツールキット」。Docusaurusのサイト名・navbarは`docs-toolkit`、フッタは`docs-toolkit v0.1.0 · <年>`。公開先はGitHub Pages（`https://forsteri.github.io/docs-toolkit/`）想定。
- **スクリプト**: 利用環境はmacOS（zsh）。PandocのPowerShellスクリプトはbash版へ置き換え、PDF化はGoogle Chromeのヘッドレス印刷を使う。
- **言語**: 文書・コードコメントは日本語で統一する。
- **バージョン**: v0.1.0（2026-09-12）から再スタート。CHANGELOG / README / Issuesを個人用として書き直す。

## タスクリスト

### 1. ルート

- [x] `README.md` / `CHANGELOG.md`を個人用として書き直す（v0.1.0）
- [x] `.gitignore`に生成物（`pandoc/build/` `output/` `dist/` `docusaurus/build/` `docusaurus/.docusaurus/`）と依存・キャッシュを含める
- [x] `.claude/launch.json`のパスを`docs-toolkit`へ直し、無関係な項目を削除する
- [x] 本Issueを起票する

### 2. pandoc/

- [x] PowerShellスクリプトを削除し、bash版`scripts/build-html.sh` / `scripts/build-pdf.sh`を作る
- [x] `styles/document.css`のリンク・注記色をティールへ変更する
- [x] `README.md`をbash手順へ書き換え、サンプルの会社固有語を中立化する
- [x] HTML生成とPDF生成を検証する

### 3. docusaurus/

- [x] `docusaurus.config.js`のサイト名・公開先URL・フッタを更新する
- [x] `custom.css`の主色トークンをティール系へ変更する
- [x] `docs/`の利用ガイド・執筆規約・テンプレートから会社文脈を除く。`style-check`の同期マーカーを`diagrams:<name>`へ改名する
- [x] `npm run build`と表示確認を行う

### 4. marp-theme/ slidev/ diagrams/

- [x] `forsteri.css`単一ファイル化と`npm run check`の再定義
- [x] Slidevテーマの`slogan` / `external` / `palette` / `solution`の削除と`brand:sync`
- [x] 図解基盤の`neutral` / `forsteri`テーマ整理と`check.mjs`の照合先更新

### 5. クローズ条件

- [x] 全ディレクトリで会社固有語の残存ゼロ（`grep -ri -E "toyobo|東洋紡|pvvs|solution|slogan|スローガン|ロゴ|logo|external|社内|社外|部署"`。仕組みの語として必要な`logo`、Mermaidの定型classDef`external`は除く）
- [x] 各ディレクトリの検査コマンドがすべて通る
- [ ] 初期コミットを作成する

## 留意事項

- `docs-format`（会社用の原本）は参照のみ。変更しない。
- Docusaurusの`showLastUpdateTime`は`git log`を使うため、初期コミット前は`npm run build`が最終更新日の取得で失敗する。初期コミット後は問題ない（検証時はVCS連携を無効化した一時設定でビルドした）。
- Google Chromeはバージョンによってヘッドレス印刷後に自発終了しないことがある。`build-pdf.sh`はPDFの書き出し完了を検知してChromeを停止する。
- Mermaidの定型classDef名`external`（外部システムを破線で表す）は図解の語彙であり、社内外区分とは無関係なので維持する。

## 実施・確認記録（2026-09-12）

- Marp: `forsteri.css`単一ファイル化。本文ヘッダは主色1本の細線、タイトルは上部白＋下部主色の直線分割、章扉は左端の主色縦帯、終端は見出し・本文の中央配置に簡素化。`@auto-scaling fittingHeader`を宣言し`<!-- fit -->`が効くように修正。`npm run check`通過、PNG出力で全レイアウトを目視確認。
- Slidev: `slogan`レイアウト・`external`・`palette`/`solution` propsを削除し、系列色8色の自動割当に一本化。cover はフラットな主色面、section は直線帯。`brand:sync` / `check-structure` / `build` / `build:patterns` / `export`通過、PDF 24ページを目視確認。
- 図解基盤: `forsteri.json`をMarp共有トークンから再生成、`neutral.json`をティールへ更新、SVG 8本を再レンダリング。`npm run check`全項目通過（旧色の残存なし）。
- Pandoc / Docusaurus: bashスクリプト化、ティール配色、利用ガイド書き直し。Pandoc HTML/PDF生成成功、DocusaurusはVCS連携を無効化した一時設定でビルド成功（初期コミット後は素の`npm run build`で通る見込み）。
- 会社固有語の残存: `CHANGELOG.md`と本Issueの「撤去した項目」の記録、Mermaid定型classDef`external`のみ（いずれも意図した残存）。
