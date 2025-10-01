<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.csv-to-json.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.csv-to-json.page.description') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.csv-to-json.page.selectFile') }}</label>
        <input type="file" accept=".csv,text/csv" @change="onFile" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.csv-to-json.page.delimiter') }}</label>
        <select v-model="delimiter" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <option value=",">{{ $t('tools.csv-to-json.page.comma') }}</option>
          <option value="\t">{{ $t('tools.csv-to-json.page.tab') }}</option>
          <option value=";">{{ $t('tools.csv-to-json.page.semicolon') }}</option>
        </select>
      </div>
      <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        <input id="hasHeader" v-model="hasHeader" type="checkbox" class="rounded mr-2" />
        <label for="hasHeader" class="text-sm">{{ $t('tools.csv-to-json.page.hasHeader') }}</label>
      </div>
    </div>

    <div class="flex justify-center">
      <button @click="convert" :disabled="!file" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">{{ $t('tools.csv-to-json.page.convert') }}</button>
    </div>

    <div v-if="preview || jsonResult" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.csv-to-json.page.csvPreview') }}</div>
        <pre class="text-xs overflow-auto max-h-96">{{ preview }}</pre>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.csv-to-json.page.jsonOutput') }}</div>
        <pre class="text-xs overflow-auto max-h-96">{{ jsonResult }}</pre>
        <div class="flex gap-2 mt-3">
          <button @click="copyResult" :disabled="!jsonResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm">
            {{ $t('tools.csv-to-json.page.copy') }}
          </button>
          <button @click="downloadResult" :disabled="!jsonResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm">
            {{ $t('tools.csv-to-json.page.download') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const file = ref<File | null>(null);
const preview = ref('');
const jsonResult = ref('');
const delimiter = ref(',');
const hasHeader = ref(true);

function onFile(e: Event) {
  const t = e.target as HTMLInputElement;
  const f = t.files?.[0] || null;
  file.value = f;
  jsonResult.value = '';
  if (f) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.value = (e.target?.result as string) || '';
    };
    reader.readAsText(f);
  }
}

async function convert() {
  if (!file.value) {
    alert(t('tools.csv-to-json.page.alertSelectFile'));
    return;
  }

  try {
    const text = await readFileText(file.value);
    const lines = text.split('\n');
    const headers = hasHeader.value ? lines[0].split(delimiter.value) : [];
    const result = [];

    const start = hasHeader.value ? 1 : 0;
    for (let i = start; i < lines.length; i++) {
      const values = lines[i].split(delimiter.value);
      if (values.length === 0 || (values.length === 1 && values[0] === '')) continue;

      if (hasHeader.value) {
        const obj: Record<string, string> = {};
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = values[j] || '';
        }
        result.push(obj);
      } else {
        result.push(values);
      }
    }

    jsonResult.value = JSON.stringify(result, null, 2);
  } catch (e) {
    jsonResult.value = t('tools.csv-to-json.page.conversionError');
  }
}

function readFileText(f: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = () => reject(new Error('File read error'));
    reader.readAsText(f);
  });
}

function copyResult() {
  if (!jsonResult.value) return;
  try {
    navigator.clipboard.writeText(jsonResult.value);
    alert(t('tools.csv-to-json.page.copied'));
  } catch {
    alert(t('tools.csv-to-json.page.copyFailed'));
  }
}

function downloadResult() {
  if (!jsonResult.value) return;
  const blob = new Blob([jsonResult.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'converted.json';
  a.click();
  URL.revokeObjectURL(url);
}
</script>
