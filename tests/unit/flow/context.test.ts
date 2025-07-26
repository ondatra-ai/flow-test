import { describe, test, expect } from 'vitest';

import { Context } from '../../../src/flow/context.js';
import type { IContext } from '../../../src/interfaces/flow/context.interface.js';

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
  test('should store and retrieve string values', () => {
    const context: IContext = new Context();

    context.set('key1', 'value1');
    context.set('key2', 'value2');
    context.set('key3', 'another string value');

    expect(context.get('key1')).toBe('value1');
    expect(context.get('key2')).toBe('value2');
    expect(context.get('key3')).toBe('another string value');
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

    context.set('key2', '');
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

describe('Context string values', () => {
  test('should handle different string values', () => {
    const context = new Context();

    context.set('empty', '');
    context.set('simple', 'hello');
    context.set('multiword', 'hello world');
    context.set('numeric', '123');
    context.set('special', 'special-chars_123!@#');
    context.set('multiline', 'line1\nline2\nline3');
    context.set('json', '{"key":"value"}');

    expect(context.get('empty')).toBe('');
    expect(context.get('simple')).toBe('hello');
    expect(context.get('multiword')).toBe('hello world');
    expect(context.get('numeric')).toBe('123');
    expect(context.get('special')).toBe('special-chars_123!@#');
    expect(context.get('multiline')).toBe('line1\nline2\nline3');
    expect(context.get('json')).toBe('{"key":"value"}');
  });
});
