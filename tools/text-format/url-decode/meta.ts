import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'url-decode',
  name: 'URL 解码',
  description: '智能 URL 解码工具，支持多种解码类型和多重解码，提供 URL 分析、参数解析和解码步骤追踪功能',
  category: 'text-format',
  tags: ['URL解码', '百分号解码', 'URI解码', '表单解码', 'URL分析', '参数解析'],
  i18nKey: 'tools.url-decode',
  entry: 'tools/text-format/url-decode/Component.vue',
}
export default meta