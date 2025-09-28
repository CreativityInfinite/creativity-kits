<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">User Agent 解析器</h3>

        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <label class="block text-sm font-medium">User Agent 字符串</label>
            <div class="flex gap-2">
              <button @click="useCurrentUA" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">使用当前浏览器</button>
              <button @click="loadSample" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">加载示例</button>
              <button @click="clearInput" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空</button>
            </div>
          </div>

          <textarea
            v-model="userAgent"
            rows="4"
            class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
            placeholder="在此输入 User Agent 字符串..."
            @input="parseUserAgent"
          />

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">常见 User Agent 示例</h4>
            <div class="space-y-2">
              <div v-for="(sample, index) in sampleUserAgents" :key="index" class="flex items-center justify-between text-sm">
                <div class="flex-1 min-w-0">
                  <div class="font-medium">{{ sample.name }}</div>
                  <div class="text-xs text-gray-500 truncate">{{ sample.ua }}</div>
                </div>
                <button @click="loadSampleUA(sample.ua)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs ml-2">使用</button>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">批量解析</h4>
            <div class="space-y-2">
              <textarea
                v-model="batchInput"
                rows="3"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
                placeholder="每行一个 User Agent 字符串..."
              />
              <div class="flex gap-2">
                <button @click="parseBatch" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">批量解析</button>
                <button @click="exportBatchResults" :disabled="batchResults.length === 0" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded text-sm">
                  导出结果
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">解析结果</h3>

        <div v-if="parsedResult" class="space-y-4">
          <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
            <h4 class="font-medium mb-3 flex items-center">
              <span class="text-2xl mr-2">{{ getBrowserIcon(parsedResult.browser.name) }}</span>
              浏览器信息
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">名称:</span>
                <span class="font-mono">{{ parsedResult.browser.name || '未知' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">版本:</span>
                <span class="font-mono">{{ parsedResult.browser.version || '未知' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">主版本:</span>
                <span class="font-mono">{{ parsedResult.browser.major || '未知' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">引擎:</span>
                <span class="font-mono">{{ parsedResult.engine.name || '未知' }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
            <h4 class="font-medium mb-3 flex items-center">
              <span class="text-2xl mr-2">{{ getOSIcon(parsedResult.os.name) }}</span>
              操作系统
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">名称:</span>
                <span class="font-mono">{{ parsedResult.os.name || '未知' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">版本:</span>
                <span class="font-mono">{{ parsedResult.os.version || '未知' }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
            <h4 class="font-medium mb-3 flex items-center">
              <span class="text-2xl mr-2">{{ getDeviceIcon(parsedResult.device.type) }}</span>
              设备信息
            </h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">类型:</span>
                <span class="font-mono">{{ parsedResult.device.type || 'desktop' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">厂商:</span>
                <span class="font-mono">{{ parsedResult.device.vendor || '未知' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">型号:</span>
                <span class="font-mono">{{ parsedResult.device.model || '未知' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">CPU:</span>
                <span class="font-mono">{{ parsedResult.cpu.architecture || '未知' }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
            <h4 class="font-medium mb-3">特征检测</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">移动设备:</span>
                <span class="font-mono">{{ parsedResult.device.type === 'mobile' ? '是' : '否' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">平板设备:</span>
                <span class="font-mono">{{ parsedResult.device.type === 'tablet' ? '是' : '否' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">爬虫/机器人:</span>
                <span class="font-mono">{{ isBot(userAgent) ? '是' : '否' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">WebView:</span>
                <span class="font-mono">{{ isWebView(userAgent) ? '是' : '否' }}</span>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium">JSON 格式</h4>
              <button @click="copyResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">复制</button>
            </div>
            <pre class="bg-gray-50 dark:bg-gray-700 p-3 rounded text-sm overflow-x-auto"><code>{{ JSON.stringify(parsedResult, null, 2) }}</code></pre>
          </div>
        </div>

        <div v-else class="text-center py-12 text-gray-500">
          <div class="text-4xl mb-4">🔍</div>
          <div class="text-lg mb-2">User Agent 解析</div>
          <div class="text-sm">输入 User Agent 字符串后将显示解析结果</div>
        </div>
      </div>
    </div>

    <div v-if="batchResults.length > 0" class="bg-white dark:bg-gray-800 border rounded-lg">
      <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
        <h4 class="font-medium">批量解析结果 ({{ batchResults.length }})</h4>
        <button @click="clearBatchResults" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空结果</button>
      </div>
      <div class="p-4">
        <div class="space-y-3 max-h-64 overflow-y-auto">
          <div v-for="(result, index) in batchResults" :key="index" class="bg-gray-50 dark:bg-gray-700 rounded p-3">
            <div class="flex items-center justify-between mb-2">
              <div class="text-sm font-medium">{{ result.browser.name }} {{ result.browser.version }} - {{ result.os.name }}</div>
              <div class="text-xs text-gray-500">{{ result.device.type || 'desktop' }}</div>
            </div>
            <div class="text-xs text-gray-600 dark:text-gray-400 font-mono truncate">{{ result.originalUA }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 border rounded-lg">
      <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
        <h4 class="font-medium">解析历史</h4>
        <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空历史</button>
      </div>
      <div class="p-4">
        <div v-if="parseHistory.length > 0" class="space-y-2 max-h-32 overflow-y-auto">
          <div v-for="(history, index) in parseHistory.slice(0, 10)" :key="index" class="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div class="flex-1 min-w-0">
              <div class="font-medium">{{ history.browser }} {{ history.version }} - {{ history.os }}</div>
              <div class="text-xs text-gray-500">{{ history.timestamp }}</div>
            </div>
            <div class="flex gap-1">
              <button @click="loadFromHistory(history)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-500 text-sm">暂无解析历史</div>
      </div>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h3 class="font-medium mb-3">User Agent 说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
        <div>
          <h4 class="font-medium mb-2">什么是 User Agent</h4>
          <p class="mb-2">User Agent 是浏览器向服务器发送的标识字符串，包含浏览器类型、版本、操作系统等信息。</p>
          <p>服务器可以根据这些信息提供适配的内容和功能。</p>
        </div>
        <div>
          <h4 class="font-medium mb-2">常见用途</h4>
          <ul class="space-y-1">
            <li>• 网站兼容性检测</li>
            <li>• 移动端适配</li>
            <li>• 统计分析</li>
            <li>• 安全防护</li>
            <li>• 功能特性检测</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface ParsedUA {
  browser: {
    name: string;
    version: string;
    major: string;
  };
  engine: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
  };
  device: {
    type: string;
    vendor: string;
    model: string;
  };
  cpu: {
    architecture: string;
  };
}

interface ParseHistory {
  ua: string;
  browser: string;
  version: string;
  os: string;
  timestamp: string;
}

interface BatchResult extends ParsedUA {
  originalUA: string;
}

const userAgent = ref('');
const batchInput = ref('');
const parsedResult = ref<ParsedUA | null>(null);
const parseHistory = ref<ParseHistory[]>([]);
const batchResults = ref<BatchResult[]>([]);

const sampleUserAgents = [
  {
    name: 'Chrome (Windows)',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
  {
    name: 'Firefox (Windows)',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
  },
  {
    name: 'Safari (macOS)',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15'
  },
  {
    name: 'Edge (Windows)',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
  },
  {
    name: 'Chrome Mobile (Android)',
    ua: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
  },
  {
    name: 'Safari Mobile (iOS)',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1'
  },
  {
    name: 'Googlebot',
    ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
  }
];

function parseUserAgent() {
  if (!userAgent.value.trim()) {
    parsedResult.value = null;
    return;
  }

  const ua = userAgent.value;
  const result: ParsedUA = {
    browser: { name: '', version: '', major: '' },
    engine: { name: '', version: '' },
    os: { name: '', version: '' },
    device: { type: '', vendor: '', model: '' },
    cpu: { architecture: '' }
  };

  // 解析浏览器
  const browserPatterns = [
    { name: 'Chrome', pattern: /Chrome\/([0-9.]+)/ },
    { name: 'Firefox', pattern: /Firefox\/([0-9.]+)/ },
    { name: 'Safari', pattern: /Version\/([0-9.]+).*Safari/ },
    { name: 'Edge', pattern: /Edg\/([0-9.]+)/ },
    { name: 'Opera', pattern: /OPR\/([0-9.]+)/ },
    { name: 'Internet Explorer', pattern: /MSIE ([0-9.]+)/ },
    { name: 'Internet Explorer', pattern: /Trident.*rv:([0-9.]+)/ }
  ];

  for (const browser of browserPatterns) {
    const match = ua.match(browser.pattern);
    if (match) {
      result.browser.name = browser.name;
      result.browser.version = match[1];
      result.browser.major = match[1].split('.')[0];
      break;
    }
  }

  // 解析引擎
  const enginePatterns = [
    { name: 'WebKit', pattern: /WebKit\/([0-9.]+)/ },
    { name: 'Gecko', pattern: /Gecko\/([0-9.]+)/ },
    { name: 'Trident', pattern: /Trident\/([0-9.]+)/ },
    { name: 'Presto', pattern: /Presto\/([0-9.]+)/ }
  ];

  for (const engine of enginePatterns) {
    const match = ua.match(engine.pattern);
    if (match) {
      result.engine.name = engine.name;
      result.engine.version = match[1];
      break;
    }
  }

  // 解析操作系统
  const osPatterns = [
    { name: 'Windows 11', pattern: /Windows NT 10\.0.*WOW64|Windows NT 10\.0.*Win64/ },
    { name: 'Windows 10', pattern: /Windows NT 10\.0/ },
    { name: 'Windows 8.1', pattern: /Windows NT 6\.3/ },
    { name: 'Windows 8', pattern: /Windows NT 6\.2/ },
    { name: 'Windows 7', pattern: /Windows NT 6\.1/ },
    { name: 'macOS', pattern: /Mac OS X ([0-9_]+)/ },
    { name: 'iOS', pattern: /iPhone OS ([0-9_]+)/ },
    { name: 'Android', pattern: /Android ([0-9.]+)/ },
    { name: 'Linux', pattern: /Linux/ },
    { name: 'Ubuntu', pattern: /Ubuntu/ }
  ];

  for (const os of osPatterns) {
    const match = ua.match(os.pattern);
    if (match) {
      result.os.name = os.name;
      if (match[1]) {
        result.os.version = match[1].replace(/_/g, '.');
      }
      break;
    }
  }

  // 解析设备类型
  if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(ua)) {
    if (/iPad|Tablet/i.test(ua)) {
      result.device.type = 'tablet';
    } else {
      result.device.type = 'mobile';
    }
  } else {
    result.device.type = 'desktop';
  }

  // 解析设备厂商和型号
  const devicePatterns = [
    { vendor: 'Apple', pattern: /(iPhone|iPad|iPod)/ },
    { vendor: 'Samsung', pattern: /SM-[A-Z0-9]+/ },
    { vendor: 'Huawei', pattern: /(HUAWEI|Honor)/ },
    { vendor: 'Xiaomi', pattern: /(MI|Redmi)/ },
    { vendor: 'OnePlus', pattern: /OnePlus/ }
  ];

  for (const device of devicePatterns) {
    const match = ua.match(device.pattern);
    if (match) {
      result.device.vendor = device.vendor;
      result.device.model = match[0];
      break;
    }
  }

  // 解析 CPU 架构
  if (/x86_64|Win64|WOW64|x64/i.test(ua)) {
    result.cpu.architecture = 'x64';
  } else if (/ARM|aarch64/i.test(ua)) {
    result.cpu.architecture = 'ARM';
  } else if (/x86|i386|i686/i.test(ua)) {
    result.cpu.architecture = 'x86';
  }

  parsedResult.value = result;
  addToHistory(result);
}

function addToHistory(result: ParsedUA) {
  const historyItem: ParseHistory = {
    ua: userAgent.value,
    browser: `${result.browser.name}`,
    version: result.browser.version,
    os: result.os.name,
    timestamp: new Date().toLocaleString('zh-CN')
  };

  parseHistory.value.unshift(historyItem);
  parseHistory.value = parseHistory.value.slice(0, 50);
  saveHistory();
}

function loadFromHistory(history: ParseHistory) {
  userAgent.value = history.ua;
  parseUserAgent();
}

function clearHistory() {
  parseHistory.value = [];
  saveHistory();
}

function useCurrentUA() {
  userAgent.value = navigator.userAgent;
  parseUserAgent();
}

function loadSample() {
  const sample = sampleUserAgents[Math.floor(Math.random() * sampleUserAgents.length)];
  userAgent.value = sample.ua;
  parseUserAgent();
}

function loadSampleUA(ua: string) {
  userAgent.value = ua;
  parseUserAgent();
}

function clearInput() {
  userAgent.value = '';
  parsedResult.value = null;
}

function parseBatch() {
  if (!batchInput.value.trim()) return;

  const lines = batchInput.value.split('\n').filter((line) => line.trim());
  batchResults.value = [];

  for (const line of lines) {
    const originalUA = userAgent.value;
    userAgent.value = line.trim();
    parseUserAgent();

    if (parsedResult.value) {
      batchResults.value.push({
        ...parsedResult.value,
        originalUA: line.trim()
      });
    }
  }

  userAgent.value = originalUA;
  parseUserAgent();
}

function clearBatchResults() {
  batchResults.value = [];
}

function exportBatchResults() {
  if (batchResults.value.length === 0) return;

  const data = batchResults.value.map((result) => ({
    userAgent: result.originalUA,
    browser: `${result.browser.name} ${result.browser.version}`,
    os: `${result.os.name} ${result.os.version}`,
    device: result.device.type,
    vendor: result.device.vendor,
    model: result.device.model
  }));

  const csv = ['User Agent,Browser,OS,Device Type,Vendor,Model', ...data.map((row) => `"${row.userAgent}","${row.browser}","${row.os}","${row.device}","${row.vendor}","${row.model}"`)].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'user-agent-analysis.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function copyResult() {
  if (!parsedResult.value) return;

  try {
    await navigator.clipboard.writeText(JSON.stringify(parsedResult.value, null, 2));
  } catch (error) {
    console.error('复制失败:', error);
  }
}

function getBrowserIcon(browserName: string): string {
  const icons: Record<string, string> = {
    Chrome: '🌐',
    Firefox: '🦊',
    Safari: '🧭',
    Edge: '🔷',
    Opera: '🎭',
    'Internet Explorer': '🌍'
  };
  return icons[browserName] || '🌐';
}

function getOSIcon(osName: string): string {
  const icons: Record<string, string> = {
    'Windows 11': '🪟',
    'Windows 10': '🪟',
    'Windows 8.1': '🪟',
    'Windows 8': '🪟',
    'Windows 7': '🪟',
    macOS: '🍎',
    iOS: '📱',
    Android: '🤖',
    Linux: '🐧',
    Ubuntu: '🟠'
  };
  return icons[osName] || '💻';
}

function getDeviceIcon(deviceType: string): string {
  const icons: Record<string, string> = {
    mobile: '📱',
    tablet: '📱',
    desktop: '💻'
  };
  return icons[deviceType] || '💻';
}

function isBot(ua: string): boolean {
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
    /baiduspider/i,
    /yandexbot/i,
    /facebookexternalhit/i,
    /twitterbot/i,
    /linkedinbot/i,
    /whatsapp/i
  ];
  return botPatterns.some((pattern) => pattern.test(ua));
}

function isWebView(ua: string): boolean {
  return /wv|WebView|; wv\)|Version.*Chrome/i.test(ua) && !/Chrome\/[.0-9]* Mobile/i.test(ua);
}

function saveHistory() {
  try {
    localStorage.setItem('ua-parse-history', JSON.stringify(parseHistory.value));
  } catch (error) {
    console.error('保存历史记录失败:', error);
  }
}

function loadHistory() {
  try {
    const saved = localStorage.getItem('ua-parse-history');
    if (saved) {
      parseHistory.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error('加载历史记录失败:', error);
  }
}

onMounted(() => {
  loadHistory();
});
</script>
