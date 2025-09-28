import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'iban-validator',
  name: 'IBAN 验证器',
  description: 'IBAN 验证器工具',
  category: 'regex-parse',
  tags: ['regex-parse', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:bank',
  i18nKey: 'tools.iban-validator',
  entry: 'tools/regex-parse/iban-validator/Component.vue'
};
export default meta;
