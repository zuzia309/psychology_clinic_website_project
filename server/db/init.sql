PRAGMA foreign_keys = ON;

-- 1) ZESPÓŁ
CREATE TABLE IF NOT EXISTS therapists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT NOT NULL,
  photo_url TEXT
);

-- 2) OFERTA
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_min INTEGER NOT NULL CHECK (duration_min > 0),
  price_pln INTEGER NOT NULL CHECK (price_pln >= 0)
);

-- 3) REZERWACJE / ZAPYTANIA (relacja: therapist + service)
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  message TEXT,
  preferred_date TEXT,            -- np. "2026-02-10"
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','confirmed','cancelled')),
  therapist_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (therapist_id) REFERENCES therapists(id) ON DELETE RESTRICT,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
);

-- Dane startowe (żeby od razu było co wyświetlać na stronie)
INSERT INTO therapists (full_name, role, bio, photo_url)
SELECT 'dr Anna Nowak', 'Psycholog, psychoterapeutka', 'Pracuje z lękiem, stresem i obniżonym nastrojem. Podejście empatyczne i nastawione na bezpieczeństwo.', '/img/osoba1.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM therapists WHERE full_name='dr Anna Nowak');

INSERT INTO therapists (full_name, role, bio, photo_url)
SELECT 'mgr Kamil Zieliński', 'Psycholog, terapia par', 'Wspiera pary w komunikacji, konfliktach i odbudowie zaufania. Praca w atmosferze szacunku i spokoju.', '/img/osoba2.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM therapists WHERE full_name='mgr Kamil Zieliński');

INSERT INTO therapists (full_name, role, bio, photo_url)
SELECT 'mgr Julia Wiśniewska', 'Psycholog, młodzi dorośli', 'Pomaga w kryzysach życiowych, przytłoczeniu, presji i budowaniu granic. Szczególnie bliska praca ze studentami.', '/img/osoba3.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM therapists WHERE full_name='mgr Julia Wiśniewska');

INSERT INTO services (title, description, duration_min, price_pln)
SELECT 'Konsultacja wstępna', 'Pierwsze spotkanie, na którym omawiamy trudność i wspólnie wybieramy najlepszą formę wsparcia.', 50, 180
WHERE NOT EXISTS (SELECT 1 FROM services WHERE title='Konsultacja wstępna');

INSERT INTO services (title, description, duration_min, price_pln)
SELECT 'Terapia indywidualna', 'Regularna praca nad emocjami, schematami i relacjami – we własnym tempie i w bezpiecznej atmosferze.', 50, 180
WHERE NOT EXISTS (SELECT 1 FROM services WHERE title='Terapia indywidualna');

INSERT INTO services (title, description, duration_min, price_pln)
SELECT 'Terapia par', 'Wsparcie w komunikacji, konfliktach, kryzysach zaufania i odbudowie bliskości.', 75, 230
WHERE NOT EXISTS (SELECT 1 FROM services WHERE title='Terapia par');

INSERT INTO services (title, description, duration_min, price_pln)
SELECT 'Wsparcie młodych dorosłych', 'Wsparcie w przeciążeniu, presji, zmianach życiowych, budowaniu granic i poczuciu sprawczości.', 50, 160
WHERE NOT EXISTS (SELECT 1 FROM services WHERE title='Wsparcie młodych dorosłych');

INSERT INTO services (title, description, duration_min, price_pln)
SELECT 'Konsultacja online', 'Spotkanie w formie wideorozmowy – zasady poufności i pracy jak stacjonarnie.', 50, 180
WHERE NOT EXISTS (SELECT 1 FROM services WHERE title='Konsultacja online');

INSERT INTO services (title, description, duration_min, price_pln)
SELECT 'Interwencja kryzysowa', 'Krótkoterminowe wsparcie w sytuacji nagłego stresu, straty lub silnego kryzysu.', 60, 200
WHERE NOT EXISTS (SELECT 1 FROM services WHERE title='Interwencja kryzysowa');