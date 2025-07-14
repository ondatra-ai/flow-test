import { promises as fs } from 'fs';
import path from 'path';

import { injectable, inject } from 'tsyringe';

import { SERVICES } from '../config/tokens.js';
import { Flow, type IFlow } from '../flow/flow.js';
import { StepFactory } from '../flow/step-factory.js';
import { type IStep } from '../flow/step.js';
import type { StepConfig } from '../types/validation/index.js';
import type { FlowConfig } from '../validation/index.js';
import { FlowConfigSchema } from '../validation/schemas/flow.schema.js';

import { castJson } from './cast.js';

/**
 * Service for managing flow discovery and loading
 */
@injectable()
export class FlowManager {
  private readonly flowsDir: string;

  constructor(
    @inject(SERVICES.StepFactory) private readonly stepFactory: StepFactory
  ) {
    this.flowsDir = path.join('.flows');
  }

  /**
   * List all available flows by scanning the flows directory
   */
  public async listFlows(): Promise<string[]> {
    const files = await fs.readdir(this.flowsDir);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => path.basename(file, '.json'));
  }

  /**
   * Load a specific flow by name
   */
  public async loadFlow(name: string): Promise<IFlow> {
    const filePath = path.join(this.flowsDir, `${name}.json`);

    try {
      const jsonData = await fs.readFile(filePath, 'utf-8');
      const flowData = castJson(FlowConfigSchema, jsonData);
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
   * Convert validated FlowConfig to Flow object
   */
  public convertToFlow(flowData: FlowConfig): Flow {
    const steps = flowData.steps.map(stepData => this.createStep(stepData));

    return new Flow(flowData.id, steps, flowData.initialStepId);
  }

  /**
   * Create a step from validated step data
   */
  private createStep(stepData: StepConfig): IStep {
    return this.stepFactory.createStep(stepData);
  }
}
