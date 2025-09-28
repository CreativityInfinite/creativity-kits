<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">JSON 差异对比</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">原始 JSON (左侧)</label>
            <textarea
              v-model="leftJson"
              rows="12"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
              placeholder="输入原始 JSON 数据..."
              @input="compareJson"
            />
            <div class="flex justify-between items-center mt-1">
              <p class="text-xs text-gray-500">字符数: {{ leftJson.length }}</p>
              <div class="flex gap-1">
                <button @click="formatJson('left')" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">格式化</button>
                <button @click="minifyJson('left')" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">压缩</button>
              </div>
            </div>
            <div v-if="leftError" class="text-red-500 text-xs mt-1">
              {{ leftError }}
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">新版 JSON (右侧)</label>
            <textarea
              v-model="rightJson"
              rows="12"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
              placeholder="输入新版 JSON 数据..."
              @input="compareJson"
            />
            <div class="flex justify-between items-center mt-1">
              <p class="text-xs text-gray-500">字符数: {{ rightJson.length }}</p>
              <div class="flex gap-1">
                <button @click="formatJson('right')" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">格式化</button>
                <button @click="minifyJson('right')" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">压缩</button>
              </div>
            </div>
            <div v-if="rightError" class="text-red-500 text-xs mt-1">
              {{ rightError }}
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="compareJson" :disabled="!leftJson || !rightJson" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">对比差异</button>
            <button @click="swapJson" :disabled="!leftJson || !rightJson" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-md">交换</button>
            <button @click="loadExample" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">示例</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">差异结果</h3>

        <div v-if="differences.length > 0" class="space-y-4">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium">发现 {{ differences.length }} 处差异</h4>
              <div class="flex gap-2">
                <button @click="copyDifferences" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制差异</button>
                <button @click="exportReport" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">导出报告</button>
              </div>
            </div>

            <div class="space-y-2 max-h-96 overflow-y-auto">
              <div
                v-for="(diff, index) in differences"
                :key="index"
                :class="[
                  'p-3 rounded border-l-4',
                  diff.type === 'added'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                    : diff.type === 'removed'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                ]"
              >
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center gap-2">
                    <span
                      :class="[
                        'px-2 py-1 rounded text-xs font-medium',
                        diff.type === 'added'
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : diff.type === 'removed'
                          ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                      ]"
                    >
                      {{ diff.type === 'added' ? '新增' : diff.type === 'removed' ? '删除' : '修改' }}
                    </span>
                    <code class="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">{{ diff.path }}</code>
                  </div>
                  <button @click="copyToClipboard(formatDifference(diff))" class="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs">复制</button>
                </div>

                <div class="space-y-1 text-sm">
                  <div v-if="diff.type === 'removed' || diff.type === 'changed'" class="flex items-start gap-2">
                    <span class="text-red-600 dark:text-red-400 font-medium">- 原值:</span>
                    <code class="flex-1 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded">
                      {{ formatValue(diff.oldValue) }}
                    </code>
                  </div>
                  <div v-if="diff.type === 'added' || diff.type === 'changed'" class="flex items-start gap-2">
                    <span class="text-green-600 dark:text-green-400 font-medium">+ 新值:</span>
                    <code class="flex-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                      {{ formatValue(diff.newValue) }}
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-3">统计信息</h4>
            <div class="grid grid-cols-3 gap-4 text-sm">
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">{{ addedCount }}</div>
                <div class="text-gray-600 dark:text-gray-400">新增</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-red-600">{{ removedCount }}</div>
                <div class="text-gray-600 dark:text-gray-400">删除</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-yellow-600">{{ changedCount }}</div>
                <div class="text-gray-600 dark:text-gray-400">修改</div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="leftJson && rightJson && !leftError && !rightError" class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">✅</div>
          <div class="text-lg mb-2">JSON 完全相同</div>
          <div class="text-sm">两个 JSON 对象没有任何差异</div>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">🔍</div>
          <div class="text-lg mb-2">JSON 差异对比器</div>
          <div class="text-sm">输入两个 JSON 对象进行差异对比</div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">功能说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium text-gray-800 dark:text-gray-200 mb-2">支持的差异类型</h4>
          <ul class="space-y-1">
            <li>• <span class="text-green-600">新增</span> - 右侧 JSON 中新增的字段</li>
            <li>• <span class="text-red-600">删除</span> - 左侧 JSON 中被删除的字段</li>
            <li>• <span class="text-yellow-600">修改</span> - 值发生变化的字段</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium text-gray-800 dark:text-gray-200 mb-2">功能特性</h4>
          <ul class="space-y-1">
            <li>• 深度递归对比嵌套对象和数组</li>
            <li>• 支持 JSON 格式化和压缩</li>
            <li>• 提供详细的路径信息</li>
            <li>• 可导出差异报告</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface JsonDifference {
  type: 'added' | 'removed' | 'changed';
  path: string;
  oldValue?: any;
  newValue?: any;
}

