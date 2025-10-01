<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.glob-tester.page.title') }}</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">{{ $t('tools.glob-tester.page.globTitle') }}</h4>
            <div class="flex gap-2">
              <button @click="clearPattern" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('action.clear') }}</button>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <input
                v-model="globPattern"
                type="text"
                :placeholder="$t('tools.glob-tester.page.patternPlaceholder')"
                class="w-full px-3 py-2 border rounded-lg text-sm font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="testGlob"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium mb-2">{{ $t('tools.glob-tester.page.matchOptions') }}</label>
                <div class="space-y-2">
                  <label class="flex items-center space-x-2">
                    <input v-model="options.caseSensitive" type="checkbox" @change="testGlob" />
                    <span class="text-sm">{{ $t('tools.glob-tester.page.caseSensitive') }}</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="options.dot" type="checkbox" @change="testGlob" />
                    <span class="text-sm">{{ $t('tools.glob-tester.page.dotFiles') }}</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="options.matchBase" type="checkbox" @change="testGlob" />
                    <span class="text-sm">{{ $t('tools.glob-tester.page.matchBase') }}</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="options.nocase" type="checkbox" @change="testGlob" />
                    <span class="text-sm">{{ $t('tools.glob-tester.page.ignoreCase') }}</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2">{{ $t('tools.glob-tester.page.advancedOptions') }}</label>
                <div class="space-y-2">
                  <label class="flex items-center space-x-2">
                    <input v-model="options.nobrace" type="checkbox" @change="testGlob" />
                    <span class="text-sm">{{ $t('tools.glob-tester.page.noBrace') }}</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="options.noglobstar" type="checkbox" @change="testGlob" />
                    <span class="text-sm">{{ $t('tools.glob-tester.page.noGlobStar') }}</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="options.noext" type="checkbox" @change="testGlob" />
                    <span class="text-sm">{{ $t('tools.glob-tester.page.noExt') }}</span>
                  </label>
                  <label class="flex items-center space-x-2">
                    <input v-model="options.nonegate" type="checkbox" @change="testGlob" />
                    <span class="text-sm">{{ $t('tools.glob-tester.page.noNegate') }}</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">{{ $t('tools.glob-tester.page.separator') }}</label>
              <select v-model="options.separator" @change="testGlob" class="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="/">{{ $t('tools.glob-tester.page.separatorUnix') }}</option>
                <option value="\">{{ $t('tools.glob-tester.page.separatorWindows') }}</option>
                <option value="auto">{{ $t('tools.glob-tester.page.separatorAuto') }}</option>
              </select>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">{{ $t('tools.glob-tester.page.testPaths') }}</h4>
            <div class="flex gap-2">
              <button @click="clearPaths" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('action.clear') }}</button>
              <button @click="addPath" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.glob-tester.page.addPath') }}</button>
            </div>
          </div>

          <div class="space-y-3">
            <div>
              <textarea
                v-model="pathsText"
                rows="8"
                :placeholder="$t('tools.glob-tester.page.pathsPlaceholder')"
                class="w-full px-3 py-2 border rounded-lg text-sm font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="testGlob"
                @drop="handleFileDrop"
                @dragover.prevent
                @dragenter.prevent
              ></textarea>
            </div>

            <div class="flex justify-between items-center text-sm text-gray-500">
              <span>{{ $t('tools.glob-tester.page.pathCount') }} {{ pathsList.length }}</span>
              <span>{{ $t('tools.glob-tester.page.matchedCount') }} {{ matchedPaths.length }}</span>
              <span>{{ $t('tools.glob-tester.page.matchRate') }} {{ matchRate }}%</span>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">{{ $t('tools.glob-tester.page.quickActions') }}</h4>
          <div class="grid grid-cols-2 gap-2">
            <button @click="loadSampleGlob" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">{{ $t('tools.glob-tester.page.loadSample') }}</button>
            <button @click="testManually" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.glob-tester.page.manualTest') }}</button>
            <button @click="explainGlob" class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm">{{ $t('tools.glob-tester.page.explainPattern') }}</button>
            <button @click="generateRegex" class="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded text-sm">{{ $t('tools.glob-tester.page.generateRegex') }}</button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">{{ $t('tools.glob-tester.page.commonGlobs') }}</h4>
          <div class="grid grid-cols-1 gap-2">
            <button v-for="(pattern, key) in commonGlobs" :key="key" @click="loadGlobPattern(pattern, key)" class="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm text-left">
              <div class="font-medium">{{ $t(`tools.glob-tester.page.commonGlobNames.${key}`) }}</div>
              <div class="text-xs opacity-75 font-mono">{{ pattern.glob }}</div>
              <div class="text-xs opacity-60">{{ pattern.description }}</div>
            </button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">{{ $t('tools.glob-tester.page.fileOperations') }}</h4>
          <div class="grid grid-cols-2 gap-2">
            <label class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm cursor-pointer text-center">
              <input type="file" accept=".txt,.log,.csv" @change="handleFileUpload" class="hidden" />
              {{ $t('tools.glob-tester.page.uploadPathList') }}
            </label>
            <button @click="downloadResults" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.glob-tester.page.downloadResults') }}</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.glob-tester.page.testResults') }}</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">{{ $t('tools.glob-tester.page.matchResults') }}</h4>
            <div class="flex gap-2">
              <button @click="copyResults" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.glob-tester.page.copyResults') }}</button>
              <button @click="toggleView" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">
                {{ viewMode === 'matched' ? $t('tools.glob-tester.page.showAll') : $t('tools.glob-tester.page.onlyMatched') }}
              </button>
            </div>
          </div>
          <div class="p-4">
            <div v-if="testResult" class="space-y-3">
              <div class="grid grid-cols-3 gap-4 text-sm">
                <div class="text-center p-2 bg-green-50 dark:bg-green-900 rounded">
                  <div class="font-medium text-green-600">{{ $t('tools.glob-tester.page.matched') }}</div>
                  <div class="text-lg font-bold">{{ testResult.matched }}</div>
                </div>
                <div class="text-center p-2 bg-red-50 dark:bg-red-900 rounded">
                  <div class="font-medium text-red-600">{{ $t('tools.glob-tester.page.unmatched') }}</div>
                  <div class="text-lg font-bold">{{ testResult.unmatched }}</div>
                </div>
                <div class="text-center p-2 bg-blue-50 dark:bg-blue-900 rounded">
                  <div class="font-medium text-blue-600">{{ $t('tools.glob-tester.page.total') }}</div>
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
                        {{ path.matched ? $t('tools.glob-tester.page.matched') : $t('tools.glob-tester.page.unmatched') }}
                      </span>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-8 text-gray-500">
                  {{ viewMode === 'matched' ? $t('tools.glob-tester.page.noMatchedPaths') : $t('tools.glob-tester.page.noTestPaths') }}
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">{{ $t('tools.glob-tester.page.resultHint') }}</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg" v-if="globExplanation">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">{{ $t('tools.glob-tester.page.patternExplanation') }}</h4>
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
            <h4 class="font-medium">{{ $t('tools.glob-tester.page.generatedRegex') }}</h4>
            <button @click="copyRegex" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.glob-tester.page.copyRegex') }}</button>
          </div>
          <div class="p-4">
            <div class="bg-gray-50 dark:bg-gray-700 rounded p-3 text-sm font-mono break-all">
              {{ generatedRegex }}
            </div>
            <div class="mt-2 text-xs text-gray-500">{{ $t('tools.glob-tester.page.regexNotice') }}</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">{{ $t('tools.glob-tester.page.matchStats') }}</h4>
          </div>
          <div class="p-4">
            <div v-if="testResult" class="grid grid-cols-2 gap-4 text-sm">
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span>{{ $t('tools.glob-tester.page.matchRateLabel') }}</span>
                  <span class="font-mono">{{ matchRate }}%</span>
                </div>
                <div class="flex justify-between">
                  <span>{{ $t('tools.glob-tester.page.matchedPathsLabel') }}</span>
                  <span class="font-mono">{{ testResult.matched }}</span>
                </div>
                <div class="flex justify-between">
                  <span>{{ $t('tools.glob-tester.page.unmatchedPathsLabel') }}</span>
                  <span class="font-mono">{{ testResult.unmatched }}</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span>{{ $t('tools.glob-tester.page.totalPathsLabel') }}</span>
                  <span class="font-mono">{{ testResult.total }}</span>
                </div>
                <div class="flex justify-between">
                  <span>{{ $t('tools.glob-tester.page.averagePathLengthLabel') }}</span>
                  <span class="font-mono">{{ averagePathLength }}</span>
                </div>
                <div class="flex justify-between">
                  <span>{{ $t('tools.glob-tester.page.maxPathLengthLabel') }}</span>
                  <span class="font-mono">{{ maxPathLength }}</span>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500">{{ $t('tools.glob-tester.page.statsHint') }}</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">{{ $t('tools.glob-tester.page.testHistory') }}</h4>
            <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('tools.glob-tester.page.clearHistory') }}</button>
          </div>
          <div class="p-4">
            <div v-if="testHistory.length > 0" class="space-y-2 max-h-32 overflow-y-auto">
              <div v-for="(history, index) in testHistory.slice(0, 5)" :key="index" class="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-xs truncate">{{ history.pattern }}</div>
                  <div class="text-xs text-gray-500">{{ history.timestamp }} - {{ history.matched }}/{{ history.total }} {{ $t('tools.glob-tester.page.historyMatched') }}</div>
                </div>
                <div class="flex gap-1">
                  <button @click="loadFromHistory(history)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.glob-tester.page.load') }}</button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">{{ $t('tools.glob-tester.page.noHistory') }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">{{ $t('tools.glob-tester.page.usage') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.glob-tester.page.basicWildcards') }}</h4>
          <ul class="space-y-1">
            <li>• <strong>*</strong> {{ $t('tools.glob-tester.page.wildcardStar') }}</li>
            <li>• <strong>?</strong> {{ $t('tools.glob-tester.page.wildcardQuestion') }}</li>
            <li>• <strong>**</strong> {{ $t('tools.glob-tester.page.wildcardDoubleStar') }}</li>
            <li>• <strong>[abc]</strong> {{ $t('tools.glob-tester.page.wildcardCharSet') }}</li>
            <li>• <strong>[a-z]</strong> {{ $t('tools.glob-tester.page.wildcardCharRange') }}</li>
            <li>• <strong>[!abc]</strong> {{ $t('tools.glob-tester.page.wildcardNegateCharSet') }}</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.glob-tester.page.advancedPatterns') }}</h4>
          <ul class="space-y-1">
            <li>• <strong>{js,ts}</strong> {{ $t('tools.glob-tester.page.advancedBrace') }}</li>
            <li>• <strong>!(pattern)</strong> {{ $t('tools.glob-tester.page.advancedNegate') }}</li>
            <li>• <strong>?(pattern)</strong> {{ $t('tools.glob-tester.page.advancedOptional') }}</li>
            <li>• <strong>+(pattern)</strong> {{ $t('tools.glob-tester.page.advancedOneOrMore') }}</li>
            <li>• <strong>*(pattern)</strong> {{ $t('tools.glob-tester.page.advancedZeroOrMore') }}</li>
            <li>• <strong>@(pattern)</strong> {{ $t('tools.glob-tester.page.advancedExactlyOne') }}</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.glob-tester.page.commonUseCases') }}</h4>
          <ul class="space-y-1">
            <li>• <strong>*.js</strong> {{ $t('tools.glob-tester.page.useCaseAllJs') }}</li>
            <li>• <strong>**/*.vue</strong> {{ $t('tools.glob-tester.page.useCaseAllVue') }}</li>
            <li>• <strong>src/**</strong> {{ $t('tools.glob-tester.page.useCaseSrcAll') }}</li>
            <li>• <strong>!node_modules</strong> {{ $t('tools.glob-tester.page.useCaseExcludeNodeModules') }}</li>
            <li>• <strong>*.{js,ts}</strong> {{ $t('tools.glob-tester.page.useCaseJsOrTs') }}</li>
            <li>• <strong>test/**/*.spec.js</strong> {{ $t('tools.glob-tester.page.useCaseTestFiles') }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

interface GlobOptions {
  caseSensitive: boolean;
  dot: boolean;
  matchBase: boolean;
  nocase: boolean;
  nobrace: boolean;
  noglobstar: boolean;
  noext: boolean;
  nonegate: boolean;
  separator: string;
}

interface PathResult {
  path: string;
  matched: boolean;
}

interface TestResult {
  matched: number;
  unmatched: number;
  total: number;
  paths: PathResult[];
}

interface TestHistory {
  pattern: string;
  paths: string[];
  timestamp: string;
  matched: number;
  total: number;
}

interface GlobExplanation {
  pattern: string;
  description: string;
}

interface CommonGlob {
  glob: string;
  description: string;
  sample: string[];
}

const globPattern = ref('');
const pathsText = ref('');
const viewMode = ref<'all' | 'matched'>('all');
const globExplanation = ref<GlobExplanation[]>([]);
const generatedRegex = ref('');

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
});

