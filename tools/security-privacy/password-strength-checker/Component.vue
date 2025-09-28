<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">密码强度检查器</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">输入密码</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full px-3 py-2 pr-12 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="输入要检查的密码..."
                @input="checkPassword"
              />
              <button @click="showPassword = !showPassword" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                {{ showPassword ? '👁️' : '🙈' }}
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">密码长度: {{ password.length }} 字符</p>
          </div>

          <div v-if="password" class="space-y-3">
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div class="flex justify-between items-center mb-2">
                <h4 class="font-medium">强度评分</h4>
                <span class="text-2xl font-bold" :class="strengthColor">{{ score }}/100</span>
              </div>

              <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 mb-2">
                <div class="h-3 rounded-full transition-all duration-300" :class="strengthBarColor" :style="{ width: `${score}%` }" />
              </div>

              <div class="flex justify-between items-center">
                <span class="text-sm font-medium" :class="strengthColor">{{ strengthLevel }}</span>
                <span class="text-xs text-gray-500">{{ strengthDescription }}</span>
              </div>
            </div>

            <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 class="font-medium mb-3">密码组成分析</h4>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="flex justify-between">
                  <span>小写字母:</span>
                  <span :class="analysis.lowercase ? 'text-green-600' : 'text-red-600'"> {{ analysis.lowercase ? '✓' : '✗' }} ({{ analysis.lowercaseCount }}) </span>
                </div>
                <div class="flex justify-between">
                  <span>大写字母:</span>
                  <span :class="analysis.uppercase ? 'text-green-600' : 'text-red-600'"> {{ analysis.uppercase ? '✓' : '✗' }} ({{ analysis.uppercaseCount }}) </span>
                </div>
                <div class="flex justify-between">
                  <span>数字:</span>
                  <span :class="analysis.numbers ? 'text-green-600' : 'text-red-600'"> {{ analysis.numbers ? '✓' : '✗' }} ({{ analysis.numbersCount }}) </span>
                </div>
                <div class="flex justify-between">
                  <span>特殊字符:</span>
                  <span :class="analysis.symbols ? 'text-green-600' : 'text-red-600'"> {{ analysis.symbols ? '✓' : '✗' }} ({{ analysis.symbolsCount }}) </span>
                </div>
                <div class="flex justify-between">
                  <span>字符种类:</span>
                  <span class="font-medium">{{ analysis.characterTypes }}/4</span>
                </div>
                <div class="flex justify-between">
                  <span>熵值:</span>
                  <span class="font-medium">{{ analysis.entropy.toFixed(1) }} bits</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="generateStrongPassword" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">生成强密码</button>
            <button @click="clearPassword" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">安全建议</h3>

        <div v-if="password" class="space-y-4">
          <div v-if="suggestions.length > 0" class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h4 class="font-medium text-yellow-800 dark:text-yellow-200 mb-3">改进建议</h4>
            <ul class="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
              <li v-for="suggestion in suggestions" :key="suggestion" class="flex items-start gap-2">
                <span class="text-yellow-600">•</span>
                <span>{{ suggestion }}</span>
              </li>
            </ul>
          </div>

          <div v-if="warnings.length > 0" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <h4 class="font-medium text-red-800 dark:text-red-200 mb-3">安全警告</h4>
            <ul class="space-y-2 text-sm text-red-700 dark:text-red-300">
              <li v-for="warning in warnings" :key="warning" class="flex items-start gap-2">
                <span class="text-red-600">⚠️</span>
                <span>{{ warning }}</span>
              </li>
            </ul>
          </div>

          <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 class="font-medium text-green-800 dark:text-green-200 mb-3">破解时间估算</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>在线攻击 (100次/秒):</span>
                <span class="font-medium">{{ crackTimes.online }}</span>
              </div>
              <div class="flex justify-between">
                <span>离线攻击 (10亿次/秒):</span>
                <span class="font-medium">{{ crackTimes.offline }}</span>
              </div>
              <div class="flex justify-between">
                <span>超级计算机 (1万亿次/秒):</span>
                <span class="font-medium">{{ crackTimes.supercomputer }}</span>
              </div>
            </div>
          </div>

          <div v-if="score >= 80" class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div class="flex items-center gap-2 text-green-800 dark:text-green-200">
              <span class="text-2xl">🛡️</span>
              <div>
                <h4 class="font-medium">密码强度优秀！</h4>
                <p class="text-sm">这是一个非常安全的密码，可以有效抵御各种攻击。</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">🔐</div>
          <div class="text-lg mb-2">密码强度检查器</div>
          <div class="text-sm">输入密码查看安全强度和改进建议</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 class="font-medium mb-3">密码安全准则</h3>
        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div class="flex items-start gap-2">
            <span class="text-green-600">✓</span>
            <span>至少12个字符长度</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-600">✓</span>
            <span>包含大小写字母</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-600">✓</span>
            <span>包含数字和特殊字符</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-600">✓</span>
            <span>避免个人信息</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-600">✓</span>
            <span>避免常见密码</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-600">✓</span>
            <span>定期更换密码</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-600">✓</span>
            <span>使用密码管理器</span>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 class="font-medium mb-3">常见弱密码模式</h3>
        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div class="flex items-start gap-2">
            <span class="text-red-600">✗</span>
            <span>连续字符 (123456, abcdef)</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-red-600">✗</span>
            <span>重复字符 (aaaaaa, 111111)</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-red-600">✗</span>
            <span>键盘模式 (qwerty, asdfgh)</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-red-600">✗</span>
            <span>常见密码 (password, admin)</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-red-600">✗</span>
            <span>个人信息 (生日, 姓名)</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-red-600">✗</span>
            <span>字典单词 (love, money)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface PasswordAnalysis {
  lowercase: boolean;
  uppercase: boolean;
  numbers: boolean;
  symbols: boolean;
  lowercaseCount: number;
  uppercaseCount: number;
  numbersCount: number;
  symbolsCount: number;
  characterTypes: number;
  entropy: number;
}