const leftJson = ref('');
const rightJson = ref('');
const leftError = ref('');
const rightError = ref('');
const differences = ref<JsonDifference[]>([]);

const addedCount = computed(() => differences.value.filter((d) => d.type === 'added').length);
const removedCount = computed(() => differences.value.filter((d) => d.type === 'removed').length);
const changedCount = computed(() => differences.value.filter((d) => d.type === 'changed').length);

function compareJson() {
  differences.value = [];
  leftError.value = '';
  rightError.value = '';

  if (!leftJson.value || !rightJson.value) return;

  try {
    const leftObj = JSON.parse(leftJson.value);
    const rightObj = JSON.parse(rightJson.value);

    differences.value = findDifferences(leftObj, rightObj, '');
  } catch (error) {
    if (!isValidJson(leftJson.value)) {
      leftError.value = '左侧 JSON 格式错误';
    }
    if (!isValidJson(rightJson.value)) {
      rightError.value = '右侧 JSON 格式错误';
    }
  }
}

function findDifferences(left: any, right: any, path: string): JsonDifference[] {
  const diffs: JsonDifference[] = [];

  // 处理 null 和 undefined
  if (left === null || left === undefined) {
    if (right !== null && right !== undefined) {
      diffs.push({
        type: 'added',
        path: path || 'root',
        newValue: right
      });
    }
    return diffs;
  }

  if (right === null || right === undefined) {
    diffs.push({
      type: 'removed',
      path: path || 'root',
      oldValue: left
    });
    return diffs;
  }

  // 类型不同
  if (typeof left !== typeof right) {
    diffs.push({
      type: 'changed',
      path: path || 'root',
      oldValue: left,
      newValue: right
    });
    return diffs;
  }

  // 基本类型比较
  if (typeof left !== 'object') {
    if (left !== right) {
      diffs.push({
        type: 'changed',
        path: path || 'root',
        oldValue: left,
        newValue: right
      });
    }
    return diffs;
  }

  // 数组比较
  if (Array.isArray(left) && Array.isArray(right)) {
    const maxLength = Math.max(left.length, right.length);
    for (let i = 0; i < maxLength; i++) {
      const currentPath = path ? `${path}[${i}]` : `[${i}]`;

      if (i >= left.length) {
        diffs.push({
          type: 'added',
          path: currentPath,
          newValue: right[i]
        });
      } else if (i >= right.length) {
        diffs.push({
          type: 'removed',
          path: currentPath,
          oldValue: left[i]
        });
      } else {
        diffs.push(...findDifferences(left[i], right[i], currentPath));
      }
    }
    return diffs;
  }

  // 对象比较
  if (Array.isArray(left) !== Array.isArray(right)) {
    diffs.push({
      type: 'changed',
      path: path || 'root',
      oldValue: left,
      newValue: right
    });
    return diffs;
  }

  // 获取所有键
  const leftKeys = new Set(Object.keys(left));
  const rightKeys = new Set(Object.keys(right));
  const allKeys = new Set([...leftKeys, ...rightKeys]);

  for (const key of allKeys) {
    const currentPath = path ? `${path}.${key}` : key;

    if (!leftKeys.has(key)) {
      diffs.push({
        type: 'added',
        path: currentPath,
        newValue: right[key]
      });
    } else if (!rightKeys.has(key)) {
      diffs.push({
        type: 'removed',
        path: currentPath,
        oldValue: left[key]
      });
    } else {
      diffs.push(...findDifferences(left[key], right[key], currentPath));
    }
  }

  return diffs;
}

