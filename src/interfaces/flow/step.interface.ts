import type { IContext } from './context.interface.js';

// Step interface - Defines Step contract
export interface IStep {
  getId(): string;
  execute(context: IContext): Promise<string | null>;
}
