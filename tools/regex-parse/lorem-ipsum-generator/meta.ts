import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'lorem-ipsum-generator',
  name: 'Lorem Ipsum 生成器',
  description: 'Lorem Ipsum 生成器工具',
  category: 'regex-parse',
  tags: ['regex-parse', '工具'],
  color: 'linear-gradient(135deg,#7c3aed,#22d3ee)',
  icon: 'mdi:text',
  i18nKey: 'tools.lorem-ipsum-generator',
  entry: 'tools/regex-parse/lorem-ipsum-generator/Component.vue'
};
export default meta;
