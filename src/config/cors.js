function buildCorsOptions(corsOrigin) {
  // Allow same-origin and configured origins. Render/Netlify often uses exact origin.
  if (corsOrigin === '*') {
    return { origin: true, credentials: true };
  }

  const allowed = corsOrigin.split(',').map((o) => o.trim()).filter(Boolean);
  return {
    origin: function (origin, cb) {
      // No Origin header (e.g., curl) -> allow
      if (!origin) return cb(null, true);
      if (allowed.includes(origin)) return cb(null, true);
      return cb(new Error('CORS: Origin not allowed'));
    },
    credentials: true
  };
}

module.exports = { buildCorsOptions };
