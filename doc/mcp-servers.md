# MCP Server Configuration Guide

This document provides comprehensive guidance for configuring and managing MCP (Model Context Protocol) servers with the Claude Code CLI.

## Overview

MCP servers provide tools and capabilities that the AI assistant can use during flow execution. Each server runs as a separate process and communicates with the CLI through the MCP protocol.

## Configuration File Structure

MCP server configurations are stored as JSON files in `.flows/servers/` directory:

```
.flows/
└── servers/
    ├── filesystem.json
    ├── git.json
    ├── database.json
    └── web-scraper.json
```

## Basic Configuration Schema

```json
{
  "name": "unique-server-name",
  "command": "command-to-start-server",
  "args": ["arg1", "arg2"],
  "env": {
    "ENV_VAR": "value"
  },
  "transportType": "stdio" | "http",
  "transportOptions": {
    // Transport-specific options
  },
  "capabilities": {
    "tools": true,
    "resources": true,
    "prompts": false
  }
}
```

### Required Fields

- **name**: Unique identifier for the server (used in flow references)
- **command**: Executable command to start the server
- **transportType**: Communication protocol ("stdio" or "http")
- **capabilities**: Features provided by the server

### Optional Fields

- **args**: Command line arguments for the server
- **env**: Environment variables for the server process
- **transportOptions**: Protocol-specific configuration

## Transport Types

### STDIO Transport

Most common transport type for local MCP servers:

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

**Benefits:**

- Simple setup and configuration
- Low latency communication
- Automatic process management
- No network configuration required

**Use Cases:**

- File system operations
- Local development tools
- Git operations
- Local database access

### HTTP Transport

Used for remote MCP servers or services:

```json
{
  "name": "remote-api",
  "command": "mcp-server-api",
  "transportType": "http",
  "transportOptions": {
    "url": "http://localhost:3001/mcp",
    "headers": {
      "Authorization": "Bearer ${API_TOKEN}"
    }
  },
  "capabilities": {
    "tools": true
  }
}
```

**Benefits:**

- Can connect to remote services
- Supports load balancing
- Language-agnostic server implementation
- Better for production deployments

**Use Cases:**

- External API integrations
- Remote database access
- Cloud services
- Microservices architectures

## Server Capabilities

### Tools

Servers that provide executable tools:

```json
{
  "capabilities": {
    "tools": true
  }
}
```

**Examples:**

- File operations (read, write, delete)
- Git commands (commit, push, pull)
- Database queries
- API calls
- Code analysis

### Resources

Servers that provide readable resources:

```json
{
  "capabilities": {
    "resources": true
  }
}
```

**Examples:**

- File contents
- Database schemas
- API documentation
- Configuration files
- Log files

### Prompts

Servers that provide AI prompts or templates:

```json
{
  "capabilities": {
    "prompts": true
  }
}
```

**Examples:**

- Code generation templates
- Documentation templates
- Test case generators
- Refactoring patterns

## Built-in Server Examples

### Filesystem Server

```json
{
  "name": "filesystem",
  "command": "mcp-server-filesystem",
  "args": ["--root", "./", "--allowed-extensions", ".ts,.js,.json,.md"],
  "env": {
    "FS_WATCH": "true"
  },
  "transportType": "stdio",
  "capabilities": {
    "tools": true,
    "resources": true
  }
}
```

**Available Tools:**

- `list_files` - List directory contents
- `read_file` - Read file contents
- `write_file` - Create or update files
- `delete_file` - Remove files
- `create_directory` - Create directories
- `move_file` - Move or rename files

### Git Server

```json
{
  "name": "git",
  "command": "mcp-server-git",
  "args": ["--repo-path", "./"],
  "transportType": "stdio",
  "capabilities": {
    "tools": true,
    "resources": true
  }
}
```

**Available Tools:**

- `git_status` - Check repository status
- `git_add` - Stage files for commit
- `git_commit` - Create commits
- `git_push` - Push changes to remote
- `git_pull` - Pull changes from remote
- `git_branch` - Manage branches
- `git_log` - View commit history

### Database Server

```json
{
  "name": "database",
  "command": "mcp-server-postgres",
  "args": ["--connection-string", "${DATABASE_URL}"],
  "env": {
    "DATABASE_URL": "postgresql://user:pass@localhost:5432/mydb"
  },
  "transportType": "stdio",
  "capabilities": {
    "tools": true,
    "resources": true
  }
}
```

**Available Tools:**

- `execute_query` - Run SQL queries
- `get_schema` - Retrieve database schema
- `create_table` - Create new tables
- `insert_data` - Insert records
- `update_data` - Update records
- `delete_data` - Delete records

### Web Scraper Server

```json
{
  "name": "web-scraper",
  "command": "mcp-server-web",
  "transportType": "http",
  "transportOptions": {
    "url": "http://localhost:3002/mcp"
  },
  "capabilities": {
    "tools": true
  }
}
```

**Available Tools:**

- `fetch_url` - Download web pages
- `extract_text` - Extract text content
- `find_links` - Find links on pages
- `screenshot` - Take page screenshots
- `submit_form` - Submit web forms

## Security Considerations

### Environment Variables

