import { SERVICES } from '../../config/tokens.js';

export type TokenType = (typeof SERVICES)[keyof typeof SERVICES];
