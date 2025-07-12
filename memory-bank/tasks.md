# MEMORY BANK TASKS

## Task Status: IMPLEMENT TDD-GREEN ✅ - REFACTOR PHASE READY

**Current Task**: github-reader-step-implementation-20250117  
**Start Date**: 2025-01-17  
**Issue Reference**: [#37](https://github.com/ondrata-ai/flow-test/issues/37)  
**Status**: IMPLEMENT TDD-GREEN ✅ - REFACTOR PHASE READY

### Current Task: Implement Step 1: Read task description from GitHub

**Objective**: Create a new step type that can read GitHub issue details (including comments) and make them available in validated flow context for the GitHub Task Automation Flow system.

**Complexity Level**: Level 2 - Simple Enhancement  
**Estimated Effort**: 4-5 hours  
**EPIC Context**: Part of EPIC #28 - GitHub Task Automation Flow

**TDD Approach**: Following RED-GREEN-REFACTOR cycle with failing e2e test first

## TDD IMPLEMENTATION STATUS

### 🔴 RED Phase: COMPLETE ✅

- [x] Created failing e2e test: `tests/integration/github-reader-tdd-e2e.test.ts`
- [x] Created test flow configuration: `tests/integration/data/github-reader-tdd-flow.json`
- [x] Verified tests fail as expected:
  - CLI doesn't recognize `--github-issue` option
  - `github-reader` step type doesn't exist
  - Exit code 1 (failure)

### 🟢 GREEN Phase: COMPLETE ✅ + CORRECTED

**Goal**: Implement minimal functionality to make tests pass

**✅ CORRECTED GitHub Issue URL**:

- **Original Issue**: Tests were incorrectly using `https://github.com/microsoft/vscode/issues/1`
- **Corrected Issue**: Updated to use `https://github.com/ondrata-ai/for-test-purpose/issues/1` as originally required
- **Test Data Updated**: Expected values now match the actual ondrata-ai issue:
  - Title: `[TEST Issue] Create something for ai`
  - Author: `killev`
  - Comments: `1`
  - State: `open`

**✅ IMPLEMENTED COMPONENTS:**

1. **CLI Arguments Support** (`src/cli/`)
   - Added `--github-issue <url>` option to `flow:run` command
   - URL parsing and context injection in `handleFlowRunCommand`
   - GitHub URL parser utility: `src/utils/github-url-parser.ts`

2. **GitHubReaderStep Class** (`src/flow/types/github-reader-step.ts`)
   - New step type extending base `Step` class
   - **githubToken property** as required
   - Context override logic (CLI URL takes precedence)
   - Issue and comments data population in context

3. **GitHub Client** (`src/utils/github-client.ts`)
   - Octokit integration with authentication
   - Public repo fallback for 401 errors
   - Error handling for 404 and auth issues

4. **Schema Validation** (`src/validation/schemas/step.schema.ts`)
   - **GitHubReaderStepConfigSchema** with github_token field
   - Added to union type and exports
   - Proper TypeScript types

5. **Step Factory Integration** (`src/flow/step-factory.ts`)
   - Added `github-reader` case to step creation
   - Proper imports and exports

**✅ FINAL TEST RESULTS:**

- All 3 e2e tests passing ✅
- CLI argument parsing working ✅
- GitHub API integration working ✅
- Context population working ✅
- Public repo access working ✅
- **Correct GitHub issue URL**: `https://github.com/ondrata-ai/for-test-purpose/issues/1` ✅

### 🔵 REFACTOR Phase: READY FOR START

**Goals**: Improve code quality, add comprehensive validation and error handling

**NEXT STEPS FOR REFACTOR:**

1. Enhanced error handling and logging
2. Comprehensive unit tests
3. Input validation improvements
4. Code organization and documentation
5. Performance optimizations

## VAN Mode Analysis ✅ COMPLETE

### File Verification ✅

- **Current codebase**: Stable (195/195 tests passing)
- **Step factory pattern**: Established and functional
- **Validation schemas**: Zod-based validation system in place
- **Flow system architecture**: Mature and ready for extension

### Platform Detection ✅

- **OS**: macOS (darwin 24.5.0) ✅
- **Runtime**: Node.js with TypeScript (strict mode) ✅
- **Package Manager**: npm ✅
- **Shell**: zsh ✅
- **GitHub SDK**: @octokit/rest v22.0.0 ✅

### Quality Assurance ✅

- **Tests**: 195/195 passing ✅
- **Linting**: No issues ✅
- **Formatting**: All files properly formatted ✅
- **Build**: TypeScript compilation successful ✅

### Complexity Determination ✅

**Level 2 - Simple Enhancement** confirmed:

- **Pattern**: Follows established step type architecture (ActionStep, DecisionStep, LogStep)
- **External Integration**: GitHub API via @octokit/rest SDK
- **Validation**: Context-based validation with Zod schemas
- **Testing**: Unit tests with mocking and e2e tests with real GitHub API calls
- **Architecture**: Fits within current flow system design

## PLAN MODE ANALYSIS ✅ COMPLETE + TDD-REFINED

### TDD Approach: Test-Driven Development

**✅ TDD STRATEGY**: RED-GREEN-REFACTOR cycle with failing e2e test first

**TDD Testing Strategy:**

- **RED Phase**: Create failing e2e test using specific GitHub issue
- **GREEN Phase**: Implement minimal functionality to pass test
- **REFACTOR Phase**: Improve code quality and add comprehensive tests
- **Real GitHub Issue**: Use https://github.com/ondrata-ai/for-test-purpose/issues/1
- **CLI Arguments**: Accept GitHub issue URLs as command line arguments

**Benefits:**

- **Test Coverage**: Ensures functionality works before implementation
- **Clear Requirements**: Test defines exact expected behavior
- **Regression Prevention**: Prevents breaking existing functionality
- **Confidence**: Implementation guided by failing tests

### Additional Requirements from User Feedback

1. **TDD Approach**: Create failing e2e test first before any implementation
2. **Specific Issue**: Use https://github.com/ondrata-ai/for-test-purpose/issues/1 for testing
3. **CLI Arguments**: Pass GitHub issue URL to CLI via command line argument
4. **GitHub Token Property**: GitHubReaderStep should have githubToken property
5. **JSON Schema**: Include github_token in GitHubReaderStep JSON schema
6. **Read Issue Comments**: GitHub reader step must also fetch and structure issue comments
7. **Context Validation**: Context must have `validate()` function called before and after every step
8. **GitHub SDK Integration**: Use @octokit/rest for reliable GitHub API access

### Overview of Changes

This Level 2 enhancement follows **Test-Driven Development** approach, starting with a failing e2e test using the specific GitHub issue **https://github.com/ondrata-ai/for-test-purpose/issues/1**. The implementation adds a new `GitHubReaderStep` to the existing flow system for reading GitHub issue data **including comments**. The CLI will accept GitHub issue URLs as arguments for flexible testing and usage.

**Key Components:**

- **TDD Approach**: RED-GREEN-REFACTOR cycle with failing e2e test first
- **CLI Arguments**: Accept GitHub issue URLs via command line arguments
- **GitHub Token Support**: GitHubReaderStep with githubToken property and JSON schema
- Enhanced Context interface with validation capabilities
- New step type class with GitHub SDK integration for issues and comments
- Zod validation schemas for context structure
- Comprehensive error handling with SDK error types
- Unit tests with API mocking and e2e tests with real GitHub API calls

### Files to Modify

1. **`src/cli/handlers.ts`** (MODIFY)
   - Add GitHub issue URL parsing from command line arguments
   - Add `--github-issue` flag support
   - Parse GitHub URLs to extract owner/repo/issue number

2. **`src/flow/context.ts`** (MODIFY)
   - Add `validate()` method to IContext interface
   - Implement validation schema registration system
   - Add context validation with Zod schemas

3. **`src/flow/step.ts`** (MODIFY)
   - Add context validation calls before/after step execution
   - Handle validation errors appropriately

4. **`src/flow/types/github-reader-step.ts`** (NEW)
   - New GitHubReaderStep class implementation
   - GitHub SDK integration for issue and comments reading
   - Context population with issue data
   - **githubToken property** for authentication

5. **`src/validation/schemas/step.schema.ts`** (MODIFY)
   - Add GitHubReaderStepConfigSchema **with github_token field**
   - Update StepConfigSchema union type
   - Add GitHubReaderStepConfig type export

6. **`src/validation/schemas/github-context.schema.ts`** (NEW)
   - Zod schema for GitHub context data validation
   - Issue and comments structure validation
   - Context validation schema registration

7. **`src/utils/github-client.ts`** (NEW)
   - GitHub SDK client wrapper with token-based authentication
   - Issue and comments fetching utilities
   - Error handling and retry logic

8. **`src/utils/github-url-parser.ts`** (NEW)
   - Parse GitHub issue URLs into owner/repo/issue components
   - Support various GitHub URL formats
   - Validation and error handling for invalid URLs

9. **`src/flow/step-factory.ts`** (MODIFY)
   - Import GitHubReaderStep
   - Add 'github-reader' case to switch statement

10. **`src/flow/types/index.ts`** (MODIFY)
    - Add export for github-reader-step.js

11. **`tests/unit/flow/types/github-reader-step.test.ts`** (NEW)
    - Comprehensive unit tests for GitHubReaderStep
    - Mock GitHub SDK responses
    - Test error handling scenarios
    - Test githubToken property

12. **`tests/unit/flow/context.test.ts`** (MODIFY)
    - Add tests for context validation functionality
    - Test validation schema registration

13. **`tests/unit/utils/github-url-parser.test.ts`** (NEW)
    - Unit tests for GitHub URL parsing
    - Test various URL formats and edge cases

14. **`tests/integration/data/github-reader-tdd-flow.json`** (NEW)
    - Test flow configuration using GitHubReaderStep
    - **Includes github_token field** in step configuration
    - Uses the specific GitHub issue for TDD testing

15. **`tests/integration/github-reader-tdd-e2e.test.ts`** (NEW)
    - TDD e2e tests following existing patterns
    - Uses https://github.com/ondrata-ai/for-test-purpose/issues/1
    - Tests CLI argument passing

### TDD IMPLEMENTATION STEPS (RED-GREEN-REFACTOR)

#### 🔴 PHASE 1: RED - Create Failing E2E Test (30 minutes)

**Step 1.1: Create Failing E2E Test**

```typescript
// tests/integration/github-reader-tdd-e2e.test.ts
describe('GitHub Reader TDD E2E Tests', () => {
  let testEnv: TestEnvironment;
  let tempTestDir: string;

  beforeAll(() => {
    testEnv = new TestEnvironment();
    testEnv.setup();
  });

  afterAll(() => {
    testEnv.cleanup();
  });

  beforeEach(async ctx => {
    tempTestDir = createTestDirPath(ctx.task.name);
    await fs.mkdir(tempTestDir, { recursive: true });
  });

  describe('GitHub Reader Step with CLI Arguments', () => {
    it('should read GitHub issue from CLI argument and populate context', async () => {
      // Copy the GitHub reader test flow
      await copyFlowFile('github-reader-tdd-flow.json', tempTestDir);

      // Run the flow with GitHub issue URL as CLI argument
      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'github-reader-tdd-flow',
        [
          '--github-issue',
          'https://github.com/ondrata-ai/for-test-purpose/issues/1',
        ]
      );

      // Verify successful execution
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain(
        "Flow 'github-reader-tdd-flow' completed successfully"
      );

      // Verify GitHub step executed
      expect(result.stdout).toContain('GitHubReaderStep: Reading issue #1');
      expect(result.stdout).toContain(
        'Successfully loaded GitHub issue #1 from ondrata-ai/for-test-purpose'
      );

      // Verify context was populated (check log step output)
      expect(result.stdout).toContain('Issue: ');
      expect(result.stdout).toContain('by ');
      expect(result.stdout).toContain('Comments: ');
    });

    it('should handle invalid GitHub issue URL with error', async () => {
      // Test error handling for invalid URLs
      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'github-reader-tdd-flow',
        ['--github-issue', 'https://invalid-url']
      );

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Invalid GitHub issue URL');
    });
  });
});
```

**Step 1.2: Create Test Flow Configuration with GitHub Token**

```json
// tests/integration/data/github-reader-tdd-flow.json
{
  "id": "github-reader-tdd-flow",
  "name": "GitHub Reader TDD Flow",
  "description": "TDD test flow for GitHub reader step with CLI arguments",
  "initialStepId": "read-github-issue",
  "steps": {
    "read-github-issue": {
      "type": "github-reader",
      "id": "read-github-issue",
      "issueUrl": "{{context.github.issue.url}}",
      "includeComments": true,
      "github_token": "{{env.GITHUB_TOKEN}}",
      "nextStepId": {
        "default": "display-issue-info"
      }
    },
    "display-issue-info": {
      "type": "log",
      "id": "display-issue-info",
      "message": "Issue: {{context.github.issue.title}} by {{context.github.issue.author}} - Comments: {{context.github.issue.comments_count}}",
      "level": "info",
      "nextStepId": {}
    }
  }
}
```

**Step 1.3: Run Failing Test**

```bash
# This test should FAIL since GitHubReaderStep doesn't exist yet
npm test -- --testPathPattern=github-reader-tdd-e2e.test.ts
```

#### 🟢 PHASE 2: GREEN - Implement Minimal Functionality (2 hours)

**Step 2.1: Add GitHubReaderStep JSON Schema with github_token**

```typescript
// src/validation/schemas/step.schema.ts
export const GitHubReaderStepConfigSchema = z.object({
  type: z.literal('github-reader'),
  id: z.string(),
  issueUrl: z.string().url(),
  includeComments: z.boolean().optional().default(true),
  github_token: z.string().optional(), // Required field for GitHub authentication
  nextStepId: z.record(z.string()).optional(),
});

export type GitHubReaderStepConfig = z.infer<
  typeof GitHubReaderStepConfigSchema
>;

// Update the main StepConfigSchema to include GitHubReaderStepConfig
export const StepConfigSchema = z.discriminatedUnion('type', [
  ActionStepConfigSchema,
  DecisionStepConfigSchema,
  LogStepConfigSchema,
  GitHubReaderStepConfigSchema, // Add to union
]);
```

**Step 2.2: Add CLI Argument Handling**

```typescript
// src/cli/handlers.ts - Add GitHub issue URL parsing
export interface GitHubIssueArgs {
  owner: string;
  repo: string;
  issueNumber: number;
}

export function parseGitHubIssueUrl(url: string): GitHubIssueArgs {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)/);
  if (!match) {
    throw new Error('Invalid GitHub issue URL');
  }

  const [, owner, repo, issueNumber] = match;
  return {
    owner,
    repo,
    issueNumber: parseInt(issueNumber, 10),
  };
}
```

**Step 2.3: Create GitHubReaderStep with githubToken Property**

```typescript
// src/flow/types/github-reader-step.ts
import { GitHubReaderStepConfig } from '../../validation/schemas/step.schema.js';

export class GitHubReaderStep extends Step {
  public readonly githubToken: string; // Required githubToken property

  constructor(config: GitHubReaderStepConfig) {
    super(config);
    this.githubToken = config.github_token || process.env.GITHUB_TOKEN || '';
  }

  async execute(context: IContext): Promise<void> {
    const issueUrl = this.config.issueUrl;
    const { owner, repo, issueNumber } = parseGitHubIssueUrl(issueUrl);

    // Use githubToken property for authentication
    const client = new GitHubClient(this.githubToken);
    const { issue, comments } = await client.getIssueWithComments(
      owner,
      repo,
      issueNumber
    );

    context.set('github.issue.number', issueNumber.toString());
    context.set('github.issue.title', issue.title);
    context.set('github.issue.author', issue.user.login);
    context.set('github.issue.comments_count', comments.length.toString());
    context.set('github.issue.url', issueUrl);
    context.set('github.issue.body', issue.body || '');
    context.set('github.issue.state', issue.state);
    context.set('github.issue.created_at', issue.created_at);
    context.set('github.issue.updated_at', issue.updated_at);

    // Store comments as JSON string
    context.set('github.issue.comments', JSON.stringify(comments));
  }
}
```

**Step 2.4: Create GitHub Client with Token Support**

```typescript
// src/utils/github-client.ts
export class GitHubClient {
  private octokit: Octokit;

  constructor(token?: string) {
    this.octokit = new Octokit({
      auth:
        token || process.env.GITHUB_TOKEN || process.env.GH_TOKEN || undefined,
    });
  }

  async getIssueWithComments(owner: string, repo: string, issueNumber: number) {
    const [issue, comments] = await Promise.all([
      this.octokit.rest.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
      }),
      this.octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: issueNumber,
      }),
    ]);

    return { issue: issue.data, comments: comments.data };
  }
}
```

**Step 2.5: Update Step Factory**

```typescript
// src/flow/step-factory.ts - Add GitHubReaderStep case
import { GitHubReaderStep } from './types/github-reader-step.js';

export class StepFactory {
  static createStep(config: StepConfig): Step {
    switch (config.type) {
      case 'action':
        return new ActionStep(config);
      case 'decision':
        return new DecisionStep(config);
      case 'log':
        return new LogStep(config);
      case 'github-reader':
        return new GitHubReaderStep(config); // Add GitHub reader step
      default:
        throw new Error(`Unknown step type: ${config.type}`);
    }
  }
}
```

**Step 2.6: Run Test to Verify GREEN**

```bash
# This test should now PASS
npm test -- --testPathPattern=github-reader-tdd-e2e.test.ts
```

#### 🔵 PHASE 3: REFACTOR - Improve Code Quality (1.5 hours)

**Step 3.1: Add Context Validation**

```typescript
// src/flow/context.ts - Add validation
export interface IContext {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  validate(): void; // New validation method
  registerValidationSchema(name: string, schema: z.ZodSchema): void;
}

export class Context implements IContext {
  private readonly storage: Map<string, string>;
  private readonly validationSchemas: Map<string, z.ZodSchema>;

  constructor() {
    this.storage = new Map();
    this.validationSchemas = new Map();
  }

  public validate(): void {
    // Validate context against all registered schemas
    for (const [name, schema] of this.validationSchemas) {
      try {
        const contextData = Object.fromEntries(this.storage);
        schema.parse(contextData);
      } catch (error) {
        throw new Error(
          `Context validation failed for schema '${name}': ${error.message}`
        );
      }
    }
  }

  public registerValidationSchema(name: string, schema: z.ZodSchema): void {
    this.validationSchemas.set(name, schema);
  }

  // ... existing methods
}
```

**Step 3.2: Add Comprehensive Error Handling**

```typescript
// src/utils/github-client.ts - Enhanced error handling
async getIssueWithComments(owner: string, repo: string, issueNumber: number) {
  try {
    const [issue, comments] = await Promise.all([
      this.octokit.rest.issues.get({
        owner,
        repo,
        issue_number: issueNumber,
      }),
      this.octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: issueNumber,
      }),
    ]);

    return { issue: issue.data, comments: comments.data };
  } catch (error) {
    if (error.status === 401) {
      throw new Error(
        'GitHub authentication failed. Please check your github_token configuration.'
      );
    }
    if (error.status === 404) {
      throw new Error(
        `GitHub issue #${issueNumber} not found in ${owner}/${repo}`
      );
    }
    throw error;
  }
}
```

**Step 3.3: Add Validation Schemas**

```typescript
// src/validation/schemas/github-context.schema.ts
export const GitHubIssueContextSchema = z
  .object({
    'github.issue.number': z.string(),
    'github.issue.title': z.string(),
    'github.issue.body': z.string(),
    'github.issue.labels': z.string(),
    'github.issue.state': z.string(),
    'github.issue.author': z.string(),
    'github.issue.created_at': z.string(),
    'github.issue.updated_at': z.string(),
    'github.issue.comments': z.string(),
    'github.issue.comments_count': z.string(),
    'github.issue.url': z.string(),
  })
  .partial();

