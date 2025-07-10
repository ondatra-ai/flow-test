import { promises as fs } from 'fs';
import path from 'path';

import { injectable, inject } from 'tsyringe';

import { SERVICES } from '../config/tokens.js';
import { Flow, type IFlow } from '../flow/flow.js';
import { Step } from '../flow/step.js';

import { Logger } from './logger.js';

/**
 * Type for flow data structure from JSON
 */
type FlowData = {
  id: string;
  name?: string;
  description?: string;
  steps: StepData[];
};

/**
 * Type for step data structure from JSON
 */
type StepData = {
  id: string;
  message: string;
  nextStepId: Record<string, string>;
};

/**
 * Service for managing flow discovery and loading
 */
@injectable()
export class FlowManager {
  private readonly flowsDir: string;
  private readonly logger: Logger;

  constructor(@inject(SERVICES.Logger) logger: Logger) {
    this.flowsDir = path.join('.flows');
    this.logger = logger;
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
  private convertToFlow(flowData: FlowData): Flow {
    const steps = flowData.steps.map(
      (stepData: StepData) =>
        new Step(
          stepData.id,
          stepData.message,
          stepData.nextStepId,
          this.logger
        )
    );

    return new Flow(flowData.id, steps);
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
          message: stepData.message as string,
          nextStepId: stepData.nextStepId as Record<string, string>,
        };
      }),
    };
  }
}
