import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'glob-tester',
  name: 'Glob 模式测试器',
  description: '强大的 Glob 模式测试工具，支持文件路径匹配测试、模式解释、正则转换和常用模式库，适用于构建工具和文件过滤场景',
  category: 'regex-parse',
  tags: ['Glob模式', '文件匹配', '路径过滤', '通配符', '构建工具', '文件系统'],
  color: '#10b981',
  icon: 'tabler:file-search',
  i18nKey: 'tools.glob-tester',
  entry: 'tools/regex-parse/glob-tester/Component.vue',
}
export default meta