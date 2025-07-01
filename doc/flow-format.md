# Flow Format Reference

This document provides a comprehensive reference for creating and editing flow definition files.

## Overview

Flows are JSON files that define interactive workflows for the AI assistant. They specify sequences of steps, conditions, and tool usage to accomplish specific tasks.

## File Structure

Flow files must be placed in `.flows/flows/` directory and have a `.json` extension.

```
.flows/
└── flows/
    ├── component-generator.json
    ├── api-creator.json
    └── documentation-helper.json
```

## Basic Flow Schema

```json
{
  "id": "unique-flow-id",
  "name": "Human Readable Flow Name", 
  "description": "Detailed description of what this flow does",
  "initialStep": "step-id",
  "steps": {
    "step-id": {
      "type": "prompt" | "condition",
      // Additional fields based on type
    }
  }
}
```

### Required Fields

- **id**: Unique identifier for the flow (kebab-case recommended)
- **name**: Human-readable name displayed in UI
- **description**: Detailed explanation of the flow's purpose
- **initialStep**: ID of the first step to execute
- **steps**: Object containing all step definitions

## Step Types

### Prompt Steps

Prompt steps send instructions to the AI and provide tools for task execution.

```json
{
  "type": "prompt",
  "prompt": "The instruction text to send to the AI model",
  "tools": ["tool1", "tool2"],
  "mcpServer": "server-name",
  "nextStep": "next-step-id"
}
```

**Fields:**
- **type**: Must be `"prompt"`
- **prompt**: Clear, specific instruction for the AI
- **tools**: Array of tool names available for this step
- **mcpServer**: Name of the MCP server providing the tools
- **nextStep**: ID of the next step (null for end of flow)

**Example:**
```json
{
  "type": "prompt",
  "prompt": "Create a React functional component with the specified props. Include TypeScript types and JSDoc comments.",
  "tools": ["write_file", "read_file", "list_files"],
  "mcpServer": "filesystem",
  "nextStep": "add-tests"
}
```

### Condition Steps

Condition steps evaluate JavaScript expressions to determine flow branching.

```json
{
  "type": "condition",
  "condition": "JavaScript expression that evaluates to boolean",
  "yes": "step-id-if-true",
  "no": "step-id-if-false"
}
```

**Fields:**
- **type**: Must be `"condition"`
- **condition**: JavaScript expression returning boolean
- **yes**: Step ID to execute if condition is true
- **no**: Step ID to execute if condition is false

**Example:**
```json
{
  "type": "condition", 
  "condition": "response.toLowerCase().includes('typescript')",
  "yes": "typescript-component",
  "no": "javascript-component"
}
```

## Context Variables

Use these variables in prompts and conditions:

### Available Variables

- **{{response}}** - Last AI response text
- **{{user_input}}** - Most recent user input
- **{{step_data}}** - Data accumulated from previous steps
- **{{flow_vars}}** - Flow-level variables

### Usage Examples

**In Prompts:**
```json
{
  "prompt": "Based on the user's request: '{{user_input}}', create the appropriate component type."
}
```

**In Conditions:**
```json
{
  "condition": "user_input.includes('functional') || response.includes('hooks')"
}
```

## Advanced Features

### Dynamic Tool Selection

Tools can be selected dynamically based on context:

```json
{
  "type": "prompt",
  "prompt": "Analyze the project structure and recommend improvements",
  "tools": ["{{project_tools}}", "semantic_search", "git_status"],
  "mcpServer": "analysis"
}
```

### Multi-Step Variables

Pass data between steps using step_data:

```json
{
  "type": "prompt",
  "prompt": "Store the component name '{{user_input}}' and generate the file structure",
  "tools": ["write_file"],
  "mcpServer": "filesystem",
  "nextStep": "create-tests"
}
```

### Complex Conditions

Use JavaScript expressions for sophisticated branching:

```json
{
  "condition": "(response.includes('React') && user_input.includes('component')) || step_data.framework === 'react'"
}
```

## Validation Rules

### Step ID Rules

- Must be unique within the flow
- Use kebab-case naming convention
- Be descriptive of the step's purpose

```json
// ✅ Good
"gather-user-requirements"
"create-component-file" 
"add-unit-tests"

// ❌ Bad
"step1"
"do-stuff"
"a"
```

### Reference Validation

- `initialStep` must reference an existing step ID
- `nextStep`, `yes`, and `no` must reference valid step IDs or be null
- Circular references are allowed but should be intentional

### Tool Validation

- Tool names must match those available from the specified MCP server
- Empty tools array is valid but should be intentional
- Non-existent tools will cause runtime errors

### Condition Validation

- Must be valid JavaScript expressions
- Should return boolean values
- Avoid side effects in condition expressions

## Best Practices

### Prompt Writing

**Be Specific and Clear**
```json
// ✅ Good
{
  "prompt": "Create a TypeScript interface for a User with properties: id (number), name (string), email (string), and createdAt (Date). Include JSDoc comments for each property."
}

// ❌ Poor  
{
  "prompt": "Make a user interface"
}
```

**Provide Context**
```json
{
  "prompt": "Based on the existing codebase structure in {{step_data.project_info}}, create a new service class that follows the established patterns."
}
```

