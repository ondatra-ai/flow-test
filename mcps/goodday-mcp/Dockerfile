# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies if needed
RUN apt-get update && \
    rm -rf /var/lib/apt/lists/*

# Upgrade pip and install goodday-mcp from PyPI
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir goodday-mcp

# Create a non-root user for security
RUN useradd -m -u 1001 mcpuser && \
    chown -R mcpuser:mcpuser /app

# Switch to non-root user
USER mcpuser

# Set environment variables (these can be overridden in docker-compose.yml)
ENV GOODDAY_API_TOKEN=""

# Expose port (MCP servers typically use stdio, but we might need this for debugging)
EXPOSE 8000

# Health check to ensure the server is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import goodday_mcp.main; print('MCP server is available')" || exit 1

# Run the goodday-mcp server using the correct function
CMD ["python", "-c", "from goodday_mcp.main import run_cli; run_cli()"] 