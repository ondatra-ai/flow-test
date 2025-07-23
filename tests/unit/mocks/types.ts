import type { Command } from 'commander';
import type { Mock } from 'vitest';

import type { IContext } from '../../../src/interfaces/flow/context.interface.js';
import type { ILLMProvider } from '../../../src/interfaces/providers/provider.interface.js';
import type { Logger } from '../../../src/interfaces/utils/logger.interface.js';
import type { GitHubClient } from '../../../src/utils/github-client.js';

/**
 * Base mock options for all mock factories
 */
export interface MockOptions {
  throwOnUnmockedCall?: boolean;
  customBehavior?: Record<string, unknown>;
}

/**
 * Logger mock options
 */
export interface LoggerMockOptions extends MockOptions {
  captureMessages?: boolean;
  setupBehavior?: (mocks: {
    info: Mock;
    error: Mock;
    warn: Mock;
    debug: Mock;
    log: Mock;
  }) => void;
}

/**
 * Logger mock result with simple property access pattern
 */
export interface LoggerMockResult {
  mock: Logger; // For injection
  info: Mock; // For assertions
  error: Mock;
  warn: Mock;
  debug: Mock;
  log: Mock;
}

/**
 * Context mock options
 */
export interface ContextMockOptions extends MockOptions {
  initialData?: Record<string, string>;
  setupBehavior?: (mocks: {
    get: Mock;
    set: Mock;
    has: Mock;
    delete: Mock;
    clear: Mock;
  }) => void;
}

/**
 * Context mock result with simple property access pattern
 */
export interface ContextMockResult {
  mock: IContext; // For injection
  get: Mock; // For assertions
  set: Mock;
  has: Mock;
  delete: Mock;
  clear: Mock;
}

/**
 * LLM Provider mock options
 */
export interface LLMProviderMockOptions extends MockOptions {
  defaultResponse?: string;
  simulateError?: boolean;
  providerName?: string;
  availableModels?: string[];
  setupBehavior?: (mocks: {
    stream: Mock;
    generate: Mock;
    getProviderName: Mock;
    getAvailableModels: Mock;
  }) => void;
}

/**
 * LLM Provider mock result with simple property access pattern
 */
export interface LLMProviderMockResult {
  mock: ILLMProvider; // For injection
  stream: Mock; // For assertions
  generate: Mock;
  getProviderName: Mock;
  getAvailableModels: Mock;
}

/**
 * GitHub Client mock options
 */
export interface GitHubClientMockOptions extends MockOptions {
  defaultIssueResponse?: {
    issue: Record<string, unknown>;
    comments: Record<string, unknown>[];
  };
  simulateError?: boolean;
  setupBehavior?: (mocks: { getIssueWithComments: Mock }) => void;
}

/**
 * GitHub Client mock result with simple property access pattern
 */
export interface GitHubClientMockResult {
  mock: GitHubClient; // For injection
  getIssueWithComments: Mock; // For assertions
}

/**
 * Command mock options
 */
export interface CommandMockOptions extends MockOptions {
  chainable?: boolean;
  defaultAction?: () => void;
  setupBehavior?: (mocks: {
    name: Mock;
    description: Mock;
    version: Mock;
    command: Mock;
    argument: Mock;
    option: Mock;
    action: Mock;
  }) => void;
}

/**
 * Command mock result with simple property access pattern
 */
export interface CommandMockResult {
  mock: Command; // For injection
  name: Mock; // For assertions
  description: Mock;
  version: Mock;
  command: Mock;
  argument: Mock;
  option: Mock;
  action: Mock;
}
