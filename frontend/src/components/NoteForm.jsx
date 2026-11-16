import { useState } from "react";
import { PlusIcon } from "./Icons.jsx";

export default function NoteForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError("Please enter both a title and some content.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onAdd({ title, content });
      setTitle("");
      setContent("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card composer" onSubmit={handleSubmit}>
      <input
        className="composer-title"
        type="text"
        placeholder="Note title"
        aria-label="Note title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={saving}
      />
      <textarea
        className="composer-content"
        placeholder="Write something…"
        aria-label="Note content"
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={saving}
      />

      <div className="composer-footer">
        {error ? <p className="form-error">{error}</p> : <span />}
        <button type="submit" className="btn btn-primary" disabled={saving}>
          <PlusIcon size={16} />
          {saving ? "Adding…" : "Add note"}
        </button>
      </div>
    </form>
  );
}
