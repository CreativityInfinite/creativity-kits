import type { ToolMeta } from '~/types/tool'
const meta: ToolMeta = {
  id: 'pomodoro-timer',
  name: '番茄钟',
  description: '专注计时',
  category: 'productivity',
  tags: ['timer'],
  i18nKey: 'tools.pomodoro-timer',
  color: 'linear-gradient(135deg,#f59e0b,#22d3ee)',
  icon: 'tabler:clock',
  entry: 'tools/productivity/pomodoro-timer/Component.vue'
}
export default meta
