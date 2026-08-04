/**
 * Source Map - generates source maps for debugging
 * 
 * This module creates source maps that map generated JavaScript
 * back to the original template source.
 */

export interface SourceMap {
  version: number;
  file: string;
  sources: string[];
  sourcesContent: string[];
  names: string[];
  mappings: string;
}

export interface SourceMapOptions {
  file?: string;
  sourceRoot?: string;
  sources?: string[];
  sourcesContent?: string[];
}

/**
 * Generate a source map
 */
export function generateSourceMap(
  generated: string,
  source: string,
  options: SourceMapOptions = {}
): SourceMap {
  const lines = generated.split('\n');
  const sourceLines = source.split('\n');
  const mappings: string[] = [];

  // Generate simple mappings (line-based)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i < sourceLines.length) {
      // Map each line to the source
      mappings.push(`${i}:${0} => ${i}:${0}`);
    }
  }

  return {
    version: 3,
    file: options.file || 'output.js',
    sources: options.sources || ['input.teloce'],
    sourcesContent: options.sourcesContent || [source],
    names: [],
    mappings: mappings.join(';'),
  };
}

/**
 * Create a source map from an AST
 */
export function fromAST(
  ast: any,
  source: string,
  options: SourceMapOptions = {}
): SourceMap {
  // Find all positions in the AST
  const positions: { line: number; column: number; name: string }[] = [];

  function walk(node: any) {
    if (!node) return;
    if (node.line !== undefined && node.column !== undefined) {
      positions.push({
        line: node.line,
        column: node.column,
        name: node.type || 'unknown',
      });
    }
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        walk(child);
      }
    }
    if (node.children && typeof node.children === 'object') {
      for (const key of Object.keys(node.children)) {
        walk(node.children[key]);
      }
    }
  }

  walk(ast);

  // Generate mappings from positions
  const mappings: string[] = [];
  let lastLine = 0;
  let lastColumn = 0;

  for (const pos of positions) {
    const generatedLine = pos.line - 1;
    const generatedColumn = pos.column - 1;

    // VLQ encode the mapping
    const mapping = `${generatedLine},${generatedColumn},${lastLine},${lastColumn},${pos.name}`;
    mappings.push(mapping);

    lastLine = generatedLine;
    lastColumn = generatedColumn;
  }

  return {
    version: 3,
    file: options.file || 'output.js',
    sources: options.sources || ['input.teloce'],
    sourcesContent: options.sourcesContent || [source],
    names: [],
    mappings: mappings.join(';'),
  };
}

/**
 * Convert a source map to a base64 string
 */
export function toBase64(map: SourceMap): string {
  return Buffer.from(JSON.stringify(map)).toString('base64');
}

/**
 * Convert a source map to a data URL
 */
export function toDataURL(map: SourceMap): string {
  return `data:application/json;charset=utf-8;base64,${toBase64(map)}`;
}

/**
 * Get mapping for a position
 */
export function getMapping(
  map: SourceMap,
  line: number,
  column: number
): { source: string; line: number; column: number } | null {
  // Simple implementation - find the closest mapping
  const mappings = map.mappings.split(';');
  for (const mapping of mappings) {
    const parts = mapping.split(',');
    if (parts.length >= 4) {
      const genLine = parseInt(parts[0]);
      const genCol = parseInt(parts[1]);
      if (genLine === line && genCol <= column) {
        return {
          source: map.sources[0] || 'unknown',
          line: parseInt(parts[2]) || 0,
          column: parseInt(parts[3]) || 0,
        };
      }
    }
  }
  return null;
}