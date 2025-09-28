<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">HTTP 请求配置</h3>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">请求设置</h4>
            <div class="flex gap-2">
              <button @click="loadExample" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">加载示例</button>
              <button @click="clearRequest" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空</button>
            </div>
          </div>

          <div class="space-y-3">
            <div class="grid grid-cols-4 gap-2">
              <div>
                <label class="block text-sm font-medium mb-1">方法</label>
                <select v-model="request.method" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="DELETE">DELETE</option>
                  <option value="PATCH">PATCH</option>
                  <option value="HEAD">HEAD</option>
                  <option value="OPTIONS">OPTIONS</option>
                </select>
              </div>
              <div class="col-span-3">
                <label class="block text-sm font-medium mb-1">URL</label>
                <input v-model="request.url" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="https://api.example.com/users" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <label class="flex items-center space-x-2">
                <input v-model="request.followRedirects" type="checkbox" />
                <span class="text-sm">跟随重定向</span>
              </label>
              <label class="flex items-center space-x-2">
                <input v-model="request.validateSSL" type="checkbox" />
                <span class="text-sm">验证 SSL</span>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">超时时间 (秒)</label>
              <input v-model.number="request.timeout" type="number" min="1" max="300" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">请求头</h4>
            <button @click="addHeader" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">添加</button>
          </div>

          <div class="space-y-2">
            <div v-for="(header, index) in request.headers" :key="index" class="grid grid-cols-5 gap-2">
              <div class="col-span-2">
                <input v-model="header.key" type="text" class="w-full px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Header Name" />
              </div>
              <div class="col-span-2">
                <input v-model="header.value" type="text" class="w-full px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Header Value" />
              </div>
              <div>
                <button @click="removeHeader(index)" class="w-full px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">删除</button>
              </div>
            </div>

            <div v-if="request.headers.length === 0" class="text-center py-4 text-gray-500 text-sm">暂无请求头</div>
          </div>

          <div class="mt-3 pt-3 border-t">
            <div class="text-sm font-medium mb-2">常用请求头</div>
            <div class="grid grid-cols-2 gap-2">
              <button @click="addCommonHeader('Content-Type', 'application/json')" class="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs">JSON Content-Type</button>
              <button @click="addCommonHeader('Authorization', 'Bearer ')" class="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs">Bearer Token</button>
              <button @click="addCommonHeader('User-Agent', 'FancyTools/1.0')" class="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs">User-Agent</button>
              <button @click="addCommonHeader('Accept', 'application/json')" class="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs">Accept JSON</button>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">请求体</h4>
            <div class="flex gap-2">
              <select v-model="request.bodyType" class="px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="none">无</option>
                <option value="json">JSON</option>
                <option value="form">表单数据</option>
                <option value="text">纯文本</option>
                <option value="xml">XML</option>
              </select>
              <button @click="formatBody" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">格式化</button>
            </div>
          </div>

          <div v-if="request.bodyType !== 'none'" class="space-y-3">
            <div v-if="request.bodyType === 'form'">
              <div class="space-y-2">
                <div v-for="(param, index) in request.formData" :key="index" class="grid grid-cols-5 gap-2">
                  <div class="col-span-2">
                    <input v-model="param.key" type="text" class="w-full px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="参数名" />
                  </div>
                  <div class="col-span-2">
                    <input v-model="param.value" type="text" class="w-full px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="参数值" />
                  </div>
                  <div>
                    <button @click="removeFormParam(index)" class="w-full px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">删除</button>
                  </div>
                </div>
                <button @click="addFormParam" class="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">添加参数</button>
              </div>
            </div>

            <div v-else>
              <textarea
                v-model="request.body"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono text-sm"
                rows="8"
                :placeholder="getBodyPlaceholder()"
              />
            </div>

            <div class="flex items-center justify-between text-sm text-gray-500">
              <span>字符数: {{ getBodyLength() }}</span>
              <span>字节数: {{ getBodyByteLength() }}</span>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">快速操作</h4>
          <div class="grid grid-cols-2 gap-2">
            <button @click="sendRequest" :disabled="isLoading" class="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm">
              {{ isLoading ? '发送中...' : '发送请求' }}
            </button>
            <button @click="saveRequest" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">保存请求</button>
            <button @click="exportCurl" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">导出 cURL</button>
            <button @click="importCurl" class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm">导入 cURL</button>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">保存的请求</h4>
          <div v-if="savedRequests.length > 0" class="space-y-2 max-h-40 overflow-y-auto">
            <div v-for="(saved, index) in savedRequests" :key="index" class="flex justify-between items-center text-sm p-2 bg-white dark:bg-gray-700 rounded">
              <div class="flex-1 truncate">
                <div class="font-medium">{{ saved.name }}</div>
                <div class="text-xs text-gray-500">{{ saved.method }} {{ saved.url }}</div>
              </div>
              <div class="flex gap-1">
                <button @click="loadSavedRequest(saved)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">加载</button>
                <button @click="deleteSavedRequest(index)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">删除</button>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4 text-gray-500 text-sm">暂无保存的请求</div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">响应结果</h3>

        <div v-if="response" class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">响应信息</h4>
            <div class="flex gap-2">
              <button @click="copyResponse" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制响应</button>
              <button @click="downloadResponse" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">下载</button>
            </div>
          </div>
          <div class="p-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div class="text-center">
                <div class="text-sm text-gray-500">状态码</div>
                <div class="text-lg font-mono" :class="getStatusClass(response.status)">
                  {{ response.status }}
                </div>
              </div>
              <div class="text-center">
                <div class="text-sm text-gray-500">响应时间</div>
                <div class="text-lg font-mono">{{ response.duration }}ms</div>
              </div>
              <div class="text-center">
                <div class="text-sm text-gray-500">响应大小</div>
                <div class="text-lg font-mono">{{ formatBytes(response.size) }}</div>
              </div>
              <div class="text-center">
                <div class="text-sm text-gray-500">内容类型</div>
                <div class="text-sm font-mono truncate">{{ response.contentType }}</div>
              </div>
            </div>

            <div class="space-y-3">
              <div>
                <div class="text-sm font-medium mb-2">响应头</div>
                <div class="bg-gray-50 dark:bg-gray-900 p-3 rounded border max-h-32 overflow-y-auto">
                  <div v-for="(value, key) in response.headers" :key="key" class="text-sm font-mono">
                    <span class="text-blue-600 dark:text-blue-400">{{ key }}:</span>
                    <span class="ml-2">{{ value }}</span>
                  </div>
                </div>
              </div>

              <div>
                <div class="flex justify-between items-center mb-2">
                  <div class="text-sm font-medium">响应体</div>
                  <div class="flex gap-2">
                    <button
                      v-for="format in responseFormats"
                      :key="format"
                      @click="responseFormat = format"
                      :class="responseFormat === format ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'"
                      class="px-2 py-1 rounded text-xs"
                    >
                      {{ format.toUpperCase() }}
                    </button>
                  </div>
                </div>
                <div class="bg-gray-50 dark:bg-gray-900 p-3 rounded border">
                  <pre v-if="responseFormat === 'raw'" class="text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">{{ response.data }}</pre>
                  <pre v-else-if="responseFormat === 'json'" class="text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto" v-html="highlightJson(response.data)"></pre>
                  <pre v-else-if="responseFormat === 'xml'" class="text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto" v-html="highlightXml(response.data)"></pre>
                  <div v-else-if="responseFormat === 'preview'" class="max-h-96 overflow-y-auto">
                    <div v-if="isImageResponse()" class="text-center">
                      <img :src="getImageDataUrl()" alt="Response Image" class="max-w-full h-auto" />
                    </div>
                    <div v-else-if="isHtmlResponse()" v-html="response.data"></div>
                    <div v-else class="text-gray-500 text-center py-8">无法预览此类型的响应</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="error" class="bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg">
          <div class="p-3 border-b bg-red-50 dark:bg-red-900/20">
            <h4 class="font-medium text-red-600 dark:text-red-400">请求错误</h4>
          </div>
          <div class="p-4">
            <div class="text-red-600 dark:text-red-400 text-sm">
              {{ error }}
            </div>
          </div>
        </div>

        <div v-else class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-8 text-center text-gray-500">
            <div class="text-lg mb-2">准备发送请求</div>
            <div class="text-sm">配置请求参数后点击"发送请求"按钮</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">请求历史</h4>
          </div>
          <div class="p-4">
            <div v-if="requestHistory.length > 0" class="space-y-2 max-h-40 overflow-y-auto">
              <div v-for="(history, index) in requestHistory.slice(0, 10)" :key="index" class="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="flex-1 truncate">
                  <div class="font-mono text-xs">
                    <span :class="getMethodClass(history.method)">{{ history.method }}</span>
                    <span class="ml-2">{{ history.url }}</span>
                  </div>
                  <div class="text-xs text-gray-500">{{ history.timestamp }} - {{ history.status ? history.status : '失败' }}</div>
                </div>
                <div class="flex gap-1">
                  <button @click="loadFromHistory(history)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">重发</button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">暂无请求历史</div>
            <div v-if="requestHistory.length > 0" class="mt-3 pt-3 border-t">
              <button @click="clearHistory" class="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空历史</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">基本功能</h4>
          <ul class="space-y-1">
            <li>• 支持所有 HTTP 方法</li>
            <li>• 自定义请求头和参数</li>
            <li>• 多种请求体格式</li>
            <li>• 响应数据格式化显示</li>
            <li>• 请求和响应时间统计</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">高级功能</h4>
          <ul class="space-y-1">
            <li>• cURL 命令导入导出</li>
            <li>• 请求模板保存</li>
            <li>• 响应数据下载</li>
            <li>• 语法高亮显示</li>
            <li>• 图片和 HTML 预览</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">注意事项</h4>
          <ul class="space-y-1">
            <li>• 受浏览器 CORS 策略限制</li>
            <li>• 某些请求头可能被浏览器过滤</li>
            <li>• 大文件响应可能影响性能</li>
            <li>• 敏感数据请谨慎处理</li>
            <li>• 支持本地开发和测试</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface Header {
  key: string;
  value: string;
}

