<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">Glob 模式测试器</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">Glob 模式</h4>
            <div class="flex gap-2">
              <button @click="clearPattern" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空</button>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <input
                v-model="globPattern"
                type="text"
                placeholder="输入 Glob 模式，如 *.js 或 **/*.vue"
                class="w-full px-3 py-2 border rounded-lg text-sm font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="testGlob"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium mb-2">匹配选项</label>
                <div class="space-y-2">
                  <label class="flex items-center space-x-2">
                    <input v-model="options.caseSensitive" type="checkbox" @change="testGlob" />
                    <span class="text-sm">区分大小写</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="options.dot" type="checkbox" @change="testGlob" />
                    <span class="text-sm">匹配隐藏文件</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="options.matchBase" type="checkbox" @change="testGlob" />
                    <span class="text-sm">基础名匹配</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="options.nocase" type="checkbox" @change="testGlob" />
                    <span class="text-sm">忽略大小写</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">高级选项</label>
                <div class="space-y-2">
                  <label class="flex items-center space-x-2">
                    <input v-model="options.nobrace" type="checkbox" @change="testGlob" />
                    <span class="text-sm">禁用花括号展开</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="options.noglobstar" type="checkbox" @change="testGlob" />
                    <span class="text-sm">禁用 ** 匹配</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="options.noext" type="checkbox" @change="testGlob" />
                    <span class="text-sm">禁用扩展匹配</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="options.nonegate" type="checkbox" @change="testGlob" />
                    <span class="text-sm">禁用否定模式</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">路径分隔符</label>
              <select v-model="options.separator" @change="testGlob" class="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="/">/（Unix/Linux）</option>
                <option value="\">\（Windows）</option>
                <option value="auto">自动检测</option>
              </select>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">测试路径</h4>
            <div class="flex gap-2">
              <button @click="clearPaths" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空</button>
              <button @click="addPath" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">添加路径</button>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <textarea
                v-model="pathsText"
                rows="8"
                placeholder="输入要测试的文件路径，每行一个&#10;例如：&#10;src/components/Button.vue&#10;src/utils/helper.js&#10;docs/README.md"
                class="w-full px-3 py-2 border rounded-lg text-sm font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="testGlob"
                @drop="handleFileDrop"
                @dragover.prevent
                @dragenter.prevent
              ></textarea>
            </div>

            <div class="flex justify-between items-center text-sm text-gray-500">
              <span>路径数量: {{ pathsList.length }}</span>
              <span>匹配数量: {{ matchedPaths.length }}</span>
              <span>匹配率: {{ matchRate }}%</span>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">快速操作</h4>
          <div class="grid grid-cols-2 gap-2">
            <button @click="loadSampleGlob" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">加载示例</button>
            <button @click="testManually" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">手动测试</button>
            <button @click="explainGlob" class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm">解释模式</button>
            <button @click="generateRegex" class="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm">生成正则</button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">常用 Glob 模式</h4>
          <div class="grid grid-cols-1 gap-2">
            <button v-for="(pattern, name) in commonGlobs" :key="name" @click="loadGlobPattern(pattern, name)" class="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm text-left">
              <div class="font-medium">{{ name }}</div>
              <div class="text-xs opacity-75 font-mono">{{ pattern.glob }}</div>
              <div class="text-xs opacity-60">{{ pattern.description }}</div>
            </button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">文件操作</h4>
          <div class="grid grid-cols-2 gap-2">
            <label class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm cursor-pointer text-center">
              <input type="file" accept=".txt,.log,.csv" @change="handleFileUpload" class="hidden" />
              上传路径列表
            </label>
            <button @click="downloadResults" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载结果</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">测试结果</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">匹配结果</h4>
            <div class="flex gap-2">
              <button @click="copyResults" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制结果</button>
              <button @click="toggleView" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">
                {{ viewMode === 'matched' ? '显示全部' : '仅匹配' }}
              </button>
            </div>
          </div>
          <div class="p-4">
            <div v-if="testResult" class="space-y-3">
              <div class="grid grid-cols-3 gap-4 text-sm">
                <div class="text-center p-2 bg-green-50 dark:bg-green-900 rounded">
                  <div class="font-medium text-green-600">匹配</div>
                  <div class="text-lg font-bold">{{ testResult.matched }}</div>
                </div>
                <div class="text-center p-2 bg-red-50 dark:bg-red-900 rounded">
                  <div class="font-medium text-red-600">不匹配</div>
                  <div class="text-lg font-bold">{{ testResult.unmatched }}</div>
                </div>
                <div class="text-center p-2 bg-blue-50 dark:bg-blue-900 rounded">
                  <div class="font-medium text-blue-600">总计</div>
                  <div class="text-lg font-bold">{{ testResult.total }}</div>
                </div>
              </div>

              <div class="max-h-96 overflow-y-auto">
                <div v-if="displayPaths.length > 0" class="space-y-1">
                  <div
                    v-for="(path, index) in displayPaths"
                    :key="index"
                    class="flex items-center justify-between p-2 rounded text-sm"
                    :class="path.matched ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900'"
                  >
                    <div class="flex items-center space-x-2 flex-1 min-w-0">
                      <div class="w-2 h-2 rounded-full flex-shrink-0" :class="path.matched ? 'bg-green-500' : 'bg-red-500'"></div>
                      <span class="font-mono truncate">{{ path.path }}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span
                        class="px-2 py-1 rounded text-xs"
                        :class="path.matched ? 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200' : 'bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-200'"
                      >
                        {{ path.matched ? '匹配' : '不匹配' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-8 text-gray-500">
                  {{ viewMode === 'matched' ? '没有匹配的路径' : '没有测试路径' }}
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">输入 Glob 模式和测试路径后将显示结果</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg" v-if="globExplanation">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">模式解释</h4>
          </div>
          <div class="p-4">
            <div class="space-y-2 text-sm">
              <div v-for="(explanation, index) in globExplanation" :key="index" class="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="flex justify-between items-center">
                  <span class="font-mono">{{ explanation.pattern }}</span>
                  <span class="text-gray-500">{{ explanation.description }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg" v-if="generatedRegex">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">生成的正则表达式</h4>
            <button @click="copyRegex" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制正则</button>
          </div>
          <div class="p-4">
            <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 text-sm font-mono break-all">
              {{ generatedRegex }}
            </div>
            <div class="mt-2 text-xs text-gray-500">注意：生成的正则表达式可能不完全等价于 Glob 模式，仅供参考</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">匹配统计</h4>
          </div>
          <div class="p-4">
            <div v-if="testResult" class="grid grid-cols-2 gap-4 text-sm">
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span>匹配率:</span>
                  <span class="font-mono">{{ matchRate }}%</span>
                </div>
                <div class="flex justify-between">
                  <span>匹配路径:</span>
                  <span class="font-mono">{{ testResult.matched }}</span>
                </div>
                <div class="flex justify-between">
                  <span>不匹配路径:</span>
                  <span class="font-mono">{{ testResult.unmatched }}</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span>总路径数:</span>
                  <span class="font-mono">{{ testResult.total }}</span>
                </div>
                <div class="flex justify-between">
                  <span>平均路径长度:</span>
                  <span class="font-mono">{{ averagePathLength }}</span>
                </div>
                <div class="flex justify-between">
                  <span>最长路径:</span>
                  <span class="font-mono">{{ maxPathLength }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">测试后将显示统计信息</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">测试历史</h4>
            <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空历史</button>
          </div>
          <div class="p-4">
            <div v-if="testHistory.length > 0" class="space-y-2 max-h-32 overflow-y-auto">
              <div v-for="(history, index) in testHistory.slice(0, 5)" :key="index" class="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-xs truncate">{{ history.pattern }}</div>
                  <div class="text-xs text-gray-500">{{ history.timestamp }} - {{ history.matched }}/{{ history.total }} 匹配</div>
                </div>
                <div class="flex gap-1">
                  <button @click="loadFromHistory(history)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">暂无测试历史</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">基础通配符</h4>
          <ul class="space-y-1">
            <li>• <strong>*</strong> 匹配任意字符（不包括路径分隔符）</li>
            <li>• <strong>?</strong> 匹配单个字符</li>
            <li>• <strong>**</strong> 匹配任意层级目录</li>
            <li>• <strong>[abc]</strong> 匹配字符集中的任意字符</li>
            <li>• <strong>[a-z]</strong> 匹配字符范围</li>
            <li>• <strong>[!abc]</strong> 匹配不在字符集中的字符</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">高级模式</h4>
          <ul class="space-y-1">
            <li>• <strong>{js,ts}</strong> 花括号展开，匹配多个选项</li>
            <li>• <strong>!(pattern)</strong> 否定模式</li>
            <li>• <strong>?(pattern)</strong> 可选模式</li>
            <li>• <strong>+(pattern)</strong> 一次或多次</li>
            <li>• <strong>*(pattern)</strong> 零次或多次</li>
            <li>• <strong>@(pattern)</strong> 精确一次</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">常见用例</h4>
          <ul class="space-y-1">
            <li>• <strong>*.js</strong> 所有 JS 文件</li>
            <li>• <strong>**/*.vue</strong> 所有 Vue 文件</li>
            <li>• <strong>src/**</strong> src 目录下所有文件</li>
            <li>• <strong>!node_modules</strong> 排除 node_modules</li>
            <li>• <strong>*.{js,ts}</strong> JS 或 TS 文件</li>
            <li>• <strong>test/**/*.spec.js</strong> 测试文件</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface GlobOptions {
  caseSensitive: boolean
  dot: boolean
  matchBase: boolean
  nocase: boolean
  nobrace: boolean
  noglobstar: boolean
  noext: boolean
  nonegate: boolean
  separator: string
}

interface PathResult {
  path: string
  matched: boolean
}

interface TestResult {
  matched: number
  unmatched: number
  total: number
  paths: PathResult[]
}

interface TestHistory {
  pattern: string
  paths: string[]
  timestamp: string
  matched: number
  total: number
}

interface GlobExplanation {
  pattern: string
  description: string
}

interface CommonGlob {
  glob: string
  description: string
  sample: string[]
}

const globPattern = ref('')
const pathsText = ref('')
const viewMode = ref<'all' | 'matched'>('all')
const globExplanation = ref<GlobExplanation[]>([])
const generatedRegex = ref('')

const options = ref<GlobOptions>({
  caseSensitive: true,
  dot: false,
  matchBase: false,
  nocase: false,
  nobrace: false,
  noglobstar: false,
  noext: false,
  nonegate: false,
  separator: '/'
})

const testHistory = ref<TestHistory[]>([])
const testResult = ref<TestResult | null>(null)

const pathsList = computed(() => {
  return pathsText.value
    .split('\n')
    .map((path) => path.trim())
    .filter((path) => path.length > 0)
})

const matchedPaths = computed(() => {
  return testResult.value?.paths.filter((p) => p.matched) || []
})

const matchRate = computed(() => {
  if (!testResult.value || testResult.value.total === 0) return 0
  return Math.round((testResult.value.matched / testResult.value.total) * 100)
})

const averagePathLength = computed(() => {
  if (pathsList.value.length === 0) return 0
  const totalLength = pathsList.value.reduce((sum, path) => sum + path.length, 0)
  return Math.round(totalLength / pathsList.value.length)
})

const maxPathLength = computed(() => {
  if (pathsList.value.length === 0) return 0
  return Math.max(...pathsList.value.map((path) => path.length))
})

const displayPaths = computed(() => {
  if (!testResult.value) return []

  if (viewMode.value === 'matched') {
    return testResult.value.paths.filter((p) => p.matched)
  }

  return testResult.value.paths
})

const commonGlobs: Record<string, CommonGlob> = {
  'JavaScript 文件': {
    glob: '**/*.{js,jsx}',
    description: '匹配所有 JavaScript 文件',
    sample: ['src/app.js', 'components/Button.jsx', 'utils/helper.js']
  },
  'TypeScript 文件': {
    glob: '**/*.{ts,tsx}',
    description: '匹配所有 TypeScript 文件',
    sample: ['src/main.ts', 'components/App.tsx', 'types/index.ts']
  },
  'Vue 组件': {
    glob: '**/*.vue',
    description: '匹配所有 Vue 组件文件',
    sample: ['src/App.vue', 'components/Header.vue', 'pages/Home.vue']
  },
  样式文件: {
    glob: '**/*.{css,scss,sass,less}',
    description: '匹配所有样式文件',
    sample: ['src/style.css', 'assets/main.scss', 'components/button.less']
  },
  图片文件: {
    glob: '**/*.{jpg,jpeg,png,gif,svg,webp}',
    description: '匹配所有图片文件',
    sample: ['assets/logo.png', 'images/hero.jpg', 'icons/star.svg']
  },
  测试文件: {
    glob: '**/*.{test,spec}.{js,ts}',
    description: '匹配所有测试文件',
    sample: ['tests/app.test.js', 'src/utils.spec.ts', '__tests__/component.test.js']
  },
  配置文件: {
    glob: '*.{json,yml,yaml,toml,ini}',
    description: '匹配根目录配置文件',
    sample: ['package.json', 'config.yml', 'settings.toml']
  },
  '排除 node_modules': {
    glob: '!node_modules/**',
    description: '排除 node_modules 目录',
    sample: ['src/app.js', 'package.json', '!node_modules/lodash/index.js']
  },
  源码目录: {
    glob: 'src/**/*',
    description: '匹配 src 目录下所有文件',
    sample: ['src/main.js', 'src/components/App.vue', 'src/utils/helper.ts']
  },
  隐藏文件: {
    glob: '.*',
    description: '匹配隐藏文件（需启用 dot 选项）',
    sample: ['.gitignore', '.env', '.eslintrc.js']
  }
}

watch(
  [globPattern, pathsText, () => options.value],
  () => {
    if (globPattern.value && pathsList.value.length > 0) {
      testGlob()
    }
  },
  { deep: true }
)

function testGlob() {
  if (!globPattern.value || pathsList.value.length === 0) {
    testResult.value = null
    return
  }

  try {
    const results: PathResult[] = []

    for (const path of pathsList.value) {
      const matched = matchGlob(globPattern.value, path)
      results.push({ path, matched })
    }

    const matched = results.filter((r) => r.matched).length
    const total = results.length

    testResult.value = {
      matched,
      unmatched: total - matched,
      total,
      paths: results
    }

    // 添加到历史记录
    addToHistory(globPattern.value, pathsList.value, matched, total)
  } catch (error) {
    console.error('Glob 测试失败:', error)
    testResult.value = null
  }
}

function matchGlob(pattern: string, path: string): boolean {
  // 简化的 Glob 匹配实现
  // 在实际项目中，建议使用专门的 glob 库如 minimatch

  let regex = globToRegex(pattern)

  // 应用选项
  let flags = ''
  if (!options.value.caseSensitive || options.value.nocase) {
    flags += 'i'
  }

  try {
    const regexObj = new RegExp(regex, flags)
    return regexObj.test(path)
  } catch (error) {
    console.error('正则表达式错误:', error)
    return false
  }
}

function globToRegex(glob: string): string {
  // 简化的 Glob 转正则表达式实现
  let regex = glob

  // 处理否定模式
  if (glob.startsWith('!') && !options.value.nonegate) {
    // 这里简化处理，实际应该在外层处理否定逻辑
    regex = glob.slice(1)
  }

  // 处理花括号展开
  if (!options.value.nobrace) {
    regex = expandBraces(regex)
  }

  // 转义特殊字符
  regex = regex.replace(/[.+^${}()|[\]\\]/g, '\\$&')

  // 处理通配符
  regex = regex.replace(/\\\*/g, '___STAR___')
  regex = regex.replace(/\\\?/g, '___QUESTION___')

  // ** 匹配任意层级
  if (!options.value.noglobstar) {
    regex = regex.replace(/___STAR______STAR___/g, '.*')
  }

  // * 匹配除路径分隔符外的任意字符
  regex = regex.replace(/___STAR___/g, '[^/]*')

  // ? 匹配单个字符
  regex = regex.replace(/___QUESTION___/g, '[^/]')

  // 处理字符类 [abc] 和 [!abc]
  regex = regex.replace(/\\\[([^\]]*)\\\]/g, (match, chars) => {
    if (chars.startsWith('!')) {
      return `[^${chars.slice(1)}]`
    }
    return `[${chars}]`
  })

  // 如果启用了 matchBase，允许匹配路径的任意部分
  if (options.value.matchBase) {
    regex = `(^|/)${regex}$`
  } else {
    regex = `^${regex}$`
  }

  return regex
}

function expandBraces(str: string): string {
  // 简化的花括号展开实现
  const braceRegex = /\{([^}]+)\}/g
  return str.replace(braceRegex, (match, content) => {
    const options = content.split(',')
    return `(${options.join('|')})`
  })
}

function explainGlob() {
  if (!globPattern.value) {
    globExplanation.value = []
    return
  }

  const explanations: GlobExplanation[] = []
  const pattern = globPattern.value

  // 分析 Glob 模式的各个部分
  const explanationMap: Record<string, string> = {
    '*': '匹配任意字符（不包括路径分隔符）',
    '**': '匹配任意层级目录',
    '?': '匹配单个字符',
    '[abc]': '匹配字符集中的任意字符',
    '[!abc]': '匹配不在字符集中的字符',
    '{js,ts}': '花括号展开，匹配多个选项',
    '!': '否定模式，排除匹配的文件'
  }

  // 检查特殊模式
  if (pattern.includes('**')) {
    explanations.push({ pattern: '**', description: '匹配任意层级目录' })
  }

  if (pattern.includes('*') && !pattern.includes('**')) {
    explanations.push({ pattern: '*', description: '匹配任意字符（不包括路径分隔符）' })
  }

  if (pattern.includes('?')) {
    explanations.push({ pattern: '?', description: '匹配单个字符' })
  }

  if (pattern.startsWith('!')) {
    explanations.push({ pattern: '!', description: '否定模式，排除匹配的文件' })
  }

  // 查找字符类
  const charClassRegex = /\[([^\]]+)\]/g
  let match: RegExpExecArray | null
  while ((match = charClassRegex.exec(pattern)) !== null) {
    const chars = match[1]
    if (chars.startsWith('!')) {
      explanations.push({
        pattern: match[0],
        description: `排除字符类：不匹配 ${chars.slice(1)} 中的字符`
      })
    } else {
      explanations.push({
        pattern: match[0],
        description: `字符类：匹配 ${chars} 中的任意字符`
      })
    }
  }

  // 查找花括号展开
  const braceRegex = /\{([^}]+)\}/g
  while ((match = braceRegex.exec(pattern)) !== null) {
    explanations.push({
      pattern: match[0],
      description: `花括号展开：匹配 ${match[1].split(',').join(' 或 ')}`
    })
  }

  globExplanation.value = explanations
}

