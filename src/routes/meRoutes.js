const express = require('express');
const { requireAuth } = require('../middleware/auth');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get('/bookings', requireAuth, bookingController.myBookings);

module.exports = { meRouter: router };
