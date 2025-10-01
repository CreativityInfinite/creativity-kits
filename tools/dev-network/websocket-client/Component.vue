<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.websocket-client.page.title') }}</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">{{ $t('tools.websocket-client.page.wsUrl') }}</label>
            <input
              v-model="wsUrl"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
              :placeholder="$t('tools.websocket-client.page.wsUrlPlaceholder')"
              :disabled="isConnected"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.websocket-client.page.protocolOptional') }}</label>
              <input
                v-model="protocol"
                type="text"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                :placeholder="$t('tools.websocket-client.page.protocolPlaceholder')"
                :disabled="isConnected"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.websocket-client.page.connectionStatus') }}</label>
              <div class="flex items-center gap-2 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600">
                <div
                  class="w-3 h-3 rounded-full"
                  :class="{
                    'bg-green-500': connectionState === 'OPEN',
                    'bg-yellow-500': connectionState === 'CONNECTING',
                    'bg-red-500': connectionState === 'CLOSED',
                    'bg-gray-500': connectionState === 'CLOSING'
                  }"
                />
                <span class="text-sm">{{ connectionStateText }}</span>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button @click="connect" :disabled="isConnected || !wsUrl" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.websocket-client.page.connect') }}
            </button>
            <button @click="disconnect" :disabled="!isConnected" class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md">
              {{ $t('tools.websocket-client.page.disconnect') }}
            </button>
            <button @click="clearMessages" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">
              {{ $t('tools.websocket-client.page.clear') }}
            </button>
          </div>

          <div v-if="isConnected" class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('tools.websocket-client.page.sendMessage') }}</label>
              <div class="space-y-2">
                <div class="flex gap-2">
                  <select v-model="messageType" class="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="text">{{ $t('tools.websocket-client.page.typeText') }}</option>
                    <option value="json">JSON</option>
                    <option value="binary">{{ $t('tools.websocket-client.page.typeBinary') }}</option>
                  </select>
                  <button @click="formatMessage" v-if="messageType === 'json'" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">
                    {{ $t('tools.websocket-client.page.format') }}
                  </button>
                </div>

                <textarea
                  v-model="messageToSend"
                  class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
                  rows="4"
                  :placeholder="messagePlaceholder"
                  @keydown.ctrl.enter="sendMessage"
                />

                <div class="flex justify-between items-center">
                  <p class="text-xs text-gray-500">{{ $t('tools.websocket-client.page.ctrlEnterToSend') }} | {{ $t('tools.websocket-client.page.charCount', { n: messageToSend.length }) }}</p>
                  <button @click="sendMessage" :disabled="!messageToSend.trim()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">
                    {{ $t('tools.websocket-client.page.sendMessageBtn') }}
                  </button>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 class="font-medium mb-3">{{ $t('tools.websocket-client.page.quickTemplates') }}</h4>
              <div class="grid grid-cols-2 gap-2">
                <button
                  v-for="template in messageTemplates"
                  :key="template.name"
                  @click="loadTemplate(template)"
                  class="px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-sm"
                >
                  {{ template.name }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <h3 class="font-medium text-lg">{{ $t('tools.websocket-client.page.messageLog') }}</h3>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">{{ $t('tools.websocket-client.page.connectionInfo') }}</h4>
            <div class="flex gap-2">
              <button @click="exportMessages" :disabled="messages.length === 0" class="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm">
                {{ $t('tools.websocket-client.page.exportLog') }}
              </button>
              <button @click="toggleAutoScroll" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm" :class="{ 'bg-blue-800': autoScroll }">
                {{ autoScroll ? $t('tools.websocket-client.page.stopScroll') : $t('tools.websocket-client.page.autoScroll') }}
              </button>
            </div>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>{{ $t('tools.websocket-client.page.urlLabel') }}</span>
              <code class="text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded">{{ wsUrl || $t('tools.websocket-client.page.notConnected') }}</code>
            </div>
            <div class="flex justify-between">
              <span>{{ $t('tools.websocket-client.page.protocolLabel') }}</span>
              <span>{{ protocol || $t('tools.websocket-client.page.defaultValue') }}</span>
            </div>
            <div class="flex justify-between">
              <span>{{ $t('tools.websocket-client.page.messageCount') }}</span>
              <span>{{ messages.length }}</span>
            </div>
            <div class="flex justify-between">
              <span>{{ $t('tools.websocket-client.page.connectionTime') }}</span>
              <span>{{ connectionTime || $t('tools.websocket-client.page.notConnected') }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <div class="flex justify-between items-center">
              <span class="font-medium text-sm">{{ $t('tools.websocket-client.page.history') }}</span>
              <div class="flex gap-2">
                <select v-model="messageFilter" class="px-2 py-1 border rounded text-xs dark:bg-gray-600 dark:border-gray-500">
                  <option value="all">{{ $t('tools.websocket-client.page.filterAll') }}</option>
                  <option value="sent">{{ $t('tools.websocket-client.page.filterSent') }}</option>
                  <option value="received">{{ $t('tools.websocket-client.page.filterReceived') }}</option>
                  <option value="system">{{ $t('tools.websocket-client.page.filterSystem') }}</option>
                </select>
              </div>
            </div>
          </div>

          <div ref="messagesContainer" class="h-96 overflow-y-auto p-3 space-y-2">
            <div
              v-for="(message, index) in filteredMessages"
              :key="index"
              class="flex gap-3 text-sm"
              :class="{
                'justify-end': message.type === 'sent'
              }"
            >
              <div
                class="max-w-xs lg:max-w-md px-3 py-2 rounded-lg"
                :class="{
                  'bg-blue-500 text-white': message.type === 'sent',
                  'bg-gray-200 dark:bg-gray-600': message.type === 'received',
                  'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200': message.type === 'system'
                }"
              >
                <div class="flex justify-between items-start gap-2 mb-1">
                  <span class="font-medium text-xs opacity-75">
                    {{
                      message.type === 'sent'
                        ? $t('tools.websocket-client.page.tagSent')
                        : message.type === 'received'
                          ? $t('tools.websocket-client.page.tagReceived')
                          : $t('tools.websocket-client.page.tagSystem')
                    }}
                  </span>
                  <span class="text-xs opacity-75">{{ message.timestamp }}</span>
                </div>

                <div class="font-mono text-xs break-all">
                  <pre v-if="message.formatted" class="whitespace-pre-wrap">{{ message.formatted }}</pre>
                  <span v-else>{{ message.content }}</span>
                </div>

                <div v-if="message.size" class="text-xs opacity-75 mt-1">
                  {{ $t('tools.websocket-client.page.sizeBytes', { size: message.size }) }}
                </div>
              </div>
            </div>

            <div v-if="filteredMessages.length === 0" class="text-center py-8 text-gray-500">
              <div class="text-2xl mb-2">💬</div>
              <div>{{ $t('tools.websocket-client.page.noMessages') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">{{ $t('tools.websocket-client.page.guideTitle') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.websocket-client.page.connSettings') }}</h4>
          <ul class="space-y-1">
            <li>• {{ $t('tools.websocket-client.page.guideWs') }}</li>
            <li>• {{ $t('tools.websocket-client.page.guideSubprotocol') }}</li>
            <li>• {{ $t('tools.websocket-client.page.guideStatus') }}</li>
            <li>• {{ $t('tools.websocket-client.page.guideReconnect') }}</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">{{ $t('tools.websocket-client.page.messageFeatures') }}</h4>
          <ul class="space-y-1">
            <li>• {{ $t('tools.websocket-client.page.guideTypes') }}</li>
            <li>• {{ $t('tools.websocket-client.page.guideJsonFormat') }}</li>
            <li>• {{ $t('tools.websocket-client.page.guideHistory') }}</li>
            <li>• {{ $t('tools.websocket-client.page.guideExport') }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

interface Message {
  type: 'sent' | 'received' | 'system';
  content: string;
  formatted?: string;
  timestamp: string;
  size?: number;
}

interface MessageTemplate {
  name: string;
  type: 'text' | 'json' | 'binary';
  content: string;
}

const { t } = useI18n();

const wsUrl = ref('wss://echo.websocket.org');
const protocol = ref('');
const messageToSend = ref('');
const messageType = ref<'text' | 'json' | 'binary'>('text');
const messages = ref<Message[]>([]);
const messageFilter = ref<'all' | 'sent' | 'received' | 'system'>('all');
const autoScroll = ref(true);
const connectionTime = ref('');

const ws = ref<WebSocket | null>(null);
const connectionState = ref<'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'>('CLOSED');
const messagesContainer = ref<HTMLElement>();

const messageTemplates: MessageTemplate[] = [
  {
    name: t('tools.websocket-client.page.templatePing'),
    type: 'text',
    content: 'ping'
  },
  {
    name: t('tools.websocket-client.page.templateHello'),
    type: 'json',
    content: JSON.stringify({ type: 'hello', message: 'Hello WebSocket!' }, null, 2)
  },
  {
    name: t('tools.websocket-client.page.templateHeartbeat'),
    type: 'json',
    content: JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }, null, 2)
  },
  {
    name: t('tools.websocket-client.page.templateUserMessage'),
    type: 'json',
    content: JSON.stringify(
      {
        type: 'message',
        user: 'user123',
        content: 'Hello everyone!',
        timestamp: new Date().toISOString()
      },
      null,
      2
    )
  }
];

const isConnected = computed(() => connectionState.value === 'OPEN');

const connectionStateText = computed(() => {
  switch (connectionState.value) {
    case 'CONNECTING':
      return t('tools.websocket-client.page.stateConnecting');
    case 'OPEN':
      return t('tools.websocket-client.page.stateOpen');
    case 'CLOSING':
      return t('tools.websocket-client.page.stateClosing');
    case 'CLOSED':
      return t('tools.websocket-client.page.stateClosed');
    default:
      return t('tools.websocket-client.page.stateUnknown');
  }
});

const messagePlaceholder = computed(() => {
  switch (messageType.value) {
    case 'json':
      return t('tools.websocket-client.page.placeholderJson');
    case 'binary':
      return t('tools.websocket-client.page.placeholderBinary');
    default:
      return t('tools.websocket-client.page.placeholderText');
  }
});

const filteredMessages = computed(() => {
  if (messageFilter.value === 'all') {
    return messages.value;
  }
  return messages.value.filter((msg) => msg.type === messageFilter.value);
});

function connect() {
  if (ws.value) {
    ws.value.close();
  }

  try {
    addSystemMessage(t('tools.websocket-client.page.connectingTo', { url: wsUrl.value }));
    connectionState.value = 'CONNECTING';

    const protocols = protocol.value ? [protocol.value] : undefined;
    ws.value = new WebSocket(wsUrl.value, protocols);

    ws.value.onopen = () => {
      connectionState.value = 'OPEN';
      connectionTime.value = new Date().toLocaleString('zh-CN');
      addSystemMessage(t('tools.websocket-client.page.connected'));

      if (ws.value?.protocol) {
        addSystemMessage(t('tools.websocket-client.page.usingProtocol', { p: ws.value.protocol }));
      }
    };

    ws.value.onmessage = (event) => {
      let content = '';
      let formatted = '';
      let size = 0;

      if (typeof event.data === 'string') {
        content = event.data;
        size = new Blob([event.data]).size;

        try {
          const parsed = JSON.parse(event.data);
          formatted = JSON.stringify(parsed, null, 2);
        } catch {
          // not JSON
        }
      } else if (event.data instanceof Blob) {
        size = event.data.size;
        content = t('tools.websocket-client.page.blobData', { size });
      } else if (event.data instanceof ArrayBuffer) {
        size = event.data.byteLength;
        const uint8Array = new Uint8Array(event.data);
        content = Array.from(uint8Array, (byte) => byte.toString(16).padStart(2, '0')).join(' ');
      }

      addMessage('received', content, formatted, size);
    };

    ws.value.onclose = (event) => {
      connectionState.value = 'CLOSED';
      connectionTime.value = '';

      if (event.wasClean) {
        addSystemMessage(t('tools.websocket-client.page.closedClean', { code: event.code }));
      } else {
        addSystemMessage(t('tools.websocket-client.page.closedAbnormal', { code: event.code, reason: event.reason || t('tools.websocket-client.page.unknown') }));
      }
    };

    ws.value.onerror = (event) => {
      addSystemMessage(t('tools.websocket-client.page.connectionError'));
      console.error('WebSocket error:', event);
    };
  } catch (error) {
    addSystemMessage(t('tools.websocket-client.page.connectFailed', { msg: (error as Error).message }));
    connectionState.value = 'CLOSED';
  }
}

function disconnect() {
  if (ws.value) {
    connectionState.value = 'CLOSING';
    ws.value.close(1000, t('tools.websocket-client.page.userClosed'));
  }
}

function sendMessage() {
  if (!ws.value || !isConnected.value || !messageToSend.value.trim()) {
    return;
  }

  try {
    let dataToSend: string | ArrayBuffer = messageToSend.value;
    let formatted = '';

    if (messageType.value === 'json') {
      try {
        const parsed = JSON.parse(messageToSend.value);
        dataToSend = JSON.stringify(parsed);
        formatted = JSON.stringify(parsed, null, 2);
      } catch (error) {
        addSystemMessage(t('tools.websocket-client.page.jsonInvalid', { msg: (error as Error).message }));
        return;
      }
    } else if (messageType.value === 'binary') {
      try {
        const hexString = messageToSend.value.replace(/[^0-9a-fA-F]/g, '');
        if (hexString.length % 2 !== 0) {
          throw new Error(t('tools.websocket-client.page.hexLengthEven'));
        }

        const bytes = new Uint8Array(hexString.length / 2);
        for (let i = 0; i < hexString.length; i += 2) {
          bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
        }
        dataToSend = bytes.buffer;
      } catch (error) {
        addSystemMessage(t('tools.websocket-client.page.binaryInvalid', { msg: (error as Error).message }));
        return;
      }
    }

    ws.value.send(dataToSend as any);

    const size = typeof dataToSend === 'string' ? new Blob([dataToSend]).size : dataToSend.byteLength;

    addMessage('sent', messageToSend.value, formatted, size);
    messageToSend.value = '';
  } catch (error) {
    addSystemMessage(t('tools.websocket-client.page.sendFailed', { msg: (error as Error).message }));
  }
}

function addMessage(type: 'sent' | 'received' | 'system', content: string, formatted?: string, size?: number) {
  messages.value.push({
    type,
    content,
    formatted,
    timestamp: new Date().toLocaleTimeString('zh-CN'),
    size
  });

  if (autoScroll.value) {
    nextTick(() => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
      }
    });
  }
}

