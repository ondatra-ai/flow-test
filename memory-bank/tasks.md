# MEMORY BANK TASKS

## Current Task Status: 🟧 PLAN MODE COMPLETE - Ready for CREATIVE MODE

**Task ID**: improve-test-mock-validation-20250201
**Issue**: #105 - Improve call argument validation and avoid unsafe type assertions in tests
**Complexity**: Level 4 - Complex System
**Branch**: task-20250201-improve-test-mock-validation
**Start Date**: 2025-02-01
**Status**: Planning Complete - Technology Validated

## Task: Improve Test Mock Validation Infrastructure

### Task Overview

This task involves creating a comprehensive validation system for mock call arguments in tests, eliminating unsafe type assertions throughout the test suite, and providing better error messages for test failures.

### VAN Mode Status

- [x] Platform detection complete (macOS)
- [x] Git repository verified
- [x] Task branch created: task-20250201-improve-test-mock-validation
- [x] Memory Bank structure verified
- [x] Complexity determined: Level 4

### PLAN Mode Status

- [x] Requirements analysis complete
- [x] Component identification complete
- [x] Architectural planning complete
- [x] Technology validation complete
- [x] Creative phases identified

## Architectural Requirements Analysis

### Functional Requirements

1. **Mock Call Validation**: Type-safe validation system for accessing mock call arguments
2. **Error Messaging**: Clear, actionable error messages when validation fails
3. **Reusable Utilities**: Centralized mock validation utilities for consistent usage
4. **Type Safety**: Eliminate all unsafe type assertions (as Type patterns)
5. **Meta-Testing**: Comprehensive tests for the validation utilities themselves

### Non-Functional Requirements

1. **Performance**: Minimal overhead on test execution time
2. **Maintainability**: Easy to extend with new validation patterns
3. **Developer Experience**: Intuitive API with good IDE support
4. **Backward Compatibility**: Gradual migration path for existing tests
5. **Documentation**: Clear usage examples and migration guide

### Contracts, Schemes and Interface Updates

- New interfaces in `src/types/testing/mock-validation.types.ts`:
  - `MockCallExpectation<TMock>` - Main assertion builder interface
  - `CallExpectation<TMock>` - Single call validation interface
  - `MatchPattern<T>` - Pattern matching type with Jest matchers
  - `MockValidationError` - Custom error class with detailed formatting
- Enhanced mock validation exports in `tests/test-utils/mock-validation/`:
  - `expectMockCall` - Primary assertion builder function
  - Jest matcher integration types
  - Validation result types with error context

## Components Affected

### Primary Components

1. **Mock Validation Core** (`tests/test-utils/mock-validation/`)
   - `core.ts` - Core validation logic
   - `extractors.ts` - Type-safe argument extractors
   - `validators.ts` - Validation predicates
   - `errors.ts` - Custom error types

2. **Mock Type Enhancements** (`tests/unit/mocks/`)
   - Update all mock factory return types
   - Add validation helper methods
   - Maintain backward compatibility

3. **Test File Updates** (All `*.test.ts` files)
   - Replace unsafe type assertions
   - Use new validation utilities
   - Improve error handling

### Supporting Components

1. **Documentation** (`docs/testing/`)
   - Mock validation guide
   - Migration instructions
   - Best practices

2. **Linting Rules** (`.eslintrc.js`)
   - Custom rule to detect unsafe assertions
   - Auto-fixable where possible

## Implementation Strategy

## Implementation Strategy (Updated for Assertion Builder API)

### Phase 1: Core Assertion Infrastructure (Week 1)

1. Implement `expectMockCall` assertion builder foundation
2. Create Jest matcher integration layer
3. Develop custom `MockValidationError` with detailed formatting
4. Build type-safe argument extractors
5. Add comprehensive unit tests for core assertions

### Phase 2: Pattern Matching & Advanced Features (Week 2)

1. Implement `toMatchCallPattern` with Jest matchers
2. Add partial matching support
3. Create call sequence validation
4. Implement negative assertions with `.not`
5. Add async mock support

### Phase 3: Test Migration (Weeks 3-4)

1. Create automated codemod using TypeScript AST
2. Transform unsafe type assertions to assertion builder pattern
3. Batch migrate test files by directory
4. Verify all tests pass after migration
5. Document edge cases and manual fixes

### Phase 4: Documentation & Tooling (Week 5)

1. Write comprehensive API documentation
2. Create ESLint rule to detect unsafe assertions
3. Build migration guide with examples
4. Set up CI validation checks
5. Develop training materials for team

## Technology Stack Validation

### Core Technologies

- **TypeScript**: 5.x (strict mode)
- **Vitest**: Current version (mock validation)
- **ESLint**: Custom rules development

### Validation Requirements

- [x] Create minimal mock validation prototype
- [x] Verify TypeScript inference works correctly
- [x] Test Vitest mock integration
- [x] Validate ESLint custom rule feasibility
- [x] Performance benchmark validation overhead

### Hello World Proof of Concept

```typescript
// tests/test-utils/mock-validation/poc.ts
export function getFirstCallArgs<T>(mockFn: MockedFunction<any>): T {
  expect(mockFn).toHaveBeenCalled();
  const calls = mockFn.mock.calls;
  expect(calls).toHaveLength(1);
  return calls[0][0];
}

// Usage example
const args = getFirstCallArgs<StreamRequest>(providerMock.generate);
expect(args.prompt).toContain('test');
```

