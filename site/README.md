# site — docs-toolkit の説明サイト

docs-toolkit 群の全体像・各リポジトリの役割・AIに説明させるときの決まり・変更の説明・ロードマップを載せる Docusaurus サイトです。[docusaurus-template](https://github.com/forsteri/docusaurus-template) の `298e7c6` を取り込み、テンプレート自身の記入例・文書テンプレート・検証記録を外して作りました。

```bash
cd site
npm ci
npm run start     # 開発サーバー
npm run build     # build/ へ静的サイト
npm run check     # トークンの直書き検査
```

| 場所 | 中身 |
| --- | --- |
| `docs/` | サイトの本文。`guide/` と `conventions/` は docusaurus-template から取り込んだまま |
| `static/explain/` | One-pager の「変更の説明」。単体HTML・PNG と、one-pager から写した `theme.css` |
| `src/theme/Mermaid/` | Webフォントの読み込みを待ってから図を描く修正（docusaurus-template へも戻す） |

取り込み元から変えたファイルは `docusaurus.config.js`（サイト名）、`package.json`（名前）、`sidebars.js`、`docs/` の本文、`src/theme/Mermaid/index.jsx` です。
