import { describe, test, expect } from 'vitest';

import { Context, IContext } from '../../../src/flow/context.js';

describe('Context interface compliance', () => {
  test('should implement IContext interface', () => {
    const context = new Context();
    expect(context).toBeDefined();
    expect(typeof context.get).toBe('function');
    expect(typeof context.set).toBe('function');
    expect(typeof context.has).toBe('function');
    expect(typeof context.delete).toBe('function');
    expect(typeof context.clear).toBe('function');
  });
});

describe('Context basic operations', () => {
  test('should store and retrieve values', () => {
    const context: IContext = new Context();

    context.set('key1', 'value1');
    context.set('key2', 42);
    context.set('key3', { nested: 'object' });

    expect(context.get('key1')).toBe('value1');
    expect(context.get('key2')).toBe(42);
    expect(context.get('key3')).toEqual({ nested: 'object' });
  });

  test('should return undefined for non-existent keys', () => {
    const context = new Context();
    expect(context.get('nonexistent')).toBeUndefined();
  });
});

describe('Context key management', () => {
  test('should check if key exists', () => {
    const context = new Context();

    expect(context.has('key1')).toBe(false);

    context.set('key1', 'value1');
    expect(context.has('key1')).toBe(true);

    context.set('key2', undefined);
    expect(context.has('key2')).toBe(true);
  });

  test('should delete keys', () => {
    const context = new Context();

    context.set('key1', 'value1');
    context.set('key2', 'value2');

    expect(context.has('key1')).toBe(true);
    expect(context.delete('key1')).toBe(true);
    expect(context.has('key1')).toBe(false);
    expect(context.get('key1')).toBeUndefined();

    expect(context.delete('nonexistent')).toBe(false);
    expect(context.has('key2')).toBe(true);
  });

  test('should clear all keys', () => {
    const context = new Context();

    context.set('key1', 'value1');
    context.set('key2', 'value2');
    context.set('key3', 'value3');

    expect(context.has('key1')).toBe(true);
    expect(context.has('key2')).toBe(true);
    expect(context.has('key3')).toBe(true);

    context.clear();

    expect(context.has('key1')).toBe(false);
    expect(context.has('key2')).toBe(false);
    expect(context.has('key3')).toBe(false);
    expect(context.get('key1')).toBeUndefined();
    expect(context.get('key2')).toBeUndefined();
    expect(context.get('key3')).toBeUndefined();
  });
});

describe('Context value types', () => {
  test('should handle different value types', () => {
    const context = new Context();

    context.set('string', 'hello');
    context.set('number', 123);
    context.set('boolean', true);
    context.set('null', null);
    context.set('undefined', undefined);
    context.set('object', { prop: 'value' });
    context.set('array', [1, 2, 3]);

    expect(context.get('string')).toBe('hello');
    expect(context.get('number')).toBe(123);
    expect(context.get('boolean')).toBe(true);
    expect(context.get('null')).toBe(null);
    expect(context.get('undefined')).toBe(undefined);
    expect(context.get('object')).toEqual({ prop: 'value' });
    expect(context.get('array')).toEqual([1, 2, 3]);
  });
});
