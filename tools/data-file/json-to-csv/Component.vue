<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.json-to-csv.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.json-to-csv.page.description') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.json-to-csv.page.selectFile') }}</label>
        <input type="file" accept=".json,application/json" @change="onFile" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.json-to-csv.page.delimiter') }}</label>
        <select v-model="delimiter" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <option value=",">{{ $t('tools.json-to-csv.page.comma') }}</option>
          <option value="\t">{{ $t('tools.json-to-csv.page.tab') }}</option>
          <option value=";">{{ $t('tools.json-to-csv.page.semicolon') }}</option>
        </select>
      </div>
      <div class="flex items-center h-[42px] px-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
        <input id="includeHeader" v-model="includeHeader" type="checkbox" class="rounded mr-2" />
        <label for="includeHeader" class="text-sm">{{ $t('tools.json-to-csv.page.includeHeader') }}</label>
      </div>
    </div>

    <div class="flex justify-center">
      <button @click="convert" :disabled="!file" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">{{ $t('tools.json-to-csv.page.convert') }}</button>
    </div>

    <div v-if="preview || csvResult" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.json-to-csv.page.jsonPreview') }}</div>
        <pre class="text-xs overflow-auto max-h-96">{{ preview }}</pre>
      </div>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.json-to-csv.page.csvOutput') }}</div>
        <pre class="text-xs overflow-auto max-h-96">{{ csvResult }}</pre>
        <div class="flex gap-2 mt-3">
          <button @click="copyResult" :disabled="!csvResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm">
            {{ $t('tools.json-to-csv.page.copy') }}
          </button>
          <button @click="downloadResult" :disabled="!csvResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm">
            {{ $t('tools.json-to-csv.page.download') }}
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
const csvResult = ref('');
const delimiter = ref(',');
const includeHeader = ref(true);

function onFile(e: Event) {
  const t = e.target as HTMLInputElement;
  const f = t.files?.[0] || null;
  file.value = f;
  csvResult.value = '';
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
    alert(t('tools.json-to-csv.page.alertSelectFile'));
    return;
  }

  try {
    const text = await readFileText(file.value);
    const jsonData = JSON.parse(text);

    if (!Array.isArray(jsonData)) {
      throw new Error(t('tools.json-to-csv.page.invalidJson'));
    }

    let headers: string[] = [];
    if (includeHeader.value && jsonData.length > 0) {
      headers = Object.keys(jsonData[0]);
    }

    let result = '';
    if (includeHeader.value) {
      result += headers.join(delimiter.value) + '\n';
    }

    for (const item of jsonData) {
      const values = headers.map((header) => {
        let value = item[header];
        if (typeof value === 'object') value = JSON.stringify(value);
        if (typeof value === 'string' && value.includes(delimiter.value)) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      result += values.join(delimiter.value) + '\n';
    }

    csvResult.value = result;
  } catch (e) {
    csvResult.value = t('tools.json-to-csv.page.conversionError');
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
  if (!csvResult.value) return;
  try {
    navigator.clipboard.writeText(csvResult.value);
    alert(t('tools.json-to-csv.page.copied'));
  } catch {
    alert(t('tools.json-to-csv.page.copyFailed'));
  }
}

function downloadResult() {
  if (!csvResult.value) return;
  const blob = new Blob([csvResult.value], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'converted.csv';
  a.click();
  URL.revokeObjectURL(url);
}
</script>
