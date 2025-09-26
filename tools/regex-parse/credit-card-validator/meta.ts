import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'credit-card-validator',
  name: '信用卡号验证器',
  description: '信用卡号验证器工具',
  category: 'regex-parse',
  tags: ['regex-parse', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:credit-card',
  i18nKey: 'tools.credit-card-validator',
  entry: 'tools/regex-parse/credit-card-validator/Component.vue',
}
export default meta