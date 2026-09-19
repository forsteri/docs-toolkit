---
theme: ../theme
title: 振り返りテンプレート
layout: cover
kicker: Retrospective｜【日付】
defaults:
  footer: Retrospective｜【対象】
---

# 【対象期間・施策】振り返り

## 結果を学びへ変え、次の実験を決める

対象期間： 【開始日】〜【終了日】

---

# 目標との差を同じ定義で確認する

<KpiCards :items='[
  {"label":"【目標指標 1】","value":"【実績】","delta":"目標比 【差】","note":"基準日：【日付】"},
  {"label":"【目標指標 2】","value":"【実績】","delta":"目標比 【差】","note":"定義：【条件】"},
  {"label":"【目標指標 3】","value":"【実績】","delta":"目標比 【差】","note":"出典：【場所】"}
]' />

---

# 成功と課題は事実から分けて記述する

<Comparison
  :left='{"title":"再現したい成功","summary":"成果につながった行動","items":["事実：【観測内容】","要因：【仮説】","再現条件：【条件】"]}'
  :right='{"title":"変えるべき課題","summary":"成果を阻害した行動","items":["事実：【観測内容】","要因：【仮説】","変更条件：【条件】"]}'
/>

---

# 次回は小さな改善実験を一巡させる

<Cycle center="改善実験" :items='[
  {"title":"仮説","detail":"何を変えるか"},
  {"title":"試行","detail":"対象を限定"},
  {"title":"計測","detail":"基準と比較"},
  {"title":"判断","detail":"継続か変更"}
]' />

---
layout: statement
---

# 次回は【変更する行動】を【対象】で試します

責任者： 【氏名】  
評価日： 【日付】  
成功条件： 【測定可能な条件】