const testHistory = ref<TestHistory[]>([]);
const testResult = ref<TestResult | null>(null);

const pathsList = computed(() => {
  return pathsText.value
    .split('\n')
    .map((path) => path.trim())
    .filter((path) => path.length > 0);
});

const matchedPaths = computed(() => {
  return testResult.value?.paths.filter((p) => p.matched) || [];
});

const matchRate = computed(() => {
  if (!testResult.value || testResult.value.total === 0) return 0;
  return Math.round((testResult.value.matched / testResult.value.total) * 100);
});

const averagePathLength = computed(() => {
  if (pathsList.value.length === 0) return 0;
  const totalLength = pathsList.value.reduce((sum, path) => sum + path.length, 0);
  return Math.round(totalLength / pathsList.value.length);
});

const maxPathLength = computed(() => {
  if (pathsList.value.length === 0) return 0;
  return Math.max(...pathsList.value.map((path) => path.length));
});

const displayPaths = computed(() => {
  if (!testResult.value) return [];

  if (viewMode.value === 'matched') {
    return testResult.value.paths.filter((p) => p.matched);
  }

  return testResult.value.paths;
});

const commonGlobs: Record<string, CommonGlob> = {
  jsFiles: {
    glob: '**/*.{js,jsx}',
    description: '匹配所有 JavaScript 文件',
    sample: ['src/app.js', 'components/Button.jsx', 'utils/helper.js']
  },
  tsFiles: {
    glob: '**/*.{ts,tsx}',
    description: '匹配所有 TypeScript 文件',
    sample: ['src/main.ts', 'components/App.tsx', 'types/index.ts']
  },
  vueComponents: {
    glob: '**/*.vue',
    description: '匹配所有 Vue 组件文件',
    sample: ['src/App.vue', 'components/Header.vue', 'pages/Home.vue']
  },
  styleFiles: {
    glob: '**/*.{css,scss,sass,less}',
    description: '匹配所有样式文件',
    sample: ['src/style.css', 'assets/main.scss', 'components/button.less']
  },
  imageFiles: {
    glob: '**/*.{jpg,jpeg,png,gif,svg,webp}',
    description: '匹配所有图片文件',
    sample: ['assets/logo.png', 'images/hero.jpg', 'icons/star.svg']
  },
  testFiles: {
    glob: '**/*.{test,spec}.{js,ts}',
    description: '匹配所有测试文件',
    sample: ['tests/app.test.js', 'src/utils.spec.ts', '__tests__/component.test.js']
  },
  configFiles: {
    glob: '*.{json,yml,yaml,toml,ini}',
    description: '匹配根目录配置文件',
    sample: ['package.json', 'config.yml', 'settings.toml']
  },
  excludeNodeModules: {
    glob: '!node_modules/**',
    description: '排除 node_modules 目录',
    sample: ['src/app.js', 'package.json', '!node_modules/lodash/index.js']
  },
  srcDirectory: {
    glob: 'src/**/*',
    description: '匹配 src 目录下所有文件',
    sample: ['src/main.js', 'src/components/App.vue', 'src/utils/helper.ts']
  },
  hiddenFiles: {
    glob: '.*',
    description: '匹配隐藏文件（需启用 dot 选项）',
    sample: ['.gitignore', '.env', '.eslintrc.js']
  }
};

