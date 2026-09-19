#!/usr/bin/env bash
# theme.css を <style> として埋め込み、CSS を別途配布しなくても開ける単体 HTML を書き出す。
# 使い方: scripts/bundle.sh <input.html> [output-dir]
#   output-dir 省略時は ../output/one-pager/
# 画像（img の相対パス）は埋め込まない。配布先でも同じ相対位置に置くか、事前に inline SVG へ置き換える。
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "使い方: $0 <input.html> [output-dir]" >&2
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
one_pager_root="$(cd "${script_dir}/.." && pwd)"
theme_path="${one_pager_root}/theme.css"

input_file="$(cd "$(dirname "$1")" && pwd)/$(basename "$1")"
output_dir="${2:-${one_pager_root}/../output/one-pager}"

if [[ ! -f "${input_file}" ]]; then
  echo "入力ファイルが見つかりません: ${input_file}" >&2
  exit 1
fi

mkdir -p "${output_dir}"
output_dir="$(cd "${output_dir}" && pwd)"
output_path="${output_dir}/$(basename "${input_file}")"

replaced=0
{
  while IFS= read -r line || [[ -n "${line}" ]]; do
    if [[ "${line}" =~ \<link[[:space:]]+rel=\"stylesheet\"[[:space:]]+href=\"[^\"]*theme\.css\"\> ]]; then
      echo "  <style>"
      cat "${theme_path}"
      echo "  </style>"
      replaced=1
    else
      printf '%s\n' "${line}"
    fi
  done < "${input_file}"
} > "${output_path}"

if [[ "${replaced}" -eq 0 ]]; then
  rm -f "${output_path}"
  echo "theme.css への link が見つかりません: ${input_file}" >&2
  exit 1
fi

echo "生成しました: ${output_path}"
