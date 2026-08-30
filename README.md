# Chat Microservice

NestJS asosidagi real vaqtli chat tizimi. Loyiha bir nechta mustaqil mikroservisdan iborat bo'lib, ular Kafka va Redis orqali o'zaro bog'lanadi.

Ishga tushirish bo'yicha to'liq yo'riqnoma: [ISHGA_TUSHIRISH.md](ISHGA_TUSHIRISH.md)

## Arxitektura

```
 Brauzer (demo-client :3010)
   │  REST                        │  WebSocket (Socket.IO)
   ▼                              ▼
 chat-api :3000 ──Kafka──▶ message-storage :3001 ──▶ PostgreSQL
   │                              │
   │ Redis transport              │ Kafka: message_saved_success
   ▼                              ▼
 presence-service ◀──Redis── notification-service :3003
```

| Servis | Papka | Port | Vazifasi |
|---|---|---|---|
| chat-api | `chat_service` | 3000 | Tashqi REST API: xabar yuborish/tahrirlash/o'chirish, online holat |
| message-storage | `message_db` | 3001 | Xabarlarni PostgreSQL'da saqlaydi, Socket.IO orqali real vaqtda tarqatadi |
| presence-service | `precence_service` | — | Foydalanuvchi online/offline holatini Redis'da saqlaydi |
| notification-service | `notification_service` | 3003 | Offline foydalanuvchilar uchun bildirishnoma yaratadi |
| demo-client | `client` | 3010 | Brauzerda tizimni sinab ko'rish uchun demo chat sahifasi |

Infratuzilma: PostgreSQL (5433), Redis (6380), Kafka (9092), Kafka UI (8080).

## Xabar oqimi

1. Klient `POST /api/messages` so'rovini `chat-api` ga yuboradi.
2. `chat-api` xabarni `save_message_request` Kafka topigiga joylaydi va `202 Accepted` qaytaradi.
3. `message-storage` xabarni bazaga yozadi, suhbat xonasiga `receive_message` hodisasini yuboradi va `message_saved_success` topigiga e'lon qiladi.
4. `notification-service` qabul qiluvchilarning holatini `presence-service` dan so'raydi va offline bo'lganlar uchun bildirishnoma saqlaydi.

## REST API

### chat-api (`http://localhost:3000`)

| Metod | Yo'l | Body |
|---|---|---|
| GET | `/health` | — |
| POST | `/api/messages` | `{ conversationId?, senderId, receiverId, content, messageType? }` |
| PATCH | `/api/messages/:id` | `{ senderId, content }` |
| DELETE | `/api/messages/:id` | `{ senderId }` |
| POST | `/api/presence/online` | `{ userId }` |
| POST | `/api/presence/offline` | `{ userId }` |
| POST | `/api/presence/heartbeat` | `{ userId }` |
| GET | `/api/presence/:userId` | — |

### message-storage (`http://localhost:3001`)

| Metod | Yo'l | Query |
|---|---|---|
| GET | `/health` | — |
| GET | `/messages` | `conversationId`, `page`, `limit` |
| GET | `/conversations` | `userId`, `page`, `limit` |

### notification-service (`http://localhost:3003`)

| Metod | Yo'l | Izoh |
|---|---|---|
| GET | `/health` | — |
| GET | `/notifications/:userId?unread=true` | Bildirishnomalar ro'yxati |
| PATCH | `/notifications/:userId/read` | Hammasini o'qilgan deb belgilash |

## WebSocket hodisalari (message-storage)

Ulanishda `auth: { userId }` yuboriladi, shunda foydalanuvchi o'zining shaxsiy xonasiga qo'shiladi.

| Klient yuboradi | Javob hodisasi |
|---|---|
| `join_room` `{ conversationId }` | `joined_room` |
| `leave_room` `{ conversationId }` | `left_room` |
| `get_conversations` `{ userId, page, limit }` | `conversations_list` |
| `get_messages` `{ conversationId, page, limit }` | `messages_list` |

Server yuboradigan hodisalar: `receive_message`, `new_message`, `message_update`, `delete_message`, `error_notification`, `exception`.

## Qoidalar

- Xabarni faqat uning muallifi tahrirlashi va o'chirishi mumkin.
- Tahrirlash xabar yuborilganidan keyin 24 soat ichida ruxsat etiladi.
- O'chirilgan xabarlar bazadan o'chirilmaydi, `isDelete` bayrog'i bilan belgilanadi.
