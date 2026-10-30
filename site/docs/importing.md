---
title: 取り込み方
sidebar_position: 5
description: 利用プロジェクトへテンプレートを取り込み、版を記録する方法の要約です。
---

# 取り込み方

利用プロジェクトへは**コピーで取り込み、取り込み元のコミットを記録**します。テンプレートを依存パッケージとして参照せず、利用側の文書と一緒に Git で管理します。詳しい手順は docs-toolkit の [docs/importing.md](https://github.com/forsteri/docs-toolkit/blob/main/docs/importing.md) が正本です。

1. 使う形式だけを `scripts/import.mjs add` で決めた場所（`tools/pandoc-template/` など）へコピーする。取り込み元のURL・完全なSHAが `toolkit-imports.json` に記録される
2. `brand/` も同じように取り込み、自分のブランド値を書いて当てる
3. 利用側で変えたファイルは `import.mjs status` で一覧にできる
4. 取り込み直しと撤回は `import.mjs update`。上流の削除・移動も当たり、利用側の改変は3方向マージで残る。改善はテンプレート側へ戻す

使わない形式は取り込みません。迷ったら文書は Pandoc、説明は One-pager、発表は Marp から始めます。

この道具を入れた変更（docs-toolkit #17）の説明は[変更の説明](./changes.md)にあります。

## 動作確認済みの組み合わせ

docs-toolkit-sample で確かめた各リポジトリのコミットは、docs-toolkit の [verified.json](https://github.com/forsteri/docs-toolkit/blob/main/verified.json) が正本です（完全なSHAとタグ）。README の表はその先頭の短縮です。記録した組み合わせは `node scripts/fetch.mjs --into <dir>` でそのSHAのまま取得できます。
