---
marp: true
theme: forsteri
paginate: true
footer: docs-toolkit / Marp Theme
---

<!-- _class: title -->
<!-- _header: 2026.09.12｜forsteri -->

# 伝わる資料を、迷わずつくる

## forsteri Marp Theme

ドキュメントツールキットのスライドテンプレート

---

# 迷わず使える標準を揃える

## 一貫した見た目と、日々の使いやすさを両立

- 16:9 の<mark>寸法・余白・タイポグラフィ</mark>をテーマ側で固定
- 用途別クラスを絞り、選択コストを削減
- ライトテーマを既定、カジュアル資料は`dark`で切り替え
- タイトル、章扉、本文、図版、終端を用途別に整理

> 1枚1メッセージを基本に、情報量が多いときは分割を優先します。

---

<!-- _class: section -->
<!-- _header: Section 1 -->

# 基本レイアウト

## 情報の階層を、視線の流れに合わせる

---

# 3つの判断軸

<div class="columns three">
<div class="panel">

### 明快さ

結論を先に置き、見出しだけでも筋が追える構成にします。

</div>
<div class="panel">

### 一貫性

余白、文字サイズ、色の役割を全ページで揃えます。

</div>
<div class="panel">

### 再利用性

用途別クラスを組み合わせ、個別調整を減らします。

</div>
</div>

---

<!-- _class: figure-right figure-35 -->

# 図版を右に置く

![学びのサイクルの概念図](./assets/learning-cycle.svg)

## テキストは結論から

- `figure-right`で図版領域を固定
- 画像は領域内で自動的にフィット
- `figure-35` / `figure-50`で幅を調整

図版と本文の役割が競合しないため、比較やプロセス説明に向きます。

---

# 表は比較に集中させる

## クラスの使い分け

| 用途 | クラス | 選ぶ基準 |
|---|---|---|
| キーメッセージ | `statement` | 1つの結論を強く見せる |
| 2〜3列の比較 | `.columns` | 同じ粒度の項目を並べる |
| 図版＋本文 | `figure-right` | 図と説明を同時に読む |
| 高密度の仕様 | `compact` | 分割できない情報に限定 |

<small>表の列数は4列程度、本文は1セル2行以内を目安にします。</small>

---

<!-- _class: compact -->

# 技術情報を載せるとき

## コードと補足をセットで扱う

```python
def normalized_score(value: float, baseline: float) -> float:
    if baseline <= 0:
        raise ValueError("baseline must be positive")
    return round(value / baseline * 100, 1)
```

| 観点 | 推奨 | 避ける |
|---|---|---|
| コード | 要点だけを抜粋 | ファイル全体を掲載 |
| 説明 | 入出力と判断を明記 | 実装の逐語解説 |
| 文字量 | 12行程度まで | 読み上げ前提の長文 |

> `compact`は例外レイアウトです。読みやすさを保てない場合はページを分けます。

---

<!-- _class: statement -->

# スライドは「読む資料」ではなく、<br>判断を前に進めるための画面です。

情報を減らすのではなく、順序と強弱を設計します。

---

<!-- _class: section -->
<!-- _header: Section 2 -->

# ダークテーマ

## カジュアルな場では`dark`を選ぶ

---

<!-- _class: dark title -->
<!-- _header: 2026.09.12｜Casual session -->

# Night テーマ

## カジュアル資料向けのタイトルスライド

`dark`を付けたページだけ配色を切り替えます

---

<!-- _class: dark -->

# ダークでも本文の構成は共通

## 配色以外の基本ルールは変えない

- タイトルとヘッダラインの位置は変えない
- アクセントには明るいティールを使う
- 系列色は図表の識別用途に限定する
- 正式な資料では既定のライトテーマを使う

---

<!-- _class: ending -->
<!-- _footer: docs-toolkit v0.1.0 · 2026 -->

# ご覧いただき、ありがとうございました

質問や改善案は docs-toolkit のリポジトリへお寄せください。
