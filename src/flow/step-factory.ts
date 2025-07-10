import { injectable, inject } from 'tsyringe';

import { SERVICES } from '../config/tokens.js';
import type { StepData } from '../utils/flow-manager.js';
import { Logger } from '../utils/logger.js';

import { Step } from './step.js';
import { ActionStep } from './types/action-step.js';
import { DecisionStep } from './types/decision-step.js';
import { LogStep } from './types/log-step.js';
import {
  StepType,
  type ActionStepConfig,
  type DecisionStepConfig,
  type LogStepConfig,
} from './types/step-type.js';

/**
 * Factory for creating typed step instances
 */
@injectable()
export class StepFactory {
  constructor(@inject(SERVICES.Logger) private readonly logger: Logger) {}

  /**
   * Create a step instance based on step data
   */
  createStep(stepData: StepData): Step {
    const stepType = stepData.type?.toUpperCase();

    switch (stepType) {
      case StepType.ACTION:
        this.validateActionStep(stepData);
        return new ActionStep(this.logger, stepData as ActionStepConfig);

      case StepType.DECISION:
        this.validateDecisionStep(stepData);
        return new DecisionStep(this.logger, stepData as DecisionStepConfig);

      case StepType.LOG:
        this.validateLogStep(stepData);
        return new LogStep(this.logger, stepData as LogStepConfig);

      default:
        // Return basic Step for backward compatibility
        return new Step(
          stepData.id,
          stepData.message || `Step ${stepData.id}`,
          stepData.nextStepId || {},
          this.logger
        );
    }
  }

  /**
   * Validate action step configuration
   */
  private validateActionStep(stepData: StepData): void {
    if (!stepData.operation) {
      throw new Error(
        `ActionStep ${stepData.id} missing required field: operation`
      );
    }

    if (!stepData.key) {
      throw new Error(`ActionStep ${stepData.id} missing required field: key`);
    }

    const validOperations = ['setContext', 'updateContext', 'removeContext'];
    if (!validOperations.includes(stepData.operation as string)) {
      throw new Error(
        `ActionStep ${stepData.id} has invalid operation: ${
          stepData.operation as string
        }`
      );
    }

    if (
      stepData.operation !== 'removeContext' &&
      stepData.value === undefined
    ) {
      throw new Error(
        `ActionStep ${stepData.id} with operation ${
          stepData.operation as string
        } missing required field: value`
      );
    }
  }

  /**
   * Validate decision step configuration
   */
  private validateDecisionStep(stepData: StepData): void {
    if (!stepData.condition) {
      throw new Error(
        `DecisionStep ${stepData.id} missing required field: condition`
      );
    }

    if (!stepData.contextKey) {
      throw new Error(
        `DecisionStep ${stepData.id} missing required field: contextKey`
      );
    }

    if (stepData.trueValue === undefined) {
      throw new Error(
        `DecisionStep ${stepData.id} missing required field: trueValue`
      );
    }

    if (stepData.falseValue === undefined) {
      throw new Error(
        `DecisionStep ${stepData.id} missing required field: falseValue`
      );
    }
  }

  /**
   * Validate log step configuration
   */
  private validateLogStep(stepData: StepData): void {
    if (!stepData.message) {
      throw new Error(`LogStep ${stepData.id} missing required field: message`);
    }

    if (!stepData.level) {
      throw new Error(`LogStep ${stepData.id} missing required field: level`);
    }

    const validLevels = ['info', 'warn', 'error', 'debug'];
    if (!validLevels.includes(stepData.level as string)) {
      throw new Error(
        `LogStep ${stepData.id} has invalid log level: ${
          stepData.level as string
        }`
      );
    }
  }
}
