// Context interface - Key-Value storage for flow execution
export interface IContext {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
}
