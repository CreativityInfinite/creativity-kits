import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'typing-practice',
  name: 'typing-practice',
  description: '多语言打字练习工具，支持英文、中文、代码和数字练习，实时统计速度和准确率',
  category: 'education-language',
  tags: ['打字', '练习', '速度', '准确率', 'WPM', '键盘'],
  i18nKey: 'tools.typing-practice',
  entry: 'tools/education-language/typing-practice/Component.vue',
}
export default meta