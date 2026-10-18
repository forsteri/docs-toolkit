# 別の開発プロジェクトで docs-toolkit を使うには

小さな開発変更をAgentへ依頼し、目的・途中成果・確認結果をブラウザで受け取る使い方を提案します。**今回は、その使い方を次の小さな実装で試したいかを判断してください。** 任意の案件にそのまま使える入口はまだできていません。

## 小さな機能変更を依頼する場面

たとえば、別のWebアプリで「設定を保存できるようにしたい」と依頼する場面です。以下は次の実装後に目指す利用例で、このアプリを今回作ったという意味ではありません。

> このアプリに設定保存を追加したい。docs-toolkitを使って、目的・今回やらないこと・私が確認する点をまとめてください。途中で、今動くこと、画面へのリンク、残る問題、次に進めたい範囲をブラウザで読める形にしてください。

あなたが伝えるのは、対象プロジェクト、実現したいこと、今回扱わない範囲、どの段階で見たいかです。Agentは必要な情報を確認し、目的を揃えるメモ、途中の確認依頼、最後の検証結果をまとめます。小さければ1つの文書にし、すでにIssueやPRにある内容は参照します。

受け取るのは、**プロジェクトに残す編集可能なMarkdown原本と、ブラウザで読むためのHTML**です。実際の画面やテスト結果は開発プロジェクト側が用意し、文書から参照します。ツールキットがアプリを実装したり、テストや内容の正しさを保証したりするものではありません。

| 場面 | あなたがすること | Agentがすること・受け取る物 |
| --- | --- | --- |
| 初回準備 | 対象プロジェクトと上のような依頼を伝える。準備が必要な道具があれば、その内容を確認する | Macの必要環境を確認し、使う版のツールキットと文書置き場を用意する。初回の生成物を渡す |
| 普段の利用 | 変更したい内容を伝え、途中のHTMLで「目的に合うか」「次へ進むか」を返す | 原本を更新してHTMLを作り直す。途中では動く物へのリンクと残る問題、最後には確認結果を添える |
| 更新するとき | 新しい版で見た目や使い方が変わる場合、その影響を確認する | 新旧の版で同じ原本を試してから切り替える。問題があれば元の版へ戻す。書いた本文を更新で上書きしない |

同じMacに道具が揃っていれば、次の案件ではそれを参照し、その案件の文書置き場と使う版の記録を用意する想定です。

この流れでは、普段の依頼にdocs-toolkitを使う旨を含めます。既存のAgentが利用ガイドに沿って準備・生成できるよう、入口と案内を整えるのが次の実装の目標です。毎回あなたが生成コマンドを組み立てる運用は目指しませんが、自動で有効になる仕組みはまだありません。

## 今はどこまで体験できるか

**今できるのは、用意済みの小さな検証プロジェクトについて、原本から文書を作り、実物を読むところまでです。** あなたの別プロジェクトの文書を、そのまま渡して使える状態ではありません。

このブラウザ版の上端にあるリンクで、次の順に実物を見られます。

1. **「生成した文書」**を開きます。外部の検証プロジェクトに置いた文章と画像から作った実物です。本文・図・目次を確認できます。これは文書の生成試料で、設定保存機能の画面や動作結果ではありません。
2. **「文書の記入例」**を開きます。今回の導入試行について、目的・途中の判断・確認結果を1つにまとめた例です。「何ができ、何が未確認で、次にどこまで進むか」を受け取る形を確認できます。
3. 書き手側の型も見たい場合に、**「雛形ガイド」**を開きます。毎回3文書を作る決まりにはせず、IssueやPRで代替できる条件も示しています。

