---
title: Docusaurusテンプレートの使い方
description: このサイト自身を雛形として、新しいドキュメントサイトを立ち上げる最初の一歩です。
---

# Docusaurusテンプレートの使い方

このサイト自身が雛形です。検索・ナビゲーション・ダークモード・Mermaid・執筆規約対応の部品を備えたdocs-only構成を、コピーしてそのまま使えます。

## 前提

- Node.js 20以上とnpm

## 最初の一歩

`docusaurus/`ディレクトリをコピーし、開発サーバを起動します。

```bash
cd docusaurus
npm install
npm start
```

サイト名やナビゲーションは`docusaurus.config.js`、サイドバー構成は`sidebars.js`で変更します。文書は[文書テンプレート](/document-templates)からコピーして`docs/`へ置きます。

本番用の静的ファイルを生成します。**ローカル検索の索引は本番ビルドでのみ生成されます。**

```bash
npm run build
npm run serve
```

## 公開先の設定

`docusaurus.config.js`の`url`と`baseUrl`は、公開先に合わせて変更します。このリポジトリはGitHub Pages（`https://forsteri.github.io/docs-toolkit/`）を想定して`url: 'https://forsteri.github.io'`、`baseUrl: '/docs-toolkit/'`にしています。独自ドメインやルート直下で公開する場合は`baseUrl: '/'`へ戻します。

## 使える部品

Markdownの中でimportなしに使えます。見本はすべて[スタイル確認ページ](/style-check)にあります。

- **カスタム注記**: `:::decision`（決定）・`:::pending`（未決）・`:::assumption`（前提）。執筆規約の「事実・判断・仮定・未決事項を区別する」に対応します（使い分けは[書き方](/conventions/writing-style#注記)）
- **DocMeta**: 文書ID・ステータスバッジなどのメタ情報表
- **Tabs / details**: OS別手順の書き分けと折りたたみ
- **Mermaid**: コードブロックを書くだけでテーマ適用（[図解基盤](./diagrams)）

## 詳細リファレンス

- 構成・必要環境・方針: `docusaurus/README.md`
- 追加できる運用オプション（announcement bar・リダイレクト等）: `docusaurus/README.md`の選択肢一覧
