import { useState } from "react";
import { EditIcon, TrashIcon } from "./Icons.jsx";

// Accent colors for the line at the top of each card
const ACCENTS = ["#8b5cf6", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];

// Pick the same accent color for a note every time, based on its id
function accentFor(id) {
  let sum = 0;
  for (const char of id) {
    sum += char.charCodeAt(0);
  }
  return ACCENTS[sum % ACCENTS.length];
}

const relativeTime = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

// "just now", "5 minutes ago", "yesterday", ...
function timeAgo(value) {
  const seconds = Math.round((new Date(value) - Date.now()) / 1000);
  const units = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];

  for (const [unit, unitSeconds] of units) {
    if (Math.abs(seconds) >= unitSeconds) {
      return relativeTime.format(Math.round(seconds / unitSeconds), unit);
    }
  }
  return "just now";
}

// Max tilt angle in degrees for the 3D hover effect
const MAX_TILT = 6;

// Tilt the card toward the mouse and move the light sheen,
// by setting CSS variables used in index.css
function handleTilt(event) {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width; // 0 to 1
  const y = (event.clientY - rect.top) / rect.height;

  card.style.setProperty("--rx", `${(0.5 - y) * MAX_TILT}deg`);
  card.style.setProperty("--ry", `${(x - 0.5) * MAX_TILT}deg`);
  card.style.setProperty("--mx", `${x * 100}%`);
  card.style.setProperty("--my", `${y * 100}%`);
}

function resetTilt(event) {
  event.currentTarget.style.setProperty("--rx", "0deg");
  event.currentTarget.style.setProperty("--ry", "0deg");
}

export default function NoteCard({ note, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const accentStyle = { "--accent": accentFor(note.id) };
  const wasEdited = note.updatedAt !== note.createdAt;

  function startEditing() {
    setTitle(note.title);
    setContent(note.content);
    setError("");
    setIsEditing(true);
  }

  function cancelEditing() {
    setError("");
    setIsEditing(false);
  }

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      setError("Title and content cannot be empty.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await onUpdate(note.id, { title, content });
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${note.title}"?`)) {
      return;
    }

    setBusy(true);
    setError("");
    try {
      await onDelete(note.id);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (isEditing) {
    return (
      <article className="card note-card editing" style={accentStyle}>
        <input
          type="text"
          aria-label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={busy}
          autoFocus
        />
        <textarea
          rows={4}
          aria-label="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={busy}
        />

        {error && <p className="form-error">{error}</p>}

        <div className="edit-actions">
          <button className="btn btn-ghost" onClick={cancelEditing} disabled={busy}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </article>
    );
  }

  return (
    <article
      className="card note-card"
      style={accentStyle}
      onMouseMove={handleTilt}
      onMouseLeave={resetTilt}
    >
      <h3>{note.title}</h3>
      <p className="note-content">{note.content}</p>

      {error && <p className="form-error">{error}</p>}

      <footer className="note-footer">
        <time
          className="note-date"
          dateTime={note.updatedAt}
          title={new Date(note.updatedAt).toLocaleString()}
        >
          {wasEdited ? `Edited ${timeAgo(note.updatedAt)}` : timeAgo(note.createdAt)}
        </time>

        <div className="icon-actions">
          <button
            className="icon-btn"
            onClick={startEditing}
            disabled={busy}
            aria-label="Edit note"
            title="Edit"
          >
            <EditIcon size={16} />
          </button>
          <button
            className="icon-btn icon-btn-danger"
            onClick={handleDelete}
            disabled={busy}
            aria-label="Delete note"
            title="Delete"
          >
            <TrashIcon size={16} />
          </button>
        </div>
      </footer>
    </article>
  );
}
