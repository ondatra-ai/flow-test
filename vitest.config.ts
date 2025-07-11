import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        'scripts/',
        'test_results/',
        '**/*.d.ts',
        '**/*.config.*',
        'src/utils/test-templates.ts',
        'src/index.ts',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules/', 'dist/'],
  },
});
