import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'websocket-client',
  name: 'tools.websocket-client.name',
  description: 'tools.websocket-client.desc',
  category: 'dev-network',
  tags: 'tools.websocket-client.tags',
  color: 'linear-gradient(135deg,#22c55e,#14b8a6)',
  icon: 'tabler:cloud-network',
  entry: 'tools/dev-network/websocket-client/Component.vue'
};
export default meta;
