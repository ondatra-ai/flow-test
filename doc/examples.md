# Examples and Use Cases

This document provides practical examples of flows, configurations, and real-world use cases for the Claude Code CLI.

## Quick Start Examples

### Hello World Flow

A simple introduction flow to test the system.

**`.flows/flows/hello-world.json`**

```json
{
  "id": "hello-world",
  "name": "Hello World",
  "description": "A simple greeting flow to test the system",
  "initialStep": "greet",
  "steps": {
    "greet": {
      "type": "prompt",
      "prompt": "Say hello to the user and ask how you can help them with their code today.",
      "tools": [],
      "mcpServer": "filesystem",
      "nextStep": "end"
    },
    "end": {
      "type": "prompt",
      "prompt": "Thank the user for using Claude Code CLI and encourage them to try more complex flows.",
      "tools": [],
      "mcpServer": "filesystem",
      "nextStep": null
    }
  }
}
```

### React Component Generator

Complete workflow for creating React components with TypeScript, tests, and documentation.

**`.flows/flows/react-component.json`**

```json
{
  "id": "react-component",
  "name": "React Component Generator",
  "description": "Creates a React component with TypeScript, tests, and documentation",
  "initialStep": "gather-info",
  "steps": {
    "gather-info": {
      "type": "prompt",
      "prompt": "I'll help you create a React component. What's the component name and what should it do?",
      "tools": [],
      "mcpServer": "filesystem",
      "nextStep": "validate-name"
    },
    "validate-name": {
      "type": "condition",
      "condition": "response.match(/^[A-Z][a-zA-Z0-9]*$/)",
      "yes": "create-component",
      "no": "invalid-name"
    },
    "invalid-name": {
      "type": "prompt",
      "prompt": "The component name should start with a capital letter. Please provide a valid name.",
      "tools": [],
      "mcpServer": "filesystem",
      "nextStep": "validate-name"
    },
    "create-component": {
      "type": "prompt",
      "prompt": "Create a TypeScript React functional component with proper props interface and JSDoc comments.",
      "tools": ["write_file", "create_directory"],
      "mcpServer": "filesystem",
      "nextStep": "create-test"
    },
    "create-test": {
      "type": "prompt",
      "prompt": "Create a comprehensive test file using React Testing Library.",
      "tools": ["write_file"],
      "mcpServer": "filesystem",
      "nextStep": null
    }
  }
}
```

## Advanced Workflows

### API Endpoint Creator

Full-stack API development flow that creates REST endpoints with database models, controllers, and tests.

### Bug Fix Assistant

Systematic bug fixing workflow that helps identify, analyze, and fix bugs with proper testing.

### Code Review Assistant

Automated code review flow that analyzes changes for quality, security, and best practices.

## Configuration Examples

### Basic Filesystem Server

```json
{
  "name": "filesystem",
  "command": "mcp-server-filesystem",
  "args": ["--root", "./"],
  "transportType": "stdio",
  "capabilities": {
    "tools": true,
    "resources": true
  }
}
```

### Git Integration Server

```json
{
  "name": "git",
  "command": "mcp-server-git",
  "args": ["--repo-path", "./"],
  "transportType": "stdio",
  "capabilities": {
    "tools": true
  }
}
```

## Best Practices

1. **Keep steps focused** - Each step should have a single, clear purpose
2. **Use descriptive names** - Step IDs and prompts should be self-explanatory
3. **Handle edge cases** - Include error paths and validation
4. **Test thoroughly** - Verify all paths through your flows

These examples provide a foundation for creating your own flows and understanding how to leverage the Claude Code CLI for development tasks.
