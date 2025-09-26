import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'contrast-checker',
  name: '对比度检查器',
  description: '对比度检查器工具',
  category: 'color-graphics',
  tags: ['color-graphics', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:contrast-circle',
  i18nKey: 'tools.contrast-checker',
  entry: 'tools/color-graphics/contrast-checker/Component.vue',
}
export default meta