<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">URL 解析器</h3>

        <div class="space-y-3">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">URL 输入</h4>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium mb-1">输入 URL</label>
                <textarea
                  v-model="urlInput"
                  class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
                  rows="3"
                  placeholder="输入要解析的URL，如：&#10;https://example.com:8080/path/to/page?param1=value1&param2=value2#section"
                  @input="parseUrl"
                />
                <p class="text-xs text-gray-500 mt-1">支持完整URL和相对URL</p>
              </div>

              <div class="flex gap-2">
                <button @click="loadSampleUrl" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">加载示例</button>
                <button @click="clearUrl" class="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空</button>
                <button @click="getCurrentUrl" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">当前页面URL</button>
              </div>

              <div v-if="parseError" class="text-red-500 text-sm">
                {{ parseError }}
              </div>

              <div v-if="isValidUrl" class="bg-green-50 dark:bg-green-900/20 rounded p-3">
                <div class="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <span class="text-lg">✓</span>
                  <span class="text-sm font-medium">URL 格式有效</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">URL 构建器</h4>
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium mb-1">协议</label>
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
                  <label class="block text-sm font-medium mb-1">主机名</label>
                  <input v-model="builder.hostname" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="example.com" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium mb-1">端口</label>
                  <input v-model="builder.port" type="number" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="80, 443, 8080..." />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">路径</label>
                  <input v-model="builder.pathname" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="/path/to/page" />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">查询参数</label>
                <div class="space-y-2">
                  <div v-for="(param, index) in builder.searchParams" :key="index" class="flex gap-2">
                    <input v-model="param.key" type="text" class="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="参数名" />
                    <input v-model="param.value" type="text" class="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="参数值" />
                    <button @click="removeParam(index)" class="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded">✕</button>
                  </div>
                  <button @click="addParam" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">添加参数</button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">锚点/片段</label>
                <input v-model="builder.hash" type="text" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="section" />
              </div>

              <div class="bg-white dark:bg-gray-700 rounded p-3 border">
                <div class="text-sm font-medium mb-1">构建的URL:</div>
                <div class="font-mono text-sm break-all text-blue-600 dark:text-blue-400">
                  {{ builtUrl }}
                </div>
              </div>

              <div class="flex gap-2">
                <button @click="useBuiltUrl" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">使用构建的URL</button>
                <button @click="copyBuiltUrl" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">复制</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">解析结果</h3>

        <div v-if="parsedUrl" class="space-y-4">
          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
              <h4 class="font-medium">基本信息</h4>
            </div>
            <div class="p-4 space-y-3">
              <div class="grid grid-cols-1 gap-3 text-sm">
                <div class="flex justify-between">
                  <span class="font-medium">完整URL:</span>
                  <span class="font-mono text-blue-600 dark:text-blue-400 break-all">{{ parsedUrl.href }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">协议:</span>
                  <span class="font-mono">{{ parsedUrl.protocol }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">主机:</span>
                  <span class="font-mono">{{ parsedUrl.host }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">主机名:</span>
                  <span class="font-mono">{{ parsedUrl.hostname }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">端口:</span>
                  <span class="font-mono">{{ parsedUrl.port || '默认' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">路径:</span>
                  <span class="font-mono">{{ parsedUrl.pathname }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">查询字符串:</span>
                  <span class="font-mono">{{ parsedUrl.search || '无' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">锚点:</span>
                  <span class="font-mono">{{ parsedUrl.hash || '无' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="font-medium">源:</span>
                  <span class="font-mono">{{ parsedUrl.origin }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="queryParams.length > 0" class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
              <h4 class="font-medium">查询参数 ({{ queryParams.length }})</h4>
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
                  <button @click="copyParam(param)" class="ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">复制</button>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
              <h4 class="font-medium">URL 分析</h4>
            </div>
            <div class="p-4 space-y-3">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>是否安全连接:</span>
                    <span :class="urlAnalysis.isSecure ? 'text-green-600' : 'text-red-600'">
                      {{ urlAnalysis.isSecure ? '✓ 是' : '✗ 否' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span>是否本地地址:</span>
                    <span :class="urlAnalysis.isLocalhost ? 'text-orange-600' : 'text-blue-600'">
                      {{ urlAnalysis.isLocalhost ? '✓ 是' : '✗ 否' }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span>是否IP地址:</span>
                    <span :class="urlAnalysis.isIpAddress ? 'text-purple-600' : 'text-gray-600'">
                      {{ urlAnalysis.isIpAddress ? '✓ 是' : '✗ 否' }}
                    </span>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span>默认端口:</span>
                    <span class="font-mono">{{ urlAnalysis.defaultPort }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>域名层级:</span>
                    <span class="font-mono">{{ urlAnalysis.domainLevels }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>路径深度:</span>
                    <span class="font-mono">{{ urlAnalysis.pathDepth }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
              <h4 class="font-medium">URL 变体</h4>
            </div>
            <div class="p-4 space-y-3">
              <div class="space-y-2 text-sm">
                <div>
                  <span class="font-medium">不含查询参数:</span>
                  <div class="font-mono text-blue-600 dark:text-blue-400 break-all mt-1">
                    {{ urlVariants.withoutQuery }}
                  </div>
                </div>
                <div>
                  <span class="font-medium">不含锚点:</span>
                  <div class="font-mono text-blue-600 dark:text-blue-400 break-all mt-1">
                    {{ urlVariants.withoutHash }}
                  </div>
                </div>
                <div>
                  <span class="font-medium">仅域名:</span>
                  <div class="font-mono text-blue-600 dark:text-blue-400 break-all mt-1">
                    {{ urlVariants.domainOnly }}
                  </div>
                </div>
                <div>
                  <span class="font-medium">相对路径:</span>
                  <div class="font-mono text-blue-600 dark:text-blue-400 break-all mt-1">
                    {{ urlVariants.relativePath }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="exportAnalysis" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">导出分析报告</button>
            <button @click="copyAnalysis" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">复制结果</button>
          </div>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">🔗</div>
          <div class="text-lg mb-2">URL 解析器</div>
          <div class="text-sm">输入URL开始解析</div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">URL 解析功能</h4>
          <ul class="space-y-1">
            <li>• 完整URL组件分解</li>
            <li>• 查询参数解析和编辑</li>
            <li>• URL安全性分析</li>
            <li>• 域名和路径分析</li>
            <li>• URL变体生成</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">URL 构建功能</h4>
          <ul class="space-y-1">
            <li>• 可视化URL构建</li>
            <li>• 查询参数管理</li>
            <li>• 协议和端口选择</li>
            <li>• 实时预览构建结果</li>
            <li>• 一键复制和使用</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface QueryParam {
  key: string
  value: string
}

interface UrlBuilder {
  protocol: string
  hostname: string
  port: string
  pathname: string
  searchParams: QueryParam[]
  hash: string
}

interface UrlAnalysis {
  isSecure: boolean
  isLocalhost: boolean
  isIpAddress: boolean
  defaultPort: string
  domainLevels: number
  pathDepth: number
}

interface UrlVariants {
  withoutQuery: string
  withoutHash: string
  domainOnly: string
  relativePath: string
}

const urlInput = ref('')
const parseError = ref('')
const parsedUrl = ref<URL | null>(null)

const builder = ref<UrlBuilder>({
  protocol: 'https:',
  hostname: '',
  port: '',
  pathname: '',
  searchParams: [],
  hash: ''
})

const isValidUrl = computed(() => {
  return parsedUrl.value !== null && !parseError.value
})

const queryParams = computed((): QueryParam[] => {
  if (!parsedUrl.value) return []

  const params: QueryParam[] = []
  parsedUrl.value.searchParams.forEach((value, key) => {
    params.push({ key, value })
  })
  return params
})

const urlAnalysis = computed((): UrlAnalysis => {
  if (!parsedUrl.value) {
    return {
      isSecure: false,
      isLocalhost: false,
      isIpAddress: false,
      defaultPort: '',
      domainLevels: 0,
      pathDepth: 0
    }
  }

  const url = parsedUrl.value
  const isSecure = url.protocol === 'https:' || url.protocol === 'wss:'
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname.endsWith('.local')
  const isIpAddress = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(url.hostname)

  const defaultPorts: { [key: string]: string } = {
    'http:': '80',
    'https:': '443',
    'ftp:': '21',
    'ws:': '80',
    'wss:': '443'
  }
  const defaultPort = defaultPorts[url.protocol] || '未知'

  const domainLevels = url.hostname.split('.').length
  const pathDepth = url.pathname.split('/').filter((segment) => segment !== '').length

  return {
    isSecure,
    isLocalhost,
    isIpAddress,
    defaultPort,
    domainLevels,
    pathDepth
  }
})

const urlVariants = computed((): UrlVariants => {
  if (!parsedUrl.value) {
    return {
      withoutQuery: '',
      withoutHash: '',
      domainOnly: '',
      relativePath: ''
    }
  }

  const url = parsedUrl.value

  return {
    withoutQuery: `${url.protocol}//${url.host}${url.pathname}${url.hash}`,
    withoutHash: `${url.protocol}//${url.host}${url.pathname}${url.search}`,
    domainOnly: `${url.protocol}//${url.host}`,
    relativePath: `${url.pathname}${url.search}${url.hash}`
  }
})

const builtUrl = computed((): string => {
  try {
    let url = `${builder.value.protocol}//${builder.value.hostname}`

    if (builder.value.port) {
      url += `:${builder.value.port}`
    }

    if (builder.value.pathname) {
      if (!builder.value.pathname.startsWith('/')) {
        url += '/'
      }
      url += builder.value.pathname
    }

    const validParams = builder.value.searchParams.filter((p) => p.key.trim() !== '')
    if (validParams.length > 0) {
      const searchParams = new URLSearchParams()
      validParams.forEach((param) => {
        searchParams.append(param.key, param.value)
      })
      url += `?${searchParams.toString()}`
    }

    if (builder.value.hash) {
      url += `#${builder.value.hash}`
    }

    return url
  } catch (error) {
    return '无效的URL配置'
  }
})

function parseUrl() {
  parseError.value = ''
  parsedUrl.value = null

  if (!urlInput.value.trim()) {
    return
  }

  try {
    // 尝试解析URL
    let urlToParse = urlInput.value.trim()

    // 如果没有协议，添加默认协议
    if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(urlToParse)) {
      urlToParse = 'https://' + urlToParse
    }

    parsedUrl.value = new URL(urlToParse)
  } catch (error) {
    parseError.value = 'URL格式无效'
  }
}

function loadSampleUrl() {
  urlInput.value = 'https://example.com:8080/api/v1/users?page=1&limit=10&sort=name&filter=active#results'
  parseUrl()
}

function clearUrl() {
  urlInput.value = ''
  parsedUrl.value = null
  parseError.value = ''
}

function getCurrentUrl() {
  if (typeof window !== 'undefined') {
    urlInput.value = window.location.href
    parseUrl()
  }
}

function addParam() {
  builder.value.searchParams.push({ key: '', value: '' })
}

function removeParam(index: number) {
  builder.value.searchParams.splice(index, 1)
}

function useBuiltUrl() {
  urlInput.value = builtUrl.value
  parseUrl()
}

async function copyBuiltUrl() {
  try {
    await navigator.clipboard.writeText(builtUrl.value)
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error)
  }
}

async function copyParam(param: QueryParam) {
  try {
    await navigator.clipboard.writeText(`${param.key}=${param.value}`)
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error)
  }
}

async function copyAnalysis() {
  if (!parsedUrl.value) return

  const analysis = `URL 解析结果
完整URL: ${parsedUrl.value.href}
协议: ${parsedUrl.value.protocol}
主机: ${parsedUrl.value.host}
路径: ${parsedUrl.value.pathname}
查询参数: ${parsedUrl.value.search || '无'}
锚点: ${parsedUrl.value.hash || '无'}

安全分析:
- 安全连接: ${urlAnalysis.value.isSecure ? '是' : '否'}
- 本地地址: ${urlAnalysis.value.isLocalhost ? '是' : '否'}
- IP地址: ${urlAnalysis.value.isIpAddress ? '是' : '否'}
- 默认端口: ${urlAnalysis.value.defaultPort}
- 域名层级: ${urlAnalysis.value.domainLevels}
- 路径深度: ${urlAnalysis.value.pathDepth}

查询参数详情:
${queryParams.value.map((p) => `- ${p.key} = ${p.value}`).join('\n') || '无查询参数'}
`

  try {
    await navigator.clipboard.writeText(analysis)
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error)
  }
}

function exportAnalysis() {
  if (!parsedUrl.value) return

  const report = `URL 解析报告
生成时间: ${new Date().toLocaleString('zh-CN')}

=== 基本信息 ===
完整URL: ${parsedUrl.value.href}
协议: ${parsedUrl.value.protocol}
主机名: ${parsedUrl.value.hostname}
端口: ${parsedUrl.value.port || '默认'}
路径: ${parsedUrl.value.pathname}
查询字符串: ${parsedUrl.value.search || '无'}
锚点: ${parsedUrl.value.hash || '无'}
源: ${parsedUrl.value.origin}

=== 安全分析 ===
安全连接 (HTTPS/WSS): ${urlAnalysis.value.isSecure ? '是' : '否'}
本地地址: ${urlAnalysis.value.isLocalhost ? '是' : '否'}
IP地址格式: ${urlAnalysis.value.isIpAddress ? '是' : '否'}
默认端口: ${urlAnalysis.value.defaultPort}
域名层级数: ${urlAnalysis.value.domainLevels}
路径深度: ${urlAnalysis.value.pathDepth}

=== 查询参数 ===
${queryParams.value.length > 0 ? queryParams.value.map((p, i) => `${i + 1}. ${p.key} = ${p.value}`).join('\n') : '无查询参数'}

=== URL 变体 ===
不含查询参数: ${urlVariants.value.withoutQuery}
不含锚点: ${urlVariants.value.withoutHash}
仅域名: ${urlVariants.value.domainOnly}
相对路径: ${urlVariants.value.relativePath}

报告生成时间: ${new Date().toLocaleString('zh-CN')}
`

  const blob = new Blob([report], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `url-analysis-${new Date().toISOString().slice(0, 10)}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
