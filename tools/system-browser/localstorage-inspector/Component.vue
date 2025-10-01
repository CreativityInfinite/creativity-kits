<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.localstorage-inspector.page.title') }}</h3>

        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.localstorage-inspector.page.keyLabel') }}</label>
              <input
                v-model="k"
                :placeholder="$t('tools.localstorage-inspector.page.keyPlaceholder')"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.localstorage-inspector.page.valueLabel') }}</label>
              <input
                v-model="v"
                :placeholder="$t('tools.localstorage-inspector.page.valuePlaceholder')"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2">
            <button @click="setItem" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.localstorage-inspector.page.set') }}</button>
            <button @click="getItem" class="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.localstorage-inspector.page.get') }}</button>
            <button @click="removeItem" class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">{{ $t('tools.localstorage-inspector.page.remove') }}</button>
          </div>

          <div class="flex gap-2">
            <button @click="refresh" class="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md">{{ $t('tools.localstorage-inspector.page.refreshList') }}</button>
            <button @click="clearAllStore" class="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-md">{{ $t('tools.localstorage-inspector.page.clearStorage') }}</button>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button @click="exportAll" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">{{ $t('tools.localstorage-inspector.page.exportJson') }}</button>
            <label class="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-center cursor-pointer">
              {{ $t('tools.localstorage-inspector.page.importJson') }}
              <input type="file" accept="application/json" class="hidden" @change="importAll" />
            </label>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.localstorage-inspector.page.resultTitle') }}</h3>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-2">
            <h4 class="font-medium">{{ $t('tools.localstorage-inspector.page.output') }}</h4>
            <div class="flex gap-2">
              <button @click="copyResult" :disabled="!result" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm">
                {{ $t('tools.localstorage-inspector.page.copy') }}
              </button>
              <button @click="downloadResult" :disabled="!result" class="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm">
                {{ $t('tools.localstorage-inspector.page.download') }}
              </button>
            </div>
          </div>
          <textarea :value="result" readonly rows="14" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mt-2">
          <div class="text-red-800 dark:text-red-200 text-sm break-all">{{ error }}</div>
        </div>
      </div>
    </div>

    <div v-if="list.length" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.localstorage-inspector.page.currentPairsTitle') }}</h3>
      <div class="rounded-md overflow-hidden border dark:border-gray-700">
        <div class="p-0">
          <table class="w-full text-sm">
            <thead>
              <tr class="bg-gray-100 dark:bg-gray-900 text-left">
                <th class="px-3 py-2 w-1/3">{{ $t('tools.localstorage-inspector.page.table.key') }}</th>
                <th class="px-3 py-2">{{ $t('tools.localstorage-inspector.page.table.value') }}</th>
                <th class="px-3 py-2 w-24">{{ $t('tools.localstorage-inspector.page.table.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="it in list" :key="it.key" class="border-b dark:border-gray-700">
                <td class="px-3 py-2 font-mono break-words">{{ it.key }}</td>
                <td class="px-3 py-2 font-mono break-words">{{ it.value }}</td>
                <td class="px-3 py-2">
                  <button @click="quickRemove(it.key)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.localstorage-inspector.page.delete') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

type KV = { key: string; value: string };
const k = ref(''),
  v = ref('');
const result = ref('');
const error = ref('');
const list = ref<KV[]>([]);

function clearError() {
  error.value = '';
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => alert(t('tools.localstorage-inspector.page.copied')));
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
  a.download = 'localstorage.json';
  a.click();
  URL.revokeObjectURL(url);
}

function refresh() {
  clearError();
  try {
    const items: KV[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      items.push({ key, value: localStorage.getItem(key) ?? '' });
    }
    list.value = items.sort((a, b) => a.key.localeCompare(b.key));
    result.value = JSON.stringify(Object.fromEntries(items.map((x) => [x.key, x.value])), null, 2);
  } catch (e: any) {
    error.value = e?.message || t('tools.localstorage-inspector.page.readFailed');
  }
}

function setItem() {
  clearError();
  try {
    localStorage.setItem(k.value, v.value);
    refresh();
  } catch (e: any) {
    error.value = e?.message || t('tools.localstorage-inspector.page.setFailed');
  }
}
function getItem() {
  clearError();
  try {
    const val = localStorage.getItem(k.value);
    result.value = JSON.stringify({ key: k.value, value: val }, null, 2);
  } catch (e: any) {
    error.value = e?.message || '读取失败';
  }
}
function removeItem() {
  clearError();
  try {
    localStorage.removeItem(k.value);
    refresh();
  } catch (e: any) {
    error.value = e?.message || t('tools.localstorage-inspector.page.deleteFailed');
  }
}
function quickRemove(key: string) {
  clearError();
  try {
    localStorage.removeItem(key);
    refresh();
  } catch (e: any) {
    error.value = e?.message || '删除失败';
  }
}
function clearAllStore() {
  clearError();
  try {
    localStorage.clear();
    refresh();
  } catch (e: any) {
    error.value = e?.message || t('tools.localstorage-inspector.page.clearFailed');
  }
}

function exportAll() {
  if (!list.value.length) return;
  const blob = new Blob([result.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'localstorage.json';
  a.click();
  URL.revokeObjectURL(url);
}
function importAll(e: Event) {
  clearError();
  try {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(String(reader.result || '{}'));
        for (const [key, val] of Object.entries(obj)) localStorage.setItem(key, String(val));
        refresh();
      } catch (err: any) {
        error.value = t('tools.localstorage-inspector.page.parseJsonFailed');
      }
    };
    reader.readAsText(f);
  } catch (err: any) {
    error.value = err?.message || t('tools.localstorage-inspector.page.importFailed');
  }
}

onMounted(() => refresh());
</script>
