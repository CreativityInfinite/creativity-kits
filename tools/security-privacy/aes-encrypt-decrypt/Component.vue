<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">AES 加密/解密</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-2">操作模式</label>
            <div class="flex gap-2">
              <button
                @click="mode = 'encrypt'"
                :class="['flex-1 px-4 py-2 rounded-md text-sm font-medium', mode === 'encrypt' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300']"
              >
                加密
              </button>
              <button
                @click="mode = 'decrypt'"
                :class="['flex-1 px-4 py-2 rounded-md text-sm font-medium', mode === 'decrypt' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300']"
              >
                解密
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">密钥 (Key)</label>
            <div class="relative">
              <input
                v-model="key"
                :type="showKey ? 'text' : 'password'"
                class="w-full px-3 py-2 pr-20 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="输入加密密钥"
              />
              <div class="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <button @click="showKey = !showKey" class="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs">
                  {{ showKey ? '隐藏' : '显示' }}
                </button>
                <button @click="generateKey" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">生成</button>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-1">密钥长度: {{ key.length }} 字符</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">
              {{ mode === 'encrypt' ? '明文' : '密文' }}
            </label>
            <textarea
              v-model="inputText"
              rows="6"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="mode === 'encrypt' ? '输入要加密的文本...' : '输入要解密的密文...'"
            />
            <p class="text-xs text-gray-500 mt-1">字符数: {{ inputText.length }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">高级选项</label>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <input id="base64Output" v-model="base64Output" type="checkbox" class="rounded" />
                <label for="base64Output" class="text-sm">Base64 编码输出</label>
              </div>
              <div class="flex items-center gap-2">
                <input id="includeIv" v-model="includeIv" type="checkbox" class="rounded" />
                <label for="includeIv" class="text-sm">包含初始化向量 (IV)</label>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="processText" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ mode === 'encrypt' ? '加密' : '解密' }}
            </button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
            <button @click="swapMode" :disabled="!result" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md">交换</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">处理结果</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium">
                {{ mode === 'encrypt' ? '加密结果' : '解密结果' }}
              </h4>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载</button>
              </div>
            </div>

            <textarea :value="result" readonly rows="8" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />

            <div class="mt-3 text-xs text-gray-500 space-y-1">
              <div>输出长度: {{ result.length }} 字符</div>
              <div v-if="processingTime">处理时间: {{ processingTime }}ms</div>
              <div v-if="mode === 'encrypt' && currentIv">IV: {{ currentIv }}</div>
            </div>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-3">加密信息</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">算法:</span>
                <span class="font-mono">AES-256-GCM</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">密钥长度:</span>
                <span class="font-mono">{{ keyLength }} bits</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">模式:</span>
                <span class="font-mono">GCM (Galois/Counter Mode)</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">认证:</span>
                <span class="font-mono">内置认证标签</span>
              </div>
            </div>
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">保存到历史记录</button>
        </div>

        <div v-if="!result" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">🔐</div>
          <div class="text-lg mb-2">AES 加密/解密</div>
          <div class="text-sm">输入文本和密钥进行加密或解密</div>
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
              <div class="font-medium">{{ item.mode === 'encrypt' ? '加密' : '解密' }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ formatDate(item.timestamp) }}</div>
            </div>
            <div class="text-right">
              <div class="text-xs text-gray-500">{{ item.inputLength }} → {{ item.outputLength }} 字符</div>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
            <button @click="copyToClipboard(item.result)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">复制结果</button>
            <button @click="removeFromHistory(index)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">安全提示</h3>
      <div class="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
        <div>• 所有加密/解密操作都在本地浏览器中进行，不会上传到服务器</div>
        <div>• 请妥善保管您的密钥，丢失密钥将无法解密数据</div>
        <div>• 建议使用强密钥（包含大小写字母、数字和特殊字符）</div>
        <div>• AES-256-GCM 提供加密和认证，确保数据完整性</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface HistoryItem {
  mode: 'encrypt' | 'decrypt';
  inputText: string;
  key: string;
  result: string;
  inputLength: number;
  outputLength: number;
  timestamp: number;
}

const mode = ref<'encrypt' | 'decrypt'>('encrypt');
const key = ref('');
const inputText = ref('');
const result = ref('');
const error = ref('');
const showKey = ref(false);
const base64Output = ref(true);
const includeIv = ref(true);
const processingTime = ref<number | null>(null);
const currentIv = ref('');
const history = ref<HistoryItem[]>([]);

const canProcess = computed(() => {
  return key.value.length > 0 && inputText.value.length > 0;
});

