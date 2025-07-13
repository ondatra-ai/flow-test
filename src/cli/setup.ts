import type { Command } from 'commander';

/**
 * Set up the CLI program with basic configuration
 */
export function setupCliProgram(program: Command): void {
  program
    .name('ondatra-code')
    .description(
      'Ondatra Code - An interactive conversational interface ' +
        'similar to claude-code'
    )
    .version('1.0.0');
}

/**
 * Register all CLI commands with their handlers
 */
export function registerCommands(program: Command): void {
  program
    .command('chat')
    .description('Start the chat interface')
    .action(async () => {
      const { handleChatCommand } = await import('./handlers.js');
      handleChatCommand();
    });

  program
    .command('flow:run')
    .description('Execute a flow by name')
    .argument('<flowName>', 'Name of the flow to execute')
    .argument('[parameters...]', 'Additional parameters to pass to the flow')
    .option('--github-issue <url>', 'GitHub issue URL to process')
    .action(
      async (
        flowName: string,
        parameters: string[],
        options: { githubIssue?: string }
      ) => {
        const { handleFlowRunCommand } = await import('./handlers.js');
        await handleFlowRunCommand(flowName, parameters, options);
      }
    );

  program.action(async () => {
    const { handleDefaultAction } = await import('./handlers.js');
    handleDefaultAction();
  });
}
