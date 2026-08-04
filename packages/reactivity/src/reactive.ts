/**
 * Reactivity primitives: Signals, Effects, Computed, Memo
 */

// --- Types ---

export type Signal<T> = {
  (): T;
  set: (value: T | ((prev: T) => T)) => void;
  update: (fn: (prev: T) => T) => void;
  peek: () => T;
};

export type Effect = {
  run: () => void;
  stop: () => void;
};

export type Computed<T> = {
  (): T;
  peek: () => T;
};

export type Memo<T> = {
  (): T;
  peek: () => T;
};

// --- Internal State ---

let currentEffect: Effect | null = null;
const pendingEffects: Set<Effect> = new Set();
let isBatching = false;

// --- Signal Implementation ---

export function createSignal<T>(initial: T): Signal<T> {
  let value = initial;
  const subscribers = new Set<Effect>();

  function get(): T {
    if (currentEffect) {
      subscribers.add(currentEffect);
    }
    return value;
  }

  function set(newValue: T | ((prev: T) => T)): void {
    const nextValue = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(value) 
      : newValue;
    
    if (value !== nextValue) {
      value = nextValue;
      notify();
    }
  }

  function update(fn: (prev: T) => T): void {
    set(fn(value));
  }

  function peek(): T {
    return value;
  }

  function notify(): void {
    if (isBatching) {
      for (const effect of subscribers) {
        pendingEffects.add(effect);
      }
    } else {
      for (const effect of subscribers) {
        effect.run();
      }
    }
  }

  const signal = get as Signal<T>;
  signal.set = set;
  signal.update = update;
  signal.peek = peek;

  return signal;
}

// --- Effect Implementation ---

export function createEffect(fn: () => void): Effect {
  const effect: Effect = {
    run() {
      currentEffect = this;
      try {
        fn();
      } finally {
        currentEffect = null;
      }
    },
    stop() {
      // Clean up subscriptions
      // Implementation will be extended in effect.ts
    }
  };

  effect.run();
  return effect;
}

// --- Computed Implementation ---

export function createComputed<T>(fn: () => T): Computed<T> {
  let value: T;
  let dirty = true;

  const effect = createEffect(() => {
    value = fn();
    dirty = false;
  });

  function get(): T {
    if (dirty) {
      effect.run();
    }
    return value;
  }

  function peek(): T {
    return value;
  }

  const computed = get as Computed<T>;
  computed.peek = peek;

  return computed;
}

// --- Memo Implementation ---

export function createMemo<T>(fn: () => T): Memo<T> {
  return createComputed(fn);
}

// --- Batch Updates ---

export function batch(fn: () => void): void {
  isBatching = true;
  try {
    fn();
  } finally {
    isBatching = false;
    flushPending();
  }
}

function flushPending(): void {
  const effects = Array.from(pendingEffects);
  pendingEffects.clear();
  for (const effect of effects) {
    effect.run();
  }
}

// --- Untracked ---

export function untracked<T>(fn: () => T): T {
  const prev = currentEffect;
  currentEffect = null;
  try {
    return fn();
  } finally {
    currentEffect = prev;
  }
}

// --- Exports for internal use ---

export { currentEffect };