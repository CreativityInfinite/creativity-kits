import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'color-blindness-simulator',
  name: '色盲模拟器',
  description: '色盲模拟器工具',
  category: 'color-graphics',
  tags: ['color-graphics', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:eye-off',
  i18nKey: 'tools.color-blindness-simulator',
  entry: 'tools/color-graphics/color-blindness-simulator/Component.vue',
}
export default meta