import type { ToolMeta } from '~/types/tool'
const meta: ToolMeta = {
  id: 'regex-tester',
  name: '正则测试',
  description: '匹配并高亮分组',
  category: 'regex-parse',
  tags: ['regex', 'parse'],
  i18nKey: 'tools.regex-tester',
  color: 'linear-gradient(135deg,#22d3ee,#7c3aed)',
  icon: 'tabler:regex',
  entry: 'tools/regex-parse/regex-tester/Component.vue'
}
export default meta
