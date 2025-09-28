import type { ToolMeta } from '~/types/tool';

const meta: ToolMeta = {
  id: 'phonetic-transcriber',
  name: '音标转换器',
  description: '将文本转换为国际音标(IPA)或拼音，支持英语和中文，提供发音指导和批量处理功能',
  category: 'education-language',
  tags: ['音标', '发音', '语言学习', '批量处理'],
  icon: '🔤',
  i18nKey: 'tools.phonetic-transcriber',
  entry: 'tools/education-language/phonetic-transcriber/Component.vue'
};
export default meta;
