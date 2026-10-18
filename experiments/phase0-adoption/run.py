#!/usr/bin/env python3
"""Issue #1限定の再現実験。新規の外部ディレクトリだけに書き込む。"""

import hashlib
import json
import platform
from pathlib import Path
import shlex
import shutil
import subprocess
import sys


REPOSITORY = "https://github.com/forsteri/docs-toolkit.git"
REF = "f2b5140610377ae80946d999f822cd9ffe1c3343"
PREVIOUS_REF = "1c1326111788890201893ed134876bc048f52cb8"
HERE = Path(__file__).resolve().parent


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def snapshot(directory):
    return {str(p.relative_to(directory)): digest(p)
            for p in sorted(directory.rglob("*")) if p.is_file()}


def main():
    if len(sys.argv) != 2:
        raise SystemExit("使い方: python3 run.py <未作成の外部ディレクトリ>")
    target = Path(sys.argv[1]).resolve()
    toolkit_root = HERE.parents[1]
    if target == toolkit_root or toolkit_root in target.parents:
        raise SystemExit("ツールキットの作業ツリー外を指定してください")
    for command in ("git", "pandoc"):
        if not shutil.which(command):
            raise SystemExit(f"必要なコマンドがありません: {command}")
    # 既存のデータには触れず、再試行は別ディレクトリに行う。
    target.mkdir(parents=True, exist_ok=False)
    logs = target / "logs"
    logs.mkdir()
    commands = []

    def run(args, cwd=None, expect_success=True):
        args = [str(a) for a in args]
        result = subprocess.run(args, cwd=cwd, text=True, capture_output=True)
        record = {"argv": args, "cwd": str(cwd or Path.cwd()),
                  "exit_code": result.returncode,
                  "stdout": result.stdout, "stderr": result.stderr}
        commands.append(record)
        (logs / "commands.json").write_text(
            json.dumps(commands, ensure_ascii=False, indent=2) + "\n")
        print(f"[{result.returncode}] {shlex.join(args)}", flush=True)
        if expect_success and result.returncode:
            raise RuntimeError(result.stderr or result.stdout)
        return result

    checks = []

    def check(name, condition):
        checks.append({"name": name, "passed": bool(condition)})
        if not condition:
            raise RuntimeError(f"検証失敗: {name}")

    project = target / "sample project"
    shutil.copytree(HERE / "fixture", project)
    docs = project / "docs"
    before = snapshot(docs)
    clones = [target / "shared tools" / name for name in ("toolkit-a", "toolkit-b")]
    for clone in clones:
        run(["git", "clone", "--quiet", "--no-checkout", REPOSITORY, clone])
        run(["git", "checkout", "--quiet", "--detach", REF], cwd=clone)
        check(f"{clone.name}: 固定SHA", run(
            ["git", "rev-parse", "HEAD"], cwd=clone).stdout.strip() == REF)
    check("同一refを独立に再取得", run(
        ["git", "rev-parse", "HEAD^{tree}"], cwd=clones[0]).stdout == run(
        ["git", "rev-parse", "HEAD^{tree}"], cwd=clones[1]).stdout)

    # 既存入口の失敗を保存する。出力成功という表示だけでは合格にしない。
    legacy_dir = target / "legacy"
    legacy = run(["bash", clones[0] / "pandoc/scripts/build-html.sh",
                  docs / "trial.md", legacy_dir])
    check("既存入口の画像欠落を再現", "Could not fetch resource" in legacy.stderr
          and "data:image/svg+xml" not in (legacy_dir / "trial.html").read_text())

    def build(clone, output):
        output.parent.mkdir(parents=True, exist_ok=True)
        # 外部画像と既存CSSを別々に探索する、この試料限定の局所回避。
        run(["pandoc", "--defaults", "defaults/html.yaml", "--fail-if-warnings",
             f"--resource-path={docs}:{clone / 'pandoc'}",
             docs / "trial.md", "-o", output], cwd=clone / "pandoc")
        html = output.read_text()
        check(f"{output.parent.name}: CSSと相対SVGを埋込", "<style" in html
              and "data:image/svg+xml" in html and 'src="assets/' not in html
              and 'href="styles/' not in html)

    output = project / "output/trial.html"
    delivery = target / "delivery/trial.html"
    build(clones[0], output)
    build(clones[1], delivery)
    check("独立clone間でHTMLが一致", digest(output) == digest(delivery))
    # 取得refの切替と撤回。両ref間はROADMAPのみの差分で、互換性の一般的保証ではない。
    run(["git", "checkout", "--quiet", "--detach", PREVIOUS_REF], cwd=clones[1])
    build(clones[1], target / "previous/trial.html")
    run(["git", "checkout", "--quiet", "--detach", REF], cwd=clones[1])
    build(clones[1], target / "restored/trial.html")
    check("撤回後の出力一致", digest(output) == digest(target / "restored/trial.html"))
    check("利用側の本文と資産が不変", before == snapshot(docs))
    for clone in clones:
        check(f"{clone.name}: 管理ファイル不変", not run(
            ["git", "status", "--porcelain", "--untracked-files=all"], cwd=clone).stdout)

    result = {
        "repository": REPOSITORY, "toolkit_ref": REF, "previous_ref": PREVIOUS_REF,
        "runner_sha256": digest(Path(__file__)), "fixture_sha256": before,
        "environment": {"platform": platform.platform(),
                        "macos": platform.mac_ver()[0], "python": platform.python_version(),
                        "pandoc": run(["pandoc", "--version"]).stdout.splitlines()[0],
                        "git": run(["git", "--version"]).stdout.strip()},
        "legacy_exit_code": legacy.returncode,
        "checks": checks, "html_sha256": digest(delivery),
        "output": str(delivery),
        "browser_check": "未実施。この結果ファイルは自動実行の検証だけを記録する。",
        "human_acceptance": "未実施。方式の採用とIssue #3への着手はユーザー判断待ち。",
    }
    (logs / "result.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(f"再現実験成功。ブラウザで確認するファイル: {delivery}")
    print(f"証拠: {logs / 'result.json'} / {logs / 'commands.json'}")


if __name__ == "__main__":
    main()
