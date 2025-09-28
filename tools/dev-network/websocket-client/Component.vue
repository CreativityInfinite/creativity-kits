<template>
  <div class="space-y-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="space-y-4">
        <h3 class="font-medium text-lg">WebSocket 客户端</h3>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium mb-1">WebSocket URL</label>
            <input
              v-model="wsUrl"
              type="text"
              class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
              placeholder="ws://localhost:8080 或 wss://echo.websocket.org"
              :disabled="isConnected"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium mb-1">协议 (可选)</label>
              <input
                v-model="protocol"
                type="text"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="如: chat, echo"
                :disabled="isConnected"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">连接状态</label>
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
            <button @click="connect" :disabled="isConnected || !wsUrl" class="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md">连接</button>
            <button @click="disconnect" :disabled="!isConnected" class="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md">断开</button>
            <button @click="clearMessages" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">清空</button>
          </div>

          <div v-if="isConnected" class="space-y-3">
            <div>
              <label class="block text-sm font-medium mb-1">发送消息</label>
              <div class="space-y-2">
                <div class="flex gap-2">
                  <select v-model="messageType" class="px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="text">文本</option>
                    <option value="json">JSON</option>
                    <option value="binary">二进制</option>
                  </select>
                  <button @click="formatMessage" v-if="messageType === 'json'" class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">格式化</button>
                </div>

                <textarea
                  v-model="messageToSend"
                  class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white font-mono"
                  rows="4"
                  :placeholder="messagePlaceholder"
                  @keydown.ctrl.enter="sendMessage"
                />

                <div class="flex justify-between items-center">
                  <p class="text-xs text-gray-500">Ctrl+Enter 发送 | 字符数: {{ messageToSend.length }}</p>
                  <button @click="sendMessage" :disabled="!messageToSend.trim()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md">发送消息</button>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <h4 class="font-medium mb-3">快速消息模板</h4>
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
        <h3 class="font-medium text-lg">消息日志</h3>

        <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div class="flex justify-between items-center mb-3">
            <h4 class="font-medium">连接信息</h4>
            <div class="flex gap-2">
              <button @click="exportMessages" :disabled="messages.length === 0" class="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm">导出日志</button>
              <button @click="toggleAutoScroll" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm" :class="{ 'bg-blue-800': autoScroll }">
                {{ autoScroll ? '停止滚动' : '自动滚动' }}
              </button>
            </div>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span>URL:</span>
              <code class="text-xs bg-gray-200 dark:bg-gray-600 px-1 rounded">{{ wsUrl || '未连接' }}</code>
            </div>
            <div class="flex justify-between">
              <span>协议:</span>
              <span>{{ protocol || '默认' }}</span>
            </div>
            <div class="flex justify-between">
              <span>消息数量:</span>
              <span>{{ messages.length }}</span>
            </div>
            <div class="flex justify-between">
              <span>连接时间:</span>
              <span>{{ connectionTime || '未连接' }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border rounded-lg">
          <div class="p-3 border-b bg-gray-50 dark:bg-gray-700">
            <div class="flex justify-between items-center">
              <span class="font-medium text-sm">消息历史</span>
              <div class="flex gap-2">
                <select v-model="messageFilter" class="px-2 py-1 border rounded text-xs dark:bg-gray-600 dark:border-gray-500">
                  <option value="all">全部</option>
                  <option value="sent">已发送</option>
                  <option value="received">已接收</option>
                  <option value="system">系统</option>
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
                    {{ message.type === 'sent' ? '发送' : message.type === 'received' ? '接收' : '系统' }}
                  </span>
                  <span class="text-xs opacity-75">{{ message.timestamp }}</span>
                </div>

                <div class="font-mono text-xs break-all">
                  <pre v-if="message.formatted" class="whitespace-pre-wrap">{{ message.formatted }}</pre>
                  <span v-else>{{ message.content }}</span>
                </div>

                <div v-if="message.size" class="text-xs opacity-75 mt-1">大小: {{ message.size }} bytes</div>
              </div>
            </div>

            <div v-if="filteredMessages.length === 0" class="text-center py-8 text-gray-500">
              <div class="text-2xl mb-2">💬</div>
              <div>暂无消息</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
      <h3 class="font-medium mb-3">使用说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>
          <h4 class="font-medium mb-2">连接设置</h4>
          <ul class="space-y-1">
            <li>• 支持 ws:// 和 wss:// 协议</li>
            <li>• 可选择子协议</li>
            <li>• 实时显示连接状态</li>
            <li>• 自动重连功能</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">消息功能</h4>
          <ul class="space-y-1">
            <li>• 支持文本、JSON、二进制消息</li>
            <li>• JSON 自动格式化</li>
            <li>• 消息历史记录</li>
            <li>• 导出日志功能</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue';

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
    name: 'Ping',
    type: 'text',
    content: 'ping'
  },
  {
    name: 'Hello',
    type: 'json',
    content: JSON.stringify({ type: 'hello', message: 'Hello WebSocket!' }, null, 2)
  },
  {
    name: '心跳包',
    type: 'json',
    content: JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }, null, 2)
  },
  {
    name: '用户消息',
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
      return '连接中...';
    case 'OPEN':
      return '已连接';
    case 'CLOSING':
      return '断开中...';
    case 'CLOSED':
      return '已断开';
    default:
      return '未知';
  }
});

