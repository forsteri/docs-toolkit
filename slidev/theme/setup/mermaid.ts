import {defineMermaidSetup} from '@slidev/types';
import mermaid from 'mermaid/dist/mermaid.esm.mjs';
import forsteriMermaid from '../../../diagrams/themes/forsteri.json';

let iconsRegistered = false;

export default defineMermaidSetup(() => {
  if (!iconsRegistered) {
    mermaid.registerIconPacks([
      {
        name: 'aws',
        loader: () =>
          import('../../../diagrams/assets/aws/2026-q3/aws-iconify.json').then(
            (module) => module.default,
          ),
      },
    ]);
    iconsRegistered = true;
  }

  return forsteriMermaid;
});
