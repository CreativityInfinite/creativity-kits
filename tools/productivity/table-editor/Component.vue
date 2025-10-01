<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.table-editor.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.table-editor.page.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-2">{{ $t('tools.table-editor.page.csvLabel') }}</label>
        <textarea
          v-model="csv"
          rows="8"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          :placeholder="$t('tools.table-editor.page.csvPlaceholder')"
        ></textarea>
      </div>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">{{ $t('tools.table-editor.page.separator') }}</label>
          <select v-model="sep" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            <option value=",">{{ $t('tools.table-editor.page.optionComma') }}</option>
            <option value=";">{{ $t('tools.table-editor.page.optionSemicolon') }}</option>
            <option value="\t">{{ $t('tools.table-editor.page.optionTab') }}</option>
            <option value="|">{{ $t('tools.table-editor.page.optionPipe') }}</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="parse" class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.table-editor.page.parse') }}</button>
        </div>
      </div>
    </div>

    <div v-if="rows.length" class="bg-white dark:bg-gray-800 rounded-lg p-4 border overflow-auto">
      <table class="min-w-full text-sm">
        <thead>
          <tr>
            <th v-for="(h, i) in headers" :key="i" class="py-2 px-3 text-left text-gray-600 dark:text-gray-400">{{ h }}</th>
          </tr>
        </thead>
        <tbody class="text-gray-800 dark:text-gray-200">
          <tr v-for="(r, ri) in rows" :key="ri">
            <td v-for="(h, ci) in headers" :key="ci" class="py-1 px-3">
              <input v-model="rows[ri][h]" class="w-full px-2 py-1 border rounded-md dark:bg-gray-900 dark:border-gray-700 dark:text-white" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="rows.length" class="flex justify-center gap-3">
      <button @click="addRow" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.table-editor.page.addRow') }}</button>
      <button @click="downloadCsv" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md">{{ $t('tools.table-editor.page.downloadCsv') }}</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const csv = ref('name,age\nAlice,30\nBob,22');
const sep = ref(',');
const headers = ref<string[]>([]);
const rows = ref<Record<string, string>[]>([]);

function parse() {
  const s = sep.value === '\\t' ? '\t' : sep.value;
  const lines = (csv.value || '').split(/\r?\n/).filter(Boolean);
  if (!lines.length) {
    headers.value = [];
    rows.value = [];
    return;
  }
  headers.value = split(lines[0], s);
  rows.value = lines.slice(1).map((l) => {
    const cells = split(l, s);
    const obj: Record<string, string> = {};
    headers.value.forEach((h, i) => (obj[h] = cells[i] ?? ''));
    return obj;
  });
}

function split(line: string, s: string) {
  // 简单 split：不处理引号转义的复杂情况（适合轻量编辑）
  return line.split(s);
}

function addRow() {
  const obj: Record<string, string> = {};
  headers.value.forEach((h) => (obj[h] = ''));
  rows.value.push(obj);
}

function downloadCsv() {
  if (!rows.value.length) return;
  const s = sep.value === '\\t' ? '\t' : sep.value;
  const header = headers.value.join(s);
  const body = rows.value.map((r) => headers.value.map((h) => r[h] ?? '').join(s)).join('\n');
  const out = `${header}\n${body}`;
  const blob = new Blob([out], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'table.csv';
  a.click();
  URL.revokeObjectURL(url);
}
</script>
