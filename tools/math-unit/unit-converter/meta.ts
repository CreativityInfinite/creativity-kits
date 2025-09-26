import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'unit-converter',
  name: '单位转换器',
  description: '全面的单位转换工具，支持长度、重量、温度、面积、体积、速度等多种单位类型的精确转换',
  category: 'math-unit',
  tags: ['单位转换', '长度', '重量', '温度', '面积', '体积', '速度'],
  i18nKey: 'tools.unit-converter',
  entry: 'tools/math-unit/unit-converter/Component.vue',
}
export default meta