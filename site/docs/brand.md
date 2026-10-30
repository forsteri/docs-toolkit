---
title: ブランドの差し替え
sidebar_position: 6
description: 主色などのブランド値を、全テンプレートでまとめて差し替える方法の要約です。
---

# ブランドの差し替え

色とフォントの値は、各テンプレートの `@brand-tokens-start`〜`@brand-tokens-end` ブロックだけに書かれています。docs-toolkit の `brand/` に自分の値を書き、`apply.mjs` で全テンプレートのブロックへ当てます。詳しくは [brand/README.md](https://github.com/forsteri/docs-toolkit/blob/main/brand/README.md) が正本です。

```bash
# 書き込まずに、どの値が変わるかを見る（違いがあれば終了コード1）
node brand/apply.mjs --check tools/pandoc-template/styles/document.css docs-site/src/css/custom.css

# 書き込む（ブロックのあるファイルを並べる）
node brand/apply.mjs tools/pandoc-template/styles/document.css docs-site/src/css/custom.css onepager/theme.css
```

## 主色と一緒に決める色

| 色 | 使われる場所 | 決め方 |
| --- | --- | --- |
| 主色（`accent` 系） | 全形式のリンク・強調・見出しの印 | ブランドの主色 |
| 系列色1（`series-1`） | スライドのグラフ・スマートアート・Mermaid の先頭色 | 主色の明るい版。系列色2〜8と見分けがつく色 |
| Night（`night-*`） | Marp・Slidev の暗い表紙と章扉 | 主色の色相に寄せたごく暗い背景と、少し色を混ぜた白 |
| Docusaurus のダーク | このサイトのダークモード | `tokens.dark.css` に別に書く |

系列色1と Night は主色から自動では決まりません。主色から計算すると系列色のほかの色とぶつかることがあるためです。

既定の主色はティール `#0f766e` です。取り込みの実例（docs-toolkit-sample）ではインディゴ `#4338ca` に差し替えています。