interface FormParam {
  key: string;
  value: string;
}

interface Request {
  method: string;
  url: string;
  headers: Header[];
  body: string;
  bodyType: 'none' | 'json' | 'form' | 'text' | 'xml';
  formData: FormParam[];
  timeout: number;
  followRedirects: boolean;
  validateSSL: boolean;
}

interface Response {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: string;
  duration: number;
  size: number;
  contentType: string;
}

interface SavedRequest {
  name: string;
  method: string;
  url: string;
  headers: Header[];
  body: string;
  bodyType: string;
  formData: FormParam[];
}

interface RequestHistory {
  method: string;
  url: string;
  status?: number;
  timestamp: string;
  request: Request;
}

const request = ref<Request>({
  method: 'GET',
  url: '',
  headers: [],
  body: '',
  bodyType: 'none',
  formData: [],
  timeout: 30,
  followRedirects: true,
  validateSSL: true
});

const response = ref<Response | null>(null);
const error = ref<string>('');
const isLoading = ref(false);
const responseFormat = ref<'raw' | 'json' | 'xml' | 'preview'>('raw');
const savedRequests = ref<SavedRequest[]>([]);
const requestHistory = ref<RequestHistory[]>([]);

const responseFormats = ['raw', 'json', 'xml', 'preview'];

