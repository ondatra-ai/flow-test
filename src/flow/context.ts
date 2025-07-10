// Context interface - Key-Value storage for flow execution
export interface IContext {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
}

// Context implementation - Simple Map-based storage
export class Context implements IContext, Iterable<[string, string]> {
  private readonly storage: Map<string, string>;

  constructor() {
    this.storage = new Map<string, string>();
  }

  public get(key: string): string | undefined {
    return this.storage.get(key);
  }

  public set(key: string, value: string): void {
    this.storage.set(key, value);
  }

  public has(key: string): boolean {
    return this.storage.has(key);
  }

  public delete(key: string): boolean {
    return this.storage.delete(key);
  }

  public clear(): void {
    this.storage.clear();
  }

  // Make Context iterable
  public [Symbol.iterator](): Iterator<[string, string]> {
    return this.storage[Symbol.iterator]();
  }
}
