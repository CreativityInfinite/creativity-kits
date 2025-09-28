<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">Service Worker 测试器</h3>

        <div class="space-y-3">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            支持命令：
            <div class="mt-1 space-y-1">
              <div><span class="font-mono px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">register=/sw.js</span> 注册指定脚本</div>
              <div><span class="font-mono px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">unregister</span> 注销当前作用域的全部注册</div>
              <div><span class="font-mono px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">state</span> 查看控制器与状态</div>
              <div><span class="font-mono px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">message=内容</span> 发送消息给激活的 SW</div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">命令输入（每行一个）</label>
            <textarea
              v-model="inputText"
              rows="8"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="例如：&#10;register=/sw.js&#10;state&#10;message=hello"
            />
          </div>

          <div class="flex gap-2">
            <button @click="process" :disabled="!canProcess" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">执行</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
            <button @click="swapView" :disabled="!result" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md">交换视图</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">处理结果</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium">结果 JSON</h4>
              <div class="flex gap-2">
                <button @click="copyResult" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制</button>
                <button @click="downloadResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载</button>
              </div>
            </div>

            <textarea :value="result" readonly rows="10" class="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm" />

            <div class="mt-3 text-xs text-gray-500 space-y-1">
              <div>输出长度: {{ result.length }} 字符</div>
              <div v-if="processingTime">处理时间: {{ processingTime }}ms</div>
              <div>支持情况: {{ supported ? '支持' : '不支持' }}</div>
            </div>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-3">当前注册信息</h4>
            <div class="text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">作用域:</span><span class="font-mono truncate">{{ currentScope || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">控制器:</span><span class="font-mono">{{ hasController ? '是' : '否' }}</span>
              </div>
            </div>
          </div>

          <button @click="saveToHistory" class="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">保存到历史记录</button>
        </div>

        <div v-if="!result" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">🧩</div>
          <div class="text-lg mb-2">Service Worker 测试器</div>
          <div class="text-sm">在本页快速测试注册、注销、状态与消息</div>
        </div>

        <div v-if="error" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div class="flex items-center gap-2 text-red-800 dark:text-red-200">
            <span class="text-lg">⚠️</span>
            <div>
              <div class="font-medium">处理失败</div>
              <div class="text-sm mt-1">{{ error }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="history.length > 0" class="space-y-2">
      <h3 class="font-medium">操作历史</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(item, index) in history" :key="index" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between items-start mb-2">
            <div>
              <div class="font-medium">命令数 {{ item.count }}</div>
              <div class="text-xs text-gray-500 mt-1">{{ formatDate(item.timestamp) }}</div>
            </div>
            <div class="text-right">
              <div class="text-xs text-gray-500">{{ item.outputLength }} 字符</div>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
            <button @click="copyText(item.result)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">复制结果</button>
            <button @click="removeFromHistory(index)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">删除</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">提示</h3>
      <div class="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
        <div>• 需在 HTTPS 或 localhost 环境中使用 Service Worker</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

type HistoryItem = {
  count: number;
  result: string;
  outputLength: number;
  timestamp: number;
};

const inputText = ref('');
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
  navigator.clipboard.writeText(text).then(() => alert('已复制到剪贴板'));
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
      if (!m) throw new Error('无效命令');
      const cmd = m[1].toLowerCase();
      const val = m[2];

      if (cmd === 'register') {
        if (!val) throw new Error('register 需要路径，如 /sw.js');
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
        if (!reg?.active) throw new Error('未找到激活的 SW');
        const chan = new MessageChannel();
        const reply = await new Promise<any>((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('超时未响应')), 5000);
          chan.port1.onmessage = (ev) => {
            clearTimeout(timer);
            resolve(ev.data);
          };
          reg.active!.postMessage(val || '', [chan.port2]);
        });
        outputs.push({ cmd: line, reply });
      } else {
        throw new Error(`未知命令：${cmd}`);
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
    error.value = '当前环境不支持 Service Worker';
    return;
  }

  const start = performance.now();
  try {
    const lines = inputText.value
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!lines.length) throw new Error('请输入至少一条命令');
    const outputs = await execLines(lines);
    await refreshState();
    result.value = JSON.stringify({ count: outputs.length, results: outputs }, null, 2);
    processingTime.value = Math.round(performance.now() - start);
  } catch (e: any) {
    error.value = e?.message || '执行失败';
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
