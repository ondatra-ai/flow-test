/**
 * Test setup file that runs before all tests
 * Registers custom matchers and global test utilities
 */

import { config } from 'dotenv';
import { expect } from 'vitest';

import { customMatchers } from './test-utils/custom-matchers.js';

// Load environment variables from .env file
config();

// Register custom matchers with Vitest
expect.extend(customMatchers);
