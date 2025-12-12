require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
  
  try {
    await client.connect();
    logger.info('Connected to database');
    
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '../../schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    
    logger.info('Running schema.sql...');
    await client.query(schemaSql);
    logger.info('Schema created successfully');
    
    // Read and execute seed.sql
    const seedPath = path.join(__dirname, '../../seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf-8');
    
    logger.info('Running seed.sql...');
    await client.query(seedSql);
    logger.info('Seed data inserted successfully');
    
    logger.info('Migrations completed successfully!');
    
  } catch (error) {
    logger.error('Migration failed:', error.message);
    logger.error('Full error:', error);
    // Don't exit - let the server start anyway (tables might already exist)
    logger.warn('Continuing despite migration error (tables may already exist)');
  } finally {
    await client.end();
  }
}

// Export for use in start script
if (require.main === module) {
  runMigrations();
} else {
  module.exports = runMigrations;
}
