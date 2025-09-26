import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'pomodoro-timer',
  name: 'pomodoro-timer',
  description: '专注工作的番茄工作法计时器，支持工作/休息周期管理和统计',
  category: 'productivity',
  tags: ['时间管理', '专注', '效率', '番茄工作法', '计时器'],
  i18nKey: 'tools.pomodoro-timer',
  entry: 'tools/productivity/pomodoro-timer/Component.vue',
}
export default meta