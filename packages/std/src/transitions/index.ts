/**
 * Transitions - animations and transitions for DOM elements
 * 
 * Usage in templates:
 * <div :transition="fade">
 * <div :animation="slide">
 */

import { createSignal, createEffect, type Signal } from '@teloce/reactivity';

/**
 * Transition options
 */
export interface TransitionOptions {
  /**
   * Duration in milliseconds
   */
  duration?: number;

  /**
   * Delay in milliseconds
   */
  delay?: number;

  /**
   * Easing function
   */
  easing?: string;

  /**
   * Name of the transition
   */
  name?: string;

  /**
   * Callback when transition starts
   */
  onStart?: () => void;

  /**
   * Callback when transition ends
   */
  onEnd?: () => void;

  /**
   * Callback when transition is cancelled
   */
  onCancel?: () => void;
}

/**
 * Animation options
 */
export interface AnimationOptions {
  /**
   * Duration in milliseconds
   */
  duration?: number;

  /**
   * Delay in milliseconds
   */
  delay?: number;

  /**
   * Easing function
   */
  easing?: string;

  /**
   * Number of iterations
   */
  iterations?: number;

  /**
   * Direction of animation
   */
  direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';

  /**
   * Fill mode
   */
  fill?: 'none' | 'forwards' | 'backwards' | 'both';

  /**
   * Keyframes
   */
  keyframes?: Keyframe[];
}

/**
 * Transition function
 */
export type Transition = (el: HTMLElement, options?: TransitionOptions) => Promise<void>;

/**
 * Animation function
 */
export type Animation = (el: HTMLElement, options?: AnimationOptions) => Promise<void>;

/**
 * Transition manager
 */
export interface TransitionManager {
  /**
   * Apply a transition
   */
  apply: (el: HTMLElement, transition: Transition, options?: TransitionOptions) => Promise<void>;

  /**
   * Apply an animation
   */
  animate: (el: HTMLElement, animation: Animation, options?: AnimationOptions) => Promise<void>;

  /**
   * Cancel all transitions
   */
  cancel: () => void;
}

/**
 * Create a transition manager
 */
export function createTransitionManager(): TransitionManager {
  const runningTransitions: Animation[] = [];

  return {
    async apply(el: HTMLElement, transition: Transition, options?: TransitionOptions) {
      return transition(el, options);
    },

    async animate(el: HTMLElement, animation: Animation, options?: AnimationOptions) {
      return animation(el, options);
    },

    cancel() {
      for (const anim of runningTransitions) {
        // Cancel animation
      }
      runningTransitions.length = 0;
    },
  };
}

/**
 * Wait for a transition to complete
 */
export function waitForTransition(el: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const onTransitionEnd = () => {
      el.removeEventListener('transitionend', onTransitionEnd);
      resolve();
    };
    el.addEventListener('transitionend', onTransitionEnd);
  });
}

/**
 * Wait for an animation to complete
 */
export function waitForAnimation(el: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const onAnimationEnd = () => {
      el.removeEventListener('animationend', onAnimationEnd);
      resolve();
    };
    el.addEventListener('animationend', onAnimationEnd);
  });
}

/**
 * Get transition duration from CSS
 */
export function getTransitionDuration(el: HTMLElement): number {
  const duration = getComputedStyle(el).transitionDuration;
  if (duration) {
    const seconds = parseFloat(duration);
    return seconds * 1000;
  }
  return 0;
}

/**
 * Set transition styles
 */
export function setTransitionStyles(
  el: HTMLElement,
  styles: Record<string, string>
): void {
  for (const [prop, value] of Object.entries(styles)) {
    el.style.setProperty(prop, value);
  }
}

/**
 * Create a transition with options
 */
export function createTransition(
  enter: (el: HTMLElement) => void,
  leave: (el: HTMLElement) => void,
  options: TransitionOptions = {}
): Transition {
  return async (el: HTMLElement, opts?: TransitionOptions) => {
    const finalOpts = { ...options, ...opts };
    const duration = finalOpts.duration || 300;

    // Apply enter styles
    enter(el);

    // Wait for the transition
    await waitForTransition(el);

    // Apply leave styles if needed
    leave(el);
  };
}

/**
 * Create an animation
 */
export function createAnimation(
  keyframes: Keyframe[] | KeyframeAnimationOptions,
  options: AnimationOptions = {}
): Animation {
  return async (el: HTMLElement, opts?: AnimationOptions) => {
    const finalOpts = { ...options, ...opts };
    const duration = finalOpts.duration || 300;

    const anim = el.animate(keyframes, {
      duration,
      delay: finalOpts.delay || 0,
      easing: finalOpts.easing || 'ease',
      iterations: finalOpts.iterations || 1,
      direction: finalOpts.direction || 'normal',
      fill: finalOpts.fill || 'none',
    });

    await anim.finished;
  };
}

