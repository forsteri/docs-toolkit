import MDXComponents from '@theme-original/MDXComponents';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import DocMeta from '@site/src/components/DocMeta';

// MarkdownファイルへのimportなしでMDXコンポーネントを使えるようにする。
// 登録した部品の見本は docs/style-check.md を参照。
export default {
  ...MDXComponents,
  Tabs,
  TabItem,
  DocMeta,
};
