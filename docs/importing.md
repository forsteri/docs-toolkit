# 取り込み方と取り込み記録

テンプレートは利用プロジェクトへ**コピーで取り込み**、取り込み元のコミットと利用側の改変を記録します。docs-toolkit-sample でこの方式を6形式すべてについて試し、取り込み直しまで通しています。

## 取り込む

```bash
# 例: pandoc-template を tools/pandoc-template/ へ取り込む
git clone https://github.com/forsteri/pandoc-template.git /tmp/pandoc-template
git -C /tmp/pandoc-template rev-parse --short HEAD    # 記録するコミット
rsync -a --exclude .git /tmp/pandoc-template/ tools/pandoc-template/
```

- 置き場所は利用プロジェクトが決めます。docs-toolkit-sample では、手を入れずに使う道具は `tools/` に、利用側の本文と一体で育てるもの（Docusaurusサイト・スライド・One-pager）はそれぞれの置き場所（`docs-site/` など）に置いています。
- 取り込む基準のコミットは、README の「動作確認済みの組み合わせ」を目安にします。
- 取り込んだら、各リポジトリの README にある案内（docusaurus-template なら「取り込んだら最初にやること」）に沿って片付け、検査コマンドを通します。
- ブランド値は [`brand/`](../brand/README.md) で当てます。テンプレートのCSSを手で書き換えるより、取り込み直しのときに差分が小さく済みます。

## 記録する

利用プロジェクトの `tools/README.md` など、決まった1か所に次の表を置きます。

```markdown
# 取り込んだツール

テンプレートはコピーで取り込み、取り込み元のコミットをここに記録する。改変した箇所は元リポジトリへ戻す。

| 置き場所 | 取り込み元 | コミット | 改変したファイル |
| --- | --- | --- | --- |
| `tools/pandoc-template/` | forsteri/pandoc-template | e961270 | `styles/document.css` のブランド値（`brand/apply.mjs`） |
| `tools/diagrams/` | forsteri/diagrams | 58c60b7 | なし（ブランド値は `--tokens brand/tokens.css` で渡す） |

## 履歴

- 2026-10-28: pandoc-template を e961270 に更新。差し替えたのは `scripts/build-html.sh`。
```

- **コミット**は取り込んだ版の短いSHAです。タグができたらタグ名を併記します。
- **改変したファイル**には、利用側で変えたファイルと理由を書きます。ここに無いファイルは、取り込み直しのときにそのまま差し替えてよいものとして扱います。
- ブランド値のように道具で当て直せる改変は、その道具の名前も書きます。
- **履歴**には、更新した日・新しいコミット・差し替えたファイルを1行ずつ足します。

## 取り込み直す

1. 記録のコミットから新しいコミットまでの差分を、取り込み元のリポジトリで確認する（`git diff <旧>..<新> --stat`）
2. 「改変したファイル」以外を差し替える。改変したファイルは差分を見て手で合わせる
3. ブランド値を当て直し、`node brand/apply.mjs --check ...` で当たっていることを確かめる
4. 各リポジトリの検査と生成を通し、見た目を確かめる
5. 記録のコミットと履歴を更新する

## 改善を戻す

利用側でテンプレートを直したくなったら、利用側だけで直し続けずに、取り込み元のリポジトリへ変更を出します。戻した変更が取り込み元に入ったら、次の取り込み直しで利用側の改変から外せます。docs-toolkit-sample で見つかった改善も、この流れで各リポジトリへ戻しています。
