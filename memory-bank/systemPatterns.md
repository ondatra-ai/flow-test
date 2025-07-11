# SYSTEM PATTERNS & STANDARDS

## MANDATORY QUALITY ASSURANCE FOR ALL TASKS

### Testing & Linting Requirements

**⚠️ CRITICAL: These requirements apply to EVERY task regardless of complexity level**

#### Pre-Completion Checklist (MANDATORY)

Every task MUST pass these checks before being marked as complete:

1. **Tests**: `npm run test` - All tests must pass
2. **Linting**: `npm run lint` - All linting rules must pass
3. **Type Checking**: `npm run type-check` - TypeScript compilation must succeed
4. **Code Formatting**: `npm run format:check` - Code formatting must be correct

#### Quality Gates

- **No exceptions** - If any check fails, the task is NOT complete
- **Fix before proceed** - All issues must be resolved before task completion
- **Document fixes** - Any quality issues found and fixed should be noted

## MANDATORY UNIT TESTING REQUIREMENT

### Unit Test Standards

**⚠️ CRITICAL: Every task that creates or modifies code MUST include unit tests**

#### Requirements

1. **Test Coverage**: All new code must have unit tests
2. **Test Location**: Tests must be co-located in `tests/unit/` directory
3. **Test Naming**: Test files must follow `*.test.ts` naming pattern
4. **Test Quality**: Tests must cover core functionality and edge cases
5. **Test Reliability**: Tests must be deterministic and not flaky

#### Implementation Standards

- **One test file per source file** when practical
- **Descriptive test names** that explain what is being tested
- **Arrange-Act-Assert pattern** for clear test structure
- **Mock external dependencies** to isolate units under test
- **Test both success and failure scenarios**

#### Test Documentation

- Each test should clearly document what it verifies
- Complex test scenarios should include explanatory comments
- Test data should be realistic and representative

#### Test Coverage Requirements

**90% Coverage Threshold for Standard Code:**

- **Applies to**: Internal business logic, algorithms, data structures, service classes, utilities, interface implementations, flow control, state management
- **Measurement**: Statement coverage must be ≥90% for new/modified code
- **Verification**: Use `npm run test -- --coverage` to check coverage

**Coverage Not Required for External Integration Code:**

- **Exempted**: API client implementations, database operations, file system operations, network communications, third-party service integrations, external MCP server interactions
- **Reason**: External dependencies make testing unreliable and complex
- **Alternative**: Focus on integration tests and error handling instead

**Coverage Enforcement:**

- Check coverage during quality assurance phase
- Document coverage results in task completion
- If below 90%, add additional tests or justify exemption

### Standard Task Completion Pattern

Every task completion checklist MUST include:

1. **Implementation complete** - All code changes made
2. **Unit tests written** - Comprehensive test coverage added
3. **All tests pass** - `npm run test` succeeds
4. **Quality checks pass** - All linting, type checking, formatting pass
5. **Documentation updated** - If applicable

## TYPESCRIPT DESIGN PATTERNS

### Optional Types Usage Policy

**⚠️ CRITICAL: Only use optional types when there's genuine business justification**

#### When Optional Types Are Justified

- **Configuration fields** - Where absence has semantic meaning (e.g., `timeout?: number`)
- **API responses** - Where external APIs may not provide certain fields
- **User input** - Where fields are truly optional from user perspective
- **Legacy compatibility** - When maintaining backward compatibility with existing APIs
- **State transitions** - Where values are genuinely absent during certain lifecycle phases

#### When Optional Types Are NOT Justified

- **Constructor parameters** - Prefer explicit required parameters with defaults
- **Internal APIs** - Where you control both producer and consumer
- **Database entities** - Where fields should have explicit business rules
- **Return values** - Prefer explicit exceptions over returning undefined
- **Configuration objects** - Where defaults can be provided at creation time

#### Best Practices

**❌ AVOID: Unnecessary optionals**

```typescript
// BAD - Creates confusion about when value is present
interface User {
  id?: string;
  name?: string;
  email?: string;
}

// BAD - Return type should be explicit
function getFirstStepId(): string | undefined {
  return this.steps.length > 0 ? this.initialStepId : undefined;
}
```

**✅ PREFER: Explicit required types**

```typescript
// GOOD - Clear required fields with explicit defaults
interface User {
  id: string;
  name: string;
  email: string;
}

// GOOD - Throws exception for invalid states
function getFirstStepId(): string {
  if (!this.initialStepId) {
    throw new Error('No initial step ID configured');
  }
  return this.initialStepId;
}
```

