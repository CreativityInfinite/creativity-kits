import type { ToolMeta } from '~/types/tool'
const meta: ToolMeta = {
  id: 'distance-calculator',
  name: '距离计算',
  description: 'Haversine 球面距离',
  category: 'map-geo',
  tags: ['geo', 'distance'],
  i18nKey: 'tools.distance-calculator',
  color: 'linear-gradient(135deg,#84cc16,#22d3ee)',
  icon: 'tabler:map',
  entry: 'tools/map-geo/distance-calculator/Component.vue'
}
export default meta
