# One-pager

概念・方針・構成・ロードマップ・比較を**1枚で説明する単体HTML**の出力形式です。会議での画面共有、スクリーンショットでの共有、後から見返す説明資料を想定しています。SPAや一般のWebサイトを作るためのものではありません。

```text
読む文書                                  見せる資料
Pandoc / Docusaurus  ←  one-pager  →  Marp / Slidev
```

方針は一言で **「大きく、少なく、濃く」** です。1枚で一つのことを明快に説明するために、テーマ側に次のレールを敷いています。

- 文字は大きく（本文20px以上、下限18px）。収まらないときは文字を縮めず、情報を削る
- 文字階層は Title / Heading / Body の3段だけ。eyebrow・badge・caption・meta のような補助文字は用意しない
- 文字色は濃い色だけ。薄いグレーの補助テキスト用トークンは存在しない
- 部品は10個と強調修飾子1つだけ。新しいクラスを足さず、組み合わせで作る
- 検査スクリプトが、未定義クラス・独自CSS・小さい文字・文字量超過を機械的に弾く

## 構成

| パス | 用途 |
|---|---|
| `theme.css` | テーマ本体。この1ファイルだけで動作する |
| `template.html` | 最小の骨組み。コピーして使う |
| `examples/concept.html` | 概念説明（中心となる概念とその意味） |
| `examples/architecture.html` | アーキテクチャ概要（層構造と図解基盤のSVG） |
| `examples/roadmap.html` | ロードマップ（段階と、次へ進む条件） |
| `examples/comparison.html` | 比較（表と、選ぶ基準） |
| `scripts/check.mjs` | テーマとHTMLの検査（依存パッケージなし） |
| `scripts/bundle.sh` | `theme.css`を`<style>`として埋め込み、単体HTMLを`../output/one-pager/`へ書き出す |

## まず使う

`template.html`をコピーして内容を書き、ブラウザで開くだけです。ビルドは不要です。

```bash
cd one-pager
cp template.html my-topic.html
open my-topic.html
```

CSSを別配布せずに1ファイルで渡すときは、`theme.css`を埋め込みます。

```bash
scripts/bundle.sh my-topic.html
```

PDFにするときは、Google Chromeのヘッドレス印刷を使います（A4横で印刷されます）。

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --no-pdf-header-footer \
  --print-to-pdf=../output/one-pager/my-topic.pdf "file://$PWD/my-topic.html"
```

検査は`npm run check`です。`npm install`は不要です。

```bash
npm run check
```

## デザイン原則

1. **小さい文字を使わない。** 主用途はデスクトップ表示と画面共有です。通常のWebサイトの16pxを基準にしません。収まらなければ文字を縮めず、情報を削ります。
2. **文字階層を増やさない。** Title（`h1`）、Heading（`h2` / `h3`）、Body（本文）だけです。装飾的なサブタイトル、eyebrow、badge、caption、metaは標準部品にありません。
3. **薄い文字で階層を表現しない。** 強弱はサイズ・太さ・位置・余白・面で付けます。テーマは薄い文字色を定義していません。
4. **余白を埋めない。** 空白はデザイン要素です。画面に余裕があっても、説明文・ラベル・注釈・アイコン・飾り線・カードを足しません。
5. **重要度を均一化しない。** 主役には`key`を付け、粒度が違う要素は`weighted`で幅を変えます。「3要素だから3等分」を既定にしません。
6. **デザインを発明しない。** 用意した部品を組み合わせるだけで一定の品質になるようにしています。CSSを書き足さず、`style`属性も使いません。

## 文字サイズ

すべてpx指定で、`clamp()`により画面幅に応じて範囲内で変わります。下限は18pxです。

| 役割 | 要素 | サイズ |
|---|---|---|
| Title | `.hero h1` | 44〜56px |
| Lead | `.lead` / `.callout` | 24〜30px |
| Heading | `.section h2` / flowの番号 | 28〜36px |
| Subheading | `h3` | 22〜26px |
| Body | 本文・リスト・表・コード | 20〜24px |

## 部品

| クラス | 用途 | ルール |
|---|---|---|
| `.hero` | タイトルと主メッセージ | 1枚に1つ。`h1`と`.lead`を1つずつ。日付や作成者が必要なら本文サイズの`p`を1つだけ |
| `.lead` | その塊の結論を1〜2文で | `.hero`では必須。`.section`の先頭にも置ける |
| `.section` | 見出し（`h2`）1つと本文 | 1枚に1〜4個。`h2`は内容を予測できる名詞句か結論文 |
| `.stack` | 縦に並べる入れ物 | 子要素の間隔を揃えるだけ。カードや段落を縦に積むときに使う |
| `.columns` | 横に並べる（既定2列） | 同じ粒度の要素だけを並べる。`.three`で3列、`.weighted`で2:1 |
| `.card` | `h3`と短い本文の箱 | 本文は1〜3文か3項目まで。カードの中にカードを入れない |
| `.callout` | この1枚の持ち帰り | 1枚に1つまで。1〜2文。本文より大きく表示される |
| `.flow` | 工程・段階・時間軸（`ol`） | 3〜5項目。番号は自動。各項目は`h3`＋短い本文かリスト |
| `.layers` | 層構造（`ol`） | 上から下へ。各項目は`h3`（層の名前）＋`p`（構成要素） |
| `.diagram` | 図の置き場（`figure`） | `diagrams/`で生成したSVG（`neutral`テーマ）か画像を置く。`figcaption`は図が示す判断を1文で |
| `.key` | 主役の印 | `.card` / `.flow > li` / `.layers > li`に付ける。1枚に2つまで |

文中の強調は`<mark>`（主色の太字）と`<strong>`（黒の太字）だけです。`<small>`は使いません。表（`table`）、リスト、コードブロックは素のHTMLで書けます。

### hero と lead

```html
<header class="hero">
  <h1>内容とスタイルの分離</h1>
  <p class="lead">書き手はMarkdownで<mark>内容だけ</mark>を書く。色・レイアウト・フォントはテーマが決める。</p>
