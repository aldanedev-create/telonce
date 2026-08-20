/**
 * @teloce/vite-plugin - Vite plugin for Teloce
 * 
 * This plugin compiles .vel Single File Components and Teloce templates
 * for use with Vite-based projects.
 * 
 * Features:
 * - Compile .vel SFC files
 * - Hot Module Replacement (HMR) support
 * - TypeScript support for script sections
 * - Scoped CSS support
 * - Custom directives and filters
 */

import type { Plugin, ResolvedConfig } from 'vite';
import { compile as compileSFC } from '@teloce/sfc';
import { compile as compileTemplate } from '@teloce/compiler';
import * as path from 'path';

export interface TelocePluginOptions {
    /**
   * Include patterns for template files. Plain strings are matched as a
   * literal substring/suffix of the file path (not a glob) - pass a
   * RegExp if you need real glob-style matching.
   * @default ['.teloce', '.vel']
   */
  include?: string | RegExp | (string | RegExp)[];

    /**
   * Exclude patterns for template files. Same matching rules as `include`
   * - plain strings are a literal substring/suffix check, not a glob.
   * @default ['node_modules', 'dist']
   */
  exclude?: string | RegExp | (string | RegExp)[];

  /**
   * Enable source maps
   * @default true
   */
  sourceMap?: boolean;

  /**
   * Enable minification
   * @default false (development) / true (production)
   */
  minify?: boolean;

  /**
   * Development mode
   * @default process.env.NODE_ENV === 'development'
   */
  dev?: boolean;

  /**
   * Enable scoped CSS
   * @default true
   */
  scoped?: boolean;

  /**
   * Custom plugins
   * @default []
   */
  plugins?: Array<{
    name: string;
    transform?: (code: string, id: string) => string | null;
    compile?: (sfc: any) => any;
  }>;

  /**
   * Custom directives
   * @default []
   */
  directives?: Array<{
    name: string;
    transform: (node: any, context: any) => any;
  }>;

  /**
   * Custom filters
   * @default []
   */
  filters?: Array<{
    name: string;
    transform: (value: any, ...args: any[]) => any;
  }>;
}

/**
 * Default options
 */
const defaultOptions: TelocePluginOptions = {
  include: ['.teloce', '.vel'],
  exclude: ['node_modules', 'dist'],
  sourceMap: true,
  minify: process.env.NODE_ENV === 'production',
  dev: process.env.NODE_ENV === 'development',
  scoped: true,
  plugins: [],
  directives: [],
  filters: [],
};

/**
 * Vite plugin for Teloce
 */
export default function telocePlugin(
  options: TelocePluginOptions = {}
): Plugin {
  const opts = { ...defaultOptions, ...options };
  let config: ResolvedConfig;

  // Normalize include/exclude patterns and filter out undefined values
  // (opts.include/opts.exclude are optional, so `[opts.include]` could be
  // `[undefined]` when the option was never set - that's what made
  // `pattern` possibly-undefined below, even though a plain array is
  // never actually passed containing `undefined` in practice).
  const includePatterns = (Array.isArray(opts.include) ? opts.include : [opts.include])
    .filter((p): p is string | RegExp => p !== undefined);
  const excludePatterns = (Array.isArray(opts.exclude) ? opts.exclude : [opts.exclude])
    .filter((p): p is string | RegExp => p !== undefined);

  return {
    name: 'teloce',
    enforce: 'pre' as const,

    configResolved(resolvedConfig: ResolvedConfig) {
      config = resolvedConfig;
    },

    /**
     * Transform .vel and .teloce files
     */
    // 👈 REPLACE THE EXISTING transform METHOD HERE
    transform(code: string, id: string) {
      const shouldProcess = includePatterns.some(pattern => {
        if (typeof pattern === 'string') {
          return id.includes(pattern) || id.endsWith(pattern);
        }
        return pattern.test(id);
      });

      if (!shouldProcess) return null;

      const shouldExclude = excludePatterns.some(pattern => {
        if (typeof pattern === 'string') {
          return id.includes(pattern) || id.endsWith(pattern);
        }
        return pattern.test(id);
      });

      if (shouldExclude) return null;

      const isSFC = id.endsWith('.vel');

      try {
        if (isSFC) {
          return compileSFCFile(code, id, opts, config);
        } else {
          return compileTemplateFile(code, id, opts, config);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.error(`[teloce] Failed to compile ${id}: ${message}`);
      }
    },

    /**
     * Handle HMR for .vel files
     */
    handleHotUpdate({ file, server }: any) {
      if (file.endsWith('.vel')) {
        // Send HMR update
        server.ws.send({
          type: 'update',
          updates: [
            {
              type: 'update',
              path: file,
              acceptedPath: file,
              timestamp: Date.now(),
            },
          ],
        });
      }
    },
  };
}

/**
 * Compile a Single File Component (.vel)
 */function compileSFCFile(
  code: string,
  id: string,
  opts: TelocePluginOptions,
  _config: ResolvedConfig
): { code: string; map?: string } {
  const result = compileSFC(code, {
    filename: path.basename(id),
    sourceMap: opts.sourceMap,
    minify: opts.minify,
    dev: opts.dev,
    scoped: opts.scoped,
  });

  let finalCode = result.code;
  if (opts.plugins) {
    for (const plugin of opts.plugins) {
      if (plugin.transform) {
        const transformed = plugin.transform(finalCode, id);
        if (transformed) {
          finalCode = transformed;
        }
      }
    }
  }

  return {
    code: finalCode,
    map: result.map,
  };
}

/**
 * Compile a template file (.teloce)
 */
/**
 * `compileTemplate`'s result.code is a small, complete module - some
 * `import ... from '...'` lines followed by
 * `export function render(container, ctx) { ... }`. It was previously
 * spliced straight into `return ${result.code};`, which is invalid JS the
 * moment the "returned" value starts with an `import` statement (imports
 * are statements, not expressions) - exactly the same bug this had in
 * @teloce/sfc's compile.ts before it was fixed there. Pulls the import
 * lines out to hoist them to the top of the wrapping module instead, and
 * turns the exported function into a plain local declaration that the
 * wrapper can reference by name.
 */
function splitTemplateModule(code: string): { imports: string[]; functionCode: string } {
  const imports: string[] = [];
  const rest: string[] = [];
  for (const line of code.split('\n')) {
    if (/^\s*import\s.+from\s+['"].+['"];?\s*$/.test(line)) {
      imports.push(line.trim());
    } else {
      rest.push(line);
    }
  }
  const functionCode = rest.join('\n').replace(/export\s+function\s+render/, 'function render');
  return { imports, functionCode };
}
function compileTemplateFile(
  code: string,
  id: string,
  opts: TelocePluginOptions,
  _config: ResolvedConfig
): { code: string; map?: string } {
  const result = compileTemplate(code, {
    filename: path.basename(id),
    sourceMap: opts.sourceMap,
    minify: opts.minify,
    dev: opts.dev,
  });

  const { imports, functionCode } = splitTemplateModule(result.code);

  const jsCode = `
// Teloce template compiled from ${path.basename(id)}
${imports.join('\n')}
${functionCode}
export default render;
`;

  return {
    code: jsCode,
    map: result.map,
  };
}
/**
 * Virtual module for Teloce runtime
 */
export function teloceRuntime() {
  return {
    name: 'teloce:runtime',
    resolveId(id: string) {
      if (id === 'virtual:teloce-runtime') {
        return '\0virtual:teloce-runtime';
      }
      return null;
    },
    load(id: string) {
      if (id === '\0virtual:teloce-runtime') {
        return `
// Teloce Runtime
import { createApp } from '@teloce/core';
import { createSignal, createEffect } from '@teloce/reactivity';

export { createApp, createSignal, createEffect };
`;
      }
      return null;
    },
  };
}