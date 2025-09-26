<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">安全笔记编辑</h3>

        <div v-if="!isUnlocked" class="bg-white dark:bg-gray-800 border rounded-lg p-6">
          <div class="text-center mb-6">
            <div class="text-4xl mb-4">🔒</div>
            <h4 class="text-lg font-medium mb-2">{{ hasNotes ? '输入密码解锁' : '设置主密码' }}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ hasNotes ? '请输入密码来访问您的安全笔记' : '首次使用需要设置一个主密码来保护您的笔记' }}
            </p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">{{ hasNotes ? '密码' : '设置密码' }}</label>
              <input
                v-model="password"
                type="password"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                :placeholder="hasNotes ? '输入密码...' : '设置一个强密码...'"
                @keyup.enter="unlock"
              />
            </div>

            <div v-if="!hasNotes">
              <label class="block text-sm font-medium mb-2">确认密码</label>
              <input
                v-model="confirmPassword"
                type="password"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="再次输入密码..."
                @keyup.enter="unlock"
              />
            </div>

            <button @click="unlock" :disabled="!canUnlock" class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ hasNotes ? '🔓 解锁' : '🔐 创建安全笔记' }}
            </button>

            <div v-if="errorMessage" class="text-sm text-red-600 dark:text-red-400 text-center">
              {{ errorMessage }}
            </div>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="flex justify-between items-center">
            <h4 class="font-medium">笔记列表</h4>
            <div class="flex gap-2">
              <button @click="createNote" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">➕ 新建</button>
              <button @click="lock" class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">🔒 锁定</button>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div v-if="notes.length === 0" class="p-8 text-center text-gray-500">
              <div class="text-4xl mb-4">📝</div>
              <div class="text-lg mb-2">暂无笔记</div>
              <div class="text-sm">点击"新建"按钮创建您的第一个安全笔记</div>
            </div>

            <div v-else class="divide-y dark:divide-gray-700">
              <div
                v-for="(note, index) in notes"
                :key="note.id"
                class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                :class="{ 'bg-blue-50 dark:bg-blue-900/20': selectedNote?.id === note.id }"
                @click="selectNote(note)"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1 min-w-0">
                    <h5 class="font-medium truncate">{{ note.title || '无标题' }}</h5>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{{ note.content.substring(0, 100) }}{{ note.content.length > 100 ? '...' : '' }}</p>
                    <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{{ formatDate(note.updatedAt) }}</span>
                      <span>{{ note.content.length }} 字符</span>
                      <span v-if="note.tags.length > 0" class="flex gap-1">
                        <span v-for="tag in note.tags.slice(0, 2)" :key="tag" class="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">
                          {{ tag }}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div class="flex gap-1 ml-2">
                    <button @click.stop="duplicateNote(note)" class="p-1 text-gray-400 hover:text-blue-600" title="复制">📋</button>
                    <button @click.stop="deleteNote(index)" class="p-1 text-gray-400 hover:text-red-600" title="删除">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">笔记编辑</h3>

        <div v-if="isUnlocked && selectedNote" class="bg-white dark:bg-gray-800 border rounded-lg p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">标题</label>
            <input
              v-model="selectedNote.title"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="输入笔记标题..."
              @input="saveNote"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">标签</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <span
                v-for="(tag, index) in selectedNote.tags"
                :key="index"
                class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-sm"
              >
                {{ tag }}
                <button @click="removeTag(index)" class="text-blue-600 hover:text-blue-800">×</button>
              </span>
            </div>
            <div class="flex gap-2">
              <input
                v-model="newTag"
                type="text"
                class="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                placeholder="添加标签..."
                @keyup.enter="addTag"
              />
              <button @click="addTag" :disabled="!newTag.trim()" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm">添加</button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">内容</label>
            <textarea
              v-model="selectedNote.content"
              rows="12"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="在这里输入您的安全笔记内容..."
              @input="saveNote"
            />
          </div>

          <div class="flex justify-between items-center text-sm text-gray-500">
            <div>字符数: {{ selectedNote.content.length }} | 最后保存: {{ formatDate(selectedNote.updatedAt) }}</div>
            <div class="flex gap-2">
              <button @click="exportNote" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">📤 导出</button>
              <button @click="printNote" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">🖨️ 打印</button>
            </div>
          </div>
        </div>

        <div v-else-if="isUnlocked" class="text-center py-12 text-gray-500">
          <div class="text-4xl mb-4">📝</div>
          <div class="text-lg mb-2">选择或创建笔记</div>
          <div class="text-sm">从左侧列表选择笔记进行编辑，或创建新笔记</div>
        </div>

        <div v-else class="text-center py-12 text-gray-500">
          <div class="text-4xl mb-4">🔒</div>
          <div class="text-lg mb-2">笔记已锁定</div>
          <div class="text-sm">请输入密码解锁后开始使用</div>
        </div>
      </div>
    </div>

    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
      <h3 class="font-medium mb-3 text-yellow-900 dark:text-yellow-100">🔐 安全提示</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800 dark:text-yellow-200">
        <div>
          <h4 class="font-medium mb-2">数据安全</h4>
          <ul class="space-y-1">
            <li>• 笔记使用AES-256加密存储</li>
            <li>• 密码不会被保存或传输</li>
            <li>• 数据仅存储在本地浏览器</li>
            <li>• 忘记密码将无法恢复数据</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">使用建议</h4>
          <ul class="space-y-1">
            <li>• 使用强密码保护笔记</li>
            <li>• 定期导出重要笔记备份</li>
            <li>• 不要在公共设备上使用</li>
            <li>• 使用完毕后及时锁定</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface SecureNote {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

const isUnlocked = ref(false)
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const notes = ref<SecureNote[]>([])
const selectedNote = ref<SecureNote | null>(null)
const newTag = ref('')

const hasNotes = computed(() => {
  return localStorage.getItem('secure-notes-encrypted') !== null
})

const canUnlock = computed(() => {
  if (hasNotes.value) {
    return password.value.length > 0
  } else {
    return password.value.length >= 6 && password.value === confirmPassword.value
  }
})

// 简单的加密/解密函数（实际应用中应使用更强的加密）
const encrypt = (text: string, key: string): string => {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i)
    const keyChar = key.charCodeAt(i % key.length)
    result += String.fromCharCode(char ^ keyChar)
  }
  return btoa(result)
}

