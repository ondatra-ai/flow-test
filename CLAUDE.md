# Claude-Code CLI Clone Project

A TypeScript-based CLI application that replicates claude-code functionality with MCP (Model Context Protocol) server integration and custom flow definitions.

## Project Overview

This project aims to create a chat-based CLI application similar to claude-code that can:
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

## Configuration

The application reads all configuration from the `.flows` folder in the current working directory:

```
.flows/
├── flows/
│   └── *.json    # Flow definition files
└── servers/
    └── *.json    # MCP server configuration files
```

### Flow Definition Example

```json
{
  "id": "create-component",
  "name": "Create React Component",
  "description": "Creates a new React component with tests",
  "initialStep": "gather-info",
  "steps": {
    "gather-info": {
      "type": "prompt",
      "prompt": "What type of component would you like to create?",
      "tools": ["file_create", "file_edit"],
      "mcpServer": "filesystem-server",
      "nextStep": "check-type"
    },
    "check-type": {
      "type": "condition",
      "condition": "response.includes('functional')",
      "yes": "create-functional",
      "no": "create-class"
    }
  }
}
```

### MCP Server Configuration Example

```json
{
  "name": "filesystem-server",
  "command": "mcp-server-filesystem",
  "args": ["--root", "./"],
  "transportType": "stdio",
  "capabilities": {
    "tools": true,
    "resources": true
  }
}
```

## Development Setup

1. **Requirements**:
   - Node.js 18+
   - TypeScript 5+
   - npm or yarn

2. **Installation**:
   ```bash
   npm install
   ```

3. **Development**:
   ```bash
   npm run dev
   ```

4. **Testing**:
   ```bash
   npm test
   ```

5. **Building**:
   ```bash
   npm run build
   ```

## Usage

Once installed globally (`npm install -g claude-code-cli`) or via npx:

```bash
# Run in a directory with .flows configuration
claude-code-cli

# Or with npx
npx claude-code-cli
```

The CLI will:
1. Load configuration from `.flows` directory
2. Start configured MCP servers
3. Present an interactive chat interface
4. Execute flows based on user input

## Project Rules

Detailed development rules and standards are defined in `.cursor/rules/claude-code-cli/`:
- Project overview and core features
- Architecture patterns and design decisions
- Development standards (TypeScript, testing, code quality)
- Flow format specifications
- MCP server configuration guidelines
- Project structure and implementation priorities

## Technology Stack

- **Language**: TypeScript (strict mode)
- **CLI Framework**: Ink (React for CLI)
- **MCP SDK**: @modelcontextprotocol/sdk
- **Testing**: Vitest
- **Validation**: Zod
- **State Management**: XState
- **Logging**: Winston
- **Build Tool**: esbuild/tsup

## Implementation Roadmap

1. **Phase 1**: Foundation - Project setup, configuration loading, basic chat interface
2. **Phase 2**: MCP Integration - Server management, client implementation, tool discovery
3. **Phase 3**: Flow Engine - Flow loader, executor, condition evaluator
4. **Phase 4**: Chat Integration - Connect chat to flows, AI integration, tool execution
5. **Phase 5**: Polish - Error handling, logging, documentation, packaging

## Contributing

This project follows strict development standards:
- All code must pass ESLint and Prettier checks
- Minimum 80% test coverage (100% for flow engine)
- TypeScript strict mode is enforced
- All functions must have explicit return types
- Comprehensive error handling required

## License

[To be determined]