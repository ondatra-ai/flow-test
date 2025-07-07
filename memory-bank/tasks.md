# LEVEL 4 TASK: IMPLEMENT MULTI-LLM PROVIDERS WITH STREAMING ARCHITECTURE

## Task Definition

**Complexity Level:** 4 (Complex System)  
**Objective:** Design and implement unified LLM provider architecture for Claude, ChatGPT/OpenAI, Gemini, and Grok with streaming-first interfaces

## PLAN MODE: STREAMING-FOCUSED PROVIDER ARCHITECTURE ✅

### SDK Research Results

**Available SDKs with Streaming Support:**

- **Anthropic Claude**: `@anthropic-ai/sdk` v0.56.0 - Native streaming support
- **OpenAI**: `openai` v5.8.2 - Server-sent events streaming
- **Google Gemini**: `@google/generative-ai` v0.24.1 - Stream generation support
- **xAI Grok**: `@ai-sdk/xai` v1.2.17 - Streaming capabilities

### Requirements Analysis

#### Core Streaming Requirements

- **Streaming-First Design**: All providers must support async iterators for real-time responses
- **Unified Stream Interface**: Common streaming abstraction across all providers
- **Backpressure Handling**: Proper stream control and memory management
- **Error Recovery**: Graceful handling of stream interruptions

#### Target Architecture

- **Provider Layer**: Unified LLM provider interface with streaming focus
- **Stream Processing**: Real-time token processing and transformation
- **Context Management**: Stateful conversation streams
- **Event-Driven**: Reactive architecture for stream events

### Simplified Stream-Centric Interface Design

```typescript
// src/providers/llm/interfaces/provider.ts

export interface ILLMProvider {
  /**
   * Stream tokens as they are generated
   */
  stream(request: StreamRequest): AsyncIterableIterator<StreamEvent>;

  /**
   * Generate complete response (non-streaming)
   */
  generate(request: StreamRequest): Promise<string>;

  /**
   * Get provider metadata
   */
  getProviderName(): string;
  getAvailableModels(): string[]; // Simple string array instead of ModelInfo
}

// Only the essential types needed by ILLMProvider

export interface StreamRequest {
  prompt: string;
  signal: AbortSignal;
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  // Conversation support directly in StreamRequest
  messages?: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
}

export interface StreamEvent {
  type: 'token' | 'error' | 'done';
  // Union type - only the fields that exist for each type
  token?: string; // Only when type === 'token'
  error?: Error; // Only when type === 'error'
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  }; // Only when type === 'done'
}
```

That's it! Much simpler. We've:

- Removed ConversationStreamRequest/Event (just use messages in StreamRequest)
- Removed GenerateRequest/Response (reuse StreamRequest, return string)
- Removed StreamCapabilities (can add later if needed)
- Removed ModelInfo (just return string array)
- Removed StreamMetadata (can add to StreamEvent if needed)
- Inlined TokenUsage and Message types

### Simplified Usage Examples

```typescript
// Basic streaming
const stream = provider.stream({
  prompt: 'Write a story...',
  signal: SignalUtils.timeout(30000),
  model: 'claude-3-opus-20240229',
});

for await (const event of stream) {
  if (event.type === 'token') {
    console.log(event.token);
  } else if (event.type === 'error') {
    console.error(event.error);
  } else if (event.type === 'done' && event.usage) {
    console.log(`Total tokens: ${event.usage.totalTokens}`);
  }
}

// Conversation streaming (using messages)
const stream = provider.stream({
  prompt: 'Continue the conversation',
  signal: SignalUtils.timeout(30000),
  model: 'gpt-4',
  messages: [
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hi there!' },
  ],
});

// Non-streaming generation
const response = await provider.generate({
  prompt: 'Quick answer',
  signal: SignalUtils.timeout(5000),
  model: 'claude-3-haiku-20240307',
});
console.log(response); // Just the string response
```

### Simplified Provider Implementation

