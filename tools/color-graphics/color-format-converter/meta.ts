import type { ToolMeta } from '~/types/tool'
const meta: ToolMeta = {
  id: 'color-format-converter',
  name: '颜色格式转换',
  description: 'HEX/RGB 互转',
  category: 'color-graphics',
  tags: ['color'],
  i18nKey: 'tools.color-format-converter',
  color: 'linear-gradient(135deg,#f59e0b,#7c3aed)',
  icon: 'tabler:palette',
  entry: 'tools/color-graphics/color-format-converter/Component.vue'
}
export default meta
