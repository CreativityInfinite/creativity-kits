import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'timezone-converter',
  name: '时区转换器',
  description: '时区转换器工具',
  category: 'time-date',
  tags: ['time-date', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:earth',
  i18nKey: 'tools.timezone-converter',
  entry: 'tools/time-date/timezone-converter/Component.vue'
};
export default meta;
