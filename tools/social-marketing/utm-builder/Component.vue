<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.utm-builder.page.configTitle') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.utm-builder.page.baseUrlLabel') }} *</label>
            <input
              v-model="baseUrl"
              type="url"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.utm-builder.page.baseUrlPlaceholder')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">
              {{ $t('tools.utm-builder.page.utmSourceLabel') }} *
              <span class="text-xs text-gray-500 ml-1">{{ $t('tools.utm-builder.page.sourceHelp') }}</span>
            </label>
            <input
              v-model="utmSource"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.utm-builder.page.utmSourcePlaceholder')"
            />
            <p class="text-xs text-gray-500 mt-1">{{ $t('tools.utm-builder.page.sourceDesc') }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">
              {{ $t('tools.utm-builder.page.utmMediumLabel') }} *
              <span class="text-xs text-gray-500 ml-1">{{ $t('tools.utm-builder.page.mediumHelp') }}</span>
            </label>
            <select v-model="utmMedium" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">{{ $t('tools.utm-builder.page.mediumSelectPlaceholder') }}</option>
              <option value="cpc">{{ $t('tools.utm-builder.page.mediumOptions.cpc') }}</option>
              <option value="organic">{{ $t('tools.utm-builder.page.mediumOptions.organic') }}</option>
              <option value="social">{{ $t('tools.utm-builder.page.mediumOptions.social') }}</option>
              <option value="email">{{ $t('tools.utm-builder.page.mediumOptions.email') }}</option>
              <option value="referral">{{ $t('tools.utm-builder.page.mediumOptions.referral') }}</option>
              <option value="display">{{ $t('tools.utm-builder.page.mediumOptions.display') }}</option>
              <option value="affiliate">{{ $t('tools.utm-builder.page.mediumOptions.affiliate') }}</option>
              <option value="direct">{{ $t('tools.utm-builder.page.mediumOptions.direct') }}</option>
            </select>
            <input
              v-if="utmMedium === 'custom'"
              v-model="customMedium"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white mt-2"
              :placeholder="$t('tools.utm-builder.page.customMediumPlaceholder')"
            />
            <p class="text-xs text-gray-500 mt-1">{{ $t('tools.utm-builder.page.mediumDesc') }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">
              {{ $t('tools.utm-builder.page.utmCampaignLabel') }} *
              <span class="text-xs text-gray-500 ml-1">{{ $t('tools.utm-builder.page.campaignHelp') }}</span>
            </label>
            <input
              v-model="utmCampaign"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.utm-builder.page.campaignPlaceholder')"
            />
            <p class="text-xs text-gray-500 mt-1">{{ $t('tools.utm-builder.page.campaignDesc') }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">
              {{ $t('tools.utm-builder.page.utmTermLabel') }}
              <span class="text-xs text-gray-500 ml-1">{{ $t('tools.utm-builder.page.termHelp') }}</span>
            </label>
            <input
              v-model="utmTerm"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.utm-builder.page.termPlaceholder')"
            />
            <p class="text-xs text-gray-500 mt-1">{{ $t('tools.utm-builder.page.termDesc') }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">
              {{ $t('tools.utm-builder.page.utmContentLabel') }}
              <span class="text-xs text-gray-500 ml-1">{{ $t('tools.utm-builder.page.contentHelp') }}</span>
            </label>
            <input
              v-model="utmContent"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.utm-builder.page.contentPlaceholder')"
            />
            <p class="text-xs text-gray-500 mt-1">{{ $t('tools.utm-builder.page.contentDesc') }}</p>
          </div>
        </div>

        <div class="flex gap-2">
          <button @click="generateUrl" :disabled="!canGenerate" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
            {{ $t('tools.utm-builder.page.generate') }}
          </button>
          <button @click="loadPreset" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.utm-builder.page.loadPreset') }}</button>
          <button @click="clearAll" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">{{ $t('tools.utm-builder.page.clear') }}</button>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.utm-builder.page.generatedLinkTitle') }}</h3>

        <div v-if="generatedUrl" class="space-y-3">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <label class="block text-sm font-medium mb-2">{{ $t('tools.utm-builder.page.fullLinkLabel') }}</label>
            <div class="bg-white dark:bg-gray-700 rounded border p-3 font-mono text-sm break-all">
              {{ generatedUrl }}
            </div>
            <div class="flex gap-2 mt-2">
              <button @click="copyUrl" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.utm-builder.page.copyLink') }}</button>
              <button @click="openPreview" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.utm-builder.page.preview') }}</button>
              <button @click="generateQR" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">{{ $t('tools.utm-builder.page.generateQR') }}</button>
            </div>
          </div>

          <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-2">{{ $t('tools.utm-builder.page.parseTitle') }}</h4>
            <div class="space-y-2 text-sm">
              <div class="grid grid-cols-2 gap-2">
                <span class="font-medium">{{ $t('tools.utm-builder.page.parseSource') }}</span>
                <span class="font-mono">{{ utmSource }}</span>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <span class="font-medium">{{ $t('tools.utm-builder.page.parseMedium') }}</span>
                <span class="font-mono">{{ finalMedium }}</span>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <span class="font-medium">{{ $t('tools.utm-builder.page.parseCampaign') }}</span>
                <span class="font-mono">{{ utmCampaign }}</span>
              </div>
              <div v-if="utmTerm" class="grid grid-cols-2 gap-2">
                <span class="font-medium">{{ $t('tools.utm-builder.page.parseTerm') }}</span>
                <span class="font-mono">{{ utmTerm }}</span>
              </div>
              <div v-if="utmContent" class="grid grid-cols-2 gap-2">
                <span class="font-medium">{{ $t('tools.utm-builder.page.parseContent') }}</span>
                <span class="font-mono">{{ utmContent }}</span>
              </div>
            </div>
          </div>

          <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h4 class="font-medium mb-2">{{ $t('tools.utm-builder.page.stats.title') }}</h4>
            <div class="text-sm space-y-1">
              <div>{{ $t('tools.utm-builder.page.stats.originalLength', { n: baseUrl.length }) }}</div>
              <div>{{ $t('tools.utm-builder.page.stats.utmLength', { n: utmParamsLength }) }}</div>
              <div>{{ $t('tools.utm-builder.page.stats.totalLength', { n: generatedUrl.length }) }}</div>
              <div class="mt-2">
                <span class="font-medium">{{ $t('tools.utm-builder.page.stats.suggest') }} </span>
                <span :class="generatedUrl.length > 2000 ? 'text-red-600' : 'text-green-600'">
                  {{ $t(generatedUrl.length > 2000 ? 'tools.utm-builder.page.stats.tooLong' : 'tools.utm-builder.page.stats.lengthOk') }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="qrCodeUrl" class="bg-white dark:bg-gray-800 rounded-lg p-4 border text-center">
          <h4 class="font-medium mb-3">{{ $t('tools.utm-builder.page.qrTitle') }}</h4>
          <img :src="qrCodeUrl" :alt="$t('tools.utm-builder.page.qrAlt')" class="mx-auto mb-3" />
          <button @click="downloadQR" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.utm-builder.page.downloadQR') }}</button>
        </div>

        <div v-if="!generatedUrl" class="text-center py-8 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">🔗</div>
          <div class="text-lg mb-2">{{ $t('tools.utm-builder.page.emptyTitle') }}</div>
          <div class="text-sm">{{ $t('tools.utm-builder.page.emptySubtitle') }}</div>
        </div>
      </div>
    </div>

    <div v-if="history.length > 0" class="space-y-2">
      <h3 class="font-medium">{{ $t('tools.utm-builder.page.historyTitle') }}</h3>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div v-for="(item, index) in history" :key="index" class="bg-gray-50 dark:bg-gray-800 rounded p-3 text-sm">
          <div class="flex justify-between items-start mb-2">
            <div class="font-medium">{{ item.campaign }}</div>
            <div class="text-xs text-gray-500">{{ formatDate(item.timestamp) }}</div>
          </div>
          <div class="font-mono text-xs break-all text-gray-600 dark:text-gray-400 mb-2">
            {{ item.url }}
          </div>
          <div class="flex gap-2">
            <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.utm-builder.page.load') }}</button>
            <button @click="copyHistoryUrl(item.url)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">{{ $t('tools.utm-builder.page.copy') }}</button>
            <button @click="removeFromHistory(index)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.utm-builder.page.delete') }}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">{{ $t('tools.utm-builder.page.explain.title') }}</h3>
      <div class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
        <div><strong>utm_source:</strong> {{ $t('tools.utm-builder.page.explain.source') }}</div>
        <div><strong>utm_medium:</strong> {{ $t('tools.utm-builder.page.explain.medium') }}</div>
        <div><strong>utm_campaign:</strong> {{ $t('tools.utm-builder.page.explain.campaign') }}</div>
        <div><strong>utm_term:</strong> {{ $t('tools.utm-builder.page.explain.term') }}</div>
        <div><strong>utm_content:</strong> {{ $t('tools.utm-builder.page.explain.content') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

interface HistoryItem {
  url: string;
  source: string;
  medium: string;
  campaign: string;
  term?: string;
  content?: string;
  timestamp: number;
}

const baseUrl = ref('');
const utmSource = ref('');
const utmMedium = ref('');
const customMedium = ref('');
const utmCampaign = ref('');
const utmTerm = ref('');
const utmContent = ref('');
const generatedUrl = ref('');
const qrCodeUrl = ref('');
const history = ref<HistoryItem[]>([]);

const canGenerate = computed(() => {
  return baseUrl.value && utmSource.value && finalMedium.value && utmCampaign.value;
});

const finalMedium = computed(() => {
  return utmMedium.value === 'custom' ? customMedium.value : utmMedium.value;
});

const utmParamsLength = computed(() => {
  if (!generatedUrl.value) return 0;
  const urlObj = new URL(generatedUrl.value);
  return urlObj.search.length;
});

const presets = [
  {
    name: t('tools.utm-builder.page.presets.googleAds'),
    source: 'google',
    medium: 'cpc',
    campaign: 'brand_campaign'
  },
  {
    name: t('tools.utm-builder.page.presets.facebookAds'),
    source: 'facebook',
    medium: 'social',
    campaign: 'social_campaign'
  },
  {
    name: t('tools.utm-builder.page.presets.emailMarketing'),
    source: 'newsletter',
    medium: 'email',
    campaign: 'monthly_newsletter'
  },
  {
    name: t('tools.utm-builder.page.presets.instagramPromotion'),
    source: 'instagram',
    medium: 'social',
    campaign: 'influencer_campaign'
  }
];

function generateUrl() {
  if (!canGenerate.value) return;

  try {
    const url = new URL(baseUrl.value);

    // 添加UTM参数
    url.searchParams.set('utm_source', utmSource.value);
    url.searchParams.set('utm_medium', finalMedium.value);
    url.searchParams.set('utm_campaign', utmCampaign.value);

    if (utmTerm.value) {
      url.searchParams.set('utm_term', utmTerm.value);
    }

    if (utmContent.value) {
      url.searchParams.set('utm_content', utmContent.value);
    }

    generatedUrl.value = url.toString();

    // 保存到历史记录
    saveToHistory();
  } catch (error) {
    alert(t('tools.utm-builder.page.invalidUrl'));
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
  };

  // 避免重复
  const exists = history.value.some((h) => h.url === item.url);
  if (!exists) {
    history.value.unshift(item);

    // 只保留最近20条
    if (history.value.length > 20) {
      history.value = history.value.slice(0, 20);
    }

    saveHistory();
  }
}

function loadPreset() {
  const presetNames = presets.map((p) => p.name);
  const selected = prompt(`${t('tools.utm-builder.page.choosePreset')}\n${presetNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}`);

  if (selected) {
    const index = parseInt(selected) - 1;
    if (index >= 0 && index < presets.length) {
      const preset = presets[index];
      utmSource.value = preset.source;
      utmMedium.value = preset.medium;
      utmCampaign.value = preset.campaign;
    }
  }
}

function clearAll() {
  baseUrl.value = '';
  utmSource.value = '';
  utmMedium.value = '';
  customMedium.value = '';
  utmCampaign.value = '';
  utmTerm.value = '';
  utmContent.value = '';
  generatedUrl.value = '';
  qrCodeUrl.value = '';
}

function copyUrl() {
  navigator.clipboard.writeText(generatedUrl.value).then(() => {
    alert(t('common.copied'));
  });
}

function openPreview() {
  window.open(generatedUrl.value, '_blank');
}

function generateQR() {
  // 使用免费的二维码API
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedUrl.value)}`;
  qrCodeUrl.value = qrApiUrl;
}

function downloadQR() {
  if (!qrCodeUrl.value) return;

  const a = document.createElement('a');
  a.href = qrCodeUrl.value;
  a.download = `utm-qr-${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function loadFromHistory(item: HistoryItem) {
  utmSource.value = item.source;
  utmMedium.value = item.medium;
  utmCampaign.value = item.campaign;
  utmTerm.value = item.term || '';
  utmContent.value = item.content || '';

  // 从URL中提取基础URL
  try {
    const url = new URL(item.url);
    url.searchParams.delete('utm_source');
    url.searchParams.delete('utm_medium');
    url.searchParams.delete('utm_campaign');
    url.searchParams.delete('utm_term');
    url.searchParams.delete('utm_content');
    baseUrl.value = url.toString();
  } catch (error) {
    console.error(t('tools.utm-builder.page.log.parseHistoryUrlFailed'), error);
  }
}

function copyHistoryUrl(url: string) {
  navigator.clipboard.writeText(url).then(() => {
    alert(t('common.copied'));
  });
}

function removeFromHistory(index: number) {
  history.value.splice(index, 1);
  saveHistory();
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function saveHistory() {
  localStorage.setItem('utm-builder-history', JSON.stringify(history.value));
}

function loadHistory() {
  const saved = localStorage.getItem('utm-builder-history');
  if (saved) {
    try {
      history.value = JSON.parse(saved);
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
  }
}

onMounted(() => {
  loadHistory();
});
</script>