onMounted(() => {
  loadSavedRequests();
  loadRequestHistory();
});

function addHeader() {
  request.value.headers.push({ key: '', value: '' });
}

function removeHeader(index: number) {
  request.value.headers.splice(index, 1);
}

function addCommonHeader(key: string, value: string) {
  const existingIndex = request.value.headers.findIndex((h) => h.key.toLowerCase() === key.toLowerCase());
  if (existingIndex >= 0) {
    request.value.headers[existingIndex].value = value;
  } else {
    request.value.headers.push({ key, value });
  }
}

function addFormParam() {
  request.value.formData.push({ key: '', value: '' });
}

function removeFormParam(index: number) {
  request.value.formData.splice(index, 1);
}

function getBodyPlaceholder(): string {
  switch (request.value.bodyType) {
    case 'json':
      return '{\n  "key": "value"\n}';
    case 'xml':
      return '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <item>value</item>\n</root>';
    case 'text':
      return '输入纯文本内容...';
    default:
      return '';
  }
}

function getBodyLength(): number {
  if (request.value.bodyType === 'form') {
    return request.value.formData.reduce((acc, param) => acc + param.key.length + param.value.length, 0);
  }
  return request.value.body.length;
}

function getBodyByteLength(): number {
  const text =
    request.value.bodyType === 'form'
      ? new URLSearchParams(
          request.value.formData.reduce((acc, param) => {
            acc[param.key] = param.value;
            return acc;
          }, {} as Record<string, string>)
        ).toString()
      : request.value.body;

  return new Blob([text]).size;
}

