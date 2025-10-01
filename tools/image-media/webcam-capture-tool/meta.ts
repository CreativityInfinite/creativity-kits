import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'webcam-capture-tool',
  name: 'tools.webcam-capture-tool.name',
  description: 'tools.webcam-capture-tool.desc',
  category: 'image-media',
  tags: 'tools.webcam-capture-tool.tags',
  icon: 'mdi:camera',
  entry: 'tools/image-media/webcam-capture-tool/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
