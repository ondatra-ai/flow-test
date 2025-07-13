# MEMORY BANK TASKS

## Task Status: ✅ PLAN MODE COMPLETE

**Task ID**: github-plan-generation-step-20250121
**Start Date**: 2025-01-21
**Issue Reference**: Issue #36
**Branch**: task-20250121-github-plan-generation-step
**Complexity Level**: Level 2 - Simple Enhancement
**Status**: ✅ PLANNING COMPLETE - Ready for IMPLEMENT MODE

## 📋 TASK OVERVIEW

**Primary Objective**: Implement GitHub Plan Generation Step

**Task Description**: Create a new step type that generates plans based on GitHub issue content. This will enable flows to automatically create implementation plans from GitHub issues and output them to the console.

## Feature Planning Document

### Contracts and Interface Updates

#### New Types (`src/types/validation/`)

```typescript
// schemas.types.ts (update existing file)
export type GitHubPlanGenerationStepConfig = z.infer<
  typeof GitHubPlanGenerationStepConfigSchema
>;

// Add union type for all step configurations
export type StepConfig =
  | ReadGitHubIssueStepConfig
  | GitHubPlanGenerationStepConfig;
```

#### New Schema (`src/validation/schemas/step.schema.ts`)

```typescript
// Add new schema
export const GitHubPlanGenerationStepConfigSchema = StepConfigBaseSchema.extend(
  {
    type: z.literal('github-plan-generation'),
    llm_provider: z.enum(['openai', 'claude', 'gemini']),
    prompt_template: z.string().optional(),
    model: z.string().optional(),
    max_tokens: z.number().optional(),
    temperature: z.number().optional(),
  }
);

// Create union schema for all step types
export const StepConfigSchema = z.discriminatedUnion('type', [
  ReadGitHubIssueStepConfigSchema,
  GitHubPlanGenerationStepConfigSchema,
]);
```

## 📊 Requirements Analysis

### Core Requirements:

- [x] Read GitHub issue content from context
- [x] Generate execution plans using LLM
- [x] Output plans to console logger
- [x] Integrate with existing flow system

### Technical Constraints:

- [x] Must follow existing step implementation patterns
- [x] Must use current LLM provider infrastructure
- [x] Must support multiple LLM providers

## 🧩 Component Analysis

### Affected Components:

1. **GitHubPlanGenerationStep Class** (`src/flow/types/github-plan-generation-step.ts`)
   - Changes needed: Create new step implementation extending Step base class
   - Dependencies: LLM providers, Logger

2. **Step Schema** (`src/validation/schemas/step.schema.ts`)
   - Changes needed: Add GitHubPlanGenerationStepConfigSchema
   - Changes needed: Create StepConfigSchema union type
   - Dependencies: Zod validation library

3. **Step Factory** (`src/flow/step-factory.ts`)
   - Changes needed: Update to accept StepConfig union type
   - Changes needed: Add case for 'github-plan-generation'
   - Dependencies: New step class

4. **Flow Schema** (`src/validation/schemas/flow.schema.ts`)
   - Changes needed: Update to use StepConfigSchema instead of ReadGitHubIssueStepConfigSchema
   - Dependencies: Updated step schemas

5. **Type Definitions** (`src/types/validation/`)
   - Changes needed: Export new types and StepConfig union
   - Dependencies: Schema definitions

## 🎨 Design Decisions

### Architecture:

- [x] Extend existing Step base class pattern (no separate interface needed)
- [x] Use dependency injection for services
- [x] Get issue data from context (no issueUrl needed)
- [x] Use environment variable for GitHub token
- [x] Create union type for all step configurations
- [x] Keep LLM integration simple - just pass prompt_template to provider
- [x] Output to console instead of GitHub comments

### Error Handling:

- [ ] Graceful fallback for LLM failures
- [ ] Validation of generated plans

## 🔧 Technology Stack

- **Framework**: TypeScript with tsyringe DI
- **Build Tool**: Node.js build scripts
- **Testing**: Vitest
- **LLM Integration**: Existing provider infrastructure

## 🔬 Technology Validation Checkpoints

- [x] Project structure understood
- [x] Dependency injection pattern verified
- [x] LLM provider integration tested
- [x] Build and test infrastructure validated

### Technology Validation Results:

- ✅ TypeScript compilation successful
- ✅ Zod schema validation working
- ✅ Async/await patterns validated
- ✅ Plan generation pattern tested
- ✅ All integration patterns validated

## 📝 Implementation Strategy

### Phase 0: Test-Driven Development

1. [ ] Create E2E test with flow execution
   - [ ] Create test directory structure: `tests/integration/data/github-plan-generation/`
   - [ ] Create test flow JSON file
   - [ ] Write E2E test using `runFlowCommand`
   - [ ] Define expected behavior and output
   - [ ] Set up mocks for GitHub API and LLM responses

