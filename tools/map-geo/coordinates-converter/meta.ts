import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'coordinates-converter',
  name: '坐标格式转换',
  description: '专业的地理坐标格式转换工具，支持十进制度数、度分秒、度分等多种格式互转',
  category: 'map-geo',
  tags: ['坐标转换', '地理', 'GPS', 'DMS', '经纬度'],
  i18nKey: 'tools.coordinates-converter',
  entry: 'tools/map-geo/coordinates-converter/Component.vue'
};
export default meta;
