/**
 * Teloce configuration
 */
export interface TeloceConfig {
  /**
   * Development mode
   */
  dev: boolean;

  /**
   * Debug mode
   */
  debug: boolean;

  /**
   * Performance monitoring
   */
  performance: boolean;

  /**
   * Strict mode
   */
  strict: boolean;

  /**
   * Component registry
   */
  components: Map<string, any>;

  /**
   * Plugin registry
   */
  plugins: Map<string, any>;

  /**
   * Custom directives
   */
  directives: Map<string, any>;

  /**
   * Global state
   */
  state: Record<string, any>;
}

/**
 * Default configuration
 */
export const defaultConfig: TeloceConfig = {
  // `process` isn't a real global in browsers - only Node, and bundlers
  // that specifically shim it in (many do, for compatibility, which is
  // why this wasn't obviously broken in every context it was tested in -
  // but it's not guaranteed, and the raw, unreplaced `process.env`
  // reference was confirmed present as-is in this package's own published
  // dist output). `typeof process !== 'undefined'` is safe even when
  // `process` was never declared at all: `typeof` on an undeclared
  // identifier returns "undefined" rather than throwing, unlike directly
  // referencing `process.env.NODE_ENV` would.
  dev: typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development',
  debug: false,
  performance: false,
  strict: true,
  components: new Map(),
  plugins: new Map(),
  directives: new Map(),
  state: {},
};

/**
 * Create a configuration
 */
export function createConfig(options: Partial<TeloceConfig> = {}): TeloceConfig {
  return {
    ...defaultConfig,
    ...options,
  };
}

/**
 * Merge configurations
 */
export function mergeConfigs(
  base: TeloceConfig,
  override: Partial<TeloceConfig>
): TeloceConfig {
  return {
    ...base,
    ...override,
    components: new Map([...base.components, ...(override.components || [])]),
    plugins: new Map([...base.plugins, ...(override.plugins || [])]),
    directives: new Map([...base.directives, ...(override.directives || [])]),
    state: { ...base.state, ...(override.state || {}) },
  };
}