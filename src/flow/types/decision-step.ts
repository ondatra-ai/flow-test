import { castError } from '../../utils/cast.js';
import { Logger } from '../../utils/logger.js';
import { type DecisionStepConfig } from '../../validation/index.js';
import { IContext } from '../context.js';
import { Step, IStep } from '../step.js';

/**
 * DecisionStep for conditional flow routing
 */
export class DecisionStep extends Step implements IStep {
  private readonly config: DecisionStepConfig;

  constructor(logger: Logger, config: DecisionStepConfig) {
    super(
      config.id,
      `DecisionStep: ${config.condition}`,
      config.nextStepId,
      logger
    );
    this.config = config;
  }

  /**
   * Execute the decision step with conditional logic
   */
  public execute(context: IContext): Promise<string | null> {
    this.logger.info(
      `Executing DecisionStep: evaluating condition '${this.config.condition}'`
    );

    try {
      // Evaluate the condition
      const conditionResult = this.evaluateCondition(context);

      this.logger.debug(`DecisionStep condition evaluated`, {
        condition: this.config.condition,
        result: conditionResult,
        contextKey: this.config.contextKey,
        trueValue: this.config.trueValue,
        falseValue: this.config.falseValue,
      });

      // Determine next step based on condition result
      const nextStepKey = conditionResult ? 'true' : 'false';
      const nextStepId = this.config.nextStepId[nextStepKey];

      if (!nextStepId) {
        throw new Error(
          `No next step defined for condition result: ${String(
            conditionResult
          )}`
        );
      }

      this.logger.debug(`DecisionStep routing to next step`, {
        conditionResult,
        nextStepKey,
        nextStepId,
      });

      return Promise.resolve(nextStepId);
    } catch (error) {
      this.logger.error(`DecisionStep failed`, castError(error), {
        condition: this.config.condition,
      });
      return Promise.reject(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Evaluate the condition against context
   */
  private evaluateCondition(context: IContext): boolean {
    // Get the value from context
    const contextValue = context.get(this.config.contextKey);

    if (contextValue === null || contextValue === undefined) {
      this.logger.warn(
        `Context key '${this.config.contextKey}' not found, treating as false`
      );
      return false;
    }

    // Convert context value to string for comparison
    const stringValue = String(contextValue);

    // Evaluate condition based on the configured logic
    switch (this.config.condition) {
      case 'equals':
        return stringValue === this.config.trueValue;
      case 'not_equals':
        return stringValue !== this.config.trueValue;
      case 'contains':
        return stringValue.includes(this.config.trueValue);
      case 'not_contains':
        return !stringValue.includes(this.config.trueValue);
      case 'empty':
        return stringValue === '';
      case 'not_empty':
        return stringValue !== '';
      default:
        throw new Error(`Unknown condition type: ${this.config.condition}`);
    }
  }

  /**
   * Get the step configuration
   */
  public getConfig(): DecisionStepConfig {
    return this.config;
  }
}
