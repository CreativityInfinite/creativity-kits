import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'color-picker',
  name: '颜色选择器',
  description: '专业的颜色选择和转换工具，支持多种颜色格式、调色板生成、可访问性检查和颜色分析功能',
  category: 'color-graphics',
  tags: ['颜色', '调色板', '设计', 'CSS', 'HEX', 'RGB', 'HSL', 'CMYK', '可访问性'],
  color: 'linear-gradient(135deg,#f59e0b,#10b981)',
  icon: 'tabler:color-picker',
  i18nKey: 'tools.color-picker',
  entry: 'tools/color-graphics/color-picker/Component.vue',
}
export default meta