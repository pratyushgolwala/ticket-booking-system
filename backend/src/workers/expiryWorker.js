const pool = require('../db');
const logger = require('../utils/logger');

const EXPIRY_CHECK_INTERVAL = 30000; // 30 seconds

async function expirePendingBookings() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Find expired bookings and lock them
    const expiredResult = await client.query(
      `SELECT id 
       FROM bookings 
       WHERE status = 'PENDING' AND expires_at < NOW()
       FOR UPDATE SKIP LOCKED`
    );
    
    if (expiredResult.rows.length === 0) {
      await client.query('COMMIT');
      return;
    }
    
    const expiredIds = expiredResult.rows.map(row => row.id);
    
    logger.info(`Expiring ${expiredIds.length} bookings: ${expiredIds.join(', ')}`);
    
    // Get seat IDs for these bookings
    const seatsResult = await client.query(
      `SELECT seat_id 
       FROM booking_seats 
       WHERE booking_id = ANY($1::bigint[])`,
      [expiredIds]
    );
    
    const seatIds = seatsResult.rows.map(row => row.seat_id);
    
    // Update seat statuses back to AVAILABLE
    if (seatIds.length > 0) {
      await client.query(
        `UPDATE seats 
         SET status = 'AVAILABLE' 
         WHERE id = ANY($1::int[]) AND status = 'RESERVED'`,
        [seatIds]
      );
    }
    
    // Update booking statuses to FAILED
    await client.query(
      `UPDATE bookings 
       SET status = 'FAILED' 
       WHERE id = ANY($1::bigint[])`,
      [expiredIds]
    );
    
    await client.query('COMMIT');
    
    logger.info(`Successfully expired ${expiredIds.length} bookings`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error expiring bookings:', error);
  } finally {
    client.release();
  }
}

function startExpiryWorker() {
  logger.info('Starting booking expiry worker');
  
  // Run immediately
  expirePendingBookings();
  
  // Then run periodically
  setInterval(() => {
    expirePendingBookings();
  }, EXPIRY_CHECK_INTERVAL);
}

module.exports = {
  startExpiryWorker,
  expirePendingBookings
};
