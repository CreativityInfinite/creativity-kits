import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'exif-viewer',
  name: 'tools.exif-viewer.name',
  description: 'tools.exif-viewer.desc',
  category: 'image-media',
  tags: 'tools.exif-viewer.tags',
  icon: 'mdi:information',
  entry: 'tools/image-media/exif-viewer/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
