import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'image-metadata-sanitizer',
  name: 'tools.image-metadata-sanitizer.name',
  description: 'tools.image-metadata-sanitizer.desc',
  category: 'security-privacy',
  tags: 'tools.image-metadata-sanitizer.tags',
  icon: 'mdi:image-remove',
  entry: 'tools/security-privacy/image-metadata-sanitizer/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
