import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'base64-encode',
  name: 'Base64 编码',
  description: '强大的Base64处理工具，支持文本、文件和URL的编码解码，提供预览、验证和多种格式选项',
  category: 'text-format',
  tags: ['Base64', '编码', '解码', '文件处理', 'Data URL', '格式转换'],
  color: 'linear-gradient(135deg,#10b981,#3b82f6)',
  icon: 'mdi:code-braces',
  i18nKey: 'tools.base64-encode',
  entry: 'tools/text-format/base64-encode/Component.vue',
}
export default meta