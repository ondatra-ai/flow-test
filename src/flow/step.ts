import type { IContext } from '../interfaces/flow/context.interface.js';
import type { IStep } from '../interfaces/flow/step.interface.js';
import type { ILogger } from '../interfaces/utils/logger.interface.js';

// Step entity - Simple action-based execution with dynamic routing
export class Step implements IStep {
  private readonly id: string;
  private readonly message: string;
  private readonly nextStepId: Record<string, string>;
  protected readonly logger: ILogger;

  constructor(
    id: string,
    message: string,
    nextStepId: Record<string, string>,
    logger: ILogger
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