watch(
  [globPattern, pathsText, () => options.value],
  () => {
    if (globPattern.value && pathsList.value.length > 0) {
      testGlob();
    }
  },
  { deep: true }
);

function testGlob() {
  if (!globPattern.value || pathsList.value.length === 0) {
    testResult.value = null;
    return;
  }

  try {
    const results: PathResult[] = [];

    for (const path of pathsList.value) {
      const matched = matchGlob(globPattern.value, path);
      results.push({ path, matched });
    }

    const matched = results.filter((r) => r.matched).length;
    const total = results.length;

    testResult.value = {
      matched,
      unmatched: total - matched,
      total,
      paths: results
    };

    // 添加到历史记录
    addToHistory(globPattern.value, pathsList.value, matched, total);
  } catch (error) {
    console.error('Glob 测试失败:', error);
    testResult.value = null;
  }
}

function matchGlob(pattern: string, path: string): boolean {
  // 简化的 Glob 匹配实现
  // 在实际项目中，建议使用专门的 glob 库如 minimatch

  let regex = globToRegex(pattern);

  // 应用选项
  let flags = '';
  if (!options.value.caseSensitive || options.value.nocase) {
    flags += 'i';
  }

  try {
    const regexObj = new RegExp(regex, flags);
    return regexObj.test(path);
  } catch (error) {
    console.error('正则表达式错误:', error);
    return false;
  }
}

