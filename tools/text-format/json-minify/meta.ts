import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'json-minify',
  name: 'JSON 压缩工具',
  description: '高效的JSON压缩和优化工具，支持多级压缩、空值清理、大小对比分析，专为减少文件体积和提升传输效率而设计',
  category: 'text-format',
  tags: ['JSON', '压缩', '优化', '文件大小', '传输效率', '数据处理'],
  i18nKey: 'tools.json-minify',
  entry: 'tools/text-format/json-minify/Component.vue',
}
export default meta