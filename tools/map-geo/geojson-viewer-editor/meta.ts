import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'geojson-viewer-editor',
  name: 'GeoJSON 查看编辑器',
  description: 'GeoJSON 查看编辑器工具',
  category: 'map-geo',
  tags: ['map-geo', '工具'],
  icon: 'mdi:map-marker-path',
  i18nKey: 'tools.geojson-viewer-editor',
  entry: 'tools/map-geo/geojson-viewer-editor/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
