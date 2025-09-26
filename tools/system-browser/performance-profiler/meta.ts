import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'performance-profiler',
  name: '性能分析器',
  description: '性能分析器工具',
  category: 'system-browser',
  tags: ['system-browser', '工具'],
  icon: 'mdi:speedometer',
  i18nKey: 'tools.performance-profiler',
  entry: 'tools/system-browser/performance-profiler/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta