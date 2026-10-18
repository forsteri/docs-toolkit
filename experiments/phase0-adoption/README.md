# Phase 0: 導入方式の比較と外部利用PoC

**状態: レビュー待ち。** [Issue #1](https://github.com/forsteri/docs-toolkit/issues/1) の調査・試行であり、正式採用、Issue #3への着手、Phase 0全体の完了を意味しない。

## 判断してほしいこと

1. **固定SHAごとの専用clone参照 + Pandoc単体HTML** をIssue #3の暫定方式とするか。推奨理由は、Markdown原本と既存の表示資産を使い、新しい配布基盤なしで外部利用を確認できたため。
2. [3役割を1ファイルにまとめた文書例](https://github.com/forsteri/docs-toolkit/blob/codex/issue-2-minimal-templates/examples/phase0/review.md) と雛形で、次の小規模変更を始めてよいか。

動いたものは、外部プロジェクトのMarkdown + 相対SVGからの単体HTML生成、同一refの再取得、ref切替と撤回、本文と共通資産の非変更。確認する順序は、記入例のチェックポイント先頭、生成HTMLの図と目次、下記の制約とIssue #3の範囲。

人間の採用判断・実利用レビュー、別OS・別Pandoc版、全形式は未検証。今回の検証は公開サンプルであり、実案件での負担改善や有用性を証明していない。

## 正本と作業の境界

- 作業開始時の最新main: `f2b5140610377ae80946d999f822cd9ffe1c3343`。計画PR [#13](https://github.com/forsteri/docs-toolkit/pull/13) はマージ済み。そのmainの `ROADMAP.md` とIssue #1〜#4・各コメントを確認した。依頼との矛盾はなかった。
- 既存checkoutにはPandoc等の未コミット変更があったため、最新mainから独立worktreeとIssue別ブランチを作成した。既存変更をPoCやPRに取り込んでいない。
- 比較・開発検証記録はここへ集約し、`docusaurus/docs/` は利用者向けの雛形・ガイドだけに使う。
- 本PoCは固定された1試料の実験スクリプト。既存 `pandoc/` は改修しない。汎用CLI、設定体系、配布基盤、CI、実案件への導入は実装しない。

## 取得方式の比較

以下はコード・公式仕様からの比較で、実行した取得方式はclone参照だけ。将来の全利用者を今回のmacOS・本人とAgentという条件に固定しない。

| 取得方式 | 導入・利用側の手間と改造 | 更新・撤回 | 再現性・CIでの再取得 | オフラインとAgent操作 | 今回の判断 |
| --- | --- | --- | --- | --- | --- |
| 共通clone参照 | 専用checkoutの場所と完全SHAを明示。兄弟配置を保ち、必要経路だけ使える | 新SHAを別checkoutで比較して参照先を変更。撤回は旧checkoutへ戻す | URL・完全SHA・環境を利用側で記録しHEADを検査。CIでも明示取得が必要 | 取得済みrefと実行環境ならローカル生成可。通常のGit操作だがdirty状態とSHA違いに注意 | 初回の暫定推奨。複数案件が使う可変checkoutへの一括 `git pull` は避ける |
| 固定submodule | 親Gitがgitlinkでrefを保持。初期化と親子二段のGit操作が増える | gitlink更新をレビューし、旧gitlinkへ戻す。完全撤去は登録も整理 | 親commit + `git submodule update --init`。CIも初期化が必要。`--remote` は固定取得と別 | 初期化・依存取得後なら可。Agentはdetached HEADと親子の状態確認が必要 | チーム・CIでref追跡を自然に行いたくなれば有力。初回は追加手順の効果を実測できず保留 |
| 必要資産・テンプレートのコピー | 少量なら軽い。本文雛形のコピーと共通エンジンのvendoringを区別 | 上流差分とローカル改造を手動で統合。撤回は利用側Gitで戻す | コピー集合は利用側commitで固定。元URL・SHA・対象一覧・ライセンスも必要 | 資産と実行環境があれば可。Agentが所有権と上流差分を混同しやすい | 本文雛形のコピーは適合。共通資産の配布方式としては兄弟依存・改造増殖を避けるため初回不採用 |
| パッケージ化 | 現在は境界・含有資産・任意依存・入口の設計が必要 | 固定版を更新・旧版へ撤回。互換性とリリースの保守責任が増える | 固定版とlock等で再取得可能にできるがPandoc/Chromeの環境固定は別 | 配布物と依存の事前取得が必要。Agentはpackage managerで扱える | 需要と互換性契約が未確定で延期。npm公開は範囲外。将来のローカル配布も選択肢 |

取得と実行入口は別軸。clone/submodule/コピーのどれでもPandoc直接実行や薄いラッパーを選べる。今回は実験専用の `run.py` で取得と検証を繰り返す。製品のコマンド名・フォルダ名・CLI採用は決めない。

比較の一次情報: [Git submodule](https://git-scm.com/docs/git-submodule)、[Pandocのresource-path](https://pandoc.org/MANUAL.html#option--resource-path)。ローカル生成の可否は資産・ランタイム取得済みの場合であり、ネットワークを切断した生成実験は未実施。

## 既存6領域の依存と出力の選定

確認基準は上記main。依存の棚卸しは静的確認で、6領域すべてを今回ビルドしたものではない。

| 領域 | 実行時と兄弟領域の依存 | 今回の扱い |
| --- | --- | --- |
| Pandoc | HTMLはPandoc 3.x、`templates/document.html`、`styles/document.css`、`defaults/html.yaml`。PDFはChrome。mainのHTML経路にNode依存はない | Markdownを維持し、既存CSSと静的画像を埋め込めるため暫定選択 |
| Docusaurus | Node 20以上・npm lock、設定とMermaidが兄弟 `diagrams/` のテーマ・AWS packを参照。Google Fontsも外部参照 | 継続サイト・検索が必要になってから検討。サイト新設はしない |
| One-pager | HTML直接記述・CSS。checkは兄弟 `diagrams/themes/neutral.json` を照合。bundleはCSSのみで画像は埋め込まない | 1枚の量制約とHTML原本が今回の記録用途に合いにくく見送り |
| Marp | CLI 4.5.0と共有CSS。図を新規生成する場合はDiagrams、PDFはブラウザ | 発表需要が出てから |
| Slidev | Node 24.19.0指定、CLI 52.19.1。Marpトークンと兄弟Diagramsテーマ・資産を参照 | 発表需要が出てから |
| Diagrams | Node 20以上、Mermaid CLI 11.16.0・npm lock・Chrome。テーマ生成はMarp、検査はDocusaurusのCSSを参照 | 試料のSVG作成だけで使用。HTML再生成では描画済み資産を使う |

根拠は各 `README.md` / `package.json`、`docusaurus/docusaurus.config.js`、`docusaurus/src/mermaid-icons.js`、`one-pager/scripts/{check.mjs,bundle.sh}`、`slidev/scripts/sync-brand.mjs`、`slidev/theme/setup/mermaid.ts`、`diagrams/scripts/{build-themes.mjs,render.mjs}`。

## 外部プロジェクトで再実行する

必要環境はGit、Python 3.9以上の標準ライブラリ、Pandoc 3.x、最初のclone時のGitHub接続。確認実績はmacOS 15.8 arm64 / Python 3.15.0 / Pandoc 3.12.1 / Git 2.56.0のみ。下限版を個別検証したものではない。Chromeは目視確認用、Node・npmはHTML生成には不要。

Issue #1ブランチを取得したcheckoutのルートで実行する。出力先は既存データと混ぜないため **未作成かつツールキットの作業ツリー外** を指定する。次は実行済みのコマンドで、再実行時は末尾を `trial-2` 等に変える。

```bash
python3 experiments/phase0-adoption/run.py '/private/tmp/docs-toolkit-phase0 trial-1'
```

実験スクリプトは固定URLから2回cloneし、どちらも完全SHA `f2b5140610377ae80946d999f822cd9ffe1c3343` をcheckoutする。fixtureを `sample project/docs/` へコピーした後、その **外部コピーだけ** を入力にする。同梱サンプルをそのまま内部ビルドした成功とは区別する。

```text
指定した外部ディレクトリ/
  shared tools/toolkit-a/   # 固定SHAの共通資産
  shared tools/toolkit-b/   # 同一refの独立再取得
  sample project/docs/     # 利用側所有のMarkdown・画像
  sample project/output/   # 1回目の出力
  delivery/trial.html      # 別cloneで生成した持ち出し確認用HTML
  logs/commands.json       # argv・cwd・終了値・標準出力・標準エラー
  logs/result.json         # 環境・SHA・入力ハッシュ・各検査結果
```

失敗時は非ゼロ終了し、既存ファイルを消さず途中のログを残す。出力ディレクトリを作った後の失敗は、原因を直して別ディレクトリへ再試行する。このスクリプトは一般の任意入力を受けるCLIではない。パス内の `:` 等の特殊条件、出力衝突や多入力の一般解決は対象外。

相対画像の局所回避は、既存Pandocディレクトリをcwdにし、`--resource-path` で利用側原本と既存CSSの探索先を明示するだけ。

```bash
# cwd: <取得先>/pandoc。各パスは絶対パスで指定する
pandoc --defaults defaults/html.yaml --fail-if-warnings \
  --resource-path='<利用側>/docs:<取得先>/pandoc' \
  '<利用側>/docs/trial.md' -o '<出力先>/trial.html'
```

`fixture/docs/assets/flow.svg` は同じ場所の `flow.mmd` から、既存Mermaid CLI 11.16.0・neutralテーマ・Chromeで作成した。SVG再描画は任意で、PoC再実行に不要。再描画する場合はDiagramsの依存を取得した上で、取得先の `diagrams/` で実行する（`INPUT` と `OUTPUT` は外部試料の絶対パスにする）。

```bash
node scripts/render.mjs "$INPUT" "$OUTPUT" --theme neutral
```

SVGを手で修正しない。SVG生成の識別子等は再描画で変わり得るため、今回のHTMLハッシュとの一致判定には追跡済みSVGを使う。

## 実際の結果と証拠

実行日: 2026-10-18 JST。実行対象はtoolkit固定refと、[結果JSON](results/result.json)内のrunner・入力SHA-256で識別する。最終PRのコミットはPR自身で追跡し、コミット前のファイル名だけで対象を曖昧にしない。

| 検証 | 結果・制約 | 証拠 |
| --- | --- | --- |
| GitHubから同じrefを2回取得 | 両HEADとtree一致 | [result.json](results/result.json)、[commands.json](results/commands.json) |
| 既存スクリプトで外部相対画像 | **不具合再現**。`Could not fetch resource assets/flow.svg` だが終了0。画像未埋込 | commands内のbash実行。`legacy/` 出力は成功例として扱わない |
| PoCの局所回避 | 警告なし、CSS/SVG埋込。外部パスの空白も今回試料で成功 | 同上、`--resource-path` と `--fail-if-warnings` の実行 |
| 独立cloneからの生成 | HTMLのSHA-256一致 | `html_sha256` |
| ref切替・撤回 | `1c13261` に切替生成 → `f2b5140` に戻し出力一致。この2refはROADMAPのみの差分 | commands内のcheckoutとrestored出力。将来版の互換性保証ではない |
| 本文・資産・共通ツール | 入力ハッシュ不変、取得cloneのGit状態clean | result内の検査13件すべて成功 |
| 持ち出し先のブラウザ表示 | 確認結果は別記録に残す | [browser-check.json](results/browser-check.json) |

自動実行時の `result.json` はブラウザ未確認と記録する。後で行う目視確認と混同しない。大きな生成物・スクリーンショットは既存の `output/` 以下か外部一時ディレクトリへ置き、Gitでは原本・スクリプト・小さな証拠JSONを追跡する。

## 更新・撤回・所有権

本番案では新SHAを **別の専用checkout** に取得し、同じ入力から出力を比較してから参照先を切り替える。旧checkoutと旧SHAは撤回用に残す。利用側 `docs/` の本文、資産、固有設定を自動コピーし直さない。取得元URLと完全SHAは利用側Gitへ記録する案をIssue #3で最小化する。

共通資産のcheckoutを撤去しても利用側原本は残る。再取得できれば再生成できるが、オフラインで未取得refを入手することはできない。ツールキットrefだけではPandocの版やフォントまでは固定できない。元の出力も保持し、環境差は記録と切り分ける。異なる将来版の互換性検証、OS横断サポート、リリース管理は今回行っていない。

## 採用した場合のIssue #3の最小範囲

1. 1方式・1形式の薄い実行入口と最小のref記録。名前や配置の一般標準化は後回し。
2. 入力・画像・CSS・設定・出力のパスをcwdに依存させず解決し、欠落資産や無効入力で短い診断と非ゼロ終了にする。本文上書きと同名出力衝突を防ぐ。
3. #2の文書例を外部へ置き、相対画像・図・空白パス・負例・本文不変・持ち出しをスモークテストする。

これらは提案であり今回の本実装ではない。Issue #4の人間による途中判断と負担観測はさらに後続。採用判断と実利用レビューはユーザーへ返す。

## 独立レビュー

`f2b5140...7402b44` を対象に、実装者と別のAgentがStandards（既存規約・保守性）とSpec（Issue #1・今回の依頼）の2観点を並行レビューした。どちらも修正必須の指摘0件。Specでは実ログとスクリプト・試料のハッシュ、実在HTMLのハッシュも照合した。別Agentによる再実行は行っていない。

ブラウザ確認では、Issue #2の記入例のROADMAP相対リンクが持ち出しHTMLから開けないことを検出し、固定SHAのGitHub URLへ修正した。実装者による目視確認は別の証拠JSONに残す。これらは人間の採用・内容の受け入れや実案件での使いやすさの評価を代替しない。追加差分のStandardsレビューで確認記録の人向け説明が英語である点を指摘され、日本語へ修正した。

## ブラウザ用レビュー入口をまとめる

以下はレビュー資料を既存PandocテンプレートでHTMLへ変換し、素のリンクを先頭に置く手順。独自CSS・表示コンポーネント・公開先は作らない。Issue #1と#2のcheckoutを別々に取得しておき、変数のパスを実際の配置に合わせる。PoCの再実行自体は上記 `run.py` の1コマンドで完結する。

```bash
# Issue #1 checkoutのルートから。Issue #2は別checkoutを参照する
poc_checkout="$PWD"
template_checkout='/path/to/issue-2-checkout'
trial_dir='/private/tmp/docs-toolkit-phase0 trial-1'
preview_dir="$poc_checkout/output/phase0-review"
mkdir -p "$preview_dir"
cp "$trial_dir/delivery/trial.html" "$preview_dir/trial.html"
cp -R "$poc_checkout/experiments/phase0-adoption/results" "$preview_dir/"
cat > "$preview_dir/navigation.html" <<'HTML'
<p><a href="index.html">比較と検証</a> / <a href="review.html">判断用の記入例</a> / <a href="trial.html">外部生成の実物</a> / <a href="templates.html">雛形ガイド</a></p>
HTML
(
  cd "$poc_checkout/pandoc"
  pandoc --defaults defaults/html.yaml --fail-if-warnings \
    --include-before-body "$preview_dir/navigation.html" \
    --metadata title='Phase 0 レビュー入口' \
    "$poc_checkout/experiments/phase0-adoption/README.md" -o "$preview_dir/index.html"
  pandoc --defaults defaults/html.yaml --fail-if-warnings \
    --include-before-body "$preview_dir/navigation.html" \
    --metadata title='Phase 0 の記入例' \
    "$template_checkout/examples/phase0/review.md" -o "$preview_dir/review.html"
  pandoc --defaults defaults/html.yaml --fail-if-warnings \
    --include-before-body "$preview_dir/navigation.html" \
    "$template_checkout/docusaurus/docs/document-templates/small-change.md" -o "$preview_dir/templates.html"
)
```

`output/phase0-review/index.html` を開く。上端のリンクから記入例・外部生成HTML・雛形へ移れる。`trial.html` はPoC生成物のコピーで、レビュー用HTML変換とは区別する。元試行で自動ブラウザのfile URLが制限されたため、持ち出し先ディレクトリだけを一時的にlocalhostへ配信して確認した。file URLでの直接表示、別ブラウザでの表示は未検証。一時プレビューは確認後に停止し、サイト公開は行わない。