## Creative Phases Required

### 1. Mock Validation API Design 🎨

- **Components**: Core validation API
- **Decisions**: API surface, error handling patterns
- **Output**: `creative/creative-mock-validation-api.md`

### 2. Type System Architecture 🏗️

- **Components**: Type inference system
- **Decisions**: Generic constraints, type safety guarantees
- **Output**: `creative/creative-type-architecture.md`

### 3. Migration Strategy Design 📋

- **Components**: Automated migration approach
- **Decisions**: Batch strategy, rollback plans
- **Output**: `creative/creative-migration-strategy.md`

## Dependencies & Integration Points

### Internal Dependencies

- All test files using mock factories
- Existing mock infrastructure
- Test utilities and helpers

### External Dependencies

- Vitest mock API
- TypeScript compiler API (for migration)
- ESLint plugin API

### Integration Considerations

- Must work with existing test patterns
- Should not break current test execution
- Gradual adoption must be possible

## Risk Assessment & Mitigation

### High Risk Items

1. **Breaking existing tests**
   - Mitigation: Backward compatibility layer
   - Mitigation: Comprehensive test coverage
   - Mitigation: Phased rollout approach

2. **Performance degradation**
   - Mitigation: Benchmark validation overhead
   - Mitigation: Optimize critical paths
   - Mitigation: Optional validation in CI only

3. **Complex type inference**
   - Mitigation: Simplified API for common cases
   - Mitigation: Escape hatches for edge cases
   - Mitigation: Clear documentation

### Medium Risk Items

1. **Developer adoption resistance**
   - Mitigation: Clear benefits documentation
   - Mitigation: Automated migration tools
   - Mitigation: Gradual enforcement

2. **Maintenance burden**
   - Mitigation: Minimal API surface
   - Mitigation: Comprehensive tests
   - Mitigation: Clear ownership

## Success Criteria

1. Zero unsafe type assertions in test files
2. All tests passing with new validation
3. < 5% performance overhead
4. 100% test coverage on validation utilities
5. Clear migration path documented
6. ESLint rule preventing regressions
7. Positive developer feedback

## Implementation Checklist

### Phase 1: Core Assertion Infrastructure

- [ ] Implement `expectMockCall` function
- [ ] Build `MockCallExpectation` interface
- [ ] Create `CallExpectation` for single calls
- [ ] Develop `MockValidationError` class
- [ ] Integrate Jest matcher support
- [ ] Write comprehensive unit tests
- [ ] Benchmark performance overhead

### Phase 2: Pattern Matching & Advanced Features

- [ ] Implement `toMatchCallPattern` method
- [ ] Add `toPartiallyMatch` support
- [ ] Create `toHaveCallSequence` validator
- [ ] Build `.not` negation support
- [ ] Add async mock validation
- [ ] Implement argument spy functionality
- [ ] Test all advanced features

### Phase 3: Migration

- [ ] Create TypeScript AST codemod
- [ ] Build unsafe assertion detector
- [ ] Implement transformation rules
- [ ] Test on sample files
- [ ] Run batch migration
- [ ] Document manual fixes
- [ ] Verify all tests pass

### Phase 4: Tooling & Documentation

- [ ] Create ESLint rule for unsafe assertions
- [ ] Write API reference documentation
- [ ] Build migration guide
- [ ] Create code examples
- [ ] Set up CI validation
- [ ] Develop team training materials
- [2025-02-01]: PLAN mode started - architectural planning in progress
- [2025-02-01]: Identified 4 files with unsafe type assertions in initial scan
- [2025-02-01]: StreamRequest interface structure analyzed
- [2025-02-01]: Technology validation complete - POC test successfully validates approach
- [2025-02-01]: Architectural planning complete - 4 phases identified with detailed implementation strategy
- [2025-02-01]: Creative phases identified - 3 design decision points flagged
- [2025-02-01]: PLAN mode complete - ready for CREATIVE mode

### CREATIVE Mode Progress

- [x] Mock Validation API Design complete
- [ ] Type System Architecture
- [ ] Migration Strategy Design

### Completed Creative Phases

1. **Mock Validation API Design** ✅
   - Explored 4 different API approaches
   - Selected Assertion Builder API based on user preference
   - Documented in `memory-bank/creative/creative-mock-validation-api.md`
   - Ready for implementation

### Next Creative Phase

**Type System Architecture** - Design the generic type constraints and inference system

- Revised decision to Assertion Builder API per user feedback
- Created comprehensive design in `memory-bank/creative/creative-mock-validation-api.md`
- Key features: Jest matcher integration, pattern matching, clear error messages

## Summary of Updates

### Creative Files Organized

- Removed original API design file
- Kept Assertion Builder API design as primary reference
- File location: `memory-bank/creative/creative-mock-validation-api.md`

### Execution Plan Updated

- **Phase 1**: Focus on core assertion infrastructure with `expectMockCall`
- **Phase 2**: Pattern matching and Jest matcher integration
- **Phase 3**: Automated migration using TypeScript AST
- **Phase 4**: Documentation and tooling with ESLint rules

### Key Implementation Changes

- Primary API: `expectMockCall(mock)` assertion builder
- Jest matcher integration for familiar patterns
- Custom `MockValidationError` for clear error messages
- Support for pattern matching, partial matching, and call sequences
- Negative assertions with `.not` modifier

The implementation now aligns with the Assertion Builder API approach, providing a familiar Jest-like experience while solving type safety issues.
