<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.uuid-generator.page.title') }}</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">{{ $t('tools.uuid-generator.page.settings') }}</h4>
            <div class="flex gap-2">
              <button @click="generateUUIDs" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.uuid-generator.page.generateUUID') }}</button>
              <button @click="clearAll" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('tools.uuid-generator.page.clear') }}</button>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">{{ $t('tools.uuid-generator.page.typeLabel') }}</label>
              <select v-model="settings.type" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" @change="generateUUIDs">
                <option value="v4">{{ $t('tools.uuid-generator.page.optionV4') }}</option>
                <option value="v1">{{ $t('tools.uuid-generator.page.optionV1') }}</option>
                <option value="nanoid">{{ $t('tools.uuid-generator.page.optionNanoId') }}</option>
                <option value="custom">{{ $t('tools.uuid-generator.page.optionCustomFormat') }}</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">{{ $t('tools.uuid-generator.page.generateCount') }}: {{ settings.count }}</label>
              <input v-model.number="settings.count" type="range" min="1" max="100" class="w-full" @input="generateUUIDs" />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>100</span>
              </div>
            </div>

            <div v-if="settings.type === 'nanoid'">
              <label class="block text-sm font-medium mb-2">{{ $t('tools.uuid-generator.page.nanoidLength') }}: {{ settings.nanoidLength }}</label>
              <input v-model.number="settings.nanoidLength" type="range" min="6" max="64" class="w-full" @input="generateUUIDs" />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>6</span>
                <span>64</span>
              </div>
            </div>

            <div v-if="settings.type === 'nanoid'">
              <label class="block text-sm font-medium mb-2">{{ $t('tools.uuid-generator.page.alphabet') }}</label>
              <select v-model="settings.nanoidAlphabet" class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" @change="generateUUIDs">
                <option value="default">{{ $t('tools.uuid-generator.page.alphabetDefault') }}</option>
                <option value="alphanumeric">{{ $t('tools.uuid-generator.page.alphabetAlphanumeric') }}</option>
                <option value="lowercase">{{ $t('tools.uuid-generator.page.alphabetLowercase') }}</option>
                <option value="uppercase">{{ $t('tools.uuid-generator.page.alphabetUppercase') }}</option>
                <option value="numbers">{{ $t('tools.uuid-generator.page.alphabetNumbers') }}</option>
                <option value="hex">{{ $t('tools.uuid-generator.page.alphabetHex') }}</option>
                <option value="custom">{{ $t('tools.uuid-generator.page.alphabetCustom') }}</option>
              </select>
            </div>

            <div v-if="settings.type === 'nanoid' && settings.nanoidAlphabet === 'custom'">
              <label class="block text-sm font-medium mb-2">{{ $t('tools.uuid-generator.page.customAlphabet') }}</label>
              <input
                v-model="settings.customAlphabet"
                type="text"
                :placeholder="$t('tools.uuid-generator.page.customAlphabetPlaceholder')"
                class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="generateUUIDs"
              />
            </div>

            <div v-if="settings.type === 'custom'">
              <label class="block text-sm font-medium mb-2">{{ $t('tools.uuid-generator.page.customFormat') }}</label>
              <input
                v-model="settings.customFormat"
                type="text"
                :placeholder="$t('tools.uuid-generator.page.customFormatPlaceholder')"
                class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="generateUUIDs"
              />
              <div class="text-xs text-gray-500 mt-1">{{ $t('tools.uuid-generator.page.customFormatTip') }}</div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">{{ $t('tools.uuid-generator.page.formatOptions') }}</h4>
          <div class="space-y-3">
            <label class="flex items-center space-x-3">
              <input v-model="settings.uppercase" type="checkbox" @change="generateUUIDs" />
              <span class="text-sm">{{ $t('tools.uuid-generator.page.uppercase') }}</span>
            </label>

            <label class="flex items-center space-x-3">
              <input v-model="settings.removeDashes" type="checkbox" @change="generateUUIDs" />
              <span class="text-sm">{{ $t('tools.uuid-generator.page.removeDashes') }}</span>
            </label>

            <label class="flex items-center space-x-3">
              <input v-model="settings.addBraces" type="checkbox" @change="generateUUIDs" />
              <span class="text-sm">{{ $t('tools.uuid-generator.page.addBraces') }}</span>
            </label>

            <label class="flex items-center space-x-3">
              <input v-model="settings.addPrefix" type="checkbox" @change="generateUUIDs" />
              <span class="text-sm">{{ $t('tools.uuid-generator.page.addPrefix') }}</span>
            </label>

            <div v-if="settings.addPrefix" class="ml-6">
              <input
                v-model="settings.prefix"
                type="text"
                :placeholder="$t('tools.uuid-generator.page.prefixPlaceholder')"
                class="w-full px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="generateUUIDs"
              />
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">{{ $t('tools.uuid-generator.page.quickActions') }}</h4>
          <div class="grid grid-cols-2 gap-2">
            <button @click="quickGenerate('v4', 1)" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.uuid-generator.page.quickV4One') }}</button>
            <button @click="quickGenerate('v1', 1)" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.uuid-generator.page.quickV1One') }}</button>
            <button @click="quickGenerate('nanoid', 1)" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">{{ $t('tools.uuid-generator.page.quickNanoOne') }}</button>
            <button @click="quickGenerate('v4', 10)" class="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm">{{ $t('tools.uuid-generator.page.quickV4Ten') }}</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.uuid-generator.page.resultTitle') }}</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">{{ $t('tools.uuid-generator.page.uuidList') }} ({{ generatedUUIDs.length }})</h4>
            <div class="flex gap-2">
              <button @click="copyAllUUIDs" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">{{ $t('tools.uuid-generator.page.copyAll') }}</button>
              <button @click="exportUUIDs" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.uuid-generator.page.export') }}</button>
            </div>
          </div>
          <div class="p-4">
            <div v-if="generatedUUIDs.length > 0" class="space-y-2 max-h-96 overflow-y-auto">
              <div v-for="(uuid, index) in generatedUUIDs" :key="index" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded border">
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-sm break-all">{{ uuid.value }}</div>
                  <div class="text-xs text-gray-500 mt-1">
                    {{ $t('tools.uuid-generator.page.labelType') }}: {{ uuid.type }} | {{ $t('tools.uuid-generator.page.labelLength') }}: {{ uuid.value.length }} |
                    {{ $t('tools.uuid-generator.page.labelGeneratedAt') }}: {{ uuid.timestamp }}
                  </div>
                </div>
                <div class="flex gap-1 ml-3">
                  <button @click="copyUUID(uuid.value)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.uuid-generator.page.copy') }}</button>
                  <button @click="regenerateUUID(index)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">{{ $t('tools.uuid-generator.page.regenerate') }}</button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">{{ $t('tools.uuid-generator.page.emptyTip') }}</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">{{ $t('tools.uuid-generator.page.validateTitle') }}</h4>
          </div>
          <div class="p-4 space-y-3">
            <div>
              <label class="block text-sm font-medium mb-2">{{ $t('tools.uuid-generator.page.validateInputLabel') }}</label>
              <input
                v-model="validationInput"
                type="text"
                :placeholder="$t('tools.uuid-generator.page.validateInputPlaceholder')"
                class="w-full px-3 py-2 border rounded-lg font-mono dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @input="validateUUID"
              />
            </div>

            <div v-if="validationResult" class="p-3 rounded-lg" :class="validationResult.valid ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'">
              <div class="flex items-center gap-2 mb-2">
                <span :class="validationResult.valid ? 'text-green-500' : 'text-red-500'">
                  {{ validationResult.valid ? '✓' : '✗' }}
                </span>
                <span class="font-medium">{{ validationResult.valid ? $t('tools.uuid-generator.page.valid') : $t('tools.uuid-generator.page.invalid') }}</span>
              </div>

              <div v-if="validationResult.valid" class="text-sm space-y-1">
                <div>
                  <strong>{{ $t('tools.uuid-generator.page.detailType') }}:</strong> {{ validationResult.type }}
                </div>
                <div>
                  <strong>{{ $t('tools.uuid-generator.page.detailVersion') }}:</strong> {{ validationResult.version || 'N/A' }}
                </div>
                <div>
                  <strong>{{ $t('tools.uuid-generator.page.detailFormat') }}:</strong> {{ validationResult.format }}
                </div>
                <div v-if="validationResult.timestamp">
                  <strong>{{ $t('tools.uuid-generator.page.detailTimestamp') }}:</strong> {{ validationResult.timestamp }}
                </div>
              </div>

              <div v-else class="text-sm text-red-600 dark:text-red-400">
                {{ validationResult.error }}
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">{{ $t('tools.uuid-generator.page.historyTitle') }}</h4>
            <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('tools.uuid-generator.page.clearHistory') }}</button>
          </div>
          <div class="p-4">
            <div v-if="uuidHistory.length > 0" class="space-y-2 max-h-40 overflow-y-auto">
              <div v-for="(history, index) in uuidHistory.slice(0, 20)" :key="index" class="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-xs truncate">{{ history.uuid }}</div>
                  <div class="text-xs text-gray-500">{{ history.timestamp }} - {{ history.type }}</div>
                </div>
                <div class="flex gap-1">
                  <button @click="copyUUID(history.uuid)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.uuid-generator.page.copy') }}</button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">{{ $t('tools.uuid-generator.page.historyEmpty') }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">{{ $t('tools.uuid-generator.page.guideTitle') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.uuid-generator.page.guideTypes') }}</h4>
          <ul class="space-y-1">
            <li>• <strong>UUID v4:</strong> {{ $t('tools.uuid-generator.page.guideTypesV4') }}</li>
            <li>• <strong>UUID v1:</strong> {{ $t('tools.uuid-generator.page.guideTypesV1') }}</li>
            <li>• <strong>Nano ID:</strong> {{ $t('tools.uuid-generator.page.guideTypesNano') }}</li>
            <li>
              • <strong>{{ $t('tools.uuid-generator.page.guideTypesCustomLabel') }}:</strong> {{ $t('tools.uuid-generator.page.guideTypesCustom') }}
            </li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.uuid-generator.page.guideFormatOptions') }}</h4>
          <ul class="space-y-1">
            <li>• {{ $t('tools.uuid-generator.page.guideFormatCase') }}</li>
            <li>• {{ $t('tools.uuid-generator.page.guideFormatRemoveDashes') }}</li>
            <li>• {{ $t('tools.uuid-generator.page.guideFormatBraces') }}</li>
            <li>• {{ $t('tools.uuid-generator.page.guideFormatPrefix') }}</li>
            <li>• {{ $t('tools.uuid-generator.page.guideFormatBatch') }}</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.uuid-generator.page.guideFeatures') }}</h4>
          <ul class="space-y-1">
            <li>• {{ $t('tools.uuid-generator.page.guideFeatureValidation') }}</li>
            <li>• {{ $t('tools.uuid-generator.page.guideFeatureHistory') }}</li>
            <li>• {{ $t('tools.uuid-generator.page.guideFeatureCopyExport') }}</li>
            <li>• {{ $t('tools.uuid-generator.page.guideFeaturePresets') }}</li>
            <li>• {{ $t('tools.uuid-generator.page.guideFeatureCustomAlphabet') }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

interface GeneratedUUID {
  value: string;
  type: string;
  timestamp: string;
}

interface UUIDHistory {
  uuid: string;
  timestamp: string;
  type: string;
}

interface ValidationResult {
  valid: boolean;
  type?: string;
  version?: string;
  format?: string;
  timestamp?: string;
  error?: string;
}

const settings = ref({
  type: 'v4',
  count: 5,
  uppercase: false,
  removeDashes: false,
  addBraces: false,
  addPrefix: false,
  prefix: '',
  nanoidLength: 21,
  nanoidAlphabet: 'default',
  customAlphabet: '',
  customFormat: 'XXXX-XXXX-XXXX'
});

const generatedUUIDs = ref<GeneratedUUID[]>([]);
const validationInput = ref('');
const validationResult = ref<ValidationResult | null>(null);
const uuidHistory = ref<UUIDHistory[]>([]);

// 字符集定义
const alphabets = {
  default: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-',
  alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  lowercase: 'abcdefghijklmnopqrstuvwxyz0123456789',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  numbers: '0123456789',
  hex: '0123456789ABCDEF'
};

const { t } = useI18n();

onMounted(() => {
  loadUUIDHistory();
  generateUUIDs();
});

// UUID v4 生成
function generateUUIDv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// UUID v1 生成 (简化版)
function generateUUIDv1(): string {
  const timestamp = Date.now();
  const timeHex = timestamp.toString(16).padStart(12, '0');
  const clockSeq = Math.floor(Math.random() * 0x4000);
  const node = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, '0')
  ).join('');

  return [
    timeHex.slice(-8),
    timeHex.slice(-12, -8),
    '1' + timeHex.slice(-15, -12),
    ((clockSeq >> 8) | 0x80).toString(16).padStart(2, '0') + (clockSeq & 0xff).toString(16).padStart(2, '0'),
    node
  ].join('-');
}

