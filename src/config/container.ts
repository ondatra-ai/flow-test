import 'reflect-metadata';

import { container, DependencyContainer } from 'tsyringe';

import { StepFactory } from '../flow/step-factory.js';
import type { IProviderHelper } from '../interfaces/providers/index.js';
import { ProviderHelper } from '../providers/llm/helpers/provider-helper.js';
import type { ILLMProvider } from '../providers/llm/interfaces/provider.js';
import { ClaudeProvider } from '../providers/llm/providers/claude/claude.provider.js';
import { GeminiProvider } from '../providers/llm/providers/gemini/gemini.provider.js';
import { OpenAIProvider } from '../providers/llm/providers/openai/openai.provider.js';
import { FlowManager } from '../utils/flow-manager.js';
import { GitHubClient } from '../utils/github-client.js';
import { ConsoleLogger, LogLevel, ILogger } from '../utils/logger.js';

import { SERVICES } from './tokens.js';

/**
 * Register LLM provider with environment variable validation
 */
function registerLLMProvider<T extends ILLMProvider>(
  token: symbol,
  ProviderClass: new (apiKey: string, helper: IProviderHelper) => T,
  envVarName: string
): void {
  container.register<ILLMProvider>(token, {
    useFactory: () => {
      const apiKey = process.env[envVarName];
      if (!apiKey) {
        throw new Error(`${envVarName} environment variable is required`);
      }
      const helper = container.resolve<IProviderHelper>(
        SERVICES.ProviderHelper
      );
      return new ProviderClass(apiKey, helper);
    },
  });
}

/**
 * Initialize the dependency injection container
 */
export function initializeContainer(): DependencyContainer {
  // Register core services
  container.register<ILogger>(SERVICES.Logger, {
    useFactory: () => new ConsoleLogger(LogLevel.INFO),
  });

  container.registerSingleton<IProviderHelper>(
    SERVICES.ProviderHelper,
    ProviderHelper
  );

  // Register LLM providers
  registerLLMProvider(
    SERVICES.ClaudeProvider,
    ClaudeProvider,
    'CLAUDE_API_KEY'
  );
  registerLLMProvider(
    SERVICES.OpenAIProvider,
    OpenAIProvider,
    'OPENAI_API_KEY'
  );
  registerLLMProvider(
    SERVICES.GeminiProvider,
    GeminiProvider,
    'GEMINI_API_KEY'
  );

  // Register other services
  container.register<GitHubClient>(SERVICES.GitHubClient, {
    useClass: GitHubClient,
  });
  container.register<StepFactory>(SERVICES.StepFactory, {
    useClass: StepFactory,
  });
  container.register<FlowManager>(SERVICES.FlowManager, {
    useClass: FlowManager,
  });

  return container;
}

export { container, SERVICES };
