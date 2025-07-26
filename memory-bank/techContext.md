# Technical Context

## Schema Naming Conventions

**Standard**: Use "Config" suffix for all schema definitions

### Pattern Guidelines

**Zod Schemas**: `[Entity]ConfigSchema`

- Example: `FlowConfigSchema`, `StepConfigSchema`
- Example: `ReadGitHubIssueStepConfigSchema`

**TypeScript Types**: `[Entity]Config`

- Example: `FlowConfig`, `StepConfig`
- Example: `ReadGitHubIssueStepConfig`

### Examples

**✅ Correct Naming:**

- `FlowConfigSchema` / `FlowConfig`
- `StepConfigSchema` / `StepConfig`
- `ReadGitHubIssueStepConfigSchema` / `ReadGitHubIssueStepConfig`

**❌ Incorrect Naming (old pattern):**

- `FlowDefinitionSchema` / `FlowDefinition`

### Rationale

1. **Consistency**: All schema definitions follow the same naming pattern
2. **Clarity**: "Config" clearly indicates these are configuration objects
3. **Alignment**: Matches existing Step naming patterns established in the codebase
4. **Maintainability**: Reduces cognitive load when working with schemas

### Implementation

This naming convention was established in Issue #90 and implemented via PR #91 to standardize schema naming across the entire validation layer.

## Mock Validation Technology Stack

### Testing Infrastructure Enhancement

- **Vitest**: Leveraging existing mock API for validation
- **TypeScript 5.x**: Strict mode with advanced type inference
- **ESLint**: Custom rules for preventing unsafe assertions

### Key Technology Decisions

1. **Type Inference Strategy**
   - Use TypeScript generics for type-safe extraction
   - Leverage conditional types for flexible validation
   - Maintain inference through validation chain

2. **Error Handling Approach**
   - Custom error classes with detailed messages
   - Stack trace preservation for debugging
   - Contextual information in error output

3. **Performance Considerations**
   - Minimal runtime overhead (< 5% target)
   - Lazy validation where possible
   - Optional validation modes for CI/local

4. **Migration Tooling**
   - TypeScript Compiler API for AST manipulation
   - Automated codemod for safe migrations
   - Rollback capabilities for safety

### Integration Points

- Vitest mock.calls API
- TypeScript type system
- ESLint plugin architecture
- Existing test utilities

### Validation Utilities Architecture

```
tests/test-utils/mock-validation/
├── core.ts           # Core validation logic
├── extractors.ts     # Type-safe extractors
├── validators.ts     # Validation predicates
├── errors.ts         # Custom error types
└── index.ts          # Public API
```
