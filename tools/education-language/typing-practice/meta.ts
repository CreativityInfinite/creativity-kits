import type { ToolMeta } from '~/types/tool'
const meta: ToolMeta = {
  id: 'typing-practice',
  name: '打字练习',
  description: '自定义段落',
  category: 'education-language',
  tags: ['typing', 'practice'],
  i18nKey: 'tools.typing-practice',
  color: 'linear-gradient(135deg,#22d3ee,#f59e0b)',
  icon: 'tabler:language',
  entry: 'tools/education-language/typing-practice/Component.vue'
}
export default meta
