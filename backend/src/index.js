require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const logger = require('./utils/logger');
const pool = require('./db');

// Import routes
const adminRoutes = require('./routes/admin');
const showsRoutes = require('./routes/shows');
const bookingsRoutes = require('./routes/bookings');

// Import workers
const { startExpiryWorker } = require('./workers/expiryWorker');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/admin', adminRoutes);
app.use('/shows', showsRoutes);
app.use('/bookings', bookingsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Error:', err.message, err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

// Migration function
async function runMigrations() {
  logger.info('=== Running Database Migrations ===');
  logger.info('DATABASE_URL present:', !!process.env.DATABASE_URL);
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  
  try {
    logger.info('Connecting to database...');
    await client.connect();
    logger.info('✓ Connected to database');
    
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '../schema.sql');
    logger.info('Schema path:', schemaPath);
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    logger.info(`✓ Schema SQL loaded (${schemaSql.length} bytes)`);
    
    logger.info('Executing schema.sql...');
    await client.query(schemaSql);
    logger.info('✓ Schema created successfully');
    
    // Read and execute seed.sql
    const seedPath = path.join(__dirname, '../seed.sql');
    logger.info('Seed path:', seedPath);
    
    if (!fs.existsSync(seedPath)) {
      throw new Error(`Seed file not found at ${seedPath}`);
    }
    
    const seedSql = fs.readFileSync(seedPath, 'utf-8');
    logger.info(`✓ Seed SQL loaded (${seedSql.length} bytes)`);
    
    logger.info('Executing seed.sql...');
    await client.query(seedSql);
    logger.info('✓ Seed data inserted successfully');
    
    logger.info('✓✓✓ Migrations completed successfully! ✓✓✓');
    
  } catch (error) {
    logger.error('Migration error:', error.message);
    logger.error('Full error:', error);
    logger.warn('Continuing anyway (tables may already exist)...');
  } finally {
    await client.end();
  }
}

// Start server (after migrations)
async function startServer() {
  // Run migrations first
  await runMigrations();
  
  // Then start the Express server
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    
    // Start the expiry worker
    startExpiryWorker();
  });
}

// Start everything
startServer().catch(err => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
