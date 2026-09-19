# slidev-theme-forsteri

個人用ドキュメントツールキット（docs-toolkit）のローカルSlidevテーマです。主色ティール（`--forsteri-primary`）のフラット面と直線だけで構成し、画像資産を持ちません。色・フォントは`../marp-theme/themes/forsteri/forsteri.css`の共有トークンを`npm run brand:sync`で複写して使います。

## レイアウト

| layout | 用途 | 主なfrontmatter |
|---|---|---|
| `cover` | 表紙。主色のフラット面に白文字を中央配置 | `kicker` |
| `section` | 章扉。下辺に主色の直線帯 | `section` |
| `default` | 標準本文。タイトル下に主色1本の細いライン | `footer` |
| `statement` | 1つの結論を強調 | `footer` |
| `metric` | 単一KPIを強調（`.metric-block`を使う） | `footer` |
| `ending` | 終端。資料側の見出し・本文をそのまま中央配置 | なし |

全レイアウトで`class: dark`（または`dark: true`）を指定するとNightパレットになります。勉強会メモやライブデモなどカジュアル資料向けのオプトインで、通常資料の既定にはしません。

PDFの連続エクスポートを安定させるため、テーマはスライド遷移を既定指定しません。SPAで動きを使う場合は、必要な資料・ページのfrontmatterへ`transition`や`v-click`を明示してください。

## スマートアート共通ルール

- 色は系列色`--forsteri-series-1..8`を項目順に自動で割り当てます。色を指定するpropsはありません。
- 系列色はすべて黒文字（`--forsteri-ink`）が載る明度で揃えているため、`Pyramid`や`Funnel`の全面塗りでも文字色は変わりません。
- 9項目以上は先頭の色から循環します。識別が必要なら8項目以内に分割してください。
- 項目は文字列か`{"title": ..., "detail": ...}`のオブジェクトで渡します（`Funnel`は`value`、`KpiCards`は`label`/`value`/`delta`/`note`）。

### Process

工程や直線的な手順。3〜6項目を推奨します。

```vue
<Process :items='[
  {"title":"整理","detail":"対象と前提を揃える"},
  {"title":"設計","detail":"判断基準を決める"}
]' />
```

### Cycle

反復する3〜6段階。`center`は中央の短い概念名です。

```vue
<Cycle center="継続改善" :items='["計画","実行","確認","改善"]' />
```

### Pyramid

上位から下位へ並ぶ階層。`levels`は上から順です。

```vue
<Pyramid :levels='[
  {"title":"目的"},
  {"title":"方針"},
  {"title":"施策"}
]' />
```

### Matrix2x2

`quadrants`は左上、右上、左下、右下の順で4件指定します。

```vue
<Matrix2x2 x-label="実行難度" y-label="効果" :quadrants='[
  {"title":"育成"}, {"title":"優先"}, {"title":"保留"}, {"title":"効率化"}
]' />
```

### Funnel

母数が段階的に絞られるプロセス。`value`は同じ定義・単位で揃えます。

```vue
<Funnel :stages='[
  {"title":"対象","value":"1,200"},
  {"title":"検討","value":"420"},
  {"title":"採用","value":"95"}
]' />
```

### KpiCards

2〜4個の同じ粒度のKPI。単一KPIなら`metric`レイアウトを優先します。

```vue
<KpiCards :items='[
  {"label":"進捗率","value":"76%","delta":"計画比 +4pt","note":"8月末時点"},
  {"label":"完了件数","value":"38","delta":"前月 +9"}
]' />
```

### Roadmap

四半期グリッド。既定はQ1〜Q4、`lanes[].items[].quarter`で配置先を指定します。`quarters`で列を差し替えられます。

```vue
<Roadmap :lanes='[
  {"name":"製品","items":[{"quarter":"Q1","title":"要件"},{"quarter":"Q2","title":"試行"}]},
  {"name":"運用","items":[{"quarter":"Q3","title":"展開"}]}
]' />
```

### Comparison

2案・現状と将来などの対比。左右で観点の粒度を揃えます。

```vue
<Comparison
  :left='{"title":"現状","summary":"個別最適","items":["手作業が多い","判断が属人化"]}'
  :right='{"title":"将来","summary":"標準化","items":["入力を統一","判断基準を共有"]}'
/>
```

## 色の使い分け

- 主色（ティール）: 見出し・リンク・表ヘッダ・タイトル下ライン
- 主色の淡色: 引用・表の偶数行などの面
- 系列色1〜8: グラフ・図解・インデックスの色分け
- Nightパレット: `class: dark`のときだけ使用
- 色値を利用側Markdownで直接指定しない
