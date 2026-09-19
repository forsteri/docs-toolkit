# docs-toolkit — ドキュメントツールキット

**v0.1.0**

技術文書とプレゼンテーションの書き方・見せ方・作り方をまとめたツールキットです。文書本文はMarkdownを原本とし、用途に応じて6つの形式（5つの出力形式＋図解基盤）を使い分けます。

利用ガイドはDocusaurusサイトに統合しています。

```bash
cd docusaurus && npm install && npm start
```

| Format | Purpose | Visual policy | Status |
| --- | --- | --- | --- |
| Pandoc | 単体HTML / PDFとして配布する技術文書 | ニュートラル。AWSドキュメントを参考にした簡潔な情報設計。主色はティール | Active |
| Docusaurus | 検索・ナビゲーション付きの継続更新ドキュメント（利用ガイドを含む） | ニュートラル。Pandocと共通の読み味。主色はティール | Active |
| One-pager | 概念・方針・構造を1枚で説明する単体HTML（画面共有・Agent生成前提） | ニュートラル。文書系と同じ配色で、大きな文字と少ない部品に限定 | Active |
| Marp | プレゼンテーション（PDF・人手/Agent両用） | `forsteri`テーマ | Active |
| Slidev | プレゼンテーション / 静的SPA（Agent前提） | `forsteri`テーマ（Marpと同じトークン） | Active |
| Diagrams | Mermaid原本から全形式へ同じ見た目の図を出す共通基盤 | `neutral` / `forsteri`の2テーマ | Active |

## 基本方針

- ブランド表現（見出し帯・章扉・系列色などのスライド向けデザイン）はMarp / Slidevの`forsteri`テーマで行います。文書系（Pandoc / Docusaurus）はニュートラルな情報設計ですが、主色は共通のティール `#0f766e` に揃え、ひとつのツールキットに見えるようにします。
- 共有トークン（色・フォント）はMarpの`marp-theme/themes/forsteri/forsteri.css`が単一ソースです。Slidevテーマは`npm run brand:sync`、図解基盤の`forsteri`テーマは`npm run build:themes`でそこから生成します。
- 装飾画像は使いません。線・面・主色だけのシンプルなデザインです。
- PandocとDocusaurusは、強い見出し階層、左ナビゲーション、ティールのリンク、控えめな罫線、読みやすいコードと注記を共通要素とします。
- 文書本文はMarkdownを原本とし、内容と出力スタイルを分離します。書き手は色やレイアウトを選びません。
- One-pagerは文書系と同じ配色のまま、文字を大きく・部品を少なく・色を濃く限定した1枚資料の形式です。Markdownではなく用意した部品でHTMLを直接書き（Agent生成前提）、収まらない情報は文字を縮めずに削ります。
- 文書・コードコメントは日本語で統一します。

## ディレクトリ

- `docusaurus/`: 継続更新するドキュメントサイト（ツールキット利用ガイド・執筆規約・文書テンプレートを含む）
- `pandoc/`: 単体HTML / PDF向けテンプレートとbashビルドスクリプト
- `one-pager/`: 1枚で説明する単体HTML形式（`theme.css`・テンプレート・サンプル・Agent向け生成ルール）
- `marp-theme/`: `forsteri` Marpテーマ（共有トークンの単一ソース）
- `slidev/`: `forsteri` Slidevテーマ、スマートアートコンポーネント、用途別パターン
- `diagrams/`: Mermaid図解基盤（`neutral` / `forsteri`テーマ・レンダラ・AWS公式アイコン）
- `CHANGELOG.md`: バージョンごとの変更履歴

## 検査コマンド

各ディレクトリで変更したら、対応する検査を通します。

| ディレクトリ | コマンド | 備考 |
| --- | --- | --- |
| `marp-theme/` | `npm run check` | 単一CSS（`forsteri.css`）と共有トークンの検証 |
| `slidev/` | `npm run brand:sync && npm run check` | Node 24.19.0（`.node-version`）。`check`はビルドとパターン集ビルドを含む |
| `diagrams/` | `npm run build:themes && npm run check` | `neutral`はDocusaurusのCSS、`forsteri`はMarpトークンと照合。Chromeは`/Applications/Google Chrome.app`を自動検出 |
| `docusaurus/` | `npm run build` | `onBrokenLinks: 'throw'`。初回コミット前は`git log`が無いため最終更新日の取得で失敗する（コミット後は不要） |
| `pandoc/` | `pandoc --defaults defaults/html.yaml samples/design-doc.md -o build/design-doc.html` | PDFは`scripts/build-pdf.sh samples/design-doc.md`（Google Chromeのヘッドレス印刷） |
| `one-pager/` | `npm run check` | 依存なし（`npm install`不要）。文字サイズの下限、文書系トークン（`diagrams/themes/neutral.json`）との一致、テンプレートとサンプルの部品制約を検証 |

## 必要環境

- macOS（zsh）。スクリプトはbashで書かれています
- Node.js 20以上（Slidevのみ24.19.0）とnpm
- Pandoc 3.x、Google Chrome（PDF化・図のレンダリング）

## ライセンス

[MIT License](LICENSE)です。`diagrams/assets/aws/`のAWS Architecture IconsはAWSが配布するアセットで、利用条件は[配布元](https://aws.amazon.com/architecture/icons/)に従います（詳細は`diagrams/assets/aws/2026-q3/SOURCE.md`）。
