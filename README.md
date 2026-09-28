# 🍹 FreshMix - Custom Drink Constructor (Ichimliklar Konstruktori)

Next.js (App Router), Tailwind CSS, Framer Motion va TypeScript asosida yaratilgan zamonaviy interaktiv ichimlik konstruktori va buyurtmalarni qabul qilish tizimi.

---

## 🚀 Asosiy Imkoniyatlar

### 1. 🧪 Interaktiv Ichimlik Konstruktori
- **Turli xil tabiiy ta'mlar:** Qulupnay, Limon-Yalpiz (Moxito), Mango-Marakuya, Tarvuz, Moviy Lagun, Kraft Kola, Shaftoli, Ko'k Choy-Yasmin, Energetik Taurin, Malina, Kivi va boshqalar.
- **Milligramm (mg) bo'yicha aniq doza:** Har bir ta'mni 50mg dan 2500mg gacha o'rnatish, qadamlar (+100mg, +250mg, +500mg).
- **Idish hajmlari:** 
  - `0.5 L` (Ixcham)
  - `1.0 L` (Standart)
  - `1.5 L` (Katta)
  - `2.0 L` (Mega Party)
- **Vizual Jonli Namoyish:**
  - Idish o'lchamining dinamik o'zgarishi
  - Tanlangan ta'mlarning suyuqlik qatlamlari va ranglarining uyg'unlashishi
  - Gazlilik darajasiga qarab ko'pik va pufakchalar animatsiyasi
  - Muz bo'laklari, yangi limon/laym bo'laklari, yalpiz barglari va Boba donachalari suzib yurishi
  - Idish yorlig'ida ichimlikning maxsus nomi
- **Qo'shimcha parametrlar:**
  - Gazlilik (Gazsiz, Yengil, O'rtacha, Kuchli)
  - Muz miqdori (0%, 25%, 50%, 75%, 100%)
  - Shirinlik va shakar turi (Tabiiy shakar, Stevia 0 kkal, Asal, Shakarsiz)
  - Qo'shimchalar (Popping Boba, Chia urug'lari, Vitamin C 1000mg, Kollagen)
  - Kaloriya va narx hisoblagichi

### 2. 📋 Buyurtmalar va To'lov
- Mijoz ma'lumotlari (Ism, Telefon, Manzil, Izoh)
- To'lov turlari (Payme, Click, Uzum, Naqd)
- Bayramona konfetti animatsiyasi va to'liq chek-retseptini chop etish (Print)

### 3. 🛡 Boshqaruv Paneli (Admin)
- `/admin` sahifasida barcha buyurtmalarni real vaqtda ko'rish
- Holatlarni boshqarish: `Yangi`, `Tayyorlanmoqda`, `Yetkazilmoqda`, `Yakunlandi`, `Bekor qilindi`
- Har bir buyurtmaning aniq retsepti va mg dozalarini ko'rish
- **1-bosishda Excel yuklab olish (.xlsx)** (Foydalanuvchi buyurtmalarini to'liq Excel faylga eksport qilish)
- Qidiruv va filterlash

### 4. 🤖 Telegram Bot Integratsiyasi
- Yangi buyurtma tushganda avtomatik ravishda buyurtma ID, mijoz telefoni, manzili, to'lov turi va ichimlikning mg retsepti Telegram chat/guruhga chiroyli formatda yuboriladi.

### 5. 📊 Google Sheets (Online Excel) Integratsiyasi
- Admin paneldagi sozlamalardan Google Apps Script webhook manzilini ulab, barcha buyurtmalarni to'g'ridan-to'g'ri Online Google Sheets jadvaliga avtomatik yozdirib borish mumkin.

---

## 💻 Loyihani Ishga Tushirish

Loyihaning katalogiga o'ting:
```bash
cd C:\Users\User\.gemini\antigravity\scratch\drink-constructor
```

Lokal serverni ishga tushiring:
```bash
npm run dev
```

Brauzerda oching:
- **Konstruktor:** [http://localhost:3000](http://localhost:3000)
- **Admin Panel:** [http://localhost:3000/admin](http://localhost:3000/admin)
