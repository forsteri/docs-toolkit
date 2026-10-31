/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docsSidebar: [
    'overview',
    'explaining',
    'changes',
    'repos',
    {
      type: 'category',
      label: '形式ごとの使い方',
      collapsed: false,
      link: {
        type: 'doc',
        id: 'guide/index',
      },
      items: [
        'guide/one-pager',
        'guide/docusaurus',
        'guide/marp',
        'guide/slidev',
        'guide/pandoc',
        'guide/diagrams',
      ],
    },
    'importing',
    'brand',
    'roadmap',
    {
      type: 'category',
      label: '執筆規約',
      collapsed: true,
      items: [
        'conventions/document-policy',
        'conventions/writing-style',
      ],
    },
  ],
};

export default sidebars;
