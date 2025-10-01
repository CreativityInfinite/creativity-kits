import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'markdown-editor',
  name: 'tools.markdown-editor.name',
  description: 'tools.markdown-editor.desc',
  category: 'productivity',
  tags: 'tools.markdown-editor.tags',
  icon: 'mdi:language-markdown-outline',
  entry: 'tools/productivity/markdown-editor/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