</header>
```

### section と columns / card

```html
<section class="section">
  <h2>何を分けるのか</h2>
  <div class="columns">
    <div class="card key">
      <h3>書き手が決めること</h3>
      <ul>
        <li>何を伝えるか、どの順で伝えるか</li>
        <li>見出し・表・注記といった構造</li>
      </ul>
    </div>
    <div class="card">
      <h3>テーマが決めること</h3>
      <p>色・フォント・文字サイズ・余白。</p>
    </div>
  </div>
</section>
```

粒度が違う2つを並べるときは`.columns.weighted`（左2:右1）を使います。3列は`.columns.three`です。

### flow

```html
<ol class="flow">
  <li>
    <h3>規約と雛形</h3>
    <p>2026年10月〜12月</p>
  </li>
  <li class="key">
    <h3>移行</h3>
    <p>2027年1月〜6月</p>
  </li>
  <li>
    <h3>旧Wikiの閉鎖</h3>
    <p>2027年7月〜9月</p>
  </li>
</ol>
```

### layers

```html
<ol class="layers">
  <li>
    <h3>エッジ</h3>
    <p>CloudFront。キャッシュできるものは下の層へ届けない。</p>
  </li>
  <li class="key">
    <h3>アプリケーション</h3>
    <p>API GatewayとLambda。状態を持たない。</p>
  </li>
  <li>
    <h3>データ</h3>
    <p>S3。唯一の置き場。</p>
  </li>
</ol>
```

### diagram

```html
<figure class="diagram">
  <img src="../../diagrams/generated/neutral/architecture-aws.svg" alt="構成図">
  <figcaption>矢印は一方向。データ層から上位層を呼び返す経路はない。</figcaption>
</figure>
```

図は手で描かず、[図解基盤](../diagrams/README.md)でMermaid原本から`neutral`テーマのSVGを生成して置きます。SVGは幅いっぱいに拡大されるため、Mermaidの文字も本文に近い大きさで表示されます。図の文字が小さいと感じたら、図の要素数を減らします。

### callout と stack

```html
<div class="callout">迷ったら、色を選ばずに構造を選ぶ。</div>

<div class="stack">
  <div class="card">…</div>
  <div class="card">…</div>
