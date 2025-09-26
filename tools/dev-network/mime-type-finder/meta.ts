import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'mime-type-finder',
  name: 'MIME 类型查询',
  description: 'MIME 类型查询工具',
  category: 'dev-network',
  tags: ['dev-network', '工具'],
  icon: 'mdi:file-question',
  i18nKey: 'tools.mime-type-finder',
  entry: 'tools/dev-network/mime-type-finder/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta