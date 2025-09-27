<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">2FA TOTP 生成器</h3>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">密钥（Base32 或 otpauth URI）</label>
              <input v-model="secretInput" placeholder="JBSWY3DPEHPK3PXP 或 otpauth://totp/..." class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">位数</label>
              <select v-model.number="digits" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option :value="6">6</option>
                <option :value="8">8</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">时间步长(s)</label>
              <input type="number" v-model.number="period" min="15" max="120" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">算法</label>
              <select v-model="algo" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option>SHA-1</option>
              </select>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">生成</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
            <button @click="swapView" :disabled="!code" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md">交换视图</button>
          </div>
          <p class="text-xs text-gray-500">本地计算，不会上传你的密钥。</p>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">当前代码</h3>

        <div v-if="code" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex items-center justify-between">
              <div class="text-4xl font-mono tracking-widest">{{ code }}</div>
              <div class="text-sm text-gray-500">剩余 {{ remaining }}s</div>
            </div>
            <div class="mt-3 flex gap-2">
              <button @click="copyCode" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
              <button @click="saveToHistory" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">保存</button>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-2">参数与 URI</h4>
            <textarea :value="metaText" readonly rows="6" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-xs" />
          </div>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">🔐</div>
          <div class="text-lg mb-2">TOTP 生成器</div>
          <div class="text-sm">输入 Base32 秘钥或 otpauth URI</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800 dark:text-red-200">
            <span class="text-lg">⚠️</span>
            <div>
              <div class="font-medium">失败</div>
              <div class="text-sm mt-1 break-all">{{ error }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">历史</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(item, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-mono">{{ item.code }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(item.timestamp) }}</div>
          </div>
          <div class="text-xs mt-1 break-all">{{ item.label }}</div>
          <div class="flex gap-2 mt-2">
            <button @click="copyText(item.code)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">复制代码</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

type HistoryItem = { code: string; label: string; timestamp: number }

const secretInput = ref('')
const digits = ref(6)
const period = ref(30)
const algo = ref<'SHA-1'>('SHA-1')

const code = ref('')
const remaining = ref(0)
const metaText = ref('')
const error = ref('')
const history = ref<HistoryItem[]>([])

let timer: number | null = null

const canProcess = computed(() => secretInput.value.trim().length > 0)

function clearAll() {
  code.value = ''
  error.value = ''
  metaText.value = ''
  stopTimer()
}
function swapView() {
  if (code.value) copyCode()
}
function copyText(t: string) {
  navigator.clipboard.writeText(t).then(() => alert('已复制'))
}
function copyCode() {
  if (code.value) copyText(code.value)
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false })
}
function saveToHistory() {
  if (!code.value) return
  history.value.unshift({ code: code.value, label: metaText.value.slice(0, 80), timestamp: Date.now() })
  if (history.value.length > 10) history.value = history.value.slice(0, 10)
  localStorage.setItem('totp-history', JSON.stringify(history.value))
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1)
  localStorage.setItem('totp-history', JSON.stringify(history.value))
}

function base32Decode(b32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const cleaned = b32.toUpperCase().replace(/[^A-Z2-7]/g, '')
  let bits = ''
  for (const ch of cleaned) {
    const idx = alphabet.indexOf(ch)
    if (idx === -1) continue
    bits += idx.toString(2).padStart(5, '0')
  }
  const bytes: number[] = []
  for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i + 8), 2))
  return new Uint8Array(bytes)
}
function parseOtpauth(uri: string) {
  try {
    const u = new URL(uri)
    if (u.protocol !== 'otpauth:') return null
    const type = u.hostname // totp
    const label = decodeURIComponent(u.pathname.slice(1))
    const params = Object.fromEntries(u.searchParams.entries())
    return { type, label, params }
  } catch {
    return null
  }
}
async function hmacSha1(key: ArrayBuffer, data: ArrayBuffer) {
  const cryptoKey = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
  return crypto.subtle.sign('HMAC', cryptoKey, data)
}
function intToBytes(num: number | bigint) {
  let x = BigInt(num)
  const arr = new Uint8Array(8)
  for (let i = 7; i >= 0; i--) {
    arr[i] = Number(x & 0xffn)
    x >>= 8n
  }
  return arr
}
function hotpTruncate(hmac: Uint8Array) {
  const offset = hmac[hmac.length - 1] & 0x0f
  const bin = ((hmac[offset] & 0x7f) << 24) | (hmac[offset + 1] << 16) | (hmac[offset + 2] << 8) | hmac[offset + 3]
  return bin >>> 0
}
async function computeTOTP(secret: Uint8Array, step: number, d: number) {
  const counter = Math.floor(d / step)
  const msg = intToBytes(counter)
  const sig = new Uint8Array(await hmacSha1(secret.buffer, msg.buffer))
  const bin = hotpTruncate(sig)
  const mod = 10 ** digits.value
  return String(bin % mod).padStart(digits.value, '0')
}

function stopTimer() {
  if (timer != null) {
    window.clearInterval(timer)
    timer = null
  }
}
function startTimer(secret: Uint8Array) {
  stopTimer()
  const step = Math.max(5, period.value || 30)
  const tick = async () => {
    const now = Math.floor(Date.now() / 1000)
    const rem = step - (now % step)
    remaining.value = rem
    try {
      const c = await computeTOTP(secret, step, now)
      code.value = c
    } catch (e: any) {
      error.value = e?.message || '计算失败'
      stopTimer()
    }
  }
  tick()
  timer = window.setInterval(tick, 1000)
}

function process() {
  error.value = ''
  code.value = ''
  metaText.value = ''
  try {
    let sec = secretInput.value.trim()
    let label = ''
    const parsed = parseOtpauth(sec)
    if (parsed && parsed.type === 'totp') {
      sec = parsed.params['secret'] || ''
      if (parsed.params['digits']) digits.value = parseInt(parsed.params['digits'])
      if (parsed.params['period']) period.value = parseInt(parsed.params['period'])
      label = parsed.label || ''
    }
    const secretBytes = base32Decode(sec)
    if (!secretBytes.length) throw new Error('无效的 Base32 密钥')
    metaText.value = JSON.stringify({ digits: digits.value, period: period.value, algo: algo.value, label }, null, 2)
    startTimer(secretBytes)
  } catch (e: any) {
    error.value = e?.message || '解析失败'
  }
}

onMounted(() => {
  const saved = localStorage.getItem('totp-history')
  if (saved) {
    try {
      history.value = JSON.parse(saved)
    } catch {}
  }
})
onUnmounted(() => stopTimer())
</script>
