<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.oauth-pkce-helper.page.title') }}</h3>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.oauth-pkce-helper.page.length') }}</label>
              <input v-model.number="length" type="number" min="43" max="128" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.oauth-pkce-helper.page.charset') }}</label>
              <select v-model="charset" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="unreserved">RFC 3986 Unreserved</option>
                <option value="alnum">{{ $t('tools.oauth-pkce-helper.page.charsetAlnum') }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.oauth-pkce-helper.page.authParamsOptional') }}</label>
            <div class="grid grid-cols-2 gap-2">
              <input v-model="clientId" placeholder="client_id" class="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              <input v-model="redirectUri" placeholder="redirect_uri" class="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              <input v-model="scope" placeholder="scope" class="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              <input v-model="authorizeEndpoint" placeholder="https://auth.example.com/authorize" class="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="process" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.oauth-pkce-helper.page.generate') }}</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.oauth-pkce-helper.page.clear') }}</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.oauth-pkce-helper.page.resultTitle') }}</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium">{{ $t('tools.oauth-pkce-helper.page.pkceTitle') }}</h4>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.oauth-pkce-helper.page.copy') }}</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.oauth-pkce-helper.page.download') }}</button>
              </div>
            </div>
            <textarea :value="result" readonly rows="12" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.oauth-pkce-helper.page.saveToHistory') }}</button>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-3">🔐</div>
          <div class="text-lg">{{ $t('tools.oauth-pkce-helper.page.emptySubtitle') }}</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="text-red-800 dark:text-red-200 text-sm">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.oauth-pkce-helper.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium truncate">verifier {{ h.verifier.slice(0, 10) }}...</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="flex gap-2 mt-2">
            <button @click="loadFromHistory(h)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.oauth-pkce-helper.page.load') }}</button>
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.oauth-pkce-helper.page.delete') }}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">{{ $t('tools.oauth-pkce-helper.page.guideTitle') }}</h3>
      <div class="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
        <div>{{ $t('tools.oauth-pkce-helper.page.guideLine1') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

type HistoryItem = { verifier: string; challenge: string; authUrl?: string; result: string; timestamp: number };

const length = ref(64);
const charset = ref<'unreserved' | 'alnum'>('unreserved');

const clientId = ref('');
const redirectUri = ref('');
const scope = ref('');
const authorizeEndpoint = ref('');

const result = ref('');
const { t } = useI18n();
const error = ref('');
const history = ref<HistoryItem[]>([]);
const processingTime = ref<number | null>(null);

function clearAll() {
  result.value = '';
  error.value = '';
  processingTime.value = null;
}
function copyResult() {
  if (result.value) navigator.clipboard.writeText(result.value).then(() => alert(t('common.copied')));
}
function downloadResult() {
  if (!result.value) return;
  const blob = new Blob([result.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pkce.json';
  a.click();
  URL.revokeObjectURL(url);
}
function saveToHistory() {
  if (!result.value) return;
  const parsed = JSON.parse(result.value);
  history.value.unshift({ verifier: parsed.code_verifier, challenge: parsed.code_challenge, authUrl: parsed.authorize_url, result: result.value, timestamp: Date.now() });
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('pkce-history', JSON.stringify(history.value));
}
function loadFromHistory(h: HistoryItem) {
  result.value = h.result;
  error.value = '';
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('pkce-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function randomString(n: number, kind: 'unreserved' | 'alnum') {
  const unreserved = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const alnum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const chars = kind === 'unreserved' ? unreserved : alnum;
  const out: string[] = [];
  const arr = new Uint8Array(n);
  crypto.getRandomValues(arr);
  for (let i = 0; i < n; i++) {
    out.push(chars[arr[i] % chars.length]);
  }
  return out.join('');
}
function b64url(ab: ArrayBuffer) {
  let s = btoa(String.fromCharCode(...new Uint8Array(ab)));
  return s.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}
async function sha256(str: string) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
}

async function process() {
  error.value = '';
  result.value = '';
  processingTime.value = null;
  const start = performance.now();
  try {
    const len = Math.min(128, Math.max(43, length.value || 64));
    const verifier = randomString(len, charset.value);
    const challenge = b64url(await sha256(verifier));
    let authorize_url = '';
    if (authorizeEndpoint.value && clientId.value) {
      const u = new URL(authorizeEndpoint.value);
      u.searchParams.set('response_type', 'code');
      u.searchParams.set('client_id', clientId.value);
      if (redirectUri.value) u.searchParams.set('redirect_uri', redirectUri.value);
      if (scope.value) u.searchParams.set('scope', scope.value);
      u.searchParams.set('code_challenge', challenge);
      u.searchParams.set('code_challenge_method', 'S256');
      authorize_url = u.toString();
    }
    result.value = JSON.stringify({ code_verifier: verifier, code_challenge: challenge, code_challenge_method: 'S256', authorize_url }, null, 2);
    processingTime.value = Math.round(performance.now() - start);
  } catch (e: any) {
    error.value = e?.message || t('tools.oauth-pkce-helper.page.generateFailed');
  }
}

onMounted(() => {
  const saved = localStorage.getItem('pkce-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
});
</script>
