// server/routes/therapists.js
import { Router } from "express";
import {
  listTherapists,
  getTherapistById,
  createTherapist,
  patchTherapist,
  deleteTherapist,
} from "../models/therapists.model.js";
import { requireFields } from "../middleware/validate.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    res.json(await listTherapists());
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const item = await getTherapistById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Therapist not found" });
    res.json(item);
  } catch (e) { next(e); }
});

router.post("/", requireFields(["name", "role", "bio"]), async (req, res, next) => {
  try {
    res.status(201).json(await createTherapist(req.body));
  } catch (e) { next(e); }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const item = await patchTherapist(Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ error: "Therapist not found" });
    res.json(item);
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const ok = await deleteTherapist(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: "Therapist not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;