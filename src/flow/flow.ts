import { IStep } from './step.js';

// Flow interface - Defines Flow contract
export interface IFlow {
  getId(): string;
  getFirstStepId(): string | undefined;
  getNextStepId(stepId: string): string | undefined;
  getSteps(): IStep[];
  execute(stepId: string): Promise<boolean>;
}

// Flow entity - Simple data structure for directed graph of steps
export class Flow implements IFlow {
  private readonly id: string;
  private readonly steps: IStep[];
  private readonly stepMap: Map<string, IStep>;

  constructor(id: string, steps: IStep[]) {
    this.id = id;
    this.steps = steps;
    this.stepMap = new Map();

    // Build step map for efficient lookups
    for (const step of steps) {
      this.stepMap.set(step.getId(), step);
    }
  }

  public getId(): string {
    return this.id;
  }

  public getFirstStepId(): string | undefined {
    return this.steps.length > 0 ? this.steps[0].getId() : undefined;
  }

  public getNextStepId(currentStepId: string): string | undefined {
    const currentStep = this.stepMap.get(currentStepId);
    if (!currentStep) {
      return undefined;
    }
    return currentStep.getNext() ?? undefined;
  }

  public getSteps(): IStep[] {
    return this.steps;
  }

  public async execute(stepId: string): Promise<boolean> {
    const step = this.stepMap.get(stepId);
    if (!step) {
      return false;
    }
    return await step.execute();
  }
}
