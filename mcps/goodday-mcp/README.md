# Goodday MCP Server Docker Setup

This directory contains the Docker configuration for the Goodday MCP Server.

## Prerequisites

- Docker and Docker Compose installed
- A Goodday API token

## Getting Your Goodday API Token

1. Go to your Goodday organization
2. Navigate to Settings → API
3. Click the generate button to create a new token
4. Copy the token for use in the environment configuration

## Environment Configuration

Create a `.env` file in the project root (next to `docker-compose.mcps.yml`) with the following content:

```bash
# Goodday MCP Server Configuration
GOODDAY_API_TOKEN=your_goodday_api_token_here
```

## Running the Server

From the project root, run:

```bash
docker compose -f docker-compose.mcps.yml up goodday-mcp
```

Or to run all MCP servers:

```bash
docker compose -f docker-compose.mcps.yml up
```

## Server Details

- **Image**: Built from Python 3.11 slim
- **Package**: Installed from PyPI (`goodday-mcp`)
- **Port**: 8000 (exposed for debugging, MCP uses stdio)
- **Health Check**: Validates the server can import the goodday_mcp module

## Logs and Debugging

View logs:

```bash
docker compose logs goodday-mcp
```

Follow logs:

```bash
docker compose logs -f goodday-mcp
```

## Available Tools

The Goodday MCP server provides tools for:

- **Project Management**: get_projects, get_project, create_project
- **Task Management**: get_project_tasks, create_task, update_task_status
- **User Management**: get_users, get_user
- **Comments**: add_task_comment

See the [Goodday MCP repository](https://github.com/cdmx-in/goodday-mcp) for detailed API documentation.
