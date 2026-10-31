---
title: 変更の説明
sidebar_position: 3
description: docs-toolkit 自身の変更を One-pager で1枚に説明したものの一覧です。
---

# 変更の説明

docs-toolkit 群の変更を、承認する前に One-pager の「変更の説明」の型で1枚にまとめたものです。書き方は[AIに説明させる（使い方の例）](./explaining.md)にあります。

| 日付 | 変更 | 判断してほしいこと | 状態 |
| --- | --- | --- | --- |
| 2026-10-30 | <a href="/explain/2026-10-30-import-tooling.html" target="_blank">取り込みと版の記録を道具にする</a>（docs-toolkit #17、docs-toolkit-sample #2） | この順番でマージしてよいか | マージ済み（2026-10-30） |

![取り込みと版の記録を道具にする（1枚の全体）](/explain/2026-10-30-import-tooling.png)

1枚は、判断を頼んだときのまま残します。1枚は `site/static/explain/` に単体HTMLとPNGで置き、`theme.css` は one-pager から写しています。新しい1枚を足すときは、同じ場所に `日付-名前.html` で置き、上の表に1行足します。

```bash
node <one-pager を取得した場所>/scripts/check.mjs static/explain/2026-10-30-import-tooling.html
```
