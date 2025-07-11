import { Logger } from '../../utils/logger.js';
import { type LogStepConfig } from '../../validation/index.js';
import { IContext } from '../context.js';
import { Step, IStep } from '../step.js';

/**
 * LogStep for logging operations
 */
export class LogStep extends Step implements IStep {
  private readonly config: LogStepConfig;

  constructor(logger: Logger, config: LogStepConfig) {
    super(config.id, `LogStep: ${config.message}`, config.nextStepId, logger);
    this.config = config;
  }

  /**
   * Execute the log step with custom logging
   */
  public async execute(context: IContext): Promise<string | null> {
    this.logger.info(`Executing LogStep: ${this.config.message}`);

    try {
      // Log the message at the specified level
      this.logAtLevel(this.config.message, context);

      this.logger.debug(`LogStep completed successfully`, {
        message: this.config.message,
        level: this.config.level,
      });

      // Use parent's routing logic
      return super.execute(context);
    } catch (error) {
      this.logger.error(`LogStep failed`, {
        message: this.config.message,
        level: this.config.level,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Log message at the specified level
   */
  private logAtLevel(message: string, context: IContext): void {
    // Replace context placeholders in the message
    const resolvedMessage = this.resolveContextPlaceholders(message, context);

    // Log at the specified level
    switch (this.config.level) {
      case 'error':
        this.logger.error(resolvedMessage);
        break;
      case 'warn':
        this.logger.warn(resolvedMessage);
        break;
      case 'info':
        this.logger.info(resolvedMessage);
        break;
      case 'debug':
        this.logger.debug(resolvedMessage);
        break;
      default: {
        const exhaustiveCheck: never = this.config.level;
        throw new Error(`Unknown log level: ${exhaustiveCheck as string}`);
      }
    }
  }

  /**
   * Resolve context placeholders in the message
   */
  private resolveContextPlaceholders(
    message: string,
    context: IContext
  ): string {
    // Replace placeholders in the format ${contextKey} with actual values
    return message.replace(/\$\{([^}]+)\}/g, (match, key): string => {
      const value: string | undefined = context.get(key);
      if (value === null || value === undefined) {
        return match;
      }
      // Convert value to string safely
      if (typeof value === 'string') {
        return value;
      }
      if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
      }
      return match; // For unknown types, return the original match
    });
  }

  /**
   * Get the step configuration
   */
  public getConfig(): LogStepConfig {
    return this.config;
  }
}
