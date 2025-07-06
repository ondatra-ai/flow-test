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

### Standard Task Completion Pattern

Every task completion checklist MUST include:

1. **Implementation complete** - All code changes made
2. **Unit tests written** - Comprehensive test coverage added
3. **All tests pass** - `npm run test` succeeds
4. **Quality checks pass** - All linting, type checking, formatting pass
5. **Documentation updated** - If applicable
