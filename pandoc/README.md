# Pandoc document template

Markdownで書いた技術文書を、読みやすい単体HTMLまたはPDFへ変換するためのテンプレートです。

AWSドキュメントを参考にした簡潔な情報設計を採用しています。ダークな上部バー、左側の目次、明確な見出し階層、ティールのリンク、控えめな表と注記を基本とします。主色（リンク・注記）はツールキット共通のティール `#0f766e` で、Marp / Slidev の `forsteri` テーマや Docusaurus と同じ系統に揃えています。

## 構成

| Path | Role |
| --- | --- |
| `templates/document.html` | ヘッダ、目次、本文、フッタを持つPandoc HTMLテンプレート |
| `styles/document.css` | 設計書・手順書向けの基本CSS |
| `defaults/html.yaml` | HTML出力用のPandoc既定オプション |
| `samples/design-doc.md` | 設計書サンプル |
| `samples/procedure.md` | 手順書サンプル |
| `samples/decision-record.md` | 判断記録サンプル |
| `samples/runbook.md` | 運用ランブックサンプル |
| `samples/diagram-showcase.md` | neutralテーマのMermaid SVG表示確認 |
| `scripts/build-html.sh` | 1ファイルをHTMLへ変換するbashスクリプト |
| `scripts/build-pdf.sh` | Google ChromeのヘッドレスモードでHTMLをPDFへ印刷するbashスクリプト |
| `build/` | 生成物の出力先（`.gitignore`対象） |

## 必要環境

- [Pandoc](https://pandoc.org/) 3.x（`brew install pandoc`）
- PDF化にはGoogle Chrome（`/Applications/Google Chrome.app`。別の場所にある場合は`CHROME_PATH`環境変数で指定）
- macOS / zsh または bash

## 使い方

`pandoc`ディレクトリで実行します。スクリプトは内部で`pandoc/`を作業ディレクトリに固定するので、別のディレクトリから呼んでも動きます。

```bash
cd pandoc
scripts/build-html.sh samples/design-doc.md
scripts/build-html.sh samples/procedure.md
scripts/build-html.sh samples/decision-record.md
scripts/build-html.sh samples/runbook.md
```

PDFを出力する場合は、Google Chromeのヘッドレス印刷を使います。Markdownを渡すとHTML変換を挟んでPDF化し、HTMLを渡すとそのままPDF化します。

```bash
scripts/build-pdf.sh samples/design-doc.md
scripts/build-pdf.sh samples/procedure.md
CHROME_PATH="/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary" scripts/build-pdf.sh samples/runbook.md
```

出力先は既定で`build/`です。第2引数で出力ディレクトリ、第3引数でdefaultsファイルを差し替えられます。

Pandocを直接呼ぶ場合は次の形です。

```bash
pandoc --defaults defaults/html.yaml samples/design-doc.md -o build/design-doc.html
```

`defaults/html.yaml`ではCSSをHTMLへ埋め込む設定にしています。生成されたHTMLは、CSSファイルを別途配布しなくても単体で開けます。

## Mermaid図を埋め込む

PandocはMermaidをネイティブ描画しないため、共通レンダラでneutralテーマのSVGを作ってからMarkdownへ埋め込みます。

```bash
cd ../diagrams
npm install
npm run render -- samples/flowchart.mmd generated/neutral/flowchart.svg --theme neutral
cd ../pandoc
scripts/build-html.sh samples/diagram-showcase.md
```

Markdown側では、`pandoc/`をビルド時の作業ディレクトリとして`../diagrams/generated/neutral/*.svg`を指定します。`embed-resources: true`によりHTMLへSVGが埋め込まれ、ChromeからのPDF化でも同じ図を使用します。SVGは直接編集せず、`.mmd`を更新して再生成してください。

## Front matter

ヘッダとフッタに表示する情報はMarkdown冒頭のYAML front matterで指定します。

```yaml
---
title: "システム設計書"
subtitle: "認証基盤連携"
doc_type: "Design Document"
doc_id: "DESIGN-001"
version: "0.1.0"
status: "Draft"
updated: "2026-05-17"
author:
  - "forsteri"
classification: "Internal"
---
```

## 本文中の補助ブロック

Pandoc Markdownのfenced divで、補足、注意、決定事項、チェックリストを表現できます。

```markdown
::: {.warning}
**注意:** 本番反映中は同じ環境に対する別作業を開始しないでください。
:::
```

利用できるクラスは `note`, `warning`, `decision`, `checklist`, `danger` です。`note`はティール、`warning`は琥珀、`decision` / `checklist`は緑、`danger`は赤で区別します。

## 方針メモ

- HTMLはレビューや添付で扱いやすい単体ファイルを優先します。
- CSSは派手さより、ナビゲーション、表、コード、注意書き、印刷時の読みやすさを優先します。
- 本文はOS標準のUIフォントを使い、日本語環境では `Yu Gothic UI` / `Yu Gothic` へフォールバックします。
- 装飾的な画像は使わず、主色のティールだけでツールキットの他形式とつながりを持たせます。
- Marp / Slidevの`forsteri`テーマとは独立して管理します（共有するのは主色の系統のみ）。
