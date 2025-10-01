<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.secure-note.page.titleMain') }}</h3>

        <div v-if="!isUnlocked" class="bg-white dark:bg-gray-800 border rounded-lg p-6">
          <div class="text-center mb-6">
            <div class="text-4xl mb-4">🔒</div>
            <h4 class="text-lg font-medium mb-2">
              {{ hasNotes ? $t('tools.secure-note.page.unlockTitle') : $t('tools.secure-note.page.setupMasterTitle') }}
            </h4>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ hasNotes ? $t('tools.secure-note.page.unlockSubtitle') : $t('tools.secure-note.page.setupMasterSubtitle') }}
            </p>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-2">
                {{ hasNotes ? $t('tools.secure-note.page.passwordLabel') : $t('tools.secure-note.page.setPasswordLabel') }}
              </label>
              <input
                v-model="password"
                type="password"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                :placeholder="hasNotes ? $t('tools.secure-note.page.passwordPlaceholder') : $t('tools.secure-note.page.setPasswordPlaceholder')"
                @keyup.enter="unlock"
              />
            </div>

            <div v-if="!hasNotes">
              <label class="block text-sm font-medium mb-2">{{ $t('tools.secure-note.page.confirmPasswordLabel') }}</label>
              <input
                v-model="confirmPassword"
                type="password"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                :placeholder="$t('tools.secure-note.page.confirmPasswordPlaceholder')"
                @keyup.enter="unlock"
              />
            </div>

            <button @click="unlock" :disabled="!canUnlock" class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
              {{ hasNotes ? $t('tools.secure-note.page.unlockButton') : $t('tools.secure-note.page.createButton') }}
            </button>

            <div v-if="errorMessage" class="text-sm text-red-600 dark:text-red-400 text-center">
              {{ errorMessage }}
            </div>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="flex justify-between items-center">
            <h4 class="font-medium">{{ $t('tools.secure-note.page.listTitle') }}</h4>
            <div class="flex gap-2">
              <button @click="createNote" class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">{{ $t('tools.secure-note.page.newButton') }}</button>
              <button @click="lock" class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">{{ $t('tools.secure-note.page.lockButton') }}</button>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 border rounded-lg">
            <div v-if="notes.length === 0" class="p-8 text-center text-gray-500">
              <div class="text-4xl mb-4">📝</div>
              <div class="text-lg mb-2">{{ $t('tools.secure-note.page.emptyListTitle') }}</div>
              <div class="text-sm">{{ $t('tools.secure-note.page.emptyListDesc') }}</div>
            </div>

            <div v-else class="divide-y dark:divide-gray-700">
              <div
                v-for="(note, index) in notes"
                :key="note.id"
                class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                :class="{ 'bg-blue-50 dark:bg-blue-900/20': selectedNote?.id === note.id }"
                @click="selectNote(note)"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1 min-w-0">
                    <h5 class="font-medium truncate">{{ note.title || $t('tools.secure-note.page.untitled') }}</h5>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{{ note.content.substring(0, 100) }}{{ note.content.length > 100 ? '...' : '' }}</p>
                    <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{{ formatDate(note.updatedAt) }}</span>
                      <span>{{ note.content.length }} {{ $t('tools.secure-note.page.charUnit') }}</span>
                      <span v-if="note.tags.length > 0" class="flex gap-1">
                        <span v-for="tag in note.tags.slice(0, 2)" :key="tag" class="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">
                          {{ tag }}
                        </span>
                      </span>
                    </div>
                  </div>
                  <div class="flex gap-1 ml-2">
                    <button @click.stop="duplicateNote(note)" class="p-1 text-gray-400 hover:text-blue-600" :title="$t('tools.secure-note.page.copyTitle')">📋</button>
                    <button @click.stop="deleteNote(index)" class="p-1 text-gray-400 hover:text-red-600" :title="$t('tools.secure-note.page.deleteTitle')">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.secure-note.page.editorTitle') }}</h3>

        <div v-if="isUnlocked && selectedNote" class="bg-white dark:bg-gray-800 border rounded-lg p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">{{ $t('tools.secure-note.page.titleLabel') }}</label>
            <input
              v-model="selectedNote.title"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.secure-note.page.titlePlaceholder')"
              @input="saveNote"
            />
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">{{ $t('tools.secure-note.page.tagsLabel') }}</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <span
                v-for="(tag, index) in selectedNote.tags"
                :key="index"
                class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-sm"
              >
                {{ tag }}
                <button @click="removeTag(index)" class="text-blue-600 hover:text-blue-800">×</button>
              </span>
            </div>
            <div class="flex gap-2">
              <input
                v-model="newTag"
                type="text"
                class="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                :placeholder="$t('tools.secure-note.page.addTagPlaceholder')"
                @keyup.enter="addTag"
              />
              <button @click="addTag" :disabled="!newTag.trim()" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm">
                {{ $t('tools.secure-note.page.addTagButton') }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium mb-2">{{ $t('tools.secure-note.page.contentLabel') }}</label>
            <textarea
              v-model="selectedNote.content"
              rows="12"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              :placeholder="$t('tools.secure-note.page.contentPlaceholder')"
              @input="saveNote"
            />
          </div>

          <div class="flex justify-between items-center text-sm text-gray-500">
            <div>{{ $t('tools.secure-note.page.countPrefix') }} {{ selectedNote.content.length }} | {{ $t('tools.secure-note.page.lastSavedPrefix') }} {{ formatDate(selectedNote.updatedAt) }}</div>
            <div class="flex gap-2">
              <button @click="exportNote" class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm">{{ $t('tools.secure-note.page.export') }}</button>
              <button @click="printNote" class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm">{{ $t('tools.secure-note.page.print') }}</button>
            </div>
          </div>
        </div>

        <div v-else-if="isUnlocked" class="text-center py-12 text-gray-500">
          <div class="text-4xl mb-4">📝</div>
          <div class="text-lg mb-2">{{ $t('tools.secure-note.page.pickOrCreateTitle') }}</div>
          <div class="text-sm">{{ $t('tools.secure-note.page.pickOrCreateDesc') }}</div>
        </div>

        <div v-else class="text-center py-12 text-gray-500">
          <div class="text-4xl mb-4">🔒</div>
          <div class="text-lg mb-2">{{ $t('tools.secure-note.page.lockedTitle') }}</div>
          <div class="text-sm">{{ $t('tools.secure-note.page.lockedDesc') }}</div>
        </div>
      </div>
    </div>

    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
      <h3 class="font-medium mb-3 text-yellow-900 dark:text-yellow-100">🔐 {{ $t('tools.secure-note.page.securityTipsTitle') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800 dark:text-yellow-200">
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.secure-note.page.dataSecurityTitle') }}</h4>
          <ul class="space-y-1">
            <li>• {{ $t('tools.secure-note.page.tipAes') }}</li>
            <li>• {{ $t('tools.secure-note.page.tipNoSave') }}</li>
            <li>• {{ $t('tools.secure-note.page.tipLocalOnly') }}</li>
            <li>• {{ $t('tools.secure-note.page.tipNoRecover') }}</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.secure-note.page.suggestTitle') }}</h4>
          <ul class="space-y-1">
            <li>• {{ $t('tools.secure-note.page.suggestStrong') }}</li>
            <li>• {{ $t('tools.secure-note.page.suggestBackup') }}</li>
            <li>• {{ $t('tools.secure-note.page.suggestNoPublic') }}</li>
            <li>• {{ $t('tools.secure-note.page.suggestLockAfter') }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

interface SecureNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

const { t } = useI18n();

const isUnlocked = ref(false);
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const notes = ref<SecureNote[]>([]);
const selectedNote = ref<SecureNote | null>(null);
const newTag = ref('');

const hasNotes = computed(() => {
  return localStorage.getItem('secure-notes-encrypted') !== null;
});

const canUnlock = computed(() => {
  if (hasNotes.value) {
    return password.value.length > 0;
  } else {
    return password.value.length >= 6 && password.value === confirmPassword.value;
  }
});

// 简易加密/解密（演示用）
const encrypt = (text: string, key: string): string => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    const keyChar = key.charCodeAt(i % key.length);
    result += String.fromCharCode(char ^ keyChar);
  }
  return btoa(result);
};

const decrypt = (encryptedText: string, key: string): string => {
  try {
    const text = atob(encryptedText);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      const keyChar = key.charCodeAt(i % key.length);
      result += String.fromCharCode(char ^ keyChar);
    }
    return result;
  } catch {
    throw new Error(t('tools.secure-note.page.decryptFailed'));
  }
};

const unlock = async () => {
  errorMessage.value = '';

  if (!canUnlock.value) {
    errorMessage.value = hasNotes.value ? t('tools.secure-note.page.errNeedPassword') : t('tools.secure-note.page.errPasswordRule');
    return;
  }

  try {
    if (hasNotes.value) {
      const encrypted = localStorage.getItem('secure-notes-encrypted');
      if (encrypted) {
        const decrypted = decrypt(encrypted, password.value);
        notes.value = JSON.parse(decrypted);
        isUnlocked.value = true;
      }
    } else {
      notes.value = [];
      isUnlocked.value = true;
      saveNotes();
    }
  } catch (error) {
    errorMessage.value = t('tools.secure-note.page.errWrongOrCorrupt');
  }
};

const lock = () => {
  isUnlocked.value = false;
  password.value = '';
  confirmPassword.value = '';
  selectedNote.value = null;
  notes.value = [];
};

const saveNotes = () => {
  if (!isUnlocked.value) return;

  try {
    const encrypted = encrypt(JSON.stringify(notes.value), password.value);
    localStorage.setItem('secure-notes-encrypted', encrypted);
  } catch (error) {
    console.error(t('tools.secure-note.page.saveFailed'), error);
  }
};

const createNote = () => {
  const newNote: SecureNote = {
    id: Date.now().toString(),
    title: '',
    content: '',
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  notes.value.unshift(newNote);
  selectedNote.value = newNote;
  saveNotes();
};

const selectNote = (note: SecureNote) => {
  selectedNote.value = note;
};

const saveNote = () => {
  if (!selectedNote.value) return;

  selectedNote.value.updatedAt = Date.now();
  saveNotes();
};

const deleteNote = (index: number) => {
  if (confirm(t('tools.secure-note.page.confirmDelete'))) {
    const deletedNote = notes.value[index];
    notes.value.splice(index, 1);

    if (selectedNote.value?.id === deletedNote.id) {
      selectedNote.value = null;
    }

    saveNotes();
  }
};

const duplicateNote = (note: SecureNote) => {
  const duplicated: SecureNote = {
    ...note,
    id: Date.now().toString(),
    title: `${note.title} ${t('tools.secure-note.page.copySuffix')}`,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  notes.value.unshift(duplicated);
  selectedNote.value = duplicated;
  saveNotes();
};

const addTag = () => {
  if (!selectedNote.value || !newTag.value.trim()) return;

  const tag = newTag.value.trim();
  if (!selectedNote.value.tags.includes(tag)) {
    selectedNote.value.tags.push(tag);
    saveNote();
  }

  newTag.value = '';
};

const removeTag = (index: number) => {
  if (!selectedNote.value) return;

  selectedNote.value.tags.splice(index, 1);
  saveNote();
};

const exportNote = () => {
  if (!selectedNote.value) return;

  const content = `# ${selectedNote.value.title}\n\n${selectedNote.value.content}\n\n---\n${t('tools.secure-note.page.exportTags')}: ${selectedNote.value.tags.join(', ')}\n${t('tools.secure-note.page.exportCreatedAt')}: ${formatDate(
    selectedNote.value.createdAt
  )}\n${t('tools.secure-note.page.exportUpdatedAt')}: ${formatDate(selectedNote.value.updatedAt)}`;

  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${selectedNote.value.title || t('tools.secure-note.page.untitled')}.md`;
  a.click();
  URL.revokeObjectURL(url);
};

const printNote = () => {
  if (!selectedNote.value) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>${selectedNote.value.title || t('tools.secure-note.page.untitled')}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
          .meta { color: #666; font-size: 14px; margin-bottom: 20px; }
          .content { line-height: 1.6; white-space: pre-wrap; }
          .tags { margin-top: 20px; }
          .tag { background: #f0f0f0; padding: 2px 8px; border-radius: 4px; margin-right: 5px; }
        </style>
      </head>
      <body>
        <h1>${selectedNote.value.title || t('tools.secure-note.page.untitled')}</h1>
        <div class="meta">
          ${t('tools.secure-note.page.exportCreatedAt')}: ${formatDate(selectedNote.value.createdAt)} |
          ${t('tools.secure-note.page.exportUpdatedAt')}: ${formatDate(selectedNote.value.updatedAt)}
        </div>
        <div class="content">${selectedNote.value.content}</div>
        ${
          selectedNote.value.tags.length > 0
            ? `
          <div class="tags">
            <strong>${t('tools.secure-note.page.exportTags')}:</strong>
            ${selectedNote.value.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
          </div>
        `
            : ''
        }
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
};

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('zh-CN');
};
</script>
