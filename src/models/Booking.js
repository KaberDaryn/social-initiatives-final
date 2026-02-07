const mongoose = require('mongoose');

const BOOKING_STATUS = Object.freeze({
  ACTIVE: 'active',
  CANCELLED: 'cancelled'
});

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    status: { type: String, enum: Object.values(BOOKING_STATUS), default: BOOKING_STATUS.ACTIVE },
    attended: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Allow only one ACTIVE booking per user per event.
bookingSchema.index(
  { user: 1, event: 1 },
  {
    unique: true,
    partialFilterExpression: { status: BOOKING_STATUS.ACTIVE }
  }
);

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = { Booking, BOOKING_STATUS };