### Phase 1: Core Infrastructure

2. [ ] Create schema infrastructure
   - [ ] Create GitHubPlanGenerationStepConfigSchema
   - [ ] Create StepConfigSchema union type
   - [ ] Update FlowConfigSchema to use StepConfigSchema
   - [ ] Export StepConfig type

3. [ ] Update step factory
   - [ ] Change createStep parameter to accept StepConfig
   - [ ] Add type narrowing for step types
   - [ ] Add case for 'github-plan-generation'

4. [ ] Create GitHubPlanGenerationStep class
   - [ ] Extend Step base class
   - [ ] Implement constructor with DI
   - [ ] Add basic execute method structure

### Phase 2: Context Integration

5. [ ] Implement issue reading from context
   - [ ] Get issue data from context (set by ReadGitHubIssueStep)
   - [ ] Extract relevant information
   - [ ] Prepare for LLM processing

### Phase 3: Simple LLM Integration

6. [ ] Implement plan generation
   - [ ] Get LLM provider based on config
   - [ ] Replace template variables with context data
   - [ ] Pass prompt directly to LLM provider
   - [ ] Get generated plan from response

### Phase 4: Output and Testing

7. [ ] Implement console output
   - [ ] Format plan for readability
   - [ ] Log plan using logger service
   - [ ] Include clear markers in output

8. [ ] Create comprehensive tests
   - [ ] Unit tests for step class
   - [ ] Integration tests for flow
   - [ ] Mock LLM calls

### E2E Test Implementation (To be created FIRST):

**Test Flow File** (`github-plan-generation-test-flow.json`):

```json
{
  "id": "github-plan-generation-test-flow",
  "name": "GitHub Plan Generation E2E Test",
  "description": "Tests the plan generation from GitHub issue",
  "initialStepId": "read-issue",
  "steps": [
    {
      "id": "read-issue",
      "type": "read-github-issue",
      "issueUrl": "https://github.com/test/repo/issues/1",
      "github_token": "{{env.GITHUB_TOKEN}}",
      "nextStepId": {
        "default": "generate-plan"
      }
    },
    {
      "id": "generate-plan",
      "type": "github-plan-generation",
      "llm_provider": "openai",
      "model": "gpt-3.5-turbo",
      "prompt_template": "Generate a detailed plan for: {{github.issue.title}}\n\nDescription: {{github.issue.body}}",
      "nextStepId": {}
    }
  ]
}
```

**Test File** (`tests/integration/github-plan-generation-e2e.test.ts`):

```typescript
describe('GitHub Plan Generation Step E2E Test', () => {
  it('should read issue and generate plan', async () => {
    const result = await runFlowCommand(
      testEnv,
      tempTestDir,
      'github-plan-generation-test-flow'
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('ReadGitHubIssueStep: Reading issue');
    expect(result.stdout).toContain('Generating plan for issue');
    expect(result.stdout).toContain('=== GENERATED PLAN ===');
    expect(result.stdout).toContain('## Execution Plan');
    expect(result.stdout).toContain('=== END PLAN ===');
  });
});
```

## 🔗 Dependencies

- LLM provider infrastructure (OpenAI, Claude, Gemini)
- Step base class and interfaces
- Zod for schema validation

## ⚠️ Challenges & Mitigations

- **Challenge 1**: LLM response variability
  - **Mitigation**: Clear formatting instructions in default prompt

- **Challenge 2**: Multiple LLM provider support
  - **Mitigation**: Use existing provider abstraction layer

- **Challenge 3**: Type safety with union types
  - **Mitigation**: Use discriminated union with proper type guards

## ✅ PLAN VERIFICATION CHECKLIST

- Requirements clearly documented? **YES**
- Technology stack validated? **YES**
- Affected components identified? **YES**
- Implementation steps detailed? **YES**
- Dependencies documented? **YES**
- Challenges & mitigations addressed? **YES**
- E2E test strategy defined? **YES**
- Type system updates planned? **YES**
- TDD approach adopted? **YES**
- Simplified to console output? **YES**
- tasks.md updated with plan? **YES**

---

## PLANNING COMPLETE

✅ Implementation plan created
✅ Technology stack validated
✅ tasks.md updated with plan
✅ Challenges and mitigations documented
✅ E2E test strategy with runFlowCommand defined
✅ Type system refactoring planned
✅ Simplified LLM integration approach
✅ TDD approach with E2E test first
✅ Simplified to console output (no GitHub posting)
✅ Complexity adjusted to Level 2

→ **NEXT RECOMMENDED MODE: IMPLEMENT MODE** (No creative phases needed for Level 2)
