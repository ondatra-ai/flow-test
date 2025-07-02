# Development Guide

This guide covers everything needed to contribute to the Claude Code CLI project, from setting up the development environment to implementing new features.

## Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **Git**: For version control
- **TypeScript**: Global installation recommended (`npm install -g typescript`)
- **Code Editor**: VS Code recommended with TypeScript extensions

## Development Environment Setup

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd claude-code-cli

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start development mode
npm run dev
```

### 2. Project Structure Overview

```
claude-code-cli/
├── src/
│   ├── cli/                  # Chat interface implementation
│   │   ├── chat.ts          # Main chat loop
│   │   ├── renderer.ts      # UI rendering with Ink
│   │   └── input-handler.ts # User input processing
│   ├── flows/               # Flow execution engine
│   │   ├── flow-loader.ts   # Load and validate flows
│   │   ├── flow-executor.ts # Execute flow steps
│   │   ├── condition-evaluator.ts # JavaScript condition evaluation
│   │   └── types.ts         # Flow type definitions
│   ├── mcp/                 # MCP server integration
│   │   ├── server-manager.ts # Server lifecycle management
│   │   ├── client.ts        # MCP protocol client
│   │   ├── tool-registry.ts # Tool discovery and caching
│   │   └── types.ts         # MCP type definitions
│   ├── config/              # Configuration management
│   │   ├── config-loader.ts # Load .flows directory
│   │   └── validator.ts     # Configuration validation
│   ├── utils/               # Utility functions
│   │   ├── logger.ts        # Structured logging
│   │   └── errors.ts        # Custom error classes
│   └── index.ts             # Main entry point
├── tests/
│   ├── unit/                # Unit tests (mirrors src structure)
│   └── integration/         # Integration tests
├── doc/                     # Documentation
├── examples/                # Example configurations
└── scripts/                 # Build and utility scripts
```

### 3. Development Scripts

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Run tests with coverage
npm run test:coverage
```

## TypeScript Configuration

The project uses the strictest TypeScript settings:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Key Rules:**

- No `any` types except when absolutely necessary
- All functions must have explicit return types
- All variables must be explicitly typed when not obvious
- Handle all potential null/undefined cases

## Code Quality Standards

### ESLint Configuration

```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/prefer-readonly": "error"
  }
}
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### Pre-commit Hooks

The project uses Husky for pre-commit hooks:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write", "git add"]
  }
}
```

## Testing Strategy

### Test Organization

Tests are organized to mirror the source code structure:

```
tests/
├── unit/
│   ├── cli/
│   │   ├── chat.test.ts
│   │   ├── renderer.test.ts
│   │   └── input-handler.test.ts
│   ├── flows/
│   │   ├── flow-loader.test.ts
│   │   ├── flow-executor.test.ts
│   │   └── condition-evaluator.test.ts
│   └── mcp/
│       ├── server-manager.test.ts
│       ├── client.test.ts
│       └── tool-registry.test.ts
└── integration/
    ├── flow-execution.test.ts
    ├── mcp-integration.test.ts
    └── cli-interaction.test.ts
```

### Testing Framework

Using **Vitest** for both unit and integration tests:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('FlowExecutor', () => {
  it('should execute a simple flow', async () => {
    // Test implementation
  });
});
```

### Testing Guidelines

**Unit Tests:**

- Test individual functions and classes in isolation
- Mock external dependencies
- Focus on business logic and edge cases
- Aim for 80% coverage minimum

**Integration Tests:**

- Test interactions between components
- Use real MCP servers when possible
- Test complete user workflows
- Verify data flow and state management

**Example Unit Test:**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { FlowLoader } from '../src/flows/flow-loader.js';

describe('FlowLoader', () => {
  it('should load valid flow configuration', async () => {
    const mockFs = vi.mocked(fs);
    mockFs.readFile.mockResolvedValue(
      JSON.stringify({
        id: 'test-flow',
        name: 'Test Flow',
        initialStep: 'start',
        steps: {
          start: {
            type: 'prompt',
            prompt: 'Hello',
            tools: [],
            mcpServer: 'test',
            nextStep: null,
          },
        },
      })
    );

    const loader = new FlowLoader();
    const flow = await loader.loadFlow('test-flow.json');

    expect(flow.id).toBe('test-flow');
    expect(flow.steps.start).toBeDefined();
  });
});
```

## Architecture Guidelines

### Module Design

Each module should follow these principles:

1. **Single Responsibility** - Each class/function has one clear purpose
2. **Dependency Injection** - Use constructor injection for dependencies
3. **Interface Segregation** - Define clear interfaces for external contracts
4. **Error Handling** - Use custom error classes with context

### Example Module Structure

```typescript
// types.ts - Type definitions
export interface FlowStep {
  type: 'prompt' | 'condition';
  // ... other properties
}

// flow-loader.ts - Implementation
export class FlowLoader {
  constructor(
    private readonly fileSystem: FileSystemInterface,
    private readonly validator: ValidatorInterface,
    private readonly logger: LoggerInterface
  ) {}

  public async loadFlow(flowPath: string): Promise<Flow> {
    try {
      const content = await this.fileSystem.readFile(flowPath);
      const flowData = JSON.parse(content);

      this.validator.validateFlow(flowData);
      this.logger.info('Flow loaded successfully', { flowId: flowData.id });

      return flowData as Flow;
    } catch (error) {
      this.logger.error('Failed to load flow', { flowPath, error });
      throw new FlowLoadError(`Failed to load flow: ${flowPath}`, error);
    }
  }
}
```

