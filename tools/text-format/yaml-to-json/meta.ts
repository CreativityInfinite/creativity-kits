import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'yaml-to-json',
  name: 'YAML ⇄ JSON 转换工具',
  description: '强大的YAML与JSON互转工具，支持自动格式检测、语法验证、格式化选项和详细的数据分析，保持完整的数据结构',
  category: 'text-format',
  tags: ['YAML', 'JSON', '格式转换', '数据交换', '配置文件', '结构化数据'],
  i18nKey: 'tools.yaml-to-json',
  entry: 'tools/text-format/yaml-to-json/Component.vue',
}
export default meta