import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'image-compressor',
  name: 'tools.image-compressor.name',
  description: 'tools.image-compressor.desc',
  category: 'image-media',
  tags: 'tools.image-compressor.tags',
  icon: 'mdi:compress',
  entry: 'tools/image-media/image-compressor/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