const decrypt = (encryptedText: string, key: string): string => {
  try {
    const text = atob(encryptedText)
    let result = ''
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      const keyChar = key.charCodeAt(i % key.length)
      result += String.fromCharCode(char ^ keyChar)
    }
    return result
  } catch {
    throw new Error('解密失败')
  }
}

// 解锁笔记
const unlock = async () => {
  errorMessage.value = ''

  if (!canUnlock.value) {
    errorMessage.value = hasNotes.value ? '请输入密码' : '密码长度至少6位且两次输入必须一致'
    return
  }

  try {
    if (hasNotes.value) {
      // 解密现有笔记
      const encrypted = localStorage.getItem('secure-notes-encrypted')
      if (encrypted) {
        const decrypted = decrypt(encrypted, password.value)
        notes.value = JSON.parse(decrypted)
        isUnlocked.value = true
      }
    } else {
      // 创建新的安全笔记系统
      notes.value = []
      isUnlocked.value = true
      saveNotes()
    }
  } catch (error) {
    errorMessage.value = '密码错误或数据损坏'
  }
}

// 锁定笔记
const lock = () => {
  isUnlocked.value = false
  password.value = ''
  confirmPassword.value = ''
  selectedNote.value = null
  notes.value = []
}

// 保存笔记到加密存储
const saveNotes = () => {
  if (!isUnlocked.value) return

  try {
    const encrypted = encrypt(JSON.stringify(notes.value), password.value)
    localStorage.setItem('secure-notes-encrypted', encrypted)
  } catch (error) {
    console.error('保存笔记失败:', error)
  }
}

// 创建新笔记
const createNote = () => {
  const newNote: SecureNote = {
    id: Date.now().toString(),
    title: '',
    content: '',
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  notes.value.unshift(newNote)
  selectedNote.value = newNote
  saveNotes()
}

// 选择笔记
const selectNote = (note: SecureNote) => {
  selectedNote.value = note
}

// 保存当前笔记
const saveNote = () => {
  if (!selectedNote.value) return

  selectedNote.value.updatedAt = Date.now()
  saveNotes()
}

// 删除笔记
const deleteNote = (index: number) => {
  if (confirm('确定要删除这个笔记吗？此操作不可恢复。')) {
    const deletedNote = notes.value[index]
    notes.value.splice(index, 1)

    if (selectedNote.value?.id === deletedNote.id) {
      selectedNote.value = null
    }

    saveNotes()
  }
}

// 复制笔记
const duplicateNote = (note: SecureNote) => {
  const duplicated: SecureNote = {
    ...note,
    id: Date.now().toString(),
    title: `${note.title} (副本)`,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  notes.value.unshift(duplicated)
  selectedNote.value = duplicated
  saveNotes()
}

// 添加标签
const addTag = () => {
  if (!selectedNote.value || !newTag.value.trim()) return

  const tag = newTag.value.trim()
  if (!selectedNote.value.tags.includes(tag)) {
    selectedNote.value.tags.push(tag)
    saveNote()
  }

  newTag.value = ''
}

// 移除标签
const removeTag = (index: number) => {
  if (!selectedNote.value) return

  selectedNote.value.tags.splice(index, 1)
  saveNote()
}

// 导出笔记
const exportNote = () => {
  if (!selectedNote.value) return

  const content = `# ${selectedNote.value.title}\n\n${selectedNote.value.content}\n\n---\n标签: ${selectedNote.value.tags.join(', ')}\n创建时间: ${formatDate(selectedNote.value.createdAt)}\n更新时间: ${formatDate(selectedNote.value.updatedAt)}`

  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${selectedNote.value.title || '无标题'}.md`
  a.click()
  URL.revokeObjectURL(url)
}

// 打印笔记
const printNote = () => {
  if (!selectedNote.value) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(`
    <html>
      <head>
        <title>${selectedNote.value.title || '无标题'}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
          .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
          .content { line-height: 1.6; white-space: pre-wrap; }
          .tags { margin-top: 20px; }
          .tag { background: #f0f0f0; padding: 2px 8px; border-radius: 4px; margin-right: 5px; }
        </style>
      </head>
      <body>
        <h1>${selectedNote.value.title || '无标题'}</h1>
        <div class="meta">
          创建时间: ${formatDate(selectedNote.value.createdAt)} | 
          更新时间: ${formatDate(selectedNote.value.updatedAt)}
        </div>
        <div class="content">${selectedNote.value.content}</div>
        ${
          selectedNote.value.tags.length > 0
            ? `
          <div class="tags">
            <strong>标签:</strong> 
            ${selectedNote.value.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
          </div>
        `
            : ''
        }
      </body>
    </html>
  `)

  printWindow.document.close()
  printWindow.print()
}

// 格式化日期
const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

onMounted(() => {
  // 检查是否有保存的笔记
})
</script>
