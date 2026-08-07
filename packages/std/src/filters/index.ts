/**
 * Filters - template filters for transforming data in templates
 * 
 * Usage in templates:
 * {{ value | filterName }}
 * {{ value | filterName:arg1:arg2 }}
 */

/**
 * Filter function type
 */
export type Filter<T = any, R = any> = (value: T, ...args: any[]) => R;

/**
 * Filter map
 */
export type FilterMap = Record<string, Filter>;

/**
 * Global filter registry
 */
const filterRegistry = new Map<string, Filter>();

/**
 * Register a filter
 */
export function registerFilter(name: string, filter: Filter): void {
  filterRegistry.set(name, filter);
}

/**
 * Get a filter by name
 */
export function getFilter(name: string): Filter | undefined {
  return filterRegistry.get(name);
}

/**
 * Check if a filter exists
 */
export function hasFilter(name: string): boolean {
  return filterRegistry.has(name);
}

/**
 * Create a custom filter
 */
export function createFilter<T = any, R = any>(
  fn: (value: T, ...args: any[]) => R
): Filter<T, R> {
  return fn;
}

// --- String Filters ---

/**
 * Capitalize first letter of a string
 */
export function capitalize(value: any): string {
  const str = String(value ?? '');
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Uppercase a string
 */
export function uppercase(value: any): string {
  return String(value ?? '').toUpperCase();
}

/**
 * Lowercase a string
 */
export function lowercase(value: any): string {
  return String(value ?? '').toLowerCase();
}

/**
 * Trim whitespace from a string
 */
export function trim(value: any): string {
  return String(value ?? '').trim();
}

/**
 * Truncate a string to a specified length
 */
export function truncate(value: any, length: number = 30, suffix: string = '...'): string {
  const str = String(value ?? '');
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length) + suffix;
}

/**
 * Convert to slug (URL-friendly)
 */
