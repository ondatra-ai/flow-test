# ONDATRA CODE - PROJECT BRIEF

## Project Overview

Ondatra Code is an interactive conversational interface similar to claude-code with MCP (Model Context Protocol) server integration and custom flow definitions.

## Core Purpose

Create a chat-based CLI application that can:

- Generate and edit code through AI-powered conversations
- Integrate with multiple MCP servers for extended capabilities
- Execute custom-defined flows with branching logic
- Provide an interactive chat interface for natural interactions

## Key Features

1. **Chat-Based Interface**: Interactive conversational UI similar to claude-code
2. **MCP Server Integration**: Connect to multiple MCP servers simultaneously
3. **Flow System**: JSON-based workflow definitions with conditional branching
4. **Tool Discovery**: Automatic discovery of available tools from MCP servers
5. **Strict TypeScript**: Built with the strictest TypeScript configuration

## Technology Stack

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js 18+
- **CLI Framework**: Commander.js
- **MCP Integration**: @modelcontextprotocol/sdk
- **Testing**: Vitest
- **Build Tool**: TypeScript compiler
- **DI Container**: tsyringe

## Configuration Architecture

Application reads configuration from `.flows` folder:

```
.flows/
├── flows/
│   └── *.json    # Flow definition files
└── servers/
    └── *.json    # MCP server configuration files
```

## Current Implementation Status

✅ **Completed:**

- TypeScript project structure with strict settings
- ESLint with comprehensive rules
- Prettier integration for code formatting
- Vitest for testing with coverage reporting
- Basic CLI structure with Commander.js
- Type definitions for flows and MCP servers
- Utility classes for logging and error handling

🚧 **In Progress:**

- Flow execution engine implementation
- MCP server integration
- Chat interface implementation
- Configuration loading and validation

📋 **Planned:**

- AI model integration
- Interactive chat interface
- Flow debugging tools
- Plugin system

## Project Goals

Build a production-ready CLI tool that provides a conversational interface for code generation and editing, integrated with MCP servers for extended capabilities through custom flow definitions.
