# chat-api

Tashqi REST API. So'rovlarni Kafka (xabarlar) va Redis (presence) orqali ichki servislarga uzatadi.

## Lokal ishga tushirish

```bash
cp .env.example .env
npm install
npm run start:dev
```

## Buyruqlar

| Buyruq | Vazifasi |
|---|---|
| `npm run start:dev` | Kuzatuv rejimida ishga tushirish |
| `npm run build` | Production uchun yig'ish |
| `npm run start:prod` | Yig'ilgan versiyani ishga tushirish |
| `npm test` | Unit testlar |

Umumiy ma'lumot va to'liq yo'riqnoma: [../README.md](../README.md), [../ISHGA_TUSHIRISH.md](../ISHGA_TUSHIRISH.md)
