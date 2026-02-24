import express from "express";
import {
  listAppointments,
  createAppointment,
  patchAppointment,
  deleteAppointment,
} from "../models/appointments.model.js";

const router = express.Router();

function normPhone(v) {
  // usuń spacje, myślniki itd.
  return String(v || "").replace(/[^\d+]/g, "").trim();
}

// (opcjonalnie) endpoint do podglądu wszystkich wizyt (admin / dev)
// Uwaga: front może korzystać z /api/appointments do wyliczania zajętych godzin.
router.get("/", async (req, res, next) => {
  try {
    const items = await listAppointments();
    res.json(items);
  } catch (e) {
    next(e);
  }
});

// LOOKUP: ID + telefon
router.post("/lookup", async (req, res, next) => {
  try {
    const id = Number(req.body?.id);
    const phone = normPhone(req.body?.phone);

    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ error: "Podaj poprawny numer rezerwacji." });
    }
    if (phone.length < 7) {
      return res.status(400).json({ error: "Podaj poprawny numer telefonu." });
    }

    const items = await listAppointments();
    const found = items.find((a) => a.id === id);

    if (!found) {
      return res.status(404).json({ error: "Nie znaleziono wizyty." });
    }

    const dbPhone = normPhone(found.phone);
    if (dbPhone !== phone) {
      return res
        .status(403)
        .json({ error: "Niepoprawny numer telefonu dla tej rezerwacji." });
    }

    return res.json(found);
  } catch (e) {
    next(e);
  }
});

// CREATE
router.post("/", async (req, res, next) => {
  try {
    const { fullName, email, phone, serviceId, therapistId, scheduledAt, note } =
      req.body;

    if (!fullName || fullName.trim().length < 3) {
      return res.status(400).json({ error: "Imię i nazwisko: min. 3 znaki." });
    }
    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 2) {
      return res
        .status(400)
        .json({ error: "Podaj imię i nazwisko (min. 2 słowa)." });
    }

    const emailStr = String(email || "").trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
    if (!emailOk) {
      return res.status(400).json({ error: "Podaj poprawny adres email." });
    }

    const phoneStr = String(phone || "").trim();
    if (normPhone(phoneStr).length < 7) {
      return res.status(400).json({ error: "Podaj poprawny numer telefonu." });
    }

    if (!serviceId) return res.status(400).json({ error: "Wybierz usługę." });
    if (!therapistId)
      return res.status(400).json({ error: "Wybierz terapeutę." });
    if (!scheduledAt)
      return res.status(400).json({ error: "Wybierz termin wizyty." });

    const dt = new Date(scheduledAt);
    if (Number.isNaN(dt.getTime())) {
      return res.status(400).json({ error: "Wybierz poprawny termin wizyty." });
    }

    // tylko pełna godzina
    if (dt.getMinutes() !== 0) {
      return res
        .status(400)
        .json({ error: "Wybierz godzinę tylko o pełnej godzinie (:00)." });
    }

    // od jutra
    const now = new Date();
    const startOfTomorrow = new Date(now);
    startOfTomorrow.setDate(now.getDate() + 1);
    startOfTomorrow.setHours(0, 0, 0, 0);
    if (dt < startOfTomorrow) {
      return res.status(400).json({ error: "Termin musi być od jutra." });
    }

    // niedziela OFF
    if (dt.getDay() === 0) {
      return res.status(400).json({ error: "W niedziele poradnia jest nieczynna." });
    }

    // godziny: 10:00–20:00, ostatnia startowa 19:00
    const minutesFromMidnight = dt.getHours() * 60 + dt.getMinutes();
    const open = 10 * 60;
    const close = 20 * 60;
    if (minutesFromMidnight < open || minutesFromMidnight >= close) {
      return res
        .status(400)
        .json({ error: "Godziny przyjęć: 10:00–20:00 (ostatnia: 19:00)." });
    }

    const saved = await createAppointment({
      fullName: fullName.trim(),
      email: emailStr,
      phone: phoneStr.trim(),
      serviceId,
      therapistId,
      scheduledAt,
      note,
    });

    res.status(201).json(saved);
  } catch (e) {
    // Prisma unique constraint (termin zajęty u terapeuty)
    if (e?.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Ten termin jest już zajęty dla wybranego terapeuty." });
    }
    next(e);
  }
});

// PATCH zabezpieczony telefonem (z lookup)
router.patch("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Niepoprawne ID" });
    }

    const phone = normPhone(req.body?.phone);
    if (phone.length < 7) {
      return res
        .status(400)
        .json({ error: "Podaj numer telefonu (weryfikacja rezerwacji)." });
    }

    const items = await listAppointments();
    const found = items.find((a) => a.id === id);
    if (!found) return res.status(404).json({ error: "Nie znaleziono wizyty." });

    if (normPhone(found.phone) !== phone) {
      return res
        .status(403)
        .json({ error: "Niepoprawny numer telefonu dla tej rezerwacji." });
    }

    const { scheduledAt, note } = req.body;

    if (!scheduledAt && note === undefined) {
      return res
        .status(400)
        .json({ error: "Podaj scheduledAt lub note do aktualizacji." });
    }

    if (scheduledAt) {
      const dt = new Date(scheduledAt);
      if (Number.isNaN(dt.getTime())) {
        return res.status(400).json({ error: "Wybierz poprawny termin wizyty." });
      }

      if (dt.getMinutes() !== 0) {
        return res
          .status(400)
          .json({ error: "Wybierz godzinę tylko o pełnej godzinie (:00)." });
      }

      const now = new Date();
      const startOfTomorrow = new Date(now);
      startOfTomorrow.setDate(now.getDate() + 1);
      startOfTomorrow.setHours(0, 0, 0, 0);
      if (dt < startOfTomorrow) {
        return res.status(400).json({ error: "Termin musi być od jutra." });
      }

      if (dt.getDay() === 0) {
        return res.status(400).json({ error: "W niedziele poradnia jest nieczynna." });
      }

      const minutesFromMidnight = dt.getHours() * 60 + dt.getMinutes();
      const open = 10 * 60;
      const close = 20 * 60;
      if (minutesFromMidnight < open || minutesFromMidnight >= close) {
        return res
          .status(400)
          .json({ error: "Godziny przyjęć: 10:00–20:00 (ostatnia: 19:00)." });
      }
    }

    const updated = await patchAppointment(id, { scheduledAt, note });
    res.json(updated);
  } catch (e) {
    // Prisma unique constraint (termin zajęty u terapeuty)
    if (e?.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Ten termin jest już zajęty dla wybranego terapeuty." });
    }
    next(e);
  }
});

// DELETE zabezpieczony telefonem (query: ?phone=... lub body)
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Niepoprawne ID" });
    }

    const phone = normPhone(req.query?.phone || req.body?.phone);
    if (phone.length < 7) {
      return res
        .status(400)
        .json({ error: "Podaj numer telefonu (weryfikacja rezerwacji)." });
    }

    const items = await listAppointments();
    const found = items.find((a) => a.id === id);
    if (!found) return res.status(404).json({ error: "Nie znaleziono wizyty." });

    if (normPhone(found.phone) !== phone) {
      return res
        .status(403)
        .json({ error: "Niepoprawny numer telefonu dla tej rezerwacji." });
    }

    await deleteAppointment(id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;