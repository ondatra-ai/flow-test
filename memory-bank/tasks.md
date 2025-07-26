# MEMORY BANK TASKS

## Current Task Status: 🔨 IMPLEMENT MODE - Phase 1 Core Infrastructure

**Task ID**: improve-test-mock-validation-20250201
**Issue**: #105 - Improve call argument validation and avoid unsafe type assertions in tests
**Complexity**: Level 4 - Complex System
**Branch**: task-20250201-improve-test-mock-validation
**Start Date**: 2025-02-01
**Status**: IMPLEMENT Mode - Building Core Assertion Infrastructure

## REVISED EXECUTION PLAN - LESSONS LEARNED

### ⚠️ KEY MISTAKES TO AVOID:

1. **DON'T CREATE TESTS FOR TEST UTILITIES**
   - Test utilities are simple helpers, not production code
   - No need for core.test.ts, async-support.test.ts, etc.
   - Focus testing on actual application functionality

2. **DON'T CREATE EXAMPLE/DEMO FILES IN TESTS**
   - No migration-example.test.ts as "living documentation"
   - Examples belong in docs/, not in test directories
   - Keep test directories clean and focused

3. **USE BUILT-IN ESLINT RULES FIRST**
   - Research existing ESLint rules before creating custom ones
   - @typescript-eslint/consistent-type-assertions is simpler than custom rules
   - Avoid .eslintrc.custom-rules.js unless absolutely necessary

4. **PLACE TEST TYPES WITH TEST UTILITIES**
   - Test utility types go in tests/test-utils/types/
   - NOT in src/types/testing/
   - Keep test-related code together

5. **AVOID TEMPORARY FIXES**
   - Don't create temporary files like src/interfaces/testing/index.ts
   - Do proper organization from the start
   - Clean architecture prevents technical debt

### Phase 1: Core Assertion Infrastructure (REVISED)

- [ ] Create `tests/test-utils/mock-validation/` directory
- [ ] Implement `expectMockCall` function
- [ ] Build types in `tests/test-utils/types/mock-validation.types.ts`
- [ ] Create `MockValidationError` class
- [ ] Integrate Jest matcher support
- [ ] Document API in `docs/testing/mock-validation-guide.md`
- [ ] NO UNIT TESTS for the utilities themselves

### Phase 2: Pattern Matching & ESLint Integration (REVISED)

- [ ] Implement pattern matching methods
- [ ] Add negation support
- [ ] Configure ESLint using BUILT-IN rules:
  - Use `@typescript-eslint/consistent-type-assertions: never`
  - Add override for `tests/test-utils/` to allow `as`
- [ ] NO custom ESLint rules unless proven necessary

### Phase 3: Migration (REVISED)

- [ ] Migrate actual test files (not create examples)
- [ ] Update imports to use new utilities
- [ ] Verify all tests pass
- [ ] Document migration patterns in `docs/` (not test files)

### Phase 4: Documentation Only (REVISED)

- [ ] Create comprehensive docs in `docs/testing/`
- [ ] NO example test files
- [ ] Focus on real usage in actual tests
- [ ] Update README with migration guide

## Success Criteria (REVISED)

1. Zero unsafe type assertions in ACTUAL test files
2. All ACTUAL tests passing with new validation
3. Clean test utility structure (no meta-tests)
4. Clear documentation in docs/ directory
5. ESLint prevention using built-in rules
6. Minimal, focused implementation
