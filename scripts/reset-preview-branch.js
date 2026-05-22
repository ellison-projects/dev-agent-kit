const { execSync } = require('child_process');

/**
 * Reset a Vercel preview deployment's Neon branch from a known parent
 * (typically main), then run migrations on the freshly-reset branch.
 *
 * Required env:
 *   NEON_API_KEY            — Neon API key (Vercel project env var)
 *   NEON_PROJECT_ID         — Neon project ID
 *   NEON_MAIN_BRANCH_ID     — source branch to restore from (e.g. main's branch id, "br-xxxx")
 *   VERCEL_GIT_COMMIT_REF   — Vercel-provided git branch name (used to look up the matching Neon branch)
 *
 * Skips reset gracefully when not in a Vercel preview env.
 */

async function findNeonBranchByName(neonApiKey, neonProjectId, gitBranchName) {
  console.log(`Looking up Neon branch for git branch: ${gitBranchName}`);

  const response = await fetch(
    `https://console.neon.tech/api/v2/projects/${neonProjectId}/branches`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${neonApiKey}`,
        Accept: 'application/json',
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch branches (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const branches = data.branches || [];

  console.log(`   Found ${branches.length} branches in Neon project`);

  // The kit's workflows name preview branches `preview/<git-branch>`
  // (see .github/workflows/neon-branch-delete.yml), so try that first
  // — exact, then normalized (`/` → `-`).
  const prefixedName = `preview/${gitBranchName}`;
  let matchedBranch = branches.find((b) => b.name === prefixedName);
  if (matchedBranch) {
    console.log(`   Found branch with preview/ prefix: ${matchedBranch.name}`);
  }

  if (!matchedBranch) {
    const normalizedPrefixedName = prefixedName.replace(/\//g, '-');
    matchedBranch = branches.find((b) => b.name === normalizedPrefixedName);
    if (matchedBranch) {
      console.log(`   Found branch with normalized preview/ prefix: ${matchedBranch.name}`);
    }
  }

  // Fall back to the raw branch name (and normalized form) for projects
  // that don't use the `preview/` convention.
  if (!matchedBranch) {
    matchedBranch = branches.find((b) => b.name === gitBranchName);
  }

  if (!matchedBranch) {
    const normalizedName = gitBranchName.replace(/\//g, '-');
    matchedBranch = branches.find((b) => b.name === normalizedName);
    if (matchedBranch) {
      console.log(`   Found branch with normalized name: ${matchedBranch.name}`);
    }
  }

  // Then partial match (handles prefixes/suffixes Neon sometimes adds).
  if (!matchedBranch) {
    const normalizedGitName = gitBranchName.replace(/\//g, '-');
    matchedBranch = branches.find(
      (b) => b.name.includes(normalizedGitName) || b.name.includes(gitBranchName),
    );
    if (matchedBranch) {
      console.log(`   Found branch with partial match: ${matchedBranch.name}`);
    }
  }

  if (!matchedBranch) {
    console.error('\nBranch not found.');
    console.error('\nDebug Information:');
    console.error(`   Git branch name: "${gitBranchName}"`);
    console.error(`   Normalized name: "${gitBranchName.replace(/\//g, '-')}"`);
    console.error(`   Total branches in Neon: ${branches.length}`);
    console.error('\nAvailable Neon branches:');
    branches.forEach((b) => {
      console.error(`     - Name: "${b.name}"  ID: ${b.id}  Parent: ${b.parent_id || 'none'}`);
    });
    console.error('\nPossible solutions:');
    console.error('   1. Ensure the Neon branch name matches your git branch name');
    console.error('   2. Check if branch name normalization is needed (/ becomes -)');
    console.error('   3. Create a Neon branch with a matching name');
    console.error('   4. Verify NEON_PROJECT_ID is correct');

    throw new Error(`No Neon branch found matching git branch: "${gitBranchName}"`);
  }

  console.log(`Found matching Neon branch: ${matchedBranch.name} (${matchedBranch.id})`);
  return matchedBranch.id;
}

async function resetPreviewBranch() {
  const isPreview = process.env.VERCEL_ENV === 'preview';
  const neonApiKey = process.env.NEON_API_KEY;
  const neonProjectId = process.env.NEON_PROJECT_ID;
  const sourceBranchId = process.env.NEON_MAIN_BRANCH_ID;
  const gitBranchName = process.env.VERCEL_GIT_COMMIT_REF;

  console.log('Environment check:');
  console.log(`   VERCEL_ENV:           ${process.env.VERCEL_ENV || 'not set'}`);
  console.log(`   Git Branch:           ${gitBranchName || 'not set'}`);
  console.log(`   Is Preview:           ${isPreview}`);
  console.log(`   NEON_API_KEY:         ${neonApiKey ? 'set' : 'missing'}`);
  console.log(`   NEON_PROJECT_ID:      ${neonProjectId || 'not set'}`);
  console.log(`   NEON_MAIN_BRANCH_ID:  ${sourceBranchId || 'not set'}`);

  if (isPreview) {
    console.log('\nPreview environment detected — resetting branch database...');

    if (!neonApiKey || !neonProjectId) {
      console.error('Missing required environment variables:');
      if (!neonApiKey) console.error('   - NEON_API_KEY');
      if (!neonProjectId) console.error('   - NEON_PROJECT_ID');
      throw new Error('Missing required Neon environment variables');
    }
    if (!sourceBranchId) {
      console.error('Missing NEON_MAIN_BRANCH_ID — set this to the Neon branch ID of your main branch (e.g. "br-xxxx").');
      throw new Error('Missing NEON_MAIN_BRANCH_ID');
    }
    if (!gitBranchName) {
      console.error('VERCEL_GIT_COMMIT_REF not found');
      throw new Error('Cannot determine git branch name');
    }

    const neonBranchId = await findNeonBranchByName(neonApiKey, neonProjectId, gitBranchName);

    console.log(`\nCalling Neon API to restore branch ${neonBranchId} from source...`);
    console.log(`   Source branch: ${sourceBranchId}`);

    const response = await fetch(
      `https://console.neon.tech/api/v2/projects/${neonProjectId}/branches/${neonBranchId}/restore`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${neonApiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ source_branch_id: sourceBranchId }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Reset API returned error: ${response.status}`);
      console.error(`   Response: ${errorText}`);
      throw new Error(`Neon API error (${response.status}): ${errorText}`);
    }

    const result = await response.json();
    console.log('Branch reset from source successful.');
    console.log(`   Branch: ${result.branch?.name || gitBranchName}`);
    if (result.branch?.parent_id) {
      console.log(`   Parent branch ID: ${result.branch.parent_id}`);
    }
    if (result.operations) {
      console.log(`   Operation ID: ${result.operations[0]?.id || 'unknown'}`);
    }

    console.log('Waiting 5 seconds for reset to propagate...');
    await new Promise((resolve) => setTimeout(resolve, 5000));
  } else {
    console.log('\nNot a preview environment — skipping branch reset');
  }

  console.log('\nRunning database migrations...');
  execSync('npx node-pg-migrate up --verbose --no-check-order', {
    stdio: 'inherit',
    env: process.env,
  });
  console.log('Migrations completed.');
}

if (require.main === module) {
  resetPreviewBranch()
    .then(() => {
      console.log('\nBuild preparation complete.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nBuild preparation failed:', error);
      process.exit(1);
    });
} else {
  module.exports = resetPreviewBranch;
}
