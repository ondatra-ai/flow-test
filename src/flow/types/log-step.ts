import { castError } from '../../utils/cast.js';
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
   * Execute the log step - simply output the config message
   */
  public async execute(context: IContext): Promise<string | null> {
    this.logger.info(`Executing LogStep: ${this.config.message}`);

    try {
      // Simply output the config message at the specified level
      switch (this.config.level) {
        case 'error':
          this.logger.error(
            this.config.message,
            new Error(this.config.message)
          );
          break;
        case 'warn':
          this.logger.warn(this.config.message);
          break;
        case 'info':
          this.logger.info(this.config.message);
          break;
        case 'debug':
          this.logger.debug(this.config.message);
          break;
        default: {
          const exhaustiveCheck: never = this.config.level;
          throw new Error(`Unknown log level: ${exhaustiveCheck as string}`);
        }
      }

      // Use parent's routing logic
      return super.execute(context);
    } catch (error) {
      this.logger.error(`LogStep failed`, castError(error), {
        message: this.config.message,
        level: this.config.level,
      });
      throw error;
    }
  }

  /**
   * Get the step configuration
   */
  public getConfig(): LogStepConfig {
    return this.config;
  }
}
