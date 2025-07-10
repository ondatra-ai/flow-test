import { Logger } from '../../utils/logger.js';
import { IContext } from '../context.js';
import { Step, IStep } from '../step.js';

import { DecisionStepConfig } from './step-type.js';

/**
 * DecisionStep for condition evaluation and context-based routing
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
   * Execute the decision step with condition evaluation
   */
  public async execute(context: IContext): Promise<string | null> {
    this.logger.info(
      `Executing DecisionStep with condition: ${this.config.condition}`
    );

    try {
      const conditionResult = this.evaluateCondition(context);
      const contextValue = conditionResult
        ? this.config.trueValue
        : this.config.falseValue;

      // Set the context value based on condition result
      context.set(this.config.contextKey, contextValue);

      this.logger.info(`Decision result: ${conditionResult}`, {
        condition: this.config.condition,
        contextKey: this.config.contextKey,
        contextValue,
      });

      // Use parent's routing logic
      // (which will use the context value we just set)
      return super.execute(context);
    } catch (error) {
      this.logger.error(`DecisionStep failed`, {
        condition: this.config.condition,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Evaluate the condition string against the context
   */
  private evaluateCondition(context: IContext): boolean {
    try {
      const condition = this.config.condition.trim();
      const contextKey = this.extractContextKey(condition);
      const contextValue = context.get(contextKey) || '';

      if (condition.includes('===')) {
        return this.evaluateEquality(condition, contextValue);
      }

      if (condition.includes('!==')) {
        return this.evaluateInequality(condition, contextValue);
      }

      if (condition.includes('exists')) {
        return this.evaluateExistence(context, contextKey);
      }

      throw new Error(`Unsupported condition format: ${condition}`);
    } catch (error) {
      this.logger.error(`Condition evaluation failed`, {
        condition: this.config.condition,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(`Failed to evaluate condition: ${this.config.condition}`);
    }
  }

  /**
   * Extract context key from condition
   */
  private extractContextKey(condition: string): string {
    const contextKeyMatch = condition.match(/context\.(\w+)/);
    if (!contextKeyMatch) {
      throw new Error(
        'Condition must reference a context key using context.keyName format'
      );
    }
    return contextKeyMatch[1];
  }

  /**
   * Evaluate equality comparison
   */
  private evaluateEquality(condition: string, contextValue: string): boolean {
    const valueMatch =
      condition.match(/===\s*['"](.*?)['"]/) || condition.match(/===\s*(\w+)/);
    if (!valueMatch) {
      throw new Error('Invalid condition format for === comparison');
    }
    const expectedValue = valueMatch[1];
    const result = contextValue === expectedValue;
    this.logger.debug(
      `Condition evaluation: '${contextValue}' === ` +
        `'${expectedValue}' = ${result}`
    );
    return result;
  }

  /**
   * Evaluate inequality comparison
   */
  private evaluateInequality(condition: string, contextValue: string): boolean {
    const valueMatch =
      condition.match(/!==\s*['"](.*?)['"]/) || condition.match(/!==\s*(\w+)/);
    if (!valueMatch) {
      throw new Error('Invalid condition format for !== comparison');
    }
    const expectedValue = valueMatch[1];
    const result = contextValue !== expectedValue;
    this.logger.debug(
      `Condition evaluation: '${contextValue}' !== ` +
        `'${expectedValue}' = ${result}`
    );
    return result;
  }

  /**
   * Evaluate existence check
   */
  private evaluateExistence(context: IContext, contextKey: string): boolean {
    const result = context.has(contextKey);
    this.logger.debug(
      `Condition evaluation: context.${contextKey} exists = ${result}`
    );
    return result;
  }

  /**
   * Get the step configuration
   */
  public getConfig(): DecisionStepConfig {
    return this.config;
  }
}