/**
 * Wrap a function with transition
 */
export function withTransition<T>(
  fn: () => T,
  transition: Transition,
  el: HTMLElement
): Promise<T> {
  return new Promise(async (resolve) => {
    await transition(el);
    const result = fn();
    resolve(result);
  });
}

// --- Built-in Transitions ---

/**
 * Fade transition
 */
export const fade: Transition = createTransition(
  (el) => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 300ms ease';
    requestAnimationFrame(() => {
      el.style.opacity = '1';
    });
  },
  (el) => {
    el.style.opacity = '0';
  }
);

/**
 * Slide transition
 */
export const slide: Transition = createTransition(
  (el) => {
    const height = el.scrollHeight;
    el.style.height = '0';
    el.style.overflow = 'hidden';
    el.style.transition = 'height 300ms ease';
    requestAnimationFrame(() => {
      el.style.height = height + 'px';
    });
  },
  (el) => {
    el.style.height = '0';
  }
);

/**
 * Scale transition
 */
export const scale: Transition = createTransition(
  (el) => {
    el.style.transform = 'scale(0)';
    el.style.transition = 'transform 300ms ease';
    requestAnimationFrame(() => {
      el.style.transform = 'scale(1)';
    });
  },
  (el) => {
    el.style.transform = 'scale(0)';
  }
);

/**
 * Zoom transition
 */
export const zoom: Transition = createTransition(
  (el) => {
    el.style.transform = 'scale(0.5)';
    el.style.opacity = '0';
    el.style.transition = 'transform 300ms ease, opacity 300ms ease';
    requestAnimationFrame(() => {
      el.style.transform = 'scale(1)';
      el.style.opacity = '1';
    });
  },
  (el) => {
    el.style.transform = 'scale(0.5)';
    el.style.opacity = '0';
  }
);

/**
 * Flip transition
 */
export const flip: Transition = createTransition(
  (el) => {
    el.style.transform = 'rotateY(90deg)';
    el.style.transition = 'transform 300ms ease';
    requestAnimationFrame(() => {
      el.style.transform = 'rotateY(0deg)';
    });
  },
  (el) => {
    el.style.transform = 'rotateY(90deg)';
  }
);

/**
 * Collapse transition
 */
export const collapse: Transition = createTransition(
  (el) => {
    el.style.maxHeight = '0';
    el.style.overflow = 'hidden';
    el.style.transition = 'max-height 300ms ease';
    requestAnimationFrame(() => {
      el.style.maxHeight = el.scrollHeight + 'px';
    });
  },
  (el) => {
    el.style.maxHeight = '0';
  }
);

/**
 * Create a custom transition
 */
export function createCustomTransition(
  enterStyles: Record<string, string>,
  leaveStyles: Record<string, string>,
  options: TransitionOptions = {}
): Transition {
  return createTransition(
    (el) => {
      setTransitionStyles(el, enterStyles);
    },
    (el) => {
      setTransitionStyles(el, leaveStyles);
    },
    options
  );
}

/**
 * Create a keyframe animation
 */
export function createKeyframeAnimation(
  keyframes: Keyframe[],
  options: AnimationOptions = {}
): Animation {
  return createAnimation(keyframes, options);
}

// --- Built-in Animations ---

/**
 * Pulse animation
 */
export const pulse: Animation = createAnimation(
  [
    { transform: 'scale(1)' },
    { transform: 'scale(1.05)' },
    { transform: 'scale(1)' },
  ],
  { duration: 600 }
);

/**
 * Shake animation
 */
export const shake: Animation = createAnimation(
  [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(-10px)' },
    { transform: 'translateX(10px)' },
    { transform: 'translateX(0)' },
  ],
  { duration: 500 }
);

/**
 * Bounce animation
 */
export const bounce: Animation = createAnimation(
  [
    { transform: 'translateY(0)' },
    { transform: 'translateY(-20px)' },
    { transform: 'translateY(0)' },
    { transform: 'translateY(-10px)' },
    { transform: 'translateY(0)' },
  ],
  { duration: 600 }
);

/**
 * Spin animation
 */
export const spin: Animation = createAnimation(
  [
    { transform: 'rotate(0deg)' },
    { transform: 'rotate(360deg)' },
  ],
  { duration: 1000, iterations: Infinity }
);

/**
 * FadeIn animation
 */
export const fadeIn: Animation = createAnimation(
  [
    { opacity: '0' },
    { opacity: '1' },
  ],
  { duration: 300 }
);

/**
 * FadeOut animation
 */
export const fadeOut: Animation = createAnimation(
  [
    { opacity: '1' },
    { opacity: '0' },
  ],
  { duration: 300 }
);