| 現在のPoCで実演・確認したこと | 次の実装で目指すこと・まだ約束できないこと |
| --- | --- |
| 決まった検証用原本と画像から、ブラウザで読めるHTMLを作った | あなたが選ぶ小さな別プロジェクトの原本と画像を扱うため、生成の入口と案内を整える |
| 生成したHTMLだけを別の場所へ置き、本文・画像・目次を確認した | 通常の持ち出し操作でも欠落を見つけられるようにする。今回はローカルHTTP経由で確認し、ファイルの直接表示は自動化の制限により未確認 |
| 同じ版を取り直し、出力が同じになることと原本が変わらないことを確認した | 不足した画像や誤った入力で、使えない出力を成功として渡さない。現在の既存生成スクリプトには画像欠落を見逃す問題があり、試行内でだけ回避した |
| 別の版へ切り替えて元に戻す操作を試した | 今後どの版へ更新しても安全とは保証できない。今回の2版は表示資産が同じなので、実際の見た目の変化を伴う更新は未確認 |

今回の実物はMac上の公開サンプルです。**実案件で資料が役立つか、あなたの確認が楽になるかは、まだ確かめられていません。** 次の実装で使う入口を整えた後に、実際の確認に使って評価する段階が残ります。

## この使い方を選ぶと何が変わるか

最初に文書を作る道具をMacへ用意する手間を引き受ける代わりに、普段は「依頼する → HTMLを読む → 修正や続行を返す」という流れを目指します。現在のPoCはその準備を案件ごとに簡単に済ませる仕組みまでは持っていません。道具が未導入のMacからの準備時間も測っていないため、「初回からすぐ使える」とは言えません。

文書の見た目を決める共通の道具は、本文とは分けてMac内に置き、**使い始めた版を勝手に更新しない**案です。技術上は「固定した版の共通cloneを参照する方式」です。本文からHTMLを作る道具にはPandocを使います。この置き方や道具の名前を覚えることを、今回の採用判断の条件にはしません。

| 利用への影響 | 引き受ける手間・制約と、後から変える場合 |
| --- | --- |
| 毎回の読み方を揃えられる | 生成した時点のHTMLを読みます。原本を直してもHTMLは自動更新されないため、Agentが作り直して渡す必要があります |
| サイトを運営せず文書を渡せる | まずは1文書ずつ開く使い方です。サイト横断の検索、複数人での同時編集、自動公開は今回整えません |
| 更新を急がず同じ版で使える | 道具の置き場と採用版を管理する作業が残ります。別Macへ移すときは道具の準備も必要です。複数案件の一括更新は未検証です |
| 文書をプロジェクトに残せる | 本文はMarkdownなので、将来別の生成方式へ移しても利用側に残ります。ただし生成手順・設定・見た目の再確認は必要で、無修正で移行できるとは限りません |
| 最初の対応範囲を小さくできる | まずはMacと単体HTMLです。他OS、PDF、スライド、継続更新サイトが最初から必要なら、この案のまま進める前に範囲を見直します |

共通資産を案件ごとにコピーする案なら置き場への参照は減らせますが、後から直すたびに各コピーの差分を扱います。導入用パッケージを先に作れば取得を簡単にできる可能性はあるものの、その配布と保守が増えます。まずは上の小さな使い方が役立つかを確かめるため、そこまで作り込まない案を勧めます。全方式の技術比較は末尾の詳細に残しています。

## 今回決めてほしいこと

**「MacでAgentに文書作成・再生成を依頼し、自分はブラウザで目的と途中成果を確認する使い方」を、次の小さな実装で試す方向に進めるか**を判断してください。

推奨は、この方向でIssue #3の最小利用導線を整えることです。引き受けるのは、初回のローカル準備、原本を直すたびの再生成、道具の版と置き場の管理、Mac・単体HTMLから始める制約です。これらを受け入れても、実際の確認負担が減るかは試行後に見直します。

| 判断 | その場合に進めること |
| --- | --- |
| この使い方で小さく試したい（推奨） | Issue #3で、別プロジェクトの原本からHTMLを作る入口、足りない資産の診断、原本や出力を不用意に上書きしない保護、外部利用の確認を整える |
| 使いたいが、この不便は受け入れにくい | たとえば「道具の準備を毎回意識したくない」「HTMLを作り直す操作を減らしたい」など、利用上の条件をもとに今回の案を見直す |
| まだ使いたい場面がない・保留したい | 実装を進めず、今回の原本と生成物を残す |

