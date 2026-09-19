# Docusaurus document template

継続的に更新する技術文書を、左ナビゲーションとページ内目次を備えたサイトとして公開するためのdocs-only構成です。docs-toolkitの利用ガイド（各形式の最初の一歩）もこのサイトに収録しています。

AWSドキュメントを参考に、情報の探索と読みやすさを優先したニュートラルなスタイルです。Pandoc版と見出し、リンク、表、コード、注記の読み味を揃え、主色（リンク・アクティブ項目・注記）はツールキット共通のティール `#0f766e` にしています。

## 必要環境

- Node.js 20以上
- npm

## 使い方

```bash
npm install
npm start
```

本番用の静的ファイルを生成します。ローカル検索の索引は本番ビルドでのみ生成されます。

```bash
npm run build
npm run serve
```

生成物は `build/` に出力されます（`.gitignore`対象）。

## 公開先（url / baseUrl）

`docusaurus.config.js` の `url` と `baseUrl` は公開先に合わせます。

| 公開先 | `url` | `baseUrl` |
| --- | --- | --- |
| GitHub Pages（このリポジトリの既定） | `https://forsteri.github.io` | `/docs-toolkit/` |
| 独自ドメインのルート | `https://example.com` | `/` |
| ローカル確認のみ | 任意 | `/docs-toolkit/`のまま（`npm run serve`は`http://localhost:3000/docs-toolkit/`で開く） |

`baseUrl`を変えると、`npm run serve`で開くパスも変わります。`onBrokenLinks: 'throw'`にしているため、内部リンク切れはビルド時に検出されます。

## 構成

| Path | Role |
| --- | --- |
| `docusaurus.config.js` | docs-onlyサイト、ナビゲーション、フッタ、公開先URLの設定 |
| `sidebars.js` | 左ナビゲーションの構成 |
| `src/css/custom.css` | ニュートラルな技術文書テーマ（主色トークンは`../diagrams/themes/neutral.json`と`diagrams`の`npm run check`で照合される） |
| `src/mermaid-icons.js` | AWS 2026 Q3 Iconifyパックの登録 |
| `src/theme/Mermaid/index.jsx` | neutralライト／組み込みdarkのモード別描画 |
| `docs/guide/` | ツールキット利用ガイド（各形式の最初の一歩） |
| `docs/conventions/` | 文書種別と書き方のガイド |
| `docs/document-templates/` | 設計書、手順書、判断記録、ランブックの雛形 |
| `docs/style-check.md` | テーマ調整用のスタイル確認ページ（サイドバー非表示。Mermaid節は`diagrams/samples/*.mmd`と同期） |
| `src/components/DocMeta/` | 文書メタ情報コンポーネント |
| `src/theme/Admonition/Types.js` | 規約対応カスタム注記（decision / pending / assumption） |

## 方針

- 装飾画像は使わず、見出し階層、ナビゲーション、検索性を優先します。
- 色はティールの主色と灰色の面・罫線だけで構成し、スライド向けの`forsteri`テーマとは主色の系統だけを共有します。
- `custom.css`の`--ifm-color-primary` / `--ifm-color-primary-lightest` / `--ifm-font-color-base` / `--ifm-background-surface-color` / `--ifm-border-color` / `--doc-muted` / `--ifm-font-family-base`は図解基盤の`neutral`テーマと一致させる必要があります。変更したら`cd ../diagrams && npm run check`を通してください。

Mermaidコードブロックはライトモードで`../diagrams/themes/neutral.json`、ダークモードでMermaid組み込み`dark`を使用します。AWS構成図では`aws:` prefixを利用できます。共通規約とアイコン名は[`../diagrams/README.md`](../diagrams/README.md)および`../diagrams/assets/aws/2026-q3/manifest.json`を参照してください。

## 必要になったら足せる選択肢

現時点では導入せず、必要になった時点で追加を検討します。

- `showLastUpdateAuthor`: 最終更新の著者表示（現在は時刻のみ）
- announcement bar（`themeConfig.announcementBar`）: サイト全体のお知らせ帯
- `@docusaurus/plugin-client-redirects`: ページ移設時のリダイレクト
- versioning / i18n: 単一言語・最新版のみの運用のため不使用。前提が変わるまで導入しません
- docsの`tags`: 文書数が増えた場合の横断軸。導入時はタグ語彙の規約を先に決めます
- llms.txt生成プラグイン: Agent向けのMarkdown出力。必要になった段階で再評価します
- GitHub Actionsでの自動デプロイ: `npm run build`の生成物を`gh-pages`へ配置するワークフロー

## 依存関係メモ

Docusaurus 3.10.2の公式雛形に合わせて、`future.v4`と`@docusaurus/faster`を有効にしています。Node.jsとDocusaurusの要件を変更する場合は、公式の新規プロジェクト雛形との差分も確認します。

`npm audit`では、Docusaurusのビルドツールが使用する`image-size`と`serialize-javascript`に修正版未提供の警告が出ます。生成した静的サイトへ`node_modules`は配布されませんが、信頼できない画像や設定を取り込んだ状態でビルドしないでください。依存更新時に解消状況を再確認します。
