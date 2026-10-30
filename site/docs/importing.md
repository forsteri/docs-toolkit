---
title: 取り込み方
sidebar_position: 5
description: 利用プロジェクトへテンプレートを取り込み、版を記録する方法の要約です。
---

# 取り込み方

利用プロジェクトへは**コピーで取り込み、取り込み元のコミットを記録**します。テンプレートを依存パッケージとして参照せず、利用側の文書と一緒に Git で管理します。詳しい手順は docs-toolkit の [docs/importing.md](https://github.com/forsteri/docs-toolkit/blob/main/docs/importing.md) が正本です。

1. 使う形式だけを、決めた場所（`tools/pandoc-template/` など）へコピーする
2. 取り込み元のコミットと、利用側で改変したファイルを記録する
3. `brand/` をコピーし、自分のブランド値を書いて当てる
4. 取り込み直すときは記録を見て差し替える。改善はテンプレート側へ戻す

使わない形式は取り込みません。迷ったら文書は Pandoc、説明は One-pager、発表は Marp から始めます。

:::pending[道具化の判断待ち]
取り込み・取り込み直し・撤回をコマンドにする変更（docs-toolkit #17）が判断待ちです。中身は[変更の説明](./changes.md)の1枚にまとめています。マージされると、手順の2と4は `scripts/import.mjs` が行います。
:::

## 動作確認済みの組み合わせ

| 確認日 | pandoc-template | docusaurus-template | one-pager | marp-theme | slidev-theme | diagrams |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-10-28（`v0.1.0`） | `e961270` | `298e7c6` | `10c3735` | `25e8108` | `eab5fcb` | `58c60b7` |

docs-toolkit-sample で全形式の生成を確かめた組み合わせです。新しい組み合わせは docs-toolkit の README に足していきます。
