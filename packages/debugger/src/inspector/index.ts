/**
 * Inspector - reactive-node tracking tree (feeds the dashboard)
 */

export interface NodeInspection {
  /**
   * Node ID
   */
  id: string;

  /**
   * Node type
   */
  type: 'component' | 'element' | 'text' | 'fragment' | 'slot';

  /**
   * Node name (component name or tag name)
   */
  name: string;

  /**
   * Props/attributes
   */
  props: Record<string, any>;

  /**
   * State
   */
  state: Record<string, any>;

  /**
   * Children
   */
  children: NodeInspection[];

  /**
   * Parent ID
   */
  parentId?: string;

  /**
   * DOM element (reference)
   */
  el?: HTMLElement;

  /**
   * Is mounted
   */
  isMounted: boolean;

  /**
   * Is active
   */
  isActive: boolean;

  /**
   * Render count
   */
  renderCount: number;

  /**
   * Last render time in milliseconds
   */
  lastRenderTime?: number;

  /**
   * Total render time in milliseconds
   */
  totalRenderTime: number;

  /**
   * Created at timestamp
   */
  createdAt: number;

  /**
   * Updated at timestamp
   */
  updatedAt: number;
}

export interface NodeState {
  [key: string]: unknown;
}

export interface NodeTree {
  /**
   * Root nodes
   */
  roots: NodeInspection[];

  /**
   * Node map (id -> node)
   */
  map: Map<string, NodeInspection>;

  /**
   * Total nodes count
   */
  count: number;

  /**
   * Last updated
   */
  updatedAt: number;
}

export interface InspectorOptions {
  /**
   * Track DOM nodes
   */
  trackDOM?: boolean;

  /**
   * Track state changes
   */
  trackState?: boolean;

  /**
   * Track render times
   */
  trackRenderTime?: boolean;

  /**
   * Max nodes to track
   */
  maxNodes?: number;

  /**
   * Filter components
   */
  filter?: (node: NodeInspection) => boolean;
}

/**
 * Node inspector
 */
class NodeInspector {
  private nodes: Map<string, NodeInspection> = new Map();
  private roots: Set<string> = new Set();
  private options: InspectorOptions;
  private idCounter: number = 0;
  private lastUpdated: number = Date.now();

  constructor(options: InspectorOptions = {}) {
    this.options = {
      trackDOM: true,
      trackState: true,
      trackRenderTime: true,
      maxNodes: 1000,
      ...options,
    };
  }