function generateRegex() {
  if (!globPattern.value) {
    generatedRegex.value = ''
    return
  }

  try {
    const regex = globToRegex(globPattern.value)
    generatedRegex.value = regex
  } catch (error) {
    generatedRegex.value = '生成失败：' + (error instanceof Error ? error.message : '未知错误')
  }
}

function loadGlobPattern(pattern: CommonGlob, name: string) {
  globPattern.value = pattern.glob
  pathsText.value = pattern.sample.join('\n')

  testGlob()
}

function loadSampleGlob() {
  globPattern.value = '**/*.{js,ts,vue}'
  pathsText.value = `src/main.js
src/components/App.vue
src/utils/helper.ts
docs/README.md
package.json
node_modules/lodash/index.js
tests/app.test.js
assets/style.css
src/pages/Home.vue
lib/utils.ts`

  testGlob()
}

function testManually() {
  testGlob()
}

function toggleView() {
  viewMode.value = viewMode.value === 'all' ? 'matched' : 'all'
}

function addPath() {
  const newPath = prompt('输入新的文件路径:')
  if (newPath && newPath.trim()) {
    pathsText.value += (pathsText.value ? '\n' : '') + newPath.trim()
    testGlob()
  }
}

function clearPattern() {
  globPattern.value = ''
  testResult.value = null
  globExplanation.value = []
  generatedRegex.value = ''
}

