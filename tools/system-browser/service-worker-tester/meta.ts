import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'service-worker-tester',
  name: 'tools.service-worker-tester.name',
  description: 'tools.service-worker-tester.desc',
  category: 'system-browser',
  tags: 'tools.service-worker-tester.tags',
  icon: 'mdi:worker',
  entry: 'tools/system-browser/service-worker-tester/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
