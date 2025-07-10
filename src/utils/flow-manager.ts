import { promises as fs } from 'fs';
import path from 'path';

import { injectable, inject } from 'tsyringe';

import { SERVICES } from '../config/tokens.js';
import { Flow, type IFlow } from '../flow/flow.js';
import { StepFactory } from '../flow/step-factory.js';
import { Step } from '../flow/step.js';

import { Logger } from './logger.js';
import { ValidationUtils } from './validation.js';

/**
 * Type for flow data structure from JSON
 */
export type FlowData = {
  id: string;
  name?: string;
  description?: string;
  steps: unknown[];
};

/**
 * Validation utility class for flow data
 */
class FlowValidator {
  /**
   * Validate and convert flow data structure
   */
  static validateFlow(data: unknown): FlowData {
    // Step 1: Validate basic structure
    const flowData = this.validateBasicStructure(data);

    // Step 2: Validate steps and references
    const stepIds = this.validateSteps(flowData.steps);
    this.validateStepReferences(flowData.steps, stepIds);

    return flowData;
  }

  /**
   * Validate basic flow structure
   */
  private static validateBasicStructure(data: unknown): FlowData {
    if (!ValidationUtils.isRecord(data)) {
      throw new Error('Invalid flow structure: data must be an object');
    }

    const { id, name, description, steps } = data;

    const validId = ValidationUtils.validateStringField(id, 'id', 'Flow');

    if (!Array.isArray(steps)) {
      throw new Error('Invalid flow structure: steps must be an array');
    }

    return {
      id: validId,
      name: name as string | undefined,
      description: description as string | undefined,
      steps,
    };
  }

  /**
   * Validate steps array and return set of step IDs
   */
  private static validateSteps(steps: unknown[]): Set<string> {
    const stepIds = new Set<string>();

    for (const step of steps) {
      if (!ValidationUtils.isRecord(step)) {
        throw new Error('Invalid step structure: step must be an object');
      }

      const stepId = ValidationUtils.validateStringField(step.id, 'id', 'Step');
      stepIds.add(stepId);
    }

    return stepIds;
  }

  /**
   * Validate step references
   */
  private static validateStepReferences(
    steps: unknown[],
    stepIds: Set<string>
  ): void {
    for (const step of steps) {
      const stepData = step as Record<string, unknown>;

      // Validate nextStepId structure
      const nextStepId = ValidationUtils.validateObjectField(
        stepData.nextStepId,
        'nextStepId',
        'Step'
      );

      // Validate all references
      for (const [key, value] of Object.entries(nextStepId)) {
        const refStepId = ValidationUtils.validateStringField(
          value,
          key,
          'NextStepId'
        );
        if (!stepIds.has(refStepId)) {
          throw new Error(`Invalid nextStepId reference: ${refStepId}`);
        }
      }
    }
  }
}

/**
 * Service for managing flow discovery and loading
 */
@injectable()
export class FlowManager {
  private readonly flowsDir: string;

  constructor(
    @inject(SERVICES.Logger) private readonly logger: Logger,
    @inject(SERVICES.StepFactory) private readonly stepFactory: StepFactory
  ) {
    this.flowsDir = path.join('.flows');
  }

  /**
   * List all available flows by scanning the flows directory
   */
  public async listFlows(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.flowsDir);
      return files
        .filter(file => file.endsWith('.json'))
        .map(file => path.basename(file, '.json'));
    } catch (error) {
      this.logger.error('Failed to list flows', { error });
      throw new Error('Unable to access flows directory');
    }
  }

  /**
   * Load a specific flow by name
   */
  public async loadFlow(name: string): Promise<IFlow> {
    const filePath = path.join(this.flowsDir, `${name}.json`);

    try {
      const jsonData = await fs.readFile(filePath, 'utf-8');
      const flowData = this.parseFlowData(jsonData);
      return this.convertToFlow(flowData);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        const availableFlows = await this.listFlows();
        throw new Error(
          `Flow '${name}' not found. Available flows: ${availableFlows.join(', ')}`
        );
      }
      throw error;
    }
  }

  /**
   * Parse JSON data and validate it as FlowData
   */
  private parseFlowData(jsonData: string): FlowData {
    const data = JSON.parse(jsonData) as unknown;
    return FlowValidator.validateFlow(data);
  }

  /**
   * Convert validated FlowData to Flow object
   */
  public convertToFlow(flowData: unknown): Flow {
    const validatedFlowData = FlowValidator.validateFlow(flowData);
    const steps = validatedFlowData.steps.map(stepData =>
      this.createStep(stepData)
    );
    return new Flow(validatedFlowData.id, steps);
  }

  /**
   * Create a step from raw step data
   */
  private createStep(stepData: unknown): Step {
    try {
      if (!ValidationUtils.isRecord(stepData)) {
        throw new Error('Step data must be an object');
      }

      const step = stepData;
      if (!step.type) {
        const stepIdStr = ValidationUtils.toString(step.id);
        throw new Error(
          `Step ${stepIdStr} must have a type field. ` +
            `Valid types: action, decision, log`
        );
      }

      return this.stepFactory.createStep(stepData);
    } catch (error) {
      this.logger.error('Failed to create step', {
        stepData,
        error:
          error instanceof Error
            ? error.message
            : ValidationUtils.toString(error),
      });
      throw error;
    }
  }
}
