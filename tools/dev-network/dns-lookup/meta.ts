import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'dns-lookup',
  name: 'tools.dns-lookup.name',
  description: 'tools.dns-lookup.desc',
  category: 'dev-network',
  tags: 'tools.dns-lookup.tags',
  icon: 'mdi:dns',
  entry: 'tools/dev-network/dns-lookup/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
