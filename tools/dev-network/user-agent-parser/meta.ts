import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'user-agent-parser',
  name: 'tools.user-agent-parser.name',
  description: 'tools.user-agent-parser.desc',
  category: 'dev-network',
  tags: 'tools.user-agent-parser.tags',
  color: 'linear-gradient(135deg,#64748b,#22d3ee)',
  icon: 'mdi:information-outline',
  entry: 'tools/dev-network/user-agent-parser/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
