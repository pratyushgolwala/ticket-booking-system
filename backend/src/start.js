require('dotenv').config();
const { spawn } = require('child_process');
const logger = require('./utils/logger');

async function start() {
  logger.info('Running migrations before starting server...');
  
  // Run migrations
  const migrate = spawn('node', ['src/migrations/runMigrations.js'], {
    stdio: 'inherit'
  });

  migrate.on('close', (code) => {
    if (code !== 0) {
      logger.warn(`Migrations exited with code ${code}, continuing anyway...`);
    }
    
    // Start the server regardless of migration result
    logger.info('Starting Express server...');
    const server = spawn('node', ['src/index.js'], {
      stdio: 'inherit'
    });

    server.on('close', (code) => {
      process.exit(code);
    });
  });
}

start();
