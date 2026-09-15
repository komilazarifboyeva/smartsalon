# Smart Salon — Loyiha to‘liq tavsifi

> **Smart Salon** — go‘zallik salonlarini boshqarish va mijozlarga onlayn navbatga yozilish imkonini beruvchi veb-platforma.  
> Ushbu hujjat loyihadagi veb-saytning barcha qismlarini kichik detaligacha tushuntiradi.

---

## Mundarija

1. [Loyiha haqida umumiy ma’lumot](#1-loyiha-haqida-umumiy-malumot)
2. [Texnologik stack](#2-texnologik-stack)
3. [Foydalanuvchi rollari va huquqlari](#3-foydalanuvchi-rollari-va-huquqlari)
4. [Arxitektura va papka tuzilmasi](#4-arxitektura-va-papka-tuzilmasi)
5. [Marshrutlar (URL yo‘llari)](#5-marshrutlar-url-yollari)
6. [Autentifikatsiya (kirish tizimi)](#6-autentifikatsiya-kirish-tizimi)
7. [Onboarding (birinchi ro‘yxatdan o‘tish)](#7-onboarding-birinchi-royxatdan-otish)
8. [Har bir rol uchun interfeys va funksiyalar](#8-har-bir-rol-uchun-interfeys-va-funksiyalar)
9. [Band qilish (booking) jarayoni](#9-band-qilish-booking-jarayoni)
10. [Xizmatlar boshqaruvi](#10-xizmatlar-boshqaruvi)
11. [Ma’lumotlar bazasi (Firestore)](#11-malumotlar-bazasi-firestore)
12. [Xavfsizlik qoidalari (Firestore Rules)](#12-xavfsizlik-qoidalari-firestore-rules)
13. [Ko‘p tillilik (i18n)](#13-kop-tillilik-i18n)
14. [Mavzu (Light / Dark mode)](#14-mavzu-light--dark-mode)
15. [UI komponentlari va dizayn tizimi](#15-ui-komponentlari-va-dizayn-tizimi)
16. [Ommaviy salon sahifasi va username tizimi](#16-ommaviy-salon-sahifasi-va-username-tizimi)
17. [Sinov muddati va admin tasdiqlash](#17-sinov-muddati-va-admin-tasdiqlash)
18. [Deploy va hosting](#18-deploy-va-hosting)
19. [Muhit o‘zgaruvchilari (.env)](#19-muhit-ozgaruvchilari-env)
20. [Kelajakdagi funksiyalar (Coming Soon)](#20-kelajakdagi-funksiyalar-coming-soon)

---

## 1. Loyiha haqida umumiy ma’lumot

**Smart Salon** — salon rahbarlari, masterlar va mijozlar uchun mo‘ljallangan **SaaS (Software as a Service)** platformasi.

| Xususiyat | Tavsif |
|-----------|--------|
| **Maqsad** | Salonlarni raqamlashtirish: xizmatlar, masterlar, buyurtmalar va jadvalni boshqarish |
| **Ommaviy manzil** | `smartsalon.uz/s/{username}` — har bir salon rahbarining o‘z username’i |
| **Kirish usuli** | Faqat **Google** orqali (Firebase Authentication) |
| **Ma’lumotlar bazasi** | Google **Firestore** (NoSQL, real-time) |
| **Frontend** | React 19 + Vite 8 (SPA — Single Page Application) |

Platforma 4 ta asosiy foydalanuvchi turini qo‘llab-quvvatlaydi: **Mijoz**, **Master**, **Salon Rahbari** va **Bosh Admin**.

---

## 2. Texnologik stack

### Frontend

| Texnologiya | Versiya | Vazifasi |
|-------------|---------|----------|
| **React** | 19.2 | UI kutubxonasi |
| **Vite** | 8.0 | Build va dev server |
| **React Router** | 7.15 | Sahifalar orasida navigatsiya |
| **Redux Toolkit** | 2.12 | Global holat boshqaruvi (auth) |
| **Tailwind CSS** | 3.4 | Utility-first CSS |
| **Lucide React** | 1.16 | Ikonkalar |
| **i18next** | 26.2 | Ko‘p tillilik |
| **clsx** | 2.1 | Shartli CSS klasslari |

### Backend / Infrastruktura

| Xizmat | Vazifasi |
|--------|----------|
| **Firebase Auth** | Google bilan kirish |
| **Firestore** | Ma’lumotlar bazasi |
| **Firebase Hosting** | Statik fayllarni joylashtirish |
| **Firebase Storage** | Profil rasmlari (storage.rules mavjud) |

### Ishga tushirish buyruqlari

```bash
npm run dev      # Development server (Vite HMR bilan)
npm run build    # Production build → dist/ papkasi
npm run preview  # Build natijasini mahalliy ko‘rish
npm run lint     # ESLint tekshiruvi
```

---

## 3. Foydalanuvchi rollari va huquqlari

Rollar `src/constants/roles.js` faylida aniqlangan:

| Rol | Kod | Asosiy vazifalar |
|-----|-----|------------------|
| **Mijoz** | `customer` | Salonlarni ko‘rish, xizmat tanlash, navbatga yozilish, buyurtmalarni boshqarish |
| **Master** | `master` | O‘z xizmatlarini qo‘shish, buyurtmalarni boshlash/tugatish, hisobot ko‘rish |
| **Salon Rahbari** | `salon_owner` | Salon sozlamalari, xizmatlar, masterlar, taklifnomalar, barcha buyurtmalar |
| **Bosh Admin** | `big_admin` | Barcha salon egalarini ko‘rish, bloklash/yoqish, tasdiqlash (kelajakda) |

> **Muhim:** Rol onboarding paytida tanlanadi va keyinchalik o‘zgartirib bo‘lmaydi (Firestore qoidalari ham buni qattiq nazorat qiladi).

---

## 4. Arxitektura va papka tuzilmasi

```
smartsalon/
├── public/                    # Statik fayllar (favicon, redirects, .htaccess)
├── src/
│   ├── main.jsx               # Ilova kirish nuqtasi
│   ├── App.jsx                # Auth bootstrap + Router
│   ├── app/
│   │   └── store.js           # Redux store
│   ├── config/
│   │   ├── firebase.js        # Firebase sozlamalari
│   │   └── i18n.js            # Til sozlamalari
│   ├── constants/             # Doimiy qiymatlar (rollar, marshrutlar, statuslar)
│   ├── context/               # React Context (Theme)
│   ├── features/auth/         # Redux slice + thunks (auth mantiq)
│   ├── hooks/                 # useAuth, useTheme, useRoleNav
│   ├── layouts/               # Sahifa layout’lari (Public, Customer, Master, ...)
│   ├── locales/               # Tarjimalar (uz, ru, en)
│   ├── pages/                 # Sahifalar (har bir rol va onboarding uchun)
│   ├── routes/
│   │   └── AppRouter.jsx      # Barcha marshrutlar
│   ├── services/              # Firestore API qatlami
│   ├── components/            # Qayta ishlatiladigan UI komponentlar
│   ├── utils/                 # Yordamchi funksiyalar
│   └── styles/
│       └── index.css          # Tailwind + global stillar
├── firestore.rules            # Firestore xavfsizlik qoidalari
├── firestore.indexes.json     # Firestore indekslari
├── firebase.json              # Firebase deploy konfiguratsiyasi
└── package.json
```

### Ilova ishga tushish ketma-ketligi

```
main.jsx
  └── Redux Provider
       └── ThemeProvider
            └── Suspense (Loader)
                 └── App.jsx
                      ├── bootstrapAuth() — Firebase auth holatini tekshirish
                      └── AppRouter — marshrutlarga yo‘naltirish
```

---

## 5. Marshrutlar (URL yo‘llari)

Barcha yo‘llar `src/constants/routes.js` da markazlashtirilgan.

### Ommaviy sahifalar (kirish talab qilinmaydi)

| URL | Sahifa | Tavsif |
|-----|--------|--------|
| `/` | Home | Landing — asosiy reklama sahifasi |
| `/login` | Login | Google bilan kirish |
| `/unauthorized` | Unauthorized | Ruxsatsiz kirish xabari |
| `/account-disabled` | AccountDisabled | Hisob bloklangan xabari |
| `*` | NotFound | 404 sahifa |

### Onboarding (kirish qilingan, lekin ro‘yxatdan o‘tmagan)

| URL | Sahifa |
|-----|--------|
| `/onboarding/role` | Rol tanlash (Mijoz / Master / Salon Rahbari) |
| `/onboarding/customer` | Mijoz profil formasi |
| `/onboarding/owner` | Salon rahbari + username + salon yaratish |
| `/onboarding/master` | Master + taklif username kiritish |

### Mijoz paneli (`/me/*`)

| URL | Sahifa |
|-----|--------|
| `/me/dashboard` | Salonlar ro‘yxati va qidiruv |
| `/me/salons/:username` | Salon yoki master profili + band qilish |
| `/me/bookings` | Mening buyurtmalarim |
| `/me/profile` | Profil sozlamalari |

### Master paneli (`/master/*`)

| URL | Sahifa |
|-----|--------|
| `/master/dashboard` | O‘z xizmatlarini boshqarish |
| `/master/bookings` | Kunlik buyurtmalar (boshlash/tugatish) |
| `/master/reports` | Oylik hisobot (mijozlar, soatlar, daromad) |
| `/master/profile` | Profil |

### Salon Rahbari paneli (`/salon/*`)

| URL | Sahifa |
|-----|--------|
| `/salon/dashboard` | Sinov holati, ommaviy URL, salon sozlamalari |
| `/salon/bookings` | Barcha salon buyurtmalari |
| `/salon/services` | Salon darajasidagi xizmatlar |
| `/salon/masters` | Masterlar ro‘yxati (bloklash) |
| `/salon/invitations` | Master taklifnomalari yaratish/o‘chirish |
| `/salon/profile` | Profil |

### Bosh Admin paneli (`/admin/*`)

| URL | Sahifa |
|-----|--------|
| `/admin/dashboard` | Boshqaruv (hozircha bo‘sh) |
| `/admin/owners` | Salon egalari ro‘yxati + bloklash |
| `/admin/subscriptions` | Coming Soon |
| `/admin/analytics` | Coming Soon |
| `/admin/profile` | Profil |

### Marshrut himoyasi

- **ProtectedRoute** — foydalanuvchi kirganmi, onboarding tugaganmi, roli mos keladimi tekshiradi
- **PublicOnlyRoute** — kirgan foydalanuvchini login sahifasiga kiritmaydi
- **OnboardingGuard** — onboarding tugagan foydalanuvchini panelga yo‘naltiradi
- **AuthSync** — marshrut o‘zgarganda profilni yangilaydi (masalan, master bloklanganda)

---

## 6. Autentifikatsiya (kirish tizimi)

### Kirish usuli

Faqat **Google Sign-In** (Firebase Authentication popup):

1. Foydalanuvchi `/login` sahifasida "Google bilan kirish" tugmasini bosadi
2. Google popup ochiladi, hisob tanlanadi
3. Firebase `onAuthStateChanged` orqali holat kuzatiladi
4. Agar `users/{uid}` hujjati yo‘q bo‘lsa — avtomatik yaratiladi (`role: customer`, `onboardingCompleted: false`)
5. Profil Redux store’ga yoziladi

### Auth holati (Redux)

```javascript
{
  user: { uid, email, displayName, photoURL, ... },
  profile: { role, firstName, lastName, phone, salonId, username, ... },
  role: 'customer' | 'master' | 'salon_owner' | 'big_admin',
  status: 'idle' | 'loading' | 'succeeded' | 'failed',
  isBootstrapped: true/false,
  onboardingStatus: 'idle' | 'loading' | 'succeeded' | 'failed'
}
```

### Chiqish

`logout` thunk Firebase `signOut()` chaqiradi va Redux holatini tozalaydi.

### Profil yangilash

- **Ism, familiya, telefon, bio** — `updateProfile` thunk
- **Profil rasmi** — `uploadProfilePhoto` thunk (avatarService orqali)
- Salon rahbari profilini yangilaganda salonning ommaviy maydonlari ham sinxronlanadi (`syncOwnerPublicFields`)

---

## 7. Onboarding (birinchi ro‘yxatdan o‘tish)

Onboarding **2 bosqichdan** iborat:

### Bosqich 1: Rol tanlash (`/onboarding/role`)

Uchta variant:

| Rol | Keyingi sahifa | Qisqa tavsif |
|-----|----------------|--------------|
| Mijoz | `/onboarding/customer` | Salon topish va navbatga yozilish |
| Master | `/onboarding/master` | Salon rahbarining bergan taklif username kerak |
| Salon Rahbari | `/onboarding/owner` | O‘z salonini yaratish + username band qilish |

### Bosqich 2: Profil to‘ldirish

**Mijoz:**
- Ism, familiya, telefon (9 xonali, masalan `901234567`)
- `onboardingCompleted: true`, `role: customer`

**Salon Rahbari:**
- Ism, familiya, telefon, **username** (3–24 belgi, faqat `a-z`, `0-9`, `-`)
- Atomik tranzaksiya:
  1. Username band emasligini tekshirish
  2. `salons/{newId}` yaratish (30 kunlik sinov bilan)
  3. `usernames/{username}` — `type: owner`
  4. `users/{uid}` — `role: salon_owner`, `salonId`, `username`

**Master:**
- Ism, familiya, telefon, **taklif username**
- Atomik tranzaksiya:
  1. `usernames/{username}` — `type: master_invite`, `claimedBy: null` ekanligini tekshirish
  2. `claimedBy` ni o‘z uid ga o‘rnatish
  3. `users/{uid}` — `role: master`, `salonId` bog‘lash

### Username qoidalari

- Regex: `^[a-z0-9-]{3,24}$`
- Kichik harflar, raqamlar, defis
- Unikal (Firestore `usernames` kolleksiyasida document ID sifatida)

---

## 8. Har bir rol uchun interfeys va funksiyalar

### 8.1. Ommaviy sahifalar

#### Bosh sahifa (`/`)

- Hero bo‘limi: sarlavha, tagline, "Kirish" va "Imkoniyatlar" tugmalari
- 3 ta feature kartochka: Xizmatlar, Buyurtmalar, Masterlar
- Gradient fon, animatsiyalar (`animate-slide-up`)
- TopNavbar + Footer

#### Login (`/login`)

- Google bilan kirish tugmasi
- Firebase sozlanmagan bo‘lsa xato xabari
- Kirgan foydalanuvchi avtomatik panelga yo‘naltiriladi

---

### 8.2. Mijoz (Customer)

#### Dashboard (`/me/dashboard`)

- **CustomerSalonList** komponenti:
  - Barcha faol salonlar ro‘yxati
  - Qidiruv: salon nomi, username, master ismi bo‘yicha
  - Har bir salon kartasida masterlar ro‘yxati
  - Salon sahifasiga o‘tish

#### Salon profili (`/me/salons/:username`)

- Username orqali salon yoki master profilini yuklaydi
- Ko‘rsatiladi:
  - Salon nomi, manzil, telefon, ish vaqtlari
  - Salon xizmatlari (masterId = null)
  - Masterlar va ularning xizmatlari
  - Sharhlar (reviews subcollection)
  - Reyting
- **InlineBookingPanel** — xizmat tanlash va band qilish
- URL parametr: `?master=username` — ma’lum masterni highlight qilish

#### Buyurtmalar (`/me/bookings`)

- Barcha buyurtmalar ro‘yxati (sana bo‘yicha kamayish)
- Filtr: bugun, kelajak, o‘tgan, barchasi
- Har bir kartada:
  - Salon nomi, xizmat, sana/vaqt, narx, status
  - **Pending** holatda: vaqtni o‘zgartirish, bekor qilish
- Status ranglari: pending (sariq), in_progress (ko‘k), completed (yashil), cancelled (kulrang)

#### Profil (`/me/profile`)

- Ism, familiya, telefon, bio tahrirlash
- Profil rasmi yuklash
- Til va mavzu sozlamalari
- Chiqish tugmasi

---

### 8.3. Master

#### Dashboard (`/master/dashboard`)

- **ServicesManager** (`scope="master"`):
  - O‘z xizmatlarini CRUD (Create, Read, Update, Delete)
  - Narx presetlari: 50k, 100k, 150k, 200k so‘m
  - Davomiylik presetlari: 20, 30, 40, 60, 120, 120+ daqiqa

#### Buyurtmalar (`/master/bookings`)

- Sana tanlash (date picker)
- Tanlangan kundagi buyurtmalar
- Har bir buyurtma uchun:
  - **Boshlash** (`pending` → `in_progress`)
  - **Tugatish** (`in_progress` → `completed`)
- Mijoz ismi, xizmat, vaqt ko‘rsatiladi

#### Hisobot (`/master/reports`)

- Sana oralig‘i tanlash (default: joriy oy)
- Statistika kartochkalari:
  - Mijozlar soni (completed buyurtmalar)
  - Ish soatlari (durationMinutes yig‘indisi)
  - Jami daromad (servicePrice yig‘indisi)
- Completed buyurtmalar ro‘yxati

---

### 8.4. Salon Rahbari

#### Dashboard (`/salon/dashboard`)

- **Sinov holati kartochkasi:**
  - `trial` — qolgan kunlar soni
  - `pending_approval` — admin tasdiqlashi kutilmoqda
  - `approved` — tasdiqlangan
  - `rejected` — rad etilgan
- **Ommaviy URL kartochkasi:**
  - `smartsalon.uz/s/{username}`
  - Nusxalash va tashqi havola tugmalari
- **SalonSettingsForm:**
  - Salon nomi, telefon, manzil
  - Ish vaqtlari (haftaning har bir kuni uchun ochilish/yopilish)

#### Xizmatlar (`/salon/services`)

- **ServicesManager** (`scope="salon"`):
  - Salon darajasidagi xizmatlar (masterId = null)
  - Master xizmatlarining overview (**MasterServicesOverview**)

#### Masterlar (`/salon/masters`)

- Salondagi barcha masterlar ro‘yxati
- Har bir masterni **bloklash/yoqish** (`isDisabled`)

#### Taklifnomalar (`/salon/invitations`)

- Yangi master taklif username yaratish
- Mavjud takliflarni ko‘rish va o‘chirish
- Claim qilingan taklif o‘chirilsa — master ham bloklanadi

#### Buyurtmalar (`/salon/bookings`)

- Barcha salon buyurtmalari
- Filtr va qidiruv
- **Pending/in_progress** buyurtmalarni bekor qilish

---

### 8.5. Bosh Admin

#### Salon egalari (`/admin/owners`)

- Barcha `salon_owner` rolli foydalanuvchilar
- Har biri uchun bog‘langan salon ma’lumotlari
- Sinov holati, qolgan kunlar
- **Bloklash/yoqish** (`isDisabled`)

#### Dashboard, Obunalar, Analitika

Hozircha **Coming Soon** — bo‘sh placeholder sahifalar.

---

## 9. Band qilish (booking) jarayoni

### Buyurtma statuslari

| Status | Kod | Kim o‘zgartiradi |
|--------|-----|------------------|
| Kutilmoqda | `pending` | Mijoz yaratadi |
| Jarayonda | `in_progress` | Master boshlaydi |
| Tugallangan | `completed` | Master tugatadi |
| Tasdiqlangan | `confirmed` | (kelajakda) |
| Bekor qilingan | `cancelled` | Mijoz, salon rahbari |

### Band qilish oqimi (mijoz tomondan)

```
1. Salon profilida xizmat tanlash
       ↓
2. Sana tanlash (bugundan 30 kungacha)
       ↓
3. Bo‘sh vaqt slotini tanlash (15 daqiqalik qadam)
       ↓
4. Tasdiqlash → Firestore'ga booking yaratish
```

### Vaqt slotlari generatsiyasi (`utils/availability.js`)

- Salon **ish vaqtlari** (`workingHours`) asosida
- Tanlangan kunning hafta kuni tekshiriladi (yopiq kunlar slot bermaydi)
- Mavjud buyurtmalar bilan **to‘qnashuv** tekshiriladi
- O‘tgan vaqtlar slot sifatida ko‘rsatilmaydi
- Master tanlangan bo‘lsa — faqat shu masterning buyurtmalari hisobga olinadi
- Master tanlanmagan bo‘lsa — faqat `masterId = null` buyurtmalar hisobga olinadi

### Default ish vaqtlari

| Kun | Ochilish | Yopilish |
|-----|----------|----------|
| Dush–Juma | 09:00 | 20:00 |
| Shanba | 10:00 | 18:00 |
| Yakshanba | — | Yopiq |

### Buyurtma hujjati strukturasi

```javascript
{
  salonId, salonName,
  customerId, customerName, customerPhone,
  masterId, masterName,        // ixtiyoriy
  serviceId, serviceName, servicePrice, durationMinutes,
  startAt, endAt,                // Firestore Timestamp
  status: 'pending',
  createdAt, updatedAt,
  startedAt, completedAt         // status o‘zgarganda
}
```

---

## 10. Xizmatlar boshqaruvi

### Xizmat turlari

| Tur | masterId | Kim yaratadi |
|-----|----------|------------|
| Salon xizmati | `null` | Salon rahbari |
| Master xizmati | master uid | Master o‘zi |

### Xizmat maydonlari

```javascript
{
  salonId,
  masterId,           // null yoki master uid
  name,               // 1–100 belgi
  price,              // so‘m, > 0
  durationMinutes,    // >= 15
  durationPreset,     // '20', '30', '40', '60', '120', '120plus'
  createdBy,          // yaratuvchi uid
  createdAt, updatedAt
}
```

### Narx va davomiylik presetlari

**Narxlar:** 50 000, 100 000, 150 000, 200 000 so‘m (tez tanlash tugmalari)

**Davomiyliklar:** 20, 30, 40, 60, 120, 150+ daqiqa

---

## 11. Ma’lumotlar bazasi (Firestore)

### Kolleksiyalar

#### `users/{uid}`

Foydalanuvchi profili:

| Maydon | Tavsif |
|--------|--------|
| uid, email, displayName, photoURL | Firebase Auth dan |
| role | customer / master / salon_owner / big_admin |
| firstName, lastName, phone, bio | Profil ma’lumotlari |
| username | Ommaviy identifikator |
| salonId | Bog‘langan salon (master/owner uchun) |
| onboardingCompleted | true/false |
| isDisabled | Bloklangan hisob |
| createdAt, updatedAt | Vaqt belgilari |

#### `usernames/{username}`

Username bandligi va taklifnomalar:

| type | Ma’nosi |
|------|---------|
| `owner` | Salon rahbarining username’i |
| `master_invite` | Master uchun taklif (claimedBy, salonId) |

#### `salons/{salonId}`

| Maydon | Tavsif |
|--------|--------|
| ownerId, ownerUsername | Egasi |
| ownerFirstName, ownerLastName, ownerPhone, ownerBio, ownerPhotoURL | Ommaviy egasi ma’lumotlari |
| name, address, phone, description | Salon ma’lumotlari |
| workingHours | Haftalik ish jadvali |
| approvalStatus | trial / pending_approval / approved / rejected |
| trialStartedAt, trialEndsAt | 30 kunlik sinov |
| isActive | Faol/nofaol |
| rating, reviewsCount | Reyting (kelajakda) |

#### `salons/{salonId}/reviews/{reviewId}`

Sharhlar (hozircha faqat o‘qish, yozish yopiq).

#### `services/{serviceId}`

Xizmatlar (yuqorida tavsiflangan).

#### `bookings/{bookingId}`

Buyurtmalar (yuqorida tavsiflangan).

### Firestore indekslari

`firestore.indexes.json` da quyidagi composite indekslar:

- `usernames`: type + salonId
- `services`: salonId + masterId
- `bookings`: salonId + startAt, customerId + startAt, masterId + startAt
- `users`: username + role
- `salons`: ownerUsername

---

## 12. Xavfsizlik qoidalari (Firestore Rules)

`firestore.rules` fayli server-side xavfsizlikni ta’minlaydi.

### Asosiy tamoyillar

1. **Autentifikatsiya majburiy** — ko‘pchilik operatsiyalar uchun `request.auth != null`
2. **Rolga asoslangan kirish** — har bir kolleksiya uchun alohida qoidalar
3. **Maydon darajasida nazorat** — `diff().affectedKeys().hasOnly([...])` bilan faqat ruxsat etilgan maydonlar o‘zgartiriladi
4. **Onboarding himoyasi** — rol va salonId onboardingdan keyin o‘zgartirilmaydi
5. **Default deny** — `{document=**}` uchun `allow read, write: if false`

### Muhim cheklovlar

- Mijoz faqat **pending** buyurtmani o‘zgartira/bekor qila oladi
- Master faqat **o‘z buyurtmalarini** boshlash/tugatish mumkin
- Salon rahbari masterlarni faqat **isDisabled** maydoni orqali boshqaradi
- Username yaratish onboarding paytida yoki salon rahbari tomonidan (master_invite)
- Buyurtma yaratishda `startAt` hozirgi vaqtdan kamida 2 daqiqa keyin bo‘lishi kerak

---

## 13. Ko‘p tillilik (i18n)

### Qo‘llab-quvvatlanadigan tillar

| Kod | Til | Fallback |
|-----|-----|----------|
| `uz` | O‘zbekcha | ✅ Asosiy |
| `ru` | Ruscha | |
| `en` | Inglizcha | |

### Sozlash

- Tarjimalar: `src/locales/{uz,ru,en}/translation.json`
- Til aniqlash: avval `localStorage` (`smartsalon.lang`), keyin brauzer
- **LangSwitcher** komponenti — navbar’da til almashtirish

### Tarjima kalitlari tuzilmasi

```
app.*           — ilova nomi, tagline
common.*        — umumiy tugmalar
auth.*          — kirish/chiqish
roles.*         — rol nomlari
nav.*           — navigatsiya
onboarding.*    — ro‘yxatdan o‘tish
customer.*      — mijoz sahifalari
salonOwner.*    — salon rahbari
master.*        — master
bookings.*      — buyurtmalar
services.*      — xizmatlar
pages.*         — umumiy sahifalar
```

---

## 14. Mavzu (Light / Dark mode)

- **ThemeProvider** — React Context orqali global mavzu
- Saqlash: `localStorage` (`smartsalon.theme`)
- Default: tizim mavzusi (`prefers-color-scheme`)
- `document.documentElement.classList.toggle('dark')` — Tailwind dark mode
- `<meta name="theme-color">` — mobil brauzer rangi yangilanadi
- **ThemeToggle** komponenti — profil va navbar’da

---

## 15. UI komponentlari va dizayn tizimi

### Layout komponentlari

| Komponent | Vazifasi |
|-----------|----------|
| **TopNavbar** | Yuqori navigatsiya, til/mavzu, profil |
| **Sidebar** | Desktop yon panel (rollar bo‘yicha) |
| **BottomNavbar** | Mobil pastki navigatsiya |
| **Footer** | Ommaviy sahifalar footeri |

### Umumiy komponentlar

| Komponent | Vazifasi |
|-----------|----------|
| **Loader** | Yuklanish animatsiyasi (fullscreen yoki inline) |
| **Modal** | Modal oyna |
| **ConfirmDialog** | Tasdiqlash dialogi (o‘chirish, bloklash) |
| **FormField** | Label + input + icon |
| **PhoneField** | Telefon raqami (+998 prefiks) |
| **ProfileAvatar** | Profil rasmi (initial yoki rasm) |
| **LangSwitcher** | Til tanlash |
| **ThemeToggle** | Mavzu almashtirish |

### Dizayn tokenlari (Tailwind)

```css
.btn-primary     — brand rang, oq matn, shadow
.btn-secondary   — oq fon, border
.btn-ghost       — shaffof, hover fon
.card            — oq/qora fon, rounded-2xl, border, shadow-sm
.input           — standart input maydoni
```

**Brand rang:** `#d63384` (pink) — `brand-500` Tailwind konfiguratsiyasida

### Responsive dizayn

- Mobile-first yondashuv
- Desktop: Sidebar + content
- Mobil: BottomNavbar + content
- `safe-bottom` — iPhone safe area

---

## 16. Ommaviy salon sahifasi va username tizimi

### Ommaviy URL formati

```
https://smartsalon.uz/s/{username}
```

Mijoz ilovasida ichki marshrut:

```
/me/salons/{username}
/me/salons/{username}?master={masterUsername}
```

### Username aniqlash (`resolvePublicUsername`)

1. `usernames/{username}` hujjatini o‘qish
2. Agar `type: owner` → salon profili
3. Agar `type: master_invite` va `claimedBy` mavjud → master profili
4. Fallback: `salons` kolleksiyasida `ownerUsername` qidirish
5. Fallback: `users` kolleksiyasida master qidirish

### Ommaviy profilda ko‘rsatiladigan ma’lumotlar

- Salon: nom, manzil, telefon, ish vaqtlari, xizmatlar, masterlar, sharhlar, reyting
- Master: ism, bio, rasm, telefon, xizmatlar, salon manzili

---

## 17. Sinov muddati va admin tasdiqlash

### Salon yaratilganda

```javascript
approvalStatus: 'trial'
trialStartedAt: serverTimestamp()
trialEndsAt: hozir + 30 kun
isActive: true
```

### Status o‘tishlari (reja)

```
trial (30 kun)
    ↓ sinov tugagach
pending_approval
    ↓ admin tasdiqlagach
approved  yoki  rejected
```

### Sinov davomida

- Salon faol (`isActive: true`)
- Mijozlar salonni ko‘ra oladi va band qila oladi
- Dashboard’da qolgan kunlar ko‘rsatiladi

### Admin vazifalari (hozirgi holat)

- Salon egalarini ko‘rish
- Hisobni bloklash/yoqish (`isDisabled`)
- Kelajakda: `approvalStatus` ni o‘zgartirish, obuna boshqaruvi

---

## 18. Deploy va hosting

### Firebase Hosting

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

- Build: `npm run build` → `dist/` papkasi
- SPA routing: barcha yo‘llar `index.html` ga yo‘naltiriladi
- `public/_redirects` va `public/.htaccess` — qo‘shimcha redirect qoidalari

### Deploy buyruqlari

```bash
npm run build
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

## 19. Muhit o‘zgaruvchilari (.env)

`.env` faylida Firebase konfiguratsiyasi:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

> **Eslatma:** `.env` faylini git’ga commit qilmang. `isFirebaseConfigured` — konfiguratsiya to‘liqligini tekshiradi.

---

## 20. Kelajakdagi funksiyalar (Coming Soon)

Quyidagi sahifalar hozircha placeholder:

| Sahifa | Rol | Rejalashtirilgan funksiya |
|--------|-----|---------------------------|
| `/admin/subscriptions` | Bosh Admin | Obuna rejalarini boshqarish |
| `/admin/analytics` | Bosh Admin | Platforma statistikasi |
| `/admin/dashboard` | Bosh Admin | Umumiy boshqaruv paneli |

Boshqa rejalashtirilgan funksiyalar (kod izlaridan):

- Sharhlar yozish (`reviews` — hozir write: false)
- Buyurtma tasdiqlash (`confirmed` statusi mavjud, lekin UI yo‘q)
- Ommaviy URL uchun autentifikatsiyasiz kirish (hozir signed-in talab qilinadi)
- Firebase Cloud Functions (functions/ papkasi mavjud, lekin hali ishlatilmayapti)

---

## Qisqa xulosa

**Smart Salon** — to‘liq funksional salon boshqaruv platformasi bo‘lib, quyidagilarni qamrab oladi:

1. **4 rol** — mijoz, master, salon rahbari, bosh admin
2. **Google Auth** + **Firestore** backend
3. **Onboarding** — rol tanlash va profil to‘ldirish
4. **Username tizimi** — ommaviy salon/manzil
5. **Xizmatlar CRUD** — salon va master darajasida
6. **Band qilish** — vaqt slotlari, status oqimi
7. **30 kunlik sinov** — salon rahbarlari uchun
8. **Ko‘p tillilik** — uz, ru, en
9. **Dark/Light mode**
10. **Responsive** — mobil va desktop

Loyiha **React 19 + Vite 8 + Tailwind + Redux + Firebase** stack’ida qurilgan zamonaviy SPA ilovadir.

---

*Hujjat yaratilgan sana: 2026-yil 14-iyul*  
*Loyiha versiyasi: 0.0.0*
