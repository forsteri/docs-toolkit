---
theme: ../theme
title: 提案書テンプレート
layout: cover
kicker: 【提出日】｜【提出者】
defaults:
  footer: 提案書｜【案件名】
---

# 【案件名】ご提案

## 【相手が得られる価値を一文で記載】

【提出者】

---
layout: statement
---

# 【課題の本質を、原因と影響が分かる一文で記載】

現状： 【観測した事実・数値】  
影響： 【放置した場合の事業影響】

---

# 解決策は課題から効果までを一本につなぐ

<Process :items='[
  {"title":"課題を限定","detail":"対象と原因を特定"},
  {"title":"施策を実行","detail":"小さく検証"},
  {"title":"効果を測定","detail":"基準と比較"},
  {"title":"対象を拡大","detail":"結果を反映"}
]' />

---

# 効果は同じ基準日・定義で比較する

<KpiCards :items='[
  {"label":"【KPI 1】","value":"【値】","delta":"現状比 【差】","note":"基準日：【日付】"},
  {"label":"【KPI 2】","value":"【値】","delta":"現状比 【差】","note":"定義：【条件】"},
  {"label":"【KPI 3】","value":"【値】","delta":"現状比 【差】","note":"試算根拠：【出典】"}
]' />

---

# 推進体制は意思決定と実行の責任を分ける

<Comparison
  :left='{"title":"意思決定","summary":"判断と優先順位を決める","items":["責任者：【氏名・役割】","会議体：【頻度】","承認事項：【範囲】"]}'
  :right='{"title":"実行チーム","summary":"施策と検証を進める","items":["リード：【氏名・役割】","担当：【メンバー・人数】","報告方法：【手段】"]}'
/>

---

# 四半期ごとの成果物を先に合意する

<Roadmap :lanes='[
  {"name":"施策","items":[{"quarter":"Q1","title":"設計"},{"quarter":"Q2","title":"試行"},{"quarter":"Q3","title":"展開"}]},
  {"name":"運用","items":[{"quarter":"Q2","title":"手順整備"},{"quarter":"Q3","title":"教育"},{"quarter":"Q4","title":"定着"}]},
  {"name":"評価","items":[{"quarter":"Q1","title":"基準設定"},{"quarter":"Q4","title":"効果判定"}]}
]' />

---
layout: statement
---

# ご承認いただきたい事項は【意思決定の内容】です

承認後の初動： 【担当】が【期日】までに【最初の行動】を実施します。