function clearPaths() {
  pathsText.value = ''
  testResult.value = null
}

async function copyResults() {
  if (!testResult.value) return

  let content = `Glob 模式: ${globPattern.value}\n`
  content += `匹配结果: ${testResult.value.matched}/${testResult.value.total} (${matchRate.value}%)\n\n`

  content += '匹配的路径:\n'
  testResult.value.paths
    .filter((p) => p.matched)
    .forEach((path) => {
      content += `✓ ${path.path}\n`
    })

  content += '\n不匹配的路径:\n'
  testResult.value.paths
    .filter((p) => !p.matched)
    .forEach((path) => {
      content += `✗ ${path.path}\n`
    })

  try {
    await navigator.clipboard.writeText(content)
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error)
  }
}

async function copyRegex() {
  if (!generatedRegex.value) return

  try {
    await navigator.clipboard.writeText(generatedRegex.value)
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error)
  }
}

function downloadResults() {
  if (!testResult.value) return

  const content = `Glob 模式测试结果

Glob 模式: ${globPattern.value}
测试时间: ${new Date().toLocaleString()}
匹配选项: ${JSON.stringify(options.value, null, 2)}

统计信息:
- 总路径数: ${testResult.value.total}
- 匹配路径: ${testResult.value.matched}
- 不匹配路径: ${testResult.value.unmatched}
- 匹配率: ${matchRate.value}%
- 平均路径长度: ${averagePathLength.value}
- 最长路径: ${maxPathLength.value}

匹配的路径:
${testResult.value.paths
  .filter((p) => p.matched)
  .map((p) => `✓ ${p.path}`)
  .join('\n')}

不匹配的路径:
${testResult.value.paths
  .filter((p) => !p.matched)
  .map((p) => `✗ ${p.path}`)
  .join('\n')}

${
  generatedRegex.value
    ? `
生成的正则表达式:
${generatedRegex.value}`
    : ''
}
`

  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'glob-test-results.txt'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    pathsText.value = content

    if (globPattern.value) {
      testGlob()
    }
  }
  reader.readAsText(file)
}

