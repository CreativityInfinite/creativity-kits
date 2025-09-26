import type { ToolMeta } from '~/types/tool'
const meta: ToolMeta = {
  id: 'password-generator',
  name: '密码生成器',
  description: '可配置规则',
  category: 'security-privacy',
  tags: ['security'],
  i18nKey: 'tools.password-generator',
  color: 'linear-gradient(135deg,#22d3ee,#ec4899)',
  icon: 'tabler:shield',
  entry: 'tools/security-privacy/password-generator/Component.vue'
}
export default meta
