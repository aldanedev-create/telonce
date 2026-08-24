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
  /**
   * Stops the computed's internal effect from tracking/recomputing
   * further. Previously there was no way to dispose a computed value at
   * all - its internal effect (and the subscriptions it holds on
   * whatever signals the computed function reads) lived forever, even if
   * nothing was reading the computed anymore. A second, unused
   * createComputed implementation in ./computed.ts already had a
   * disposal mechanism internally (computationEffect.stop()) but never
   * actually exposed it on the returned computed function either - and
   * that implementation isn't the one wired up to this package's public
   * exports in any case (see index.ts, which imports createComputed from
   * this file, not ./computed.ts).
   */
  stop: () => void;
};

export type Memo<T> = {
  (): T;
  peek: () => T;
};

// --- Internal State & Global Synchronization ---

const globalContext = globalThis as unknown as {
  __currentEffect?: Effect | null;
};

if (globalContext.__currentEffect === undefined) {
  globalContext.__currentEffect = null;
}

export let currentEffect: Effect | null = globalContext.__currentEffect ?? null;

export function getCurrentEffect(): Effect | null {
  return globalContext.__currentEffect ?? null;
}

export function setCurrentEffect(effect: Effect | null): void {
  globalContext.__currentEffect = effect;
  currentEffect = effect;
}

const pendingEffects: Set<Effect> = new Set();
let isBatching = false;

// --- Signal Implementation ---

export function createSignal<T>(initial: T): Signal<T> {
  let value = initial;
  const subscribers = new Set<Effect>();

  function get(): T {
    const activeEffect = getCurrentEffect();
    if (activeEffect) {
      subscribers.add(activeEffect);
      activeEffect.deps.add(subscribers);
    }
    return value;
  }

  function set(newValue: T | ((prev: T) => T)): void {
    const nextValue = typeof newValue === 'function' 
      ? (newValue as (prev: T) => T)(value) 
      : newValue;
    
    // Use Object.is to prevent redundant notifications when updating NaN to NaN
    if (!Object.is(value, nextValue)) {
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
  let active = true;

  const effect: Effect = {
    deps: new Set(),
    run() {
      if (!active) return;
      
      // Clean up stale dependencies before running
      for (const dep of this.deps) {
        dep.delete(this);
      }
      this.deps.clear();
      
      const prev = getCurrentEffect();
      setCurrentEffect(this);
      try {
        fn();
      } finally {
        setCurrentEffect(prev); // Restore previous effect to support nested effects & computed properties
      }
    },
    stop() {
      if (active) {
        active = false;
        for (const dep of this.deps) {
          dep.delete(this);
        }
        this.deps.clear();
      }
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
    // Only notify if value actually changed or it's the first run (using Object.is for NaN safety)
    if (dirty || !Object.is(value, nextValue)) {
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
    const activeEffect = getCurrentEffect();
    if (activeEffect) {
      subscribers.add(activeEffect);
      activeEffect.deps.add(subscribers);
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
  computed.stop = () => effect.stop();

  return computed;
}

// --- Memo Implementation ---

export function createMemo<T>(fn: () => T): Memo<T> {
  return createComputed(fn);
}

// --- Batch Updates ---

// A simple boolean flag broke for nested/reentrant batch() calls: the
// inner call's own `finally` block set isBatching back to false and
// flushed pending effects immediately, even though the outer batch() call
// was still in progress and had more updates queued after the inner
// batch. That caused effects to run an extra time, observing an
// incorrect intermediate state (confirmed via nested batch() calls
// running dependent effects 3 times instead of 2, with a spurious
// mid-batch run visible in between). A nesting counter, only actually
// flushing when it returns to zero (the outermost batch() call
// completing), fixes this while still behaving identically for the
// common non-nested case.
let batchDepth = 0;

export function batch(fn: () => void): void {
  batchDepth++;
  isBatching = true;
  try {
    fn();
  } finally {
    batchDepth--;
    if (batchDepth === 0) {
      isBatching = false;
      flushPending();
    }
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
  const prev = getCurrentEffect();
  setCurrentEffect(null);
  try {
    return fn();
  } finally {
    setCurrentEffect(prev);
  }
}