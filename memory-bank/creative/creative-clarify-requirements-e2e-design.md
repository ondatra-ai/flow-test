## E2E Test Design Update: VAN-Inspired Multi-Phase Approach

### Test Flow Structure

The clarify-requirements step will follow a multi-phase approach similar to VAN mode:

1. **Analysis Phase**: Analyze issue requirements
2. **Validation Phase**: Validate requirement completeness
3. **Clarification Phase**: Generate and post clarifying questions
4. **Monitoring Phase**: Wait for and process responses

### Test Scenarios

#### Test 1: Clear Requirements (No Clarification Needed)

- **Issue**: Well-defined requirements with all necessary details
- **Expected**: Analysis passes all checks, no clarification posted
- **Validation Points**:
  - ✓ Requirements analysis complete
  - ✓ Completeness score > 80%
  - ✓ No ambiguities detected
  - ✓ No comment posted

#### Test 2: Ambiguous Requirements (Clarification Required)

- **Issue**: Vague requirements with missing details
- **Expected**: Analysis detects issues, posts clarification comment
- **Validation Points**:
  - ✓ Requirements analysis complete
  - ✓ Ambiguities detected
  - ✓ Questions generated
  - ✓ Comment posted to GitHub

#### Test 3: Context Analysis from Related Issues

- **Issue**: Requirements that reference other issues
- **Expected**: Analyzes context from related issues
- **Validation Points**:
  - ✓ Related issues identified
  - ✓ Context extracted
  - ✓ Cross-reference validation
  - ✓ Comprehensive analysis

### Test Flow Configuration Pattern

```json
{
  "id": "clarify-requirements-test-flow",
  "name": "Clarify Requirements Test",
  "description": "Tests requirement clarification with checkpoints",
  "initialStepId": "read-issue",
  "steps": [
    {
      "id": "read-issue",
      "type": "read-github-issue",
      "issueUrl": "{{github_issue_url}}",
      "github_token": "{{env.GITHUB_TOKEN}}",
      "nextStepId": {
        "default": "clarify-requirements"
      }
    },
    {
      "id": "clarify-requirements",
      "type": "clarify-requirements",
      "requirementAnalysis": {
        "checkCompleteness": true,
        "detectAmbiguity": true,
        "analyzeContext": true
      },
      "clarificationBehavior": {
        "postAsComment": true,
        "dryRun": false
      },
      "github_token": "{{env.GITHUB_TOKEN}}",
      "nextStepId": {}
    }
  ]
}
```

### Checkpoint Validation Pattern (VAN-inspired)

Each test will validate checkpoints similar to VAN mode:

```
✓ ANALYSIS CHECKPOINT
- Requirements extracted? [YES/NO]
- Completeness checked? [YES/NO]
- Ambiguities detected? [YES/NO]
- Context analyzed? [YES/NO]

✓ CLARIFICATION CHECKPOINT
- Questions generated? [YES/NO]
- Comment formatted? [YES/NO]
- GitHub API called? [YES/NO]
- Response received? [YES/NO]
```

### Error Handling Tests

Similar to VAN QA's failure handling:

1. **GitHub API Failure**: Test retry mechanism
2. **Invalid Issue URL**: Test error messaging
3. **Missing Permissions**: Test permission checks
4. **Rate Limit**: Test backoff strategy
