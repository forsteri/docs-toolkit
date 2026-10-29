# 取り込み方と取り込み記録

テンプレートは利用プロジェクトへ**コピーで取り込み**、取り込み元のリポジトリ・サブフォルダ・完全なSHAを記録します。記録の作成・確認・取り込み直し・撤回は [`scripts/import.mjs`](../scripts/import.mjs)（依存なし、Node.js 20以上と git）で行います。docs-toolkit-sample でこの方式を6形式と `brand/` について試し、取り込み直しと撤回まで通しています（[確かめたこと](#docs-toolkit-sample-で確かめたこと)）。

以下の例では、docs-toolkit を利用プロジェクトの隣（`../docs-toolkit`）に取得してあり、利用プロジェクトの作業ツリーの中で実行します。

## 取り込む

```bash
# pandoc-template を tools/pandoc-template/ へ
node ../docs-toolkit/scripts/import.mjs add tools/pandoc-template \
  --repo https://github.com/forsteri/pandoc-template.git --to e96127081270bc0ed079f4703294f6150fc9ac13

# リポジトリの一部だけを取り込むときは --path（Marp はテーマのフォルダ、Slidev は theme/）
node ../docs-toolkit/scripts/import.mjs add slides/marp/theme \
  --repo https://github.com/forsteri/marp-theme.git --path themes/forsteri --to v0.1.0

# brand/ も docs-toolkit から同じように取り込む
node ../docs-toolkit/scripts/import.mjs add brand \
  --repo https://github.com/forsteri/docs-toolkit.git --path brand --to <コミット>
```

- `--to` にはコミット・タグ・ブランチのどれでも渡せます。記録されるのは解決した完全なSHAで、そのコミットを指すタグがあれば目印として添えます。
- 基準にするコミットは、README の「動作確認済みの組み合わせ」（正本は [`verified.json`](../verified.json)）から選びます。
- 置き場所は利用プロジェクトが決めます。docs-toolkit-sample では、手を入れずに使う道具は `tools/` に、利用側の本文と一体で育てるもの（Docusaurusサイト・スライド・One-pager）はそれぞれの置き場所（`docs-site/` など）に置いています。
- 取り込んだら、各リポジトリの README にある案内（docusaurus-template なら「取り込んだら最初にやること」）に沿って片付け、検査コマンドを通します。使わないファイル（記入例や検証記録など）は消してかまいません。消したことは記録の突き合わせで分かります。
- ブランド値は [`brand/`](../brand/README.md) で当てます。テンプレートのCSSを手で書き換えるより、取り込み直しのときに競合が小さく済みます。

## 記録する

`import.mjs` は作業ツリー直下の `toolkit-imports.json` を読み書きします（`--record <file>` で別の場所も指定できます）。手で書き換える必要はありません。

```json
{
  "imports": [
    {
      "dest": "slides/marp/theme",
      "repo": "https://github.com/forsteri/marp-theme.git",
      "path": "themes/forsteri",
      "commit": "25e8108dfcc9293bbc731657bf2e8f91dd5eee06",
      "tag": null
    }
  ]
}
```

改変の**理由**は機械では分からないので、利用プロジェクトの `tools/README.md` など決まった1か所に人が書きます。

```markdown
| 置き場所 | 取り込み元 | 改変 |
| --- | --- | --- |
| `tools/pandoc-template/` | forsteri/pandoc-template | `styles/document.css` のブランド値（`brand/apply.mjs`） |
| `slides/marp/theme/` | forsteri/marp-theme の `themes/forsteri/` | `forsteri.css` のブランド値、`README.md` は取り込まない |

## 履歴

- 2026-10-28: pandoc-template を e961270 に更新。
```

- ブランド値のように道具で当て直せる改変は、その道具の名前も書きます。
- **履歴**には、更新した日・新しいコミット・手で合わせたファイルを1行ずつ足します。

## 改変を確かめる

```bash
node ../docs-toolkit/scripts/import.mjs status            # すべての置き場所
node ../docs-toolkit/scripts/import.mjs status docs-site  # 1つだけ
```

記録のコミットの中身と置き場所を比べ、利用側で**追加・変更・削除**したファイルを表示します。Gitが無視するファイル（`node_modules/`、生成物など）は数えません。人が書いた改変の表に無いものが出たら、表に足すか、取り込み元へ戻します。

## 取り込み直す

```bash
node ../docs-toolkit/scripts/import.mjs update tools/pandoc-template --to v0.2.0 --dry-run   # 何が起きるかだけ見る
node ../docs-toolkit/scripts/import.mjs update tools/pandoc-template --to v0.2.0
git diff                                                                                      # 結果を確かめる
```

`update` は、記録のコミット（旧）・新しいコミット・置き場所の現状の3つから、上流の変更を利用側の改変を残したまま当てます（Git の3方向マージ）。

| 上流の変更 | 利用側 | 結果 |
| --- | --- | --- |
| 追加・変更・削除 | 触っていない | そのまま当たる |
| 移動（名前の変更） | 触っていない／中身を変えた | 移動先へ移り、利用側の変更も残る |
| 変更 | 別の箇所を変えた（ブランド値など） | 両方が残る |
| 変更 | 同じ箇所を変えた | **競合**。印（`<<<<<<<`）を残して一覧にし、終了コード1 |
| 変更 | 消した（使わない例など） | 消したまま。注記に出す |
| 削除 | 変えた | 利用側の内容を残し、一覧にする（終了コード1） |
| 追加 | — | 入る。使わないなら消す |

- 置き場所に未コミットの変更があると止まります。失敗したら `git checkout -- <置き場所> toolkit-imports.json` で戻せます。
- 成功すると `toolkit-imports.json` の `commit` と `tag` が新しい版になります。

取り込み直したあとにやること:

1. 一覧に出たファイルを手で合わせる
2. `node brand/apply.mjs --check ...` でブランド値が当たったままか確かめる。上流がトークンを足していれば、違いとして出るので当て直す
3. 各リポジトリの「当てたあとに実行する」手順（`brand:derive`、`brand:sync`、`build:mermaid` など）と検査・生成を通し、見た目を確かめる
4. `tools/README.md` の改変の表と履歴を更新し、記録と一緒にコミットする

## 撤回する

旧版のコミットを `--to` に渡すと、取り込み直しと同じ仕組みで旧版へ戻ります。利用側の改変は残ります。

```bash
node ../docs-toolkit/scripts/import.mjs update tools/pandoc-template --to f31adc5
```

- 取り込み直しのコミットを `git revert` しても戻せます。新しい版の上で利用側がさらに改変していたら、`update` で戻すほうが改変を拾えます。
- 旧版から新版へ移ったときに、利用側の手順（`package.json` のスクリプトなど）を新しい場所に合わせていたら、撤回後にそこも戻します。たとえば slidev-theme の `sync-brand.mjs` は eab5fcb で `theme/` の中へ移ったので、78698bf へ戻すと `theme/scripts/sync-brand.mjs` が無くなり、`brand:sync` が動かなくなります。

## 版

- **正本は完全なSHA**です。取り込み記録（`toolkit-imports.json`）と動作確認済みの組み合わせ（`verified.json`）は、どちらも40桁のSHAで記録します。短いSHAとタグは人が読むための目印です。
- **タグ**は各リポジトリに独立に `v0.x.y` を打ちます。最初のタグは、2026-10-28 に確認したコミットに打つ `v0.1.0` です。以後は、利用側の手順やファイル構成が変わる変更（移動・削除・必須の手順の追加）で minor を、それ以外で patch を上げます。タグは打ち直しません。
- **動作確認済みの組み合わせ**は、docs-toolkit-sample で取り込み直して確認するたびに、`verified.json` の先頭に1件足し、README の表の先頭行を合わせます（`scripts/check.mjs` が一致を検査します）。各リポジトリのタグを打つのは、この確認を通ったコミットだけです。
- 記録した組み合わせは `node scripts/fetch.mjs --into <dir> [--set <確認日>] [--sample]` でそのSHAのまま取得でき、タグが記録と違うコミットを指していれば失敗します。

## 改善を戻す

利用側でテンプレートを直したくなったら、利用側だけで直し続けずに、取り込み元のリポジトリへ変更を出します。戻した変更が取り込み元に入ったら、次の取り込み直しで利用側の改変から外れます（`status` に出なくなります）。docs-toolkit-sample で見つかった改善も、この流れで各リポジトリへ戻しています。

## docs-toolkit-sample で確かめたこと

2026-10-29 に、docs-toolkit-sample（6dff849）で次を確かめました。

- 7つの置き場所（6形式と `brand/`）の記録を `toolkit-imports.json` に作り、`status` の結果がサンプルの改変の表と一致した（Docusaurus の記入例の削除、One-pager の例の削除、Marp の `README.md` を取り込まないことなど）。
- `brand/` を docs-toolkit の `brand/`（aef3903）に揃えた。Hakobi のダークの値を `tokens.dark.css` に移し、`apply.mjs --check` で全テンプレートに違いが無く、diagrams の `build:themes --tokens` の結果も `onepager/design/neutral.json` とバイト一致した。
- 全置き場所を記録のコミットへ `update` すると、何も変わらなかった。
- 実際の履歴で撤回して戻した。slidev-theme eab5fcb → 78698bf → eab5fcb（`sync-brand.mjs` の移動を含む）、pandoc-template e961270 → f31adc5 → e961270（`starters/` などの削除を含む）、docusaurus-template 298e7c6 → d38aa8f → 298e7c6（`derive-brand.mjs` の削除を含む）。どれも戻した結果が元とバイト一致した。
- docusaurus-template をトークン移行前の版へ戻すと、`src/css/custom.css` が競合として一覧に出て、終了コード1になった。

追加・変更・削除・移動・競合・撤回の組み合わせは `node scripts/test-import.mjs` で再現でき、`scripts/check.mjs` からも実行されます。
