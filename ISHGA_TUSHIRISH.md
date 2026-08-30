# Loyihani ishga tushirish bo'yicha yo'riqnoma

## 1. Talablar

| Dastur | Versiya | Tekshirish |
|---|---|---|
| Docker | 24+ | `docker --version` |
| Docker Compose | v2+ | `docker compose version` |
| Node.js (faqat lokal rejim uchun) | 20+ | `node -v` |
| npm (faqat lokal rejim uchun) | 10+ | `npm -v` |

Quyidagi portlar bo'sh bo'lishi kerak: `3000`, `3001`, `3003`, `3010`, `5433`, `6380`, `8080`, `9092`.

```bash
ss -ltn | grep -E ':(3000|3001|3003|3010|5433|6380|8080|9092)\b'
```

Buyruq hech narsa chiqarmasa, portlar bo'sh.

## 2. Docker orqali to'liq ishga tushirish (tavsiya etiladi)

Loyiha papkasiga o'ting:

```bash
cd chat_microservice
```

Barcha servislarni yig'ib, ishga tushiring:

```bash
docker compose up -d --build
```

Birinchi ishga tushirishda image'lar yuklab olinadi va yig'iladi, bu bir necha daqiqa vaqt oladi.

Holatni tekshiring:

```bash
docker compose ps
```

`kafka-init` konteyneri `Exited (0)` holatida bo'lishi normal: u Kafka topiclarini yaratib, ishini tugatadi. Qolgan barcha servislar `running` holatida bo'lishi kerak.

Servislar tayyorligini tekshiring:

```bash
curl http://localhost:3000/health
curl http://localhost:3001/health
curl http://localhost:3003/health
curl http://localhost:3010/health
```

Har biri `"status":"ok"` qaytarishi kerak.

### Foydali manzillar

| Manzil | Tavsif |
|---|---|
| http://localhost:3010 | Demo chat sahifasi |
| http://localhost:3000/api | Chat REST API |
| http://localhost:3001 | Message storage (REST + WebSocket) |
| http://localhost:3003 | Notification API |
| http://localhost:8080 | Kafka UI |

### Loglarni ko'rish

```bash
docker compose logs -f message-storage chat-api presence-service notification-service
```

### To'xtatish

```bash
docker compose down
```

Bazadagi ma'lumotlarni ham o'chirish uchun:

```bash
docker compose down -v
```

## 3. Demo chatni sinab ko'rish

1. Brauzerda http://localhost:3010 sahifasini oching.
2. "Yangi" tugmasini bosib o'zingizga ID yarating va "Ulanish" tugmasini bosing.
3. Ikkinchi brauzer oynasini (yoki inkognito oynani) oching va u yerda ham yangi ID bilan ulaning.
4. Birinchi oynada "Qabul qiluvchi ID" maydoniga ikkinchi foydalanuvchining ID sini kiriting va "Suhbatni ochish" tugmasini bosing.
5. Xabar yuboring. Ikkinchi oynada chap tomondagi "Suhbatlar" ro'yxatida yangi suhbat paydo bo'ladi, uni bosib xabarlarni real vaqtda ko'rishingiz mumkin.
6. O'z xabaringizni tahrirlash yoki o'chirish uchun xabar ostidagi tugmalardan foydalaning.
7. Agar qabul qiluvchi offline bo'lsa, unga bildirishnoma saqlanadi. U ulanganda "Bildirishnomalar" bo'limida ko'rinadi.

## 4. API orqali sinash (curl)

```bash
A=11111111-1111-4111-8111-111111111111
B=22222222-2222-4222-8222-222222222222

curl -X POST http://localhost:3000/api/presence/online \
  -H 'Content-Type: application/json' -d "{\"userId\":\"$A\"}"

curl -X POST http://localhost:3000/api/messages \
  -H 'Content-Type: application/json' \
  -d "{\"senderId\":\"$A\",\"receiverId\":\"$B\",\"content\":\"Salom!\"}"
```

Javobda `conversationId` qaytadi. Uni quyidagi so'rovlarda ishlating:

```bash
curl "http://localhost:3001/messages?conversationId=<conversationId>"
curl "http://localhost:3001/conversations?userId=$B"
curl "http://localhost:3003/notifications/$B"
curl "http://localhost:3000/api/presence/$A"
```

## 5. Lokal rejimda ishga tushirish (dasturlash uchun)

Bu rejimda faqat infratuzilma Docker'da ishlaydi, servislar esa kompyuteringizda `npm run start:dev` orqali ishga tushadi va kod o'zgarganda avtomatik qayta yuklanadi.

### 5.1. Infratuzilmani ishga tushirish

```bash
docker compose up -d postgres redis zookeeper kafka kafka-init kafka-ui
```

### 5.2. Bog'liqliklarni o'rnatish va .env fayllarini yaratish

```bash
for s in message_db precence_service chat_service notification_service client; do
  (cd $s && npm ci && cp -n .env.example .env)
done
```

`.env.example` fayllaridagi qiymatlar lokal rejimga moslangan (PostgreSQL `5433`, Redis `6380`, Kafka `9092`), shuning uchun ularni o'zgartirish shart emas.

### 5.3. Servislarni ishga tushirish

Har birini alohida terminalda ishga tushiring:

```bash
cd message_db && npm run start:dev
cd precence_service && npm run start:dev
cd chat_service && npm run start:dev
cd notification_service && npm run start:dev
cd client && npm run start:dev
```

`message_db` birinchi marta ishga tushganda barcha migratsiyalarni avtomatik bajaradi.

## 6. Testlar

Har bir servis uchun unit testlarni ishga tushirish:

```bash
for s in message_db precence_service chat_service notification_service client; do
  (cd $s && npm test)
done
```

## 7. Makefile (ixtiyoriy)

Agar tizimingizda `make` o'rnatilgan bo'lsa, qisqa buyruqlardan foydalanish mumkin:

| Buyruq | Vazifasi |
|---|---|
| `make up` | Hammasini Docker'da yig'ib ishga tushirish |
| `make down` | To'xtatish |
| `make logs` | Servis loglarini kuzatish |
| `make infra` | Faqat infratuzilmani ishga tushirish |
| `make install` | Barcha servislarga bog'liqliklarni o'rnatish |
| `make test` | Barcha testlarni ishga tushirish |
| `make clean` | Konteynerlar va ma'lumotlarni o'chirish |

## 8. Muammolarni hal qilish

| Belgisi | Sababi va yechimi |
|---|---|
| `port is already allocated` | Port band. Band qilgan jarayonni to'xtating yoki `docker-compose.yml` dagi tashqi portni o'zgartiring. |
| Loglarda `The group coordinator is not available` | Kafka endigina ishga tushgan. Bir necha soniyadan keyin o'zi yo'qoladi. |
| `chat-api` `/api/presence/:userId` 503 qaytaradi | `presence-service` ishlamayapti. `docker compose logs presence-service` ni tekshiring. |
| Demo sahifada "message_db servisiga ulanib bo'lmadi" | `message-storage` hali tayyor emas. `curl http://localhost:3001/health` bilan tekshiring. |
| Bazani tozalab, qaytadan boshlash kerak | `docker compose down -v && docker compose up -d --build` |
