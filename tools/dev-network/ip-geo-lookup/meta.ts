import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'ip-geo-lookup',
  name: 'IP 地理位置查询',
  description: 'IP 地理位置查询工具',
  category: 'dev-network',
  tags: ['dev-network', '工具'],
  icon: 'mdi:map-marker',
  i18nKey: 'tools.ip-geo-lookup',
  entry: 'tools/dev-network/ip-geo-lookup/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
