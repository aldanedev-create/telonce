/**
 * Tree-shaking - removes unused code from the bundle
 */

export interface TreeShakeOptions {
  /**
   * Enable aggressive tree-shaking
   */
  aggressive?: boolean;

  /**
   * Preserve side-effectful imports
   */
  preserveSideEffects?: boolean;

  /**
   * Entry modules
   */
  entries?: string[];

  /**
   * External modules to keep
   */
  external?: string[];
}

export interface TreeShakeResult {
  /**
   * Modules after tree-shaking
   */
  modules: ModuleInfo[];

  /**
   * Removed modules
   */
  removed: string[];

  /**
   * Removed size in bytes
   */
  removedSize: number;

  /**
   * Remaining size in bytes
   */
  remainingSize: number;
}

export interface ModuleInfo {
  /**
   * Module path
   */
  path: string;

  /**
   * Size in bytes
   */
  size: number;

  /**
   * Imports
   */
  imports: ImportInfo[];

  /**
   * Exports
   */
  exports: ExportInfo[];

  /**
   * Whether the module has side effects
   */
  hasSideEffects?: boolean;
}

export interface ImportInfo {
  /**
   * Module path
   */
  from: string;

  /**
   * Imported names
   */
  names: string[];

  /**
   * Whether it's a default import
   */
  isDefault?: boolean;

  /**
   * Whether it's a namespace import
   */
  isNamespace?: boolean;
}

export interface ExportInfo {
  /**
   * Exported name
   */
  name: string;

  /**
   * Local name
   */
  localName: string;

  /**
   * Whether it's a default export
   */
  isDefault?: boolean;
}

/**
 * Analyze imports in a module
 */
export function analyzeImports(code: string): ImportInfo[] {
  const imports: ImportInfo[] = [];
  
  // Match import statements
  const importRegex = /import\s+{?\s*([^}]+)\s*}?\s+from\s+['"]([^'"]+)['"]/g;
  let match: RegExpExecArray | null;
  
  while ((match = importRegex.exec(code)) !== null) {
    const names = match[1].split(',').map(s => s.trim());
    imports.push({
      from: match[2],
      names,
    });
  }

  // Match default imports
  const defaultRegex = /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g;
  while ((match = defaultRegex.exec(code)) !== null) {
    imports.push({
      from: match[2],
      names: ['default'],
      isDefault: true,
    });
  }

  // Match dynamic imports
  const dynamicRegex = /import\(['"]([^'"]+)['"]\)/g;
  while ((match = dynamicRegex.exec(code)) !== null) {
    imports.push({
      from: match[1],
      names: ['*'],
      isNamespace: true,
    });
  }

  return imports;
}

/**
 * Analyze exports in a module
 */
export function analyzeExports(code: string): ExportInfo[] {
  const exports: ExportInfo[] = [];

  // Match named exports
  const namedRegex = /export\s+{?\s*([^}]+)\s*}?\s*(?:from\s+['"]([^'"]+)['"])?/g;
  let match: RegExpExecArray | null;
  
  while ((match = namedRegex.exec(code)) !== null) {
    const names = match[1].split(',').map(s => s.trim());
    for (const name of names) {
      const parts = name.split(' as ');
      exports.push({
        name: parts[1] || parts[0],
        localName: parts[0],
      });
    }
  }

  // Match default exports
  const defaultRegex = /export\s+default\s+(\w+)/g;
  while ((match = defaultRegex.exec(code)) !== null) {
    exports.push({
      name: 'default',
      localName: match[1],
      isDefault: true,
    });
  }

  return exports;
}

/**
 * Remove unused code from a module
 */
export function removeUnused(
  code: string,
  usedExports: Set<string>
): string {
  // Remove unused exports
  const lines = code.split('\n');
  const result: string[] = [];

  for (const line of lines) {
    const exportMatch = line.match(/export\s+{?\s*([^}]+)\s*}?/);
    if (exportMatch) {
      const names = exportMatch[1].split(',').map(s => s.trim());
      const keep = names.filter(name => {
        const cleanName = name.split(' as ')[0].trim();
        return usedExports.has(cleanName);
      });
      if (keep.length > 0) {
        result.push(line);
      }
      continue;
    }

    const defaultMatch = line.match(/export\s+default\s+(\w+)/);
    if (defaultMatch) {
      if (usedExports.has('default') || usedExports.has(defaultMatch[1])) {
        result.push(line);
      }
      continue;
    }

    result.push(line);
  }

  return result.join('\n');
}

/**
 * Perform tree-shaking on modules
 *
 * NOTE: this is currently a simulated analysis, not real dead-code
 * elimination - `analyzeImports`/`analyzeExports`/`removeUnused` above are
 * fully implemented but never invoked here, so no code is actually removed
 * and every entry is reported as full-size regardless of content. This
 * fixes the signature (bundle.ts was already passing `options`, which
 * didn't exist as a parameter and failed to compile) and honors
 * `options.entries`/`options.external`, but the "shaking" itself is still
 * a placeholder pending real module-graph analysis.
 */
export function treeShake(entries: string | string[], options: TreeShakeOptions = {}): TreeShakeResult {
  const entryList = options.entries && options.entries.length > 0
    ? options.entries
    : Array.isArray(entries) ? entries : [entries];
  const external = new Set(options.external || []);
  const modules: ModuleInfo[] = [];
  const removed: string[] = [];
  let removedSize = 0;
  let remainingSize = 0;

  // Simulate module analysis
  for (const entry of entryList) {
    if (external.has(entry)) {
      continue;
    }
    // In practice, this would read and parse the module and run
    // analyzeImports/analyzeExports/removeUnused against the real module
    // graph; see the note above.
    modules.push({
      path: entry,
      size: 0,
      imports: [],
      exports: [],
      hasSideEffects: false,
    });
  }

  return {
    modules,
    removed,
    removedSize,
    remainingSize,
  };
}