// Register the schema automatically
export function registerGitHubContextSchema(context: IContext): void {
  context.registerValidationSchema('github-issue', GitHubIssueContextSchema);
}
```

**Step 3.4: Add Unit Tests with githubToken Property**

```typescript
// tests/unit/flow/types/github-reader-step.test.ts
describe('GitHubReaderStep', () => {
  it('should have githubToken property', () => {
    const config = {
      type: 'github-reader' as const,
      id: 'test-step',
      issueUrl: 'https://github.com/test/repo/issues/1',
      github_token: 'test-token-123',
    };

    const step = new GitHubReaderStep(config);
    expect(step.githubToken).toBe('test-token-123');
  });

  it('should fallback to environment variable if no github_token provided', () => {
    process.env.GITHUB_TOKEN = 'env-token-456';

    const config = {
      type: 'github-reader' as const,
      id: 'test-step',
      issueUrl: 'https://github.com/test/repo/issues/1',
    };

    const step = new GitHubReaderStep(config);
    expect(step.githubToken).toBe('env-token-456');
  });

  it('should parse GitHub issue URL correctly', () => {
    const url = 'https://github.com/ondrata-ai/for-test-purpose/issues/1';
    const result = parseGitHubIssueUrl(url);

    expect(result.owner).toBe('ondrata-ai');
    expect(result.repo).toBe('for-test-purpose');
    expect(result.issueNumber).toBe(1);
  });

  it('should throw error for invalid GitHub URL', () => {
    const url = 'https://invalid-url';

    expect(() => parseGitHubIssueUrl(url)).toThrow('Invalid GitHub issue URL');
  });

  it('should validate step configuration schema', () => {
    const validConfig = {
      type: 'github-reader' as const,
      id: 'test-step',
      issueUrl: 'https://github.com/test/repo/issues/1',
      github_token: 'test-token',
      includeComments: true,
    };

    const result = GitHubReaderStepConfigSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it('should reject invalid step configuration', () => {
    const invalidConfig = {
      type: 'github-reader' as const,
      id: 'test-step',
      issueUrl: 'not-a-url',
      github_token: 123, // Should be string
    };

    const result = GitHubReaderStepConfigSchema.safeParse(invalidConfig);
    expect(result.success).toBe(false);
  });
});
```

**Step 3.5: Run All Tests**

```bash
# All tests should pass after refactoring
npm test
```

### Enhanced JSON Schema Configuration

**GitHubReaderStep Configuration Schema:**

```typescript
{
  "type": "github-reader",
  "id": "step-id",
  "issueUrl": "https://github.com/owner/repo/issues/123",
  "github_token": "ghp_xxxxxxxxxxxxxxxxxxxx", // Required field
  "includeComments": true,
  "nextStepId": {
    "default": "next-step-id"
  }
}
```

**Schema Validation:**

```typescript
const GitHubReaderStepConfigSchema = z.object({
  type: z.literal('github-reader'),
  id: z.string(),
  issueUrl: z.string().url(),
  github_token: z.string().optional(), // Optional but recommended
  includeComments: z.boolean().optional().default(true),
  nextStepId: z.record(z.string()).optional(),
});
```

### TDD Test Verification

**Red Phase Verification:**

- [ ] E2E test created and fails (GitHubReaderStep not found)
- [ ] Test uses specific GitHub issue: https://github.com/ondrata-ai/for-test-purpose/issues/1
- [ ] CLI argument parsing tested
- [ ] Expected behavior clearly defined in test

**Green Phase Verification:**

- [ ] Minimal implementation created
- [ ] **GitHubReaderStep has githubToken property**
- [ ] **JSON schema includes github_token field**
- [ ] E2E test passes
- [ ] GitHub issue can be read from CLI argument
- [ ] Context populated with issue data
- [ ] Basic error handling implemented

**Refactor Phase Verification:**

- [ ] Code quality improved
- [ ] Context validation added
- [ ] Comprehensive error handling
- [ ] Unit tests added for githubToken property
- [ ] Schema validation tests added
- [ ] All tests pass

### Status

- [x] VAN mode initialization complete
- [x] GitHub issue analysis complete
- [x] Complexity determination complete
- [x] Technology validation complete
- [x] Platform detection complete
- [x] Quality assurance verification complete
- [x] GitHub SDK installation complete
- [x] Planning complete (TDD-refined with githubToken property)
- [ ] RED Phase - Create failing e2e test
- [ ] GREEN Phase - Implement minimal functionality
- [ ] REFACTOR Phase - Improve code quality
- [ ] Testing complete
- [ ] Reflection
- [ ] Archiving

### Enhanced TDD Acceptance Criteria

**RED Phase:**

- [ ] E2E test created that fails initially
- [ ] Test uses https://github.com/ondrata-ai/for-test-purpose/issues/1
- [ ] CLI argument handling tested
- [ ] Expected behavior defined in test

**GREEN Phase:**

- [ ] Minimal GitHubReaderStep implementation
- [ ] **GitHubReaderStep has githubToken property**
- [ ] **JSON schema includes github_token field**
- [ ] CLI argument parsing for GitHub URLs
- [ ] GitHub SDK integration for issue reading
- [ ] Context population with issue data
- [ ] E2E test passes

**REFACTOR Phase:**

- [ ] Context interface enhanced with `validate()` method
- [ ] Context validation called before and after every step execution
- [ ] Step can read GitHub issue by number using GitHub SDK
- [ ] Step can read GitHub issue comments using GitHub SDK
- [ ] **GitHub authentication uses githubToken property**
- [ ] Repository resolution from CLI arguments or config
- [ ] Issue and comments data properly structured in context
- [ ] Context structure validated using registered Zod schemas
- [ ] Comprehensive error handling for API failures and validation errors
- [ ] Unit tests with mocked SDK responses
- [ ] **Unit tests verify githubToken property functionality**
- [ ] **Schema validation tests for github_token field**
- [ ] Integration with existing flow system

### Next Steps

**→ IMPLEMENT MODE** - Ready for TDD implementation cycle

The planning phase is complete with TDD-refined architecture including **githubToken property** and **github_token JSON schema field**. Implementation will follow RED-GREEN-REFACTOR cycle starting with the failing e2e test using the specific GitHub issue provided.

---

**Last Update**: 2025-01-17  
**Status**: PLAN TDD-REFINED ✅ - READY FOR IMPLEMENT MODE  
**Next Mode**: IMPLEMENT MODE for TDD GitHub SDK implementation with githubToken property