function formatBody() {
  if (request.value.bodyType === 'json') {
    try {
      const parsed = JSON.parse(request.value.body);
      request.value.body = JSON.stringify(parsed, null, 2);
    } catch (error) {
      // 忽略格式化错误
    }
  }
}

async function sendRequest() {
  if (!request.value.url) {
    error.value = '请输入请求 URL';
    return;
  }

  isLoading.value = true;
  error.value = '';
  response.value = null;

  const startTime = Date.now();

  try {
    // 构建请求选项
    const options: RequestInit = {
      method: request.value.method,
      headers: {},
      signal: AbortSignal.timeout(request.value.timeout * 1000)
    };

    // 添加请求头
    request.value.headers.forEach((header) => {
      if (header.key && header.value) {
        (options.headers as Record<string, string>)[header.key] = header.value;
      }
    });

    // 添加请求体
    if (request.value.method !== 'GET' && request.value.method !== 'HEAD') {
      if (request.value.bodyType === 'form') {
        const formData = new URLSearchParams();
        request.value.formData.forEach((param) => {
          if (param.key) {
            formData.append(param.key, param.value);
          }
        });
        options.body = formData.toString();
        if (!(options.headers as Record<string, string>)['Content-Type']) {
          (options.headers as Record<string, string>)['Content-Type'] = 'application/x-www-form-urlencoded';
        }
      } else if (request.value.bodyType !== 'none' && request.value.body) {
        options.body = request.value.body;

        // 自动设置 Content-Type
        if (!(options.headers as Record<string, string>)['Content-Type']) {
          switch (request.value.bodyType) {
            case 'json':
              (options.headers as Record<string, string>)['Content-Type'] = 'application/json';
              break;
            case 'xml':
              (options.headers as Record<string, string>)['Content-Type'] = 'application/xml';
              break;
            case 'text':
              (options.headers as Record<string, string>)['Content-Type'] = 'text/plain';
              break;
          }
        }
      }
    }

    const fetchResponse = await fetch(request.value.url, options);
    const duration = Date.now() - startTime;

    // 获取响应头
    const responseHeaders: Record<string, string> = {};
    fetchResponse.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    // 获取响应数据
    const responseText = await fetchResponse.text();
    const contentType = fetchResponse.headers.get('content-type') || 'text/plain';

    response.value = {
      status: fetchResponse.status,
      statusText: fetchResponse.statusText,
      headers: responseHeaders,
      data: responseText,
      duration,
      size: new Blob([responseText]).size,
      contentType
    };

    // 自动选择响应格式
    if (contentType.includes('application/json')) {
      responseFormat.value = 'json';
    } else if (contentType.includes('xml')) {
      responseFormat.value = 'xml';
    } else if (contentType.includes('text/html') || contentType.includes('image/')) {
      responseFormat.value = 'preview';
    } else {
      responseFormat.value = 'raw';
    }

    // 添加到历史记录
    addToHistory(fetchResponse.status);
  } catch (err: any) {
    const duration = Date.now() - startTime;
    error.value = err.name === 'AbortError' ? '请求超时' : err.message || '请求失败';

    // 添加到历史记录
    addToHistory();
  } finally {
    isLoading.value = false;
  }
}

