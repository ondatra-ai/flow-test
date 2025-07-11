import { injectable, inject } from 'tsyringe';

import { SERVICES } from '../config/tokens.js';
import { Logger } from '../utils/logger.js';
import { validateStep } from '../validation/index.js';

import { Step } from './step.js';
import { ActionStep } from './types/action-step.js';
import { DecisionStep } from './types/decision-step.js';
import { LogStep } from './types/log-step.js';

/**
 * Factory for creating typed step instances
 */
@injectable()
export class StepFactory {
  constructor(@inject(SERVICES.Logger) private readonly logger: Logger) {}

  /**
   * Create a step instance based on step data
   */
  createStep(stepData: unknown): Step {
    // Validate step data using Zod schema
    const validatedConfig = validateStep(stepData);

    // Create appropriate step instance based on type
    switch (validatedConfig.type) {
      case 'action':
        return new ActionStep(this.logger, validatedConfig);

      case 'decision':
        return new DecisionStep(this.logger, validatedConfig);

      case 'log':
        return new LogStep(this.logger, validatedConfig);

      default:
        throw new Error(`Unknown step type: ${String(validatedConfig)}`);
    }
  }
}
