import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'sitemap-generator',
  name: '网站地图生成器',
  description: '网站地图生成器工具',
  category: 'social-marketing',
  tags: ['social-marketing', '工具'],
  icon: 'mdi:sitemap',
  i18nKey: 'tools.sitemap-generator',
  entry: 'tools/social-marketing/sitemap-generator/Component.vue',
  isNew: true,
  isPopular: false
};
export default meta;
