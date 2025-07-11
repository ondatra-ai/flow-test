import { describe, it, expect } from 'vitest';

import {
  isRecord,
  isNonEmptyString,
  validateStringField,
  validateEnumField,
  validateRequired,
  validateObjectField,
  toString as toStringUtil,
  createValidationError,
} from '../../../src/utils/validation.js';

describe('Validation Utils - Core Functions', () => {
  describe('isRecord', () => {
    it('should return true for plain objects', () => {
      expect(isRecord({})).toBe(true);
      expect(isRecord({ key: 'value' })).toBe(true);
    });

    it('should return false for non-objects', () => {
      expect(isRecord(null)).toBe(false);
      expect(isRecord(undefined)).toBe(false);
      expect(isRecord('string')).toBe(false);
      expect(isRecord(123)).toBe(false);
      expect(isRecord([])).toBe(false);
    });
  });

  describe('isNonEmptyString', () => {
    it('should return true for non-empty strings', () => {
      expect(isNonEmptyString('test')).toBe(true);
      expect(isNonEmptyString('a')).toBe(true);
    });

    it('should return false for empty or non-strings', () => {
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(123)).toBe(false);
    });
  });

  describe('validateStringField', () => {
    it('should return the string value for valid strings', () => {
      expect(validateStringField('test', 'fieldName')).toBe('test');
    });

    it('should throw error for empty strings', () => {
      expect(() => validateStringField('', 'fieldName')).toThrow(
        "field 'fieldName' must be a non-empty string"
      );
    });

    it('should throw error for non-strings', () => {
      expect(() => validateStringField(null, 'fieldName')).toThrow(
        "field 'fieldName' must be a non-empty string"
      );
    });

    it('should include context in error message when provided', () => {
      expect(() => validateStringField('', 'fieldName', 'MyContext')).toThrow(
        "MyContext field 'fieldName' must be a non-empty string"
      );
    });
  });

  describe('validateEnumField', () => {
    const validValues = ['option1', 'option2', 'option3'] as const;

    it('should return the value for valid enum values', () => {
      expect(validateEnumField('option1', validValues, 'fieldName')).toBe(
        'option1'
      );
      expect(validateEnumField('option2', validValues, 'fieldName')).toBe(
        'option2'
      );
    });

    it('should throw error for invalid enum values', () => {
      expect(() =>
        validateEnumField('invalid', validValues, 'fieldName')
      ).toThrow("field 'fieldName' must be one of: option1, option2, option3");
    });

    it('should include context in error message when provided', () => {
      expect(() =>
        validateEnumField('invalid', validValues, 'fieldName', 'MyContext')
      ).toThrow(
        "MyContext field 'fieldName' must be one of: option1, option2, option3"
      );
    });
  });

  describe('validateRequired', () => {
    it('should return the value for non-null/undefined values', () => {
      expect(validateRequired('test', 'fieldName')).toBe('test');
      expect(validateRequired(123, 'fieldName')).toBe(123);
      expect(validateRequired(false, 'fieldName')).toBe(false);
      expect(validateRequired(0, 'fieldName')).toBe(0);
    });

    it('should throw error for null values', () => {
      expect(() => validateRequired(null, 'fieldName')).toThrow(
        "field 'fieldName' is required"
      );
    });

    it('should throw error for undefined values', () => {
      expect(() => validateRequired(undefined, 'fieldName')).toThrow(
        "field 'fieldName' is required"
      );
    });
  });

  describe('validateObjectField', () => {
    it('should return the object for valid objects', () => {
      const obj = { key: 'value' };
      expect(validateObjectField(obj, 'fieldName')).toBe(obj);
      expect(validateObjectField({}, 'fieldName')).toEqual({});
    });

    it('should throw error for null values', () => {
      expect(() => validateObjectField(null, 'fieldName')).toThrow(
        "field 'fieldName' must be an object"
      );
    });

    it('should throw error for arrays', () => {
      expect(() => validateObjectField([], 'fieldName')).toThrow(
        "field 'fieldName' must be an object"
      );
    });
  });

  describe('toString', () => {
    it('should return strings as-is', () => {
      expect(toStringUtil('test')).toBe('test');
      expect(toStringUtil('')).toBe('');
    });

    it('should convert null and undefined', () => {
      expect(toStringUtil(null)).toBe('null');
      expect(toStringUtil(undefined)).toBe('undefined');
    });

    it('should convert numbers and booleans', () => {
      expect(toStringUtil(123)).toBe('123');
      expect(toStringUtil(true)).toBe('true');
      expect(toStringUtil(false)).toBe('false');
    });

    it('should convert objects and functions to descriptive strings', () => {
      expect(toStringUtil({})).toBe('[object]');
      expect(toStringUtil(() => {})).toBe('[function]');
    });
  });

  describe('createValidationError', () => {
    it('should create error with message only', () => {
      const error = createValidationError('Test error message');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test error message');
    });

    it('should create error with context prefix', () => {
      const error = createValidationError('Test error message', 'MyContext');
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('MyContext: Test error message');
    });
  });

  describe('integration scenarios', () => {
    it('should validate complex step configuration', () => {
      const stepConfig = {
        id: 'test-step',
        type: 'action',
        operation: 'setContext',
        key: 'testKey',
        value: 'testValue',
        nextStepId: { default: 'next-step' },
      };

      // Validate structure
      expect(isRecord(stepConfig)).toBe(true);

      // Validate individual fields
      expect(validateStringField(stepConfig.id, 'id', 'Step')).toBe(
        'test-step'
      );
      expect(
        validateEnumField(
          stepConfig.type,
          ['action', 'decision', 'log'],
          'type',
          'Step'
        )
      ).toBe('action');
      expect(
        validateObjectField(stepConfig.nextStepId, 'nextStepId', 'Step')
      ).toBe(stepConfig.nextStepId);
    });

    it('should handle validation failures', () => {
      const invalidConfig = {
        id: '', // Invalid: empty string
        type: 'invalid', // Invalid: not in enum
        nextStepId: null, // Invalid: not an object
      };

      expect(() => validateStringField(invalidConfig.id, 'id', 'Step')).toThrow(
        "Step field 'id' must be a non-empty string"
      );

      expect(() =>
        validateEnumField(
          invalidConfig.type,
          ['action', 'decision', 'log'],
          'type',
          'Step'
        )
      ).toThrow("Step field 'type' must be one of: action, decision, log");

      expect(() =>
        validateObjectField(invalidConfig.nextStepId, 'nextStepId', 'Step')
      ).toThrow("Step field 'nextStepId' must be an object");
    });
  });
});