**✅ JUSTIFIED: Meaningful optionals**

```typescript
// GOOD - Optional has clear business meaning
interface FlowConfig {
  id: string;
  name: string;
  timeout?: number; // Optional timeout with system default
}

// GOOD - External API may not provide all fields
interface ExternalApiResponse {
  id: string;
  name: string;
  description?: string; // API may not always provide this
}
```

#### Enforcement

- **Code reviews** - Challenge every optional type during review
- **API design** - Require justification for any optional parameter/field
- **Documentation** - Document why each optional type is necessary
- **Refactoring** - Regularly review and remove unnecessary optionals

### Command Execution Policy

**⚠️ CRITICAL: Use npm to run all commands, not npx**

#### When to use npm vs npx

**✅ ALWAYS USE: npm run**

- **All project scripts** - Commands defined in package.json scripts
- **Development commands** - build, test, lint, format, etc.
- **Project tooling** - Any tool installed as project dependency
- **Consistency** - Ensures same versions across team and CI

**❌ AVOID: npx**

- **Project scripts** - Use npm run instead
- **Installed dependencies** - Use npm run to invoke them
- **Global installs** - Prefer project-local dependencies

#### Best Practices

**✅ PREFERRED: Use npm run for all commands**

```bash
# GOOD - Use npm run for project scripts
npm run build
npm run test
npm run lint
npm run format

# GOOD - Define scripts in package.json
{
  "scripts": {
    "build": "tsc",
    "test": "vitest --run",
    "lint": "eslint \"src/**/*.ts\"",
    "format": "prettier --write \"src/**/*.ts\""
  }
}
```

**❌ AVOID: Using npx for project commands**

```bash
# BAD - Don't use npx for project tools
npx tsc
npx vitest --run
npx eslint "src/**/*.ts"
npx prettier --write "src/**/*.ts"
```

**✅ ACCEPTABLE: npx for one-time global tools**

```bash
# ACCEPTABLE - One-time setup or global utilities
npx create-react-app my-app
npx degit template-repo my-project
```

#### Benefits of npm run approach

- **Version consistency** - Uses exact versions from package.json
- **Faster execution** - No need to download/check latest versions
- **Reliable builds** - Same behavior across development and CI
- **Clear dependencies** - All tools explicitly listed in package.json
- **Team consistency** - Everyone uses same commands and versions

#### Enforcement

- **Documentation** - All README instructions use npm run commands
- **CI/CD scripts** - Use npm run in all automation
- **Code reviews** - Flag any npx usage in project documentation
- **Scripts organization** - Maintain comprehensive scripts section in package.json

### Test File Organization Policy

**⚠️ CRITICAL: Never remove tests to meet line limits - restructure instead**

#### When test files exceed line limits

**✅ PREFERRED: Restructure without losing coverage**

- **Create helper functions** - Extract common setup/teardown logic
- **Split into multiple files** - Divide by functionality (2-3 files max)
- **Use shared utilities** - Move reusable test code to test-utils
- **Organize by feature** - Group related tests together

**❌ NEVER: Remove tests to meet limits**

- **Deleting test cases** - Reduces coverage and quality
- **Commenting out tests** - Hidden technical debt
- **Combining unrelated tests** - Makes debugging harder
- **Skipping edge cases** - Creates production risks

#### Best Practices for Test Organization

**✅ GOOD: Split large test files by domain**

```typescript
// BEFORE: flow-manager.test.ts (500+ lines)
// AFTER: Split into focused files
flow - manager - basic.test.ts; // Core functionality tests
flow - manager - validation.test.ts; // Validation and error cases
flow - manager - integration.test.ts; // Integration scenarios

// Shared helpers
test - utils / flow - test - helpers.ts; // Common setup functions
```

**✅ GOOD: Extract helper functions**

```typescript
// GOOD - Create reusable test helpers
function createTestFlow(config: Partial<FlowConfig>) { ... }
function setupMockEnvironment() { ... }
function runValidationTest(data: unknown, expectedError: string) { ... }

// Use helpers in multiple test cases
describe('Flow validation', () => {
  it('should validate config', async () => {
    await runValidationTest(invalidData, 'Expected error');
  });
});
```

**✅ GOOD: Organize by test categories**

```typescript
// Split by test type, not arbitrarily
flow - manager - unit.test.ts; // Pure unit tests
flow - manager - integration.test.ts; // Integration tests
flow - manager - edge - cases.test.ts; // Edge cases and error scenarios
```

**❌ BAD: Arbitrary test removal**

