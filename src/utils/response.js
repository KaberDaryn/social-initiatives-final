function ok(res, data, meta) {
  return res.status(200).json({ success: true, data, meta });
}

function created(res, data) {
  return res.status(201).json({ success: true, data });
}

module.exports = { ok, created };