interface CrackTimes {
  online: string;
  offline: string;
  supercomputer: string;
}

const password = ref('');
const showPassword = ref(false);

const analysis = computed((): PasswordAnalysis => {
  const pwd = password.value;

  const lowercaseCount = (pwd.match(/[a-z]/g) || []).length;
  const uppercaseCount = (pwd.match(/[A-Z]/g) || []).length;
  const numbersCount = (pwd.match(/[0-9]/g) || []).length;
  const symbolsCount = (pwd.match(/[^a-zA-Z0-9]/g) || []).length;

  const lowercase = lowercaseCount > 0;
  const uppercase = uppercaseCount > 0;
  const numbers = numbersCount > 0;
  const symbols = symbolsCount > 0;

  const characterTypes = [lowercase, uppercase, numbers, symbols].filter(Boolean).length;

  // 计算熵值
  let charsetSize = 0;
  if (lowercase) charsetSize += 26;
  if (uppercase) charsetSize += 26;
  if (numbers) charsetSize += 10;
  if (symbols) charsetSize += 32; // 常见特殊字符

  const entropy = pwd.length * Math.log2(charsetSize || 1);

  return {
    lowercase,
    uppercase,
    numbers,
    symbols,
    lowercaseCount,
    uppercaseCount,
    numbersCount,
    symbolsCount,
    characterTypes,
    entropy
  };
});

const score = computed((): number => {
  if (!password.value) return 0;

  let score = 0;
  const pwd = password.value;

  // 长度评分 (0-30分)
  if (pwd.length >= 12) score += 30;
  else if (pwd.length >= 8) score += 20;
  else if (pwd.length >= 6) score += 10;
  else score += 5;

  // 字符类型评分 (0-40分)
  score += analysis.value.characterTypes * 10;

  // 熵值评分 (0-20分)
  if (analysis.value.entropy >= 60) score += 20;
  else if (analysis.value.entropy >= 40) score += 15;
  else if (analysis.value.entropy >= 25) score += 10;
  else score += 5;

  // 模式检查 (扣分项)
  if (hasSequentialChars(pwd)) score -= 10;
  if (hasRepeatingChars(pwd)) score -= 10;
  if (hasKeyboardPattern(pwd)) score -= 15;
  if (isCommonPassword(pwd)) score -= 20;

  return Math.max(0, Math.min(100, score));
});

const strengthLevel = computed((): string => {
  if (score.value >= 80) return '非常强';
  if (score.value >= 60) return '强';
  if (score.value >= 40) return '中等';
  if (score.value >= 20) return '弱';
  return '非常弱';
});

const strengthDescription = computed((): string => {
  if (score.value >= 80) return '优秀的密码强度';
  if (score.value >= 60) return '良好的密码强度';
  if (score.value >= 40) return '一般的密码强度';
  if (score.value >= 20) return '较弱的密码强度';
  return '极弱的密码强度';
});

const strengthColor = computed((): string => {
  if (score.value >= 80) return 'text-green-600';
  if (score.value >= 60) return 'text-blue-600';
  if (score.value >= 40) return 'text-yellow-600';
  if (score.value >= 20) return 'text-orange-600';
  return 'text-red-600';
});

const strengthBarColor = computed((): string => {
  if (score.value >= 80) return 'bg-green-500';
  if (score.value >= 60) return 'bg-blue-500';
  if (score.value >= 40) return 'bg-yellow-500';
  if (score.value >= 20) return 'bg-orange-500';
  return 'bg-red-500';
});

