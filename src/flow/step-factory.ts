import { injectable, inject } from 'tsyringe';

import { SERVICES } from '../config/tokens.js';
import { Logger } from '../utils/logger.js';
import {
  isRecord,
  validateStringField,
  validateObjectField,
  validateEnumField,
  toString,
} from '../utils/validation.js';

import { Step } from './step.js';
import { ActionStep } from './types/action-step.js';
import { DecisionStep } from './types/decision-step.js';
import { LogStep } from './types/log-step.js';
import {
  StepType,
  type ActionStepConfig,
  type DecisionStepConfig,
  type LogStepConfig,
  type StepConfig,
} from './types/step-type.js';

/**
 * Validation rule for step fields
 */
type ValidationRule = {
  field: string;
  required: boolean;
  type: 'string' | 'enum';
  enumValues?: readonly string[];
  dependsOn?: { field: string; excludeValues: string[] };
};

/**
 * Step type registry for validation and creation
 */
type StepTypeRegistry = {
  [K in StepType]: {
    rules: ValidationRule[];
    factory: (logger: Logger, config: StepConfig) => Step;
  };
};

/**
 * Factory for creating typed step instances
 */
@injectable()
export class StepFactory {
  private readonly registry: StepTypeRegistry;

  constructor(@inject(SERVICES.Logger) private readonly logger: Logger) {
    this.registry = {
      [StepType.ACTION]: {
        rules: [
          {
            field: 'operation',
            required: true,
            type: 'enum',
            enumValues: ['setContext', 'updateContext', 'removeContext'],
          },
          { field: 'key', required: true, type: 'string' },
          {
            field: 'value',
            required: false,
            type: 'string',
            dependsOn: { field: 'operation', excludeValues: ['removeContext'] },
          },
        ],
        factory: (logger, config): Step =>
          new ActionStep(logger, config as ActionStepConfig),
      },
      [StepType.DECISION]: {
        rules: [
          { field: 'condition', required: true, type: 'string' },
          { field: 'contextKey', required: true, type: 'string' },
          { field: 'trueValue', required: true, type: 'string' },
          { field: 'falseValue', required: true, type: 'string' },
        ],
        factory: (logger, config): Step =>
          new DecisionStep(logger, config as DecisionStepConfig),
      },
      [StepType.LOG]: {
        rules: [
          { field: 'message', required: true, type: 'string' },
          {
            field: 'level',
            required: true,
            type: 'enum',
            enumValues: ['info', 'warn', 'error', 'debug'],
          },
        ],
        factory: (logger, config): Step =>
          new LogStep(logger, config as LogStepConfig),
      },
    };
  }

  /**
   * Create a step instance based on step data
   */
  createStep(stepData: unknown): Step {
    const validatedData = this.validateStepStructure(stepData);
    const stepType = this.parseStepType(validatedData.type as string);
    const stepConfig = this.validateStepConfig(validatedData, stepType);

    return this.registry[stepType].factory(this.logger, stepConfig);
  }

  /**
   * Validate basic step structure and return typed data
   */
  private validateStepStructure(data: unknown): Record<string, unknown> {
    if (!isRecord(data)) {
      throw new Error('Invalid step data structure');
    }

    validateStringField(data.id, 'id', 'Step');
    validateObjectField(data.nextStepId, 'nextStepId', 'Step');

    // Validate nextStepId contains string mappings
    const nextStepId = data.nextStepId as Record<string, unknown>;
    for (const [key, value] of Object.entries(nextStepId)) {
      validateStringField(value, `nextStepId.${key}`, 'Step');
    }

    return data;
  }

  /**
   * Parse and validate step type
   */
  private parseStepType(type: string): StepType {
    validateStringField(type, 'type', 'Step');

    const normalizedType = type.toLowerCase();
    const stepType = Object.values(StepType).find(
      t => t.toLowerCase() === normalizedType
    );

    if (!stepType) {
      throw new Error(
        `Invalid step type: ${type}. Valid types: ${Object.values(StepType).join(', ')}`
      );
    }

    return stepType;
  }

  /**
   * Validate step configuration using registry rules
   */
  private validateStepConfig(
    data: Record<string, unknown>,
    stepType: StepType
  ): StepConfig {
    const { rules } = this.registry[stepType];
    const stepId = toString(data.id);

    // Validate all rules
    for (const rule of rules) {
      this.validateRule(data, rule, stepId);
    }

    // Build and return typed config
    return {
      id: stepId,
      type: stepType,
      nextStepId: data.nextStepId as Record<string, string>,
      ...this.extractRuleFields(data, rules),
    } as StepConfig;
  }

  /**
   * Validate a single rule against step data
   */
  private validateRule(
    data: Record<string, unknown>,
    rule: ValidationRule,
    stepId: string
  ): void {
    const { field, required, type, enumValues, dependsOn } = rule;
    const value = data[field];

    // Check if field is conditionally required
    const isRequired =
      required || this.isConditionallyRequired(data, dependsOn);

    // Validate required fields
    if (isRequired && (value === undefined || value === null)) {
      throw new Error(`${stepId} missing required field: ${field}`);
    }

    // Skip validation for optional undefined fields
    if (!isRequired && value === undefined) {
      return;
    }

    // Validate based on type
    if (type === 'string') {
      validateStringField(value, field, stepId);
    } else if (type === 'enum' && enumValues) {
      validateEnumField(value, enumValues, field, stepId);
    }
  }

  /**
   * Check if field is conditionally required based on dependencies
   */
  private isConditionallyRequired(
    data: Record<string, unknown>,
    dependsOn?: ValidationRule['dependsOn']
  ): boolean {
    if (!dependsOn) return false;

    const { field, excludeValues } = dependsOn;
    const fieldValue = data[field];

    return !excludeValues.includes(fieldValue as string);
  }

  /**
   * Extract rule fields from data
   */
  private extractRuleFields(
    data: Record<string, unknown>,
    rules: ValidationRule[]
  ): Record<string, unknown> {
    const fields: Record<string, unknown> = {};

    for (const rule of rules) {
      const value = data[rule.field];
      if (value !== undefined) {
        fields[rule.field] = value;
      }
    }

    return fields;
  }
}
