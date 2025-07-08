// tests/unit/index.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { promises as fs } from 'fs';

// Mock dependencies
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
  },
}));

vi.mock('commander', () => ({
  program: {
    name: vi.fn().mockReturnThis(),
    description: vi.fn().mockReturnThis(),
    version: vi.fn().mockReturnThis(),
    command: vi.fn().mockReturnThis(),
    action: vi.fn().mockReturnThis(),
    parseAsync: vi.fn(),
  },
}));

vi.mock('../../src/config/container.js', () => ({
  container: {
    resolve: vi.fn().mockReturnValue({
      info: vi.fn(),
      error: vi.fn(),
    }),
  },
  initializeContainer: vi.fn(),
  SERVICES: {
    Logger: Symbol('Logger'),
  },
}));

vi.mock('../../src/utils/test-templates.js', () => ({
  getTestTemplate: vi.fn().mockReturnValue('test template content'),
  getLoginPageTemplate: vi.fn().mockReturnValue('login page template'),
  getMemberPageTemplate: vi.fn().mockReturnValue('member page template'),
  getLogoutPageTemplate: vi.fn().mockReturnValue('logout page template'),
}));

describe('Main Entry Point', () => {
  let mockFs: any;

  beforeEach(() => {
    mockFs = vi.mocked(fs);
    vi.clearAllMocks();
  });

  describe('File generation functions', () => {
    it('should create test description markdown', async () => {
      const { createTestDescription } = await import('../../src/index.js');
      await createTestDescription('desc.md');
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        'desc.md',
        expect.stringContaining('# Login Functionality E2E Tests')
      );
    });

    it('should create test specification file', async () => {
      const { createTestSpec } = await import('../../src/index.js');
      await createTestSpec('login.spec.js');
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        'login.spec.js',
        'test template content'
      );
    });

    it('should create page object files', async () => {
      const { createPageObjects } = await import('../../src/index.js');
      await createPageObjects('/pages');
      
      expect(mockFs.writeFile).toHaveBeenCalledTimes(3);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        '/pages/LoginPage.js',
        'login page template'
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        '/pages/MemberPage.js',
        'member page template'
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        '/pages/LogoutPage.js',
        'logout page template'
      );
    });
  });

  describe('Playwright config creation', () => {
    it('should copy existing playwright config', async () => {
      const configContent = 'existing config content';
      mockFs.readFile.mockResolvedValue(configContent);
      
      const { createPlaywrightConfig } = await import('../../src/index.js');
      await createPlaywrightConfig('test-config.ts');
      
      expect(mockFs.writeFile).toHaveBeenCalledWith('test-config.ts', configContent);
    });

    it('should create basic config when original does not exist', async () => {
      mockFs.readFile.mockRejectedValue(new Error('File not found'));
      
      const { createPlaywrightConfig } = await import('../../src/index.js');
      await createPlaywrightConfig('test-config.ts');
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        'test-config.ts',
        expect.stringContaining('defineConfig')
      );
    });
  });

  describe('Test generation', () => {
    it('should create complete test structure', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      
      const { generateTests } = await import('../../src/index.js');
      await generateTests();
      
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('e2e/login-functionality'),
        { recursive: true }
      );
      expect(mockFs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('pages'),
        { recursive: true }
      );
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('playwright.config.ts'),
        expect.any(String)
      );
    });

    it('should handle errors during generation', async () => {
      const error = new Error('File creation failed');
      mockFs.mkdir.mockRejectedValue(error);
      
      const { generateTests } = await import('../../src/index.js');
      
      await expect(generateTests()).rejects.toThrow('File creation failed');
    });
  });

  describe('Error handling', () => {
    it('should handle file system errors gracefully', async () => {
      mockFs.writeFile.mockRejectedValue(new Error('Permission denied'));
      
      const { createTestSpec } = await import('../../src/index.js');
      
      await expect(createTestSpec('test.js')).rejects.toThrow('Permission denied');
    });
  });
}); 