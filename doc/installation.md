# Installation Guide

## Prerequisites

- **Node.js**: Version 22 or higher
- **npm**: Version 8 or higher (comes with Node.js)
- **TypeScript**: Version 5 or higher (installed globally or via npm)

### Method 1: Local Development Installation

For developers who want to contribute or modify the CLI:

```bash
# Clone the repository
git clone <repository-url>
cd ondatra-code

# Install dependencies
npm install

# Build the project
npm run build

# Run locally
npm start
```

## Configuration Setup

### 1. Create Configuration Directory

Create a `.flows` folder in your project directory:

```bash
mkdir -p .flows/flows .flows/servers
```

### 2. Configure MCP Servers

Create server configuration files in `.flows/servers/`:

**Example: `.flows/servers/filesystem.json`**

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

**Example: `.flows/servers/git.json`**

```json
{
  "name": "git",
  "command": "mcp-server-git",
  "args": [],
  "transportType": "stdio",
  "capabilities": {
    "tools": true
  }
}
```

### 3. Create Your First Flow

Create a flow file in `.flows/flows/`:

**Example: `.flows/flows/hello-world.json`**

```json
{
  "id": "hello-world",
  "name": "Hello World Flow",
  "description": "A simple greeting flow",
  "initialStep": "greet",
  "steps": {
    "greet": {
      "type": "prompt",
      "prompt": "Say hello to the user and ask how you can help them today.",
      "tools": ["list_files", "read_file"],
      "mcpServer": "filesystem",
      "nextStep": "end"
    },
    "end": {
      "type": "prompt",
      "prompt": "Thank the user and say goodbye.",
      "tools": [],
      "mcpServer": "filesystem",
      "nextStep": null
    }
  }
}
```

## Environment Variables

Set up required environment variables for AI providers:

```bash
# For OpenAI
export OPENAI_API_KEY="your-api-key-here"

# For Anthropic
export ANTHROPIC_API_KEY="your-api-key-here"

# Optional: Default AI provider
export AI_PROVIDER="openai"  # or "anthropic"
```

## Verification

Test your installation:

```bash
# Check CLI is installed
ondatra-code --version

# Run in a directory with .flows configuration
cd your-project
ondatra-code
```

## Troubleshooting

### Common Issues

**1. Command not found**

- Ensure Node.js and npm are properly installed
- For global installation, check npm global bin path: `npm config get prefix`
- Add npm global bin to your PATH

**2. MCP Server not starting**

- Verify server commands are in your PATH
- Check server configuration syntax
- Review server logs for error messages

**3. AI API errors**

- Verify API keys are set correctly
- Check API key permissions and quotas
- Ensure network connectivity

**4. Flow validation errors**

- Validate JSON syntax in flow files
- Check step ID references are correct
- Verify tool names match MCP server capabilities

### Getting Help

- Check logs in `~/.ondatra-code/logs/`
- Run with debug mode: `ondatra-code --debug`
- Review documentation in the `doc/` folder
- Submit issues on the project repository

## Next Steps

- Read the [Usage Guide](usage.md) to learn how to use the CLI
- Explore [Flow Format Reference](flow-format.md) to create custom flows
- Check [Examples](examples.md) for inspiration
- Review [MCP Server Configuration](mcp-servers.md) for advanced setups
