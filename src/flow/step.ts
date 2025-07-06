import { Logger } from '../utils/logger.js';

// Step interface - Defines Step contract
export interface IStep {
  getId(): string;
  getNext(): string | null;
  execute(): Promise<boolean>;
}

// Step entity - Simple action-based execution
export class Step implements IStep {
  private id: string;
  private message: string;
  private nextStepId: string | null;
  private logger: Logger;

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

  public execute(): Promise<boolean> {
    this.logger.info(this.message);
    return Promise.resolve(true);
  }
}
