const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema(
  {
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    content: { type: String, required: true, trim: true, minlength: 5, maxlength: 4000 }
  },
  { timestamps: true }
);

updateSchema.index({ event: 1, createdAt: -1 });

const Update = mongoose.model('Update', updateSchema);

module.exports = { Update };
