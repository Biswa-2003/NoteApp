import { useEffect, useState } from "react";
import * as api from "./api.js";
import NoteForm from "./components/NoteForm.jsx";
import NoteCard from "./components/NoteCard.jsx";
import { NoteIcon } from "./components/Icons.jsx";

export default function App() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadNotes() {
    setLoading(true);
    setError("");
    try {
      const data = await api.getNotes();
      setNotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  async function handleAdd(note) {
    const created = await api.createNote(note);
    setNotes((current) => [created, ...current]);
  }

  async function handleUpdate(id, note) {
    const updated = await api.updateNote(id, note);
    setNotes((current) => current.map((n) => (n.id === id ? updated : n)));
  }

  async function handleDelete(id) {
    await api.deleteNote(id);
    setNotes((current) => current.filter((n) => n.id !== id));
  }

  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          <NoteIcon size={22} />
        </div>
        <h1>Notes</h1>
        {!loading && !error && <span className="count">{notes.length}</span>}
      </header>

      <NoteForm onAdd={handleAdd} />

      <section className="notes">
        {loading && (
          <div className="note-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card skeleton">
                <div className="skeleton-line short" />
                <div className="skeleton-line" />
                <div className="skeleton-line" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="card status status-error">
            <p>{error}</p>
            <button className="btn" onClick={loadNotes}>
              Try again
            </button>
          </div>
        )}

        {!loading && !error && notes.length === 0 && (
          <div className="card status">
            <div className="status-icon">
              <NoteIcon size={28} />
            </div>
            <h2>No notes yet</h2>
            <p>Write your first note above to get started.</p>
          </div>
        )}

        {!loading && !error && notes.length > 0 && (
          <div className="note-grid">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
