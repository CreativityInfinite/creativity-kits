import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'text-readability-analyzer',
  name: '文本可读性分析器',
  description: '文本可读性分析器工具',
  category: 'education-language',
  tags: ['education-language', '工具'],
  icon: 'mdi:text-recognition',
  i18nKey: 'tools.text-readability-analyzer',
  entry: 'tools/education-language/text-readability-analyzer/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta