---
theme: ../theme
title: キックオフテンプレート
layout: cover
kicker: Project kickoff｜【日付】
defaults:
  footer: Kickoff｜【プロジェクト名】
---

# 【プロジェクト名】キックオフ

## 【誰に、どんな変化をもたらすか】

期間： 【開始日】〜【終了日】

---
layout: statement
---

# 成功とは【対象者】が【成果】を実現した状態です

対象範囲： 【含むもの】  
対象外： 【含まないもの】

---

# 成果物は利用される順に設計する

<Process :items='[
  {"title":"【成果物 1】","detail":"利用者：【対象】"},
  {"title":"【成果物 2】","detail":"利用者：【対象】"},
  {"title":"【成果物 3】","detail":"利用者：【対象】"}
]' />

---

# 役割は決める人と進める人を明確にする

<Comparison
  :left='{"title":"意思決定","summary":"優先順位と変更を承認","items":["オーナー：【氏名】","会議体：【名称】","頻度：【頻度】"]}'
  :right='{"title":"実行","summary":"成果物を作り検証","items":["リード：【氏名】","メンバー：【氏名】","連絡先：【場所】"]}'
/>

---

# マイルストーンごとに完了条件を置く

<Roadmap :lanes='[
  {"name":"設計","items":[{"quarter":"Q1","title":"要件合意"},{"quarter":"Q2","title":"設計完了"}]},
  {"name":"実装","items":[{"quarter":"Q2","title":"試作"},{"quarter":"Q3","title":"正式版"}]},
  {"name":"展開","items":[{"quarter":"Q3","title":"教育"},{"quarter":"Q4","title":"定着確認"}]}
]' />
