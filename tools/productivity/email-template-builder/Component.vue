<template>
  <div class="space-y-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.email-template-builder.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.email-template-builder.page.subtitle') }}</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.email-template-builder.page.subjectLabel') }}</label>
        <input
          v-model="subject"
          type="text"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          :placeholder="$t('tools.email-template-builder.page.subjectPlaceholder')"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.email-template-builder.page.greetingLabel') }}</label>
        <input
          v-model="greeting"
          type="text"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          :placeholder="$t('tools.email-template-builder.page.greetingPlaceholder')"
        />
      </div>

      <div class="md:col-span-2">
        <label class="block text-sm font-medium mb-2">{{ $t('tools.email-template-builder.page.bodyLabel') }}</label>
        <textarea
          v-model="bodyLines"
          rows="6"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          :placeholder="$t('tools.email-template-builder.page.bodyPlaceholder')"
        ></textarea>
      </div>

      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.email-template-builder.page.closingLabel') }}</label>
        <input
          v-model="closing"
          type="text"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          :placeholder="$t('tools.email-template-builder.page.closingPlaceholder')"
        />
      </div>
      <div>
        <label class="block text-sm font-medium mb-2">{{ $t('tools.email-template-builder.page.signatureLabel') }}</label>
        <input
          v-model="signature"
          type="text"
          class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          :placeholder="$t('tools.email-template-builder.page.signaturePlaceholder')"
        />
      </div>
    </div>

    <div class="flex justify-center gap-3">
      <button @click="build" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.email-template-builder.page.build') }}</button>
      <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.email-template-builder.page.clear') }}</button>
    </div>

    <div v-if="output" class="space-y-4">
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
        <div class="text-center">
          <div class="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{{ $t('tools.email-template-builder.page.generatedTitle') }}</div>
          <div class="text-lg text-gray-600 dark:text-gray-300">{{ $t('tools.email-template-builder.page.generatedSubtitle') }}</div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{{ $t('tools.email-template-builder.page.preview') }}</div>
        <pre class="whitespace-pre-wrap text-sm">{{ output }}</pre>
      </div>

      <div class="flex justify-center gap-3">
        <button @click="copy" class="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-md">{{ $t('tools.email-template-builder.page.copy') }}</button>
        <button @click="downloadTxt" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md">{{ $t('tools.email-template-builder.page.downloadTxt') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const subject = ref('');
const greeting = ref('');
const bodyLines = ref('');
const { t } = useI18n();
const closing = ref(t('tools.email-template-builder.page.defaultClosing'));
const signature = ref('');
const output = ref('');

function build() {
  const lines = (bodyLines.value || '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const parts = [subject.value ? `Subject: ${subject.value}` : '', greeting.value || '', '', ...lines, '', closing.value || '', signature.value || ''].join('\n').replace(/\n{3,}/g, '\n\n');
  output.value = parts.trim();
}

function clearAll() {
  subject.value = '';
  greeting.value = '';
  bodyLines.value = '';
  closing.value = t('tools.email-template-builder.page.defaultClosing');
  signature.value = '';
  output.value = '';
}

async function copy() {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    alert(t('tools.email-template-builder.page.copied'));
  } catch {
    alert(t('tools.email-template-builder.page.copyFailed'));
  }
}

function downloadTxt() {
  if (!output.value) return;
  const blob = new Blob([output.value], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'email-template.txt';
  a.click();
  URL.revokeObjectURL(url);
}
</script>