```typescript
// src/providers/llm/providers/claude/claude.provider.ts

export class ClaudeProvider implements ILLMProvider {
  constructor(private apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async *stream(request: StreamRequest): AsyncIterableIterator<StreamEvent> {
    try {
      const messages = request.messages || [
        { role: 'user' as const, content: request.prompt },
      ];

      const stream = await this.client.messages.create({
        messages,
        model: request.model,
        max_tokens: request.maxTokens || 1000,
        temperature: request.temperature,
        system: request.systemPrompt,
        stream: true,
      });

      for await (const chunk of stream) {
        if (request.signal.aborted) {
          throw new Error('Aborted');
        }

        if (chunk.type === 'content_block_delta') {
          yield { type: 'token', token: chunk.delta.text };
        }
      }

      // Get final usage if available
      const usage = await stream.finalMessage();
      yield {
        type: 'done',
        usage: {
          promptTokens: usage.usage.input_tokens,
          completionTokens: usage.usage.output_tokens,
          totalTokens: usage.usage.input_tokens + usage.usage.output_tokens,
        },
      };
    } catch (error) {
      yield { type: 'error', error: error as Error };
    }
  }

  async generate(request: StreamRequest): Promise<string> {
    const tokens: string[] = [];

    for await (const event of this.stream(request)) {
      if (event.type === 'token' && event.token) {
        tokens.push(event.token);
      } else if (event.type === 'error') {
        throw event.error;
      }
    }

    return tokens.join('');
  }

  getProviderName(): string {
    return 'claude';
  }

  getAvailableModels(): string[] {
    return [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ];
  }
}
```

### Base Provider Pattern (Optional)

```typescript
// src/providers/llm/base/base-provider.ts

export abstract class BaseProvider implements ILLMProvider {
  abstract stream(request: StreamRequest): AsyncIterableIterator<StreamEvent>;
  abstract getProviderName(): string;
  abstract getAvailableModels(): string[];

  // Default implementation using stream
  async generate(request: StreamRequest): Promise<string> {
    const tokens: string[] = [];

    for await (const event of this.stream(request)) {
      if (event.type === 'token' && event.token) {
        tokens.push(event.token);
      } else if (event.type === 'error') {
        throw event.error;
      }
    }

    return tokens.join('');
  }
}
```

### Integration with Flow System

```typescript
// src/flow/steps/llm-stream-step.ts

export class LLMStreamStep implements IStep {
  constructor(
    private provider: ILLMProvider,
    private logger: Logger
  ) {}

  async execute(context: IContext): Promise<boolean> {
    const prompt = context.get('prompt') || '';
    const model = context.get('model') || 'claude-3-haiku-20240307';
    const timeout = parseInt(context.get('timeout') || '30000');

    const controller = new AbortController();
    setTimeout(() => controller.abort(), timeout);

    try {
      const response = await this.provider.generate({
        prompt,
        model,
        signal: controller.signal,
      });

      context.set('response', response);
      return true;
    } catch (error) {
      this.logger.error('LLM generation failed', error);
      return false;
    }
  }
}
```

## Benefits of Simplified Design

1. **Minimal Interface** - Only 4 methods, easy to implement
2. **Fewer Types** - Just 2 types needed for the interface
3. **Reusable** - StreamRequest works for both streaming and non-streaming
4. **Flexible** - Messages array handles conversations without extra types
5. **Focused** - Only includes what's actually needed

## What We Removed

- ❌ ConversationStreamRequest/Event - Just use messages array
- ❌ GenerateRequest/Response - Reuse StreamRequest
- ❌ StreamCapabilities - Add later if needed
- ❌ ModelInfo - Simple strings are enough
- ❌ StreamMetadata - Can add to events if needed
- ❌ Separate Message/TokenUsage types - Inline them
- ❌ Phase-specific types - Not used by core interface

This is much cleaner and focuses on what's actually needed for the LLM provider interface.

### Signal Utilities