Store sensitive data in environment variables:

```json
{
  "env": {
    "API_KEY": "${EXTERNAL_API_KEY}",
    "DATABASE_PASSWORD": "${DB_PASSWORD}"
  }
}
```

**Best Practices:**

- Never hardcode credentials in configuration files
- Use environment variable substitution
- Rotate credentials regularly
- Limit server access permissions

### File System Access

Restrict file system access appropriately:

```json
{
  "args": [
    "--root",
    "./src",
    "--allowed-extensions",
    ".ts,.js,.json",
    "--deny-paths",
    "node_modules,dist,.env"
  ]
}
```

### Network Access

Configure network restrictions for HTTP servers:

```json
{
  "transportOptions": {
    "url": "https://api.example.com/mcp",
    "headers": {
      "Authorization": "Bearer ${API_TOKEN}",
      "User-Agent": "claude-code-cli/1.0"
    },
    "timeout": 30000,
    "retries": 3
  }
}
```

## Advanced Configuration

### Health Checks

Configure health monitoring:

```json
{
  "name": "api-server",
  "command": "mcp-server-api",
  "transportType": "http",
  "transportOptions": {
    "url": "http://localhost:3001/mcp",
    "healthCheck": {
      "endpoint": "/health",
      "interval": 30000,
      "timeout": 5000
    }
  },
  "capabilities": {
    "tools": true
  }
}
```

### Auto-restart

Configure automatic restart on failure:

```json
{
  "name": "filesystem",
  "command": "mcp-server-filesystem",
  "restartPolicy": {
    "enabled": true,
    "maxRestarts": 5,
    "restartDelay": 1000
  },
  "transportType": "stdio",
  "capabilities": {
    "tools": true
  }
}
```

### Logging

Configure server-specific logging:

```json
{
  "name": "database",
  "command": "mcp-server-postgres",
  "logging": {
    "level": "info",
    "file": "~/.claude-code-cli/logs/database-server.log",
    "rotateSize": "10MB",
    "rotateCount": 5
  },
  "transportType": "stdio",
  "capabilities": {
    "tools": true
  }
}
```

## Custom Server Development

### Creating a Custom Server

Basic TypeScript example:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server(
  {
    name: 'my-custom-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'my_tool',
        description: 'A custom tool',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string' },
          },
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async request => {
  if (request.params.name === 'my_tool') {
    return {
      content: [
        {
          type: 'text',
          text: `Processed: ${request.params.arguments?.input}`,
        },
      ],
    };
  }
  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Configuration for Custom Server

```json
{
  "name": "my-custom-server",
  "command": "node",
  "args": ["./servers/my-custom-server.js"],
  "transportType": "stdio",
  "capabilities": {
    "tools": true
  }
}
```

## Troubleshooting

### Server Not Starting

**Check command path:**

```bash
which mcp-server-filesystem
```

**Verify configuration:**

```bash
claude-code-cli --validate
```

**Check logs:**

```bash
tail -f ~/.claude-code-cli/logs/server-manager.log
```

### Tool Discovery Issues

**List available tools:**

```bash
claude-code-cli --list-tools --server filesystem
```

**Test server manually:**

```bash
mcp-server-filesystem --root ./
```

### Communication Errors

**Check server health:**

```bash
claude-code-cli --check-servers
```

**Enable debug logging:**

```bash
claude-code-cli --debug
```

**Verify transport configuration:**

- For STDIO: Ensure command is executable
- For HTTP: Verify URL and network connectivity

### Performance Issues

**Monitor server resources:**

```bash
ps aux | grep mcp-server
```

**Check response times:**

```bash
claude-code-cli --benchmark-servers
```

**Optimize configuration:**

- Reduce tool scope when possible
- Use local servers for better performance
- Implement caching in custom servers

## Server Management

### Starting and Stopping

Servers are automatically managed by the CLI:

```bash
# Start CLI (starts all configured servers)
claude-code-cli

# Stop all servers
claude-code-cli --stop-servers

# Restart specific server
claude-code-cli --restart-server filesystem
```

### Monitoring

Check server status:

```bash
# List running servers
claude-code-cli --list-servers --status

# Get detailed server info
claude-code-cli --server-info filesystem

# View server logs
claude-code-cli --server-logs git
```

### Updates

Update server versions:

```bash
# Update MCP server packages
npm update -g mcp-server-filesystem mcp-server-git

# Restart servers after update
claude-code-cli --restart-servers
```

## Best Practices

### Configuration Management

1. **Version control server configurations** with your project
2. **Use environment variables** for sensitive data
3. **Document server purposes** and available tools
4. **Test configurations** before deployment
5. **Monitor server health** regularly

### Performance Optimization

1. **Minimize server count** - Use fewer, more capable servers
2. **Optimize tool scope** - Limit tools to what's actually needed
3. **Use local servers** when possible for better latency
4. **Implement caching** in custom servers
5. **Monitor resource usage** and optimize accordingly

### Security

1. **Principle of least privilege** - Grant minimal necessary permissions
2. **Regular security updates** for server dependencies
3. **Audit server logs** for suspicious activity
4. **Isolate sensitive operations** in dedicated servers
5. **Use secure transport** for production deployments
