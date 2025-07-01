# Claude Code CLI Documentation

This directory contains comprehensive documentation for the Claude Code CLI project.

## Documentation Structure

### User Documentation

- **[Installation Guide](doc/installation.md)** - Complete setup and installation instructions
- **[Usage Guide](doc/usage.md)** - How to use the CLI effectively
- **[Flow Format Reference](doc/flow-format.md)** - Complete guide to creating and editing flows
- **[MCP Server Configuration](doc/mcp-servers.md)** - Setting up and managing MCP servers
- **[Examples](doc/examples.md)** - Practical examples and use cases

### Developer Documentation

- **[Development Guide](doc/development.md)** - Complete guide for contributors
- **[Architecture Overview](doc/architecture.md)** - System design and component architecture

## Quick Links

### Getting Started
1. [Install the CLI](doc/installation.md#installation-methods)
2. [Set up your first configuration](doc/installation.md#configuration-setup)  
3. [Try the hello world example](doc/examples.md#hello-world-flow)
4. [Explore advanced examples](doc/examples.md#development-workflows)

### Key Concepts
- **Flows**: JSON-based workflow definitions that guide AI interactions
- **MCP Servers**: External processes that provide tools and capabilities
- **Steps**: Individual actions within a flow (prompts or conditions)
- **Tools**: Functions provided by MCP servers for file operations, git commands, etc.

### Common Tasks
- [Creating a new flow](doc/flow-format.md#basic-flow-schema)
- [Adding an MCP server](doc/mcp-servers.md#basic-configuration-schema)
- [Setting up project-specific configurations](doc/installation.md#configuration-setup)
- [Debugging flow execution](doc/usage.md#troubleshooting)

## Architecture Overview

```Claude Code CLI
├── Chat Interface (Ink-based UI)
├── Flow Engine (JSON workflow execution)
├── MCP Integration (External tool providers)
├── Configuration Management (.flows directory)
└── AI Model Integration (OpenAI, Anthropic, etc.)
```

## Contributing to Documentation

When updating documentation:

1. **Keep it current** - Update docs when features change
2. **Include examples** - Show don't just tell
3. **Test instructions** - Verify all commands and examples work
4. **Cross-reference** - Link between related sections
5. **Consider all users** - From beginners to advanced developers

### Documentation Standards

- Use clear, concise language
- Include code examples with proper syntax highlighting
- Provide step-by-step instructions
- Add troubleshooting sections for common issues
- Include links to related documentation
- Use consistent formatting and structure

## Feedback

If you find issues with the documentation or have suggestions for improvement:

1. Check existing issues in the project repository
2. Create a new issue with the "documentation" label
3. Provide specific details about what's unclear or missing
4. Suggest improvements where possible

## License

This documentation is part of the Claude Code CLI project and follows the same license terms. 