function globToRegex(glob: string): string {
  // 简化的 Glob 转正则表达式实现
  let regex = glob;

  // 处理否定模式
  if (glob.startsWith('!') && !options.value.nonegate) {
    // 这里简化处理，实际应该在外层处理否定逻辑
    regex = glob.slice(1);
  }

  // 处理花括号展开
  if (!options.value.nobrace) {
    regex = expandBraces(regex);
  }

  // 转义特殊字符
  regex = regex.replace(/[.+^${}()|[\]\\]/g, '\\$&');

  // 处理通配符
  regex = regex.replace(/\\\*/g, '___STAR___');
  regex = regex.replace(/\\\?/g, '___QUESTION___');

  // ** 匹配任意层级
  if (!options.value.noglobstar) {
    regex = regex.replace(/___STAR______STAR___/g, '.*');
  }

  // * 匹配除路径分隔符外的任意字符
  regex = regex.replace(/___STAR___/g, '[^/]*');

  // ? 匹配单个字符
  regex = regex.replace(/___QUESTION___/g, '[^/]');

  // 处理字符类 [abc] 和 [!abc]
  regex = regex.replace(/\\\[([^\]]*)\\\]/g, (match, chars) => {
    if (chars.startsWith('!')) {
      return `[^${chars.slice(1)}]`;
    }
    return `[${chars}]`;
  });

  // 如果启用了 matchBase，允许匹配路径的任意部分
  if (options.value.matchBase) {
    regex = `(^|/)${regex}$`;
  } else {
    regex = `^${regex}$`;
  }

  return regex;
}

