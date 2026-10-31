import React from 'react';

const STATUS_CLASS = {
  draft: 'doc-meta-badge--draft',
  review: 'doc-meta-badge--review',
  proposed: 'doc-meta-badge--review',
  approved: 'doc-meta-badge--approved',
  deprecated: 'doc-meta-badge--deprecated',
  retired: 'doc-meta-badge--deprecated',
};

function StatusBadge({status}) {
  const className =
    STATUS_CLASS[String(status).toLowerCase()] ?? 'doc-meta-badge--draft';
  return <span className={`doc-meta-badge ${className}`}>{status}</span>;
}

/**
 * 文書メタ情報の表。テンプレート先頭の手書き表の代替。
 * 共通項目は名前付きprops、テンプレート固有の項目はextraへ渡す。
 *
 * <DocMeta id="DESIGN-XXX-001" status="Draft" version="0.1.0"
 *          updated="YYYY-MM-DD" owner="" classification="Internal"
 *          extra={{'関連文書': ''}} />
 */
export default function DocMeta({
  id,
  status,
  version,
  updated,
  owner,
  classification,
  extra,
}) {
  const rows = [];
  if (id !== undefined) {
    rows.push(['文書ID', <code>{id}</code>]);
  }
  if (status !== undefined) {
    rows.push(['ステータス', <StatusBadge status={status} />]);
  }
  if (version !== undefined) {
    rows.push(['バージョン', <code>{version}</code>]);
  }
  if (updated !== undefined) {
    rows.push(['最終更新', <code>{updated}</code>]);
  }
  if (owner !== undefined) {
    rows.push(['オーナー', owner]);
  }
  if (classification !== undefined) {
    rows.push(['分類', <code>{classification}</code>]);
  }
  for (const [label, value] of Object.entries(extra ?? {})) {
    rows.push([label, value]);
  }
  return (
    <table className="doc-meta">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <th scope="row">{label}</th>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
