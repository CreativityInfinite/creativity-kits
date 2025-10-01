<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.url-parser.page.title') }}</h3>

        <div class="space-y-3">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.url-parser.page.inputSectionTitle') }}</h4>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium mb-1">{{ $t('tools.url-parser.page.inputLabel') }}</label>
                <textarea
                  v-model="urlInput"
                  class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
                  rows="3"
                  :placeholder="$t('tools.url-parser.page.inputPlaceholder')"
                  @input="parseUrl"
                />
                <p class="text-xs text-gray-500 mt-1">{{ $t('tools.url-parser.page.supportTip') }}</p>
              </div>

              <div class="flex gap-2">
                <button @click="loadSampleUrl" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.url-parser.page.btnLoadSample') }}</button>
                <button @click="clearUrl" class="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('tools.url-parser.page.btnClear') }}</button>
                <button @click="getCurrentUrl" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.url-parser.page.btnCurrentUrl') }}</button>
              </div>

              <div v-if="parseError" class="text-red-500 text-sm">
                {{ parseError }}
              </div>

              <div v-if="isValidUrl" class="bg-green-50 dark:bg-green-900/20 rounded p-3">
                <div class="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <span class="text-lg">✓</span>
                  <span class="text-sm font-medium">{{ $t('tools.url-parser.page.validBadge') }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.url-parser.page.builderTitle') }}</h4>
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium mb-1">{{ $t('tools.url-parser.page.protocol') }}</label>
                  <select v-model="builder.protocol" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="https:">HTTPS</option>
                    <option value="http:">HTTP</option>
                    <option value="ftp:">FTP</option>
                    <option value="file:">FILE</option>
                    <option value="ws:">WebSocket</option>
                    <option value="wss:">WebSocket Secure</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">{{ $t('tools.url-parser.page.hostname') }}</label>
                  <input v-model="builder.hostname" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="example.com" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium mb-1">{{ $t('tools.url-parser.page.port') }}</label>
                  <input v-model="builder.port" type="number" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="80, 443, 8080..." />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">{{ $t('tools.url-parser.page.pathname') }}</label>
                  <input v-model="builder.pathname" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="/path/to/page" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">{{ $t('tools.url-parser.page.searchParams') }}</label>
                <div class="space-y-2">
                  <div v-for="(param, index) in builder.searchParams" :key="index" class="flex gap-2">
                    <input
                      v-model="param.key"
                      type="text"
                      class="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      :placeholder="$t('tools.url-parser.page.paramKeyPlaceholder')"
                    />
                    <input
                      v-model="param.value"
                      type="text"
                      class="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      :placeholder="$t('tools.url-parser.page.paramValuePlaceholder')"
                    />
                    <button @click="removeParam(index)" class="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded">✕</button>
                  </div>
                  <button @click="addParam" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.url-parser.page.addParam') }}</button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">{{ $t('tools.url-parser.page.hashLabel') }}</label>
                <input v-model="builder.hash" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="section" />
              </div>

              <div class="bg-white dark:bg-gray-700 rounded p-3 border">
                <div class="text-sm font-medium mb-1">{{ $t('tools.url-parser.page.builtUrlTitle') }}</div>
                <div class="font-mono text-sm break-all text-blue-600 dark:text-blue-400">
                  {{ builtUrl }}
                </div>
              </div>

              <div class="flex gap-2">
                <button @click="useBuiltUrl" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">{{ $t('tools.url-parser.page.useBuiltUrl') }}</button>
                <button @click="copyBuiltUrl" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.url-parser.page.copy') }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.url-parser.page.resultTitle') }}</h3>

        <div v-if="parsedUrl" class="space-y-4">
          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
              <h4 class="font-medium">{{ $t('tools.url-parser.page.basicInfo') }}</h4>
            </div>
            <div class="p-4 space-y-3">
              <div class="grid grid-cols-1 gap-3 text-sm">
                <div class="flex justify-between">
                  <span class="font-medium">{{ $t('tools.url-parser.page.fullUrl') }}</span>
                  <span class="font-mono text-blue-600 dark:text-blue-400 break-all">{{ parsedUrl.href }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">{{ $t('tools.url-parser.page.protocolShort') }}</span>
                  <span class="font-mono">{{ parsedUrl.protocol }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">{{ $t('tools.url-parser.page.host') }}</span>
                  <span class="font-mono">{{ parsedUrl.host }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">{{ $t('tools.url-parser.page.hostnameShort') }}</span>
                  <span class="font-mono">{{ parsedUrl.hostname }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">{{ $t('tools.url-parser.page.portShort') }}</span>
                  <span class="font-mono">{{ parsedUrl.port || $t('tools.url-parser.page.default') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">{{ $t('tools.url-parser.page.path') }}</span>
                  <span class="font-mono">{{ parsedUrl.pathname }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">{{ $t('tools.url-parser.page.searchString') }}</span>
                  <span class="font-mono">{{ parsedUrl.search || $t('tools.url-parser.page.none') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">{{ $t('tools.url-parser.page.hash') }}</span>
                  <span class="font-mono">{{ parsedUrl.hash || $t('tools.url-parser.page.none') }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">{{ $t('tools.url-parser.page.origin') }}</span>
                  <span class="font-mono">{{ parsedUrl.origin }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="queryParams.length > 0" class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
              <h4 class="font-medium">{{ $t('tools.url-parser.page.queryParams') }} ({{ queryParams.length }})</h4>
            </div>
            <div class="p-4">
              <div class="space-y-2">
                <div v-for="(param, index) in queryParams" :key="index" class="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div class="flex-1 min-w-0">
                    <div class="font-mono text-sm">
                      <span class="font-medium text-blue-600 dark:text-blue-400">{{ param.key }}</span>
                      <span class="mx-2">=</span>
                      <span class="text-green-600 dark:text-green-400">{{ param.value }}</span>
                    </div>
                  </div>
                  <button @click="copyParam(param)" class="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.url-parser.page.copyParam') }}</button>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
              <h4 class="font-medium">{{ $t('tools.url-parser.page.urlAnalysisTitle') }}</h4>
            </div>
            <div class="p-4 space-y-3">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>{{ $t('tools.url-parser.page.isSecure') }}</span>
                    <span :class="urlAnalysis.isSecure ? 'text-green-600' : 'text-red-600'">
                      {{ urlAnalysis.isSecure ? $t('tools.url-parser.page.yes') : $t('tools.url-parser.page.no') }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.url-parser.page.isLocal') }}</span>
                    <span :class="urlAnalysis.isLocalhost ? 'text-orange-600' : 'text-blue-600'">
                      {{ urlAnalysis.isLocalhost ? $t('tools.url-parser.page.yes') : $t('tools.url-parser.page.no') }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.url-parser.page.isIp') }}</span>
                    <span :class="urlAnalysis.isIpAddress ? 'text-purple-600' : 'text-gray-600'">
                      {{ urlAnalysis.isIpAddress ? $t('tools.url-parser.page.yes') : $t('tools.url-parser.page.no') }}
                    </span>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>{{ $t('tools.url-parser.page.defaultPortLabel') }}</span>
                    <span class="font-mono">{{ urlAnalysis.defaultPort }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.url-parser.page.domainLevels') }}</span>
                    <span class="font-mono">{{ urlAnalysis.domainLevels }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>{{ $t('tools.url-parser.page.pathDepth') }}</span>
                    <span class="font-mono">{{ urlAnalysis.pathDepth }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
              <h4 class="font-medium">{{ $t('tools.url-parser.page.urlVariantsTitle') }}</h4>
            </div>
            <div class="p-4 space-y-3">
              <div class="space-y-2 text-sm">
                <div>
                  <span class="font-medium">{{ $t('tools.url-parser.page.withoutQuery') }}</span>
                  <div class="font-mono text-blue-600 dark:text-blue-400 break-all mt-1">
                    {{ urlVariants.withoutQuery }}
                  </div>
                </div>
                <div>
                  <span class="font-medium">{{ $t('tools.url-parser.page.withoutHash') }}</span>
                  <div class="font-mono text-blue-600 dark:text-blue-400 break-all mt-1">
                    {{ urlVariants.withoutHash }}
                  </div>
                </div>
                <div>
                  <span class="font-medium">{{ $t('tools.url-parser.page.domainOnly') }}</span>
                  <div class="font-mono text-blue-600 dark:text-blue-400 break-all mt-1">
                    {{ urlVariants.domainOnly }}
                  </div>
                </div>
                <div>
                  <span class="font-medium">{{ $t('tools.url-parser.page.relativePath') }}</span>
                  <div class="font-mono text-blue-600 dark:text-blue-400 break-all mt-1">
                    {{ urlVariants.relativePath }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="exportAnalysis" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">{{ $t('tools.url-parser.page.exportAnalysis') }}</button>
            <button @click="copyAnalysis" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">{{ $t('tools.url-parser.page.copyAnalysis') }}</button>
          </div>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">🔗</div>
          <div class="text-lg mb-2">{{ $t('tools.url-parser.page.title') }}</div>
          <div class="text-sm">{{ $t('tools.url-parser.page.emptySubtitle') }}</div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">{{ $t('tools.url-parser.page.guideTitle') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.url-parser.page.guideParseTitle') }}</h4>
          <ul class="space-y-1">
            <li>{{ $t('tools.url-parser.page.featureDecompose') }}</li>
            <li>{{ $t('tools.url-parser.page.featureParams') }}</li>
            <li>{{ $t('tools.url-parser.page.featureSecurity') }}</li>
            <li>{{ $t('tools.url-parser.page.featureDomainPath') }}</li>
            <li>{{ $t('tools.url-parser.page.featureVariants') }}</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.url-parser.page.guideBuildTitle') }}</h4>
          <ul class="space-y-1">
            <li>{{ $t('tools.url-parser.page.featureVisualBuild') }}</li>
            <li>{{ $t('tools.url-parser.page.featureParamManage') }}</li>
            <li>{{ $t('tools.url-parser.page.featureProtocolPort') }}</li>
            <li>{{ $t('tools.url-parser.page.featureLivePreview') }}</li>
            <li>{{ $t('tools.url-parser.page.featureCopyUse') }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

interface QueryParam {
  key: string;
  value: string;
}

interface UrlBuilder {
  protocol: string;
  hostname: string;
  port: string;
  pathname: string;
  searchParams: QueryParam[];
  hash: string;
}

interface UrlAnalysis {
  isSecure: boolean;
  isLocalhost: boolean;
  isIpAddress: boolean;
  defaultPort: string;
  domainLevels: number;
  pathDepth: number;
}

interface UrlVariants {
  withoutQuery: string;
  withoutHash: string;
  domainOnly: string;
  relativePath: string;
}

const { t } = useI18n();
const urlInput = ref('');
const parseError = ref('');
const parsedUrl = ref<URL | null>(null);

const builder = ref<UrlBuilder>({
  protocol: 'https:',
  hostname: '',
  port: '',
  pathname: '',
  searchParams: [],
  hash: ''
});

const isValidUrl = computed(() => {
  return parsedUrl.value !== null && !parseError.value;
});

const queryParams = computed((): QueryParam[] => {
  if (!parsedUrl.value) return [];

  const params: QueryParam[] = [];
  parsedUrl.value.searchParams.forEach((value, key) => {
    params.push({ key, value });
  });
  return params;
});

const urlAnalysis = computed((): UrlAnalysis => {
  if (!parsedUrl.value) {
    return {
      isSecure: false,
      isLocalhost: false,
      isIpAddress: false,
      defaultPort: '',
      domainLevels: 0,
      pathDepth: 0
    };
  }

  const url = parsedUrl.value;
  const isSecure = url.protocol === 'https:' || url.protocol === 'wss:';
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname.endsWith('.local');
  const isIpAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(url.hostname);

  const defaultPorts: { [key: string]: string } = {
    'http:': '80',
    'https:': '443',
    'ftp:': '21',
    'ws:': '80',
    'wss:': '443'
  };
  const defaultPort = defaultPorts[url.protocol] || t('tools.url-parser.page.unknown');

  const domainLevels = url.hostname.split('.').length;
  const pathDepth = url.pathname.split('/').filter((segment) => segment !== '').length;

  return {
    isSecure,
    isLocalhost,
    isIpAddress,
    defaultPort,
    domainLevels,
    pathDepth
  };
});

const urlVariants = computed((): UrlVariants => {
  if (!parsedUrl.value) {
    return {
      withoutQuery: '',
      withoutHash: '',
      domainOnly: '',
      relativePath: ''
    };
  }

  const url = parsedUrl.value;

  return {
    withoutQuery: `${url.protocol}//${url.host}${url.pathname}${url.hash}`,
    withoutHash: `${url.protocol}//${url.host}${url.pathname}${url.search}`,
    domainOnly: `${url.protocol}//${url.host}`,
    relativePath: `${url.pathname}${url.search}${url.hash}`
  };
});

const builtUrl = computed((): string => {
  try {
    let url = `${builder.value.protocol}//${builder.value.hostname}`;

    if (builder.value.port) {
      url += `:${builder.value.port}`;
    }

    if (builder.value.pathname) {
      if (!builder.value.pathname.startsWith('/')) {
        url += '/';
      }
      url += builder.value.pathname;
    }

    const validParams = builder.value.searchParams.filter((p) => p.key.trim() !== '');
    if (validParams.length > 0) {
      const searchParams = new URLSearchParams();
      validParams.forEach((param) => {
        searchParams.append(param.key, param.value);
      });
      url += `?${searchParams.toString()}`;
    }

    if (builder.value.hash) {
      url += `#${builder.value.hash}`;
    }

    return url;
  } catch (error) {
    return t('tools.url-parser.page.invalidConfig');
  }
});

function parseUrl() {
  parseError.value = '';
  parsedUrl.value = null;

  if (!urlInput.value.trim()) {
    return;
  }

  try {
    // 尝试解析URL
    let urlToParse = urlInput.value.trim();

    // 如果没有协议，添加默认协议
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(urlToParse)) {
      urlToParse = 'https://' + urlToParse;
    }

    parsedUrl.value = new URL(urlToParse);
  } catch (error) {
    parseError.value = t('tools.url-parser.page.invalidUrl');
  }
}

function loadSampleUrl() {
  urlInput.value = 'https://example.com:8080/api/v1/users?page=1&limit=10&sort=name&filter=active#results';
  parseUrl();
}

function clearUrl() {
  urlInput.value = '';
  parsedUrl.value = null;
  parseError.value = '';
}

function getCurrentUrl() {
  if (typeof window !== 'undefined') {
    urlInput.value = window.location.href;
    parseUrl();
  }
}

function addParam() {
  builder.value.searchParams.push({ key: '', value: '' });
}

function removeParam(index: number) {
  builder.value.searchParams.splice(index, 1);
}

function useBuiltUrl() {
  urlInput.value = builtUrl.value;
  parseUrl();
}

async function copyBuiltUrl() {
  try {
    await navigator.clipboard.writeText(builtUrl.value);
    // 这里可以添加成功提示
  } catch (error) {
    console.error(t('tools.url-parser.page.copyFailedLog'), error);
  }
}

async function copyParam(param: QueryParam) {
  try {
    await navigator.clipboard.writeText(`${param.key}=${param.value}`);
    // 这里可以添加成功提示
  } catch (error) {
    console.error(t('tools.url-parser.page.copyFailedLog'), error);
  }
}

async function copyAnalysis() {
  if (!parsedUrl.value) return;

  const analysis = `${t('tools.url-parser.page.resultTitle')}
${t('tools.url-parser.page.fullUrl')} ${parsedUrl.value.href}
${t('tools.url-parser.page.protocolShort')} ${parsedUrl.value.protocol}
${t('tools.url-parser.page.host')} ${parsedUrl.value.host}
${t('tools.url-parser.page.path')} ${parsedUrl.value.pathname}
${t('tools.url-parser.page.searchString')} ${parsedUrl.value.search || t('tools.url-parser.page.none')}
${t('tools.url-parser.page.hash')} ${parsedUrl.value.hash || t('tools.url-parser.page.none')}

${t('tools.url-parser.page.urlAnalysisTitle')}:
- ${t('tools.url-parser.page.isSecure')} ${urlAnalysis.value.isSecure ? t('tools.url-parser.page.yes') : t('tools.url-parser.page.no')}
- ${t('tools.url-parser.page.isLocal')} ${urlAnalysis.value.isLocalhost ? t('tools.url-parser.page.yes') : t('tools.url-parser.page.no')}
- ${t('tools.url-parser.page.isIp')} ${urlAnalysis.value.isIpAddress ? t('tools.url-parser.page.yes') : t('tools.url-parser.page.no')}
- ${t('tools.url-parser.page.defaultPortLabel')} ${urlAnalysis.value.defaultPort}
- ${t('tools.url-parser.page.domainLevels')} ${urlAnalysis.value.domainLevels}
- ${t('tools.url-parser.page.pathDepth')} ${urlAnalysis.value.pathDepth}

${t('tools.url-parser.page.queryParams')}:
${queryParams.value.map((p) => `- ${p.key} = ${p.value}`).join('\n') || t('tools.url-parser.page.none')}
`;

  try {
    await navigator.clipboard.writeText(analysis);
    // 这里可以添加成功提示
  } catch (error) {
    console.error(t('tools.url-parser.page.copyFailedLog'), error);
  }
}

function exportAnalysis() {
  if (!parsedUrl.value) return;

  const report = `${t('tools.url-parser.page.title')}
${t('tools.url-parser.page.exportAnalysis')}: ${new Date().toLocaleString(undefined)}

=== ${t('tools.url-parser.page.basicInfo')} ===
${t('tools.url-parser.page.fullUrl')} ${parsedUrl.value.href}
${t('tools.url-parser.page.protocolShort')} ${parsedUrl.value.protocol}
${t('tools.url-parser.page.hostnameShort')} ${parsedUrl.value.hostname}
${t('tools.url-parser.page.portShort')} ${parsedUrl.value.port || t('tools.url-parser.page.default')}
${t('tools.url-parser.page.path')} ${parsedUrl.value.pathname}
${t('tools.url-parser.page.searchString')} ${parsedUrl.value.search || t('tools.url-parser.page.none')}
${t('tools.url-parser.page.hash')} ${parsedUrl.value.hash || t('tools.url-parser.page.none')}
${t('tools.url-parser.page.origin')} ${parsedUrl.value.origin}

=== ${t('tools.url-parser.page.urlAnalysisTitle')} ===
${t('tools.url-parser.page.isSecure')} ${urlAnalysis.value.isSecure ? t('tools.url-parser.page.yes') : t('tools.url-parser.page.no')}
${t('tools.url-parser.page.isLocal')} ${urlAnalysis.value.isLocalhost ? t('tools.url-parser.page.yes') : t('tools.url-parser.page.no')}
${t('tools.url-parser.page.isIp')} ${urlAnalysis.value.isIpAddress ? t('tools.url-parser.page.yes') : t('tools.url-parser.page.no')}
${t('tools.url-parser.page.defaultPortLabel')} ${urlAnalysis.value.defaultPort}
${t('tools.url-parser.page.domainLevels')} ${urlAnalysis.value.domainLevels}
${t('tools.url-parser.page.pathDepth')} ${urlAnalysis.value.pathDepth}

=== ${t('tools.url-parser.page.queryParams')} ===
${queryParams.value.length > 0 ? queryParams.value.map((p, i) => `${i + 1}. ${p.key} = ${p.value}`).join('\n') : t('tools.url-parser.page.none')}

=== ${t('tools.url-parser.page.urlVariantsTitle')} ===
${t('tools.url-parser.page.withoutQuery')} ${urlVariants.value.withoutQuery}
${t('tools.url-parser.page.withoutHash')} ${urlVariants.value.withoutHash}
${t('tools.url-parser.page.domainOnly')} ${urlVariants.value.domainOnly}
${t('tools.url-parser.page.relativePath')} ${urlVariants.value.relativePath}

${t('tools.url-parser.page.exportAnalysis')}: ${new Date().toLocaleString(undefined)}
`;

  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `url-analysis-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>
