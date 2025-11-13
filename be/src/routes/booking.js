// routes/booking.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createBooking,
    confirmBooking,
    myBookings,
    coachBookings,
    coachList,
    getCreateBooking,
    cancelBooking
} = require('../controller/bookingController');

// create booking (member)
router.post('/', auth, createBooking);

// member view own bookings
router.get('/me', auth, myBookings);


//fetch data table booking
router.get('/my_bookings', auth, getCreateBooking
);
// coach view bookings for them (assumes auth user is coach)
router.get('/coaches', auth, coachBookings);

// NEW: list coaches with booking summary
router.get('/coachlist', coachList);

// confirm booking (coach or admin)
router.post('/:id/confirm', auth, confirmBooking);

router.delete(
    '/:id', // booking_id
    auth,
    cancelBooking // 2. Chuyển cho Controller
);
module.exports = router;
