/**
 * Test setup file that runs before all tests
 * Registers custom matchers and global test utilities
 */

import { expect } from 'vitest';

import { customMatchers } from './test-utils/custom-matchers.js';

// Register custom matchers with Vitest
expect.extend(customMatchers);
