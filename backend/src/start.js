require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const logger = {
  info: (...args) => console.log(`[INFO] ${new Date().toISOString()}`, ...args),
  error: (...args) => console.error(`[ERROR] ${new Date().toISOString()}`, ...args),
  warn: (...args) => console.warn(`[WARN] ${new Date().toISOString()}`, ...args),
};

async function runMigrations() {
  logger.info('DATABASE_URL present:', !!process.env.DATABASE_URL);
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  
  try {
    logger.info('Attempting to connect to database...');
    await client.connect();
    logger.info('✓ Connected to database');
    
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '../schema.sql');
    logger.info('Schema path:', schemaPath);
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at ${schemaPath}`);
    }
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    logger.info(`Schema SQL loaded (${schemaSql.length} bytes)`);
    
    logger.info('Running schema.sql...');
    await client.query(schemaSql);
    logger.info('✓ Schema created successfully');
    
    // Read and execute seed.sql
    const seedPath = path.join(__dirname, '../seed.sql');
    logger.info('Seed path:', seedPath);
    
    if (!fs.existsSync(seedPath)) {
      throw new Error(`Seed file not found at ${seedPath}`);
    }
    
    const seedSql = fs.readFileSync(seedPath, 'utf-8');
    logger.info(`Seed SQL loaded (${seedSql.length} bytes)`);
    
    logger.info('Running seed.sql...');
    await client.query(seedSql);
    logger.info('✓ Seed data inserted successfully');
    
    logger.info('✓ Migrations completed successfully!');
    
  } catch (error) {
    logger.error('Migration error:', error.message);
    logger.error('Full error:', error);
    logger.error('Stack:', error.stack);
    logger.warn('Continuing anyway (tables may already exist)...');
  } finally {
    await client.end();
  }
}

async function start() {
  logger.info('=== Starting Ticket Booking System ===');
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Run migrations first
  await runMigrations();
  
  // Then start the Express server
  logger.info('Starting Express server...');
  require('./index.js');
}

start().catch(err => {
  logger.error('Startup failed:', err);
  process.exit(1);
});