export function slugify(value: any): string {
  const str = String(value ?? '');
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Convert to kebab-case
 */
export function kebabCase(value: any): string {
  const str = String(value ?? '');
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert to camelCase
 */
export function camelCase(value: any): string {
  const str = String(value ?? '');
  if (!str) return '';
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
    .replace(/^[A-Z]/, c => c.toLowerCase());
}

/**
 * Convert to snake_case
 */
export function snakeCase(value: any): string {
  const str = String(value ?? '');
  if (!str) return '';
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Convert to Start Case
 */
export function startCase(value: any): string {
  const str = String(value ?? '');
  if (!str) return '';
  return str
    .replace(/[-_\s]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Escape HTML characters
 */
export function escape(value: any): string {
  const str = String(value ?? '');
  if (!str) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Unescape HTML characters
 */
export function unescape(value: any): string {
  const str = String(value ?? '');
  if (!str) return '';
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
  };
  return str.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, m => map[m]);
}

// --- Number Filters ---

/**
 * Format as currency
 */
export function currency(value: any, symbol: string = '$', decimals: number = 2): string {
  const num = Number(value);
  if (value === undefined || value === null || isNaN(num)) return '';
  return `${symbol}${num.toFixed(decimals)}`;
}

/**
 * Format as percentage
 */
export function percent(value: any, decimals: number = 0): string {
  const num = Number(value);
  if (value === undefined || value === null || isNaN(num)) return '';
  return `${(num * 100).toFixed(decimals)}%`;
}

/**
 * Format as number with commas
 */
export function number(value: any): string {
  const num = Number(value);
  if (value === undefined || value === null || isNaN(num)) return '';
  return num.toLocaleString();
}

/**
 * Format to decimal places
 */
export function decimal(value: any, places: number = 2): string {
  const num = Number(value);
  if (value === undefined || value === null || isNaN(num)) return '';
  return num.toFixed(places);
}

/**
 * Round a number
 */
export function round(value: any): number {
  const num = Number(value);
  return isNaN(num) ? 0 : Math.round(num);
}

/**
 * Floor a number
 */
export function floor(value: any): number {
  const num = Number(value);
  return isNaN(num) ? 0 : Math.floor(num);
}

/**
 * Ceil a number
 */
export function ceil(value: any): number {
  const num = Number(value);
  return isNaN(num) ? 0 : Math.ceil(num);
}

/**
 * Absolute value
 */
export function abs(value: any): number {
  const num = Number(value);
  return isNaN(num) ? 0 : Math.abs(num);
}

// --- Date Filters ---

/**
 * Format a date
 */
export function dateFormat(value: Date | string | number, format: string = 'YYYY-MM-DD'): string {
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * Time ago from now
 */
export function timeAgo(value: Date | string | number): string {
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}

/**
 * Parse date from ISO string
 */
export function dateFromISO(value: string): Date | null {
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Relative time (past or future)
 */
export function relativeTime(value: Date | string | number): string {
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const isFuture = diff < 0;
  const absDiff = Math.abs(diff);
  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let result = '';
  if (seconds < 60) result = 'just now';
  else if (minutes < 60) result = `${minutes}m`;
  else if (hours < 24) result = `${hours}h`;
  else if (days < 30) result = `${days}d`;
  else if (months < 12) result = `${months}mo`;
  else result = `${years}y`;

  return isFuture ? `in ${result}` : `${result} ago`;
}

// --- Array Filters ---

/**
 * Join array elements with a separator
 */
export function join<T>(value: T[] | any, separator: string = ', '): string {
  if (!Array.isArray(value)) return String(value ?? '');
  return value.join(separator);
}

/**
 * Get first element of array
 */
export function first<T>(value: T[] | any): T | undefined {
  return Array.isArray(value) ? value[0] : undefined;
}

/**
 * Get last element of array
 */
export function last<T>(value: T[] | any): T | undefined {
  return Array.isArray(value) ? value[value.length - 1] : undefined;
}

/**
 * Pluck a property from array of objects
 */
export function pluck<T, K extends keyof T>(value: T[] | any, key: K): T[K][] {
  if (!Array.isArray(value)) return [];
  return value.map(item => item?.[key]);
}

/**
 * Filter array by condition
 */
export function where<T>(value: T[] | any, key: keyof T, operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in', compare: any): T[] {
  if (!Array.isArray(value)) return [];
  
  return value.filter(item => {
    if (!item) return false;
    const val = item[key];
    switch (operator) {
      case 'eq': return val === compare;
      case 'neq': return val !== compare;
      case 'gt': return val > compare;
      case 'gte': return val >= compare;
      case 'lt': return val < compare;
      case 'lte': return val <= compare;
      case 'in': return Array.isArray(compare) && compare.includes(val);
      default: return true;
    }
  });
}

/**
 * Order array by property
 */
export function orderBy<T>(value: T[] | any, key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  if (!Array.isArray(value)) return [];
  
  return [...value].sort((a, b) => {
    const aVal = a?.[key];
    const bVal = b?.[key];
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Group array by property
 */
export function groupBy<T>(value: T[] | any, key: keyof T): Record<string, T[]> {
  if (!Array.isArray(value)) return {};
  
  const result: Record<string, T[]> = {};
  for (const item of value) {
    if (!item) continue;
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
  }
  return result;
}

// --- Object Filters ---

/**
 * Get keys of object
 */
export function keys<T extends Record<string, any>>(value: T): string[] {
  if (!value || typeof value !== 'object') return [];
  return Object.keys(value);
}

/**
 * Get values of object
 */
export function values<T extends Record<string, any>>(value: T): any[] {
  if (!value || typeof value !== 'object') return [];
  return Object.values(value);
}

/**
 * Get entries of object
 */
export function entries<T extends Record<string, any>>(value: T): [string, any][] {
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value);
}

/**
 * Pick specific properties from object
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  value: T,
  ...keys: K[]
): Pick<T, K> {
  if (!value || typeof value !== 'object') return {} as Pick<T, K>;
  const result: any = {};
  for (const key of keys) {
    if (key in value) {
      result[key] = value[key];
    }
  }
  return result;
}

/**
 * Omit specific properties from object
 */
export function omit<T extends Record<string, any>, K extends keyof T>(
  value: T,
  ...keys: K[]
): Omit<T, K> {
  if (!value || typeof value !== 'object') return {} as Omit<T, K>;
  const result: any = { ...value };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * Get size of object or array
 */
export function size(value: any): number {
  if (Array.isArray(value)) return value.length;
  if (typeof value === 'object' && value !== null) return Object.keys(value).length;
  return 0;
}
// Register all built-in filters
registerFilter('capitalize', capitalize);
registerFilter('uppercase', uppercase);
registerFilter('lowercase', lowercase);
registerFilter('trim', trim);
registerFilter('truncate', truncate);
registerFilter('slugify', slugify);
registerFilter('kebabCase', kebabCase);
registerFilter('camelCase', camelCase);
registerFilter('snakeCase', snakeCase);
registerFilter('startCase', startCase);
registerFilter('escape', escape);
registerFilter('unescape', unescape);
registerFilter('currency', currency);
registerFilter('percent', percent);
registerFilter('number', number);
registerFilter('decimal', decimal);
registerFilter('round', round);
registerFilter('floor', floor);
registerFilter('ceil', ceil);
registerFilter('abs', abs);
registerFilter('dateFormat', dateFormat);
registerFilter('timeAgo', timeAgo);
registerFilter('dateFromISO', dateFromISO);
registerFilter('relativeTime', relativeTime);
registerFilter('join', join as Filter);
registerFilter('first', first as Filter);
registerFilter('last', last as Filter);
registerFilter('pluck', pluck as Filter);
registerFilter('where', where as Filter);
registerFilter('orderBy', orderBy as Filter);
registerFilter('groupBy', groupBy as Filter);
registerFilter('keys', keys);
registerFilter('values', values);
registerFilter('entries', entries);
registerFilter('pick', pick);
registerFilter('omit', omit);
registerFilter('size', size);