# Mock Validation API Design - Revised Decision

## Design Decision: Assertion Builder API (Option B)

### Revised Selection Based on User Preference

After further consideration, we're proceeding with **Option B: Assertion Builder API** which offers a more familiar Jest/Vitest-style assertion pattern.

### Detailed Option B Design

#### Core API Concepts

```typescript
// Basic usage - validate mock was called with specific args
expectMockCall(providerMock.generate).toHaveBeenCalledWithArgs<StreamRequest>(
  args => {
    expect(args.prompt).toContain('test');
    expect(args.model).toBe('gpt-4');
  }
);

// Extract arguments with type safety
const args = expectMockCall(providerMock.generate)
  .call(0)
  .extractArgs<StreamRequest>();

// Pattern matching with Jest matchers
expectMockCall(providerMock.generate).toMatchCallPattern({
  prompt: expect.stringContaining('test'),
  model: 'gpt-4',
  temperature: expect.any(Number),
});

// Multiple call validation
expectMockCall(providerMock.generate)
  .toHaveBeenCalledTimes(2)
  .call(0)
  .toMatchArgs({ prompt: 'first' })
  .call(1)
  .toMatchArgs({ prompt: 'second' });

// Async validation support
await expectMockCall(asyncMock).toHaveResolvedWith<Response>(result => {
  expect(result.status).toBe(200);
});
```

#### Advanced Features

```typescript
// Partial matching with type inference
expectMockCall(providerMock.generate)
  .lastCall()
  .toPartiallyMatch<StreamRequest>({
    model: 'gpt-4',
    // other fields are optional
  });

// Negative assertions
expectMockCall(
  providerMock.generate
).not.toHaveBeenCalledWithArgs<StreamRequest>(args => {
  expect(args.model).toBe('gpt-3.5');
});

// Call sequence validation
expectMockCall(providerMock.generate).toHaveCallSequence<StreamRequest>([
  { prompt: expect.stringContaining('init') },
  { prompt: expect.stringContaining('follow-up') },
]);

// Spy on specific arguments
const promptSpy = expectMockCall(providerMock.generate).spyOnArg<StreamRequest>(
  'prompt'
);

expect(promptSpy.values).toEqual(['test1', 'test2', 'test3']);
expect(promptSpy.lastValue).toBe('test3');
```

### Implementation Architecture

#### Core Types

```typescript
interface MockCallExpectation<TMock extends Mock> {
  // Basic assertions
  toHaveBeenCalled(): this;
  toHaveBeenCalledTimes(times: number): this;
  toHaveBeenCalledOnce(): this;

  // Argument validation
  toHaveBeenCalledWithArgs<TArgs>(validator: (args: TArgs) => void): this;

  // Pattern matching
  toMatchCallPattern<TArgs>(pattern: MatchPattern<TArgs>): this;

  // Call navigation
  call(index: number): CallExpectation<TMock>;
  firstCall(): CallExpectation<TMock>;
  lastCall(): CallExpectation<TMock>;

  // Negation
  not: MockCallExpectation<TMock>;
}

interface CallExpectation<TMock extends Mock> {
  // Extract with validation
  extractArgs<TArgs>(): TArgs;
  extractArg<TArg>(index: number): TArg;

  // Validate specific call
  toMatchArgs<TArgs>(pattern: MatchPattern<TArgs>): MockCallExpectation<TMock>;
  toPartiallyMatch<TArgs>(partial: Partial<TArgs>): MockCallExpectation<TMock>;

  // Access call metadata
  getMetadata(): CallMetadata;
}

type MatchPattern<T> = {
  [K in keyof T]: T[K] | jest.AsymmetricMatcher;
};
```

#### Error Messages

```typescript
class MockValidationError extends Error {
  constructor(
    message: string,
    public details: {
      mockName?: string;
      expectedCalls?: number;
      actualCalls?: number;
      callIndex?: number;
      validationErrors?: string[];
    }
  ) {
    super(MockValidationError.formatMessage(message, details));
    this.name = 'MockValidationError';
  }

  static formatMessage(message: string, details: any): string {
    let formatted = message;

    if (details.expectedCalls !== undefined) {
      formatted += `\n  Expected calls: ${details.expectedCalls}`;
      formatted += `\n  Actual calls: ${details.actualCalls}`;
    }

    if (details.validationErrors?.length) {
      formatted += '\n  Validation errors:';
      details.validationErrors.forEach(err => {
        formatted += `\n    - ${err}`;
      });
    }

    return formatted;
  }
}
```

### Key Benefits of Assertion Builder API

1. **Familiar Syntax**: Developers already know Jest/Vitest matchers
2. **Powerful Matching**: Leverages existing matcher ecosystem
3. **Clear Intent**: Assertions read like specifications
4. **Better Error Messages**: Natural assertion format produces clear failures
5. **Composable**: Can chain multiple validations fluently

### Integration with Existing Patterns

```typescript
// Works seamlessly with existing Jest patterns
describe('MyComponent', () => {
  it('should call API with correct params', () => {
    // Existing pattern
    expect(apiMock).toHaveBeenCalledWith({
      endpoint: '/users',
      method: 'GET',
    });

    // New pattern for complex validation
    expectMockCall(apiMock).toHaveBeenCalledWithArgs<APIRequest>(args => {
      expect(args.headers).toHaveProperty('Authorization');
      expect(args.body).toBeUndefined();
    });
  });
});
```

### Migration Strategy Preview

```typescript
// Transform unsafe assertions
// FROM:
const callArgs = providerMock.generate.mock.calls[0][0] as StreamRequest;
expect(callArgs.prompt).toContain('test');

// TO:
expectMockCall(providerMock.generate)
  .call(0)
  .toMatchArgs<StreamRequest>({
    prompt: expect.stringContaining('test'),
  });

// OR for extraction:
const callArgs = expectMockCall(providerMock.generate)
  .call(0)
  .extractArgs<StreamRequest>();
expect(callArgs.prompt).toContain('test');
```

### Implementation Phases

1. **Core Assertion Builder**
   - Basic call validation
   - Argument extraction
   - Error formatting

2. **Pattern Matching**
   - Jest matcher integration
   - Partial matching
   - Deep equality checks

3. **Advanced Features**
   - Call sequences
   - Spy functionality
   - Async support

4. **Developer Experience**
   - TypeScript definitions
   - IDE autocomplete
   - Helpful error messages

This approach provides a natural extension to existing Jest/Vitest patterns while solving the type safety issues.
