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
  dev: process.env.NODE_ENV === 'development',
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