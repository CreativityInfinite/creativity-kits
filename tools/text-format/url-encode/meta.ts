import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'url-encode',
  name: 'URL 编码',
  description: '全面的 URL 编码工具，支持多种编码类型（组件、URI、表单、自定义），提供 URL 解析、验证和参数分析功能',
  category: 'text-format',
  tags: ['URL编码', '百分号编码', 'URI', '表单编码', 'URL解析', '参数处理'],
  i18nKey: 'tools.url-encode',
  entry: 'tools/text-format/url-encode/Component.vue',
}
export default meta