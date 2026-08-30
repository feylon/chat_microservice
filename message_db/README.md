# message-storage

Xabarlar va suhbatlarni PostgreSQL'da saqlaydi, Kafka hodisalarini qayta ishlaydi va Socket.IO orqali real vaqtda tarqatadi.

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

## Migratsiyalar

Servis ishga tushganda migratsiyalar avtomatik bajariladi. Qo'lda boshqarish uchun:

```bash
npm run migration:run
npm run migration:revert
npm run migration:generate -- src/migrations/YangiMigratsiya
```
