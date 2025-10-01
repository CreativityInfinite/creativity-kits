import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'image-resizer',
  name: 'tools.image-resizer.name',
  description: 'tools.image-resizer.desc',
  category: 'image-media',
  tags: 'tools.image-resizer.tags',
  color: 'linear-gradient(135deg,#ec4899,#7c3aed)',
  icon: 'tabler:photo',
  entry: 'tools/image-media/image-resizer/Component.vue'
};
export default meta;