function saveRequest() {
  const name = prompt('请输入请求名称:');
  if (!name) return;

  const savedRequest: SavedRequest = {
    name,
    method: request.value.method,
    url: request.value.url,
    headers: [...request.value.headers],
    body: request.value.body,
    bodyType: request.value.bodyType,
    formData: [...request.value.formData]
  };

  savedRequests.value.unshift(savedRequest);
  savedRequests.value = savedRequests.value.slice(0, 20); // 限制数量
  saveSavedRequests();
}

function loadSavedRequest(saved: SavedRequest) {
  request.value = {
    method: saved.method,
    url: saved.url,
    headers: [...saved.headers],
    body: saved.body,
    bodyType: saved.bodyType as any,
    formData: [...saved.formData],
    timeout: request.value.timeout,
    followRedirects: request.value.followRedirects,
    validateSSL: request.value.validateSSL
  };
}

function deleteSavedRequest(index: number) {
  savedRequests.value.splice(index, 1);
  saveSavedRequests();
}

function exportCurl() {
  let curl = `curl -X ${request.value.method}`;

  // 添加 URL
  curl += ` "${request.value.url}"`;

  // 添加请求头
  request.value.headers.forEach((header) => {
    if (header.key && header.value) {
      curl += ` -H "${header.key}: ${header.value}"`;
    }
  });

  // 添加请求体
  if (request.value.method !== 'GET' && request.value.method !== 'HEAD') {
    if (request.value.bodyType === 'form') {
      request.value.formData.forEach((param) => {
        if (param.key) {
          curl += ` -d "${param.key}=${param.value}"`;
        }
      });
    } else if (request.value.bodyType !== 'none' && request.value.body) {
      curl += ` -d '${request.value.body.replace(/'/g, "\\'")}'`;
    }
  }

  // 添加其他选项
  if (!request.value.followRedirects) {
    curl += ' --no-location';
  }

  if (!request.value.validateSSL) {
    curl += ' -k';
  }

  curl += ` --max-time ${request.value.timeout}`;

  copyText(curl);
}

function importCurl() {
  const curlCommand = prompt('请输入 cURL 命令:');
  if (!curlCommand) return;

  try {
    // 简单的 cURL 解析（实际应用中可能需要更复杂的解析器）
    const parts = curlCommand.trim().split(/\s+/);

    // 重置请求
    clearRequest();

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (part === '-X' && i + 1 < parts.length) {
        request.value.method = parts[i + 1].toUpperCase();
        i++;
      } else if (part === '-H' && i + 1 < parts.length) {
        const header = parts[i + 1].replace(/"/g, '');
        const [key, ...valueParts] = header.split(':');
        if (key && valueParts.length > 0) {
          request.value.headers.push({
            key: key.trim(),
            value: valueParts.join(':').trim()
          });
        }
        i++;
      } else if (part === '-d' && i + 1 < parts.length) {
        request.value.body = parts[i + 1].replace(/^['"]|['"]$/g, '');
        request.value.bodyType = 'json';
        i++;
      } else if (part.startsWith('http')) {
        request.value.url = part.replace(/"/g, '');
      }
    }
  } catch (error) {
    alert('cURL 命令解析失败');
  }
}

function loadExample() {
  request.value = {
    method: 'GET',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    headers: [
      { key: 'Accept', value: 'application/json' },
      { key: 'User-Agent', value: 'FancyTools/1.0' }
    ],
    body: '',
    bodyType: 'none',
    formData: [],
    timeout: 30,
    followRedirects: true,
    validateSSL: true
  };
}

function clearRequest() {
  request.value = {
    method: 'GET',
    url: '',
    headers: [],
    body: '',
    bodyType: 'none',
    formData: [],
    timeout: 30,
    followRedirects: true,
    validateSSL: true
  };
  response.value = null;
  error.value = '';
}

function loadFromHistory(history: RequestHistory) {
  request.value = { ...history.request };
}

function addToHistory(status?: number) {
  const historyItem: RequestHistory = {
    method: request.value.method,
    url: request.value.url,
    status,
    timestamp: new Date().toLocaleString(),
    request: { ...request.value }
  };

  requestHistory.value.unshift(historyItem);
  requestHistory.value = requestHistory.value.slice(0, 50); // 限制历史记录数量
  saveRequestHistory();
}

function clearHistory() {
  requestHistory.value = [];
  saveRequestHistory();
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error);
  }
}

async function copyResponse() {
  if (!response.value) return;

  const text = `Status: ${response.value.status}\nHeaders:\n${Object.entries(response.value.headers)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')}\n\nBody:\n${response.value.data}`;

  try {
    await navigator.clipboard.writeText(text);
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error);
  }
}

