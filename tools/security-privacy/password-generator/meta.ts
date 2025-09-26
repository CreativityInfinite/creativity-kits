import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'password-generator',
  name: '密码生成器',
  description: '安全的密码生成工具，支持多种字符类型、强度分析、预设模板和安全建议，帮助创建强密码',
  category: 'security-privacy',
  tags: ['密码', '安全', '生成器', '加密', '强度分析', '隐私保护'],
  i18nKey: 'tools.password-generator',
  entry: 'tools/security-privacy/password-generator/Component.vue',
}
export default meta