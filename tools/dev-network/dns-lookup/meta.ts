import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'dns-lookup',
  name: 'DNS 查询工具',
  description: 'DNS 查询工具工具',
  category: 'dev-network',
  tags: ['dev-network', '工具'],
  icon: 'mdi:dns',
  i18nKey: 'tools.dns-lookup',
  entry: 'tools/dev-network/dns-lookup/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
