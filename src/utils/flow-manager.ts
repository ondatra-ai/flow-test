import { promises as fs } from 'fs';
import path from 'path';

import { injectable, inject } from 'tsyringe';

import { SERVICES } from '../config/tokens.js';
import { Flow, type IFlow } from '../flow/flow.js';
import { StepFactory } from '../flow/step-factory.js';
import { Step } from '../flow/step.js';
import { validateFlow, type FlowDefinition } from '../validation/index.js';

import { Logger } from './logger.js';

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
   * Parse JSON data and validate it using Zod schema
   */
  private parseFlowData(jsonData: string): FlowDefinition {
    const data = JSON.parse(jsonData) as unknown;
    return validateFlow(data);
  }

  /**
   * Convert validated FlowDefinition to Flow object
   */
  public convertToFlow(flowData: unknown): Flow {
    const validatedFlowData = validateFlow(flowData);
    const steps = validatedFlowData.steps.map(stepData =>
      this.createStep(stepData)
    );
    return new Flow(validatedFlowData.id, steps);
  }

  /**
   * Create a step from validated step data
   */
  private createStep(stepData: unknown): Step {
    try {
      return this.stepFactory.createStep(stepData);
    } catch (error) {
      this.logger.error('Failed to create step', {
        stepData,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
