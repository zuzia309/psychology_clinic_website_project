## Harmonia – strona poradni psychologicznej

„Harmonia” to projekt strony poradni psychologicznej połączonej z systemem rezerwacji wizyt. Oprócz części informacyjnej (oferta, zespół, kontakt) umożliwia wybór terminu wizyty oraz bezpieczne zarządzanie rezerwacją po weryfikacji numerem rezerwacji i telefonu.

---
## Funkcje

- **Rezerwacja wizyt** z wyborem daty i godziny w formie wygodnych „chipsów”.
- **Dostępność terminów na żywo** – zajęte godziny są automatycznie blokowane dla wybranego terapeuty (brak podwójnych rezerwacji).
- **Bezpieczne zarządzanie rezerwacją** – podgląd, edycja i anulowanie wizyty dostępne dopiero po weryfikacji numerem rezerwacji (ID) i telefonem.
- **Zasady przyjęć wbudowane w formularz** – niedziele wyłączone, terminy od jutra, zakres godzin zgodny z godzinami pracy.
- **Kontakt** – formularz zapisuje wiadomości w bazie danych z walidacją podstawowych pól.

---

## Technologie

- **Backend**: Node.js, Express.js, Prisma ORM
- **Frontend**: HTML, CSS, JavaScript
- **Baza danych**: SQLite (przez Prisma)

---

## Struktura projektu

```
projekt_poradnia/
├── public/                         
│   ├── index.html
│   ├── Oferta/
│   ├── O_nas/                       
│   ├── Zespol/
│   ├── Wizyty/
│   ├── Kontakt/
│   ├── style.css                    
│   └── js/
│       ├── api.js
│       ├── wizyty.js
│       └── kontakt.js
├── server/                          
│   ├── index.js
│   ├── app.js
│   ├── prismaClient.js             
│   ├── routes/
│   │   ├── appointments.js
│   │   ├── services.js
│   │   ├── therapists.js
│   │   └── contact.js
│   └── models/
│       ├── appointments.model.js
│       ├── services.model.js
│       ├── therapists.model.js
│       └── contactMessages.model.js # (u Ciebie tak się nazywał model w grep)
├── prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/
├── scripts/                        
│   └── clearAppointments.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Uruchomienie projektu

### Wymagania
- Node.js
- npm

### Instalacja
W folderze projektu:

```bash
npm install
```

### Konfiguracja `.env`
Utwórz plik `.env` na podstawie `.env.example`, np.:

```env
DATABASE_URL="file:./dev.db"
PORT=3001
```

### Baza danych (migracje + seed)
Zastosuj migracje i wypełnij bazę danymi startowymi:
```bash
npx prisma migrate deploy
npx prisma db seed
```

### Start serwera
```bash
npm start
```

Serwer działa domyślnie pod:
- `http://localhost:3001`

### Frontend
Otwórz w przeglądarce:
- `public/index.html`

### Skrypt pomocniczy (dev)

W `scripts/` znajduje się prosty skrypt używany podczas pracy nad projektem:

- `scripts/clear-appointments.js` – czyści tabelę `Appointment` (usuwa wszystkie wizyty), żeby szybko wyzerować dane testowe.

Uruchomienie:
```bash
node scripts/clear-appointments.js
```
---

## Przykładowe endpointy API

- `GET /api/services` – lista usług  
- `GET /api/therapists` – lista terapeutów  
- `POST /api/appointments` – utworzenie wizyty  
- `POST /api/appointments/lookup` – wyszukanie wizyty po **{ id, phone }**  
- `PATCH /api/appointments/:id` – edycja wizyty (wymaga telefonu)  
- `DELETE /api/appointments/:id?phone=...` – anulowanie wizyty (wymaga telefonu)

---

## Baza danych (Prisma)

- **Service**: id, title, description, price, durationMin, createdAt, appointments
- **Therapist**: id, name, role, bio, imageUrl, createdAt, appointments  
- **Appointment**: id, fullName, email, phone, note, scheduledAt, createdAt, therapistId, serviceId, therapist, service  
- **ContactMessage**: id, fullName, email, phone, message, createdAt  

### Relacje
- `Appointment` **należy do** jednego `Therapist` i jednej `Service`.
- `Therapist` **ma wiele** `Appointment`.
- `Service` **ma wiele** `Appointment`.


---

## Autor
Zuzanna Czerwińska
