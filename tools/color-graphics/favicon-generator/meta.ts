import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'favicon-generator',
  name: 'Favicon 生成器',
  description: 'Favicon 生成器工具',
  category: 'color-graphics',
  tags: ['color-graphics', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:web',
  i18nKey: 'tools.favicon-generator',
  entry: 'tools/color-graphics/favicon-generator/Component.vue',
}
export default meta