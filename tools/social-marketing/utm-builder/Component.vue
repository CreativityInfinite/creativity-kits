<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">UTM 参数配置</h3>
        
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">网站URL *</label>
            <input
              v-model="baseUrl"
              type="url"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="https://example.com/page"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">
              Campaign Source (utm_source) *
              <span class="text-xs text-gray-500 ml-1">流量来源</span>
            </label>
            <input
              v-model="utmSource"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="google, facebook, newsletter"
            />
            <p class="text-xs text-gray-500 mt-1">标识流量来源，如搜索引擎、社交媒体等</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">
              Campaign Medium (utm_medium) *
              <span class="text-xs text-gray-500 ml-1">营销媒介</span>
            </label>
            <select
              v-model="utmMedium"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">选择媒介类型</option>
              <option value="cpc">cpc (付费搜索)</option>
              <option value="organic">organic (自然搜索)</option>
              <option value="social">social (社交媒体)</option>
              <option value="email">email (邮件营销)</option>
              <option value="referral">referral (推荐链接)</option>
              <option value="display">display (展示广告)</option>
              <option value="affiliate">affiliate (联盟营销)</option>
              <option value="direct">direct (直接访问)</option>
            </select>
            <input
              v-if="utmMedium === 'custom'"
              v-model="customMedium"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white mt-2"
              placeholder="自定义媒介类型"
            />
            <p class="text-xs text-gray-500 mt-1">标识营销媒介类型</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">
              Campaign Name (utm_campaign) *
              <span class="text-xs text-gray-500 ml-1">活动名称</span>
            </label>
            <input
              v-model="utmCampaign"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="spring_sale, product_launch"
            />
            <p class="text-xs text-gray-500 mt-1">标识具体的营销活动</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">
              Campaign Term (utm_term)
              <span class="text-xs text-gray-500 ml-1">关键词</span>
            </label>
            <input
              v-model="utmTerm"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="running+shoes, best+laptop"
            />
            <p class="text-xs text-gray-500 mt-1">付费搜索的关键词（可选）</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">
              Campaign Content (utm_content)
              <span class="text-xs text-gray-500 ml-1">广告内容</span>
            </label>
            <input
              v-model="utmContent"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="logolink, textlink, banner_ad"
            />
            <p class="text-xs text-gray-500 mt-1">区分相同广告的不同版本（可选）</p>
          </div>
        </div>
        
        <div class="flex gap-2">
          <button
            @click="generateUrl"
            :disabled="!canGenerate"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md"
          >
            生成UTM链接
          </button>
          <button
            @click="loadPreset"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
          >
            加载预设
          </button>
          <button
            @click="clearAll"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
          >
            清空
          </button>
        </div>
      </div>
      
      <div class="space-y-4">
        <h3 class="font-medium text-lg">生成的UTM链接</h3>
        
        <div v-if="generatedUrl" class="space-y-3">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <label class="block text-sm font-medium mb-2">完整链接</label>
            <div class="bg-white dark:bg-gray-700 rounded border p-3 font-mono text-sm break-all">
              {{ generatedUrl }}
            </div>
            <div class="flex gap-2 mt-2">
              <button
                @click="copyUrl"
                class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
              >
                复制链接
              </button>
              <button
                @click="openPreview"
                class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
              >
                预览
              </button>
              <button
                @click="generateQR"
                class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
              >
                生成二维码
              </button>
            </div>
          </div>
          
          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-2">UTM参数解析</h4>
            <div class="space-y-2 text-sm">
              <div class="grid grid-cols-2 gap-2">
                <span class="font-medium">Source:</span>
                <span class="font-mono">{{ utmSource }}</span>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <span class="font-medium">Medium:</span>
                <span class="font-mono">{{ finalMedium }}</span>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <span class="font-medium">Campaign:</span>
                <span class="font-mono">{{ utmCampaign }}</span>
              </div>
              <div v-if="utmTerm" class="grid grid-cols-2 gap-2">
                <span class="font-medium">Term:</span>
                <span class="font-mono">{{ utmTerm }}</span>
              </div>
              <div v-if="utmContent" class="grid grid-cols-2 gap-2">
                <span class="font-medium">Content:</span>
                <span class="font-mono">{{ utmContent }}</span>
              </div>
            </div>
          </div>
          
          <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-2">链接统计预测</h4>
            <div class="text-sm space-y-1">
              <div>原始链接长度: {{ baseUrl.length }} 字符</div>
              <div>UTM参数长度: {{ utmParamsLength }} 字符</div>
              <div>总链接长度: {{ generatedUrl.length }} 字符</div>
              <div class="mt-2">
                <span class="font-medium">建议: </span>
                <span :class="generatedUrl.length > 2000 ? 'text-red-600' : 'text-green-600'">
                  {{ generatedUrl.length > 2000 ? '链接过长，建议使用短链接服务' : '链接长度适中' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="qrCodeUrl" class="bg-white dark:bg-gray-800 rounded-lg p-4 border text-center">
          <h4 class="font-medium mb-3">二维码</h4>
          <img :src="qrCodeUrl" alt="UTM链接二维码" class="mx-auto mb-3" />
          <button
            @click="downloadQR"
            class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
          >
            下载二维码
          </button>
        </div>
        
        <div v-if="!generatedUrl" class="text-center py-8 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">🔗</div>
          <div class="text-lg mb-2">UTM链接构建器</div>
          <div class="text-sm">填写左侧参数生成营销跟踪链接</div>
        </div>
      </div>
    </div>
    
    <div v-if="history.length > 0" class="space-y-2">
      <h3 class="font-medium">历史记录</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div
          v-for="(item, index) in history"
          :key="index"
          class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm"
        >
          <div class="flex justify-between items-start mb-2">
            <div class="font-medium">{{ item.campaign }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(item.timestamp) }}</div>
          </div>
          <div class="font-mono text-xs break-all text-gray-600 dark:text-gray-400 mb-2">
            {{ item.url }}
          </div>
          <div class="flex gap-2">
            <button
              @click="loadFromHistory(item)"
              class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
            >
              加载
            </button>
            <button
              @click="copyHistoryUrl(item.url)"
              class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
            >
              复制
            </button>
            <button
              @click="removeFromHistory(index)"
              class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">UTM参数说明</h3>
      <div class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
        <div><strong>utm_source:</strong> 流量来源 (必填) - 如 google, facebook, newsletter</div>
        <div><strong>utm_medium:</strong> 营销媒介 (必填) - 如 cpc, organic, social, email</div>
        <div><strong>utm_campaign:</strong> 活动名称 (必填) - 如 spring_sale, product_launch</div>
        <div><strong>utm_term:</strong> 关键词 (可选) - 付费搜索的关键词</div>
        <div><strong>utm_content:</strong> 广告内容 (可选) - 区分相同广告的不同版本</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface HistoryItem {
  url: string
  source: string
  medium: string
  campaign: string
  term?: string
  content?: string
  timestamp: number
}

const baseUrl = ref('')
const utmSource = ref('')
const utmMedium = ref('')
const customMedium = ref('')
const utmCampaign = ref('')
const utmTerm = ref('')
const utmContent = ref('')
const generatedUrl = ref('')
const qrCodeUrl = ref('')
const history = ref<HistoryItem[]>([])

const canGenerate = computed(() => {
  return baseUrl.value && utmSource.value && finalMedium.value && utmCampaign.value
})

const finalMedium = computed(() => {
  return utmMedium.value === 'custom' ? customMedium.value : utmMedium.value
})

const utmParamsLength = computed(() => {
  if (!generatedUrl.value) return 0
  const urlObj = new URL(generatedUrl.value)
  return urlObj.search.length
})

const presets = [
  {
    name: 'Google Ads',
    source: 'google',
    medium: 'cpc',
    campaign: 'brand_campaign'
  },
  {
    name: 'Facebook广告',
    source: 'facebook',
    medium: 'social',
    campaign: 'social_campaign'
  },
  {
    name: '邮件营销',
    source: 'newsletter',
    medium: 'email',
    campaign: 'monthly_newsletter'
  },
  {
    name: 'Instagram推广',
    source: 'instagram',
    medium: 'social',
    campaign: 'influencer_campaign'
  }
]

function generateUrl() {
  if (!canGenerate.value) return
  
  try {
    const url = new URL(baseUrl.value)
    
    // 添加UTM参数
    url.searchParams.set('utm_source', utmSource.value)
    url.searchParams.set('utm_medium', finalMedium.value)
    url.searchParams.set('utm_campaign', utmCampaign.value)
    
    if (utmTerm.value) {
      url.searchParams.set('utm_term', utmTerm.value)
    }
    
    if (utmContent.value) {
      url.searchParams.set('utm_content', utmContent.value)
    }
    
    generatedUrl.value = url.toString()
    
    // 保存到历史记录
    saveToHistory()
    
  } catch (error) {
    alert('请输入有效的URL')
  }
}

function saveToHistory() {
  const item: HistoryItem = {
    url: generatedUrl.value,
    source: utmSource.value,
    medium: finalMedium.value,
    campaign: utmCampaign.value,
    term: utmTerm.value || undefined,
    content: utmContent.value || undefined,
    timestamp: Date.now()
  }
  
  // 避免重复
  const exists = history.value.some(h => h.url === item.url)
  if (!exists) {
    history.value.unshift(item)
    
    // 只保留最近20条
    if (history.value.length > 20) {
      history.value = history.value.slice(0, 20)
    }
    
    saveHistory()
  }
}

function loadPreset() {
  const presetNames = presets.map(p => p.name)
  const selected = prompt(`选择预设配置:\n${presetNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}`)
  
  if (selected) {
    const index = parseInt(selected) - 1
    if (index >= 0 && index < presets.length) {
      const preset = presets[index]
      utmSource.value = preset.source
      utmMedium.value = preset.medium
      utmCampaign.value = preset.campaign
    }
  }
}

function clearAll() {
  baseUrl.value = ''
  utmSource.value = ''
  utmMedium.value = ''
  customMedium.value = ''
  utmCampaign.value = ''
  utmTerm.value = ''
  utmContent.value = ''
  generatedUrl.value = ''
  qrCodeUrl.value = ''
}

function copyUrl() {
  navigator.clipboard.writeText(generatedUrl.value).then(() => {
    alert('链接已复制到剪贴板')
  })
}

function openPreview() {
  window.open(generatedUrl.value, '_blank')
}

function generateQR() {
  // 使用免费的二维码API
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedUrl.value)}`
  qrCodeUrl.value = qrApiUrl
}

function downloadQR() {
  if (!qrCodeUrl.value) return
  
  const a = document.createElement('a')
  a.href = qrCodeUrl.value
  a.download = `utm-qr-${Date.now()}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function loadFromHistory(item: HistoryItem) {
  utmSource.value = item.source
  utmMedium.value = item.medium
  utmCampaign.value = item.campaign
  utmTerm.value = item.term || ''
  utmContent.value = item.content || ''
  
  // 从URL中提取基础URL
  try {
    const url = new URL(item.url)
    url.searchParams.delete('utm_source')
    url.searchParams.delete('utm_medium')
    url.searchParams.delete('utm_campaign')
    url.searchParams.delete('utm_term')
    url.searchParams.delete('utm_content')
    baseUrl.value = url.toString()
  } catch (error) {
    console.error('解析历史URL失败:', error)
  }
}

function copyHistoryUrl(url: string) {
  navigator.clipboard.writeText(url).then(() => {
    alert('链接已复制到剪贴板')
  })
}

function removeFromHistory(index: number) {
  history.value.splice(index, 1)
  saveHistory()
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function saveHistory() {
  localStorage.setItem('utm-builder-history', JSON.stringify(history.value))
}

function loadHistory() {
  const saved = localStorage.getItem('utm-builder-history')
  if (saved) {
    try {
      history.value = JSON.parse(saved)
    } catch (error) {
      console.error('加载历史记录失败:', error)
    }
  }
}

onMounted(() => {
  loadHistory()
})
</script>