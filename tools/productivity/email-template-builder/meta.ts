import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'email-template-builder',
  name: '邮件模板构建器',
  description: '邮件模板构建器工具',
  category: 'productivity',
  tags: ['productivity', '工具'],
  icon: 'mdi:email-edit',
  i18nKey: 'tools.email-template-builder',
  entry: 'tools/productivity/email-template-builder/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta