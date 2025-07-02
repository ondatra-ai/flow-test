import { FlowExecutionError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

import {
  StepType,
  type FlowDefinition,
  type FlowContext,
  type FlowResult,
  type Step,
  type PromptStep,
  type ConditionStep,
} from './types.js';

/**
 * Flow executor class responsible for running flows
 */
export class FlowExecutor {
  private readonly flowDefinition: FlowDefinition;
  private context: FlowContext;

  constructor(
    flowDefinition: FlowDefinition,
    initialContext?: Partial<FlowContext>
  ) {
    this.flowDefinition = flowDefinition;
    this.context = {
      variables: {},
      currentStep: flowDefinition.initialStep,
      flowId: flowDefinition.id,
      ...initialContext,
    };
  }

  /**
   * Execute the flow starting from the current step
   */
  public async execute(): Promise<FlowResult> {
    try {
      while (this.context.currentStep) {
        const step = this.getStep(this.context.currentStep);
        const nextStep = await this.executeStep(step);

        if (!nextStep) {
          break;
        }

        this.context = {
          ...this.context,
          currentStep: nextStep,
        };
      }

      return {
        success: true,
        context: this.context,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        context: this.context,
      };
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(step: Step): Promise<string | null> {
    switch (step.type) {
      case StepType.PROMPT:
        return this.executePromptStep(step);
      case StepType.CONDITION:
        return this.executeConditionStep(step);
      default:
        throw new FlowExecutionError(
          `Unknown step type: ${(step as Step).type}`
        );
    }
  }

  /**
   * Execute a prompt step with timeout support
   */
  private async executePromptStep(step: PromptStep): Promise<string> {
    try {
      if (step.timeout) {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(
              new FlowExecutionError(
                `Prompt step timed out after ${step.timeout}ms`,
                { stepId: this.context.currentStep, timeout: step.timeout }
              )
            );
          }, step.timeout);
        });

        const executionPromise = this.performPromptExecution(step);

        await Promise.race([executionPromise, timeoutPromise]);
      } else {
        await this.performPromptExecution(step);
      }

      return step.nextStep;
    } catch (error) {
      if (step.onError) {
        // Log the error but continue to the error step
        logger.warn(
          `Error in prompt step ${this.context.currentStep}:`,
          error instanceof Error
            ? { message: error.message, stack: error.stack }
            : { error: String(error) }
        );
        return step.onError;
      }

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new FlowExecutionError(
        `Failed to execute prompt step: ${errorMessage}`,
        { stepId: this.context.currentStep },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Perform the actual prompt execution (placeholder for MCP integration)
   */
  private async performPromptExecution(step: PromptStep): Promise<void> {
    // TODO: Integrate with MCP server to execute the prompt
    // This is a placeholder implementation
    logger.debug(`Executing prompt: ${step.prompt}`);
    logger.debug(`Using tools: ${step.tools.join(', ')}`);
    logger.debug(`MCP Server: ${step.mcpServer}`);

    // Simulate async execution
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  /**
   * Execute a condition step
   */
  private executeConditionStep(step: ConditionStep): string {
    try {
      // TODO: Implement proper condition evaluation with context variables
      // This is a placeholder implementation
      const result = this.evaluateCondition(step.condition);
      return result ? step.yes : step.no;
    } catch (error) {
      throw new FlowExecutionError(
        `Failed to evaluate condition: ${step.condition}`,
        { stepId: this.context.currentStep, condition: step.condition },
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Evaluate a condition expression (placeholder implementation)
   */
  private evaluateCondition(condition: string): boolean {
    // TODO: Implement safe condition evaluation
    // This is a placeholder that returns true for demo purposes
    logger.debug(`Evaluating condition: ${condition}`);
    return true;
  }

  /**
   * Get a step by ID
   */
  private getStep(stepId: string): Step {
    const step = this.flowDefinition.steps[stepId];
    if (!step) {
      throw new FlowExecutionError(`Step not found: ${stepId}`, {
        stepId,
        availableSteps: Object.keys(this.flowDefinition.steps),
      });
    }
    return step;
  }

  /**
   * Get current context
   */
  public getContext(): FlowContext {
    return { ...this.context };
  }

  /**
   * Update context variables
   */
  public updateContext(variables: Record<string, unknown>): void {
    this.context = {
      ...this.context,
      variables: { ...this.context.variables, ...variables },
    };
  }
}
