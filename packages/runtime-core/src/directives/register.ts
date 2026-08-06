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
 *
 * NOTE: these are placeholder registrations only. The real, working
 * implementations of for/if/show live in @teloce/runtime-dom
 * (createFor/createIf/createShow) and are wired up there directly - this
 * package intentionally has no dependency on runtime-dom (runtime-dom
 * already depends on runtime-core, so the reverse would be circular).
 * getDirective('for'|'if'|'show') will resolve to these entries, but their
 * hooks are no-ops; do not rely on this registry for actual for/if/show
 * behavior.
 */
export const BuiltinDirectives = {
  /**
   * For directive - keyed loop
   */
  For: {
    name: 'for',
    beforeMount(_el: HTMLElement, _binding: any) {
      // Not implemented here - see @teloce/runtime-dom's createFor.
    }
  },

  /**
   * If directive - conditional rendering
   */
  If: {
    name: 'if',
    beforeMount(_el: HTMLElement, _binding: any) {
      // Not implemented here - see @teloce/runtime-dom's createIf.
    }
  },

  /**
   * Show directive - show/hide
   */
  Show: {
    name: 'show',
    mounted(_el: HTMLElement, _binding: any) {
      // Not implemented here - see @teloce/runtime-dom's createShow.
    }
  }
};

// Register built-in directives
for (const [name, directive] of Object.entries(BuiltinDirectives)) {
  registerDirective(name.toLowerCase(), directive);
}