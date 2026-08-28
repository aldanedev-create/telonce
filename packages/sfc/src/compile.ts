/**
 * Main compile function - compiles a complete .vel file
 */

import { parseSFC, type SFCResult } from './parser';
import { compileScript, type ScriptCompileResult } from './script';
import { compileStyle, generateScopeId, scopeFromId, type StyleCompileResult } from './style';
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

const DEFAULT_COMPONENT_NAME = 'Component';

/**
 * Compile a Single File Component (.vel)
 */
export function compile(
  source: string,
  options: SFCCompileOptions = {}
): SFCCompileResult {
  const { filename = 'component.vel' } = options;
  const diagnostics = {
    errors: [] as string[],
    warnings: [] as string[],
  };

  // 1. Parse the SFC with matching options signature
  const sfc = parseSFC(source, { filename });

  // Whether ANY style block in this file needs scoping, used to decide
  // whether to compute a shared scope id at all. Individual blocks still
  // respect their own `scoped` attribute below - a global block among
  // several stays unscoped even if a sibling scoped block exists.
  // `scopedOption` (the external compile() option) no longer has any
  // effect here: every real <style> block's own `scoped` attribute is
  // read directly via sfc.styleBlocks (see parser/index.ts), so there's
  // nothing left for a single external flag to meaningfully override
  // once actual per-file attributes are always available - it only ever
  // mattered as a fallback for a hypothetical caller with no <style>
  // block to read from, which by definition has nothing to scope
  // anyway.
  const anyBlockScoped = sfc.styleBlocks.some((b) => b.scoped);

  // Compute ONE scope id shared by every scoped block in this file (and
  // used to stamp every element the template creates), from the
  // filename plus the combined text of all style blocks. This has to be
  // a single shared value, not one computed independently per block:
  // the template compiler stamps each element with exactly one scope
  // attribute, so if two scoped <style> blocks in the same file
  // computed different ids (e.g. from just their own, different, CSS
  // text), only one of them would ever actually match a rendered
  // element - the other's selectors would compile to valid CSS that
  // matches nothing, the same class of bug the very first scoped-CSS
  // fix (in an earlier commit) addressed for the single-block case.
  const combinedStyleText = sfc.styleBlocks.map((b) => b.content).join('\n');
  const scope =
    anyBlockScoped && sfc.styleBlocks.length > 0
      ? scopeFromId(generateScopeId(filename, combinedStyleText))
      : undefined;

  // 2. Compile the template
  const template = compileTemplate(sfc.template, {
    filename,
    sourceMap: options.sourceMap,
    minify: options.minify,
    dev: options.dev,
    target: options.target,
    scopeAttr: scope?.attribute,
  });

  // 3. Compile the script
  const script = compileScript(sfc.script, {
    filename,
    sourceMap: options.sourceMap,
    minify: options.minify,
    dev: options.dev,
    target: options.target,
    lang: sfc.scriptLang,
  });

  // 4. Compile the style block(s), each respecting its own `scoped`
  // attribute, and concatenate the results. Previously this only ever
  // looked at sfc.style (the first block) - any additional <style>
  // blocks in the file were silently dropped with no warning, and a
  // single component couldn't mix a scoped block with a global one at
  // all.
  let style: StyleCompileResult | undefined;
  if (sfc.styleBlocks.length > 0) {
    const compiledBlocks = sfc.styleBlocks.map((block) =>
      compileStyle(block.content, {
        filename,
        sourceMap: options.sourceMap,
        minify: options.minify,
        scoped: block.scoped,
        componentName: sfc.name || DEFAULT_COMPONENT_NAME,
        scope: block.scoped ? scope : undefined,
      })
    );

    style = {
      css: compiledBlocks.map((b) => b.css).join('\n'),
      scope: compiledBlocks.find((b) => b.scope)?.scope,
      diagnostics: {
        errors: compiledBlocks.flatMap((b) => b.diagnostics.errors),
        warnings: compiledBlocks.flatMap((b) => b.diagnostics.warnings),
      },
      map: compiledBlocks[0]?.map,
    };
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
    name: sfc.name || DEFAULT_COMPONENT_NAME,
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
  return safe || DEFAULT_COMPONENT_NAME;
}

/**
 * `template.code` (from @teloce/compiler's generate()) is a small, complete
 * module: some `import ... from '...'` lines followed by
 * `export function render(container, ctx) { ... }`. This used to be
 * spliced straight into `const template = ${template.code};`, which is
 * invalid JS the moment the value on the right of an `=` starts with an
 * `import` statement (imports are statements, not expressions) - this
 * pulls the import lines out to hoist them to the top of the generated SFC
 * module instead, and turns the exported function into a plain local
 * declaration the component definition can reference by name.
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
  const { name: rawName = DEFAULT_COMPONENT_NAME } = sfc;
  const { dev = false } = options;

  // Sanitize and escape component names for safe identifier usage
  const name = toValidIdentifier(rawName);
  const nameLiteral = JSON.stringify(rawName);

  const { imports: templateImports, functionCode: templateFnCode } = splitTemplateModule(template.code);

  let code = '';

  if (dev) {
    code += `// Compiled in development mode from ${sfc.name ? `component "${sfc.name}"` : 'an unnamed component'}\n`;
  }

  // Add imports (this component's own, plus whatever the compiled
  // template needs at runtime - createFor/createIf/etc, createEffect)
  code += `import { defineComponent } from '@teloce/core';\n`;
  for (const imp of templateImports) {
    if (!code.includes(imp)) {
      code += `${imp}\n`;
    }
  }

  // Note: script.code (the raw <script> block text) is intentionally NOT
  // included here. It's the author's original `export default {...}`
  // object verbatim - the pieces that actually matter (data/methods/
  // computed/lifecycle) are already pulled out separately via
  // script.exports below and used to build defineComponent({...})'s own
  // export default. Including the raw script text as well produced a
  // second `export default` in the same module, which is a hard
  // SyntaxError ("Identifier '.default' has already been declared").
  // Known limitation: any top-level code a user writes *outside* the
  // exported object in their <script> block (extra imports, standalone
  // helper functions) isn't preserved by this - compileScript doesn't
  // currently expose enough to safely re-include just that part.

  // Add template render function
  code += `\n${templateFnCode}\n`;

  // Add style
  if (style?.css) {
    code += `\nconst styles = ${JSON.stringify(style.css)};\n`;
  }

  // Define component securely with escaped identifier and string literal
  code += `\nexport const ${name} = defineComponent({\n`;
  code += `  name: ${nameLiteral},\n`;
  code += `  template: render,\n`;
  if (style?.css) {
    code += `  styles,\n`;
  }
  if (sfc.script) {
    // Extract exports from script. `props` was previously extracted
    // correctly by compileScript but never actually emitted here at
    // all - a component author writing `props: ['label', 'count']` (or
    // the object form) had it silently discarded, with the compiled
    // component definition never carrying any props field whatsoever.
    const exports = script.exports || {};
    if (exports.data) code += `  data: ${exports.data},\n`;
    if (exports.props) code += `  props: ${exports.props},\n`;
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