// Nano ID 生成
function generateNanoID(length: number = 21, alphabet?: string): string {
  const chars = alphabet || getAlphabet();
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

// 自定义格式生成
function generateCustomFormat(format: string): string {
  return format.replace(/X/g, () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return chars[Math.floor(Math.random() * chars.length)];
  });
}

// 获取字符集
function getAlphabet(): string {
  if (settings.value.nanoidAlphabet === 'custom') {
    return settings.value.customAlphabet || alphabets.default;
  }
  return alphabets[settings.value.nanoidAlphabet as keyof typeof alphabets] || alphabets.default;
}

// 格式化 UUID
function formatUUID(uuid: string): string {
  let formatted = uuid;

  if (settings.value.uppercase) {
    formatted = formatted.toUpperCase();
  } else {
    formatted = formatted.toLowerCase();
  }

  if (settings.value.removeDashes) {
    formatted = formatted.replace(/-/g, '');
  }

  if (settings.value.addBraces) {
    formatted = `{${formatted}}`;
  }

  if (settings.value.addPrefix && settings.value.prefix) {
    formatted = settings.value.prefix + formatted;
  }

  return formatted;
}

// 生成 UUID
function generateUUIDs() {
  const uuids: GeneratedUUID[] = [];

  for (let i = 0; i < settings.value.count; i++) {
    let uuid = '';
    let type = settings.value.type;

    switch (settings.value.type) {
      case 'v4':
        uuid = generateUUIDv4();
        break;
      case 'v1':
        uuid = generateUUIDv1();
        break;
      case 'nanoid':
        uuid = generateNanoID(settings.value.nanoidLength, getAlphabet());
        type = `Nano ID (${settings.value.nanoidLength})`;
        break;
      case 'custom':
        uuid = generateCustomFormat(settings.value.customFormat);
        type = t('tools.uuid-generator.page.typeCustom');
        break;
    }

    const formatted = formatUUID(uuid);
    const timestamp = new Date().toLocaleTimeString();

    uuids.push({
      value: formatted,
      type,
      timestamp
    });

    // 添加到历史记录
    addToHistory(formatted, type);
  }

  generatedUUIDs.value = uuids;
}

// 重新生成单个 UUID
function regenerateUUID(index: number) {
  let uuid = '';
  let type = settings.value.type;

  switch (settings.value.type) {
    case 'v4':
      uuid = generateUUIDv4();
      break;
    case 'v1':
      uuid = generateUUIDv1();
      break;
    case 'nanoid':
      uuid = generateNanoID(settings.value.nanoidLength, getAlphabet());
      type = `Nano ID (${settings.value.nanoidLength})`;
      break;
    case 'custom':
      uuid = generateCustomFormat(settings.value.customFormat);
      type = t('tools.uuid-generator.page.typeCustom');
      break;
  }

  const formatted = formatUUID(uuid);
  const timestamp = new Date().toLocaleTimeString();

  generatedUUIDs.value[index] = {
    value: formatted,
    type,
    timestamp
  };

  addToHistory(formatted, type);
}

// 快速生成
function quickGenerate(type: string, count: number) {
  settings.value.type = type;
  settings.value.count = count;
  generateUUIDs();
}

// 验证 UUID
function validateUUID() {
  const input = validationInput.value.trim();

  if (!input) {
    validationResult.value = null;
    return;
  }

  // 清理输入（移除大括号和前缀）
  let cleanInput = input.replace(/^\{|\}$/g, '');

  // UUID v4 验证
  const uuidv4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const uuidv4NoHyphenRegex = /^[0-9a-f]{32}$/i;

  // UUID v1 验证
  const uuidv1Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  // 通用 UUID 验证
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (uuidv4Regex.test(cleanInput)) {
    validationResult.value = {
      valid: true,
      type: 'UUID',
      version: 'v4',
      format: t('tools.uuid-generator.page.standardHyphenFormat')
    };
  } else if (uuidv1Regex.test(cleanInput)) {
    validationResult.value = {
      valid: true,
      type: 'UUID',
      version: 'v1',
      format: t('tools.uuid-generator.page.standardHyphenFormat'),
      timestamp: t('tools.uuid-generator.page.timestampInfo')
    };
  } else if (uuidRegex.test(cleanInput)) {
    const version = cleanInput.charAt(14);
    validationResult.value = {
      valid: true,
      type: 'UUID',
      version: `v${version}`,
      format: t('tools.uuid-generator.page.standardHyphenFormat')
    };
  } else if (uuidv4NoHyphenRegex.test(cleanInput)) {
    validationResult.value = {
      valid: true,
      type: 'UUID',
      version: t('tools.uuid-generator.page.unknown'),
      format: t('tools.uuid-generator.page.noHyphenFormat')
    };
  } else if (cleanInput.length >= 6 && /^[A-Za-z0-9_-]+$/.test(cleanInput)) {
    validationResult.value = {
      valid: true,
      type: 'Nano ID',
      format: t('tools.uuid-generator.page.nanoLengthFormat', { len: cleanInput.length })
    };
  } else {
    validationResult.value = {
      valid: false,
      error: t('tools.uuid-generator.page.notValidError')
    };
  }
}

