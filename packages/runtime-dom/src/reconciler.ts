/**
 * DOM reconciler - keyed-loop Map-cache diff/patch (no virtual DOM)
 * 
 * This module provides direct DOM reconciliation using a Map-based cache
 * for keyed loops, enabling efficient updates without a Virtual DOM.
 */

/**
 * Renderer options
 */
export interface RendererOptions {
  /**
   * Create an element
   */
  createElement: (tag: string) => HTMLElement;

  /**
   * Create text node
   */
  createText: (text: string) => Text;

  /**
   * Set attribute
   */
  setAttribute: (node: HTMLElement, attr: string, value: any) => void;

  /**
   * Remove attribute
   */
  removeAttribute: (node: HTMLElement, attr: string) => void;

  /**
   * Set property
   */
  setProperty: (node: HTMLElement, prop: string, value: any) => void;

  /**
   * Insert node
   */
  insert: (parent: Node, child: Node, index?: number) => void;

  /**
   * Remove node
   */
  remove: (parent: Node, child: Node) => void;
}

/**
 * Renderer
 */
export interface Renderer {
  /**
   * Render a template
   */
  render: (template: any, data: any) => Node;

  /**
   * Update a node
   */
  update: (node: Node, data: any) => void;

  /**
   * Unmount a node
   */
  unmount: (node: Node) => void;
}

/**
 * Reconciliation result
 */
export interface ReconciliationResult {
  updated: boolean;
  nodes: Node[];
  operations: {
    type: 'add' | 'remove' | 'move' | 'update';
    node?: Node;
    index?: number;
    key?: string;
  }[];
}

/**
 * Keyed loop cache entry
 */
interface CacheEntry<T = any> {
  node: Node;
  data: T;
  key: string;
}

/**
 * Patch an existing DOM node with fresh content from a new node without losing DOM identity
 */
function patchNode(oldNode: Node, newNode: Node): void {
  // Use the numeric nodeType constants directly (TEXT_NODE = 3,
  // ELEMENT_NODE = 1) rather than referencing the global `Node`
  // constructor - `Node` is a real global in browsers, but isn't
  // automatically defined in Node.js/SSR/some embedding contexts even
  // when `document`/DOM nodes are otherwise available (e.g. jsdom without
  // explicitly attaching `window.Node` to `global`), which previously
  // caused a `ReferenceError: Node is not defined` there.
  if (oldNode.nodeType === 3 && newNode.nodeType === 3) {
    if (oldNode.textContent !== newNode.textContent) {
      oldNode.textContent = newNode.textContent;
    }
  } else if (oldNode.nodeType === 1 && newNode.nodeType === 1) {
    const oldEl = oldNode as HTMLElement;
    const newEl = newNode as HTMLElement;

    // Sync attributes
    for (const attr of Array.from(newEl.attributes)) {
      if (oldEl.getAttribute(attr.name) !== attr.value) {
        oldEl.setAttribute(attr.name, attr.value);
      }
    }
    for (const attr of Array.from(oldEl.attributes)) {
      if (!newEl.hasAttribute(attr.name)) {
        oldEl.removeAttribute(attr.name);
      }
    }

    // Reconcile child nodes recursively
    reconcileChildren(oldEl, Array.from(newEl.childNodes));
  }
}

/**
 * Duck-typed check for "is this a DOM Node" - checking for a numeric
 * `.nodeType` property instead of `instanceof Node`, since the global
 * `Node` constructor isn't guaranteed to exist outside a real browser (see
 * the note on patchNode above for the same issue with Node.TEXT_NODE).
 */
function isDomNode(value: unknown): value is Node {
  return !!value && typeof value === 'object' && typeof (value as any).nodeType === 'number';
}

/**
 * Create a renderer
 */
export function createRenderer(options: RendererOptions): Renderer {
  return {
    render(template, data) {
      const result = typeof template === 'function' ? template(data) : template;
      if (isDomNode(result)) {
        return result;
      }
      if (Array.isArray(result)) {
        const fragment = document.createDocumentFragment();
        for (const item of result) {
          if (isDomNode(item)) {
            fragment.appendChild(item);
          }
        }
        return fragment as unknown as Node;
      }
      return options.createText(String(result ?? ''));
    },
    update(node, data) {
      if (typeof (node as any).__update === 'function') {
        (node as any).__update(data);
      }
    },
    unmount(node) {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    },
  };
}

/**
 * Reconcile a list with keyed updates
 * Uses Map-cache for O(1) node lookups and insertBefore for moves.
 *
 * Insertion previously anchored each item on `container.childNodes[index]`
 * - an absolute position within the *entire* container. That's only
 * correct if this list's items are the container's only children. As soon
 * as the list shares a container with other content (e.g. a sibling <if>
 * block that already placed a node there), items ended up inserted before
 * that unrelated content instead of after it, since childNodes[0] would
 * resolve to the sibling's node rather than "wherever this list's own
 * previous item ended". Rewritten to walk the new list back-to-front,
 * tracking the DOM node that should immediately follow each item (its own
 * previously-placed neighbor, not a raw container index) - the standard
 * keyed-list-diff anchoring technique. Items are only actually moved when
 * they aren't already positioned correctly, to avoid unnecessary DOM
 * churn.
 */