function expandBraces(str: string): string {
  // 简化的花括号展开实现
  const braceRegex = /\{([^}]+)\}/g;
  return str.replace(braceRegex, (match, content) => {
    const options = content.split(',');
    return `(${options.join('|')})`;
  });
}

function explainGlob() {
  if (!globPattern.value) {
    globExplanation.value = [];
    return;
  }

  const explanations: GlobExplanation[] = [];
  const pattern = globPattern.value;

  // 分析 Glob 模式的各个部分
  const explanationMap: Record<string, string> = {
    '*': '匹配任意字符（不包括路径分隔符）',
    '**': '匹配任意层级目录',
    '?': '匹配单个字符',
    '[abc]': '匹配字符集中的任意字符',
    '[!abc]': '匹配不在字符集中的字符',
    '{js,ts}': '花括号展开，匹配多个选项',
    '!': '否定模式，排除匹配的文件'
  };

  // 检查特殊模式
  if (pattern.includes('**')) {
    explanations.push({ pattern: '**', description: '匹配任意层级目录' });
  }

  if (pattern.includes('*') && !pattern.includes('**')) {
    explanations.push({ pattern: '*', description: '匹配任意字符（不包括路径分隔符）' });
  }

  if (pattern.includes('?')) {
    explanations.push({ pattern: '?', description: '匹配单个字符' });
  }

  if (pattern.startsWith('!')) {
    explanations.push({ pattern: '!', description: '否定模式，排除匹配的文件' });
  }

  // 查找字符类
  const charClassRegex = /\[([^\]]+)\]/g;
  let match: RegExpExecArray | null;
  while ((match = charClassRegex.exec(pattern)) !== null) {
    const chars = match[1];
    if (chars.startsWith('!')) {
      explanations.push({
        pattern: match[0],
        description: `排除字符类：不匹配 ${chars.slice(1)} 中的字符`
      });
    } else {
      explanations.push({
        pattern: match[0],
        description: `字符类：匹配 ${chars} 中的任意字符`
      });
    }
  }

  // 查找花括号展开
  const braceRegex = /\{([^}]+)\}/g;
  while ((match = braceRegex.exec(pattern)) !== null) {
    explanations.push({
      pattern: match[0],
      description: `花括号展开：匹配 ${match[1].split(',').join(' 或 ')}`
    });
  }

  globExplanation.value = explanations;
}

