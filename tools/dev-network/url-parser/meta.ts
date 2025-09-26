import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'url-parser',
  name: 'URL解析器',
  description: 'URL解析和构建工具，支持组件分解、查询参数管理、安全分析和变体生成',
  category: 'dev-network',
  tags: ['URL', '解析', '构建', '查询参数', '网络', '开发工具'],
  color: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)',
  icon: 'tabler:link',
  i18nKey: 'tools.url-parser',
  entry: 'tools/dev-network/url-parser/Component.vue',
}
export default meta