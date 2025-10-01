import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'ics-calendar-generator',
  name: 'tools.ics-calendar-generator.name',
  description: 'tools.ics-calendar-generator.desc',
  category: 'time-date',
  tags: 'tools.ics-calendar-generator.tags',
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:calendar-export',
  entry: 'tools/time-date/ics-calendar-generator/Component.vue'
};
export default meta;
