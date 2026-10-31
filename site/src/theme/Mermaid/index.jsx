import React, {useEffect, useMemo, useRef, useState} from 'react';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import {useColorMode} from '@docusaurus/theme-common';
import {ErrorBoundaryErrorMessageFallback} from '@docusaurus/theme-common';
import {
  MermaidContainerClassName,
  useMermaidRenderResult,
} from '@docusaurus/theme-mermaid/client';
import neutralMermaid from '../../../assets/mermaid/neutral.json';

function MermaidRenderResult({renderResult}) {
  const ref = useRef(null);

  useEffect(() => {
    renderResult.bindFunctions?.(ref.current);
  }, [renderResult]);

  return (
    <div
      ref={ref}
      className={MermaidContainerClassName}
      dangerouslySetInnerHTML={{__html: renderResult.svg}}
    />
  );
}

function MermaidRenderer({value}) {
  const {colorMode} = useColorMode();
  const config = useMemo(() => {
    if (colorMode === 'dark') {
      return {
        startOnLoad: false,
        theme: 'dark',
        flowchart: neutralMermaid.flowchart,
      };
    }

    return {startOnLoad: false, ...neutralMermaid};
  }, [colorMode]);
  const renderResult = useMermaidRenderResult({text: value, config});

  return renderResult ? <MermaidRenderResult renderResult={renderResult} /> : null;
}

// Mermaid はノードの幅を描画時の文字幅で決めるので、Webフォントの読み込み前に描くとラベルが切れる。
function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    (document.fonts?.ready ?? Promise.resolve()).then(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);
  return ready;
}

export default function Mermaid(props) {
  const fontsReady = useFontsReady();
  return (
    <ErrorBoundary
      fallback={(params) => <ErrorBoundaryErrorMessageFallback {...params} />}
    >
      {fontsReady ? <MermaidRenderer {...props} /> : null}
    </ErrorBoundary>
  );
}
