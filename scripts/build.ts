#!/usr/bin/env tsx

import { execSync } from 'node:child_process';
import { rmSync, existsSync } from 'node:fs';

/**
 * Build script for the Ondatra Code project
 *
 * This script handles TypeScript compilation and any additional
 * build steps required for production deployment.
 */
function build(): void {
  try {
    // eslint-disable-next-line no-console
    console.log('🧹 Cleaning previous build...');
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true });
    }

    // eslint-disable-next-line no-console
    console.log('🔍 Type checking...');
    execSync('npm run type-check', { stdio: 'inherit' });

    // eslint-disable-next-line no-console
    console.log('🔧 Building TypeScript...');
    execSync('tsc', { stdio: 'inherit' });

    // eslint-disable-next-line no-console
    console.log('✅ Build completed successfully!');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// eslint-disable-next-line no-console
build();
