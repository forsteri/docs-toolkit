# brand — ブランド値をまとめて差し替える

6つのテンプレートは、色とフォントの値を `@brand-tokens-start`〜`@brand-tokens-end` のブロックだけに書き、本体は役割名（`--dt-accent` など）で参照しています。このフォルダは、利用プロジェクトのブランド値を1つのファイルに書き、取り込んだ各テンプレートのブロックへ名前で当てるための道具です。

| ファイル | 中身 |
| --- | --- |
| `tokens.css` | ライトのブランド値の雛形。値はテンプレートの既定（主色ティール）の写しなので、そのまま当てても何も変わらない。diagrams の `--tokens` にもこのファイルを渡す |
| `tokens.dark.css` | Docusaurus のダークモードの値の雛形。docusaurus-template にだけ当たる |
| `apply.mjs` | `tokens.css` の値を、指定したファイルのトークンブロック内の同名トークンへ書き込む。依存なし、Node.js 20以上 |
| `contrast.mjs` | 当てたあとのトークンブロックで、文字と背景のコントラスト比を確かめる。依存なし |
| `presets/` | そのまま当てられる配色の見本。いまは `blue.css`（青系）と `blue.dark.css` |

## 使い方

利用プロジェクトへ `brand/` ごとコピーし、`tokens.css` の値を自分のブランドに書き換えてから当てます。

```bash
# 書き込まずに、どの値が変わるかを見る（違いがあれば終了コード1）
node brand/apply.mjs --check tools/pandoc-template/styles/document.css docs-site/src/css/custom.css

# 書き込む
node brand/apply.mjs tools/pandoc-template/styles/document.css docs-site/src/css/custom.css \
  slides/marp/theme/forsteri.css slides/slidev/theme/styles/brand-tokens.css onepager/theme.css
```

- どちらのファイルも、規則（`{ }`）で囲まない宣言の並びで書きます。diagrams の `--tokens` は同名の宣言を後勝ちで読むので、ライトとダークを1つのファイルに混ぜるとダークの値が図に入ってしまいます。`apply.mjs` は規則を含むファイルをエラーにします。
- `tokens.css` の値は、ブロック内で最初に現れる同名の宣言（ライト側）へ当てます。
- `tokens.dark.css` の値は、ブロック内の `[data-theme='dark'] { }` の規則へ当てます。この規則を持つのはDocusaurusだけで、ほかのテンプレートでは使いません。ライトの値のファイル名の拡張子の前に `.dark` を入れたファイル（`tokens.css` なら `tokens.dark.css`、`presets/blue.css` なら `presets/blue.dark.css`）があれば自動で読みます（`--dark-tokens <file>` で別の場所も指定できます）。
- テンプレートのブロックに無い名前は無視します。どのファイルにも無い名前は警告するので、綴りの誤りに気づけます。
- ライトの値を別の場所に置くときは `--tokens <file>` で指定します（省略時は `apply.mjs` と同じフォルダの `tokens.css`）。
- 値を変えたトークンだけを書き換えます。コメントや並び順はそのまま残ります。

`--check` は、取り込み直したあとにブランド値が当たっているかの確認にも使えます。

## プリセット

`presets/` には、そのまま当てられる配色を置いています。自分のブランド色がまだ無いときや、見た目の方向を比べたいときに使います。気に入ったら `tokens.css` へ写して育てます。

```bash
node brand/apply.mjs --tokens brand/presets/blue.css <テンプレートのCSS>...   # blue.dark.css も一緒に読む
```

当てたあとは、`tokens.css` のときと同じく「当てたあとに実行する」手順（下の表）を実行します。diagrams には `--tokens brand/presets/blue.css` を渡します。

| プリセット | 見た目 | 変える範囲 |
| --- | --- | --- |
| `blue.css` | 濃い青の主色、無彩色のグレー、行政サイトに近い落ち着いた配色 | `tokens.css` の範囲に加えて、文字・罫線・面・注記の状態色。上部バー・コード面・フォントは変えない |

