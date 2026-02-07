const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    update: { type: mongoose.Schema.Types.ObjectId, ref: 'Update', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true, minlength: 1, maxlength: 800 }
  },
  { timestamps: true }
);

commentSchema.index({ update: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = { Comment };
