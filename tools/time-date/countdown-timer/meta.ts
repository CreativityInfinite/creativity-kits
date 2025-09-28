import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'countdown-timer',
  name: '倒计时器',
  description: '倒计时器工具',
  category: 'time-date',
  tags: ['time-date', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:timer',
  i18nKey: 'tools.countdown-timer',
  entry: 'tools/time-date/countdown-timer/Component.vue'
};
export default meta;
