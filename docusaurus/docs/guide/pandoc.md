---
title: Pandocテンプレートの使い方
description: Markdownを単体配布できるHTML / PDFへ変換する最初の一歩です。
---

# Pandocテンプレートの使い方

Markdownで書いた技術文書を、レビューや添付で扱いやすい**単体HTML**（CSS埋め込み済み）またはPDFへ変換します。ニュートラルな情報設計で、リンクと注記の主色だけツールキット共通のティールに揃えています。

## 前提

- [Pandoc](https://pandoc.org/) 3.x（`brew install pandoc`）
- PDF化にはGoogle Chrome（ヘッドレス印刷を使用。`/Applications/Google Chrome.app`以外にある場合は`CHROME_PATH`環境変数で指定）
- 作業ディレクトリは`pandoc/`

## 最初の一歩

サンプルの設計書をHTMLへ変換します。

```bash
cd pandoc
pandoc --defaults defaults/html.yaml samples/design-doc.md -o build/design-doc.html
```

同じことをするbashスクリプトと、PDF化のスクリプトがあります。出力先はどちらも`build/`です。

```bash
scripts/build-html.sh samples/design-doc.md
scripts/build-pdf.sh samples/design-doc.md
```

自分の文書を書くときは、[文書テンプレート](/document-templates)から用途に合うものをコピーし、front matterでヘッダ・フッタ情報を指定します。

```yaml
---
title: "システム設計書"
doc_type: "Design Document"
doc_id: "DESIGN-001"
version: "0.1.0"
status: "Draft"
updated: "2026-05-17"
classification: "Internal"
---
```

## 覚えておくルール

- 生成されるHTMLはCSS・画像埋め込み済みの単体ファイルです。そのまま添付・配布できます。
- 注記はfenced div（`::: {.note}` など）で書きます。使えるクラスは`note` / `warning` / `decision` / `checklist` / `danger`です。
- Mermaid図はネイティブ描画されないため、[図解基盤](./diagrams)で`neutral`テーマのSVGを生成してから画像として参照します。`embed-resources`によりSVGもHTMLへ埋め込まれます。

## 詳細リファレンス

- テンプレート構成・front matter全項目・方針: `pandoc/README.md`
- 文書タイプ別サンプル: `pandoc/samples/`
