import { Logger } from '../utils/logger.js';

import { IContext } from './context.js';

// Step interface - Defines Step contract
export interface IStep {
  getId(): string;
  getNext(): string | null;
  execute(context: IContext): Promise<boolean>;
}

// Step entity - Simple action-based execution
export class Step implements IStep {
  private readonly id: string;
  private readonly message: string;
  private readonly nextStepId: string | null;
  private readonly logger: Logger;

  constructor(
    id: string,
    message: string,
    nextStepId: string | null,
    logger: Logger
  ) {
    this.id = id;
    this.message = message;
    this.nextStepId = nextStepId;
    this.logger = logger;
  }

  public getId(): string {
    return this.id;
  }

  public getNext(): string | null {
    return this.nextStepId;
  }

  public execute(_: IContext): Promise<boolean> {
    // Context is available for future use by step implementations
    this.logger.info(this.message);
    return Promise.resolve(true);
  }
}
