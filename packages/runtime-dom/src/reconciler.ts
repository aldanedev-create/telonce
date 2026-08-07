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
  if (oldNode.nodeType === Node.TEXT_NODE && newNode.nodeType === Node.TEXT_NODE) {
    if (oldNode.textContent !== newNode.textContent) {
      oldNode.textContent = newNode.textContent;
    }
  } else if (oldNode.nodeType === Node.ELEMENT_NODE && newNode.nodeType === Node.ELEMENT_NODE) {
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
 * Create a renderer
 */
export function createRenderer(options: RendererOptions): Renderer {
  return {
    render(template, data) {
      const result = typeof template === 'function' ? template(data) : template;
      if (result instanceof Node) {
        return result;
      }
      if (Array.isArray(result)) {
        const fragment = document.createDocumentFragment();
        for (const item of result) {
          if (item instanceof Node) {
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
 * Uses Map-cache for O(1) node lookups and insertBefore for moves
 */
export function reconcileList<T>(
  oldItems: T[],
  newItems: T[],
  keyFn: (item: T) => string,
  renderFn: (item: T, index: number) => Node,
  container: HTMLElement,
  cache: Map<string, CacheEntry<T>> = new Map()
): ReconciliationResult {
  const operations: ReconciliationResult['operations'] = [];
  const nodes: Node[] = [];

  const oldKeys = new Map<string, { item: T; index: number }>();
  const newKeys = new Set<string>();

  oldItems.forEach((item, index) => {
    const key = keyFn(item);
    oldKeys.set(key, { item, index });
  });

  newItems.forEach((item) => {
    const key = keyFn(item);
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

  // Step 2: Process new items
  for (const [index, item] of newItems.entries()) {
    const key = keyFn(item);
    const cached = cache.get(key);

    if (cached) {
      const node = cached.node;

      // Render fresh node to extract updates, then patch existing node in-place
      const freshNode = renderFn(item, index);
      patchNode(node, freshNode);

      cache.set(key, { node, data: item, key });
      operations.push({ type: 'update', node, index, key });
      nodes.push(node);

      // Move to correct position using O(1) index access
      const targetNode = container.childNodes[index];
      if (targetNode && targetNode !== node) {
        container.insertBefore(node, targetNode);
        operations.push({ type: 'move', node, index, key });
      } else if (!targetNode && container.lastChild !== node) {
        container.appendChild(node);
        operations.push({ type: 'move', node, index, key });
      }
    } else {
      const node = renderFn(item, index);
      cache.set(key, { node, data: item, key });

      const targetNode = container.childNodes[index];
      if (targetNode) {
        container.insertBefore(node, targetNode);
      } else {
        container.appendChild(node);
      }

      operations.push({ type: 'add', node, index, key });
      nodes.push(node);
    }
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

  // Add, patch, or move new nodes
  for (const [index, child] of newChildren.entries()) {
    const key = keyFn(child);
    if (key && oldKeys.has(key)) {
      const existingNode = oldKeys.get(key)!;
      
      // Patch existing node content with fresh child updates instead of dropping them
      patchNode(existingNode, child);

      const targetNode = container.childNodes[index];
      if (targetNode !== existingNode) {
        container.insertBefore(existingNode, targetNode || null);
        operations.push({ type: 'move', node: existingNode, index, key });
      }

      operations.push({ type: 'update', node: existingNode, index, key });
      nodes.push(existingNode);
    } else {
      const targetNode = container.childNodes[index];
      if (targetNode) {
        container.insertBefore(child, targetNode);
      } else {
        container.appendChild(child);
      }
      operations.push({ type: 'add', node: child, index, key });
      nodes.push(child);
    }
  }

  return {
    updated: operations.length > 0,
    nodes,
    operations,
  };
}