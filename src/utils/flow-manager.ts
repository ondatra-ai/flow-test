import { promises as fs } from 'fs';
import path from 'path';

import { injectable, inject } from 'tsyringe';

import { SERVICES } from '../config/tokens.js';
import { Flow, type IFlow } from '../flow/flow.js';
import { StepFactory } from '../flow/step-factory.js';
import { Step } from '../flow/step.js';

import { Logger } from './logger.js';

/**
 * Type for flow data structure from JSON
 */
export type FlowData = {
  id: string;
  name?: string;
  description?: string;
  steps: StepData[];
};

/**
 * Type for step data structure from JSON
 */
export type StepData = {
  id: string;
  type?: string;
  message?: string;
  nextStepId: Record<string, string>;
  // Additional fields that vary by step type
  [key: string]: unknown;
};

/**
 * Service for managing flow discovery and loading
 */
@injectable()
export class FlowManager {
  private readonly flowsDir: string;
  private readonly logger: Logger;
  private readonly stepFactory?: StepFactory;

  constructor(
    @inject(SERVICES.Logger) logger: Logger,
    @inject(SERVICES.StepFactory) stepFactory?: StepFactory
  ) {
    this.flowsDir = path.join('.flows');
    this.logger = logger;
    this.stepFactory = stepFactory;
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

      // Convert to Flow object
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
    return this.validateFlowStructure(data);
  }

  /**
   * Convert validated FlowData to Flow object
   */
  public convertToFlow(flowData: unknown): Flow {
    // Validate and convert the raw data to FlowData
    const validatedFlowData = this.validateFlowStructure(flowData);
    const steps = validatedFlowData.steps.map((stepData: StepData) => {
      try {
        // If step has a type, use the factory to create typed step
        if (stepData.type && this.stepFactory) {
          return this.stepFactory.createStep(stepData);
        }

        // Fall back to basic Step for backward compatibility
        if (!stepData.message) {
          throw new Error(
            `Untyped step ${stepData.id} requires a message field`
          );
        }

        return new Step(
          stepData.id,
          stepData.message,
          stepData.nextStepId,
          this.logger
        );
      } catch (error) {
        this.logger.error(`Failed to create step: ${stepData.id}`, {
          stepData,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    });

    return new Flow(validatedFlowData.id, steps);
  }

  /**
   * Validate flow structure and return typed FlowData
   */
  private validateFlowStructure(data: unknown): FlowData {
    const validatedData = this.validateFlowDataType(data);
    this.validateBasicFlowStructure(validatedData);

    const stepIds = this.extractStepIds(validatedData.steps as unknown[]);
    this.validateStepReferences(validatedData.steps as unknown[], stepIds);

    return this.convertToFlowData(validatedData);
  }

  /**
   * Validate that flow data is an object
   */
  private validateFlowDataType(flowData: unknown): Record<string, unknown> {
    if (typeof flowData !== 'object' || flowData === null) {
      throw new Error('Invalid flow structure: data must be an object');
    }
    return flowData as Record<string, unknown>;
  }

  /**
   * Validate basic flow structure
   */
  private validateBasicFlowStructure(data: Record<string, unknown>): void {
    if (
      typeof data.id !== 'string' ||
      !data.steps ||
      !Array.isArray(data.steps)
    ) {
      throw new Error('Invalid flow structure: missing id or steps');
    }
  }

  /**
   * Extract step IDs from steps array
   */
  private extractStepIds(steps: unknown[]): Set<string> {
    return new Set(
      steps.map((step: unknown) => {
        if (typeof step !== 'object' || step === null) {
          throw new Error('Invalid step structure: step must be an object');
        }
        const stepData = step as Record<string, unknown>;
        if (typeof stepData.id !== 'string') {
          throw new Error('Invalid step structure: step id must be a string');
        }
        return stepData.id;
      })
    );
  }

  /**
   * Validate step references
   */
  private validateStepReferences(steps: unknown[], stepIds: Set<string>): void {
    for (const step of steps) {
      if (typeof step !== 'object' || step === null) {
        throw new Error('Invalid step structure: step must be an object');
      }
      const stepData = step as Record<string, unknown>;

      // Validate nextStepId is an object
      if (
        !stepData.nextStepId ||
        typeof stepData.nextStepId !== 'object' ||
        Array.isArray(stepData.nextStepId)
      ) {
        throw new Error('Invalid step structure: nextStepId must be an object');
      }

      const nextStepIdObj = stepData.nextStepId as Record<string, unknown>;

      // Validate all values in nextStepId object are valid step IDs
      for (const [key, value] of Object.entries(nextStepIdObj)) {
        if (typeof value !== 'string') {
          throw new Error(`Invalid nextStepId value: ${key} must be a string`);
        }
        if (!stepIds.has(value)) {
          throw new Error(`Invalid nextStepId reference: ${value}`);
        }
      }
    }
  }

  /**
   * Convert raw data to FlowData structure
   */
  private convertToFlowData(data: Record<string, unknown>): FlowData {
    return {
      id: data.id as string,
      steps: (data.steps as unknown[]).map((step: unknown) => {
        const stepData = step as Record<string, unknown>;
        return {
          id: stepData.id as string,
          type: stepData.type as string | undefined,
          message: stepData.message as string | undefined,
          nextStepId: stepData.nextStepId as Record<string, string>,
          ...stepData, // Include all additional fields for typed steps
        };
      }),
    };
  }
}
