import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'macaddress-vendor-lookup',
  name: 'MAC 地址厂商查询',
  description: 'MAC 地址厂商查询工具',
  category: 'dev-network',
  tags: ['dev-network', '工具'],
  icon: 'mdi:ethernet',
  i18nKey: 'tools.macaddress-vendor-lookup',
  entry: 'tools/dev-network/macaddress-vendor-lookup/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta