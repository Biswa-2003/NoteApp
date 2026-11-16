import express from "express";
import cors from "cors";
import notesRouter from "./routes/notes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// CORS_ORIGIN can be one origin or a comma-separated list.
const allowedOrigins = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/notes", notesRouter);

// Unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

export default app;
