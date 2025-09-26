import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'pinyin-converter',
  name: '拼音转换器',
  description: '拼音转换器工具',
  category: 'education-language',
  tags: ['education-language', '工具'],
  icon: 'mdi:translate',
  i18nKey: 'tools.pinyin-converter',
  entry: 'tools/education-language/pinyin-converter/Component.vue',
  isNew: true,
  isPopular: false,
}
export default meta