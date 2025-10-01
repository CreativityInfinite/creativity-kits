import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'map-snapshot-generator',
  name: 'tools.map-snapshot-generator.name',
  description: 'tools.map-snapshot-generator.desc',
  category: 'map-geo',
  tags: 'tools.map-snapshot-generator.tags',
  icon: 'mdi:camera-image',
  entry: 'tools/map-geo/map-snapshot-generator/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
