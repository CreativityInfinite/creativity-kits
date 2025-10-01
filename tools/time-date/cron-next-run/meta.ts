import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'cron-next-run',
  name: 'tools.cron-next-run.name',
  description: 'tools.cron-next-run.desc',
  category: 'time-date',
  tags: 'tools.cron-next-run.tags',
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:timer-play',
  entry: 'tools/time-date/cron-next-run/Component.vue'
};
export default meta;
