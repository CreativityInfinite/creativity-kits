import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'json-schema-validator',
  name: 'JSON Schema 验证器',
  description: 'JSON Schema 验证器工具',
  category: 'data-file',
  tags: ['data-file', '工具'],
  icon: 'mdi:check-circle',
  i18nKey: 'tools.json-schema-validator',
  entry: 'tools/data-file/json-schema-validator/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta