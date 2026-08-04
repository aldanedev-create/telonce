/**
 * Script compiler - compiles the <script> section
 */

export interface ScriptCompileResult {
  /**
   * Compiled JavaScript code
   */
  code: string;

  /**
   * Exports from the script
   */
  exports: {
    data?: string;
    methods?: string;
    computed?: string;
    lifecycle?: Record<string, string>;
    props?: string;
  };

  /**
   * Source map (if enabled)
   */
  map?: string;

  /**
   * Diagnostics
   */
  diagnostics: {
    errors: string[];
    warnings: string[];
  };
}

export interface ScriptCompileOptions {
  /**
   * Filename for error reporting
   */
  filename?: string;

  /**
   * Enable source maps
   */
  sourceMap?: boolean;

  /**
   * Enable minification
   */
  minify?: boolean;

  /**
   * Development mode
   */
  dev?: boolean;

  /**
   * Target platform
   */
  target?: 'browser' | 'node' | 'esm';
}

/**
 * Compile the script section
 */
export function compileScript(
  source: string,
  options: ScriptCompileOptions = {}
): ScriptCompileResult {
  const diagnostics = {
    errors: [] as string[],
    warnings: [] as string[],
  };

  let code = source;
  const exports: ScriptCompileResult['exports'] = {};

  // Parse the script to extract exports
  try {
    // Extract data function
    const dataMatch = source.match(/data\s*\(\s*\)\s*{\s*return\s*({[\s\S]*?})\s*}/);
    if (dataMatch) {
      exports.data = `() => ${dataMatch[1]}`;
    }

    // Extract methods
    const methodsMatch = source.match(/methods:\s*({[\s\S]*?})\s*,?\s*\n\s*(?:computed|watch|created|mounted)/);
    if (methodsMatch) {
      exports.methods = methodsMatch[1];
    }

    // Extract computed
    const computedMatch = source.match(/computed:\s*({[\s\S]*?})\s*,?\s*\n\s*(?:methods|watch|created|mounted)/);
    if (computedMatch) {
      exports.computed = computedMatch[1];
    }

    // Extract lifecycle hooks
    const lifecycleHooks = ['created', 'mounted', 'updated', 'unmounted'];
    exports.lifecycle = {};
    for (const hook of lifecycleHooks) {
      const hookMatch = source.match(new RegExp(`${hook}\\s*\\(\\s*\\)\\s*{\\s*([\\s\\S]*?)\\s*}`));
      if (hookMatch) {
        exports.lifecycle[hook] = `function() { ${hookMatch[1].trim()} }`;
      }
    }

    // Extract props
    const propsMatch = source.match(/props:\s*({[\s\S]*?})\s*,?\s*\n/);
    if (propsMatch) {
      exports.props = propsMatch[1];
    }

  } catch (error) {
    diagnostics.errors.push(
      `Failed to parse script: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  // Minify if requested
  if (options.minify) {
    code = code
      .replace(/\s+/g, ' ')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
      .trim();
  }

  return {
    code,
    exports,
    diagnostics,
  };
}