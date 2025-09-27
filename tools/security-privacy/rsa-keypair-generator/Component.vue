<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">RSA 密钥对生成器</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">参数</label>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-xs text-gray-500 mb-1">模数长度</label>
                <input v-model.number="modulusLength" type="number" min="1024" max="8192" step="256" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label class="block text-xs text-gray-500 mb-1">哈希算法</label>
                <select v-model="hash" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="SHA-256">SHA-256</option>
                  <option value="SHA-384">SHA-384</option>
                  <option value="SHA-512">SHA-512</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">输出格式</label>
            <div class="flex gap-2">
              <button
                @click="outputFormat = 'pem'"
                :class="['flex-1 px-3 py-2 rounded-md text-sm', outputFormat === 'pem' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300']"
              >
                PEM
              </button>
              <button
                @click="outputFormat = 'jwk'"
                :class="['flex-1 px-3 py-2 rounded-md text-sm', outputFormat === 'jwk' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300']"
              >
                JWK
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">备注（可选，将随历史保存）</label>
            <textarea v-model="notes" rows="3" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="用于标记用途或环境..." />
          </div>

          <div class="flex gap-2">
            <button @click="process" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">生成</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
            <button @click="swapView" :disabled="!result" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md">交换视图</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">处理结果</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium">{{ outputFormat === 'pem' ? 'PEM 文本' : 'JWK JSON' }}</h4>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载</button>
              </div>
            </div>

            <textarea :value="result" readonly rows="10" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />

            <div class="mt-3 text-xs text-gray-500 space-y-1">
              <div>输出长度: {{ result.length }} 字符</div>
              <div v-if="processingTime">处理时间: {{ processingTime }}ms</div>
              <div>参数: modulusLength={{ modulusLength }} · hash={{ hash }}</div>
            </div>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-3">密钥信息</h4>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">算法:</span><span class="font-mono">RSA-OAEP</span></div>
              <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">可导出:</span><span class="font-mono">是</span></div>
              <div class="flex justify-between"><span class="text-gray-600 dark:text-gray-400">用途:</span><span class="font-mono">encrypt/decrypt</span></div>
            </div>
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">保存到历史记录</button>
        </div>

        <div v-if="!result" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">🔑</div>
          <div class="text-lg mb-2">RSA 密钥对生成器</div>
          <div class="text-sm">生成 RSA-OAEP 密钥对，导出 PEM 或 JWK</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800 dark:text-red-200">
            <span class="text-lg">⚠️</span>
            <div>
              <div class="font-medium">处理失败</div>
              <div class="text-sm mt-1">{{ error }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="history.length > 0" class="space-y-2">
      <h3 class="font-medium">操作历史</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(item, index) in history" :key="index" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between items-start mb-2">
            <div>
              <div class="font-medium">modulus {{ item.modulusLength }} · {{ item.hash }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ formatDate(item.timestamp) }}</div>
            </div>
            <div class="text-right">
              <div class="text-xs text-gray-500">{{ item.outputFormat.toUpperCase() }} · {{ item.outputLength }} 字符</div>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
            <button @click="copyText(item.result)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">复制结果</button>
            <button @click="removeFromHistory(index)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">安全提示</h3>
      <div class="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
        <div>• 所有操作在本地浏览器进行，不会上传到服务器</div>
        <div>• 生成的私钥请谨慎保存，避免泄露</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

type HistoryItem = {
  modulusLength: number
  hash: 'SHA-256' | 'SHA-384' | 'SHA-512'
  outputFormat: 'pem' | 'jwk'
  result: string
  notes?: string
  outputLength: number
  timestamp: number
}

const modulusLength = ref(2048)
const hash = ref<'SHA-256' | 'SHA-384' | 'SHA-512'>('SHA-256')
const outputFormat = ref<'pem' | 'jwk'>('pem')
const notes = ref('')

const result = ref('')
const error = ref('')
const processingTime = ref<number | null>(null)
const history = ref<HistoryItem[]>([])

const canProcess = computed(() => true)

function clearAll() {
  result.value = ''
  error.value = ''
  processingTime.value = null
  notes.value = ''
}

function swapView() {
  if (!result.value) return
  outputFormat.value = outputFormat.value === 'pem' ? 'jwk' : 'pem'
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => alert('已复制到剪贴板'))
}

function copyResult() {
  if (result.value) copyText(result.value)
}

function downloadResult() {
  if (!result.value) return
  const ext = outputFormat.value === 'pem' ? 'pem' : 'json'
  const filename = `rsa_key_${new Date().toISOString().slice(0, 10)}.${ext}`
  const blob = new Blob([result.value], { type: ext === 'pem' ? 'application/x-pem-file' : 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function saveToHistory() {
  if (!result.value) return
  const item: HistoryItem = {
    modulusLength: modulusLength.value,
    hash: hash.value,
    outputFormat: outputFormat.value,
    result: result.value,
    notes: notes.value || undefined,
    outputLength: result.value.length,
    timestamp: Date.now()
  }
  history.value.unshift(item)
  if (history.value.length > 10) history.value = history.value.slice(0, 10)
  localStorage.setItem('rsa-keypair-history', JSON.stringify(history.value))
}

function loadFromHistory(item: HistoryItem) {
  modulusLength.value = item.modulusLength
  hash.value = item.hash
  outputFormat.value = item.outputFormat
  result.value = item.result
  error.value = ''
  processingTime.value = null
  notes.value = item.notes || ''
}

function removeFromHistory(index: number) {
  history.value.splice(index, 1)
  localStorage.setItem('rsa-keypair-history', JSON.stringify(history.value))
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false })
}

function wrapPem(b64: string, label: string) {
  const lines = b64.match(/.{1,64}/g) || []
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`
}

async function process() {
  error.value = ''
  result.value = ''
  processingTime.value = null
  const start = performance.now()

  try {
    const alg: RsaHashedKeyGenParams = {
      name: 'RSA-OAEP',
      modulusLength: Math.max(1024, Math.min(8192, modulusLength.value)),
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: hash.value
    }
    const kp = await crypto.subtle.generateKey(alg, true, ['encrypt', 'decrypt'])
    if (outputFormat.value === 'pem') {
      const [spki, pkcs8] = await Promise.all([crypto.subtle.exportKey('spki', kp.publicKey), crypto.subtle.exportKey('pkcs8', kp.privateKey)])
      // to base64
      const toB64 = (buf: ArrayBuffer) => {
        const bytes = new Uint8Array(buf)
        let bin = ''
        for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
        return btoa(bin)
      }
      const pemPublic = wrapPem(toB64(spki), 'PUBLIC KEY')
      const pemPrivate = wrapPem(toB64(pkcs8), 'PRIVATE KEY')
      result.value = `${pemPublic}\n\n${pemPrivate}`
    } else {
      const [jwkPublic, jwkPrivate] = await Promise.all([crypto.subtle.exportKey('jwk', kp.publicKey), crypto.subtle.exportKey('jwk', kp.privateKey)])
      result.value = JSON.stringify({ publicKey: jwkPublic, privateKey: jwkPrivate }, null, 2)
    }
    processingTime.value = Math.round(performance.now() - start)
  } catch (e: any) {
    error.value = e?.message || '生成失败'
  }
}

onMounted(() => {
  const saved = localStorage.getItem('rsa-keypair-history')
  if (saved) {
    try {
      history.value = JSON.parse(saved)
    } catch {}
  }
})
</script>
