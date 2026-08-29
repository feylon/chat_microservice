const state = {
  config: null,
  socket: null,
  userId: localStorage.getItem('chat.userId') || '',
  conversationId: null,
  receiverId: null,
  heartbeat: null,
  peerTimer: null,
};

const $ = (id) => document.getElementById(id);

const uuid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });

const isUuid = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

function toast(text) {
  const el = $('toast');
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (el.hidden = true), 4000);
}

async function api(base, path, options = {}) {
  const response = await fetch(`${base}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Array.isArray(body.message)
      ? body.message.join(', ')
      : body.message;
    throw new Error(message || `HTTP ${response.status}`);
  }
  return body;
}

const chatApi = (path, options) => api(state.config.chatApiUrl, path, options);
const notificationApi = (path, options) =>
  api(state.config.notificationApiUrl, path, options);

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`${src} yuklanmadi`));
    document.head.appendChild(script);
  });
}

function setConnection(online) {
  const badge = $('connection');
  badge.textContent = online ? 'ulangan' : 'uzilgan';
  badge.className = `badge ${online ? 'online' : 'offline'}`;
}

function formatTime(value) {
  return value
    ? new Date(value).toLocaleTimeString('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';
}

function renderMessage(message) {
  let li = document.querySelector(`#messages li[data-id="${message.id}"]`);
  if (!li) {
    li = document.createElement('li');
    li.dataset.id = message.id;
    $('messages').appendChild(li);
  }
  li.className = message.senderId === state.userId ? 'mine' : '';
  li.innerHTML = '';

  const text = document.createElement('div');
  text.className = 'text';
  text.textContent =
    message.messageType === 'file'
      ? `📎 ${message.file?.fileName ?? 'fayl'}`
      : message.content;
  li.appendChild(text);

  const meta = document.createElement('div');
  meta.className = 'meta';
  const time = document.createElement('span');
  time.textContent =
    formatTime(message.createdAt) + (message.edited ? ' · tahrirlandi' : '');
  meta.appendChild(time);

  if (message.senderId === state.userId) {
    const edit = document.createElement('button');
    edit.textContent = 'Tahrirlash';
    edit.onclick = () => editMessage(message);
    const remove = document.createElement('button');
    remove.textContent = "O'chirish";
    remove.onclick = () => deleteMessage(message.id);
    meta.append(edit, remove);
  }

  li.appendChild(meta);
  li._message = message;
  return li;
}

function scrollToBottom() {
  const list = $('messages');
  list.scrollTop = list.scrollHeight;
}

async function editMessage(message) {
  const content = prompt('Yangi matn:', message.content);
  if (content === null || content.trim() === '' || content === message.content)
    return;
  try {
    await chatApi(`/messages/${message.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ senderId: state.userId, content: content.trim() }),
    });
  } catch (error) {
    toast(error.message);
  }
}

async function deleteMessage(messageId) {
  if (!confirm("Xabar o'chirilsinmi?")) return;
  try {
    await chatApi(`/messages/${messageId}`, {
      method: 'DELETE',
      body: JSON.stringify({ senderId: state.userId }),
    });
  } catch (error) {
    toast(error.message);
  }
}

function renderConversations(list) {
  const ul = $('conversations');
  ul.innerHTML = '';
  if (list.length === 0) {
    ul.innerHTML = '<li class="muted">Hozircha suhbat yo\'q</li>';
    return;
  }
  for (const conversation of list) {
    const peer =
      conversation.participants.find((id) => id !== state.userId) ??
      state.userId;
    const li = document.createElement('li');
    li.textContent = peer;
    li.title = `Suhbat: ${conversation.id}`;
    li.classList.toggle('active', conversation.id === state.conversationId);
    li.onclick = () => openConversation(conversation.id, peer);
    ul.appendChild(li);
  }
}

function refreshConversations() {
  state.socket.emit('get_conversations', {
    userId: state.userId,
    page: 1,
    limit: 50,
  });
}

async function refreshNotifications() {
  try {
    const { data } = await notificationApi(
      `/notifications/${state.userId}?unread=true`,
    );
    const ul = $('notifications');
    ul.innerHTML = '';
    if (data.length === 0) {
      ul.innerHTML = '<li class="muted">Yangi bildirishnoma yo\'q</li>';
      return;
    }
    for (const item of data) {
      const li = document.createElement('li');
      li.textContent = `${item.senderId.slice(0, 8)}…: ${item.preview}`;
      ul.appendChild(li);
    }
    await notificationApi(`/notifications/${state.userId}/read`, {
      method: 'PATCH',
    });
  } catch (error) {
    toast(`Bildirishnomalar: ${error.message}`);
  }
}

async function refreshPeerStatus() {
  if (!state.receiverId) return;
  const badge = $('peerStatus');
  try {
    const status = await chatApi(`/presence/${state.receiverId}`);
    badge.textContent = status.status === 'online' ? 'online' : 'offline';
    badge.className = `badge ${status.status}`;
  } catch {
    badge.textContent = "noma'lum";
    badge.className = 'badge';
  }
}

function openConversation(conversationId, receiverId) {
  if (state.conversationId) {
    state.socket.emit('leave_room', { conversationId: state.conversationId });
  }
  state.conversationId = conversationId;
  state.receiverId = receiverId;

  $('chatTitle').textContent = receiverId;
  $('chatMeta').textContent = `Suhbat: ${conversationId}`;
  $('messages').innerHTML = '';
  $('messageInput').disabled = false;
  document.querySelector('#sendForm button').disabled = false;
  document
    .querySelectorAll('#conversations li')
    .forEach((li) =>
      li.classList.toggle('active', li.title.endsWith(conversationId)),
    );

  state.socket.emit('join_room', { conversationId });
  state.socket.emit('get_messages', { conversationId, page: 1, limit: 50 });

  clearInterval(state.peerTimer);
  refreshPeerStatus();
  state.peerTimer = setInterval(refreshPeerStatus, 15000);
  $('messageInput').focus();
}

function bindSocket(socket) {
  socket.on('connect', () => {
    setConnection(true);
    refreshConversations();
    if (state.conversationId) {
      socket.emit('join_room', { conversationId: state.conversationId });
    }
  });
  socket.on('disconnect', () => setConnection(false));
  socket.on('connect_error', () => setConnection(false));

  socket.on('conversations_list', ({ data }) => renderConversations(data));

  socket.on('messages_list', ({ data }) => {
    $('messages').innerHTML = '';
    data.forEach(renderMessage);
    scrollToBottom();
  });

  socket.on('receive_message', (message) => {
    if (message.conversationId !== state.conversationId) return;
    renderMessage(message);
    scrollToBottom();
  });

  socket.on('new_message', (message) => {
    refreshConversations();
    if (message.conversationId !== state.conversationId) {
      toast(`Yangi xabar: ${message.content ?? 'fayl'}`);
    }
  });

  socket.on('message_update', ({ messageId, newContent, updatedAt }) => {
    const li = document.querySelector(`#messages li[data-id="${messageId}"]`);
    if (li && li._message) {
      renderMessage({
        ...li._message,
        content: newContent,
        updatedAt,
        edited: true,
      });
    }
  });

  socket.on('delete_message', ({ messageId }) => {
    document.querySelector(`#messages li[data-id="${messageId}"]`)?.remove();
  });

  socket.on('error_notification', (error) => toast(error.message));
  socket.on('exception', (error) => {
    const message =
      typeof error.message === 'string'
        ? error.message
        : JSON.stringify(error.message);
    toast(message);
  });
}

async function connect() {
  const userId = $('userId').value.trim();
  if (!isUuid(userId)) {
    toast("ID UUID formatida bo'lishi kerak");
    return;
  }
  state.userId = userId;
  localStorage.setItem('chat.userId', userId);

  try {
    if (!window.io) {
      await loadScript(`${state.config.messageWsUrl}/socket.io/socket.io.js`);
    }
  } catch (error) {
    toast(`message_db servisiga ulanib bo'lmadi: ${error.message}`);
    return;
  }

  state.socket = io(state.config.messageWsUrl, {
    auth: { userId },
    transports: ['websocket', 'polling'],
  });
  bindSocket(state.socket);

  $('login').hidden = true;
  $('app').hidden = false;

  const ping = () =>
    chatApi('/presence/heartbeat', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }).catch(() => {});
  chatApi('/presence/online', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  }).catch((error) => toast(error.message));
  state.heartbeat = setInterval(ping, 60000);

  refreshNotifications();
}

