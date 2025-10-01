<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.phonetic-transcriber.page.title') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-2">{{ $t('tools.phonetic-transcriber.page.inputLanguage') }}</label>
            <select v-model="inputLanguage" @change="transcribe" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="en">{{ $t('tools.phonetic-transcriber.page.lang.en') }}</option>
              <option value="zh">{{ $t('tools.phonetic-transcriber.page.lang.zh') }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">{{ $t('tools.phonetic-transcriber.page.phoneticType') }}</label>
            <select v-model="phoneticType" @change="transcribe" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option v-if="inputLanguage === 'en'" value="ipa">{{ $t('tools.phonetic-transcriber.page.type.ipa') }}</option>
              <option v-if="inputLanguage === 'en'" value="ame">{{ $t('tools.phonetic-transcriber.page.type.ame') }}</option>
              <option v-if="inputLanguage === 'zh'" value="pinyin">{{ $t('tools.phonetic-transcriber.page.type.pinyin') }}</option>
              <option v-if="inputLanguage === 'zh'" value="zhuyin">{{ $t('tools.phonetic-transcriber.page.type.zhuyin') }}</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">{{ $t('tools.phonetic-transcriber.page.inputText') }}</label>
            <textarea
              v-model="inputText"
              rows="8"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.phonetic-transcriber.page.inputTextPlaceholder')"
              @input="transcribe"
            />
          </div>

          <div class="flex gap-2">
            <button @click="transcribe" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">{{ $t('tools.phonetic-transcriber.page.actions.transcribe') }}</button>
            <button @click="clearAll" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded">{{ $t('tools.phonetic-transcriber.page.actions.clear') }}</button>
            <button @click="loadSample" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded">{{ $t('tools.phonetic-transcriber.page.actions.sample') }}</button>
          </div>

          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.phonetic-transcriber.page.batch.title') }}</h4>
            <div class="space-y-2">
              <textarea
                v-model="batchInput"
                rows="4"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                :placeholder="$t('tools.phonetic-transcriber.page.batch.placeholder')"
              />
              <div class="flex gap-2">
                <button @click="batchTranscribe" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.phonetic-transcriber.page.batch.run') }}</button>
                <button @click="exportBatch" :disabled="batchResults.length === 0" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded text-sm">
                  {{ $t('tools.phonetic-transcriber.page.batch.export') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.phonetic-transcriber.page.results.title') }}</h3>

        <div v-if="result" class="space-y-4">
          <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium">{{ $t('tools.phonetic-transcriber.page.results.phoneticTitle') }}</h4>
              <button @click="copyResult" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.phonetic-transcriber.page.copy') }}</button>
            </div>
            <div class="space-y-3">
              <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded font-mono text-lg">
                {{ result.phonetic }}
              </div>
              <div v-if="result.breakdown && result.breakdown.length > 0" class="space-y-2">
                <h5 class="font-medium text-sm">{{ $t('tools.phonetic-transcriber.page.results.breakdownTitle') }}</h5>
                <div class="space-y-1">
                  <div v-for="(item, index) in result.breakdown" :key="index" class="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span>{{ item.word }}</span>
                    <span class="font-mono">{{ item.phonetic }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 border rounded-lg p-4">
            <h4 class="font-medium mb-3">{{ $t('tools.phonetic-transcriber.page.stats.title') }}</h4>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">{{ $t('tools.phonetic-transcriber.page.stats.totalChars') }}</span>
                <span>{{ result.stats.totalChars }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">{{ $t('tools.phonetic-transcriber.page.stats.wordCount') }}</span>
                <span>{{ result.stats.wordCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">{{ $t('tools.phonetic-transcriber.page.stats.syllableCount') }}</span>
                <span>{{ result.stats.syllableCount }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">{{ $t('tools.phonetic-transcriber.page.stats.language') }}</span>
                <span>{{ inputLanguage === 'en' ? $t('tools.phonetic-transcriber.page.language.en') : $t('tools.phonetic-transcriber.page.language.zh') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12 text-gray-500">
          <div class="text-4xl mb-4">🔤</div>
          <div class="text-lg mb-2">{{ $t('tools.phonetic-transcriber.page.emptyTitle') }}</div>
          <div class="text-sm">{{ $t('tools.phonetic-transcriber.page.emptySubtitle') }}</div>
        </div>
      </div>
    </div>

    <div v-if="batchResults.length > 0" class="bg-white dark:bg-gray-800 border rounded-lg">
      <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
        <h4 class="font-medium">{{ $t('tools.phonetic-transcriber.page.batchResultsTitle') }} ({{ batchResults.length }})</h4>
        <button @click="clearBatchResults" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('tools.phonetic-transcriber.page.clearBatch') }}</button>
      </div>
      <div class="p-4">
        <div class="space-y-2 max-h-64 overflow-y-auto">
          <div v-for="(item, index) in batchResults" :key="index" class="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <span class="flex-1">{{ item.original }}</span>
            <span class="font-mono text-blue-600 dark:text-blue-400">{{ item.phonetic }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-gray-800 border rounded-lg">
      <div class="p-3 border-b bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
        <h4 class="font-medium">{{ $t('tools.phonetic-transcriber.page.history.title') }}</h4>
        <button @click="clearHistory" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('tools.phonetic-transcriber.page.history.clear') }}</button>
      </div>
      <div class="p-4">
        <div v-if="history.length > 0" class="space-y-2 max-h-32 overflow-y-auto">
          <div v-for="(item, index) in history.slice(0, 10)" :key="index" class="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <div class="flex-1 min-w-0">
              <div class="truncate">{{ item.original }}</div>
              <div class="text-xs text-gray-500">{{ item.timestamp }}</div>
            </div>
            <div class="flex gap-1">
              <button @click="loadFromHistory(item)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.phonetic-transcriber.page.history.load') }}</button>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-500 text-sm">{{ $t('tools.phonetic-transcriber.page.history.empty') }}</div>
      </div>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h3 class="font-medium mb-3">{{ $t('tools.phonetic-transcriber.page.info.title') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.phonetic-transcriber.page.info.ipaTitle') }}</h4>
          <p class="mb-2">{{ $t('tools.phonetic-transcriber.page.info.ipaDesc1') }}</p>
          <p>{{ $t('tools.phonetic-transcriber.page.info.ipaDesc2') }}</p>
        </div>
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.phonetic-transcriber.page.info.guideTitle') }}</h4>
          <ul class="space-y-1">
            <li>• {{ $t('tools.phonetic-transcriber.page.info.guide.supportEnZh') }}</li>
            <li>• {{ $t('tools.phonetic-transcriber.page.info.guide.pronGuide') }}</li>
            <li>• {{ $t('tools.phonetic-transcriber.page.info.guide.batch') }}</li>
            <li>• {{ $t('tools.phonetic-transcriber.page.info.guide.syllableStats') }}</li>
            <li>• {{ $t('tools.phonetic-transcriber.page.info.guide.history') }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

interface TranscriptionResult {
  phonetic: string;
  breakdown: Array<{
    word: string;
    phonetic: string;
  }>;
  stats: {
    totalChars: number;
    wordCount: number;
    syllableCount: number;
  };
}

interface HistoryItem {
  original: string;
  phonetic: string;
  language: string;
  type: string;
  timestamp: string;
}

interface BatchResult {
  original: string;
  phonetic: string;
}

const { t } = useI18n();
const inputText = ref('');
const batchInput = ref('');
const inputLanguage = ref('en');
const phoneticType = ref('ipa');
const result = ref<TranscriptionResult | null>(null);
const history = ref<HistoryItem[]>([]);
const batchResults = ref<BatchResult[]>([]);

// 简化的英语单词音标映射（常用词汇）
const englishPhonetics: Record<string, string> = {
  hello: '/həˈloʊ/',
  world: '/wɜːrld/',
  apple: '/ˈæpəl/',
  banana: '/bəˈnænə/',
  computer: '/kəmˈpjuːtər/',
  phone: '/foʊn/',
  water: '/ˈwɔːtər/',
  house: '/haʊs/',
  car: '/kɑːr/',
  book: '/bʊk/',
  cat: '/kæt/',
  dog: '/dɔːɡ/',
  good: '/ɡʊd/',
  bad: '/bæd/',
  big: '/bɪɡ/',
  small: '/smɔːl/',
  red: '/red/',
  blue: '/bluː/',
  green: '/ɡriːn/',
  love: '/lʌv/',
  like: '/laɪk/',
  want: '/wɑːnt/',
  need: '/niːd/',
  have: '/hæv/',
  make: '/meɪk/',
  take: '/teɪk/',
  give: '/ɡɪv/',
  get: '/ɡet/',
  go: '/ɡoʊ/',
  come: '/kʌm/',
  see: '/siː/',
  look: '/lʊk/',
  know: '/noʊ/',
  think: '/θɪŋk/',
  say: '/seɪ/',
  tell: '/tel/',
  work: '/wɜːrk/',
  play: '/pleɪ/',
  eat: '/iːt/',
  drink: '/drɪŋk/',
  sleep: '/sliːp/',
  walk: '/wɔːk/',
  run: '/rʌn/',
  stop: '/stɑːp/',
  start: '/stɑːrt/',
  open: '/ˈoʊpən/',
  close: '/kloʊz/',
  read: '/riːd/',
  write: '/raɪt/',
  listen: '/ˈlɪsən/',
  speak: '/spiːk/',
  understand: '/ˌʌndərˈstænd/',
  learn: '/lɜːrn/',
  teach: '/tiːtʃ/',
  study: '/ˈstʌdi/',
  help: '/help/',
  find: '/faɪnd/',
  use: '/juːz/',
  buy: '/baɪ/',
  sell: '/sel/',
  pay: '/peɪ/',
  money: '/ˈmʌni/',
  time: '/taɪm/',
  day: '/deɪ/',
  night: '/naɪt/',
  morning: '/ˈmɔːrnɪŋ/',
  afternoon: '/ˌæftərˈnuːn/',
  evening: '/ˈiːvnɪŋ/',
  today: '/təˈdeɪ/',
  tomorrow: '/təˈmɑːroʊ/',
  yesterday: '/ˈjestərdeɪ/',
  happy: '/ˈhæpi/',
  sad: '/sæd/',
  angry: '/ˈæŋɡri/',
  tired: '/ˈtaɪərd/',
  hungry: '/ˈhʌŋɡri/',
  beautiful: '/ˈbjuːtɪfəl/',
  nice: '/naɪs/',
  great: '/ɡreɪt/',
  wonderful: '/ˈwʌndərfəl/',
  easy: '/ˈiːzi/',
  difficult: '/ˈdɪfɪkəlt/',
  hard: '/hɑːrd/',
  soft: '/sɔːft/',
  fast: '/fæst/',
  slow: '/sloʊ/',
  new: '/nuː/',
  old: '/oʊld/',
  young: '/jʌŋ/',
  long: '/lɔːŋ/',
  short: '/ʃɔːrt/',
  tall: '/tɔːl/',
  high: '/haɪ/',
  low: '/loʊ/',
  heavy: '/ˈhevi/',
  light: '/laɪt/',
  strong: '/strɔːŋ/',
  weak: '/wiːk/',
  clean: '/kliːn/',
  dirty: '/ˈdɜːrti/',
  full: '/fʊl/',
  empty: '/ˈempti/',
  right: '/raɪt/',
  wrong: '/rɔːŋ/',
  left: '/left/',
  up: '/ʌp/',
  down: '/daʊn/',
  in: '/ɪn/',
  out: '/aʊt/',
  on: '/ɑːn/',
  off: '/ɔːf/',
  here: '/hɪr/',
  there: '/ðer/',
  where: '/wer/',
  when: '/wen/',
  why: '/waɪ/',
  how: '/haʊ/',
  what: '/wʌt/',
  who: '/huː/',
  which: '/wɪtʃ/',
  this: '/ðɪs/',
  that: '/ðæt/',
  these: '/ðiːz/',
  those: '/ðoʊz/',
  all: '/ɔːl/',
  some: '/sʌm/',
  many: '/ˈmeni/',
  much: '/mʌtʃ/',
  few: '/fjuː/',
  little: '/ˈlɪtəl/',
  more: '/mɔːr/',
  less: '/les/',
  most: '/moʊst/',
  first: '/fɜːrst/',
  last: '/læst/',
  next: '/nekst/',
  before: '/bɪˈfɔːr/',
  after: '/ˈæftər/',
  now: '/naʊ/',
  then: '/ðen/',
  always: '/ˈɔːlweɪz/',
  never: '/ˈnevər/',
  sometimes: '/ˈsʌmtaɪmz/',
  often: '/ˈɔːfən/',
  usually: '/ˈjuːʒuəli/',
  maybe: '/ˈmeɪbi/',
  yes: '/jes/',
  no: '/noʊ/',
  ok: '/oʊˈkeɪ/',
  please: '/pliːz/',
  thank: '/θæŋk/',
  thanks: '/θæŋks/',
  sorry: '/ˈsɑːri/',
  welcome: '/ˈwelkəm/',
  goodbye: '/ɡʊdˈbaɪ/',
  bye: '/baɪ/',
  hi: '/haɪ/',
  hey: '/heɪ/',
  man: '/mæn/',
  woman: '/ˈwʊmən/',
  boy: '/bɔɪ/',
  girl: '/ɡɜːrl/',
  child: '/tʃaɪld/',
  children: '/ˈtʃɪldrən/',
  family: '/ˈfæməli/',
  father: '/ˈfɑːðər/',
  mother: '/ˈmʌðər/',
  son: '/sʌn/',
  daughter: '/ˈdɔːtər/',
  brother: '/ˈbrʌðər/',
  sister: '/ˈsɪstər/',
  friend: '/frend/',
  people: '/ˈpiːpəl/',
  person: '/ˈpɜːrsən/',
  name: '/neɪm/',
  age: '/eɪdʒ/',
  school: '/skuːl/',
  student: '/ˈstuːdənt/',
  teacher: '/ˈtiːtʃər/',
  doctor: '/ˈdɑːktər/',
  home: '/hoʊm/',
  room: '/ruːm/',
  kitchen: '/ˈkɪtʃən/',
  bathroom: '/ˈbæθruːm/',
  bedroom: '/ˈbedruːm/',
  door: '/dɔːr/',
  window: '/ˈwɪndoʊ/',
  table: '/ˈteɪbəl/',
  chair: '/tʃer/',
  bed: '/bed/',
  food: '/fuːd/',
  breakfast: '/ˈbrekfəst/',
  lunch: '/lʌntʃ/',
  dinner: '/ˈdɪnər/',
  bread: '/bred/',
  rice: '/raɪs/',
  meat: '/miːt/',
  fish: '/fɪʃ/',
  chicken: '/ˈtʃɪkən/',
  vegetable: '/ˈvedʒtəbəl/',
  fruit: '/fruːt/',
  egg: '/eɡ/',
  milk: '/mɪlk/',
  tea: '/tiː/',
  coffee: '/ˈkɔːfi/',
  juice: '/dʒuːs/',
  cake: '/keɪk/',
  chocolate: '/ˈtʃɔːklət/',
  pizza: '/ˈpiːtsə/'
};

// 简化的中文拼音映射
const chinesePinyin: Record<string, string> = {
  你: 'nǐ',
  好: 'hǎo',
  我: 'wǒ',
  是: 'shì',
  的: 'de',
  在: 'zài',
  有: 'yǒu',
  不: 'bù',
  了: 'le',
  人: 'rén',
  他: 'tā',
  她: 'tā',
  它: 'tā',
  们: 'men',
  这: 'zhè',
  那: 'nà',
  什: 'shén',
  么: 'me',
  时: 'shí',
  候: 'hòu',
  地: 'dì',
  方: 'fāng',
  年: 'nián',
  月: 'yuè',
  日: 'rì',
  天: 'tiān',
  上: 'shàng',
  下: 'xià',
  来: 'lái',
  去: 'qù',
  出: 'chū',
  可: 'kě',
  以: 'yǐ',
  说: 'shuō',
  话: 'huà',
  看: 'kàn',
  听: 'tīng',
  做: 'zuò',
  吃: 'chī',
  喝: 'hē',
  睡: 'shuì',
  觉: 'jiào',
  走: 'zǒu',
  跑: 'pǎo',
  学: 'xué',
  习: 'xí',
  工: 'gōng',
  作: 'zuò',
  家: 'jiā',
  校: 'xiào',
  老: 'lǎo',
  师: 'shī',
  生: 'shēng',
  朋: 'péng',
  友: 'yǒu',
  爸: 'bà',
  妈: 'mā',
  儿: 'ér',
  子: 'zi',
  女: 'nǚ',
  哥: 'gē',
  姐: 'jiě',
  弟: 'dì',
  妹: 'mèi',
  大: 'dà',
  小: 'xiǎo',
  多: 'duō',
  少: 'shǎo',
  高: 'gāo',
  矮: 'ǎi',
  长: 'cháng',
  短: 'duǎn',
  胖: 'pàng',
  瘦: 'shòu',
  美: 'měi',
  丑: 'chǒu',
  新: 'xīn',
  旧: 'jiù',
  快: 'kuài',
  慢: 'màn',
  早: 'zǎo',
  晚: 'wǎn',
  热: 'rè',
  冷: 'lěng',
  红: 'hóng',
  黄: 'huáng',
  蓝: 'lán',
  绿: 'lǜ',
  白: 'bái',
  黑: 'hēi',
  一: 'yī',
  二: 'èr',
  三: 'sān',
  四: 'sì',
  五: 'wǔ',
  六: 'liù',
  七: 'qī',
  八: 'bā',
  九: 'jiǔ',
  十: 'shí',
  百: 'bǎi',
  千: 'qiān',
  万: 'wàn'
};

// 转换文本为音标
const transcribe = () => {
  if (!inputText.value.trim()) {
    result.value = null;
    return;
  }

  const text = inputText.value.trim();
  let phonetic = '';
  const breakdown: Array<{ word: string; phonetic: string }> = [];

  if (inputLanguage.value === 'en') {
    // 英语处理
    const words = text.toLowerCase().split(/\s+/);
    const phoneticParts: string[] = [];

    words.forEach((word) => {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (englishPhonetics[cleanWord]) {
        phoneticParts.push(englishPhonetics[cleanWord]);
        breakdown.push({
          word: word,
          phonetic: englishPhonetics[cleanWord]
        });
      } else {
        // 简单的音标生成规则
        const simplePhonetic = generateSimplePhonetic(cleanWord);
        phoneticParts.push(simplePhonetic);
        breakdown.push({
          word: word,
          phonetic: simplePhonetic
        });
      }
    });

    phonetic = phoneticParts.join(' ');
  } else {
    // 中文处理
    const chars = text.split('');
    const phoneticParts: string[] = [];

    chars.forEach((char) => {
      if (chinesePinyin[char]) {
        phoneticParts.push(chinesePinyin[char]);
        breakdown.push({
          word: char,
          phonetic: chinesePinyin[char]
        });
      } else if (/[\u4e00-\u9fff]/.test(char)) {
        // 中文字符但不在字典中
        phoneticParts.push('[?]');
        breakdown.push({
          word: char,
          phonetic: '[?]'
        });
      } else {
        // 非中文字符
        phoneticParts.push(char);
      }
    });

    phonetic = phoneticParts.join(' ');
  }

  // 计算统计信息
  const stats = {
    totalChars: text.length,
    wordCount: inputLanguage.value === 'en' ? text.split(/\s+/).length : text.replace(/\s/g, '').length,
    syllableCount: breakdown.length
  };

  result.value = {
    phonetic,
    breakdown,
    stats
  };

  // 添加到历史记录
  addToHistory(text, phonetic);
};

// 生成简单的英语音标（基于常见规则）
const generateSimplePhonetic = (word: string): string => {
  if (!word) return '';

  // 这是一个非常简化的音标生成器
  // 实际应用中需要更复杂的规则或使用专业的音标库
  let phonetic = '/';

  for (let i = 0; i < word.length; i++) {
    const char = word[i].toLowerCase();
    switch (char) {
      case 'a':
        phonetic += 'æ';
        break;
      case 'e':
        phonetic += 'e';
        break;
      case 'i':
        phonetic += 'ɪ';
        break;
      case 'o':
        phonetic += 'ɑː';
        break;
      case 'u':
        phonetic += 'ʌ';
        break;
      case 'th':
        phonetic += 'θ';
        i++; // 跳过下一个字符
        break;
      case 'sh':
        phonetic += 'ʃ';
        i++; // 跳过下一个字符
        break;
      case 'ch':
        phonetic += 'tʃ';
        i++; // 跳过下一个字符
        break;
      default:
        phonetic += char;
    }
  }

  phonetic += '/';
  return phonetic;
};

// 批量转换
const batchTranscribe = () => {
  if (!batchInput.value.trim()) return;

  const lines = batchInput.value.trim().split('\n');
  batchResults.value = [];

  lines.forEach((line) => {
    if (line.trim()) {
      const originalInput = inputText.value;
      inputText.value = line.trim();
      transcribe();

      if (result.value) {
        batchResults.value.push({
          original: line.trim(),
          phonetic: result.value.phonetic
        });
      }

      inputText.value = originalInput;
    }
  });

  // 恢复原始结果
  transcribe();
};

// 导出批量结果
const exportBatch = () => {
  if (batchResults.value.length === 0) return;

  const content = batchResults.value.map((item) => `${item.original}\t${item.phonetic}`).join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `phonetic-transcription-${Date.now()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

// 复制结果
const copyResult = async () => {
  if (!result.value) return;

  try {
    await navigator.clipboard.writeText(result.value.phonetic);
    // 这里可以添加成功提示
  } catch (err) {
    console.error(t('tools.phonetic-transcriber.page.copyFailedLog'), err);
  }
};

// 清空所有内容
const clearAll = () => {
  inputText.value = '';
  result.value = null;
};

// 加载示例
const loadSample = () => {
  if (inputLanguage.value === 'en') {
    inputText.value = 'Hello world! How are you today?';
  } else {
    inputText.value = t('tools.phonetic-transcriber.page.samples.zh');
  }
  transcribe();
};

// 清空批量结果
const clearBatchResults = () => {
  batchResults.value = [];
  batchInput.value = '';
};

// 添加到历史记录
const addToHistory = (original: string, phonetic: string) => {
  const item: HistoryItem = {
    original,
    phonetic,
    language: inputLanguage.value,
    type: phoneticType.value,
    timestamp: new Date().toLocaleString()
  };

  history.value.unshift(item);
  if (history.value.length > 50) {
    history.value = history.value.slice(0, 50);
  }

  // 保存到本地存储
  localStorage.setItem('phonetic-history', JSON.stringify(history.value));
};

// 从历史记录加载
const loadFromHistory = (item: HistoryItem) => {
  inputText.value = item.original;
  inputLanguage.value = item.language;
  phoneticType.value = item.type;
  transcribe();
};

// 清空历史记录
const clearHistory = () => {
  history.value = [];
  localStorage.removeItem('phonetic-history');
};

// 组件挂载时加载历史记录
onMounted(() => {
  const savedHistory = localStorage.getItem('phonetic-history');
  if (savedHistory) {
    try {
      history.value = JSON.parse(savedHistory);
    } catch (err) {
      console.error(t('tools.phonetic-transcriber.page.loadHistoryFailedLog'), err);
    }
  }
});
</script>
