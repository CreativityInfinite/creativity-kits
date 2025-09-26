import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'map-snapshot-generator',
  name: '地图快照生成器',
  description: '地图快照生成器工具',
  category: 'map-geo',
  tags: ['map-geo', '工具'],
  icon: 'mdi:camera-image',
  i18nKey: 'tools.map-snapshot-generator',
  entry: 'tools/map-geo/map-snapshot-generator/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta