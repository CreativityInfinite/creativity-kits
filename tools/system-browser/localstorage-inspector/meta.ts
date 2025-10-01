import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'localstorage-inspector',
  name: 'tools.localstorage-inspector.name',
  description: 'tools.localstorage-inspector.desc',
  category: 'system-browser',
  tags: 'tools.localstorage-inspector.tags',
  icon: 'mdi:database',
  entry: 'tools/system-browser/localstorage-inspector/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