```typescript
// src/providers/llm/utils/signal-utils.ts

export class SignalUtils {
  /**
   * Create a signal that never aborts (for unlimited operations)
   */
  static neverAbort(): AbortSignal {
    return new AbortController().signal;
  }

  /**
   * Create a signal with timeout
   */
  static timeout(ms: number): AbortSignal {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  }

  /**
   * Create a signal with timeout and return controller for manual abort
   */
  static timeoutWithController(ms: number): {
    signal: AbortSignal;
    controller: AbortController;
  } {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ms);

    // Clean up timeout if manually aborted
    controller.signal.addEventListener('abort', () => clearTimeout(timeoutId));

    return { signal: controller.signal, controller };
  }

  /**
   * Merge multiple signals - aborts when any signal aborts
   */
  static merge(...signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();

    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
        return controller.signal;
      }

      signal.addEventListener('abort', () => controller.abort(), {
        once: true,
      });
    }

    return controller.signal;
  }

  /**
   * Create a signal that aborts after N tokens
   */
  static tokenLimit(maxTokens: number): {
    signal: AbortSignal;
    increment: () => void;
  } {
    const controller = new AbortController();
    let tokenCount = 0;

    return {
      signal: controller.signal,
      increment: () => {
        tokenCount++;
        if (tokenCount >= maxTokens) {
          controller.abort();
        }
      },
    };
  }
}
```

### Usage Examples with Required Signal

```typescript
// Example 1: Simple usage with timeout
const stream = provider.stream({
  prompt: 'Write a story...',
  signal: SignalUtils.timeout(30000), // 30 second timeout
});

// Example 2: Never abort for long operations
const stream = provider.stream({
  prompt: 'Process this large dataset...',
  signal: SignalUtils.neverAbort(),
});

// Example 3: Manual control with timeout fallback
const { signal, controller } = SignalUtils.timeoutWithController(60000);

const stream = provider.stream({
  prompt: 'Generate code...',
  signal,
});

// Can still manually abort
document.getElementById('stop-button').addEventListener('click', () => {
  controller.abort();
});

// Example 4: Token-limited stream
const { signal, increment } = SignalUtils.tokenLimit(100);

for await (const event of provider.stream({ prompt: '...', signal })) {
  if (event.type === 'token') {
    increment(); // Will auto-abort after 100 tokens
    console.log(event.token);
  }
}

// Example 5: Merged signals (abort on timeout OR user action)
const timeoutSignal = SignalUtils.timeout(30000);
const userController = new AbortController();

const stream = provider.stream({
  prompt: 'Interactive task...',
  signal: SignalUtils.merge(timeoutSignal, userController.signal),
});
```

### Provider Implementation with Required Signal

```typescript
// src/providers/llm/providers/claude/claude.provider.ts

export class ClaudeProvider implements ILLMProvider {
  async *stream(request: StreamRequest): AsyncIterableIterator<StreamEvent> {
    const { signal } = request;

    try {
      // Register abort handler
      signal.addEventListener('abort', () => {
        // Clean up any provider-specific resources
      });

      const stream = await this.client.messages.create({
        messages: [{ role: 'user', content: request.prompt }],
        model: request.model || 'claude-3-opus-20240229',
        max_tokens: request.maxTokens || 1000,
        stream: true,
      });

      for await (const chunk of stream) {
        // Check if aborted
        if (signal.aborted) {
          throw new Error('Stream aborted');
        }

        if (chunk.type === 'content_block_delta') {
          yield {
            type: 'token',
            token: chunk.delta.text,
            metadata: {
              timestamp: Date.now(),
              model: request.model || 'claude-3-opus-20240229',
            },
          };
        }
      }

      yield { type: 'done' };
    } catch (error) {
      if (signal.aborted) {
        yield {
          type: 'error',
          error: new Error('Stream cancelled'),
        };
      } else {
        yield {
          type: 'error',
          error: error as Error,
        };
      }
    }
  }
}
```

### Integration with Flow System

```typescript
// src/flow/steps/llm-stream-step.ts

export class LLMStreamStep implements IStep {
  private controller?: AbortController;

  constructor(
    private provider: ILLMProvider,
    private logger: Logger
  ) {}

  async execute(context: IContext): Promise<boolean> {
    const prompt = context.get('prompt') || '';
    const timeout = parseInt(context.get('timeout') || '30000');

    // Always create a signal - required by interface
    const { signal, controller } = SignalUtils.timeoutWithController(timeout);
    this.controller = controller;

    try {
      const tokens: string[] = [];

      for await (const event of this.provider.stream({ prompt, signal })) {
        if (event.type === 'token' && event.token) {
          tokens.push(event.token);
          context.set('partial_response', tokens.join(''));
          this.logger.info(`Streaming: ${tokens.length} tokens`);
        }
      }

      context.set('final_response', tokens.join(''));
      return true;
    } catch (error) {
      if (signal.aborted) {
        this.logger.warn('Stream was aborted');
        context.set('stream_aborted', 'true');
      }
      throw error;
    } finally {
      this.controller = undefined;
    }
  }

  // Allow external cancellation
  abort() {
    this.controller?.abort();
  }
}
```

### Benefits of Required Signal

1. **Enforces Good Practices** - Every stream operation must consider cancellation
2. **Cleaner Implementation** - No need to check `signal?.aborted`, always `signal.aborted`
3. **Better Resource Management** - Forces thinking about cleanup and timeouts
4. **Type Safety** - TypeScript ensures signal is always provided
5. **Utilities Help** - SignalUtils makes common patterns easy

### Stream Processing Utilities

[Previous stream processing utilities remain the same]

### Updated Components Architecture

#### NEW - LLM Provider System

- `src/providers/` - LLM provider directory
- `src/providers/llm/` - LLM interface and base classes
- `src/providers/llm/providers/` - Provider implementations
- `src/providers/llm/types/` - Type definitions
- `src/providers/llm/config/` - Configuration management
- `src/providers/llm/utils/` - Shared utilities

#### NEW - Provider Implementations

- `src/providers/llm/providers/claude.ts` - Claude/Anthropic service
- `src/providers/llm/providers/openai.ts` - OpenAI/ChatGPT service
- `src/providers/llm/providers/gemini.ts` - Google Gemini service
- `src/providers/llm/providers/grok.ts` - xAI Grok service

#### NEW - Configuration & Types

- `src/providers/llm/types/requests.ts` - Request type definitions
- `src/providers/llm/types/responses.ts` - Response type definitions
- `src/providers/llm/types/phases.ts` - Phase-specific types
- `src/providers/llm/config/providers.ts` - Provider configuration
- `src/providers/llm/config/models.ts` - Model configuration

#### NEW - Testing Infrastructure

- `tests/unit/providers/llm/` - LLM provider tests
- `tests/integration/providers/llm/` - Integration tests
- `tests/unit/providers/llm/providers/` - Provider-specific tests

## Implementation Strategy

### Phase 1: Architecture Design & Interface Definition

- [ ] **LLM Interface Design**
  - Define ILLMService interface with core methods
  - Design request/response type system
  - Create phase-specific method signatures
  - Plan configuration architecture

- [ ] **Type System Design**
  - Create comprehensive type definitions
  - Define provider-specific configurations
  - Design error handling types
  - Plan streaming response types

### Phase 2: SDK Research & Integration

- [ ] **SDK Investigation**
  - Research Claude/Anthropic SDK capabilities
  - Evaluate OpenAI SDK features
  - Investigate Google Gemini SDK
  - Assess xAI Grok API availability

- [ ] **Dependency Management**
  - Add required SDK dependencies
  - Configure TypeScript for new packages
  - Set up development environment
  - Plan package.json updates

### Phase 3: Provider Implementation

- [ ] **Claude Service Implementation**
  - Implement Claude provider with Anthropic SDK
  - Handle authentication and configuration
  - Implement phase-specific methods
  - Add error handling and retry logic

- [ ] **OpenAI Service Implementation**
  - Implement OpenAI provider with official SDK
  - Configure ChatGPT model selection
  - Implement streaming capabilities
  - Add usage tracking

- [ ] **Gemini Service Implementation**
  - Implement Google Gemini provider
  - Handle Google Cloud authentication
  - Implement model configuration
  - Add response parsing

- [ ] **Grok Service Implementation**
  - Implement xAI Grok provider
  - Handle API authentication
  - Implement rate limiting
  - Add error handling

### Phase 4: Configuration & Management

- [ ] **Configuration System**
  - Create provider configuration management
  - Implement secure API key handling
  - Add model selection logic
  - Create phase-to-provider mapping

- [ ] **Service Factory & Registry**
  - Create LLM service factory
  - Implement provider registry
  - Add service discovery
  - Create dependency injection integration

### Phase 5: Phase-Specific Integration

- [ ] **Planning Phase Integration**
  - Integrate with PLAN mode
  - Add requirements analysis capabilities
  - Implement architecture design support
  - Add documentation generation

