#!/usr/bin/env bash
# Markdown（または生成済みHTML）を Google Chrome のヘッドレス印刷で PDF 化する。
# 使い方: scripts/build-pdf.sh <input.md|input.html> [output-dir] [defaults.yaml]
#   output-dir    省略時は pandoc/build/
#   defaults.yaml 省略時は pandoc/defaults/html.yaml（Markdown 入力時の HTML 変換に使用）
#   CHROME_PATH   環境変数で Chrome 実行ファイルを上書きできる
#   PDF_TIMEOUT   印刷完了を待つ秒数（既定 60）
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "使い方: $0 <input.md|input.html> [output-dir] [defaults.yaml]" >&2
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
pandoc_root="$(cd "${script_dir}/.." && pwd)"

input_file="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
output_dir="${2:-${pandoc_root}/build}"
defaults_file="${3:-${pandoc_root}/defaults/html.yaml}"
chrome_path="${CHROME_PATH:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"

if [[ ! -f "${input_file}" ]]; then
  echo "入力ファイルが見つかりません: ${input_file}" >&2
  exit 1
fi

if [[ ! -x "${chrome_path}" ]]; then
  echo "Google Chrome が見つかりません: ${chrome_path}" >&2
  echo "CHROME_PATH 環境変数で実行ファイルのパスを指定してください。" >&2
  exit 1
fi

mkdir -p "${output_dir}"
output_dir="$(cd "${output_dir}" && pwd)"

base_name="$(basename "${input_file}")"
extension="${base_name##*.}"
base_name="${base_name%.*}"

case "${extension}" in
  html|htm)
    html_path="${input_file}"
    ;;
  *)
    "${script_dir}/build-html.sh" "${input_file}" "${output_dir}" "${defaults_file}"
    html_path="${output_dir}/${base_name}.html"
    ;;
esac

output_path="${output_dir}/${base_name}.pdf"
rm -f "${output_path}"

# 使い捨てのプロファイルで起動し、既存の Chrome セッションに影響させない
profile_dir="$(mktemp -d "${TMPDIR:-/tmp}/docs-toolkit-chrome.XXXXXX")"
chrome_log="${profile_dir}/chrome.log"
chrome_pid=""

cleanup() {
  if [[ -n "${chrome_pid}" ]] && kill -0 "${chrome_pid}" 2>/dev/null; then
    kill "${chrome_pid}" 2>/dev/null || true
    sleep 0.5
    kill -9 "${chrome_pid}" 2>/dev/null || true
  fi
  rm -rf "${profile_dir}"
}
trap cleanup EXIT

# Chrome はバージョンによって印刷後に自発終了しないことがあるため、
# バックグラウンドで起動し、PDF の書き出し完了を検知したら停止する。
"${chrome_path}" \
  --headless=new \
  --disable-gpu \
  --disable-background-networking \
  --disable-component-update \
  --disable-default-apps \
  --disable-extensions \
  --disable-sync \
  --no-default-browser-check \
  --no-first-run \
  --no-pdf-header-footer \
  --run-all-compositor-stages-before-draw \
  --user-data-dir="${profile_dir}" \
  --print-to-pdf="${output_path}" \
  "file://${html_path}" >"${chrome_log}" 2>&1 &
chrome_pid=$!

timeout_seconds="${PDF_TIMEOUT:-60}"
elapsed=0
while :; do
  if ! kill -0 "${chrome_pid}" 2>/dev/null; then
    break
  fi
  if [[ -s "${output_path}" ]] && grep -q "written to file" "${chrome_log}" 2>/dev/null; then
    sleep 1
    break
  fi
  if (( elapsed >= timeout_seconds * 2 )); then
    echo "Chrome の印刷が ${timeout_seconds} 秒以内に完了しませんでした。" >&2
    sed -n '1,20p' "${chrome_log}" >&2 || true
    exit 1
  fi
  sleep 0.5
  elapsed=$((elapsed + 1))
done

if [[ ! -s "${output_path}" ]]; then
  echo "PDF が生成されませんでした: ${output_path}" >&2
  sed -n '1,20p' "${chrome_log}" >&2 || true
  exit 1
fi

echo "生成しました: ${output_path}"
