---
title: Marpテーマの使い方
description: forsteriテーマでスライドPDFを作る最初の一歩です。
---

# Marpテーマの使い方

ティールを主色にした16:9（1280 × 720）のMarpテーマ`forsteri`です。人手・Agentのどちらでも書けて、配布はPDFまたは単体CSS（`forsteri.css`1ファイル）です。装飾画像は使わず、線・面・主色だけで構成しています。

## 前提

- Node.jsとnpm
- 作業ディレクトリは`marp-theme/`

```bash
cd marp-theme
npm install
npm run check
```

## 最初の一歩

サンプルをプレビューして、テーマの見た目を確認します。

```bash
npx marp --theme themes/forsteri/forsteri.css examples/example.md
```

PDFへ出力します。

```bash
npx marp --theme themes/forsteri/forsteri.css --allow-local-files --pdf \
  --output ../output/pdf/my-slides.pdf examples/example.md
```

自分の資料を書くときは、front matterでテーマを指定します。

```markdown
---
marp: true
theme: forsteri
paginate: true
---

# タイトル
```

## 覚えておくルール

- スライドの種類はクラスで切り替えます: `title`（表紙）、`section`（章扉）、`statement`（1メッセージ）、`ending`（終端）。終端は見出し・本文をそのまま中央に置くだけのシンプルな構成です。
- 実務向けの補助クラスとして、`no-header` / `compact` / `figure-*` / `image-shadow` / `metric` / `decision` / `timeline` と、`.columns` / `.panel` / `.caption` / `.source` があります。
- カジュアルな資料向けに、オプトイン式の`dark`（Night）テーマがあります。正式な資料の既定ではありません。
- 色を資料側で直接指定しません。系列色（`--forsteri-series-1..8`）や主色はテーマが割り当てます。
- Mermaid図はネイティブ描画されないため、[図解基盤](./diagrams)で`forsteri`テーマのSVGを生成してから画像として参照します。

## 詳細リファレンス

- レイアウト一覧・クラスの使い分け: `marp-theme/themes/forsteri/README.md`
- 検証の仕組みと全サンプル: `marp-theme/README.md`
- 全機能のカタログ: `examples/feature-showcase.md`をPDF化して参照
