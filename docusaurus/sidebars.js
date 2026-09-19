/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    'overview',
    {
      type: 'category',
      label: '利用ガイド',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'guide/index',
      },
      items: [
        'guide/marp',
        'guide/slidev',
        'guide/pandoc',
        'guide/one-pager',
        'guide/diagrams',
        'guide/docusaurus',
      ],
    },
    {
      type: 'category',
      label: '執筆規約',
      collapsed: false,
      items: [
        'conventions/document-policy',
        'conventions/writing-style',
      ],
    },
    {
      type: 'category',
      label: '文書テンプレート',
      collapsed: false,
      link: {
        type: 'generated-index',
        title: '文書テンプレート',
        description: '用途に合うテンプレートをコピーし、不要な章を削除して使います。',
        slug: '/document-templates',
      },
      items: [
        'document-templates/design-document',
        'document-templates/procedure',
        'document-templates/decision-record',
        'document-templates/runbook',
      ],
    },
  ],
};

export default sidebars;
