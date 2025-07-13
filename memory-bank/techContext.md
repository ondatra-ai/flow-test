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
