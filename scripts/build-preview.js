const { execSync } = require('child_process');

async function buildPreview() {
  const isPreview = process.env.VERCEL_ENV === 'preview';
  const hasNeonConfig = process.env.NEON_API_KEY && process.env.NEON_PROJECT_ID;

  console.log('Build script');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Environment: ${process.env.VERCEL_ENV || 'development'}`);
  console.log(`Is Preview:  ${isPreview}`);
  console.log(`Has Neon:    ${hasNeonConfig}`);
  console.log(`Git Branch:  ${process.env.VERCEL_GIT_COMMIT_REF || 'unknown'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (isPreview && hasNeonConfig) {
    console.log('Preview build with Neon — resetting branch database from main...\n');

    try {
      const resetPreviewBranch = require('./reset-preview-branch.js');
      await resetPreviewBranch();
      console.log('\nPreview reset and migrations complete.\n');
    } catch (error) {
      console.error('\nPreview reset failed:', error.message);
      console.error('\nFalling back to migrations only — preview DB may not match main.\n');

      try {
        console.log('Running migrations without reset...\n');
        execSync('npx node-pg-migrate up --verbose --no-check-order', {
          stdio: 'inherit',
          env: process.env,
        });
        console.log('\nMigrations completed.');
      } catch (migrationError) {
        console.error('Migrations also failed:', migrationError.message);
        process.exit(1);
      }
    }
  } else if (isPreview && !hasNeonConfig) {
    console.log('Preview build without Neon configuration.');
    console.log('   Missing: NEON_API_KEY and/or NEON_PROJECT_ID');
    console.log('   Skipping branch reset, running migrations only...\n');

    try {
      execSync('npx node-pg-migrate up --verbose --no-check-order', {
        stdio: 'inherit',
        env: process.env,
      });
      console.log('\nMigrations completed.');
    } catch (error) {
      console.error('Migration failed:', error.message);
      process.exit(1);
    }
  } else {
    console.log('Production/Development build — running migrations only...\n');

    try {
      execSync('npx node-pg-migrate up --verbose --no-check-order', {
        stdio: 'inherit',
        env: process.env,
      });
      console.log('\nMigrations completed.');
    } catch (error) {
      console.error('Migration failed:', error.message);
      process.exit(1);
    }
  }

  console.log('\nBuild preparation complete.\n');
}

buildPreview().catch((error) => {
  console.error('\nBuild script failed:', error);
  process.exit(1);
});