```typescript
// BAD - Removing tests reduces quality
// describe('Edge case validation', () => {
//   it('should handle null input', () => { ... }); // REMOVED
//   it('should handle empty arrays', () => { ... }); // REMOVED
// });
```

#### File Splitting Guidelines

**When to split test files:**

- **File exceeds 300 lines** (linting limit)
- **Function exceeds 250 lines** (linting limit)
- **Logical groupings exist** (different features/scenarios)
- **Multiple developers working** on same test file

**How to split effectively:**

1. **Group by functionality** - Related test cases together
2. **Maintain shared setup** - Use common helper functions
3. **Preserve all coverage** - Every test case must be preserved
4. **Clear naming** - File names indicate what they test
5. **Update imports** - Ensure all test utilities are accessible

#### Helper Function Strategy

**✅ Create helpers for:**

- **Common setup/teardown** - Mock creation, environment setup
- **Repeated assertions** - Standard validation patterns
- **Test data generation** - Creating test fixtures
- **Complex scenarios** - Multi-step test operations

**✅ Helper organization:**

```typescript
// test-utils/domain-helpers.ts
export function createMockFlow(config?: Partial<FlowConfig>) { ... }
export function expectValidationError(result: any, message: string) { ... }
export function setupTestEnvironment() { ... }

// Multiple test files can import and use
import { createMockFlow, expectValidationError } from '../test-utils/domain-helpers.js';
```

#### Enforcement

- **Code reviews** - Reject PRs that remove tests to meet line limits
- **Quality gates** - Maintain or increase test coverage
- **Documentation** - Document test file organization strategy
- **Refactoring** - Prefer restructuring over deletion
- **Metrics tracking** - Monitor test count and coverage over time

### Backward Compatibility Policy

**⚠️ CRITICAL: Only support backward compatibility when there's genuine business justification**

#### When Backward Compatibility Is Justified

- **Public APIs** - Where breaking changes affect external users/systems
- **Production systems** - Where immediate migration is not feasible
- **Enterprise customers** - Where contractual obligations require stability
- **Critical systems** - Where downtime for migration is unacceptable
- **Large user bases** - Where coordinated migration is complex

#### When Backward Compatibility Is NOT Justified

- **Internal APIs** - Where you control all consumers
- **Development/testing** - Where breaking changes can be easily coordinated
- **New features** - Where no existing usage exists
- **Deprecated functionality** - Where migration path is already established
- **Technical debt** - Where compatibility prevents necessary improvements

#### Planning Requirements

**MANDATORY: Explicit justification must be provided in the planning phase**

When proposing backward compatibility support, the plan MUST include:

1. **Business justification** - Why compatibility is needed
2. **Impact assessment** - What breaks without compatibility
3. **Migration timeline** - When compatibility can be removed
4. **Maintenance cost** - Resources required to maintain dual support
5. **Alternative solutions** - Other approaches considered

#### Best Practices

**❌ AVOID: Automatic backward compatibility**

```typescript
// BAD - Adds complexity without justification
interface FlowConfig {
  id: string;
  name: string;
  initialStepId?: string; // New field
  initialStep?: string; // Legacy field - why keep?
}
```

**✅ PREFER: Clean breaking changes**

```typescript
// GOOD - Clear, single way to do things
interface FlowConfig {
  id: string;
  name: string;
  initialStepId: string; // Single clear field
}
```

**✅ JUSTIFIED: Documented compatibility**

```typescript
// GOOD - Clear justification and timeline
interface FlowConfig {
  id: string;
  name: string;
  initialStepId: string;

  /**
   * @deprecated Use initialStepId instead
   * @removal v2.0.0 - Remove after enterprise migration (Q2 2024)
   * @justification 500+ enterprise customers need 6-month migration window
   */
  initialStep?: string;
}
```

#### Implementation Guidelines

**Planning Phase Requirements:**

- Document specific justification for backward compatibility
- Define clear removal timeline with version numbers
- Identify affected systems and migration effort
- Estimate maintenance overhead

**Implementation Phase Requirements:**

- Add deprecation warnings for legacy usage
- Provide clear migration documentation
- Add timeline comments in code
- Log usage of deprecated features

**Monitoring Requirements:**

- Track usage of deprecated features
- Monitor migration progress
- Alert when removal timeline approaches
- Report on compatibility maintenance costs

#### Enforcement

- **Planning reviews** - Challenge every backward compatibility proposal
- **Code reviews** - Require explicit justification comments for deprecated code
- **Documentation** - Maintain clear migration guides and timelines
- **Regular cleanup** - Schedule removal of deprecated compatibility features
