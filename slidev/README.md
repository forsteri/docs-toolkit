# forsteri Slidev Theme and Patterns

個人用ドキュメントツールキット（docs-toolkit）のローカルSlidevテーマ、データ駆動の図解コンポーネント、プレゼンのパターン集です。AgentがMarkdownとJSON形式のpropsを生成し、人は内容の確認と微修正に集中する運用を想定しています。

## 構成

| パス | 用途 |
|---|---|
| `theme/` | ローカルテーマ（layouts / components / styles） |
| `theme/setup/mermaid.ts` | forsteriテーマとAWS IconifyパックのMermaid登録 |
| `examples/showcase.md` | 全レイアウト・全図解の回帰確認用デッキ |
| `patterns/` | 提案書・進捗報告・意思決定・キックオフ・振り返りのテンプレート |
| `scripts/sync-brand.mjs` | Marpの共有トークンをSlidevテーマへ同期 |
| `scripts/check-structure.mjs` | 必須レイアウト・図解・系列色の配線・showcaseの網羅を検証 |
| `scripts/build-patterns.mjs` | 5つのパターンを個別SPAへビルド |
| `scripts/export-showcase.mjs` | ショーケースをPDFへ書き出し |

色・フォントの単一ソースは`../marp-theme/themes/forsteri/forsteri.css`の`@forsteri-shared-tokens-start`〜`end`ブロックです。`npm run brand:sync`で`theme/styles/brand-tokens.generated.css`へ複写します。生成済みファイルを直接編集しないでください。画像資産は持たないため、同期対象はトークンだけです。

Mermaidコードブロックはテーマの`setup/mermaid.ts`から`../diagrams/themes/forsteri.json`を読み込みます。AWS構成図では`aws:` prefixを使用できます。図種、classDef、原本管理の規約は[`../diagrams/README.md`](../diagrams/README.md)にまとめています。`examples/showcase.md`のMermaidサンプルは`<!-- diagrams:<name>:start -->`〜`end`のマーカーで囲み、`../diagrams/samples/<name>.mmd`と本文を一致させます。

## セットアップ

`.node-version`に固定したNode.js 24.19.0を推奨します。代替する場合は22.18.0以上、または24.11.0以上を使用してください。固定した依存グラフ内のVue Router配下Babel 8がこの要件を宣言しており、22.16.0ではビルドできる場合も`npm install`のengine警告が出るサポート外構成です。依存バージョンは再現性のため固定しています。

```bash
npm install
npm run brand:sync
npm run check
```

- `@slidev/cli`: `52.19.1`
- `playwright-chromium`: `1.62.1`

### 依存関係監査（2026-08-27）

`npm audit`で検出されたDOMPurifyの指摘は、互換性のある`3.4.14`を`overrides`で固定して解消しました。残る4件（high）は、PPTX生成用の`pptxgenjs`が参照する`image-size@1.2.1`のICNS/JXL/HEIF解析に関するDoSです。現時点で非破壊の修正版はなく、`npm audit fix --force`はSlidev CLIの破壊的な変更を伴うため適用していません。

本構成は信頼済みのローカル画像だけをビルド入力とし、配布SPA上で任意画像を解析しません。上流修正版の公開時に固定バージョンを更新し、再監査してください。

## 開発・配布

```bash
npm run dev
npm run build
npm run build:patterns
npm run export
```

- `npm run dev`: ショーケースを開発サーバで表示
- `npm run build`: `dist/showcase/`へ静的SPAを生成（`--out`は入力Markdownの階層基準で解決される）
- `npm run build:patterns`: 5パターンを`dist/pattern-*/`へ生成
- `npm run export`: ショーケースを`../output/pdf/forsteri-slidev-showcase.pdf`へ出力

`dist/`は任意の静的Webサーバへ配置できます。手渡しにはPDFを使い、動きを残したい場合はSPAを配置します。

PDF・PPTXではクリックアニメーションやインタラクティブ操作が静的化されるため、動きを残す配布にはSPAを使用してください。クリック途中の状態もPDFへ含める場合は、Slidev CLIの`--with-clicks`を追加して個別に書き出します。

## テーマ指定

`examples/`や`patterns/`と同じ階層のMarkdownでは次のように指定します。

```yaml
---
theme: ../theme
title: 資料タイトル
---
```

レイアウト、スマートアートのprops、色の使い分けは[`theme/README.md`](theme/README.md)を参照してください。典型パターンの選び方とAgent向け禁止事項は[`patterns/README.md`](patterns/README.md)にまとめています。
