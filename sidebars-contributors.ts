/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  contributorsSidebar: [
    {
      type: 'category',
      label: 'Introdução',
      collapsible: true,
      collapsed: false,
      items: ['intro/overview'],
    },
    {
      type: 'category',
      label: 'Arquitetura',
      collapsible: true,
      items: [
        'architecture/system-design',
        'architecture/detailed-components',
        'architecture/fluxos',
        'architecture/tools',
        'architecture/decisoes-arquiteturais'
      ],
    },
    {
        type: 'category',
        label: 'Main Concepts',
        collapsible: true,
        items: [
            'concepts/visao-geral',
            'concepts/task',
            'concepts/agent',
            'concepts/spec-driven',
            'concepts/session',
            'concepts/relacional'
          ],
        },
    {
      type: 'category',
      label: 'Referência de API',
      items: ['api/endpoints',
              'api/communication',
              'api/server-sent-events',
              'api/tratamento-erros'],
    },
    {
      type: 'category',
      label: 'Operações & Ops',
      items: [
        'ops/configuration',
        'ops/observability'
      ],
    },
  ],
};

module.exports = sidebars;