<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ $t('tools.mindmap-editor.page.title') }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ $t('tools.mindmap-editor.page.subtitle') }}</p>
    </div>

    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('tools.mindmap-editor.page.input') }}</label>
          <textarea
            v-model="input"
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            :placeholder="$t('tools.mindmap-editor.page.inputPlaceholder')"
          />
        </div>

        <div class="flex justify-center">
          <button @click="process" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">{{ $t('tools.mindmap-editor.page.process') }}</button>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ $t('tools.mindmap-editor.page.output') }}</label>
          <textarea
            v-model="output"
            readonly
            class="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-600 dark:text-white"
            :placeholder="$t('tools.mindmap-editor.page.outputPlaceholder')"
          />
        </div>

        <div class="flex justify-center">
          <button @click="copyToClipboard" :disabled="!output" class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors">
            {{ $t('tools.mindmap-editor.page.copyResult') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const input = ref('');
const output = ref('');
const { t } = useI18n();

function process() {
  const src = input.value.replace(/\r\n/g, '\n').trim();
  if (!src) {
    output.value = '';
    return;
  }
  const lines = src.split('\n').filter((l) => l.trim().length > 0);

  type Node = { text: string; children: Node[] };
  const root: Node = { text: 'root', children: [] };
  const stack: { indent: number; node: Node }[] = [{ indent: -1, node: root }];

  function getIndent(s: string): number {
    let n = 0;
    for (const ch of s) {
      if (ch === ' ') n += 1;
      else if (ch === '\t') n += 2;
      else break;
    }
    // 把连续空格折算为层级（2空格视为1级）
    return Math.floor(n / 2);
  }

  for (const raw of lines) {
    const indent = getIndent(raw);
    const text = raw.trim();
    const node: Node = { text, children: [] };

    while (stack.length && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    stack[stack.length - 1].node.children.push(node);
    stack.push({ indent, node });
  }

  output.value = JSON.stringify(root.children.length === 1 ? root.children[0] : root.children, null, 2);
}

async function copyToClipboard() {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    alert(t('tools.mindmap-editor.page.copied'));
  } catch (err) {
    console.error('复制失败:', err);
    alert(t('tools.mindmap-editor.page.copyFailedRetry'));
  }
}
</script>
