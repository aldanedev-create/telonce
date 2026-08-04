/**
 * Props system - define, validate, and merge props
 */

/**
 * Prop validator function
 */
export type PropValidator<T = any> = (value: any) => value is T;

/**
 * Prop definition
 */
export interface PropDefinition<T = any> {
  /**
   * Prop type
   */
  type?: string | PropValidator<T>;

  /**
   * Default value
   */
  default?: T | (() => T);

  /**
   * Whether the prop is required
   */
  required?: boolean;

  /**
   * Prop validator
   */
  validator?: (value: T) => boolean;
}

/**
 * Props options
 */
export type PropsOptions<T = any> = {
  [K in keyof T]: PropDefinition<T[K]>
};

/**
 * Define props
 */
export function defineProps<P extends Record<string, any>>(
  options: PropsOptions<P>
): PropsOptions<P> {
  return options;
}

/**
 * Validate props
 */
export function validateProps<P>(
  props: P,
  definitions: PropsOptions<P>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const key in definitions) {
    if (Object.prototype.hasOwnProperty.call(definitions, key)) {
      const def = definitions[key];
      const value = props[key];

      // Check required
      if (def.required && (value === undefined || value === null)) {
        errors.push(`Prop "${String(key)}" is required`);
        continue;
      }

      // Skip validation if value is undefined and not required
      if (value === undefined || value === null) {
        continue;
      }

      // Check type
      if (def.type) {
        if (typeof def.type === 'string') {
          if (typeof value !== def.type) {
            errors.push(`Prop "${String(key)}" should be of type ${def.type}`);
          }
        } else if (typeof def.type === 'function') {
          if (!def.type(value)) {
            errors.push(`Prop "${String(key)}" failed type validation`);
          }
        }
      }

      // Check custom validator
      if (def.validator && !def.validator(value)) {
        errors.push(`Prop "${String(key)}" failed custom validation`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Merge props with defaults
 */
export function mergeProps<P extends Record<string, any>>(
  props: Partial<P> | undefined,
  definitions: PropsOptions<P>
): P {
  const result: any = {};

  for (const key in definitions) {
    if (Object.prototype.hasOwnProperty.call(definitions, key)) {
      const def = definitions[key];
      const value = props?.[key];

      if (value !== undefined && value !== null) {
        result[key] = value;
      } else if (def.default !== undefined) {
        result[key] = typeof def.default === 'function' 
          ? (def.default as any)() 
          : def.default;
      } else {
        result[key] = undefined;
      }
    }
  }

  return result as P;
}

/**
 * Type helpers
 */
export const PropType = {
  String: 'string' as const,
  Number: 'number' as const,
  Boolean: 'boolean' as const,
  Object: 'object' as const,
  Array: 'array' as const,
  Function: 'function' as const,
  Symbol: 'symbol' as const,
};

/**
 * Prop validators
 */
export const Validators = {
  string: (value: any): value is string => typeof value === 'string',
  number: (value: any): value is number => typeof value === 'number',
  boolean: (value: any): value is boolean => typeof value === 'boolean',
  object: (value: any): value is Record<string, any> => 
    typeof value === 'object' && value !== null && !Array.isArray(value),
  array: (value: any): value is any[] => Array.isArray(value),
  function: (value: any): value is (...args: any[]) => any => typeof value === 'function',
};