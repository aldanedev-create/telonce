/**
 * Directive resolver - resolve and apply directives
 */

import { getDirective, type Directive } from './register';

/**
 * Directive resolution
 */
export interface DirectiveResolution {
  /**
   * Directive name
   */
  name: string;

  /**
   * Directive implementation
   */
  directive: Directive;

  /**
   * Directive value/argument
   */
  value: any;

  /**
   * Modifiers
   */
  modifiers?: Record<string, boolean>;
}

/**
 * Directive resolver
 */
export interface DirectiveResolver {
  /**
   * Resolve a directive by name
   */
  resolve: (name: string) => Directive | undefined;

  /**
   * Resolve a directive with binding
   */
  resolveWithBinding: (name: string, value: any) => DirectiveResolution | undefined;

  /**
   * Resolve multiple directives
   */
  resolveAll: (bindings: Record<string, any>) => DirectiveResolution[];
}

/**
 * Create a directive resolver
 */
export function createDirectiveResolver(): DirectiveResolver {
  return {
    resolve(name: string): Directive | undefined {
      return getDirective(name);
    },

    resolveWithBinding(name: string, value: any): DirectiveResolution | undefined {
      const directive = getDirective(name);
      if (!directive) return undefined;

      return {
        name,
        directive,
        value
      };
    },

    resolveAll(bindings: Record<string, any>): DirectiveResolution[] {
      const result: DirectiveResolution[] = [];

      for (const [name, value] of Object.entries(bindings)) {
        const resolution = this.resolveWithBinding(name, value);
        if (resolution) {
          result.push(resolution);
        }
      }

      return result;
    }
  };
}

/**
 * Resolve a directive
 */
export function resolveDirective(name: string): Directive | undefined {
  return getDirective(name);
}

/**
 * Resolve a directive with binding
 */
export function resolveDirectiveWithBinding(
  name: string,
  value: any
): DirectiveResolution | undefined {
  const directive = getDirective(name);
  if (!directive) return undefined;

  return {
    name,
    directive,
    value
  };
}

/**
 * Resolve multiple directives
 */
export function resolveDirectives(
  bindings: Record<string, any>
): DirectiveResolution[] {
  const result: DirectiveResolution[] = [];

  for (const [name, value] of Object.entries(bindings)) {
    const resolution = resolveDirectiveWithBinding(name, value);
    if (resolution) {
      result.push(resolution);
    }
  }

  return result;
}

/**
 * Parse directive modifiers
 */
export function parseModifiers(value: string): { name: string; modifiers: Record<string, boolean> } {
  const parts = value.split('.');
  const name = parts[0];
  const modifiers: Record<string, boolean> = {};

  for (let i = 1; i < parts.length; i++) {
    modifiers[parts[i]] = true;
  }

  return { name, modifiers };
}

/**
 * Parse directive argument
 */
export function parseArgument(value: string): { name: string; arg?: string } {
  const parts = value.split(':');
  const name = parts[0];
  const arg = parts[1];

  return { name, arg };
}