// Base URL of the backend, e.g. https://api.example.com
// Set it in .env as VITE_API_URL. Trailing slashes are removed.
const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

// Small wrapper around fetch that throws a readable error on failure.
async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("Could not reach the server. Is the API running?");
  }

  // 204 No Content has no body
  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed (${response.status})`);
  }
  return data;
}

export function getNotes() {
  return request("/api/notes");
}

export function createNote(note) {
  return request("/api/notes", {
    method: "POST",
    body: JSON.stringify(note),
  });
}

export function updateNote(id, note) {
  return request(`/api/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(note),
  });
}

export function deleteNote(id) {
  return request(`/api/notes/${id}`, { method: "DELETE" });
}
