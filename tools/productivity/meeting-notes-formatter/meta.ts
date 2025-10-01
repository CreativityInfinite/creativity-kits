import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'meeting-notes-formatter',
  name: 'tools.meeting-notes-formatter.name',
  description: 'tools.meeting-notes-formatter.desc',
  category: 'productivity',
  tags: 'tools.meeting-notes-formatter.tags',
  icon: 'mdi:note-text-outline',
  entry: 'tools/productivity/meeting-notes-formatter/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