</div>
```

## 用途別の組み立て

| 用途 | 組み立て | サンプル |
|---|---|---|
| 概念説明 | `hero`（定義を`lead`に） → `columns`で対比 → `columns.three`で理由 → `callout` | `examples/concept.html` |
| アーキテクチャ概要 | `hero` → `layers`（主役の層に`key`） → `diagram` → `callout` | `examples/architecture.html` |
| ロードマップ | `hero` → `flow`（現在の段階に`key`） → `columns`で移行条件 → `callout` | `examples/roadmap.html` |
| 比較 | `hero` → `table` → `columns`で選ぶ基準（推奨に`key`） → `callout` | `examples/comparison.html` |
| 方針説明 | `hero`（方針を`lead`に） → `stack`で原則を`card`に → `callout` | — |
| プロセス説明 | `hero` → `flow`（3〜5工程） → `callout`（開始条件か完了条件） | — |

## Agent向け生成ルール

HTMLを生成するAI / Coding Agentは、次の順で作業してください。

1. **主メッセージを1文で決める。** 読み手が最後に理解していてほしいことを`.lead`に書く。決まらないうちは本文を書かない。
2. **`template.html`をコピーする。** `<link rel="stylesheet" href="theme.css">`の相対パスだけ合わせる。
3. **用途別の組み立てから型を選ぶ。** 上の表に近いものを選び、`section`は2〜4個に収める。
4. **既存クラスだけで組む。** 新しいCSSクラスを作らない。`<style>`タグと`style`属性を書かない。`theme.css`を編集しない。
5. **補助文字を足さない。** サブタイトル、eyebrow、badge、ラベル、caption、meta、フッタ、`<small>`、注釈を置かない。日付や作成者が必要なら`hero`の本文サイズの`p`に1行だけ書く。
6. **薄い色・別の色を使わない。** 強調は`<mark>`と`key`だけ。系列色やブランド色を持ち込まない。
7. **情報が多ければ削る。** 文字を小さくしない、カードを増やさない、列を増やさない。本文の文字量は1,000字以下（`npm run check`が数える）。1枚に収まらない内容は、スライド（Marp / Slidev）か文書（Pandoc / Docusaurus）にする。
8. **余白を埋めない。** 画面が空いていても、説明文・アイコン・飾り線・カードを足さない。
9. **重要度に差を付ける。** 主役に`key`（2つまで）、粒度が違う並びに`weighted`を使う。全部を同じ大きさのカードにしない。
10. **図は生成する。** 図が必要なら、Mermaid原本を書いて`diagrams/`で`neutral`テーマのSVGを生成し、`.diagram`に置く。SVGを手で描かない。
11. **`npm run check`を通す。** 失敗したら、検査を緩めるのではなく内容を直す。
12. **ブラウザで開いて確認する。** タイトルの折り返し、カードの高さの不揃い、`flow`の項目の文字量の偏りを直す。

### 禁止事項

- `<style>`タグ、`style`属性、`theme.css`にないクラス、`theme.css`の編集
- `<small>`、`<sub>`、`<sup>`、`<font>`、フッタ、メタ情報の帯
- `h1`を2つ以上、`hero`を2つ以上、`callout`を2つ以上、`key`を3つ以上、`section`を5つ以上
- `flow`の項目を2つ以下または6つ以上にする
- JavaScript、外部フォント、外部CSS、アイコンフォント
- 画像による装飾（写真・イラスト・背景）

## 検査

`npm run check`は次を確認します。依存パッケージはありません。

`theme.css`:

- `url(` / `@import` / `@font-face` がない（外部資産を持たない）
- 色トークンが`../diagrams/themes/neutral.json`（Docusaurus / Pandocと同じ文書系の配色）と一致する
- `font-size`と`--op-size-*`に現れるpx値がすべて18px以上で、相対単位（em / rem / % / pt）を使っていない
- `color`の値が濃いトークン（`--op-text` / `--op-heading` / `--op-primary` / `--op-primary-strong` / `--op-white`）だけで、`opacity`を使っていない
- 薄い文字用のトークン（muted / gray / caption / meta など）や補助文字用のクラス（eyebrow / badge / label / footer など）を定義していない
- 定義したクラスがすべてこのREADMEに説明されている

`template.html`と`examples/*.html`:

- `theme.css`を`link`で参照し、`script` / `style`タグと`style`属性がない
- `small` / `font` / `sub` / `sup`がない
- `h1`と`hero`が1つ、`hero`に`lead`が1つ、`section`が1〜4個で`h2`の数と一致、`callout`が1つ以下、`key`が2つ以下
- `theme.css`にないクラスを使っていない
- `flow`の項目数が3〜5
- 相対パスの画像が存在する
- 本文の文字量が1,000字以下

## 他形式との関係

- **配色**は文書系（Pandoc / Docusaurus / diagrams `neutral`）と同じ値です。主色のティール`#0f766e`、本文`#16191f`、見出し`#0f1b2a`、罫線`#d5dbdb`、面`#f7f8f9`を共有し、検査で`neutral.json`と照合します。スライド向け`forsteri`テーマの系列色や章扉などのブランド表現は持ち込みません。
- **フォント**はPandocテンプレートと同じOS標準のUIフォントです。外部フォントを読み込みません。
- **図**は図解基盤の`neutral`テーマで生成したSVGを`.diagram`に置きます。原本は`.mmd`で、SVGを直接編集しません。
- **使い分け**は[文書運用](../docusaurus/docs/conventions/document-policy.md)の「出力形式の使い分け」に従います。1枚に収まらないものは、この形式の対象外です。
