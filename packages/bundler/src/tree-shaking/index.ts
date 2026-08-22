/**
 * Tree-shaking - removes unused code from the bundle using import/export graph analysis
 */

import * as fs from 'fs';

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

  /**
   * The module's final source code, after dead-code elimination. Was
   * previously computed (as `prunedCode`, right where finalSize/diff are
   * derived below) and then thrown away - only the resulting *size* made
   * it into ModuleInfo, not the code itself. That meant bundle() (in
   * ../bundle.ts) had no real source to work with for any entry that went
   * through tree-shaking: `teloce build` would report success while
   * writing out empty files, since there was nowhere left for real
   * bundled content to come from.
   */
  code?: string;
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
  const lines = code.split('\n');
  const result: string[] = [];

  for (const line of lines) {
    // Only treat this as a named-export-list line (`export { a, b, c };`,
    // optionally `... from '...'`) when `{` immediately follows `export`
    // (whitespace aside). The previous regex, `export\s+{?\s*([^}]+)\s*}?`,
    // made that opening brace optional - so it also matched
    // `export function foo() {`, `export const x = 1;`, `export default
    // foo;`, `export class Foo {`, etc., capturing everything after
    // `export` as if it were a comma-separated name list. None of those
    // names were ever in `usedExports` (real identifiers there don't
    // include literal text like "function foo() {"), so `keep` came back
    // empty and the *entire line* got dropped - including just the
    // declaration's opening line, since this function only ever looks at
    // one line at a time. For a multi-line `export function`/`export
    // class` body, that left every line after the (now-missing) opening
    // line still in the output: a dangling function body with no
    // signature, invalid JavaScript. This codebase has no real per-line
    // brace-matching here (unlike the SFC compiler's findMatchingBrace),
    // so rather than attempt to correctly strip a whole multi-line
    // declaration textually, exports other than the `export { ... }` list
    // form are now always kept - accepting some unremoved dead code as
    // the trade-off for never emitting broken syntax.
    const exportMatch = line.match(/^\s*export\s*\{\s*([^}]*)\s*\}/);
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
 * Perform actual tree-shaking and dead-code elimination on modules
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

  const visited = new Set<string>();
  const queue: string[] = [...entryList];
  const moduleCodes = new Map<string, string>();

  function getModuleCode(filePath: string): string {
    if (moduleCodes.has(filePath)) return moduleCodes.get(filePath)!;
    let code = '';
    try {
      if (typeof fs !== 'undefined' && fs.existsSync && fs.existsSync(filePath)) {
        code = fs.readFileSync(filePath, 'utf-8');
      } else {
        code = `// Module: ${filePath}\nexport const exportedValue = 42;\nexport function unusedHelper() { return 'unused'; }\n`;
      }
    } catch {
      code = `// Fallback code for ${filePath}\nexport const data = true;\n`;
    }
    moduleCodes.set(filePath, code);
    return code;
  }

  const activeModules: { path: string; code: string; imports: ImportInfo[]; exports: ExportInfo[]; originalLen: number }[] = [];

  while (queue.length > 0) {
    const currentPath = queue.shift()!;
    if (visited.has(currentPath) || external.has(currentPath)) continue;
    visited.add(currentPath);

    const code = getModuleCode(currentPath);
    const originalLen = code.length;
    const imports = analyzeImports(code);
    const exports = analyzeExports(code);

    activeModules.push({ path: currentPath, code, imports, exports, originalLen });

    for (const imp of imports) {
      let resolvedPath = imp.from;
      if (resolvedPath.startsWith('.')) {
        const lastSlash = currentPath.lastIndexOf('/');
        const dir = lastSlash !== -1 ? currentPath.slice(0, lastSlash) : '.';
        resolvedPath = `${dir}/${resolvedPath}`.replace(/\/\.\//g, '/');
      }
      if (!visited.has(resolvedPath) && !external.has(resolvedPath)) {
        queue.push(resolvedPath);
      }
    }
  }

  const usedExportsMap = new Map<string, Set<string>>();

  for (const entry of entryList) {
    if (!usedExportsMap.has(entry)) {
      usedExportsMap.set(entry, new Set());
    }
    const mod = activeModules.find(m => m.path === entry);
    if (mod) {
      for (const exp of mod.exports) {
        usedExportsMap.get(entry)!.add(exp.name);
      }
    }
  }

  let changed = true;
  let iterations = 0;
  while (changed && iterations < 10) {
    changed = false;
    iterations++;
    for (const mod of activeModules) {
      for (const imp of mod.imports) {
        let resolvedPath = imp.from;
        if (resolvedPath.startsWith('.')) {
          const lastSlash = mod.path.lastIndexOf('/');
          const dir = lastSlash !== -1 ? mod.path.slice(0, lastSlash) : '.';
          resolvedPath = `${dir}/${resolvedPath}`.replace(/\/\.\//g, '/');
        }
        if (!usedExportsMap.has(resolvedPath)) {
          usedExportsMap.set(resolvedPath, new Set());
        }
        const targetUsed = usedExportsMap.get(resolvedPath)!;
        const beforeSize = targetUsed.size;
        
        if (imp.names.includes('*')) {
          const targetMod = activeModules.find(m => m.path === resolvedPath);
          if (targetMod) {
            for (const exp of targetMod.exports) {
              targetUsed.add(exp.name);
            }
          }
        } else {
          for (const name of imp.names) {
            targetUsed.add(name);
          }
        }
        if (targetUsed.size > beforeSize) {
          changed = true;
        }
      }
    }
  }

  for (const mod of activeModules) {
    const usedNames = usedExportsMap.get(mod.path) || new Set();
    const isEntry = entryList.includes(mod.path);
    const hasSideEffects = options.preserveSideEffects !== false && (
      mod.code.includes('console.') || mod.code.includes('window.') || !mod.code.includes('export')
    );

    if (!isEntry && usedNames.size === 0 && !hasSideEffects && options.aggressive) {
      removed.push(mod.path);
      removedSize += mod.originalLen;
      continue;
    }

    const prunedCode = removeUnused(mod.code, usedNames);
    const finalSize = prunedCode.length;
    const diff = mod.originalLen - finalSize;
    if (diff > 0) {
      removedSize += diff;
    }

    modules.push({
      path: mod.path,
      size: finalSize,
      imports: mod.imports,
      exports: mod.exports,
      hasSideEffects,
      code: prunedCode,
    });
    remainingSize += finalSize;
  }

  return {
    modules,
    removed,
    removedSize,
    remainingSize,
  };
}