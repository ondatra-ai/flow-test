# VAN Mode Analysis - Naming Consistency Task

## Task: Improve Naming Consistency (Issue #90)

### Current State Analysis

**Flow Schemas**:

- FlowDefinitionSchema (Zod schema)
- FlowDefinition (TypeScript type)

**Step Schemas**:

- StepConfigBaseSchema (base Zod schema)
- StepConfigSchema (union Zod schema)
- ReadGitHubIssueStepConfigSchema (specific step Zod schema)
- StepConfig (TypeScript type)
- ReadGitHubIssueStepConfig (specific step TypeScript type)

### Usage Statistics

**Source Files**:

- FlowDefinitionSchema: 5 references
- FlowDefinition type: 5 references
- StepConfig and variants: 22+ references

**Test Files**:

- Combined references: 14 occurrences

### Impact Analysis

**Files to Update**:

1. src/validation/schemas/flow.schema.ts
2. src/validation/schemas/step.schema.ts
3. src/types/validation/schemas.types.ts
4. src/types/validation/index.ts
5. src/utils/flow-manager.ts
6. src/flow/step-factory.ts
7. src/flow/types/read-github-issue-step.ts
8. tests/unit/flow/types/\*.test.ts

### Naming Convention Recommendation

**Recommended**: Option 2 - Use "Config" suffix for all

**Rationale**:

1. Already established pattern for Steps
2. More descriptive (these are configurations)
3. Shorter than "Definition"
4. Minimal changes required (only Flow schemas need updating)

**Proposed Changes**:

- FlowDefinitionSchema → FlowConfigSchema
- FlowDefinition → FlowConfig

This maintains consistency with existing Step naming:

- StepConfigBaseSchema ✓
- StepConfigSchema ✓
- ReadGitHubIssueStepConfigSchema ✓
- StepConfig ✓
- ReadGitHubIssueStepConfig ✓

### Complexity Confirmation

**Level 2 - Simple Enhancement**

- Clear rename operation
- Limited scope (2 main renames)
- Straightforward search and replace
- No logic changes required

### Next Steps

1. Create new branch
2. Update schema names in validation files
3. Update type definitions
4. Update all imports and references
5. Run tests to verify
6. Create PR with breaking change notice
