import type { ToolMeta } from '~/types/tool'
const meta: ToolMeta = {
  id: 'json-pretty',
  name: 'JSON 美化',
  description: '格式化/缩进',
  category: 'data-file',
  tags: ['json', 'format'],
  i18nKey: 'tools.json-pretty',
  color: 'linear-gradient(135deg,#7c3aed,#84cc16)',
  icon: 'tabler:braces',
  entry: 'tools/data-file/json-pretty/Component.vue'
}
export default meta
