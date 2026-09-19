# forsteri Marp Theme 利用ガイド

16:9（1280 × 720）のMarpテーマです。主色はティール `#0f766e`、本文は黒、装飾は細いラインと面だけのシンプルな構成で、画像は使いません。カジュアルな勉強会向けには、オプションのNightダークテーマ（`dark`）も利用できます。

## 最小構成

配布先には`forsteri.css`だけを置けば動作します。

```yaml
---
marp: true
theme: forsteri
paginate: true
---
```

`.columns`、`<mark>`、`<small>`、`.caption`、`.source`などのテーマ標準機能は、固定しているMarp Coreの既定HTML許可リスト内で動作します。front matterの`html: true`はHTML許可を切り替える設定ではないため使用しません。

許可リスト外のHTMLを追加する場合は、信頼できる資料に限りMarp CLIの`--html`、またはVS Codeの`markdown.marp.html: "all"`を明示的に指定してください。通常のテーマ利用では不要です。

## Nightダークテーマ

`dark`は、カジュアルな勉強会やメモ的な資料で少し遊びを加えるためのオプションです。正式な資料の既定テーマではありません。背景は深い青緑の夜色、本文は白、見出しや数値は明るいティール（`--forsteri-night-accent`）で表示されます。

資料全体を暗色にするときは、front matterへ`class: dark`を追加します。

```yaml
---
marp: true
theme: forsteri
class: dark
paginate: true
---
```

個別ページだけ暗色にするとき、または`_class`でレイアウトを指定するときは、同じ行に`dark`を併記します。

```markdown
<!-- _class: dark title -->

# タイトル

---

<!-- _class: dark metric -->

# 大きな数字を見せる
```

## スライド種別

### タイトル

```markdown
<!-- _class: title -->
<!-- _header: 2026.09.12｜補足情報 -->

# プレゼンテーションタイトル

## サブタイトル

補足情報
```

上部200pxは白、下部は主色の面で直線に分割されます。タイトル、サブタイトル、補足情報は主色の面に白文字で左寄せ配置され、`_header`（日付など）は白い帯の左上に黒文字で表示されます。

本文スライドのタイトルは1行で表示します。全角約40文字を目安に短くし、収まらない場合は文言を整理するか、`# <!-- fit --> 長いタイトル`で1行のまま縮小してください。VS Codeではスライド内容のoverflow診断を有効にしています。

### 章扉

```markdown
<!-- _class: section -->
<!-- _header: Section 1 -->

# 章タイトル

## 章の説明
```

左端に主色の縦帯（32px）が入り、章タイトル（主色）と説明（黒）は左寄せで縦中央に配置されます。`_header`は左上に主色で表示されます。

`header:`をfront matterへグローバル指定しても、本文スライドには表示されません。タイトルと章扉で必要な場合は、スライド単位の`_header`を使用してください。

### 本文

本文スライドは、上部にタイトル（黒、`**強調**`部分は主色）、その下に主色1本の細いヘッダライン（3px、左端から右余白まで）が入ります。右上に固定の画像領域を設けていないため、タイトルと本文は幅いっぱい（1136px）まで使えます。

### 終端

```markdown
<!-- _class: ending -->
<!-- _footer: © forsteri -->

# ご覧いただき、ありがとうございました

## サブタイトル

問い合わせ先や次の行動など
```

画像は使わず、資料側の見出し（主色）と本文（黒・グレー）をそのまま中央に配置します。`_footer`は下部中央に小さく表示されます。フッタに`© forsteri`などを書くかどうかは資料側の任意です。

## レイアウトクラス

| クラス | 用途 | 備考 |
|---|---|---|
| `statement` | 1つの結論を強く見せる | ヘッダーラインを非表示 |
| `no-header` | 通常本文でラインを外す | タイトルを主色で大きく表示 |
| `compact` | 表や仕様など高密度情報 | 常用せず、分割を優先 |
| `figure-right` | 図を右、本文を左 | 画像だけの段落を1つ置く |
| `figure-left` | 図を左、本文を右 | 同上 |
| `figure-35` | 図版幅35% | `figure-right/left`と併用 |
| `figure-50` | 図版幅50% | `figure-right/left`と併用 |
| `figure-cover` | 図版領域をトリミング表示 | `figure-right/left`と併用。写真向け |
| `figure-center` | タイトル下で図版を中央表示 | 図・画面キャプチャ向け |
| `image-shadow` | 画像に細枠と影 | 白背景画像向け |
| `metric` | KPIや大きな数字を1つ強調 | `.metric-block`と併用 |
| `decision` | 結論・理由・次の行動を整理 | `.decision-lead`と`.decision-grid`を使用 |
| `timeline` | 3〜5段階の工程やロードマップ | `.timeline-flow`を使用 |
| `dark` | Nightダークテーマ | 他のレイアウトクラスと併用可 |
| `.caption` | 図版の説明 | 図版直後に配置 |
| `.source` | 出典・集計条件・クレジット | ページ内容の最後に配置 |

図版レイアウトの例:

```markdown
<!-- _class: figure-right figure-35 -->

# タイトル

![図の説明](./diagram.svg)

## 結論

- 要点1
- 要点2
```

## KPI・大きな数字

`metric`は、1つの数値とその意味だけを強く見せます。複数のKPIを並べる場合はページを分けることを優先します。

```html
<!-- _class: metric -->

# 大きな数字は、一目で意味が伝わる

<div class="metric-block">
<p class="metric-value">87<span class="metric-unit">%</span></p>
<p class="metric-label">サンプル指標の達成率</p>
<p class="metric-delta">目標比 +7pt（表示例）</p>
<p class="metric-note">数値の定義や基準日を短く補足</p>
</div>
```

## 結論と次の行動

`decision`は、推奨する結論を先に置き、理由と次の行動を2列で整理します。

```html
<!-- _class: decision -->

# decisionは判断を一枚で完結させる

<div class="decision-lead">推奨案：段階導入</div>

<div class="decision-grid">
<div>

## 理由

- 既存運用への影響を抑えられる
- 検証結果を次段階へ反映できる

</div>
<div>

## 次の行動

1. 対象を決める
2. 検証日を設定する

</div>
</div>
```

## 工程・ロードマップ

`timeline-flow`は既定で4段階です。3段階は`timeline-flow three`、5段階は`timeline-flow five`を指定します。

```html
<!-- _class: timeline -->

# timelineは工程の順序を揃える

<div class="timeline-flow">
<div class="timeline-step">
<p class="timeline-index">01</p>

## 整理

対象と前提を揃える

</div>
<div class="timeline-step">
<p class="timeline-index">02</p>

## 設計

判断基準を決める

</div>
<div class="timeline-step">
<p class="timeline-index">03</p>

## 検証

小さく試して確認する

</div>
<div class="timeline-step">
<p class="timeline-index">04</p>

## 展開

結果を反映して広げる

</div>
</div>
```

## 図版注記・出典

`caption`は図の意味、`source`は出典・集計条件・画像クレジットを記載します。`source`はページ内容の最後に置きます。

```html
![図の説明](./diagram.svg)

<p class="caption">図1. 検討プロセスの全体像</p>
<p class="source">出典：本資料用に作成</p>
```

## カラム／パネル

同じ粒度の項目を2〜3列で比較するときだけ使います。

```html
<div class="columns three">
<div class="panel">

### 観点A

説明

</div>
<div class="panel">

### 観点B

説明

</div>
<div class="panel">

### 観点C

説明

</div>
</div>
```

## テキスト表現

- `**太字**`: 黒の太字
- `<mark>強調</mark>`: 主色（ティール）の太字
- `<small>補足</small>`、`<span class="muted">補足</span>`、`<p class="muted">補足</p>`: 小さな補足
- `h1`内の`**強調**`: 主色（ティール）

本文全体を赤などに変える汎用アクセントクラスは設けていません。ティールを主色とし、注意やエラーは文言・記号・囲みで表現します。

コードブロックとインラインコードは等幅フォント（`--forsteri-font-mono`）で表示し、長い行はPDFでも欠落しないように自動で折り返します。読みやすさを保つため、可能な限り処理の要点だけを掲載してください。

## 色・フォントの使い方

- 主色 `--forsteri-primary` (`#0f766e`): 見出し、リンク、ヘッダライン、表のヘッダ、`<mark>`
- 濃い主色 `--forsteri-primary-strong` (`#115e59`): ホバーや濃い面
- 淡い主色 `--forsteri-primary-soft` (`#f0fdfa`): 引用背景、表の偶数行
- 本文 `--forsteri-ink` (`#111827`)、補足 `--forsteri-gray-700`、罫線 `--forsteri-gray-300`、面 `--forsteri-gray-100`
- 系列色 `--forsteri-series-1`〜`8`: グラフ・表組・図解の色分け専用。黒文字が載る明度で揃えている。主色の代わりには使わない
- Nightパレット `--forsteri-night-*`: `dark`専用。アクセントは`--forsteri-night-accent` (`#5eead4`)
- フォント: 和文 `--forsteri-font-ja`（Hiragino Sans / Noto Sans JP系）、英数字補助 `--forsteri-font-en`（Inter / Helvetica系）、等幅 `--forsteri-font-mono`（JetBrains Mono / Menlo系）

## 共有トークンの単一ソース

色・フォントの共有トークンは`forsteri.css`先頭の`/* @forsteri-shared-tokens-start */`〜`/* @forsteri-shared-tokens-end */`ブロックを単一ソースとします。Slidevテーマの生成済みトークンと diagrams のMermaidテーマもこの範囲から同期されるため、値を変更する場合はMarp側のこのブロックだけを編集し、各ディレクトリの検査コマンドを再実行してください。ブロック内の変数名を変えると他ツールの同期が壊れます。

## 検査

テーマやサンプルを変更したら、テーマルートで次を実行します。

```bash
npm run check
```

`@theme`宣言、共有トークンマーカー、`url(`参照の不在、会社固有語の不在、未定義変数参照の不在、`examples/*.md`の変換成功を確認します。