あなたが決めるのは、**この利用の流れと不便を受け入れて試したいか、変えたい条件があるか**です。コマンド名、フォルダ名、版の記録方法、画像を探す処理などの細部は、範囲内で実装側が決めます。文書もまずは目的・途中判断・確認結果を1ファイルにまとめ、情報が足りなければ実利用で調整します。

続行を選んだ場合も、今回の成果だけで実案件への導入・有用性・Phase 0全体の受け入れを完了扱いにしません。今回は説明の組み替えまでで止めており、Issue #3の実装は始めていません。

## 技術的な根拠と再実行の詳細

方式の比較、対象の版、実行方法、検査とログは以下に残しています。上の利用判断に必要な制約は本文に記載済みです。具体的な不具合や再現性を確かめたいときに開いてください。

<details>
<summary>正本と作業の境界</summary>

- 作業開始時の最新main: `f2b5140610377ae80946d999f822cd9ffe1c3343`。計画PR [#13](https://github.com/forsteri/docs-toolkit/pull/13) はマージ済み。そのmainの `ROADMAP.md` とIssue #1〜#4・各コメントを確認した。依頼との矛盾はなかった。
- 既存checkoutにはPandoc等の未コミット変更があったため、最新mainから独立worktreeとIssue別ブランチを作成した。既存変更をPoCやPRに取り込んでいない。
- 比較・開発検証記録はここへ集約し、`docusaurus/docs/` は利用者向けの雛形・ガイドだけに使う。
- 本PoCは固定された1試料の実験スクリプト。既存 `pandoc/` は改修しない。汎用CLI、設定体系、配布基盤、CI、実案件への導入は実装しない。

</details>

<details>
<summary>取得方式の比較</summary>

以下はコード・公式仕様からの比較で、実行した取得方式はclone参照だけ。将来の全利用者を今回のmacOS・本人とAgentという条件に固定しない。

| 取得方式 | 導入・利用側の手間と改造 | 更新・撤回 | 再現性・CIでの再取得 | オフラインとAgent操作 | 今回の判断 |
| --- | --- | --- | --- | --- | --- |
| 共通clone参照 | 専用checkoutの場所と完全SHAを明示。兄弟配置を保ち、必要経路だけ使える | 新SHAを別checkoutで比較して参照先を変更。撤回は旧checkoutへ戻す | URL・完全SHA・環境を利用側で記録しHEADを検査。CIでも明示取得が必要 | 取得済みrefと実行環境ならローカル生成可。通常のGit操作だがdirty状態とSHA違いに注意 | 初回の暫定推奨。複数案件が使う可変checkoutへの一括 `git pull` は避ける |
| 固定submodule | 親Gitがgitlinkでrefを保持。初期化と親子二段のGit操作が増える | gitlink更新をレビューし、旧gitlinkへ戻す。完全撤去は登録も整理 | 親commit + `git submodule update --init`。CIも初期化が必要。`--remote` は固定取得と別 | 初期化・依存取得後なら可。Agentはdetached HEADと親子の状態確認が必要 | チーム・CIでref追跡を自然に行いたくなれば有力。初回は追加手順の効果を実測できず保留 |
| 必要資産・テンプレートのコピー | 少量なら軽い。本文雛形のコピーと共通エンジンのvendoringを区別 | 上流差分とローカル改造を手動で統合。撤回は利用側Gitで戻す | コピー集合は利用側commitで固定。元URL・SHA・対象一覧・ライセンスも必要 | 資産と実行環境があれば可。Agentが所有権と上流差分を混同しやすい | 本文雛形のコピーは適合。共通資産の配布方式としては兄弟依存・改造増殖を避けるため初回不採用 |
| パッケージ化 | 現在は境界・含有資産・任意依存・入口の設計が必要 | 固定版を更新・旧版へ撤回。互換性とリリースの保守責任が増える | 固定版とlock等で再取得可能にできるがPandoc/Chromeの環境固定は別 | 配布物と依存の事前取得が必要。Agentはpackage managerで扱える | 需要と互換性契約が未確定で延期。npm公開は範囲外。将来のローカル配布も選択肢 |

取得と実行入口は別軸。clone/submodule/コピーのどれでもPandoc直接実行や薄いラッパーを選べる。今回は実験専用の `run.py` で取得と検証を繰り返す。製品のコマンド名・フォルダ名・CLI採用は決めない。

比較の一次情報: [Git submodule](https://git-scm.com/docs/git-submodule)、[Pandocのresource-path](https://pandoc.org/MANUAL.html#option--resource-path)。ローカル生成の可否は資産・ランタイム取得済みの場合であり、ネットワークを切断した生成実験は未実施。

</details>

<details>
<summary>既存6領域の依存と出力の選定</summary>

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

</details>

<details>
<summary>外部プロジェクトで再実行する</summary>

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

</details>

<details>
<summary>実際の結果と証拠</summary>

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

</details>

<details>
<summary>更新・撤回・所有権</summary>

本番案では新SHAを **別の専用checkout** に取得し、同じ入力から出力を比較してから参照先を切り替える。旧checkoutと旧SHAは撤回用に残す。利用側 `docs/` の本文、資産、固有設定を自動コピーし直さない。取得元URLと完全SHAは利用側Gitへ記録する案をIssue #3で最小化する。

共通資産のcheckoutを撤去しても利用側原本は残る。再取得できれば再生成できるが、オフラインで未取得refを入手することはできない。ツールキットrefだけではPandocの版やフォントまでは固定できない。元の出力も保持し、環境差は記録と切り分ける。異なる将来版の互換性検証、OS横断サポート、リリース管理は今回行っていない。

</details>

<details>
<summary>採用した場合のIssue #3の最小範囲</summary>

1. 1方式・1形式の薄い実行入口と最小のref記録。名前や配置の一般標準化は後回し。
2. 入力・画像・CSS・設定・出力のパスをcwdに依存させず解決し、欠落資産や無効入力で短い診断と非ゼロ終了にする。本文上書きと同名出力衝突を防ぐ。
3. #2の文書例を外部へ置き、相対画像・図・空白パス・負例・本文不変・持ち出しをスモークテストする。

これらは提案であり今回の本実装ではない。Issue #4の人間による途中判断と負担観測はさらに後続。採用判断と実利用レビューはユーザーへ返す。

</details>

<details>
<summary>独立レビュー</summary>

`f2b5140...7402b44` を対象に、実装者と別のAgentがStandards（既存規約・保守性）とSpec（Issue #1・今回の依頼）の2観点を並行レビューした。どちらも修正必須の指摘0件。Specでは実ログとスクリプト・試料のハッシュ、実在HTMLのハッシュも照合した。別Agentによる再実行は行っていない。

ブラウザ確認では、Issue #2の記入例のROADMAP相対リンクが持ち出しHTMLから開けないことを検出し、固定SHAのGitHub URLへ修正した。実装者による目視確認は別の証拠JSONに残す。これらは人間の採用・内容の受け入れや実案件での使いやすさの評価を代替しない。追加差分のStandardsレビューで確認記録の人向け説明が英語である点を指摘され、日本語へ修正した。

この独立レビューは最初のPoCと文書の型を対象としたもの。利用場面から読み直す今回の改稿は含まない。改稿は実装者が依頼の4項目と表示を確認し、新たな独立レビューは実施していない。

</details>

<details>
<summary>ブラウザ用レビュー入口をまとめる</summary>

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
<p><a href="index.html">使い方と今回の判断</a> / <a href="review.html">文書の記入例</a> / <a href="trial.html">生成した文書</a> / <a href="templates.html">雛形ガイド</a></p>
HTML
(
  cd "$poc_checkout/pandoc"
  pandoc --defaults defaults/html.yaml --fail-if-warnings \
    --include-before-body "$preview_dir/navigation.html" \
    --metadata title='別プロジェクトでの使い方を判断する' \
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

</details>
