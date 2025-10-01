import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'currency-converter',
  name: 'tools.currency-converter.name',
  description: 'tools.currency-converter.desc',
  category: 'math-unit',
  tags: 'tools.currency-converter.tags',
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:currency-usd',
  entry: 'tools/math-unit/currency-converter/Component.vue'
};
export default meta;
