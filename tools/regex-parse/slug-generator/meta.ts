import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'slug-generator',
  name: 'Slug 生成器',
  description: 'Slug 生成器工具',
  category: 'regex-parse',
  tags: ['regex-parse', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:link',
  i18nKey: 'tools.slug-generator',
  entry: 'tools/regex-parse/slug-generator/Component.vue',
}
export default meta