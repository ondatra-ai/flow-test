import type { Command } from 'commander';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createCommandMock } from '../mocks/index.js';

describe('CLI Setup', () => {
  let mockProgram: Command;

  beforeEach(() => {
    const commandMock = createCommandMock();
    mockProgram = commandMock.mock;
    vi.clearAllMocks();
  });

  describe('setupCliProgram', () => {
    it('should setup CLI program with correct configuration', async () => {
      const { setupCliProgram } = await import('../../../src/cli/setup.js');

      setupCliProgram(mockProgram);

      expect(mockProgram.name).toHaveBeenCalledWith('ondatra-code');
      expect(mockProgram.description).toHaveBeenCalledWith(
        'Ondatra Code - An interactive conversational interface similar to claude-code'
      );
      expect(mockProgram.version).toHaveBeenCalledWith('1.0.0');
    });
  });

  describe('registerCommands', () => {
    it('should register all commands', async () => {
      const { registerCommands } = await import('../../../src/cli/setup.js');

      registerCommands(mockProgram);

      expect(mockProgram.command).toHaveBeenCalledWith('chat');

      expect(mockProgram.command).toHaveBeenCalledWith('flow:run');
      expect(mockProgram.action).toHaveBeenCalled();
    });
  });
});
