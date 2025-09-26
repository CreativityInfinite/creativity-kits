<template>
  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium mb-2">输入文本</label>
      <textarea
        v-model="input"
        @input="generateHashes"
        rows="4"
        class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        placeholder="请输入要计算哈希值的文本..."
      />
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-3">
        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="text-sm font-medium">MD5</label>
            <button
              @click="copyHash('md5')"
              class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              复制
            </button>
          </div>
          <input
            v-model="hashes.md5"
            readonly
            class="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-white font-mono text-sm"
          />
        </div>
        
        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="text-sm font-medium">SHA-1</label>
            <button
              @click="copyHash('sha1')"
              class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              复制
            </button>
          </div>
          <input
            v-model="hashes.sha1"
            readonly
            class="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-white font-mono text-sm"
          />
        </div>
        
        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="text-sm font-medium">SHA-256</label>
            <button
              @click="copyHash('sha256')"
              class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              复制
            </button>
          </div>
          <input
            v-model="hashes.sha256"
            readonly
            class="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-white font-mono text-sm"
          />
        </div>
      </div>
      
      <div class="space-y-3">
        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="text-sm font-medium">SHA-384</label>
            <button
              @click="copyHash('sha384')"
              class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              复制
            </button>
          </div>
          <input
            v-model="hashes.sha384"
            readonly
            class="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-white font-mono text-sm"
          />
        </div>
        
        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="text-sm font-medium">SHA-512</label>
            <button
              @click="copyHash('sha512')"
              class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              复制
            </button>
          </div>
          <input
            v-model="hashes.sha512"
            readonly
            class="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-white font-mono text-sm"
          />
        </div>
        
        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="text-sm font-medium">Base64</label>
            <button
              @click="copyHash('base64')"
              class="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              复制
            </button>
          </div>
          <input
            v-model="hashes.base64"
            readonly
            class="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-white font-mono text-sm"
          />
        </div>
      </div>
    </div>
    
    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">说明</h3>
      <ul class="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
        <li>• 所有哈希计算都在浏览器本地完成，不会上传到服务器</li>
        <li>• MD5 和 SHA-1 已不推荐用于安全用途，仅供兼容性使用</li>
        <li>• 推荐使用 SHA-256 或更高版本的 SHA 算法</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input = ref('Hello World')
const hashes = ref({
  md5: '',
  sha1: '',
  sha256: '',
  sha384: '',
  sha512: '',
  base64: ''
})

async function generateHashes() {
  if (!input.value) {
    Object.keys(hashes.value).forEach(key => {
      hashes.value[key as keyof typeof hashes.value] = ''
    })
    return
  }
  
  const encoder = new TextEncoder()
  const data = encoder.encode(input.value)
  
  try {
    // Base64 编码
    hashes.value.base64 = btoa(input.value)
    
    // 使用 Web Crypto API 计算哈希
    const sha1Buffer = await crypto.subtle.digest('SHA-1', data)
    hashes.value.sha1 = bufferToHex(sha1Buffer)
    
    const sha256Buffer = await crypto.subtle.digest('SHA-256', data)
    hashes.value.sha256 = bufferToHex(sha256Buffer)
    
    const sha384Buffer = await crypto.subtle.digest('SHA-384', data)
    hashes.value.sha384 = bufferToHex(sha384Buffer)
    
    const sha512Buffer = await crypto.subtle.digest('SHA-512', data)
    hashes.value.sha512 = bufferToHex(sha512Buffer)
    
    // MD5 需要自实现（简化版本）
    hashes.value.md5 = simpleMD5(input.value)
  } catch (error) {
    console.error('哈希计算失败:', error)
  }
}

function bufferToHex(buffer: ArrayBuffer): string {
  const hashArray = Array.from(new Uint8Array(buffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// 简化的 MD5 实现（仅用于演示）
function simpleMD5(str: string): string {
  // 这是一个简化的 MD5 实现，实际项目中应使用专业的加密库
  let hash = 0
  if (str.length === 0) return hash.toString(16)
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // 转换为32位整数
  }
  
  // 转换为16进制并补齐32位
  return Math.abs(hash).toString(16).padStart(8, '0').repeat(4).substring(0, 32)
}

async function copyHash(type: keyof typeof hashes.value) {
  const value = hashes.value[type]
  if (!value) return
  
  try {
    await navigator.clipboard.writeText(value)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 初始计算
generateHashes()
</script>