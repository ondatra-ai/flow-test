import { IContext, Context } from '../context.js';
import { IFlow } from '../flow.js';

export type SessionStatus = 'initialized' | 'running' | 'completed' | 'error';

// Session entity - Primary focus for flow execution
export class Session {
  private currentStepId: string | null;
  public status: SessionStatus;

  private readonly flow: IFlow;
  private readonly context: IContext;

  constructor(flow: IFlow) {
    this.flow = flow;
    this.context = new Context();

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
    if (!firstStepId) {
      this.status = 'error';
      throw new Error('Flow has no steps');
    }

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
    } catch (_error) {
      this.status = 'error';
      return false;
    }
  }

  public getContext(): IContext {
    return this.context;
  }
}
