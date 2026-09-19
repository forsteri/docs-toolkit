import mermaid from 'mermaid';

mermaid.registerIconPacks([
  {
    name: 'aws',
    loader: () =>
      import('../../diagrams/assets/aws/2026-q3/aws-iconify.json').then(
        (module) => module.default,
      ),
  },
]);
