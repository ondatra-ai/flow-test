import { IFlow } from '../flow.js';

// Session entity - Primary focus for flow execution
export class Session {
  private currentStepId: string | null;
  private status: 'initialized' | 'running' | 'completed' | 'error';

  private readonly flow: IFlow;

  constructor(flow: IFlow) {
    this.flow = flow;

    // Initialize session properties
    this.currentStepId = null;
    this.status = 'initialized';
  }

  public start(): void {
    if (this.status !== 'initialized') {
      throw new Error('Session is already started or completed');
    }

    const firstStepId = this.flow.getFirstStepId();
    if (!firstStepId) {
      throw new Error('Flow has no steps');
    }

    this.currentStepId = firstStepId;
    this.status = 'running';
  }

  public async executeCurrentStep(): Promise<boolean> {
    if (this.status !== 'running' || !this.currentStepId) {
      throw new Error('Session is not running or has no current step');
    }

    const success = await this.flow.execute(this.currentStepId);

    if (!success) {
      this.status = 'error';
      return false;
    }

    this.currentStepId = this.flow.getNextStepId(this.currentStepId) ?? null;
    this.status = this.currentStepId ? 'running' : 'completed';

    return true;
  }

  public isComplete(): boolean {
    return this.status === 'completed';
  }
}
