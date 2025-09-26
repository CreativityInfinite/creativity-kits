import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'markdown-to-html',
  name: 'Markdown 转 HTML',
  description: '将 Markdown 格式文本转换为 HTML 代码，支持实时预览和多种转换选项',
  category: 'text-format',
  tags: ['markdown', 'html', '转换', '预览', '文档'],
  i18nKey: 'tools.markdown-to-html',
  entry: 'tools/text-format/markdown-to-html/Component.vue',
}
export default meta