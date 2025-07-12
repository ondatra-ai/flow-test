# MEMORY BANK TASKS

## Task Status: PLAN E2E-REFINED ✅ - READY FOR IMPLEMENT MODE

**Current Task**: github-reader-step-implementation-20250117  
**Start Date**: 2025-01-17  
**Issue Reference**: [#37](https://github.com/ondatra-ai/flow-test/issues/37)  
**Status**: PLAN E2E-REFINED ✅ - READY FOR IMPLEMENT MODE

### Current Task: Implement Step 1: Read task description from GitHub

**Objective**: Create a new step type that can read GitHub issue details (including comments) and make them available in validated flow context for the GitHub Task Automation Flow system.

**Complexity Level**: Level 2 - Simple Enhancement  
**Estimated Effort**: 4-5 hours  
**EPIC Context**: Part of EPIC #28 - GitHub Task Automation Flow

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

## PLAN MODE ANALYSIS ✅ COMPLETE + E2E-REFINED

### E2E Testing Refinement: Real GitHub API Integration

**✅ E2E IMPROVEMENT**: Real GitHub API calls following existing e2e test patterns

**E2E Testing Strategy:**

- **Real Flow Execution**: Use existing `runFlowCommand` pattern
- **Actual GitHub API**: Test with real GitHub issues
- **Known Issues**: Use stable public issues for reliable testing
- **TestEnvironment**: Follow existing e2e test architecture
- **Stdout/Stderr Verification**: Verify context population and step execution

**Benefits:**

- **Real Integration**: Tests actual GitHub API integration
- **Consistent**: Follows established e2e test patterns
- **Reliable**: Uses known public issues for stability
- **Comprehensive**: Tests full flow execution with GitHub data

### Additional Requirements from User Feedback

1. **Read Issue Comments**: GitHub reader step must also fetch and structure issue comments
2. **Context Validation**: Context must have `validate()` function called before and after every step
3. **E2E Testing**: Add real e2e tests following existing patterns with actual GitHub API calls
4. **GitHub SDK Integration**: Use @octokit/rest for reliable GitHub API access
5. **Secure Authentication**: Use environment variables for GitHub tokens, never JSON config

### Overview of Changes

This Level 2 enhancement adds a new `GitHubReaderStep` to the existing flow system for reading GitHub issue data **including comments**. The implementation uses the **@octokit/rest SDK** for reliable GitHub API integration with **context-based validation**, **secure environment-based authentication**, and **comprehensive e2e testing**.

**Key Components:**

- Enhanced Context interface with validation capabilities
- New step type class with GitHub SDK integration for issues and comments
- Secure authentication using environment variables only
- Zod validation schemas for context structure
- Comprehensive error handling with SDK error types
- Unit tests with API mocking and e2e tests with real GitHub API calls

### Files to Modify

1. **`src/flow/context.ts`** (MODIFY)
   - Add `validate()` method to IContext interface
   - Implement validation schema registration system
   - Add context validation with Zod schemas

2. **`src/flow/step.ts`** (MODIFY)
   - Add context validation calls before/after step execution
   - Handle validation errors appropriately

3. **`src/flow/types/github-reader-step.ts`** (NEW)
   - New GitHubReaderStep class implementation
   - GitHub SDK integration for issue and comments reading
   - Context population with issue data

4. **`src/validation/schemas/step.schema.ts`** (MODIFY)
   - Add GitHubReaderStepConfigSchema (without authToken)
   - Update StepConfigSchema union type
   - Add GitHubReaderStepConfig type export

5. **`src/validation/schemas/github-context.schema.ts`** (NEW)
   - Zod schema for GitHub context data validation
   - Issue and comments structure validation
   - Context validation schema registration

6. **`src/utils/github-client.ts`** (NEW)
   - GitHub SDK client wrapper with environment-based authentication
   - Issue and comments fetching utilities
   - Error handling and retry logic

7. **`src/flow/step-factory.ts`** (MODIFY)
   - Import GitHubReaderStep
   - Add 'github-reader' case to switch statement

8. **`src/flow/types/index.ts`** (MODIFY)
   - Add export for github-reader-step.js

9. **`tests/unit/flow/types/github-reader-step.test.ts`** (NEW)
   - Comprehensive unit tests for GitHubReaderStep
   - Mock GitHub SDK responses
   - Test error handling scenarios

10. **`tests/unit/flow/context.test.ts`** (MODIFY)
    - Add tests for context validation functionality
    - Test validation schema registration

11. **`tests/integration/data/github-reader-test-flow.json`** (NEW)
    - Test flow configuration using GitHubReaderStep
    - Uses known public GitHub issues for testing

12. **`tests/integration/github-reader-e2e.test.ts`** (NEW)
    - E2E tests following existing patterns
    - Real GitHub API calls with known issues
    - Flow execution verification

### Implementation Steps

#### Phase 1: Context Validation Enhancement (45 minutes)

**Step 1.1: Enhance IContext Interface**

```typescript
export interface IContext {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  validate(): void; // New validation method
  registerValidationSchema(name: string, schema: z.ZodSchema): void;
}
```

**Step 1.2: Implement Context Validation**

```typescript
export class Context implements IContext {
  private readonly storage: Map<string, string>;
  private readonly validationSchemas: Map<string, z.ZodSchema>;

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
}
```

#### Phase 2: Secure GitHub SDK Client Setup (45 minutes)

**Step 2.1: Create Secure GitHub Client Wrapper**

```typescript
export class GitHubClient {
  private octokit: Octokit;

  constructor() {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || undefined;
    this.octokit = new Octokit({ auth: token });
  }

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
      // Handle specific GitHub API errors
      if (error.status === 401) {
        throw new Error(
          'GitHub authentication failed. Please set GITHUB_TOKEN environment variable.'
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
}
```

#### Phase 3: Core GitHubReaderStep Implementation (1.5 hours)

**Step 3.1: Create GitHubReaderStep Class**

- Extend Step base class with context validation integration
- Implement secure authentication and repository resolution
- Add comprehensive error handling and logging

#### Phase 4: Validation Schemas (30 minutes)

**Step 4.1: GitHub Context Schema**

```typescript
const GitHubIssueContextSchema = z
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
  })
  .partial();
```

#### Phase 5: Factory Integration (15 minutes)

**Step 5.1: Update StepFactory**

- Import GitHubReaderStep
- Add 'github-reader' case to switch statement

#### Phase 6: Unit Testing (1.5 hours)

**Step 6.1: Context Validation Tests**

- Test validation schema registration
- Test validation success and failure scenarios

**Step 6.2: GitHubReaderStep Unit Tests**

- Mock GitHub SDK responses using vitest mocks
- Test authentication error handling
- Test repository resolution logic
- Test context population with automatic validation

#### Phase 7: E2E Testing Following Existing Patterns (1 hour)

**Step 7.1: Create Test Flow Configuration**

```json
{
  "id": "github-reader-test-flow",
  "name": "GitHub Reader Test Flow",
  "description": "Test flow for GitHub reader step",
  "initialStepId": "read-github-issue",
  "steps": {
    "read-github-issue": {
      "type": "github-reader",
      "id": "read-github-issue",
      "issueNumber": 1,
      "repository": "octocat/Hello-World",
      "includeComments": true,
      "nextStepId": {
        "default": "display-issue-info"
      }
    },
    "display-issue-info": {
      "type": "log",
      "id": "display-issue-info",
      "message": "Issue: {{context.github.issue.title}} by {{context.github.issue.author}}",
      "level": "info",
      "nextStepId": {}
    }
  }
}
```

**Step 7.2: E2E Tests Following Existing Pattern**

```typescript
describe('GitHub Reader E2E Tests', () => {
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

  describe('GitHub Reader Step', () => {
    it('should read GitHub issue and populate context', async () => {
      // Copy the GitHub reader test flow
      await copyFlowFile('github-reader-test-flow.json', tempTestDir);

      // Run the flow with real GitHub API
      const result = await runFlowCommand(
        testEnv,
        tempTestDir,
        'github-reader-test-flow'
      );

      // Verify successful execution
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain(
        "Flow 'github-reader-test-flow' completed successfully"
      );

      // Verify GitHub step executed
      expect(result.stdout).toContain('GitHubReaderStep: Reading issue #1');
      expect(result.stdout).toContain('Successfully loaded GitHub issue #1');

      // Verify context was populated (check log step output)
      expect(result.stdout).toContain('Issue: Hello World');
      expect(result.stdout).toContain('by octocat');
    });

    it('should handle non-existent issue with error', async () => {
      // Create flow with non-existent issue
      // Test error handling in real execution
    });

    it('should work without authentication for public repos', async () => {
      // Test public repo access without GITHUB_TOKEN
    });
  });
});
```

### Enhanced E2E Testing Strategy

**Real GitHub Issues for Testing:**

- **octocat/Hello-World #1**: Stable public issue for basic testing
- **microsoft/vscode #1**: Well-known issue with comments
- **facebook/react #1**: Another stable public issue

**E2E Test Scenarios:**

1. **Successful Issue Reading**: Use known public issue with comments
2. **Issue Without Comments**: Test issue that has no comments
3. **Non-existent Issue**: Test 404 error handling
4. **Private Repository**: Test authentication requirements (when GITHUB_TOKEN available)
5. **Context Propagation**: Verify subsequent steps can use GitHub context data
6. **Repository Resolution**: Test both explicit repository and environment detection

**Following Existing Patterns:**

- Use `TestEnvironment` and `runFlowCommand`
- Create test flow files in `tests/integration/data/`
- Verify stdout/stderr output contains expected messages
- Test real CLI execution, not mocked responses

### Enhanced Testing Strategy

**Unit Test Coverage:**

- Context validation functionality (8-10 tests)
- GitHubReaderStep class with mocked SDK (18-20 tests)
- GitHub client wrapper with mocked responses (10-12 tests)
- Repository resolution logic (4-5 tests)
- Step factory integration (2-3 tests)
- **Total**: ~40-50 new unit tests

**E2E Test Coverage:**

- Real GitHub API integration (6-8 tests)
- Error scenario handling (3-4 tests)
- Context propagation verification (2-3 tests)
- **Total**: ~12-15 new e2e tests

### Status

- [x] VAN mode initialization complete
- [x] GitHub issue analysis complete
- [x] Complexity determination complete
- [x] Technology validation complete
- [x] Platform detection complete
- [x] Quality assurance verification complete
- [x] GitHub SDK installation complete
- [x] Planning complete (e2e-refined with real GitHub API testing)
- [ ] Implementation
- [ ] Testing
- [ ] Reflection
- [ ] Archiving

### Enhanced Acceptance Criteria

- [ ] Context interface enhanced with `validate()` method
- [ ] Context validation called before and after every step execution
- [ ] Step can read GitHub issue by number using GitHub SDK
- [ ] Step can read GitHub issue comments using GitHub SDK
- [ ] GitHub authentication uses environment variables only (GITHUB_TOKEN)
- [ ] No authentication tokens in JSON configuration files
- [ ] Repository resolution from config or environment
- [ ] Issue and comments data are properly structured in context
- [ ] Context structure is validated using registered Zod schemas
- [ ] Error handling for API failures, authentication, and validation errors
- [ ] Unit tests with mocked SDK responses provide adequate coverage
- [ ] E2E tests with real GitHub API calls following existing patterns
- [ ] Integration with existing flow system

### Next Steps

**→ IMPLEMENT MODE** - Ready for implementation with proper e2e testing

The planning phase is complete with e2e-refined architecture following existing test patterns. The e2e tests will use real GitHub API calls with known public issues to verify full integration.

---

**Last Update**: 2025-01-17  
**Status**: PLAN E2E-REFINED ✅ - READY FOR IMPLEMENT MODE  
**Next Mode**: IMPLEMENT MODE for GitHub SDK implementation with real e2e testing