  /**
   * Create a new node
   */
  createNode(
    type: NodeInspection['type'],
    name: string,
    parentId?: string,
    props: Record<string, any> = {},
    state: Record<string, any> = {}
  ): string {
    const id = this.generateId();
    const node: NodeInspection = {
      id,
      type,
      name,
      props,
      state,
      children: [],
      parentId,
      isMounted: false,
      isActive: true,
      renderCount: 0,
      totalRenderTime: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.nodes.set(id, node);
    if (!parentId) {
      this.roots.add(id);
    } else {
      const parent = this.nodes.get(parentId);
      if (parent) {
        parent.children.push(node);
      }
    }

    this.lastUpdated = Date.now();
    return id;
  }

  /**
   * Update a node
   */
  updateNode(
    id: string,
    updates: Partial<Omit<NodeInspection, 'id' | 'children' | 'createdAt'>>
  ): void {
    const node = this.nodes.get(id);
    if (!node) return;

    Object.assign(node, updates);
    node.updatedAt = Date.now();

    if (updates.renderCount !== undefined) {
      node.renderCount = updates.renderCount;
    }

    this.lastUpdated = Date.now();
  }

  /**
   * Get a node
   */
  getNode(id: string): NodeInspection | undefined {
    return this.nodes.get(id);
  }

  /**
   * Get node tree
   */
  getTree(): NodeTree {
    const roots: NodeInspection[] = [];
    for (const id of this.roots) {
      const node = this.nodes.get(id);
      if (node) {
        roots.push(node);
      }
    }

    return {
      roots,
      map: this.nodes,
      count: this.nodes.size,
      updatedAt: this.lastUpdated,
    };
  }

  /**
   * Find a node by name
   */
  findNode(name: string): NodeInspection | undefined {
    for (const [, node] of this.nodes) {
      if (node.name === name) {
        return node;
      }
    }
    return undefined;
  }

  /**
   * Find nodes by name
   */
  findNodes(name: string): NodeInspection[] {
    const result: NodeInspection[] = [];
    for (const [, node] of this.nodes) {
      if (node.name === name) {
        result.push(node);
      }
    }
    return result;
  }

  /**
   * Find a node by DOM element
   */
  findByElement(el: HTMLElement): NodeInspection | undefined {
    for (const [, node] of this.nodes) {
      if (node.el === el) {
        return node;
      }
    }
    return undefined;
  }

  /**
   * Remove a node and its children
   */
  removeNode(id: string): void {
    const node = this.nodes.get(id);
    if (!node) return;

    // Remove from parent
    if (node.parentId) {
      const parent = this.nodes.get(node.parentId);
      if (parent) {
        parent.children = parent.children.filter(c => c.id !== id);
      }
    }

    // Remove children recursively
    for (const child of node.children) {
      this.removeNode(child.id);
    }

    this.roots.delete(id);
    this.nodes.delete(id);
    this.lastUpdated = Date.now();
  }

  /**
   * Track a DOM node
   */
  trackNode(el: HTMLElement, componentId: string): void {
    const node = this.nodes.get(componentId);
    if (node && this.options.trackDOM) {
      node.el = el;
      node.isMounted = true;
      this.lastUpdated = Date.now();
    }
  }

  /**
   * Track state change
   */
  trackState(id: string, state: Record<string, any>): void {
    if (!this.options.trackState) return;
    const node = this.nodes.get(id);
    if (node) {
      node.state = { ...node.state, ...state };
      this.lastUpdated = Date.now();
    }
  }

  /**
   * Track render time
   */
  trackRenderTime(id: string, time: number): void {
    if (!this.options.trackRenderTime) return;
    const node = this.nodes.get(id);
    if (node) {
      node.renderCount++;
      node.lastRenderTime = time;
      node.totalRenderTime += time;
      this.lastUpdated = Date.now();
    }
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `node_${++this.idCounter}_${Date.now()}`;
  }

  /**
   * Get statistics
   */
  getStats(): {
    totalNodes: number;
    rootNodes: number;
    componentNodes: number;
    elementNodes: number;
    averageRenderTime: number;
  } {
    let componentNodes = 0;
    let elementNodes = 0;
    let totalRenderTime = 0;
    let renderCount = 0;

    for (const [, node] of this.nodes) {
      if (node.type === 'component') componentNodes++;
      if (node.type === 'element') elementNodes++;
      if (node.renderCount > 0) {
        totalRenderTime += node.totalRenderTime;
        renderCount += node.renderCount;
      }
    }

    return {
      totalNodes: this.nodes.size,
      rootNodes: this.roots.size,
      componentNodes,
      elementNodes,
      averageRenderTime: renderCount > 0 ? totalRenderTime / renderCount : 0,
    };
  }
}

/**
 * Create an inspector
 */
export function createInspector(options: InspectorOptions = {}): NodeInspector {
  return new NodeInspector(options);
}

/**
 * Inspect a node
 */
export function inspectNode(
  inspector: NodeInspector,
  id: string
): NodeInspection | undefined {
  return inspector.getNode(id);
}

/**
 * Track nodes
 */
export function trackNodes(
  inspector: NodeInspector,
  nodes: Array<{ id: string; el: HTMLElement }>
): void {
  for (const { id, el } of nodes) {
    inspector.trackNode(el, id);
  }
}

/**
 * Get node tree
 */
export function getNodeTree(
  inspector: NodeInspector
): NodeTree {
  return inspector.getTree();
}

/**
 * Find a node
 */
export function findNode(
  inspector: NodeInspector,
  name: string
): NodeInspection | undefined {
  return inspector.findNode(name);
}