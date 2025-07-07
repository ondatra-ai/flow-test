// Context interface - Key-Value storage for flow execution
export interface IContext {
  get(key: string): unknown;
  set(key: string, value: unknown): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
}

// Context implementation - Simple Map-based storage
export class Context implements IContext {
  private readonly storage: Map<string, unknown>;

  constructor() {
    this.storage = new Map<string, unknown>();
  }

  public get(key: string): unknown {
    return this.storage.get(key);
  }

  public set(key: string, value: unknown): void {
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
}
