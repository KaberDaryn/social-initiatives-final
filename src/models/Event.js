const mongoose = require('mongoose');
const { EVENT_TYPES, EVENT_STATUS } = require('../constants/event');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 4000 },
    type: { type: String, enum: Object.values(EVENT_TYPES), default: EVENT_TYPES.OTHER },
    status: { type: String, enum: Object.values(EVENT_STATUS), default: EVENT_STATUS.DRAFT },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    location: { type: String, required: true, trim: true, maxlength: 200 },
    capacity: { type: Number, required: true, min: 1, max: 5000 },
    organizerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);

module.exports = { Event };
