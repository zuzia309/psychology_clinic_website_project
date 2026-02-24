import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // ===== Services =====
  const services = [
    {
      title: "Konsultacja wstępna",
      description:
        "Pierwsze spotkanie, podczas którego omawiamy Twoją sytuację i wspólnie ustalamy najlepszą formę dalszego wsparcia.",
      price: 180,
      durationMin: 60,
    },
    {
      title: "Terapia indywidualna",
      description:
        "Regularne spotkania wspierające w pracy z lękiem, stresem, obniżonym nastrojem oraz trudnościami w relacjach.",
      price: 180,
      durationMin: 60,
    },
    {
      title: "Terapia par",
      description:
        "Wsparcie w komunikacji, kryzysach, konfliktach oraz budowaniu bliskości i porozumienia w relacji.",
      price: 230,
      durationMin: 60,
    },
    {
      title: "Wsparcie młodych dorosłych",
      description:
        "Pomoc dla osób wchodzących w dorosłość: stres, presja, zagubienie, studia/praca i budowanie granic.",
      price: 160,
      durationMin: 60,
    },
    {
      title: "Konsultacja online",
      description:
        "Spotkania przez wideorozmowę. Dla osób, które wolą kontakt zdalny lub nie mogą dotrzeć stacjonarnie.",
      price: 180,
      durationMin: 60,
    },
    {
      title: "Interwencja kryzysowa",
      description:
        "Krótkoterminowe wsparcie w nagłym kryzysie: rozstanie, żałoba, utrata pracy, silny stres.",
      price: 200,
      durationMin: 60,
    },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { title: s.title },
      update: {
        description: s.description,
        price: s.price,
        durationMin: s.durationMin,
      },
      create: s,
    });
  }

  // ===== Therapists =====
  const therapists = [
    {
      name: "mgr Anna Kowalska",
      role: "psycholożka, psychoterapeutka",
      bio: "Pracuje z osobami dorosłymi doświadczającymi lęku, obniżonego nastroju, wypalenia zawodowego oraz trudności w relacjach.",
      imageUrl: "/img/zespol-osoba1.png",
    },
    {
      name: "mgr Piotr Nowak",
      role: "psycholog, psychoterapeuta",
      bio: "Wspiera osoby mierzące się ze stresem, kryzysami życiowymi oraz trudnościami w budowaniu bliskich relacji.",
      imageUrl: "/img/zespol-osoba2.png",
    },
    {
      name: "mgr Marta Wiśniewska",
      role: "psycholożka, terapeutka par",
      bio: "Pracuje z parami oraz osobami indywidualnymi, które chcą lepiej rozumieć swoje potrzeby i budować bliższe relacje.",
      imageUrl: "/img/zespol-osoba3.png",
    },
  ];

  for (const t of therapists) {
    await prisma.therapist.upsert({
      where: { name: t.name },
      update: {
        role: t.role,
        bio: t.bio,
        imageUrl: t.imageUrl,
      },
      create: t,
    });
  }

  console.log("Seed zakończony sukcesem");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });