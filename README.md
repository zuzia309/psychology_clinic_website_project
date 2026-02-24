## Harmonia – strona poradni psychologicznej

"Harmonia” to projekt strony poradni psychologicznej połączonej z systemem rezerwacji wizyt. Oprócz części informacyjnej (oferta, zespół, kontakt) umożliwia wybór terminu wizyty oraz bezpieczne zarządzanie rezerwacją po weryfikacji numerem rezerwacji i telefonu.
---

## Funkcje

- **Rezerwacja wizyt** z wyborem daty i godziny w formie wygodnych „chipsów”.
- **Dostępność terminów na żywo** – zajęte godziny są automatycznie blokowane dla wybranego terapeuty (brak podwójnych rezerwacji).
- **Zasady przyjęć wbudowane w formularz** – niedziele wyłączone, terminy od jutra, zakres godzin zgodny z godzinami pracy.
- **Bezpieczne zarządzanie rezerwacją** – podgląd, edycja i anulowanie wizyty dostępne dopiero po weryfikacji numerem rezerwacji (ID) i telefonem.
- **Kontakt** – formularz zapisuje wiadomości w bazie danych z walidacją podstawowych pól.

---

## Technologie

- **Backend**: Node.js, Express.js, Prisma ORM
- **Frontend**: HTML, CSS, JavaScript (Fetch API)
- **Baza danych**: SQLite (przez Prisma)

---

## Struktura projektu

```
projekt_poradnia/
├── public/                     # frontend: strony + style + JS
│   ├── index.html
│   ├── Oferta/
│   ├── O nas/
│   ├── Zespol/
│   ├── Wizyty/
│   ├── Kontakt/
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
│   ├── models/
│       ├── appointments.model.js
│       ├── services.model.js
│       ├── therapists.model.js
│       └── contact.model.js
│   
├── prisma/
│   ├── schema.prisma
│   ├── seed.js
│   └── migrations/          
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
(albo użyj Live Server w VS Code)

---

## Przykładowe endpointy API

- `GET /api/services` – lista usług  
- `GET /api/therapists` – lista terapeutów  
- `POST /api/appointments` – utworzenie wizyty  
- `POST /api/appointments/lookup` – wyszukanie wizyty po **{ id, phone }**  
- `PATCH /api/appointments/:id` – edycja wizyty (wymaga telefonu w body)  
- `DELETE /api/appointments/:id?phone=...` – anulowanie wizyty (wymaga telefonu)

---

## Baza danych (Prisma)

- **Service**: title, description, price, durationMin  
- **Therapist**: name  
- **Appointment**: fullName, email, phone, scheduledAt, therapistId, serviceId  
- **ContactMessage**: fullName, email, phone, message  

Wizyta (**Appointment**) ma relacje do **Service** i **Therapist**.

---

## Autor
Zuzanna Czerwińska
