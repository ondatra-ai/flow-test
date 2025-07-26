import type { SessionStatus } from '../../types/flow/index.js';
import { castError } from '../../utils/cast.js';
import type { ILogger } from '../../utils/logger.js';
import { Context } from '../context.js';
import type { IContext } from '../../interfaces/flow/context.interface.js';
import type { IFlow } from '../../interfaces/flow/flow.interface.js';



// Session entity - Primary focus for flow execution
export class Session {
  private currentStepId: string | null;
  public status: SessionStatus;

  private readonly flow: IFlow;
  private readonly context: IContext;
  private readonly logger: ILogger;

  constructor(flow: IFlow, logger: ILogger) {
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
