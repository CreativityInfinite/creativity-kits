import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'cron-next-run',
  name: 'Cron 下次执行时间',
  description: 'Cron 下次执行时间工具',
  category: 'time-date',
  tags: ['time-date', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:timer-play',
  i18nKey: 'tools.cron-next-run',
  entry: 'tools/time-date/cron-next-run/Component.vue',
}
export default meta