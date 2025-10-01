<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.cookie-editor.page.title') }}</h3>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.cookie-editor.page.nameLabel') }}</label>
              <input v-model="name" placeholder="key" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.cookie-editor.page.valueLabel') }}</label>
              <input v-model="value" placeholder="value" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div>
              <label class="block text-xs text-gray-500 mb-1">{{ $t('tools.cookie-editor.page.maxAgeLabel') }}</label>
              <input
                v-model.number="maxAge"
                type="number"
                min="0"
                :placeholder="$t('tools.cookie-editor.page.maxAgePlaceholder')"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <input id="secure" v-model="secure" type="checkbox" class="rounded mr-2" />
              <label for="secure" class="text-sm">Secure</label>
            </div>
            <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <input id="samesite" v-model="sameSiteLax" type="checkbox" class="rounded mr-2" />
              <label for="samesite" class="text-sm">SameSite=Lax</label>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="setCookie" :disabled="!name.trim()" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.cookie-editor.page.set') }}
            </button>
            <button @click="removeCookie" :disabled="!name.trim()" class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.cookie-editor.page.remove') }}
            </button>
            <button @click="refresh" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.cookie-editor.page.refresh') }}</button>
          </div>
          <p class="text-xs text-gray-500">{{ $t('tools.cookie-editor.page.note') }}</p>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.cookie-editor.page.resultTitle') }}</h3>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-medium">{{ $t('tools.cookie-editor.page.cookiesTitle') }}</h4>
            <div class="flex gap-2">
              <button @click="copyResult" :disabled="!result" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm">
                {{ $t('tools.cookie-editor.page.copy') }}
              </button>
              <button @click="downloadResult" :disabled="!result" class="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm">
                {{ $t('tools.cookie-editor.page.download') }}
              </button>
            </div>
          </div>
          <textarea :value="result" readonly rows="12" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="text-red-800 dark:text-red-200 text-sm break-all">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.cookie-editor.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(h, i) in history" :key="i" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between">
            <div class="font-medium truncate">{{ h.action }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(h.timestamp) }}</div>
          </div>
          <div class="text-xs truncate">{{ h.detail }}</div>
          <div class="flex gap-2 mt-2">
            <button @click="removeFromHistory(i)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.cookie-editor.page.historyItemRemove') }}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
type HistoryItem = { action: string; detail: string; result: string; timestamp: number };

const name = ref('');
const value = ref('');
const maxAge = ref<number | null>(null);
const secure = ref(true);
const sameSiteLax = ref(true);

const result = ref('');
const { t: tt } = useI18n ? useI18n() : ({ t: (s: string) => s } as any);
const error = ref('');
const history = ref<HistoryItem[]>([]);

function clearError() {
  error.value = '';
}
function record(action: string, detail: string) {
  history.value.unshift({ action, detail, result: result.value, timestamp: Date.now() });
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('cookie-history', JSON.stringify(history.value));
}
function removeFromHistory(i: number) {
  history.value.splice(i, 1);
  localStorage.setItem('cookie-history', JSON.stringify(history.value));
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

function parseCookies() {
  const map: Record<string, string> = {};
  const raw = document.cookie || '';
  raw
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((kv) => {
      const idx = kv.indexOf('=');
      if (idx >= 0) {
        const k = decodeURIComponent(kv.slice(0, idx).trim());
        const v = decodeURIComponent(kv.slice(idx + 1));
        map[k] = v;
      }
    });
  return map;
}
function refresh() {
  clearError();
  try {
    const data = parseCookies();
    result.value = JSON.stringify(data, null, 2);
    record('refresh', tt('tools.cookie-editor.page.refreshCookiesDetail'));
  } catch (e: any) {
    error.value = e?.message || tt('tools.cookie-editor.page.errorReadFailed');
  }
}
function setCookie() {
  clearError();
  try {
    let parts = [`${encodeURIComponent(name.value)}=${encodeURIComponent(value.value)}`, `path=/`];
    if (maxAge.value != null && Number.isFinite(maxAge.value) && maxAge.value > 0) parts.push(`Max-Age=${Math.floor(maxAge.value)}`);
    if (secure.value) parts.push('Secure');
    parts.push(`SameSite=${sameSiteLax.value ? 'Lax' : 'None'}`);
    document.cookie = parts.join('; ');
    refresh();
    record('set', `${name.value}=${value.value}; Max-Age=${maxAge.value || ''}`);
  } catch (e: any) {
    error.value = e?.message || tt('tools.cookie-editor.page.errorSetFailed');
  }
}
function removeCookie() {
  clearError();
  try {
    document.cookie = `${encodeURIComponent(name.value)}=; Max-Age=0; path=/`;
    refresh();
    record('remove', name.value);
  } catch (e: any) {
    error.value = e?.message || tt('tools.cookie-editor.page.errorRemoveFailed');
  }
}

function copyText(t: string) {
  navigator.clipboard.writeText(t).then(() => alert(tt('tools.cookie-editor.page.copied')));
}
function copyResult() {
  if (result.value) copyText(result.value);
}
function downloadResult() {
  if (!result.value) return;
  const blob = new Blob([result.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cookies.json';
  a.click();
  URL.revokeObjectURL(url);
}

onMounted(() => {
  const saved = localStorage.getItem('cookie-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
  refresh();
});
</script>
