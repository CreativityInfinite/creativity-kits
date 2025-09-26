import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'html-to-markdown',
  name: 'HTML 转 Markdown',
  description: '强大的HTML到Markdown转换工具，支持标题、列表、表格、代码块等元素转换，提供实时预览和转换分析功能',
  category: 'text-format',
  tags: ['HTML', 'Markdown', '转换', '文档', '格式化', '内容迁移'],
  i18nKey: 'tools.html-to-markdown',
  entry: 'tools/text-format/html-to-markdown/Component.vue',
}
export default meta