const messagePlaceholder = computed(() => {
  switch (messageType.value) {
    case 'json':
      return '输入 JSON 格式消息...\n{\n  "type": "message",\n  "content": "Hello"\n}';
    case 'binary':
      return '输入十六进制字符串 (如: 48656c6c6f) 或文本';
    default:
      return '输入要发送的文本消息...';
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
    addSystemMessage('正在连接到 ' + wsUrl.value);
    connectionState.value = 'CONNECTING';

    const protocols = protocol.value ? [protocol.value] : undefined;
    ws.value = new WebSocket(wsUrl.value, protocols);

    ws.value.onopen = (event) => {
      connectionState.value = 'OPEN';
      connectionTime.value = new Date().toLocaleString('zh-CN');
      addSystemMessage('连接成功');

      if (ws.value?.protocol) {
        addSystemMessage(`使用协议: ${ws.value.protocol}`);
      }
    };

    ws.value.onmessage = (event) => {
      let content = '';
      let formatted = '';
      let size = 0;

      if (typeof event.data === 'string') {
        content = event.data;
        size = new Blob([event.data]).size;

        // 尝试格式化 JSON
        try {
          const parsed = JSON.parse(event.data);
          formatted = JSON.stringify(parsed, null, 2);
        } catch {
          // 不是 JSON，保持原样
        }
      } else if (event.data instanceof Blob) {
        size = event.data.size;
        content = `[Blob 数据, ${size} bytes]`;
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
        addSystemMessage(`连接正常关闭 (代码: ${event.code})`);
      } else {
        addSystemMessage(`连接异常断开 (代码: ${event.code}, 原因: ${event.reason || '未知'})`);
      }
    };

    ws.value.onerror = (event) => {
      addSystemMessage('连接错误');
      console.error('WebSocket error:', event);
    };
  } catch (error) {
    addSystemMessage('连接失败: ' + (error as Error).message);
    connectionState.value = 'CLOSED';
  }
}

function disconnect() {
  if (ws.value) {
    connectionState.value = 'CLOSING';
    ws.value.close(1000, '用户主动断开');
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
      // 验证并格式化 JSON
      try {
        const parsed = JSON.parse(messageToSend.value);
        dataToSend = JSON.stringify(parsed);
        formatted = JSON.stringify(parsed, null, 2);
      } catch (error) {
        addSystemMessage('JSON 格式错误: ' + (error as Error).message);
        return;
      }
    } else if (messageType.value === 'binary') {
      // 处理二进制数据
      try {
        // 移除空格和非十六进制字符
        const hexString = messageToSend.value.replace(/[^0-9a-fA-F]/g, '');
        if (hexString.length % 2 !== 0) {
          throw new Error('十六进制字符串长度必须是偶数');
        }

        const bytes = new Uint8Array(hexString.length / 2);
        for (let i = 0; i < hexString.length; i += 2) {
          bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
        }
        dataToSend = bytes.buffer;
      } catch (error) {
        addSystemMessage('二进制数据格式错误: ' + (error as Error).message);
        return;
      }
    }

    ws.value.send(dataToSend);

    const size = typeof dataToSend === 'string' ? new Blob([dataToSend]).size : dataToSend.byteLength;

    addMessage('sent', messageToSend.value, formatted, size);
    messageToSend.value = '';
  } catch (error) {
    addSystemMessage('发送失败: ' + (error as Error).message);
  }
}

function addMessage(type: 'sent' | 'received', content: string, formatted?: string, size?: number) {
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
  addMessage('system', content);
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
      addSystemMessage('JSON 格式化失败: ' + (error as Error).message);
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
  const report = `WebSocket 消息日志
连接 URL: ${wsUrl.value}
协议: ${protocol.value || '默认'}
连接时间: ${connectionTime.value}
消息总数: ${messages.value.length}

消息详情:
${messages.value
  .map((msg, index) => {
    return `${index + 1}. [${msg.timestamp}] ${msg.type.toUpperCase()}: ${msg.content}${msg.size ? ` (${msg.size} bytes)` : ''}`;
  })
  .join('\n')}

导出时间: ${new Date().toLocaleString('zh-CN')}
`;

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
