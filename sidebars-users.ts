/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  usersSidebar: [
    {
      type: 'category',
      label: 'Guia de Usuário',
       collapsible: true,
       collapsed: false,
      items: [
        'getting-started',
        'installation',
        'cli-commands',
        'faq',
      ],
    },
  ],
};

module.exports = sidebars;