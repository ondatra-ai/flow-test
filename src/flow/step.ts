import type { IStep } from '../interfaces/flow/index.js';
import type { Logger } from '../utils/logger.js';

import type { IContext } from './context.js';

// Re-export for backward compatibility
export type { IStep } from '../interfaces/flow/index.js';

// Step entity - Simple action-based execution with dynamic routing
export class Step implements IStep {
  private readonly id: string;
  private readonly message: string;
  private readonly nextStepId: Record<string, string>;
  protected readonly logger: Logger;

  constructor(
    id: string,
    message: string,
    nextStepId: Record<string, string>,
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

  public execute(context: IContext): Promise<string | null> {
    this.logger.info(this.message);

    // Check if this is an end step (empty object)
    if (Object.keys(this.nextStepId).length === 0) {
      return Promise.resolve(null);
    }

    // Get routing key from context
    const routingKey = context.get('nextStep');

    // If routing key exists and matches a key in nextStepId, use it
    if (routingKey && this.nextStepId[routingKey]) {
      return Promise.resolve(this.nextStepId[routingKey]);
    }

    // Use default if available, otherwise return null
    return Promise.resolve(this.nextStepId['default'] || null);
  }
}