function handleFileDrop(event: DragEvent) {
  event.preventDefault()
  const files = event.dataTransfer?.files
  if (!files || files.length === 0) return

  const file = files[0]
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    pathsText.value = content

    if (globPattern.value) {
      testGlob()
    }
  }
  reader.readAsText(file)
}

function addToHistory(pattern: string, paths: string[], matched: number, total: number) {
  const historyItem: TestHistory = {
    pattern,
    paths: paths.slice(0, 10), // 只保存前10个路径
    timestamp: new Date().toLocaleString(),
    matched,
    total
  }

  testHistory.value.unshift(historyItem)
  testHistory.value = testHistory.value.slice(0, 10)
  saveTestHistory()
}

function loadFromHistory(history: TestHistory) {
  globPattern.value = history.pattern
  pathsText.value = history.paths.join('\n')

  testGlob()
}

function clearHistory() {
  testHistory.value = []
  saveTestHistory()
}

function saveTestHistory() {
  try {
    localStorage.setItem('glob-test-history', JSON.stringify(testHistory.value))
  } catch (error) {
    console.error('保存测试历史失败:', error)
  }
}

function loadTestHistory() {
  try {
    const saved = localStorage.getItem('glob-test-history')
    if (saved) {
      testHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('加载测试历史失败:', error)
  }
}

// 组件挂载时加载历史记录
import { onMounted } from 'vue'

onMounted(() => {
  loadTestHistory()
})
</script>
