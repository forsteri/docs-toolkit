#!/usr/bin/env bash
# Markdown 1ファイルを Pandoc で単体HTMLへ変換する。
# 使い方: scripts/build-html.sh <input.md> [output-dir] [defaults.yaml]
#   output-dir   省略時は pandoc/build/
#   defaults.yaml 省略時は pandoc/defaults/html.yaml
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "使い方: $0 <input.md> [output-dir] [defaults.yaml]" >&2
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
pandoc_root="$(cd "${script_dir}/.." && pwd)"

input_file="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
output_dir="${2:-${pandoc_root}/build}"
defaults_file="${3:-${pandoc_root}/defaults/html.yaml}"

if [[ ! -f "${input_file}" ]]; then
  echo "入力ファイルが見つかりません: ${input_file}" >&2
  exit 1
fi

mkdir -p "${output_dir}"
output_dir="$(cd "${output_dir}" && pwd)"
defaults_file="$(cd "$(dirname "${defaults_file}")" && pwd)/$(basename "${defaults_file}")"

base_name="$(basename "${input_file}")"
base_name="${base_name%.*}"
output_path="${output_dir}/${base_name}.html"

# defaults 内の template / css は pandoc/ からの相対パスなので、作業ディレクトリを固定する
cd "${pandoc_root}"
pandoc --defaults "${defaults_file}" "${input_file}" -o "${output_path}"

echo "生成しました: ${output_path}"
