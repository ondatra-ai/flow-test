import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

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
      (container.resolve as Mock).mockReturnValue(mockLogger);

      handleChatCommand();

      expect(mockLogger.info).toHaveBeenCalledWith('Ondatra Code');
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
      (container.resolve as Mock).mockReturnValue(mockLogger);

      handleDefaultAction();

      expect(mockLogger.info).toHaveBeenCalledWith('Ondatra Code');
    });
  });
});