async function sendMessage(event) {
  event.preventDefault();
  const input = $('messageInput');
  const content = input.value.trim();
  if (!content || !state.conversationId) return;

  try {
    await chatApi('/messages', {
      method: 'POST',
      body: JSON.stringify({
        conversationId: state.conversationId,
        senderId: state.userId,
        receiverId: state.receiverId,
        content,
        messageType: 'text',
      }),
    });
    input.value = '';
    setTimeout(refreshConversations, 500);
  } catch (error) {
    toast(error.message);
  }
}

function startNewConversation() {
  const receiverId = $('receiverId').value.trim();
  if (!isUuid(receiverId)) {
    toast("Qabul qiluvchi ID UUID formatida bo'lishi kerak");
    return;
  }
  if (receiverId === state.userId) {
    toast("O'zingiz bilan suhbat ochib bo'lmaydi");
    return;
  }
  openConversation(uuid(), receiverId);
}

window.addEventListener('beforeunload', () => {
  if (!state.userId || !state.config) return;
  fetch(`${state.config.chatApiUrl}/presence/offline`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: state.userId }),
  });
});

async function init() {
  state.config = await fetch('config.json').then((r) => r.json());
  $('userId').value = state.userId;

  document.querySelectorAll('[data-generate]').forEach((button) => {
    button.onclick = () => ($(button.dataset.generate).value = uuid());
  });
  $('connectBtn').onclick = connect;
  $('newConversationBtn').onclick = startNewConversation;
  $('refreshNotifications').onclick = refreshNotifications;
  $('sendForm').onsubmit = sendMessage;
}

init();
