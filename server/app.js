import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import therapistsRouter from "./routes/therapists.js";
import servicesRouter from "./routes/services.js";
import appointmentsRouter from "./routes/appointments.js";
import contactRouter from "./routes/contactMessages.js";

import { notFound, errorHandler } from "./middleware/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// API
app.use("/api/therapists", therapistsRouter);
app.use("/api/services", servicesRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/contact", contactRouter);

// FRONT
app.use(express.static(path.join(__dirname, "../public")));

// błędy
app.use(notFound);
app.use(errorHandler);

export default app;