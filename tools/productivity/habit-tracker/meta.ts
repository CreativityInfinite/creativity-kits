import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'habit-tracker',
  name: 'tools.habit-tracker.name',
  description: 'tools.habit-tracker.desc',
  category: 'productivity',
  tags: 'tools.habit-tracker.tags',
  icon: 'mdi:check-circle',
  entry: 'tools/productivity/habit-tracker/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
