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
function emitExpressionEvaluator(ctx: GenCtx, expr: string): { decl: string; varName: string } {
  ctx.exprCounter += 1;
  const varName = `__expr${ctx.exprCounter}`;
  const safeExpr = expr.trim() || 'undefined';
  const decl = `const ${varName} = new Function('ctx', 'with (ctx) { return (' + ${JSON.stringify(safeExpr)} + ') }');`;
  return { decl, varName };
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
        out.push(`${varName}.setAttribute(${JSON.stringify(attrName)}, ${JSON.stringify(attrValue)});`);
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
      const { decl, varName: exprVar } = emitExpressionEvaluator(ctx, interp.value);
      out.push(decl);
      ctx.needsReactivity.add('createEffect');
      out.push(`createEffect(() => { ${varName}.textContent = String(${exprVar}(ctx) ?? ''); });`);
      out.push(`${parentVar}.appendChild(${varName});`);
      return;
    }

    case ASTNodeType.If: {
      const ifNode = node as IfNode;
      const { decl: condDecl, varName: condVar } = emitExpressionEvaluator(ctx, ifNode.condition);
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
        `createIf(${parentVar}, () => Boolean(${condVar}(ctx)), () => {\n${indent(trueBody.join('\n'))}\n}, () => {\n${indent(falseBody)}\n});`
      );
      return;
    }

    case ASTNodeType.For: {
      const forNode = node as ForNode;
      const { decl: itemsDecl, varName: itemsVar } = emitExpressionEvaluator(ctx, forNode.collection);
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
          `${indent(`createFor(${parentVar}, () => ${itemsVar}(ctx), function (__item, __index) {\n${indent(renderBody.join('\n'))}\n}, ${keyFn});`)}\n` +
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

      const { decl, varName: condVar } = emitExpressionEvaluator(ctx, showHide.condition);
      out.push(decl);
      const fnName = node.type === ASTNodeType.Show ? 'createShow' : 'createHide';
      ctx.needsRuntimeDom.add(fnName);
      out.push(`${fnName}(${varName}, () => Boolean(${condVar}(ctx)));`);
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

  const code = [
    ...imports,
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
