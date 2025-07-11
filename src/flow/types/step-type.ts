/**
 * Enum for different step types in the flow system
 */
export enum StepType {
  ACTION = 'action',
  DECISION = 'decision',
  LOG = 'log',
}

/**
 * Base configuration type for typed steps
 */
export type StepConfigBase = {
  id: string;
  type: StepType;
  nextStepId: Record<string, string>;
};

/**
 * Configuration type for ActionStep
 */
export type ActionStepConfig = StepConfigBase & {
  type: StepType.ACTION;
  operation: 'setContext' | 'removeContext' | 'updateContext';
  key: string;
  value?: string;
};

/**
 * Configuration type for DecisionStep
 */
export type DecisionStepConfig = StepConfigBase & {
  type: StepType.DECISION;
  condition: string;
  contextKey: string;
  trueValue: string;
  falseValue: string;
};

/**
 * Configuration type for LogStep
 */
export type LogStepConfig = StepConfigBase & {
  type: StepType.LOG;
  message: string;
  level: 'error' | 'warn' | 'info' | 'debug';
};

/**
 * Union type for all step configurations
 */
export type StepConfig = ActionStepConfig | DecisionStepConfig | LogStepConfig;