- [ ] **Creative Phase Integration**
  - Integrate with CREATIVE mode
  - Add UI/UX design capabilities
  - Implement creative problem solving
  - Add design pattern generation

- [ ] **Implementation Phase Integration**
  - Integrate with IMPLEMENT mode
  - Add code generation capabilities
  - Implement refactoring support
  - Add optimization suggestions

- [ ] **QA Phase Integration**
  - Integrate with QA mode
  - Add testing strategy generation
  - Implement code review capabilities
  - Add validation and verification

### Phase 6: Testing & Validation

- [ ] **Unit Testing**
  - Test all LLM service interfaces
  - Test provider implementations
  - Test configuration management
  - Test error handling

- [ ] **Integration Testing**
  - Test SDK integrations
  - Test API connectivity
  - Test streaming operations
  - Test rate limiting

- [ ] **End-to-End Testing**
  - Test phase-specific workflows
  - Test provider switching
  - Test configuration changes
  - Test error recovery

## Quality Assurance Requirements

**CRITICAL: ALL TASKS MUST PASS THESE CHECKS BEFORE COMPLETION**

- [ ] `npm run test` - All tests pass (including new LLM service tests)
- [ ] `npm run lint` - All linting checks pass
- [ ] `npm run type-check` - TypeScript compilation passes
- [ ] `npm run format:check` - Code formatting is correct
- [ ] LLM services work with existing flow system
- [ ] All existing tests continue to pass
- [ ] New LLM service tests provide comprehensive coverage
- [ ] API key security and handling verified
- [ ] Rate limiting and error handling tested
- [ ] Phase-specific integration validated

## Success Criteria

- [ ] ILLMService interface defined with unified API
- [ ] Claude/Anthropic service fully implemented
- [ ] OpenAI/ChatGPT service fully implemented
- [ ] Google Gemini service fully implemented
- [ ] xAI Grok service fully implemented
- [ ] Configuration management system operational
- [ ] Phase-specific capabilities integrated
- [ ] Service factory and registry functional
- [ ] Comprehensive test coverage for all components
- [ ] Security and rate limiting implemented
- [ ] Documentation and examples provided
- [ ] All quality assurance checks pass

## Current Status

**STATUS: PLAN UPDATED** ✅

Interface improved with:

- **Required** AbortSignal for all operations
- **SignalUtils** helper class for common patterns
- **Cleaner** implementation without optional checks
- **Better** resource management
- **Enforced** cancellation consideration

## Next Steps

1. **Implement** SignalUtils with common patterns
2. **Create** base provider with required signal handling
3. **Test** signal patterns with each SDK
4. **Document** best practices for signal usage

Making the signal required ensures that every LLM operation has proper cancellation support, leading to more robust and resource-efficient implementations.

## VAN Mode Verification Complete ✅

### File Verification Results

- **Current Test Status**: ✅ All 48 tests passing
- **TypeScript Compilation**: ✅ No type errors
- **Existing Services Directory**: ❌ Not present (clean slate)
- **Flow System State**: ✅ Clean and ready for integration

### Complexity Assessment

- **Level**: 4 (Complex System) - Confirmed
- **Scope**: Multi-provider LLM architecture with phase integration
- **Impact**: High - adds entirely new service layer
- **Risk**: High - external API dependencies, configuration complexity

### Platform Detection

- **Environment**: macOS 24.5.0
- **Node.js**: Compatible with existing project setup
- **Dependencies**: Multiple new SDK dependencies required

### VAN Mode Decision

**✅ VERIFIED: Ready for PLAN Mode**

- All baseline checks passed
- Implementation scope is comprehensive
- Level 4 complexity confirmed
- Ready to transition to PLAN mode for detailed architectural planning

## Transition to PLAN Mode

**Next Action**: Execute PLAN mode to create detailed implementation strategy
**Expected Outcome**: Comprehensive architectural plan with phased approach
**Quality Gate**: All existing functionality must remain intact

## SDK Research Required

Before implementation, thorough research needed on:

- Anthropic Claude SDK capabilities and API
- OpenAI SDK features and model options
- Google Gemini SDK availability and integration
- xAI Grok API documentation and access
- Authentication patterns and security requirements
- Rate limiting and usage tracking approaches
