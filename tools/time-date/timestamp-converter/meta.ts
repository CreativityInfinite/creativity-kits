import type { ToolMeta } from '~/types/tool'
const meta: ToolMeta = {
  id: 'timestamp-converter',
  name: '时间戳转换',
  description: 'Unix/ISO 互转',
  category: 'time-date',
  tags: ['time'],
  i18nKey: 'tools.timestamp-converter',
  color: 'linear-gradient(135deg,#84cc16,#7c3aed)',
  icon: 'tabler:calendar',
  entry: 'tools/time-date/timestamp-converter/Component.vue'
}
export default meta