export function reconcileList<T>(
  oldItems: T[],
  newItems: T[],
  keyFn: (item: T, index?: number) => string,
  renderFn: (item: T, index: number) => Node,
  container: HTMLElement,
  cache: Map<string, CacheEntry<T>> = new Map()
): ReconciliationResult {
  const operations: ReconciliationResult['operations'] = [];

  const oldKeys = new Map<string, { item: T; index: number }>();
  const newKeys = new Set<string>();

  // `keyFn` is called with both `(item, index)` here - the compiler's
  // default fallback keyer (used whenever a <for> has no explicit `key`
  // attribute) is `(item, index) => String(index)`, which needs that
  // second argument to tell items apart. Previously these three call sites
  // only passed `item`, so `index` was always `undefined` inside every
  // default keyFn - collapsing every item in the list onto the same cache
  // key ("undefined") and causing only one item to ever render, no matter
  // how many were in the array.
  oldItems.forEach((item, index) => {
    const key = keyFn(item, index);
    oldKeys.set(key, { item, index });
  });

  newItems.forEach((item, index) => {
    const key = keyFn(item, index);
    newKeys.add(key);
  });

  // Step 1: Remove items not in new list
  for (const [key, entry] of oldKeys) {
    if (!newKeys.has(key)) {
      const cached = cache.get(key);
      if (cached) {
        const node = cached.node;
        if (node.parentNode) {
          node.parentNode.removeChild(node);
          operations.push({ type: 'remove', node, index: entry.index, key });
        }
        cache.delete(key);
      }
    }
  }

  // Step 2: process newest-to-oldest so each item has a real DOM-node
  // anchor (the item that should come right after it) rather than a
  // container-wide index. Nothing after the last new item belongs to this
  // list, so the initial anchor is `null` (insertBefore(node, null) is
  // just appendChild) - correct as long as this list's own items are
  // contiguous, which holds for how this reconciler is used (a directive
  // fully populates its own block before any later sibling is appended).
  const nodes: Node[] = new Array(newItems.length);
  let nextAnchor: Node | null = null;

  for (let i = newItems.length - 1; i >= 0; i--) {
    const item = newItems[i];
    const key = keyFn(item, i);
    const cached = cache.get(key);
    let node: Node;

    if (cached) {
      node = cached.node;
      const freshNode = renderFn(item, i);
      patchNode(node, freshNode);
      cache.set(key, { node, data: item, key });
      operations.push({ type: 'update', node, index: i, key });
    } else {
      node = renderFn(item, i);
      cache.set(key, { node, data: item, key });
      operations.push({ type: 'add', node, index: i, key });
    }

    if (node.parentNode !== container || node.nextSibling !== nextAnchor) {
      container.insertBefore(node, nextAnchor);
      operations.push({ type: 'move', node, index: i, key });
    }

    nodes[i] = node;
    nextAnchor = node;
  }

  return {
    updated: operations.length > 0,
    nodes,
    operations,
  };
}

/**
 * Reconcile children of a container
 */
export function reconcileChildren(
  container: HTMLElement,
  newChildren: Node[],
  keyFn?: (node: Node) => string
): ReconciliationResult {
  const operations: ReconciliationResult['operations'] = [];
  const nodes: Node[] = [];

  // If no key function, perform clean replace
  if (!keyFn) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    for (const child of newChildren) {
      container.appendChild(child);
      operations.push({ type: 'add', node: child });
      nodes.push(child);
    }
    return {
      updated: true,
      nodes,
      operations,
    };
  }

  const oldKeys = new Map<string, Node>();
  const oldChildren = Array.from(container.childNodes);

  for (const child of oldChildren) {
    const key = keyFn(child);
    if (key) {
      oldKeys.set(key, child);
    }
  }

  const newKeys = new Set<string>();
  for (const child of newChildren) {
    const key = keyFn(child);
    if (key) {
      newKeys.add(key);
    }
  }

  // Remove old nodes not in new list
  for (const [key, node] of oldKeys) {
    if (!newKeys.has(key)) {
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
      operations.push({ type: 'remove', node, key });
    }
  }

  // Same anchor-based approach as reconcileList (see the comment there) -
  // walk newest-to-oldest so each node's insertion point is its own real
  // next-sibling neighbor, not an absolute container-wide index.
  let nextAnchor: Node | null = null;
  const orderedNodes: Node[] = new Array(newChildren.length);

  for (let i = newChildren.length - 1; i >= 0; i--) {
    const child = newChildren[i];
    const key = keyFn(child);
    let node: Node;

    if (key && oldKeys.has(key)) {
      const existingNode = oldKeys.get(key)!;
      // Patch existing node content with fresh child updates instead of dropping them
      patchNode(existingNode, child);
      node = existingNode;
      operations.push({ type: 'update', node, index: i, key });
    } else {
      node = child;
      operations.push({ type: 'add', node, index: i, key });
    }

    if (node.parentNode !== container || node.nextSibling !== nextAnchor) {
      container.insertBefore(node, nextAnchor);
      operations.push({ type: 'move', node, index: i, key });
    }

    orderedNodes[i] = node;
    nextAnchor = node;
  }

  return {
    updated: operations.length > 0,
    nodes: orderedNodes,
    operations,
  };
}