import { castError } from '../../utils/cast.js';
import { Logger } from '../../utils/logger.js';
import { type ActionStepConfig } from '../../validation/index.js';
import { IContext } from '../context.js';
import { Step, IStep } from '../step.js';

/**
 * ActionStep for context manipulation operations
 */
export class ActionStep extends Step implements IStep {
  private readonly config: ActionStepConfig;

  constructor(logger: Logger, config: ActionStepConfig) {
    super(
      config.id,
      `ActionStep: ${config.operation} ${config.key}`,
      config.nextStepId,
      logger
    );
    this.config = config;
  }

  /**
   * Execute the action step with context manipulation
   */
  public async execute(context: IContext): Promise<string | null> {
    this.logger.info(
      `Executing ActionStep: ${this.config.operation} on key '${
        this.config.key
      }'`
    );

    try {
      switch (this.config.operation) {
        case 'setContext':
          this.setContext(context);
          break;
        case 'updateContext':
          this.updateContext(context);
          break;
        case 'removeContext':
          this.removeContext(context);
          break;
        default: {
          const exhaustiveCheck: never = this.config.operation;
          throw new Error(`Unknown operation: ${String(exhaustiveCheck)}`);
        }
      }

      this.logger.debug(`ActionStep completed successfully`, {
        operation: this.config.operation,
        key: this.config.key,
        value: this.config.value,
      });

      // Use parent's routing logic
      return super.execute(context);
    } catch (error) {
      this.logger.error(`ActionStep failed`, castError(error), {
        operation: this.config.operation,
        key: this.config.key,
      });
      throw error;
    }
  }

  /**
   * Set a context value
   */
  private setContext(context: IContext): void {
    if (!this.config.value) {
      throw new Error('Value is required for setContext operation');
    }
    context.set(this.config.key, this.config.value);
    this.logger.debug(
      `Set context: ${this.config.key} = ${String(this.config.value)}`
    );
  }

  /**
   * Update an existing context value
   */
  private updateContext(context: IContext): void {
    if (!context.has(this.config.key)) {
      throw new Error(
        `Cannot update non-existent context key: ${this.config.key}`
      );
    }
    if (!this.config.value) {
      throw new Error('Value is required for updateContext operation');
    }
    context.set(this.config.key, this.config.value);
    this.logger.debug(
      `Updated context: ${this.config.key} = ${String(this.config.value)}`
    );
  }

  /**
   * Remove a context value
   */
  private removeContext(context: IContext): void {
    if (!context.has(this.config.key)) {
      this.logger.warn(
        `Attempting to remove non-existent context key: ${this.config.key}`
      );
      return;
    }
    context.delete(this.config.key);
    this.logger.debug(`Removed context key: ${this.config.key}`);
  }

  /**
   * Get the step configuration
   */
  public getConfig(): ActionStepConfig {
    return this.config;
  }
}
