import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'timestamp-converter',
  name: '时间戳转换器',
  description: '强大的时间戳转换工具，支持Unix时间戳与人类可读时间的双向转换，包含时区转换和批量处理功能',
  category: 'time-date',
  tags: ['时间戳', 'Unix', 'ISO 8601', '时区转换', '日期时间', '批量转换'],
  i18nKey: 'tools.timestamp-converter',
  entry: 'tools/time-date/timestamp-converter/Component.vue',
}
export default meta