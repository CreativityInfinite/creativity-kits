<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.service-worker-tester.page.title') }}</h3>

        <div class="space-y-3">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ $t('tools.service-worker-tester.page.commandsTitle') }}
            <div class="mt-1 space-y-1">
              <div><span class="font-mono px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">register=/sw.js</span> {{ $t('tools.service-worker-tester.page.registerHelp') }}</div>
              <div><span class="font-mono px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">unregister</span> {{ $t('tools.service-worker-tester.page.unregisterHelp') }}</div>
              <div><span class="font-mono px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">state</span> {{ $t('tools.service-worker-tester.page.stateHelp') }}</div>
              <div>
                <span class="font-mono px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">{{ $t('tools.service-worker-tester.page.messageExample') }}</span>
                {{ $t('tools.service-worker-tester.page.messageHelp') }}
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.service-worker-tester.page.inputLabel') }}</label>
            <textarea
              v-model="inputText"
              rows="8"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.service-worker-tester.page.inputPlaceholder')"
            />
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.service-worker-tester.page.execute') }}
            </button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.service-worker-tester.page.clear') }}</button>
            <button @click="swapView" :disabled="!result" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.service-worker-tester.page.swapView') }}
            </button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.service-worker-tester.page.resultTitle') }}</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium">{{ $t('tools.service-worker-tester.page.resultJson') }}</h4>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.service-worker-tester.page.copy') }}</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.service-worker-tester.page.download') }}</button>
              </div>
            </div>

            <textarea :value="result" readonly rows="10" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />

            <div class="mt-3 text-xs text-gray-500 space-y-1">
              <div>{{ $t('tools.service-worker-tester.page.outputLength') }}: {{ result.length }} {{ $t('tools.service-worker-tester.page.chars') }}</div>
              <div v-if="processingTime">{{ $t('tools.service-worker-tester.page.processingTime') }}: {{ processingTime }}ms</div>
              <div>
                {{ $t('tools.service-worker-tester.page.supportedLabel') }}: {{ supported ? $t('tools.service-worker-tester.page.supportedYes') : $t('tools.service-worker-tester.page.supportedNo') }}
              </div>
            </div>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.service-worker-tester.page.currentRegistration') }}</h4>
            <div class="text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">{{ $t('tools.service-worker-tester.page.scope') }}:</span><span class="font-mono truncate">{{ currentScope || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">{{ $t('tools.service-worker-tester.page.controller') }}:</span
                ><span class="font-mono">{{ hasController ? $t('tools.service-worker-tester.page.yes') : $t('tools.service-worker-tester.page.no') }}</span>
              </div>
            </div>
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.service-worker-tester.page.saveToHistory') }}</button>
        </div>

        <div v-if="!result" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">🧩</div>
          <div class="text-lg mb-2">{{ $t('tools.service-worker-tester.page.emptyTitle') }}</div>
          <div class="text-sm">{{ $t('tools.service-worker-tester.page.emptySubtitle') }}</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800 dark:text-red-200">
            <span class="text-lg">⚠️</span>
            <div>
              <div class="font-medium">{{ $t('tools.service-worker-tester.page.errorTitle') }}</div>
              <div class="text-sm mt-1">{{ error }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="history.length > 0" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.service-worker-tester.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(item, index) in history" :key="index" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between items-start mb-2">
            <div>
              <div class="font-medium">{{ $t('tools.service-worker-tester.page.historyCount') }} {{ item.count }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ formatDate(item.timestamp) }}</div>
            </div>
            <div class="text-right">
              <div class="text-xs text-gray-500">{{ item.outputLength }} {{ $t('tools.service-worker-tester.page.chars') }}</div>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.service-worker-tester.page.load') }}</button>
            <button @click="copyText(item.result)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">{{ $t('tools.service-worker-tester.page.copyResult') }}</button>
            <button @click="removeFromHistory(index)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.service-worker-tester.page.remove') }}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">{{ $t('tools.service-worker-tester.page.tipsTitle') }}</h3>
      <div class="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
        <div>{{ $t('tools.service-worker-tester.page.tipsNote') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

type HistoryItem = {
  count: number;
  result: string;
  outputLength: number;
  timestamp: number;
};

const inputText = ref('');
const { t } = useI18n();
const result = ref('');
const error = ref('');
const processingTime = ref<number | null>(null);
const history = ref<HistoryItem[]>([]);

const supported = 'serviceWorker' in navigator;
const currentScope = ref('');
const hasController = ref(false);

const canProcess = computed(() => inputText.value.trim().length > 0);

function clearAll() {
  inputText.value = '';
  result.value = '';
  error.value = '';
  processingTime.value = null;
}

function swapView() {
  if (!result.value) return;
  copyResult();
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => alert(t('tools.service-worker-tester.page.copyDone')));
}

function copyResult() {
  if (result.value) copyText(result.value);
}

function downloadResult() {
  if (!result.value) return;
  const filename = `sw_test_${new Date().toISOString().slice(0, 10)}.json`;
  const blob = new Blob([result.value], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function saveToHistory() {
  if (!result.value) return;
  const item: HistoryItem = { count: JSON.parse(result.value).results?.length || 0, result: result.value, outputLength: result.value.length, timestamp: Date.now() };
  history.value.unshift(item);
  if (history.value.length > 10) history.value = history.value.slice(0, 10);
  localStorage.setItem('sw-tester-history', JSON.stringify(history.value));
}

function loadFromHistory(item: HistoryItem) {
  result.value = item.result;
  error.value = '';
  processingTime.value = null;
}

function removeFromHistory(index: number) {
  history.value.splice(index, 1);
  localStorage.setItem('sw-tester-history', JSON.stringify(history.value));
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('zh-CN', { hour12: false });
}

async function execLines(lines: string[]) {
  const outputs: any[] = [];
  for (const line of lines) {
    try {
      const m = line.match(/^(\w+)(?:\s*=\s*(.+))?$/);
      if (!m) throw new Error(t('tools.service-worker-tester.page.invalidCommand'));
      const cmd = m[1].toLowerCase();
      const val = m[2];

      if (cmd === 'register') {
        if (!val) throw new Error(t('tools.service-worker-tester.page.registerNeedPath'));
        const reg = await navigator.serviceWorker.register(val);
        outputs.push({ cmd: line, scope: reg.scope, installing: !!reg.installing, waiting: !!reg.waiting, active: !!reg.active });
      } else if (cmd === 'unregister') {
        const regs = await navigator.serviceWorker.getRegistrations();
        const oks = await Promise.all(regs.map((r) => r.unregister()));
        outputs.push({ cmd: line, unregistered: oks.filter(Boolean).length, total: regs.length });
      } else if (cmd === 'state') {
        const reg = await navigator.serviceWorker.getRegistration();
        outputs.push({
          cmd: line,
          scope: reg?.scope || null,
          controller: !!navigator.serviceWorker.controller,
          state: navigator.serviceWorker.controller?.state || null
        });
      } else if (cmd === 'message') {
        const reg = await navigator.serviceWorker.getRegistration();
        if (!reg?.active) throw new Error(t('tools.service-worker-tester.page.notFoundActiveSW'));
        const chan = new MessageChannel();
        const reply = await new Promise<any>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error(t('tools.service-worker-tester.page.timeoutNoResponse'))), 5000);
          chan.port1.onmessage = (ev) => {
            clearTimeout(timer);
            resolve(ev.data);
          };
          reg.active!.postMessage(val || '', [chan.port2]);
        });
        outputs.push({ cmd: line, reply });
      } else {
        throw new Error(t('tools.service-worker-tester.page.unknownCommand', { cmd }));
      }
    } catch (e: any) {
      outputs.push({ cmd: line, error: e?.message || String(e) });
    }
  }
  return outputs;
}

async function refreshState() {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    currentScope.value = reg?.scope || '';
    hasController.value = !!navigator.serviceWorker.controller;
  } catch {
    currentScope.value = '';
    hasController.value = false;
  }
}

async function process() {
  error.value = '';
  result.value = '';
  processingTime.value = null;

  if (!supported) {
    error.value = t('tools.service-worker-tester.page.unsupportedEnv');
    return;
  }

  const start = performance.now();
  try {
    const lines = inputText.value
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!lines.length) throw new Error(t('tools.service-worker-tester.page.enterAtLeastOne'));
    const outputs = await execLines(lines);
    await refreshState();
    result.value = JSON.stringify({ count: outputs.length, results: outputs }, null, 2);
    processingTime.value = Math.round(performance.now() - start);
  } catch (e: any) {
    error.value = e?.message || t('tools.service-worker-tester.page.execFailed');
  }
}

onMounted(() => {
  const saved = localStorage.getItem('sw-tester-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch {}
  }
  refreshState();
});
</script>
