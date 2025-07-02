#!/usr/bin/env tsx

import { execSync } from 'node:child_process';
import { rmSync, existsSync } from 'node:fs';

/**
 * Build script for the Claude Code CLI project
 */
async function build(): Promise<void> {
  try {
    console.log('🧹 Cleaning previous build...');
    if (existsSync('dist')) {
      rmSync('dist', { recursive: true });
    }

    console.log('🔍 Type checking...');
    execSync('npm run type-check', { stdio: 'inherit' });

    console.log('🔧 Building TypeScript...');
    execSync('npm run build', { stdio: 'inherit' });

    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build().catch(console.error); 