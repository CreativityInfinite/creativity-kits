<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-lg font-semibold">{{ $t('tools.flashcard-generator.page.title') }}</h2>
      <div class="flex gap-2">
        <button @click="importCards" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">{{ $t('tools.flashcard-generator.page.importCards') }}</button>
        <button @click="exportCards" :disabled="cards.length === 0" class="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md text-sm">
          {{ $t('tools.flashcard-generator.page.exportCards') }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium">{{ $t('tools.flashcard-generator.page.createNew') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.flashcard-generator.page.frontLabel') }}</label>
            <textarea
              v-model="newCard.front"
              rows="3"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.flashcard-generator.page.frontPlaceholder')"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.flashcard-generator.page.backLabel') }}</label>
            <textarea
              v-model="newCard.back"
              rows="3"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.flashcard-generator.page.backPlaceholder')"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.flashcard-generator.page.category') }}</label>
              <select v-model="newCard.category" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="">{{ $t('tools.flashcard-generator.page.selectCategory') }}</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
              <input
                v-if="newCard.category === 'custom'"
                v-model="customCategory"
                type="text"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white mt-2"
                :placeholder="$t('tools.flashcard-generator.page.customCategoryPlaceholder')"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.flashcard-generator.page.difficulty') }}</label>
              <select v-model="newCard.difficulty" class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="easy">{{ $t('tools.flashcard-generator.page.diff.easy') }}</option>
                <option value="medium">{{ $t('tools.flashcard-generator.page.diff.medium') }}</option>
                <option value="hard">{{ $t('tools.flashcard-generator.page.diff.hard') }}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.flashcard-generator.page.tagsLabel') }}</label>
            <input
              v-model="newCard.tags"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.flashcard-generator.page.tagsPlaceholder')"
            />
          </div>

          <div class="flex gap-2">
            <button @click="addCard" :disabled="!canAddCard" class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.flashcard-generator.page.addCard') }}
            </button>
            <button @click="clearForm" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">{{ $t('tools.flashcard-generator.page.clear') }}</button>
          </div>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <h4 class="font-medium mb-2">{{ $t('tools.flashcard-generator.page.bulkCreate') }}</h4>
          <textarea
            v-model="bulkInput"
            rows="6"
            class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
            :placeholder="$t('tools.flashcard-generator.page.bulkPlaceholder')"
          />
          <button @click="processBulkInput" :disabled="!bulkInput.trim()" class="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md text-sm">
            {{ $t('tools.flashcard-generator.page.bulkAdd') }}
          </button>
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="font-medium">{{ $t('tools.flashcard-generator.page.libraryTitle') }} ({{ filteredCards.length }})</h3>
          <div class="flex gap-2">
            <select v-model="filterCategory" class="px-3 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
              <option value="">{{ $t('tools.flashcard-generator.page.allCategories') }}</option>
              <option v-for="cat in usedCategories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
            <select v-model="filterDifficulty" class="px-3 py-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm">
              <option value="">{{ $t('tools.flashcard-generator.page.allDifficulties') }}</option>
              <option value="easy">{{ $t('tools.flashcard-generator.page.diff.easy') }}</option>
              <option value="medium">{{ $t('tools.flashcard-generator.page.diff.medium') }}</option>
              <option value="hard">{{ $t('tools.flashcard-generator.page.diff.hard') }}</option>
            </select>
          </div>
        </div>

        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div v-for="(card, index) in filteredCards" :key="card.id" class="bg-white dark:bg-gray-800 rounded-lg border p-3">
            <div class="flex justify-between items-start mb-2">
              <div class="flex gap-2 items-center">
                <span :class="getDifficultyClass(card.difficulty)" class="px-2 py-1 rounded text-xs font-medium">
                  {{ getDifficultyLabel(card.difficulty) }}
                </span>
                <span v-if="card.category" class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                  {{ card.category }}
                </span>
              </div>
              <div class="flex gap-1">
                <button @click="editCard(index)" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs">{{ $t('tools.flashcard-generator.page.edit') }}</button>
                <button @click="deleteCard(index)" class="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs">{{ $t('tools.flashcard-generator.page.delete') }}</button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div class="font-medium text-gray-600 dark:text-gray-400 mb-1">{{ $t('tools.flashcard-generator.page.frontShort') }}</div>
                <div class="bg-gray-50 dark:bg-gray-700 rounded p-2">{{ card.front }}</div>
              </div>
              <div>
                <div class="font-medium text-gray-600 dark:text-gray-400 mb-1">{{ $t('tools.flashcard-generator.page.backShort') }}</div>
                <div class="bg-gray-50 dark:bg-gray-700 rounded p-2">{{ card.back }}</div>
              </div>
            </div>

            <div v-if="card.tags && card.tags.length > 0" class="mt-2 flex flex-wrap gap-1">
              <span v-for="tag in card.tags" :key="tag" class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-xs">
                {{ tag }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="filteredCards.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
          <div class="text-4xl mb-4">📚</div>
          <div class="text-lg mb-2">{{ $t('tools.flashcard-generator.page.emptyTitle') }}</div>
          <div class="text-sm">{{ $t('tools.flashcard-generator.page.emptySubtitle') }}</div>
        </div>
      </div>
    </div>

    <div v-if="cards.length > 0" class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="font-medium">{{ $t('tools.flashcard-generator.page.studyMode') }}</h3>
        <div class="flex gap-2">
          <button @click="startStudy('sequential')" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">{{ $t('tools.flashcard-generator.page.studySequential') }}</button>
          <button @click="startStudy('random')" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md">{{ $t('tools.flashcard-generator.page.studyRandom') }}</button>
          <button @click="startStudy('spaced')" class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md">{{ $t('tools.flashcard-generator.page.studySpaced') }}</button>
        </div>
      </div>

      <div v-if="studyMode" class="bg-white dark:bg-gray-800 rounded-lg border p-6">
        <div class="flex justify-between items-center mb-4">
          <div class="text-sm text-gray-600 dark:text-gray-400">{{ currentCardIndex + 1 }} / {{ studyCards.length }}</div>
          <button @click="exitStudy" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('tools.flashcard-generator.page.exitStudy') }}</button>
        </div>

        <div class="text-center">
          <div class="mb-6">
            <div
              :class="['bg-gray-50 dark:bg-gray-700 rounded-lg p-6 min-h-32 flex items-center justify-center cursor-pointer transition-all', showAnswer ? 'bg-blue-50 dark:bg-blue-900/20' : '']"
              @click="toggleAnswer"
            >
              <div class="text-lg">
                {{ showAnswer ? currentStudyCard?.back : currentStudyCard?.front }}
              </div>
            </div>
            <div class="mt-2 text-sm text-gray-500">
              {{ showAnswer ? $t('tools.flashcard-generator.page.toggleHintFront') : $t('tools.flashcard-generator.page.toggleHintBack') }}
            </div>
          </div>

          <div v-if="showAnswer" class="flex justify-center gap-3">
            <button @click="markCard('hard')" class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">{{ $t('tools.flashcard-generator.page.markHard') }}</button>
            <button @click="markCard('medium')" class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md">{{ $t('tools.flashcard-generator.page.markMedium') }}</button>
            <button @click="markCard('easy')" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">{{ $t('tools.flashcard-generator.page.markEasy') }}</button>
          </div>

          <div class="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all" :style="{ width: `${(currentCardIndex / studyCards.length) * 100}%` }" />
          </div>
        </div>
      </div>

      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <h4 class="font-medium mb-2">{{ $t('tools.flashcard-generator.page.statsTitle') }}</h4>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ cards.length }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.flashcard-generator.page.totalCards') }}</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-green-600 dark:text-green-400">{{ usedCategories.length }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.flashcard-generator.page.categoryCount') }}</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ studyStats.totalStudied }}</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.flashcard-generator.page.studied') }}</div>
          </div>
          <div>
            <div class="text-2xl font-bold text-orange-600 dark:text-orange-400">{{ Math.round(studyStats.accuracy) }}%</div>
            <div class="text-sm text-gray-600 dark:text-gray-400">{{ $t('tools.flashcard-generator.page.accuracy') }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <h3 class="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">{{ $t('tools.flashcard-generator.page.guideTitle') }}</h3>
      <ul class="text-sm text-blue-800 dark:text-blue-200 space-y-1">
        <li>{{ $t('tools.flashcard-generator.page.guideLine1') }}</li>
        <li>{{ $t('tools.flashcard-generator.page.guideLine2') }}</li>
        <li>{{ $t('tools.flashcard-generator.page.guideLine3') }}</li>
        <li>{{ $t('tools.flashcard-generator.page.guideLine4') }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

interface FlashCard {
  id: string;
  front: string;
  back: string;
  category?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
  createdAt: number;
  lastStudied?: number;
  studyCount: number;
  correctCount: number;
}

interface StudyStats {
  totalStudied: number;
  accuracy: number;
}

const { t } = useI18n();
const cards = ref<FlashCard[]>([]);
const newCard = ref({
  front: '',
  back: '',
  category: '',
  difficulty: 'medium' as const,
  tags: ''
});
const customCategory = ref('');
const bulkInput = ref('');
const filterCategory = ref('');
const filterDifficulty = ref('');
const studyMode = ref<'sequential' | 'random' | 'spaced' | null>(null);
const studyCards = ref<FlashCard[]>([]);
const currentCardIndex = ref(0);
const showAnswer = ref(false);

const categories = computed(() => [
  t('tools.flashcard-generator.page.cat.english'),
  t('tools.flashcard-generator.page.cat.math'),
  t('tools.flashcard-generator.page.cat.history'),
  t('tools.flashcard-generator.page.cat.geography'),
  t('tools.flashcard-generator.page.cat.science'),
  t('tools.flashcard-generator.page.cat.programming'),
  t('tools.flashcard-generator.page.cat.medicine'),
  t('tools.flashcard-generator.page.cat.law'),
  t('tools.flashcard-generator.page.cat.art'),
  t('tools.flashcard-generator.page.cat.music'),
  'custom'
]);

const canAddCard = computed(() => {
  return newCard.value.front.trim() && newCard.value.back.trim();
});

const finalCategory = computed(() => {
  return newCard.value.category === 'custom' ? customCategory.value : newCard.value.category;
});

const usedCategories = computed(() => {
  const cats = new Set(cards.value.map((c) => c.category).filter(Boolean));
  return Array.from(cats).sort();
});

const filteredCards = computed(() => {
  let filtered = cards.value;

  if (filterCategory.value) {
    filtered = filtered.filter((c) => c.category === filterCategory.value);
  }

  if (filterDifficulty.value) {
    filtered = filtered.filter((c) => c.difficulty === filterDifficulty.value);
  }

  return filtered;
});

const currentStudyCard = computed(() => {
  return studyCards.value[currentCardIndex.value];
});

const studyStats = computed((): StudyStats => {
  const totalStudied = cards.value.reduce((sum, card) => sum + card.studyCount, 0);
  const totalCorrect = cards.value.reduce((sum, card) => sum + card.correctCount, 0);
  const accuracy = totalStudied > 0 ? (totalCorrect / totalStudied) * 100 : 0;

  return {
    totalStudied,
    accuracy
  };
});

function addCard() {
  if (!canAddCard.value) return;

  const card: FlashCard = {
    id: Date.now().toString(),
    front: newCard.value.front.trim(),
    back: newCard.value.back.trim(),
    category: finalCategory.value || undefined,
    difficulty: newCard.value.difficulty,
    tags: newCard.value.tags
      ? newCard.value.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined,
    createdAt: Date.now(),
    studyCount: 0,
    correctCount: 0
  };

  cards.value.push(card);
  clearForm();
  saveCards();
}

function clearForm() {
  newCard.value = {
    front: '',
    back: '',
    category: '',
    difficulty: 'medium',
    tags: ''
  };
  customCategory.value = '';
}

function processBulkInput() {
  const lines = bulkInput.value.trim().split('\n');
  let addedCount = 0;

  for (const line of lines) {
    const parts = line.split('|').map((p) => p.trim());
    if (parts.length >= 2) {
      const card: FlashCard = {
        id: Date.now().toString() + Math.random(),
        front: parts[0],
        back: parts[1],
        category: parts[2] || undefined,
        difficulty: (parts[3] as any) || 'medium',
        createdAt: Date.now(),
        studyCount: 0,
        correctCount: 0
      };
      cards.value.push(card);
      addedCount++;
    }
  }

  if (addedCount > 0) {
    bulkInput.value = '';
    saveCards();
    alert(t('tools.flashcard-generator.page.alerts.addedCount', { n: addedCount }));
  }
}

function editCard(index: number) {
  const card = filteredCards.value[index];
  const originalIndex = cards.value.findIndex((c) => c.id === card.id);

  const front = prompt(t('tools.flashcard-generator.page.alerts.editFront'), card.front);
  if (front !== null) {
    const back = prompt(t('tools.flashcard-generator.page.alerts.editBack'), card.back);
    if (back !== null) {
      cards.value[originalIndex].front = front.trim();
      cards.value[originalIndex].back = back.trim();
      saveCards();
    }
  }
}

function deleteCard(index: number) {
  const card = filteredCards.value[index];
  const originalIndex = cards.value.findIndex((c) => c.id === card.id);

  if (confirm(t('tools.flashcard-generator.page.alerts.confirmDelete'))) {
    cards.value.splice(originalIndex, 1);
    saveCards();
  }
}

function getDifficultyClass(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
    case 'hard':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
}

function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case 'easy':
      return t('tools.flashcard-generator.page.diff.easy');
    case 'medium':
      return t('tools.flashcard-generator.page.diff.medium');
    case 'hard':
      return t('tools.flashcard-generator.page.diff.hard');
    default:
      return t('tools.flashcard-generator.page.diff.unknown');
  }
}

