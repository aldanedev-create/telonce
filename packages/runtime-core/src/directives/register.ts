/**
 * Directive registration - register and manage directives
 */

/**
 * Directive options
 */
export interface DirectiveOptions {
  /**
   * Directive name
   */
  name: string;

  /**
   * Before mount hook
   */
  beforeMount?: (el: HTMLElement, binding: any) => void;

  /**
   * Mounted hook
   */
  mounted?: (el: HTMLElement, binding: any) => void;

  /**
   * Before update hook
   */
  beforeUpdate?: (el: HTMLElement, binding: any) => void;

  /**
   * Updated hook
   */
  updated?: (el: HTMLElement, binding: any) => void;

  /**
   * Before unmount hook
   */
  beforeUnmount?: (el: HTMLElement, binding: any) => void;

  /**
   * Unmounted hook
   */
  unmounted?: (el: HTMLElement, binding: any) => void;
}

/**
 * Directive
 */
export type Directive = DirectiveOptions | ((el: HTMLElement, binding: any) => void);

/**
 * Directive registry
 */
export interface DirectiveRegistry {
  /**
   * Register a directive
   */
  register: (name: string, directive: Directive) => void;

  /**
   * Get a directive
   */
  get: (name: string) => Directive | undefined;

  /**
   * Check if a directive exists
   */
  has: (name: string) => boolean;

  /**
   * Get all directive names
   */
  names: () => string[];
}

/**
 * Global directive registry
 */
const globalRegistry = new Map<string, Directive>();

/**
 * Register a directive
 */
export function registerDirective(
  name: string,
  directive: Directive
): void {
  globalRegistry.set(name, directive);
}

/**
 * Get a directive
 */
export function getDirective(name: string): Directive | undefined {
  return globalRegistry.get(name);
}

/**
 * Check if a directive exists
 */
export function hasDirective(name: string): boolean {
  return globalRegistry.has(name);
}

/**
 * Create a directive
 */
export function createDirective(
  options: DirectiveOptions
): Directive {
  return options;
}

/**
 * Create a directive registry
 */
export function createDirectiveRegistry(): DirectiveRegistry {
  const registry = new Map<string, Directive>();

  return {
    register(name: string, directive: Directive): void {
      registry.set(name, directive);
    },

    get(name: string): Directive | undefined {
      return registry.get(name);
    },

    has(name: string): boolean {
      return registry.has(name);
    },

    names(): string[] {
      return Array.from(registry.keys());
    }
  };
}

/**
 * Built-in directives
 */
export const BuiltinDirectives = {
  /**
   * For directive - keyed loop
   */
  For: {
    name: 'for',
    beforeMount(el: HTMLElement, binding: any) {
      // Initialize for loop
    }
  },

  /**
   * If directive - conditional rendering
   */
  If: {
    name: 'if',
    beforeMount(el: HTMLElement, binding: any) {
      // Initialize if statement
    }
  },

  /**
   * Show directive - show/hide
   */
  Show: {
    name: 'show',
    mounted(el: HTMLElement, binding: any) {
      // Show/hide element
    }
  }
};

// Register built-in directives
for (const [name, directive] of Object.entries(BuiltinDirectives)) {
  registerDirective(name.toLowerCase(), directive);
}