function isValidJson(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

function formatJson(side: 'left' | 'right') {
  try {
    const json = side === 'left' ? leftJson.value : rightJson.value;
    const parsed = JSON.parse(json);
    const formatted = JSON.stringify(parsed, null, 2);

    if (side === 'left') {
      leftJson.value = formatted;
      leftError.value = '';
    } else {
      rightJson.value = formatted;
      rightError.value = '';
    }

    compareJson();
  } catch (error) {
    if (side === 'left') {
      leftError.value = 'JSON 格式错误，无法格式化';
    } else {
      rightError.value = 'JSON 格式错误，无法格式化';
    }
  }
}

function minifyJson(side: 'left' | 'right') {
  try {
    const json = side === 'left' ? leftJson.value : rightJson.value;
    const parsed = JSON.parse(json);
    const minified = JSON.stringify(parsed);

    if (side === 'left') {
      leftJson.value = minified;
      leftError.value = '';
    } else {
      rightJson.value = minified;
      rightError.value = '';
    }

    compareJson();
  } catch (error) {
    if (side === 'left') {
      leftError.value = 'JSON 格式错误，无法压缩';
    } else {
      rightError.value = 'JSON 格式错误，无法压缩';
    }
  }
}

function swapJson() {
  const temp = leftJson.value;
  leftJson.value = rightJson.value;
  rightJson.value = temp;

  const tempError = leftError.value;
  leftError.value = rightError.value;
  rightError.value = tempError;

  compareJson();
}

function loadExample() {
  leftJson.value = JSON.stringify(
    {
      name: '张三',
      age: 25,
      email: 'zhangsan@example.com',
      address: {
        city: '北京',
        district: '朝阳区'
      },
      hobbies: ['读书', '游泳'],
      active: true
    },
    null,
    2
  );

  rightJson.value = JSON.stringify(
    {
      name: '张三',
      age: 26,
      email: 'zhangsan@newdomain.com',
      phone: '13812345678',
      address: {
        city: '上海',
        district: '浦东新区',
        street: '世纪大道123号'
      },
      hobbies: ['读书', '跑步', '摄影'],
      active: true,
      vip: true
    },
    null,
    2
  );

  compareJson();
}

function clearAll() {
  leftJson.value = '';
  rightJson.value = '';
  leftError.value = '';
  rightError.value = '';
  differences.value = [];
}

function formatValue(value: any): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function formatDifference(diff: JsonDifference): string {
  let result = `路径: ${diff.path}\n类型: ${diff.type === 'added' ? '新增' : diff.type === 'removed' ? '删除' : '修改'}\n`;

  if (diff.oldValue !== undefined) {
    result += `原值: ${formatValue(diff.oldValue)}\n`;
  }
  if (diff.newValue !== undefined) {
    result += `新值: ${formatValue(diff.newValue)}\n`;
  }

  return result;
}

function copyDifferences() {
  const report = differences.value.map(formatDifference).join('\n---\n');
  copyToClipboard(report);
}

function exportReport() {
  const report = `JSON 差异对比报告
生成时间: ${new Date().toLocaleString()}

统计信息:
- 新增: ${addedCount.value} 项
- 删除: ${removedCount.value} 项  
- 修改: ${changedCount.value} 项
- 总计: ${differences.value.length} 项差异

详细差异:
${differences.value.map((diff, index) => `${index + 1}. ${formatDifference(diff)}`).join('\n')}
`;

  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `json-diff-report-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function copyToClipboard(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      // 可以添加成功提示
    })
    .catch((err) => {
      console.error('复制失败:', err);
    });
}
</script>
