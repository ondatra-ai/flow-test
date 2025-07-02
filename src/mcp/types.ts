/**
 * MCP server configuration
 */
export interface McpServerConfig {
  readonly name: string;
  readonly command: string;
  readonly args: readonly string[];
  readonly env?: Record<string, string>;
  readonly workingDirectory?: string;
}

/**
 * MCP tool definition
 */
export interface McpTool {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: Record<string, unknown>;
}

/**
 * MCP server status
 */
export enum ServerStatus {
  STOPPED = 'stopped',
  STARTING = 'starting',
  RUNNING = 'running',
  ERROR = 'error',
}

/**
 * MCP server instance
 */
export interface McpServerInstance {
  readonly config: McpServerConfig;
  readonly status: ServerStatus;
  readonly tools: readonly McpTool[];
  readonly lastError?: Error;
}

/**
 * Tool execution request
 */
export interface ToolExecutionRequest {
  readonly toolName: string;
  readonly parameters: Record<string, unknown>;
  readonly serverName: string;
}

/**
 * Tool execution result
 */
export interface ToolExecutionResult {
  readonly success: boolean;
  readonly result?: unknown;
  readonly error?: Error;
}
