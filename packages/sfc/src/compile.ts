/**
 * Main compile function - compiles a complete .vel file
 */

import { parseSFC, type SFCResult } from './parser';
import { compileScript, type ScriptCompileResult } from './script';
import { compileStyle, type StyleCompileResult } from './style';
import { compileTemplate, type TemplateCompileResult } from './template';

export interface SFCCompileOptions {
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

  /**
   * Scoped CSS
   */
  scoped?: boolean;
}

export interface SFCCompileResult {
  /**
   * Compiled JavaScript code
   */
  code: string;

  /**
   * Compiled CSS (if any)
   */
  css?: string;

  /**
   * Source map (if enabled)
   */
  map?: string;

  /**
   * Component name
   */
  name: string;

  /**
   * Parsed SFC result
   */
  sfc: SFCResult;

  /**
   * Compiled script result
   */
  script: ScriptCompileResult;

  /**
   * Compiled style result
   */
  style?: StyleCompileResult;

  /**
   * Compiled template result
   */
  template: TemplateCompileResult;

  /**
   * Diagnostics
   */
  diagnostics: {
    errors: string[];
    warnings: string[];
  };
}

/**
 * Compile a Single File Component (.vel)
 */
export function compile(
  source: string,
  options: SFCCompileOptions = {}
): SFCCompileResult {
  const { filename = 'component.vel', scoped = false } = options;
  const diagnostics = {
    errors: [] as string[],
    warnings: [] as string[],
  };

  // 1. Parse the SFC
  const sfc = parseSFC(source, { filename });
  
  // 2. Compile the template
  const template = compileTemplate(sfc.template, {
    filename,
    sourceMap: options.sourceMap,
    minify: options.minify,
    dev: options.dev,
    target: options.target,
  });

  // 3. Compile the script
  const script = compileScript(sfc.script, {
    filename,
    sourceMap: options.sourceMap,
    minify: options.minify,
    dev: options.dev,
    target: options.target,
  });

  // 4. Compile the style (if any)
  let style: StyleCompileResult | undefined;
  if (sfc.style) {
    style = compileStyle(sfc.style, {
      filename,
      sourceMap: options.sourceMap,
      minify: options.minify,
      scoped,
      componentName: sfc.name || 'component',
    });
  }

  // 5. Combine diagnostics
  diagnostics.errors.push(
    ...sfc.diagnostics.errors,
    ...template.diagnostics.errors,
    ...script.diagnostics.errors,
    ...(style?.diagnostics.errors || [])
  );
  diagnostics.warnings.push(
    ...sfc.diagnostics.warnings,
    ...template.diagnostics.warnings,
    ...script.diagnostics.warnings,
    ...(style?.diagnostics.warnings || [])
  );

  // 6. Generate final code
  const code = generateCode(sfc, script, template, style, options);

  // 7. Generate CSS
  const css = style?.css;

  return {
    code,
    css,
    name: sfc.name || 'component',
    sfc,
    script,
    template,
    style,
    diagnostics,
  };
}

/**
 * Turn an arbitrary (possibly user-authored) string into a safe JS
 * identifier: strip characters that aren't valid in an identifier, and
 * ensure it doesn't start with a digit.
 */
function toValidIdentifier(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9_$]/g, '');
  const safe = /^[0-9]/.test(cleaned) ? `_${cleaned}` : cleaned;
  return safe || 'Component';
}

/**
 * Generate final JavaScript code
 */
function generateCode(
  sfc: SFCResult,
  script: ScriptCompileResult,
  template: TemplateCompileResult,
  style: StyleCompileResult | undefined,
  options: SFCCompileOptions
): string {
  const { name: rawName = 'Component' } = sfc;
  const { dev = false } = options;

  // `rawName` comes from user-authored source (a `name:` field extracted
  // from the component's <script> block) and was previously spliced
  // directly into both a JS identifier position (`export const ${name}`)
  // and a quoted string literal (`name: '${name}'`) with no validation or
  // escaping - a name containing a space/hyphen/quote would produce
  // invalid or, worse, injectable generated code. Sanitize both uses.
  const name = toValidIdentifier(rawName);
  const nameLiteral = JSON.stringify(rawName);

  let code = '';

  if (dev) {
    code += `// Compiled in development mode from ${sfc.name ? `component "${sfc.name}"` : 'an unnamed component'}\n`;
  }

  // Add imports
  code += `import { defineComponent } from '@teloce/core';\n`;

  // Add script content
  if (script.code) {
    code += `\n${script.code}\n`;
  }

  // Add template
  code += `\nconst template = ${template.code};\n`;

  // Add style
  if (style?.css) {
    code += `\nconst styles = ${JSON.stringify(style.css)};\n`;
  }

  // Define component
  code += `\nexport const ${name} = defineComponent({\n`;
  code += `  name: ${nameLiteral},\n`;
  code += `  template,\n`;
  if (style?.css) {
    code += `  styles,\n`;
  }
  if (sfc.script) {
    // Extract exports from script
    const exports = script.exports || {};
    if (exports.data) code += `  data: ${exports.data},\n`;
    if (exports.methods) code += `  methods: ${exports.methods},\n`;
    if (exports.computed) code += `  computed: ${exports.computed},\n`;
    if (exports.lifecycle) {
      for (const [hook, fn] of Object.entries(exports.lifecycle)) {
        code += `  ${hook}: ${fn},\n`;
      }
    }
  }
  code += `});\n`;

  // Export default
  code += `\nexport default ${name};\n`;

  return code;
}