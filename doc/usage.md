# Usage Guide

## Getting Started

### Basic Usage

Run the CLI in any directory that contains a `.flows` configuration:

```bash
claude-code-cli
```

The CLI will:
1. Load configuration from `.flows/` directory
2. Start configured MCP servers
3. Present an interactive chat interface
4. Execute flows based on your input

### Chat Interface

The CLI provides a chat-based interface similar to claude-code:

```
╭─ Claude Code CLI ─────────────────────────────────╮
│                                                   │
│ 🤖 Assistant: Hello! How can I help you today?   │
│                                                   │
│ 👤 You: Create a new React component              │
│                                                   │
│ 🤖 Assistant: I'll help you create a React       │
│    component. What would you like to call it?    │
│                                                   │
│ 👤 You: ▊                                        │
│                                                   │
╰───────────────────────────────────────────────────╯
```

### Command Line Options

```bash
# Show version
claude-code-cli --version

# Enable debug mode
claude-code-cli --debug

# Use specific configuration directory
claude-code-cli --config-dir /path/to/.flows

# List available flows
claude-code-cli --list-flows

# Run specific flow
claude-code-cli --flow hello-world

# Check configuration
claude-code-cli --validate
```

## Working with Flows

### Automatic Flow Selection

The CLI automatically selects appropriate flows based on your input:

```
👤 You: I need to create a new API endpoint
🤖 Assistant: [Executing 'api-creation' flow...]
```

### Manual Flow Execution

You can explicitly request a specific flow:

```
👤 You: Run the component-generator flow
🤖 Assistant: [Starting 'component-generator' flow...]
```

### Flow Context

Each flow maintains context throughout execution:

```
👤 You: Create a user profile component
🤖 Assistant: I'll create a user profile component. What props should it accept?

👤 You: name, email, and avatar URL
🤖 Assistant: Perfect! I'll create a component with those props...
[Creates UserProfile.tsx with the specified props]
```

## Working with Tools

### Available Tools

Tools are provided by MCP servers and vary based on your configuration. Common tools include:

**File Operations**
- `list_files` - List files in directory
- `read_file` - Read file contents
- `write_file` - Create or update files
- `delete_file` - Remove files

**Git Operations**
- `git_status` - Check repository status
- `git_add` - Stage files
- `git_commit` - Create commits
- `git_push` - Push changes

**Search Operations**
- `grep_search` - Search text in files
- `find_files` - Find files by pattern
- `semantic_search` - AI-powered code search

### Tool Execution

The AI assistant will use tools automatically based on your requests:

```
👤 You: Show me all TypeScript files in this project

🤖 Assistant: I'll search for TypeScript files in the project.
[Using list_files tool...]

Found the following TypeScript files:
- src/index.ts
- src/cli/chat.ts
- src/flows/flow-executor.ts
...
```

### Tool Confirmation

For destructive operations, you'll be asked for confirmation:

```
🤖 Assistant: I'm about to delete the following files:
- old-component.tsx
- unused-utils.ts

Do you want to proceed? (y/N)
```

## Advanced Features

### Context Variables

Flows can use context variables for dynamic behavior:

- `{{response}}` - Last AI response
- `{{user_input}}` - Last user input  
- `{{step_data}}` - Data from previous steps
- `{{flow_vars}}` - Flow-level variables

### Conditional Logic

Flows support branching based on conditions:

```json
{
  "type": "condition",
  "condition": "response.includes('React')",
  "yes": "react-component-step",
  "no": "generic-component-step"
}
```

### Multi-Server Workflows

Complex workflows can use multiple MCP servers:

```
👤 You: Create a component and add it to git

🤖 Assistant: I'll create the component using the filesystem server,
then stage it using the git server.

[Using filesystem server to create component...]
[Using git server to stage changes...]
```

## Configuration Management

### Validating Configuration

Check your configuration for errors:

```bash
claude-code-cli --validate
```

Output:
```
✅ Configuration valid
✅ All flows validated
✅ All MCP servers accessible
⚠️  Warning: Tool 'custom_tool' referenced in flow but not available
```

### Listing Available Resources

See what's available in your configuration:

```bash
# List all flows
claude-code-cli --list-flows

# List MCP servers
claude-code-cli --list-servers

# List available tools
claude-code-cli --list-tools
```

### Configuration Hot Reload

The CLI watches for configuration changes and reloads automatically:

```
🔄 Configuration updated - reloading flows...
✅ New flows loaded successfully
```

## Best Practices

### Effective Prompting

**Clear and Specific**
```
✅ Good: "Create a React functional component called UserCard that displays name, email, and avatar"
❌ Poor: "Make a component"
```

**Provide Context**
```
✅ Good: "Add error handling to the login function in auth.ts"
❌ Poor: "Fix the error"
```

**Break Down Complex Tasks**
```
✅ Good: 
1. "Create a user model interface"
2. "Create a user service class"
3. "Add user CRUD operations"

❌ Poor: "Build a complete user management system"
```

### Flow Design

**Keep Steps Focused**
- Each step should have a single, clear purpose
- Use descriptive step IDs and prompts
- Limit tools to what's actually needed

**Use Conditions Wisely**
- Test condition logic thoroughly
- Use clear, readable condition expressions
- Provide fallback paths for edge cases

**Handle Errors Gracefully**
- Include error handling in flow design
- Provide clear error messages
- Allow recovery and retry options

### Security Considerations

**File Operations**
- Always validate file paths
- Be cautious with file deletion
- Review generated code before execution

**API Usage**
- Monitor API costs and usage
- Set appropriate rate limits
- Never commit API keys to version control

## Troubleshooting

### Common Issues

**Flow Not Starting**
- Check flow JSON syntax
- Verify step ID references
- Ensure MCP server is running

**Tool Not Available**
- Verify MCP server configuration
- Check server logs for errors
- Confirm tool names match server capabilities

**AI Not Responding**
- Check API key configuration
- Verify network connectivity
- Review rate limiting settings

### Debug Mode

Enable detailed logging:

```bash
claude-code-cli --debug
```

This provides detailed information about:
- Configuration loading
- MCP server communication
- Flow execution steps
- AI API calls
- Tool execution

### Log Files

Check log files for detailed error information:

```bash
# View latest logs
tail -f ~/.claude-code-cli/logs/claude-cli.log

# Search for errors
grep "ERROR" ~/.claude-code-cli/logs/claude-cli.log
```

## Tips and Tricks

### Keyboard Shortcuts

- `Ctrl+C` - Exit the CLI
- `Ctrl+L` - Clear chat history
- `↑/↓` - Navigate input history
- `Tab` - Auto-complete (when available)

### Productivity Tips

1. **Create project-specific flows** for common tasks
2. **Use descriptive flow names** for easy identification
3. **Chain related operations** in single flows
4. **Save complex prompts** as reusable flows
5. **Test flows thoroughly** before sharing with team

### Integration with IDEs

The CLI works great alongside your favorite IDE:
- Keep the CLI running in a terminal
- Use it for complex refactoring tasks
- Generate boilerplate code quickly
- Automate repetitive development tasks 