// server/routes/contactMessages.js
import express from "express";
import { createContactMessage, listContactMessages, deleteContactMessage } from "../models/contactMessages.model.js";

const router = express.Router();

// GET list (żeby spełnić "wyświetlanie danych z bazy")
router.get("/", async (req, res, next) => {
  try {
    const items = await listContactMessages();
    res.json(items);
  } catch (e) {
    next(e);
  }
});

// POST create (formularz kontaktowy)
router.post("/", async (req, res, next) => {
  try {
    const { fullName, email, phone, message } = req.body;

    // Walidacja (prosta i wystarczająca do projektu)
    if (!fullName || fullName.trim().length < 3) {
      return res.status(400).json({ error: "Imię i nazwisko musi mieć min. 3 znaki." });
    }
    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Podaj poprawny email." });
    }
    if (!message || message.trim().length < 10) {
      return res.status(400).json({ error: "Wiadomość musi mieć min. 10 znaków." });
    }

    const saved = await createContactMessage({ fullName: fullName.trim(), email: email.trim(), phone, message: message.trim() });
    res.status(201).json(saved);
  } catch (e) {
    next(e);
  }
});

// DELETE (żeby mieć komplet CRUD na czymś prostym)
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Niepoprawne ID" });

    const ok = await deleteContactMessage(id);
    if (!ok) return res.status(404).json({ error: "Nie znaleziono wiadomości." });

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;