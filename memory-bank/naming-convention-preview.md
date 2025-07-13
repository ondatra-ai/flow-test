# Naming Convention Documentation Preview

## What will be added to techContext.md:

### Schema Naming Conventions

**Standard**: Use "Config" suffix for all schema definitions

**Pattern**:

- Zod Schemas: [Entity]ConfigSchema (e.g., FlowConfigSchema, StepConfigSchema)
- TypeScript Types: [Entity]Config (e.g., FlowConfig, StepConfig)

**Examples**:

- ✅ FlowConfigSchema / FlowConfig
- ✅ StepConfigSchema / StepConfig
- ✅ ReadGitHubIssueStepConfigSchema / ReadGitHubIssueStepConfig
- ❌ FlowDefinitionSchema / FlowDefinition (old pattern)

**Rationale**:

- Consistency across all schema definitions
- "Config" clearly indicates these are configuration objects
- Aligns with existing Step naming patterns
- Reduces cognitive load when working with schemas
