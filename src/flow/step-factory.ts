import { injectable, inject } from 'tsyringe';

import { SERVICES } from '../config/tokens.js';
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
  createStep(stepData: unknown): Step {
    // Validate basic structure
    if (!this.isValidStepStructure(stepData)) {
      throw new Error('Invalid step data structure');
    }

    const validatedData = stepData;
    const stepType = (validatedData.type as string)?.toUpperCase();

    switch (stepType) {
      case StepType.ACTION.toUpperCase(): {
        const actionConfig = this.validateActionStep(validatedData);
        return new ActionStep(this.logger, actionConfig);
      }

      case StepType.DECISION.toUpperCase(): {
        const decisionConfig = this.validateDecisionStep(validatedData);
        return new DecisionStep(this.logger, decisionConfig);
      }

      case StepType.LOG.toUpperCase(): {
        const logConfig = this.validateLogStep(validatedData);
        return new LogStep(this.logger, logConfig);
      }

      default: {
        // No backward compatibility - all steps must have a type
        throw new Error(
          `Invalid or missing step type: ${String(
            validatedData.type
          )}. Steps must have a type of: ${Object.values(StepType).join(', ')}`
        );
      }
    }
  }

  /**
   * Type guard to check if data has basic step structure
   */
  private isValidStepStructure(data: unknown): data is Record<string, unknown> {
    return (
      typeof data === 'object' &&
      data !== null &&
      'id' in data &&
      typeof (data as Record<string, unknown>).id === 'string' &&
      'nextStepId' in data &&
      typeof (data as Record<string, unknown>).nextStepId === 'object'
    );
  }

  /**
   * Validate and type action step configuration
   */
  private validateActionStep(data: Record<string, unknown>): ActionStepConfig {
    const { id, nextStepId, operation, key, value } = data;

    if (!operation || typeof operation !== 'string') {
      throw new Error(
        `ActionStep ${String(id)} missing required field: operation`
      );
    }

    if (!key || typeof key !== 'string') {
      throw new Error(`ActionStep ${String(id)} missing required field: key`);
    }

    const validOperations = ['setContext', 'updateContext', 'removeContext'];
    if (!validOperations.includes(operation)) {
      throw new Error(
        `ActionStep ${String(id)} has invalid operation: ${operation}`
      );
    }

    if (operation !== 'removeContext' && value === undefined) {
      throw new Error(
        `ActionStep ${String(id)} with operation ${operation} ` +
          `missing required field: value`
      );
    }

    return {
      id: id as string,
      type: StepType.ACTION,
      nextStepId: nextStepId as Record<string, string>,
      operation: operation as 'setContext' | 'updateContext' | 'removeContext',
      key: key,
      value: value as string | undefined,
    };
  }

  /**
   * Validate and type decision step configuration
   */
  private validateDecisionStep(
    data: Record<string, unknown>
  ): DecisionStepConfig {
    const { id, nextStepId, condition, contextKey, trueValue, falseValue } =
      data;

    if (!condition || typeof condition !== 'string') {
      throw new Error(
        `DecisionStep ${String(id)} missing required field: condition`
      );
    }

    if (!contextKey || typeof contextKey !== 'string') {
      throw new Error(
        `DecisionStep ${String(id)} missing required field: contextKey`
      );
    }

    if (trueValue === undefined || typeof trueValue !== 'string') {
      throw new Error(
        `DecisionStep ${String(id)} missing required field: trueValue`
      );
    }

    if (falseValue === undefined || typeof falseValue !== 'string') {
      throw new Error(
        `DecisionStep ${String(id)} missing required field: falseValue`
      );
    }

    return {
      id: id as string,
      type: StepType.DECISION,
      nextStepId: nextStepId as Record<string, string>,
      condition,
      contextKey,
      trueValue,
      falseValue,
    };
  }

  /**
   * Validate and type log step configuration
   */
  private validateLogStep(data: Record<string, unknown>): LogStepConfig {
    const { id, nextStepId, message, level } = data;

    if (!message || typeof message !== 'string') {
      throw new Error(`LogStep ${String(id)} missing required field: message`);
    }

    if (!level || typeof level !== 'string') {
      throw new Error(`LogStep ${String(id)} missing required field: level`);
    }

    const validLevels = ['info', 'warn', 'error', 'debug'];
    if (!validLevels.includes(level)) {
      throw new Error(`LogStep ${String(id)} has invalid log level: ${level}`);
    }

    return {
      id: id as string,
      type: StepType.LOG,
      nextStepId: nextStepId as Record<string, string>,
      message,
      level: level as 'error' | 'warn' | 'info' | 'debug',
    };
  }
}
