import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'quiz-maker',
  name: '测验制作器',
  description: '测验制作器工具',
  category: 'education-language',
  tags: ['education-language', '工具'],
  icon: 'mdi:help-circle',
  i18nKey: 'tools.quiz-maker',
  entry: 'tools/education-language/quiz-maker/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta