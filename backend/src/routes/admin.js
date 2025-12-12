const express = require('express');
const pool = require('../db');
const logger = require('../utils/logger');
const { BadRequestError } = require('../utils/errors');

const router = express.Router();

// POST /admin/shows - Create a new show with seats
router.post('/shows', async (req, res, next) => {
  const client = await pool.connect();
  
  try {
    const { name, start_time, total_seats } = req.body;
    
    // Validation
    if (!name || !start_time || !total_seats) {
      throw new BadRequestError('Missing required fields: name, start_time, total_seats');
    }
    
    if (total_seats < 1 || total_seats > 1000) {
      throw new BadRequestError('total_seats must be between 1 and 1000');
    }
    
    await client.query('BEGIN');
    
    // Insert show
    const showResult = await client.query(
      'INSERT INTO shows (name, start_time, total_seats) VALUES ($1, $2, $3) RETURNING *',
      [name, start_time, total_seats]
    );
    
    const show = showResult.rows[0];
    
    // Insert seats for the show
    const seatValues = [];
    const seatParams = [];
    for (let i = 1; i <= total_seats; i++) {
      seatValues.push(`($1, $${i + 1}, 'AVAILABLE')`);
      seatParams.push(i.toString());
    }
    
    const seatQuery = `
      INSERT INTO seats (show_id, seat_no, status)
      VALUES ${seatValues.join(', ')}
    `;
    
    await client.query(seatQuery, [show.id, ...seatParams]);
    
    await client.query('COMMIT');
    
    logger.info(`Created show ${show.id} with ${total_seats} seats`);
    
    res.status(201).json({
      message: 'Show created successfully',
      show: {
        id: show.id,
        name: show.name,
        start_time: show.start_time,
        total_seats: show.total_seats,
        created_at: show.created_at
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
