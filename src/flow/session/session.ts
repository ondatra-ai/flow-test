import type { SessionStatus } from '../../types/flow/index.js';
import { castError } from '../../utils/cast.js';
import type { Logger } from '../../utils/logger.js';
import { IContext, Context } from '../context.js';
import { IFlow } from '../flow.js';

// Re-export for backward compatibility
export type { SessionStatus } from '../../types/flow/index.js';

// Session entity - Primary focus for flow execution
export class Session {
  private currentStepId: string | null;
  public status: SessionStatus;

  private readonly flow: IFlow;
  private readonly context: IContext;
  private readonly logger: Logger;

  constructor(flow: IFlow, logger: Logger) {
    this.flow = flow;
    this.context = new Context();
    this.logger = logger;

    // Initialize session properties
    this.currentStepId = null;
    this.status = 'initialized';
  }

  public start(): SessionStatus {
    if (this.status !== 'initialized') {
      this.status = 'error';
      throw new Error('Session is already started or completed');
    }

    const firstStepId = this.flow.getFirstStepId();
    this.currentStepId = firstStepId;
    this.status = 'running';
    return this.status;
  }

  public async executeCurrentStep(): Promise<boolean> {
    if (this.status !== 'running' || !this.currentStepId) {
      throw new Error('Session is not running or has no current step');
    }

    try {
      this.currentStepId = await this.flow.execute(
        this.currentStepId,
        this.context
      );

      // Update current step and status
      this.status = this.currentStepId ? 'running' : 'completed';

      return true;
    } catch (error) {
      this.status = 'error';
      // Log error since this method returns boolean instead of throwing
      this.logger.error('Flow execution failed:', castError(error));
      return false;
    }
  }

  public getContext(): IContext {
    return this.context;
  }
}
