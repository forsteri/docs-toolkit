---
theme: ../theme
title: 進捗報告テンプレート
layout: cover
kicker: 【報告日】｜【報告者】
defaults:
  footer: 進捗報告｜【プロジェクト名】
---

# 【プロジェクト名】進捗報告

## 【今月の結論を一文で記載】

対象期間： 【開始日】〜【終了日】

---
layout: statement
---

# 全体は【順調／要注意／遅延】、主因は【原因】です

計画との差： 【差分】  
意思決定が必要な事項： 【有無と内容】

---

# KPIは目標との差と基準日を併記する

<KpiCards :items='[
  {"label":"進捗率","value":"【値】","delta":"計画比 【差】","note":"【基準日】時点"},
  {"label":"品質","value":"【値】","delta":"目標比 【差】","note":"定義：【条件】"},
  {"label":"コスト","value":"【値】","delta":"予算比 【差】","note":"累計"}
]' />

---

# リスクは発生確率と影響の両方で優先する

<Matrix2x2 x-label="発生確率 →" y-label="影響度 →" :quadrants='[
  {"title":"監視","detail":"兆候とトリガーを定義"},
  {"title":"即時対策","detail":"責任者と期限を設定"},
  {"title":"受容","detail":"対応コストを見極める"},
  {"title":"予防","detail":"小さな対策を先行"}
]' />

---

# 次の報告までに完了させる行動を固定する

<Process :items='[
  {"title":"【Action 1】","detail":"担当：【氏名】／期限：【日付】"},
  {"title":"【Action 2】","detail":"担当：【氏名】／期限：【日付】"},
  {"title":"【Action 3】","detail":"担当：【氏名】／期限：【日付】"}
]' />