`blue.css` の色は、デジタル庁デザインシステムのデザイントークン（[@digital-go-jp/design-tokens](https://github.com/digital-go-jp/design-tokens) 2.1.0、MIT License、Copyright (c) 2023 デジタル庁）の値を役割名に割り当てたものです。デジタル庁が作成・確認したものではありません。系列色1・Night・Docusaurus のダークは DADS に定義が無いので、同じ青の階調から作りました。

## コントラストの検査

`contrast.mjs` は、当てたあとのトークンブロックの値で、文字と背景のコントラスト比を確かめます。自分のブランド色を当てたときに、読みにくい組み合わせへすぐ気づけます。

```bash
node brand/contrast.mjs tools/pandoc-template/styles/document.css docs-site/src/css/custom.css onepager/theme.css
```

- 文字は 4.5:1 以上（WCAG 2.x の AA。大きい文字の緩和は使いません。デジタル庁デザインシステムも同じ扱いです）、注記の左線のような文字でない部品は 3:1 以上を求めます。`--min <比>` で文字の基準を変えられます。
- 見るのは、本文・見出し・リンク・補足の文字と背景、塗りの上の文字、注記・バッジ・上部バー・コードの文字と面、スライドの Night の文字と背景の組み合わせです。装飾の罫線（`line`）や系列色は見ません。
- Docusaurus は、ライトの値にダークの規則の値を重ねて、ダークも別に見ます。
- 分かっていて残す組み合わせは `--skip <役割名>` で外せます。

## ブランド面の範囲

どのトークンが `tokens.css` から変わり、どれが変わらないかの一覧です。「変わらない」の列は、主色を変えても既定の配色のまま残るものです。

| リポジトリ | ブロックのあるファイル | `tokens.css` で変わる | 当てたあとに実行する | 変わらない（既定のまま） |
| --- | --- | --- | --- | --- |
| pandoc-template | `styles/document.css` | `accent` `accent-strong` `accent-soft` | なし | 上部バー・コード面・注記の状態色（ニュートラルな配色として固定） |
| docusaurus-template | `src/css/custom.css` | ライトの `accent` `accent-strong` `accent-soft` `accent-tint` `on-accent`、ダーク（`tokens.dark.css`）の `accent` `accent-soft` | `npm run brand:derive -- --write`（主色の段階・info・status-review・強調行を計算）、`npm run build:mermaid` | 上部バー・注記の状態色。派生を計算すれば主色系のティールは残らない |
| one-pager | `theme.css` | `accent` `accent-strong` `accent-soft` | `design/neutral.json` を diagrams の `build:themes -- --tokens` から更新（下記） | なし |
| marp-theme | `themes/forsteri/forsteri.css` | `accent` `accent-strong` `accent-soft` `on-accent` `series-1` `night-*`（`night-line` を除く） | なし | 系列色2〜8、`night-line`（白の16%、主色と独立した固定色） |
| slidev-theme | `theme/styles/brand-tokens.css` | marp-theme と同じ（`night-text-soft` `night-accent-deep` は持たない） | `npm run brand:sync` | marp-theme と同じ |
| diagrams | `tokens/*.css`（取り込んだまま変えない） | 描画時に `--tokens brand/tokens.css` で同名の値を上書き（`tokens.dark.css` は渡さない）。`forsteri` では `series-1` も変わる | なし | `forsteri` テーマの系列色2〜8 |

diagrams はファイルを書き換えずに、描画のたびにブランド値を渡します。

```bash
npm --prefix tools/diagrams run render -- diagrams/src/flow.mmd docs/assets/flow.svg --theme neutral --tokens brand/tokens.css
npm --prefix tools/diagrams run build:themes -- --tokens brand/tokens.css --out build/mermaid
cp build/mermaid/neutral.json onepager/design/neutral.json   # One-pager の配色スナップショット
```

### 主色といっしょに決める色

主色を変えるときは、`tokens.css` の主色系に加えて次の色もブランドの色相に合わせて決めます。既定値はどれもティール由来です。

- **系列色1（`series-1`）**：主色の明るい版で、スライドのグラフ・スマートアート・Mermaid（diagrams `forsteri`）の先頭色です。系列色2〜8（黄・藍・桃・黄緑・水色・灰）は主色と独立した固定色なので、系列色1はそれらと見分けがつく色にします。たとえば主色がインディゴなら、明るいインディゴは系列色3（`#a5b4fc`）とほぼ同じなので、`--dt-series-3: #5eead4;` も書いて入れ替えます。
- **Nightパレット（`night-*`）**：Marp・Slidev の `dark` で使う背景・面・文字・アクセントです。背景と面は主色の色相に寄せたごく暗い色、文字は白に主色の色相を少し混ぜた色にすると、既定と同じ雰囲気になります。`night-line`（白の16%）は主色と独立しているので `tokens.css` には載せていません。

`accent-strong` の既定値は全テンプレートで `#0a534d` に揃えています（2026-10-29 まではスライド系だけ `#115e59`）。

### 既知の穴

- **Docusaurusのダーク側は `tokens.dark.css` に書く。** ライト側の値から自動では決まりません。
- **スライドのフッター文字が薄い。** Marp・Slidev・diagrams `forsteri` の `--dt-text-subtle`（`#9ca3af`）は白地で 2.54:1 です。横断検査ではこの名前を外しています。
- **主色といっしょに決める色は自動では決まらない。** 系列色1とNightは手で選びます。主色から計算すると、系列色の他の色とぶつかることがあるためです（上のインディゴの例）。

## 検査

このリポジトリで `node scripts/check.mjs` を実行すると、[`verified.json`](../verified.json) の先頭の組み合わせを記録したSHAで取得し、次を確かめます（依存なし、git が必要）。`--set <確認日>` で別の組み合わせ、`--repos <6リポジトリを並べたフォルダ>` で手元の未マージの変更を検査します。

- `verified.json` の形が正しく、README の表の先頭行と一致する。記録したSHAで取得でき、タグがあれば同じコミットを指す
- 既定の `brand/` を各テンプレートへ当てても何も変わらない
- 既定の `tokens.css` を diagrams の `build:themes --tokens` に渡すと `themes/*.json` と同じものができ、その `neutral.json` で one-pager の検査が通る
- ライトとダークが違う別のブランドを当てると、各テンプレートの「当てたあとに実行する」手順と依存なしの検査が通る（pandoc-template の check-tokens、docusaurus-template の brand:derive・build:mermaid・check と主色系にティールが残らないこと、slidev-theme の brand:sync・brand:check、one-pager の check）。diagrams にはライトの値だけが渡り、docusaurus のダーク側にだけダークの値が入る。marp-theme は値が入ったことだけを見る（変換の検査は Marp CLI が要る）
- 別のブランドを当てると diagrams `forsteri` の系列色1が変わり、Marp・Slidev のトークンブロックに既定のティール系の値が残らない
- 既定値と `presets/` の各プリセットで、コントラストの検査が通る（`--dt-text-subtle` を除く）。プリセットは当てたあとの各テンプレートの手順と検査も通す。淡い主色を当てると検査が失敗する（陰性対照）
- 規則を含む `tokens.css` を `apply.mjs` がエラーにする
- `scripts/import.mjs` の追加・変更・削除・移動・競合・撤回（`scripts/test-import.mjs`）

全形式の出力の確認は docs-toolkit-sample で行います。
