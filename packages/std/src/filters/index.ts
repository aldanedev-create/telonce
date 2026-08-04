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
export function capitalize(value: string): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/**
 * Uppercase a string
 */
export function uppercase(value: string): string {
  return value?.toUpperCase() || '';
}

/**
 * Lowercase a string
 */
export function lowercase(value: string): string {
  return value?.toLowerCase() || '';
}

/**
 * Trim whitespace from a string
 */
export function trim(value: string): string {
  return value?.trim() || '';
}

/**
 * Truncate a string to a specified length
 */
export function truncate(value: string, length: number = 30, suffix: string = '...'): string {
  if (!value) return '';
  if (value.length <= length) return value;
  return value.slice(0, length) + suffix;
}

/**
 * Convert to slug (URL-friendly)
 */
export function slugify(value: string): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Convert to kebab-case
 */
export function kebabCase(value: string): string {
  if (!value) return '';
  return value
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert to camelCase
 */
export function camelCase(value: string): string {
  if (!value) return '';
  return value
    .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
    .replace(/^[A-Z]/, c => c.toLowerCase());
}

/**
 * Convert to snake_case
 */
export function snakeCase(value: string): string {
  if (!value) return '';
  return value
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

/**
 * Convert to Start Case
 */
export function startCase(value: string): string {
  if (!value) return '';
  return value
    .replace(/[-_\s]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Escape HTML characters
 */
export function escape(value: string): string {
  if (!value) return '';
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return value.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Unescape HTML characters
 */
export function unescape(value: string): string {
  if (!value) return '';
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
  };
  return value.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, m => map[m]);
}

// --- Number Filters ---

/**
 * Format as currency
 */
export function currency(value: number, symbol: string = '$', decimals: number = 2): string {
  if (value === undefined || value === null) return '';
  return `${symbol}${value.toFixed(decimals)}`;
}

/**
 * Format as percentage
 */
export function percent(value: number, decimals: number = 0): string {
  if (value === undefined || value === null) return '';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format as number with commas
 */
export function number(value: number): string {
  if (value === undefined || value === null) return '';
  return value.toLocaleString();
}

/**
 * Format to decimal places
 */
export function decimal(value: number, places: number = 2): string {
  if (value === undefined || value === null) return '';
  return value.toFixed(places);
}

/**
 * Round a number
 */
export function round(value: number): number {
  return Math.round(value);
}

/**
 * Floor a number
 */
export function floor(value: number): number {
  return Math.floor(value);
}

/**
 * Ceil a number
 */
export function ceil(value: number): number {
  return Math.ceil(value);
}

/**
 * Absolute value
 */
export function abs(value: number): number {
  return Math.abs(value);
}

// --- Date Filters ---

/**
 * Format a date
 */
export function dateFormat(value: Date | string, format: string = 'YYYY-MM-DD'): string {
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
export function timeAgo(value: Date | string): string {
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
export function relativeTime(value: Date | string): string {
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
export function join<T>(value: T[], separator: string = ', '): string {
  return value?.join(separator) || '';
}

/**
 * Get first element of array
 */
export function first<T>(value: T[]): T | undefined {
  return value?.[0];
}

/**
 * Get last element of array
 */
export function last<T>(value: T[]): T | undefined {
  return value?.[value.length - 1];
}

/**
 * Pluck a property from array of objects
 */
export function pluck<T, K extends keyof T>(value: T[], key: K): T[K][] {
  return value?.map(item => item[key]) || [];
}

/**
 * Filter array by condition
 */
export function where<T>(value: T[], key: keyof T, operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in', compare: any): T[] {
  if (!value) return [];
  
  return value.filter(item => {
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
export function orderBy<T>(value: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  if (!value) return [];
  
  return [...value].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Group array by property
 */
export function groupBy<T>(value: T[], key: keyof T): Record<string, T[]> {
  if (!value) return {};
  
  const result: Record<string, T[]> = {};
  for (const item of value) {
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
  return Object.keys(value || {});
}

/**
 * Get values of object
 */
export function values<T extends Record<string, any>>(value: T): any[] {
  return Object.values(value || {});
}

/**
 * Get entries of object
 */
export function entries<T extends Record<string, any>>(value: T): [string, any][] {
  return Object.entries(value || {});
}

/**
 * Pick specific properties from object
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  value: T,
  ...keys: K[]
): Pick<T, K> {
  if (!value) return {} as Pick<T, K>;
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
  if (!value) return {} as Omit<T, K>;
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
registerFilter('join', join);
registerFilter('first', first);
registerFilter('last', last);
registerFilter('pluck', pluck);
registerFilter('where', where);
registerFilter('orderBy', orderBy);
registerFilter('groupBy', groupBy);
registerFilter('keys', keys);
registerFilter('values', values);
registerFilter('entries', entries);
registerFilter('pick', pick);
registerFilter('omit', omit);
registerFilter('size', size);