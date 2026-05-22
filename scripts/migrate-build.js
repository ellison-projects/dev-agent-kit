#!/usr/bin/env node

/**
 * Run database migrations during build.
 * Designed for Vercel's build environment where DATABASE_URL is available
 * as an environment variable. Skips cleanly if DATABASE_URL is not set so
 * that local builds without a DB don't fail.
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function runMigrations() {
  console.log('Running database migrations...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL is not set');
    console.log('   Skipping migrations (likely running in local dev without .env)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return;
  }

  try {
    console.log('Running node-pg-migrate up...');
    const { stdout, stderr } = await execAsync('npx node-pg-migrate up --no-check-order', {
      env: process.env,
      maxBuffer: 1024 * 1024 * 10,
    });

    if (stdout) console.log(stdout);
    if (stderr && !stderr.includes('NOTICE')) console.error(stderr);

    console.log('Migrations completed.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('Migration failed:');
    console.error(error.message);

    if (error.stdout) {
      console.log('\nStdout:');
      console.log(error.stdout);
    }
    if (error.stderr) {
      console.error('\nStderr:');
      console.error(error.stderr);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }
}

runMigrations().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