function downloadResponse() {
  if (!response.value) return;

  const blob = new Blob([response.value.data], { type: response.value.contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `response-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function getStatusClass(status: number): string {
  if (status >= 200 && status < 300) return 'text-green-600';
  if (status >= 300 && status < 400) return 'text-yellow-600';
  if (status >= 400 && status < 500) return 'text-orange-600';
  if (status >= 500) return 'text-red-600';
  return 'text-gray-600';
}

function getMethodClass(method: string): string {
  switch (method) {
    case 'GET':
      return 'text-blue-600';
    case 'POST':
      return 'text-green-600';
    case 'PUT':
      return 'text-yellow-600';
    case 'DELETE':
      return 'text-red-600';
    case 'PATCH':
      return 'text-purple-600';
    default:
      return 'text-gray-600';
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function highlightJson(text: string): string {
  try {
    const parsed = JSON.parse(text);
    const formatted = JSON.stringify(parsed, null, 2);

    return formatted
      .replace(/(".*?")\s*:/g, '<span class="text-blue-600">$1</span>:')
      .replace(/:\s*(".*?")/g, ': <span class="text-green-600">$1</span>')
      .replace(/:\s*(\d+)/g, ': <span class="text-purple-600">$1</span>')
      .replace(/:\s*(true|false|null)/g, ': <span class="text-orange-600">$1</span>');
  } catch (error) {
    return text;
  }
}

function highlightXml(text: string): string {
  return text.replace(/(&lt;\/?)([^&\s>]+)/g, '$1<span class="text-blue-600">$2</span>').replace(/(\w+)=("[^"]*")/g, '<span class="text-purple-600">$1</span>=<span class="text-green-600">$2</span>');
}

function isImageResponse(): boolean {
  return response.value?.contentType.startsWith('image/') || false;
}

function isHtmlResponse(): boolean {
  return response.value?.contentType.includes('text/html') || false;
}

function getImageDataUrl(): string {
  if (!response.value || !isImageResponse()) return '';

  // 这里需要处理二进制数据，实际实现中可能需要更复杂的处理
  return `data:${response.value.contentType};base64,${btoa(response.value.data)}`;
}

function loadSavedRequests() {
  try {
    const saved = localStorage.getItem('http-requester-saved');
    if (saved) {
      savedRequests.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error('加载保存的请求失败:', error);
  }
}

function saveSavedRequests() {
  try {
    localStorage.setItem('http-requester-saved', JSON.stringify(savedRequests.value));
  } catch (error) {
    console.error('保存请求失败:', error);
  }
}

function loadRequestHistory() {
  try {
    const saved = localStorage.getItem('http-requester-history');
    if (saved) {
      requestHistory.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error('加载请求历史失败:', error);
  }
}

function saveRequestHistory() {
  try {
    localStorage.setItem('http-requester-history', JSON.stringify(requestHistory.value));
  } catch (error) {
    console.error('保存请求历史失败:', error);
  }
}
</script>
