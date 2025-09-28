import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'user-agent-parser',
  name: 'User Agent 解析器',
  description: 'User Agent 解析器工具',
  category: 'dev-network',
  tags: ['dev-network', '工具'],
  color: 'linear-gradient(135deg,#64748b,#22d3ee)',
  icon: 'mdi:information-outline',
  i18nKey: 'tools.user-agent-parser',
  entry: 'tools/dev-network/user-agent-parser/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
