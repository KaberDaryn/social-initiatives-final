const mongoose = require('mongoose');
const { ROLES } = require('../constants/roles');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 120
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.USER }
  },
  { timestamps: true }
);

userSchema.methods.toSafeJSON = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    createdAt: this.createdAt
  };
};

const User = mongoose.model('User', userSchema);

module.exports = { User };
