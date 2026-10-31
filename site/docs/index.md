---
id: overview
title: docs-toolkit
slug: /
sidebar_position: 1
description: 技術文書とプレゼンテーションを作るテンプレート群の全体像です。
---

docs-toolkit は、技術文書とプレゼンテーションを作るための6つのテンプレートと、それらに共通するブランドの道具の集まりです。目的は**作業の中身を、人が判断できる形で共有すること**です。AIに作業を説明してもらうときも、自分で説明するときも、同じ部品と同じ見た目で書けます。

## 説明の大きさで形式を選ぶ

| 説明したいもの | 形式 | 例 |
| --- | --- | --- |
| 1つの変更を、承認してよいか判断してもらう | One-pager（変更の説明） | [変更の説明](./changes.md) |
| 概念・方針・構成・比較を1枚で | One-pager | [One-pagerの使い方](./guide/one-pager.md) |
| 発表・報告・提案 | Marp / Slidev | [Marp](./guide/marp.md)、[Slidev](./guide/slidev.md) |
| ファイル1つで配る設計書・手順書 | Pandoc | [Pandoc](./guide/pandoc.md) |
| プロジェクト全体の構成・使い方・判断・計画 | Docusaurus | このサイト |

AIに説明を頼むときの使い方の一例を[AIに説明させる](./explaining.md)にまとめています（任意）。

## 最初に読むもの

1. [AIに説明させる](./explaining.md)：どの大きさの説明に、どの形式を使うか
2. [リポジトリの役割](./repos.md)：6つのリポジトリと docs-toolkit 自身の分担
3. [取り込み方](./importing.md)と[ブランドの差し替え](./brand.md)：自分のプロジェクトで使う
4. [ロードマップ](./roadmap.md)：次にやること

:::note[このサイトについて]
このサイトは docs-toolkit リポジトリの `site/` にあり、docusaurus-template（`298e7c6`）を取り込んで作っています。ツールキットを自分自身の説明に使う最初の例です。
:::
