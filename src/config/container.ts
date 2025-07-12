import 'reflect-metadata';

import { container } from 'tsyringe';

import { StepFactory } from '../flow/step-factory.js';
import {
  ProviderHelper,
  type IProviderHelper,
} from '../providers/llm/helpers/provider-helper.js';
import type { ILLMProvider } from '../providers/llm/interfaces/provider.js';
import { ClaudeProvider } from '../providers/llm/providers/claude/claude.provider.js';
import { GeminiProvider } from '../providers/llm/providers/gemini/gemini.provider.js';
import { OpenAIProvider } from '../providers/llm/providers/openai/openai.provider.js';
import { FlowManager } from '../utils/flow-manager.js';
import { GitHubClient } from '../utils/github-client.js';
import { ConsoleLogger, LogLevel, Logger } from '../utils/logger.js';

import { SERVICES, type TokenType } from './tokens.js';

/**
 * Initialize the dependency injection container
 */
export function initializeContainer(): void {
  // Register Logger
  if (!container.isRegistered(SERVICES.Logger)) {
    container.register<Logger>(SERVICES.Logger, {
      useFactory: () => new ConsoleLogger(LogLevel.INFO),
    });

    // Register FlowManager and StepFactory
    container.registerSingleton<FlowManager>(SERVICES.FlowManager, FlowManager);
    container.registerSingleton<StepFactory>(SERVICES.StepFactory, StepFactory);

    // Register GitHub integration
    container.registerSingleton<GitHubClient>(
      SERVICES.GitHubClient,
      GitHubClient
    );

    // Register LLM components
    container.registerSingleton<IProviderHelper>(
      SERVICES.ProviderHelper,
      ProviderHelper
    );

    // Register LLM providers with factory functions
    container.register<ILLMProvider>(SERVICES.ClaudeProvider, {
      useFactory: c => {
        const helper = c.resolve<IProviderHelper>(SERVICES.ProviderHelper);
        const apiKey = process.env.CLAUDE_API_KEY;
        if (!apiKey) {
          throw new Error('CLAUDE_API_KEY environment variable is required');
        }
        return new ClaudeProvider(apiKey, helper);
      },
    });

    container.register<ILLMProvider>(SERVICES.OpenAIProvider, {
      useFactory: c => {
        const helper = c.resolve<IProviderHelper>(SERVICES.ProviderHelper);
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
          throw new Error('OPENAI_API_KEY environment variable is required');
        }
        return new OpenAIProvider(apiKey, helper);
      },
    });

    container.register<ILLMProvider>(SERVICES.GeminiProvider, {
      useFactory: c => {
        const helper = c.resolve<IProviderHelper>(SERVICES.ProviderHelper);
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          throw new Error('GEMINI_API_KEY environment variable is required');
        }
        return new GeminiProvider(apiKey, helper);
      },
    });
  }
}

/**
 * Export pre-configured container
 */
export { container };
export { SERVICES, type TokenType };
