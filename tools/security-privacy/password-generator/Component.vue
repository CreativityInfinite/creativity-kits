<template>
  <div class="space-y-4">
    <h3 class="font-medium text-lg">{{ $t('tools.password-generator.page.title') }}</h3>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="space-y-4 lg:col-span-2">
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.password-generator.page.length') }}</label>
            <div class="flex items-center gap-3">
              <input type="range" min="6" max="64" v-model.number="length" class="w-full" />
              <span class="w-12 text-right font-medium">{{ length }}</span>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.password-generator.page.charsets') }}</label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
              <label class="inline-flex items-center gap-2">
                <input type="checkbox" v-model="useLower" />
                <span>{{ $t('tools.password-generator.page.lowercase') }}</span>
              </label>
              <label class="inline-flex items-center gap-2">
                <input type="checkbox" v-model="useUpper" />
                <span>{{ $t('tools.password-generator.page.uppercase') }}</span>
              </label>
              <label class="inline-flex items-center gap-2">
                <input type="checkbox" v-model="useNumbers" />
                <span>{{ $t('tools.password-generator.page.numbers') }}</span>
              </label>
              <label class="inline-flex items-center gap-2">
                <input type="checkbox" v-model="useSymbols" />
                <span>{{ $t('tools.password-generator.page.symbols') }}</span>
              </label>
              <label class="inline-flex items-center gap-2 col-span-2 sm:col-span-3">
                <input type="checkbox" v-model="avoidAmbiguous" />
                <span>{{ $t('tools.password-generator.page.avoidAmbiguous') }}</span>
              </label>
            </div>
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium mb-1">{{ $t('tools.password-generator.page.generated') }}</label>
            <div class="flex gap-2">
              <input
                type="text"
                readonly
                class="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                :value="password"
                :placeholder="$t('tools.password-generator.page.placeholder')"
              />
              <button @click="copy" class="px-3 py-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white">
                {{ $t('tools.password-generator.page.copy') }}
              </button>
            </div>
            <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
          </div>
        </div>

        <div class="flex gap-2">
          <button @click="generate" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
            {{ $t('tools.password-generator.page.generate') }}
          </button>
          <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">
            {{ $t('tools.password-generator.page.clear') }}
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <h4 class="font-medium">{{ $t('tools.password-generator.page.tipsTitle') }}</h4>
        <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li class="flex items-start gap-2">
            <span class="text-green-600">✓</span><span>{{ $t('tools.password-generator.page.tipLen') }}</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-green-600">✓</span><span>{{ $t('tools.password-generator.page.tipTypes') }}</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-green-600">✓</span><span>{{ $t('tools.password-generator.page.tipNoReuse') }}</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-green-600">✓</span><span>{{ $t('tools.password-generator.page.tipManager') }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const length = ref(16);
const useLower = ref(true);
const useUpper = ref(true);
const useNumbers = ref(true);
const useSymbols = ref(true);
const avoidAmbiguous = ref(true);
const password = ref('');
const error = ref('');

function clearAll() {
  password.value = '';
  error.value = '';
}

function buildCharset(): string {
  let chars = '';
  if (useLower.value) chars += 'abcdefghijklmnopqrstuvwxyz';
  if (useUpper.value) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (useNumbers.value) chars += '0123456789';
  if (useSymbols.value) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (avoidAmbiguous.value) {
    const ambiguous = /[O0Il1l{}\[\]()\\\/'"`|]/g;
    chars = chars.replace(ambiguous, '');
  }
  return chars;
}

function generate() {
  error.value = '';
  const chars = buildCharset();
  if (!chars.length) {
    error.value = t('tools.password-generator.page.errNoCharset');
    return;
  }
  if (length.value < 6) {
    error.value = t('tools.password-generator.page.errTooShort');
    return;
  }
  let out = '';
  const cryptoObj = window.crypto || (window as any).msCrypto;
  if (cryptoObj?.getRandomValues) {
    const arr = new Uint32Array(length.value);
    cryptoObj.getRandomValues(arr);
    for (let i = 0; i < length.value; i++) {
      out += chars[arr[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length.value; i++) {
      out += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  password.value = out;
}

async function copy() {
  if (!password.value) return;
  try {
    await navigator.clipboard.writeText(password.value);
  } catch {
    // ignore
  }
}
</script>
