# docs-toolkit — ドキュメントツールキット

技術文書とプレゼンテーションを作るためのテンプレート群の**入口**です。テンプレートそのものは形式ごとの6つのリポジトリにあり、このリポジトリには索引・形式の選び方・取り込み方と、全テンプレートに共通するブランド値の道具（[`brand/`](brand/README.md)）だけを置いています。

v0.1.0 まではこのリポジトリに6形式が同居していました。v0.2.0 で形式ごとのリポジトリに分割し、各形式の中身はここから削除しました（[CHANGELOG](CHANGELOG.md)）。

## リポジトリ

| リポジトリ | 形式 | 使いどころ | 見た目 |
| --- | --- | --- | --- |
| [pandoc-template](https://github.com/forsteri/pandoc-template) | Pandoc | 単体HTML / PDFとして配る設計書・手順書・判断記録・ランブック | 文書系（ニュートラル＋主色） |
| [docusaurus-template](https://github.com/forsteri/docusaurus-template) | Docusaurus | 検索とナビゲーション付きで継続更新するドキュメントサイト。執筆規約と全形式の利用ガイドもここ | 文書系 |
| [one-pager](https://github.com/forsteri/one-pager) | 単体HTML | 概念・方針・構成・比較を1枚で説明する資料（画面共有・Agent生成前提） | 文書系の配色で、大きな文字と少ない部品 |
| [marp-theme](https://github.com/forsteri/marp-theme) | Marp | Markdownから作るPDFのスライド。人手でもAgentでも書ける | スライド系（見出し帯・章扉・系列色・Night） |
| [slidev-theme](https://github.com/forsteri/slidev-theme) | Slidev | 図解コンポーネントと用途別パターンを使うスライド / 静的SPA | スライド系 |
| [diagrams](https://github.com/forsteri/diagrams) | Mermaid | 上の全形式で同じ見た目の図（SVG）を出す。AWS公式アイコン入り | `neutral`（文書系）/ `forsteri`（スライド系） |

どのリポジトリも単独で動き、ほかのリポジトリを取得しません。各リポジトリの README に必要環境・最初の実行・検査コマンドがあります。

取り込みの実例は [docs-toolkit-sample](https://github.com/forsteri/docs-toolkit-sample)（架空の配送追跡API「Hakobi Track」）です。6つすべてを取り込み、ブランド値を差し替えて全形式を生成しています。

## 形式の選び方

| 作りたいもの | 形式 |
| --- | --- |
| ファイル1つで渡す・印刷する文書 | pandoc-template |
| 何本もの文書を継続して更新し、検索させたい | docusaurus-template |
| 会議で1枚見せて説明する | one-pager |
| 発表資料をPDFで配る | marp-theme |
| 図解の多い発表資料、ブラウザで見せる資料 | slidev-theme |
| どの形式にも載せる図 | diagrams（ほかの形式と組み合わせる） |

迷ったら、文書は pandoc-template、発表は marp-theme から始め、必要になった形式だけを足します。使わない形式を取り込む必要はありません。

## 取り込み方

利用プロジェクトへは**コピーで取り込み、取り込み元のコミットを記録**します。手順と記録の書式は [docs/importing.md](docs/importing.md) にあります。

1. 使う形式のリポジトリを `scripts/import.mjs add` で利用プロジェクトの決めた場所（`tools/pandoc-template/` など）へコピーする。取り込み元のURL・サブフォルダ・完全なSHAが `toolkit-imports.json` に記録される
2. [`brand/`](brand/README.md) も同じように取り込み、`tokens.css`（ライト）と `tokens.dark.css`（Docusaurusのダーク）に自分のブランド値を書いて `apply.mjs` で当てる
3. 取り込み直しと撤回は `scripts/import.mjs update` で行う。上流の削除・移動も当たり、利用側の改変は3方向マージで残る
4. 改善はテンプレート側のリポジトリへ戻す

## 動作確認済みの組み合わせ

docs-toolkit-sample で確認した、各リポジトリのコミットです。取り込むときの基準にしてください。正本は機械可読な [`verified.json`](verified.json)（リポジトリURL・完全なSHA・タグ・サンプルのSHA）で、下の表はその先頭の短縮です。

| 確認日 | サンプル | pandoc-template | docusaurus-template | one-pager | marp-theme | slidev-theme | diagrams | docs-toolkit |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-29 | `6dff849` | `e961270` | `298e7c6` | `10c3735` | `25e8108` | `eab5fcb` | `58c60b7` | `aef3903`（`brand/`） |
| 2026-10-28 | `da6a2aa` | `e961270` | `298e7c6` | `10c3735` | `25e8108` | `eab5fcb` | `58c60b7` | — |

6リポジトリの上の各コミットには `v0.1.0` のタグがあります。記録した組み合わせは、そのSHAのまま取得できます（`--sample` でサンプルも取得）。

```bash
node scripts/fetch.mjs --into ../toolkit-2026-10-29             # 先頭の組み合わせ
node scripts/fetch.mjs --into ../toolkit-2026-10-28 --set 2026-10-28
```

版の付け方は [docs/importing.md の「版」](docs/importing.md#版) にあります。

## 共通の方針

- 文書本文はMarkdown（One-pagerはHTML）を原本とし、内容と見た目を分けます。書き手は色やレイアウトを選びません。
- 色とフォントの値は各テンプレートの `@brand-tokens-start`〜`@brand-tokens-end` ブロックだけに書き、本体は役割名（`--dt-accent`、`--dt-text-muted`、`--dt-line` など）で参照します。ブランドの差し替えはこのブロックの値を変えるだけで済みます（[ブランド面の範囲](brand/README.md#ブランド面の範囲)）。
- 装飾画像は使わず、線・面・主色だけで構成します。既定の主色はティール `#0f766e` です。
- 文書・コードコメントは日本語で書きます。

`brand/` と各テンプレートの組み合わせ、版の記録、取り込みの道具は `node scripts/check.mjs` で検査できます。`verified.json` の先頭の組み合わせを記録したSHAで取得して検査し、`--set <確認日>` で別の組み合わせ、`--repos <6リポジトリを並べたフォルダ>` で手元の未マージの変更を検査します（[検査の内容](brand/README.md#検査)）。開発の方向性は [ROADMAP.md](ROADMAP.md) にあります。

## ライセンス

[MIT License](LICENSE)です。各リポジトリのライセンスと同梱物の利用条件は、それぞれの `LICENSE` と `THIRD_PARTY_NOTICES.md` を見てください。