**Use Action-Oriented Language**
```json
{
  "prompt": "Generate, validate, and save the component file with proper TypeScript types and error handling."
}
```

### Step Organization

**Single Responsibility**
Each step should have one clear purpose:

```json
{
  "create-component": {
    "type": "prompt",
    "prompt": "Create the React component file only",
    "nextStep": "create-tests"
  },
  "create-tests": {
    "type": "prompt", 
    "prompt": "Create unit tests for the component",
    "nextStep": "update-exports"
  }
}
```

**Logical Flow Structure**
```json
{
  "initialStep": "gather-requirements",
  "steps": {
    "gather-requirements": {
      "type": "prompt",
      "prompt": "Ask user for component requirements",
      "nextStep": "validate-input"
    },
    "validate-input": {
      "type": "condition",
      "condition": "response.includes('name')",
      "yes": "create-component",
      "no": "gather-requirements"
    },
    "create-component": {
      "type": "prompt", 
      "prompt": "Create the component with validated requirements",
      "nextStep": null
    }
  }
}
```

### Error Handling

**Provide Fallback Paths**
```json
{
  "type": "condition",
  "condition": "step_data.component_type === 'class'",
  "yes": "create-class-component",
  "no": "create-functional-component"  
}
```

**Include Retry Logic**
```json
{
  "validate-creation": {
    "type": "condition",
    "condition": "step_data.file_created === true",
    "yes": "finalize",
    "no": "retry-creation"
  }
}
```

## Example Flows

### Simple Component Generator

```json
{
  "id": "simple-component",
  "name": "Simple Component Generator",
  "description": "Creates a basic React functional component",
  "initialStep": "get-name",
  "steps": {
    "get-name": {
      "type": "prompt",
      "prompt": "What should the component be called? Provide just the name.",
      "tools": [],
      "mcpServer": "filesystem",
      "nextStep": "create-file"
    },
    "create-file": {
      "type": "prompt",
      "prompt": "Create a React functional component named {{response}} in the src/components directory. Include TypeScript types and basic structure.",
      "tools": ["write_file", "list_files"],
      "mcpServer": "filesystem", 
      "nextStep": null
    }
  }
}
```

### Advanced API Generator

```json
{
  "id": "api-generator",
  "name": "API Endpoint Generator", 
  "description": "Creates REST API endpoints with full CRUD operations",
  "initialStep": "analyze-project",
  "steps": {
    "analyze-project": {
      "type": "prompt",
      "prompt": "Analyze the existing project structure to understand the API patterns and database setup.",
      "tools": ["list_files", "read_file", "grep_search"],
      "mcpServer": "filesystem",
      "nextStep": "get-requirements"
    },
    "get-requirements": {
      "type": "prompt",
      "prompt": "What entity do you want to create API endpoints for? Describe the data structure and required operations.",
      "tools": [],
      "mcpServer": "filesystem", 
      "nextStep": "check-database"
    },
    "check-database": {
      "type": "condition",
      "condition": "response.toLowerCase().includes('database') || step_data.has_db",
      "yes": "create-model",
      "no": "create-in-memory"
    },
    "create-model": {
      "type": "prompt",
      "prompt": "Create the database model/schema for {{user_input}} following the existing patterns in the project.",
      "tools": ["write_file", "read_file"],
      "mcpServer": "filesystem",
      "nextStep": "create-controller"
    },
    "create-in-memory": {
      "type": "prompt",
      "prompt": "Create in-memory data structure for {{user_input}} suitable for development/testing.",
      "tools": ["write_file"],
      "mcpServer": "filesystem", 
      "nextStep": "create-controller"
    },
    "create-controller": {
      "type": "prompt",
      "prompt": "Create the API controller with CRUD operations for {{user_input}}. Include proper error handling and validation.",
      "tools": ["write_file", "read_file"],
      "mcpServer": "filesystem",
      "nextStep": "create-routes"
    },
    "create-routes": {
      "type": "prompt",
      "prompt": "Create the route definitions and wire them to the controller. Follow RESTful conventions.",
      "tools": ["write_file", "read_file"],
      "mcpServer": "filesystem",
      "nextStep": "create-tests"
    },
    "create-tests": {
      "type": "prompt",
      "prompt": "Create comprehensive unit and integration tests for the new API endpoints.",
      "tools": ["write_file"],
      "mcpServer": "filesystem",
      "nextStep": null
    }
  }
}
```

## Troubleshooting

### Common Issues

**Invalid JSON Syntax**
```bash
# Validate JSON syntax
cat .flows/flows/my-flow.json | jq .
```

**Missing Step References**
```bash
# Check for undefined step references
claude-code-cli --validate
```

**Tool Not Available**
```bash
# List available tools for server
claude-code-cli --list-tools --server filesystem
```

### Debugging Tips

1. **Test conditions in isolation** - Use simple test flows
2. **Validate step sequences** - Trace through the flow logic
3. **Check tool availability** - Ensure MCP servers provide required tools
4. **Use debug mode** - Run with `--debug` for detailed execution logs

### Performance Considerations

- **Minimize tool usage** in each step
- **Avoid complex conditions** that might be slow to evaluate
- **Use caching** for repeated operations
- **Batch related operations** in single steps when possible 