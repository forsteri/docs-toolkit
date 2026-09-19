---
marp: true
theme: forsteri
paginate: true
header: CONTENT HEADER MUST STAY HIDDEN
---

<!-- _class: no-header -->

# ヘッダーラインなし

## 余白を広く使う

`no-header`はタイトルと本文を一続きに見せたいページに使います。グローバル`header`は本文ページへ表示されません。

---

<!-- _class: figure-left figure-35 -->

# 図版を左に置く

![学びのサイクルの概念図](./assets/learning-cycle.svg)

## 視線の起点を図にする

- 図を先に見せたい説明
- 画面キャプチャと特徴の組み合わせ
- Before / Afterの片側

---

<!-- _class: figure-center image-shadow -->

# 図版を中央に置く

![学びのサイクルの概念図](./assets/learning-cycle.svg)

---

# 2列は同じ粒度の情報を比較する

<div class="columns">
<div class="panel">

## 左の観点

- 条件を揃える
- 違いを短く示す

</div>
<div class="panel">

## 右の観点

- 結論を先に置く
- 次の行動を示す

</div>
</div>

---

<!-- _class: figure-right figure-50 figure-cover -->

# 図版を右側いっぱいにトリミングする

![学びのサイクルの概念図](./assets/learning-cycle.svg)

## `figure-cover`は左右配置と併用する

- 写真や背景性の高い図版向け
- 重要な文字を含む画像には使わない

---

<!-- _class: compact -->

# 長いコード行はPDFでも欠落させずに折り返す

## コードブロックの回帰確認

```javascript
const verificationEndpoint = "https://example.invalid/themes/forsteri/verification/assets/this-is-an-intentionally-long-path-for-testing-code-line-wrapping-in-pdf-output";
```

コードは要点を短く保ち、どうしても長い識別子やURLがある場合はテーマ側で折り返します。

---

# <!-- fit --> 長い本文タイトルはfitを指定して1行配置を保つ（全角約40文字を超える場合の確認用サンプル）

通常は全角約40文字を目安に短くします。例外的に長い場合だけ`<!-- fit -->`で1行のまま縮小します。

---

<!-- _class: ending -->
<!-- _footer: docs-toolkit v0.1.0 · 2026 -->

# レイアウト確認はここまで

## 各ページの表示崩れがないことを確認する

本文ページに`header`が流入していないこと、図版領域と本文が重ならないことを見ます。