function generateRegex() {
  if (!globPattern.value) {
    generatedRegex.value = '';
    return;
  }

  try {
    const regex = globToRegex(globPattern.value);
    generatedRegex.value = regex;
  } catch (error) {
    generatedRegex.value = '生成失败：' + (error instanceof Error ? error.message : '未知错误');
  }
}

function loadGlobPattern(pattern: CommonGlob, name: string) {
  globPattern.value = pattern.glob;
  pathsText.value = pattern.sample.join('\n');

  testGlob();
}

function loadSampleGlob() {
  globPattern.value = '**/*.{js,ts,vue}';
  pathsText.value = `src/main.js
src/components/App.vue
src/utils/helper.ts
docs/README.md
package.json
node_modules/lodash/index.js
tests/app.test.js
assets/style.css
src/pages/Home.vue
lib/utils.ts`;

  testGlob();
}

function testManually() {
  testGlob();
}

function toggleView() {
  viewMode.value = viewMode.value === 'all' ? 'matched' : 'all';
}

function addPath() {
  const newPath = prompt('输入新的文件路径:');
  if (newPath && newPath.trim()) {
    pathsText.value += (pathsText.value ? '\n' : '') + newPath.trim();
    testGlob();
  }
}

function clearPattern() {
  globPattern.value = '';
  testResult.value = null;
  globExplanation.value = [];
  generatedRegex.value = '';
}

function clearPaths() {
  pathsText.value = '';
  testResult.value = null;
}

async function copyResults() {
  if (!testResult.value) return;

  let content = `Glob 模式: ${globPattern.value}\n`;
  content += `匹配结果: ${testResult.value.matched}/${testResult.value.total} (${matchRate.value}%)\n\n`;

  content += '匹配的路径:\n';
  testResult.value.paths
    .filter((p) => p.matched)
    .forEach((path) => {
      content += `✓ ${path.path}\n`;
    });

  content += '\n不匹配的路径:\n';
  testResult.value.paths
    .filter((p) => !p.matched)
    .forEach((path) => {
      content += `✗ ${path.path}\n`;
    });

  try {
    await navigator.clipboard.writeText(content);
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error);
  }
}

async function copyRegex() {
  if (!generatedRegex.value) return;

  try {
    await navigator.clipboard.writeText(generatedRegex.value);
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error);
  }
}

function downloadResults() {
  if (!testResult.value) return;

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
`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'glob-test-results.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    pathsText.value = content;

    if (globPattern.value) {
      testGlob();
    }
  };
  reader.readAsText(file);
}

function handleFileDrop(event: DragEvent) {
  event.preventDefault();
  const files = event.dataTransfer?.files;
  if (!files || files.length === 0) return;

  const file = files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    const content = e.target?.result as string;
    pathsText.value = content;

    if (globPattern.value) {
      testGlob();
    }
  };
  reader.readAsText(file);
}

function addToHistory(pattern: string, paths: string[], matched: number, total: number) {
  const historyItem: TestHistory = {
    pattern,
    paths: paths.slice(0, 10), // 只保存前10个路径
    timestamp: new Date().toLocaleString(),
    matched,
    total
  };

  testHistory.value.unshift(historyItem);
  testHistory.value = testHistory.value.slice(0, 10);
  saveTestHistory();
}

function loadFromHistory(history: TestHistory) {
  globPattern.value = history.pattern;
  pathsText.value = history.paths.join('\n');

  testGlob();
}

function clearHistory() {
  testHistory.value = [];
  saveTestHistory();
}

function saveTestHistory() {
  try {
    localStorage.setItem('glob-test-history', JSON.stringify(testHistory.value));
  } catch (error) {
    console.error('保存测试历史失败:', error);
  }
}

function loadTestHistory() {
  try {
    const saved = localStorage.getItem('glob-test-history');
    if (saved) {
      testHistory.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error('加载测试历史失败:', error);
  }
}

// 组件挂载时加载历史记录
import { onMounted } from 'vue';

onMounted(() => {
  loadTestHistory();
});
</script>
