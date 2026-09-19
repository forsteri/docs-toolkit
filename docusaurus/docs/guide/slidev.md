---
title: Slidevテーマの使い方
description: Agent前提のSlidevテーマ・スマートアートコンポーネント・パターン集を使う最初の一歩です。
---

# Slidevテーマの使い方

Marpと同じ`forsteri`配色のローカルSlidevテーマです。AgentがMarkdownとpropsを生成し、人は確認と微修正に集中する運用を想定しています。配布は静的SPA（Webホスト）またはPDFです。

## 前提

- Node.js 24.19.0（`slidev/.node-version`で固定。詳細な要件は`slidev/README.md`）
- 作業ディレクトリは`slidev/`

```bash
cd slidev
npm install
npm run brand:sync   # Marpの forsteri.css から共有トークンを取り込む
npm run check
```

## 最初の一歩

ショーケースを開発サーバで表示して、全レイアウトとスマートアートコンポーネントを確認します。

```bash
npm run dev
```

自分の資料を書くときは、front matterでローカルテーマを参照します。

```yaml
---
theme: ../theme
title: 資料タイトル
---
```

出力は用途で選びます。

```bash
npm run build           # ../dist/showcase/ へ静的SPA
npm run build:patterns  # パターン集をまとめてビルド
npm run export          # ../output/pdf/ へPDF
```

## 覚えておくルール

- レイアウトは`cover` / `section` / `default` / `statement` / `metric` / `ending`の6種です。`ending`は見出し・本文を中央に置くだけのシンプルな終端です。
- **色を選ばない**: スマートアート8コンポーネント（Process / Cycle / Pyramid / Matrix2x2 / Funnel / KpiCards / Roadmap / Comparison）はpropsに配列・オブジェクトを渡すだけで、系列色`--forsteri-series-1..8`が項目順に自動で割り当てられます。色を指定するpropsはありません。
- 提案書・進捗報告・意思決定・キックオフ・振り返りの5パターンは`patterns/`のテンプレートから始めます。
- Mermaidコードブロックはそのまま書けば、`forsteri`テーマとAWSアイコン（`aws:` prefix）が自動適用されます（[図解基盤](./diagrams)参照）。
- PDF・PPTXではアニメーションが静的化されます。動きを残す配布にはSPAを使います。

## 詳細リファレンス

- レイアウト・スマートアートコンポーネントのprops: `slidev/theme/README.md`
- パターンの選び方とAgent向け禁止事項: `slidev/patterns/README.md`
- セットアップ要件・依存監査・ホスト方針: `slidev/README.md`
