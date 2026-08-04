/**
 * Slots system - create, render, and manage slots
 */

/**
 * Slot function
 */
export type Slot = (props?: Record<string, any>) => any;

/**
 * Slot context
 */
export interface SlotContext {
  /**
   * Slot name
   */
  name: string;

  /**
   * Slot props
   */
  props?: Record<string, any>;

  /**
   * Default slot content
   */
  default?: Slot;
}

/**
 * Slots manager
 */
export interface SlotsManager {
  /**
   * Get a slot by name
   */
  get: (name: string) => Slot | undefined;

  /**
   * Set a slot
   */
  set: (name: string, slot: Slot) => void;

  /**
   * Check if a slot exists
   */
  has: (name: string) => boolean;

  /**
   * Get all slot names
   */
  names: () => string[];

  /**
   * Render a slot
   */
  render: (name: string, props?: Record<string, any>) => any;

  /**
   * Render all slots
   */
  renderAll: () => Record<string, any>;
}

/**
 * Create slots from slot content
 */
export function createSlots(slots?: Record<string, Slot>): SlotsManager {
  const slotMap = new Map<string, Slot>();

  if (slots) {
    for (const [name, slot] of Object.entries(slots)) {
      slotMap.set(name, slot);
    }
  }

  // Add default slot
  if (!slotMap.has('default') && slots?.default) {
    slotMap.set('default', slots.default);
  }

  return {
    get(name: string): Slot | undefined {
      return slotMap.get(name);
    },

    set(name: string, slot: Slot): void {
      slotMap.set(name, slot);
    },

    has(name: string): boolean {
      return slotMap.has(name);
    },

    names(): string[] {
      return Array.from(slotMap.keys());
    },

    render(name: string, props?: Record<string, any>): any {
      const slot = slotMap.get(name);
      if (slot) {
        return slot(props);
      }
      return null;
    },

    renderAll(): Record<string, any> {
      const result: Record<string, any> = {};
      for (const [name, slot] of slotMap) {
        result[name] = slot();
      }
      return result;
    }
  };
}

/**
 * Render a slot
 */
export function renderSlot(
  slots: SlotsManager,
  name: string,
  props?: Record<string, any>
): any {
  return slots.render(name, props);
}

/**
 * Render multiple slots
 */
export function renderSlots(
  slots: SlotsManager,
  names: string[]
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const name of names) {
    result[name] = slots.render(name);
  }
  return result;
}

/**
 * Create a slot from content
 */
export function createSlot(
  content: any,
  props?: Record<string, any>
): Slot {
  return (slotProps?: Record<string, any>) => {
    const mergedProps = { ...props, ...slotProps };
    return typeof content === 'function' 
      ? content(mergedProps) 
      : content;
  };
}

/**
 * Merge slots
 */
export function mergeSlots(
  ...slotManagers: (SlotsManager | Record<string, Slot>)[]
): SlotsManager {
  const merged = new Map<string, Slot>();

  for (const item of slotManagers) {
    if ('get' in item && 'set' in item) {
      // It's a SlotsManager
      for (const name of item.names()) {
        const slot = item.get(name);
        if (slot) {
          merged.set(name, slot);
        }
      }
    } else {
      // It's a Record<string, Slot>
      for (const [name, slot] of Object.entries(item)) {
        merged.set(name, slot);
      }
    }
  }

  return createSlots(Object.fromEntries(merged));
}