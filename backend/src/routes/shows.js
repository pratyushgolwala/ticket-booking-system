const express = require('express');
const pool = require('../db');
const logger = require('../utils/logger');
const { BadRequestError, ConflictError, NotFoundError } = require('../utils/errors');

const router = express.Router();

// GET /shows - List all shows
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, name, start_time, total_seats, created_at FROM shows ORDER BY start_time'
    );
    
    res.json({
      shows: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /shows/:id/seats - Get all seats for a show
router.get('/:id/seats', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if show exists
    const showResult = await pool.query('SELECT id FROM shows WHERE id = $1', [id]);
    if (showResult.rows.length === 0) {
      throw new NotFoundError(`Show with id ${id} not found`);
    }
    
    const result = await pool.query(
      'SELECT id, seat_no, status FROM seats WHERE show_id = $1 ORDER BY seat_no',
      [id]
    );
    
    res.json({
      show_id: parseInt(id),
      seats: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    next(error);
  }
});

// POST /shows/:id/book - Book seats for a show
router.post('/:id/book', async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { seat_nos, user_id, immediate_confirm = true } = req.body;
    
    // Validation
    if (!seat_nos || !Array.isArray(seat_nos) || seat_nos.length === 0) {
      throw new BadRequestError('seat_nos must be a non-empty array');
    }
    
    if (!user_id) {
      throw new BadRequestError('user_id is required');
    }
    
    if (seat_nos.length > 10) {
      throw new BadRequestError('Cannot book more than 10 seats at once');
    }
    
    await client.query('BEGIN');
    
    // Check if show exists
    const showResult = await client.query('SELECT id FROM shows WHERE id = $1', [id]);
    if (showResult.rows.length === 0) {
      await client.query('ROLLBACK');
      throw new NotFoundError(`Show with id ${id} not found`);
    }
    
    // Lock the seats FOR UPDATE to prevent concurrent bookings
    const seatResult = await client.query(
      `SELECT id, seat_no, status 
       FROM seats 
       WHERE show_id = $1 AND seat_no = ANY($2::text[])
       FOR UPDATE`,
      [id, seat_nos]
    );
    
    // Check if all requested seats exist
    if (seatResult.rows.length !== seat_nos.length) {
      const foundSeats = seatResult.rows.map(s => s.seat_no);
      const missingSeats = seat_nos.filter(sn => !foundSeats.includes(sn));
      await client.query('ROLLBACK');
      throw new ConflictError(`Seats not found: ${missingSeats.join(', ')}`);
    }
    
    // Check if all seats are available
    const unavailableSeats = seatResult.rows.filter(s => s.status !== 'AVAILABLE');
    if (unavailableSeats.length > 0) {
      await client.query('ROLLBACK');
      throw new ConflictError(
        `Seats not available: ${unavailableSeats.map(s => s.seat_no).join(', ')}`
      );
    }
    
    // Create booking
    const bookingStatus = immediate_confirm ? 'CONFIRMED' : 'PENDING';
    const expiresAt = immediate_confirm ? null : new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
    
    const bookingResult = await client.query(
      `INSERT INTO bookings (show_id, user_id, status, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, status, created_at, expires_at`,
      [id, user_id, bookingStatus, expiresAt]
    );
    
    const booking = bookingResult.rows[0];
    
    // Insert booking_seats records
    const seatIds = seatResult.rows.map(s => s.id);
    const bookingSeatValues = seatIds.map((seatId, idx) => 
      `($1, $${idx + 2})`
    ).join(', ');
    
    await client.query(
      `INSERT INTO booking_seats (booking_id, seat_id)
       VALUES ${bookingSeatValues}`,
      [booking.id, ...seatIds]
    );
    
    // Update seat statuses
    const newSeatStatus = immediate_confirm ? 'BOOKED' : 'RESERVED';
    await client.query(
      `UPDATE seats 
       SET status = $1 
       WHERE id = ANY($2::int[])`,
      [newSeatStatus, seatIds]
    );
    
    await client.query('COMMIT');
    
    logger.info(`Booking ${booking.id} created: ${bookingStatus} - seats ${seat_nos.join(', ')}`);
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        id: booking.id,
        status: booking.status,
        seat_nos: seat_nos,
        created_at: booking.created_at,
        expires_at: booking.expires_at
      }
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

module.exports = router;
