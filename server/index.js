// server/index.js
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Server działa: http://localhost:${PORT}`);
});