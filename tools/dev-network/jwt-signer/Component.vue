<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">JWT 签发 (HS256)</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">Payload JSON</label>
            <textarea
              v-model="payloadText"
              rows="8"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder='{"sub":"123","name":"Alice","iat":1710000000}'
            />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">Secret</label>
              <input v-model="secret" placeholder="密钥字符串" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <input id="includeTyp" v-model="includeTyp" type="checkbox" class="rounded mr-2" />
              <label for="includeTyp" class="text-sm">Header 包含 typ</label>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">签发</button>
            <button @click="verify" :disabled="!token" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-md">校验</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">结果</h3>

        <div v-if="token" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-medium">JWT Token</h4>
              <div class="flex gap-2">
                <button @click="copyText(token)" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
                <button @click="downloadToken" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载</button>
              </div>
            </div>
            <textarea :value="token" readonly rows="3" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-2">解码</h4>
            <textarea :value="decodedText" readonly rows="8" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
          </div>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-3">🔑</div>
          <div class="text-lg">输入 Payload 与 Secret 签发 JWT</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="text-red-800 dark:text-red-200 text-sm break-all">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">历史</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium truncate">payload: {{ h.preview }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(h)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

type HistoryItem = { payload: string; secret: string; includeTyp: boolean; token: string; preview: string; timestamp: number };

const payloadText = ref('');
const secret = ref('');
const includeTyp = ref(true);

const token = ref('');
const decodedText = ref('');
const error = ref('');
const history = ref<HistoryItem[]>([]);

const canProcess = computed(() => payloadText.value.trim().length > 0 && secret.value.trim().length > 0);

function clearAll() {
  token.value = '';
  decodedText.value = '';
  error.value = '';
}
function copyText(t: string) {
  navigator.clipboard.writeText(t).then(() => alert('已复制'));
}
function downloadToken() {
  if (!token.value) return;
  const blob = new Blob([token.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'token.jwt';
  a.click();
  URL.revokeObjectURL(url);
}
function saveToHistory() {
  if (!token.value) return;
  history.value.unshift({ payload: payloadText.value, secret: secret.value, includeTyp: includeTyp.value, token: token.value, preview: payloadText.value.slice(0, 60), timestamp: Date.now() });
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('jwt-signer-history', JSON.stringify(history.value));
}
function loadFromHistory(h: HistoryItem) {
  payloadText.value = h.payload;
  secret.value = h.secret;
  includeTyp.value = h.includeTyp;
  token.value = h.token;
  decodedText.value = decodeTokenText(h.token);
  error.value = '';
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('jwt-signer-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function b64url(buf: ArrayBuffer) {
  let str = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return str.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}
function b64urlFromStr(str: string) {
  return btoa(unescape(encodeURIComponent(str)))
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}
function b64urlToJson(b64: string) {
  const pad = (s: string) => s + '==='.slice((s.length + 3) % 4);
  const norm = b64.replaceAll('-', '+').replaceAll('_', '/');
  const json = decodeURIComponent(escape(atob(pad(norm))));
  return json;
}
function decodeTokenText(tk: string) {
  try {
    const [h, p] = tk.split('.', 3);
    const header = JSON.parse(b64urlToJson(h));
    const payload = JSON.parse(b64urlToJson(p));
    return JSON.stringify({ header, payload }, null, 2);
  } catch {
    return '';
  }
}

async function signHmacSHA256(secretStr: string, data: string) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secretStr), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
}

async function process() {
  error.value = '';
  token.value = '';
  decodedText.value = '';
  try {
    const payload = JSON.parse(payloadText.value);
    const header: any = { alg: 'HS256' };
    if (includeTyp.value) header.typ = 'JWT';
    const encHeader = b64urlFromStr(JSON.stringify(header));
    const encPayload = b64urlFromStr(JSON.stringify(payload));
    const signingInput = `${encHeader}.${encPayload}`;
    const sig = await signHmacSHA256(secret.value, signingInput);
    const encSig = b64url(sig);
    token.value = `${signingInput}.${encSig}`;
    decodedText.value = decodeTokenText(token.value);
    saveToHistory();
  } catch (e: any) {
    error.value = e?.message || '签发失败（请检查 payload JSON）';
  }
}

async function verify() {
  error.value = '';
  try {
    if (!token.value) return;
    const parts = token.value.split('.');
    if (parts.length !== 3) throw new Error('无效的 JWT 格式');
    const signingInput = parts[0] + '.' + parts[1];
    const expect = await signHmacSHA256(secret.value, signingInput);
    const got = parts[2];
    const eq = b64url(expect) === got;
    alert(eq ? '签名有效' : '签名无效');
  } catch (e: any) {
    error.value = e?.message || '校验失败';
  }
}

onMounted(() => {
  const saved = localStorage.getItem('jwt-signer-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