function addSystemMessage(content: string) {
  messages.value.push({
    type: 'system',
    content,
    timestamp: new Date().toLocaleTimeString('zh-CN')
  });
}

function clearMessages() {
  messages.value = [];
}

function formatMessage() {
  if (messageType.value === 'json') {
    try {
      const parsed = JSON.parse(messageToSend.value);
      messageToSend.value = JSON.stringify(parsed, null, 2);
    } catch (error) {
      addSystemMessage(t('tools.websocket-client.page.jsonFormatFailed', { msg: (error as Error).message }));
    }
  }
}

function loadTemplate(template: MessageTemplate) {
  messageType.value = template.type;
  messageToSend.value = template.content;
}

function toggleAutoScroll() {
  autoScroll.value = !autoScroll.value;
}

function exportMessages() {
  const header = t('tools.websocket-client.page.reportTitle');
  const lines = [
    header,
    t('tools.websocket-client.page.reportUrl', { url: wsUrl.value }),
    t('tools.websocket-client.page.reportProtocol', { protocol: protocol.value || t('tools.websocket-client.page.defaultValue') }),
    t('tools.websocket-client.page.reportConnectionTime', { time: connectionTime.value }),
    t('tools.websocket-client.page.reportTotal', { n: messages.value.length }),
    '',
    t('tools.websocket-client.page.reportDetails')
  ];

  const reportBody = messages.value
    .map((msg, index) => {
      const sizeSuffix = msg.size ? t('tools.websocket-client.page.reportSizeSuffix', { size: msg.size }) : '';
      return t('tools.websocket-client.page.reportItem', {
        index: index + 1,
        timestamp: msg.timestamp,
        type: msg.type.toUpperCase(),
        content: msg.content,
        size: sizeSuffix
      });
    })
    .join('\n');

  const footer = '\n\n' + t('tools.websocket-client.page.reportExportTime', { time: new Date().toLocaleString('zh-CN') });

  const report = lines.join('\n') + '\n' + reportBody + footer;

  const blob = new Blob([report], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `websocket-log-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

onUnmounted(() => {
  if (ws.value) {
    ws.value.close();
  }
});
</script>