### Error Handling

Use custom error classes with proper inheritance:

```typescript
// errors.ts
export abstract class BaseError extends Error {
  abstract readonly code: string;

  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class FlowLoadError extends BaseError {
  readonly code = 'FLOW_LOAD_ERROR';
}

export class MCPServerError extends BaseError {
  readonly code = 'MCP_SERVER_ERROR';
}
```

### Logging Standards

Use structured logging throughout the application:

```typescript
import { Logger } from '../utils/logger.js';

export class FlowExecutor {
  constructor(private readonly logger: Logger) {}

  public async executeStep(step: FlowStep): Promise<void> {
    this.logger.info('Executing flow step', {
      stepType: step.type,
      stepId: step.id,
      flowId: this.currentFlow.id,
    });

    try {
      // Step execution logic
      this.logger.debug('Step executed successfully', { stepId: step.id });
    } catch (error) {
      this.logger.error('Step execution failed', {
        stepId: step.id,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
}
```

## Contributing Workflow

### 1. Development Process

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement Changes**
   - Write code following style guidelines
   - Add comprehensive tests
   - Update documentation as needed

3. **Run Quality Checks**

   ```bash
   npm run lint        # Check code style
   npm run type-check  # Verify TypeScript
   npm test           # Run all tests
   npm run build      # Ensure it builds
   ```

4. **Commit Changes**

   ```bash
   git add .
   git commit -m "feat: add new flow execution feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### 2. Commit Message Format

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding/updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(flows): add conditional step execution
fix(mcp): handle server connection timeout
docs(api): update flow format documentation
test(cli): add integration tests for chat interface
```

### 3. Pull Request Guidelines

**PR Title:** Use conventional commit format

**PR Description Template:**

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass locally
```

## Debugging

### Debug Mode

Enable debug logging during development:

```bash
# Set debug environment
export DEBUG=claude-cli:*

# Or run with debug flag
npm run dev -- --debug
```

### VS Code Configuration

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug CLI",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/dist/index.js",
      "args": ["--debug"],
      "env": {
        "DEBUG": "claude-cli:*"
      },
      "console": "integratedTerminal",
      "sourceMaps": true,
      "outFiles": ["${workspaceFolder}/dist/**/*.js"]
    }
  ]
}
```

### Common Issues

**TypeScript Errors:**

- Ensure all imports use `.js` extensions for compiled output
- Check that types are properly exported/imported
- Verify strict null checks are handled

**Test Failures:**

- Check for proper mocking of external dependencies
- Ensure async operations are properly awaited
- Verify test isolation (no shared state)

**Build Issues:**

- Clear `dist/` directory: `rm -rf dist`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for circular dependencies

## Performance Considerations

### Async Operations

Use proper async patterns:

```typescript
// Good - Parallel execution
const [flows, servers] = await Promise.all([loadFlows(), loadServers()]);

// Bad - Sequential execution
const flows = await loadFlows();
const servers = await loadServers();
```

### Memory Management

- Use `WeakMap` for caching when appropriate
- Clean up event listeners and timers
- Avoid retaining references to large objects

### Error Recovery

Implement graceful degradation:

```typescript
export class MCPServerManager {
  private async startServer(config: ServerConfig): Promise<void> {
    try {
      await this.connectToServer(config);
    } catch (error) {
      this.logger.warn('Server failed to start, continuing without it', {
        serverName: config.name,
        error: error.message,
      });
      // Continue execution without this server
    }
  }
}
```

## Release Process

### Version Management

Follow semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. **Update Version**

   ```bash
   npm version patch  # or minor/major
   ```

2. **Update Changelog**
   - Document all changes since last release
   - Include breaking changes and migration notes

3. **Create Release PR**
   - Update version in package.json
   - Update CHANGELOG.md
   - Update documentation if needed

4. **Tag and Release**

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

5. **Publish to npm**
   ```bash
   npm publish
   ```

## Advanced Topics

### Adding New MCP Server Support

1. **Define Server Types**

   ```typescript
   // mcp/types.ts
   export interface CustomServerConfig extends BaseServerConfig {
     customOption: string;
   }
   ```

2. **Implement Server Client**

   ```typescript
   // mcp/clients/custom-client.ts
   export class CustomMCPClient extends BaseMCPClient {
     // Implementation
   }
   ```

3. **Register Server Type**
   ```typescript
   // mcp/server-manager.ts
   this.serverFactories.set('custom', CustomMCPClient);
   ```

### Extending Flow Capabilities

1. **Add New Step Type**

   ```typescript
   // flows/types.ts
   export interface CustomStep extends BaseStep {
     type: 'custom';
     customProperty: string;
   }
   ```

2. **Implement Step Executor**

   ```typescript
   // flows/executors/custom-executor.ts
   export class CustomStepExecutor implements StepExecutor {
     async execute(step: CustomStep): Promise<StepResult> {
       // Implementation
     }
   }
   ```

3. **Register Executor**
   ```typescript
   // flows/flow-executor.ts
   this.stepExecutors.set('custom', new CustomStepExecutor());
   ```

This development guide provides the foundation for contributing to the Claude Code CLI project. For specific questions or clarification on any topic, refer to the existing codebase or create an issue for discussion.
