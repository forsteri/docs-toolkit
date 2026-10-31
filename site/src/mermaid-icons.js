import mermaid from 'mermaid';

mermaid.registerIconPacks([
  {
    name: 'aws',
    loader: () =>
      import('../assets/aws/2026-q3/aws-iconify.json').then(
        (module) => module.default,
      ),
  },
]);
