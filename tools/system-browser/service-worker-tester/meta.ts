import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'service-worker-tester',
  name: 'Service Worker 测试器',
  description: 'Service Worker 测试器工具',
  category: 'system-browser',
  tags: ['system-browser', '工具'],
  icon: 'mdi:worker',
  i18nKey: 'tools.service-worker-tester',
  entry: 'tools/system-browser/service-worker-tester/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
