<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.password-strength-checker.page.title') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.password-strength-checker.page.inputLabel') }}</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full px-3 py-2 pr-12 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                :placeholder="$t('tools.password-strength-checker.page.inputPlaceholder')"
                @input="checkPassword"
              />
              <button @click="showPassword = !showPassword" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                {{ showPassword ? '👁️' : '🙈' }}
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ $t('tools.password-strength-checker.page.lengthLabel') }} {{ password.length }} {{ $t('tools.password-strength-checker.page.charsUnit') }}</p>
          </div>

          <div v-if="password" class="space-y-3">
            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div class="flex justify-between items-center mb-2">
                <h4 class="font-medium">{{ $t('tools.password-strength-checker.page.scoreTitle') }}</h4>
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
              <h4 class="font-medium mb-3">{{ $t('tools.password-strength-checker.page.compositionTitle') }}</h4>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div class="flex justify-between">
                  <span>{{ $t('tools.password-strength-checker.page.lowercase') }}</span>
                  <span :class="analysis.lowercase ? 'text-green-600' : 'text-red-600'"> {{ analysis.lowercase ? '✓' : '✗' }} ({{ analysis.lowercaseCount }}) </span>
                </div>
                <div class="flex justify-between">
                  <span>{{ $t('tools.password-strength-checker.page.uppercase') }}</span>
                  <span :class="analysis.uppercase ? 'text-green-600' : 'text-red-600'"> {{ analysis.uppercase ? '✓' : '✗' }} ({{ analysis.uppercaseCount }}) </span>
                </div>
                <div class="flex justify-between">
                  <span>{{ $t('tools.password-strength-checker.page.numbers') }}</span>
                  <span :class="analysis.numbers ? 'text-green-600' : 'text-red-600'"> {{ analysis.numbers ? '✓' : '✗' }} ({{ analysis.numbersCount }}) </span>
                </div>
                <div class="flex justify-between">
                  <span>{{ $t('tools.password-strength-checker.page.symbols') }}</span>
                  <span :class="analysis.symbols ? 'text-green-600' : 'text-red-600'"> {{ analysis.symbols ? '✓' : '✗' }} ({{ analysis.symbolsCount }}) </span>
                </div>
                <div class="flex justify-between">
                  <span>{{ $t('tools.password-strength-checker.page.charTypes') }}</span>
                  <span class="font-medium">{{ analysis.characterTypes }}/4</span>
                </div>
                <div class="flex justify-between">
                  <span>{{ $t('tools.password-strength-checker.page.entropy') }}</span>
                  <span class="font-medium">{{ analysis.entropy.toFixed(1) }} bits</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="generateStrongPassword" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
              {{ $t('tools.password-strength-checker.page.generateStrong') }}
            </button>
            <button @click="clearPassword" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">
              {{ $t('tools.password-strength-checker.page.clear') }}
            </button>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.password-strength-checker.page.safetyAdviceTitle') }}</h3>

        <div v-if="password" class="space-y-4">
          <div v-if="suggestions.length > 0" class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h4 class="font-medium text-yellow-800 dark:text-yellow-200 mb-3">{{ $t('tools.password-strength-checker.page.improvementsTitle') }}</h4>
            <ul class="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
              <li v-for="suggestion in suggestions" :key="suggestion" class="flex items-start gap-2">
                <span class="text-yellow-600">•</span>
                <span>{{ suggestion }}</span>
              </li>
            </ul>
          </div>

          <div v-if="warnings.length > 0" class="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <h4 class="font-medium text-red-800 dark:text-red-200 mb-3">{{ $t('tools.password-strength-checker.page.warningsTitle') }}</h4>
            <ul class="space-y-2 text-sm text-red-700 dark:text-red-300">
              <li v-for="warning in warnings" :key="warning" class="flex items-start gap-2">
                <span class="text-red-600">⚠️</span>
                <span>{{ warning }}</span>
              </li>
            </ul>
          </div>

          <div class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h4 class="font-medium text-green-800 dark:text-green-200 mb-3">{{ $t('tools.password-strength-checker.page.crackEstimateTitle') }}</h4>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span>{{ $t('tools.password-strength-checker.page.attackOnline') }}</span>
                <span class="font-medium">{{ crackTimes.online }}</span>
              </div>
              <div class="flex justify-between">
                <span>{{ $t('tools.password-strength-checker.page.attackOffline') }}</span>
                <span class="font-medium">{{ crackTimes.offline }}</span>
              </div>
              <div class="flex justify-between">
                <span>{{ $t('tools.password-strength-checker.page.attackSupercomputer') }}</span>
                <span class="font-medium">{{ crackTimes.supercomputer }}</span>
              </div>
            </div>
          </div>

          <div v-if="score >= 80" class="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div class="flex items-center gap-2 text-green-800 dark:text-green-200">
              <span class="text-2xl">🛡️</span>
              <div>
                <h4 class="font-medium">{{ $t('tools.password-strength-checker.page.excellentTitle') }}</h4>
                <p class="text-sm">{{ $t('tools.password-strength-checker.page.excellentDesc') }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">🔐</div>
          <div class="text-lg mb-2">{{ $t('tools.password-strength-checker.page.title') }}</div>
          <div class="text-sm">{{ $t('tools.password-strength-checker.page.emptySubtitle') }}</div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 class="font-medium mb-3">{{ $t('tools.password-strength-checker.page.guidelineTitle') }}</h3>
        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div class="flex items-start gap-2">
            <span class="text-green-600">✓</span>
            <span>{{ $t('tools.password-strength-checker.page.ruleLen12') }}</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-600">✓</span>
            <span>{{ $t('tools.password-strength-checker.page.ruleCase') }}</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-600">✓</span>
            <span>{{ $t('tools.password-strength-checker.page.ruleNumSym') }}</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-600">✓</span>
            <span>{{ $t('tools.password-strength-checker.page.ruleNoPersonal') }}</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-600">✓</span>
            <span>{{ $t('tools.password-strength-checker.page.ruleNoCommon') }}</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-600">✓</span>
            <span>{{ $t('tools.password-strength-checker.page.ruleRotate') }}</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-green-600">✓</span>
            <span>{{ $t('tools.password-strength-checker.page.ruleManager') }}</span>
          </div>
        </div>
      </div>

      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h3 class="font-medium mb-3">{{ $t('tools.password-strength-checker.page.weakPatternsTitle') }}</h3>
        <div class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <div class="flex items-start gap-2">
            <span class="text-red-600">✗</span>
            <span>{{ $t('tools.password-strength-checker.page.patternSequential') }}</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-red-600">✗</span>
            <span>{{ $t('tools.password-strength-checker.page.patternRepeating') }}</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-red-600">✗</span>
            <span>{{ $t('tools.password-strength-checker.page.patternKeyboard') }}</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-red-600">✗</span>
            <span>{{ $t('tools.password-strength-checker.page.patternCommon') }}</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-red-600">✗</span>
            <span>{{ $t('tools.password-strength-checker.page.patternPersonal') }}</span>
          </div>
          <div class="flex items-start gap-2">
            <span class="text-red-600">✗</span>
            <span>{{ $t('tools.password-strength-checker.page.patternDictionary') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

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

  // Calculate entropy
  let charsetSize = 0;
  if (lowercase) charsetSize += 26;
  if (uppercase) charsetSize += 26;
  if (numbers) charsetSize += 10;
  if (symbols) charsetSize += 32; // common special symbols

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

  // Length score (0-30)
  if (pwd.length >= 12) score += 30;
  else if (pwd.length >= 8) score += 20;
  else if (pwd.length >= 6) score += 10;
  else score += 5;

  // Character types score (0-40)
  score += analysis.value.characterTypes * 10;

  // Entropy score (0-20)
  if (analysis.value.entropy >= 60) score += 20;
  else if (analysis.value.entropy >= 40) score += 15;
  else if (analysis.value.entropy >= 25) score += 10;
  else score += 5;

  // Pattern checks (penalties)
  if (hasSequentialChars(pwd)) score -= 10;
  if (hasRepeatingChars(pwd)) score -= 10;
  if (hasKeyboardPattern(pwd)) score -= 15;
  if (isCommonPassword(pwd)) score -= 20;

  return Math.max(0, Math.min(100, score));
});

const strengthLevel = computed((): string => {
  if (score.value >= 80) return t('tools.password-strength-checker.page.level.veryStrong');
  if (score.value >= 60) return t('tools.password-strength-checker.page.level.strong');
  if (score.value >= 40) return t('tools.password-strength-checker.page.level.medium');
  if (score.value >= 20) return t('tools.password-strength-checker.page.level.weak');
  return t('tools.password-strength-checker.page.level.veryWeak');
});

const strengthDescription = computed((): string => {
  if (score.value >= 80) return t('tools.password-strength-checker.page.levelDesc.veryStrong');
  if (score.value >= 60) return t('tools.password-strength-checker.page.levelDesc.strong');
  if (score.value >= 40) return t('tools.password-strength-checker.page.levelDesc.medium');
  if (score.value >= 20) return t('tools.password-strength-checker.page.levelDesc.weak');
  return t('tools.password-strength-checker.page.levelDesc.veryWeak');
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
  const out: string[] = [];
  const pwd = password.value;

  if (pwd.length < 12) out.push(t('tools.password-strength-checker.page.suggest.len12'));
  if (!analysis.value.lowercase) out.push(t('tools.password-strength-checker.page.suggest.addLower'));
  if (!analysis.value.uppercase) out.push(t('tools.password-strength-checker.page.suggest.addUpper'));
  if (!analysis.value.numbers) out.push(t('tools.password-strength-checker.page.suggest.addNumber'));
  if (!analysis.value.symbols) out.push(t('tools.password-strength-checker.page.suggest.addSymbol'));
  if (analysis.value.characterTypes < 3) out.push(t('tools.password-strength-checker.page.suggest.use3Types'));
  if (analysis.value.entropy < 40) out.push(t('tools.password-strength-checker.page.suggest.increaseRandom'));

  return out;
});

const warnings = computed((): string[] => {
  const out: string[] = [];
  const pwd = password.value;

  if (hasSequentialChars(pwd)) out.push(t('tools.password-strength-checker.page.warn.sequential'));
  if (hasRepeatingChars(pwd)) out.push(t('tools.password-strength-checker.page.warn.repeating'));
  if (hasKeyboardPattern(pwd)) out.push(t('tools.password-strength-checker.page.warn.keyboard'));
  if (isCommonPassword(pwd)) out.push(t('tools.password-strength-checker.page.warn.common'));
  if (pwd.length < 8) out.push(t('tools.password-strength-checker.page.warn.tooShort'));

  return out;
});

const crackTimes = computed((): CrackTimes => {
  const combinations = Math.pow(2, analysis.value.entropy);
  const avgCombinations = combinations / 2;

  const onlineSeconds = avgCombinations / 100; // 100/sec
  const offlineSeconds = avgCombinations / 1e9; // 1e9/sec
  const supercomputerSeconds = avgCombinations / 1e12; // 1e12/sec

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
  if (seconds < 1) return t('tools.password-strength-checker.page.time.instant');
  if (seconds < 60) return t('tools.password-strength-checker.page.time.seconds', { n: Math.ceil(seconds) });
  if (seconds < 3600) return t('tools.password-strength-checker.page.time.minutes', { n: Math.ceil(seconds / 60) });
  if (seconds < 86400) return t('tools.password-strength-checker.page.time.hours', { n: Math.ceil(seconds / 3600) });
  if (seconds < 31536000) return t('tools.password-strength-checker.page.time.days', { n: Math.ceil(seconds / 86400) });
  return t('tools.password-strength-checker.page.time.years', { n: Math.ceil(seconds / 31536000) });
}

function checkPassword() {
  // trigger reactivity
}

function generateStrongPassword() {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = lowercase + uppercase + numbers + symbols;
  let newPassword = '';

  newPassword += lowercase[Math.floor(Math.random() * lowercase.length)];
  newPassword += uppercase[Math.floor(Math.random() * uppercase.length)];
  newPassword += numbers[Math.floor(Math.random() * numbers.length)];
  newPassword += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = 4; i < 16; i++) {
    newPassword += allChars[Math.floor(Math.random() * allChars.length)];
  }

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
