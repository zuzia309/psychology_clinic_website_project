// server/routes/services.js
import { Router } from "express";
import {
  listServices,
  getServiceById,
  createService,
  patchService,
  deleteService,
} from "../models/services.model.js";
import { requireFields } from "../middleware/validate.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    res.json(await listServices());
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const item = await getServiceById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Service not found" });
    res.json(item);
  } catch (e) { next(e); }
});

router.post("/", requireFields(["title", "description", "price", "durationMin"]), async (req, res, next) => {
  try {
    res.status(201).json(await createService(req.body));
  } catch (e) { next(e); }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const item = await patchService(Number(req.params.id), req.body);
    if (!item) return res.status(404).json({ error: "Service not found" });
    res.json(item);
  } catch (e) { next(e); }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const ok = await deleteService(Number(req.params.id));
    if (!ok) return res.status(404).json({ error: "Service not found" });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;