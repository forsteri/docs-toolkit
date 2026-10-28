# brand — ブランド値をまとめて差し替える

6つのテンプレートは、色とフォントの値を `@brand-tokens-start`〜`@brand-tokens-end` のブロックだけに書き、本体は役割名（`--dt-accent` など）で参照しています。このフォルダは、利用プロジェクトのブランド値を1つのファイルに書き、取り込んだ各テンプレートのブロックへ名前で当てるための道具です。

| ファイル | 中身 |
| --- | --- |
| `tokens.css` | ブランド値の雛形。値はテンプレートの既定（主色ティール）の写しなので、そのまま当てても何も変わらない |
| `apply.mjs` | `tokens.css` の値を、指定したファイルのトークンブロック内の同名トークンへ書き込む。依存なし、Node.js 20以上 |

## 使い方

利用プロジェクトへ `brand/` ごとコピーし、`tokens.css` の値を自分のブランドに書き換えてから当てます。

```bash
# 書き込まずに、どの値が変わるかを見る（違いがあれば終了コード1）
node brand/apply.mjs --check tools/pandoc-template/styles/document.css docs-site/src/css/custom.css

# 書き込む
node brand/apply.mjs tools/pandoc-template/styles/document.css docs-site/src/css/custom.css \
  slides/marp/theme/forsteri.css slides/slidev/theme/styles/brand-tokens.css onepager/theme.css
```

- 規則の外（または `:root { }` の中）の宣言は、ブロック内で最初に現れる同名の宣言（ライト側）へ当てます。
- `[data-theme='dark'] { }` の中の宣言は、ブロック内の同じセレクタの規則へ当てます。この規則を持つのはDocusaurusだけで、ほかのテンプレートでは無視します。
- テンプレートのブロックに無い名前は無視します。どのファイルにも無い名前は警告するので、綴りの誤りに気づけます。
- ブランド値のファイルを別の場所に置くときは `--tokens <file>` で指定します（省略時は `apply.mjs` と同じフォルダの `tokens.css`）。
- 値を変えたトークンだけを書き換えます。コメントや並び順はそのまま残ります。

`--check` は、取り込み直したあとにブランド値が当たっているかの確認にも使えます。

## ブランド面の範囲

どのトークンが `tokens.css` から変わり、どれが変わらないかの一覧です。「変わらない」の列は、主色を変えても既定の配色のまま残るものです。

| リポジトリ | ブロックのあるファイル | `tokens.css` で変わる | 当てたあとに実行する | 変わらない（既定のまま） |
| --- | --- | --- | --- | --- |
| pandoc-template | `styles/document.css` | `accent` `accent-strong` `accent-soft` | なし | 上部バー・コード面・注記の状態色（ニュートラルな配色として固定） |
| docusaurus-template | `src/css/custom.css` | ライトの `accent` `accent-strong` `accent-soft` `accent-tint` `on-accent`、ダークの `accent` `accent-soft` | `npm run brand:derive -- --write`（主色の段階・info・status-review・強調行を計算）、`npm run build:mermaid` | 上部バー・注記の状態色。派生を計算すれば主色系のティールは残らない |
| one-pager | `theme.css` | `accent` `accent-strong` `accent-soft` | `design/neutral.json` を diagrams の `build:themes -- --tokens` から更新（下記） | なし |
| marp-theme | `themes/forsteri/forsteri.css` | `accent` `accent-strong` `accent-soft` `on-accent` `night-accent-rgb` `night-accent-deep` | なし | **系列色1**（`series-1` `#5eead4`、ティール）、**Nightの背景・面・補足文字**（`night-bg` など、青緑寄り） |
| slidev-theme | `theme/styles/brand-tokens.css` | `accent` `accent-strong` `accent-soft` `on-accent` `night-accent-rgb` | `npm run brand:sync` | 系列色1、Nightの背景・面・補足文字（marp-theme と同じ） |
| diagrams | `tokens/*.css`（取り込んだまま変えない） | 描画時に `--tokens brand/tokens.css` で同名の値を上書き | なし | `forsteri` テーマの系列色1 |

diagrams はファイルを書き換えずに、描画のたびにブランド値を渡します。

```bash
npm --prefix tools/diagrams run render -- diagrams/src/flow.mmd docs/assets/flow.svg --theme neutral --tokens brand/tokens.css
npm --prefix tools/diagrams run build:themes -- --tokens brand/tokens.css --out build/mermaid
cp build/mermaid/neutral.json onepager/design/neutral.json   # One-pager の配色スナップショット
```

### 既知の穴

- **主色・濃（`accent-strong`）の既定値が2つある。** 文書系（Pandoc・Docusaurus・One-pager・diagrams `neutral`）は `#0a534d`、スライド系（Marp・Slidev・diagrams `forsteri`）は `#115e59` です。`tokens.css` ではコメントにしてあり、ブランドを変えるときに1色に決めます。
- **系列色1とNightのパレットはティール由来のまま。** 系列色1はティール、Nightの背景・面・補足文字は青緑寄りの暗色で、主色を変えても残ります。主色と独立した固定色として扱うか、ブランド面に加えるかは未決です。直すときは marp-theme・slidev-theme・diagrams の各リポジトリで行います。
- **Docusaurusのダーク側は `tokens.css` の `[data-theme='dark']` に書く。** ライト側の値から自動では決まりません。