const suggestions = computed((): string[] => {
  const suggestions: string[] = [];
  const pwd = password.value;

  if (pwd.length < 12) {
    suggestions.push('增加密码长度至少12个字符');
  }

  if (!analysis.value.lowercase) {
    suggestions.push('添加小写字母 (a-z)');
  }

  if (!analysis.value.uppercase) {
    suggestions.push('添加大写字母 (A-Z)');
  }

  if (!analysis.value.numbers) {
    suggestions.push('添加数字 (0-9)');
  }

  if (!analysis.value.symbols) {
    suggestions.push('添加特殊字符 (!@#$%^&*)');
  }

  if (analysis.value.characterTypes < 3) {
    suggestions.push('使用至少3种不同类型的字符');
  }

  if (analysis.value.entropy < 40) {
    suggestions.push('增加密码的随机性和复杂度');
  }

  return suggestions;
});

const warnings = computed((): string[] => {
  const warnings: string[] = [];
  const pwd = password.value;

  if (hasSequentialChars(pwd)) {
    warnings.push('包含连续字符序列，容易被猜测');
  }

  if (hasRepeatingChars(pwd)) {
    warnings.push('包含重复字符，降低了密码强度');
  }

  if (hasKeyboardPattern(pwd)) {
    warnings.push('包含键盘模式，容易被破解');
  }

  if (isCommonPassword(pwd)) {
    warnings.push('这是一个常见密码，极易被破解');
  }

  if (pwd.length < 8) {
    warnings.push('密码长度过短，存在严重安全风险');
  }

  return warnings;
});

const crackTimes = computed((): CrackTimes => {
  const combinations = Math.pow(2, analysis.value.entropy);

  // 平均需要尝试一半的组合
  const avgCombinations = combinations / 2;

  const onlineSeconds = avgCombinations / 100; // 100次/秒
  const offlineSeconds = avgCombinations / 1e9; // 10亿次/秒
  const supercomputerSeconds = avgCombinations / 1e12; // 1万亿次/秒

  return {
    online: formatTime(onlineSeconds),
    offline: formatTime(offlineSeconds),
    supercomputer: formatTime(supercomputerSeconds)
  };
});

function hasSequentialChars(pwd: string): boolean {
  const sequences = ['0123456789', 'abcdefghijklmnopqrstuvwxyz', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

  for (const seq of sequences) {
    for (let i = 0; i <= seq.length - 3; i++) {
      const subseq = seq.substring(i, i + 3);
      if (pwd.toLowerCase().includes(subseq) || pwd.toLowerCase().includes(subseq.split('').reverse().join(''))) {
        return true;
      }
    }
  }

  return false;
}

function hasRepeatingChars(pwd: string): boolean {
  return /(.)\1{2,}/.test(pwd);
}

function hasKeyboardPattern(pwd: string): boolean {
  const patterns = ['qwerty', 'asdfgh', 'zxcvbn', '123456', '654321'];
  const lowerPwd = pwd.toLowerCase();

  return patterns.some((pattern) => lowerPwd.includes(pattern));
}

function isCommonPassword(pwd: string): boolean {
  const commonPasswords = [
    'password',
    '123456',
    '123456789',
    'qwerty',
    'abc123',
    'password123',
    'admin',
    'letmein',
    'welcome',
    'monkey',
    '1234567890',
    'password1',
    'qwerty123',
    'admin123',
    '123123',
    '111111',
    '000000',
    'root'
  ];

  return commonPasswords.includes(pwd.toLowerCase());
}

function formatTime(seconds: number): string {
  if (seconds < 1) return '瞬间';
  if (seconds < 60) return `${Math.ceil(seconds)} 秒`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)} 分钟`;
  if (seconds < 86400) return `${Math.ceil(seconds / 3600)} 小时`;
  if (seconds < 31536000) return `${Math.ceil(seconds / 86400)} 天`;
  return `${Math.ceil(seconds / 31536000)} 年`;
}

function checkPassword() {
  // 触发响应式更新
}

function generateStrongPassword() {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = lowercase + uppercase + numbers + symbols;
  let newPassword = '';

  // 确保包含每种字符类型
  newPassword += lowercase[Math.floor(Math.random() * lowercase.length)];
  newPassword += uppercase[Math.floor(Math.random() * uppercase.length)];
  newPassword += numbers[Math.floor(Math.random() * numbers.length)];
  newPassword += symbols[Math.floor(Math.random() * symbols.length)];

  // 添加剩余字符
  for (let i = 4; i < 16; i++) {
    newPassword += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // 打乱字符顺序
  password.value = newPassword
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
  checkPassword();
}

function clearPassword() {
  password.value = '';
}
</script>
