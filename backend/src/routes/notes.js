import { Router } from "express";
import { prisma } from "../db.js";

const router = Router();

// Returns an error message if the body is invalid, otherwise null.
function validateNote(body) {
  const { title, content } = body ?? {};

  if (typeof title !== "string" || title.trim() === "") {
    return "Title is required and must be a non-empty string";
  }
  if (typeof content !== "string" || content.trim() === "") {
    return "Content is required and must be a non-empty string";
  }
  return null;
}

// Prisma throws P2025 when a record to update/delete does not exist.
function isNotFound(err) {
  return err?.code === "P2025";
}

// GET /api/notes - all notes, newest first
router.get("/", async (req, res) => {
  const notes = await prisma.note.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(notes);
});

// POST /api/notes - create a note
router.post("/", async (req, res) => {
  const error = validateNote(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  const note = await prisma.note.create({
    data: {
      title: req.body.title.trim(),
      content: req.body.content.trim(),
    },
  });
  res.status(201).json(note);
});

// PUT /api/notes/:id - update a note
router.put("/:id", async (req, res) => {
  const error = validateNote(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: {
        title: req.body.title.trim(),
        content: req.body.content.trim(),
      },
    });
    res.json(note);
  } catch (err) {
    if (isNotFound(err)) {
      return res.status(404).json({ error: "Note not found" });
    }
    throw err;
  }
});

// DELETE /api/notes/:id - delete a note
router.delete("/:id", async (req, res) => {
  try {
    await prisma.note.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    if (isNotFound(err)) {
      return res.status(404).json({ error: "Note not found" });
    }
    throw err;
  }
});

export default router;
