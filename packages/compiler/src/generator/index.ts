export interface GenerateOptions {
  minify?: boolean;
  target?: 'browser' | 'node' | 'esm';
  dev?: boolean;
  format?: 'iife' | 'esm' | 'cjs';
}

export interface GenerateResult {
  code: string;
  map?: string;
  imports: string[];
  exports: string[];
}

export function generate(ast: any[], _options: GenerateOptions = {}): GenerateResult {
  const code = ast.map(node => JSON.stringify(node)).join('\n');
  return {
    code,
    imports: [],
    exports: [],
  };
}
