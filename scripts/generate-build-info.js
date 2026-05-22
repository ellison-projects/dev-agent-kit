#!/usr/bin/env node

/**
 * Generates build information file with timestamp and deployment details.
 * Runs during the build to capture build-time information that the app
 * can display (e.g. footer "deployed at <timestamp>" or /api/health).
 */

const fs = require('fs');
const path = require('path');

const buildInfo = {
  timestamp: new Date().toISOString(),
  buildDate: new Date().toUTCString(),
  vercelEnv: process.env.VERCEL_ENV || null,
  vercelGitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
  vercelGitCommitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || null,
  vercelGitCommitAuthorName: process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME || null,
  vercelUrl: process.env.VERCEL_URL || null,
};

const outputDir = path.join(process.cwd(), 'lib');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, 'build-info.ts');
const content = `// This file is auto-generated during the build process
// Do not edit manually

export interface BuildInfo {
  timestamp: string;
  buildDate: string;
  vercelEnv: string | null;
  vercelGitCommitSha: string | null;
  vercelGitCommitMessage: string | null;
  vercelGitCommitAuthorName: string | null;
  vercelUrl: string | null;
}

export const buildInfo: BuildInfo = ${JSON.stringify(buildInfo, null, 2)};
`;

fs.writeFileSync(outputPath, content, 'utf8');

console.log('Build info generated.');
console.log(`   Timestamp: ${buildInfo.timestamp}`);
if (buildInfo.vercelEnv) {
  console.log(`   Vercel Env: ${buildInfo.vercelEnv}`);
}
if (buildInfo.vercelGitCommitSha) {
  console.log(`   Git Commit: ${buildInfo.vercelGitCommitSha.substring(0, 7)}`);
}
