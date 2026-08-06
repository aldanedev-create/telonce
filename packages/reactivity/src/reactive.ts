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
  deps: Set<Set<Effect>>;
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
      currentEffect.deps.add(subscribers);
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
    // Clone to prevent infinite loops if effects modify subscriptions while running
    const currentSubs = Array.from(subscribers);
    
    if (isBatching) {
      for (const effect of currentSubs) {
        pendingEffects.add(effect);
      }
    } else {
      for (const effect of currentSubs) {
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
    deps: new Set(),
    run() {
      this.stop(); // Clean up stale dependencies before running
      
      const prev = currentEffect;
      currentEffect = this;
      try {
        fn();
      } finally {
        currentEffect = prev; // Restore previous to support nested effects
      }
    },
    stop() {
      for (const dep of this.deps) {
        dep.delete(this);
      }
      this.deps.clear();
    }
  };

  effect.run();
  return effect;
}

// --- Computed Implementation ---

export function createComputed<T>(fn: () => T): Computed<T> {
  let value: T;
  let dirty = true;
  const subscribers = new Set<Effect>();

  const effect = createEffect(() => {
    const nextValue = fn();
    // Only notify if value actually changed or it's the first run
    if (dirty || value !== nextValue) {
      value = nextValue;
      dirty = false;
      
      const currentSubs = Array.from(subscribers);
      if (isBatching) {
        for (const sub of currentSubs) pendingEffects.add(sub);
      } else {
        for (const sub of currentSubs) sub.run();
      }
    }
  });

  function get(): T {
    if (currentEffect) {
      subscribers.add(currentEffect);
      currentEffect.deps.add(subscribers);
    }
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