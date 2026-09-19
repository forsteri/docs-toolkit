---
title: One-pagerの使い方
description: 概念・方針・構成を1枚で説明する単体HTMLを作る最初の一歩です。
---

# One-pagerの使い方

概念・方針・構成・ロードマップ・比較を**1枚で説明する単体HTML**です。会議での画面共有やスクリーンショットでの共有を想定し、「大きく、少なく、濃く」を方針にしています。文書系（Pandoc / Docusaurus）と同じニュートラルな配色で、HTMLとCSSだけで動きます。

```text
読む文書                                  見せる資料
Pandoc / Docusaurus  ←  one-pager  →  Marp / Slidev
```

## 前提

- ブラウザだけで表示できます。ビルドは不要です
- 検査にはNode.js 20以上を使います（`npm install`は不要）
- 作業ディレクトリは`one-pager/`

## 最初の一歩

テンプレートをコピーして内容を書き、ブラウザで開きます。

```bash
cd one-pager
cp template.html my-topic.html
open my-topic.html
```

CSSを埋め込んだ1ファイルにして渡すときと、検査を通すときは次を実行します。

```bash
scripts/bundle.sh my-topic.html   # ../output/one-pager/ へ書き出す
npm run check
```

## 覚えておくルール

- **部品だけで組む**: `hero` / `section` / `lead` / `stack` / `columns` / `card` / `callout` / `flow` / `layers` / `diagram`と、主役を示す`key`だけです。`theme.css`にないクラス、`<style>`タグ、`style`属性は使いません。
- **文字を縮めない**: 本文は20px以上、下限は18pxです。収まらなければ情報を削ります（本文は1,000字以下）。1枚に収まらない内容は、スライドか文書にします。
- **補助文字を置かない**: サブタイトル、eyebrow、badge、caption、meta、フッタ、`<small>`は標準部品にありません。薄い文字色もテーマに存在しません。
- **個数の上限**: `h1`と`hero`は1つ、`callout`は1つまで、`key`は2つまで、`section`は1〜4個。`flow`は3〜5項目です。
- **図は生成する**: Mermaid原本から[図解基盤](./diagrams)で`neutral`テーマのSVGを生成し、`.diagram`に置きます。手で描きません。
- **HTMLを直接書く**: Markdown原本を持たない唯一の形式です。Agentが生成し、人が確認する運用を想定しています。

## 詳細リファレンス

- 部品の一覧・用途別の組み立て・Agent向け生成ルール・検査項目: `one-pager/README.md`
- 用途別サンプル（概念 / アーキテクチャ / ロードマップ / 比較）: `one-pager/examples/`
