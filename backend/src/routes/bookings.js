const express = require('express');
const pool = require('../db');
const { NotFoundError } = require('../utils/errors');

const router = express.Router();

// GET /bookings/:id - Get booking details
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Get booking info
    const bookingResult = await pool.query(
      `SELECT b.id, b.show_id, b.user_id, b.status, b.created_at, b.expires_at, s.name as show_name
       FROM bookings b
       JOIN shows s ON b.show_id = s.id
       WHERE b.id = $1`,
      [id]
    );
    
    if (bookingResult.rows.length === 0) {
      throw new NotFoundError(`Booking with id ${id} not found`);
    }
    
    const booking = bookingResult.rows[0];
    
    // Get booked seats
    const seatsResult = await pool.query(
      `SELECT s.seat_no, s.status
       FROM booking_seats bs
       JOIN seats s ON bs.seat_id = s.id
       WHERE bs.booking_id = $1
       ORDER BY s.seat_no`,
      [id]
    );
    
    res.json({
      booking: {
        id: booking.id,
        show_id: booking.show_id,
        show_name: booking.show_name,
        user_id: booking.user_id,
        status: booking.status,
        created_at: booking.created_at,
        expires_at: booking.expires_at,
        seats: seatsResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
