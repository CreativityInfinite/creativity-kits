import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'palette-generator',
  name: '调色板生成器',
  description: '调色板生成器工具',
  category: 'color-graphics',
  tags: ['color-graphics', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:palette-advanced',
  i18nKey: 'tools.palette-generator',
  entry: 'tools/color-graphics/palette-generator/Component.vue',
}
export default meta