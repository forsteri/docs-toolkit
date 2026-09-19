---
marp: true
theme: forsteri
paginate: true
title: forsteri Marp Theme Feature Showcase
author: forsteri
footer: docs-toolkit / Marp Theme Feature Showcase
---

<!-- _class: title -->
<!-- _header: 2026.09.12｜Theme feature catalog -->

# forsteri Marp Theme

## Feature Showcase

主要機能を実際の表示で確認する

---

# 最初に選ぶのは5種類だけ

## 用途からスライド型を決める

| 伝えたいこと | 選ぶもの | 代表クラス |
|---|---|---|
| 資料の開始 | タイトル | `title` |
| 話題の切り替え | 章扉 | `section` |
| 説明・比較 | 本文 | 指定なし / `.columns` |
| 図を中心に説明 | 図版 | `figure-right` / `figure-center` |
| 1つの結論 | メッセージ | `statement` |

<small>カジュアル資料では、各ページに`dark`を追加して暗色にできます。</small>

---

<!-- _class: section -->
<!-- _header: Section 1 -->

# 基本要素

## Markdownの標準要素を、テーマの階層に合わせる

---

# タイトルの **強調部分** は主色になる

## 見出し、本文、補足の階層を揃える

通常本文には **太字**、<mark>主色の強調</mark>、*イタリック*、
[リンク](https://marp.app/)を利用できます。

### 小見出しは説明のまとまりを作る

本文は1段落2〜3行を目安にします。長くなるときは、文字を小さくする前にページを分けます。

<hr>

<p class="muted"><code>.muted</code>は注記や条件など、主張を補う情報に使います。</p>

<small><code>small</code>要素は出典や単位など、さらに小さな情報向けです。</small>

---

# 箇条書きは並列、番号は順序を示す

## 箇条書き

- 同じ粒度の要点を並べる
- 1項目は原則として1行に収める
- マーカーには主色のティールを使う

## 番号付きリスト

1. 結論を決める
2. 根拠を選ぶ
3. 読み手の次の行動を示す

---

# 引用は主張と補足を分ける

## ブロック引用

> 読み手が最初に理解すべきことを、短い文章で囲みます。背景色と左罫線で、本文とは異なる情報であることを示します。

本文では引用の意味を説明します。囲みだけを置いて終わらず、判断や次の話題につなげます。

---

# コードは要点だけを見せる

## コードブロックとインラインコード

```python
def normalized_score(value: float, baseline: float) -> float:
    if baseline <= 0:
        raise ValueError("baseline must be positive")
    return round(value / baseline * 100, 1)
```

入力値は`value`、比較基準は`baseline`です。コード全体ではなく、説明に必要な部分だけを載せます。

---

# 表は比較の軸を揃える

## 4列程度までに絞る

| 観点 | 推奨 | 避ける | 理由 |
|---|---|---|---|
| 見出し | 短い名詞句 | 長い文章 | 列の役割が見える |
| セル | 1〜2行 | 段落 | 横方向に比較できる |
| 強調 | 列・行単位 | 色の多用 | 視線が散らばらない |
| 数値 | 単位を統一 | 桁が不揃い | 差を読み取りやすい |

---

<!-- _class: no-header -->

# no-headerはラインを外して余白をつくる

## タイトルを主色にして、本文と一続きに見せる

導入文、目次、短いまとめなど、通常の本文より自由な余白が必要なページに使います。

---

<!-- _class: statement -->

# statementは、<br>1つの結論だけを残す。

説明を足す場合も、結論を支える1文までにします。

---

<!-- _class: compact -->

# compactは分割できない情報だけに使う

## 高密度レイアウトでも、見出しと表の階層は保つ

| 対象 | 通常 | compact | 運用ルール |
|---|---:|---:|---|
| 本文 | 24px | 19px | 長文を詰め込まない |
| 見出し | 27px | 23px | 1行を維持する |
| 表 | 19px | 16px | 6行程度を目安にする |
| 引用 | 21px | 17px | 補足に限定する |

> 仕様一覧や移行表など、ページ分割が理解を妨げる場合だけ選びます。

---

<!-- _class: section -->
<!-- _header: Section 2 -->

# レイアウト

## 情報の関係に合わせて、並べ方を選ぶ

---

# 2列は2つの観点を比較する

<div class="columns">
<div>

## 左の観点

- 現状
- メリット
- 前提条件

</div>
<div>

## 右の観点

- 将来像
- トレードオフ
- 次の判断

</div>
</div>

---

# 3列パネルは同じ粒度の項目に使う

<div class="columns three">
<div class="panel">

### 明快さ

見出しだけでも、話の筋が追える。

</div>
<div class="panel">

### 一貫性

余白と文字サイズの役割が揃う。

</div>
<div class="panel">

### 再利用性

用途別クラスで個別調整が減る。

</div>
</div>

---

<!-- _class: figure-right -->

# figure-rightは図と説明を同時に読む

![学びのサイクルの概念図](./assets/learning-cycle.svg)

## 標準の図版幅は42%

- 本文から図へ視線が流れる
- 比較、プロセス、構造説明に向く
- 画像だけの段落を1つ置く

---

<!-- _class: figure-left figure-35 -->

# figure-left figure-35は図を起点にする

![学びのサイクルの概念図](./assets/learning-cycle.svg)

## 図版幅35%

- 図やアイコンを最初に見せる
- 右側に説明をまとめる
- 小さめの図版に余白を与える

---

<!-- _class: figure-right figure-50 figure-cover -->

# figure-coverは領域いっぱいにトリミングする

![学びのサイクルの概念図](./assets/learning-cycle.svg)

## 図版幅50%

写真や背景性の高い画像に向きます。重要な文字を含む画像には使いません。

---

<!-- _class: figure-center image-shadow -->

# 中央図版に枠と影を付ける

## figure-center + image-shadow

![学びのサイクルの概念図](./assets/learning-cycle.svg)

---

<!-- _class: section -->
<!-- _header: Section 3 -->

# 実務レイアウト

## 数値、判断、工程、根拠をそれぞれの型で伝える

---

<!-- _class: metric -->

# metricは、数字と意味を一目で伝える

<div class="metric-block">
<p class="metric-value">87<span class="metric-unit">%</span></p>
<p class="metric-label">サンプル指標の達成率</p>
<p class="metric-delta">目標比 +7pt（表示例）</p>
<p class="metric-note">数値の定義、対象期間、基準日を短く補足します</p>
</div>

---

<!-- _class: decision -->

# decisionは、判断と次の行動を一枚にする

<div class="decision-lead">推奨案：小さく始め、検証後に展開する</div>

<div class="decision-grid">
<div>

## 理由

- 既存運用への影響を抑えられる
- 検証結果を次の段階へ反映できる
- 判断基準を共有しやすい

</div>
<div>

## 次の行動

1. 対象工程を決める
2. 評価条件を揃える
3. 結果の確認日を設定する

</div>
</div>

---

<!-- _class: timeline -->

# timelineは、工程の順序を揃える

<div class="timeline-flow five">
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
<div class="timeline-step">
<p class="timeline-index">05</p>

## 定着

運用を見直し改善する

</div>
</div>

---

<!-- _class: figure-center -->

# captionとsourceは、図の意味と根拠を分ける

![学びのサイクルの概念図](./assets/learning-cycle.svg)

<p class="caption">図1. 試す・振り返る・共有するをつなぐ表示例</p>
<p class="source">出典：本機能カタログ用に作成したサンプル図版</p>

---

<!-- _class: section -->
<!-- _header: Section 4 -->

# ダークテーマ

## `dark`を付けたページだけ暗色にする

---

<!-- _class: dark title -->
<!-- _header: 2026.09.12｜Casual session -->

# Night テーマのタイトル

## カジュアル資料向けの暗色構成

`dark`を付けたページだけ配色が切り替わります

---

<!-- _class: dark -->

# ダークでも基本レイアウトは変えない

## 配色だけを切り替える

- タイトルとヘッダラインの位置は共通
- アクセントは明るいティールを使う
- 系列色は図表の識別用途に限定する
- 正式な資料では既定のライトテーマを使う

---

<!-- _class: ending -->
<!-- _footer: docs-toolkit v0.1.0 · 2026 -->

# ご覧いただき、ありがとうございました

## forsteri Marp Theme Feature Showcase

質問や改善案は docs-toolkit のリポジトリへお寄せください。

---

<!-- _class: dark ending -->
<!-- _footer: docs-toolkit v0.1.0 · 2026 -->

# ダークの終端も同じ構成

資料側の見出しと本文をそのまま中央に置きます。
