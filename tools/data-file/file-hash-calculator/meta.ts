import type { ToolMeta } from '~/types/tool'

const meta: ToolMeta = {
  id: 'file-hash-calculator',
  name: '文件哈希计算器',
  description: '计算文件的MD5、SHA-1、SHA-256等哈希值，支持批量处理和完整性验证',
  category: 'data-file',
  tags: ['哈希', 'MD5', 'SHA', '文件校验', '完整性验证', '批量处理'],
  i18nKey: 'tools.file-hash-calculator',
  entry: 'tools/data-file/file-hash-calculator/Component.vue',
}
export default meta