import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'elevation-profiler',
  name: '海拔剖面图',
  description: '海拔剖面图工具',
  category: 'map-geo',
  tags: ['map-geo', '工具'],
  icon: 'mdi:chart-areaspline',
  i18nKey: 'tools.elevation-profiler',
  entry: 'tools/map-geo/elevation-profiler/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta