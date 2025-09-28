<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">密码生成配置</h3>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">基本设置</h4>
            <div class="flex gap-2">
              <button @click="generatePassword" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">生成密码</button>
              <button @click="resetSettings" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">重置</button>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2"> 密码长度: {{ settings.length }} </label>
              <input v-model.number="settings.length" type="range" min="4" max="128" class="w-full" @input="generatePassword" />
              <div class="flex justify-between text-xs text-gray-500 mt-1">
                <span>4</span>
                <span>128</span>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">生成数量</label>
              <input
                v-model.number="settings.count"
                type="number"
                min="1"
                max="50"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                @change="generatePassword"
              />
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">字符类型</h4>
          <div class="space-y-3">
            <label class="flex items-center space-x-3">
              <input v-model="settings.includeUppercase" type="checkbox" @change="generatePassword" />
              <span class="text-sm">大写字母 (A-Z)</span>
              <span class="text-xs text-gray-500 font-mono">{{ uppercaseChars.length }} 个字符</span>
            </label>

            <label class="flex items-center space-x-3">
              <input v-model="settings.includeLowercase" type="checkbox" @change="generatePassword" />
              <span class="text-sm">小写字母 (a-z)</span>
              <span class="text-xs text-gray-500 font-mono">{{ lowercaseChars.length }} 个字符</span>
            </label>

            <label class="flex items-center space-x-3">
              <input v-model="settings.includeNumbers" type="checkbox" @change="generatePassword" />
              <span class="text-sm">数字 (0-9)</span>
              <span class="text-xs text-gray-500 font-mono">{{ numberChars.length }} 个字符</span>
            </label>

            <label class="flex items-center space-x-3">
              <input v-model="settings.includeSymbols" type="checkbox" @change="generatePassword" />
              <span class="text-sm">符号</span>
              <span class="text-xs text-gray-500 font-mono">{{ symbolChars.length }} 个字符</span>
            </label>

            <div v-if="settings.includeSymbols" class="ml-6 space-y-2">
              <div class="text-xs text-gray-600 dark:text-gray-400">符号字符: {{ symbolChars }}</div>
              <label class="flex items-center space-x-2">
                <input v-model="settings.excludeAmbiguous" type="checkbox" @change="generatePassword" />
                <span class="text-xs">排除易混淆字符 (0, O, l, 1, I)</span>
              </label>
            </div>

            <div class="mt-3 p-2 bg-white dark:bg-gray-700 rounded border">
              <div class="text-xs text-gray-600 dark:text-gray-400 mb-1">自定义字符</div>
              <input
                v-model="settings.customChars"
                type="text"
                class="w-full px-2 py-1 border rounded text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                placeholder="输入自定义字符..."
                @input="generatePassword"
              />
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">高级选项</h4>
          <div class="space-y-3">
            <label class="flex items-center space-x-3">
              <input v-model="settings.noRepeats" type="checkbox" @change="generatePassword" />
              <span class="text-sm">避免重复字符</span>
            </label>

            <label class="flex items-center space-x-3">
              <input v-model="settings.noSequential" type="checkbox" @change="generatePassword" />
              <span class="text-sm">避免连续字符 (abc, 123)</span>
            </label>

            <label class="flex items-center space-x-3">
              <input v-model="settings.startWithLetter" type="checkbox" @change="generatePassword" />
              <span class="text-sm">以字母开头</span>
            </label>

            <label class="flex items-center space-x-3">
              <input v-model="settings.includeWords" type="checkbox" @change="generatePassword" />
              <span class="text-sm">包含单词 (更易记忆)</span>
            </label>

            <div v-if="settings.includeWords" class="ml-6">
              <label class="block text-sm mb-1">单词分隔符</label>
              <select v-model="settings.wordSeparator" class="w-full px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" @change="generatePassword">
                <option value="-">连字符 (-)</option>
                <option value="_">下划线 (_)</option>
                <option value=".">点号 (.)</option>
                <option value="">无分隔符</option>
              </select>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 class="font-medium mb-3">预设模板</h4>
          <div class="grid grid-cols-2 gap-2">
            <button @click="applyPreset('strong')" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm">强密码</button>
            <button @click="applyPreset('medium')" class="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm">中等密码</button>
            <button @click="applyPreset('simple')" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">简单密码</button>
            <button @click="applyPreset('pin')" class="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">数字PIN</button>
            <button @click="applyPreset('memorable')" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm">易记密码</button>
            <button @click="applyPreset('secure')" class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm">超安全</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">生成的密码</h3>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">密码列表</h4>
            <div class="flex gap-2">
              <button @click="copyAllPasswords" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">复制全部</button>
              <button @click="exportPasswords" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">导出</button>
            </div>
          </div>
          <div class="p-4">
            <div v-if="generatedPasswords.length > 0" class="space-y-2 max-h-96 overflow-y-auto">
              <div v-for="(password, index) in generatedPasswords" :key="index" class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded border">
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-sm break-all" :class="getPasswordStrengthClass(password.strength)">
                    {{ password.value }}
                  </div>
                  <div class="text-xs text-gray-500 mt-1">强度: {{ password.strength.label }} | 熵: {{ password.entropy.toFixed(1)} bits</div>
                </div>
                <div class="flex gap-1 ml-3">
                  <button @click="copyPassword(password.value)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">复制</button>
                  <button @click="regeneratePassword(index)" class="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs">重新生成</button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">
              <div class="text-lg mb-2">暂无生成的密码</div>
              <div class="text-sm">点击"生成密码"按钮开始</div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <h4 class="font-medium">密码强度分析</h4>
          </div>
          <div class="p-4">
            <div v-if="currentAnalysis" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center">
                  <div class="text-sm text-gray-500">总体强度</div>
                  <div class="text-lg font-medium" :class="getPasswordStrengthClass(currentAnalysis.strength)">
                    {{ currentAnalysis.strength.label }}
                  </div>
                </div>
                <div class="text-center">
                  <div class="text-sm text-gray-500">信息熵</div>
                  <div class="text-lg font-mono">{{ currentAnalysis.entropy.toFixed(1) }} bits</div>
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-sm font-medium">字符集分析</div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                  <div class="flex justify-between">
                    <span>大写字母:</span>
                    <span>{{ currentAnalysis.charTypes.uppercase }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>小写字母:</span>
                    <span>{{ currentAnalysis.charTypes.lowercase }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>数字:</span>
                    <span>{{ currentAnalysis.charTypes.numbers }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>符号:</span>
                    <span>{{ currentAnalysis.charTypes.symbols }}</span>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-sm font-medium">安全评估</div>
                <div class="space-y-1 text-sm">
                  <div class="flex justify-between">
                    <span>破解时间 (在线):</span>
                    <span class="font-mono">{{ currentAnalysis.crackTime.online }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>破解时间 (离线):</span>
                    <span class="font-mono">{{ currentAnalysis.crackTime.offline }}</span>
                  </div>
                </div>
              </div>

              <div v-if="currentAnalysis.suggestions.length > 0" class="space-y-2">
                <div class="text-sm font-medium">改进建议</div>
                <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li v-for="suggestion in currentAnalysis.suggestions" :key="suggestion" class="flex items-start">
                    <span class="text-yellow-500 mr-2">•</span>
                    <span>{{ suggestion }}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500">生成密码后将显示强度分析</div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
            <h4 class="font-medium">密码历史</h4>
            <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">清空历史</button>
          </div>
          <div class="p-4">
            <div v-if="passwordHistory.length > 0" class="space-y-2 max-h-40 overflow-y-auto">
              <div v-for="(history, index) in passwordHistory.slice(0, 20)" :key="index" class="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div class="flex-1 min-w-0">
                  <div class="font-mono text-xs truncate">{{ history.password }}</div>
                  <div class="text-xs text-gray-500">{{ history.timestamp }} - {{ history.strength }}</div>
                </div>
                <div class="flex gap-1">
                  <button @click="copyPassword(history.password)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">复制</button>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4 text-gray-500 text-sm">暂无密码历史</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">密码强度</h4>
          <ul class="space-y-1">
            <li>• <span class="text-red-500">弱</span>: 容易被破解</li>
            <li>• <span class="text-yellow-500">中等</span>: 一般安全性</li>
            <li>• <span class="text-green-500">强</span>: 推荐使用</li>
            <li>• <span class="text-blue-500">很强</span>: 高安全性</li>
            <li>• 信息熵越高越安全</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">安全建议</h4>
          <ul class="space-y-1">
            <li>• 使用至少12位字符</li>
            <li>• 包含多种字符类型</li>
            <li>• 避免个人信息</li>
            <li>• 定期更换密码</li>
            <li>• 使用密码管理器</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">注意事项</h4>
          <ul class="space-y-1">
            <li>• 密码在本地生成</li>
            <li>• 不会上传到服务器</li>
            <li>• 请妥善保管密码</li>
            <li>• 建议立即使用或保存</li>
            <li>• 关闭页面后历史清空</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface PasswordSettings {
  length: number;
  count: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
  customChars: string;
  noRepeats: boolean;
  noSequential: boolean;
  startWithLetter: boolean;
  includeWords: boolean;
  wordSeparator: string;
}

interface PasswordStrength {
  score: number;
  label: string;
}

interface PasswordAnalysis {
  strength: PasswordStrength;
  entropy: number;
  charTypes: {
    uppercase: number;
    lowercase: number;
    numbers: number;
    symbols: number;
  };
  crackTime: {
    online: string;
    offline: string;
  };
  suggestions: string[];
}

interface GeneratedPassword {
  value: string;
  strength: PasswordStrength;
  entropy: number;
}

interface PasswordHistory {
  password: string;
  timestamp: string;
  strength: string;
}

const settings = ref<PasswordSettings>({
  length: 16,
  count: 5,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeAmbiguous: false,
  customChars: '',
  noRepeats: false,
  noSequential: false,
  startWithLetter: false,
  includeWords: false,
  wordSeparator: '-'
});

const generatedPasswords = ref<GeneratedPassword[]>([]);
const passwordHistory = ref<PasswordHistory[]>([]);

const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
const numberChars = '0123456789';
const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const ambiguousChars = '0Ol1I';

const commonWords = [
  'apple',
  'banana',
  'cherry',
  'dragon',
  'eagle',
  'forest',
  'garden',
  'house',
  'island',
  'jungle',
  'kitten',
  'lemon',
  'mountain',
  'ocean',
  'planet',
  'queen',
  'river',
  'sunset',
  'tiger',
  'umbrella',
  'valley',
  'winter',
  'yellow',
  'zebra'
];

const currentAnalysis = computed(() => {
  if (generatedPasswords.value.length === 0) return null;

  const password = generatedPasswords.value[0];
  return analyzePassword(password.value);
});

onMounted(() => {
  generatePassword();
  loadPasswordHistory();
});

function getCharacterSet(): string {
  let charset = '';

  if (settings.value.includeUppercase) {
    charset += uppercaseChars;
  }

  if (settings.value.includeLowercase) {
    charset += lowercaseChars;
  }

  if (settings.value.includeNumbers) {
    charset += numberChars;
  }

  if (settings.value.includeSymbols) {
    let symbols = symbolChars;
    if (settings.value.excludeAmbiguous) {
      symbols = symbols
        .split('')
        .filter((char) => !ambiguousChars.includes(char))
        .join('');
    }
    charset += symbols;
  }

  if (settings.value.customChars) {
    charset += settings.value.customChars;
  }

  if (settings.value.excludeAmbiguous) {
    charset = charset
      .split('')
      .filter((char) => !ambiguousChars.includes(char))
      .join('');
  }

  return charset;
}

function generateSinglePassword(): string {
  if (settings.value.includeWords) {
    return generateWordBasedPassword();
  }

  const charset = getCharacterSet();
  if (!charset) return '';

  let password = '';
  const usedChars = new Set<string>();

  // 确保包含每种字符类型至少一个
  const requiredChars: string[] = [];
  if (settings.value.includeUppercase) requiredChars.push(getRandomChar(uppercaseChars));
  if (settings.value.includeLowercase) requiredChars.push(getRandomChar(lowercaseChars));
  if (settings.value.includeNumbers) requiredChars.push(getRandomChar(numberChars));
  if (settings.value.includeSymbols) {
    let symbols = symbolChars;
    if (settings.value.excludeAmbiguous) {
      symbols = symbols
        .split('')
        .filter((char) => !ambiguousChars.includes(char))
        .join('');
    }
    requiredChars.push(getRandomChar(symbols));
  }

  // 添加必需字符
  for (const char of requiredChars) {
    password += char;
    if (settings.value.noRepeats) {
      usedChars.add(char);
    }
  }

  // 填充剩余长度
  while (password.length < settings.value.length) {
    let char = getRandomChar(charset);

    // 检查重复字符
    if (settings.value.noRepeats && usedChars.has(char)) {
      continue;
    }

    // 检查连续字符
    if (settings.value.noSequential && password.length > 0) {
      const lastChar = password[password.length - 1];
      if (isSequential(lastChar, char)) {
        continue;
      }
    }

    password += char;
    if (settings.value.noRepeats) {
      usedChars.add(char);
    }
  }

  // 打乱字符顺序（除了必须以字母开头的情况）
  let shuffled = shuffleString(password);

  // 确保以字母开头
  if (settings.value.startWithLetter) {
    const letters = (settings.value.includeUppercase ? uppercaseChars : '') + (settings.value.includeLowercase ? lowercaseChars : '');
    if (letters && !letters.includes(shuffled[0])) {
      const letterIndex = shuffled.split('').findIndex((char) => letters.includes(char));
      if (letterIndex > 0) {
        // 交换第一个字符和找到的字母
        const chars = shuffled.split('');
        [chars[0], chars[letterIndex]] = [chars[letterIndex], chars[0]];
        shuffled = chars.join('');
      }
    }
  }

  return shuffled;
}

function generateWordBasedPassword(): string {
  const wordCount = Math.max(2, Math.floor(settings.value.length / 6));
  const selectedWords: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    const word = commonWords[Math.floor(Math.random() * commonWords.length)];
    selectedWords.push(word);
  }

  let password = selectedWords.join(settings.value.wordSeparator);

  // 添加数字和符号以增强安全性
  if (settings.value.includeNumbers) {
    password += Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, '0');
  }

  if (settings.value.includeSymbols) {
    password += getRandomChar(symbolChars);
  }

  // 随机大写一些字母
  if (settings.value.includeUppercase) {
    password = password
      .split('')
      .map((char) => {
        if (char.match(/[a-z]/) && Math.random() < 0.3) {
          return char.toUpperCase();
        }
        return char;
      })
      .join('');
  }

  return password.slice(0, settings.value.length);
}

function getRandomChar(charset: string): string {
  return charset[Math.floor(Math.random() * charset.length)];
}

function shuffleString(str: string): string {
  const chars = str.split('');
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

function isSequential(char1: string, char2: string): boolean {
  const code1 = char1.charCodeAt(0);
  const code2 = char2.charCodeAt(0);
  return Math.abs(code1 - code2) === 1;
}

function generatePassword() {
  const charset = getCharacterSet();
  if (!charset && !settings.value.includeWords) {
    generatedPasswords.value = [];
    return;
  }

  const passwords: GeneratedPassword[] = [];

  for (let i = 0; i < settings.value.count; i++) {
    const password = generateSinglePassword();
    if (password) {
      const strength = calculatePasswordStrength(password);
      const entropy = calculateEntropy(password);

      passwords.push({
        value: password,
        strength,
        entropy
      });

      // 添加到历史记录
      addToHistory(password, strength.label);
    }
  }

  generatedPasswords.value = passwords;
}

function regeneratePassword(index: number) {
  const password = generateSinglePassword();
  if (password) {
    const strength = calculatePasswordStrength(password);
    const entropy = calculateEntropy(password);

    generatedPasswords.value[index] = {
      value: password,
      strength,
      entropy
    };

    addToHistory(password, strength.label);
  }
}

function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;

  // 长度评分
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  // 字符类型评分
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // 复杂度评分
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) score += 1;

  if (score <= 2) return { score, label: '弱' };
  if (score <= 4) return { score, label: '中等' };
  if (score <= 6) return { score, label: '强' };
  return { score, label: '很强' };
}

function calculateEntropy(password: string): number {
  const charset = getCharacterSet();
  const charsetSize = charset.length || 95; // 默认ASCII可打印字符数
  return Math.log2(Math.pow(charsetSize, password.length));
}

function analyzePassword(password: string): PasswordAnalysis {
  const strength = calculatePasswordStrength(password);
  const entropy = calculateEntropy(password);

  const charTypes = {
    uppercase: (password.match(/[A-Z]/g) || []).length,
    lowercase: (password.match(/[a-z]/g) || []).length,
    numbers: (password.match(/[0-9]/g) || []).length,
    symbols: (password.match(/[^a-zA-Z0-9]/g) || []).length
  };

  // 计算破解时间（简化估算）
  const combinations = Math.pow(getCharacterSet().length || 95, password.length);
  const onlineAttacksPerSecond = 1000; // 在线攻击速度
  const offlineAttacksPerSecond = 1000000000; // 离线攻击速度

  const onlineSeconds = combinations / (2 * onlineAttacksPerSecond);
  const offlineSeconds = combinations / (2 * offlineAttacksPerSecond);

  const crackTime = {
    online: formatTime(onlineSeconds),
    offline: formatTime(offlineSeconds)
  };

  // 生成改进建议
  const suggestions: string[] = [];
  if (password.length < 12) suggestions.push('增加密码长度至12位以上');
  if (charTypes.uppercase === 0) suggestions.push('添加大写字母');
  if (charTypes.lowercase === 0) suggestions.push('添加小写字母');
  if (charTypes.numbers === 0) suggestions.push('添加数字');
  if (charTypes.symbols === 0) suggestions.push('添加特殊符号');
  if (entropy < 50) suggestions.push('增加字符种类以提高熵值');

  return {
    strength,
    entropy,
    charTypes,
    crackTime,
    suggestions
  };
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(0)} 秒`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(0)} 分钟`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(0)} 小时`;
  if (seconds < 31536000) return `${(seconds / 86400).toFixed(0)} 天`;
  if (seconds < 31536000000) return `${(seconds / 31536000).toFixed(0)} 年`;
  return '数千年';
}

function applyPreset(preset: string) {
  switch (preset) {
    case 'strong':
      settings.value = {
        ...settings.value,
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeAmbiguous: true,
        noRepeats: false,
        noSequential: true,
        startWithLetter: false,
        includeWords: false
      };
      break;
    case 'medium':
      settings.value = {
        ...settings.value,
        length: 12,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false,
        excludeAmbiguous: true,
        noRepeats: false,
        noSequential: false,
        startWithLetter: false,
        includeWords: false
      };
      break;
    case 'simple':
      settings.value = {
        ...settings.value,
        length: 8,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: false,
        excludeAmbiguous: true,
        noRepeats: false,
        noSequential: false,
        startWithLetter: true,
        includeWords: false
      };
      break;
    case 'pin':
      settings.value = {
        ...settings.value,
        length: 6,
        includeUppercase: false,
        includeLowercase: false,
        includeNumbers: true,
        includeSymbols: false,
        excludeAmbiguous: false,
        noRepeats: true,
        noSequential: true,
        startWithLetter: false,
        includeWords: false
      };
      break;
    case 'memorable':
      settings.value = {
        ...settings.value,
        length: 20,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeAmbiguous: false,
        noRepeats: false,
        noSequential: false,
        startWithLetter: false,
        includeWords: true,
        wordSeparator: '-'
      };
      break;
    case 'secure':
      settings.value = {
        ...settings.value,
        length: 32,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
        excludeAmbiguous: false,
        noRepeats: false,
        noSequential: true,
        startWithLetter: false,
        includeWords: false
      };
      break;
  }

  generatePassword();
}

function resetSettings() {
  settings.value = {
    length: 16,
    count: 5,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
    customChars: '',
    noRepeats: false,
    noSequential: false,
    startWithLetter: false,
    includeWords: false,
    wordSeparator: '-'
  };
  generatePassword();
}

async function copyPassword(password: string) {
  try {
    await navigator.clipboard.writeText(password);
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error);
  }
}

async function copyAllPasswords() {
  const passwords = generatedPasswords.value.map((p) => p.value).join('\n');
  try {
    await navigator.clipboard.writeText(passwords);
    // 这里可以添加成功提示
  } catch (error) {
    console.error('复制失败:', error);
  }
}

function exportPasswords() {
  const content = generatedPasswords.value.map((p, index) => `密码 ${index + 1}: ${p.value}\n强度: ${p.strength.label}\n熵值: ${p.entropy.toFixed(1)} bits\n`).join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `passwords-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function addToHistory(password: string, strength: string) {
  const historyItem: PasswordHistory = {
    password,
    timestamp: new Date().toLocaleString(),
    strength
  };

  passwordHistory.value.unshift(historyItem);
  passwordHistory.value = passwordHistory.value.slice(0, 100); // 限制历史记录数量
  savePasswordHistory();
}

function clearHistory() {
  passwordHistory.value = [];
  savePasswordHistory();
}

function getPasswordStrengthClass(strength: PasswordStrength): string {
  switch (strength.label) {
    case '弱':
      return 'text-red-500';
    case '中等':
      return 'text-yellow-500';
    case '强':
      return 'text-green-500';
    case '很强':
      return 'text-blue-500';
    default:
      return 'text-gray-500';
  }
}

function loadPasswordHistory() {
  try {
    const saved = localStorage.getItem('password-generator-history');
    if (saved) {
      passwordHistory.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error('加载密码历史失败:', error);
  }
}

function savePasswordHistory() {
  try {
    localStorage.setItem('password-generator-history', JSON.stringify(passwordHistory.value));
  } catch (error) {
    console.error('保存密码历史失败:', error);
  }
}
</script>
