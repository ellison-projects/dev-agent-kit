#!/usr/bin/env node

/**
 * Database Reset Script
 *
 * Completely resets the local database by:
 *   1. Auto-detecting and dropping all tables + indexes in the public schema
 *   2. Re-running all migrations from scratch
 *   3. Optionally hitting the app's seed endpoint
 *
 * Safe by default — prompts for confirmation unless --yes is passed or
 * CI=true.
 *
 * Usage:
 *   node scripts/reset-database.js [--seed] [--yes]
 *   npm run db:reset
 *   npm run db:reset:seed
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  require('dotenv-flow').config();
} catch (_) {
  console.log('dotenv-flow not found, continuing with existing environment variables');
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not set');
  console.error('Make sure you have a .env.local file with your database configuration');
  process.exit(1);
}

function runCommand(command, description, allowFailure = false) {
  console.log(`${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`${description} completed`);
  } catch (error) {
    if (allowFailure) {
      console.log(`${description} failed (this may be expected)`);
      throw error;
    } else {
      console.error(`Error during ${description}:`);
      console.error(error.message);
      process.exit(1);
    }
  }
}

function confirmReset() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      'This will DELETE ALL DATA in your database. Are you sure? (yes/no): ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
      },
    );
  });
}

async function resetDatabase() {
  console.log('Database Reset Script');
  console.log('========================');
  console.log(`Database: ${DATABASE_URL.split('@')[1]?.split('/')[0] || 'Unknown'}`);
  console.log('');

  const skipConfirmation = process.argv.includes('--yes') || process.env.CI === 'true';

  if (!skipConfirmation) {
    const confirmed = await confirmReset();
    if (!confirmed) {
      console.log('Database reset cancelled');
      process.exit(0);
    }
  }

  console.log('');
  console.log('Starting database reset...');
  console.log('');

  // Step 1: Detect tables
  console.log('Detecting tables to drop...');

  const getTablesSQL = `
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
    AND tablename != 'pgmigrations'
    ORDER BY tablename;
  `;

  let tables = [];
  try {
    const result = execSync(`psql "${DATABASE_URL}" -t -c "${getTablesSQL}"`, {
      encoding: 'utf8',
    });
    tables = result
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (tables.length === 0) {
      console.log('No tables found to drop');
    } else {
      console.log(`Found ${tables.length} tables: ${tables.join(', ')}`);
    }
  } catch (error) {
    console.log('Could not detect tables, skipping table drop');
  }

  // Step 1a: Drop all indexes first
  console.log('Dropping all indexes...');

  const getIndexesSQL = `
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname NOT LIKE 'pg_%'
    AND indexname NOT LIKE '%_pkey'
    ORDER BY indexname;
  `;

  let indexes = [];
  try {
    const result = execSync(`psql "${DATABASE_URL}" -t -c "${getIndexesSQL}"`, {
      encoding: 'utf8',
    });
    indexes = result
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (indexes.length === 0) {
      console.log('No indexes found to drop');
    } else {
      console.log(`Found ${indexes.length} indexes: ${indexes.join(', ')}`);

      for (const index of indexes) {
        const quoted = `"${index.replace(/"/g, '""')}"`;
        runCommand(
          `psql "${DATABASE_URL}" -c 'DROP INDEX IF EXISTS ${quoted} CASCADE;'`,
          `Dropping index ${index}`,
        );
      }
    }
  } catch (error) {
    console.log('Could not detect indexes, skipping index cleanup');
  }

  // Step 1b: Drop all detected tables
  if (tables.length > 0) {
    const dropTablesSQL = tables
      .map((table) => `DROP TABLE IF EXISTS "${table.replace(/"/g, '""')}" CASCADE;`)
      .join('\n');

    runCommand(
      `psql "${DATABASE_URL}" -c '${dropTablesSQL}'`,
      `Dropping ${tables.length} tables`,
    );
  }

  // Also drop pgmigrations table to reset migration state
  runCommand(
    `psql "${DATABASE_URL}" -c "DROP TABLE IF EXISTS pgmigrations CASCADE;"`,
    'Dropping migration tracking table',
  );

  // Step 2: Run migrations
  runCommand('npm run migrate:up', 'Running migrations');

  // Step 3: Optionally seed
  const shouldSeed = process.argv.includes('--seed');

  if (shouldSeed) {
    console.log('');
    console.log('Seeding database with sample data...');

    const seedEndpointPath = path.join(__dirname, '..', 'app', 'api', 'seed', 'route.ts');
    if (fs.existsSync(seedEndpointPath)) {
      try {
        runCommand(
          'curl -fsS -X POST http://localhost:3000/api/seed',
          'Seeding database',
          true,
        );
        console.log('Sample data seeded successfully');
      } catch (error) {
        console.log('Seeding failed — this is normal if the dev server is not running or you are not logged in');
        console.log('   To seed data manually:');
        console.log('   1. Start the dev server: npm run dev');
        console.log('   2. Log in to the app');
        console.log('   3. Visit: http://localhost:3000/api/seed');
      }
    } else {
      console.log('Seed endpoint not found at app/api/seed/route.ts — skipping seeding');
    }
  }

  console.log('');
  console.log('Database reset completed.');
  console.log('');

  // Show resulting tables
  console.log('Database now contains:');
  try {
    const result = execSync(`psql "${DATABASE_URL}" -t -c "${getTablesSQL}"`, {
      encoding: 'utf8',
    });
    const newTables = result
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    newTables.forEach((table) => {
      console.log(`   - ${table}`);
    });
  } catch (error) {
    console.log('   - All tables recreated from migrations');
  }

  if (shouldSeed) {
    console.log('   - Sample data (if seeding succeeded)');
  }

  console.log('');
  console.log('Ready for development.');
}

process.on('uncaughtException', (error) => {
  console.error('Unexpected error:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error.message);
  process.exit(1);
});

resetDatabase().catch((error) => {
  console.error('Database reset failed:', error.message);
  process.exit(1);
});
