import React from 'react';
import clsx from 'clsx';
import DefaultAdmonitionTypes from '@theme-original/Admonition/Types';
import AdmonitionLayout from '@theme/Admonition/Layout';

// 執筆規約（conventions/writing-style.md）の「事実・判断・仮定・未決事項を
// 区別する」に対応する注記型。アイコンは漢字一字の印章風スタンプ。
function KanjiIcon({children}) {
  return <span className="admonition-kanji">{children}</span>;
}

function createAdmonitionType({infimaClassName, defaultTitle, kanji}) {
  return function CustomAdmonitionType(props) {
    return (
      <AdmonitionLayout
        icon={<KanjiIcon>{kanji}</KanjiIcon>}
        title={defaultTitle}
        {...props}
        className={clsx(infimaClassName, props.className)}>
        {props.children}
      </AdmonitionLayout>
    );
  };
}

const AdmonitionTypes = {
  ...DefaultAdmonitionTypes,
  decision: createAdmonitionType({
    infimaClassName: 'alert alert--info',
    defaultTitle: '決定',
    kanji: '決',
  }),
  pending: createAdmonitionType({
    infimaClassName: 'alert alert--warning',
    defaultTitle: '未決',
    kanji: '未',
  }),
  assumption: createAdmonitionType({
    infimaClassName: 'alert alert--secondary',
    defaultTitle: '前提',
    kanji: '前',
  }),
};

export default AdmonitionTypes;
