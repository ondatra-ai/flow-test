import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../../../src/config/container.js', () => ({
  container: {
    resolve: vi.fn().mockReturnValue({
      info: vi.fn(),
      error: vi.fn(),
    }),
  },
  SERVICES: {
    Logger: Symbol('Logger'),
  },
}));

vi.mock('../../../src/utils/test-generator.js', () => ({
  generateTests: vi.fn(),
}));

describe('CLI Handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleChatCommand', () => {
    it('should handle chat command', async () => {
      const { container } = await import('../../../src/config/container.js');
      const { handleChatCommand } = await import(
        '../../../src/cli/handlers.js'
      );

      const mockLogger = {
        info: vi.fn(),
        error: vi.fn(),
      };
      (container.resolve as ReturnType<typeof vi.fn>).mockReturnValue(
        mockLogger
      );

      handleChatCommand();

      expect(mockLogger.info).toHaveBeenCalledWith('Ondatra Code');
    });
  });

  describe('handleTestsGenerateCommand', () => {
    it('should handle tests:generate command successfully', async () => {
      const { generateTests } = await import(
        '../../../src/utils/test-generator.js'
      );
      const { handleTestsGenerateCommand } = await import(
        '../../../src/cli/handlers.js'
      );

      (generateTests as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);

      await expect(handleTestsGenerateCommand()).resolves.not.toThrow();
      expect(generateTests).toHaveBeenCalled();
    });

    it('should handle tests:generate command with error', async () => {
      const { generateTests } = await import(
        '../../../src/utils/test-generator.js'
      );
      const { handleTestsGenerateCommand } = await import(
        '../../../src/cli/handlers.js'
      );

      const error = new Error('Test generation failed');
      (generateTests as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      await expect(handleTestsGenerateCommand()).rejects.toThrow(
        'Test generation failed'
      );
    });
  });

  describe('handleDefaultAction', () => {
    it('should handle default action', async () => {
      const { container } = await import('../../../src/config/container.js');
      const { handleDefaultAction } = await import(
        '../../../src/cli/handlers.js'
      );

      const mockLogger = {
        info: vi.fn(),
        error: vi.fn(),
      };
      (container.resolve as ReturnType<typeof vi.fn>).mockReturnValue(
        mockLogger
      );

      handleDefaultAction();

      expect(mockLogger.info).toHaveBeenCalledWith('Ondatra Code');
    });
  });
});
