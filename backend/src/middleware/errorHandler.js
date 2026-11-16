// Central error handler. Logs the real error on the server,
// but only sends a safe message to the client (no stack traces).
export function errorHandler(err, req, res, next) {
  // Invalid JSON in the request body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Request body must be valid JSON" });
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
