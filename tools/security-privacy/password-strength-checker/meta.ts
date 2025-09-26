import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'password-strength-checker',
  name: '密码强度检查器',
  description: '全面分析密码安全性，提供强度评分、破解时间估算和改进建议',
  category: 'security-privacy',
  tags: ['密码', '安全', '强度检查', '密码生成', '安全评估'],
  i18nKey: 'tools.password-strength-checker',
  entry: 'tools/security-privacy/password-strength-checker/Component.vue',
}
export default meta