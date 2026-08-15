import { ASTNodeType, type ASTNode, type ElementNode, type TextNode, type InterpolationNode, type ForNode, type IfNode, type ShowHideNode } from '../parser';

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

interface GenCtx {
  varCounter: number;
  exprCounter: number;
  needsRuntimeDom: Set<string>;
  needsReactivity: Set<string>;
  needsFilters: boolean;
}

function nextVar(ctx: GenCtx, prefix = 'el'): string {
  ctx.varCounter += 1;
  return `${prefix}${ctx.varCounter}`;
}

/**
 * Emit a declaration for a function that evaluates `expr` (a raw expression
 * string taken directly from the template, e.g. "user.name" or
 * "count > 0") against whatever `ctx` object is in scope where it's later
 * called, so bare identifiers like `user`/`count` resolve to
 * `ctx.user`/`ctx.count` without the template author writing `ctx.`
 * everywhere. Built with `new Function` (a real, independent function body)
 * rather than a `with (ctx) { ... }` statement inlined directly into the
 * generated module, since `with` is a SyntaxError anywhere inside an ES
 * module (modules are always strict mode) - but the body of a
 * `new Function(...)` is its own, separately-parsed, non-strict scope, so
 * `with` is legal *inside* the string passed to `new Function`.
 *
 * This intentionally does not depend on this package's own hand-rolled
 * expression parser (see ../parser/expressions) - that parser has known
 * gaps (no operator precedence, no `>=`/`<=`, breaks on member access
 * combined with an operator, etc.) documented separately; expressions are
 * evaluated as real JS here instead of being re-interpreted by a partial
 * parser.
 */
/**
 * Split an expression on top-level `|` characters (i.e. actual filter-pipe
 * separators), while correctly leaving alone: `||` (logical OR), `|`
 * inside string/template literals (e.g. a filter argument like
 * `join(items, '|')`), and `|` inside nested parens/brackets.
 */
function splitTopLevelPipes(expr: string): string[] {
  const parts: string[] = [];
  let current = '';
  let quote: string | null = null;
  let depth = 0;

  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];

    if (quote) {
      current += ch;
      if (ch === quote && expr[i - 1] !== '\\') quote = null;
      continue;
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      current += ch;
      continue;
    }

    if (ch === '(' || ch === '[') {
      depth++;
      current += ch;
      continue;
    }

    if (ch === ')' || ch === ']') {
      depth--;
      current += ch;
      continue;
    }

    if (ch === '|' && depth === 0) {
      if (expr[i + 1] === '|') {
        // logical OR - not a filter separator, keep as part of this segment
        current += '||';
        i++;
        continue;
      }
      parts.push(current);
      current = '';
      continue;
    }

    current += ch;
  }

  parts.push(current);
  return parts.map(p => p.trim());
}

