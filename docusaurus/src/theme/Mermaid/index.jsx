import React, {useEffect, useMemo, useRef} from 'react';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import {useColorMode} from '@docusaurus/theme-common';
import {ErrorBoundaryErrorMessageFallback} from '@docusaurus/theme-common';
import {
  MermaidContainerClassName,
  useMermaidRenderResult,
} from '@docusaurus/theme-mermaid/client';
import neutralMermaid from '../../../../diagrams/themes/neutral.json';

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

export default function Mermaid(props) {
  return (
    <ErrorBoundary
      fallback={(params) => <ErrorBoundaryErrorMessageFallback {...params} />}
    >
      <MermaidRenderer {...props} />
    </ErrorBoundary>
  );
}
