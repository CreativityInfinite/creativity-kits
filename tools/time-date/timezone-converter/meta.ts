import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'timezone-converter',
  name: 'tools.timezone-converter.name',
  description: 'tools.timezone-converter.desc',
  category: 'time-date',
  tags: 'tools.timezone-converter.tags',
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:earth',
  entry: 'tools/time-date/timezone-converter/Component.vue'
};
export default meta;