function startStudy(mode: 'sequential' | 'random' | 'spaced') {
  if (filteredCards.value.length === 0) {
    alert(t('tools.flashcard-generator.page.alerts.noCardsToStudy'));
    return;
  }

  studyMode.value = mode;
  studyCards.value = [...filteredCards.value];

  if (mode === 'random') {
    // 随机打乱
    for (let i = studyCards.value.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [studyCards.value[i], studyCards.value[j]] = [studyCards.value[j], studyCards.value[i]];
    }
  } else if (mode === 'spaced') {
    // 间隔重复：优先显示学习次数少或错误率高的卡片
    studyCards.value.sort((a, b) => {
      const aScore = a.studyCount === 0 ? 0 : a.correctCount / a.studyCount;
      const bScore = b.studyCount === 0 ? 0 : b.correctCount / b.studyCount;
      return aScore - bScore;
    });
  }

  currentCardIndex.value = 0;
  showAnswer.value = false;
}

function exitStudy() {
  studyMode.value = null;
  studyCards.value = [];
  currentCardIndex.value = 0;
  showAnswer.value = false;
}

function toggleAnswer() {
  showAnswer.value = !showAnswer.value;
}

function markCard(performance: 'easy' | 'medium' | 'hard') {
  const card = currentStudyCard.value;
  if (!card) return;

  // 更新统计
  const originalCard = cards.value.find((c) => c.id === card.id);
  if (originalCard) {
    originalCard.studyCount++;
    originalCard.lastStudied = Date.now();

    if (performance === 'easy' || performance === 'medium') {
      originalCard.correctCount++;
    }
  }

  // 下一张卡片
  if (currentCardIndex.value < studyCards.value.length - 1) {
    currentCardIndex.value++;
    showAnswer.value = false;
  } else {
    // 学习完成
    alert(t('tools.flashcard-generator.page.alerts.studyFinished'));
    exitStudy();
  }

  saveCards();
}

function importCards() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          if (Array.isArray(imported)) {
            cards.value.push(...imported);
            saveCards();
            alert(t('tools.flashcard-generator.page.alerts.importSuccess', { n: imported.length }));
          }
        } catch (error) {
          alert(t('tools.flashcard-generator.page.alerts.importFailed'));
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

function exportCards() {
  const data = JSON.stringify(cards.value, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `flashcards-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function saveCards() {
  localStorage.setItem('flashcards', JSON.stringify(cards.value));
}

function loadCards() {
  const saved = localStorage.getItem('flashcards');
  if (saved) {
    try {
      cards.value = JSON.parse(saved);
    } catch (error) {
      console.error(t('tools.flashcard-generator.page.alerts.loadFailedLog'), error);
    }
  }
}

onMounted(() => {
  loadCards();
});
</script>
