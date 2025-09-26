import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'cron-expression-validator',
  name: 'Cron 表达式验证器',
  description: '验证和解析Cron表达式，预览执行时间和频率统计',
  category: 'time-date',
  tags: ['Cron', '定时任务', '表达式验证', '时间计划', '调度'],
  i18nKey: 'tools.cron-expression-validator',
  entry: 'tools/time-date/cron-expression-validator/Component.vue',
}
export default meta