import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'http-requester',
  name: 'tools.http-requester.name',
  description: 'tools.http-requester.desc',
  category: 'dev-network',
  tags: 'tools.http-requester.tags',
  color: 'linear-gradient(135deg,#3b82f6,#22c55e)',
  icon: 'tabler:http-get',
  entry: 'tools/dev-network/http-requester/Component.vue'
};
export default meta;
