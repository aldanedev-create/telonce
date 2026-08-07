/**
 * Cache Utility
 */

export interface CacheOptions {
  maxAge?: number;
}

export interface Cache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  clear(): void;
}

class MapCache<T> implements Cache<T> {
  private map = new Map<string, T>();

  get(key: string): T | undefined {
    return this.map.get(key);
  }

  set(key: string, value: T): void {
    this.map.set(key, value);
  }

  clear(): void {
    this.map.clear();
  }
}

export function createCache<T>(_options?: CacheOptions): Cache<T> {
  return new MapCache<T>();
}

export function getCache<T>(): Cache<T> {
  return new MapCache<T>();
}

export function clearCache(): void {
  // no-op stub
}