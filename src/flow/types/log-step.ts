import { Logger } from '../../utils/logger.js';
import { IContext } from '../context.js';
import { Step, IStep } from '../step.js';

import { LogStepConfig } from './step-type.js';

/**
 * LogStep for logging with context interpolation
 */
export class LogStep extends Step implements IStep {
  private readonly config: LogStepConfig;

  constructor(logger: Logger, config: LogStepConfig) {
    super(config.id, `LogStep: ${config.message}`, config.nextStepId, logger);
    this.config = config;
  }

  /**
   * Execute the log step with context interpolation
   */
  public async execute(context: IContext): Promise<string | null> {
    try {
      const interpolatedMessage = this.interpolateMessage(context);

      // Log the message at the specified level
      this.logMessage(interpolatedMessage);

      this.logger.debug(`LogStep completed successfully`, {
        originalMessage: this.config.message,
        interpolatedMessage,
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
   * Interpolate context variables in the message
   * Supports {{context.key}} syntax
   */
  private interpolateMessage(context: IContext): string {
    const contextVariableRegex = /\{\{context\.(\w+)\}\}/g;

    return this.config.message.replace(
      contextVariableRegex,
      (_fullMatch, contextKey: string) => {
        const contextValue = context.get(contextKey);
        if (contextValue !== undefined) {
          this.logger.debug(
            `Interpolated context variable: ${contextKey} = ${contextValue}`
          );
          return contextValue;
        } else {
          this.logger.warn(`Context variable not found: ${contextKey}`);
          return `{{UNDEFINED:${contextKey}}}`;
        }
      }
    );
  }

  /**
   * Log the message at the specified level
   */
  private logMessage(message: string): void {
    switch (this.config.level) {
      case 'error':
        this.logger.error(message);
        break;
      case 'warn':
        this.logger.warn(message);
        break;
      case 'info':
        this.logger.info(message);
        break;
      case 'debug':
        this.logger.debug(message);
        break;
      default:
        this.logger.info(message); // Default to info level
        break;
    }
  }

  /**
   * Get the step configuration
   */
  public getConfig(): LogStepConfig {
    return this.config;
  }

  /**
   * Get the interpolated message without executing the step
   * Useful for testing and debugging
   */
  public getInterpolatedMessage(context: IContext): string {
    return this.interpolateMessage(context);
  }
}
