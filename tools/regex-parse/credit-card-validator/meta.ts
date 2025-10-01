import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'credit-card-validator',
  name: 'tools.credit-card-validator.name',
  description: 'tools.credit-card-validator.desc',
  category: 'regex-parse',
  tags: 'tools.credit-card-validator.tags',
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:credit-card',
  entry: 'tools/regex-parse/credit-card-validator/Component.vue'
};
export default meta;