/** Parse a filter-chain segment like `truncate` or `truncate(20, '...')` into its name and raw argument text. */
function parseFilterSegment(segment: string): { name: string; args: string } {
  const match = segment.match(/^([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?:\((.*)\))?$/s);
  if (!match) {
    return { name: segment.trim(), args: '' };
  }
  return { name: match[1], args: match[2] || '' };
}

/**
 * Rewrite `expr | filterA | filterB(arg)` into nested `__applyFilter(...)`
 * calls, e.g. `__applyFilter(__applyFilter(expr, 'filterA'), 'filterB', arg)`.
 * `__applyFilter` is a helper (see generate()) that looks a filter up by
 * name from @teloce/std's registry and calls it as `fn(value, ...args)`.
 *
 * Previously `|` in an interpolation was left completely unhandled - the
 * whole expression, pipe and all, was evaluated as raw JS, where `|` is
 * the *bitwise OR* operator. `{{ product.price | currency }}` would
 * evaluate `product.price | currency` as a bitwise OR between a number and
 * whatever `currency` happened to resolve to (usually a ReferenceError,
 * since `currency` isn't a real identifier in scope) - filters never
 * actually ran, despite @teloce/std shipping 30+ real filter functions.
 *
 * Returns the expression unchanged if it contains no top-level `|`, so
 * this can't change behavior for any expression that isn't using filters.
 */
function rewriteFilterChain(expr: string): { rewritten: string; usesFilters: boolean } {
  const segments = splitTopLevelPipes(expr);
  if (segments.length <= 1) {
    return { rewritten: expr, usesFilters: false };
  }

  let result = segments[0];
  for (let i = 1; i < segments.length; i++) {
    const { name, args } = parseFilterSegment(segments[i]);
    const argsSuffix = args.trim() ? `, ${args}` : '';
    result = `__applyFilter(${result}, ${JSON.stringify(name)}${argsSuffix})`;
  }
  return { rewritten: result, usesFilters: true };
}

function emitExpressionEvaluator(ctx: GenCtx, expr: string): { decl: string; varName: string; callArgs: string } {
  ctx.exprCounter += 1;
  const varName = `__expr${ctx.exprCounter}`;
  const trimmed = expr.trim() || 'undefined';
  const { rewritten, usesFilters } = rewriteFilterChain(trimmed);
  const safeExpr = rewritten || 'undefined';

  if (usesFilters) {
    ctx.needsFilters = true;
    const decl = `const ${varName} = new Function('ctx', '__applyFilter', 'with (ctx) { return (' + ${JSON.stringify(safeExpr)} + ') }');`;
    return { decl, varName, callArgs: 'ctx, __applyFilter' };
  }

  const decl = `const ${varName} = new Function('ctx', 'with (ctx) { return (' + ${JSON.stringify(safeExpr)} + ') }');`;
  return { decl, varName, callArgs: 'ctx' };
}

/**
 * Generate code for one AST node, appending statements to `out`. Nested
 * <for> bodies generate their own `ctx` local (shadowing the outer one) so
 * expression evaluators called inside them naturally pick up loop-item
 * scope through normal JS closure/shadowing rules, without any string
 * rewriting.
 */
function genNode(node: ASTNode, parentVar: string, out: string[], ctx: GenCtx): void {
  switch (node.type) {
    case ASTNodeType.Element: {
      const el = node as ElementNode;
      const varName = nextVar(ctx);
      out.push(`const ${varName} = document.createElement(${JSON.stringify(el.tag)});`);
      for (const [attrName, attrValue] of Object.entries(el.attributes)) {
        genAttribute(varName, attrName, attrValue, out, ctx);
      }
      for (const child of el.children) {
        genNode(child, varName, out, ctx);
      }
      out.push(`${parentVar}.appendChild(${varName});`);
      return;
    }

    case ASTNodeType.Text: {
      const text = node as TextNode;
      const varName = nextVar(ctx);
      out.push(`const ${varName} = document.createTextNode(${JSON.stringify(text.value)});`);
      out.push(`${parentVar}.appendChild(${varName});`);
      return;
    }

    case ASTNodeType.Interpolation: {
      const interp = node as InterpolationNode;
      const varName = nextVar(ctx);
      out.push(`const ${varName} = document.createTextNode('');`);
      const { decl, varName: exprVar, callArgs } = emitExpressionEvaluator(ctx, interp.value);
      out.push(decl);
      ctx.needsReactivity.add('createEffect');
      out.push(`createEffect(() => { ${varName}.textContent = String(${exprVar}(${callArgs}) ?? ''); });`);
      out.push(`${parentVar}.appendChild(${varName});`);
      return;
    }

    case ASTNodeType.If: {
      const ifNode = node as IfNode;
      const { decl: condDecl, varName: condVar, callArgs: condCallArgs } = emitExpressionEvaluator(ctx, ifNode.condition);
      out.push(condDecl);

      const trueBody: string[] = [];
      const trueRootVar = nextVar(ctx, 'branchRoot');
      trueBody.push(`const ${trueRootVar} = document.createDocumentFragment();`);
      for (const child of ifNode.children) {
        genNode(child, trueRootVar, trueBody, ctx);
      }
      trueBody.push(`return ${trueRootVar}.firstChild || document.createComment('');`);

      let falseBody = `return document.createComment('');`;
      if (ifNode.elseChildren && ifNode.elseChildren.length > 0) {
        const falseStatements: string[] = [];
        const falseRootVar = nextVar(ctx, 'branchRoot');
        falseStatements.push(`const ${falseRootVar} = document.createDocumentFragment();`);
        for (const child of ifNode.elseChildren) {
          genNode(child, falseRootVar, falseStatements, ctx);
        }
        falseStatements.push(`return ${falseRootVar}.firstChild || document.createComment('');`);
        falseBody = falseStatements.join('\n');
      }

      ctx.needsRuntimeDom.add('createIf');
      out.push(
        `createIf(${parentVar}, () => Boolean(${condVar}(${condCallArgs})), () => {\n${indent(trueBody.join('\n'))}\n}, () => {\n${indent(falseBody)}\n});`
      );
      return;
    }

    case ASTNodeType.For: {
      const forNode = node as ForNode;
      const { decl: itemsDecl, varName: itemsVar, callArgs: itemsCallArgs } = emitExpressionEvaluator(ctx, forNode.collection);
      out.push(itemsDecl);

      const renderBody: string[] = [];
      const itemRootVar = nextVar(ctx, 'itemRoot');
      // Shadow `ctx` for the loop body only: expression evaluators inside
      // the loop's children call `${exprVar}(ctx)`, and thanks to normal
      // JS scoping that resolves to *this* local `ctx`, not the outer one.
      renderBody.push(
        `const ctx = Object.assign(Object.create(__outerCtx), { ${JSON.stringify(forNode.item)}: __item, index: __index });`
      );
      renderBody.push(`const ${itemRootVar} = document.createDocumentFragment();`);
      for (const child of forNode.children) {
        genNode(child, itemRootVar, renderBody, ctx);
      }
      renderBody.push(`return ${itemRootVar}.firstChild || document.createComment('');`);

      const keyFn = forNode.key
        ? `(__item) => String(__item && __item[${JSON.stringify(forNode.key)}])`
        : `(__item, __index) => String(__index)`;

      ctx.needsRuntimeDom.add('createFor');
      out.push(
        `(function (__outerCtx) {\n` +
          `${indent(`createFor(${parentVar}, () => ${itemsVar}(${itemsCallArgs}), function (__item, __index) {\n${indent(renderBody.join('\n'))}\n}, ${keyFn});`)}\n` +
          `})(ctx);`
      );
      return;
    }

    case ASTNodeType.Show:
    case ASTNodeType.Hide: {
      const showHide = node as ShowHideNode;
      const varName = nextVar(ctx);
      out.push(`const ${varName} = document.createElement('span');`);
      for (const child of showHide.children) {
        genNode(child, varName, out, ctx);
      }
      out.push(`${parentVar}.appendChild(${varName});`);

      const { decl, varName: condVar, callArgs } = emitExpressionEvaluator(ctx, showHide.condition);
      out.push(decl);
      const fnName = node.type === ASTNodeType.Show ? 'createShow' : 'createHide';
      ctx.needsRuntimeDom.add(fnName);
      out.push(`${fnName}(${varName}, () => Boolean(${condVar}(${callArgs})));`);
      return;
    }

    default:
      return;
  }
}

function indent(code: string): string {
  return code
    .split('\n')
    .map(line => '  ' + line)
    .join('\n');
}

const BOOLEAN_DOM_PROPS = new Set(['disabled', 'checked', 'selected', 'readonly', 'required', 'hidden']);
const VALUE_DOM_PROPS = new Set(['value']);

/** Maps @event.<modifier> key names to the real KeyboardEvent.key value to check for. */
const KEY_MODIFIER_NAMES: Record<string, string> = {
  enter: 'Enter',
  escape: 'Escape',
  esc: 'Escape',
  tab: 'Tab',
  delete: 'Delete',
  backspace: 'Backspace',
  space: ' ',
  up: 'ArrowUp',
  down: 'ArrowDown',
  left: 'ArrowLeft',
  right: 'ArrowRight',
};

/**
 * Generate code for one attribute. The real template syntax (confirmed
 * against actual usage in this project's own example apps) isn't just
 * plain `name="value"` pairs - it also uses:
 *   - `@event="handler"` for event listeners (e.g. `@click="toggleCart"`,
 *     `@click="addToCart(product.id)"`)
 *   - `:model="path"` for two-way input binding
 *   - `:prop="expr"` for one-way reactive attribute/property binding
 *     (e.g. `:disabled="product.stock === 0"`, `:show="loading"`)
 * The previous version of this generator ran every attribute through
 * plain `setAttribute(name, value)` regardless of prefix, which both lost
 * all reactivity for `:`-prefixed bindings and, for `@`-prefixed ones,
 * actively crashed at runtime: `@` isn't a legal character to start an
 * HTML/XML attribute name, so `el.setAttribute('@click', ...)` throws
 * `InvalidCharacterError` in a real DOM (confirmed via jsdom).
 */
function genAttribute(varName: string, attrName: string, attrValue: string, out: string[], ctx: GenCtx): void {
  if (attrName.startsWith('@')) {
    const [eventName, ...modifiers] = attrName.slice(1).split('.');
    const handlerBody = isBareIdentifier(attrValue) ? `${attrValue}(event)` : attrValue;
    ctx.exprCounter += 1;
    const fnVar = `__handler${ctx.exprCounter}`;
    out.push(
      `const ${fnVar} = new Function('ctx', 'event', 'with (ctx) { ' + ${JSON.stringify(handlerBody)} + '; }');`
    );

    // Modifiers (@keyup.enter, @click.stop, @submit.prevent, ...) previously
    // got silently folded into the literal event name itself
    // (addEventListener("keyup.enter", ...), which isn't a real DOM event
    // and so never fired). Split them out: .prevent/.stop map to real
    // Event methods, and key-name modifiers gate the handler behind a
    // matching KeyboardEvent.key check, same convention as Vue's modifiers.
    const guards: string[] = [];
    const preModifierCalls: string[] = [];
    for (const mod of modifiers) {
      if (mod === 'prevent') {
        preModifierCalls.push('event.preventDefault();');
      } else if (mod === 'stop') {
        preModifierCalls.push('event.stopPropagation();');
      } else if (mod in KEY_MODIFIER_NAMES) {
        guards.push(`event.key !== ${JSON.stringify(KEY_MODIFIER_NAMES[mod])}`);
      } else if (mod === 'ctrl' || mod === 'shift' || mod === 'alt' || mod === 'meta') {
        guards.push(`!event.${mod}Key`);
      }
    }

    const guardCheck = guards.length > 0 ? `if (${guards.join(' || ')}) return; ` : '';
    const preCalls = preModifierCalls.join(' ');
    out.push(
      `${varName}.addEventListener(${JSON.stringify(eventName)}, (event) => { ${guardCheck}${preCalls}${fnVar}(ctx, event); });`
    );
    return;
  }

  if (attrName === ':model') {
    ctx.needsRuntimeDom.add('createModel');
    const { getterDecl, getterVar, setterDecl, setterVar } = emitAssignableAccessor(ctx, attrValue);
    out.push(getterDecl);
    out.push(setterDecl);
    out.push(
      `createModel(${varName}, Object.assign(() => ${getterVar}(ctx), { set: (v) => ${setterVar}(ctx, v), peek: () => ${getterVar}(ctx) }));`
    );
    return;
  }

  if (attrName === ':show' || attrName === ':hide') {
    const fnName = attrName === ':show' ? 'createShow' : 'createHide';
    ctx.needsRuntimeDom.add(fnName);
    const { decl, varName: exprVar, callArgs } = emitExpressionEvaluator(ctx, attrValue);
    out.push(decl);
    out.push(`${fnName}(${varName}, () => Boolean(${exprVar}(${callArgs})));`);
    return;
  }

  if (attrName.startsWith(':')) {
    const propName = attrName.slice(1);
    const { decl, varName: exprVar, callArgs } = emitExpressionEvaluator(ctx, attrValue);
    out.push(decl);
    ctx.needsReactivity.add('createEffect');
    if (BOOLEAN_DOM_PROPS.has(propName)) {
      out.push(`createEffect(() => { ${varName}.${propName} = Boolean(${exprVar}(${callArgs})); });`);
    } else if (VALUE_DOM_PROPS.has(propName)) {
      out.push(`createEffect(() => { ${varName}.${propName} = ${exprVar}(${callArgs}) ?? ''; });`);
    } else {
      out.push(
        `createEffect(() => { const __v = ${exprVar}(${callArgs}); if (__v === false || __v === null || __v === undefined) { ${varName}.removeAttribute(${JSON.stringify(propName)}); } else { ${varName}.setAttribute(${JSON.stringify(propName)}, String(__v)); } });`
      );
    }
    return;
  }

  out.push(`${varName}.setAttribute(${JSON.stringify(attrName)}, ${JSON.stringify(attrValue)});`);
}

function isBareIdentifier(expr: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(expr.trim());
}

/**
 * Build a get/set pair of real functions for a simple assignable path
 * (e.g. "count", "filters.category") for use in :model bindings. Only
 * supports plain dotted-identifier paths (no computed/bracket access) -
 * that matches every :model usage actually seen in this project's
 * examples, and is the standard restriction two-way-binding targets have
 * in comparable frameworks anyway (the left side of an assignment has to
 * be a real reference, not an arbitrary expression).
 */
function emitAssignableAccessor(
  ctx: GenCtx,
  path: string
): { getterDecl: string; getterVar: string; setterDecl: string; setterVar: string } {
  ctx.exprCounter += 1;
  const n = ctx.exprCounter;
  const getterVar = `__modelGet${n}`;
  const setterVar = `__modelSet${n}`;
  const trimmed = path.trim();
  const getterDecl = `const ${getterVar} = new Function('ctx', 'with (ctx) { return (' + ${JSON.stringify(trimmed)} + ') }');`;
  const setterDecl = `const ${setterVar} = new Function('ctx', 'value', 'with (ctx) { (' + ${JSON.stringify(trimmed)} + ') = value; }');`;
  return { getterDecl, getterVar, setterDecl, setterVar };
}

/**
 * Generate JavaScript from a compiled/optimized AST.
 *
 * Previously this function was a stub (`ast.map(n => JSON.stringify(n))`),
 * so `compile()` never produced real, runnable output - only a
 * JSON-serialized copy of the AST. This emits an imperative sequence of
 * real DOM calls plus calls into the actual runtime directive functions
 * (createFor/createIf/createShow/createHide from @teloce/runtime-dom, and
 * createEffect from @teloce/reactivity for reactive interpolations).
 *
 * Note: there is no createElement()/createText() wrapper API anywhere in
 * the runtime packages (checked - neither runtime-dom nor runtime-core
 * export anything by those names), so this targets the real DOM API
 * directly (document.createElement/createTextNode) instead of depending on
 * functions that don't exist.
 */
export function generate(ast: ASTNode[], _options: GenerateOptions = {}): GenerateResult {
  const ctx: GenCtx = {
    varCounter: 0,
    exprCounter: 0,
    needsRuntimeDom: new Set(),
    needsReactivity: new Set(),
    needsFilters: false,
  };

  const body: string[] = [];
  for (const node of ast) {
    genNode(node, 'container', body, ctx);
  }

  const imports: string[] = [];
  if (ctx.needsRuntimeDom.size > 0) {
    imports.push(`import { ${[...ctx.needsRuntimeDom].sort().join(', ')} } from '@teloce/runtime-dom';`);
  }
  if (ctx.needsReactivity.size > 0) {
    imports.push(`import { ${[...ctx.needsReactivity].sort().join(', ')} } from '@teloce/reactivity';`);
  }
  if (ctx.needsFilters) {
    imports.push(`import { getFilter } from '@teloce/std';`);
  }

  const filterHelper = ctx.needsFilters
    ? [
        '',
        "// Looks a filter up by name from @teloce/std's registry (built-in",
        '// filters like currency/truncate/dateFormat, plus anything registered',
        '// via app.filter(name, fn)) and applies it. Falls back to the',
        '// unfiltered value (with a console warning) for an unknown filter name',
        '// rather than throwing, so a typo in a filter name degrades instead of',
        '// crashing the whole render.',
        'function __applyFilter(value, name, ...args) {',
        '  const fn = getFilter(name);',
        '  if (!fn) {',
        '    console.warn(`[teloce] Unknown filter: "${name}"`);',
        '    return value;',
        '  }',
        '  return fn(value, ...args);',
        '}',
      ]
    : [];

  const code = [
    ...imports,
    ...filterHelper,
    '',
    '/**',
    ' * @param {HTMLElement} container - element to mount the compiled template into',
    ' * @param {object} ctx - reactive context (props/state) the template reads from',
    ' */',
    'export function render(container, ctx) {',
    indent(body.join('\n')),
    '}',
  ].join('\n');

  return {
    code,
    imports,
    exports: ['render'],
  };
}