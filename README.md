# Ondatra Code

An interactive conversational interface similar to claude-code. Built with TypeScript, this application integrates with AI models through MCP (Model Context Protocol) servers and executes custom-defined flows.

## Overview

Ondatra Code provides a command-line interface similar to claude-code, with the following key features:

- **Code generation and editing capabilities** - AI-powered code generation and modification
- **MCP Server Integration** - Connect to multiple MCP servers for various tool capabilities  
- **Custom Flow System** - JSON-based flow definitions for complex AI-driven workflows
- **Chat Interface** - Interactive conversational interface similar to claude-code

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Run the CLI:**
   ```bash
   npm start
   ```
   
   This should output: `Ondatra Code`

## Available Commands

### Development Commands
- `npm run dev` - Run in development mode with hot reload
- `npm run build` - Build the TypeScript project
- `npm start` - Run the built application

### Code Quality Commands
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Automatically fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is properly formatted
- `npm run type-check` - Run TypeScript type checking

### Testing Commands
- `npm test` - Run tests with Vitest
- `npm run test:ui` - Run tests with UI interface
- `npm run test:coverage` - Run tests with coverage report

### Quality Control
- `npm run pre-commit` - Run all checks (type-check, lint, format-check, test)

## Code Quality Standards

This project enforces strict code quality standards:

- **Max 300 lines per file**
- **Max 80 characters per line** 
- **Max complexity of 10 per function**
- **Max 50 lines per function**
- **Max 5 parameters per function**
- **Strict TypeScript** with no `any` types
- **Comprehensive ESLint rules** with Prettier integration

## Architecture

The application is built with a modular architecture:

- **Configuration-driven** from `.flows` folder in current working directory
- **Multi-server support** for simultaneous MCP server connections
- **Branching flow logic** with conditional execution
- **Tool discovery** for available MCP server capabilities
- **Strict TypeScript** implementation with comprehensive error handling

## Project Structure

```
./
├── src/                    # Source code
│   ├── cli/               # Chat interface implementation (planned)
│   ├── flows/             # Flow execution engine  
│   │   └── types.ts       # Flow type definitions
│   ├── mcp/               # MCP server integration
│   │   └── types.ts       # MCP type definitions
│   ├── config/            # Configuration management (planned)
│   ├── utils/             # Utilities and helpers
│   │   ├── logger.ts      # Logging utilities
│   │   └── errors.ts      # Custom error classes
│   └── index.ts           # Main entry point
├── tests/                 # Test files
│   └── unit/              # Unit tests
│       └── utils/         # Utility tests
├── examples/              # Example configurations
│   └── .flows/           # Example flow and server configs
├── doc/                   # Documentation
├── scripts/               # Build and utility scripts
│   └── build.ts          # Build script
└── dist/                  # Compiled JavaScript output
```

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm

### Development Workflow
1. Make changes to TypeScript files in `src/`
2. Run `npm run type-check` to verify types
3. Run `npm run lint` to check code quality
4. Run `npm test` to run tests
5. Run `npm run build` to compile
6. Run `npm start` to test the application

### Adding New Features
Follow the established patterns:
- Add types in appropriate `types.ts` files
- Create tests in `tests/` directory 
- Use the custom error classes from `utils/errors.ts`
- Follow the logging patterns from `utils/logger.ts`
- Maintain the strict TypeScript and ESLint rules

## Configuration

The application reads configuration from a `.flows` folder structure:

```
.flows/
├── flows/
│   └── *.json    # Flow definition files
└── servers/
    └── *.json    # MCP server configuration files
```

See the `examples/.flows/` directory for reference configurations.

## Documentation

- [Installation](doc/installation.md) - Setup and installation guide
- [Usage](doc/usage.md) - How to use the CLI
- [Flow Format](doc/flow-format.md) - Flow definition reference
- [MCP Servers](doc/mcp-servers.md) - MCP server configuration
- [Examples](doc/examples.md) - Example flows and use cases
- [Development](doc/development.md) - Development guide for contributors
- [Architecture](doc/architecture.md) - System architecture overview

## Current Implementation Status

This is the initial project setup with:

✅ **Completed:**
- TypeScript project structure with strict settings
- ESLint with comprehensive rules (max lines, complexity, etc.)
- Prettier integration for code formatting
- Vitest for testing with coverage reporting
- Basic CLI structure with Commander.js
- Type definitions for flows and MCP servers
- Utility classes for logging and error handling
- Example configurations
- Build and development scripts

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

## License

MIT License 