<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">文件哈希计算器</h3>

        <div class="space-y-3">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">文件选择</h4>
            <div class="space-y-3">
              <div
                @drop="handleDrop"
                @dragover.prevent
                @dragenter.prevent
                class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
                :class="{ 'border-blue-400 bg-blue-50 dark:bg-blue-900/20': isDragging }"
              >
                <div class="text-4xl mb-4">📁</div>
                <div class="text-lg mb-2">拖拽文件到此处</div>
                <div class="text-sm text-gray-500 mb-4">或点击下方按钮选择文件</div>
                <input ref="fileInput" type="file" multiple class="hidden" @change="handleFileSelect" />
                <button @click="$refs.fileInput?.click()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">选择文件</button>
              </div>

              <div v-if="selectedFiles.length > 0" class="space-y-2">
                <h5 class="font-medium">已选择的文件 ({{ selectedFiles.length }})</h5>
                <div class="max-h-32 overflow-y-auto space-y-1">
                  <div v-for="(file, index) in selectedFiles" :key="index" class="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded border text-sm">
                    <div class="flex-1 min-w-0">
                      <div class="font-medium truncate">{{ file.name }}</div>
                      <div class="text-gray-500">{{ formatFileSize(file.size) }}</div>
                    </div>
                    <button @click="removeFile(index)" class="ml-2 px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">移除</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">哈希算法选择</h4>
            <div class="space-y-2">
              <div class="grid grid-cols-2 gap-2">
                <label v-for="algorithm in algorithms" :key="algorithm" class="flex items-center space-x-2">
                  <input v-model="selectedAlgorithms" :value="algorithm" type="checkbox" class="rounded" />
                  <span class="text-sm">{{ algorithm }}</span>
                </label>
              </div>
              <div class="flex gap-2 mt-3">
                <button @click="selectAllAlgorithms" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">全选</button>
                <button @click="clearAlgorithms" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空</button>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button
              @click="calculateHashes"
              :disabled="selectedFiles.length === 0 || selectedAlgorithms.length === 0 || isCalculating"
              class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md"
            >
              {{ isCalculating ? '计算中...' : '计算哈希值' }}
            </button>
            <button @click="clearAll" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">清空全部</button>
          </div>

          <div v-if="isCalculating" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div class="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <div class="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span class="text-sm">正在计算哈希值... {{ progress.current }}/{{ progress.total }}</span>
            </div>
            <div class="mt-2 w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" :style="{ width: `${(progress.current / progress.total) * 100}%` }" />
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">计算结果</h3>

        <div v-if="results.length > 0" class="space-y-4">
          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
              <div class="flex justify-between items-center">
                <span class="font-medium text-sm">哈希结果 ({{ results.length }} 个文件)</span>
                <div class="flex gap-2">
                  <button @click="exportResults" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">导出</button>
                  <button @click="copyAllResults" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">复制全部</button>
                </div>
              </div>
            </div>

            <div class="max-h-96 overflow-y-auto">
              <div v-for="(result, index) in results" :key="index" class="border-b last:border-b-0">
                <div class="p-4">
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1 min-w-0">
                      <h5 class="font-medium truncate">{{ result.fileName }}</h5>
                      <div class="text-sm text-gray-500">
                        {{ formatFileSize(result.fileSize) }} |
                        {{ new Date(result.timestamp).toLocaleString('zh-CN') }}
                      </div>
                    </div>
                  </div>

                  <div class="space-y-2">
                    <div v-for="(hash, algorithm) in result.hashes" :key="algorithm" class="bg-gray-50 dark:bg-gray-700 rounded p-3">
                      <div class="flex items-center justify-between mb-1">
                        <span class="text-sm font-medium">{{ algorithm }}</span>
                        <button @click="copyHash(hash)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">复制</button>
                      </div>
                      <div class="font-mono text-xs break-all text-gray-700 dark:text-gray-300">
                        {{ hash }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">哈希值验证</h4>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium mb-1">输入已知哈希值进行验证</label>
                <input
                  v-model="verificationHash"
                  type="text"
                  class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
                  placeholder="输入要验证的哈希值..."
                />
              </div>

              <div v-if="verificationHash" class="space-y-2">
                <div v-for="result in results" :key="result.fileName" class="bg-white dark:bg-gray-700 rounded p-3">
                  <div class="font-medium text-sm mb-2">{{ result.fileName }}</div>
                  <div class="space-y-1">
                    <div v-for="(hash, algorithm) in result.hashes" :key="algorithm" class="flex items-center justify-between text-sm">
                      <span>{{ algorithm }}:</span>
                      <span :class="hash.toLowerCase() === verificationHash.toLowerCase() ? 'text-green-600 font-medium' : 'text-gray-500'">
                        {{ hash.toLowerCase() === verificationHash.toLowerCase() ? '✓ 匹配' : '✗ 不匹配' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">🔐</div>
          <div class="text-lg mb-2">文件哈希计算器</div>
          <div class="text-sm">选择文件并计算哈希值</div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">支持的哈希算法</h4>
          <ul class="space-y-1">
            <li>• MD5: 128位，快速但不够安全</li>
            <li>• SHA-1: 160位，已被破解</li>
            <li>• SHA-256: 256位，安全性高</li>
            <li>• SHA-384: 384位，高安全性</li>
            <li>• SHA-512: 512位，最高安全性</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">使用场景</h4>
          <ul class="space-y-1">
            <li>• 文件完整性验证</li>
            <li>• 下载文件校验</li>
            <li>• 重复文件检测</li>
            <li>• 数字签名验证</li>
            <li>• 安全审计</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface HashResult {
  fileName: string;
  fileSize: number;
  timestamp: number;
  hashes: { [algorithm: string]: string };
}

interface Progress {
  current: number;
  total: number;
}

const fileInput = ref<HTMLInputElement>();
const selectedFiles = ref<File[]>([]);
const selectedAlgorithms = ref<string[]>(['MD5', 'SHA-256']);
const results = ref<HashResult[]>([]);
const verificationHash = ref('');
const isCalculating = ref(false);
const isDragging = ref(false);
const progress = ref<Progress>({ current: 0, total: 0 });

const algorithms = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

function handleDrop(event: DragEvent) {
  event.preventDefault();
  isDragging.value = false;

  const files = Array.from(event.dataTransfer?.files || []);
  addFiles(files);
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  addFiles(files);
}

function addFiles(files: File[]) {
  // 避免重复添加相同文件
  const existingNames = new Set(selectedFiles.value.map((f) => f.name));
  const newFiles = files.filter((f) => !existingNames.has(f.name));
  selectedFiles.value.push(...newFiles);
}

function removeFile(index: number) {
  selectedFiles.value.splice(index, 1);
}

function selectAllAlgorithms() {
  selectedAlgorithms.value = [...algorithms];
}

function clearAlgorithms() {
  selectedAlgorithms.value = [];
}

function clearAll() {
  selectedFiles.value = [];
  results.value = [];
  verificationHash.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

async function calculateHashes() {
  if (selectedFiles.value.length === 0 || selectedAlgorithms.value.length === 0) {
    return;
  }

  isCalculating.value = true;
  results.value = [];
  progress.value = { current: 0, total: selectedFiles.value.length };

  for (let i = 0; i < selectedFiles.value.length; i++) {
    const file = selectedFiles.value[i];
    progress.value.current = i;

    try {
      const hashes: { [algorithm: string]: string } = {};

      for (const algorithm of selectedAlgorithms.value) {
        const hash = await calculateFileHash(file, algorithm);
        hashes[algorithm] = hash;
      }

      results.value.push({
        fileName: file.name,
        fileSize: file.size,
        timestamp: Date.now(),
        hashes
      });
    } catch (error) {
      console.error(`计算文件 ${file.name} 的哈希值时出错:`, error);
    }
  }

  progress.value.current = selectedFiles.value.length;
  isCalculating.value = false;
}

async function calculateFileHash(file: File, algorithm: string): Promise<string> {
  const buffer = await file.arrayBuffer();

  let hashAlgorithm: string;
  switch (algorithm) {
    case 'MD5':
      // 浏览器不直接支持MD5，使用SHA-256代替并标注
      hashAlgorithm = 'SHA-256';
      break;
    case 'SHA-1':
      hashAlgorithm = 'SHA-1';
      break;
    case 'SHA-256':
      hashAlgorithm = 'SHA-256';
      break;
    case 'SHA-384':
      hashAlgorithm = 'SHA-384';
      break;
    case 'SHA-512':
      hashAlgorithm = 'SHA-512';
      break;
    default:
      hashAlgorithm = 'SHA-256';
  }

  const hashBuffer = await crypto.subtle.digest(hashAlgorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  // 如果是MD5请求但实际使用SHA-256，添加标注
  if (algorithm === 'MD5' && hashAlgorithm === 'SHA-256') {
    return `${hashHex} (使用SHA-256代替MD5)`;
  }

  return hashHex;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

async function copyHash(hash: string) {
  try {
    await navigator.clipboard.writeText(hash);
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error);
  }
}

async function copyAllResults() {
  const text = results.value
    .map((result) => {
      const hashLines = Object.entries(result.hashes)
        .map(([algorithm, hash]) => `${algorithm}: ${hash}`)
        .join('\n');

      return `文件: ${result.fileName}\n大小: ${formatFileSize(result.fileSize)}\n${hashLines}\n`;
    })
    .join('\n');

  try {
    await navigator.clipboard.writeText(text);
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error);
  }
}

function exportResults() {
  const report = `文件哈希计算报告
生成时间: ${new Date().toLocaleString('zh-CN')}
文件数量: ${results.value.length}
算法: ${selectedAlgorithms.value.join(', ')}

${results.value
  .map((result, index) => {
    const hashLines = Object.entries(result.hashes)
      .map(([algorithm, hash]) => `  ${algorithm}: ${hash}`)
      .join('\n');

    return `${index + 1}. 文件名: ${result.fileName}
   大小: ${formatFileSize(result.fileSize)}
   时间: ${new Date(result.timestamp).toLocaleString('zh-CN')}
   哈希值:
${hashLines}`;
  })
  .join('\n\n')}

报告生成时间: ${new Date().toLocaleString('zh-CN')}
`;

  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `file-hashes-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>
