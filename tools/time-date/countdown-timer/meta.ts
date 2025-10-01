import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'countdown-timer',
  name: 'tools.countdown-timer.name',
  description: 'tools.countdown-timer.desc',
  category: 'time-date',
  tags: 'tools.countdown-timer.tags',
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:timer',
  entry: 'tools/time-date/countdown-timer/Component.vue'
};
export default meta;
