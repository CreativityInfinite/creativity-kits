import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'iban-validator',
  name: 'tools.iban-validator.name',
  description: 'tools.iban-validator.desc',
  category: 'regex-parse',
  tags: 'tools.iban-validator.tags',
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:bank',
  entry: 'tools/regex-parse/iban-validator/Component.vue'
};
export default meta;
