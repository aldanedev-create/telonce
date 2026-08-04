/**
 * If directive - conditional rendering
 */

import { createEffect, type Signal } from '@teloce/reactivity';

export interface IfDirectiveProps {
  /**
   * Condition
   */
  condition: boolean | Signal<boolean>;

  /**
   * True branch content
   */
  children: any;

  /**
   * False branch content
   */
  else?: any;
}

/**
 * If directive
 */
export function If(props: IfDirectiveProps): any {
  return {
    type: 'if',
    props,
  };
}

/**
 * Else directive
 */
export function Else(props: { children: any }): any {
  return {
    type: 'else',
    props,
  };
}

/**
 * Create a conditional renderer
 */
export function createIf(
  container: HTMLElement,
  condition: Signal<boolean>,
  renderTrue: () => Node,
  renderFalse?: () => Node
): {
  update: () => void;
  unmount: () => void;
  getCurrentBranch: () => 'true' | 'false' | null;
} {
  let currentBranch: 'true' | 'false' | null = null;
  let currentNode: Node | null = null;
  let isMounted = false;

  function render() {
    const cond = condition();

    if (cond && currentBranch !== 'true') {
      // Switch to true branch
      if (currentNode) {
        container.removeChild(currentNode);
      }
      currentNode = renderTrue();
      container.appendChild(currentNode);
      currentBranch = 'true';
    } else if (!cond && currentBranch !== 'false') {
      // Switch to false branch
      if (currentNode) {
        container.removeChild(currentNode);
      }
      if (renderFalse) {
        currentNode = renderFalse();
        container.appendChild(currentNode);
      } else {
        currentNode = null;
      }
      currentBranch = 'false';
    }
  }

  function unmount() {
    if (currentNode && currentNode.parentNode) {
      currentNode.parentNode.removeChild(currentNode);
    }
    currentNode = null;
    currentBranch = null;
    isMounted = false;
  }

  function getCurrentBranch() {
    return currentBranch;
  }

  // Create effect for reactivity
  const effect = createEffect(() => {
    if (!isMounted) {
      isMounted = true;
      render();
    } else {
      render();
    }
  });

  return {
    update: render,
    unmount,
    getCurrentBranch,
  };
}