/**
 * Flow step types
 */
export enum StepType {
  PROMPT = 'prompt',
  CONDITION = 'condition',
}

/**
 * Base step interface
 */
export interface BaseStep {
  readonly type: StepType;
}

/**
 * Prompt step configuration
 */
export interface PromptStep extends BaseStep {
  readonly type: StepType.PROMPT;
  readonly prompt: string;
  readonly tools: readonly string[];
  readonly mcpServer: string;
  readonly nextStep: string;
  readonly timeout?: number;
  readonly onError?: string;
}

/**
 * Condition step configuration
 */
export interface ConditionStep extends BaseStep {
  readonly type: StepType.CONDITION;
  readonly condition: string;
  readonly yes: string;
  readonly no: string;
}

/**
 * Union type for all step types
 */
export type Step = PromptStep | ConditionStep;

/**
 * Flow definition structure
 */
export interface FlowDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly initialStep: string;
  readonly steps: Record<string, Step>;
}

/**
 * Flow execution context
 */
export interface FlowContext {
  readonly variables: Record<string, unknown>;
  readonly currentStep: string;
  readonly flowId: string;
}

/**
 * Flow execution result
 */
export interface FlowResult {
  readonly success: boolean;
  readonly message?: string;
  readonly error?: Error;
  readonly context: FlowContext;
}
