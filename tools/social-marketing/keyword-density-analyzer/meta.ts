import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'keyword-density-analyzer',
  name: '关键词密度分析器',
  description: '关键词密度分析器工具',
  category: 'social-marketing',
  tags: ['social-marketing', '工具'],
  icon: 'mdi:text-search',
  i18nKey: 'tools.keyword-density-analyzer',
  entry: 'tools/social-marketing/keyword-density-analyzer/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta