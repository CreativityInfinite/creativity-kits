import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'distance-calculator',
  name: '距离计算器',
  description: '基于Haversine公式计算地球表面两点间的精确距离，支持多种单位和方位信息',
  category: 'map-geo',
  tags: ['距离计算', 'Haversine', '地理', '坐标', '方位角'],
  i18nKey: 'tools.distance-calculator',
  entry: 'tools/map-geo/distance-calculator/Component.vue',
}
export default meta