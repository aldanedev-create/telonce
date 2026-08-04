/**
 * DOM reconciler - keyed-loop Map-cache diff/patch (no virtual DOM)
 * 
 * This module provides direct DOM reconciliation using a Map-based cache
 * for keyed loops, enabling efficient updates without a Virtual DOM.
 */

import { createEffect, type Signal } from '@teloce/reactivity';

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
 * Create a renderer
 */
export function createRenderer(options: RendererOptions): Renderer {
  return {
    render(template, data) {
      // Implementation depends on template type
      return document.createTextNode('');
    },
    update(node, data) {
      // Update node with new data
    },
    unmount(node) {
      // Remove node from DOM
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

  // Build key sets
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
  let currentIndex = 0;
  for (const [index, item] of newItems.entries()) {
    const key = keyFn(item);
    const cached = cache.get(key);

    if (cached) {
      // Reuse existing node
      const node = cached.node;
      const oldIndex = oldItems.findIndex(i => keyFn(i) === key);

      // Update content if needed
      if (oldIndex === -1 || oldItems[oldIndex] !== item) {
        const newNode = renderFn(item, index);
        // Replace content if different
        if (node !== newNode) {
          if (node.parentNode) {
            node.parentNode.replaceChild(newNode, node);
            cache.set(key, { node: newNode, data: item, key });
            operations.push({ type: 'update', node: newNode, index, key });
            nodes.push(newNode);
          }
        } else {
          operations.push({ type: 'update', node, index, key });
          nodes.push(node);
        }
      } else {
        nodes.push(node);
      }

      // Move to correct position using insertBefore
      const targetNode = container.children[index];
      if (targetNode && targetNode !== node) {
        container.insertBefore(node, targetNode);
        operations.push({ type: 'move', node, index, key });
      } else if (!targetNode && container.lastChild !== node) {
        container.appendChild(node);
        operations.push({ type: 'move', node, index, key });
      }

      currentIndex++;
    } else {
      // Create new node
      const node = renderFn(item, index);
      cache.set(key, { node, data: item, key });
      
      // Insert at correct position
      const targetNode = container.children[index];
      if (targetNode) {
        container.insertBefore(node, targetNode);
      } else {
        container.appendChild(node);
      }
      
      operations.push({ type: 'add', node, index, key });
      nodes.push(node);
      currentIndex++;
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

  // If no key function, simple replace
  if (!keyFn) {
    // Clear container
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    // Add new children
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

  // Keyed reconciliation
  const oldKeys = new Map<string, Node>();
  const oldChildren = Array.from(container.children);

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
      container.removeChild(node);
      operations.push({ type: 'remove', node, key });
    }
  }

  // Add or move new nodes
  for (const [index, child] of newChildren.entries()) {
    const key = keyFn(child);
    if (key && oldKeys.has(key)) {
      // Move existing node
      const existingNode = oldKeys.get(key)!;
      if (existingNode !== child) {
        const targetNode = container.children[index];
        if (targetNode !== existingNode) {
          container.insertBefore(existingNode, targetNode || null);
          operations.push({ type: 'move', node: existingNode, index, key });
        }
        nodes.push(existingNode);
      }
    } else {
      // Add new node
      const targetNode = container.children[index];
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