// 复制功能
async function copyUUID(uuid: string) {
  try {
    await navigator.clipboard.writeText(uuid);
    // 这里可以添加成功提示
  } catch (error) {
    console.error(t('tools.uuid-generator.page.copyFailed'), error);
  }
}

async function copyAllUUIDs() {
  const uuids = generatedUUIDs.value.map((u) => u.value).join('\n');
  try {
    await navigator.clipboard.writeText(uuids);
    // 这里可以添加成功提示
  } catch (error) {
    console.error(t('tools.uuid-generator.page.copyFailed'), error);
  }
}

// 导出功能
function exportUUIDs() {
  const content = generatedUUIDs.value.map((u, index) => `${index + 1}. ${u.value} (${u.type}) - ${u.timestamp}`).join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `uuids-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 清空功能
function clearAll() {
  generatedUUIDs.value = [];
}

// 历史记录管理
function addToHistory(uuid: string, type: string) {
  const historyItem: UUIDHistory = {
    uuid,
    timestamp: new Date().toLocaleString(),
    type
  };

  uuidHistory.value.unshift(historyItem);
  uuidHistory.value = uuidHistory.value.slice(0, 100); // 限制历史记录数量
  saveUUIDHistory();
}

function clearHistory() {
  uuidHistory.value = [];
  saveUUIDHistory();
}

function loadUUIDHistory() {
  try {
    const saved = localStorage.getItem('uuid-generator-history');
    if (saved) {
      uuidHistory.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error(t('tools.uuid-generator.page.loadHistoryFailed'), error);
  }
}

function saveUUIDHistory() {
  try {
    localStorage.setItem('uuid-generator-history', JSON.stringify(uuidHistory.value));
  } catch (error) {
    console.error(t('tools.uuid-generator.page.saveHistoryFailed'), error);
  }
}
</script>
