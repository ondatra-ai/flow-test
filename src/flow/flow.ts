import type { IContext } from '../interfaces/flow/context.interface.js';
import type { IFlow } from '../interfaces/flow/flow.interface.js';
import type { IStep } from '../interfaces/flow/step.interface.js';

// Flow entity - Simple data structure for directed graph of steps
export class Flow implements IFlow {
  private readonly id: string;
  private readonly initialStepId: string;
  private readonly steps: IStep[];
  private readonly stepMap: Map<string, IStep>;

  constructor(id: string, steps: IStep[], initialStepId: string) {
    this.id = id;
    this.steps = steps;
    this.stepMap = new Map();

    // Build step map for efficient lookups
    for (const step of steps) {
      this.stepMap.set(step.getId(), step);
    }

    // Validate and store initial step ID
    if (!initialStepId) {
      throw new Error('Initial step ID is required');
    }

    if (!this.stepMap.has(initialStepId)) {
      throw new Error(
        `Initial step '${initialStepId}' not found in flow steps`
      );
    }

    this.initialStepId = initialStepId;
  }

  public getId(): string {
    return this.id;
  }

  public getFirstStepId(): string {
    // Since we validate initialStepId in constructor, this should always
    // return a valid string
    if (!this.initialStepId) {
      throw new Error('No initial step ID configured');
    }
    return this.initialStepId;
  }

  public getSteps(): IStep[] {
    return [...this.steps];
  }

  public async execute(
    stepId: string,
    context: IContext
  ): Promise<string | null> {
    const step = this.stepMap.get(stepId);
    if (!step) {
      return null;
    }
    return await step.execute(context);
  }
}
