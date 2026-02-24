import express from "express";
import {
  listAppointments,
  createAppointment,
  patchAppointment,
  deleteAppointment,
} from "../models/appointments.model.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const items = await listAppointments();
    res.json(items);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { fullName, email, phone, serviceId, therapistId, scheduledAt, note } = req.body;

if (!fullName || fullName.trim().length < 3) {
  return res.status(400).json({ error: "Imię i nazwisko: min. 3 znaki." });
}
const parts = fullName.trim().split(/\s+/);
if (parts.length < 2) {
  return res.status(400).json({ error: "Podaj imię i nazwisko (min. 2 słowa)." });
}

const emailStr = String(email || "").trim();
const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
if (!emailOk) {
  return res.status(400).json({ error: "Podaj poprawny adres email." });
}

const phoneStr = String(phone || "").trim();
if (phoneStr.length < 7) {
  return res.status(400).json({ error: "Podaj poprawny numer telefonu." });
}

if (!serviceId) {
  return res.status(400).json({ error: "Wybierz usługę." });
}
if (!therapistId) {
  return res.status(400).json({ error: "Wybierz terapeutę." });
}
if (!scheduledAt) {
  return res.status(400).json({ error: "Wybierz termin wizyty." });
}

const dt = new Date(scheduledAt);
if (Number.isNaN(dt.getTime())) {
  return res.status(400).json({ error: "Wybierz poprawny termin wizyty." });
}

const min = dt.getMinutes();
if (!(min === 0 || min === 30)) {
  return res.status(400).json({ error: "Wybierz godzinę tylko o :00 lub :30." });
}

const now = new Date();
const startOfTomorrow = new Date(now);
startOfTomorrow.setDate(now.getDate() + 1);
startOfTomorrow.setHours(0, 0, 0, 0);

if (dt < startOfTomorrow) {
  return res.status(400).json({ error: "Termin musi być od jutra." });
}

const minutesFromMidnight = dt.getHours() * 60 + dt.getMinutes();
const open = 10 * 60;
const close = 20 * 60;

if (minutesFromMidnight < open || minutesFromMidnight >= close) {
  return res.status(400).json({ error: "Godziny przyjęć: 10:00–20:00." });
}

const saved = await createAppointment({
  fullName: fullName.trim(),
  email: emailStr,
  phone: phoneStr,
  serviceId,
  therapistId,
  scheduledAt,
  note,
});

    res.status(201).json(saved);
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Niepoprawne ID" });

    const { scheduledAt, note } = req.body;

    if (!scheduledAt && note === undefined) {
      return res.status(400).json({ error: "Podaj scheduledAt lub note do aktualizacji." });
    }

    if (scheduledAt) {
      const dt = new Date(scheduledAt);
      if (Number.isNaN(dt.getTime())) {
        return res.status(400).json({ error: "Wybierz poprawny termin wizyty." });
      }

      const min = dt.getMinutes();
      if (!(min === 0 || min === 30)) {
        return res.status(400).json({ error: "Wybierz godzinę tylko o :00 lub :30." });
      }

      const now = new Date();
      const startOfTomorrow = new Date(now);
      startOfTomorrow.setDate(now.getDate() + 1);
      startOfTomorrow.setHours(0, 0, 0, 0);

      if (dt < startOfTomorrow) {
        return res.status(400).json({ error: "Termin musi być od jutra." });
      }

      const minutesFromMidnight = dt.getHours() * 60 + dt.getMinutes();
      const open = 10 * 60;
      const close = 20 * 60;

      if (minutesFromMidnight < open || minutesFromMidnight >= close) {
        return res.status(400).json({ error: "Godziny przyjęć: 10:00–20:00." });
      }
    }

    const updated = await patchAppointment(id, { scheduledAt, note });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Niepoprawne ID" });

    await deleteAppointment(id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;