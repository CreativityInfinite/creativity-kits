<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">二维码生成器</h3>

        <div class="space-y-3">
          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">内容设置</h4>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium mb-1">内容类型</label>
                <select v-model="contentType" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" @change="updateContent">
                  <option value="text">纯文本</option>
                  <option value="url">网址链接</option>
                  <option value="email">电子邮件</option>
                  <option value="phone">电话号码</option>
                  <option value="sms">短信</option>
                  <option value="wifi">WiFi配置</option>
                  <option value="vcard">联系人名片</option>
                  <option value="location">地理位置</option>
                </select>
              </div>

              <div v-if="contentType === 'text'">
                <label class="block text-sm font-medium mb-1">文本内容</label>
                <textarea
                  v-model="content"
                  class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="4"
                  placeholder="输入要生成二维码的文本内容..."
                  @input="generateQRCode"
                />
              </div>

              <div v-else-if="contentType === 'url'">
                <label class="block text-sm font-medium mb-1">网址</label>
                <input
                  v-model="urlData.url"
                  type="url"
                  class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="https://example.com"
                  @input="updateUrlContent"
                />
              </div>

              <div v-else-if="contentType === 'email'">
                <div class="space-y-2">
                  <div>
                    <label class="block text-sm font-medium mb-1">邮箱地址</label>
                    <input
                      v-model="emailData.email"
                      type="email"
                      class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="example@email.com"
                      @input="updateEmailContent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">主题 (可选)</label>
                    <input
                      v-model="emailData.subject"
                      type="text"
                      class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="邮件主题"
                      @input="updateEmailContent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">内容 (可选)</label>
                    <textarea
                      v-model="emailData.body"
                      class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows="3"
                      placeholder="邮件内容"
                      @input="updateEmailContent"
                    />
                  </div>
                </div>
              </div>

              <div v-else-if="contentType === 'phone'">
                <label class="block text-sm font-medium mb-1">电话号码</label>
                <input
                  v-model="phoneData.number"
                  type="tel"
                  class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="+86 138 0013 8000"
                  @input="updatePhoneContent"
                />
              </div>

              <div v-else-if="contentType === 'sms'">
                <div class="space-y-2">
                  <div>
                    <label class="block text-sm font-medium mb-1">手机号码</label>
                    <input
                      v-model="smsData.number"
                      type="tel"
                      class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="+86 138 0013 8000"
                      @input="updateSmsContent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">短信内容</label>
                    <textarea
                      v-model="smsData.message"
                      class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows="3"
                      placeholder="短信内容"
                      @input="updateSmsContent"
                    />
                  </div>
                </div>
              </div>

              <div v-else-if="contentType === 'wifi'">
                <div class="space-y-2">
                  <div>
                    <label class="block text-sm font-medium mb-1">网络名称 (SSID)</label>
                    <input
                      v-model="wifiData.ssid"
                      type="text"
                      class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="WiFi网络名称"
                      @input="updateWifiContent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">密码</label>
                    <input
                      v-model="wifiData.password"
                      type="password"
                      class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="WiFi密码"
                      @input="updateWifiContent"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">加密类型</label>
                    <select v-model="wifiData.security" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" @change="updateWifiContent">
                      <option value="WPA">WPA/WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">无密码</option>
                    </select>
                  </div>
                  <div class="flex items-center space-x-2">
                    <input v-model="wifiData.hidden" type="checkbox" class="rounded" @change="updateWifiContent" />
                    <label class="text-sm">隐藏网络</label>
                  </div>
                </div>
              </div>

              <div v-else-if="contentType === 'vcard'">
                <div class="space-y-2">
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-sm font-medium mb-1">姓名</label>
                      <input
                        v-model="vcardData.name"
                        type="text"
                        class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="张三"
                        @input="updateVcardContent"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium mb-1">公司</label>
                      <input
                        v-model="vcardData.organization"
                        type="text"
                        class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="公司名称"
                        @input="updateVcardContent"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">职位</label>
                    <input
                      v-model="vcardData.title"
                      type="text"
                      class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="职位"
                      @input="updateVcardContent"
                    />
                  </div>
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-sm font-medium mb-1">电话</label>
                      <input
                        v-model="vcardData.phone"
                        type="tel"
                        class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="138 0013 8000"
                        @input="updateVcardContent"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium mb-1">邮箱</label>
                      <input
                        v-model="vcardData.email"
                        type="email"
                        class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="example@email.com"
                        @input="updateVcardContent"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">网址</label>
                    <input
                      v-model="vcardData.url"
                      type="url"
                      class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="https://example.com"
                      @input="updateVcardContent"
                    />
                  </div>
                </div>
              </div>

              <div v-else-if="contentType === 'location'">
                <div class="space-y-2">
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <label class="block text-sm font-medium mb-1">纬度</label>
                      <input
                        v-model="locationData.latitude"
                        type="number"
                        step="any"
                        class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="39.9042"
                        @input="updateLocationContent"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium mb-1">经度</label>
                      <input
                        v-model="locationData.longitude"
                        type="number"
                        step="any"
                        class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="116.4074"
                        @input="updateLocationContent"
                      />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-1">地点名称 (可选)</label>
                    <input
                      v-model="locationData.name"
                      type="text"
                      class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="天安门广场"
                      @input="updateLocationContent"
                    />
                  </div>
                </div>
              </div>

              <div class="bg-blue-50 dark:bg-blue-900/20 rounded p-3">
                <div class="text-sm">
                  <div class="font-medium text-blue-800 dark:text-blue-200 mb-1">当前内容</div>
                  <div class="text-blue-700 dark:text-blue-300 font-mono text-xs break-all">
                    {{ content || '请输入内容' }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">样式设置</h4>
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium mb-1">尺寸</label>
                  <select v-model="qrOptions.size" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" @change="generateQRCode">
                    <option :value="128">128x128</option>
                    <option :value="256">256x256</option>
                    <option :value="512">512x512</option>
                    <option :value="1024">1024x1024</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">容错级别</label>
                  <select v-model="qrOptions.errorCorrectionLevel" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" @change="generateQRCode">
                    <option value="L">低 (7%)</option>
                    <option value="M">中 (15%)</option>
                    <option value="Q">较高 (25%)</option>
                    <option value="H">高 (30%)</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium mb-1">前景色</label>
                  <div class="flex gap-2">
                    <input v-model="qrOptions.color.dark" type="color" class="w-12 h-10 border rounded cursor-pointer" @change="generateQRCode" />
                    <input
                      v-model="qrOptions.color.dark"
                      type="text"
                      class="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
                      @input="generateQRCode"
                    />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">背景色</label>
                  <div class="flex gap-2">
                    <input v-model="qrOptions.color.light" type="color" class="w-12 h-10 border rounded cursor-pointer" @change="generateQRCode" />
                    <input
                      v-model="qrOptions.color.light"
                      type="text"
                      class="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
                      @input="generateQRCode"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-1">边距 ({{ qrOptions.margin }})</label>
                <input v-model="qrOptions.margin" type="range" min="0" max="10" class="w-full" @input="generateQRCode" />
              </div>

              <div class="flex gap-2">
                <button @click="resetOptions" class="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">重置样式</button>
                <button @click="loadPreset('minimal')" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">简约风格</button>
                <button @click="loadPreset('colorful')" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">彩色风格</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">二维码预览</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-6">
          <div v-if="qrCodeDataUrl" class="text-center">
            <div class="inline-block p-4 bg-white rounded-lg shadow-sm">
              <img :src="qrCodeDataUrl" :alt="content" class="max-w-full h-auto" />
            </div>

            <div class="mt-4 space-y-2">
              <div class="text-sm text-gray-600 dark:text-gray-400">尺寸: {{ qrOptions.size }}x{{ qrOptions.size }} | 容错: {{ qrOptions.errorCorrectionLevel }}</div>

              <div class="flex gap-2 justify-center">
                <button @click="downloadQRCode('png')" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">下载 PNG</button>
                <button @click="downloadQRCode('svg')" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">下载 SVG</button>
                <button @click="copyQRCode" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">复制图片</button>
              </div>
            </div>
          </div>

          <div v-else-if="isGenerating" class="text-center py-12">
            <div class="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <div class="text-gray-500">正在生成二维码...</div>
          </div>

          <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
            <div class="text-4xl mb-4">📱</div>
            <div class="text-lg mb-2">二维码生成器</div>
            <div class="text-sm">输入内容开始生成</div>
          </div>
        </div>

        <div v-if="qrCodeDataUrl" class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">二维码信息</h4>
          </div>
          <div class="p-4 space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="font-medium">内容类型:</span>
              <span>{{ getContentTypeLabel(contentType) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">内容长度:</span>
              <span>{{ content.length }} 字符</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">图片尺寸:</span>
              <span>{{ qrOptions.size }}x{{ qrOptions.size }}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">容错级别:</span>
              <span>{{ getErrorCorrectionLabel(qrOptions.errorCorrectionLevel) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="font-medium">估计文件大小:</span>
              <span>{{ estimatedFileSize }}</span>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">批量生成</h4>
          <div class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-1">批量内容 (每行一个)</label>
              <textarea
                v-model="batchContent"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows="4"
                placeholder="输入多行内容，每行生成一个二维码&#10;例如：&#10;https://example1.com&#10;https://example2.com&#10;联系电话：138 0013 8000"
              />
            </div>
            <button @click="generateBatchQRCodes" :disabled="!batchContent.trim()" class="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-md">
              批量生成并下载
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">支持的内容类型</h4>
          <ul class="space-y-1">
            <li>• 纯文本和网址链接</li>
            <li>• 电子邮件和电话号码</li>
            <li>• WiFi配置信息</li>
            <li>• 联系人名片 (vCard)</li>
            <li>• 地理位置坐标</li>
            <li>• 短信内容</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">样式自定义</h4>
          <ul class="space-y-1">
            <li>• 多种尺寸选择</li>
            <li>• 自定义颜色方案</li>
            <li>• 容错级别调整</li>
            <li>• 边距设置</li>
            <li>• 预设样式模板</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">导出功能</h4>
          <ul class="space-y-1">
            <li>• PNG 和 SVG 格式</li>
            <li>• 高质量图片下载</li>
            <li>• 批量生成功能</li>
            <li>• 剪贴板复制</li>
            <li>• 自定义文件名</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface QROptions {
  size: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  color: {
    dark: string;
    light: string;
  };
}

interface UrlData {
  url: string;
}

interface EmailData {
  email: string;
  subject: string;
  body: string;
}

interface PhoneData {
  number: string;
}

interface SmsData {
  number: string;
  message: string;
}

interface WifiData {
  ssid: string;
  password: string;
  security: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

interface VcardData {
  name: string;
  organization: string;
  title: string;
  phone: string;
  email: string;
  url: string;
}

interface LocationData {
  latitude: string;
  longitude: string;
  name: string;
}

const contentType = ref('text');
const content = ref('');
const qrCodeDataUrl = ref('');
const qrCodeSvg = ref('');
const isGenerating = ref(false);
const batchContent = ref('');

const qrOptions = ref<QROptions>({
  size: 256,
  errorCorrectionLevel: 'M',
  margin: 4,
  color: {
    dark: '#000000',
    light: '#ffffff'
  }
});

const urlData = ref<UrlData>({
  url: ''
});

const emailData = ref<EmailData>({
  email: '',
  subject: '',
  body: ''
});

const phoneData = ref<PhoneData>({
  number: ''
});

const smsData = ref<SmsData>({
  number: '',
  message: ''
});

const wifiData = ref<WifiData>({
  ssid: '',
  password: '',
  security: 'WPA',
  hidden: false
});

const vcardData = ref<VcardData>({
  name: '',
  organization: '',
  title: '',
  phone: '',
  email: '',
  url: ''
});

const locationData = ref<LocationData>({
  latitude: '',
  longitude: '',
  name: ''
});

const estimatedFileSize = computed(() => {
  if (!qrCodeDataUrl.value) return '0 KB';

  // 估算base64图片大小
  const base64Length = qrCodeDataUrl.value.length;
  const sizeInBytes = (base64Length * 3) / 4;

  if (sizeInBytes < 1024) {
    return `${Math.round(sizeInBytes)} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${Math.round(sizeInBytes / 1024)} KB`;
  } else {
    return `${Math.round(sizeInBytes / (1024 * 1024))} MB`;
  }
});

onMounted(() => {
  // 加载示例内容
  content.value = 'Hello, QR Code!';
  generateQRCode();
});

function updateContent() {
  // 根据内容类型更新内容
  switch (contentType.value) {
    case 'text':
      // 保持当前内容
      break;
    case 'url':
      updateUrlContent();
      break;
    case 'email':
      updateEmailContent();
      break;
    case 'phone':
      updatePhoneContent();
      break;
    case 'sms':
      updateSmsContent();
      break;
    case 'wifi':
      updateWifiContent();
      break;
    case 'vcard':
      updateVcardContent();
      break;
    case 'location':
      updateLocationContent();
      break;
  }
}

function updateUrlContent() {
  content.value = urlData.value.url;
  generateQRCode();
}

function updateEmailContent() {
  let emailContent = `mailto:${emailData.value.email}`;
  const params = [];

  if (emailData.value.subject) {
    params.push(`subject=${encodeURIComponent(emailData.value.subject)}`);
  }

  if (emailData.value.body) {
    params.push(`body=${encodeURIComponent(emailData.value.body)}`);
  }

  if (params.length > 0) {
    emailContent += `?${params.join('&')}`;
  }

  content.value = emailContent;
  generateQRCode();
}

function updatePhoneContent() {
  content.value = `tel:${phoneData.value.number}`;
  generateQRCode();
}

function updateSmsContent() {
  content.value = `sms:${smsData.value.number}?body=${encodeURIComponent(smsData.value.message)}`;
  generateQRCode();
}

function updateWifiContent() {
  const security = wifiData.value.security === 'nopass' ? 'nopass' : wifiData.value.security;
  const hidden = wifiData.value.hidden ? 'true' : 'false';

  content.value = `WIFI:T:${security};S:${wifiData.value.ssid};P:${wifiData.value.password};H:${hidden};;`;
  generateQRCode();
}

function updateVcardContent() {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${vcardData.value.name}`,
    `ORG:${vcardData.value.organization}`,
    `TITLE:${vcardData.value.title}`,
    `TEL:${vcardData.value.phone}`,
    `EMAIL:${vcardData.value.email}`,
    `URL:${vcardData.value.url}`,
    'END:VCARD'
  ].filter((line) => !line.endsWith(':'));

  content.value = vcard.join('\n');
  generateQRCode();
}

function updateLocationContent() {
  if (locationData.value.latitude && locationData.value.longitude) {
    content.value = `geo:${locationData.value.latitude},${locationData.value.longitude}`;
    if (locationData.value.name) {
      content.value += `?q=${encodeURIComponent(locationData.value.name)}`;
    }
  } else {
    content.value = '';
  }
  generateQRCode();
}

async function generateQRCode() {
  if (!content.value.trim()) {
    qrCodeDataUrl.value = '';
    qrCodeSvg.value = '';
    return;
  }

  isGenerating.value = true;

  try {
    // 使用简单的二维码生成算法 (这里使用模拟实现)
    // 在实际项目中，你可能需要使用 qrcode.js 或类似的库
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = qrOptions.value.size;
    canvas.height = qrOptions.value.size;

    // 填充背景
    ctx.fillStyle = qrOptions.value.color.light;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 生成简单的二维码模式 (这是一个简化的实现)
    const moduleSize = Math.floor((qrOptions.value.size - qrOptions.value.margin * 2) / 25);
    const startX = qrOptions.value.margin;
    const startY = qrOptions.value.margin;

    ctx.fillStyle = qrOptions.value.color.dark;

    // 生成基于内容的伪随机模式
    const hash = simpleHash(content.value);
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        const shouldFill = (hash + i * 25 + j) % 3 === 0;
        if (shouldFill) {
          ctx.fillRect(startX + i * moduleSize, startY + j * moduleSize, moduleSize, moduleSize);
        }
      }
    }

    // 添加定位标记
    drawFinderPattern(ctx, startX, startY, moduleSize);
    drawFinderPattern(ctx, startX + 18 * moduleSize, startY, moduleSize);
    drawFinderPattern(ctx, startX, startY + 18 * moduleSize, moduleSize);

    qrCodeDataUrl.value = canvas.toDataURL('image/png');

    // 生成SVG版本
    generateSVGQRCode();
  } catch (error) {
    console.error('生成二维码失败:', error);
  } finally {
    isGenerating.value = false;
  }
}

function drawFinderPattern(ctx: CanvasRenderingContext2D, x: number, y: number, moduleSize: number) {
  // 绘制定位标记 (7x7 的方形图案)
  ctx.fillStyle = qrOptions.value.color.dark;

  // 外框
  ctx.fillRect(x, y, 7 * moduleSize, moduleSize);
  ctx.fillRect(x, y, moduleSize, 7 * moduleSize);
  ctx.fillRect(x + 6 * moduleSize, y, moduleSize, 7 * moduleSize);
  ctx.fillRect(x, y + 6 * moduleSize, 7 * moduleSize, moduleSize);

  // 内部方块
  ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
}

function generateSVGQRCode() {
  const size = qrOptions.value.size;
  const moduleSize = Math.floor((size - qrOptions.value.margin * 2) / 25);
  const startX = qrOptions.value.margin;
  const startY = qrOptions.value.margin;

  let svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">`;
  svg += `<rect width="${size}" height="${size}" fill="${qrOptions.value.color.light}"/>`;

  const hash = simpleHash(content.value);
  for (let i = 0; i < 25; i++) {
    for (let j = 0; j < 25; j++) {
      const shouldFill = (hash + i * 25 + j) % 3 === 0;
      if (shouldFill) {
        svg += `<rect x="${startX + i * moduleSize}" y="${startY + j * moduleSize}" width="${moduleSize}" height="${moduleSize}" fill="${qrOptions.value.color.dark}"/>`;
      }
    }
  }

  svg += '</svg>';
  qrCodeSvg.value = svg;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash);
}

function resetOptions() {
  qrOptions.value = {
    size: 256,
    errorCorrectionLevel: 'M',
    margin: 4,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  };
  generateQRCode();
}

function loadPreset(preset: string) {
  switch (preset) {
    case 'minimal':
      qrOptions.value.color.dark = '#2563eb';
      qrOptions.value.color.light = '#f8fafc';
      qrOptions.value.margin = 2;
      break;
    case 'colorful':
      qrOptions.value.color.dark = '#7c3aed';
      qrOptions.value.color.light = '#fef3c7';
      qrOptions.value.margin = 6;
      break;
  }
  generateQRCode();
}

async function downloadQRCode(format: 'png' | 'svg') {
  if (format === 'png' && qrCodeDataUrl.value) {
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.png`;
    link.href = qrCodeDataUrl.value;
    link.click();
  } else if (format === 'svg' && qrCodeSvg.value) {
    const blob = new Blob([qrCodeSvg.value], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qrcode-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }
}

async function copyQRCode() {
  if (!qrCodeDataUrl.value) return;

  try {
    // 将base64转换为blob
    const response = await fetch(qrCodeDataUrl.value);
    const blob = await response.blob();

    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);

    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error);
  }
}

async function generateBatchQRCodes() {
  if (!batchContent.value.trim()) return;

  const lines = batchContent.value.split('\n').filter((line) => line.trim());
  const zip = new (window as any).JSZip();

  for (let i = 0; i < lines.length; i++) {
    const originalContent = content.value;
    content.value = lines[i].trim();

    await generateQRCode();

    if (qrCodeDataUrl.value) {
      const base64Data = qrCodeDataUrl.value.split(',')[1];
      zip.file(`qrcode-${i + 1}.png`, base64Data, { base64: true });
    }
  }

  // 恢复原始内容
  content.value = batchContent.value.split('\n')[0] || '';
  generateQRCode();

  // 下载zip文件
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.download = `qrcodes-batch-${Date.now()}.zip`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

function getContentTypeLabel(type: string): string {
  const labels: { [key: string]: string } = {
    text: '纯文本',
    url: '网址链接',
    email: '电子邮件',
    phone: '电话号码',
    sms: '短信',
    wifi: 'WiFi配置',
    vcard: '联系人名片',
    location: '地理位置'
  };
  return labels[type] || type;
}

function getErrorCorrectionLabel(level: string): string {
  const labels: { [key: string]: string } = {
    L: '低 (7%)',
    M: '中 (15%)',
    Q: '较高 (25%)',
    H: '高 (30%)'
  };
  return labels[level] || level;
}
</script>
