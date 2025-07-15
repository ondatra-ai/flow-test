# Documentation

This directory contains project documentation that can be used as GitHub Wiki content.

## Available Documentation

### [Requirements-Driven Development Workflow](Requirements-Driven-Development-Workflow.md)

Complete guide to our development methodology where developers change requirements and AI generates code.

## GitHub Wiki Setup

### Creating the Wiki Page

1. **Open the Wiki**: The GitHub wiki has been enabled and can be accessed at:

   ```bash
   gh browse --wiki
   ```

   Or visit: https://github.com/ondatra-ai/flow-test/wiki

2. **Create the First Page**:
   - Click "Create the first page"
   - Title: "Requirements-Driven Development Workflow"
   - Copy content from [`Requirements-Driven-Development-Workflow.md`](Requirements-Driven-Development-Workflow.md)
   - Save the page

3. **Clone Wiki for Future Edits** (after first page is created):
   ```bash
   git clone git@github.com:ondatra-ai/flow-test.wiki.git
   cd flow-test.wiki
   # Edit .md files and commit/push as normal git repository
   ```

### Wiki Management Commands

```bash
# Open wiki in browser
gh browse --wiki

# View repository
gh repo view --web

# Enable wiki (already done)
gh api repos/ondatra-ai/flow-test --method PATCH --field has_wiki=true
```

## Navigation Structure

```
Documentation/
├── README.md (this file)
├── Requirements-Driven-Development-Workflow.md
└── [Future documentation files]
```

## Template System

The documentation references several templates:

- `requirements_template.md`: For structured requirements
- `task_template.md`: For task initialization
- `init_task_instruction.md`: For AI task setup

These templates enable the requirements-driven development workflow described in the main documentation.

---

**Note**: This documentation serves as both wiki content and in-repository reference material.
