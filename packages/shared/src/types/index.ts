/**
 * Shared type definitions
 */

// ===== Result Types =====

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

/**
 * Option type for values that may be absent
 */
export type Option<T> = T | null | undefined;

/**
 * Either type for values that can be one of two types
 */
export type Either<L, R> = { kind: 'left'; left: L } | { kind: 'right'; right: R };

/**
 * Maybe type (alternative to Option)
 */
export type Maybe<T> = { kind: 'just'; value: T } | { kind: 'nothing' };

// ===== Async Types =====

/**
 * Async Result type
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/**
 * Async Option type
 */
export type AsyncOption<T> = Promise<Option<T>>;

/**
 * Async Either type
 */
export type AsyncEither<L, R> = Promise<Either<L, R>>;

/**
 * Async Maybe type
 */
export type AsyncMaybe<T> = Promise<Maybe<T>>;

// ===== Logger Types =====

export interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  fatal: (message: string, ...args: any[]) => void;
}

export interface LoggerOptions {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  prefix?: string;
  silent?: boolean;
}

// ===== Config Types =====

export interface Config {
  get: <T = any>(key: string, defaultValue?: T) => T;
  set: (key: string, value: any) => void;
  has: (key: string) => boolean;
  delete: (key: string) => void;
  merge: (config: Record<string, any>) => void;
  toObject: () => Record<string, any>;
}

export interface ConfigOptions {
  defaults?: Record<string, any>;
  validate?: (config: Record<string, any>) => string[];
}

// ===== Error Types =====

export interface ErrorWithCode extends Error {
  code: string;
}

export interface ErrorWithStack extends Error {
  stack: string;
}

// ===== JSON Types =====

export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONObject
  | JSONArray;

export interface JSONObject {
  [key: string]: JSONValue;
}

export type JSONArray = JSONValue[];

// ===== Utility Types =====

/**
 * Makes all properties recursively readonly
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Makes all properties recursively optional
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Makes all properties recursively required
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Excludes null and undefined from a type
 */
export type NonNullableProps<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Makes properties optional
 */
export type OptionalProps<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Makes properties required
 */
export type RequiredProps<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Serialize/Deserialize interface
 */
export interface Serializable {
  serialize: () => string;
  deserialize: (data: string) => void;
}

// ===== Common Type Helpers =====

/**
 * Extract the value type from a Promise
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Extract the return type from a function
 */
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

/**
 * Extract the parameter types from a function
 */
export type Parameters<T> = T extends (...args: infer P) => any ? P : never;

/**
 * Make all properties optional except the specified keys
 */
export type PartialExcept<T, K extends keyof T> = Partial<Omit<T, K>> & Pick<T, K>;

/**
 * Make all properties required except the specified keys
 */
export type RequiredExcept<T, K extends keyof T> = Required<Omit<T, K>> & Partial<Pick<T, K>>;

/**
 * Pick properties that are functions
 */
export type FunctionProps<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

/**
 * Pick properties that are not functions
 */
export type NonFunctionProps<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? never : K;
}[keyof T];

// ===== Type Guards =====

export function isResult<T, E>(value: any): value is Result<T, E> {
  return value && typeof value === 'object' && 'success' in value;
}

export function isOption<T>(value: any): value is Option<T> {
  return value === null || value === undefined || true;
}

export function isErrorWithCode(value: any): value is ErrorWithCode {
  return value && value instanceof Error && 'code' in value;
}

export function isJSONObject(value: any): value is JSONObject {
  return value && typeof value === 'object' && !Array.isArray(value) && value !== null;
}

export function isJSONArray(value: any): value is JSONArray {
  return Array.isArray(value);
}