const keyLength = computed(() => {
  // 使用 PBKDF2 从密码派生 256 位密钥
  return 256;
});

async function processText() {
  if (!canProcess.value) return;

  error.value = '';
  result.value = '';

  const startTime = performance.now();

  try {
    if (mode.value === 'encrypt') {
      result.value = await encryptText(inputText.value, key.value);
    } else {
      result.value = await decryptText(inputText.value, key.value);
    }

    processingTime.value = Math.round(performance.now() - startTime);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '处理失败';
    console.error('AES processing error:', err);
  }
}

async function encryptText(text: string, password: string): Promise<string> {
  // 生成随机 IV
  const iv = crypto.getRandomValues(new Uint8Array(12)); // GCM 推荐 12 字节 IV
  currentIv.value = Array.from(iv, (byte) => byte.toString(16).padStart(2, '0')).join('');

  // 从密码派生密钥
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits', 'deriveKey']);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  // 加密
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    derivedKey,
    new TextEncoder().encode(text)
  );

  // 组合 salt + iv + encrypted data
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);

  if (base64Output.value) {
    return btoa(String.fromCharCode(...combined));
  } else {
    return Array.from(combined, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
}

async function decryptText(encryptedText: string, password: string): Promise<string> {
  let combined: Uint8Array;

  try {
    if (base64Output.value) {
      // Base64 解码
      const binaryString = atob(encryptedText);
      combined = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        combined[i] = binaryString.charCodeAt(i);
      }
    } else {
      // 十六进制解码
      if (encryptedText.length % 2 !== 0) {
        throw new Error('无效的十六进制字符串');
      }
      combined = new Uint8Array(encryptedText.length / 2);
      for (let i = 0; i < encryptedText.length; i += 2) {
        combined[i / 2] = parseInt(encryptedText.substr(i, 2), 16);
      }
    }
  } catch (err) {
    throw new Error('无效的加密数据格式');
  }

  if (combined.length < 28) {
    // 16 (salt) + 12 (iv) + 至少一些数据
    throw new Error('加密数据太短');
  }

  // 提取 salt, iv 和加密数据
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const encryptedData = combined.slice(28);

  currentIv.value = Array.from(iv, (byte) => byte.toString(16).padStart(2, '0')).join('');

  // 从密码派生密钥
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits', 'deriveKey']);

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  // 解密
  try {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      derivedKey,
      encryptedData
    );

    return new TextDecoder().decode(decrypted);
  } catch (err) {
    throw new Error('解密失败，请检查密钥是否正确');
  }
}

function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  key.value = result;
}

function clearAll() {
  inputText.value = '';
  result.value = '';
  error.value = '';
  currentIv.value = '';
  processingTime.value = null;
}

function swapMode() {
  if (!result.value) return;

  // 交换模式和内容
  const newMode = mode.value === 'encrypt' ? 'decrypt' : 'encrypt';
  const newInput = result.value;

  mode.value = newMode;
  inputText.value = newInput;
  result.value = '';
  error.value = '';
}

function copyResult() {
  if (result.value) {
    copyToClipboard(result.value);
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    alert('已复制到剪贴板');
  });
}

function downloadResult() {
  if (!result.value) return;

  const filename = `aes_${mode.value}_${new Date().toISOString().slice(0, 10)}.txt`;
  const blob = new Blob([result.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function saveToHistory() {
  if (!result.value || !inputText.value || !key.value) return;

  const item: HistoryItem = {
    mode: mode.value,
    inputText: inputText.value,
    key: key.value,
    result: result.value,
    inputLength: inputText.value.length,
    outputLength: result.value.length,
    timestamp: Date.now()
  };

  history.value.unshift(item);

  // 只保留最近10条（考虑到安全性）
  if (history.value.length > 10) {
    history.value = history.value.slice(0, 10);
  }

  saveHistoryToStorage();
}

function loadFromHistory(item: HistoryItem) {
  mode.value = item.mode;
  inputText.value = item.inputText;
  key.value = item.key;
  result.value = item.result;
  error.value = '';
}

function removeFromHistory(index: number) {
  history.value.splice(index, 1);
  saveHistoryToStorage();
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function saveHistoryToStorage() {
  // 注意：出于安全考虑，实际应用中可能不应该保存密钥到本地存储
  localStorage.setItem('aes-history', JSON.stringify(history.value));
}

function loadHistoryFromStorage() {
  const saved = localStorage.getItem('aes-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  }
}

onMounted(() => {
  loadHistoryFromStorage();
});
</script>
