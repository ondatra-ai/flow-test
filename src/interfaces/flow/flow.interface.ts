import type { IContext } from './context.interface.js';
import type { IStep } from './step.interface.js';

// Flow interface - Defines Flow contract
export interface IFlow {
  getId(): string;
  getFirstStepId(): string;
  getSteps(): IStep[];
  execute(stepId: string, context: IContext): Promise<string | null>;
}
